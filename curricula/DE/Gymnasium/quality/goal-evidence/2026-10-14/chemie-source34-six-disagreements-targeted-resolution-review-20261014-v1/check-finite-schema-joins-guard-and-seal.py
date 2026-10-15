# Apache-2.0. Finite scoped checks and seal, unchanged stock guard.
import copy, datetime, hashlib, importlib.util, json, pathlib, subprocess, sys
sys.dont_write_bytecode=True
import jsonschema
R=pathlib.Path('/home/enpasos/projects/skillpilot')
O=pathlib.Path(__file__).parent
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
def read(p):return json.loads(p.read_text())
def write(n,x):
 p=O/n;p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def bind(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}

science=read(O/'SCIENCE.first-six-disagreements-targeted-transparent-resolution.actual.json')
assert len(science['records'])==6 and science['summary']['distinctWholeGoals']==4
assert sum(r['structuralTargetDecision'].startswith('RETAIN') for r in science['records'])==5
assert all(r['originalAndCurrentWholeGoalExactEqual'] for r in science['records'])
assert not any(r['operativeApplicabilityOrMappingGrant'] or r['wholeSourceDutyClosureGranted'] for r in science['records'])
cas=read(O/'CAS.four-whole-LK-views-exact-six-resolution-only.inactive.json')
schemaPath=R/'contracts/curriculum-package/v1/composition-view.schema.json'
schema=read(schemaPath);jsonschema.Draft202012Validator.check_schema(schema)
validator=jsonschema.Draft202012Validator(schema)
schemas=[]
for row in cas['rows']:
 before=read(R/row['beforeFrozenWholeFile']['path']);after=read(R/row['afterInactiveWholeFile']['path'])
 def stripped(n):
  n=copy.deepcopy(n)
  if 'children' in n:n['children']=[stripped(x) for x in n['children'] if not(row['jurisdiction']=='DE-NI' and x.get('kind')=='goalEntry' and x.get('goalId')=='413c5ee5-7826-549f-ad76-63743c59b188')]
  return n
 expected=copy.deepcopy(before);expected['rootNodes']=[stripped(x) for x in before['rootNodes']]
 assert expected==after
 # Required closed-export metadata is added; authored tree/scope/IDs retain exact data.
 exported={'$schema':schema['$id'],'viewFormatVersion':'1.0','language':'de',**after}
 validator.validate(exported)
 ep=write('closed-schema-exports/'+row['jurisdiction']+'.lk.six-resolution-only.inactive.view.json',exported)
 assert {k:v for k,v in exported.items() if k not in ['$schema','viewFormatVersion','language']}==after
 schemas.append({'authoredCandidate':row['afterInactiveWholeFile'],'closedSchemaCandidate':bind(ep),'stockClosedSchema':bind(schemaPath),'result':'PASS','semanticTreeAndScopeExact':True})

context=read(O/'INPUT.complete-original-source-cells-all-current-mapped-whole-partners.actual.json')
current=read(R/context['canonicalCurrent407Binding']['path']);goals={g['id']:g for g in current['goals']}
sourceCellCount=0;allCurrentPartners={};celljoins=[]
for s in context['states']:
 extraction=read(R/s['wholeSourceExtractionBinding']['path']);sources={g['id']:g for g in extraction['sourceGoals']};sourceCellCount+=len(s['wholeSourceCells'])
 assert all(sources[g['id']]==g for g in s['wholeSourceCells'])
 sourceids={g['id'] for g in s['wholeSourceCells']};partners=set()
 for c in s['existingMappingCarriers']:
  original=read(R/c['wholeCarrierBinding']['path'])
  expected=[m for m in original['mappings'] if m['legacyGoalId'] in sourceids]
  assert expected==c['selectedWholeMappingRows'];partners.update(m['canonicalGoalId'] for m in expected)
 expanded=set();q=list(partners)
 while q:
  gid=q.pop()
  if gid in expanded:continue
  expanded.add(gid);q.extend(goals[gid].get('contains',[]))
 assert sorted(partners)==s['currentMappedPartnerIds']
 assert sorted(expanded)==s['expandedCurrentPartnerIds']
 assert s['currentWholeMappedPartnersAndTheirContainedChildren']==[goals[g] for g in sorted(expanded)]
 allCurrentPartners.update({g['id']:g for g in s['currentWholeMappedPartnersAndTheirContainedChildren']})
 celljoins.append({'jurisdiction':s['jurisdiction'],'fullOriginalSelectedCells':len(sourceids),'directWholePartners':len(partners),'wholePartnersIncludingContainedChildren':len(expanded),'result':'PASS'})
