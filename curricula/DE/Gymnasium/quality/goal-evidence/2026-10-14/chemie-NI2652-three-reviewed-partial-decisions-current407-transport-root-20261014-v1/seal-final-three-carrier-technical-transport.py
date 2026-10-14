# Apache-2.0. Finite exact transport/stock witness audit and unmodified global symlink guard.
import copy, datetime, hashlib, importlib.util, json, pathlib, re, subprocess, sys
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
read=lambda p:json.loads(p.read_text())
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
def bind(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def verify(b):
 p=R/b['path'];assert p.is_file(),p;assert hashlib.sha256(p.read_bytes()).hexdigest()==b['sha256'].removeprefix('sha256:'),p
 if 'bytes' in b:assert p.stat().st_size==b['bytes'],p
 return p
def write(n,v):
 p=O/n;p.parent.mkdir(exist_ok=True,parents=True);assert not p.exists(),p
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return p
def tokens(text,key):
 m=re.search(r'"'+re.escape(key)+r'"\s*:\s*\[',text);assert m
 d=json.JSONDecoder();i=m.end();out=[]
 while True:
  while text[i].isspace() or text[i]==',':i+=1
  if text[i]==']':return out
  v,e=d.raw_decode(text,i);out.append((v,text[i:e]));i=e

inventory=read(O/'HANDOVER.original-existing-root-files.exact-bindings.json')
for b in inventory['files']:verify(b)
originalCas=read(O/'CAS.actual-paired-three-partial-source-and-scope-witness-decisions.transport.json')
third=read(O/'CAS.additive-third-operative-atlas-carrier.exact-mechanical-transport.json')
ids=originalCas['sourceIds'];gid=originalCas['goalId'];allrows=originalCas['CAS']
for b in [originalCas['sourceA'],originalCas['sourceASeal'],originalCas['sourceB'],originalCas['sourceBSeal'],third['oldBinding'],third['candidateBinding']]:verify(b)
a=read(R/originalCas['sourceA']['path']);b=read(R/originalCas['sourceB']['path'])
assert all(not r['wholeSourceUnionApproval'] and not r['wholeTargetFromThisCellAloneApproval'] for r in a['individualRecords'])
assert all(not r['wholeOriginalSourceCellClosureGranted'] and not r['oldPartnersReapprovedOrReplaced'] for r in b['verdicts'])
canonicalPath=H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';canonical=read(canonicalPath);goals={g['id']:g for g in canonical['goals']}
assert all(r['wholeCurrentGoal']==goals[gid] for r in a['individualRecords'])
assert all(g==goals[k] for k,g in b['wholeExistingPartnerGoals'].items())
oldp=verify(third['oldBinding']);newp=verify(third['candidateBinding']);oldraw=oldp.read_text();newraw=newp.read_text();old=read(oldp);new=read(newp)
assert len(old['mappings'])==765 and len(new['mappings'])==768
assert tokens(oldraw,'mappings')==tokens(newraw,'mappings')[:765]
ot={x[0]['sourceGoalId']:x for x in tokens(oldraw,'decisions')};nt={x[0]['sourceGoalId']:x for x in tokens(newraw,'decisions')}
assert len(ot)==len(nt)==333 and sum(ot[k]==nt[k] for k in ot if k not in ids)==330
assert new['mappings'][765:]==third['addedMappings'] and all(x['matchType']=='partial' for x in new['mappings'][765:])
reverted=copy.deepcopy(new);reverted['mappings']=reverted['mappings'][:765]
for i,d in enumerate(reverted['decisions']):
 if d['sourceGoalId'] in ids:reverted['decisions'][i]=ot[d['sourceGoalId']][0]
assert reverted==old
assert (H/third['oldBinding']['path']).read_bytes()==newp.read_bytes()
for row in allrows:
 verify(row['oldBinding']);p=verify(row['candidateBinding']);assert (H/row['oldBinding']['path']).read_bytes()==p.read_bytes()
for entry in read(O/'receipts/CHECK.exact-third-NI-only-private-host-import.actual.json')['hostProtectedCanonicalSemanticEngineAndOperativeAtlasConfigExact']:verify(entry)

atlasBefore=read(O/'receipts/ATLAS.NI-only.BEFORE.actual-stock-full-receipt.json');atlasAfter=read(O/'receipts/ATLAS.NI-only.AFTER.actual-stock-full-receipt.json')
assert atlasBefore['counts']['canonicalCurricularAtomicGoals']==atlasAfter['counts']['canonicalCurricularAtomicGoals']==407
assert atlasBefore['counts']['publishedCurricularAtomicGoals']==208 and atlasAfter['counts']['publishedCurricularAtomicGoals']==209
assert atlasBefore['counts']['unresolvedSourceScopeDecisions']==atlasAfter['counts']['unresolvedSourceScopeDecisions']==0
beforeScopes={s['key']:s for s in atlasBefore['scopes']};afterScopes={s['key']:s for s in atlasAfter['scopes']};assert set(beforeScopes)==set(afterScopes)
scopeProof=[]
for k,bs in beforeScopes.items():
 ats=afterScopes[k];added=set(ats['goalIds'])-set(bs['goalIds']);removed=set(bs['goalIds'])-set(ats['goalIds'])
 assert not removed
 assert added==({gid} if '/SekII/' in k else set())
 aw=[w for w in ats['witnesses'] if w['goalId']==gid]
 assert [w for w in ats['witnesses'] if w['goalId']!=gid]==bs['witnesses']
 if '/SekII/' in k:
  assert len(aw)==3 and sorted(w['sourceGoalId'] for w in aw)==sorted(ids)
  assert all(w['coverage']=='direct' and w['profileBasis']=='source-metadata' and w['mappedTargetGoalId']==gid for w in aw)
 scopeProof.append({'scope':k,'addedGoalIds':sorted(added),'removedGoalIds':sorted(removed),'fullCurrent2652Witnesses':aw,'allOtherWholeWitnessObjectsExact':True})
for phase,receipt in [('BEFORE',atlasBefore),('AFTER',atlasAfter)]:
 execution=read(O/f'receipts/ATLAS.NI-only.{phase}.actual-exec-completion.json');assert execution['exit_code']==0
 witness=read(O/f'receipts/ATLAS.NI-only.{phase}.actual-config-and-whole2652-witness.json');assert witness['allComputedOutputDigestsVerified'] and witness['virtualOutputsNotWrittenToHost']
 for x in receipt['inputBindings']:
  if phase=='BEFORE' and x['path']==third['oldBinding']['path']:
   assert x['sha256']==third['oldBinding']['sha256']
  else:assert 'sha256:'+hashlib.sha256((H/x['path']).read_bytes()).hexdigest()==x['sha256'],(phase,x['path'])
assert atlasBefore['claims']==atlasAfter['claims'] and not atlasAfter['claims']['newSourceReview'] and not atlasAfter['claims']['humanApproval']
configInput=read(O/'INPUT.full-operative-atlas-config-and-exact-NI-bounded-derivation.json')
for k in ['fullOperativeAtlasConfigBinding','fullOperativeHostAtlasConfigBinding','stockAtlasBuilderBinding','unchangedHostAtlasBuilderBinding','fullOriginalDurationPolicyHostBinding','boundedExactNIDurationPolicy','boundedPolicyHostBinding']:verify(configInput[k])
assert read(R/configInput['boundedExactNIDurationPolicy']['path'])['decisions']==configInput['exactOriginalNIDurationDecisionObjects']
assert configInput['boundedNIUpperCarrier']==third['oldBinding']['path']
cb=read(O/'atlas-check/CONFIG.NI-only.BEFORE.actual-stock-builder-input.json');ca=read(O/'atlas-check/CONFIG.NI-only.AFTER.actual-stock-builder-input.json')
tmp=copy.deepcopy(ca);tmp['expectedCurricularAtomicGoalCount']=cb['expectedCurricularAtomicGoalCount'];assert cb==tmp

hubCheck=read(O/'receipts/CHECK.actual-hub-chemistry-only-one-partial-provenance-diagnostic-delta.json')
assert hubCheck['actualCurrentAfterTwoCarrierReproductionMatchesEveryOriginalAfterReportDigest']
assert hubCheck['allOther19NonChemistryWholeReportDigestsExact'] and len(hubCheck['protectedMathematicsPhysicsBiologyReports'])==3
assert hubCheck['hub']['removingThisExactObservedFindingAndItsCountReproducesOriginalBeforeFindingsAndProjectionsDigests']
finite=write('receipts/CHECK.final-three-carrier-raw-preservation-and-full-Atlas-witness-joins.actual.json',{
 'schemaVersion':1,'checkedAt':now(),'originalRootFilesPreservedExact':len(inventory['files']),
 'currentWhole2652AndWholeSourceA_BPartnerBodiesExact':True,
 'thirdCarrierOriginalMappingRowsRawBytesPreserved':765,'otherDecisionRawBytesPreserved':330,'wholeOtherCarrierMetadataAndManganometryCorrectionsExact':True,
 'threeSourceDecisionsExactlyTransportExistingPairedReview':True,'actualPrivateHostAllThreeCarriersExactCandidates':True,
 'whole333OriginalSourceAndOldPartnerUnionPreserved':True,'wholeAtlasScopeChanges':scopeProof,
 'canonicalGlobal407Retained':True,'niOnlySourceUnionBeforeAfter':[208,209],'stockNIAtlasBeforeAfterExecCodes':[0,0],
 'sourceAtlasInputBindingsVerifiedAgainstActualHostOrExactBeforeSnapshot':True,'other19SubjectReportsIncludingMathPhysicsBioExact':True,
 'crossSubjectHubOwnGoalExactWithOneBoundedChemistryPartialDiagnostic':True,
 'noFullNationalAtlasBuildOrGlobalAtlasCheckClaim':True,'newScienceVotes':0,'wholeOriginalSourceClosure':False,'activeWrites':False})

allJson=[]
for p in sorted(O.rglob('*')):
 if p.is_file():
  assert not p.is_symlink(),p
  if p.suffix=='.json':read(p);allJson.append(str(p.relative_to(O)))
  elif p.suffix=='.jsonl':
   for line in p.read_text().splitlines():json.loads(line)
   allJson.append(str(p.relative_to(O)))
spec=importlib.util.spec_from_file_location('actual_stock_schema_guard',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(str(R));assert errors==[],errors
files=[p for p in sorted(O.rglob('*')) if p.is_file()];rel='\n'.join(str(p.relative_to(R)) for p in files)+'\n'
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=R,input=rel,text=True,capture_output=True)
assert ignore.returncode==1 and not ignore.stdout
guard=write('receipts/CHECK.final-finite-JSON-and-actual-global-stock-symlink-guard.json',{'schemaVersion':1,'checkedAt':now(),'allOwnJSON_JSONLCompleteParse':allJson,'allOriginalRootBindingsStillExact':True,'stockCurriculumSymlinkFunction':'scripts/validate_schemas.py::curriculum_symlink_errors','stockGlobalCurriculumSymlinkErrors':errors,'stockGlobalCurriculumSymlinkErrorCount':0,'ownSymlinkCount':0,'ownIgnoredFiles':[],'gitCheckIgnoreExitCode':ignore.returncode,'activeGitIndexOrRuntimeWrites':False})
completed=now()
selector=write('NEUTRAL.FINAL.three-carrier-current407-and-bounded-NI-atlas.exact-input-selector.json',{
 'schemaVersion':1,'role':'Additive finite technical completion of actual paired SOURCE A/B; no new source/P/D vote',
 'technicalHandoverStartedAt':'2026-10-14T01:27:05Z','completedAt':completed,
 'originalUnmodifiedRootInventory':bind(O/'HANDOVER.original-existing-root-files.exact-bindings.json'),
 'originalTwoCarrierNeutralPreserved':bind(O/'NEUTRAL.paired-source3-decision-transport-current407.exact-input-selector.json'),
 'originalTwoCarrierCASPreserved':bind(O/'CAS.actual-paired-three-partial-source-and-scope-witness-decisions.transport.json'),
 'additiveThirdOperativeAtlasCarrierCAS':bind(O/'CAS.additive-third-operative-atlas-carrier.exact-mechanical-transport.json'),
 'allThreeExactCandidateBindings':[r['candidateBinding'] for r in allrows]+[third['candidateBinding']],
 'originalSuccessfulBeforeAfterCompilerComparison':bind(O/'receipts/CHECK.actual-existing-two-carrier-BEFORE-AFTER-source-and-nonChem-preservation.json'),
 'actualHubDifferenceDiagnosis':bind(O/'receipts/CHECK.actual-hub-chemistry-only-one-partial-provenance-diagnostic-delta.json'),
 'fullOperativeAtlasConfigAndExactBoundedDerivation':bind(O/'INPUT.full-operative-atlas-config-and-exact-NI-bounded-derivation.json'),
 'actualBoundedAtlasBeforeAfterFullReceipts':[bind(O/f'receipts/ATLAS.NI-only.{phase}.actual-stock-full-receipt.json') for phase in ['BEFORE','AFTER']],
 'actualBoundedAtlasExecutionReceipts':[bind(O/f'receipts/ATLAS.NI-only.{phase}.actual-exec-completion.json') for phase in ['BEFORE','AFTER']],
 'privateHostThirdNIImport':bind(O/'receipts/CHECK.exact-third-NI-only-private-host-import.actual.json'),
 'boundedFinalExactJoins':bind(finite),'finiteActualGlobalGuard':bind(guard),
 'authorityBoundaries':{'onlyThreePartialSourceRelationships':True,'wholeOriginalSourceClosure':False,'old010FullGKRadicalMechanismApproval':False,'newP_D_A_M_VScienceVotes':0,'fullNationalAtlasClaim':False,'humanApproval':False,'newD7PeerOutputsRead':False,'activeWrites':False,'strictGainClaim':0}})
for p in sorted(O.rglob('*')):
 if p.is_file() and p.suffix=='.json':read(p)
for x in inventory['files']:verify(x)
for r in read(selector)['allThreeExactCandidateBindings']:verify(r)
seal=write('SEAL.finite-three-reviewed-NI-partial-decisions-current407-transport.actual.json',{
 'schemaVersion':1,'sealedAt':now(),'technicalHandoverStartedAt':'2026-10-14T01:27:05Z','completedAt':completed,
 'finalAdditiveSelector':bind(selector),'files':[bind(p) for p in sorted(O.rglob('*')) if p.is_file() and not p.name.startswith('SEAL.finite-')],
 'actualPairedSourceASeal':originalCas['sourceASeal'],'actualPairedSourceBSeal':originalCas['sourceBSeal'],
 'stockGlobalSymlinkErrors':0,'sourceAtlasDirect2652WitnessesPerNIGKAndLK':3,'threeCarrierOnlyPartialRowsAdded':9,
 'thirdCarrierOldMappingRowsPreserved':765,'thirdCarrierOtherDecisionsPreserved':330,'other19IndependentSubjectReportsExact':True,
 'hubOnlyAdditionalChemistryAPV202':True,'wholeOriginalSourceClosure':False,'newScienceVotes':0,'activeWrites':False,'humanApproval':False,'newD7PeerJudgmentsRead':False})
for x in read(seal)['files']:verify(x)
print(json.dumps({'finalSeal':bind(seal),'files':len(read(seal)['files']),'bytes':sum(x['bytes'] for x in read(seal)['files']),'completedAt':completed,'globalGuard':0,'boundedNIAtlasExecCodes':[0,0]}))
