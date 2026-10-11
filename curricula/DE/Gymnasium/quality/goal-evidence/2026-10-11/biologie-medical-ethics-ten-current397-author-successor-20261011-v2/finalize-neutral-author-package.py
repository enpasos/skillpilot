# SPDX-License-Identifier: Apache-2.0
"""Seal raw Medical10 author inputs without creating a reviewer vote."""
from pathlib import Path
import datetime, hashlib, importlib.util, json, subprocess

R = Path.cwd()
P = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-medical-ethics-ten-current397-author-successor-20261011-v2')
B = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-combined-Bio3-targeted-author-successor-20261011-v6')
PB = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-v6-genuine-independent-b-20261011-v1')
C = R / 'tmp/medical10-current397-v2-normal-private-capsule'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p):
    return json.loads((R / p).read_text())

def put(name, data):
    f = R / P / name
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def ref(p):
    p = Path(p)
    raw = (R / p).read_bytes()
    return {'path': str(p), 'bytes': len(raw), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest()}

first = read(P / 'FIRST.actual-neutral-medical10-continuation-author-inputs.json')
ids = first['goalIds']
land = read(P / 'candidate/whole484-current397-medical10.author.inactive.json')
base_land = read(B / 'candidate/whole484-current369-Bio3-combined.author.inactive.json')
goals = {g['id']: g for g in land['goals']}
base_goals = {g['id']: g for g in base_land['goals']}
assert len(goals) == 484 and set(goals) == set(base_goals)
assert all(goals[i] == base_goals[i] for i in goals if i not in ids)
normal = read(P / 'native/whole397-medical10.normal-model.actual.json')
pages = {g['goalId']: g for g in normal['pages']}
delta = read(P / 'checks/current397-whole-normal-page-deltas.actual.json')
union = delta['affectedNativeUnion']
assert len(union) == 11 and len(set(union) - set(ids)) == 1
assert set(union) - set(ids) == {'440854be-7f06-5678-91cb-ba8dcab56959'}

# Preserve all existing profile products verbatim. New normal records carry only E1/G1 candidates.
baseline = read(B / 'inputs/whole-current397-machine-profile-products.neutral.json')
records = list(baseline['records'])
assert len(records) == 379 and not set(ids) & {r['goalId'] for r in records}
rows = [json.loads(s) for s in (R / P / 'positive/P10-medical.author-pending.review.jsonl').read_text().splitlines()]
assert len(rows) == 10 and {r['goalId'] for r in rows} == set(ids)
for r in rows:
    assert (r['status'], r['reviewAuthority'], r['evidenceLevel'], r['maximumClaimScope']) == ('needs_human_review', 'ai_candidate', 'E1', 'G1')
    records.append({
        'goalId': r['goalId'], 'goalFingerprint': r['goalFingerprint'],
        'profileFingerprint': r['profileFingerprint'], 'reviewInputFingerprint': r['reviewInputFingerprint'],
        'wholeCurrentProfile': r['profile'], 'operativeRecordPath': str(P / 'positive/P10-medical.author-pending.review.jsonl'),
        'status': r['status'], 'reviewAuthority': r['reviewAuthority'],
        'evidenceLevel': r['evidenceLevel'], 'maximumClaimScope': r['maximumClaimScope'],
    })
assert records[:379] == baseline['records']
put('inputs/whole-current397-machine-profile-products389.neutral.json', {
    'purpose': 'Raw current397 profile products; presence and binding do not assert D/P/A/M/V completion.',
    'records': records, 'currentProfileProductCount': 389,
    'existing379RecordsRetainedExactly': True,
    'noProfileMaterialFoundForGoalIds': [i for i in baseline['noProfileMaterialFoundForGoalIds'] if i not in ids],
    'newProfileBodiesAuthored': 10, 'newBilingualCandidateCases': 20,
    'newScienceApproval': False, 'independentReviews': 0,
})

