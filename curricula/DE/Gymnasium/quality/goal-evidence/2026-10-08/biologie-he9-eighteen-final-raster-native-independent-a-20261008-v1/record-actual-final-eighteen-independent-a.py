# SPDX-License-Identifier: Apache-2.0
"""Record actual independent review, retaining previously read whole science."""
import copy
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he9-eighteen-final-raster-native-author-root-20261008-v1'
IMAGE = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he9-nineteen-image-author-root-20261008-v1'
NATIVE = AUTHOR / 'native-raster-candidate/eighteen'
PRIOR = OWN.parent / 'biologie-he9-nineteen-science-first-independent-a-20261008-v1'

def read(p): return json.loads(p.read_text())
def lines(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream: stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+', '', s)
def verify_seal(p):
    value = read(p)
    files = value.get('files', value.get('frozenFiles'))
    assert files is not None
    for b in files: assert bind(ROOT / b['path']) == b
    return {'seal': bind(p), 'actualFilesVerified': len(files)}

# These are actual observations of every full PNG, both exact Chromium widths,
# and every complete native PDF page, not judgments inferred from JSON or hashes.
OBS = {
1: 'Augenschnitt: Hornhaut, Irisöffnung/Pupille, Linse, Glaskörper, innenliegende Netzhaut und hinten abgehender Sehnerv sind räumlich schlüssig. Die drei kurzen großen Labels zeigen auf Linse, Netzhaut und Sehnerv. Die Pupille ist kein eigener Vollkörper. Der gewählte Augenweg illustriert eine gültige Quellenalternative und fordert keine gleichzeitige Ohrleistung. Bei360/680 sind Hauptbauteile und Labels erkennbar.',
2: 'V2 verbindet den aufrechten Gegenstand mit umgekehrter Orientierung auf der hinteren Netzhaut und dem Rezeptor-Inset Licht→Signal. Der breite blaue gekrümmte Zuordnungspfeil ist ein schematischer Abbildungshinweis, keine vollständige geometrische Strahlenkonstruktion oder Behauptung gekrümmter Lichtstrahlen. Ein falscher Fokusmarker wird nicht gezeigt. Rezeptor-/Nervenübergang bleibt ein Grundmodell, keine vollständige Retina-Schaltung. Gegenstand, Umkehrung und Signal sind bei360/680 klar; Augenweg bleibt Alternative.',
3: 'Das Kind wartet an der roten Ampel auf dem Gehweg. Auge→Gehirn→Muskel ordnet Aufnahme, Verarbeitung und Reaktion korrekt; kein direkter Licht-Muskel-Weg oder universeller Reflexautomatismus. Die Ampel lädt nicht zum Überqueren bei Rot ein. Hauptfolge und kurze Funktionswörter bleiben bei360/680 erkennbar.',
4: 'Mensch und Biene vergleichen dieselbe Blüte in ausdrücklich als Modell bezeichneten unterschiedlichen Wahrnehmungsdarstellungen. Ein ultraviolettbezogenes Muster ist kein Foto subjektiven Bienenerlebens oder universelle Eigenschaft jeder Blüte. Beim aktuell tatsächlich geprüften Hörvergleich wird gleicher äußerer Schalldruckpegel nicht mit gleicher subjektiver Lautheit verwechselt. Hauptvergleich/Modelllabel ist bei360/680 erkennbar.',
5: 'Schutzbrille, Ohrschutz und Lautstärkeregler stehen für Schutz; gesonderte Gehirnsignale und gekreuzte Alkoholflasche für mögliche Beeinträchtigung der Verarbeitung. Die Wellen sind Symbolik, keine echten EEG-Messwerte, Dosisanweisung oder klinische Diagnose. Zentrale Motive bleiben bei360/680 verständlich.',
6: 'Rote bikonkave kernlose Erythrozyten, ein beispielhafter Leukozyt mit gelapptem Kern, kleine Thrombozytenfragmente und gelber flüssiger Hintergrund sind differenziert. Das Vergrößerungsbild behauptet keine exakten relativen Häufigkeiten. Die drei korrekt geschriebenen Labels bleiben bei360/680 zugeordnet; Plasma ist als Flüssigkeitsumgebung dargestellt.',
7: 'Drei getrennte Motive ordnen O2-Transport den roten Zellen, Gerinnung einem Thrombozyten-/Fibrinnetz im Gefäßdefekt und Abwehr einem phagozytierenden Leukozyten zu. O2-Symbole sind Transportzuordnung, keine Behauptung ausschließlicher Oberflächenbindung. Das Bild zeigt Beispiele, keine vollständige Gerinnungskaskade oder ausschließlich zelluläre Immunität. Die echte P-Korrektur zum Fehlen wirksamer Gerinnungsproteine ist berücksichtigt. Motive/Labels sind bei360/680 klar.',
8: 'V3: A-Zellmerkmale bleiben ungebunden, Anti-B verbindet B-Merkmale zweier roter Zellen tatsächlich über die beiden Armenden eines Y; der Stamm bleibt frei. Der zentrale Anti-B-Pfeil zeigt Vergleich einer zugegebenen Bindungsprobe, nicht natürliches Anti-B im normalen Blutgruppen-B-Plasma. Dies ist ein begrenztes Antigen-Antikörper-Modell und kein Transfusionsplan. P-Fälle unterscheiden zusätzlich AB0/RhD, rote-Zell- gegenüber Plasma-Kompatibilität und erworbene Anti-D-Bildung. Zentrale Labels und Bindungsrelation sind bei360/680 erkennbar.',
9: 'Infektionsmotiv zeigt phagozytierten Fremderreger, Transplantatmotiv die Erkennung fremder Gewebeoberflächen. Cartoon-Immunzellen vereinfachen die Kooperation; nicht jede kleine Zelle wird als phagozytierende T-Zelle beschriftet. Ein allgemeines Schild ist keine Behauptung, Transplantatabstoßung sei für den Empfänger vorteilhaft. Beide Kontexte bleiben bei360/680 unterscheidbar.',
10: 'HIV bindet an eine als CD4-Zelle benannte Zelle; schematische Vermehrung und Therapiehemmung stehen getrennt. Das Bild behauptet weder Heilung noch einen vollständigen molekularen Retroviruszyklus. Die ganzen P-Fälle trennen HIV von AIDS, verhindern Stigmatisierung und beschränken U=U auf sexuelle Übertragung bei nicht nachweisbarer Viruslast unter wirksamer ART. Hauptlabels/Blockiermotiv sind bei360/680 klar; keine persönliche klinische Beratung.',
11: 'V2: Follikel, aus dem aufbrechenden Follikel freigesetzte Eizelle und anschließend aus Follikelgewebe entstehender Gelbkörper stehen in schlüssiger Folge; LH ist dem Eisprung zugeordnet. Die Eizelle verwandelt sich nicht in den Gelbkörper. Vereinfachte Stufen behaupten keinen starren universellen28-Tage-Zyklus. Follikel/Ei/Gelbkörper/LH bleiben bei360/680 erkennbar; volle P-Fälle umfassen die übrige hormonelle Steuerung.',
13: 'Nein, Handzeichen und respektierter Abstand illustrieren Grenzen und Selbstbestimmung, ohne Druck, Stigmatisierung oder persönliche Offenlegung. Die kleinen Zusatztafeln vertiefen Werte, sind kein bei360 verpflichtend zu entziffernder Text. Zentrales Nein und respektvolles Gegenüber bleiben bei360/680 klar; P diskutiert soziale und ethische Begründungen in fiktiven Situationen.',
14: 'TSH läuft von der schematischen Hypophyse zur Schilddrüse; T4-Produktion und zurückführende Hemmung enden an einem inhibitorischen Balken. Die Grundrelation negativer Rückkopplung ist richtig, ohne vollständige TRH-Achse, Messwertdiagnostik oder universelle Hormonerklärung. Bei360/680 bleiben TSH/T4, Stimulation und Hemmung klar. Das Regelkreismodell ist im HE-Primärtext fakultativ und wird nicht als universeller Pflichtoperator ausgegeben.',
15: 'V2 zeigt im eigenen Modell2n=4 je vier Chromosomen in beiden mitotischen Tochterzellen und n=2 in vier meiotischen Produkten, also Chromosomenzahl statt Chromatidzahl. Die zwei identischen meiotischen Paare ohne dargestelltes Crossing-over heißen nun Vier haploide Gameten, nicht vier genetisch verschiedene. Die symmetrische generische Darstellung illustriert ein mögliches Gametenmodell und behauptet keine vier gleichwertigen menschlichen Eizellen; die vollständigen Fälle nennen ausdrücklich die ungleiche Eizellbildung. Bei360 sind Zellzahlen, Chromosomen und Hauptlabels erkennbar; feine Phasenwörter sind klein und kein einziges Lernmaterial.',
16: 'Aa×Aa ergibt in der korrekt ausgerichteten Tabelle AA,Aa,Aa,aa und im ausdrücklich möglichen Kombinationsmodell drei dominante lilafarbene und eine rezessive weiße Blüte. Dies ist ein einfaches Pflanzen-/Modellmerkmal und keine Generalisierung auf Zungenrollen oder alle menschlichen Merkmale. Die Schreibtafeln stehen einem externen Betrachtungsmodell zugeordnet; keine handelnde Person liest ein verkehrtes Heft. Bei360/680 bleiben Allele und Kreuzungsrelation erkennbar; lange Zusatzlabels sind kleiner.',
17: 'Modellfamilie: zwei nicht betroffene heterozygote Eltern Aa können eine betroffene Tochter aa haben; der nicht betroffene Sohn bleibt AA oder Aa unbestimmt. Geschlechts-/Betroffenheitssymbole und Verbindungen sind konsistent. Kein tatsächlicher Familienbefund, sichere Diagnose oder universeller Beweis aus einem kleinen realen Stammbaum. Modelldeklaration, Allele und Legende bleiben bei360/680 klar.',
18: 'Der ausdrücklich als Ausschnitt markierte Karyogrammvergleich zählt zwei gegenüber drei ganzen Chromosomen21. Die vergrößerten zweichromatidigen X-Strukturen werden nicht als vier/sechs separate Chromosomen gezählt. Das Hintergrundschema ist Anschauung, kein vollständiger realer Laborbefund; keine klinische Diagnose. Bei360/680 bleiben Paar21, Trisomie21 und der Kontrast zwei/drei erkennbar; kleinste Hintergrundzahlen und Notizzettel sind Zusatz.',
19: 'Drei getrennte Motive unterscheiden Analyse einer DNA-Probe, somatische Genaddition per Vektor in eine Körperzelle und Vermehrung eines rekombinanten Plasmids in Bakterien. Die ursprüngliche DNA bleibt im Therapiebild erhalten; keine garantierte Heilung, Keimbahnänderung oder identische Kopie ganzer Menschen. Plasmidkopien behalten denselben DNA-Abschnitt. Bei360 sind die drei Verfahren und Hauptmotive erkennbar; kleinteilige Zusatzlabels sind ausdrücklich nicht als bequem lesbarer Pflichttext ausgegeben. Bei680/native Seite sind sie größer.',
}

entry = read(AUTHOR / 'neutral-eighteen-actual-raster-native-independent-review.entry.json')
seal = ROOT / entry['authorInputFreezePath']
assert sha(seal) == entry['authorInputFreezeSha256']
author_verified = verify_seal(seal)
assert author_verified['actualFilesVerified'] == 230
pending = read(OWN / 'pending/exact-eighteen-whole-goals-profiles-and-forty-conditional-DEEN-cases.input.json')
prior_by = {r['goal']['id']: r for r in pending['records']}
whole = {g['id']: g for g in read(ROOT / entry['wholeGoalBodiesPath'])['goals']}
before = {g['id']: g for g in read(AUTHOR / 'candidate/canonical.before-eighteen-links.exact.json')['goals']}
future = {g['id']: g for g in read(AUTHOR / 'candidate/canonical.current474-eighteen-new-raster-author.json')['goals']}
model = read(NATIVE / 'book-model.json')
by_page = {p['goalId']: p for p in model['pages']}
physical = {p['goalId']: p['physicalPage'] for p in entry['nativePhysicalGoalPages']}
profiles = {r['goalId']: r for r in lines(ROOT / entry['operativeNativeP18'])}
materials = {r['goalId']: r for r in read(ROOT / entry['operativeWholeCasesJson'])['goals']}
images = read(ROOT / entry['actualPNGSelectionManifest'])['images']
text_pages = (OWN / 'actual-native-book.whole-text.independent-a.txt').read_text().split('\f')
assert len([p for p in text_pages if p.strip()]) == 20
assert len(whole) == len(profiles) == len(images) == len(physical) == 18
assert sum(len(r['cases']) for r in materials.values()) == 40
assert entry['omittedGoalId'] not in whole
retained_seals = read(OWN / 'pending/actual-retained-science-and-targeted-four-input-bindings.independent-a.json')['seals']
for value in retained_seals.values(): assert verify_seal(ROOT / value['seal']['path']) == value
retained_am = verify_seal(ROOT / entry['retainedAMSeal'])
assert retained_am['actualFilesVerified'] == 45
records = []
for im in images:
    gid = im['goalId']; ordinal = im['ordinal']; goal = whole[gid]; page = by_page[gid]
    assert goal == before[gid] == prior_by[gid]['goal']
    allowed = copy.deepcopy(goal); allowed['resourceLinks'] = future[gid]['resourceLinks']; assert allowed == future[gid]
    assert profiles[gid]['profile'] == prior_by[gid]['wholeCurrentV2Profile']
    assert materials[gid]['cases'] == prior_by[gid]['wholeCases']['cases']
    assert profiles[gid]['status'] == 'needs_human_review' and profiles[gid]['reviewAuthority'] == 'ai_candidate'
    assert profiles[gid]['evidenceLevel'] == 'E1' and profiles[gid]['maximumClaimScope'] == 'G1'
    assert page['title'] == goal['title'] and page['description'] == goal['description']
    assert page['visualization']['originalDigest'] == 'sha256:' + im['sha256']
    assert page['visualization']['altText'] == im['altDe']
    assert sha(ROOT / im['path']) == im['sha256']
    assert set(r['goalId'] for r in page['requires'] + page['externalPrerequisites']) == set(goal['requires'])
    ptext = text_pages[physical[gid] - 1]
    assert norm(goal['title']) in norm(ptext) and norm(goal['description']) in norm(ptext)
    assert re.search(r'Lernziel-ID\s+' + re.escape(gid), ptext)
    assert len(re.findall(r'Lernziel-ID\s+[a-f0-9-]{36}', ptext)) == 1
    capture = read(IMAGE / 'inspection-captures' / gid / 'chromium-captures.actual.json')
    assert capture['sourcePath'] == im['path'] and capture['sourceSha256'] == im['sha256']
    assert [r['width'] for r in capture['captures']] == [360,680]
    assert all(r['measured']['renderedWidth'] == r['width'] and r['measured']['objectFit'] == 'contain' for r in capture['captures'])
    records.append({'goalId': gid, 'ordinal': ordinal, 'machineCandidateDecision': 'KEEP', 'scientificAndVisualVerdict': 'PASS',
        'actualObservedFullRaster': bind(ROOT / im['path']), 'actualObservedChromiumCaptures': [bind(ROOT / r['path']) for r in capture['captures']],
        'actualObservedNativePdfPage': {'physicalPage': physical[gid], **bind(IMAGE / 'native-pdf-captures' / f'goal-page-{physical[gid]:02d}.png')},
        'substantiveActualObservationsDe': OBS[ordinal], 'nativePageObservation': 'Whole actual PDF page viewed: current title, ID, raster, full description, prerequisites, successors and applicability fit without overlap or clipping. No all-country operator proof inferred from visibility.',
        'fullRasterReviewBasis': 'actual complete selected original viewed in this final review; every360/680 original-pixel capture and whole native page actually viewed',
        'formatDecision': 'KEEP friendly wide PNG approximately16:9, actual1672x941 or1671x941. No generator-based redesign.',
        'provenance': {'provider': im['provider'], 'servingModel': im['servingModel'], 'prompt': bind(ROOT / im['promptPath']), 'actualToolReceipt': bind(ROOT / im['toolProvenancePath'])},
        'imageAndAltCorrespond': True, 'deviceAcceptanceClaim': False, 'widthReviewScope': 'Actual Chromium image-element sizing, not actual phone/full-app acceptance.', 'humanApproval': False})
write(OWN / 'actual-eighteen-V-first-independent-a.verdicts.json', {'schemaVersion': 1, 'artifactKind': 'actual eighteen whole-raster native-page independent-A first verdicts', 'recordedAt': datetime.now(timezone.utc).isoformat(),
    'actualAgent': '/root/chemistry_open_packets', 'records': records, 'candidateV18Pass': 18, 'keep': 18, 'hold': 0, 'reject': 0, 'findings': [],
    'actualReadCounts': {'completeOriginalPNGs': 18, 'chromium360': 18, 'chromium680': 18, 'completeNativeGoalPages': 18},
    'peerFinalBReadBeforeSeal': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})
write(OWN / 'actual-current-D-P-context-source-retention.independent-a.receipt.json', {'schemaVersion': 1, 'artifactKind': 'whole18 current science and final raster-native binding independent A',
    'recordedAt': datetime.now(timezone.utc).isoformat(), 'exactAuthorInput': author_verified, 'retainedGenuineScience': retained_seals,
    'wholeGoalBodiesExact': 18, 'wholeProfileBodiesRetainedExact': 18, 'wholeDEENCasesRetainedExact': 40,
    'scientificHistory': 'Own actual original whole19/38case/wholeHE9 primary reading and first science seal retained. Actual four targeted profile/material changes reread, conditional ear pathways independently checked against official NIDCD whole main article. Initial real eye-OR-ear findings substantively resolved, Ord12 semantic split remains excluded. Remaining unchanged14 whole scoped profiles not historically restarted.',
    'wholePrimaryReading': {'url': entry['wholePrimaryUrl'], 'sha256': entry['wholePrimarySha256'], 'physicalPages': [23,24,25,26,27], 'printedPages': [22,23,24,25,26], 'receipt': bind(PRIOR / 'actual-primary-readings.independent-a.receipt.json'), 'actualRereading': 'whole five pdftotext page contents read during this actual final review'},
    'additionalActualPrimaryReading': {'url': 'https://www.nidcd.nih.gov/health/how-do-we-hear', 'scope': 'Actual web whole main six hearing steps read; does not copy the image-alt Eustachian-tube misclassification. Mechanical eardrum/ossicle/cochlear flow, hair-cell transduction, auditory nerve and brain align with alternative cases.'},
    'currentOriginalSourceDutyMapRetained': bind(PRIOR / 'current-source-route-map.independent-a.json'),
    'sourceDutyBoundary': 'Legacy numbered HE authored competence condensations are not verbatim original PDF operators. WholeHE9 content and current selected whole-goal duty are distinguished from adjacent other-goal duties. Regional partner rows are contextual mappings; this final review does not pretend to reread all national original operator texts or impose the union of all partner content on each goal.',
    'sourceEyeOREarRetained': True, 'hormonalFeedbackFacultativeRetained': True, 'tongueRollingNotSimpleMendel': True,
    'UequalsUScope': 'Under effectiveART with undetectable viral load, sexual transmission; not all transmission routes or cure.',
    'caseAndProfileScientificState': 'PASS for the18 scoped current whole E1/G1 candidate profiles; own prior true science retained plus genuine targeted corrections and actual final image-page compatibility.',
    'PStatus': 'needs_human_review', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'retainedAM': retained_am, 'AMScientificRestart': False, 'wholeNativePageTextAndIDVerified': 18,
    'nonblockingReviewBundleMetadataObservation': 'Inactive QA-only book-model title still says Flora und Fauna although selected18 concernHE9 senses/blood/sexuality/genetics. Whole actual goal pages use correct titles/descriptions; this does not change any published book title or selected competence.',
    'wholeCountrySourceApprovalClaim': False, 'realLearnerEvidence': False, 'clinicalAdvice': False, 'Ord12Included': False,
    'peerFinalBReadBeforeSeal': False, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False})

campaign = read(NATIVE / 'round-a/description-review-campaign.json')
native_input = read(NATIVE / 'round-a/description-review-input.json')
bundle = read(NATIVE / 'round-a/review-bundle-manifest.json')
batch = campaign['batches'][0]
assert len(campaign['batches']) == 1 and campaign['goalCount'] == 18
run_id = 'biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1'
results = OWN / 'round-a/results'; results.mkdir(parents=True, exist_ok=True)
review_records = []
by_visual = {r['goalId']:r for r in records}
for g in native_input['goals']:
    gid = g['goalId']; expectations = profiles[gid]['profile']['expectations']; evidence = {}
    for suffix in ['De','En']:
        evidence['essentialUnderstanding' + suffix] = ' '.join(r['essentialUnderstanding' + suffix] for r in expectations)
        evidence['observablePerformance' + suffix] = expectations[0]['observablePerformance' + suffix]
        evidence['transferExpectation' + suffix] = expectations[-1]['observablePerformance' + suffix]
    review_records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion':1,
        'recordId':run_id+'.'+gid, 'runId':run_id, 'campaignId':campaign['campaignId'], 'roundId':campaign['roundId'],
        'bundleFingerprint':native_input['bundleFingerprint'], 'bookDigest':native_input['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':'keep', 'understandingEvidence':evidence,
        'rationale':'Gültige eigene ganzeHE19Science-A und echte gezielte Viererbehebung erhalten; alle18 aktuellen ganzen DE/EN-Ziele/40 ganzen Fälle und Erwartungen sind identisch zum tatsächlich geprüften begrenzten Stoff. Die sechs bilingualen Verständnisfelder sind explizite aktuelle positive-understanding-evidence-v2-Profile, keine behauptete Lernendenleistung. Jetzt die vollständige native Seite, aktuelle Bild-/Quellen-/Kontextbindung, alle18 Original-PNGs und36 wirkliche360/680-Captures fachlich und visuell geprüft. '+by_visual[gid]['substantiveActualObservationsDe']+' Kein Länder-Gesamtnachweis oder Menschengate; Ord12 bleibt als echter Split offen.',
        'evidenceProfileContract':'positive-understanding-evidence-v2', 'evidenceProfileRecommendation':'none', 'recordStatus':'candidate','reviewAuthority':'ai_candidate'})
