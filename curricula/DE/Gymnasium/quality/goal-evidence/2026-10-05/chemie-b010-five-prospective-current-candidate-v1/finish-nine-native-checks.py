from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil
ROOT=Path.cwd().resolve();OWN=Path(__file__).parent.resolve();REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/chemie-b010-five-native-isolated-20261005-v1'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
commands=[('final-nine-book-check',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(REL/'batch.config.json')]),('p-five-final-binding-materialize',['app/node_modules/.bin/tsx','app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(REL/'positive-evidence.config.json'),'--candidates',str(REL/'positive-evidence.candidates.json'),'--write']),('p-five-final-native-check',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts',f'--config={REL}/positive-evidence.config.json','--mode=check']),('latest-full-m-final-native-check',['app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts',f'--config={REL}/latest-full-m-prospective.config.json','--mode=check'])]
rows=[]
for name,args in commands:
 started=datetime.now(timezone.utc).isoformat();r=subprocess.run(args,cwd=ISO,text=True,capture_output=True);(OWN/f'{name}.stdout.txt').write_text(r.stdout);(OWN/f'{name}.stderr.txt').write_text(r.stderr)
 rows.append({'name':name,'args':args,'cwd':str(ISO),'startedAtUTC':started,'endedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':r.returncode,'stdoutPath':str(REL/f'{name}.stdout.txt'),'stdoutSHA256':sha(OWN/f'{name}.stdout.txt'),'stderrPath':str(REL/f'{name}.stderr.txt'),'stderrSHA256':sha(OWN/f'{name}.stderr.txt')})
 print(json.dumps({'command':name,'actualExitCode':r.returncode,'stdout':r.stdout[:380],'stderr':r.stderr[:380]}),flush=True)
 assert r.returncode==0,r.stderr
shutil.copy2(ISO/REL/'positive-evidence.review.jsonl',OWN/'positive-evidence.review.jsonl')
m=read(OWN/'native-finalbook/bundle/book-model.json');b=read(OWN/'native-finalbook/batch-manifest.json');pdf=read(OWN/'native-finalbook/bundle/book.pdf.render-manifest.json')
assert len(m['pages'])==9 and b['curriculumAtomicDenominatorAtPreparation']==376
assert not list((OWN/'native-finalbook/round-a/results').iterdir()) and not list((OWN/'native-finalbook/round-b/results').iterdir())
receipt={'status':'PASS_inactive_nine_page_native_candidate_preparation_only','nativeNinePrepareObservedExitCode':0,'nativeNinePreparedModelDigest':m['digest'],'commands':rows,'goalPages':9,'physicalPages':pdf['physicalPageCount'],'nativeModelDigest':m['digest'],'bundleFingerprint':b['artifacts']['bundleFingerprint'],'reviewInputFingerprint':b['artifacts']['reviewInputFingerprint'],'fiveNewScientificCandidates':5,'fourExistingTargetedBindings':4,'curricularAtomicDenominator':376,'D2ResultDirectoriesEmpty':True,'DReviewsConducted':0,'PProfilesCandidateOnly':5,'PIndependentApproval':False,'latestFullMCurrent':376,'B014FullMOther371RawLinesUnchanged':True,'knownStoredD726ImageBindingGapClosed':False,'strictClosure':0,'humanApproval':False,'activeWrites':0}
(OWN/'native-preparation-terminal.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
