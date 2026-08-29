import type { LabelLanguage } from './filterLabels'

interface SharedCurriculumSetupCopy {
  rootFilterLabel: string
  stageLabel: string
  durationModelLabel: string
  durationModelHint: string
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
  savePending: string
  doneAction: string
  compatibility: CompatibilitySetupCopy
}

export interface ClassSetupCopy extends SharedCurriculumSetupCopy {
  title: string
  editTitle: string
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
  submitEdit: string
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
        savePending: 'Speichert...',
        doneAction: 'Fertig',
        compatibility: {
          title: 'Kompatibilitätsansichten',
          subtitle: 'Diese eingefrorenen Legacy-Ansichten bleiben nur für Vergleich und Audit verfügbar.',
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
        savePending: 'Saving...',
        doneAction: 'Done',
        compatibility: {
          title: 'Compatibility Views',
          subtitle: 'These frozen legacy views remain available only for comparison and audit.',
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
        editTitle: 'Klasse / Kurs bearbeiten',
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
        submitEdit: 'Änderungen speichern',
      }
    : {
        title: 'Create Class / Course',
        editTitle: 'Edit Class / Course',
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
        submitEdit: 'Save changes',
      }),
})
