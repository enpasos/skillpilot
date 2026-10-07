// SPDX-License-Identifier: Apache-2.0
// Targeted orchestration using unchanged production book and review contracts.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { loadGoalBookBuildInputs, writeGoalBookModel } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { writeGoalBookHtml, writeGoalBookPdf, writeGoalBookRenderManifest } from '../../../../../../../app/scripts/goalBookRenderer'
import { buildGoalBookReviewBundle } from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import { createGoalDescriptionReviewCampaignArtifacts } from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'

const repo = resolve('.')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-and-length-targeted-author-v3'
const goalId = 'ac9e824f-003c-50ac-8751-2b8456004c63'
const bookConfigPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const write = (path: string, value: unknown) => {
  mkdirSync(dirname(resolve(repo, path)), { recursive: true })
  writeFileSync(resolve(repo, path), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
}
const binding = (path: string) => ({ path, sha256: createHash('sha256').update(readFileSync(resolve(repo, path))).digest('hex') })
const beforePath = own + '/before.full-390.book-model.json'
const current = await loadGoalBookBuildInputs(bookConfigPath, repo)
if (process.argv.includes('--save-before')) {
  if (existsSync(resolve(repo, beforePath))) throw new Error('Before model already archived')
  await writeGoalBookModel(current.model, resolve(repo, beforePath))
  console.log(JSON.stringify({ beforePages: current.model.pages.length, beforeDigest: current.model.digest }))
} else {
  if (!existsSync(resolve(repo, beforePath))) throw new Error('Before model required')
  const before = JSON.parse(readFileSync(resolve(repo, beforePath), 'utf8'))
  const oldById = new Map<string, any>(before.pages.map((p: any) => [p.goalId, p]))
  const deltas = current.model.pages.filter((p) => oldById.get(p.goalId)?.pageFingerprint !== p.pageFingerprint).map((p) => p.goalId)
  if (current.model.pages.length !== 390 || before.pages.length !== 390 || deltas.length !== 1 || deltas[0] !== goalId) throw new Error('Unexpected page changes: ' + JSON.stringify(deltas))
  const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: current.model, goalIds: [goalId], bookId: 'de-gym-biologie-carrier-image-targeted-20261006-v3', title: 'Biologie – verdeckte Helixfortsetzung und Genlänge, gezielte maschinelle Seitenprüfung' })
  const modelPath = own + '/single.book-model.json'
  await writeGoalBookModel(current.model, resolve(repo, own, 'current.full-390.book-model.json'))
  await writeGoalBookModel(subset, resolve(repo, modelPath))
  const render = own + '/render/carrier.book'
  const opts = { publicRoot: resolve(repo, 'app/public'), feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback', printDerivativeProfile: 'bounded-atlas' as const }
  const html = await writeGoalBookHtml(subset, resolve(repo, render + '.html'), opts)
  await writeGoalBookRenderManifest(html, resolve(repo, render + '.html.render-manifest.json'))
  const pdf = await writeGoalBookPdf(subset, resolve(repo, render + '.pdf'), opts)
  await writeGoalBookRenderManifest(pdf, resolve(repo, render + '.pdf.render-manifest.json'))
  const bundleDir = resolve(repo, own, 'bundle')
  const bundle = await buildGoalBookReviewBundle(subset, {
    modelPath: resolve(repo, modelPath), pdfPath: resolve(repo, render + '.pdf'), pdfRenderManifestPath: resolve(repo, render + '.pdf.render-manifest.json'),
    htmlPath: resolve(repo, render + '.html'), htmlRenderManifestPath: resolve(repo, render + '.html.render-manifest.json'), outputDirectory: bundleDir,
    promptPath: resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),
    criteriaPath: resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'), goalIds: [],
  })
  for (const file of bundle.files) { const path = resolve(bundleDir, file.relativePath); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, file.content, { flag: 'wx' }) }
  write(own + '/bundle/manifest.json', bundle.manifest)
  const rounds: any[] = []
  for (const round of ['a', 'b']) {
    const artifacts = await createGoalDescriptionReviewCampaignArtifacts({
      bundleBytes: readFileSync(resolve(bundleDir, 'manifest.json')), bookModelBytes: readFileSync(resolve(bundleDir, 'book-model.json')), reviewInputBytes: readFileSync(resolve(bundleDir, 'review-input.json')),
      bundleDirectory: bundleDir, outputDirectory: resolve(repo, own, 'round-' + round),
      campaignOptions: { campaignId: 'biologie-carrier-image-targeted-v3-' + round, roundId: 'independent-' + round, reviewerRole: 'internal_ai_reviewer', reviewPass: 'first_pass', independenceGroupId: 'biologie-carrier-image-targeted-v3-independent-' + round, blindToOtherReviews: true, batchSize: 1 },
    })
    rounds.push({ round, goalCount: artifacts.input.goals.length, inputFingerprint: artifacts.input.reviewInputFingerprint })
  }
  write(own + '/current-single-page-native-inputs.actual.json', {
    schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'actual native targeted page preparation; independent description reviews pending',
    fullCurrentPageCount: 390, changedPageGoalIds: deltas, other389PageFingerprintsExact: true,
    singlePageFingerprint: current.model.pages.find((p) => p.goalId === goalId)!.pageFingerprint,
    sourceConfig: binding(bookConfigPath), beforeModel: binding(beforePath), currentModel: binding(own + '/current.full-390.book-model.json'),
    actualRenderArtifacts: [render + '.html', render + '.pdf', render + '.html.render-manifest.json', render + '.pdf.render-manifest.json'].map(binding),
    physicalPDFPages: pdf.physicalPageCount, bundleFingerprint: bundle.manifest.bundleFingerprint, rounds,
    existingGoalTextsChanged: false, full390PDFRendered: false, humanApproval: false, humanTrial: false, strictNetGain: 0,
  })
  console.log(JSON.stringify({ selectedPages: 1, unchangedPages: 389, rounds, bundleFingerprint: bundle.manifest.bundleFingerprint }))
}
