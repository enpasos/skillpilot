# SPDX-License-Identifier: Apache-2.0
"""Import actual sealed KEEP records, then run ordinary D synthesis in scratch.

Requires a root-provided JSON request with first/second objects containing
sealPath, sealSha256, recordsPath, recordsSha256, runPath, runSha256.
No record bytes are rewritten. No active file or Git operation is performed.
"""
from pathlib import Path
import json,hashlib,copy,shutil,re,os,subprocess,sys
OUT=Path(__file__).resolve().parent.parent;ROOT=OUT.parents[6];AP=str(OUT.relative_to(ROOT));E12=OUT.parent
TECH=E12/'biologie-basiskonzepte-0beb-stomata-underside-one-image-technical-preparation-20261012-v1';CAP=ROOT/'tmp/biologie-0beb-underside-normal-preparation-20261012-v1';G='0beb4ca2-2437-557a-9db2-ccda1cbcfa0a'
def path(p):
    q=(ROOT/p).resolve();assert q.is_relative_to(ROOT);return q
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,data):
    p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
assert len(sys.argv)==2,'Usage: python import-actual-D-and-finalize.py <root-actual-D-import-request.json>'
request=read(path(sys.argv[1]));assert set(request)=={'first','second'}
for row in read(TECH/'FINAL.technical-preparation.freeze.json')['ownFiles']:assert sha(ROOT/row['path'])==row['sha256']
imports=[]
for role,directory in [('first','round-a'),('second','round-b')]:
    spec=request[role];seal_path=path(spec['sealPath']);assert sha(seal_path)==spec['sealSha256'];seal=read(seal_path);owned=seal.get('ownFiles',seal.get('files'));assert isinstance(owned,list)
    owned_paths={}
    for row in owned:
        p=path(row['path']);assert sha(p)==row['sha256'];owned_paths[str(p)]=row['sha256']
    records_path=path(spec['recordsPath']);run_path=path(spec['runPath']);assert str(records_path) in owned_paths and str(run_path) in owned_paths
    assert sha(records_path)==spec['recordsSha256'] and sha(run_path)==spec['runSha256']
    campaign_path=OUT/'native-D1'/directory/'description-review-campaign.json';campaign=read(campaign_path);inp=read(OUT/'native-D1'/directory/'description-review-input.json');assert campaign['reviewPass']=='first_pass' and campaign['blindToOtherReviews'] and campaign['goalCount']==1
    rows=[json.loads(l) for l in records_path.read_bytes().splitlines() if l.strip()];assert len(rows)==1;record=rows[0];run=read(run_path);goal=inp['goals'][0];assert record['goalId']==G and record['decision']=='keep'
    for key in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:assert record[key]==goal[key],key
    assert record['bundleFingerprint']==inp['bundleFingerprint'] and record['bookDigest']==inp['bookDigest']
    assert record['campaignId']==campaign['campaignId'] and record['roundId']==campaign['roundId']
    assert run['status']=='completed' and run['runId']==record['runId'] and run['outputDigest']==sha(records_path)
    assert run['independenceGroupId']==campaign['independenceGroupId'] and run['blindToOtherRuns'] is True
    batch=campaign['batches'][0];assert run['batchId']==batch['batchId'];assert run['goalIds']==[G]
    expected_input=OUT/'native-D1'/directory/'batches'/(batch['batchId']+'.input.jsonl')
    # The standard validator subsequently verifies the complete current context,
    # declared input artifacts, batch bytes, schema and first-pass provenance.
    results=OUT/'native-D1'/directory/'results'
    target_records=results/(batch['batchId']+'.records.jsonl');target_run=results/(batch['batchId']+'.run.json')
    if list(results.iterdir()):
        assert {p.name for p in results.iterdir()}=={target_records.name,target_run.name}
        assert sha(target_records)==sha(records_path) and sha(target_run)==sha(run_path),'refuse to replace imported actual result bytes'
    else:
        shutil.copyfile(records_path,target_records);shutil.copyfile(run_path,target_run)
    assert sha(target_records)==sha(records_path) and sha(target_run)==sha(run_path)
    imports.append({'role':role,'sealPath':spec['sealPath'],'sealSha256':spec['sealSha256'],'recordsSourcePath':spec['recordsPath'],'recordsSourceSha256':spec['recordsSha256'],'recordsImportedPath':str(target_records.relative_to(ROOT)),'runSourcePath':spec['runPath'],'runSourceSha256':spec['runSha256'],'runImportedPath':str(target_run.relative_to(ROOT)),'campaignInputSha256':sha(OUT/'native-D1'/directory/'description-review-input.json'),'runId':run['runId'],'actualDecision':'keep','recordAndRunBytesRewritten':False})
