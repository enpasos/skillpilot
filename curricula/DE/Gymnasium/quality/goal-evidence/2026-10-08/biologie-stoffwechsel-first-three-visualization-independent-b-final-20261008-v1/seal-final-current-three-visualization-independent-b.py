from pathlib import Path
import datetime
import hashlib
import json
import subprocess
from PIL import Image

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
OUT = BASE / 'biologie-stoffwechsel-first-three-visualization-independent-b-final-20261008-v1'
AUTHOR = BASE / 'biologie-stoffwechsel-first-three-images-author-20261008-v1'
SOURCE_AUTHOR = BASE / 'biologie-stoffwechsel-first-three-regional-source-remediation-author-20261008-v1'
SOURCE_B = BASE / 'biologie-stoffwechsel-first-three-source-roles-independent-b-20261008-v1'
PRIOR_V1 = BASE / 'biologie-stoffwechsel-first-photosynthesis-visualization-independent-b-20261008-v1'
G1 = '32f47903-0788-5c27-ac88-7464f481f2f7'
G2 = '135447a0-5d55-564a-afc3-3e3fbed77819'
G3 = 'ec782ce3-475e-5628-b3fe-947d72e74a74'


def receipt(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def load(path):
    return json.loads(Path(path).read_text())


def write(name, data):
    path = OUT / name
    with path.open('x') as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write('\n')
    return path


now = datetime.datetime.now(datetime.timezone.utc).isoformat()
entry_path = AUTHOR / 'three-images.current-author.neutral.entry.json'
entry = load(entry_path)
frozen = load(OUT / 'final-three-visualization-b.first-input.freeze.json')
for item in frozen['inputs']:
    assert receipt(item['path']) == item, item['path']
author_freeze = load(AUTHOR / 'three-images.current-author.first-binding.freeze.json')
author_checks = [author_freeze['entry'], author_freeze['technicalCheck'], *author_freeze['files']]
for item in author_checks:
    assert receipt(item['path']) == item, item['path']
prior_seal = load(PRIOR_V1 / 'part-01-visualization-b.first-verdict.seal.json')
for item in prior_seal['outputs']:
    assert receipt(item['path']) == item, item['path']
prior = load(PRIOR_V1 / 'part-01-actual-visualization.independent-b.first-verdict.json')
assert prior['decision'] == 'KEEP'
assert prior['imageInput'] == receipt(entry['images'][0]['path'])

baseline = load(entry['wholeCurrentGoalBaseline']['path'])
whole_goals = {row['goalId']: row['wholeCurrentGoal'] for row in baseline['goals']}
canonical_path = Path(baseline['canonicalPath'])
current_goals = {goal['id']: goal for goal in load(canonical_path)['goals'] if goal['id'] in whole_goals}
assert whole_goals == current_goals
profiles_path = SOURCE_AUTHOR / 'science/whole-three-P-profiles.exact-KEEP.json'
cases_path = SOURCE_AUTHOR / 'science/whole-six-DEEN-cases-and-fresh-transfers.exact-KEEP.json'
profiles = load(profiles_path)['goals']
cases = load(cases_path)['cases']
assert len(profiles) == 3 and len(cases) == 6
assert all(case['wholeCurrentGoal'] == current_goals[case['goalId']] for case in cases)
assert all(case['evidence']['status'] == 'ai_candidate' and case['evidence']['humanReviewStatus'] == 'needs_human_review' and not case['evidence']['performedExperiment'] and not case['freshTransfer']['performed'] for case in cases)
assert all(profile['evidenceLevel'] == 'E1' and profile['maximumClaimScope'] == 'G1' for profile in profiles)
whole_snapshot = write('whole-current-three-goals-three-profiles-six-DEEN-cases.exact-retained.snapshot.json', {
    'schemaVersion': 1, 'firstReadAt': now,
    'originalCanonicalReadReceipt': receipt(canonical_path), 'wholeCurrentGoals': list(current_goals.values()),
    'unchangedWholeProfilesInput': receipt(profiles_path), 'unchangedWholeSixCasesInput': receipt(cases_path),
    'wholeThreeProfiles': profiles, 'wholeSixDEENCases': cases,
    'status': 'Exact whole objects retained; new actual PNG visualization review is separate.'
})

technical = []
for item in entry['images']:
    asset = Path(item['path'])
    assert receipt(asset)['sha256'] == item['sha256'] and receipt(asset)['bytes'] == item['bytes']
    provenance = load(item['provenancePath'])
    original_provider = Path(provenance['originalOutputLocation'])
    assert original_provider.exists() and original_provider.read_bytes() == asset.read_bytes()
    with Image.open(asset) as original:
        original.load()
        assert original.size == (1672, 941) and original.format == 'PNG'
        previews = []
        for width in (360, 680):
            p = asset.with_name(asset.stem + f'.width-{width}.preview.png')
            with Image.open(p) as preview:
                preview.load()
                expected_size = (width, round(original.height * width / original.width))
                assert preview.size == expected_size
                assert preview.tobytes() == original.resize(expected_size, Image.Resampling.LANCZOS).tobytes()
                previews.append({**receipt(p), 'width': preview.width, 'height': preview.height,
                                 'pixelExactLANCZOSDerivative': True,
                                 'actuallyViewedOriginalDetail': item['goalId'] != G1,
                                 'earlierOwnSealedViewRetained': item['goalId'] == G1})
        technical.append({'goalId': item['goalId'], 'actualPNG': receipt(asset),
                          'dimensions': {'width': original.width, 'height': original.height},
                          'format': original.format, 'mode': original.mode,
                          'providerOriginalExactPortableCopy': True,
                          'actuallyViewedOriginalDetail': item['goalId'] != G1,
                          'earlierOwnSealedViewRetained': item['goalId'] == G1,
                          'actualPreviews': previews})

primary_notes = write('LHC-pigment-direction-primary-research.targeted-independent-b.reading-notes.json', {
    'schemaVersion': 1, 'readAt': now,
    'method': 'Actual official publisher research articles retrieved and relevant abstracts/introduction plus reported energy-transfer mechanisms read using web tool; no peer visualization verdict used.',
    'sources': [
        {'title': 'Coherence in carotenoid-to-chlorophyll energy transfer',
         'authors': 'Meneghin et al.', 'year': 2018,
         'doi': '10.1038/s41467-018-05596-5',
         'url': 'https://www.nature.com/articles/s41467-018-05596-5',
         'relevantOriginalSection': 'Abstract and Introduction, pigment absorption regions and donor/acceptor assignments (publisher returned lines49-50,71-84).',
         'paraphrase': 'Measurements and calculations for a peridinin/chlorophyll antenna identify productive excitation transfer from carotenoid donor states to chlorophyll acceptor states. The carotenoid collects shorter-wavelength light that complements chlorophyll absorption. This supports accessory-to-chlorophyll collection, rather than a universal alternating chlorophyll/carotenoid relay.'},
        {'title': 'Observation of dissipative chlorophyll-to-carotenoid energy transfer in light-harvesting complex II in membrane nanodiscs',
         'authors': 'Son et al.', 'year': 2020,
         'doi': '10.1038/s41467-020-15074-6',
         'url': 'https://www.nature.com/articles/s41467-020-15074-6',
         'relevantOriginalSection': 'Abstract and Introduction, dissipative transfer from chlorophyll to carotenoid and photoprotection.',
         'paraphrase': 'The experiment concerns chlorophyll-to-carotenoid energy transfer as a dissipative photoprotection pathway under strong light. Energy reaching a short-lived carotenoid state is distinguished from productive capture leading to reaction-center photochemistry. This does not make every chlorophyll-to-carotenoid transfer impossible; it makes its unlabelled use as the ordinary productive funnel misleading.'}
    ],
    'inferenceClearlySeparated': 'The actual candidate has orange accessory-pigment nodes on green-to-orange-to-reaction-center yellow pathways. The metadata/P context assigns green to chlorophyll and orange to accessory/carotenoid functions. Inferring a productive mixed relay from these ordinary directed arrows is the specific learner-facing ambiguity held here; the papers do not themselves adjudicate this illustration.',
    'scope': 'Targeted raster scientific ambiguity only; no new whole scientific/P judgment or mandatory curriculum claim.'
})

verification = write('final-current-three-PNG-author-freeze-current-goal-profile.actual-independent-b.check.json', {
    'schemaVersion': 1, 'checkedAt': now, 'authorReceiptChecks': len(author_checks),
    'ownFrozenInputChecks': len(frozen['inputs']), 'authorHashFailures': [], 'ownHashFailures': [],
    'wholeCurrentThreeGoalBodiesExact': True, 'wholeThreeProfilesSixDEENCasesExactRetained': True,
    'actualImages': technical,
    'priorBio1OwnSeal': receipt(PRIOR_V1 / 'part-01-visualization-b.first-verdict.seal.json'),
    'priorBio1OutputsUnchanged': True,
    'ownSourceSeal': receipt(SOURCE_B / 'three-source-roles-b.first-verdict.seal.json'),
    'activeWrites': 0
})

finding = {
    'id': 'BIO-V-B-03-V2-PRODUCTIVE-CHL-ACCESSORY-RELAY-AMBIGUITY',
    'goalId': G3, 'severity': 'blocking_for_this_raster',
    'assetSha256': '2969924b650fc2fb9d40233821af3f733e8c1d906762e68e8c75886cae51b2a5',
    'actualOriginalLocations': [
        {'approximateBoundsPx': {'left': 680, 'top': 405, 'right': 1130, 'bottom': 555},
         'observed': 'Yellow arrow from central green pigment into orange pigment immediately before the reaction center, followed by a yellow arrow from that orange pigment to the reaction center.'},
        {'approximateBoundsPx': {'left': 215, 'top': 410, 'right': 625, 'bottom': 560},
         'observed': 'Lower branch also shows green pigment feeding an orange pigment before merging toward the center.'}
    ],
    'evidence': 'The candidate reconstruction prompt says colors convey chlorophyll/accessory functions; the complete P3 material explicitly uses chlorophyll and carotenoid pigments. Alttext names green chlorophyll and orange accessory symbols. Thus these colors are not simply untyped network nodes. The ordinary directed yellow route can teach a productive chlorophyll-to-carotenoid-to-RC relay without separating energy dissipation.',
    'scientificDistinction': 'Carotenoid-to-chlorophyll transfer supplements light harvesting; chlorophyll-to-carotenoid pathways can instead dissipate excitation for protection. The review does not claim all reverse transfer is physically impossible. The issue is drawing it as the unqualified productive route for this explanatory diagram.',
    'primaryEvidencePath': primary_notes.as_posix(),
    'preserveGoodContent': ['Protein-bound antenna pigments', 'Red excitation of green chlorophyll symbol', 'Blue excitation of orange accessory symbol', 'Yellow excitation transfer distinct from blue electron transfer', 'Positive reaction-center/negative acceptor charge separation', 'No ATP production directly by antenna'],
    'minimalSafeCorrection': 'Make the productive route unambiguous: retain the blue-illuminated orange accessory donor feeding a green chlorophyll route, and remove green-to-orange hops on the ordinary productive funnel. For example recolor only the two unilluminated orange relay nodes green while preserving the actual light-input assignment, arrows, RC, layout and text. Update reconstruction prompt/alttext if necessary. A new actual PNG/version requires a separate bound review; this is not pre-approval.',
    'humanApproval': False
}
image_rows = [
    {'goalId': G1, 'ordinal': 1, 'version': 'v1', 'decision': 'KEEP_RETAINED',
     'actualPNG': receipt(entry['images'][0]['path']),
     'ownPriorReviewPath': (PRIOR_V1 / 'part-01-actual-visualization.independent-b.first-verdict.json').as_posix(),
     'ownPriorFirstSealPath': (PRIOR_V1 / 'part-01-visualization-b.first-verdict.seal.json').as_posix(),
     'reviewCountClaim': 'Exact prior own raster judgment retained, not a new review.'},
    {'goalId': G2, 'ordinal': 2, 'version': 'v2', 'decision': 'KEEP',
     'actualPNG': receipt(entry['images'][1]['path']),
     'actualScienceAndRepresentationObservations': [
         'Three groups correctly locate glycolysis in cytosol, citric acid cycle in matrix, and chain at folded inner mitochondrial membrane.',
         'The green carbon route connects glucose/pyruvate, the pyruvate-to-acetyl-CoA bridge and citric cycle. Blue NADH and NADH/FADH2 routes separately feed the chain, rather than showing glucose as a direct chain substrate.',
         'O2 enters the chain and H2O leaves. CO2 leaves the matrix cycle; no drawn arrow derives CO2 from O2.',
         'ATP at glycolysis/cycle and larger ATP downstream of the chain are a qualitative overview without fixed numerical yield. The omitted oxidative-decarboxylation CO2/NADH and explicit ATP-synthase/proton mechanism remain in the complete unchanged P2 cases; the diagram does not assert these omitted products/processes are absent.',
         'Glucose and pyruvate are now single abstract ovals, with no pseudo atom count, chain, ring or structure-formula claim. This is a valid process schematic and cutaway perspective, not molecular/anatomical scale evidence.'
     ],
     'actualReadability': {'original': 'All main and supporting labels clear.', 'width680': 'Three process names, compartment labels, arrows and carrier routes readable.', 'width360': 'Three numbered groups and carbon/energy paths recognizable; small bridge/carrier/subscript/compartment detail requires enlargement for comfortable reading.'},
     'metadataAndAlttextDecision': 'KEEP: directions, compartments, broad ATP production and abstract non-structural nodes described accurately. No unexposed provider model inferred.',
     'blockingFindings': []},
    {'goalId': G3, 'ordinal': 3, 'version': 'v2', 'decision': 'HOLD',
     'actualPNG': receipt(entry['images'][2]['path']),
     'actualScienceAndRepresentationObservations': [
         'Protein-bound pigment antenna is visually distinct from the reaction center, correctly labelled Pigmente + Proteine.',
         'Yellow excitation-energy arrows remain distinct from the only blue e- arrow leaving the reaction center to the negative acceptor; reaction center remains positive after electron transfer. No ATP is drawn as a direct antenna product.',
         'Red light now reaches a green pigment and blue light an orange pigment; the obvious v1 light-input color mismatch is corrected in this actual v2.',
         'A remaining green-to-orange-to-RC productive-relay ambiguity is concrete in the original and both previews. Its scientific/inference boundary is documented in the independent finding.'
     ],
     'actualReadability': {'original': 'Antenna/protein pigments, excitation arrows, RC, electron arrow and charge signs clear.', 'width680': 'Main labels, pigment-color routes and separate electron arrow readable.', 'width360': 'Antenna versus RC, yellow energy route and blue electron-transfer route recognizable; subordinate text needs enlargement. The held route remains visually present at this width.'},
     'metadataAndAlttextDecision': 'Main location, energy/electron distinction and charge signs accurate. Pigment-role colors need to agree with an unambiguous productive path after correction.',
     'blockingFindings': [finding]}
]
verdict = write('final-current-three-actual-visualization.independent-b.first-verdict.json', {
    'schemaVersion': 1, 'reviewedAt': now, 'reviewer': 'independent-b',
    'scope': 'Two new actual corrected v2 rasters and own retained Bio1v1; whole current 3 goals/full3 profiles/full6 DEEN cases retained.',
    'images': image_rows, 'currentKEEPCount': 2, 'currentHOLDCount': 1,
    'newActualRasterReviews': 2, 'retainedActualRasterReviews': 1,
    'nativeBlockingFindings': [finding],
    'wholeInputSnapshotPath': whole_snapshot.as_posix(), 'technicalCheckPath': verification.as_posix(),
    'peerCurrentVisualAReadBeforeFirstSeal': False,
    'retainedSciencePAMNotNewReviews': True,
    'sourceConstraintsRetained': ['four-original-operator-HOLDs', 'BIO123-B-OPERATIVE-PROJECTION-UNCHANGED'],
    'sourceWholeCoverageApprovalClaimed': False, 'nativeDPReviewSupplied': False,
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'status': 'ai_candidate', 'humanReviewStatus': 'needs_human_review',
    'humanApproval': False, 'humanTrial': False, 'performedExperiment': False,
    'activeWrites': 0, 'strictGainClaimed': 0
})
supplemental = write('final-three-visualization-b.supplemental-input.freeze.json', {
    'schemaVersion': 1, 'createdAt': now,
    'inputs': [receipt(whole_snapshot), receipt(primary_notes)],
    'primaryURLs': [source['url'] for source in load(primary_notes)['sources']],
    'peerCurrentVisualAReadBeforeFirstSeal': False,
    'note': 'Portable whole-input snapshot and own targeted primary-research reading notes; no current peer verdict read.'
})
handoff = write('neutral-final-current-three-visualization-independent-b.handoff.entry.json', {
    'schemaVersion': 1, 'reviewer': 'independent-b',
    'firstSealPath': (OUT / 'final-three-visualization-b.first-verdict.seal.json').as_posix(),
    'resultsDirectory': OUT.as_posix(), 'visualizationReviewPath': verdict.as_posix(),
    'peerVisualReadBeforeFirstSeal': False,
    'imageDecisions': [{'goalId': row['goalId'], 'version': row['version'], 'decision': row['decision'], 'sha256': row['actualPNG']['sha256']} for row in image_rows],
    'nativeBlockingFindings': [finding], 'reviewRunIds': [], 'nativeDPReviewSupplied': False,
    'sourceWholeCoverageApprovalClaimed': False,
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'status': 'ai_candidate', 'humanReviewStatus': 'needs_human_review',
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False
})
readme = OUT / 'README.md'
with readme.open('x') as handle:
    handle.write('# Current Bio1/2/3 visualization B\n\nBio1v1 exact prior own KEEP retained. Bio2v2 actual original/360/680 independently reviewed KEEP. Bio3v2 actual original/360/680 independently reviewed HOLD for a concrete unqualified productive chlorophyll-to-accessory-pigment relay; the good antenna/RC/energy/electron distinctions remain. Targeted original research and a minimal correction are in the actual first verdict. No current peer V-A judgment was read before this seal.\n\nFull current3 goals / full3 retained profiles / full6 retained DEEN cases are bound. The original source operator and ordinary projection holds remain separate. No native D/P, new whole Science/P/A/M, performed experiments, Human acceptance, strict closure or active integration is claimed.\n')

eligible = {item['path'] for item in frozen['inputs']} | {item['path'] for item in author_checks}
eligible.update(path.as_posix() for path in OUT.rglob('*') if path.is_file())
check = subprocess.run(['git', 'check-ignore', '--stdin'], input=''.join(path + '\n' for path in sorted(eligible)), text=True, capture_output=True)
assert check.returncode in (0, 1), check.stderr
assert not check.stdout.strip(), check.stdout
portability = write('final-three-normal-index-aware-portability.actual-independent-b.check.json', {
    'schemaVersion': 1, 'eligiblePortableArtifacts': len(eligible),
    'method': 'normal git check-ignore --stdin without --no-index; existing index membership respected',
    'ignoredPortableArtifacts': [], 'missingPortableArtifacts': [path for path in sorted(eligible) if not Path(path).is_file()],
    'localProviderOriginalNotRequiredForPortableReview': True,
    'portableExactPNGsAndPrompts': True, 'durablePrimaryURLsAndPortableOwnReadingNotes': True
})
assert not load(portability)['missingPortableArtifacts']
for item in frozen['inputs']:
    assert receipt(item['path']) == item, item['path']
for item in author_checks:
    assert receipt(item['path']) == item, item['path']
for item in prior_seal['outputs']:
    assert receipt(item['path']) == item, item['path']
assert {goal['id']: goal for goal in load(canonical_path)['goals'] if goal['id'] in current_goals} == current_goals
outputs = [receipt(path) for path in sorted(OUT.rglob('*')) if path.is_file()]
seal_path = write('final-three-visualization-b.first-verdict.seal.json', {
    'schemaVersion': 1, 'firstSealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer': 'independent-b', 'immutableFirstVerdict': True,
    'firstInputFreeze': receipt(OUT / 'final-three-visualization-b.first-input.freeze.json'),
    'supplementalInputFreeze': receipt(supplemental), 'outputs': outputs,
    'authorReceiptChecks': len(author_checks), 'ownFrozenInputChecks': len(frozen['inputs']),
    'hashFailures': [], 'currentKEEPCount': 2, 'currentHOLDCount': 1,
    'peerCurrentVisualAReadBeforeFirstSeal': False,
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False
})
for item in load(seal_path)['outputs']:
    assert receipt(item['path']) == item, item['path']
print(json.dumps({'firstSeal': receipt(seal_path), 'outputs': len(outputs), 'authorReceiptChecks': len(author_checks), 'ownFrozenInputs': len(frozen['inputs']), 'KEEP': 2, 'HOLD': 1, 'hashFailures': []}, ensure_ascii=False))
