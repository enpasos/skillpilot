export function levelLabel(level: number) {
  if (level === 1) return 'Anforderungsbereich I'
  if (level === 2) return 'Anforderungsbereich II'
  if (level === 3) return 'Anforderungsbereich III'
  return `Level ${level}`
}

export function masteryColorClass(value: number): string {
  const v = Math.max(0, Math.min(1, value))
  if (v >= 0.75) return 'bg-mastery-high'
  if (v >= 0.4) return 'bg-mastery-medium'
  if (v > 0) return 'bg-mastery-low'
  return 'bg-mastery-none'
}
