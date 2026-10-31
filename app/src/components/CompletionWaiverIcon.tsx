import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { completionLabel, type CompletionTreeWaiver } from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'
import { TreeStatusTooltip } from './TreeStatusTooltip'

/** A scope-specific waiver occupies the ordinary status slot, without changing mastery. */
export function CompletionWaiverIcon({ waiver, language }: {
  waiver: CompletionTreeWaiver
  language: 'de' | 'en'
}): React.ReactElement {
  const implicit = waiver.reason === 'no_remaining_demand'
  const label = implicit
    ? (language === 'en' ? 'No longer required for this section' : 'Für diesen Abschnitt nicht mehr erforderlich')
    : (language === 'en' ? 'Covered by assessment for this section' : 'Für diesen Abschnitt durch Prüfung abgedeckt')
  return <TreeStatusTooltip
    label={label}
    testId="completion-tree-waiver"
    triggerClassName="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-sky-600 dark:text-sky-400 before:absolute before:-inset-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
    content={<>
        <p className="font-semibold text-sky-700 dark:text-sky-300">{label}</p>
        <p className="mt-2">{language === 'en' ? 'Section: ' : 'Lernabschnitt: '}
          <InlineMathText text={completionLabel(waiver.sectionTitle, language)} />
        </p>
        {!implicit && waiver.assessments.length > 0 && <p className="mt-2">
          {language === 'en' ? 'Passed assessments: ' : 'Bestandene Prüfungen: '}
          <InlineMathText text={waiver.assessments.map(a => completionLabel(a.title, language)).join('; ')} />
          {(waiver.assessmentCount ?? 0) > waiver.assessments.length
            ? (language === 'en'
              ? ` (+${waiver.assessmentCount! - waiver.assessments.length} more)`
              : ` (+${waiver.assessmentCount! - waiver.assessments.length} weitere)`)
            : null}
        </p>}
        <p className="mt-2">{implicit
          ? (language === 'en'
            ? 'No remaining work needs this goal in this section. This goal is implicitly completed here; its saved learning result stays unchanged. You can still choose to study it.'
            : 'In diesem Abschnitt benötigt keine verbleibende Arbeit dieses Ziel mehr. Das Ziel ist hier implizit erledigt; sein gespeicherter Lernstand bleibt unverändert. Du kannst es weiterhin freiwillig bearbeiten.')
          : (language === 'en'
            ? 'Separate preparation is no longer required for this section. This goal keeps its existing learning result and remains available to learn voluntarily.'
            : 'Die separate Vorbereitung entfällt für diesen Abschnitt. Der Lernstand dieses Ziels bleibt unverändert; du kannst es weiterhin freiwillig bearbeiten.')}</p>
    </>}
  >
    <ShieldCheck size={16} strokeWidth={2.5} aria-hidden="true" />
  </TreeStatusTooltip>
}
