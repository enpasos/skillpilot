#!/usr/bin/env python3
"""Apply literal, finding-bound author corrections without changing v7/v8 history."""
import copy
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'AGENTS.md').is_file())
BASE = HERE.parent / 'chemie-b008-twenty-six-positive-materials-author-v8'
SOURCE = BASE / 'fifty-two-cases.de-en.author-candidate.json'
DEST = HERE / SOURCE.name
FROZEN_TIME = '2026-10-06T07:23:11+00:00'

def digest(value):
    return hashlib.sha256(value).hexdigest()

def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(data), 'bytes': len(data)}

def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

old = json.loads(SOURCE.read_text())
new = copy.deepcopy(old)
new['artifactKind'] = 'targeted-positive-material-author-candidate-v9'
new['authoredAtUTC'] = FROZEN_TIME
cases = new['cases']
corrections = []

def replace(index, path, value, findings, rationale):
    target = cases[index]
    before = old['cases'][index]
    for part in path[:-1]:
        target = target[part]
        before = before[part]
    previous = before[path[-1]]
    assert previous != value
    target[path[-1]] = value
    corrections.append({'caseIndexZeroBased': index, 'caseKey': cases[index]['caseKey'],
                        'JSONPointer': '/cases/' + str(index) + '/' + '/'.join(map(str, path)),
                        'findingIds': findings, 'before': previous, 'after': value,
                        'authorRationale': rationale,
                        'independentResolutionStatus': 'pending_targeted_followups'})

def both(index, field, de, en, findings, rationale):
    for lang, value in [('de', de), ('en', en)]:
        replace(index, [field, lang], value, findings, rationale)

def setup(index, de, en, findings, rationale):
    both(index, 'suppliedMaterial', de, en, findings, rationale)
    for lang, value in [('de', de), ('en', en)]:
        replace(index, ['moderatorProtocol', 'setupAndModeratorPreparation', lang], value, findings, rationale)

def protocol_actions(index, de, en, findings, rationale):
    for lang, value in [('de', de), ('en', en)]:
        replace(index, ['moderatorProtocol', 'observableLearnerActions', lang], value, findings, rationale)

def criterion(index, number, de, en, findings, rationale):
    for lang, value in [('de', de), ('en', en)]:
        replace(index, ['requiredAssessmentCriteria', number, 'meaning', lang], value, findings, rationale)

setup(4,
    'Lehrkraft stellt drei beschriftete Becher mit je 50 mL deionisiertem Wasser bei 20 ± 2 °C, getrennte saubere Spatel, 1,0 g NaCl, 1,0 g Saccharose und ein freigegebenes batteriebetriebenes quantitatives Leitfähigkeitsmessgerät bereit. Erforderliche Messbereiche: 0–2000 µS/cm mit 1 µS/cm Anzeigeauflösung für Blindprobe/Standard sowie bis mindestens 100 mS/cm mit 0,01 mS/cm Anzeigeauflösung für die Salzprobe; Auflösung ist keine Genauigkeitsangabe. Die spätere Ausstattung enthält ein Thermometer oder geprüften Temperatursensor mit 0,1-°C-Auflösung und ein betreutes Wasserbad zum Temperaturangleich. Bereitgestellter beschrifteter NaCl-Standard: 1000 mg/L, 1990 ± 20 µS/cm bei 25 °C; Chargenetikett, Gültigkeit, Herstelleranleitung und Temperaturangaben liegen bei. Der Standard wird bei 25 °C nach Geräteanleitung geprüft, nicht anhand des 25-°C-Etiketts ungeprüft bei 20 °C beurteilt. Danach werden die Proben auf die gemeinsame Versuchstemperatur gebracht; Temperatur, Gerätebereich und aktivierte oder ausgeschaltete Kompensation werden notiert. Wasser-Blindprobe und Sonde prüfen und zwischen Proben spülen. Hypothese: NaCl erhöht die Leitfähigkeit stärker als Saccharose bei diesen Bedingungen. Ausstattung und Standardprüfung sind Voraussetzungen einer späteren echten Durchführung, keine bereits erfolgten Messungen.',
    'The teacher provides three labelled beakers with 50 mL deionised water each at 20 ± 2 °C, separate clean spatulas, 1.0 g NaCl, 1.0 g sucrose and an authorised battery-powered quantitative conductivity meter. Required ranges: 0–2000 µS/cm with 1 µS/cm display resolution for blank/standard, and at least 100 mS/cm with 0.01 mS/cm display resolution for the salt sample; resolution is not an accuracy statement. The future kit includes a thermometer or verified temperature sensor with 0.1-°C resolution and a supervised water bath for temperature equilibration. Supplied labelled NaCl standard: 1000 mg/L, 1990 ± 20 µS/cm at 25 °C; batch label, validity, manufacturer instructions and temperature information are available. Check the standard at 25 °C following the instrument instructions; do not judge it at 20 °C against the unadjusted 25-°C label. Then bring the samples to the common experimental temperature and record temperature, range and whether compensation is enabled. Check water blank/probe and rinse between samples. Hypothesis: NaCl increases conductivity more than sucrose under these conditions. Equipment and standard checks are prerequisites for later actual execution, not measurements already performed.',
    ['B-v8-02'], 'Provide the missing standard identity, reference temperature, labelled tolerance, suitable quantitative range and verifiable temperature arrangement.')
