import copy
import datetime
import hashlib
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
AUTHOR = BASE / 'chemie-current442-retained-target42-explicit-own-acquisition-scope-author-20261017-v1'
OWN = BASE / 'chemie-current442-retained-target42-own-acquisition-scope-independent-b-20261017-v1'
FIRST = OWN / 'FIRST.independent-retained42-own-acquisition-scope.json'
assert not FIRST.exists(), 'An existing FIRST must never be rewritten'

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    p = Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def objsha(v):
    return hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def write(p, v):
    Path(p).write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

author = read(AUTHOR / 'AUTHOR.retained42-explicit-own-acquisition-scope.json')
roster_pin = pin(author['wholeScopeRows']['path'])
assert roster_pin == author['wholeScopeRows']
roster = read(roster_pin['path'])
rows = roster['rows']
notes = read(OWN / 'WORKING.own-reading-notes.json')
assert notes['profileBodiesSemanticallyReadRowIndices'] == list(range(42))
check_pin = pin(OWN / 'CHECK.actual-whole42-profile-identities-112-tuples-and-metadata-only-diff.json')
roles_pin = pin(OWN / 'CHECK.stock-roles-and-exact-registry112.json')
check = read(check_pin['path'])
roles = read(roles_pin['path'])
assert roles['counts']['goalJurisdictionDecisions'] == 112
assert roles['counts']['actualStageCourseTargetOccurrences'] == 201

# Recheck actual file pins immediately before FIRST. No current peer result is an input.
for q in author['inputs'] + author['unchangedViewInputs'] + [author['canonicalCandidate'], author['registryCandidate']]:
    assert pin(q['path']) == {k: q[k] for k in ('path', 'sha256', 'bytes')}, q['path']

existing_locator = read(author['inputs'][3]['path'])['inputs']
old_input_path = BASE / 'chemie-current439-source-requires-working-checkpoint-20261017-v1/evidence/two-BW-data-teachers-and-coordinate-model-priors-author-root-v1/REVIEW-INPUT.clean-two-BW-data-targets-and-coordinate-prior-replacement.json.snapshot'
old = read(old_input_path)
old_profiles = {r['goalId']: r['wholeProfile'] for r in old['wholeUnchangedPositiveProfiles']}
bw_evidence = []
for i in (19, 25):
    r = rows[i]
    cur = r['wholeCurrentNativePositiveEvidence']['profile']
    prev = old_profiles[r['goalId']]
    if i == 25:
        assert cur == prev
        comparison = {'wholeCurrentProfileExactlyEarlierPairedProfile': True}
        rationale = 'Current documentation profile is wholly identical to the profile of the earlier paired BW acquisition. Its complete R1/R2 and D2 documentation, raw-data and revision performances remain suitable in BW CrossStage LK. No new measurement or EDTA/source credit follows.'
    else:
        retained = ('expectations', 'variationAxes', 'applicationCaseBriefs')
        for k in retained:
            assert cur[k][:len(prev[k])] == prev[k]
            assert len(cur[k]) == len(prev[k]) + 1
        assert cur['archetype'] == prev['archetype']
        before_coverage = prev['coverageExpectations']
        after_coverage = copy.deepcopy(cur['coverageExpectations'])
        assert after_coverage['requiredExpectationIds'][:-1] == before_coverage['requiredExpectationIds']
        after_coverage['requiredExpectationIds'] = after_coverage['requiredExpectationIds'][:-1]
        assert after_coverage == before_coverage
        assert set(prev) == set(cur)
        added = cur['expectations'][-1]
        assert 'außerhalb dieses Scopes keine zusätzliche Abschlussbedingung' in added['essentialUnderstandingDe']
        assert 'no additional completion condition outside this scope' in added['essentialUnderstandingEn']
        comparison = {
            'earlierThreeWholeExpectationsExactlyRetained': True,
            'earlierTwoWholeCasesExactlyRetained': True,
            'earlierTwoWholeVariationAxesExactlyRetained': True,
            'earlierCoverageExactlyRetainedApartFromAddedConditionalHBExpectation': True,
            'addedExpectationPointer': '/expectations/3',
            'addedCasePointer': '/applicationCaseBriefs/2',
            'newHBOnlyScopeTextBilingual': {k: added[k] for k in ('essentialUnderstandingDe', 'essentialUnderstandingEn')},
        }
        rationale = 'The Lower14 successor retains every earlier BW base expectation, both whole cases and their variations unchanged. The appended diagram-reading/creation contribution is expressly HB-only in both languages and creates no additional BW completion condition. BW LK still requires the full independent representation, repeat-aware inference and confound transfer, without claiming a personally measured series.'
    refs = []
    for name, pointer in [('twoBW_A', f'/cases/{1 if i == 19 else 0}'), ('twoBW_B', f'/BWDataAcquisitionFindings/{1 if i == 19 else 0}'), ('twoBW_pairedReceipt', ''), ('currentLower14_pairedReceipt', '')]:
        q = existing_locator[name]
        assert pin(q['path']) == {k: q[k] for k in ('path', 'sha256', 'bytes')}
        refs.append({**q, 'jsonPointer': pointer})
    bw_evidence.append({
        'rowIndex': i, 'goalId': r['goalId'], 'jurisdiction': 'DE-BW',
        'scope': {'stage': 'CrossStage', 'courseProfile': 'LK'},
        'decision': 'ACCEPT_CURRENT_WHOLE_P_SCOPE_COMPATIBILITY',
        'oldInput': pin(old_input_path),
        'oldProfilePointer': f"/wholeUnchangedPositiveProfiles/{next(j for j, q in enumerate(old['wholeUnchangedPositiveProfiles']) if q['goalId'] == r['goalId'])}/wholeProfile",
        'oldWholeProfileSHA256': objsha(prev), 'currentWholeProfileSHA256': objsha(cur),
        'actualFieldComparison': comparison, 'rationale': rationale,
        'historicalScopeEvidence': refs,
        'actualAdditionalReadMaterialPointers': [f'/wholeExistingDocumentationAndInterpretationDEENMaterials/{j}' for j in (range(2, 4) if i == 19 else range(2))],
    })