assert imports[0]['runId']!=imports[1]['runId']
write(OUT/'prepared-plan/ACTUAL.sealed-D-result-byte-import.json',{'imports':imports,'goalId':G,'technicalRoleOnly':True,'newScientificVotes':0,'activeOrGitWrites':False})
assert CAP.is_dir(),'existing skinny normal preparation capsule is required'
pending=[Path('app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts'),Path('app/scripts/materializeGoalDescriptionRolloutResolutions.ts')];seen=set();code=[]
while pending:
    p=pending.pop()
    if p in seen:continue
    seen.add(p);src=ROOT/p;assert src.is_file();dst=CAP/p;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);code.append({'path':str(p),'sha256':sha(src)})
    if p.suffix not in ['.ts','.tsx','.mts','.mjs','.js']:continue
    for a,b in re.findall(r"(?:from\s+['\"]([^'\"]+)['\"]|import\s*['\"]([^'\"]+)['\"])",src.read_text()):
        ref=a or b
        if not ref.startswith('.'):continue
        q=Path(os.path.normpath(str(p.parent/ref)));options=[q]+[Path(str(q)+e) for e in ['.ts','.tsx','.mts','.mjs','.js','.json']]+[q/'index.ts',q/'index.tsx'];found=next((x for x in options if (ROOT/x).is_file()),None);assert found is not None;(pending.append(found))
shutil.copytree(OUT/'native-D1',CAP/AP/'native-D1',dirs_exist_ok=True)
config=OUT/'configs/D1.relocated.batch.config.json';target_config=CAP/AP/'configs/D1.relocated.batch.config.json';target_config.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(config,target_config)
authoring={'schemaVersion':1,'manifestId':'biologie-0beb-underside-actual-dual-keep-synthesis-20261012-v1','synthesizedBy':'Codex technical integrator; standard synthesis of actual separately sealed independent current KEEP records, no new scientific vote','decisions':[{'goalId':G,'resolutionDecision':'keep_current','evidenceRound':'first','rationaleDe':'Technische Zusammenführung zweier tatsächlich abgeschlossener, separat versiegelter unabhängiger Erstprüfungen des identischen ganzen aktuellen Ziels, der aktuellen nativen Seite und des vollständigen Kontextes. Beide Originalrecords urteilen KEEP; alle Record- und Runbytes bleiben unverändert. Keine neue Fachprüfung, Lernendenleistung oder menschliche Freigabe behauptet.','rationaleEn':'Technical synthesis of two actually completed, separately sealed independent first-pass reviews of the identical whole current goal, actual native page and full context. Both original records decide KEEP; record and run bytes remain exact. No new scientific review, learner performance or human approval claimed.'}]}
author_path=OUT/'prepared-plan/ACTUAL.dual-keep-synthesis-authoring.json';write(author_path,authoring);cap_author=CAP/AP/'prepared-plan/ACTUAL.dual-keep-synthesis-authoring.json';cap_author.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(author_path,cap_author)
commands=read(OUT/'prepared-plan/ACTUAL.normal-D-finalization-commands.json') if (OUT/'prepared-plan/ACTUAL.normal-D-finalization-commands.json').exists() else []
def run(label,args):
    r=subprocess.run([str(ROOT/'app/node_modules/.bin/tsx')]+args,cwd=CAP,capture_output=True,text=True);attempt=1+sum(c['label']==label for c in commands);name=label+(f'.attempt-{attempt}' if attempt>1 else '')+'.actual.txt';log=OUT/'prepared-plan/checks'/name;log.parent.mkdir(parents=True,exist_ok=True);assert not log.exists();log.write_text(r.stdout+r.stderr);commands.append({'label':label,'attempt':attempt,'command':[str(ROOT/'app/node_modules/.bin/tsx')]+args,'workingDirectory':str(CAP.relative_to(ROOT)),'exitCode':r.returncode,'outputPath':str(log.relative_to(ROOT))});write(OUT/'prepared-plan/ACTUAL.normal-D-finalization-commands.json',commands)
    if r.returncode:raise RuntimeError(label+' failed: '+(r.stdout+r.stderr)[-2000:])
cfg=AP+'/configs/D1.relocated.batch.config.json'
run('summarize',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write'])
run('synthesis-manifest',['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',AP+'/prepared-plan/ACTUAL.dual-keep-synthesis-authoring.json','--write'])
run('resolutions',['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',AP+'/native-D1/synthesis-decisions.json','--write'])
run('finalize',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write'])
for src in (CAP/AP/'native-D1').rglob('*'):
    if not src.is_file():continue
    dst=OUT/'native-D1'/src.relative_to(CAP/AP/'native-D1')
    if dst.exists():assert src.read_bytes()==dst.read_bytes(),str(dst)
    else:dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
index=read(OUT/'native-D1/resolution-index.json');assert index['batchGoalIds']==[G] and len(index['resolutions'])==1 and index['resolutions'][0]['strictDescriptionComplete'] is True
for row in read(TECH/'FINAL.technical-preparation.freeze.json')['ownFiles']:assert sha(ROOT/row['path'])==row['sha256']
write(OUT/'prepared-plan/ACTUAL.normal-D1-finalization.json',{'actualImportedResults':imports,'normalCommands':commands,'exactNormalCodeCopies':code,'resolutionIndexPath':AP+'/native-D1/resolution-index.json','resolutionIndexSha256':sha(OUT/'native-D1/resolution-index.json'),'normalResolvedGoalCount':1,'newScientificVotesByThisIntegrator':0,'peerRecordRunBytesPreserved':True,'technical96SealUnchanged':True,'activeOrGitWrites':False})
print(json.dumps({'normalResolvedGoals':1,'normalCommands':4,'allExitCodes0':True,'resolutionIndex':AP+'/native-D1/resolution-index.json','activeOrGitWrites':False}))
