from pathlib import Path
import json,hashlib,datetime,subprocess,importlib.util
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[6]
index_path=HERE/'actual-final-portable-whole-inputs-and-reviewed-output-index.json'
index=json.loads(index_path.read_bytes())
rows=[]
for r in index['wholeInputFiles']:
 p=ROOT/r['path'];b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==r['sha256']
 if p.suffix=='.jsonl':
  data=[json.loads(line) for line in b.decode().splitlines() if line.strip()]
 else:data=json.loads(b)
 assert b.endswith(b'\n'),r['path']
 assert not p.is_symlink(),r['path']
 rows.append({'path':r['path'],'sha256':r['sha256'],'wholeBytes':len(b),'wholeParse':True,'actualFinalNewline':True,'unchanged':True})
for r in index['outputs'].values():
 p=ROOT/r['path'];b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==r['sha256'];json.loads(b)
 assert b.endswith(b'\n');assert not p.is_symlink()
own_rows=[]
for p in sorted(HERE.iterdir()):
 if not p.is_file():continue
 b=p.read_bytes()
 assert b.endswith(b'\n'),p.name
 if p.suffix=='.json':json.loads(b)
 own_rows.append({'path':p.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'wholeBytes':len(b),'actualNewline':True,'symlink':False})
all_paths=[r['path'] for r in rows]+[r['path'] for r in own_rows]
check=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(all_paths)+'\n',text=True,capture_output=True,cwd=ROOT)
assert check.returncode in [0,1],check.stderr
assert not check.stdout.strip(),check.stdout
spec=importlib.util.spec_from_file_location('actual_native_validate_schemas',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
symlink_errors=m.curriculum_symlink_errors(ROOT)
assert not symlink_errors,symlink_errors
out={'role':'actual final original scientific input guards, complete JSON/JSONL and LF, committability and native curriculum_symlink_errors','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputIndexSHA256':hashlib.sha256(index_path.read_bytes()).hexdigest(),'currentCodeHashes':{str(p):hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in ['docs/landscape-runtime.schema.json','app/src/utils/goalFilters.ts','scripts/validate_schemas.py']},'wholeInputRows':rows,'ownArtifactRows':own_rows,'ignoredInputPaths':[],'nativeCurriculumSymlinkErrors':symlink_errors,'allGuardedScientificInputsUnchanged':True,'wholeJSONorJSONLParsed':True,'actualFinalLF':True,'errors':0,'scienceApprovalFromTechnicalChecks':False}
(HERE/'actual-final-input-parity-LF-parse-committability-and-native-symlink-check.result.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'inputFiles':len(rows),'ownArtifacts':len(own_rows),'allWholeInputHashesUnchanged':True,'completeJSONJSONLAndLF':True,'ignoredInputs':0,'nativeCurriculumSymlinkErrors':len(symlink_errors),'errors':0},ensure_ascii=False,indent=2))

