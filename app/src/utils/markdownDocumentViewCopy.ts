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

  return language === 'en'
    ? {
        back: 'Back to App',
        switchLabel: 'Deutsch',
        loading: `Loading ${subject.en}...`,
        error: `${subject.de} could not be loaded.`,
        videoEyebrow: 'Watch the concept',
        videoTitle: 'SkillPilot in a nutshell',
        videoDescription: 'A short introduction to the ideas behind SkillPilot and its skill-graph approach.',
        videoOpen: 'Open video in a new tab',
      }
    : {
        back: 'Zurück zur App',
        switchLabel: 'English',
        loading: `${subject.de} wird geladen...`,
        error: `${subject.de} konnte nicht geladen werden.`,
        videoEyebrow: 'Konzeptvideo',
        videoTitle: 'SkillPilot kurz erklärt',
        videoDescription: 'Eine kurze Einführung in die Idee hinter SkillPilot und den Ansatz mit Kompetenzgraphen.',
        videoOpen: 'Video in neuem Tab öffnen',
      }
}
