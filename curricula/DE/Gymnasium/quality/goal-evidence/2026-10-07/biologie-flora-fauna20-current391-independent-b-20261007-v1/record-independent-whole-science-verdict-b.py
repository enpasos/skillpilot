# SPDX-License-Identifier: Apache-2.0
"""Record B's actually read whole-goal science judgments and seal exact inputs.

The text judgments below are independent reviewer decisions. Hash verification
and native check results establish their input binding, not scientific validity.
"""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
D = Path(__file__).resolve().parent
A = D.parent / 'biologie-flora-fauna20-current391-author-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    return json.loads(path.read_text())


def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, value):
    with (D / name).open('x') as out:
        out.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


frozen = read(A / 'author.current-whole-text-P20-source-AM.first.freeze.json')
for item in frozen['frozenFiles']:
    assert binding(ROOT / item['path'])['sha256'] == item['sha256'], item['path']
selected = read(A / 'current20-whole-DEEN-goals.actual.json')['goals']
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
canonical = {item['id']: item for item in read(canonical_path)['goals']}
assert all(canonical[item['id']] == item for item in selected)
materials = read(A / 'materials-scope-precision-v2/twenty-whole-goals-forty-common-DEEN-cases.author-v2.json')['goals']
profiles = {item['goalId']: item for item in map(json.loads, (A / 'P20.current-text-preimage.author.review.jsonl').read_text().splitlines())}
contexts = {item['goalId']: item for item in read(D / 'current-twenty-native-contexts.independent-b.snapshot.json')['pages']}
source_path = ROOT / 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_BIOLOGIE_SEKI_G9.source-extraction.json'
source = {item['id']: item for item in read(source_path)['sourceGoals']}
mapping_path = ROOT / 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_biology_lower_secondary_source_extraction_to_canonical_biology.review.json'
mapping = {item['sourceGoalId']: item for item in read(mapping_path)['decisions']}
snapshot_path = ROOT / 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/DE_HES_S_GYM_1_BIOLOGIE.de.json.snapshot'
snapshot = {item['id']: item for item in read(snapshot_path)['goals']}
notes = [
    ('Artenvielfalt ist der eine fachliche Gegenstand; Entdeckung und Aussterben beschreiben Änderungen des Arteninventars. Kein Split nach den drei Verben erforderlich.',
     'Wiesenfall: 3 bezeichnete Arten/10 Individuen; Teichfall: 3/13. Beide Antworten trennen wissenschaftliche Neubeschreibung, persönliche Erstbeobachtung, lokales Verschwinden und globales Aussterben. Der Fossilbefund beweist keine aktuelle Extinktion. Beide Sprachfassungen und lokale Inventargrenzen stimmen.',
     '5.1, gedruckt 7–8: Vielfalt, Art-/Individuenzahlen, Entdeckung und Aussterben. Keine Freigabe sämtlicher Informationsrecherche-, Präsentations- oder Naturschutzpflichten der ganzen Einheit.',
     'Keine zusätzliche Karte: konkrete Inventare und begründete Abgrenzung zeigen das Verständnis; Namen der Modellarten sind vorgegeben.'),
    ('Eine Organbau-Funktions-Zuordnung am Säugetier; die ausgewählten Organe sind Beispiele für diese gemeinsame Zuordnungskompetenz.',
     'Hund und Maulwurf verlangen eigene Zuordnung plus Bau-Funktions-Erklärung. Muskeln erzeugen Zug, Knochen/Gelenke übertragen Bewegung; Herz pumpt, Lunge tauscht Gase, Taststrukturen vermitteln mechanische Hinweise. Die fehlerhafte Motor-/Verdauungszuordnung wird gezielt korrigiert. Keine Präparation behauptet.',
     '5.2, gedruckt 9–10: Struktur/Funktion und innerer Bau ausgewählter Säugetiere. Anatomie-/Funktionsbeispiele bleiben ohne Behauptung vollständiger Monographie oder einer Durchführung.',
     'Keine zusätzliche Karte: Organfunktionen werden am gegebenen Körpermodell erklärt und angewendet.'),
    ('Eine funktionelle Deutung der Angepasstheit; verschiedene Merkmale illustrieren denselben Lebensraumbezug.',
     'Otterfall bindet Fell-Luft-Isolation und Schwimmhaut an kühles Wasser; Robbenfall trennt Widerstand, Vortrieb und Fett-Isolation. Aussagen über absichtliche sofortige Neubildung und höhere Tiere werden sachgerecht begrenzt. Populationsvariation/Selektion sind eine begründete Entstehungsgrenze und keine erfundene individuelle Umwandlung.',
     '5.2, gedruckt 9–10: Bau/Funktion/Angepasstheit. Das historische Eisbärenhaar-Licht-/Wärmeleiter-Beispiel wird nicht als gültiges biologisches Modell weitergegeben; die eigenen Otter-/Robbenmodelle ersetzen keine ganze Lehrplaneinheit.',
     'Keine zusätzliche Karte: die Leistung ist funktionelle Erklärung unter veränderten Umweltbedingungen.'),
    ('Beobachten, operationalisierte Kategorien, zeitliches Protokoll und vorsichtige Deutung bilden gemeinsam die eine Ethogramm-Methode.',
     'Hundesequenz: Schnuppern in 2 von 6 gleichen Fenstern ist korrekt. Katzenfall verbessert unklare Gefühls-/Normalitätsetiketten durch sichtbare Handlungen und Start-/Endkriterien. Beide Antworten trennen beobachtbares Verhalten von Absicht, nennen echte schonende spätere Beobachtung/ein echtes Video und ein eigenes Protokoll als Performanzpflicht. Synthetische Reihen werden nicht als tatsächliche Beobachtung ausgegeben.',
     '5.2, gedruckt 9–10: Ethogramm, Verhaltensabgrenzung, vergleichende Beobachtung und nicht anthropomorphes Denken. Der Modellfall besteht nicht als Ersatz eines später echten Beobachtungsnachweises.',
     'Keine zusätzliche Karte: Kategorien müssen zur echten Beobachtung passen; eine auswendig gelernte Liste ersetzt die Methode nicht.'),
    ('Eine Beschreibung historischer Populationsentwicklung durch Domestikation/Zucht; Abstammung und Zucht sind zusammenhängende Aspekte dieses Prozesses.',
     'Wolfsvorfahren-/Hundelinienfälle trennen individuelle Erziehung von vererbbarer Variation und Auswahl über Generationen. Gemeinsame Vorfahren, weitere Rassezucht, Umwelt-/Trainingsbeiträge und die fehlende evolutionäre Größenskala sind konsistent in DE/EN. Keine heutige Einzelwolf-zu-Hund-Umwandlung wird behauptet.',
     '5.2, gedruckt 9–10: Hundeabstammung, Zuchtziele und Domestikationsmerkmale. Kein unbelegter molekularer Stammbaum oder universeller Zucht-/Gesundheitserfolg.',
     'Keine zusätzliche Karte: Entwicklungszusammenhänge werden beschrieben und an einem Fehlmodell geprüft.'),
    ('Bedingungen und zeitlicher Ablauf derselben Keimlingsentwicklung bilden einen zusammenhängenden Beobachtungsgegenstand.',
     'Feucht/trocken variiert Wasser bei gleicher geeigneter Temperatur/Luft; Warm/kühl variiert den zeitlichen Verlauf. Keimwurzel vor Spross/Blättern, Reserven für frühe Entwicklung und spätere Licht-/CO2-Bedingungen sind stimmig. Synthetische 8/10 bzw. 0/10 und 2/4/7 cm bleiben Modellzahlen. Beide Fälle verlangen echte spätere wiederholte Beobachtung mit Zeitpunkten und gleichen Definitionen; keine allgemeine Lichtkeimregel.',
     '5.4, gedruckt 12: Keimungs-/Wachstumsbedingungen und Keimlingsuntersuchung. Angeleitete reale Beobachtung/Messung bleibt getrennt von den Modellmaterialien; keine Freigabe sämtlicher Methoden der Einheit.',
     'Keine zusätzliche Karte: eigene Entwicklungsbeobachtung und bedingte Erklärung sind führend.'),
    ('Eine integrierte Organbau-Funktions-Erklärung am Blütenpflanzenkörper; Wurzel, Spross und Blatt werden über Versorgung und Stofftransport verbunden.',
     'Bohne und Speicherwurzel verbinden Aufnahme/Verankerung, Leitung/Stütze, Blattflächen/Spaltöffnungen, Fotosynthese und Transpiration. Organische Stoffe werden nicht als fertige Bodennahrung behandelt; Blatt-zu-Speicherwurzel-Transport widerlegt den ausschließlichen Aufwärtspfeil. Die Fotosynthese-Wortbeziehung CO2/Wasser/Licht zu organischen Stoffen/O2 ist enthalten. Keine globale ausschließliche Transportrichtung.',
     '5.4, gedruckt 12: Organbau, Wasser-/Mineralsalzaufnahme, Wassertransport/Transpiration, Fotosynthese und Assimilattransport. Die beiden Fälle decken den gebundenen Bau-/Funktionskern ab.',
     'Keine zusätzliche Karte: Organzusammenhang und Quellen-/Senken-Anwendung bleiben Verständnisleistung.'),
    ('Eine funktionelle Zuordnung der Blütenbestandteile im Fortpflanzungsprozess; Benennung und Erklärung gehören hier zum selben Gegenstand.',
     'Kirschblüte und Windbestäubungsmodell trennen Pollenaufnahme/Bestäubung von Gametenverschmelzung/Befruchtung. Kelch/Krone, Staubbeutel, Narbe/Griffel/Fruchtknoten/Samenanlage sind funktionell richtig; Samenanlage zu Samen und Fruchtknoten zu Frucht sind für die gewählten Modelle zutreffend. Keine Pflicht zu bunten Kronblättern oder Pollen-als-Frucht-Behauptung.',
     '5.4, gedruckt 12: Blütenbestandteile, Bestäubung, Befruchtung, Samen-/Fruchtbildung. Die Modelle behaupten nicht die Freigabe aller angrenzenden Coevolutions- oder Untersuchungsmethoden.',
     'Bestehende memory_required-Entscheidung beibehalten: genau drei Blütenkarten 008/009/010 sichern kompakte Bestandteile/Funktionen. Pollenaufnahme, Befruchtung, Transport und Samen-/Fruchtbildung bleiben eigenständige Erklärleistung außerhalb der Karten.'),
    ('Eine begrenzte Pflanzenbestimmung mit Einordnung von Wildvorkommen und Nutzungsrolle; es wird kein unabhängiges Artenlexikon gefordert.',
     'Der vorgegebene Dreiersatz Gänseblümchen/Klee/Bohne und die Blatt-Tabelle Eiche/Linde/Esche sind ausdrücklich begrenzt. Merkmale werden begründet genutzt; Nutzung und Abstammung/Vorkommen werden nicht verwechselt. Dieselbe Art kann wild wachsen und genutzt werden. Die Antwort fordert bei ähnlichen Arten weitere Merkmale und leitet weder universelle Identität noch Essbarkeit ab.',
     '5.4, gedruckt 12: Wild-/Nutzpflanzen und einfache Bestimmungsübungen. Keine Behauptung eines tatsächlich erfolgten Unterrichtsgangs, Herbariums oder vollständigen binären Nomenklaturnachweises.',
     'Keine zusätzliche Karte: vorgegebene Bestimmungshilfen und Merkmalsanwendung sind die Leistung, nicht zusätzliche auswendig gelernte Namen.'),
    ('Eine Bau-/Funktionsdeutung von Lebensraumanpassung; die gemeinsame Serie wählt Vogelvertiefung, nicht zwei unabhängig verpflichtende Vertiefungen.',
     'Fliegender Vogel mit kurzem Fischvergleich und Ente/Laufvogel sind zwei sachhaltig verschiedene Vogel-Kontexte. Flugkräfte, Schwimmhautfläche, Isolation und Laufgliedmaßen sind bedingt erklärt. Nicht jeder Vogel fliegt oder schwimmt; die Quelle erzeugt keine zielgerichtete individuelle Merkmalsneubildung. Der zusätzliche vollständige Fischfall ist ausdrücklich nur Alternative bei anderer Quellenwahl.',
     '6.2, gedruckt 14: Vögel ODER Fische vertieft, die andere Klasse nur kurz vergleichend. Keine universelle duale Vertiefung aus beiden Modellfällen ableiten.',
     'Keine zusätzliche Karte: funktionelle Deutung an geändertem Medium/Bewegungsmodus.'),
    ('Eine Strategie-Vergleichskompetenz; Revier, Balz/Paarung und Brutpflege sind zusammenhängende Fortpflanzungsaspekte, keine separate Verfahrensliste.',
     'Die zwei Vogel-Fälle vergleichen Revier-/Balzformen, Nestverteidigung und Pflege-/Nachkommeninvestition. Der Koloniefall widerlegt fehlende Nestpflege oder jede räumliche Verteidigung. Ohne Erfolgs-/Umweltdaten wird keine beste Strategie aus Eizahl abgeleitet. Der vollständige Fischfall bleibt nur konditionale alternative Quellenwahl; Laichen wird nicht automatisch mit Vogel-Paarung gleichgesetzt.',
     '6.2, gedruckt 14: Revier, Balz, Paarung und Brutpflege innerhalb der gewählten Vogel-ODER-Fisch-Vertiefung. Kein zusätzlicher universeller dualer Pflichtvergleich.',
     'Keine zusätzliche Karte: die Leistung ist bedingter Strategievergleich, kein Recall einer allgemeinen Rangliste.'),
    ('Eine funktionelle Erklärung der Vogel-Flug-/Gefiederkonstruktion; Knochenbau und Feder sind zusammenhängende Stütz-/Flächenelemente.',
     'Verstrebte/verbundene Knochen und geordnete Fahne werden als tragfähiger leichter Bau erklärt, ohne alle Knochen zu hohlen schwachen Röhren zu erklären. Der beschädigte Fahnen-/Nichtfliegervergleich zeigt veränderte Flächenfunktion und Isolation/Schutz; Federn allein beweisen keinen Flug. DE/EN enthalten dieselben Grenzen und keine Behauptung identischer Vogel-Skelette.',
     '6.2, gedruckt 14, Vogelwahl: Leichtbau und Federbau/-funktion. Dieser fachliche PASS ist bedingt auf das Vogelziel und erklärt die Vogelwahl nicht zur zusätzlichen Pflicht neben Fischvertiefung.',
     'Keine zusätzliche Karte: Tragfähigkeit, Fläche, Isolation und Gegenvergleich sind Verständnisleistung.'),
    ('Eine funktionelle Beschreibung des Fisch-Bauplans im Wasser; Widerstand, Gasaustausch und Auftrieb werden als Funktionen des gemeinsamen Körpers getrennt.',
     'Der typische Knochenfischfall trennt Wasserfluss/Kiemen von gasgefüllter Schwimmblase und Körperform. Der zweite Fall verändert ausdrücklich Gasvolumen bei gleicher Masse sowie stumpfe/stromlinienförmige Modellform. Auftrieb und Gasaustausch bleiben getrennt; keine universal vorhandene Schwimmblase, keine ausschließliche Atemfunktion und kein exakter universeller Tauchmechanismus.',
     '6.2, gedruckt 14, Fischwahl: Stromlinienform, Kiemen und Schwimmblase. Dieser fachliche PASS ist bedingt auf das Fischziel und erklärt die Fischwahl nicht zur zusätzlichen Pflicht neben Vogelvertiefung.',
     'Keine zusätzliche Karte: die drei Funktionen werden am Modell zugeordnet, gegeneinander abgegrenzt und unter Änderungen beschrieben.'),
    ('Eine vergleichende Beschreibung der Reptilienentwicklung; Vogelentwicklung dient dem gebundenen Vergleich derselben embryonalen Grundstrukturen.',
     'Eidechsen-/Hühnerei und fehlerhaftes Larven-/Erwachsenenschema trennen innere Befruchtung, geschützte Dotterentwicklung, Schlupf und späteres Wachstum. Keine Kaulquappenphase oder sofortige Erwachsenheit wird für die vorgegebenen Amnioten behauptet. Lebendgebärende Reptilien und variable Hüllen-/Pflegebedingungen begrenzen universelle Eierregeln.',
     '6.3, gedruckt 15: Reptilienentwicklung im Vergleich zur Vogelentwicklung. Kein eigener Entwicklungsversuch oder vollständiger Reptilienstammbaum behauptet.',
     'Keine zusätzliche Karte: Entwicklungsfolge und begründeter Vergleich sind führend.'),
    ('Eine Beschreibung bedingter thermoregulatorischer Verhaltensstrategien eines wechselwarmen Tieres.',
     'Sonnenbaden/Ortswechsel/Körperhaltung werden in Tageslauf und gleichmäßig kaltem Landschaftsfall bedingt beschrieben. Schatten reduziert Wärmebelastung; bei durchgehend kalten Plätzen erzeugt Bewegung keine fehlende Umgebungswärme. Wechselwarm heißt nicht immer kalt. Weder Willenskraft noch universelles Wasserkühlen oder ein beliebig einstellbarer Heizregler werden behauptet.',
     '6.3, gedruckt 15: Verhaltensregulation mit Umwelt-/Aktivitätsgrenzen. Keine universelle artspezifische Temperatur oder Reptilien-Haltungsanleitung.',
     'Keine zusätzliche Karte: Optionen werden aus Bedingungen begründet ausgewählt.'),
    ('Eine Erklärung eines besonderen Sinnesorgans mit seinem Beitrag neben Augeninformation.',
     'Klapperschlangen-Grubenorgan, Strahlungs-/Membranwärme und sensorische Signale sind fachlich stimmig. Licht-/Wärmehintergrundfälle unterscheiden sichtbare Form/Bewegung von thermischem Kontrast. Beide Antworten begrenzen Kamera-/Gedanken-/Blutsicht-Behauptungen und verallgemeinern das Organ nicht auf alle Schlangen. Die radiative Wärmeaufnahme ist zusätzlich im tatsächlich zugänglichen Abstract der Primärarbeit Gracheva et al. 2010 geprüft.',
     '6.3, gedruckt 15: Leistung des Wärmesinnesorgans und Zusammenarbeit mit dem Auge. Keine zusätzliche universelle Kontrastschwelle oder neurologische Detailpflicht.',
     'Keine zusätzliche Karte: Signalbeiträge und Grenzen werden an veränderten Bedingungen erläutert.'),
    ('Eine bedingte Erklärung zweier Atemwege für dieselbe Sauerstoffversorgung des Amphibienkörpers.',
     'Dünne feuchte durchblutete Haut, belüftete Lungen, Stoffgefälle und Mundbodenpumpe sind richtig verknüpft. Ufer-/Unterwasser-/Austrocknungsfälle unterscheiden Ventilation, Perfusion und Bedarf. Kein unbeschränkter Luftstrom unter Wasser, keine unbegrenzte Tauchzeit, keine ausschließlich äußeren Kiemen des erwachsenen Froschs und kein belastender Schulversuch.',
     '6.4, gedruckt 16: Haut-/Lungenatmung des Froschs und Regulationsmöglichkeiten. Die Fälle bleiben ausdrücklich hypothetisch und sind keine tatsächliche Tierexposition.',
     'Keine zusätzliche Karte: Bau, Gefälle und bedingte Beiträge müssen erklärt werden.'),
    ('Eine aus vorgelegten Ergebnisvergleichen erklärte hormonelle Steuerung desselben Metamorphoseprozesses.',
     'Reduktion/Wiederherstellung und frühes verstärktes Schilddrüsenhormonsignal sind zwei veränderte Vergleichslogiken. Gliedmaßen-/Schwanz-/Atemumbau und Stadienzeit werden richtig interpretiert. Hormone vermitteln Signale statt Bein-Baumaterial. Kontrolle/Gleichhaltung begrenzen alternative Erklärungen, beweisen keine alleinige Steuerung jedes Details und keine immer bessere Entwicklung. Kein eigener Hormoneingriff an Tieren verlangt.',
     '6.4, gedruckt 16: hormonelle Steuerung und Interpretation vorgelegter Versuchsergebnisse. Die Quelle verlangt hier Interpretation; eigene synthetische Vergleichsmaterialien behaupten keine reale Durchführung.',
     'Keine zusätzliche Karte: Ergebnisinterpretation und Signal-/Materialabgrenzung sind führend.'),
    ('Eine Strategie-Vergleichskompetenz bezüglich Eizahl, Pflegeform und Investition bei Amphibien.',
     'Freie Eier versus Tragen/Schutz und Bewachung versus wenig Pflege bilden echte Kontrastfälle. 20*0,5=10 gegenüber 400*0,05=20 ist korrekt; höherer Anteil je Ei erzwingt keine höhere Gesamtzahl. Erwartungswerte bleiben hypothetisch, nicht tatsächliche Messungen oder sichere Einzelgelegeprognosen. Umweltgefahren und Kosten verhindern eine universelle beste Strategie.',
     '6.4, gedruckt 16: Eizahl und Brutpflegeintensität. Keine optionalen Gefährdungsrecherche- oder Säugetiervergleichspflichten als abgeschlossen behauptet.',
     'Keine zusätzliche Karte: bedingte Zahlen-/Pflegeinterpretation verhindert eine auswendig gelernte universelle Rangregel.'),
    ('Eine verantwortliche Anwendung artspezifischer Physiologie-/Verhaltensanforderungen auf einen Haltungsfall.',
     'Kaninchenpläne prüfen Ernährung/Wasser, Raum, soziale Bedürfnisse, Rückzug und Betreuung. Der Hamstertransfer verhindert pauschale Übertragung von Sozialhaltung und tagaktiven Spielwünschen. Recherche/Betreuungsplanung sind konkret; keine zertifizierten Größen, individuelle tiermedizinische Diagnose oder universelle Tierliste behauptet. DE/EN stimmen in Anwendung und Grenzen überein.',
     '6.5, gedruckt 17: Physiologie und Verhalten als Grundlage, verantwortliche konkrete Anwendung und Haltungsvergleich. Keine tatsächliche Tieranschaffung oder rechtliche/tiermedizinische Freigabe.',
     'Keine zusätzliche Karte: artspezifische Recherche und begründete Anwendung ersetzen eine starre Recall-Liste.'),
]
assert len(notes) == len(selected) == len(materials) == len(profiles) == 20
records = []
for ordinal, (goal, material, note) in enumerate(zip(selected, materials, notes), 1):
    gid = goal['id']
    profile = profiles[gid]
    sid = goal['extendedData']['provenance']['sourceGoalId']
    assert material['goalId'] == gid and material['wholeGoal'] == goal
    assert source[sid]['description'] == snapshot[sid]['description'] == goal['description']
    assert mapping[sid]['canonicalGoalIds'] == [gid] and mapping[sid]['decision'] == 'mapped'
    assert profile['status'] == 'needs_human_review' and profile['reviewAuthority'] == 'ai_candidate'
    assert profile['evidenceLevel'] == 'E1' and profile['maximumClaimScope'] == 'G1'
    assert len(material['cases']) == len(profile['profile']['applicationCaseBriefs']) == 2
    for case, brief in zip(material['cases'], profile['profile']['applicationCaseBriefs']):
        assert case['id'] == brief['id']
        for language, suffix in [('de', 'De'), ('en', 'En')]:
            assert brief['taskDemand' + suffix] == case['material'][language] + ' ' + case['task'][language]
            assert brief['expectedPerformance' + suffix] == case['modelAnswer'][language]
    records.append({
        'ordinal': ordinal,
        'goalId': gid,
        'title': goal['title'],
        'reviewer': 'Codex independent reviewer B /root/flora_fauna_independent_b',
        'scopeVerdict': 'PASS_WHOLE_SCIENCE_FIRST_PREIMAGE',
        'wholeDescriptionLanguagesActuallyRead': ['de', 'en'],
        'wholeCommonApplicationCaseIdsActuallyRead': [case['id'] for case in material['cases']],
        'wholeTaskAnswerExpectationVariationActuallyRead': True,
        'goalFingerprint': profile['goalFingerprint'],
        'positiveReviewInputFingerprint': profile['reviewInputFingerprint'],
        'positiveProfileFingerprint': profile['profileFingerprint'],
        'currentNativePreimagePageFingerprint': contexts[gid]['pageFingerprint'],
        'sourceGoalId': sid,
        'structuredSourceSpan': source[sid]['sourceSpan'],
        'atomicityScopeJudgment': note[0],
        'substantiveTaskAnswerProfileJudgment': note[1],
        'originalWholePrimarySourceBoundaryJudgment': note[2],
        'retainedMemorySuitabilityJudgment': note[3],
        'canonicalTextChangesRequested': False,
        'scienceFindings': [],
        'finalNativeDCompleted': False,
        'finalVCompleted': False,
        'humanApproval': False,
    })
