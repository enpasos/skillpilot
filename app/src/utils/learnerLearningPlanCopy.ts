import type { LabelLanguage } from './filterLabels'

export interface LearnerLearningPlanCopy {
  todayTitle: string
  todayOpen: (count: number) => string
  todayDone: string
  todayScope: (subjectCount: number) => string
  includesBacklog: string
  currentSubjectBadge: string
  currentGoalLabel: string
  continueLearningAction: string
  switchSubjectAction: (subject: string) => string
  switchBusy: string
  preparingNextGoal: string
  detailsAction: string
  openCount: (count: number) => string
  subjectDone: string
  subjectBlocked: string
  switchFailed: string
  reconcileFailed: string
  cardTitle: (subject: string) => string
  cardDescription: string
  planPeriodLabel: string
  currentBlockLabel: string
  noCurrentBlock: string
  dueThroughTodayLabel: string
  completedDueThroughTodayLabel: string
  openDueThroughTodayLabel: string
  dueTodayLabel: string
  completedDueTodayLabel: string
  openDueTodayLabel: string
  cumulativeProgress: (completed: number, due: number) => string
  backlogOpen: (count: number) => string
  nextEligibleGoalLabel: string
  nextEligibleGoalTitleUnavailable: string
  nextMilestoneLabel: string
  noNextMilestone: string
  bufferLabel: string
  bufferValue: (remaining: number, total: number) => string
  paceTitle: string
  paceUnavailableStatus: string
  paceHistoryUnavailable: string
  paceNeutral: string
  stalePlan: string
  planModeOffTitle: string
  planModeOffBody: string
  planModeOnTitle: string
  planModeOnBody: string
  openSettingsAction: string
  noPlansTitle: string
  noPlansBody: string
  continueAction: string
  continueBusy: string
  nothingDue: string
  dueGoalBlocked: string
  activeGoalInProgress: string
  loadFailed: string
  loading: string
  refreshing: string
  retryAction: string
  continueConflict: string
  continueFailed: string
  crossSubjectNavigationUnavailable: string
  staleData: (date: string) => string
}

