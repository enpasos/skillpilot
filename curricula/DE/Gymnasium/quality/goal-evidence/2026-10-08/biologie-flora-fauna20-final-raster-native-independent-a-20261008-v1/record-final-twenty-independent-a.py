# SPDX-License-Identifier: Apache-2.0
"""Record actual independent raster/page QA; retain genuine completed text science."""
import copy
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-flora-fauna20-image-author-root-20261007-v1'
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-current391-author-v1'
FINAL = AUTHOR.parent / 'biologie-flora-fauna20-final-raster-native-author-root-20261007-v1'
PRIOR = AUTHOR.parent / 'biologie-flora-fauna20-current391-independent-a-20261007-v1'
FIRST_IMAGES = AUTHOR.parent / 'biologie-flora-fauna20-first-ten-raster-independent-a-20261007-v1'
V4 = AUTHOR.parent / 'biologie-flora-fauna20-targeted-P-remediation-root-author-v4'
NATIVE = FINAL / 'native-raster-candidate/twenty'


def read(p): return json.loads(p.read_text())
def lines(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream: stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


# Goal-specific findings from actual originals, actual40 Chromium element captures,
# and actual20 full native goal pages. Earlier unchanged original findings are kept.
OBSERVATIONS = [
    'V2 zeigt die beobachtende Person von hinten über die Schulter; der Bestimmungsführer liegt jetzt in ihrer eigenen Leserichtung, das zuvor verkehrt orientierte Notizheft ist entfernt. Der echte frühere A-HOLD wird hier gezielt geschlossen, nicht überschrieben. Artenvielfalt, Dodo als ausgestorbene Art und prüfende Käferbeobachtung bleiben getrennt; eine lokale Beobachtung wird nicht als bestätigte neue Art ausgegeben. Hauptgruppen und große Wörter bleiben bei360/680 klar.',
    'Gültigen eigenen Originalbefund beibehalten: Hund, gegliederte Vordergliedmaße, Lunge und Herz tragen nachvollziehbar Bewegung, Gasaustausch und Transport. Organpfeile sind zugeordnet; das Schema behauptet keine vollständige Alveolar- oder Kreislaufmechanik. In tatsächlichen360/680-Bildern sind alle drei Organmotive und Funktionswörter erkennbar.',
    'Gültigen Originalbefund beibehalten: Otterfell hält eine isolierende Luftschicht über der Haut; Schwimmhaut steht im Zusammenhang mit Fortbewegung im Wasser. Keine Lichtleitertheorie und keine zielgerichtete Entstehung der Merkmale. Beide Lupen bleiben bei360/680 erkennbar; die kurzen Fell-/Luft-/Hautlabels sind bei360 klein, die unterschiedlichen Schichten und Zuordnung jedoch unterscheidbar.',
    'Gültigen Originalbefund beibehalten: Beobachtungsskizzen stehen getrennt von Deutung im Ethogramm, ohne Gedanken des Hundes zu erfinden. Die schreibende Person kann ihr Heft richtig herum lesen. Bei360 sind die drei Körperhaltungen und das Protokoll erkennbar; die kleinen Tabellenwörter dienen nur der Zusatzorientierung. Kein echtes durchgeführtes Lernendenethogramm wird behauptet.',
    'Gültigen Originalbefund beibehalten: gemeinsamer Vorläufer verzweigt in heutige Wölfe und Haushunde; vererbbare Variation und menschliche Zuchtauswahl sind getrennt sichtbar. Kein einzelner heutiger Wolf verwandelt sich unmittelbar in einen Hund. Verzweigung und unterschiedliche Tierformen sind bei360/680 nachvollziehbar.',
    'V2-Originalbefund beibehalten: Quellung, zuerst Keimwurzel, anschließend Spross und Blattkeimling bilden eine schlüssige vereinfachte Bohnenentwicklung. Wasser/Wärme/Luft sind von Licht als späterem Wachstumsfaktor getrennt. Die tatsächlichen360/680-Ansichten zeigen die vier Schritte und Wurzel/Sprossfolge; der kleine Lichtzusatz ist Ergänzung, nicht behauptete universelle Keimvoraussetzung. Keine echte Wachstumsbeobachtung wird aus dem Modell abgeleitet.',
    'V2-Originalbefund beibehalten: blaue Wasserpfeile laufen vom Boden in die Wurzel und im Spross nach oben. Zucker wird im belichteten Blatt verortet und orange zu Triebspitzen, Hülsen und Wurzeln geleitet, nicht ausschließlich nach oben oder aus dem Boden aufgenommen. Transport und Zielorgane bleiben bei360/680 erkennbar; Wasser/Zucker sind kurze gut zugeordnete Labels.',
    'Gültigen Originalbefund beibehalten: Staubbeutel/-faden, Narbe, Griffel, Fruchtknoten und Samenanlagen sind funktionell verbunden. Bestäubung und Pollenschlauch/Befruchtung sind getrennt; ein Pollenkorn wird nicht selbst zum ganzen Samen. Tatsächliches360 ausdrücklich geprüft: große Blüte, Stauborgane, Stempel, Pollentransfer, innenliegende Samenanlagen und Fruchtfolge sind unterscheidbar; die längeren Inset-Zusätze sind klein und werden nicht als komfortabel lesbarer Pflichttext ausgegeben. Hauptlabels und Richtung sind zugeordnet;680 und native Seite zeigen die Zusatzwörter klarer. Keine artspezifisch vollständige Blütenformel oder universelle Aussage über Fruchtnebentissue.',
    'V2-Originalbefund beibehalten: die Person hält und liest den Bestimmungsführer in eigener Richtung. Wildwuchs und angebautes Bohnenbeet sind Nutzungskontexte; Blatt-/Blütenmerkmale werden vergrößert. Keine sichere Essbarkeit oder pauschale Schädlichkeit von Wildpflanzen wird behauptet. Bei360/680 sind Zeichen und vergrößerte Merkmale erkennbar; winzige Führertexte werden nicht benötigt. Das Bild ist ein allgemeines Pflanzenbeispiel, nicht die Bildlösung der begrenzten P-Gänseblümchen-/Klee-/Bohnenprobe.',
    'V2-Originalbefund beibehalten: Federfläche und kompakter Vogelkörper stehen zu Bewegung in Luft und geringerem Luftwiderstand. Dichte Fahne ist korrekt geschrieben, keine luftdurchlässige Flugfahne wird behauptet. Bei360/680 sind Vogel, Feder und Stromlinienmotiv erkennbar; Zusatzcheckliste klein, aber kein langer Pflichttext. Vogel ist das gewählte vertiefte Beispiel, nicht die Behauptung einer gleichzeitigen Fischvertiefung.',
    'V2 zeigt Vogelrevier/Balz/Brutpflege und viele Fischeier, ergänzt durch ausdrücklich Manche Fischarten betreuen ihre Eier. So wird Fischpflege nicht pauschal ausgeschlossen. Die zentrale unterschiedliche Investition ist Vergleich, keine universelle Rangfolge des Fortpflanzungserfolgs. Hauptbeispiele bei360/680 erkennbar; kurze Zusatztexte sind bei360 kleiner. Aktuelle Text-/P-Grenze Vogel ODER Fisch bleibt erhalten.',
    'Das tatsächliche Vogelbild verbindet den fliegenden Vogel mit einem abgestützten Leichtbauquerschnitt und einem zusammenhängenden Federmotiv samt vernetzter Detailstruktur. Der Pinguin als anderes Vogelbeispiel erzwingt keine Behauptung, dass jeder Vogel fliegt oder sämtliche Knochen luftgefüllt sind. Bei360/680 sind die zwei zentralen Konstruktionsmotive unterscheidbar; feinste Federhäkchen sind Vergrößerungsdetail.',
    'V2 zeigt Wasser vom Maul über die roten Kiemen zum Kiemendeckel-Ausgang; es wird nicht durch den Verdauungstrakt geleitet. Die dorsale Schwimmblase ist von darunterliegenden Darmorganen getrennt. Stromlinienform ist mit Strömung um den Körper verbunden; kein universeller Schwimmblasenbesitz aller Fischarten. In360/680 bleiben Strukturen, Pfeile und drei kurze Labels erkennbar. Die Quelle erlaubt Fisch als vertieftes Wahlbeispiel; daraus folgt keine gleichzeitige Vogeltiefenpflicht.',
    'V2 stellt Schale, Amnion, Embryo, Dottersack und Allantois vergleichbar bei einem Eidechsen- und Hühnerbeispiel dar. Amnionpfeile begrenzen den Embryonalraum; Dotter und Allantois werden nicht verwechselt. Schlupf ergibt Jungtier ohne vorgeschaltetes aquatisches Kaulquappenstadium. Bei360/680 bleiben beide Eierschemata und Schlupfwege klar; Zusatzfunktionen sind klein. Die z.B.-Labels erzwingen keine Aussage, alle Reptilien legten gleichartige Eier.',
    'Die Eidechse wechselt nachvollziehbar zwischen sonnenbeschienenem warmem Stein und kühlerem Versteck. Die Aktivitätskurve mit zu kalt/optimal/zu heiß ist qualitativ, ohne erfundene Messwerte oder universell gleiche Temperaturgrenzen. Keine Säugetierregelung wird eingezeichnet. Sonne/Schatten und Wechselpfeile bleiben bei360/680 deutlich; die Kurve illustriert die begrenzte Funktionsdeutung.',
    'V2 ordnet das Grubenorgan zwischen Auge und Nasenloch zu und trennt es von diesen. Wärme-/Infrarotreiz kommt von der Maus zum Organ; die Schlange emittiert keinen Suchstrahl. Sicht- und Wärmeeindruck sind schematische unterschiedliche Kanäle, keine exakte Photographie aus dem Schlangenauge. Bei360/680 bleiben Quellenrichtung, Organort und großer Vergleich erkennbar.',
    'V4 zeigt ausschließlich zur aktuellen Sauerstoffversorgungsbeschreibung passende O2-Aufnahme: von außen durch feuchte Haut in die Gefäßzone und über den Mundhöhlen-/Lungenweg in den Körper. Keine gegensinnig beschrifteten CO2-Pfeile oder äußerlichen Kiemen am adulten Frosch. Die Hauptrelation Haut/Lunge und Richtung bleiben bei360/680 erkennbar. Das Bild behauptet keinen vollständigen Ventilationszyklus oder universelle Lungen aller Amphibien.',
    'V2 hat zwei getrennte Schilddrüsen als schematische gepaarte Froschorgane, nicht eine menschliche Schmetterlingsschilddrüse. Hormonwirkung ist mit geordnetem Hinterbein-/Vorderbeinwachstum und Schwanzrückbildung verbunden. Schematischer Vergleich vermeidet den falschen Eindruck eines wirklich durchgeführten eigenen Tierversuchs; ohne Hormone bleibt Metamorphose aus, nicht jedes beliebige Wachstum. In360/680 bleiben Folge und Gegenüberstellung erkennbar; kleinteilige Erklärwörter sind Zusatz.',
    'Ein Beispiel mit vielen Wasser-Eiern und wenig Pflege steht einem Beispiel mit kleinerem getragenem/behütetem Gelege gegenüber. Pflegeform/Eizahl werden verglichen, ohne überall höheren Erfolg kleiner Gelege zu behaupten. Die mittlere Ei-Kaulquappe-Froschfolge ist ein typisches Wasserfrosch-Beispiel, keine universelle Entwicklungsbehauptung für alle Amphibien oder jeden Eiträger; es gibt keine entsprechende Allquantifizierung oder zwingende Verbindung zum rechten Gelege. Die zwei Pflegebeispiele, Größenkontrast und Labels bleiben bei360/680 erkennbar.',
    'V2 zeigt zwei soziale Kaninchen, strukturierte Bewegungs-/Rückzugsflächen, rohfaserreiches Futter und Wasser. Physiologie, Verhalten und dauerhafte Verantwortung sind nachvollziehbar zugeordnet. Die dargestellte Anlage ist ein Prinzipienbeispiel, kein vermessener Mindesthaltungsplan oder Freibrief für beliebige Zimmerpflanzen. Das Schema beweist keine tatsächliche Tierhaltung der lernenden Person. Bei360/680 sind Tiere, Futter, Wasser und Rückzüge erkennbar; dekorative Buch-/Tassentexte sind nicht Pflicht.',
]
assert len(OBSERVATIONS) == 20
input_seal = read(SOURCE / 'final-flora-fauna20-raster-native-author-input.freeze.json')
assert sha(SOURCE / 'final-flora-fauna20-raster-native-author-input.freeze.json') == 'sha256:a0e466c3ecb503ee73188c39a1545fd4a91e3adc7a321081f040b7a233b1f180'
for b in input_seal['files']: assert bind(ROOT / b['path']) == b
entry = read(SOURCE / 'neutral-final-flora-fauna20-raster-native-review.entry.json')
images = read(ROOT / entry['imageManifest']['path'])['images']
assert [g['ordinal'] for g in images] == list(range(1, 21))
before = {g['id']: g for g in read(ROOT / entry['exactBeforeCanonicalSnapshot']['path'])['goals']}
future = {g['id']: g for g in read(ROOT / entry['futureInertCanonical']['path'])['goals']}
original = {g['id']: g for g in read(AUTHOR / 'current20-whole-DEEN-goals.actual.json')['goals']}
first_science = {g['goalId']: g for g in read(PRIOR / 'twenty-whole-goal-science.first.actual.json')['goals']}
prior_seals = [PRIOR / n for n in ['first-twenty-whole-science.freeze.json', 'native-preimage-D20-and-retained-AM.final.freeze.json', 'targeted-v3/targeted-v3.independent-a.final.freeze.json', 'targeted-v4/targeted-v4.independent-a.final.freeze.json']]
for seal in prior_seals:
    for b in read(seal)['frozenFiles']: assert bind(ROOT / b['path']) == b
assert read(PRIOR / 'targeted-v4/one-whole-case-answer-independent-a.actual.json')['candidateScienceState']['P20'] == 'PASS for scoped candidate after all targeted remediations'
materials = read(ROOT / entry['wholeMaterials']['path'])
assert materials == read(V4 / 'twenty-whole-goals-forty-common-DEEN-cases.author-v4.json')
assert len(materials['goals']) == 20 and sum(len(g['cases']) for g in materials['goals']) == 40
previous_p = {g['goalId']: g for g in lines(V4 / 'P20.targeted-one-answer.author-v4.review.jsonl')}
final_p = {g['goalId']: g for g in lines(ROOT / entry['wholeCurrentP20']['path'])}
old_images = {r['goalId']: r for r in read(FIRST_IMAGES / 'first-ten-original-raster.independent-a.verdicts.json')['reviews']}
for r in images[1:10]: assert bind(ROOT / r['path']) == old_images[r['goalId']]['actualOriginalImage']
model_pages = {g['goalId']: g for g in read(ROOT / entry['actualNativeBookModel']['path'])['pages']}
physical = {g['goalId']: g for g in entry['physicalGoalPages']}
assert len(model_pages) == len(final_p) == len(physical) == 20
pdf_text = subprocess.check_output(['pdftotext', '-layout', str(ROOT / entry['actualPortableNativePdf']['path']), '-'], text=True)
pdf_text_path = OWN / 'actual-native-pdf-full-text.independent-a.txt'
with pdf_text_path.open('x') as stream: stream.write(pdf_text)
pages = pdf_text.split('\f')
assert len([p for p in pages if p.strip()]) == 22
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+', '', s)
retained_am = []
for row in read(ROOT / entry['retainedAM']['path'])['retained']:
    live = {g['goalId']: g for g in lines(ROOT / row['originalPath'])}
    exact = lines(ROOT / row['exactRowsPath'])
    assert len(exact) == 20 and all(g == live[g['goalId']] for g in exact)
    retained_am.append({'gate': row['gate'], 'exactCurrentRows': 20, 'newScienceReviews': 0, 'retainedRows': bind(ROOT / row['exactRowsPath'])})
visual_records = []
for r, observation in zip(images, OBSERVATIONS, strict=True):
    gid = r['goalId']; c = before[gid]; f = future[gid]
    assert c == original[gid]
    allowed = copy.deepcopy(c); allowed['resourceLinks'] = f['resourceLinks']; assert allowed == f
    assert final_p[gid]['profile'] == previous_p[gid]['profile']
    for k in ['status', 'reviewAuthority', 'evidenceLevel', 'maximumClaimScope']: assert final_p[gid][k] == previous_p[gid][k]
    page = model_pages[gid]; native_page = physical[gid]; ptext = pages[native_page['physicalPage'] - 1]
    assert norm(page['description']) in norm(ptext) and norm(page['title']) in norm(ptext)
    assert re.search(r'Lernziel-ID\s+' + re.escape(gid), ptext)
    assert len(re.findall(r'Lernziel-ID\s+[a-f0-9-]{36}', ptext)) == 1
    assert page['title'] == c['title'] and page['description'] == c['description']
    assert page['visualization']['originalDigest'] == 'sha256:' + r['sha256']
    assert page['visualization']['altText'] == r['altDe']
    assert set(g['goalId'] for g in page['requires'] + page['externalPrerequisites']) == set(c['requires'])
    captures = read(ROOT / entry['actualImageWidthCaptures'][gid])
    assert captures['sourcePath'] == r['path'] and captures['sourceSha256'] == r['sha256']
    assert [a['width'] for a in captures['captures']] == [360, 680]
    assert all(a['measured']['objectFit'] == 'contain' and a['measured']['renderedWidth'] == a['width'] for a in captures['captures'])
    visual_records.append({'goalId': gid, 'ordinal': r['ordinal'], 'machineCandidateDecision': 'KEEP', 'scientificAndVisualVerdict': 'PASS',
        'actualObservedFullRaster': bind(ROOT / r['path']), 'actualObservedChromiumCaptures': [bind(ROOT / a['path']) for a in captures['captures']],
        'actualObservedNativePdfPage': native_page, 'substantiveActualObservationsDe': observation,
        'nativePageObservation': 'Complete actual physical PDF goal page viewed: title/ID, selected raster, full current goal, breadcrumbs, applicability and prerequisites/successors fit without clipping or overlap. No broader national source closure inferred.',
        'fullRasterReviewBasis': 'retained exact own previous first original PASS' if 2 <= r['ordinal'] <= 10 else 'actual full selected original viewed in this final review',
        'provenance': {'provider': r['provider'], 'servingModel': r['servingModel'], 'prompt': bind(ROOT / r['promptPath']), 'actualToolReceipt': bind(ROOT / r['toolProvenancePath'])},
        'imageAndAltCorrespond': True, 'formatDecision': 'KEEP friendly clear comic PNG1672x941 landscape approximately16:9; no generator-based replacement',
        'humanApproval': False, 'deviceAcceptanceClaim': False, 'actual360680Scope': 'Actual Chromium image-element screenshot sizing, not a physical-device or full-app acceptance test.'})
write(OWN / 'actual-twenty-V-first-independent-a.verdicts.json', {'schemaVersion': 1, 'artifactKind': 'actual20-final-frozen-raster-native-page-independent-A-first-verdicts',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'actualAgent': '/root/flora_fauna_independent_a', 'records': visual_records,
    'peerReviewReadBeforeThisFirstSeal': False, 'candidateV20Pass': 20, 'keep': 20, 'reject': 0, 'hold': 0, 'findings': [],
    'actualReadCounts': {'currentFullSelectedRasterReviewed': 20, 'retainedExactlyUnchangedOwnFirstOriginalPasses': 9, 'newActualFullOriginalViews': 11, 'chromium360': 20, 'chromium680': 20, 'completePhysicalNativeGoalPages': 20},
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})
write(OWN / 'ordinal1-first-image-HOLD-targeted-resolution.independent-a.actual.json', {'artifactKind': 'append-only original image HOLD resolution',
    'originalFirstSeal': bind(FIRST_IMAGES / 'first-ten-original-raster.independent-a.first.freeze.json'),
    'originalPortableFollowupSeal': bind(FIRST_IMAGES / 'first-ten-original-raster.independent-a.portable.followup.freeze.json'),
    'originalDecision': 'HOLD ordinal1v1 actor book/notebook orientation', 'currentDecision': 'KEEP ordinal1v2 actual corrected over-shoulder direction',
    'actualInspectedInputs': visual_records[0], 'historicalHoldUnchanged': True, 'activeWrites': 0, 'humanApproval': False})
write(OWN / 'actual-current-D-P-context-source-retention.independent-a.receipt.json', {'schemaVersion': 1, 'artifactKind': 'actual-final-current-flora20-bindings-retaining-genuine-whole-science',
    'retainedGenuinePriorScientificSeals': [bind(p) for p in prior_seals], 'actualPriorWholeSourceReading': bind(PRIOR / 'actual-primary-whole-section-reading.independent-a.receipt.json'),
    'scientificReviewer': '/root/flora_fauna_independent_a', 'priorScientificHistory': 'Initial independent A:20 D KEEP and18 P PASS,2 actual P holds. Genuine targeted v3 whole four-case/two-profile review resolved P09/P10; targeted v4 explicitly retained peer-reported missing Y linden heart-shaped-leaf rationale and independently confirmed its whole DE/EN answer/operative expectation correction. Historical first holds retained.',
    'currentWholeGoalBodiesUnchanged': 20, 'operativePWholeProfilesExactlyRetainedFromActuallyReviewedV4': 20,
    'wholeFinal40MaterialsExactlyRetainedFromActuallyReviewedV4': 40, 'wholeTasksModelAnswersRubricsAndBothLanguages': 'genuine prior full A review plus actual targetedv3/v4 rechecks retained, not science inferred from hashes',
    'sourceProvenanceSourceRefPrerequisitesApplicabilityAndCanonContextUnchanged': 20, 'candidateGoalOnlyChangedField': 'resourceLinks',
    'actualNativeWholeGoalPageTextAndIDVerified': 20, 'retainedAM': retained_am,
    'memoryBoundary': 'Unchanged existing flower memorization/cards and required wider visibility closure retain the genuine previous A/author native checks; exact current20 A/M decisions unchanged. No new cards, no invented new deck review.',
    'sourceBoundary': entry['sourceBoundary'], 'conditionalFishAlternatives': entry['conditionalFishChoiceAlternatives'],
    'sourceChoiceDissentRetainedTruthfully': 'Primary HE6.2 permits bird OR fish in depth with brief other-class comparison; actual current native view still includes both specialization targets. Do not equate exact current-page bindings with national full-source coverage or a curriculum-policy student test.',
    'allCountrySourceClosureClaim': False, 'candidateCurrentP20ScientificVerdict': 'PASS_E1_G1 after genuinely reviewed remediations, with actual new image/page compatibility checked',
    'nativeBookPPanel': 'Review-only model has separate exact P20 input; null panel evidence is not human approval or absent supplied P science.',
    'PStatus': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'realLearnerEvidence': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
campaign = read(NATIVE / 'round-a/description-review-campaign.json')
actual = read(NATIVE / 'round-a/description-review-input.json')
batch = campaign['batches'][0]; run_id = 'biologie-flora-fauna20-final-raster-native-independent-a-20261008-v1'
out = OWN / 'round-a/results'; out.mkdir(parents=True, exist_ok=True)
by_visual = {r['goalId']: r for r in visual_records}
records = []
for g in actual['goals']:
    gid = g['goalId']; expectations = final_p[gid]['profile']['expectations']; evidence = {}
    assert g['currentDescriptionDe'] == before[gid]['description']
    for suffix in ['De', 'En']:
        evidence['essentialUnderstanding' + suffix] = ' '.join(x['essentialUnderstanding' + suffix] for x in expectations)
        evidence['observablePerformance' + suffix] = expectations[0]['observablePerformance' + suffix]
        evidence['transferExpectation' + suffix] = expectations[-1]['observablePerformance' + suffix]
    records.append({'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1,
        'recordId': run_id + '.' + gid, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': actual['bundleFingerprint'], 'bookDigest': actual['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': evidence,
        'rationale': 'Gültige eigene unabhängige A-Prüfung aller20 ganzen DE/EN-Ziele,40 ganzen Fälle und originaler begrenzter Curriculumstellen einschließlich wirklich gelesener v3/v4-Korrekturen erhalten. Die sechs bilingualen Verständnis-/Leistungsfelder stammen aus dem exakt gültig erhaltenen P-Profil; keine erfundene neue Lernendenleistung oder Science nur aus Hashabgleich. Jetzt vollständige native Seite und neue Bild-/Kontext-/Quellenbindung tatsächlich geprüft. ' + by_visual[gid]['substantiveActualObservationsDe'] + ' Quellenumfang und aktueller Text unverändert; kein Länder-Gesamtnachweis oder Menschengate.',
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
records_path = out / (batch['batchId'] + '.records.jsonl')
with records_path.open('x') as stream:
    for row in records: stream.write(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + '\n')
bundle = read(NATIVE / 'round-a/review-bundle-manifest.json')
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': actual['bundleFingerprint'], 'bookDigest': actual['bookDigest'],
    'provider': 'OpenAI', 'model': 'Codex independent A; exact serving revision not exposed', 'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'Actual independent full20 final raster/page recheck retaining genuine own prior source/whole-case science; exact serving sampling params unavailable').hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model', 'book_pdf', 'book_pdf_render_manifest', 'review_input_json', 'review_prompt', 'review_criteria']],
    'startedAt': datetime.fromtimestamp((OWN / 'actual-width-captures-original-pixels-01-05.png').stat().st_mtime, timezone.utc).isoformat(),
    'completedAt': datetime.now(timezone.utc).isoformat(), 'outputDigest': sha(records_path), 'status': 'completed', 'toolchainVersion': 'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
write(out / (batch['batchId'] + '.run.json'), run)
pconfig = read(AUTHOR / 'P20.current-text-preimage.author.config.json')
pconfig.update(reviewId=next(iter(final_p.values()))['reviewId'], landscapePath=entry['futureInertCanonical']['path'],
    semanticKindLedgerPath=str((FINAL / 'candidate/semantic-kinds.current474-twenty-raster-inert.json').relative_to(ROOT)), reviewPath=entry['wholeCurrentP20']['path'])
pconfig['scope']['label'] = 'Independent A exact final20 raster bindings; genuine unchanged scoped whole-case science retained'
write(OWN / 'P20.exact-final-inert.native.config.json', pconfig)
write(OWN / 'P20.exact-final-author-input.binding.json', {'path': entry['wholeCurrentP20']['path'], 'sha256': entry['wholeCurrentP20']['sha256'],
    'independentScientificBasis': 'actual-current-D-P-context-source-retention.independent-a.receipt.json', 'newProfileScientificAuthorship': False, 'status': 'needs_human_review', 'reviewAuthority': 'ai_candidate'})
files = [p for p in OWN.rglob('*') if p.is_file()]
write(OWN / 'first-final-D-P-V20.independent-a.freeze.json', {'schemaVersion': 1, 'artifactKind': 'independent-A-flora20-first-final-actual-DPV-freeze',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'exactAuthorInputSeal': bind(SOURCE / 'final-flora-fauna20-raster-native-author-input.freeze.json'),
    'frozenFiles': [bind(p) for p in sorted(files)], 'peerReviewReadBeforeSeal': False,
    'currentD20KEEP': 20, 'currentP20ScopedSciencePASS': 20, 'actualCandidateV20PASS': 20, 'openFindings': [],
    'ownOriginalOrdinal1HoldResolvedByActualV2Inspection': True, 'noActiveIntegrationPerformed': True, 'strictGainClaimed': 0,
    'humanApproval': False, 'humanTrial': False, 'nativeSchemaValidation': 'pending separate actual targeted checker receipt; not asserted by this science-first seal'})
print('Sealed independent A:20 current D KEEP,20 genuine retained scoped P PASS,20 actual V KEEP.40 real width captures,20 complete pages; no peer read,active write or human approval.')
