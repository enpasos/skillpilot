import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readlinkSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs, compactGoalBookSourceAtlasReceipt } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { loadGoalBookBuildInputs, writeGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { writeGoalBookHtml, writeGoalBookPdf, writeGoalBookRenderManifest } from '../../../../../../../app/scripts/goalBookRenderer'
import { buildGoalBookReviewBundle } from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import { createGoalDescriptionReviewCampaignArtifacts } from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'

const repo = resolve('.')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
const output = resolve(repo, packagePath)
const v7Path = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-source-topic-corrections-author-v7'
const imagesPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-new-visuals-author-v1'
const visualPath = 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-seven-new-visuals-independent-v-qa-v1'
const mvEnvelopePath = process.env.BIO_Q1_MV_SOURCE_ENVELOPE ?? 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-mv-heading-location-targeted-author-v8/MV.source-components.author-v8.inert-envelope.json'
const sparse = resolve(repo, 'tmp/biologie-q1-seven-final-native-review-inputs-author-v1/sparse-root')
if (existsSync(resolve(output, 'final-native-review-inputs.author-v1.freeze.json'))) throw new Error('Frozen author package; use a new continuation package')
if (existsSync(sparse) && process.env.BIO_Q1_RESUME_PREPARATION !== '1') throw new Error('Sparse input root already exists; explicit BIO_Q1_RESUME_PREPARATION=1 is needed for this unfrozen author continuation')

const read = (path: string): any => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const shaBytes = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const sha = (path: string) => shaBytes(readFileSync(resolve(repo, path)))
const binding = (path: string) => ({ path, sha256: sha(path), bytes: readFileSync(resolve(repo, path)).length })
const write = (path: string, value: unknown) => { const target = resolve(repo, path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, JSON.stringify(value, null, 2) + '\n') }
const loadBound = (bound: any) => { if (sha(bound.path) !== bound.sha256.replace(/^sha256:/, '')) throw new Error('Changed exact input ' + bound.path); return read(bound.path) }
const same = (a: unknown, b: unknown) => stableGoalBookJson(a) === stableGoalBookJson(b)
const guards = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json').currentInputs
const checkActiveInputs = () => guards.map((item: any) => { if (sha(item.path) !== item.sha256.replace(/^sha256:/, '')) throw new Error('Protected active input changed ' + item.path); return binding(item.path) })
const beforeActive = checkActiveInputs()
const verifiedFreezeInputs: any[] = []
for (const path of [
  v7Path + '/source-topic-corrections.author-v7.final.freeze.json',
  imagesPath + '/seven-new-raster-author.final.freeze.json',
  visualPath + '/independent-visual-review.final.freeze.json',
  'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-mv-heading-location-targeted-author-v8/author-mv-heading-v8.final.freeze.json',
]) {
  const freeze = read(path)
  const files = freeze.files ?? freeze.ownFiles
  for (const item of files) {
    const actualPath = item.path.startsWith('curricula/') ? item.path : relative(repo, resolve(repo, dirname(path), item.path))
    if (sha(actualPath) !== item.sha256.replace(/^sha256:/, '')) throw new Error('Frozen input changed ' + actualPath)
  }
  verifiedFreezeInputs.push({ ...binding(path), verifiedOwnFiles: files.length })
}
const effective = read(v7Path + '/effective-native-inputs.author-v7.json')
const canonicalEnvelope = loadBound(effective.canonicalEnvelope)
const raw = JSON.parse(canonicalEnvelope.candidateCanonicalUTF8)
const semantic = loadBound(effective.semanticEnvelope).candidatePayload
const selectedImages = read(imagesPath + '/seven-selected-images-and-alt-text.author-candidate.json').decisions
const imageEnvelope = read(imagesPath + '/canonical-390-with-seven-images.author-candidate.inert-envelope.json')
const imageCanonical = JSON.parse(imageEnvelope.candidateCanonicalUTF8)
const imageGoalById = new Map<string, any>(imageCanonical.goals.map((g: any) => [g.id, g]))
const visualInputs = read(visualPath + '/seven-native-v-input-records.candidate.json')
const finalCaseInputs = read(v7Path + '/seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json')
const newGoalIds: string[] = finalCaseInputs.rows.map((row: any) => row.goalId)
if (newGoalIds.length !== 7 || selectedImages.length !== 7 || visualInputs.records.length !== 7) throw new Error('Wrong seven-goal scope')
const goalById = new Map<string, any>(raw.goals.map((g: any) => [g.id, g]))
const sevenGoalImageBindings: any[] = []
for (const row of finalCaseInputs.rows) {
  const goal = goalById.get(row.goalId)!
  if (!same(goal, row.wholeGoal)) throw new Error('Science goal changed ' + row.goalId)
  const imageGoal = imageGoalById.get(row.goalId)!
  const { resourceLinks: imageLinks, ...withoutLinks } = imageGoal
  if (!same(goal, withoutLinks)) throw new Error('Image author science goal differs ' + row.goalId)
  const selected = selectedImages.find((entry: any) => entry.goalId === row.goalId)
  const visual = visualInputs.records.find((entry: any) => entry.goalId === row.goalId)
  const record = visual.plannedNativeRecord
  if (sha(selected.selectedImagePath) !== selected.assetSha256.replace(/^sha256:/, '') || record.aiApproved !== 'yes' || record.humanApproved !== 'no') throw new Error('Missing exact independent AI V binding')
  if (record.assetSha256 !== 'sha256:' + sha(selected.selectedImagePath) || record.aiApprovedAssetSha256 !== record.assetSha256) throw new Error('Stale V asset binding')
  if (record.title !== goal.title || record.description !== goal.description || imageLinks.length !== 1 || imageLinks[0].url !== record.imageUrl || imageLinks[0].altText !== selected.altText) throw new Error('Stale V goal/link binding')
  goal.resourceLinks = structuredClone(imageLinks)
  const actualPublicPath = imagesPath + '/native-helper-output/' + record.publicAssetPath
  const actualCanonicalPath = imagesPath + '/native-helper-output/' + record.canonicalAssetPath
  const actualBackendPath = imagesPath + '/native-helper-output/backend/src/main/resources/static/' + record.imageUrl.slice(1)
  for (const path of [actualPublicPath, actualCanonicalPath, actualBackendPath]) if (sha(path) !== sha(selected.selectedImagePath)) throw new Error('Helper PNG bytes differ ' + path)
  sevenGoalImageBindings.push({ goalId: goal.id, goalTextsBeforeResourceLinksExact: true, title: goal.title, titleEn: goal.titleEn, description: goal.description, descriptionEn: goal.descriptionEn, imageUrl: record.imageUrl, assetSha256: record.assetSha256, selectedImage: binding(selected.selectedImagePath), actualPublic: binding(actualPublicPath), actualCanonical: binding(actualCanonicalPath), actualBackend: binding(actualBackendPath), independentVFreeze: binding(visualPath + '/independent-visual-review.final.freeze.json'), activeRootPublicAssetExists: existsSync(resolve(repo, record.publicAssetPath)), operative: false })
}
const canonicalPath = packagePath + '/inputs/canonical-390.de.candidate.json'
const semanticPath = packagePath + '/inputs/semantic-kinds-390.candidate.json'
const qaPath = packagePath + '/inputs/visualization-qa.full-390.candidate.json'
write(canonicalPath, raw)
semantic.sourceLandscapePath = canonicalPath
write(semanticPath, semantic)
const currentBookConfigPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const currentBookConfig = read(currentBookConfigPath)
const currentQA = read(currentBookConfig.goalVisualizationQaPath)
const qa = structuredClone(currentQA)
for (const row of visualInputs.records) {
  if (qa.records.some((record: any) => record.goalId === row.goalId)) throw new Error('Existing QA ID would be overwritten')
  const record = structuredClone(row.plannedNativeRecord)
  record.landscapePath = canonicalPath
  qa.records.push(record)
}
if (!same(qa.records.slice(0, currentQA.records.length), currentQA.records)) throw new Error('Old V records changed')
write(qaPath, qa)

const atlasConfig = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
atlasConfig.landscapePath = canonicalPath
atlasConfig.semanticKindLedgerPath = semanticPath
atlasConfig.expectedCurricularAtomicGoalCount = 390
const sourceBindings: any[] = []
const extractionByRegion = new Map<string, string>()
for (const row of effective.sourceInputs.filter((entry: any) => entry.kind === 'source-extraction')) {
  const envelope = row.region === 'MV' ? read(mvEnvelopePath) : loadBound(row.envelope)
  if (row.region === 'MV') {
    const previous = loadBound(row.envelope).candidatePayload
    const next = envelope.candidatePayload
    const expected = structuredClone(previous)
    let changedComponents = 0
    const correctHeading = (value: any) => {
      if (!value || typeof value !== 'object') return
      if (value.parentHeadingPhysicalPage === 4 && value.parentHeadingPrintedPage === null) { value.parentHeadingPhysicalPage = 17; value.parentHeadingPrintedPage = 13; changedComponents++ }
      for (const child of Object.values(value)) correctHeading(child)
    }
    correctHeading(expected)
    if (changedComponents !== 3 || !same(expected, next)) throw new Error('MV v8 exceeds exact six-field metadata correction')
  }
  const path = packagePath + '/inputs/source-components/' + row.region + '.source-extraction.candidate.json'
  extractionByRegion.set(row.region, path)
  write(path, envelope.candidatePayload)
  sourceBindings.push({ region: row.region, kind: row.kind, actualInput: binding(path), sourceEnvelope: binding(row.region === 'MV' ? mvEnvelopePath : row.envelope.path), contentExact: true, onlyMVHeadingLocationDiffersFromV7: row.region === 'MV' })
}
for (const row of effective.sourceInputs.filter((entry: any) => entry.kind === 'source-mapping')) {
  const envelope = loadBound(row.envelope)
  const mapping = structuredClone(envelope.candidatePayload)
  const oldExtractionPath = mapping.sourceExtractionPath
  mapping.sourceExtractionPath = extractionByRegion.get(row.region)
  const path = packagePath + '/inputs/source-components/' + row.region + '.mapping.candidate.json'
  write(path, mapping)
  atlasConfig.mappingPaths.push(path)
  sourceBindings.push({ region: row.region, kind: row.kind, actualInput: binding(path), sourceEnvelope: binding(row.envelope.path), unchangedMappingContentExceptActualInputPath: true, prospectiveExtractionPath: oldExtractionPath, actualExtractionPath: mapping.sourceExtractionPath })
}
write(packagePath + '/inputs/source-atlas-390.config.json', atlasConfig)
const atlas = buildGoalBookSourceAtlasInputs(atlasConfig, repo)
if (atlas.receipt.omittedGoals.length || atlas.receipt.counts.uniqueCurricularAtomicGoalCount !== 390) {
  const covered = new Set(atlas.receipt.scopes.flatMap((scope: any) => scope.goalIds))
  if (covered.size !== 390 || atlas.receipt.omittedGoals.length) throw new Error('Native source atlas failed 390')
}
const remaps = new Map<string, string>()
for (const [path] of Object.entries(atlas.outputs)) remaps.set(path, packagePath + '/inputs/source-atlas/' + path.replace('app/scripts/config/goal-books/', ''))
for (const [path, text] of Object.entries(atlas.outputs)) {
  const value = JSON.parse(text)
  if (Array.isArray(value.sourcePaths)) value.sourcePaths = value.sourcePaths.map((sourcePath: string) => remaps.get(sourcePath)!)
  if (value.navigationViewPath) value.navigationViewPath = remaps.get(value.navigationViewPath)
  write(remaps.get(path)!, value)
}
write(packagePath + '/qa-artifacts/native-source-atlas-390.actual.json', compactGoalBookSourceAtlasReceipt(atlas.receipt))
const bookConfig = structuredClone(currentBookConfig)
bookConfig.landscapePath = canonicalPath
bookConfig.semanticKindLedgerPath = semanticPath
bookConfig.goalVisualizationQaPath = qaPath
bookConfig.compositionViewManifestPath = remaps.get(currentBookConfig.compositionViewManifestPath)
bookConfig.outputPath = packagePath + '/qa-artifacts/full-390.book-model.json'
const bookConfigPath = packagePath + '/inputs/book-390.config.json'
write(bookConfigPath, bookConfig)
const manifest = read(bookConfig.compositionViewManifestPath)
const symlinkBindings: any[] = []
const linked = new Set<string>()
const link = (logical: string, actual = logical) => {
  if (linked.has(logical)) return
  const target = resolve(sparse, logical)
  mkdirSync(dirname(target), { recursive: true })
  if (existsSync(target)) {
    if (readlinkSync(target) !== resolve(repo, actual)) throw new Error('Existing sparse binding differs ' + logical)
  } else symlinkSync(resolve(repo, actual), target)
  linked.add(logical)
  symlinkBindings.push({ logicalPath: logical, actualInput: binding(actual), readOnlyIntent: true })
}
for (const path of [bookConfigPath, canonicalPath, semanticPath, qaPath, bookConfig.compositionViewManifestPath, manifest.navigationViewPath, manifest.durationModelPolicyPath, ...manifest.sourcePaths]) link(path)
for (const record of qa.records) if (record.visualizationState === 'available') {
  const selected = sevenGoalImageBindings.find((row: any) => row.goalId === record.goalId)
  link(record.publicAssetPath, selected ? selected.actualPublic.path : record.publicAssetPath)
}
const current = await loadGoalBookBuildInputs(currentBookConfigPath, repo)
const candidate = await loadGoalBookBuildInputs(bookConfigPath, sparse)
await writeGoalBookModel(candidate.model, resolve(repo, bookConfig.outputPath))
const currentRaw = read(currentBookConfig.landscapePath)
const candidatePages = new Map(candidate.model.pages.map((page: any) => [page.goalId, page]))
const protectedReport = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json').subjects.find((subject: any) => subject.subject === 'biologie')
const old383Rows = current.model.pages.map((page: any) => {
  const next: any = candidatePages.get(page.goalId)
  const oldGoal = currentRaw.goals.find((g: any) => g.id === page.goalId)
  return { goalId: page.goalId, wholeGoalExact: same(oldGoal, goalById.get(page.goalId)), goalFingerprintExact: page.goalFingerprint === next?.goalFingerprint, pageFingerprintExact: page.pageFingerprint === next?.pageFingerprint }
})
if (current.model.pages.length !== 383 || candidate.model.pages.length !== 390 || old383Rows.some((row: any) => !row.wholeGoalExact || !row.goalFingerprintExact || !row.pageFingerprintExact) || protectedReport.strictCompleteGoalIds.length !== 67) throw new Error('Protected 383/67 pages or goals changed')
const newSet = new Set(newGoalIds)
const ordered: string[] = []
const visit = (id: string) => { if (ordered.includes(id)) return; for (const required of goalById.get(id).requires ?? []) if (newSet.has(required)) visit(required); ordered.push(id) }
for (const id of newGoalIds) visit(id)
const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: candidate.model, goalIds: ordered, bookId: 'de-gym-biologie-q1-seven-final-native-review-v1', title: 'Biologie Q1 – sieben neue Lernziele, maschinelle Reviewkandidaten' })
const subsetPath = packagePath + '/qa-artifacts/seven.book-model.json'
await writeGoalBookModel(subset, resolve(repo, subsetPath))
write(packagePath + '/qa-artifacts/native-input-and-preservation-verification.actual.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'author technical preparation using unchanged production helpers; no independent D/P/A/M verdict',
  inputFreezes: verifiedFreezeInputs, mvV8SourceEnvelope: binding(mvEnvelopePath), sourceBindings,
  exactSevenCurrentGoalAndImageBindings: sevenGoalImageBindings, old383Rows, protected67Rows: old383Rows.filter((row: any) => protectedReport.strictCompleteGoalIds.includes(row.goalId)),
  counts: { currentPages: current.model.pages.length, candidatePages: candidate.model.pages.length, selectedPages: subset.pages.length, protectedStrictGoals: 67, unchangedCurrentQARecords: currentQA.records.length },
  fullBookModelDigest: candidate.model.digest, selectedBookModelDigest: subset.digest, selectedGoalIds: ordered,
  sparseRoot: relative(repo, sparse), readonlySymlinkBindings: symlinkBindings, original19InputsBefore: beforeActive,
  productionHelpers: ['app/scripts/goalBookModel.ts', 'app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'app/scripts/goalBookRenderer.ts', 'app/scripts/exportGoalBookReviewBundle.ts', 'app/scripts/createGoalDescriptionReviewCampaign.ts'].map(binding),
  activeWrites: false, newD_P_A_MApprovals: 0, activeVIntegration: false, strictNetGain: 0, newScientificCompletions: 0, restoredActiveBindings: 0, humanApproval: false, humanTrial: false,
})
console.log(JSON.stringify({ stage: 'native-pure-models', currentPages: 383, candidatePages: 390, selectedPages: 7, protected67Exact: true, old383PagesExact: true, digest: subset.digest }))
const renderDirectory = packagePath + '/qa-artifacts/render'
const renderOptions = { feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback', publicRoot: resolve(repo, imagesPath, 'native-helper-output/app/public'), printDerivativeProfile: 'bounded-atlas' as const }
const pdfPath = renderDirectory + '/seven.book.pdf'
const pdfManifestPath = renderDirectory + '/seven.book.pdf.render-manifest.json'
const htmlPath = renderDirectory + '/seven.book.html'
const htmlManifestPath = renderDirectory + '/seven.book.html.render-manifest.json'
const htmlManifest = await writeGoalBookHtml(subset, resolve(repo, htmlPath), renderOptions)
await writeGoalBookRenderManifest(htmlManifest, resolve(repo, htmlManifestPath))
const pdfManifest = await writeGoalBookPdf(subset, resolve(repo, pdfPath), renderOptions)
await writeGoalBookRenderManifest(pdfManifest, resolve(repo, pdfManifestPath))
const bundleDirectory = resolve(output, 'bundle')
const built = await buildGoalBookReviewBundle(subset, {
  modelPath: resolve(repo, subsetPath), pdfPath: resolve(repo, pdfPath), pdfRenderManifestPath: resolve(repo, pdfManifestPath), htmlPath: resolve(repo, htmlPath), htmlRenderManifestPath: resolve(repo, htmlManifestPath), outputDirectory: bundleDirectory,
  promptPath: resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),
  criteriaPath: resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'), goalIds: [],
})
for (const file of built.files) { const path = resolve(bundleDirectory, file.relativePath); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, file.content, { flag: 'wx' }) }
write(packagePath + '/bundle/manifest.json', built.manifest)
const rounds: any[] = []
for (const round of ['a', 'b']) {
  const result = await createGoalDescriptionReviewCampaignArtifacts({
    bundleBytes: readFileSync(resolve(bundleDirectory, 'manifest.json')), bookModelBytes: readFileSync(resolve(bundleDirectory, 'book-model.json')), reviewInputBytes: readFileSync(resolve(bundleDirectory, 'review-input.json')),
    bundleDirectory, outputDirectory: resolve(output, 'round-' + round),
    campaignOptions: { campaignId: 'biologie-q1-seven-final-native-review-author-v1-' + round, roundId: 'independent-' + round, reviewerRole: 'internal_ai_reviewer', reviewPass: 'first_pass', independenceGroupId: 'biologie-q1-seven-final-independent-' + round, blindToOtherReviews: true, batchSize: 7 },
  })
  rounds.push({ round, campaignId: result.campaign.campaignId, goalCount: result.input.goals.length, inputFingerprint: result.input.reviewInputFingerprint, campaignPath: packagePath + '/round-' + round + '/description-review-campaign.json', inputPath: packagePath + '/round-' + round + '/description-review-input.json', recordsCreated: 0 })
}
write(packagePath + '/qa-artifacts/native-targeted-seven-render-bundle-campaigns.actual.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'actual native author input preparation; no description-review verdict',
  selectedGoalCount: 7, physicalPDFPages: pdfManifest.physicalPageCount, frontMatterPages: pdfManifest.frontMatterPageCount, full390PDFRendered: false, sourceModelDigest: candidate.model.digest, selectedBookDigest: subset.digest,
  bundleFingerprint: built.manifest.bundleFingerprint, bundleManifest: binding(packagePath + '/bundle/manifest.json'), roundInputs: rounds,
  renderArtifacts: [pdfPath, pdfManifestPath, htmlPath, htmlManifestPath].map(binding), original19InputsAfter: checkActiveInputs(), original19InputsExact: true,
  activeWrites: false, newD_P_A_MApprovals: 0, strictNetGain: 0, newScientificCompletions: 0, restoredActiveBindings: 0, humanApproval: false, humanTrial: false,
})
console.log(JSON.stringify({ stage: 'native-targeted-seven-bundle-and-two-campaign-inputs', bundleFingerprint: built.manifest.bundleFingerprint, selectedPages: 7, rounds: rounds.length, verdictRecordsCreated: 0, activeWrites: false }))
