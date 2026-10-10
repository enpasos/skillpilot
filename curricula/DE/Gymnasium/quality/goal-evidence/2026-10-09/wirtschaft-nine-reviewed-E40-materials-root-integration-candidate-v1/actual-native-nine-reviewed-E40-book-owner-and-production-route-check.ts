import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs, writeGoalBookModel, stableGoalBookJson, parseAndValidateGoalBookModel } from './goalBookModel.ts'
import { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles } from './actual-current-production-unmodified-route-profile-export-for-E40.ts'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'

const [root, iso] = process.argv.slice(2)
if (!root || !iso) throw Error('Need actual repo and isolated input roots')
const rel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-nine-reviewed-E40-materials-root-integration-candidate-v1'
const prior = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-E-forty-nine-coherent-terminal-material-author-v1'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')
const write = (name: string, data: unknown) => {
  const p = join(root, rel, name)
  if (existsSync(p)) throw Error('Do not overwrite sealed output ' + p)
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n')
  read(p)
  return { path: rel + '/' + name, sha256: hash(readFileSync(p)) }
}

async function main() {
  const assembly = read(join(root, rel, 'actual-nine-accepted-materials-current-inert-assembly-and-input-exactness.receipt.json'))
  for (const input of assembly.wholeInputs) if (hash(readFileSync(join(root, input.path))) !== input.sha256) throw Error('Frozen input changed ' + input.path)
  const can = read(join(root, rel, 'whole-CAN416-nine-reviewed-E40-materials.current-root-inert-integration.json'))
  const materials = read(join(root, rel, 'whole-nine-E40-materials.actual-independent-reviewed-machine-release.candidate.json'))
  const sem = read(join(root, prior, 'candidate-semantic416.only-Root-nine-kind-and-one-nav-input-binding.closed-count-successor-v3.inert.json'))
  const beforeSem = structuredClone(sem)
  const materialById = new Map<string, any>(materials.map((g: any) => [g.id, g]))
  const actualBindings: any[] = []
  for (const row of sem.decisions) {
    const g = materialById.get(row.goalId)
    if (!g) continue
    if (row.semanticKind !== 'practiceAssessment' || row.decisionStatus !== 'authoritative') throw Error('Wrong previously reviewed kind')
    actualBindings.push({ goalId: row.goalId, before: row.sourceFingerprint, after: fingerprintSemanticKindSourceGoal(g), kind: row.semanticKind })
    row.sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
  }
  if (actualBindings.length !== 9 || stableGoalBookJson(beforeSem.counts) !== stableGoalBookJson(sem.counts)) throw Error('Not exactly nine binding-only changes')
  for (let i = 0; i < sem.decisions.length; i++) {
    const previous = structuredClone(beforeSem.decisions[i]), current = structuredClone(sem.decisions[i])
    if (materialById.has(current.goalId)) previous.sourceFingerprint = current.sourceFingerprint
    if (stableGoalBookJson(previous) !== stableGoalBookJson(current)) throw Error('Kind decision changed')
  }
  const semanticBinding = write('semantic416.only-nine-actual-reviewed-material-input-bindings.inert.json', sem)
  const isoSem = join(iso, semanticBinding.path)
  mkdirSync(dirname(isoSem), { recursive: true })
  writeFileSync(isoSem, readFileSync(join(root, semanticBinding.path)))
  const configPath = rel + '/book-config.current311-nine-reviewed-E40-materials.frozen-P311624.inert.json'
  const config = read(join(root, configPath))
  const model = (await loadGoalBookBuildInputs(configPath, iso)).model
  await writeGoalBookModel(model, join(root, config.outputPath))
  const priorModel = parseAndValidateGoalBookModel(read(join(root, prior, 'whole-current311-after-nine-E40-DRAFT-materials-with-frozen-V17-P311624.book-model.json')))
  if (model.pages.length !== 311 || priorModel.pages.length !== 311) throw Error('Ordinary page universe changed')
  const byId = new Map(model.pages.map(p => [p.goalId, p]))
  const covered = new Set<string>(materials.flatMap((g: any) => g.examData.coveredGoalIds))
  const ownerRows = priorModel.pages.map(p => {
    const after = byId.get(p.goalId)!
    const fields = Object.keys(p).filter(k => stableGoalBookJson((p as any)[k]) !== stableGoalBookJson((after as any)[k]))
    if (fields.length && !covered.has(p.goalId)) throw Error('Unrelated owner page changed ' + p.goalId)
    return { goalId: p.goalId, actualChangedFields: fields, wholeExact: fields.length === 0,
      previousWholePageSHA256: hash(stableGoalBookJson(p)), currentWholePageSHA256: hash(stableGoalBookJson(after)) }
  })
  const pRecords = config.evidenceReviewPaths.flatMap((p: string) => readFileSync(join(root, p), 'utf8').split(/\r?\n/u).filter(Boolean).map(line => JSON.parse(line)))
  if (pRecords.length !== 311 || pRecords.some((r: any) => r.evidenceLevel !== 'E1' || r.maximumClaimScope !== 'G1' || r.status !== 'needs_human_review' || r.reviewAuthority !== 'ai_candidate')) throw Error('False positive-evidence status')
  const cases = pRecords.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0)
  if (cases !== 624) throw Error('Historical whole case universe changed')
  const originalD46 = read(join(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-after-final403-with-all-P311.book-model.json'))
  const originalD46Owners = originalD46.pages.map((p: any) => ({ goalId: p.goalId, wholeExact: stableGoalBookJson(p) === stableGoalBookJson(byId.get(p.goalId)) }))
  const profile = routeProfiles.find((p: any) => p.profileId === 'canonical-economics-crossstage')!
  const graph = evaluateGraphIntegrity(can, new Set(can.goals.map((g: any) => g.id)))
  const type = evaluateTypeConsistency(can)
  const route = evaluateRouteProfile(can, profile, buildApplicabilityCompilation())
  const result = write('actual-native-CAN416-nine-reviewed-E40-ordinary311-P311624-owner-and-production-route.result.json', {
    schemaVersion: 1, semanticBinding, actualNineOnlyTechnicalInputBindings: actualBindings,
    actualNativeBookPath: config.outputPath, actualNativeBookDigest: model.digest, actualOwnerRows: ownerRows,
    changedOwnerCountAgainstAuthorDRAFT: ownerRows.filter(r => !r.wholeExact).length,
    exactOwnerCountAgainstAuthorDRAFT: ownerRows.filter(r => r.wholeExact).length,
    originalD46OwnerRows: originalD46Owners, changedOwnerCountAgainstOriginalD46: originalD46Owners.filter((r: any) => !r.wholeExact).length,
    ordinaryPageCount: model.pages.length, positiveProfileCount: pRecords.length, retainedWholeCaseCount: cases,
    allWholePositiveInputsExact: true, positiveStatus: 'E1/G1 ai_candidate needs_human_review',
    graph, type, originalUnmodifiedProductionProfile: profile, actualProductionRouteRules: route,
    actualNineMachineReviewedMaterials: 9, coveredUniqueCurrentGoals: covered.size,
    ordinaryCourseTargetsAndRequiresUnchanged: true, noNewCourseSourceDHumanOrLiveGateApproval: true,
    scopeQualification: 'These are actual current-production profile results on the inert CAN416. Earlier expanded5317 results remain a separate candidate profile. Current course debt is reused by exact unchanged views/requires, not declared passed.',
    strictBefore: { closed: 300, total: 311 }, strictAfter: { closed: 300, total: 311 }, strictNetGain: 0, liveWrites: [], humanReview: 'pending'
  })
  for (const input of assembly.wholeInputs) if (hash(readFileSync(join(root, input.path))) !== input.sha256) throw Error('Input changed during native check')
  console.log(JSON.stringify({ result, ordinaryPages: model.pages.length, positiveProfiles: pRecords.length, wholeCases: cases,
    changedOwners: ownerRows.filter(r => !r.wholeExact).length, changedSinceD46: originalD46Owners.filter((r: any) => !r.wholeExact).length,
    graph: graph.status, type: type.status, currentProductionRules: route.rules.map((r: any) => ({ id: r.id, status: r.status,
      ...(r.id === 'CQR-101' || r.id === 'CQR-202' ? { metrics: r.metrics } : {}) })), strictNetGain: 0 }, null, 2))
}
main().catch(e => { console.error(e); process.exitCode = 1 })
