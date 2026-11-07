from pathlib import Path
import json,subprocess,time,hashlib,shutil
R=Path('/home/enpasos/projects/skillpilot');D=Path(__file__).resolve().parent;W=Path('/dev/shm/curriculum-material-context-20261107');P=D.parent/'curriculum-material-context-candidate';S=Path('/dev/shm/curriculum-material-context-review-20261107');S.mkdir(exist_ok=True);h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
base=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp']
for rel in ['app/scripts','app/src','contracts/curriculum-assessment-coverage']:base+=['--ro-bind',str(W/'native-code'/rel),str(R/rel)]
for p in sorted((W/'candidate/curricula').rglob('*.json')):base+=['--ro-bind',str(p),str(R/p.relative_to(W/'candidate'))]
ending=['--setenv','TSX_DISABLE_CACHE','1','--setenv','TMPDIR','/tmp','--chdir',str(R),'--',str(R/'app/node_modules/.bin/tsx')]
def run(label,cmd):
 t=time.time();p=subprocess.run(cmd,capture_output=True,text=True);out=D/(label+'.stdout');err=D/(label+'.stderr');out.write_text(p.stdout);err.write_text(p.stderr)
 rec={'label':label,'command':cmd,'startUnix':t,'endUnix':time.time(),'exitCode':p.returncode,'stdoutSha256':h(out),'stderrSha256':h(err),'activeInputsReadOnly':True,'networkDisabled':True};(D/(label+'.receipt.json')).write_text(json.dumps(rec,indent=2)+'\n');print(label,p.returncode,flush=True);return p,rec
cases=json.loads((P/'german-standalone-results.json').read_bytes())['cases'];selected=['fresh-native-german-M6-positive','exact-previous-draft-source-and-old-M6-falsepass','draft-source-with-fresh-baseline-M6'];floorResults=[]
for label in selected:
 case=next(c for c in cases if c['label']==label);source=W/case['sourceFile'];a=W/case['artifactFile'];assert h(a)==case['artifactSha256'] and h(source)==case['sourceSha256']
 cmd=base+['--ro-bind',str(W/'german-cases/policy.json'),str(R/'app/scripts/config/curriculum-maturity-floor-policy.json'),'--ro-bind',str(source),str(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json'),'--ro-bind',str(a),str(R/'docs/qa-ci/status/curriculum-quality-status.json')]+ending+[str(R/'app/scripts/checkCurriculumMaturityFloors.ts')]
 p,rec=run('recheck-'+label,cmd);assert p.returncode==case['expectedExitCode'];assert 'no complete passing strict graph-integrity report' not in p.stderr
 if p.returncode:assert 'no complete passing assessment reports' in p.stderr
 floorResults.append({'label':label,'exitCode':p.returncode,'assessmentFailurePresent':p.returncode==1,'artifactSha256':h(a),'sourceSha256':h(source),'graphEdited':False})
p,rec=run('normal-assessment-entry',base+['--bind',str(S),str(R/'tmp')]+ending+[str(R/'app/scripts/testCurriculumExamReadiness.ts')]);assert p.returncode==0,p.stderr
shutil.copyfile(S/'retained-assessment-chain-fixture/overlay-evidence.json',D/'native-Info-chain-evidence.json')
(D/'recheck-results.json').write_text(json.dumps({'status':'PASS_COMMON_MATERIAL_BINDING_RECHECK','independentStandaloneCases':floorResults,'normalAssessmentEntryExitCode':0,'fullCqr':False,'sourceAProbes':False,'newProductionCode':False},indent=2)+'\n')
