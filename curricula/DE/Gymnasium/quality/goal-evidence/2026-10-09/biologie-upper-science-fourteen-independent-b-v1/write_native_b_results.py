import json
import hashlib
import pathlib
import datetime
import jsonschema

BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OWN = BASE / 'biologie-upper-science-fourteen-independent-b-v1'
AUTHOR = BASE / 'biologie-upper-science-fourteen-whole-author-v1'
NATIVE = AUTHOR / 'native-preparation-v1'
ENTRY = NATIVE / 'neutral-fourteen-native-independent-review.entry.json'
OUT = OWN / 'native-fourteen-v1'
OUT.mkdir(exist_ok=True)

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def binding(p):
    p = pathlib.Path(p)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, data):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return binding(p)

entry = read(ENTRY)
campaign_entry = next(c for c in entry['campaigns'] if c['side'] == 'b')
campaign = read(campaign_entry['campaignPath'])
review = read(campaign_entry['inputPath'])
batch = campaign['batches'][0]
schema_path = pathlib.Path(campaign_entry['campaignPath']).parent / 'contracts/goal-description-review-record.schema.json'
assert binding(schema_path)['sha256'] == campaign['recordSchemaDigest']
schema = read(schema_path)
run_id = campaign['roundId'] + '.batch-001.independent-b-native-review'

