# SPDX-License-Identifier: Apache-2.0
"""Bind an actual additive scientific context judgment without altering prior votes."""
import hashlib
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

R = Path(__file__).resolve().parents[7]
O = Path(__file__).resolve().parent
E = O.parent
A = E / 'chemie-source6-five-actual-current412-full-gate-author-20261014-v1'
P = E / 'chemie-source6-five-current412-whole-P-A-M-independent-a-20261014-v1'
V = E / 'chemie-source6-five-current412-actual-PNG-targeted-V-independent-b-20261014-v1'
I = E / 'chemie-source6-five-current412-actual-PNG-candidates-author-20261014-v1'


def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(R)), 'bytes': len(b), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest()}


def objbind(x):
    b = json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return {'serialization': 'UTF-8 JSON; sort_keys=true; ensure_ascii=false; compact separators; no newline',
            'bytes': len(b), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest()}


def write(p, x):
    assert not p.exists(), f'Preserve existing file: {p}'
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')


old_p_seal = P / 'SEAL.finite-five-current412-whole-P-A-M-independent-a.actual.json'
old_v_seal = V / 'SEAL.finite-five-original-PNG-current-whole-goal-V5-independent-b.actual.json'
assert bind(old_p_seal)['sha256'] == 'sha256:f8c01dba48f836ff28f4b640e5292d003f8bc9fa7d0186a76b373e62bb2ca9ab'
assert bind(old_v_seal)['sha256'] == 'sha256:d7c0343af83ccbee096f7a0f30622c132404c22493dc702e45138e7fe6882f32'
case_file = A / 'cases/whole-five-goals-ten-complete-bilingual-application-cases.author.json'
author_profile_file = A / 'P/five-current-whole-goal-author-E0-G0.profiles.jsonl'
review_profile_file = P / 'P/five-current412.whole-profiles-genuine-independent-a.E1G1.review.jsonl'
assert bind(case_file)['sha256'] == 'sha256:dde2111940a8af3cae6989d8b503d5b91b294dd50f65ca4feb2135e8c8689ab4'
assert bind(author_profile_file)['sha256'] == 'sha256:44f76b1e16c0561802f50bdaeeb0ff9fda0b3005254217a560b5a9bcad70c4fc'
cases = {x['goalId']: x for x in json.loads(case_file.read_text())['goals']}
profiles = {json.loads(x)['goalId']: json.loads(x) for x in review_profile_file.read_text().splitlines()}
author_profiles = {json.loads(x)['goalId']: json.loads(x) for x in author_profile_file.read_text().splitlines()}
profile_raw_lines = {json.loads(x)['goalId']: x for x in review_profile_file.read_bytes().splitlines(keepends=True)}
v_science = [json.loads(x) for x in (V / 'science/FIRST.five-actual-original-PNG-current-whole-goal-V5B.scientific-decisions.actual.jsonl').read_text().splitlines()]
old_canonical = A / 'candidate/canonical539.prospective-current412-on-actual280.author-only.json'
minimal = E / 'chemie-source6-five-current412-kind-and-whole-candidate-on286-root-20261014-v1/candidate/canonical539.current412-on-actual286.minimal-CAS.json'
assert bind(minimal)['sha256'] == 'sha256:b81a063d067656ced2a8db2a5760563b8804b46231b58bcbdced1b25e0e52f72'
minimal_goals = {x['id']: x for x in json.loads(minimal.read_text())['goals']}
old_goals = {x['id']: x for x in json.loads(old_canonical.read_text())['goals']}

