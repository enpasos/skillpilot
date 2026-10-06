#!/usr/bin/env python3
"""Materialize the fresh B review; write only this independent package."""
import hashlib
import json
import pathlib
import re
from datetime import datetime, timezone
from uuid import NAMESPACE_URL, uuid5

OUT = pathlib.Path(__file__).resolve().parent
REPO = OUT.parents[6]
AUTHOR = OUT.with_name('biologie-q1-seven-component-source-topic-corrections-author-v7')
V6 = OUT.with_name('biologie-q1-seven-component-native-source-preparation-author-v6')
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads(pathlib.Path(path).read_text())

def digest(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()

def semantic_digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def binding(path):
    path = pathlib.Path(path)
    return {'path': str(path.relative_to(REPO)), 'sha256': digest(path), 'bytes': path.stat().st_size}

effective = read(AUTHOR / 'effective-native-inputs.author-v7.json')
snapshot = read(AUTHOR / 'seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json')
contract = read(V6 / 'seven-resolved-goals-and-prerequisite-contract.author-candidate.json')
plan = read(V6 / 'twentyfour-case-to-final-id.native-binding-plan.author-v6.json')
material = read(REPO / snapshot['sourceMaterial']['path'])
native = read(OUT / 'native-source390-book383-to390-gui-superset-and-delta.actual.json')
canonical = json.loads(read(REPO / effective['canonicalEnvelope']['path'])['candidateCanonicalUTF8'])
goal_by_id = {goal['id']: goal for goal in canonical['goals']}
goal_by_key = {row['candidateKey']: row['wholeGoal'] for row in snapshot['rows']}
page_by_id = {page['goalId']: page for page in native['newSevenActualNativePages']}
new_plans = {row['candidateKey']: row for row in plan['components'] if row['ordinaryNewGoal']}
carrier = 'ac9e824f-003c-50ac-8751-2b8456004c63'

goal_reasons = {
 'classical_genetic_information_carriers_dna_gene_chromosome': {
  'science': 'Ein kohärentes Strukturmodell: DNA ist das Informationsmaterial, Gene sind funktional bezeichnete Abschnitte und Chromosomen seine organisierte Trägerstruktur. Das Ziel behauptet keine Genzahl aus einer Chromosomenzahl und keine universelle klinische Wirkung eines Allels. DE und EN haben dieselbe Reichweite.',
  'atomicity': 'Eine Relation zwischen drei ineinander verschachtelten Beschreibungsebenen; die Begriffsunterscheidung dient derselben Relation und ist keine Sammlung unabhängiger Routinen.',
  'requires': 'Kein vorheriges Genetikziel erforderlich: Der einfache Modellzugang führt die drei Ebenen selbst ein. Molekulare Chemie, vollständiger Organellenaufbau und Meiose wären unverhältnismäßige Zugangshürden.',
  'memory': 'Das Lernziel ist das Erklären einer Relation an konkreten Modellkarten. Ein isoliertes Auswendiglernen der drei Namen würde weder die Genzahlgrenze noch die Gen-/Allelrelation nachweisen. Beide Fälle liefern die verwendeten Begriffe; ein zusätzlicher Recall-Deck ist für diese Kompetenz nicht erforderlich.'},
 'mutation_levels_gen_chromosome_genome': {
  'science': 'Die Klassifikation hält lokale Gensequenzänderung, größere Abschnittsstruktur und Zahl ganzer Chromosomen auseinander. Ursachen sind in den Materialien angegeben. Funktionsdaten werden nur für das gemessene G-Protein verwendet; die Folgen sind auf unmittelbare Informationsänderungen begrenzt. Das EN-Ziel bewahrt diese Grenzen.',
  'atomicity': 'Eine begründete Klassifikationsroutine auf verschiedenen Maßstabsebenen. Ursachen und unmittelbare Informationsfolgen begründen die Zuordnung innerhalb derselben Routine; eine vollständige Mutagen-Risikobewertung oder Krankheitsdiagnose ist kein zweites Teilziel.',
  'requires': 'Der Carrier-Prerequisite liefert DNA/Gen/Chromosom als Maßstab. Fehlerursachen, Keimzellfehlverteilung und Messdaten werden geliefert; vollständige Replikation, Meiose oder Rekombination müssen nicht vorgeschaltet werden.',
  'memory': 'Die entscheidende Leistung ist die begründete Zuordnung frischer Struktur- und Zahldaten einschließlich ihrer Grenzen. Ein Katalog von Mutationsbezeichnungen als separates Pflichtdeck verbessert diese Maßstabsentscheidung nicht. Die Einordnung wird im Inhalt gelernt und an neuen Fällen angewendet.'},
 'point_and_genome_mutation': {
  'science': 'Das Ziel unterscheidet eine einzelne Basenpaarposition von der Chromosomenzahl. Das Material fixiert seine Punktmutationskonvention explizit und nutzt Substitutionen. Es behauptet keine universelle Abgrenzung aller kleinen Insertionen/Deletionen und keine genetische Unverändertheit aus einer reinen Zählung. DE/EN stimmen überein.',
  'atomicity': 'Eine evidenzbasierte Zuordnung zwischen zwei festgelegten Änderungsebenen; die Messgrenze des Zählens ist Bestandteil derselben Zuordnung.',
  'requires': 'Nur das Carrier-Modell wird vorausgesetzt. Frische Sequenzen und Chromosomenlisten werden bereitgestellt; die breitere SN/TH-Dreiebenenkompetenz ist für diesen begrenzten ST-Aspekt keine notwendige Hürde.',
  'memory': 'Das begrenzte Material definiert Punktmutation und liefert Sequenz-/Zahlinformationen. Pflicht-Recall einer Definition könnte hier sogar die ausdrücklich begrenzte Fachkonvention verdecken. Zuordnung, Positionsvergleich und Wahl einer passenden zusätzlichen Messung brauchen kein eigenes Memory-Deck.'},
 'mutagen_causes_and_protection': {
  'science': 'Der Text verbindet eine mögliche DNA-Schädigung und Fixierung mit einer begründeten Handlungsentscheidung. Vier Fälle vermeiden die Gleichsetzung von Exposition, Mutation und Krankheit. Die beiden konkreten Alltag-/Umweltfälle enthalten Kriterien, Prioritäten und Konflikte; beide Sprachen fordern ein begründetes Urteil.',
  'atomicity': 'Eine materialgestützte Entscheidung zur Verringerung einer genetischen Gefahr. Der kurze Ursachenweg erklärt, warum die Entscheidung relevant ist; Vergleich und Kriterienurteil gehören zu derselben Entscheidung. Reale individuelle Gesundheitsberatung ist nicht Bestandteil des Ziels.',
  'requires': 'Der Carrier-Prerequisite sichert die Bedeutung genetischer Information. Reparaturannahmen, Wirkmechanismen, Expositionswerte und Entscheidungskriterien werden im jeweiligen Material geliefert; ein ganzer Reparaturkurs oder eine Onkologiekompetenz ist nicht notwendig.',
  'memory': 'Die Schutzwahl muss zur konkreten Einwirkung und den belegten Kriterien passen. Eine feste Liste von Mutagenen oder Schutztipps wäre kein Nachweis dieser Kompetenz. Mechanismen und Prioritäten stehen auf den Karten; die begründete Entscheidung und die Expositionsgrenze erfordern keinen Recall-Deck.'},
 'somatic_and_germline': {
  'science': 'Zeitpunkt, Zelllinie und tatsächlich beteiligte Keimzelle bestimmen im gelieferten Tiermodell die Ausbreitung und mögliche Weitergabe. Somatische Mutation bleibt eine Mutation; Keimbahnbezug garantiert keine Übertragung an den konkreten Nachkommen. Der Text verallgemeinert das begrenzte Tiermodell nicht auf alle Fortpflanzungsweisen.',
  'atomicity': 'Eine Zelllinien-Verfolgung mit derselben kausalen Frage nach Ausbreitung und Weitergabe. Früher/später Zeitpunkt und Körper-/Keimzelllinie sind Parameter derselben Routine.',
  'requires': 'Der Carrier-Prerequisite genügt. Trennung der Linien, Tochterzellregel und Beteiligung an der Befruchtung werden geliefert. Eine vollständige Mitose-/Meioseprüfung wäre überflüssig für das nachzuverfolgende Modell.',
  'memory': 'Die Unterscheidung ist am konkreten Stammbaum der Zellen zu erklären; bloße Etiketten somatisch/Keimbahn würden gerade den Nichtübertragungsfall nicht lösen. Die zwei Modelle liefern Linien und Fortpflanzungsbedingungen. Daher kein separates Pflicht-Recall.'},
 'mutation_vs_modification': {
  'science': 'Die Vergleichsdaten trennen genetische Änderung, Umweltwirkung und bloßes Aussehen. Gleiche Merkmale schließen Mutation nicht aus; gemessene Sequenzunterschiede beweisen nicht allein den kausalen Beitrag zu allen Merkmalsunterschieden. Koexistenz beider Beiträge ist im zweiten Fall ausdrücklich möglich. DE und EN bleiben gleich begrenzt.',
  'atomicity': 'Eine begründete Ursachenunterscheidung mit Kontrolle der Aussagegrenzen. Mutation und Modifikation sind die zwei Vergleichskategorien derselben Routine.',
  'requires': 'Nur der Bezug genetischer Information aus dem Carrier-Modell. Kontrollbedingungen, genetische Befunde und Umweltwechsel werden geliefert; zusätzliche Erbgang-, Genprodukt- oder DNA-Chemieroutinen sind für diese Datenentscheidung nicht notwendig.',
  'memory': 'Ein auswendig gelernter Gegensatz erblich/nicht erblich wäre für die vorhandenen Koexistenz- und Unsicherheitsfälle zu grob. Gefordert ist die Interpretation kontrollierter Daten und die Begrenzung von Kausalität. Ein zusätzliches Memory-Deck ist nicht erforderlich.'},
 'replication_error_control_and_repair': {
  'science': 'Die korrekten Kopien sind ATGC beziehungsweise CATG mit einer Fehlpaarung jeweils an Position 3. Fehlerkontrolle und Reparatur werden getrennt, eine intakte markierte Vorlage ist vorgegeben. 30 minus 24 ergibt sechs zunächst offene Fehlpaarungen, keine sechs automatisch fixierten Mutationen. DE und EN enthalten dieselbe Funktionsgrenze.',
  'atomicity': 'Eine Erklärung der Informationssicherung im Kopiermodell; Fehler finden und vorlagenbezogen korrigieren sind zusammenhängende Schritte dieser Erklärung. Vollständiger Replikationsmechanismus und PCR-Vergleich bleiben separate Ziele.',
  'requires': 'Der Carrier-Prerequisite liefert das Informationsmaterial. Komplementarität, Markierung und Korrekturregel werden innerhalb des Lernziels geliefert beziehungsweise im ersten Fall eingeführt. Kein vollständiges Replikations- oder Enzymziel muss vorgeschaltet werden.',
  'memory': 'Die komplementäre Regel steht im Einstiegsmodell; geprüft werden ihre Anwendung, Informationskonstanz und die Fixierungsgrenze. Kein Recall der Enzyme, Effizienzwerte oder vollständigen Replikationsdetails ist nötig. Deshalb kein neues Pflichtdeck.'}
}

case_reasons = {
 'classical-carriers-a': 'Vier Chromosomen begrenzen die Zahl der Gene nicht; G ist ein Abschnitt in organisierter DNA. Die geforderte fehlende Abschnittsliste ist die richtige Evidenzgrenze.',
 'classical-carriers-b': 'Allele wechseln am selben Genort; g1→g3 fügt kein Chromosom hinzu. Ohne Produkt-/Merkmalsdaten ergibt sich keine spezifische Krankheit.',
 'levels-a': 'ACGT→ATGT ist lokal; zwölf Genkopien betreffen einen Abschnitt bei gleicher Zahl; 4→5 betrifft die Gesamtzahl. Nur der kontrollierte Proteintest in Fall 1 belegt eine niedrigere Testaktivität.',
 'levels-b': 'Basenverlust, umgedrehter Acht-Gen-Abschnitt und fehlendes ganzes C-Chromosom sind unterschiedliche Maßstäbe. Ursachen sind geliefert; keine bestimmte Proteinwirkung oder Krankheit wird aus dem Strukturwort Verlust abgeleitet.',
 'point-genome-a': 'ACTA→ATTA ändert genau Position 2 C→T; zusätzliches B3 erhöht 4→5. Chromosomenzählung allein prüft keine Sequenz.',
 'point-genome-b': 'GCAA→GCTA ändert Position 3 A→T; Fehlen von C2 vermindert 6→5. Ein definierter Sequenzvergleich ist die passende zusätzliche Prüfung einer möglichen gleichzeitigen Punktmutation.',
 'mutagen-protection-a': '3/1000, 27/1000 und 6/1000 ergeben 0,3%, 2,7%, 0,6%; die exponierte Rate ist neunfach. Die getestete Abschirmung senkt die Rate im Modell, ohne Nullrisiko oder Übertragung auf Menschen zu behaupten.',
 'mutagen-protection-b': '0,2%, 1,8%, 1,7% passen zu den drei Gruppen. Kontaktvermeidung hat eine Materialbegründung; sichtbare Papierabdeckung allein keinen Wirkungsnachweis. Gruppendaten gelten nicht deterministisch für jede Zelle.',
 'everyday-uv-risk-decision-c': 'Das Kriterienurteil ist mehr als Zahlenwahl: 10<25<100 bei gleicher Teilnahme und möglicher Umstellung begründet C, bei festem Zeitplan B. Wärme ersetzt keine UV-Messung; die fiktiven Expositionen sind keine Krankheitsprozente.',
 'environment-air-pah-risk-decision-d': 'Fünf vorgegebene Tageszentralwerte ergeben 60/10/55. B bleibt mit sicherem Buszugang trotz Zeitnachteil begründbar. Der Sichtschutz ist kein Filter; Streuungen werden nicht ohne Fehlerannahmen aggregiert, andere Wetterlagen sind ungemessen.',
 'lineage-a': 'Im getrennten Tiermodell bleibt K in Körperzellnachkommen; G kann nur durch tatsächlich beteiligte betroffene Keimzellen weitergegeben werden. Zelluläre Weitergabe und Fortpflanzungsvererbung sind korrekt getrennt.',
 'lineage-b': 'E erreicht im gelieferten Modell beide Linien; S nur späte somatische Nachkommen; die explizit nicht beteiligte G-Keimzelle überträgt in dieser Befruchtung nichts. Keimbahnbezeichnung allein ist kein Übertragungsnachweis.',
 'mutation-modification-a': 'Die genetische Unverändertheit ist ausdrücklich eine Modellannahme, ergänzt durch Abschnittsbefund; der Lichtwechsel ist Modifikation. M bleibt eine bestätigte Mutation trotz gleichem Blattwert 16.',
 'mutation-modification-b': 'Die genetische Variante bleibt; Temperatur addiert im Modell sechs vorübergehende Einheiten. Der gemessene Genunterschied beweist nicht, dass er allein den Basisunterschied 8/10 verursacht.',
 'repair-a': 'Position 3 C–A muss C–G werden, neue Kopie 5′–ATGC–3′. Sechs nicht korrigierte Fehlpaarungen sind zunächst offene Fehler; ohne Fortsetzungsdaten keine fixe Mutationszahl.',
 'repair-b': 'Position 3 gegenüber A braucht T; Kopie 5′–CATG–3′. R korrigiert, N erkennt nur. Die erneute Kopie erklärt mögliche Fixierung, liefert aber keinen universellen Reparaturwirkungsgrad.'
}

checks = []
goal_rows = []
case_rows = []
memory_rows = []
for row in snapshot['rows']:
    key, goal, gid = row['candidateKey'], row['wholeGoal'], row['goalId']
    assert gid == str(uuid5(NAMESPACE_URL, contract['namePrefix'] + key))
    assert goal == goal_by_id[gid] == next(g for g in contract['goals'] if g['id'] == gid)
    assert goal['requires'] == ([] if gid == carrier else [carrier])
    assert goal['contains'] == []
    assert row['status'] == 'ai_candidate' and row['evidenceLevel'] == 'E1' and row['gateLevel'] == 'G1'
    assert row['reviewStatus'] == 'needs_human_review' and not row['learnerEvidence'] and not row['nativeProfileCreated']
    b = new_plans[key]
    assert b['proposedCanonicalGoalId'] == gid
    assert b['caseJSONPointers'] == [c['JSONPointer'] for c in row['cases']]
    reason = goal_reasons[key]
    goal_rows.append({'goalId': gid, 'candidateKey': key, 'verdict': 'KEEP', 'fullDEENGoalRead': True,
        'title': goal['title'], 'titleEn': goal['titleEn'], 'description': goal['description'], 'descriptionEn': goal['descriptionEn'],
        'wholeGoalCanonicalJSONSHA256': semantic_digest(goal), 'nativeGoalFingerprint': page_by_id[gid]['goalFingerprint'],
        'nativePageFingerprint': page_by_id[gid]['pageFingerprint'], 'scienceAndOperatorScopeReason': reason['science'],
        'semanticAtomic': True, 'singleContentRoutineReason': reason['atomicity'], 'requires': goal['requires'],
        'minimalPrerequisiteReason': reason['requires'], 'semanticFingerprintAndNativeLedgerMaterializationPending': True,
        'nativeD_P_A_M_VApproval': False, 'humanApproval': False, 'humanTrial': False})
    memory_rows.append({'goalId': gid, 'candidateKey': key, 'verdict': 'KEEP', 'decision': 'no_memory_needed',
        'individualCurrentSemanticsReason': reason['memory'], 'reviewedWholeGoalSHA256': semantic_digest(goal),
        'memoryGoalIds': [], 'deckIds': [], 'newCardsRequired': False, 'cardAndVisibilityGate': 'not_applicable_to_this_no_memory_needed_decision',
        'nativeMemoryFingerprintAndLedgerRecordPending': True, 'nativeMApproval': False})
    for c in row['cases']:
        _, root, index, tasks, number = c['JSONPointer'].split('/')
        assert root == 'components' and tasks == 'tasks'
        original = material['components'][int(index)]['tasks'][int(number)]
        assert original == c['caseBody']
        assert semantic_digest(original) == c['caseBodyCanonicalJSONSHA256']
        case_key = original.get('caseKey', original.get('caseId'))
        assert case_key in b['caseKeys']
        case_rows.append({'goalId': gid, 'candidateKey': key, 'caseKey': case_key, 'JSONPointer': c['JSONPointer'],
            'actualCaseBodyCanonicalJSONSHA256': semantic_digest(original), 'bodyExactVsOriginalV5': True,
            'finalUUIDBindingExactVsV6PlanAndV7WholeGoal': True, 'completeDEENMaterialPromptSolutionAndPassingConditionsRead': True,
            'verdict': 'KEEP', 'scienceAndTransferReason': case_reasons[case_key],
            'status': 'ai_candidate', 'reviewStatus': 'needs_human_review', 'evidenceLevel': 'E1', 'gateLevel': 'G1',
            'learnerEvidence': False, 'nativePositiveEvidenceProfileApproved': False})
assert len(goal_rows) == len(memory_rows) == 7 and len(case_rows) == 16
write('seven-science-operator-atomicity-prerequisite.review.json', {'schemaVersion': 1, 'createdAtUTC': NOW,
    'role': 'fresh independent B full first pass; no A package or A verdict was read', 'goals': goal_rows,
    'keep': 7, 'revise': 0, 'block': 0, 'nativeDescriptionGateApproved': False, 'humanApproval': False, 'humanTrial': False})
write('sixteen-complete-material-and-final-uuid-bindings.review.json', {'schemaVersion': 1, 'createdAtUTC': NOW,
    'sourceMaterial': snapshot['sourceMaterial'], 'caseBindingPlan': snapshot['caseBindingPlan'], 'rows': case_rows,
    'caseCount': 16, 'keep': 16, 'nativePositiveEvidenceGateApproved': False, 'realLearnerEvidence': False})
write('seven-individual-memory-decisions.review.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'rows': memory_rows,
    'bulkAuthorDefaultWasNotAdoptedAsReview': True, 'nativeMApproval': False})

