import json, hashlib, pathlib, datetime

B = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
V = B / 'biology-molecular-genetics-six-targeted-phone-population-independent-v-a-v1'
A = B / 'biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/six-targeted-phone-and-population-remedies-v1'
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p): return json.loads(pathlib.Path(p).read_text())
def bind(p):
    p = pathlib.Path(p); raw = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(name, value):
    p = V / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)
entryPath = A / 'neutral-six-actual-phone-and-population-raster-successors.author-review.entry.json'
entry = read(entryPath)
pixelPath = V / 'six-actual-rasters.pixel-FIRST.independent-A.verdict.json'
pixel = read(pixelPath)
ownInput = read(V / 'six-selected-actual-raster-input.before-own-pixels.independent-A.json')
firstSeal = bind(V / 'six-actual-rasters.pixel-FIRST.independent-A.freeze.json')
checks, errors, rows = [], [], []
def check_binding(b, context):
    actual = bind(b['path'])
    ok = actual['sha256'].removeprefix('sha256:') == b['sha256'].removeprefix('sha256:') and actual['bytes'] == b['bytes']
    checks.append({'context': context, 'actual': actual, 'expected': b, 'pass': ok})
    if not ok: errors.append(context)
    return actual
notes = {
10: 'Caption and alt accurately name E1/E2, S→I→P, E2 loss and the visible large I ersetzt / kein E2. They do not invent an accumulation absent from this selected raster. Original generation and targeted edit are intentions; the separate reconstruction describes the actual two rows and explicitly refuses to invent an accumulation. Abstract ovals are not molecular structures. Enzyme-chain example does not establish all protein functions or learner mastery.',
11: 'Caption confines the contrast to one considered gene in two cell types sharing DNA; it does not claim global protein abundance for all genes. Alt and reconstruction match the visible open/dense chromatin, TF, unequal mRNA/protein symbols and signal, including the actual large TF = Transkriptionsfaktor footer. Same DNA is not changed into a cell-specific sequence. Original/edit instructions and actual-view reconstruction remain distinct.',
12: 'Actual caption and alt accurately match fork/enzymes, opposed new-strand extension arrows, three large example temperatures, inward primers, two schematic copies and damaged-base removal/replacement/closure. Reconstruction correctly avoids invented sequences or exact PCR cycle counts. Temperatures are procedural examples; caption explicitly denies a universal temperature prescription or executable laboratory protocol. The whole EA goal includes repair; the visual remains a bounded schematic rather than learner performance.',
14: 'Caption correctly distinguishes homolog separation from sister separation and bounds the illustrated completed female meiosis-II endpoint: completion in humans is related to fertilization; three polar bodies require first-polar-body division. Alt/reconstruction faithfully count the blue egg, blue polar body and two red polar bodies and no extra red→blue arrow. Intermediate first-division cell circles are schematic same-size icons rather than quantitative cytoplasmic volumes; final product sizes convey the contrast. This bounded limitation from pixel FIRST remains recorded without converting it into a new scientific finding.',
15: 'Caption states the scientifically intended reciprocal exchange and honestly restricts the biodiversity bridge to existing alleles, population variants, inheritance/selection across generations and possible diversity; neither immediate new species nor allele creation is claimed. Alt accurately describes broad layout but omits the defective central marker. The actual-view reconstruction explicitly asserts central lower markers grün/orange/grün/orange, while the actually inspected selected PNG has grün/orange/orange/orange. That reconstruction sentence is false for the bound selected bytes and conceals the marker-conservation defect. Caption/alt and edit intention cannot repair the raster. Hold this selected raster and reconstruction together until an actually corrected successor is independently inspected.',
16: 'Caption/alt/reconstruction faithfully distinguish one-type trisomy from all-three-types triploidy with actual copy counts, and the Gendosis→Zelle→Organ→Organismus chain plus dotted illness question. Three abstract types are explicitly not a human full karyogram, and no clinical diagnosis or inevitable disease is asserted. Original/edit prompts ask for legibility changes; reconstruction records actual selected visible symbols and labels.'
}
for row in entry['images']:
    n = row['ordinal']; imageDir = pathlib.Path(row['assetPath']).parent
    selectedReceipt = read(row['generationReceiptBinding']['path'])
    receiptExact = selectedReceipt == row['actualGenerationProvenance']
    checks.append({'context': f'{n} actual selected receipt equals declared provenance', 'pass': receiptExact})
    if not receiptExact: errors.append(f'{n} receipt')
    selectedAsset = check_binding(row['assetBinding'], f'{n} selected raster')
    rawPath = pathlib.Path(selectedReceipt['rawGeneratedOutput'])
    rawExact = rawPath.exists() and rawPath.read_bytes() == pathlib.Path(row['assetPath']).read_bytes()
    checks.append({'context': f'{n} selected raw generated PNG byte equality', 'rawGeneratedOutput': str(rawPath), 'exists': rawPath.exists(), 'pass': rawExact})
    if not rawExact: errors.append(f'{n} raw PNG mismatch/missing')
    promptPaths = [pathlib.Path(row['originalPromptPath']), imageDir/'original-edit.prompt.en.md', pathlib.Path(row['selectedEditPromptPath']), pathlib.Path(row['reconstructionPromptPath'])]
    unique = list(dict.fromkeys(promptPaths))
    prompts = [{'binding': bind(p), 'role': ('original-generator-intention' if p == pathlib.Path(row['originalPromptPath']) else 'selected-actual-view-reconstruction' if p == pathlib.Path(row['reconstructionPromptPath']) else 'selected-edit-intention' if p == pathlib.Path(row['selectedEditPromptPath']) else 'initial-successor-edit-intention'), 'wholeBodyActuallyReadAfterPixelFirst': p.read_text()} for p in unique]
    for k in ['originalPromptBinding', 'selectedEditPromptBinding', 'reconstructionPromptBinding', 'generationReceiptBinding', 'referenceOriginalImageBinding', 'predecessorActualRasterBinding']:
        check_binding(row[k], f'{n} {k}')
    link = row['resourceLinkCandidate']
    linkOK = link['description'] == row['descriptionDe'] and link['altText'] == row['altTextDe'] and link['skillpilotId'] == row['goalId'] and link['role'] == 'primary' and link['resourceType'] == 'image'
    checks.append({'context': f'{n} literal link/description/alt/goal contract', 'pass': linkOK})
    if not linkOK: errors.append(f'{n} link')
    rows.append({'ordinal': n, 'goalId': row['goalId'], 'actualSelectedPNG': selectedAsset, 'wholeCurrentGoal': row['wholeCurrentGoal'], 'wholeDescriptionDeActuallyRead': row['descriptionDe'], 'wholeAltTextDeActuallyRead': row['altTextDe'], 'wholeResourceLinkCandidate': link, 'provider': row['provider'], 'tool': row['tool'], 'model': row['model'], 'modelDisclosure': row['modelDisclosure'], 'actuallyReadWholePromptBodiesAfterFirst': prompts, 'actualSelectedGenerationReceiptActuallyRead': selectedReceipt, 'generationReceiptBinding': bind(row['generationReceiptBinding']['path']), 'actualPhysicalReferenceChain': {'selectedReference': row['referenceOriginalImageBinding'], 'historicalPredecessor': row['predecessorActualRasterBinding']}, 'rawCurrentPNGByteExact': rawExact, 'originalVersusEditVersusReconstructionRolesHonest': True, 'actualCaptionAltAndReconstructionReasoning': notes[n], 'captionAltScientificallyBounded': True, 'captionDoesNotRepairRasterDefect': n == 15, 'currentReconstructionFidelityPass': n != 15, 'findingIds': ['BIO23-V6-A-001', 'BIO23-V6-A-META-001'] if n == 15 else []})
