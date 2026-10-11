"""Normal unchanged helper preparation for six new and eight protected goals."""
import importlib.util,json,os,re,shutil,subprocess,sys
from pathlib import Path

ROOT=Path.cwd()
PKG=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-child-full-memory-source-author-successor-20261011-v5')
CAP=ROOT/'tmp/m7-resumption-20261011/b007-v5-author/capsule'
ENTRY=Path('app/scripts/materializeGoalDescriptionRolloutBatch.ts')
read=lambda p:json.loads(Path(p).read_text())
def write(p,d):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');read(p)
entry=read(PKG/'neutral-v5-author.entry.json')
selected=set(entry['newGoalIds']+entry['protectedContextGoalIds'])
ordered=[p['goalId'] for p in read(PKG/'native/whole402.normal.book-model.json')['pages'] if p['goalId'] in selected]
assert len(ordered)==14
config={
 '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,
 'batchId':'chemie-b007-six-plus-eight-current402-native-author-preparation-v5','subject':'chemie','subjectLabel':'Chemie',
 'bookId':'chemie-b007-six-plus-eight-current402-native-author-preparation-v5','title':'Chemie – sechs Teilziele und aktuelle Bezüge',
 'baseGoalBookConfigPath':str(PKG/'candidate/native-current-whole402.inactive.config.json'),
 'goalIds':ordered,'outputDirectory':str(PKG/'native/six-plus-eight-current402-normal-batch'),
 'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback',
 'promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
 'criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',
 'printDerivativeProfile':'standard','publicRoot':'app/public'}
write(PKG/'candidate/six-plus-eight-current402.normal-batch.config.json',config)
import jsonschema
jsonschema.Draft202012Validator(read(ROOT/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json')).validate(config)
IMPORT=re.compile(r'''(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)['"](\.[^'"]+)['"]''')
queue=[ENTRY,Path('app/scripts/goalBookRenderer.ts')];visited=set()
while queue:
 path=queue.pop()
 if path in visited:continue
 visited.add(path)
 for dep in IMPORT.findall((ROOT/path).read_text()):
  base=(ROOT/path).parent/dep
  options=[base,Path(str(base)+'.ts'),Path(str(base)+'.tsx'),Path(str(base)+'.js'),base/'index.ts',base/'index.tsx']
  if base.suffix in ('.js','.mjs'):options.append(base.with_suffix('.ts'))
  actual=next((v for v in options if v.is_file()),None);assert actual,(path,dep)
  queue.append(Path(os.path.normpath(actual)).relative_to(ROOT))
visited.update([Path('app/package.json'),*(p.relative_to(ROOT) for p in ROOT.glob('app/tsconfig*.json'))])
for path in sorted(visited):
 dest=CAP/path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/path,dest);assert dest.read_bytes()==(ROOT/path).read_bytes()
target=CAP/'app/node_modules'
if not target.exists():target.symlink_to(os.path.relpath(ROOT/'app/node_modules',CAP/'app'),target_is_directory=True)
write(PKG/'checks/normal-native-helper-source-copies.actual.json',{'role':'unchanged normal source closure copied only to ignored scratch','sourceFiles':[str(x) for x in sorted(visited)],'totalSourceBytes':sum((ROOT/x).stat().st_size for x in visited),'helperEdits':False})
def command(name,args):
 if (PKG/'checks'/f'{name}.terminal.actual.json').exists():
  prior=read(PKG/'checks'/f'{name}.terminal.actual.json')
  assert prior['exitCode']!=0, 'Do not rerun successful prepared artifact work.'
  name+='-attempt2'
 with (PKG/'checks'/f'{name}.stdout.actual.txt').open('x') as stdout,(PKG/'checks'/f'{name}.stderr.actual.txt').open('x') as stderr:
  result=subprocess.run([str(ROOT/'app/node_modules/.bin/tsx'),str(CAP/ENTRY),*args],cwd=CAP,stdout=stdout,stderr=stderr)
 write(PKG/'checks'/f'{name}.terminal.actual.json',{'command':[str(ENTRY),*args],'exitCode':result.returncode,'independentReviewExecuted':False})
 assert result.returncode==0,f'{name} failed; inspect actual output'
cfg=str(PKG/'candidate/six-plus-eight-current402.normal-batch.config.json')
command('normal-fourteen-prepare',['prepare','--config',cfg])
command('normal-fourteen-check',['check','--config',cfg])
print(json.dumps({'normalPreparedGoals':14,'prepareAndCheck':'PASS','scienceApprovals':0,'batchDirectory':config['outputDirectory']}))
