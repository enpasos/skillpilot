import { useEffect, useState } from 'react'
import { getGoalAdditionalMaterials, type MaterialLanguage, type ResolvedMaterial } from '../utils/contentMaterialsApi'

interface Props {
  skillpilotId: string
  goalId: string
  language: MaterialLanguage
  refreshKey: number
}

export const GoalAdditionalMaterials = (props: Props) => (
  <ScopedGoalAdditionalMaterials key={`${props.skillpilotId}:${props.goalId}:${props.language}:${props.refreshKey}`} {...props} />
)

const ScopedGoalAdditionalMaterials = ({ skillpilotId, goalId, language }: Props) => {
  const [materials, setMaterials] = useState<ResolvedMaterial[]>([])
  const de = language === 'de'
  useEffect(() => {
    const controller = new AbortController()
    void getGoalAdditionalMaterials(skillpilotId, goalId, language, { signal: controller.signal })
      .then((value) => { if (!controller.signal.aborted) setMaterials(value) })
      .catch(() => { /* Supplementary links must never prevent ordinary learning. */ })
    return () => controller.abort()
  }, [skillpilotId, goalId, language])
  if (!materials.length) return null

  return (
    <section aria-label={de ? 'Materialien zu diesem Lernziel' : 'Materials for this learning goal'} className="mt-4 rounded-xl border border-border-color bg-sidebar-bg p-4">
      <h2 className="font-semibold">{de ? 'Passende Materialien aus deiner Auswahl' : 'Relevant materials from your selection'}</h2>
      <ul className="mt-3 space-y-3">
        {materials.map((item) => (
          <li key={item.url} className="break-words">
            <a href={item.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="inline-flex min-h-11 items-center font-medium text-sky-700 underline underline-offset-2 hover:text-sky-500 dark:text-sky-300">
              {item.title}<span className="sr-only"> ({de ? 'externe Seite, neuer Tab' : 'external website, new tab'})</span>
            </a>
            <p className="text-xs text-text-secondary">
              {item.provider} · {item.language === 'de' ? (de ? 'Deutsch' : 'German') : item.language === 'en' ? (de ? 'Englisch' : 'English') : item.language}
              {item.sections.length > 0 ? ` · ${item.sections.join(' · ')}` : ''}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-text-secondary">{de ? 'Optionale externe Materialien. Beim Öffnen gelten die Bedingungen des Anbieters.' : 'Optional external materials. The provider’s terms apply when you open a link.'}</p>
    </section>
  )
}
