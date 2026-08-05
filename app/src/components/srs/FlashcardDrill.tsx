import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle, X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import {
    calculateReview,
    INITIAL_DECK_STATE,
    isVerifiedRecallPassed,
    isVerifiedRecallTestedToday,
    parseReviewTimestamp,
    type ReviewItem,
} from './srsLogic'
import { FlashcardFlipCard } from './FlashcardFlipCard'
import { interpolateTemplate } from '../../utils/interpolateTemplate'
import {
    FLASHCARD_PRACTICE_QUALITY,
    getAdjacentFlashcardIndex,
    getFlashcardDrillCopy,
    type FlashcardPracticeRating,
} from '../../utils/flashcardDrillCopy'

interface FlashcardDrillProps {
    dataSourceUrl?: string
    skillPilotId: string
    titleOverride?: string
    filterTags?: string[]
    goalId: string
    readOnly?: boolean
    onSync?: (goalId: string) => Promise<boolean>
    reloadSignal?: number
    onStateChange?: (state: {
        goalId: string
        mastery: number
        due: number
        total: number
    }) => void
}

interface VocabData {
    deckId: string
    title: string
    cards: Flashcard[]
}

type Flashcard = {
    id: string
    front: string
    back: string
    category: string
    tags?: string[]
}

type FlashcardStats = {
    total: number
    box0: number
    box1: number
    box2: number
    box3: number
    due: number
    verifiedPassed: number
    verifiedPending: number
    verifiedEligible: number
    verifiedBlockedToday: number
}

const parseNextReview = (value: unknown): number => {
    return parseReviewTimestamp(value)
}

const shuffle = <T,>(items: T[]): T[] => {
    const copy = items.slice()
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = copy[i]
        copy[i] = copy[j]
        copy[j] = tmp
    }
    return copy
}

const isCardDue = (state: ReviewItem | undefined, now: number): boolean => {
    const interval = state ? Number(state.interval) : Number.NaN
    const nextReview = parseNextReview(state?.nextReview)
    return !state || !Number.isFinite(interval) || !Number.isFinite(nextReview) || nextReview <= now
}

const calculateStats = (
    cards: Flashcard[],
    stateByCardId: Record<string, ReviewItem>,
    now = Date.now()
): FlashcardStats => {
    let box0 = 0
    let box1 = 0
    let box2 = 0
    let box3 = 0
    let due = 0
    let verifiedPassed = 0
    let verifiedBlockedToday = 0
    let verifiedEligible = 0

    cards.forEach((card) => {
        const state = stateByCardId[card.id]
        const interval = state ? Number(state.interval) : Number.NaN
        const nextReview = parseNextReview(state?.nextReview)

        if (!state || !Number.isFinite(interval) || !Number.isFinite(nextReview)) {
            box0 += 1
        } else if (interval < 3) {
            box1 += 1
        } else if (interval <= 10) {
            box2 += 1
        } else {
            box3 += 1
        }

        if (isCardDue(state, now)) {
            due += 1
        }
        if (isVerifiedRecallPassed(state?.verifiedRecall)) {
            verifiedPassed += 1
        } else if (isVerifiedRecallTestedToday(state?.verifiedRecall, now)) {
            verifiedBlockedToday += 1
        } else {
            verifiedEligible += 1
        }
    })

    return {
        total: cards.length,
        box0,
        box1,
        box2,
        box3,
        due,
        verifiedPassed,
        verifiedPending: Math.max(0, cards.length - verifiedPassed),
        verifiedEligible,
        verifiedBlockedToday,
    }
}

