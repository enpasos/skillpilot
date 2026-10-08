"""Build isolated economics assessment candidates; never mutate the canonical source."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
SOURCE = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'

def digest(value):
    return hashlib.sha256(value).hexdigest()

def dump(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

CASES = [
    {
        'phase': 'E', 'id': '57984b50-0dbe-4fb1-a020-0f25953a8b74',
        'title': 'E-Phase: Reparaturförderung, Konsumentscheidung und Verbraucherrechte',
        'titleEn': 'E phase: repair incentives, consumer choices and consumer rights',
        'description': 'Die lernende Person kann im Fall einer Reparaturförderung Lebensqualitätsindikatoren interpretieren, eine Konsumentscheidung unter Budget-, Werbe- und Nachhaltigkeitsaspekten begründen, Umweltkonflikte analysieren und vertragliche Mängelrechte anwenden.',
        'descriptionEn': 'The learner can interpret quality-of-life indicators, justify a consumer choice with budget, advertising and sustainability constraints, analyse environmental policy conflicts and apply contractual defect rights in a repair-incentive case.',
        'coverage': [
            ('8b28e36b-79ec-5869-9359-45ff68e28f64', [1], 'Drei Indikatorveränderungen interpretieren, Gesamturteil und Informationsgrenze.'),
            ('a60e0541-80e1-5f94-86fd-073f5a00bee8', [2], 'Budget und mehrere Entscheidungskriterien sowie Anker-/Zeitdruckwirkung der Werbung begründet abwägen.'),
            ('4d578b42-8dac-5381-9836-9d7199451c74', [2], 'Reparatur, Wiederverwendung, Recycling und reparierbare Produktgestaltung fachlich unterscheiden.'),
            ('e3cd6940-26f0-55a9-a348-4a90c245266c', [3], 'Zwei konkrete interessengebundene Umweltkonflikte und bedingte Empfehlung.'),
            ('a2eda0df-6c5e-5fb5-bc64-8f6127eae50b', [4], 'Anfänglichen Mangel, Verkäuferbezug, Nacherfüllung und sachliche Reklamation erläutern; keine automatische Erstattung.')
        ],
        'points': [7, 8, 7, 8],
        'rubrics': ['Indikatorveränderungen 3; differenzierte Interpretation 3; zusätzliche Information 1.', 'Budgetvergleich 2; mehrkriterielle Entscheidung 2; Werbeeinfluss 2; Kreislaufunterscheidung und Produktgestaltung 2.', 'Zwei interessengebundene Konflikte 4; begründete Empfehlung 2; Änderungsbedingung 1.', 'Mangel-/Anspruchsbezug 2; Nacherfüllung und Verkäufer 2; Reklamation 2; beide Fehlbehauptungen zurückgewiesen 2.'],
        'excludedCoverageNotes': ['Keine eigenständige Prüfung sämtlicher E-Phasen-, Unternehmens-, Markt- oder Gesellschaftskompetenzen.']
    },
    {
        'phase': 'Q1', 'id': '9a88ee21-93d4-4042-b65c-21e287715433',
        'title': 'Q1: EU-Reparaturpolitik, Interessenvertretung und Steuergerechtigkeit',
        'titleEn': 'Q1: EU repair policy, interest representation and tax justice',
        'description': 'Die lernende Person kann an einem hypothetischen Reparaturvorschlag EU-Entscheidungsprozesse und Interessenvertretung analysieren, wirtschaftspolitische Denkschulen vergleichen und Finanzierungsalternativen anhand von Steuergerechtigkeit und Anreizen beurteilen.',
        'descriptionEn': 'The learner can analyse EU decision procedures and interest representation in a hypothetical repair proposal, compare economic policy schools and evaluate funding options using tax justice and incentives.',
        'coverage': [
            ('8c4d53d1-2617-5e5d-9234-f12d19e38322', [1], 'Kommission, Parlament, Rat und Europäischer Rat am ausdrücklich vorausgesetzten ordentlichen Verfahren unterscheiden.'),
            ('1c0d950c-c618-583f-bfa7-be1d4e3578b6', [2], 'Drei Interessenpositionen sowie Transparenz-/Zugangsregeln mit Wirkungsbegründung analysieren.'),
            ('120242ff-f251-54a5-ae30-fc3c22ab6f25', [3], 'Marktliberale, ordoliberale und keynesianische Idealtypen begründet vergleichen.'),
            ('72bde56f-a752-5bc7-8472-24272c6075a0', [4], 'Absolute/relative Steuerlast und unterschiedliche Gerechtigkeitskriterien auf Verbrauch- und Einkommensteuer anwenden.')
        ],
        'points': [7, 7, 8, 8],
        'rubrics': ['Drei institutionelle Rollen 3; Zusammenarbeit 2; Unterscheidung der Räte 2.', 'Materialbezogene Interessen 3; zwei Regeln mit Wirkungsbegründung 4.', 'Drei Zuordnungen mit Begründung 6; Unterschied Wettbewerbsordnung/Nachfragestabilisierung 2.', 'Vier Belastungsangaben 4; begründete Kriterienabwägung 3; fehlende Information 1.'],
        'excludedCoverageNotes': ['4552c393-5d49-53a7-ad03-fe80b8b63d2f verlangt historische/aktuelle Fälle; dieser Fall ist ausdrücklich hypothetisch und beansprucht diesen Nachweis nicht.', 'Keine Prüfung von Parteiensystem, vollständigem Verfassungsrecht oder sämtlichen Q1-Kompetenzen.']
    },
    {
        'phase': 'Q2', 'id': 'b851482c-5d7e-4228-aea8-3d277f897297',
        'title': 'Q2: Investitionspaket, Modellgrenzen und geldpolitische Transmission',
        'titleEn': 'Q2: investment package, model limits and monetary transmission',
        'description': 'Die lernende Person kann in einer fiktiven Inflations- und Wachstumslage Multiplikator- und Crowding-out-Effekte modellieren, Modellnutzen und -grenzen erläutern, geldpolitische Kanäle vergleichen und einen Mix geld-, fiskal- und ordnungspolitischer Instrumente beurteilen.',
        'descriptionEn': 'The learner can model multiplier and crowding-out effects, explain model usefulness and limits, compare monetary transmission channels and evaluate a monetary, fiscal and regulatory policy mix in a fictional inflation and growth situation.',
        'coverage': [
            ('b0bdd6e9-3b74-51dc-b85e-d35346a5e04c', [2], 'Beide Multiplikatorvarianten einschließlich autonomer privater Investitionsverdrängung berechnen und erklären.'),
            ('b2419b68-8e21-5cee-8afc-34e3b07d2a87', [2], 'Nutzen der Modellstruktur und zwei konkret materialgebundene Annahmegrenzen unterscheiden.'),
            ('a72ddc94-6b38-5c14-8d8b-661472e4dfba', [3], 'Zins-, Kredit-, Erwartungs- und Wechselkurskanal durch verschiedene Mechanismen vergleichen; bedingte Wirkung kennzeichnen.'),
            ('0fda1400-25bc-518f-9dea-848c8104a8d4', [4], 'Alle drei Instrumentenbereiche mit Zielkonflikten, Unabhängigkeit, Verzögerung und veränderter Lage beurteilen.')
        ],
        'points': [7, 8, 8, 7],
        'rubrics': ['Materialbezogene Lage 3; plausible Kostenwirkung 2; Daten-/Kausalitätsgrenze 2.', 'Multiplikator 1; beide Einkommensänderungen 3; Mechanismus 1; zwei Modellgrenzen 2; Nutzen und keine Prognose 1.', 'Vier unterschiedliche fachlich passende Transmissionsmechanismen je 2.', 'Maßnahmen aller drei Bereiche 2; Zielkonflikte und Finanzierung/Unabhängigkeit 2; Verzögerungen 1; Lageänderung und angepasster Mix 2.'],
        'excludedCoverageNotes': ['25278ecf-2e77-556e-9fe6-8f0b954cc680 verlangt historische/aktuelle Inflationsszenarien; die diagnostische Teilaufgabe nutzt nur fiktive Daten und beansprucht diesen Nachweis nicht.', 'Keine vollständige Q2-Abdeckung, Unternehmensbilanz- oder echte Prognoseprüfung.']
    },
    {
        'phase': 'Q3', 'id': 'fe55b4b3-9eca-46ce-a3a6-f7a0a84daf12',
        'title': 'Q3: Lieferkettenresilienz, Währungstrilemma und Kaufrechtsfall',
        'titleEn': 'Q3: supply-chain resilience, monetary trilemma and sales-law case',
        'description': 'Die lernende Person kann Lieferkettenverletzlichkeit und Beschaffungsstrategien beurteilen, den Zielkonflikt zwischen Kapitalmobilität, Wechselkursbindung und autonomer Geldpolitik anwenden und eine mangelhafte Maschinenleistung anhand des Kaufrechts identifizieren.',
        'descriptionEn': 'The learner can evaluate supply-chain vulnerabilities and sourcing strategies, apply the trade-off between capital mobility, exchange-rate pegs and monetary autonomy, and identify defective machine performance under sales law.',
        'coverage': [
            ('fcf756f1-7252-54cb-9257-de8259090021', [1], 'Verletzlichkeit, zwei verschiedene Resilienzmaßnahmen sowie jeweils Kosten/Grenzen bewerten.'),
            ('7d632b0b-60b8-5c33-8094-ef1569b313dc', [2], 'Drei Trilemma-Ziele auf konkrete Fallannahmen anwenden; Mechanismus und zwei verschiedene Zielverzichte.'),
            ('ffcc9dc8-6bf0-5ea8-8f4a-95cd8fddd48d', [3], 'Vertragliche Soll- und Istleistung unter identischen Bedingungen mit §434BGB subsumieren; Mangel von Verschulden trennen.'),
            ('8adaa076-10ad-5fbf-8a22-247b52046da4', [4], 'Beschaffungs-/Standortentscheidung mit Kosten, Risiko, Versorgung und Informations-/Änderungsgrenze analysieren.')
        ],
        'points': [8, 7, 8, 7],
        'rubrics': ['Materialbezogene Verletzlichkeit 2; zwei Maßnahmen mit Mechanismus je 2; jeweilige Kosten/Grenzen je 1.', 'Drei fallbezogene Ziele 3; Kapitalfluss-/Kursmechanismus 2; zwei unterschiedliche Zielverzichte 2.', 'Vereinbarung/Fakten 2; Norm und Subsumtion 2; Nacherfüllung und Verkäufer 2; Verschulden/Schadensersatz getrennt 2.', 'Materialbezogene Entscheidung 2; Kosten/Risiko/Versorgung 3; fehlende Information 1; Änderungsbedingung 1.'],
        'excludedCoverageNotes': ['Nacherfüllung wird im Rechtsmaterial erläutert; kein zusätzlicher vollständiger Verbraucherrechts-/Schadensersatznachweis.', 'Keine vollständige Q3-, Finanzsystem-, WTO-, EU-Integrations- oder internationale Privatrechtsabdeckung.']
    },
    {
        'phase': 'Q4', 'id': '44fb56bb-7b5a-4b34-9ca4-c4052f94da89',
        'title': 'Q4: Rohstoffabhängigkeit, Mikrofinanzwirkung und faire Governance',
        'titleEn': 'Q4: commodity dependence, microfinance impact and fair governance',
        'description': 'Die lernende Person kann Rohstoffabhängigkeit und Diversifizierung diskutieren, Mikrofinanzmechanismen und die Wirksamkeit eines internationalen Entwicklungsprogramms kritisch beurteilen und einen Entwicklungskonflikt mit ethischen Kriterien und Governance-Regeln bearbeiten.',
        'descriptionEn': 'The learner can discuss commodity dependence and diversification, critically evaluate microfinance mechanisms and an international development programme, and address a development conflict with ethical criteria and governance rules.',
        'coverage': [
            ('9b6ef4f1-229b-5560-b692-0a6b6de79de7', [1], 'Exportabhängigkeit rechnerisch und kausal erklären; Rohstofffluch nicht deterministisch behaupten; Diversifizierung mit Grenze.'),
            ('e5560c43-c25a-5356-a282-c602945219ae', [2], 'Kredit, Beratung und Marktzugang getrennt erklären; Risiken und soziale Wirkung über Rückzahlung hinaus bewerten.'),
            ('b8c7458a-7642-53bf-b20e-d2a715ff6ed7', [3], 'Selbstselektion, Beobachtung/Kausalität und Durchschnitt/Einzelfall unterscheiden; bessere Evaluation und weitere Erfolgsmessung.'),
            ('645e6ff8-4ddf-5858-bbae-ce20fdc966ac', [4], 'Konsequenz- und Gerechtigkeitskriterium anwenden und konkrete Governance-Regel mit Mechanismus und Grenze begründen.')
        ],
        'points': [7, 8, 8, 7],
        'rubrics': ['Exportrechnung 2; Abhängigkeitsmechanismus 2; keine Zwangsfolge 1; Diversifizierung mit Grenze 2.', 'Drei Mechanismen 3; materialbezogene Bewertung 2; zwei Risiken/Informationen 2; Rückzahlung nicht Sozialerfolg 1.', 'Veränderungen 2; Beobachtung/Kausalität und Durchschnitt/Einzelfall 3; bessere Untersuchung 2; weiterer Indikator 1.', 'Zwei ethische Kriterien angewandt 3; Konfliktausgleich 2; konkrete Governance-Regel mit Wirkung und Grenze 2.'],
        'excludedCoverageNotes': ['Keine vollständige Q4-, Klimagovernance-, Entwicklungsindikatoren- oder internationale Organisationsabdeckung.']
    }
]

def main():
    raw = SOURCE.read_bytes()
    # Immutable first authoring baseline. A future source delta requires a new package.
    before = HERE / 'before.landscape.json.snapshot'
    if before.exists():
        raw = before.read_bytes()
    else:
        before.write_bytes(raw)
    landscape = json.loads(raw)
    candidate = copy.deepcopy(landscape)
    goals = {goal['id']: goal for goal in candidate['goals']}
    baseline_goals = {goal['id']: goal for goal in landscape['goals']}
    entries = []
    for case in CASES:
        goal = goals[case['id']]
        old = baseline_goals[case['id']]
        for field in ['title', 'titleEn', 'description', 'descriptionEn']:
            goal[field] = case[field]
        goal['examData']['reviewStatus'] = 'draft'
        goal['examData']['coveredGoalIds'] = [entry[0] for entry in case['coverage']]
        goal['examData']['coveredStrands'] = list(dict.fromkeys(strand for entry in case['coverage'] for strand in goals[entry[0]]['dimensionTags']['guidingIdeas']))
        goal['examData']['demandLevels'] = ['AB1', 'AB2', 'AB3']
        goal['examData']['taskContent'] = (HERE / f"{case['phase']}.task.md").read_text()
        goal['examData']['solutionContent'] = (HERE / f"{case['phase']}.solution.md").read_text()
        goal['examData']['scoring'] = {'maxPoints': 30, 'passingPoints': 18, 'steps': [{'id': f's{i+1}', 'points': points, 'description': rubric} for i, (points, rubric) in enumerate(zip(case['points'], case['rubrics']))]}
        assert sum(case['points']) == 30
        assert goal['requires'] == old['requires']
        assert set(goal['examData']['coveredGoalIds']).issubset(set(old['requires']))
        entries.append({'goalId': goal['id'], 'phase': case['phase'], 'beforeCoverageClaimCount': len(old['examData']['coveredGoalIds']), 'candidateDirectAssessedCount': len(case['coverage']), 'unchangedReadinessRequiresCount': len(goal['requires']), 'readinessInterpretation': 'Existing author-defined conservative readiness prerequisites retained separately from actual assessment coverage; this is not complete phase coverage and success does not infer prerequisite mastery.', 'taskToGoalCoverage': [{'goalId': covered_id, 'title': goals[covered_id]['title'], 'currentDescription': goals[covered_id]['description'], 'tasks': tasks, 'evidenceCriterion': criterion} for covered_id, tasks, criterion in case['coverage']], 'excludedCoverageNotes': case['excludedCoverageNotes'], 'unchangedSemanticKind': 'practiceAssessment', 'status': 'draft_pending_independent_machine_review'})
    changed = [new['id'] for old, new in zip(landscape['goals'], candidate['goals']) if old != new]
    assert changed == [case['id'] for case in CASES]
    assert len(candidate['goals']) == 370
    dump('candidate.landscape.json.snapshot', candidate)
    dump('candidate-manifest.json', {'schemaVersion': 1, 'kind': 'economics-five-terminal-assessment-author-candidate', 'createdAt': '2026-10-08', 'author': '/root/economics_layer_a', 'status': 'draft_pending_independent_machine_review', 'isActiveIntegration': False, 'canonicalSourcePath': str(SOURCE.relative_to(ROOT)), 'baselineSha256': digest(raw), 'candidateSha256': digest((HERE/'candidate.landscape.json.snapshot').read_bytes()), 'changedGoalIds': changed, 'totalGoals': 370, 'ordinaryCurricularAtomicGoalsUnchanged': 303, 'newStrictCompletions': 0, 'restoredDescriptionOrPositiveEvidenceBindings': 0, 'beforeCoverageClaimCount': sum(entry['beforeCoverageClaimCount'] for entry in entries), 'candidateDirectAssessedCount': sum(entry['candidateDirectAssessedCount'] for entry in entries), 'readinessEdgesUnchanged': True, 'requiresReview': ['Independent machine fachliche assessment review', 'Independent exact goal-coverage and rubric review', 'Independent intentional retained-readiness criterion review', 'Only after acceptance promote reviewStatus and bind the five current native semantic-kind fingerprints'], 'separateHumanGates': 'Human review, approval, teaching trials and release acceptance remain separate and are neither supplied nor required for the machine QS receipt.', 'sourceAndRights': {'ownMaterialLicense': 'CC-BY-4.0', 'attribution': 'SkillPilot; AI-generated, SkillPilot-curated', 'data': 'Fictional original teaching scenarios and numbers; no learner/session/private data.', 'legalMaterial': 'Short paraphrases of public primary law sources; the repository license does not relicense third-party source text.', 'primarySourceConsultationDate': '2026-10-08', 'primaryConsultations': [{'url': 'https://www.gesetze-im-internet.de/bgb/__434.html', 'scope': 'Agreed condition and defect in Q3; substantive current primary text read.'}, {'url': 'https://www.gesetze-im-internet.de/bgb/__437.html', 'scope': 'Nacherfüllung and separate conditions for further defect remedies; current primary text read.'}, {'url': 'https://www.gesetze-im-internet.de/bgb/BJNR001950896.html', 'scope': 'Actual §439 passage: repair/replacement, seller costs, conditional refusal; aggregate primary text read because individual URL timed out.'}, {'url': 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:12016E294', 'scope': 'Commission proposal and joint Parliament/Council ordinary legislation; primary article read.'}, {'url': 'https://www.consilium.europa.eu/de/council-eu/', 'scope': 'Council minister composition and joint legislative role; current official text read.'}, {'url': 'https://www.consilium.europa.eu/de/european-council/', 'scope': 'Political direction and no legislative role; current official text read.'}, {'url': 'https://www.ecb.europa.eu/mopo/intro/transmission/html/index.en.html', 'scope': 'Monetary transmission channels and conditional/lagged mechanisms; official explanation read.'}, {'url': 'https://www.ecb.europa.eu/pub/pdf/ire/focus/ecb.irebox201906_06~9bac10f686.en.pdf', 'scope': 'Trilemma assumptions and trade-offs; entire three-page ECB source read.'}, {'url': 'https://www.aeaweb.org/articles?id=10.1257/app.20130533', 'scope': 'Original research abstract on randomized microfinance evaluation read; no empirical result or external data copied into fictional task.'}]}, 'changes': entries})
    print(json.dumps({'candidate': str(HERE.relative_to(ROOT)), 'changedGoals': len(changed), 'coverageClaimsBefore': 131, 'actualDirectAssessedAfter': sum(entry['candidateDirectAssessedCount'] for entry in entries), 'status': 'draft_pending_independent_machine_review'}, ensure_ascii=False))

if __name__ == '__main__':
    main()
