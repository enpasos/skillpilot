# SPDX-License-Identifier: Apache-2.0
"""Genuine scoped current D1 after own native/context FIRST; no active writes."""
from pathlib import Path
import datetime,hashlib,json,subprocess,sys,time
import jsonschema
from referencing import Registry,Resource
ROOT=Path.cwd();DIR=Path(__file__).resolve().parent
AUTHOR=DIR.parent/'biologie-2ae2-applicability-current-native-preparation-root-v1'
assert not (DIR/'independent-b.final.freeze.json').exists()
def load(p):return json.loads(p.read_text())
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':p.relative_to(ROOT).as_posix(),'sha256':digest(p),'bytes':p.stat().st_size}
def put(name,v):
 p=DIR/name;p.parent.mkdir(parents=True,exist_ok=True)
 if '--seal-only' in sys.argv and p.exists():return p
 assert not p.exists(),p
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return p
firstp=DIR/'one-current-applicability-native.independent-b.science-FIRST.verdict.json'
freeze=DIR/'one-current-applicability-native.independent-b.science-FIRST.freeze.json'
first=load(firstp);assert digest(firstp)=='sha256:b8f3b9186de550f180756fe81b3eb84c35f8b995bcc630f3342f80128f5f9fe1'
inputp=AUTHOR/'native/actual-one/round-b/description-review-input.json'
campaignp=AUTHOR/'native/actual-one/round-b/description-review-campaign.json'
g=load(inputp)['goals'][0];campaign=load(campaignp)
owncampaign=put('ordinary-D1/campaign.unchanged-neutral-template.json',campaign)
run_id='bio2ae2-current-applicability-native-independent-b-20261009-v1'
record={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
 'recordId':run_id+'.'+g['goalId'],'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'goalId':g['goalId'],
 'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint']}
for key in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:record[key]=g[key]
record.update({'decision':'keep','understandingEvidence':{
 'essentialUnderstandingDe':'Ein hierarchisches Ordnungssystem enthält geschachtelte Gruppen. Die Zuordnung von Arten wird mit den tatsächlich vorgegebenen morphologischen und anatomischen Merkmalen begründet, nicht allein mit Namen oder einer vorgegebenen Abbildung.',
 'essentialUnderstandingEn':'A hierarchical classification contains nested groups. Placement of species is justified using the actual supplied morphological and anatomical traits, not names alone or a supplied illustration.',
 'observablePerformanceDe':'Die lernende Person vergleicht bereitgestellte Merkmalsangaben, ordnet die Arten nachvollziehbar in die geschachtelten Gruppen ein und begründet gemeinsame sowie unterscheidende Merkmale.',
 'observablePerformanceEn':'The learner compares supplied trait information, places species coherently in nested groups and justifies shared and distinguishing traits.',
 'transferExpectationDe':'Bei einer weiteren vorgegebenen Art wählt die lernende Person anhand ihrer Merkmale die passende hierarchische Zuordnung und erklärt, weshalb eine nur äußerlich oder namentlich ähnliche Alternative nicht durch die bereitgestellten Merkmale belegt ist.',
 'transferExpectationEn':'For another supplied species the learner chooses a suitable hierarchical placement from its traits and explains why a superficially or nominally similar alternative is not supported by the supplied traits.'},
 'rationale':first['scientificReason']+' '+first['sourceScopeReason']+' '+first['actualPageObservation']+' Genuine targeted current native/context inspection after raw applicability change; previous unchanged semantic/material/source evidence reused honestly. No new source-duty closure or human performance.',
 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
records=DIR/'ordinary-D1/description-record.independent-b.jsonl'
record_text=json.dumps(record,ensure_ascii=False)+'\n'
if '--seal-only' in sys.argv:
 assert records.read_text()==record_text,'Existing normal D1 record must remain exact'
else:records.write_text(record_text)
batch=campaign['batches'][0]
artifacts=[('book_model','native/actual-one/book-model.json'),('book_pdf','native/actual-one/bundle/book.pdf'),('book_html','native/actual-one/bundle/book.html'),('review_prompt','native/actual-one/round-b/prompt.md'),('review_criteria','native/actual-one/round-b/criteria.md'),('description_review_batch_input_jsonl','native/actual-one/round-b/batches/'+batch['batchId']+'.input.jsonl')]
run=put('ordinary-D1/run.independent-b.json',{'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
 'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
 'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'GPT-6 Codex; runtime sampling parameters not exposed','role':'subject_reviewer',
 'promptFamilyId':'goal-description-review-v1','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
 'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Genuine scoped current independent B; previous own source/material science reused; no current peerD1 records read; runtime params unavailable').hexdigest(),
 'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':[g['goalId']],
 'inputArtifacts':[{'role':role,'digest':digest(AUTHOR/p)}for role,p in artifacts],
 'startedAt':first['recordedAt'],'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':digest(records),
 'toolchainVersion':'genuine-independent-b-scoped-current-D1-native-context-FIRST-20261009'})
argv=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/validateGoalDescriptionReviewCampaign.ts',
 '--bundle',str((AUTHOR/'native/actual-one/bundle/review-bundle-manifest.json').relative_to(ROOT)),
 '--input',str(inputp.relative_to(ROOT)),'--campaign',str(owncampaign.relative_to(ROOT)),'--run',str(run.relative_to(ROOT)),
 '--batch-input',str((AUTHOR/'native/actual-one/round-b/batches'/ (batch['batchId']+'.input.jsonl')).relative_to(ROOT)),
 '--records',str(records.relative_to(ROOT))]
