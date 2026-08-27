import type { LabelLanguage } from './filterLabels'

export interface SkillPilotOverviewFormatCopy {
  eyebrow: string
  title: string
  description: string
  action: string
}

export interface SkillPilotOverviewCopy {
  title: string
  description: string
  cardDescription: string
  formatsLabel: string
  formatNavigationLabel: string
  formats: {
    audio: SkillPilotOverviewFormatCopy
    video: SkillPilotOverviewFormatCopy
    whitepaper: SkillPilotOverviewFormatCopy
  }
}

export const getSkillPilotOverviewCopy = (
  language: LabelLanguage,
): SkillPilotOverviewCopy => (
  language === 'en'
    ? {
        title: 'SkillPilot at a glance',
        description: 'Discover the idea behind SkillPilot—listen, watch, or explore it in depth.',
        cardDescription: 'The idea behind SkillPilot—listen, watch, or read.',
        formatsLabel: 'Available formats',
        formatNavigationLabel: 'Choose a format',
        formats: {
          audio: {
            eyebrow: 'Listen',
            title: 'Audio introduction',
            description: 'The idea behind SkillPilot, explained in a compact audio format.',
            action: 'Start audio',
          },
          video: {
            eyebrow: 'Watch',
            title: 'Presentation video',
            description: 'Explore the concept through slides and illustrations.',
            action: 'Watch video',
          },
          whitepaper: {
            eyebrow: 'Read',
            title: 'Whitepaper',
            description: 'Background, architecture, and implementation in detail.',
            action: 'Read whitepaper',
          },
        },
      }
    : {
        title: 'SkillPilot im Überblick',
        description: 'Lerne die Idee hinter SkillPilot kennen – zum Anhören, Ansehen oder vertieften Lesen.',
        cardDescription: 'Die Idee hinter SkillPilot – anhören, ansehen oder lesen.',
        formatsLabel: 'Verfügbare Formate',
        formatNavigationLabel: 'Format wählen',
        formats: {
          audio: {
            eyebrow: 'Anhören',
            title: 'Audio-Einführung',
            description: 'Die Idee hinter SkillPilot kompakt als Audio erklärt.',
            action: 'Audio starten',
          },
          video: {
            eyebrow: 'Ansehen',
            title: 'Präsentationsvideo',
            description: 'Das Konzept anhand von Folien und Bildern kennenlernen.',
            action: 'Video ansehen',
          },
          whitepaper: {
            eyebrow: 'Lesen',
            title: 'Whitepaper',
            description: 'Hintergründe, Architektur und Umsetzung im Detail.',
            action: 'Whitepaper lesen',
          },
        },
      }
)
