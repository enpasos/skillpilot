#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Build inactive data candidates only. No production registry writes."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent.parent
BASE = OWN.parent
REGISTRY = Path('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json')

def read(path):
    return json.loads((ROOT / path).read_text())

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def pin(path):
    path = ROOT / path
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def semantic(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

state_path = BASE / 'chemie-current454-joint-integration-candidate-technical-20261018-v2/LATEST.selected-candidate-state.pending.json'
state = read(state_path)
landscape = read(state['landscapePath'])
goals = {g['id']: g for g in landscape['goals']}
profiles = {p['goalId']: p for p in map(json.loads, (ROOT / state['wholePositiveProfileBodiesPath']).open())}
selection = read(OWN / 'AUTHOR.source-anchor-selection.pending.json')['rows']
witnesses = read(OWN / 'evidence/current-carrier-source-witnesses.inventory.json')
old = read(REGISTRY)
assert len(old['entries']) == 371
assert len(selection) == 23
assert len(witnesses) == 32
ids = [next(g for g in goals if g.startswith(pre)) for pre in ['dc146', '69f2', '3de285', 'ca216', '8721d']]
write(OWN / 'evidence/WHOLE.five-selected-goals-and-positive-profiles.json', {
    'role': 'EXACT_CURRENT_SELECTED_INACTIVE_GOAL_AND_P_BODIES',
    'canonicalLocale': 'de', 'goalInput': pin(state['landscapePath']), 'positiveInput': pin(state['wholePositiveProfileBodiesPath']),
    'records': [{'goal': goals[g], 'wholePositiveProfileRow': profiles[g], 'wholeGoalSemanticSHA256': semantic(goals[g]), 'wholeProfileSemanticSHA256': semantic(profiles[g])} for g in ids],
})

# These distinctions are an author's new acquisition judgment, not a purported
# extension of any earlier source/atomicity review.
local = {
 ('dc146', 'DE-BB'): 'BB 3.1.4 enthält den Nachweis organischer Strukturmerkmale/funktioneller Gruppen; die aktuelle Extraktion lässt den Kursstatus unspecified. Hieraus folgt keine neue amtliche vollständige Indikator-/Hydrogencarbonat- oder Laborpflicht.',
 ('dc146', 'DE-BE'): 'BE 3.1.4 enthält den Nachweis organischer Strukturmerkmale/funktioneller Gruppen; die aktuelle Extraktion lässt den Kursstatus unspecified. Die getrennte BE-ID wird verwendet; BB-Quellenidentität ersetzt keine BE-Zuordnung.',
 ('dc146', 'DE-HB'): 'HB PDF18 E-ORGANIK process GK_LK item2 ist der bestehende partielle Nachweis-Kontext. Die Extraktion ist ausdrücklich eine Primärklausel-Paraphrase, kein angebliches wörtliches Zitat. Ihre ganze qualifizierte Union und die echte Durchführungspflicht des 3de bleiben offen für tatsächliche Leistung.',
 ('dc146', 'DE-MV'): 'MV Q-Struktur/Eigenschaften006 verlangt Erkennen und Benennen der Gruppen. Diese alte partielle 3de-Zuordnung wird nur als bestehender Quellenkontext gebunden: Aus diesem Operator folgt keine amtliche Beobachtungs- oder Versuchspflicht. Die neue Erwerbsannahme bezieht sich auf den bereits breiteren ganzen SkillPilot-Nachweisträger samt seinem kontrollierten Säurefall, nicht auf eine erfundene experimentelle Bedeutung von q006.',
 ('dc146', 'DE-NI'): 'NI Q-Organik1/003 nennt Produktidentifikation durch Chlorid-, Bromid- und Hydronium/Oxonium-Nachweise. Der Säurebefund liefert hierfür den eingegrenzten empirischen/ionischen Verständniskontext, beweist aber keine Carboxygruppe und erfüllt nicht die anderen Ionen-Nachweise. Der gewählte 3de ist tatsächlich in NI-GK und NI-LK target; ca216 ist in NI-GK abwesend und wird hier nicht als Träger verwendet.',
 ('dc146', 'DE-NW'): 'NW nennt in getrennten GK- und LK-Klauseln spezifische Produktnachweise einschließlich Carboxy-Gruppe und Schluss auf den Reaktionsverlauf. Der unspezifische Säurebefund allein ist kein spezifischer Strukturbeweis und erfüllt nicht diese ganze Quellenpflicht. Er bereitet die kontrollierte, auf den Kandidatenraum begrenzte Nachweisdeutung des bestehenden ganzen 3de vor.',
 ('dc146', 'DE-RP'): 'RP Baustein1.4 nennt Nachweisprinzipien und Analyse funktioneller Gruppen. Die gebundene aktuelle Klausel ist LK; die vorhandene breitere SkillPilot-GK-Platzierung wird dadurch nicht zur amtlichen GK-Pflicht. Ein Papierbefund ersetzt keine tatsächliche qualitative Analyse.',
 ('dc146', 'DE-SH'): 'SH 3.1 Chemie und Leben nennt Säure-Base-Reaktionen, pH und Säurekonstanten im Carbonsäurekontext. Der qualitative Verhaltensbeleg wird als empirische Grundlage vor dem vorhandenen ganzen Aciditätsvergleich verwendet; aus Gasmenge/Indikatorfarbe wird keine Stärke- oder pKS-Rangfolge abgeleitet. Kurs-/Themenwahl bleibt wie im bestehenden Ziel und den Views.',
 ('dc146', 'DE-SL'): 'SL hat getrennte GK-p53- und LK-p74-Klauseln zur Beurteilung des Säurecharakters anhand von pK-Werten. Die qualitative Beobachtung ist dafür eine begrenzte empirische Grundlage und ersetzt weder bereitgestellte pK-Werte noch den eigenständigen induktiven/mesomeren Modellvergleich im ganzen ca216.',
 ('69f2', 'DE-BB'): 'BB 3.2.2 nennt einen Wertstoffkreislauf, beispielsweise PET; die aktuelle Quellzeile hat courseLevel unspecified. Der eigene PET/PE-Hydrolysebeitrag wird als Vorbereitung des ganzen beibehaltenen Kunststoffkreislaufziels angeboten, nicht als amtliche Festlegung eines hydrolytischen PET-Verfahrens.',
 ('69f2', 'DE-BE'): 'BE 3.2.2 nennt einen Wertstoffkreislauf, beispielsweise PET; die tatsächliche BE-ID bleibt eigenständig und courseLevel unspecified wird nicht umetikettiert. Die Quelle schreibt damit keinen bestimmten hydrolytischen Recyclingweg oder einen geschlossenen Kreislauf vor.',
 ('69f2', 'DE-BW'): 'BW Basisfach3.3.4(6) und Leistungsfach3.4.6(8) nennen vier Verwertungsmöglichkeiten einschließlich Kompostierung. Bindungs-/Produktverständnis unterstützt das begründete Routenurteil; eine Esterstelle garantiert keine Kompostierung. Der aktuelle vollständige 8721-Nachfolger bewahrt alle vier Wege; daraus wird keine bundesweite Vierwege- oder Hydrolysepflicht.',
 ('69f2', 'DE-BY'): 'BY C13-GA.4.13 und die im selben Normalisierungsdatensatz gebundene EA.4.15 nennen ökologische/wirtschaftliche Verwertung und Quellenkritik. Die eigene chemische Grundlage ersetzt weder Quellenprüfung noch Urteil. Die zwei echten sourceOccurrences bleiben mit ihren GA-/EA-Kontexten erhalten.',
 ('69f2', 'DE-HB'): 'HB PDF34 4.1 content GK_LK item3 unterscheidet werkstoffliche, rohstoffliche und energetische Verwertung. Der bestehende 8721-Beitrag ist partial innerhalb der ganzen Union mit459724db; die hier vorgeschlagene Grundlage schließt diese Union nicht durch Einzelzielmastery.',
 ('69f2', 'DE-HH'): 'HH 4.1/091 unterscheidet werkstoffliches/rohstoffliches Recycling und thermische Verwertung. Das neue Atom liefert für den bestehenden ganzen PET/PE-Fall die begrenzte Bindungs-/Produktgrundlage; die Quelle schreibt nicht jedes chemische Verfahren oder die gegebene Produktausbeute vor.',
 ('69f2', 'DE-MV'): 'MV Q-Kunststoffe005 verlangt eine ökologische/ökonomische Bewertung und nennt außerdem Mikroplastik, Nanomaterialien und maßgeschneiderte Kunststoffe. Die eigene Hydrolysegrundlage unterstützt nur den Kunststoff-Recyclingteil des ganzen 8721. Andere Gegenstände der Quellenunion und Mikroplastik-Nachweise bleiben eigenständig.',
 ('69f2', 'DE-NI'): 'NI Q-Makro-Nano/003 nennt den Kunststoff-Wertstoffkreislauf in GK_LK; /008 trägt das zusätzliche ökonomisch-ökologische Urteil ausdrücklich eA/LK. Die zweite Klausel wird nicht zu einer amtlichen GK-Bewertungspflicht umgedeutet. Die bestehende breitere SkillPilot-Entscheidung und ihr eigener chemischer Vorgänger werden erhalten.',
 ('69f2', 'DE-NW'): 'NW führt stoffliche und energetische Verfahren in getrennten GK-/LK-Klauseln unter Nachhaltigkeitszielen. Der PET-Hydrolyse/PE-Grenzvergleich ist eine eigene fachliche Vorbereitung auf das ganze vorhandene Routenurteil; er ersetzt keine experimentelle Trennung, tatsächliche Verwertung oder Gesamt-LCA.',
 ('69f2', 'DE-SH'): 'SH 3.2 nennt Recyclingverfahren. Die im ganzen bisherigen 8721 verankerte PET/PE-Route wird chemisch vorbereitet; der amtliche Themen- und Wahlstatus bleibt von der breiteren SkillPilot-Targetaufnahme getrennt. Keine individuelle Themenwahl wird behauptet.',
 ('69f2', 'DE-SL'): 'SL GK-p57 und LK-p77 fordern Recherche und kritische Diskussion moderner Kunststoffe einschließlich Recycling und Nachhaltigkeit. Die chemische Ableitung ist die eigene Grundlage des erhaltenen ganzen PET/PE-Falls; sie ist weder Rechercheersatz noch eine aus der Quelle abgeleitete allgemeine Hydrolysepflicht.',
 ('69f2', 'DE-SN'): 'SN bindet getrennt den J12-GK-Nachhaltigkeits-/Recyclingkontext und J12-LK PET-/biologischen Wertstoffkreislauf. Hydrolysierbarkeit ist kein Beweis biologischer Abbaubarkeit unter beliebigen Bedingungen; die eigenen chemischen Modellprodukte garantieren weder technische Wiedergewinnung noch einen geschlossenen Kreislauf. Beide Kursgrenzen bleiben erhalten.',
 ('69f2', 'DE-ST'): 'ST gAN095 und eAN240 verlangen Diskussion der Bedeutung von Kunststoffrecycling, eAN ausdrücklich Wertstoffkreisläufe. Die neue Vorbereitung gilt dem alten ganzen 8721-Ziel; eine zusätzliche amtliche Polymerhydrolyse-/Wahlpflichtfachpflicht folgt nicht. Wahlpflichtfach- und übrige Quellenunionen werden nicht verändert.',
 ('69f2', 'DE-TH'): 'TH 4.1.8/172 unterscheidet drei Verwertungswege; /173 benennt den PET-Wertstoffkreislauf. Das Erklären geeigneter Ester-Spaltstellen und der PE-Grenze bereitet diese stoffliche Unterscheidung vor; keine technische Monomerausbeute, Reinheit oder Kreislaufschließung wird aus der Papierstruktur abgeleitet.',
}
proofs, entries = [], []
for i, row in enumerate(selection):
    g, dep = goals[row['goalId']], goals[row['requiredByGoalId']]
    prefix = 'dc146' if g['id'].startswith('dc146') else '69f2'
    assert g['id'] in dep['requires']
    assert not dep.get('examData') and not any(t in dep.get('tags', []) for t in ['Practice', 'Assessment', 'Orientation', 'Motivation', 'memorization'])
    anchors = [next(x for x in witnesses if x['selectedMappingPath'] == a['selectedMappingPath'] and x['mappingEntry']['legacyGoalId'] == a['sourceGoalId'] and x['goalId'] == dep['id']) for a in row['anchors']]
    assert all(x['wholeCurrentMappingDecision']['decision'] == 'mapped' and dep['id'] in x['wholeCurrentMappingDecision']['canonicalGoalIds'] for x in anchors)
    if prefix == '69f2':
        relation = 'Der unveränderte gewöhnliche requires-Pfad 8721→69f2 trägt eine reale Erwerbsbeziehung: Das ganze 8721-e1 und seine PET-/PET-PE-Fälle verlangen, Kettenerhaltung von chemischer Spaltung und Energiegewinnung zu unterscheiden und die PET/PE-Hydrolysegrenze im begründeten Verwertungsurteil zu verwenden. Das ganze69f2-P liefert dafür geeignete Esterstellen, Wasser-/Produktzuordnung und die begrenzte PE-Negativaussage einschließlich eigenständigem Transfer auf einen anderen Polyester. Diese chemische Ableitung ist vom ökologisch-wirtschaftlichen Quellenurteil unabhängig fehlbar; daher bleibt sie getrennt assessbar, bildet aber dessen fachliche Vorbereitung. Produktformeln beweisen keine Ausbeute, Reinheit oder erneute Polymerproduktion.'
    elif dep['id'].startswith('3de285'):
        relation = 'Der unveränderte gewöhnliche requires-Pfad 3de→dc146 trägt eine reale Erwerbsbeziehung: Die selbstständige Deutung geeigneter Säure-/Vergleichsbefunde bei bekannten Carbonsäurestrukturen bereitet die Auswahl und kontrollierte Deutung des Säure-/Hydrolysenachweises im ganzen3de-P, Fall2 und required e1/e2, vor. Eine saure Indikator-/Hydrogencarbonatreaktion allein ist kein spezifischer COOH-Strukturbeweis; die eingeschränkte Aussage muss vor der unbekannten Kandidatenzuordnung verstanden werden. Die eigene beaufsichtigte Handlung samt tatsächlichem Protokoll in required e3 bleibt eine zusätzliche, durch Papierdaten unerfüllte Pflicht.'
    else:
        relation = 'Der unveränderte gewöhnliche requires-Pfad ca216→dc146 trägt eine reale Erwerbsbeziehung: Der begründete empirische Säurebeleg bei bekannten Carbonsäuren und Alkohol-/Esterkontrollen liefert die qualitative Verhaltensgrundlage für den ganzen ca216-Vergleich von Alkohol/Carbonsäure und dessen Erklärung über konjugierte Basen, Polarität, Induktion und Mesomerie. Das Beobachtungsziel ersetzt weder Modellableitung noch bereitgestellte pK-Werte; Indikator-/Gasbefunde werden nicht zu einer Rangfolge der Säurestärke hochgestuft.'
    source_list = '; '.join(a['sourceGoalId'] for a in row['anchors'])
    rationale = relation + ' ' + local[(prefix, row['jurisdiction'])] + ' Es handelt sich um die fachliche Erwerbsgrundlage des bereits breiteren beibehaltenen SkillPilot-Targets, nicht um eine neue amtliche ganze Quellenpflicht. ' + 'Aktuelle Quellenanker: ' + source_list + '. ' + 'Neue Surrogatannahme dieses inaktiven Autorenkandidaten; frühere unabhängige Split-/Source-Reviews sind ausschließlich gebundener Kontext, keine unabhängige Annahme dieses Datensatzes. Kein Schluss von Nachfolgermastery auf eigene Vorkenntnisbeherrschung, keine behauptete Lernendenleistung oder menschliche Freigabe.'
    entries.append({'landscapeId': landscape['landscapeId'], 'goalId': g['id'], 'jurisdiction': row['jurisdiction'], 'evidenceType': 'requires-closure', 'requiredByGoalId': dep['id'], 'status': 'accepted', 'rationale': rationale})
    proofs.append({'proposedRegistryIndex': len(old['entries']) + i, 'authorDecision': 'PROPOSE_ACQUISITION_SURROGATE_PENDING_INDEPENDENT_REVIEW', 'goalId': g['id'], 'jurisdiction': row['jurisdiction'], 'requiredByGoalId': dep['id'], 'actualLiteralRequires': dep['requires'], 'relationDe': relation, 'sourceBoundaryDe': local[(prefix,row['jurisdiction'])], 'sourceAnchors': row['anchors'], 'wholeGoalProfileEvidence': 'evidence/WHOLE.five-selected-goals-and-positive-profiles.json', 'wholeSourceAndDecisionEvidence': 'evidence/current-carrier-source-witnesses.inventory.json'})

keys = lambda es: [(e.get('landscapeId'), e.get('goalId'), e.get('jurisdiction'), e.get('evidenceType'), e.get('requiredByGoalId')) for e in es]
assert not set(keys(entries)) & set(keys(old['entries']))
assert len(set(keys(entries))) == 23
after = copy.deepcopy(old)
after['entries'].extend(entries)
write(OWN / 'candidate/entries23.proposed-future-accepted.pending.json', {'role': 'AUTHOR_PROPOSED_FUTURE_ACCEPTED_ROWS_NOT_CURRENT_APPROVAL', 'active': False, 'independentReviewPending': True, 'statusFieldBoundary': 'accepted is the proposed registry value only after separate independent acquisition review and integration. Production registry is unchanged; the prospective checker simulates that future state.', 'entries': entries})
(OWN / 'before').mkdir(exist_ok=True)
(OWN / 'before/registry.EXACT.json').write_bytes((ROOT / REGISTRY).read_bytes())
write(OWN / 'candidate/registry.after23.INACTIVE.pending.json', after)
write(OWN / 'AUTHOR.individual-acquisition-relations.pending.json', {'role': 'CURRENT_AUTHOR_JUDGMENT_NOT_INDEPENDENT_VOTE', 'active': False, 'independentReviewPending': True, 'humanApproval': False, 'actualLearnerPerformance': False, 'M7Claim': False, 'records': proofs, 'noEntryRequired': [{'goalId': next(g for g in goals if g.startswith('8e6b')), 'jurisdiction': 'DE-HB', 'reasonDe': 'Aktuelle direkte partielle HB-Kanten bereits vorhanden; kein zusätzlicher Surrogatdatensatz.'}], 'separateUnresolvedComponent': {'goalId': next(g for g in goals if g.startswith('b732')), 'disposition': 'OUT_OF_SCOPE_SEPARATE_PRIMARY_SOURCE_INQUIRY', 'newEntryHere': False, 'requiresEditHere': False}})
write(OWN / 'CAS.registry-append23.INACTIVE.pending.json', {'role': 'AUTHOR_INACTIVE_REVIEW_PENDING_REGISTRY_CAS', 'active': False, 'writerExecuted': False, 'independentReviewPending': True, 'activationGate': 'Separate independent scientific acquisition review of these exact23 records; later integration of the exact selected741-goal/P454/view/source candidate and its own required gates. This author package grants no activation or native evidence release.', 'operation': 'replace_whole_document_if_exact_raw_pin_and_before_object', 'targetPath': str(REGISTRY), 'beforeRawPin': pin(REGISTRY), 'beforeArtifact': pin(OWN / 'before/registry.EXACT.json'), 'afterArtifact': pin(OWN / 'candidate/registry.after23.INACTIVE.pending.json'), 'beforeSemanticSHA256': semantic(old), 'afterSemanticSHA256': semantic(after), 'beforeEntryCount': len(old['entries']), 'afterEntryCount': len(after['entries']), 'appendCount': 23, 'unchangedPrefixCount': len(old['entries']), 'allExistingRootKeysUnchanged': list(old) == list(after), 'newRegistrySchemaOrRuntime': False, 'requiresEdits': 0, 'sourceMappingEdits': 0, 'sourceExtractionEdits': 0, 'normalWrites': 0, 'compositionNote': 'Another separately reviewed registry append sharing the same before pin must be explicitly composed with duplicate-key and old-prefix checks; this CAS must not overwrite an intervening edit.'})
print(json.dumps({'authorRecords': len(entries), 'dc146': sum(e['goalId'].startswith('dc146') for e in entries), '69f2': sum(e['goalId'].startswith('69f2') for e in entries), 'sourceAnchors': sum(len(r['anchors']) for r in selection), 'beforeEntries': len(old['entries']), 'afterEntries': len(after['entries']), 'normalWrites': 0}))
