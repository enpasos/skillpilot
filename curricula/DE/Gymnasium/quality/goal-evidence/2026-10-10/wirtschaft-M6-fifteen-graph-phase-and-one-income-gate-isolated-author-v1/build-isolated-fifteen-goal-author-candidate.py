"""Build the explicitly authorized inert candidate; never write active inputs."""
from copy import deepcopy
from datetime import datetime, timezone
from fractions import Fraction
from hashlib import sha256
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
CAN = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
EXPECTED = '237c9bfd2730d916e5e1a453eeb0822113a8a48d2391f8e721c6e693edc6f452'
REGISTRY = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
BOOK = ROOT / 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE-correct-primary-EQ-source-and-scope-author-v3/source-extraction/DE_BE_WIRTSCHAFT_SEKII_BERLIN2006_EP2010_AB2022.author-v3.source-extraction.json'
PRIMARY = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-BE-correct-primary-EQ-source-and-scope-author-v1/primary-archive/current2022-official-standards-and-content.web-actual.txt'
LOG = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-M6-stable-layerA-book-build-root-v1/current-native-registry-singular-atomicity-key-run-v2/graph.stdout.txt'

Q_REASONS = {
 'a6a8bf1a-a131-5f17-9113-02a1321899e4': 'Volkswirtschaftliche Fragestellungen: allgemeiner GK-Abschlussstandard in BE Kapitel 3.2, kein belegtes einzelnes Kurshalbjahr.',
 'eee603d5-61d0-58e2-8f74-16de1e311630': 'Mikro-/Makroebenen: allgemeiner GK/LK-Abschlussstandard in BE Kapitel 3.2, keine Q1-Q4-Terminbehauptung.',
 'df8db4bd-4e79-5ce1-bd4a-3ed04b17c6fb': 'Eigene Modellannahmen: übergreifender BE-Abschlussstandard zu Argumentationsketten; Originalkurs-/Quellenbindungen bleiben unverändert.',
 'b1d7f1ab-371b-5e02-acb3-49f3938b2ba6': 'Informationsrecherche: fachübergreifende Methodenanforderung des BE-Abschlussstandards 3.2, nicht an ein Halbjahr gebunden.',
 'd76af11e-7fb3-5e81-a622-9f3642efedaf': 'Untersuchungsfragen: eigenständiger Methodenanteil des allgemeinen BE-Abschlussstandards, keine erfundene Semesterzuweisung.',
 'a04fc1a7-e037-580e-9324-9282f4acebc1': 'Hypothesen: eigenständiger Methodenanteil desselben BE-Abschlussstandards, keine erfundene Semesterzuweisung.',
 '943fd59c-661a-5163-b5a4-c6bb5a983855': 'Kritik eigener Ergebnisse: allgemeine BE-Ergebnisdarstellungskompetenz, keine belegte einzelne Q-Teilphase.',
 'b9a46f8e-9732-5bbc-8989-a8f1bf1c7ba0': 'Wirtschaftlicher Dialog: allgemeine BE-Ergebnisdarstellungskompetenz, keine belegte einzelne Q-Teilphase.',
 '4c9b844f-a5fb-595b-935f-27cbc66610ae': 'Politische Machtbedingungen: allgemeiner BE-LK-Abschlussstandard, Original-LK- und Quellenrolle unverändert.',
 '8dcc6254-214c-5d3c-9d74-821b3e8091bd': 'Enger Abrufanker zum allgemeinen Untersuchungsebenen-Ziel eee603d5; Deck, Karten, Origins und Pflichtentscheidungen bleiben unverändert.',
 'e44af438-b41e-5142-acd5-5b9922ba7a59': 'Ganzes Untersuchungsmaterial bündelt sechs übergreifende BE-Methodenleistungen; SekII bezeichnet den tatsächlichen breiten Kompatibilitätsbereich, kein zusätzliches Lernziel.',
 '86b0ed9d-3809-5402-92ad-89c2f9cbbe76': 'Fachfreie GK-Navigation über sieben verschiedene Abschlussmaterialien; sie hat keine einzelne fachliche Semesterleistung und keinen neuen Quellenanspruch.',
}
MIXED = {
 '96182c38-9047-509a-bf0e-6aeb3776bba0': 'Ganzes Material bewertet eigene Projektmodelle und Verantwortung aus E sowie beide b215-Zielbeziehungsfälle aus Q2. Die echte geprüfte Q2-Voraussetzung bleibt; der ausschließlich E behauptende Kompatibilitätswert und Titelpräfix werden berichtigt.',
 '9f234592-2e3f-58c0-aa1a-e5971818c447': 'Ganzes Material prüft E-Marktmodelle und in beiden Fällen drei Preisfunktionen, dezentralen Vergleich und Grenzen aus 3bcb/Q1. Die echte Q1-Voraussetzung bleibt; der ausschließlich E behauptende Kompatibilitätswert und Titelpräfix werden berichtigt.',
}
INCOME = 'c6f05990-4c2d-56ce-9412-3a4a4bcfc488'
FLOW = '641dee8e-9658-5db1-89eb-2353f8322a8a'
ORIENT = '6bf2d1cc-e745-50dd-a617-71c06a6c6945'

