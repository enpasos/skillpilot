import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.cwd()
const base = path.dirname(fileURLToPath(import.meta.url))
const rel = p => path.relative(root, p)
const read = p => fs.readFileSync(path.resolve(root, p))
const json = p => JSON.parse(read(p))
const digest = b => createHash('sha256').update(b).digest('hex')
const bind = p => ({ path: rel(path.resolve(root, p)), sha256: digest(read(p)) })
const archive = path.join(base, 'archive-before-import-v1')
const once = (p, bytes) => {
  const out = path.join(archive, p)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  if (fs.existsSync(out)) assert.deepEqual(fs.readFileSync(out), bytes, 'Archive drift: ' + p)
  else fs.writeFileSync(out, bytes, { flag: 'wx' })
  return bind(out)
}
const copy = (p, dest, expected) => {
  const bytes = read(p)
  if (expected) assert.equal(digest(bytes), expected, p)
  return once(dest, bytes)
}
const cp = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const qp = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const canonical = json(cp), qa = json(qp)
const f = 'f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d'
const e = 'e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c'
const items = [
  { goalId: f, oldSha: 'f9170f149f0f14adaa95e0f8480fff32c791119a9f7c25866e3839764a4db23e',
    image: path.join(base, 'f493-native-fallback-v2.png'), sha256: '71c5c1b7c91dd8a1cc6189fdf241541bae4c8f5888ae83401691af3c6c0d0712',
    prompt: path.join(base, 'f493-native-construction.de.md') },
  { goalId: e, oldSha: 'a98fb4c5d79cb97507dea8569b0afce4e5908f6891b1caf3d1283f5d2a691281',
    image: 'tmp/goal-visualizations/' + e + '/generated/' + e + '.generated.2026-09-07T14-23-21-417Z.jpg',
    sha256: '63330caeb94155284c50e874671871993391d2187f3ce47684e66755b9463066',
    prompt: 'tmp/goal-visualizations/' + e + '/nano-banana-prompt.de.md' },
]
const files = []
for (const item of items) {
  assert.equal(qa.records.find(r => r.goalId === item.goalId).assetSha256, 'sha256:' + item.oldSha, 'Must archive before active import')
  const source = 'curricula/DE/Gymnasium/visualizations/mathematik/' + item.goalId
  files.push(copy(source + '/' + item.goalId + '.jpg', item.goalId + '/previous/goal.jpg', item.oldSha))
  for (const name of ['prompt.de.md', 'image-reconstruction-prompt.de.md'])
    if (fs.existsSync(path.resolve(root, source, name))) files.push(copy(source + '/' + name, item.goalId + '/previous/' + name))
  for (const runtime of ['app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations'])
    assert.equal(digest(read(runtime + '/mathematik/' + item.goalId + '/' + item.goalId + '.jpg')), item.oldSha)
  files.push(copy(item.image, item.goalId + '/accepted/goal' + path.extname(item.image), item.sha256))
  files.push(copy(item.prompt, item.goalId + '/accepted/actual-construction-or-provider-prompt.de.md'))
  const reconstruction = item.image.replace(/\.[^.]+$/, '.image-reconstruction-prompt.de.md')
  if (fs.existsSync(path.resolve(root, reconstruction))) files.push(copy(reconstruction, item.goalId + '/accepted/image-reconstruction-prompt.de.md'))
}
const rejected = [
  ['2026-09-07T14-23-22-996Z', '0c5a0f7f9f99a46c9f3f1d2987067105f3ba4f0abb8f2a9ef5f3634b1a18dfa2', 'nano-v1'],
  ['2026-09-07T14-30-36-577Z', 'aedd271f716b3d3b7139d548815b63b6b10f9510e9bf6f77b0b3f6262a3e91aa', 'nano-v2'],
]
for (const [stamp, hash, attempt] of rejected) {
  const image = 'tmp/goal-visualizations/' + f + '/generated/' + f + '.generated.' + stamp + '.jpg'
  files.push(copy(image, f + '/rejected-' + attempt + '/goal.jpg', hash))
  files.push(copy(path.join(base, f + '.' + attempt + '.de.md'), f + '/rejected-' + attempt + '/requested-correction-prompt.de.md'))
  files.push(copy(image.replace(/\.jpg$/, '.image-reconstruction-prompt.de.md'), f + '/rejected-' + attempt + '/image-reconstruction-prompt.de.md'))
}
files.push(copy('tmp/goal-visualizations/' + f + '/nano-banana-prompt.de.md', f + '/rejected-nano-v2/actual-provider-prompt.de.md'))
for (const name of ['f493-native-fallback.png', 'f493-native-fallback.svg', 'render-f493-native-fallback.mjs'])
  files.push(copy(path.join(base, name), f + '/superseded-native-layout-v1/' + name))
for (const name of ['f493-native-fallback-v2.svg', 'render-f493-native-fallback-v2.mjs'])
  files.push(copy(path.join(base, name), f + '/accepted/' + name))
const snapshot = {
  canonical: bind(cp), qa: bind(qp),
  goals: canonical.goals.filter(g => [f, e].includes(g.id)),
  qaRows: qa.records.filter(r => [f, e].includes(r.goalId)),
  allGoalHashes: canonical.goals.map(g => ({ goalId: g.id, sha256: digest(JSON.stringify(g)) })),
  allQaHashes: qa.records.map(r => ({ goalId: r.goalId, sha256: digest(JSON.stringify(r)) })),
  canonicalMetadataSha256: digest(JSON.stringify(Object.fromEntries(Object.entries(canonical).filter(([k]) => k !== 'goals')))),
  unchangedSemanticBindings: [
    'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
    'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
    'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  ].map(bind),
}
files.push(once('original-two-goals-and-qa.json', Buffer.from(JSON.stringify(snapshot, null, 2) + '\n')))
const reviewNames = ['author-image-review-v1.json', 'f493-author-image-review-v2.json', 'f493-native-author-review-v2.json', 'root-image-counterreview-final2-v1.json']
const reviewBindings = reviewNames.map(name => bind(path.join(base, name)))
once('archive-receipt.json', Buffer.from(JSON.stringify({
  schemaVersion: 1, recordedAt: '2026-09-07T14:46:00Z',
  purpose: 'Exact old assets, metadata and rejected attempts retained before two image-only imports.',
  authority: 'AI candidate; two actual raster inspections, no human or license approval.',
  fullPromptTraceLimit: 'The generator overwrote the first f493 full provider prompt with V2. V1 exact appended instruction and referenced original raster are retained, with generation time and reconstruction prompt; no invented original full-prompt trace is claimed.',
  nativeException: 'Explicit root approval after two targeted Nano failures: V1 non-linear x scale; V2 quantitatively wrong high branch. Native 2001-point curve is required for correctness, not chosen for convenience. Native V1 label collision is retained and fixed only in V2.',
  approvedAssets: items.map(({ goalId, image, sha256 }) => ({ goalId, image: rel(path.resolve(root, image)), sha256 })),
  reviewBindings, files,
}, null, 2) + '\n'))
console.log('Archived two old images, two failed Nano attempts, one superseded native layout, accepted assets, prompts and review bindings. Active sources unchanged.')