protocol_actions(4,
    old['cases'][4]['moderatorProtocol']['observableLearnerActions']['de'] + ' Standard bei seiner Referenztemperatur prüfen; tatsächlich gemessene Proben-/Standardtemperatur, Messbereich und Kompensationsmodus dokumentieren. Überlauf ist kein gültiger Messwert.',
    old['cases'][4]['moderatorProtocol']['observableLearnerActions']['en'] + ' Check the standard at its reference temperature; document actually measured sample/standard temperature, range and compensation mode. An over-range indication is not a valid reading.',
    ['B-v8-02'], 'Make the new provision observable in the still-unperformed execution protocol.')

setup(6,
    'Freigegebene spätere Ausstattung: deionisiertes Wasser, NaCl, Saccharose, 100-mL-Messzylinder mit 1-mL-Teilung, Waage mit 0,01-g-Anzeigeauflösung, saubere Wiegeschalen/Spatel, Becher und Spülwasser. Batteriebetriebene qualitative Leitfähigkeitsanzeige plus separates quantitatives Leitfähigkeitsmessgerät: 0–2000 µS/cm bei 1-µS/cm-Anzeigeauflösung und bis mindestens 100 mS/cm bei 0,01-mS/cm-Anzeigeauflösung. Dazu Thermometer/Temperatursensor mit 0,1-°C-Auflösung und betreutes Wasserbad für gleiche Probenbedingungen 20,0 ± 0,5 °C. Temperatur vor und nach Messungen sowie Bereich/Kompensationsmodus tatsächlich notieren; Anzeigeauflösung ersetzt keine Messunsicherheit. Ein beschrifteter NaCl-Prüfstandard 1990 ± 20 µS/cm bei 25 °C (1000 mg/L) mit Charge/Gültigkeit/Temperaturangaben wird nach Geräteanleitung bei 25 °C geprüft; danach Proben wieder auf 20,0 ± 0,5 °C angleichen. Lehrkraft gibt nur die Hypothese vor: Bei gleicher Temperatur führt mehr gelöstes NaCl im untersuchten Bereich zu stärkerer Leitfähigkeit; Saccharose führt nicht zum gleichen Ionen-Effekt. Eine qualitative Anzeige allein liefert keine quantitative Untersuchung. Das ist bereitgestellte Planungsinformation, kein ausgeführter Versuch.',
    'Authorised future equipment: deionised water, NaCl, sucrose, 100-mL measuring cylinder with 1-mL divisions, balance with 0.01-g display resolution, clean weighing dishes/spatulas, beakers and rinse water. Battery-powered qualitative conductivity indicator plus a separate quantitative meter: 0–2000 µS/cm at 1-µS/cm display resolution and at least 100 mS/cm at 0.01-mS/cm resolution. Also a thermometer/temperature sensor with 0.1-°C resolution and supervised water bath for equal sample conditions of 20.0 ± 0.5 °C. Actually record temperature before/after readings and range/compensation mode; display resolution is not measurement uncertainty. A labelled NaCl check standard of 1990 ± 20 µS/cm at 25 °C (1000 mg/L), with batch/validity/temperature information, is checked at 25 °C following the meter instructions; then re-equilibrate samples to 20.0 ± 0.5 °C. The teacher supplies only the hypothesis: At equal temperature more dissolved NaCl within the investigated range leads to stronger conductivity; sucrose does not produce the same ion effect. A qualitative indicator alone is not a quantitative investigation. This supplies planning information, not a performed experiment.',
    ['B-v8-02'], 'Make independent temperature control and quantitative concentration-series apparatus explicit; retain own planning rather than supplying an accomplished experiment.')
protocol_actions(6,
    old['cases'][6]['moderatorProtocol']['observableLearnerActions']['de'] + ' Beobachtet und protokolliert werden auch Standardprüfung, tatsächliche Temperatur vor/nach der Reihe, Einhalten des Wasserbadbereichs sowie Messbereich/Kompensationsmodus. Messzylinderteilung und Waagenauflösung begrenzen die hergestellte Konzentration; keine exakte Volumetrie behaupten.',
    old['cases'][6]['moderatorProtocol']['observableLearnerActions']['en'] + ' Also observe and record the standard check, actual temperature before/after the series, water-bath conditions and range/compensation mode. Cylinder divisions and balance resolution limit prepared concentration precision; do not claim exact volumetry.',
    ['B-v8-02'], 'Bind temperature/range provision to observable actual actions and keep sample precision truthful.')