export function FlashcardDrill({
    dataSourceUrl,
    skillPilotId,
    titleOverride,
    filterTags,
    goalId,
    readOnly = false,
    onSync,
    reloadSignal,
    onStateChange,
}: FlashcardDrillProps) {
    const { language } = useLanguage()
    const t = getFlashcardDrillCopy(language === 'en' ? 'en' : 'de')

    // State for SRS
    // Initial load happens in useEffect to ensure we use the correct keys
    const [srsState, setSrsState] = useState<Record<string, ReviewItem>>({})
    const [vocabData, setVocabData] = useState<VocabData | null>(null)
    const [queue, setQueue] = useState<VocabData['cards']>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [ratingsByCardId, setRatingsByCardId] = useState<Record<string, FlashcardPracticeRating>>({})
    const reviewedCountRef = useRef(0)
    const [reloadTrigger, setReloadTrigger] = useState(0)
    const syncInFlightRef = useRef(false)
    const onSyncRef = useRef(onSync)
    const latestStateRef = useRef<Record<string, ReviewItem>>({})
    const pendingSyncRef = useRef(false)
    const syncGenerationRef = useRef(0)
    const syncedAllCaughtUpRef = useRef(false)
    const lastMasteryRef = useRef<number | null>(null)
    const sessionInitialDueRef = useRef<number | null>(null)

    const [stats, setStats] = useState<FlashcardStats>({
        total: 0,
        box0: 0,
        box1: 0,
        box2: 0,
        box3: 0,
        due: 0,
        verifiedPassed: 0,
        verifiedPending: 0,
        verifiedEligible: 0,
        verifiedBlockedToday: 0
    })

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        latestStateRef.current = srsState
    }, [srsState])

    useEffect(() => {
        onSyncRef.current = onSync
    }, [onSync])

    const triggerSync = useCallback(async () => {
        if (!onSyncRef.current || syncInFlightRef.current) return
        syncInFlightRef.current = true
        try {
            while (pendingSyncRef.current) {
                const sync = onSyncRef.current
                if (!sync) break

                const syncingGeneration = syncGenerationRef.current
                try {
                    const ok = await sync(goalId)
                    if (!ok) break
                    if (syncGenerationRef.current === syncingGeneration) {
                        pendingSyncRef.current = false
                    }
                } catch (e) {
                    console.warn('SRS sync error', e)
                    break
                }
            }
        } finally {
            syncInFlightRef.current = false
        }
    }, [goalId])

    const sendBackgroundSync = useCallback(() => {
        if (!pendingSyncRef.current) return
        if (!skillPilotId || !goalId) return
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase
            ? `${apiBase}/api/ui/learners/${skillPilotId}/client-state/${goalId}`
            : `/api/ui/learners/${skillPilotId}/client-state/${goalId}`
        const payload = JSON.stringify({
            updatedAt: new Date().toISOString(),
            srsState: latestStateRef.current
        })

        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' })
            navigator.sendBeacon(url, blob)
            pendingSyncRef.current = false
            return
        }

        try {
            fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true
            })
            pendingSyncRef.current = false
        } catch (e) {
            console.warn('Background sync failed', e)
        }
    }, [goalId, skillPilotId])

    // Reset and Load
    useEffect(() => {
        setVocabData(null)
        setQueue([])
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setRatingsByCardId({})
        reviewedCountRef.current = 0
        setSrsState({}) // Clear state
        syncInFlightRef.current = false
        syncedAllCaughtUpRef.current = false
        sessionInitialDueRef.current = null
        lastMasteryRef.current = null
    }, [dataSourceUrl, goalId]) // Reset on goal change

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                sendBackgroundSync()
            }
        }
        const handleBeforeUnload = () => {
            sendBackgroundSync()
        }
        document.addEventListener('visibilitychange', handleVisibility)
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility)
            window.removeEventListener('beforeunload', handleBeforeUnload)
            sendBackgroundSync()
        }
    }, [sendBackgroundSync])

    // Initialize: Fetch Data -> Load State -> Then Queue
    useEffect(() => {
        if (!dataSourceUrl) return

        const loadData = async () => {
            try {
                const res = await fetch(dataSourceUrl, { cache: 'no-store' })
                if (!res.ok) throw new Error("Failed to load vocab")
                const data: VocabData = await res.json()

                if (filterTags && filterTags.length > 0) {
                    data.cards = data.cards.filter(card =>
                        card.tags && card.tags.some(tag => filterTags.includes(tag))
                    )
                }

                setVocabData(data)

                // Restore latest server state for this node (if newer than local)
                const lastSyncKey = `srs_state_last_sync_${skillPilotId}_${goalId}`
                const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
                const syncUrl = apiBase
                    ? `${apiBase}/api/ui/learners/${skillPilotId}/client-state/${goalId}`
                    : `/api/ui/learners/${skillPilotId}/client-state/${goalId}`
                try {
                    const res = await fetch(syncUrl)
                    if (res.ok) {
                        const payload = await res.json()
                        if (payload && payload.srsState && Object.keys(payload.srsState).length > 0) {
                            const updatedAt = payload.updatedAt ? Date.parse(payload.updatedAt) : 0
                            const localLast = localStorage.getItem(lastSyncKey)
                            const localLastAt = localLast ? Date.parse(localLast) : 0
                            if (!updatedAt || !localLastAt || updatedAt > localLastAt) {
                                const storageKey = `srs_state_${skillPilotId}_${goalId}`
                                localStorage.setItem(storageKey, JSON.stringify(payload.srsState))
                                if (payload.updatedAt) {
                                    localStorage.setItem(lastSyncKey, String(payload.updatedAt))
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Client-state restore error', e)
                }

                // Load State Dynamically using goalId (User Request)
                const storageKey = `srs_state_${skillPilotId}_${goalId}`
                let loadedState: Record<string, ReviewItem> = {}
                try {
                    const stored = localStorage.getItem(storageKey)
                    if (stored) loadedState = JSON.parse(stored)
                } catch (e) { console.error("Storage load error", e) }

                setSrsState(loadedState)

                const now = Date.now()
                const nextStats = calculateStats(data.cards, loadedState, now)
                const dueCards = data.cards.filter(card => isCardDue(loadedState[card.id], now))
                setStats(nextStats)

                if (sessionInitialDueRef.current === null) {
                    sessionInitialDueRef.current = nextStats.due
                }

                const shuffled = shuffle(dueCards)
                setQueue(shuffled.slice(0, 20))
                setRatingsByCardId({})

                if (
                    nextStats.due === 0
                    && nextStats.verifiedPending === 0
                    && nextStats.total > 0
                    && onSyncRef.current
                    && !syncedAllCaughtUpRef.current
                ) {
                    syncedAllCaughtUpRef.current = true
                    pendingSyncRef.current = true
                    syncGenerationRef.current += 1
                    void triggerSync()
                }

            } catch (e) {
                console.error("Error loading vocab data", e)
                setError("Card load error.")
            }
        }

        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSourceUrl, filterTags?.join(','), reloadTrigger, goalId, skillPilotId, reloadSignal, triggerSync])
    // Initialize: Fetch Data -> Then Queue


    const currentCard = queue[currentCardIndex]

    useEffect(() => {
        if (!onStateChange) return
        if (stats.total <= 0) return
        const mastery = stats.verifiedPending === 0 ? 1 : 0
        if (lastMasteryRef.current === mastery) return
        lastMasteryRef.current = mastery
        onStateChange({
            goalId,
            mastery,
            due: stats.due,
            total: stats.total,
        })
    }, [goalId, stats.due, stats.total, stats.verifiedPending, onStateChange])

    const reviewStateForCard = (cardId: string, quality: number): ReviewItem => {
        const rawState = srsState[cardId]
        const previousState = rawState
            ? {
                id: cardId,
                nextReview: parseNextReview(rawState.nextReview),
                interval: Number.isFinite(Number(rawState.interval))
                    ? Number(rawState.interval)
                    : INITIAL_DECK_STATE.interval,
                repetition: Number.isFinite(Number(rawState.repetition))
                    ? Number(rawState.repetition)
                    : INITIAL_DECK_STATE.repetition,
                ef: Number.isFinite(Number(rawState.ef)) ? Number(rawState.ef) : INITIAL_DECK_STATE.ef,
                verifiedRecall: rawState.verifiedRecall
            }
            : { ...INITIAL_DECK_STATE, id: cardId, nextReview: 0 }

        const result = calculateReview(
            quality,
            previousState.interval,
            previousState.ef,
            previousState.repetition
        )

        // Calculate next review date
        const nextReviewDate = Date.now() + result.interval * 24 * 60 * 60 * 1000

        return {
            id: cardId,
            nextReview: nextReviewDate,
            verifiedRecall: previousState.verifiedRecall,
            ...result
        }
    }

    const persistSrsState = (updatedSrsState: Record<string, ReviewItem>) => {
        setSrsState(updatedSrsState)
        if (vocabData) {
            setStats(calculateStats(vocabData.cards, updatedSrsState))
        }
        const storageKey = `srs_state_${skillPilotId}_${goalId}`
        localStorage.setItem(storageKey, JSON.stringify(updatedSrsState))
        pendingSyncRef.current = true
        syncGenerationRef.current += 1
    }

    const handleRate = (rating: FlashcardPracticeRating) => {
        if (!currentCard) return
        if (ratingsByCardId[currentCard.id]) return

        const quality = FLASHCARD_PRACTICE_QUALITY[rating]

        const newState = reviewStateForCard(currentCard.id, quality)

        const updatedSrsState = { ...srsState, [currentCard.id]: newState }
        persistSrsState(updatedSrsState)
        const updatedRatings = { ...ratingsByCardId, [currentCard.id]: rating }
        setRatingsByCardId(updatedRatings)
        const batchComplete = queue.length > 0 && queue.every(card => updatedRatings[card.id])
        if (batchComplete) {
            void triggerSync()
        }

        const nextReviewed = reviewedCountRef.current + 1
        reviewedCountRef.current = nextReviewed
        if (onSync && nextReviewed % 20 === 0) {
            void triggerSync()
        }
    }

    const showCardAt = useCallback((index: number) => {
        if (index < 0 || index >= queue.length) return
        setCurrentCardIndex(index)
        setIsFlipped(false)
    }, [queue.length])

    const showPreviousCard = useCallback(() => {
        showCardAt(getAdjacentFlashcardIndex(currentCardIndex, queue.length, -1))
    }, [currentCardIndex, queue.length, showCardAt])

    const showNextCard = useCallback(() => {
        if (currentCardIndex < queue.length - 1) {
            showCardAt(getAdjacentFlashcardIndex(currentCardIndex, queue.length, 1))
            return
        }

        const batchComplete = queue.length > 0 && queue.every(card => ratingsByCardId[card.id])
        if (!batchComplete) return

        setQueue([])
        setCurrentCardIndex(0)
        setIsFlipped(false)
        setRatingsByCardId({})
        reviewedCountRef.current = 0
        setReloadTrigger(previous => previous + 1)
    }, [currentCardIndex, queue, ratingsByCardId, showCardAt])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!currentCard) return
            if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
            const target = event.target
            if (
                target instanceof Element
                && target.closest('button, a, input, textarea, select, [contenteditable="true"], [role="button"], [role="link"]')
            ) return

            if (event.code === 'Space') {
                event.preventDefault()
                setIsFlipped(previous => !previous)
                return
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault()
                showPreviousCard()
                return
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault()
                showNextCard()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentCard, showNextCard, showPreviousCard])

    if (!dataSourceUrl) return <div className="p-8 text-center text-red-500">{t.configError}</div>

    if (error) return <div className="p-8 text-center text-gray-500 italic">{error}</div>

    if (!vocabData) return <div className="p-8 text-center">{t.loading}</div>

    const allCaughtUp = stats.total > 0 && stats.due === 0 && queue.length === 0

    if (allCaughtUp) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t.practiceCaughtUp}</h2>
                <div className="flex gap-2 my-8 justify-center w-full max-w-sm">
                    {/* Mini Box View for Summary */}
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-gray-500">{t.new}</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{stats.box0}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-orange-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-orange-600">{t.learn}</span>
                        <span className="font-bold text-orange-700 dark:text-orange-300">{stats.box1}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-blue-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-blue-600">{t.review}</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">{stats.box2}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-green-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-green-600">{t.master}</span>
                        <span className="font-bold text-green-700 dark:text-green-300">{stats.box3}</span>
                    </div>
                </div>
                <div className="mb-6 flex flex-col items-center gap-2 text-gray-500">
                    <p>{titleOverride || vocabData?.title || 'Loading...'} - {t.noneDue}</p>
                    <p className="text-sm">{interpolateTemplate(t.verifiedProgress, [stats.verifiedPassed, stats.total])}</p>
                </div>
            </div>
        )
    }

    if (stats.total === 0) {
        return <div className="p-8 text-center text-gray-500 italic">{t.noCardsForFilter}</div>
    }

    if (readOnly) {
        return (
            <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 min-h-[40vh]">
                <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-900/10">
                    <h2 className="text-lg font-semibold text-text-primary">{t.readOnlyTitle}</h2>
                    <p className="mt-2 text-sm text-text-secondary">{t.readOnlyBody}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-950/30">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{t.review}</div>
                            <div className="mt-1 text-xl font-semibold text-text-primary">{stats.due}</div>
                        </div>
                        <div className="rounded-xl bg-white/80 p-3 dark:bg-slate-950/30">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{t.master}</div>
                            <div className="mt-1 text-xl font-semibold text-text-primary">{stats.box3}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentCard || !vocabData) return <div className="p-8 text-center">{t.loading}</div>

    const progressTotal = sessionInitialDueRef.current || 1
    const progressDone = Math.max(0, progressTotal - stats.due)
    const progressPercent = Math.min(100, Math.max(0, (progressDone / progressTotal) * 100))
    const currentRating = ratingsByCardId[currentCard.id]
    const batchComplete = queue.length > 0 && queue.every(card => ratingsByCardId[card.id])
    const canShowNext = currentCardIndex < queue.length - 1 || batchComplete

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 min-h-[60vh]">
            {/* Dashboard: Leitner Boxes */}
            <div className="w-full mb-6">
                <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.progress}</span>
                </div>

                <div className="grid grid-cols-4 gap-1 h-16 w-full">
                    {/* Box 0: New */}
                    <div className="flex flex-col justify-end relative group cursor-help rounded-lg">
                        <div className="absolute inset-0 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                            <div
                                className="bg-gray-300 dark:bg-gray-600 absolute bottom-0 left-0 right-0 transition-all duration-500"
                                style={{ height: `${(stats.box0 / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <div className="relative z-10 p-1 text-center pointer-events-none">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 block">{stats.box0}</span>
                            <span className="text-[9px] text-gray-500 uppercase">{t.new}</span>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            {t.box0Tooltip}
                        </div>
                    </div>

                    {/* Box 1: Learning (< 3d) */}
                    <div className="flex flex-col justify-end relative group cursor-help rounded-lg">
                        <div className="absolute inset-0 bg-orange-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
                            <div
                                className="bg-orange-200 dark:bg-orange-900/50 absolute bottom-0 left-0 right-0 transition-all duration-500"
                                style={{ height: `${(stats.box1 / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <div className="relative z-10 p-1 text-center pointer-events-none">
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 block">{stats.box1}</span>
                            <span className="text-[9px] text-orange-600/70 dark:text-orange-400/70 uppercase">{t.learn}</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            {t.box1Tooltip}
                        </div>
                    </div>

                    {/* Box 2: Review (3-10d) */}
                    <div className="flex flex-col justify-end relative group cursor-help rounded-lg">
                        <div className="absolute inset-0 bg-blue-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
                            <div
                                className="bg-blue-200 dark:bg-blue-900/50 absolute bottom-0 left-0 right-0 transition-all duration-500"
                                style={{ height: `${(stats.box2 / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <div className="relative z-10 p-1 text-center pointer-events-none">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">{stats.box2}</span>
                            <span className="text-[9px] text-blue-600/70 dark:text-blue-400/70 uppercase">{t.review}</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            {t.box2Tooltip}
                        </div>
                    </div>

                    {/* Box 3: Mastered (>10d) */}
                    <div className="flex flex-col justify-end relative group cursor-help rounded-lg">
                        <div className="absolute inset-0 bg-green-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
                            <div
                                className="bg-green-200 dark:bg-green-900/50 absolute bottom-0 left-0 right-0 transition-all duration-500"
                                style={{ height: `${(stats.box3 / stats.total) * 100}%` }}
                            ></div>
                        </div>
                        <div className="relative z-10 p-1 text-center pointer-events-none">
                            <span className="text-xs font-bold text-green-700 dark:text-green-400 block">{stats.box3}</span>
                            <span className="text-[9px] text-green-600/70 dark:text-green-400/70 uppercase">{t.master}</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            {t.box3Tooltip}
                        </div>
                    </div>
                </div>

                {/* Due Indicator */}
                <div className="text-center mt-2 flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 font-medium">
                        {t.speedMemorization}
                    </span>
                    <span className="text-[10px] text-gray-400">
                        {interpolateTemplate(t.readyForReview, [stats.due])}
                    </span>
                </div>

                <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 px-3 py-3 dark:border-sky-900/40 dark:bg-sky-950/20">
                    <div className="group relative cursor-help">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                            {interpolateTemplate(t.verifiedProgress, [stats.verifiedPassed, stats.total])}
                        </div>
                        <div className="absolute bottom-full left-0 mb-1 hidden w-max max-w-64 rounded bg-black px-2 py-1 text-[10px] text-white group-hover:block">
                            {interpolateTemplate(t.verifiedProgressTooltip, [stats.verifiedPassed, stats.total])}
                        </div>
                    </div>
                </div>
            </div>


            <p className="mb-2 w-full px-1 text-sm font-medium text-gray-500 dark:text-gray-400" aria-live="polite">
                {t.cardPosition(currentCardIndex + 1, queue.length)}
            </p>

            {/* Progress Bar */}
            <div className="group relative w-full mb-6 cursor-help">
                <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                    <div
                        className="h-full bg-sky-500 transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {interpolateTemplate(t.progressTooltip, [progressDone, progressTotal])}
                </div>
            </div>

            {/* Card Area */}
            <FlashcardFlipCard
                category={currentCard.category}
                front={currentCard.front}
                back={currentCard.back}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                tapToFlipText={t.tapToFlip}
            />

            {/* Controls */}
            <div className="mt-8 grid grid-cols-4 gap-3 w-full">
                <button
                    type="button"
                    onClick={showPreviousCard}
                    disabled={currentCardIndex === 0}
                    aria-label={t.previousCard}
                    title={t.previousCard}
                    className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800"
                >
                    <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                </button>
                {!isFlipped ? (
                    <button
                        type="button"
                        onClick={() => setIsFlipped(true)}
                        className="col-span-2 bg-gray-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-700 transition-colors"
                    >
                        {t.showAnswer}
                    </button>
                ) : (
                    <>
                        <div className="group relative col-span-1">
                            <button
                                type="button"
                                onClick={() => handleRate('not_known')}
                                disabled={Boolean(currentRating)}
                                aria-pressed={currentRating === 'not_known'}
                                className={`flex w-full items-center justify-center gap-1 rounded-xl border py-3 text-xs font-bold transition-colors disabled:cursor-not-allowed ${currentRating === 'not_known' ? 'border-red-500 bg-red-200 text-red-800' : 'border-red-200 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-45'}`}
                            >
                                <X aria-hidden="true" className="h-4 w-4 shrink-0" />
                                <span>{t.notKnown}</span>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                {currentRating ? t.ratingSaved : t.notKnownTooltip}
                            </div>
                        </div>
                        <div className="group relative col-span-1">
                            <button
                                type="button"
                                onClick={() => handleRate('known')}
                                disabled={Boolean(currentRating)}
                                aria-pressed={currentRating === 'known'}
                                className={`flex w-full items-center justify-center gap-1 rounded-xl border py-3 text-xs font-bold transition-colors disabled:cursor-not-allowed ${currentRating === 'known' ? 'border-green-500 bg-green-200 text-green-800' : 'border-green-200 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-45'}`}
                            >
                                <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
                                <span>{t.known}</span>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                {currentRating ? t.ratingSaved : t.knownTooltip}
                            </div>
                        </div>
                    </>
                )}
                <button
                    type="button"
                    onClick={showNextCard}
                    disabled={!canShowNext}
                    aria-label={t.nextCard}
                    title={t.nextCard}
                    className="flex items-center justify-center rounded-xl border border-sky-300 bg-white py-3 text-sky-700 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-35 dark:border-sky-800 dark:bg-slate-900 dark:text-sky-300 dark:hover:bg-slate-800"
                >
                    <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
}
