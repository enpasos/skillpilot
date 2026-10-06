#!/usr/bin/env python3
"""Record this reviewer's judgments; never modify or clone operative inputs."""
import collections
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence'
AUTHOR = BASE / '2026-10-06/chemie-b008-nine-twenty-six-operator-and-prerequisite-author-v6'
V5 = BASE / '2026-10-06/chemie-b008-nine-twenty-four-atomic-boundaries-author-v5/twenty-four-atomic-boundaries.de-en.author-proposal.json'
SRC = BASE / '2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3'
PRIMARY = SRC / 'primary-inputs'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def rel(p):
    return str(p.relative_to(ROOT))

def read(p):
    return json.loads(p.read_text())

def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def source(name, start, end, clause):
    p = PRIMARY / name
    lines = p.read_text().splitlines()
    assert 1 <= start <= end <= len(lines)
    return {'path': rel(p), 'sha256': sha(p), 'lineStart': start, 'lineEnd': end,
            'clause': clause, 'actualText': '\n'.join(lines[start - 1:end])}

def by(name, start, end, clause):
    return source(name + '.actual-main.txt', start, end, clause)

def ni(stage, page, start, end, clause):
    return source(f'actual-primary-pdf-pages/ni-{stage}-physical-page-{page:03}.txt', start, end, clause)

freeze = AUTHOR / 'author-v6.with-exact-K11-reference.final.freeze.json'
assert sha(freeze) == 'a8adb6cc44d4fc908820dc79cf0036fef6ab0897c648c2cfd55d667035e057ef'
checks = []
for f in read(freeze)['files']:
    p = ROOT / f['path']
    assert sha(p) == f['sha256'] and p.stat().st_size == f['bytes']
    checks.append({**f, 'actualBytesExact': True})
proposal = read(AUTHOR / 'twenty-six-atomic-boundaries.de-en.author-proposal.json')
atoms = {a['candidateKey']: a for a in proposal['atoms']}
old = {a['candidateKey']: a for a in read(V5)['atoms']}
delta = read(AUTHOR / 'actual-operator-prerequisite-and-two-missing-products.delta.json')
unchanged = [k for k in old if atoms[k] == old[k]]
changed = [k for k in old if atoms[k] != old[k]]
added = [k for k in atoms if k not in old]
assert len(unchanged) == 12 and len(changed) == 12 and len(added) == 2
assert set(unchanged) == set(delta['unchangedExistingWholePrototypes'])
assert set(changed) == set(delta['changedExistingPrototypes'])
assert set(added) == set(delta['newMandatoryProducts'])
for k, fields in delta['changedExistingPrototypes'].items():
    assert set(fields) == {f for f in set(old[k]) | set(atoms[k]) if old[k].get(f) != atoms[k].get(f)}
    for f, d in fields.items():
        assert old[k][f] == d['before'] and atoms[k][f] == d['after']
assert len(atoms) == 26 and all(a['candidateId'] is None for a in atoms.values())
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical = {a['id']: a for a in read(canonical_path)['goals']}
assert sha(canonical_path) == '764c11d951d28be38709d8b01b5eb6d4b3be71e87d9daf5ea4d1dc46f67529a0'
assert canonical['13d4f336-ab16-54a7-9479-c920b458f385']['requires'] == ['416dfd33-8b43-5c49-903c-9847b95e4208']
unresolved = [(k, r) for k, a in atoms.items() for r in a['prerequisiteProposalKeysOrExistingIds'] if r not in atoms and r not in canonical]
assert not unresolved
done, visiting = set(), set()
def visit(k):
    if k in done:
        return
    assert k not in visiting, 'candidate prerequisite cycle'
    visiting.add(k)
    for r in atoms[k]['prerequisiteProposalKeysOrExistingIds']:
        if r in atoms:
            visit(r)
    visiting.remove(k)
    done.add(k)
for k in atoms:
    visit(k)

national_path = SRC / 'all-national-original-nine-source-obligations.actual.json'
national = read(national_path)
assert sha(national_path) == 'a51f97421266fbf2355b386c0e24e65d84b94da9aa51fa1b3429da78d89c4951'
assert len(national['directBindings']) == 1646
assert set(a['originalFamilyGoalId'] for a in atoms.values()) == set(f['goalId'] for f in national['byFamily'])

