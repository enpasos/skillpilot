import datetime
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = Path.cwd()
ENTRY = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-bw-source-placement-independent-a-resumed-v1/neutral-independent-bw-review-b.entry.json')
EXPECTED = '33a6bdb76f301f0a7725d65c08dfb7ca6a6c7cfd70d571be69af4b9369afd22b'

def binding(p):
    p = Path(p)
    data = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def value_hash(v):
    return hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

assert binding(ENTRY)['sha256'] == EXPECTED
entry = json.loads(ENTRY.read_text())
refs = [entry['neutralOriginalAuthorEntry'], *entry['inputsForOwnBlindReview']]
for ref in refs:
    assert binding(ref['path'])['sha256'] == ref['sha256'], ref['path']
inputs = [binding(ENTRY), binding('AGENTS.md'), *[binding(r['path']) for r in refs]]
components = json.loads(Path(entry['inputsForOwnBlindReview'][1]['path']).read_text())['components']
snapshot = json.loads(Path(entry['inputsForOwnBlindReview'][-1]['path']).read_text())
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

RATIONALES = [
    'Stofftrennung verlangt eine selbst entwickelte Lösungsroute. 2.1(2-4), dessen konkreter Verweis bei 3.2.1.1(4) und der Planungsoperator tragen als Prozessanteil eigene untersuchbare Frage, eigene Hypothese und eine erwartbare Prüfung. Ein möglicher Gegenbefund operationalisiert Prüfbarkeit; er behauptet keine wörtliche BW-Falsifikationsliste und keinen SekII-Theorieabschluss.',
    'Der Reaktionsversuch verweist auf 2.1(4-5); 2.1(2-3) ergänzt Fragenerschließung und Hypothesenbildung. Eine selbst formulierte, begründete und beobachtungsprüfbare Hypothese ist eine angemessene untere Operationalisierung. Durchführung mit allen geforderten Reaktanten bleibt eine andere ganze Quellenpflicht.',
    'Experimentelle Eigenschaftsuntersuchung und 2.1(5) tragen echte sichere Durchführung. Der offizielle Durchführungsoperator erlaubt eine vorgegebene Anleitung. Die angeleitete Routine ist daher ein zulässiger Lernweg; die Quelle verlangt weder ausschließlich Anleitung noch ersetzt diese Routine die vollständige Eigenschaftsliste.',
    'Durchführen bleibt eine reale Versuchshandlung. Unter Anleitung gehört grammatisch ausschließlich zum Auswerten. Eine vorgegebene Durchführung ist über den offiziellen Durchführungsoperator und einen didaktischen Lernweg zulässig. Massenerhaltungs- und Massenverhältnisversuche samt angeleiteter Auswertung bleiben ganze Quellenpflichten.',
    'Die Quelle fordert Planung und echte Gemischtrennung. Planen bedeutet Entwicklung eines Lösungswegs zu einem vorgegebenen Problem; passende Variablen, Vergleichsbedingungen und eigenes Protokoll präzisieren diese begrenzte Eigenplanung. Die Hypothese darf vorgegeben sein. Generische Salz-/Löslichkeitsfälle sind keine vorgeschriebene Gemischtrennung.',
    'Planung, Durchführung, Protokoll und fachlicher/alltäglicher Kontext sind ausdrücklich verbunden. 2.1(4-5) trägt qualitative und quantitative Hypothesenprüfung, sichere Ausführung und Dokumentation. Planungsautonomie bleibt auf einfache Untersuchungen begrenzt; die vorgeschriebenen Reaktanten und ihre Kontexte sind hiermit nicht vollständig geprüft.',
    'Eigenschaftsbegründete Anwendungen liefern einen konkreten Beitrag zum Beschreiben chemischer Aufgaben und Anwendungsbereiche. Gesellschaftliche Diskussion stützt der kumulative Prozessbereich 2.2(8-9)/2.3(6), nicht der wörtliche Operator dieser einzelnen Zeile. Die sechs ausdrücklich genannten organischen Stoffe bleiben vollständig zu behandeln.',
    'Der industrielle Weg vom Rohstoff bis zur Nutzung ist eine chemische Anwendung; konkrete Verweise 2.2(8) und 2.3(8,10) tragen gesellschaftliche Bedeutung und Abwägung. Der gewählte Stoff und seine vollständige industrielle Prozesskette dürfen nicht durch generische Anwendungsfälle ersetzt werden.',
    'Ethanol verbindet konkreten Nutzen und konkrete Gefahr; 2.2(9) und 2.3(6,7,11) binden fachliche Diskussion und persönliche/gesellschaftliche Relevanz unmittelbar. Alkoholkonsum und Desinfektionsmittel bleiben Inhaltspflichten. Berufswahl entsteht daraus nicht.',
    'Der Brennstoffvergleich verweist ausdrücklich auf 2.2(8-9) und 2.3(6,9,10). Ein fachlich begründeter gesellschaftlicher/ökologischer Diskussionsbeitrag ist gestützt. Wasserstoff, Methan und Benzin sind weiterhin anhand CO2-Bilanz und Reaktionsenergie zu vergleichen; andere Anwendungen schließen diesen Kontext nicht.',
    'Die Rohstoff-/Nutzungskette bindet Recherche und aussagekräftige Auswahl über 2.2(1-2). Die Quelleninformationsroutine ist ein begründeter partieller Prozessbeitrag. prerequisiteOnly ist eine ausdrückliche begrenzte Sichtentscheidung, keine Befreiung von BW-Recherchepflichten.',
    'Charakteristische Eigenschaftskombinationen sind mit 2.2(1-3) verknüpft. Informationsauswahl und strukturierte Verarbeitung tragen einen Teilbeitrag. Vollständige Stoffliste und tatsächliches Recherchieren in analogen und digitalen Medien sind hiermit nicht abschließend geprüft.',
]

