import type { LabelLanguage } from './filterLabels'

export interface CoursePlanCopy {
  workspaceLabel: string
  goalsTab: string
  planTab: string
  title: string
  subtitle: string
  localPreviewTitle: string
  localPreviewBody: string
  localPreviewBadge: string
  teacherLeadsTitle: string
  teacherLeadsBody: string
  addFirstBlock: string
  addBlock: string
  emptyTitle: string
  emptyBody: string
  emptySteps: readonly [string, string, string]
  schoolYearLabel: string
  schoolYearPlaceholder: string
  savePlanLabel: string
  revisionLabel: (revision: number) => string
  undoLastChange: string
  undoUnavailable: string
  savedLocally: string
  unsavedLocally: string
  saveFailed: string
  formTitleNew: string
  formTitleEdit: string
  kindLabel: string
  kindLearning: string
  kindBuffer: string
  kindMilestone: string
  milestonePlanningHint: string
  goalLabel: string
  goalPlaceholder: string
  customTitleLabel: string
  customTitlePlaceholder: string
  startDateLabel: string
  endDateLabel: string
  dueDateLabel: string
  saveBlock: string
  cancel: string
  edit: string
  remove: string
  removeConfirm: string
  invalidDateRange: string
  missingGoal: string
  missingTitle: string
  noPlannableGoals: string
  planningScopeOnSave: string
  planningScopeLoadError: string
  planChangedDuringSave: string
  retryPlanningScope: string
  learningGoalCount: (count: number) => string
  duplicatedGoalCount: (count: number) => string
  timelineTitle: string
  timelineHint: string
  noBlocks: string
  periodLabel: string
  expectedLabel: string
  weeklyQuotaLabel: string
  bufferDaysLabel: string
  nextMilestoneLabel: string
  noMilestone: string
  today: string
  future: string
  complete: string
  expectedValue: (expected: number, total: number) => string
  goalsDetails: string
  planStatusUnavailable: string
  calculationUnavailableTitle: string
  calculationUnavailableBody: string
  notCalculable: string
  blockNotCalculable: string
  planningBasis: string
  planningBasisHint: string
  studentPrivacyHint: string
  exportPlan: string
  exportHint: string
  exportSuccess: string
  publishPlan: string
  publishPlanLoading: string
  publishPlanSaving: string
  publishConfirmTitle: string
  publishIndependentCopyBody: string
  publishNewBody: string
  publishReplaceBody: (revision: number) => string
  publishConfirmNew: string
  publishConfirmReplace: string
  publishUnavailable: string
  publishDisabledUnsaved: string
  publishDisabledNotCalculable: string
  publishDisabledNoLearningGoals: string
  publishNoOpenGoals: string
  publishConflict: string
  publishFailed: string
  publishSuccess: (revision: number) => string
  publishGoalCount: (count: number) => string
  importNotIncluded: string
}

