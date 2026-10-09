# SPDX-License-Identifier: Apache-2.0
"""Actual protocol repair: define independent plants and record nested leaf units."""
from pathlib import Path
import json, hashlib, copy, subprocess, datetime

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
SOURCE = BASE / 'biologie-evolution-eighteen-seven-source-course-remediation-author-v1'
A_FIRST = BASE / 'biologie-evolution-seven-source-course-successors-independent-a-v1/seven-source-course-successors.independent-A.science-FIRST.json'
A_SEAL = BASE / 'biologie-evolution-seven-source-course-successors-independent-a-v1/seven-source-course-successors.independent-A.science-FIRST.freeze.json'
PROTOCOLS = SOURCE / 'material/five-source-faithful-executable-method-protocols.author-candidate.json'
PDF = ROOT / 'curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
if (OWN / 'ST-natural-variation-sampling.input-FIRST.freeze.json').exists():
    NOW = json.loads((OWN / 'ST-natural-variation-sampling.input-FIRST.freeze.json').read_text())['createdAt']


def bind(path):
    assert path.is_file() and not path.is_symlink()
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(relative, value):
    path = OWN / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    data = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    if path.exists():
        assert path.read_bytes() == data, 'Previously bound artifact differs: ' + str(path)
    else:
        path.write_bytes(data)
    return bind(path)


def read(path):
    return json.loads(path.read_text())


assert bind(A_SEAL)['sha256'] == 'sha256:6a76bdf20782921aadba4002ec0c0372ea2791f5b2413525dd5505ede30e9fcf'
finding = next(row for row in read(A_FIRST)['findings'] if row['findingId'] == 'EVO7S-A-METHOD-003')
assert bind(PDF)['sha256'] == 'sha256:58b106c65a71478a096f31cf8e9743a238a59aec085414ac472ee0ab5da10c38'
write('ST-natural-variation-sampling.input-FIRST.freeze.json', {'schemaVersion': 1, 'createdAt': NOW,
    'inputs': [bind(path) for path in [A_FIRST, A_SEAL, PROTOCOLS, PDF]], 'actualFinding': finding, 'activeWrites': 0})
argv = ['pdftotext', '-layout', '-f', '44', '-l', '45', str(PDF.relative_to(ROOT)), '-']
result = subprocess.run(argv, cwd=ROOT, capture_output=True, check=True)
primary = write('primary/ST-current2022-physical44-45.actual.txt', result.stdout)
assert 'Naturobjekten' in result.stdout.decode() and 'Variabilität' in result.stdout.decode()
whole = read(PROTOCOLS)
candidate = copy.deepcopy(whole)
old = whole['methodProtocols'][1]
new = candidate['methodProtocols'][1]
assert old['methodId'] == 'ST-natural-variation-observe'
new['materialsDe'] = ['Zwei vorab festgelegte Stellen mit möglichst je zehn verschiedenen, sicher bestimmten Pflanzen derselben häufigen Art; Messung vorzugsweise am Ort',
    'Lineal, vorab erstellte Liste geeigneter Pflanzen und festgelegte Zufallsauswahlregel',
    'leere Tabelle: Stelle, Pflanzen-ID, Blatt-ID, Reife/Position des Blatts, Länge, Breite, Fraßspuren, Unsicherheit, Auswahlregel']
new['materialsEn'] = ['Two predefined sites with preferably ten different confidently identified plants of the same common species at each; preferably measure in place',
    'ruler, predefined eligible-plant list and documented random selection rule',
    'blank table: site, plant ID, leaf ID, leaf maturity/position, length, width, feeding traces, uncertainty, selection rule']
