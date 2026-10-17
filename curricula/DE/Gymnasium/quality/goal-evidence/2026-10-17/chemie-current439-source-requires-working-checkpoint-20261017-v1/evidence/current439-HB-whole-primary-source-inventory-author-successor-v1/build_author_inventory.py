#!/usr/bin/env python3
"""Inactive AUTHOR candidate; human authored source paraphrases, not a PDF dump.

This utility builds review material only. It neither touches the checkout nor
grants source/mapping/M7 acceptance. Read candidate/README.md before reuse.
"""
import copy
import datetime
import hashlib
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent
INPUT = Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-source9-HB97-whole-union-neutral-review-preparation-technical-v1')
SELECTOR = INPUT/'SELECTOR.clean-current-Source9-HB97-with-whole-target-subtrees-real-assets-materials.sealed.json'
EXPECTED_SELECTOR = '3e459d001f5f7b067b46f8c61908a798f33a5927b24243c994bc7a6a9270cd33'
A = Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-source9-HB97-fresh-independent-a-v1/FIRST.source9-HB97.scientific-findings.sealed.json')
EXPECTED_A = 'e9a377a1ca7de9b1055328278698ff44c89e4ada71c6e53ea72fdd200d4f7624'
assert hashlib.sha256(SELECTOR.read_bytes()).hexdigest() == EXPECTED_SELECTOR
assert hashlib.sha256(A.read_bytes()).hexdigest() == EXPECTED_A
selector = json.loads(SELECTOR.read_text())
old_pin = next(p for p in selector['sourceGuards'] if p['path'].endswith('/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json'))
old_path = Path(old_pin['path'])
assert hashlib.sha256(old_path.read_bytes()).hexdigest() == old_pin['sha256']
old = json.loads(old_path.read_text())
assert len(old['sourceGoals']) == 97
pdf_pin = next(p['reviewCopyPin'] for p in selector['primaryPartners'] if p['originalRepoPath'].endswith('/HB/GyO_Chemie_2022.pdf'))
pdf_path = Path(pdf_pin['path'])
assert hashlib.sha256(pdf_path.read_bytes()).hexdigest() == pdf_pin['sha256']
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
for d in ['candidate', 'historical', 'inputs', 'primary', 'checks']:
    (BASE/d).mkdir(exist_ok=True)
shutil.copyfile(old_path, BASE/'historical/HB97.original-exact.json')
shutil.copyfile(SELECTOR, BASE/'inputs/SELECTOR.original-clean-exact.json')
shutil.copyfile(A, BASE/'inputs/independent-A.allowed-error-checklist.exact.json')
shutil.copyfile(pdf_path, BASE/'primary/GyO_Chemie_2022.pdf')

old_num = {}
for g in old['sourceGoals']:
    m = re.search(r'-(\d{3})-[a-f0-9]{8}$', g['id'])
    if m: old_num[int(m.group(1))] = g['id']
    else: old_num[g['id']] = g['id']
old_by_id = {g['id']: g for g in old['sourceGoals']}
clauses = []
GOALS = []
PROVENANCE = []
USED = set()

def topic_scope(topic):
    if topic.startswith('2.') or topic == '4.2':
        return {'officialTopicStatus': 'selected_topic_requirement', 'selectionRule': 'HB37-GK-one-LK-two-from-2.1-2.2-2.3-4.2', 'selectedByLearner': None, 'universalOfficialRequirement': False}
    if topic == '4.3':
        return {'officialTopicStatus': 'mandatory_LK_topic', 'selectionRule': None, 'selectedByLearner': None, 'universalOfficialRequirement': False}
    if topic.startswith('E-'):
        return {'officialTopicStatus': 'mandatory_introductory_phase', 'selectionRule': None, 'selectedByLearner': None, 'universalOfficialRequirement': True}
    if topic.startswith('STD') or topic == 'PROCESS':
        return {'officialTopicStatus': 'cross_topic_standard', 'selectionRule': None, 'selectedByLearner': None, 'universalOfficialRequirement': True}
    return {'officialTopicStatus': 'mandatory_all_Q_courses_topic', 'selectionRule': None, 'selectedByLearner': None, 'universalOfficialRequirement': True}

def add(page, topic, section, course, rows):
    """One row per original bullet/numbered standard; explicit inline-LK split.

    Fields: concise authored paraphrase | required original operators | old ID
    reuse (if semantic identity is retained; optional). No fabricated raw text.
    """
    for n,line in enumerate(rows.strip().splitlines(),1):
        para, ops, *reuse = [v.strip() for v in line.split('|')]
        assert para and ops
        clause_id = f'HB2022-p{page:02d}-{topic}-{section}-{course}-{n:02d}'
        key = reuse[0] if reuse and reuse[0] else None
        if key and key.isdigit(): key = int(key)
        gid = old_num[key] if key is not None else 'hb-chemistry-sekii-gyo2022-clause-'+clause_id.lower().replace('hb2022-', '')
        assert gid not in USED, gid
        USED.add(gid)
        is_std = section.startswith('standard-')
        scope = topic_scope(topic)
        # The p36 left block is unlabelled/common WITHIN topic4.3, while p37
        # mandates this topic only for LK. Preserve both dimensions explicitly.
        effective_course = 'LK' if topic == '4.3' else course
        original_qualifier = 'unlabelled/common within topic' if course == 'GK_LK' else 'LK-labelled sub-block'
        c = {
            'clauseId': clause_id,
            'sourceDocumentKey': 'HB-GYO-CHEMIE-2022',
            'physicalPage': page,
            'printedPage': str(page),
            'topic': topic,
            'section': section,
            'bulletOrdinalWithinBlock': n,
            'textKind': 'author_paraphrase_not_verbatim',
            'paraphrase': para,
            'requiredOperators': [s.strip() for s in ops.split(',')],
            'originalCourseQualifier': original_qualifier,
            'courseLevel': effective_course,
            'sourceGoalId': gid,
            'obligationType': 'numbered_general_standard' if is_std else ('cross_topic_process_or_digital' if topic == 'PROCESS' else 'thick_frame_content_or_process'),
            'frame': 'not_applicable_numbered_or_cross_topic_standard' if is_std or topic == 'PROCESS' else 'thick',
            'clauseLevel': True,
            'coverageIdentity': clause_id,
            **scope,
            'carrierStatus': 'not_yet_bound_or_independently_reviewed',
            'proposedCanonicalCarrierIds': [],
            'mappingCredit': 'none_author_candidate',
            'independentSourceReview': 'pending',
        }
        if topic == '4.3': c['courseRuleNote'] = 'Unlabelled p36 content/process applies within topic; p37 makes topic4.3 an LK duty, not universal GK. Explicit p36 LK orbital extension kept separately.'
        if page == 26 and section == 'process' and n == 3:
            c['inlineQualifier'] = 'Common Fischer-to-Haworth ring representation; additional LK conformation is separate clause process-inline-LK.'
        goal = {
            'id': gid,
            'passageId': f'hb-chemistry-sekii:2022-primary-p{page:02d}-{topic}',
            'topicCode': topic,
            'bulletIndex': n,
            'aspectIndex': 1,
            'title': para,
            'description': 'Die lernende Person kann '+para[0].lower()+para[1:]+'.',
            'sourceText': para,
            'sourceTextKind': 'author_paraphrase_not_verbatim',
            'sourceSpan': f'physical PDF{page}, printed {page}; {section}; {course} block item {n}',
            'sourceDocumentKey': 'HB-GYO-CHEMIE-2022',
            'parentBulletText': para,
            'parentBulletTextKind': 'author_paraphrase_not_verbatim',
            'sourceRef': f'Bremen Bildungsplan Chemie Gymnasiale Oberstufe 2022, PDF/printed p{page}, {topic}, {section}, {course}, item {n}',
            'courseLevel': effective_course,
            'granularity': 'primaryClauseParaphrase',
            'sourceClauseIds': [clause_id],
            'tags': ['source:bremen', 'stage:SekII', 'phase:'+('E' if topic.startswith('E-') else 'E_Q' if topic in ['PROCESS'] else 'Q'), 'topic:'+topic, 'course:'+effective_course],
        }
        # Preserve the two positively checked exact original cells unchanged.
        if gid in [old_num.get('hb-chemistry-sekii-gyo2022-primary-active-ingredient-definition-isolation-de664078'),old_num.get('hb-chemistry-sekii-gyo2022-primary-active-ingredient-research-interplay-ab22c8c6')]:
            goal = copy.deepcopy(old_by_id[gid])
        GOALS.append(goal)
        clauses.append(c)
        PROVENANCE.append({'sourceGoalId':gid,'sourceClauseIds':[clause_id], 'textAuthority':'exact_reused_primary_row' if goal == old_by_id.get(gid) else 'author_paraphrase_of_primary_clause', 'sourceScope':copy.deepcopy(scope), 'courseLevel':effective_course, 'requiredOperators':c['requiredOperators'], 'independentReview':'pending', 'mappingTransferAllowed':False})

