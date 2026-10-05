from pathlib import Path
from datetime import datetime,timezone
import json,hashlib
ROOT=Path.cwd();OWN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-prospective-book-current-v1';ISO=ROOT/'tmp/biologie-q1-gel-native-isolated-20261005-v1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(name,x):(OWN/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
base=json.loads((OWN/'isolation-and-native-code-baseline.receipt.json').read_text());code=[]
for row in base['nativeAppScriptsAndRootScriptsCopiedUnmodified']:
 if Path(row['path']).suffix not in ['.ts','.mts','.cts','.mjs','.cjs','.js']:continue
 assert sha(ROOT/row['path'])==row['sha256']==sha(ISO/row['path'])
 code.append({'path':row['path'],'sha256':row['sha256'],'actualRootAndIsolatedNativeCodeUnchanged':True})
codebytes=json.dumps(code,sort_keys=True,separators=(',',':')).encode();codehash=hashlib.sha256(codebytes).hexdigest()
write('whole-native-codehash-and-active-boundary.receipt.json',{'status':'PASS_unmodified_native_code','nativeCodeFileCount':len(code),'aggregateSHA256':codehash,'allNativeCodeFiles':code,'sourceAtlasDataOutputsAreAllowedProspectiveInputsNotCodeChanges':True,'allThreeActiveCanonQASemanticInputsUnchanged':all(sha(ROOT/r['path'])==r['baselineSHA256'] for r in base['mutableInputsDetachedBeforeWrite']),'allThreeProspectiveFilesDetached':all(not (ISO/r['path']).is_symlink() for r in base['mutableInputsDetachedBeforeWrite']),'activeWrites':0})
assert all(sha(ROOT/r['path'])==r['baselineSHA256'] for r in base['mutableInputsDetachedBeforeWrite'])
# Independent native DAG inspection of the prepared graph, without re-reviewing any goal.
canon=json.loads((ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json').read_text());by={g['id']:g for g in canon['goals']};missing=[];cycles=[]
for kind in ['requires','contains']:
 done=set();active=set()
 def visit(id,path):
  if id in active:cycles.append({'kind':kind,'path':path+[id]});return
  if id in done:return
  active.add(id)
  for child in by[id].get(kind,[]):
   if child not in by:missing.append({'kind':kind,'from':id,'to':child});continue
   visit(child,path+[id])
  active.remove(id);done.add(id)
 for id in by:visit(id,[])
assert not missing and not cycles
bundle=OWN/'native-finalbook';model=json.loads((bundle/'bundle/book-model.json').read_text());page=model['pages'][0];manifest=json.loads((bundle/'batch-manifest.json').read_text());render=json.loads((bundle/'bundle/book.pdf.render-manifest.json').read_text())
assert len(model['pages'])==1 and page['goalId']=='8eb86a82-122d-5cae-8f80-bb2850b29c2f' and page['evidenceReview'] is None
assert len(page['applicability'])==2 and {g['jurisdiction'] for g in page['applicability']}=={'DE-HE','DE-BY'}
assert render['goalPageCount']==1 and render['physicalPageCount']==3 and render['frontMatterPageCount']==2
assert page['visualization']['approvedForPublication'] is False and page['visualization']['qaStatus']=='review_candidate'
for r in ['round-a','round-b']:
 assert not list((bundle/r/'results').iterdir())
write('native-preparation.terminal.receipt.json',{'preparedAtUTC':datetime.now(timezone.utc).isoformat(),'isolationRoot':str(ISO),'nativeCommands':[{'args':['node','scripts/import_goal_visualization.mjs'],'actualExitCode':0,'toolChunkId':'13f4ea','detail':'Full exact argv retained in native-image-import.terminal.receipt.json'},{'args':['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'],'actualExitCode':0,'toolChunkId':'c9e6b9','counts':{'canonicalCurricularAtomicGoals':363,'publishedCurricularAtomicGoals':363,'sourceViews':20,'unresolvedSourceScopeDecisions':0,'omittedGoals':0}},{'args':['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json','--check'],'actualExitCode':0,'toolChunkId':'de8ebd'},{'args':['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(OWN.relative_to(ROOT)/'batch.config.json')],'actualSessionId':62909,'actualExitCode':0,'toolChunkId':'f0c4c0'},{'args':['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(OWN.relative_to(ROOT)/'batch.config.json')],'actualExitCode':0,'toolChunkId':'27879c'}],'goalIds':[page['goalId']],'currentGoalCount':441,'currentCurricularAtomicDenominator':363,'containsAndRequiresMissingEdges':missing,'containsAndRequiresCycles':cycles,'bookDigest':model['digest'],'bundleFingerprint':manifest['artifacts']['bundleFingerprint'],'goalFingerprint':page['goalFingerprint'],'pageFingerprint':page['pageFingerprint'],'sourceBookFutureActivePath':model['source']['landscapePath'],'sourceGoalQAStillHumanNo':True,'actualRenderedPDFGoalPageViewed':True,'PDFRasterPath':str((OWN/'actual-final-pdf-goal-page.png').relative_to(ROOT)),'PDFRasterSHA256':'sha256:'+sha(OWN/'actual-final-pdf-goal-page.png'),'goalPDFCompletePage':True,'twoDistinctNativeBlindCampaignsPrepared':True,'reviewResultsStillEmpty':True,'PContentsAbsent':True,'DReviewsCompleted':0,'strictNetDelta':0,'humanApproval':False,'activeWrites':0,'remainingCurrent37ClosedPageFingerprintComparison':'Not performed in this preparation; root integration owner will compare current strict closed goal/page/context bindings before active adoption, including possible PCR reverse-requires context effects.'})
inputs=json.loads((OWN/'prepared-prospective-input-tree.receipt.json').read_text())
for r in inputs['files']:
 assert 'sha256:'+sha(ROOT/r['prospectiveCopyPath'])==r['sha256']=='sha256:'+sha(ISO/r['futureActivePath'])
write('prepared-34-inputs.immutable.receipt.json',{'status':'PASS_exact_future_path_bytes','fileCount':len(inputs['files']),'files':inputs['files'],'activeWrites':0})
# Snapshot only native prepared inputs. Later reviewer result files are expressly outside this freeze.
files=[]
for p in sorted(OWN.rglob('*')):
 if not p.is_file() or p.name in ['prepared.freeze.manifest.json','prepared.freeze.manifest.sha256']:continue
 rel=p.relative_to(OWN)
 if any(part in ['results','resolutions'] for part in rel.parts):continue
 if p.name.startswith('own-description') or p.name.startswith('independent-review'):continue
 files.append({'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+sha(p),'bytes':p.stat().st_size})
freeze={'status':'FROZEN_NATIVE_PROSPECTIVE_FINALBOOK_INPUTS','authority':'native_preparation_ai_candidate','preparedAtUTC':datetime.now(timezone.utc).isoformat(),'ownFiles':files,'immutableFutureInputFiles':len(inputs['files']),'nativeCodeAggregateSHA256':codehash,'nativeModelDigest':model['digest'],'nativeBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'goalFingerprint':page['goalFingerprint'],'pageFingerprint':page['pageFingerprint'],'exactFutureCanonicalPath':model['source']['landscapePath'],'independentFinalDReviewsPending':True,'reviewerResultsExcludedFromPreparedInputFreeze':True,'PIntegrationPending':True,'strictNetGain':0,'humanApproval':False,'activeWrites':0}
write('prepared.freeze.manifest.json',freeze);hash=sha(OWN/'prepared.freeze.manifest.json');(OWN/'prepared.freeze.manifest.sha256').write_text(hash+'\n')
print(json.dumps({'status':freeze['status'],'ownPreparedArtifacts':len(files),'exactFutureInputFiles':len(inputs['files']),'nativeCodeFiles':len(code),'nativeCodeAggregateSHA256':codehash,'preparedFreezeSHA256':hash,'strictDelta':0}))
