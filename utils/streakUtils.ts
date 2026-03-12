export const qualifiesForStreak = (
  problemsSolved: number,
  practiceTime: number
): boolean => {

  return problemsSolved >= 1 || practiceTime >= 180
}