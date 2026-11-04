import { useEffect, useState } from 'react'
import type { GoalBookApplicabilityScope, GoalBookRuntimeModel } from '../utils/goalBookRuntime'
import {
  goalBookOriginalSourcesTupleKey,
  loadGoalBookOriginalSources,
  type GoalBookOriginalSource,
  type ParsedGoalBookOriginalSources,
} from '../utils/goalBookOriginalSources'

const copy = {
  de: {
    loading: 'Quellen werden geladen …', unavailable: 'Quellenangaben derzeit nicht verfügbar.',
    empty: 'Keine Originalquelle für diese Geltungszeile zugeordnet.',
    direct: 'Direkt zugeordnet', inherited: 'Über Themenbereich zugeordnet', context: 'Nur Quellenkontext',
    contextHint: 'Die vorhandene Zuordnung belegt nicht jedes Merkmal dieser Geltungszeile gesondert.',
    dimensions: 'In den erfassten Quellenangaben nicht differenziert', stage: 'Stufe', durationModel: 'G8/G9', courseProfile: 'Kursprofil',
    more: 'Weitere Belege', locator: 'Fundstelle',
  },
  en: {
    loading: 'Loading sources …', unavailable: 'Source information is currently unavailable.',
    empty: 'No original source assigned to this applicability row.',
    direct: 'Directly mapped', inherited: 'Mapped through a topic area', context: 'Source context only',
    contextHint: 'The existing mapping does not separately establish every dimension of this applicability row.',
    dimensions: 'Not distinguished in the recorded source metadata', stage: 'stage', durationModel: 'G8/G9', courseProfile: 'course profile',
    more: 'More references', locator: 'Location',
  },
} as const

const Source = ({ source, language }: { source: GoalBookOriginalSource; language: 'de' | 'en' }) => {
  const c = copy[language]
  return (
    <div className="space-y-1 break-words">
      <a href={source.document.url} target="_blank" rel="noopener noreferrer"
        className="font-semibold text-sky-800 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-sky-200">
        {source.document.title}
      </a>
      <p><span className="font-medium">{c.locator}:</span> {source.sourceRef}</p>
      <p className="text-text-secondary">{c[source.kind]}</p>
      {source.scopeMatch === 'source-context' && (
        <p className="text-text-secondary">
          <span className="font-medium">{c.context}.</span> {c.contextHint}{source.unspecifiedDimensions.length > 0 && (
            <> {c.dimensions}: {source.unspecifiedDimensions.map((dimension) => c[dimension]).join(', ')}.</>
          )}
        </p>
      )}
    </div>
  )
}

/** A matrix cell; all cells share the bounded, book-digest-keyed public metadata request. */
export const GoalBookOriginalSources = ({
  model, goalId, jurisdiction, scope, active, language,
}: {
  model: GoalBookRuntimeModel
  goalId: string
  jurisdiction: string
  scope: GoalBookApplicabilityScope
  active: boolean
  language: 'de' | 'en'
}) => {
  const [result, setResult] = useState<{
    binding: string
    index: ParsedGoalBookOriginalSources | null
  } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const binding = `${model.book.id}:${model.digest}`
  useEffect(() => {
    if (!active) return
    let current = true
    void loadGoalBookOriginalSources(model).then(
      (index) => { if (current) setResult({ binding, index }) },
      () => { if (current) setResult({ binding, index: null }) },
    )
    return () => { current = false }
  }, [active, binding, model])
  const c = copy[language]
  const loaded = result?.binding === binding ? result : null
  if (!active) return null
  if (!loaded) return <p className="text-text-secondary" role="status">{c.loading}</p>
  if (!loaded.index) return <p className="text-text-secondary">{c.unavailable}</p>
  const sources = loaded.index.byTuple.get(goalBookOriginalSourcesTupleKey(goalId, jurisdiction, scope)) ?? []
  if (sources.length === 0) return <p className="text-text-secondary">{c.empty}</p>
  return (
    <div className="min-w-48 max-w-sm space-y-2">
      <Source source={sources[0]} language={language} />
      {sources.length > 1 && (
        <details onToggle={(event) => setExpanded(event.currentTarget.open)}>
          <summary className="cursor-pointer py-2 font-semibold text-sky-800 dark:text-sky-200">
            {c.more} ({sources.length - 1})
          </summary>
          {expanded && <ul className="space-y-3 pt-1">
            {sources.slice(1).map((source) => (
              <li key={source.id}><Source source={source} language={language} /></li>
            ))}
          </ul>}
        </details>
      )}
    </div>
  )
}
