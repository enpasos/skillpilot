import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CoachProviderMatrix } from '../src/components/CoachProviderMatrix'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

for (const language of ['de', 'en'] as const) {
  const html = renderToStaticMarkup(<CoachProviderMatrix language={language} />)

  assert(html.includes('<table'), `${language}: desktop matrix table is rendered`)
  assert(html.includes('<caption'), `${language}: matrix table has an accessible caption`)
  assert(html.includes('<details'), `${language}: mobile provider cards are rendered as expandable details`)
  assert(html.includes('sm:hidden'), `${language}: mobile provider cards have a responsive visibility boundary`)
  assert(html.includes('sm:block'), `${language}: desktop matrix has a responsive visibility boundary`)
  assert(html.includes('sticky left-0 top-0'), `${language}: first desktop header cell remains visible while scrolling`)
  assert(html.includes('max-h-[72vh] overflow-auto'), `${language}: the wide matrix scrolls inside its own container`)
  assert(html.includes('target="_blank"'), `${language}: official provider sources open separately`)
  assert(!html.includes('skillpilotId'), `${language}: no internal permanent-ID field name is rendered`)
  assert(!html.includes('stateVersion'), `${language}: no internal state field is rendered`)
}

console.log('Coach provider matrix UI tests passed')
