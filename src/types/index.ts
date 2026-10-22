export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
export type Gender = 'male' | 'female' | 'neutral'
export type TimeUnit = 'short' | 'normal' | 'long' | 'major' | 'multi_day'
export type AccommodationId = 'on_campus' | 'oba_akere' | 'obanla'

export type ConsequenceType =
  | 'stat_change' | 'money_change' | 'flag_set' | 'flag_clear'
  | 'milestone_complete' | 'event_trigger'

export interface Consequence {
  type: ConsequenceType
  stat?: 'energy' | 'hunger' | 'social' | 'stress' | 'reputation'
  amount?: number
  flag?: string
  milestone?: string
  eventId?: string
}

export interface Appearance {
  gender: Gender
  skinTone: number
  hairstyleId: string
  hairColor: string
}

export interface Wardrobe {
  ownedItemIds: string[]
  equippedTopId: string | null
  equippedBottomId: string | null
  equippedShoesId: string | null
}

export interface PlayerStats {
  energy: number
  hunger: number
  social: number
  stress: number
  reputation: number
}

export interface PlayerState {
  name: string
  departmentId: string
  accommodationId: AccommodationId
  appearance: Appearance
  wardrobe: Wardrobe
  money: number
  stats: PlayerStats
}

export interface ActionEffects {
  energy?: number
  hunger?: number
  social?: number
  stress?: number
  reputation?: number
  money?: number
}

export interface Action {
  id: string
  locationId: string
  label: string
  description: string
  timeCost: TimeUnit
  effects: ActionEffects
  requires?: { minMoney?: number; flag?: string }
  setsFlag?: string
}

export interface Location {
  id: string
  name: string
  category: string
  description: string
  icon: string
}

export interface EventChoice {
  text: string
  effects: Consequence[]
  requires?: { minMoney?: number; flag?: string }
}

export interface GameEvent {
  id: string
  title: string
  description: string
  category: 'futa_milestone' | 'academic' | 'financial' | 'transport' | 'social' | 'random_campus'
  locationId?: string
  semesterIndices?: number[]
  isMilestone: boolean
  choices: EventChoice[]
}

export interface Course {
  id: string
  code: string
  title: string
  units: number
  type?: 'standard' | 'practical' | 'industrial' | 'project'
  hasLifeEventComponent?: boolean
  lifeEventIds?: string[]
}

export interface CoursePerformance {
  courseId: string
  attendance: number
  assignments: number
  ca: number
  study: number
  exam: number
  totalScore: number
  grade: Grade
  gradePoint: number
  completed: boolean
}

export interface AcademicRecord {
  semesterIndex: number
  courseIds: string[]
  performances: CoursePerformance[]
  gpa: number
}

export interface SemesterConfig {
  index: number
  level: number
  semesterNumber: 1 | 2
  label: string
  weeks: number
  requiredMilestones: string[]
  eventIds: string[]
}

export interface Department {
  id: string
  name: string
  code: string
  courseIdsBySemester: string[][]
}

export interface GameConfig {
  startingMoney: number
  allowanceAmount: number
  allowanceIntervalWeeks: number
  onCampusCost: number
  offCampusCost: number
  lowFundsThreshold: number
  maxSemesterUnits: number
  minAttendancePercent: number
  slotsPerWeek: number
  weeksPerSemester: number
  startingStats: PlayerStats
}

export interface GameState {
  version: number
  player: PlayerState | null
  currentSemesterIndex: number
  currentLocationId: string
  weekProgress: number
  academicRecords: AcademicRecord[]
  milestones: Record<string, boolean>
  flags: Record<string, boolean>
  completedEvents: string[]
  activeEventId: string | null
  lastSavedAt: string
  graduated: boolean
}

export type GraduationOutcome =
  | 'academic_weapon' | 'techie' | 'entrepreneur' | 'hustler'
  | 'campus_celebrity' | 'social_butterfly' | 'balanced' | 'somehow_graduated'