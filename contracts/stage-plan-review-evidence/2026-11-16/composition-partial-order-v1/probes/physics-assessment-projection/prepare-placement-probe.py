from pathlib import Path
import re,json
R=Path.cwd();B=R/'tmp/pipeline/laender-stufen/gesamt/review/physics-assessment-projection';P=R/'app/scripts/testPhysicsAssessmentProjection.ts';s=(B/'test-with-placement-guard.ts').read_text();s=s[:s.index('let viewCount = 0')];s=s.replace("import './testCurriculumQualityStatus'\n",'');s=re.sub(r"from '((?:\./|\.\./)[^']+)'",lambda m:"from '"+str((P.parent/m[1]).resolve())+"'",s);s=s.replace("const root = resolve(import.meta.dirname, '../..')",'const root = '+json.dumps(str(R)));s=s.replace("const viewDirectory = resolve(root, 'curricula/DE/Gymnasium/composition-views/physik')",'const viewDirectory = '+json.dumps(str(R/'tmp/pipeline/laender-stufen/gesamt/physics/frozen-v32/views')))
s+=r'''
const project = (view:CompositionView) => {
 const [projected]=normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonical],view));assert(projected);
 const byId=new Map(projected.goals.map(g=>[g.id,g]));
 const filters=[view.scope.courseProfile,view.scope.jurisdiction].filter((s):s is string=>!!s);
 const children=buildVisibleChildrenMap(byId,undefined,{[CANONICAL_GYMNASIUM_ROOT_ID]:{selected:true,stage:view.scope.stage},[canonical.meta.landscapeId]:{selected:true,filterId:filters.join(',')}});
 const ancestors=new Map<string,string[]>();
 const visit=(id:string,path:string[]=[])=>{assert(!ancestors.has(id));ancestors.set(id,path);(children.get(id)??[]).forEach(c=>visit(c,[...path,id]));};
 projected.goals.filter(g=>g.tags?.includes('root')).forEach(g=>visit(g.id));
 return {view,byId,children,ancestors};
};
const readView=(name:string)=>JSON.parse(readFileSync(resolve(viewDirectory,name),'utf8')) as CompositionView;
const errors:{view:string,task:string,message:string}[]=[];let checked=0;
for(const name of readdirSync(viewDirectory).filter(x=>x.endsWith('.view.json')).sort()){
 const p=project(readView(name));
 for(const id of p.ancestors.keys()) {const task=p.byId.get(id)!;if(!task.examData)continue;checked++;
  try{assertAssessmentPlacement(p.view.viewId,task,p.byId,p.ancestors)}catch(e){errors.push({view:name,task:id,message:String(e)})}
 }
}
const baseView=readView('de-he-gk.view.json');const p=project(baseView);
let chosen:{task:UiGoal,covered:string,parent:UiGoal,taskUnit:string,coveredUnit:string}|undefined;
for(const [id,path] of p.ancestors){const task=p.byId.get(id)!;if(!task.examData)continue;
 for(const covered of task.examData.coveredGoalIds??[]){const cp=p.ancestors.get(covered);if(!cp)continue;let i=0;while(i<Math.min(path.length,cp.length)&&path[i]===cp[i])i++;
  if(!i||i===Math.min(path.length,cp.length))continue;const parent=p.byId.get(path[i-1])!;
  if(!/^Sekundarstufe II/u.test(parent.title))continue;
  const taskUnit=p.byId.get(path[i])?.extendedData?.compositionNodeId as string;const coveredUnit=p.byId.get(cp[i])?.extendedData?.compositionNodeId as string;
  if(taskUnit&&coveredUnit&&taskUnit!==coveredUnit){chosen={task,covered,parent,taskUnit,coveredUnit};break;}
 }if(chosen)break;
}assert(chosen);const q=chosen;
assertAssessmentPlacement('positive-actual',q.task,p.byId,p.ancestors);
const reordered=structuredClone(baseView);const reverse=(nodes:CompositionView['rootNodes'])=>{nodes.reverse();nodes.forEach(n=>{if(n.kind==='structure')reverse(n.children)})};reverse(reordered.rootNodes);const rp=project(reordered);assertAssessmentPlacement('reordered-array',rp.byId.get(q.task.id)!,rp.byId,rp.ancestors);
const mutated=new Map([...p.byId].map(([id,g])=>[id,structuredClone(g)]));
mutated.get(q.parent.id)!.extendedData!.compositionChildOrder={after:[{unit:q.coveredUnit,after:q.taskUnit}]};
assert.throws(()=>assertAssessmentPlacement('direct-reverse',q.task,mutated,p.ancestors),/by declared after order/);
const middle=[...p.byId.values()].find(g=>p.ancestors.get(g.id)?.at(-1)===q.parent.id&&g.extendedData?.compositionNodeId&&![q.taskUnit,q.coveredUnit].includes(g.extendedData.compositionNodeId as string))!.extendedData!.compositionNodeId as string;
mutated.get(q.parent.id)!.extendedData!.compositionChildOrder={after:[{unit:q.coveredUnit,after:middle},{unit:middle,after:q.taskUnit}]};
assert.throws(()=>assertAssessmentPlacement('transitive-reverse',q.task,mutated,p.ancestors),/by declared after order/);
const wrongStage=new Map(p.ancestors);const lower=[...p.byId.values()].find(g=>p.ancestors.has(g.id)&&/^Sekundarstufe I(?:\s|$)/u.test(g.title))!;assert(lower);
wrongStage.set(q.task.id,p.ancestors.get(q.task.id)!.map(id=>id===q.parent.id?lower.id:id));
assert.throws(()=>assertAssessmentPlacement('wrong-lower-stage',q.task,p.byId,wrongStage),/is in Sek I before/);
const ownOnly=structuredClone(q.task);ownOnly.examData!.coveredGoalIds=[];ownOnly.requires=[q.covered];assertAssessmentPlacement('requires-is-not-coverage',ownOnly,mutated,p.ancestors);
const canonicalTree=project(readView('de-de-gym-physics-gk.view.json'));const oldTask='74a32716-2b46-5d96-8b57-3f6edb90e088';const upper=[...canonicalTree.byId.values()].find(g=>canonicalTree.ancestors.has(g.id)&&/^Sekundarstufe II(?:\s|$)/u.test(g.title))!;assert(upper);
const assertOldLower=(map:Map<string,string[]>)=>{const ancestors=(map.get(oldTask)??[]).map(id=>canonicalTree.byId.get(id)!);assert(ancestors.some(g=>/^Sekundarstufe I(?:\s|$)/u.test(g.title)),'previously visible Sek-I assessment must remain in SekI');assert(!ancestors.some(g=>/^Sekundarstufe II(?:\s|$)/u.test(g.title)),'must not move from SekI toSekII');};
assertOldLower(canonicalTree.ancestors);const moved=new Map(canonicalTree.ancestors);moved.set(oldTask,[...canonicalTree.ancestors.get(upper.id)!,upper.id]);assert.throws(()=>assertOldLower(moved),/must remain in SekI/);
const report={status:'PASS-independent-guard-mutations; actualV32findings retained',actualVisibleAssessmentPairsChecked:checked,actualPlacementFindings:errors,realWitness:{task:q.task.id,covered:q.covered,parent:q.parent.id,taskUnit:q.taskUnit,coveredUnit:q.coveredUnit},mutationChecks:['actual placement accepted','array reversal accepted','explicit reversed after rejected','transitive reversed after rejected','covered competency inII rejects task inI','requires alone not treated as coverage','old lower-task ancestry move rejected'],limits:['The old lower-placement mutation is performed on the actual projected ancestry; the attempted raw canonical-view move stalled before the assertions and was bounded separately.','The new placement guard is independent of CQR; known missing TH task is separately rejected by the unchanged demand guard.']};
writeFileSync(resolve(root,'tmp/pipeline/laender-stufen/gesamt/review/physics-assessment-projection/placement-guard.actual.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
'''
(B/'placement-probe.mts').write_text(s)
