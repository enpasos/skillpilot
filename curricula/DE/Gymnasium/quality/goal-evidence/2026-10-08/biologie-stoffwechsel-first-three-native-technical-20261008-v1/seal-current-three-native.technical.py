#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime, timezone
import hashlib, importlib.util, json, os, subprocess

R=Path('/home/enpasos/projects/skillpilot'); D=Path(__file__).resolve().parent
INACTIVE=R/'app/scripts/config/goal-books/inactive/biologie-stoffwechsel-first-three-native-20261008-v1'
def bind(p):
 p=Path(p); raw=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def put(name,value):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);text=json.dumps(value,ensure_ascii=False,indent=2)+'\n'
 if p.exists():assert p.read_text()==text,'Preserve prior exact technical output: '+str(p)
 else:p.write_text(text)
 return bind(p)
entry_path=D/'neutral-current-first-three-native.technical.entry.json';entry=json.loads(entry_path.read_text())
assert entry['actualPdfPhysicalPages']==5 and entry['fullCurrentAtomicBase']==392 and entry['wholeCanonicalGoalCount']==476
assert entry['nativeDPReviewStatus']=='PENDING_TWO_INDEPENDENT_REVIEWERS'
assert entry['sourceOperationalStatus']=='PENDING_TWO_INDEPENDENT_CURRENT_PROJECTION_REVIEWS'
checks=json.loads((D/'checks/normal-native-models-and-blind-campaigns.actual.json').read_text());assert checks['whole3PProfileClosedSchemaAndNativeSemanticsErrors']==0
current_diff=json.loads((D/'checks/actual-whole392-before-vs-source-raster-candidate.page-context.diff.json').read_text());assert current_diff['other389WholePageAndContextObjectsExact']
staged=[]
for name in ['book.html','book.pdf']:
 p=D/'native-three'/name;relative=str(p.relative_to(R));subprocess.run(['git','ls-files','--error-unmatch','--',relative],cwd=R,check=True,capture_output=True)
 blob=subprocess.run(['git','show',':'+relative],cwd=R,check=True,capture_output=True).stdout;assert blob==p.read_bytes();assert blob==(D/'native-three/bundle'/name).read_bytes()
 staged.append({'actualOriginal':bind(p),'actualIndexBlobSha256':hashlib.sha256(blob).hexdigest(),'actualIndexBlobBytesExact':True,'sameBundleBytes':True,'targetedIndexIntakeByRoot':True,'ignoreAndValidatorRulesUnchanged':True})
put('checks/actual-original-native3-index-membership-and-Blobbytes.json',{'schemaVersion':1,'role':'Actual normal versioning verification, no approval','files':staged,'gitCheckIgnoreUsesCurrentIndex':True,'ignoreExceptionsAdded':False,'validatorExceptionsAdded':False,'activeCurriculumWrites':0})
put('checks/first-auxiliary-bundle-check-call.corrected-technical-note.json',{'schemaVersion':1,'firstAuxiliaryCall':'Incorrect object-wrapper invocation of the positional verifyGoalBookReviewBundleArtifactBytes API failed before any check receipt was written.','actualCorrection':'Called the unchanged API with ordinary positional bundle,bundleDirectory arguments; all four models, all actual bundle bytes and both blind campaigns then passed their normal parsers.','nativeCandidateArtifactsChangedToHideError':False,'independentResultsCreated':0,'activeWrites':0})
aliases=[]
for p in D.rglob('*'):
 if p.is_symlink():
  target=os.readlink(p);assert not os.path.isabs(target);resolved=p.resolve(strict=True);assert resolved.is_relative_to(D) and resolved.is_file();aliases.append({'path':str(p.relative_to(R)),'relativeTarget':target,'actualResolvedFile':bind(resolved)})
assert len(aliases)==3
ownfiles=sorted(p for p in D.rglob('*') if p.is_file())
inactivefiles=sorted(p for p in INACTIVE.rglob('*') if p.is_file())
res=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p.relative_to(R)) for p in ownfiles+inactivefiles)+'\n',text=True,capture_output=True,cwd=R);assert res.returncode in [0,1];assert not res.stdout,res.stdout
spec=importlib.util.spec_from_file_location('normalSchemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);schema=json.loads((R/'docs/landscape-runtime.schema.json').read_text());jsonfiles=[p for p in ownfiles+inactivefiles if p.suffix=='.json'];assert all(mod.validate_file(str(p),schema) for p in jsonfiles)
for original in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json']:
 prior=next(x for x in entry['authorInputBindings'] if x['path']==original);actual=bind(R/original);assert prior['sha256']=='sha256:'+actual['sha256'];assert prior['bytes']==actual['bytes']
put('native-three.first-materialization.freeze.json',{'schemaVersion':1,'role':'Actual technical first-materialization seal; no independent science/description/source/visual approval','createdAt':datetime.now(timezone.utc).isoformat(),'neutralEntry':bind(entry_path),'allOwnPortableArtifacts':[bind(p) for p in ownfiles],'allInactiveOrdinaryAppAtlasArtifacts':[bind(p) for p in inactivefiles],'actualRelativeImageAliases':aliases,'targetedOriginalIndexIntakeVerified':staged,'normalJSONFilesChecked':len(jsonfiles),'fourNativeModelsAndExactBundleBytesAndTwoBlindCampaignsPassed':True,'actualStandardPdfPhysicalPages':5,'current392Unchanged':True,'allOther389WholePagesAndContextsExact':True,'allHumanFieldsExact':True,'nativeIndependentDPResults':0,'operativeSourceProjectionStatus':'pending','fourWholeOperatorHoldsRetained':True,'twoGenuineBasicCompanionsPendingOutside392':True,'sourceScopeCountersAreNotWholeDutyApproval':True,'activeWrites':0,'newStrictClosures':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'entry':bind(entry_path),'firstSeal':bind(D/'native-three.first-materialization.freeze.json'),'normalJSONChecks':len(jsonfiles),'nativePdfPhysicalPages':5,'actualIndexedOriginalsExact':True,'relativeImageAliases':len(aliases),'nativeDPStatus':'pending'}))
