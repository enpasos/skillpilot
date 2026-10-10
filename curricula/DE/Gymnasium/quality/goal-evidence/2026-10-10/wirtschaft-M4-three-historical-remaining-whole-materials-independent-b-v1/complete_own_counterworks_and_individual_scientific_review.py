#!/usr/bin/env python3
"""Seal actual bounded science; no active edits, artificial learner work, or human release."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from decimal import Decimal, localcontext
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
REVIEWER = '/root/economics_m2_views_independent_b'
NOW = datetime.now(timezone.utc).isoformat()

def read(name):
    return json.loads((OUT / name).read_text())

def digest(path):
    p = ROOT / path
    b = p.read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b), 'symlink': p.is_symlink()}

def dump(name, obj):
    p = OUT / name
    assert not p.exists(), f'No historical overwrite: {p}'
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return digest(p.relative_to(ROOT))

intake = read('actual-current496-three-whole-bodies-eleven-DEEN-goals-and-P22.exact-intake.json')
materials = {g['id'][:8]: g for g in intake['wholeMaterials']}
goals = {g['id'][:8]: g for g in intake['wholeOrdinaryGoals']}
profiles = {p['wholeProfile']['goalId'][:8]: p['wholeProfile'] for p in intake['wholeCurrentProfiles']}
assert len(materials) == 3 and len(goals) == len(profiles) == 11

prior_base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
prior_paths = [
    prior_base + 'wirtschaft-five-legacy-exams-125-material-prerequisite-and-LK-scope-independent-review-v1/actual-final-independent-five-whole-materials-125-edge-necessity-three-LK-and-qualified-native-profiles.receipt.json',
    prior_base + 'wirtschaft-five-legacy-exams-125-material-prerequisite-and-LK-scope-independent-review-v1/five-individual-whole-material-to-twenty-one-required-contract-judgments.json',
    prior_base + 'wirtschaft-five-legacy-exams-125-material-prerequisite-and-LK-scope-independent-review-v1/actual-thirteen-foreign-KEEP-material-exact-reuse-and-twenty-two-real-registered-path-difference.json',
    prior_base + 'wirtschaft-M3-M4-six-phase-gates-whole-material-independent-a-v1/actual-five-practice-clusters-six-nonuniversal-content-gates-scientific-KEEP.independent-a.json',
    prior_base + 'wirtschaft-nine-reviewed-Q2-materials-root-bounded-assembly-v1/semantic425.nine-actual-independent-practice-decisions-and-one-nav-input.inert.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-existing-practice-requires-derived-country-metadata-author-v1/postmerge-current496-exact-material-status-baseline-successor-v2/six-foreign-whole-qualified-metadata-and-twelve-accesses-author-successor-v3/actual-final-six-foreign-whole-qualified-practice-flags-and-twelve-country-accesses.author-handoff.json'
]
prior = [{'input': digest(p), 'wholeArtifact': json.loads((ROOT / p).read_text())} for p in prior_paths]
old_five = {r['goalId'] for r in prior[1]['wholeArtifact']}
old_thirteen = {r['goalId'] for r in prior[2]['wholeArtifact']['thirteenMaterialBindings']}
these = {g['id'] for g in materials.values()}
assert len(old_five) == 5 and len(old_thirteen) == 13
assert these.isdisjoint(old_five | old_thirteen)
assert set(prior[5]['wholeArtifact']['firstThreeHistoricalReleasedOnlyFlagsWithdrawn']) == these
dump('actual-six-prior-review-scope-artifacts-and-no-valid-whole-science-reuse.json', {
    'reviewer': REVIEWER, 'reviewedAt': NOW, 'wholeArtifacts': prior,
    'actualFivePreviouslyWholeReviewedMaterialIds': sorted(old_five),
    'actualThirteenForeignWholeKEEPMaterialIds': sorted(old_thirteen),
    'theseThreeAbsentFromBothWholeReviewedSets': True,
    'scopeInterpretation': [
        'The five whole-assessment independent reviews concern five different IDs; their genuine qualified task/solution/rubric reviews are retained, not restarted.',
        'The thirteen exact foreign whole-KEEP reuses concern thirteen different IDs; exact retained old bodies elsewhere are not new scientific reviews.',
        'The phase-cluster KEEP explicitly disclaims whole-body coverage approval of all28 descendants.',
        'The semantic425 reviewed-current-pilot-practice-assessment label classifies semantic kind; it does not certify assessment coverage or actual learner mastery.',
        'The current six-flags/twelve-access author explicitly withdraws these three historically released-only flag proposals. Its six genuine foreign wholeScience lineages are not transferable.',
        'The complete802 canonical-ID and297 provenance-ID search inventories also contain source, applicability, Memory, registration and snapshots. No valid actual whole-assessment decision for these eleven current contracts was identified in the scope-inspected evidence.'
    ],
    'freshReviewBoundary': 'First bounded whole-performance review of these three presently unqualified legacy bodies; no re-review of qualified historical five/thirteen/15aa work.'
})

with localcontext() as ctx:
    ctx.prec = 45
    before, after = Decimal('3.4'), Decimal('4.1')
    checks = [
        {'id': 'rate-percentage-point-delta', 'actual': str(after - before), 'expected': '0.7', 'unit': 'percentage points'},
        {'id': 'fraction-rate-delta', 'actual': str(Decimal('0.041') - Decimal('0.034')), 'expected': '0.007', 'unit': 'fraction of unchanged assessment base'},
        {'id': 'relative-rate-increase', 'actual': str((after - before) / before * Decimal(100)), 'unit': 'percent', 'displayRounded': '20.588235'},
        {'id': 'dependents-index-under-given18percent', 'actual': str(Decimal(100) * Decimal('1.18')), 'expected': '118.00', 'unit': 'index only, not actual headcount or total spending'}
    ]
    for check in checks:
        if 'expected' in check:
            assert Decimal(check['actual']) == Decimal(check['expected'])
    assert ((after - before) / before * Decimal(100)).quantize(Decimal('0.000001')) == Decimal('20.588235')
dump('actual-four-own-Decimal-care-material-checks.json', {
    'reviewer': REVIEWER, 'syntheticLearnerData': False, 'actualChecks': checks,
    'limits': ['Given undated teaching figures are not identified as current German contribution rates.', 'A rising number of dependents alone does not establish an exact expenditure change.', 'No wage base, benefit amount, deficit, debt stock, borrowing rule or current source date is supplied by this material.']
})

legal = [
    'Die vorgesehene sechsmonatige Speicherung und der spätere Zugriff auf Verkehrsdaten berühren den Schutz vertraulicher Kommunikation und personenbezogener Informationen. Das Sicherheitsziel kann legitim sein; daraus folgt aber nicht schon die Rechtfertigung jeder Datenerfassung. Entscheidend sind Umfang, betroffene Personen, Zweckbindung und Schutz vor Missbrauch. Die Initiative kritisiert einen möglichen unverhältnismäßigen Freiheitseingriff, während der Staat Gefahren abwehren möchte. Ein Eingriff ist damit noch nicht als Grundrechtsverletzung bewiesen.',
    'Der Bundestag beschließt die gesetzliche Grundlage; die Regierung und ihre zuständigen Behörden vollziehen sie innerhalb der rechtlichen Bindung. Die im Material vorgesehene richterliche Anordnung begrenzt den einzelnen Zugriff. Zuständige Fachgerichte können staatliche Einzelmaßnahmen kontrollieren; das Bundesverfassungsgericht prüft in den dafür vorgesehenen Verfahren die Vereinbarkeit mit dem Grundgesetz. Die Aufgabenverteilung ermöglicht also Rechtskontrolle neben der politischen Mehrheitsentscheidung.',
    'Zur Eignung ist zu fragen, ob der Zugriff zur Aufklärung der bezeichneten schweren Gefahr beitragen kann. Zur Erforderlichkeit ist eine kürzere oder auf konkret verdächtige Personen begrenzte Datenspeicherung als mildere Möglichkeit zu vergleichen. Bei der Angemessenheit stehen die Intensität der sechsmonatigen Erfassung und die Sicherheitsgewinne gegenüber. Ob das konkrete Instrument diese Prüfungen besteht, lässt sich mit den wenigen Angaben nicht abschließend feststellen: tatsächliche Erfolgsnachweise und der genaue Datenumfang fehlen. Eine gerichtliche Anordnung begrenzt den Zugriff, ersetzt aber nicht die Prüfung der vorgelagerten Speicherung.',
    'Eine verfassungsgerichtliche Überprüfung kann demokratisch sinnvoll sein, weil parlamentarische Mehrheiten ebenfalls an Grundrechte gebunden sind. Der Rechtsweg ergänzt politische Debatte und eröffnet Kontrolle staatlicher Macht. Die bloße Ankündigung einer Beschwerde beweist weder die Zulässigkeit einer konkreten Beschwerde noch die Verfassungswidrigkeit des Gesetzes. Das Material nennt weder die Beschwerdeführer mit eigener Betroffenheit noch einen abgeschlossenen Verfahrensstand; darüber treffe ich daher kein abschließendes Urteil.'
]
care = [
    'Die Zahl der Pflegebedürftigen ist nach dem Material in fünf Jahren um18 Prozent gewachsen. Das spricht bei sonst gleichen Bedingungen für mehr Finanzierungsbedarf; ein genauer Ausgabenzuwachs ist ohne Leistungen und Kosten je Person nicht berechenbar. Der Beitragssatz steigt von3,4 auf4,1 Prozent, also um0,7 Prozentpunkte beziehungsweise relativ rund20,59 Prozent. Gleichzeitig belasten höhere Eigenanteile die betroffenen Haushalte. Zusätzliche Zuschüsse stehen unter dem angegebenen Konsolidierungsdruck des Bundeshaushalts.',
    'Die Pflegeversicherung soll das Risiko hoher Pflegekosten gemeinsam tragen und Pflegebedürftige vor finanzieller Überforderung schützen. Dazu benötigt sie eine tragfähige Finanzierungsbasis. Solidarität mit den Betroffenen, eine zumutbare Beitragsbelastung und die Verteilung der Finanzierung zwischen heutigen und künftigen Generationen müssen zusammen berücksichtigt werden. Ein höheres Leistungsversprechen ohne entsprechende Einnahmen wäre dauerhaft nicht verlässlich.',
    'Höhere Beiträge bringen bei gleicher Bemessungsgrundlage mehr Einnahmen, erhöhen aber die Abgabenbelastung von Beschäftigten und beitragspflichtigen Unternehmen. Steuerzuschüsse verteilen Kosten über die allgemeine Steuerfinanzierung; sie beanspruchen jedoch Mittel, die dann für andere öffentliche Aufgaben fehlen. Zusätzliche Eigenvorsorge kann die gemeinschaftliche Finanzierung ergänzen, doch Personen mit geringen Einkommen können hierfür weniger zurücklegen. Keine der drei Einnahmequellen beseitigt den Bedarf an einer transparenten Lastenentscheidung.',
    'Ich befürworte einen begrenzten Mix: moderate Beitragsanpassung, gezielte Steuerzuschüsse für besonders belastende Pflegekosten und eine Begrenzung extremer Eigenanteile. So werden die Kosten auf mehrere Finanzierungsgruppen verteilt und der Schutz im Pflegefall bleibt erhalten. Die Lösung trägt nur, wenn Zuschüsse finanziert und die Beiträge für Erwerbstätige zumutbar bleiben. Eine rein private Finanzierung würde dagegen gerade Haushalte mit wenig Einkommen stärker ungeschützt lassen; unbegrenzt steigende Beiträge würden die heutige Erwerbsgeneration zu stark belasten.'
]
ethics = [
    'Das Textilunternehmen steht zwischen Kosten- und Wettbewerbsdruck und der Verantwortung für menschenwürdige Arbeitsbedingungen bei seinen Zulieferern. Regeln können die Kosten erhöhen; fehlender Schutz kann dagegen Nachteile für Beschäftigte aufrechterhalten. Die Position der Firma verlangt praktikable gemeinsame Vorgaben, die zitierte NGO fordert verbindliche Pflichten. Ein tragfähiges Urteil muss wirtschaftliche Umsetzbarkeit und den Schutz betroffener Menschen zusammen berücksichtigen.',
    'Die Firma entscheidet über die Auswahl und Kontrolle ihrer Lieferanten und muss ihre Sorgfalt im eigenen Einflussbereich wahrnehmen. Der Staat schafft verbindliche Regeln, prüft deren Einhaltung und muss für nachvollziehbare Durchsetzung sorgen. Konsumentinnen und Konsumenten können durch Nachfrage und öffentlichen Druck Verantwortung einfordern, kennen aber oft nicht alle Lieferbeziehungen. Der Einfluss der Nachfrage entbindet Firma und Staat nicht von ihren eigenen Aufgaben.',
    'Freiwillige CSR kann schneller an unterschiedliche Unternehmen angepasst werden und Raum für neue Kontrollverfahren bieten. Ohne unabhängige Kontrolle oder Folgen bei Nichterfüllung können Selbstverpflichtungen jedoch unverbindlich bleiben. Gesetzliche Lieferkettenregeln schaffen gemeinsame Mindestpflichten, verursachen aber Dokumentations- und Kontrollkosten. Daher sollten freiwillige Initiativen verbindliche Mindestpflichten ergänzen, nicht ersetzen.',
    'Sinnvoll erscheinen klare Mindestpflichten mit abgestuften, nach Risiko und Möglichkeiten geeigneten Nachweisen, nachvollziehbarer Kontrolle und international anschlussfähigen Anforderungen. Das begrenzt eine reine Werbeantwort und macht den Schutz weniger vom einzelnen Unternehmen abhängig. Zu komplexe Formulare können Ressourcen von tatsächlicher Kontrolle abziehen. Eine verhältnismäßige Gestaltung sollte deshalb Wirksamkeit und praktische Umsetzbarkeit verbinden, ohne Arbeits- und Menschenrechtsschutz durch bloßen Kostendruck aufzugeben.'
]

works = []
for stem, answers, maxima, missing in [
    ('591b870a', legal, [8, 8, 7, 7], ['documented current dispute and supplied constitutional provisions', 'formal-versus-actual independent control in observed constitutional practice', 'specific legal-certainty safeguard/deficit']),
    ('58cc062b', care, [7, 8, 8, 7], ['distinct explicit justice-model criteria applied to the same distribution', 'specific efficiency/resource/behaviour mechanism distinguished from funding adequacy', 'flow-stock/debt-service and supplied current borrowing boundaries']),
    ('a47e8fca', ethics, [7, 8, 8, 7], ['two explicit normative ethical-model applications', 'evidenced actual CSR implementation and effects', 'specific human-rights standard, finding, remedy and evidence limit', 'responsibility of NGOs, with their own options and limits'])
]:
    g = materials[stem]
    assert [s['points'] for s in g['examData']['scoring']['steps']] == maxima
    steps = [{'stepId': f's{i+1}', 'wholeOwnAnswer': answer, 'manualPoints': maxima[i], 'maximum': maxima[i],
              'gradingReason': 'Complete answer to the actual specified task and its unchanged expected solution/rubric; absent additional claimed goal dimensions are not retroactively inserted.'} for i, answer in enumerate(answers)]
    works.append({'workId': stem + '-complete-rubric-conforming-response', 'materialId': g['id'], 'origin': 'Own independent reviewer synthetic counterwork; not actual learner submission, session or coach-grader execution', 'completeFourPartSubmission': steps, 'rawManualPoints': sum(maxima), 'passingPoints': 18, 'actualRubricResult': 'PASS', 'missingWholePerformanceDespiteFullRawScore': missing})
    partial = list(answers)
    removed_index = 2 if stem in ['591b870a', '58cc062b'] else 1
    partial[removed_index] = [
        'Ich kann die rechtsstaatlichen Prüfkriterien hier nicht anwenden und gebe hierzu keine fachliche Bewertung ab.',
        'Ich kann die verschiedenen Finanzierungsreformen nicht fachlich gegeneinander abwägen und gebe hierzu keine Bewertung ab.',
        'Ich kann die Verantwortung der gefragten Akteursgruppen nicht analysieren und gebe hierzu keine Bewertung ab.'
    ][['591b870a', '58cc062b', 'a47e8fca'].index(stem)]
    partial_points = [0 if i == removed_index else maxima[i] for i in range(4)]
    steps = [{'stepId': f's{i+1}', 'wholeOwnAnswer': answer, 'manualPoints': partial_points[i], 'maximum': maxima[i],
              'gradingReason': 'Explicitly missing required part earns zero; the remaining complete unchanged answers retain the same rubric credit.'} for i, answer in enumerate(partial)]
    works.append({'workId': stem + '-one-full-required-task-missing', 'materialId': g['id'], 'origin': 'Own independent reviewer synthetic counterwork; not actual learner submission, session or coach-grader execution', 'completeFourPartSubmission': steps, 'rawManualPoints': sum(partial_points), 'passingPoints': 18, 'actualRubricResult': 'PASS', 'scientificLimit': 'Even a whole requested part can be omitted while meeting the existing overall threshold. This is a counterexample to inferring all declared goal performances from a pass, not a proposed blanket scoring cap.'})
assert len(works) == 6 and sum(len(w['completeFourPartSubmission']) for w in works) == 24
assert [w['rawManualPoints'] for w in works] == [30, 23, 30, 22, 30, 22]
counterwork_binding = dump('actual-six-complete-own-counterworks-and24-manual-rubric-decisions.json', {
    'reviewer': REVIEWER, 'reviewedAt': NOW, 'wholeSyntheticReviewerWorks': works,
    'manualRubricDecisions': 24, 'actualLearnerDataUsed': False, 'coachGradeRunClaimed': False,
    'actualTaskRubricChanged': False, 'existingPassThresholdsRetained': True,
    'meaning': 'Full truthful answers matching these old tasks do not supply the missing whole goal contracts. Existing aggregate pass also fails to prove every declared performance. No learner result is asserted or rescored.'
})

findings = []
def claim(material_stem, goal_stem, absent, actual_facet, task_solution_anchor, prerequisite_reason):
    g, m = goals[goal_stem], materials[material_stem]
    findings.append({
        'materialId': m['id'], 'goalId': g['id'], 'goalTitleDe': g['title'], 'decision': 'REVISE whole assessed coverage',
        'wholeCurrentDescriptionDe': g['description'], 'wholeCurrentDescriptionEn': g['descriptionEn'],
        'currentPositiveProfileRule': profiles[goal_stem]['profileRuleVersion'], 'currentPositiveProfileStatus': profiles[goal_stem]['status'],
        'wholeExpectationActuallyRead': profiles[goal_stem]['profile']['expectations'],
        'wholeApplicationCasesActuallyRead': profiles[goal_stem]['profile']['applicationCaseBriefs'],
        'materialAnchor': task_solution_anchor, 'unprovedWholePerformance': absent, 'existingRealFacetKEEP': actual_facet,
        'directRequiresDecision': {'status': 'Full-goal prerequisite claim is not scientifically qualified by this whole-coverage review', 'reason': prerequisite_reason, 'automaticRequiresRemovalAuthorizedByReviewer': False},
        'ownCounterwork': material_stem + '-complete-rubric-conforming-response',
        'literalHistoricalPTaskOrExtraTaskQuotaRequired': False,
        'requiredRepair': 'Provide actual assessable whole performance with matching material, solution and fair rubric, or make an explicit truthful endpoint/coverage successor without hiding any ordinary goal or leaving an empty released assessment.'
    })

claim('591b870a', '49a28d4c',
      'The current full contract includes constitutional practice and distinguishing formal institutional arrangements from actual implementation. This dossier supplies a proposed rule and intended complaint, no observed exercise of control, independence, enforcement, compliance or comparison of formal and actual conditions. Tasks/solution2 describe institutional functions only.',
      'Fundamental rights constrain state action; parliament, executive and judicial oversight have distinct functions; a judicial-access condition is a real formal safeguard.',
      'Tasks1/2/4 and solution2/4: generic powers and constitutional correction, no actual implementation finding.',
      'Basic rights and institutions are useful foundations; mastery of the full formal-versus-actual constitutional-practice contract is not demonstrated as universally necessary for these four generic answers.')
claim('591b870a', '85cb48e1',
      'No date, identified currently valid law, documented current dispute, actual judicial/procedural status or source dossier is provided. The simplified undated six-month sentence cannot be relabelled as a current legal conflict.',
      'The scenario permits a hypothetical conditional liberty/security discussion and transparent acknowledgment of missing facts.',
      'Context/material1/material2 are undated; tasks1/4 and all solutions contain no current case/source-status requirement.',
      'These actual generic tasks can be solved without mastering a current documented dispute; a future current-case repair will need its real lawful material bindings.')
claim('591b870a', '04cccbe4',
      'A currently documented fundamental-rights case with supplied relevant provisions and sufficient facts is absent. Proportionality can be discussed hypothetically, but the one simplified storage rule plus political objection does not document present protection/interference/justification under an identified current norm.',
      'Interference is not automatically a violation; suitability, less restrictive alternatives and the narrow balancing test are meaningful hypothetical perspectives.',
      'Task3/solution3 contain only generic proportionality criteria; no actual constitutional norm extract, date or documented case status.',
      'The broader current-case competence is not a necessary mastered contract for the hypothetical proportionality response provided; actual normative repair is separate.')
claim('591b870a', '6f96056d',
      'The explicit full description requires separation of powers, legal certainty and executive control. Tasks/solution explain powers and proportionality but do not demand or assess foreseeable legal criteria, clarity, publication, bounded discretion or another specific legal-certainty safeguard/deficit. Six months alone does not complete that examination.',
      'Allocation of powers and a judicial condition for access are useful checks; proportionality is genuine but distinct from the missing full legal-certainty inquiry.',
      'Task3 says rule-of-law criteria; solution3 restricts the expected performance to suitability/necessity/proportionality. Solution2 supplies generic institutional roles.',
      'Whole legal-certainty mastery is not necessary to reproduce this expected answer; it must not be inferred from the actual proportionality-only part.')

claim('58cc062b', '577f0e2d',
      'Three sources of funds are discussed, but no competing justice-model criteria or shared distribution case are supplied and no model comparison is required. Naming solidarity and generation fairness with a funding mix does not show how different needs, contribution, opportunities or outcome criteria evaluate the same proposal differently.',
      'Actual contributions/taxes/private provision are compared by burdens and access; solidarity, finance reliability and intergenerational burden are genuine normative perspectives.',
      'Tasks2/3/4 and solution2/3/4 discuss funding sources and a plausible mix, not explicit differing model justifications or the same allocation judged by competing criteria.',
      'A funding-option comparison is possible without the full justice-model comparison competence; that full prior-mastery gate is not independently established by the current task.')
claim('58cc062b', 'd17ff931',
      'The full goal demands analysis of efficiency and justice, not solely revenue adequacy and burden distribution. No specific resource-use, behavioural, incentive, employment, quality/capacity or comparable efficiency mechanism is given, demanded or explained in the solution. Higher contributions burden workers/firms, but burden incidence alone does not establish an efficiency consequence. The full30-point counterwork discusses all actual tasks without one.',
      'A concrete care-financing and distributive tradeoff is present: shared care protection, household access, workers/firms contribution burdens and competing budget uses. These remain valid useful facets.',
      'Task3/solution3 list contributions, taxes and private provision; solutions1/2/4 compare financial sustainability and burden balance, with no explicit efficiency mechanism. No particular numeric transfer model or second task is demanded by this review.',
      'The actual broad financing discussion does not universally require the full efficiency-versus-justice competence. A real mechanism could repair the existing case; finance stability should not simply be renamed efficiency.')
claim('58cc062b', 'c5272ab8',
      'Public borrowing, deficit versus debt stock, interest/repayment conditions and any supplied current national/European borrowing limit are wholly absent. Household own provision and federal consolidation pressure are not a substitute for a debt-limit discussion.',
      'Contributions, tax-funded subsidies and private own provision have different burdens and financing limits.',
      'All material figures concern demographics, rates, own payments and general federal budget pressure. Tasks/solutions contain neither borrowing nor any debt constraint.',
      'No whole borrowing/debt-limit competence is necessary for these no-borrowing questions. Removing or replacing any full gate requires an explicit independent author decision, not a derived applicability flag.')

claim('a47e8fca', 'a56d5e8d',
      'The current goal/profile require applying distinct explicit ethical criteria/models to options and affected groups. Neither material supplies model criteria; neither task nor solution applies two models. Naming costs versus rights is a genuine conflict perspective but not two actual model applications.',
      'A globalisation conflict between business costs/competition and workers rights is identified.',
      'Task1/solution1 describe the conflict; tasks3/4 compare voluntary versus binding regulation without any explicit model applications.',
      'A generic conflict and institutional-design answer does not universally require mastery of the complete two-model application contract.')
claim('a47e8fca', 'abb13ea9',
      'The full CSR assessment is evidence-sensitive: actual social/environmental/rights effects, implementation, business decisions and affected perspectives. The two generic quotes identify no particular CSR scheme, actual supplier practice, measured/observed effect, worker testimony or implementation finding. A voluntary-versus-mandatory category comparison does not evaluate any evidenced real/fictitious CSR performance.',
      'Voluntary CSR and binding obligations are meaningfully distinguished by adaptability, enforceability and control costs; an implementation-evidence requirement can be proposed as a design condition.',
      'Material1 contains only a firm/NGO policy preference. Task3/solution3 compare categories; task4/solution4 recommend duties and evidence requirements without evaluating actual implementation/effects.',
      'The task can be answered with policy categories alone. Full evidence-sensitive CSR performance is not established as a universal prerequisite or as an assessed result.')
claim('a47e8fca', 'c014b11e',
      'No specific human-rights standard, documented worker conditions, actual implementation, remedy, follow-up or evidence limit is supplied and assessed. Mentioning human rights generally and recommending minimum duties does not complete a standards/implementation/remedy evaluation.',
      'Rights and fair work conditions are recognised as constraints on business cost arguments; generic statutory minimum duties are discussed.',
      'Context/quotes provide neither a concrete worker-right finding nor a standard/remedy dossier. Solution4 offers abstract minimum duties and graded evidence.',
      'A generic cost-rights comparison can be made without completing the full standards-and-remedy contract; actual rights evidence is needed for qualification.')
claim('a47e8fca', 'e4ae5afd',
      'The actual whole goal expressly covers companies, states and NGOs. Task2 and solution2 replace NGOs with consumers; no task/rubric requires evaluation of NGO responsibility, distinct influence, evidentiary role, limits or accountability. One quoted NGO opinion is not that performance.',
      'Companies, the state and consumers are assigned useful differentiated roles; the NGO expresses a policy preference.',
      'Task2: companies/state/consumers. Solution2 mirrors these actors. The full30-point own work evaluates those requested actors and no NGO role.',
      'Mastery of a companies/states/NGOs whole contract is not necessary for the actual consumers-based task. A real NGO responsibility performance is a bounded repair opportunity.')
assert len(findings) == 11 and {f['goalId'] for f in findings} == {g['id'] for g in goals.values()}

legal_sources = {
    'reviewedAt': NOW, 'mode': 'Actual official pages browsed during this independent review; no copied full web pages or real current six-month-law claim',
    'sources': [
        {'title': '§90 BVerfGG', 'url': 'https://www.gesetze-im-internet.de/bverfgg/__90.html', 'boundedParaphrase': 'A constitutional complaint claims infringement of the complainant own protected rights; ordinarily the available legal route must first be exhausted, with statutory exceptions. The initiative standing and procedural conditions are unspecified in the teaching scenario.'},
        {'title': 'Article19 GG', 'url': 'https://www.gesetze-im-internet.de/gg/art_19.html', 'boundedParaphrase': 'Legal protection is available for rights infringements by public authority; the ordinary courts are the fallback where another jurisdiction is not established. Accordingly the solution categorical ordinary-courts wording should not be read as establishing competence in this unspecified law case.'},
        {'title': 'Article10 GG', 'url': 'https://www.gesetze-im-internet.de/gg/art_10.html', 'boundedParaphrase': 'Confidential communication is constitutionally protected; restrictions require statutory provision, with specific constitutional special oversight conditions. The undated task supplies no actual current rule or decided case.'}
    ],
    'verbatimWordsQuoted': 0,
    'curriculumReviewNotIndividualLegalAdvice': True,
    'separateSolutionPrecisionFindings': ['No automatic admissibility or success of the initiative complaint follows from the stated facts; the existing task requests usefulness, so the bounded own counterwork preserves that distinction.', 'Unspecified competent courts should not be categorically replaced by ordinary courts. This is a bounded precision finding, not a claim that all judicial review in the scenario is invalid.']
}
dump('actual-official-primary-legal-boundaries-without-invented-current-case.json', legal_sources)

summary = []
for stem in ['591b870a', '58cc062b', 'a47e8fca']:
    g = materials[stem]
    rows = [f for f in findings if f['materialId'] == g['id']]
    assert {f['goalId'] for f in rows} == set(g['examData']['coveredGoalIds'])
    assert g['requires'] == g['examData']['coveredGoalIds']
    summary.append({'materialId': g['id'], 'title': g['title'], 'wholeDecision': 'REVISE', 'individualUnprovedWholeClaims': len(rows), 'actualFullCoverageKEEPBindings': [], 'genuineExistingFacetsKEEP': [f['existingRealFacetKEEP'] for f in rows], 'actualUnchangedScoring': g['examData']['scoring'], 'reviewerAuthoredBody': False, 'releaseStatusLeftUnchanged': 'released', 'noNewFlagOrAccessApproval': True, 'noEmptyReleasedTerminalPermittedByThisReview': True})
science_binding = dump('actual-three-whole-materials-eleven-unproved-current-performance-bindings-independent-REVISE.json', {
    'schemaVersion': 1, 'reviewer': REVIEWER, 'reviewedAt': NOW, 'status': 'REVISE',
    'input': digest((OUT / 'actual-current496-three-whole-bodies-eleven-DEEN-goals-and-P22.exact-intake.json').relative_to(ROOT)),
    'actualCanonicalIntakeSHA256': intake['canonicalInput']['sha256'],
    'materials': summary, 'individualWholeCoverageFindings': findings, 'ownCounterworks': counterwork_binding,
    'actualWholeScientificReads': {'wholeGermanTasks': 3, 'wholeGermanSolutions': 3, 'wholeRubrics': 3, 'wholeRequiresAndCoveredSets': 3, 'wholeOrdinaryGermanEnglishContracts': 11, 'wholeCurrentApplicationCases': 22, 'existingEnglishTaskSolutionFields': 0},
    'statusTruthfulness': {'existingProfileStatus': 'needs_human_review', 'existingProfileAuthority': 'ai_candidate', 'profileStatusesChanged': False, 'existingReleasedMeansWholeScienceApproved': False, 'humanReviewOrTrialClaimed': False},
    'strictScope': {'activeWrites': 0, 'newImages': 0, 'newOrdinaryGoals': 0, 'newFlagsOrViewReferences': 0, 'nativeOrBuildRuns': 0, 'strictNewFachClosures': 0, 'restoredBindings': 0, 'M4Claim': False, 'M5Claim': False, 'M6Claim': False, 'M7Claim': False},
    'requiresAndRouteBoundary': 'Coverage failure and useful prerequisite facets are assessed separately. No automatic blanket removal of eleven requires, no empty released assessment, no hidden ordinary target, and no all-country/source coverage follows. Whole body repair or an independently qualified honest endpoint successor is needed; actual lost routes remain observable.',
    'next': 'Parent/main author choose bounded actual complete performance repairs or honest endpoint changes. Review their exact successors independently; preserve these whole predecessor decisions and all qualified historical reviews.'
})

bindings = read('actual-current-input-bindings.before-science.json')['inputs'] + [p['input'] for p in prior]
end_rows = []
changed = []
for b in bindings:
    actual = digest(b['path'])
    end_rows.append({'before': b, 'after': actual, 'wholeFileExact': b == actual})
    if b != actual:
        changed.append(b['path'])
# Parent integration can modify canonical/registry in parallel. Explicit whole targeted
# objects and whole current P rows, rather than stale global hashes, decide applicability.
can_path = intake['canonicalInput']['path']
active = json.loads((ROOT / can_path).read_text())
active_goals = {g['id']: g for g in active['goals']}
target_exact = [active_goals[g['id']] == g for g in intake['wholeMaterials'] + intake['wholeOrdinaryGoals']]
assert all(target_exact)
assert not [p for p in changed if p not in [can_path, intake['registryInput']['path']]]
required = [str(OUT.relative_to(ROOT))] + [str(OUT.relative_to(ROOT) / p.name) for p in OUT.iterdir() if p.is_file()]
ignored = subprocess.run(['git', 'check-ignore', '--', *required], cwd=ROOT, text=True, capture_output=True)
assert ignored.returncode in [0, 1]
assert ignored.returncode == 1 and ignored.stdout == ''
symlinks = [str(p) for p in OUT.rglob('*') if p.is_symlink()]
assert not symlinks
guard_binding = dump('actual-input-endguards-and-explicit-current-object-validity.json', {
    'reviewer': REVIEWER, 'checkedAt': datetime.now(timezone.utc).isoformat(), 'actualInputEndBindings': end_rows,
    'wholeGlobalInputsChangedByParentInParallel': changed, 'actualCurrentCanonical': digest(can_path),
    'allThreeWholeMaterialObjectsAndElevenWholeContractsExact': all(target_exact),
    'allCurrentPositiveProfileInputsWholeExact': True, 'requiredIgnoredPaths': [], 'symlinkErrors': 0,
    'ignoreCommand': {'argv': ['git', 'check-ignore', '--', *required], 'exitCode': ignored.returncode, 'stdout': ignored.stdout, 'stderr': ignored.stderr},
    'reviewerActiveWrites': 0, 'wholeBindingHashIsNotScientificReview': True
})
outputs = [digest(p.relative_to(ROOT)) for p in sorted(OUT.iterdir()) if p.is_file()]
manifest = dump('actual-three-historical-whole-materials-independent-science.manifest.json', {'reviewer': REVIEWER, 'sealedAt': datetime.now(timezone.utc).isoformat(), 'artifactBindings': outputs, 'wholeScienceCompleted': True, 'status': 'REVISE', 'noHistoricalOverwrite': True})
handoff = dump('actual-final-three-whole-historical-materials-eleven-open-claims-independent-b.handoff.receipt.json', {
    'role': 'independent bounded whole-performance scientific review, not author or integration', 'reviewer': REVIEWER,
    'reviewedAt': NOW, 'status': 'REVISE', 'science': science_binding, 'manifest': manifest, 'inputGuards': guard_binding,
    'wholeMaterialsReviewed': 3, 'individualWholeCoverageREVISE': 11, 'actualFullCoverageKEEPBindings': 0,
    'genuineUsefulPerformanceFacetsRetained': True, 'wholeGermanEnglishOrdinaryContracts': 11,
    'actualCurrentApplicationCases': 22, 'ownWholeSyntheticCounterworks': 6, 'ownManualRubricDecisions': 24,
    'ownDecimalChecks': 4, 'priorQualifiedWholeReviewsRestarted': 0,
    'activeWrites': 0, 'newImages': 0, 'strictGain': 0, 'newFachClosures': 0, 'restoredBindings': 0,
    'noRequiresBlanketCutOrEmptyReleasedEndpoint': True, 'noSourceCourseHumanM4M5M6M7Approval': True,
    'next': 'Actual independently qualified body/endpoint repairs; source/course/applicability/route checks remain separate and no ordinary goal is hidden.'
})
print(json.dumps({'handoff': handoff, 'science': science_binding, 'manifest': manifest, 'verdict': 'REVISE', 'materials': 3, 'individualCoverageFindings': 11, 'counterworks': 6, 'manualMarks': 24, 'currentTargetObjectsExact': all(target_exact), 'globalInputChanges': changed}))
