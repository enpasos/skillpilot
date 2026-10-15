# Apache-2.0. Additive technical handover; raw original JSON object bytes preserved.
import copy, datetime, hashlib, json, pathlib, re
R=pathlib.Path('/home/enpasos/projects/skillpilot')
O=pathlib.Path(__file__).parent
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
read=lambda p:json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,v):
 p=O/n;p.parent.mkdir(exist_ok=True,parents=True)
 if p.exists():
  old=read(p)
  for key in ['preparedAt','capturedAt']:
   if key in old and key in v:v[key]=old[key]
  assert old==v,p
  return p
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return p
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')
def tokens(text,key):
 match=re.search(r'"'+re.escape(key)+r'"\s*:\s*\[',text);assert match,key
 decoder=json.JSONDecoder();at=match.end();result=[]
 while True:
  while text[at].isspace() or text[at]==',':at+=1
  if text[at]==']':return result
  obj,end=decoder.raw_decode(text,at);result.append((at,end,obj,text[at:end]));at=end

# Preserve the original two-carrier CAS/neutral and all earlier receipts unchanged.
inventoryPath=O/'HANDOVER.original-existing-root-files.exact-bindings.json'
if inventoryPath.exists():
 originalFiles=[R/b['path'] for b in read(inventoryPath)['files']]
 assert [bind(p) for p in originalFiles]==read(inventoryPath)['files']
 inventory=inventoryPath
else:
 originalFiles=[p for p in sorted(O.rglob('*')) if p.is_file() and p.name!='finish-third-atlas-carrier-mechanical.py']
 inventory=write('HANDOVER.original-existing-root-files.exact-bindings.json',{'schemaVersion':1,'technicalHandoverStartedAt':'2026-10-14T01:27:05Z','capturedAt':now(),'files':[bind(p) for p in originalFiles],'preservation':'All original two-carrier CAS/neutral/candidates/failed and successful receipts remain exact.'})
cas=read(O/'CAS.actual-paired-three-partial-source-and-scope-witness-decisions.transport.json');ids=cas['sourceIds'];gid=cas['goalId']
standardBefore=R/cas['CAS'][1]['oldBinding']['path'];standardAfter=R/cas['CAS'][1]['candidateBinding']['path']
thirdPath='curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.m7-manganometry-three-route-corrections-20261012-v1.review.chemie-source-cell-merge-poly18-aro19-final-20261013-v1.json'
third=R/thirdPath;sraw=standardBefore.read_text();araw=standardAfter.read_text();raw=third.read_text();before=read(third);sb=read(standardBefore);sa=read(standardAfter)
assert len(before['mappings'])==765 and len(before['decisions'])==333
assert before['sourceExtractionPath']==sb['sourceExtractionPath']
source=read(R/before['sourceExtractionPath']);sourceBy={x['id']:x for x in source['sourceGoals']}
frozen=read(R/read(O/'NEUTRAL.paired-source3-decision-transport-current407.exact-input-selector.json')['wholeSource333']['path']);frozenBy={x['id']:x for x in frozen['sourceGoals']}
assert source==frozen and len(sourceBy)==333
sourceA=read(R/cas['sourceA']['path']);sourceB=read(R/cas['sourceB']['path'])
assert sourceA['overallDecision']=='ACCEPT_THREE_DIRECT_PARTIAL_COMPONENTS_GK_LK_WITH_EXACT_UNION_AND_AUTHORITY_BOUNDARIES'
sourceABy={x['sourceGoalId']:x for x in sourceA['individualRecords']};sourceBBy={x['sourceGoalId']:x for x in sourceB['verdicts']}
assert all(sourceABy[x]['sourceFitDecision']=='ACCEPT_DIRECT_PARTIAL_COMPONENT' and sourceBBy[x]['decision']=='accept_direct_partial_edge' for x in ids)
assert all(sourceABy[x]['wholeOriginalSourceCell']==sourceBy[x]==sourceBBy[x]['wholeOriginalSourceCell'] for x in ids)
st={x[2]['sourceGoalId']:x for x in tokens(sraw,'decisions')};oldtokens=tokens(raw,'decisions');dt={x[2]['sourceGoalId']:x for x in oldtokens};at={x[2]['sourceGoalId']:x for x in tokens(araw,'decisions')}
added=[x for x in sa['mappings'] if x['legacyGoalId'] in ids and x['canonicalGoalId']==gid]
assert added==cas['CAS'][1]['addedMappings'] and len(added)==3 and all(x['matchType']=='partial' for x in added)
newraw={x[2]['legacyGoalId']:x[3] for x in tokens(araw,'mappings') if x[2] in added}
comparison=[];edits=[]
for sid in ids:
 oldrows=[x for x in before['mappings'] if x['legacyGoalId']==sid];stdrows=[x for x in sb['mappings'] if x['legacyGoalId']==sid]
 assert oldrows==stdrows and dt[sid][2]==st[sid][2]
 assert dt[sid][3]==st[sid][3] # raw unchanged original decision bytes, not just values
 assert sid in sourceBy and sourceBy[sid]==frozenBy[sid]
 assert set(dt[sid][2]['canonicalGoalIds']).issubset(at[sid][2]['canonicalGoalIds'])
 assert at[sid][2]['canonicalGoalIds']==dt[sid][2]['canonicalGoalIds']+[gid]
 comparison.append({'sourceGoalId':sid,'wholeOriginalSourceCell':sourceBy[sid],'wholeOldPartnerRows':oldrows,'oldDecisionObject':dt[sid][2],
  'sourceCellExactToReviewed333':True,'wholeOldPartnerRowsExactToReviewedStandardBaseline':True,'oldDecisionValueAndRawObjectBytesExactToReviewedStandardBaseline':True,
  'afterDecision':at[sid][2],'afterRawDecisionSha256':'sha256:'+hashlib.sha256(at[sid][3].encode()).hexdigest(),
  'afterDecisionExactlyCopiedFromExistingPairedTransport':True})
 edits.append((dt[sid][0],dt[sid][1],at[sid][3]))
