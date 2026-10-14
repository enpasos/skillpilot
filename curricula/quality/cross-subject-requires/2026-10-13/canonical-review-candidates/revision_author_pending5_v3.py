# SPDX-License-Identifier: Apache-2.0
"""Create fresh inert author artifacts; never modify a native receipt or graph."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('tmp/cross-subject-requires')
NAME = 'physics-pending5-revision-author-20261013-v3'
AGENT = '/root/physics_pending5_revision'
AUTHOR = 'Codex / revision author ' + AGENT
IDS = [
    '09029573-864f-40ca-bf8a-cee7bf6dcb73',
    'c1c71daa-042b-4f4c-8c31-0ac366f5149e',
    '839ecc8f-3a60-418b-bc92-64bfeef33824',
    'f524f05c-4456-4fc3-a1f7-f40741fc1f16',
    'e713dc34-beeb-5807-8a90-f872e049aa4e',
]
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
fp = lambda o: 'sha256:' + hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
write = lambda p, o: Path(p).open('x').write(json.dumps(o, ensure_ascii=True, indent=2) + '\n')
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

old_context_path = ROOT / 'physics-pending20-revision-author.context.exact.json'
old_author_path = ROOT / 'physics-pending20-revision-author-v1.author-decisions.json'
old_amendment_path = ROOT / 'physics-pending20-revision-author-v1.profile-amendments.candidate.json'
old_packet_path = ROOT / 'physics-pending20-revision-author-v1.proposal-candidate.json'
peer_path = ROOT / 'physics-pending20-revision-author-v1.parallel-independent-review.json'
erratum_path = ROOT / 'physics-pending20-newton-momentum-minimality.parallel-independent-erratum.json'
peer_manifest_path = ROOT / 'physics-pending20-plus-energy-v2.parallel-independent-review.manifest.json'
math_read_path = ROOT / (NAME + '.math-native-read.exact.json')
math_gap_read_path = ROOT / (NAME + '.math-native-gap-current-read.exact.json')
context_path = ROOT / (NAME + '.context.exact.json')
profile_path = ROOT / (NAME + '.profile-amendments.candidate.json')
author_path = ROOT / (NAME + '.author-decisions.json')
assert sha(erratum_path) == 'sha256:67ae8e5de48b11fc1a51f527b6e6e94eb87938709d6c1bef9df9852c3da3719a'

old_context = read(old_context_path)
old_author = read(old_author_path)
old_amendments = read(old_amendment_path)
old_packet = read(old_packet_path)
peer = read(peer_path)
erratum = read(erratum_path)
physics_path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
math_path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
math = {g['id']: g for g in read(math_path)['goals']}
physics = {g['id']: g for g in read(physics_path)['goals']}
records = [copy.deepcopy(next(r for r in old_context['records'] if r['goalId'] == gid)) for gid in IDS]
for r in records:
    assert fp(physics[r['goalId']]) == r['currentCanonicalGoalSha256']
    assert sha(r['actualNativePReviewPath']) == r['actualNativePReviewFileSha256']

math_owners = read(math_read_path)
gap_owner = read(math_gap_read_path)
math_owners[gap_owner['goal']['id']] = {k: gap_owner[k] for k in ['configPath', 'reviewPath', 'record']}
for gid, owner in math_owners.items():
    owner['goal'] = math[gid]
    owner['goalSha256'] = fp(math[gid])
    owner['configFileSha256'] = sha(owner['configPath'])
    owner['reviewFileSha256'] = sha(owner['reviewPath'])
    owner['recordSha256PythonCodepointJson'] = fp(owner['record'])
    owner['profileBodySha256'] = fp(owner['record']['profile'])
    owner['readLanguages'] = ['de', 'en']
    owner['readExtent'] = 'Full actual current central P expectations, coverage, variation axes and every application case; full current goal description and applicability.'

he_path = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json'
by_path = 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
legacy_path = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_PHYSIK.de.json.snapshot'
he = read(he_path)
by = read(by_path)
legacy = read(legacy_path)
source_ids = {
    he_path: ['he-phys-sekii-e-1-b09-a01-74f473d9', 'he-phys-sekii-e-2-b09-a01-cc89cbd5', 'he-phys-sekii-e-2-b12-a01-a1fb7ddb'],
    by_path: ['c1facc77-5590-5495-9257-48ff27195dd7', '46a5bb03-8eb6-5b71-a3c4-a66fc173e314', '713ad139-bcb8-5a71-a520-3f194a0f8754'],
}
legacy_ids = ['17dcaf0e-088d-49d0-8c79-ae2cce5611d4', '75c8920f-757e-47bf-be3a-a5901eb52334', 'f9c16720-ee4e-4bd4-b4a5-e9c12b910fab', '0c7a1a3d-ca41-4795-8b60-0ba555e1b804', '3ab3f788-deaa-4140-8fe0-eb30f39eb563']

profiles = {a['goalId']: copy.deepcopy(a['proposedProfile']) for a in old_amendments['amendments'] if a['goalId'] in IDS}

def expectations(gid):
    return {e['id']: e for e in profiles[gid]['expectations']}

def cases(gid):
    return {c['id']: c for c in profiles[gid]['applicationCaseBriefs']}

def set_observable(e, de, en):
    e['observablePerformanceDe'] = de
    e['observablePerformanceEn'] = en

# 8: the source requires real acquisition; an analysis-only dataset is insufficient.
gid = IDS[0]
p = profiles[gid]
set_observable(expectations(gid)['selected-blind-review-core'],
    'Die lernende Person plant eine sichere beaufsichtigte Fallmessung, führt die Datenerhebung durch und protokolliert selbst Rohdaten samt Orts-/Zeitkalibrierung. Sie stellt diese Daten grafisch dar, bestimmt daraus g mit Einheit und begründeter Unsicherheit, diskutiert die Abweichung zum Literaturwert und formuliert ein konsistentes Zeit-Ort-Gesetz mit Anfangsbedingungen. Ein fertig bereitgestellter Datensatz ersetzt die erforderliche Datenerhebung nicht.',
    'The learner plans a safe supervised free-fall measurement, carries out data acquisition and independently records raw data with position/time calibration. They graph the data, determine g with units and justified uncertainty, discuss deviation from a literature value and formulate a consistent time-position law with initial conditions. A ready-made supplied dataset does not replace the required acquisition.')
p['expectations'].append({
    'id': 'required-acquisition-and-reference-comparison',
    'essentialUnderstandingDe': 'Experimentelle Datenerhebung und Auswertung sind verschiedene Leistungen: Kalibrierung, Zeitbezug, Wiederholungen und Rohdaten begründen erst die Bestimmung von g und deren Messunsicherheit. Ein Literaturwert dient nach der eigenen Bestimmung zum Vergleich, nicht als Messresultat.',
    'essentialUnderstandingEn': 'Experimental acquisition and analysis are different performances: calibration, time reference, repetitions and raw data support the determination of g and its uncertainty. A literature value is used for comparison after the independent determination, rather than as the measurement result.',
    'observablePerformanceDe': 'Die lernende Person dokumentiert Aufbau und Durchführung, sammelt nachvollziehbar eigene Orts-/Zeitbeobachtungen und begründet Kalibrierung sowie Wiederholungen. Sie gewinnt g aus diesen Beobachtungen und erklärt mindestens eine plausible Ursache der Abweichung zum Referenzwert. Fehlt echte Datenerhebung, bleibt dieser Aspekt offen.',
    'observablePerformanceEn': 'The learner documents setup and execution, collects traceable position/time observations and justifies calibration and repetitions. They infer g from these observations and explain at least one plausible cause of deviation from the reference. Without actual acquisition this aspect remains open.',
})
p['coverageExpectations']['requiredExpectationIds'].append('required-acquisition-and-reference-comparison')
c = cases(gid)['steel-ball-video-fit']
c['taskDemandDe'] = 'Plane und führe unter Aufsicht eine Fallmessung einer Stahlkugel aus geringer sicherer Höhe mit weichem Auffangbereich durch. Stelle Ortsmaßstab und Zeitkalibrierung her, dokumentiere mindestens zwei Wiederholungen und entnimm der eigenen Aufnahme selbst die Orts-/Zeit-Rohdaten. Wähle nach oben positiv, stelle die Daten grafisch dar und bestimme g ohne vorgegebenen Fitparameter. Gib Messunsicherheit an, vergleiche danach mit dem angegebenen lokalen Literaturwert und formuliere das Zeit-Ort-Gesetz mit Anfangshöhe und Anfangsgeschwindigkeit. Die Definitionshilfen v ≈ Δs/Δt und s(t)=s₀+v₀t+at²/2 dürfen benutzt werden; der gemessene Beschleunigungswert bleibt unbekannt. Ein fremder fertiger Datensatz allein erfüllt die Datenerhebung nicht.'
c['taskDemandEn'] = 'Plan and carry out a supervised steel-ball drop from a low safe height with a soft catching area. Establish position and time calibration, document at least two repetitions and independently extract raw position/time data from the recording you acquired. Choose upward as positive, graph the data and determine g without a supplied fit parameter. State measurement uncertainty, then compare with the supplied local literature reference and formulate the time-position law with initial height and velocity. The definition aids v ≈ Δs/Δt and s(t)=s₀+v₀t+at²/2 may be used; the measured acceleration remains unknown. A ready-made external dataset alone does not satisfy acquisition.'
c['expectedPerformanceDe'] = 'Die lernende Person liefert nachvollziehbare eigene Rohdaten und Kalibrierung, bestimmt aus geeigneter grafischer Auswertung die Beschleunigung a<0 und g=|a|, trennt Messwert vom Literaturwert und erklärt Unsicherheit beziehungsweise Modellabweichung. Sie formuliert s(t) mit konsistenten Anfangsbedingungen. Eine v-t-Gerade ist eine zulässige Route; eine fachlich begründete andere grafische Auswertung bleibt möglich.'
c['expectedPerformanceEn'] = 'The learner provides traceable acquired raw data and calibration, infers a<0 and g=|a| from a suitable graphical analysis, distinguishes the measurement from the literature reference and explains uncertainty or model deviation. They formulate s(t) with consistent initial conditions. A v-t straight line is a permitted route; another physically justified graphical analysis remains possible.'

# 10: preserve mandatory simple calculations without forcing trigonometry/calculus.
gid = IDS[1]
set_observable(expectations(gid)['selected-blind-review-core'],
    'Die lernende Person legt System und Wegrichtung fest, wählt Arbeitsvorzeichen selbst aus Kraft- und Wegrichtung und berechnet für einen einfachen Vorgang mindestens eine Arbeit und die Nettobilanz mit Einheit. Sie deutet die zugehörige Energieänderung und macht weitere Übertragungen sowie die Modellgrenze sichtbar. Die Beträge, Vorzeichen und Nettobilanz werden nicht als fertige Lösung vorgegeben.',
    'The learner defines the system and displacement direction, independently selects work signs from force and displacement directions and calculates at least one work and the net balance for a simple process with units. They interpret the associated energy change and make other transfers and model limits explicit. Work magnitudes, signs and the net balance are not supplied as a finished solution.')
set_observable(expectations(gid)['variable-force-work-is-signed-area'],
    'Die lernende Person ordnet nicht vorzeichenbehafteten Teilflächen einer Kraft-Weg-Kurve selbst die richtigen Vorzeichen zu, berechnet deren Nettowirkung und verbindet sie mit der Energiebilanz des gewählten Systems. Die geometrische Teilflächengröße darf gegeben sein; Vorzeichenwahl, Nettosumme und physikalische Deutung bleiben eigene Leistungen. Spitzenkraft mal Gesamtweg wird als allgemeine Regel verworfen.',
    'The learner independently assigns signs to unsigned partial areas of a force-displacement graph, calculates their net effect and connects it to the energy balance of the chosen system. Geometric partial-area magnitudes may be supplied; sign choices, the net sum and physical interpretation remain independent performances. Peak force times total displacement is rejected as a general rule.')
c = cases(gid)['sled-oblique-pull-and-friction']
c['taskDemandDe'] = 'Ein im mechanischen Modell als Massepunkt behandelter Schlitten wird 2,5 m nach Osten gezogen. Vom schrägen Seil ist nur der geometrisch bestimmte Betrag der konstanten Längskomponente 12,0 N gegeben; die Gleitreibung hat konstanten Betrag 4,0 N. Zeichne Kraft- und Wegrichtungen, lege das Schlitten-System fest und bestimme selbst Vorzeichen und Beträge beider Arbeiten sowie ihre Nettobilanz. Deute die Änderung der kinetischen Energie in diesem Modell und den fehlenden Arbeitsbeitrag des senkrechten Seilanteils. Ändere anschließend die Systemgrenze zu Schlitten plus Unterlage und erläutere die Rolle der Reibung und thermischer Energie. Die Physikbeziehung W=F_parallel·Δs wird erklärt; trigonometrische Zerlegung ist kein zusätzliches Pflichtverfahren. Es werden keine vorzeichenbehafteten Arbeiten und kein Nettoergebnis geliefert.'
c['taskDemandEn'] = 'A sled treated as a point mass in the mechanical model is pulled 2.5 m east. Only the geometrically determined magnitude 12.0 N of the constant longitudinal rope-force component is supplied; sliding friction has constant magnitude 4.0 N. Draw force and displacement directions, define the sled system and independently determine both work signs, magnitudes and their net balance. Interpret the change in kinetic energy in this model and the absent work contribution of the perpendicular rope component. Then expand the system to sled plus surface and explain friction and thermal energy. The Physics relation W=F_parallel·Δs is explained; trigonometric resolution is not an additional compulsory procedure. Signed work values and the net result are withheld.'
c['expectedPerformanceDe'] = 'Für die festgelegte Wegrichtung ergibt die lernende Person W_Seil=+30 J, W_Reibung=−10 J und W_netto=+20 J. Sie begründet die Vorzeichen physikalisch, führt die eigene einfache Rechnung nachvollziehbar aus und deutet +20 J als Änderung der kinetischen Energie des Massepunktmodells. Für Schlitten plus Unterlage ist Reibung innerlich; die geringere kinetische Energiezunahme widerspricht deshalb nicht der Energieerhaltung unter Einbeziehung der thermischen Energie.'
c['expectedPerformanceEn'] = 'For the chosen displacement direction, the learner obtains W_rope=+30 J, W_friction=−10 J and W_net=+20 J. They justify signs physically, show the independent simple calculation and interpret +20 J as the kinetic-energy change in the point-mass model. For sled plus surface friction is internal; the smaller kinetic-energy gain does not contradict energy conservation when thermal energy is included.'
c = cases(gid)['spring-block-boundary-switch']
c['taskDemandDe'] = 'Ein an einer Feder befestigter Klotz startet aus einer ausgelenkten Lage und bewegt sich über die entspannte Lage hinaus. Eine Kraft-Weg-Kurve der Längskraft ist mit einem Bereich oberhalb und einem Bereich unterhalb der Achse gegeben; nur die geometrischen Flächenbeträge 6,75 J und 2,25 J sind genannt. Ordne selbst die Vorzeichen zu, berechne die Nettowirkung und bilanziere denselben Vorgang einmal für den Klotz und einmal für Klotz plus Feder. Begründe, warum Spitzenkraft mal Gesamtweg hier keine Arbeitsregel ist. Keine vorzeichenbehaftete Teil- oder Nettoarbeit ist angegeben.'
c['taskDemandEn'] = 'A block attached to a spring starts from a displaced position and moves beyond the unstretched position. Its longitudinal force-displacement graph has one region above and one below the axis; only geometric area magnitudes 6.75 J and 2.25 J are stated. Independently assign signs, calculate the net effect and balance the same process for the block and for block plus spring. Explain why peak force times total displacement is not a work rule here. Signed partial and net work are withheld.'
c['expectedPerformanceDe'] = 'Die lernende Person gewinnt aus der Kurve die Teilbeiträge +6,75 J und −2,25 J und berechnet +4,50 J. Sie deutet dies als äußere Arbeit beziehungsweise kinetische Energieänderung am Klotz; für Klotz plus Feder sinkt die interne elastische Energie entsprechend. Sie begründet Systemgrenze und Bilanz eigenständig. Die Flächenbeträge als Eingangsdaten ersetzen keine Vorzeichenwahl, Nettorechnung oder Energiezuordnung.'
c['expectedPerformanceEn'] = 'The learner obtains +6.75 J and −2.25 J from the graph signs and calculates +4.50 J. This is interpreted as external work or kinetic-energy change for the block; for block plus spring internal elastic energy decreases correspondingly. The system boundary and balance are independently justified. Input area magnitudes replace neither sign selection, net calculation nor energy assignment.'

# 25: a genuine non-collinear motion witness is required by the exact BY mapping.
gid = IDS[2]
p = profiles[gid]
p['expectations'].append({
    'id': 'two-dimensional-inference-and-energy-distinction',
    'essentialUnderstandingDe': 'Bei nicht kollinearen Bewegungen muss der Gesamtimpuls als gerichtete Summe geprüft werden. Erhaltung des Impulsvektors verlangt keine Erhaltung der kinetischen Energie bei jedem Stoß; die Gesamtenergie einschließlich innerer Energie bleibt davon zu unterscheiden.',
    'essentialUnderstandingEn': 'For non-collinear motion total momentum must be checked as a directed sum. Conservation of the momentum vector does not require kinetic energy to be conserved in every collision; total energy including internal energy is a separate statement.',
    'observablePerformanceDe': 'Die lernende Person untersucht selbst einen zweidimensionalen Stoß mit nicht parallelen Nachher-Impulsen, konstruiert aus den gegebenen Einzelpfeilen die Gesamtpfeile vor und nach dem Stoß und schließt begründet auf Erhaltung oder deren Grenze. Sie unterscheidet diesen Befund von der gegebenen Änderung der kinetischen Energie. Der resultierende Gesamtpfeil wird nicht vorgegeben.',
    'observablePerformanceEn': 'The learner independently examines a two-dimensional collision with nonparallel outgoing momenta, constructs before/after totals from the supplied individual arrows and justifies conservation or its limit. This finding is distinguished from a supplied kinetic-energy change. The resultant total arrow is withheld.',
})
p['coverageExpectations']['requiredExpectationIds'].append('two-dimensional-inference-and-energy-distinction')
p['variationAxes'].append({'id': 'non-collinear-planar-motion', 'textDe': 'Geradliniger Rückstoß gegenüber einem zweidimensionalen Stoß mit nicht kollinearen Teilimpulsen.', 'textEn': 'Straight-line recoil versus a two-dimensional collision with non-collinear component momenta.'})
p['applicationCaseBriefs'].append({
    'id': 'non-collinear-puck-collision-independent-inference',
    'taskDemandDe': 'Zwei Pucks gleicher Masse stoßen auf einer horizontalen reibungsarmen Fläche zusammen. In einer kalibrierten Aufnahme läuft A vorher nach Osten und B ruht. Nachher bewegt sich A nach Nordosten, B nach Südosten. Die bereits aus den Einzelbewegungen bestimmten Impulspfeile sind auf demselben Raster eingezeichnet: vorher A vier Kästchen nach Osten, B Null; nachher A zwei nach Osten und eines nach Norden, B zwei nach Osten und eines nach Süden. Die Einheitsskala ist 1 kg m/s je Kästchen; die Gesamtpfeile fehlen. Als allgemeine mathematische Zeichenhilfe darf ein Pfeil ohne Richtungs-/Längenänderung verschoben und an die Spitze des anderen gesetzt werden; der Summenpfeil geht vom ersten Anfang zur letzten Spitze. Wähle das System und konstruiere selbst beide Gesamtpfeile. Schließe aus dem zweidimensionalen Befund auf die Gültigkeit der Impulserhaltung und erkläre, warum gemessene kinetische Gesamtenergien 8 J vorher und 5 J nachher diesen Befund nicht widerlegen. Erläutere die Änderung bei einem zusätzlichen äußeren Impuls nach Norden.',
    'taskDemandEn': 'Two equal-mass pucks collide on a horizontal low-friction surface. In a calibrated recording A initially moves east and B is at rest. Afterwards A moves northeast and B southeast. Momentum arrows already determined from the individual motions use one common grid: initially A four cells east, B zero; afterwards A two east and one north, B two east and one south. The scale is 1 kg m/s per cell; total arrows are absent. A generic mathematical drawing aid allows an arrow to be translated without changing direction or length and placed at the other tip; the sum joins the first start to the final tip. Choose the system and independently construct both totals. Infer momentum conservation from this two-dimensional observation and explain why measured total kinetic energies of 8 J before and 5 J after do not refute it. Explain a changed case with an additional external impulse northward.',
    'expectedPerformanceDe': 'Die lernende Person entwickelt aus den nicht kollinearen Einzelpfeilen für beide Zustände denselben Gesamtpfeil vier Kästchen nach Osten. Nord-/Südanteile heben sich auf; die einzelnen Puckimpulse sind nicht erhalten. Sie verbindet dies mit dem fehlenden resultierenden äußeren Kraftstoß und grenzt die vektorielle Impulsaussage gegen kinetische Energie ab: Deren Abnahme kann in innere Energie übergehen. Der äußere Nordimpuls verändert den Gesamtimpuls nach Norden. Die Gesamtpfeile und die Erhaltungsfolgerung werden selbst gewonnen; dreidimensionale Komponentenrechnung ist nicht nötig.',
    'expectedPerformanceEn': 'The learner develops the same four-cell eastward total for both states from the non-collinear individual arrows. North/south contributions cancel; neither individual puck momentum is conserved. This is connected to absent net external impulse and distinguished from kinetic energy: its decrease may become internal energy. An external northward impulse changes total momentum northward. Totals and the conservation inference are independently obtained; three-dimensional component calculations are unnecessary.',
    'understandingFocusDe': 'Echte zweidimensionale Bewegungsdaten begründen die Vektorerhaltung; kinetische Energie und Gesamtenergie werden sauber unterschieden.',
    'understandingFocusEn': 'Genuine two-dimensional motion data support vector conservation while kinetic and total energy remain distinct.',
})

# 32: supplied mathematical lemmas do not contain a physical momentum balance.
gid = IDS[3]
lemma_de = 'Rein mathematische Hilfen: Für differenzierbare komponentenweise Größen u_i(t) gilt (Σ_i u_i)′=Σ_i u_i′ und (c u_i)′=c u_i′ bei konstantem c; u+(−u)=0. Die Ableitung bezeichnet die momentane Änderungsrate. Für eine beliebige geeignete Rate f definiert A_[a,b][f] deren vorzeichenbehaftete Akkumulation; aus X′=f folgt X(b)−X(a)=A_[a,b][f]. A ist linear, komponentenweise und intervalladditiv; f=0 im ganzen Intervall ergibt konstantes X. A kann als bestimmtes Integral geschrieben werden, ohne einen Ober-/Untersummenbeweis zu verlangen. Diese Hilfen nennen keine Kräfte, Impulse oder Systemgrenzen und enthalten keine physikalische Erhaltungsbilanz. Im Physikziel werden p_i=m_i v_i bei festen Massen und J_ext=A[F_ext] als Definition des äußeren Kraftstoßes erklärt. Die Verbindung beider Größen und die innere Kraftaufhebung sind selbst herzuleiten; eine vorausgesetzte Mastery des separaten Kraftstoßziels besteht nicht.'
lemma_en = 'Pure mathematical support: for componentwise differentiable quantities u_i(t), (Σ_i u_i)′=Σ_i u_i′ and (c u_i)′=c u_i′ for constant c; u+(−u)=0. A derivative denotes instantaneous rate. For any suitable rate f, A_[a,b][f] denotes signed accumulation; X′=f implies X(b)−X(a)=A_[a,b][f]. A is linear, componentwise and interval-additive; f=0 throughout implies constant X. A may be written as a definite integral without requiring an upper/lower-sum proof. These facts mention no forces, momenta or system boundaries and contain no physical conservation balance. The Physics goal explains p_i=m_i v_i for fixed masses and J_ext=A[F_ext] as the definition of external impulse. Their physical connection and internal-force cancellation must be derived independently; mastery of the separate impulse goal is not presumed.'
set_observable(expectations(gid)['selected-round-a-core'],
    'Die lernende Person legt ein materiell abgeschlossenes Mehrkörpersystem, Inertialsystem und Intervall fest. Sie wendet Newton II auf jeden Körper beziehungsweise jede Raumkomponente an, verbindet über die gegebenen allgemeinen Ableitungsregeln p_i=m_i v_i mit seiner Änderungsrate, klassifiziert Kräfte und zeigt mit Newton III selbst die paarweise Aufhebung aller inneren Kräfte. Aus der eigenen Gesamtratenbilanz und dem allgemeinen Akkumulationssatz leitet sie ΔP=J_ext her; das physikalische Ergebnis wird nicht als Aufgabenhilfe geliefert. Sie trennt beliebige Intervall-Kraftstöße von fortlaufender Konstanz und nennt feste Massen sowie fehlenden Materiefluss.',
    'The learner chooses a materially closed multi-body system, inertial frame and interval. They apply Newton II to each body and spatial component, use generic differentiation facts to connect p_i=m_i v_i to its rate, classify forces and independently show pairwise cancellation of all internal forces using Newton III. Their independently derived total-rate balance and the generic accumulation theorem yield ΔP=J_ext; the physical result is not a task aid. Arbitrary interval impulses are distinguished from continuous constancy, with fixed masses and absence of matter flow stated.')
set_observable(expectations(gid)['zero-net-impulse-is-an-endpoint-condition'],
    'Die lernende Person akkumuliert die selbst hergeleitete äußere Gesamtrate über ein beliebiges geeignetes Kraftprofil mithilfe des allgemeinen mathematischen Satzes. Sie analysiert gegebene gerichtete Intervall-Kraftstöße, stellt die Impulsänderungen über die Teilintervalle selbst auf und unterscheidet Endpunktgleichheit von durchgehender Konstanz. Sie erklärt, warum eine Nullrate an nur einem Zeitpunkt oder ein Null-Gesamtkraftstoß keine Konstanz im ganzen Intervall beweist.',
    'The learner accumulates their independently derived external total rate for an arbitrary suitable force history using the generic mathematical theorem. They analyze supplied directed interval impulses, independently derive subinterval momentum changes and distinguish endpoint equality from continuous constancy. A zero rate at one instant or zero total impulse is explained to be insufficient for constancy throughout the interval.')
c = cases(gid)['two-cart-collision-and-narrower-system']
c['taskDemandDe'] = 'Leite für den Stoß zweier Wagen die Impulsbilanz aus Newton II und III her. Begründe jede innere/äußere Kraftzuordnung und zeige die innere Aufhebung. Verallgemeinere den Beweis auf eine beliebige feste Zahl wechselwirkender Körper und geeignete äußere Kraftverläufe in allen Raumkomponenten. Wiederhole ihn nur für einen Wagen und erkläre die veränderte Rolle der Stoßkraft. Unterscheide fortlaufende Konstanz bei stets verschwindender äußerer Kraft von gleichem Anfangs-/Endimpuls bei Null-Gesamtkraftstoß. ' + lemma_de
c['taskDemandEn'] = 'Derive the two-cart collision momentum balance from Newton II and III. Justify internal/external classifications and show internal cancellation. Generalize to any fixed number of interacting bodies and suitable external force histories in every spatial component. Repeat for only one cart and explain the collision force\'s changed role. Distinguish continuous constancy with external force always zero from equal endpoint momentum with zero net impulse. ' + lemma_en
c['expectedPerformanceDe'] = 'Aus m_i a_i und p_i=m_i v_i entwickelt die lernende Person zunächst dp_i/dt als Summe der auf i wirkenden Kräfte. Durch selbst gewählte Gesamtsummation und Newton III gewinnt sie dP/dt=F_ext; daraus folgen über den allgemeinen mathematischen Akkumulationssatz ΔP=J_ext und bei F_ext(t)=0 im ganzen Intervall fortlaufende Konstanz. Der Beweis gilt komponentenweise für beliebige geeignete Verläufe, nicht nur konstante Stoßkräfte. Für einen Wagen ist die Stoßkraft äußerlich. Systemgrenze, feste Massen, Inertialsystem, Einheiten und Grenzen werden begründet.'
c['expectedPerformanceEn'] = 'From m_i a_i and p_i=m_i v_i the learner first develops dp_i/dt as the sum of forces on body i. Their independently chosen total sum and Newton III yield dP/dt=F_ext; the generic accumulation theorem then gives ΔP=J_ext and, if F_ext(t)=0 throughout, continuous constancy. The componentwise proof covers arbitrary suitable histories, not only constant collision forces. For one cart the collision force is external. System boundary, fixed masses, inertial frame, units and limits are justified.'
c = cases(gid)['opposite-external-pulses-at-different-times']
c['taskDemandDe'] = 'Für ein materiell geschlossenes System von drei Körpern sind die äußeren Intervall-Kraftstöße J₁=(2;−1;0,5) N s und später J₂=(−2;1;−0,5) N s als bereits bestimmte Eingänge gegeben. Leite zuerst aus Newton II und III die allgemeine Gesamtraten- und Intervallbilanz selbst her. Bestimme dann aus diesen Eingängen die Gesamtimpulsänderung nach dem ersten und nach beiden Pulsen. Prüfe die Behauptung, der Gesamtimpuls sei deshalb während des ganzen Ablaufs konstant, und begründe die exakte Bedingung für fortlaufende Konstanz auch bei beliebigen Kraftverläufen. ' + lemma_de
c['taskDemandEn'] = 'For a materially closed three-body system the external interval impulses J₁=(2;−1;0.5) N s and later J₂=(−2;1;−0.5) N s are already determined input values. First independently derive the general total-rate and interval balance from Newton II and III. Then find total momentum changes after the first and after both pulses. Assess the claim of constant total momentum throughout and justify the exact condition for continuous constancy for arbitrary force histories. ' + lemma_en
c['expectedPerformanceDe'] = 'Die physikalische Herleitung bleibt eigene Leistung. Nach dem ersten Puls ist ΔP=J₁ ungleich null; nach beiden ist ΔP=0, weil die gegenüberliegenden Komponenten sich aufheben. Anfangs- und Endimpuls sind gleich, zwischenzeitlich nicht. Fortlaufende Konstanz folgt aus F_ext(t)=0 zu jedem Zeitpunkt des betrachteten differenzierbaren Ablaufs; weder Nullimpuls über das Gesamtintervall noch eine isolierte Nullrate reichen. Es wird weder Kraftstoß-Mastery noch selbständige Ober-/Untersummen- oder Stammfunktionskompetenz vorausgesetzt.'
c['expectedPerformanceEn'] = 'The physical derivation remains independent. After the first pulse ΔP=J₁ is nonzero; after both ΔP=0 because opposite components cancel. Initial and final momentum agree while intermediate momentum differs. Continuous constancy follows from F_ext(t)=0 at every instant of the differentiable process; neither zero interval impulse nor an isolated zero rate suffices. No separate impulse mastery or independent upper/lower-sum or primitive-finding competence is presumed.'

# 69: constitutive facts are present; neither substitute path nor entropy is given.
gid = IDS[4]
math_de = 'Allgemeine mathematische Hilfen: dY=h(x)dx wird über [a,b] zu ΔY=∫_a^b h(x)dx akkumuliert. Für x>0 gilt F(x)=ln(x/x₀) als Primitive von 1/x, ln 1=0 und ∫_a^b f(x)dx=F(b)−F(a); konstante Faktoren bleiben Faktoren. Für b>a>0 ist ln(b/a)>0. Bei b≠0 gilt (a b/x)/b=a/x. Diese Regeln nennen weder Entropie noch einen physikalischen Prozess. Eigenständige Ober-/Untersummenbegründung, Logarithmus-Stammfunktionssuche und numerische Termwertrechnung sind keine zusätzliche Pflicht; eine symbolisch vollständig begründete Clausius-Anwendung ist zulässig.'
math_en = 'Generic mathematical support: dY=h(x)dx accumulates over [a,b] into ΔY=∫_a^b h(x)dx. For x>0, F(x)=ln(x/x₀) is a primitive of 1/x, ln 1=0 and ∫_a^b f(x)dx=F(b)−F(a); constant factors remain factors. For b>a>0, ln(b/a)>0. For b≠0, (a b/x)/b=a/x. These rules mention neither entropy nor a physical process. An upper/lower-sum proof, independent logarithmic primitive finding and numerical expression-value calculation are not additional requirements; a fully justified symbolic Clausius application is admissible.'
set_observable(expectations(gid)['physical-understanding'],
    'Aus Endzuständen und ausdrücklich angegebenen Stoff-/Arbeitsgesetzen wählt die lernende Person selbst einen reversiblen Ersatzweg. Sie gewinnt für diesen Weg δQ_rev, identifiziert die jeweilige absolute Temperatur und Integrationsgröße, setzt passende Grenzen und begründet die eigene symbolische Entropieänderung mit der gegebenen allgemeinen mathematischen Akkumulations-/Auswertungsregel. Sie erklärt, warum ΔS als Zustandsänderung auch für den realen irreversiblen Weg gilt, während dessen Wärme anders sein kann. Ersatzweg, δQ_rev und physikalische ΔS-Formel sind keine Eingangslösung.',
    'From endpoint states and explicitly supplied material/work laws, the learner independently chooses a reversible substitute path. They obtain δQ_rev for it, identify local absolute temperature and the integration variable, choose bounds and justify their symbolic entropy change using the generic mathematical accumulation/evaluation rule. They explain why the state change ΔS also applies to the actual irreversible path while its heat may differ. The substitute path, δQ_rev and physical ΔS formula are not input solutions.')
c = cases(gid)['fresh-independent-case']
c['taskDemandDe'] = 'Eine feste Menge idealen Gases expandiert frei in Vakuum im isolierten geschlossenen Gefäß von V₁ nach 2V₁. Anfangs- und Endzustand sind Gleichgewicht bei derselben absoluten Temperatur T. Modellfakten: Im Gleichgewicht gilt pV=nRT, die innere Energie U hängt bei fester Gasmenge nur von T ab. Mit Arbeit des Gases positiv gilt dU=δQ−δW; für reversible quasistatische reine Volumenarbeit δW=p dV. Eine freie Vakuumexpansion leistet wegen äußerem Druck null keine Volumenarbeit. Wähle selbst einen reversiblen Weg zwischen genau diesen Endzuständen, leite dessen δQ_rev aus den Modellfakten her und benutze dS=δQ_rev/T zur Bestimmung von ΔS. Vergleiche die Wärme des realen und des Ersatzwegs. Weder Ersatzweg noch δQ_rev oder Entropieresultat sind vorgegeben. ' + math_de
c['taskDemandEn'] = 'A fixed amount of ideal gas freely expands into vacuum inside an isolated closed vessel from V₁ to 2V₁. Initial and final states are equilibrium states at the same absolute temperature T. Model facts: equilibrium obeys pV=nRT and internal energy U depends only on T for a fixed amount. With work by the gas positive, dU=δQ−δW; reversible quasistatic pure volume work obeys δW=p dV. Free expansion into vacuum performs no volume work because external pressure is zero. Independently choose a reversible path between these exact endpoints, derive its δQ_rev from the model facts and use dS=δQ_rev/T to find ΔS. Compare actual and substitute heat. Neither path, δQ_rev nor entropy result is supplied. ' + math_en
c['expectedPerformanceDe'] = 'Die lernende Person wählt eine reversible isotherme Expansion, folgert dU=0 aus U(T) und gewinnt über ersten Hauptsatz und Volumenarbeit selbst δQ_rev=p dV=nRT dV/V. Sie bildet dS=nR dV/V, wählt V₁ und 2V₁ als Grenzen und erhält mit den allgemeinen mathematischen Regeln ΔS=nR ln 2>0. Für den realen isolierten Weg ist Q_real=0; die Wärme des Ersatzwegs ist positiv. Gleiche Endpunkte verlangen dasselbe ΔS, nicht dieselbe Wärme. Alle physikalischen Verknüpfungen, der Weg und die Grenzen sind selbst begründet.'
c['expectedPerformanceEn'] = 'The learner chooses a reversible isothermal expansion, infers dU=0 from U(T) and independently obtains δQ_rev=p dV=nRT dV/V using the first law and volume work. They form dS=nR dV/V, choose V₁ and 2V₁ as bounds and obtain ΔS=nR ln 2>0 using the generic mathematics. The actual isolated path has Q_actual=0; substitute heat is positive. Identical endpoints require the same ΔS rather than the same heat. Physical connections, path and bounds are independently justified.'
c = cases(gid)['independent-changed-case']
c['taskDemandDe'] = 'Ein starrer Körper ohne Phasenübergang wird bei festem Volumen durch Kontakt mit einem deutlich heißeren Reservoir von T₁ auf T₂>T₁ erwärmt. Modellfakten: Im Temperaturbereich ist C>0 konstant und dU=C dT. Es gibt keine mechanische oder sonstige Arbeitsübertragung; mit Arbeit des Körpers positiv gilt dU=δQ−δW. Konstruiere selbst einen reversiblen Vergleichsweg zwischen denselben Gleichgewichtsendpunkten, gewinne dessen δQ_rev und bestimme symbolisch ΔS aus dS=δQ_rev/T. Begründe, warum Q_real/T₂ im Allgemeinen nicht das Ergebnis liefert. Der Vergleichsweg, die reversible Wärme und das Entropieresultat werden nicht geliefert. ' + math_de
c['taskDemandEn'] = 'A rigid body without a phase transition is heated at fixed volume by contact with a substantially hotter reservoir from T₁ to T₂>T₁. Model facts: C>0 is constant in this range and dU=C dT. There is no mechanical or other work transfer; with work by the body positive, dU=δQ−δW. Independently construct a reversible comparison path between the same equilibrium endpoints, obtain its δQ_rev and symbolically determine ΔS from dS=δQ_rev/T. Explain why Q_actual/T₂ generally fails. Comparison path, reversible heat and entropy result are withheld. ' + math_en
c['expectedPerformanceDe'] = 'Die lernende Person entwirft Wärmeübertragung mit einer Folge von Reservoirs bei jeweils infinitesimal kleiner Temperaturdifferenz. Aus dU=C dT und fehlender Arbeit gewinnt sie δQ_rev=C dT und integriert mit den selbst gewählten Grenzen T₁,T₂ zu ΔS=C ln(T₂/T₁)>0. Die variable Temperatur gehört in den Quotienten; der Endwert T₂ ersetzt sie nicht. Der gleiche Entropieunterschied gilt für den realen Weg, weil S eine Zustandsgröße ist, obwohl die tatsächliche Übertragung irreversibel ist.'
c['expectedPerformanceEn'] = 'The learner designs heat transfer through reservoirs with successively infinitesimal temperature differences. From dU=C dT and absent work they obtain δQ_rev=C dT and integrate over independently chosen bounds T₁,T₂ to ΔS=C ln(T₂/T₁)>0. Varying temperature belongs inside the quotient and cannot be replaced by final T₂. The same entropy change applies to the actual path because S is a state variable although actual transfer is irreversible.'

rationales = {
    IDS[0]: 'Die Pflicht zur experimentellen Datenerhebung und zum Literaturvergleich ist jetzt als unverzichtbare eigene Leistung gesichert; die vollständige amtliche HE E.1-Breite wird nicht auf fertige Daten verengt. Eine universell notwendige ganze Mathematikmenge ist dennoch nicht bewiesen. Der frühere lineare Fitweg benutzt die fünf v1-Nominees, aber eine fachlich begründete andere grafische Auswertung bleibt mit dem unveränderten Ziel und der Quelle vereinbar. Die ganzen aktuellen P-Profile verlangen mehr als die allein unvermeidlichen Diagramm-/Term-/Rechenschritte. Deshalb bleibt eine Granularitätslücke offen. Der bestehende direkte Math-Verweis bleibt technisch unverändert erhalten; er wird hier weder bestätigt noch durch eine leere definitive Zielmenge entfernt.',
    IDS[1]: 'Das neue P enthält eigene einfache Arbeitsberechnung und Nettobilanz und erhält dadurch die exakt zugeordnete BY-Klausel. Eigenständige Vorzeichenwahl, Systemwechsel und Transfer werden nicht durch gelieferte Ergebnisse vorweggenommen. Eine spezifische Trigonometrie, Flächenformel oder Integralroutine ist nicht universell nötig. Die tatsächlichen ganzen Mathematikprofile für rationale Addition, rationale Multiplikation/Division, Terme lesen und Termwerte sind gelesen: einfache vorzeichenbehaftete Produkte/Summen sind relevant, beweisen jedoch nicht automatisch vollständige Beherrschung aller Darstellungs-/Operationsaspekte dieser Atome. Die genaue vollständige notwendige Menge bleibt eine Granularitätslücke; keine unbewiesene breite AND-Barriere wird vorgeschlagen.',
    IDS[2]: 'Die vollständige BY-Quelle bleibt mit einem obligatorischen echten zweidimensionalen Stoß und der Abgrenzung gegen kinetische beziehungsweise gesamte Energie erhalten. Gesamtpfeile und Erhaltungsfolgerung fehlen als Eingänge. Eine allgemeine mathematische Pfeilkonstruktionsregel steht explizit zur Verfügung; die lernende Person wählt das physikalische System, konstruiert aus den richtigen Einzelmomenten die Summe und begründet die Aussage selbst. Das ganze c63-P verlangt zusätzlich selbständige 2D/3D-Komponentenrechnung; diese ist in der zulässigen grafisch unterstützten qualitativen Route nicht notwendig. Andere breite Mathematikatome sind ebenfalls keine unvermeidliche Vorleistung. Daher Autorenkandidat ohne fachfremde Pflicht-Mastery, mit vollständigem physikalischem Quellenumfang und neuer unabhängiger Prüfungspflicht.',
    IDS[3]: 'Das unabhängige Momentum-Erratum wird tatsächlich berücksichtigt: IntegralDef-Ober-/Untersummenmastery wird nicht aus gegebenen gerichteten Kraftstößen abgeleitet. Die neue Route liefert ausdrücklich allgemeine mathematische Ableitungs-, Vektoralgebra-, Nullrate- und vorzeichenbehaftete Akkumulationssätze, aber weder dP/dt=F_ext noch ΔP=J_ext als physikalisches Ergebnis. Die lernende Person muss Newton II mit p=m v verknüpfen, Systemkräfte selbst klassifizieren, Newton-III-Paare aufheben und den vollständigen allgemeinen Intervallbeweis führen. Beliebige geeignete Kraftverläufe und Endpunktgleichheit versus fortlaufende Konstanz bleiben erhalten. Die ganzen b1- und c63-Profile sind gelesen; ihre eigenständige mathematische Rate-/Tangenteninterpretation beziehungsweise 2D/3D-Komponentenroutine ist auf dieser explizit mathematisch unterstützten Route keine zwingende vorherige Mastery. Die Definition Kraftstoß wird im Physikdelta erklärt; das separate Kraftstoßziel ist weder direkt noch effektiv vorausgesetzt. Autorenkandidat ohne fremde Pflicht-Mastery, keine neue unabhängige Zustimmung.',
    IDS[4]: 'Die physikalische Routenlücke ist behoben: Gas-Zustandsgleichung, U(T), erster Hauptsatz, Vorzeichenkonvention und reversible Volumenarbeit sowie für den starren Körper dU=C dT und fehlende Arbeit sind ausdrücklich gegeben. Sie nennen weder Ersatzweg noch reversible Wärme oder Entropieresultat. Die lernende Person bestimmt diese physikalischen Verknüpfungen, Grenzen und variable Temperatur selbst. Eine allgemeine mathematische Akkumulations- und Auswertungsregel steht bereit; Ober-/Untersummenbegründung und eigenständige ln-Stammfunktionssuche sind nicht notwendig. Auch das engere 2af-P verlangt Flächenbild und Anfangsbestandsrekonstruktion, die das unveränderte ΔS-Ziel nicht allgemein fordert. a646 verlangt konkrete numerische Termwerte; die vollständig begründete symbolische Clausius-Route ist ohne eigenständige Zahlenroutine zulässig. Diese ganzen Atome werden deshalb nicht als universelle Pflicht-Mastery behauptet. Der eigene historische und kanonische Clausius-Anspruch bleibt vollständig erhalten; eine amtliche spezifische Clausius-/Modellaufgabe für alle 16 Länder wird nicht erfunden.',
}
actions = {IDS[0]: 'granularity_gap', IDS[1]: 'granularity_gap', IDS[2]: 'no_cross_subject_required', IDS[3]: 'no_cross_subject_required', IDS[4]: 'no_cross_subject_required'}

frozen = {
    'AGENTS.md', 'LICENSING.md', physics_path, math_path, he_path, by_path, legacy_path,
    he['sourceDocument']['path'], by['sourceDocument']['path'],
    'curricula/quality/cross-subject-requires/math-physics.config.json',
    'curricula/quality/cross-subject-requires/math-physics.inventory.json',
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
    'app/scripts/lib/crossSubjectRequiresInventory.ts', 'app/scripts/lib/crossSubjectRequiresReview.ts',
    'app/scripts/prepareCrossSubjectRequiresProposal.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts',
}
frozen.update(map(str, [old_context_path, old_author_path, old_amendment_path, old_packet_path, peer_path, erratum_path, peer_manifest_path, math_read_path, math_gap_read_path]))
for batch in read(peer_manifest_path)['batches']:
    frozen.update([batch['reviewPath'], batch['packetPath']])
for r in records:
    frozen.update([r['actualNativePConfigPath'], r['actualNativePReviewPath']])
    frozen.update(b['mappingPath'] for b in r['sourceBindings'])
for owner in math_owners.values():
    frozen.update([owner['configPath'], owner['reviewPath']])
frozen_inputs = [{'path': p, 'sha256': sha(p)} for p in sorted(frozen)]

context = {
    'schemaVersion': 1, 'status': 'inert_v3_author_context_no_independent_approval',
    'role': 'revision_author', 'agentIdentity': AGENT, 'createdAt': now, 'goalCount': 5,
    'physicsCanonicalFileSha256': sha(physics_path), 'mathCanonicalFileSha256': sha(math_path),
    'records': records,
    'priorExactIndependentReview': {'path': str(peer_path), 'sha256': sha(peer_path), 'decisions': [copy.deepcopy(next(r for r in peer['decisions'] if r['dependentGoalId'] == gid)) for gid in IDS]},
    'momentumErratum': {'path': str(erratum_path), 'sha256': sha(erratum_path), 'record': erratum, 'appliesOnlyToHistoricalV1Binding': True},
    'mathematicsFullDescriptionsAndActualCurrentNativePRead': math_owners,
    'officialSourceSupplements': [
        {'path': path, 'sha256': sha(path), 'sourceDocument': data['sourceDocument'], 'sourceGoals': [g for g in data['sourceGoals'] if g['id'] in source_ids[path]]}
        for path, data in [(he_path, he), (by_path, by)]
    ],
    'actualLocalOfficialPdfRead': {'path': he['sourceDocument']['path'], 'sha256': sha(he['sourceDocument']['path']), 'pdfPageOneBased': 30, 'topics': ['E.1', 'E.2'], 'method': 'pypdf extract_text actually read; no full PDF text re-exported'},
    'retainedOwnLegacyGoals': {'path': legacy_path, 'sha256': sha(legacy_path), 'goals': [g for g in legacy['goals'] if g['id'] in legacy_ids]},
    'webChecks': [
        {'url': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/physik', 'readAt': now, 'relevantClaim': 'Current official work/energy competence still requires simple calculations; no copying or relicense of the web page.'},
        {'url': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/physik', 'readAt': now, 'relevantClaim': 'Current official momentum competence still requires inference from two-dimensional motion and distinction from energy conservation.'},
        {'url': 'https://openstax.org/books/university-physics-volume-2/pages/4-6-entropy', 'readAt': now, 'relevantClaim': 'Scientific fact check for reversible substitute paths and variable-temperature entropy change; no task/solution text imported or relicensed.'},
    ],
    'frozenInputs': frozen_inputs,
    'sourceBoundary': 'Exact HE/BY clauses and own legacy content support their stated breadth. Existing other-jurisdiction mappings/applicability remain captured and unmodified, not newly officially certified. These sources do not directly assert any exact Math requires edge. Third-party source contents retain their existing conditions; own new review/content contributions only are CC-BY-4.0.',
    'roleBoundary': 'Author-only exact new inputs. Historical independent reviews and native D/P/A/M/V receipts are unchanged and do not approve this revision. No active graph/profile/source edit, deployment or commit.',
}
write(context_path, context)

decisions = []
amendments = []
for r in records:
    gid = r['goalId']
    current = r['currentCanonicalGoal']
    prior_decision = copy.deepcopy(next(d for d in old_author['decisions'] if d['dependentGoalId'] == gid))
    prior_packet_decision = next(d for d in old_packet['decisions'] if d['dependentGoalId'] == gid)
    prior_amendment = copy.deepcopy(next(a for a in old_amendments['amendments'] if a['goalId'] == gid))
    profile = profiles[gid]
    current_foreign = [x for x in current.get('requires', []) if x.split(':')[-1] in math]
    # Unresolved decisions preserve baseline bytes. The field is a technical
    # placeholder required by the existing proposal validator, not a nomination.
    declared = current_foreign if actions[gid] == 'granularity_gap' else []
    old_profile_hash = prior_amendment['proposedProfileBodySha256']
    prior_amendment.update({
        'proposedProfile': profile, 'proposedProfileBodySha256': fp(profile),
        'sourceContextPath': str(context_path), 'sourceContextFileSha256': sha(context_path),
        'status': 'inert_v3_author_candidate_pending_different_agent_native_QA',
        'authority': 'ai_candidate', 'revisionAuthorAgent': AGENT,
        'rationale': rationales[gid], 'fullBilingualBodyRead': True,
        'changedBody': fp(profile) != r['actualNativePBodySha256'],
        'supersedesAuthorCandidateOnly': {'path': str(old_amendment_path), 'fileSha256': sha(old_amendment_path), 'goalId': gid, 'profileBodySha256': old_profile_hash},
        'bodyAndSourceBoundary': 'New exact DE/EN author body. Existing essential understandings and all original expectation/case IDs remain, with mandatory source witnesses added where necessary. No historical content approval is rebound; native M7 has not run. Generic mathematical or constitutive input facts do not supply the learner physical answer.',
        'oldProfileFullDeEn': copy.deepcopy(r['actualNativePRecord']['profile']),
        'v1ProfileFullDeEn': copy.deepcopy(next(a for a in old_amendments['amendments'] if a['goalId'] == gid)['proposedProfile']),
    })
    prior_decision.update({
        'decision': actions[gid], 'prerequisiteGoalIds': declared, 'rationale': rationales[gid],
        'author': AUTHOR, 'authorAgentCanonicalName': AGENT, 'authorRole': 'revision_author',
        'status': 'candidate_pending_independent_review',
        'profileAmendmentCandidatePath': str(profile_path), 'profileAmendmentProposedBodySha256': fp(profile),
        'nominatedCompleteMathematics': [],
        'prerequisiteGoalIdsMeaning': 'For granularity_gap only: unchanged current foreign IDs are a technical baseline-preservation placeholder, not an endorsed necessary set. For no_cross_subject_required: the empty complete author-proposed set applies only with the exact mathematical support of this new P candidate.',
        'mathematicsFullProfileReadPath': str(context_path),
        'mathematicsFullProfileReadLocator': 'mathematicsFullDescriptionsAndActualCurrentNativePRead',
        'independentReviewRequiredFromDifferentAgent': True,
        'supersedesAuthorCandidateOnly': {'path': str(old_packet_path), 'fileSha256': sha(old_packet_path), 'decisionId': prior_decision['decisionId'], 'proposalBindingSha256': fp(prior_packet_decision['proposalBinding']), 'boundary': 'Old author and exact peer/erratum bindings remain unchanged; no old approval is transferred.'},
        'applicability': {'universality': 'unresolved' if actions[gid] == 'granularity_gap' else 'allDependentScopes', 'scopes': [current.get('applicability', {})], 'alternatives': ['All source breadth and the exact unchanged bilingual Physics goal remain. General mathematical input facts are explicit and do not return the physical answer. Alternative complete routes, not chronology, decide universal whole-atom necessity.']},
        'remainingBlockers': ([{'kind': 'granularity_gap', 'detail': 'The source/profile repair is concrete; the complete universal atomic Math set is not proved. Existing baseline requirements are preserved without scientific endorsement; no adoption may treat this record as resolved.'}] if actions[gid] == 'granularity_gap' else []),
        'sourceRefs': [x for x in prior_decision['sourceRefs'] if x['path'] not in [str(old_context_path), str(old_amendment_path)] and x.get('supports') != 'prerequisite'],
    })
    prior_decision['sourceRefs'] += [
        {'path': str(context_path), 'recordId': gid, 'locator': 'records[goalId=' + gid + '] and officialSourceSupplements', 'supports': 'scope'},
        {'path': str(profile_path), 'recordId': gid, 'locator': 'amendments[goalId=' + gid + '].proposedProfile', 'supports': 'goalSemantics'},
    ]
    anchors = {
        IDS[0]: [(he_path, 'he-phys-sekii-e-1-b09-a01-74f473d9')],
        IDS[1]: [(by_path, 'c1facc77-5590-5495-9257-48ff27195dd7'), (by_path, '46a5bb03-8eb6-5b71-a3c4-a66fc173e314')],
        IDS[2]: [(by_path, '713ad139-bcb8-5a71-a520-3f194a0f8754'), (he_path, 'he-phys-sekii-e-2-b09-a01-cc89cbd5'), (he_path, 'he-phys-sekii-e-2-b12-a01-a1fb7ddb')],
        IDS[3]: [(legacy_path, '0c7a1a3d-ca41-4795-8b60-0ba555e1b804')],
        IDS[4]: [(legacy_path, '3ab3f788-deaa-4140-8fe0-eb30f39eb563')],
    }
    for path, source_id in anchors[gid]:
        prior_decision['sourceRefs'].append({'path': path, 'recordId': source_id, 'locator': ('goals' if path == legacy_path else 'sourceGoals') + '[id=' + source_id + ']', 'supports': 'goalSemantics'})
    amendments.append(prior_amendment)
    decisions.append(prior_decision)

write(profile_path, {'schemaVersion': 1, 'status': 'inert_v3_author_profile_candidates_no_native_receipts', 'author': AUTHOR, 'createdAt': now, 'sourceContextPath': str(context_path), 'sourceContextFileSha256': sha(context_path), 'amendments': amendments, 'licensing': {'ownContent': 'CC-BY-4.0', 'attribution': 'SkillPilot contributors', 'sourceException': 'Captured third-party sources keep their existing conditions.'}})
write(author_path, {'schemaVersion': 1, 'status': 'inert_v3_revision_author_ledger_pending_independent_review', 'author': AUTHOR, 'roleBoundary': 'Author-only; no native D/P/A/M/V approval, no transferred independent verdict, no active adoption.', 'createdAt': now, 'sourceContextPath': str(context_path), 'sourceContextFileSha256': sha(context_path), 'goalCount': 5, 'counts': {'authorProposedNoCrossSubjectRequired': 3, 'unresolvedGranularityGaps': 2, 'independentlyApproved': 0}, 'decisions': decisions, 'licensing': {'ownContent': 'CC-BY-4.0', 'attribution': 'SkillPilot contributors'}})
for path in [context_path, profile_path, author_path]:
    print(path, sha(path))
print('Author actions', actions)
