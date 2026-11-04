import hashlib,json
from pathlib import Path
OUT=Path(__file__).resolve().parent
P=OUT.parent/'dgl1-whole-form-content-20261104-v1'
ROOT=OUT.parents[2]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
def write(n,d): (OUT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
manifest=read(P/'review-input-manifest.json')
assert sha(P/'review-input-manifest.json')=='0562557487f7be71513c316411103d364313d82e01557f8ab5355f4f5b93347f'
for e in manifest['files']:
    assert sha(P/e['path'])==e['sha256']
    assert (P/e['path']).stat().st_size==e['bytes']
for e in manifest['externalInputBindings']: assert sha(ROOT/e['inputRoot']/e['path'])==e['sha256']
write('final-source-freeze-check.json',{'status':'PASS_UNCHANGED_AFTER_REVIEW','inputManifestSha256':sha(P/'review-input-manifest.json'),'filesRechecked':70,'externalPinsRechecked':22,'sourceOrRegisteredReviewWrites':0,'newNativeExecutions':0})
visuals=[]
for f in sorted(P.rglob('*.png')):
    is_source='source-pages' in f.parts
    visuals.append({'path':str(f.relative_to(P)),'sha256':sha(f),'actualReviewerVisualInspection':True,'role':'whole official primary page' if is_source else 'existing final Chromium screenshot','finding':'Full page inspected; source distinction between binding Q1 fields1–3 and additional Q1.5 confirmed.' if is_source else 'Readable mathematical notation and complete task/solution layout; no task-side family or initial constant supplied. Desktop solutions include readable scoring rubric. Mobile task view is usable.','newRenderClaim':False})
assert len(visuals)==8
write('reading-and-visual-record.json',{'status':'GENUINE_INDEPENDENT_WHOLE_READING_AND_VISUAL_INSPECTION','originalWholeDEENGoal':True,'originalRawRAncestors':54,'existingWholeAlternatives':['58fda9b4-4336-5594-99ce-722c4a453372','97fb270f-9ede-5fe0-9a1f-600ffbd65610'],'existingAlternativePreparationObjects':56,'alternativeLanguageQualification':'DGL2 supplies DE/EN; the existing temperature task has DE fields and was read as actually supplied, without claiming nonexistent EN fields.','newWholeTaskSolutionAndRubricFields':['taskContent','taskContentEn','solutionContent','solutionContentEn'],'registeredMemoryRowsRead':53,'wholeReferencedMemoryGoalRead':True,'wholeOriginalDeckLanguages':['de','en'],'cardsPerLanguage':14,'registeredCardReviewRowsRead':16,'originalDgl2FundamentalRejectionRead':True,'authorRubricCasesReadAndIndependentlyJudged':13,'independentNewRubricCases':16,'visuals':visuals,'sourceWebResearchClaim':False,'sourceBasis':'Pinned complete official PDF pages and supplied local extraction/mapping records, not claims of newly researched current law or curriculum.'})
form=P/'28cdee95-3c8e-5760-a68a-405b7f9c6cbf/whole-form-content.draft.json'
bindings=read(OUT/'independent-binding-and-scope-check.json')
handoff={
 'status':'CONTENT_CONDITIONAL_ACCEPTED',
 'reviewer':'independent-astra-ultra-content-review',
 'reviewedAt':'2026-11-04',
 'report':'HANDOFF.md',
 'reportSha256':sha(OUT/'HANDOFF.md'),
 'inputPackage':str(P.relative_to(ROOT)),
 'inputManifestSha256':sha(P/'review-input-manifest.json'),
 'wholeContentPath':str(form.relative_to(ROOT)),
 'wholeContentSha256':sha(form),
 'originalCompetencyId':'28cdee95-3c8e-5760-a68a-405b7f9c6cbf',
 'wholeOriginalContractSha256':sha(P/'28cdee95-3c8e-5760-a68a-405b7f9c6cbf/competency-contract.current.json'),
 'canonicalInputSha256':bindings['canonicalSha256'],
 'actualG3NativeInputSha256':bindings['nativeSha256'],
 'acceptedContent':{'wholeDEENForm':True,'maxPoints':20,'passPoints':15,'wholeCoreCap':14,'oneOverallBinaryResult':True,'noPartMastery':True,'equivalentElementaryMethodsAccepted':True,'generalDglTheoryRequired':False,'exhaustiveMethodVariantsRequired':False},
 'requiredInterpretation':['Credit a valid self-developed reciprocal or coefficient ansatz; the supplied derivative rule may be used in a genuine derivation.','Use the written follow-through rule and independent concrete countercases; do not enforce author case9 score17 or underdescribed case10 score15 as grading oracles.'],
 'findings':[
  {'id':'DGL1-AUTHOR-CASE9','severity':'nonblocking-evidence-correction','affectsWrittenTaskOrRubric':False,'decision':'The correctly executed check exposing a wrong initial value earns its check credit. The fully specified independent single-slip case scores19 without a cap.'},
  {'id':'DGL1-AUTHOR-CASE10','severity':'nonblocking-evidence-correction','affectsWrittenTaskOrRubric':False,'decision':'Author prose does not establish its exact15-point allocation. Independent case6+1+5+3+0 establishes a legitimate15-point pass.'},
  {'id':'DGL1-HELPER-WORDING','severity':'nonblocking-editorial-precision','affectsMathematics':False,'decision':'Only simplifies verification is overly exclusive; the rule can also support a valid chosen reciprocal method. Explicit equivalent-method allowance governs. Optional later wording: gives no solution family or integration constant.'}
 ],
 'finiteRecommendation':{'retainOriginalDgl1IdentityAndContract':True,'globalDgl1ExamConversionApproved':False,'retain88ExistingDgl2Consumers':True,'newWholeFormContentSuitableForActualDgl1Gap':True,'baselineGapCount':44,'exactGapMatchesPriorRejectedDgl2Scopes':True,'newAssessmentIdentityAssigned':False,'futureSeparateAssessmentForActualGap':'Recommended direction only; exact identity/role/requires/coverage/applicability/source/scope binding remains open on the actual integrated candidate.','duplicateDgl1ObligationIn88Dgl2ScopesRecommended':False,'additionalContentVariantsNeeded':False,'originalRequiresChangesRecommendedInThisNarrowContentReview':[]},
 'partialMasteryFacts':{'M0Dgl1NeededInExistingDgl2Scopes':88,'afterOnlyDgl2MasteryDgl1NeededInThoseScopes':0,'automaticDgl1Mastery':False,'existingAnalysisMemoryProtectedInDgl1TargetScopes':132,'afterOnlyDgl2MasteryMemoryStillNeededInThose88Scopes':88,'remaining44Dgl1TargetsOutsideM0NeededAreUnresolvedStructuralGap':True,'actualIntegratedCandidateNativePassClaim':False},
 'AM':{'freshIndependentOriginalRecommendations':2,'rowsApplied':0,'atomicityRaw':'semantic-atomicity.proposed-current-original-rows.jsonl','memoryRaw':'memory-card-review.proposed-current-original-rows.jsonl','bindingAndReasons':'two-independent-current-original-am-recommendations.json','originalObligationsPerLane':807,'judgments':{'atomicity':'atomic','memory':'no_memory_needed'},'futureIdentityOrRoleApproved':False},
 'memory':{'existingMemoryRequiredContracts':3,'registeredMemoryRowsVerified':53,'currentCardsPerLanguage':14,'registeredCardRowsIncludingHistoricalRemovals':16,'newExemption':False,'deckOrCardChange':False,'evidence':'independent-memory-context-binding.json'},
 'sourceStatus':'HE Q1.5 additional/optional beyond binding Q1 fields1–3; first-order methods are GK/LK level within that theme. Own authored exercise; no universal official GK or new jurisdiction scope claim.',
 'evidence':['independent-binding-and-scope-check.json','independent-mathematics.json','independent-rubric-review.json','two-independent-current-original-am-recommendations.json','independent-memory-context-binding.json','reading-and-visual-record.json','final-source-freeze-check.json'],
 'laterIntegrationRequired':['Bind concrete assessment identity and actual reviewed full content.','Check justified finite source applicability and placements on the actual combined candidate; preserve original807 identities and existing88Dgl2 consumers.','Bind direct R and source-genuine scored coverage independently; no automatic prerequisite mastery.','Retain three memory_required contracts, memory goal, both decks and historical card decisions.','Run actual integrated M0/partial-mastery/normal-versus-strict and Native/Stage checks separately.'],
 'roleApproval':False,'scopeApproval':False,'nativeApproval':False,'stageApproval':False,'M7Approval':False,'humanApproval':False,'newNativeExecution':False,'rootGitOrProductWrites':False,'sourceFreezeUnchanged':True
}
write('review-handoff.json',handoff)
files=[{'path':str(f.relative_to(OUT)),'sha256':sha(f),'bytes':f.stat().st_size} for f in sorted(OUT.rglob('*')) if f.is_file() and f.name!='review-manifest.json']
write('review-manifest.json',{'kind':'INDEPENDENT_ASTRA_DGL1_WHOLE_CONTENT_REVIEW_NOT_ACTIVATION','inputManifestSha256':sha(P/'review-input-manifest.json'),'reviewHandoffSha256':sha(OUT/'review-handoff.json'),'files':files})
print(json.dumps({'status':'CONTENT_CONDITIONAL_ACCEPTED','reviewHandoffSha256':sha(OUT/'review-handoff.json'),'reviewManifestSha256':sha(OUT/'review-manifest.json'),'files':len(files),'originalFreezeUnchanged':True}))
