# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,concurrent.futures,hashlib,os
root=Path.cwd();h=Path(__file__).resolve().parent;rel=str(h.relative_to(root));meta=json.loads((h/'prospective-paths.json').read_text());tsx='app/node_modules/.bin/tsx';nr=str(Path(meta['nativeInputRoot']).relative_to(root)/'app/scripts');logs=h/'terminal-final-native-checks';logs.mkdir(exist_ok=True)
commands=[
 ('D18',[tsx,nr+'/materializeGoalDescriptionRolloutBatch.ts','check','--config',rel+'/batch.config.json']),
 ('D5',[tsx,nr+'/materializeGoalDescriptionRolloutBatch.ts','check','--config',rel+'/existing-five-bindings.batch.config.json']),
 ('P13',[tsx,nr+'/positiveGoalEvidenceReview.ts','--mode=check','--config='+rel+'/positive.thirteen.native-author.config.json']),
 ('P5',[tsx,nr+'/positiveGoalEvidenceReview.ts','--mode=check','--config='+rel+'/positive.five-predecessor.native-author.config.json']),
 ('A13',[tsx,'app/scripts/semanticAtomicityReview.ts','--mode=check','--config='+rel+'/atomicity.thirteen.native-author.config.json']),
 ('M13cards10visibility',[tsx,'app/scripts/memoryCardReview.ts','--mode=check','--config='+rel+'/memory.thirteen.native-author.config.json']),
 ('actualViews',[tsx,rel+'/verify_memory_visibility.mts']),
 ('atlas383',[tsx,rel+'/check_native_atlas.mts']),
 ('protected49',[tsx,rel+'/verify_current_protection.mts','49'])]
external=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.json','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json']
external=[p for p in external if (root/p).exists()]
hashes=lambda:[{'path':p,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest(),'bytes':(root/p).stat().st_size} for p in external]
before=hashes()
def run(item):
 key,argv=item;z=subprocess.run(argv,cwd=root,capture_output=True,text=True);p=logs/(key+'.actual.stdout.txt');p.write_text(z.stdout+z.stderr);return {'check':key,'argv':argv,'exitCode':z.returncode,'actualOutputPath':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(run,commands))
after=hashes();assert before==after,'Active inputs changed during read-only native validation'
receipt={'candidateOnly':True,'authorTechnicalValidationOnly':True,'currentIndependentDReviews':0,'currentIndependentVApprovals':0,'humanApprovals':0,'activeInputsBefore':before,'activeInputsAfterExactlyIdentical':True,'allChecksPassed':all(r['exitCode']==0 for r in results),'results':results,'newScienceClosures':0,'restoredBindingClaims':0}
(h/'terminal-final-native-checks.actual.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'passed':sum(r['exitCode']==0 for r in results),'total':len(results),'activeInputsUnchanged':True}));assert receipt['allChecksPassed']
