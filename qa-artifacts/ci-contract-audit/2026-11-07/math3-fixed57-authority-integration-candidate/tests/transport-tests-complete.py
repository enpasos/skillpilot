from pathlib import Path
import os,json,sys,subprocess,hashlib,shutil,zlib,tempfile
w=Path(__file__).resolve().parent;r=Path('/home/enpasos/projects/skillpilot');sys.path.insert(0,str(w));import importlib
m=importlib.import_module('run-native');cap=w/'capsule57';body=json.loads((cap/'capsule.json').read_bytes());indexPath='contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json';indexRaw=(w/'contracts-view'/Path(indexPath).name).read_bytes();index=json.loads(indexRaw);indexSha=hashlib.sha256(indexRaw).hexdigest();capSha=hashlib.sha256((cap/'capsule.json').read_bytes()).hexdigest();rows=[]
def native(name,capsule=cap,capsha=capSha,idxsha=indexSha,anchor='25a6f2164a81a7e6ae50db3557d20521fecf5124',extra=None,expected=1,message=None,working=134217728,objects=268435456):
 out=w/'scratch'/('transport-'+name);assert not out.exists()
 args=['python3','-B',str(r/'scripts/visualization_qualified_context_capsule.py'),'materialize','--repository-root',str(r),'--accepted-commit',anchor,'--accepted-census-sha256',idxsha,'--census-path',indexPath,'--capsule',str(capsule),'--accepted-capsule-sha256',capsha,'--output',str(out),'--maximum-working-bytes',str(working),'--maximum-object-bytes',str(objects)]
 p=m.run('transport-complete-'+name,args,current=False,authority=False,shallow=True,extra=extra,expect=expected,pattern=message)
 rows.append({'case':name,'expectedExit':expected,'actualExit':p.returncode,'expectedError':message,'usableOutputProduced':p.returncode==0,'outputWasAbsent':not out.exists()})
 if out.exists():
  if expected==0:
   assert subprocess.check_output(['git','-C',str(out),'rev-parse','--is-shallow-repository']).strip()==b'true'
   source=r/indexPath
   dest=out/indexPath;assert dest.exists();assert dest.stat().st_ino!=(w/'contracts-view'/Path(indexPath).name).stat().st_ino
  shutil.rmtree(out)
 (w/'results/transport-summary.json').write_text(json.dumps({'cases':rows,'skipped':0},indent=2)+'\n')
def variant(name,mutator):
 p=Path(tempfile.mkdtemp(prefix='capsule-'+name+'-',dir=w/'scratch'));os.symlink(cap/'objects',p/'objects',target_is_directory=True);b=json.loads(json.dumps(body));mutator(b);raw=(json.dumps(b,indent=2)+'\n').encode();(p/'capsule.json').write_bytes(raw);return p,hashlib.sha256(raw).hexdigest()
native('actual57-materialize',expected=0)
for name,mutate in [('extra58th',lambda b:b['rows'].append({**b['rows'][0],'goalId':'00000000-0000-4000-8000-000000000098'})),('missing57th',lambda b:b['rows'].pop()),('duplicate-owner-goal',lambda b:b['rows'].__setitem__(-1,b['rows'][0])),('duplicate-receipt-path',lambda b:b['rows'][-1].__setitem__('receipt',b['rows'][0]['receipt']))]:
 b=json.loads(json.dumps(index));mutate(b);p=w/'scratch'/(name+'.json');p.write_text(json.dumps(b,indent=2)+'\n');digest=hashlib.sha256(p.read_bytes()).hexdigest();vc,vs=variant(name,lambda body:body.__setitem__('censusSha256',digest));native(name,capsule=vc,capsha=vs,idxsha=digest,extra=[(p,r/indexPath)],message='Unknown fixed reviewed-context transport')
native('crossed-new-index-old-anchor',anchor='6fe35a6b0fa807e5a97475b34f3715dc16a89c00',message='External capsule authority differs')
native('working-budget-before-output',working=126046385,message='Private component budget exceeded')
native('object-budget-before-output',objects=140105631,message='Private component budget exceeded')
newParents=json.loads((r/'qa-artifacts/ci-contract-audit/2026-11-07/math3-fixed57-authority-integration-plan/read-only-union-resource-measurement.json').read_bytes())['newAncestryCommits']
parent=next(x if isinstance(x,str)else x['oid'] for x in newParents if (x if isinstance(x,str)else x['oid'])not in ['0b8a13761ce12f5245243bbafcc648de3b9981fd','d99bd8db5d15e7eab4e49446312208fa1f09ca32','25a6f2164a81a7e6ae50db3557d20521fecf5124'])
refs=json.loads((r/'qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-visualization-qualification/raw-positive-closure.json').read_bytes())['originalReferences']
bpath=json.loads((r/'docs/dev/ci-graph-repairs/math-diagram-description-b-visualization-independent-review-2026-11-06.json').read_bytes())['candidateRow']['path']
bref=next(x for x in refs if x['path']==bpath)
brow=next(x for x in body['objects']if x['sha256']==bref['sha256']and x['type']=='blob')
png=next(x for x in body['objects']if x['sha256']=='3d2e99d21ccdc30695657c5778173d6420cce22514cba2f061bddd745d60f091')
for name,object_id in [('missing-original-0b8','0b8a13761ce12f5245243bbafcc648de3b9981fd'),('missing-original-d99','d99bd8db5d15e7eab4e49446312208fa1f09ca32'),('missing-connecting-parent',parent),('missing-B-fresh-row',brow['oid']),('missing-new-PNG-blob',png['oid'])]:
 p,digest=variant(name,lambda b,oid=object_id:b.__setitem__('objects',[x for x in b['objects']if x['oid']!=oid]));native(name,capsule=p,capsha=digest,message='Required original object missing or wrong type')
print(json.dumps({'passed':len(rows),'skipped':0,'rawGitKernelAltered':False,'recomputedCapsulePinsAreIsolatedInnerStructuralTestsOnly':True}),flush=True)