# Bind every complete mapping / extraction pair instead of replacing source review with a hash update.
pairs = read(B / 'sources/whole31-currentRoot-Bio3-plus-Bio8.author-pairs-and-deltas.json')['wholePairs']
assert len(pairs) == 31
whole_pairs = []
for item in pairs:
    m, e = item['candidateMapping'], item['candidateExtraction']
    assert ref(m['path']) == m and ref(e['path']) == e
    whole_pairs.append({'ordinal': item['ordinal'], 'wholeMapping': m, 'wholeExtraction': e,
                        'changedFromBio8v6': False})
put('sources/whole31-exact-source-carriers-and62-bindings.neutral.json', {
    'role': 'Full source-pair bindings retained from Bio8v6; no new source approval',
    'wholePairs': whole_pairs, 'fullFileBindings': 62, 'sourceUnionApproval': False,
})

# Full UUID neighbours and displayed reverse context, including untouched predecessor products.
context = read(P / 'inputs/current397-medical10-and-actual-affected-union.whole-source-context.neutral.json')
all_ids = set(union)
for i in union:
    all_ids.update(goals[i].get('requires', []))
    all_ids.update(j for j, g in goals.items() if i in g.get('requires', []))
product_by_id = {r['goalId']: r for r in records}
put('inputs/whole11-prerequisite-and-reverse-UUID-unions.neutral.json', {
    'role': 'Complete current canonical UUID neighbours and actual normal page context; no review vote',
    'nativeUnionIds': union, 'wholeNeighbourGoalCount': len(all_ids),
    'wholeCanonicalNeighbours': [goals[i] for i in sorted(all_ids)],
    'wholeCurrentPagesWhenPublished': [pages[i] for i in sorted(all_ids) if i in pages],
    'wholeProfileProductsWhenPresent': [product_by_id[i] for i in sorted(all_ids) if i in product_by_id],
    'actualWholeSourceContext': ref(P / 'inputs/current397-medical10-and-actual-affected-union.whole-source-context.neutral.json'),
    'extraProtectedPage': '440854be-7f06-5678-91cb-ba8dcab56959',
    'extraProtectedPageChangedFields': ['reverseRequires'],
    'extraProtectedGoalAndProfileUnmodified': True,
})

science = [
    ('NCI-cancer', 'https://www.cancer.gov/about-cancer/understanding/what-is-cancer'),
    ('NHGRI-genetic-testing', 'https://www.genome.gov/FAQ/Genetic-Testing'),
    ('NHGRI-prenatal-testing', 'https://www.genome.gov/dna-day/15-ways/noninvasive-prenatal-genetic-testing'),
    ('NHGRI-gene-therapy', 'https://www.genome.gov/genetics-glossary/Gene-Therapy'),
    ('HFEA-PGT-M-SR', 'https://www.hfea.gov.uk/treatments/embryo-testing-and-treatments-for-disease/pre-implantation-genetic-testing-for-monogenic-disorders-pgt-m-and-pre-implantation-genetic-testing-for-chromosomal-structural-rearrangements-pgt-sr'),
]
science_rows = []
for key, url in science:
    f = P / 'primary/scientific-background' / (key + '.whole-current.html.snapshot')
    assert (R / f).is_file()
    science_rows.append({'authority': key, 'officialURL': url, 'actualFullHTMLSnapshot': ref(f),
                         'retrieval': 'successful HTTP response; full raw bytes preserved',
                         'usage': 'Scientific background, not a curricular operator or human approval'})
for key, url in [
    ('NIH-stemcells', 'https://stemcells.nih.gov/info/basics/stc-basics'),
    ('FDA-insulin', 'https://www.fda.gov/about-fda/fda-history-exhibits/100-years-insulin'),
]:
    science_rows.append({'authority': key, 'officialURL': url, 'actualFullHTMLSnapshot': None,
                         'localHTTPResult': '403', 'webToolPrimaryReadSucceeded': True,
                         'usage': 'Background read only; no full local snapshot claimed'})
put('primary/scientific-background/actual-primary-bindings.neutral.json', {
    'role': 'Actual full primary captures and explicitly separate web-only background reads',
    'recordedAtUTC': NOW, 'records': science_rows,
    'medicalAdvice': False, 'currentGermanLawApproval': False, 'sourceUnionApproval': False,
})

# The preparatory check validates frozen normal inputs; it creates no review verdict.
cmd = [str(R / 'app/node_modules/.bin/tsx'), str(C / 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),
       'check', '--config', str(P / 'native/current397-medical-native-union.author.batch.config.json')]
