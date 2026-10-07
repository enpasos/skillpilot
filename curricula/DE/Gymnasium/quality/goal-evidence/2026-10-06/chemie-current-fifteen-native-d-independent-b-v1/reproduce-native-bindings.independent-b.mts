import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const root=process.cwd(),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'chemie-current-fifteen-native-d-independent-b-v1/',author=base+'chemie-current-atomic-description-positive-gap-author-v1/'
const inputs=new Map<string,any>();
const bind=(p:string)=>{const b=readFileSync(p);inputs.set(p,{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});return b}
const read=(p:string)=>JSON.parse(bind(p).toString())
const expected=read(author+'actual-current378-national359-subset15-page-source-context-bindings.json')
const input=read(author+'native-d-fifteen/round-b/description-review-input.json')
const full=await loadGoalBookBuildInputs(author+'full-current378.book.config.json',root)
const national=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',root)
const atlas=buildGoalBookSourceAtlasInputs(read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'),root)
for(const b of atlas.receipt.inputBindings)bind(b.path)
for(const p of [author+'full-current378.book.config.json','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json',full.config.landscapePath,full.config.compositionViewPath,full.config.semanticKindLedgerPath,full.config.goalVisualizationQaPath])if(p)bind(p)
const canonical=read(full.config.landscapePath),byId=new Map(canonical.goals.map((g:any)=>[g.id,g]))
assert.equal(full.model.pages.length,378);assert.equal(national.model.pages.length,359);assert.equal(input.goals.length,15)
assert.equal(full.model.digest,expected.fullModelDigest);assert.equal(national.model.digest,expected.nationalModelDigest)
const rows=input.goals.map((g:any)=>{
 const authored=expected.rows.find((r:any)=>r.goalId===g.goalId)!,f=full.model.pages.find(p=>p.goalId===g.goalId)!,n=national.model.pages.find(p=>p.goalId===g.goalId)!
 assert.ok(f&&n);assert.deepEqual(f,authored.fullCurrent378Page);assert.deepEqual(n,authored.national359Page)
 assert.equal(f.description,g.currentDescriptionDe);assert.equal(f.goalFingerprint,g.goalFingerprint);assert.equal(n.goalFingerprint,g.goalFingerprint)
 assert.equal('sha256:'+createHash('sha256').update(stableGoalBookJson(byId.get(g.goalId))).digest('hex'),authored.wholeCurrentGoalDigest)
 const witnesses=atlas.receipt.scopes.flatMap(s=>s.witnesses.filter(w=>w.goalId===g.goalId).map(w=>({scopeKey:s.key,...w})))
 assert.deepEqual(witnesses,authored.actualNativeSourceScopeWitnesses)
 return {goalId:g.goalId,actualCanonicalGoal:byId.get(g.goalId),actualFull378Page:f,actualNational359Page:n,actualSubset15Page:g.reviewContext.page,actualNativeWitnesses:witnesses,primaryScopeNotInferredFromWitnesses:true}
})
writeFileSync(own+'native-current378-national359-subset15.actual.json',JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),actualNativeModelReproduction:true,full378:full.model.pages.length,national359:national.model.pages.length,subset15:input.goals.length,fullDigest:full.model.digest,nationalDigest:national.model.digest,sourceAtlasCounts:atlas.receipt.counts,sourceScopes:atlas.receipt.scopes.length,rows,allActualInputs:[...inputs.values()],peerAResultsRead:false,activeWrites:false,humanApproval:false,strictNetGain:0},null,2)+'\n')
console.log(JSON.stringify({status:'PASS',full378:378,national359:359,subset15:15,sourceScopes:atlas.receipt.scopes.length,actualNativeInputBindings:inputs.size}))
