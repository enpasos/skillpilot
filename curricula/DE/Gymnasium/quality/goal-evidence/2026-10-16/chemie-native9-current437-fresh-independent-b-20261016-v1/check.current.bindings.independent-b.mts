// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const R = resolve('.')
const E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O = `${E}/chemie-native9-current437-fresh-independent-b-20261016-v1`
const K = resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const sha = (p:string) => `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const read = (p:string) => JSON.parse(readFileSync(p,'utf8'))
const landscape = read(`${K}/${canonical}`)
assert.equal(sha(`${K}/${canonical}`), 'sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9')
const by = new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
assert.equal(by.size,639)
const { buildApplicabilityCompilation, getAllJsonFiles } = await import(`${K}/app/scripts/applicabilityCompiler.ts`)
const { compileCompositionView, normalizeCompositionView } = await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const { applyCompositionViewProjection } = await import(`${K}/app/src/utils/compositionViewRuntime.ts`)
const { convertLearningGoal } = await import(`${K}/app/src/goalTypes.ts`)
const { goalMatchesFilters } = await import(`${K}/app/src/utils/goalFilters.ts`)
const { buildDirectChildrenMap, getRenderedChildIds } = await import(`${K}/app/src/utils/treeProjectionRuntime.ts`)
const { getSrsFilterTags } = await import(`${K}/app/src/utils/srsTags.ts`)
const maps = getAllJsonFiles(`${K}/curricula/DE/Gymnasium/mapping`).filter((p:string)=>read(p).targetLandscapeId===landscape.landscapeId)
assert.equal(maps.length,82)
const comp = buildApplicabilityCompilation()
const report = comp.reports.find((r:any)=>r.landscapeId===landscape.landscapeId)
assert.ok(report)
assert.equal(report.findings.filter((f:any)=>f.severity==='error').length,0)
const applicability = new Map<string,any>(report.goals.map((g:any)=>[g.goalId,g.compiledApplicability]))
const sourceGoals = landscape.goals.map((g:any)=>convertLearningGoal({...g,applicability:{...g.applicability,...applicability.get(g.id)}},{landscapeId:landscape.landscapeId}))
const drill = readFileSync(`${K}/app/src/components/srs/FlashcardDrill.tsx`,'utf8')
const fragment = drill.match(/data\.cards = data\.cards\.filter\(card =>\s*(card\.tags && card\.tags\.some\(tag => filterTags\.includes\(tag\)\))\s*\)/)
assert.ok(fragment)
const actualPredicate = new Function('card','filterTags',`return ${fragment[1]}`)
function selected(g:any) {
  const filters = getSrsFilterTags(g.tags)
  const source = g.extendedData.vocabularySource
  const sourcePath = source.startsWith('/data/') ? `app/public${source}` : source
  const p = `${K}/${sourcePath}`
  const deck=read(p)
  const cards=deck.cards.filter((c:any)=>actualPredicate(c,filters))
  return {goalId:g.id,title:g.title,description:g.description,requires:g.requires,actualFilterTags:filters,deckPath:sourcePath,deckSha256:sha(p),actualSelectedWholeCards:cards}
}
function audit(file:string, raw:any) {
  const view=normalizeCompositionView(raw)
  const preview=compileCompositionView(view,landscape)
  assert.equal(preview.findings.filter((f:any)=>f.severity==='error').length,0,file)
  const projected=applyCompositionViewProjection([{meta:landscape,goals:sourceGoals}],view)[0]
  const pby=new Map<string,any>(projected.goals.map((g:any)=>[g.id,g]))
  const children=buildDirectChildrenMap(pby)
  const filters=[view.scope.courseProfile,view.scope.jurisdiction].filter(Boolean)
  children.forEach((ids:string[],parent:string)=>children.set(parent,ids.filter(id=>pby.has(id)&&goalMatchesFilters(pby.get(id),filters))))
  const visible=new Set<string>()
  const todo=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id)
  while(todo.length){const id=todo.pop()!;if(visible.has(id))continue;visible.add(id);todo.push(...getRenderedChildIds(id,pby,children))}
  return {file,viewId:view.viewId,scope:view.scope,compileErrors:0,visibleCanonicalLeafIds:[...visible].filter(id=>by.has(id)&&!by.get(id).contains?.length).sort()}
}
const viewsDir=`${K}/curricula/DE/Gymnasium/composition-views/chemie`
const files=readdirSync(viewsDir).filter(x=>x.endsWith('.json')).sort()
assert.equal(files.length,39)
const audits=files.map(file=>audit(file,read(`${viewsDir}/${file}`)))
const cas=read(`${E}/chemie-two-HE-existing-narrow-memory-acquisition-placements-author-20261016-v1/CAS.four-whole-views-existing-narrow-memory-placement.author-inactive.json`)
const four=cas.operations.map((op:any)=>{
  const file=op.normalPath.split('/').at(-1)
  const current=read(`${viewsDir}/${file}`)
  assert.deepEqual(current,op.afterWhole)
  const before=audit(file,op.beforeWhole)
  const after=audits.find(x=>x.file===file)!
  const beforeIds=before.visibleCanonicalLeafIds
  const afterIds=after.visibleCanonicalLeafIds
  assert.ok(afterIds.includes(op.originGoalId))
  assert.ok(afterIds.includes(op.addedEntry.goalId))
  assert.deepEqual(beforeIds.filter(id=>!afterIds.includes(id)),[])
  const added=afterIds.filter(id=>!beforeIds.includes(id))
  assert.deepEqual(added,[op.addedEntry.goalId])
  const mem=by.get(op.addedEntry.goalId)
  assert.deepEqual(mem.requires,[op.originGoalId])
  const cards=selected(mem)
  const expected=mem.id.startsWith('be848')?['chem_eq_q3_011']:['chem_eq_q3_010']
  assert.deepEqual(cards.actualSelectedWholeCards.map((c:any)=>c.id),expected)
  return {file,scope:after.scope,canonicalWholeViewMatchesSealedCASAfter:true,onlyVisibleLeafAdded:added,ordinaryOriginAlreadyVisibleBefore:beforeIds.includes(op.originGoalId),currentMemorySelection:cards}
})
const he=audits.filter(v=>v.scope.jurisdiction==='DE-HE')
assert.equal(he.length,4)
for(const v of he){
  const ids=v.visibleCanonicalLeafIds
  assert.equal(ids.includes('37b4081a-244a-58d8-b448-88ed83344210'),v.scope.courseProfile==='LK')
  assert.equal(ids.includes('0e3f849b-133d-57da-882c-0d67c3eb05b8'),v.scope.courseProfile==='LK')
  assert.equal(ids.includes('03b08b91-6809-576a-8cf1-4a131caab4e5'),v.scope.courseProfile==='LK')
  assert.equal(ids.includes('b8c8f70f-64cb-50b1-970c-e0c4295da3fb'),false)
  assert.equal(ids.includes('ddde45b7-a3de-585b-b41e-3ae841349c87'),false)
  assert.equal(ids.includes('e62c6c58-b688-59c3-8ac5-2cfc26ac22d7'),v.scope.courseProfile==='LK')
  assert.ok(ids.includes('d8eeed29-d1b7-5a48-94b5-343629f8e867'))
}
const sh=audits.filter(v=>v.scope.jurisdiction==='DE-SH')
assert.equal(sh.length,2)
for(const v of sh)for(const id of ['3eb2a06c-d283-57aa-9eb4-088940c4801a','69928892-ac71-553d-a35c-4f96f16b6d6e'])assert.ok(v.visibleCanonicalLeafIds.includes(id))
const inspectIds=['03b08b91-6809-576a-8cf1-4a131caab4e5','567b5b63-8cc5-562f-85d1-13e2bbda9b54','64d71d34-3c52-5428-9948-a62064e99ed0','ddde45b7-a3de-585b-b41e-3ae841349c87']
const selection=inspectIds.map(id=>selected(by.get(id)))
assert.deepEqual(selection[0].actualSelectedWholeCards.map((c:any)=>c.id),['chem_eq_q3_012','chem_eq_q3_013'])
assert.deepEqual(selection[1].actualSelectedWholeCards.map((c:any)=>c.id),['chem_org_q1_005','chem_org_q1_006'])
assert.deepEqual(selection[3].actualSelectedWholeCards.map((c:any)=>c.id),['chem_eq_q3_008'])
for(const s of selection)for(const id of s.requires)assert.ok(by.has(id))
const heMemoryIds=[...new Set(he.flatMap(v=>v.visibleCanonicalLeafIds).filter(id=>by.get(id).nodeKind==='memory'))]
const allCards=readdirSync(`${K}/app/public/data`).filter(f=>f.includes('chemistry')&&f.endsWith('.json')).flatMap(f=>read(`${K}/app/public/data/${f}`).cards??[])
assert.equal(allCards.length,79)
assert.equal(new Set(allCards.map((c:any)=>c.id)).size,79)
const result={role:'Independent B actual stock binding and SRS check, performed after sealed science; technical evidence only',currentCanonicalSha256:sha(`${K}/${canonical}`),wholeGoalCount:by.size,wholeMemoryGoalCount:landscape.goals.filter((g:any)=>g.nodeKind==='memory').length,actualChemistryMappings:maps.length,applicabilityErrors:0,actualViewCount:audits.length,allViewsCompileErrors:0,allActivePrimaryCards:allCards.length,fourExistingNarrowAcquisitions:four,changedAndRelatedActualSelections:selection,HEActualVisibleMemorySelections:heMemoryIds.map(id=>selected(by.get(id))),HEAndSHActualViews:audits.filter(v=>v.scope.jurisdiction==='DE-HE'||v.scope.jurisdiction==='DE-SH'),allViewVisibleLeafIds:audits,HumanApproval:false,HumanTrial:false,machineM7Claim:false}
writeFileSync(`${R}/${O}/CHECK.current-stock-SRS-and-39views.independent-b.json`,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({canonical:result.currentCanonicalSha256,mappings:maps.length,views:audits.length,cards:allCards.length,heMemoryGoals:heMemoryIds.length,fourNarrowAcquisitions:four.length,errors:0}))
