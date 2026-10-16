// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
const R=process.cwd(),E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const L=R+'/tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1'
const S=E+'/chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1'
const Q=E+'/chemie-existing-seki-lab-cluster-four-sekii-support-placements-author-20261016-v1'
const O=E+'/chemie-two-generic-GK-prior-boundaries-and-existing-recall-selection-author-20261016-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const land=read(L+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),by=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]))
const polar='f4d5a02d-711b-5a6b-a41d-971359c1f64d',ions='3eada74b-25b8-55dc-811a-acb473196f53',lkStereo='85342c52-9722-54b0-8fbb-513d9d648363',lkElectro='0c9fe376-0fbd-5dc1-b8d4-d56d658a00e3',basicElectro='fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef'
const operations=[]
for(const id of [polar,ions]){
 const before=by.get(id),after=structuredClone(before)
 if(id===polar){assert(after.requires.includes(lkStereo));after.requires=after.requires.filter((x:string)=>x!==lkStereo)}
 else{assert(after.requires.includes(lkElectro));after.requires=after.requires.map((x:string)=>x===lkElectro?basicElectro:x)}
 operations.push({goalId:id,beforeWhole:before,afterWhole:after,changedFields:['requires'],authorRationaleDe:id===polar?'Die unveränderten ganzen drei P-Fälle verlangen spezifische Drehung, Enantiomer/Racemat und begrenzten Referenzvergleich. Die weiterhin vorausgesetzten Aminosäure- und Kohlenhydratkompetenzen enthalten die tatsächlichen Chiralitäts-/Enantiomeriegrundlagen. Eine zusätzliche universelle Voraussetzung von R/S-, E/Z- und Konformationsdarstellung ist stärker als diese unveränderte Leistung. Kein P-Fall, Operator oder Schlussvorbehalt entfällt.':'Die unveränderten zwei ganzen P-Fälle verlangen lokale Gleichgewichtspotenziale, bilanzierte Elektrodenreaktionen, Entladungsreihenfolge und Überspannung einschließlich vorgegebener Schwellenrechnung. Das vorhandene vollständige Grundziel Elektrolyse beschreiben plus weiterhin erforderliche Spannungsreihe trägt diesen Einstieg. Die gesonderte LK-Verknüpfung von elektrischer Arbeit und Redoxgleichgewicht ist keine universelle vorgelagerte Pflicht für die ganze konkrete Überspannungsaufgabe. Thermodynamik/Kinetik und alle Berechnungen bleiben im Ziel/P-Profil vollständig erhalten.'})
 by.set(id,after)
}
const selected='f6d7386c-dda4-501d-84da-0c881362e724',broad='e3e8582a-976b-5f0f-b31b-3cf59a4fff24',lkMemory=['21066929-2b7f-5d31-924b-338677053238','7513bc49-807b-5bae-9a8e-1587ac2340a5']
const {collectCompositionProjectionRoleGoalIds,compileCompositionView}=await import(R+'/app/src/utils/authoring/compositionViewAuthoring.ts')
const {getSrsFilterTags}=await import(R+'/app/src/utils/srsTags.ts')
const cardPath=L+'/app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json', deck=read(cardPath), filterTags=getSrsFilterTags(by.get(selected).tags)
const cards=deck.cards.filter((c:any)=>!filterTags.length||(c.tags??[]).some((t:string)=>filterTags.includes(t)))
assert.deepEqual(cards.map((c:any)=>c.id),['chem_org_q1_001','chem_org_q1_002','chem_org_q1_003','chem_org_q1_004'])
const shared=read(S+'/CAS.eight-whole-views.author-inactive.json').operations,lab=read(Q+'/CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json').operations
const viewOps=[]
for(const file of ['de-de-gym-chemistry-gk.view.json','de-de-gym-sekii-chemistry-gk.view.json']){
 const before=lab.find((x:any)=>path.basename(x.targetPath)===file)?.afterWhole??shared.find((x:any)=>path.basename(x.beforePath)===file).afterWhole
 const rb=collectCompositionProjectionRoleGoalIds(before.rootNodes,by),after=structuredClone(before), shadows=[broad,...lkMemory]
 for(const id of shadows){assert(rb.targetGoalIds.has(id));assert(![...by.values()].some((g:any)=>(g.requires??[]).includes(id)),'No actual goal may require a hidden memory selection')}
 // Remove only explicit target overrides for these memory IDs, retaining all authored subtrees.
 const clean=(nodes:any[]):any[]=>nodes.flatMap(n=>{if(n.kind==='goalEntry'&&shadows.includes(n.goalId))return [];if(n.kind==='structure'){const children=clean(n.children??[]);return children.length?[{...n,children}]:[]}return[n]})
 after.rootNodes=clean(after.rootNodes)
 after.rootNodes.push({kind:'structure',id:before.viewId+'-bounded-organic-recall-20261016',label:'Lernkarten zu bereits erlernten Stoffklassen',children:[...shadows.map(goalId=>({kind:'goalEntry',goalId,projectionRole:'prerequisiteOnly'})),...(!rb.targetGoalIds.has(selected)?[{kind:'goalEntry',goalId:selected,projectionRole:'target'}]:[])]})
 const ra=collectCompositionProjectionRoleGoalIds(after.rootNodes,by)
 assert(ra.targetGoalIds.has(selected));for(const id of shadows){assert(!ra.targetGoalIds.has(id));assert(ra.prerequisiteOnlyGoalIds.has(id))}
 const removed=[...rb.targetGoalIds].filter(id=>!ra.targetGoalIds.has(id)),added=[...ra.targetGoalIds].filter(id=>!rb.targetGoalIds.has(id));assert.deepEqual(new Set(removed),new Set(shadows));assert(added.every(id=>id===selected))
 for(const origin of [...by.get(selected).requires,...cards.flatMap((c:any)=>(c.tags??[]).filter((t:string)=>t.startsWith('goal:')).map((t:string)=>t.slice(5)))])assert(ra.targetGoalIds.has(origin),'Actual existing card origin must remain target')
 const findings=compileCompositionView(after,{...land,goals:[...by.values()]}).findings.filter((x:any)=>x.severity==='error');assert.equal(findings.length,0,JSON.stringify(findings))
 viewOps.push({targetPath:'curricula/DE/Gymnasium/composition-views/chemie/'+file,beforeWhole:before,afterWhole:after,removedTargetIds:removed,addedTargetIds:added,allOrdinaryTargetIdsExact:true,cardOriginTargetsChecked:true,stockCompileErrors:findings})
}
fs.mkdirSync(O+'/input',{recursive:true})
const owner=read(E+'/chemie-current437-paired-nine-five-gate-owner-integration-technical-20261016-v1/OWNER-SELECTION.exact428-retained-plus-real-nine.json'),profiles=[]
for(const r of owner.P){const rel=r.reviewPath??r.filteredReviewPath;if(!rel)continue;const p=fs.existsSync(rel)?rel:L+'/'+rel;for(const line of fs.readFileSync(p,'utf8').trim().split('\n')){const row=JSON.parse(line);if([polar,ions].includes(row.goalId)){profiles.push({sourcePath:rel,sourceSha256:sha(p),wholeCurrentProfile:row});fs.writeFileSync(O+'/input/P.'+row.goalId+'.whole-current-independent.json',JSON.stringify(row,null,2)+'\n')}}}
assert.equal(profiles.length,2)
const result={role:'Inactive AUTHOR proposal, independent current scientific/context/Memory/scope reviews required',baseCanonicalSha256:sha(L+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),ordinaryGoalOperations:operations,wholeViewOperations:viewOps,wholePProfilesPreserved:profiles,unchangedSelectedMemoryGoal:by.get(selected),actualSelectedCards:cards,actualFilterTags:filterTags,allCanonicalBodiesExceptTwoRequiresExact:true,allCardsImagesTextsOperatorsExamsUnchanged:true,M437NecessityReferencesAlreadyIncludeSelectedUnit:true,knownOtherScopeFindingsRemainOpen:true,newScientificApproval:false,HumanApproval:false,HumanTrial:false,M7Claim:false}
const p=O+'/CAS.two-whole-ordinary-goals-and-two-generic-GK-views.author-inactive.json';assert(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({path:p,sha256:sha(p),ordinary:2,views:2,profiles:profiles.length,actualCards:cards.map((c:any)=>c.id),compilerErrors:0}))