# These are this reviewer's primary-text observations, not earlier peer decisions.
R = {
 'lower-chemical-question-hypothesis': ([by('by8',35,38,'C8.1 inquiry'), by('by9-ntg',40,43,'C9.1 inquiry')], 'Eine begründete prüfbare Frage-Hypothese mit erwartbarem Gegenbefund ist ein zusammenhängendes Untersuchungsangebot. Beide Sprachfassungen verlangen die eigene Formulierung ausdrücklich.', 'Eigenes Frage-Hypothese-Angebot mit beobachtbarem Test und Gegenbefund; eine Auswahl aus fertigen Hypothesen genügt nicht.', 'Keine harte Voraussetzung; Alltagskontext und notwendiges Stoffwissen können bereitgestellt werden.'),
 'upper-theory-based-question-hypothesis': ([by('by11',37,39,'C11.1.3'), by('by12-ga',73,75,'E1/E2/E3')], 'Eigenes Identifizieren und Formulieren sowie verbindliche Theoriebegründung sind erhalten. Erwartung und Gegenbefund gehören zur gleichen testbaren Hypothese.', 'Alltag/Technikproblem, passende chemische Theorie, eigenständig formulierte Hypothese und theoriebezogene Vorhersage; ein bloßes Begründen einer vorgegebenen Hypothese genügt nicht.', 'Die untere Frage-Hypothese-Routine ist eine fachlich nachvollziehbare didaktische Voraussetzung dieser erweiterten eigenen Formulierung.'),
 'lower-guided-hypothesis-investigation': ([by('by8',30,35,'C8.1'), by('by9-ch',30,39,'C9-CH.1')], 'Durchführung, Sicherheitsanwendung und transparentes Protokoll gehören zu einem realen angeleiteten Versuch. Frage und Hypothese dürfen vorgegeben sein.', 'Tatsächlich ausgeführter angeleiteter Versuch mit überprüfbarem Protokoll und Hypothesenbezug; reine Beschreibung eines Fremdversuchs ist kein Durchführungsprodukt.', 'Das konkrete Sicherheitsatom ist fachlich erforderlich; seine tatsächliche transitive Methodenbasis bleibt erhalten. Die entfernten eigenen Formulierungs- und groben Clusterkanten sind nicht erforderlich.'),
 'lower-independently-planned-hypothesis-investigation': ([by('by9-ntg',35,43,'C9-NTG.1'), ni('i',54,23,29,'NI simple quantitative execution'), ni('i',60,21,31,'NI qualitative AND quantitative execution'), ni('i',52,19,22,'NI hypothesis-test planning')], 'Planung und tatsächliche Ausführung qualitativer UND quantitativer Untersuchungen sind jetzt verbindlich. Das ist eine Hypothesenprüfroutine in beiden erforderlichen Methodenarten, keine unabhängige Methodenliste.', 'Ein einfacher qualitativer und ein einfacher quantitativer tatsächlich ausgeführter, selbst geplanter Hypothesentest; ein integrierter Versuchsfall darf beide Arten zeigen. Keine erfundene Lernendenleistung und keine feste Zusatzaufgabenquote.', 'BLOCK: Eigene Hypothesenformulierung ist keine universelle Voraussetzung eigener Versuchsplanung. NI p52/p54 erlaubt Planung zu einer gegebenen Hypothese bzw. einer gegebenen quantitativen Frage. Sicherheits-/Methodenbasis bleibt erforderlich.'),
 'upper-hypothesis-investigation': ([by('by11',32,39,'C11.1.2/.3'), by('by12-ga',76,78,'E4/E5 practical versus model route')], 'Eigenständige praktische Untersuchung ist gegenüber dem Modelltest sauber getrennt. Qualitativ UND quantitativ, geeignete Analyse und tatsächliche Ausführung bleiben erhalten; keine modellierte Durchführung wird als Experiment ausgegeben.', 'Tatsächliche Oberstufenexperimente mit geeigneter Analysenmethode, belastbarem Protokoll und Sicherheitsanwendung in beiden Methodenarten. Die modellbasierte Alternative ist ein anderes Erfolgsprodukt.', 'BLOCK für eine universelle Kante zu eigener oberer Frage-/Hypothesenformulierung: E4/E5 kann mit einer bereitgestellten theoriegestützten Hypothese geprüft werden. C11.1.3 verlangt die eigene Formulierung im integrierten Quellenfall; diese Fall-/Routenpflicht darf erhalten bleiben.'),
 'data-documentation': ([by('by8',30,32,'C8.1 documentation'), by('by9-ntg',35,37,'C9.1 documentation'), by('by10-ch',30,32,'C10.1 documentation')], 'Ein nachvollziehbarer Datensatz oder ein Protokoll ist ein eigenes Leistungsprodukt. Quantitäten, Bedingungen und Quellen unterscheiden Beobachtung von Erklärung; es ist kein quantitatives Urteil.', 'Vollständiges Daten-/Protokollprodukt mit Einheiten, Herkunft, Bedingungen und Trennung von Beobachtung/Deutung. Anleitung/Eigenständigkeit nach Quelle zuordnen.', 'Keine neue Kante; vollständiges unverändertes v5-Produkt. Historische begrenzte Entscheidungen werden nicht neu gestartet.'),
 'lower-chemical-data-interpretation': ([by('by8',38,40,'C8.1 data interpretation'), by('by10-ch',40,45,'C10.1 trends and validity')], 'Trenddeutung und Rückbezug auf eine vorgegebene Ausgangshypothese ergeben ein zusammenhängendes Datenauswertungsprodukt. Eigene Hypothesenbildung ist korrekt aus der Voraussetzung entfernt.', 'Tabelle/Diagramm mit interpretierbaren Trends und begründetem Hypothesenbezug. Bloßes Ablesen oder eine korrekt gezeichnete Kurve reicht nicht.', 'Nachvollziehbare Datendokumentation ist fachlich passend. Die Hypothese darf bereitgestellt werden.'),
 'upper-quantitative-hypothesis-data-evaluation': ([by('by11',47,49,'C11.1.5'), by('by12-ga',58,60,'S17'), by('by12-ga',87,89,'E8/E11')], 'Unverändert: mathematische Methode, digitale Auswertung, quantitative Interpretation und fachübergreifender Hypothesenbezug gehören zum einen Auswertungsprodukt. Verlässliche Gegenbefunde und Messfehler dürfen nicht gleichgesetzt werden.', 'Quantitative chemische Daten mit geeignetem begründetem mathematischem Verfahren, digitaler Auswertung und tragfähigem Hypothesenurteil mit fachübergreifendem Bezug.', 'Unveränderte v5-Kanten werden in diesem gezielten Delta nicht neu beschlossen. Ein aktuelles Quellen-/Routenurteil, einschließlich Fällen mit bereitgestellter Hypothese, wird dadurch nicht ersetzt.'),
 'data-validity': ([by('by11',42,44,'C11.1.4'), by('by12-ga',167,169,'B3')], 'Unverändert: Eignung, Unsicherheit, Fehler und Tragweite sind Gesichtspunkte desselben begründeten Datenurteils. Ein formaler E12-Kriterienkatalog ist ein anderes Produkt.', 'Begründetes Datenurteil mit realen Bedingungen und Grenzen; Kontroll-/Blindproben und Hinweis/Nachweis im dafür verlangten lokalen analytischen Fall.', 'Unveränderte v5-Kanten fortführen; native Quellen-, Inhalt- und Routenbindungen bleiben offen.'),
 'foreign-inquiry-process-and-reach': ([by('by8',43,45,'C8.1 inquiry reach'), by('by10-ch',45,47,'C10.1 limits')], 'Unverändert: Ein vorgegebener Erkenntnisweg kann ohne eigene praktische Durchführung in seiner chemischen Reichweite erklärt werden. Das ist nicht eigene Prozessreflexion.', 'Gegebener oder historischer Erkenntnisweg mit Frage, Methode, Beobachtung, Interpretation und begründeter Reichweite.', 'Unveränderte v5-Voraussetzung: grundlegende Interpretation. Keine eigene Untersuchung wird vorgeschoben.'),
 'own-inquiry-process-reflection': ([by('by12-ga',93,95,'E10'), ni('ii',17,33,36,'NI own experimental results')], 'Eigene Ergebnisse und eigener Prozess werden gegenüber einem Fremdfall getrennt. Eine selbst ausgeführte angeleitete Untersuchung ist eigene Untersuchung; eigene Planung ist keine allgemeine E10-Pflicht.', 'Nachweis einer selbst tatsächlich ausgeführten Untersuchung plus eigene begründete Reflexion. Methodenbegründung kann auch angewandte vorgegebene Verfahren betreffen; eigene Planungsentscheidungen dürfen nicht erfunden werden.', 'Die angeleitete tatsächliche Durchführung statt eigener Planung ist sachlich richtig. Die Formulierung eigenen Methodenentscheidungen sollte als angewandte Vorgehensweisen geklärt werden, ohne einen neuen unabhängigen Planungserfolg einzufordern.'),
 'upper-scientific-validity': ([by('by12-ga',96,98,'E12')], 'Unverändert: Das begründete Erkenntnisurteil behält Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, Konsistenz und Vorläufigkeit. Eine Fehlmessung widerlegt keine Theorie automatisch.', 'Chemischer Erkenntnisfall mit überprüfbarer Vorhersage, verlässlichen Bedingungen und begründetem Urteil anhand der fünf Kriterien.', 'Unveränderte v5-Kanten. Kein universeller eigener Laborversuch ist nötig.'),
 'sek1-source-information': ([by('by8',62,64,'C8.1 sources'), by('by9-ntg',58,60,'C9-NTG.1 sources'), by('by10-ch',59,61,'C10.1 sources')], 'Unverändert: Eine quellenbasierte Antwort mit Auswahl, Struktur und Quellenbeleg ist ein Produkt. Vorgegebene einfache und selbst recherchierte Quellen müssen in ihrem jeweiligen Umfang unterschieden bleiben.', 'Chemische Frage und passende Texte/Bilder/Darstellungen mit nachvollziehbarer Auswahl, Antwort und Quellenbeleg.', 'Keine neue Voraussetzung. Keine eigene Laborarbeit oder vollständige Quellenkritik vor einfacher Quellenerschließung.'),
 'upper-source-information': ([by('by11',68,76,'C11.1.8/.9'), by('by12-ga',109,117,'K1/K2'), by('by12-ga',130,145,'K8/K12')], 'Unverändert: eigenständige komplexe Recherche, Strukturierung, Schlussfolgerung und Beleg bilden eine erschlossene fachliche Antwort. Darstellungstransformation und tatsächliche Präsentation bleiben andere Produkte.', 'Komplexe analoge und digitale chemische/pharmazeutische Quellen, eigene Recherche und fachliche Schlussfolgerungen samt Zitaten.', 'Unveränderte v5-Quellenbasis; spezifischer Fachinhalt wird je Fall geprüft.'),
 'upper-source-criticism': ([by('by11',73,76,'C11.1.9'), by('by12-ga',120,122,'K3/K4'), by('by12-ga',162,164,'B2/B4'), ni('ii',20,29,38,'NI source criticism')], 'Vergleich und begründetes Eignungs-/Validitätsurteil sind ein eigenes Produkt. Komplexe Quellen können vorgegeben sein. B2/B4 verlangt in seinem ganzen Quellenfall selbst beschaffte Quellen, bleibt daher als geteilter Fallbeitrag mit Recherche erhalten.', 'Glaubwürdigkeit, Intention, fachliche Relevanz, Urheberschaft und Validität anhand tatsächlicher Quellen begründet beurteilen; Autor/Titel nennen allein genügt nicht.', 'Grundlegende Quellenerschließung ist passend. Eigene komplexe Recherche ist richtig als nicht universelle harte Kante entfernt; lokale Eigenrecherchepflichten bleiben auf der Quellenroute.'),
 'criteria-arguments': ([by('by8',74,76,'C8.1 given arguments'), by('by9-ntg',69,71,'C9-NTG.1 own arguments')], 'Eigene fachlich belegte Pro-/Kontra-Argumente sind jetzt verbindlich; der C8-Vergleich fertiger Argumente bleibt ein unterer Teilbeitrag. Finden, Vergleichen und begründetes Gewichten sind ein Argumenturteil.', 'Eigenständig gefundene belegte Argumente plus Vergleich und begründete Gewichtung. Vorgegebene Listen allein erfüllen den oberen eigenen Findungsanteil nicht.', 'Einfache Quellenerschließung unterstützt die eigene Belegsuche. Kein universelles komplexes Recherche- oder Entscheidungsprodukt ist vorgeschaltet.'),
 'chemical-applications-society': ([by('by9-ntg',80,88,'C9.1 applications/career purpose')], 'Unverändert: Beschreibung und gesellschaftliche Diskussion von Anwendungen bilden ein Produkt; Einbeziehen in Berufswahl wird nicht mit diesem Teilprodukt gleichgesetzt.', 'Konkrete chemische Anwendungen und begründete Diskussion ihrer Bedeutung für Mensch, Umwelt und Gesellschaft; lokale Stoffeigenschaftsbeiträge gesondert erhalten.', 'Unveränderte einfache Quellenbasis. Kein fiktiver persönlicher Berufserfolg.'),
 'chemistry-career-choice': ([by('by9-ntg',80,88,'C9.1 include in career choice')], 'Unverändert: Berufsfelder in eine begründete Orientierung einbeziehen bewahrt den stärkeren tatsächlichen Quellenoperator. Eine Liste von Berufen ist kein Erfolg.', 'Berufsfeldvergleich und begründete Einbeziehung in ein tatsächliches oder gekennzeichnet hypothetisches Interessen-/Anforderungsprofil; keine private Entscheidung erfinden.', 'Unveränderte sachliche Anwendungsbasis; hier keine ungeprüfte orientation-Mastery.'),
 'criteria-decision': ([by('by10-ch',69,94,'C10.1 decision process'), by('by12-ga',170,190,'B5-B9/B11/B14')], 'Unverändert: Kriterienableitung, Optionen, Abwägung und Strategie-/Entscheidungsreflexion bilden eine fachlich begründete Entscheidung. Es sind Schritte eines Produkts, keine unabhängigen Inhaltsziele.', 'Konkrete chemische Entscheidung mit abgeleiteten Kriterien, Chancen/Risiken, Optionen und überprüfter Strategie; keine individuelle Arzneimittelberatung.', 'Unveränderte Argumentationsbasis. Kurs-/Stufentiefe und Anleitung bleiben source-specific.'),
 'upper-knowledge-influences': ([by('by11',85,93,'C11.1.11 knowledge development')], 'Unverändert: Das Objekt ist Entwicklung chemischen Wissens, nicht Wirkung eines Produkts. Soziale Bedingungen werden nicht als Ersatz empirischer Gültigkeit behandelt.', 'Belegter Wissensentwicklungsfall mit relevanten sozialen/kulturellen/technologischen/ökologischen/ökonomischen Bedingungen; historischer Beitrag braucht konkrete Fallquellen.', 'Unveränderte v5-Quellen-/Erkenntnisbasis; kein universelles Nachhaltigkeitsentscheidungsprodukt.'),
 'upper-chemical-effects-sustainability': ([by('by12-ga',179,187,'B10/B12/B13')], 'Unverändert: Wirkungsbewertung ist ein anderer Gegenstand als Wissensentstehung. Produkte, Methoden, Verfahren, Erkenntnisse, historische/aktuelle Kontexte, drei Nachhaltigkeitsperspektiven und eigenes Handeln bleiben erhalten.', 'Belegter historischer/aktueller chemischer Wirkungskontext mit ökologischer, ökonomischer und sozialer Abwägung; reine Ökologie eines Einzelprodukts reicht nicht für die ganze Union.', 'Unveränderte v5-Bewertungs-/Quellenbasis. Untere Anwendungsdiskussion ersetzt den oberen Wirkungsanspruch nicht.'),
 'upper-scientific-discourse': ([by('by12-ga',135,148,'K10/K13'), ni('ii',21,39,44,'NI subject-bound argument')], 'Erklären, fachlich begründetes Argumentieren, konstruktiver Austausch und Reflexion/Korrektur eines Standpunkts sind ein echter Diskurs. Isolierte Argumentation oder Reflexion ist nur ein Beitrag.', 'Tatsächlicher fachlicher Austausch mit Antwort auf Einwand und Standpunktreflexion; eA-only NI-Inhalte müssen ihren Kursumfang behalten.', 'Entfernte eigene komplexe Recherche und normative Pro-/Kontra-Abwägung sind keine universellen Voraussetzungen. Das vorhandene Fachsprachatom bleibt unverändert; seine aktuellen transitive Routen müssen separat geprüft werden.'),
 'sek1-model-use-criticism': ([by('by8',48,53,'C8.1 models and need for development'), by('by10-ch',48,53,'C10.1 hypothesis-directed models'), by('by10-ntg',50,55,'C10-NTG.1 hypothesis-directed models')], 'Ein Modell auswählen, nutzen, mit Beobachtungen/anderen Modellen vergleichen und seine Grenzen begründen ist eine zusammenhängende Modellierungsroutine. Zwei wörtliche Operatorprobleme bleiben: tatsächliches Weiterentwickeln im Titel ist nicht beschrieben; der zwingende C10-Hypothesenbezug bleibt durch oder optional.', 'Ein ausdrücklich hypothesengeleiteter chemischer Modellfall plus beobachtungsbezogener Vergleich und begründete Grenzen/Weiterentwicklungsnotwendigkeit. Ein beliebiger Modellvergleich ohne Hypothese kann den verpflichtenden C10-Beitrag nicht ersetzen.', 'Entfernen des universellen Dalton-Inhaltsziels ist korrekt. Je Modell benötigtes Stoff-/Modellwissen wird bereitgestellt oder an wirklich passende Inhaltsziele gebunden.'),
 'upper-model-use-criticism': ([by('by11',52,60,'actual C11.1.6'), by('by12-ga',47,57,'equilibrium, bonding, S13'), by('by12-ga',76,92,'E4/E5/E6/E7/E9')], 'C11.1.6 ist richtig zugeordnet und erhält Bindungsverhältnisse, Molekülgeometrien, Wirkstoff-Rezeptor- und Substrat-Enzym-Wechselwirkungen. Atombau/Periodizität und Gleichgewichte bleiben zusätzliche zwingende Kontexte. Modelltest und Grenzenurteil sind dieselbe Routine, keine zusammengeworfenen inhaltsspezifischen Modellziele.', 'Analoge UND digitale Modelle in der tatsächlichen Kontextunion: Atombau/Periodizität, Gleichgewicht, Bindung/Geometrie komplexer Moleküle und beide biochemisch-pharmazeutischen Wechselwirkungsarten. Ein Wasser-, Atom- oder Gleichgewichtsfall allein belegt die Union nicht.', 'Untere Modellierungsroutine ist passende Prozessbasis. Inhaltsspezifische Voraussetzung nur je tatsächlichem Kontext. E4/E5-Modellalternative erfordert eigene Ziel-/Routenbindung und wird nicht als praktisches Experiment gezählt.'),
 'chemical-representation-transformation': ([by('by11',68,70,'C11.1.8 transform'), by('by12-ga',125,127,'K5/K6/K7/K9'), ni('ii',12,62,64,'NI molecular transformation is a local contribution')], 'Tatsächliches Überführen in eine sach-/adressaten-/situationsgerechte Darstellung ist ein eigenständiges beobachtbares Produkt. Quellenlesen und nur molekulares Formelumwandeln ersetzen die allgemeine Darstellungsleistung nicht.', 'Tatsächlich neu erzeugte passende Daten-/Text-/Prozessdarstellung mit korrekter Fachsprache, Größen und begründeter Darstellungswahl/-grenze. K9-Alltags-/Fachsprache bleibt auch am vorhandenen Fachsprachatom; die ganze Operatorgruppe wird nicht ungeprüft exact.', 'Einfache Informationserschließung ist eine vertretbare Prozessbasis; keine universelle eigene komplexe Recherche oder eigene Laborarbeit. Native Aufgaben müssen auch eigene Ergebnisse als Ausgangsinformation erlauben.'),
 'chemical-presentation': ([by('by12-ga',138,140,'effective exact K11 reference'), ni('ii',21,39,42,'NI own researched results presentation')], 'K11 verlangt chemische Sachverhalte UND Lern-/Arbeitsergebnisse mit analogen UND digitalen Medien. Beide deutschen/englischen Fassungen behalten Sachverhalt sowie eigenen Ergebnisgegenstand und beide Medienarten. Präsentierroutine mit Darstellung/Aufbau/Medium ist ein Produkt.', 'Tatsächliche adressatengerechte Präsentationsprodukte zu chemischem Gegenstand und eigenen Lern-/Arbeitsergebnissen, mit geeigneten analogen und digitalen Medien. Quellenverständnis oder Formeltransformation allein genügt nicht.', 'Darstellungswahl/-transformation ist eine fachlich vertretbare Prozessbasis. Keine harte Kante zu eigener komplexer Recherche oder eigenem Experiment; eigene Ergebnisse können aus anderen Lern-/Arbeitsprozessen stammen.'),
}
assert set(R) == set(atoms)

