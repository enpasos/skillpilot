// Read-only field-leased emitter. All filesystem writes are performed separately by apply_patch.
import {readFileSync,readdirSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import * as spec from './authoring-spec.mjs'
const dir=dirname(fileURLToPath(import.meta.url))
const repo=process.cwd()
const {ids,paths,base,landscapeId}=spec
if(!existsSync(resolve(repo,paths.canonical)))throw Error('Run from SkillPilot repo root.')
const sha=s=>'sha256:'+createHash('sha256').update(s).digest('hex')
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v)
const same=(a,b)=>stable(a)===stable(b)
const norm=v=>String(v??'').normalize('NFKC').replace(/\s+/gu,' ').trim()
const reviewFingerprint=(g,ruleVersion)=>sha(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
const cardFingerprint=c=>sha(stable({ruleVersion:'memory-card-review-v1',deckId:spec.deckId,cardId:c.id,front:norm(c.front),back:norm(c.back),category:norm(c.category),tags:[...(c.tags??[])].map(norm).sort()}))
const clone=v=>structuredClone(v)
const missing={state:'missing'}
const state=v=>v===undefined?missing:{state:'value',value:clone(v)}
const readText=p=>readFileSync(resolve(repo,p),'utf8')
const read=p=>p.endsWith('.jsonl')?readText(p).split(/\r?\n/u).filter(Boolean).map(x=>JSON.parse(x)):JSON.parse(readText(p))
function location(doc,path){
 let parent=doc
 for(let i=0;i<path.length-1;i++){const s=path[i];if(typeof s==='object'){const matches=parent.filter(r=>Object.entries(s).every(([k,v])=>r[k]===v));if(matches.length!==1)throw Error('Nonunique/missing selector '+JSON.stringify(path));parent=matches[0]}else parent=parent[s];if(parent===undefined)throw Error('Missing path '+JSON.stringify(path))}
 const last=path.at(-1);if(typeof last==='object'){if(!Array.isArray(parent))throw Error('Expected array');const found=parent.map((r,i)=>Object.entries(last).every(([k,v])=>r[k]===v)?i:-1).filter(i=>i>=0);if(found.length>1)throw Error('Duplicate selector');return {parent,key:found[0]??parent.length,value:found.length?parent[found[0]]:undefined,array:true}}
 return {parent,key:last,value:parent[last],array:Array.isArray(parent)}
}
function put(doc,path,next){const l=location(doc,path);if(next.state==='missing'){if(l.array){if(l.value!==undefined)l.parent.splice(l.key,1)}else delete l.parent[l.key]}else l.parent[l.key]=clone(next.value)}
const goalBook=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookModel.ts')))
const comp=await import(pathToFileURL(resolve(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')))
const canonical=await import(pathToFileURL(resolve(repo,'app/src/utils/authoring/canonicalAuthoring.ts')))
const mode=process.argv[2]??'--check'
const modes=['--capture-initial','--check','--emit-patch','--outputs-json']
if(!modes.includes(mode)||process.argv.length>3)throw Error('Use '+modes.join(' | '))
const planPath=resolve(dir,'field-leased-plan.json')
function capture(){
 if(existsSync(planPath))throw Error('Initial capture already exists; never silently rebase leases.')
 const docs=new Map(),ops=[]
 const doc=p=>{if(!docs.has(p))docs.set(p,p.endsWith('.ts')?readText(p):read(p));return docs.get(p)}
 const add=(p,path,after,reason)=>{const before=state(location(doc(p),path).value),next=state(after);if(same(before,next))return;ops.push({file:p,kind:'json-field',path,before,after:next,reason});put(doc(p),path,next)}
 const goal=id=>doc(paths.canonical).goals.find(g=>g.id===id)
 const field=(id,k,v,r)=>add(paths.canonical,['goals',{id},k],v,r)
 for(const [key,value] of Object.entries(spec.hydrogenAfter))field(ids.hydrogen,key,value,'Separate one-electron energy competence; Pauli consolidated at existing badb.')
 for(const [key,value] of Object.entries(spec.pauliAfter))field(ids.pauli,key,value,'One qualitative Pauli/shell interpretation; quantitative hydrogen-like energy is not its universal prerequisite.')
 field(ids.historicWell,'title','Unendlicher Potenzialtopf: Energien und Intervallwahrscheinlichkeiten','Historical ID retained as subject cluster with both historical components.')
 field(ids.historicWell,'titleEn','Infinite Potential Well: Energies and Interval Probabilities','Historical ID retained as subject cluster with both historical components.')
 field(ids.historicWell,'description','Dieser fachliche Cluster bündelt das Berechnen diskreter Energiewerte und normierter Intervallwahrscheinlichkeiten für ein Elektron im eindimensionalen Potenzialtopf mit unendlich hohen Wänden.','Full historical content preserved; now aggregation, not false atomic approval.')
 field(ids.historicWell,'descriptionEn','This subject cluster groups the calculation of discrete energy values and normalized interval probabilities for an electron in a one-dimensional potential well with infinitely high walls.','Full historical content preserved.')
 field(ids.historicWell,'type','cluster','Two independent assessed performances.')
 field(ids.historicWell,'contains',[ids.energy,ids.probability],'No mastery-copy provenance.')
 field(ids.historicWell,'requires',[],'Atomic prerequisites live on the two children; no inherited cluster prerequisite.')
 field(ids.historicWell,'tags',['GK','LK'],'Energy is also supported by BY basic course; scope-specific views control target semantics.')
 field(ids.historicWell,'weight',2,'Two unique ordinary content atoms, each weight one.')
 field(ids.historicWell,'extendedData',{...(goal(ids.historicWell).extendedData??{}),applicabilityMappingInheritance:'boundary'},'Historic mixed mappings do not become source evidence for both children.')
 for(const g of spec.newGoals)add(paths.canonical,['goals',{id:g.id}],g,'New independent atom. No splitFromCanonicalGoalId, no exact old-ID child mapping, no reused image.')
 const assess=goal(ids.quantumAssessment)
 field(ids.quantumAssessment,'requires',assess.requires.map(id=>id===ids.historicWell?ids.energy:id),'Actual task1 computes E1/E2; no interval integration is assessed.')
 add(paths.canonical,['goals',{id:ids.quantumAssessment},'examData','coveredGoalIds'],assess.examData.coveredGoalIds.map(id=>id===ids.historicWell?ids.energy:id),'Only energy child has concrete support in existing task1; no assessed fanout.')
 // Directly overlapping density wording is corrected without adding a new assessment routine.
 add(paths.canonical,['goals',{id:ids.quantumAssessment},'examData','taskContent'],assess.examData.taskContent.replace('für den Grundzustand ist die Aufenthaltswahrscheinlichkeit in der Mitte des Kastens am größten','für den Grundzustand ist die Wahrscheinlichkeitsdichte in der Mitte des Kastens am größten'),'Density, not single-point probability, has its maximum at the centre.')
 add(paths.canonical,['goals',{id:ids.quantumAssessment},'examData','solutionContent'],assess.examData.solutionContent.replace('Ihr Quadrat beschreibt, mit welcher Wahrscheinlichkeit das Quantenobjekt in einem Raumabschnitt gefunden wird.','Ihr Betragsquadrat ist eine Wahrscheinlichkeitsdichte. Die Fläche unter dieser Dichte über einem Raumabschnitt gibt dessen Nachweiswahrscheinlichkeit an.'),'Correct density-versus-interval distinction; this remains a qualitative task, not an integration assessment.')
 for(const mc of spec.mappingChanges){
  const p=paths[mc.file],m=doc(p),oldRow=m.mappings.find(r=>r.legacyGoalId===mc.source&&r.canonicalGoalId===mc.old)
  if(!oldRow)throw Error('Mapping missing '+mc.source)
  const nextRows=mc.next.map(id=>({...oldRow,canonicalGoalId:id,matchType:'partial'}))
  add(p,['mappings',{legacyGoalId:mc.source,canonicalGoalId:mc.old}],undefined,mc.reason)
  for(const row of nextRows)add(p,['mappings',{legacyGoalId:mc.source,canonicalGoalId:row.canonicalGoalId}],row,mc.reason)
  const d=m.decisions.find(x=>x.sourceGoalId===mc.source||x.id===mc.source||x.decisionId===mc.source)
  if(!d)throw Error('Decision missing '+mc.source)
  const selector=d.sourceGoalId?{sourceGoalId:mc.source}:d.id?{id:mc.source}:{decisionId:mc.source}
  add(p,['decisions',selector,'canonicalGoalIds'],[...new Set(d.canonicalGoalIds.flatMap(id=>id===mc.old?mc.next:[id]))],mc.reason)
  add(p,['decisions',selector,'rationale'],mc.reason,mc.reason)
  add(p,['decisions',selector,'reviewedAt'],'2026-09-07','Fresh local original-clause check.')
  add(p,['decisions',selector,'reviewer'],'codex-physics-b035-quantum-consolidation-v1','AI authoring review, not a claim of human approval.')
 }
 for(const [key,before,after] of spec.generatorReplacements){
  const p=paths[key],text=doc(p)
  if(text.split(before).length!==2)throw Error('Generator snippet drift '+p)
  ops.push({file:p,kind:'text-span',before,after,reason:'Keep exact source-to-canonical generator clause aligned with reviewed mapping.'})
  docs.set(p,text.replace(before,after))
 }
 // Scope decisions are explicit; applicability tags alone do not control subtree target inheritance.
 const supported=(scope,child)=>{const j=scope.jurisdiction,lk=scope.courseProfile==='LK';return child===ids.probability?lk&&(!j||j==='DE-HE'):!j||j==='DE-BY'||(lk&&['DE-HE','DE-BW'].includes(j))}
 const views=readdirSync(resolve(repo,base+'composition-views/physik')).filter(f=>f.endsWith('.json')).map(f=>base+'composition-views/physik/'+f)
 const atlas='app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json'
 for(const p of [...views,atlas]){
  const v=doc(p),changes=[]
  function visit(n,path){
   if(n.kind==='goalEntry'&&n.goalId===ids.historicWell)changes.push({path,n})
   if(n.children)n.children.forEach((c,i)=>visit(c,[...path,'children',i]))
  }
  v.rootNodes.forEach((n,i)=>visit(n,['rootNodes',i]))
  for(const x of changes){
   if(p===atlas)add(p,[...x.path,'kind'],'canonicalSubtree','National atlas retains full historical cluster and both source-backed atoms.')
   else add(p,[...x.path,'goalId'],ids.energy,'BW/BY explicit old mixed target becomes only the source-supported energy atom.')
  }
  if(p!==atlas){
   const role=comp.collectCompositionProjectionRoleGoalIds(v.rootNodes,new Map(doc(paths.canonical).goals.map(g=>[g.id,g])))
   const suppress=[ids.energy,ids.probability].filter(id=>role.targetGoalIds.has(id)&&!supported(v.scope,id))
   for(const id of suppress)add(p,['rootNodes',{kind:'goalEntry',goalId:id}],{kind:'goalEntry',goalId:id,projectionRole:'prerequisiteOnly'},'No automatic target inheritance for a new competence without a checked state/course clause. Not a finding that the state could never require it.')
   // BW Pauli clause newly targets the existing qualitative atom; preserve its already existing source-specific scope.
   if(v.scope?.jurisdiction==='DE-BW'&&v.scope?.courseProfile==='LK'){
    const rr=comp.collectCompositionProjectionRoleGoalIds(v.rootNodes,new Map(doc(paths.canonical).goals.map(g=>[g.id,g])))
    if(!rr.targetGoalIds.has(ids.pauli))add(p,['rootNodes',{kind:'goalEntry',goalId:ids.pauli}],{kind:'goalEntry',goalId:ids.pauli},'BW 3.6.6(13) partial Pauli overview now points to the existing correct atom.')
   }
  }
 }
 // Active A/M rows do not retain a now non-leaf goal. Their complete former records remain in these leases.
 const date='2026-09-07',reviewer='codex-physics-b035-quantum-consolidation-v1'
 for(const p of [paths.atomicity,paths.memory])add(p,[{goalId:ids.historicWell}],undefined,'Historical compound is a cluster; active ordinary-atomic review removed, prior record preserved in the immutable before lease.')
 for(const id of [ids.hydrogen,ids.pauli,ids.energy,ids.probability]){
  const g=goal(id),memory=[ids.energy,ids.probability].includes(id)
  const common={schemaVersion:1,reviewId:'canonical-physics-full',landscapeId,goalId:id,reviewedAt:date,reviewer}
  add(paths.atomicity,[{goalId:id}],{...common,ruleVersion:'semantic-atomicity-v1',fingerprint:reviewFingerprint(g,'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reason:spec.reviewReasons[id].atomicity,suggestedSplit:[]},'Individual semantic atomicity review of final candidate text, not hash-only renewal.')
  add(paths.memory,[{goalId:id}],{...common,ruleVersion:'memory-card-review-v1',fingerprint:reviewFingerprint(g,'memory-card-review-v1'),status:memory?'memory_required':'no_memory_needed',memoryUseful:memory,...(memory?{memoryGoalIds:[ids.memory],deckIds:[spec.deckId]}:{}),reason:spec.reviewReasons[id].memory},'Individual memory suitability decision.')
 }
 for(const [cardId,change] of Object.entries(spec.cardChanges)){
  const old=clone(doc(paths.deck).cards.find(c=>c.id===cardId)),after=change?{...old,...change}:undefined
  for(const p of [paths.deck,paths.publicDeck]){
   if(change){for(const [k,v] of Object.entries(change))add(p,['cards',{id:cardId},k],v,spec.cardReasons[cardId])}
   else add(p,['cards',{id:cardId}],undefined,spec.cardReasons[cardId])
  }
  const prev=doc(paths.cards).find(r=>r.deckId===spec.deckId&&r.cardId===cardId)
  if(!prev)throw Error('Missing card ledger row')
  const origin=cardId==='physics_q4_c04'?ids.energy:ids.probability
  add(paths.cards,[{deckId:spec.deckId,cardId}],{...prev,fingerprint:after?cardFingerprint(after):prev.fingerprint,status:after?'kept':'remove',necessary:!!after,originGoalIds:after?[origin]:[],reviewedAt:date,reviewer,reason:spec.cardReasons[cardId]},spec.cardReasons[cardId])
 }
 const kinds=doc(paths.kinds),kindIds=[ids.hydrogen,ids.pauli,ids.historicWell,ids.energy,ids.probability,ids.quantumAssessment]
 for(const id of kindIds){
  const old=kinds.decisions.find(d=>d.goalId===id),kind=id===ids.historicWell?'curricularArea':id===ids.quantumAssessment?'practiceAssessment':'curricularAtomic'
  const basis=id===ids.historicWell?'reviewed-current-structural-split-curricular-area':id===ids.quantumAssessment?'reviewed-current-post-split-practice-assessment':'reviewed-current-semantic-recheck-curricular-atomic'
  add(paths.kinds,['decisions',{goalId:id}],{goalId:id,sourceFingerprint:goalBook.fingerprintSemanticKindSourceGoal(goal(id)),semanticKind:kind,decisionStatus:'authoritative',decisionBasis:basis},'Native K enum and actual candidate semantic fingerprint; acceptance occurs only if root applies this authoring package.')
 }
 for(const [k,delta] of [['curricularAtomic',1],['curricularArea',1],['total',2]])add(paths.kinds,['counts',k],kinds.counts[k]+delta,'Two new atoms and one retained ID converted from atom to area.')
 const manifest='app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
 add(manifest,['expectedCurricularAtomicGoalCount'],doc(manifest).expectedCurricularAtomicGoalCount+1,'Net one additional ordinary content atom in national atlas.')
 return {schemaVersion:1,packageId:'physics100-quantum-consolidation-v1',status:'authored_candidate_not_applied',capturedAt:new Date().toISOString(),reviewer:{agent:'physics_b043_blind_b',provider:'unknown',model:'unknown',modelVersion:'unknown'},ids,sourceBindings:spec.originalSources.map(x=>({...x,sha256:sha(readFileSync(resolve(repo,x.path)))})),operations:ops,positiveUnderstandingEvidence:spec.evidence,notAuthorized:['D/P registration','old blind-review changes','image generation/import','runtime changes','old-ID child mastery copying'],preservedAssessment:{id:ids.capstone,reason:'Generic capstone text cannot establish either new child as individually assessed; historic cluster reference retained, no assessed fanout.'}}
}
let plan
if(mode==='--capture-initial'){plan=capture();await new Promise(done=>process.stdout.write(JSON.stringify(plan,null,2)+'\n',done));process.exit(0)}
plan=read(planPath)
const current=new Map(),candidate=new Map(),originalBytes=new Map()
for(const s of plan.sourceBindings)if(sha(readFileSync(resolve(repo,s.path)))!==s.sha256)throw Error('Original source changed: '+s.path)
for(const op of plan.operations){
 if(!candidate.has(op.file)){const bytes=readText(op.file);originalBytes.set(op.file,bytes);const data=op.kind==='text-span'?bytes:read(op.file);current.set(op.file,clone(data));candidate.set(op.file,clone(data))}
 let data=candidate.get(op.file)
 if(op.kind==='text-span'){
  if(data.split(op.before).length!==2)throw Error('Leased text span changed: '+op.file)
  candidate.set(op.file,data.replace(op.before,op.after))
 }else{
  const actual=state(location(data,op.path).value)
  if(!same(actual,op.before))throw Error('Leased field changed: '+op.file+' '+JSON.stringify(op.path))
  put(data,op.path,op.after)
 }
}
const get=p=>candidate.has(p)?candidate.get(p):read(p)
const c=get(paths.canonical),byId=new Map(c.goals.map(g=>[g.id,g]))
const math=read(base+'canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const universeById=new Map([...math.goals,...c.goals].map(g=>[g.id,g]))
if(byId.size!==c.goals.length)throw Error('Duplicate canonical goal IDs')
for(const edge of ['requires','contains']){const done=new Set(),active=new Set();function visit(id){if(active.has(id))throw Error('Cycle '+edge+' '+id);if(done.has(id))return;const g=universeById.get(id);if(!g)throw Error('Missing goal '+id);active.add(id);for(const ch of g[edge]??[])visit(ch);active.delete(id);done.add(id)}for(const id of byId.keys())visit(id)}
for(const id of [ids.energy,ids.probability]){const g=byId.get(id);if(g.contains.length||g.extendedData?.splitFromCanonicalGoalId)throw Error('Child not independent');if(g.resourceLinks?.length)throw Error('Unexpected copied image')}
for(const p of [paths.he,paths.bw,paths.by])for(const row of get(p).mappings)if([ids.energy,ids.probability].includes(row.canonicalGoalId)&&row.matchType!=='partial')throw Error('New source mapping must be partial')
for(const p of [paths.atomicity,paths.memory]){
 const rows=get(p);if(rows.some(r=>r.goalId===ids.historicWell))throw Error('Cluster remains active A/M')
 for(const id of [ids.hydrogen,ids.pauli,ids.energy,ids.probability]){
  const rowsFor=rows.filter(r=>r.goalId===id);if(rowsFor.length!==1)throw Error('A/M coverage '+id)
  const r=rowsFor[0],rule=p===paths.atomicity?'semantic-atomicity-v1':'memory-card-review-v1'
  if(r.schemaVersion!==1||r.reviewId!=='canonical-physics-full'||r.ruleVersion!==rule||r.landscapeId!==landscapeId||!r.reason?.trim()||r.fingerprint!==reviewFingerprint(byId.get(id),rule))throw Error('A/M native record/fingerprint '+id)
  if(p===paths.atomicity&&(r.status!=='atomic'||r.semanticAtomic!==true||!Array.isArray(r.suggestedSplit)))throw Error('A shape '+id)
  if(p===paths.memory){if(r.status==='memory_required'){if(!r.memoryUseful||!r.memoryGoalIds.includes(ids.memory)||!r.deckIds.includes(spec.deckId))throw Error('M linkage')}else if(r.status!=='no_memory_needed'||r.memoryUseful!==false||(r.deckIds??[]).length||(r.memoryGoalIds??[]).length)throw Error('M status')}
 }
}
for(const id of ['physics_q4_c03','physics_q4_c04','physics_q4_c06']){
 const card=get(paths.deck).cards.find(c=>c.id===id),r=get(paths.cards).find(r=>r.deckId===spec.deckId&&r.cardId===id)
 if(id==='physics_q4_c03'){if(card||r.status!=='remove'||r.necessary!==false||r.originGoalIds.length)throw Error('Removed card origin')}
 else if(!card||r.status!=='kept'||r.necessary!==true||r.originGoalIds.length!==1||r.fingerprint!==cardFingerprint(card)||!card.tags.includes('goal:'+r.originGoalIds[0]))throw Error('Card linkage/fingerprint '+id)
}
if(!same(get(paths.deck),get(paths.publicDeck)))throw Error('Public deck differs from source')
const req=createRequire(resolve(repo,'app/package.json'));const Ajv=req('ajv/dist/2020.js').default,addFormats=req('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const validateK=ajv.compile(read('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'))
if(!validateK(get(paths.kinds)))throw Error('Native K schema '+JSON.stringify(validateK.errors))
for(const id of [ids.hydrogen,ids.pauli,ids.historicWell,ids.energy,ids.probability,ids.quantumAssessment]){
 const d=get(paths.kinds).decisions.find(d=>d.goalId===id);if(d.sourceFingerprint!==goalBook.fingerprintSemanticKindSourceGoal(byId.get(id)))throw Error('K fingerprint '+id)
}
const viewResults=[]
const viewPaths=readdirSync(resolve(repo,base+'composition-views/physik')).filter(f=>f.endsWith('.json')).map(f=>base+'composition-views/physik/'+f)
const normalized=canonical.normalizeCanonicalLandscape({...c,goals:c.goals.map(g=>({...g,semanticKind:get(paths.kinds).decisions.find(d=>d.goalId===g.id)?.semanticKind}))})
for(const p of [...viewPaths,'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json']){
 const universe=canonical.normalizeCanonicalLandscape({...c,goals:[...math.goals,...normalized.goals]})
 const landscapeUniverse=new Map([[c.landscapeId,normalized],[math.landscapeId,canonical.normalizeCanonicalLandscape(math)]])
 const view=get(p),result=comp.compileCompositionView(comp.normalizeCompositionView(view),normalized,universe,landscapeUniverse)
 const errors=result.findings.filter(f=>f.severity==='error')
 // Existing unrelated view defects are reported separately, never silently fixed.
 const touchedErrors=errors.filter(f=>[ids.energy,ids.probability,ids.historicWell,ids.pauli].includes(f.goalId))
 if(touchedErrors.length)throw Error('Affected view compilation '+p+' '+JSON.stringify(touchedErrors))
 const roles=comp.collectCompositionProjectionRoleGoalIds(view.rootNodes,byId)
 if(p.includes('composition-views/physik')){
  const j=view.scope.jurisdiction,lk=view.scope.courseProfile==='LK'
  if(roles.targetGoalIds.has(ids.probability)&&!(lk&&(!j||j==='DE-HE')))throw Error('Probability target leak '+p)
  if(roles.targetGoalIds.has(ids.energy)&&!(!j||j==='DE-BY'||(lk&&['DE-BW','DE-HE'].includes(j))))throw Error('Energy target leak '+p)
 }
 if(roles.targetGoalIds.has(ids.energy)||roles.targetGoalIds.has(ids.probability))viewResults.push({file:p,energy:roles.targetGoalIds.has(ids.energy),probability:roles.targetGoalIds.has(ids.probability),errors:errors.length})
}
const outputEntries=[...candidate].map(([file,data])=>({file,beforeSha256:sha(originalBytes.get(file)),text:typeof data==='string'?data:file.endsWith('.jsonl')?data.map(r=>JSON.stringify(r)).join('\n')+'\n':JSON.stringify(data,null,2)+'\n'}))
const summary={status:'PASS',applied:false,leasedOperations:plan.operations.length,outputFiles:outputEntries.length,newGoalIds:{energy:ids.energy,probability:ids.probability},checks:['All individual field/text leases match current files','Contains/requires DAG and all references','Affected A/M native shape, semantic decisions and current fingerprints','Card origin/fingerprint conditions; one remove/two kept; canonical/public mirror','Full native K JSON Schema plus changed-goal native fingerprints','Composition target leakage guards and affected compiler diagnostics','No copied new-child image or splitFromCanonicalGoalId; new source maps partial','Original HE/BW/BY file hashes unchanged'],scopeResults:viewResults,limitations:['No D/P review or registration; images not generated/imported','Full global A/M/M6 checks must run after serialized root application','Generic capstone is not a concrete interval-integration assessment','Existing hydrogen image still contains Pauli; fresh narrow image review/repair remains outside this emitter'],outputs:outputEntries.map(({text,...x})=>({...x,afterSha256:sha(text)}))}
if(mode==='--check')console.log(JSON.stringify(summary,null,2))
if(mode==='--outputs-json')console.log(JSON.stringify({summary,outputs:outputEntries}))
if(mode==='--emit-patch'){
 const lines=['*** Begin Patch']
 for(const {file,text} of outputEntries){const before=originalBytes.get(file);if(before===text)continue;lines.push('*** Update File: '+file,'@@',...before.replace(/\n$/u,'').split('\n').map(x=>'-'+x),...text.replace(/\n$/u,'').split('\n').map(x=>'+'+x))}
 lines.push('*** End Patch');process.stdout.write(lines.join('\n')+'\n')
}