write('twenty-whole-science-first-goal-verdicts.independent-b.actual.json', {
    'artifactKind': 'twenty-whole-current-goal-independent-b-science-first-verdicts',
    'recordedAt': NOW,
    'reviewRole': 'independent reviewer B, not material author or reviewer A',
    'reviewerAResultsReadBeforeThisSeal': False,
    'authority': 'ai_candidate',
    'status': 'needs_human_review',
    'wholeGoalCount': 20,
    'wholeCommonBilingualCasesActuallyRead': 40,
    'wholeConditionalFishAlternativesActuallyRead': 2,
    'records': records,
    'scientificCorrectionFindings': [],
    'finalIntegrationReady': False,
    'strictClosuresClaimed': 0,
    'humanApproval': False,
    'humanTrial': False,
})
write('source-choice-and-performance-boundaries.independent-b.actual.json', {
    'artifactKind': 'independent-b-original-source-choice-and-performance-boundaries',
    'recordedAt': NOW,
    'officialUrl': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf',
    'actualEntirePrintedPagesRead': [7, 8, 9, 10, 12, 14, 15, 16, 17],
    'rawSourceLocalOnly': True,
    'fullOfficialSourceRepublished': False,
    'choiceBoundary': {
        'sourceSection': '6.2 printed14',
        'actualSourceMeaning': 'Bird OR fish is treated in depth; the other class may be compared briefly.',
        'commonGeneralAdaptationAndReproductionCases': 'Both common cases choose bird depth. Two complete fish alternatives remain explicitly conditional and are not common mandatory expectations.',
        'specializedBirdGoalId': '8e1300bb-14a1-5155-884a-144c88f1c04b',
        'specializedFishGoalId': '8a56672b-b662-5bcd-9f43-8ffc4abc4f01',
        'actualCurrentAtlas': 'Both specialized goals currently occur as target in the HE/SekI/G9 tuple. Atlas inclusion alone cannot prove universal mandatory depth in both.',
        'reviewScope': 'The scientific verdict is valid for each specialized competence under its chosen depth; it does not grant a dual-depth source-duty or final native-context approval.',
        'finalIntegrationRequirement': 'Keep the original choice explicit in the final source/context review and do not count universal simultaneous-depth coverage from these candidate cases.',
        'activeProjectionChangeAuthorizedOrPerformedByReviewerB': False,
    },
    'genuinePerformanceRequired': {
        '9263ee6c-bf62-531c-bb09-78a4a51b8ed7': 'Actual nonintrusive animal observation or genuine suitable video, own timed ethogram and cautious interpretation; neither synthetic sequence is actual observation evidence.',
        '19f806d2-d4e3-5ad4-98a8-1d61bdd81e3d': 'Guided observations of actual seeds over time with recorded genuine data and conditions; synthetic lengths/counts cannot be personal measurements.',
        '66967754-3934-58b3-b79e-d0f867dae070': 'Interpret supplied results as the source requires; no actual learner animal-hormone intervention required or claimed.',
    },
    'secondaryPrimaryScienceCheck': {
        'goalId': '6faa6c23-00c9-5758-bd98-01825692abb2',
        'title': 'Molecular basis of infrared detection by snakes',
        'authors': 'Gracheva et al.',
        'doi': '10.1038/nature08943',
        'url': 'https://www.nature.com/articles/nature08943',
        'actuallyRead': 'Accessible original research abstract and figure1 label; infrared signals transduced through radiant heating of the pit organ rather than retinal photochemical detection.',
        'accessLimit': 'Full article subscription content not claimed read; PMC browser fetch showed a captcha.',
    },
    'humanApproval': False,
    'strictClosuresClaimed': 0,
})
write('independent-b-scope-and-checks.receipt.json', {
    'artifactKind': 'independent-b-whole-science-first-review-scope-and-actual-checks',
    'recordedAt': NOW,
    'result': 'PASS20 whole science-first preimages; final native D/P/V/image bindings remain open',
    'wholeGoalCount': 20,
    'commonWholeBilingualCaseCount': 40,
    'conditionalWholeFishCaseCount': 2,
    'firstIndependentVerdictWithoutReviewerA': True,
    'frozenAuthorFilesVerified': len(frozen['frozenFiles']),
    'exactCurrentWholeGoalObjectsVerified': 20,
    'exactWholeCaseToPositiveProfileFidelityVerified': 40,
    'newSubstantiveScientificClosuresClaimed': 0,
    'restoredBindingsClaimed': 0,
    'nativeChecksActuallyExecuted': [
        {'command': 'npm --prefix app run quality:positive-goal-evidence:check -- --config=<author>/P20.current-text-preimage.author.config.json', 'exitCode': 0, 'summary': '20 configured, 20 needs_human_review, 0 approved, 0 blockers', 'stdoutPath': str((D/'checks/positive-P20.stdout.actual.txt').relative_to(ROOT))},
        {'command': 'npm --prefix app run quality:semantic-atomicity:check -- --config=<author>/A20.current.native.config.json', 'exitCode': 0, 'summary': '20 current atomic, 0 stale/missing/non-atomic/developer review', 'stdoutPath': str((D/'checks/A20.stdout.actual.txt').relative_to(ROOT))},
        {'command': 'npm --prefix app run quality:memory-card-review:check -- --config=<author>/M20.current-flower-deck-closure.native.config.json', 'exitCode': 0, 'summary': '27 ordinary origin goals, 1 existing memory node, 17 whole shared-deck cards kept, 8 visibility scopes, 33 required-goal view checks, 0 missing visible memory node', 'stdoutPath': str((D/'checks/M20.stdout.actual.txt').relative_to(ROOT))},
        {'command': 'app/node_modules/.bin/tsx <this dossier>/check-current-contexts.independent-b.mts', 'exitCode': 0, 'summary': '20 selected exact current whole preimage pages; 391 current atlas entries; 32 actual source/context files bound; no PDF build', 'stdoutPath': str((D/'checks/context.stdout.actual.txt').relative_to(ROOT))},
    ],
    'preservedMistakenCommand': {'command': 'quality:goal-evidence:check (historical V1 checker)', 'exitCode': 1, 'reason': 'Rejected the valid V2 config because the wrong historical checker was invoked; followed by the actual current positiveGoalEvidenceReview.ts V2 command above. No input or validator was changed.', 'stdoutPath': str((D/'checks/P20.stdout.actual.txt').relative_to(ROOT)), 'stderrPath': str((D/'checks/P20.stderr.actual.txt').relative_to(ROOT))},
    'currentFlowerMemory': {'existingCardIds': ['biology_core_008', 'biology_core_009', 'biology_core_010'], 'existingMemoryGoalId': '9e51741b-f952-5f62-9b6b-080eee6c5590', 'wholeDEENCardsActuallyRead': True, 'suitability': 'Compact flower parts and functions retained; process explanation and application remain ordinary goal performance.', 'wholeSharedDeckDependencyTracesNativeVerified': 17, 'newCardsOrDecks': 0},
    'pending': [
        'Actual twenty final raster images, provenance and actual full/360/680 inspection',
        'Two independent native D campaigns over final current whole pages and final source/context/image bindings',
        'Independent V review and final book rendering',
        'Targeted positive evidence input rebinding/recheck after images with E1/G1, ai_candidate, needs_human_review unchanged',
        'Root guarded registry integration, central strict report and protected floor checks',
    ],
    'activeCanonicalRegistryLedgerWrites': 0,
    'humanApproval': False,
    'humanTrial': False,
})
outputs = [binding(path) for path in sorted(D.rglob('*')) if path.is_file()]
inputs = list(frozen['frozenFiles']) + [binding(A/'author.current-whole-text-P20-source-AM.first.freeze.json')] + read(D/'current-input-bindings.independent-b.actual.json')['files']
write('first-independent-b-verdict.exact-input-output.freeze.json', {
    'artifactKind': 'first-actual-independent-b-whole-science-first-verdict-seal',
    'recordedAt': NOW,
    'reviewer': '/root/flora_fauna_independent_b',
    'reviewerAReadBeforeFirstSeal': False,
    'inputs': inputs,
    'outputs': outputs,
    'scienceWholeGoalPassCount': 20,
    'scienceCorrectionFindingCount': 0,
    'strictClosuresClaimed': 0,
    'humanApproval': False,
})
print(json.dumps({'sealedWholeScientificReviews': 20, 'commonBilingualCases': 40, 'conditionalFishCases': 2, 'scienceCorrectionFindings': 0, 'nativeFinalDComplete': False, 'nativeFinalVComplete': False, 'strictGrowth': 0, 'outputDirectory': str(D.relative_to(ROOT))}))
