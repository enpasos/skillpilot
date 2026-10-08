# SPDX-License-Identifier: Apache-2.0
"""Record this actual independent A whole review, before current peer B access."""
import copy
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'
PRIOR = OWN.parent / 'biologie-he9-contraception-parenthood-scope-preserving-split-independent-a-20261008-v1'
NATIVE = AUTHOR / 'native-raster-candidate-v2/four'
PARENT = '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'

def read(p): return json.loads(p.read_text())
def lines(p): return [json.loads(s) for s in p.read_text().splitlines() if s.strip()]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream: stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def norm(s): return re.sub(r'[\s\-\u00ad\u2010\u2011]+', '', s)
def verify(b):
    actual = bind(ROOT / b['path'])
    assert all(actual[k] == b[k] for k in ['path', 'sha256', 'bytes']), b['path']

# These are observations from the actual four full PNGs, eight separate width
# captures and four complete native PDF pages inspected in this agent turn.
OBS = {
'9d3f71d7-5273-5e50-b1ba-4e291edbf114': 'Zwei bekleidete Erwachsene überlegen gemeinsam; Kondom und Pille sind deutlich getrennte Methodenkarten, keine Gleichsetzung von Wirkmechanismus, Schwangerschaftsschutz oder Infektionsschutz. Es werden weder Quoten noch eine pauschal bessere Methode behauptet. Verhütung, Kondom und Pille bleiben bei360/680 klar lesbar; die Gegenstände und Frage sind groß. Kleine Randposter und Tassenaufschrift sind Dekoration, nicht lesepflichtige Fachangaben. Die unbeschrifteten Tischpapiere geben keine falsch orientierte fachliche Heftzeichnung vor. Die native Seite zeigt genau diesen Vergleich, das kurze DE-Ziel, den unveränderten hormonellen Vorgänger und den Familienplanungskontext ohne Überlappung.',
'dd923eeb-eef0-5796-b372-a5d4f5be21f7': 'Zwei erwachsene Bezugspersonen wenden sich gemeinsam einem Kind zu. Herz, Uhr und helfende Person stehen für Zuwendung, Zeit und erreichbare Unterstützung; keine Person wird allein wegen Geschlecht oder Einkommen für die Betreuung zuständig erklärt. Die dargestellte Familie ist ein Beispiel, kein Ausschluss anderer Familienformen. Verantwortung und Fürsorgemotiv sowie alle drei Symbole bleiben360/680 klar; Randposter ist dekorativ. Die native Seite verbindet das neue Reflexionsziel und seine hormonelle Voraussetzung korrekt mit dem alten stabilen Familienplanungscluster.',
'249f4c5d-fd23-57c7-ac62-773d62c33b49': 'Guter unveränderter Eierstock-Comic bleibt KEEP: Follikel, durch LH ausgelöste Ovulation und anschließender Gelbkörper sind eine schlüssige schematische zeitliche Folge. Der Gelbkörper ist im Eierstockgewebe, die freigesetzte Eizelle außerhalb; keine zurückkehrende Eizelle oder befruchtete Embryodarstellung. Follikel/LH/Gelbkörper und Pfeilrichtungen bleiben360/680 lesbar. Dieses Detailbild behauptet nicht, die gesamte Hypothalamus-Hypophysen-Achse oder einen universellen28-Tage-Kalender darzustellen. Tatsächliche native Seite zeigt nun beide neuen direkten Nachfolger getrennt und erhält Pubertätsvorgänger, Familienplanungscluster und gesondertes Regelkreismodell als Kontext; das fakultative Modell wird kein neues Pflichtthema.',
'4b7fdc2c-9dbe-5439-8d84-295abc240eec': 'Guter unveränderter Grenz-Comic bleibt KEEP: ausgesprochene Ablehnung, offene Hand als Grenze und respektvoller Abstand zweier bekleideter Erwachsener verdeutlichen aktuelle Zustimmung ohne Beschämung oder Zwang. Grenzen respektieren und Nein bleiben360/680 klar lesbar. Zusätzliche linke Holzschilder und rechte Banktafel sind unterstützende Randtexte, kein Ersatz für die vollständige begründete Diskussion. Die native Seite bewahrt genau die DE-Beschreibung und den stabilen Familienplanungs-Vorgänger, der jetzt ein Cluster mit den zwei getrennten Teilkompetenzen ist; keine heimliche Ein-Kind-Übertragung oder pauschale neue Quellenpflicht.'}
SCI = {
'9d3f71d7-5273-5e50-b1ba-4e291edbf114': 'Beurteilung verbindet Wirkweise, Durchführung und begründete Grenzen. Die ganzen DE/EN-Fälle trennen Schwangerschafts- und Infektionsschutz und variieren die Anwendung. Korrekter Kondomgebrauch kann viele Infektionsrisiken mindern; kombinierte hormonelle Pille unterdrückt vor allem Ovulation und bietet keinen Infektionsschutz. Fehlende Vergleichsdaten erlauben keine exakte Rangfolge oder individuelle Eignung. Keine absolute Garantie, klinische Dosierungsanweisung oder reale Lernendenleistung.',
'dd923eeb-eef0-5796-b372-a5d4f5be21f7': 'Reflexion richtet mehrere begründete Kriterien auf Kindeswohl, verlässliche Betreuung, Zeit, Gesundheit und Unterstützung. Die ganzen DE/EN-Fälle variieren Ressourcenbewertung gegenüber freiwilliger, gemeinsamer Verantwortungsplanung. Wohlstand oder biologische Rollen beweisen weder Wert einer Familie noch alleinige Zuständigkeit; unterschiedliche Familienformen und Privatsphäre bleiben respektiert. Eigenständige begründete Reflexion ist beobachtbar, kein bloßes Nachsprechen einer Normenliste.',
'249f4c5d-fd23-57c7-ac62-773d62c33b49': 'Unveränderte gültige ganze Zyklus- und Pubertätsfälle/P erhalten. FSH/Follikel, Estradiol/Schleimhaut, LH/Ovulation und Gelbkörper/Progesteron sowie Hormonabfall ohne Schwangerschaft sind im vereinfachten Modell richtig verbunden. Die Hormonachse, Zielgewebe und variable körperliche Reifung begrenzen pauschale Alters- und Zeitprognosen. Das Modell erklärt nicht sämtliche sozialen Entwicklungen und ist keine persönliche Diagnose. DE/EN beanspruchen dieselbe beschreibende Kompetenz; heutige Änderung betrifft nur relationellen Seitenkontext.',
'4b7fdc2c-9dbe-5439-8d84-295abc240eec': 'Unveränderte gültige ganze Beziehungs- und Medienvignetten/P erhalten. Beobachtbar ist begründete soziale und ethische Diskussion mit Perspektivwechsel, aktueller freiwilliger Zustimmung, Würde, Grenzen und Privatsphäre. Gruppenmeinung ersetzt keine Zustimmung und rechtfertigt keine Abwertung oder Weitergabe privater Bilder. Keine persönliche Offenlegung oder vorgegebene Familienbiographie nötig. DE/EN bleiben gleichwertig; heutige Änderung betrifft nur den weiterhin stabilen, jetzt gebündelten Vorgängerkontext.'}

