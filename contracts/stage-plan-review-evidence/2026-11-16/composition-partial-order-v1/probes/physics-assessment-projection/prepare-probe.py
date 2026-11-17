from pathlib import Path
import re,json,hashlib
R=Path.cwd();B=R/'tmp/pipeline/laender-stufen/gesamt/review/physics-assessment-projection';P=R/'app/scripts/testPhysicsAssessmentProjection.ts';s=P.read_text();(B/'original-test.ts').write_text(s)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source=R/'tmp/pipeline/laender-stufen/gesamt/physics/frozen-v32/views';live=R/'curricula/DE/Gymnasium/composition-views/physik';assert all(p.read_bytes()==(live/p.name).read_bytes() for p in source.glob('*.view.json'))
manifest={'test':str(P.relative_to(R)),'testSha256':sha(P),'viewSource':'Actual live V32 bytes, preserved in frozen-v32/views','viewPins':{p.name:sha(p) for p in source.glob('*.view.json')},'canonicalPhysicsSha256':sha(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),'excludedKnownFailure':'de-th-seki.view.json: actual missing14cc61 despite needed astronomy basis; product test is unchanged and must keep rejecting it.'}
(B/'original-inputs.actual.json').write_text(json.dumps(manifest,indent=2)+'\n')
s=s.replace("import './testCurriculumQualityStatus'\n",'')
s=s[:s.index('const routeProfile = routeProfiles.find')]
s=re.sub(r"from '((?:\./|\.\./)[^']+)'",lambda m:"from '"+str((P.parent/m[1]).resolve())+"'",s)
s=s.replace("const root = resolve(import.meta.dirname, '../..')",'const root = '+json.dumps(str(R)))
s=s.replace("const viewDirectory = resolve(root, 'curricula/DE/Gymnasium/composition-views/physik')",'const viewDirectory = '+json.dumps(str(source)))
start="for (const filename of readdirSync(viewDirectory).filter((name) => name.endsWith('.view.json')).sort()) {"
hooks=r'''
const mutation = process.env.REVIEW_MUTATION ?? 'baseline';
const selectedFile = mutation === 'lost-seki-place' ? 'de-de-gym-physics-gk.view.json' : 'de-bb-gk.view.json';
const walkStructures = (nodes:CompositionView['rootNodes']): Extract<CompositionView['rootNodes'][number],{kind:'structure'}>[] => nodes.flatMap(n => n.kind==='structure' ? [n,...walkStructures(n.children)] : []);
const take = (nodes:CompositionView['rootNodes'],goalId:string):CompositionView['rootNodes'][number]|undefined => {
 for(let i=0;i<nodes.length;i++) { const node=nodes[i]; if('goalId' in node && node.goalId===goalId) return nodes.splice(i,1)[0]; if(node.kind==='structure'){ const got=take(node.children,goalId);if(got)return got; } }
};
const mutateView = (view:CompositionView) => {
 if(mutation==='missing-task'){assert(take(view.rootNodes,'c5807a37-129e-5df6-8989-482bc7f5683e'));}
 if(mutation==='wrong-abitur-place'){
  const abi=walkStructures(view.rootNodes).find(n=>n.label==='Abiturprüfung')!;assert(abi);
  const ref=abi.children.splice(0,1)[0];assert(ref);
  const destination=walkStructures(view.rootNodes).find(n=>n.id==='physics-bb-unit-q-practice')!;assert(destination);destination.children.push(ref);
 }
 if(mutation==='lost-seki-place'){
  const ref=take(view.rootNodes,'74a32716-2b46-5d96-8b57-3f6edb90e088');assert(ref);
  const stage=walkStructures(view.rootNodes).find(n=>n.label==='Sekundarstufe II')!;assert(stage);
  stage.children.push({kind:'structure',id:'review-moved-old-lower-task',label:'Reaktorphysik',children:[ref],childOrder:{after:[]}});
 }
};
'''
s=s.replace(start,hooks+"\nfor (const filename of readdirSync(viewDirectory).filter(name => name.endsWith('.view.json') && (mutation === 'baseline' ? name !== 'de-th-seki.view.json' : name === selectedFile)).sort()) {")
s=s.replace("const previousCounts = counts()", "mutateView(view)\n  const previousCounts = counts()")
s=s.replace("const [projected] = normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonical], view))", "const [originalProjected] = normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonical], view))\n  const projected = structuredClone(originalProjected)\n  if(mutation==='wrong-payload') projected.goals.find(g=>g.id==='c5807a37-129e-5df6-8989-482bc7f5683e')!.examData!.taskContent += '\\nREVIEW MUTATION: changed task content'\n")
# Negative cases must reach the real per-view assertions; global inventory floors
# apply to the89-view positive control only, not to a one-view mutation fixture.
needle="console.log('Physics duration assessment counts:'"
s=s.replace(needle,"if(mutation!=='baseline') throw new Error('MUTATION SURVIVED ALL PER-VIEW ASSERTIONS: '+mutation)\n"+needle)
s=s.replace("assert.equal(newLandCounts.fermiScopeViewCount, 15,", "assert.equal(newLandCounts.fermiScopeViewCount, 14,")
s+="\nconsole.log('INDEPENDENT STRUCTURAL CONTROL PASS:89V32views; TH missing-assessment case explicitly excluded; CQR not run.');\n"
(B/'probe.mts').write_text(s);print('Pinned original test + actualV32 input bytes; isolated structural/mutation harness ready.')
