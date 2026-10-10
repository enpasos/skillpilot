// SPDX-License-Identifier: Apache-2.0
// Actual normal native rendering of affected contexts; no scientific verdict.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../..')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}
const bind = (path: string) => ({ path: relative(root, path), sha256: createHash('sha256').update(readFileSync(path)).digest('hex'), bytes: readFileSync(path).length })
const { loadGoalBookBuildInputs, writeGoalBookModel } = await import(pathToFileURL(join(root, 'app/scripts/goalBookModel.ts')).href)
const { buildGoalDescriptionRolloutSubsetModel } = await import(pathToFileURL(join(root, 'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const { writeGoalBookHtml, writeGoalBookPdf, writeGoalBookRenderManifest } = await import(pathToFileURL(join(root, 'app/scripts/goalBookRenderer.ts')).href)
const { chromium } = await import(pathToFileURL(join(root, 'app/node_modules/playwright/index.mjs')).href)
const raw = read(join(here, 'native/current-whole-selected-pages-and-contexts.raw.json'))
const parents = ['7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc']
const existingPageIds = raw.affectedExistingPages.filter((r: any) => r.currentPage && r.candidatePage).map((r: any) => r.goalId)
const routineIds = raw.candidateRoutinePages.map((r: any) => r.goalId)
const receipts: any[] = []
for (const [role, config, selected] of [
  ['baseline-affected-contexts', 'baseline-native-book.config.json', [...parents, ...existingPageIds]],
  ['candidate-affected-contexts', 'candidate-native-book.config.json', [...routineIds, ...existingPageIds]],
] as const) {
  const input = await loadGoalBookBuildInputs(relative(root, join(here, 'candidate', config)), root)
  const selectedSet = new Set(selected)
  const orderedIds = input.model.pages.filter((p: any) => selectedSet.has(p.goalId)).map((p: any) => p.goalId)
  if (orderedIds.length !== selectedSet.size) throw new Error('Missing requested full context page')
  const model = buildGoalDescriptionRolloutSubsetModel({ baseModel: input.model, goalIds: orderedIds, bookId: `chemie-b007-current206-${role}`, title: `B007 author actual native ${role}` })
  const dir = join(here, 'native', role, 'bundle')
  const options = { feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback', publicRoot: join(root, 'app/public'), printDerivativeProfile: 'bounded-atlas' as const }
  await writeGoalBookModel(model, join(dir, 'book-model.json'))
  const html = await writeGoalBookHtml(model, join(dir, 'book.html'), options)
  await writeGoalBookRenderManifest(html, join(dir, 'book.html.render-manifest.json'))
  const pdf = await writeGoalBookPdf(model, join(dir, 'book.pdf'), options)
  await writeGoalBookRenderManifest(pdf, join(dir, 'book.pdf.render-manifest.json'))
  receipts.push({ role, fullAffectedPageCount: model.pages.length, exactGoalIds: model.pages.map((p: any) => p.goalId), fullPageFingerprints: model.pages.map((p: any) => ({ goalId: p.goalId, goalFingerprint: p.goalFingerprint, pageFingerprint: p.pageFingerprint })), model: bind(join(dir, 'book-model.json')), html: bind(join(dir, 'book.html')), pdf: bind(join(dir, 'book.pdf')), htmlRenderManifest: bind(join(dir, 'book.html.render-manifest.json')), pdfRenderManifest: bind(join(dir, 'book.pdf.render-manifest.json')), nativeDePages: true, ENDescriptionsAndProfilesAreBoundInWholeCanonicalAndPInputs: true, independentScienceReview: false })
}
const browser = await chromium.launch({ headless: true })
const screenshots: any[] = []
try {
  for (const id of parents) {
    const current = raw.affectedExistingPages.find((r: any) => r.goalId === id)
    const source = join(root, 'app/public/assets/goal-visualizations/chemie', id, `${id}.jpg`)
    const original = readFileSync(source)
    for (const width of [360, 680]) {
      const page = await browser.newPage({ viewport: { width, height: 700 }, deviceScaleFactor: 1 })
      try {
        await page.setContent(`<html><body style="margin:0"><img id="actual" alt="Current unmodified goal visualization" style="display:block;width:${width}px;height:auto" src="data:image/jpeg;base64,${original.toString('base64')}" /></body></html>`)
        await page.locator('#actual').evaluate((img: any) => img.decode())
        const output = join(here, 'native/image-qa-captures', `${id}.browser-${width}px.png`)
        mkdirSync(dirname(output), { recursive: true })
        await page.locator('#actual').screenshot({ path: output })
        const measured = await page.locator('#actual').evaluate((img: any) => ({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, renderedWidth: img.getBoundingClientRect().width, renderedHeight: img.getBoundingClientRect().height }))
        screenshots.push({ goalId: id, original: bind(source), browserCapture: bind(output), measured, candidateLearningAsset: false, role: 'actual responsive QA capture only' })
      } finally { await page.close() }
    }
  }
} finally { await browser.close() }
write(join(here, 'checks/native-affected-context-render-and-responsive-captures.actual.json'), { schemaVersion: 1, createdAtUTC: new Date().toISOString(), receipts, screenshots, activeWrites: false, newLearningImagesGenerated: 0, scientificApproval: false, humanApproval: false, humanTrial: false })
console.log(JSON.stringify({ nativeContextPages: receipts.map(r => [r.role, r.fullAffectedPageCount]), responsiveImageCaptures: screenshots.length, activeWrites: false, scientificApproval: false }))