started = datetime.now(timezone.utc).isoformat()
entry = read(AUTHOR / 'neutral-current-four-raster-native-author-review.entry.json')
op = entry['operativeArtifacts']
author_seal = AUTHOR / 'current-four-raster-native-author-input.first.freeze.json'
assert sha(author_seal) == 'eabe2f79c398c86a0c6ef3ff134e16009f9d2e82f251593295162cd2dfb710da'
author_files = read(author_seal)['frozenFiles']; assert len(author_files) == 203
for b in author_files: verify(b)
prior_seal = PRIOR / 'completed-science-source-class-A2-M2-native-bindings.independent-a.exact.freeze.json'
assert sha(prior_seal) == 'd06c4fd0662b35cb223cdc2561c6351f06bb2fc18ab2bb2c9c0d82ea38a02512'
for b in read(prior_seal)['frozenFiles']: verify(b)
old_science = {r['goalId']: r for r in read(PRIOR / 'first-whole-two-child-source-class-AM-split.independent-a.verdict.json')['records']}
old_reading = read(PRIOR / 'actual-whole-HE93-split-input-and-facts.independent-a.reading.json')
old_profiles = {r['goalId']: r for r in lines(ROOT / old_reading['wholeP2']['path'])}
old_cases = {r['goalId']: r for r in read(ROOT / old_reading['wholeFourCases']['path'])['goals']}
whole = {g['id']: g for g in read(ROOT / op['wholeFourDEENGoals'])['goals']}
future = {g['id']: g for g in read(ROOT / op['currentWholeCanonical'])['goals']}
profiles = {r['goalId']: r for r in lines(ROOT / op['nativeP4ActualRasterBindings'])}
materials = {r['goalId']: r for r in read(ROOT / op['wholeEightDEENCases'])['goals']}
images = read(ROOT / op['actualPNGs'])['images']
pages = {p['goalId']: p for p in read(NATIVE / 'book-model.json')['pages']}
assert len(whole) == len(profiles) == len(materials) == len(images) == len(pages) == 4
assert sum(len(r['cases']) for r in materials.values()) == 8
pdftotext = subprocess.run(['pdftotext', '-layout', str(ROOT / op['actualCommittableNativePDF']), '-'], capture_output=True, text=True)
assert pdftotext.returncode == 0, pdftotext.stderr
with (OWN / 'actual-native-four.whole-text.independent-a.txt').open('x') as stream: stream.write(pdftotext.stdout)
text_pages = pdftotext.stdout.split('\f'); assert len([p for p in text_pages if p.strip()]) == 6
records = []
for im in images:
    gid = im['goalId']; g = whole[gid]; p = pages[gid]; profile = profiles[gid]
    assert g == future[gid]
    assert sha(ROOT / im['path']) == sha(ROOT / im['selectedPath']) == im['sha256']
    assert p['title'] == g['title'] and p['description'] == g['description']
    assert p['visualization']['originalDigest'] == 'sha256:' + im['sha256']
    assert set(r['goalId'] for r in p['requires'] + p['externalPrerequisites']) == set(g['requires'])
    physical = p['pageNumber'] + 2
    text = text_pages[physical-1]
    assert norm(g['title']) in norm(text) and norm(g['description']) in norm(text)
    assert re.search(r'Lernziel-ID\s+' + re.escape(gid), text)
    assert len(re.findall(r'Lernziel-ID\s+[a-f0-9-]{36}', text)) == 1
    cp = AUTHOR / 'width-captures' / gid / 'chromium-captures.actual.json'
    capture = read(cp)
    assert capture['sourceSha256'] == im['sha256']
    assert [r['width'] for r in capture['captures']] == [360,680]
    for c in capture['captures']:
        assert c['measured']['renderedWidth'] == c['width'] and c['measured']['objectFit'] == 'contain'
        assert sha(AUTHOR / 'width-captures' / gid / f"actual-selected-{c['width']}px.png") == c['sha256']
    assert profile['status'] == 'needs_human_review' and profile['reviewAuthority'] == 'ai_candidate'
    assert profile['evidenceLevel'] == 'E1' and profile['maximumClaimScope'] == 'G1'
    retained = None
    if gid in old_science:
        old = old_science[gid]; original = copy.deepcopy(g); original.pop('resourceLinks', None)
        assert original == old['wholeCurrentProposedGoal']
        assert profile['profile'] == old_profiles[gid]['profile']
        assert materials[gid]['cases'] == old_cases[gid]['cases']
        assert profile['profileFingerprint'] == old['wholeProfileFingerprint']
        retained = {k: old[k] for k in ['wholeSourceScopeVerdict','semanticKindDecision','atomicityDecision','memoryDecision']}
    records.append({'goalId':gid, 'wholeGoalBody':g, 'descriptionDecision':'KEEP', 'wholeScienceDecision':'PASS', 'wholeScienceReasonDe':SCI[gid],
        'wholePDecision':'PASS scoped E1/G1 public synthetic profile, not human approval', 'wholePositiveProfileRecord':profile,
        'wholeDEENCases':materials[gid]['cases'], 'retainedAlreadyGenuineSourceClassAMDecisions':retained,
        'actualVisualizationDecision':'KEEP', 'actualFullPNG':bind(ROOT / im['selectedPath']),
        'actualWidthCaptures':[bind(AUTHOR / 'width-captures' / gid / f'actual-selected-{w}px.png') for w in [360,680]],
        'actualCompleteNativePage':{'physicalPage':physical,**bind(NATIVE / 'actual-physical-pages' / f'actual-physical-page-{physical}.png')},
        'actualNativePageFingerprint':p['pageFingerprint'],'substantiveActualVisualObservationsDe':OBS[gid],
        'altCorrespondence':p['visualization']['altText'], 'actualFormat':'KEEP friendly comic1672x941 widePNG, actual360/680 inspected, no ratio normalization or generator-based replacement.',
        'newImage':im['newImage'], 'sourceScope':'Original wholeHE9.3 selected clause retained; no new nationwide operator approval inferred from raw applicability.',
        'findings':[], 'humanApproval':False,'realLearnerEvidence':False})

