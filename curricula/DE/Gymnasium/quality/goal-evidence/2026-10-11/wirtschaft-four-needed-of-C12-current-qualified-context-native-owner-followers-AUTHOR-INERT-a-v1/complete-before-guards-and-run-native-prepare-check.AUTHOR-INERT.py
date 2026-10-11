import pathlib,json,hashlib,datetime,subprocess,os
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
p=json.loads((O/'actual-four-needed-native-groups-original-science-and-eight-reused-strict-contexts.AUTHOR-INERT.json').read_text());guards=set()
def bind(p):b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def paths(v):
 if isinstance(v,dict):
  if isinstance(v.get('path'),str)and(R/v['path']).is_file():guards.add(v['path'])
  for x in v.values():paths(x)
 elif isinstance(v,list):
  for x in v:paths(x)
paths(p)
bookPath=R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json';book=json.loads(bookPath.read_text());guards.update(['app/scripts/config/goal-books/de-gym-economics-current-canonical.json',book['landscapePath'],book['compositionViewPath'],book['semanticKindLedgerPath'],book['goalVisualizationQaPath'],*book['evidenceReviewPaths']]);can=json.loads((R/book['landscapePath']).read_text());gb={g['id']:g for g in can['goals']}
for g in p['nativeGroups']:
 paths(json.loads((R/g['currentQualifiedWholeInput']['path']).read_text()));guards.update(str(p.relative_to(R))for p in (R/g['exactWholeScienceHistoryDirectory']).rglob('*')if p.is_file()and not p.is_symlink());cfg=json.loads((R/g['configPath']).read_text());guards.add(g['configPath']);
 for v in gb[g['goalIds'][0]].get('resourceLinks',[]):
  url=v.get('url','');path=R/('app/public'+url)
  if url.startswith('/')and path.is_file():guards.add(str(path.relative_to(R)))
for d in ['contracts/goal-description-review','contracts/goal-book','contracts/goal-evidence']:
 guards.update(str(p.relative_to(R))for p in (R/d).rglob('*.json')if p.is_file())
for v in ['materializeGoalDescriptionRolloutBatch.ts','createGoalDescriptionReviewCampaign.ts','validateGoalDescriptionReviewCampaign.ts','materializeGoalDescriptionRolloutSynthesisManifest.ts','materializeGoalDescriptionRolloutResolutions.ts','reportDeepUnderstandingRollout.ts']:
 guards.add('app/scripts/'+v)
before={'observedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputBindings':[bind(R/v)for v in sorted(guards)],'actualRegistryAtNativePreparation':bind(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'originalAuthorPlanningRegistryWas52Indices':p['actualRegistryAtAuthorStart'],'documentedRoot45ExternalAdvanceTo67Indices':'Root6/03 actual activation independently qualified before this native prepare; no consumed CAN/P/Book/QA/source/science changes.','ownGuardCollectionCorrection':'Initial guard collector named a nonexistent prepareGoalDescriptionReviewCampaign.ts and stopped before native execution. Original original materializer/createCampaign paths now bound. Four configs/plan created before that guard collection retained unchanged. No native call failed.'};(O/'actual-consumed-input-before-guards.READONLY.json').write_text(json.dumps(before,ensure_ascii=False,indent=2)+'\n')
node=pathlib.Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();env=os.environ.copy();env['PATH']=str(pathlib.Path(node).parent)+':/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/bin:'+env['PATH'];env['LD_LIBRARY_PATH']='/tmp/skillpilot-native-poppler-56ptay2_/extracted/usr/lib/x86_64-linux-gnu:'+env.get('LD_LIBRARY_PATH','');env['FONTCONFIG_FILE']='/tmp/skillpilot-native-liberation-fonts-4dyn_jva/fonts.conf';env['GOAL_BOOK_CHROMIUM_EXECUTABLE_PATH']='/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';argv=[node,'app/node_modules/tsx/dist/cli.mjs',str((O/'prepare-check-four-actual-original-native-groups.AUTHOR-INERT.mts').relative_to(R))];start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (O/'01-original-native-four-prepare-check.raw.txt').open('x')as f:result=subprocess.run(argv,cwd=R,env=env,stdout=f,stderr=subprocess.STDOUT)
receipt={'actualArgv':argv,'startedAtUtc':start,'completedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':result.returncode,'rawLog':bind(O/'01-original-native-four-prepare-check.raw.txt'),'activeWrites':0,'newReviewInference':False};(O/'01-original-native-four-prepare-check.command-receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(receipt));raise SystemExit(result.returncode)
