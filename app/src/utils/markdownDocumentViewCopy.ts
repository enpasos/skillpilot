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
          title: 'Start with Claude in 5 steps',
          description: 'Set up SkillPilot, add the Claude marketplace and start learning in the Claude chat – step by step with real screen recordings. English AI-generated narration and English captions.',
        },
        de: {
          eyebrow: 'Quickstart-Video',
          title: 'In 5 Schritten mit Claude starten',
          description: 'SkillPilot einrichten, den Claude-Marketplace hinzufügen und im Claude-Chat loslernen – Schritt für Schritt mit echten Bildschirmaufnahmen. KI-generierte Sprecherstimme · deutsche Untertitel.',
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
