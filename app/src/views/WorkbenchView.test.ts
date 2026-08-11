import { GOAL_BOOK_PDF_URL } from '../utils/goalBookRuntime'
import { WORKBENCH_REVIEW_LINK_DEFINITIONS } from './workbenchReviewLinks'

const ensure = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message)
}

for (const language of ['de', 'en'] as const) {
  const reviewTools = WORKBENCH_REVIEW_LINK_DEFINITIONS[language]

  ensure(reviewTools.length === 2, `${language}: expected exactly two review entries`)

  const webEntry = reviewTools.find((tool) => tool.path === '/lernzielbuch')
  ensure(webEntry !== undefined, `${language}: missing learning-goal book web entry`)
  ensure(webEntry?.download !== true, `${language}: web entry must use SPA navigation`)

  const pdfEntry = reviewTools.find((tool) => tool.path === GOAL_BOOK_PDF_URL)
  ensure(pdfEntry !== undefined, `${language}: missing learning-goal book PDF entry`)
  ensure(pdfEntry?.download === true, `${language}: PDF entry must be a download`)

  ensure(
    reviewTools.every((tool) => !tool.path.startsWith('/api/')),
    `${language}: review entries must remain read-only public routes`,
  )
}

console.log('Workbench learning-goal book links passed')