r = subprocess.run(cmd, cwd=C, capture_output=True, text=True)
put('checks/normal-D11-prepared-input-check.actual.json', {
    'argv': cmd, 'exitCode': r.returncode, 'stdout': r.stdout, 'stderr': r.stderr,
    'normalPages': 11, 'independentReviewVotesCreated': 0, 'activeWrites': False,
})
assert r.returncode == 0, r.stderr

# Author judgments stay separate from the neutral entry used by independent reviewers.
am_reasons = {
    ids[0]: 'One diagnostic-method family: explain which question a method can answer and the result boundary; comparison does not add an unrelated competency.',
    ids[1]: 'One regulatory-decision context joins a normative rule with societal participation. Cases use explicitly fictional rules; exact source-operator coverage remains a required independent question.',
    ids[2]: 'One GMO case joins production mechanism and a conditional risk/benefit judgment about that same case; organism, protein product and containment remain distinct.',
    ids[3]: 'One multilevel cancer mechanism connects disrupted growth regulation with distinct metastasis steps; division speed alone never establishes spread.',
    ids[4]: 'One somatic gene-therapy procedure is described and judged using its own mechanism and bounded outcome evidence.',
    ids[5]: 'One PID procedure is explained and evaluated in its specific ethical conflict; testing is distinct from modification.',
    ids[6]: 'One counseling process supports informed, voluntary, nondirective decisions, including the choice not to know.',
    ids[7]: 'One prenatal-testing decision connects method/evidence limits with its ethical implications; screening is not definitive diagnosis.',
    ids[8]: 'One stem-cell use is judged using the specific cell source, differentiation potential, research/clinical evidence and ethical context.',
    ids[9]: 'One human-DNA-analysis context explains medical/societal purpose and assesses the associated consent/privacy/family conflict.',
}
v_reasons = {
    ids[0]: 'Method and resulting information are represented schematically; the shortened title follows the actual explanatory goal.',
    ids[1]: 'A rule/participation scene supplies a conceptual cue without pretending to reproduce a current statute.',
    ids[2]: 'Bacterial production and the protein product remain visually distinct; the diagram is a simplified case cue.',
    ids[3]: 'Growth control and the invasion/transport/colonization route are distinguishable; the vascular route is a schematic, not anatomical scale.',
    ids[4]: 'The cell-focused therapeutic sequence is a procedural cue; an edited/delivered cell is not drawn as proof of clinical success.',
    ids[5]: 'The embryo-testing sequence is used as a method cue, with no claim that testing is gene editing.',
    ids[6]: 'The counseling/choice scene supports an autonomous decision rather than a prescribed result.',
    ids[7]: 'The testing/decision representation is readable as a schematic; it is not individualized medical advice.',
    ids[8]: 'Differentiation is illustrative; a generic/pluripotent example does not imply every adult stem cell has unlimited potential.',
    ids[9]: 'DNA information and the decision/privacy context are distinct; the image does not certify a legal permission or diagnostic certainty.',
}
put('after-FIRST/author-A10-M10-and-V10-KEEP.decisions.json', {
    'role': 'Continuation AUTHOR judgments only; not an independent A/B or machine visualization approval',
    'recordedAtUTC': NOW,
    'actualInspectionCoverage': {
        'originalMedicalPNGsIndividuallyViewed': 10,
        'protectedPedigreeOriginalPNGIndividuallyViewed': 1,
        'QA360and680ViewsSeenThroughContactSheets': 22,
        'completeNativePDFPagesActuallyViewed': [ids[3], ids[8]],
        'completeNativeHTMLPagesActuallyViewed': [],
        'wholeNativeCapturesAvailableForIndependentInspection': {'HTML': 11, 'PDF': 11},
        'captureIsNotInspection': True,
    },
    'records': [
        {'goalId': i, 'semanticAtomicityAuthorDecision': 'KEEP candidate',
         'atomicityReason': am_reasons[i], 'memoryAuthorDecision': 'no-memorization',
         'memoryReason': 'Assess understanding, explanation, evidence interpretation and/or a reasoned contextual judgment. Isolated fact recall cannot replace this performance; no new card set is introduced.',
         'newCards': 0, 'visualAuthorDecision': 'KEEP original candidate',
         'visualReason': v_reasons[i], 'format': {'fileType': 'PNG', 'nativePixels': [1672, 941]},
         'mandatoryFinePrintForMainMotif': False, 'independentApproval': False}
        for i in ids
    ],
    'protectedPedigree': {'goalId': '440854be-7f06-5678-91cb-ba8dcab56959',
                          'decision': 'KEEP exact existing original and P product; only displayed reverse title changed'},
    'newScientificClosuresClaimed': 0, 'sourceUnionApproval': False, 'humanApproval': False,
})
put('after-FIRST/author-scientific-boundaries-and-open-source-question.json', {
    'role': 'AUTHOR explanation, not an independent review or source-union clearance',
    'boundaries': [
        {'goalId': ids[1], 'finding': 'HE Q1.4 has a literal PID-method/ethical-challenges example operator, not a specific legislation/participation procedure. The Q1 introduction supports societal/ethical discourse. The derived regulatory goal and fictional norm cases require targeted independent source/operator assessment; no complete source-union approval is claimed.'},
        {'scope': 'HE Q1', 'finding': 'Q1.1-Q1.3 are mandatory topic fields; Q1.4 and Q1.5 are facultative. An example such as insulin-producing bacteria does not make that one example a universal obligation.'},
        {'scope': 'BY9 and BY12 GA/EA', 'finding': 'Reproductive medicine, stem-cell research/medical applications, genetic counseling and human DNA analysis use their actual explanatory, evaluative and ethical operators. Native witnesses retain GA/EA and stage/duration boundaries.'},
        {'scope': 'All medical teaching cases', 'finding': 'Materials, outcomes, model risks and numerical or normative premises are authored fictional teaching inputs. No individual medical advice, current-law conclusion, actual laboratory execution, clinical effect or learner result is claimed.'},
        {'scope': 'Broad historical source partners', 'finding': 'Whole mapping/extraction pairs and current native source partners are retained; broad historical inheritance/genetics witnesses are not a new source-union full-clearance vote.'},
        {'scope': 'Scientific evidence', 'finding': 'Screening is not confirmation; gene delivery/expression is not treatment success; somatic changes are not germline changes; model differentiation is not a proved clinical outcome; transportation is not proved metastatic colonization.'},
    ],
    'sourceUnionApproval': False, 'independentA': 'pending', 'independentB': 'pending',
})
put('independent-QA-plan.neutral.json', {
    'role': "Independent review routing only; no results or author's verdicts",
    'rawEntry': str(P / 'RAW-FIRST.neutral-current397-medical10-complete-input-manifest.json'),
    'reviewerMustNotHaveAuthoredTheseInputs': True,
    'originalJudgmentBeforePeerVerdicts': True,
    'scope': {'normalD': 11, 'newP': 10, 'wholeCases': 20, 'bilingualFiles': 40,
              'actualOriginalPNGs': 11, 'QA360and680Views': 22, 'actualWholeNativeHTML': 11,
              'actualWholeNativePDF': 11, 'fullSourcePairs': 31},
    'requirements': ['Original independent D11 campaign results with frozen input fingerprints.',
                     'Read whole goal, P cases/materials, context, reverse neighbours and actual source/operator witnesses.',
                     'Inspect actual original raster images and complete current native HTML/PDF pages.',
                     'Resolve source operator/scope findings explicitly; retain the distinction between examples and mandatory content.',
                     'Keep E1/G1 AI candidates needs_human_review and separate machine QA from human release gates.'],
    'activeIntegration': False,
})

