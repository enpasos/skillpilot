from pathlib import Path
from decimal import Decimal as D
import copy
import datetime
import hashlib
import importlib.util
import json
import subprocess
import jsonschema

ROOT = Path.cwd()
BASE = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-E-forty-nine-coherent-terminal-material-author-v1'
DELTA = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-E40-bounded-independent-findings-author-successor-v2'
def read(path):
    return json.loads(path.read_text())
def bind(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
def write(name, obj):
    path = BASE / name
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    assert read(path) == obj
    return bind(path)

filenames = [
    'whole-youth-public-law.DRAFT-terminal-goal.candidate.json',
    'whole-participation-migration-and-networks.DRAFT-terminal-goal.candidate.json',
    'whole-online-consumption-bias-and-ethics.DRAFT-terminal-goal.candidate.json',
    'whole-competition-platform-and-market-failure.DRAFT-terminal-goal.candidate.json',
]
delta_path = DELTA / 'whole-participation-migration-and-networks.only-two-solution-phrases.DRAFT-author-successor.json'
inputs = [AUTHOR / f for f in filenames] + [delta_path,
    AUTHOR / 'whole-nine-coherent-E40-materials.DRAFT-terminal-goals.candidate.json',
    AUTHOR / 'whole-inert-CAN416-only-nine-E40-DRAFT-and-existing-E-navigation.candidate.json',
    AUTHOR / 'actual-final-nine-E40-DRAFT-whole-material-P81-native-book-and-two-explicit-profile.handoff.receipt.json',
    DELTA / 'actual-first-bounded-unfounded-language-inference-two-solution-phrases.author-successor.receipt.json',
    ROOT / 'docs/landscape-runtime.schema.json',
    ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',
]
before = [bind(p) for p in inputs]
assert before[5]['sha256'] == '8e799cd2f995b8cca2c56b1f4317f0945a5670e78f943220c055be8f43102858'
assert bind(delta_path)['sha256'] == '7d460b3231db5219ac54f199b700a3022b130b11f644e90b9bba045941eea2f4'
originals = [read(AUTHOR / f) for f in filenames]
materials = copy.deepcopy(originals)
materials[1] = read(delta_path)
old, corrected = originals[1], materials[1]
old_without_solution, new_without_solution = copy.deepcopy(old), copy.deepcopy(corrected)
for key in ['solutionContent', 'solutionContentEn']:
    old_without_solution['examData'].pop(key)
    new_without_solution['examData'].pop(key)
assert old_without_solution == new_without_solution
assert 'Nuris Sprachstand ist nicht angegeben' in corrected['examData']['solutionContent']
assert 'Nuri’s language proficiency is unspecified' in corrected['examData']['solutionContentEn']

landscape = read(AUTHOR / 'whole-inert-CAN416-only-nine-E40-DRAFT-and-existing-E-navigation.candidate.json')
goals = {g['id']: g for g in landscape['goals']}
target_snapshot = [goals[gid] for g in materials for gid in g['examData']['coveredGoalIds']]
assert len(target_snapshot) == 19 and len({g['id'] for g in target_snapshot}) == 19
target_binding = write('whole-nineteen-current-target-contracts.for-four-materials.actual-independent-read.snapshot.json', target_snapshot)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
validator = jsonschema.Draft202012Validator({'$schema': schema['$schema'], '$defs': schema['$defs'], '$ref': '#/$defs/goal'})
for g in materials:
    assert not list(validator.iter_errors(g))
    assert g['requires'] == g['examData']['coveredGoalIds']
    assert g['examData']['reviewStatus'] == 'draft'

# These are independent reviewer-written complete synthetic answers. The scores
# are manual application of the actual whole rubrics, not an automated grader,
# learner evidence, mastery result or fresh review of old positive profiles.
counteranswers = [
    (0, 'incorrect-legal-categories', [
        'A erhält eine strafrechtliche Geldstrafe; C führt automatisch zu Haft. Privater Ersatz und staatliche Strafe sind dieselbe Folge.',
        'Ein unverschlossener Hof erlaubt die Fahrradmitnahme, deshalb ist B kein Diebstahl. Bei C2 ist Vorsatz unerheblich und §303 bestraft jede Fahrlässigkeit.',
        'Jeder Ersttäter muss maximal bestraft werden. Der Geschädigte muss am Ausgleich teilnehmen; Schultermine spielen keine Rolle.',
        'Alle elektronischen Geräte sind immer verboten, und strafrechtliche Verantwortung beginnt mit zwölf. Ich würde diese Grenzen ohne Begründung übernehmen.'
    ], [0, 0, 0, 0], [
        'Verwechselt Ordnungswidrigkeit, Jugendstrafrecht und private Ansprüche; kein zutreffender Fakten-/Normbezug.',
        'Wegnahme und Vorsatz werden falsch angewandt; unverschlossener Hof ist keine Erlaubnis.',
        'Keine zutreffenden Erziehungsmechanismen, Zumutbarkeit oder Opferinteressen; automatischer Ausgang erfunden.',
        'Keine richtige geltende Grenze, differenzierte Rechtsfunktion oder begründete Regelidee.'
    ]),
    (0, 'legal-labels-without-application', [
        'A ist eine Ordnungswidrigkeit mit möglicher Geldbuße. C ist eine Straftat. Privater Ersatz ist eine andere Frage.',
        'Hier gehören §242, §303 und §15 hin. Die Merkmale prüfe ich nicht und zur Erlaubnisvariante sage ich nichts.',
        'Erziehung ist wichtig, aber ich vergleiche keine Maßnahmen oder Bedingungen.',
        'Verkehrssicherheit ist ein Zweck; Gerechtigkeit, Wandel und eine Regelidee untersuche ich nicht.'
    ], [4, 1, 1, 1], [
        'Richtige Kategorien/Trennung, aber keine tatsächliche Fallsubsumtion oder konkrete Jugend-Erziehungsanalyse.',
        'Nur Normetiketten; keine vollständige fallbezogene Subsumtion, Reife- oder Variantenprüfung.',
        'Ein richtiger Zweck, keine zwei Maßnahmenmechanismen oder Zumutbarkeits-/Opferabwägung.',
        'Ein richtiger Regelzweck; fehlender Kriterienvergleich und keine kontrollierbare Idee.'
    ]),
    (1, 'stereotypes-and-invented-effects', [
        'Nuri und Mila sind zugezogen und sprechen daher beide schlecht; Jo benötigt keine Hilfe. Das beschreibt alle Mitglieder dieser Gruppen.',
        'Jo übernimmt die Familienmeinung unveränderlich. Schule und Verein haben keinen Einfluss und ein Forum macht automatisch alle gleich.',
        '40,25 und6 werden zu71 verschiedenen Hilfsbedürftigen addiert. Die zehn Stellen garantieren allen hundert sofort Arbeit.',
        'Integration bedeutet bloße Anwesenheit und nur einseitige Anpassung. Wer nicht teilnimmt, ist kulturell unwillig.',
        'Die500 Kontakte sind automatisch mehr Sozialkapital als tatsächliche gegenseitige Hilfe. Öffnung garantiert Vertrauen und alle Vermittlungen.'
    ], [0, 0, 0, 0, 0], [
        'Erfindet Sprachdefizite und repräsentative Gruppenurteile gegen das ausdrücklich korrigierte Dossier.',
        'Keine drei Einflüsse/Interaktionswege; ignoriert aktive Argumentrevision.',
        'Addiert möglicherweise überlappende Gruppen und erfindet Beschäftigungswirkung.',
        'Verwechselt Anwesenheit mit Mitgestaltung, ohne Bedingungen oder wechselseitigen Wandel.',
        'Kontaktzahl ersetzt keine mobilisierbare Ressource; garantierte Effekte sind unbelegt.'
    ]),
    (1, 'correct-facts-without-analysis', [
        'Nuri nennt Betreuung und Anerkennung, Jo Radwege und Informationen, Mila Musik. Ich vergleiche keine Gemeinsamkeiten oder Handlungsmöglichkeiten.',
        'Familie, Schule und Verein kommen vor, und Jo ändert ein Argument. Ich beschreibe keine Lernwege oder Forumsmöglichkeit.',
        'Es fehlen40 Wohnungen und5 Sprachplätze;10 Stellen sind frei. Ohne Kriterien würde ich alle Maßnahmen gleich nennen.',
        'Neue und alte Bewohner verändern eine Veranstaltung. Zugangsbedingungen und Mitgestaltung gegenüber Anwesenheit bleiben offen.',
        'Das geschlossene Netzwerk hilft und die offene Liste hat500 Kontakte. Ich beurteile weder Öffnung noch Treffen.'
    ], [2, 3, 2, 2, 2], [
        'Drei korrekte Perspektiven; verlangter Vergleich und Handlungsmöglichkeiten fehlen.',
        'Einflüsse und aktive Rolle teilweise erkannt; Mechanismen und konkrete Zugangschance fehlen.',
        'Daten zutreffend; soziale/politische Mechanismen, Priorität mit zwei Kriterien und Prüfbedarf fehlen.',
        'Wechselseitige Änderung erkannt; Kriterien, Bedingungen und Beteiligungsunterschied nicht erklärt.',
        'Konkrete Ressourcen/Fakten erkannt; kein Ausschluss-/Kontaktzahlvergleich oder Maßnahmenurteil.'
    ]),
    (2, 'false-costs-and-bias-labels', [
        'Das zweite Onlineangebot kostet nur36 und ist acht Euro billiger;80 gleichlautende Sterne beweisen Qualität. Den Versand und morgigen Bedarf ignoriere ich.',
        'Ein voreingestellter Dienst beweist bei jeder Person Irrationalität. Ein Preisanker wirkt immer genau gleich.',
        'A/B ist Anchoring, C/D Status quo, E/F Framing. Ich vergleiche verschiedene Produkte und erfinde bereits den Sieger.',
        'Der Shop will Geld und die Kommune Klima. Deshalb ist jede staatliche Voreinstellung gut; Information, Abwahl und Bedürfnisse sind unwichtig.'
    ], [0, 0, 0, 1], [
        'Kosten falsch, Zeitbedarf und verifizierbare Informationen fehlen.',
        'Keine zutreffend begrenzten unterschiedlichen Mechanismen; individuelle Effekte erfunden.',
        'Veränderte Faktoren falsch zugeordnet; kein kontrollierter Vergleich.',
        'Interessen teilweise benannt; keine Mechanismen, Wahlfreiheit oder prüfbare ethische Abwägung.'
    ]),
    (2, 'some-reasoning-no-control-or-ethics', [
        '36+6=42 und der Laden kostet44. Morgenbedarf spricht für den Laden und Testbarkeit. Verkäufer und gleichlautende Bewertungen prüfe ich nicht.',
        'Voreinstellung kann einen Dienst erhalten und90 kann ein Anker sein. Vergleichsbedingungen und alternative Präferenz erkläre ich nicht.',
        'Status quo, Framing, Anchoring sind die Namen. Ich liefere keine Faktorbegründung und keinen kontrollierten Vergleich.',
        'Shop und Kommune verwenden Standards. Ziele sind Ertrag und Klima; Transparenz, Bedürfnisse, Grenzen und Evaluation lasse ich weg.'
    ], [4, 2, 1, 2], [
        'Kosten, Bedarf und zwei Kaufaspekte zutreffend, aber Informationsprüfung fehlt.',
        'Zwei Mechanismen benannt; Gleichheit und Hypothesen-/Präferenzgrenzen fehlen.',
        'Begriffe allein ohne geforderte begründete Zuordnungen oder Kontrolle.',
        'Mechanismus/Ziele teilweise beschrieben, aber geforderte ethische Kriterien und überprüfbare Idee fehlen.'
    ]),
    (3, 'automatic-size-effects-and-public-good-error', [
        'Werbung für einen Euro macht das Gerät genauso reparierbar wie Ersatzteilzugang für drei. Deshalb ist Werbung sicher erfolgreicher.',
        '80% macht jede Fusion automatisch illegal. Die fünf Euro Kostensenkung werden zwingend vollständig weitergegeben.',
        'Werbung beseitigt die gesperrte Schnittstelle; Unabhängigkeit eines veräußerten Betriebs ist unwichtig.',
        'Fusion und Absprache sind dasselbe; identische Preise sind immer Beweis. Weitere Fakten brauche ich nicht.',
        'Ungleiches Wissen ist harmlos und gute Anbieter bleiben garantiert. Warnsignale sind rival, und das geschützte Monopol hat immer die kleinste Menge ohne Erklärung.',
        'Mehr Teilnehmer garantieren Konkurrenz. Die Gebühr10% existiert, aber Bewertungen und Rangfolgen können keine Wechselhürde bilden.'
    ], [0, 1, 0, 0, 0, 1], [
        'Leistung/Kommunikation verwechselt und Absatzwirkung erfunden.',
        'Kostenersparnis erkannt, aber Effizienz-/Risikoweg falsch und Größen-/Weitergabeautomatismus.',
        'Maßnahme beseitigt die Eintrittssperre nicht, Bedingungen fehlen.',
        'Struktur/Koordination und Beweisgrenze falsch.',
        'Alle drei geforderten Mechanismen fehlen oder widersprechen Annahmen.',
        'Gebühr als ein Fakt erkannt; Netzwerkeffekt, Bindung und bedingtes Wettbewerbsurteil falsch.'
    ]),
    (3, 'labels-without-case-mechanisms', [
        'Ersatzteile kosten3 und Werbung1. Den Nachfrage-/Leistungsunterschied oder ein bedingtes Vorgehen erkläre ich nicht.',
        'Gemeinsame Geräte können Kosten sparen. Ich nenne keine Risiken oder Preisweitergabe-/Alternativengrenze.',
        'Es gibt Untersagung, Veräußerung, Schnittstelle und Werbung; Problembezug und Bedingungen fehlen.',
        'Absprache betrifft Preise, Fusion Struktur. Die Regel und benötigten Fakten wende ich nicht an.',
        'Gebrauchtgeräte: Informationsasymmetrie; Warnsignal: öffentliches Gut; Monopol: Marktmacht. Mechanismus und Folge fehlen.',
        'Die Plattform verbessert Reichweite und verlangt10%. Abhängigkeit, Bewertungen, Rangfolgen und Urteilskriterien bespreche ich nicht.'
    ], [1, 2, 1, 1, 3, 2], [
        'Kostenfakten allein decken keine geforderte Reaktionsanalyse.',
        'Ein Effizienzvorteil, keine Risiko-/Grenzanalyse.',
        'Instrumentetiketten ohne passende Wirkungen/Umsetzungsbedingung.',
        'Grundunterschied erkannt, keine begründeten Eingriffe oder Beweisgrenzen.',
        'Explizite Rubric erlaubt höchstens je1 für bloße richtige Etiketten.',
        'Reichweite/Gebühr teilweise richtig, weitere Risikomechanismen und Urteil fehlen.'
    ]),
]
counterrows = []
for index, case_id, answers, points, reasons in counteranswers:
    g = materials[index]
    steps = g['examData']['scoring']['steps']
    assert len(steps) == len(answers) == len(points) == len(reasons)
    assert all(0 <= p <= s['points'] for p, s in zip(points, steps))
    total = sum(points)
    assert total < g['examData']['scoring']['passingPoints']
    counterrows.append({'examGoalId': g['id'], 'caseId': case_id,
        'wholeReviewerWrittenSyntheticAnswerDe': answers,
        'actualIndependentManualRubricScores': [{'stepId': s['id'], 'maxPoints': s['points'], 'points': p, 'reasonDe': r} for s, p, r in zip(steps, points, reasons)],
        'actualTotal': total, 'passingPoints': g['examData']['scoring']['passingPoints'], 'belowPassing': True,
        'realLearnerWork': False, 'automatedSemanticGradingClaim': False})
counter_binding = write('actual-independent-eight-complete-synthetic-counteranswers-and-whole-manual-rubric-judgments.json', counterrows)

numeric = []
for name, actual, expected in [
    ('unmet-language-places', D(25)-D(20), D(5)),
    ('second-online-total', D(36)+D(6), D(42)),
    ('local-online-premium', D(44)-D(42), D(2)),
    ('equal-thirty-day-price-frame', D('1.40')*D(30), D(42)),
    ('repair-market-shares', D(80)+D(20), D(100)),
    ('actual-adaptation-versus-advertising-extra-cost', D(3)-D(1), D(2)),
    ('platform-share-of-receipts-after-stated-fee', D(1)-D('0.10'), D('0.90')),
]:
    assert actual == expected
    numeric.append({'check': name, 'actual': str(actual), 'expected': str(expected), 'pass': True})
for g in materials:
    actual = sum(s['points'] for s in g['examData']['scoring']['steps'])
    assert actual == g['examData']['scoring']['maxPoints']
    numeric.append({'check': g['id'] + ': whole-rubric-sum', 'actual': actual, 'expected': g['examData']['scoring']['maxPoints'], 'pass': True})

reasons = [
    ['StVO/OWiG public-law category, stipulated maturity/intent and separate civil question demanded in task1.', 'Actual §242 taking/appropriation and §§15/303 intent variant with basic legal method, not bare citation, demanded in task2.', 'Two educational responses, victim autonomy/reasonableness and uncertain legal outcome demanded in task3.', 'Purpose, justice, change and enforceable conditional rule idea demanded in task4.'],
    ['Three individual perspectives and cross-origin similarities/differences demanded; unknown language now accurately stated.', 'Three socialisation influences, interaction and active revision with new forum access demanded.', 'Migration opportunities/challenges and social/political pathways with two priority criteria demanded; overlapping groups not added.', 'Mutual cultural adaptation, participation/presence distinction and two access conditions demanded.', 'Mobilisable resources/trust/exclusion and actual opening/meeting judgment demanded; contact count alone rejected.'],
    ['Own fictional choice linked to exact total, deadline, benefits/problems and verifiable seller/reviews demanded.', 'Two possible mechanisms and hypotheses versus deliberate preferences demanded.', 'All three distinct altered factors and one controlled comparison demanded.', 'Commercial/public mechanisms, interests, informed opt-out, ethical limit and evaluation demanded.'],
    ['Demand adaptation versus communication, real cost and conditional implementation demanded.', 'Actual shared equipment efficiency and reduced independent alternatives, uncertain price pass-through demanded.', 'Two problem-specific instrument comparisons and actual implementation conditions demanded.', 'Coordination and prospective structural review distinguished under explicitly supplied model rule.', 'All three distinct knowledge/public-good/protected-monopoly mechanisms and inefficient consequences demanded.', 'Both sides, matching/network benefits, fees, rankings, lock-in and conditional competition judgment demanded.'],
]
rows = []
for g, per_goal in zip(materials, reasons):
    assert len(per_goal) == len(g['examData']['coveredGoalIds'])
    rows.append({'examGoalId': g['id'], 'decision': 'KEEP whole corrected/frozen material',
        'wholeTaskSolutionAndEveryRubricActuallyReadDeEn': True,
        'wholeCurrentContractAndMinimalRequiresDecisions': [{'goalId': gid, 'task': f'task{n+1}', 'decision': 'KEEP', 'reason': reason} for n, (gid, reason) in enumerate(zip(g['examData']['coveredGoalIds'], per_goal))]})
released = copy.deepcopy(materials)
for old_g, new_g in zip(materials, released):
    new_g['examData']['reviewStatus'] = 'released'
    restored = copy.deepcopy(new_g)
    restored['examData']['reviewStatus'] = 'draft'
    assert restored == old_g
released_binding = write('whole-four-independently-reviewed-E-youth-participation-digital-market-materials.only-machine-status-released.json', released)
after = [bind(p) for p in inputs]
assert before == after
spec = importlib.util.spec_from_file_location('skillpilot_schema', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(ROOT)
assert symlink_errors == []
for p in inputs:
    assert subprocess.run(['git', 'check-ignore', '-q', str(p.relative_to(ROOT))], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 1

urls = ['https://www.gesetze-im-internet.de/' + tail for tail in [
    'stvo_2013/__23.html', 'stvo_2013/__49.html', 'stvg/__24.html', 'owig_1968/__12.html',
    'jgg/__1.html', 'jgg/__2.html', 'jgg/__3.html', 'jgg/__5.html', 'jgg/__10.html', 'jgg/__13.html',
    'stgb/__15.html', 'stgb/__19.html', 'stgb/__242.html', 'stgb/__303.html']]
receipt = {
    'schemaVersion': 1, 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer': '/root', 'author': '/root/economics_independent_continuation_a',
    'scope': 'Four complete E materials6–9 and19 distinct current covered contracts; accepted only after bounded real finding in7 was resolved.',
    'wholeReviewMethod': 'Actual complete bilingual task materials, tasks, solutions, every scoring row, and19 whole current target contracts read. A first combined output was truncated for7; complete7 and targets were reread separately without truncation. No whole-positive-profile rereview inferred from hashes.',
    'actualMaterialDecisions': rows, 'actualWholeCurrentContracts': target_binding,
    'actualPrimaryNormsRead': urls,
    'primaryReadQualification': 'Web primary pages read for11 norms; repeated web timeouts for StGB242/303 andJGG1 resolved by actual HTTP200 exact official URLs and whole norm reading using declared ISO-8859-1. Raw full normative HTML stays external cache; no full official-PDF archive required. Initial absent bs4 and UTF8 decode failures were technical reads, not failed semantic approvals.',
    'actualThreeFallbackPrimaryRawHashes': {
        urls[-2]: '09149a5c52bf3f07eccfd317c93076deee71940ff296112e9766cd6470709895',
        urls[-1]: '0b41aa1807aae33f16b7bcca8ff2562ff8dd4ce9693354ec9c5accd49567107d',
        urls[4]: '4a31fa678f04d0f500866ceaa7e02c40fd277f95c220a0e2cec7b87b84e3b936'},
    'wholeLawAssessmentBoundary': "Teaching cases stipulate maturity, intention and relevant facts. Admin/criminal/civil consequences, juvenile education and optional victim participation correctly distinguished. No specific fine/sentence, automatic result or personal legal advice. Competition rules explicitly model assumptions, not today's German statutory rule or the unresolved current Source2 debate.",
    'findingLineage': {'originalMaterial7Decision': 'REVISE', 'actualFinding': 'Unsupported differing language/qualification inference for Nuri versusMila despite unknown Nuri language.', 'authorDelta': bind(delta_path), 'changedFields': ['examData.solutionContent', 'examData.solutionContentEn'], 'allOtherWholeFieldsExact': True, 'actualIndependentDeltaDecision': 'KEEP resolved; known needs and unknown language now distinguished.'},
    'actualIndependentDecimalAndScoringChecks': numeric,
    'actualIndependentEightCompleteSyntheticCounteranswers': counter_binding,
    'actualOriginalWholeGoalSchemaChecks': {'count': 4, 'errors': 0},
    'actualMachineReleasedWholeMaterials': released_binding,
    'onlyReleaseFieldChangedAgainstReviewedBodies': 'examData.reviewStatus',
    'originalCombinedNineAndAllAuthorBodiesRemainDraftAndExact': True,
    'wholeInputGuards': {'before': before, 'after': after, 'exact': True},
    'curriculumSymlinkErrors': [], 'ignoredMandatoryInputTargets': [],
    'newOrdinaryCurricularGoals': 0, 'newMemoryCardOrVisualizationApproval': False,
    'otherFourE40Materials2to5': 'Separate independent reviewer; decisions not inferred here.',
    'newDescriptionCourseSource125OrLiveRouteGateApproval': False,
    'humanReview': 'pending', 'observedLearnerTrial': False, 'liveWrites': [],
    'strictBefore': '300/311', 'strictAfter': '300/311', 'newStrictAcademicClosures': 0,
    'restoredStrictBindings': 0, 'strictNetGain': 0,
}
result = write('actual-independent-four-whole-E-materials-nineteen-contracts-and-resolved-language-finding-KEEP.receipt.json', receipt)
print(json.dumps({'receipt': result, 'wholeMaterialsKEEP': 4, 'wholeCurrentContracts': 19, 'independentDecimalAndScoringChecks': len(numeric), 'wholeSyntheticCounteranswers': len(counterrows), 'schemaErrors': 0, 'symlinkErrors': 0, 'strictNetGain': 0}))