const de: CoursePlanCopy = {
  workspaceLabel: 'Arbeitsbereich',
  goalsTab: 'Lernziele',
  planTab: 'Planung',
  title: 'Plan & Lage',
  subtitle: 'Jahrgangsstoff terminieren, Puffer schützen und den heutigen Stand nachvollziehbar machen.',
  localPreviewTitle: 'Lokale Vorschau',
  localPreviewBody: 'Der Kursplan liegt nur in diesem Browser. Der Lernfortschritt wird aus den gespeicherten Lernzielergebnissen geladen.',
  localPreviewBadge: 'nur auf diesem Gerät',
  teacherLeadsTitle: 'Die Lehrkraft führt',
  teacherLeadsBody: 'Du planst Ziele und Termine. SkillPilot zeigt dazu die gespeicherten Lernzielergebnisse; über Planänderungen entscheidest du.',
  addFirstBlock: 'Ersten Abschnitt planen',
  addBlock: 'Abschnitt hinzufügen',
  emptyTitle: 'Dein erster Planabschnitt',
  emptyBody: 'Beginne mit einem überschaubaren Abschnitt. Weitere Lernphasen, Puffer und Termine kannst du danach ergänzen.',
  emptySteps: [
    'Lernziel oder Cluster auswählen und Von-bis-Zeitraum festlegen',
    'Abschnitt speichern; weitere Themen, Puffer oder Termine ergänzen',
    'Plan prüfen; bei verknüpften Schülern die gemeinsame Vorschau öffnen',
  ],
  schoolYearLabel: 'Schuljahr / Planbezeichnung',
  schoolYearPlaceholder: 'z. B. 2026/27 · Physik LK',
  savePlanLabel: 'Bezeichnung speichern',
  revisionLabel: (revision) => `Entwurf · Revision ${revision}`,
  undoLastChange: 'Letzte Planänderung rückgängig machen',
  undoUnavailable: 'Noch keine Planänderung zum Rückgängigmachen',
  savedLocally: 'Lokal gespeichert',
  unsavedLocally: 'Nicht gespeicherte Änderungen',
  saveFailed: 'Der Kursplan konnte in diesem Browser nicht gespeichert werden.',
  formTitleNew: 'Neuen Planabschnitt anlegen',
  formTitleEdit: 'Planabschnitt bearbeiten',
  kindLabel: 'Art des Abschnitts',
  kindLearning: 'Lernabschnitt',
  kindBuffer: 'Puffer',
  kindMilestone: 'Termin / Meilenstein',
  milestonePlanningHint: 'Die Zielmarke setzt einen Termin, zählt aber nicht zusätzlich zum Soll. Plane den Bearbeitungszeitraum als eigenen Lernabschnitt.',
  goalLabel: 'Lernziel oder Cluster',
  goalPlaceholder: 'Bitte auswählen …',
  customTitleLabel: 'Bezeichnung',
  customTitlePlaceholder: 'z. B. Klausurvorbereitung oder Reserve',
  startDateLabel: 'Von',
  endDateLabel: 'Bis einschließlich',
  dueDateLabel: 'Fällig am',
  saveBlock: 'Abschnitt speichern',
  cancel: 'Abbrechen',
  edit: 'Bearbeiten',
  remove: 'Entfernen',
  removeConfirm: 'Wirklich entfernen',
  invalidDateRange: 'Das Enddatum darf nicht vor dem Startdatum liegen.',
  missingGoal: 'Bitte wähle ein Lernziel oder einen Cluster.',
  missingTitle: 'Bitte gib eine verständliche Bezeichnung ein.',
  noPlannableGoals: 'Dieser Eintrag enthält keine planbaren atomaren Lernziele.',
  planningScopeOnSave: 'Offene atomare Ziele werden aus dem vollständigen personalisierten Fachumfang ermittelt …',
  planningScopeLoadError: 'Die offenen atomaren Lernziele konnten nicht sicher ermittelt werden. Der Abschnitt wurde nicht gespeichert.',
  planChangedDuringSave: 'Der Plan wurde während des Ladens geändert. Bitte speichere den Abschnitt erneut.',
  retryPlanningScope: 'Erneut laden',
  learningGoalCount: (count) => `${count} Lernziel${count === 1 ? '' : 'e'}`,
  duplicatedGoalCount: (count) => `${count} Lernziel${count === 1 ? '' : 'e'} bereits in einem früheren Abschnitt eingeplant`,
  timelineTitle: 'Textueller Kursplan',
  timelineHint: 'Chronologisch sortiert. Ein Lernziel zählt beim ersten eingeplanten Auftreten zum Soll.',
  noBlocks: 'Noch keine Abschnitte geplant.',
  periodLabel: 'Zeitraum',
  expectedLabel: 'Lernziele bis heute geplant',
  weeklyQuotaLabel: 'Wochenkontingent',
  bufferDaysLabel: 'Puffer',
  nextMilestoneLabel: 'Nächster Termin',
  noMilestone: 'Kein Termin geplant',
  today: 'heute',
  future: 'noch nicht fällig',
  complete: 'vollständig fällig',
  expectedValue: (expected, total) => `${expected} von ${total} fällig`,
  goalsDetails: 'Enthaltene Lernziele',
  planStatusUnavailable: 'Noch nicht bewertbar',
  calculationUnavailableTitle: 'Planlage nicht berechenbar',
  calculationUnavailableBody: 'Mindestens ein geplanter Lernzielbezug ist im aktuellen Kursumfang nicht mehr verfügbar. Bitte bearbeite oder entferne den betroffenen Abschnitt; SkillPilot setzt dafür keine Nullwerte ein.',
  notCalculable: 'Nicht berechenbar',
  blockNotCalculable: 'Dieser Abschnitt kann mit dem aktuellen Lernzielumfang nicht berechnet werden.',
  planningBasis: 'Planungsgrundlage',
  planningBasisHint: 'Die Vorschau verteilt Lernziele gleichmäßig auf Werktage (Mo–Fr). Ferien, Feiertage, Ausfälle und echte Unterrichtsstunden sind in diesem Pilot noch nicht eingerechnet.',
  studentPrivacyHint: 'Keine Rangliste und kein Export der lernstandsbezogenen Planungsgrundlage. Eigene Freitexte können personenbezogene Angaben enthalten.',
  exportPlan: 'Plan exportieren',
  exportHint: 'Der Export entfernt Klassen-ID und lernstandsbezogene Planungsgrundlage. Eigene Freitexte werden unverändert übernommen – bitte keine personenbezogenen Angaben eintragen.',
  exportSuccess: 'Kursplan exportiert – Freitexte bitte vor Weitergabe prüfen.',
  publishPlan: 'Im Cockpit bereitstellen',
  publishPlanLoading: 'Cockpit-Stand wird geprüft …',
  publishPlanSaving: 'Wird im Cockpit bereitgestellt …',
  publishConfirmTitle: 'Plan als unabhängige Kopie bereitstellen?',
  publishIndependentCopyBody: 'Der lokale Lehrerplan bleibt unverändert. SkillPilot kopiert nur Bezeichnung, Zeitblöcke und die darin enthaltenen kanonischen Lernziele in den Fachplan des Lernenden. Der gespeicherte Lernstand bleibt unverändert. Klassenbezug und lokale Altdokumentation werden nicht übertragen. Spätere Planänderungen werden nicht automatisch synchronisiert.',
  publishNewBody: 'Für dieses Fach besteht im Cockpit noch kein Plan.',
  publishReplaceBody: (revision) => `Im Cockpit besteht bereits ein Fachplan (Revision ${revision}). Beim Bestätigen wird er durch eine neue Revision ersetzt.`,
  publishConfirmNew: 'Unabhängige Kopie bereitstellen',
  publishConfirmReplace: 'Fachplan ersetzen',
  publishUnavailable: 'Der Plan kann nicht sicher bereitgestellt werden, weil er keine vollständig auflösbaren kanonischen atomaren Lernziele enthält.',
  publishDisabledUnsaved: 'Speichere oder verwirf zuerst die noch offenen Änderungen.',
  publishDisabledNotCalculable: 'Der Plan muss vollständig berechenbar sein, bevor er bereitgestellt werden kann.',
  publishDisabledNoLearningGoals: 'Ergänze mindestens einen berechenbaren Lernabschnitt mit atomaren Lernzielen.',
  publishNoOpenGoals: 'Der Plan enthält für dieses Fach keine noch offenen atomaren Lernziele, die im Cockpit bereitgestellt werden könnten.',
  publishConflict: 'Der Fachplan im Cockpit wurde inzwischen geändert. Nichts wurde überschrieben. Bitte prüfe den aktuellen Stand erneut.',
  publishFailed: 'Der Plan konnte nicht im Cockpit bereitgestellt werden.',
  publishSuccess: (revision) => `Als unabhängige Kopie im Cockpit bereitgestellt · Revision ${revision}`,
  publishGoalCount: (count) => `${count} kanonische${count === 1 ? 's' : ''} Atomziel${count === 1 ? '' : 'e'} ${count === 1 ? 'wird' : 'werden'} geprüft. Gespeichert werden daraus nur aktuell offene sowie bereits in diesem persönlichen Fachplan erfasste Ziele.`,
  importNotIncluded: 'Ein Import folgt nach dem sicheren Server- und Berechtigungskonzept.',
}

