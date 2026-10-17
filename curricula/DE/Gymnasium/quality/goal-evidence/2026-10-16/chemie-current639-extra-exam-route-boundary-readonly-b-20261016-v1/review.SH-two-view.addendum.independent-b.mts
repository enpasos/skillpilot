// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O=`${E}/chemie-current639-extra-exam-route-boundary-readonly-b-20261016-v1`
const A=`${E}/chemie-SH032-existing-source-literacy-target-two-view-author-successor-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const casPath=`${A}/CAS.two-whole-SH-views.existing-source-literacy-target.AUTHOR.inactive.json`
const cas=read(casPath)
const landscape=read(`${K}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`)
assert.equal(sha(`${K}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`),cas.baseCanonical.sha256)
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const {collectCompositionProjectionRoleGoalIds,compileCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const id='5b1bb5d9-07b1-5ba9-b320-cc97be917c60'
function find(nodes:any[],key:string):any{for(const n of nodes){if(n.id===key)return n;const x=find(n.children??[],key);if(x)return x}return null}
function missingDirectClosure(goal:string,allowed:Set<string>,seen=new Set<string>()):any[]{
 if(seen.has(goal))return [];seen.add(goal);const g=by.get(goal)
 return (g?.requires??[]).flatMap((req:string)=>allowed.has(req)?missingDirectClosure(req,allowed,seen):[{from:goal,to:req,title:by.get(req)?.title}])
}
const checks=[]
for(const op of cas.operations){
 assert.equal(sha(op.before.path),op.before.sha256);assert.equal(sha(op.after.path),op.after.sha256)
 const before=read(op.before.path),after=read(op.after.path)
 assert.deepEqual(after.scope,before.scope);assert.equal(after.scope.stage,'CrossStage');assert.equal(after.scope.jurisdiction,'DE-SH')
 const expected=structuredClone(before)
 const section=find(expected.rootNodes,op.soleChange.sectionId);assert.ok(section)
 section.children.push({kind:'goalEntry',goalId:id,projectionRole:'target'})
 assert.deepEqual(after,expected)
 const br=collectCompositionProjectionRoleGoalIds(before.rootNodes,by),ar=collectCompositionProjectionRoleGoalIds(after.rootNodes,by)
 assert.deepEqual([...ar.targetGoalIds].filter((x:string)=>!br.targetGoalIds.has(x)),[id])
 assert.deepEqual([...br.targetGoalIds].filter((x:string)=>!ar.targetGoalIds.has(x)),[])
 assert.deepEqual(ar.prerequisiteOnlyGoalIds,br.prerequisiteOnlyGoalIds)
 const preview=compileCompositionView(after,landscape);assert.equal(preview.findings.filter((f:any)=>f.severity==='error').length,0)
 const allowedBefore=new Set<string>([...br.targetGoalIds,...br.prerequisiteOnlyGoalIds]),allowedAfter=new Set<string>([...ar.targetGoalIds,...ar.prerequisiteOnlyGoalIds])
 const missingBefore=missingDirectClosure('69928892-ac71-553d-a35c-4f96f16b6d6e',allowedBefore)
 const missingAfter=missingDirectClosure('69928892-ac71-553d-a35c-4f96f16b6d6e',allowedAfter)
 assert.equal(missingBefore.length,1);assert.equal(missingBefore[0].to,id);assert.deepEqual(missingAfter,[])
 assert.ok(ar.targetGoalIds.has('a9c22adc-b543-5b0c-a2d8-3189facdff08'))
 checks.push({view:op.normalPath,scope:after.scope,before:op.before,after:op.after,onlyTargetAdded:id,wholeViewExactOneAppend:true,allOldNodesRolesAndSupportExact:true,orientationPrerequisiteAlreadyTarget:true,stockCompileErrors:0,direct699ClosureBefore:missingBefore,direct699ClosureAfter:missingAfter})
}
const result={role:'Independent nonauthor B finite SH source-literacy placement addendum; no writes to candidate or sealed nine-goal review',reviewer:'/root/chemie_native9_fresh_independent_b_20261016',reviewAuthority:'ai_candidate',recordStatus:'candidate',decision:'KEEP',firstFreshScience:{path:`${E}/chemie-native9-current437-fresh-independent-b-20261016-v1/science.first.independent-b.json`,sha256:'sha256:70cc3fe9a98d1bd1738f00cf8183d51b37a865373b4ee3e14f3cf2b55b665fc3',unchanged:true},cas:{path:casPath,sha256:sha(casPath)},actualWholeSourceLiteracyGoal:by.get(id),checks,rationaleDe:'Der bestehende bilinguale SekI-Methodenbaustein umfasst das Auswählen, fachliche Strukturieren und Auswerten chemischer Quellen sowie Quellenangabe. Dies ist genau die in3eb/699 benutzte Materialkompetenz. CrossStage bildet SekI undSekII ab; die explizite Einfügung als TARGET im schon vorhandenen SekI-Methodenabschnitt benennt eine zu erlernende Grundlage ehrlich und passt zu beiden Kursprofilen. Das Ziel verlangt nicht zwingend externe Recherche, weil es ausdrücklich vorgegebene ODER selbst recherchierte Quellen erlaubt. Sein einziges Orientation-Erfordernis ist bereits sichtbar. Daher behebt die Platzierung eine reale fehlende direkte Voraussetzung von3eb, ohne das Thema Medikamente amtlich universal zu machen oder einen gespeicherten Auswahlzustand zu erfinden. Die frühere9er-Wissenschaft beurteilte den richtigen fachlichen Text und die benannten Vorbedingungen; diese ergänzende Sichtprüfung macht den zuvor fehlenden Erwerb jetzt sichtbar. Alle vorigen Sichtziele/-rollen bleiben exakt, keine gewöhnlichen Texte, Karten, Quellen oder native9-Seiten ändern sich.',limitations:['Read-only review of the exact two author CAS views, not an integration receipt.','No fresh peer review read.','The separate old-exam-route audit remains open and is not resolved by this placement.'],HumanApproval:false,HumanTrial:false,M7Claim:false}
writeFileSync(`${O}/ADDENDUM.SH-two-view-source-literacy.KEEP.independent-b.json`,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({decision:'KEEP',views:checks.length,soleTargetAdded:id,stockCompileErrors:0,canonicalChanges:0,nativePageChanges:0}))
