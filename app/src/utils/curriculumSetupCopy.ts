import type { LabelLanguage } from './filterLabels'

interface SharedCurriculumSetupCopy {
  rootFilterLabel: string
  stageLabel: string
  durationModelLabel: string
  durationModelHint: string
}

interface RetirementSetupCopy {
  title: string
  subtitle: string
  noticeTitle: string
  noticeBodyPrimary: string
  noticeBodySecondary: string
}

interface CompatibilitySetupCopy {
  title: string
  subtitle: string
  hiddenSummary: (count: number) => string
  showAction: string
  hideAction: string
  suffix: string
}

export interface PersonalCurriculumSetupCopy extends SharedCurriculumSetupCopy {
  title: string
  subtitle: string
  preferencesTitle: string
  randomStrategy: string
  sequentialStrategy: string
  autoPilotTitle: string
  autoPilotDescription: string
  strictModeTitle: string
  strictModeDescription: string
  showGoalVisualizationsInChatTitle: string
  showGoalVisualizationsInChatDescription: string
  closeAction: string
  savePending: string
  doneAction: string
  retirement: RetirementSetupCopy
  compatibility: CompatibilitySetupCopy
}

export interface ClassSetupCopy extends SharedCurriculumSetupCopy {
  title: string
  classNameLabel: string
  classNamePlaceholder: string
  selectSubjectFirst: string
  selectStageFirst: string
  createLearnerFailedStatus: (status: number) => string
  createLearnerFailedGeneric: string
  missingSkillpilotId: string
  landscapeLabel: string
  levelFilterLabel: string
  noAdditionalCourseFilter: string
  courseFilterOnlySek2: string
  studentsLabel: string
  studentsHint: string
  studentsPlaceholder: string
  errorPrefix: string
  cancel: string
  submit: string
}

const getSharedCurriculumSetupCopy = (language: LabelLanguage): SharedCurriculumSetupCopy => (
  language === 'de'
    ? {
        rootFilterLabel: 'Sicht / Bundesland',
        stageLabel: 'Sekundarstufe',
        durationModelLabel: 'Gymnasialdauer',
        durationModelHint: 'Aus den Lehrplan-Daten für dieses Fach und Bundesland abgeleitet.',
      }
    : {
        rootFilterLabel: 'View / Jurisdiction',
        stageLabel: 'Secondary stage',
        durationModelLabel: 'Gymnasium duration',
        durationModelHint: 'Derived from the curriculum data for this subject and jurisdiction.',
      }
)

export const getPersonalCurriculumSetupCopy = (
  language: LabelLanguage,
): PersonalCurriculumSetupCopy => ({
  ...getSharedCurriculumSetupCopy(language),
  ...(language === 'de'
    ? {
        title: 'Mein Lehrplan',
        subtitle: 'Wähle Bundesland, Sekundarstufen und Fächer. Die Gymnasialdauer wird fachbezogen aus den Lehrplan-Daten angeboten.',
        preferencesTitle: 'Lerneinstellungen',
        randomStrategy: 'Zufällig (Abwechslung)',
        sequentialStrategy: 'Schritt für Schritt',
        autoPilotTitle: 'Autopilot aktivieren',
        autoPilotDescription: 'Startet automatisch das nächste Ziel nach Abschluss.',
        strictModeTitle: 'Strict Mode aktivieren',
        strictModeDescription: 'Prüft alle Voraussetzungen global, auch außerhalb deines aktuellen Fokus.',
        showGoalVisualizationsInChatTitle: 'Lernzielbilder im Chat anzeigen',
        showGoalVisualizationsInChatDescription: 'Zeigt verfügbare Bilder zu atomaren Lernzielen direkt im Chat.',
        closeAction: 'Schließen',
        savePending: 'Speichert...',
        doneAction: 'Fertig',
        retirement: {
          title: 'Legacy-Ansicht',
          subtitle: 'Diese Legacy-Ansicht bleibt nur noch für Migration, Vergleich und Audit verfügbar.',
          noticeTitle: 'Nur noch für Umstellung und Audit',
          noticeBodyPrimary: 'Fach- und Filteränderungen werden in dieser eingefrorenen Legacy-Ansicht nicht mehr gepflegt. Für die weitere Arbeit soll der Lernstand auf Gymnasium (DE) umgestellt werden.',
          noticeBodySecondary: 'Die aktuelle Legacy-Ansicht bleibt vorerst als Vergleichspfad sichtbar, ist aber kein normaler Konfigurationspfad mehr.',
        },
        compatibility: {
          title: 'Kompatibilitätsansichten',
          subtitle: 'Diese eingefrorenen Legacy-Ansichten bleiben nur für Migration, Vergleich und Audit verfügbar.',
          hiddenSummary: (count: number) => `${count} Ansicht${count === 1 ? '' : 'en'} ausgeblendet.`,
          showAction: 'Einblenden',
          hideAction: 'Ausblenden',
          suffix: 'Kompatibilitätsansicht',
        },
      }
    : {
        title: 'My Curriculum',
        subtitle: 'Choose jurisdiction, secondary stages, and subjects. Gymnasium duration is offered per subject from curriculum data.',
        preferencesTitle: 'Learning settings',
        randomStrategy: 'Random (variety)',
        sequentialStrategy: 'Step by step',
        autoPilotTitle: 'Enable autopilot',
        autoPilotDescription: 'Automatically starts the next goal after completion.',
        strictModeTitle: 'Enable strict mode',
        strictModeDescription: 'Checks all prerequisites globally, even outside your current focus.',
        showGoalVisualizationsInChatTitle: 'Show learning-goal images in chat',
        showGoalVisualizationsInChatDescription: 'Displays available images for atomic learning goals directly in chat.',
        closeAction: 'Close',
        savePending: 'Saving...',
        doneAction: 'Done',
        retirement: {
          title: 'Legacy View',
          subtitle: 'This legacy view remains available only for migration, comparison, and audit.',
          noticeTitle: 'Available only for migration and audit',
          noticeBodyPrimary: 'Subject and filter changes are no longer maintained in this frozen legacy view. Ongoing work should move the learner state to Gymnasium (DE).',
          noticeBodySecondary: 'The current legacy view remains visible for comparison for now, but it is no longer a regular configuration path.',
        },
        compatibility: {
          title: 'Compatibility Views',
          subtitle: 'These frozen legacy views remain available only for migration, comparison, and audit.',
          hiddenSummary: (count: number) => `${count} view${count === 1 ? '' : 's'} hidden.`,
          showAction: 'Show',
          hideAction: 'Hide',
          suffix: 'Compatibility view',
        },
      }),
})