current = read(entry['wholeCurrent23Entry']['path']); previous = read(entry['predecessorCurrent23Entry']['path'])
cur = {r['ordinal']: r for r in current['entries']}; prev = {r['ordinal']: r for r in previous['entries']}
changed = {r['ordinal'] for r in rows}
retention = []
for n in range(1,24):
    goalExact = cur[n]['wholeCurrentGoal'] == prev[n]['wholeCurrentGoal']
    if not goalExact: errors.append(f'whole goal {n} changed')
    sameEntry = cur[n] == prev[n]
    if n not in changed and not sameEntry: errors.append(f'unselected whole entry {n} changed')
    if n in changed and cur[n]['assetBinding'] != next(r['actualSelectedPNG'] for r in rows if r['ordinal']==n): errors.append(f'selected entry {n} not bound')
    retention.append({'ordinal': n, 'goalId': cur[n]['goalId'], 'wholeCurrentGoalExact': goalExact, 'unselectedWholeEntryExact': sameEntry if n not in changed else None, 'unselectedRasterPixelsRejudged': False})
metaFinding = {'findingId': 'BIO23-V6-A-META-001', 'parentFindingId': 'BIO23-V6-A-001', 'ordinal': 15, 'goalId': cur[15]['goalId'], 'severity': 'blocking actual reconstruction fidelity', 'status': 'HOLD', 'exactSource': {'binding': bind(cur[15]['reconstructionPromptPath']), 'literalSentence': 'Obere Marker bleiben gelb/gelb/violett/violett am homologen oberen Locus; untere Marker grün/orange/grün/orange.'}, 'actualSelectedRaster': cur[15]['assetBinding'], 'actualMismatch': 'Central lower markers actually green/orange/orange/orange; the inner blue-upper/red-distal lower marker is orange, not green. The reconstruction falsely describes the intended corrected conservation state.', 'requiredRemedy': 'Bind and inspect an actual corrected central marker successor, then make reconstruction describe those actual selected bytes. No caption-only or hash-only resolution.'}
common = {'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1/G1 machine candidate review', 'maximumClaimScope': 'bounded inactive selected raster plus actually read metadata/provenance', 'freshPeerVRead': False, 'authorInspectionLabelsRead': False, 'currentNativeVApproved': False, 'currentWholeV23Approved': False, 'newWholeScience23Approval': False, 'newWholeP23Approval': False, 'wholeSourceCourseApproval': False, 'actualLearnerPerformance': False, 'actualExperimentPerformed': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0}
follow = write('six-exact-selected-metadata-prompts-provenance.AFTER-pixel-FIRST.independent-A.json', {'schemaVersion': 1, 'role': 'Actual whole prompt/metadata/provenance reading after immutable own pixel FIRST', 'createdAt': now, 'ownPixelFirst': bind(pixelPath), 'ownPixelFirstSeal': firstSeal, 'originalNeutralEntry': bind(entryPath), 'actualPromptBodiesRead': sum(len(r['actuallyReadWholePromptBodiesAfterFirst']) for r in rows), 'actualSelectedReceiptsRead': len(rows), 'perImageFollowup': rows, 'findings': [metaFinding], 'selectedWhole23Entry': entry['wholeCurrent23Entry'], 'previousWhole23Entry': entry['predecessorCurrent23Entry'], 'exactRetentionChecks': retention, 'all17UnselectedWholeEntriesExact': all(r['unselectedWholeEntryExact'] for r in retention if r['ordinal'] not in changed), 'all23WholeGoalsExact': all(r['wholeCurrentGoalExact'] for r in retention), 'currentScienceV7EntryBindingOnly': check_binding(entry['currentScienceV7Entry'], 'current science-v7 neutral entry'), 'actualChecks': checks, 'errors': errors, **common})
assert not errors, errors
records = []
for p in pixel['perRasterJudgments']:
    n=p['ordinal']; m=next(r for r in rows if r['ordinal']==n)
    records.append({'schemaVersion': 1, 'reviewId': V.name, 'ordinal': n, 'goalId': p['goalId'], 'wholeCurrentGoal': p['wholeCurrentGoal'], 'assetBinding': m['actualSelectedPNG'], 'resourceLinkCandidate': m['wholeResourceLinkCandidate'], 'decision': 'HOLD_RASTER_AND_RECONSTRUCTION_CANDIDATE' if n==15 else 'PASS_KEEP_RASTER_CANDIDATE', 'firstPixelJudgment': bind(pixelPath), 'firstPixelSeal': firstSeal, 'ownConcretePixelNotes': p, 'actualViewCount': 3, 'metadataPromptFollowup': follow, 'actualMetadataReasoning': notes[n], 'findings': [pixel['findings'][0],metaFinding] if n==15 else [], 'currentScienceAndPJudgmentReuse': ownInput['ownCurrentNativeCompletedEntry'], 'scienceReuseLimits': 'Use existing own whole-goal scientific reading and current Native23 P23 judgments only where those whole bodies are exact. This V6 review does not independently approve the two whitespace-only v7 karyogram successors or a new P/native frame.', **common})
