import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
const require=createRequire(path.resolve('app/package.json'))
const ts=require('typescript')
const source='app/scripts/positiveGoalEvidenceProfileModel.ts'
const model=require(path.resolve(source))
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-four-resource-delta-current-informed-P-bindings-20261016-v1'
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const pin=(p:string)=>({path:p,sha256:hash(fs.readFileSync(p)),bytes:fs.statSync(p).size})
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const write=(n:string,x:any)=>fs.writeFileSync(root+'/'+n,JSON.stringify(x,null,2)+'\n')
const selectorPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-two-existing-PNG-whole-original-provenance-links-author-successor-20261016-v2/OUTPUTS.two-original-whole-PNG-links.author-successor.selector.json'
const selector=read(selectorPath)
const host='tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
const goals=new Map(read(host+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').goals.map((g:any)=>[g.id,g]))
if(pin(host+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').sha256!==selector.canonical.sha256)throw Error('Host canonical not selected exact source')
const originalPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/positive/P13.independent-b.review.jsonl'
const ids=new Set(['5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c','545a2e56-e981-5725-b0e4-a0c77f7f291e','b8c8f70f-64cb-50b1-970c-e0c4295da3fb','e62c6c58-b688-59c3-8ac5-2cfc26ac22d7'])
const rows=fs.readFileSync(originalPath,'utf8').trim().split('\n').map((s:string,i:number)=>({record:JSON.parse(s),sourceLine:i+1})).filter((x:any)=>ids.has(x.record.goalId)).map((x:any)=>{
 const old=x.record,g:any=goals.get(old.goalId),digests:Record<string,string>={}
 const assets=(g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>{const p=host+'/app/public'+l.url,v=pin(p);digests[l.url]=v.sha256;return {url:l.url,actualHostAsset:v}})
 const input=model.fingerprintPositiveGoalEvidenceReviewInput(g,old.reviewCriteriaFingerprint,digests,'curricularAtomic')
 return {goalId:old.goalId,source:pin(originalPath),sourceLine:x.sourceLine,originalReviewId:old.reviewId,originalReviewRunIds:old.reviewRunIds,wholeCurrentGoal:g,currentWholeGoalTechnicalSha256:hash(JSON.stringify(g)),originalGoalFingerprint:old.goalFingerprint,currentGoalFingerprint:model.fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),originalReviewInputFingerprint:old.reviewInputFingerprint,currentInputWithOriginalCriteria:input,originalReviewInputExactAgain:input===old.reviewInputFingerprint,originalProfileFingerprint:old.profileFingerprint,currentProfileSelfFingerprint:model.fingerprintPositiveGoalEvidenceProfile(old.profile),actualHostAssets:assets}
})
write('COMPARE.four-current-resource-inputs.actual.json',{role:'Actual stock API current input comparison before choosing retention or genuine own current binding; no original row relabelled',canonical:pin(selector.canonical.path),selector:pin(selectorPath),rows,stockSource:pin(source),stockDependency:pin('app/scripts/goalEvidenceProfileModel.ts')})
if(selector.canonical.sha256!=='sha256:d04ad3344616d40f8f9b97653cb926166b43b39c19153804e32d91b2782eebf8')throw Error('Expected final original-link metadata canonical')
const originals=fs.readFileSync(originalPath).toString('utf8').trim().split('\n').map(s=>JSON.parse(s))
const retainedIds=new Set(['b8c8f70f-64cb-50b1-970c-e0c4295da3fb','e62c6c58-b688-59c3-8ac5-2cfc26ac22d7'])
for(const r of rows)if(retainedIds.has(r.goalId)&&!r.originalReviewInputExactAgain)throw Error('Original PNG P record still not exact: '+r.goalId)
const originalConfigPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/positive/P13.independent-b.inactive.config.json'
const oc=read(originalConfigPath)
const retainedLines=fs.readFileSync(originalPath,'utf8').split(/(?<=\n)/).filter((s:string)=>s.trim()&&retainedIds.has(JSON.parse(s).goalId))
fs.writeFileSync(root+'/P2.restored-PNG-original-genuine-B.whole-lines.exact.jsonl',retainedLines.join(''))
fs.copyFileSync(oc.reviewCriteriaPath,root+'/criteria.original-P13.whole-byte-exact.md')
fs.copyFileSync(oc.reviewRunManifestPaths[0],root+'/P13.whole-original-genuine-B.run.byte-exact.json')
write('P2.restored-PNG-original-genuine-B.current.config.json',{...oc,landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semanticKindLedgerPath:'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',reviewCriteriaPath:root+'/criteria.original-P13.whole-byte-exact.md',reviewPath:root+'/P2.restored-PNG-original-genuine-B.whole-lines.exact.jsonl',reviewRunManifestPaths:[root+'/P13.whole-original-genuine-B.run.byte-exact.json'],scope:{label:'Two byte-exact original genuine P rows after restoration of their exact originally reviewed PNG whole-resource links; no new P science',goalIds:[...retainedIds]}})
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
fs.copyFileSync(criteriaPath,root+'/criteria.current-positive.whole-byte-exact.md')
const currentCriteriaFp=pin(criteriaPath).sha256
const newId='chemie-two-current-jpg-informed-positive-bindings-20261016-v1'
const now=new Date().toISOString()
const ownJudgments:Record<string,any>={
 '5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c':{
  pixelJudgment:'Actual current JPG read: the four panels state A+B⇌C+D with A addition,2A(g)⇌B(g) under compression, an explicitly endothermic A+B+heat⇌C reaction, and a catalyst accelerating equilibration without changing equilibrium/K. These are scientifically compatible with the old reviewed profile; no new compulsory practical task is introduced. Old PNG and current JPG are both actually seen, distinct resources; this is a new informed JPG binding judgment, not an old PNG vote relabelled.',
  profileBinding:'All four whole-duty expectations, both complete DE/EN q3-03-a/b materials/tasks/models/rubrics and changed-condition transfer were actually read. The content remains the original modeling profile. NH3/feed/product removal, gas-mole pressure effects, temperature/energy direction and CO2 everyday transfer are covered; the equal-gas-mole counterexample and constant-T product removal expose shallow rule repetition. Conversion shift is kept distinct from absolute concentration; rate is kept distinct from yield. All required substantive facets plus independent transfer may be shown within one task; no additional-task quota follows from minimumIndependentDemonstrations=2.',
 },
 '545a2e56-e981-5725-b0e4-a0c77f7f291e':{
  pixelJudgment:'Actual current JPG read: it gives the Haber-Bosch partial-pressure expression, explicitly states immediate fixed-temperature doubling of all partial pressures, derives Qnew=Qold/4, separates later Q<K re-equilibration and product removal, and lists pressure/energy, temperature/rate and catalyst/K tradeoffs. All are scientifically consistent. The old PNG was actually compared; current JPG stays unchanged and is not called the old approved PNG.',
  profileBinding:'The original whole modeling profile and complete DE/EN q3-04-a/b material/tasks/models/rubrics/fresh transfers were actually read. The physical addition root0.7847, normal2/3 conversion and compression root0.2192 are already genuinely reviewed and retained unchanged. Current resource supports, rather than substitutes for, independent balance/root/Q reasoning; mole fraction and concentration remain distinguished. Cost/energy caveats bound a technical option, not an unproved global optimum. Independent evidence is substantive aspects and meaningful transfer, not a compulsory count of separate tasks.',
 }
}
const ownRecords=originals.filter(r=>ids.has(r.goalId)&&!retainedIds.has(r.goalId)).map(old=>{
 const g:any=goals.get(old.goalId),resources:Record<string,string>={}
 for(const a of rows.find(r=>r.goalId===old.goalId)!.actualHostAssets)resources[a.url]=a.actualHostAsset.sha256
 return {...old,reviewId:newId,reviewCriteriaFingerprint:currentCriteriaFp,goalFingerprint:model.fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:model.fingerprintPositiveGoalEvidenceReviewInput(g,currentCriteriaFp,resources,'curricularAtomic'),profileFingerprint:model.fingerprintPositiveGoalEvidenceProfile(old.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:now,reviewer:'Codex /root/chemie_current_p_profiles_scientific_binding_20261016; own informed current resource-to-profile binding judgment',reason:ownJudgments[old.goalId].pixelJudgment+' '+ownJudgments[old.goalId].profileBinding+' E1/G1 is anchored artifact judgment only. No observed learner/lab execution, human approval, or whole-source-union grant.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:['Current informed binding only. Original profile science, IDs and run manifests remain unchanged in provenance. Source-scope remediations are not restarted. Supplied models/rubrics are prospective, not executed learner evidence.']}
})
fs.writeFileSync(root+'/P2.current-JPG-own-informed-bindings.normal.jsonl',ownRecords.map(r=>JSON.stringify(r)).join('\n')+'\n')
write('P2.current-JPG-own-informed-bindings.config.json',{...oc,reviewId:newId,landscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semanticKindLedgerPath:'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',reviewCriteriaPath:root+'/criteria.current-positive.whole-byte-exact.md',reviewPath:root+'/P2.current-JPG-own-informed-bindings.normal.jsonl',reviewRunManifestPaths:[],scope:{label:'Two genuine own informed current JPG-to-existing-whole-profile bindings; E1/G1 artifact inspection only, no repeated historical source science',goalIds:ownRecords.map(r=>r.goalId)}})
const joinPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'
const tuples=read(joinPath).selected13WholeTuples
const v2Path='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-two-existing-PNG-current-informed-machine-visual-binding-20261016-v1/V2.actual-current-restored-PNG-own-scientific-judgments.json'
const v2=read(v2Path)
const metadataFollowup=v2.rows.map((v:any)=>{
 const g:any=goals.get(v.goalId),t=tuples.find((t:any)=>t.goalId===v.goalId),without=(x:any)=>{const y={...x};delete y.resourceLinks;return y}
 if(JSON.stringify(g)!==JSON.stringify(t.wholeGoal))throw Error('Restored whole goal is not original reviewed whole goal')
 if(JSON.stringify(without(g))!==JSON.stringify(without(v.wholeReviewedCurrentGoal)))throw Error('V2 semantic/body content changed outside resourceLinks')
 const asset=rows.find(r=>r.goalId===v.goalId)!.actualHostAssets[0].actualHostAsset
 if(asset.sha256!==v.asset.sha256)throw Error('V2 actual inspected pixels changed')
 return {goalId:v.goalId,ownOriginalV2ScientificJudgment:pin(v2Path),currentWholeGoal:g,currentWholeGoalExactlyEqualsOriginalReviewedP13Goal:true,allFieldsOutsideResourceLinksExactlyEqualOwnV2ReviewedBody:true,currentAsset:asset,actualPngPixelsExactlySameAsOwnActualNative360680Views:true,wholeLinkProvenanceAndAltNowOriginal:true,newPixelVote:false,newImageViewOrGeneration:false,originalCurrentJpgNOKHistoryRetained:true}
})
write('FOLLOWUP.V2-own-science-to-final-original-link-metadata.exact.json',{role:'Bounded informed metadata-binding continuation of existing own actual V2 science; no repeated pixel review or new V vote',reviewedAt:now,canonical:pin(selector.canonical.path),rows:metadataFollowup,HumanApproval:false,HumanTrial:false,newNormalQARecordsHere:0,globalQA449PassClaimed:false})
write('FIRST.two-genuine-own-current-JPG-P-bindings-and-two-exact-original-retentions.json',{role:'Two genuine own informed current JPG binding judgments plus two exact original P record retentions; original scientific IDs/runs never relabelled',reviewedAt:now,canonical:pin(selector.canonical.path),newGenuinePBindingJudgments:2,oldScientificProfileRewrites:0,ownCurrentJpgJudgments:ownJudgments,retainedOriginalPngGoalIds:[...retainedIds],wholeProfileBodiesExactlyPreserved:ownRecords.every(r=>JSON.stringify(r.profile)===JSON.stringify(originals.find(o=>o.goalId===r.goalId).profile)),completeBilingualCasesActuallyRead:9,originalGenuinePScience:{source:pin(originalPath),run:pin(oc.reviewRunManifestPaths[0]),criteria:pin(oc.reviewCriteriaPath)},informedNotBlind:true,actualPixelViews:'All4 originalPNGs and all4 prior/currentJPGs actually viewed; b8/e62 actual360/680 original captures viewed; nowexactsamePNGbytes after metadata fix',oldJpgNOKs:pin(v2Path),actualLearnerOrLaboratoryExecution:false,prospectiveCaseEvidenceE0NotPromotedByLabel:true,currentBindingArtifactJudgmentEvidenceLevel:'E1',maximumClaimScope:'G1',newModelRunManifests:0,HumanApproval:false,HumanTrial:false})
const configs=[root+'/P2.restored-PNG-original-genuine-B.current.config.json',root+'/P2.current-JPG-own-informed-bindings.config.json']
write('OUTPUTS.four-current-P-bindings.two-original-two-own-informed.selector.json',{role:'Four scoped current normal P bindings, two original exact retentions and two new genuine informed bindings',canonical:pin(selector.canonical.path),scopeCount:4,configs,retainedOriginalNormalRows:2,newInformedCurrentBindingRows:2,newProfileBodies:0,HumanApproval:false,HumanTrial:false})
write('INPUTS.finite-four-current-P-bindings.json',{pins:[pin(selectorPath),pin(selector.canonical.path),pin(originalPath),pin(originalConfigPath),pin(oc.reviewCriteriaPath),pin(oc.reviewRunManifestPaths[0]),pin(criteriaPath),pin(joinPath),pin(v2Path),pin(source),pin('app/scripts/goalEvidenceProfileModel.ts')]})
process.stdout.write(JSON.stringify(rows.map((x:any)=>({goalId:x.goalId,goalExact:x.originalGoalFingerprint===x.currentGoalFingerprint,inputExactAgain:x.originalReviewInputExactAgain,profileSelfExact:x.originalProfileFingerprint===x.currentProfileSelfFingerprint})),null,2)+'\n')
