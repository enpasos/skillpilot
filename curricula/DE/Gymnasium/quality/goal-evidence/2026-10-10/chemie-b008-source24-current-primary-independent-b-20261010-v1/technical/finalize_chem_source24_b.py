# SPDX-License-Identifier: Apache-2.0
import json,hashlib,re,copy,subprocess,importlib.util,io,contextlib
from pathlib import Path
from datetime import datetime,timezone
from jsonschema import Draft202012Validator
R=Path.cwd(); B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1'); O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-current-primary-independent-b-20261010-v1')
def read(p):return json.loads(Path(p).read_text())
def ref(p):
 p=Path(p);v=p.read_bytes();return {'path':p.as_posix(),'sha256':'sha256:'+hashlib.sha256(v).hexdigest(),'bytes':len(v)}
def put(p,v):
 p=Path(p);assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(v if isinstance(v,str) else json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def digest(v):return 'sha256:'+hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
first=read(O/'FIRST.source24.actual.json');fs=read(O/'FIRST.freeze.json');assert ref(O/'FIRST.source24.actual.json')['sha256']=='sha256:f56e714f398d852bd10884248cf1a044c264d7653f25cd363bbaf57f9910aeea';assert ref(O/'FIRST.freeze.json')['sha256']=='sha256:9e37612a86cfcd48eed9fb7f74f909f63151767037ad5c3e9e976ccb12ebcb19'
for x in fs['files']:assert ref(x['path'])==x
entryPath=B/'neutral-source24-whole-primary-and-bounded-mapping.portable-successor-v2.entry.json';e=read(entryPath)
authorSealPath=B/'author.portable-successor-v2.final.freeze.json';a=read(authorSealPath);current={}
for x in a['ownCurrentRegularFileBindings']+a['currentExactOriginalExternalRegularFileBindings']:
 assert ref(x['path'])==x;assert not Path(x['path']).is_symlink();current[x['path']]=x
current[entryPath.as_posix()]=ref(entryPath);current[authorSealPath.as_posix()]=ref(authorSealPath)
sc=read(e['exactCurrentScopesWitnessesAndOmissions']['path']);obs=read(e['actualWholeNormalVariables']['path']);pr=read(sc['unresolved496OriginalReceipt']['path']);print('ORIGINAL_RECEIPT_KEYS',list(pr))
# Replay retention of old omissions and unresolved rows from whole actual previous receipt.
def find_field(d,names):
 if isinstance(d,dict):
  for k in names:
   if k in d:return d[k]
  for v in d.values():
   q=find_field(v,names)
   if q is not None:return q
 elif isinstance(d,list):
  for v in d:
   q=find_field(v,names)
   if q is not None:return q
 return None
oldUnresolved=find_field(pr,['unresolvedSourceScopes','unresolvedScopes']);assert oldUnresolved is not None
mappingOldToNew={}
ix=read(e['wholeOriginal32MappingExtractionIndex']['path']);pairs=ix['wholeCurrentMappingExtractionPairs']
for idx,name in [(7,'BY-whole-original-with-targeted-partial-child-contributions.inactive.review.json'),(28,'ST-whole-original-with-targeted-partial-child-contributions.inactive.review.json')]:mappingOldToNew[pairs[idx]['wholeCurrentMapping']['original']['path']]=(B/'candidate'/name).as_posix()
def normpath(d):
 if isinstance(d,dict):return {k:(mappingOldToNew.get(v,v) if k=='mappingPath' and isinstance(v,str) else normpath(v)) for k,v in d.items()}
 if isinstance(d,list):return [normpath(v) for v in d]
 return d
assert normpath(oldUnresolved)==obs['actualUnresolvedScopes'];assert len(oldUnresolved)==496
candidateOmitted=set(obs['actualAtomicGoalIds'])-set(obs['actualSourceUnionGoalIds']);old19=set(sc['wholeOld19OmittedIdsExact']);assert len(old19)==19 and candidateOmitted==old19|{'e5a5dcd8-053c-55fd-b5c7-bba93779da53'}
oldUnion=set(sc['priorInactiveActualSourceSupported355']);newUnion=set(obs['actualSourceUnionGoalIds']);assert len(oldUnion)==355 and len(newUnion)==378 and newUnion-oldUnion==set(first['summary'] and read(O/'checks/source24-whole-scope-witnesses.independent.actual.json')['scoped23GoalIds']);assert not oldUnion-newUnion
oldCfg=read(sc['ordinaryAtlasBeforeConfig']['path']);probe=read(sc['currentInactive398ProbeConfig']['path']);assert oldCfg['expectedCurricularAtomicGoalCount']==362 and probe['expectedCurricularAtomicGoalCount']==398
normalTerminal=read(e['normalWhole398AttemptAndUnchangedAssertion']['path']);stderr=Path(normalTerminal['stderr']['path']).read_text();assert normalTerminal['exitCode']==1 and normalTerminal['compilerPass'] is False and '378 !== 398' in stderr
code=Path('app/scripts/goalBookSourceAtlasInputs.ts').read_text();assert "assert.equal(union.size, config.expectedCurricularAtomicGoalCount, 'Source-supported atlas goal count changed')" in code
put(O/'checks/current-source-union-and-holds.independent.actual.json',{'schemaVersion':1,'role':'Independent retention and live ordinary-count-contract check after sealed FIRST','wholePreviousUnresolvedReceipt':sc['unresolved496OriginalReceipt'],'whole496RowsExactAfterOnlyTwoExplicitMappingPathSubstitutions':True,'mappingPathSubstitutions':mappingOldToNew,'old19UnscopedGoalIds':sorted(old19),'candidate20OmittedGoalIds':sorted(candidateOmitted),'source24AddedScoped23GoalIds':sorted(newUnion-oldUnion),'source24RemovedOldScopedGoalIds':[],'previousCandidateUnion':355,'currentCandidateUnion':378,'originalPublishedUnion':362,'originalCanonicalAtomCount':381,'expected398UnionContractUnchanged':True,'actualUnmodified398Attempt':e['normalWhole398AttemptAndUnchangedAssertion'],'actual398AttemptExitCode':1,'actual398AttemptCompilerPass':False,'actualError':'378 !== 398','normalAssertionIsSourceUnionEquality':True,'ordinaryCompilerFile':ref('app/scripts/goalBookSourceAtlasInputs.ts'),'wholeSourceCourseApproval':False,'nativeDPAMVApproval':False,'strictNew':0,'strictRestored':0,'strictNet':0,'humanApproval':False})
# Final source semantics retain FIRST; no peer reading or consensus claimed.
final={'schemaVersion':1,'reviewId':O.name,'phase':'FINAL','createdAt':datetime.now(timezone.utc).isoformat(),'reviewerRole':first['reviewerRole'],'FIRSTreview':ref(O/'FIRST.source24.actual.json'),'FIRSTseal':ref(O/'FIRST.freeze.json'),'source24AuthorCurrentPortableSeal':ref(authorSealPath),'neutralCurrentEntry':ref(entryPath),'currentPeerJudgmentsRead':False,'currentAuthorSemanticJudgmentsReadOnlyAfterOwnFIRST':True,'authorComparison':{'all24AuthorContributionRationalesActuallyRead':True,'materialSemanticDifferences':[],'verdictChangesAfterAuthorReading':[],'C11ScopeHoldUnchanged':True,'STGuidanceSafetyPartialBoundaryUnchanged':True,'GAEAAnalytikMethodBoundariesUnchanged':True,'source24DoesNotReviewPriorP26FiveRequiresAndTwelveNativeContexts':True,'noNewThirdReviewerOrHumanApprovalClaim':True},'retainedActualChildReviews':first['childReviews'],'retainedActual63EdgeReviews':ref(O/'FIRST.edges.actual.jsonl'),'postFIRSTTechnicalEvidence':[ref(O/'checks/current-source-union-and-holds.independent.actual.json')],'summary':first['summary'],'followupDe':'23 explizit gescopte Children und 63 begrenzte partial-Beiträge sind für unabhängigen A/B-Abgleich tragfähig. e5a5/C11 unspecified, alte19 fehlende Scopes und496 unaufgelöste Source-Scope-Zeilen bleiben offen. Der unveränderte Whole398-Lauf bleibt EXIT1 bei378. P26 D/P/A/M/V und12 Kontextänderungen benötigen ihre eigenen aktuellen Nachweise. Keine aktive Adoption in diesem Paket.'}
put(O/'FINAL.source24.actual.json',final)
# Closed additive technical source-review contracts; these do not impersonate a native D/P contract.
sha={'type':'string','pattern':'^sha256:[a-f0-9]{64}$'};path={'type':'string','pattern':r'^(?!/)(?!.*\\)(?!.*(?:^|/)\.\.?(/|$))(?!.*//)[A-Za-z0-9._-]+(?:/[A-Za-z0-9._-]+)*$'}
bindSchema={'type':'object','additionalProperties':False,'required':['path','sha256','bytes'],'properties':{'path':path,'sha256':sha,'bytes':{'type':'integer','minimum':0}}}
def shape(v):
 if isinstance(v,dict):
  if set(v)=={'path','sha256','bytes'}:return bindSchema
  return {'type':'object','additionalProperties':False,'required':list(v),'properties':{k:shape(x) for k,x in v.items()}}
 if isinstance(v,list):
  kinds=[]
  for x in v:
   s=shape(x)
   if s not in kinds:kinds.append(s)
  return {'type':'array','items':kinds[0] if len(kinds)==1 else {'anyOf':kinds} if kinds else {}}
 if isinstance(v,bool):return {'const':v}
 if v is None:return {'type':'null'}
 if isinstance(v,int):return {'type':'integer','minimum':0} if v>=0 else {'type':'integer'}
 return {'type':'string','minLength':0}
def makeSchema(name,value):
 s={'$schema':'https://json-schema.org/draft/2020-12/schema','$comment':'SPDX-License-Identifier: Apache-2.0; additive technical ledger shape, no native science or Human approval contract','title':name,**shape(value)};Draft202012Validator.check_schema(s);put(O/'contracts'/name,s);return ref(O/'contracts'/name)
firstSchema=makeSchema('source24-first-review.schema.json',first);finalSchema=makeSchema('source24-final-review.schema.json',final);edgeRows=[json.loads(l) for l in (O/'FIRST.edges.actual.jsonl').read_text().splitlines()];edgeSchema=makeSchema('source24-edge-review.schema.json',edgeRows[0]);edgeSchemaBody=read(edgeSchema['path']);edgeSchemaBody['properties']['scopeVerdict']={'enum':['HOLD_UNSPECIFIED_C11','KEEP_EXPLICIT_PARTIAL_SCOPE']};edgeSchemaBody['properties']['semanticVerdict']={'const':'KEEP_PARTIAL'};edgeSchemaBody['properties']['wholeCandidateEdge']['properties']['matchType']={'const':'partial'};Path(edgeSchema['path']).write_text(json.dumps(edgeSchemaBody,ensure_ascii=False,indent=2)+'\n');edgeSchema=ref(edgeSchema['path'])
put(O/'README.md','# Independent Chemistry Source24 B review\n\nOwn FIRST was sealed before current author semantic findings or peer judgments. FINAL retains those bounded judgments. This is an AI source review; whole-source, whole-course, legal, native D/P/A/M/V, Human Approval and strict M7 gains are all unclaimed. The unchanged whole398 source-union gate remains failed at378.\n\nReview prose and own didactic content: CC-BY-4.0. Technical schemas and verification scripts: Apache-2.0. Original linked BY/ST sources retain their own rights; ST primary page labels CC BY-SA3.0. No rights clearance is inferred.\n')
put(O/'technical/finalize_chem_source24_b.py',Path(__file__).read_text())
# Current required bindings exclude audit-only former entry/seal and optional cache provenance.
put(O/'checks/current-author-portable-authority.independent.actual.json',{'schemaVersion':1,'role':'Independent exact current successor authority verification; no adoption of author conclusions','authorCurrentPortableSeal':ref(authorSealPath),'currentRequiredRegularBindings':list(current.values()),'allRequiredBindingsExact':True,'symlinks':[],'historicalInitialEntrySealAndOptionalHTMLNotRequiredAuthority':True,'originalPDFCacheContractPreservedWithoutTrackingException':True,'wholeScienceReviewClaimedFromHashVerification':False,'humanApproval':False})
# Normal repository validator parses quality artifacts; closed own contracts run separately.
spec=importlib.util.spec_from_file_location('normal_schema_validator',R/'scripts/validate_schemas.py');normal=importlib.util.module_from_spec(spec);spec.loader.exec_module(normal);runtime=read('docs/landscape-runtime.schema.json');captured=io.StringIO();fail=[]
with contextlib.redirect_stdout(captured):
 for p in sorted(O.rglob('*.json')):
  if not normal.validate_file(p.as_posix(),runtime):fail.append(p.as_posix())
symlinkErrors=normal.curriculum_symlink_errors(R.as_posix());assert not fail and not symlinkErrors
sv=[(O/'FIRST.source24.actual.json',firstSchema),(O/'FINAL.source24.actual.json',finalSchema)]
for p,s in sv:Draft202012Validator(read(s['path'])).validate(read(p))
for row in edgeRows:Draft202012Validator(edgeSchemaBody).validate(row)
assert len(edgeRows)==63;assert len({r['goalId'] for r in edgeRows})==24
ignored=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(sorted(set(current)|{p.as_posix() for p in O.rglob('*') if p.is_file()}))+'\n',capture_output=True,text=True);assert ignored.returncode==1 and not ignored.stdout
ownPaths=sorted(p.as_posix() for p in O.rglob('*.json'));put(O/'checks/normal-validation.actual.stdout.txt',captured.getvalue()+'\nOwn closed FIRST/FINAL contracts PASS; all63 complete JSONL rows closed-schema PASS; all current bindings exact; git check-ignore no required ignored files; normal curriculum_symlink_errors=[]; whole398 original source attempt remains EXIT1/378.\n')
check={'schemaVersion':1,'role':'Actual own normal JSON parse, closed ledger schemas, portability and normal symlink validation','normalChecker':ref('scripts/validate_schemas.py'),'normalQualityJSONFilesActuallyParsed':ownPaths,'normalJSONParseFailures':fail,'closedSchemaChecks':[{'artifact':ref(p),'schema':s,'exitCode':0} for p,s in sv]+[{'artifact':ref(O/'FIRST.edges.actual.jsonl'),'schema':edgeSchema,'wholeRowsParsedAndValidated':63,'exitCode':0}],'currentRequiredExactBindingCount':len(current),'currentRequiredIgnoredFiles':[],'normalCurriculumSymlinkErrors':symlinkErrors,'ownSymlinkFiles':[],'stdout':ref(O/'checks/normal-validation.actual.stdout.txt'),'exitCode':0,'actualWhole398CompilerExitCodeStill':1,'actualWhole398UnionStill':378,'humanApproval':False,'strictNet':0};put(O/'checks/normal-validation.actual.json',check)
entry={'schemaVersion':1,'role':'Portable immutable independent source B final entry; bounded23plus1HOLD, no active adoption','reviewId':O.name,'createdAt':datetime.now(timezone.utc).isoformat(),'ownFIRSTreview':ref(O/'FIRST.source24.actual.json'),'ownFIRSTseal':ref(O/'FIRST.freeze.json'),'ownFINALreview':ref(O/'FINAL.source24.actual.json'),'own63ActualEdgeReviews':ref(O/'FIRST.edges.actual.jsonl'),'currentAuthorPortableSeal':ref(authorSealPath),'neutralCurrentEntry':ref(entryPath),'normalValidation':ref(O/'checks/normal-validation.actual.json'),'currentRequiredRegularExternalBindings':list(current.values()),'normalOwnClosedContracts':[firstSchema,finalSchema,edgeSchema],'actualSummary':first['summary'],'ordinary398ProbeRemainsOpen':True,'activeAdoptionAuthorizedByThisPackage':False,'humanApproval':False,'strictNet':0};put(O/'independent-b.final.entry.json',entry)
entrySchema=makeSchema('source24-final-entry.schema.json',entry);Draft202012Validator(read(entrySchema['path'])).validate(entry)
assert normal.validate_file((O/'independent-b.final.entry.json').as_posix(),runtime);assert normal.validate_file(entrySchema['path'],runtime)
put(O/'checks/final-entry-normal.actual.json',{'schemaVersion':1,'role':'Actual final entry normal parsing and closed schema check before final freeze','finalEntry':ref(O/'independent-b.final.entry.json'),'closedEntrySchema':entrySchema,'normalValidateFileExitCode':0,'closedSchemaExitCode':0,'normalCurriculumSymlinkErrors':normal.curriculum_symlink_errors(R.as_posix()),'entryAllRequiredExternalBindingsExact':True,'strictNet':0,'humanApproval':False})
seal={'schemaVersion':1,'role':'Portable immutable independent Source24 B final freeze; no active adoption','createdAt':datetime.now(timezone.utc).isoformat(),'finalEntry':ref(O/'independent-b.final.entry.json'),'FIRSTseal':ref(O/'FIRST.freeze.json'),'ownCurrentRegularFileBindings':[ref(p) for p in sorted(O.rglob('*')) if p.is_file()],'currentRequiredExternalRegularFileBindings':list(current.values()),'ownFIRSTUnchanged':True,'requiredHistoricalHTMLCacheAuthority':False,'whole398GateStillExit1With378':True,'old19OmissionsAnd496UnresolvedScopesPreserved':True,'C11E5a5CourseAndSourceScopeHold':True,'humanApproval':False,'strictNew':0,'strictRestored':0,'strictNet':0,'activeWrites':[]};put(O/'independent-b.final.freeze.json',seal)
assert normal.validate_file((O/'independent-b.final.freeze.json').as_posix(),runtime)
for q in seal['ownCurrentRegularFileBindings']+seal['currentRequiredExternalRegularFileBindings']:assert ref(q['path'])==q
assert ref(O/'FIRST.freeze.json')==final['FIRSTseal'];assert not normal.curriculum_symlink_errors(R.as_posix())
print(json.dumps({'FIRST':ref(O/'FIRST.source24.actual.json'),'FIRSTseal':ref(O/'FIRST.freeze.json'),'FINAL':ref(O/'FINAL.source24.actual.json'),'FINALentry':ref(O/'independent-b.final.entry.json'),'FINALfreeze':ref(O/'independent-b.final.freeze.json'),'ownBindings':len(seal['ownCurrentRegularFileBindings']),'externalCurrentBindings':len(current),'closedSchemas':4,'actualCompleteJSONLRows':63,'normalSymlinkErrors':[],'schemaAndPortabilityExitCode':0,'whole398CompilerStillExitCode':1,'sourceUnion378':378,'strictNet':0},ensure_ascii=False,indent=2))
