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
  plannedOpenGoalCount: (open: number, total: number) => string
  duplicatedGoalCount: (count: number) => string
  timelineTitle: string
  timelineHint: string
  noBlocks: string
  periodLabel: string
  expectedLabel: string
  coveredLabel: string
  weeklyQuotaLabel: string
  bufferDaysLabel: string
  nextMilestoneLabel: string
  noMilestone: string
  today: string
  future: string
  complete: string
  minimumConfirmed: (covered: number, total: number) => string
  confirmedValue: (covered: number, total: number) => string
  expectedValue: (expected: number, total: number) => string
  goalsDetails: string
  markCovered: string
  markOpen: string
  coverageTitle: string
  coverageBody: string
  coverageAttest: string
  coverageAttested: string
  coverageOpen: string
  coverageChanged: string
  planStatusTitle: string
  planStatusOnTrack: string
  planStatusWatch: string
  planStatusBehind: string
  planStatusAhead: string
  planStatusUnavailable: string
  calculationUnavailableTitle: string
  calculationUnavailableBody: string
  notCalculable: string
  blockNotCalculable: string
  decisionTitle: string
  decisionNone: string
  decisionAddLearning: string
  decisionDocument: string
  decisionReview: string
  paceTitle: string
  paceSubtitle: string
  paceActual: string
  paceTarget: string
  paceUnavailableNew: string
  paceUnavailableAttestation: string
  paceUnavailableHistory: string
  paceProvisional: string
  paceUnit: string
  planningBasis: string
  planningBasisHint: string
  studentStatusTitle: string
  classStatusLabel: string
  learnerStatusLabel: (name: string) => string
  studentStatusBody: string
  studentNoGoalsDue: string
  studentNoLearners: string
  studentLoading: string
  studentEvidenceMissing: string
  studentLoadError: string
  studentRange: (lower: number, upper: number, total: number) => string
  studentExact: (value: number, total: number) => string
  studentClassMedian: (lower: number, upper: number, total: number) => string
  studentLoadedCount: (loaded: number, total: number) => string
  studentPrivacyHint: string
  exportPlan: string
  exportHint: string
  exportSuccess: string
  importNotIncluded: string
  protectedExtensionTitle: string
  protectedExtensionBody: string
}

