import hashlib
import json
import pathlib
import re
import subprocess
from datetime import datetime, timezone

ROOT = pathlib.Path.cwd()
OWN = pathlib.Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he7-ten-final-raster-native-author-root-20261008-v1'
SCIENCE = OWN.parent / 'biologie-he7-ten-whole-science-source-P-independent-b-20261008-v1'
SCIENCE_AUTHOR = OWN.parent / 'biologie-he7-foundations-cells-photosynthesis-ten-whole-science-author-20261008-v1'
RUN_ID = OWN.name

def read(p): return json.loads(p.read_text())
def rows(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rel(p): return str(p.relative_to(ROOT))
def bind(p): return {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+', '', s)
def without_images(g): return {k:v for k,v in g.items() if k != 'resourceLinks'}

started = datetime.now(timezone.utc).isoformat()
seal = AUTHOR / 'ten-current-raster-native-author-input.first.freeze.json'
assert sha(seal) == 'd49f60eaeefc970611d3fb2203fe8f6ac185107f954caaa1fe8a1b33fdcdcfd6'
frozen = read(seal)
assert len(frozen['frozenFiles']) == 198
for item in frozen['frozenFiles']:
    p = ROOT / item['path']
    assert p.is_file() and sha(p) == item['sha256'] and p.stat().st_size == item['bytes'], str(p)
old_first = SCIENCE / 'ten-whole-source-P-scientific.independent-b.first.freeze.json'
old_final = SCIENCE / 'ten-whole-source-P-scientific.independent-b.final-portability.freeze.json'
assert sha(old_first) == '1f6671665e6ad413ab5aecdebca4fc61f78fdc45c3e2f0b324b0a31379455cd1'
assert sha(old_final) == 'c25c4ac38bbce9609311750ecec0f0f4b0396be6ebe36be8c7d507a2483ebe23'
for old in [old_first, old_final]:
    for item in read(old)['frozenFiles']:
        p = ROOT / item['path']; assert sha(p) == item['sha256'] and p.stat().st_size == item['bytes']
entry = read(AUTHOR / 'neutral-ten-current-raster-native-independent-review.entry.json')
candidate = read(ROOT / entry['wholeFinalLandscape'])
before = read(AUTHOR / 'candidate/canonical.before-ten-links.exact.json')
whole_goals = read(ROOT / entry['wholeSelectedGoals'])['goals']
old_whole = read(SCIENCE_AUTHOR / 'current-ten-whole-DEEN-goals.actual.json')['wholeGoals']
cases = read(ROOT / entry['twentyCompleteBilingualCases'])['goals']
old_cases = read(SCIENCE_AUTHOR / 'ten-whole-goals-twenty-complete-DEEN-cases.author.json')['wholeCases']
assert [c for g in cases for c in g['cases']] == old_cases
p_rows = rows(ROOT / entry['closedNativeP10'])
old_p_rows = rows(SCIENCE_AUTHOR / 'P10.whole-current-author.review.jsonl')
ids = [g['id'] for g in whole_goals]
assert len(ids) == len(set(ids)) == 10
assert ids == [p['goalId'] for p in p_rows] == [g['goalId'] for g in cases]
old_science = read(SCIENCE / 'ten-whole-goal-source-P-scientific.independent-b.first.verdicts.json')
assert [g['goalId'] for g in old_science['records']] == ids
live_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
live = read(live_path)
live_map = {g['id']:g for g in live['goals']}
before_map = {g['id']:g for g in before['goals']}
candidate_map = {g['id']:g for g in candidate['goals']}
for i,g in enumerate(whole_goals):
    assert without_images(g) == without_images(old_whole[i]) == without_images(candidate_map[g['id']]) == without_images(live_map[g['id']])
    assert p_rows[i]['profile'] == old_p_rows[i]['profile']
    assert without_images(before_map[g['id']]) == without_images(g)
assert all(g == before_map[g['id']] for g in candidate['goals'] if g['id'] not in ids)
unrelated_live_deltas = [{'goalId':g['id'], 'changedFields':[k for k in sorted(set(g)|set(live_map[g['id']])) if g.get(k)!=live_map[g['id']].get(k)]}
    for g in before['goals'] if g['id'] not in ids and g != live_map[g['id']]]
campaign_dir = ROOT / entry['independentCampaignB']
input_ = read(campaign_dir / 'description-review-input.json')
campaign = read(campaign_dir / 'description-review-campaign.json')
bundle = read(campaign_dir / 'review-bundle-manifest.json')
assert input_['goalCount'] == campaign['goalCount'] == campaign['batchSize'] == 10
assert [g['goalId'] for g in input_['goals']] == ids
manifest = read(ROOT / entry['fullActualPNGsAndToolProvenance'])
images = manifest['images']
assert [i['goalId'] for i in images] == ids
source_receipt = read(ROOT / entry['wholeOfficialPrimaryPagesAndExactPdfSourceSha'])
assert source_receipt['sourcePdfSha256'] == '93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
assert [i['physicalPage'] for i in source_receipt['files']] == [3,6,8,19,20]
for item in source_receipt['files']:
    p = ROOT / item['path']; assert sha(p) == item['sha256'] and p.stat().st_size == item['bytes']
pdf = ROOT / entry['operativePDF']
argv = ['pdftotext','-layout',str(pdf),'-']
result = subprocess.run(argv, capture_output=True, text=True)
assert result.returncode == 0, result.stderr
with (OWN / 'actual-whole-native-twelve-page-PDF.independent-b.txt').open('x') as f: f.write(result.stdout)
assert len(result.stdout.split('\f')) - 1 == 12

visual_reasons = [
 'Das reale PNG zeigt eine lernende Person beim Beobachten einer Blüte mit Lupe; Pflanze, Schnecke, Vogel und Fisch verdeutlichen biologische Untersuchungsgegenstände. Hand/Lupe und Blick stimmen mit der Tätigkeit überein. Bei360 bleiben Blüte, Lupe, Person und Biologie-Titel erkennbar, bei680 auch die weiteren Tiere. Das Bild erhebt keine vollständige Methoden- oder tatsächlich durchgeführte Forschungsbehauptung.',
 'Wachstum, lichtgerichtetes Pflanzenwachstum, Stoffaufnahme der Schnecke, Samen/Keimling und Zellaufbau sind mehrere zusammengehörige Lebensmerkmale. Der tatsächliche gekrümmte Stängel zeigt in Richtung der links oben dargestellten Lichtquelle. Das Bild schließt Pflanzen nicht von Reaktionen aus. Die Vierermotive und Zellvergrößerung sind bei360 und680 deutlich; die Zeichnung behauptet nicht, jedes Individuum zeige jederzeit alle Merkmale.',
 'Das tatsächliche Bild zeigt schulisches Mikroskopieren, Einstellung am Mikroskop und separat die kontrollierte schräge Deckglasabsenkung auf feuchtes dünnes Zwiebelmaterial. Das verdeckte Auge kann am Okular sein, während das sichtbare andere Auge geschlossen ist; daraus folgt kein belegter Bedienungsfehler. Die rechteckigen Zwiebelzellen mit Kernen haben keine erfundenen grünen Chloroplasten. Arbeitsablauf und Zellbild sind bei360/680 erkennbar. Dieses Lehrbild beweist keine tatsächliche Bedienungsleistung.',
 'Die ausdrückliche Überschrift Grüne Blattzelle begrenzt den räumlichen Zelltyp. Dicke äußere Wand, innenliegende Membran, randständiges Cytoplasma, große zentrale Vakuole, Kern, Chloroplasten und Mitochondrien sind schlüssig getrennt. Es wird nicht behauptet, jede Pflanzenzelle besitze Chloroplasten. Große Vakuole, Wand, Kern und grüne Organellen bleiben bei360 erkennbar und bei680 klar; keine lesepflichtigen kleinen Organellenlabels.',
 'Das konkrete Blatt-/Tierzellmodell trennt Wand, Chloroplasten und große Zentralvakuole der Blattzelle von der membranbegrenzten Tierzelle. Kern und Mitochondrien sowie der Zellinnenraum sind gemeinsam dargestellt. Die Tierzelle verliert nicht ihre Membran. Beide großen Titel und Unterschiede sind bei360 sichtbar und bei680 deutlich. Geometrische Modellformen sind keine allgemeine Bestimmungsregel für jede Zelle.',
 'Die rechte Hälfte des Ausgangsblatts ist wirklich lichtundurchlässig abgedeckt. Das nachfolgende entfärbte Testblatt hat links im beleuchteten Bereich das blau-schwarze positive Signal und rechts das gelbe negative Signal; Seitenzuordnung stimmt. Bei360/680 bleiben Abdeckung und Ergebnisrelation klar. Das Bild unterstützt den kontrollierten Stärkenachweis; es behauptet weder freie Glucose noch eine direkte momentane Bruttorate und ersetzt die im Profil geforderten Kontrollen nicht.',
 'Zwei vergleichbar beleuchtete Glocken mit gewässerten Pflanzen zeigen normalen CO2-Zugang versus CO2-Entzug durch ein separates Absorptionsgefäß. Die Wassersymbole sind auf beiden Seiten vorhanden; CO2-Mangel wird nicht mit Wassermangel vermischt. Bei360 bleiben beide Ansätze, Entzugssymbol und Wasser sichtbar, bei680 die Absorptionsrichtung klar. Das Beispielbild zeigt die CO2-Reihe; der eigenständige Wasservergleich steht vollständig im P-Vertrag. Kein direkter chemischer Wassersubstratnachweis wird aus dieser Zeichnung abgeleitet.',
 'Links weist die Iodzugabe am entfärbten Blatt einen blau-schwarzen Stärkebereich aus. Rechts besitzt das umgedrehte Gassammelrohr einen geschlossenen oberen Abschluss und seine Öffnung unter Wasser; getrennt folgt die Glimmspanprobe am gesammelten Gas. Die helle Flammenspitze ist das positive Wiederentzünden als Testergebnis und wird nicht als bereits brennender Ausgangsspan verlangt. Bei360/680 sind beide Nachweise und die Reihenfolge deutlich. Gasblasen allein identifizieren keinen Sauerstoff; das Lehrbild behauptet keine Gasreinheit, Glucoseidentifikation oder Bruttorate.',
 'Die tatsächliche gut lesbare Wortdarstellung verbindet Kohlenstoffdioxid plus Wasser mit Traubenzucker plus Sauerstoff. Licht ist getrennt am Prozesspfeil als Energiebedingung, nicht als zusätzlich verbrauchter Stoff, dargestellt. Beide langen Hauptzeilen und Licht sind auch bei360 lesbar und bei680 deutlich. Es handelt sich um eine schulische Wortgleichung, keine behauptete vollständig stöchiometrisch beschriftete Elementarreaktion.',
 'Fotosynthese zeigt Licht, Wasser-/CO2-Aufnahme und Abgabe von organischen Stoffen und O2. Zellatmung wird bei Pflanze und Tier mit energiereichen Stoffen/O2 als Eingängen sowie CO2/Wasser und nutzbarer Energie als Ergebnissen gezeigt. Sonne UND Mond im Atmungsteil widersprechen der Fehlregel, Pflanzen atmeten nur nachts. Die großen Titel, Richtungspfeile und zentralen Motive bleiben bei360/680 sichtbar. Symbolteilchen begründen keine genaue Molekülzählung; Netto- und Bruttoraten werden nicht gleichgesetzt.'
]
assert len(visual_reasons) == 10
v_records, d_records, bindings = [], [], []
for i,(whole,g,p,img,science,whole_case) in enumerate(zip(whole_goals,input_['goals'],p_rows,images,old_science['records'],cases),1):
    goal = candidate_map[g['goalId']]
    assert g['goalFingerprint'] == p['goalFingerprint']
    assert g['currentTitleDe'] == goal['title'] and g['currentTitleEn'] == goal['titleEn']
    assert g['currentDescriptionDe'] == goal['description'] and g['currentDescriptionEn'] == goal['descriptionEn']
    for key in ['requires','contains','applicability','dimensionTags','type','weight','shortKey']:
        assert g['canonicalContext'][key] == goal[key]
    page = g['reviewContext']['page']
    assert page['goalId'] == g['goalId'] and page['pageFingerprint'] == g['pageFingerprint']
    prereq_ids = [x['goalId'] for x in page['requires'] + page['externalPrerequisites']]
    assert sorted(prereq_ids) == sorted(goal['requires'])
    consumer_ids = sorted(x['goalId'] for x in page['reverseRequires'] + page['externalReverseRequires'])
    assert consumer_ids == sorted(x['id'] for x in live['goals'] if g['goalId'] in x.get('requires',[]))
    for reference in page['requires']+page['externalPrerequisites']+page['reverseRequires']+page['externalReverseRequires']:
        assert reference['title'] == live_map[reference['goalId']]['title']
    image_path = ROOT / img['path']; assert sha(image_path) == img['sha256']
    assert page['visualization']['originalDigest'] == 'sha256:' + img['sha256']
    assert page['visualization']['altText'] == img['altDe']
    width_receipt = ROOT / entry['actualWidthCaptures'] / g['goalId'] / 'chromium-captures.actual.json'
    widths = read(width_receipt); assert widths['sourceSha256'] == img['sha256']
    assert [x['width'] for x in widths['captures']] == [360,680]
    for cap in widths['captures']: assert sha(ROOT / cap['path']) == cap['sha256']
    physical_page = i+2
    capture = ROOT / entry['actualPhysicalPageCaptures'] / ('actual-physical-page-'+str(physical_page).zfill(2)+'.png')
    page_text = result.stdout.split('\f')[physical_page-1]
    assert norm(goal['title']) in norm(page_text) and norm(goal['description']) in norm(page_text)
    assert page_text.count('Lernziel-ID '+g['goalId']) == 1
    case_receipts=[]
    for case in whole_case['cases']:
        brief = next(x for x in p['profile']['applicationCaseBriefs'] if x['id']==case['id'])
        for lang,suffix in [('de','De'),('en','En')]:
            assert brief['taskDemand'+suffix] == case['material'][lang]+' '+case['task'][lang]
            assert brief['expectedPerformance'+suffix] == case['modelAnswer'][lang]
        case_receipts.append({'caseId':case['id'],'wholeDEENMaterialTaskAnswerExactToGenuinelyReviewedScience':True})
    visual = visual_reasons[i-1] + ' Tatsächliche ganze native Seite'+str(physical_page)+' enthält die vollständige deutsche Beschreibung, richtige Ziel-ID, Herkunft-/Geltungsdarstellung und den passenden Voraussetzungen-/Nachfolgerkontext ohne Beschnitt oder Bild-/Textwiderspruch. Alt-Text passt zum tatsächlichen Motiv.'
    v_records.append({'ordinal':i,'goalId':g['goalId'],'decision':'KEEP','fachlich':'PASS','visual':'PASS','actualReasonDe':visual,
        'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'bookDigest':input_['bookDigest'],
        'actualImage':bind(image_path),'version':img['version'],'actualToolProvenance':bind(ROOT/img['toolProvenancePath']),
        'actualPrompt':bind(ROOT/img['promptPath']),'actualPDF':bind(pdf),'physicalPage':physical_page,'actualNativePage':bind(capture),
        'actualWidthCaptureReceipt':bind(width_receipt),'actualWidths':[bind(ROOT/c['path']) for c in widths['captures']],
        'fullPNGActuallyViewed':True,'actual360And680ActuallyViewed':True,'actualWholeNativePageActuallyViewed':True,
        'formatDecision':'KEEP1672x941 approximately16:9 PNG; friendly clear comic image compatible with current landscape',
        'fullDeviceOrAppAcceptance':False,'generationOrHashMatchingIsApproval':False,'humanApproval':False})
    exp = p['profile']['expectations']
    understanding={
        'essentialUnderstandingDe':' '.join(x['essentialUnderstandingDe'] for x in exp),
        'essentialUnderstandingEn':' '.join(x['essentialUnderstandingEn'] for x in exp),
        'observablePerformanceDe':whole_case['cases'][0]['task']['de'],
        'observablePerformanceEn':whole_case['cases'][0]['task']['en'],
        'transferExpectationDe':whole_case['cases'][1]['task']['de'],
        'transferExpectationEn':whole_case['cases'][1]['task']['en']}
    d_records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion':1,'recordId':RUN_ID+'.'+g['goalId'],'runId':RUN_ID,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
        'bundleFingerprint':input_['bundleFingerprint'],'bookDigest':input_['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':'keep','understandingEvidence':understanding,
        'rationale':science['scientificReasonDe']+' '+visual+' Die eigene unveränderte ganze Science-B-Prüfung wird ausdrücklich erhalten, nicht neu gestartet. Ganze aktuelle Profile und vollständige DE/EN-Fälle sind erneut gelesen und exakt gebunden. Neue Raster-/Seiten-/Kontextbindungen sind tatsächlich geprüft; keine reine Hashanpassung wird als neue Wissenschaftsprüfung ausgegeben. Praktische Ziele benötigen tatsächliche Handlungen und nachvollziehbare Protokolle für einen Kompetenzclaim. Keine Peer-A-Finallektüre vor diesem eigenen Ersturteil.',
        'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    bindings.append({'ordinal':i,'goalId':g['goalId'],'wholeBodyExactToOwnScienceAndCurrentLive':True,
        'wholePProfileExactToOwnGenuineScience':True,'wholeCaseBindings':case_receipts,
        'currentPageFullPrerequisitesAndDirectConsumersActuallyChecked':True,'currentDEReferenceTitlesExact':True,
        'wholeSourcePhysicalPage':science['wholeOfficialPrimaryPhysicalPage'],
        'retainedAtomicity':science['retainedAtomicity'],'retainedMemory':science['retainedMemory'],
        'newScientificAMDecision':False,'currentNativeP':{'goalFingerprint':p['goalFingerprint'],'profileFingerprint':p['profileFingerprint'],'reviewInputFingerprint':p['reviewInputFingerprint']}})
results = OWN / 'round-b/results'; results.mkdir(parents=True, exist_ok=True)
batch = campaign['batches'][0]
assert batch['goalIds']==ids
record_path = results / (batch['batchId']+'.records.jsonl')
with record_path.open('x') as f:
    for d in d_records: f.write(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
write(results / (batch['batchId']+'.run.json'),{
    '$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':RUN_ID,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':input_['bundleFingerprint'],'bookDigest':input_['bookDigest'],
    'provider':'OpenAI','model':'Codex independent B; exact serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Actual independent B ten current whole DEEN, retained own science20cases, full PNG360680nativePDF and portable primary; serving sampling unavailable').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':ids,
    'inputArtifacts':[{'role':x['role'],'digest':x['digest']} for x in bundle['artifacts'] if x['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
    'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':'sha256:'+sha(record_path),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'})
write(OWN / 'ten-actual-PNG-width-native-page-V.independent-b.first.verdicts.json',{
    'schemaVersion':1,'artifactKind':'independent-B-ten-genuine-actual-raster-widths-native-page-V-first','recordedAt':started,
    'actualReviewer':'/root/flora_fauna_independent_a','assignedIndependentRole':'B','records':v_records,'KEEP':10,'newBlockingFindings':[],
    'newImagesGeneratedByReviewer':0,'peerAFinalOutputsRead':False,'status':'needs_human_review','reviewAuthority':'ai_candidate',
    'activeWrites':0,'strictGainClaimed':0,'realLearnerEvidence':False,'humanApproval':False,'humanTrial':False})
write(OWN / 'ten-whole-current-D-P-source-AM-native-page.independent-b.first.verdict.json',{
    'schemaVersion':1,'artifactKind':'independent-B-ten-current-whole-D-P-source-AM-and-genuine-native-context-first','recordedAt':started,
    'actualReviewer':'/root/flora_fauna_independent_a','assignedIndependentRole':'B','D10':'KEEP','wholeP10Science':'PASS_SCOPED_E1_G1',
    'ownPriorWholeScienceFirstSeal':bind(old_first),'ownPriorScienceFinalSeal':bind(old_final),
    'portableWholeOriginalPrimaryReceipt':bind(ROOT/entry['wholeOfficialPrimaryPagesAndExactPdfSourceSha']),
    'portableWholePhysicalPagesActuallyRead':[3,6,8,19,20],
    'sourceLimits':'Original left-column compulsory topics retained; right-column methods/example species are recommendations; optional phototaxis, fermentation, extra cell types and bacterial cultures are not universal obligations.',
    'inferenceLimits':old_science['specificInferenceLimits'],'practicalOperatorScope':old_science['practicalOperatorScope'],
    'existingAM10ActuallyRetained':True,'newScientificAMDecisions':0,'requiredSharedCardsRetained':17,'visibilityViewsRetained':8,'newCards':0,
    'newNativeTechnicalChecks':'pending separately recorded actual runs','allCountryPrimarySourceClosureClaim':False,
    'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
    'peerAFinalOutputsRead':False,'activeWrites':0,'strictGainClaimed':0,'realLearnerEvidence':False,'humanApproval':False,'humanTrial':False})
write(OWN / 'exact-neutral198-and-current-whole10-retained-science-bindings.independent-b.actual.json',{
    'schemaVersion':1,'artifactKind':'independent-B-exact-198-neutral-input-and-current-live-whole10-context-binding','recordedAt':started,
    'authorSeal':bind(seal),'authorFrozenFilesActuallyVerified':198,
    'wholeSelectedGoals':bind(ROOT/entry['wholeSelectedGoals']),'wholeCases':bind(ROOT/entry['twentyCompleteBilingualCases']),
    'wholeNativeP10':bind(ROOT/entry['closedNativeP10']),'wholeNativePDF':bind(pdf),'pdfExtractionArgv':argv,'pdfExtractionExit':0,
    'physicalPagesActuallyViewed':list(range(3,13)),'selectedRasterManifest':bind(ROOT/entry['fullActualPNGsAndToolProvenance']),
    'goalSpecificBindings':bindings,'liveCanonicalObserved':bind(live_path),'unrelatedCurrentLiveChangesSinceAuthorBaseline':unrelated_live_deltas,
    'inactiveCandidateMustNotReplaceWholeLaterLiveCanonical':True,'newerOtherReviewedGoalMustBePreserved':True,
    'ownPriorWholeScienceSeals':[bind(old_first),bind(old_final)],'actualNewVChecksNotHashOnly':True,
    'peerAFinalOutputsRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
config = read(SCIENCE_AUTHOR / 'P10.whole-current-author.config.json')
config.update(reviewId=p_rows[0]['reviewId'],landscapePath=entry['wholeFinalLandscape'],
    semanticKindLedgerPath=rel(AUTHOR/'candidate/semantic-kinds.current474-ten-raster-inert.json'),reviewPath=entry['closedNativeP10'],
    scope={'label':'Independent B exact inactive native10 actual rasters and retained whole scientific profiles','goalIds':ids})
write(OWN / 'P10.exact-inactive-native.independent-b.config.json',config)
print('Own independent B first D10 KEEP, whole science P10 scoped PASS_E1/G1 retained, actual V10 KEEP;198 inputs exact,10current live whole bodies/context valid. Native checks follow. No peer-A read, active write, strict gain or human approval.')
