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

export const getUsersPageCopy = (language: LabelLanguage): UsersPageCopy => (
  language === 'de'
    ? {
        title: 'SkillPilot-IDs',
        subtitle: 'Überblick über generierte SkillPilot-IDs.',
        loading: 'Lade ID-Statistiken...',
        error: 'ID-Statistiken konnten nicht geladen werden.',
        unknownError: 'Unbekannter Fehler',
        backToStats: 'Zurück zur Statistik',
        backToSkillPilot: 'Zurück zu SkillPilot',
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
          title: 'Anzahl über Zeit',
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