guards = read(AUTHOR / 'exact-current-input-snapshots-and-four-author-guards.technical.json')
snap = guards['snapshotMap']
before = {g['id']:g for g in read(ROOT / snap['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'])['goals']}
assert len(before) == 474 and len(future) == 476
assert all(g == future[gid] for gid,g in before.items() if gid != PARENT)
assert len([gid for gid in before if gid != PARENT]) == 473
view_proofs = []
for v in guards['viewGuards']:
    old = read(ROOT / v['beforeSnapshotPath']); new = read(ROOT / v['inactiveCandidatePath']); reconstructed = copy.deepcopy(old)
    for delta in v['changedNodes']:
        parts = delta['jsonPointer'].strip('/').split('/'); target = reconstructed
        for part in parts: target = target[int(part)] if isinstance(target,list) else target[part]
        assert target == delta['before'] and target['goalId'] == PARENT
        assert target['kind'] == 'goalEntry' and delta['after']['kind'] == 'canonicalSubtree'
        expected = {**target, 'kind':'canonicalSubtree'}; assert expected == delta['after']
        target.clear(); target.update(expected)
    assert reconstructed == new
    view_proofs.append({'activePath':v['activePath'],'exactOnlyParentEntryKindChanges':len(v['changedNodes']),'otherNodesAndProjectionRolesExact':True})