export const getClassSetupCopy = (language: LabelLanguage): ClassSetupCopy => ({
  ...getSharedCurriculumSetupCopy(language),
  ...(language === 'de'
    ? {
        title: 'Neue Klasse / Kurs anlegen',
        classNameLabel: 'Bezeichnung',
        classNamePlaceholder: 'z.B. Physik LK',
        selectSubjectFirst: 'Bitte wähle zuerst ein Fach aus.',
        selectStageFirst: 'Bitte wähle mindestens eine Sekundarstufe aus.',
        createLearnerFailedStatus: (status: number) => `Anlegen fehlgeschlagen (Status ${status}).`,
        createLearnerFailedGeneric: 'Anlegen der SkillPilot-ID fehlgeschlagen.',
        missingSkillpilotId: 'Keine SkillPilot-ID erhalten.',
        landscapeLabel: 'Fach / Landscape',
        levelFilterLabel: 'Filter / Niveau',
        noAdditionalCourseFilter: 'Kein zusätzlicher Kursfilter verfügbar',
        courseFilterOnlySek2: 'Kursniveau nur für Sekundarstufe II relevant',
        studentsLabel: 'Schülerliste (Namen)',
        studentsHint: 'Ein Name pro Zeile oder durch Komma getrennt. Die Zuordnung Name ↔ SkillPilot-ID wird nur lokal gespeichert.',
        studentsPlaceholder: 'Peter\nFranz\nSimone',
        errorPrefix: 'Fehler',
        cancel: 'Abbrechen',
        submit: 'Klasse anlegen & IDs generieren',
      }
    : {
        title: 'Create Class / Course',
        classNameLabel: 'Label',
        classNamePlaceholder: 'e.g. Physics advanced course',
        selectSubjectFirst: 'Please choose a subject first.',
        selectStageFirst: 'Please choose at least one secondary stage.',
        createLearnerFailedStatus: (status: number) => `Creation failed (status ${status}).`,
        createLearnerFailedGeneric: 'Failed to create SkillPilot ID.',
        missingSkillpilotId: 'No SkillPilot ID returned.',
        landscapeLabel: 'Subject / Landscape',
        levelFilterLabel: 'Filter / Level',
        noAdditionalCourseFilter: 'No additional course-level filter available',
        courseFilterOnlySek2: 'Course-level filters are only relevant for upper secondary',
        studentsLabel: 'Student list (names)',
        studentsHint: 'One name per line or separated by commas. The mapping name ↔ SkillPilot ID is stored locally only.',
        studentsPlaceholder: 'Peter\nFranz\nSimone',
        errorPrefix: 'Error',
        cancel: 'Cancel',
        submit: 'Create class & generate IDs',
      }),
})
