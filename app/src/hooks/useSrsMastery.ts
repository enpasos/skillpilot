import { useCallback, useEffect, useRef, useState } from 'react'
import type { UiGoal } from '../goalTypes'
import { getSrsFilterTags } from '../utils/srsTags'
import { waitForSrsPracticeWrites } from '../utils/srsPracticeSync'
import { calculateCardBoxStats, readLockedCardIds } from '../components/srs/cardBox'

type VocabCard = {
  id: string
  tags?: string[]
}

type VocabData = {
  deckId: string
  title: string
  cards: VocabCard[]
}

type SrsReviewState = {
  interval?: unknown
  nextReview?: number | string
  verifiedRecall?: {
    status?: string
    passedAt?: string
  }
}

type ClientStateSnapshot = {
  updatedAt?: string
  srsState?: Record<string, SrsReviewState>
  lockedCardIds?: string[]
}

type SrsMasteryMap = Record<string, number>
export type SrsDeckSourceResolver = (goal: UiGoal, language: 'de' | 'en') => string | undefined

const SRS_TAG_PREFIX = 'srs-deck'

export function useSrsMastery(
  goals: UiGoal[],
  skillpilotId: string,
  reloadSignal = 0,
  language: 'de' | 'en' = 'de',
  resolveDeckSource?: SrsDeckSourceResolver,
) {
  const [masteryByGoal, setMasteryByGoal] = useState<SrsMasteryMap>({})
  const [timerTick, setTimerTick] = useState(0)
  const deckCacheRef = useRef<Map<string, Promise<VocabData | null>>>(new Map())
  const clientStateCacheRef = useRef<Map<string, Promise<ClientStateSnapshot | null>>>(new Map())
  const timerRef = useRef<number | null>(null)
  const runRef = useRef(0)

  const loadDeck = useCallback(async (url: string) => {
    const cache = deckCacheRef.current
    if (!cache.has(url)) {
      const promise = fetch(url, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => (data && Array.isArray(data.cards) ? (data as VocabData) : null))
        .catch(() => null)
      cache.set(url, promise)
    }
    return cache.get(url) ?? null
  }, [])

  const loadClientState = useCallback(async (goalId: string) => {
    if (!skillpilotId || !goalId) return null
    await waitForSrsPracticeWrites(skillpilotId, goalId)

    const cacheKey = `${skillpilotId}:${reloadSignal}:${goalId}`
    const cache = clientStateCacheRef.current
    if (!cache.has(cacheKey)) {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase
        ? `${apiBase}/api/ui/learners/${skillpilotId}/client-state/${goalId}`
        : `/api/ui/learners/${skillpilotId}/client-state/${goalId}`
      const promise = fetch(url, { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => {
          if (!payload || typeof payload !== 'object') return null
          const snapshot = payload as ClientStateSnapshot
          return snapshot
        })
        .catch(() => null)
      cache.set(cacheKey, promise)
    }
    return cache.get(cacheKey) ?? null
  }, [reloadSignal, skillpilotId])

  const computeMastery = useCallback(async () => {
    runRef.current += 1
    const runId = runRef.current

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!skillpilotId || goals.length === 0) {
      setMasteryByGoal({})
      return
    }

    const now = Date.now()
    const results: SrsMasteryMap = {}
    let earliestNextDue = Number.POSITIVE_INFINITY

    for (const goal of goals) {
      if (runId !== runRef.current) return

      if (!goal.tags || !goal.tags.some((tag) => tag.startsWith(SRS_TAG_PREFIX))) {
        continue
      }

      const extendedData = goal.extendedData as {
        vocabularySource?: string
        vocabularySourceEn?: string
      } | undefined
      const sourceDe = typeof extendedData?.vocabularySource === 'string' ? extendedData.vocabularySource : undefined
      const sourceEn = typeof extendedData?.vocabularySourceEn === 'string' ? extendedData.vocabularySourceEn : undefined
      const source = resolveDeckSource?.(goal, language)
        ?? (resolveDeckSource ? undefined : (language === 'en' ? (sourceEn ?? sourceDe) : (sourceDe ?? sourceEn)))
      if (typeof source !== 'string' || source.length === 0) {
        continue
      }

      const deck = await loadDeck(source)
      if (runId !== runRef.current) return
      if (!deck) continue

      let cards = deck.cards
      const filterTags = getSrsFilterTags(goal.tags)
      if (filterTags.length > 0) {
        cards = cards.filter((card) =>
          card.tags && card.tags.some((tag) => filterTags.includes(tag)),
        )
      }

      const snapshot = await loadClientState(goal.id)
      if (runId !== runRef.current) return
      if (!snapshot?.srsState) continue
      // Mastery stays "every card of the deck verified"; due-ness follows the box (#85).
      const stats = calculateCardBoxStats(cards, snapshot.srsState, readLockedCardIds(snapshot), now)

      results[goal.id] = stats.total > 0 && stats.verifiedPending === 0 ? 1 : 0
      if (stats.due === 0 && stats.nextDueAt < earliestNextDue) {
        earliestNextDue = stats.nextDueAt
      }
    }

    if (runId !== runRef.current) return
    setMasteryByGoal(results)

    if (earliestNextDue < Number.POSITIVE_INFINITY) {
      const delay = Math.max(1000, earliestNextDue - Date.now() + 1000)
      timerRef.current = window.setTimeout(() => {
        setTimerTick((prev) => prev + 1)
      }, delay)
    }
  }, [goals, loadDeck, loadClientState, skillpilotId, language, resolveDeckSource])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void computeMastery()
  }, [computeMastery, reloadSignal, timerTick])

  useEffect(() => {
    clientStateCacheRef.current.clear()
  }, [reloadSignal, skillpilotId])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  return masteryByGoal
}
