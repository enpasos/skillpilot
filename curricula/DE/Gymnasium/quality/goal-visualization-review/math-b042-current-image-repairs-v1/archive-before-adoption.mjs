import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const auditRoot = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(auditRoot, '../../../../../..')
const plan = JSON.parse(fs.readFileSync(path.join(auditRoot, 'adoption-plan-v1.json'), 'utf8'))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const read = relative => fs.readFileSync(path.resolve(root, relative))
const json = relative => JSON.parse(read(relative).toString('utf8'))
const writeOnce = (relative, bytes) => {
  const destination = path.join(auditRoot, 'archive-before-adoption-v1', relative)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  if (fs.existsSync(destination)) assert.deepEqual(fs.readFileSync(destination), bytes, 'Archive drift: ' + relative)
  else fs.writeFileSync(destination, bytes, { flag: 'wx' })
  return { path: path.relative(root, destination), sha256: sha(bytes) }
}
const copy = (source, destination, expected) => {
  const bytes = read(source)
  if (expected) assert.equal(sha(bytes), expected, source)
  return writeOnce(destination, bytes)
}
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const canonical = json(landscapePath)
const qa = json(qaPath)
const ids = [...plan.images.map(row => row.goalId), ...plan.textGoalIds]
const archived = []
for (const item of plan.images) {
  const source = 'curricula/DE/Gymnasium/visualizations/mathematik/' + item.goalId
  assert.equal(sha(read(item.image)), item.newSha, 'Candidate drift')
  assert.equal(qa.records.find(row => row.goalId === item.goalId).assetSha256, 'sha256:' + item.oldSha, 'Archive must run before live import')
  archived.push(copy(source + '/' + item.goalId + '.jpg', item.goalId + '/previous/goal.jpg', item.oldSha))
  archived.push(copy(source + '/prompt.de.md', item.goalId + '/previous/prompt.de.md'))
  if (fs.existsSync(path.resolve(root, source, 'image-reconstruction-prompt.de.md')))
    archived.push(copy(source + '/image-reconstruction-prompt.de.md', item.goalId + '/previous/image-reconstruction-prompt.de.md'))
  for (const runtime of ['app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']) {
    const live = runtime + '/mathematik/' + item.goalId + '/' + item.goalId + '.jpg'
    if (fs.existsSync(path.resolve(root, live))) assert.equal(sha(read(live)), item.oldSha, live)
  }
  archived.push(copy(item.prompt, item.goalId + '/accepted/actual-construction-or-provider-prompt.de.md'))
  for (const [i, rejected] of item.rejections.entries()) {
    const destination = item.goalId + '/rejected-' + (i + 1)
    archived.push(copy(rejected.image, destination + '/goal.jpg', rejected.sha256))
    archived.push(copy(rejected.prompt, destination + '/requested-correction-prompt.de.md'))
    const reconstruction = rejected.image.replace(/\\.jpg$/, '.image-reconstruction-prompt.de.md')
    if (fs.existsSync(path.resolve(root, reconstruction)))
      archived.push(copy(reconstruction, destination + '/image-reconstruction-prompt.de.md'))
  }
}
const amRows = {}
for (const lane of ['semantic-atomicity', 'memory-card-review']) {
  const reviewPath = 'curricula/DE/Gymnasium/quality/' + lane + '/canonical-math-full.review.jsonl'
  amRows[lane] = read(reviewPath).toString('utf8').trim().split('\n').map(line => JSON.parse(line)).filter(row => plan.textGoalIds.includes(row.goalId))
  assert.equal(amRows[lane].length, 2)
}
archived.push(writeOnce('original-eight-goals-and-qa.json', Buffer.from(JSON.stringify({
  canonicalSha256: sha(read(landscapePath)),
  goals: canonical.goals.filter(goal => ids.includes(goal.id)),
  qa: qa.records.filter(row => ids.includes(row.goalId)),
  amRows,
}, null, 2) + '\n')))
const reviewNames = [
  'adoption-plan-v1.json', 'root-current-image-review-v2.json', 'author-image-review-v1.json',
  'independent-image-review-v1.json', '2713980f-independent-fallback-review-v1.json',
  'growth-candidate-generation-review-v1.json', '281e0c6e-independent-current-raster-review-v1.json',
  'df7338ef-native-fallback-self-review-v1.json', 'df7338ef-independent-native-review-v1.json',
]
const reviewBindings = reviewNames.map(name => ({ path: path.relative(root, path.join(auditRoot, name)), sha256: sha(fs.readFileSync(path.join(auditRoot, name))) }))
writeOnce('archive-receipt.json', Buffer.from(JSON.stringify({
  schemaVersion: 1, recordedAt: plan.recordedAt, authority: 'AI technical/subject-matter review; no human approval',
  purpose: 'Exact old sources and QA plus all five rejected Nano candidates are retained before replacing any active image.',
  nativeExceptions: {
    '2713980f': 'Two targeted Nano failures: non-horizontal initial tangent, wrong maximum placement or quantitatively misleading right branch. Native equation-sampled SVG/PNG is necessary; both actual raster reviewers and full coordinate checks passed.',
    'df7338ef': 'Two targeted Nano failures: N(0)=100 is misplaced on a linear axis, with contradictory extra ticks in V2. Native equation-sampled SVG/PNG is necessary; both actual raster reviewers and all1001 coordinates passed.'
  },
  schematicRestriction: '848af536 uses separate explicitly schematic diagrams with no common time scale; neither alt text nor review promises quantitative graph readout.',
  approvedAssets: plan.images.map(({ goalId, image, newSha }) => ({ goalId, image, sha256: newSha })),
  reviewBindings, archived,
}, null, 2) + '\n'))
console.log('Archived8 old goal/QA snapshots,6 old source images and5 rejected Nano attempts; active sources unchanged.')