notes = {
    'ee78e2c9-45c9-5023-8193-7e9c20bce0a6': {
        'scientificCompatibility': 'The uncrosslinked oil, dense resin network and sparse rubber network correspond to the same structure/property/use relation as case-1 A/B/C and case-2 O/H/K. Selected flowing fluid, hard coating and elastic seal agree with the supplied grades. Generic blue chain beads remain structure models, not substitute silicon/oxygen formulas.',
        'visibleTeachingCues': 'The picture supports e2/e3 with family names, topology and use. It does give those conceptual cues; this review does not call the page hint-free.',
        'remainingAssessedWork': 'Neither balanced chlorosilane versus alkoxysilane hydrolysis nor M/D/T functionality is solved by the picture. e1 requires the correct HCl/EtOH versus water balances. Increased-T network transfer and specifically moisture-cured K moved to dry conditions remain distinct e4 reasoning. Copying the three panel labels cannot satisfy the full four-expectation rubric.',
        'contextLimits': 'No image moisture/temperature label imposes a universal cure route or temperature promise. The unchanged cases already restrict their supplied grades and explicitly reject those generalisations.',
        'blockingFindings': [],
    },
    'd72cbb62-0b65-5b9a-aece-70c23d4e618a': {
        'scientificCompatibility': 'Azo, triarylmethane and anthocyanin cards are grouped by structure and by use, directly supporting the multi-criterion classification operation. Indicator remains a use, not a fourth structure family; colour is not a universal class identifier.',
        'visibleTeachingCues': 'The image reveals the three class names and two sample classification axes. Their existence is already stated in both full case materials. It is an orientation aid, not independent learner evidence.',
        'remainingAssessedWork': 'Both cases still require reasons for the given structural features, medium-specific solubility, independent origin and textile-method data gaps. Synthetic but structurally identical C and insoluble P replaced by soluble P-prime require changes by criterion; neither conclusion can be read from the image.',
        'contextLimits': 'The image labels its own generic samples Probe A/B/C and sends its azo sample A to Tinte. Case-1 supplies a more specific azo card A explicitly used for textile dyeing, while B is ink. This is a local label reuse across separate supplied examples, not an assertion that every azo dye is ink or that the case card has an unstated ink use. The exact structure and use data in the case control its assignment. In a combined presentation the image must remain the generic goal illustration, not be represented as the case-1 sample data or its solution. No missing textile method may be imported from the illustration.',
        'blockingFindings': [],
    },
    '03e12e4f-83eb-56a7-85ac-e0d628412dcc': {
        'scientificCompatibility': 'The visible alcohol lone-pair attack on NCO carbon, N=C-pi shift toward N, retained R groups and neutral urethane product agree with the simplified charge-accounted teaching mechanism explicitly allowed in both cases. The labelled simplified B/BH-plus helper cycle does not assert a unique microscopic pathway.',
        'visibleTeachingCues': 'The final image supplies genuine local e1 and product cues. Its short blue arrow is associated with the N=C pi-bond region with a small graphic gap above the stroke, as already explicitly recorded in sealed V5-B. This is not claimed to be an unseen-arrow test.',
        'remainingAssessedWork': 'The image does not provide the charged intermediate, the two electron-accounted proton-relay steps, a chain with at least two urethane links and continuable ends, or either ethanol substitution/end-capping transfer. Case-2 also requires applying the mechanism to changed substituents, correcting a wrong N attack and distinguishing a product equation from a complete mechanism. These separately graded demands remain necessary; the image or a copied overall equation cannot earn full-profile coverage.',
        'contextLimits': 'The image is a local orienting mechanism diagram, not the complete two-case rubric solution. No new P evidence is inferred merely from viewing it; no change to the existing model-answer or grading requirements is justified.',
        'blockingFindings': [],
    },
    'f4f7f028-10db-53f9-bdae-456e0c6d0896': {
        'scientificCompatibility': 'AgBr dissolving into soluble bis(thiosulfato) Ag(I) while metallic Ag(0) remains agrees with both full cases. The equation supplies the same 2:1 ligand ratio, atom/charge conservation and unchanged Ag(I) as the case model. The qualitative before/after grain picture is explicitly schematic, not numerical case data.',
        'visibleTeachingCues': 'The picture shows the main fixing phenomenon and reaction equation. It therefore supports parts of e1/e2/e3; a repeated formula alone is not new independent performance.',
        'remainingAssessedWork': 'Case-1 still requires phases, charge/oxidation-state explanation, 2.00 mmol ligand demand/4.00 mmol remaining and the water-only/light transfer. Case-2 still requires 0.60 mmol maximum removal/0.20 mmol possible AgBr rest, why a fresh bath helps, why the liquid retains complexed silver and why capacity is not real fixing time. These numbers and changed-condition conclusions are not depicted.',
        'contextLimits': 'The fully fixed qualitative illustration is not a promise that every exhausted bath removes all AgBr. The limited-free-ligand case explicitly changes that condition. Neither icon counts nor the generic complete-fixing endpoint replace the actual case quantities.',
        'blockingFindings': [],
    },
    '0559cec7-330b-57f1-a409-31cf1b4ac9fb': {
        'scientificCompatibility': 'Radical-start control, product-water removal in the expressly labelled polyester example and dry heat-controlled urethane addition align with case-1. The model joining blocks preserve their local counts and do not assert literal formula stoichiometry.',
        'visibleTeachingCues': 'The picture provides a first three-route comparison and selected operating cues. It does not show the supplied temperature windows, starter/catalyst distinction, fixed-temperature catalyst/equilibrium reasoning or the complete case-2 perturbations.',
        'remainingAssessedWork': 'Both cases still require explicit group/linkage reactions and reasons across initiation/catalysis, temperature and process control. The second case changes to light initiation at 20C and interfacial amide formation at 20C with HCl scavenging; darkness, omitted base and wet NCO have different causes. That transfer and rejection of universal temperature/catalyst rules cannot be supplied by the selected-example image alone.',
        'contextLimits': 'Wasser abführen is scoped by Beispiel: Polyester, not a rule that all polycondensation releases water or needs high temperature. Consequently case-2 HCl-forming polycondensation is a legitimate changed example, not a contradiction. Likewise a light/heat initiation icon is not an AND condition, and dryness is for the shown urethane system.',
        'blockingFindings': [],
    },
}

