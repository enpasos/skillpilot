import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'

const root='/home/enpasos/projects/skillpilot'
const parentBase=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const base=parentBase+'/final-thirteen-routes-readable-material-credit-author-successor-v9'
const read=(p:string)=>JSON.parse(readFileSync(base+'/'+p,'utf8'))
const write=(p:string,d:any)=>writeFileSync(base+'/'+p,JSON.stringify(d,null,2)+'\n')
const sha=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex')
const before=read('../inputs/root300.CAN389.before.json')
const after=read('whole-current300-plus-Generic11-and-thirteen-bounded-terminals.inert.candidate.json')
const view=read('../inputs/book-navigation.before.json')
const config=read('../inputs/book-config.before.json')
const ledger=read('../inputs/root300.SEM389.before.json')
const oldQa=read('../inputs/root300.QA.before.json')
const newQa=read('../inputs/prepared-Generic11.QA.before.json')
const afterLedger=structuredClone(ledger)
for (const g of after.goals) {
 let d=afterLedger.decisions.find((x:any)=>x.goalId===g.id)
 if(!d){d={goalId:g.id,semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'};afterLedger.decisions.push(d)}
 d.sourceFingerprint=fingerprintSemanticKindSourceGoal(g)
}
afterLedger.counts.practiceAssessment+=14
afterLedger.counts.total+=14
const digests=(qa:any, assetRoot:string)=>Object.fromEntries(qa.records.filter((q:any)=>q.publicAssetPath).map((q:any)=>[q.imageUrl,'sha256:'+sha(readFileSync(resolve(assetRoot,q.publicAssetPath)))]))
const args={compositionView:view,evidenceReviewSources:[],config:{...config,evidenceReviewPaths:[]}}
const modelBefore=buildGoalBookModel({...args,landscape:before,semanticKindLedger:ledger,goalVisualizationQa:oldQa,goalVisualizationAssetDigests:digests(oldQa,root)})
const modelAfter=buildGoalBookModel({...args,landscape:after,semanticKindLedger:afterLedger,goalVisualizationQa:newQa,goalVisualizationAssetDigests:digests(newQa,'/tmp/skillpilot-wirtschaft-generic10-current311-476152vl')})
const strictPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-final-nineteen-current311-after-methods20-native-preparation-20261008-v1/final-current281-frozen-D19-v1/root-final19-individual-synthesis-and-native-closure-20261009-v1/actual-integrated-central-and-targeted-native-checks/current-central-five-subject-report.actual.json'
const strictBytes=readFileSync(resolve(root,strictPath))
const strict=JSON.parse(strictBytes.toString()).subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften')
const strictIds=new Set<string>(strict.strictCompleteGoalIds)
const next=new Map(modelAfter.pages.map(p=>[p.goalId,p]))
const changed=modelBefore.pages.flatMap(p=>{
 const n=next.get(p.goalId)!
 const fields=Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((n as any)[k]))
 return fields.length?[{goalId:p.goalId,title:p.title,wasStrict300:strictIds.has(p.goalId),changedFields:fields,beforeWholeOwnerPageSha256:sha(stableGoalBookJson(p)),candidateWholeOwnerPageSha256:sha(stableGoalBookJson(n)),before:p,candidate:n}]:[]
})
write('whole-current311-before-Root300.structural.book-model.json',modelBefore)
write('whole-current311-after-Generic11-thirteen-routes.structural.book-model.json',modelAfter)
write('actual-all311-Generic11-thirteen-routes-ownerpage-comparison.inventory.json',{
 schemaVersion:1,kind:'actual-native-structural-ownerpage-byte-comparison-no-fachreview',uniformPositiveEvidenceOmission:true,
 rows:modelBefore.pages.map(p=>{const n=next.get(p.goalId)!;return{goalId:p.goalId,wasStrict300:strictIds.has(p.goalId),beforeWholeOwnerPageSha256:sha(stableGoalBookJson(p)),candidateWholeOwnerPageSha256:sha(stableGoalBookJson(n)),exactlySame:stableGoalBookJson(p)===stableGoalBookJson(n)}})
})
write('actual-combined-Generic11-thirteen-routes-current311-ownerpage-impact.json',{
 schemaVersion:1,kind:'actual-current300-whole-ownerpage-impact-author-handoff',qualityApproval:false,newStrictClosures:0,
 strictCurrentBaseline:{path:strictPath,sha256:sha(strictBytes),strictComplete:strict.strictComplete,denominator:strict.denominator},
 beforePages:modelBefore.pages.length,afterPages:modelAfter.pages.length,
 affectedCurricularAtomicOwnerPages:changed,affectedStrict300GoalIds:changed.filter(x=>x.wasStrict300).map(x=>x.goalId),
 unchangedWholeOwnerPages:modelBefore.pages.length-changed.length,
 note:'Both native models uniformly omit P only to measure true structural/context changes. Input QA is exact: root300 for before and independently reviewed preparedGeneric11 for after, with actual asset digests. Transient ledger fingerprints/classification are author model inputs, not new reviews or live decisions. No page-count-only or SHA-only replacement constitutes a D/P/AM/V closure.'
})
console.log(JSON.stringify({before:modelBefore.pages.length,after:modelAfter.pages.length,changed:changed.map(({goalId,title,wasStrict300,changedFields})=>({goalId,title,wasStrict300,changedFields}))},null,2))
