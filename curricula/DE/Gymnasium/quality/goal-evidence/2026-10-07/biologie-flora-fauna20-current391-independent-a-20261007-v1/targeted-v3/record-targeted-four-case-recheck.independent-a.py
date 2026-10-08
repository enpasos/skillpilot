"""Record actual targeted reinspection; retain the independent first holds."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

D = Path(__file__).resolve().parent
ROOT = D.parents[7]
A = D.parent
BASE = A.parent
ORIGINAL = BASE / 'biologie-flora-fauna20-current391-author-v1'
AUTHOR = BASE / 'biologie-flora-fauna20-targeted-P-remediation-root-author-v3'

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}

def write(name, obj):
    with (D / name).open('x', encoding='utf-8') as f:
        f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

seal = json.loads((AUTHOR / 'targeted-author-remediation.exact-input-output.freeze.json').read_text())
for b in seal['frozenFiles']:
    assert binding(ROOT / b['path']) == b
old = json.loads((ORIGINAL / 'materials-scope-precision-v2/twenty-whole-goals-forty-common-DEEN-cases.author-v2.json').read_text())
new = json.loads((AUTHOR / 'twenty-whole-goals-forty-common-DEEN-cases.author-v3.json').read_text())
oldrows = list(map(json.loads, (ORIGINAL / 'P20.current-text-preimage.author.review.jsonl').read_text().splitlines()))
newrows = list(map(json.loads, (AUTHOR / 'P20.targeted-two-profiles.author-v3.review.jsonl').read_text().splitlines()))
canon = json.loads((ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json').read_text())
by = {g['id']: g for g in canon['goals']}
assert len(new['goals']) == len(newrows) == 20
for i, (a, b, oldp, newp) in enumerate(zip(old['goals'], new['goals'], oldrows, newrows)):
    assert a['wholeGoal'] == b['wholeGoal'] == by[b['goalId']]
    if i not in [8, 9]:
        assert a == b and oldp['profile'] == newp['profile']
    for c, brief in zip(b['cases'], newp['profile']['applicationCaseBriefs']):
        for lang in ['de', 'en']:
            assert brief['taskDemand' + lang.capitalize()] == c['material'][lang] + ' ' + c['task'][lang]
            assert brief['expectedPerformance' + lang.capitalize()] == c['modelAnswer'][lang]
            assert brief['understandingFocus' + lang.capitalize()] == ' '.join(e['essentialUnderstanding' + lang.capitalize()] for e in newp['profile']['expectations'])
    assert newp['status'] == 'needs_human_review' and newp['reviewAuthority'] == 'ai_candidate'
    assert newp['evidenceLevel'] == 'E1' and newp['maximumClaimScope'] == 'G1'
assert oldrows[9]['dissent'] == newrows[9]['dissent']

verdicts = [{
    'goalId': '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd',
    'originalFindingId': 'flora-fauna20-independent-a-P09-answer-leak',
    'decision': 'resolved', 'currentPScience': 'PASS',
    'case1ActualRecheckDe': 'Benannte Referenzmerkmale und unbekannte Proben A/B/C sind getrennt. Kein Probencode ist seinem Lösungsnamen zugeordnet. Jede Zuordnung muss mit Blütenstand/Rosette, dreiteiligen Blättern/Blütenköpfen oder windendem Spross/Hülsen begründet werden. Die explizit kletternde gezeigte Bohne verhindert eine pauschale Aussage über alle Bohnenformen. Die Modellantwort löst die unbekannten Proben korrekt und hält Wildvorkommen, Nutzung und Essbarkeitsgrenze getrennt.',
    'case2ActualRecheckDe': 'Benannte Blattreferenzen und unbekannte X/Y/Z-Flächen sind getrennt; Aufgabenmaterial enthält keine Objekt-Lösungskarte. Gelappte ungeteilte, herzförmige und zusammengesetzte Blattmerkmale liefern die geforderte begründete Zuordnung im begrenzten Satz. Weitere Merkmale und keine universelle Essbarkeit bleiben in der Antwort. Der Baum-/Blattvergleich ist sachhaltiger Transfer zum Blüten-/Spross-/Fruchtfall.',
    'wholeProfileRecheckDe': 'Core/Transfer observablePerformance fordert jetzt tatsächlich Bestimmen plus Merkmalsbegründung. Beide ganzen nativen Aufgaben-/Antwortbriefs stimmen mit den tatsächlich gelesenen Materialien überein. DE/EN verlangen denselben begrenzten Satz, dieselben Begründungen und dieselben Grenzen. Mindestzahl/Fresh-Variation-/Transferregel unverändert; kein eigenständiger Lernendenbeweis behauptet.',
    'profileFingerprint': newrows[8]['profileFingerprint'],
}, {
    'goalId': '7eeb9de9-9a8e-5932-8f60-183367c87d09',
    'originalFindingId': 'flora-fauna20-independent-a-P10-source-policy-as-learning-facet',
    'decision': 'resolved', 'currentPScience': 'PASS',
    'case1ActualRecheckDe': 'Aufgabe verlangt jetzt ausschließlich Vogelbau/Funktion als Lebensraumpassung und einen biologischen Fischgegenvergleich. Die Lehrplan-Vertiefungsregel wird weder abgefragt noch als Teil der erwarteten Modellleistung genannt. Flugkräfte, Masse/Stabilität/Muskelarbeit, Landung/Halt und Kiemen-/Wassermedium bleiben fachlich passend; keine universelle Flugfähigkeit oder absichtliche Formänderung.',
    'case2ActualRecheckDe': 'Ente/Laufvogel wird nach Flügeln, Schwimmhäuten, Gefieder, Laufgliedmaßen und Lebensraumbedingungen gedeutet. Die Frage/Antwort fordert keine Aussage über die Wahl des Lehrplans mehr. Thermische Isolation und Fortbewegungsfunktionen sowie Grenzen über alle Vögel bleiben erhalten und stimmen DE/EN überein.',
    'wholeProfileRecheckDe': 'Die verpflichtende Transfer-Erwartung betrifft jetzt biologische Variation/Funktionspassung und Grenzen statt HE6.2-Kenntnis. Quellenwahl ist genau im unveränderten Dissent erhalten; ganze Fischwahlfälle bleiben getrennt und bedingt. Die Referenz auf einen gewählten Vogelschwerpunkt beschreibt den Fallkontext und fügt keinen curricularen Lernnachweis hinzu. Core/Transfer observable/focus und ganze DE/EN-Briefs stimmen überein.',
    'profileFingerprint': newrows[9]['profileFingerprint'],
}]
write('targeted-four-whole-cases-two-profiles.independent-a.actual.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-a-targeted-flora-P09-P10-substantive-recheck',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Independent reviewer A; root authored the corrections',
    'originalBlindScienceSeal': binding(A / 'first-twenty-whole-science.freeze.json'),
    'correctedAuthorSeal': binding(AUTHOR / 'targeted-author-remediation.exact-input-output.freeze.json'),
    'all6AuthorBindingsExact': True, 'wholeSelected20GoalsStillCurrent': True,
    'actuallyReReadWholeCases': ['flora-fauna20-09-case-1', 'flora-fauna20-09-case-2', 'flora-fauna20-10-case-1', 'flora-fauna20-10-case-2'],
    'actuallyReReadLocales': ['de', 'en'], 'wholeProfilesActuallyRechecked': 2,
    'unchangedOtherWholeCases': 36, 'unchangedOtherProfileBodies': 18,
    'unchanged18PriorScientificPassesRetained': True,
    'conditionalFishInputUnchangedBinding': binding(ORIGINAL / 'materials-scope-precision-v2/two-explicit-conditional-fish-choice-alternatives.author-v2.json'),
    'sourceChoiceDissentExactlyRetained': True,
    'currentSourceReferenceSections': ['HE G9 5.4 printed12', 'HE G9 6.2 printed14'],
    'priorActualWholePrimaryReadingRetained': binding(A / 'actual-primary-whole-section-reading.independent-a.receipt.json'),
    'verdicts': verdicts,
    'nativeTargetedPCheckActuallyExecuted': {'command': 'npm --prefix app run quality:positive-goal-evidence:check -- --config=' + str((D / 'P2.exact-targeted.native.config.json').relative_to(ROOT)), 'exitCode': 0, 'configuredGoals': 2, 'needsHumanReview': 2, 'approved': 0, 'blockingIssues': 0},
    'candidateProfileStatus': 'ai_candidate/needs_human_review/E1/G1',
    'wholeScientificCandidateStateAfterTargetedRecheck': 'D20KEEP/P20PASS scientific preimage only; no final raster/page/profile integration claim',
    'originalHoldArtifactsPreserved': True, 'peerRecheckReadBeforeOwnVerdict': False,
    'activeWrites': 0, 'strictClosuresClaimed': 0, 'humanApproval': False,
})
write('targeted-v3.independent-a.final.freeze.json', {
    'schemaVersion': 1, 'artifactKind': 'independent-a-targeted-four-whole-case-followup-seal',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'frozenFiles': [binding(p) for p in [D / 'targeted-four-whole-cases-two-profiles.independent-a.actual.json', D / 'P2.current-author-rows.exact.input.jsonl', D / 'P2.exact-targeted.native.config.json', D / 'record-targeted-four-case-recheck.independent-a.py']],
    'originalFirstHoldSealPreserved': True, 'resolvedOwnFindings': [v['originalFindingId'] for v in verdicts],
    'peerRecheckReadBeforeOwnVerdict': False,
    'activeWrites': 0, 'strictClosuresClaimed': 0, 'humanApproval': False,
})
print('Independent A targeted followup sealed: P09/P10 substantively resolved; unchanged18/36 retained; no strict closure or human approval.')