bw_pin_path = OWN / 'EVIDENCE.two-BW-current-whole-P-scope-compatibility.json'
write(bw_pin_path, {'artifactType': 'Own bounded current successor compatibility findings; no new whole-P redesign or official coverage review', 'createdAtUTC': now(), 'rows': bw_evidence})

read_rows = []
decisions = []
goal_findings = []
for i, r in enumerate(rows):
    p = r['wholeCurrentNativePositiveEvidence']['profile']
    q = check['whole42ObjectPins'][i]
    assert q['beforeWholeGoalObjectSHA256'] == objsha(r['wholeGoalBefore'])
    assert q['afterWholeGoalObjectSHA256'] == objsha(r['wholeGoalAfter'])
    assert q['wholeProfileObjectSHA256'] == objsha(p)
    parent_ref = {**roster_pin, 'jsonPointer': f'/rows/{i}'}
    profile_ref = {**roster_pin, 'jsonPointer': f'/rows/{i}/wholeCurrentNativePositiveEvidence/profile', 'wholeObjectSHA256': objsha(p)}
    before_ref = {**roster_pin, 'jsonPointer': f'/rows/{i}/wholeGoalBefore', 'wholeObjectSHA256': objsha(r['wholeGoalBefore'])}
    after_ref = {**roster_pin, 'jsonPointer': f'/rows/{i}/wholeGoalAfter', 'wholeObjectSHA256': objsha(r['wholeGoalAfter'])}
    profile_anchors = {
        'allExpectationIds': [e['id'] for e in p['expectations']],
        'allCaseIds': [c['id'] for c in p['applicationCaseBriefs']],
        'allVariationAxisIds': [v['id'] for v in p.get('variationAxes', [])],
        'coveragePointer': profile_ref['jsonPointer'] + '/coverageExpectations',
        'wholeExpectationAndCaseFieldsReadInBothLanguages': True,
    }
    rationale = notes['notes'][str(i)]
    goal_findings.append({
        'rowIndex': i, 'goalId': r['goalId'], 'title': r['wholeGoalBefore']['title'],
        'scopeSuitabilityDecision': 'ACCEPT',
        'wholeGoalBefore': before_ref, 'wholeGoalAfter': after_ref,
        'wholeUnchangedCurrentProfile': profile_ref,
        'nativeRecord': {**roster_pin, 'jsonPointer': f'/rows/{i}/wholeCurrentNativePositiveEvidence', 'wholeObjectSHA256': q['completeNativeRecordObjectSHA256']},
        'operativeProfileAnchors': profile_anchors,
        'independentContentAndBoundaryRationale': rationale,
        'countercaseRule': 'The limits and counterexamples stated in this rationale and the whole profile remain required; a provided answer/data series is never treated as actual learner execution.',
    })
    read_rows.append({
        'rowIndex': i, 'goalId': r['goalId'], 'input': parent_ref,
        'beforeWholeGoalObjectSHA256': q['beforeWholeGoalObjectSHA256'],
        'afterWholeGoalObjectSHA256': q['afterWholeGoalObjectSHA256'],
        'wholeProfileObjectSHA256': q['wholeProfileObjectSHA256'],
        'actualSemanticReading': ['entire goal title/description DE/EN, tags, requirements, scope-relevant nontransport extendedData and boundaries', 'every whole profile expectation DE/EN', 'entire coverage contract', 'every whole variation axis DE/EN', 'every whole application case brief, task, expected performance and understanding focus DE/EN'],
        'actualMechanicalReading': 'Parsed whole before/after goals, entire native record and whole profile; compared exact fields and hashes. Whole profiles and substantive fields were displayed/read, not inferred from hashes.',
        'filteredRepetitiveTransportFields': 'Historical provenance/image-provider URLs and native validation wrapper were not reprinted as science reading; whole objects remain exactly bound above.',
        'profileFieldCounts': {k: len(p.get(k, [])) for k in ('expectations', 'variationAxes', 'applicationCaseBriefs')},
        'scopeDecisionCount': len(r['jurisdictionDecisions']),
    })
    for j, d in enumerate(r['jurisdictionDecisions']):
        e = d['proposedExtension']
        matching_roles = [x for x in roles['rows'] if x['rowIndex'] == i and x['decisionIndex'] == j]
        assert len(matching_roles) == len(d['exactExistingViewBindings'])
        scope_facets = []
        for v, rr in zip(d['exactExistingViewBindings'], matching_roles):
            assert (v['viewId'], v['stage'], v['courseProfile']) == (rr['viewId'], rr['stage'], rr['courseProfile'])
            scope_facets.append({
                'viewId': v['viewId'], 'viewPath': v['viewPath'], 'wholeViewSHA256': rr['sha256'],
                'stage': v['stage'], 'courseProfile': v['courseProfile'], 'durationModel': v['durationModel'],
                'authoredReferenceLocators': v['references'],
                'currentAndCandidateStockRole': 'target',
                'scopeSuitabilityVerdict': 'ACCEPT',
            })
        decisions.append({
            'tupleIndex': len(decisions), 'rowIndex': i, 'jurisdictionDecisionIndex': j,
            'goalId': r['goalId'], 'jurisdiction': e['jurisdiction'],
            'verdict': 'ACCEPT_EXACT_OWN_ACQUISITION_SCOPE',
            'decisionCategory': 'EXISTING_BW_SCOPE_CURRENT_P_COMPATIBILITY_CONFIRMED' if i in (19,25) and e['jurisdiction'] == 'DE-BW' else 'NEW_EXPLICIT_OWN_ACQUISITION_SCOPE_DECISION',
            'proposal': {**roster_pin, 'jsonPointer': f'/rows/{i}/jurisdictionDecisions/{j}/proposedExtension', 'wholeObjectSHA256': objsha(e)},
            'wholeGoalBefore': before_ref, 'wholeGoalAfter': after_ref,
            'wholeCurrentProfile': profile_ref,
            'wholeCurrentNativeProfileReference': e['wholeCurrentPositiveProfile'],
            'exactAcceptedExistingStageCourseFacets': scope_facets,
            'independentRationale': rationale,
            'wholeDutiesUnrelaxed': True,
            'roleAndStageNotInferredFromPhaseRequiresOrViewMembership': True,
            'officialWholeSourceCredit': False, 'officialRequirementClaim': False,
            'actualLearnerTopicSelectionClaim': False, 'actualLearnerPerformanceClaim': False,
            'localPracticalReleaseRemainsRequiredWhereOperative': True,
        })
