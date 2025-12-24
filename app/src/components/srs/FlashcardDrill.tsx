import { useState, useEffect } from 'react'
import { CheckCircle, BrainCircuit } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

import { calculateReview, INITIAL_DECK_STATE, type ReviewItem } from './srsLogic'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface FlashcardDrillProps {
    onComplete: () => void
    dataSourceUrl?: string
    skillPilotId: string
    titleOverride?: string
}

interface VocabData {
    deckId: string
    title: string
    cards: Array<{
        id: string
        front: string
        back: string
        category: string
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
        localData: "Local Data",
        localDataTooltip: "Saved in this browser.",
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
        box0Tooltip: "Neue Karten. Startpunkt.",
        box1Tooltip: "Lernen. Wdh. < 3 Tage.",
        box2Tooltip: "Festigen. Wdh. 3-10 Tage.",
        box3Tooltip: "Gemeistert. Wdh. > 10 Tage.",
        speedMemorization: "Speed Memorization – Sei ehrlich zu Dir selbst!",
        progressTooltip: "Sitzungsfortschritt: {0}/{1}",
        readyForReview: "Bereit für heute: {0}. 20 Stück zu schaffen ist super!",
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

export function FlashcardDrill({ onComplete, dataSourceUrl, skillPilotId, titleOverride }: FlashcardDrillProps) {
    const { language } = useLanguage()
    const t = language === 'de' ? UI_TEXT.de : UI_TEXT.en

    // Load state from local storage or init
    const getStoredState = (): Record<string, ReviewItem> => {
        try {
            // Hardcoded deck ID for now (eng_400), but scoped to user
            const storageKey = `srs_state_${skillPilotId}_eng_400`
            const stored = localStorage.getItem(storageKey)
            return stored ? JSON.parse(stored) : {}
        } catch {
            return {}
        }
    }

    const [srsState, setSrsState] = useState<Record<string, ReviewItem>>(getStoredState)
    const [vocabData, setVocabData] = useState<VocabData | null>(null)
    const [queue, setQueue] = useState<VocabData['cards']>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [sessionStats, setSessionStats] = useState({ reviewed: 0 })
    const [reloadTrigger, setReloadTrigger] = useState(0) // New state for soft reload

    const [stats, setStats] = useState({
        total: 0,
        box0: 0, // New
        box1: 0, // < 3 days
        box2: 0, // 3-10 days
        box3: 0, // > 10 days
        due: 0
    })

    const [error, setError] = useState<string | null>(null)

    // Initialize: Fetch Data -> Then Queue
    useEffect(() => {
        if (!dataSourceUrl) return

        const loadData = async () => {
            try {
                const res = await fetch(dataSourceUrl)
                if (!res.ok) throw new Error("Failed to load vocab")
                const data: VocabData = await res.json()
                setVocabData(data)

                // Process Queue immediately after load
                const now = Date.now()
                const totalCards = data.cards.length
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0
                let dueCardsCount = 0

                const dueCards = data.cards.filter(card => {
                    const state = srsState[card.id] || getStoredState()[card.id] // Fallback to fresh read if needed

                    // Box Calc
                    if (!state) {
                        b0++
                        dueCardsCount++
                        return true
                    } else {
                        if (state.interval < 3) b1++
                        else if (state.interval <= 10) b2++
                        else b3++
                    }

                    // Due Calc
                    if (state.nextReview <= now) {
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

                setQueue(dueCards.slice(0, 20))

            } catch (e) {
                console.error("Error loading vocab data", e)
                setError("Konnte Karteikarten nicht laden (möglicherweise noch nicht erstellt).")
            }
        }

        loadData()
    }, [dataSourceUrl, reloadTrigger]) // Added reloadTrigger dependency

    const currentCard = queue[currentCardIndex]
    const isFinished = currentCardIndex >= queue.length

    const handleRate = (quality: number) => {
        if (!currentCard) return

        const previousState = srsState[currentCard.id] || { ...INITIAL_DECK_STATE, id: currentCard.id, nextReview: 0 }

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
        const storageKey = `srs_state_${skillPilotId}_eng_400`
        localStorage.setItem(storageKey, JSON.stringify(updatedSrsState))

        setSessionStats(prev => ({ reviewed: prev.reviewed + 1 }))

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

    if (queue.length === 0 && currentCardIndex === 0) {
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
                <button onClick={onComplete} className="bg-sky-500 text-white px-6 py-2 rounded-full hover:bg-sky-600">
                    {t.back}
                </button>
            </div>
        )
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <BrainCircuit className="w-16 h-16 text-sky-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{t.sessionComplete}</h2>
                <p className="text-gray-500 mb-6">{t.reviewed.replace('{0}', sessionStats.reviewed.toString())}</p>
                <button
                    onClick={() => {
                        // Soft Reload: Reset state and trigger re-fetch
                        setQueue([])
                        setCurrentCardIndex(0)
                        setSessionStats({ reviewed: 0 })
                        setIsFlipped(false)
                        setReloadTrigger(prev => prev + 1)
                    }}
                    className="bg-sky-500 text-white px-6 py-2 rounded-full hover:bg-sky-600"
                >
                    {t.continue}
                </button>
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
                    <div className="group relative flex items-center gap-1 text-[10px] text-gray-400 cursor-help">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {t.localData}
                        <div className="absolute top-full right-0 mt-1 w-48 bg-gray-800 text-white p-2 rounded text-xs z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {t.localDataTooltip}
                        </div>
                    </div>
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
                                    p: ({ node, ...props }) => <p className="m-0" {...props} />
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
                                    p: ({ node, ...props }) => <p className="m-0" {...props} />
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