input_rows = []
decisions = []
ended = datetime.now(timezone.utc).isoformat()
for v in v_science:
    gid = v['goalId']
    assert minimal_goals[gid] == old_goals[gid] == v['wholeCurrentGoal']
    assert profiles[gid]['profile'] == author_profiles[gid]['profile']
    assert v['originalSelectedPixels'] == bind(R / v['originalSelectedPixels']['path'])
    assert v['decision'] == 'KEEP'
    assert [x['id'] for x in cases[gid]['cases']] == ['case-1', 'case-2']
    raw_line = profile_raw_lines[gid]
    row = {
        'goalId': gid, 'wholeCurrentGoalCanonicalJsonBinding': objbind(minimal_goals[gid]),
        'wholeCurrentGoal': minimal_goals[gid],
        'unchangedWholeProfileCanonicalJsonBinding': objbind(profiles[gid]['profile']),
        'originalP5AWholeRecordRawLineIncludingNewline': {'carrier': bind(review_profile_file), 'bytes': len(raw_line), 'sha256': 'sha256:' + hashlib.sha256(raw_line).hexdigest()},
        'historicalStockFingerprintsNotNewScience': {k: profiles[gid][k] for k in ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint']},
        'fullCases': [{'id': c['id'], 'wholeDeEnMaterialTaskAnswersRubricAndMetadataCanonicalJsonBinding': objbind(c), 'carrier': bind(case_file)} for c in cases[gid]['cases']],
        'exactFinalPng': bind(R / v['originalSelectedPixels']['path']),
        'originalCaseAndProfileTextsPreserved': True,
    }
    input_rows.append(row)
    decisions.append({
        'schemaVersion': 1, 'goalId': gid, 'decision': 'ACCEPT_BOUNDED_IMAGE_P_CONTEXT_COMPATIBILITY',
        **notes[gid], 'inputRow': row,
        'scientificDecidedAtUTC': ended,
        'reviewer': 'Actual original P5-A and final V5-B reviewer, OpenAI GPT-6 Codex; exact revision and sampling unknown',
        'wholeDesignReReviewOrNewIndependentPVote': False, 'newNativeDReview': False,
        'historicalPStatusUnchanged': {'evidenceLevel': profiles[gid]['evidenceLevel'], 'maximumClaimScope': profiles[gid]['maximumClaimScope'], 'status': profiles[gid]['status'], 'reviewAuthority': profiles[gid]['reviewAuthority']},
        'newHumanSourceKindA_MOrStrictApproval': False,
    })

write(O / 'inputs/EXACT.current-whole-goal-unchanged-P5A-profiles-ten-cases-and-five-final-PNGs.json', {
    'schemaVersion': 1, 'boundAtUTC': ended, 'currentMinimalCanonical': bind(minimal),
    'originalP5ASeal': bind(old_p_seal), 'ownFinalV5BSeal': bind(old_v_seal),
    'originalCaseCarrier': bind(case_file), 'originalAuthorProfileCarrier': bind(author_profile_file), 'originalP5ARecordCarrier': bind(review_profile_file),
    'finalImageNeutral': bind(I / 'NEUTRAL.five-final-original-PNG-candidates-whole-current-goals-for-independent-V.json'),
    'hashEncoding': 'Every per-object SHA uses explicitly named canonical JSON serialization; it is an exact data binding, not a replacement for the separate historical stock profile/goal fingerprints.',
    'rows': input_rows,
})
science = O / 'science/FIRST.five-final-image-context-compatibility.actual-P5A-addendum.jsonl'
assert not science.exists()
science.write_text(''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in decisions))
first_seal = O / 'FIRST-SCIENCE-SEAL.five-final-images-unchanged-P5A-context-addendum.actual.json'
write(first_seal, {
    'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'scienceDecidedAtUTC': ended,
    'scienceRecords': bind(science), 'exactInputBindings': bind(O / 'inputs/EXACT.current-whole-goal-unchanged-P5A-profiles-ten-cases-and-five-final-PNGs.json'),
    'provenance': bind(O / 'PROVENANCE.actual-additive-P5-image-context-review.json'),
    'scope': 'Five final original PNGs versus the same already fully reviewed ten cases and five P profiles, on unchanged whole goals. Additive scientific compatibility, not fingerprint approval or another whole-P vote.',
    'actualAdditionalTargetedRead': 'All ten case materials/tasks and grading demands plus all five profile expectations were compared to own native/360/680 pixel review; d72 final native PNG re-viewed for exact A/B/C/use association. No new full-design repeat.',
    'normalWholeNativePageReviewStatus': 'PENDING_NEW_SHARED_NATIVE5_INPUTS',
    'priorRecordsAndSealsNotOverwritten': True,
})

