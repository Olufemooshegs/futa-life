import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GameState, PlayerState, Appearance, AccommodationId,
  Action, GameEvent, Course, CoursePerformance, AcademicRecord,
  Consequence, TimeUnit, GraduationOutcome,
} from '~/types'
import gameConfig from '~/data/gameConfig.json'
import coursesData from '~/data/courses.json'
import actionsData from '~/data/actions.json'
import eventsData from '~/data/events.json'
import departmentsData from '~/data/departments.json'
import levelConfigData from '~/data/levelConfig.json'
import { calculateGPA, calculateCGPA, resolveCoursePerformance, getStanding } from '~/utils/academic'

const TIME_COST_SLOTS: Record<TimeUnit, number> = { short: 1, normal: 2, long: 4, major: 6, multi_day: 10 }
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

const COURSES = coursesData as Course[]
const ACTIONS = actionsData as Action[]
const EVENTS = eventsData as GameEvent[]
const DEPARTMENTS = departmentsData as { id: string; courseIdsBySemester: string[][] }[]
const LEVELS = levelConfigData as { index: number; weeks: number; requiredMilestones: string[]; eventIds: string[] }[]

interface Store extends GameState {
  createPlayer: (input: { name: string; departmentId: string; accommodationId: AccommodationId; appearance: Appearance }) => void
  moveTo: (locationId: string) => void
  performAction: (actionId: string) => void
  resolveEvent: (choiceIndex: number) => void
  skipSemester: () => void
  resetGame: () => void
  getAvailableActions: () => Action[]
  getCurrentEvent: () => GameEvent | null
  getCurrentCourses: () => Course[]
  getCurrentRecord: () => AcademicRecord | null
  getCurrentGPA: () => number
  getCGPA: () => number
  getOutcome: () => GraduationOutcome
}

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      version: 1,
      player: null,
      currentSemesterIndex: 0,
      currentLocationId: 'hostel',
      weekProgress: 0,
      academicRecords: [],
      milestones: {},
      flags: {},
      completedEvents: [],
      activeEventId: null,
      lastSavedAt: new Date().toISOString(),
      graduated: false,

      createPlayer: ({ name, departmentId, accommodationId, appearance }) => {
        const cost = accommodationId === 'on_campus' ? gameConfig.onCampusCost : gameConfig.offCampusCost
        const player: PlayerState = {
          name,
          departmentId,
          accommodationId,
          appearance,
          wardrobe: { ownedItemIds: [], equippedTopId: null, equippedBottomId: null, equippedShoesId: null },
          money: Math.max(0, gameConfig.startingMoney - cost),
          stats: { ...gameConfig.startingStats },
        }
        const dept = DEPARTMENTS.find(d => d.id === departmentId)!
        const courseIds = dept.courseIdsBySemester[0]
        const record: AcademicRecord = {
          semesterIndex: 0,
          courseIds,
          performances: courseIds.map(id => resolveCoursePerformance(id)),
          gpa: 0,
        }
        record.gpa = calculateGPA(record.performances, COURSES)
        set({
          player,
          currentSemesterIndex: 0,
          currentLocationId: 'hostel',
          weekProgress: 0,
          academicRecords: [record],
          milestones: {},
          flags: {},
          completedEvents: [],
          activeEventId: 'matriculation_ceremony',
          graduated: false,
        })
      },

      moveTo: (locationId) => set({ currentLocationId: locationId }),

      performAction: (actionId) => {
        const state = get()
        if (!state.player) return
        const action = ACTIONS.find(a => a.id === actionId)
        if (!action) return
        if (action.requires?.minMoney !== undefined && state.player.money < action.requires.minMoney) return

        const eff = action.effects
        const newPlayer: PlayerState = {
          ...state.player,
          money: Math.max(0, state.player.money + (eff.money ?? 0)),
          stats: {
            energy: clamp(state.player.stats.energy + (eff.energy ?? 0)),
            hunger: clamp(state.player.stats.hunger + (eff.hunger ?? 0)),
            social: clamp(state.player.stats.social + (eff.social ?? 0)),
            stress: clamp(state.player.stats.stress + (eff.stress ?? 0)),
            reputation: clamp(state.player.stats.reputation + (eff.reputation ?? 0)),
          },
        }

        const newFlags = action.setsFlag ? { ...state.flags, [action.setsFlag]: true } : state.flags
        let weekProgress = state.weekProgress + TIME_COST_SLOTS[action.timeCost]
        let semesterIndex = state.currentSemesterIndex
        let academicRecords = state.academicRecords
        let graduated = state.graduated

        while (weekProgress >= gameConfig.slotsPerWeek) {
          weekProgress -= gameConfig.slotsPerWeek
          const level = LEVELS[semesterIndex]
          if (!level) break
          // weeks accumulate; trigger semester advance after enough weeks
          if (Math.floor(state.weekProgress / gameConfig.slotsPerWeek) + 1 >= level.weeks * gameConfig.slotsPerWeek) {
            semesterIndex++
            if (semesterIndex >= LEVELS.length) {
              semesterIndex = LEVELS.length - 1
              graduated = true
              break
            }
            const dept = DEPARTMENTS.find(d => d.id === newPlayer.departmentId)!
            const courseIds = dept.courseIdsBySemester[semesterIndex] ?? []
            const record: AcademicRecord = {
              semesterIndex,
              courseIds,
              performances: courseIds.map(id => resolveCoursePerformance(id)),
              gpa: 0,
            }
            record.gpa = calculateGPA(record.performances, COURSES)
            academicRecords = [...academicRecords, record]
          }
        }

        // Random event check (30% chance per action)
        let activeEventId: string | null = state.activeEventId
        if (!activeEventId && Math.random() < 0.3) {
          const pool = EVENTS.filter(e => !e.isMilestone && e.locationId === state.currentLocationId && !state.completedEvents.includes(e.id))
          if (pool.length > 0) activeEventId = pool[Math.floor(Math.random() * pool.length)].id
        }

        // Forced milestone events on semester start
        const level = LEVELS[semesterIndex]
        if (level) {
          for (const evId of level.eventIds) {
            if (!state.completedEvents.includes(evId)) {
              activeEventId = evId
              break
            }
          }
        }

        set({
          player: newPlayer,
          weekProgress,
          currentSemesterIndex: semesterIndex,
          academicRecords,
          flags: newFlags,
          activeEventId,
          graduated,
          lastSavedAt: new Date().toISOString(),
        })
      },

      resolveEvent: (choiceIndex) => {
        const state = get()
        const event = EVENTS.find(e => e.id === state.activeEventId)
        if (!event || !state.player) return
        const choice = event.choices[choiceIndex]
        if (!choice) return

        let player = { ...state.player, stats: { ...state.player.stats } }
        let flags = { ...state.flags }
        let milestones = { ...state.milestones }

        for (const c of choice.effects) {
          if (c.type === 'stat_change' && c.stat && c.amount !== undefined) {
            player.stats[c.stat] = clamp(player.stats[c.stat] + c.amount)
          } else if (c.type === 'money_change' && c.amount !== undefined) {
            player.money = Math.max(0, player.money + c.amount)
          } else if (c.type === 'flag_set' && c.flag) {
            flags[c.flag] = true
          } else if (c.type === 'flag_clear' && c.flag) {
            delete flags[c.flag]
          } else if (c.type === 'milestone_complete' && c.milestone) {
            milestones[c.milestone] = true
          }
        }

        set({
          player,
          flags,
          milestones,
          activeEventId: null,
          completedEvents: [...state.completedEvents, event.id],
          lastSavedAt: new Date().toISOString(),
        })
      },

      skipSemester: () => {
        const state = get()
        if (!state.player) return
        const next = state.currentSemesterIndex + 1
        if (next >= LEVELS.length) { set({ graduated: true }); return }
        const dept = DEPARTMENTS.find(d => d.id === state.player!.departmentId)!
        const courseIds = dept.courseIdsBySemester[next] ?? []
        const record: AcademicRecord = {
          semesterIndex: next,
          courseIds,
          performances: courseIds.map(id => resolveCoursePerformance(id)),
          gpa: 0,
        }
        record.gpa = calculateGPA(record.performances, COURSES)
        set({
          currentSemesterIndex: next,
          weekProgress: 0,
          academicRecords: [...state.academicRecords, record],
          lastSavedAt: new Date().toISOString(),
        })
      },

      resetGame: () => set({
        version: 1, player: null, currentSemesterIndex: 0,
        currentLocationId: 'hostel', weekProgress: 0,
        academicRecords: [], milestones: {}, flags: {},
        completedEvents: [], activeEventId: null,
        lastSavedAt: new Date().toISOString(), graduated: false,
      }),

      getAvailableActions: () => ACTIONS.filter(a => a.locationId === get().currentLocationId),
      getCurrentEvent: () => EVENTS.find(e => e.id === get().activeEventId) ?? null,
      getCurrentCourses: () => {
        const state = get()
        if (!state.player) return []
        const dept = DEPARTMENTS.find(d => d.id === state.player!.departmentId)
        const ids = dept?.courseIdsBySemester[state.currentSemesterIndex] ?? []
        return COURSES.filter(c => ids.includes(c.id))
      },
      getCurrentRecord: () => get().academicRecords.find(r => r.semesterIndex === get().currentSemesterIndex) ?? null,
      getCurrentGPA: () => get().getCurrentRecord()?.gpa ?? 0,
      getCGPA: () => calculateCGPA(get().academicRecords),

      getOutcome: () => {
        const state = get()
        const cgpa = calculateCGPA(state.academicRecords)
        const social = state.player?.stats.social ?? 0
        const stress = state.player?.stats.stress ?? 0
        if (cgpa >= 4.5) return 'academic_weapon'
        if (state.flags.entrepreneur) return 'entrepreneur'
        if (cgpa >= 3.5 && social >= 60 && stress < 60) return 'balanced'
        if (social >= 80) return 'campus_celebrity'
        if (social >= 70) return 'social_butterfly'
        if (cgpa >= 2.5) return 'somehow_graduated'
        return 'somehow_graduated'
      },
    }),
    { name: 'futa-life-save', version: 1 },
  ),
)