new['samplingDesignDe'] = 'Primäre Stichprobeneinheit ist eine räumlich unterscheidbare Pflanze, nicht ein beliebiges Blatt. Je Stelle möglichst zehn nach der vorab festgelegten Regel zufällig ausgewählte Pflanzen; pro Pflanze ein nach einheitlicher Reife-/Positionsregel ausgewähltes Blatt als Merkmalsmessung. Pflanzen erhalten eindeutige Stellen-/Pflanzen-IDs; genetische Unabhängigkeit insbesondere klonaler Pflanzen ist damit nicht bewiesen.'
new['samplingDesignEn'] = 'The primary sampling unit is a spatially distinct plant, not an arbitrary leaf. Preferably select ten plants per site randomly under a predefined rule; measure one leaf per plant using a consistent maturity/position rule. Assign unique site/plant IDs; this does not establish genetic independence, particularly for clonal plants.'
new['procedureDe'] = [
    'Vor Messbeginn Artbestimmung, zwei Stellen, geeignete Pflanzen, Maßeinheiten, Blattreife/-position und Auswahlregel festlegen. Tiere/Pflanzen am Ort zusätzlich beobachten und Fundorte protokollieren.',
    'Räumlich verschiedene geeignete Pflanzen listen und je Stelle nach der dokumentierten Zufallsregel möglichst zehn verschiedene Pflanzen auswählen. Jede Pflanze eindeutig kennzeichnen, etwa O1-P01. Tatsächliche Stichprobengröße und Ausfälle protokollieren; fehlende Pflanzen nicht durch weitere Blätter derselben Pflanze als neue Individuen ersetzen.',
    'Pro ausgewählter Pflanze genau ein vergleichbares Blatt nach der vorab festgelegten Blattregel messen; Blatt-ID mit Pflanzen-ID verknüpfen. Beschädigungen und nicht messbare Teile dokumentieren, nicht nach Ergebnis heimlich aussortieren. Zusätzliche Blätter derselben Pflanze sind verschachtelte Wiederholungen und keine unabhängigen Pflanzen.',
    'Länge/Breite messen, sichtbare Fraßspuren nach dem angegebenen Kriterium erfassen und Unsicherheiten markieren. Rohdaten enthalten für jede Messung Stelle, Pflanzen-ID, Blatt-ID und Blattreife/-position.',
    'Rohdaten, Spannweite und Lage der gemessenen Blattmerkmale getrennt je Stelle darstellen. Das ermöglicht einen begrenzten Vergleich dieser Blattmerkmale zwischen den tatsächlich beprobten Pflanzen, nicht automatisch eine Aussage über vollständige Pflanzen, Erblichkeit oder allgemeine Artmerkmale. Innerartliche Variation nicht mit Artenvielfalt verwechseln.',
    'Die beiden beobachteten Stellen deskriptiv vergleichen. Genetische Ursache, Umwelteinfluss und Selektion sind aus Blattmaßen allein nicht bewiesen; zwei Stellen sind keine unabhängigen Replikate einer allgemeinen Standortwirkung. Bei zu kleiner oder nicht zufälliger Stichprobe die Aussage entsprechend begrenzen.'
]
new['procedureEn'] = [
    'Before measurement define the species, two sites, eligible plants, units, leaf maturity/position and selection rule. Also observe organisms at the sites and record the locations.',
    'List spatially distinct eligible plants and preferably select ten different plants per site with the documented random rule. Give every plant a unique ID such as S1-P01. Record the actual sample size and missing observations; do not replace missing plants with additional leaves of the same plant as new individuals.',
    'Measure exactly one comparable leaf per selected plant using the predefined leaf rule and link leaf ID to plant ID. Record damage and unmeasurable parts without silently excluding results. Extra leaves from one plant are nested repeats, not independent plants.',
    'Measure length/width, record visible feeding traces using the specified criterion and flag uncertainty. Every raw observation includes site, plant ID, leaf ID and leaf maturity/position.',
    'Display raw data, spread and location separately for each site. This permits a bounded comparison of measured leaf traits among the sampled plants, not automatic claims about complete plants, heritability or general species traits. Do not confuse within-species variation with species diversity.',
    'Compare the two observed sites descriptively. Leaf dimensions alone do not prove genetic cause, environmental effect or selection; two sites are not independent replicates of a general site effect. Limit conclusions if the sample is too small or not random.'
]
new['requiredActualEvidenceDe'] = ['natürliche Fundorte und tatsächlich unterscheidbare Pflanzen',
    'vorab festgelegte Pflanzen-/Blattauswahlregel und tatsächliche Stichprobengröße',
    'eigene Rohmessdaten mit Stellen-, Pflanzen- und Blatt-IDs, Blattreife/-position und Unsicherheiten',
    'Darstellung und begrenzte Auswertung der gemessenen Blattmerkmale; keine fingierten Messwerte']
