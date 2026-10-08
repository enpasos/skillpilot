import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-upper-communication-evaluation-sixteen-native-author-technical-resumed-v1'
OWN = Path(__file__).resolve().parent
ENTRY = json.loads((BASE / 'neutral-sixteen-native-independent-review.entry.json').read_text())
INPUT = json.loads((BASE / 'native-sixteen/round-b/description-review-input.json').read_text())
CAMPAIGN = json.loads((BASE / 'native-sixteen/round-b/description-review-campaign.json').read_text())
BUNDLE = json.loads((BASE / 'native-sixteen/bundle/review-bundle-manifest.json').read_text())
CASES = json.loads((BASE / 'neutral-inputs/whole-sixteen-thirty-two-bilingual-cases.json').read_text())['entries']
P = [json.loads(s) for s in (BASE / 'positive/P16.current-raster.author-candidate.review.jsonl').read_text().splitlines()]
RASTERS = json.loads((OWN / 'actual-sixteen-raster-bindings-and-responsive-inputs.json').read_text())
RUN_ID = 'biologie-upper-sixteen-whole-independent-b-resumed-v1.actual-first-run'
NOW = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

def digest(p):
    return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()

def write(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

# These are this independent reviewer's actual subject judgments, written after
# reading the complete 16 bilingual goals and all 32 bilingual worked cases.
# No author or independent-A judgment was read before this first verdict.
NOTES = [
    dict(
        essentialDe='Eine biologische Recherchefrage steuert Auswahl und Erschließung analoger und digitaler Quellen; Besuchszahlen sind keine Artenzahlen und Beobachtungsunterschiede kein isolierter Kausaleffekt.',
        essentialEn='A biological research question guides selection and interpretation of analog and digital sources; visits are not species counts and observational differences do not isolate causes.',
        performanceDe='Protokolliert Suchbegriffe, A1-Kapitel bzw. B1-Register und digitale D1/D2 bzw. E1/E2-Lokatoren; verknüpft Nahrungsnetz mit 40/8 Besuchen oder Wasser/Sauerstoff mit 18/2/5 Keimungen und begründet Ausschlüsse.',
        performanceEn='Records search terms, A1 chapters or B1 index and digital D1/D2 or E1/E2 locators; connects the food network to 40/8 visits or water/oxygen to 18/2/5 germinations and justifies exclusions.',
        transferDe='Verengt die Frage bei Windbestäubung auf Tierbestäuber oder ergänzt für Lichtkeimer einen artspezifischen Hell-Dunkel-Vergleich statt fertige Zahlen zu übernehmen.',
        transferEn='Narrows the question to animal pollinators after a wind-pollination result or adds a species-specific light/dark comparison for light-requiring seeds rather than copying ready numbers.',
        observation='research-urban-tree trennt 40/8 Besuche von Artzahl und Kausalität. research-seed-germination verbindet 18/20, 2/20, 5/20 mit Wasser-/Sauerstoffbedingungen, ohne eine Licht- oder Artenregel zu behaupten. Beide Medienwege sind in tatsächlichen sieben HTML-Materialien ausführbar.'),
    dict(
        essentialDe='Quellenvertrauen folgt der konkreten Erhebungs- und Darstellungslage; erkennbare Verkaufs- oder Spendenabsicht beweist weder Täuschung noch Wahrheit.',
        essentialEn='Source credibility follows actual collection and presentation methods; sales or donation purposes prove neither deception nor truth.',
        performanceDe='Vergleicht beim Algenmodell den kontrollierten 20→16-Unterschied von 20% mit einem unter anderen Lichtbedingungen gewonnenen 80%-Werbesatz; prüft beim Nistkastenmodell Vorher/Nachher, Parkvergleich und verkürzte Achse.',
        performanceEn='Compares the controlled algae-model difference 20→16, or 20%, with an 80% advert obtained under changed light; examines before/after counts, park comparisons and truncated axes in the nest-box model.',
        transferDe='Beurteilt neue Finanzierung getrennt von weiterhin offenen Methoden und trennt Kastenbelegung von vollständigen Brutpaarzahlen.',
        transferEn='Assesses new funding separately from still-open methods and distinguishes occupied boxes from total breeding-pair counts.',
        observation='source-quality-algae enthält keine falsche 80%-gegen-20%-Widerspruchsbehauptung; Finanzierungstransfer vermeidet Ad-hominem. source-quality-birds bewahrt 10→20 und kleine Parkunterschiede, erklärt Achsenrahmung und die Änderung der Zielgröße.'),
    dict(
        essentialDe='Darstellungswechsel bewahrt Größen, Einheiten, Nenner und Aussageebene; geordnete Daten dürfen nicht stillschweigend zu einer bewiesenen Prozesskette werden.',
        essentialEn='Representation changes preserve quantities, units, denominators and evidential level; organized observations must not silently become a proven process chain.',
        performanceDe='Strukturiert kumulative Keimungen 0/4/14/18 und Intervallzuwächse 0/4/10/4 mit Tagen 0/2/4/6; überführt Nitrat- und Sauerstoffmessungen in eine korrekt beschriftete Tabelle und gekennzeichnete Prozesshypothese.',
        performanceEn='Structures cumulative germinations 0/4/14/18 and interval increases 0/4/10/4 at days 0/2/4/6; transforms nitrate and oxygen data into a labeled table and explicit process hypothesis.',
        transferDe='Vergleicht 18/20 mit 24/40 als 90%/60% und ordnet eine spätere Sauerstoffänderung ohne voreilige Widerlegung der Abbauhypothese ein.',
        transferEn='Compares 18/20 and 24/40 as 90% and 60% and interprets later oxygen change without prematurely refuting the decomposition hypothesis.',
        observation='representation-seed rechnet kumulative und neue Werte korrekt; größter beobachteter Zuwachs liegt 2–4 Tage, 18/20=90%. representation-stream nennt Nitrat 2/8/6 und O2 8/7/4 mg/L; Algen/Abbau bleiben Hypothese. Das Lernzielbild ist ein getrenntes ausdrücklich schematisches 1/2/3–2/4/6-Beispiel, keine Behauptung über diese Fälle.'),
    dict(
        essentialDe='Aktueller Mechanismus, mögliche Funktion und evolutionäre Entstehung sind unterschiedliche biologische Erklärfragen; Organismen planen keine künftige Anpassung.',
        essentialEn='Current mechanism, possible function and evolutionary origin are distinct biological explanations; organisms do not plan future adaptation.',
        performanceDe='Ersetzt anthropomorphe Pflanzen-/Falterformulierungen; erklärt Signal und ungleiche Streckung bzw. Pigmentbildung proximat und vererbbare Variation mit unterschiedlichem Fortpflanzungserfolg ultimat.',
        performanceEn='Replaces anthropomorphic plant/moth wording; explains signals and unequal elongation or pigment production proximately and inherited variation with differential reproductive success ultimately.',
        transferDe='Unterscheidet Rezeptorblockade als aktuellen Mechanismusnachweis von Evolutionsgeschichte und äußere Verschmutzung von vererbter Pigmentvariation.',
        transferEn='Distinguishes receptor blockade as current-mechanism evidence from evolutionary history and surface dirt from inherited pigment variation.',
        observation='language-light-response behandelt Rezeptor→Signal→Streckung→Krümmung als proximate Kette und Generationen/Fortpflanzung als ultimate Modellhypothese. language-moth-color hält Variation vor Selektion und Kontextabhängigkeit auf hellem/dunklem Hintergrund fest. Die beiden Erklärungsebenen bilden eine zusammenhängende beurteilbare Unterscheidung, keine neue Splitpflicht.'),
    dict(
        essentialDe='Adressat und Situation steuern Sprache und Auswahl, ohne biologische Beziehungen, Datenbasis oder Unsicherheit zu verfälschen.',
        essentialEn='Audience and situation guide wording and selection without distorting biological relationships, evidence or uncertainty.',
        performanceDe='Erstellt aus 4→7 mg/L eine kindgerechte Teichinformation und eine fachliche Kursnotiz; verarbeitet 18/30 Merkmalsträger als bedingten 60%-Modellbefund für Jugendgruppe und Fachteam.',
        performanceEn='Creates a child-appropriate pond explanation and technical note from 4→7 mg/L; communicates 18/30 trait carriers as a conditional 60% model result for a youth group and specialist team.',
        transferDe='Ändert den Rundgang für Nachtbedingungen und benennt fehlende Daten zweier neuer Umwelten anstelle erfundener Prozentsätze.',
        transferEn='Adapts the tour to nighttime and identifies missing data for two new environments rather than inventing percentages.',
        observation='audience-pond korrigiert immer Sauerstoff/bewiesen gesund und erhält Tagesatmung sowie Temperatur-/Durchmischungsunsicherheit. audience-inheritance unterscheidet Variante, Umwelt, Beobachtung und Individualprognose; keine zusätzliche molekulare Methode wird zum Pflichtinhalt.'),
    dict(
        essentialDe='Eine Präsentation macht biologische Ergebnisse in analogen und digitalen Medien verständlich, datengetreu und adressatengerecht; das Medium erzeugt keinen Kompetenz- oder Ursachenbeweis.',
        essentialEn='A presentation makes biological results understandable, faithful and audience-appropriate in analog and digital media; the medium itself proves neither competence nor causes.',
        performanceDe='Präsentiert sechs Besuchswerte 12/15/13 und 4/5/3 pro 30 Minuten mit Sprechertext und offenen Licht-/Artgrenzen; erklärt Stoffumsatz und Energieaussage der aeroben Zellatmung in Stationskarte und digitalem Modell.',
        performanceEn='Presents six visit counts 12/15/13 and 4/5/3 per 30 minutes with delivery text and light/species limitations; explains material conversion and aerobic-respiration energy in a station card and digital model.',
        transferDe='Passt den Vortrag bei Beamerversagen/Sehbedarf an und korrigiert Pflanzen atmen nur nachts ohne erfundene Nettogaswerte.',
        transferEn='Adapts delivery to projector failure or visual needs and corrects plants respire only at night without invented net gas values.',
        observation='presentation-pollinator enthält tatsächliche analoge/digitale HTML-Materialien, sechs gleichskalierte Zahlen, Alternativbeschreibung und Sprechertext. presentation-respiration trennt Glucose/O2→CO2/Wasser von Energie/Wärme und behauptet weder ATP-Bilanz noch tatsächliche Durchführung.'),
    dict(
        essentialDe='Urhebernachweis, konkrete Fundstelle, direktes Zitat, Paraphrase und eigene Ableitung sind unterscheidbar; eine Weiterleitung ist keine Originalquelle.',
        essentialEn='Authorship, specific locator, direct quotation, paraphrase and own inference are distinct; a repost is not the original source.',
        performanceDe='Prüft C1/C2/C3-Originalcredits, belegt Passage/Tabelle/Figur, markiert ein kurzes direktes Zitat und 18/20×100=90% als eigene Rechnung; kennzeichnet Neuzeichnung und Übernahme verschieden.',
        performanceEn='Checks C1/C2/C3 original credits, cites passage/table/figure, marks a short direct quotation and 18/20×100=90% as own calculation; distinguishes redrawing from reproduction.',
        transferDe='Erkennt geänderte Weiterleitungszahlen und lässt bei fehlenden Originalcredits Urheber/Lizenz ausdrücklich ungeklärt.',
        transferEn='Detects changed reposted counts and leaves authorship/license explicitly unresolved when original credits are absent.',
        observation='Beide ganzen Fälle decken Urheberschaft, Quellenbeleg und Zitatformen sinnvoll gemeinsam ab. Ein lokaler Materialbefund bleibt: tatsächliche HTML-C1 enthält bisTag 6, während Fallmaterial und direktes DE-Zitat bis Tag 6 verwenden. Der direkte Ausgangstext ist für diesen Zitierfall vor Abschluss minimal anzugleichen.',
        pHold=True),
    dict(
        essentialDe='Wissenschaftliches Argumentieren verknüpft Daten und Schlussregel, respektiert tragfähige Einwände und revidiert den Standpunkt bei veränderter Evidenz.',
        essentialEn='Scientific argument links data and inference, respects valid objections and revises a position when evidence changes.',
        performanceDe='Prüft beim Moosvergleich 20%/60% gegen Feuchte/Rinde beide extreme Behauptungen; unterscheidet beim Keimmodell 24/30 und 22 Keimungen bei vier fehlenden Dunkelwerten Unterschied, Notwendigkeit und allgemeine Aussage.',
        performanceEn='Examines both extreme moss claims using 20%/60% and moisture/bark confounding; distinguishes difference, necessity and universality in 24/30 versus 22 germinations with four missing dark outcomes.',
        transferDe='Revidiert einen großen isolierten Verkehrseffekt nach 19%/21% unter kontrollierterem Vergleich und überträgt die Antwort nicht auf eine neue Art mit 0/30 versus 25/30.',
        transferEn='Revises a large independent traffic effect after better-controlled 19%/21% comparison and does not transfer the answer to a different species with 0/30 versus 25/30.',
        observation='argument-moss unterscheidet begrenzte Assoziation von Ursache und nutzlos von prüfbedürftig. argument-light-seeds hat trotz vier Ausfällen tatsächliche Dunkelkeimungen als Gegenbeleg zur Notwendigkeit; keine unbegründete Effektgröße oder universelle Pflanzenregel.'),
    dict(
        essentialDe='Bewertungsrelevanz entsteht aus konkreten Handlungsalternativen, betroffenen Anliegen und Konflikten; Sachinformationen und Werte bleiben getrennt.',
        essentialEn='Evaluation relevance arises from actual alternatives, affected concerns and conflicts; factual information remains distinct from values.',
        performanceDe='Vergleicht Vollbau/Erhalt/Randbau hinsichtlich Wohnen, Wasserrückhalt und Brutplätzen aus mindestens drei fairen Perspektiven; beschreibt Saatgutoptionen anhand Vielfalt, Nutzbarkeit, Zugang und Kosten.',
        performanceEn='Compares full building, preservation and edge development for housing, water retention and nesting from at least three fair perspectives; analyzes seed options through diversity, usefulness, access and costs.',
        transferDe='Behandelt einen neuen Brutplatzbefund als einzelne geänderte Sachprämisse und kostenlose Lagerung ohne Saatgutzugang als unterschiedliche Erhaltungs-/Teilhabeaspekte.',
        transferEn='Treats new nesting-site information as one changed factual premise and free storage without seed access as distinct conservation and participation dimensions.',
        observation='relevance-wetland nimmt keine Bauentscheidung vorweg und verlangt tatsächliche Größen/Risiken/Kosten. relevance-seed-bank unterscheidet reine Sortenzahl von Gesamturteil und Toleranztest von beliebigem Klimaereignis. Kriterienliste und Endentscheidung werden nicht mit Perspektivanalyse gleichgesetzt.'),
    dict(
        essentialDe='Deskriptive Aussagen betreffen überprüfbare Sachverhalte; normative Forderungen benötigen Wertprämissen, die nicht aus Messzahlen oder Beliebtheit allein folgen.',
        essentialEn='Descriptive statements concern testable facts; normative demands need value premises that do not follow from measurements or popularity alone.',
        performanceDe='Zerlegt die Teichforderung in 4 mg/L-Messung, bedingte Fischbelastung und Tierwohlwert; identifiziert bei Zuchtargumenten Natürlichkeit, Gesundheit und Beliebtheit als verschiedene Sach-/Wertbestandteile.',
        performanceEn='Separates the pond demand into a 4 mg/L observation, conditional fish stress and animal-welfare value; identifies naturalness, health and popularity as distinct factual and normative breeding premises.',
        transferDe='Hält Tierwohl trotz unwirksamer Belüftung fest und bewertet neue Zuchtgesundheitsdaten getrennt von fortbestehenden Wertefragen.',
        transferEn='Retains animal-welfare values despite ineffective aeration and treats new breeding-health data separately from remaining value questions.',
        observation='descriptive-pond klassifiziert auch bedingte/deskriptive S2 richtig und zieht keine zwingende Intervention aus 4 mg/L. descriptive-breeding weist die fehlenden normativen Brückenprämissen in Natürlichkeit/Beliebtheit korrekt aus; kein moralisches Wunschurteil wird als Kompetenzantwort gesetzt.'),
    dict(
        essentialDe='Dokumentierte Herkunft und Interessen steuern Prüffragen, nicht einen automatischen Wahrheitswert; wiederverwendete Daten sind keine unabhängige Bestätigung.',
        essentialEn='Documented origin and interests guide scrutiny rather than an automatic truth value; reused data are not independent corroboration.',
        performanceDe='Prüft Hersteller-/Umwelt-/Beratungsrollen im Pflanzenschutzmodell anhand Fraßschaden 30→15%, Stichprobe, Blühangebot und Nichtzielgrößen; erkennt Abhängigkeit kommunaler Fischdaten vom Betreiber.',
        performanceEn='Examines manufacturer, environmental and advisory crop-protection roles through 30→15% damage, sample size, flowering and nontarget outcomes; identifies municipal fish data dependence on the operator.',
        transferDe='Bewertet neue Förderung getrennt von besserer Kontrolle und lässt bei gemeinsamen Zähldaten verschiedene begründete Handlungsempfehlungen zu.',
        transferEn='Assesses new funding separately from improved control and allows distinct justified recommendations despite jointly collected counts.',
        observation='interests-crop-protection trennt Verkaufs-/Schutzinteresse von Datenqualität, Nichtzielwirkung und Auftrag ohne Resultat. interests-fish-passage erkennt fehlende Nacht-/Synchronkontrolle und abhängiges Zitieren. Gemeinsame Fakten heben Wertepluralität nicht auf.'),
    dict(
        essentialDe='Biologische Sichtweisen prüfen lebende Systeme und begrenzen Wirkungsbehauptungen; sie ersetzen keine normative, soziale oder rechtliche Entscheidung.',
        essentialEn='Biological perspectives investigate living systems and constrain effect claims; they do not replace normative, social or legal decisions.',
        performanceDe='Beurteilt Schatten-/Transpirations-/Habitatmöglichkeiten im Stadtbaummodell sowie Konkurrenz und Ausbreitung im Inselmodell, nennt Erhebungs- und Übertragungsgrenzen und ergänzende Perspektiven.',
        performanceEn='Assesses shade, transpiration and habitat possibilities in the urban-tree model and competition/spread in the island model, naming measurement/transfer limits and complementary perspectives.',
        transferDe='Unterscheidet verbesserte empirische Reichweite durch neue Jahresdaten von fortbestehenden Wertefragen und Nahrungsnutzung einer eingeführten Art von deren Verdrängungswirkung.',
        transferEn='Distinguishes improved empirical reach from new annual data and remaining value questions, and use of an introduced species as food from its displacement effects.',
        observation='limits-urban-forest leitet aus niedriger Oberflächentemperatur keine Jahres- oder Ausschlussentscheidung ab. limits-invasive-plant widerspricht fremd=schlecht, behält den konkreten Verdrängungsbefund und prüft Entfernungseffekte/Kosten statt Biologie pauschal abzuwerten.'),
    dict(
        essentialDe='Kriterien begründen Bewertungsziele und passende Indikatoren; biologische und außerfachliche Dimensionen sowie Überlappungen und Datenlücken müssen transparent werden.',
        essentialEn='Criteria justify evaluation objectives and suitable indicators; biological and extra-disciplinary dimensions, overlaps and data gaps must be transparent.',
        performanceDe='Operationalisiert Lebensbedingungen, Habitatqualität, Finanzierbarkeit, faire Arbeit und Zugang für Teichoptionen; ersetzt schön/biologisch/billig in der Saatgutbank durch begründete prüfbare Kriterien.',
        performanceEn='Operationalizes living conditions, habitat quality, affordability, fair work and access for pond options; replaces pretty, biological and cheap seed-bank labels with justified testable criteria.',
        transferDe='Trennt kostenlose Stromrechnung von Arbeit und Umweltwirkung und ergänzt Krankheitsrisiko im Saatguttausch ohne Vielfalt/Fairness/Finanzierung zu verdrängen.',
        transferEn='Separates a free electricity bill from labor and environmental effects and adds disease risk to seed exchange without replacing diversity, fairness or funding.',
        observation='criteria-pond-restoration behandelt Sauerstoff nicht als alleinige Tierwohlbewertung und monetarisierte Arbeit nicht doppelt. criteria-seed-access bindet Kriterien an Keimfähigkeit, Linien, Zugangsbarrieren und Kosten; keine vorgeschriebene absolute Gewichtung.'),
    dict(
        essentialDe='Begründete Entscheidungen folgen aus fair verglichenen Sachinformationen und reflektierten Werteprioritäten; ordinaler Rang und numerische Daten erzeugen kein automatisches Optimum.',
        essentialEn='Reasoned decisions follow from fairly compared facts and reflected priorities; ordinal ranks and numerical data do not produce an automatic optimum.',
        performanceDe='Vergleicht A/B/C der Feuchtwiese mit Habitat hoch/mittel/niedrig, 0/20/40 Wohnungen und 2/4/3 Budgetpunkten; begründet bedingte Gewächshausentscheidung unter Wirksamkeit, Belastung und fairer Arbeit.',
        performanceEn='Compares wet-meadow A/B/C with high/medium/low habitat, 0/20/40 homes and 2/4/3 cost points; justifies a conditional greenhouse choice through efficacy, burden and fair labor.',
        transferDe='Revidiert B, wenn dessen Habitatvorteil gegenüber C entfällt, und verwirft die Wirksamkeitsprämisse für Nützlinge bei neuen ungeeigneten Bedingungen.',
        transferEn='Revises B when its habitat advantage over C disappears and withdraws beneficial-organism efficacy premises under unsuitable new conditions.',
        observation='decision-meadow addiert keine Habitatordinalzahl zu Wohnungen und erlaubt A/C unter offengelegten Prioritäten. decision-greenhouse erklärt bedingte B-Wahl, Nichtzielunsicherheit und legale Eignung, ohne reale Anwendungs-/Sicherheitsfreigabe aus Modellkarten abzuleiten.'),
    dict(
        essentialDe='Folgen eigener und gesellschaftlicher Entscheidungen unterscheiden sich nach Zeit, Ort und Wirkungsketten; lokale Vorteile können mit entfernten oder späteren Belastungen verbunden sein.',
        essentialEn='Consequences of personal and societal decisions differ by time, place and causal chains; local benefits can connect to distant or later burdens.',
        performanceDe='Unterscheidet Garten-/Parkbeleuchtung, kurzfristige Insektenaktivität, langfristige Populationen und bedingte Strom→Emissionen→Klima-Kette; prüft Entwässerung und Lebensmittelwahl samt Lieferketten/Verlagerung.',
        performanceEn='Distinguishes garden/park lighting, short-term insect activity, long-term populations and conditional electricity→emissions→climate chain; examines drainage and food choice through supply chains and displacement.',
        transferDe='Vermindert bei emissionsarmem Strom nur die betreffende indirekte Kette und streicht bei mineralischem Boden die spezielle Torfannahme ohne alle übrigen Folgen zu negieren.',
        transferEn='Under low-emission electricity revises the relevant indirect chain only and removes the peat-specific premise for mineral soil without denying other consequences.',
        observation='consequences-park-light behauptet keinen messbaren Weltklimaeffekt einer Lampe und keine identifizierte Populationsgröße. consequences-wetland-food bindet CO2 an organischen Boden und kennzeichnet Nachfrageverlagerung als Möglichkeit; Entfernung allein entscheidet keine Lebensmittelbilanz.'),
    dict(
        essentialDe='Ethische Reflexion prüft den Bewertungsprozess selbst, einschließlich eigener Vorannahmen, gesellschaftlicher Beteiligung, Wertewahl und fairer Lastenbehandlung.',
        essentialEn='Ethical reflection examines the evaluation process itself, including personal assumptions, societal participation, selected values and fair burdens.',
        performanceDe='Rekonstruiert Wiesenberatung mit starker Kostengewichtung und fehlender Zugangsstimme; prüft Saatgutverteilung nach Ertrag hinsichtlich Garteninteresse, ausgeschlossenen Haushalten und unerkanntem Erhaltungsziel.',
        performanceEn='Reconstructs meadow deliberation with heavy cost weighting and omitted access concerns; examines yield-based seed distribution for garden interests, excluded households and unnoticed conservation goals.',
        transferDe='Lässt nach transparenter Beratung legitimen Minderheitsdissens zu und prüft auch bei reparierter Beteiligung weiter Konsistenz, Unsicherheit und Lastenverteilung.',
        transferEn='Allows legitimate minority dissent after transparent deliberation and continues checking consistency, uncertainty and burdens even after participation improves.',
        observation='ethics-meadow-process unterscheidet Datensammlung, Abstimmung, fehlende Beteiligung und verdeckte Werte; angekündigte Daten bleiben unbekannt. ethics-seed-process behauptet weder Tabelle entscheidet Werte noch Mehrheit beweist Gerechtigkeit, ohne ein einziges Verteilungsergebnis vorzuschreiben.'),
]
assert len(NOTES) == len(INPUT['goals']) == len(CASES) == len(P) == 16

results = OWN / 'results'
results.mkdir(exist_ok=True)
records = []
verdicts = []
for i, (g, cases, p, n) in enumerate(zip(INPUT['goals'], CASES, P, NOTES)):
    assert g['goalId'] == cases['goalId'] == p['goalId']
    records.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': f'{RUN_ID}.d-{i+1:02}', 'runId': RUN_ID,
        'campaignId': CAMPAIGN['campaignId'], 'roundId': CAMPAIGN['roundId'],
        'bundleFingerprint': INPUT['bundleFingerprint'], 'bookDigest': INPUT['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': {
            'essentialUnderstandingDe': n['essentialDe'], 'essentialUnderstandingEn': n['essentialEn'],
            'observablePerformanceDe': n['performanceDe'], 'observablePerformanceEn': n['performanceEn'],
            'transferExpectationDe': n['transferDe'], 'transferExpectationEn': n['transferEn']},
        'rationale': f"Vollständiger DE/EN Zieltext, ganze BY-Klausel und tatsächliche native PDF-Seite {i+3} gelesen. Beide Sprachen bewahren denselben Kompetenzkern. {n['observation']} Die bestehende kurze Kompetenzform wird erhalten; Profil/Material liefert die vollständige Leistungsoperationalisierung. Keine historische Gesamtquellen- oder menschliche Freigabe wird behauptet.",
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
    raster = next(x for x in RASTERS if x['goalId'] == g['goalId'])
    verdicts.append({
        'goalId': g['goalId'], 'goalFingerprint': g['goalFingerprint'], 'pageFingerprint': g['pageFingerprint'],
        'physicalPage': i+3, 'descriptionVerdict': 'KEEP',
        'positiveWholeProfileVerdict': 'HOLD_LOCAL_MATERIAL_FIX' if n.get('pHold') else 'KEEP_MACHINE_CANDIDATE',
        'positiveRecordStatus': 'needs_human_review', 'positiveReviewAuthority': 'ai_candidate',
        'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
        'profileFingerprint': p['profileFingerprint'], 'positiveReviewInputFingerprint': p['reviewInputFingerprint'],
        'wholeCaseIds': [c['caseId'] for c in cases['authoredCases']], 'wholeCasesReadDeAndEn': True,
        'allWholeExpectationsReadDeAndEn': True, 'observations': n['observation'],
        'minimumDemonstrationsMeaning': 'Evidence performances, including substantive transfer within one task; not a mandatory quota of task labels. The two authored full cases are a candidate case bank, not proof of any actual learner performance.',
        'visualizationVerdict': 'KEEP', 'imageSha256': raster['imageSha256'],
        'actualOriginalAnd360And680Viewed': True, 'uniqueImageNumber': raster['uniqueImageNumber'],
        'imageRoleLimit': 'A friendly motivational/support image, not complete assessment evidence for the full goal.',
        'humanApproval': False, 'humanTrial': False,
    })

batch = CAMPAIGN['batches'][0]
record_path = results / (batch['batchId'] + '.records.jsonl')
record_path.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
input_artifacts = [dict(role=a['role'], digest=a['digest']) for a in BUNDLE['artifacts']]
assert len(input_artifacts) < 20
input_artifacts.append(dict(role='description_review_batch_input_jsonl', digest=batch['batchInputFingerprint']))
manifest = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': RUN_ID, 'campaignId': CAMPAIGN['campaignId'], 'roundId': CAMPAIGN['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': INPUT['bundleFingerprint'], 'bookDigest': INPUT['bookDigest'],
    'provider': 'OpenAI Codex independent delegated reviewer', 'model': 'GPT-6 inherited session model; no separate provider invocation or model-version claim',
    'role': 'disconfirming_reviewer', 'promptFamilyId': 'biology-native-whole-description-positive-image-independent-b',
    'promptFingerprint': CAMPAIGN['promptFingerprint'], 'criteriaFingerprint': CAMPAIGN['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'Independent reviewer inherited session settings; exact sampling parameters not separately exposed').hexdigest(),
    'independenceGroupId': CAMPAIGN['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': ENTRY['goalIds'], 'inputArtifacts': input_artifacts,
    'startedAt': datetime.fromtimestamp((OWN / 'actual-neutral-declared-input-verification.json').stat().st_mtime, timezone.utc).isoformat().replace('+00:00','Z'),
    'completedAt': NOW, 'status': 'completed', 'outputDigest': digest(record_path), 'toolchainVersion': 'existing-native-description-contracts-v2',
}
write(results / (batch['batchId'] + '.run.json'), manifest)

finding_goal = next(g for g in INPUT['goals'] if g['goalId'] == 'cb218858-a468-5d3f-83e0-b60f83368af7')
finding = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-finding.schema.json',
    'schemaVersion': 1, 'findingId': RUN_ID + '.citation-c1-exact-original-spacing', 'runId': RUN_ID,
    'bundleFingerprint': INPUT['bundleFingerprint'], 'goalId': finding_goal['goalId'],
    'goalFingerprint': finding_goal['goalFingerprint'], 'pageFingerprint': finding_goal['pageFingerprint'],
    'defectLayer': 'evidence_profile',
    'anchoredObservation': 'In actual media/citation-original-model-cards.html, C1 section 2 has the original sentence Im Modell keimten 18 von 20 Samen bisTag 6. The case material and its direct German quotation instead give bis Tag 6. Both are declared to be the same original C1 text.',
    'hypothesizedMechanism': 'The separately authored physical HTML original lost one lexical space; exact quotation against the actual original is therefore inconsistent, even though the biological quantity and intended message are unchanged.',
    'violatedCriterion': 'A case that assesses correct quotations must supply an actual original consistent with the quoted words and the declared source locator.',
    'minimalCounterexample': 'A learner copies the actual C1 original faithfully as bisTag 6; the expected direct quotation contains bis Tag 6, producing competing literal originals.',
    'severity': 'medium', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'normativeTags': ['source_fidelity'],
    'counterarguments': ['The meaning, day number and 18/20 count are unaffected; the canonical goal, image and other case need no replacement.', 'Normal whitespace tolerance can be reasonable, but here bisTag combines two lexical words in the independently supplied original.'],
    'proposedLocalChange': 'Correct the actual original C1 sentence in the author HTML to bis Tag 6, retaining a new hash-bound correction receipt and original first seal. Recheck only this actual source/citation case and the dependent P binding; no full 16-goal rewrite or new PNG is needed.',
    'possibleSideEffects': ['The corrected HTML artifact has a different hash; preserve the prior sealed original and produce a targeted new artifact/receipt instead of overwriting historical first evidence.'],
    'broaderEvidenceNeeded': 'No human test is claimed; a targeted independent machine followup must actually compare the corrected original and full quotation case.',
    'findingStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
}
(OWN / 'first-findings.jsonl').write_text(json.dumps(finding, ensure_ascii=False) + '\n')
write(OWN / 'whole-sixteen.independent-b.first-verdict.json', {
    'schemaVersion': 1, 'reviewer': '/root/biology_sixteen_whole_independent_b',
    'reviewedAt': NOW, 'inputEntry': str((BASE / 'neutral-sixteen-native-independent-review.entry.json').relative_to(ROOT)),
    'inputEntrySha256': digest(BASE / 'neutral-sixteen-native-independent-review.entry.json'),
    'blindFirstVerdict': True, 'authorOrPeerJudgmentsRead': False,
    'nativePhysicalPagesActuallyViewed': list(range(1,19)), 'fullOriginalPNGUniqueCount': 11,
    'responsiveWidthsActuallyViewed': [360,680], 'targetImageBindingsActuallyChecked': 16,
    'wholeDescriptionsDeEnRead': 16, 'wholeCasesDeEnRead': 32, 'wholeSourceDutiesRetained': 76,
    'unselectedNativePagesIndependentlyComparedAndExact': 376,
    'sourceReviewScope': 'Read current original clauses and intact complete partner unions for context; retain original operative mapping decisions. No historic mapping-review restart, no new whole-source approval, no duties dropped.',
    'descriptionKeepCount': 16, 'positiveWholeProfileKeepCount': 15, 'positiveLocalMaterialHoldCount': 1,
    'visualizationKeepCount': 16, 'findingCount': 1, 'humanApproval': False, 'humanTrial': False,
    'activeWrites': 0, 'strictGainClaimed': 0, 'verdicts': verdicts,
})
freeze_files = [p for p in OWN.rglob('*') if p.is_file() and p.name != 'whole-sixteen.independent-b.first.freeze.json']
write(OWN / 'whole-sixteen.independent-b.first.freeze.json', {
    'schemaVersion': 1, 'role': 'first immutable genuinely blind whole16 independent B scientific verdict',
    'frozenAt': NOW, 'independenceGroupId': CAMPAIGN['independenceGroupId'],
    'authorOrPeerJudgmentsReadBeforeFreeze': False,
    'artifacts': [dict(path=str(p.relative_to(ROOT)), sha256=digest(p), bytes=p.stat().st_size) for p in sorted(freeze_files)],
    'activeWrites': 0, 'humanApproval': False, 'humanTrial': False, 'strictGainClaimed': 0,
})
print(json.dumps({'firstVerdictSha256': digest(OWN / 'whole-sixteen.independent-b.first-verdict.json'), 'firstFreezeSha256': digest(OWN / 'whole-sixteen.independent-b.first.freeze.json'), 'descriptionKeep':16,'positiveKeep':15,'positiveMaterialHold':1,'visualizationKeep':16,'activeWrites':0}))
