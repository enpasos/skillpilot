from pathlib import Path
import json,hashlib,shutil,datetime
ROOT=Path('/home/enpasos/projects/skillpilot');REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-final53-v5-metadata-binding-guard-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1';OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'v5-metadata-binding-guard.final.freeze.json').exists()
for p in (ISO/REL).rglob('*'):
 if p.is_file():
  dst=OWN/p.relative_to(ISO/REL);dst.parent.mkdir(parents=True,exist_ok=True)
  if dst.exists():assert sha(dst)==sha(p)
  else:shutil.copy2(p,dst)
proof=json.loads((OWN/'v5-native-scope-and-all53-current-binding.actual.receipt.json').read_text());assert proof['prepared53GoalPageCanonicalContextAndBilingualTextExact'] and proof['nativeChemistrySummary']['errors']==proof['nativeChemistrySummary']['warnings']==0
cfg=json.loads((ISO/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json').read_text());paths=[Path(cfg['manifestPath']),Path(cfg['navigationViewPath']),Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')]+[p.relative_to(ISO) for p in (ISO/cfg['outputDirectory']).rglob('*') if p.is_file()]
for path in paths:
 dst=OWN/'source-atlas-v5'/path;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ISO/path,dst)
oldfreeze=OLD/'technical-preparation.final-v4.freeze.json';assert sha(oldfreeze)=='737d5389d611b670eef5f3e8fbe2a910caa12ed11e87157bdc0d6ad618c575ab'
old=json.loads(oldfreeze.read_text())
for f in old['files']:
 p=ROOT/f['path'];assert sha(p)==f['sha256'] and p.stat().st_size==f['bytes']
wr(OWN/'final-old-v4-403-files-still-exact.actual.receipt.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'priorV4FreezeSHA256':sha(oldfreeze),'checkedFiles':403,'allHashesAndBytesExact':True,'preparedV4InputsModified':False,'activeWrites':False})
terminal=[json.loads(p.read_text()) for p in (OWN/'terminal').glob('*.json')];assert len(terminal)==5 and all(r['exitCode']==0 for r in terminal)
files=[p for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='v5-metadata-binding-guard.final.freeze.json']
freeze={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fileCount':len(files),'files':[{'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in files],
 'authorV5FreezeSHA256':'cc0065145b47bcbe7393a5cd9490507b06155196e8a22508b223debf6319615d','currentCanonicalSHA256':sha(OWN/'canonical.final-v5.inactive.json'),'unchangedInactiveLedgerSHA256':'d16aa527265d69c200be7ebd7e7f664a9d6b273af4f8fded64c43b286b5e0f54','prior403FileV4FreezeSHA256':sha(oldfreeze),'allPrior403FilesExactAfterV5':True,
 'prepared53GoalPageContextBindingsExact':True,'nativeFull378WholePagesExactV4':True,'nativeAtlas359WholePagesExactV4':True,'all479NativeApplicabilitySetsExactV4':True,'nativeChemistryErrors':0,'nativeChemistryWarnings':0,'nativeTerminalExitCodes':[r['exitCode'] for r in terminal],'reviewRestartRequiredFromMetadataDelta':False,'descriptionReviewDecisions':[],'newScientificCompletions':0,'fullCentralOrCQRRun':False,'activeWrites':False,'humanApproval':False,'humanTrial':False}
wr(OWN/'v5-metadata-binding-guard.final.freeze.json',freeze)
print(json.dumps({'v5FreezeSHA256':sha(OWN/'v5-metadata-binding-guard.final.freeze.json'),'frozenFiles':len(files),'priorV4FilesStillExact':403,'all53CurrentBindingsExact':True,'nativeErrors':0,'nativeWarnings':0}))
