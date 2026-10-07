# SPDX-License-Identifier: Apache-2.0
"""Append own targeted scientific resolution; immutable first review is preserved."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

root = Path.cwd()
own = Path(__file__).resolve().parent
author = own.parent / 'biologie-human20-current391-author-v1'
v2 = author / 'science-correction-v2'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):
    return {'path': str(p.relative_to(root)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    with p.open('x') as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
first = own / 'first-twenty-whole-science.freeze.json'
assert sha(first) == '960d3501b304a4482a0012fe195bc5d592a3cc3ea881e979719cb742ef986b9a'
for row in read(first)['frozenFiles']:
    assert bind(root / row['path']) == row
entry = v2 / 'neutral-targeted-v2-current-whole-entry.json'
assert sha(entry) == '3ea4b27e1afcc715e1cbcbd6a46045cde123df96cdeca402b6d71065ebccaa35'
inputs = read(entry)
for row in inputs.values():
    if isinstance(row, dict) and set(row) == {'path', 'sha256', 'bytes'}:
        assert bind(root / row['path']) == row
old_material = read(author / 'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json')['goals']
new_material = read(root / inputs['operativeWholeMaterialsJSON']['path'])['goals']
old_p = [json.loads(line) for line in (author / 'P20.current-text-preimage.author.review.jsonl').read_text().splitlines()]
new_p = [json.loads(line) for line in (root / inputs['operativeP20NativeRecords']['path']).read_text().splitlines()]
candidates = read(root / inputs['operativeP20Candidates']['path'])['goals']
assert len(old_material) == len(new_material) == len(old_p) == len(new_p) == len(candidates) == 20
changed_cases = []
changed_profiles = []
for ordinal, (old, new, before_p, after_p, candidate) in enumerate(zip(old_material, new_material, old_p, new_p, candidates), 1):
    assert old['wholeGoal'] == new['wholeGoal']
    assert old['goalId'] == new['goalId'] == before_p['goalId'] == after_p['goalId'] == candidate['goalId']
    assert after_p['profile'] == candidate['profile']
    assert after_p['reviewAuthority'] == 'ai_candidate' and after_p['status'] == 'needs_human_review'
    assert after_p['evidenceLevel'] == 'E1' and after_p['maximumClaimScope'] == 'G1'
    if before_p['profile'] != after_p['profile']:
        changed_profiles.append(ordinal)
    for before_case, case in zip(old['cases'], new['cases']):
        if before_case != case:
            changed_cases.append(case['id'])
        brief = next(b for b in after_p['profile']['applicationCaseBriefs'] if b['id'] == case['id'])
        for lang, suffix in [('de', 'De'), ('en', 'En')]:
            assert brief['taskDemand' + suffix] == case['material'][lang] + ' ' + case['task'][lang]
            assert brief['expectedPerformance' + suffix] == case['modelAnswer'][lang]
assert changed_profiles == [5, 7, 16, 19]
assert changed_cases == ['human20-05-case-1', 'human20-07-case-1', 'human20-07-case-2', 'human20-16-case-2', 'human20-19-case-2']
resolutions = [
    {'ordinal': 5, 'findingId': 'HUMAN20-B-REPORTED-EN-NEGATION', 'findingOrigin': 'Peer report received only after immutable own first science seal; independent A did not identify this wording fault in its original first review', 'wholeCaseIdsActuallyReread': ['human20-05-case-1', 'human20-05-case-2'], 'ownActualResolutionDe': 'Die neue ganze englische Antwort verneint nun ausdrücklich Resistenz des Menschen und unterscheidet Selektion bereits resistenter Bakterien von Neuerwerb aller Bakterien. Sie ist damit zur deutschen Aussage äquivalent. 10/19 statt10/100 und der zweite virale Gegenfall bleiben fachlich korrekt; Therapie- und Dosierungsgrenzen werden nicht erweitert.'},
    {'ordinal': 7, 'findingId': 'HUMAN20-A-P07-MICRONUTRIENT-FUNCTION', 'findingOrigin': 'Own immutable first science review', 'wholeCaseIdsActuallyReread': ['human20-07-case-1', 'human20-07-case-2'], 'ownActualResolutionDe': 'Beide ganzen Fälle liefern nun konkret Paprika→Vitamin C→Kollagenbildung und angereicherte Calciumquelle→Knochen-/Zahnmineralstruktur. Die vollständigen Erwartungen verlangen diese funktionalen Begründungen und die gemeinsame Ernährung für unterschiedliche Aktivität. Die Quelle bestätigt die Funktionen und Lebensmitteltypen; Mengen, individuelle Behandlung oder universelle Ernährungsform werden nicht behauptet.'},
    {'ordinal': 16, 'findingId': 'HUMAN20-A-P16-SOURCE-LEVEL-BOUNDARY', 'findingOrigin': 'Own immutable first science review', 'wholeCaseIdsActuallyReread': ['human20-16-case-1', 'human20-16-case-2'], 'ownActualResolutionDe': 'Der zweite ganze Fall und die identische P-Leistung vergleichen nun Produkte, geringere ATP-Ausbeute und zeitweilige Beiträge ohne Elektronenakzeptor-/Reduktionsäquivalent-Mechanismus als Pflicht. Der unveränderte erste Fall wahrt das bedingte30/2-ATP-Lehrmodell und28 Differenz. Beide Wege dürfen bei Sauerstoff im Körper beitragen; die aktuelle BY10-3.4-Grenze ist eingehalten.'},
    {'ordinal': 19, 'findingId': 'HUMAN20-A-P19-DE-NUTRITION-TERM', 'findingOrigin': 'Own immutable first science review', 'wholeCaseIdsActuallyReread': ['human20-19-case-1', 'human20-19-case-2'], 'ownActualResolutionDe': 'Die neue deutsche vollständige Modellantwort nennt jetzt das tatsächlich vorgegebene fast nur aus Süßigkeiten bestehende Angebot; sie verwechselt es nicht mehr mit Süßstoffen. Die englische Aussage, übrige Nährstofffunktionen sowie vollständiger Verdauungs-/Resorptions-/Restweg bleiben passend.'},
]
for resolution in resolutions:
    ordinal = resolution['ordinal']
    resolution.update({'goalId': new_material[ordinal - 1]['goalId'], 'status': 'resolved_in_current_v2_whole_cases_and_operative_P', 'scientificVerdict': 'PASS_E1_G1_only', 'wholeGoalTextDecision': 'keep', 'allFourWholeProfileDimensionsActuallyRead': True, 'wholeCurrentMaterial': new_material[ordinal - 1], 'wholeCurrentPProfile': new_p[ordinal - 1]['profile']})
sources = [
    {'url': 'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/', 'provider': 'National Institutes of Health, Office of Dietary Supplements', 'actualSectionsRead': ['Introduction collagen/connective-tissue role', 'Sources of Vitamin C, Food including red pepper'], 'ownBoundedResult': 'Vitamin C is needed for collagen biosynthesis; collagen is connective-tissue material. Red peppers are an appropriate food source. No dose or treatment recommendation used.'},
    {'url': 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/', 'provider': 'National Institutes of Health, Office of Dietary Supplements', 'actualSectionsRead': ['Introduction bone/tooth mineral structure', 'Sources of Calcium, Food including milk and expressly fortified plant drinks'], 'ownBoundedResult': 'Calcium forms part of mineral bone/tooth structure. Milk and explicitly calcium-fortified milk substitutes supply the used calcium example. No personal intake or clinical claim used.'},
]
native = own / 'P20-science-v2-preimage-native-independent-a.actual.log'
assert native.exists() and 'Blocking issues: 0' in native.read_text() and 'Configured goals: 20' in native.read_text()
stderr = own / 'P20-science-v2-preimage-native-independent-a.actual.stderr.log'
assert stderr.exists() and not stderr.read_bytes()
diagnostics = own / 'targeted-v2-native-check-command-and-diagnostics.actual.json'
write(diagnostics, {'role': 'Actual independent A technical command execution and diagnostics; no independent science substituted by hashes', 'actualSuccessfulCommand': './node_modules/.bin/tsx scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-human20-current391-author-v1/science-correction-v2/P20.current-text-preimage.author-targeted-v2.config.json --mode=check', 'actualCwd': 'app', 'actualExitCode': 0, 'stdout': bind(native), 'stderr': bind(stderr), 'earlierReadOnlyAttempts': [{'attempt': 'Read four whole neutral materials and native candidate profiles', 'actualError': 'KeyError: 4 after first complete material read; candidate top-level object has goals array, corrected reader selected goals and reread the whole four inputs', 'contentChangesMade': 0}, {'attempt': 'Native P config argument initially used ../curricula prefix from app', 'actualExitCode': 1, 'actualError': 'Configured path must stay inside the repository', 'resolution': 'Use repository-relative config argument as required by native parser; no config or gate content change'}], 'activeWrites': 0, 'humanApproval': False})
receipt = {'schemaVersion': 1, 'artifactKind': 'independent-a-human20-targeted-v2-whole-case-science-resolution', 'recordedAt': datetime.now(timezone.utc).isoformat(), 'actualAgent': '/root/b008_placements_author_resume', 'ownImmutableFirstScienceSeal': bind(first), 'exactNeutralAuthorV2Entry': bind(entry), 'actualEightWholeBilingualCasesReread': 8, 'actualChangedWholeBilingualCases': changed_cases, 'actualWholeProfileBodiesReread': 4, 'unchangedWholeCasesRetainedByExactComparison': 35, 'unchangedWholeProfilesRetainedByExactComparison': 16, 'all20WholeDEENGoalTextsExactUnchanged': True, 'all40WholeCaseBodiesExactlyMatchOperativeV2PBriefs': True, 'ownNativePreimageP20Check': bind(native), 'closedSchemaAndNativeSemanticsErrors': 0, 'ownPrimaryBiologicalFunctionChecks': sources, 'wholeOriginalCurricularSourceReadingRetained': bind(own / 'actual-two-primary-whole-scoped-readings.independent-a.json'), 'resolvedOwnFirstFindings': 3, 'peerReportedAfterOwnSealNegationIndependentlyConfirmed': 1, 'ownFirstReviewIncorrectNegationPassNotRetroactivelyChanged': True, 'resolutions': resolutions, 'currentWholeCasePScientificVerdict': 'PASS20_E1_G1_after_targeted_resolution', 'finalActualRasterAndNativeDPageReviewStillPending': True, 'noHistoricalReviewRestart': True, 'independentAAuthoredNoTextsCasesOrImages': True, 'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'realLearnerPerformance': False, 'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0}
out = own / 'targeted-v2-five-whole-case-P20-science-resolution.independent-a.actual.json'
write(out, receipt)
seal = own / 'targeted-v2-science-resolution.independent-a.freeze.json'
write(seal, {'schemaVersion': 1, 'artifactKind': 'independent-a-human20-targeted-v2-science-resolution-freeze', 'recordedAt': receipt['recordedAt'], 'ownFirstScienceSealPreserved': bind(first), 'frozenFiles': [bind(out), bind(native), bind(stderr), bind(diagnostics)], 'currentWholeCasePSciencePASS': 20, 'finalVAndNativeDPending': True, 'humanApproval': False, 'strictGainClaimed': 0, 'activeWrites': 0})
print(json.dumps({'actualOwnTargetedFollowupSeal': bind(seal), 'resolvedOwnFindings': 3, 'peerAfterFirstSealNegationConfirmed': 1, 'wholeP20Science': 'PASS_E1_G1', 'finalRasterPagesPending': True}))