rp=V/'six-bounded-current-candidate-V.independent-A.records.jsonl'; assert not rp.exists();rp.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in records))
resolution = write('six-targeted-actual-V-candidate-resolution.independent-A.json', {'schemaVersion': 1, 'role': 'Own selected-six resolution only; historical pixel decisions and disagreements remain intact', 'createdAt': now, 'pixelFirst': bind(pixelPath), 'metadataFollowup': follow, 'records': bind(rp), 'keepOrdinals': [10,11,12,14,16], 'holdOrdinals': [15], 'resolutions': [{'ordinal': r['ordinal'], 'goalId': r['goalId'], 'selectedRaster': r['assetBinding'], 'decision': r['decision'], 'basis': 'Own three actually seen selected views and subsequent whole prompts/caption/alt/provenance; no peer resolution inferred', 'findingIds': [x['findingId'] for x in r['findings']]} for r in records], 'historicalFirstSealsChanged': False, 'other17PixelsRejudged': False, **common})
completed = write('neutral-completed-six-targeted-actual-V-independent-A.review.entry.json', {'schemaVersion': 1, 'role': 'Neutral completed genuine independent six selected actual raster candidate review', 'createdAt': now, 'originalAuthorNeutralEntry': bind(entryPath), 'ownInputFirst': bind(V/'six-targeted-actual-raster-input.FIRST.independent-A.freeze.json'), 'ownPixelFirst': bind(pixelPath), 'ownPixelFirstSeal': firstSeal, 'afterFirstActualMetadataPromptProvenanceReview': follow, 'boundedCandidateVRecords': bind(rp), 'ownTargetedResolution': resolution, 'actualViewCount': 18, 'actualPromptBodiesRead': 22, 'actualSelectedGenerationReceiptsRead': 6, 'keepOrdinals': [10,11,12,14,16], 'holdOrdinals': [15], 'all17UnselectedWholeEntriesExact': True, 'all23WholeGoalsExact': True, 'technicalBindingErrors': errors, 'scientificHoldsDistinctFromTechnicalErrors': ['BIO23-V6-A-001','BIO23-V6-A-META-001'], 'nativeFollowupRequired': True, **common})
seal = write('six-targeted-actual-V-completed-independent-A.final.freeze.json', {'schemaVersion': 1, 'role': 'Additive final freeze of genuine own V6 candidate review and after-FIRST metadata, original FIRSTs unchanged', 'createdAt': now, 'completedEntry': completed, 'outputs': [bind(pixelPath),firstSeal,follow,bind(rp),resolution,bind(V/'materialize-after-FIRST-metadata-and-bounded-V.independent.py')], **common})
print(json.dumps({'completedEntry':completed,'finalSeal':seal,'checks':len(checks),'technicalErrors':errors},ensure_ascii=False,indent=2))
