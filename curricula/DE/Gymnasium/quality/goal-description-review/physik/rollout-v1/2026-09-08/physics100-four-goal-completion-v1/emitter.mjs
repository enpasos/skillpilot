// Read-only field-leased emitter. All filesystem writes are performed separately by apply_patch.
import {readFileSync,readdirSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {spawnSync} from 'node:child_process'
import * as spec from './authoring-spec.mjs'
import {evidence} from '../../2026-09-06/batch-034-next-unresolved-20-v1/physics100-four-goal-consolidation-v1/evidence.mjs'
import {assessmentGoals,terminalClusterId} from './assessment-spec.mjs'
import {additionalAssessmentGoals} from './additional-assessment-spec.mjs'
import {switchAssessmentAfter} from './switch-assessment-spec.mjs'
const tasks=[...assessmentGoals,...additionalAssessmentGoals]
const taskIds=tasks.map(g=>g.id)
const dir=dirname(fileURLToPath(import.meta.url))
const repo=process.cwd()
const {ids,paths,base,landscapeId}=spec
if(!existsSync(resolve(repo,paths.canonical)))throw Error('Run from SkillPilot repo root.')
const sha=s=>'sha256:'+createHash('sha256').update(s).digest('hex')
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v)
const same=(a,b)=>stable(a)===stable(b)
const norm=v=>String(v??'').normalize('NFKC').replace(/\s+/gu,' ').trim()
const reviewFingerprint=(g,ruleVersion)=>sha(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
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
const {repairHessePhysicsTree}=await import(pathToFileURL(resolve(repo,'app/scripts/lib/hessePhysicsTreePlacements.ts')))
const mode=process.argv[2]??'--check'
const modes=['--capture-initial','--capture-patch','--check','--emit-patch','--outputs-json']
if(!modes.includes(mode)||process.argv.length>3)throw Error('Use '+modes.join(' | '))
const planPath=resolve(dir,'field-leased-plan.json')

const historicIds=spec.clusters.map(x=>x.id)
const newIds=spec.newGoals.map(g=>g.id)
const allNewIds=[...newIds,...taskIds]
const targetCandidates=[...allNewIds,ids.switchAssessment]
const changedAtomIds=[...newIds,ids.amplifier]
const affectedIds=[...historicIds,...newIds,ids.amplifier,ids.lifecycle,ids.energy,ids.comparison,ids.risk,ids.evaluation,ids.qvalue,ids.alphaTunnel,ids.nuclearAssessment,ids.switchAssessment,ids.solidParent,terminalClusterId,...taskIds]
const math=read(base+'canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const viewPaths=readdirSync(resolve(repo,base+'composition-views/physik')).filter(f=>f.endsWith('.json')).map(f=>base+'composition-views/physik/'+f)
const atlas='app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json'
function compile(c,v){const kinds=new Map(read(paths.kinds).decisions.map(d=>[d.goalId,d.semanticKind]));const decorated={...c,goals:c.goals.map(g=>({...g,semanticKind:historicIds.includes(g.id)&&g.type==='cluster'?'curricularArea':kinds.get(g.id)??(newIds.includes(g.id)?'curricularAtomic':taskIds.includes(g.id)?'practiceAssessment':undefined)}))};const n=canonical.normalizeCanonicalLandscape(decorated),m=canonical.normalizeCanonicalLandscape(math);return comp.compileCompositionView(comp.normalizeCompositionView(v),n,canonical.normalizeCanonicalLandscape({...decorated,goals:[...math.goals,...decorated.goals]}),new Map([[c.landscapeId,n],[math.landscapeId,m]]))}
function rendered(result){const counts=new Map();const visit=n=>{if(n.sourceGoalId)counts.set(n.sourceGoalId,(counts.get(n.sourceGoalId)??0)+1);n.children?.forEach(visit)};result.compiledRootNodes.forEach(visit);return counts}
function sourceSupported(scope,id,isAtlas=false){
 if(isAtlas)return true
 const task=tasks.find(g=>g.id===id)
 if(task)return task.requires[0]===ids.amplifier?scope.stage!=='SekI'&&scope.courseProfile==='LK'&&(!scope.jurisdiction||scope.jurisdiction==='DE-HE'):sourceSupported(scope,task.requires[0],false)
 if(id===ids.switchAssessment)return sourceSupported(scope,ids.switch,false)
 if(id===ids.reactor)return !scope.jurisdiction||scope.jurisdiction==='DE-BY'
 const j=scope.jurisdiction,upper=scope.stage!=='SekI',lower=scope.stage!=='SekII',lk=scope.courseProfile==='LK'
 if([ids.audio,ids.multiplex].includes(id))return upper&&lk&&(!j||j==='DE-BY')
 if([ids.elements,ids.endstage].includes(id))return upper&&!lk&&(!j||j==='DE-BY')
 if(id===ids.switch)return !j||(j==='DE-BY'&&lower)||(['DE-HE','DE-RP'].includes(j)&&upper)
 if(id===ids.flipflop)return upper&&(!j||j==='DE-HE')
 return false
}
function capture(){
 if(existsSync(planPath))throw Error('Initial capture already exists; never silently rebase leases.')
 const docs=new Map(),ops=[]
 const doc=p=>{if(!docs.has(p))docs.set(p,p.endsWith('.ts')?readText(p):read(p));return docs.get(p)}
 const add=(p,path,after,reason)=>{const before=state(location(doc(p),path).value),next=state(after);if(same(before,next))return;ops.push({file:p,kind:'json-field',path,before,after:next,reason});put(doc(p),path,next)}
 const span=(p,before,after,reason)=>{const t=doc(p);if(t.split(before).length!==2)throw Error('Nonunique generator seam '+p+' '+before);ops.push({file:p,kind:'text-span',before,after,reason});docs.set(p,t.replace(before,after))}
 const goal=id=>doc(paths.canonical).goals.find(g=>g.id===id)
 const field=(id,k,v,r)=>add(paths.canonical,['goals',{id},k],v,r)
 const beforeCanonical=clone(doc(paths.canonical)),beforeViews=new Map([...viewPaths,atlas].map(p=>[p,clone(doc(p))]))
 for(const g of [...spec.newGoals,...tasks])add(paths.canonical,['goals',{id:g.id}],g,'New independent assessable competence, no old-ID provenance or copied image.')
 field(terminalClusterId,'contains',[...goal(terminalClusterId).contains,...taskIds],'Seven concrete material-complete assessment endpoints; no generic coverage fanout.')
 field(terminalClusterId,'weight',goal(terminalClusterId).contains.length,'Actual terminal child count after scoped additions.')
 for(const cluster of spec.clusters){
  for(const [k,v] of Object.entries(cluster))if(k!=='id')field(cluster.id,k,v,'Full historical meaning remains at stable ID as a subject cluster.')
  field(cluster.id,'type','cluster','Not an atomicity keep: the historical ID aggregates separately assessed components.')
  field(cluster.id,'requires',[],'Dependencies are specific atomic requirements, not inherited cluster obligations.')
  field(cluster.id,'weight',cluster.contains.length,'Count distinct child atoms.')
  field(cluster.id,'extendedData',{...(goal(cluster.id).extendedData??{}),applicabilityMappingInheritance:'boundary'},'Old broad source mappings must not turn into evidence for every child.')
 }
 for(const [k,v] of Object.entries(spec.amplifierAfter))field(ids.amplifier,k,v,'Existing amplifier competence reused; HE demonstration/student option retained; no switch/flipflop duplicate.')
 // Reused amplifier has one canonical parent. Reused nuclear atoms retain their established canonical parents.
 field(ids.solidParent,'contains',goal(ids.solidParent).contains.filter(x=>x!==ids.amplifier),'Amplifier now appears once inside the historical transistor subject cluster.')
 field(ids.risk,'requires',goal(ids.risk).requires.filter(x=>x!==ids.nuclear),'Radiation-risk judgment needs radiation foundations, not the containing nuclear/safety cluster.')
 field(ids.evaluation,'requires',[ids.comparison,ids.energy,...goal(ids.evaluation).requires.filter(x=>x!==ids.nuclear)],'Concrete reaction and energy bases replace the containing cluster; no self-dependency through contains.')
 field(ids.qvalue,'requires',goal(ids.qvalue).requires.flatMap(x=>x===ids.nuclear?[ids.comparison,ids.energy]:[x]),'Q-value calculations need reaction and energy interpretation, not radiation-risk mastery.')
 field(ids.alphaTunnel,'requires',goal(ids.alphaTunnel).requires.map(x=>x===ids.nuclear?ids.energy:x),'Alpha tunnelling needs alpha energy background, not reactor/safety competencies.')
 for(const [id,old,next] of [[ids.switchAssessment,ids.transistor,[ids.switch]],[ids.nuclearAssessment,ids.nuclear,[ids.comparison,ids.energy]]]){
  field(id,'requires',goal(id).requires.flatMap(x=>x===old?next:[x]),id===ids.switchAssessment?'Actual three tasks assess switching only; no flipflop or amplifier fanout.':'Actual task1 asks comparison and energy origin; tasks2/3 retain existing criteria-based evaluation.')
  add(paths.canonical,['goals',{id},'examData','coveredGoalIds'],goal(id).examData.coveredGoalIds.flatMap(x=>x===old?next:[x]),'Only the concretely inspected assessment products are remapped.')
 }
 for(const [k,v] of Object.entries(switchAssessmentAfter))field(ids.switchAssessment,k,v,'Complete supplied circuit, exact hands-on NTG branch and non-compensable essential evidence within existing scoring structure.')
 const oldNuclearSolution=goal(ids.nuclearAssessment).examData.solutionContent
 const energySentences='Bei der Spaltung zerfällt ein schwerer Kern in leichtere Kerne, Neutronen und Energie; freigesetzte Neutronen können weitere Spaltungen auslösen. Bei der Fusion verbinden sich leichte Kerne zu einem schwereren Kern. In beiden Fällen wird Bindungsenergie frei.'
 if(!oldNuclearSolution.includes(energySentences))throw Error('Inspected nuclear solution drift')
 add(paths.canonical,['goals',{id:ids.nuclearAssessment},'examData','solutionContent'],oldNuclearSolution.replace(energySentences,'Bei einer energiefreisetzenden Spaltung entstehen aus einem schweren Kern leichtere Kerne und meist freie Neutronen; diese können weitere Spaltungen auslösen. Bei einer energiefreisetzenden Fusion entstehen aus leichten Kernen stärker gebundene Produkte, je nach Reaktion auch freie Teilchen. Die Ruhemassensumme aller Produkte ist jeweils kleiner als die der Ausgangsteilchen; die Differenz entspricht der frei werdenden Energie.'),'Makes the already asked energy-origin assessment explicitly support rest-mass sums without asserting every fission/fusion is exothermic or omitting possible fusion neutrons.')
 // Add only checked jurisdiction applicability; never let tags alone decide target roles.
 for(const [id,added] of [[ids.energy,['DE-HE','DE-RP']],[ids.lifecycle,['DE-BY']]]){
  const jurisdictions=[...new Set([...(goal(id).applicability?.jurisdiction??[]),...added])].sort()
  add(paths.canonical,['goals',{id},'applicability','jurisdiction'],jurisdictions,'Additional direct original-clause support for an existing unchanged competence.')
 }
 field(ids.lifecycle,'tags',[...new Set(['GK',...goal(ids.lifecycle).tags])],'HH basic-course and BY GA-ASTRO support qualitative life cycles; not a forecast upgrade.')
 for(const mc of spec.mappingChanges){
  const p=paths[mc.file],m=doc(p),old=m.mappings.find(x=>x.legacyGoalId===mc.source&&x.canonicalGoalId===mc.old)
  if(!old)throw Error('Missing inspected source component '+mc.source+' '+mc.old)
  add(p,['mappings',{legacyGoalId:mc.source,canonicalGoalId:mc.old}],undefined,mc.reason)
  for(const id of mc.next)if(!m.mappings.some(x=>x.legacyGoalId===mc.source&&x.canonicalGoalId===id))add(p,['mappings',{legacyGoalId:mc.source,canonicalGoalId:id}],{...old,canonicalGoalId:id,matchType:'partial'},mc.reason)
  const dec=m.decisions.find(x=>x.sourceGoalId===mc.source);if(!dec)throw Error('Decision not found')
  add(p,['decisions',{sourceGoalId:mc.source},'canonicalGoalIds'],[...new Set(dec.canonicalGoalIds.flatMap(x=>x===mc.old?mc.next:[x]))],mc.reason)
 }
 for(const x of spec.mappingAdditions){
  const p=paths[x.file],m=doc(p),row=m.mappings.find(r=>r.legacyGoalId===x.source),dec=m.decisions.find(r=>r.sourceGoalId===x.source)
  if(!row||!dec)throw Error('Missing source addition anchor')
  add(p,['mappings',{legacyGoalId:x.source,canonicalGoalId:x.id}],{...row,canonicalGoalId:x.id,matchType:'partial'},x.reason)
  add(p,['decisions',{sourceGoalId:x.source},'canonicalGoalIds'],[...new Set([...dec.canonicalGoalIds,x.id])],x.reason)
 }
 const groups=new Map()
 for(const x of [...spec.mappingChanges,...spec.mappingAdditions]){const k=x.file+':'+x.source;if(!groups.has(k))groups.set(k,{file:x.file,source:x.source,reasons:[]});groups.get(k).reasons.push(x.reason)}
 for(const {file,source,reasons} of groups.values())for(const [k,v] of Object.entries({rationale:reasons.join(' '),reviewedAt:'2026-09-08',reviewer:'codex-physics-b034-informed-implementation-a-20260908'}))add(paths[file],['decisions',{sourceGoalId:source},k],v,'Current individual original-clause adjudication, not a human or coverage approval.')
 // Small replay helper applies reviewed source components after older generator adjudications.
 const helperPath='app/scripts/physicsB034ConsolidationMappings.ts'
 if(existsSync(resolve(repo,helperPath)))throw Error('New helper already exists; no overwrite')
 const replay=[...groups.values()].map(x=>({source:x.source,canonicalGoalIds:doc(paths[x.file]).decisions.find(d=>d.sourceGoalId===x.source).canonicalGoalIds,mappings:doc(paths[x.file]).mappings.filter(r=>r.legacyGoalId===x.source),rationale:x.reasons.join(' ')}))
 const helperText='// Reviewed B034 source components only; no legacy canonical-ID child/mastery mapping.\n'
 +'type Decision = {sourceGoalId:string;canonicalGoalIds:string[];rationale:string;reviewedAt:string;reviewer:string}\n'
 +'type Mapping = {legacyGoalId:string;canonicalGoalId:string;matchType:string;reviewDecisionId:string}\n'
 +'const reviewed = '+JSON.stringify(replay,null,2)+'\n'
 +'export function applyPhysicsB034ConsolidationMappings(decisions:Decision[],mappings:Mapping[]):void {\n'
 +' for(const review of reviewed){const d=decisions.find(x=>x.sourceGoalId===review.source);if(!d)continue;d.canonicalGoalIds=[...review.canonicalGoalIds];d.rationale=review.rationale;d.reviewedAt="2026-09-08";d.reviewer="codex-physics-b034-informed-implementation-a-20260908";for(let i=mappings.length-1;i>=0;i--)if(mappings[i].legacyGoalId===review.source)mappings.splice(i,1);for(const row of review.mappings)mappings.push({...row});}\n}\n'
 ops.push({file:helperPath,kind:'new-text-file',before:missing,after:state(helperText),reason:'Deterministic replay of individually checked source components; other generator rows unchanged.'});docs.set(helperPath,helperText)
 const seamByKey={
 heGenerator:'  const mappedSourceGoalIds = new Set(mappings.map((mapping) => mapping.legacyGoalId))',
 byGenerator:'  mkdirSync(path.dirname(reviewAbsolutePath), { recursive: true })',
 hhGenerator:'const review = {',
 rpGenerator:'const review = {',
 bwGenerator:'  const reviewedSourceGoalIds = new Set(decisions.map((decision) => decision.sourceGoalId))'}
 for(const key of ['heGenerator','byGenerator','hhGenerator','rpGenerator','bwGenerator']){
  const p=paths[key],t=doc(p),first=t.split('\n')[0],seam=seamByKey[key]
  span(p,first,'import { applyPhysicsB034ConsolidationMappings } from "./physicsB034ConsolidationMappings"\n'+first,'Minimal current import splice; preserve all HE quantum/GK overrides, BB clones and parallel astro authoring.')
  const indent=seam.match(/^ */u)[0]
  span(p,seam,indent+'applyPhysicsB034ConsolidationMappings(decisions, mappings)\n'+seam,'Current exact post-mapping insertion; no stale historical seam rebasing.')
 }
 // Historic clusters are retained canonically, but never cause cross-scope all-child target inheritance.
 const viewAudit=[]
 for(const p of [...viewPaths,atlas]){
  const v=doc(p),isAtlas=p===atlas,scope=v.scope??{},before=compile(beforeCanonical,beforeViews.get(p)),oldRendered=rendered(before)
  // Native CPV-004 checks structural subtree intersections even when effective
  // roles hide leaves. Expand only paths that contain our affected historical
  // compounds/reused leaves; unrelated subtrees and authored structures survive.
  const explicitLeaves=new Set([ids.comparison,ids.energy,ids.risk,ids.evaluation,ids.lifecycle,ids.amplifier])
  const affectedPath=(id,seen=new Set())=>{if(seen.has(id))return false;seen.add(id);return historicIds.includes(id)||explicitLeaves.has(id)||(goal(id)?.contains??[]).some(ch=>affectedPath(ch,seen))}
  function expandOwnPath(id,pathKey){
   if(historicIds.includes(id)||explicitLeaves.has(id))return null
   const g=goal(id)
   if(!affectedPath(id))return {kind:'canonicalSubtree',goalId:id}
   const children=(g.contains??[]).map((ch,i)=>expandOwnPath(ch,pathKey+'-'+i)).filter(Boolean)
   return children.length?{kind:'structure',id:'b034-preserved-'+pathKey.replace(/[^a-zA-Z0-9_-]/gu,'-'),label:g.title,children}:null
  }
  function rewriteAffectedNode(n,path){
   if(n.kind==='structure'){n.children?.forEach((ch,i)=>rewriteAffectedNode(ch,[...path,'children',i]));return}
   if(n.kind!=='canonicalSubtree'||n.projectionRole==='prerequisiteOnly'||!affectedPath(n.goalId)||historicIds.includes(n.goalId))return
   const after=expandOwnPath(n.goalId,path.join('-'))
   if(after)add(p,path,after,'Native CPV-004: expand only affected canonical paths; preserve unrelated canonical subtrees and re-place existing atomic IDs uniquely.')
  }
  v.rootNodes.forEach((n,i)=>rewriteAffectedNode(n,['rootNodes',i]))
  const entries=[]
  function walk(n,path){if(n.goalId&&historicIds.includes(n.goalId))entries.push({n,path});n.children?.forEach((c,i)=>walk(c,[...path,'children',i]))}
  v.rootNodes.forEach((n,i)=>walk(n,['rootNodes',i]))
  for(const {n,path} of entries){if(n.kind==='goalEntry')add(p,[...path,'kind'],'canonicalSubtree','Native CPV-009 requires a real subtree reference for a curricularArea, even when prerequisite-only.');add(p,[...path,'projectionRole'],'prerequisiteOnly','Retain old ID without projecting the full historical compound into every scope.')}
  for(const id of historicIds){
   if(!entries.some(x=>x.n.goalId===id))add(p,['rootNodes',{kind:'canonicalSubtree',goalId:id}],{kind:'canonicalSubtree',goalId:id,projectionRole:'prerequisiteOnly'},'Native subtree guard prevents inherited historical compound fanout.')
  }
  // New children: even absent targets get explicit prerequisiteOnly so broader roots cannot leak later.
  for(const id of targetCandidates)if(!sourceSupported(scope,id,isAtlas))add(p,['rootNodes',{kind:'goalEntry',goalId:id}],{kind:'goalEntry',goalId:id,projectionRole:'prerequisiteOnly'},'New competence is not a checked target in this state/course/stage; retained solely as prerequisite ID.')
  const j=scope.jurisdiction,upper=scope.stage!=='SekI',lk=scope.courseProfile==='LK'
  const amplifierAllowed=isAtlas||(upper&&lk&&(!j||j==='DE-HE'||(!['DE-BY','DE-RP'].includes(j)&&oldRendered.has(ids.amplifier))))
  if(!amplifierAllowed){
   const refs=[];function refsWalk(n,path){if(n.kind==='goalEntry'&&n.goalId===ids.amplifier)refs.push(path);n.children?.forEach((x,i)=>refsWalk(x,[...path,'children',i]))}v.rootNodes.forEach((n,i)=>refsWalk(n,['rootNodes',i]))
   for(const x of refs)add(p,[...x,'projectionRole'],'prerequisiteOnly','Checked HE basic course and RP switch-only clauses do not target amplification; course-specific prerequisite retention only.')
   if(!refs.length)add(p,['rootNodes',{kind:'goalEntry',goalId:ids.amplifier}],{kind:'goalEntry',goalId:ids.amplifier,projectionRole:'prerequisiteOnly'},'No inherited amplifier target in GK, BY or RP checked scope.')
  }
  const requested=targetCandidates.filter(id=>sourceSupported(scope,id,isAtlas))
  if(amplifierAllowed)requested.push(ids.amplifier)
  if(isAtlas||(['DE-HE','DE-RP'].includes(j)&&upper))requested.push(ids.comparison,ids.energy)
  if((j==='DE-BY'&&upper&&!lk)||isAtlas)requested.push(ids.lifecycle)
  // Preserve independently visible reused nuclear atoms, not all historic cluster semantics.
  for(const id of [ids.comparison,ids.energy,ids.risk,ids.evaluation,ids.lifecycle])if(oldRendered.has(id))requested.push(id)
  const currentRendered=rendered(compile(doc(paths.canonical),v))
  const additions=[...new Set(requested)].filter(id=>!currentRendered.has(id))
  const sourceGroups=[
   {key:'optical',label:j==='DE-BY'?'Ph13-EA.5 – Optische Signalübertragung':'Optische Signalübertragung',ids:[ids.audio,ids.multiplex]},
   {key:'transistor',label:j==='DE-RP'?'Elektronik – Quellenanteil Wahlthema':j==='DE-BY'?'Ph10.5 – NTG-Quellenanteil: Transistorschalter':'Transistorschaltungen',ids:[ids.switch,ids.flipflop,ids.amplifier]},
   {key:'stars',label:j==='DE-BY'?'Ph13-GA-ASTRO.4 – Quellenanteil Astrophysik':'Sternentwicklung und Materiekreislauf',ids:[ids.lifecycle,ids.elements,ids.endstage]},
   {key:'nuclear',label:'Kernreaktionen: Grundlagen',ids:[ids.comparison,ids.energy,ids.risk,ids.evaluation,ids.reactor]},
   {key:'assessments',label:'Materialgestützte Prüfungsaufgaben',ids:[...taskIds,ids.switchAssessment]}
  ]
  for(const group of sourceGroups){const go=group.ids.filter(id=>additions.includes(id));if(!go.length)continue
   add(p,['rootNodes',{kind:'structure',id:'physics-b034-'+group.key}],{kind:'structure',id:'physics-b034-'+group.key,label:group.label,children:go.map(goalId=>({kind:'goalEntry',goalId}))},'Explicit unique reviewed scope placement; existing independent canonical locations are reused when already rendered.')
  }
  add(p,['rootNodes'],repairHessePhysicsTree(clone(v)).rootNodes,'HE SekII supplements belong inside the reviewed Q4 subjects and exercises, with an explicit stage wrapper and distinct GK/LK exam labels. No target or prerequisite-role change.')
  viewAudit.push({file:p,sourceScope:scope,addedTargets:additions,baselineErrors:before.findings.filter(f=>f.severity==='error')})
 }
 const date='2026-09-08',reviewer='codex-physics-b034-informed-implementation-a-20260908'
 for(const p of [paths.atomicity,paths.memory])for(const id of historicIds)add(p,[{goalId:id}],undefined,'Historic compound is now a subject cluster; old active atom review is removed and fully retained in its before lease.')
 for(const id of changedAtomIds){
  const common={schemaVersion:1,reviewId:'canonical-physics-full',landscapeId,goalId:id,reviewedAt:date,reviewer},g=goal(id)
  add(paths.atomicity,[{goalId:id}],{...common,ruleVersion:'semantic-atomicity-v1',fingerprint:reviewFingerprint(g,'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,reason:spec.reviewReasons[id].atomicity,suggestedSplit:[]},'Fresh individual atomicity decision for the exact authored competence.')
  add(paths.memory,[{goalId:id}],{...common,ruleVersion:'memory-card-review-v1',fingerprint:reviewFingerprint(g,'memory-card-review-v1'),status:'no_memory_needed',memoryUseful:false,reason:spec.reviewReasons[id].memory},'Individual judgment: supplied materials/circuit/model reasoning, no necessary new hard-recall unit.')
 }
 const affectedCards=doc(paths.cards).filter(r=>r.status==='kept'&&(r.originGoalIds??[]).some(id=>[...historicIds,ids.amplifier].includes(id)))
 if(affectedCards.length)throw Error('Concrete card-origin review now required; inspected no-origin baseline changed: '+JSON.stringify(affectedCards.map(c=>c.cardId)))
 const kinds=doc(paths.kinds)
 for(const id of affectedIds){
  const g=goal(id),old=kinds.decisions.find(x=>x.goalId===id)
  const kind=historicIds.includes(id)?'curricularArea':newIds.includes(id)?'curricularAtomic':taskIds.includes(id)?'practiceAssessment':old?.semanticKind
  if(!kind)throw Error('Missing kind for '+id)
  const basis=historicIds.includes(id)?'reviewed-current-structural-split-curricular-area':kind==='practiceAssessment'?'reviewed-current-post-split-practice-assessment':kind==='curricularAtomic'?'reviewed-current-semantic-recheck-curricular-atomic':old.decisionBasis
  add(paths.kinds,['decisions',{goalId:id}],{goalId:id,sourceFingerprint:goalBook.fingerprintSemanticKindSourceGoal(g),semanticKind:kind,decisionStatus:'authoritative',decisionBasis:basis},'Native K candidate fingerprint for exactly changed fields; no D/P approval.')
 }
 for(const [k,delta] of [['curricularAtomic',3],['curricularArea',4],['practiceAssessment',7],['total',14]])add(paths.kinds,['counts',k],kinds.counts[k]+delta,'Six genuinely new atoms and four historical atoms retained as subject clusters.')
 const manifest='app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
 add(manifest,['expectedCurricularAtomicGoalCount'],doc(manifest).expectedCurricularAtomicGoalCount+3,'Net two ordinary atoms; no test-count rewrites.')
 const profileImpact=[]
 for(const n of readdirSync(resolve(repo,base+'quality/goal-evidence')).filter(x=>x.startsWith('canonical-physics')&&x.endsWith('.review.jsonl'))){
  const p=base+'quality/goal-evidence/'+n
  for(const r of read(p))if([...historicIds,ids.amplifier].includes(r.goalId))profileImpact.push({file:p,goalId:r.goalId,status:r.status,authority:r.reviewAuthority,action:historicIds.includes(r.goalId)?'Historical profile remains audit-only; never transfer atom evidence to children. Root must exclude obsolete ordinary-atomic scope during subsequent P registration.':'Exact changed description makes the old profile stale; use new authored evidence only as an unregistered candidate.'})
 }
 return {schemaVersion:1,packageId:spec.packageId,status:'authored_candidate_not_applied',capturedAt:new Date().toISOString(),reviewer:{agent:'physics_d043s_blind_a',provider:'unknown',model:'unknown',modelVersion:'unknown'},ids,sourceBindings:spec.originalSources.map(x=>({...x,sha256:sha(readFileSync(resolve(repo,x.path)))})),officialByExperimentSelection:spec.officialByExperimentSelection,operations:ops,positiveUnderstandingEvidence:evidence,sourceProfileConstraints:spec.originalClauseConstraints,viewAudit,profileImpact,cardImpact:{keptOriginRows:affectedCards.length,changes:[],reason:'No kept card has an origin at any converted cluster or refined amplifier. New seven ordinary-atomic decisions individually need no new memory unit.'},notAuthorized:['D/P registration or recognition','Old blind seal changes','Runtime changes','Old canonical ID-to-child mastery copying'],assessmentLimitations:['The seven new concrete tasks and repaired 88f are AI-authored draft assessments, not human-approved or runtime-approved. Generic capstones do not prove per-child understanding.','S-mode essential evidence requires an actually observed build; D cannot certify that build.'],coverageLimitations:['Jurisdiction/stage/course union projections are checked. NTG, selected astrophysics and optional electronics remain honest source annotations, not implemented selection semantics.','The narrow thermal-reactor goal closes only the identified reactor-function component, not a nationwide original-source completeness claim.']}

}
let plan
if(mode==='--capture-initial'||mode==='--capture-patch'){plan=capture();const body=JSON.stringify(plan,null,2);const text=mode==='--capture-patch'?'*** Begin Patch\n*** Add File: '+resolve(dir,'field-leased-plan.json')+'\n'+body.split('\n').map(x=>'+'+x).join('\n')+'\n*** End Patch\n':body+'\n';await new Promise(done=>process.stdout.write(text,done));process.exit(0)}
plan=read(planPath)
const candidates=new Map(),originalBytes=new Map()
for(const x of plan.sourceBindings)if(sha(readFileSync(resolve(repo,x.path)))!==x.sha256)throw Error('Checked original source drift: '+x.path)
for(const op of plan.operations){
 if(op.kind==='new-text-file'){if(existsSync(resolve(repo,op.file)))throw Error('New output already exists '+op.file);originalBytes.set(op.file,null);candidates.set(op.file,op.after.value);continue}
 if(!candidates.has(op.file)){const text=readText(op.file);originalBytes.set(op.file,text);candidates.set(op.file,op.kind==='text-span'?text:read(op.file))}
 const d=candidates.get(op.file)
 if(op.kind==='text-span'){if(d.split(op.before).length!==2)throw Error('Text lease drift '+op.file);candidates.set(op.file,d.replace(op.before,op.after))}
 else {if(!same(state(location(d,op.path).value),op.before))throw Error('Field lease drift '+op.file+' '+JSON.stringify(op.path));put(d,op.path,op.after)}
}
const get=p=>candidates.has(p)?candidates.get(p):read(p),c=get(paths.canonical),byId=new Map(c.goals.map(g=>[g.id,g])),all=new Map([...math.goals,...c.goals].map(g=>[g.id,g]))
if(c.goals.length!==byId.size)throw Error('Duplicate goal ID')
for(const edge of ['requires','contains']){const done=new Set(),active=new Set();function visit(id){if(active.has(id))throw Error(edge+' cycle '+id);if(done.has(id))return;const g=all.get(id);if(!g)throw Error('Unknown reference '+id);active.add(id);for(const ch of g[edge]??[])visit(ch);active.delete(id);done.add(id)}for(const id of byId.keys())visit(id)}
function descendants(id,out=new Set()){for(const ch of byId.get(id)?.contains??[]){out.add(ch);descendants(ch,out)}return out}
for(const id of historicIds){const ds=descendants(id);for(const child of ds)if(byId.get(child).requires?.includes(id))throw Error('Requires own containing cluster '+child)}
for(const id of newIds){const g=byId.get(id);if(g.contains.length||g.extendedData?.splitFromCanonicalGoalId||g.resourceLinks?.length)throw Error('Pre-image new atom independence error')}
for(const p of [paths.atomicity,paths.memory]){
 const rows=get(p);for(const id of historicIds)if(rows.some(r=>r.goalId===id))throw Error('Cluster remains in active A/M')
 for(const id of changedAtomIds){const selected=rows.filter(r=>r.goalId===id),r=selected[0],rule=p===paths.atomicity?'semantic-atomicity-v1':'memory-card-review-v1'
  if(selected.length!==1||r.schemaVersion!==1||r.ruleVersion!==rule||r.landscapeId!==landscapeId||r.reviewId!=='canonical-physics-full'||!r.reason?.trim()||r.fingerprint!==reviewFingerprint(byId.get(id),rule))throw Error('A/M shape/fingerprint '+id)
  if(p===paths.atomicity&&(r.status!=='atomic'||r.semanticAtomic!==true||!Array.isArray(r.suggestedSplit)))throw Error('A decision')
  if(p===paths.memory&&(r.status!=='no_memory_needed'||r.memoryUseful!==false||(r.deckIds??[]).length||(r.memoryGoalIds??[]).length))throw Error('M decision')
 }
}
const req=createRequire(resolve(repo,'app/package.json')),Ajv=req('ajv/dist/2020.js').default,addFormats=req('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const kschema=ajv.compile(read('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'))
if(!kschema(get(paths.kinds)))throw Error('Native K schema '+JSON.stringify(kschema.errors))
for(const id of affectedIds)if(get(paths.kinds).decisions.find(d=>d.goalId===id)?.sourceFingerprint!==goalBook.fingerprintSemanticKindSourceGoal(byId.get(id)))throw Error('K fingerprint '+id)
const viewResults=[]
for(const p of [...viewPaths,atlas]){
 const v=get(p),r=compile(c,v),counts=rendered(r),roles=comp.collectCompositionProjectionRoleGoalIds(v.rootNodes,byId),errors=r.findings.filter(x=>x.severity==='error')
 for(const id of targetCandidates){const wanted=sourceSupported(v.scope??{},id,p===atlas);if(roles.targetGoalIds.has(id)!==wanted||((counts.get(id)??0)!==(wanted?1:0)))throw Error('New target leakage/duplicate/missing '+p+' '+id)}
 for(const id of affectedIds)if((counts.get(id)??0)>1)throw Error('Affected duplicate occurrence '+p+' '+id)
 const introduced=errors.filter(e=>!plan.viewAudit.find(x=>x.file===p).baselineErrors.some(b=>same(b,e)))
 if(introduced.length)throw Error('New native compiler errors '+p+' '+JSON.stringify(introduced))
 const scope=v.scope??{},j=scope.jurisdiction,lk=scope.courseProfile==='LK'
 if(p!==atlas&&roles.targetGoalIds.has(ids.amplifier)&&(!lk||['DE-RP','DE-BY'].includes(j)))throw Error('Amplifier course/source leak '+p)
 viewResults.push({file:p,newTargetIds:newIds.filter(id=>counts.has(id)),affectedCompilerErrors:errors.filter(e=>affectedIds.includes(e.goalId)).length,preExistingErrors:errors.length})
}
for(const key of ['he','by','hh','rp','bw','bwLower']){
 const m=get(paths[key]),pairs=new Set()
 for(const row of m.mappings){const pair=row.legacyGoalId+':'+row.canonicalGoalId;if(pairs.has(pair))throw Error('Duplicate source mapping '+key+' '+pair);pairs.add(pair);if(newIds.includes(row.canonicalGoalId)&&row.matchType!=='partial')throw Error('New source mapping not partial')}
 for(const change of spec.mappingChanges.filter(x=>x.file===key)){const d=m.decisions.find(d=>d.sourceGoalId===change.source);for(const id of change.next)if(!d.canonicalGoalIds.includes(id))throw Error('Mapping/decision mismatch')}
}
const helper=candidates.get('app/scripts/physicsB034ConsolidationMappings.ts')
if(!helper)throw Error('Missing replay helper')
const outputEntries=[...candidates].map(([file,data])=>({file,beforeSha256:originalBytes.get(file)===null?null:sha(originalBytes.get(file)),text:typeof data==='string'?data:file.endsWith('.jsonl')?data.map(r=>JSON.stringify(r)).join('\n')+'\n':JSON.stringify(data,null,2)+'\n'}))
const summary={status:'PASS',applied:false,leasedOperations:plan.operations.length,outputFiles:outputEntries.length,countDelta:{curricularAtomic:3,curricularArea:4,practiceAssessment:7,total:14},newGoalIds:Object.fromEntries(['audio','multiplex','switch','flipflop','elements','endstage'].map(k=>[k,ids[k]])),checks:['Individual current-field and generator-seam leases','Checked local original-source SHA-256 bindings','Requires/contains DAG and references including external mathematics','No descendant requires its converted containing cluster','Seven individual A/M native record shapes and semantic fingerprints','Full native K JSON Schema and exact affected fingerprints','All native composition views: each new target exactly once; explicit prerequisiteOnly elsewhere; no introduced compiler error','No copied image, split provenance or exact new-child source map','No affected kept card origins; no card/deck rewrite','Reviewed source-component mapping/decision consistency'],profileImpact:plan.profileImpact,cardImpact:plan.cardImpact,viewResults,limitations:[...plan.coverageLimitations,...plan.assessmentLimitations,'This structural emitter does not import images or register D/P; images and profiles have their own exact bindings.','Root must run full current-source generator replay, global M6 and maturity-floor checks after serialized application. Existing unrelated count-test drift is not rewritten.'],outputs:outputEntries.map(({text,...x})=>({...x,afterSha256:sha(text)}))}
const print=s=>new Promise(done=>process.stdout.write(s,done))
if(mode==='--check')await print(JSON.stringify(summary,null,2)+'\n')
if(mode==='--outputs-json')await print(JSON.stringify({summary,outputs:outputEntries})+'\n')
if(mode==='--emit-patch'){const lines=['*** Begin Patch'];for(const {file,text} of outputEntries){const before=originalBytes.get(file);if(before===text)continue;if(before===null)lines.push('*** Add File: '+file,...text.replace(/\n$/u,'').split('\n').map(x=>'+'+x));else {const diff=spawnSync('diff',['-u','--label',file,'--label',file,resolve(repo,file),'-'],{input:text,encoding:'utf8',maxBuffer:32*1024*1024});if(diff.status!==1)throw Error('Expected changed native diff '+file);lines.push('*** Update File: '+file,...diff.stdout.trimEnd().split('\n').slice(2).map(x=>/^@@ .* @@/u.test(x)?'@@':x));}}lines.push('*** End Patch');await print(lines.join('\n')+'\n')}
