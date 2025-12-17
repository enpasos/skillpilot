import { useState, useEffect } from 'react'
import { CheckCircle, BrainCircuit } from 'lucide-react'
import vocabData from '../../assets/data/vocab_400.json'
import { calculateReview, INITIAL_DECK_STATE, type ReviewItem } from './srsLogic'

interface FlashcardDrillProps {
    onComplete: () => void
}

export function FlashcardDrill({ onComplete }: FlashcardDrillProps) {
    // Load state from local storage or init
    const getStoredState = (): Record<string, ReviewItem> => {
        try {
            const stored = localStorage.getItem('srs_state_eng_400')
            return stored ? JSON.parse(stored) : {}
        } catch {
            return {}
        }
    }

    const [srsState, setSrsState] = useState<Record<string, ReviewItem>>(getStoredState)
    const [queue, setQueue] = useState<typeof vocabData['cards']>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [sessionStats, setSessionStats] = useState({ reviewed: 0 })

    const [stats, setStats] = useState({
        total: 0,
        box0: 0, // New
        box1: 0, // < 3 days
        box2: 0, // 3-10 days
        box3: 0, // > 10 days
        due: 0
    })

    // Initialize Queue: Find items due for review
    useEffect(() => {
        const now = Date.now()
        const totalCards = vocabData.cards.length
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0
        let dueCardsCount = 0

        const dueCards = vocabData.cards.filter(card => {
            const state = srsState[card.id]

            // Box Calc
            if (!state) {
                b0++
            } else {
                if (state.interval < 3) b1++
                else if (state.interval <= 10) b2++
                else b3++
            }

            // Due Calc
            if (!state) return true // New is always candidate for due
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

        // Limit session to 20 cards to keep it bite-sized
        setQueue(dueCards.slice(0, 20))
    }, []) // Run once on mount

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
        localStorage.setItem('srs_state_eng_400', JSON.stringify(updatedSrsState))

        setSessionStats(prev => ({ reviewed: prev.reviewed + 1 }))

        // Simple Optimistic Update for UI Feedback (perfect sync happens on next load/effect)
        setStats(prev => {
            // Decrement due count
            const newDue = Math.max(0, prev.due - 1)

            // Very rough box shift for visual pleasure:
            // This isn't perfectly accurate without knowing source box, but good enough for feedback.
            // If quality > 3, we assume progress.
            // We just update the 'Due' number primarily.
            return { ...prev, due: newDue }
        })

        // Move to next
        setIsFlipped(false)
        setTimeout(() => setCurrentCardIndex(prev => prev + 1), 200)
    }

    if (queue.length === 0 && currentCardIndex === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
                <div className="flex gap-2 my-8 justify-center w-full max-w-sm">
                    {/* Mini Box View for Summary */}
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-gray-500">New</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{stats.box0}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-orange-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-orange-600">Learn</span>
                        <span className="font-bold text-orange-700 dark:text-orange-300">{stats.box1}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-blue-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-blue-600">Review</span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">{stats.box2}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-green-50 rounded dark:bg-slate-800 flex-1">
                        <span className="text-xs text-green-600">Master</span>
                        <span className="font-bold text-green-700 dark:text-green-300">{stats.box3}</span>
                    </div>
                </div>
                <p className="text-gray-500 mb-6">No cards due for review right now.</p>
                <button onClick={onComplete} className="bg-sky-500 text-white px-6 py-2 rounded-full hover:bg-sky-600">
                    Back to Curriculum
                </button>
            </div>
        )
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <BrainCircuit className="w-16 h-16 text-sky-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
                <p className="text-gray-500 mb-6">You reviewed {sessionStats.reviewed} cards.</p>
                <button onClick={() => window.location.reload()} className="bg-sky-500 text-white px-6 py-2 rounded-full hover:bg-sky-600">
                    Continue Learning
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 min-h-[60vh]">

            {/* Dashboard: Leitner Boxes */}
            <div className="w-full mb-6">
                <div className="flex justify-between items-end mb-2 px-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Progress</span>
                    <div className="group relative flex items-center gap-1 text-[10px] text-gray-400 cursor-help">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        Local Data
                        <div className="absolute top-full right-0 mt-1 w-48 bg-gray-800 text-white p-2 rounded text-xs z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Saved in this browser.
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-1 h-16 w-full">
                    {/* Box 0: New */}
                    <div className="flex flex-col justify-end bg-gray-100 dark:bg-slate-800 rounded-lg relative overflow-hidden group">
                        <div
                            className="bg-gray-300 dark:bg-gray-600 absolute bottom-0 left-0 right-0 transition-all duration-500"
                            style={{ height: `${(stats.box0 / stats.total) * 100}%` }}
                        ></div>
                        <div className="relative z-10 p-1 text-center">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 block">{stats.box0}</span>
                            <span className="text-[9px] text-gray-500 uppercase">New</span>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            Box 0: Unseen
                        </div>
                    </div>

                    {/* Box 1: Learning (< 3d) */}
                    <div className="flex flex-col justify-end bg-orange-50 dark:bg-slate-800/50 rounded-lg relative overflow-hidden group">
                        <div
                            className="bg-orange-200 dark:bg-orange-900/50 absolute bottom-0 left-0 right-0 transition-all duration-500"
                            style={{ height: `${(stats.box1 / stats.total) * 100}%` }}
                        ></div>
                        <div className="relative z-10 p-1 text-center">
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 block">{stats.box1}</span>
                            <span className="text-[9px] text-orange-600/70 dark:text-orange-400/70 uppercase">Learn</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            Box 1: &lt; 3 Days
                        </div>
                    </div>

                    {/* Box 2: Review (3-10d) */}
                    <div className="flex flex-col justify-end bg-blue-50 dark:bg-slate-800/50 rounded-lg relative overflow-hidden group">
                        <div
                            className="bg-blue-200 dark:bg-blue-900/50 absolute bottom-0 left-0 right-0 transition-all duration-500"
                            style={{ height: `${(stats.box2 / stats.total) * 100}%` }}
                        ></div>
                        <div className="relative z-10 p-1 text-center">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block">{stats.box2}</span>
                            <span className="text-[9px] text-blue-600/70 dark:text-blue-400/70 uppercase">Review</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            Box 2: 3-10 Days
                        </div>
                    </div>

                    {/* Box 3: Mastered (>10d) */}
                    <div className="flex flex-col justify-end bg-green-50 dark:bg-slate-800/50 rounded-lg relative overflow-hidden group">
                        <div
                            className="bg-green-200 dark:bg-green-900/50 absolute bottom-0 left-0 right-0 transition-all duration-500"
                            style={{ height: `${(stats.box3 / stats.total) * 100}%` }}
                        ></div>
                        <div className="relative z-10 p-1 text-center">
                            <span className="text-xs font-bold text-green-700 dark:text-green-400 block">{stats.box3}</span>
                            <span className="text-[9px] text-green-600/70 dark:text-green-400/70 uppercase">Master</span>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            Box 3: &gt; 10 Days
                        </div>
                    </div>
                </div>

                {/* Due Indicator */}
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-400">
                        Today's Mission: <strong className="text-sky-500">{stats.due}</strong> cards left
                    </span>
                </div>
            </div>


            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6 dark:bg-gray-700 overflow-hidden">
                <div
                    className="h-full bg-sky-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentCardIndex) / queue.length) * 100}%` }}
                />
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
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{currentCard.front}</h2>
                        <p className="text-gray-400 text-sm mt-4 italic">Tap to flip</p>
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
                        <h2 className="text-3xl font-bold text-sky-700 dark:text-sky-300">{currentCard.back}</h2>
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
                        Show Answer
                    </button>
                ) : (
                    <>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(1)} className="w-full bg-red-100 text-red-700 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-200">Again</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                Did not know it. Review &lt; 1 min.
                            </div>
                        </div>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(3)} className="w-full bg-orange-100 text-orange-700 border border-orange-200 py-3 rounded-xl font-bold hover:bg-orange-200">Hard</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                Correct but slow/unsure.
                            </div>
                        </div>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(4)} className="w-full bg-blue-100 text-blue-700 border border-blue-200 py-3 rounded-xl font-bold hover:bg-blue-200">Good</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                Correct with some effort.
                            </div>
                        </div>
                        <div className="group relative col-span-1">
                            <button onClick={() => handleRate(5)} className="w-full bg-green-100 text-green-700 border border-green-200 py-3 rounded-xl font-bold hover:bg-green-200">Easy</button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                                Instant recall. Perfect.
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
