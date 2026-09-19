import type { CurriculumQualityFilter, CurriculumQualityStatus } from './curriculumQualityStatus'
export type {
  CurriculumHumanTrial, CurriculumQualityFilter, CurriculumQualityProjection, CurriculumQualityStatus,
} from './curriculumQualityStatus'
export { curriculumQualityStatuses } from './curriculumQualityStatus'

export const maturityOrder = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] as const
export type MaturityLevel = typeof maturityOrder[number]
export const isMaturityLevel = (value: unknown): value is MaturityLevel =>
  maturityOrder.includes(value as MaturityLevel)

// Fixed grey-to-green styles, with literal classes for Tailwind's scanner.
export const maturityClass: Record<MaturityLevel, string> = {
  M0: 'border-[#cbd5d0] bg-[#f1f4f2] text-[#33413a] dark:border-[#57635d] dark:bg-[#242b27] dark:text-[#e2e9e5]',
  M1: 'border-[#bdcec2] bg-[#e8efea] text-[#304539] dark:border-[#526f5e] dark:bg-[#26392e] dark:text-[#e0ece4]',
  M2: 'border-[#a6c3b0] bg-[#dceadf] text-[#294733] dark:border-[#547e63] dark:bg-[#294632] dark:text-[#e5f2e9]',
  M3: 'border-[#87b497] bg-[#c5dfce] text-[#254831] dark:border-[#58916c] dark:bg-[#2b5339] dark:text-[#ebf7ee]',
  M4: 'border-[#65a37a] bg-[#a4ceb2] text-[#203d2a] dark:border-[#6da980] dark:bg-[#2d603e] dark:text-[#f1fbf4]',
  M5: 'border-[#4e8f63] bg-[#7fb58f] text-[#183423] dark:border-[#80bd92] dark:bg-[#2f6b44] dark:text-[#f6fff8]',
  M6: 'border-[#2d7247] bg-[#367d4f] text-[#ffffff] dark:border-[#96d2a6] dark:bg-[#317648] dark:text-[#ffffff]',
  M7: 'border-[#164b2a] bg-[#1d5f35] text-[#ffffff] dark:border-[#b0ebbd] dark:bg-[#227b40] dark:text-[#ffffff]',
}
export const maturityCopy = {
  de: {
    label: 'QS-Reifegrad', routeLabel: 'Routenprüfung', subjectStatusTitle: 'Qualität pro Fach',
    goals: 'Ziele', atomicGoals: 'atomar', warnings: 'Warnungen', failures: 'Fehler',
    legendTitle: 'Was bedeuten M0–M7?', unknown: 'Prüfstand nicht verfügbar',
    legend: {
      M0: 'Noch kein belastbarer QS-Grundstand.',
      M1: 'Quellen und extrahierte Lehrplanziele sind erfasst und rückverfolgbar.',
      M2: 'Quellenabdeckung, Bundesland-Sichten und relevante Kurszuordnungen sind konsistent.',
      M3: 'Die erforderlichen Lernwege sind geschlossen und auf atomarer Ebene sauber modelliert.',
      M4: 'Die erforderlichen Lernwege einschließlich ihrer terminalen Übungs- und Prüfungsziele sind geprüft.',
      M5: 'Schulgeeigneter Kern-QS-Stand: Die verbindlichen Kernprüfungen sind bestanden.',
      M6: 'M5 einschließlich geprüfter Memory-Entscheidungen, Zuordnungen und Sichtbarkeit.',
      M7: 'M6 einschließlich vollständig abgeschlossener vertiefter Curriculum-QS aller aktuellen fachlichen Einzellernziele im ausgewiesenen Umfang.',
    },
  },
  en: {
    label: 'QA maturity', routeLabel: 'Route checks', subjectStatusTitle: 'Quality by subject',
    goals: 'goals', atomicGoals: 'atomic', warnings: 'warnings', failures: 'failures',
    legendTitle: 'What do M0–M7 mean?', unknown: 'Quality evidence unavailable',
    legend: {
      M0: 'No reliable QA baseline yet.',
      M1: 'Sources and extracted curriculum goals are recorded and traceable.',
      M2: 'Source coverage, jurisdiction views and relevant course assignments are consistent.',
      M3: 'The required learning routes are complete and properly modelled at atomic level.',
      M4: 'The required learning routes, including their terminal practice and assessment goals, have been reviewed.',
      M5: 'School-ready core QA: all mandatory core checks have passed.',
      M6: 'M5 including reviewed memory decisions, mappings and visibility.',
      M7: 'M6 including completed in-depth curriculum QA for all current atomic subject-learning goals in the stated scope.',
    },
  },
} as const
export const qualityStatusBadgeClass: Record<CurriculumQualityStatus, string> = {
  experimental: 'border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200',
  machine_qa: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-200',
  human_trial_in_progress: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
  human_trial_completed: 'border-emerald-800 bg-emerald-800 text-white dark:border-emerald-400 dark:bg-emerald-800 dark:text-white',
}
export const qualityStatusDotClass: Record<CurriculumQualityStatus, string> = {
  experimental: 'bg-stone-600 dark:bg-stone-300',
  machine_qa: 'bg-orange-700 dark:bg-orange-300',
  human_trial_in_progress: 'bg-emerald-600 dark:bg-emerald-300',
  human_trial_completed: 'bg-current',
}
export const qualityFilterActiveClass: Record<CurriculumQualityFilter, string> = {
  experimental: 'bg-stone-700 text-white shadow-sm',
  machine_qa: 'bg-orange-700 text-white shadow-sm',
  human_trial_in_progress: 'bg-emerald-700 text-white shadow-sm',
  human_trial_completed: 'bg-emerald-900 text-white shadow-sm',
  all: 'bg-sky-700 text-white shadow-sm',
}
export const getCurriculumQualityCopy = (language: 'de' | 'en') => {
  const statusLabels: Record<CurriculumQualityStatus, string> = language === 'de' ? {
    experimental: 'Experimentell', machine_qa: 'Maschinelle QS',
    human_trial_in_progress: 'Menschliche QS läuft', human_trial_completed: 'Menschlich erprobt',
  } : {
    experimental: 'Experimental', machine_qa: 'Automated QA',
    human_trial_in_progress: 'Human QA in progress', human_trial_completed: 'Human-tested',
  }
  const unknownLabel = maturityCopy[language].unknown
  return {
    label: language === 'de' ? 'QS-Status' : 'QA status', statusLabels,
    filterOptions: { ...statusLabels, all: language === 'de' ? 'Alle' : 'All' } as Record<CurriculumQualityFilter, string>,
    unknownLabel,
    statusTitle: (status: CurriculumQualityStatus | null) => status == null ? unknownLabel
      : `${language === 'de' ? 'QS-Status' : 'QA status'}: ${statusLabels[status]}`,
    trialExplanation: language === 'de'
      ? 'Der Reifegrad beschreibt den Prüfstand. Die menschliche Erprobung ist ein eigener Nachweis und kein Fehlerfreiheitssiegel.'
      : 'Maturity describes the QA baseline. Human trial is separate evidence and does not guarantee freedom from errors.',
    partialScope: language === 'de' ? 'Teilumfang' : 'Partial scope',
  }
}