mappingtokens=tokens(raw,'mappings');lastend=mappingtokens[-1][1]
edits.append((lastend,lastend,',\n    '+',\n    '.join(newraw[x] for x in ids)))
changed=raw
for a,b,t in sorted(edits,reverse=True):changed=changed[:a]+t+changed[b:]
after=json.loads(changed);aftermt=tokens(changed,'mappings');afterdt={x[2]['sourceGoalId']:x for x in tokens(changed,'decisions')}
assert after['mappings']==before['mappings']+added and len(after['mappings'])==768
assert [x[3] for x in aftermt[:765]]==[x[3] for x in mappingtokens]
assert all(afterdt[x[2]['sourceGoalId']][3]==x[3] for x in oldtokens if x[2]['sourceGoalId'] not in ids)
assert all(afterdt[sid][3]==at[sid][3] for sid in ids)
reverted=copy.deepcopy(after);reverted['mappings']=reverted['mappings'][:765]
for i,d in enumerate(reverted['decisions']):
 if d['sourceGoalId'] in ids:reverted['decisions'][i]=dt[d['sourceGoalId']][2]
assert reverted==before
candidate=O/'candidate'/third.name
if candidate.exists():assert candidate.read_text()==changed
else:candidate.write_text(changed)
hostthird=H/thirdPath;assert hashlib.sha256(hostthird.read_bytes()).digest()==hashlib.sha256(third.read_bytes()).digest()
out=write('CAS.additive-third-operative-atlas-carrier.exact-mechanical-transport.json',{
 'schemaVersion':1,'preparedAt':now(),'role':'Pure technical transport of already completed paired SOURCE A/B; no new vote',
 'originalTwoCarrierCAS':bind(O/'CAS.actual-paired-three-partial-source-and-scope-witness-decisions.transport.json'),
 'sourceA':cas['sourceA'],'sourceASeal':cas['sourceASeal'],'sourceB':cas['sourceB'],'sourceBSeal':cas['sourceBSeal'],
 'oldBinding':bind(third),'candidateBinding':bind(candidate),'standardReviewedBefore':bind(standardBefore),'standardPairedAfter':bind(standardAfter),
 'wholeOriginal333SourceBinding':bind(R/before['sourceExtractionPath']),
 'threeExactOriginalComparisonsAndDecisionHistory':comparison,'addedMappings':added,
 'original765MappingRowsRawObjectBytesExact':True,'other330DecisionRawObjectBytesExact':True,'allOtherCarrierMetadataAndSpecialManganometryCorrectionsExact':True,
 'candidateMappingRows':len(after['mappings']),'candidateSourceDecisions':len(after['decisions']),
 'source2652OnlyThreePARTIAL':True,'wholeOriginalSourceOperatorClosureApproval':False,'old010RadicalMechanismGKApproval':False,
 'newScienceVotes':0,'newD_P_A_M_V_HumanClaims':0,'activeWrites':False,
 'privateHostBeforeImportBinding':bind(hostthird),'privateHostImportPending':True})

