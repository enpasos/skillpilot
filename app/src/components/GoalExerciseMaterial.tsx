import type { MapPracticeExercise } from './learningUnitMap/types'
import { MathText } from './MathText'

export function GoalExerciseMaterial({ exercise, language }: {
  exercise: MapPracticeExercise
  language: 'de' | 'en'
}) {
  const english = language === 'en'
  return <details className="mt-3 text-sm text-text-primary">
    <summary className="cursor-pointer font-semibold"><MathText text={exercise.title} /></summary>
    <p className="mt-2 whitespace-pre-line"><MathText text={exercise.prompt} /></p>
    {!!exercise.evidenceCriteria?.length && <section className="mt-3">
      <h3 className="font-semibold">{english ? 'Criteria for your evidence' : 'Kriterien für deinen Nachweis'}</h3>
      <ul className="list-disc ps-5">{exercise.evidenceCriteria.map(criterion => <li key={criterion}><MathText text={criterion} /></li>)}</ul>
    </section>}
    <details className="mt-2"><summary>{english ? 'Show a hint' : 'Hinweis anzeigen'}</summary><p className="whitespace-pre-line"><MathText text={exercise.hint} /></p></details>
    <details className="mt-2"><summary>{english ? 'Compare your solution' : 'Lösung vergleichen'}</summary><p className="whitespace-pre-line"><MathText text={exercise.solution} /></p></details>
  </details>
}
