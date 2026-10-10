# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,shutil,subprocess,importlib.util,datetime,jsonschema
from referencing import Registry,Resource
R=pathlib.Path('/home/enpasos/projects/skillpilot');BASE=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');P=BASE/'biologie-neuro-ten-current343-dual-D-P-V-inactive-integration-technical-root-20261010-v1'
def read(p):return json.loads((R/p).read_text())
def ref(p):p=pathlib.Path(p);b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,j):f=R/P/p;assert not f.exists(),f;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
def verify(x):assert ref(x['path'])=={k:x[k] for k in ['path','sha256','bytes']},x['path']
plan=read(P/'ROOT.current343-ten-reviewed-final-copy-plan.inactive.json');ids=[x['goalId'] for x in read(P/'checks/genuine-current-V10-pair-technical-transfer.json')['records']];term=read(P/'terminal/candidate-current353-final-normal-central.terminal.actual.json');assert term['exitCode']==0
beforePath=BASE/'biologie-stoffwechsel-eight-reviewed-active-adoption-technical-root-v1/checks/central-current394-eight-check.stdout.actual.txt';before=read(beforePath);after=read(P/'terminal/candidate-current353-final-normal-central.stdout.actual.txt');assert after['blockingIssueCount']==0;actual=[]
for a in after['subjects']:
 b=next(x for x in before['subjects'] if x['subject']==a['subject']);assert a['currentGoalIds']==b['currentGoalIds'];new=set(a['strictCompleteGoalIds'])-set(b['strictCompleteGoalIds']);lost=set(b['strictCompleteGoalIds'])-set(a['strictCompleteGoalIds']);assert not lost
 if a['subject']=='biologie':assert new==set(ids) and a['strictComplete']==353 and a['denominator']==394
 else:assert not new and a['strictCompleteGoalIds']==b['strictCompleteGoalIds']
 assert all(x['status']=='pass' for x in a['requiredChecks'])
 actual.append({'subject':a['subject'],'strictBefore':b['strictComplete'],'strictAfter':a['strictComplete'],'denominator':a['denominator'],'newGoalIds':sorted(new),'lostGoalIds':sorted(lost),'allCurrentIDsExact':True,'requiredChecks':a['requiredChecks']})
put('checks/actual-current353-inactive-strict-ID-gain-and-protected-subjects.json',{'schemaVersion':1,'before':ref(beforePath),'after':ref(P/'terminal/candidate-current353-final-normal-central.stdout.actual.txt'),'subjects':actual,'newScientificClosures':10,'restoredBindings':0,'strictNetGain':10,'lostPriorStrictIDs':0,'activeAdoptionStillRequired':True,'activeGain':0,'humanApproval':False})
for x in read(P/'inputs/current343-write-guards.exact.json')['files']:verify(x)
for op in plan['operations']:
 verify(op['source'])
 if op.get('expectedCurrentTarget'):verify(op['expectedCurrentTarget'])
for name in ['prepare.py','resolve.mts','resolve-final-selected.mts','resolve-final-precise.mts','check-final-model-source.mts','check-M6-source-routes.mts']:
 src=R/'tmp/m7-bio10-integration-root'/name;dst=R/P/'technical'/name;dst.parent.mkdir(exist_ok=True);assert not dst.exists();shutil.copyfile(src,dst)
shutil.copyfile(pathlib.Path(__file__),R/P/'technical/finalize-inactive.actual.py')
excluded={op['target'] for op in plan['operations']}|{'docs/legal/ai-transparency-inventory.json','app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'};external={}
freezes=[BASE/'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2/FINAL.current343-normal-P10-native10-Sehbahn-v3.technical.freeze.json',BASE/'biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3/FINAL.current343-eight-BY-primary-source-only-normal.technical.freeze.json',*map(lambda x:pathlib.Path(x['path']),plan['completedSourceReviewInputs'][1::2])]
for f in freezes:
 data=read(f);values=[ref(f)]
 for xs in data.values():
  if isinstance(xs,list):values.extend(x for x in xs if isinstance(x,dict) and set(['path','sha256','bytes'])<=set(x))
 for x in values:
  path=x['path']
  if path.startswith(str(P)+'/') or path in excluded or path.startswith('app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/'):continue
  x={k:x[k] for k in ['path','sha256','bytes']};verify(x)
  if path in external:assert external[path]==x
  external[path]=x
put('inputs/final-portable-immutable-external-bindings.exact.json',{'schemaVersion':1,'files':[external[k] for k in sorted(external)],'plannedMutableActiveTargetsExcluded':sorted(excluded),'sourceViewGeneratedOutputsExcluded':'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/','interpretation':'References to current active pre-adoption files inside historical evidence are transaction/history observations, not promises to freeze active filenames. Own before snapshots preserve exact history. No sealed historical file was altered.'})
spec=importlib.util.spec_from_file_location('normal_validate',R/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);runtime=read('docs/landscape-runtime.schema.json');reg=Registry();schemas={}
for base in ['contracts','docs']:
 for f in (R/base).rglob('*.schema.json'):
  x=json.loads(f.read_text())
  if x.get('$id'):reg=reg.with_resource(x['$id'],Resource.from_contents(x));schemas[x['$id']]=x