# Freeze all meaningful outside inputs explicitly, including every retained P ledger.
external = {}
def add_external(p):
    p = Path(p)
    if str(p).startswith(str(P) + '/'):
        return
    external[str(p)] = ref(p)

for item in whole_pairs:
    add_external(item['wholeMapping']['path']); add_external(item['wholeExtraction']['path'])
for record in baseline['records']:
    add_external(record['operativeRecordPath'])
for record in read(P / 'primary/whole-actual-curricular-primary-bindings.neutral.json')['records']:
    add_external(record['actualWholePrimary']['path'])
for n in ['FINAL.neutral-whole397-current369-Bio3-combined-Bio8-author.join.json',
          'FINAL.author-package.freeze.json', 'RAW-FIRST.neutral-input-manifest.json',
          'candidate/whole484-current369-Bio3-combined.author.inactive.json',
          'candidate/kinds484-current397.author-classification-only.json',
          'inputs/whole-current397-machine-profile-products.neutral.json',
          'native/whole397.currentRoot-Bio3-plus-Bio8.normal-model.actual.json']:
    add_external(B / n)
for script in ['materializePositiveGoalEvidenceCandidates.ts', 'materializeGoalDescriptionRolloutBatch.ts',
               'goalBookModel.ts', 'goalBookSourceAtlasInputs.ts', 'goalBookOriginalSources.ts',
               'goalEvidenceReview.ts', 'goalDescriptionReview.ts', 'goalBookReviewBundle.ts']:
    if (R / 'app/scripts' / script).is_file(): add_external(Path('app/scripts') / script)
