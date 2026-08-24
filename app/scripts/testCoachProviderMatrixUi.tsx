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
  assert(html.includes('type="radio"'), `${language}: provider selection uses accessible radio controls`)
  assert(html.includes('name="coach-provider-filter" checked="" value="ChatGPT"'), `${language}: ChatGPT is the default provider view`)
  assert(html.includes('value="Claude"'), `${language}: Claude can be selected as a provider view`)
  assert(html.includes('aria-controls="coach-provider-results"'), `${language}: provider controls identify the results region`)
  assert(html.includes('id="coach-provider-results"'), `${language}: provider results expose the referenced region ID`)
  assert(html.includes('role="region"'), `${language}: the desktop comparison has a named scroll region`)
  assert(/role="region" aria-label="[^"]+"/.test(html), `${language}: the desktop comparison has a non-empty accessible name`)
  assert(html.includes('tabindex="0"'), `${language}: the desktop comparison can receive keyboard focus`)
  assert(html.includes('sticky left-0 z-30'), `${language}: first desktop header cell remains visible during horizontal scrolling`)
  assert(html.includes('overflow-x-auto'), `${language}: the matrix keeps horizontal comparison scrolling where needed`)
  assert(!html.includes('max-h-[72vh]'), `${language}: the matrix is not trapped in an inner vertical viewport`)
  assert(!html.includes('overflow-auto'), `${language}: the matrix does not reintroduce two-axis nested scrolling`)
  assert(html.includes('mt-8 w-full'), `${language}: the matrix uses the width provided by its detail page`)
  assert(!html.includes('w-[calc(100vw-2rem)]'), `${language}: the matrix no longer breaks out of its page container`)
  assert(!html.includes('left-1/2'), `${language}: the matrix no longer relies on viewport-centering offsets`)
  assert(html.includes('min-w-[1260px]'), `${language}: the default ChatGPT table uses the compact provider-specific width`)
  assert(html.includes('target="_blank"'), `${language}: official provider sources open separately`)
  assert(!html.includes('skillpilotId'), `${language}: no internal permanent-ID field name is rendered`)
  assert(!html.includes('stateVersion'), `${language}: no internal state field is rendered`)
  assert(
    language === 'de'
      ? html.includes('Claude: separater Custom Connector')
      : html.includes('Claude: separate Custom Connector'),
    `${language}: the learner-facing matrix links the separate Custom Connector fact to its official source`,
  )
  assert(!html.includes('OpenAI-Review'), `${language}: no provider review process is rendered for learners`)
}

console.log('Coach provider matrix UI tests passed')