def rawhash(data):
 return sha256(data).hexdigest()

def canonical_bytes(data):
 return json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode()

def write(name, data):
 path = OUT / name
 if path.exists():
  raise RuntimeError(f'Immutable output already exists: {path}')
 path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
 return path

def binding(path):
 return {'path': str(path.relative_to(ROOT)), 'sha256': rawhash(path.read_bytes()), 'bytes': path.stat().st_size}

baseline = CAN.read_bytes()
assert rawhash(baseline) == EXPECTED
before = json.loads(baseline)
assert len(before['goals']) == 678
after = deepcopy(before)
old = {g['id']: g for g in before['goals']}
new = {g['id']: g for g in after['goals']}
changed = set(Q_REASONS) | set(MIXED) | {INCOME}
assert len(changed) == 15
for goal_id in Q_REASONS:
 goal = new[goal_id]
 assert goal['dimensionTags']['phase'] == 'Q'
 goal['dimensionTags']['phase'] = 'SekII'
 if 'phase' in goal:
  assert goal['phase'] == 'Q'
  goal['phase'] = 'SekII'
for goal_id in MIXED:
 goal = new[goal_id]
 assert goal['dimensionTags']['phase'] == goal['phase'] == 'E'
 goal['dimensionTags']['phase'] = goal['phase'] = 'SekII'
 for key in ('title', 'titleEn'):
  assert goal[key].startswith('E: ')
  goal[key] = goal[key][3:]
assert new[INCOME]['requires'] == [FLOW]
new[INCOME]['requires'] = [ORIENT]
assert new[INCOME]['dimensionTags']['phase'] == old[INCOME]['dimensionTags']['phase'] == 'E'

def deltas(a, b, prefix=''):
 if a == b:
  return []
 if isinstance(a, dict) and isinstance(b, dict) and a.keys() == b.keys():
  return [item for key in a for item in deltas(a[key], b[key], prefix + '/' + key)]
 return [{'field': prefix, 'before': a, 'after': b}]

rows = []
for goal_id in [*Q_REASONS, *MIXED, INCOME]:
 actual = deltas(old[goal_id], new[goal_id])
 allowed = {'/dimensionTags/phase', '/phase'} if goal_id in Q_REASONS else ({'/dimensionTags/phase', '/phase', '/title', '/titleEn'} if goal_id in MIXED else {'/requires'})
 assert {r['field'] for r in actual} <= allowed
 reason = Q_REASONS.get(goal_id, MIXED.get(goal_id, 'Beide vollständigen Nationaleinkommens-P-Fälle sind ohne Beherrschung des ganzen Kreislaufziels lösbar; das separate ganze Gegenwerk zeigt die engere Mindestleistung. Die Quelle E bleibt unverändert, nur der überbreite Vollziel-Gate wird durch die fachfreie Orientierung ersetzt.'))
 rows.append({'goalId': goal_id, 'reasonDe': reason, 'allowedFieldPaths': sorted(allowed), 'actualDeltas': actual, 'wholeBefore': old[goal_id], 'wholeAfter': new[goal_id], 'wholeBeforeObjectSha256': rawhash(canonical_bytes(old[goal_id])), 'wholeAfterObjectSha256': rawhash(canonical_bytes(new[goal_id])), 'disposition': 'AUTHOR_candidate_pending_independent_review'})