new['requiredActualEvidenceEn'] = ['natural sites and actually distinct plants',
    'predefined plant/leaf selection rule and actual sample size',
    'own raw measurements with site, plant and leaf IDs, leaf maturity/position and uncertainty',
    'display and bounded evaluation of measured leaf traits; no invented measurements']
new['evaluationDe'] = 'Prüfen, dass natürlich beobachtet/gemessen wurde und jede zwischenpflanzliche Messung einer anderen dokumentierten Pflanze zugeordnet ist. Mehrere Blätter derselben Pflanze nicht als unabhängige Individuen zählen. Auswahlregel, tatsächliches n, fehlende Werte und Aussagegrenzen beurteilen; keinen verlangten Musterwert voraussetzen.'
new['evaluationEn'] = 'Verify actual natural observation/measurement and assign each between-plant measurement to a different documented plant. Do not count multiple leaves from one plant as independent individuals. Evaluate the selection rule, actual n, missing values and inference limits; do not demand a predetermined result.'
changes = [{'jsonPointer': '/methodProtocols/1/' + key, 'beforePresent': key in old, 'before': old.get(key), 'after': value}
    for key, value in new.items() if key not in old or old[key] != value]
masked = copy.deepcopy(candidate)
masked['methodProtocols'][1] = copy.deepcopy(old)
assert masked == whole and len(candidate['methodProtocols']) == 5
assert new['owners'] == old['owners'] and new['sourceDuty'] == old['sourceDuty']
assert new['blankPerformanceRecord'] == old['blankPerformanceRecord'] and new['actualLearnerPerformance'] is False
material = write('candidate/five-whole-method-protocols.ST-sampling-unit-real-successor.json', candidate)
write('ST-sampling-unit-exact-values-and-whole-masked-equality.actual.json', {'schemaVersion': 1,
    'original': bind(PROTOCOLS), 'successor': material, 'changes': changes,
    'maskedWholeFiveProtocolsExact': True, 'otherFourWholeProtocolsExact': True,
    'wholeNaturalObjectObserveDocumentEvaluateDutyPreserved': True, 'ownersSourceDutyAndBlankRecordExact': True,
    'actualGeneratedOrLearnerMeasurementRows': 0, 'canonicalGoalTextChanges': [], 'activeWrites': 0})
write('ST-natural-variation-sampling.author-science-FIRST.verdict.json', {'schemaVersion': 1,
    'createdAt': NOW, 'role': 'Bounded author protocol correction, not independent approval',
    'findingId': finding['findingId'], 'actualAFirst': bind(A_FIRST), 'actualAFirstSeal': bind(A_SEAL),
    'actualFullPrimaryPage': primary, 'primaryExtractionCommand': argv, 'actualCommandExit': result.returncode,
    'wholeBeforeProtocol': old, 'wholeCandidateProtocol': new,
    'authorFindingRemediation': 'Define spatially distinct plants as sampling units; record linked plant/leaf IDs and unbiased predefined selection; prevent leaf pseudoreplication and limit inference to measured leaf traits.',
    'independentResolution': 'PENDING', 'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review',
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'actualLearnerPerformance': False,
    'actualHumanExperimentPerformed': False, 'sourceOrNativeWholeApproval': False,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'activeWrites': 0})
print(json.dumps({'actualSamplingFieldsCorrected': len(changes), 'fiveProtocolsRetained': True,
    'blankActualPerformanceRecordRetained': True, 'independentFollowup': 'PENDING', 'strictGain': 0}))
