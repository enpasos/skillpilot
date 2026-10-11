import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from './positiveGoalEvidenceProfileModel.ts'
import { parseGoalBookEvidenceReviewRecord } from './goalBookEvidenceReviewLoader.ts'

const root = '/home/enpasos/projects/skillpilot'
const parent = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const relative = parent + '/current407-P311-P8-exact-QA-resource-bindings-and-owner-union-author-v16'
const base = join(root, relative)
const oldBase = join(root, parent, 'current407-P311-and-independent-P8-selective-native-owner-union-author-v15')
const meta = JSON.parse(readFileSync(join(base, 'actual-fresh407-frame-selective-independent-P8-and-other303-wholebytes.guard.receipt.json'), 'utf8'))
const iso = meta.physicalIsolate as string
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (b: string | Buffer) => createHash('sha256').update(b).digest('hex')
const bind = (p: string) => ({ path: p.startsWith(root + '/') ? p.slice(root.length + 1) : p, sha256: sha(readFileSync(p)), bytes: readFileSync(p).length })
const write = (name: string, v: unknown) => {
  const p = join(base, name)
  if (existsSync(p)) throw new Error('Do not overwrite existing evidence: ' + p)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, JSON.stringify(v, null, 2) + '\n')
  JSON.parse(readFileSync(p, 'utf8'))
}

