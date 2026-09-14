import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Run from repository root with app/node_modules/.bin/tsx <this-file> [--write].
const root = process.cwd()
const out = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
assert(args.every(a => a === '--write') && args.length <= 1)
const write = args.includes('--write')
const native = name => import(pathToFileURL(resolve(root, 'app/scripts', name + '.ts')).href)
const { materializeGoalDescriptionRolloutBatchDualSummary } = await native('materializeGoalDescriptionRolloutBatch')
const { buildGoalDescriptionDualRoundResolution, extractGoalDescriptionDualRoundResolutionSource, validateGoalDescriptionDualRoundResolution } = await native('validateGoalDescriptionDualRoundResolution')
const { loadGoalBookBuildInputs, stableGoalBookJson } = await native('goalBookModel')
const { buildGoalDescriptionCanonicalContext } = await native('validateGoalDescriptionReviewCampaign')
const hash = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const read = p => readFile(resolve(root, p))
const json = async p => JSON.parse(await read(p))
const batch = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/batch-048-current-concepts-final-20-v1'
const author = JSON.parse(await readFile(resolve(out, 'synthesis-authoring.json')))
const id = author.goalId
assert.equal(id, 'fbecbd60-5db3-51e8-94be-d66b066ffa06')
assert.equal(author.evidenceRound, 'second')
const dual = await materializeGoalDescriptionRolloutBatchDualSummary(batch + '.config.json', false)
assert.equal(hash(dual.bytes), 'sha256:6b414186b933224d16ebad5b9baad261ddf0236e3c85f0e93356c5f9d4d6b64f')
const input = dual.first.input.goals.find(g => g.goalId === id)
const secondInput = dual.second.input.goals.find(g => g.goalId === id)
assert.deepEqual(input, secondInput)
const landscape = await json('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const goal = landscape.goals.find(g => g.id === id)
assert.deepEqual(input.canonicalContext, buildGoalDescriptionCanonicalContext(goal))
assert.deepEqual(
  [input.currentTitleDe,input.currentTitleEn,input.currentDescriptionDe,input.currentDescriptionEn],
  [goal.title,goal.titleEn,goal.description,goal.descriptionEn])
const prerequisite = landscape.goals.find(g => g.id === '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2')
const audit = await json('curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/residual-eleven-triage.audit.json')
const annex = audit.nativeB048ReuseAnnex
assert.equal(annex.goalId, id)
for (const diff of annex.prerequisite.ownDifferences) {
  assert.equal(prerequisite[diff.field === 'descriptionDe' ? 'description' : 'descriptionEn'], diff.current)
}
const current = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-physics-national-atlas.json')
const currentPage = current.model.pages.find(p => p.goalId === id)
const normalize = page => {
  const result = structuredClone(page)
  for (const key of ['pageNumber','navigationOrder','treeOrder','pageFingerprint']) delete result[key]
  for (const key of ['requires','reverseRequires','externalPrerequisites','externalReverseRequires']) {
    result[key] = (result[key] || []).map(({goalId,title}) => ({goalId,title})).sort((a,b) => a.goalId < b.goalId ? -1 : a.goalId > b.goalId ? 1 : 0)
  }
  return result
}
assert.equal(stableGoalBookJson(normalize(input.reviewContext.page)), stableGoalBookJson(normalize(currentPage)))
assert.equal(hash(await read('app/public' + currentPage.visualization.url)), currentPage.visualization.originalDigest)
const first = extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.first,goalId:id,label:'First'})
const second = extractGoalDescriptionDualRoundResolutionSource({artifacts:dual.second,goalId:id,label:'Second'})
assert.deepEqual(first.errors,[])
assert.deepEqual(second.errors,[])
assert.equal(first.source.decision,'keep')
assert.equal(second.source.decision,'keep')
const resolution = buildGoalDescriptionDualRoundResolution({
  resolutionId:'physics-b048-oblique-current-carryover-20260914-v1',
  goalId:id,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',
  currentInput:dual.first.input,dualSummaryBytes:dual.bytes,
  firstSource:first.source,secondSource:second.source,
  synthesis:{
    synthesisId:'physics-b048-oblique-informed-synthesis-20260914-v1',
    authority:'ai_synthesis',synthesizedBy:author.synthesizedBy,synthesizedAt:author.synthesizedAt,
    rationaleDe:author.rationaleDe,rationaleEn:author.rationaleEn,
    understandingEvidence:second.source.record.understandingEvidence,
    dissent:[{
      dissentId:'physics-b048-oblique-evidence-selection',
      source:'both',disposition:'accepted_second',
      textDe:'Beide unabhängigen Urteile sind KEEP; A verändert die Landehöhe, B den vertikalen Startanteil. Root wählt B. Beide Originalbegründungen bleiben unverändert; die Wahl entfernt keine historische P-Dissensnotiz.',
      textEn:'Both independent judgments are KEEP; A changes landing height, B the initial vertical component. Root selects B. Both original rationales remain unchanged and the choice removes no historical profile dissent.'
    }],
    humanAttestation:null
  }
})
const result = await validateGoalDescriptionDualRoundResolution({
  resolution,dualSummary:dual.summary,dualSummaryBytes:dual.bytes,
  currentInput:dual.first.input,landscape,first:dual.first,second:dual.second
})
assert.deepEqual(result.errors,[])
assert.equal(result.strictDescriptionComplete,true)
const bytes = value => Buffer.from(JSON.stringify(value,null,2)+'\n')
const resolutionBytes = bytes(resolution)
const groupId = dual.prepared.manifest.batchId
const index = {
  schemaVersion:1,artifactSetId:'physics-b048-oblique-current-carryover-20260914-v1',
  subject:'Physik',semanticKind:'curricularAtomic',
  strictDescriptionReviewCompleteCount:1,curriculumAtomicDenominator:478,descriptionReviewPercentage:0.2,
  groups:[{groupId,artifactDirectory:relative(out,resolve(root,batch)).split('\\').join('/'),
    dualSummaryPath:relative(out,resolve(root,batch,'dual-summary.json')).split('\\').join('/'),dualSummaryDigest:hash(dual.bytes),campaignGoalCount:20,resolvedGoalCount:1}],
  resolutions:[{goalId:id,titleDe:goal.title,groupId,decision:'keep_current',
    resolutionPath:relative(resolve(root,batch),resolve(out,'resolution.json')).split('\\').join('/'),
    resolutionDigest:hash(resolutionBytes),resolutionFingerprint:resolution.resolutionFingerprint,strictDescriptionComplete:true}]
}
const receipt = {
  schemaVersion:1,goalId:id,authority:'informed_ai_synthesis_of_existing_independent_reviews',
  auditPath:'../residual-eleven-triage.audit.json',auditSha256:hash(await read('curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/residual-eleven-triage.audit.json')),
  authoringSha256:hash(await readFile(resolve(out,'synthesis-authoring.json'))),
  unchangedOwnText:true,unchangedCanonicalContext:true,unchangedSubstantivePageFields:true,
  historicalPageFingerprint:input.pageFingerprint,currentAtlasPageFingerprint:currentPage.pageFingerprint,
  normalization:'Only navigation/page numbers and internal/external reference placement are normalized to sorted goalId/title; historical artifact bytes unchanged.',
  imageSha256:currentPage.visualization.originalDigest,
  prerequisiteChangeIndividuallyAdjudicated:true,profileBodyChanged:false,oldRecordsChanged:false,
  newBlindReview:false,providerOrModelDiversityClaimed:false,humanApproved:false,
  nativeValidation:result,resolutionFingerprint:resolution.resolutionFingerprint
}
for (const [name,value] of [['resolution.json',resolution],['resolution-index.json',index],['compatibility-receipt.json',receipt]]) {
  const target=resolve(out,name), expected=bytes(value)
  let existing
  try { existing=await readFile(target) } catch(e) { if(e.code!=='ENOENT')throw e }
  if(existing) assert(existing.equals(expected),'Existing artifact changed: '+target)
  else if(write) await writeFile(target,expected,{flag:'wx'})
  else throw Error('Missing artifact '+target)
}
console.log('B048 oblique carryover native valid: 1/1; historical rounds, text, image and profile unchanged.')
