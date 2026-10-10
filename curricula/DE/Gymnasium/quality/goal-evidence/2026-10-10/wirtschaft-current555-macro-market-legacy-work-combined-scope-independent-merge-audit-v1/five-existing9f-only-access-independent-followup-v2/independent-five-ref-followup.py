from pathlib import Path
import hashlib,json,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot');C=Path(Path('/tmp/economics-combined548-own-cap-path.txt').read_text().strip());P=Path(Path('/tmp/economics-combined555-own-review-dir.txt').read_text().strip());O=P/'five-existing9f-only-access-independent-followup-v2';O.mkdir(exist_ok=True);D=Path(Path('/tmp/economics-current555-twentythree-qualified482-root-candidate-path.txt').read_text().strip());hpath=D/'actual-five-existing-qualified9f-only-country-target-refs.root-author-handoff-v2.json';H=json.loads(hpath.read_text());idx=json.loads((R/H['wholeIndex']['path']).read_text());parent=json.loads((R/H['parentIndex']['path']).read_text());logs=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def cp(src,rel):
 dest=C/rel; assert C in dest.parent.resolve().parents;assert src.resolve()!=dest.resolve()
 if dest.exists()or dest.is_symlink():dest.unlink()
 shutil.copy2(src,dest)
assert sha(hpath)=='870c3239d5279c39955534444b228f14af7c5fb90736493cc5a7d040be619617';assert sha(R/H['wholeIndex']['path'])=='03982b8fead94bbd267f0b133c19e77c7ea352494e5b55b20e49446e289d8aac';assert idx['totalAppendedRefs']==482;assert idx['canonicalCandidate']==parent['canonicalCandidate'];assert idx['newQualifiedPracticeGoalIds']==parent['newQualifiedPracticeGoalIds']
changes=[]
for row in H['wholeFiveAddedReferenceRows']:
 b=json.loads((R/row['whole477CandidateBefore']['path']).read_text());a=json.loads((R/row['whole482CandidateAfter']['path']).read_text());assert sha(R/row['whole477CandidateBefore']['path'])==row['whole477CandidateBefore']['sha256'];assert sha(R/row['whole482CandidateAfter']['path'])==row['whole482CandidateAfter']['sha256'];br=b['rootNodes'][0];ar=a['rootNodes'][0];assert ar['children'][:-1]==br['children'];assert ar['children'][-1]==row['onlyOneAddedTarget'];assert ar['children'][-1]['goalId']==parent['old9fId'];assert ar['children'][-1]['projectionRole']=='target';assert {k:v for k,v in ar.items()if k!='children'}=={k:v for k,v in br.items()if k!='children'};assert {k:v for k,v in a.items()if k not in ['viewId','rootNodes']}=={k:v for k,v in b.items()if k not in ['viewId','rootNodes']};changes.append(row);cp(R/row['whole482CandidateAfter']['path'],row['activePath'])
assert len(changes)==5
beforeBy={v['activePath']:v for v in parent['views']}
for v in idx['views']:
 old=beforeBy[v['activePath']]
 if v['activePath']not in [x['activePath']for x in changes]:assert v['candidate']==old['candidate']
assert sum(len(v['wholeAddedReferences'])for v in idx['views'])==482
(O/'actual-independent-exact-five-only-reference-and-whole555-retention-guards.json').write_text(json.dumps({'rootIndex':ref(R/H['wholeIndex']['path']),'rootFiveRefAuthor':ref(hpath),'canonical555WholeUnchanged':idx['canonicalCandidate'],'fiveWholeAppends':changes,'other30WholeViewsUnchanged':True,'old23NewBodies2Legacy4Nav336Ordinary685PAndSEMExactParent':True},ensure_ascii=False,indent=2)+'\n')
def run(l):
 pth=O/(l+'.actual-native.json');argv=[str(C/'app/node_modules/.bin/tsx'),str(C/'native-combined-scope.ts'),str(pth)];p=subprocess.run(argv,cwd=C,capture_output=True,text=True);(O/(l+'.stdout.raw.txt')).write_text(p.stdout);(O/(l+'.stderr.raw.txt')).write_text(p.stderr);logs.append({'argv':argv,'cwd':str(C),'exitCode':p.returncode});(O/'actual-two-fresh-native-command-exits.json').write_text(json.dumps(logs,indent=2)+'\n');assert p.returncode==0,p.stderr;d=json.loads(pth.read_text());print(l,d['compilerSummary'],[r['metrics']for r in d['nativeRules']if r['id']=='CQR-104'][0]['projectionScopesMissingTerminalAutonomyGoals'],flush=True)
run('after-five-refs-current555-482-independent')
r=next(r for r in H['wholeFiveAddedReferenceRows']if r['scope']['jurisdiction']=='DE-BE'and r['scope']['courseProfile']=='GK');f=C/r['activePath'];a=json.loads(f.read_text());children=a['rootNodes'][0]['children'];a['rootNodes'][0]['children']=[x for x in children if x.get('goalId')!=parent['old9fId']];assert len(children)-len(a['rootNodes'][0]['children'])==1;f.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');(O/'actual-negative-only-BEGK9f-access-removal.view.json').write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n');run('negative-only-BEGK9f-access-removal-independent');cp(R/r['whole482CandidateAfter']['path'],r['activePath']);print('TWO FOLLOWUP FRAMES COMPLETE',flush=True)
Path('/tmp/economics-combined555-own-final-followup-dir.txt').write_text(str(O)+'\n')
