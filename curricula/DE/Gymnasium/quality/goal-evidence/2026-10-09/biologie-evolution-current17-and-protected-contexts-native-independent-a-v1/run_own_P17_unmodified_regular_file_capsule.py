# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,subprocess,shutil,datetime
OWN=pathlib.Path(__file__).resolve().parent;ROOT=OWN.parents[6];CAP=ROOT/'tmp/biologie-evolution-native-independent-a-P17-capsule'
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1'
FIRST=OWN/'native17-context15.independent-A.science-FIRST.freeze.json';assert FIRST.is_file()
def ref(p):
 b=p.read_bytes();assert p.is_file() and not p.is_symlink();return {'path':p.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
copies=[]
def copy(src,dest=None):
 source=ROOT/src;target=CAP/(dest or src);assert source.is_file() and not source.is_symlink();target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists():assert target.is_file() and not target.is_symlink() and target.read_bytes()==source.read_bytes()
 else:shutil.copyfile(source,target)
 assert target.read_bytes()==source.read_bytes();copies.append({'source':ref(source),'capsuleDestination':target.relative_to(CAP).as_posix(),'byteExact':True})
for p in ['app/package.json','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/src/landscapeTypes.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:copy(p)
for package in ['ajv','ajv-formats','fast-deep-equal','fast-uri','json-schema-traverse','require-from-string']:
 source=ROOT/'app/node_modules'/package;assert source.is_dir() and not source.is_symlink()
 for p in sorted(source.rglob('*')):
  if p.is_file():copy(p.relative_to(ROOT).as_posix())
config=OWN/'normal-P/P17.native-independent-A.config.json';c=json.loads(config.read_text());copy(config.relative_to(ROOT).as_posix())
for key in ['landscapePath','semanticKindLedgerPath','reviewCriteriaPath','reviewPath']:copy(c[key])
entry=json.loads((AUTHOR/'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json').read_text());rasters={r['goalId']:r for r in entry['rasterBindings']}
for gid in c['scope']['goalIds']:
 r=rasters[gid];p=ROOT/r['portableAlias']['path'];assert ref(p)==r['portableAlias'];copy(r['portableAlias']['path'],f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png')
args=['app/scripts/positiveGoalEvidenceReview.ts','--config='+config.relative_to(ROOT).as_posix(),'--mode=check'];result=subprocess.run([str(ROOT/'app/node_modules/.bin/tsx'),*args],cwd=CAP,capture_output=True,text=True)
(OWN/'normal-P/normal-P17-capsule.stdout.actual.txt').write_text(result.stdout);(OWN/'normal-P/normal-P17-capsule.stderr.actual.txt').write_text(result.stderr)
receipt={'schemaVersion':1,'role':'actual-independent-ordinary-P17-unmodified-check-capsule-terminal','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executableRepositoryRelative':'app/node_modules/.bin/tsx','argv':args,'workingDirectory':CAP.relative_to(ROOT).as_posix(),'actualExitCode':result.returncode,'firstFreeze':ref(FIRST),'copies':copies,'regularFileCopiesOnly':True,'symlinksCreated':0,'existingNodeModulesChanged':False,'activeCanonicalOrAppAssetsChanged':False,'humanApproval':False,'strictGain':0}
(OWN/'normal-P/normal-P17-capsule.terminal.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(result.stdout);print(result.stderr);print(json.dumps({'actualExitCode':result.returncode,'actualCopies':len(copies),'newActiveAssets':0}));raise SystemExit(result.returncode)
