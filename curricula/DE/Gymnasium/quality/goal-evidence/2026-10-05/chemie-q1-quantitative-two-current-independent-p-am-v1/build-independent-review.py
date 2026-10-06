from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-atomic-split-current-author-candidate-v1'
ISO = ROOT / 'tmp/chemie-q1-quantitative-two-independent-p-am-native-20261005-v1'
IDS = ['3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66']
NOW = datetime.now(timezone.utc).isoformat()
REVIEWER = 'Codex independent two-goal P/A/M reviewer; not the quantitative-split author'
LANDSCAPE = AUTHOR / 'prospective-input-tree/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
KINDS = AUTHOR / 'prospective-input-tree/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
CRITERIA = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
FREEZE = AUTHOR / 'author-native-candidate.final.freeze.json'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def relative(path):
    return str(path.relative_to(ROOT))

def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def copy(source, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)

assert sha(FREEZE) == 'ff2c5e7ff6ef10d484cf3af8442b37d40b9ea1592b9063cc5ca8e233c1d34858'
frozen = json.loads(FREEZE.read_text())
checks = []
for row in frozen['files']:
    path = ROOT / row['path']
    checks.append({'path': row['path'], 'expectedSHA256': row['sha256'], 'actualSHA256': sha(path), 'sizeMatches': path.stat().st_size == row['bytes']})
assert all(x['expectedSHA256'] == x['actualSHA256'] and x['sizeMatches'] for x in checks)
write(OUT / 'author-freeze-preflight.actual.json', {'atUTC': NOW, 'freezePath': relative(FREEZE), 'freezeSHA256': sha(FREEZE), 'fileCount': len(checks), 'mismatches': [], 'files': checks})

landscape = json.loads(LANDSCAPE.read_text())
goals = {g['id']: g for g in landscape['goals'] if g['id'] in IDS}
assert set(goals) == set(IDS)
write(OUT / 'two-current-whole-bilingual-goals.actual.json', {'landscapeSHA256': sha(LANDSCAPE), 'goals': [goals[x] for x in IDS]})

