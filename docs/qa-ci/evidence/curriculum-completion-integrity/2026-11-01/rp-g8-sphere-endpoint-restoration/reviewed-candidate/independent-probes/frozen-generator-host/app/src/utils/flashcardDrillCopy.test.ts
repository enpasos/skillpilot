import {
  FLASHCARD_PRACTICE_QUALITY,
  getAdjacentFlashcardIndex,
  getFlashcardDrillCopy,
} from './flashcardDrillCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const assertEqual = <T>(actual: T, expected: T, message: string) => {
  assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, got ${String(actual)}`)
}

assertEqual(
  Object.keys(FLASHCARD_PRACTICE_QUALITY).sort().join(','),
  'known,not_known',
  'ordinary flashcard practice exposes exactly two ratings',
)
assertEqual(
  FLASHCARD_PRACTICE_QUALITY.not_known,
  1,
  'not-known maps to the conservative internal scheduling quality',
)
assertEqual(
  FLASHCARD_PRACTICE_QUALITY.known,
  4,
  'known maps to the successful internal scheduling quality',
)

const german = getFlashcardDrillCopy('de')
assertEqual(german.notKnown, 'Noch nicht gewusst', 'German not-known copy is learner-facing')
assertEqual(german.known, 'Gewusst', 'German known copy is learner-facing')
assertEqual(german.previousCard, 'Vorherige Karte', 'German previous-card copy is explicit')
assertEqual(german.nextCard, 'Nächste Karte', 'German next-card copy is explicit')
assertEqual(german.cardPosition(3, 20), 'Karte 3 von 20', 'German card position is visible')

const english = getFlashcardDrillCopy('en')
assertEqual(english.notKnown, 'Not yet', 'English not-known copy is learner-facing')
assertEqual(english.known, 'Got it', 'English known copy is learner-facing')
assertEqual(english.previousCard, 'Previous card', 'English previous-card copy is explicit')
assertEqual(english.nextCard, 'Next card', 'English next-card copy is explicit')
assertEqual(english.cardPosition(3, 20), 'Card 3 of 20', 'English card position is visible')

assertEqual(getAdjacentFlashcardIndex(1, 4, -1), 0, 'backward navigation selects the prior card')
assertEqual(getAdjacentFlashcardIndex(1, 4, 1), 2, 'forward navigation selects the next card')
assertEqual(getAdjacentFlashcardIndex(0, 4, -1), 0, 'backward navigation stops at the first card')
assertEqual(getAdjacentFlashcardIndex(3, 4, 1), 3, 'forward navigation stops at the last card')
assertEqual(getAdjacentFlashcardIndex(0, 0, 1), 0, 'empty queues keep a safe index')

console.log('flashcard drill copy and interaction contract tests passed')
