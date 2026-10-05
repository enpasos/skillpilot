// SPDX-License-Identifier: Apache-2.0
// Targeted independent candidate check. Writes only this new review directory.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { compositionViewExposesGoal } from '../../../../../../../app/src/utils/compositionViewRuntime'
const here=dirname(fileURLToPath(import.meta.url)),repo=resolve(here,'../../../../../../..'),au=resolve(here,'../biologie-ni-ten-source-hold-remediation-candidate-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const inputs=[resolve(repo,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),resolve(au,'canonical.existing-two-changes.inactive.candidate.json'),resolve(au,'nine-missing-performance.DEEN.goal-templates.candidate.json'),resolve(au,'four-prior-templates.referenced.candidate.json'),resolve(au,'two-memory-goals.DEEN.templates.candidate.json'),resolve(repo,'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json'),resolve(repo,'curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json')]
const active=read(inputs[0]),existing=read(inputs[1])
const ordinary=[...read(inputs[2]).goalTemplates,...read(inputs[3]).goalTemplatesCopiedWithoutSemanticChange]
const memory=read(inputs[4]).goalTemplates,templates=[...ordinary,...memory]
const ids=new Map<string,string>(templates.map((t:any)=>[t.candidateKey,'independent-candidate-only-'+t.candidateKey]))
assert.equal(ordinary.length,13);assert.equal(memory.length,2)
const temporary=structuredClone(existing)
for(const t of templates){assert.equal(t.id,null);temporary.goals.push({id:ids.get(t.candidateKey),title:t.title,titleEn:t.titleEn,description:t.description,descriptionEn:t.descriptionEn,contains:[],requires:[...t.requires,...t.requiresCandidateKeys.map((k:string)=>{assert(ids.has(k),k);return ids.get(k)})],type:t.type,tags:t.tags,weight:t.weight,applicability:t.applicability,...(t.nodeKind?{nodeKind:t.nodeKind}:{})})}
const root='e8d54127-d42e-51f5-bfa5-51d826069f95',orientation='2d451684-6e53-565e-a987-f362da919d2c'
// Hypothesis only: place under a new content supplement with orientation-only requires.
// This avoids inheriting unrelated cell/respiration prereqs from broad legacy clusters.
const supplement='independent-candidate-only-seki-order-kinship-variability-supplement'
temporary.goals.push({id:supplement,type:'cluster',title:'Ordnung, Verwandtschaft und Variabilität (Sek I)',titleEn:'Ordering, kinship and variability (lower secondary)',description:'Inaktive Platzierungshypothese für die unabhängig geprüften gewöhnlichen Vorlagen und ihre Memorybegleiter.',contains:[...ids.values()],requires:[orientation],tags:['GK','LK','canonical','SekI'],applicability:{jurisdiction:['DE-NI']},extendedData:{applicabilityMappingInheritance:'boundary'}})
temporary.goals.find((g:any)=>g.id===root).contains.push(supplement)
const native=(l:any)=>new Map<string,any>(prepareLandscapeEntries([l])[0].goals.map((g:any)=>[g.id,g]))
const strip=(l:any,id:string)=>id.startsWith(l.landscapeId+':')?id.slice(l.landscapeId.length+1):id
const closure=(l:any,n:Map<string,any>,id:string,seen=new Set<string>()):Set<string>=>{assert(n.has(id),id);if(seen.has(id))return seen;seen.add(id);for(const r of n.get(id).effectiveRequires??[])closure(l,n,strip(l,r),seen);return seen}
const path=(l:any,n:Map<string,any>,id:string,target:string,seen=new Set<string>()):string[]|null=>{if(id===target)return[id];if(seen.has(id))return null;seen.add(id);for(const r of n.get(id).effectiveRequires??[]){const p=path(l,n,strip(l,r),target,seen);if(p)return[id,...p]}return null}
const check=(l:any)=>{const canonical=normalizeCanonicalLandscape(l);const d=validateCanonicalLandscape(canonical);assert.deepEqual(d.filter(x=>x.severity==='error'),[]);const n=native(l),done=new Set<string>(),open=new Set<string>();const visit=(id:string)=>{assert(n.has(id),id);assert(!open.has(id),'native cycle at '+id);if(done.has(id))return;open.add(id);for(const r of n.get(id).effectiveRequires??[])visit(strip(l,r));open.delete(id);done.add(id)};for(const id of n.keys())visit(id);return {nodesChecked:done.size,canonicalErrorCount:0,canonicalWarnings:d.filter(x=>x.severity==='warning'),effectiveRequiresDAG:'PASS'}}
const activeCheck=check(active),existingCheck=check(existing),temporaryCheck=check(temporary)
const na=native(active),ne=native(existing),nt=native(temporary)
const dna='0daa79f6-8f61-5506-98f9-65db83062ba8',protein='475eebb4-4eb0-524f-b1ec-4a672bf856d2',pedigree='440854be-7f06-5678-91cb-ba8dcab56959',global='9f73b963-5fac-5a90-a993-d7b7c0cc8526'
assert(path(active,na,pedigree,dna));assert.equal(path(existing,ne,pedigree,dna),null);assert.equal(path(existing,ne,pedigree,protein),null)
assert(path(existing,ne,global,dna));assert(path(existing,ne,global,protein))
const goalPaths=templates.map((t:any)=>{const id=ids.get(t.candidateKey)!;assert.equal(path(temporary,nt,id,dna),null);assert.equal(path(temporary,nt,id,protein),null);return {candidateKey:t.candidateKey,idIsOnlyTemporary:true,gradeBand:t.gradeBand,nativeEffectiveRequires:nt.get(id).effectiveRequires,transitiveGoalIds:[...closure(temporary,nt,id)].filter(x=>x!==id).sort(),DNAPath:null,proteinPath:null}})
const currentNI=read(inputs[5]),currentSekI=read(inputs[6])
const compile=(view:any,l:any)=>{const c=compileCompositionView(view,normalizeCanonicalLandscape(l));assert.deepEqual(c.findings.filter(x=>x.severity==='error'),[]);return {viewId:view.viewId,errors:0,warnings:c.findings.filter(x=>x.severity==='warning')}}
const currentViewResults=[compile(currentNI,active),compile(currentSekI,active)]
const sample={viewId:'independent-ni-five-six-memory-placement-hypothesis',landscapeId:temporary.landscapeId,scope:{schoolForm:'Gymnasium',jurisdiction:'DE-NI',stage:'SekI'},rootNodes:[{kind:'structure',id:'independent-ni-five-six',label:'Jahrgänge 5/6 (inaktive Hypothese)',children:templates.filter((t:any)=>t.gradeBand==='5/6').map((t:any)=>({kind:'goalEntry',goalId:ids.get(t.candidateKey),projectionRole:'target'}))}]}
const sampleCompile=compile(sample,temporary),entries=prepareLandscapeEntries([temporary])
const visibility=memory.map((t:any)=>{const origin=ids.get(t.originCandidateKeys[0])!,mem=ids.get(t.candidateKey)!;assert(compositionViewExposesGoal(entries,sample,origin));assert(compositionViewExposesGoal(entries,sample,mem));const absent=structuredClone(sample);absent.rootNodes[0].children=absent.rootNodes[0].children.filter((x:any)=>x.goalId!==mem);assert(!compositionViewExposesGoal(entries,absent,mem));return {ordinaryCandidateKey:t.originCandidateKeys[0],memoryCandidateKey:t.candidateKey,deckId:t.deckId,ordinaryAndMemoryVisibleInSameInactiveView:true,missingMemoryNegativeWitness:'PASS',currentAuthoritativeVisibilityProven:false}})
const broadParent='6bfe8cec-df77-5284-a5f7-2480f1ebd9a7'
const broadLegacyPlacement=structuredClone(existing);const tree=ordinary.find((t:any)=>t.candidateKey==='selected_native_tree_species_knowledge');const treeId='independent-negative-tree';broadLegacyPlacement.goals.push({id:treeId,title:tree.title,description:tree.description,contains:[],requires:tree.requires,type:'atomic',tags:tree.tags});broadLegacyPlacement.goals.find((g:any)=>g.id===broadParent).contains.push(treeId)
const nb=native(broadLegacyPlacement);const inheritedUnneeded=[...closure(broadLegacyPlacement,nb,treeId)].filter(x=>!new Set(closure(temporary,nt,ids.get(tree.candidateKey)!)).has(x)&&x!==treeId)
const result={role:'independent_source_atomicity_memory_candidate_reviewer',status:'PASS_targeted_native_candidate_hypotheses',createdAtUTC:new Date().toISOString(),inputs:inputs.map(p=>({path:p.slice(repo.length+1),sha256:sha(p)})),nativeFunctions:['prepareLandscapeEntries','normalizeCanonicalLandscape','validateCanonicalLandscape','compileCompositionView','compositionViewExposesGoal'],active:activeCheck,existingTwoChanges:existingCheck,temporaryWith15TemplatesAnd1Supplement:temporaryCheck,allCandidatePaths:goalPaths,currentViewResults,inactiveFiveSixVisibilityHypothesis:{...sampleCompile,pairs:visibility},existing440DNAPathBefore:path(active,na,pedigree,dna),existing440DNAPathAfter:null,global9fDNAPathRetained:path(existing,ne,global,dna),global9fProteinPathRetained:path(existing,ne,global,protein),broadLegacyParentPlacementWarning:{parentGoalId:broadParent,actualInheritedExtraPrerequisiteIds:inheritedUnneeded,recommendation:'Do not put the narrow NI5/6 recognition repertoire under this broad legacy cluster without independently reviewing all inherited prerequisites.'},activeWrites:0,currentVisibilityScopesApproved:0,limits:['462-node model uses 15 temporary IDs and a provisional content supplement; final stable IDs/parent placement still require native recheck.','Current views are compiled as actual inputs; the inactive5/6 view is only a visibility hypothesis, not an adopted configured scope.','Technical no-DNA path does not prove scientific goal descriptions, source coverage, final-book D, P, V or M7.','No active ledger or source mapping changed.'],humanApproval:false}
writeFileSync(resolve(here,'native-independent.actual.receipt.json'),JSON.stringify(result,null,2)+'\n')
writeFileSync(resolve(here,'ni-five-six.inactive.visibility-hypothesis.view.json'),JSON.stringify(sample,null,2)+'\n')
console.log(JSON.stringify({activeNodes:activeCheck.nodesChecked,existingCandidateNodes:existingCheck.nodesChecked,temporaryPlacedNodes:temporaryCheck.nodesChecked,ordinaryTemplates:13,memoryTemplates:2,NIPathsToDNA:0,globalMolecularPathRetained:true,currentViewsCompiled:2,inactiveMemoryPairsVisible:2,negativeMemoryWitnessesPassed:2,broadLegacyParentExtraPrereqs:inheritedUnneeded.length,activeWrites:0}))
