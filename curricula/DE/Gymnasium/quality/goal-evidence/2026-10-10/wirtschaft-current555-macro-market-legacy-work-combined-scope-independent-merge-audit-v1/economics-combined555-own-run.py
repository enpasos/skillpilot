from pathlib import Path
import json,shutil,subprocess,hashlib
R=Path('/home/enpasos/projects/skillpilot');C=Path(Path('/tmp/economics-combined548-own-cap-path.txt').read_text().strip());O=Path(Path('/tmp/economics-combined555-own-review-dir.txt').read_text().strip());D=Path(Path('/tmp/economics-current555-twentythree-qualified477-root-candidate-path.txt').read_text().strip());d=json.loads((D/'actual-twentythree-qualified477-two-legacy-remedies-fieldwise-current555.root-candidate-handoff.json').read_text())
CAN=d['activeCanonicalPath'];logs=[]
def cp(src,rel):
 dest=C/rel;src=Path(src);dest.parent.mkdir(parents=True,exist_ok=True);assert C in dest.parent.resolve().parents;assert src.resolve()!=dest.resolve()
 if dest.exists() or dest.is_symlink():dest.unlink()
 shutil.copy2(src,dest)
def run(label):
 output=O/(label+'.actual-native.json');cmd=[str(C/'app/node_modules/.bin/tsx'),str(C/'native-combined-scope.ts'),str(output)]
 p=subprocess.run(cmd,cwd=C,capture_output=True,text=True);(O/(label+'.stdout.raw.txt')).write_text(p.stdout);(O/(label+'.stderr.raw.txt')).write_text(p.stderr);logs.append({'label':label,'argv':cmd,'cwd':str(C),'exitCode':p.returncode});(O/'actual-independent-native-commands-and-exits.json').write_text(json.dumps(logs,indent=2)+'\n');assert p.returncode==0,p.stderr
 f=json.loads(output.read_text());print(label,f['goalCount'],f['compilerSummary'],[(r['id'],r['status'],r.get('metrics',{}).get('compositionScopesMissingTerminalAutonomyGoals'))for r in f['nativeRules']],flush=True)
cp(R/d['canonicalBefore']['path'],CAN)
for v in d['views']:cp(R/v['before']['path'],v['activePath'])
run('before-current532-independent')
cp(R/d['canonicalCandidate']['path'],CAN)
for v in d['views']:cp(R/v['candidate']['path'],v['activePath'])
run('after-combined555-independent')
# genuine same-scope required foundation removal while material and ordinary targets stay.
f=C/'curricula/DE/Gymnasium/composition-views/wirtschaft/de-bb-gym-economics-gk.view.json';v=json.loads(f.read_text());before=v['rootNodes'][0]['children'];after=[r for r in before if not(r.get('goalId')==d['foundationId'] and r.get('projectionRole')=='prerequisiteOnly')];assert len(before)-len(after)==1;v['rootNodes'][0]['children']=after;f.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');(O/'actual-negative-BBGK-only-foundation-role-removal.view.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');run('negative-only-BBGK-foundation-removal-independent')
# restore capsule final exact
for x in d['views']:
 if x['activePath'].endswith('de-bb-gym-economics-gk.view.json'):cp(R/x['candidate']['path'],x['activePath'])
print('ALL THREE FRESH NATIVE FRAMES COMPLETE',C,flush=True)
