# SPDX-License-Identifier: Apache-2.0
"""Bounded B008 candidate merge on the stable actual current Chemistry basis."""
from pathlib import Path
from copy import deepcopy
import hashlib,json,shutil,datetime
R=Path('/home/enpasos/projects/skillpilot');B=Path('curricula/DE/Gymnasium/quality/goal-evidence')
P=B/'2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1';D=R/P
OLD=B/'2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1'
assert not (D/'author.final.freeze.json').exists()
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();assert not (R/p).is_symlink();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=D/p;f.parent.mkdir(parents=True,exist_ok=True);bb=x if isinstance(x,bytes)else(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
 if f.exists():assert f.read_bytes()==bb,p
 else:f.write_bytes(bb)
 return ref(P/p)
def exact(src,dst):
 r=ref(src);o=put(dst,(R/src).read_bytes());assert r['sha256']==o['sha256'];return {'original':r,'ownExactCopy':o}
cp=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
kp=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
qp=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
c=read(cp);k=read(kp);qa=read(qp)
assert len(c['goals'])==487,'Wait for Root stable reviewed actual487 route integration; do not substitute old or provisional basis'
assert k['counts']['curricularAtomic']==381 and k['counts']['total']==487
base={g['id']:g for g in c['goals']}
routeids=['3259bf7f-4af4-58ae-8190-9aec07ec476f','e6196381-eab5-5a3e-bb6e-56c6e6e3617f','563f69ed-562f-5544-ab0c-bf0e481928d8']
for gid in routeids:assert base[gid]['examData']['reviewStatus']=='released','Use actually reviewed machine-released route basis only'
refs=[exact(cp,Path('inputs/current-whole-active-canonical.exact.json')),exact(kp,Path('inputs/current-whole-active-semantic-kinds.exact.json')),exact(qp,Path('inputs/current-whole-active-QA.exact.json'))]
fp=OLD/'source-view-remediation-author-v3/canonical504-one-faithful-redox-EN-existing-fields-kept.author-candidate.json';future=read(fp)
fk=OLD/'source-view-remediation-author-v3/semantic-kinds504-only-actual-EN-source-binding.technical-review-input.json'
exact(fp,Path('inputs/whole-original504-source-faithful-candidate.exact.json'));exact(fk,Path('inputs/whole-original504-semantic-kinds.exact.json'))
fb={g['id']:g for g in future['goals']};out=deepcopy(c);liveextras={g['id'] for g in c['goals']} - set(fb)
assert len(liveextras)==7
after=[];deltas=[]
for current in c['goals']:
 gid=current['id'];new=deepcopy(fb.get(gid,current))
 if gid in fb:
  kept_current_children=[ch for ch in current.get('contains',[])if ch in liveextras and ch not in new.get('contains',[])]
  if kept_current_children:
   new.setdefault('contains',[]).extend(kept_current_children)
   if 'applicability'in current:
    assert set(current['applicability'])=={'jurisdiction'},'No unexplained current applicability metadata'
    jurisdictions=list(new.get('applicability',{}).get('jurisdiction',[]))
    for x in current['applicability']['jurisdiction']:
     if x not in jurisdictions:jurisdictions.append(x)
    new['applicability']={'jurisdiction':jurisdictions}
  # Root union preserves the existing current branch order and appends only
  # genuinely missing original-family candidate branches. Other clusters keep
  # their actual reviewed candidate ordering and current new terminal children.
  if gid=='442c31c5-c561-5c7a-90bb-2335d779175c':
   new['contains']=list(current['contains'])+[x for x in new['contains']if x not in current['contains']]
 changes=[x for x in set(current)|set(new)if current.get(x)!=new.get(x)]
 if changes:deltas.append({'goalId':gid,'actualChangedWholeGoalFields':sorted(changes),'wholeBeforeGoal':current,'wholeInactiveAfterGoal':new})
 after.append(new)
after.extend(deepcopy(g)for g in future['goals']if g['id']not in base)
out['goals']=after;assert len(after)==511
ob={g['id']:g for g in after}
for gid in liveextras:assert ob[gid]==base[gid],'Preserve current BW content and reviewed route bodies exactly'
assert not(set(base)-set(ob))
candidate=put(Path('candidate/current-whole511-398-B008.inactive.json'),out)
put(Path('checks/whole-current-basis-and-actual-candidate-goal-deltas.json'),{
 'schemaVersion':1,'role':'Whole actual current basis merge, not independent current context approval',
 'actualStartBindings':refs,'wholeOriginal504Candidate':ref(fp),'candidateWholeCanonical':candidate,
 'actualBeforeNodeCount':len(c['goals']),'actualCandidateNodeCount':len(after),
 'newChildGoalIds':sorted(set(ob)-set(base)),'oldCurrentGoalIdsRemoved':[],
 'actualWholeChangedExistingGoalRows':deltas,'currentSevenAdditionalBWNodesWholeExactIds':sorted(liveextras),
 'currentThreeReviewedPracticeEndpointsWholeExact':routeids,
 'currentM7GoalPageContextBindingsRemainSubjectToActualNormalDiffAndTargetedReview':True,
 'activeWrites':[],'strictGain':0,'humanApproval':False})
# Path-only before ledger and a separately declared current inactive kind input.
beforekind=deepcopy(k);beforekind['sourceLandscapePath']=str(P/'inputs/current-whole-active-canonical.exact.json');put(Path('candidate/before-current-semantic-kinds.path-only.json'),beforekind)
futurekind=read(fk);fkb={x['goalId']:x for x in futurekind['decisions']};kb={x['goalId']:x for x in k['decisions']}
newk=deepcopy(k);newk['sourceLandscapePath']=candidate['path'];newk['decisions']=[deepcopy(fkb.get(g['id'],kb.get(g['id'])))for g in after]
assert all(newk['decisions'])
# The ordinary actual fingerprint API will compute technical source bindings.
put(Path('candidate/current511.semantic-kinds.needs-normal-fingerprint.inactive.json'),newk)
materials=read(P/'materials/whole26-current-operative-materials-and-profiles.exact-assembly.json');ids=materials['goalIds']
visual=read(P/'assets/whole26-exact-current-raster-origin-and-binding-map.json');vby={x['goalId']:x for x in visual['rows']}
for gid in ids:assert ob[gid]['resourceLinks']==[vby[gid]['selectedResourceLink']]
# Only candidate selected image availability is installed; no independent
# machine/native visual authorization is fabricated by the author.
oldqa=read(OLD/'candidate/visualization-qa.current504.native-unapproved.json');oqb={x['goalId']:x for x in oldqa['records']}
newqa=deepcopy(qa);qby={x['goalId']:x for x in newqa['records']}
for gid in ids:
 x=deepcopy(oqb[gid]);x['landscapePath']=candidate['path'];x['canonicalAssetPath']=vby[gid]['wholeExactSelectedRaster']['ownExactCopy']['path']
 if gid in qby:newqa['records'][newqa['records'].index(qby[gid])]=x
 else:newqa['records'].append(x)
put(Path('candidate/current-whole-QA.native-unapproved.inactive.json'),newqa)
view={'viewId':'chemie-b008-current-whole-native-author-review-universe-20261010-v1','landscapeId':c['landscapeId'],'scope':{'schoolForm':'Gymnasium','stage':'CrossStage'},'rootNodes':[{'kind':'structure','id':'chemie-m7-review-root','label':'Chemie – kanonische M7-Prüfsicht','children':[{'kind':'canonicalSubtree','goalId':'442c31c5-c561-5c7a-90bb-2335d779175c'}]}]}
put(Path('native/full-current-review.view.json'),view)
current3=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-practical-terminal-route-author-candidate-v1/positive/current-three-whole-records.exact.jsonl')
current3copy=exact(current3,Path('inputs/current3-existing-whole-P.exact.jsonl'))
for word,n in [('nineteen',19),('seven',7)]:
 cfg=read(OLD/f'{word}-operative-native-preparation-v2/P{n}.actual-current-raster.ordinary-author-candidate.config.json')
 cfg['landscapePath']=candidate['path'];cfg['semanticKindLedgerPath']=str(P/'candidate/current511.semantic-kinds.inactive.json');cfg['reviewPath']=str(P/f'inputs/{word}-normal-P-records.exact.jsonl')
 put(Path(f'positive/current-P{n}-exact-body-normal-reuse.config.json'),cfg)
for state in ['before','after']:
 conf={'schemaVersion':1,'bookId':'chemie-b008-whole-current-context-author-20261010-v1','title':'Chemie – kanonische M7-Prüfsicht',
       'landscapePath':str(P/('inputs/current-whole-active-canonical.exact.json'if state=='before'else'candidate/current-whole511-398-B008.inactive.json')),
       'compositionViewPath':str(P/'native/full-current-review.view.json'),
       'semanticKindLedgerPath':str(P/('candidate/before-current-semantic-kinds.path-only.json'if state=='before'else'candidate/current511.semantic-kinds.inactive.json')),
       'goalVisualizationQaPath':str(P/('inputs/current-whole-active-QA.exact.json'if state=='before'else'candidate/current-whole-QA.native-unapproved.inactive.json')),
       'publicationMode':'review','atlasBaseUrl':'https://skillpilot.com/lernzielbuch','evidenceReviewPaths':[current3copy['ownExactCopy']['path']],
       'outputPath':str(P/f'native/{state}-whole-normal-book-model.actual.json')}
 if state=='after':conf['evidenceReviewPaths'] += [str(P/'inputs/nineteen-normal-P-records.exact.jsonl'),str(P/'inputs/seven-normal-P-records.exact.jsonl')]
 put(Path(f'native/{state}-whole-normal-book.config.json'),conf)
put(Path('checks/final-current-basis-start-bindings.actual.json'),{'schemaVersion':1,'actualStartBindings':[ref(cp),ref(kp),ref(qp)],'actualBaseNodeCount':487,'newNoncurricularRoutesPreserved':3,'expectedCandidateKindCountNotYetNormalProved':398,'activeWrites':[],'strictGain':0})
print(json.dumps({'actualBase':487,'actualCandidateNodes':len(after),'wholeExistingGoalDeltas':len(deltas),'newChildren':len(set(ob)-set(base)),'exactCurrentBWContentAndRouteNodes':len(liveextras),'activeWrites':0}))
