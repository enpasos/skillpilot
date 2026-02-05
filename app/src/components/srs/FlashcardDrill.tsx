import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { calculateReview, INITIAL_DECK_STATE, type ReviewItem } from './srsLogic'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface FlashcardDrillProps {
    dataSourceUrl?: string
    skillPilotId: string
    titleOverride?: string
    filterTags?: string[]
    goalId: string
    onSync?: (goalId: string) => Promise<boolean>
    reloadSignal?: number
    onStateChange?: () => void
}

interface VocabData {
    deckId: string
    title: string
    cards: Array<{
        id: string
        front: string
        back: string
        category: string
        tags?: string[]
    }>
}

const UI_TEXT = {
    en: {
        configError: "Configuration Error: Missing Vocabulary Source.",
        loading: "Loading Data...",
        allCaughtUp: "All Caught Up!",
        new: "New",
        learn: "Learn",
        review: "Review",
        master: "Master",
        noneDue: "No cards due for review right now.",
        back: "Back to Curriculum",
        sessionComplete: "Session Complete!",
        reviewed: "You reviewed {0} cards.",
        continue: "Continue Learning",
        progress: "Your Progress",
        localData: "Local Data", // Not used explicitly anymore as we always force local
        localDataTooltip: "Saved in this browser.",
        sync: "Save",
        syncing: "Saving...",
        syncSuccess: "Saved",
        syncFailed: "Save failed",
        box0Tooltip: "New cards. Start here.",
        box1Tooltip: "Learning. Repeat < 3 days.",
        box2Tooltip: "Consolidating. Repeat 3-10 days.",
        box3Tooltip: "Mastered. Repeat > 10 days.",
        speedMemorization: "Speed Memorization – Be honest with yourself!",
        progressTooltip: "Session Progress: {0}/{1}",
        readyForReview: "Cards for today: {0}. Doing 20 of them is great!",
        tapToFlip: "Tap to flip",
        showAnswer: "Show Answer",
        again: "Again",
        hard: "Hard",
        good: "Good",
        easy: "Easy",
        againTooltip: "Did not know it. Review < 1 min.",
        hardTooltip: "Correct but slow/unsure.",
        goodTooltip: "Correct with some effort.",
        easyTooltip: "Instant recall. Perfect."
    },
    de: {
        configError: "Konfigurationsfehler: Fehlende Vokabelquelle.",
        loading: "Lade Daten...",
        allCaughtUp: "Alles erledigt!",
        new: "Neu",
        learn: "Lernen",
        review: "Wdh.",
        master: "Meister",
        noneDue: "Derzeit keine Karten zur Wiederholung fällig.",
        back: "Zurück zum Lehrplan",
        sessionComplete: "Sitzung beendet!",
        reviewed: "Du hast {0} Karten wiederholt.",
        continue: "Weiterlernen",
        progress: "Dein Fortschritt",
        localData: "Lokale Daten",
        localDataTooltip: "In diesem Browser gespeichert.",
        sync: "Speichern",
        syncing: "Speichere...",
        syncSuccess: "Gespeichert",
        syncFailed: "Speichern fehlgeschlagen",
        box0Tooltip: "Neue Karten. Startpunkt.",
        box1Tooltip: "Lernen. Wdh. < 3 Tage.",
        box2Tooltip: "Festigen. Wdh. 3-10 Tage.",
        box3Tooltip: "Gemeistert. Wdh. > 10 Tage.",
        speedMemorization: "Speed Memorization – Sei ehrlich zu Dir selbst!",
        progressTooltip: "Sitzungsfortschritt: {0}/{1}",
        readyForReview: "Bereit für heute: {0}.",
        tapToFlip: "Zum Umdrehen tippen",
        showAnswer: "Antwort zeigen",
        again: "Nochmal",
        hard: "Schwer",
        good: "Gut",
        easy: "Einfach",
        againTooltip: "Nicht gewusst. Wdh < 1 Min.",
        hardTooltip: "Richtig, aber langsam/unsicher.",
        goodTooltip: "Richtig mit etwas Mühe.",
        easyTooltip: "Sofort gewusst. Perfekt."
    }
}

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

