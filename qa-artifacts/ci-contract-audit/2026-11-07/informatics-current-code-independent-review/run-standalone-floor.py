from pathlib import Path
import json,gzip,hashlib,subprocess,time,copy
R=Path('/home/enpasos/projects/skillpilot');D=Path(__file__).resolve().parent;P=D.parent/'informatics-e-reviewed-current-definition-candidate';W=Path('/dev/shm/informatics-e-reviewed-current-20261107');h=lambda b:hashlib.sha256(b).hexdigest();owner='7d51b38c-a149-5407-bddc-d2ce7878b020'
policy=json.loads((R/'app/scripts/config/curriculum-maturity-floor-policy.json').read_bytes());policy['floors']=[p for p in policy['floors'] if p['landscapeId']==owner];assert len(policy['floors'])==1 and policy['floors'][0]['minimumMaturity']=='M6';(D/'bounded-real-info-floor-policy.json').write_text(json.dumps(policy,indent=2)+'\n')
native=json.loads(gzip.decompress((P/'native-current-producer.json.gz').read_bytes()));assert native['sourceSha256']=='50a26163a1934216727ee178f8b0d2740c2476f62482ce32911fecbf890654e8';assert [r['metrics']['weakExamData'] for r in native['readiness']]==[8,9]
row=policy['floors'][0];base={'curricula':[{'landscapeId':owner,'frameworkId':row['frameworkId'],'subject':row['subject'],'maturity':'M6','rules':[native['graph'],*native['readiness']]}]}
def forge_graph(a):
 r=a['curricula'][0]['rules'][0];r['status']='pass';r['details']=[];g=r['graphIntegrity'];g['ok']=True;g['findings']=[]
 for c in g['checks']:c['findingCount']=0;c['status']='pass'
 for k in ['findings','localRedundancies','transitiveRedundancies']:g['metrics'][k]=0
 return a
def forge_readiness(a):
 for r in a['curricula'][0]['rules'][1:]:
  r['status']='pass';r['details']=[];r['metrics']['weakExamData']=0;r['metrics']['discoveryIssues']=0;r['assessmentValidation']['failingGoalIds']=[];r['assessmentValidation']['discoveryIssues']=[]
 return a
cases=[('graph-shaped-pass-with-honest-material',forge_graph(copy.deepcopy(base)),False),('honest-graph-with-forged-material',forge_readiness(copy.deepcopy(base)),False),('passing-shaped-graph-with-forged-material',forge_readiness(forge_graph(copy.deepcopy(base))),True)]
cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp']
for rel in ['app/scripts','app/src','contracts/curriculum-assessment-coverage']:cmd+=['--ro-bind',str(W/'native-code'/rel),str(R/rel)]
for row in json.loads((P/'changed-files.json').read_bytes())['files']:
 rel=row['path']
 if rel.startswith(('app/scripts/','contracts/curriculum-assessment-coverage/')):continue
 cmd+=['--ro-bind',str(W/'candidate'/rel),str(R/rel)]
cmd+=['--ro-bind',str(D/'bounded-real-info-floor-policy.json'),str(R/'app/scripts/config/curriculum-maturity-floor-policy.json')]
records=[]
for label,artifact,accepted in cases:
 file=D/(label+'.json');file.write_text(json.dumps(artifact,indent=2)+'\n')
 full=cmd+['--ro-bind',str(file),str(R/'docs/qa-ci/status/curriculum-quality-status.json'),'--setenv','TSX_DISABLE_CACHE','1','--setenv','TMPDIR','/tmp','--chdir',str(R),'--',str(R/'app/node_modules/.bin/tsx'),str(R/'app/scripts/checkCurriculumMaturityFloors.ts')]
 t=time.time();p=subprocess.run(full,capture_output=True,text=True);(D/(label+'.stdout')).write_text(p.stdout);(D/(label+'.stderr')).write_text(p.stderr)
 receipt={'label':label,'command':full,'startUnix':t,'endUnix':time.time(),'exitCode':p.returncode,'accepted':p.returncode==0,'expectedObservationAccepted':accepted,'stdoutSha256':h(p.stdout.encode()),'stderrSha256':h(p.stderr.encode()),'floorProgramUnmodified':True,'freshSourceDiscovery':True,'sourceBytesUnchanged':True,'policy':'Exact active Informatics M6 entry only; unrelated floors omitted to bound the process','fullCqr':False}
 (D/(label+'.receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n');records.append({k:v for k,v in receipt.items() if k!='command'});print(label,p.returncode,p.stdout,p.stderr[-1200:]);assert (p.returncode==0)==accepted
 if label=='graph-shaped-pass-with-honest-material':assert 'no complete passing assessment reports' in p.stderr
 if label=='honest-graph-with-forged-material':assert 'no complete passing assessment reports' not in p.stderr
(D/'standalone-floor-results.json').write_text(json.dumps({'status':'HOLD_REPRODUCED','nativeMaterialFailureCounts':[8,9],'falseClaimedMaturity':'M6','sourceSha256':native['sourceSha256'],'cases':records},indent=2)+'\n')