assert sourceCellCount==63 and len(allCurrentPartners)==131
partial=read(O/'CAS.five-bounded-PARTIAL-source-relationships.unactivated-transport-proposal.json')
assert partial['relationshipCount']==5 and partial['carrierAppendOperations']==8
for row in partial['fiveRelationships']:
 s=next(s for s in context['states'] if s['jurisdiction']==row['jurisdiction'])
 assert row['wholeSourceCell'] in s['wholeSourceCells'] and goals[row['wholeCurrentGoal']['id']]==row['wholeCurrentGoal']
 for op in row['carrierCASOperations']:
  original=read(R/op['exactWholeCarrierBefore']['path']);m=op['proposedMappingRow']
  assert m['legacyGoalId']==row['wholeSourceCell']['id'] and m['canonicalGoalId']==row['wholeCurrentGoal']['id']
  assert m['matchType']=='partial' and m['courseLevelDecision']=='LK'
  assert op['originalWholeSourceCellPartnerRowsPreserved']==[x for x in original['mappings'] if x['legacyGoalId']==m['legacyGoalId']]
  assert not any(x['legacyGoalId']==m['legacyGoalId'] and x['canonicalGoalId']==m['canonicalGoalId'] for x in original['mappings'])

stock=read(O/'CHECK.stock-four-whole-views-and-full94-target-and-prerequisite-preservation.actual.json')
assert stock['result']['newCompileErrors']==0 and stock['result']['removedRequiredByRemaining']==[]
assert stock['result']['removedTargets']==['413c5ee5-7826-549f-ad76-63743c59b188']
assert stock['result']['addedTargets']==[] and stock['result']['fiveDisputedRetained'] and stock['result']['whole94RetainedInNIGKandLK']

# Verify all recursively present exact path/hash bindings, with no assumed hash approval.
bindings={};parses=[]
def verify_bindings(value):
 if isinstance(value,dict):
  if isinstance(value.get('path'),str) and isinstance(value.get('sha256'),str):
   p=R/value['path'];sha=value['sha256'].removeprefix('sha256:');assert p.is_file(),p
   assert hashlib.sha256(p.read_bytes()).hexdigest()==sha,(p,sha)
   if 'bytes' in value:assert p.stat().st_size==value['bytes'],p
   bindings[value['path']]=sha
  for x in value.values():verify_bindings(x)
 elif isinstance(value,list):
  for x in value:verify_bindings(x)
for p in sorted(O.rglob('*')):
 if not p.is_file():continue
 assert not p.is_symlink(),p
 if p.suffix=='.json':j=read(p);verify_bindings(j);parses.append(str(p.relative_to(O)))
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():verify_bindings(json.loads(line))
  parses.append(str(p.relative_to(O)))
checks=write('CHECK.finite-whole-input-joins-closed-schemas-and-exact-bindings.actual.json',{'schemaVersion':1,'checkedAt':now(),'closedSchemaExports':schemas,'sourceCellPartnerJoins':celljoins,'uniqueCurrentWholeMappedPartnersReadAndBound':len(allCurrentPartners),'completeOriginalSourceCells':sourceCellCount,'fivePartialRelationsEightUnactivatedCarrierOperations':'PASS','allJsonJsonlParsed':parses,'verifiedUniquePathHashBindings':len(bindings),'stockSourceOrHumanClosureClaim':False,'activeWrites':False})

