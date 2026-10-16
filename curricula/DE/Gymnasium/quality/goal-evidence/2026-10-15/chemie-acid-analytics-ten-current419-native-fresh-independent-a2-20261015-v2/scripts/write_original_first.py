"""Serialize this reviewer's original live native D judgment, never prior reviews."""
import datetime
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
PREP = OUT.parent / 'chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1'
AUTHOR = OUT.parent / 'chemie-acid-analytics-ten-current419-bounded-author-remediation-20261015-v1'

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

started = json.loads((OUT / 'ORIGINAL.live-reviewer-run.started.json').read_text())
campaign = json.loads((OUT / 'round-a/description-review-campaign.json').read_text())
batch_path = next((OUT / 'round-a/batches').glob('*.input.jsonl'))
batch = [json.loads(line) for line in batch_path.read_text().splitlines() if line]
bundle = json.loads((PREP / 'native-ten-current/bundle/manifest.json').read_text())

# These are the original scientific judgments formulated by the live A2 reviewer.
# Six evidence statements per goal are authored here independently of raw profiles.
judgments = [
    dict(decision='block', recommendation='none',
         rationale='Die EDTA-Kompetenz ist chemisch und bilingual klar und als ein vollständiger Analysevorgang zusammenhängend. Eigene Rechnungen bestätigen 3.950 mmol/L und die Wiederfindungen 100.13 % bzw. 100.4 %. T01 verlangt echte beaufsichtigte Handhabung zusätzlich zur Papierauswertung und behauptet sie nicht. Blockierend bleibt aber die gegenwärtige BB/BE-Quellenbindung: Die tatsächlich gelesene offizielle Seite 41 behandelt Löslichkeitsgleichgewichte und Konduktometrie, einschließlich konduktometrischer Fällungstitration, nicht EDTA-Komplexometrie. Die explizite BY-LK-Quelle heilt diese andere Jurisdiktionsbindung nicht. Kantenkorrektur, residuale Konduktometriepflicht und wirksame Kurs-/View-Projektion sind nicht durch diese Prüfung abgeschlossen. Keine lokale Umformulierung kann diese Quellenfrage lösen.',
         evidence=[
             'EDTA erfasst unter festgelegten pH- und Matrixbedingungen eine stöchiometrische Metallmenge; ein Endpunkt beruht auf der Konkurrenz mit dem Metallindikator und bestimmt im gegebenen Modell die Ca/Mg-Summe.',
             'Under specified pH and matrix conditions EDTA determines a stoichiometric amount of metal; the endpoint depends on competition with the metal indicator and determines total Ca/Mg in this model.',
             'Die lernende Person führt nach örtlicher Freigabe eine beobachtete Titration mit Aliquotierung, Bürettenablesung und beständigem Endpunkt durch, rechnet Blindwert und Verdünnung zurück und beurteilt Referenz- oder Aufstockkontrolle getrennt von Streuung.',
             'Following local authorization, the learner performs an observed titration with aliquoting, burette readings and a persistent endpoint, applies blank and dilution corrections and evaluates reference or spike control separately from scatter.',
             'Bei einer verdünnten und aufgestockten Probe begründet sie den unveränderten ursprünglichen Probenbezug, berechnet die Wiederfindung und erklärt, weshalb daraus keine getrennten Ca- und Mg-Gehalte folgen.',
             'For a diluted and spiked sample the learner explains the unchanged original sample basis, calculates recovery and explains why it does not yield separate calcium and magnesium contents.'
         ]),
    dict(decision='keep', recommendation='none',
         rationale='Die vollständige Beschreibung benennt einen zusammenhängenden fotometrischen Analysevorgang: spektral geeignete Messbedingung, Kalibrierung, Gehalt und dessen Exaktheit. Diese Schritte sind hier Mittel und Prüfung derselben Gehaltsbestimmung, keine bloß addierten unabhängigen Ziele. Deutsch und Englisch sind äquivalent. Die vollständig gelesenen T02-Fälle und der Rohentwurf verlangen eigene Messaufnahme und Standards neben unabhängiger Auswertung. Eigene Rechnungen ergeben 25.5 mg/L mit +0.67 % Referenzabweichung und 5.00 mg/L als zurückzuhaltenden Rechenwert bei +10 %. Die Beschreibungsentscheidung erteilt weder Laborfreigabe noch Ausführungsnachweis und verifiziert nicht sämtliche nationalen Quellen-/View-Bindungen.',
         evidence=[
             'Eine fotometrische Gehaltsbestimmung verbindet ein geeignetes spektrales Signal unter gleichen optischen Bedingungen mit einer geprüften Kalibrierfunktion; Richtigkeit benötigt eine vom Kalibrieransatz getrennte Kontrolle.',
             'Photometric concentration determination connects a suitable spectral signal under matched optical conditions with a tested calibration function; trueness requires a control independent of calibration preparation.',
             'Die lernende Person bestimmt in beobachteter eigener Messung ein auflösungsbegrenzt angegebenes Maximum und Kalibrierpunkte, begründet den linearen Bereich, bestimmt den verdünnungskorrigierten Gehalt und beurteilt Kontrollabweichung und Wiederholstreuung getrennt.',
             'Through observed measurement the learner determines a resolution-limited maximum and calibration points, justifies the linear range, determines dilution-corrected concentration and evaluates control deviation separately from replicate scatter.',
             'Bei einem nichtlinearen oberen Standard und einer trotz enger Streuung fehlerhaften Referenz begrenzt sie die Interpolation, hält den Gehalt als unbestätigt zurück und begründet geeignete weitere Fehlerprüfungen.',
             'With a nonlinear upper standard and a biased reference despite narrow scatter, the learner limits interpolation, withholds the concentration as unconfirmed and justifies appropriate further error checks.'
         ]),
    dict(decision='keep', recommendation='none',
         rationale='Berechnung und Beurteilung der Pufferbereiche sind zwei zusammenhängende Ansichten desselben mehrstufigen Protolysemodells; kein allein aus der Wortverbindung begründeter Split. Der kurze aktuelle Text ist chemisch richtig und bilingual gleichwertig. T03 und sein vollständiger Rohentwurf machen Stufenauswahl, Bilanz, Näherung und Pufferwirkung konkret. Die unabhängige Rechnung bestätigt Phosphat pH 7.501→7.200 und den korrigierten ersten Glycin-Halbpunkt 2.444 mit h/c*=0.108 statt einer unzulässigen exakten Halbpunktregel. Kein Vollnachweis aller externen Quellen und effektiven Projektionen wird daraus abgeleitet.',
         evidence=[
             'Aufeinanderfolgende Protonenabgaben erzeugen verschiedene benachbarte korrespondierende Paare; pH, pK-Abstände und Stoffbilanz entscheiden, welche Stufen und Näherungen maßgeblich sind.',
             'Successive proton loss creates different adjacent conjugate pairs; pH, pK separation and amount balance determine the relevant stages and approximations.',
             'Die lernende Person formuliert ladungs- und atomrichtige Stufen, berechnet pH und charakteristische Stoffmengen mit einer begründeten Näherung und beurteilt die Pufferung aus den tatsächlich verfügbaren benachbarten Partnern.',
             'The learner writes charge- and atom-balanced stages, calculates pH and characteristic amounts with a justified approximation and judges buffering from the actually available adjacent partners.',
             'Beim Wechsel vom mittleren Phosphatpaar zu Glycin beziehungsweise zur ersten Phosphatstufe wählt sie das neue Paar und prüft, ob formale Halbmengen tatsächliche Gleichgewichtskonzentrationen ersetzen dürfen.',
             'When moving from the middle phosphate pair to glycine or the first phosphate stage, the learner selects the new pair and checks whether formal half amounts can stand for actual equilibrium concentrations.'
         ]),
    dict(decision='block', recommendation='revise',
         rationale='Pufferwirkung, chemische Verträglichkeit und begrenzte quellenkritische Auswahl sind fachlich zusammenhängend; die T04-Fälle enthalten vollständige erfundene Quellen und tragfähige begrenzte Urteile. Eigene Rechnung reproduziert den Beispiel-pH 6.96. Dennoch kann dieser Gesamttext nicht unverändert als quellentreu für alle zugeordneten Kurse freigegeben werden. BW 3.4.3(16), tatsächlich auf gedruckter Seite 34/PDF 36 gelesen, verlangt im Leistungsfach auch quantitative HH-Berechnungen; das derzeitige alleinige exact-Mapping auf dieses qualitative Auswahlziel deckt sie nicht. BY GA/EA fordert zielgerichtetes Recherchieren; die gelieferten Karten belegen nur Quellenkritik und der GA-Text trägt nicht automatisch alle EA-Auswahlanforderungen. Die vorgeschlagenen Teilkanten lösen noch keine Kurs-, View- oder Erwerbsroute. Forschung und quantitative Pflicht dürfen bei der Klärung nicht entfallen.',
         evidence=[
             'Pufferwahl erfordert sowohl einen geeigneten Protolysebereich als auch chemische Verträglichkeit und endliche Reserven; ein begrenzter Methodenbefund trägt keine allgemeine medizinische oder ökologische Eignung.',
             'Buffer selection requires both a suitable protolysis range and chemical compatibility with finite reserves; a bounded method result does not establish universal medical or ecological suitability.',
             'Die lernende Person erklärt beide Aufnahmereaktionen, wählt anhand der vorliegenden pK- und Interferenzdaten einen geeigneten Kandidaten oder benennt eine Datenlücke und begrenzt Quellenurteile anhand Herkunft und untersuchtem System.',
             'The learner explains both uptake reactions, selects a suitable candidate using supplied pK and interference data or identifies a data gap and bounds source judgments by provenance and investigated system.',
             'Beim Wechsel vom kompatiblen Forschungsassay zur Calcium-Matrix oder vom Probengefäß zum offenen Gewässer überprüft sie die Bedingungen erneut und benennt die für die neue Anwendung fehlenden Nachweise.',
             'When moving from a compatible research assay to a calcium matrix or from a sample vial to open water, the learner reassesses conditions and identifies evidence missing for the new application.'
         ]),
    dict(decision='block', recommendation='revise',
         rationale='Die neuen vollständigen T05-Fälle liefern tatsächlich zu deutende unbekannte Kurvendaten; Stoffklasse, charakteristische Punkte und Indikatorgrenzen sind beobachtbar prüfbar. Die eigenen Rechnungen stimmen einschließlich 2.883/2.880, 8.729 und neutralem pH 6.60. Das behebt keine semantische Abgrenzung zum direkt nachfolgenden 29742-Ziel: Der aktuelle Text beschränkt Titrationsdaten und Stoff-/Indikatoraussagen nicht auf starke Säuren oder auf die konkrete Fallauswahl. Stark/schwach und Säure/Base des Nachfolgers liegen daher bereits in seinem allgemeinen Anspruch. Gleichlautende HE/BB/BE-Quellenanteile stützen keinen eigenständigen Mehrwert; HE kennzeichnet charakteristische Kurvenberechnung zudem als LK. Eine bloße Umbenennung oder die Reduktion dieses Zieles auf die Fallauswahl würde Pflichtumfang verdecken. Minimale Gesamtmodellierung und wirksame Kursprojektion bleiben zu klären.',
         evidence=[
             'Äquivalenz ist stöchiometrisch bestimmt; Kurvenform und charakteristische pH-Werte hängen von Protolyse, Salzreaktion, Gesamtvolumen und Temperatur ab, während ein Indikator einen vereinbarten Farbendpunkt anzeigt.',
             'Equivalence is defined stoichiometrically; curve shape and characteristic pH values depend on protolysis, salt reaction, total volume and temperature, while an indicator signals an agreed colour endpoint.',
             'Die lernende Person begründet die Stoffklasse aus vorgelegten Kurvendaten, berechnet die maßgeblichen Bereiche mit passenden Bilanzen und begrenzt daraus abgeleitete Indikator- und Identitätsaussagen.',
             'The learner justifies the substance class from supplied curve data, calculates relevant regions with appropriate balances and limits resulting indicator and identity claims.',
             'Bei gleichem Stoffmengengehalt, aber schwacher statt starker Säure erklärt sie gleichen Äquivalenzverbrauch und veränderte Puffer- und Äquivalenzbereiche; ein verändertes pKw prüft sie unabhängig davon.',
             'At equal formal amount but with weak rather than strong acid, the learner explains equal equivalence volume and altered buffer and equivalence regions, checking a changed pKw independently.'
         ]),
    dict(decision='block', recommendation='revise',
         rationale='Die aktuelle Formulierung ist für sich chemisch richtig; T06 führt die Bilanz vor dem Logarithmus durch und prüft Verdünnung, Erschöpfung und offenen Stoffverlust. Gerade diese vollständige Operationalisierung zeigt aber keine eigenständige Kompetenz gegenüber dem aktuellen ganzen d746-Ziel: Dieses fordert pH aus Partnerverhältnis und begründete Näherung. Unterschiedliche Phasencluster, Beispiele oder das Wort vertiefen schaffen keine semantische Trennung. Die gelesene HE-Seite 48 nennt eine quantitative HH-Kompetenz; ein daneben zugeordnetes qualitatives Acetat-Quellenstück trägt keine zusätzliche quantitative Identität. Zusammenlegung oder fachlich belegte Differenzierung, Quellenaufteilung und Erwerbsroute sind offen. Vorhandene HH-Memoryentscheidung, Karte und Sichtbarkeit bleiben exakt erhalten.',
         evidence=[
             'Die HH-Beziehung folgt aus dem Protolysegleichgewicht; vor ihrer Anwendung müssen starke Zugaben mit dem reagierenden Partner bilanziert und geeignete Aktivitäts- beziehungsweise Konzentrationsannahmen geprüft werden.',
             'The HH relation follows from protolysis equilibrium; before applying it, strong additions must be balanced against the reacting partner and suitable activity or concentration assumptions checked.',
             'Die lernende Person berechnet Ausgangs- und Folge-pH aus positiven Restmengen, erklärt die Quotientenrichtung und unterscheidet nahezu unveränderten Verdünnungs-pH von veränderter Reserve je Liter.',
             'The learner calculates initial and subsequent pH from positive remaining amounts, explains ratio direction and distinguishes nearly unchanged dilution pH from altered reserve per litre.',
             'Beim Wechsel von Acetat mit Säurelast zu Ammonium mit Baselast erkennt sie Partnererschöpfung oder unbekannten NH3-Verlust als Anlass einer neuen Bilanz statt einer unveränderten Formelübernahme.',
             'When moving from acetate under acid load to ammonium under base load, the learner recognises partner exhaustion or unknown NH3 loss as requiring a new balance rather than unchanged formula substitution.'
         ]),
    dict(decision='keep', recommendation='none',
         rationale='Die Beschreibung bezeichnet genau das Phosphatpaar und die Begründung über Le Chatelier; mit dem Titel Geschlossene Puffersysteme ist der Modellrahmen hinreichend klar und bilingual gleichwertig. Paarbeschreibung und Wirkung sind ein zusammenhängendes Erklärziel. T07 prüft die Grenze nach definierter Zugabe, Säure-/Baseimpulse und endliche unsymmetrische Reserven. Eigene Bilanzen bestätigen 6/4, 4/6 und 5/5 mmol; das bei der zweiten Störung formal verbleibende Basenäquivalent wird richtig nicht als exakt freies OH behauptet. Diese Beschreibungsentscheidung verifiziert keine zusätzlichen nationalen Projektionen oder tatsächlichen Lernleistungen.',
         evidence=[
             'Im nach der bilanzierten Zugabe geschlossenen Phosphatpuffer können die korrespondierenden Partner weiter reagieren, obwohl keine Materie über die gewählte Grenze austritt oder eintritt.',
             'In a phosphate buffer closed after the accounted addition, conjugate partners can continue reacting although matter no longer crosses the chosen boundary.',
             'Die lernende Person formuliert beide Aufnahmereaktionen, begründet die Gegenwirkung nach Le Chatelier und verfolgt, wie Partnerverbrauch und Verhältnisänderung die pH-Richtung und die endliche Reserve bestimmen.',
             'The learner writes both uptake reactions, explains opposition to the perturbation using Le Chatelier and tracks how partner consumption and ratio change determine pH direction and finite reserve.',
             'Bei einer asymmetrischen Mischung oder doppelter Gesamtmenge beurteilt sie die unterschiedliche Belastbarkeit und erklärt, weshalb die Erschöpfung des benannten Paars eine neue Gesamtbilanz weiterer Phosphatstufen erfordert.',
             'For an asymmetric mixture or doubled total amount, the learner judges different load tolerance and explains why exhaustion of the specified pair requires a new overall balance including further phosphate stages.'
         ]),
    dict(decision='block', recommendation='revise',
         rationale='Die T08-Fälle wechseln sinnvoll von aufsteigenden Säure- zu fallenden Basekurven; die eigene Rechnung bestätigt pKb 4.75 und sauren Äquivalenz-pH 5.276. Als Aufgabenentwurf ist das verständlich, aber die aktuelle ganze Beschreibung benennt lediglich einen Teil der bereits allgemeinen Kurvenauswertung des erforderlichen 28c90-Ziels. Dessen Text schließt schwache Basen nicht aus und verlangt bereits Stoff- und Indikatorinformationen. Die Quellenzuordnung zur HE-Interpretation und zu BB/BE-Kurvenarten liefert keine klare neue Kompetenz. Eine zusätzliche Säure-Base-Variante allein rechtfertigt kein zweites verpflichtendes Lernziel. Die minimale Darstellung, erhaltene Quellenpflichten, Prerequisite-Routen und Kurse müssen gemeinsam geklärt werden; keine kosmetische Revision wird vorgeschlagen.',
         evidence=[
             'Säure- und Basekurven spiegeln die Richtung der Neutralisation und die Wirkung der schwachen Komponente beziehungsweise ihres korrespondierenden Salzpartners wider; gleicher Verbrauch beweist nicht gleiche Stärke.',
             'Acid and base curves reflect neutralisation direction and the effect of the weak component or its conjugate salt partner; equal volume does not establish equal strength.',
             'Die lernende Person ordnet die vier Kurvenklassen aus Daten zu, erklärt Halb- und Äquivalenzbereich aus Spezies und begründet geeignete Indikatorkandidaten mit begrenzter Datengenauigkeit.',
             'The learner classifies the four curve types from data, explains half-equivalence and equivalence through species and justifies indicator candidates with appropriately limited data precision.',
             'Beim Übergang von einer schwachen Säure unter NaOH zu einer schwachen Base unter HCl erklärt sie die gegensinnige Salzprotolyse und leitet pKb aus dem pKa des Säurepartners ab, ohne eine eindeutige Molekülidentität zu behaupten.',
             'When moving from a weak acid under NaOH to a weak base under HCl, the learner explains opposite salt protolysis and derives pKb from the acid partner pKa without claiming unique molecular identity.'
         ]),
    dict(decision='block', recommendation='none',
         rationale='Die qualitative chemische Kompetenz ist klar und die vollständig gelesenen T09-Fälle unterscheiden Stoffaustausch, Richtung, endliche Reserven und Produktanreicherung richtig. Die beiden Systeme sind sinnvolle Varianten desselben offenen Modells, kein notwendiger Split. Ein konkreter Kurs-/Quellenbefund verhindert jedoch die Gesamtfreigabe: Die tatsächlich gelesene HE-Seite 48 ordnet offene Kohlensäure-/Ammoniumpuffer dem erhöhten Niveau zu. Das aktuelle Ziel trägt GK/LK und eine weitere HE-Teilzuordnung nur zu Bedeutungen von Puffern für lebende Organismen. Dieser allgemeine GK-Satz beweist den speziellen offenen Kompetenzumfang nicht. Ohne gebundene effektive Kursprojektion kann ich weder eine tatsächliche GK-Fehlanzeige behaupten noch sie ausschließen. Die Kurs-/View-Grenze bleibt offen; eine Umformulierung darf das nicht verdecken.',
         evidence=[
             'Offene Puffer koppeln Protolyse an konkret benannten Stoffaustausch; der Austausch kann je nach Richtung und Fluss die Säureaufnahme unterstützen oder eine Reserve vermindern.',
             'Open buffers couple protolysis to specifically identified matter exchange; depending on direction and flow, exchange can support acid uptake or diminish a reserve.',
             'Die lernende Person markiert die Systemgrenze, formuliert Säure- und Baseaufnahme und erklärt CO2-Abgabe beziehungsweise NH3-Verlust und Nachschub mit endlichen Stoffmengen und zurückbleibenden Produkten.',
             'The learner marks the system boundary, writes acid and base uptake and explains CO2 release or NH3 loss and resupply using finite amounts and retained products.',
             'Bei umgekehrtem CO2-Fluss oder NH3-Nachlieferung mit verbleibendem NH4 erklärt sie die geänderte pH-Tendenz und begründet, weshalb ohne Mengen- und Flussdaten kein konstanter Zahlen-pH oder unbegrenzter Vorteil folgt.',
             'With reversed CO2 flow or NH3 resupply while NH4 remains, the learner explains altered pH direction and why unspecified amounts and flows establish neither a constant numerical pH nor unlimited benefit.'
         ]),
    dict(decision='block', recommendation='revise',
         rationale='Die vollständigen T10-Fälle leisten nachvollziehbares mathematisches Pufferdesign. Eigene Rechnungen bestätigen beta=0.054617 bzw. 0.106768 mol L^-1 pH^-1, endliche Grenzlasten 2.79126 bzw. 4.94452 mmol und Cmin=0.17913 mol/L für Phosphat. Lokale Ableitung und endliche Reserve werden richtig getrennt. Die offene Frage des ganzen Operators konstruieren sowie seiner Quellen-/Erwerbsbindung ist damit noch nicht geschlossen: Die gelesene HE-Seite 48 belegt HH-pH-Berechnungen, nicht schon eigenständiges quantitatives Kapazitätsdesign; die ausgewählte HB-Extraktion nennt nur allgemein Pufferdesign. Weder eine tatsächliche Herstellungspflicht noch eine fachlich autorisierte Beschränkung auf Papierdesign ist hier vollständig belegt. Die explizit offene Autorfrage bleibt daher offen; eine ergänzte Bezeichnung rechnerisch wäre ohne diese Klärung eine mögliche unbemerkte Verengung.',
         evidence=[
             'Im angegebenen Paarmodell bestimmt der Ziel-pH das Verhältnis, während Konzentration und Volumen die Partnerreserven festlegen; lokale Differentialkapazität und endliche tolerierte Last sind verschiedene Größen.',
             'In the specified pair model target pH sets the ratio, while concentration and volume set partner reserves; local differential capacity and finite tolerated load are distinct quantities.',
             'Die lernende Person dimensioniert Partnerstoffmengen, berechnet beta mit Einheit und prüft eine endliche Säure- oder Baselast durch stöchiometrische Umsetzung gegen die vorgegebene pH-Grenze.',
             'The learner sizes partner amounts, calculates beta with units and checks a finite acid or base load through stoichiometric conversion against the specified pH boundary.',
             'Bei gleicher pH-Vorgabe, aber höherer Konzentration oder doppeltem Volumen erklärt sie die unterschiedliche Skalierung von beta je Liter, beta V und Grenzlast und legt offengehaltene reale Aktivitäts- und Ausführungsbedingungen dar.',
             'At the same target pH but increased concentration or doubled volume, the learner explains the different scaling of beta per litre, beta V and boundary load and states unresolved real activity and performance conditions.'
         ]),
]

