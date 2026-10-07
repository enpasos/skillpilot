# SPDX-License-Identifier: Apache-2.0
import json,re,shutil,hashlib
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2';B=O/'native-isolated-repository';T=B/'outputs/prepared-three';T.mkdir(exist_ok=True)
def rd(p):return json.loads(p.read_text())
def wr(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def stable(v):return json.dumps(v,ensure_ascii=False,separators=(',',':'),sort_keys=True)
def sh(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
# Exact native copied import closure; no source helper edits.
seen=set()
def cphelper(p):
 if p in seen:return
 seen.add(p);dest=B/p.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
 for v in re.findall(r"(?:from|import)\s*['\"](\.[^'\"]+)['\"]",p.read_text()):
  q=(p.parent/v).resolve()
  if q.suffix not in ['.ts','.tsx']:q=q.with_suffix('.ts')
  if q.is_file() and q.is_relative_to(R/'app/scripts'):cphelper(q)
cphelper(R/'app/scripts/materializeGoalDescriptionRolloutBatch.ts')
shutil.copytree(O/'native-three/bundle',T/'bundle',dirs_exist_ok=True)
shutil.copyfile(T/'bundle/review-bundle-manifest.json',T/'bundle/manifest.json')
rounds=[]
for letter in ['a','b']:
 shutil.copytree(O/'native-three'/('fresh-blind-round-'+letter),T/('round-'+letter),dirs_exist_ok=True)
 c=rd(T/('round-'+letter)/'description-review-campaign.json');batch=c['batches'][0]
 rounds.append({'directory':'round-'+letter,'campaignId':c['campaignId'],'campaignDigest':sh(stable(c).encode()),'roundId':c['roundId'],'independenceGroupId':c['independenceGroupId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint']})
m=rd(T/'bundle/book-model.json');bundle=rd(T/'bundle/manifest.json');inp=rd(T/'round-a/description-review-input.json');base=rd(B/'outputs/full-current391.book-model.json')
cfg={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'biology-three-source-native-prepared-v2-20261007','subject':'biologie','subjectLabel':'Biologie','bookId':m['book']['id'] if 'id' in m['book'] else m['book']['bookId'],'title':m['book']['title'],'baseGoalBookConfigPath':'config/current391.book.config.json','goalIds':[p['goalId'] for p in m['pages']],'outputDirectory':'outputs/prepared-three','feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'outputs/prepared-three/bundle/prompt.md','criteriaPath':'outputs/prepared-three/bundle/criteria.md','publicRoot':'app/public','printDerivativeProfile':'bounded-atlas'};wr(B/'config/native-three.prepared.config.json',cfg);configbytes=(B/'config/native-three.prepared.config.json').read_bytes()
manifest={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json','schemaVersion':1,'validationContract':'goal-description-rollout-batch-v1','batchId':cfg['batchId'],'subject':'biologie','subjectLabel':'Biologie','configPath':'config/native-three.prepared.config.json','configDigest':sh(configbytes),'goalIds':cfg['goalIds'],'curriculumAtomicDenominatorAtPreparation':391,'source':{'baseGoalBookConfigPath':cfg['baseGoalBookConfigPath'],'landscapePath':m['source']['landscapePath'],'landscapeId':m['book']['landscapeId'],'baseBookDigest':base['digest']},'artifacts':{'bundleDirectory':'bundle','bookModelPath':'bundle/book-model.json','bookModelDigest':m['digest'],'bundleManifestPath':'bundle/manifest.json','bundleFingerprint':bundle['bundleFingerprint'],'reviewInputFingerprint':inp['reviewInputFingerprint'],'rounds':{'first':rounds[0],'second':rounds[1]}},'reviewPolicy':{'oneBatchPerRound':True,'blindIndependentFirstPass':True,'aiRecordsAreCandidatesOnly':True,'automaticAcceptance':False}};wr(T/'batch-manifest.json',manifest)
wr(O/'native-copied-helper-closure-and-prepared-pair.author.json',{'copiedNativeHelpers':[{'sourcePath':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(seen)],'allHelperBytesExact':True,'preparedPairDirectory':'native-isolated-repository/outputs/prepared-three','noReviewerRecordsOrRuns':True})
print(len(seen),'helpers copied exactly')
