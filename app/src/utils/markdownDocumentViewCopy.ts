import type { LabelLanguage } from './filterLabels'

type MarkdownDocumentKind = 'story' | 'whitepaper'

export interface MarkdownDocumentViewCopy {
  back: string
  switchLabel: string
  loading: string
  error: string
  videoEyebrow: string
  videoTitle: string
  videoDescription: string
  videoOpen: string
}

export const getMarkdownDocumentViewCopy = (
  language: LabelLanguage,
  kind: MarkdownDocumentKind,
): MarkdownDocumentViewCopy => {
  const subject = kind === 'whitepaper'
    ? {
        en: 'whitepaper',
        de: 'Whitepaper',
      }
    : {
        en: 'story',
        de: 'Story',
      }

  const video = kind === 'whitepaper'
    ? {
        en: {
          eyebrow: 'Watch the concept',
          title: 'SkillPilot in a nutshell',
          description: 'A short introduction to the ideas behind SkillPilot and its skill-graph approach.',
        },
        de: {
          eyebrow: 'Konzeptvideo',
          title: 'SkillPilot kurz erklärt',
          description: 'Eine kurze Einführung in die Idee hinter SkillPilot und den Ansatz mit Kompetenzgraphen.',
        },
      }
    : {
        en: {
          eyebrow: 'Quickstart video',
          title: 'Start SkillPilot in 5 steps',
          description: 'The video shows the current browser workflow. The narration was generated with AI.',
        },
        de: {
          eyebrow: 'Quickstart-Video',
          title: 'SkillPilot in 5 Schritten starten',
          description: 'Das Video zeigt den aktuellen Browser-Ablauf. Die Tonspur wurde mit KI erzeugt.',
        },
      }

  return language === 'en'
    ? {
        back: 'Back to App',
        switchLabel: 'Deutsch',
        loading: `Loading ${subject.en}...`,
        error: `${subject.de} could not be loaded.`,
        videoEyebrow: video.en.eyebrow,
        videoTitle: video.en.title,
        videoDescription: video.en.description,
        videoOpen: 'Open video in a new tab',
      }
    : {
        back: 'Zurück zur App',
        switchLabel: 'English',
        loading: `${subject.de} wird geladen...`,
        error: `${subject.de} konnte nicht geladen werden.`,
        videoEyebrow: video.de.eyebrow,
        videoTitle: video.de.title,
        videoDescription: video.de.description,
        videoOpen: 'Video in neuem Tab öffnen',
      }
}
