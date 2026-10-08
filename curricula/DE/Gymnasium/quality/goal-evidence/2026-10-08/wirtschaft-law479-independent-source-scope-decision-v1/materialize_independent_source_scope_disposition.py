# Apache-2.0. Actual independent source disposition and this author's inert scope proposal.
import pathlib,json,hashlib,datetime
directory=pathlib.Path(__file__).resolve().parent;root=directory.parents[6]
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
inputs=read(directory/'actual-twenty-direct-and-HE-ancestor-whole-source-context.input.json')
guards=read(directory/'actual-independent-source-and-view-preparation.guards.json')
native=read(directory/'actual-native-bounded-BY-GK-LK-projection.receipt.json')
combined=read(directory/'actual-native-backend-combined-target-union.receipt.json')
assert native['allGuardedActiveAndAuthorInputBytesPreserved'] and not combined['missing'] and not combined['added']
registry=read(root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
subject=next(s for s in registry['subjects'] if s['landscapePath']=='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
kindpath=root/subject['semanticKindLedgerPath'];kinds=read(kindpath)
atomic=[d['goalId'] for d in kinds['decisions'] if d['decisionStatus']=='authoritative' and d['semanticKind']=='curricularAtomic']
assert len(atomic)==303 and inputs['goalId'] in atomic
other=[]
for row in inputs['directWholeBindings']:
 edge=row['wholeMappingEdge'];s=row['wholeSourceRow']
 if edge['matchType']=='exact':
  decision='ACCEPT_as_BY_elevated_competency_binding_with_corrected_LK_source_metadata'
  reason='The exact whole competency is independently confirmed by current official elevated WR13 1.1. Its duties/type-comparison boundary matches the unchanged canonical goal. The extracted J13.15 label is an ordinal snapshot location, not the current official section numbering.'
 else:
  decision='KEEP_historical_partial_relation_without_new_whole_goal_or_GK_coverage_approval'
  reason=('The whole source requirement concerns purchase formation and payment arrangements, not the full identification/duty contrast across further contract types. Related legal instruction is legitimate; a partial source relation cannot establish the whole higher-course competency.' if '/DE-BW/' in row['mappingPath'] else
   'The whole requirement concerns general legal functions, sources/persons/declarations/classification, consumer protection, legal methods, contract formation or claim enforcement. It can relate to the legal cluster, but does not explicitly require the complete further-contract duty comparison. The old blanket complete-coverage rationale is retained as history, not adopted as this review’s whole-goal finding.')
 other.append({'sourceGoalId':s['id'],'sourceTextActuallyReadWhole':True,
  'wholeCurrentSourceRowAndHistoricalDecisionActuallyRead':True,'oldMatchType':edge['matchType'],
  'decision':decision,'reasonEn':reason,'mappingChangedByThisReview':False})
assert len(other)==20 and sum(x['oldMatchType']=='exact' for x in other)==1
important=['actual-twenty-direct-and-HE-ancestor-whole-source-context.input.json',
 'actual-independent-source-and-view-preparation.guards.json',
 'de-by-gym-economics-gk-479-bounded.inert.view.json','de-by-gym-economics-lk-479-bounded.inert.view.json',
 'actual-native-bounded-BY-GK-LK-projection.receipt.json',
 'actual-backend-combined-merger-execution.receipt.json',
 'actual-native-backend-combined-target-union.receipt.json']
receipt={'schemaVersion':1,'reviewId':'wirtschaft-law479-independent-source-and-bounded-regional-projection-20261008-v1',
 'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'reviewer':'/root/economics_visual_memory_audit','provider':'OpenAI',
 'model':'Codex session; exact serving model identifier not exposed',
 'role':'independent_review_of_other_authors_source_only_candidate_and_author_of_separate_inert_regional_scope_proposal',
 'roleBoundaries':{'sourceCandidateAuthor':'/root/economics_gate_audit',
  'thisReviewerAuthoredSourceCorrection':False,'thisReviewerAuthoredTheseNewViewProposals':True,
  'independentFinalViewApprovalByAnotherReviewerClaimed':False,
  'priorIndependentLawPAMAndSourceFindingRoleDisclosed':True,
  'descriptionRoundOrHumanReleaseApprovalClaimed':False},
 'goalId':inputs['goalId'],'currentWholeGoal':inputs['wholeCurrentGoal'],
 'independentSourceOnlyDisposition':{'decision':'ACCEPT_one_source_course_metadata_successor',
  'requiredSourceCourse':'LK','meaning':'Existing technical SkillPilot elevated-course projection label; no new official Bavarian Leistungsfach name asserted.',
  'actualVerifiedDeltaFields':['courseLevel','tags'],'unchangedOtherWholeSourceRows':183,
  'all35WholePassagesAndOtherExtractionFieldsUnchanged':True,
  'allWholeSourceWordsIdsSpansAndParentsRetained':True,
  'wholeMappingEdgesAndHistoricalDecisionsRetained':True,'onlyMappingSourceExtractionPathUpdated':True,
  'wholeCanonicalGoalUnchanged':True,'sourceMetadataAloneResolvesRegionalTargetFinding':False},
 'actualIndependentPrimaryReading':[
  {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/erhoeht',
   'actualBound':'Entire current WR13 1.1 competency and associated contents, extracted lines56–84; retrieved8 October2026.',
   'independentFinding':'Further contract types and their duties must be identified and contrasted with purchase; examples include work, supply-of-work and service contracts. This explicitly supports the extended competency at elevated level.'},
  {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/wirtschaft-und-recht/grundlegend',
   'actualBound':'Entire current WR13 1.1 competency and associated contents, extracted lines55–118; retrieved8 October2026.',
   'independentFinding':'Performance disturbances, purchase defects, remedies and consumer protection are covered. The separate further-contract/duty comparison is absent; those related purchase competencies cannot prove that extended goal as compulsory basic-course coverage.'}],
 'wholeTwentyExistingDirectBindingsDispositions':other,
 'foreignScopeDisposition':{'directBYBindings':1,'directBWPartialBindings':1,'directTHPartialBindings':18,
  'directHE479BindingFound':False,'wholeExistingHELegacyAncestorMappingRead':True,
  'HELegacyAncestorSourceExtractionEvidenceAvailable':False,
  'HEAdvertisedOriginalOrArchiveSnapshotActuallyReadHere':False,
  'HEEvidenceBoundary':'The persisted legacy ancestor mapping is to the overall Economics root. Its advertised original/archive snapshot paths are absent in this workspace, and no direct479 edge exists in the current persisted HE extraction mappings. It is not replaced by an invented original source read. Conservative HE assessment readiness is a didactic dependency, not a source-coverage claim.',
  'actualExistingTHBWExtractionWholePassagesRead':True,
  'originalTHBWPDFVisualOrWholeProgrammeInspectionClaimedByThisReceipt':False,
  'newCompleteGKCoverageForHEBWTHClaimed':False,'otherCountriesCanonicalTagsOrViewsChanged':False},
 'existingAuthoringAndProjectionContractsActuallyInspected':[
  {'path':'app/src/views/CompositionViewEditorView.tsx','finding':'Existing authoring surface supports explicit goalEntry/canonicalSubtree target or prerequisiteOnly roles and scoped view documents; no invented course-override API is used.'},
  {'path':'contracts/curriculum-package/v1/composition-view.schema.json','finding':'Closed view scope supports schoolForm/jurisdiction/stage/courseProfile/durationModel; explicit roles are target and prerequisiteOnly.'},
  {'path':'contracts/curriculum-package/v1/composition-view-index.schema.json','finding':'Package discovery records explicitly preserve view scope/language/path. New inert views are not installed in any active package index.'},
  {'path':'app/scripts/applicabilityCompiler.ts','finding':'ApplicabilityOverrideValue/collectApplicabilityOverrideValues support jurisdiction only; a courseProfile override would produce APV-001. Excluding BY completely would also remove legitimate elevated-course use and is inappropriate.'},
  {'path':'app/src/utils/authoring/compositionViewAuthoring.ts','finding':'A direct goalEntry role is more specific than a broad inherited canonicalSubtree role. This exact existing mechanism excludes479 without a global semantic/tag cut.'},
  {'path':'app/src/utils/compositionViewRuntime.ts','finding':'Target roles feed the visible tree; prerequisiteOnly references retain stable canonical data for prerequisites and are stripped from visible children. No dependency is inferred from this role.'},
  {'path':'app/src/utils/learnerCompositionScopeMatching.ts','finding':'Committed learner stage must exactly match authored stage; additional jurisdiction specificity selects the paired BY view only for its exact CrossStage scope.'},
  {'path':'backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java','finding':'Repository selection orders compatible scopes by specificity; exact learner-stage matching is required. An authored CrossStage view does not serve a requested SekII scope.'},
  {'path':'backend/src/main/java/com/skillpilot/backend/composition/CourseProfileCompositionViewMerger.java','finding':'The actual existing backend merger was freshly compiled and executed on these whole inert views and the actual current canonical graph, then its output was checked with native TS target projection. It preserves the union of independently resolved GK and LK targets.'},
  {'path':'app/scripts/generateCurriculumQualityStatus.ts#evaluateCourseLevelMappingConsistency','finding':'CQR-004 enforces source-course subset compatibility with canonical course tags. An LK source mapped to GK/LK tags is compatible, so a green CQR-004 cannot by itself establish BY-GK target legitimacy.'}],
 'boundedRegionalViewProposal':{'proposalDecision':'Candidate_for_independent_final_view_review_and_targeted_integration',
  'BYBasicExistingCrossStage':'Direct479 goalEntry prerequisiteOnly overrides inherited target subtree.',
  'BYElevatedExistingCrossStage':'Paired regional LK view preserves existing targets including479.',
  'requiresPrererequisite479InBYBasic':False,
  'currentReverseRequiresBoundary':'Only the existing HE Q3 assessment directly requires479; no BY-specific content or terminal dependency is rewritten or silently mastered.',
  'wholeExistingOtherTargetRolesPreserved':True,'globalCanonicalGoalIdTextTagsRequiresAndApplicabilityPreserved':True,
  'nationalAndOtherJurisdictionViewsWritten':False,
  'actualNativeTargetProof':{'structuralAtomicTargetsBefore':297,'BYGKCandidateStructuralAtomicTargets':296,
   'BYGKRemovedGoalIds':[inputs['goalId']],'BYLKStructuralAtomicTargets':297,
   'BYGKplusLKActualBackendNativeUnion':297,'BYGKplusLK479Role':'target',
   'unintendedAddedOrRemovedTargets':0,'schemaPassed':True,'nativeCompileErrors':0,'nativeCompileWarnings':0},
  'stageLimit':'These candidates deliberately preserve the existing CrossStage profile. They are NOT a reviewed exact SekII offering and native exact-stage scoring rejects a SekII request. A separately authored/reviewed SekII view needs its own exact stage target/source/route decision; no runtime fallback or broad curriculum approval is proposed.'},
 'currentCentralScope':{'actualRegisteredSemanticKindPath':subject['semanticKindLedgerPath'],
  'actualRegisteredSemanticKindSha256':sha(kindpath),'currentCurricularAtomicIds':len(atomic),
  '479StillCurricularAtomic':True,'subjectDenominatorReduced':False,
  'newStrictCompletions':0,'goal479StillOpenUntilItsOwnCurrentPAMVDAndSourceBindingsClose':True},
 'exactEvidenceFiles':[{'path':str((directory/f).relative_to(root)),'sha256':sha(directory/f)} for f in important],
 'pendingFinalIntegration':['Independent counterpart review of the authored paired regional view proposals and actual source-only disposition.',
  'Install only an explicitly accepted exact scope, then run actual native selection/route/frontier/deck-visibility and source-target checks; keep exact stage boundaries.',
  'Check whole current affected page/model/source/binding parity, preserving unchanged goal evidence rather than restarting historical reviews or only adjusting hashes.',
  'Close479 itself through actual current bilingual/P/A/M/V/dual-D evidence; its regional basic exclusion does not remove it from the central303 ordinary-goal denominator.'],
 'activeRegistryCanonicalCompositionViewOrRuntimeWrites':0,'humanReleaseOrTrialClaimed':False}
output=directory/'independent-one-source-and-bounded-BY-course-projection-disposition.actual.receipt.json'
with output.open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(f'Independent source-only ACCEPT1; authored paired BY CrossStage candidates with native exact-one exclusion and actual combined-union proof. Central303 unchanged, strict gain0. {sha(output)}')
