/// <reference types="node" />

import { readFileSync } from 'node:fs'

import { GOAL_BOOK_PDF_URL, PHYSICS_GOAL_BOOK_PDF_URL } from '../utils/goalBookRuntime'
import { goalBookRoute } from '../utils/goalBookPublicationRegistry'
import { WORKBENCH_REVIEW_LINK_DEFINITIONS } from './workbenchReviewLinks'

const ensure = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message)
}

for (const language of ['de', 'en'] as const) {
  const reviewTools = WORKBENCH_REVIEW_LINK_DEFINITIONS[language]

  ensure(reviewTools.length === 4, `${language}: expected exactly four subject-specific review entries`)

  const webEntry = reviewTools.find((tool) => tool.path === '/lernzielbuch')
  ensure(webEntry !== undefined, `${language}: missing learning-goal book web entry`)
  ensure(webEntry?.download !== true, `${language}: web entry must use SPA navigation`)

  const pdfEntry = reviewTools.find((tool) => tool.path === GOAL_BOOK_PDF_URL)
  ensure(pdfEntry !== undefined, `${language}: missing learning-goal book PDF entry`)
  ensure(pdfEntry?.download === true, `${language}: PDF entry must be a download`)

  const physicsWebEntry = reviewTools.find(
    (tool) => tool.path === goalBookRoute('de-gym-physik-bundesweit'),
  )
  ensure(physicsWebEntry !== undefined, `${language}: missing physics learning-goal book web entry`)
  ensure(physicsWebEntry?.download !== true, `${language}: physics web entry must use SPA navigation`)

  const physicsPdfEntry = reviewTools.find((tool) => tool.path === PHYSICS_GOAL_BOOK_PDF_URL)
  ensure(physicsPdfEntry !== undefined, `${language}: missing physics learning-goal book PDF entry`)
  ensure(physicsPdfEntry?.download === true, `${language}: physics PDF entry must be a download`)

  ensure(
    reviewTools.every((tool) => !tool.path.startsWith('/api/')),
    `${language}: review entries must remain read-only public routes`,
  )
}

const sessionSetupSource = readFileSync(
  new URL('../components/SessionSetup.tsx', import.meta.url),
  'utf8',
)
const publicSitemap = readFileSync(
  new URL('../../public/sitemap.xml', import.meta.url),
  'utf8',
)

ensure(
  /const PUBLIC_GOAL_BOOK_PROMOTION_ENABLED = false/u.test(sessionSetupSource),
  'public learning-goal book promotion must stay disabled until an explicit release decision',
)
ensure(
  !publicSitemap.includes('https://skillpilot.com/lernzielbuch'),
  'public sitemap must not promote the Workbench-only learning-goal book',
)

console.log('Workbench learning-goal book links passed')
