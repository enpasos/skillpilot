export interface PoliticsEconomicsMemoryGoal {
  id: string
  extendedData?: { vocabularySource?: unknown } | null
}

const decks = [
  {
    source: '/data/de_gymnasium_politics_economics_flashcards_democracy_law.de.json',
    displayLabel: 'Lernkarten - Demokratie, Rechtsstaat und Recht',
  },
  {
    source: '/data/de_gymnasium_politics_economics_flashcards_participation_media.de.json',
    displayLabel: 'Lernkarten - Beteiligung, Parteien und Medien',
  },
  {
    source: '/data/de_gymnasium_politics_economics_flashcards_market_social_policy.de.json',
    displayLabel: 'Lernkarten - Markt, Geld und Sozialstaat',
  },
  {
    source: '/data/de_gymnasium_politics_economics_flashcards_global_security.de.json',
    displayLabel: 'Lernkarten - Internationale Politik und Global Governance',
  },
  {
    source: '/data/de_gymnasium_politics_economics_flashcards_europe_integration.de.json',
    displayLabel: 'Lernkarten - Europäische Union und Integration',
  },
] as const

/** Resolve the existing ordered five-deck contract against current canonical IDs. */
export function resolvePoliticsEconomicsMemoryEntries(goals: readonly PoliticsEconomicsMemoryGoal[]) {
  const entries = decks.map(({ source, displayLabel }) => {
    const matches = goals.filter((goal) => goal.extendedData?.vocabularySource === source)
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one canonical Politik/Wirtschaft goal for ${source}; found ${matches.length}`)
    }
    const goalId = matches[0].id
    if (typeof goalId !== 'string' || !goalId.trim()) {
      throw new Error(`Canonical Politik/Wirtschaft goal for ${source} has no valid identity`)
    }
    return { kind: 'goalEntry' as const, goalId, displayLabel }
  })
  if (new Set(entries.map(({ goalId }) => goalId)).size !== decks.length) {
    throw new Error('Politik/Wirtschaft memory decks must resolve to five distinct canonical goals')
  }
  return entries
}
