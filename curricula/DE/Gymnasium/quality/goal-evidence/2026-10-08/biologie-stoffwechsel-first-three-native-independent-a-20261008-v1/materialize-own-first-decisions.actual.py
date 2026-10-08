import json, pathlib, hashlib, datetime

q = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
n = q / 'biologie-stoffwechsel-first-three-native-technical-20261008-v1'
d = q / 'biologie-stoffwechsel-first-three-native-independent-a-20261008-v1'
s = q / 'biologie-stoffwechsel-first-three-regional-source-remediation-author-20261008-v1'
load = lambda p: json.loads(pathlib.Path(p).read_text())
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()

def ref(p):
    p = pathlib.Path(p)
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}

def write(p, value):
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

f = load(d / 'first-native-input.freeze.json')
for r in f['requiredFiles']:
    assert ref(r['path']) == r, r['path']
i = load(n / 'native-three/round-a/description-review-input.json')
c = load(n / 'native-three/round-a/description-review-campaign.json')
b = load(n / 'native-three/bundle/review-bundle-manifest.json')
batch = c['batches'][0]
run_id = 'biologie-native-first-three-independent-a-actual-20261008-v1'

# Own first native decisions after personally reading all five physical PDF
# pages, every complete bilingual competency, the three profiles and six cases.
chains = {
    '32f47903-0788-5c27-ac88-7464f481f2f7': [
        'Lichtreaktionen stellen ATP und NADPH bereit; der stromale Calvin-Zyklus benötigt beide sowie CO₂. Licht, Stoffangebot und temperaturabhängige Enzymleistung können jeweils begrenzen.',
        'Light reactions provide ATP and NADPH; the stromal Calvin cycle requires both and CO₂. Light, substrate availability and temperature-dependent enzyme activity can each limit the process.',
        'Erkläre räumliche Trennung und stofflich-energetische Kopplung und deute ein kontrolliertes Licht-/CO₂-Plateau, ohne Nettoaufnahme mit isolierter Bruttofixierung gleichzusetzen.',
        'Explain spatial separation and material-energy coupling and interpret a controlled light/CO₂ plateau without equating net uptake with isolated gross fixation.',
        'Beurteile ein neu beleuchtetes Blatt mit geschlossenem Gasaustausch oder kurzfristiger Nachwirkung gespeicherter Äquivalente und begrenze daraus eine Aussage über dauerhaftes Fixieren.',
        'Assess a newly illuminated leaf with restricted gas exchange or brief use of stored equivalents and limit the resulting claim about sustained fixation.'
    ],
    '135447a0-5d55-564a-afc3-3e3fbed77819': [
        'Cytosolische Glykolyse, oxidative Schritte in der Matrix und membrangebundene Atmungskette sind durch Stoff- und Überträgerflüsse gekoppelt; CO₂-Bildung und terminale O₂-Reduktion sind verschieden.',
        'Cytosolic glycolysis, oxidative matrix steps and the membrane-bound respiratory chain are coupled through material and carrier flows; CO₂ formation differs from terminal O₂ reduction.',
        'Skizziere die drei Abschnitte mit Orten, Kohlenstoffweg, reduzierten Überträgern und ATP-Kopplung und begründe die Folgen einer unterbrochenen Elektronenabgabe.',
        'Sketch the three stages with locations, the carbon pathway, reduced carriers and ATP coupling and justify the effects of interrupted electron transfer.',
        'Unterscheide in einem neuen Fall NAD⁺-Regeneration durch einen Gärungsersatzweg von der Wiederherstellung der normalen O₂-gekoppelten mitochondrialen ATP-Bildung.',
        'Distinguish NAD⁺ regeneration through a fermentation alternative from restoration of normal O₂-coupled mitochondrial ATP production in a new case.'
    ],
    'ec782ce3-475e-5628-b3fe-947d72e74a74': [
        'Protein-gebundene Antennenpigmente erweitern die Lichtaufnahme und übertragen Anregungsenergie; das getrennte Reaktionszentrum erzeugt Ladungstrennung und ersetzt nicht die übrigen ATP-bildenden Membranprozesse.',
        'Protein-bound antenna pigments broaden light capture and transfer excitation energy; the separate reaction center produces charge separation and does not replace the other ATP-producing membrane processes.',
        'Erkläre Antennenaufbau und funktionale Energieweitergabe und unterscheide sie vom Elektronentransfer am Reaktionszentrum sowie von Absorptions- und Wirkungsnachweisen.',
        'Explain antenna structure and functional energy transfer and distinguish them from electron transfer at the reaction center and from absorption and action measurements.',
        'Beurteile einen neuen Komplex mit zusätzlicher Absorption, aber defektem Reaktionszentrum oder unverändertem Lichtangebot, und benenne den fehlenden Nachweis einer Leistungssteigerung.',
        'Assess a new complex with extra absorption but a defective reaction center or unchanged illumination and identify the missing evidence of increased performance.'
    ]
}
boundaries = {
    '32f47903-0788-5c27-ac88-7464f481f2f7': 'Die tatsächliche PDF-Geltung BY/HE SekII GK/LK folgt dem gesondert gebundenen operativen Source-Kandidaten. BY Wild-/Nutzpflanzenfolgenbeurteilung bleibt eine ganze offene Quellpflicht; die entfernten SekI-Gesamtzuordnungen und das ungeprüfte Basisziel werden nicht durch diese Seite freigegeben.',
    '135447a0-5d55-564a-afc3-3e3fbed77819': 'BY/HE SekII GK/LK bleibt die effektive Seitenprojektion. Der BY-Vergleich mit aufbauendem Stoffwechsel samt Ableitung ist nur teilweise getragen. Das zusätzliche grundlegende SekI-Zellatmungsziel bleibt außerhalb392 ungeprüft; der ST-Gärungsversuch ist nicht durchgeführt.',
    'ec782ce3-475e-5628-b3fe-947d72e74a74': 'Die Seite zeigt ausschließlich HE SekII LK; BY GK/LK entfällt in der gesonderten operativen Projektion. Der echte BY-Chromatographieoperator bleibt offen. Das tatsächliche v3 mit zwei grünen Relayknoten wird gebunden, nicht das verworfene v2.'
}
author_p = [json.loads(x) for x in (n / 'positive/P3.current-raster.author.review.jsonl').read_text().splitlines()]
pm = {x['goalId']: x for x in author_p}
profiles = {x['goalId']: x['profile'] for x in load(s / 'science/whole-three-P-profiles.exact-KEEP.json')['goals']}
rasters = {x['goalId']: x for x in load(n / 'neutral-current-first-three-native.technical.entry.json')['rasterBindings']}
pages = load(d / 'actual-pdf-pages.rendering.receipt.json')
records, positive, bindings = [], [], []
for index, g in enumerate(i['goals']):
    gid = g['goalId']
    pg = g['reviewContext']['page']
    r = rasters[gid]
    assert ref(r['path'])['sha256'] == r['sha256']
    assert pg['visualization']['originalDigest'] == r['sha256']
    assert pm[gid]['profile'] == profiles[gid]
    rationale = f'Eigene tatsächliche Prüfung der physischen PDF-Seite{index+3}, ihres gesamten aktuellen Bild-/Alt-/Seiten-/Voraussetzungskontexts und beider vollständiger bilingualer Fallkörper mit Bewertung und getrenntem Konzepttransfer: Der kurze DE/EN-Zieltext bleibt kompetenzgleich; der neue Kontext erzeugt keinen lokalen fachlichen oder didaktischen Widerspruch. Die vollständige unveränderte P-Struktur wird ausschließlich an die realen aktuellen Ressourcen gebunden. {boundaries[gid]} Bild und synthetische Modellantworten beweisen keine tatsächliche Lernendenleistung; E1/G1, needs_human_review bleiben.'
    records.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': f'{run_id}.{index+1:02d}', 'runId': run_id,
        'campaignId': c['campaignId'], 'roundId': c['roundId'],
        'bundleFingerprint': c['bundleFingerprint'], 'bookDigest': c['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': dict(zip(['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn'], chains[gid])),
        'rationale': rationale, 'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'
    })
    pr = json.loads(json.dumps(pm[gid]))
    pr.update({
        'reviewId': 'biologie-stoffwechsel-first-three-native-independent-a-20261008-v1',
        'reviewedAt': now(), 'reviewer': 'Codex /root/curricula_live_diagnosis; actual independent native D/P A',
        'reason': rationale, 'reviewRunIds': [],
        'dissent': ['Own exact native page/PNG/context machine review; E1/G1 needs_human_review, no human approval or trial.',
                    'Complete unchanged profile and both full bilingual cases retain independent concept transfers and original scoring. Synthetic two-case witnesses are no extra-task quota.',
                    boundaries[gid], 'All four original whole operator/source holds and both separate unapproved companion goals remain. No full source-union approval.']
    })
    positive.append(pr)
    bindings.append({'goalId': gid, 'physicalPage': index+3, 'actualPdfPagePreview': pages['pages'][index+2], 'actualPdfPageObserved': True,
                     'wholeCurrentGoalAndContextRead': True, 'wholeProfileRead': True, 'wholeCaseIdsRead': [x['id'] for x in pr['profile']['applicationCaseBriefs']],
                     'goalFingerprint': g['goalFingerprint'], 'pageFingerprint': g['pageFingerprint'],
                     'positiveReviewInputFingerprint': pr['reviewInputFingerprint'], 'profileFingerprint': pr['profileFingerprint'],
                     'actualRaster': r, 'actualAltText': pg['visualization']['altText'], 'effectivePageApplicability': pg['applicability'],
                     'sourceWholeBoundaryRetained': boundaries[gid], 'nativeBlockingFindings': []})

