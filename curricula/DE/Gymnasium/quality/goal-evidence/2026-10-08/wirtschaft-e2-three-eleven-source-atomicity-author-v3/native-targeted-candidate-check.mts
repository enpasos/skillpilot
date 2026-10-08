// Apache-2.0. Candidate graph/source-key checks; no independent fachliche approval.
import assert from 'node:assert/strict'
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {buildCanonicalGraphIndex,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {evaluateCourseLevelMappingConsistency} from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
import {sourceAtlasDescendants,sourceAtlasFacet} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-three-eleven-source-atomicity-author-v3'
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const candidate=await read(own+'/canonical-three-clusters-eleven-atoms.inert.json')
const author=await read(own+'/author-source-atomicity-successor.actual.json')
const originalPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-monetary-social-seventeen-native-preparation-technical-20261008-v1/root-current96-context/canonical.current96-root.snapshot.json'
const originalBytes=await readFile(originalPath)
assert.equal('sha256:'+createHash('sha256').update(originalBytes).digest('hex'),author.currentCanonicalSha256Unmodified)
const original=JSON.parse(originalBytes.toString())
const ids:string[]=await read(own+'/atomic-goal-ids.candidate.json')
const parents:string[]=await read(own+'/stable-parent-goal-ids.json')
const readiness=await read(own+'/reverse-requires.exact-foundations.reviewed-inert-ops.json')
const allowed=new Set([...parents,...readiness.ops.map((r:any)=>r.goalId)])
const by=new Map(candidate.goals.map((g:any)=>[g.id,g])) as Map<string,any>
assert.equal(by.size,381);assert.equal(ids.length,11)
const diagnostics=validateCanonicalLandscape(candidate,buildCanonicalGraphIndex(candidate))
assert.deepEqual(diagnostics.filter((r:any)=>r.severity==='error'),[])
for(const edge of ['requires','contains']){
 const active=new Set<string>(),done=new Set<string>()
 const visit=(id:string)=>{if(active.has(id))throw Error('cycle '+edge+' '+id);if(done.has(id))return;active.add(id);for(const raw of by.get(id)[edge]??[]){const next=raw.replace(candidate.landscapeId+':','');assert(by.has(next));visit(next)}active.delete(id);done.add(id)}
 for(const id of by.keys())visit(id)
}
const unchanged=original.goals.filter((g:any)=>!allowed.has(g.id))
assert.equal(unchanged.length,365)
assert(unchanged.every((g:any)=>JSON.stringify(g)===JSON.stringify(by.get(g.id))))
const reused='d3c11bfa-103c-5b58-8183-561e0b076251'
assert.deepEqual(by.get(reused),original.goals.find((g:any)=>g.id===reused))
assert.equal(candidate.goals.filter((g:any)=>(g.contains??[]).includes(reused)).length,original.goals.filter((g:any)=>(g.contains??[]).includes(reused)).length)
for(const row of readiness.ops){assert.deepEqual(by.get(row.goalId),row.wholeCandidate);assert(!row.after.some((id:string)=>ids.includes(id)))}
const mappingPath=own+'/mapping/twelve-units-to-eleven-new-and-existing-d3.review.candidate.json'
const mapping={...await read(mappingPath),file:mappingPath}
const source=await read(mapping.sourceExtractionPath)
assert.equal(source.sourceGoals.length,12);assert.equal(source.sourceDocuments.length,2);assert.equal(source.passages.length,3)
assert.equal(new Set(source.sourceDocuments.map((r:any)=>r.key)).size,2)
const previous=await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-three-twelve-source-atomicity-author-v2/source-components/DE_BY_WR_WWG_TWELVE_CONTENT_COMPONENTS.author-v2.source-extraction.json')
const prevGoals=new Map(previous.sourceGoals.map((g:any)=>[g.id,g])) as Map<string,any>
const keyBindings=[]
for(const g of source.sourceGoals){
 const p=source.passages.find((r:any)=>r.id===g.passageId);assert(p)
 assert.equal(g.sourceDocumentKey,p.sourceDocumentKey)
 const docs=source.sourceDocuments.filter((r:any)=>r.key===g.sourceDocumentKey);assert.equal(docs.length,1)
 assert.equal(docs[0].path,g.sourcePath);assert.equal(docs[0].url,g.sourceUrl)
 assert.deepEqual(sourceAtlasFacet([g,p,source],'stage'),['SekI'])
 const old=prevGoals.get(g.id);for(const key of ['sourceText','rawSourceText','parentBulletText','rawParentBulletText','sourceSpan','rawSourceSpan','id'])assert.equal(g[key],old[key])
 keyBindings.push({sourceGoalId:g.id,passageId:p.id,sourceDocumentKey:g.sourceDocumentKey,uniqueOriginalDocument:true,rawSourceFieldsPreserved:true})
}
const atoms=new Set([...ids,reused])
for(const id of parents)assert.deepEqual(sourceAtlasDescendants(id,by,atoms,candidate.landscapeId),[],'No broad old cluster mapping must inherit to the11 new bounded atoms')
for(const id of ids)assert.deepEqual(sourceAtlasDescendants(id,by,atoms,candidate.landscapeId),[id])
assert.deepEqual(sourceAtlasDescendants(reused,by,atoms,candidate.landscapeId),[reused])
assert.equal(mapping.mappings.length,12)
assert.deepEqual(new Set(mapping.mappings.map((r:any)=>r.canonicalGoalId)),atoms)
const cqr004=evaluateCourseLevelMappingConsistency(candidate,[mapping]);assert.equal(cqr004.status,'pass')
await writeFile(own+'/native-targeted-candidate-check.actual.json',JSON.stringify({schemaVersion:1,role:'technical_author_candidate_check',checkedAt:new Date().toISOString(),pinnedOriginalCanonicalPath:originalPath,pinnedOriginalCanonicalSha256:author.currentCanonicalSha256Unmodified,nativeCanonicalDiagnostics:diagnostics,allLocalReferencesAndBothDagsPass:true,candidateGoalCount:381,newAtomicCandidates:11,originalWholeGoalsByteEquivalentExceptThreeClustersAndTwoRequiresOps:365,existingD3WholeAndVisiblePlacementUnchanged:true,exactReadinessOps:2,sourceDocumentKeyBindings:keyBindings,nativeSourceAtlasFacetSekI:true,nativeSourceAtlasDescendantsBroadInheritanceBlocked:11,nativeDirectSourceUnitTargets:12,rawOriginalSourceUnitsPreserved:12,nativeCqr004:cqr004,fullSourceAtlasBuildApprovalClaimed:false,pendingMandatoryChecks:['Independent whole14/source/taxonomy/A/M11 review','New narrow market-form card and full visibility closure','Physical candidate semantic-kind classification and full source-atlas/applicability/coverage/LayerA checks after independent approval','All11 P-v2/current images/two independent D reviews','Affected existing source/page/context bindings; no existing strict result counted as a new closure'],independentReviewClaim:false,humanApprovalClaimed:false,activeWrites:0,newStrictClosures:0},null,2)+'\n',{flag:'wx'})
console.log('BY v3 native graph/DAG/references PASS;365 other whole goals unchanged;12 raw units/document keys unique; native atlas boundaries block11 inherited child claims. Full source-atlas approval remains pending.')
