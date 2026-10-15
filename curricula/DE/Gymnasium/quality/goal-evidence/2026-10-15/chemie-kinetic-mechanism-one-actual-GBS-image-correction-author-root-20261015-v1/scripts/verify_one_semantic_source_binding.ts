import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../app/scripts/goalBookModel.ts'

const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
const own = prefix + 'chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/'
const beforePath = prefix + 'chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1/candidate/semantic560.three-description-source-bindings.json'
const canonicalPath = own + 'candidate-v2/canonical560.current422.one-mechanism-description-and-PNG.author-v2.json'
const before = JSON.parse(readFileSync(beforePath, 'utf8'))
const after = structuredClone(before)
const canonical = JSON.parse(readFileSync(canonicalPath, 'utf8'))
const goalId = '13838147-c26d-54ca-b9be-5f2f0b8e9de5'
const goal = canonical.goals.find((g: { id: string }) => g.id === goalId)
const decision = after.decisions.find((d: { goalId: string }) => d.goalId === goalId)
const original = structuredClone(decision)
decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
if (JSON.stringify(before.decisions.filter((d: { goalId: string }) => d.goalId !== goalId)) !== JSON.stringify(after.decisions.filter((d: { goalId: string }) => d.goalId !== goalId))) throw new Error('Unrelated decision changed')
const outputPath = own + 'candidate-v2/semantic560.one-mechanism-description-source-binding.author-v2.json'
if (readFileSync(outputPath, 'utf8') !== JSON.stringify(after, null, 2) + '\n') throw new Error('Existing bounded semantic output differs')
const hash = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex')
const expectedCAS = JSON.stringify({
  role: 'Technical source identity after original bounded author science; not a semantic atomicity or independent review decision',
  beforePath, beforeSha256: hash(beforePath), canonicalPath, canonicalSha256: hash(canonicalPath),
  outputPath, outputSha256: hash(outputPath), goalId, before: original, after: decision,
  other559DecisionsExact: true, classificationAndDecisionBasisUnchanged: true,
  newAtomicityVotes: 0, newDescriptionVotes: 0, newStrict: 0, humanApproval: false, activeIntegration: false,
}, null, 2) + '\n'
if (readFileSync(own + 'CAS.semantic-source-binding-only.v2.json', 'utf8') !== expectedCAS) throw new Error('Existing bounded CAS differs')
console.log(JSON.stringify({ outputPath, outputSha256: hash(outputPath), other559DecisionsExact: true, newAtomicityVotes: 0 }))
