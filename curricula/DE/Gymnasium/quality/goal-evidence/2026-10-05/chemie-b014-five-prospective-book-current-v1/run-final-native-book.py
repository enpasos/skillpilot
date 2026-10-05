from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil
ROOT=Path.cwd().resolve();REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-b014-five-native-isolated-20261005-v1'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert (OWN/'final-efa-independent-PASS-adoption.actual.receipt.json').exists(),'Final book requires an actual independently reviewed final efa PNG'
adoption=read(OWN/'final-efa-independent-PASS-adoption.actual.receipt.json')
assert adoption['decision']=='PASS'
erratum=read(OWN/'prompt-and-KEEP-render-isolation.erratum.receipt.json')
assert erratum['allActiveHistoricalPromptBytesRestored'] and all(r['candidateDetachedRealFile'] for r in erratum['rows'])
assert not (ISO/REL/'native-finalbook').exists(),'No overwrite of a prepared or reviewed campaign'
# Native PDF rendering checks real paths. Existing KEEP images must be local
# byte-identical files, not symlinks escaping the isolated public root.
canonical=read(ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
for id in read(OWN/'batch.config.json')['goalIds']:
 goal=next(g for g in canonical['goals'] if g['id']==id)
 primary=next(l for l in goal['resourceLinks'] if l.get('type')=='goal-visualization' and l.get('role')=='primary')
 public=ISO/'app/public'/primary['url'].lstrip('/')
 if public.is_symlink():
  original=public.read_bytes();public.unlink();public.write_bytes(original)
 assert not public.is_symlink()
commands=[('source-atlas-generate',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']),('source-atlas-check',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','--check']),('final-six-book-prepare',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(REL/'batch.config.json')]),('final-six-book-check',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(REL/'batch.config.json')])]
terminal=[]
for name,args in commands:
 started=datetime.now(timezone.utc).isoformat();run=subprocess.run(args,cwd=ISO,text=True,capture_output=True);ended=datetime.now(timezone.utc).isoformat()
 (OWN/f'{name}.stdout.txt').write_text(run.stdout);(OWN/f'{name}.stderr.txt').write_text(run.stderr)
 terminal.append({'name':name,'args':args,'cwd':str(ISO),'startedAtUTC':started,'endedAtUTC':ended,'actualExitCode':run.returncode,'stdoutPath':str(REL/f'{name}.stdout.txt'),'stdoutSHA256':'sha256:'+sha(OWN/f'{name}.stdout.txt'),'stderrPath':str(REL/f'{name}.stderr.txt'),'stderrSHA256':'sha256:'+sha(OWN/f'{name}.stderr.txt')})
 write(OWN/'final-native-preparation.terminal.receipt.json',{'status':'running' if run.returncode==0 else 'failed_closed','commands':terminal,'strictNetDelta':0,'humanApproval':False,'activeWrites':0})
 print(json.dumps({'command':name,'actualExitCode':run.returncode,'stdout':run.stdout[:250]}),flush=True)
 assert run.returncode==0,run.stderr
bundle=ISO/REL/'native-finalbook';assert not (OWN/'native-finalbook').exists();shutil.copytree(bundle,OWN/'native-finalbook')
model=read(bundle/'bundle/book-model.json');batch=read(bundle/'batch-manifest.json');render=read(bundle/'bundle/book.pdf.render-manifest.json');ids=read(OWN/'batch.config.json')['goalIds']
assert len(model['pages'])==6 and [p['goalId'] for p in model['pages']]==ids
assert batch['curriculumAtomicDenominatorAtPreparation']==376
assert all(p['evidenceReview'] is None and p['visualization']['approvedForPublication'] is False for p in model['pages'])
assert render['goalPageCount']==6 and render['physicalPageCount']==8 and render['frontMatterPageCount']==2
assert not list((bundle/'round-a/results').iterdir()) and not list((bundle/'round-b/results').iterdir())
write(OWN/'final-native-preparation.terminal.receipt.json',{'status':'PASS_native_exact_future_current_six_page_preparation','commands':terminal,'reviewGoalIds':ids,'newScientificCandidateGoalIds':ids[:5],'existingTargetedBindingGoalIds':ids[5:],'curriculumAtomicDenominatorAtPreparation':376,'nativeBaseModelDigest':batch['source']['baseBookDigest'],'nativeModelDigest':model['digest'],'nativeBundleFingerprint':batch['artifacts']['bundleFingerprint'],'nativeReviewInputFingerprint':batch['artifacts']['reviewInputFingerprint'],'exactFutureCanonicalPath':model['source']['landscapePath'],'goalPages':[{k:p[k] for k in ['goalId','title','goalFingerprint','pageFingerprint']} for p in model['pages']],'PDFGoalPages':6,'PDFPhysicalPages':8,'reviewModeAIOnly':True,'independentTwoBlindCampaignsPrepared':True,'reviewResultDirectoriesEmpty':True,'PContentsAbsent':True,'DReviewsCompletedByThisPreparation':0,'newScientificClosuresActual':0,'restoredBindingsActual':0,'strictNetDeltaActual':0,'humanApproval':False,'activeWrites':0})
print(json.dumps({'prepared':6,'base':376,'nativeModelDigest':model['digest'],'nativeBundleFingerprint':batch['artifacts']['bundleFingerprint'],'activeWrites':0}),flush=True)