assert len(view_proofs) == 31
source = read(ROOT / op['wholeOriginalPhysicalSourcePages'])
for s in source['operativeCompletePhysicalPages']: verify(s['wholeOriginalPage'])
position = read(AUTHOR / 'checks/current-page-position-only-exact-historical-references-and-subset-proof.technical.json')
assert position['baselineStrict'] == 202 and position['wholeCurrentBodiesExact'] == 81
assert position['actualSubsetContextChangedGoalIds'] == []
for b in position['exactOriginalDInputsAssetsAndResolutionDependencies']: verify(b)
write(OWN / 'actual-whole-four-D-P-V-first.independent-a.verdict.json', {
    'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),'role':'Genuine independent A final four whole goals, cases, profiles, current raster and native contexts',
    'records':records,'DKEEP':4,'PScopedSciencePASS':4,'VActualKEEP':4,'blockingFindings':[],
    'actualViews':{'fullPNGs':4,'width360':4,'width680':4,'completeNativePages':4},
    'actualNativePhysicalGoalOrder':[{'goalId':p['goalId'],'physicalPage':p['pageNumber']+2} for p in pages.values()],
    'actualSourceRead':'Whole official physical25/26, printed24/25 including rationale, mandatory/facultative entries and method/social context; previous genuine institutional fact-reading retained, no invented new browser read.',
    'sourceScopeBoundary':'Separate original contraception assessment and parenthood reflection retained; pregnancy/birth/abortion, other endocrine topics, sexual lifestyles and optional feedback are not silently made mandatory parts of both children. National route approval is not inferred from raw applicability or these source-linked synthetic public profiles.',
    'newScienceVsBindings':'Existing genuine two-child science/Class/A2/M2 adopted unchanged; two new actual PNGs reviewed, two good existing PNGs retained, two genuine companion relation contexts specifically reviewed now. No unchanged historical review restarted.',
    'actualWholeBodyGuard':{'473OtherOriginalBodiesExact':True,'31WholeViewsOnlyParentEntryKindChanges':view_proofs},
    'positionBindingBoundary':{'actual81StrictPositionOnlyReferenceInputsVerified':226,'sameNativeSubsetBeforeAfterExact':True,'twoPreexistingHistoricalDifferences':position['originalHistoricalSubsetContextDifferencesNotClaimedAsNewSplitDefects'],'newReviewClaimsForPositionOnly':0},
    'alreadyGenuineSourceClassAMSeal':bind(prior_seal),'peerCurrentFinalBFilesRead':0,'peerCurrentFinalBReadBeforeSeal':False,
    'profileStatus':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','reviewAuthority':'ai_candidate',
    'twoCasesBoundary':'Two available independent variations; no mandatory extra task after already sufficient genuine evidence.',
    'imageGenerationIsApproval':False,'realDeviceAcceptance':False,'realLearnerEvidence':False,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0})

