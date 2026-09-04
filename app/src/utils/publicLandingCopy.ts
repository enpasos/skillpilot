import type { LabelLanguage } from './filterLabels'

export interface PublicLandingCopy {
  sectionLabel: string
  learning: {
    title: string
    description: string
    primaryAction: string
    quickstartAction: string
    faqAction: string
    accessSummary: string
  }
  teaching: {
    title: string
    description: string
    primaryAction: string
  }
  curricula: {
    title: string
    description: string
    explorerAction: string
    goalBookAction: string
    championsAction: string
  }
  footer: {
    statistics: string
    terms: string
    privacy: string
    imprint: string
  }
}

const COPY: Record<LabelLanguage, PublicLandingCopy> = {
  de: {
    sectionLabel: 'Einstiege nach Anliegen',
    learning: {
      title: 'Lernen starten',
      description: 'Wähle dein Curriculum und starte deinen KI-Lerncoach. Dein Fortschritt bleibt erhalten.',
      primaryAction: 'Jetzt lernen',
      quickstartAction: '5-Minuten-Quickstart',
      faqAction: 'FAQ',
      accessSummary: 'Angeboten wird derzeit der Claude-1.1-Betakandidat; seine exakte Client-Abnahme und die ChatGPT-Freigabe stehen noch aus.',
    },
    teaching: {
      title: 'Kurse planen',
      description: 'Organisiere lokale Kurse und Lernpläne für deine Lernenden.',
      primaryAction: 'Kursorganisation öffnen',
    },
    curricula: {
      title: 'Curricula & Lernziele',
      description: 'Erkunde SkillGraphs und Lernzielbücher oder hilf mit, Curricula praxistauglich zu machen.',
      explorerAction: 'SkillGraph erkunden',
      goalBookAction: 'Lernzielbuch',
      championsAction: 'Curriculum-Champion werden',
    },
    footer: {
      statistics: 'Statistiken',
      terms: 'Nutzungsbedingungen',
      privacy: 'Datenschutz',
      imprint: 'Impressum',
    },
  },
  en: {
    sectionLabel: 'Entry points by need',
    learning: {
      title: 'Start learning',
      description: 'Choose your curriculum and start your AI learning coach. Your progress is preserved.',
      primaryAction: 'Learn now',
      quickstartAction: '5-minute quickstart',
      faqAction: 'FAQ',
      accessSummary: 'The Claude 1.1 beta candidate is currently offered; its exact client acceptance and ChatGPT approval are still pending.',
    },
    teaching: {
      title: 'Plan courses',
      description: 'Organize local courses and learning plans for your learners.',
      primaryAction: 'Open course organization',
    },
    curricula: {
      title: 'Curricula & learning goals',
      description: 'Explore SkillGraphs and learning goal books, or help make curricula work in practice.',
      explorerAction: 'Explore SkillGraph',
      goalBookAction: 'Learning goal book',
      championsAction: 'Become a Curriculum Champion',
    },
    footer: {
      statistics: 'Statistics',
      terms: 'Terms of Use',
      privacy: 'Privacy',
      imprint: 'Imprint',
    },
  },
}

export const getPublicLandingCopy = (language: LabelLanguage): PublicLandingCopy => COPY[language]
