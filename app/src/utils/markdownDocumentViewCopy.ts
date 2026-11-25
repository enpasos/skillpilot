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
        en: 'quickstart guide',
        de: 'Quickstart-Anleitung',
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
          description: 'Eine kurze Einführung in die Idee hinter SkillPilot und den Ansatz mit dem Skill-Graph.',
        },
      }
    : {
        en: {
          eyebrow: 'Quickstart video',
          title: 'Watch how to start learning',
          description: 'About 3 min · SkillPilot screens, demo data and a sample chat. AI voice and English captions.',
        },
        de: {
          eyebrow: 'Quickstart-Video',
          title: 'Der Lernstart im Video',
          description: 'Rund 3 Min. · SkillPilot-Oberfläche mit Demodaten und Beispielchat. KI-Stimme und deutsche Untertitel.',
        },
      }

  return language === 'en'
    ? {
        back: 'Back to App',
        switchLabel: 'Deutsch',
        loading: `Loading ${subject.en}...`,
        error: `${subject.en} could not be loaded.`,
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