criterion(6, 2,
    old['cases'][6]['requiredAssessmentCriteria'][2]['meaning']['de'] + ' Gemessene Temperatur und Gerätebereich/Kompensationsmodus sind dokumentiert; Anzeige und quantitatives Messgerät werden unterschieden.',
    old['cases'][6]['requiredAssessmentCriteria'][2]['meaning']['en'] + ' Measured temperature and instrument range/compensation mode are documented; distinguish indicator from quantitative meter.',
    ['B-v8-02'], 'Assess the required control using actual recorded readings.')

setup(7,
    'Freigegeben für spätere Durchführung: NaCl, gleiche Becher, Wiegeschalen/Spatel, 10,0-g-Wasserportionen, Uhr und Rührstäbe; Waage mit 0,01-g-Anzeigeauflösung und vorliegenden Geräte-/Prüfangaben. Ein betreutes temperiertes Wasserbad hält die Ansätze bei 20,0 ± 0,5 °C; bereitgestelltes Thermometer oder Temperatursensor mit 0,1-°C-Auflösung prüft die tatsächliche Temperatur vor/nach Zugaben, Rühren und Wartezeit. Bei Abweichung wird angeglichen, erneut geprüft und die Abweichung notiert. Auflösung ist nicht die gesamte Unsicherheit. Hypothese: Eine endliche Salzmenge löst sich bei gleicher Temperatur in Wasser; mehr Salz kann als dauerhafter Rückstand bleiben. Untersuche unter Freigabe höchstens 5,0 g NaCl pro Portion. Kein Erhitzen oder Verdampfen. Wasserbadbereitstellung ist keine bereits durchgeführte Untersuchung.',
    'Authorised for later execution: NaCl, equal beakers, weighing dishes/spatula, 10.0-g water portions, clock and stirrers; balance with 0.01-g display resolution and instrument/check information. A supervised temperature-controlled water bath maintains samples at 20.0 ± 0.5 °C; a supplied thermometer or temperature sensor with 0.1-°C resolution checks actual temperature before/after additions, stirring and waiting. Re-equilibrate and recheck departures, recording the deviation. Resolution is not total uncertainty. Hypothesis: Only a finite amount of salt dissolves in water at equal temperature; additional salt may remain as a persistent residue. Under authorisation investigate at most 5.0 g NaCl per portion. No heating or evaporation. Provision of the bath is not an investigation already carried out.',
    ['B-v8-02'], 'Supply verification/control of the named 20-degree condition and usable mass resolution without changing the bounded saturation task.')
protocol_actions(7,
    old['cases'][7]['moderatorProtocol']['observableLearnerActions']['de'] + ' Tatsächliche Temperatur vor/nach Rühr-/Wartephasen und Zugaben messen, Wasserbadbedingungen/Abweichungen dokumentieren; vor Vergleich wieder angleichen.',
    old['cases'][7]['moderatorProtocol']['observableLearnerActions']['en'] + ' Measure actual temperature before/after stirring/waiting and additions, record bath conditions/deviations and re-equilibrate before comparisons.',
    ['B-v8-02'], 'Do not treat an initial water temperature as evidence of continued control.')
criterion(7, 2,
    'Zeit, tatsächlich gemessene Temperatur vor/nach Warte-/Rührphasen, Wasserbezugsmenge und Wiederholung sind kontrolliert und dokumentiert.',
    'Time, actually measured temperature before/after waiting/stirring, reference water amount and repeats are controlled and documented.',
    ['B-v8-02'], 'Require the missing verification in the actual raw log.')