count=closed=lines=0
for f in (R/P).rglob('*'):
 if not f.is_file():continue
 assert not f.is_symlink(),f
 if f.suffix=='.json':
  assert m.validate_file(str(f),runtime),f;count+=1;x=json.loads(f.read_text())
  if x.get('$schema') in schemas:jsonschema.validators.validator_for(schemas[x['$schema']])(schemas[x['$schema']],registry=reg).validate(x);closed+=1
 if f.suffix=='.jsonl':
  for line in f.read_text().splitlines():
   if line.strip():json.loads(line);lines+=1
jsonschema.validate(read(P/'candidate/current479-only-ten-resourceLinks.exact.json'),runtime)
ms=read('contracts/goal-book/v1/goal-book-model-1.1.schema.json');jsonschema.validators.validator_for(ms)(ms,registry=reg).validate(read(P/'native/current394-final.normal-model.actual.json'))
paths=[str(f.relative_to(R)) for f in (R/P).rglob('*') if f.is_file()]+list(external);ig=subprocess.run(['git','check-ignore','--stdin'],cwd=R,input='\n'.join(paths)+'\n',capture_output=True,text=True);assert ig.returncode==1 and not ig.stdout,ig.stdout
put('checks/actual-targeted-normal-schema-and-portability.final.json',{'schemaVersion':1,'normalJSONFilesParsed':count,'closedSchemas':closed,'JSONLRecordsParsed':lines,'wholeLandscapeClosedSchema':1,'whole394ModelClosedSchema':1,'ownSymlinks':0,'ownIgnoredFiles':0,'portableExternalFiles':len(external),'activeGuardsExact':True,'normalCentralExitCode':0,'normalActualSource003':'PASS','normalActualRouteScopeCount':1,'protectedM6SourceRoutesPreserved':True,'fullStableStatusAndLayerAChecksPending':True,'humanApproval':False})
entry={'schemaVersion':1,'role':'Technical binder/integrator, authored Sehbahn correction and actual source successors; not a third independent science reviewer','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalIds':ids,'actualCompletedCurrentSourceAandB':plan['completedSourceReviewInputs'],'genuineCurrentVPair':ref(P/'checks/genuine-current-V10-pair-technical-transfer.json'),'genuineCurrentD10':ref(P/'native-ten-final-precise-selection/resolution-index.json'),'normalD10CurrentValidation':ref(P/'checks/actual-normal-D10-final-precise-selection.validation.json'),'originalExactP10':ref(P/'positive/ten-current-raster.P.exact.jsonl'),'normalWhole394AndNative10Exact':ref(P/'checks/final-normal394-pages-ten-native-and-source.exact.json'),'normalSourceM6RouteProof':ref(P/'checks/actual-normal-source-route-M6-preservation.json'),'normalFinalCentral':ref(P/'terminal/candidate-current353-final-normal-central.stdout.actual.txt'),'normalFinalCentralTerminal':ref(P/'terminal/candidate-current353-final-normal-central.terminal.actual.json'),'actualExactStrictIDProgress':ref(P/'checks/actual-current353-inactive-strict-ID-gain-and-protected-subjects.json'),'normalQAOnlySerializationCorrection':ref(P/'checks/actual-QA-freshness-serialization-only-correction.json'),'targetedNormalSchemaPortability':ref(P/'checks/actual-targeted-normal-schema-and-portability.final.json'),'copyPlan':ref(P/'ROOT.current343-ten-reviewed-final-copy-plan.inactive.json'),'immutableExternalInputs':ref(P/'inputs/final-portable-immutable-external-bindings.exact.json'),'retainedHistoricalDSelectionCandidates':'First two local unadopted synthesis variants remain; chosen final variant uses exact A evidence for9499943f (optical eye/mechanical ear distinction) and exact current B evidence for9 other goals. Both genuine reviews and all source findings preserved. ROOT synthesized actual scientific disagreements, supplies no third independent verdict.','status':'INACTIVE_VERIFIED_READY_FOR_ROOT_CURRENT_ADOPTION','candidateStrictBiology':353,'candidateDenominator':394,'newScienceCandidatesStrict':10,'restoredBindingCandidates':0,'lostPriorStrictIDs':0,'actualCurrentActiveStrictBiology':343,'activeGain':0,'allOtherSubjectsCurrentAndStrictIDsExact':True,'mathM7PhysicsM7Preserved':True,'A394M394Kinds394Exact':True,'positiveStatus':{'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','approved':0},'normalRulesOrFloorsChanged':False,'wholeSourceCourseRightsApprovalClaimed':False,'fullStableStatusLayerASchemaAndBooksPending':True,'humanApproval':False,'humanTrial':False,'activeWrites':[],'gitGithubWrites':[]}
put('current343-ten-reviewed-inactive.completed.entry.json',entry)
own=[ref(f.relative_to(R)) for f in sorted((R/P).rglob('*')) if f.is_file()];put('FINAL.current343-ten-reviewed-inactive.technical.freeze.json',{'schemaVersion':1,'role':'Inactive integration freeze after genuine independent A/B/source and unchanged normal targeted checks','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownFiles':own,'immutableExternalFiles':[external[k] for k in sorted(external)],'plannedMutableActiveTargetsExcluded':sorted(excluded),'activeGain':0,'humanApproval':False,'activeWrites':[]})
print(json.dumps({'entry':ref(P/'current343-ten-reviewed-inactive.completed.entry.json'),'freeze':ref(P/'FINAL.current343-ten-reviewed-inactive.technical.freeze.json'),'normalJSON':count,'ownFiles':len(own),'externalFiles':len(external),'candidateBioStrict':353,'rootCurrentActiveBioStrict':343,'activeWrites':0}))
