"""Bind actual fresh independent round B and explicit native D successors."""
from pathlib import Path
import json,hashlib,shutil,datetime
M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;R=O/'isolated-root-with-current-D-v2';B=Path('curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/approved-existing-math9-safe-portable-v1');D=B/'current-D/native-nine';P=M/'tmp/cross-subject-requires/approved-existing-math-nine-safe-subset-independent-peer-20261015-v1/fresh-D-round-b'
def read(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(M)),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def put(p,j):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(j,f,ensure_ascii=False,indent=2);f.write('\n')
camp=read(R/D/'round-b/description-review-campaign.json');bn=camp['batches'][0]['batchId'];preserved=[]
for n,h,target in [('description-records.actual.jsonl','sha256:9537dd32314250d4c4afb413e29f42995691c57776d9a1c62f7b615bde7ca7bc',bn+'.records.jsonl'),('run.actual.json','sha256:0178ec868d08beb44ea7edbf1eb765f0297f49406a236f73b9e0cc6df3635e74',bn+'.run.json')]:
 s=P/n;assert bind(s)['sha256']==h;t=R/D/'round-b/results'/target;t.parent.mkdir(exist_ok=True);assert not t.exists();shutil.copyfile(s,t);preserved.append({'originalIndependentFile':bind(s),'actualNativeBoundFile':bind(t),'judgmentBytesUnchanged':True})
# Preserve the actual independent sidecar as well, including its true prior context.
for p in P.iterdir():
 if p.is_file():t=R/B/'independent-current-D'/p.name;t.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,t)
put(O/'actual-fresh-independent-D-round-b-binding.json',{'actualIndependentPeer':'/root/eight_scope_guard_successor_independent_peer','recordedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':preserved,'noJudgmentOrReviewIdentityRewritten':True})
a=[json.loads(x) for x in (R/D/'round-a/results'/camp['batches'][0]['batchId'].replace('first-pass-b','first-pass-a')).with_suffix('.records.jsonl').read_text().splitlines()] if False else [json.loads(x) for x in next((R/D/'round-a/results').glob('*.records.jsonl')).read_text().splitlines()]
b=[json.loads(x) for x in (P/'description-records.actual.jsonl').read_text().splitlines()];assert [x['goalId'] for x in a]==[x['goalId'] for x in b]
for x,y in zip(a,b):assert x['decision']==y['decision']=='keep'
# Actual synthesis after seeing both separately completed D rounds. Select the
# independent peer's evidence chain, preserving the author chain and all limits.
put(R/B/'current-D/synthesis-authoring.actual.json',{'schemaVersion':1,'manifestId':'physics-existing-math9-safe-current-D-synthesis-20261015-v1','synthesizedBy':'/root/portable_eight_scope_and_guard_successor_author; fresh actual AI synthesis after two new informed D rounds; configured same model, report_only','decisions':[{'goalId':x['goalId'],'resolutionDecision':'keep_current','evidenceRound':'second','rationaleDe':'Die beiden getrennten neuen D-Runden beurteilen die unveränderte aktuelle DE/EN-Beschreibung bei ihren tatsächlich erweiterten direkten Voraussetzungen jeweils als beizubehalten. Ich übernehme die konkrete Verständniskette der unabhängigen zweiten Runde: '+y['understandingEvidence']['essentialUnderstandingDe']+' Die vollständigen aktuellen P- und Mathematikprofile wurden als getrennte Kontextbelege gelesen; begrenzte Quellen- und Platzierungsnachweise werden nicht zu neuer bundesweiter Freigabe erhöht.','rationaleEn':'Both separate new D rounds retain the unchanged current German and English description under its actual expanded direct prerequisites. I select the independent second round’s concrete understanding chain: '+y['understandingEvidence']['essentialUnderstandingEn']+' Complete current P and Mathematics profiles were read as separate context evidence; bounded source and placement evidence is not promoted into new nationwide approval.'} for x,y in zip(a,b)]})
print('Bound exact fresh independent D9 and authored explicit synthesis')