for contract in ['docs/landscape-runtime.schema.json', 'AGENTS.md',
                 'docs/concept/skill-graph/atomic-goal-visualizations.md', 'scripts/validate_schemas.py']:
    add_external(contract)
put('inputs/full-external-source-profile-and-normal-contract-bindings.neutral.json', {
    'role': 'Actual full-file input bindings; CAS verification does not replace scientific review',
    'files': [external[k] for k in sorted(external)], 'verifiedFiles': len(external),
    'newReviewVote': False,
})

raw_bindings = {
    'candidateCanonical': 'candidate/whole484-current397-medical10.author.inactive.json',
    'currentSemanticClassification': 'candidate/kinds484-current397.author-classification-only.json',
    'completeNewP10Bodies': 'profiles/ten-complete-positive-candidates.author.json',
    'normalP10AuthorConfig': 'positive/P10-medical.author-pending.config.json',
    'normalP10Records': 'positive/P10-medical.author-pending.review.jsonl',
    'wholeCurrent389ProfileProducts': 'inputs/whole-current397-machine-profile-products389.neutral.json',
    'wholeCases20': 'cases/whole20-complete-bilingual-author-case-inputs.json',
    'whole397NormalModel': 'native/whole397-medical10.normal-model.actual.json',
    'normalD11BatchConfig': 'native/current397-medical-native-union.author.batch.config.json',
    'normalD11BatchManifest': 'native/current397-medical-native-union/batch-manifest.json',
    'normalD11RawReviewInput': 'native/current397-medical-native-union/bundle/review-input.json',
    'normalD11RoundA': 'native/current397-medical-native-union/round-a/description-review-input.json',
    'normalD11RoundB': 'native/current397-medical-native-union/round-b/description-review-input.json',
    'wholeNativePDF': 'native/current397-medical-native-union/bundle/book.pdf',
    'wholeNativeHTML': 'native/current397-medical-native-union/bundle/book.html',
    'portableWholeNativeHTML': 'native/portable-current397-medical-native11/bundle/book.html',
    'actualHTMLCaptures': 'checks/current397-native11-HTML-whole-page-captures.actual.json',
    'actualPDFCaptures': 'checks/current397-native11-PDF-whole-page-captures.actual.json',
    'originalImages10': 'images/ten-original-images.exact-author-input-inventory.json',
    'originalImages11and360680': 'checks/actual-original11-and-360-680-views.neutral.json',
    'exactPortableAssetCopies': 'portable/normal-assets.exact-author-adoption-files.json',
    'whole11SourceContext': 'inputs/current397-medical10-and-actual-affected-union.whole-source-context.neutral.json',
    'whole11ReverseNeighbours': 'inputs/whole11-prerequisite-and-reverse-UUID-unions.neutral.json',
    'whole31SourcePairs': 'sources/whole31-exact-source-carriers-and62-bindings.neutral.json',
    'actualFullCurricularPrimaries': 'primary/whole-actual-curricular-primary-bindings.neutral.json',
    'actualScientificPrimaries': 'primary/scientific-background/actual-primary-bindings.neutral.json',
    'whole397NormalAtlasReceipt': 'sources/normal397-atlas.receipt.whole.actual.json',
    'whole397NormalOriginalSources': 'sources/whole397.normal-original-sources.actual.json',
    'fullExternalBindings': 'inputs/full-external-source-profile-and-normal-contract-bindings.neutral.json',
    'actualWhole397PageDelta': 'checks/current397-whole-normal-page-deltas.actual.json',
}
put('RAW-FIRST.neutral-current397-medical10-complete-input-manifest.json', {
    'schemaVersion': 1,
    'role': 'Complete raw Medical10 author input entry. Read before any author or peer verdict.',
    'createdAtUTC': NOW, 'authorAgent': '/root/bio8_v6_genuine_independent_b',
    'authorIsNotMedicalIndependentReviewer': True,
    'medicalGoalIds': ids, 'nativeAffectedUnion11': union,
    'wholeCanonicalCount': 484, 'currentCurricularAtomicCount': 397,
    'protectedActiveStrictScience': 369, 'rawCurrentProfileProducts': 389,
    'newP10': 10, 'completeBilingualCases': 20, 'newStrictClosuresClaimed': 0,
    'rawInputs': {key: ref(P / name) for key, name in raw_bindings.items()},
    'normalPreparedInputsCheck': ref(P / 'checks/normal-D11-prepared-input-check.actual.json'),
    'normalPAuthorMaterialization': ref(P / 'checks/normal-P10-materialization.actual-command.json'),
    'independentA': 'pending', 'independentB': 'pending',
    'captureIsNotInspection': True, 'sourceUnionApproval': False,
    'humanApproval': False, 'actualClinicalOrLabExecution': False,
    'activeWrites': False, 'GitWrites': False,
})