HOLDS = [
    ('3.2.1.1(1)', 'Neun Eigenschaftsarten einschließlich realer experimenteller Untersuchung bleiben nachzuweisen. Leitfähigkeit/Lösungsgeschwindigkeit ersetzt die ganze Liste nicht.'),
    ('3.2.1.1(2)', 'Alle sechzehn genannten Stoffe mit ihren charakteristischen Eigenschaftskombinationen bleiben erhalten. Prozessrecherche/-auswahl ist nur Teilbeitrag.'),
    ('3.2.1.1(4)', 'Ein tatsächlich selbst geplanter Trennversuch an einem Gemisch bleibt erforderlich. Salzreihe und Sättigung sind keine Gemischtrennung.'),
    ('3.2.1.1(5)', 'Ein ausgewählter Stoff benötigt die vollständige industrielle Kette Rohstoffgewinnung bis Verwendung. Die vier Stoffbeispiele sind Beispiele, keine gemeinsame Pflichtliste; generische Anwendungen liefern keine komplette Kette.'),
    ('3.2.1.1(12)', 'Methan, Ethen, Benzin, Ethanol, Propanon/Aceton und Ethansäure/Essigsäure benötigen eigenschaftsbegründete Verwendung. Generische P-Fälle Wasseraufbereitung/Korrosion/Verpackung/Batterie ersetzen sie nicht.'),
    ('3.2.1.1(13)', 'Nutzen und Gefahren von Ethanol mit Alkoholkonsum und Desinfektionsmittel bleiben Inhaltspflicht. Alkoholrisiko-Partner schließen Desinfektionsnutzen nicht automatisch.'),
    ('3.2.2.1(2)', 'Sauerstoff, Schwefel, Wasserstoff, Kohlenstoff und ausgewählte Metalle sowie reale Planung, Durchführung, Protokoll und Fach-/Alltagskontexte bleiben erhalten. NaCl-/Zuckerfälle schließen diese Reaktionskontexte nicht.'),
    ('3.2.2.2(2)', 'Echte Experimente zu Massenerhaltung und Massenverhältnis, angeleitete Auswertung, Massenerhaltungsgesetz und Verhältnisformel bleiben erforderlich. Leitfähigkeit/Zuckerlösung ersetzt diese Versuche nicht.'),
    ('3.2.2.3(8)', 'Wasserstoff, Methan und Benzin sind anhand CO2-Bilanz UND Reaktionsenergie zu vergleichen. Batterie-/Verpackungsdiskussion ist keine vollständige Brennstoffentscheidung.'),
    ('2.2(1-3),2.3(8),1.1BO', 'Recherche-/Darstellungs- und Berufsfeld-Einführungspflichten bleiben im vollständigen Kontext zu prüfen. Voraussetzung allein ist kein curricularer Abschluss. Anwendungen oder Berufsfelder ist kein pauschaler Karrierevergleich und keine persönliche Berufswahl. Ganze Karriere-Routine unverändert erhalten, ohne diese vollständige Routine als BW-Pflicht zu erfinden.'),
]

