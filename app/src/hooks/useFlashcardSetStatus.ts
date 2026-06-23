import { useEffect, useState } from 'react'
import type { UiGoal } from '../goalTypes'
import {
  isVerifiedRecallPassed,
  isVerifiedRecallTestedToday,
  parseReviewTimestamp,
} from '../components/srs/srsLogic'
import { getSrsFilterTags } from '../utils/srsTags'

type VocabCard = {
  id: string
  tags?: string[]
}

type VocabData = {
  cards: VocabCard[]
}

type SrsReviewState = {
  nextReview?: number | string
  verifiedRecall?: unknown
}

export type FlashcardSetStatus = {
  total: number
  due: number
  verifiedPassed: number
  verifiedPending: number
  verificationEligible: number
  verificationBlockedToday: number
}

type ClientStateSnapshot = {
  updatedAt?: string
  srsState?: Record<string, SrsReviewState>
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

const isCardDue = (state: SrsReviewState | undefined, now: number) => {
  const nextReview = parseReviewTimestamp(state?.nextReview)
  return !state || !Number.isFinite(nextReview) || nextReview <= now
}

export function useFlashcardSetStatus(
  goal: UiGoal | null | undefined,
  skillpilotId: string,
  reloadSignal = 0,
  language: 'de' | 'en' = 'de',
) {
  const [status, setStatus] = useState<FlashcardSetStatus | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!goal || !skillpilotId || !goal.tags?.some((tag) => tag.startsWith('srs-deck'))) {
        setStatus(null)
        return
      }

      const source = resolveSource(goal, language)
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

        const storageKey = `srs_state_${skillpilotId}_${goal.id}`
        const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${goal.id}`
        let srsState: Record<string, SrsReviewState> = {}
        try {
          const stored = localStorage.getItem(storageKey)
          if (stored) srsState = JSON.parse(stored)
        } catch {
          srsState = {}
        }

        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const syncUrl = apiBase
          ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${goal.id}`
          : `/api/ui/learners/${skillpilotId}/client-state/${goal.id}`
        try {
          const stateResponse = await fetch(syncUrl, { cache: 'no-store' })
          if (stateResponse.ok) {
            const snapshot = await stateResponse.json() as ClientStateSnapshot
            const serverState = snapshot?.srsState
            if (serverState && Object.keys(serverState).length > 0) {
              const serverUpdatedAt = snapshot.updatedAt ? Date.parse(snapshot.updatedAt) : 0
              const localLast = localStorage.getItem(lastSyncKey)
              const localLastAt = localLast ? Date.parse(localLast) : 0
              if (
                Object.keys(srsState).length === 0
                || !serverUpdatedAt
                || !localLastAt
                || serverUpdatedAt > localLastAt
              ) {
                srsState = serverState
                localStorage.setItem(storageKey, JSON.stringify(serverState))
                if (snapshot.updatedAt) {
                  localStorage.setItem(lastSyncKey, String(snapshot.updatedAt))
                }
              }
            }
          }
        } catch {
          // Local state is still useful when server state cannot be loaded.
        }

        const now = Date.now()
        let due = 0
        let verifiedPassed = 0
        let verificationBlockedToday = 0
        let verificationEligible = 0

        for (const card of cards) {
          const cardState = srsState[card.id]
          if (isCardDue(cardState, now)) due += 1
          if (isVerifiedRecallPassed(cardState?.verifiedRecall)) {
            verifiedPassed += 1
          } else if (isVerifiedRecallTestedToday(cardState?.verifiedRecall, now)) {
            verificationBlockedToday += 1
          } else {
            verificationEligible += 1
          }
        }

        if (!cancelled) {
          setStatus({
            total: cards.length,
            due,
            verifiedPassed,
            verifiedPending: Math.max(0, cards.length - verifiedPassed),
            verificationEligible,
            verificationBlockedToday,
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
  }, [goal, language, reloadSignal, skillpilotId])

  return status
}