# Each decision is specific to its current competence, rather than a subject-wide default.
decisions = [
    {
        'goalId': IDS[0],
        'P': {
            'decision': 'accept_as_ai_candidate',
            'reason': 'Independent full DE/EN profile review: three required expectations form the single controlled quantitative ascorbic assay. Structural reducing action supports the 1:1 iodine reaction without implying analyte specificity in an unknown matrix. Both case briefs require actual own planning AND execution and separate supplied arithmetic checks from practical evidence. Fresh reducing-matrix interference changes chemical inference and demands actual controls or a more selective assay. Correct blank, aliquot, mass and dilution calculations; no scientific blocker found. The LK HE B04 quantitative component is bounded and does not close all structural-properties or qualitative-test source obligations. E1/G1 needs_human_review, ai_candidate only; no learner execution or mastery observed.',
            'coverage': ['ascorbic-structure-and-suitable-method', 'actual-controlled-ascorbic-planning-and-execution', 'ascorbic-content-dilution-and-interference'],
            'caseIds': ['fresh-ascorbic-school-assay-own-records', 'fresh-ascorbic-matrix-interference-and-new-measurement'],
            'freshVariation': 'Different fresh sample/dilution and additional reducing matrix substance; learner must examine specificity and may reject a false exact ascorbic content.',
            'bilingualSemanticsEquivalent': True,
            'nonEvidence': 'Provided numbers, a simulated assay, an image or a verbal experimental plan cannot establish actual own execution.',
            'remainingAuthority': 'AI candidate review of future assessment material only.'
        },
        'A': {
            'decision': 'atomic',
            'reason': 'One assessable analyte-specific competence: obtain and justify the quantitative ascorbic content by a suitable controlled assay. Structure-informed method choice, own planning, actual performance, stoichiometric/calibrated evaluation, dilution and limitations are necessary connected phases of that same assay, not independent content routines. The goal no longer joins ascorbic acid and parabens. Calibration OR stoichiometry permits suitable alternative methods; it never changes planning AND performance into an alternative. Broader structural-properties and qualitative-test source learning stays outside this component.',
        },
        'M': {
            'decision': 'no_memory_needed',
            'reason': 'Reviewed this ascorbic assay individually: the assessable achievement is structure-based method selection and actual controlled determination, not cue-free recitation of an analyte table. Its structure and method information are supplied; the iodine stoichiometry can be justified through the reducing structure/redox relation, and the given molar mass and concentrations are applied to actual measurements. Blank correction, dilution and matrix selectivity need reasoning and experimental checks. No compact new fact must be recalled independently to satisfy this goal, so an additional SRS deck is unnecessary; general redox and quantity concepts remain in prerequisite ordinary goals. This decision does not certify execution or make all chemistry goals no-memory.',
        },
    },
    {
        'goalId': IDS[1],
        'P': {
            'decision': 'accept_as_ai_candidate',
            'reason': 'Independent full DE/EN profile review: all three required expectations preserve one specified p-hydroxybenzoic acid ester and actual own planning AND performance. Chromatography is a conditional example with available authorised equipment, not a universal school requirement. Peak time is separated from calibrated response; methylparaben standards cannot be transferred unchecked to ethylparaben. Fresh ester, matrix/coelution, changed working range and further dilution demand independent controls and actual remeasurement. Both calibration lines and dilution results are correct. No scientific blocker found. This is authored LK analytical transfer, not literal HE B05 Paraben-use source closure or a complete B04 claim. E1/G1 needs_human_review, ai_candidate only; no actual laboratory learner evidence.',
            'coverage': ['specified-paraben-structure-and-method', 'actual-controlled-paraben-planning-and-execution', 'paraben-calibration-range-dilution-selectivity'],
            'caseIds': ['fresh-specified-methylparaben-own-calibrated-assay', 'fresh-specified-ethylparaben-range-and-matrix-remeasurement'],
            'freshVariation': 'Specified methylparaben changes to specified ethylparaben, new analyte-specific calibration, possible coelution and out-of-range first reading; valid further dilution and actual remeasurement are required.',
            'bilingualSemanticsEquivalent': True,
            'nonEvidence': 'Foreign chromatograms, simulated readings, peak retention time alone or supplied calculations cannot prove own performance, selectivity or concentration.',
            'remainingAuthority': 'AI candidate review of authored future LK transfer material; source normative use obligation remains separate.'
        },
        'A': {
            'decision': 'atomic',
            'reason': 'One assessable specified-analyte determination: choose, plan, actually perform and evaluate a suitable assay for one given paraben ester. These form one connected analytical procedure and have one endpoint, a defensible analyte-specific content. Different specified esters in future transfer cases are variations of this same competence, not simultaneous independent analytes or an obligation to assay all parabens. The given ester is bounded; structure, standards, matrix and calibration remain material for the single assay. No separate normative Paraben-use or broad structural-properties mastery is implied.',
        },
        'M': {
            'decision': 'no_memory_needed',
            'reason': 'Reviewed this specified-ester assay individually: the ester identity/structure, authorised method and analyte-specific standards are supplied. Concentrations and calibration responses are empirical and must be measured anew rather than memorized; methods differ with ester and matrix. Relating peak area to concentration, rejecting time as concentration, correcting dilution and detecting coelution/range failure are representational reasoning and experimental validation. A list of paraben names or memorized HPLC settings would not establish this competence. No independent compact recall obligation justifies new cards or a second hidden curriculum; basic ester understanding is represented by the ordinary prerequisite.',
        },
    },
]
write(OUT / 'manual-independent-two-goal-decisions.actual.json', {
    'atUTC': NOW, 'reviewer': REVIEWER, 'scopeGoalIds': IDS, 'authorFreezeSHA256': sha(FREEZE),
    'fullGoalsAndProfilesRead': True, 'bothLanguagesBothCasesReadPerGoal': True,
    'otherReviewerVerdictsUsedAsApproval': False, 'authorProposalsUsedAsApproval': False,
    'planningANDActualPerformancePreserved': True, 'scientificBlockingFindings': [],
    'decisions': decisions, 'humanApproval': False, 'humanTrial': False, 'observedLearnerEvidence': False, 'activeWrites': 0,
})

candidate = json.loads((AUTHOR / 'positive-evidence.two-new-children.candidates.json').read_text())
candidate['reviewId'] = 'chemie-q1-quantitative-two-independent-p-20261005-v1'
candidate['reviewedAt'] = NOW
candidate['reviewer'] = REVIEWER
for c, d in zip(candidate['goals'], decisions):
    assert c['goalId'] == d['goalId']
    c['reason'] = d['P']['reason']
    c['evidenceLevel'] = 'E1'
    c['maximumClaimScope'] = 'G1'
    c['dissent'] = []
write(OUT / 'positive-evidence.reviewed-candidates.json', candidate)

