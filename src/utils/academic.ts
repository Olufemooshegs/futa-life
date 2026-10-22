import type { Course, CoursePerformance, AcademicRecord, Grade } from '~/types'

export function getGrade(score: number): { letter: Grade; point: number } {
  if (score >= 70) return { letter: 'A', point: 5 }
  if (score >= 60) return { letter: 'B', point: 4 }
  if (score >= 50) return { letter: 'C', point: 3 }
  if (score >= 45) return { letter: 'D', point: 2 }
  if (score >= 40) return { letter: 'E', point: 1 }
  return { letter: 'F', point: 0 }
}

export function resolveCoursePerformance(courseId: string, attendance = 75, assignments = 70, ca = 60, study = 50, exam = 60): CoursePerformance {
  const total = Math.round(exam * 0.6 + ca * 0.15 + assignments * 0.1 + attendance * 0.1 + study * 0.05)
  const { letter, point } = getGrade(total)
  return { courseId, attendance, assignments, ca, study, exam, totalScore: total, grade: letter, gradePoint: point, completed: true }
}

export function calculateGPA(performances: CoursePerformance[], courses: Course[]): number {
  let totalPoints = 0, totalUnits = 0
  for (const p of performances) {
    const c = courses.find(x => x.id === p.courseId)
    if (!c) continue
    totalPoints += p.gradePoint * c.units
    totalUnits += c.units
  }
  return totalUnits === 0 ? 0 : Math.round((totalPoints / totalUnits) * 100) / 100
}

export function calculateCGPA(records: AcademicRecord[]): number {
  let points = 0, units = 0
  for (const r of records) {
    for (const p of r.performances) {
      points += p.gradePoint * 3
      units += 3
    }
  }
  return units === 0 ? 0 : Math.round((points / units) * 100) / 100
}

export function getStanding(cgpa: number): 'good' | 'warning' | 'probation' {
  if (cgpa >= 2.5) return 'good'
  if (cgpa >= 1.5) return 'warning'
  return 'probation'
}