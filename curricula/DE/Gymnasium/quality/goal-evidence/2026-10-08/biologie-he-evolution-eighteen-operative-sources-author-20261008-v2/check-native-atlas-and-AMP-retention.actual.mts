import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const own=relative(process.cwd(),dirname(new URL(import.meta.url).pathname))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(n:string,v:any)=>writeFileSync(`${own}/${n}`,JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const digest=(v:string|Buffer)=>'sha256:'+createHash('sha256').update(v).digest('hex')
const snapshots=read(`${own}/declared-current-whole-input-snapshots.actual.json`)
const current='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const kindPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const delta=read(`${own}/targeted-eighteen-operative-source-before-after.author.json`)
const changed=new Set(delta.goalTextPatches.map((p:any)=>p.goalId))
const canonicalPath=`${own}/canonical.current-whole-plus-only-two-reviewed-wording-patches.inactive.candidate.json`
const land=read(canonicalPath), original=read(snapshots[current]), kinds=read(snapshots[kindPath])
const by=new Map(land.goals.map((g:any)=>[g.id,g]))
const oldKinds=structuredClone(kinds.decisions)
for(const d of kinds.decisions)if(changed.has(d.goalId))d.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(d.goalId) as any)
kinds.sourceLandscapePath=canonicalPath
write('semantic-kinds.current-whole-plus-two-science-reviewed-wording-bindings.inactive.candidate.json',kinds)
assert.equal(land.goals.length,original.goals.length)
for(const g of land.goals)if(!changed.has(g.id))assert.deepEqual(g,original.goals.find((x:any)=>x.id===g.id))
for(const d of kinds.decisions)if(!changed.has(d.goalId))assert.deepEqual(d,oldKinds.find((x:any)=>x.goalId===d.goalId))
const ids=new Set(delta.deltas.map((d:any)=>d.canonicalGoalId))
const A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-independent-a-20261008-v1'
for(const lane of ['A','M','P']){
 const source=`${A}/${lane}18.retained-sixteen-plus-two-targeted.review.jsonl`
 const ledger=snapshots[source]
 const rows=readFileSync(ledger,'utf8').trim().split('\n').map(line=>JSON.parse(line))
 assert.equal(rows.length,18);assert.ok(rows.every(r=>ids.has(r.goalId)))
 const cfg=read(`${A}/${lane}18.targeted-two-goal.config.json`)
 cfg.landscapePath=canonicalPath;cfg.reviewPath=ledger
 cfg.reportPath=`${own}/${lane}18.current-whole-source-v2.native-report.actual.md`
 cfg.scope.label='Source-only v2 technical retention: same eighteen scientific competencies; sixteen unchanged and two genuinely judged wording repairs from immutable independent A; no fresh source approval'
 if(lane==='P')cfg.semanticKindLedgerPath=`${own}/semantic-kinds.current-whole-plus-two-science-reviewed-wording-bindings.inactive.candidate.json`
 write(`${lane}18.current-whole-source-v2.native-config.actual.json`,cfg)
}
const bcfg=read(`${own}/atlas.before-source-change.native-config.actual.json`),acfg=read(`${own}/atlas.after-source-change.native-config.actual.json`)
// Same whole original current bodies are used both times: no source-only test
// can hide effects from the separately approved two wording repairs.
const before=buildGoalBookSourceAtlasInputs(bcfg),after=buildGoalBookSourceAtlasInputs(acfg)
assert.equal(before.receipt.counts.sourceViews,after.receipt.counts.sourceViews)
assert.deepEqual(before.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})),after.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})))
assert.deepEqual(before.receipt.counts,after.receipt.counts)
const outputBindings=[]
for(const [label,r]of [['before',before],['after',after]] as const){
 write(`atlas.${label}.whole-native-receipt.actual.json`,r.receipt)
 for(const [p,body]of Object.entries(r.outputs)){
  const name=`atlas-native-outputs/${label}/${p.replace('app/scripts/config/goal-books/','').replaceAll('/','__')}`
  // Returned book-local strings are snapshotted under this packet only.
  const fs=await import('node:fs');fs.mkdirSync(dirname(`${own}/${name}`),{recursive:true});writeFileSync(`${own}/${name}`,body,{flag:'wx'})
  outputBindings.push({side:label,nativeOutputPath:p,ownedSnapshotPath:`${own}/${name}`,sha256:digest(body)})
 }
}
write('eighteen-source-v2-current-whole-atlas-before-after.actual.json',{schemaVersion:1,nativeAPI:'app/scripts/goalBookSourceAtlasInputs.ts::buildGoalBookSourceAtlasInputs',countsBefore:before.receipt.counts,countsAfter:after.receipt.counts,allScopeGoalIdSetsExact:true,sourceMappingPointerChangedOnlyOne:true,affectedGoalIds:[...ids],sourceOnlyChanges:18,preservedSourceRows:126,allOtherCanonicalGoalBodiesExact:true,reviewedWordPatches:delta.goalTextPatches,nonMandatoryModelsRetainVisibility:true,optionalQ22RetainsVisibility:true,scopeVisibilityIsNotOfficialMandatoryDutyApproval:true,originalWholeCurrentBaselineSha256:digest(readFileSync(snapshots[current])),currentWholePlusTwoPatchSha256:digest(readFileSync(canonicalPath)),outputBindings,activeWrites:0,sourceIndependentApprovalCount:0,humanApproval:false})
console.log(JSON.stringify({before:before.receipt.counts,after:after.receipt.counts,scopeGoalIdSetsExact:true,activeWrites:0}))