records = []
fields = ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe',
          'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']
for idx, (item, judgment) in enumerate(zip(batch, judgments), 1):
    g = item['goal']
    record = {'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
              'schemaVersion': 1, 'recordId': started['runId'] + '.T%02d' % idx,
              'runId': started['runId'], 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
              'bundleFingerprint': item['bundleFingerprint'], 'bookDigest': item['bookDigest']}
    for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn',
                'currentDescriptionDe', 'currentDescriptionEn']:
        record[key] = g[key]
    record.update(decision=judgment['decision'], understandingEvidence=dict(zip(fields, judgment['evidence'])),
                  rationale=judgment['rationale'], evidenceProfileContract='positive-understanding-evidence-v2',
                  evidenceProfileRecommendation=judgment['recommendation'], recordStatus='candidate', reviewAuthority='ai_candidate')
    records.append(record)

raw = ''.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n' for row in records).encode()
first_path = OUT / 'ORIGINAL.FIRST.scientific-native-D.records.jsonl'
if first_path.exists():
    raise RuntimeError('Original scientific FIRST already exists; never overwrite it')
first_path.write_bytes(raw)
records_path = OUT / 'round-a/results' / (campaign['batches'][0]['batchId'] + '.records.jsonl')
records_path.write_bytes(raw)
completed = datetime.datetime.now(datetime.timezone.utc).isoformat()
parameters = {'provider': started['provider'], 'model': started['model'],
              'exactModelVersion': 'not exposed', 'temperature': 'not exposed', 'seed': 'not exposed',
              'reasoningEffort': 'not exposed', 'apiRequestId': 'not exposed',
              'execution': 'actual original independent Codex subagent live scientific review',
              'noSeparateProviderBatchJobWasDispatched': True}
