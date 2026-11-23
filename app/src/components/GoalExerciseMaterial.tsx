import type { MapPracticeExercise } from './learningUnitMap/types'

export function GoalExerciseMaterial({ exercise, language }: {
  exercise: MapPracticeExercise
  language: 'de' | 'en'
}) {
  const english = language === 'en'
  return <details className="mt-3 text-sm text-text-primary">
    <summary className="cursor-pointer font-semibold">{exercise.title}</summary>
    <p className="mt-2 whitespace-pre-line">{exercise.prompt}</p>
    {!!exercise.evidenceCriteria?.length && <section className="mt-3">
      <h3 className="font-semibold">{english ? 'Criteria for your evidence' : 'Kriterien für deinen Nachweis'}</h3>
      <ul className="list-disc ps-5">{exercise.evidenceCriteria.map(criterion => <li key={criterion}>{criterion}</li>)}</ul>
    </section>}
    <details className="mt-2"><summary>{english ? 'Show a hint' : 'Hinweis anzeigen'}</summary><p>{exercise.hint}</p></details>
    <details className="mt-2"><summary>{english ? 'Compare your solution' : 'Lösung vergleichen'}</summary><p>{exercise.solution}</p></details>
  </details>
}