# These are independently formulated content judgments, not author profile prose.
# Each six-field chain covers the complete current operator and a changed case.
CHAINS = [
    (
        'Biologisches Wissen verbindet prüfbare empirische Befunde mit theoriegeleiteten Erklärungen; kontrollierte Bedingungen, Wiederholbarkeit und begrenzte Reichweite bestimmen die Tragfähigkeit eines Schlusses.',
        'Biological knowledge connects testable empirical findings with theory-guided explanations; controlled conditions, reproducibility and bounded scope determine the strength of a conclusion.',
        'Die lernende Person trennt in Hefe- und Vogelparkfällen Beobachtung, theoretische Deutung und unbelegte Kausalbehauptung und begründet anhand konkreter Kontrollen und Störgrößen, was die Befunde tragen.',
        'The learner distinguishes observation, theoretical interpretation and unsupported causal claims in yeast and bird-park cases, using concrete controls and confounders to justify what the findings support.',
        'Bei einer neuen widersprechenden Wiederholung oder veränderter Parkstruktur revidiert die lernende Person die Reichweite der Erklärung und begründet weitere Daten, statt Evidenz durch bloße Zustimmung zu ersetzen.',
        'For a conflicting replication or changed park structure, the learner revises the explanatory scope and justifies further evidence instead of replacing evidence with agreement.',
        'Der knappe DE/EN-Text erhält Evidenz- und Theorieorientierung sowie Bedingungen biologischer Erkenntnis. Die zwei heterogenen Fälle konkretisieren Reflexion, ohne Wissenschaftsverständnis auf bloße Statistik oder Meinung zu reduzieren.'
    ),
    (
        'Basiskonzepte verbinden biologische Struktur, Funktion, Stoff- und Energiebeziehungen; eine fachübergreifende Beschreibung erklärt konkrete Mechanismen und deren Bedingungen.',
        'Basic concepts connect biological structure, function, matter and energy relationships; an interdisciplinary account explains concrete mechanisms and their conditions.',
        'Die lernende Person beschreibt und erklärt Stomata, Wasserverlust und CO₂-Aufnahme sowie Lactasewirkung und Immobilisierung, strukturiert die Beziehungen mit Basiskonzepten und bindet Diffusion beziehungsweise Hydrolyse sachgerecht ein.',
        'The learner describes and explains stomata, water loss and CO₂ uptake, and lactase action and immobilization, organizes the relationships with basic concepts and correctly incorporates diffusion or hydrolysis.',
        'Bei geänderter Cuticula oder Transportbegrenzung eines Enzymträgers begründet die lernende Person, welche Struktur-Funktions-Beziehung erhalten bleibt und weshalb eine andere Wirkung entsteht.',
        'For a changed cuticle or transport limitation in an enzyme support, the learner explains which structure-function relationship persists and why the effect changes.',
        'Beschreiben, Erläutern, Strukturieren und fachübergreifendes Einbinden bilden eine zusammenhängende Erschließungsleistung. Quellen und Fälle erweitern das Ziel nicht zu einem vollständigen Enzym- oder Pflanzenphysiologiekurs.'
    ),
    (
        'Eine biologische Hypothese verbindet eine theoriegeleitete Erklärung mit einer unter genannten Bedingungen beobachtbaren Vorhersage; Befund und Hypothese bleiben unterscheidbar.',
        'A biological hypothesis connects a theory-guided explanation with an observable prediction under stated conditions; findings and hypotheses remain distinct.',
        'Die lernende Person formuliert aus Fotosynthese-/Atmungsbeziehungen oder Wasserpotenzial eine begründete Hypothese und eine prüfbare Aussage mit Messgröße, Bedingung und möglichem Gegenbefund.',
        'The learner formulates a justified hypothesis from photosynthesis/respiration or water potential and a testable statement with a measured variable, condition and possible counterfinding.',
        'Bei verändertem Gaswechsel oder einer membrangängigen gelösten Substanz passt die lernende Person die Vorhersage an die Theoriebedingungen an und erklärt, wie sie geprüft werden kann.',
        'With changed gas exchange or a membrane-permeant solute, the learner adapts the prediction to the theoretical conditions and explains how to test it.',
        'Das Formulieren theoriegeleiteter Hypothesen bleibt vom nachfolgenden Entwickeln einer konkreten Frage und vom Planen/Durchführen getrennt. Die EN-Fassung erhält Theoriebindung und Prüfbarkeit vollständig.'
    ),
    (
        'Lebende Systeme haben verknüpfte Ebenen von Molekülen bis zur Biosphäre; qualitative Mechanismen und quantitative Größen müssen mit Ebene, Einheit und Skalierungsannahmen zusammenpassen.',
        'Living systems have linked levels from molecules to the biosphere; qualitative mechanisms and quantitative quantities must match the level, unit and scaling assumptions.',
        'Die lernende Person verknüpft molekulare Kohlenstoffprozesse mit Blatt, Organismus und Wald und rechnet begrenzte Raten beziehungsweise Fraßmengen korrekt hoch, ohne Stofffluss mit Vorrat oder Stichprobe mit Population gleichzusetzen.',
        'The learner connects molecular carbon processes to leaf, organism and forest and scales bounded rates or herbivory quantities correctly without equating flux with stock or a sample with a population.',
        'Bei anderer Messdauer, Blattzahl oder Populationszusammensetzung erklärt und berechnet die lernende Person, welche Ebenenbeziehung noch gilt und welche zusätzliche Daten benötigt.',
        'For changed measurement duration, leaf number or population composition, the learner explains and calculates which cross-level relationship still holds and which needs additional data.',
        'Qualitativ, quantitativ und Molekular- bis Biosphärenebene bleiben ausdrücklich erhalten. BY13-GA wird aus einer ähnlichen Hypothesenzeile nicht als Quelle für diese Ebenenkompetenz erfunden.'
    ),
    (
        'Biologische Prozesse verbinden Vorgänge innerhalb eines Organismus, Beziehungen zwischen Organismen und Stoff-/Energieaustausch mit der Umwelt; Stoffrückführung und gerichteter Energiefluss sind verschieden.',
        'Biological processes connect events within an organism, relationships between organisms and matter/energy exchange with the environment; matter recycling and directed energy flow differ.',
        'Die lernende Person erläutert im Bestäubungs- und Teichfall konkrete interne Vorgänge, Organismenbeziehungen und Umweltbedingungen und verfolgt Stoffe und Energie, ohne Bestäubung mit Befruchtung oder Energie mit einem geschlossenen Kreislauf gleichzusetzen.',
        'The learner explains internal events, organism relationships and environmental conditions in pollination and pond cases and traces matter and energy without equating pollination with fertilization or energy with a closed cycle.',
        'Bei ausfallendem Bestäuber oder veränderter nächtlicher Sauerstoffbilanz begründet die lernende Person Folgen über die passenden Systemgrenzen und nennt Bedingungen der Erklärung.',
        'For loss of a pollinator or a changed nighttime oxygen balance, the learner explains effects across the relevant system boundaries and states the conditions of the explanation.',
        'Die kurze Beschreibung wahrt alle drei Systembezüge. Der neu tatsächlich geprüfte Laub-zu-Zersetzer-Pfeil widerspricht der Prozessrichtung nicht mehr; das Bild ersetzt die selbst erzeugte Erklärung nicht.'
    ),
    (
        'Eine Beobachtung legt eine biologische Fragestellung nahe; eine theoriegeleitete Hypothese beantwortet diese vorläufig durch einen Mechanismus mit prüfbarer Vorhersage, ohne unbeobachtete Ursachen als Befund auszugeben.',
        'An observation suggests a biological question; a theory-guided hypothesis provisionally answers it through a mechanism with a testable prediction without presenting unobserved causes as findings.',
        'Die lernende Person identifiziert und entwickelt aus Keimunterschieden oder gelben Blättern eine konkrete Frage und begründet eine Hypothese mit Wasser-/Sauerstoff- beziehungsweise Licht-/Mineralbeziehungen.',
        'The learner identifies and develops a concrete question from germination differences or yellow leaves and justifies a hypothesis through water/oxygen or light/mineral relationships.',
        'Bei einer neuen gleichzeitig geänderten Bedingung entwickelt die lernende Person eine neue unterscheidbare Frage und begründet, wie konkurrierende Hypothesen voneinander getrennt werden können.',
        'With a newly changed simultaneous condition, the learner develops a distinguishable question and explains how competing hypotheses can be separated.',
        'Identifizieren, Entwickeln und theoriegeleitetes Aufstellen gehören zum selben Frage-Hypothesen-Prozess. Aus Bildkeimlingen wird kein gemessener Sauerstoffmangel abgeleitet.'
    ),
    (
        'Eine hypothesengeleitete Untersuchung verbindet Beobachtung, Vergleich, Experiment und Modellierung mit begründetem Variablengefüge, kontrolliertem Vorgehen und nachvollziehbarem Protokoll; ein ausgeführtes endliches Modell bleibt von einer physischen Untersuchung verschieden.',
        'A hypothesis-led investigation connects observation, comparison, experiment and modeling with a justified variable structure, controlled procedure and traceable record; performing a finite model remains distinct from physical inquiry.',
        'Die lernende Person plant Wasser- oder Lichtvergleiche, wählt die tatsächlich vorhandenen Bedingungen, führt die endlichen Modellschritte aus, protokolliert Replikate und Anfangs-/Endwerte und trennt Befund, Deutung und noch erforderliche reale Handlungen.',
        'The learner plans water or light comparisons, selects the actual available conditions, performs the finite model steps, records replicates and starting/ending values and separates findings, interpretations and still-required real actions.',
        'Bei zugleich geänderter Temperatur oder fehlendem Sauerstoff-Anfangswert begründet die lernende Person einen neuen kontrollierten Ansatz und ein vollständiges Protokoll, statt den alten Vergleich als isolierten Variablentest zu behandeln.',
        'With simultaneously changed temperature or a missing initial oxygen value, the learner justifies a newly controlled setup and a complete record instead of treating the old comparison as an isolated variable test.',
        'Alle vier Verfahren sowie Planen, Durchführen, Protokollieren und Variablenkontrolle sind im ganzen Text erhalten. Das neue HTML bietet die behauptete Auswahl tatsächlich; Modellaktionen sind keine Nachweise realer Gerätehandhabung oder aktueller Lernleistung.'
    ),
    (
        'Qualitative Kategorien und quantitative Messwerte brauchen nachvollziehbare Erfassung, fehlende-Werte-Regeln und passende Auswertung; digitale Werkzeuge erzeugen keine zusätzlichen gültigen Beobachtungen durch Rechnen.',
        'Qualitative categories and quantitative measurements require traceable capture, missing-value rules and suitable analysis; digital tools cannot create additional valid observations through calculation.',
        'Die lernende Person erfasst Temperaturwerte und Blatt-/Keimkarten digital, markiert Unsicherheit und fehlende Werte, begründet Nenner und Filter und berechnet beziehungsweise interpretiert Mittelwerte und Kategorienanteile.',
        'The learner captures temperature values and leaf/germination cards digitally, marks uncertainty and missing values, justifies denominators and filters and calculates and interprets means and category proportions.',
        'Bei einem Ausfall, neuer unklarer Kategorie oder verändertem Filter legt die lernende Person eine überprüfbare neue Auswertung mit Sensitivitätsgrenze vor und begründet, welche Daten erneut erfasst werden müssen.',
        'With a missing reading, new uncertain category or changed filter, the learner presents a traceable new analysis with sensitivity bounds and explains which data must be collected again.',
        'Qualitativ, quantitativ, Aufnehmen, Auswerten und digitale Hilfen bleiben vollständig und methodenneutral. CSV-/Kartenaktionen sind endliche authored-data-Arbeit und kein Beleg realer Sensorerhebung.'
    ),
    (
        'Sachgerechte Labor- und Freilandtechnik verknüpft passende Gerätehandhabung mit Probenbezug, Beobachtung, dokumentiertem Vorgehen und konkreten Sicherheits- und Naturschutzregeln; Präparieren ist eine eigene Handlung an einer Probe.',
        'Competent laboratory and field technique connects suitable equipment handling with specimen context, observation, recorded procedure and concrete safety and conservation rules; preparation is an action on a specimen.',
        'Die lernende Person begründet und demonstriert geeignete Mikroskop- und Gewässertechnik sowie sichere Staubblattpräparation an freigegebenem Material; das Protokoll unterscheidet tatsächliche Handlungen von den vier vorbereitenden Modellkarten.',
        'The learner justifies and demonstrates suitable microscopy and water-body technique and safe stamen preparation on approved material; the record distinguishes actual actions from the four preparatory model cards.',
        'Bei beschädigtem Staubfaden, unbekannter Ersatzprobe oder ungeeignetem Ufer erklärt die lernende Person den Abbruch beziehungsweise eine genehmigte Anpassung und dokumentiert erst tatsächlich beobachtetes Gelingen.',
        'For a damaged filament, unknown replacement specimen or unsuitable bank, the learner explains stopping or an approved adaptation and records success only when it is actually observed.',
        'Der vollständige DE/EN-Text erhält Labor, Freiland, Anwendung und Sicherheit. NI verlangt am Original nur Präparieren eines Organs; der zusätzliche Staubblattfall ist biologisch passend, belegt aber keine tatsächlich ausgeführte Präparation und schließt den Säugetier-Partner nicht.'
    ),
    (
        'Struktur, Beziehung und Trend in Daten werden durch begründete Theorie interpretiert; Plateau, zeitlicher Versatz und Streuung begrenzen kausale und quantitative Schlussfolgerungen.',
        'Structures, relationships and trends in data are interpreted through justified theory; plateaus, time lags and variation limit causal and quantitative conclusions.',
        'Die lernende Person findet und erklärt Sättigung einer Enzymreihe und zeitlich versetzte Populationsmuster, zieht dazu passende begrenzte Schlüsse und benennt die beobachtete Größe und alternative Erklärungen.',
        'The learner identifies and explains saturation in an enzyme series and lagged population patterns, draws suitable bounded conclusions and identifies the observed quantity and alternative explanations.',
        'Bei veränderter Substratmenge oder einer neu widersprechenden Zeitreihe prüft die lernende Person die bisherige Theoriezuordnung und begründet eine angepasste Schlussfolgerung ohne unbelegte Periodizitäts- oder Kausalbehauptung.',
        'With changed substrate amount or a newly conflicting time series, the learner rechecks the theoretical interpretation and justifies an adapted conclusion without unsupported claims of periodicity or causation.',
        'Gefundene Muster, theoriebezogene Erklärung und Schluss bilden eine einzelne Dateninterpretationskompetenz. Der schematische Bildverlauf ist durch die Caption als Brutto-Sauerstoffbildungsrate begrenzt, nicht als Endkonzentration oder Dunkel-Nettobilanz.'
    ),
    (
        'Die Reflexion eigener Ergebnisse prüft den Zusammenhang eigener Auswertungsentscheidungen und Protokolle mit Datengültigkeit, zufälligen und systematischen Fehlern sowie nützlichen Modellannahmen und ihren Grenzen.',
        'Reflection on one’s own results examines how one’s analysis decisions and records relate to data validity, random and systematic errors and useful model assumptions and their limits.',
        'Die lernende Person erzeugt eine eigene Sensor-Korrekturauswertung beziehungsweise ein eigenes Blattmodellprotokoll und reflektiert danach genau die eigenen Ergebnisse und Entscheidungen einschließlich Gültigkeit, Fehlerquellen und Modellgrenzen.',
        'The learner produces their own corrected sensor analysis or leaf-model record and then reflects on those specific results and decisions, including validity, error sources and model limits.',
        'Bei temperaturabhängigem Sensorfehler oder einem zusätzlichen Cuticulapfad begründet die lernende Person, welche eigene Korrektur oder Modellannahme nicht mehr trägt und wie ein neues überprüfbares Ergebnis erzeugt werden soll.',
        'With a temperature-dependent sensor error or an additional cuticular pathway, the learner explains which of their own corrections or model assumptions no longer holds and how to produce a new testable result.',
        'Die gezielte EN1-Korrektur stellt die bereits verbindlichen eigenen Ergebnisse/den eigenen Erkenntnisprozess vollständig wieder her. Beschreibung KEEP; P11 REVISE/HOLD: die beiden aktuellen Fallaufträge und Pflicht-Erwartungen verlangen weiterhin nur Kritik bereitgestellter Daten, keine explizite eigene Ergebnis-/Entscheidungsreflexion.'
    ),
    (
        'Befunde stützen oder widerlegen eine Hypothese im Geltungsbereich ihrer Vorhersage; ein Gegenbefund zu einer notwendigen Bedingung ist anders als ausbleibende Bestätigung oder eine Bedingung außerhalb des geprüften Bereichs.',
        'Findings support or refute a hypothesis within the scope of its prediction; a counterfinding to a necessary condition differs from lack of confirmation or a condition outside the tested range.',
        'Die lernende Person bezieht Keimung im Dunkeln oder Enzymraten auf die genaue Hypothese zurück und begründet Stützung oder Widerlegung unter Erhalt von Bereich, Kontrollen und Befundgrenzen.',
        'The learner relates dark germination or enzyme rates to the exact hypothesis and justifies support or refutation while retaining range, controls and limitations of the findings.',
        'Bei geänderter Samenart oder einer Temperatur außerhalb des ursprünglichen Intervalls formuliert die lernende Person ein zutreffend begrenztes Urteil und trennt es von einer ungeprüften Ersatzhypothese.',
        'For a changed seed species or a temperature outside the original interval, the learner states an appropriately bounded judgment and separates it from an untested replacement hypothesis.',
        'Zurückbeziehen und begründet Entscheiden sind klar und gleichwertig DE/EN. Dunkle Keimlinge widerlegen eine universelle Lichtnotwendigkeit, aber beweisen weder unbegrenztes Dunkelwachstum noch eine beliebige neue Erklärung.'
    ),
    (
        'Biologische Befunde lassen sich durch passende chemische und physikalische Beziehungen erklären; Stofflöslichkeit, Temperatur und Oberfläche-Volumen-Verhältnis benötigen Bedingungen und ersetzen keine gemessene biologische Ursache.',
        'Biological findings can be interpreted through suitable chemical and physical relationships; solubility, temperature and surface-to-volume ratio require conditions and do not replace a measured biological cause.',
        'Die lernende Person verbindet einen Sauerstoffbefund mit temperaturabhängiger Löslichkeit und biologischer Atmung beziehungsweise einen Geometriebefund mit Austauschoberfläche und begründet die Grenzen der fachübergreifenden Deutung.',
        'The learner connects an oxygen finding to temperature-dependent solubility and biological respiration, or a geometric finding to exchange surface, and justifies the limits of the interdisciplinary interpretation.',
        'Bei zusätzlichem Gasaustausch, veränderter Aktivität oder gefalteter Oberfläche entscheidet die lernende Person, welche Fachbeziehung noch erklärt und welche weitere biologische Messung nötig ist.',
        'With additional gas exchange, changed activity or a folded surface, the learner determines which disciplinary relationship still explains the findings and which further biological measurement is needed.',
        'Das Herstellen fachübergreifender Bezüge bleibt Befundinterpretation. Der tatsächliche V3-Fischpfad und das gelöste O₂-Teilchenmodell sind kohärent; kein Fischsterben oder exakter Konzentrationswert wird aus der Zeichnung behauptet.'
    ),
    (
        'Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logische Konsistenz und Vorläufigkeit sind unterschiedliche Prüfbezüge konkreter biologischer Erkenntnis und ihrer Grenzen; Übereinstimmung allein ist kein Wahrheitsbeweis.',
        'Reproducibility, falsifiability, intersubjectivity, logical consistency and provisionality are distinct checks on concrete biological inquiry and its limits; agreement alone does not prove truth.',
        'Die lernende Person reflektiert Beobachter-Codierung und eine Selektionsdeutung an allen fünf Kriterien, benennt prüfbare Gegenbefunde, vergleichbare Bedingungen und Grenzen einer gegen Kritik immunisierten Erklärung.',
        'The learner reflects on observer coding and a selection interpretation using all five criteria, identifying testable counterfindings, comparable conditions and limits of an explanation insulated from criticism.',
        'Bei abweichendem neuen Team oder neuen Merkmalsdaten prüft die lernende Person Konsistenz und Prüfbedingungen und begründet vorläufige Anpassung oder Verwerfung, statt eine Mehrheitsmeinung als Beweis zu verwenden.',
        'For a differing new team or new trait data, the learner examines consistency and test conditions and justifies provisional adjustment or rejection instead of treating a majority view as proof.',
        'Alle fünf expliziten Wissenschaftskriterien bleiben erhalten. Sie beurteilen gemeinsam die Tragfähigkeit eines Erkenntnisprozesses; kein wording-only Split oder zusätzliche Kompetenz wird eingeführt. Das Comicmotiv bildet Lehrunterstützung und keine wirkliche Replikation.'
    ),
]
assert len(CHAINS) == len(review['goals']) == 14
records = []
for i, (g, chain) in enumerate(zip(review['goals'], CHAINS)):
    rec = {'$schema': schema['$id'], 'schemaVersion': 1,
           'recordId': run_id + '.goal-' + str(i + 1).zfill(2), 'runId': run_id,
           'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
           'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest']}
    for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
        rec[k] = g[k]
    rec.update({'decision': 'keep', 'understandingEvidence': dict(zip(
        ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn'], chain[:6])),
        'rationale': chain[6], 'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'revise' if i == 10 else 'none',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
    jsonschema.validate(rec, schema)
    records.append(rec)
record_path = OUT / (batch['batchId'] + '.records.jsonl')
assert not record_path.exists()
record_path.write_text(''.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) + '\n' for x in records))

now = datetime.datetime.now(datetime.timezone.utc).isoformat()
parameter_disclosure = {'providerExactModelIdentifier': 'not exposed in this agent session',
                       'samplingParameters': 'not exposed', 'reviewMethod': 'actual independent Codex semantic review, not external API replay',
                       'blindToBiologyPeers': True, 'firstScienceAndVSealsImmutable': True}
param_binding = write('generation-parameters.truthful-disclosure.json', parameter_disclosure)
bundle = read(entry['actualNativeBundlePath'])
allowed_roles = {'book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest', 'review_input_json', 'review_input_jsonl', 'review_markdown', 'review_prompt', 'review_criteria', 'finding_schema', 'run_manifest_schema'}
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
       'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
       'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
       'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
       'provider': 'OpenAI Codex agent session', 'model': 'Codex; exact provider model identifier not exposed',
       'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
       'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
       'generationParametersFingerprint': param_binding['sha256'], 'independenceGroupId': campaign['independenceGroupId'],
       'blindToOtherRuns': True, 'goalIds': batch['goalIds'],
       'inputArtifacts': [{'role': x['role'], 'digest': x['digest']} for x in bundle['artifacts'] if x['role'] in allowed_roles] +
                         [{'role': 'description_review_batch_input_jsonl', 'digest': binding(pathlib.Path(campaign_entry['batchesDirectory']) / (batch['batchId'] + '.input.jsonl'))['sha256']}],
       'startedAt': '2026-10-09T00:13:00+00:00', 'completedAt': now, 'status': 'completed',
       'outputDigest': binding(record_path)['sha256'], 'toolchainVersion': 'codex-independent-review-v1'}
# The start marks native inspection in this continued task, not an invented API invocation.
run['startedAt'] = datetime.datetime.fromtimestamp((OWN/'native-inspection/physical-page-003.inspection-only.png').stat().st_mtime, datetime.timezone.utc).isoformat()
jsonschema.validate(run, read('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'))
run_binding = write(batch['batchId'] + '.run.json', run)

print(json.dumps({'records': binding(record_path), 'run': run_binding, 'schemaValidated': 14, 'descriptionKeep': 14, 'positiveProfileHold': ['8375310d-1f7e-542d-9969-55ad4bd37f7c']}, ensure_ascii=False))