# §2: all 56 numbered standards. They are not 56 extra topic atoms: they are
# overlapping cross-topic standards with separate provenance identities.
add(7,'STD-S','standard-S','GK_LK','''
Stoffe nach begründeten Ordnungsprinzipien klassifizieren | beschreiben,begründen,anwenden
Aus Strukturen und chemischen Regeln begründete Stoffeigenschaften vorhersagen | ableiten,begründen
Stoff- und Energieumwandlungen chemischer Reaktionen interpretieren | interpretieren
Chemische Reaktionen einem Reaktionstyp zuordnen | bestimmen
Natürliche oder technische Stoffkreisläufe als Reaktionssysteme beschreiben | beschreiben
Stoffebene und Teilchenebene konsequent auseinanderhalten | unterscheiden
Reversibilität, dynamisches Gleichgewicht und Donator-Akzeptor-Prinzip beschreiben und einsetzen | beschreiben,anwenden
Einflüsse von Bedingungen und Katalysatoren auf Reaktionen und deren Steuerung beschreiben | beschreiben
Unterschiedliche Reaktivität und Reaktionsverläufe erklären | erklären
Chemische Konzepte zur Verbindung fachinterner und fächerübergreifender Sachverhalte nutzen | nutzen
''')
add(8,'STD-S','standard-S11-S17','GK_LK','''
Stoffvielfalt und Eigenschaften aus Teilchenkombinationen und Teilchenanordnungen erklären | erklären
Stoff- und Energieumsatz über Teilchenveränderung und Bindungsumbau deuten | deuten
Bindungsmodelle und Modelle intra- und intermolekularer Wechselwirkungen einsetzen | nutzen
Ausgewählte Reaktionsmechanismen beschreiben | beschreiben
Statischen Stoffzustand vom dynamischen Teilchenzustand mithilfe von Modellen abgrenzen | abgrenzen
Reaktionsgleichungen selbst entwickeln | entwickeln
Bekannte mathematische Verfahren auf chemische Fragestellungen anwenden | anwenden
''')
add(9,'STD-E','standard-E1-E12','GK_LK','''
Chemische Sachverhalte aus Alltagssituationen ableiten | ableiten
Chemische Fragestellungen erkennen und entwickeln | identifizieren,entwickeln
Theoriegestützte Hypothesen zu chemischen Fragestellungen bilden | aufstellen
Experimentelle oder modellbasierte Untersuchungen einschließlich nötiger Variablenkontrolle und Hypothesenprüfung planen | planen
Qualitative und quantitative Untersuchungen sicher und fachgerecht durchführen, protokollieren und auswerten | durchführen,protokollieren,auswerten
Digitale Werkzeuge für Messdatenaufnahme, Darstellung, Auswertung, Berechnung, Modellierung und Simulation nutzen | nutzen
Geeignete reale und gedankliche Modelle zur Bearbeitung chemischer Fragen auswählen und einsetzen | auswählen,nutzen
Strukturen und Trends in eigenen oder recherchierten Daten erkennen, theoriebezogen erklären und Schlussfolgerungen ziehen | finden,erklären,schlussfolgern
Möglichkeiten und Grenzen von Modellen diskutieren | diskutieren
Eigene Ergebnisse und den eigenen Erkenntnisweg reflektieren | reflektieren
Untersuchungsbefunde mit anderen Fächern verknüpfen | herstellen
Erkenntnisweg und Erkenntnisse hinsichtlich Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, Konsistenz und Vorläufigkeit reflektieren | reflektieren
''')
add(10,'STD-K','standard-K1-K8','GK_LK','''
Zielgerichtet analog und digital recherchieren und geeignete Quellen auswählen | recherchieren,auswählen
Relevante Informationen und Daten auswählen und auch komplexe Darstellungen erschließen | auswählen,erschließen
Quellen oder Darstellungen auf übereinstimmende Aussagen prüfen | prüfen
Vertrauenswürdigkeit von Quellen und Medien anhand ihrer Herkunft und Qualität prüfen | überprüfen
Fachinformationen sach-, adressaten- und situationsgerecht auswählen | auswählen
Alltagssprache und Fachsprache unterscheiden | unterscheiden
Passende chemische Darstellungen nutzen und ineinander überführen | nutzen,überführen
Informationen strukturieren, interpretieren und daraus Schlussfolgerungen ableiten | strukturieren,interpretieren,ableiten
''')
add(11,'STD-K','standard-K9-K13','GK_LK','''
Chemische Fachbegriffe und Fachsprache korrekt verwenden | verwenden
Chemische Sachverhalte erklären und fachlich schlüssig argumentieren | erklären,argumentieren
Fachinhalte und Arbeitsergebnisse mit passenden analogen und digitalen Medien adressaten- und situationsgerecht präsentieren | präsentieren
Urheberschaft prüfen, Quellen belegen und Zitate kennzeichnen | prüfen,belegen,kennzeichnen
Konstruktiv fachlich diskutieren und den eigenen Standpunkt vertreten, reflektieren und gegebenenfalls korrigieren | austauschen,vertreten,reflektieren,korrigieren
''')
add(11,'STD-B','standard-B1','GK_LK','''
Aussagen, Modelle und Verfahren aus mehreren Perspektiven chemisch begründet beurteilen | betrachten,beurteilen
''')
add(12,'STD-B','standard-B2-B14','GK_LK','''
Inhalte von Quellen und Medien auf fachliche Richtigkeit und Vertrauenswürdigkeit beurteilen | beurteilen
Informationen und Daten nach Angemessenheit, Grenzen und Tragweite beurteilen | beurteilen
Quellen- und Darstellungswahl in Bezug auf die Absicht der Verfassenden analysieren und beurteilen | analysieren,beurteilen
Kriteriengestützt Handlungsoptionen für fachbezogene Alltags- und Gesellschaftsentscheidungen entwickeln und gegeneinander abwägen | entwickeln,abwägen
Chancen und Risiken von Technologien, Produkten und Verhaltensweisen fachlich beurteilen und bewerten | beurteilen,bewerten
Mit fachlichen Kriterien begründete Alltagsentscheidungen treffen | entscheiden,begründen
Die Bedeutung chemischer Kompetenz für Alltag und Beruf beurteilen | beurteilen
Möglichkeiten und Grenzen chemischer Perspektiven beurteilen | beurteilen
Gesellschaftliche Relevanz und ökologische Bedeutung angewandter Chemie bewerten | bewerten
Labor- und Alltagsgefahren sowie Sicherheit beurteilen und daraus begründete Handlungen ableiten | beurteilen,ableiten,begründen
Historische und aktuelle gesellschaftliche Folgen chemischer Produkte, Methoden, Verfahren und Erkenntnisse beurteilen und bewerten | beurteilen,bewerten
Folgen chemischer Produkte, Methoden und eigenen Handelns aus ökologischer, ökonomischer und sozialer Nachhaltigkeitsperspektive beurteilen und bewerten | beurteilen,bewerten
Chemisch begründete Entscheidungskriterien und Entscheidungsstrategien reflektieren | reflektieren
''')

# §3.1: eight process plus six digital bullets, not seven invented raw bullets.
add(14,'PROCESS','process','GK_LK','''
Naturwissenschaftliche Denk- und Arbeitsweisen erkennen und anwenden | erkennen,anwenden
Die Rolle von Experimenten, Theorien und Modellen im naturwissenschaftlichen Arbeiten erläutern und unterscheiden | erläutern,unterscheiden
''')
add(15,'PROCESS','process','GK_LK','''
Experimentelle Untersuchungen durchführen, dokumentieren und bewerten | durchführen,dokumentieren,bewerten
Naturwissenschaftliche Informationen fachgerecht recherchieren, erschließen und darstellen | recherchieren,erschließen,darstellen
Fachsprache korrekt anwenden | anwenden
Naturwissenschaftliche Sachverhalte kontextbezogen sachgerecht bewerten | bewerten
Naturwissenschaftliches Wissen nutzen, seine gesellschaftliche Bedeutung erfassen und kritisch diskutieren | nutzen,erfassen,diskutieren
Selbstständig und kooperativ naturwissenschaftliche Fragen bearbeiten | arbeiten
''')
add(15,'PROCESS','digital','GK_LK','''
Daten einfacher experimenteller Untersuchungen digital erfassen | erfassen
Experimente digital auswerten, dokumentieren und mit digitalen Medien darstellen | nutzen,auswerten,dokumentieren,darstellen
Modelle und Visualisierungen ausgewählter Beispiele auf makroskopischer, mikroskopischer und submikroskopischer Ebene digital darstellen | darstellen
Digitale Daten recherchieren, identifizieren und präsentieren | recherchieren,identifizieren,präsentieren
Informationen digitaler Quellen kritisch bewerten | bewerten
Digitale Werkzeuge zur gemeinsamen Erstellung von Dokumentationen und Präsentationen nutzen | nutzen
''')

# Introductory phase: the shared pre-course standard is not a later GK/LK
# entitlement. Mandatory content/process, optional contexts/experiments apart.
add(17,'E-ATOME','content','GK_LK','''
Den Grundaufbau von Atomen mit einem passenden Atommodell erklären | erklären
PSE-Ordnungsprinzipien erklären und ausgewählte Atome aus Ordnungs- und Massenzahl beschreiben | erklären,angeben
Bindungstypen ausgewählter Verbindungen mithilfe der Elektronegativität ermitteln und unterscheiden | ermitteln,unterscheiden
Die Entstehung ausgewählter intermolekularer Wechselwirkungen erklären | erklären
Das Lösen von Salz und die Bildung einer Hydrathülle in Wasser beschreiben | beschreiben
Teilchenzahl, Stoffmenge und Konzentration verknüpfen und einfache Berechnungen durchführen | beschreiben,berechnen
''')
add(17,'E-ATOME','process','GK_LK','''
Die Rolle ausgewählter Experimente für die Aufklärung des Atombaus beschreiben | beschreiben
Ionen über Fällung, Farbreaktion, Flammenfärbung und Gasentwicklung nachweisen | anwenden
Atome schematisch darstellen | darstellen
Lewis- und Valenzstrichschreibweise anwenden | anwenden | 9
Ausgewählte Atom- und Bindungsdarstellungen bewerten | bewerten
''')
add(18,'E-ORGANIK','content','GK_LK','''
Aufbau einfacher organischer Verbindungen, homologe Reihen und Strukturisomerie von Alkanen und Alkoholen beschreiben | beschreiben | 13
Ausgewählte organische Verbindungen nach IUPAC benennen | benennen
Das EPA-Modell zur Erklärung räumlicher Alkanstrukturen verwenden | anwenden
Struktureinflüsse auf Schmelz- und Siedetemperaturen von Alkanen, Alkoholen und Strukturisomeren beschreiben | beschreiben
Funktionelle Gruppen erkennen und ihren Einfluss auf die Löslichkeit erklären | erkennen,erklären
Ausgewählte Stoffeigenschaften aus intermolekularen Wechselwirkungen erläutern | erläutern
Das Prinzip radikalischer Substitution und elektrophiler Addition erklären | erklären
''')
add(18,'E-ORGANIK','process','GK_LK','''
Untersuchungen zur Löslichkeit und zu Schmelz- und Siedetemperaturen organischer Stoffe beschreiben | beschreiben
Ausgewählte funktionelle Gruppen mit Nachweisreaktionen prüfen | anwenden | 18
Summenformel, Lewis- und Skelettformel unterscheiden und anwenden | unterscheiden,anwenden
Gesellschaftliche Relevanz organischer Verbindungen kritisch diskutieren und den Klimaeinfluss fossiler Treib- und Heizstoffe beschreiben und bewerten | erkennen,diskutieren,beschreiben,bewerten
''')
add(19,'E-KUNSTSTOFFE','content','GK_LK','''
Ausgewählte Nachhaltigkeitskonzepte im Zusammenhang der Chemie benennen und erläutern | benennen,erläutern
Die Bildung von Makromolekülen aus Monomeren beschreiben | beschreiben | 19
Die Herstellung ausgewählter Kunststoffe erläutern | erläutern
Traditionelle Kunststoffe und Kunststoffe aus nachwachsenden Rohstoffen unterscheiden und diese Unterscheidung erläutern | erläutern
''')
add(19,'E-KUNSTSTOFFE','process','GK_LK','''
Kunststoffe aus nachwachsenden Rohstoffen experimentell untersuchen | durchführen
Medienberichte über umstrittene Kunststoffnutzung recherchieren, Argumente zusammenfassen und präsentieren | recherchieren,zusammenfassen,präsentieren
Kunststoffe anhand ausgewählter Kriterien vergleichen und bewerten | vergleichen,bewerten
Vor- und Nachteile herkömmlicher und nachwachsender Kunststoffrohstoffe in Alltag und Technik benennen und kritisch diskutieren | benennen,diskutieren
''')
add(20,'E-SAEURE-BASE','content','GK_LK','''
Säure- und Basenverhalten anhand der Brönsted-Theorie erklären | erklären | 24
Oxonium- und Hydroxidionenkonzentration mit dem pH-Wert verknüpfen | beschreiben | HB20-A-content-ion-concentration-pH
''')
add(20,'E-SAEURE-BASE','process','GK_LK','''
pH-Werte mit Indikatoren oder pH-Metern ermitteln und Lösungen als sauer, neutral oder basisch klassifizieren | ermitteln,anwenden | HB20-A-process-measure-classify
Das Donator-Akzeptor-Prinzip an Säure-Base-Reaktionen darstellen und erklären sowie Reaktionsgleichungen formulieren | darstellen,erklären,formulieren
Wirkung und Gefahren von Säuren und Basen in Alltagsprodukten bewerten | bewerten
''')
add(20,'E-REDOX','content','GK_LK','''
Redoxreaktionen als Elektronenübertragungen beschreiben | beschreiben | HB20-B-content-electron-transfer
Mit der Redoxreihe Reaktionen vorhersagen | anwenden | 27
Das Grundprinzip von Batterien und Akkumulatoren beschreiben | beschreiben
''')
add(20,'E-REDOX','process','GK_LK','''
Redoxreihenexperimente beschreiben und auswerten | beschreiben,auswerten
Redoxgleichungen und ihre Teilgleichungen formulieren | formulieren | HB20-B-process-half-equations
Ein galvanisches Element darstellen und seine Funktionsweise beschreiben | darstellen,beschreiben
Elektrochemische Energiespeicherung im Kontext der Mobilität bewerten | bewerten
''')

