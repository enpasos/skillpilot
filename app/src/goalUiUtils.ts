export function levelLabel(level: number) {
  if (level === 1) return 'Anforderungsbereich I'
  if (level === 2) return 'Anforderungsbereich II'
  if (level === 3) return 'Anforderungsbereich III'
  return `Level ${level}`
}

export const MASTERED_THRESHOLD = 0.9
export const COMPLETE_MASTERY_THRESHOLD = 0.999

export function clampMastery(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function isMastered(value: number): boolean {
  return value >= MASTERED_THRESHOLD
}

export function isCompleteMastery(value: number): boolean {
  return clampMastery(value) >= COMPLETE_MASTERY_THRESHOLD
}

export function masteryColorClass(value: number): string {
  const v = clampMastery(value)
  if (isCompleteMastery(v)) return 'bg-mastery-high'
  if (v > 0) return 'bg-mastery-medium'
  return 'bg-mastery-none'
}
