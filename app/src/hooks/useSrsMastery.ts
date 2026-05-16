import { useCallback, useEffect, useRef, useState } from 'react'
import type { UiGoal } from '../goalTypes'
import { getSrsFilterTags } from '../utils/srsTags'

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
  nextReview?: number | string
  verifiedRecall?: {
    status?: string
    passedAt?: string
  }
}

type ClientStateSnapshot = {
  updatedAt?: string
  srsState?: Record<string, SrsReviewState>
}

type SrsMasteryMap = Record<string, number>

const SRS_TAG_PREFIX = 'srs-deck'
const parseNextReview = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) return numeric
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? parsed : Number.NaN
  }
  return Number.NaN
}

const isVerifiedRecallPassed = (state: SrsReviewState | undefined): boolean => {
  const verified = state?.verifiedRecall
  return verified?.status === 'passed'
    && typeof verified.passedAt === 'string'
    && verified.passedAt.length > 0
}

export function useSrsMastery(
  goals: UiGoal[],
  skillpilotId: string,
  reloadSignal = 0,
  language: 'de' | 'en' = 'de',
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
      const sourceDe = typeof extendedData?.vocabularySource === 'string'
        ? extendedData.vocabularySource
        : undefined
      const sourceEn = typeof extendedData?.vocabularySourceEn === 'string'
        ? extendedData.vocabularySourceEn
        : undefined
      const source = language === 'en' ? (sourceEn ?? sourceDe) : (sourceDe ?? sourceEn)
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

      const storageKey = `srs_state_${skillpilotId}_${goal.id}`
      const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${goal.id}`
      let srsState: Record<string, SrsReviewState> = {}
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) srsState = JSON.parse(stored)
      } catch {
        srsState = {}
      }

      const snapshot = await loadClientState(goal.id)
      if (runId !== runRef.current) return
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
          try {
            localStorage.setItem(storageKey, JSON.stringify(serverState))
            if (snapshot?.updatedAt) {
              localStorage.setItem(lastSyncKey, String(snapshot.updatedAt))
            }
          } catch {
            // Ignore local persistence errors; mastery can still be computed from the server snapshot.
          }
        }
      }

      let dueCount = 0
      let nextDueAt = Number.POSITIVE_INFINITY
      let verifiedCount = 0

      for (const card of cards) {
        const state = srsState[card.id]
        if (isVerifiedRecallPassed(state)) {
          verifiedCount += 1
        }
        const nextReview = parseNextReview(state?.nextReview)
        if (!state || !Number.isFinite(nextReview)) {
          dueCount += 1
          continue
        }
        if (nextReview <= now) {
          dueCount += 1
          continue
        }
        if (nextReview < nextDueAt) nextDueAt = nextReview
      }

      results[goal.id] = cards.length > 0 && dueCount === 0 && verifiedCount === cards.length ? 1 : 0
      if (dueCount === 0 && nextDueAt < earliestNextDue) {
        earliestNextDue = nextDueAt
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
  }, [goals, loadDeck, loadClientState, skillpilotId, language])

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