add(22,'1.1','content','GK_LK','''
Reversibilität als Ursache unvollständigen chemischen Stoffumsatzes darstellen | darstellen
Das chemische Gleichgewicht als stabilen dynamischen Zustand erläutern | erläutern | 30
Die Beeinflussung von Gleichgewichtslagen durch Reaktionsbedingungen erklären | erklären | 32
Das Massenwirkungsgesetz auf Gas- und Lösungsgleichgewichte anwenden und Gleichgewichtslagen berechnen | anwenden,berechnen | 31
Das Haber-Bosch-Verfahren erläutern | erläutern
Ausgewählte Prinzipien nachhaltiger Chemie beschreiben, etwa geschlossene Kreisläufe und effiziente Prozesse | beschreiben
''')
add(22,'1.1','content','LK','''
Löslichkeitsgleichgewichte erklären und berechnen | erklären,berechnen
''')
add(22,'1.1','process','GK_LK','''
Experimente mit Variablenkontrolle planen und durchführen | planen,durchführen
Hypothesen über unvollständigen chemischen Stoffumsatz bilden und diskutieren | bilden,diskutieren
Verfahrensfolgen für nachhaltige Entwicklung ökologisch, ökonomisch und sozial beurteilen und bewerten | beurteilen,bewerten | 34
''')
add(23,'1.2','content','GK_LK','''
Säure-Base-Reaktionen als reversible Brönsted-Protolysen erklären | erklären | HB23-Q-reversible-Bronsted
Das Massenwirkungsgesetz auf Protolysegleichgewichte anwenden | anwenden | HB23-Q-MWG-protolysis
Säure- und Basenstärke auf Teilchenebene begründen | begründen | HB23-Q-particle-strength
pH-Werte bei vollständiger Protolyse berechnen | berechnen | HB23-Q-complete-protolysis
Mit pH-Titration Säure- und Basenstoffmengen beziehungsweise Konzentrationen bestimmen | bestimmen | HB23-Q-titration-amount
Einfache pH-Titrationskurven interpretieren | interpretieren | 38
''')
add(23,'1.2','content','LK','''
Puffersysteme mit der Henderson-Hasselbalch-Gleichung berechnen | berechnen | 40
pH-Werte bei unvollständiger Protolyse berechnen | berechnen | HB23-Q-LK-incomplete-protolysis
pH-Titrationskurven mehrprotoniger Säuren interpretieren | interpretieren | hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-primary-lk-polyprotic-curves-p23
Konduktometrische Titrationskurven interpretieren | interpretieren
Die saure Reaktion hydratisierter Metallkationen über koordinative Bindung erklären | erklären
''')
add(23,'1.2','process','GK_LK','''
Quantitative Säure-Base-Konzentrationsuntersuchungen planen, durchführen und auch mit digitalen Titrationskurven auswerten | planen,durchführen,auswerten | HB23-Q-process-plan-conduct-evaluate
Alltagsrelevanz von Säuren und Basen analog und digital recherchieren und präsentieren | recherchieren,präsentieren
Menschengemachte Ozeanversauerung ökologisch bewerten und Handlungsoptionen ableiten | bewerten,ableiten
''')
add(24,'1.3','content','GK_LK','''
Reaktionsgeschwindigkeit definieren und aus Messwerten berechnen | definieren,berechnen | 41
Temperatur-, Druck-, Konzentrations- und Zerteilungsgradeinflüsse auf Reaktionsgeschwindigkeit qualitativ und quantitativ beschreiben und auf Teilchenebene erklären | beschreiben,erklären | 42
Die Bedeutung von Katalysatoren und ihren Einfluss auf Reaktionsgeschwindigkeit erklären | erklären | 43
''')
add(24,'1.3','content','LK','''
Reaktionsordnungen aus Konzentrations-Zeit-Verläufen ermitteln | ermitteln
Die Mechanismen von SN1 und SN2 erläutern | erläutern
''')
add(24,'1.3','process','GK_LK','''
Konzentrations-Zeit-Verläufe digital aufnehmen, darstellen und auswerten | nutzen,aufnehmen,darstellen,auswerten
Zeitliche Reaktionsabläufe unter verschiedenen Bedingungen interpretieren und Ergebnisse darstellen | interpretieren,darstellen
Katalysatoreinsatz unter Nachhaltigkeitsgesichtspunkten bewerten | bewerten
''')

add(26,'2.1','content','GK_LK','''
Die Bildung von Kohlenhydraten in Organismen und ihre Bedeutung als industrielle Rohstoffe beschreiben | beschreiben
Strukturen und Eigenschaften von Mono-, Di- und Polysacchariden erklären und vergleichen | erklären,vergleichen | 46
Die Funktionsweise eines Polarimeters erklären | erklären
Ausgewählte stereochemische Aspekte auf Kohlenhydrate anwenden | anwenden | 48
''')
add(26,'2.1','content','LK','''
Kohlenhydratkonzentrationen mit Polarimeterdaten berechnen | berechnen
Kohlenhydrate in Konformationsschreibweise darstellen | nutzen,darstellen
Die Fructose-Glucose-Umwandlung über Keto-Endiol-Tautomerie erklären | erklären
''')
add(26,'2.1','process','GK_LK','''
Kohlenhydrate mit Nachweisreaktionen auf reduzierende Eigenschaften prüfen | prüfen | 47
Molekülbaukästen und digitale 3D-Modelle zur Umwandlung zwischen Fischer- und Keilstrichdarstellungen nutzen | nutzen,überführen
Die Ringbildung von alpha- und beta-D-Glucose aus der Fischer-Projektion beschreiben und in Haworth-Projektion darstellen | beschreiben,darstellen
Industrielle Zuckergewinnung ökologisch, ökonomisch und sozial beurteilen und bewerten | beurteilen,bewerten | 49
''')
add(26,'2.1','process-inline-LK','LK','''
Die Ringformen der Glucose zusätzlich in Konformationsschreibweise darstellen | darstellen
''')
add(27,'2.2','content','GK_LK','''
Molekülstrukturen und Eigenschaften proteinogener Aminosäuren und Proteine beschreiben | beschreiben | 51
Die Stereochemie von Aminosäuren beschreiben | beschreiben
Elektrophoretische und dünnschichtchromatographische Trennungen erläutern | erläutern | 56
Rf-Werte ermitteln und interpretieren | ermitteln,interpretieren | 50
''')
add(27,'2.2','content','LK','''
Chiralitätszentren von Aminosäuren nach Cahn-Ingold-Prelog beschreiben | beschreiben
''')
add(27,'2.2','process','GK_LK','''
Einfache Aminosäure- und Proteinnachweise sowie Untersuchungen durchführen, protokollieren und auswerten | durchführen,protokollieren,auswerten | 53
Denaturierung durch Temperatur, Ethanol, saure und alkalische Lösungen sowie Schwermetallionen experimentell untersuchen und die Wirkung auf Organismen bewerten | untersuchen,bewerten
Die Aminosäureverknüpfung als Kondensation mit Strukturformeln darstellen | darstellen
Primär-, Sekundär-, Tertiär- und Quartärstruktur mit passenden räumlichen Darstellungen beschreiben | beschreiben | 52
''')
add(28,'2.3','content','GK_LK','''
Die Struktur von Fettmolekülen beschreiben | beschreiben | 57
Methoden der Fettgewinnung beschreiben | beschreiben
Löslichkeit und Konsistenz von Fetten und Ölen aus der Molekülstruktur erklären | erklären | 58
Fettkennzahlen mit der Molekülstruktur verknüpft darstellen | darstellen
Fetthärtung durch Hydrierung als Additionsreaktion darstellen | darstellen
''')
add(28,'2.3','process','GK_LK','''
Fett- und Öllöslichkeit in verschiedenen Lösungsmitteln experimentell untersuchen und auswerten | untersuchen,auswerten
Aus Fettkennzahlen Aussagen zu Zusammensetzung und Haltbarkeit ableiten | nutzen
Veresterung mit Strukturformeln und Reaktionsgleichungen darstellen | darstellen
Gesättigte und ungesättigte Fettsäuren als Nahrungsbestandteile bewerten | bewerten | 61
''')

add(30,'3.1','content','GK_LK','''
Gesetzmäßigkeiten von Enthalpieänderungen erklären | erklären
Reaktionsenthalpien aus Standardbildungsenthalpien berechnen | berechnen | 63
Die Bedeutung des ersten Hauptsatzes der Thermodynamik darstellen | darstellen | 62
Den Satz von Hess anwenden | anwenden
''')
add(30,'3.1','content','LK','''
Die Bedeutung des zweiten Hauptsatzes der Thermodynamik darstellen | darstellen
Die Rolle der Entropie für spontane Reaktionen erklären und freie Reaktionsenthalpie mit Gibbs-Helmholtz berechnen | erklären,berechnen | 64
''')
add(30,'3.1','process','GK_LK','''
Reaktionsenthalpien mit einem einfachen Kalorimeter ermitteln | ermitteln
Temperaturverläufe mit digitalen Werkzeugen messen und auswerten | durchführen,auswerten
Energie als Erhaltungsgröße beschreiben und Konsequenzen diskutieren | beschreiben,diskutieren
Energetische Aspekte chemischer Vorgänge aus mehreren Nachhaltigkeitsperspektiven bewerten | bewerten
''')
add(31,'3.2','content','GK_LK','''
Galvanische und Elektrolysezellen anhand ausgewählter Beispiele in Aufbau und Funktion erläutern und schematisch darstellen | erläutern,darstellen
Verfahren zur Messung elektrochemischer Potenziale beschreiben und anwenden | beschreiben,anwenden
Zellspannungen aus der Spannungsreihe berechnen | berechnen | 67
Aufbau und Reaktionen von Alkali-Mangan-Zelle, Bleiakku und Lithium-Ionenakku schematisch darstellen und erläutern | darstellen,erläutern
Korrosion und Korrosionsschutzmaßnahmen erklären | erklären | 70
''')
add(31,'3.2','content','LK','''
Konzentrationsabhängigkeit des elektrochemischen Potenzials erklären | erklären | 71
Eine Redoxtitration durchführen und erklären | durchführen,erklären
Elektrolysen mit den Faraday-Gesetzen berechnen | berechnen | 68
Überspannung bei Elektrolyse und Akkumulator erklären | erklären
''')
add(31,'3.2','process','GK_LK','''
Die Spannungsreihe experimentell untersuchen | durchführen
Die Rolle von Akkumulatoren bei Speicherung und Bereitstellung elektrischer Energie diskutieren | diskutieren
Herstellungs- und Nutzungsaufwand sowie Umweltaspekte von Batterien und Akkumulatoren bewerten | bewerten
''')
add(32,'3.3','content','GK_LK','''
Bedeutung und Grundfunktion der Photosynthese für nachwachsende Rohstoffe erklären | erklären
Den Kohlenstoffkreislauf erläutern | erläutern
Den Treibhauseffekt erklären | erklären
Biotreibstoffe unterscheiden und ihre jeweiligen Herstellungswege erläutern | unterscheiden,erläutern | 73
''')
add(32,'3.3','content','LK','''
Die Herstellung von BTL-Treibstoffen mit dem Fischer-Tropsch-Verfahren erläutern | erläutern
''')
add(32,'3.3','process','GK_LK','''
Eigene Lebensweise mit aktuellen globalen Problemen in Beziehung setzen | erkennen
Ursachen und Folgen des Klimawandels darstellen und kommunizieren | darstellen,kommunizieren
Verschiedene Treibstoffe ökologisch und ökonomisch bewerten | bewerten | 60
Analoge und digitale Informationen zu nachwachsenden Rohstoffen und Klimawandel kritisch beurteilen | beurteilen
''')

