#!/usr/bin/env python3
"""Serialize this informed reviewer's finite decisions; no normal-data writes."""
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent / 'chemie-current450-source-twenty-delta-author-20261018-v1'
HIST = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-source-requires-working-checkpoint-20261017-v1/evidence/current439-requires-closure-source-surrogate-neutral-preparation-technical-v1/science'

def rel(p):
    return str(Path(p).resolve().relative_to(ROOT))

def pin(p):
    p = Path(p)
    b = p.read_bytes()
    return {'path': rel(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def oh(o):
    return hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def read(p):
    return json.loads(Path(p).read_text())

def write(name, data):
    p = OUT / name
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

GFILE = BASE / 'INPUT.whole-current-and-old-goals-profiles-and-AP.json'
AFILE = BASE / 'INPUT.whole-original-AB-twenty-approvals.json'
SFILE = BASE / 'INPUT.whole-selected-current-and-old-source-cells.json'
oldfile = HIST / 'SOURCE-CELLS.whole-current-source-goals-passages-original-locators.no-verdicts.json.snapshot'
anchorfile = HIST / 'SOURCE-ANCHORS.current-active-mapping-partners.no-review-decisions.json.snapshot'
gs, pairs, mechanical = read(GFILE), read(AFILE), read(SFILE)
preparation_receipt = read(BASE / 'RECEIPT.finite-twenty-delta-preparation.json')
originals = {}
for f in preparation_receipt['inputs']:
    if 'current439-source-surrogate-necessity-independent-' in f['path']:
        actual = pin(ROOT / f['path'])
        assert actual == f
        originals['A' if 'independent-a-' in f['path'] else 'B'] = read(ROOT / f['path'])
def point(d, pointer):
    for part in pointer.split('/')[1:]:
        d = d[int(part)] if isinstance(d, list) else d[part]
    return d
for r in pairs:
    for tag in ['A', 'B']:
        assert point(originals[tag], r['pair'][tag + '_pointer']) == r['wholeOriginal' + tag]
bygoal = {r['goalId']: (i, r) for i, r in enumerate(gs)}
olds = read(oldfile)['sourceCells']
oldlookup = {r['cellId']: (i, r) for i, r in enumerate(olds)}
sourcepaths = {r['cellId'].split('::')[0]: ROOT / r['currentSourcePin']['path'] for r in mechanical}
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical = {g['id']: g for g in read(canonical_path)['goals']}
assert len(gs) == 16 and len(pairs) == 20
normal_pins = {rel(canonical_path): pin(canonical_path)}
rowpins = {}
for r in gs:
    assert canonical[r['goalId']] == r['wholeCurrentGoal']
    p = ROOT / r['currentRowPin']['path']
    assert pin(p) == r['currentRowPin']
    native = json.loads(p.read_text().splitlines()[r['line'] - 1])
    assert native['goalId'] == r['goalId'] and native['profile'] == r['wholeCurrentProfile']
    rowpins[r['goalId']] = native
    for f in [p, ROOT / r['configPin']['path']]:
        normal_pins[rel(f)] = pin(f)
    assert pin(ROOT / r['configPin']['path']) == r['configPin']

changed_p_core_checks = []
for r in gs:
    if r['wholeProfileExactOld']:
        assert r['wholeOldProfile'] == r['wholeCurrentProfile']
        continue
    old, current = r['wholeOldProfile'], r['wholeCurrentProfile']
    assert old['expectations'] == current['expectations'][:len(old['expectations'])]
    assert old['variationAxes'] == current['variationAxes'][:len(old['variationAxes'])]
    assert old['coverageExpectations']['requiredExpectationIds'] == current['coverageExpectations']['requiredExpectationIds'][:len(old['expectations'])]
    for before, after in zip(old['applicationCaseBriefs'], current['applicationCaseBriefs']):
        for key, value in before.items():
            assert after[key].startswith(value) if isinstance(value, str) else after[key] == value
    changed_p_core_checks.append({'goalId': r['goalId'],
        'oldExpectationsAndVariationAxesRetainedExactly': True,
        'oldCaseFieldsRetainedExactlyOrAsExactStringPrefix': True,
        'newExpectationIds': [x['id'] for x in current['expectations'][len(old['expectations']):]],
        'scopeReadScientifically': 'New expectation and relevant appended case text explicitly restrict the added completion duty to the HB source route.'})

science = {
 0: {
 'sourceToEndpointDe': 'Die BB-Zelle nennt Säure-Base-Titration zur Konzentrationsbestimmung mit Indikatoren bei neutralem Äquivalenzpunkt. Die alte Originallesung ordnet diesen Anteil dem gemeinsamen GK/LK-Bereich mit Durchführung zu. Genau diese praktische Titration bleibt Bestandteil von 026; die heutige HCl/NaOH-Planung und echte Protokollierung liefern den passenden Endpunktanteil.',
 'requiresSupportDe': 'Die Kante 026.requires enthält weiterhin 13d4. Arbeitsplatz, Schutzbrille, eindeutige Gefäßzuordnung und angemessene Spritzreaktion sind für die tatsächlich verlangte Säure/Base-Handhabung nötig. Die sichere Modellplatzhandlung des Vorziels ist eine Erwerbsgrundlage; bereitgestellte Titrationswerte beweisen keine Laborhandlung.',
 'deltaReasonDe': '13d4 verliert nur die vorgelagerte Kante zu 416dfd33; 026 verliert nur die andere Kante zu 11bea4c6. Weder der ausgewählte 13d4→026-Weg noch die vollständigen beiden P-Bodies oder die praktische Leistung ändern sich. Die Quelle-Sicherheit-Titrations-Begründung besteht daher konkret fort.',
 'limitDe': 'BB-Quelle nur für den genannten Titrationsanteil; daraus folgt keine ganze Deckung aller H2SO4-, Verdünnungs- oder Soforthilfe-Transferfälle und keine durchgeführte Lernendenleistung.'},
 1: {
 'sourceToEndpointDe': 'Die BE-Zelle aus derselben gemeinsamen BB/BE-Tabelle verlangt indikative Säure-Base-Titration zur Konzentrationsbestimmung im neutralen Äquivalenzbereich. Das aktuelle 026-Profil hält begründete Indikatorwahl, reale fachgerechte Durchführung und dokumentierte Volumenauswertung getrennt verbindlich.',
 'requiresSupportDe': 'Für diese reale Verwendung von Maßlösung, Probe und Glasgeräten bleibt allgemeines situationsgerechtes Laborverhalten aus 13d4 nötig. Der direkte requires-Eintrag in 026 ist vorhanden; ein bekanntes Farbsignal oder ein gelöstes Zahlenprotokoll ersetzt die sichere Handlung nicht.',
 'deltaReasonDe': 'Die entfernten Eingänge 416dfd33→13d4 und 11bea4c6→026 liegen außerhalb der ausgewählten direkten Relation. Beide Kompetenzbeschreibungen und vollständigen Profile sind unverändert. Die praktische Quellenleistung wird weder in Theorie umgewandelt noch um eine andere Quelle erweitert.',
 'limitDe': 'BE-SekII-GK/LK-Kontext des Titrationsanteils. Keine allgemeine Quellenfreigabe sämtlicher Profilvarianten oder aller Sicherheitsregeln.'},
 2: {
 'sourceToEndpointDe': 'Verbindlich gewählt ist der von A und B tatsächlich qualifizierte BW-SekI-Anker c649: 3.2.2.2(6), eine Säure-Base-Titration durchführen und auswerten. Die Primärseite physisch23/gedruckt21 wurde erneut als PDF-Text gelesen; sie bestätigt den Ausführungsoperator. 026 verlangt weiterhin genau einen echten praktischen Durchführungsbeleg zusätzlich zur Auswertung.',
 'requiresSupportDe': 'Die unveränderte 13d4-Kompetenz trägt die sichere Vorbereitung und situationsgerechte Reaktion beim tatsächlichen Titrationsarbeiten. 026.requires enthält 13d4 weiterhin unmittelbar.',
 'deltaReasonDe': 'Die beiden entfernten anderen Eingänge ändern die aktuelle Sicherheits- oder Titrationsleistung nicht. Der mechanisch aufbewahrte LK-Anker c6c8 zur Oberstufe wird ausdrücklich nicht als gemeinsam gelesener SekI-Nachweis fortgeschrieben. Fortgeltung wird auf den gemeinsamen tatsächlichen SekI-Anker neu gebunden.',
 'limitDe': 'Nur der BW-Standard Klassen8/9/10, physisch23, und die notwendige Sicherheitsgrundlage dieses Titrationsanteils. Die gemeinsame Quelle begründet keine allgemeine LK- oder ganze CrossStage-Pflicht.'},
 3: {
 'sourceToEndpointDe': 'A und B qualifizieren den NI-Anker b027 zur tatsächlichen Ermittlung der Stoffmengenkonzentration durch Titration. Die mechanisch ausgewählte reine Beschreibung der Indikatorfunktion ist dafür nicht ausreichend und wird nicht als Urteilsgrund verwendet. 026 hält die echte beaufsichtigte Durchführung weiterhin obligatorisch.',
 'requiresSupportDe': 'Die tatsächliche Probe-/Maßlösungshandhabung benötigt die sicher angewandten Laborregeln 13d4. Die zugehörige direkte Kante besteht heute unverändert.',
 'deltaReasonDe': 'Die Kompetenz- und Profiltexte beider Knoten bleiben exakt. Nur fremde Eingangskanten wurden gestrichen. Die heute gebundene gemeinsame Quellenzelle zur Titration ist ebenfalls exakt wie im alten neutralen Originalkontext; deshalb bleibt gerade die praktische Sicherheitsnotwendigkeit bestehen.',
 'limitDe': 'Gemeinsamer NI-SekII-Kern Titration; mehrprotonige Berechnungen sind im Original zusätzlich eA-markiert und werden hier nicht zu gA-Pflichten oder ganzen Sicherheitsquellen erklärt.'},
 4: {
 'sourceToEndpointDe': 'Der gemeinsame qualifizierte HH-Anker 525d verlangt rechnerische Auswertung von Säure-Base-Titrationen auf S.30. Der alte B-Originalbefund trennt die gemeinsame Konzentrationsbestimmung vom LK-Kurvenzusatz. Das aktuelle 026 verlangt eigenständig hergeleitetes n=cV, richtige analytische Bezugsmenge, Reaktionsverhältnis und Aliquotrechnung.',
 'requiresSupportDe': 'Diese Rechnungen verwenden mol als Maß der Zahl ausdrücklich bestimmter reagierender Einheiten. Genau das lehrt 1dc einschließlich der Trennung von Molekül-, Atom-, Ionen- und Formeleinheitsbezug. 026.requires enthält 1dc weiterhin.',
 'deltaReasonDe': '1dc erhält zusätzliche explizite Länderzuordnungen, darunter HH; sein gesamtes P ist unverändert. Das Entfernen des anderen 026-Eingangs 11bea ändert weder den cV-/Aliquotauftrag noch den 1dc-Weg. Der alte mechanische LK-Aminosäure/Puffer-Anker wird durch den tatsächlich gemeinsamen Titrationsrechenanker ersetzt.',
 'limitDe': 'Nur die nötige Mol-Erwerbsgrundlage für den gemeinsamen HH-Titrationsrechenanteil. Keine ganze amtliche Deckung jedes 1dc-Zählfalls und kein praktischer Vollzugsbeleg aus Zahlen.'},
 5: {
 'sourceToEndpointDe': 'Die erneut gelesene MV-Primärseite physisch28/gedruckt24 enthält im verbindlichen gemeinsamen Teil Maßanalyse, Prinzip/Auswertung der Titration, Konzentrations-/Stoffmengen-/Massenrechnung und SE-Neutralisationstitration. Das heutige 026-P verlangt weiterhin die fachlich passende Stoffmengenbilanz und Konzentrationsbestimmung.',
 'requiresSupportDe': 'Die direkte Kante 026→1dc ist aktiv; der eindeutig auf benannte Teilchen bezogene Molbegriff trägt die verlangte cV-, Reaktionsfaktor- und Aliquotrechnung sachlich weiterhin. Die Profile von 1dc und 026 sind vollständig unverändert.',
 'deltaReasonDe': 'Die Länderergänzung bei 1dc und die entfernte andere Eingangskante von 026 beseitigen diese Unterstützung nicht. Für eine gemeinsame Fortgeltungsbindung fehlt jedoch ein identischer konkret qualifizierter Anker: A nennt 5fe92 (Zelle007 Maßanalyse/Prinzip), B nennt in seinen tatsächlichen Alternativen cb6ed (Zelle008 Rechnungsanteil). Beide sind sachlich verwandt, aber nicht dieselbe beidseitig entschiedene Relation. Daher HOLD trotz fortbestehender fachlicher Plausibilität.',
 'limitDe': 'Kein Fortgeltungs-APPROVE aus gleichem Blatt, gleicher Überschrift oder gleicher Länderanwendbarkeit. Kleinster offener Schritt ist die gezielte beidseitige Entscheidung desselben aktuellen konkreten MV-Ankers; kein neuer D/P/A/M/V- oder Ganzreview ist hier enthalten.'},
 6: {
 'sourceToEndpointDe': 'Zwei gemeinsame qualifizierte NW-Anker sind erhalten: GK Indikatortitration starker Säuren/Basen durchführen und mit Fehleranalyse auswerten, LK Indikatortitration durchführen und auswerten. 026 verlangt weiterhin die zugehörige fachliche Konzentrationsauswertung aus c, V und chemisch begründetem Stoffmengenverhältnis.',
 'requiresSupportDe': '1dc liefert dafür den eigenständigen Stoffmengen-/Molbezug; falsche Umbenennung von Molekülen, Ionen oder Formeleinheiten würde die Bilanz verfälschen. Die Kante 026.requires→1dc bleibt aktiv.',
 'deltaReasonDe': 'Nur die Länderzuordnung von 1dc und ein anderer Eingang von 026 ändern sich; beide P-Bodies bleiben exakt. Bindung erfolgt kursgetrennt an die schon von A und B qualifizierten GK-/LK-Ausführungsanker, nicht an den mechanischen reinen LK-Verfahrensbewertungsanker.',
 'limitDe': 'GK und LK bleiben getrennte Quellenoperatoren. Weder LK-Verfahrensbewertung noch sämtliche H2SO4-/Aufstockungsvarianten werden als gemeinsamer amtlicher Pflichtumfang ausgegeben. Durchführung bleibt ein eigener tatsächlicher Nachweis.'},
 7: {
 'sourceToEndpointDe': 'Der gemeinsame SH-Anker 53a8 nennt quantitative Analysemethoden mit Säure-Base-Titration und Konzentrationsberechnung. 026 verlangt weiterhin eine verständig entwickelte Konzentrations-/Reaktionsstoffmengenrechnung. Der historische Befund grenzt detaillierte LK-Titrationskurven ausdrücklich aus dem gemeinsamen Nachweis aus.',
 'requiresSupportDe': 'Die Molkompetenz 1dc ist für die eindeutige Stoffmengengröße, den Reaktionsfaktor und die proportionalen Probenanteile weiterhin nötig. Die direkte Kante und die ganzen unveränderten Profile tragen dies konkret.',
 'deltaReasonDe': 'Die hinzugefügte explizite SH-Zuordnung ändert keine Kompetenz. Die gestrichene andere 026-Kante 11bea berührt den ausgewählten 1dc-Weg nicht. Neu gebunden wird der gemeinsame quantitative Anker; der mechanische reine LK-Titrationskurvenanker bleibt Auditgeschichte.',
 'limitDe': 'Nur gemeinsamer SH-Analysekern und dessen notwendige Erwerbsgrundlage. Keine Hochstufung von LK-Kurven, keine ganze 1dc-Quellendeckung und kein behauptetes Schülerexperiment.'},
 8: {
 'sourceToEndpointDe': 'Die getrennten gemeinsamen A/B-Zeugen für ST-gAN und ST-eAN verlangen Säure-Base-Titration als quantitatives Verfahren beschreiben und anwenden. Das aktuelle Titrationsprofil verwendet weiterhin Analysenstoffmenge, cV, chemischen Reaktionsfaktor und Aliquot-/Verdünnungsbezüge.',
 'requiresSupportDe': 'Die Bedeutung von mol als Zählmaß benannter Einheiten ist für diese stöchiometrische Konzentrationsauswertung fachlich notwendig. 1dc und 026-P bleiben unverändert; die Kante ist vorhanden.',
 'deltaReasonDe': 'Die Ländererweiterung bei 1dc ergänzt ST ausdrücklich. Die entfernte andere Kante von 026 verändert diese Relationsleistung nicht. Als aktuelle gemeinsame Wissenschaftsbelege werden die zwei Titrationszellen gebunden; der mechanische gAN-Wissenspunkt KB/pKB ersetzt sie nicht.',
 'limitDe': 'gAN und eAN sind je mit eigenem Anker belegt. Kein eAN-Zusatz wird zu gAN-Pflicht, keine ganze Deckung des mehrteiligen SkillPilot-Profils behauptet.'},
 9: {
 'sourceToEndpointDe': 'Der TH-Anker 18db verlangt Erläuterung der Titration sehr starker Säure/Base mit Farbindikator und Berechnung von Stoffmengenkonzentration bzw. Massenanteil. Der unveränderte 026-Kern entwickelt Stoffmenge je ursprüngliches Probenvolumen und berücksichtigt Reaktionsverhältnis und Aliquot.',
 'requiresSupportDe': '1dc ist dafür als eindeutiger Mol-/Teilchenbezug nötig; die stöchiometrische Bilanz darf nicht durch Masse, bloßes Volumen oder unbestimmte Teilchen ersetzt werden. Die direkte 026→1dc-Kante besteht.',
 'deltaReasonDe': '1dc erhält TH als explizite Länderzuordnung; seine Leistungsanforderungen ändern sich nicht. Die einzige Änderung am Titrationsziel betrifft die andere 11bea-Eingangskante, nicht den gewählten Molweg. Quelle, Operator und dazugehöriger Rechenkern bleiben erhalten.',
 'limitDe': 'Gemeinsame linke TH-Spalte mit sehr starken Säuren/Basen; keine Übertragung der rechten eA-Zusätze. Rechnungsbezug ist kein Laborvollzugsnachweis und deckt nicht jedes Transferdetail amtlich.'},
 10: {
 'sourceToEndpointDe': 'BW 3.2.2.2(7) verlangt Berechnungen mit Größen und Einheiten einschließlich Stoffmenge und molarem Volumen. Die nochmals gelesene Primärseite physisch23 nennt nicht wörtlich eine universelle Avogadro-Pflicht. Das Endpunktprofil 2924 verwendet jedoch genau diesen fachlichen Vm-Anteil für unterschiedliche ideale Gase mit festgelegtem T/p und Zustandswechsel.',
 'requiresSupportDe': 'Die gemeinsame Volumen-pro-mol-Beziehung und die Auswahl passender Zustandsdaten beruhen auf der Avogadro-Beziehung gleicher Teilchenzahlen bei gleichem T/p. 1e5 begründet Bedingungen, Teilchenbezug und die Abgrenzung zu Masse/Atomzahl; 2924.requires enthält 1e5 unverändert.',
 'deltaReasonDe': 'Nur der weitere Eingang 5c4788a7→1e5 wurde entfernt. Die 1dc-Grundlage, der ausgewählte 1e5→2924-Weg und beide vollständigen Profile bleiben. Der fachliche Erwerbsträger besteht fort; die historisch weiter formulierte Quellenbeschreibung wird hier auf den tatsächlich gelesenen Berechnungsoperator begrenzt.',
 'limitDe': 'BW-SekI-Berechnungsanteil, keine wörtliche oder ganze amtliche Avogadro-Quellenpflicht; keine kinetische Herleitung und keine behauptete Durchführung.'},
 11: {
 'sourceToEndpointDe': 'Die gemeinsame NI-Quellenzelle verlangt Beurteilung von Gefahren und Sicherheit in Labor und Alltag. Der erhaltene Laborkern von ebaa beurteilt konkrete Spritz-/Einatemexposition und begründete Schutzoptionen; dafür ist 4b6 mit tätigkeits- und stoffbezogener Schutzbegründung ein konkreter Träger.',
 'requiresSupportDe': 'ebaa.requires enthält unverändert 4b6. Aus dem Gefahrenmerkmal allein lässt sich keine geeignete Risikominderung ableiten; Kontaktweg, tatsächliche Arbeitsweise und die passende Schutzmaßnahme müssen kausal zusammenpassen. Das leisten die unveränderten 4b6-Fälle.',
 'deltaReasonDe': 'Der neue ebaa-P-Anteil ist ausdrücklich nur HB-SekII-Alltag: fiktiver Haushaltsfall plus Sprühtransfer. Die ursprüngliche Laborerwartung und beide Laborfälle sind unverändert; für NI entsteht daraus keine neue Haushalts-Abschlussbedingung. Deshalb bleibt die bestehende Schutzmaßnahmen→Laborrisikobeurteilung-Relation sachlich gleich.',
 'limitDe': 'Der NI-Laboranteil trägt die notwendige Erwerbsgrundlage. Dieses Follow-up zertifiziert weder den gesamten NI-Operator Labor UND Alltag noch HB-Zusatzpflichten für NI; Papier-Risikobeurteilung ist keine reale Anwendung.'},
 12: {
 'sourceToEndpointDe': 'Gemeinsam qualifiziert ist NI-Anker379c: Korrosionsschutz durch Opferanode erklären. 94a verlangt weiterhin die kausale Erklärung der Opferoxidation, Elektronen-/Ionenwege, Barriere-/Defektwirkung und Wartung; darauf baut die ökologische/ökonomische Abwägung auf.',
 'requiresSupportDe': 'Die unveränderte 642d-Kompetenz erklärt Lokalelemente, bevorzugte Oxidation, kathodischen Schutz und Kontaktbedingungen. Ohne diese Kausalität wäre 94a nur Kostenvergleich. 94a.requires enthält 642d weiterhin direkt.',
 'deltaReasonDe': '642d erhält NI ausdrücklich und verliert einen anderen vorgeschalteten Eingang 22133f29; seine eigene galvanische Grundlage f093 bleibt. Beide vollständigen P-Bodies sind identisch zum ursprünglichen Urteil. Die Bindung verwendet die gemeinsam qualifizierte Opferanodenzelle, nicht den mechanischen anderen Sauerstoff-/Säurekorrosionsanker.',
 'limitDe': 'Nur notwendige Korrosionsgrundlage des Opferanoden-/Schutzanteils. Keine amtliche ganze Deckung von Differenzbelüftung, Fremdstromtransfer, Ökobilanz oder Experimentdurchführung.'},
 13: {
 'sourceToEndpointDe': 'A und B überlappen auf NI-Anker8af6: Prinzip der Elektrolyse erläutern, gemeinsamer Kursbereich. Der aktuelle fd79-Kern verlangt unverändert Ionenwanderung, Elektrodenreaktionen, Produktverhältnisse und Energievergleich mit galvanischer Zelle.',
 'requiresSupportDe': 'Die Deutung einfacher NaCl-Schmelz- und festgelegter CuCl2-Lösungs-Elektrolyse aus 70b bildet die dafür nötige qualitative Elektroden-/Energiegrundlage. fd79.requires enthält 70b direkt; die 70b-Kompetenz ist nicht von selbst ausgeführter Elektrolyse abhängig.',
 'deltaReasonDe': 'fd79 ergänzt nur einen ausdrücklich HB-begrenzten Auftrag zur eigenen schematischen Darstellung beider Zellarten. Seine beiden ursprünglichen Erwartungen und Fälle bleiben exakt; für NI werden weder neue Schemapflicht noch praktische Chloraktivität eingeführt. Der echte gemeinsame Prinzip-Anker ersetzt im aktuellen Bindungsrecord den mechanischen Bau-Beschreibungsanker.',
 'limitDe': 'Gemeinsamer NI-qualitativer Elektrolysekern. Keine LK-Faraday-Ausweitung, keine generelle Gleichheit der Produktmengen, kein Versuchsvollzug und keine ganze HB-Schema-Quellenfreigabe.'},
 14: {
 'sourceToEndpointDe': 'Der gemeinsame SH-Anker036b nennt Elektrolyse als erzwungene Redoxreaktion zur Stoffgewinnung. fd79 verlangt weiterhin die Erklärung der erzwungenen Elektrodenprozesse und die entgegengesetzte Energierichtung gegenüber der galvanischen Zelle.',
 'requiresSupportDe': '70b liefert konkrete Ionenwanderung, Oxidation/Reduktion und die Notwendigkeit elektrischer Energie an geeigneten Salzbeispielen. Genau das braucht der aktuelle Vergleich; die direkte requires-Kante ist erhalten.',
 'deltaReasonDe': 'Die fd79-P-Änderung fügt nur den HB-begrenzten eigenen Schemaauftrag an. Die ursprünglichen NaCl-/CuCl2-Fälle, Gleichungen, Mengenverhältnisse und Modellgrenzen sind identisch. Außerhalb HB besteht ausdrücklich keine zusätzliche Abschlussbedingung; damit bleibt der SH-Quellenweg sachlich unverändert.',
 'limitDe': 'Gemeinsamer SH-Kern zur erzwungenen Redoxreaktion; quantitative LK-Erweiterungen werden nicht auf gA übertragen. Vorliegende Papiermodelle sind kein praktischer Elektrolysenachweis.'},
 15: {
 'sourceToEndpointDe': 'BW 3.2.2.2(3) verlangt Reaktionsgleichungen in Formelschreibweise. 11bea leitet weiterhin ganzzahlige Gleichungen und Teil-/Gesamtgleichungen mit erhaltener Stoffidentität, Atomzahl und Ladung ab; Mg/Cl2 und Natrium/Wasser erhalten jeweils frischen Al-/Ca-Transfer.',
 'requiresSupportDe': 'Die unveränderte e7-Kompetenz liefert richtige Elementsymbole, Formelindizes und die Trennung vom Koeffizienten. Ohne dieses Lesen/Formen der Stoffformeln wäre das geforderte Ausgleichen nicht chemisch korrekt. 11bea.requires enthält e7 direkt.',
 'deltaReasonDe': 'e7 verliert nur seinen eigenen vorgelagerten Eingang 9b5d6326. Der ausgewählte direkte Weg, der komplette Symbol-/Formelkern und der vollständige Endpunktkörper bleiben unverändert. Der gemeinsame BW-Anker und dessen Operator sind gleich geblieben.',
 'limitDe': 'Nur nötige Symbol-/Formelgrundlage für den BW-SekI-Gleichungsanteil. Keine behauptete Durchführung der im Papierfall erwähnten Stoffreaktionen und keine ganze amtliche Deckung aller Redox-Transferdetails.'},
 16: {
 'sourceToEndpointDe': 'Der gemeinsame HH-Anker1f49 fordert Reaktionsgleichungen mit Oxidationszahlen. Der aktuelle 11bea-Kern verlangt weiterhin das fachlich richtige Formulieren und Bilanzieren von Stoff- und Teilgleichungen; der Quellenanteil an der Formelschreibweise bleibt relevant.',
 'requiresSupportDe': 'Das vorausgesetzte e7-Verständnis von Atomsorte, Molekülformel, Index und Koeffizient verhindert das Ändern der Stoffidentität beim Bilanzieren. 11bea.requires enthält e7 unverändert.',
 'deltaReasonDe': 'Die einzige Änderung bei e7 ist der Wegfall eines anderen vorgeschalteten Eingangs. Beide ganzen Profile und der ausgewählte direkte Gleichungsweg sind identisch. Die durch die konkrete HH-Quelle motivierte Formeldeutung bleibt erforderlich.',
 'limitDe': 'Der gemeinsame Studienstufen-Operator stützt den nötigen Formelanteil. Das aktuelle Endpunktprofil ist kein durch dieses Follow-up bestätigter Vollnachweis der Quellenpflicht Oxidationszahlen und keine ganze CrossStage-Routenfreigabe.'},
 17: {
 'sourceToEndpointDe': 'Die gemeinsamen qualifizierten NW-GK- und NW-LK-Anker verlangen Brønsted-Klassifikation und Reaktionsdeutung mit Protolysegleichungen. 1c formuliert weiterhin neue HF-/NH3- und Phosphat-Protolysefälle mit korrespondierenden Paaren, Protonenweg und Atom-/Ladungsprüfung.',
 'requiresSupportDe': 'Der unveränderte e7-Kern ist für korrekte Formelindizes und Erhalt der Teilchenidentität nötig; Protonabgabe/-aufnahme verändert die Zusammensetzung gezielt statt durch beliebige Schreibzeichen. 1c.requires enthält e7 weiterhin unmittelbar.',
 'deltaReasonDe': 'e7 verliert den vorgeschalteten 9b5d-Eingang; 1c verliert den anderen fd309-Eingang. Der ausgewählte e7→1c-Weg und beide ganzen Profile bleiben exakt. Statt des mechanischen SekI-PSE-Vorhersageankers werden die tatsächlich gemeinsam entschiedenen, kursgetrennten Brønsted-Zellen gebunden.',
 'limitDe': 'GK und LK jeweils nur mit ihrem eigenen Protolyseanker. Keine PSE-Abkürzung, keine ganze Quellendeckung der Ampholyttransferfälle oder universelle Pflicht eines besonderen Stoffbeispiels.'},
 18: {
 'sourceToEndpointDe': 'Die vollständig gelesene RP-Zelle enthält im zusammengeführten Rohtext ausdrücklich: Oxonium-Kationen reagieren mit Hydroxid-Anionen zu Wassermolekülen und Neutralisationsreaktionen werden mit Reaktionsgleichungen beschrieben. Dieser begrenzte Gleichungsanteil stützt 11bea, auch wenn die übrige breite Zellzusammenfassung nicht vollständig vom Endpunkt abgedeckt wird.',
 'requiresSupportDe': 'e7 liefert weiterhin die nötige Deutung der Atomsorten, Formeln und Indizes gegenüber Koeffizienten. Die Atom-/Ladungsbilanz des aktuellen 11bea-P kann Stoffidentität nur damit erhalten; die direkte Kante ist aktiv.',
 'deltaReasonDe': 'Nur der weitere e7-Voreingang 9b5d fällt weg. Die gesamte ausgewählte Relation und die beiden P-Bodies sind identisch. Die RP-Zelle ist heute exakt dieselbe; die alte Originallesung physisch78/gedruckt76 bleibt für den genannten Teil gültig.',
 'limitDe': 'RP-SekI-Teilanteil Neutralisationsgleichung; der rohe courseLevel GK_LK ist keine SekI-GK/LK-Pflicht. Kein ganzer Deckungsnachweis der langen Zellzusammenfassung, der besonderen Redoxfälle oder praktischer Neutralisation.'},
 19: {
 'sourceToEndpointDe': 'Der gemeinsame NI-Anker0de1 verlangt die tatsächliche Durchführung der Iod-Stärke-Reaktion. Der aktuelle 8fe-Kern hält reale beaufsichtigte Nachweisausführung, Kontrollen, getrennte Proben, Dokumentation und begrenzte Interpretation ausdrücklich fest.',
 'requiresSupportDe': 'Die geforderte kontrollierte Nachweisausführung benötigt die sichere angeleitete Untersuchungskompetenz e81: vorgeschriebene Schritte/Variablen einhalten, echte Beobachtungen führen und auf die Hypothese beziehen. Die direkte Kante 8fe.requires→e81 besteht weiterhin.',
 'deltaReasonDe': 'e81 erhält nur einen ausdrücklich HB-SekII-begrenzten elektronischen Rohprotokollzusatz. Die ursprünglichen sicheren Handlungen, eigenen Werte, Kontroll-/Hypothesenauswertung und Transferanforderungen bleiben erhalten; daraus entsteht für NI keine Digitalpflicht. 8fe verliert lediglich BW/HB-Zuordnung; NI bleibt anwendbar und sein ganzes Profil exakt unverändert.',
 'limitDe': 'Nur der gemeinsame NI-Iod-Stärke-Durchführungsanteil und dessen nötige sichere Erwerbsgrundlage. Keine Übertragung der LK-Biuret-Pflicht auf gA, keine ganze amtliche Deckung von GOD-, Fett-, DCPIP- oder Leitfähigkeitsfällen und kein erfundener tatsächlicher Vollzug.'}
}

# The historic common witness is computed from actual A qualification and B's
# explicitly read scientific alternatives, never from the mechanical audit slot.
common = []
for r in pairs:
    ids = set(r['wholeOriginalA']['qualifiedSupportingAnchorIds'])
    common.append([a for a in r['wholeOriginalB']['sameEndpointWitnessAlternatives'] if a['anchorId'] in ids])
assert [i for i, a in enumerate(common) if not a] == [5]
mv_a = next(a for a in read(anchorfile)['anchors'] if a['anchorId'] == 'anchor-5fe92aa586d0d84acf53')
selected = {}
for witnesses in common:
    for a in witnesses:
        selected[a['sourceCellId']] = a
for a in pairs[5]['wholeOriginalB']['sameEndpointWitnessAlternatives']:
    selected[a['sourceCellId']] = a
selected[mv_a['sourceCellId']] = mv_a

source_supplement = []
for cell_id, anchor in sorted(selected.items()):
    oi, old = oldlookup[cell_id]
    sp = sourcepaths[cell_id.split('::')[0]]
    sd = read(sp)
    gi, current = next((i, g) for i, g in enumerate(sd['sourceGoals']) if g['id'] == old['wholeCurrentSourceGoal']['id'])
    assert current == old['wholeCurrentSourceGoal']
    normal_pins[rel(sp)] = pin(sp)
    source_supplement.append({
        'cellId': cell_id,
        'wholeCurrentSourceGoal': current,
        'wholeOldSourceGoal': old['wholeCurrentSourceGoal'],
        'sourceGoalActuallyExactOld': True,
        'wholeObjectHash': oh(current),
        'currentSourceFile': pin(sp), 'currentPointer': f'/sourceGoals/{gi}',
        'oldNeutralSourceFile': pin(oldfile), 'oldPointer': f'/sourceCells/{oi}/wholeCurrentSourceGoal',
        'originalSourceSpan': current.get('sourceSpan'),
        'originalSourceRef': current.get('sourceRef'),
    })
sourcepin = write('INPUT.actual-common-witnesses-and-MV-unmatched-whole-cells.json', source_supplement)
source_index = {r['cellId']: i for i, r in enumerate(source_supplement)}
records = []
for i, r in enumerate(pairs):
    p, b = r['pair'], r['wholeOriginalB']
    path = p['literalPath']
    binding = []
    for gid in path:
        gi, g = bygoal[gid]
        binding.append({
            'goalId': gid, 'title': g['wholeCurrentGoal']['title'],
            'currentWholeGoalPointer': f'/{gi}/wholeCurrentGoal', 'currentWholeProfilePointer': f'/{gi}/wholeCurrentProfile',
            'contextFile': pin(GFILE),
            'currentWholeGoalHash': oh(g['wholeCurrentGoal']), 'currentWholeProfileHash': oh(g['wholeCurrentProfile']),
            'oldWholeGoalHash': oh(g['wholeOldGoal']), 'oldWholeProfileHash': oh(g['wholeOldProfile']),
            'changedGoalFields': g['changedGoalFields'], 'wholeProfileExactOld': g['wholeProfileExactOld'],
            'actualNativeProfileRow': g['currentRowPin'], 'nativeLine': g['line'],
            'nativeProfileFingerprint': rowpins[gid]['profileFingerprint'],
            'currentAPContextPointer': f'/{gi}/wholeCurrentAPGoal',
            'jurisdictionPresentInExistingAP': p['jurisdiction'] in g['wholeCurrentAPGoal']['compiledApplicability']['jurisdiction']
        })
    edges = []
    for pre, dep in zip(path, path[1:]):
        active = pre in bygoal[dep][1]['wholeCurrentGoal']['requires']
        assert active
        edges.append({'prerequisiteGoalId': pre, 'dependentGoalId': dep, 'actualCurrentRequiresContainsPrerequisite': active})
    assert all(x['jurisdictionPresentInExistingAP'] for x in binding)
    ws = []
    for a in common[i]:
        ws.append({'anchorId': a['anchorId'], 'historicAnchorSHA256': a['anchorSHA256'],
                   'sourceCellId': a['sourceCellId'], 'wholeCellFile': sourcepin,
                   'wholeCellPointer': f'/{source_index[a["sourceCellId"]]}',
                   'rawCourseLevel': a['rawCourseLevel'], 'rawStage': a['rawStage'],
                   'selectedHistoricalBAlternativePointer': f'/{i}/wholeOriginalB/sameEndpointWitnessAlternatives/{b["sameEndpointWitnessAlternatives"].index(a)}'})
    records.append({
        'relationId': f'{p["goalId"]}::{p["jurisdiction"]}',
        'goalId': p['goalId'], 'jurisdiction': p['jurisdiction'], 'endpointGoalId': path[-1],
        'decision': 'HOLD' if i == 5 else 'APPROVE',
        'decisionScope': 'Informed current source-to-endpoint-to-literal-requires acquisition-support binding only.',
        'originalPairedDecisions': {'A': r['wholeOriginalA']['decision'], 'B': b['decision'],
                                    'file': pin(AFILE), 'wholeAPointer': f'/{i}/wholeOriginalA', 'wholeBPointer': f'/{i}/wholeOriginalB',
                                    'historicAFilePointer': p['A_pointer'], 'historicBFilePointer': p['B_pointer']},
        'actualCommonQualifiedWitnesses': ws,
        'mechanicalAuditAnchorId': b['selectedEndpointAnchor']['anchorId'],
        'mechanicalAuditAnchorIsJointlyQualified': any(a['anchorId'] == b['selectedEndpointAnchor']['anchorId'] for a in common[i]),
        'currentWholeBindings': binding, 'literalPrerequisiteToEndpointPath': path, 'currentEdges': edges,
        **science[i],
        'sourceAcquisitionSupportContinues': True,
        'jointHistoricalAnchorBindingEstablished': bool(ws),
        'officialWholeSourceCredit': False, 'newOfficialPrerequisiteDutyClaim': False,
        'actualLearnerPerformanceCertified': False, 'humanApproval': False,
        'DPAMVVote': False, 'normalActivationAuthorizedByThisRecord': False,
    })

review = {
    'reviewId': 'chemie-current450-source-twenty-delta-informed-independent-b-20261018-v1',
    'reviewMode': 'informed_source_binding_delta_followup',
    'reviewerId': '/root/chemie450_caption1_native_fresh_b',
    'reviewer': {'agent': 'OpenAI Codex', 'modelFamily': 'GPT-6', 'exactModelRevision': None,
                 'revisionDisclosure': 'Exact serving model revision is not exposed in this session; none is inferred or invented.'},
    'atUTC': datetime.now(timezone.utc).isoformat(),
    'roleDe': 'Eigene informierte Quellenbindungs-Folgeentscheidung nach vollständiger Lektüre aktueller C/P und der vorgelegten ursprünglichen A/B-Records. Kein blinder neuer Urreview.',
    'objectHashRule': 'sha256 of UTF-8 JSON: sort_keys=True, ensure_ascii=False, separators=(comma,colon); array order preserved. Bare hashes. Distinct from stock profileFingerprint.',
    'counts': {'relations': 20, 'uniqueWholeGoalsAndProfiles': 16, 'APPROVE': 19, 'HOLD': 1, 'REJECT': 0,
               'approvedRelationsRequiringActualAlternativeInsteadOfMechanicalAnchor': 9},
    'limits': ['Only the finite twenty relations are decided.',
               'No official whole-source coverage, new compulsory topic choice, whole HE route or new prerequisite is authorized.',
               'Source reading does not certify actual learner execution or human approval.',
               'No D/P/A/M/V vote, compiler run, build, gate change or normal-data mutation is included.',
               'Historic original records and mechanical audit anchors remain unchanged.'],
    'inputPins': [pin(BASE / n) for n in ['RECEIPT.finite-twenty-delta-preparation.json', GFILE.name, AFILE.name, SFILE.name, 'DELTA.actual-whole-goal-fields-and-profile-bodies.txt']],
    'additionalNeutralInputPins': [pin(oldfile), pin(anchorfile)],
    'wholeActualSelectedSourceCells': sourcepin,
    'decisions': records,
    'openHold': {'relationId': records[5]['relationId'],
                 'AQualifiedAnchorIds': pairs[5]['wholeOriginalA']['qualifiedSupportingAnchorIds'],
                 'BActuallyQualifiedWitnessAnchorIds': [a['anchorId'] for a in pairs[5]['wholeOriginalB']['sameEndpointWitnessAlternatives']],
                 'AWholeSourceCellPointer': f'/{source_index[mv_a["sourceCellId"]]}',
                 'BWholeSourceCellPointer': f'/{source_index[pairs[5]["wholeOriginalB"]["sameEndpointWitnessAlternatives"][0]["sourceCellId"]]}',
                 'wholeCellFile': sourcepin,
                 'smallestRepairDe': 'Gezieltes aktuelles A/B-Votum auf denselben konkreten MV-Anker samt Operator und bestehendem Mol→Titrationsweg. Das vorhandene Paar-HOLD nicht allein durch Seitengleichheit, AP oder Hashgleichheit aufheben.'}
}
reviewpin = write('REVIEW.twenty-current-source-bindings.informed-independent-b.json', review)
assert len({r['relationId'] for r in records}) == 20
assert len(source_supplement) == 24

# Minimal fresh primary-reading evidence. The large historical source corpus is
# referenced, not duplicated. The MV original is copied byte-for-byte because
# its only encountered original path is outside the repository.
primary = OUT / 'primary-readings'
primary.mkdir(exist_ok=True)
mv_original = Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-closure-source-surrogate-neutral-preparation-technical-v1/primary/dcc123a0291510ae-Chemie_Gymnasium_11_12_Erprobungsfassung.pdf')
mv_copy = primary / mv_original.name
shutil.copyfile(mv_original, mv_copy)
assert hashlib.sha256(mv_copy.read_bytes()).hexdigest() == 'dcc123a0291510ae149c98a2129fef196fa76686174859cca24b96e03a1de769'
bw = ROOT / 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf'
assert pin(bw)['sha256'] == '3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62'
normal_pins[rel(bw)] = pin(bw)
for pdf, page, name in [(bw, 23, 'BW.physical23.printed21.actual-pdftotext.txt'), (mv_copy, 28, 'MV.physical28.printed24.actual-pdftotext.txt')]:
    p = primary / name
    result = subprocess.run(['pdftotext', '-f', str(page), '-l', str(page), '-layout', str(pdf), str(p)], capture_output=True, text=True, check=True)

unchanged = all(pin(ROOT / k) == v for k, v in normal_pins.items())
assert unchanged
checks = {
    'result': 'PASS', 'type': 'Finite binding assertions; not stock campaign/gate validation.',
    'relations': 20, 'uniqueGoalsProfiles': 16, 'liveWholeGoalsEqualInput': True,
    'allSixteenNativeWholePMatchInput': True,
    'allFortyOriginalABWholeRecordsMatchOriginalPinnedFiles': True,
    'changedPOriginalCoreChecks': changed_p_core_checks,
    'allTwentyLiteralPathsActive': True, 'allPathGoalsApplicableInExistingCompiledAP': True,
    'jointQualifiedWitnessRelationCount': 19, 'jointWitnessSourceCellCount': 22,
    'additionalUnmatchedMVWholeSourceCells': 2, 'allTwentyFourSourceCellsExactOld': True,
    'missingJointWitnessCorrectlyHOLD': records[5]['relationId'],
    'normalInputsUnchangedDuringOwnPreparation': unchanged,
    'compilerOrBuildExecuted': False,
    'normalInputPins': list(normal_pins.values()),
}
checkpin = write('CHECK.finite-bindings.actual.json', checks)
receipt = {
    'reviewMode': review['reviewMode'], 'reviewerId': review['reviewerId'],
    'exactModelRevisionKnown': False, 'finalInputActuallyRead': True,
    'originalABActuallyRead': True, 'blindReviewClaim': False,
    'currentPeerFollowupDecisionsRead': False,
    'readsActuallyPerformed': {
        'sixteenWholeCurrentGoals': 'Read full current objects, bilingual descriptions and metadata; compared actual old/current goal-field deltas.',
        'sixteenWholeCurrentProfiles': 'Read full DE/EN expectations, coverage, variation axes and every case brief. Three changed old profiles were read in full; unchanged bodies compared exactly.',
        'twentyWholeHistoricABRecords': 'Read each supplied whole A/B record including selected audit anchor, actual same-endpoint alternatives, source operators, original-reading limits and course scope.',
        'twentyMechanicalSourceCells': 'Read full current source goals; old equality verified. Mechanical source identity was not treated as qualification.',
        'actualAdditionalWitnessCells': 'Read and bound the current whole qualified alternatives, compared exact old whole cells; unmatched MV A/B cells retained separately.',
        'primaryPagesReadFresh': [
            {'file': pin(bw), 'physicalPage': 23, 'printedPage': 21, 'method': 'actual pdftotext -layout page output read; no image inspection claimed'},
            {'file': pin(mv_copy), 'originalExternalPath': str(mv_original), 'physicalPage': 28, 'printedPage': 24, 'method': 'actual pdftotext -layout page output read; no image inspection claimed'}
        ],
        'existingAP': 'Inspected the supplied existing per-goal compiled applicability and relevant evidence; finite assertions check selected jurisdictions. No compiler was run.',
        'materialsBoundary': 'Full P bodies read; no separate HB-only M0/M1 material reading or new material-quality vote is claimed. HB additions are outside these NI/SH source bindings.'
    },
    'execution': ['Python JSON parsing and exact file/object comparisons, including all forty original A/B objects at their actual original pointers', 'Targeted read-only rg/file lookup', 'pdftotext -layout of BW page23 and MV page28', 'Own finite serialization and assertions'],
    'noNormalWrites': True, 'noRegistryWrite': True, 'noCompilerOrBuild': True,
    'review': reviewpin, 'finiteCheck': checkpin,
    'primaryReadingFiles': [pin(p) for p in sorted(primary.iterdir())],
    'inputs': review['inputPins'] + review['additionalNeutralInputPins'],
    'normalInputPins': checks['normalInputPins'],
}
receiptpin = write('RECEIPT.own-informed-reading-and-execution.actual.json', receipt)
print(json.dumps({'review': reviewpin, 'check': checkpin, 'receipt': receiptpin, 'counts': review['counts']}, ensure_ascii=False))