assert len(records) == len(positive) == 3
(d / 'results').mkdir()
rp = d / 'results' / f"{batch['batchId']}.records.jsonl"
rp.write_text(''.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) + '\n' for x in records))
parameters = {'sessionRole': 'independent native D/P A', 'task': '/root/curricula_live_diagnosis', 'reviewMode': 'actual full input and five real PDF pages; no provider API call', 'samplingParameters': 'not exposed', 'newPeerNativeReviewRead': False}
write(d / 'actual-review-parameters.json', parameters)
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
       'schemaVersion': 1, 'runId': run_id, 'campaignId': c['campaignId'], 'roundId': c['roundId'],
       'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
       'bundleFingerprint': c['bundleFingerprint'], 'bookDigest': c['bookDigest'],
       'provider': 'OpenAI Codex interactive agent', 'model': 'GPT-6 agent; exact serving model variant not exposed',
       'role': 'didactic_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
       'promptFingerprint': c['promptFingerprint'], 'criteriaFingerprint': c['criteriaFingerprint'],
       'generationParametersFingerprint': ref(d / 'actual-review-parameters.json')['sha256'],
       'independenceGroupId': c['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'],
       'inputArtifacts': [{'role': x['role'], 'digest': x['digest']} for x in b['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
       'startedAt': f['createdAtUtc'], 'completedAt': now(), 'status': 'completed', 'outputDigest': ref(rp)['sha256'], 'toolchainVersion': 'goal-description-review-v1'}
write(d / 'results' / f"{batch['batchId']}.run.json", run)
pp = d / 'P3.current-native.independent-a.review.jsonl'
pp.write_text(''.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) + '\n' for x in positive))
write(d / 'native-three.independent-a.actual-reading-and-bindings.json', {
    'schemaVersion': 1, 'reviewerTask': '/root/curricula_live_diagnosis', 'firstInputFreeze': ref(d / 'first-native-input.freeze.json'),
    'nativeEntry': ref(n / 'neutral-current-first-three-native.technical.entry.json'), 'actualPdf': ref(n / 'native-three/bundle/book.pdf'),
    'actualPdfPhysicalPagesPersonallyViewed': 5, 'wholeCurrentGoalsAndPageContextsRead': 3, 'wholeProfilesPersonallyRead': 3, 'wholeDEENCasesPersonallyRead': 6,
    'wholeFreshTransfersScoringAndEvidenceLimitsRead': True, 'newPeerNativeReviewsReadBeforeFirstSeal': False,
    'ownOperativeSourceAddendumAlreadySealed': ref(q / 'biologie-stoffwechsel-first-three-operative-scope-independent-a-addendum-20261008-v1/three-ordinary-source-placement.independent-a.first-addendum.freeze.json'),
    'ownActualV3AddendumAlreadySealed': ref(q / 'biologie-stoffwechsel-third-antenna-targeted-visual-independent-a-addendum-20261008-v3/third-antenna-v3.independent-a.first-addendum.freeze.json'),
    'scienceAMSourceRoleGatesReusedWithoutInventingNewOutcomes': True,
    'rows': bindings, 'resultsDirectory': str(d / 'results'), 'positiveReviewPath': str(pp),
    'summary': {'Dkeep': 3, 'Drevise': 0, 'Dblock': 0, 'completeProfilesRetained': 3, 'nativeBlockingFindings': 0,
                'wholeSourceUnionApproved': False, 'originalWholeOperatorHoldsRetained': 4, 'pendingCompanionsOutside392': 2,
                'activeWrites': 0, 'newStrictClosureClaims': 0, 'humanApproval': False, 'humanTrial': False}})
print(json.dumps({'Drecords': ref(rp), 'positiveRecords': ref(pp)}, ensure_ascii=False))