add(34,'4.1','content','GK_LK','''
Kunststoffe nach Eigenschaften und Strukturen ordnen | ordnen | 76
Die Entstehung wichtiger Kunststoffe durch Polymerisation, Polyaddition und Polykondensation erklären und ihre Struktur beschreiben | erklären,beschreiben
Werkstoffliche, rohstoffliche und energetische Kunststoffverwertung beschreiben | beschreiben | 77
''')
add(34,'4.1','content','LK','''
Die Mechanismen radikalischer Polymerisation und Veresterung formulieren und erläutern | formulieren,erläutern
Durch Nanostrukturierung und Nanopartikel verstärkte Kunststoffe verursachte Eigenschaftsänderungen beschreiben | beschreiben
''')
add(34,'4.1','process','GK_LK','''
Verschiedene Kunststoffe anhand ausgewählter Kriterien vergleichen | vergleichen
Vor- und Nachteile von Recyclingmethoden diskutieren | diskutieren
Den Einsatz von Weichmachern, Farb- und Füllstoffen, Flammschutzmitteln und Antistatika bewerten | bewerten
Gesellschaftliche und wirtschaftliche Bedeutung von Kunststoffen und Biokunststoffen unter Nachhaltigkeitsgesichtspunkten bewerten | bewerten | 78
''')
add(35,'4.2','content','GK_LK','''
Farbigkeit durch die Wechselwirkung von Strahlung und Materie erklären | erklären | 80
Molekülstrukturen farbiger organischer Verbindungen beschreiben und Farbstoffklassen zuordnen | beschreiben,zuordnen
Vorkommen, Herstellung beziehungsweise Isolierung und Verwendung ausgewählter natürlicher und synthetischer Farbstoffe erläutern | erläutern
Grundzüge der Lichtreaktion der Photosynthese beschreiben | beschreiben
''')
add(35,'4.2','process','GK_LK','''
Absorptionsspektren photometrischer Messungen interpretieren | interpretieren | 82
Die Lichtreaktion und ihre mögliche Nachahmung durch künstliche Photosynthese beschreiben | beschreiben
Natürliche und künstliche Farbstoffe anhand von Nutzen und Risiken kriteriengestützt vergleichen und bewerten | vergleichen,bewerten | 81
Gesellschaftliches und ökologisches Potenzial natürlicher und künstlicher Photosynthese zur Rohstoff- und Energiegewinnung bewerten | bewerten
''')
add(36,'4.3','content','GK_LK','''
Besonderes Verhalten aromatischer gegenüber aliphatischen Verbindungen beschreiben | beschreiben
Struktur und Bindungen des Benzols mit dem Mesomeriemodell erklären | erklären | 85
Typische Aromatenreaktionen nennen und Bedingungen einfacher Beispiele beschreiben | angeben,beschreiben
Den Wirkstoffbegriff erklären und die Isolierung von Wirkstoffen aus Naturstoffen erläutern | erklären,erläutern | hb-chemistry-sekii-gyo2022-primary-active-ingredient-definition-isolation-de664078
Die Natur- und Wirkstoffsynthese als Zusammenspiel von Analyse, Synthese und Molecular Modelling beschreiben | beschreiben | hb-chemistry-sekii-gyo2022-primary-active-ingredient-research-interplay-ab22c8c6
''')
add(36,'4.3','content','LK','''
Struktur und Bindungsverhältnisse des Benzols mit einem einfachen Orbitalmodell erklären | erklären
''')
add(36,'4.3','process','GK_LK','''
Grenzen der Lewis-Darstellung des Benzols diskutieren | diskutieren
Aromatenstrukturen mit digitalen Werkzeugen darstellen | darstellen
Nutzen und Risiken krebserzeugender aromatischer Verbindungen erörtern | erörtern
Die Entwicklung neuer Medikamente anhand historischer und aktueller gesellschaftlicher Beispiele bewerten | bewerten
''')

# Original thick-frame vocabulary is mandatory terminology, not a fabricated
# command to perform every adjacent optional experiment. One controlled termset
# per common/LK block; no omission hidden behind a generic topic label.
TERM_DATA = [
(17,'E-ATOME','GK_LK','Periodensystem; Element; Proton; Neutron; Elektron; Periode; Gruppe; Valenzelektronen; Anion; Kation; Molekül; Edelgas; unpolare und polare Elektronenpaarbindung; Ionenbindung; Ionengitter; metallische Bindung; Metallgitter; Elektronengasmodell; Elektronegativität; Dipol; Wasserstoffbrücken; Löslichkeit; Hydrathülle; Ion-Dipol-Wechselwirkungen; Stoffmenge; Molmasse; Konzentration'),
(18,'E-ORGANIK','GK_LK','homologe Reihe; Alkane; Alkene; Alkine; Alkohole; Isomerie; funktionelle Gruppe; Aldehyde; Ketone; Carbonsäuren; van-der-Waals-Kräfte; Wasserstoffbrücken; radikalische Substitution; elektrophile Addition; Halogenalkane'),
(19,'E-KUNSTSTOFFE','GK_LK','Nachhaltige Chemie; Kunststoff; Biokunststoff; nachwachsende Rohstoffe; biologische Abbaubarkeit; Makromolekül; Monomer; Polymer; Polymerisation'),
(20,'E-SAEURE-BASE','GK_LK','Säuren; saure Lösungen; Basen; basische/alkalische Lösungen (Laugen); Protolyse; Oxonium-Ion; Hydroxid-Ion; pH-Wert; Neutralisation; Protonendonator; Protonenakzeptor; Indikator'),
(20,'E-REDOX','GK_LK','Redoxreaktion; Oxidationszahl; Elektronendonator; Elektronenakzeptor; Donator-Akzeptor-Prinzip; Redox-Reihe; galvanisches Element; Anode; Kathode; Batterie; Akkumulator; Wasserelektrolyse; Brennstoffzelle'),
(22,'1.1','GK_LK','Hin- und Rückreaktion; Dynamisches Gleichgewicht; Konzentrations-Zeit-Diagramm; Massenwirkungsgesetz und Gleichgewichtskonstante; Prinzip von Le Chatelier; Nachhaltige Chemie; Haber-Bosch-Verfahren'),
(22,'1.1','LK','Löslichkeitsgleichgewicht'),
(23,'1.2','GK_LK','Brönsted Säure-Base-Theorie; Protolysegleichgewicht; korrespondierendes Säure-Base-Paar; Autoprotolyse; Ionenprodukt des Wassers; pH-Wert; Säurestärke und Basenstärke; Neutralisation; Titration; Titrationskurve und charakteristische Punkte'),
(23,'1.2','LK','Puffersysteme; Konduktometrie; koordinative Bindung bei hydratisierten Metallkationen'),
(24,'1.3','GK_LK','Reaktionsgeschwindigkeit; Durchschnitts- und Momentangeschwindigkeit; Konzentrations-Zeit-Diagramm; Energiediagramm; Konzentrationsabhängigkeit; Temperaturabhängigkeit; Zerteilungsgrad; Aktivierungsenergie; Stoßtheorie; Maxwell-Boltzmann-Verteilung; RGT-Regel; homogene und heterogene Katalyse'),
(24,'1.3','LK','Reaktionsordnung; nucleophile Substitution'),
(26,'2.1','GK_LK','Mono-, Di- und Polysaccharide; Aldosen; Ketosen; Fischer-Projektion; Haworth-Projektion; Keilstrich-Schreibweise; Zuckerstammbaum; Stereoisomerie; asymmetrisch substituiertes Kohlenstoffatom; Chiralitätszentrum; glykosidische Bindung; Ringbildung; Mutarotation; Fehling-Probe; Hydrolyse; optische Aktivität; Polarimeter'),
(26,'2.1','LK','spezifischer Drehwinkel; Konformationsschreibweise; Keto-Endiol-Tautomerie'),
(27,'2.2','GK_LK','Aminosäuren; Proteine; Peptidbindung; Primär-, Sekundär-, Tertiär- und Quartärstruktur; alpha-Helix; beta-Faltblatt; Kondensationsreaktion; Denaturierung; isoelektrischer Punkt; Zwitterion; Chiralität; optische Aktivität; Stereoisomerie; Biuret-Reaktion; Ninhydrin-Nachweis; Xanthoprotein-Reaktion; Elektrophorese; Dünnschichtchromatographie; Rf-Wert'),
(27,'2.2','LK','R- und S-Konfiguration'),
(28,'2.3','GK_LK','Fett; Öl; Triglyceride; gesättigte und ungesättigte Fettsäuren; Ester; Fetthärtung; Kennzahlen von Fetten; Verseifungszahl; Iodzahl; essenzielle Fettsäuren; Hydrolyse'),
(30,'3.1','GK_LK','innere Energie; offene, geschlossene und isolierte Systeme; Reaktionsenthalpie; (Standard-)Bildungsenthalpie; Bindungsenthalpie; Satz von Hess; 1. Hauptsatz der Thermodynamik'),
(30,'3.1','LK','Entropie; exergonische und endergonische Vorgänge; Gibbs-Helmholtz-Gleichung; 2. Hauptsatz der Thermodynamik'),
(31,'3.2','GK_LK','Redoxreaktionen als Elektronenübertragung; Halbzelle; galvanische Zelle; Elektrolysezelle; elektrochemisches Potenzial; Spannungsreihe; Normalwasserstoffelektrode; Standardpotenzial; Alkali-Mangan-Zelle; Blei-Akkumulator; Li-Ionenakku; Korrosion'),
(31,'3.2','LK','Nernst-Gleichung; Konzentrationszelle; Redoxtitration; Faraday-Gesetze; Überspannung'),
(32,'3.3','GK_LK','Photosynthese; Kohlenstoffkreislauf; Energiehaushalt der Erde; Treibhauseffekt; anthropogener Treibhauseffekt; Treibstoffe der 1. und 2. Generation; Pflanzenöl; Biodiesel; Umesterung; Bioethanol; Kohlenstoffdioxidbilanz'),
(32,'3.3','LK','BTL-Treibstoff'),
(34,'4.1','GK_LK','Kunststoff; Makromolekül; Monomer; Polymer; Thermoplast; Duroplast; Elastomer; Polymerisation; Polyaddition; Polykondensation; Biokunststoff; Mikroplastik; Additiv; Kunststoffrecycling; Stoffkreislauf'),
(34,'4.1','LK','Nanotechnologie'),
(35,'4.2','GK_LK','Elektromagnetisches Spektrum; Anregungsenergie; Absorptionsspektrum; Farbmischung; Komplementärfarbe; Farbstoffklasse; Azofarbstoffe; Triphenylmethanfarbstoffe; Polyene; Mesomerie; Delokalisation; Chromophor; Auxochrom; Antiauxochrom; Photometrie; Lichtreaktion der Photosynthese; Ladungstransfer; künstliche Photosynthese'),
(36,'4.3','GK_LK','Benzol; Mesomerie; Aromatizität; elektrophile aromatische Substitution; Wirkstoff; Natur- und Wirkstoffsynthese; Molecular Modelling; ortho-, meta- und para-Stellung'),
(36,'4.3','LK','Orbital; Hybridisierung; sigma- und pi-Bindung'),
]
terms = []
for page,topic,course,text in TERM_DATA:
    terms.append({'termSetId':f'HB2022-p{page:02d}-{topic}-terms-{course}', 'physicalPage':page,'printedPage':str(page),'topic':topic,'section':'Verbindliche Fachbegriffe','frame':'thick','originalCourseQualifier':course,'courseLevel':'LK' if topic=='4.3' else course,'terms':[s.strip() for s in text.split(';')], 'requiredOperators':[], 'interpretation':'Mandatory vocabulary within the applicable topic and course; does not add an unprinted performance command or mandate optional experiments.', **topic_scope(topic),'sourceGoalIds':[c['sourceGoalId'] for c in clauses if c['topic']==topic and (c['courseLevel']==course or topic=='4.3')], 'carrierStatus':'term-use coverage not yet independently reviewed'})

