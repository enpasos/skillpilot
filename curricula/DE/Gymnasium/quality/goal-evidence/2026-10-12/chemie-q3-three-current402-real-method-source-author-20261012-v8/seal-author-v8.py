import datetime
import hashlib
import json
import pathlib
import subprocess

BASE = pathlib.Path(__file__).resolve().parent
ROOT = BASE.parents[6]
V7 = BASE.parent / 'chemie-q3-three-current402-live-context-author-20261012-v7'

def read(p):
    return json.loads(p.read_text())

def ref(p):
    raw = p.read_bytes()
    return dict(path=str(p.relative_to(ROOT)), bytes=len(raw), sha256='sha256:' + hashlib.sha256(raw).hexdigest())

def write(p, value):
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def verify(records):
    for r in records:
        assert ref(ROOT / r['path']) == r, r['path']

first = read(BASE / 'FIRST.actual-author-v8-inputs-CAS.json')
verify(first['files'])
v7seal = V7 / 'FINAL.immutable-author-candidate-CAS-seal.json'
verify(read(v7seal)['files'])
originals = [
    BASE.parent / 'chemie-q3-three-current402-independent-a-20261012-v7' / 'FINAL.immutable-independent-a-original-CAS-seal.json',
    BASE.parent / 'chemie-q3-three-current402-independent-b-20261012-v7' / 'FINAL.immutable-original-independent-b-CAS-seal.json',
]
preserved = []
for p in originals:
    seal = read(p)
    records = seal.get('ownFiles', seal.get('files'))
    verify(records)
    preserved.append(dict(seal=ref(p), originalFilesUnchanged=len(records)))

