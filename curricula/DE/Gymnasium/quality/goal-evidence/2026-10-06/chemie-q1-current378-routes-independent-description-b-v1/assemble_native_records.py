import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'app/scripts/goalBookModel.ts').is_file())
def read(p):
    return json.loads(Path(p).read_text())
def digest_bytes(p):
    return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def stable_digest(obj):
    return 'sha256:' + hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def write(p, obj):
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    Path(p).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

supplement = read(HERE / 'inputs/positive-binding-before-followup.native.actual.json')
assert digest_bytes(HERE / 'inputs/positive-binding-before-followup.native.actual.json') == 'sha256:cdd1510aba71032417448135a2159a95da9ecf822fda86253e1ec166de136356'
profiles = {r['goalId']: r for c in supplement['configs'] for r in c['records']}
profile_sources = {r['goalId']: {k: c[k] for k in ['configPath', 'configDigest', 'reviewPath', 'reviewDigest']} for c in supplement['configs'] for r in c['records']}
transfers = read(HERE / 'transfer-expectations.reviewed.json')
union = read(HERE / 'inputs/final-v4.native-d-union.actual.json')
categories = {r['goalId']: r['category'] for r in union['rows']}
full = read(HERE / 'inputs/full-current378-final-v4.book-model.json')
active = read(HERE / 'inputs/full-current376.book-model.json')
retained = read(HERE / 'inputs/retained407.current-science.full378.book-model.json')
current_pages = {p['goalId']: p for p in full['pages']}
active_pages = {p['goalId']: p for p in active['pages']}
retained_pages = {p['goalId']: p for p in retained['pages']}
canonical = read(HERE / 'inputs/author-v4.current-canonical.json')
canonical_goals = {g['id']: g for g in canonical['goals']}
assert stable_digest(canonical) == full['source']['landscapeDigest']
assert supplement['canonicalDigest'] == digest_bytes(HERE / 'inputs/author-v4.current-canonical.json')
start = '2026-10-06T03:35:42Z'
complete = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
generation = {'model': 'GPT-6 (Codex)', 'backendGenerationParameters': 'not exposed', 'method': 'independent current D page and context review; targeted reuse of supplied complete current P contracts', 'noHumanClaim': True}
write(HERE / 'generation-parameters.actual.json', generation)
receipts = []
all_records = []
special = {
    '057a6826': 'Vergleichbare nucleophile Acylsubstitutionen begrenzen die Rangfolge; Carbonyl und Abgangsgruppe tragen die Begründung. Kein universeller Geschwindigkeitsvergleich bei geänderten Bedingungen.',
    '39c85aa0': 'Intramolekulare Esterbildung, korrekte Ringzählung sowie getrennte Bildungs-/Stabilitätsdaten bilden eine zusammenhängende Kompetenz; keine unbedingte Fünf-/Sechsringregel.',
    'd742ecb0': 'Kontrollierte Planung UND Durchführung, CMC-Messreihe, Schaumvolumendifferenz und getrenntes Schmutztragen bleiben vollständig erhalten. Eine Zeichnung oder bereitgestellte Messreihe belegt keine praktische Durchführung.',
    'd76b80a2': 'Wirkungsdaten, Lebensmittelkategorie, datierte Mengenbasis und Materialgrenzen bleiben getrennt. Kein aktuelles Rechts- oder Sicherheitsurteil aus einem allgemeinen Produktbild.',
    '3d6699ae': 'Ascorbin-Molekülstruktur, tatsächliche geeignete Bestimmung, Kontrollen, Stöchiometrie/Kalibrierung, Verdünnung und Selektivitätsgrenzen sind vollständig. Eigenständig nur Teilkomponente des HE-LK-Bullets einschließlich struktureller Eigenschaften.',
    '18819a59': 'Ein vorgegebener einzelner p-Hydroxybenzoesäureester und eine geeignete tatsächlich durchgeführte Bestimmung begrenzen das Ziel. HPLC ist Beispiel, keine Pflichtausstattung; Gehalt ist weder Peakzeit noch Wirksamkeit. Authored analytischer Transfer, kein wörtlicher Paraben-Verwendungsoperator des HE-Bullets.',
    '0d59b62e': 'Eigene HE-LK-Paraben-Verwendungskompetenz: para-Esterstruktur, Wirkungs-/Löslichkeitsdaten und datierte produktbezogene Bedingungen tragen ein begrenztes Urteil. 0d59 fehlte in active376; inactive407 autorisierte keine neue BY-Pflicht. Aktuelle Boundary und bereinigte allgemeine Q1-requires halten den kompilierten Scope HE-only; assessment-requires ist kein Primärbeleg.',
    '10f657bc': 'Ascorbin-Elektronenabgabe und antioxidative Wirkung werden ausdrücklich von antimikrobieller Konservierung getrennt; Vergleichsdaten und Matrix begrenzen die Bewertung.',
    '70b34ae7': 'Esterbildung aus Beobachtungen, richtige Kondensation, Wechselwirkungen und passende Einsatzbereiche bleiben erhalten. Ein generischer Ester-Einsatz erweitert den BY-Umfang nicht um die neue spezifische Paraben-Verwendungsleistung.',
    'db66635f': 'Qualitativer Nachweis UND betreute Durchführung bleiben erhalten; Reduktion des Reagenzes erklärt die Modell-Antioxidationswirkung, nicht automatisch spezifische Identifikation in jeder Matrix.',
    '4da0839d': 'Alkalischer Acylhydrolyseweg und korrekte Ladungen bleiben im P-Vertrag ausdrücklich erhalten. Der Originalzustandsplan zeigt O⁻ in der tetraedrischen Zwischenstufe; die zunächst in der verkleinerten PDF-Ansicht vermutete Auslassung wurde durch eigene Originalsichtung widerlegt und zurückgenommen.'
}
for index in [1, 2, 3]:
    batch_name = f'batch-{index:03d}'
    batch_dir = HERE / 'inputs' / batch_name
    native_input = read(batch_dir / 'round-b/description-review-input.json')
    campaign = read(batch_dir / 'round-b/description-review-campaign.json')
    bundle = read(batch_dir / 'round-b/review-bundle-manifest.json')
    book = read(batch_dir / 'bundle/book-model.json')
    pdf_render = read(batch_dir / 'bundle/book.pdf.render-manifest.json')
    bound_batch = campaign['batches'][0]
    run_id = f'chemie-current378-native-d-b-20261006-{index:03d}'
    records = []
    for goal in native_input['goals']:
        gid = goal['goalId']; key = gid[:8]
        profile_record = profiles[gid]
        profile = profile_record['profile']
        assert profile_record['goalFingerprint'] == goal['goalFingerprint']
        assert profile_record['reviewAuthority'] == 'ai_candidate'
        assert profile_record['status'] == 'needs_human_review'
        assert profile_record['evidenceLevel'] == 'E1' and profile_record['maximumClaimScope'] == 'G1'
        expected_ids = {e['id'] for e in profile['expectations']}
        assert set(profile['coverageExpectations']['requiredExpectationIds']) <= expected_ids
        assert profile['coverageExpectations']['independentTransferRequired'] is True
        assert len(profile['applicationCaseBriefs']) >= 2
        evidence = {field: ' '.join(e[field] for e in profile['expectations']) for field in ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn']}
        evidence.update({'transferExpectationDe': transfers[key][0], 'transferExpectationEn': transfers[key][1]})
        rationale = ('Die gebundene DE/EN-Beschreibung ist fachlich korrekt und äquivalent. ' + special.get(key, 'Der eigene Zusammenhang bleibt auf ' + goal['currentTitleDe'] + ' begrenzt; die aktuelle Seitenintegration ändert diese Kompetenz nicht. '))
        rationale += ' Aktuelle direkte/externe Voraussetzungen und Aufgaben-Rückverweise tatsächlich geprüft; sie sind Kontext, keine Erweiterung dieses Atoms oder Durchführungsevidenz. '
        rationale += ('Vorhandene strenge D-Bindung mit unverändertem eigenem wissenschaftlichem Text gezielt erneuert.' if 'changed-current-strict-page' in categories[gid] else 'Aktuelle Bindung des bereits fachlich geprüften Science-Kandidaten am tatsächlichen Delta geprüft; kein Neustart der unveränderten P-/Bildprüfung.')
        rationale += ' Der digestgebundene gelieferte aktuelle P-Vertrag deckt Verständnis, Leistung und chemisch veränderten Transfer; none erhält ihn ohne neue P-Freigabe. Native PDF-Seite persönlich gesichtet. Bilder sind Unterstützung, keine Lernerevidenz. Quelle nur eigene Teilkompetenz; keine pauschale Bundesland-/Kurs-/Vollbullet-Freigabe.'
        record = {
            '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
            'schemaVersion': 1, 'recordId': f'chemie-current378-native-d-b-{index:03d}-{gid}',
            'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
            'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
            **{field: goal[field] for field in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
            'decision': 'keep', 'understandingEvidence': evidence, 'rationale': rationale,
            'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none',
            'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'
        }
        assert all(0 < len(s) <= 4000 for s in evidence.values())
        records.append(record)
        pg = goal['reviewContext']['page']
        fg = current_pages[gid]
        assert fg['goalFingerprint'] == goal['goalFingerprint']
        assert fg['description'] == goal['currentDescriptionDe']
        own_goal = canonical_goals[gid]
        assert own_goal['description'] == goal['currentDescriptionDe']
        original_image = pg.get('visualization')
        asset_receipt = None
        if original_image:
            asset = ROOT / 'app/public' / original_image['url'].lstrip('/')
            if not asset.is_file():
                asset = HERE.parent / 'chemie-q1-current378-routes-native-d-preparation-v1/portable-assets' / original_image['url'].lstrip('/')
            actual_image_digest = digest_bytes(asset)
            assert actual_image_digest == original_image['originalDigest']
            asset_receipt = {'url': original_image['url'], 'originalDigest': actual_image_digest, 'altText': original_image['altText'], 'renderAssets': [a for a in pdf_render['assets'] if a['publicPath'] == original_image['url']], 'originalPersonallyViewed': key == '4da0839d', 'allNativePageImagesPersonallyViewed': True}
        old = active_pages.get(gid)
        retained_page = retained_pages.get(gid)
        if retained_page:
            assert retained_page['description'] == fg['description']
            assert retained_page.get('visualization') == fg.get('visualization')
        receipts.append({
            'batch': batch_name, 'goalId': gid, 'category': categories[gid],
            'boundGoalFingerprint': goal['goalFingerprint'], 'boundSubsetPageFingerprint': goal['pageFingerprint'],
            'actualFull378PageFingerprint': fg['pageFingerprint'], 'canonicalContextFingerprint': stable_digest(goal['canonicalContext']),
            'bilingualTextFingerprint': stable_digest({k:goal[k] for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']}),
            'embeddedEvidenceProfileNull': goal['reviewContext']['evidenceProfile'] is None,
            'supplementProvided': True, 'supplementDigest': digest_bytes(HERE/'inputs/positive-binding-before-followup.native.actual.json'),
            'profileGoalFingerprintExact': True, 'profileFingerprint': profile_record['profileFingerprint'], 'profileInputFingerprint': profile_record['reviewInputFingerprint'],
            'profileSource': profile_sources[gid], 'profileRecommendation': 'none',
            'nativePageRelationContext': {k:pg.get(k) for k in ['requires','externalPrerequisites','reverseRequires','externalReverseRequires']},
            'currentFullPageRelationContext': {k:fg.get(k) for k in ['requires','externalPrerequisites','reverseRequires','externalReverseRequires']},
            'active376Present': old is not None,
            'activeOwnDescriptionUnchanged': old is not None and old['description']==fg['description'],
            'fullPageDeltaFromActive376': None if old is None else sorted(k for k in set(old)|set(fg) if old.get(k)!=fg.get(k)),
            'retainedScienceTextAndImageExact': retained_page is not None,
            'assetBinding': asset_receipt,
            'decision': 'keep', 'targetedReuse': True, 'newSciencePReview': False, 'newFullImageReview': False,
            'humanApproval': False, 'humanTrial': False, 'empiricalLearnerEvidence': False
        })
    result_dir = HERE / 'results' / batch_name
    result_dir.mkdir(parents=True, exist_ok=True)
    records_path = result_dir / (bound_batch['batchId'] + '.records.jsonl')
    records_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'))+'\n' for r in records))
    run = {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
        'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': bound_batch['batchId'],
        'batchInputFingerprint': bound_batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        'provider': 'OpenAI', 'model': 'GPT-6 (Codex)', 'role': 'subject_reviewer',
        'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
        'generationParametersFingerprint': stable_digest(generation), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
        'goalIds': bound_batch['goalIds'],
        'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_pdf','book_pdf_render_manifest','book_model','review_input_json','review_prompt','review_criteria']] + [{'role':'description_review_batch_input_jsonl','digest':bound_batch['batchInputFingerprint']}],
        'startedAt': start, 'completedAt': complete, 'status': 'completed', 'outputDigest': digest_bytes(records_path), 'toolchainVersion': 'skillpilot-native-goal-description-review-v2'
    }
    write(result_dir / (bound_batch['batchId'] + '.run.json'), run)
    all_records.extend(records)
assert len(all_records)==53 and [r['goalId'] for r in all_records] == union['orderedGoalIds']
assert len(transfers)==53
write(HERE / 'results/current-goal-page-source-image-P-binding.receipts.json', receipts)
write(HERE / 'results/review-summary.actual.json', {
    'reviewer': 'independent-b', 'nativeRecordCount': 53, 'batchCounts': [20,20,13], 'decisions': {'keep':53,'revise':0,'block':0,'split_review':0},
    'alreadyStrictBindingRenewals': 45, 'newScienceCurrentBindingReviews':8,
    'individuallyViewedNativePDFPages':53, 'supplementDigest': digest_bytes(HERE/'inputs/positive-binding-before-followup.native.actual.json'),
    'PRecommendations': {'none':53}, 'PAuthorityPreserved':'ai_candidate/needs_human_review/E1/G1',
    'evidenceFieldReuse':'The four essential-understanding and observable-performance strings preserve the supplied current complete P contracts, independently checked against the current goal. The two transfer strings are reviewer-authored goal-specific fresh chemically changed cases. This is targeted contract reuse, not a new P-profile approval.',
    'scopeEvidence':'Own frozen v4 compiler output plus exact author-v4 canonical stable digest and current source-atlas page contexts. BY473 and HE-only endpoints are applicability evidence; generic source arithmetic is not a new specific primary source claim.',
    'sourceClaimLimits':['45 unchanged scientific competences retain their prior source boundaries; current task backlink changes do not authorize extra target scope.', '8 new science bindings target-reuse unchanged accepted scientific descriptions/P/images; no wholesale historical review restarted.', 'Ascorbic quantitative child is a partial component of the HE-LK structural-properties-plus-quantitative bullet.', 'Specified paraben quantitative determination is authored analytical transfer; it is not the literal HE paraben-use operator.', 'HE Q1.5 source does not establish universal compulsory Q1 coverage.', 'No new specific BY paraben-use source claim; 0d59 and 4cb74 compile HE-only.'],
    'original4daImageFinding':'Preliminary suspicion of an omitted intermediate charge from the scaled PDF is explicitly RETRACTED after personal original-image inspection. O⁻ is present. No image change or hold is requested.',
    'noOtherCurrentReviewerOutputRead':True, 'targetedReuseAuthorizedByParent':True,
    'nativeGateStatus':'candidate records; requires actual native campaign validation receipt before claiming technical validity',
    'activeWrites':False, 'historicalWrites':False, 'newScientificPApproval':False, 'newFullVApproval':False, 'humanApproval':False, 'humanTrial':False, 'empiricalLearnerEvidence':False
})
print(json.dumps({'records':len(all_records),'decisions':{'keep':53},'receipts':len(receipts)},ensure_ascii=False))
