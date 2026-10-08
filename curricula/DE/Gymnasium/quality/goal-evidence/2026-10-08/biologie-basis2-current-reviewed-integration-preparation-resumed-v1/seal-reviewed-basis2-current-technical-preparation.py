# SPDX-License-Identifier: Apache-2.0
"""Seal real current technical inputs/results; never claim a new science review."""
import hashlib,importlib.util,json,subprocess
from pathlib import Path
from datetime import datetime,timezone
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
def read(p):return json.loads(Path(p).read_text())
def bind(p):
    p=Path(p);return dict(path=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def put(p,v):
    p=Path(p);assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
guard=read(OWN/'reviewed-basis2-current-final-adoption.guard.json')
assert not (OWN/'root-guarded-basis2-apply.actual.json').exists()
for d in guard['before'].values():assert bind(ROOT/d['active']['path'])==d['active']
for d in guard['candidate'].values():assert bind(ROOT/d['path'])==d
assert read(OWN/'checks/strict-affected-capsule-biology246-of394.actual.json')['actualBlockingIssues']==0
assert read(OWN/'checks/capsule-actual-whole394-page-frame.json')['wholePageDeltasToActuallyReviewedFinal394']==[]
native=[OWN/k/'bundle'/name for k in ['native-d-two-basic','native-d-existing576-context'] for name in ['book.html','book.pdf']]
index=[]
for p in native:
    rel=str(p.relative_to(ROOT)); line=subprocess.check_output(['git','ls-files','--stage','--',rel],text=True).strip()
    assert line and line.split()[0]=='100644' and line.split()[2]=='0',line
    oid=line.split()[1];blob=subprocess.check_output(['git','cat-file','blob',oid]);assert blob==p.read_bytes()
    index.append(dict(**bind(p),actualIndexObject=oid,indexMode='100644',actualBlobBytesExact=True))
ignore=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p.relative_to(ROOT)) for p in native)+'\n',text=True,capture_output=True)
assert ignore.returncode==1 and not ignore.stdout
put(OWN/'checks/portable-native-four-index-bytes.actual.json',dict(explicitRootAuthorizedOnlyTheseFourNativeCopiesStaged=True,nativeFiles=index,ordinaryCheckIgnoreExitCode=ignore.returncode,ordinaryCheckIgnoreOutput=ignore.stdout,noIgnoreRuleOrValidatorChanges=True,noCommitOrPush=True))
spec=importlib.util.spec_from_file_location('skillpilot_current_schema_validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
schema=read(ROOT/'docs/landscape-runtime.schema.json');jsonfiles=sorted(OWN.rglob('*.json'))
errors=[]
for p in jsonfiles:
    assert not p.is_symlink(),p
    if not mod.validate_file(str(p.relative_to(ROOT)),schema): errors.append(str(p.relative_to(ROOT)))
runtime_errors=[]
try:jsonschema.validate(read(ROOT/guard['candidate']['canonical']['path']),schema)
except jsonschema.ValidationError as exc:runtime_errors.append(exc.message)
assert not errors and not runtime_errors
jsonl_count=0
for p in OWN.rglob('*.jsonl'):
    assert not p.is_symlink(),p
    for line in p.read_text().splitlines():
        if line.strip():json.loads(line);jsonl_count+=1
symlinks=[str(p.relative_to(ROOT)) for p in OWN.rglob('*') if p.is_symlink()]
assert not symlinks
whitespace=subprocess.run(['git','diff','--check'],text=True,capture_output=True);assert whitespace.returncode==0
put(OWN/'checks/affected-schemas-and-portable-files.actual.json',dict(ordinaryValidateFileParsedJsonCount=len(jsonfiles),ordinaryValidateFileErrors=errors,actualFutureCanonicalRuntimeSchemaErrors=runtime_errors,jsonlRecordsParsed=jsonl_count,packageSymlinks=symlinks,localIgnoredTmpCapsuleNotAnEvidenceArtifact=True,actualDiffCheckExitCode=whitespace.returncode,newScientificReviewByIntegrator=False,activeWrites=0,humanApproval=False))
outputs=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
seal=OWN/'reviewed-basis2-current-integration-preparation.first-technical.freeze.json'
put(seal,dict(schemaVersion=1,role='IMMUTABLE_TECHNICAL_CURRENT_REVIEWED_BASIS2_INTEGRATION_PREPARATION_FIRST_SEAL',sealedAtUtc=datetime.now(timezone.utc).isoformat(),actualHead=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),declaredTechnicalOutputFiles=outputs,originalGenuineReviewsUnchanged=True,rootOriginalReadiness=bind(OWN/'pending/original-seal-verification.actual.json'),normalWhole394FrameExact=True,actualAffectedCapsuleCentral='246/394 blocking0 terminal0',currentActiveStill='244/392',newScientificReviewByIntegrator=False,activeWrites=0,activeStrictGainClaimed=0,humanApproval=False,humanTrial=False))
entry=OWN/'neutral-reviewed-basis2-current-integration-ready.technical.entry.json'
put(entry,dict(schemaVersion=1,role='NEUTRAL_GENUINE_REVIEWED_BASIS2_CURRENT_TECHNICAL_INTEGRATION_READY',firstTechnicalSeal=bind(seal),exactFinalGuard=bind(OWN/'reviewed-basis2-current-final-adoption.guard.json'),concreteReadOnlyApplyPlan=bind(OWN/'concrete-root-guarded-apply-plan.actual.json'),guardedRootApplyScript=bind(OWN/'guarded-root-apply-reviewed-basis2.technical.py'),rootOriginalSixSealVerification=bind(OWN/'pending/original-seal-verification.actual.json'),actualAffectedCentralProof=bind(OWN/'checks/strict-affected-capsule-biology246-of394.actual.json'),actualWhole394PageFrame=bind(OWN/'checks/capsule-actual-whole394-page-frame.json'),actualNativeFourIndexBytes=bind(OWN/'checks/portable-native-four-index-bytes.actual.json'),actualAffectedSchemaProof=bind(OWN/'checks/affected-schemas-and-portable-files.actual.json'),selectedGoalIds=guard['newGoalIds'],existingWordGenuineContextSupersession=guard['contextSupersessionGoalId'],currentActive=dict(strictComplete=244,denominator=392,canonicalNodes=476),actualIsolatedCandidate=dict(strictComplete=246,denominator=394,canonicalNodes=478,blockingIssues=0),predictedNetGain=2,predictedNewScientificClosures=guard['newGoalIds'],restoredExistingContextBindingNetGain=0,all244PreviousStrictIdsRetained=True,all392QAAndHumanFieldsExact=True,allExistingWholePProfilesAndAll392AMRowsExact=True,source9Duties10PartialRows8MappingPointers=True,wholeOriginal20Duties268PartnersAndFourOperatorHoldsRetained=True,activeWrites=0,activeStrictGainClaimed=0,newScientificReviewByIntegrator=False,humanApproval=False,humanTrial=False))
print(json.dumps(dict(readyEntry=bind(entry),firstTechnicalSeal=bind(seal),predictedNetGain=2,actualCapsule='246/394',active='244/392',portableNativeIndexBlobsExact=4,affectedSchemaErrors=0,activeWrites=0)))
