import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, checkGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'

// Explicit input roots of the existing normal API, never an active repository write.
const packageRoot = dirname(fileURLToPath(import.meta.url))
const repository = resolve(packageRoot, '../../../../../../..')
const executionRoot = resolve(process.argv[2] ?? '')
const preparedInputRoot = resolve(process.argv[3] ?? '')
assert.ok(process.argv[2] && process.argv[3], 'Supply fresh ignored execution root and unchanged prepared input root')
assert.notEqual(executionRoot, repository)
assert.notEqual(executionRoot, preparedInputRoot)
assert.ok(!existsSync(executionRoot), 'Do not overwrite a prior execution capsule')
const relPackage = packageRoot.slice(repository.length + 1)
const parse = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const digest = (data: Buffer | string) => `sha256:${createHash('sha256').update(data).digest('hex')}`
const entry = parse(resolve(packageRoot, 'neutral-three-BW-source-adoption.independent-review.entry.json'))
const configPath = `${relPackage}/checks/source-atlas.inputs.candidate.json`
const config = parse(resolve(repository, configPath))
const copiedInputs: Array<{path: string, sha256: string, bytes: number}> = []
const copyInput = (path: string, fromPath?: string) => {
  const target = resolve(executionRoot, path)
  assert.ok(target.startsWith(`${executionRoot}/`))
  const bytes = readFileSync(fromPath ?? resolve(preparedInputRoot, path))
  mkdirSync(dirname(target), {recursive: true})
  writeFileSync(target, bytes)
  copiedInputs.push({path, sha256:digest(bytes), bytes:bytes.length})
}
copyInput(configPath, resolve(repository, configPath))
copyInput(config.landscapePath, resolve(repository, entry.frozenFuture484Canonical.path))
copyInput(config.semanticKindLedgerPath, resolve(repository, entry.future381SemanticLedger.path))
copyInput(config.durationModelPolicyPath)
for (const path of config.fallbackViewPaths) copyInput(path)
for (const mappingPath of config.mappingPaths) {
  const newMapping = mappingPath === entry.sourceSuccessor.path
  copyInput(mappingPath, newMapping ? resolve(repository, mappingPath) : undefined)
  const mapping = parse(resolve(executionRoot, mappingPath))
  copyInput(mapping.sourceExtractionPath, newMapping ? resolve(repository, mapping.sourceExtractionPath) : undefined)
  const source = parse(resolve(executionRoot, mapping.sourceExtractionPath))
  if (source.sourceDocument.path.endsWith('.json')) copyInput(source.sourceDocument.path)
}
const baseline = parse(resolve(packageRoot, 'inputs/normal-prepared-source-projection.selected-fields.snapshot.json'))
for (const binding of baseline.inputBindings) {
  if (binding.path.endsWith('.json') && existsSync(resolve(preparedInputRoot,binding.path)) && !existsSync(resolve(executionRoot,binding.path))) copyInput(binding.path)
}
const source = buildGoalBookSourceAtlasInputs(config, executionRoot)
for (const [path,bytes] of Object.entries(source.outputs)) {
  const target = resolve(executionRoot,path)
  assert.ok(target.startsWith(`${executionRoot}/`))
  mkdirSync(dirname(target), {recursive:true})
  writeFileSync(target,bytes)
}
const fresh = checkGoalBookSourceAtlasInputs(configPath, executionRoot)
assert.deepEqual(fresh.outputs, source.outputs)
assert.deepEqual(source.receipt.counts, baseline.counts)
assert.deepEqual(source.receipt.omittedGoals, baseline.omittedGoals)
assert.deepEqual(source.receipt.unresolvedSourceScopes, baseline.unresolvedSourceScopes)
assert.equal(source.receipt.counts.canonicalCurricularAtomicGoals,381)
assert.equal(source.receipt.counts.publishedCurricularAtomicGoals,362)
assert.equal(source.receipt.counts.sourceViews,48)
assert.equal(source.receipt.counts.unresolvedSourceScopeDecisions,496)
assert.equal(source.receipt.counts.omittedGoals,19)
const baselineDigests = new Map(baseline.outputBindings.map((x:any)=>[x.path,x.sha256]))
const outputBindings = Object.entries(source.outputs).map(([path,bytes])=>({path,sha256:digest(bytes),bytes:bytes.length}))
const scopeChanges = outputBindings.filter(x => baselineDigests.has(x.path) && baselineDigests.get(x.path)!==x.sha256)
assert.deepEqual(scopeChanges,[], 'Metadata adoption must preserve every prepared normal source view, navigation and manifest byte')
const scopeRows = (receipt:any) => receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds}))
assert.deepEqual(scopeRows(source.receipt),scopeRows(baseline))
const goalIds:string[] = entry.newGoalIds
const bwRoles = source.receipt.scopes.filter((s:any)=>s.jurisdiction==='DE-BW').map((s:any)=>({key:s.key,newGoalIds:s.goalIds.filter((id:string)=>goalIds.includes(id))}))
assert.deepEqual(bwRoles.find((s:any)=>s.key==='DE-BW/SekII/GK')?.newGoalIds,[goalIds[0]])
assert.deepEqual([...bwRoles.find((s:any)=>s.key==='DE-BW/SekII/LK')!.newGoalIds].sort(),[...goalIds].sort())
assert.deepEqual(bwRoles.filter((s:any)=>s.key.startsWith('DE-BW/SekI/')).flatMap((s:any)=>s.newGoalIds),[])
const mapping = parse(resolve(repository,entry.sourceSuccessor.path))
const before = parse(resolve(repository,entry.preparedRehearsal220MappingExactSnapshot.path))
const original = parse(resolve(repository,entry.original217Mapping.path))
assert.equal(mapping.decisions.length,126)
assert.equal(mapping.mappings.length,220)
assert.deepEqual(mapping.mappings,before.mappings)
assert.deepEqual(mapping.mappings.slice(0,217),original.mappings)
assert.deepEqual(mapping.mappings.slice(217).map((x:any)=>x.matchType),['partial','exact','exact'])
const metadataIndices = [10,52,112]
for (let i=0;i<126;i++) {
  const a={...before.decisions[i]},b={...mapping.decisions[i]}
  if(metadataIndices.includes(i)) {delete a.rationale;delete a.reviewer;delete b.rationale;delete b.reviewer}
  assert.deepEqual(b,a)
}
const old = new Map(parse(resolve(repository,entry.frozenOld480Canonical.path)).goals.map((g:any)=>[g.id,g]))
const next = new Map(parse(resolve(repository,entry.frozenFuture484Canonical.path)).goals.map((g:any)=>[g.id,g]))
const protectedSets=parse(resolve(repository,entry.protectedAllFiveGoalIdSets.path))
const protectedChem:string[] = protectedSets.subjects.find((s:any)=>s.subject==='chemie').strictCompleteGoalIds
assert.equal(protectedChem.length,177)
for(const id of protectedChem) assert.deepEqual(next.get(id),old.get(id))
const primaryContract = parse(resolve(packageRoot,'inputs/existing-normal-BW-primary-cache-contract.exact.json'))
const extraction = parse(resolve(repository,entry.whole126SourceExtraction.path))
assert.equal(extraction.sourceDocument.path,primaryContract.path)
assert.equal(entry.existingPrimaryOriginal.sha256,primaryContract.sha256)
const proof={
  schemaVersion:1,
  normalApis:['buildGoalBookSourceAtlasInputs','checkGoalBookSourceAtlasInputs'],
  execution:'fresh detached minimal input capsule with explicit normal API repositoryRoot; no active writes',
  candidateConfig:entry.normalSourceCandidateConfig,
  counts:source.receipt.counts,
  normalFreshnessPass:true,
  all126DecisionSemanticFieldsPreserved:true,
  all220PartnerRowsExact:true,
  original217PartnerRowsExact:true,
  other123DecisionBodiesExact:true,
  exactlyThreeMetadataPassages:[10,52,112],
  metadataFields:['rationale','reviewer'],
  allExistingReviewDatesPreserved:true,
  source002:'concentration contribution remains partial; full clause pressure and temperature obligations open',
  bwSourceRoles:bwRoles,
  omitted19Exact:true,unresolved496Exact:true,
  allPreparedSourceViewsNavigationManifestBytesExact:true,
  sourceOutputChanges:scopeChanges,
  protected177CanonicalGoalBodiesExact:true,
  modelOrPageRecomputationClaim:false,
  primarySourceDocumentPath:extraction.sourceDocument.path,
  primarySourceSnapshotSha256:primaryContract.sha256,
  copiedInputs,outputBindings,
  actualExitCode:0,
  additionalScienceReviewClaim:false,humanApprovalClaim:false,wholeSourceReviewedClaim:false,
  strictGain:0,activeWrites:0,
}
writeFileSync(resolve(packageRoot,'checks/normal-source-adoption.actual.json'),`${JSON.stringify(proof,null,2)}\n`)
const compactReceipt={
  schemaVersion:source.receipt.schemaVersion,bookId:source.receipt.bookId,
  counts:source.receipt.counts,inputBindings:source.receipt.inputBindings,outputBindings:source.receipt.outputBindings,
  omittedGoals:source.receipt.omittedGoals,unresolvedSourceScopes:source.receipt.unresolvedSourceScopes,
  scopes:source.receipt.scopes.map((s:any)=>({key:s.key,path:s.path,viewId:s.viewId,jurisdiction:s.jurisdiction,stage:s.stage,durationModel:s.durationModel,courseProfile:s.courseProfile,goalIds:s.goalIds})),
  snapshotMethod:'Exact selected ordinary receipt fields. Complete generated receipt remains in the execution capsule; this compact snapshot does not claim a full receipt.',
  wholeReceiptSha256:digest(source.outputs[`${config.outputDirectory}/source-projection.receipt.json`]),
}
writeFileSync(resolve(packageRoot,'checks/fresh-normal-source-projection.selected-fields.actual.json'),`${JSON.stringify(compactReceipt,null,2)}\n`)
console.log(JSON.stringify({normalApis:proof.normalApis,actualExitCode:0,counts:proof.counts,bwRoles,all126DecisionsPreserved:true,all220RowsExact:true,original217RowsExact:true,unchangedPreparedSourceOutputs:baseline.outputBindings.length,protected177CanonicalBodiesExact:true,strictGain:0,activeWrites:0},null,2))