if '--seal-only' in sys.argv:
 terminal=DIR/'terminal/ordinary-current-D1.terminal.actual.json';normal=load(terminal)
 assert normal['actualExitCode']==0 and normal['actualArgv']==argv
 actual_exit=normal['actualExitCode']
else:
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();tic=time.monotonic()
 r=subprocess.run(argv,cwd=ROOT,text=True,capture_output=True)
 out=DIR/'terminal/ordinary-current-D1.stdout.actual.txt';out.parent.mkdir(exist_ok=True);out.write_text(r.stdout)
 err=DIR/'terminal/ordinary-current-D1.stderr.actual.txt';err.write_text(r.stderr)
 terminal=put('terminal/ordinary-current-D1.terminal.actual.json',{'schemaVersion':1,'actualArgv':argv,'executionCwdDiagnostic':str(ROOT),'startedAt':started,
  'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-tic,'actualExitCode':r.returncode,'stdout':bind(out),'stderr':bind(err),'scienceFIRSTAlreadyFrozen':True})
 assert r.returncode==0,r.stdout+'\n'+r.stderr
 actual_exit=r.returncode
schemaChecks=[]
registry=Registry()
local_schema_bindings=[]
for package in ['goal-book','goal-description-review','goal-evidence']:
 for schema_file in sorted((ROOT/'contracts'/package).rglob('*schema.json')):
  schema=load(schema_file)
  if isinstance(schema,dict)and schema.get('$id'):
   registry=registry.with_resource(schema['$id'],Resource.from_contents(schema))
   local_schema_bindings.append(bind(schema_file))
for path,schemaPath,rows in [(records,'contracts/goal-description-review/v1/goal-description-review-record.schema.json',True),
 (run,'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',False),
 (inputp,'contracts/goal-description-review/v3/goal-description-review-input.schema.json',False),
 (owncampaign,'contracts/goal-description-review/v2/goal-description-review-campaign.schema.json',False)]:
 validator=jsonschema.Draft202012Validator(load(ROOT/schemaPath),registry=registry)
 data=[json.loads(line)for line in path.read_text().splitlines()if line]if rows else[load(path)]
 for row in data:validator.validate(row)
 schemaChecks.append({'input':bind(path),'schema':bind(ROOT/schemaPath),'records':len(data)})
audit=put('checks/ordinary-current-D1-and-actual-closed-schemas.json',{'schemaVersion':1,'license':'CC-BY-4.0','actualNormalTerminal':bind(terminal),'schemaChecks':schemaChecks,'localClosedSchemaRegistry':local_schema_bindings,'schemasNeverFetchedFromUnpublishedHTTPURLs':True,'initialOwnPythonMissingRegistryFailurePreserved':True,'newMaterialReview':False,'newScienceGain':0,'potentialBindingRestoration':1,'activeWrites':0,'humanApproval':False})
verdict=put('one-current-applicability-native.independent-b.completed.verdict.json',{'schemaVersion':1,'license':'CC-BY-4.0','status':'Completed genuine targeted currentD1 KEEP with normal CLI EXIT0 and actual closed schemas',
 'goalId':g['goalId'],'decision':'keep','ownFIRST':bind(firstp),'ownFIRSTFreeze':bind(freeze),'priorKnowledgeDisclosure':first['priorKnowledgeDisclosure'],
 'wholeCurrentContext':bind(inputp),'actualHTML':bind(AUTHOR/'native/actual-one/bundle/book.html'),'actualPDF':bind(AUTHOR/'native/actual-one/bundle/book.pdf'),
 'actualCaptures':first['ownActualCaptures'],'normalD1Record':bind(records),'normalD1Run':bind(run),'normalD1Campaign':bind(owncampaign),'normalChecks':bind(audit),
 'scientificReason':first['scientificReason'],'sourceScopeReason':first['sourceScopeReason'],'actualNativeObservations':first['actualPageObservation'],
 'existingSourcePartialRolesUnchanged':True,'wholeCurrentSemanticMaterialNotRepeated':True,'noNewWholeSource35CourseApproval':True,
 'findings':[],'newScientificClosures':0,'bindingRestorationCandidate':1,'strictGainHere':0,'noActiveWrites':True,'humanApproval':False})
entry=put('neutral-completed-one-current-applicability-native.independent-b.entry.json',{'schemaVersion':1,'license':'CC-BY-4.0','role':'Completed current D1 independent B exact portable entry',
 'ownFIRST':bind(firstp),'ownFIRSTFreeze':bind(freeze),'completedVerdict':bind(verdict),'normalCampaign':bind(owncampaign),'normalRun':bind(run),'normalRecord':bind(records),'normalTerminal':bind(terminal),'closedSchemaProof':bind(audit),
 'actualWholeD3Input':bind(inputp),'actualBundleManifest':bind(AUTHOR/'native/actual-one/bundle/review-bundle-manifest.json'),
 'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'currentCanonicalApplicability':g['canonicalContext']['applicability'],
 'newScientificClosures':0,'bindingRestorationCandidate':1,'strictGainHere':0,'humanApproval':False,'activeWrites':0})
payload=[bind(p)for p in sorted(DIR.rglob('*'))if p.is_file()]
for p in DIR.rglob('*'):
 assert not p.is_symlink(),p
 if p.suffix=='.json':load(p)
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line:json.loads(line)
ignored=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(p['path']for p in payload)+'\n',text=True,capture_output=True,cwd=ROOT)
assert ignored.returncode==1 and ignored.stdout=='',ignored.stdout
seal=put('independent-b.final.freeze.json',{'schemaVersion':1,'license':'CC-BY-4.0','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'role':'Immutable own currentD1/native contextual follow-up seal; historicalB2 unchanged','entry':bind(entry),'payloadBindings':payload,
 'normalActualExitCode':0,'closedSchemaChecks':len(schemaChecks),'noSymlinksOrIgnoredOwnPayloads':True,'newScientificClosures':0,'bindingRestorationCandidate':1,'strictGainHere':0,'humanApproval':False,'activeWrites':0})
print(json.dumps({'entry':bind(entry),'seal':bind(seal),'record':bind(records),'run':bind(run),'normalD1Exit':actual_exit,'closedSchemas':len(schemaChecks),'payload':len(payload),'newScientificClosures':0,'bindingRestorationCandidate':1}))
