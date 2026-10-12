"""Apache-2.0. Exact-byte technical transport; no scientific judgment or active writes."""
from pathlib import Path
import json,hashlib,shutil,datetime
R=Path('/home/enpasos/projects/skillpilot')
E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
SRC=E/'chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5'
OUT=E/'chemie-q4-original-eleven-D9-technical-adoption-agent-20261013-v1'
sha=lambda p:'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
rd=lambda p:json.loads((R/p).read_text())
def put(p,d):
 q=R/p;assert not q.exists(),str(p);q.parent.mkdir(parents=True,exist_ok=True)
 q.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
assert not(R/OUT/'native-D11').exists()
freeze=rd(SRC/'FINAL.technical-preparation.freeze.json')
for row in freeze['fileInputs']:
 assert sha(Path(row['path']))=='sha256:'+row['sha256'].removeprefix('sha256:'),row['path']
 assert(R/row['path']).stat().st_size==row['bytes'],row['path']
cfgsrc=SRC/'configs/native-D11.batch.config.json';cfg=rd(cfgsrc);ids=cfg['goalIds']
held=['5169bb6b-f065-5798-8164-9b4521e44ae8','bef4c8eb-1d80-50fb-88cd-3a9904e38b4e']
assert len(ids)==11 and all(g in ids for g in held)
originalFiles=[]
for p in sorted((R/SRC/'native-D11').rglob('*')):
 assert not p.is_symlink(),str(p)
 if p.is_file():
  rel=p.relative_to(R);originalFiles.append({'source':str(rel),'relativeNativePath':str(p.relative_to(R/SRC/'native-D11')),'sha256':sha(rel),'bytes':p.stat().st_size})
shutil.copytree(R/SRC/'native-D11',R/OUT/'native-D11')
for x in originalFiles:
 dst=OUT/'native-D11'/x['relativeNativePath'];assert sha(dst)==x['sha256'];x['copy']=str(dst)
originalResults=[]
for tag in ['a','b']:
 roundp=OUT/'native-D11'/('round-'+tag)
 campaign=rd(roundp/'description-review-campaign.json')
 assert campaign['goalCount']==11 and campaign['reviewPass']=='first_pass' and campaign['blindToOtherReviews']
 assert campaign['batches'][0]['goalIds']==ids
 files=list((R/roundp/'results').glob('*.records.jsonl'));runs=list((R/roundp/'results').glob('*.run.json'))
 assert len(files)==len(runs)==1
 rows=[json.loads(line)for line in files[0].read_text().splitlines()if line.strip()]
 assert [x['goalId']for x in rows]==ids
 assert [x['goalId']for x in rows if x['decision']=='block']==held
 assert all(x['decision']=='keep'for x in rows if x['goalId']not in held)
 for p in files+runs:
  rel=p.relative_to(R);src=SRC/'native-D11'/p.relative_to(R/OUT/'native-D11')
  assert(R/src).read_bytes()==p.read_bytes()
  originalResults.append({'round':tag,'originalPath':str(src),'copiedPath':str(rel),'sha256':sha(rel),'bytes':p.stat().st_size})
cfg['outputDirectory']=str(OUT/'native-D11')
cfgpath=OUT/'configs/native-D11.original-D9.batch.config.json';put(cfgpath,cfg)
mp=OUT/'native-D11/batch-manifest.json';manifest=rd(mp)
oldTransport={k:manifest[k]for k in ['configPath','configDigest']}
manifest['configPath']=str(cfgpath);manifest['configDigest']=sha(cfgpath)
(R/mp).write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
put(OUT/'native-D11/synthesis-authoring.json',{'schemaVersion':1,'manifestId':'chemie-q4-original-eleven-paired-D9-two-deferred-technical-adoption-20261013-v1','synthesizedBy':'Codex technical integrator; exact original independent A/B first-pass records, no new scientific vote','decisions':[{'goalId':gid,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Die beiden unverändert kopierten unabhängigen Original-Erstprüfungen entscheiden KEEP für dieses Ziel am identischen nativen Elf-Ziele-Kontext. Diese technische Synthese übernimmt die vorhandenen Entscheidungen und wählt die vorhandene Nachweisformulierung aus RundeA. Kampagnen, elf Datensätze je Prüfer, Ausführungsmetadaten und Review-Fingerprints bleiben vollständig erhalten. Es wird keine neue fachliche Entscheidung, praktische Durchführung, menschliche Freigabe oder aktive Übernahme behauptet.','rationaleEn':'Both unchanged copied independent original first passes return KEEP for this goal in the identical native eleven-goal context. This technical synthesis adopts those existing decisions and selects existing evidence wording from roundA. Campaigns,all eleven records per reviewer,execution metadata and review fingerprints remain complete. No new scientific decision,practical execution,human approval or active adoption is claimed.'}for gid in ids if gid not in held],'deferredGoals':[{'goalId':gid,'rationaleDe':'Die beiden unverändert kopierten Original-Erstprüfungen entscheiden BLOCK. Dieses Ziel wird ausdrücklich von den neun strikten KEEP-Auflösungen zurückgestellt. Beide ursprünglichen Datensätze, der vollständige Elf-Ziele-Kontext und die originalen Gründe bleiben erhalten; diese technische Übernahme löst keinen Fachhold auf und erzeugt keine Freigabe.','rationaleEn':'Both unchanged copied original first passes return BLOCK. This goal is explicitly deferred from the nine strict KEEP resolutions. Both original records,the complete eleven-goal context and original reasons remain preserved; this technical adoption clears no scientific hold and creates no approval.'}for gid in ids if gid in held]})
(R/OUT/'.gitignore').write_text('!native-D11/bundle/book.html\n!native-D11/bundle/book.pdf\n')
put(OUT/'checks/FIRST.exact-original11-D9-transport.actual.json',{'schemaVersion':1,'writtenAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'bounded technical transport and original-decision adoption only','sourcePreparationFreeze':{'path':str(SRC/'FINAL.technical-preparation.freeze.json'),'sha256':sha(SRC/'FINAL.technical-preparation.freeze.json'),'frozenInputsVerified':len(freeze['fileInputs'])},'nativeOriginalFilesCopiedExactly':originalFiles,'originalResultAndRunCopies':originalResults,'originalGoalIds':ids,'pairedKeepGoalIds':[g for g in ids if g not in held],'deferredGoalIds':held,'campaignGoals':11,'recordsEachRound':11,'plannedStrictResolutions':9,'recordsFilteredOrRewritten':False,'batchManifestTransportOnly':{'changedFields':['configPath','configDigest'],'before':oldTransport,'after':{k:manifest[k]for k in ['configPath','configDigest']}},'batchConfigTransportOnly':{'originalPath':str(cfgsrc),'originalSha256':sha(cfgsrc),'copyPath':str(cfgpath),'copySha256':sha(cfgpath),'changedFields':['outputDirectory']},'newScientificVotes':0,'activeOrGitWrites':0,'HumanApproval':False,'HumanTrial':False})
print(json.dumps({'prepared':str(OUT),'nativeFilesCopied':len(originalFiles),'campaignGoals':11,'originalRecordsEachRound':11,'keep':9,'deferred':2,'activeWrites':False}))