source_reasons = {
 ('BE', 'classical_genetic_information_carriers_dna_gene_chromosome'): 'Abschnitt 3.7 nennt Chromosomen als Träger genetischer Information und daneben DNA sowie Gen/Allel als Fachbegriffe. Die Relation ist ein begrenzter Sek-I-Aspekt; Zellteilung, Karyogramm, Mendel, Humangenetik und weitere Konzepte sind hier nicht abgeschlossen.',
 ('BB', 'classical_genetic_information_carriers_dna_gene_chromosome'): 'Die eigenständig gelesene BB-PDF-Seite 36 hat denselben 3.7-Trägeraspekt und DNA/Gen/Allel-Begriffsrahmen. Geprüft ist diese eine BB-Komponente; eine vollständige Berlin-/Brandenburg-Genetikfreigabe folgt daraus nicht.',
 ('SN', 'mutation_levels_gen_chromosome_genome'): 'Klassenstufe 10 / Lernbereich 1 auf physisch42/gedruckt30 trägt die Fortsetzung physisch43/gedruckt31. Ursachen/Mutagene und alle drei Mutationsniveaus stehen tatsächlich dort. Die erklärenden Modellfolgen sind zulässige Operationalisierung dieses Teilaspekts; named human diseases and their diagnostic/therapy duties stay separate.',
 ('SN', 'mutation_vs_modification'): 'Physisch42/gedruckt30 verlangt Anwenden der Felder Vielfalt und Information auf Genotyp/Phänotyp einschließlich erblich-/umweltbedingter Variabilität. Die Kontrollfälle operationalisieren genau diesen Vergleich. Der Abschnittscode 1 ist mit Klassenstufe10 und echter Lernbereichsüberschrift qualifiziert.',
 ('TH', 'mutation_levels_gen_chromosome_genome'): 'Die echte Überschrift 2.2.1.3 Genetik steht physisch28/gedruckt22; die Jahrgangsbindung 9/10 physisch26/gedruckt20. Physisch29/gedruckt23 nennt Gen-/Chromosomen-/Genommutation mit Ursachen/Folgen. Die Fälle liefern hierfür zusammenhängende Erklärungen; der daneben ausdrücklich geforderte Rekombinationsaspekt bleibt offen.',
 ('TH', 'mutation_vs_modification'): 'Der reale 9/10-Text in 2.2.1.3 stellt genetische Variabilität und Modifikation als Umweltvariabilität gegenüber. Die beiden kontrollierten Vergleiche erklären diesen Gegensatz und seine Evidenzgrenzen. Rekombination und weitere Genetikbulletpflichten werden durch diesen Teilvergleich nicht erledigt.',
 ('TH', 'replication_error_control_and_repair'): 'Unter 2.2.1.3 / 9/10 ist die Bedeutung von Fehlerkontrolle und Reparatur tatsächlich als Replikations-Unterpunkt genannt. Die Kopierfälle erklären genau die Informationssicherung. Der andere Unterpunkt semikonservative Replikation und der separate EA-PCR-Vergleich sind nicht mitabgenommen.',
 ('MV', 'mutagen_causes_and_protection'): 'Klasse10 physisch28/gedruckt24, unnummerierte Klassische Genetik physisch30/gedruckt26. Mutagene plus der separate reale B-Operator zum Alltagsgefahrenpotenzial tragen die vier Fälle, insbesondere die zwei Kriterienentscheidungen. Inhalt, Operator und topicCode3.2 stimmen; die als Überschriftsort gespeicherte physische4 ist jedoch nur das Inhaltsverzeichnis.',
 ('MV', 'somatic_and_germline'): 'Auf der echten Klasse10-Seite Klassische Genetik steht Auswirkungen auf Körperzellen und Keimbahn. Die begrenzten Tier-Zelllinienmodelle passen dazu. Zeitpunkt und mögliche Übertragung sind passende Erklärungen; die Abschnittsüberschrift-Ortsbindung muss von Inhaltsverzeichnis4 auf echte Überschrift17/13 korrigiert werden.',
 ('MV', 'mutation_vs_modification'): 'Der tatsächliche Originaltext nennt Vergleich von Mutation und Modifikation. Die zwei Kontrollfälle erfüllen den begrenzten Vergleich ohne automatisch das Reaktionsnorm-/Modifikationskurvenprogramm mitfreizugeben. topicCode3.2 und Klasse10 passen; parentHeading-Ortsbindung4/null muss17/13 werden.',
 ('ST', 'point_and_genome_mutation'): '3.5 Schuljahrgang10 (Einführungsphase) steht physisch/gedruckt42; Seite43 nennt ausdrücklich Genom- und Punktmutation. Die begrenzte Klassifikation passt. StageSekII ist quellentreu; GK/LK bezeichnet nur die explizite gemeinsame E-Phase in beiden späteren technischen Projektionen.',
 ('ST', 'mutagen_causes_and_protection'): 'Der ungetrennte Einführungsphasentext nennt Mutagene und separat den Bewertungsoperator Umwelteinflüsse unter genetischen Risiken. Die zwei konkreten Kriterienurteile decken diese begrenzte Operatorforderung. Rohes Kursniveau bleibt unspecified; Krebs, Beratung, Rekombinationsversuch und gesamte Originalzeile sind nicht freigegeben.',
 ('ST', 'mutation_vs_modification'): '3.5 / Einführungsphase fordert auf42 den kriteriengeleiteten Vergleich samt Schlussfolgerungen. Beide kontrollierten Modelle nutzen genetische Befunde und Umweltwechsel, einschließlich nicht entscheidbarer Kausalität. Gemeinsame technische GK/LK-Ableitung ist transparent und macht den alten Sek-I-Summary nicht richtig.'
}

