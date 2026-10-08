# SPDX-License-Identifier: Apache-2.0
"""Genuine one-goal scientific recheck, no assumed new native page or bindings."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he9-genetic-method19-targeted-English-whole-science-author-root-v2'
PRIOR = OWN.parent / 'biologie-he9-eighteen-final-raster-native-independent-b-20261008-v1'
OLD_AUTHOR = OWN.parent / 'biologie-he9-eighteen-final-raster-native-author-root-20261008-v1'
GID = '1b7f08a1-33df-5779-af66-430c91d699b7'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, v):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(v, ensure_ascii=False, indent=2) + '\n')

entry = read(AUTHOR / 'neutral-targeted-English19-whole-source-class-AM-review.entry.json')
author_seal = AUTHOR / 'targeted-English19-whole-science-author-input.first.freeze.json'
assert sha(author_seal) == '5789db4f688028a21a88fa6d0fd1c2b7879dfde8cff7097cfe690d83aadc3f81'
for b in read(author_seal)['frozenFiles']: assert bind(ROOT / b['path']) == b
prior_seal = PRIOR / 'completed-HE18-D17-HOLD19-P18-V18.independent-b.first.freeze.json'
assert sha(prior_seal) == '34985105403d009f29e4b9360c5ff135c064f01d22998724fec03d2d20caf579'
for b in read(prior_seal)['frozenFiles']: assert bind(ROOT / b['path']) == b
original = read(ROOT / entry['originalWholeGoalPath'])['goal']
proposed = read(ROOT / entry['proposedWholeGoalPath'])['goal']
old_goal = next(g for g in read(OLD_AUTHOR / 'current18-whole-DEEN-goals.actual.json')['goals'] if g['id'] == GID)
assert original == old_goal
deltas = {k: {'before': original.get(k), 'after': proposed.get(k)} for k in set(original) | set(proposed) if original.get(k) != proposed.get(k)}
assert set(deltas) == {'titleEn', 'descriptionEn'}
assert proposed['titleEn'] == 'Basic Concepts of Gene Technology'
assert proposed['descriptionEn'] == 'The learner can outline basic methods and applications of gene technology.'
whole_cases = read(ROOT / entry['wholeCaseFile'])
old_cases = next(g for g in read(OLD_AUTHOR / 'eighteen-whole-goals-forty-complete-DEEN-cases.exact.json')['goals'] if g['goalId'] == GID)
assert whole_cases == old_cases and len(whole_cases['cases']) == 2
profile = read(ROOT / entry['positiveProfileFile'])
old_p = next(json.loads(s) for s in (OLD_AUTHOR / 'native-raster-candidate/P18.actual-raster-author.review.jsonl').read_text().splitlines() if json.loads(s)['goalId'] == GID)
assert profile['profile'] == old_p['profile']
for case, brief in zip(whole_cases['cases'], profile['profile']['applicationCaseBriefs'], strict=True):
    assert case['id'] == brief['id']
    for lang, suffix in [('de', 'De'), ('en', 'En')]:
        assert brief['taskDemand' + suffix] == case['material'][lang] + ' ' + case['task'][lang]
        assert brief['expectedPerformance' + suffix] == case['modelAnswer'][lang]
raster = read(ROOT / entry['unchangedRasterReceipt'])
old_v = next(r for r in read(PRIOR / 'actual-eighteen-V-first-independent-b.verdicts.json')['records'] if r['goalId'] == GID)
assert bind(ROOT / raster['image']['path']) == old_v['actualObservedFullRaster']
captures = read(ROOT / raster['widthCaptureReceipt'])
assert [bind(ROOT / c['path']) for c in captures['captures']] == old_v['actualObservedChromium360680']
assert bind(ROOT / raster['previousNativePage']['path']) == old_v['actualObservedNativePdfPage']['capture']
primary = Path('/tmp/he9-independent-a-primary-angh7cme/g9-biologie.pdf')
assert sha(primary) == entry['sourcePrimarySha256']
extract = ROOT / 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_BIOLOGIE_SEKI_G9.source-extraction.json'
source_id = proposed['extendedData']['provenance']['sourceGoalId']
source_row = next(g for g in read(extract)['sourceGoals'] if g['id'] == source_id)
am_dir = OWN.parent / 'biologie-he9-nineteen-current391-science-author-root-v1/retained-AM-technical-independent-a'
atomic = next(json.loads(s) for s in (am_dir / 'A19.exact-retained.review.jsonl').read_text().splitlines() if json.loads(s)['goalId'] == GID)
memory = next(json.loads(s) for s in (am_dir / 'M25.exact-retained-dependency-closure.review.jsonl').read_text().splitlines() if json.loads(s)['goalId'] == GID)
assert atomic['status'] == 'atomic' and memory['status'] == 'no_memory_needed'

write(OWN / 'one-whole-input-and-retained-byte-bindings.independent-b.actual.json', {
    'artifactKind': 'independent-B-actual-one-whole-corrected-English-input-verification', 'recordedAt': datetime.now(timezone.utc).isoformat(),
    'authorExactSeal': bind(author_seal), 'actualFrozenAuthorFilesVerified': 6, 'exactWholeGoalFieldDeltas': deltas,
    'allOtherWholeGoalFieldsUnchanged': True, 'wholeCurrentGoalCount': 1, 'twoWholeBilingualCasesUnchanged': True,
    'wholePositiveProfileUnchanged': True, 'wholeMaterialTaskAnswerBriefBindings': 2,
    'retainedOwnPriorFirstSeal': bind(prior_seal), 'retainedActualOriginalRasterAndWidths': old_v,
    'originalSourceRefAndProvenanceUnchanged': True, 'normalizedSourceBinding': bind(extract), 'normalizedSourceRow': source_row,
    'normalizedSourceRowIsVerbatimPrimaryQuotation': False, 'hashBindingIsScientificApproval': False,
    'peerATargetedOutputRead': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
scientific = {
    'schemaVersion': 1, 'artifactKind': 'independent-B-targeted-one-whole-English-source-semantic-class-AM-genuine-science-first',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'actualReviewer': '/root/flora_fauna_independent_a', 'assignedIndependentRole': 'B', 'goalId': GID,
    'exactProposedWholeGoal': bind(ROOT / entry['proposedWholeGoalPath']), 'actualWholeDEENGoalRead': True,
    'actualWholeBilingualMaterialTaskAnswerCasesRead': 2, 'actualWholePositiveExpectationsCoverageVariationsBriefsRead': True,
    'sourceReading': {'url': entry['sourcePrimaryUrl'], 'sha256': entry['sourcePrimarySha256'], 'wholePhysicalPage': 27,
        'readBasis': 'Whole original physical27 independently reread through fitz, including Vererbung justification, all mandatory/facultative rows and work-method boundaries. No whole third-party source text copied here.'},
    'boundedEnglishScopeVerdict': 'PASS',
    'boundedEnglishScopeScientificReasonDe': 'Die beiden tatsächlich korrigierten englischen Felder nennen Gene Technology statt allgemeiner Biotechnology. Das entspricht dem deutschen Gentechnik-Umfang auf Grundbegriffs-/Skizzen-Niveau und schließt die drei im ganzen originalen Pflichtquellenpunkt genannten Methoden Gentest, Gentherapie und Klonen ein. Untersuchung ausgewählter DNA bleibt darunter, ohne bei jedem Gentest eine Genomveränderung zu verlangen. Die Formulierung führt keine nicht gentechnische Fermentationspflicht ein und verlangt nicht ausschließlich Genom-Editing. Titel benennt Grundbegriffe; description erläutert dieselbe grundlegende Methoden-/Anwendungsskizze wie die unveränderte deutsche description.',
    'wholePScienceCoverageVerdict': 'PASS_SCOPED_E1_G1 for this actual corrected whole goal',
    'wholePScienceReasonDe': 'Fall1 verlangt Zuordnung und begrenzte Ziel/Ablauf/Grenzen-Skizze von DNA-Untersuchung, somatischer funktioneller Genkopie und DNA-Klonierung; DNA-Klonierung ist keine Erzeugung einer geklonten Person. Fall2 verändert den Anwendungskontext zu rekombinanter Insulinproduktion: intronfreie codierende DNA mit passenden Steuersequenzen/Vektor, Expression und Proteinaufbereitung; Proteinverabreichung verändert im Modell keine Empfängergene und ist keine Gentherapie. Vollständige DE/EN-Materialien, Aufgaben, Musterantworten, Erwartungs-/Transfer- und Modellgrenzen stimmen. Keine Laboranleitung, reale Krankheitssequenz, echte Lernendenleistung oder vollständige medizinische Anwendung behauptet.',
    'semanticKindDecision': {'semanticKind': 'curricularAtomic', 'scientificDecision': 'PASS for exact corrected candidate',
        'reasonDe': 'Das Ziel verlangt eine konkrete schulcurriculare fachliche Leistung: grundlegende ausgewählte Gen-Technologien und ihre Anwendungen skizzieren. Diese Leistung ist mit Zuordnung und begründetem Transfer an zwei eigenen Materialmodellen prüfbar. Das Ziel ist weder motivierende Orientierung noch Programm-/Struktureinheit, Erinnerungsdeck oder allgemeine Kompetenzachse. Die original gebundene HE9.4-Pflichtquelle und whole body tragen dieselbe fachliche Skizzenleistung.',
        'currentAuthoritativeNativeLedgerRebinding': 'pending separate reviewed native materialization; no authoritative active write by this reviewer'},
    'atomicityDecision': {'status': 'atomic', 'semanticAtomic': True, 'scientificDecision': 'PASS for exact corrected candidate',
        'reasonDe': 'Bewertet wird ein zusammenhängender Grundbegriffsvergleich ausgewählter DNA-Methoden anhand Zweck, DNA-Umgang und Anwendungsgrenze. Gentest, somatische Gentherapie und DNA-Klonierung sind Beispiele innerhalb derselben begrenzten Überblicksleistung; sie werden nicht zu drei vollständigen unabhängig ausgeführten Laborverfahren oder eigenen detaillierten Behandlungsfähigkeiten erweitert. Der Transfer kontrastiert dieselbe DNA-versus-Protein/Untersuchung-versus-Veränderung-Grundrelation. Methoden und Anwendungen im Plural begründen hier keinen separaten Kompetenzverbund; eine spätere vertiefte Durchführung wäre getrennt zu modellieren.',
        'currentNativeFingerprintRebinding': 'pending actual corrected whole-goal native check'},
    'memoryDecision': {'status': 'no_memory_needed', 'memoryUseful': False, 'scientificDecision': 'PASS for exact corrected candidate',
        'reasonDe': 'Die Leistung beruht auf konzeptuellem Zuordnen und Begründen unterschiedlicher DNA-Handlungen und einem neuen Proteinproduktionsfall; isolierte Terminologiewiedergabe oder eine zusätzliche Faktenliste ersetzt das nicht. Die kurzen Methodenbegriffe können im fachlichen Vergleich eingeführt und angewendet werden. Das Ziel verlangt keine dauerhafte unabhängige Listen-/Formel-/Merkmalsabfrage als eigene Lernleistung. Deshalb bleibt für genau dieses Grundbegriffs-/Skizzenziel keine verpflichtende neue Memorycard; unveränderte allgemeine Genetik- und Karyogramm-Voraussetzungen bleiben erhalten.',
        'newRequiredCards': 0, 'newCardVisibilityObligationsForThisGoal': 0, 'sharedOtherGoalDeckClosureUnchanged': True,
        'retainedOldMemoryDecision': memory, 'retainedOldAtomicityDecision': atomic,
        'currentNativeAMBindingCheck': 'pending exact corrected goal fingerprint materialization; not represented as already executed'},
    'imageDecision': 'KEEP genuine exact unchanged own prior full PNG/360/680 verdict',
    'actualImageBasis': old_v['substantiveActualObservationsDe'],
    'oldFinding': 'B-D19-EN-BIOTECHNOLOGY-BROADER-SCOPE',
    'oldFindingScientificStateForProposedV2': 'resolved in actually reviewed corrected candidate content',
    'oldActualCurrentFindingState': 'old first HOLD remains immutable; active current whole goal unchanged and not declared closed',
    'currentD1NewNativeCampaignCheck': 'pending new actual compiler/page/input after reviewed classification',
    'currentP1NewNativeBindingSchemaCheck': 'pending new actual corrected goal/page/image/source fingerprint materialization',
    'currentV1NewNativePageReview': 'pending new actual page, despite unchanged PNG and widths',
    'retainedOther17GoalsNotReopened': True, 'sourceScopeOtherJurisdictionsUntouched': True, 'wholeCountrySourceClosureClaim': False,
    'aiCandidateEvidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'PStatusAfterMaterializationMustRemain': 'needs_human_review',
    'peerATargetedReviewReadBeforeFirstSeal': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'realLearnerEvidence': False, 'humanApproval': False, 'humanTrial': False}
write(OWN / 'one-whole-English-source-class-AM-scientific-first.independent-b.verdict.json', scientific)
write(OWN / 'original-HOLD19-proposed-v2-scientific-resolution.independent-b.actual.json', {
    'artifactKind': 'append-only actual original-HOLD19 resolution for scoped corrected candidate only',
    'oldFinding': 'B-D19-EN-BIOTECHNOLOGY-BROADER-SCOPE', 'oldFirstSeal': bind(prior_seal),
    'oldFindingArtifact': bind(PRIOR / 'open-ordinal19-bilingual-scope-finding.independent-b.actual.json'),
    'proposedWholeInput': bind(ROOT / entry['proposedWholeGoalPath']), 'ownActualScienceVerdict': bind(OWN / 'one-whole-English-source-class-AM-scientific-first.independent-b.verdict.json'),
    'scientificScopeCorrectionConfirmedFromActualContent': True, 'oldCurrentHOLDOverwritten': False,
    'newNativeDPVAndAMBindingsAlreadyApproved': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
files = [p for p in sorted(OWN.rglob('*')) if p.is_file()]
write(OWN / 'one-whole-English-source-class-AM.independent-b.science-first.freeze.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-B-targeted-English19-whole-source-class-AM-genuine-science-first-freeze',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'authorExactInputSeal': bind(author_seal), 'authorFrozenFilesActuallyVerified': 6,
    'frozenFiles': [bind(p) for p in files], 'oldOwnActualFirstSealRetained': bind(prior_seal),
    'correctedWholeGoalSourceScienceVerdict': 'PASS', 'correctedWholePositiveScienceVerdict': 'PASS_SCOPED_E1_G1',
    'semanticKindScientificDecision': 'curricularAtomic', 'semanticAtomicScientificDecision': True, 'memoryScientificDecision': 'no_memory_needed',
    'newNativeD_P_V_AMBindings': 'pending actual post-classification native inputs and recheck',
    'peerATargetedReviewReadBeforeOwnFirstSeal': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})
print('Independent B one whole corrected English19/source/P/class/A/M science PASS; real original HOLD unchanged. New native D/P/page/V/A/M bindings remain pending, not inferred.')