const de: CoursePlanCopy = {
  workspaceLabel: 'Arbeitsbereich',
  goalsTab: 'Lernziele',
  planTab: 'Plan & Lage',
  title: 'Plan & Lage',
  subtitle: 'Jahrgangsstoff terminieren, Puffer schützen und den heutigen Stand nachvollziehbar machen.',
  localPreviewTitle: 'Lokale Vorschau',
  localPreviewBody: 'Der Plan und der dokumentierte Unterrichtsstand liegen nur in diesem Browser. Die Ansicht ist noch kein revisionsfester Leitungsnachweis.',
  localPreviewBadge: 'nur auf diesem Gerät',
  teacherLeadsTitle: 'Die Lehrkraft führt',
  teacherLeadsBody: 'SkillPilot ordnet und rechnet. Du setzt Ziele, bestätigst den Unterrichtsstand und entscheidest über jede Planänderung.',
  addFirstBlock: 'Ersten Abschnitt planen',
  addBlock: 'Abschnitt hinzufügen',
  emptyTitle: 'In drei Schritten zu einer ersten Planlage',
  emptyBody: 'Beginne mit einem überschaubaren Abschnitt. Weitere Lernphasen, Puffer und Termine kannst du danach ergänzen.',
  emptySteps: [
    'Lernziel oder Cluster auswählen und Von-bis-Zeitraum festlegen',
    'Behandelte Lernziele im Unterrichtsstand bestätigen',
    'Stand bis heute nachtragen und Soll–IST gemeinsam lesen',
  ],
  schoolYearLabel: 'Schuljahr / Planbezeichnung',
  schoolYearPlaceholder: 'z. B. 2026/27 · Physik LK',
  savePlanLabel: 'Bezeichnung speichern',
  revisionLabel: (revision) => `Entwurf · Revision ${revision}`,
  undoLastChange: 'Letzte Planänderung rückgängig machen',
  undoUnavailable: 'Noch keine Planänderung zum Rückgängigmachen',
  savedLocally: 'Lokal gespeichert',
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
  plannedOpenGoalCount: (open, total) => `${open} offene von ${total} atomaren Zielen verplant`,
  duplicatedGoalCount: (count) => `${count} Lernziel${count === 1 ? '' : 'e'} bereits in einem früheren Abschnitt eingeplant`,
  timelineTitle: 'Textueller Kursplan',
  timelineHint: 'Chronologisch sortiert. Ein Lernziel zählt beim ersten eingeplanten Auftreten zum Soll.',
  noBlocks: 'Noch keine Abschnitte geplant.',
  periodLabel: 'Zeitraum',
  expectedLabel: 'Soll heute',
  coveredLabel: 'Unterrichts-IST',
  weeklyQuotaLabel: 'Wochenkontingent',
  bufferDaysLabel: 'Puffer',
  nextMilestoneLabel: 'Nächster Termin',
  noMilestone: 'Kein Termin geplant',
  today: 'heute',
  future: 'noch nicht fällig',
  complete: 'vollständig fällig',
  minimumConfirmed: (covered, total) => `Mindestens ${covered} von ${total} bestätigt`,
  confirmedValue: (covered, total) => `${covered} von ${total} bestätigt`,
  expectedValue: (expected, total) => `${expected} von ${total} fällig`,
  goalsDetails: 'Enthaltene Lernziele und Unterrichtsstand',
  markCovered: 'Als im Unterricht behandelt bestätigen',
  markOpen: 'Bestätigung zurücknehmen',
  coverageTitle: 'Unterrichtsstand',
  coverageBody: 'Bestätige nur Ziele, die im Kurs tatsächlich behandelt wurden. Das sagt noch nichts darüber aus, ob jede lernende Person sie beherrscht.',
  coverageAttest: 'Stand bis heute vollständig nachgetragen',
  coverageAttested: 'Datenstand für heute bestätigt',
  coverageOpen: 'Datenstand offen – deshalb keine rote oder grüne Planbewertung',
  coverageChanged: 'Seit der letzten Bestätigung wurde der Plan oder Unterrichtsstand geändert.',
  planStatusTitle: 'Heutige Planlage',
  planStatusOnTrack: 'Bestätigte Abdeckung im Sollkorridor',
  planStatusWatch: 'Abweichung bitte einordnen',
  planStatusBehind: 'Bestätigte Abdeckung unter dem Sollpfad',
  planStatusAhead: 'Mehr Abdeckung als bis heute vorgesehen',
  planStatusUnavailable: 'Noch nicht bewertbar',
  calculationUnavailableTitle: 'Planlage nicht berechenbar',
  calculationUnavailableBody: 'Mindestens ein geplanter Lernzielbezug ist im aktuellen Kursumfang nicht mehr verfügbar. Bitte bearbeite oder entferne den betroffenen Abschnitt; SkillPilot setzt dafür keine Nullwerte ein.',
  notCalculable: 'Nicht berechenbar',
  blockNotCalculable: 'Dieser Abschnitt kann mit dem aktuellen Lernzielumfang nicht berechnet werden.',
  decisionTitle: 'Was braucht heute deine Entscheidung?',
  decisionNone: 'Aus dem dokumentierten Unterrichtsstand ergibt sich aktuell kein unmittelbarer Entscheidungsbedarf.',
  decisionAddLearning: 'Puffer und Termine sind angelegt. Ergänze mindestens einen Lernabschnitt, damit Soll und Unterrichts-IST berechnet werden können.',
  decisionDocument: 'Bitte prüfe und bestätige zuerst, ob der Unterrichtsstand bis heute vollständig nachgetragen ist.',
  decisionReview: 'Bitte ordne die Abweichung pädagogisch ein. SkillPilot ändert weder Reihenfolge noch Puffer oder Zieltermine automatisch.',
  paceTitle: 'Tempo der letzten 7 Tage',
  paceSubtitle: 'Dokumentierte Unterrichtsabdeckung im Vergleich zur gleichmäßig geplanten Sollgeschwindigkeit.',
  paceActual: 'IST',
  paceTarget: 'SOLL',
  paceUnavailableNew: 'Der aktuelle Plan muss dafür mindestens sieben Tage unverändert bestehen.',
  paceUnavailableAttestation: 'Bitte zuerst den Unterrichtsstand bis heute vollständig nachtragen.',
  paceUnavailableHistory: 'Für den Sieben-Tage-Vergleich fehlt noch eine ausreichende lokale Verlaufshistorie.',
  paceProvisional: 'Vorläufiger Rohwert – noch keine grüne oder rote Geschwindigkeitsbewertung.',
  paceUnit: 'Ziele/Woche',
  planningBasis: 'Planungsgrundlage',
  planningBasisHint: 'Die Vorschau verteilt Lernziele gleichmäßig auf Werktage (Mo–Fr). Ferien, Feiertage, Ausfälle und echte Unterrichtsstunden sind in diesem Pilot noch nicht eingerechnet.',
  studentStatusTitle: 'Lernstand',
  classStatusLabel: 'Klasse – statistisch',
  learnerStatusLabel: (name) => `Einzelsicht · ${name}`,
  studentStatusBody: 'Der Lernstand bleibt getrennt vom Unterrichtsstand. Es werden nur bereits geladene Werte verwendet; fehlende Werte gelten als unbekannt, nicht als null.',
  studentNoGoalsDue: 'Heute sind laut Plan noch keine Lernziele fällig.',
  studentNoLearners: 'Für diesen Kurs sind keine Lernenden hinterlegt.',
  studentLoading: 'Lernstände werden geladen …',
  studentEvidenceMissing: 'Für eine eindeutige Aussage fehlen Lernstandswerte.',
  studentLoadError: 'Der Lernstand konnte nicht vollständig geladen werden.',
  studentRange: (lower, upper, total) => `${lower}–${upper} von ${total} fälligen Zielen`,
  studentExact: (value, total) => `${value} von ${total} fälligen Zielen`,
  studentClassMedian: (lower, upper, total) => `Median: ${lower}–${upper} von ${total} fälligen Zielen`,
  studentLoadedCount: (loaded, total) => `${loaded} von ${total} Lernständen geladen`,
  studentPrivacyHint: 'Keine Rangliste und kein Export der lernstandsbezogenen Planungsgrundlage. Eigene Freitexte können personenbezogene Angaben enthalten.',
  exportPlan: 'Plan exportieren',
  exportHint: 'Der Export entfernt Klassen-ID und lernstandsbezogene Planungsgrundlage. Eigene Freitexte werden unverändert übernommen – bitte keine personenbezogenen Angaben eintragen.',
  exportSuccess: 'Kursplan exportiert – Freitexte bitte vor Weitergabe prüfen.',
  importNotIncluded: 'Ein Import folgt nach dem sicheren Server- und Berechtigungskonzept.',
  protectedExtensionTitle: 'Lernstand und Leitungssicht bleiben geschützt',
  protectedExtensionBody: 'Klassenstatistik, Einzeldrilldown und eine aggregierte Leitungssicht werden erst mit serverseitiger Kurszuordnung, Zweckbindung und geprüften Berechtigungen freigeschaltet. Dieser lokale Pilot liest einmalig den offenen atomaren Zielbestand für die Planbasis, zeigt daraus nur Plan-Summen und entfernt diese Grundlage beim Export.',
}