source_rows = []
for entry in effective['sourceInputs']:
    if entry['kind'] != 'source-extraction':
        continue
    region = entry['region']
    data = read(REPO / entry['envelope']['path'])['candidatePayload']
    mapping_entry = next(e for e in effective['sourceInputs'] if e['region'] == region and e['kind'] == 'source-mapping')
    mapping = read(REPO / mapping_entry['envelope']['path'])['candidatePayload']
    for goal in data['sourceGoals']:
        key = goal['componentKey']
        gid = goal_by_key[key]['id']
        assert goal['id'] == str(uuid5(NAMESPACE_URL, 'https://skillpilot.com/source/' + region.lower() + '/biologie/current-genetics-components/' + key))
        assert any(m['legacyGoalId'] == goal['id'] and m['canonicalGoalId'] == gid and m['matchType'] == 'partial' for m in mapping['mappings'])
        text_path = OUT / 'sources' / f'{region}.physical-{goal["physicalPage"]:03d}.independent-b-original-pdf.txt'
        text = text_path.read_text()
        assert goal['rawSourceText'] in text, (region, key, 'raw source')
        assert goal['rawParentBulletText'] in text, (region, key, 'raw parent')
        for clause in goal.get('additionalOriginalSourceClauses', []):
            clause_path = OUT / 'sources' / f'{region}.physical-{clause["physicalPage"]:03d}.independent-b-original-pdf.txt'
            assert clause['rawText'] in clause_path.read_text()
        assert goal['isOfficialBullet'] is False and goal['wholeOriginalBulletCoverage'] is False
        assert goal['stage'] == ('SekII' if region == 'ST' else 'SekI')
        context = goal.get('sourceSectionContext')
        if context:
            expected = {'SN': '1', 'TH': '2.2.1.3', 'MV': '3.2', 'ST': '3.5'}[region]
            assert goal['topicCode'] == expected == context['officialParentCode']
        else:
            assert region in ['BE', 'BB'] and goal['topicCode'] == '3.7'
        if region == 'ST':
            assert goal['rawCourseLevel'] == 'unspecified' and goal['courseLevel'] == 'unspecified'
            assert goal['courseProfile'] == 'GK_LK' and not goal['courseProfileIsOriginalOfficialTerm']
        row = {'region': region, 'sourceGoalId': goal['id'], 'canonicalGoalId': gid, 'candidateKey': key,
            'verdict': 'REVISE' if region == 'MV' else 'KEEP', 'scienceAndOperatorFit': 'KEEP',
            'reason': source_reasons[(region, key)], 'topicCode': goal['topicCode'], 'sourceRef': goal['sourceRef'],
            'stage': goal['stage'], 'rawCourseLevel': goal.get('rawCourseLevel', goal['courseLevel']),
            'physicalPage': goal['physicalPage'], 'printedPage': goal['printedPage'],
            'originalRawClause': goal['rawSourceText'], 'originalRawParentClause': goal['rawParentBulletText'],
            'additionalOriginalSourceClauses': goal.get('additionalOriginalSourceClauses', []),
            'sourceSectionContext': context, 'independentOriginalPageBinding': binding(text_path),
            'originalRawClauseAndParentVerifiedExact': True, 'sourceComponentEnvelopeBinding': entry['envelope'],
            'componentMappingEnvelopeBinding': mapping_entry['envelope'], 'wholeOriginalSourceCoverage': False,
            'wholeOriginalSummaryPreserved': goal['wholeOriginalSummaryPreserved'], 'nativeMappingApproval': False}
        if region == 'MV':
            row['findingId'] = 'B-V7-MV-PARENT-HEADING-LOCATION'
            row['requiredMinimalCorrection'] = {'JSONPointerSuffix': '/sourceSectionContext',
                'parentHeadingPhysicalPage': {'before': 4, 'after': 17},
                'parentHeadingPrintedPage': {'before': None, 'after': 13},
                'optionalSeparateContentsIndexWitness': {'physicalPage': 4},
                'actualHeadingPage': binding(OUT / 'sources/MV.physical-017.independent-b-original-pdf.txt'),
                'goalTextRequiresUUIDCasesMemoryAndOtherSourceFieldsMustStayExact': True,
                'freshCorrectedSourceFreezeAndTargetedIndependentSourceFollowupRequired': True}
        source_rows.append(row)
