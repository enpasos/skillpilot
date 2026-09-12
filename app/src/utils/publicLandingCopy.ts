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
      description: 'Wähle dein Curriculum und starte mit Claude in die Lern-Beta. Dein Fortschritt bleibt erhalten.',
      primaryAction: 'Jetzt lernen',
      quickstartAction: '5-Minuten-Quickstart',
      faqAction: 'FAQ',
      accessSummary: 'Jetzt mit Claude lernen – auch in der App und mit Voice-Mode. ChatGPT ist noch nicht verfügbar.',
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
      description: 'Choose your curriculum and join the learning beta with Claude. Your progress is preserved.',
      primaryAction: 'Learn now',
      quickstartAction: '5-minute quickstart',
      faqAction: 'FAQ',
      accessSummary: 'Learn with Claude now – including the app and voice mode. ChatGPT is not available yet.',
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