assert len(decisions) == 112
assert sum(len(x['exactAcceptedExistingStageCourseFacets']) for x in decisions) == 201
assert len({(x['goalId'],x['jurisdiction']) for x in decisions}) == 112
read_evidence_path = OWN / 'EVIDENCE.actual-whole42-reading-and-112-bindings.json'
write(read_evidence_path, {
    'artifactType': 'Actual bounded semantic reading and exact whole-object identities',
    'createdAtUTC': now(), 'rows': read_rows,
    'externalFullMaterialsReadInThisReview': 'Four complete existing documentation/interpretation DE/EN material cases in the historical two-BW author input, as pinned in the separate compatibility evidence. Other external full material containers were not newly rereviewed; their whole operative profile duties and boundaries were read and retained.',
    'officialPDFsReReviewed': False,
    'readingDoesNotCreateWholePDesignOrDSourceMVisualizationApproval': True,
})

first = {
    'artifactType': 'Independent informed FIRST B: exact retained42/112 own acquisition scope proposal',
    'createdAtUTC': now(),
    'reviewer': '/root/chemie_hb92_142_whole_union_independent_b_20261017',
    'decision': 'ACCEPT_EXACT_112_OWN_ACQUISITION_SCOPE_DECISIONS',
    'counts': {'wholeCurrentCompetencesRead':42, 'goalJurisdictionDecisions':112,
        'newExplicitOwnScopeDecisions':110, 'earlierBWScopesWithActualCurrentProfileCompatibilityConfirmed':2,
        'unchangedInvolvedViewObjects':32, 'listedStageCourseTargetOccurrencesActuallyChecked':201,
        'ACCEPT':112, 'HOLD':0, 'normalWrites':0, 'newWholePDesignReviews':0},
    'reviewQuestion': 'Whether the complete unchanged current competences and P requirements are didactically suitable as explicitly owned acquisition content in precisely the listed pre-existing jurisdiction/stage/course placements.',
    'independenceAndRoles': {
        'informedFollowupNotBlindHistoricalReview': True,
        'earlierOwnRoles': ['HB whole-view selection/integration candidate author', 'whole41 technical selector assembler', 'M/source and Lower14 scientific reviewer in bounded earlier tasks', 'P442 writer-input/provenance and namespace planner', 'D65 existing-science transport matrix assembler'],
        'currentScopeProposalAuthor': 'Root; not this reviewer',
        'currentGoalAndProfileAuthors': 'Other authors; unchanged in this proposal',
        'currentPeerScope42ResultsOrWIPReadBeforeOwnSeal': False,
        'historicEvidenceRead': 'Only the explicitly pinned historical two-BW scope pair/author material inputs and existing Lower14 transport context for bounded successor comparison; their older judgments do not substitute for the current 42 full content readings.',
        'noApprovalOfOwnOldStructuralViewWork': 'Existing view paths and stock roles are factual placement checks. The current independent decision concerns Root-authored explicit own-acquisition scope for current whole content, not a renewed structural-view approval.',
    },
    'inputs': [pin(AUTHOR / 'AUTHOR.retained42-explicit-own-acquisition-scope.json'), roster_pin,
        pin(AUTHOR / 'SEAL.author-current-inputs-and-proposals.json'), author['canonicalCandidate'], author['registryCandidate']] + author['inputs'],
    'unchangedViewInputPins': author['unchangedViewInputs'],
    'objectDigestConvention': 'SHA256 UTF-8 JSON, sorted keys, ensure_ascii=false, compact comma/colon separators; file hashes are exact bytes.',
    'actualReadEvidence': pin(read_evidence_path),
    'boundedBWSuccessorEvidence': pin(bw_pin_path),
    'actualMechanicalChecks': [check_pin, roles_pin],
    'commonScientificScopeRationale': [
        'Foundation skills remain legitimate own learning targets for initial learning or reconstruction within CrossStage views; CrossStage does not assert that an advanced content or practical route suits every lower-secondary age.',
        'Upper organic, analytical, modelling and quantitative competences are suitable in the explicitly named upper components of CrossStage or explicit SekII views. The more advanced listed dye, buffer, mechanistic and titration routines remain in their named LK placements. Given formulas/model inputs bound the mathematical and structural demands.',
        'For each tuple, suitability follows from the actual unchanged content and full P demands read here, together with the explicit author choice of own acquisition. View membership and a requires edge alone supply neither scientific justification nor an official requirement.',
        'Supervised actual preparation, own measured raw data, independent plans/representations, fresh transfer, uncertainty checks and local safety/equipment/waste releases remain binding wherever the whole current route requires them. No release or execution has occurred by reviewing this scope.',
        'Source-specific conditional additions stay source-specific in their explicit DE/EN terms. An own jurisdiction extension neither strips the base routine nor imports an expressly HB-only extra completion condition into another state.',
        'The owner policy includes already authored topics before a later selector. This is a platform acquisition choice and does not make an optional official theme universally compulsory or establish a particular learner topic choice.',
    ],
    'technicalDeltaBoundaries': {
        'canonicalOnly42SkillPilotAcquisitionExtensionMetadataAppends': True,
        'other612WholeGoalsExact': True,
        'allWholeProfilesDescriptionsRequiresImagesTagsResourcesSourceAndMappingsUnchanged': True,
        'candidateRegistryExactlyChem42Goal112JurisdictionEntries': True,
        'existingEconomicsFiveOverrideWholeObjectExact': True,
        'noOtherHistoricalRawJurisdictionValuesRestored': True,
        'noNewStageCourseRuntimeFilter': True,
        '201Explanation': 'This is the actual sum of the listed exactExistingViewBindings across112 decisions, independently checked with the stock role collector. The author reason also cites an earlier192 lost-target measurement; that is a different measurement and is not reported here as the count of listed placements.',
        'applicabilityCompileOrApplyPerformedByThisReview': False,
    },
    'wholeGoalScopeFindings': goal_findings,
    'tupleDecisions': decisions,
    'remainingBoundaries': {
        'ordinaryWholePDesignDSourceMemoryVisualizationReviews': 'No new verdicts; existing evidence and unchanged full duties remain separately bound.',
        'officialWholeSourceCredit': False, 'universalOfficialDuty': False,
        'actualLearnerTopicSelectionOrPerformance': False,
        'automaticMasteryOrProgressFromSupport': False,
        'normalApplicationAndCurrentFingerprints': 'Not performed by this review; Root may separately integrate the exact paired scope proposal and measure current normal applicability/native contexts.',
        'HumanApproval':False, 'HumanTrial':False, 'M7Claim':False,
    },
}
write(FIRST, first)
readme = OWN / 'README.md'
readme.write_text('''# Independent informed Scope42 review B

ACCEPT for the exact 112 goal/jurisdiction own-acquisition decisions, including every listed stage/course facet. All 42 whole current profiles and substantive current goal/scope boundaries were read. The stock helper checked 201 listed target placements in 32 unchanged views; the registry preserves Economics5 exactly and adds only Chemistry42/112.

This reviewer previously authored view integration candidates and P442 integration routing and conducted bounded M/source reviews. Root authored the current explicit scope proposal. No current peer Scope42 results or work in progress were read before this FIRST seal.

The two old BW scopes were compared against current whole P bodies: documentation is exactly unchanged; data interpretation retains the entire old routine plus an explicitly HB-only addition. See the separate compatibility record.

Reading is documented precisely: all profile DE/EN expectations, coverage, variations and whole case briefs; substantive goal/scope fields; full-object mechanical equality. Four full old BW material cases were additionally read. Other external material containers and official PDFs were not newly rereviewed. This is a bounded scope decision, not a new WholeP/D/source review.

No normal application, fingerprint promotion, learner performance, official whole-source credit, Human Approval, Human Trial or M7 completion is asserted. All existing practical, independent-data, fresh-transfer and local-release duties remain whole.
''')
seal_inputs = [FIRST, read_evidence_path, bw_pin_path, readme,
    OWN / 'CHECK.actual-whole42-profile-identities-112-tuples-and-metadata-only-diff.json',
    OWN / 'CHECK.stock-roles-and-exact-registry112.json',
    OWN / 'WORKING.own-reading-notes.json', OWN / 'read_selected_rows.py',
    OWN / 'check_actual_roles.ts', OWN / 'write_first_and_seal.py']
seal = {'artifactType':'FIRST B seal; created after own findings, before peer access', 'sealedAtUTC':now(),
    'reviewer':first['reviewer'], 'currentPeerScope42ResultsReadBeforeSeal':False,
    'authorProposal':first['inputs'][0], 'files':[pin(p) for p in seal_inputs],
    'normalFilesChanged':False, 'HumanApproval':False, 'HumanTrial':False, 'M7Claim':False}
write(OWN / 'SEAL.independent-FIRST.json', seal)
print(json.dumps({'FIRST':pin(FIRST), 'SEAL':pin(OWN / 'SEAL.independent-FIRST.json'), 'counts':first['counts']}, ensure_ascii=False))