assert len(source_rows) == 13
write('thirteen-source-components-scope-first.review.json', {'schemaVersion': 1, 'createdAtUTC': NOW,
    'rows': source_rows, 'keep': 10, 'revise': 3, 'block': 0, 'wholeOriginalOrNationalClearance': False,
    'all13ActualScienceOperatorFits': 'KEEP', 'integrationSourceGate': 'REVISE three MV parent heading location bindings',
    'humanApproval': False, 'humanTrial': False})

write('ST-common-entry-phase-scope.review.json', {'schemaVersion': 1, 'createdAtUTC': NOW, 'verdict': 'KEEP',
    'actualOriginalPagesRead': [3, 19, 20, 42, 43], 'sourceStage': 'SekII', 'rawCourseLevel': 'unspecified',
    'commonEntryPhase': 'Original3.5 and the common year10 row precede the separate11/12 GA/EA qualification-phase programs.',
    'derivedTechnicalProfiles': ['GK', 'LK'], 'profilesAreOfficialOriginalCourseLabels': False,
    'scopeReason': 'Die drei begrenzten Kompetenzen aus derselben gemeinsamen E-Phase dürfen in beide späteren technischen Zielprojektionen eingehen. Dies ist eine transparente Programmableitung; die Quelle benennt keine getrennten GK-/LK-Kurse in Jahrgang10.',
    'oldWrongSekISummaryAndExistingExtractionDefaultApproved': False,
    'otherWahlpflichtProgrammeImplementedOrApproved': False, 'wholeSTSourceClearance': False, 'nativeGateApproved': False})

