import { FlashcardMarkdown } from './FlashcardMarkdown'

interface FlashcardFlipCardProps {
  category: string
  front: string
  back: string
  isFlipped: boolean
  onFlip: () => void
  tapToFlipText: string
}

export function FlashcardFlipCard({
  category,
  front,
  back,
  isFlipped,
  onFlip,
  tapToFlipText,
}: FlashcardFlipCardProps) {
  return (
    <div className="relative w-full aspect-[4/3]" style={{ perspective: '1000px' }}>
      <div
        className="w-full h-full relative cursor-pointer"
        onClick={onFlip}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="absolute inset-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <span className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">{category}</span>
          <FlashcardMarkdown
            content={front}
            className="w-full text-center text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center"
          />
          <p className="text-gray-400 text-sm mt-4 italic">{tapToFlipText}</p>
        </div>

        <div
          className="absolute inset-0 bg-sky-50 dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-sky-200 dark:border-sky-900 flex flex-col items-center justify-center p-6 text-center"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <FlashcardMarkdown
            content={back}
            className="w-full text-center text-base md:text-lg font-bold text-sky-700 dark:text-sky-300 flex flex-col items-center justify-center"
          />
        </div>
      </div>
    </div>
  )
}