const oldConfig = read(join(oldBase, 'book-config.reviewed407-current311-selective-root-P8-preserved-other303.inert.json'))
const can = read(join(root, meta.canonicalWholePath))
const qaPath = join(root, oldConfig.goalVisualizationQaPath)
const qa = read(qaPath)
const qaBy = new Map(qa.records.map((r: any) => [r.goalId, r]))
const approvedPath = join(root, meta.adoptedP8WholePath)
const originals = readFileSync(approvedPath, 'utf8').split(/\r?\n/u).filter(Boolean).map(l => JSON.parse(l))
const outputRecords: any[] = []
const results: any[] = []
for (const original of originals) {
  const goal = can.goals.find((g: any) => g.id === original.goalId)
  const q: any = qaBy.get(original.goalId)
  if (!goal || !q) throw new Error('Missing current goal or actual QA binding: ' + original.goalId)
  const canonical = join(iso, q.canonicalAssetPath)
  const publicAsset = join(iso, q.publicAssetPath)
  const actualCanonicalSHA = 'sha256:' + sha(readFileSync(canonical))
  const actualPublicSHA = 'sha256:' + sha(readFileSync(publicAsset))
  if (actualCanonicalSHA !== q.assetSha256 || actualPublicSHA !== q.assetSha256 || q.aiApprovedAssetSha256 !== q.assetSha256 || q.aiApproved !== 'yes') throw new Error('Actual unchanged QA image binding failed: ' + original.goalId)
  const emptyDigestFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, original.reviewCriteriaFingerprint, {}, 'curricularAtomic')
  if (original.reviewInputFingerprint !== emptyDigestFingerprint) throw new Error('Original record is not exactly the bounded empty-resource native input: ' + original.goalId)
  const resources = { [q.imageUrl]: q.assetSha256 }
  const successor = { ...original, reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, original.reviewCriteriaFingerprint, resources, 'curricularAtomic') }
  const changedFields = Object.keys(original).filter(k => JSON.stringify(original[k]) !== JSON.stringify(successor[k]))
  if (JSON.stringify(changedFields) !== '["reviewInputFingerprint"]') throw new Error('Unexpected profile or authority changes: ' + original.goalId)
  const parsed = parseGoalBookEvidenceReviewRecord(successor, 'exact-QA-resource-binding technical successor ' + original.goalId)
  const errors = validatePositiveGoalEvidenceRecordSemantics(parsed as any, goal, resources, 'curricularAtomic')
  if (errors.length) throw new Error(errors.join(' | '))
  if (successor.status !== 'needs_human_review' || successor.reviewAuthority !== 'ai_candidate' || successor.evidenceLevel !== 'E1' || successor.maximumClaimScope !== 'G1') throw new Error('Authority drift')
  outputRecords.push(successor)
  results.push({ goalId: original.goalId, changedFields, oldEmptyResourceReviewInputFingerprint: original.reviewInputFingerprint, currentActualQaReviewInputFingerprint: successor.reviewInputFingerprint, wholeProfileAndAllCasesExact: JSON.stringify(original.profile) === JSON.stringify(successor.profile), profileFingerprintExact: original.profileFingerprint === successor.profileFingerprint, wholeGoalFingerprintExact: original.goalFingerprint === successor.goalFingerprint, entireOtherRecordFieldsExact: true, actualResourceDigests: resources, canonicalAsset: { path: q.canonicalAssetPath, sha256: actualCanonicalSHA }, publicAsset: { path: q.publicAssetPath, sha256: actualPublicSHA }, exactWholeQaRecordSHA256: sha(JSON.stringify(q)), existingActualIndependentVisualApproval: { reviewer: q.aiReviewer, reviewedAt: q.aiReviewedAt, notes: q.aiNotes }, semanticErrors: errors })
}
const wholePath = join(base, 'whole-eight-seventeen-Root-reviewed-positive.with-actual-QA-resource-binding-only.native-successor.jsonl')
if (existsSync(wholePath)) throw new Error('Successor already exists')
writeFileSync(wholePath, outputRecords.map(r => JSON.stringify(r)).join('\n') + '\n')
const wholeWritten = readFileSync(wholePath, 'utf8').split(/\r?\n/u).filter(Boolean).map(l => JSON.parse(l))
if (wholeWritten.length !== 8 || wholeWritten.reduce((n, r) => n + r.profile.applicationCaseBriefs.length, 0) !== 17) throw new Error('Whole JSONL parse or case count failed')
const replacements = new Map(outputRecords.map(r => [r.goalId, JSON.stringify(r)]))
const config = structuredClone(oldConfig)
const successors: any[] = []
let unchangedRaw = 0
for (let i = 0; i < config.evidenceReviewPaths.length; i++) {
  const oldPath = config.evidenceReviewPaths[i]
  const text = readFileSync(join(root, oldPath), 'utf8')
  const lines = text.split(/\r?\n/u)
  const changedIds: string[] = []
  const updated = lines.map(l => {
    if (!l.trim()) return l
    const record = JSON.parse(l)
    const replacement = replacements.get(record.goalId)
    if (replacement !== undefined) {
      if (JSON.stringify(record) !== JSON.stringify(originals.find(r => r.goalId === record.goalId))) throw new Error('V15 adopted whole record differs from Root-approved original')
      changedIds.push(record.goalId)
      return replacement
    }
    unchangedRaw++
    return l
  })
  if (changedIds.length) {
    const filename = String(i + 1).padStart(2, '0') + '-' + oldPath.split('/').at(-1)
    const relPath = relative + '/selective-positive-source-successors/' + filename
    const target = join(root, relPath)
    mkdirSync(join(target, '..'), { recursive: true })
    if (existsSync(target)) throw new Error('Do not overwrite JSONL successor')
    writeFileSync(target, updated.join('\n'))
    readFileSync(target, 'utf8').split(/\r?\n/u).filter(Boolean).forEach(l => JSON.parse(l))
    config.evidenceReviewPaths[i] = relPath
    successors.push({ originalPath: oldPath, originalWholeSHA256: sha(text), successorPath: relPath, successorWholeSHA256: sha(readFileSync(target)), changedGoalIDs: changedIds, unchangedRawLinesExact: true })
  }
}
if (unchangedRaw !== 303 || successors.flatMap(s => s.changedGoalIDs).length !== 8) throw new Error('Selective P311 scope mismatch')
config.outputPath = relative + '/whole-current311-after-reviewed407-plus-independent-P8.P311.book-model.json'
write('book-config.reviewed407-current311-selective-root-P8-preserved-other303.inert.json', config)
write('actual-eight-QA-resource-digest-binding-only-and-closed-schema-validation.receipt.json', { schemaVersion: 1, at: new Date().toISOString(), kind: 'technical-native-resource-binding-successor-for-independently-Root-reviewed-P8', author: '/root/economics_independent_continuation_a', originalIndependentlyReviewedP8: bind(approvedPath), originalRootBoundedModelUsedEmptyResourceDigests: true, retainedV15ActualBookFailure: 'actual-V15-book-resource-binding-failure.stderr.txt', rootIndependentMaterialAcceptance: bind(join(root, meta.RootIndependentReviewReceiptPath)), unchangedCurrentQa311: bind(qaPath), canonical407: bind(join(root, meta.canonicalWholePath)), actualNativeProfileModel: bind(join(iso, 'app/scripts/positiveGoalEvidenceProfileModel.ts')), actualNativeClosedSchemaLoader: bind(join(iso, 'app/scripts/goalBookEvidenceReviewLoader.ts')), actualV2ClosedSchema: bind(join(iso, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')), wholeEightBoundSuccessor: bind(wholePath), results, exactlyEightReviewInputFingerprintOnlyChanges: true, seventeenWholeCasesAndAllOtherProfileContentExact: true, allEightOtherAuthorityFieldsExact: true, allOther303WholeRecordsAndRawLinesExact: true, exactSixSourceSuccessors: successors, newFachlicheReviewOrSourceOrDescriptionApproval: false, ownIndependentVisualReview: false, humanApproval: false, strictNetIncrease: 0, liveWrites: [] })
meta.exactSourceSuccessors = successors
meta.technicalResourceBindingsPending = false
meta.currentResourceBoundP8Path = wholePath.slice(root.length + 1)
meta.currentResourceBoundP8SHA256 = sha(readFileSync(wholePath))
writeFileSync(join(base, 'actual-fresh407-frame-selective-independent-P8-and-other303-wholebytes.guard.receipt.json'), JSON.stringify(meta, null, 2) + '\n')
JSON.parse(readFileSync(join(base, 'actual-fresh407-frame-selective-independent-P8-and-other303-wholebytes.guard.receipt.json'), 'utf8'))
console.log(JSON.stringify({ actualQaResourceBindings: results.length, wholeCases: wholeWritten.reduce((n, r) => n + r.profile.applicationCaseBriefs.length, 0), exactlyEightReviewInputFingerprintChanges: true, other303RawLinesExact: true, semanticErrors: 0, physicalIsolate: iso, wholeEightSuccessorSHA256: meta.currentResourceBoundP8SHA256 }, null, 2))
