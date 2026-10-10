# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess, sys, time
R=Path(__file__).resolve().parents[8];P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-machine-content-native-readiness-author-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';O=P.parent/'chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1'
assert not (R/P/'author-current517.final.freeze.json').exists()
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def run(label,args):
 while (R/P/'terminal'/f'{label}.terminal.actual.json').exists():label+='-next-attempt'
 start=time.monotonic();at=datetime.datetime.now(datetime.timezone.utc).isoformat();command=[str(R/'app/node_modules/.bin/tsx'),*args];r=subprocess.run(command,cwd=C,capture_output=True,text=True)
 put('terminal/'+label+'.terminal.actual.json',{'schemaVersion':1,'argv':command,'cwdDiagnosticOnly':str(C),'startedAt':at,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'stdout':r.stdout,'stderr':r.stderr,'normalRulesChanges':0,'activeWrites':[],'independentApproval':False})
 print(json.dumps({'label':label,'exit':r.returncode,'stdoutTail':r.stdout[-1600:],'stderrTail':r.stderr[-1700:]},ensure_ascii=False),flush=True);return r
def sync():shutil.copytree(R/P,C/P,dirs_exist_ok=True)
sync()
if '--base' in sys.argv:
 qa=run('normal-current517-QA-generation',['app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie'])
 assert qa.returncode==0
 shutil.copyfile(C/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',R/P/'candidate/current517-normal-QA.inactive.json')
 ledger=json.loads((R/P/'candidate/current517-semantic-kinds.inactive.json').read_text());ledger['sourceLandscapePath']=str(P/'candidate/whole517.inactive.machine-content-final-author.json');put('candidate/current517-semantic-kinds.portable.inactive.json',ledger)
 cfg=json.loads((R/P/'native/current398-whole-P205-normal-model.config.json').read_text());cfg.update(landscapePath=ledger['sourceLandscapePath'],semanticKindLedgerPath=str(P/'candidate/current517-semantic-kinds.portable.inactive.json'),goalVisualizationQaPath=str(P/'candidate/current517-normal-QA.inactive.json'));put('native/current398-whole-P205-normal-model.config.json',cfg)
 # Reproduce final normal book using actual regenerated QA and current profiles.
 src=(C/'app/scripts/generateCurriculumQualityStatus.ts').read_text();suffix='\n// Technical execution exports only; complete original rules unchanged.\nexport { routeProfiles, evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, evaluateSourceSnapshotIngestion, evaluateJurisdictionCoverage, evaluateSourceGoalCountPlausibility, evaluateSemanticAtomicity, evaluateMemoryCardReview, evaluateCompositionViews, evaluateApplicabilityWarnings, readJurisdictionCoverageByLandscapeId, readMappingPipelineByLandscapeId, readSemanticConfigs, readMemoryCardReviewConfigs, readCompositionViewCountsByLandscapeId, readApplicabilityWarningMetricsByLandscapeId };\n'
 export=C/'app/scripts/generateCurriculumQualityStatus.current517-author-technical-exports.ts';export.write_text(src+suffix)
 put('checks/normal-route-LayerA-export-boundary.actual.json',{'schemaVersion':1,'completeOriginalSourceSha256':'sha256:'+hashlib.sha256(src.encode()).hexdigest(),'completeOriginalCodePreserved':True,'exactExportSuffix':suffix,'normalRuleBodyChanges':0,'selectorsThresholdsChanges':0})
 ac=str(P/'source-atlas/current517-bounded378-normal.inputs.json');source=json.loads((R/ac).read_text());bookout='app/scripts/config/goal-books/inactive-chemie-current517-final-author-20261010-v1';source.update(landscapePath=ledger['sourceLandscapePath'],semanticKindLedgerPath=str(P/'candidate/current517-semantic-kinds.portable.inactive.json'),outputDirectory=bookout+'/source-views',manifestPath=bookout+'/source-manifest.json',navigationViewPath=bookout+'/navigation.view.json');put('source-atlas/current517-bounded378-normal.inputs.json',source);sync()
 atlas=run('normal-current517-source-bounded378-build',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',ac]);assert atlas.returncode==0
 check=run('normal-current517-source-bounded378-check',['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',ac,'--check']);assert check.returncode==0
 shutil.copytree(C/bookout,R/P/'source-atlas/generated-actual',dirs_exist_ok=True)
 manifest=json.loads((R/P/'source-atlas/generated-actual/source-manifest.json').read_text());manifest['navigationViewPath']=str(P/'source-atlas/generated-actual/navigation.view.json');manifest['sourcePaths']=[str(P/'source-atlas/generated-actual/source-views'/Path(s).name)for s in manifest['sourcePaths']];put('source-atlas/portable-current517-bounded378.source-manifest.json',manifest)
 aliases=[]
 for f in sorted((C/bookout).rglob('*')):
  if f.is_file():
   logical=str(f.relative_to(C));physical=P/'source-atlas/generated-actual'/f.relative_to(C/bookout);raw=(R/physical).read_bytes();assert raw==f.read_bytes();aliases.append({'normalBookLocalLogicalOutputPath':logical,'portableFrozenArtifact':{'path':str(physical),'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}})
 put('checks/normal-source-outputs-exact-portable-copy-aliases.json',{'schemaVersion':1,'normalGeneratorBookLocalRestrictionPreserved':True,'rawNormalOutputsExact':aliases,'portableManifestPath':str(P/'source-atlas/portable-current517-bounded378.source-manifest.json'),'portableManifestOnlyPathSubstitutionNoScopeChanges':True})
 sync();scoped=run('normal-current517-scoped-route-source-LayerA',[str(R/P/'technical/normal_current517_scoped_checks.mts'),'--root',str(R),'--capsule',str(C)]);assert scoped.returncode==0
if '--native' in sys.argv:
 sync()
 model=json.loads((R/P/'native/current398-whole-P205-normal-model.actual.json').read_text());ids=json.loads((R/P/'native/protected12.normal-rollout.batch.config.json').read_text())['goalIds'];copies=[]
 for page in model['pages']:
  if page['goalId'] not in ids:continue
  url=page['visualization']['url'];target=C/'app/public'/url.lstrip('/');source=R/'app/public'/url.lstrip('/');before=target.read_bytes();assert before==source.read_bytes()
  if target.parent.is_symlink():target.parent.unlink();target.parent.mkdir()
  shutil.copyfile(source,target);assert target.read_bytes()==before
  copies.append({'goalId':page['goalId'],'publicPath':'app/public/'+url.lstrip('/'),'sha256':'sha256:'+hashlib.sha256(before).hexdigest(),'bytes':len(before),'withinOwnCapsulePublicRoot':target.resolve().is_relative_to(C/'app/public'),'unchangedOriginalImageBytes':True})
 put('checks/protected12-normal-public-root-exact-local-copy-restoration.json',{'schemaVersion':1,'reason':'Normal renderer refuses source symlinks resolving outside capsule public root; own capsule replaces only symlinks with exact byte copies. No source or image edit.','rows':copies,'activeWrites':[]})
 for group in (['protected12']if '--protected-only' in sys.argv else ['current20','current6','protected12']):
  config=str(P/f'native/{group}.normal-rollout.batch.config.json');prep=run('normal-current517-D38-'+group+'-prepare',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',config]);assert prep.returncode==0
  checked=run('normal-current517-D38-'+group+'-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',config]);assert checked.returncode==0
  shutil.copytree(C/P/'native'/group,R/P/'native'/group)
if '--am-central' in sys.argv:
 sync();subject=json.loads((R/P/'registry/chemie-subject.current517-technical-context-candidate.inactive.json').read_text())
 configs=[p for p in subject['semanticAtomicityConfigPaths']if p.startswith(str(O))];assert len(configs)==2
 for i,p in enumerate(configs):run('normal-current517-atomicity-'+str(i+1),['app/scripts/semanticAtomicityReview.ts','--config='+p,'--mode=check'])
 # Config's reportPath is historical: use an own successor before normal execution.
 mc=json.loads((R/subject['memoryReviewConfigPath']).read_text());mc['reportPath']=str(P/'checks/current398-memory.normal.report.md');mp=P/'memory/current398.normal-targeted.config.json';put('memory/current398.normal-targeted.config.json',mc);sync();run('normal-current517-Memory',['app/scripts/memoryCardReview.ts','--config='+str(mp),'--mode=check'])
 for i,p in enumerate(subject['positiveEvidenceConfigPaths']):
  if p.startswith(str(P)):run('normal-current517-P37-config-'+str(i+1),['app/scripts/positiveGoalEvidenceReview.ts','--config='+p,'--mode=check'])
 central=run('normal-current517-central-readiness-pending-native-review',['app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(P/'registry/chemie-only-current517-normal-check.inactive.config.json'),'--mode=check','--format=json'])
 if central.stdout.lstrip().startswith('{'):put('checks/normal-current517-central-readiness.actual.report.json',json.loads(central.stdout))