setup(8,
    'Lehrkraft stellt nach stoffbezogener Freigabe verdünnte einprotonige Essigsäure-Proben A/B, standardisierte 0,0100-mol/L-NaOH mit Chargen-/Standardisierungsangaben, 10,00-mL-Vollpipette mit Pipettierhilfe, 25-mL-Bürette mit 0,1-mL-Teilung, standfestes Stativ mit passender Bürettenklemme, beschriftete 100-mL-Erlenmeyerkolben sowie 50-mL-Becher für die pH-Route, Messzylinder und deionisiertes Spül-/Verdünnungswasser bereit. Für die pH-Route darf ein Aliquot mit derselben dokumentierten Menge Wasser so verdünnt werden, dass Elektrode/Junktion vollständig bedeckt sind; die zugesetzte Säurestoffmenge bleibt erhalten. pH-Meter mit passender Elektrode, Temperaturfühler und Geräteanleitung; frische beschriftete Puffer pH 4,01/7,00/10,01 bei 25 °C mit Charge/Gültigkeit und Temperaturtabelle, getrennte Kalibrier-/Spülbecher. Vor Untersuchung Geräteanleitung zur Kalibration und Kontrolle befolgen; Puffer und Proben bei 25,0 ± 0,5 °C angleichen und Temperatur dokumentieren. Bereitgestelltes freigegebenes Indikatormenü mit Etiketten: Phenolphthalein-Lösung 1 % in Ethanol, Umschlag pH 8,2–9,8, farblos zu rosa/rot; Methylorange-Lösung 0,1 %, Umschlag pH 3,1–4,4, rot zu gelb-orange. Nur von der Lehrkraft festgelegte kleine Tropfenmenge verwenden; Gebinde/Betriebsanweisungen und Entsorgung sind stoffbezogen freizugeben. Phenolphthalein kann für den alkalischen Endpunkt dieser schwachen Säure passend sein; Eignung und Endpunktabweichung sind anhand der eigenen pH-Kurve zu prüfen, nicht allein aus dem Namen abzuleiten. Hypothese vorgegeben: B enthält etwa doppelt so viele Säureäquivalente pro Volumen wie A. HA + OH⁻ → A⁻ + H2O (1:1); pH-Kurve/Endpunkt und Stoffmengenbilanz leisten unterschiedliche Beiträge. Keine Verkostung/Arzneimittelanalyse. Bereitstellung und Kalibrationsvorgaben sind kein Ausführungsnachweis.',
    'After substance-specific authorisation the teacher supplies dilute monoprotic acetic-acid samples A/B, standardised 0.0100-mol/L NaOH with batch/standardisation information, 10.00-mL volumetric pipette with filler, 25-mL burette with 0.1-mL divisions, stable stand with suitable burette clamp, labelled 100-mL conical flasks and 50-mL beakers for the pH route, measuring cylinder and deionised rinse/dilution water. For the pH route, an aliquot may be diluted by the same documented water volume to cover electrode/junction fully; the added amount of acid is preserved. pH meter with suitable electrode, temperature probe and instructions; fresh labelled pH 4.01/7.00/10.01 buffers at 25 °C with batch/validity and temperature table, separate calibration/rinse beakers. Follow the instrument calibration/check instructions before investigation, equilibrate buffers/samples to 25.0 ± 0.5 °C and record temperature. Supplied authorised indicator menu with labels: phenolphthalein solution 1% in ethanol, transition pH 8.2–9.8, colourless to pink/red; methyl orange solution 0.1%, transition pH 3.1–4.4, red to yellow-orange. Use only the small drop amount specified by the teacher; containers/operating instructions and disposal require substance-specific authorisation. Phenolphthalein may suit the alkaline endpoint of this weak acid; assess suitability and endpoint bias against the own pH curve rather than inferring it from the name alone. Supplied hypothesis: B contains about twice as many acid equivalents per volume as A. HA + OH⁻ → A⁻ + H2O (1:1); pH curve/endpoint and amount balance contribute differently. No tasting/medicine analysis. Provision/calibration instructions are not an execution receipt.',
    ['B-v8-02'], 'Supply named indicator colours/ranges, a usable menu, supported burette/receiving vessels and labelled calibrated pH-route inputs.')
protocol_actions(8,
    old['cases'][8]['moderatorProtocol']['observableLearnerActions']['de'] + ' Zusätzlich sichere Bürettenhalterung, beschriftete Aufnahmegefäße und tatsächliche Pufferkalibration/Kontrollwerte samt Temperatur beobachten. Lernende begründen Indikatorwahl anhand Etikett und eigener Kurve, notieren qualitative Farbe getrennt von pH/Volumen; gleiche dokumentierte Wasserzugabe verändert das Säurealiquot nicht.',
    old['cases'][8]['moderatorProtocol']['observableLearnerActions']['en'] + ' Also observe secure burette support, labelled receiving vessels and actual buffer calibration/check readings with temperature. Learners justify indicator choice from label and own curve and record qualitative colour separately from pH/volume; the same documented water addition preserves the acid aliquot.',
    ['B-v8-02'], 'Make supplied route information observable without taking over the independently chosen plan.')
both(8, 'expectedAnswer',
    old['cases'][8]['expectedAnswer']['de'] + ' Die Indikatorwahl nutzt den angegebenen Umschlagsbereich und die eigene Kurve: Methylorange schlägt in dieser schwachen-Säure-Titration vor dem alkalischen Äquivalenzbereich um; Phenolphthalein verlangt einen kontrollierten ersten schwachen Umschlag und Prüfung der Endpunktabweichung. Kalibration mit aktuellen Puffern wird tatsächlich protokolliert; ihre Nominalwerte sind keine Probenmessung.',
    old['cases'][8]['expectedAnswer']['en'] + ' Indicator choice uses the stated transition range and own curve: methyl orange changes before the alkaline equivalence region in this weak-acid titration; phenolphthalein requires a controlled first faint colour change and assessment of endpoint bias. Actually log calibration with current buffers; their nominal values are not sample readings.',
    ['B-v8-02'], 'Reconcile answer guidance with newly supplied choice information and keep actual calibration separate.')
criterion(8, 0,
    old['cases'][8]['requiredAssessmentCriteria'][0]['meaning']['de'] + ' Indikatorwahl verwendet Identität, Umschlagsbereich/Farbe und eigene pH-Kurve; pH-Kalibration wird nachvollziehbar dokumentiert.',
    old['cases'][8]['requiredAssessmentCriteria'][0]['meaning']['en'] + ' Indicator choice uses identity, transition range/colour and own pH curve; pH calibration is traceably documented.',
    ['B-v8-02'], 'Assess the specified supplied labels/calibration without introducing an extra hypothesis task.')

