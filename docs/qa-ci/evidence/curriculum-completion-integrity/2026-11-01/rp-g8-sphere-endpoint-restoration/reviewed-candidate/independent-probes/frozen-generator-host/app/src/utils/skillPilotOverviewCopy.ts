import type { LabelLanguage } from './filterLabels'

export interface SkillPilotOverviewFormatCopy {
  eyebrow: string
  title: string
  description: string
  action: string
}

export interface SkillPilotOverviewStatementCopy {
  heading: string
  tagline: string
  description: string
}

export interface SkillPilotOverviewCopy {
  title: string
  description: string
  cardDescription: string
  formatsLabel: string
  formatNavigationLabel: string
  disclosure: {
    label: string
    introduction: string
    vision: SkillPilotOverviewStatementCopy
    mission: SkillPilotOverviewStatementCopy
  }
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
        disclosure: {
          label: 'Vision & Mission',
          introduction: 'Vision and mission describe our long-term goal and the path towards it.',
          vision: {
            heading: 'Our vision',
            tagline: 'All knowledge. For everyone.',
            description: 'A world in which everyone can explore all of humanity’s knowledge—freely, on their own terms, and regardless of their financial means.',
          },
          mission: {
            heading: 'Our mission',
            tagline: 'SkillPilot makes knowledge navigable.',
            description: 'We create open knowledge landscapes that are developed collaboratively and remain under human responsibility for both their subject matter and pedagogy. They provide learners and their personal AI with reliable guidance and give educators insight into individual learning progress—as a basis for sound pedagogical decisions and targeted learning support.',
          },
        },
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
        disclosure: {
          label: 'Vision & Mission',
          introduction: 'Vision und Mission beschreiben unser langfristiges Ziel und den Weg dorthin.',
          vision: {
            heading: 'Unsere Vision',
            tagline: 'Alles Wissen. Für jeden Menschen.',
            description: 'Eine Welt, in der jeder Mensch sich das gesamte Wissen der Menschheit erschließen kann – frei, selbstbestimmt und unabhängig von seinen finanziellen Möglichkeiten.',
          },
          mission: {
            heading: 'Unsere Mission',
            tagline: 'SkillPilot macht Wissen navigierbar.',
            description: 'Wir schaffen offene Wissenslandschaften, die fachlich und didaktisch von Menschen verantwortet und gemeinschaftlich weiterentwickelt werden. Sie geben Lernenden und ihren persönlichen KIs verlässliche Orientierung und machen Lehrenden individuelle Lernfortschritte sichtbar – als Grundlage für fundierte pädagogische Entscheidungen und gezielte Lernbegleitung.',
          },
        },
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
