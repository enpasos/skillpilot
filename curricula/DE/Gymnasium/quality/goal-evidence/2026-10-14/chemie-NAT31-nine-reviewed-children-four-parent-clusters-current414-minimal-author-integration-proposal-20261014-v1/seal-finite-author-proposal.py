#!/usr/bin/env python3
import datetime,hashlib,json,pathlib,runpy,sys
sys.dont_write_bytecode=True
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).resolve().parent;Q=O.relative_to(R)
def read(p):return json.loads((R/p).read_text())
def put(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 p=pathlib.Path(p);p=p.relative_to(R) if p.is_absolute() else p;b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
inputs=read(Q/'INPUTS.exact-whole-material-selection.external-bindings.json')
source=read(Q/'SOURCE.whole-original-cells-all-original-partners-current-carrier-deltas.NO-GRANT.json')
extras=[pathlib.Path('app/scripts/goalVisualizationQaModel.ts'),pathlib.Path('app/src/utils/goalVisualizationQaStatus.ts')]
extras+=[pathlib.Path(d['path']) for d in source['sourceDocuments'] if isinstance(d.get('path'),str) and (R/d['path']).is_file()]
for p in extras:
 b=bind(p)
 if b['path'] not in {x['path'] for x in inputs['bindings']}:inputs['bindings'].append(b)
put('INPUTS.exact-whole-material-selection.external-bindings.json',inputs)
neutral=read(Q/'NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json')
neutral['genuineScienceHistorySeparatelyBound']=bind(Q/'INPUTS.exact-whole-material-selection.external-bindings.json')
for p in ['M/M419.original408-plus-two-reviewed-Rest-and-nine-reviewed-NAT.candidate.jsonl','M/current75.other73-original-lines-plus-two-original-a-retarget-lines.candidate.jsonl','config/M419.exact-original-memory-science-and-all-original-visibility-scopes.UNEXECUTED.inactive.config.json','HOLD.exact-current-source-course-view-acquisition-and-native-boundaries.json']:
 b=bind(Q/p)
 if b['path'] not in {x['path'] for x in neutral['wholeInputs']}:neutral['wholeInputs'].append(b)
put('NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json',neutral)
joins=[]
for x in inputs['bindings']:
 actual=bind(pathlib.Path(x['path']));assert actual==x,(x,actual);joins.append({'path':x['path'],'sha256':x['sha256'],'bytes':x['bytes'],'actualMatch':True})
for x in neutral['wholeInputs']:
 assert bind(pathlib.Path(x['path']))==x
put('CHECK.exact-all-external-bindings-and-neutral-whole-input-joins.actual.json',{'externalBindingCount':len(joins),'neutralWholeInputCount':len(neutral['wholeInputs']),'allMatch':True,'bindings':joins})

raw=read(Q/'CHECK.M419-fingerprints-two-card-origins-and-original-V7-raw-types.actual.json')
schemas=read(Q/'CHECK.finite-P9-kind551-view28-canonical-formal-schemas.actual.json')
assert all(x['pass'] for x in schemas)
assert raw['memory419ExactFingerprintMirror']['pass'] and raw['card2ExactFingerprintMirror']['pass'] and raw['originalTypedRawV7']['pass']
put('CHECK.finite-pre-central-raw-types-stock-V-and-terminal-D-chain.author-preparation.json',{
 'originalTypedV7RawYesNoStringsReviewerDatePixelHashPass':True,
 'normalUnmodifiedVFunctionsUsed':['normalizeGoalVisualizationAiReview','isAiApprovedForCurrentAsset'],
 'twoUnchangedV2GenuineScienceBoundWithoutInventedTypedMetadata':True,
 'normalWholeQAAndCanonicalPublicPNGPreflightPerformed':False,
 'currentDResolutionIndicesOrTerminalOwnerChainsCreated':False,'fullOriginalNativeRunRecordFilesBound':16,
 'fullM419NormalVisibilityAcquisitionGateExecuted':False,
 'preCentralReady':False,
 'requiredContract':'Before any later central run: exact current canonical/public PNG hashes plus approval filter, full stock WholeQA check, raw yes/no types and original reviewer/date fields, and normal actual terminal D-owner chain. Preserve real BLOCK/revise/withdrawal provenance. This author dossier does not substitute for those gates.'})

# Actual unchanged stock global symlink guard; no global schema/build invocation.
guard=runpy.run_path(str(R/'scripts/validate_schemas.py'))['curriculum_symlink_errors'](R)
assert guard==[],guard
assert not any(p.is_symlink() for p in O.rglob('*'))
put('CHECK.actual-stock-curriculum-symlink-guard.json',{
 'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'function':'scripts/validate_schemas.py::curriculum_symlink_errors(repo_root)',
 'source':bind('scripts/validate_schemas.py'),'errors':guard,'errorCount':0,'ownRootSymlinks':0,
 'fullGlobalSchemaOrBuildRun':False,'ignoredScratchSymlinkStandInsUsed':False})

manifest={
 'schemaVersion':1,'documentRole':'finite minimal NAT9 informed AUTHOR integration proposal; no new independent science',
 'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'exactNeutralSelector':bind(Q/'NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json'),
 'wholeCandidate':bind(Q/'candidate/canonical551.prospective419.on-final542.exact-reviewed-NAT9.inactive.json'),
 'wholeSemanticLedger':bind(Q/'candidate/semantic551.prospective419.existing-paired-kind-science.json'),
 'canonicalCAS':bind(Q/'CAS.exact-four-parent-structure-plus-nine-reviewed-whole-children.NOT-APPLIED.json'),
 'viewCAS':bind(Q/'CAS.current-Chemistry-views-only-four-parent-reference-kinds.NOT-APPLIED.json'),
 'memoryCAS':bind(Q/'CAS.M419-existing-science-container-and-operative-selection.NOT-APPLIED.json'),
 'cardCAS':bind(Q/'CAS.two-card-origin-tags-with-separate-paired-retarget-science.NOT-APPLIED.json'),
 'matrix':bind(Q/'MATRIX.nine-children-reuse-versus-actual-integration-HOLDs.NO-CLOSURE.json'),
 'remainingBoundaries':bind(Q/'HOLD.exact-current-source-course-view-acquisition-and-native-boundaries.json'),
 'README':bind(Q/'README.minimal-NAT9-author-integration-proposal.md'),
 'base':{'wholeObjects':542,'curricularAtomic':414},'candidateArithmeticOnly':{'wholeObjects':551,'curricularAtomic':419},
 'preservation':{'otherWholeObjects':538,'previouslyMeasured292WholeBodiesExact':True,'rootWholeObjectExact':True,'rawRootWeight':1.2,'otherCurrentRequiresExact':True,'allActiveSourceRowsUntouched':True},
 'existingGenuineScience':{'nineWholeChildren':True,'fourParentClusters':True,'twoCardRetargetsSeparatelyPaired':True,'sevenCorrectedV3AndTwoRetainedV2PProfilesExact':True,'wholeDEENCases':19,'actualPNGs':9,'finalAmmoniumPNG':'sha256:5c1e74bc38c3a1e4c09250f6dbcbe4227fe11f359287c3826c4422919f78ee4c'},
 'normalScopedChecks':{'A7Exit':0,'A2Exit':0,'P9StockModelBindingsPass':True,'semanticKind551ActualFingerprintsPass':True,'canonicalContainsAndDirectionalRequiresDAGPass':True,'formalSchemaDocumentRecordCount':39,'formalSchemaErrors':0,'M419FingerprintContractMirrorPass':True,'fullNormalM419Executed':False,'actualStockSymlinkGuardErrors':0},
 'views':{'affectedChemistryViews':28,'exactParentReferenceKindEdits':82,'mechanicalRequiredFormatFieldsPerView':['$schema','viewFormatVersion','language'],'scopedDeltaNoNewErrors':True,'preexistingStockCPV009Occurrences':386,'fullViewGatePass':False,'specificMissingDirectAcquisitionOccurrences':54},
 'source':{'wholeOriginalDirectParentBindings':251,'uniqueOriginalWholeCells':229,'wholeOriginalPartnerObjects':101,'currentLiteralAndPartnerDelta':'HH-LK mesomeric peptide-group remains at197bc+95dc; historical62149partial row not restored.','wholeSourceOrCourseGrant':False,'humanClassroomSelectionAsserted':False},
 'currentDResolutionsProduced':0,'newIndependentScientificVotes':0,'strictGainMeasured':False,'newClosuresClaimed':0,
 'activeWrites':0,'hostWrites':0,'GitMutations':0,'engineRuntimeWrites':0,'HumanApproval':False,'HumanTrial':False,'M7Grant':False}
put('FINAL.minimal-NAT9-current551-existing-paired-science-author-integration-proposal.manifest.json',manifest)

parsed=[]
for p in sorted(O.rglob('*')):
 if p.is_file() and p.suffix in ['.json','.jsonl']:
  if p.suffix=='.json':json.loads(p.read_text());n=1
  else:
   ls=[x for x in p.read_text().splitlines() if x.strip()];[json.loads(x) for x in ls];n=len(ls)
  parsed.append({'path':str(p.relative_to(R)),'recordsParsed':n})
put('CHECK.full-owned-JSON-JSONL-parse-before-seal.actual.json',{'fileCount':len(parsed),'allParsed':True,'files':parsed})
sealname='SEAL.finite-NAT9-final542-to551-minimal-author-integration-proposal.actual.json'
owned=[bind(p) for p in sorted(O.rglob('*')) if p.is_file() and p.name!=sealname]
seal={'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'finite informed author integration proposal, not a scientific vote or central completion',
 'manifest':bind(Q/'FINAL.minimal-NAT9-current551-existing-paired-science-author-integration-proposal.manifest.json'),
 'ownedFileCount':len(owned),'ownedBytes':sum(x['bytes'] for x in owned),'files':owned,'externalBindings':bind(Q/'INPUTS.exact-whole-material-selection.external-bindings.json'),
 'allOwnedJSONJSONLParsedBeforeSeal':True,'actualStockCurriculumSymlinkErrors':0,'newScientificVotes':0,'newClosuresClaimed':0,'notApplied':True,
 'activeHostGitEngineWrites':0,'HumanApproval':False,'HumanTrial':False}
put(sealname,seal);json.loads((O/sealname).read_text())
for b in owned:assert bind(pathlib.Path(b['path']))==b
print(json.dumps({'seal':bind(Q/sealname),'ownedFileCount':len(owned),'ownedBytes':sum(x['bytes'] for x in owned),'JSONJSONLFilesParsedIncludingSeal':len(parsed)+2,'externalBindings':len(joins),'stockSymlinkErrors':0,'newVotes':0,'newClosures':0}))
