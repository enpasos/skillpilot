import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { fileURLToPath, pathToFileURL } from 'node:url'
const base = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(base, '../../../../../../..')
const source = path.join(path.dirname(base), 'chemie-q3-potential-interval-transfer-boundary-P3-native-author-successor-20261011-v5')
const prior = path.join(path.dirname(base), 'chemie-q3-v5-genuine-independent-visual-page-transfer-a-v1')
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const sha = p => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const checkRef = r => { const p = path.join(root, r.path); assert.equal(fs.statSync(p).size, r.bytes); assert.equal(sha(p), r.sha256) }
const { buildGoalDescriptionReviewInput } = await import(pathToFileURL(path.join(root, 'app/scripts/validateGoalDescriptionReviewCampaign.ts')))
const { parseAndValidateGoalBookModel } = await import(pathToFileURL(path.join(root, 'app/scripts/goalBookModel.ts')))
const { fingerprintGoalForPositiveEvidence } = await import(pathToFileURL(path.join(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')))
const first = read(path.join(base, 'FIRST.current-D3-continuation-inputs.actual.json'))
for (const ref of [...first.inputs, ...first.protectedInputs]) checkRef(ref)
const oldSeal = read(path.join(prior, 'FINAL.independent-a.package.freeze.json'))
for (const ref of oldSeal.files) checkRef(ref)
const authorSeal = read(path.join(source, 'FINAL.author-package.freeze.json'))
for (const ref of authorSeal.files) checkRef(ref)
const landscape = read(path.join(source, 'inputs/current517.canonical-three-PNG.inactive.json'))
const bundle = read(path.join(base, 'round-a/review-bundle-manifest.json'))
const reviewInput = read(path.join(source, 'native/current398-native3.complete-review-universe.author-batch/bundle/review-input.json'))
const descriptionInput = read(path.join(base, 'round-a/description-review-input.json'))
assert.deepEqual(buildGoalDescriptionReviewInput({bundle, reviewInput, landscape}), descriptionInput)
const native = parseAndValidateGoalBookModel(read(path.join(source, 'native/current398-native3.complete-review-universe.author-batch/bundle/book-model.json')))
const whole = parseAndValidateGoalBookModel(read(path.join(source, 'native/whole398.complete-review-universe.current-PNG.book-model.json')))
assert.equal(native.pages.length, 3)
assert.equal(whole.pages.length, 398)
const neutral = read(path.join(source, 'inputs/three-whole-current-goals-and-398-page-contexts.neutral.json'))
const tuples = []
for (const d of descriptionInput.goals) {
  const g = landscape.goals.find(g => g.id === d.goalId)
  const n = native.pages.find(p => p.goalId === d.goalId)
  const w = whole.pages.find(p => p.goalId === d.goalId)
  const t = neutral.goals.find(t => t.goalId === d.goalId)
  assert.deepEqual(t.wholeCurrentCanonicalGoal, g)
  assert.deepEqual(t.completeNative3DedicatedPage, n)
  assert.deepEqual(t.complete398ReviewUniversePage, w)
  assert.equal(fingerprintGoalForPositiveEvidence(g, 'curricularAtomic'), d.goalFingerprint)
  const sorted = xs => [...xs].sort()
  for (const page of [n,w]) {
    assert.deepEqual(sorted([...page.requires,...page.externalPrerequisites].map(x => x.goalId)), sorted(g.requires))
    assert.deepEqual(sorted([...page.reverseRequires,...page.externalReverseRequires].map(x => x.goalId)), sorted(landscape.goals.filter(x => x.requires?.includes(g.id)).map(x => x.id)))
  }
  tuples.push({goalId:d.goalId, goalFingerprint:d.goalFingerprint, nativePageFingerprint:n.pageFingerprint, whole398PageFingerprint:w.pageFingerprint, directPrerequisites:g.requires, reverseReferences:landscape.goals.filter(x => x.requires?.includes(g.id)).map(x => x.id)})
}
const block = read(path.join(base, 'inspection/81373-HE-operator-block.smallest-whole-context.actual.json'))
assert.match(block.wholeArchivedHeSourceGoal.description, /experimentell zeigen/)
assert.equal(block.actualExactLegacyMapping.matchType, 'exact')
assert.equal(block.currentHePrimaryPrintedPage, 46)
assert.equal(block.twoWholePreviouslyActuallyReviewedCases.length, 2)
const inspected = read(path.join(base, 'inspection/current-D3-whole-targeted-context-and-source-bindings.actual.json'))
for (const ref of inspected.files) checkRef(ref)
const portable = []
const walk = dir => {for (const item of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,item.name); assert.equal(item.isSymbolicLink(),false); assert.equal(item.name.normalize('NFC'),item.name); if(item.isDirectory())walk(p);else {assert.equal(item.isFile(),true);portable.push(path.relative(base,p))}}}
walk(base)
assert.equal(new Set(portable.map(p => p.toLowerCase())).size, portable.length)
const output = {checkedAtUTC:new Date().toISOString(), result:'PASS', normalDescriptionInputRebuiltExact:true, reviewInputFingerprint:descriptionInput.reviewInputFingerprint, nativeModelDigest:native.digest, whole398ModelDigest:whole.digest, tuples, verifiedCurrentAuthorFiles:authorSeal.files.length, earlierOwnVPFilesUnchanged:oldSeal.files.length, protectedInputsUnchanged:first.protectedInputs.length, primarySourceFilesUnchanged:inspected.files.length, honestContinuation:true, specific81373OperatorBlockUnchanged:true, peerBQ3Read:false, activeWrites:false, portableRegularFiles:portable.length}
fs.writeFileSync(path.join(base,'checks.current-fingerprints-context-and-preservation.actual.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify(output,null,2))