const en: CoursePlanCopy = {
  workspaceLabel: 'Workspace',
  goalsTab: 'Learning goals',
  planTab: 'Plan & status',
  title: 'Plan & status',
  subtitle: 'Schedule the curriculum, protect buffer time, and make today’s status understandable.',
  localPreviewTitle: 'Local preview',
  localPreviewBody: 'The plan and documented teaching status are stored only in this browser. This is not yet an audit-proof management report.',
  localPreviewBadge: 'this device only',
  teacherLeadsTitle: 'The teacher leads',
  teacherLeadsBody: 'SkillPilot organizes and calculates. You set goals, confirm teaching coverage, and decide on every plan change.',
  addFirstBlock: 'Plan the first section',
  addBlock: 'Add section',
  emptyTitle: 'An initial plan status in three steps',
  emptyBody: 'Start with one manageable section. Add learning phases, buffers, and milestones afterwards.',
  emptySteps: [
    'Choose a goal or cluster and set its date range',
    'Confirm the goals actually covered in class',
    'Confirm today’s documentation and read target versus actual',
  ],
  schoolYearLabel: 'School year / plan label',
  schoolYearPlaceholder: 'e.g. 2026/27 · Advanced physics',
  savePlanLabel: 'Save label',
  revisionLabel: (revision) => `Draft · revision ${revision}`,
  undoLastChange: 'Undo the last plan change',
  undoUnavailable: 'No plan change to undo yet',
  savedLocally: 'Saved locally',
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
  plannedOpenGoalCount: (open, total) => `${open} open of ${total} atomic goals scheduled`,
  duplicatedGoalCount: (count) => `${count} goal${count === 1 ? '' : 's'} already scheduled in an earlier section`,
  timelineTitle: 'Text course plan',
  timelineHint: 'Sorted chronologically. A goal counts toward the target when it first appears in the plan.',
  noBlocks: 'No sections planned yet.',
  periodLabel: 'Period',
  expectedLabel: 'Target today',
  coveredLabel: 'Teaching actual',
  weeklyQuotaLabel: 'Weekly quota',
  bufferDaysLabel: 'Buffer',
  nextMilestoneLabel: 'Next milestone',
  noMilestone: 'No milestone planned',
  today: 'today',
  future: 'not due yet',
  complete: 'fully due',
  minimumConfirmed: (covered, total) => `At least ${covered} of ${total} confirmed`,
  confirmedValue: (covered, total) => `${covered} of ${total} confirmed`,
  expectedValue: (expected, total) => `${expected} of ${total} due`,
  goalsDetails: 'Included goals and teaching status',
  markCovered: 'Confirm as covered in class',
  markOpen: 'Withdraw confirmation',
  coverageTitle: 'Teaching status',
  coverageBody: 'Confirm only goals actually covered in class. This does not mean every learner has mastered them.',
  coverageAttest: 'Documentation is complete through today',
  coverageAttested: 'Today’s data status confirmed',
  coverageOpen: 'Data status is open, so no red or green plan rating is shown',
  coverageChanged: 'The plan or teaching status changed since the last confirmation.',
  planStatusTitle: 'Today’s plan status',
  planStatusOnTrack: 'Confirmed coverage within the target corridor',
  planStatusWatch: 'Please interpret this deviation',
  planStatusBehind: 'Confirmed coverage below the target path',
  planStatusAhead: 'More coverage than planned through today',
  planStatusUnavailable: 'Not assessable yet',
  calculationUnavailableTitle: 'Plan status cannot be calculated',
  calculationUnavailableBody: 'At least one scheduled learning-goal reference is no longer available in the current course scope. Edit or remove the affected block; SkillPilot will not substitute zero values.',
  notCalculable: 'Cannot be calculated',
  blockNotCalculable: 'This block cannot be calculated with the current learning-goal scope.',
  decisionTitle: 'What needs your decision today?',
  decisionNone: 'The documented teaching status currently creates no immediate decision need.',
  decisionAddLearning: 'Buffers and dates are set. Add at least one learning block before planned and actual teaching coverage can be calculated.',
  decisionDocument: 'First review and confirm whether teaching coverage is fully documented through today.',
  decisionReview: 'Please interpret the deviation pedagogically. SkillPilot will not change sequence, buffer, or deadlines automatically.',
  paceTitle: 'Pace over the last 7 days',
  paceSubtitle: 'Documented teaching coverage compared with the evenly planned target pace.',
  paceActual: 'ACTUAL',
  paceTarget: 'TARGET',
  paceUnavailableNew: 'The current plan must remain unchanged for at least seven days.',
  paceUnavailableAttestation: 'First complete the teaching documentation through today.',
  paceUnavailableHistory: 'There is not yet enough local history for a seven-day comparison.',
  paceProvisional: 'Preliminary raw value — no green or red pace judgement yet.',
  paceUnit: 'goals/week',
  planningBasis: 'Planning basis',
  planningBasisHint: 'This preview spreads goals evenly across weekdays (Mon–Fri). Holidays, cancellations, and actual lesson periods are not included in this pilot yet.',
  studentStatusTitle: 'Learning status',
  classStatusLabel: 'Class statistics',
  learnerStatusLabel: (name) => `Individual view · ${name}`,
  studentStatusBody: 'Learning status remains separate from teaching coverage. Only already-loaded values are used; missing values are unknown, never zero.',
  studentNoGoalsDue: 'No learning goals are due today according to the plan.',
  studentNoLearners: 'No learners are assigned to this course.',
  studentLoading: 'Loading learning status …',
  studentEvidenceMissing: 'Learning-status values are missing for a definitive statement.',
  studentLoadError: 'Learning status could not be loaded completely.',
  studentRange: (lower, upper, total) => `${lower}–${upper} of ${total} due goals`,
  studentExact: (value, total) => `${value} of ${total} due goals`,
  studentClassMedian: (lower, upper, total) => `Median: ${lower}–${upper} of ${total} due goals`,
  studentLoadedCount: (loaded, total) => `${loaded} of ${total} learning records loaded`,
  studentPrivacyHint: 'No ranking and no export of the learner-derived planning basis. Your free text may contain personal data.',
  exportPlan: 'Export plan',
  exportHint: 'The export removes the class ID and learner-derived planning basis. Your free text is kept unchanged—do not enter personal data.',
  exportSuccess: 'Course plan exported—check free text before sharing.',
  importNotIncluded: 'Import follows after the secure server and authorization design.',
  protectedExtensionTitle: 'Learning status and management views remain protected',
  protectedExtensionBody: 'Class statistics, individual drill-down, and an aggregated management view require server-side course ownership, purpose limitation, and verified permissions. This local pilot reads the open atomic goal set once for its planning basis, shows only plan totals derived from it, and removes that basis from exports.',
}

export const getCoursePlanCopy = (language: LabelLanguage): CoursePlanCopy => (
  language === 'de' ? de : en
)
