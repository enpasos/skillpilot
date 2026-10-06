# SPDX-License-Identifier: Apache-2.0
"""Persist manually read P/A/M/V findings with exact foreign inputs."""
from pathlib import Path
import datetime
import hashlib
import json

OWN = Path(__file__).resolve().parent
BASE = OWN.with_name('biologie-q1-bacterial-structure-fission-native-candidate-v1')
ISO = Path('tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1')
incoming = json.loads((BASE / 'positive-evidence.candidates.json').read_text())
batch = next((BASE / 'native-finalbook/round-b/batches').glob('*.input.jsonl'))
goals = {row['goal']['goalId']: row['goal'] for row in map(json.loads, batch.read_text().splitlines())}
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
decision_rows = []
own_candidates = {'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1', 'reviewId': 'biologie-bacterial-structure-fission-root-independent-p-20261005-v1', 'reviewedAt': now, 'reviewer': 'Codex root independent current scientific P reviewer, not profile author', 'goals': []}
manual = {
    '5b2571d9-f079-52b2-b21b-8f389c7409f4': {
        'p': 'PASS der zwei DE/EN-Erwartungen und zwei tatsächlich gelesenen frischen Fälle: Membran/Zellplasma/Ribosomen sind vom genetischen Material getrennt, das Chromosom liegt ohne membranumhüllten Kern im Zellraum. Optionales Plasmidmaterial ist zusätzliche DNA, keine universelle Eigenschaft; die plasmidfreie Gegenvariation bleibt ein Bakterium. Die dargestellte DNA allein beweist keine Genexpression. Modell und gegebene Hinweise tragen Strukturvergleich und die frische Gegenvariation, keine isolierte Benennung oder erfundene tatsächliche Leistung. Beide Erwartungs-IDs sind erforderlich, E1/G1 und needs_human_review bleiben zutreffend.',
        'a': 'atomic: Grundbauplan darstellen und DNA im selben gegebenen bakteriellen Schema verorten sind eine einheitliche Struktur-/Modellkompetenz. Vermehrung wird nicht gestrichen, sondern im eigenständigen folgenden Atom erhalten. Keine ganze virale, stoffwechselbezogene oder gentechnische Umbrellakompetenz wird mitgezählt.',
        'm': 'no_memory_needed: Gegebene Schemata mit erklärter Legende und bereitgestellten Strukturhinweisen tragen Zuordnung, optionale Plasmidunterscheidung und Transfer; es wird kein eigenständiger ungestützter Anatomiekatalog verlangt. Keine erforderlichen Karten oder vorhandenen Memory-Ziele werden entfernt oder neue erfunden.',
        'v': 'KEEP/PASS: Tatsächlicher Originalvergleich und tatsächlich betrachtete 360/680-Pixel-Ansichten zeigen klar getrennte Wand/Membran, Zellraum/Ribosomen, Chromosom ohne Kern und kleine optionale DNA-Ringe. Die beiden Einschränkungen im Bild und vollständiger Alttext passen zum gegebenen Modell. Hauptmotiv und entscheidende Unterscheidung bleiben bei 360 Pixeln erkennbar; PNG 1672×941, freundlich comicartig. Vorhandenes gutes Bild bleibt unverändert, unabhängig vom Generator.',
    },
    '49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd': {
        'p': 'PASS der einen kohärenten DE/EN-Erwartung und zwei tatsächlich gelesenen neuen Fälle: Chromosomkopie, Verteilung und Trennung erklären die Entstehung zweier Zellen; keine Kernmitose wird eingeführt. Der materialgestützt unterbrochene und wiederaufgenommene Kopiervorgang verlangt einen begründeten Prozess-Transfer und trennt bloßes Zellwachstum von erfolgreicher Zweiteilung. Der Modellfall behauptet keine tatsächliche experimentelle Beobachtung. Optionales 1→2→4 ist ausdrücklich keine erforderliche Populationskompetenz und schließt weder BY-exponentielles Wachstum noch ST-Kulturkurven. E1/G1, AI-Kandidat und needs_human_review bleiben wahrheitsgemäß.',
        'a': 'atomic: DNA-Kopie, Verteilung und Trennung sind Stationen desselben erklärten Zweiteilungsmodells. Die Stationen erfordern hier keine zusätzliche vollständige molekulare Replikations- oder Mitosekompetenz. Optionaler Zählhinweis erweitert den verpflichtenden Scope nicht. Der neue Begleiter erhält die zuvor mit Zellbau gebündelte echte Reproduktionsleistung.',
        'm': 'no_memory_needed: Vorgegebene neue Stadien und der materialgestützt kontrollierte Modellbefund ermöglichen Prozessordnung und kausalen Transfer. Kein ungestützter molekularer Replikationskatalog oder verpflichtende quantitative Populationsformel wird vorausgesetzt. Erforderliche bestehende Karten/Memory-Ziele bleiben unverändert.',
        'v': 'KEEP/PASS: Tatsächlich im Original und bei 360/680 Pixeln betrachtetes PNG zeigt eine DNA-Darstellung, zwei kopierte/getrennte in der eingeschnürten Zelle und zwei getrennte Zellen mit je einem Chromosom. Pfeile und drei große Felder tragen den ganzen Ablauf, ohne Kern oder Mitose. Vereinfachtes Modell ist ausdrücklich sichtbar und im Alttext richtig begrenzt. Bei 360 Pixeln bleiben DNA-Zahl und Zelltrennung klar erkennbar. PNG 1672×941, freundlich comicartig; vorhandene exakt gleiche Pixel werden behalten, keine Erzeugung als Freigabe.',
    },
}
for source in incoming['goals']:
    gid = source['goalId']
    assert gid in manual
    goal = goals[gid]
    pixel = ISO / 'app/public/assets/goal-visualizations/biologie' / gid / (gid + '.png')
    pixel_sha = 'sha256:' + hashlib.sha256(pixel.read_bytes()).hexdigest()
    assert pixel_sha == goal['reviewContext']['page']['visualization']['originalDigest']
    profile_sha = 'sha256:' + hashlib.sha256(json.dumps(source['profile'], ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    own_candidates['goals'].append({'goalId': gid, 'reason': manual[gid]['p'], 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'dissent': [], 'profile': source['profile']})
    decision_rows.append({
        'goalId': gid, 'currentGoalFingerprint': goal['goalFingerprint'], 'currentPageFingerprint': goal['pageFingerprint'],
        'foreignAuthorInnerProfileSHA256': profile_sha,
        'innerProfileDigestAlgorithm': 'UTF8 JSON sorted keys, compact separators, ensure_ascii=False; own equality witness, not a substituted native digest',
        'foreignAuthorInnerProfileChanged': False,
        'positiveDecision': 'PASS', 'positiveReason': manual[gid]['p'], 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
        'authority': 'ai_candidate', 'humanReviewStatus': 'needs_human_review',
        'atomicityDecision': 'atomic', 'atomicityReason': manual[gid]['a'],
        'memoryDecision': 'no_memory_needed', 'memoryReason': manual[gid]['m'], 'cardsOrMemoryGoalsRemoved': False,
        'visualDecision': 'KEEP/PASS', 'actualPixelSHA256': pixel_sha, 'visualReason': manual[gid]['v'],
        'actualOriginalImagePath': str(pixel),
        'actuallyReadResizedViews': [str(OWN / (gid + '-actual-' + str(width) + '.png')) for width in [360, 680]],
        'actualAltText': goal['reviewContext']['page']['visualization']['altText'],
        'actualCurrentSourceSHA256': 'sha256:285b83ba2bf6f4776acc4d38ab42172b1cdabdd173a215d8b55b8883923ecc38',
        'generationClaim': 'No new generation in this review; existing pixels and their original provenance are retained.',
        'humanApproved': False,
    })
for name, data in [
    ('positive-evidence.independently-reviewed.candidates.json', own_candidates),
    ('independent-p-a-m-v-scientific-decisions.json', {'reviewedAt': now, 'reviewer': '/root independent current scientific reader, not current text or P author', 'rows': decision_rows, 'openFindings': [], 'learnerPerformanceObserved': False, 'humanApproval': False, 'newStrictClosuresBeforeIntegration': 0, 'nativeFinalP_AM_VMaterializationStillRequired': True}),
]:
    path = OWN / name
    assert not path.exists()
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
print('Serialized 2 manually read current independent P/A/M/V decisions; native final integration checks remain required.')
