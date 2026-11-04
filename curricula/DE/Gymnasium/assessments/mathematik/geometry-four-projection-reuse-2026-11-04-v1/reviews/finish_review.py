from pathlib import Path
import hashlib
import json

out=Path(__file__).resolve().parent
repo=out.parents[2]
pack=out.parent/'geometry-projection-fixpoints-vectorproduct-four-whole-forms-20261104-v1'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name,data): (out/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
manifest=read(pack/'review-input-manifest.json')
G574='5748633c-113f-5ea8-9041-24da55919de7'
E3='e3c70a12-7886-51f7-8bcd-ed54865415d6'
ED5='ed5d869b-af4e-4b80-b34d-a2338e16ce34'
G075='075f1ef2-6860-4b20-9df2-878157eb395e'
EFF='effe43eb-cabe-56cb-a228-35887d7915c1'
scope=read(out/'independent-scope-and-partial-mastery.json')
browser=[f for f in manifest['files'] if f['path'].startswith('browser/') and f['path'].endswith('.png')]
assert len(browser)==24
views=[{**f,'actuallyViewed':True,'judgment':'PASS_READABLE_NO_CONTENT_BLOCKER'} for f in browser]
for f in views:
 if f['path']=='browser/spatial-fixed-point-sets.taskContentEn.390.png':
  f['cosmeticObservation']='D and following full stop wrap awkwardly; no loss of meaning.'
write('independent-visual-review.json',{
 'status':'ACTUAL_INDEPENDENT_VISUAL_INSPECTION_COMPLETED',
 'browserScreenshots':views,
 'sourcePageImagesActuallyViewed':[f for f in manifest['files'] if f['path'].startswith('source-pages/') and f['path'].endswith('.png')],
 'solutionFigureActuallyViewed':[f for f in manifest['files'] if f['path']=='solution-figures/coordinate-views-solution-v1.png'],
 'figureMath':'top filled triangle (1,1),(5,1),(1,4) has area 6; side segment from (1,2) to (4,5), first two vertices coincide, area 0',
 'solutionOnly':True,'taskAnswerLeakFound':False,
 'newBrowserRun':False,'hostRenderingAcceptance':False,
 'limitation':'Existing desktop task/solution screenshots and mobile task screenshots inspected; no mobile solution or external host acceptance claimed.'
})
docs=['AGENTS.md','docs/concept/skill-graph/assessment-gated-completion.md',
 'app/scripts/applicabilityCompiler.ts','app/scripts/sourceCoverageAndApplicabilityRegression.test.ts',
 'app/scripts/generateMathDurationCompositionViews.ts','app/scripts/lib/canonicalMathSek1ReviewedExamRoutes.ts']
write('supplemental-read-only-bindings.json',{
 'status':'CURRENT_ROOT_READ_ONLY_CONTEXT_NOT_A_ROOT_CHANGE',
 'files':[{'path':p,'sha256':sha(repo/p)} for p in docs],
 'meaning':'Relevant passages only, for completion, direct-edge semantics, normal/strict focus, applicability derivation and the bounded Sek-I route filter. These are not a full review or approval of these implementation files.'
})
formrows=read(pack/'content-review-handoff.json')['forms']
bygap=[r['scope'] for r in scope['scopeRows'] if r['goal574Target'] and not r['e3Target']]
assert len(bygap)==4 and all(x.startswith('DE-BY/') for x in bygap)
review={
 'schemaVersion':1,'reviewer':'independent-astra-ultra-content-review','reviewedAt':'2026-11-04',
 'status':'CONTENT_CONDITIONAL_ACCEPTED',
 'inputPackage':str(pack.relative_to(repo)),
 'inputHandoffSha256':sha(pack/'content-review-handoff.json'),
 'inputManifestSha256':sha(pack/'review-input-manifest.json'),
 'report':{'path':'report.md','sha256':sha(out/'report.md')},
 'wholeForms':[{'goalId':r['goalId'],'contentPath':r['contentPath'],
    'contentSha256':sha(pack/r['contentPath']),'decision':'CONTENT_CONDITIONAL_ACCEPTED',
    'bilingualWholeTaskSolutionRubricReviewed':True,
    'proposedLaterExecution': 'separate_assessment_only_for_remaining_BY_gaps_keep_574_ordinary' if r['goalId']==G574 else 'whole_assessment_execution_under_existing_curricular_id',
    'currentOriginalA':'atomic','currentOriginalM':'no_memory_needed'} for r in formrows],
 'genuineReuse':{'existingExamId':E3,'reusedOriginalCompetencyId':G574,
   'decision':'ACCEPT_POINT_PROJECTION_AND_GEOMETRIC_INTERPRETATION_VARIANT_OF_OR_CONTRACT',
   'coverageBefore':[ED5],'coverageRecommended':[ED5,G574],
   'coverageReason':'Scored concrete projection, perpendicular decomposition, generic image/kernel interpretation; independent of proposed requires edge.',
   'requiresBefore':[ED5],'requiresRecommended':[ED5,G574],
   'condition':'Apply the independently justified common-preparation correction of 574 together with this global preparation edge.',
   'unmodifiedBroad574RequiresEdgeRecommended':False,
   'newGlobalMasteryWrites':False,
   'extraRegisteredE3AMRowsNecessary':0,
   'e3AMBinding':'e3-independent-am-and-binding.json'},
 'ordinary574PreparationCorrection':{'goalId':G574,
   'requiresBefore':scope['proposal'][0]['oldRequires'],'requiresRecommended':[G075],
   'reason':'The original OR contract permits elementary point projection; oblique drawing, whole-object coordinate selection and general line-plane classification are not universal prerequisites.',
   'descriptionOrApplicabilityRewriteRecommended':False},
 'separate574Assessment':{'newId':None,'status':'EXACT_FUTURE_ID_AND_SCOPE_BINDING_PENDING',
   'contentFrom':next(r['contentPath'] for r in formrows if r['goalId']==G574),
   'requiresRecommended':[G574,EFF],'coveredGoalIdsRecommended':[G574],
   'parameterLineReason':'Whole new form tasks 2 and 4 require parameter-line interpretation and substitution; this is form-specific preparation, not a requirement of every OR variant.',
   'remainingGapScopesInPinnedN2':bygap,
   'scopeRestriction':'Reviewed authored references/applicability for these remaining gaps; no conditional runtime edge and no second compulsory HE assessment.',
   'mustRevalidateAgainstActualJointCandidate':True},
 'evidence':{'originalAMRows':'eight-current-original-am-recommendations.json',
   'rawARows':'semantic-atomicity.proposed-current-original-rows.jsonl',
   'rawMRows':'memory-card-review.proposed-current-original-rows.jsonl',
   'independentMathematics':'independent-mathematics.json',
   'staticScopeAndPartialMastery':'independent-scope-and-partial-mastery.json',
   'actualVisualReview':'independent-visual-review.json',
   'integrity':'input-integrity.json'},
 'futureIntegrationRequired':[
  'Use actual common G3/G4 candidate; historical N2 calculations are not its native result.',
  'Bind three same-ID execution roles while preserving their original curricular A/M obligations and checking any changed nodeKind fingerprints.',
  'Bind new BY assessment ID, whole form, both genuine prerequisites and exactly the remaining applicable target references.',
  'Apply 574 requires correction, e3 requires addition and separately justified e3 coverage addition together.',
  'Verify all actual scope/context/target/protected sets, applicability/source effects, acyclicity and direct-edge partial-mastery effects.',
  'Verify normal focus versus strict prerequisite frontier, while preserving intentional direct assessment access and no inferred prerequisite mastery.',
  'Bind the solution-only image asset and check task/solution rendering on the integrated form.',
  'Run the actual joint full native/scope checks once on the integrated candidate; no unconditional global closure or M7 claim from this report.'
 ],
 'notApprovedOrPerformed':{'roleActivation':False,'stageApproval':False,'newNativeRun':False,
   'globalM7Pass':False,'rootChanges':False,'registeredReviewWrites':False,
   'gitChanges':False,'productChanges':False,'learnerStateWrites':False}
}
write('review-handoff.json',review)
files=[]
for f in sorted(out.iterdir()):
 if f.is_file() and f.name!='review-output-manifest.json':
  files.append({'path':f.name,'bytes':f.stat().st_size,'sha256':sha(f)})
write('review-output-manifest.json',{'schemaVersion':1,'status':'INDEPENDENT_CONTENT_REVIEW_ARTIFACTS',
 'inputManifestSha256':sha(pack/'review-input-manifest.json'),'files':files})
print(json.dumps({'status':review['status'],'files':len(files),'handoffSha256':sha(out/'review-handoff.json'),
 'outputManifestSha256':sha(out/'review-output-manifest.json'),'remainingN2GapScopes':bygap}))
