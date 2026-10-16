// Apache-2.0. Independent read-only check; only this review directory is written.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
const R='/home/enpasos/projects/skillpilot'
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const O=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native9-current437-fresh-independent-a-20261016-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const cp=resolve(K,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
assert.equal(sha(cp),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const landscape=read(cp), by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const {buildApplicabilityCompilation}=await import(`${K}/app/scripts/applicabilityCompiler.ts`)
const {compileCompositionView,normalizeCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {applyCompositionViewProjection}=await import(`${K}/app/src/utils/compositionViewRuntime.ts`)
const {convertLearningGoal}=await import(`${K}/app/src/goalTypes.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const {buildDirectChildrenMap,getRenderedChildIds}=await import(`${K}/app/src/utils/treeProjectionRuntime.ts`)
const {getSrsFilterTags}=await import(`${K}/app/src/utils/srsTags.ts`)
const compilation=buildApplicabilityCompilation()
const report=compilation.reports.find((r:any)=>r.landscapeId===landscape.landscapeId)
assert.ok(report)
assert.equal(report.findings.filter((f:any)=>f.severity==='error').length,0)
const app=new Map<string,any>(report.goals.map((g:any)=>[g.goalId,g.compiledApplicability]))
const requirements=[
 ['de-he-gk.view.json','ac1bcf34-169c-5339-92ba-efe8c3022560','be848fa1-8f52-5099-923f-79b776f07f2f'],
 ['de-he-sekii-gk.view.json','ac1bcf34-169c-5339-92ba-efe8c3022560','be848fa1-8f52-5099-923f-79b776f07f2f'],
 ['de-he-lk.view.json','e62c6c58-b688-59c3-8ac5-2cfc26ac22d7','50ea4d12-6da8-5a56-a79f-f518e105efd7'],
 ['de-he-sekii-lk.view.json','e62c6c58-b688-59c3-8ac5-2cfc26ac22d7','50ea4d12-6da8-5a56-a79f-f518e105efd7'],
]
const viewResults=[]
for(const file of ['de-he-gk.view.json','de-he-sekii-gk.view.json','de-he-lk.view.json','de-he-sekii-lk.view.json','de-sh-gk.view.json','de-sh-lk.view.json']){
 const path=resolve(K,'curricula/DE/Gymnasium/composition-views/chemie',file),view=normalizeCompositionView(read(path))
 const preview=compileCompositionView(view,landscape)
 assert.equal(preview.findings.filter((f:any)=>f.severity==='error').length,0)
 const input={meta:landscape,goals:landscape.goals.map((g:any)=>convertLearningGoal({...g,applicability:{...g.applicability,...app.get(g.id)}},{landscapeId:landscape.landscapeId}))}
 const projected=applyCompositionViewProjection([input],view)[0]
 const pby=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(pby)
 const filters=[view.scope.courseProfile,view.scope.jurisdiction].filter(Boolean)
 children.forEach((ids:string[],parent:string)=>children.set(parent,ids.filter(id=>pby.has(id)&&goalMatchesFilters(pby.get(id),filters))))
 const visible=new Set<string>(),todo=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id)
 while(todo.length){const id=todo.pop()!;if(visible.has(id))continue;visible.add(id);todo.push(...getRenderedChildIds(id,pby,children))}
 const subjects=requirements.filter(r=>r[0]===file).map(([,origin,memory])=>{assert.ok(visible.has(origin));assert.ok(visible.has(memory));return {origin,memory,originVisible:true,memoryVisible:true}})
 if(file.startsWith('de-he')&&view.scope.courseProfile==='GK'){
  for(const id of ['0e3f849b-133d-57da-882c-0d67c3eb05b8','b8c8f70f-64cb-50b1-970c-e0c4295da3fb','e62c6c58-b688-59c3-8ac5-2cfc26ac22d7','50ea4d12-6da8-5a56-a79f-f518e105efd7'])assert.ok(!visible.has(id),file+': unexpected GK target '+id)
 }
 if(file.startsWith('de-sh'))for(const id of ['3eb2a06c-d283-57aa-9eb4-088940c4801a','69928892-ac71-553d-a35c-4f96f16b6d6e'])assert.ok(visible.has(id))
 viewResults.push({file,sha256:sha(path),scope:view.scope,subjects,finiteVisibilityPass:true})
}
const drill=readFileSync(`${K}/app/src/components/srs/FlashcardDrill.tsx`,'utf8')
const fragment=drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/)
assert.ok(fragment)
const actualPredicate=new Function('card','filterTags',`return ${fragment[1]}`)
const deck=read(`${K}/curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json`)
const cardResults=[]
for(const [id,expected] of [
 ['03b08b91-6809-576a-8cf1-4a131caab4e5',['chem_eq_q3_012','chem_eq_q3_013']],
 ['be848fa1-8f52-5099-923f-79b776f07f2f',['chem_eq_q3_011']],
 ['50ea4d12-6da8-5a56-a79f-f518e105efd7',['chem_eq_q3_010']],
 ['ddde45b7-a3de-585b-b41e-3ae841349c87',['chem_eq_q3_008']],
] as [string,string[]][]){const g=by.get(id),filterTags=getSrsFilterTags(g.tags),cards=deck.cards.filter((c:any)=>actualPredicate(c,filterTags));assert.deepEqual(cards.map((c:any)=>c.id),expected);cardResults.push({memoryGoalId:id,requires:g.requires,filterTags,cards})}
assert.equal(sha(cp),'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
writeFileSync(`${O}/CHECK.actual-independent-six-stock-views-four-card-selections.json`,JSON.stringify({role:'Fresh nonauthor independent finite runtime-input check A',canonicalSha256:sha(cp),applicabilityErrorCount:0,viewResults,cardResults,notFullM7Check:true,HumanApproval:false,HumanTrial:false},null,2)+'\n')
console.log(JSON.stringify({sixViewsPass:viewResults.length,exactCardSelections:cardResults.length,applicabilityErrors:0}))
