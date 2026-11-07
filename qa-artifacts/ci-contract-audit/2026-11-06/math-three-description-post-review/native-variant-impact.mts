import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
import {fingerprintSemanticKindSourceGoal,parseSemanticKindLedger} from '../../../../app/scripts/goalBookModel'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics} from '../../../../app/scripts/positiveGoalEvidenceProfileModel'
const repo=process.cwd(),require=createRequire(resolve(repo,'app/package.json')),ts=require('typescript')
const sha=(s:Buffer|string)=>createHash('sha256').update(s).digest('hex')
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const jsonl=(p:string)=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse)
const pin=(p:string)=>({path:p,sha256:sha(readFileSync(p))})
function nativeFingerprint(path:string,names:string[]){
 const source=readFileSync(path,'utf8'),ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true)
 const selected=ast.statements.filter((s:any)=>ts.isFunctionDeclaration(s)&&names.includes(s.name?.text))
 assert.equal(selected.length,names.length)
 const exact=selected.map((s:any)=>s.getText(ast)).join('\n')
 const js=ts.transpileModule(exact,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText
 return {fn:new Function('createHash',js+'\nreturn fingerprintGoal;')(createHash),sourcePin:pin(path),selectedDeclarationsSha256:sha(exact),functionNames:names}
}
const atomic=nativeFingerprint('app/scripts/semanticAtomicityReview.ts',['normalizeText','stableJson','getSemanticPayload','fingerprintGoal'])
const memory=nativeFingerprint('app/scripts/memoryCardReview.ts',['normalizeText','stableJson','fingerprintGoal'])
const sourcePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
assert.equal(sha(readFileSync(sourcePath)),'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6')
const source=load(sourcePath),plan=load('docs/dev/ci-graph-repairs/math-orientation-three-normalization-plan-2026-11-06.json')
const norm=structuredClone(source)
for(const op of plan.operations){const g=norm.goals.find((g:any)=>g.id===op.guardGoalId);assert.deepEqual(g.requires,op.guardRequiresBefore);g.requires=op.value}
const base='qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet'
const aPath=base+'/round-a/results/mathematik-three-targets-20261106-v1-first-pass-a.batch-001.records.jsonl'
const bPath=base+'/round-b/results/mathematik-three-targets-20261106-v1-first-pass-b.batch-001.records.jsonl'
const rounds={a:jsonl(aPath),b:jsonl(bPath)}
const variants:any={live:source,requiresOnly:norm}
for(const label of ['a','b'] as const){
 const c=structuredClone(norm),record=rounds[label][0],g=c.goals.find((g:any)=>g.id===record.goalId)
 assert.equal(record.decision,'revise');assert.equal(g.description,record.currentDescriptionDe);assert.equal(g.descriptionEn,record.currentDescriptionEn)
 g.description=record.proposedDescriptionDe;g.descriptionEn=record.proposedDescriptionEn;variants[label]=c
}
const configs={A:'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.config.json',M:'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.config.json'}
const ac=load(configs.A),mc=load(configs.M),ar=jsonl(ac.reviewPath),mr=jsonl(mc.reviewPath),cards=jsonl(mc.cardReviewPath)
const ledgerPath='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',ledger=load(ledgerPath)
const impact=load('tmp/math-orientation-normalization-review-2026-11-06/evidence-impact.json')
const rows:any[]=[]
for(const id of plan.operations.map((o:any)=>o.guardGoalId)){
 const a=ar.filter((x:any)=>x.goalId===id),m=mr.filter((x:any)=>x.goalId===id);assert.equal(a.length,1);assert.equal(m.length,1)
 const ir=impact.rows.find((x:any)=>x.goalId===id),p=ir.positiveBindings[0],pr=jsonl(p.reviewPath).find((x:any)=>x.goalId===id)
 const measured:any={}
 for(const [label,v] of Object.entries(variants) as any){
  const g=v.goals.find((g:any)=>g.id===id)
  measured[label]={semanticKindFingerprint:fingerprintSemanticKindSourceGoal(g),A:atomic.fn(g,ac.ruleVersion),M:memory.fn(g,mc.ruleVersion),PGoal:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),PReviewInput:fingerprintPositiveGoalEvidenceReviewInput(g,pr.reviewCriteriaFingerprint,p.resourceDigests,'curricularAtomic'),historicalPErrors:validatePositiveGoalEvidenceRecordSemantics(pr,g,p.resourceDigests,'curricularAtomic')}
 }
 assert.equal(measured.live.A,a[0].fingerprint);assert.equal(measured.live.M,m[0].fingerprint)
 assert.deepEqual(measured.live.historicalPErrors,[])
 rows.push({goalId:id,currentARecord:a[0],currentMRecord:m[0],primaryCardRecordsReferencingGoal:cards.filter((x:any)=>(x.originGoalIds??[]).includes(id)),positiveConfig:pin(p.configPath),positiveReview:pin(p.reviewPath),resourceDigests:p.resourceDigests,measurements:measured})
}
const totalDeltas:any={}
for(const label of ['requiresOnly','a','b']){
 const v=variants[label],keys:any={Kind:[],A:[],M:[],PGoal:[]}
 for(let i=0;i<source.goals.length;i++){
  const before=source.goals[i],after=v.goals[i];assert.equal(before.id,after.id)
  if(fingerprintSemanticKindSourceGoal(before)!==fingerprintSemanticKindSourceGoal(after))keys.Kind.push(before.id)
  if(atomic.fn(before,ac.ruleVersion)!==atomic.fn(after,ac.ruleVersion))keys.A.push(before.id)
  if(memory.fn(before,mc.ruleVersion)!==memory.fn(after,mc.ruleVersion))keys.M.push(before.id)
  if(fingerprintGoalForPositiveEvidence(before,'curricularAtomic')!==fingerprintGoalForPositiveEvidence(after,'curricularAtomic'))keys.PGoal.push(before.id)
 }
 totalDeltas[label]=keys
}
const fresh=structuredClone(ledger),kindDecisions:any[]=[]
for(const row of rows){
 const goal=variants.b.goals.find((g:any)=>g.id===row.goalId),next=fresh.decisions.find((d:any)=>d.goalId===row.goalId)
 next.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal);next.decisionBasis='reviewed-current-semantic-recheck-curricular-atomic';kindDecisions.push(structuredClone(next))
}
parseSemanticKindLedger(ledger,source,ledger.sourceLandscapeId,ledger.sourceLandscapePath)
let stale=false;try{parseSemanticKindLedger(ledger,variants.b,ledger.sourceLandscapeId,ledger.sourceLandscapePath)}catch{stale=true};assert.ok(stale)
parseSemanticKindLedger(fresh,variants.b,ledger.sourceLandscapeId,ledger.sourceLandscapePath)
const out={status:'read-only-native-fingerprint-impact-not-review-transport',source:pin(sourcePath),recordPins:[pin(aPath),pin(bPath)],ledger:pin(ledgerPath),bindings:[pin(configs.A),pin(configs.M),pin(ac.reviewPath),pin(mc.reviewPath),pin(mc.cardReviewPath)],nativeFingerprintExtraction:[{...atomic,fn:undefined},{...memory,fn:undefined}],nativeImports:[pin('app/scripts/goalBookModel.ts'),pin('app/scripts/positiveGoalEvidenceProfileModel.ts'),pin('app/scripts/goalEvidenceProfileModel.ts')],rows,totalDeltas,variantBKindDrafts:kindDecisions,kindValidation:{liveWithLiveLedger:'pass',variantBWithLiveLedger:'reject',variantBWithThreeNewKindDrafts:'pass'},activeWrites:false,fullNativeQaExecuted:false}
writeFileSync('qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-post-review/native-variant-impact.json',JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify({totalDeltas,kindValidation:out.kindValidation,activeWrites:false},null,2))
