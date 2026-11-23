import React from 'react'
import { Check } from 'lucide-react'
import { completionLabel, type CompletionTreeWaiver } from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'
import { TreeStatusTooltip } from './TreeStatusTooltip'

/** An assessment credit explains the gray check without changing individual mastery. */
export function CompletionWaiverIcon({ waiver, language, surface = 'tree' }: {
  waiver: CompletionTreeWaiver
  language: 'de' | 'en'
  surface?: 'tree' | 'goal-card'
}): React.ReactElement | null {
  if (waiver.reason !== 'assessment') return null
  const en = language === 'en'
  const label = en ? 'Credited through assessment' : 'Fachlich angerechnet'
  return <TreeStatusTooltip
    label={label}
    testId={`completion-${surface}-waiver`}
    triggerClassName={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-neutral-600 dark:text-neutral-400 before:absolute before:-inset-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2`}
    content={<>
        <p className="font-semibold">{label}</p>
        <p className="mt-2">{language === 'en' ? 'Section: ' : 'Lernabschnitt: '}
          <InlineMathText text={completionLabel(waiver.sectionTitle, language)} />
        </p>
        {waiver.assessments.length > 0 && <p className="mt-2">
          {language === 'en' ? 'Passed assessments: ' : 'Bestandene Prüfungen: '}
          <InlineMathText text={waiver.assessments.map(a => completionLabel(a.title, language)).join('; ')} />
          {(waiver.assessmentCount ?? 0) > waiver.assessments.length
            ? (language === 'en'
              ? ` (+${waiver.assessmentCount! - waiver.assessments.length} more)`
              : ` (+${waiver.assessmentCount! - waiver.assessments.length} weitere)`)
            : null}
        </p>}
        <p className="mt-2">{en
          ? 'Passed assessments provide evidence for this goal in your learning plan. You can also practise it individually.'
          : 'Bestandene Prüfungen belegen dieses Ziel für deinen Lernplan. Du kannst es auch einzeln bearbeiten.'}</p>
    </>}
  >
    <Check data-testid={`completion-${surface}-credited-evidence`} size={16} strokeWidth={3} aria-hidden="true" />
  </TreeStatusTooltip>
}
