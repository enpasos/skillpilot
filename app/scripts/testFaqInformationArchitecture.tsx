import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

import { LanguageProvider } from '../src/contexts/LanguageContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { CoachProviderMatrixView } from '../src/views/CoachProviderMatrixView'
import { FaqView } from '../src/views/FaqView'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

let selectedLanguage: 'de' | 'en' = 'de'

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => (key === 'skillpilot_lang' ? selectedLanguage : null),
    setItem: () => undefined,
  },
})

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: {
    matchMedia: () => ({ matches: false }),
  },
})

const renderPublicView = (view: React.ReactNode, path: string) => renderToStaticMarkup(
  <MemoryRouter initialEntries={[path]}>
    <LanguageProvider>
      <ThemeProvider>
        {view}
      </ThemeProvider>
    </LanguageProvider>
  </MemoryRouter>,
)

for (const language of ['de', 'en'] as const) {
  selectedLanguage = language
  const faqHtml = renderPublicView(<FaqView />, '/faq')
  assert(
    faqHtml.includes(language === 'de' ? 'Häufige Fragen zu SkillPilot' : 'Frequently asked questions about SkillPilot'),
    `${language}: FAQ keeps its learner-facing title`,
  )
  assert(faqHtml.includes('href="/faq/coach-setup"'), `${language}: FAQ links to the setup details one level deeper`)
  assert(!faqHtml.includes('id="coach-provider-matrix-title"'), `${language}: FAQ does not render the provider matrix inline`)
  assert(faqHtml.includes('max-w-5xl'), `${language}: FAQ keeps its uniform reading width`)

  const detailHtml = renderPublicView(<CoachProviderMatrixView />, '/faq/coach-setup')
  assert(detailHtml.includes('<h1'), `${language}: setup detail page has a page heading`)
  assert(detailHtml.includes('id="coach-provider-matrix-title"'), `${language}: setup detail page renders the provider matrix`)
  assert(detailHtml.includes('href="/faq"'), `${language}: setup detail page links back to the FAQ`)
  assert(detailHtml.includes('max-w-[1800px]'), `${language}: setup detail page provides the matrix with a wide layout`)
}

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
assert(
  appSource.includes("'/faq/coach-setup'") && appSource.includes("path === '/faq/coach-setup'"),
  'setup detail page is registered as a public route with dedicated metadata',
)
assert(
  (appSource.match(/<Route path="\/faq\/coach-setup"/g) ?? []).length === 2,
  'setup detail page is registered in both public route trees',
)

console.log('FAQ information architecture tests passed')