residuals = [
 {'scope': 'BE/BB3.7 original whole page', 'verdict': 'BLOCK', 'reason': 'Nur der Trägeraspekt ist geprüft. Zellteilung, Mitose-/Meioseprinzip, Mendel-Erbgänge, Karyogramm-/Stammbaumarbeit, Humangenetik, Blutgruppen/Geschlecht und pränatale Diagnostik behalten unabhängige Quellenpflichten.'},
 {'scope': 'SN10 original full Lernbereich1 and broad summary', 'verdict': 'BLOCK', 'reason': 'Das Paket erledigt keinen vollständigen Genetik-Lernbereich: molekulare Grundlagen, Genrealisierung, Mendel, Humangenetik, Symptome/Therapie/Diagnostik/Prophylaxe konkreter Erkrankungen, Beratungsethik, Züchtung/Gentechnik und die weitere Originalstruktur bleiben getrennt.'},
 {'scope': 'TH9/10 broad genetics and replication bullets', 'verdict': 'BLOCK', 'reason': 'Die unmittelbar benachbarte Rekombination bleibt eigener Aspekt; vollständige semikonservative Replikation, Zellzyklus/Meiose, Erbgänge, Proteinbiosynthese, Karyogramm, Humangenetik und Gentechnik werden durch die drei Komponenten nicht abgenommen.'},
 {'scope': 'MV10 Klassische Genetik whole section', 'verdict': 'BLOCK', 'reason': 'Nicht automatisch mitabgedeckt: Reaktionsnorm, Modifikationskurven, agrarwirtschaftliche Anwendungen, allgemeine Mutationsbedeutung, Mendel, Krankheits-/Erbgangbeispiele, Stammbäume und weitere Prozesskompetenzen.'},
 {'scope': 'ST whole original3.5 and historical wrong SekI summary', 'verdict': 'BLOCK', 'reason': 'Die korrekte SekII-Bindung gilt nur für die drei neuen Teilaspekte. Die alte falsch etikettierte Originalzeile und ihr Default werden nicht umgestellt. Interchromosomale Rekombination samt verbindlichem Versuch, Krebs, Beratung, Gentechnik und alle übrigen Originaloperatoren behalten ihre Pflichten.'},
 {'scope': 'SH2023 outgoing and SH2026 incoming cohorts', 'verdict': 'BLOCK', 'reason': 'Keine SH-Komponente ist in diesem Paket geprüft. Die getrennten Kohorten- und Geltungsgrenzen bleiben unverändert; aus den sechs anderen Länderquellen folgt keine SH-Scope-Freigabe.'},
 {'scope': 'old3417 whole mutation/recombination goal and four operative profiles', 'verdict': 'BLOCK', 'reason': 'Keine neue Freigabe der gesamten Mutation-/Rekombinationskompetenz und keine semantische Verkürzung der vier bestehenden operativen Zielprofile. Alte gültige Arbeit bleibt erhalten; das neue Komponentenpaket ersetzt sie nicht.'},
 {'scope': 'BY12 GA/EA mutagen, somatic/germline and repair; BY9 products', 'verdict': 'BLOCK', 'reason': 'Die zusätzlichen BY-Quellenoccurrences und Gesamtoperatoren sind hier nicht geprüft. Keine Vollsicht aus Carrier-Prerequisite oder V5-Quellenunion ableiten. EA-Onkogen/Antionkogen, Zellzyklus/Apoptose und separater PCR-vs-Replikationsvergleich bleiben eigene offene Pflichten.'},
 {'scope': 'SN/TH mutagen causes vs complete exposure decision goal', 'verdict': 'BLOCK', 'reason': 'Teilpflicht Mutationsursachen macht den vollständigen Risiko-/Schutzentscheidungsoperator nicht automatisch zum Ziel in SN/TH. Nur MV und ST erhalten die neue kombinierte Zielbindung in diesem Paket.'}
]
write('retained-whole-source-and-route-boundaries.review.json', {'schemaVersion': 1, 'createdAtUTC': NOW,
    'role': 'preserved independent scope boundaries; BLOCK refers to unauthorized whole clearance, not rejection of kept component content',
    'rows': residuals, 'canonicalGLOBALIsSourceStageAuthority': False,
    'carrierPrerequisiteOnlyScopes': ['DE-MV/SekI/', 'DE-SN/SekI/', 'DE-ST/SekII/GK', 'DE-ST/SekII/LK', 'DE-TH/SekI/'],
    'carrierDirectTargetScopes': ['DE-BB/SekI/', 'DE-BE/SekI/'],
    'existingFullGUIViews': native['existingFullGUIViewChecks'],
    'newSourceViews': native['sourceViewChecks'], 'newSourceViewsAreRegisteredGUILevel2Views': False,
    'newGUISupersetRegistrationApproval': False, 'historicalFourOperativeGoalIDs': [
        '0263fb84-33b1-52a3-a47e-dad56be7c9bc', 'e349d8c4-2ba3-5360-bd44-13457e5c0aa3',
        '1ec4e3c2-f302-5246-b531-f2cebc3efb1d', 'ffef97e3-12d6-5090-9816-46ab9e57fae2'],
    'allNativeOriginalInputBindingsPreserved': native['originalInputSymlinks'], 'activeWrites': False})