const en: CoursePlanCopy = {
  workspaceLabel: 'Workspace',
  goalsTab: 'Learning goals',
  planTab: 'Planning',
  title: 'Plan & status',
  subtitle: 'Schedule the curriculum, protect buffer time, and make today’s status understandable.',
  localPreviewTitle: 'Local preview',
  localPreviewBody: 'The course plan is stored only in this browser. Learning progress is loaded from stored learning-goal results.',
  localPreviewBadge: 'this device only',
  teacherLeadsTitle: 'The teacher leads',
  teacherLeadsBody: 'You plan goals and dates. SkillPilot shows the stored learning-goal results; you decide on plan changes.',
  addFirstBlock: 'Plan the first section',
  addBlock: 'Add section',
  emptyTitle: 'Your first plan section',
  emptyBody: 'Start with one manageable section. Add learning phases, buffers, and milestones afterwards.',
  emptySteps: [
    'Choose a goal or cluster and set its date range',
    'Save the section; add topics, buffer time or milestones',
    'Review the plan; open the joint preview for linked learners',
  ],
  schoolYearLabel: 'School year / plan label',
  schoolYearPlaceholder: 'e.g. 2026/27 · Advanced physics',
  savePlanLabel: 'Save label',
  revisionLabel: (revision) => `Draft · revision ${revision}`,
  undoLastChange: 'Undo the last plan change',
  undoUnavailable: 'No plan change to undo yet',
  savedLocally: 'Saved locally',
  unsavedLocally: 'Unsaved changes',
  saveFailed: 'The course plan could not be saved in this browser.',
  formTitleNew: 'Add a plan section',
  formTitleEdit: 'Edit plan section',
  kindLabel: 'Section type',
  kindLearning: 'Learning section',
  kindBuffer: 'Buffer',
  kindMilestone: 'Milestone / deadline',
  milestonePlanningHint: 'The target marker sets a date but does not add progress to the plan. Schedule its preparation as a separate learning block.',
  goalLabel: 'Learning goal or cluster',
  goalPlaceholder: 'Please choose …',
  customTitleLabel: 'Label',
  customTitlePlaceholder: 'e.g. Exam preparation or reserve',
  startDateLabel: 'From',
  endDateLabel: 'Through',
  dueDateLabel: 'Due on',
  saveBlock: 'Save section',
  cancel: 'Cancel',
  edit: 'Edit',
  remove: 'Remove',
  removeConfirm: 'Really remove',
  invalidDateRange: 'The end date cannot be before the start date.',
  missingGoal: 'Please choose a learning goal or cluster.',
  missingTitle: 'Please enter a clear label.',
  noPlannableGoals: 'This entry contains no plannable atomic learning goals.',
  planningScopeOnSave: 'Open atomic goals are being determined from the complete personalized subject scope …',
  planningScopeLoadError: 'The open atomic learning goals could not be determined safely. The section was not saved.',
  planChangedDuringSave: 'The plan changed while the goals were loading. Please save the section again.',
  retryPlanningScope: 'Try again',
  learningGoalCount: (count) => `${count} learning goal${count === 1 ? '' : 's'}`,
  duplicatedGoalCount: (count) => `${count} goal${count === 1 ? '' : 's'} already scheduled in an earlier section`,
  timelineTitle: 'Text course plan',
  timelineHint: 'Sorted chronologically. A goal counts toward the target when it first appears in the plan.',
  noBlocks: 'No sections planned yet.',
  periodLabel: 'Period',
  expectedLabel: 'Learning goals planned through today',
  weeklyQuotaLabel: 'Weekly quota',
  bufferDaysLabel: 'Buffer',
  nextMilestoneLabel: 'Next milestone',
  noMilestone: 'No milestone planned',
  today: 'today',
  future: 'not due yet',
  complete: 'fully due',
  expectedValue: (expected, total) => `${expected} of ${total} due`,
  goalsDetails: 'Included learning goals',
  planStatusUnavailable: 'Not assessable yet',
  calculationUnavailableTitle: 'Plan status cannot be calculated',
  calculationUnavailableBody: 'At least one scheduled learning-goal reference is no longer available in the current course scope. Edit or remove the affected block; SkillPilot will not substitute zero values.',
  notCalculable: 'Cannot be calculated',
  blockNotCalculable: 'This block cannot be calculated with the current learning-goal scope.',
  planningBasis: 'Planning basis',
  planningBasisHint: 'This preview spreads goals evenly across weekdays (Mon–Fri). Holidays, cancellations, and actual lesson periods are not included in this pilot yet.',
  studentPrivacyHint: 'No ranking and no export of the learner-derived planning basis. Your free text may contain personal data.',
  exportPlan: 'Export plan',
  exportHint: 'The export removes the class ID and learner-derived planning basis. Your free text is kept unchanged—do not enter personal data.',
  exportSuccess: 'Course plan exported—check free text before sharing.',
  publishPlan: 'Make available in cockpit',
  publishPlanLoading: 'Checking the cockpit plan …',
  publishPlanSaving: 'Making available in the cockpit …',
  publishConfirmTitle: 'Make this plan available as an independent copy?',
  publishIndependentCopyBody: 'The local teacher plan remains unchanged. SkillPilot copies only the label, time blocks, and their canonical learning goals into the learner’s subject plan. Stored learning results remain unchanged. Class references and legacy local documentation are not transferred. Later plan changes are not synchronized automatically.',
  publishNewBody: 'There is no cockpit plan for this subject yet.',
  publishReplaceBody: (revision) => `A subject plan already exists in the cockpit (revision ${revision}). Confirming replaces it with a new revision.`,
  publishConfirmNew: 'Make independent copy available',
  publishConfirmReplace: 'Replace subject plan',
  publishUnavailable: 'The plan cannot be made available safely because it contains no fully resolvable canonical atomic learning goals.',
  publishDisabledUnsaved: 'Save or discard the pending changes first.',
  publishDisabledNotCalculable: 'The plan must be fully calculable before it can be made available.',
  publishDisabledNoLearningGoals: 'Add at least one calculable learning section with atomic learning goals.',
  publishNoOpenGoals: 'The plan contains no remaining open atomic goals for this subject that could be made available in the cockpit.',
  publishConflict: 'The cockpit subject plan has changed in the meantime. Nothing was overwritten. Please check the current version again.',
  publishFailed: 'The plan could not be made available in the cockpit.',
  publishSuccess: (revision) => `Independent copy made available in the cockpit · revision ${revision}`,
  publishGoalCount: (count) => `${count} canonical atomic goal${count === 1 ? '' : 's'} will be checked. Only goals that are currently open or already captured in this personal subject plan will be stored.`,
  importNotIncluded: 'Import follows after the secure server and authorization design.',
}

export const getCoursePlanCopy = (language: LabelLanguage): CoursePlanCopy => (
  language === 'de' ? de : en
)