setup(9,
    'Freigegebenes betreutes Analysenkit für spätere echte Ausführung: ausdrücklich Brilliant Blue FCF / Acid Blue 9 (CAS 3844-45-9); fertig hergestellte verdünnte wässrige Blindprobe und Standards 0/2/4/6 mg/L sowie Probe U mit unbekannter Konzentration, bekannten Stoff-/Chargenangaben. Kein Lernender wiegt Farbstoffpulver ein. Batteriebetriebenes Photometer bei etwa 630 nm, passende 1-cm-Küvetten, beschriftete Proben-/Spülgefäße, deionisiertes Verdünnungswasser, getrennte saubere 10,00-mL-Vollpipetten (Fehlergrenze ±0,02 mL) mit Pipettierhilfen und 20,00-mL-Messkolben (Fehlergrenze ±0,02 mL, USP-zertifizierte Geräte oder dokumentiertes gleichwertiges Gerät). Gerätelabels, Referenztemperatur und Auslauf-/Warteanleitung liegen bei; erst gefüllter Messkolben mit 10,00 mL Aliquot plus Auffüllen bis 20,00 mL nach Mischen liefert den nominalen Verdünnungsfaktor 2. Pipettierhilfe allein ist kein Volumenmessgerät. Lehrmodellkalibration A = 0,010 + 0,080·c (c in mg/L), nur 0–6 mg/L; Hypothese: U liegt bei 3–4 mg/L. Anbieter-Spektraldaten nennen ein Maximum nahe 629 nm in ihrer Referenzlösung; das ist keine Sicherheitsfreigabe oder tatsächliche Kit-Kalibration. Eigene tatsächlich gemessene Standards müssen bei echter Untersuchung die synthetische Gleichung ersetzen; Blindwert, Gerätewellenlänge, Küvettenorientierung und Wiederholungen dokumentieren. Aktuelle Betriebsanweisung/Gefährdungsbeurteilung und lokale Entsorgung sind vor Durchführung zwingend. Diese Zusammenstellung behauptet keine erfolgte Ausführung.',
    'Authorised supervised analytical kit for later actual execution: explicitly Brilliant Blue FCF / Acid Blue 9 (CAS 3844-45-9); prepared dilute aqueous blank and 0/2/4/6 mg/L standards and sample U with unknown concentration, known substance/batch information. Learners do not weigh dye powder. Battery-powered photometer at approximately 630 nm, suitable 1-cm cuvettes, labelled sample/rinse vessels, deionised dilution water, separate clean 10.00-mL volumetric pipettes (error limit ±0.02 mL) with fillers and 20.00-mL volumetric flasks (error limit ±0.02 mL, USP-certified apparatus or documented equivalent). Instrument labels, reference temperature and delivery/wait instructions are supplied; a flask containing a 10.00-mL aliquot diluted to the 20.00-mL mark and mixed gives the nominal dilution factor 2. A pipette filler alone is not a volumetric instrument. Teaching-model calibration A = 0.010 + 0.080·c (c in mg/L), valid only at 0–6 mg/L; hypothesis: U is at 3–4 mg/L. Supplier spectral data give a maximum near 629 nm in their reference solution; this is neither safety authorisation nor actual kit calibration. Own actually measured standards must replace the synthetic equation in real investigation; record blank, instrument wavelength, cuvette orientation and repeats. Current operating instructions/hazard assessment and local disposal are mandatory before execution. This provision claims no execution already performed.',
    ['B-v8-02', 'A-V8-04'], 'Provide actual volumetric instruments/labels for twofold dilution and remove duplicated substance text while keeping identity/wavelength/calibration limits.')
protocol_actions(9,
    old['cases'][9]['moderatorProtocol']['observableLearnerActions']['de'] + ' Wenn Verdünnung nötig ist, Aliquot mit bereitgestellter Vollpipette übertragen, Messkolben bis Marke auffüllen und mischen; tatsächliche Volumina/Labels und Faktor im eigenen Log festhalten, danach nur innerhalb der echten Kalibration messen und zurückrechnen.',
    old['cases'][9]['moderatorProtocol']['observableLearnerActions']['en'] + ' If dilution is needed, transfer the aliquot using the supplied volumetric pipette, fill the flask to its mark and mix; log actual volumes/labels and factor, then measure only within actual calibration and back-calculate.',
    ['B-v8-02'], 'Bind apparatus to conditional actual dilution, not fabricated performed volumes.')
