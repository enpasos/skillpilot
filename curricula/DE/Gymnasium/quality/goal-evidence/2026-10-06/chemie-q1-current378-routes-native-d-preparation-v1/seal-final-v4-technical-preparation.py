from pathlib import Path
import hashlib,json,shutil,zipfile,datetime,os
ROOT=Path('/home/enpasos/projects/skillpilot');REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1');OWN=ROOT/REL
ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'technical-preparation.final-v4.freeze.json').exists()
assert sha(OWN/'final-v4-input-snapshot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')=='19b5b242d16d3720faeee2719af1851923c82e84fdcb7bc1647f0fe1f825897d'
assert sha(OWN/'semantic-kinds.final-v4.inactive.json')=='d16aa527265d69c200be7ebd7e7f664a9d6b273af4f8fded64c43b286b5e0f54'
rec=json.loads((OWN/'old407-to-current-v4.actual-wholepage-binding-delta-and-53-reconciliation.json').read_text())
assert len(rec['true53GoalIds'])==53
code=[];liveDrift=[]
for directory in ['app/scripts','app/src','contracts','scripts']:
 for p in sorted((ISO/directory).rglob('*')):
  if not p.is_file() or p.is_symlink():continue
  rel=p.relative_to(ISO)
  if directory=='app/scripts' and p.suffix not in ['.ts','.tsx','.mts','.js','.mjs','.cjs']:continue
  origin=ROOT/rel;assert origin.is_file(),rel
  matchesLive=sha(p)==sha(origin)
  if not matchesLive:
   assert str(rel)=='app/src/components/SessionSetup.tsx',rel
   assert origin.stat().st_mtime>p.stat().st_mtime
   liveDrift.append({'path':str(rel),'copiedSHA256':sha(p),'currentLiveSHA256':sha(origin),'copiedMtime':p.stat().st_mtime,'currentLiveMtime':origin.stat().st_mtime,'nativeReviewDependency':False,'copiedFileNotModified':True})
  assert not os.path.samestat(p.stat(),origin.stat()),rel
  code.append({'path':str(rel),'sha256':sha(p),'bytes':p.stat().st_size,'copiedBytesNotModifiedByThisTask':True,'physicallyCopied':True,'matchesLiveAtFinalSeal':matchesLive})
wr(OWN/'native-tool-and-schema-bytes.actual-bindings.json',{'schemaVersion':1,'files':code,'nativeToolsChanged':False,'schemaExceptions':[],'ignoreExceptions':[],'unrelatedLiveUiDriftSincePhysicalCopy':liveDrift,'allNativeScriptsAndSchemasMatchLiveAtSeal':True})
images={}
for number in range(1,4):
 folder=OWN/'native-current-d-batches'/f'batch-{number:03d}'
 for p in folder.rglob('*'):
  if p.is_file():assert p.read_bytes()==(ISO/p.relative_to(ROOT)).read_bytes(),p
 model=json.loads((folder/'bundle/book-model.json').read_text())
 for page in model['pages']:
  url=page['visualization']['url'];assert url.startswith('/assets/')
  src=ISO/'app/public'/url.lstrip('/');assert src.is_file()
  assert 'sha256:'+sha(src)==page['visualization']['originalDigest']
  archive=url.lstrip('/');dst=OWN/'portable-assets'/archive;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
  images[archive]=dst
paths=[]
for p in sorted((OWN/'native-current-d-batches').rglob('*')):
 if p.is_file():paths.append((str(p.relative_to(ROOT)),p))
for directory in ['batch-configs','final-v4-input-snapshot','source-atlas-final-v4']:
 for p in sorted((OWN/directory).rglob('*')):
  if p.is_file():paths.append((str(p.relative_to(ROOT)),p))
for name in ['README.md','native-current-d-batch-plan.actual.json','old407-to-current-v4.actual-wholepage-binding-delta-and-53-reconciliation.json','old407-to-current-v4.actual-wholepage-binding-delta-and-53-reconciliation.csv','final-v4.native-d-union.actual.json','final-v4.scope-summary.actual.json','final-v4-original376-and-source-input-preservation.actual.json','original376-by-source-view-targets-preservation.actual.json','native-tool-and-schema-bytes.actual-bindings.json']:
 paths.append((str(REL/name),OWN/name))
for name in ['full-current376.book-model.json','full-current378-final-v4.book-model.json','source-atlas359-final-v4.book-model.json']:
 p=OWN/'native-models'/name;paths.append((str(p.relative_to(ROOT)),p))
for name in ['full-current378-routes-v2.config.json','source-atlas359-routes-v2.config.json']:
 paths.append((str(REL/name),OWN/name))
paths+=sorted(images.items())
assert len({n for n,p in paths})==len(paths)
manifest={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'artifact':'native-d-review-final-v4.portable.zip','nativeBatchSizes':[20,20,13],'imageCount':len(images),'officialSourcePDFsIncluded':False,'files':[{'archivePath':name,'physicalPath':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size} for name,p in paths]}
wr(OWN/'native-d-review-final-v4.portable.files.sha256.json',manifest)
archive=OWN/'native-d-review-final-v4.portable.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for name,p in paths:z.write(p,arcname=name)
 z.write(OWN/'native-d-review-final-v4.portable.files.sha256.json',arcname=str(REL/'native-d-review-final-v4.portable.files.sha256.json'))
with zipfile.ZipFile(archive) as z:
 for row in manifest['files']:
  b=z.read(row['archivePath']);assert hashlib.sha256(b).hexdigest()==row['sha256'] and len(b)==row['bytes']
wr(OWN/'native-d-review-final-v4.portable.archive.actual.receipt.json',{'schemaVersion':1,'path':str(archive.relative_to(ROOT)),'sha256':sha(archive),'bytes':archive.stat().st_size,'allArchiveMemberSHAsActuallyVerified':True,'fileCount':len(paths)+1,'activeWrites':False,'scienceReviewDecision':None})
outputs=[p for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='technical-preparation.final-v4.freeze.json']
freeze={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'state':'final-v4 technical inputs and native preparation only; independent description reviews pending','fileCount':len(outputs),'files':[{'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in outputs],
 'true53GoalIds':rec['true53GoalIds'],'scopeClassification':{'changedCurrentStrict':45,'additionalOldAnchors':8},'nativeBatchSizes':[20,20,13],
 'nativePrepareAndCheckTerminalExitCodes':[0,0,0,0,0,0],'finalV4CanonicalSHA256':'19b5b242d16d3720faeee2719af1851923c82e84fdcb7bc1647f0fe1f825897d','finalV4InactiveLedgerSHA256':'d16aa527265d69c200be7ebd7e7f664a9d6b273af4f8fded64c43b286b5e0f54',
 'portableZipSHA256':sha(archive),'activeWrites':False,'registrySupersessionOrLedgerLiveWrites':False,'fullCentralOrCQRRun':False,'scienceReviewDecisions':[],'humanApproval':False,'humanTrial':False,
 'knownFinalV4MetadataWarning':'APV-203 only new4cb74 rawBY+HE while compiledHE-only; parent additive v5 must prove prepared53 page/goal/context inputs exact before retaining these reviews.'}
wr(OWN/'technical-preparation.final-v4.freeze.json',freeze)
print(json.dumps({'freezeSHA256':sha(OWN/'technical-preparation.final-v4.freeze.json'),'frozenFiles':len(outputs),'portableZipSHA256':sha(archive),'portableZipBytes':archive.stat().st_size,'nativePreparedReviewGoals':53,'portableFiles':len(paths)+1,'portableImages':len(images)}))