# Technical checks begin only after the new additive science has been sealed.
spec = importlib.util.spec_from_file_location('stock_validate_schemas', R / 'scripts/validate_schemas.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
guard_started = datetime.now(timezone.utc).isoformat()
errors = mod.curriculum_symlink_errors(str(R))
assert not errors, errors
write(O / 'checks/ACTUAL.stock-curriculum-symlink-guard.before-final-seal.json', {
    'schemaVersion': 1, 'function': 'scripts/validate_schemas.py::curriculum_symlink_errors',
    'stockModule': bind(R / 'scripts/validate_schemas.py'), 'startedAtUTC': guard_started,
    'endedAtUTC': datetime.now(timezone.utc).isoformat(), 'status': 'PASS', 'errors': errors,
})
parsed = []
for p in sorted(O.rglob('*')):
    if p.is_file() and p.suffix == '.json':
        json.loads(p.read_text()); parsed.append(bind(p))
    elif p.is_file() and p.suffix == '.jsonl':
        for l in p.read_text().splitlines():
            if l.strip(): json.loads(l)
        parsed.append(bind(p))
write(O / 'checks/ACTUAL.finite-JSON-JSONL-and-preservation-check.json', {
    'schemaVersion': 1, 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'status': 'PASS', 'parsedFiles': parsed,
    'exactCurrentFiveWholeGoalsEqualOriginalReviewedFive': True, 'wholeFiveProfileBodiesEqualOriginalAuthorBodies': True,
    'originalFullTenCaseCarrierUnchanged': bind(case_file), 'originalProfileCarrierUnchanged': bind(author_profile_file),
    'priorP5ASealStillExact': bind(old_p_seal), 'priorV5BSealStillExact': bind(old_v_seal),
    'oldRecordsRewritten': False, 'activeOrHHostWrites': False,
})
manifest = O / 'FINAL.finite-five-final-PNG-unchanged-P5-context-addendum.actual.manifest.json'
write(manifest, {
    'schemaVersion': 1, 'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'reviewScope': 'Additive actual P5-A final-image context compatibility only',
    'provider': 'OpenAI', 'model': 'GPT-6 Codex', 'modelRevision': None, 'samplingParameters': None,
    'firstScienceSeal': bind(first_seal), 'scientificRecords': bind(science),
    'verdicts': [{'goalId': x['goalId'], 'decision': x['decision']} for x in decisions],
    'existingEvidenceLevelsAndAuthorityUnchanged': True,
    'cuesClassifiedTruthfully': 'Images contain legitimate core teaching cues; no hint-free or unseen-response claim. Full rubric explanation and changed-condition transfer still required. Image copying is not learner evidence.',
    'specificContextBoundaries': ['d72 generic Probe A ink use is not case-1 card A textile data', '055 water removal belongs to the selected polyester example; case-2 HCl polycondensation remains valid', '03e local illustration is not the complete charged relay/chain/ethanol transfer solution', 'f4 fully fixed illustration is not exhausted-bath capacity data'],
    'pending': ['Normal exact-byte image/resource imports and fresh actual shared native5 goal-page review remain separate.', 'Existing source/course/choice/acquisition holds are not resolved by this addendum.'],
    'noNewHumanNativeD_A_M_kindSourceOrCentralStrictApproval': True,
    'files': [bind(p) for p in sorted(O.rglob('*')) if p.is_file()],
    'license': 'Own scientific review content CC-BY-4.0; technical helper Apache-2.0; original rights preserved.',
})
final = O / 'SEAL.finite-five-final-PNG-unchanged-P5-context-addendum.actual.json'
write(final, {'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'manifest': bind(manifest),
              'files': [bind(p) for p in sorted(O.rglob('*')) if p.is_file()],
              'noOldReviewsOrActiveHHostMutation': True})
for p in O.rglob('*'):
    if p.is_file() and p.suffix == '.json': json.loads(p.read_text())
for row in json.loads(final.read_text())['files']:
    assert bind(R / row['path']) == row
print(json.dumps({'firstScienceSeal': bind(first_seal), 'manifest': bind(manifest), 'finalSeal': bind(final)}, indent=2))
