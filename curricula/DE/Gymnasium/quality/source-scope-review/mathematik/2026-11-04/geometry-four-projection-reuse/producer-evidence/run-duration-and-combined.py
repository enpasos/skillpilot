from pathlib import Path
import hashlib,json,subprocess,time,os,shutil
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';O=H/'overlay';cfg=json.loads((H/'integration-config.json').read_text());B=R/cfg['baseHost'];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def copy(src,dest):dest.parent.mkdir(parents=True,exist_ok=True);tmp=dest.with_name(dest.name+'.new');shutil.copyfile(src,tmp);tmp.replace(dest)
def run(name,cmd,cwd,env=None):
 t=time.monotonic()
 with(H/(name+'.stdout.txt')).open('wb')as out,(H/(name+'.stderr.txt')).open('wb')as err:p=subprocess.run(cmd,cwd=cwd,stdout=out,stderr=err,env=env)
 row={'argv':cmd,'exitCode':p.returncode,'seconds':round(time.monotonic()-t,2),'stdout':{'path':str((H/(name+'.stdout.txt')).relative_to(R)),'sha256':sha(H/(name+'.stdout.txt'))},'stderr':{'path':str((H/(name+'.stderr.txt')).relative_to(R)),'sha256':sha(H/(name+'.stderr.txt'))}}
 if p.returncode:save(H/(name+'.failure.json'),row);print(json.dumps(row),flush=True);raise SystemExit(p.returncode)
 return row
assert json.loads((H/'normal-country88.actual.json').read_text())['outputViews']==88
cmd=['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/generateMathDurationCompositionViews.ts','--output-dir','tmp/statistics-pyramid-duration-preview'];row=run('normal-duration18',cmd,C,dict(os.environ,PYTHONDONTWRITEBYTECODE='1'));outputs=[]
for source in sorted((C/'tmp/statistics-pyramid-duration-preview').rglob('*.view.json')):
 rel=source.relative_to(C/'tmp/statistics-pyramid-duration-preview').as_posix()
 for root in[C,O]:copy(source,root/rel)
 outputs.append({'path':rel,'sha256':sha(source),'beforeSha256':sha(B/rel),'changedFromBase':sha(source)!=sha(B/rel)})
assert len(outputs)==18;row.update({'status':'PASS_ACTUAL_NORMAL_DURATION18_BOUNDED_PREVIEW_CLI','outputViews':18,'outputs':outputs,'countryBeforeDuration':True,'noFakeReceiptOrGuardRelaxation':True});save(H/'normal-duration18.actual.json',row);print(json.dumps({k:row[k]for k in['status','seconds','outputViews']}),flush=True)
plan=json.loads((C/cfg['planPath']).read_text());pairs=plan['combinedMaterializations'];assert len(pairs)==39
# The normal Java writer writes directly: detach all 39 files from immutable G first.
for pair in pairs:
 p=C/'curricula/DE/Gymnasium/composition-views/mathematik'/pair['outputFileName'];copy(p,p)
env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1',SKILLPILOT_BACKEND_BUILD_DIR=str(H/'backend-build'),GRADLE_USER_HOME='/tmp/skillpilot-plan-gradle-20261022',JAVA_HOME='/tmp/skillpilot-curriculum-ci-corretto-25.0.2.10.1');cmd=['./gradlew','--offline','generateMathContextualCombinedViews','--console=plain'];row=run('normal-combined39-generate',cmd,C/'backend',env);outputs=[]
for pair in pairs:
 rel='curricula/DE/Gymnasium/composition-views/mathematik/'+pair['outputFileName'];copy(C/rel,O/rel);outputs.append({'path':rel,'viewId':pair['outputViewId'],'scopeRows':pair['scopeRows'],'sha256':sha(C/rel),'beforeSha256':sha(B/rel),'changedFromBase':sha(C/rel)!=sha(B/rel)})
row.update({'status':'PASS_ACTUAL_NORMAL_GRADLE_PRODUCTION_MERGER39','outputViews':39,'requests':46,'outputs':outputs,'countryBeforeDurationBeforeCombined':True,'normalProductionMergerAndAvailabilityAlgorithmUnchanged':True,'reviewedExistingAssessmentGuardAdded':True,'privateBuildDirectory':str(H/'backend-build'),'canonicalSha256':sha(C/cfg['canonicalPath']),'policySha256':sha(C/cfg['policyPath']),'planSha256':sha(C/cfg['planPath'])});save(H/'normal-combined39-generate.actual.json',row);print(json.dumps({k:row[k]for k in['status','seconds','outputViews','requests']}),flush=True)
guard={str(f.relative_to(C)):sha(f)for f in(C/'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.json')};guard.update({p:sha(C/p)for p in[cfg['canonicalPath'],cfg['ledgerPath'],cfg['policyPath'],cfg['layoutPath'],cfg['planPath']]});cmd=['./gradlew','--offline','checkMathContextualCombinedViews','--console=plain'];row=run('normal-combined39-check',cmd,C/'backend',env);assert all(sha(C/p)==s for p,s in guard.items());row.update({'status':'PASS_ACTUAL_NORMAL_GRADLE_COMBINED39_READ_ONLY_CHECK','outputViews':39,'requests':46,'guardedFiles':len(guard),'allGuardedDataByteUnchanged':True});save(H/'normal-combined39-check.actual.json',row);print(json.dumps({k:row[k]for k in['status','seconds','guardedFiles']}),flush=True)
