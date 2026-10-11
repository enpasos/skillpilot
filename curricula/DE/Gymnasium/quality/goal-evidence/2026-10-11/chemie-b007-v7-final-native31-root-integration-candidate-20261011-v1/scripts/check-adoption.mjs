import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = process.cwd()
const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/'
const author = path.resolve(root, `${prefix}chemie-b007-targeted-scoring-source-binding-author-successor-20261011-v7`)
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const hash = (p) => `sha256:${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}`
const relative = (p) => path.relative(root, p).split(path.sep).join('/')
const first = read(path.join(base, 'FIRST.technical-adoption-inputs.actual.json'))
const { fingerprintSemanticKindSourceGoal, parseAndValidateGoalBookModel } = await import(pathToFileURL(path.join(root, 'app/scripts/goalBookModel.ts')))
const { hasCurrentGoalVisualizationApproval } = await import(pathToFileURL(path.join(root, 'app/scripts/checkGoalVisualizationQaApprovalCoverage.ts')))
const { isGoalVisualizationAiApproved } = await import(pathToFileURL(path.join(root, 'app/scripts/goalVisualizationQaModel.ts')))
const { extractPromptText } = await import(pathToFileURL(path.join(root, 'scripts/goal_visualization_common.mjs')))
const landPath = path.join(base, 'candidate/whole523-six-child-DE15-deck.inactive.json')
const semPath = path.join(base, 'candidate/semantic-kinds.current523.DE15-deck.inactive.json')
const qaPath = path.join(base, 'candidate/visualization-qa-current-whole-plus-six-approved-ai.inactive.json')
const land = read(landPath)
const originalLand = read(path.join(author, 'candidate/whole523-six-child-DE15-deck.inactive.json'))
const sem = read(semPath)
const originalSem = read(path.join(author, 'candidate/semantic-kinds.current523.DE15-deck.inactive.json'))
const qa = read(qaPath)
assert.deepEqual(land, originalLand)
assert.equal(hash(landPath), hash(path.join(author, 'candidate/whole523-six-child-DE15-deck.inactive.json')))
assert.equal(land.goals.length, 523)
assert.deepEqual({ ...sem, sourceLandscapePath: originalSem.sourceLandscapePath }, originalSem)
assert.equal(sem.counts.curricularAtomic, 402)
for (const decision of sem.decisions) {
  const goal = land.goals.find((g) => g.id === decision.goalId)
  assert.ok(goal)
  assert.equal(fingerprintSemanticKindSourceGoal(goal), decision.sourceFingerprint)
}
assert.equal(qa.records.length, 412)
assert.equal(new Set(qa.records.map((r) => r.goalId)).size, 412)
const inventory = read(path.join(root, `${prefix}chemie-b007-v7-D2-P2-native31-integration-preparation-20261011-v1/A6-P6-M402-V6-exact-artifact-inventory.actual.json`))
const originalQa = read(path.resolve(root, inventory.V6.currentAuthorUnapprovedLedger.path))
const sixIds = new Set(first.sixFullVerifiedTuples.map((r) => r.goalId))
for (const original of originalQa.records) {
  const current = qa.records.find((r) => r.goalId === original.goalId)
  if (!sixIds.has(original.goalId)) assert.deepEqual(current, original)
  assert.deepEqual(Object.fromEntries(Object.entries(current).filter(([key]) => key.startsWith('human'))), Object.fromEntries(Object.entries(original).filter(([key]) => key.startsWith('human'))))
}
const copies = []
for (const row of first.sixFullVerifiedTuples) {
  const current = qa.records.find((r) => r.goalId === row.goalId)
  const rebound = { ...row.independentBRecord, landscapePath: relative(landPath), publicAssetPath: `app/public/assets/goal-visualizations/chemie/${row.goalId}/${row.goalId}.png`, canonicalAssetPath: `curricula/DE/Gymnasium/visualizations/chemie/${row.goalId}/${row.goalId}.png` }
  assert.deepEqual(current, rebound)
  assert.equal(isGoalVisualizationAiApproved(current), true)
  assert.equal(hasCurrentGoalVisualizationApproval(current), true)
  assert.equal(current.humanApproved, 'no')
  const source = path.resolve(root, row.actualVisualTuple.originalPNG.path)
  const expected = fs.readFileSync(source)
  for (const folder of ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']) {
    const target = path.resolve(root, folder, 'chemie', row.goalId, `${row.goalId}.png`)
    assert.equal(fs.lstatSync(target).isFile(), true)
    assert.equal(fs.lstatSync(target).isSymbolicLink(), false)
    assert.deepEqual(fs.readFileSync(target), expected)
    copies.push({ path: relative(target), bytes: expected.length, sha256: hash(target) })
  }
  const prompt = path.resolve(root, 'curricula/DE/Gymnasium/visualizations/chemie', row.goalId, 'prompt.de.md')
  const originalPrompt = path.resolve(root, row.actualVisualTuple.generationPrompt.path)
  assert.deepEqual(fs.readFileSync(prompt), fs.readFileSync(originalPrompt))
  assert.equal(extractPromptText(fs.readFileSync(prompt, 'utf8')), extractPromptText(fs.readFileSync(originalPrompt, 'utf8')))
  copies.push({ path: relative(prompt), bytes: fs.statSync(prompt).size, sha256: hash(prompt) })
}
const models = []
for (const [filename, count, configFile] of [['source382.normal.book-model.json', 382, 'native-current-source-atlas382.closed-carriers.inactive.config.json'], ['whole402.normal.book-model.json', 402, 'native-current-whole402.inactive.config.json']]) {
  const modelPath = path.join(base, 'native', filename)
  const model = parseAndValidateGoalBookModel(read(modelPath))
  assert.equal(model.pages.length, count)
  assert.equal(model.book.publicationMode, 'review')
  assert.equal(model.source.goalVisualizationQaPath, relative(qaPath))
  const oldConfig = read(path.join(author, 'candidate', configFile))
  const config = read(path.join(base, 'configs', configFile))
  for (const [key, value] of Object.entries(oldConfig)) {
    if (!['landscapePath', 'semanticKindLedgerPath', 'goalVisualizationQaPath', 'outputPath'].includes(key)) assert.deepEqual(config[key], value)
  }
  const pages = []
  for (const row of first.sixFullVerifiedTuples) {
    const page = model.pages.find((p) => p.goalId === row.goalId)
    assert.ok(page)
    assert.equal(page.visualization.originalDigest, row.actualVisualTuple.originalPNG.sha256)
    // The unchanged book builder reserves publication approval for Human=yes.
    assert.equal(page.visualization.qaStatus, 'review_candidate')
    assert.equal(page.visualization.approvedForPublication, false)
    pages.push({ goalId: row.goalId, pageNumber: page.pageNumber, pageFingerprint: page.pageFingerprint, qaStatus: page.visualization.qaStatus, approvedForPublication: false })
  }
  models.push({ path: relative(modelPath), digest: model.digest, pageCount: count, source: model.source, sixActualPages: pages })
}
for (const guard of first.activeAndHelperGuards) {
  const p = path.resolve(root, guard.path)
  assert.equal(hash(p), guard.sha256, `protected input changed: ${guard.path}`)
  assert.equal(fs.statSync(p).size, guard.bytes)
}
const packageFiles = []
const keys = new Set()
function visit(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const stat = fs.lstatSync(p)
    assert.equal(stat.isSymbolicLink(), false)
    assert.equal(/[<>:"\\|?*\x00-\x1f]/u.test(name), false)
    assert.equal(name.endsWith('.') || name.endsWith(' '), false)
    const key = path.relative(base, p).normalize('NFC').toLocaleLowerCase('en-US')
    assert.equal(keys.has(key), false)
    keys.add(key)
    if (stat.isDirectory()) visit(p)
    else { assert.equal(stat.isFile(), true); packageFiles.push(relative(p)) }
  }
}
visit(base)
const report = { schemaVersion: 1, role: 'Scoped technical adoption check using unchanged normal model and exact-asset AI approval predicates', checkedAtUTC: new Date().toISOString(), status: 'PASS', canonicalWhole523ByteExactToB7: true, semantic523DecisionsAnd402AtomicKindsExact: true, sourceLandscapePathOnlySemanticRebinding: true, qa412UniqueRows: true, unchangedOtherQaRows: 406, adoptedActualIndependentBApprovedAiRows: 6, preservedBReviewerTimestampNotes: true, preservedAll412HumanFieldBodies: true, copiedPngFiles: 18, exactCanonicalPromptFiles: 6, authorizedAssetCopies: copies, normalModels: models, protectedActiveAndHelperFilesUnchanged: first.activeAndHelperGuards.length, regularPortablePackageFiles: packageFiles.length, generation: false, activeLandscapeRegistryQaSemanticCardsWrites: false, strictGain: 0, humanApproval: false, fullNativeRenderingOrFullQs: false, pendingRootFinalGates: ['Integrated native31 full HTML/PDF rendering and actual whole-page inspection', 'D14 owner/supersession registration and P2 current-page binding', 'Central inactive strict-D/P/A/M/V comparison preserving every current Chemie 206 strict ID and Biologie 366/395', 'Source/operator HOLDs and unresolved source scope remain open', 'Central asset orphan check requires final canonical ownership; six imported assets currently belong only to the inactive candidate'] }
fs.writeFileSync(path.join(base, 'checks/scoped-technical-adoption.actual.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(`PASS: six exact KEEP images, 18 regular PNG copies, six exact prompts, 412 unique QA rows, whole523 exact, 523 normal semantic fingerprints, source382/whole402 normal models; ${first.activeAndHelperGuards.length} protected inputs unchanged.`)
