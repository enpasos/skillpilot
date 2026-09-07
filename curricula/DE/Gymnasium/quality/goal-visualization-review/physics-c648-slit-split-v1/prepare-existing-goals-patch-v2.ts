import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../app/scripts/goalBookModel'
import { compileCompositionView } from '../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { findExamMarkdownTableIssues } from '../../../../../../app/scripts/lib/examMarkdownValidation'
import { ids, content, assessments } from './existing-goals-authoring-v2'

// Read-only emitter. Application is explicit apply_patch after all assertions pass.
const base = 'curricula/DE/Gymnasium/'
const stage = base + 'quality/goal-visualization-review/physics-c648-slit-split-v1/'
const canonicalPath = base + 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const kindsPath = base + 'quality/release-model/physik.semantic-kinds.json'
const receiptPath = stage + 'existing-goals-v2.adoption-receipt.json'
assert.equal(existsSync(receiptPath), false, 'Do not rewrite the historical adoption receipt')
const before = new Map<string,string>(), after = new Map<string,string>()
const read = (p:string) => { const s=readFileSync(p,'utf8'); before.set(p,s); return s }
const rj = (p:string) => JSON.parse(read(p))
const js = (v:any) => JSON.stringify(v,null,2)+'\n'
const sha = (s:string) => 'sha256:'+createHash('sha256').update(s).digest('hex')
const unique = (a:any[], k:string, v:string) => { const rows=a.filter(x=>x[k]===v);assert.equal(rows.length,1,k+':'+v);return rows[0] }
const c=rj(canonicalPath), old=structuredClone(c), goal=(id:string)=>unique(c.goals,'id',id)
const date='2026-09-07', changedIds=Object.values(ids)
assert.equal(goal(ids.minimum).description,'Die lernende Person kann die Lage von Interferenzminima beziehungsweise Interferenzmaxima bei ausgewaehlten Beugungsvorgaengen in Fernfeldnaeherung fuer Einzelspalt, Doppelspalt und Gitter berechnen.')
const archive:any={goals:old.goals.filter((g:any)=>changedIds.includes(g.id)),decisions:{}}
for(const authored of content){
  const {id,atomicReason,memoryReason,...fields}=authored
  Object.assign(goal(id),fields)
  assert.equal(goal(id).type,'atomic');assert.deepEqual(goal(id).contains,[])
}
// Direct inherited broad mappings must not turn the BW-LK minima extension into a national GK goal.
goal(ids.minimum).applicability={jurisdiction:['DE-BW']}
const uuid=(name:string)=>{const b=createHash('sha1').update(Buffer.from('6ba7b8119dad11d180b400c04fd430c8','hex')).update(name).digest().subarray(0,16);b[6]=(b[6]&15)|80;b[8]=(b[8]&63)|128;const h=b.toString('hex');return[h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-')}
const exams=assessments.map(a=>{
  assert.equal(a.points.reduce((n,p)=>n+p,0),10)
  for(const f of ['taskContent','taskContentEn','solutionContent','solutionContentEn'] as const){assert.ok(a[f].length>300);assert.deepEqual(findExamMarkdownTableIssues(a[f]),[])}
  const g=goal(a.goalId)
  return {id:uuid('https://skillpilot.com/canonical/physics/assessment/existing-diffraction-v2/'+a.goalId),title:'Prüfungsaufgabe: '+a.title,titleEn:'Assessment task: '+a.titleEn,
    description:'Die lernende Person kann eine materialgebundene Prüfungsaufgabe zu diesem optischen Modell selbstständig lösen, die Ergebnisse begründen und Modellgrenzen beurteilen.',
    descriptionEn:'The learner can independently solve a material-based assessment task about this optical model, justify the results and assess its limits.',
    weight:1,tags:[...g.tags.filter((t:string)=>['GK','LK'].includes(t)),'Practice','Assessment'],contains:[],requires:[g.id],type:'atomic',
    dimensionTags:{framework:'canonical-gymnasium-physics',demandLevel:'AB3',processCompetencies:['PK2_MODELLIEREN','PK3_MATHEMATISIEREN','PK5_BEWERTEN'],guidingIdeas:['LI_WELLEN'],phase:'Q3',area:'Klausurtraining'},
    applicability:structuredClone(g.applicability),extendedData:{applicabilityFromRequires:true,applicabilityMappingInheritance:'boundary'},
    examData:{reviewStatus:'needs_review',coveredGoalIds:[g.id],coveredStrands:['LI_WELLEN'],demandLevels:['AB1','AB2','AB3'],taskContent:a.taskContent,taskContentEn:a.taskContentEn,solutionContent:a.solutionContent,solutionContentEn:a.solutionContentEn,
      scoring:{maxPoints:10,passingPoints:6,steps:a.points.map((points,index)=>({id:a.key+'-'+(index+1),points,description:'Teilaufgabe '+(index+1)+': nur die zugehörige begründete Leistung der Musterlösung; Teilpunkte für nachvollziehbare Ansätze, Folgefehler nicht mehrfach werten.'}))}},
  }
})
for(const e of exams){assert.equal(c.goals.some((g:any)=>g.id===e.id),false);assert.deepEqual(e.requires,e.examData.coveredGoalIds)}
c.goals.push(...exams)
const practice=goal('b47a2a23-b56d-5433-9036-075d6bb7c782')
practice.contains.push(...exams.map(e=>e.id));practice.weight=practice.contains.length
const cap=goal('a94f9b05-ecb1-5a13-8364-44c1c98be8e4')
assert.equal(cap.requires.filter((id:string)=>id===ids.minimum).length,1)
cap.requires=cap.requires.filter((id:string)=>id!==ids.minimum)
cap.examData.coveredGoalIds=cap.examData.coveredGoalIds.filter((id:string)=>id!==ids.minimum)
// Preserve the existing broader assessment body; the new one-goal cases carry actual evidence.
const ordinaryExisting=old.goals.filter((g:any)=>!changedIds.includes(g.id)&&![practice.id,cap.id].includes(g.id))
for(const g of ordinaryExisting)assert.deepEqual(goal(g.id),g)
after.set(canonicalPath,js(c))

// Individual A/M decisions, with prior complete rows archived; statuses retain actual card need.
const norm=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>JSON.stringify(k)+':'+stable(x)).join(',')+'}':JSON.stringify(v)
const amFp=(g:any,ruleVersion:string)=>sha(stable({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
for(const lane of ['semantic-atomicity','memory-card-review']){
  const p=base+'quality/'+lane+'/canonical-physics-full.review.jsonl',rows=read(p).trimEnd().split('\n').map(l=>JSON.parse(l))
  archive.decisions[lane]=rows.filter(r=>changedIds.includes(r.goalId)).map(r=>structuredClone(r))
  for(const a of content){const r=unique(rows,'goalId',a.id);assert.equal(r.fingerprint,amFp(unique(old.goals,'id',a.id),r.ruleVersion));
    r.fingerprint=amFp(goal(a.id),r.ruleVersion);r.reviewedAt=date;r.reviewer='OpenAI Codex B041 existing-case author; AI, exact model unknown';r.reason=lane==='semantic-atomicity'?a.atomicReason:a.memoryReason
    if(lane==='semantic-atomicity'){r.status='atomic';r.semanticAtomic=true;r.suggestedSplit=[]}
    else assert.equal(r.status,[ids.double,ids.single].includes(a.id)?'memory_required':'no_memory_needed')
  }
  after.set(p,rows.map(r=>JSON.stringify(r)).join('\n')+'\n')
}
const kinds=rj(kindsPath),oldKinds=structuredClone(kinds)
for(const id of [...changedIds,practice.id,cap.id]){
  const r=unique(kinds.decisions,'goalId',id);assert.equal(r.sourceFingerprint,fingerprintSemanticKindSourceGoal(unique(old.goals,'id',id)))
  r.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal(id))
}
for(const e of exams)kinds.decisions.push({goalId:e.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(e),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'})
kinds.decisions.sort((a:any,b:any)=>a.goalId<b.goalId?-1:a.goalId>b.goalId?1:0)
for(const key of Object.keys(kinds.counts))kinds.counts[key]=key==='total'?kinds.decisions.length:kinds.decisions.filter((r:any)=>r.semanticKind===key).length
after.set(kindsPath,js(kinds))

const sourcePlan:any[]=[]
function reviseSource(path:string, replacements:Record<string,{remove?:string[],add:string[],reason:string}>){
  const d=rj(path),e=rj(d.sourceExtractionPath)
  for(const [sid,change]of Object.entries(replacements)){
    const r=unique(d.decisions,'sourceGoalId',sid),prior=structuredClone(r),source=unique(e.sourceGoals,'id',sid)
    r.canonicalGoalIds=[...new Set(r.canonicalGoalIds.filter((id:string)=>!(change.remove??[]).includes(id)).concat(change.add))]
    r.rationale=change.reason+' Getrennte Teilzuordnungen, keine automatische Masteryübertragung; vollständiger Originalaspekt in der B041-Änderungsakte gebunden.'
    r.reviewedAt=date;r.reviewer='OpenAI Codex B041 individual source review; AI, model unknown'
    d.mappings=d.mappings.filter((m:any)=>m.legacyGoalId!==sid)
    for(const id of r.canonicalGoalIds)d.mappings.push({legacyGoalId:sid,canonicalGoalId:id,matchType:'partial',reviewDecisionId:sid})
    sourcePlan.push({path,source,before:prior,after:structuredClone(r)})
  }
  after.set(path,js(d))
}
reviseSource(base+'mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',{
  'he-phys-sekii-q3-1-b07-a01-7bb1b8cb':{remove:[ids.minimum],add:[],reason:'HE KC2024 Q3.1, Originaldruckseite 41: Doppelspalt-Maxima, Herleitung und Kleinwinkelbedingung werden in 6270 geprüft; keine zusätzliche Doppelspalt-Minimapflicht.'},
  'he-phys-sekii-q3-1-b08-a01-1c9d7aa6':{add:[ids.double],reason:'HE Q3.1, S.41: monochromatische Wellenlängenmessung wird getrennt am Doppelspalt (6270) und am Gitter (9168) getragen. Die Quelle verlangt beim Gitter keine vollständige Formelherleitung.'},
  'he-phys-sekii-q3-1-b09-a01-ebe6e4d8':{add:[ids.double],reason:'HE Q3.1, S.41: polychromatische Spektren beider Anordnungen bleiben erhalten: Doppelspaltfarben in 6270, Gitterspektren in 9168.'},
  'he-phys-sekii-q3-1-b13-a01-03a9ca89':{remove:[ids.minimum],add:[],reason:'HE Q3.1, S.41: der LK-Einzelspaltauftrag bleibt bei f6a3 sowie den bestehenden experimentellen und vergleichenden Modellzielen. c648 bezeichnet nun ausschließlich Doppelspalt-Minima und ist hierfür kein Quellenbeleg.'},
})
reviseSource(base+'mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_source_extraction_to_canonical_physics.review.json',{
  'bw-phys-sekii-3-4-5-b04-a01-4fb610f5':{remove:[ids.minimum],add:[ids.double,ids.grating],reason:'BW Basisfach 3.4.5(4), revidiertes Original Druckseite31: die ausdrücklich genannten Doppelspaltmaxima und Gitterhauptmaxima werden auf 6270 und 9168 verteilt, nicht als vollständige Minimapflicht ausgegeben.'},
  'bw-phys-sekii-3-5-5-b04-a01-48bddaad':{remove:[ids.minimum],add:[ids.double,ids.grating],reason:'BW Basisfach 3.5.5(4), revidiertes Original Druckseite37: Doppelspaltmaxima und Gitterhauptmaxima, keine allgemeine Einzelspalt-/Doppelspaltminimapflicht.'},
  'bw-phys-sekii-3-6-5-b06-a01-e3aa9020':{add:[ids.grating],reason:'BW Leistungsfach 3.6.5(6), revidiertes Original Druckseite45: c648 trägt nur Doppelspaltminima, 6270 Doppelspaltmaxima, f6a3 Einzelspaltminima, 9168 Gitterhauptmaxima. Die historische Extraktionsseitenzahl43 ist nicht die Druckseite dieses revidierten PDFs.'},
})
reviseSource(base+'mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json',{
  '56801db7-c4d5-53ca-a765-73945bce4ff0':{remove:[ids.minimum],add:[ids.double],reason:'BY Ph12-EA.3.7: Kohärenz und Wellenlängenmessung werden am vorhandenen Experimentziel sowie den getrennten Doppelspalt-/Gittermessmodellen geprüft; der Aspekt fordert keine isolierte Doppelspalt-Minimarechnung.'},
  'b47189a1-27b3-5986-a29b-f7f4d43a59ac':{remove:[ids.minimum],add:[ids.grating],reason:'BY Ph12-EA.3.8: phasengleiche Gitterhauptmaxima gehören zum Gittermodell9168; der weitere Zeiger-/Intensitätsvergleich bleibt beim bestehenden Modellziel2c6 und Experimentzielc713. Die enge Doppelspalt-Minimakompetenz ersetzt nicht diesen Mehrfachspaltauftrag.'},
  'b44c5542-925f-5bea-bbda-b641d0ee3ae7':{remove:[ids.minimum],add:[ids.single],reason:'BY Ph12-EA.3.10: das Einzelspalt-Elementarwellen-/Amplitudenmodell gehört zu f6a3; der Einfluss der Einzelspalthülle auf Doppelspalt/Gitter bleibt beim vergleichenden Modellziel2c6. Keine Reduktion auf bloßes Tabellenablesen.'},
  'd12fd0f2-4d61-5c9f-9824-ed03f7e3b2ea':{remove:[ids.minimum],add:[],reason:'BY Ph12-EA.4.10: Gitter-Wellenlängenmessung wird durch9168 getragen; die vorhandenen Experiment-/Messunsicherheits-/Planungsziele bleiben unverändert. c648 ist kein Nachweis einer LED-Gittermessung.'},
})
const legacyPath=base+'mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json',legacy=rj(legacyPath)
const replacements:Record<string,string[]>={'7b93414b-dd50-41c2-8f49-10778158e070':changedIds,'5562f1bb-ff4c-4fca-8230-fca0bcd1870d':[ids.double,ids.grating]}
const legacySource=rj(base+'input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_PHYSIK.de.json.snapshot')
for(const sid of Object.keys(replacements))sourcePlan.push({path:legacyPath,source:unique(legacySource.goals,'id',sid),targets:replacements[sid],reason:sid.startsWith('7b')?'LF-Sammelquelle ist nach der Eingrenzung nur noch ein partieller Nachweis je Fall.':'BF-Extraktion ist weiter gefasst als die amtliche Klammer; die geprüfte Originalfassung verlangt Doppelspaltmaxima/Gitterhauptmaxima.'})
legacy.mappings=legacy.mappings.flatMap((m:any)=>m.canonicalGoalId===ids.minimum?(replacements[m.legacyGoalId]??assert.fail('Unknown legacy mapping')).map(id=>({...m,canonicalGoalId:id,matchType:'partial'})):[m])
after.set(legacyPath,js(legacy))

const viewChecks:any[]=[]
const withKinds=(doc:any,k:any)=>({...doc,goals:doc.goals.map((g:any)=>({...g,semanticKind:k.decisions.find((r:any)=>r.goalId===g.id)?.semanticKind}))})
for(const name of readdirSync(base+'composition-views/physik').filter(n=>/^de-(bw|by)-(gk|lk|sekii-gk|sekii-lk)\.view\.json$/.test(n))){
  const p=base+'composition-views/physik/'+name,d=rj(p),previous=structuredClone(d),bw=d.scope.jurisdiction==='DE-BW',lk=d.scope.courseProfile==='LK'
  const remove=new Set(bw?[ids.minimum,ids.double]:[ids.minimum,ids.single])
  const strip=(nodes:any[]):any[]=>nodes.filter(n=>!(n.kind==='goalEntry'&&remove.has(n.goalId))).map(n=>({...n,...(n.children?{children:strip(n.children)}:{})}))
  d.rootNodes=strip(d.rootNodes)
  const find=(nodes:any[],id:string):any=>{for(const n of nodes){if(n.id===id)return n;const child=n.children&&find(n.children,id);if(child)return child}}
  if(bw){find(d.rootNodes,'physics-bw-sekii-3-4-5').children.unshift({kind:'goalEntry',goalId:ids.double});if(lk)find(d.rootNodes,'physics-bw-sekii-3-6-5').children.unshift({kind:'goalEntry',goalId:ids.minimum})}
  else if(lk)find(d.rootNodes,'physics-by-ph12-ea-3').children.unshift({kind:'goalEntry',goalId:ids.single})
  const selected=exams.filter(e=>e.requires[0]===ids.double||e.requires[0]===ids.grating||lk&&(e.requires[0]===ids.single||bw&&e.requires[0]===ids.minimum))
  const container=find(d.rootNodes,bw?'physics-bw-sekii-3-4-5':lk?'physics-by-ph12-ea-3':'physics-by-ph12-ga-3')
  assert.ok(container)
  container.children.push({kind:'structure',id:d.viewId+'-diffraction-case-assessments',label:'Prüfungsaufgaben Wellenoptik',children:selected.map(e=>({kind:'goalEntry',goalId:e.id}))})
  const initial=compileCompositionView(previous,withKinds(old,oldKinds)).findings
  const final=compileCompositionView(d,withKinds(c,kinds)).findings
  const errors=final.filter((f:any)=>f.severity==='error'&&!initial.some((b:any)=>JSON.stringify(b)===JSON.stringify(f)))
  assert.deepEqual(errors,[],name)
  viewChecks.push({path:p,courseProfile:d.scope.courseProfile,assessmentIds:selected.map(e=>e.id),newNativeErrors:errors})
  after.set(p,js(d))
}
assert.equal(viewChecks.length,8)
// Both graph relations remain DAGs; every new assessment has exactly one actual source goal.
for(const edge of ['contains','requires']){const visited=new Set<string>(),active=new Set<string>();const walk=(id:string)=>{if(visited.has(id))return;assert.equal(active.has(id),false,edge+' cycle '+id);active.add(id);for(const ref of goal(id)[edge]??[]){const local=typeof ref==='string'?ref.replace(c.landscapeId+':',''):ref.id??ref.goalId;if(c.goals.some((g:any)=>g.id===local))walk(local)}active.delete(id);visited.add(id)};for(const g of c.goals)walk(g.id)}
// Recalculate the actual assessment numbers; no visual or independent review is implied.
const numerical={doubleLambda:0.0003*0.008/4,doubleSpacing:600e-9*2/0.0003,minimumY:2*Math.tan(Math.asin(500e-9/(2*0.0002))),gratingLambda:2e-6*Math.sin(17.46*Math.PI/180),gratingBlueAngle:Math.asin(.225)*180/Math.PI,gratingOverlapAngle:Math.asin(.9)*180/Math.PI,singleY:2*Math.tan(Math.asin(.0025)),singleSideIntensity:(Math.sin(Math.PI*1.4303)/(Math.PI*1.4303))**2,singleSideY:2*Math.tan(Math.asin(.0025*1.4303))}
assert.ok(Math.abs(numerical.doubleLambda-600e-9)<1e-18);assert.ok(Math.abs(numerical.minimumY-.002500001953)<1e-12);assert.ok(Math.abs(numerical.gratingLambda-600e-9)<.2e-9);assert.ok(Math.abs(numerical.singleSideIntensity-.047190449)<1e-9)
const receipt={artifactType:'physics-existing-diffraction-four-goal-adoption-v2',status:'emitted_for_explicit_apply_patch_not_execution_attestation',date,authority:'OpenAI Codex author, AI candidate; not human approval',changedContentIds:changedIds,newContentIds:[],newAssessmentIds:exams.map(e=>e.id),archive,sourcePlan,viewChecks,numerical,holds:['D/P/V final follow-up remains required; no automatic mastery migration.','The old general Q3 assessment body is intentionally not rewritten or claimed as evidence of every new case.','Existing BW-LF provenance7b934 is retained as a historical source of the partial minimum competency, not misidentified as a BF source.'],files:[...after].map(([path,bytes])=>({path,beforeSha256:sha(before.get(path)!),afterSha256:sha(bytes)}))}

// Pure patience diff; no source file writes and no dependence on the historical emitter.
function blocks(a:string[],b:string[]){const out:any[]=[];const rec=(a0:number,a1:number,b0:number,b1:number)=>{while(a0<a1&&b0<b1&&a[a0]===b[b0]){a0++;b0++}while(a0<a1&&b0<b1&&a[a1-1]===b[b1-1]){a1--;b1--}if(a0===a1&&b0===b1)return;const am=new Map<string,number[]>(),bm=new Map<string,number[]>();for(let i=a0;i<a1;i++)am.set(a[i],[...(am.get(a[i])??[]),i]);for(let i=b0;i<b1;i++)bm.set(b[i],[...(bm.get(b[i])??[]),i]);const ps=[...am].filter(([s,p])=>p.length===1&&bm.get(s)?.length===1).map(([s,p])=>[p[0],bm.get(s)![0]]);const tails:number[]=[],prev:number[]=[];for(let k=0;k<ps.length;k++){let lo=0,hi=tails.length;while(lo<hi){const m=(lo+hi)>>1;if(ps[tails[m]][1]<ps[k][1])lo=m+1;else hi=m}prev[k]=lo?tails[lo-1]:-1;tails[lo]=k}if(!tails.length){out.push({a0,a1,b0,b1});return}const anchors:number[][]=[];for(let k=tails[tails.length-1];k>=0;k=prev[k])anchors.push(ps[k]);anchors.reverse();for(const[x,y]of anchors){rec(a0,x,b0,y);a0=x+1;b0=y+1}rec(a0,a1,b0,b1)};rec(0,a.length,0,b.length);const merged:any[]=[];for(const x of out){const p=merged.at(-1);if(p&&x.a0-p.a1<=10){p.a1=x.a1;p.b1=x.b1}else merged.push({...x})}return merged}
let patch='*** Begin Patch\n'
for(const[path,bytes]of after){const a=before.get(path)!.trimEnd().split('\n'),b=bytes.trimEnd().split('\n');if(a.join('\n')===b.join('\n'))continue;patch+='*** Update File: '+path+'\n';for(const x of blocks(a,b)){const l=Math.min(5,x.a0,x.b0),r=Math.min(5,a.length-x.a1,b.length-x.b1);patch+='@@\n'+a.slice(x.a0-l,x.a0).map(s=>' '+s+'\n').join('')+a.slice(x.a0,x.a1).map(s=>'-'+s+'\n').join('')+b.slice(x.b0,x.b1).map(s=>'+'+s+'\n').join('')+a.slice(x.a1,x.a1+r).map(s=>' '+s+'\n').join('')}}
patch+='*** Add File: '+receiptPath+'\n'+js(receipt).trimEnd().split('\n').map(s=>'+'+s+'\n').join('')+'*** End Patch\n'
for(const[p,s]of before)assert.equal(readFileSync(p,'utf8'),s,'Concurrent edit '+p)
process.stdout.write(JSON.stringify({patch,summary:{status:'PASS_EMITTED_NOT_APPLIED',files:after.size,changedContentIds:changedIds,newAssessmentIds:exams.map(e=>e.id),numerical}}))
