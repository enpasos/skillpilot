import type { MapPracticeExercise } from './learningUnitMap/types'
import { InlineMathText } from './InlineMathText'
import { FlashcardMarkdown } from './srs/FlashcardMarkdown'

export function GoalExerciseMaterial({ exercise, language }: {
  exercise: MapPracticeExercise
  language: 'de' | 'en'
}) {
  const english = language === 'en'
  return <details className="mt-3 text-sm text-text-primary">
    <summary className="cursor-pointer font-semibold"><InlineMathText text={exercise.title} /></summary>
    <FlashcardMarkdown className="mt-2" content={exercise.prompt} />
    {!!exercise.evidenceCriteria?.length && <section className="mt-3">
      <h3 className="font-semibold">{english ? 'Criteria for your evidence' : 'Kriterien für deinen Nachweis'}</h3>
      <ul className="list-disc ps-5">{exercise.evidenceCriteria.map(criterion => <li key={criterion}><InlineMathText text={criterion} /></li>)}</ul>
    </section>}
    <details className="mt-2"><summary>{english ? 'Show a hint' : 'Hinweis anzeigen'}</summary><FlashcardMarkdown content={exercise.hint} /></details>
    <details className="mt-2"><summary>{english ? 'Compare your solution' : 'Lösung vergleichen'}</summary><FlashcardMarkdown content={exercise.solution} /></details>
  </details>
}
