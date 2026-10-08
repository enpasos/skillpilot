# SPDX-License-Identifier: Apache-2.0
"""Record actual own two-goal review after whole text/case/image/page inspection.

No independent peer's current final output is read. Source/whole science from
this reviewer's immutable original first judgment is retained transparently.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
TECH = OWN.parent / 'chemie-q3-whole-twenty-raster-native-remediation-technical-20261008-v2'
OLD = OWN.parent / 'chemie-q3-twenty-whole-science-source-independent-a-20261008-v1'
ORIGINAL = OWN.parent / 'chemie-q3-twenty-whole-science-source-author-20261008-v1'
IDS = ['9f0d6d4c-f918-5a44-a9a2-7732c4e338f3', 'c95f6059-d7c2-5bcd-b61e-95e3577efdb2']

def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def verify(row):
    p = ROOT / row['path']
    assert sha(p) == row['sha256'].removeprefix('sha256:') and p.stat().st_size == row['bytes'], p

started = datetime.now(timezone.utc).isoformat()
entry_path = TECH / 'neutral-final-two-corrosion-current480-378-raster-native-author.entry.json'
assert sha(entry_path) == '265ad8e82cddc6be6f4b0c908cb280c436832f2c589f9289b3aecea04a0a8eba'
first_input = TECH / 'final-two-current480-378-raster-native-author.first-input.freeze.json'
assert sha(first_input) == 'ae9ad505f693b1f8c6bf1e947a4c001f775e34070e14d6323b1364cae3724233'
freeze = read(first_input)
assert len(freeze['ownFiles']) == 133
for row in freeze['ownFiles']: verify(row)
verify(freeze['requiredPortableInputs'])
required = read(ROOT / freeze['requiredPortableInputs']['path'])
historical_registry_preimage = None
for row in required['requiredFiles']:
    path = ROOT / row['path']
    if sha(path) == row['sha256'].removeprefix('sha256:') and path.stat().st_size == row['bytes']:
        continue
    assert row['path'] == 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
    retained_preimage = TECH / 'before/registry.json'
    assert sha(retained_preimage) == row['sha256'].removeprefix('sha256:') and retained_preimage.stat().st_size == row['bytes']
    old_reg, new_reg = read(retained_preimage), read(path)
    assert {k:v for k,v in old_reg.items() if k != 'subjects'} == {k:v for k,v in new_reg.items() if k != 'subjects'}
    assert len(old_reg['subjects']) == len(new_reg['subjects']) == 4
    actual_deltas = []
    for old_s, new_s in zip(old_reg['subjects'], new_reg['subjects']):
        assert old_s['subject'] == new_s['subject']
        if old_s['subject'] != 'biologie':
            assert old_s == new_s
            continue
        assert old_s.keys() == new_s.keys()
        for key in old_s:
            if old_s[key] == new_s[key]: continue
            assert key in ['resolutionIndexPaths', 'resolutionSupersessions', 'positiveEvidenceConfigPaths']
            assert isinstance(old_s[key], list) and new_s[key][:len(old_s[key])] == old_s[key]
            actual_deltas.append({'subject':'biologie','field':key,'actualAppendOnlyAdded':new_s[key][len(old_s[key]):]})
    historical_registry_preimage = {'historicalExpectedBinding':row,'exactPortableHistoricalPreimage':bind(retained_preimage),'actualRootCurrentRegistry':bind(path),'actualOnlyAppendOnlyBiologyDeltas':actual_deltas,'ChemistryMathematicsPhysicsRegistryRowsExact':True,'notAnOperativeNativeChemD2P2Dependency':True,'noValidatorOrAuthorInputChanges':True}
    write(OWN / 'historical-registry-preimage-current-root-biology-only-drift.independent-a.v3.actual.json',historical_registry_preimage)
assert historical_registry_preimage is not None
all_required_paths = sorted(set([ROOT / r['path'] for r in freeze['ownFiles'] + required['requiredFiles']]))
assert not [str(p) for p in all_required_paths if p.is_symlink() and not p.exists()]
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'],
    input='\n'.join(str(p.relative_to(ROOT)) for p in all_required_paths) + '\n', capture_output=True, text=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.splitlines(), ignored.stdout
write(OWN / 'first-current-two-portable-inputs.independent-a.v3.actual.json', {
    'schemaVersion': 1, 'checkedAt': datetime.now(timezone.utc).isoformat(),
    'actualGitCommand': ['git', 'check-ignore', '--no-index', '--stdin'],
    'actualExitCode': ignored.returncode, 'actualDistinctOperativePathsVerified': len(all_required_paths),
    'exactAuthorOwnFiles': 133, 'exactStillLiveRequiredInputBindings': len(required['requiredFiles'])-1, 'exactHistoricalRegistryPreimageBindings':1, 'historicalRegistryPreimageReceipt':'historical-registry-preimage-current-root-biology-only-drift.independent-a.v3.actual.json',
    'ignoredOperativeDependencies': [], 'brokenSymlinks': [], 'rawIgnoredRenderRequired': False,
    'currentPeerFinalBFilesRead': 0, 'activeWrites': 0})

old_seal = OLD / 'whole20-40-science-source-A-P.independent-a.first.freeze.json'
assert sha(old_seal) == 'a6b473ca150723974c09b273862e7ead600eb0b2acc959042b62705c43e1b083'
prior_rows = {r['goalId']: r for r in read(OLD / 'whole20-science-source-A-P.independent-a.first.verdicts.json')['rows']}
cases = read(TECH / 'whole-science/selected-four-current-complete-DEEN-cases.actual.json')['cases']
assert len(cases) == 4 and {c['goalId'] for c in cases} == set(IDS)
source = read(TECH / 'source/final-two-whole-five-three-duty-and-all-partner-inputs.exact.json')
old_source = read(ORIGINAL / 'source/whole-all-current-source-goals-and-1n-partners.lossless.json')
current_source = read(TECH / 'source/whole-current-all20-1602-929-5459.lossless-exact.json')
assert old_source == current_source
source_by = {r['sourceKey']: r for r in old_source['sourceGoals']}
source_map = []
for e in source['entries']:
    assert e['goalId'] in IDS and e['wholeDutyCount'] == (5 if e['goalId'] == IDS[0] else 3)
    for d in e['wholeSourceDutiesAndAllCurrentPartnerRows']:
        assert d == source_by[d['sourceKey']]
        source_map.append({'goalId': e['goalId'], 'sourceKey': d['sourceKey'],
            'wholeRetainedSourceOperator': d['wholeRetainedExtractionGoal']['sourceText'],
            'originalSourceRef': d['wholeRetainedExtractionGoal']['sourceRef'],
            'allRetainedPartnerRows': d['allPartnerRows'], 'decision': 'KEEP bounded contribution',
            'reason': 'Own genuine original whole-primary bounded review retained; all unchanged whole obligations and partner roles preserved. A contribution is not a new full partner/whole-source-union approval.'})
write(OWN / 'eight-current-source-duties-all-partners.retained-independent-a.v3.actual.json', {
    'role': 'Targeted retention of this reviewer\'s genuine previous bounded source reading, not a new universal source review',
    'genuineOriginalOwnFirstSeal': bind(old_seal),
    'actualOriginalPrimaryReadingReceipt': bind(OLD / 'actual-original-primary-reads-boundaries.independent-a.first.receipt.json'),
    'whole929SourcePool1602EdgesAnd5459PartnerRowsExact': True,
    'selectedWholeDuties': 8, 'ownSourceRoleDecisions': source_map,
    'allOther18ScienceSourceHoldsRetained': True, 'newWholePartnerApprovals': 0,
    'currentPeerFinalBFilesRead': 0, 'humanApproval': False, 'activeWrites': 0})

whole = read(TECH / 'candidate/canonical.current480.only-one-reviewed-correction-link.inactive.json')
before = read(TECH / 'before/canonical.json')
assert len(whole['goals']) == len(before['goals']) == 480
goal_by = {g['id']: g for g in whole['goals']}
before_by = {g['id']: g for g in before['goals']}
profiles = {r['goalId']: r for r in [json.loads(s) for s in (TECH / 'positive/P2.actual-current-JPEG-KEEP-and-corrected-PNG.native-author.jsonl').read_text().splitlines()]}
assert set(profiles) == set(IDS)
views = read(TECH / 'checks/two-full-native-PDF-pages-and-four-actual-widths.review-input-map.json')
model = read(TECH / 'native/final-two/book-model.json')
assert len(model['pages']) == 2
page_by = {p['goalId']: p for p in model['pages']}
full = read(TECH / 'native/full378.final-current-raster-api.book-model.json')
assert len(full['pages']) == 378
round_a = TECH / 'native/final-two/round-a'
campaign = read(round_a / 'description-review-campaign.json')
inp = read(round_a / 'description-review-input.json')
bundle = read(round_a / 'review-bundle-manifest.json')
assert campaign['reviewPass'] == 'first_pass' and campaign['goalCount'] == campaign['batchSize'] == 2
assert campaign['blindToOtherReviews'] and {g['goalId'] for g in inp['goals']} == set(IDS)
pdf_text = subprocess.run(['pdftotext', '-layout', str(TECH / 'native/final-two/bundle/book.pdf'), '-'], capture_output=True, text=True)
assert pdf_text.returncode == 0 and all(gid in pdf_text.stdout for gid in IDS)
with (OWN / 'actual-two-native-whole-pages.independent-a.v3.txt').open('x') as f: f.write(pdf_text.stdout)

science_reasons = {
 IDS[0]: 'Eine atomare Erklärung des elektrochemischen Kontaktkorrosionsmodells. Metallischer Elektronenweg und ionische Feuchtigkeit sind getrennt; Fe ist im Fe/Cu-Modell Anode und Cu Ort der Sauerstoffreduktion ohne benötigte Cu2+-Ionen. Beide Redoxgleichungen sind atom- und ladungsbilanziert. Der Flächeneffekt wird ausschließlich unter vorgegebener kathodischer Strombegrenzung beurteilt; Standardpotenziale liefern keine reale Korrosionsrate. Fresh-Fälle entfernen den ionischen Pfad bzw. kehren mit Zn die Anodenrolle um. Beide ganzen DE/EN-Fälle samt 10-Punkte-Skalen verlangen begründete Fachleistung, keine reine Begriffswiederholung.',
 IDS[1]: 'Eine atomare begründete Werkstoffverwendung aus derselben Korrosions-/Umgebungsbeziehung. Passivierung trennt kinetische Hemmung von der thermodynamischen Einordnung; ein dichter Aluminium- bzw. Cr-Oxidfilm kann schützen, poröser Rost schützt im angegebenen Modell weniger. Chloridhaltige Spalten und unbekannte saure Prozesse erfordern eigene Film-/Korrosionsdaten; rostfrei ist nicht universell. Erklärung und Nutzungsurteil bleiben DE/EN äquivalent. Der echte zuvor selbst beanstandete q3-16-a-Fresh-Widerspruch ist jetzt richtig aufgelöst: Beschädigung/Nachwachsen des Films impliziert weder allgemeine Immunität noch eine Änderung der Standardpotenziale unveränderter Redoxpaare. Beide deutschen Fresh-/Scoringstellen und die operative P-Erwartung stimmen jetzt mit dem unveränderten englischen ganzen Fall überein.'}
visual_reasons = {
 IDS[0]: 'Tatsächliches gutes ursprüngliches Nano-Banana-JPG KEEP. Zn links ist korrekt Anode; Zn→Zn2++2e− und O2+2H2O+4e−→4OH− stimmen. Der äußere Elektronenpfeil führt zum kathodischen Cu rechts, beide Körper liegen im gemeinsamen Elektrolyten. Die Beschriftung erlaubt keine notwendige Cu2+-Reduktion. 360px zeigt gekoppelte Metalle, Elektronenrichtung und Anoden-/Kathodenrollen klar; 680px und volle Buchseite3 sind lesbar. Das Zn/Cu-Bild ist ein fachlich passendes alternatives Kontaktmodell zu den Fe/Cu- und Fe/Zn-Fällen, keine Darstellung einer realen Versuchsleistung.',
 IDS[1]: 'Tatsächliches minimal korrigiertes PNG KEEP; die belegte falsche Mischsprache ist jetzt korrekt Feuchte Luft. Rostender Eisenkörper, dichte Passivschicht und lokaler Angriff bleiben erkennbar; Edelstahlspüle und Opferanode illustrieren bedingte Werkstoffnutzung bzw. gezielten Schutz. Es wird keine Immunität in jeder Umgebung behauptet. 360px zeigt die wichtigen drei Korrosionsbilder und zwei Anwendungen; Detailbeschriftungen sind am 680px-Bild bzw. der vollen Buchseite4 gut erkennbar. Kein neues Stilbild und kein programmatischer Ersatz; freundliche bestehende Form erhalten.'}
verdicts = []
for gid in IDS:
    g = goal_by[gid]; prior = prior_rows[gid]
    assert {k:v for k,v in g.items() if k != 'resourceLinks'} == {k:v for k,v in before_by[gid].items() if k != 'resourceLinks'}
    selected_cases = [c for c in cases if c['goalId'] == gid]
    assert len(selected_cases) == 2
    for case in selected_cases:
        assert case['wholeCurrentGoal'] == before_by[gid]
        assert {k:v for k,v in case['wholeCurrentGoal'].items() if k != 'resourceLinks'} == {k:v for k,v in g.items() if k != 'resourceLinks'}
    for c in selected_cases:
        assert sum(r['points'] for r in c['scoring']['criteria']) == c['scoring']['maximumPoints'] == 10
        assert c['evidence']['maximumClaimScope'] == 'G1' and c['evidence']['level'] == 'E1'
        assert not c['evidence']['humanTrial'] and not c['evidence']['performedExperiment'] and not c['evidence']['actualLearnerPerformance']
    p = profiles[gid]
    assert p['status'] == 'needs_human_review' and p['reviewAuthority'] == 'ai_candidate' and p['evidenceLevel'] == 'E1' and p['maximumClaimScope'] == 'G1'
    cap = next(c for c in views['captures'] if c['goalId'] == gid)
    for v in cap['captures']:
        assert sha(ROOT / v['path']) == v['sha256'] and v['measured']['renderedWidth'] == v['width']
        assert v['measured']['objectFit'] == 'contain'
    actual = next(v for v in views['actualPages'] if v['goalId'] == gid)
    verify(actual['actualSelectedRaster'])
    page = page_by[gid]
    assert page['title'] == g['title'] and page['description'] == g['description'] and page['visualization']['originalDigest'] == actual['actualSelectedRaster']['sha256']
    di = next(i for i in inp['goals'] if i['goalId'] == gid)
    assert di['pageFingerprint'] == page['pageFingerprint']
    verdicts.append({'goalId': gid, 'ordinal': 15 if gid == IDS[0] else 16,
        'wholeCurrentGoal': g, 'wholeDEENCases': selected_cases, 'wholePRecord': p, 'caseEmbeddedResourceLinksRemainHistoricalPreimage':gid==IDS[1], 'caseGoalSemanticBodyExactCurrent':True, 'actualD_P_VUsesCurrentRasterResourceNotCaseEmbeddedHistoricalLinks':True,
        'D': 'KEEP', 'P': 'PASS whole current profile, scoped E1/G1 needs_human_review', 'V': 'KEEP actual raster',
        'semanticAtomicity': 'atomic', 'scienceReasonDe': science_reasons[gid], 'visualReasonDe': visual_reasons[gid],
        'wholeSourceDutiesAndEveryPartnerRetained': [x for x in source_map if x['goalId'] == gid],
        'actualFullRasterViewed': actual['actualSelectedRaster'], 'actualBothWidthsViewed': [bind(ROOT / c['path']) for c in cap['captures']],
        'actualWholeNativePageViewed': views['physicalRenders'][0 if gid == IDS[0] else 1],
        'nativeSubsetPageFingerprint': page['pageFingerprint'],
        'nativeSubsetContextReviewed': di['reviewContext'], 'canonicalContextReviewed': di['canonicalContext'],
        'Memory': 'KEEP genuinely existing unchanged limited-memory role; no new card/SRS approval',
        'priorOwnScienceFirstRowPreserved': prior, 'blockingFindings': [], 'currentPeerFinalBFilesRead': 0,
        'humanApproval': False, 'realLearnerPerformance': False, 'activeWrites': 0, 'strictGainClaimed': 0})
write(OWN / 'two-genuine-current-D-P-V.independent-a.first.verdicts.json', {
    'schemaVersion': 1, 'recordedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Own genuine blind first final native2 whole D/P/V judgment after personally seeing eight actual files',
    'records': verdicts, 'actualViewsPersonallyInspected': 8, 'sourceScope': '5+3 bounded original duties; no universal929/partner approval',
    'currentWholeCanonicalCount': 480, 'actualCurricularAtomicCount': 378, 'nationalActiveAtlas359': 'unchanged distinct view',
    'allOther18OriginalHoldsRemainOutsideFinalScope': True, 'currentPeerFinalBFilesRead': 0,
    'closedP2NativeChecks': 'pending actual execution after this first seal',
    'ordinaryCorrectedRasterPCLI': 'pending installation', 'activeWrites': 0, 'strictGainClaimed': 0,
    'humanApproval': False, 'humanTrial': False})

batch = campaign['batches'][0]
run_id = OWN.name + '.genuine-current-two-first-pass'
records = []
for g in inp['goals']:
    gid = g['goalId']; ex = profiles[gid]['profile']['expectations']; ev = {}
    for suffix in ['De', 'En']:
        ev['essentialUnderstanding' + suffix] = ' '.join(r['essentialUnderstanding' + suffix] for r in ex)
        ev['observablePerformance' + suffix] = ex[0]['observablePerformance' + suffix]
        ev['transferExpectation' + suffix] = ex[-1]['observablePerformance' + suffix]
    records.append({'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': run_id + '.' + gid, 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': inp['bundleFingerprint'], 'bookDigest': inp['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': ev,
        'rationale': science_reasons[gid] + ' ' + visual_reasons[gid] + ' Alle aktuellen fünf bzw. drei Originalpflichten und 1:n-Partnerrollen sind unverändert gezielt erhalten; kein universeller Quellen-/Partnerabschluss. Keine reale Experimente, Lernerleistung oder menschliche Freigabe.',
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'none',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
out = OWN / 'current-two-round-a/results'
out.mkdir(parents=True, exist_ok=True)
rp = out / (batch['batchId'] + '.records.jsonl')
with rp.open('x') as f:
    for r in records: f.write(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n')
run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': inp['bundleFingerprint'], 'bookDigest': inp['bookDigest'],
    'provider': 'OpenAI', 'model': 'Codex actual independent A; serving revision not exposed', 'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': 'sha256:' + hashlib.sha256(b'Actual own blind current2 whole text/cases/eight raster-native views; sampling not exposed').hexdigest(),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': IDS,
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','book_pdf','book_pdf_render_manifest','review_input_json','review_prompt','review_criteria']],
    'startedAt': started, 'completedAt': datetime.now(timezone.utc).isoformat(),
    'outputDigest': 'sha256:' + sha(rp), 'status': 'completed', 'toolchainVersion': 'skillpilot-goal-description-review-v1'}
run['inputArtifacts'].append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
write(out / (batch['batchId'] + '.run.json'), run)
write(OWN / 'two-genuine-current-D-P-V.independent-a.first.freeze.json', {
    'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Immutable independent A genuine first final current two-corrosion whole D/P/V judgments, before current peer',
    'actualAuthorFirstInputSeal': bind(first_input), 'ownGenuineHistoricalScienceFirstSeal': bind(old_seal),
    'ownFiles': [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()],
    'DKEEP': 2, 'PWholeScopedPASS': 2, 'VActualKEEP': 2, 'blockingFindings': [],
    'actualViewsPersonallyInspected': 8, 'currentPeerFinalBFilesRead': 0,
    'actualNativeD2CLIAndP2API': 'pending after own immutable first seal',
    'ordinaryCorrectedRasterPCLI': 'pending installation', 'allOther18HoldsRemainOutsideScope': True,
    'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0})
print(json.dumps({'firstSeal': bind(OWN / 'two-genuine-current-D-P-V.independent-a.first.freeze.json'), 'DKEEP': 2, 'PWholeScopedPASS': 2, 'VActualKEEP': 2, 'blocking': 0}))