# Thin-frame suggestions: each original context/Vertiefung/experiment bullet
# gets one locator. Concise paraphrases preserve their optional authority.
OPTIONAL_DATA = {
17:('E-ATOME', {
'context':['Atombau vom Experiment zum Modell','Metalle im Alltag und in der Technik, einschließlich kritischer Rohstoffe','Aluminiumgewinnung und Recycling','Salzgewinnung und Meerwasserentsalzung'],
'experiment':['Atombau-Modellversuche','Flammenfärbung von Metallverbindungen','Halogenid-, Carbonat- und Ammoniumionen nachweisen','Salzlöslichkeit und Kristallisation untersuchen','Leitfähigkeit von Metallen und Salzlösungen']}),
18:('E-ORGANIK',{
'context':['Bioethanol als Treibstoff abwägen','Stoffe hinsichtlich ihres Klimaeinflusses vergleichen','Alkoholische Getränke herstellen und Körperwirkung thematisieren'],
'experiment':['Alkanverbrennung und Produktnachweise','Organische Löse- und Reinigungsmittel','Viskosität organischer Verbindungen','Alkoholische Gärung und Destillation']}),
19:('E-KUNSTSTOFFE',{
'context':['Kunststoffabfälle in Umwelt und Ozeanen','Kunststoffrecycling','Kunststoffnutzung in Alltag und Technik'],
'experiment':['Biokunststoffe wie thermoplastische Stärke oder Polymilchsäure herstellen','Abbau herkömmlicher und biobasierter Kunststoffe untersuchen','Kunststoffeigenschaften untersuchen']}),
20:('E-SAEURE-BASE/E-REDOX',{
'A-context':['Säuren und Basen in Lebens- und Reinigungsmitteln','Säuren und Basen in Kosmetik und Körperpflege'],
'A-experiment':['Verdünnungsreihe','pH konventionell oder digital messen','Neutralisation untersuchen'],
'B-context':['Wasserstoff als künftiger Energieträger','Moderne Batterien und Akkumulatoren einschließlich Lithium-Ionenakku'],
'B-experiment':['Redoxreihe und einfache galvanische Elemente untersuchen','Wasserelektrolyse und Wassersynthese in der Brennstoffzelle']}),
22:('1.1',{
'Vertiefung':['Gleichgewichte mit Computer oder Rechnung modellieren','Chromatographische Gleichgewichte','Weitere technische Gleichgewichte wie Ostwald- oder Kontaktverfahren'],
'experiment':['Estergleichgewicht und Bestimmung der Gleichgewichtskonstanten','Gleichgewichtsverschiebung bei Druck-, Konzentrations- und Temperaturänderung','Gleichgewichtsmodellversuch','Löslichkeitsprodukte und Löslichkeitsgleichgewichte']}),
23:('1.2',{
'Vertiefung':['Physiologische Puffer wie Blutpuffer und Antazida','Ökologische Puffer wie Boden und Meerwasser'],
'experiment':['Lebens- und Reinigungsmittel pH-messen und titrieren','CO2-Gleichgewichte in Mineral- oder Meerwasser','Puffer herstellen und untersuchen','Leitfähigkeitstitration','pH von Salzen einschließlich hydratisierter Metallkationen']}),
24:('1.3',{
'Vertiefung':['Enzymatische und andere Katalyse für nachhaltige Chemie vergleichen','Reaktionsordnung kinetisch messen','Katalysatoren bei Ammoniak- und Ostwaldverfahren'],
'experiment':['Stechheber-Modell zur Geschwindigkeit','Gasometrie oder pH-Verlauf von Säurereaktionen','Wasserstoffperoxid zersetzen','Schaumbildung und Schaumzerfall','Wasserstoff am Platinkatalysator entzünden']}),
26:('2.1',{
'Vertiefung':['Süßstoffe und Zuckeraustauschstoffe','Kohlenhydratbasierte Klebstoffe'],
'experiment':['Reduzierende Zucker mit Fehling, Tollens oder Benedict nachweisen','Stärke mit Lugol-Lösung nachweisen','Optische Aktivität untersuchen']}),
27:('2.2',{
'Vertiefung':['Proteinprodukte im Sportbereich','Aminosäure-Titrationskurven analysieren','Aufbau und Funktion von Enzymen mit Spezifität und Wechselwirkungen'],
'experiment':['Aminosäuren und Proteine mit Ninhydrin, Biuret oder Xanthoproteinreaktion nachweisen','Proteine denaturieren','Proteinhydrolyse und Aminosäuregemischtrennung','Aminosäuretitration mit Pufferwirkung und isoelektrischem Punkt']}),
28:('2.3',{
'Vertiefung':['Fettentstehung, Gewinnung, Brennwert und Oxidation','Ernährungsaspekte einschließlich trans- und Omega-3-Fettsäuren','Seifen aus Fetten und ihre Tensidwirkung'],
'experiment':['Fette extrahieren','Ungesättigte Fettsäuren nachweisen','Iod- und Verseifungszahl bestimmen','Fettgehalt von Lebensmitteln bestimmen','Margarine herstellen']}),
30:('3.1',{
'Vertiefung':['Lebensmittelenergetik und Light-Produkte','Brennwert und Heizwert vergleichen'],
'experiment':['Einfaches Kalorimeter bauen','Ethanol-Verbrennungsenthalpie bestimmen','Lösungs- und Neutralisationsenthalpien bestimmen','Modelldampfmaschine']}),
31:('3.2',{
'Vertiefung':['Brennstoffzellenantriebe technisch und ökologisch bewerten','Industrielle Elektrochemie: Aluminium, Kupfer, Galvanisieren und Eloxieren','Energetische Größen aus elektrochemischen Daten'],
'experiment':['Daniell- oder Alkali-Mangan-Element','Standard- und Elektrodenpotenziale messen','Korrosion und Schutz untersuchen','Wasserelektrolyse und Überspannung','Nernst-Gleichung aus Potenzialmessungen ableiten','Eisen-II durch Permanganometrie titrieren']}),
32:('3.3',{
'Vertiefung':['Fossile und regenerative Energieträger energetisch vergleichen','Globale Gleichgewichte und Klimamodellierung','Power-to-X'],
'experiment':['Treibstoffe anhand Viskosität und Flammpunkt unterscheiden','Rapsöl zu Biodiesel umestern','Treibstoffenthalpien kalorimetrisch bestimmen','Treibhauseffekt modellieren']}),
34:('4.1',{
'Vertiefung':['Klebstoffarten, Haftung, Kohäsion, Abbinden und Einsatzanforderungen','Silicone: Herstellung, Struktur, Eigenschaften und Anwendungen von Ölen, Harzen und Kautschuken'],
'experiment':['Traditionelle Kunststoffe wie Polyurethan und Nylon herstellen','Biokunststoffe wie Stärke und Polymilchsäure herstellen','Kunststoffabbau untersuchen']}),
35:('4.2',{
'Vertiefung':['Farben und Färben bei Kleidung, Lebensmitteln und Tätowierungen','Umweltkonzentrationen photometrisch oder kolorimetrisch bestimmen'],
'experiment':['Synthetische Farbstoffe herstellen','Pflanzenfarbstoffe extrahieren und chromatographieren','Farbstoffe in Lebensmitteln oder Pflanzenextrakten photometrisch untersuchen','Textilien mit Pflanzenfarbstoffen färben']}),
36:('4.3',{
'Vertiefung':['Nutzen und Risiken aromatischer Medikamente und Drogen anhand von Beispielen','Pestizide oder Duft- und Aromastoffe','Zweitsubstitution mit mesomerem und induktivem Effekt und Substituentenordnungen'],
'experiment':['Acetylsalicylsäure synthetisieren','Schmerzmittelinhaltsstoffe dünnschichtchromatographisch nachweisen','Toluol bromieren','Coffein oder Vanillin als Naturstoff extrahieren']}),
}
optional = []
for page,(topic,blocks) in OPTIONAL_DATA.items():
    for kind,paras in blocks.items():
        for n,para in enumerate(paras,1):
            resolved_topic = ('E-SAEURE-BASE' if kind.startswith('A-') else 'E-REDOX') if page==20 else topic
            optional.append({'optionalItemId':f'HB2022-p{page:02d}-{resolved_topic}-{kind}-{n:02d}','physicalPage':page,'printedPage':str(page),'topic':resolved_topic,'section':kind,'bulletOrdinalWithinBlock':n,'frame':'thin','paraphrase':para,'textKind':'author_paraphrase_not_verbatim','officialStatus':'optional_supporting_suggestion','officialMandatoryCompetency':False,'courseLevel':'LK' if topic=='4.3' else 'not_specified_by_optional_block','selectionImplied':False,'note':'Optional in this source. A similar subject may separately occur in a mandatory competency or vocabulary list; these authorities must not be conflated.'})