other = set(old) - changed
assert len(other) == 663
assert all(canonical_bytes(old[i]) == canonical_bytes(new[i]) for i in other)
assert len(deltas(before, after)) == 1  # the only changed top-level member is goals
assert sum(len(r['actualDeltas']) for r in rows) == 23

source = json.loads(SOURCE.read_text())
source_goals = {g['id']: g for g in source['sourceGoals']}
source_rows = []
for goal_id in list(Q_REASONS)[:9]:
 source_id = old[goal_id]['extendedData']['provenance']['sourceGoalId']
 source_goal = source_goals[source_id]
 assert source_goal['phase'] == 'Q' and source_goal['stage'] == 'SekII'
 assert old[goal_id]['sourceRef'] == new[goal_id]['sourceRef']
 assert old[goal_id]['extendedData']['provenance'] == new[goal_id]['extendedData']['provenance']
 source_rows.append({'canonicalGoalId': goal_id, 'actualWholeSourceGoal': source_goal, 'originalSourcePhaseRetained': 'Q', 'sourceLocatorRetained': source_goal['sourceLocator']})
income_source = source_goals[old[INCOME]['extendedData']['provenance']['sourceGoalId']]
assert income_source['phase'] == 'E'

book = json.loads(BOOK.read_text())
profile_ids = {INCOME, FLOW, 'b215bd82-2b6b-5b00-8a0b-85c7ff249bc2', '3bcb976d-3e45-5c62-81ac-5ed909df202b'}
profiles = []
profile_paths = []
for relative in book['evidenceReviewPaths']:
 path = ROOT / relative
 profile_paths.append(path)
 for line in path.read_text().splitlines():
  record = json.loads(line)
  if record['goalId'] in profile_ids:
   profiles.append(record)
assert {r['goalId'] for r in profiles} == profile_ids