write(OUT / 'ORIGINAL.exposed-generation-parameters.json', parameters)
roles = {'book_pdf', 'book_html', 'book_model', 'review_input_json', 'review_prompt', 'review_criteria'}
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
       'schemaVersion': 1, 'runId': started['runId'], 'campaignId': campaign['campaignId'],
       'roundId': campaign['roundId'], 'batchId': campaign['batches'][0]['batchId'],
       'batchInputFingerprint': digest(batch_path.read_bytes()), 'bundleFingerprint': campaign['bundleFingerprint'],
       'bookDigest': campaign['bookDigest'], 'provider': started['provider'], 'model': started['model'],
       'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
       'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
       'generationParametersFingerprint': digest((OUT / 'ORIGINAL.exposed-generation-parameters.json').read_bytes()),
       'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
       'goalIds': campaign['batches'][0]['goalIds'],
       'inputArtifacts': [{'role': x['role'], 'digest': x['digest']} for x in bundle['artifacts'] if x['role'] in roles] +
                         [{'role': 'description_review_batch_input_jsonl', 'digest': digest(batch_path.read_bytes())}],
       'startedAt': started['startedAt'], 'completedAt': completed, 'status': 'completed',
       'outputDigest': digest(raw), 'toolchainVersion': 'goal-description-review-v1'}