both(9, 'transfer',
    'Begründe für den bereitgestellten Modellwert A = 0,810 eine zweifache Verdünnung: 10,00 mL Aliquot im 20,00-mL-Messkolben bis Marke auffüllen und mischen; erläutere die Gerätefehlergrenzen. Im Lehrmodell wäre A der verdünnten Probe etwa 0,410, cverdünnt = 5,0 mg/L, Rückrechnung ×2; die unverdünnte Extrapolation ist ungültig. Diese Modellrechnung ist keine tatsächliche Verdünnung/Messung. Eine echte Ausführung verlangt Freigabe, eigenen Volumenlog und eine neue In-Bereich-Messung mit eigener echter Kalibration.',
    'For the supplied model value A = 0.810 justify a twofold dilution: dilute a 10.00-mL aliquot to the mark in a 20.00-mL flask and mix; explain instrument error limits. In the teaching model the diluted sample would have A about 0.410, cdiluted = 5.0 mg/L and back-calculation ×2; the undiluted extrapolation is invalid. This model calculation is not actual dilution/measurement. Actual execution requires authorisation, own volume log and a new in-range reading using own actual calibration.',
    ['B-v8-02'], 'Make the requested dilution executable with a defined volume ratio while not pretending model readings are actual calibration.')
criterion(9, 2,
    old['cases'][9]['requiredAssessmentCriteria'][2]['meaning']['de'] + ' Bei erforderlicher echter Verdünnung sind eigene Aliquot-/Endvolumina, Geräteangaben und Rückrechnungsfaktor dokumentiert.',
    old['cases'][9]['requiredAssessmentCriteria'][2]['meaning']['en'] + ' Where actual dilution is required, own aliquot/final volumes, instrument information and back-calculation factor are recorded.',
    ['B-v8-02'], 'Only require actual dilution records when the actual measurement demands dilution.')

both(10, 'transfer',
    'Separat bereitgestellte Zusatznotiz R2 (ebenfalls ein fiktiver SkillPilot-Lehrdatensatz, keine echte Messung): Am 7. Oktober 2026 um 10:15 Uhr wird ein neuer unabhängiger Ansatz W3 geprüft, Beobachter N, Thermometer TH1 mit 0,1-°C-Anzeige, Wassertemperatur 20,3 °C vor Zuckerzugabe. Ergänze diese Notiz mit Herkunft R2, Zeitpunkt, neuem Probenbezug und Messbedingung als separates Ereignis. Lass die alte R1-Tabelle unverändert; R2 bestätigt weder nachträglich Temperaturen der alten Proben noch eine eigene Durchführung. Eine echte neue Messung darf nur mit eigenem tatsächlich beobachtetem Ansatz, Gerät und Log als solche ergänzt werden.',
    'Separately supplied note R2 (also a fictional SkillPilot teaching dataset, not a real measurement): On 7 October 2026 at 10:15 a new independent sample W3 is checked, observer N, thermometer TH1 with 0.1-°C display resolution, water temperature 20.3 °C before sugar addition. Append this note as a separate event with R2 provenance, time, new sample identity and measurement condition. Preserve the old R1 table; R2 neither retrospectively verifies old sample temperatures nor records own execution. An actual new measurement may only be appended as such for an own genuinely observed sample, instrument and log.',
    ['B-v8-03'], 'Supply a separate traceable note and ask documentation rather than an impossible retrospective measurement of fictional R1 samples.')

both(13, 'suppliedMaterial',
    'Physikalisch plausibel skalierte synthetische Lehrdaten bei 25 °C: c(NaCl) = 0,0/0,5/1,0/1,5 g/L; Leitfähigkeit κ = 3/1020/1990/2950 µS/cm. Eine Saccharoseprobe mit 1,0 g/L liefert 4 µS/cm. Die Blindprobe 3 und Vergleichsprobe 4 werden nicht mitskaliert. Als Plausibilitätsanker liefert ein herstellerbeschrifteter 1000-mg/L-NaCl-Standard 1990 µS/cm bei 25 °C; die Reihe bleibt eine eigene Lehrmodellreihe, keine echten Lernendenmessungen oder zertifizierte Kalibration. Hypothese: Mehr NaCl erhöht in dieser Reihe κ; nicht jede gelöste Substanz hat dieselbe Wirkung.',
    'Physically plausibly scaled synthetic teaching data at 25 °C: c(NaCl) = 0.0/0.5/1.0/1.5 g/L; conductivity κ = 3/1020/1990/2950 µS/cm. A sucrose sample at 1.0 g/L gives 4 µS/cm. The blank 3 and comparison 4 are not scaled. A manufacturer-labelled 1000-mg/L NaCl standard gives 1990 µS/cm at 25 °C as a plausibility anchor; this remains an own teaching-model series, not real learner measurements or certified calibration. Hypothesis: More NaCl raises κ in this series; not every dissolved substance has the same effect.',
    ['A-V8-01', 'B-v8-01'], 'Correct the NaCl concentration/conductivity pairing while preserving independent water/sucrose blanks and bounded ion reasoning.')
