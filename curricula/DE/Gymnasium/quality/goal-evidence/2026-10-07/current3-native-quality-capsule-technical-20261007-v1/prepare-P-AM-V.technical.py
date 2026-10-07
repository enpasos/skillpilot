# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,shutil,os,hashlib,datetime,copy
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;Q=O.parent;I=O/'native-isolated-repository';A=Q/'biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2';RA=Q/'biologie-three-current-fresh-blind-a-20261007-v2';RB=Q/'biologie-two-current-native-fresh-independent-b-20261007-v1';N='11675f1a-5de2-5926-be78-1e8275f19f5b'
def rd(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def cp(a,b):b.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(a,b)
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p):return str(p.relative_to(R))
canon=I/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';ledger=I/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json';goal=next(x for x in rd(canon)['goals'] if x['id']==N)
a=rd(RA/'scientific-first-pass.sealed.json');b=rd(RB/'own.first-pass.judgments.json');an=next(x for x in a['judgments'] if x['goalId']==N);bn=next(x for x in b['goals'] if x['goalId']==N)
assert an['A']['status']=='atomic' and an['M']['status']=='no_memory_needed';print('Bjudgmentkeys',list(bn))
# Keep original B positive records and actual run byte for byte. A also independently sealed all six whole cases.
for f in ['positive.records.jsonl','positive.run.json']:cp(RB/'native-positive/outputs'/f,I/'outputs'/f)
profiles=[json.loads(x) for x in (I/'outputs/positive.records.jsonl').read_text().splitlines()];authorprofiles=[json.loads(x) for x in (A/'native-isolated-repository/outputs/positive-three.author.ai-candidates.jsonl').read_text().splitlines()]
for row in profiles:
 ar=next(x for x in authorprofiles if x['goalId']==row['goalId']);assert row['profile']==ar['profile'];assert row['profileFingerprint']==ar['profileFingerprint'];assert row['reviewInputFingerprint']==ar['reviewInputFingerprint'];assert row['status']=='needs_human_review' and row['reviewAuthority']=='ai_candidate'
config=rd(RB/'native-positive/config/positive.config.json');config.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',reviewCriteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',reviewPath='outputs/positive.records.jsonl',reviewRunManifestPaths=['outputs/positive.run.json']);write(I/'config/positive-three.paired-science.config.json',config)
future=copy.deepcopy(config);future.update(reviewPath=rel(I/'outputs/positive.records.jsonl'),reviewRunManifestPaths=[rel(I/'outputs/positive.run.json')]);write(O/'positive-three.future-active.config.json',future)
# Whole current 390 original A/M rows retained exactly; one actual paired-reviewed row appended.
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
payload={'goalId':N,'shortKey':goal.get('shortKey',''),'title':goal.get('title',''),'titleEn':goal.get('titleEn',''),'description':goal.get('description',''),'descriptionEn':goal.get('descriptionEn',''),'phase':goal.get('dimensionTags',{}).get('phase',''),'area':goal.get('dimensionTags',{}).get('area',''),'topicCode':goal.get('dimensionTags',{}).get('topicCode',''),'nodeKind':goal.get('nodeKind','')}
for lane,rule,status in [('semantic-atomicity','semantic-atomicity-v1','atomic'),('memory-card-review','memory-card-review-v1','no_memory_needed')]:
 fingerprint='sha256:'+hashlib.sha256(json.dumps({'ruleVersion':rule,**payload},sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
 original=R/f'curricula/DE/Gymnasium/quality/{lane}/canonical-biology-full.review.jsonl';old=original.read_bytes();assert len(old.decode().splitlines())==390 and N not in old.decode()
 row={'schemaVersion':1,'reviewId':'canonical-biology-full','ruleVersion':rule,'landscapeId':rd(canon)['landscapeId'],'goalId':N,'fingerprint':fingerprint,'status':status,'reviewedAt':now,'reviewer':'Technical synthesis of genuine independently sealed A/B scientific decisions; model version not exposed','reason':('A: '+an['rationale']['A']+' B: '+bn['atomicityAndMemoryRationale']) if lane=='semantic-atomicity' else ('A: '+an['rationale']['M']+' B: '+bn['atomicityAndMemoryRationale'])}
 if lane=='semantic-atomicity':row['semanticAtomic']=True
 else:row.update(memoryUseful=False,memoryGoalIds=[],deckIds=[])
 target=O/lane/'current391.review.jsonl';target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(old+json.dumps(row,ensure_ascii=False,separators=(',',':')).encode()+b'\n');assert target.read_bytes().startswith(old)
 cfg=rd(R/f'curricula/DE/Gymnasium/quality/{lane}/canonical-biology-full.config.json');cfg.update(landscapePath=rel(canon),reviewPath=rel(target));write(O/lane/'current391.inert.config.json',cfg)
# Complete actual-asset projection so native ledger generator can test V without production writes.
for helper in ['generateGoalVisualizationQaLedgers.ts','goalVisualizationQaModel.ts','goalVisualizationQualityDeferral.ts']:cp(R/'app/scripts'/helper,I/'app/scripts'/helper)
(I/'scripts').mkdir(exist_ok=True);cp(R/'scripts/goal_visualization_scope.mjs',I/'scripts/goal_visualization_scope.mjs')
for rootrel in ['app/public/assets/goal-visualizations/biologie','curricula/DE/Gymnasium/visualizations/biologie']:
 target=I/rootrel;target.mkdir(parents=True,exist_ok=True)
 for src in (R/rootrel).iterdir():
  dst=target/src.name
  if not dst.exists():dst.symlink_to(os.path.relpath(src.resolve(),dst.parent))
 new=target/N/f'{N}.png';new.parent.mkdir(parents=True,exist_ok=True)
 if not new.exists():cp(A/'selected-existing-images'/f'{N}.png',new)
qapath=I/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json';cp(R/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',qapath)
write(O/'paired-reviewed-P-AM-V-input-lineage.technical.json',{'documentType':'Exact prior390 A/M plus one actual paired scientific row; P3 originals retained','newGoalId':N,'original390AMBytesRetained':True,'pairedScienceSeals':[rel(RA/'scientific-first-pass.sealed.json'),rel(RB/'own.first-pass.freeze.json')],'originalP3RecordsAndRunExact':True,'actualScienceWholeBodiesAuthorAndBEqual':True,'actualAWholeCaseApprovalSealed':True,'humanApproval':False,'humanTrial':False,'activeWrites':False})