export const getLearnerLearningPlanCopy = (
  language: LabelLanguage,
): LearnerLearningPlanCopy => language === 'de'
  ? {
      todayTitle: 'Heute',
      todayOpen: (count) => count === 1
        ? '1 Planziel ist bis heute noch offen.'
        : `${count} Planziele sind bis heute noch offen.`,
      todayDone: 'Für heute ist in deinen gültigen Fachplänen alles erledigt.',
      todayScope: (subjectCount) => subjectCount === 1
        ? '1 gültiger Fachplan'
        : `${subjectCount} gültige Fachpläne`,
      includesBacklog: 'Rückstände aus früheren Tagen sind mitgezählt.',
      currentSubjectBadge: 'Aktuelles Fach',
      currentGoalLabel: 'Du lernst gerade',
      continueLearningAction: 'Weiterlernen',
      switchSubjectAction: (subject) => `Zu ${subject} wechseln`,
      switchBusy: 'Fach wird gewechselt …',
      preparingNextGoal: 'SkillPilot wählt dein nächstes fälliges Lernziel aus …',
      detailsAction: 'Plandetails',
      openCount: (count) => count === 1 ? '1 Ziel offen' : `${count} Ziele offen`,
      subjectDone: 'Bis heute erledigt',
      subjectBlocked: 'Offen, aber Voraussetzungen fehlen noch',
      switchFailed: 'Das Fach konnte nicht gewechselt werden. Dein bisheriges Lernziel bleibt erhalten.',
      reconcileFailed: 'Das nächste Planziel konnte nicht automatisch ausgewählt werden. Dein Lernstand blieb unverändert.',
      cardTitle: (subject) => `Mein Plan für ${subject}`,
      cardDescription: 'Dein fachlicher Planstand bis einschließlich heute.',
      planPeriodLabel: 'Planzeitraum',
      currentBlockLabel: 'Aktueller Planabschnitt',
      noCurrentBlock: 'Für heute ist kein Lernabschnitt aktiv.',
      dueThroughTodayLabel: 'Fällig bis heute',
      completedDueThroughTodayLabel: 'Davon bereits beherrscht',
      openDueThroughTodayLabel: 'Noch offen',
      dueTodayLabel: 'Heute neu fällig',
      completedDueTodayLabel: 'Davon beherrscht',
      openDueTodayLabel: 'Heute noch offen',
      cumulativeProgress: (completed, due) => `Bis heute insgesamt: ${completed} von ${due} beherrscht`,
      backlogOpen: (count) => count === 1 ? '1 offenes Ziel aus früheren Tagen' : `${count} offene Ziele aus früheren Tagen`,
      nextEligibleGoalLabel: 'Als Nächstes möglich',
      nextEligibleGoalTitleUnavailable: 'Das nächste zulässige Planziel steht bereit.',
      nextMilestoneLabel: 'Nächster Termin',
      noNextMilestone: 'Kein weiterer Termin geplant.',
      bufferLabel: 'Puffer',
      bufferValue: (remaining, total) => `${remaining} von ${total} Werktagen verbleiben`,
      paceTitle: 'Tempo der letzten 7 Tage',
      paceUnavailableStatus: 'Noch nicht bewertbar',
      paceHistoryUnavailable: 'Der 7-Tage-Status bleibt neutral: Die vorhandene Lernstandshistorie belegt keine einzelnen Abschlüsse pro Tag.',
      paceNeutral: 'Der 7-Tage-Status dient derzeit nur als neutrale Orientierung.',
      stalePlan: 'Dieser Plan passt nach einer Personalisierungsänderung nicht mehr zum aktuellen Fachumfang. Lass ihn neu im Cockpit bereitstellen; bis dahin bleibt dein Fokus unverändert.',
      planModeOffTitle: 'Planmodus ist ausgeschaltet',
      planModeOffBody: 'Der Plan bleibt sichtbar. Aktiviere „Nach Plan lernen“ in den Einstellungen, damit SkillPilot das nächste fällige Ziel auswählen kann.',
      planModeOnTitle: 'Nach Plan lernen ist aktiv',
      planModeOnBody: 'SkillPilot wählt das erste fällige Ziel und führt dich danach automatisch weiter. Du kannst das Fach jederzeit mit einem Klick wechseln.',
      openSettingsAction: 'Einstellungen öffnen',
      noPlansTitle: 'Noch kein persönlicher Fachplan vorhanden',
      noPlansBody: '„Nach Plan lernen“ ist aktiv. Ohne Fachplan startet SkillPilot kein Lernziel automatisch; du kannst weiterhin selbst ein Ziel aus deiner Lernzielübersicht auswählen.',
      continueAction: 'Nächstes Planziel starten',
      continueBusy: 'Planziel wird geöffnet …',
      nothingDue: 'Bis heute ist kein offenes Planziel fällig.',
      dueGoalBlocked: 'Offene Planziele sind fällig, aber ihre Lernvoraussetzungen sind noch nicht erfüllt. Dein aktueller Fokus bleibt unverändert.',
      activeGoalInProgress: 'Beende zuerst dein aktuelles Lernziel. Der Fachplan verdrängt kein noch laufendes Ziel und dein Fokus bleibt unverändert.',
      loadFailed: 'Deine Fachpläne konnten gerade nicht geladen werden.',
      loading: 'Fachpläne werden geladen …',
      refreshing: 'Fachpläne werden aktualisiert … Planaktionen sind kurz gesperrt.',
      retryAction: 'Erneut versuchen',
      continueConflict: 'Der Fachplan wurde inzwischen geändert. Bitte prüfe den aktuellen Stand.',
      continueFailed: 'Das nächste Planziel konnte nicht gestartet werden.',
      crossSubjectNavigationUnavailable: 'Dieser Fachwechsel kann in dieser Ansicht nicht sicher geöffnet werden. Öffne das Fach im Cockpit und starte das Ziel dort.',
      staleData: (date) => `Aktualisierung fehlgeschlagen. Angezeigt wird der letzte Stand vom ${date}; Planaktionen sind bis zum erneuten Laden gesperrt.`,
    }
  : {
      todayTitle: 'Today',
      todayOpen: (count) => count === 1
        ? '1 planned goal is still open through today.'
        : `${count} planned goals are still open through today.`,
      todayDone: 'Everything due through today is complete in your valid subject plans.',
      todayScope: (subjectCount) => subjectCount === 1
        ? '1 valid subject plan'
        : `${subjectCount} valid subject plans`,
      includesBacklog: 'Open work from earlier days is included.',
      currentSubjectBadge: 'Current subject',
      currentGoalLabel: 'You are learning',
      continueLearningAction: 'Continue learning',
      switchSubjectAction: (subject) => `Switch to ${subject}`,
      switchBusy: 'Switching subject…',
      preparingNextGoal: 'SkillPilot is selecting your next due learning goal…',
      detailsAction: 'Plan details',
      openCount: (count) => count === 1 ? '1 goal open' : `${count} goals open`,
      subjectDone: 'Complete through today',
      subjectBlocked: 'Open, but prerequisites are still missing',
      switchFailed: 'The subject could not be switched. Your previous learning goal remains unchanged.',
      reconcileFailed: 'The next planned goal could not be selected automatically. Your learning state was not changed.',
      cardTitle: (subject) => `My plan for ${subject}`,
      cardDescription: 'Your subject plan status through today.',
      planPeriodLabel: 'Plan period',
      currentBlockLabel: 'Current plan block',
      noCurrentBlock: 'No learning block is active today.',
      dueThroughTodayLabel: 'Due through today',
      completedDueThroughTodayLabel: 'Already mastered',
      openDueThroughTodayLabel: 'Still open',
      dueTodayLabel: 'Newly due today',
      completedDueTodayLabel: 'Already mastered',
      openDueTodayLabel: 'Still open today',
      cumulativeProgress: (completed, due) => `Overall through today: ${completed} of ${due} mastered`,
      backlogOpen: (count) => count === 1 ? '1 open goal from an earlier day' : `${count} open goals from earlier days`,
      nextEligibleGoalLabel: 'Next available',
      nextEligibleGoalTitleUnavailable: 'The next eligible planned goal is ready.',
      nextMilestoneLabel: 'Next milestone',
      noNextMilestone: 'No further milestone is scheduled.',
      bufferLabel: 'Buffer',
      bufferValue: (remaining, total) => `${remaining} of ${total} weekdays remaining`,
      paceTitle: 'Pace over the last 7 days',
      paceUnavailableStatus: 'Not yet assessable',
      paceHistoryUnavailable: 'The 7-day status remains neutral: the available mastery history does not establish individual completions by day.',
      paceNeutral: 'The 7-day status currently serves as neutral orientation only.',
      stalePlan: 'After a personalization change, this plan no longer matches the current subject scope. Have it made available in the cockpit again; your focus remains unchanged until then.',
      planModeOffTitle: 'Plan mode is off',
      planModeOffBody: 'The plan remains visible. Enable “Learn according to plan” in settings so SkillPilot can select the next due goal.',
      planModeOnTitle: 'Learn by plan is active',
      planModeOnBody: 'SkillPilot selects the first due goal and then guides you automatically. You can switch subjects with one click at any time.',
      openSettingsAction: 'Open settings',
      noPlansTitle: 'No personal subject plan yet',
      noPlansBody: '“Learn according to plan” is enabled. Without a subject plan, SkillPilot does not start a goal automatically; you can still select a goal yourself from your learning-goal overview.',
      continueAction: 'Start next planned goal',
      continueBusy: 'Opening the planned goal…',
      nothingDue: 'No open planned goal is due through today.',
      dueGoalBlocked: 'Open planned goals are due, but their learning prerequisites are not yet met. Your current focus remains unchanged.',
      activeGoalInProgress: 'Finish your current learning goal first. The subject plan does not replace a goal that is still in progress, and your focus remains unchanged.',
      loadFailed: 'Your subject plans could not be loaded right now.',
      loading: 'Loading subject plans…',
      refreshing: 'Refreshing subject plans… Plan actions are briefly locked.',
      retryAction: 'Try again',
      continueConflict: 'The subject plan changed in the meantime. Please review its current state.',
      continueFailed: 'The next planned goal could not be started.',
      crossSubjectNavigationUnavailable: 'This subject change cannot be opened safely in this view. Open the subject in the cockpit and start the goal there.',
      staleData: (date) => `The refresh failed. This is the last status from ${date}; plan actions are locked until it reloads.`,
    }

export const getLearnerLearningPlanPaceMessage = (
  reason: string,
  copy: LearnerLearningPlanCopy,
): string => reason === 'mastery-history-not-event-backed'
  || reason === 'Die Lerngeschwindigkeit wird erst mit einer ereignisbasierten Lernhistorie bewertet.'
  ? copy.paceHistoryUnavailable
  : copy.paceNeutral
