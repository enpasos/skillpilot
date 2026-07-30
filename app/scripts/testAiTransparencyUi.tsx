import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AudioPlayer } from '../src/components/AudioPlayer'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import { de } from '../src/locales/de'
import { en } from '../src/locales/en'
import { getLegalViewCopy } from '../src/utils/legalViewCopy'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const storedValues = new Map<string, string>()
const localStorageStub: Storage = {
  get length() {
    return storedValues.size
  },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => [...storedValues.keys()][index] ?? null,
  removeItem: (key) => {
    storedValues.delete(key)
  },
  setItem: (key, value) => {
    storedValues.set(key, String(value))
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageStub,
})

const renderAudioPlayer = (language: 'de' | 'en', compact: boolean) => {
  localStorageStub.setItem('skillpilot_lang', language)
  return renderToStaticMarkup(
    createElement(
      LanguageProvider,
      null,
      createElement(AudioPlayer, { compact }),
    ),
  )
}

const compactGermanPlayer = renderAudioPlayer('de', true)
assert(
  compactGermanPlayer.includes('Diese Audioeinführung enthält KI-erzeugte Stimmen.'),
  'compact German audio player shows the AI voice notice before playback',
)
assert(
  compactGermanPlayer.includes('role="note"') && compactGermanPlayer.includes('aria-describedby='),
  'compact audio player exposes the notice as an accessible description of the play button',
)

const regularEnglishPlayer = renderAudioPlayer('en', false)
assert(
  regularEnglishPlayer.includes('This audio introduction contains AI-generated voices.'),
  'regular English audio player shows the AI voice notice before playback',
)
assert(
  regularEnglishPlayer.includes('role="note"') && regularEnglishPlayer.includes('aria-describedby='),
  'regular audio player exposes the notice as an accessible description of the play button',
)

assert(
  de.startPage.login.aiCoachNotice.includes('KI-Assistent')
    && de.startPage.login.aiCoachNotice.includes('Fehler'),
  'German coach start copy identifies the AI assistant and warns about errors',
)
assert(
  en.startPage.login.aiCoachNotice.includes('AI assistant')
    && en.startPage.login.aiCoachNotice.includes('mistakes'),
  'English coach start copy identifies the AI assistant and warns about errors',
)

const germanLegalCopy = getLegalViewCopy('de').markdown
const englishLegalCopy = getLegalViewCopy('en').markdown
const repositoryLegalCopy = readFileSync(
  new URL('../../LEGAL.md', import.meta.url),
  'utf8',
)
const extractGermanAiSection = (markdown: string) => {
  const match = markdown.match(
    /## KI-Transparenz\n\n([\s\S]*?)(?=\n## )/u,
  )
  return (match?.[1].trim() ?? '').replace(
    'https://skillpilot.com/privacy',
    '/privacy',
  )
}
assert(
  germanLegalCopy.includes('## KI-Transparenz')
    && germanLegalCopy.includes('Art. 50')
    && germanLegalCopy.includes('ersetzt dieser allgemeine Hinweis sie nicht'),
  'German legal copy explains AI transparency without presenting the general notice as a substitute',
)
assert(
  englishLegalCopy.includes('## AI Transparency')
    && englishLegalCopy.includes('Article 50')
    && englishLegalCopy.includes('this general notice does not replace it'),
  'English legal copy explains AI transparency without presenting the general notice as a substitute',
)
assert(
  extractGermanAiSection(germanLegalCopy) !== ''
    && extractGermanAiSection(germanLegalCopy) === extractGermanAiSection(repositoryLegalCopy),
  'German runtime and repository legal copy use the same AI-transparency section',
)
assert(
  germanLegalCopy.includes('Dieser Hinweis begründet keinen Haftungsverzicht')
    && englishLegalCopy.includes('does not constitute a waiver of liability'),
  'legal copy separates transparency from a liability waiver in both languages',
)

console.log('AI transparency UI tests passed')