export function FlashcardDrill({
    dataSourceUrl,
    skillPilotId,
    titleOverride,
    filterTags,
    goalId,
    onSync,
    reloadSignal,
    onStateChange
}: FlashcardDrillProps) {
    const { language } = useLanguage()
    const t = language === 'de' ? UI_TEXT.de : UI_TEXT.en

    // State for SRS
    // Initial load happens in useEffect to ensure we use the correct keys
    const [srsState, setSrsState] = useState<Record<string, ReviewItem>>({})
    const [vocabData, setVocabData] = useState<VocabData | null>(null)
    const [queue, setQueue] = useState<VocabData['cards']>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const reviewedCountRef = useRef(0)
    const [reloadTrigger, setReloadTrigger] = useState(0)
    const [syncInFlight, setSyncInFlight] = useState(false)
    const latestStateRef = useRef<Record<string, ReviewItem>>({})
    const pendingSyncRef = useRef(false)
    const finishedAutoSaveRef = useRef(false)
    const syncedAllCaughtUpRef = useRef(false)
    const autoReloadRef = useRef(false)
    const lastMasteryRef = useRef<number | null>(null)

    const [stats, setStats] = useState({
        total: 0,
        box0: 0,
        box1: 0,
        box2: 0,
        box3: 0,
        due: 0
    })

    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        latestStateRef.current = srsState
    }, [srsState])

    const triggerSync = useCallback(async () => {
        if (!onSync || syncInFlight) return
        setSyncInFlight(true)
        try {
            const ok = await onSync(goalId)
            if (ok) pendingSyncRef.current = false
        } catch (e) {
            console.warn('SRS sync error', e)
        } finally {
            setSyncInFlight(false)
        }
    }, [goalId, onSync, syncInFlight])

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
        reviewedCountRef.current = 0
        setSrsState({}) // Clear state
        setSyncInFlight(false)
        syncedAllCaughtUpRef.current = false
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
                const res = await fetch(dataSourceUrl)
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
                onStateChange?.()

                // Process Queue
                const now = Date.now()
                const totalCards = data.cards.length
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0
                let dueCardsCount = 0

                const dueCards = data.cards.filter(card => {
                    const state = loadedState[card.id]
                    const interval = state ? Number(state.interval) : Number.NaN
                    const nextReview = parseNextReview(state?.nextReview)

                    if (!state || !Number.isFinite(interval) || !Number.isFinite(nextReview)) {
                        b0++
                        dueCardsCount++
                        return true
                    }

                    if (interval < 3) b1++
                    else if (interval <= 10) b2++
                    else b3++

                    if (nextReview <= now) {
                        dueCardsCount++
                        return true
                    }
                    return false
                })

                setStats({
                    total: totalCards,
                    box0: b0,
                    box1: b1,
                    box2: b2,
                    box3: b3,
                    due: dueCardsCount
                })

                const shuffled = shuffle(dueCards)
                setQueue(shuffled.slice(0, 20))

                if (
                    dueCardsCount === 0
                    && totalCards > 0
                    && onSync
                    && !syncedAllCaughtUpRef.current
                ) {
                    syncedAllCaughtUpRef.current = true
                    pendingSyncRef.current = true
                    void triggerSync()
                }

            } catch (e) {
                console.error("Error loading vocab data", e)
                setError("Card load error.")
            }
        }

        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSourceUrl, filterTags?.join(','), reloadTrigger, goalId, skillPilotId, reloadSignal, onSync, triggerSync])
    // Initialize: Fetch Data -> Then Queue


    const currentCard = queue[currentCardIndex]
    const isFinished = currentCardIndex >= queue.length

    useEffect(() => {
        if (!isFinished || queue.length === 0 || stats.due === 0) {
            autoReloadRef.current = false
            return
        }
        if (autoReloadRef.current) return
        autoReloadRef.current = true
        // Auto-advance to the next batch (no extra click).
        setQueue([])
        setCurrentCardIndex(0)
        reviewedCountRef.current = 0
        setIsFlipped(false)
        setReloadTrigger(prev => prev + 1)
    }, [isFinished, queue.length, stats.due])

    useEffect(() => {
        if (!onStateChange) return
        if (stats.total <= 0) return
        const mastery = stats.due === 0 ? 1 : 0
        if (lastMasteryRef.current === mastery) return
        lastMasteryRef.current = mastery
        onStateChange()
    }, [stats.due, stats.total, onStateChange])

    useEffect(() => {
        if (!isFinished) {
            finishedAutoSaveRef.current = false
            return
        }
        if (finishedAutoSaveRef.current) return
        if (!pendingSyncRef.current) return
        if (!onSync) return
        finishedAutoSaveRef.current = true
        void triggerSync()
    }, [isFinished, onSync, triggerSync])

    const handleRate = (quality: number) => {
        if (!currentCard) return

        const rawState = srsState[currentCard.id]
        const previousState = rawState
            ? {
                id: currentCard.id,
                nextReview: parseNextReview(rawState.nextReview),
                interval: Number.isFinite(Number(rawState.interval))
                    ? Number(rawState.interval)
                    : INITIAL_DECK_STATE.interval,
                repetition: Number.isFinite(Number(rawState.repetition))
                    ? Number(rawState.repetition)
                    : INITIAL_DECK_STATE.repetition,
                ef: Number.isFinite(Number(rawState.ef)) ? Number(rawState.ef) : INITIAL_DECK_STATE.ef
            }
            : { ...INITIAL_DECK_STATE, id: currentCard.id, nextReview: 0 }

        const result = calculateReview(
            quality,
            previousState.interval,
            previousState.ef,
            previousState.repetition
        )

        // Calculate next review date
        const nextReviewDate = Date.now() + result.interval * 24 * 60 * 60 * 1000

        const newState: ReviewItem = {
            id: currentCard.id,
            nextReview: nextReviewDate,
            ...result
        }

        const updatedSrsState = { ...srsState, [currentCard.id]: newState }
        setSrsState(updatedSrsState)
        const storageKey = `srs_state_${skillPilotId}_${goalId}`
        localStorage.setItem(storageKey, JSON.stringify(updatedSrsState))
        pendingSyncRef.current = true
        const willFinish = currentCardIndex + 1 >= queue.length
        if (willFinish) {
            void triggerSync()
        }

        const nextReviewed = reviewedCountRef.current + 1
        reviewedCountRef.current = nextReviewed
        if (onSync && nextReviewed % 20 === 0) {
            void triggerSync()
        }

        // Optimistic Update for UI Feedback
        setStats(prev => {
            const newDue = Math.max(0, prev.due - 1)

            // Calculate Box Movement
            const isNew = !srsState[currentCard.id]

            const getBox = (interval: number) => {
                if (interval < 3) return 1
                if (interval <= 10) return 2
                return 3
            }

            const oldBox = isNew ? 0 : getBox(previousState.interval)
            const newBox = getBox(result.interval)

            // Don't update if box hasn't changed (unlikely for New cards, but possible for others)
            if (oldBox === newBox) return { ...prev, due: newDue }

            return {
                ...prev,
                due: newDue,
                [`box${oldBox}`]: prev[`box${oldBox}` as keyof typeof prev] - 1,
                [`box${newBox}`]: prev[`box${newBox}` as keyof typeof prev] + 1
            }
        })

        // Move to next
        setIsFlipped(false)
        setTimeout(() => setCurrentCardIndex(prev => prev + 1), 200)
    }

    if (!dataSourceUrl) return <div className="p-8 text-center text-red-500">{t.configError}</div>

    if (error) return <div className="p-8 text-center text-gray-500 italic">{error}</div>

    if (!vocabData) return <div className="p-8 text-center">{t.loading}</div>

    const allCaughtUp = stats.total > 0 && stats.due === 0

    if (allCaughtUp) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t.allCaughtUp}</h2>
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
                <p className="text-gray-500 mb-6">{titleOverride || vocabData?.title || 'Loading...'} - {t.noneDue}</p>
            </div>
        )
    }

    if (!currentCard || !vocabData) return <div className="p-8 text-center">{t.loading}</div>

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
                        {t.readyForReview.replace('{0}', stats.due.toString())}
                    </span>
                </div>
            </div>


            {/* Progress Bar */}
            <div className="group relative w-full mb-6 cursor-help">
                <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                    <div
                        className="h-full bg-sky-500 transition-all duration-300 ease-out"
                        style={{ width: `${((currentCardIndex) / queue.length) * 100}%` }}
                    />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {t.progressTooltip.replace('{0}', currentCardIndex.toString()).replace('{1}', queue.length.toString())}
                </div>
            </div>

            {/* Card Area */}
            <div className="relative w-full aspect-[4/3]" style={{ perspective: '1000px' }}>
                <div
                    className="w-full h-full relative cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                        <span className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">{currentCard.category}</span>
                        <div className="w-full text-center text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    p: ({ node: _node, ...props }) => <p className="m-0" {...props} />
                                }}
                            >
                                {currentCard.front}
                            </ReactMarkdown>
                        </div>
                        <p className="text-gray-400 text-sm mt-4 italic">{t.tapToFlip}</p>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 bg-sky-50 dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-sky-200 dark:border-sky-900 flex flex-col items-center justify-center p-6 text-center"
                        style={{
                            transform: 'rotateY(180deg)',
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden'
                        }}
                    >
                        <div className="w-full text-center text-base md:text-lg font-bold text-sky-700 dark:text-sky-300 flex flex-col items-center justify-center">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    p: ({ node: _node, ...props }) => <p className="m-0" {...props} />
                                }}
                            >
                                {currentCard.back}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 grid grid-cols-4 gap-3 w-full">
                {!isFlipped ? (
                    <button
                        onClick={() => setIsFlipped(true)}
                        className="col-span-4 bg-gray-800 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-gray-700 transition-colors"
                    >
                        {t.showAnswer}
                    </button>
                ) : (
                    <>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(1)} className="w-full bg-red-100 text-red-700 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-200">{t.again}</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                {t.againTooltip}
                            </div>
                        </div>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(3)} className="w-full bg-orange-100 text-orange-700 border border-orange-200 py-3 rounded-xl font-bold hover:bg-orange-200">{t.hard}</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                {t.hardTooltip}
                            </div>
                        </div>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(4)} className="w-full bg-blue-100 text-blue-700 border border-blue-200 py-3 rounded-xl font-bold hover:bg-blue-200">{t.good}</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                {t.goodTooltip}
                            </div>
                        </div>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(5)} className="w-full bg-green-100 text-green-700 border border-green-200 py-3 rounded-xl font-bold hover:bg-green-200">{t.easy}</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                {t.easyTooltip}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
