import { useEffect, useState } from 'react'
import type { UiGoal } from '../goalTypes'
import { calculateCardBoxStats, countedDeckCards, readExcludedCardIds, readLockedCardIds } from '../components/srs/cardBox'
import { getSrsFilterTags } from '../utils/srsTags'
import { waitForSrsPracticeWrites } from '../utils/srsPracticeSync'

type VocabCard = {
  id: string
  tags?: string[]
}

type VocabData = {
  cards: VocabCard[]
}

type SrsReviewState = {
  interval?: unknown
  nextReview?: number | string
  verifiedRecall?: unknown
}

/** Practice counts describe the box (#85); `total` and the verified counts describe the deck goal. */
export type FlashcardSetStatus = {
  total: number
  /** Released cards that have not passed Verified Recall. */
  box: number
  due: number
  /** Cards that follow once their understanding goals are passed. */
  locked: number
  verifiedPassed: number
  verifiedPending: number
  verificationEligible: number
  verificationBlockedToday: number
}

type ClientStateSnapshot = {
  updatedAt?: string
  srsState?: Record<string, SrsReviewState>
  lockedCardIds?: string[]
  excludedCardIds?: string[]
}

const resolveSource = (goal: UiGoal, language: 'de' | 'en') => {
  const extendedData = goal.extendedData as {
    vocabularySource?: string
    vocabularySourceEn?: string
  } | undefined
  const sourceDe = typeof extendedData?.vocabularySource === 'string'
    ? extendedData.vocabularySource
    : undefined
  const sourceEn = typeof extendedData?.vocabularySourceEn === 'string'
    ? extendedData.vocabularySourceEn
    : undefined
  return language === 'en' ? (sourceEn ?? sourceDe) : (sourceDe ?? sourceEn)
}

export function useFlashcardSetStatus(
  goal: UiGoal | null | undefined,
  skillpilotId: string,
  reloadSignal = 0,
  language: 'de' | 'en' = 'de',
  resolveDeckSource?: (goal: UiGoal, language: 'de' | 'en') => string | undefined,
) {
  const [status, setStatus] = useState<FlashcardSetStatus | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!goal || !skillpilotId || !goal.tags?.some((tag) => tag.startsWith('srs-deck'))) {
        setStatus(null)
        return
      }

      const source = resolveDeckSource?.(goal, language)
        ?? (resolveDeckSource ? undefined : resolveSource(goal, language))
      if (!source) {
        setStatus(null)
        return
      }

      try {
        const deckResponse = await fetch(source, { cache: 'no-store' })
        if (!deckResponse.ok) {
          if (!cancelled) setStatus(null)
          return
        }
        const deck = await deckResponse.json() as VocabData
        if (!Array.isArray(deck.cards)) {
          if (!cancelled) setStatus(null)
          return
        }

        let cards = deck.cards
        const filterTags = getSrsFilterTags(goal.tags)
        if (filterTags.length > 0) {
          cards = cards.filter((card) => card.tags?.some((tag) => filterTags.includes(tag)))
        }

        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const syncUrl = apiBase
          ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${goal.id}`
          : `/api/ui/learners/${skillpilotId}/client-state/${goal.id}`
        await waitForSrsPracticeWrites(skillpilotId, goal.id)
        if (cancelled) return
        const stateResponse = await fetch(syncUrl, { cache: 'no-store' })
        if (!stateResponse.ok) {
          if (!cancelled) setStatus(null)
          return
        }
        const snapshot = await stateResponse.json() as ClientStateSnapshot
        if (!snapshot.srsState) {
          if (!cancelled) setStatus(null)
          return
        }
        const stats = calculateCardBoxStats(countedDeckCards(cards, readExcludedCardIds(snapshot)), snapshot.srsState, readLockedCardIds(snapshot))

        if (!cancelled) {
          setStatus({
            total: stats.total,
            box: stats.box,
            due: stats.due,
            locked: stats.locked,
            verifiedPassed: stats.verifiedPassed,
            verifiedPending: stats.verifiedPending,
            verificationEligible: stats.verifiedEligible,
            verificationBlockedToday: stats.verifiedBlockedToday,
          })
        }
      } catch {
        if (!cancelled) setStatus(null)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [goal, language, reloadSignal, resolveDeckSource, skillpilotId])

  return status
}
