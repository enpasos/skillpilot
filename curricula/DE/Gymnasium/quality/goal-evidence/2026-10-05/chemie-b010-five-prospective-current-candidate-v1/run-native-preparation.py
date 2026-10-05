from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess,sys
ROOT=Path.cwd().resolve();OWN=Path(__file__).parent.resolve();REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/chemie-b010-five-native-isolated-20261005-v1'
SOURCE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-source-hold-remediation-candidate-v1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,j):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 if p.is_symlink():p.unlink()
 p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
for name in ['positive-evidence.candidates.json','positive-evidence.config.json']:
 p=ISO/REL/name;p.parent.mkdir(parents=True,exist_ok=True)
 if p.is_symlink():p.unlink()
 shutil.copy2(OWN/name,p)
for prefix in ['a-five','m-five']:
 cfg=read(SOURCE/f'{prefix}.config.json');cfg['landscapePath']='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';cfg['reviewPath']=str(REL/f'{prefix}.review.jsonl')
 if prefix=='m-five':cfg['cardReviewPath']=str(REL/'m-five.cards.review.jsonl')
 write(OWN/f'{prefix}.config.json',cfg);write(ISO/REL/f'{prefix}.config.json',cfg)
 for leaf in [f'{prefix}.review.jsonl']+(['m-five.cards.review.jsonl'] if prefix=='m-five' else []):
  p=ISO/REL/leaf
  if p.is_symlink():p.unlink()
  shutil.copy2(SOURCE/leaf,p)
commands=[
 ('a-five-native-bind',['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts',f'--config={REL}/a-five.config.json','--write-fingerprints']),
 ('a-five-native-check',['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts',f'--config={REL}/a-five.config.json','--mode=check']),
 ('m-five-native-bind',['app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts',f'--config={REL}/m-five.config.json','--write-fingerprints']),
 ('m-five-native-check',['app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts',f'--config={REL}/m-five.config.json','--mode=check']),
 ('source-atlas-generate',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']),
 ('source-atlas-check',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','--check']),
 ('final-seven-book-prepare',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(REL/'batch.config.json')]),
 ('final-seven-book-check',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(REL/'batch.config.json')]),
 ('p-five-native-materialize',['app/node_modules/.bin/tsx','app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(REL/'positive-evidence.config.json'),'--candidates',str(REL/'positive-evidence.candidates.json'),'--write']),
 ('p-five-native-check',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts',f'--config={REL}/positive-evidence.config.json','--mode=check'])]
terminal=[]
if '--p-only' in sys.argv:
 terminal=read(OWN/'native-preparation-terminal.receipt.json')['commands'][:-1]
 commands=commands[-2:]
for name,args in commands:
 started=datetime.now(timezone.utc).isoformat();r=subprocess.run(args,cwd=ISO,text=True,capture_output=True)
 (OWN/f'{name}.stdout.txt').write_text(r.stdout);(OWN/f'{name}.stderr.txt').write_text(r.stderr)
 terminal.append({'name':name,'args':args,'cwd':str(ISO),'startedAtUTC':started,'endedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':r.returncode,'stdoutPath':str(REL/f'{name}.stdout.txt'),'stdoutSHA256':sha(OWN/f'{name}.stdout.txt'),'stderrPath':str(REL/f'{name}.stderr.txt'),'stderrSHA256':sha(OWN/f'{name}.stderr.txt')})
 write(OWN/'native-preparation-terminal.receipt.json',{'status':'in_progress' if r.returncode==0 else 'HOLD_native_failure','commands':terminal,'scientificApprovalClaim':False,'strictClosure':0,'humanApproval':False,'activeWrites':0})
 print(json.dumps({'command':name,'actualExitCode':r.returncode,'stdout':r.stdout[:450],'stderr':r.stderr[:450]}),flush=True)
 assert r.returncode==0,r.stderr
for leaf in ['a-five.review.jsonl','m-five.review.jsonl','m-five.cards.review.jsonl','positive-evidence.review.jsonl']:
 shutil.copy2(ISO/REL/leaf,OWN/leaf)
assert not (OWN/'native-finalbook').exists();shutil.copytree(ISO/REL/'native-finalbook',OWN/'native-finalbook')
model=read(OWN/'native-finalbook/bundle/book-model.json');manifest=read(OWN/'native-finalbook/batch-manifest.json');render=read(OWN/'native-finalbook/bundle/book.pdf.render-manifest.json')
assert len(model['pages'])==7 and manifest['curriculumAtomicDenominatorAtPreparation']==376
assert not list((OWN/'native-finalbook/round-a/results').iterdir()) and not list((OWN/'native-finalbook/round-b/results').iterdir())
assert all(p['evidenceReview'] is None for p in model['pages'])
write(OWN/'native-preparation-terminal.receipt.json',{'status':'PASS_inactive_native_preparation_only','commands':terminal,'goalPages':7,'physicalPages':render['physicalPageCount'],'nativeModelDigest':model['digest'],'bundleFingerprint':manifest['artifacts']['bundleFingerprint'],'reviewInputFingerprint':manifest['artifacts']['reviewInputFingerprint'],'curricularAtomicDenominator':376,'D2ResultDirectoriesEmpty':True,'DReviewsConducted':0,'PProfilesCandidateOnly':5,'PIndependentApproval':False,'strictClosure':0,'humanApproval':False,'activeWrites':0})