# Historical ID dispositions: source-correct matches reuse IDs. Every other
# historical body remains exact in history and is retained as authored content,
# with explicit limits on source credit. No mapping is automatically copied.
RELATED = {
1:['PROCESS'],2:['PROCESS'],3:['PROCESS'],4:['PROCESS'],5:['PROCESS'],6:['PROCESS'],7:['PROCESS'],
8:['E-ATOME'],10:['E-ATOME'],11:['E-ATOME'],12:['E-ATOME'],14:['E-ORGANIK'],15:['E-ORGANIK'],16:['E-ORGANIK'],17:['E-ORGANIK'],20:['E-KUNSTSTOFFE','4.1'],21:['4.1'],22:['E-KUNSTSTOFFE','4.1'],28:['E-REDOX','3.2'],29:['3.2'],33:['1.1'],35:['1.2'],39:['1.2'],44:['1.3'],45:['1.3'],54:['2.2'],55:['2.2'],59:['2.3'],65:['3.1'],66:['3.1'],69:['3.2'],72:['3.3','4.2'],74:['3.3'],75:['3.3'],79:['4.1'],83:['4.2'],84:['4.2'],86:['4.3'],87:['4.3'],88:['4.3'],
}
SPECIAL = {
8: ('derived_with_unsourced_extension','Unterenergiestufen/electron distribution are not a p17 official performance clause; preserve useful own elaboration and trace only actual atom/PSE duties.'),
10: ('derived_summary','Comparison of the three binding types is an authored operationalisation; p17 binding terminology and EN-based determination are distinct duties.'),
11: ('derived_summary','Do not hide separate p17 hydration and intermolecular explanation operators inside a broad property link.'),
12: ('derived_summary','The p17 original joins particle number, amount and concentration. General reaction-equation stoichiometry is wider.'),
14: ('derived_summary','Functional-group recognition, IUPAC naming and representation are separate original clauses.'),
15: ('derived_with_unsourced_extension','Esters as an E-phase obligation do not follow from p18 alone.'),
16: ('derived_with_unsourced_extension','Alkanol oxidation/esterification are not the mandatory p18 basic radical-substitution/electrophilic-addition clause.'),
17: ('derived_summary','Own wider raw-material framing does not replace the p18 fossil-fuel climate and discussion duties.'),
20: ('derived_with_source_elsewhere','Polycondensation/polyaddition are p34 shared Q duties, not three p19 E-phase printed reaction types.'),
21: ('derived_with_source_elsewhere','Thermoplast/duroplast/elastomer appears in p34 vocabulary, not as this p19 official bullet.'),
22: ('derived_summary','The source has separate materials comparison, media-research and critical-discussion duties; LCA is an own wider framing.'),
28: ('derived_summary','Preserve useful galvanic/electrolysis comparison; p20/p31 original operators and scope are separate.'),
29: ('derived_with_source_elsewhere','Explicit mandatory corrosion belongs to p31; do not claim this wording as a p20 bullet.'),
33: ('derived_summary','Technical process optimisation is valid authored application; source MWG calculation/Haber-Bosch/sustainability obligations are individually traced.'),
35: ('derived_summary_overlap','Reversible Brönsted content is represented once by retained HB23-Q-reversible-Bronsted; autoprotolysis is separately mandatory terminology, not a second identical bullet.'),
39: ('derived_optional_context','Physiological/ecological p23 buffer settings are optional; actual LK Henderson-Hasselbalch calculation remains mandatory.'),
44: ('derived_summary','No invented p24 original bullet; preserve digital recording and parameter-interpretation duties separately.'),
45: ('derived_with_unsourced_extension','Arrhenius and autocatalysis are not p24 literal performance bullets; real LK reaction-order determination and SN1/SN2 explanation are now explicit.'),
54: ('optional_source_supported_extension','Enzyme structure/function appears in thin p27 Vertiefung; broad external-factor enzyme content is an own expansion, not common mandatory official p27 competence.'),
55: ('derived_optional_context','Sport protein products are optional context; this broad sustainability/source criticism is authored, not a printed mandatory p27 clause.'),
59: ('optional_source_supported_extension','Soap production/tensid action is thin-frame p28 Vertiefung. Do not substitute it for fat extraction methods, indices or hydrogenation.'),
65: ('derived_with_unsourced_extension','Exergonic/endergonic are p30 LK vocabulary; energetic coupling is not an explicit p30 competency. No original GK duty.'),
66: ('derived_with_unsourced_extension_overlap','Gibbs calculation is represented once in corrected064. Statistical entropy interpretation is authored extra, not an additional p30 literal duty.'),
69: ('derived_mixed_mandatory_optional','Battery/accumulator evaluation is mandatory p31; fuel-cell evaluation is optional Vertiefung. This mixed old body cannot confer universal full-union source credit.'),
72: ('derived_mixed_topic_scope','p32 natural-photosynthesis explanation and selected p35 artificial-photosynthesis duties have different authority. Preserve source boundaries.'),
74: ('optional_or_unsourced_extension','Power-to-X is optional p32 context; hydrogen storage is not an explicit mandatory p32 competence.'),
75: ('derived_with_unsourced_extension','Carbon cycle and greenhouse effect are mandatory separate duties; Life-Cycle-Assessment is not a literal p32 competency.'),
79: ('derived_mixed_optional_unsourced','Silicones are thin-frame p34 optional Vertiefung; conducting polymers have no explicit p34 source clause. No official LK duty for the old combined body.'),
83: ('derived_mixed_source_extension','Azo/triphenylmethane classes and auxochrome terminology occur in shared selected p35 topic; no LK block exists there. Indicator-dye extension is not an extra original p35 LK clause.'),
84: ('unsourced_teaching_extension','Dye-industry history is not a mandatory p35 clause. Keep authored educational content without this official source authority.'),
86: ('derived_with_unsourced_extension','p36 requires naming typical aromatic reactions and describing simple conditions; full sigma-complex/nitration mechanism is a stronger authored expansion.'),
87: ('optional_source_supported_extension','Directing effects/second substitution are p36 thin-frame Vertiefung, not a mandatory original bullet.'),
88: ('derived_summary','Separate p36 carcinogen-risk discussion and historical/current medicine-development evaluation are actual duties. This broad old umbrella is not their original single bullet.'),
}
derived = []
dispositions = []
prov_by_id={p['sourceGoalId']:p for p in PROVENANCE}
goal_by_id={g['id']:g for g in GOALS}
for i,g in enumerate(old['sourceGoals']):
    gid=g['id']; num=next((n for n,id_ in old_num.items() if id_==gid),None)
    if gid in USED:
        exact = goal_by_id[gid] == g
        note = 'Stable semantic identity retained; current official scope/operators now taken from primary clause matrix. Old mapping edges require review before any source credit transfers.'
        if num == 50: note='Old combined separation+Rf body is narrowed to the original Rf clause under the same stable ID; separation is represented once by056. Historical combined body retained exact. No duplicate clause credit.'
        if num == 56: note='Stable056 is the sole separation-explanation clause;050 is Rf only. The misleading historical kohlenhydrate fragment in050 ID remains unchanged.'
        if num == 64: note='Stable entropy/Gibbs identity retained, correct original LK authority and quantitative operator restored;065/066 retained as derived extensions without duplicate clause coverage.'
        if num == 68: note='Faraday quantitative identity retained with LK authority; common electrolysis-cell explanation is a different clause.'
        if num == 71: note='Stable concentration-dependent potential identity retained at LK; fuel-cell extension is not mandatory original scope.'
        dispositions.append({'oldSourceGoalId':gid,'oldIndex':i,'disposition':'exact_primary_row_retained' if exact else 'stable_id_retained_primary_scope_corrected','successorSourceGoalIds':[gid],'successorClauseIds':prov_by_id[gid]['sourceClauseIds'],'oldBodyRetainedExactAt':f'historical/HB97.original-exact.json#/sourceGoals/{i}','mappingMigration':'re-review_required_no_automatic_credit','note':note})
    else:
        classification,note=SPECIAL.get(num,('derived_summary','Historical body is an authored compression/extension rather than the original individual source bullet. Preserve it as own teaching content and review exact source credit separately.'))
        topics=RELATED.get(num,[])
        refs=[c['clauseId'] for c in clauses if c['topic'] in topics]
        # These are discovery locators, not mappings or satisfaction statements.
        entry={'id':gid,'historicalSourceGoal':copy.deepcopy(g),'authorityClassification':classification,'officialMandatorySourceGoal':False,'relatedPrimaryClauseIdsForReview':refs,'clauseRelationMeaning':'topic-related discovery only; no coverage or equivalence asserted','note':note,'selectedByLearner':None,'retainAsOwnTeachingContent':True,'sourceCredit':'none_until_specific_clause_mapping_independently_reviewed'}
        derived.append(entry)
        dispositions.append({'oldSourceGoalId':gid,'oldIndex':i,'disposition':'stable_id_retained_as_derived_teaching_entry','derivedEntryId':gid,'successorSourceGoalIds':[],'relatedPrimaryClauseIdsForReview':refs,'oldBodyRetainedExactAt':f'historical/HB97.original-exact.json#/sourceGoals/{i}','mappingMigration':'retain_own_content_do_not_copy_official_mandatory_credit','classification':classification,'note':note})

def write(name,data):
    p=BASE/name;p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return p
passages=[]
for page,topic in sorted({(c['physicalPage'],c['topic']) for c in clauses}):
    pid=f'hb-chemistry-sekii:2022-primary-p{page:02d}-{topic}'
    ids=[c['sourceGoalId'] for c in clauses if c['physicalPage']==page and c['topic']==topic and goal_by_id[c['sourceGoalId']]['passageId']==pid]
    passages.append({'id':pid,'topicCode':topic,'title':f'Primary clauses p{page}: {topic}','page':page,'sourceDocumentKey':'HB-GYO-CHEMIE-2022','sourcePath':old['sourceDocument']['path'],'textKind':'authored_concise_paraphrases_not_original_raw_text','text':'\n'.join(c['paraphrase'] for c in clauses if c['sourceGoalId'] in ids),'sourceGoalIds':ids})
for g in GOALS:
    if g['passageId'] not in {p['id'] for p in passages}:
        c=next(c for c in clauses if c['sourceGoalId']==g['id'])
        passages.append({'id':g['passageId'],'topicCode':g['topicCode'],'title':g['title'],'page':c['physicalPage'],'sourceDocumentKey':'HB-GYO-CHEMIE-2022','sourcePath':old['sourceDocument']['path'],'textKind':'authored_concise_paraphrase_not_original_raw_text','text':c['paraphrase'],'sourceGoalIds':[g['id']],'note':'Stable passage reference retained so the positively checked sourceGoal object remains exact; no additional source clause.'})

framework=[
 {'frameworkId':'HB2022-p4-6-interpretation','physicalPages':[4,5,6],'kind':'binding_interpretation','paraphrase':'E standards bind preparation for later GK/LK; numbered standards apply at both levels with different depth, complexity and independence. Chemistry connects substance/structure, reactions, practical analysis/synthesis and sustainability.','coverageStatus':'framework retained; canonical coverage not reviewed'},
 {'frameworkId':'HB2022-p5-6-safe-experiments','physicalPages':[5,6],'kind':'instructional_safety_constraint','paraphrase':'Experiments are central; planning and conduct must follow current safety law, risk assessments, chemical-use review and safer substitutes. Suggestions do not authorize performance.','coverageStatus':'constraint retained; no practical acceptance'},
 {'frameworkId':'HB2022-p12-13-structure-properties','physicalPages':[12,13],'kind':'cross_cutting_base_concept','requiredConcepts':['Atom- und Molekülbau','chemische Bindung','Modifikationen','funktionelle Gruppen','Isomerie','inter- und intramolekulare Wechselwirkungen','Stoffeigenschaften','Stoffklassen','analytische Verfahren qualitativ/quantitativ','Verwendungsmöglichkeiten'],'paraphrase':'Stoffeigenschaften hängen von Teilchenart, Anordnung und Wechselwirkung ab; Stoff- und Teilchenebene bleiben getrennt.','coverageStatus':'explicit concepts retained; distributed coverage unreviewed; not extra atomic duties'},
 {'frameworkId':'HB2022-p13-reaction','physicalPages':[13],'kind':'cross_cutting_base_concept','requiredConcepts':['Donator-Akzeptor','Umkehrbarkeit','Gleichgewicht','Reaktionstypen','Mechanismen','Steuerung'],'paraphrase':'Protonen- und Elektronenübergänge sowie organische Mechanismen verbinden das Reaktionskonzept.','coverageStatus':'framework retained; distributed coverage unreviewed'},
 {'frameworkId':'HB2022-p14-energy','physicalPages':[14],'kind':'cross_cutting_base_concept','requiredConcepts':['Energieformen/-umwandlung/-kreislauf','Aktivierungsenergie/Katalyse','Energie chemischer Bindungen/Wechselwirkungen','Reaktionskinetik','Enthalpie/Entropie'],'paraphrase':'Energetische und kinetische Prinzipien verbinden Teilchen- und Stoffumwandlungen. Die übergreifende Konzeptdarstellung überschreibt keine ausdrückliche LK-Einschränkung auf p30.','coverageStatus':'framework retained; distributed coverage unreviewed'},
 {'frameworkId':'HB2022-p14-digital','physicalPages':[14,15],'kind':'cross_cutting_framework','paraphrase':'Fachkompetenz umfasst digitale Kommunikation, Rückmeldung, individuelles Lernen und kollaborative digitale Produkte; konkrete Anforderungen stehen in sechs digitalen §3.1-Klauseln und fachlichen Prozessen.','coverageStatus':'framework retained; no product functionality inferred'},
 {'frameworkId':'HB2022-p37-39-assessment','physicalPages':[37,38,39],'kind':'school_assessment_guidance','paraphrase':'Bewertung erfasst Produkte und Prozesse, unterscheidet Lern- und Leistungssituationen, macht Kriterien transparent und umfasst schriftliche Leistungen und laufende Unterrichtsarbeit. Fachkonferenz und geltende Oberstufenregeln bestimmen Gewichtungen.','coverageStatus':'source context retained; no school grading/certification implemented'},
 {'frameworkId':'HB2022-p40-41-operators','physicalPages':[40,41],'kind':'operator_interpretation','paraphrase':'Operatoren werden im Unterricht eingeführt und bestimmen die erwartete Tätigkeit; andere verständliche standardsprachliche Operatoren sind möglich.','coverageStatus':'meaning separately retained in operator-meaning-and-interpretation.AUTHOR.json'},
]

# Source-level recurrence is explicit. These links mean partial thematic
# overlap, never equal coverage or 232 independent unique curricular duties.
stds={}
for c in clauses:
    if c['topic'].startswith('STD-'):
        n=c['bulletOrdinalWithinBlock'];p=c['physicalPage'];family=c['topic'][-1]
        offset={('S',8):10,('K',11):8,('B',12):1}.get((family,p),0)
        code=family+str(n+offset);c['originalStandardCode']=code;stds[code]=c['clauseId']
process_overlaps=[
['E4','E5','E7'],['E7','E9','E12'],
['E5','E10'],['K1','K2','K5','K7','K11'],['K6','K9'],['B1','B3','B6','B10'],['S10','B10','B12','B13'],['K13','E2'],
['E6'],['E6','K7','K11'],['E6','S13','K7'],['K1','K2','K11'],['K4','B2','B3'],['K11','K13']]
overlaps=[]
for c,codes in zip([c for c in clauses if c['topic']=='PROCESS'],process_overlaps):
    overlaps.append({'section3_1ClauseId':c['clauseId'],'relatedSection2StandardCodes':codes,'relatedSection2ClauseIds':[stds[s] for s in codes],'relation':'partial_overlap_or_contextual_restatement_not_equivalence','countingRule':'Keep source locators, but do not add these as independent unique curricular duties or duplicated canonical atoms; stronger/more specific operators still require their own coverage.'})