readme = '''# Medical10: inactive author successor on whole484/current397

Start an independent review at `RAW-FIRST.neutral-current397-medical10-complete-input-manifest.json`.
Do not read `after-FIRST/` author judgments before sealing the independent judgment.

This continuation authors complete P10 / twenty bilingual cases and retains ten actual original PNGs.
The normal source atlas covers 397 current atoms; the actual D union is eleven whole pages.
The eleventh page is the protected pedigree goal, affected only by the displayed reverse title
of genetic diagnostics. Its canonical body, positive profile and raster are retained exactly.
All 379 existing profile products and all 31 complete source mapping/extraction pairs are exact.
The two bounded text changes are the diagnostic title and the distinction between disrupted
cell-growth regulation and the separate invasion/transport/colonization metastasis mechanism.

Original images and QA views were seen by this author. Eleven actual whole HTML and PDF pages
are captured for independent reading; capture is not a visual inspection. Author whole-page
PDF smoke inspection covered cancer and stem cells only. No whole HTML visual inspection
or independent Medical review is claimed in this package.

P records remain E1/G1 AI candidates with `needs_human_review`. Twenty original teaching cases
are material inputs, not learner work or executed laboratory/clinical evidence. Laws and outcome
premises inside the cases are explicitly fictional. The regulatory-framework goal has a targeted
source-operator question: HE Q1.4 does not literally require a named legislation/participation
procedure. Its relationship to the general Q1 societal/ethical discourse must be independently
assessed. Q1.4/Q1.5 are facultative; example insulin-producing bacteria is not a universal mandate.
Broad inherited source partners are retained without a new source-union full clearance.

Strict M7 gain claimed here: **zero**. No active registry, Git or chemistry writes. Existing
Mathematics/Physics M7 and protected Biology science remain separate integration constraints.
Both genuine independent Medical reviews and their finding resolutions are still required.
Human review, release and trial gates remain separate from machine curriculum QA.
'''
(R / P / 'README.author-scope.md').write_text(readme)