record_path = results / (batch['batchId'] + '.records.jsonl')
with record_path.open('x') as stream:
    for r in review_records: stream.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
start = read(OWN / 'actual-final-neutral-input-and-review-start.independent-a.json')['reviewStartedAt']
run = {'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':native_input['bundleFingerprint'],'bookDigest':native_input['bookDigest'],
    'provider':'OpenAI','model':'Codex actual independent A; serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Actual independent A full18 raster-page and retained whole science review; serving sampling unavailable').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],
    'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
    'startedAt':start,'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':'sha256:'+sha(record_path),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write(results / (batch['batchId']+'.run.json'),run)
files = sorted(p for p in OWN.rglob('*') if p.is_file())
write(OWN / 'first-final-D-P-V18.independent-a.exact.freeze.json', {'schemaVersion':1,'artifactKind':'independent A HE18 first actual final science raster-native freeze',
    'recordedAt':datetime.now(timezone.utc).isoformat(),'authorInput':bind(seal),'frozenFiles':[bind(p) for p in files],
    'D18KEEP':18,'P18ScopedSciencePASS':18,'V18ActualRasterPASS':18,'openSelectedFindings':[],
    'excluded12GenuineSplitStillOpen':True,'peerFinalBReadBeforeSeal':False,'nativeTechnicalValidation':'pending own separate genuine native checks; not implied by science seal',
    'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print('Own first final A seal:18DKEEP/18 scopedPsciencePASS/18 actualVKEEP.40cases/36widths/18wholepages;12excluded;nativevalidationpending.')
