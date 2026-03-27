import type { LabelLanguage } from './filterLabels'

export interface UsersPageCopy {
  title: string
  subtitle: string
  loading: string
  error: string
  unknownError: string
  backToStats: string
  backToSkillPilot: string
  filters: {
    all: string
    withAchievements: string
    activeLastWeek: string
  }
  stats: {
    total: string
    achievements: string
  }
  chart: {
    title: string
    subtitle: string
    empty: string
    lastUpdated: string
  }
}

export interface UsersOperatorCopy {
  title: string
  description: string
  inputLabel: string
  inputPlaceholder: string
  idCountLabel: string
  validationRequired: string
  confirmation: string | ((count: number) => string)
  previewPending: string
  previewAction: string
  executePending: string
  executeAction: string
  runFailed: string
  requested: string
  eligible: string
  migrated: string
  alreadyCanonical: string
  unsupported: string
  noCurriculum: string
  notFound: string
  errors: string
  resultsPreview: string
  resultsExecution: string
  useEligibleIds: string
  exportCsv: string
  tableSkillpilotId: string
  tableStatus: string
  tablePlannedGoals: string
  tableMessage: string
  statusLabels: Record<string, string>
}

export const getUsersPageCopy = (language: LabelLanguage): UsersPageCopy => (
  language === 'de'
    ? {
        title: 'SkillPilot-IDs',
        subtitle: 'Ueberblick ueber generierte SkillPilot-IDs.',
        loading: 'Lade ID-Statistiken...',
        error: 'ID-Statistiken konnten nicht geladen werden.',
        unknownError: 'Unbekannter Fehler',
        backToStats: 'Zurueck zur Statistik',
        backToSkillPilot: 'Zurueck zu SkillPilot',
        filters: {
          all: 'Alle',
          withAchievements: 'Mit Erfolgen',
          activeLastWeek: 'Aktiv letzte Woche',
        },
        stats: {
          total: 'IDs gesamt',
          achievements: 'IDs mit Erfolgen',
        },
        chart: {
          title: 'Anzahl ueber Zeit',
          subtitle: 'Kumulierte Anzahl',
          empty: 'Noch keine Zeitreihendaten.',
          lastUpdated: 'Aktualisiert',
        },
      }
    : {
        title: 'SkillPilot IDs',
        subtitle: 'Overview of generated SkillPilot IDs.',
        loading: 'Loading ID stats...',
        error: 'Unable to load ID statistics.',
        unknownError: 'Unknown error',
        backToStats: 'Back to Statistics',
        backToSkillPilot: 'Back to SkillPilot',
        filters: {
          all: 'All',
          withAchievements: 'With Successes',
          activeLastWeek: 'Active Last Week',
        },
        stats: {
          total: 'Total IDs',
          achievements: 'IDs with successes',
        },
        chart: {
          title: 'IDs over time',
          subtitle: 'Cumulative total',
          empty: 'No time series data yet.',
          lastUpdated: 'Updated',
        },
      }
)

export const getUsersOperatorCopy = (language: LabelLanguage): UsersOperatorCopy => (
  language === 'de'
    ? {
        title: 'Gymnasium-DE Cutover',
        description:
          'Explizite SkillPilot-IDs aus eingefrorenen Hessen-Oberstufenansichten gesammelt auf Gymnasium (DE) umstellen. Es werden nur die eingegebenen IDs verarbeitet.',
        inputLabel: 'SkillPilot-IDs',
        inputPlaceholder: 'Eine ID pro Zeile oder durch Komma getrennt',
        idCountLabel: 'Erkannte IDs',
        validationRequired: 'Bitte gib mindestens eine SkillPilot-ID ein.',
        confirmation: (count: number) =>
          `Willst du wirklich ${count} Lernende auf Gymnasium (DE) umstellen?`,
        previewPending: 'Pruefe...',
        previewAction: 'Dry run pruefen',
        executePending: 'Migriere...',
        executeAction: 'Migration ausfuehren',
        runFailed: 'Bulk-Cutover fehlgeschlagen.',
        requested: 'Angefragt',
        eligible: 'Migrierbar',
        migrated: 'Migriert',
        alreadyCanonical: 'Schon DE',
        unsupported: 'Nicht unterstuetzt',
        noCurriculum: 'Ohne Curriculum',
        notFound: 'Nicht gefunden',
        errors: 'Fehler',
        resultsPreview: 'Dry-run-Ergebnisse',
        resultsExecution: 'Migrationsergebnisse',
        useEligibleIds: 'Nur migrierbare IDs uebernehmen',
        exportCsv: 'CSV herunterladen',
        tableSkillpilotId: 'SkillPilot ID',
        tableStatus: 'Status',
        tablePlannedGoals: 'Zielbaeume',
        tableMessage: 'Hinweis',
        statusLabels: {
          eligible: 'Migrierbar',
          migrated: 'Migriert',
          already_canonical: 'Bereits DE',
          unsupported_curriculum: 'Nicht unterstuetzt',
          no_curriculum: 'Kein Curriculum',
          not_found: 'Nicht gefunden',
          error: 'Fehler',
        },
      }
    : {
        title: 'Gymnasium DE Cutover',
        description:
          'Migrate explicit SkillPilot IDs from frozen Hesse upper-secondary views into Gymnasium (DE). Only the supplied IDs are processed.',
        inputLabel: 'SkillPilot IDs',
        inputPlaceholder: 'One ID per line or separated by commas',
        idCountLabel: 'Detected IDs',
        validationRequired: 'Please enter at least one SkillPilot ID.',
        confirmation: (count: number) =>
          `Do you really want to migrate ${count} learners to Gymnasium (DE)?`,
        previewPending: 'Previewing...',
        previewAction: 'Run dry preview',
        executePending: 'Migrating...',
        executeAction: 'Execute migration',
        runFailed: 'Bulk cutover failed.',
        requested: 'Requested',
        eligible: 'Eligible',
        migrated: 'Migrated',
        alreadyCanonical: 'Already DE',
        unsupported: 'Unsupported',
        noCurriculum: 'No curriculum',
        notFound: 'Not found',
        errors: 'Errors',
        resultsPreview: 'Dry-run results',
        resultsExecution: 'Migration results',
        useEligibleIds: 'Use eligible IDs only',
        exportCsv: 'Download CSV',
        tableSkillpilotId: 'SkillPilot ID',
        tableStatus: 'Status',
        tablePlannedGoals: 'Planned trees',
        tableMessage: 'Message',
        statusLabels: {
          eligible: 'Eligible',
          migrated: 'Migrated',
          already_canonical: 'Already DE',
          unsupported_curriculum: 'Unsupported',
          no_curriculum: 'No curriculum',
          not_found: 'Not found',
          error: 'Error',
        },
      }
)
