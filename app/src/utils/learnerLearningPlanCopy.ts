import type { LabelLanguage } from './filterLabels'

export interface LearnerLearningPlanCopy {
  todayTitle: string
  currentSubjectBadge: string
  currentGoalLabel: string
  continueLearningAction: string
  switchSubjectAction: (subject: string) => string
  switchBusy: string
  preparingNextGoal: string
  detailsAction: string
  switchFailed: string
  reconcileFailed: string
  planPeriodLabel: string
  currentBlockLabel: string
  noCurrentBlock: string
  nextEligibleGoalLabel: string
  nextEligibleGoalTitleUnavailable: string
  nextMilestoneLabel: string
  noNextMilestone: string
  bufferLabel: string
  bufferValue: (remaining: number, total: number) => string
  planModeOffTitle: string
  planModeOffBody: string
  openSettingsAction: string
  noPlansTitle: string
  noPlansBody: string
  loadFailed: string
  loading: string
  retryAction: string
  continueConflict: string
  staleData: (date: string) => string
}

export const getLearnerLearningPlanCopy = (
  language: LabelLanguage,
): LearnerLearningPlanCopy => language === 'de'
  ? {
      todayTitle: 'Heute',
      currentSubjectBadge: 'Aktuelles Fach',
      currentGoalLabel: 'Du lernst gerade',
      continueLearningAction: 'Weiterlernen',
      switchSubjectAction: (subject) => `Zu ${subject} wechseln`,
      switchBusy: 'Fach wird gewechselt …',
      preparingNextGoal: 'SkillPilot wählt dein nächstes fälliges Lernziel aus …',
      detailsAction: 'Plandetails',
      switchFailed: 'Das Fach konnte nicht gewechselt werden. Dein bisheriges Lernziel bleibt erhalten.',
      reconcileFailed: 'Das nächste Planziel konnte nicht automatisch ausgewählt werden. Dein Lernstand blieb unverändert.',
      planPeriodLabel: 'Planzeitraum',
      currentBlockLabel: 'Aktueller Planabschnitt',
      noCurrentBlock: 'Für heute ist kein Lernabschnitt aktiv.',
      nextEligibleGoalLabel: 'Als Nächstes möglich',
      nextEligibleGoalTitleUnavailable: 'Das nächste zulässige Planziel steht bereit.',
      nextMilestoneLabel: 'Nächster Termin',
      noNextMilestone: 'Kein weiterer Termin geplant.',
      bufferLabel: 'Puffer',
      bufferValue: (remaining, total) => `${remaining} von ${total} Werktagen verbleiben`,
      planModeOffTitle: 'Planmodus ist ausgeschaltet',
      planModeOffBody: 'Der Plan bleibt sichtbar. Aktiviere „Nach Plan lernen“ in den Einstellungen, damit SkillPilot das nächste fällige Ziel auswählen kann.',
      openSettingsAction: 'Einstellungen öffnen',
      noPlansTitle: 'Noch kein persönlicher Fachplan vorhanden',
      noPlansBody: '„Nach Plan lernen“ ist aktiv. Ohne Fachplan startet SkillPilot kein Lernziel automatisch; du kannst weiterhin selbst ein Ziel aus deiner Lernzielübersicht auswählen.',
      loadFailed: 'Deine Fachpläne konnten gerade nicht geladen werden.',
      loading: 'Fachpläne werden geladen …',
      retryAction: 'Erneut versuchen',
      continueConflict: 'Der Fachplan wurde inzwischen geändert. Bitte prüfe den aktuellen Stand.',
      staleData: (date) => `Aktualisierung fehlgeschlagen. Angezeigt wird der letzte Stand vom ${date}; Planaktionen sind bis zum erneuten Laden gesperrt.`,
    }
  : {
      todayTitle: 'Today',
      currentSubjectBadge: 'Current subject',
      currentGoalLabel: 'You are learning',
      continueLearningAction: 'Continue learning',
      switchSubjectAction: (subject) => `Switch to ${subject}`,
      switchBusy: 'Switching subject…',
      preparingNextGoal: 'SkillPilot is selecting your next due learning goal…',
      detailsAction: 'Plan details',
      switchFailed: 'The subject could not be switched. Your previous learning goal remains unchanged.',
      reconcileFailed: 'The next planned goal could not be selected automatically. Your learning state was not changed.',
      planPeriodLabel: 'Plan period',
      currentBlockLabel: 'Current plan block',
      noCurrentBlock: 'No learning block is active today.',
      nextEligibleGoalLabel: 'Next available',
      nextEligibleGoalTitleUnavailable: 'The next eligible planned goal is ready.',
      nextMilestoneLabel: 'Next milestone',
      noNextMilestone: 'No further milestone is scheduled.',
      bufferLabel: 'Buffer',
      bufferValue: (remaining, total) => `${remaining} of ${total} weekdays remaining`,
      planModeOffTitle: 'Plan mode is off',
      planModeOffBody: 'The plan remains visible. Enable “Learn according to plan” in settings so SkillPilot can select the next due goal.',
      openSettingsAction: 'Open settings',
      noPlansTitle: 'No personal subject plan yet',
      noPlansBody: '“Learn according to plan” is enabled. Without a subject plan, SkillPilot does not start a goal automatically; you can still select a goal yourself from your learning-goal overview.',
      loadFailed: 'Your subject plans could not be loaded right now.',
      loading: 'Loading subject plans…',
      retryAction: 'Try again',
      continueConflict: 'The subject plan changed in the meantime. Please review its current state.',
      staleData: (date) => `The refresh failed. This is the last status from ${date}; plan actions are locked until it reloads.`,
    }