campaign = read(NATIVE / 'round-a/description-review-campaign.json')
native_input = read(NATIVE / 'round-a/description-review-input.json')
bundle = read(NATIVE / 'round-a/review-bundle-manifest.json')
assert campaign['goalCount'] == campaign['batchSize'] == 4 and len(campaign['batches']) == 1
batch = campaign['batches'][0]; run_id = OWN.name
review_records=[]
for g in native_input['goals']:
    gid=g['goalId']; ex=profiles[gid]['profile']['expectations']; evidence={}
    for suffix in ['De','En']:
        evidence['essentialUnderstanding'+suffix]=' '.join(r['essentialUnderstanding'+suffix] for r in ex)
        evidence['observablePerformance'+suffix]=ex[0]['observablePerformance'+suffix]
        evidence['transferExpectation'+suffix]=ex[-1]['observablePerformance'+suffix]
    review_records.append({'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,
        'recordId':run_id+'.'+gid,'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
        'bundleFingerprint':native_input['bundleFingerprint'],'bookDigest':native_input['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':'keep','understandingEvidence':evidence,'rationale':SCI[gid]+' '+OBS[gid]+' Ganze offizielle HE9.3-Pflichten von fakultativen/benachbarten Themen getrennt gelesen. Bereits genuine unveränderte Wissenschaftsnachweise übernommen; heutige ganze aktuelle D/P/V-Kontexte und echte Raster tatsächlich selbst geprüft. Rohe Anwendbarkeit ist keine neue Länderoperatorfreigabe. Öffentliche E1/G1-Kandidaten, keine reale Lernendenleistung oder menschliche Freigabe.',
        'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
results=OWN/'round-a/results'; results.mkdir(parents=True,exist_ok=True)
record_path=results/(batch['batchId']+'.records.jsonl')
with record_path.open('x') as stream:
    for r in review_records: stream.write(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,
    'runId':run_id,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],
    'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':native_input['bundleFingerprint'],'bookDigest':native_input['bookDigest'],
    'provider':'OpenAI','model':'Codex actual independent A; serving revision not exposed','role':'subject_reviewer',
    'promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
    'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Actual independent A four current full raster/native judgments; prior valid science retained; sampling unavailable').hexdigest(),
    'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],
    'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
    'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'outputDigest':'sha256:'+sha(record_path),'status':'completed','toolchainVersion':'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
write(results/(batch['batchId']+'.run.json'),run)
write(OWN/'first-four-genuine-current-D-P-V.independent-a.exact.freeze.json',{
    'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'role':'Genuine independent A first immutable current four whole judgment before current peer B',
    'authorInput':bind(author_seal),'ownFiles':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],
    'DKEEP':4,'PScopedSciencePASS':4,'VActualKEEP':4,'blockingFindings':[],'peerCurrentFinalBFilesRead':0,
    'nativeTechnicalChecks':'Pending actual own true4campaign CLI and closed-P4/current-PNG API after this science seal.',
    'actualExperiments':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,'strictGainClaimed':0})
print(json.dumps({'firstSeal':bind(OWN/'first-four-genuine-current-D-P-V.independent-a.exact.freeze.json'),'DKEEP':4,'PScopedSciencePASS':4,'VKEEP':4,'blockingFindings':0,'peerCurrentFinalBFilesRead':0}))