counter = {
 'documentType': 'whole-current-income-P2-author-counterwork-and-minimum-prerequisite-analysis',
 'authority': 'AUTHOR_analysis_only; no independent KEEP, grading of a learner, or native acceptance claimed',
 'goalId': INCOME,
 'wholeCurrentGoal': old[INCOME],
 'wholeProposedGoal': new[INCOME],
 'wholeOldRequiredGoal': old[FLOW],
 'wholeOrientationGoal': old[ORIENT],
 'wholeUnmodifiedOriginalPositiveRecords': profiles,
 'caseAWholeAnswerDe': 'Das Material definiert das Volkseinkommen hier als Netto-Primäreinkommen der Inländer zu Faktorkosten; Kapitalverzehr ist bereits berücksichtigt. Arbeitnehmerentgelt aus dem Inland 420 Mio. Euro und aus dem Ausland 80 Mio. Euro sowie Unternehmens-/Vermögenseinkommen aus dem Inland 110 Mio. Euro und aus dem Ausland 40 Mio. Euro sind sämtlich Einkommen der Inländer. Also 420 + 80 + 110 + 40 = 650 Mio. Euro. Die beiden Auslandsbeträge gehören wegen des Inländerbezugs dazu; der Ort ihrer Entstehung ist hier kein Ausschlussgrund. Die 70 Mio. Euro Sozialtransfers verteilen Einkommen um und sind kein zusätzlich entstandenes Primäreinkommen; die 90 Mio. Euro neuen Bankkredite sind Finanzierung und kein zusätzlicher Einkommensbestandteil. Daher addiere ich diese 160 Mio. Euro nicht. Aus dieser Definition folgt weder Gleichheit mit dem BIP noch eine weitere Brutto-/Netto-Umrechnung. Die vorhandene Netto-/Faktorkostenbasis wird verwendet.',
 'caseBWholeAnswerDe': 'Die 900 Mio. Euro umfassen im Inland entstandenes Primäreinkommen. Für dieselbe im Material definierte Netto-Faktorkostengröße der Inländer ziehe ich die darin enthaltenen 120 Mio. Euro Einkommen der Gebietsfremden ab und ergänze 180 Mio. Euro Primäreinkommen der Inländer aus dem Ausland: 900 - 120 + 180 = 960 Mio. Euro. Die Maschinenzahlung von 50 Mio. Euro ist als Investitionskauf und gerade nicht als weiterer Einkommensbestandteil ausgewiesen; sie wird nicht noch einmal zur vorgegebenen Einkommenssumme addiert. Fall A liefert bereits passende Inländerbestandteile, Fall B zuerst ein Inlandsaggregat, das ich um die grenzüberschreitenden Empfängerbeträge berichtige. Beide Datenaufbauten setzen dieselbe erklärte Inländer- und Einkommensdefinition um, ohne doppelte Zählung.',
 'minimumKnowledgeActuallyUsedDe': ['Die bereitgestellte Inländer-/Netto-/Faktorkostendefinition lesen und konsistent anwenden.', 'Die bezeichneten Arbeitnehmer- und Unternehmens-/Vermögenseinkommen zuordnen und addieren/subtrahieren.', 'Primäreinkommen von Umverteilung, Kreditfinanzierung und einem ausdrücklich separat bezeichneten Investitionskauf unterscheiden.', 'Inlandsentstehung und Inländerempfang anhand der angegebenen Empfängerbezüge trennen.'],
 'whole641NotUniversallyDemonstratedDe': ['Keine vollständige sektorale Zeichnung realer Ströme und finanzieller Gegenströme.', 'Keine Sammlung von Haushalts-, Staats- und Unternehmensersparnis im Vermögensänderungskonto und keine Darstellung der realen Vermögensbildung.', 'Keine eigenständige bedingte Ursache-Wirkungskette 20 -> 12 -> 9 und keine Modellantwort auf importierte Steuerungskomponenten.', 'Keine Verpflichtung, vollständige Kreislaufmodell-Mastery oder dessen ganze positive Fallvariation vor dieser definierten Aggregationsaufgabe nachzuweisen. Fachliche Verwandtschaft bleibt bestehen; sie beweist keine universelle Vollziel-Voraussetzung.'],
 'sourceRoleBoundary': 'Original BE source aspect E.CIRCULATION and sourceGoal phase E stay exact; no source mapping, coverage, curricular goal universe or assessment coverage is rewritten.',
 'proposedRequiresMeaning': 'Orientation before content; no subject mastery, knowledge test, or source proof inferred from orientation.',
 'arithmeticChecks': {'caseA': str(Fraction(420) + 80 + 110 + 40), 'excludedA': str(Fraction(70) + 90), 'caseB': str(Fraction(900) - 120 + 180)},
 'notAWholeGoalScienceRestart': True,
}
assert counter['arithmeticChecks'] == {'caseA': '650', 'excludedA': '160', 'caseB': '960'}

