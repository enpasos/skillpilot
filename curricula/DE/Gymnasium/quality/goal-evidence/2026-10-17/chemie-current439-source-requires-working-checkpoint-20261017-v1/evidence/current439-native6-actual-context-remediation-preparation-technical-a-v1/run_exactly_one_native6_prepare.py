from pathlib import Path
import os,json,hashlib,subprocess,tempfile,shutil,datetime,time
O=Path(__file__).parent;C=O/'capsule'
H=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':H(b),'bytes':len(b)}
def check(p):
 q=pin(p['path']);assert q['sha256']==p['sha256'] and q['bytes']==p['bytes'],p['path']
def write(n,x):
 p=O/n
 with p.open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
 return pin(p)
assert not (O/'EXECUTION.native6-prepare.started.json').exists(),'Already started; observe existing handle, never restart on observation timeout.'
cmd=json.loads((O/'COMMAND.intended-exactly-one-native6-prepare.after-admin-ledger-check.json').read_text())
cas=json.loads((O/'CAS.explicit-three-claim-admin-handoff-and-new6.whole-before-after.json').read_text())
api=json.loads((O/'CHECK.actual-stock-ledger-schema-and-global-six-ownership.json').read_text())
assert api['stockLoaderSucceeded'] and api['activeBatchConfigCount']==16 and api['activeClaimGoalCount']==174
for k in ['config','baseConfig','activeLedger','stockEntry','batchConfigSchema','unchangedPrompt','unchangedCriteria','QA']:check(cmd[k])
config=json.loads(Path(cmd['config']['path']).read_text());out=C/config['outputDirectory'];assert not out.exists()
runtime=Path(tempfile.mkdtemp(prefix='skillpilot-native6-prepare-a-',dir='/dev/shm'))
env=os.environ.copy();env.update({'TMPDIR':str(runtime),'TSX_DISABLE_CACHE':'1','NO_COLOR':'1'})
start=write('EXECUTION.native6-prepare.started.json',{'role':'Exactly one actual stock native6 prepare; no review result or integration','startedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':cmd['argv'],'cwd':cmd['cwd'],'command':pin(O/'COMMAND.intended-exactly-one-native6-prepare.after-admin-ledger-check.json'),'adminCAS':pin(O/'CAS.explicit-three-claim-admin-handoff-and-new6.whole-before-after.json'),'stockLedgerAPICheck':pin(O/'CHECK.actual-stock-ledger-schema-and-global-six-ownership.json'),'runtimeOnlyLinuxTmp':str(runtime),'durableOutputsOnlyE':True,'restartOnObservationTimeout':False})
t=time.monotonic()
with (O/'native6.prepare.stock.stdout.txt').open('xb') as so,(O/'native6.prepare.stock.stderr.txt').open('xb') as se:
 p=subprocess.Popen(cmd['argv'],cwd=C,env=env,stdout=so,stderr=se)
 print(json.dumps({'preparePID':p.pid,'startedReceipt':start,'outputDirectory':str(out),'observationTimeoutIsNotCancellation':True}),flush=True)
 code=p.wait()
elapsed=time.monotonic()-t
unchanged=[]
for pp in [cas['originalLedgerPin']]+[r['sourceF'] for r in cas['all15OriginalClaimBytesPreserved']]+[r['sourceR'] for r in cas['all15OriginalClaimBytesPreserved']]+[r['newCapsule'] for r in cas['unchangedCoreInputsAnd39ViewsAndPrompts']]+[cmd['QA'],cmd['activeLedger'],cmd['config']]:
 check(pp);unchanged.append(pp)
receipt={'role':'Actual native6 technical prepare only; zero Science/native/M votes','exitCode':code,'elapsedSeconds':elapsed,'actualPrepareInvocationCount':1,'argv':cmd['argv'],'cwd':cmd['cwd'],'stockStdout':pin(O/'native6.prepare.stock.stdout.txt'),'stockStderr':pin(O/'native6.prepare.stock.stderr.txt'),'checkedUnchangedInputPins':unchanged,'MainOldFAndRAndL6Writes':False,'noFull439PDFBuildCentralOrCompiler':True,'M7':False,'HumanApproval':False}
if code==0:
 manifest=json.loads((out/'batch-manifest.json').read_text());model=json.loads((out/'bundle/book-model.json').read_text());pdfManifest=json.loads((out/'bundle/book.pdf.render-manifest.json').read_text())
 assert manifest['goalIds']==cmd['exactSixOrder']==[p['goalId'] for p in model['pages']]
 assert manifest['curriculumAtomicDenominatorAtPreparation']==439 and len(model['pages'])==6
 assert pdfManifest['goalPageCount']==6
 assert all(not list((out/r/'results').iterdir()) for r in ['round-a','round-b']) and not list((out/'resolutions').iterdir())
 receipt.update({'outputDirectory':str(out),'manifest':pin(out/'batch-manifest.json'),'model':pin(out/'bundle/book-model.json'),'pdf':pin(out/'bundle/book.pdf'),'html':pin(out/'bundle/book.html'),'exactSixGoalOrder':manifest['goalIds'],'fullBaseDenominator':439,'renderedGoalPages':6,'physicalPDFPages':pdfManifest['physicalPageCount'],'frontMatterPages':pdfManifest['frontMatterPageCount'],'roundBindings':manifest['artifacts']['rounds'],'roundResultsAndResolutionsEmpty':True})
 # Freeze only generated input files. Result directories remain empty; no votes are fabricated.
 for dp,dirs,files in os.walk(out,followlinks=False):
  for name in files:
   q=Path(dp)/name
   if not q.is_symlink():q.chmod(0o444)
result=write('EXECUTION.native6-prepare.completed.json',receipt)
shutil.rmtree(runtime)
print(json.dumps({'exitCode':code,'elapsedSeconds':elapsed,'receipt':result,'manifest':receipt.get('manifest'),'renderedGoalPages':receipt.get('renderedGoalPages'),'physicalPDFPages':receipt.get('physicalPDFPages'),'roundResultsAndResolutionsEmpty':receipt.get('roundResultsAndResolutionsEmpty')},ensure_ascii=False),flush=True)
raise SystemExit(code)