beforeReceipt=read(O/'receipts/BEFORE.actual-stock-whole-compiled-NI2652-source.json');afterReceipt=read(O/'receipts/AFTER.actual-stock-whole-compiled-NI2652-source.json')
chem='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
br={x['landscapeId']:x for x in beforeReceipt['allCompiledReportDigests']};ar={x['landscapeId']:x for x in afterReceipt['allCompiledReportDigests']}
assert set(br)==set(ar) and len(br)==21
hub='a0e13c56-c25f-4742-9272-3a1a603ee52e'
assert all(br[k]==ar[k] for k in br if k not in [chem,hub])
assert br[hub]['goalsDigest']==ar[hub]['goalsDigest']
hubCheck=read(O/'receipts/CHECK.actual-hub-chemistry-only-one-partial-provenance-diagnostic-delta.json')
assert hubCheck['hub']['removingThisExactObservedFindingAndItsCountReproducesOriginalBeforeFindingsAndProjectionsDigests']
assert beforeReceipt['wholeSelectedCompiledGoal']['compiledApplicability']==afterReceipt['wholeSelectedCompiledGoal']['compiledApplicability']
assert beforeReceipt['hasDirectNISourceBacking'] is False and afterReceipt['hasDirectNISourceBacking'] is True
assert len(beforeReceipt['niDirectSourceEvidence'])==0 and len(afterReceipt['niDirectSourceEvidence'])==2
assert all(x['mappingStrength']=='partial' for x in afterReceipt['niDirectSourceEvidence'])
write('receipts/CHECK.actual-existing-two-carrier-BEFORE-AFTER-source-and-nonChem-preservation.json',{
 'schemaVersion':1,'checkedAt':now(),'before':bind(O/'receipts/BEFORE.actual-stock-whole-compiled-NI2652-source.json'),'after':bind(O/'receipts/AFTER.actual-stock-whole-compiled-NI2652-source.json'),
 'directNI2652Before':False,'directNI2652After':True,'directNICarrierEvidenceBefore':0,'directNICarrierEvidenceAfter':2,
 'exactCompiled2652ApplicabilityBeforeAndAfter':beforeReceipt['wholeSelectedCompiledGoal']['compiledApplicability'],
 'separateNonChemistryReportsCompared':len(br)-2,'allOther19NonChemistryWholeGoalsFindingsAndProjectionDigestsExact':True,
 'crossSubjectHubOwnGoalExactButFindingsAndProjectionNotExact':True,'exactHubChemistryDiagnosticDeltaCheck':bind(O/'receipts/CHECK.actual-hub-chemistry-only-one-partial-provenance-diagnostic-delta.json'),
 'beforeAndAfterCompilerErrorCount':[beforeReceipt['compilerSummary']['errors'],afterReceipt['compilerSummary']['errors']],
 'reportedOriginalCompilerProcessExitCodes':{'before':0,'after':0,'provenance':'Parent observed actual stock command completion; original stdout/stderr and full result receipts preserved. This verifier does not invent a fresh execution.'},
 'firstIncompleteHostAttemptsPreservedInOriginalInventory':True,'newCompilerRun':False,'wholeSourceOrMaturityApproval':False})

# Full operative atlas config is bound and retained; a separate pure NI-only check is explicit.
full=R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';hostfull=H/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json';fc=read(full);hc=read(hostfull)
assert fc==hc and thirdPath in fc['mappingPaths']
policy=H/hc['durationModelPolicyPath'];pol=read(policy);nirows=[x for x in pol['decisions'] if x.get('subject')=='Chemie' and x.get('jurisdiction')=='DE-NI'];assert nirows
boundedpolicy={k:v for k,v in pol.items() if k!='decisions'};boundedpolicy['decisions']=nirows
pp=write('candidate/atlas-bounded-NI-duration-policy.exact-original-NI-rows.json',boundedpolicy)
relativeOwn=str(O.relative_to(R))
hostpp=H/pp.relative_to(R);hostpp.parent.mkdir(parents=True,exist_ok=True);assert not hostpp.exists();hostpp.write_bytes(pp.read_bytes())
write('INPUT.full-operative-atlas-config-and-exact-NI-bounded-derivation.json',{
 'schemaVersion':1,'fullOperativeAtlasConfigBinding':bind(full),'fullOperativeHostAtlasConfigBinding':bind(hostfull),'fullOperativeAtlasConfig':fc,
 'stockAtlasBuilderBinding':bind(R/'app/scripts/goalBookSourceAtlasInputs.ts'),
 'unchangedHostAtlasBuilderBinding':bind(H/'app/scripts/goalBookSourceAtlasInputs.ts'),
 'boundedNIUpperCarrier':thirdPath,'boundedNIMappingPaths':[p for p in hc['mappingPaths'] if '/DE-NI/' in p],
 'fullOriginalDurationPolicyHostBinding':bind(policy),'boundedExactNIDurationPolicy':bind(pp),'boundedPolicyHostBinding':bind(hostpp),
 'exactOriginalNIDurationDecisionObjects':nirows,
 'boundary':'NI-only stock builder witness, not a complete national atlas build/check, no change to national counts, other subject floors, ordinary operative config or published/generated atlas files.',
 'newRuntimeOrPublicAtlasOutputWrites':False})
print(json.dumps({'thirdCandidate':bind(candidate),'oldMappingRows':765,'newRows':3,'unchangedOtherDecisions':330,'existingTwoCarrierSeparateNonChemistryReportsExact':19,'hubOwnGoalExactAndOnlyOneChemistryPartialDiagnosticAdded':True,'originalExistingFilesPreserved':len(originalFiles),'next':'Pure stock bounded NI atlas BEFORE, then exact private third-carrier import, then AFTER.'}))