candidate={
    'schemaVersion':1,'extractionId':old['extractionId']+'-PRIMARY-CLAUSE-SUCCESSOR-AUTHOR-V1',
    'title':'Bremen Chemie GyO 2022 — inactive primary-clause source inventory AUTHOR successor',
    'sourceLandscapeId':old['sourceLandscapeId'],'jurisdiction':'DE-HB','subject':'Chemie','stage':'SekII',
    'sourceDocument':old['sourceDocument'],'sourceDocuments':old['sourceDocuments'],
    'sourceDocumentPin':pdf_pin,'authorCreatedAtUTC':NOW,
    'artifactRole':'AUTHOR candidate only; inactive; independent scientific review pending',
    'activation':{'active':False,'mainModified':False,'KModified':False,'canonicalModified':False,'mappingModified':False,'runtimeModified':False,'learningTargetScopeModified':False},
    'method':{'passageExtraction':'Full 41-page primary read; all content/process thick-frame tables visually checked; authored paraphrases carry exact page/block/item provenance. No raw pdftotext dump.', 'sourceGoalExtraction':'One numbered standard or original content/process bullet per sourceGoal; p26 inline LK conformation split explicitly. Required terms and thin-frame optional suggestions are separate inventories. All historical97 bodies preserved exact; semantically valid IDs reused with explicit scope correction; broader own content retained as derived teaching entries.', 'countPolicy':'No target count or peer-baseline inference. Clauses, termsets, optional items and derived summaries are separate denominators. Shared competencies overlap thematically and are not extra canonical atoms.', 'sourceTextPolicy':'sourceText/parentBulletText are expressly authored paraphrases except the two exact reused primary entries. No invented rawSourceText/rawText fields. Exact primary is separately pinned.', 'rights':'New author paraphrases/metadata follow CC-BY-4.0 knowledge-content allocation; the official PDF and exact historical quotations retain their original rights. No new licence grant over third-party material.'},
    'expectedTopicCodes':sorted({c['topic'] for c in clauses}|{g['topicCode'] for g in GOALS}),
    'qualityReview':{'status':'author_candidate_pending_independent_review','wholeSourceCoverageApproved':False,'independentSourceReviewPending':True,'wholeSourceGoalCountPeerBaseline':{'accepted':False,'details':'No peer-count acceptance. Counts are structural inventory counts only.'},'sourceFidelity':'not_yet_independently_accepted','canonicalCoverage':'not_yet_bound_or_reviewed'},
    'pipelineStatus':{'version':1,'currentStep':'SOURCE-AUTHOR-REVIEW-PENDING','steps':[{'id':'SOURCE-AUTHOR','status':'complete_as_author_candidate_only'},{'id':'INDEPENDENT-SOURCE-REVIEW','status':'pending'},{'id':'CLAUSE-TO-CANONICAL-COVERAGE','status':'pending'},{'id':'ACTIVATION','status':'not_authorized_by_this_artifact'}]},
    'passages':passages,'sourceGoals':GOALS,'sourceGoalProvenance':PROVENANCE,
    'mandatoryTermSets':terms,'optionalSourceSuggestions':optional,'derivedTeachingEntries':derived,'crossCuttingFrameworkRequirements':framework,'section2Section3_1SourceOverlaps':overlaps,
    'scopeRules':{
        'HB15-HB21-frames':{'thick':'Mandatory content, terminology and process competencies within applicable course/topic','thin':'Optional contexts, Vertiefungen and experiment suggestions; a separately mandatory process may still require practical activity without mandating every listed example.'},
        'HB37-all-courses':['1.1','1.2','1.3','3.1','3.2','3.3','4.1'],
        'HB37-LK-additional':['4.3'],
        'HB37-choice':{'from':['2.1','2.2','2.3','4.2'],'GK':1,'LK':2,'authority':'Official topic choices fixed in advance by Abitur-year Schwerpunktkatalog; school subject conference determines sequence within rules. No learner selection or current Schwerpunkt inferred.'},
        'skillpilotTargetPolicy':'PO may include all authored applicable topics in broader target. This does not convert official choices or thin-frame suggestions into universal curriculum duties, and does not establish persisted learner selection.',
        'courseDimensions':'Original in-table LK markers and overall p37 topic applicability are independent. Introductory topics precede GK/LK; compatibility GK_LK means shared introductory requirement. Topic4.3 unlabelled rows are within-topic common, but p37 requires that topic only for LK.'},
    'historicalInventory':{'path':'historical/HB97.original-exact.json','sha256':old_pin['sha256'],'sourceGoalCount':97,'historicalAcceptedFlagsAreAuditOnly':True},
    'claimBoundary':'No source acceptance, canonical credit, whole-inventory acceptance, M7, human approval, learner mastery or runtime activation follows from this author candidate.'
}
write('candidate/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.AUTHOR-PENDING.json',candidate)
write('candidate/clause-to-entry-matrix.AUTHOR-PENDING.json',{'role':'AUTHOR source-clause-to-entry matrix; scientific acceptance pending','primaryPin':pdf_pin,'clauseCount':len(clauses),'clauses':clauses,'mandatoryTermSets':terms,'optionalSourceSuggestions':optional,'crossCuttingFrameworkRequirements':framework,'section2Section3_1SourceOverlaps':overlaps,'coverageBoundary':'Every source clause is represented as an author claim to be independently checked. No canonical carrier is asserted. Empty carrier IDs are explicit pending coverage gaps, not missing source-inventory rows. 232 counts source-located records with recurrence, not independent unique duties.'})
write('candidate/stable-ID-disposition-and-mapping-migration-plan.AUTHOR-PENDING.json',{'role':'Old97 stable-ID disposition; proposed only; no mapping files written','oldSourceGoalCount':97,'retainedAsPrimarySourceGoalCount':len([d for d in dispositions if d['successorSourceGoalIds']]),'retainedAsDerivedTeachingEntryCount':len(derived),'oldIdsLost':[],'dispositions':dispositions,'mappingPlan':['Freeze original97 hash; do not rewrite historical reviewed snapshots.','Independent source review must check original page, frame, course, operators and topic-choice qualifiers, not merely hashes.','For each retained primary ID, inspect every current canonical edge against its exact clause and whole target subtree. No automatic equivalent/full credit from preserved IDs.','For each derived ID, retain valid authored teaching content but remove or narrow unsupported official mandatory credit in a separately authorized mapping successor.','For each new primary clause, inspect current C650 read-only or a later agreed baseline; explicitly mark carrier gaps and additional material/process evidence needs. No new canonical goal is authorized by this source package.','Run actual projection/applicability and source-coverage review only after an independently reviewed mapping successor. Broader target policy remains separate from official duty.','Activation, K, D/P/A/M/V rebinding and source acceptance remain root-owned later work.']})

resolution = [
('HB97-01','All56 numbered §2 standards plus8 process and6 digital §3.1 duties have distinct page/item identities. Old seven summaries are retained as derived, not original raw bullets.',['PROCESS','STD-S','STD-E','STD-K','STD-B']),
('HB97-02','056 owns separation explanation;050 owns Rf determination/interpretation only. Historical combined050 remains exact in history; no duplicate clause credit.',['2.2']),
('HB97-03','Entropy/second law/Gibbs are LK; own energetic coupling/statistical entropy remains derived. Common digital temperature measurement and calorimetry are explicit.',['3.1']),
('HB97-04','Faraday is LK; redox titration and overvoltage are explicit LK clauses; battery/accumulator duties and optional fuel-cell application separated.',['3.2']),
('HB97-05','Optional silicone support separated from unsourced conducting-polymer extension. Mandatory LK radical-polymerisation/esterification mechanisms and nano-property clauses are explicit.',['4.1']),
('HB97-06','Polarimeter operation/concentration, keto-enediol, amino-acid CIP, fat extraction/indices/hydrogenation, LK Fischer-Tropsch and selected photosynthesis explanation/evaluation all explicit.',['2.1','2.2','2.3','3.3','4.2']),
('HB97-07','Arrhenius/autocatalysis, enzymes, soap/tensids, dye history, directing effects retain derived/optional/unsourced labels. Choice rule p37 retained without learner selection inference.',['1.3','2.2','2.3','4.2','4.3']),
('HB97-08','Two positively checked active-ingredient sourceGoal objects reused exact, including stable IDs. Overall source review remains pending.',['4.3']),
]
write('candidate/error-resolution-list.AUTHOR-PENDING.json',{'role':'AUTHOR response to permitted independent-A checklist only; independent-B not read','checklistPin':{'path':str(A),'sha256':EXPECTED_A},'items':[{'findingId':id_,'authorResolution':desc,'status':'author_addressed_pending_independent_review','relevantTopics':topics,'clauseIds':[c['clauseId'] for c in clauses if c['topic'] in topics]} for id_,desc,topics in resolution]})

page_dispositions=[]
for p in range(1,42):
    cs=[c['clauseId'] for c in clauses if c['physicalPage']==p]
    ts=[t['termSetId'] for t in terms if t['physicalPage']==p]
    os=[o['optionalItemId'] for o in optional if o['physicalPage']==p]
    if p<=3: role='cover/publication/imprint/contents; no competency extracted'
    elif p in [4,5,6]:role='binding introduction, aims, safety and course-level interpretation; source rules retained, no invented standalone topical competency'
    elif p in [7,8,9,10,11,12]:role='numbered shared general standards extracted; explanatory prose retained as interpretation context'
    elif p==13:role='cross-cutting base-concept requirements explicitly retained in framework records; not duplicated as atomic competencies'
    elif p in [14,15]:role='energy/digital interpretation and binding cross-topic process/digital duties; frame rule p15'
    elif p in [16,21,25,29,33]:role='topic introductions/interpretation; no duplicate bullets from introductory narrative; p21 frame rule retained'
    elif p==37:role='binding course/topic-choice rules and start of assessment guidance; source scope rules retained'
    elif p in [38,39]:role='school assessment guidance, not additional chemistry content atoms; not implemented as SkillPilot grading/certification'
    elif p in [40,41]:role='operator glossary; meaning retained separately, no invented additional topic goal'
    else:role='content/process thick-frame clauses, mandatory terms, and separate thin-frame optional suggestions extracted'
    page_dispositions.append({'physicalPage':p,'printedPage':str(p) if p<40 else 'O.'+str(p-39),'read':'actual pinned PDF text in full','visualTableChecked':p in [15,17,18,19,20,21,22,23,24,26,27,28,30,31,32,34,35,36,37],'disposition':role,'clauseIds':cs,'termSetIds':ts,'optionalItemIds':os})
write('candidate/whole41-page-disposition-and-visual-inspection.AUTHOR.json',{'role':'AUTHOR actual-primary inspection receipt, not independent review','primaryPin':pdf_pin,'physicalPageCount':41,'pages':page_dispositions,'visualMaterials':'materials/HB2022-physical-NN.png; unmodified raster renderings of pinned actual pages, 1.6x PDF resolution','frameObservation':'Actual thick borders enclose both content/terms and process sections. Vertiefungen, contexts and experiment examples are thin. LK headings change the course block within thick content/terms; process rows revert to unlabelled/shared unless an inline qualifier says otherwise.'})

