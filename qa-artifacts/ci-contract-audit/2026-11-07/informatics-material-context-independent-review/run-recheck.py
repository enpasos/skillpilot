from pathlib import Path
import json,subprocess,time,hashlib,shutil
R=Path('/home/enpasos/projects/skillpilot');D=Path(__file__).resolve().parent;W=Path('/dev/shm/informatics-material-context-20261107');P=D.parent/'informatics-material-context-bound-candidate';S=Path('/dev/shm/informatics-material-context-review-20261107');S.mkdir(exist_ok=True);h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
base=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp']
for rel in ['app/scripts','app/src','contracts/curriculum-assessment-coverage']:base+=['--ro-bind',str(W/'native-code'/rel),str(R/rel)]
for row in json.loads((P/'changed-files.json').read_bytes())['files']:
 rel=row['path']
 if rel.startswith(('app/scripts/','contracts/curriculum-assessment-coverage/')):continue
 base+=['--ro-bind',str(W/'candidate'/rel),str(R/rel)]
def run(label,cmd):
 t=time.time();p=subprocess.run(cmd,capture_output=True,text=True);out=D/(label+'.stdout');err=D/(label+'.stderr');out.write_text(p.stdout);err.write_text(p.stderr)
 rec={'label':label,'command':cmd,'startUnix':t,'endUnix':time.time(),'exitCode':p.returncode,'stdoutSha256':h(out),'stderrSha256':h(err),'activeInputsReadOnly':True,'networkDisabled':True};(D/(label+'.receipt.json')).write_text(json.dumps(rec,indent=2)+'\n');print(label,p.returncode,flush=True);return p,rec
ending=['--setenv','TSX_DISABLE_CACHE','1','--setenv','TMPDIR','/tmp','--chdir',str(R),'--',str(R/'app/node_modules/.bin/tsx')]
floorResults=[]
for case in json.loads((P/'standalone-floor-results.json').read_bytes())['cases']:
 label=case['label'];a=W/'floor-cases'/(label+'.json');assert h(a)==case['artifactSha256']
 cmd=base+['--ro-bind',str(W/'floor-cases/policy.json'),str(R/'app/scripts/config/curriculum-maturity-floor-policy.json'),'--ro-bind',str(a),str(R/'docs/qa-ci/status/curriculum-quality-status.json')]+ending+[str(R/'app/scripts/checkCurriculumMaturityFloors.ts')]
 p,rec=run('recheck-'+label,cmd);assert p.returncode==1 and 'no complete passing assessment reports' in p.stderr
 floorResults.append({'label':label,'exitCode':p.returncode,'assessmentFailurePresent':True,'artifactSha256':h(a),'sameInputAsCandidateEvidence':True})
for label,entry in [('existing-current15','testInformaticsCurrentDefinitionRevision.ts'),('existing-T21-T22-chain','testRetainedAssessmentCoverageChain.ts')]:
 p,rec=run(label,base+['--bind',str(S),str(R/'tmp')]+ending+[str(R/'app/scripts'/entry)]);assert p.returncode==0,p.stderr
for name in ['overlay-evidence.json','synthetic-binding-evidence.json']:
 shutil.copyfile(S/'retained-assessment-chain-fixture'/name,D/name)
(D/'recheck-results.json').write_text(json.dumps({'status':'PASS_H1_CLOSED','standaloneFloorCases':floorResults,'currentRevisionGroups':15,'currentRevisionExitCode':0,'existingNativeChainExitCode':0,'fullCqr':False,'sourceAProbes':False,'newProductionCode':False},indent=2)+'\n')
