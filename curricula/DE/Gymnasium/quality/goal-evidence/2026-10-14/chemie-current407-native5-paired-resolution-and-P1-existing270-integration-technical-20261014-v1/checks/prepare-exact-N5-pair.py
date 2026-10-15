# Apache-2.0. Technical transport of genuine, already sealed independent science.
from pathlib import Path
import hashlib,json,shutil,datetime
repo=Path.cwd()
base=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
own=base/'chemie-current407-native5-paired-resolution-and-P1-existing270-integration-technical-20261014-v1'
shared=base/'chemie-current407-Q3-four-plus2652-PE-shared-native5-first-pass-technical-20261014-v1'
a=base/'chemie-current407-Q3-four-plus2652-PE-native5-independent-a-root-20261014-v1'
b=base/'chemie-current407-Q3-four-plus2652-PE-native5-independent-b-20261014-v1'
def read(p):return json.loads(p.read_text())
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,j):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
bindings=[]
for root,seal in [(a,'SEAL.finite-native5-independent-a-root-after-stock-PASS.actual.json'),(b,'SEAL.finite-native5-independent-b-after-stock-PASS.actual.json')]:
 for f in read(root/seal)['files']:
  p=Path(f['path']);p=p if p.exists() else root/p
  assert digest(p)==f['sha256'],p
 bindings.append({'path':str(root/seal),'sha256':digest(root/seal)})
assert digest(b/'FIRST-SCIENCE-SEAL.nativeD5-independent-b.actual.json')=='sha256:ddee1b4398f16820ad0c5857e1067ce6453df99352f4d7abae6fe8a41670d9fe'
sa=read(a/'SCIENTIFIC.native5-full-eleven-cases-and-PE-operator.first-a.actual.json')
sb=read(b/'judgments/SCIENCE.first-native5-whole-current-D-and-eleven-cases.independent-b.actual.json')
assert all(d['decision']=='keep' for s in [sa,sb] for d in s['decisions'])
cfg=read(shared/'configs/native-five.shared-identical-first-pass.batch.config.json')
cfg['outputDirectory']=str(own/'native-five')
config=own/'native-five.inactive-copy.batch.config.json'
write(config,cfg)
shutil.copytree(shared/'native-five',own/'native-five',dirs_exist_ok=False)
manifest=read(own/'native-five/batch-manifest.json')
before=json.loads(json.dumps(manifest))
manifest['configPath']=str(config);manifest['configDigest']=digest(config)
write(own/'native-five/batch-manifest.json',manifest)
copies=[]
batch=manifest['artifacts']['rounds']['first']['batchId']
for round,srcs in [('a',[a/'description-review.records.first-science-a.jsonl',a/'description-review.run.first-science-a.json']),('b',list((b/'round-b/results').glob('*')))]:
 target=own/f'native-five/round-{round}/results';target.mkdir(exist_ok=True)
 bid=manifest['artifacts']['rounds']['first' if round=='a' else 'second']['batchId']
 for src in srcs:
  suffix='records.jsonl' if src.suffix=='.jsonl' else 'run.json'
  dst=target/f'{bid}.{suffix}';shutil.copyfile(src,dst)
  assert dst.read_bytes()==src.read_bytes()
  copies.append({'source':str(src),'target':str(dst),'sha256':digest(dst)})
authoring={'schemaVersion':1,'manifestId':cfg['batchId']+'-technical-paired-synthesis','synthesizedBy':'Codex technical integrator; no new scientific vote','decisions':[{'goalId':g,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Technische Synthese der beiden unveränderten, unabhängig erstversiegelten aktuellen FIRST_PASS-KEEP-Records. Ganze aktuelle Beschreibung, Kontext, native Seite und vollständige Fälle wurden von A und B geprüft; keine neue wissenschaftliche Stimme und keine Quellen- oder Human-Freigabe.','rationaleEn':'Technical synthesis of both unchanged independently first-sealed current FIRST_PASS KEEP records. A and B reviewed the whole current description, context, native page and full cases; no new scientific vote, source approval or human approval.'} for g in cfg['goalIds']]}
write(own/'native-five/synthesis-authoring.technical-no-new-vote.json',authoring)
write(own/'INPUTS.exact-independent-seals-and-original-metadata-transport.actual.json',{'schemaVersion':1,'startedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'seals':bindings,'originalPreparedBatch':{'path':str(shared/'native-five/batch-manifest.json'),'sha256':digest(shared/'native-five/batch-manifest.json')},'ownedBatchManifestTechnicalTransport':{'before':before,'after':manifest,'changedKeysOnly':['configPath','configDigest'],'outputDirectoryOnlyConfigChange':True},'originalRecordsAndRunsByteExact':copies,'newScientificVotes':0,'newPEEvidenceLevel':'E0','newPEMaximumClaimScope':'G0','wholeHB021Approved':False,'activeWrites':False})
print(json.dumps({'copiedExactRunsAndOutputs':len(copies),'goalCount':len(cfg['goalIds']),'config':str(config)}))