OPERATORS = {
'ableiten':'Aus Erkenntnissen oder Daten sachgerecht schließen.',
'abschätzen':'Größenwerte begründet näherungsweise angeben.',
'analysieren':'Für eine Frage relevante Teile, Eigenschaften und Beziehungen herausarbeiten; im Chemie-Zusatz auch experimentell prüfen.',
'aufstellen/formulieren':'Formeln, Gleichungen und Mechanismen entwickeln.',
'Hypothesen aufstellen':'Fachlich begründete Vermutung zu einem unbekannten Sachverhalt entwickeln.',
'angeben/nennen':'Sachverhalte oder Daten ohne weitere Erklärung wiedergeben.',
'auswerten':'Befunde oder Informationen verknüpfen und daraus schließen.',
'begründen':'Nachvollziehbare Gründe oder Argumente darlegen.',
'berechnen':'Den Rechenweg von einem Ansatz aus darstellen.',
'beschreiben':'Beobachtungen, Strukturen, Verfahren und Zusammenhänge geordnet fachsprachlich formulieren.',
'beurteilen':'Ein Sachurteil mithilfe fachlicher Kriterien begründen.',
'bewerten':'Ein Werturteil unter gesellschaftlichen Werten und Normen begründen.',
'darstellen':'Geordnet fachsprachlich ausdrücken, gegebenenfalls zeichnerisch oder tabellarisch.',
'diskutieren':'Argumente gegenüberstellen und abwägen.',
'erklären':'Durch Rückführung auf Regeln und Gesetzmäßigkeiten verständlich machen.',
'erläutern':'Veranschaulichen und durch ergänzende Informationen verständlich machen.',
'ermitteln':'Rechnerisch, zeichnerisch oder experimentell bestimmen.',
'herleiten':'Mit bekannten Gesetzmäßigkeiten Größenbeziehungen entwickeln.',
'interpretieren/deuten':'Ergebnisse oder Annahmen bezogen auf Frage oder Hypothese nachvollziehbar einordnen.',
'ordnen':'Anhand bestimmter Merkmale systematisch klassifizieren.',
'planen':'Lösungswege für ein Problem entwickeln und dokumentieren.',
'skizzieren':'Wesentliches übersichtlich grafisch wiedergeben.',
'untersuchen':'Mit fachlichen Arbeitsweisen erschließen.',
'vergleichen':'Gemeinsamkeiten und Unterschiede anhand von Kriterien herausarbeiten.',
'zeichnen':'Gegenstände grafisch genau wiedergeben.',
}
write('candidate/operator-meaning-and-interpretation.AUTHOR.json',{'role':'Concise authored paraphrases of actual appendix operator meanings; no new content-goal inventory','physicalPages':[40,41],'printedPages':['O.1','O.2'],'operators':OPERATORS,'otherStandardLanguageOperatorsAllowed':True,'practicalDistinction':'beschreiben/erläutern an experiment is not durchführen/untersuchen. Source duties requiring actual work retain that operator; this source inventory grants no laboratory authorization or practical-performance acceptance.','standardIdentifierMap':{'S1-S10':'p7 STD-S standard-S rows1-10','S11-S17':'p8 STD-S standard-S11-S17 rows1-7','E1-E12':'p9 STD-E rows1-12','K1-K8':'p10 STD-K rows1-8','K9-K13':'p11 STD-K rows1-5','B1':'p11 STD-B row1','B2-B14':'p12 STD-B rows1-13'}})

counts={'activeOfficialSourceGoals':0,'authorCandidatePrimaryClauseSourceGoals':len(GOALS),'independentUniqueOfficialDutyCount':None,'countingRule':'232 source-located clause entries, with thematic recurrence; not232 independently unique competencies. Section2/3.1 overlaps explicitly declared; termsets, optional suggestions and derived entries are separate, nonadditive inventories. Inactive candidate, no approved source credits.','numberedGeneralStandards':sum(c['obligationType']=='numbered_general_standard' for c in clauses),'crossTopicProcessAndDigital':sum(c['topic']=='PROCESS' for c in clauses),'topicContentAndProcessClauses':sum(c['obligationType']=='thick_frame_content_or_process' for c in clauses),'mandatoryTermSets':len(terms),'optionalSourceSuggestions':len(optional),'crossCuttingFrameworkRecords':len(framework),'section2Section3_1PartialOverlapRecords':len(overlaps),'historical97':97,'oldStableIdsReusedAsPrimary':len(USED & set(old_by_id)),'oldStableIdsRetainedAsDerived':len(derived),'allHistoricalIdsAccountedFor':len(dispositions),'canonicalCarrierBindings':0,'canonicalCarrierReviewPendingForClauses':len(clauses)}
assert len(clauses)==len(GOALS)==len(USED)
assert counts['numberedGeneralStandards']==56
assert counts['crossTopicProcessAndDigital']==14
assert len(dispositions)==97
assert len(derived)+counts['oldStableIdsReusedAsPrimary']==97
assert all(len([c for c in clauses if c['sourceGoalId']==g['id']])==1 for g in GOALS)
assert len({c['clauseId'] for c in clauses})==len(clauses)
assert all(g['passageId'] in {p['id'] for p in passages} for g in GOALS)
assert all(g['id'] in next(p['sourceGoalIds'] for p in passages if p['id']==g['passageId']) for g in GOALS)
assert not any('rawSourceText' in g for g in GOALS if g['id'] not in [old['sourceGoals'][95]['id'],old['sourceGoals'][96]['id']])
assert all(goal_by_id[old['sourceGoals'][i]['id']]==old['sourceGoals'][i] for i in [95,96])
assert hashlib.sha256((BASE/'historical/HB97.original-exact.json').read_bytes()).hexdigest()==old_pin['sha256']
write('checks/structural-author-candidate-validation.json',{'role':'Technical structural validation only; no scientific source acceptance','atUTC':NOW,'passed':True,'counts':counts,'checks':['Selector/A/PDF/original97 input digests exact','Original97 byte exact copy','All97 historical IDs explicitly accounted for','Two correct active-ingredient source objects exact','No duplicated clause ID or primary sourceGoal ID','Each primary sourceGoal traces exactly one source clause','56 original numbered standards and14 actual cross-topic process/digital bullets','No fabricated raw text in new paraphrased entries','All canonical clause-carrier statuses explicitly pending; zero mapping writes','No required clause hidden by absence of canonical carrier','Optional items and mandatory terminology separate from performance clauses'],'limits':'Counts and author structural checks do not establish completeness, source fidelity, mappings or M7.'})
write('candidate/inventory-counts.AUTHOR.json',counts)

README=f'''# Bremen GyO Chemistry primary-clause source inventory — AUTHOR candidate

This is inactive authoring material, prepared from the pinned actual 41-page
official primary PDF. Independent source review is pending. No main, K,
canonical goal, mapping, image, material evidence, runtime or learner state was
changed. The original97 extraction is copied byte-for-byte to `historical/`.

The candidate has **{len(GOALS)} primary competence-clause entries**:
{counts['numberedGeneralStandards']} numbered general standards, 14 cross-topic
process/digital clauses, and {counts['topicContentAndProcessClauses']} topic
content/process clauses. These are source obligations, not a proposed number of
canonical atomic learning goals. The p26 inline LK representation addition has
its own course-specific clause. There are also {len(terms)} mandatory termsets,
{len(optional)} separately optional source suggestions and {len(derived)}
historical stable IDs retained as authored teaching summaries/extensions.
No peer count has been imposed. The clause matrix explicitly leaves all
canonical carriers **pending**; zero canonical source credit is granted.
The candidate has **zero active official sourceGoals**. Its232 author records
contain recurring and partially overlapping requirements;232 is not a count of
independent unique official duties. Fourteen explicit §2/§3.1 overlap records
keep those double references visible without asserting equivalence. Topic
competencies likewise concretise general standards; they are not additive
canonical-atom quotas. Eight framework records also retain base-concept lists,
including concepts not repeated in a topic bullet, and assessment/safety rules.

`sourceText` in the new inventory means a labelled concise authored paraphrase,
never claimed original raw text. The two already correct LK active-ingredient
objects are reused exactly; their provenance/conditions are external in
`sourceGoalProvenance`. Full original97 bodies, including historical audit
flags, are preserved only as historical facts. They do not approve this source.

The official topic/course rules and the broader SkillPilot target policy remain
different pieces of information: p37 makes seven topics compulsory in all Q
courses, 4.3 additionally compulsory in LK, and calls for one GK/two LK topics
from 2.1/2.2/2.3/4.2. The official selection is fixed through the relevant
Abitur Schwerpunktkatalog; no current Schwerpunkt or learner selection is
inferred. All-authored-topic SkillPilot scope can remain broader. Thin frames
stay optional. A mandatory practical operator does not make every suggested
experiment mandatory. A p20 mandatory *term* such as Brennstoffzelle also does
not turn optional p31 fuel-cell evaluation into a universal duty.

Use `clause-to-entry-matrix.AUTHOR-PENDING.json` for the source review and
`stable-ID-disposition-and-mapping-migration-plan.AUTHOR-PENDING.json` for later
mapping work. Old broadly worded rows never carry the whole corresponding
canonical subtree automatically. Every required clause has an explicit source
entry; every canonical carrier remains an openly recorded gap to inspect.
This source package deliberately does not invent new canonical carriers.

The actual primary text was read across all41 physical pages. `materials/`
contains unmodified raster renderings of all E/Q topic tables, p15/21 frame
rules and p37 choice table. These were visually inspected for original course
headings and thick/thin borders. The whole-page receipt records which pages
are standards, interpretation, topic introductions, school assessment guidance
or operator glossary. No complete pdftotext output is included in this package.

New authored knowledge metadata/paraphrases follow repository CC-BY-4.0
allocation. The official PDF, source page renders and exact historical
quotations remain third-party material with unchanged provenance and rights;
no licence over them is invented. The official imprint says reprinting is
permitted; that is not a SkillPilot ownership claim or blanket relicensing.
The builder is Apache-2.0 technical code. This package contains no practical
experiment authorization and no D/P/A/M/V, M7 or human acceptance claim.

Independent A's original checklist was used as a permitted author error list.
Independent B's work or conclusions were not read. The error-resolution list
reports author changes only. Structural validation checks IDs, references and
hashes, not scientific completeness. A new actual-primary independent review
must precede any reviewed mapping successor or activation.
'''
(BASE/'candidate/README.md').write_text(README)

def pin(p): return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
write('source-and-material-pins.AUTHOR.json',{'role':'Author input/output/material provenance; no verdict','atUTC':NOW,'inputSelector':pin(SELECTOR),'allowedIndependentAErrorChecklist':pin(A),'original97':pin(old_path),'primary':pin(pdf_path),'localPrimaryCopy':pin(BASE/'primary/GyO_Chemie_2022.pdf'),'originalOfficialURL':old['sourceDocument']['url'],'materials':[pin(p) for p in sorted((BASE/'materials').glob('*.png'))],'outputs':[pin(p) for p in sorted((BASE/'candidate').glob('*')) if p.is_file()],'history':pin(BASE/'historical/HB97.original-exact.json'),'builder':pin(Path(__file__))})
write('SELECTOR.HB-primary-inventory-author-successor-v1.sealed.json',{'role':'Inactive AUTHOR successor selector; independent review required','atUTC':NOW,'candidate':pin(BASE/'candidate/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.AUTHOR-PENDING.json'),'clauseMatrix':pin(BASE/'candidate/clause-to-entry-matrix.AUTHOR-PENDING.json'),'stableIDDisposition':pin(BASE/'candidate/stable-ID-disposition-and-mapping-migration-plan.AUTHOR-PENDING.json'),'errorResolutions':pin(BASE/'candidate/error-resolution-list.AUTHOR-PENDING.json'),'whole41Inspection':pin(BASE/'candidate/whole41-page-disposition-and-visual-inspection.AUTHOR.json'),'operatorInterpretation':pin(BASE/'candidate/operator-meaning-and-interpretation.AUTHOR.json'),'structuralValidation':pin(BASE/'checks/structural-author-candidate-validation.json'),'pins':pin(BASE/'source-and-material-pins.AUTHOR.json'),'original97Exact':pin(BASE/'historical/HB97.original-exact.json'),'actualPrimary':pin(BASE/'primary/GyO_Chemie_2022.pdf'),'counts':counts,'active':False,'independentReview':'pending','wholeSourceApproved':False,'mainKCanonicalMappingWrites':False})
print(json.dumps(counts,ensure_ascii=False,indent=2))
print('selector',hashlib.sha256((BASE/'SELECTOR.HB-primary-inventory-author-successor-v1.sealed.json').read_bytes()).hexdigest())
