import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalBookModel, loadGoalBookBuildInputs, stableGoalBookJson, fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput } from '../../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const base="curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-042-astro-nuclear-electronics-mechanics-20-v1"
const read=(p:string)=>readFileSync(p)
const json=(p:string)=>JSON.parse(read(p).toString())
const digest=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const equal=(a:unknown,b:unknown)=>stableGoalBookJson(a)===stableGoalBookJson(b)
async function main(){
 const proposal=json(process.argv[2] ?? base+'/minimal-english-translation-proposals-v1.json')
 const native=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-physics-national-atlas.json')
 const config=native.config
 const beforeBytes=read(config.landscapePath), landscape=JSON.parse(beforeBytes.toString())
 const after=JSON.parse(JSON.stringify(landscape))
 for(const ch of proposal.changes){
   const g=after.goals.find((g:any)=>g.id===ch.goalId); assert.ok(g)
   for(const [key,v] of Object.entries(ch.fields) as [string,any][]){ assert.equal(g[key],v.before); g[key]=v.after }
 }
 const manifest=json(config.compositionViewManifestPath!)
 const qa=json(config.goalVisualizationQaPath)
 const assetDigests=Object.fromEntries(qa.records.filter((r:any)=>r.visualizationState==='available').map((r:any)=>[r.imageUrl,digest(read(r.publicAssetPath))]))
 const args={landscape,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:json(path)})),navigationView:json(manifest.navigationViewPath),externalLandscapeSources:(config.externalLandscapePaths??[]).map(path=>({path,landscape:json(path)})),durationModelPolicy:json(manifest.durationModelPolicyPath),semanticKindLedger:json(config.semanticKindLedgerPath),goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:config.evidenceReviewPaths.map(path=>({path,text:read(path).toString()})),config}
 const baseline=buildGoalBookModel(args)
 assert.equal(baseline.digest,native.model.digest,'In-memory loader reconstruction must exactly equal normal native loading')
 let unchangedLedgerFailure=''
 try { buildGoalBookModel({...args,landscape:after}) } catch(error) { unchangedLedgerFailure=String(error) }
 assert.ok(unchangedLedgerFailure.includes('stale semantic-kind decision'),'The real unchanged ledger must fail closed for the proposed English bytes')
 const hypotheticalLedger=JSON.parse(JSON.stringify(args.semanticKindLedger))
 const hypotheticalSemanticKindRebindings=proposal.changes.map((ch:any)=>{
   const decision=hypotheticalLedger.decisions.find((d:any)=>d.goalId===ch.goalId)
   const oldFingerprint=decision.sourceFingerprint
   const newFingerprint=fingerprintSemanticKindSourceGoal(after.goals.find((g:any)=>g.id===ch.goalId))
   decision.sourceFingerprint=newFingerprint
   return {goalId:ch.goalId,oldFingerprint,newFingerprint,semanticKind:decision.semanticKind}
 })
 const proposed=buildGoalBookModel({...args,landscape:after,semanticKindLedger:hypotheticalLedger})
 const changedPages=baseline.pages.flatMap(page=>{const next=proposed.pages.find(p=>p.goalId===page.goalId)!;return equal(page,next)?[]:[{goalId:page.goalId,title:page.title,pageNumber:page.pageNumber,beforeGoalFingerprint:page.goalFingerprint,afterGoalFingerprint:next.goalFingerprint,beforePageFingerprint:page.pageFingerprint,afterPageFingerprint:next.pageFingerprint,changedFields:[...new Set([...Object.keys(page),...Object.keys(next)])].filter(k=>!equal((page as any)[k],(next as any)[k]))}]})
 const r9config=json(base.replace('batch-042-astro-nuclear-electronics-mechanics-20-v1','batch-042r-current-nine-contexts-v1')+'.config.json')
 const subsetArgs={goalIds:r9config.goalIds,bookId:r9config.bookId,title:r9config.title}
 const oldSubset=buildGoalDescriptionRolloutSubsetModel({baseModel:baseline,...subsetArgs})
 const newSubset=buildGoalDescriptionRolloutSubsetModel({baseModel:proposed,...subsetArgs})
 const pconfig=json('curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-042-adjudicated-nine-v1.config.json')
 const criteria=digest(read(pconfig.reviewCriteriaPath))
 const pChecks=pconfig.scope.goalIds.map((id:string)=>{
   const a=landscape.goals.find((g:any)=>g.id===id),b=after.goals.find((g:any)=>g.id===id)
   const resources=Object.fromEntries((a.resourceLinks??[]).filter((r:any)=>r.type==='goal-visualization').map((r:any)=>[r.url,digest(read('app/public'+r.url))]))
   return {goalId:id,entireCanonicalGoalUnchanged:equal(a,b),goalFingerprintUnchanged:fingerprintGoalForPositiveEvidence(a,'curricularAtomic')===fingerprintGoalForPositiveEvidence(b,'curricularAtomic'),positiveReviewInputFingerprintUnchanged:fingerprintPositiveGoalEvidenceReviewInput(a,criteria,resources,'curricularAtomic')===fingerprintPositiveGoalEvidenceReviewInput(b,criteria,resources,'curricularAtomic')}
 })
 assert.ok(pChecks.every((r:any)=>r.entireCanonicalGoalUnchanged&&r.goalFingerprintUnchanged&&r.positiveReviewInputFingerprintUnchanged))
 assert.deepEqual(changedPages.map(p=>p.goalId).sort(),proposal.changes.map((c:any)=>c.goalId).sort())
 assert.ok(equal(oldSubset.pages,newSubset.pages))
 assert.deepEqual(read(config.landscapePath),beforeBytes,'Shared canonical bytes must remain unmodified')
 const changedGoals=landscape.goals.flatMap((g:any)=>{const next=after.goals.find((x:any)=>x.id===g.id);return equal(g,next)?[]:[{goalId:g.id,changedFields:Object.keys(g).filter(k=>!equal(g[k],next[k]))}]})
 console.log(JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),mode:'Read-only native in-memory hypothetical impact; no canonical or publication writes',canonicalPath:config.landscapePath,beforeCanonicalFileDigest:digest(beforeBytes),nativeBaselineReconstructionExact:true,unchangedLedgerFailure,hypotheticalSemanticKindRebindings,hypothesisOnly:'Page prognosis assumes the existing curricularAtomic decisions would later be explicitly revalidated on the proposed text bytes. Only a memory copy was rebound for this counterfactual; no current authority or actual ledger validation is claimed.',changedGoals,pageCount:baseline.pages.length,changedPages,unchangedPageCount:baseline.pages.length-changedPages.length,beforeModelDigest:baseline.digest,proposedModelDigest:proposed.digest,r9:{configPath:r9config.outputDirectory+'.config.json',recordsOrResultsRead:false,allNineFullPageObjectsUnchanged:equal(oldSubset.pages,newSubset.pages),oldSubsetModelDigest:oldSubset.digest,hypotheticalNewSubsetModelDigest:newSubset.digest,note:'Global source/model digest changes even though all nine exact page objects remain identical. Existing independent runs must not be relabelled or silently rebound.'},p9:pChecks,qaNotes:['German and English title/description fields are included by semanticAtomicityReview.ts and memoryCardReview.ts fingerprint payloads; existing records of the exact edited goals will be stale and require normal current revalidation.','No image bytes change; only the exact proposal fields are simulated. No new image approval claim.'],sharedCanonicalUnchanged:true},null,2))
}
void main()