write('review-status-and-remaining-gates.json', {'schemaVersion': 1, 'createdAtUTC': NOW,
    'freshIndependentB': True, 'independentAPackageOrVerdictRead': False,
    'fullActualDEENGoalsRead': 7, 'fullActualCasesRead': 16, 'actualSourceComponentsRead': 13,
    'scienceGoalVerdicts': {'KEEP': 7, 'REVISE': 0, 'BLOCK': 0},
    'sourceComponentVerdicts': {'KEEP': 10, 'REVISE': 3, 'BLOCK': 0},
    'individualMemoryDecisions': {'no_memory_needed': 7},
    'finding': 'B-V7-MV-PARENT-HEADING-LOCATION',
    'scientificGoalAndMaterialContentReview': 'KEEP within frozen bounded scopes',
    'packageSourceMetadataReview': 'REVISE three MV heading-location fields; no goal or case rewrite',
    'actualSourceAtlas': 'PASS390/390', 'pureBookModel': [383, 390],
    'all383OldGoalPagesAndWholeGoalsPreserved': True, 'all67ProtectedStrictGoalsAndPagesPreserved': True,
    'bothDAGs': native['dag'], 'allExistingGUIViewsFull': [168, 436],
    'remainingNativeGates': [
        'Corrected source metadata bytes and targeted source followup',
        'Native D two independent exact description/page/context/bundle bindings',
        'Native P positive-understanding-evidence-v2 records with actual16 bodies and honest E1/G1 candidate status',
        'Native A current semantic goal fingerprints and atomicity records',
        'Native M current individual memory fingerprints and ledger records',
        'Separate actual V scientific and visual review of each selected raster at360px and680px',
        'Reviewed GUI source-view superset registration retaining complete prior goal universes',
        'Targeted central integration check and protected Math/Physics maturity floors'],
    'nativeD_P_A_M_VApproval': False, 'independentVisualVerdict': False, 'newImagesGenerated': 0,
    'activeCanonicalMappingQALedgerRegistryWrites': False, 'historicalArtifactWrites': False,
    'nativeNewStrictCompletions': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'currentActiveBiologyStrict': '67/383', 'candidateTargetCountDoesNotEqualActiveCompletion': True,
    'humanApproval': False, 'humanTrial': False, 'commitPushPublicationDeployment': False})

print(json.dumps({'goals': 'KEEP7', 'cases': 'KEEP16', 'sources': 'KEEP10/REVISE3', 'memory': 'individual7 no_memory_needed',
    'native': 'SourceAtlas390/390; pureBook383->390; old383/67 and fullGUI168/436 preserved', 'strictGain': 0}))
