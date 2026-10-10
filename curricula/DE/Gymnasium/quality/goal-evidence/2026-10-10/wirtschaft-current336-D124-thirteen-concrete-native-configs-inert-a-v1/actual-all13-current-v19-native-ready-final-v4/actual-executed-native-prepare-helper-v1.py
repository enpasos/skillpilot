from pathlib import Path
import os,json,subprocess,time,hashlib,datetime,sys
R=Path('/home/enpasos/projects/skillpilot').resolve()
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current336-D124-thirteen-concrete-native-configs-inert-a-v1'
S=O/'actual-native-preparation-authorized-v19'
S.mkdir(exist_ok=True)
index=json.loads((O/'actual-thirteen-concrete-current-ID-config-index.INERT.json').read_text())
selected=[int(x) for x in sys.argv[1].split(',')]
assert selected and len(set(selected))==len(selected) and all(1<=i<=13 for i in selected)
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
env=os.environ.copy();env['PATH']=str(Path(node).parent)+os.pathsep+env['PATH'];env['PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin'+os.pathsep+env['PATH'];env['LD_LIBRARY_PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu'+(os.pathsep+env['LD_LIBRARY_PATH'] if env.get('LD_LIBRARY_PATH') else '');env['FONTCONFIG_FILE']='/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf';env['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH']='/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,j):
 assert p.resolve().is_relative_to(S.resolve()) and not p.exists()
 p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
auth=S/'actual-Root-v19-seven-green-targeted-checks-and-native-prepare-authorization.receipt.json'
if not auth.exists():
 write(auth,{'authority':'Actual coordinator Root instruction received in this agent session','observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'qualifiedV19ActivationRootNotice':True,'rootSevenTargetedChecksActualPass':{'graphSeconds':5.831,'atomicitySeconds':.382,'memorySeconds':.412,'visualAssetsSeconds':18.482,'sourceInventorySeconds':.810,'positive16Seconds':.518,'positive43Seconds':.464},'actualNativePrepareAuthorized':True,'parallelLimit':'At most one own preparation browser while Root normal full Book/browser lane is running; all own batches run sequentially here.','normalPublicBookBuildStillRootOwned':True,'correctionToEarlierScaffolding':'The previous INERT config freeze contains a pending-green readiness scaffold. The actual green Root notice arrived before the final concrete config seal; this additive receipt corrects that stale temporal wording without changing any config, planned ID or historical file. Static config checking itself still grants no permission.','allActiveCoreWritesRemainRootOnly':True,'independentSpecialRoundA':'/root','independentSpecialRoundB':'/root/economics_m2_views_independent_b','descriptionAuthorDoesNotReviewSpecial2':True,'noRoundScientificApproval':True})
base=R/index['baseGoalBookConfigPath'];cfg=json.loads(base.read_text())
reg=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';j=json.loads(reg.read_text());econ=next(x for x in j['subjects'] if x['subject']=='wirtschaftswissenschaften')
assert cfg['semanticKindLedgerPath']==econ['semanticKindLedgerPath'] and 'v19' in cfg['semanticKindLedgerPath']
assert cfg['landscapePath']==econ['landscapePath']
inputs=[base,R/cfg['landscapePath'],R/cfg['semanticKindLedgerPath'],R/cfg['compositionViewPath'],R/cfg['goalVisualizationQaPath'],*[R/x for x in cfg['evidenceReviewPaths']]]
inputs_before=[bind(p) for p in inputs]
assert inputs_before[1]['sha256']=='sha256:bdf73eed3e5448ebb269deaa463e50a17d747d7c013344a3fad42610ac1d7fbf'
for p in inputs:
 assert not p.is_symlink() and p.resolve().is_relative_to(R)
rows=[]
for i in selected:
 row=index['configurations'][i-1];config_path=R/row['config']['path'];assert bind(config_path)==row['config']
 config=json.loads(config_path.read_text());output=R/config['outputDirectory'];assert not output.exists()
 assert output.resolve().is_relative_to(O.resolve())
 for mode in ['prepare','check']:
  label=f'batch-{i:02d}-{mode}';stdout=S/(label+'.stdout.txt');stderr=S/(label+'.stderr.txt');assert not stdout.exists() and not stderr.exists()
  argv=[node,str(R/'app/node_modules/tsx/dist/cli.mjs'),'scripts/materializeGoalDescriptionRolloutBatch.ts',mode,'--config',str(config_path.relative_to(R))]
  start=time.monotonic()
  with stdout.open('x') as out,stderr.open('x') as err:result=subprocess.run(argv,cwd=R/'app',env=env,stdout=out,stderr=err)
  receipt={'label':label,'argv':argv,'cwd':str(R/'app'),'actualExitCode':result.returncode,'seconds':round(time.monotonic()-start,3),'stdout':bind(stdout),'stderr':bind(stderr),'config':bind(config_path),'currentSourceBefore':inputs_before,'actualEnvironment':{k:env[k] for k in ['PATH','LD_LIBRARY_PATH','FONTCONFIG_FILE','GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH']},'authorization':bind(auth),'noScientificReviewClaimed':True}
  write(S/(label+'.actual-command-exit.json'),receipt);rows.append(receipt)
  print(json.dumps({'package':i,'mode':mode,'actualExitCode':result.returncode,'seconds':receipt['seconds'],'outputDirectory':str(output.relative_to(R))}),flush=True)
  if result.returncode:sys.exit(result.returncode)
 manifest=json.loads((output/'batch-manifest.json').read_text());assert manifest['goalIds']==row['goalIds'] and manifest['curriculumAtomicDenominatorAtPreparation']==336
 assert manifest['reviewPolicy']['automaticAcceptance'] is False and manifest['reviewPolicy']['blindIndependentFirstPass'] is True
 assert [bind(p) for p in inputs]==inputs_before
 packet={'packageNumber':i,'actualPrepared':True,'actualNativeChecked':True,'configuredGoalIds':row['goalIds'],'batchManifest':bind(output/'batch-manifest.json'),'reviewInputPath':str((output/'bundle/review-input.json').relative_to(R)),'bookModelPath':str((output/'bundle/book-model.json').relative_to(R)),'currentSourceBindings':inputs_before,'reviewerAssignment':row['reviewerAssignment'],'roundAInputPath':str((output/'round-a').relative_to(R)),'roundBInputPath':str((output/'round-b').relative_to(R)),'preparedOnlyNoDApproval':True,'formalRoundResultsExist':False}
 write(S/f'batch-{i:02d}-actual-native-ready-packet.receipt.json',packet)
 print(json.dumps({'package':i,'nativeReadyPacket':str((S/f'batch-{i:02d}-actual-native-ready-packet.receipt.json').relative_to(R))}),flush=True)
write(S/('actual-native-prepare-check-packages-'+','.join(str(i) for i in selected)+'.receipt.json'),{'actualCommands':rows,'configuredIDs':sum(len(index['configurations'][i-1]['goalIds']) for i in selected),'actualPassedNativeCommands':len(rows),'nativeOnlyNoScientificApprovals':True,'publicNormalBookOwnedByRoot':True,'currentInputEndguardsWholeExact':[bind(p) for p in inputs]==inputs_before})
