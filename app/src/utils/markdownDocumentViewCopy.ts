import type { LabelLanguage } from './filterLabels'

type MarkdownDocumentKind = 'story' | 'whitepaper'

export interface MarkdownDocumentViewCopy {
  back: string
  switchLabel: string
  loading: string
  error: string
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
      }
    : {
        back: 'Zurück zur App',
        switchLabel: 'English',
        loading: `${subject.de} wird geladen...`,
        error: `${subject.de} konnte nicht geladen werden.`,
      }
}
