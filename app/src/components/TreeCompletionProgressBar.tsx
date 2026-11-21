import React from 'react'
import { Check, Minus } from 'lucide-react'
import type { TreeCompletionProgress } from '../utils/treeCompletionProgress'
import { completionLabel } from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'
import { TreeStatusTooltip } from './TreeStatusTooltip'

/** Completion is a display projection; this component never changes a goal's mastery. */
export function TreeCompletionProgressBar({ progress, title, language, sectionTitle }: {
  progress: TreeCompletionProgress
  title: string
  language: 'de' | 'en'
  sectionTitle?: Record<string, string>
}): React.ReactElement {
  const { totalCount, explicitCount, implicitCount, notRequiredCount, openCount, explicitRatio, implicitRatio } = progress
  const completedCount = explicitCount + implicitCount
  const completedRatio = Math.min(1, explicitRatio + implicitRatio)
  // Reserve 100% for complete sets, including when a very small open weight remains.
  const percentage = totalCount > 0 && completedCount === totalCount
    ? 100 : Math.min(99.9, Math.round(completedRatio * 1000) / 10)
  const percentLabel = new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(percentage)
  const heading = totalCount === 0
    ? (language === 'de' ? 'Keine Lernziele in dieser Ansicht' : 'No learning goals in this view')
    : (language === 'de'
      ? `${completedCount} von ${totalCount} Lernzielen mit Nachweis`
      : `${completedCount} of ${totalCount} learning goals with evidence`)
  const explicitLabel = language === 'de' ? `${explicitCount} direkt nachgewiesen` : `${explicitCount} directly demonstrated`
  const implicitLabel = language === 'de' ? `${implicitCount} fachlich angerechnet` : `${implicitCount} credited through assessment`
  const notRequiredLabel = language === 'de' ? `${notRequiredCount} für diesen Abschnitt nicht mehr erforderlich` : `${notRequiredCount} no longer required for this section`
  const openLabel = language === 'de' ? `${openCount} offen` : `${openCount} open`
  const weightedLabel = language === 'de'
    ? `Gewichteter Anteil mit Nachweis: ${percentLabel} %`
    : `Weighted share with evidence: ${percentLabel}%`
  const scope = (implicitCount > 0 || notRequiredCount > 0) && sectionTitle ? completionLabel(sectionTitle, language) : undefined
  const scopeLabel = scope ? `${language === 'de' ? 'Geltungsbereich' : 'Scope'}: ${scope}` : ''

  return <TreeStatusTooltip
    label={[title, heading, explicitLabel, implicitLabel, notRequiredLabel, openLabel, weightedLabel, scopeLabel].filter(Boolean).join('. ')}
    testId="completion-tree-progress"
    triggerClassName="flex h-6 w-12 shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
    content={<>
      <p className="font-semibold"><InlineMathText text={title} /></p>
      <p className="mt-2 font-semibold">{heading}</p>
      <ul className="mt-2 space-y-1">
        <li className="flex items-center gap-2"><Check aria-hidden="true" size={14} strokeWidth={3} className="shrink-0 text-emerald-600 dark:text-emerald-400" />{explicitLabel}</li>
        <li className="flex items-center gap-2"><Check aria-hidden="true" size={14} strokeWidth={3} className="shrink-0 text-neutral-600 dark:text-neutral-400" />{implicitLabel}</li>
        <li className="flex items-center gap-2"><Minus aria-hidden="true" size={14} className="shrink-0 text-neutral-600 dark:text-neutral-400" />{notRequiredLabel}</li>
        <li className="flex items-center gap-2"><span aria-hidden="true" className="mx-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />{openLabel}</li>
      </ul>
      {totalCount > 0 && <p className="mt-2">{weightedLabel}</p>}
      {scope && <p className="mt-2"><InlineMathText text={scopeLabel} /></p>}
    </>}
  >
    <span aria-hidden="true" className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <span data-testid="completion-tree-progress-explicit" className="h-full shrink-0 bg-emerald-500" style={{ width: `${explicitRatio * 100}%` }} />
      <span data-testid="completion-tree-progress-implicit" className="h-full shrink-0 bg-neutral-500 dark:bg-neutral-400" style={{ width: `${implicitRatio * 100}%` }} />
    </span>
  </TreeStatusTooltip>
}
