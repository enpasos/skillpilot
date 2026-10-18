# SPDX-License-Identifier: Apache-2.0
import pathlib,json,copy,hashlib,shutil,datetime
R=pathlib.Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18';OLD=B/'chemie-current450-T4-operative-two-material-author-20261018-v2';O=B/'chemie-current450-T4-operative-two-material-author-20261018-v3'
assert not O.exists();O.mkdir();(O/'tools').mkdir()
def read(p):return json.loads(p.read_text())
def dump(n,x):(O/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pin(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
for p in OLD.glob('INPUT.*.json'):shutil.copy(p,O/p.name)
for n in ['COVERAGE.two-current-whole-P-and-executable-score-maps.pending.json','READ.two-whole-C-P-and-operative-materials.actual.json']:shutil.copy(OLD/n,O/n)
for n in ['materials','tasks']:shutil.copytree(OLD/n,O/n)
new=copy.deepcopy(read(OLD/'AUTHOR.two-new-complete-exam-goals.pending.json'))
labels={
 '60d99973-5e2e-506d-8dd9-ef710daad2ab':('Q4','Übung: Küpenfärbung und Direktfarbstoff','Practice: Vat and direct dyeing','Übungen Q4: Küpenfärbung und Direktfarbstoff'),
 'f0ef9592-da31-59de-86a4-d2d3d7025a8b':('Q1','Übung: Tenside – CMC, Schaum und Modellschmutz','Practice: Surfactants – CMC, foam and model soil','Übungen Q1: Tenside – CMC, Schaum und Modellschmutz')}
(O/'candidate-goals').mkdir()
for g in new['goals']:
 phase,de,en,label=labels[g['id']];g['phase']=phase;g['dimensionTags']['phase']=phase;g['title']=de;g['titleEn']=en
 dump('candidate-goals/'+g['id']+'.whole-goal.pending.json',g)
dump('AUTHOR.two-new-complete-exam-goals.pending.json',new)
combined=read(OLD/'AUTHOR.eighteen-goals.sixteen-whole-exact-two-new.pending.json');combined['goals'][16:]=new['goals'];dump('AUTHOR.eighteen-goals.sixteen-whole-exact-two-new.pending.json',combined)
src=read(OLD/'READ.primary-sources.actual-receipts-and-adaptation-boundaries.json')
gju=next(s for s in src['sources']if s['id']=='GJU-capillary-CMC');oldread=gju['actualRead'];assert 'PDF pp54–61' in oldread
gju['actualRead']=oldread.replace('PDF pp54–61','physical PDF pp55–62 (one-based)')
dump('READ.primary-sources.actual-receipts-and-adaptation-boundaries.json',src)
proposal=read(OLD/'PROPOSAL.two-exact-source-view-placements.pending.json')
for p in proposal['placements']:p['phase']=labels[p['endpointId']][0];p['localExerciseLabel']=labels[p['endpointId']][3]
dump('PROPOSAL.two-exact-source-view-placements.pending.json',proposal)
ops=[]
for q in read(OLD/'PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json')['operations']:
 path=q['normalView']['path'];v=read(R/path);ns=v['rootNodes'];node=None
 for i in q['stableStructureIdPath']:node=next(n for n in ns if n.get('id')==i);ns=node['children']
 app=[]
 for p in proposal['placements']:
  if path in p['currentTargetViews']:
   app.append({'kind':'structure','id':'t4-operative-local-'+p['phase'].lower()+'-practice','label':p['localExerciseLabel'],'children':[{'kind':'goalEntry','goalId':p['endpointId'],'projectionRole':'target'}]})
 assert not set(x['id']for x in app).intersection(n.get('id')for n in node['children'])
 ops.append({'normalView':pin(R/path),'stableStructureIdPath':q['stableStructureIdPath'],'beforeChildren':node['children'],'appendChildren':app,'afterChildren':node['children']+app})
dump('PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json',{'operations':ops,'normalWrites':0,'localPhaseLabelsMatchEndpointPhases':True})
review=B/'chemie-current450-T4-operative-two-material-independent-b-20261018-v1'
dump('INPUT.sealed-predecessor-and-independent-FIRST.pins.json',{'predecessorSeal':pin(OLD/'FREEZE.author.sha256.json'),'predecessorWholeGoals':pin(OLD/'AUTHOR.two-new-complete-exam-goals.pending.json'),'independentFIRST':pin(review/'FIRST.independent-b.substantive-two-method-review.md'),'independentFIRSTSeal':pin(review/'SEAL.independent-b.FIRST.json')})
dump('CHANGES.bounded-phase-interface-and-source-locator.pending.json',{'findings':['T4-M-B-01','T4-M-B-02'],'endpointChanges':[{'goalId':i,'phase':v[0],'dimensionTagsPhase':v[0],'title':v[1],'titleEn':v[2]}for i,v in labels.items()],'viewChange':'Only own new entry wrapped under an explicit local Q4/Q1 exercise label, using current beforeChildren CAS; no old goal or parent moved.','sourceReceiptChange':{'id':'GJU-capillary-CMC','before':oldread,'after':gju['actualRead']},'allMethodTaskSolutionRubricBytesExactToSealedV2':True,'originalSixteenWholeObjectsExact':True,'normalWrites':0,'independentFollowupPending':True})
(O/'README.md').write_text('''# T4 v3: bounded local-phase and source-locator successor — unreleased

This successor resolves the two findings in frozen independent B FIRST. Vat endpoint60d99973 now has Q4 in both phase fields; surfactant endpointf0ef9592 has Q1. Their learner labels are local exercises. Twelve view proposals append only these new entries under explicit matching Q4/Q1 exercise labels; every old child, target/support role and parent stays in place. The neutral canonical practice aggregate remains their canonical parent.

The GJU source receipt now correctly identifies printed47–54 as physical PDF55–62 (one-based). All complete method, task, solution and rubric bytes remain exact to sealed v2, including their v2 sourceArtifactPath provenance. The original sixteen whole proposed exam objects are preserved exactly in the combined handoff; only the two new objects are integration candidates here.

Both new bodies remain draft pending actual bounded independent follow-up and root native source/view/context binding. No normal write, actual learner execution, local safety release, human approval/trial or M7 completion is claimed. Own knowledge content: CC-BY-4.0; technical tooling/manifests: Apache-2.0; third-party source rights unchanged.
''')
print(json.dumps({'directory':str(O.relative_to(R)),'methodOrExamDataChanges':0,'viewOperations':len(ops),'physicalGJUOneBased':'55–62'}))
