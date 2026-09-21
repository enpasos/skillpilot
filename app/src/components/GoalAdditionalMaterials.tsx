import { useEffect, useState } from 'react'
import { BookOpen, Link as LinkIcon, SlidersHorizontal } from 'lucide-react'
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
    <section aria-label={de ? 'Materialien zu diesem Lernziel' : 'Materials for this learning goal'} className="mt-4">
      <ul>
        {materials.map((item) => {
          const Icon = item.resourceType === 'article' ? BookOpen
            : item.resourceType === 'simulation' ? SlidersHorizontal : LinkIcon
          const typeLabel = item.resourceType === 'article' ? (de ? 'Artikel' : 'Article')
            : item.resourceType === 'simulation' ? 'Simulation' : (de ? 'Lernmaterial' : 'Learning material')

          return (
            <li key={item.url}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" title={typeLabel} className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm py-2 font-medium text-sky-700 underline underline-offset-2 hover:text-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:text-sky-300">
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="min-w-0 [overflow-wrap:anywhere]">
                  <span className="sr-only">{typeLabel}: </span>
                  {item.title}<span className="sr-only"> ({de ? 'externe Seite, neuer Tab' : 'external website, new tab'})</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