original = OUT / 'whole-current678-exact-active237c-BEFORE.json'
assert not original.exists()
original.write_bytes(baseline)
candidate = write('whole-current678-fifteen-bounded-graph-phase-and-income-gate.INERT-AUTHOR-candidate.json', after)
delta = write('actual-fifteen-whole-before-after-goal-deltas-and-individual-author-reasons.json', rows)
counterpath = write('actual-two-whole-income650-and960-P-counterworks-and-minimum-prerequisite-analysis.AUTHOR.json', counter)
sourcepath = write('actual-nine-original-BE-source-Q-contracts-and-income-source-E-exact-retained.json', {'originalExtraction': binding(SOURCE), 'actualNineWholeSourceRows': source_rows, 'wholeIncomeSourceRowRetained': income_source, 'sourceInputsUnchanged': True})
guardpath = write('actual-663-other-whole-goal-object-endguards-and-no-other-field-change.json', {'serialization': 'UTF-8 JSON, ensure_ascii=False, separators=(comma,colon), original insertion order retained', 'actual663Rows': [{'goalId': i, 'beforeObjectSha256': rawhash(canonical_bytes(old[i])), 'afterObjectSha256': rawhash(canonical_bytes(new[i]))} for i in old if i in other], 'all663Exact': True, 'allBeforeAfterDescriptionExamDataSourceRefResourcesTagsExact': all(all(old[i].get(k) == new[i].get(k) for k in ('description','descriptionEn','examData','sourceRef','resourceLinks','tags','contains','applicability','extendedData')) for i in old), 'actualFieldDeltaCount': 23, 'requiresChanges': [INCOME], 'statusChanges': 0, 'canonicalGoalCountBeforeAfter': [678,678]})
inputs = [CAN, REGISTRY, BOOK, SOURCE, PRIMARY, LOG, ROOT/'app/scripts/validateGraph.ts', ROOT/'app/src/goalTypes.ts', ROOT/'docs/qa-ci/graph-validation-rules.md', ROOT/'docs/concept/skill-graph/general-goal-system-and-migration.md', *profile_paths]
frozen_inputs = [binding(p) for p in inputs]
assert CAN.read_bytes() == baseline
assert all(binding(ROOT / b['path']) == b for b in frozen_inputs)
handoff = write('actual-final-fifteen-goal-graph-phase-and-one-income-gate-inert-AUTHOR.handoff.json', {
 'documentType': 'isolated-fifteen-goal-graph-phase-and-income-gate-author-handoff',
 'at': datetime.now(timezone.utc).isoformat(),
 'authority': 'AUTHOR candidate only; independent Root qualification and native follow-up pending',
 'wholeBefore': binding(original), 'wholeAfter': binding(candidate),
 'wholeGoalDeltaIndex': binding(delta), 'wholeIncomeCounterworks': binding(counterpath),
 'wholeSourceQAndERetained': binding(sourcepath), 'wholeOther663Endguards': binding(guardpath),
 'originalCurrentInputEndguards': frozen_inputs,
 'actualOriginalGraphFindings': {'invalidPhaseQ': 12, 'GVR002LaterPhase': 3, 'errors': 15, 'warnings': 0},
 'actualProposedFieldDeltas': {'dimensionTagsPhase': 14, 'rawPhase': 4, 'bilingualTitlePrefix': 4, 'incomeRequires': 1, 'total': 23},
 'canonicalPhaseContract': {'allowedSekII': True, 'QNotAllowed': True, 'converterPrefersDimensionTagsPhase': True, 'metadataBroadStageNoInventedSemester': True},
 'primaryReadLocator': {'url': source['sourceDocument']['url'], 'actualOfficialPdfPagesZeroBased': [7,16,17,18,19,20], 'selectedFreshWebRead': 'Actual official PDF opened during this author analysis; E national-income requirement and general chapter3.2 end-of-qualification standards read. No new source approval or whole PDF science release claimed.'},
 'phaseOriginalSourcesAndPlacementsRemainUnchanged': True,
 'authorNativeGraphPassClaimed': False, 'authorNativeSourceOrScopePassClaimed': False,
 'requiresIndependentScientificQualification': [INCOME],
 'historicalBodyScienceReopened': False,
 'activeWrites': 0, 'newReviewRecords': 0, 'newReleaseDecisions': 0, 'strictNetGain': 0,
 'integrationRule': 'Root must integrate only the listed exact23 fields after independent qualification and current source/scope/FP guards; never overwrite active CAN with the whole inert candidate.',
})
print(json.dumps({'handoff': binding(handoff), 'candidate': binding(candidate), 'actual23Fields15Goals': True, '663OtherWholeGoalsExact': True, 'activeInputEndguards': len(inputs), 'nativeChecksRun': 0, 'activeWrites': 0}, ensure_ascii=False))