findings = [
 {'id':'B-v6-01','severity':'scientific_revision_required','candidateKey':'sek1-model-use-criticism','affectedFields':['titleDe','titleEn'], 'literalBefore':{'titleDe':atoms['sek1-model-use-criticism']['titleDe'],'titleEn':atoms['sek1-model-use-criticism']['titleEn']}, 'findingDe':'Weiterentwickeln/improve behauptet tatsächliche Modelländerung; die Beschreibung und BY C8 verlangen begründete Notwendigkeit der Weiterentwicklung. Titel und Erfolgskriterium haben verschiedene Operatorstärke.', 'primarySources':[by('by8',51,53,'need for model development')], 'unadoptedCorrection':{'titleDe':'Chemische Modelle nutzen und kritisch vergleichen','titleEn':'Use and critically compare chemistry models'}},
 {'id':'B-v6-02','severity':'scientific_revision_required','candidateKey':'sek1-model-use-criticism','affectedFields':['descriptionDe','descriptionEn','sourceOperatorScopeContractDe'], 'literalProblemDe':'für eine chemische Fragestellung oder prüfbare Hypothese', 'literalProblemEn':'for a chemical question or testable hypothesis', 'findingDe':'Der Oder-Zweig erlaubt vollständigen Erfolg ohne Hypothese. BY C10.1 fordert jedoch hypothesengeleitete Beantwortung im Erkenntnisweg. Der explizite Autorenvertrag ersetzt den fehlenden verpflichtenden Beschreibungsoperator nicht.', 'primarySources':[by('by10-ch',51,53,'mandatory hypothesis-directed model use'),by('by10-ntg',53,55,'mandatory hypothesis-directed model use')], 'unadoptedCorrection':{'descriptionDe':'Die lernende Person kann für eine chemische Fragestellung hypothesengeleitet geeignete analoge oder digitale Modelle und Simulationen zu Materie, chemischen Reaktionen, Bindungen und Wechselwirkungen auswählen und nutzen, ihre Aussagen mit Beobachtungen und miteinander vergleichen, Grenzen benennen und begründen, weshalb ein Modell hinterfragt oder weiterentwickelt werden muss.','descriptionEn':'The learner can select and use suitable analogue or digital models and simulations of matter, chemical reactions, bonding and interactions in a hypothesis-guided investigation of a chemical question, compare their predictions with observations and with each other, identify limitations and justify why a model should be questioned or developed further.'}, 'scopeProtection':'C8/C9 lower model-use contributions remain source-specific partial contributions; this does not make the C10 hypothesis requirement obligatory in an earlier source scope without a reviewed target decision.'},
 {'id':'B-v6-03','severity':'scientific_prerequisite_revision_required','candidateKey':'lower-independently-planned-hypothesis-investigation','affectedFields':['prerequisiteProposalKeysOrExistingIds','sourceOperatorScopeContractDe'], 'literalBefore':atoms['lower-independently-planned-hypothesis-investigation']['prerequisiteProposalKeysOrExistingIds'], 'findingDe':'Selbstständige Versuchsplanung kann zu einer vorgegebenen Frage/Hypothese erfolgen. Die harte Voraussetzung eigener Frage-/Hypothesenformulierung macht eine unabhängige Erfolgsleistung vor jedem quantitativen NI-Planungsfall obligatorisch.', 'primarySources':[ni('i',52,19,22,'plan experiments to test hypotheses'),ni('i',54,23,29,'simple quantitative planning and execution')], 'concreteCounterexampleDe':'Eine chemisch sinnvolle Hypothese zur Massenkonstanz wird bereitgestellt; die Person plant selbst Messfolge, geschlossene Vergleichsbedingungen und sichere Ausführung und protokolliert den tatsächlichen quantitativen Versuch. Eigene Hypothesengenerierung wurde dadurch nicht vorausgesetzt oder gezeigt.', 'unadoptedCorrection':{'prerequisiteProposalKeysOrExistingIds':['lower-guided-hypothesis-investigation']}, 'sourceProtection':'Die echte eigene Formulierungsleistung bleibt unverändert am lower-chemical-question-hypothesis und auf den sie verlangenden integrierten Quellen-/Lernwegen verpflichtend.'},
 {'id':'B-v6-04','severity':'scientific_prerequisite_revision_required','candidateKey':'upper-hypothesis-investigation','affectedFields':['prerequisiteProposalKeysOrExistingIds','sourceOperatorScopeContractDe'], 'literalBefore':atoms['upper-hypothesis-investigation']['prerequisiteProposalKeysOrExistingIds'], 'findingDe':'Die praktische E4/E5-Leistung kann zu einer bereitgestellten theoriegestützten Hypothese geplant und durchgeführt werden. Eigene theoriegestützte Frage-/Hypothesengenerierung ist eine andere E1/E2/E3-Leistung. Die universelle Kante ist stärker als das praktische Erfolgsprodukt.', 'primarySources':[by('by11',32,39,'separate practical and own theory-based products'),by('by12-ga',73,78,'separate E1/E2/E3 and E4/E5')], 'concreteCounterexampleDe':'Zur bereitgestellten Hypothese einer Abhängigkeit der Reaktionsgeschwindigkeit von Konzentration plant die Person selbst eine geeignete quantitative Messreihe und qualitative Kontrollbeobachtung, wählt geeignete Methoden und führt tatsächlich sicher durch; die Hypothese selbst hat sie nicht erzeugt.', 'unadoptedCorrection':{'prerequisiteProposalKeysOrExistingIds':['lower-independently-planned-hypothesis-investigation']}, 'sourceProtection':'C11.1.3 integriert eigene theoriegestützte Hypothese und Planung; in dieser echten Quellenroute bleiben beide Leistungsprodukte verpflichtend. Eine Modellalternative wird weiterhin nicht als Experiment gewertet.'},
 {'id':'B-v6-05','severity':'clarification_without_new_scientific_block','candidateKey':'own-inquiry-process-reflection','affectedFields':['descriptionDe','descriptionEn'], 'literalProblemDe':'die eigenen Methoden- und Vorgehensentscheidungen begründen','literalProblemEn':'justify their own methodological and procedural decisions', 'findingDe':'Der neue Vertrag lässt eine selbst ausgeführte angeleitete Untersuchung korrekt zu. Methodenbegründung ist dabei Begründung der angewandten Verfahren; keine tatsächlich nicht getroffene eigene Planungsentscheidung darf behauptet werden. Eine sprachliche Klärung ist sinnvoll.', 'primarySources':[by('by12-ga',93,95,'reflect own process'),ni('ii',17,33,36,'reflect own performed experiment results')], 'optionalUnadoptedPhraseDe':'die angewandten Methoden und Vorgehensweisen begründen', 'optionalUnadoptedPhraseEn':'justify the methods and procedures used'}
]
blocked = {f['candidateKey'] for f in findings if f['severity'].endswith('revision_required')}
verdicts = []
for k, a in atoms.items():
    refs, science, material, prereq = R[k]
    verdicts.append({'candidateKey':k,'candidateId':None,'originalFamilyGoalId':a['originalFamilyGoalId'],
        'inputSemanticFields':{f:a[f] for f in ['stageProposal','titleDe','descriptionDe','titleEn','descriptionEn','prerequisiteProposalKeysOrExistingIds']},
        'wholePrototypeSha256':hashlib.sha256(json.dumps(a,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),
        'deltaScope':'added' if k in added else 'changed' if k in changed else 'unchanged_whole_v5_continuity',
        'descriptionScienceDecision':'needs_revision' if k == 'sek1-model-use-criticism' else 'scientifically_supported_bounded_prototype',
        'scientificReadiness':'needs_revision' if k in blocked else 'bounded_prototype_supported_downstream_bindings_pending',
        'scientificReasonDe':science,'semanticAtomic':True,'semanticAtomicityReasonDe':'Ein zusammenhängendes fachliches Prozessprodukt; seine Schritte und verbindlichen Kontexte sind nicht als unabhängige Inhaltsroutinen gebündelt. Keine operative Ledgerentscheidung.',
        'deEnParity':'same_required_product_and_contexts', 'primarySources':refs,
        'prerequisiteDecisionDe':prereq,
        'prerequisiteReadiness':'needs_revision' if k in {'lower-independently-planned-hypothesis-investigation','upper-hypothesis-investigation'} else 'unchanged_continuity_no_new_native_route_approval' if k in unchanged else 'bounded_didactic_proposal_supported_source_routes_pending',
        'requiredMaterialEvidenceDe':material,
        'actualPProfileStatus':'not_authored_or_reviewed_for_this_candidate',
        'actualVisualizationStatus':'not_reviewed_for_this_candidate',
        'actualMemoryStatus':'pending_current_candidate_decision_not_a_flashcard_default',
        'sourceCourseTargetRouteStatus':'pending_actual_placement_exact_partial_and_alternative_bindings',
        'nativeDStatus':'not_submitted_no_candidate_id',
        'operativeGateApproval':False,'strictCompletionsAdded':0,'humanApproval':False,'humanTrial':False,
        'findingIds':[f['id'] for f in findings if f['candidateKey']==k]})

save('all26.scientific-source-operator-atomicity-prerequisite.actual.verdicts.json', {
 'schemaVersion':1,'reviewer':'independent-b','createdAtUTC':NOW,
 'reviewedAuthorFreezeSha256':sha(freeze),'all26DeEnRead':True,
 'priorPeerVerdictBodiesRead':False,'newPeerOutputsRead':False,
 'counts':{'allPrototypes':26,'changed':12,'added':2,'unchangedWholeContinued':12,'boundedScientificallyReadyWithPendingDownstreamGates':23,'prototypesRequiringScientificRevision':3,'literalBlockingFindings':4},
 'verdicts':verdicts,'notAnOperativeDOrAApproval':True,'strictCompletionsAdded':0,
 'currentStrictBaseline':{'chemie':'112/378','biologie':'67/383','mathematik':'807/807','physik':'478/478'},
 'missingFutureMaterialsAreNotScientificDefects':True})
save('literal-scientific-findings-and-unadopted-corrections.actual.json',{
 'schemaVersion':1,'reviewer':'independent-b','createdAtUTC':NOW,'findings':findings,
 'correctionsAdopted':False,'frozenInputsEdited':False,'nativeDOrPApproval':False,
 'separateDownstreamPending':['actual positive-understanding-evidence-v2 materials/profiles','source/course/stage/target placements and exact/partial mapping decomposition','practical versus model alternative routes','current Memory decisions/cards/visibility if required','actual visualization/image checks','native IDs and two independent current D reviews plus A/M/V','guarded integration and central protected-floor checks'],
 'untouchedV5ContinuityBoundary':'Unchanged whole prototypes preserve their bounded earlier decision continuity. This review reads their current wording and source scope but neither imports unseen historical verdicts nor grants a new universal native route approval. Any later genuine binding defect must be resolved on the affected native route.',
 'scientificReadyForWholePackage':False,'humanApproval':False,'strictCompletionsAdded':0})

families = []
for f in national['byFamily']:
    group = [v for v in verdicts if v['originalFamilyGoalId']==f['goalId']]
    families.append({'originalFamilyGoalId':f['goalId'],'currentTitle':canonical[f['goalId']]['title'],
      'originalSourceBindingCount':f['count'],'originalJurisdictionCounts':f['jurisdictionCounts'],
      'candidateKeys':[v['candidateKey'] for v in group],
      'mandatoryProductTrace':[{'candidateKey':v['candidateKey'],'productAndMaterialRequirementDe':v['requiredMaterialEvidenceDe'],'scientificReadiness':v['scientificReadiness'],'primarySourceBindings':v['primarySources']} for v in group],
      'wholeNationalMappingApproved':False,'originalWholeSourceBindingsPreservedAsUnchangedInput':True,
      'remainingOriginalSourceObligations':'All original local content, operator, course, stage, exact/partial and reverse-prerequisite obligations remain inputs. A process product does not erase local content or license universal target assignment.'})
save('nine-families.mandatory-products-and-material.actual.trace.json',{
 'schemaVersion':1,'createdAtUTC':NOW,'reviewer':'independent-b',
 'originalNationalSourceObligationInput':{'path':rel(national_path),'sha256':sha(national_path),'directBindingCount':1646,'wholeNationalScientificApproval':False},
 'families':families,
 'explicitCrossFamilySourceUnion':{
   'BY_C11_1_6':'upper-model-use-criticism preserves binding, geometry, drug-receptor and substrate-enzyme contexts, distinct from C11.1.5 spreadsheet data evaluation.',
   'BY_K5_K6_K7_K9':'chemical-representation-transformation adds actual transformation; retained existing 95dc0ee5-a0af-5682-af32-d66e36fbeb50 contributes everyday/scientific language distinction. Full exact source mapping and placements remain pending.',
   'BY_K11_effectiveReference':by('by12-ga',138,140,'K11 chemical matter and learning/work results, analogue AND digital'),
   'NI_lower_qualitative_and_quantitative':'lower-independently-planned-hypothesis-investigation explicitly requires both simple execution types; simple NI p54/p60 course/stage obligations remain source-specific.',
   'practical_or_model':'upper-hypothesis-investigation and upper-model-use-criticism retain different real products; BY E4/E5 does not create a universal AND of both routes.',
   'hypothesis_directed_lower_model':'still scientifically blocked by the optional hypothesis branch in descriptionDe/descriptionEn; see B-v6-02.'},
 'noTaskQuotaInvented':True,'noLearnerPerformanceInvented':True,'strictCompletionsAdded':0})

read_paths = [ROOT/'AGENTS.md', ROOT/'docs/qa-ci/chemie-biologie-m7-goaltext-2026-09-30.md', ROOT/'docs/concept/curriculum-quality-and-human-trial.md', ROOT/'docs/qa-ci/semantic-atomicity-review.md', ROOT/'docs/qa-ci/math-physics-deep-understanding-procedure-review-2026-09-02.md', freeze, V5, national_path, canonical_path]
read_paths += [ROOT/f['path'] for f in read(freeze)['files']]
read_paths += sorted(PRIMARY.glob('by*.actual-main.txt'))
read_paths += [PRIMARY/'actual-primary-pdf-pages'/f'ni-{stage}-physical-page-{page:03}.txt' for stage,page in [('i',52),('i',54),('i',59),('i',60),('ii',12),('ii',13),('ii',14),('ii',17),('ii',20),('ii',21)]]
baseline_path = BASE/'2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-strict-progress-and-preservation.actual.json'
read_paths.append(baseline_path)
unique = list(dict.fromkeys(read_paths))
save('scope-read-inputs-and-exact-delta.actual.json',{
 'schemaVersion':1,'createdAtUTC':NOW,'reviewer':'independent-b','independence':{
  'authorRole':False,'priorAOrBVerdictBodiesRead':False,'newPeerOutputsRead':False,
  'authorControlsContainPeerFileNamesAndHashes':True,'peerNamesOrHashesAreNotPeerConclusionReading':True,
  'ownVerdictsDerivedFrom':'all 26 exact DE/EN prototype bodies, actual v5/v6 delta, current canonical contexts and primary source texts'},
 'authorFinalFreeze':{'path':rel(freeze),'sha256':sha(freeze),'fileCount':6,'allSixFilesExact':True,'files':checks},
 'effectiveK11Override':read(AUTHOR/'actual-K11-primary-line-reference.correction.json'),
 'exactDelta':{'changedExistingPrototypes':changed,'unchangedWholeV5Prototypes':unchanged,'newPrototypes':added,'allDeltaFieldSetsAndBeforeAfterValuesExact':True},
 'actualReadInputHashes':[{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size} for p in unique],
 'sourceReadingBoundary':'Actual BY process paragraphs for C8/C9/C10/C11/C12/C13, ga/eA where present, and targeted NI actual PDF page text; reading hashes do not assert exhaustive whole-document or all-national approval.',
 'graphChecks':{'allCandidateIdsNull':True,'candidatePrerequisiteIdsResolve':True,'candidatePrerequisiteGraphAcyclic':True,'currentSafetyAtomTransitivelyRetainsMethods':True,'existingLanguageAtomAndItsTransitivePrerequisitesRetainedExact':True},
 'currentRecordedCentralBaseline':{'path':rel(baseline_path),'sha256':sha(baseline_path),'subjects':[{k:s[k] for k in ['subject','denominator','strictComplete']} for s in read(baseline_path)['subjects']]},
 'mutations':{'onlyOwnReviewDirectoryWritten':True,'activeSourceWrites':False,'nativeInputTreeCopies':False,'runtimePluginImageWrites':False,'fullBuildOrCentralReportRerun':False},
 'strictCompletionsAdded':0,'nativeDOrPClaim':False,'humanApproval':False,'humanTrial':False})

(OUT/'README.md').write_text('''# Chemistry B008 author-v6: independent B targeted scientific review

The exact final author freeze `a8adb6cc44d4fc908820dc79cf0036fef6ab0897c648c2cfd55d667035e057ef` and all six referenced files are verified. The effective K11 primary reference is lines 138–140, as corrected by the bound override. All 26 DE/EN products were read. The actual delta is 12 changed, 2 added and 12 exact whole unchanged prototypes. Earlier peer verdict bodies and new peer outputs were not read. Unchanged bounded prototype continuity is preserved without a historical review restart or a new native approval.

Independent B requires four precise scientific corrections in three prototypes: the lower model title overstates actual model development; its description still makes mandatory C10 hypothesis-directed use optional; the lower and upper independently planned practical investigation products retain universal prerequisites for own hypothesis generation although a supplied-hypothesis planning case is legitimate. Exact fields, primary quotations and unadopted DE/EN proposals are in [findings](literal-scientific-findings-and-unadopted-corrections.actual.json). A guided own investigation may be reflected on without pretending that the learner made independent planning decisions; this is a wording clarification, not a separate scientific blocker.

[All 26 decisions](all26.scientific-source-operator-atomicity-prerequisite.actual.verdicts.json) distinguish the one process product from independent bundles, literal operators, actual material requirements, source/course/target/route pending work and operative gates. All 26 products are semantically one process routine; this is a bounded scientific judgment, not an active Atomicity ledger write. Twenty-three prototypes have no new blocking finding within this targeted scope. The complete v6 package is not scientifically ready until the three affected prototypes are corrected and checked.

The [nine-family trace](nine-families.mandatory-products-and-material.actual.trace.json) preserves all 1646 source-binding obligations as unchanged input, without whole-national mapping clearance. NI simple qualitative AND quantitative execution, own question/hypothesis formation, theory-based upper formation, independent argument finding, distinct own reflection, practical versus model alternatives, all C11.1.6 complex contexts, transformation, and actual analogue AND digital presentation of chemical matter and own learning/work results remain explicit. One generic context or a special molecule-formula conversion cannot discharge the whole source union.

Missing future P materials, source/course/stage/target/route placement, Memory, actual images/V, IDs and native D/A/M/V checks remain downstream work. They are not counted as scientific wording defects. Candidate IDs remain null; no operative D/P or M7 completions are claimed. The recorded central baseline remains Chemistry 112/378 and Biology 67/383, with Mathematics 807/807 and Physics 478/478 preserved. No active, frozen input, runtime, plugin or image files were changed. No human approval or trial is claimed.
''')
files = []
for p in sorted(OUT.iterdir()):
    if p.is_file() and p.name != 'independent-b.final.freeze.json':
        files.append({'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size})
save('independent-b.final.freeze.json',{'schemaVersion':1,'createdAtUTC':NOW,'reviewer':'independent-b','reviewedAuthorFreezeSha256':sha(freeze),'files':files,'completeReviewFrozen':True,'scientificWholePackageReady':False,'affectedPrototypeCount':3,'literalBlockingFindingCount':4,'downstreamPendingIsSeparate':True,'strictCompletionsAdded':0,'activeWrites':False,'humanApproval':False,'humanTrial':False})
print(json.dumps({'outputDirectory':rel(OUT),'finalFreezeSha256':sha(OUT/'independent-b.final.freeze.json'),'fileCount':len(files),'reviewedPrototypes':26,'blockingFindings':4,'affectedPrototypes':3,'strictCompletionsAdded':0},ensure_ascii=False))
