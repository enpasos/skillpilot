# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,datetime,importlib.util
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;Q=O.parent;A=Q/'biologie-three-current-fresh-blind-a-20261007-v2';B=Q/'biologie-two-current-native-fresh-independent-b-20261007-v1'
def rd(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p):return str(p.relative_to(R))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def verify(p,wanted,base,keys):
 assert sha(p)==wanted,(str(p),'seal sha drift');f=rd(p);rows=next(f[k] for k in keys if k in f);assert rows
 for x in rows:
  target=base/x['path'];assert target.resolve().is_relative_to(R);assert sha(target)==x['sha256'].removeprefix('sha256:'),(str(target),'payload drift');assert target.stat().st_size==x['bytes']
 return {'path':rel(p),'sha256':wanted,'payloadCount':len(rows),'actualNoDigestDrift':True,'pathBase':'repository' if base==R else 'dossier'}
first=[verify(A/'scientific-first-pass.sealed.json','53988717760f3f42133cf5da4612aaf57c73227914c58bf6005eebe1e1b9b82c',R,['inputAndActualVisualBindings']),verify(B/'own.first-pass.freeze.json','d8bf2ed56fbbc4ca7009efac43f081b5635219b2ea56fa1fd133afa08070937f',R,['payloads'])]
final=[verify(A/'reviewer.final.freeze.json','edfd97a685406d3e5c0b9f814a98e53331c5bf4f42a7070d1ce86fc5e9eeae9d',A,['payloads']),verify(B/'reviewer.final.freeze.json','3cbfb46be7d316856ac5acaba0402ae85f64d5789cc7b8606eaef9ce372eba5f',B,['payloads'])]
checks=[]
for gate,name in [('D3','native-D3'),('P3','native-P3'),('A391','native-A391'),('M391','native-M391'),('Vnew','native-Vnew-current-approved'),('retainedD97P97','native-retained97-D-P-correct-established-field')]:
 p=O/f'{name}.actual.terminal.receipt.json';assert rd(p)['exitCode']==0;checks.append({'gate':gate,'path':rel(p),'sha256':sha(p)})
replacements=[]
for path,candidate in [('curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl',O/'semantic-atomicity/current391.review.jsonl'),('curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl',O/'memory-card-review/current391.review.jsonl'),('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json',O/'native-isolated-repository/curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'),('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',O/'central-registry.future-active.json')]:
 replacements.append({'path':path,'beforeSha256':sha(R/path),'candidatePath':rel(candidate),'candidateSha256':sha(candidate)})
groups=rd(O/'native-D3-exact-science-lineage.actual.json')['independenceGroupIds'];assert groups[0]!=groups[1]
cap={'documentType':'Root-delegated technically guarded current3 reviewed quality capsule; no active apply','authorFreezeSha256':'9056fca6021e5174b970aac17ddb444c40f0716ba70ba0d94307f6ed5015b45b','independentReviewerSeals':[{'path':x['path'],'sha256':x['sha256']} for x in first],'independenceGroupIds':groups,'additionalFinalSealVerification':final,'additionalFirstScienceSealVerification':first,'nativeChecks':checks,'boundedPConfigReplacements':rd(O/'bounded-current-P-config-replacements.technical.json')['boundedPConfigReplacements'],'additionalFileReplacements':replacements,'old390AMRecordsByteExact':True,'old390QARecordsExactIncludingHumanFields':True,'retained97CurrentNativeDPExact':True,'retainedBaseline95Except485':94,'retainedBio4Excepte70':3,'actualD3AndP3NoIdentifiersRelabeled':True,'new11675SourceScope':'BY EA bounded aggregate signal interpretation only; no complete source/clinical/patient acceptance claim','humanApproval':False,'humanTrial':False,'newScientificJudgments':False,'activeWrites':False,'centralStrictGain':0}
write(O/'review-capsule.current3.json',cap)
spec=importlib.util.spec_from_file_location('validate',R/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);errors=m.curriculum_symlink_errors(str(R));assert errors==[],errors
write(O/'portable-current3-capsule-links.actual.json',{'documentType':'Actual unchanged generic committable curriculum symlink guard','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'errors':errors,'exitCode':0,'newScientificJudgments':False})
print(json.dumps({'qualityCapsule':rel(O/'review-capsule.current3.json'),'genuineFirstSealsPayloads':[x['payloadCount'] for x in first],'genuineFinalSealsPayloads':[x['payloadCount'] for x in final],'nativeGates':'D3/P3/A391/M391/Vnew/retained97 PASS0','portableLinks':'PASS','activeWrites':False}))
