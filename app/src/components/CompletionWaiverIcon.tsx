import React from 'react'
import { Minus, ShieldCheck } from 'lucide-react'
import { completionLabel, type CompletionTreeWaiver } from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'
import { TreeStatusTooltip } from './TreeStatusTooltip'

/** A scope-specific waiver occupies the ordinary status slot, without changing mastery. */
export function CompletionWaiverIcon({ waiver, language, surface = 'tree' }: {
  waiver: CompletionTreeWaiver
  language: 'de' | 'en'
  surface?: 'tree' | 'goal-card'
}): React.ReactElement {
  const credited = waiver.reason === 'assessment'
  const en = language === 'en'
  const label = credited
    ? (en ? 'Credited through assessment' : 'Fachlich angerechnet')
    : (en ? 'No longer required for this assignment' : 'Für diesen Auftrag nicht mehr erforderlich')
  const Icon = credited ? ShieldCheck : Minus
  return <TreeStatusTooltip
    label={label}
    testId={`completion-${surface}-waiver`}
    triggerClassName={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm ${credited ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'} before:absolute before:-inset-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2`}
    content={<>
        <p className="font-semibold">{label}</p>
        <p className="mt-2">{language === 'en' ? 'Section: ' : 'Lernabschnitt: '}
          <InlineMathText text={completionLabel(waiver.sectionTitle, language)} />
        </p>
        {waiver.reason !== 'no_remaining_demand' && waiver.assessments.length > 0 && <p className="mt-2">
          {language === 'en' ? 'Passed assessments: ' : 'Bestandene Prüfungen: '}
          <InlineMathText text={waiver.assessments.map(a => completionLabel(a.title, language)).join('; ')} />
          {(waiver.assessmentCount ?? 0) > waiver.assessments.length
            ? (language === 'en'
              ? ` (+${waiver.assessmentCount! - waiver.assessments.length} more)`
              : ` (+${waiver.assessmentCount! - waiver.assessments.length} weitere)`)
            : null}
        </p>}
        <p className="mt-2">{credited
          ? (en ? 'Passed assessments provide evidence for this goal in your learning plan. You can also practise it individually.'
            : 'Bestandene Prüfungen belegen dieses Ziel für deinen Lernplan. Du kannst es auch einzeln bearbeiten.')
          : (en ? 'You can still study this goal and earn individual evidence.'
            : 'Du kannst dieses Ziel weiterhin bearbeiten und einen eigenen Nachweis erwerben.')}</p>
    </>}
  >
    <Icon data-testid={`completion-${surface}-${credited ? 'credited-evidence' : 'not-required'}`} size={16} strokeWidth={2.5} aria-hidden="true" />
  </TreeStatusTooltip>
}
