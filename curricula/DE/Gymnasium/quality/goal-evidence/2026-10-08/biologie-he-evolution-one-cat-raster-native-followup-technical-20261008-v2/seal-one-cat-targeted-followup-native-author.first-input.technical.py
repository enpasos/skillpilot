# SPDX-License-Identifier: Apache-2.0
"""Immutable neutral technical author input; no scientific or visual approval."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, subprocess

R = Path.cwd()
D = Path(__file__).resolve().parent
REQ = {}

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def rel(p):
    return str(Path(p).relative_to(R))

def bind(p):
    p = Path(p)
    v = {'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
    REQ[v['path']] = v
    return v

def read(p):
    bind(p)
    return json.loads(Path(p).read_text())

def verify(v, base=R):
    p = base / v['relativePath'] if 'relativePath' in v else R / v['path']
    assert sha(p) == v.get('sha256', v.get('digest')).removeprefix('sha256:'), p
    assert 'bytes' not in v or p.stat().st_size == v['bytes'], p
    return bind(p)

def put(name, value):
    p = D / name
    p.parent.mkdir(parents=True, exist_ok=True)
    b = ((value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2)) + '\n').encode()
    assert not p.exists(), p
    t = p.with_suffix(p.suffix + '.tmp')
    t.write_bytes(b)
    os.replace(t, p)
    return bind(p)

g = read(D / 'initial-one-current392-followup-whole-context-guards.technical.json')
target = g['targetGoalId']
O = R / g['original18AuthorFolder']
verify(g['originalAuthorFirstSeal'])
verify(g['original18NeutralEntry'])
old = read(R / g['originalAuthorFirstSeal']['path'])
assert len(old['ownFiles']) == 281
for v in old['ownFiles'] + old['authorizedInactiveAtlasFiles']:
    verify(v)
oldPortability = read(R / old['requiredPortableInputs']['path'])
for v in oldPortability['requiredFiles']:
    verify(v)
for name in ['initial-declared-inputs.technical.json', 'native-one-followup-declared-inputs.technical.json']:
    for v in read(D / 'checks' / name)['files']:
        verify(v)
verify(g['actualCorrectedImageManifest'])
image = read(R / g['actualCorrectedImageManifest']['path'])
for key in ['png', 'prompt', 'provenance']:
    verify(image[key])
provenance = read(R / image['provenance']['path'])
verify(provenance['exactRequest'])
verify(provenance['editedFrozenV1'])
verify(provenance['wholeFrozenFirst18SelectionPreserved'])
assert image['png']['sha256'] == 'cae551e813945967b2dc9d889ab04517da989fcfa131d5b1911e431d27033758'
for name in ['one-cat-dedicated-one-native-v2', 'one-cat-two-browser-widths']:
    assert read(D / 'checks' / (name + '.terminal.actual.json'))['actualExitCode'] == 0
render = read(D / 'checks/one-cat-native-physical-renders-and-seventeen-body-preservation.actual.json')
assert render['actualExitCode'] == 0 and render['other17ActualBodyPixelsExact']
assert render['other17ActualDifferencesOnlyFooterDigest'] and len(render['actualPhysicalGoalRenders']) == 19
for v in render['actualPhysicalGoalRenders']:
    verify(v)
for v in render['comparisons']:
    assert sha(R / v['oldRenderPath']) == v['oldRenderSHA256']
    bind(R / v['oldRenderPath'])
contexts = read(D / 'checks/actual-native-one-versus-eighteen-page-context-deltas.technical.json')
assert contexts['allPrerequisiteScopeWholeTextImageMeaningsExact']
assert contexts['actualIntegrationUsesOriginalSame18PageBinding']
operative = read(D / 'checks/actual-operative-full18-versus-helper1-goal-review-context-fingerprints.json')
assert operative['operativeFull18GoalReviewContextFingerprint'] != operative['dedicatedHelperOneGoalReviewContextFingerprint']
assert operative['other17NativeGoalContextsExact'] and len(operative['targetedFull18Batches']) == 2
for row in operative['targetedFull18Batches']:
    folder = R / row['campaignDirectory']
    campaign = read(folder / 'description-review-campaign.json')
    assert campaign['batchSize'] == 1 and campaign['goalCount'] == 18 and len(campaign['batches']) == 18
    assert campaign['reviewPass'] == 'follow_up' and not (folder / 'results').exists()
    assert row['actualTargetBatch']['goalIds'] == [target]
    for b in campaign['batches']:
        p = folder / 'batches' / (b['batchId'] + '.input.jsonl')
        assert sha(p) == b['batchInputFingerprint'].removeprefix('sha256:')
        assert len(p.read_text().splitlines()) == 1
        bind(p)
P = read(D / 'checks/P18-only-one-corrected-PNG-current-closed-native-schema-semantics.actual.json')
assert P['actualSchemaAndSemanticErrors'] == 0 and P['changedResourceBindings'] == 1
assert P['unchangedWholeRecordLines17'] and P['reviewedResourceTypes'] == ['goal-visualization']
oldLines = (O / 'positive/P18.current-whole.actual-raster-author.review.jsonl').read_bytes().splitlines()
newLines = (D / 'positive/P18.only-one-current-PNG-rebound.seventeen-lines-exact.jsonl').read_bytes().splitlines()
assert len(oldLines) == len(newLines) == 18
for a, b in zip(oldLines, newLines):
    ja, jb = json.loads(a), json.loads(b)
    assert ja['goalId'] == jb['goalId']
    assert ja['profile'] == jb['profile'] and ja['profileFingerprint'] == jb['profileFingerprint']
    assert ja['goalFingerprint'] == jb['goalFingerprint']
    if ja['goalId'] != target:
        assert a == b
    else:
        assert ja['reviewInputFingerprint'] != jb['reviewInputFingerprint']
capture = read(D / f'width-captures/{target}/chromium-captures.actual.json')
assert len(capture['captures']) == 2 and sha(R / capture['sourcePath']) == capture['sourceSha256']
for v in capture['captures']:
    verify(v)
    assert v['width'] in [360, 680] and v['measured']['renderedWidth'] == v['width']
for name, count in [('eighteen-same-context', 18), ('one-targeted-followup', 1)]:
    folder = D / 'native' / name / 'bundle'
    manifest = read(folder / 'review-bundle-manifest.json')
    for v in manifest['artifacts']:
        p = folder / v['path']
        assert sha(p) == v['digest'].removeprefix('sha256:') and p.stat().st_size == v['bytes']
        bind(p)
    model = read(folder / 'book-model.json')
    assert len(model['pages']) == count
for side in ['a', 'b']:
    folder = D / 'native/one-targeted-followup' / ('follow-up-' + side)
    campaign = read(folder / 'description-review-campaign.json')
    assert campaign['batchSize'] == campaign['goalCount'] == 1
    assert campaign['reviewPass'] == 'follow_up' and not campaign['blindToOtherReviews']
    assert len(campaign['batches']) == 1 and not (folder / 'results').exists()
    assert campaign['independenceGroupId'] == f'biologie-he-evolution-eighteen-current392-raster-independent-{side}-20261008-v1'
    for b in campaign['batches']:
        p = folder / 'batches' / (b['batchId'] + '.input.jsonl')
        assert sha(p) == b['batchInputFingerprint'].removeprefix('sha256:')
        assert len(p.read_text().splitlines()) == 1
        bind(p)
pageMap = read(D / 'checks/actual-same-eighteen-PDF-and-one-targeted-physical-page-map.json')
entry = put('neutral-one-cat-correction-native-targeted-followup-author.entry.json', {
    'schemaVersion': 1,
    'role': 'Neutral technical author input for one genuine targeted image/native D/P/V follow-up in each original independent campaign',
    'targetGoalId': target,
    'original18AuthorFirstSeal': g['originalAuthorFirstSeal'],
    'original18NeutralEntry': g['original18NeutralEntry'],
    'original281OwnAnd26InactiveFilesVerifiedImmutable': True,
    'actualCorrectedPNGManifest': g['actualCorrectedImageManifest'],
    'correctedActualPNG': g['correctedPNG'],
    'fullCurrent476_392Model': rel(D / 'native/full392.actual-one-cat-correction.book-model.json'),
    'sameOriginal18WholeContextPDF': pageMap['actualPDF'],
    'same18TargetPhysicalPage': 6,
    'dedicatedActualTargetedOnePDF': pageMap['dedicatedOnePDF'],
    'dedicatedTargetedOnePhysicalPage': 3,
    'actualNativeOneReviewBundle': rel(D / 'native/one-targeted-followup/bundle'),
    'actualTargetedFollowupA': rel(D / 'native/one-targeted-followup/follow-up-a'),
    'actualTargetedFollowupB': rel(D / 'native/one-targeted-followup/follow-up-b'),
    'actualCampaignReviewPass': 'follow_up',
    'actualNativeBatchSize': 1,
    'operativeFull18TargetedContextInputAndBatches': rel(D / 'checks/actual-operative-full18-versus-helper1-goal-review-context-fingerprints.json'),
    'operativeFull18GoalReviewContextFingerprint': operative['operativeFull18GoalReviewContextFingerprint'],
    'dedicatedHelperOneGoalReviewContextFingerprint': operative['dedicatedHelperOneGoalReviewContextFingerprint'],
    'operativeD1ContextAdoption': 'OPEN: genuine targeted review must bind operative full18 target batch; helper-one fingerprint cannot be silently substituted. Native full18 campaign goalCount18 remains incomplete without every result pair, and no fake other17 runs are supplied.',
    'pageBindingDeltas': rel(D / 'checks/actual-native-one-versus-eighteen-page-context-deltas.technical.json'),
    'actualWhole18PixelPreservation': rel(D / 'checks/one-cat-native-physical-renders-and-seventeen-body-preservation.actual.json'),
    'actualTwoBrowserWidths': rel(D / f'width-captures/{target}/chromium-captures.actual.json'),
    'actualCurrentPNG_P18Binding': rel(D / 'positive/P18.only-one-current-PNG-rebound.seventeen-lines-exact.jsonl'),
    'P18FutureActiveConfig': rel(D / 'positive/P18.only-one-cat-current-raster.future-active.config.json'),
    'currentPNGNativeP18ClosedSchemaAndSemanticsErrors': 0,
    'ordinaryCurrentCorrectedPNG_PCLI': 'Pending installation after genuine independent targeted follow-ups',
    'other17PRecordLinesPNGWholeProfilesAnd36CaseBodiesExact': True,
    'other17WholeSubsetPageFieldsAndBodyPixelsExact': True,
    'other391FullNativeWholePagesAndAllHumanFieldsExact': True,
    'current204StrictWholeBindingsPreserved': True,
    'sourceV3Whole144ContextsAndNeuroGK2HoldUnchanged': True,
    'fullClassAM392MeaningUnchanged': True,
    'reviewerInstructions': 'First preserve your actual original eighteen first judgments and own runs. Then review this actual one corrected PNG, both real widths, genuine native targeted-one page and original same-eighteen physical6 context. Record one truthful follow-up resolving or retaining your own findings. Other seventeen valid whole pages, profiles, cases, sources and images remain exact and are not re-reviewed. The one-model pagination/external-link changes are technical native subset context; the original eighteen-model page remains the operative integration binding. Technical materialization, generation or resource fingerprint updates are not a scientific or visual approval. No new blind-first judgments, fabricated peer runs, human approvals or strict completions are claimed.',
    'independentTargetedReviewResultsPending': 2,
    'newScientificOrVisualVerdicts': 0,
    'fakeReviewerRunsOrResolutionPlaceholders': 0,
    'activeWrites': 0, 'strictGainClaimed': 0,
    'humanApproval': False, 'humanTrial': False,
})
put('TECHNICAL-AUTHOR-READINESS.md', '''# Biologie: gezielter Katzenpfoten-Follow-up

Root korrigierte den tatsächlich befundeten Anatomiefehler in einem bestehenden Evolutionsbild: vier volle Hauptfingerstrahlen plus seitliche Afterkralle statt drei sichtbarer Hauptstrahlen. Das tatsächliche PNG und die ursprüngliche Generierungsgeschichte sind gebunden; Erzeugung ist keine Freigabe.

Aktuelle Basis sind unverändert 476 kanonische Ziele und 392 curricularAtomic. Die 204 vorhandenen strengen Abschlüsse bleiben gebunden. Andere 391 vollständige native Seiten, alle Humanfelder, Quellen-, Klassen- und Memoryentscheidungen bleiben exakt. Im bisherigen 18er-Reviewpaket bleiben 17 Ganzseiten inklusive pageFingerprint, PNGs und P-JSONL-Zeilen exakt. Alle 18 ganzen Profile und 36 bilingualen Fallkörper bleiben gleich.

Das aktualisierte vollständige 18er-PDF bewahrt den originalen Kontext. Die tatsächlichen gerenderten 17 anderen Inhaltsseiten sind pixelgleich; nur der Buch-Digest im Fußbereich ändert sich. Das unveränderte native Export-API verlangt für einen gefilterten Einzielinput ein echtes dediziertes Einzielmodell, HTML und PDF. Diese sind zusätzlich erstellt. Nur Paginierung, Reihenfolge und die Darstellung zweier Nachfolgerlinks als kanonische externe Links ändern sich technisch; kombinierte Relationen, Lernzieltext, Bild, Breadcrumbs, Geltung und Quellen bleiben gleich. Die ursprüngliche 18er-Seitenbindung bleibt für die spätere Integration maßgeblich.

Zwei native batchSize1-Kampagnen sind wahrheitsgemäß follow_up in den ursprünglichen A/B-Unabhängigkeitsgruppen. Zusätzlich stehen zwei echte Standardkampagnen mit vollständigem operativem 18er-Input und batchSize1 bereit: nur Zielbatch4 ist betroffen, die Kampagnen haben korrekt goalCount18. Beide tatsächlichen per-goal-Kontextfingerprints sind verschieden. Ein Einziel-Helferrecord darf deshalb nicht als operatives Vollseiten-D1 ausgegeben werden. Die normale Whole-Campaign-Results-Prüfung verlangt alle Resultatpaare; diese Kampagnen bleiben ohne 17 nicht erforderliche neue Fachreviews unvollständig. Root muss die gezielte genuine D1-Kontextadoption nach echter Bildprüfung lösen oder offen halten. Keine falschen Runs oder Schemaausnahmen werden erzeugt.

Es gibt keine Resultate, Runs, Resolutionen oder Freigaben aus diesem Autorenpaket. Die tatsächliche geschlossene Raster-P18-API besteht mit genau einer aktuellen Bildbindung und 17 bytegenau erhaltenen Zeilen. Die gewöhnliche operative korrigierte PNG-CLI bleibt bis zur Installation nach unabhängigen Follow-ups offen. Zwei echte Chromiumansichten mit 360/680 Pixeln, das ganze Einziel-PDF und der tatsächliche vollständige 18er-Kontext stehen bereit.

Historischer erster Autorstand bleibt unverändert. Nächster Schritt sind die eigenen gezielten A/B-Follow-ups nach den ursprünglichen Firsts, danach Rootintegration und tatsächlicher zentraler Abschlussbericht. Technische Bindungsprüfung ist kein neuer Fachreview und keine menschliche Prüfung oder Erprobung.
''')
nonoperative = []
for p in sorted(D.rglob('*')):
    if not p.is_file():
        continue
    if p.suffix == '.json':
        json.loads(p.read_text())
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            json.loads(line)
    ignored = subprocess.run(['git', 'check-ignore', '--no-index', rel(p)], capture_output=True, text=True)
    assert ignored.returncode in [0, 1]
    if ignored.returncode == 0:
        assert p in [D / 'native' / name / file for name in ['eighteen-same-context', 'one-targeted-followup'] for file in ['book.pdf', 'book.html']]
        nonoperative.append({'path': rel(p), 'role': 'Historical raw renderer sourcePath metadata; exact nonignored standard bundle copy is the operative portable input'})
    else:
        bind(p)
for path in list(REQ):
    if subprocess.run(['git', 'check-ignore', '--no-index', path], capture_output=True, text=True).returncode == 0:
        assert path in {v['path'] for v in nonoperative}, path
        del REQ[path]
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], input='\n'.join(REQ) + '\n', capture_output=True, text=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
links = []
for path in list(REQ):
    p = R / path
    if p.is_symlink():
        targetPath = os.readlink(p)
        assert not os.path.isabs(targetPath)
        resolved = p.resolve(strict=True)
        assert resolved.is_relative_to(R) and rel(resolved) in REQ
        links.append({'path': path, 'containedRelativeTarget': targetPath, 'target': bind(resolved), 'broken': False})
assert len([v for v in links if v['path'].startswith(rel(D))]) == 18
portable = put('checks/first-author-followup-required-portability-and-immutable-first-history.actual.json', {
    'checkedAt': datetime.now(timezone.utc).isoformat(),
    'requiredFiles': list(REQ.values()), 'actualContainedRelativeAliases': links,
    'ignoredRequiredFiles': [], 'brokenRequiredSymlinks': 0,
    'actualGitCheckIgnoreExit': ignored.returncode,
    'allOwnJSONJSONLParse': True, 'historicalIgnoredRawRendererMetadata': nonoperative,
    'original281OwnAnd26InactiveAuthorFilesVerifiedImmutable': True,
    'nativeFull476_392And18SameContextAndDedicated1APIsActual0': True,
    'onlyTargetedOneRasterPBindingChanged': True,
    'independentTargetedReviewsPending': 2,
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False,
})
seal = put('one-cat-current392-targeted-native-author.first-followup-input.freeze.json', {
    'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
    'kind': 'Immutable neutral technical author follow-up input for one actual anatomy correction; independent current targeted judgments pending',
    'ownFiles': [bind(p) for p in sorted(D.rglob('*')) if p.is_file() and rel(p) not in {v['path'] for v in nonoperative}],
    'requiredPortableInputs': portable, 'neutralEntry': entry,
    'originalEighteenFirstAuthorSeal': g['originalAuthorFirstSeal'],
    'actualRootOneImageCorrectionManifest': g['actualCorrectedImageManifest'],
    'genuineNativeDedicatedOneGoalPDFAndTwoWidthCaptures': True,
    'fullSame18ContextPDFAndOther17BodyPixelProof': True,
    'other17WholePagesPRecordLinesPNGsAndAll18CasesExact': True,
    'nativeCampaignsReviewPassFollowupBatch1': True,
    'actualNativeRasterP18ClosedSchemaSemanticsErrors': 0,
    'ordinaryCorrectedPNG_PCLI': 'pending installation after independent targeted follow-ups',
    'newScientificOrVisualApproval': False,
    'reviewerResultsOrRunsOrResolutionPlaceholders': 0,
    'activeWrites': 0, 'strictGainClaimed': 0,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'neutralEntry': entry, 'firstAuthorFollowupSeal': seal, 'requiredPortableFiles': len(REQ), 'ignoredRequired': 0, 'brokenAliases': 0, 'actualNativeFull18ContextPlusDedicatedOneAndTwoWidths': True, 'actualNativeP18API0': True, 'activeWrites': 0, 'strictGainClaimed': 0}))
