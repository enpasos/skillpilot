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

    // Initialize Queue: Find items due for review
    useEffect(() => {
        const now = Date.now()
        const dueCards = vocabData.cards.filter(card => {
            const state = srsState[card.id]
            if (!state) return true // New card
            return state.nextReview <= now
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
        // Quality < 3 means "Again" (do it today/tomorrow depending on logic), 
        // but simple SM-2 says interval=1 day. 
        // Ideally "Again" puts it back in the queue for THIS session, but for PoC we just set it to tomorrow.
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

        // Move to next
        setIsFlipped(false)
        setTimeout(() => setCurrentCardIndex(prev => prev + 1), 200)
    }

    if (queue.length === 0 && currentCardIndex === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-[60vh]">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
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
                <button onClick={onComplete} className="bg-sky-500 text-white px-6 py-2 rounded-full hover:bg-sky-600">
                    Continue Learning
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 min-h-[60vh]">

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6 dark:bg-gray-700">
                <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
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
                        <button onClick={() => handleRate(1)} className="bg-red-100 text-red-700 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-200">Again</button>
                        <button onClick={() => handleRate(3)} className="bg-orange-100 text-orange-700 border border-orange-200 py-3 rounded-xl font-bold hover:bg-orange-200">Hard</button>
                        <button onClick={() => handleRate(4)} className="bg-blue-100 text-blue-700 border border-blue-200 py-3 rounded-xl font-bold hover:bg-blue-200">Good</button>
                        <button onClick={() => handleRate(5)} className="bg-green-100 text-green-700 border border-green-200 py-3 rounded-xl font-bold hover:bg-green-200">Easy</button>
                    </>
                )}
            </div>
        </div>
    )
}