# Validate only this bounded candidate and its artifacts; no runtime schema exemptions are added.
import jsonschema
schema = read(Path('docs/landscape-runtime.schema.json'))
jsonschema.validate(land, schema)
spec = importlib.util.spec_from_file_location('local_validate_schemas', R / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
checked = []
for f in sorted((R / P).rglob('*.json')):
    data = json.loads(f.read_text())
    valid = module.validate_file(str(f.relative_to(R)), schema)
    assert valid, str(f)
    checked.append(str(f.relative_to(R)))
line_count = 0
for f in sorted((R / P).rglob('*.jsonl')):
    for line in f.read_text().splitlines():
        if line.strip(): json.loads(line); line_count += 1
put('checks/FINAL.targeted-original-schema-and-binding-checks.actual.json', {
    'wholeCandidateLandscapeSchemaValid': True,
    'normalValidatorUnmodified': ref(Path('scripts/validate_schemas.py')),
    'actualTargetedJSONFiles': checked, 'actualTargetedJSONLRecords': line_count,
    'wholeCanonical484': 484, 'wholeCurrentAtomic397': 397,
    'other474CanonicalGoalBodiesExact': True, 'other386NormalizedPagesExact': True,
    'existing379ProfileProductsExact': True, 'whole31SourcePairsExact': True,
    'normalD11PreparedInputsValid': True, 'normalP10AuthorRecordsMaterialized': True,
    'originalIndependentBio8BSealUnmodified': ref(PB / 'original-independent-b.freeze.json'),
    'newStrictClosures': 0, 'sourceUnionApproval': False,
})
assert ref(PB / 'original-independent-b.freeze.json')['sha256'] == 'sha256:c93312f6092c4ddd37cc209b4a8421769f485fcf0abafc0cb0d836c3e88e4e7f'

put('FINAL.neutral-medical10-current397-author.join.json', {
    'schemaVersion': 1, 'role': 'Complete inactive Medical10 AUTHOR raw join, not an independent reviewer vote',
    'FIRST': ref(P / 'RAW-FIRST.neutral-current397-medical10-complete-input-manifest.json'),
    'targetedTechnicalChecks': ref(P / 'checks/FINAL.targeted-original-schema-and-binding-checks.actual.json'),
    'independentQAPlan': ref(P / 'independent-QA-plan.neutral.json'),
    'inputFreezePath': str(P / 'FINAL.author-package.freeze.json'),
    'currentActiveStrictProtected': 369, 'candidateWholeCount': 484, 'candidateAtomicCount': 397,
    'newP': 10, 'wholeCases': 20, 'actualNativeUnion': 11,
    'rawInputs': {key: ref(P / name) for key, name in raw_bindings.items()},
    'newIndependentReview': False, 'sourceUnionApproval': False,
    'humanApproval': False, 'strictGainClaimed': 0, 'activeWrites': False, 'GitWrites': False,
})
files = [ref(f.relative_to(R)) for f in sorted((R / P).rglob('*'))
         if f.is_file() and f.name != 'FINAL.author-package.freeze.json']
assert not any(f.is_symlink() for f in (R / P).rglob('*'))
put('FINAL.author-package.freeze.json', {
    'schemaVersion': 1, 'role': 'Immutable Medical10 AUTHOR package CAS, including separate author notes',
    'createdAtUTC': NOW, 'neutralFinalEntry': ref(P / 'FINAL.neutral-medical10-current397-author.join.json'),
    'neutralFIRST': ref(P / 'RAW-FIRST.neutral-current397-medical10-complete-input-manifest.json'),
    'files': files, 'fileCount': len(files), 'boundBytes': sum(f['bytes'] for f in files),
    'externalFiles': [external[k] for k in sorted(external)],
    'independentApproval': False, 'sourceUnionApproval': False,
    'humanApproval': False, 'activeWrites': False,
})
freeze = read(P / 'FINAL.author-package.freeze.json')
for f in freeze['files'] + freeze['externalFiles']:
    assert ref(f['path']) == f, f['path']
print(json.dumps({'finalEntry': ref(P / 'FINAL.neutral-medical10-current397-author.join.json'),
                  'FIRST': ref(P / 'RAW-FIRST.neutral-current397-medical10-complete-input-manifest.json'),
                  'freeze': ref(P / 'FINAL.author-package.freeze.json'),
                  'files': len(files), 'externalBindings': len(external),
                  'P': 10, 'cases': 20, 'D': 11, 'rawProfileProducts': 389,
                  'strictGainClaimed': 0}, ensure_ascii=False, indent=2))
