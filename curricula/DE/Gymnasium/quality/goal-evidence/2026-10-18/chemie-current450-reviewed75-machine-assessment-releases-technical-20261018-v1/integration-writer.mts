// SPDX-License-Identifier: Apache-2.0
// Bounded, separately reviewed interface integration. No new ordinary scientific vote.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,unlinkSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {isDeepStrictEqual} from 'node:util'
import {convertLearningGoal} from '../app/src/goalTypes'
import {applyCompositionViewProjection} from '../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,compileCompositionView} from '../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../app/src/utils/goalFilters'
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/',out=base+'chemie-current450-reviewed75-machine-assessment-releases-technical-20261018-v1'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),dump=(v:any)=>JSON.stringify(v,null,2)+'\n',pin=(path:string)=>{const b=readFileSync(path);return{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
assert(!existsSync(out),'Release already executed; never repeat')
const expected=process.argv.find(a=>a.startsWith('--expected-canonical-sha256='))?.split('=')[1];assert(/^[a-f0-9]{64}$/.test(expected??''),'Explicit current canonical cut hash required');assert.equal(pin(canonical).sha256,expected,'Current canonical differs from explicit reviewed cut')
const bodies=[
 ['chemie-current450-T3-phosphate-bilingual-material-author-20261018-v4/AUTHOR.eighteen-exams.seventeen-whole-objects-exact.pending.json','goals'],
 ['chemie-current450-T1-terminal-exams-interface-author-20261018-v7/AUTHOR.new-goals.full.draft.json','newGoals'],
 ['chemie-current450-T4-terminal-exams-author-20261018-v1/AUTHOR.sixteen-whole-new-exam-goals.pending.json','goals'],
 ['chemie-current450-T5-terminal-exams-author-20261018-v3/AUTHOR.eight-complete-exam-goals.draft.json','array'],
 ['chemie-current450-T4-operative-two-material-author-20261018-v3/AUTHOR.two-new-complete-exam-goals.pending.json','goals'],
 ['chemie-current450-T2-terminal-exams-interface-author-20261018-v6/AUTHOR.new-goals.full.draft.json','newGoals'],
]
const receipts=[
 'chemie-current450-T3-reviewed-seventeen-normal-integration-technical-20261018-v1/RECEIPT.actual-T3-seventeen-assessment-integration.json',
 'chemie-current450-SN-reviewed-pair-normal-integration-technical-20261018-v1/RECEIPT.actual-source-matched-SN-pair-integration.json',
 'chemie-current450-T1-reviewed-twelve-normal-integration-technical-20261018-v1/RECEIPT.actual-T1-twelve-assessment-integration.json',
 'chemie-current450-T4-reviewed-sixteen-normal-integration-technical-20261018-v1/RECEIPT.actual-T4-sixteen-assessment-integration.json',
 'chemie-current450-T5-reviewed-eight-normal-integration-technical-20261018-v1/RECEIPT.actual-T5-eight-assessment-integration.json',
 'chemie-current450-T4-reviewed-two-operative-normal-integration-technical-20261018-v1/RECEIPT.actual-T4-two-operative-assessment-integration.json',
 'chemie-current450-T2-reviewed-nineteen-normal-integration-technical-20261018-v1/RECEIPT.actual-T2-nineteen-assessment-and-source-integration.json',
].map(p=>base+p)
const raw=readFileSync(canonical,'utf8'),before=JSON.parse(raw),after=structuredClone(before),semRaw=readFileSync(semantic,'utf8'),sem=JSON.parse(semRaw),semBefore=structuredClone(sem),beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),newBy=new Map<string,any>()
assert.equal(before.goals.length,737,'All reviewed75 designs must be integrated before this release')
for(const [p,key]of bodies){const d=read(base+p);for(const g of key==='array'?d:d[key]){assert(!newBy.has(g.id),'Duplicate reviewed design');newBy.set(g.id,g)}}assert.equal(newBy.size,75,'Exactly75 accepted new design IDs required')
const receiptOwner=new Map<string,string>();for(const p of receipts){const d=read(p),ids=d.integratedEndpointIds??(p.includes('SN-reviewed-pair')?['61c1d898-07b3-53a0-b8a0-a7c49006eff9']:[]);for(const id of ids){assert(!receiptOwner.has(id),'Duplicate integration owner');receiptOwner.set(id,p)}}assert.deepEqual([...receiptOwner.keys()].sort(),[...newBy.keys()].sort(),'Accepted design and actual integration rosters differ')
const inputs=[canonical,semantic,registry,...bodies.map(([p])=>base+p),...receipts].map(pin),protectedPins=read(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath]).map(pin),changes:any[]=[]
for(const g of after.goals){if(!newBy.has(g.id))continue;const design=newBy.get(g.id),original=beforeBy.get(g.id),decision=sem.decisions.find((r:any)=>r.goalId===g.id);assert.equal(decision.semanticKind,'practiceAssessment','Release cannot reclassify ordinary/memory');assert.deepEqual(g.examData,design.examData,'Reviewed exact complete assessment design drift');assert.equal(g.examData.reviewStatus,'draft','Only exact original draft may be released');assert.deepEqual(g.requires,design.requires,'Reviewed all-of coverage drift');assert.deepEqual(g.requires,g.examData.coveredGoalIds,'Direct coverage differs from requirements');assert.deepEqual(g.resourceLinks,design.resourceLinks,'Exam material resource links drift');g.examData.reviewStatus='released';g.examData.reviewNote='Machine-reviewed assessment design. Independent substantive review and bounded source/scope/method follow-ups are bound in the release evidence. Actual learner performance, local safety clearance and human approval remain separate.';g.extendedData.machineAssessmentRelease={status:'machine_design_released',integrationEvidence:receiptOwner.get(g.id),releaseReceipt:out+'/RECEIPT.actual-75-machine-assessment-design-releases.json',historicalDraftReviewNote:original.examData.reviewNote??null,retainsHistoricalAuthorMetadata:true,actualLearnerExecution:false,humanApproval:false,humanTrial:false,localSafetyApproval:false,finalCurriculumNativeAndCentralChecksPending:true};const restored=structuredClone(g.examData);restored.reviewStatus=original.examData.reviewStatus;if(original.examData.reviewNote===undefined)delete restored.reviewNote;else restored.reviewNote=original.examData.reviewNote;assert.deepEqual(restored,original.examData,'Task/solution/rubric/material/coverage payload changed by release');decision.sourceFingerprint=fingerprintSemanticKindSourceGoal(g);changes.push({goalId:g.id,originalWholeGoal:original,releasedWholeGoal:g,originalWholeLedgerRow:semBefore.decisions.find((r:any)=>r.goalId===g.id),releasedWholeLedgerRow:decision,designSource:bodies.find(([p,k])=>{const d=read(base+p);return(k==='array'?d:d[k]).some((x:any)=>x.id===g.id)})?.[0],integration:receiptOwner.get(g.id)})}
assert.equal(changes.length,75,'Wrong release count');assert.deepEqual(sem.counts,semBefore.counts,'Semantic count changed')
for(const g of before.goals)if(!newBy.has(g.id))assert.deepEqual(after.goals.find((x:any)=>x.id===g.id),g,'An unselected/legacy/ordinary object changed')
for(const d of semBefore.decisions)if(!newBy.has(d.goalId))assert.deepEqual(sem.decisions.find((x:any)=>x.goalId===d.goalId),d,'Unselected semantic row changed')
const marker='\n  "goals": [\n',start=raw.indexOf(marker)+marker.length,end=raw.lastIndexOf('\n  ]'),body=raw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!);assert.equal(starts.length,before.goals.length,'Raw canonical parser drift')
let patched='';for(let i=0;i<starts.length;i++){const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''));patched+=newBy.has(g.id)?'    '+JSON.stringify(after.goals.find((x:any)=>x.id===g.id),null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part}const afterRaw=raw.slice(0,start)+patched+raw.slice(end);assert.deepEqual(JSON.parse(afterRaw),after,'Raw release patch differs from exact approved proposal')
const probe='app/scripts/.__chemie450_75release_probe.ts';let beforeRoute:any,afterRoute:any
try{writeFileSync(probe,readFileSync('app/scripts/generateCurriculumQualityStatus.ts','utf8')+'\nexport {evaluateRouteProfile,routeProfiles};\n',{flag:'wx'});const m:any=await import(pathToFileURL(resolve(probe)).href),profile=m.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2');beforeRoute=m.evaluateRouteProfile(before,profile,{reports:[]});afterRoute=m.evaluateRouteProfile(after,profile,{reports:[]});for(const id of ['CQR-201','CQR-202','CQR-203'])assert.equal(afterRoute.rules.find((r:any)=>r.id===id)?.status,'pass','Required machine exam rule fails after release '+id);assert.equal(afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics.missingTerminalPath,0,'Terminal paths reopened')}finally{if(existsSync(probe))unlinkSync(probe)}
for(const p of [...inputs,...protectedPins])assert.deepEqual(pin(p.path),p,'Prewrite input drift')
const metrics=afterRoute.rules.filter((r:any)=>['CQR-101','CQR-201','CQR-202','CQR-203'].includes(r.id))
if(!process.argv.includes('--write')){writeFileSync('tmp/chemie450-75release-preflight.json',dump({role:'READ_ONLY_75_EXACT_DESIGN_RELEASE_PREFLIGHT_NOT_NORMAL_RELEASE',inputs,selectedDesignIds:[...newBy.keys()],metrics,normalWrites:0}));console.log(JSON.stringify({checkOnly:true,designs:75,stockRules:metrics}));process.exit(0)}
mkdirSync(out);writeFileSync(out+'/BEFORE.canonical.exact.json.snapshot',raw,{flag:'wx'});writeFileSync(out+'/BEFORE.semantic-kinds.exact.json.snapshot',semRaw,{flag:'wx'});writeFileSync(out+'/CAS75.exact-whole-goal-and-ledger.json',dump(changes),{flag:'wx'});writeFileSync(canonical,afterRaw);writeFileSync(semantic,dump(sem));assert.deepEqual(read(canonical),after,'Actual release write differs');for(const p of protectedPins)assert.deepEqual(pin(p.path),p,'Protected subjects changed');assert.deepEqual(pin(registry),inputs[2],'Registry changed')
writeFileSync(out+'/integration-writer.mts',readFileSync(process.argv[1]),{flag:'wx'})
writeFileSync(out+'/RECEIPT.actual-75-machine-assessment-design-releases.json',dump({role:'CURATED_MACHINE_DESIGN_RELEASE_WITH_EXISTING_GENUINE_SUBSTANTIVE_REVIEW_NOT_HUMAN_RELEASE',inputs,selectedReleasedIds:[...newBy.keys()],allTaskSolutionScoringMaterialCoverageRequiresExact:true,newOrdinaryScientificFirstCompletions:0,newNativeDOrPBindings:0,all450OrdinaryAndOtherUnselectedObjectsAndLedgerRowsExact:true,originalAuthorCandidateAndDraftMetadataRetainedAsHistory:true,beforeRoute,afterRoute,protectedInputs:protectedPins,outputs:[canonical,semantic].map(pin),limits:{humanApproval:false,humanTrial:false,actualLearnerExecution:false,localSafetyRelease:false,finalCurriculumNativeSourceApplicabilityCentralChecksPending:true,M7Claim:false,newCIPassClaim:false}}),{flag:'wx'})
writeFileSync(out+'/SEAL.actual-75-machine-design-releases.json',dump({role:'EXACT_MACHINE_DESIGN_RELEASE_OUTPUTS',members:readdirSync(out).map(n=>pin(out+'/'+n)),outputs:[canonical,semantic].map(pin)}),{flag:'wx'})
console.log(JSON.stringify({out,releasedMachineDesigns:75,ordinaryScienceUnchanged:450,requiredExamRules:metrics}))