both(17, 'suppliedMaterial',
    'Neu skaliertes synthetisches Lehrmodell zur Leitfähigkeit zweier NaCl-Proben: A 1,0 g/L bei 20 °C: 1800 µS/cm; B 1,0 g/L bei 35 °C: 2300 µS/cm. Messgerät ohne Temperaturkompensation; Kontrolle A bei 35 °C: 2298 µS/cm. Behauptung: B enthält deutlich mehr Salz. Für diese modellierte Messreihe bleibt die grobe Wiederholstreuung einer Einzelmessung ausdrücklich ±3 µS/cm; sie wurde nicht mit Konzentrations-/Leitfähigkeitskorrektur multipliziert und ist keine vollständige Messunsicherheit. Die Kontrollzahl 2298 ist gezielt neu angesetzt, damit temperaturgleiche Werte 2 µS/cm auseinanderliegen; es werden keine echten Messungen behauptet.',
    'Rescaled synthetic teaching model for conductivity of two NaCl samples: A 1.0 g/L at 20 °C: 1800 µS/cm; B 1.0 g/L at 35 °C: 2300 µS/cm. Meter lacks temperature compensation; control A at 35 °C: 2298 µS/cm. Claim: B contains much more salt. For this modelled measurement series one measurement explicitly retains the rough ±3 µS/cm repeat scatter; it was not multiplied with the concentration/conductivity correction and is not full measurement uncertainty. The control value 2298 is deliberately newly set so the matched-temperature values differ by 2 µS/cm; no real measurements are claimed.',
    ['A-V8-01', 'B-v8-01'], 'Correct named NaCl absolute scale and deliberately reconcile matched control while retaining the original independent scatter assumption.')
both(17, 'expectedAnswer',
    old['cases'][17]['expectedAnswer']['de'].replace('50-µS/cm-Differenz', '500-µS/cm-Differenz'),
    old['cases'][17]['expectedAnswer']['en'].replace('50-µS/cm difference', '500-µS/cm difference'),
    ['A-V8-01', 'B-v8-01'], 'Recompute the unmatched difference; the matched difference remains 2 within the preserved rough 3 scatter.')
both(43, 'suppliedMaterial',
    'Sachblatt: κ hängt von Art/Konzentration beweglicher Ionen und Temperatur ab. Dasselbe korrigierte synthetische Archivmodell wie im Gültigkeitsfall: A/B je 1,0 g/L NaCl bei 20/35 °C haben 1800/2300 µS/cm; A bei 35 °C 2298 µS/cm, grobe Wiederholstreuung ±3 µS/cm. Partnerstart: „B muss salziger sein, weil der Wert höher ist.“ Die tatsächliche Partnerreaktion ist im Material noch nicht vorhanden. Dies sind Lehrmodelldaten, keine echte Dialog- oder Messleistung.',
    'Fact sheet: κ depends on type/concentration of mobile ions and temperature. The same corrected synthetic archive model as the validity case: A/B each 1.0 g/L NaCl at 20/35 °C have 1800/2300 µS/cm; A at 35 °C has 2298 µS/cm, rough repeat scatter ±3 µS/cm. Partner opener: “B must be saltier because its reading is higher.” The actual partner reply is not yet in the material. These are teaching-model data, not an actual dialogue or measurement performance.',
    ['A-V8-01', 'B-v8-01'], 'Use the same corrected absolute numbers and control/scatter context in the actual dialogue stimulus.')
both(44, 'transfer',
    'Neue bereitgestellte qualitative Lehrbeobachtung im gleichen Stoffkontext: Beim Lösen von NaCl in zunächst etwa 25 °C warmem Wasser zeigt sich eine kleine Abkühlung, passend zu Wärmeaufnahme im betrachteten verdünnten Bereich. Welche energetische Aussage kann dein Ladungs-/Beweglichkeitsmodell bisher nicht leisten? Begründe zusätzlichen Energie-/Wechselwirkungsbedarf, ohne aus dieser Beobachtung jede Salzlösung oder Temperatur zu verallgemeinern. Dies ist ein neuer Modellstimulus, kein eigener Messnachweis.',
    'A newly supplied qualitative teaching observation in the same substance context: Dissolving NaCl in water initially near 25 °C shows slight cooling, consistent with heat uptake in the considered dilute range. Which energetic statement can your charge/mobility model not yet support? Justify additional energy/interaction information without generalising this observation to every salt solution or temperature. This is a new model stimulus, not an own measurement receipt.',
    ['A-V8-02'], 'Replace unqualified heat release with bounded near-ambient NaCl heat uptake while retaining the model-limit transfer.')