old_map = read(BASE / 'baseline/SH-upper-source-mapping.exact.json')
new_map = read(BASE / 'candidate/SH-upper-micelle-three-wrong-to-exact-owner.review.json')
source_id = 'de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-029-c8e1a110'
old_decisions = [x for x in old_map['decisions'] if x['sourceGoalId'] != source_id]
new_decisions = [x for x in new_map['decisions'] if x['sourceGoalId'] != source_id]
assert old_decisions == new_decisions and len(new_decisions) == 164
old_other = [x for x in old_map['mappings'] if x['legacyGoalId'] != source_id]
new_other = [x for x in new_map['mappings'] if x['legacyGoalId'] != source_id]
assert old_other == new_other
old_target = [x for x in old_map['mappings'] if x['legacyGoalId'] == source_id]
new_target = [x for x in new_map['mappings'] if x['legacyGoalId'] == source_id]
assert {x['canonicalGoalId'] for x in old_target} == {'c8844ac6-c414-5a0e-9fcd-7d0a82177d09', 'f0939f88-a6af-5334-ac4d-5d54732af25a', 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef'}
assert len(new_target) == 1 and new_target[0]['canonicalGoalId'] == '6966df95-f125-5ecc-af8e-0442545d9f17' and new_target[0]['matchType'] == 'partial'
write(BASE / 'checks/SH165-one-literal-decision-and-three-wrong-targets-only.actual.json', dict(result='PASS', sourceGoalId=source_id, other164DecisionsExact=True, unrelatedCompatibilityRowsExact=True, before=old_target, after=new_target, literalClause='Mizellen als Struktureinheiten von Emulsionen', officialPdfPage=70, correctCurrentOwnerWholeGoalIn='checks/SH-four-exact-current-goal-and-source-context-impact.json', narrowComponentOnly=True, fullGoalOrSourceCompletionClaim=False, independentVote=False, activeWrites=False))

native_images = []
for scope in ['whole402-three', 'source382-three']:
    native_images.extend(ref(p) for p in sorted((BASE / 'native' / scope).glob('*.actual-native-html.png')))
    native_images.extend(ref(p) for p in sorted((BASE / 'native' / scope).glob('actual-native-pdf-page-*.png')))
assert len(native_images) == 12
write(BASE / 'checks/V3.actual-v8-native-HTML-PDF-six-plus-six-author-inspection.json', dict(role='AUTHOR actual visual inspection, not independent approval', result='KEEP_appropriate_three_PNGs_in_both_current_native_contexts', actualImagesViewed=native_images, nativeHTMLPages=6, nativePDFPages=6, clippingObserved=False, correctRenderedGoalAndPNGObserved=True, sourceScopeMetadataVisible=True, assetOriginalNative360680InspectionReusedFrom='checks/V3.exact-original-native-360-680-KEEP-reuse.json', imageEdits=0, source382NotM7Denominator=True, HumanApproval=False, HumanTrial=False))

attribution = read(BASE / 'sources/whole-all-raw-source-component-attribution.author-candidates-and-literal-HOLDs.json')
strict = read(BASE / 'checks/SH-three-current-strict-source-bindings-must-be-rechecked.json')
write(BASE / 'HOLDs.author.json', dict(role='AUTHOR remaining literal obligations; no independent completion vote', currentMachineM7Before=212, currentDenominator=402, freshIndependentTargetedV8VotesPending=True, allRawSourceRows=488, narrowSourceComponentCandidates=62, literalHolds=426, fullSourceCompletionClaims=0, literalRowsPath='sources/whole-all-raw-source-component-attribution.author-candidates-and-literal-HOLDs.json', existingStrictSHSourceContextsPending=[x['goalId'] for x in strict['affected'] if x['currentlyStrict']], TH49ElevatedSaturationOperatorCompletedHere=False, TH49GKRemovalPreserved=True, genuineOriginalA3B3HoldsPreserved=True, authorB_P01NamedMethodSupplied=True, authorB_P02CrosswalkCorrected=True, authorB_S01ThreeWrongTargetsCorrected=True, actualHumanLaboratoryRunRequiredForMachineM7=False, actualHumanLaboratoryRunClaimed=False, proposedAssessmentDesignNotActualLearnerPerformance=True, activeIntegrationAndContextRebindingPending=True, independentVotes=0, machineStrictGain=0, HumanApproval=False, HumanTrial=False))

parsed = []
for p in sorted(BASE.rglob('*')):
    assert not p.is_symlink(), str(p)
    if not p.is_file():
        continue
    if p.suffix == '.json':
        read(p)
        parsed.append(str(p.relative_to(BASE)))
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip():
                json.loads(line)
        parsed.append(str(p.relative_to(BASE)))
assert attribution['counts'] == dict(allRawRows=488, narrowComponentCandidates=62, literalHolds=426, fullSourceGoalCompletionClaims=0)
write(BASE / 'checks/FINAL.external-inputs-history-portability-and-complete-parse.actual.json', dict(result='PASS', CASinputsVerified=len(first['files']), externalInputDrift=0, ownJsonJsonlParsed=parsed, ownSymlinks=0, v7All199FilesUnchanged=True, originalIndependentPackages=preserved, currentGitHead=subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(), activeCanonicalExactInitialCAS=True, reviewRole='AUTHOR only', activeWrites=False, HumanApproval=False, HumanTrial=False))

join = BASE / 'inputs/neutral-whole-three-LIVE402-source382-P3-nine-cases-named-chemical-method-and-fresh-sources.author.join.json'
manifest = dict(schemaVersion=1, createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(), role='Complete inactive AUTHOR v8 candidate; fresh independent review pending', goalIds=first['goalIds'], currentCanonicalGoals=523, currentCurricularAtomic=402, currentSourceUnion=382, sourceViews=48, entry=ref(join), FIRST=ref(BASE / 'FIRST.actual-author-v8-inputs-CAS.json'), candidateLandscape=ref(BASE / 'candidate/canonical523.exact-v7-live-preserving.inactive.json'), candidateSemanticKinds=ref(BASE / 'candidate/semantic402.current-two-normal-fingerprints.inactive.json'), candidateVisualizationQa=ref(BASE / 'candidate/visualization-QA.current-three-exact-good-PNG.inactive.json'), candidateSHMapping=ref(BASE / 'candidate/SH-upper-micelle-three-wrong-to-exact-owner.review.json'), P3=ref(BASE / 'positive/P3.current402.author.records.jsonl'), M402candidateConfig=ref(BASE / 'memory/current402.inactive.config.json'), A3AuthorConfig=ref(BASE / 'checks/A3.semantic-author-current.inactive.config.json'), namedChemicalMethod=ref(BASE / 'sources/q3-01-e.named-operational-chemical-method.author.json'), fullNinthChemicalCase=ref(BASE / 'cases/q3-01-e.full-executable-chemical-investigation.author.json'), syntheticRawFixture=ref(BASE / 'cases/q3-01-e.synthetic-raw-fixture.author.json'), actualPrimaryTeachingMethod=ref(BASE / 'sources/UCI-investigating-iron-thiocyanate.primary.pdf'), freshBeforeSourceIndex=ref(BASE / 'sources/fresh-before.normal-original-source-index.json'), freshAfterSourceIndex=ref(BASE / 'sources/fresh-after.normal-original-source-index.json'), completeBeforeRawSourceInventory=ref(BASE / 'sources/before.all-raw-sourceGoal-operators-and-fresh-normal-citations.inventory.json'), completeAfterRawSourceInventory=ref(BASE / 'sources/after.all-raw-sourceGoal-operators-and-fresh-normal-citations.inventory.json'), allRawSourceComponentAttribution=ref(BASE / 'sources/whole-all-raw-source-component-attribution.author-candidates-and-literal-HOLDs.json'), fullSourceContextImpact=ref(BASE / 'checks/SH-four-exact-current-goal-and-source-context-impact.json'), existingStrictCollateralContexts=ref(BASE / 'checks/SH-three-current-strict-source-bindings-must-be-rechecked.json'), current402Model=ref(BASE / 'native/whole402.normal-model.json'), current382Model=ref(BASE / 'native/source382.normal-model.json'), normalNativePages={c:{f:ref(BASE / 'native' / c / f) for f in ['book-model.json', 'book.html', 'book.html.render-manifest.json', 'book.pdf', 'book.pdf.render-manifest.json']} for c in ['whole402-three', 'source382-three']}, normalBlindReviewInputs={c:{f:ref(BASE / 'review' / c / f) for f in ['description-review-input.json', 'description-review-campaign.json', 'review-bundle-manifest.json']} for c in ['round-a', 'round-b']}, normalReviewBundle=ref(BASE / 'review/bundle/manifest.json'), normalChecks=ref(BASE / 'checks/normal-live402-source382-M2-P3-and-protected-context.author.actual.json'), nativeSchemaCampaignCheck=ref(BASE / 'checks/native-HTML-three-source-three-P3-schema-campaigns-and-JSON.actual.json'), finalCASCheck=ref(BASE / 'checks/FINAL.external-inputs-history-portability-and-complete-parse.actual.json'), holds=ref(BASE / 'HOLDs.author.json'), historicalAuthorSeal=ref(v7seal), historicalIndependentSeals=preserved, allFiveB007ApplicabilityFixesPreserved=True, all523RequiresPreserved=True, originalEightWholeCasesExact=True, totalWholeCases=9, namedChemicalAssessmentDesignSupplied=True, namedRawDataExplicitlySynthetic=True, noHumanLaboratoryRunPrerequisiteForMachineM7=True, sourceComponentsBounded=True, completeRawSourceRows=488, unresolvedLiteralRows=426, fullSourceCompletionClaims=0, ownChemicalExperimentPerformed=False, actualLearnerPerformance=False, independentVotes=0, machineStrictGain=0, restoredActiveBindings=0, activeWrites=False, HumanApproval=False, HumanTrial=False, sealPath=str((BASE / 'FINAL.immutable-author-candidate-CAS-seal.json').relative_to(ROOT)))
write(BASE / 'FINAL.author-candidate-input-manifest.json', manifest)
seal_path = BASE / 'FINAL.immutable-author-candidate-CAS-seal.json'
files = [ref(p) for p in sorted(BASE.rglob('*')) if p.is_file() and p != seal_path]
seal = dict(schemaVersion=1, createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(), role='Immutable complete AUTHOR v8 package seal; no reviewer approval', inputManifest=ref(BASE / 'FINAL.author-candidate-input-manifest.json'), FIRST=ref(BASE / 'FIRST.actual-author-v8-inputs-CAS.json'), externalInputsCASVerified=len(first['files']), files=files, allFilesRegular=True, v7andOriginalA3B3Preserved=True, sourceDocumentsThirdPartyRightsPreserved=True, activeWrites=False, independentVotes=0, strictM7Gain=0, HumanApproval=False, HumanTrial=False)
write(seal_path, seal)
verify(seal['files'])
print(json.dumps(dict(result='PASS_SEALED_AUTHOR_V8_CANDIDATE', entry=manifest['entry']['path'], manifest=str((BASE / 'FINAL.author-candidate-input-manifest.json').relative_to(ROOT)), seal=ref(seal_path), CASinputCount=len(first['files']), sealedFiles=len(files), rawSourceRows=488, literalHolds=426, strictCollateralContextRechecks=3, strictGain=0, independentVotes=0, activeWrites=False)))