config = json.loads((AUTHOR / 'positive-evidence.config.json').read_text())
config.update({'reviewId': candidate['reviewId'], 'landscapePath': relative(LANDSCAPE),
               'semanticKindLedgerPath': relative(KINDS), 'reviewPath': relative(OUT / 'positive-evidence.review.jsonl')})
config['scope'] = {'label': 'Two new frozen quantitative chemistry children independently reviewed; E1/G1 AI candidates only', 'goalIds': IDS}
write(OUT / 'positive-evidence.frozen-future.config.json', config)

for lane, rule, record_name, config_name in [
    ('A', 'semantic-atomicity-v1', 'semantic-atomicity.review.jsonl', 'semantic-atomicity.config.json'),
    ('M', 'memory-card-review-v1', 'memory-card-review.review.jsonl', 'memory-card-review.config.json'),
]:
    review_id = f'chemie-q1-quantitative-two-independent-{lane.lower()}-20261005-v1'
    records = []
    for d in decisions:
        record = {'schemaVersion': 1, 'reviewId': review_id, 'ruleVersion': rule,
                  'landscapeId': landscape['landscapeId'], 'goalId': d['goalId'], 'fingerprint': '',
                  'status': d[lane]['decision'], 'reviewedAt': NOW, 'reviewer': REVIEWER, 'reason': d[lane]['reason']}
        if lane == 'A':
            record['semanticAtomic'] = True
        else:
            record.update({'memoryUseful': False, 'memoryGoalIds': [], 'deckIds': []})
        records.append(record)
    (OUT / record_name).write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
    lane_config = {'schemaVersion': 1, 'reviewId': review_id, 'ruleVersion': rule,
                   'landscapeId': landscape['landscapeId'], 'landscapePath': relative(LANDSCAPE),
                   'reviewPath': relative(OUT / record_name),
                   'scope': {'label': 'Exactly two frozen new quantitative chemistry children; independent semantic decisions', 'leafGoalIds': IDS}}
    if lane == 'M':
        lane_config.update({'cardReviewPath': relative(OUT / 'memory-card-review.cards.review.jsonl'),
                            'reportPath': relative(OUT / 'memory-card-review.report.md')})
        (OUT / 'memory-card-review.cards.review.jsonl').write_text('')
    write(OUT / config_name, lane_config)

# Small physical input tree for unmodified native P scripts, never active public assets.
ISO.mkdir(parents=True, exist_ok=False)
copy(ROOT / 'app/package.json', ISO / 'app/package.json')
copy(ROOT / 'app/tsconfig.json', ISO / 'app/tsconfig.json')
for name in ['materializePositiveGoalEvidenceCandidates.ts', 'positiveGoalEvidenceReview.ts', 'positiveGoalEvidenceProfileModel.ts', 'goalEvidenceProfileModel.ts']:
    copy(ROOT / 'app/scripts' / name, ISO / 'app/scripts' / name)
(ISO / 'app/node_modules').symlink_to(ROOT / 'app/node_modules', target_is_directory=True)
copy(LANDSCAPE, ISO / 'review-inputs/frozen-author/landscape.json')
copy(KINDS, ISO / 'review-inputs/frozen-author/semantic-kinds.json')
copy(CRITERIA, ISO / 'review-inputs/chemistry-positive-criteria.md')
for g in goals.values():
    for link in g.get('resourceLinks', []):
        if link['type'] == 'goal-visualization':
            rel = Path('app/public') / link['url'].lstrip('/')
            copy(AUTHOR / 'prospective-input-tree' / rel, ISO / rel)
for rel in ['contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
            'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
            'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:
    copy(ROOT / rel, ISO / rel)
local_config = dict(config)
local_config.update({'landscapePath': 'review-inputs/frozen-author/landscape.json',
                     'semanticKindLedgerPath': 'review-inputs/frozen-author/semantic-kinds.json',
                     'reviewCriteriaPath': 'review-inputs/chemistry-positive-criteria.md',
                     'reviewPath': 'review-output/positive-evidence.review.jsonl'})
write(OUT / 'positive-evidence.native-isolated.config.json', local_config)
copy(OUT / 'positive-evidence.native-isolated.config.json', ISO / 'review-output/positive-evidence.config.json')
copy(OUT / 'positive-evidence.reviewed-candidates.json', ISO / 'review-output/positive-evidence.reviewed-candidates.json')
print(json.dumps({'namespace': relative(OUT), 'isolationRoot': str(ISO), 'authorFreezeVerifiedFiles': len(checks), 'scope': IDS, 'activeWrites': 0}, indent=2))