roles = [
    ('lower-chemical-question-hypothesis', '75e2eff1-f871-5461-9e3f-26d0b333ce2f', 'target', 'Eigene beobachtungsprüfbare Fragen/Hypothesen bilden einen unteren Abschluss; keine vollständige Theoriefalsifikation.'),
    ('lower-guided-hypothesis-investigation', 'e81a4aed-9695-533e-8eb7-7a0c714346ea', 'target', 'Vorgegebene Anleitung ist ein zulässiger Weg echter sicherer Durchführung; angeleitete Auswertung wird nicht als exklusive angeleitete Durchführung gelesen.'),
    ('lower-independently-planned-hypothesis-investigation', '42391b16-bbae-5c77-84e1-d488e714167b', 'target', 'Einfache selbst geplante qualitative und quantitative reale Untersuchungen passen zum Planungs-/Durchführungsanspruch.'),
    ('chemical-applications-society', '7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6', 'target', 'Konkrete Anwendungen, Bedeutung und fachliche Diskussion sind gestützt. 2.3(8) nennt Anwendungen oder Berufsfelder; keine vollständige persönliche Berufswahlpflicht.'),
    ('sek1-source-information', '5b1bb5d9-07b1-5ba9-b320-cc97be917c60', 'prerequisiteOnly', 'Ausdrückliche begrenzte authored Sichtentscheidung mit erhaltener ID/globaler Mastery; keine Befreiung von verpflichtender Recherche/Kommunikation und keine vollständige Quellen-Zielroute.'),
]
verdict = {
    'schemaVersion': 1,
    'role': 'Eigenes erstes blindes unabhängiges fachliches BW-Quellen- und Platzierungsurteil B',
    'reviewer': 'Codex independent B /root/chem_b008_bw_source_placement_independent_b',
    'createdAtUTC': now,
    'independence': {
        'enteredOnlyThroughNeutralEntry': binding(ENTRY),
        'expectedNeutralEntrySHA256': EXPECTED,
        'peerAVerdictReadBeforeFreeze': False,
        'peerAProposalReadBeforeFreeze': False,
        'peerAReadmeReadBeforeFreeze': False,
        'authorFinalScientificDecisionReadBeforeFreeze': False,
        'authorCandidateFactsRead': True,
        'reviewQuestionsPresetVerdict': False,
        'prohibitedFiles': entry['doNotReadBeforeOwnFirstVerdict'],
    },
    'inputBindings': inputs,
    'actualReviewBoundary': {
        'officialPDFWholePhysicalPagesRead': entry['originalPDFPhysicalPagesToReadWhole'],
        'wholePagesReadingMethod': 'pdftotext -layout of exact original PDF; complete pages including introductions, neighboring rows, process crossreferences and operators',
        'onlinePrimaryPDFFetch': 'Official URL attempted with web tool but unavailable; exact local official PDF reviewed, no claim of remotely refreshed bytes.',
        'whole26GoalsRead': True,
        'whole26ProfileSemanticScopesRead': True,
        'whole52GermanCaseMaterialsRead': True,
        'englishRelevant10CaseMaterialsRead': True,
        'english26GoalDescriptionsRead': True,
        'other42EnglishCaseMaterialsIndependentlyReviewed': False,
        'imagesIndependentlyReviewed': False,
        'national1646InventoryReviewed': 'Exact-bound witness for BW five families and all relevant partners, no national source clearance.',
    },
    'firstScientificVerdict': 'APPROVE bounded twelve partial components and four target plus one authored prerequisiteOnly placement; HOLD newly claimed whole-source completion',
    'componentDecisions': [
        {'componentIndex': i + 1, 'sourceGoalId': c['sourceGoalId'], 'canonicalGoalId': c['canonicalGoalId'], 'candidateKey': c['candidateKey'],
         'decision': 'approve_bounded_partial_component', 'matchType': 'partial',
         'officialPhysicalPages': [c['specificPhysicalPage'], *c['primaryContextPhysicalPages']],
         'ownRationaleDe': RATIONALES[i], 'wholeSourceDutyApproved': False, 'wholeRoutineAutomaticallySourceExact': False}
        for i, c in enumerate(components)
    ],
    'programPlacement': {
        'decision': 'approve_bounded_cumulative_program_placement', 'jurisdiction': 'DE-BW', 'schoolForm': 'Gymnasium', 'stage': 'SekI',
        'originalProgramUnit': '3.2 Klassen 8/9/10', 'yearRange': [8, 9, 10], 'fixedIndividualYear': None, 'durationModel': None, 'courseProfile': None,
        'ownRationaleDe': '3.2/3.2.0 beginnt ab Klasse 8 und beschreibt gemeinsam 8/9/10; 1.2/1.3 legt spiralcurricularen Aufbau bis Klasse 10 und Weiterentwicklung bis Kursstufenende fest. Untere begrenzte Prozesslernwege passen zum gemeinsamen Bereich. Volle kumulative Prozesskompetenz ist erst am Kursstufenende ausgebildet. Nicht alle Prozessoperatoren/oberen Routinen werden SekI-Abschlüsse. Hier keine GK/LK-Zuordnung und keine erfundene G8/G9-Dauer.',
    },
    'projectionRoleDecisions': [
        {'candidateKey': key, 'goalId': goal, 'role': role, 'decision': 'approve' if role == 'target' else 'approve_bounded_authored_role',
         'authoredEntryUsesDefaultTarget': role == 'target', 'ownRationaleDe': reason}
        for key, goal, role, reason in roles
    ],
    'preservationFindings': {
        'original65BWSourceIDsRetained': True, 'original124MappingRowsExactRetained': True,
        'candidateMappingRows': 136, 'addedPartialRows': 12, 'sourceIDsAffected': 9,
        'unaffected56NormalDecisionsExactRetained': True, 'originalViewGoalEntries': 95, 'candidateViewGoalEntries': 98,
        'onlyRemovedSplitFamilyEntries': ['542822de-cb96-56cf-a487-0fc3b5820f57', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61'],
        'unaffected93OriginalViewEntriesExactRetained': True, 'originalFiveWholeFamilyDutyRecordsPreserved': True,
        'all26ScientificGoalsUnchangedAgainstSnapshot': True,
    },
    'wholeSourceAndContextHolds': [{'sourceSpan': span, 'holdDe': reason} for span, reason in HOLDS],
    'normalDecisionSemanticsBoundary': 'Die neun Entscheidungen dürfen nur begründete partielle Bindungen entscheiden und müssen alle bisherigen Partner behalten. mapped allein beweist keine vollständige Erfüllung ganzer Quellenpflichten. Schema-/Compilererfolg ist technisch.',
    'noRegressionOfPriorValidEvidence': True,
    'wholeSourceDutyApprovalsAdded': 0, 'nativeDApprovalsAdded': 0, 'PApprovalsAdded': 0,
    'strictGain': 0, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False,
}
path = ROOT / 'own-bw-source-placement.first-independent-verdict.json'
with path.open('x') as handle:
    handle.write(json.dumps(verdict, ensure_ascii=False, indent=2) + '\n')
digest = binding(path)['sha256']
(ROOT / 'own-bw-source-placement.first-independent-verdict.sha256').write_text(digest + '  ' + path.name + '\n')
print(json.dumps({'path': str(path.relative_to(REPO)), 'sha256': digest, 'bytes': path.stat().st_size, 'frozenBeforeNormalProposal': True}))

pdf = Path(entry['inputsForOwnBlindReview'][5]['path'])
page_receipts = []
for page in entry['originalPDFPhysicalPagesToReadWhole']:
    text = subprocess.check_output(['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(pdf), '-'])
    page_receipts.append({'physicalPage': page, 'printedPage': page - 2, 'completeExtractedPageTextSHA256': hashlib.sha256(text).hexdigest(), 'textBytes': len(text), 'wholePageRead': True})
receipt = {
    'role': 'Actual B page/material reading boundary, no scientific approval by receipt', 'createdAtUTC': now,
    'officialPDF': binding(pdf), 'wholePages': page_receipts, 'wholeMaterialSnapshot': binding(entry['inputsForOwnBlindReview'][-1]['path']),
    'materialItems': [
        {'candidateKey': r['candidateKey'], 'goalId': r['wholeGoal']['id'], 'wholeGoalValueSHA256': value_hash(r['wholeGoal']),
         'wholeProfileValueSHA256': value_hash(r['wholeProfile']), 'bothGermanCasesRead': [c['caseKey'] for c in r['wholeTwoCases']],
         'bothEnglishCasesRead': r['candidateKey'] in {c['candidateKey'] for c in components}, 'wholeTwoCasesValueSHA256': value_hash(r['wholeTwoCases'])}
        for r in snapshot['routineBodies']
    ],
    'peerArtifactsRead': False, 'nativePApprovalClaimed': False, 'humanApproval': False,
}
(ROOT / 'own-actual-primary-page-and-material-readings.receipt.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