both(16, 'expectedAnswer',
    old['cases'][16]['expectedAnswer']['de'] + ' Weil X/Y hier keine Stoffidentitäten oder Trennmerkmale haben, darf kein benanntes Gerät ungeprüft als X-spezifisch gelten. Akzeptabel ist eine konkrete kontrollierte Wiederholung mit dokumentierter Verdünnung/Temperatur und eine begründete Planung zur Validierung einer ergänzenden Methode an bekannten X-, Y- und Blindproben. Für einen eindeutigen X-Nachweis muss deren Spezifität erst belegt werden; Wiederholung des unspezifischen Tests allein identifiziert X weiterhin nicht.',
    old['cases'][16]['expectedAnswer']['en'] + ' Because X/Y have no identities or discriminating properties here, no named instrument may be presumed X-specific. Accept a concrete controlled repeat with documented dilution/temperature and a justified plan to validate an additional method against known X, Y and blank samples. Its specificity must first be established for unique proof of X; repeating the non-specific test alone still does not identify X.',
    ['A-V8-03'], 'Bound the already-kept assessment to method validation rather than silently assuming an unsupported X-specific instrument.')
criterion(16, 2,
    old['cases'][16]['requiredAssessmentCriteria'][2]['meaning']['de'] + ' Eine Folgemethode ist als zu validierender Vorschlag zu begründen; unbekannte X/Y-Eigenschaften begründen keine bereits bewiesene Gerätespezifität.',
    old['cases'][16]['requiredAssessmentCriteria'][2]['meaning']['en'] + ' Justify a follow-up method as a proposal requiring validation; unknown X/Y properties do not establish instrument specificity.',
    ['A-V8-03'], 'Preserve the accepted improvement route with its actual epistemic limits.')
both(45, 'suppliedMaterial',
    old['cases'][45]['suppliedMaterial']['de'].replace('Hypothese: Gleiche Atomarten können wegen Bindungen/Anordnung unterschiedliche Eigenschaften ergeben; polare Wassermoleküle können Ionen umgeben.', 'Hypothese für diese Station: Polare Wassermoleküle können Ionen aufgrund ihrer Ladungs-/Dipolorientierung umgeben. Diese Station prüft die bereitgestellte Wasser-Ionen-Wechselwirkungsregel; sie liefert keinen eigenständigen Stoffvergleich gleicher Atomarten mit verschiedenen Bindungen/Anordnungen.'),
    old['cases'][45]['suppliedMaterial']['en'].replace('Hypothesis: The same atom types can show different properties because of bonding/arrangement; polar water molecules can surround ions.', 'Hypothesis for this station: Polar water molecules can surround ions because of their charge/dipole orientation. This station tests the supplied water-ion interaction rule; it does not independently compare substances with the same atom types but different bonding/arrangements.'),
    ['A-V8-05'], 'Narrow the unillustrated introductory hypothesis to the actually supplied interaction model; preserve required analogue/digital use and model limits.')

write(DEST.name, new)
profile_file = BASE / 'twenty-six-positive-profiles.de-en.author-candidate.json'
profiles = json.loads(profile_file.read_text())['profiles']
write('actual-profile-to-v9-material-review-routing.json', {
    'schemaVersion': 1, 'role': 'author review routing; not native P evidence',
    'unchangedV8ProfilesFile': binding(profile_file), 'literalDescriptionsUnchanged': True,
    'assessmentMaterialOverrideForThisReviewOnly': binding(DEST),
    'originalV8ProfileMaterialPathsAreHistoricalAndNotRewritten': True,
    'profiles': [{'candidateKey': p['candidateKey'], 'goalId': p['goalId'],
                  'profileIndexZeroBased': i,
                  'literalDescriptionBindingSha256': digest(json.dumps(p['descriptionBindingCandidate'], ensure_ascii=False, sort_keys=True).encode()),
                  'caseKeys': p['caseKeys'], 'newMaterialFile': str(DEST.relative_to(ROOT)),
                  'independentMaterialFollowupStatus': 'pending'} for i, p in enumerate(profiles)],
    'all1646OriginalNationalSourceObligationsRetainedWithUnchangedActualStatus': True,
    'nativePositiveUnderstandingEvidenceV2Approval': False,
    'strictCompletionsAdded': 0, 'restoredActiveBindings': 0, 'activeWrites': 0,
    'humanApproval': False, 'humanTrial': False})
write('literal-field-delta-and-finding-response.author.json', {
    'schemaVersion': 1, 'role': 'author proposed finding response, not independent closure',
    'sourceFile': binding(SOURCE), 'correctedFile': binding(DEST),
    'authoredAtUTC': FROZEN_TIME, 'affectedCaseIndicesZeroBased': sorted({c['caseIndexZeroBased'] for c in corrections}),
    'affectedCaseCount': len({c['caseIndexZeroBased'] for c in corrections}),
    'changedMaterialLeafFields': len(corrections), 'corrections': corrections,
    'rootMetadataOnlyChanges': ['/artifactKind', '/authoredAtUTC'],
    'unchangedV7V8DescriptionsNotReviewedAgain': True,
    'independentAandBTargetedFollowupsRequired': True, 'strictCompletionsAdded': 0,
    'restoredActiveBindings': 0, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'created': str(DEST.relative_to(ROOT)), 'affectedCases': len({c['caseIndexZeroBased'] for c in corrections}),
                  'changedMaterialLeafFields': len(corrections), 'caseCount': len(cases), 'profileCount': len(profiles)}))