spec=importlib.util.spec_from_file_location('stock_validate_schemas',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(str(R));assert errors==[],errors
files=[p for p in sorted(O.rglob('*')) if p.is_file()]
rel='\n'.join(str(p.relative_to(R)) for p in files)+'\n'
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],input=rel,text=True,capture_output=True,cwd=R)
assert ignore.returncode==1 and not ignore.stdout,(ignore.returncode,ignore.stdout,ignore.stderr)
guard=write('CHECK.actual-stock-global-symlink-guard-and-own-committability.actual.json',{'schemaVersion':1,'checkedAt':now(),'stockFunction':'scripts/validate_schemas.py::curriculum_symlink_errors','stockGlobalCurriculumSymlinkErrors':errors,'stockGlobalCurriculumSymlinkErrorCount':len(errors),'ownPublicFileCountBeforeThisCheck':len(files),'ownSymlinks':[],'ownIgnoredFiles':[],'gitCheckIgnoreExitCode':ignore.returncode,'activeGitIndexOrSettingsWrites':False})
completed=now()
write('COMPLETED.actual.json',{'schemaVersion':1,'startedAt':science['startedAt'],'scienceCompletedAt':science['scienceCompletedAt'],'completedAt':completed,'resolutionSummary':science['summary'],'boundedStockProof':bind(O/'CHECK.stock-four-whole-views-and-full94-target-and-prerequisite-preservation.actual.json'),'boundedSchemasJoinsInputs':bind(checks),'actualGlobalGuard':bind(guard),'wholeSourceDutyClosureGrants':0,'activeWrites':False,'other27Source34OmissionsApproved':False})
neutral=read(O/'NEUTRAL.exact-six-resolving-source-scope-inputs-and-candidate-bindings.json')
neutral['boundedPartialTransportProposal']=bind(O/'CAS.five-bounded-PARTIAL-source-relationships.unactivated-transport-proposal.json')
neutral['boundedTechnicalEvidence']=[bind(checks),bind(guard),bind(O/'CHECK.stock-four-whole-views-and-full94-target-and-prerequisite-preservation.actual.json')]
write('NEUTRAL.exact-six-resolving-source-scope-inputs-and-candidate-bindings.json',neutral)

# Reparse every complete own JSON/JSONL and recheck hashes immediately before finite seal.
for p in sorted(O.rglob('*')):
 if p.is_file() and p.suffix=='.json':verify_bindings(read(p))
 elif p.is_file() and p.suffix=='.jsonl':
  for line in p.read_text().splitlines():verify_bindings(json.loads(line))
seal=write('SEAL.finite-six-source34-disagreements-targeted-resolution.actual.json',{'schemaVersion':1,'sealedAt':now(),'startedAt':science['startedAt'],'scienceCompletedAt':science['scienceCompletedAt'],'completedAt':completed,'role':science['role'],'files':[bind(p) for p in sorted(O.rglob('*')) if p.is_file() and not p.name.startswith('SEAL.finite-')],'firstScienceBinding':bind(O/'SCIENCE.first-six-disagreements-targeted-transparent-resolution.actual.json'),'firstScienceSeal':bind(O/'SEAL.first-science-six-disagreements.actual.json'),'verifiedUniqueExactPathHashBindings':len(bindings),'globalStockSymlinkErrors':0,'exactScopeTupleCount':6,'fiveCuratedLKTargetsRetained':True,'oneAdditionalDuplicateTargetOmitted':True,'sourceWholeOperatorClosureGrants':0,'other27OmissionsAppliedOrApproved':False,'newD_P_A_M_V_M7_HumanReleaseClaims':0,'strictGain':0,'activeWrites':False})
print(json.dumps({'finalSeal':bind(seal),'files':len(read(seal)['files']),'bytes':sum(x['bytes'] for x in read(seal)['files']),'closedSchemaExports':len(schemas),'pathHashBindings':len(bindings),'globalStockGuard':0,'completedAt':completed}))