run_path = OUT / 'round-a/results' / (campaign['batches'][0]['batchId'] + '.run.json')
write(run_path, run)
write(OUT / 'ORIGINAL.live-reviewer-run.completed.json', {
    **started, 'completedAt': completed, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'nativeSchemaRunRole': 'subject_reviewer', 'normalCampaignReviewerRole': 'internal_ai_reviewer',
    'originalScientificOutput': {'path': str(first_path), 'sha256': digest(raw), 'bytes': len(raw)},
    'normalNativeRun': {'path': str(run_path), 'sha256': digest(run_path.read_bytes())},
    'supplementalInputs': [
        {'role': key, 'path': str(path), 'sha256': digest(path.read_bytes()), 'bytes': path.stat().st_size}
        for key, path in [('complete20DEENSuccessorCases', AUTHOR / 'materials/twenty-complete-DEEN-cases.author.json'),
                          ('complete10RawV2SuccessorProfiles', AUTHOR / 'author-profiles.ten.raw.json'),
                          ('whole10GoalsAndDirectNeighbors', PREP / 'inputs/ten-whole-current-bodies-and-direct-neighbors.exact.json')]
    ],
    'actualReadInventorySha256': digest((OUT / 'ORIGINAL.actual-read-inventory.json').read_bytes()),
    'ownCalculationsSha256': digest((OUT / 'OWN.calculations.actual.json').read_bytes()),
    'peerOrPriorScientificOutputReadsBeforeFirst': [],
    'authorQuestionExposure': 'Named bounded author materials and questions only; not treated as decisions',
    'sourceClearances': [], 'newPReviews': 0, 'newAReviews': 0, 'newMVVotes': 0,
    'decisionCounts': {label: sum(r['decision'] == label for r in records) for label in ['keep', 'revise', 'split_review', 'block']},
    'scientificOriginality': 'This live reviewer authored the scientific records; no earlier reviewer text was transported or synthesized.'
})

sealed_paths = [first_path, records_path, run_path, OUT / 'ORIGINAL.live-reviewer-run.started.json',
                OUT / 'ORIGINAL.live-reviewer-run.completed.json', OUT / 'ORIGINAL.exposed-generation-parameters.json',
                OUT / 'ORIGINAL.actual-read-inventory.json', OUT / 'OWN.calculations.actual.json']
write(OUT / 'ORIGINAL.FIRST.scientific-and-run.seal.json', {
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'blindToOtherRunsAtSeal': True, 'peerOrPriorOutcomesRead': [],
    'files': [{'path': str(path), 'sha256': digest(path.read_bytes()), 'bytes': path.stat().st_size} for path in sealed_paths],
    'laterClarificationsMustBeAdditive': True,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'activeIntegration': False,
})
print(json.dumps({'runId': started['runId'], 'completedAt': completed, 'originalOutputDigest': digest(raw),
                  'counts': {label: sum(r['decision'] == label for r in records) for label in ['keep', 'block']},
                  'FIRSTsealed': True}))
