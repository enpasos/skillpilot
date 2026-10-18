import json
import hashlib
import shutil
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime, timezone

BASE = Path(__file__).resolve().parent.parent
ROOT = Path.cwd()
N17 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
H = N17 / 'chemie-current439-source-requires-working-checkpoint-20261017-v1/evidence'
T = Path('tmp/chemie-m7-resumed-20261016')

def read(p):
    return json.loads(Path(p).read_text())

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def objsha(x):
    return hashlib.sha256(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def rel(p):
    return str(Path(p).relative_to(ROOT)) if Path(p).is_absolute() else str(p)

def pin(p):
    return {'path': rel(p), 'sha256': sha(p), 'bytes': Path(p).stat().st_size}

def write(p, x):
    Path(p).write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
    read(p)

evidence_files = {}
portable_map = []

def evidence(p):
    p = Path(p)
    original = pin(p)
    if str(p).startswith('tmp/'):
        target = BASE / 'evidence' / (p.parent.name + '--' + p.name)
        if target.exists() and target.read_bytes() != p.read_bytes():
            raise ValueError('Refusing a differing portable evidence overwrite')
        shutil.copyfile(p, target)
        assert sha(p) == sha(target)
        actual = pin(target)
        portable_map.append({'original': original, 'portableExactCopy': actual})
    else:
        actual = original
    evidence_files[actual['path']] = {'file': actual, 'original': original,
        'boundary': 'Actual existing scientific/author bytes; no new reviewer vote or approval from this author packet.'}
    return actual

def locator(p, pointer, value=None, purpose=None):
    x = evidence(p)
    out = {**x, 'jsonPointer': pointer}
    if value is not None:
        out['objectSHA256'] = objsha(value)
    if purpose:
        out['use'] = purpose
    return out

pair_proofs = defaultdict(list)
baseline_goals = defaultdict(list)
history_excerpts = []

def baseline(g, source, pointer):
    if not g or 'description' not in g:
        return
    item = {'goalId': g['id'], 'source': evidence(source), 'jsonPointer': pointer,
            'wholeGoalObjectSHA256': objsha(g), 'wholeGoal': g}
    history_excerpts.append(item)
    baseline_goals[g['id']].append(item)

def proof(gid, jurisdiction, family, refs, views=None, rationale=None):
    pair_proofs[(gid, jurisdiction)].append({'family': family, 'actualDecisionLocators': refs,
        'explicitReviewedViewIds': sorted(set(views or [])), 'existingScientificRationale': rationale,
        'newScienceVote': False})

def refs_for_rows(file, field, goalkey='goalId'):
    data = read(file)
    return {q[goalkey]: (i, q) for i, q in enumerate(data[field])}

# Exact 112 separately decided scope tuples.
s42_input = N17 / 'chemie-current442-retained-target42-explicit-own-acquisition-scope-author-20261017-v1/SCOPE42.whole-current-goals-profiles-and-112-explicit-acquisition-decisions.author.json'
s42a = N17 / 'chemie-current442-retained-target42-own-scope-informed-independent-a-20261018-v1/FIRST.informed-own-acquisition-scope42-112.independent-a.json'
s42b = N17 / 'chemie-current442-retained-target42-own-acquisition-scope-independent-b-20261017-v1/FIRST.independent-retained42-own-acquisition-scope.json'
a_rows = refs_for_rows(s42a, 'wholeGoalScopeReviews')
b_tuples = read(s42b)['tupleDecisions']
for i, row in enumerate(read(s42_input)['rows']):
    gid = row['goalId']
    baseline(row['wholeGoalAfter'], s42_input, f'/rows/{i}/wholeGoalAfter')
    ai, ar = a_rows[gid]
    for ji, decision in enumerate(row['jurisdictionDecisions']):
        ext = decision['proposedExtension']; jur = ext['jurisdiction']
        bi, br = next((bi, br) for bi, br in enumerate(b_tuples) if br['goalId'] == gid and br['jurisdiction'] == jur)
        proof(gid, jur, 'exact-retained42-112', [
            locator(s42a, f'/wholeGoalScopeReviews/{ai}', ar),
            locator(s42b, f'/tupleDecisions/{bi}', br),
            locator(s42_input, f'/rows/{i}/jurisdictionDecisions/{ji}', decision)],
            ext['viewIds'], ar['ownRationaleDe'])

def add_after_rows(input_file, rows, a_file, a_field, b_file, b_field, family, row_root):
    ars = refs_for_rows(a_file, a_field); brs = refs_for_rows(b_file, b_field)
    for i, row in enumerate(rows):
        gid = row['goalId']; after = row['after']
        if gid not in ars or gid not in brs:
            continue
        ai, ar = ars[gid]; bi, br = brs[gid]
        baseline(after, input_file, f'{row_root}/{i}/after')
        old_extensions = row.get('before', {}).get('extendedData', {}).get('skillPilotAcquisitionExtensions', [])
        for ei, ext in enumerate(after.get('extendedData', {}).get('skillPilotAcquisitionExtensions', [])):
            # These packets introduce/decide their finite own scope, never all
            # countries incidentally present in an unrelated old canonical copy.
            if ext in old_extensions:
                continue
            proof(gid, ext['jurisdiction'], family, [
                locator(a_file, f'/{a_field}/{ai}', ar),
                locator(b_file, f'/{b_field}/{bi}', br),
                locator(input_file, f'{row_root}/{i}/after/extendedData/skillPilotAcquisitionExtensions/{ei}', ext)],
                ext.get('viewIds'), ar.get('reason', ar.get('reasonDe', ar.get('independentContentFindingsDe'))))

arr_in = H / 'arrhenius-and-HE-practice-retained-target-scope-author-v1/REVIEW-INPUT.clean-arrhenius-and-five-HE-endpoints-whole-content.json.snapshot'
add_after_rows(arr_in, read(arr_in)['wholeTwelveOrdinaryBeforeAndAfterGoals'],
    H/'arrhenius-and-HE-practice-informed-root-review-v1/REVIEW.informed-root.package01-02.json.snapshot', 'perGoalFindings',
    H/'arrhenius-and-HE-practice-independent-b-v1/FIRST.review.json.snapshot', 'ordinaryGoalDecisions',
    'arrhenius-and-HE-practical-own-scope', '/wholeTwelveOrdinaryBeforeAndAfterGoals')

surf_in = H/'surfactants-softeners-retained-target-scope-author-v1/REVIEW-INPUT.clean-package03-whole-content.json.snapshot'
surf_a = H/'surfactants-softeners-informed-root-review-v1/REVIEW.informed-root.package03.json.snapshot'
surf_b = H/'surfactants-softeners-independent-b-v1/FIRST.independent-b.package03.json.snapshot'
for i, row in enumerate(read(surf_in)['guardedWholeObjectProposal']['canonicalWholeGoalChanges']):
    g = row['after']; gid = g['id']; ai, ar = refs_for_rows(surf_a, 'science')[gid]
    baseline(g, surf_in, f'/guardedWholeObjectProposal/canonicalWholeGoalChanges/{i}/after')
    for ei, ext in enumerate(g['extendedData']['skillPilotAcquisitionExtensions']):
        proof(gid, ext['jurisdiction'], 'surfactants-zeolites-own-LK-scope', [
            locator(surf_a, f'/science/{ai}', ar), locator(surf_b, '/boundedScopeVerdict', read(surf_b)['boundedScopeVerdict']),
            locator(surf_in, f'/guardedWholeObjectProposal/canonicalWholeGoalChanges/{i}/after/extendedData/skillPilotAcquisitionExtensions/{ei}', ext)],
            ext['viewIds'], ar.get('wholeCaseReasoning'))

colour_in = H/'eleven-colour-goals-retained-target-scope-author-successor-v2/REVIEW-INPUT.clean-eleven-colours-plus-one188-DE-task-successor.v2.json.snapshot'
colour_a = H/'eleven-colour-goals-independent-a-v1/FIRST.independent-a.json.snapshot'
colour_b = H/'eleven-colour-goals-independent-b-v2/FIRST.review.json.snapshot'
ca = refs_for_rows(colour_a, 'wholeElevenScientificFindings'); cb = refs_for_rows(colour_b, 'wholeElevenDecisions')
colour_data = read(colour_in)
for i, row in enumerate(colour_data['wholeElevenBeforeAndAfterGoals']):
    baseline(row['after'], colour_in, f'/wholeElevenBeforeAndAfterGoals/{i}/after')
for pi, plan in enumerate(colour_data['scopeInputPlan']):
    gid = plan['goalId']; ai, ar = ca[gid]; bi, br = cb[gid]
    for jur in plan['jurisdictions']:
        scope = [s for s in br.get('courseScope', []) if s.get('jurisdiction') == jur]
        views = [v for s in scope for v in s.get('viewIds', [])]
        refs = [locator(colour_a, f'/wholeElevenScientificFindings/{ai}', ar),
                locator(colour_b, f'/wholeElevenDecisions/{bi}', br), locator(colour_in, f'/scopeInputPlan/{pi}', plan)]
        if gid.startswith('188bd'):
            follow = H/'eleven-colour-goals-independent-a-followup-v2/FOLLOWUP.independent-a.one188-DE-field.v2.json.snapshot'
            refs.append(locator(follow, '', read(follow), 'Actual follow-up resolves the specific initial A wording revision; no initial global KEEP is invented.'))
        proof(gid, jur, 'eleven-dyes-own-scope-with-specific188-followup', refs, views, br.get('reasonDe'))

ni_in = H/'NI-organics-materials-retained-target-scope-author-root-v1/REVIEW-INPUT.clean-NI-package05-current-paired-cc5a-context-v2.json.snapshot'
add_after_rows(ni_in, read(ni_in)['wholeGuardedProposal']['canonicalWholeGoalChanges'],
    H/'NI-organics-materials-independent-a-v1/FIRST.independent-a.NI-package05.json.snapshot', 'wholeFourteenGoalFindings',
    H/'NI-organics-materials-independent-b-v1/FIRST.review.json.snapshot', 'perWholeGoal',
    'NI-whole-organics-materials-own-acquisition', '/wholeGuardedProposal/canonicalWholeGoalChanges')

nano_in = H/'nano-aromatics-and-methods-retained-target-scope-author-v1/REVIEW-INPUT.clean-ten-whole-Nano-aromatic-methods-goals-Ps-primary-and25contexts.json.snapshot'
nano_a = H/'nano-aromatics-and-methods-independent-a-v1/FIRST.independent-a.packages06-07.json.snapshot'
nano_b = H/'nano-aromatics-and-methods-informed-root-review-v1/REVIEW.informed-root.package06-07.json.snapshot'
na = refs_for_rows(nano_a, 'wholeTenGoalFindings'); nb = refs_for_rows(nano_b, 'perGoalFindings'); nd = read(nano_in)
for i, row in enumerate(nd['wholeTenBeforeAndProposedGoals']):
    baseline(row['after'], nano_in, f'/wholeTenBeforeAndProposedGoals/{i}/after')
for i, plan in enumerate(nd['scopeInputPlan']):
    gid = plan['goalId']; ai, ar = na[gid]; bi, br = nb[gid]
    for jur in plan['jurisdictions']:
        proof(gid, jur, 'nano-aromatics-methods-exact-own-scope', [locator(nano_a, f'/wholeTenGoalFindings/{ai}', ar),
            locator(nano_b, f'/perGoalFindings/{bi}', br), locator(nano_in, f'/scopeInputPlan/{i}', plan)],
            plan['existingViewIds'], ar.get('sourceRoleAndPerformanceBoundaryDe'))

hb_a = H/'HB7f-retained-application-independent-a-v1/FIRST.independent-a.HB7f.json.snapshot'
hb_b = H/'HB7f-retained-application-independent-b-v1/FIRST.informed-foreign-b.HB7f.json.snapshot'
hb_input = H/'HB7f-retained-application-target-after-correct188-prior-removal-author-root-v1/CAS.one-whole-HB7f-own-scope-no-edges-or-views.unapplied.json.snapshot'
hb_packet = read(hb_input)
def find_whole_goal(value, gid, pointer=''):
    found = []
    if isinstance(value, dict):
        if value.get('id') == gid and 'description' in value:
            found.append((pointer, value))
        for key, child in value.items():
            found.extend(find_whole_goal(child, gid, pointer+'/'+key))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(find_whole_goal(child, gid, pointer+'/'+str(index)))
    return found
for pointer, whole in find_whole_goal(hb_packet, '7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6'):
    if '/after' in pointer.lower():
        baseline(whole, hb_input, pointer)
proof('7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6', 'DE-HB', 'HB7f-explicit-own-application', [
    locator(hb_a, '/decision', read(hb_a)['decision']), locator(hb_a, '/wholeGoalAndTeacherFindings', read(hb_a)['wholeGoalAndTeacherFindings']),
    locator(hb_b, '/verdict', read(hb_b)['verdict'])], ['de-hb-gym-chemistry-gk', 'de-hb-gym-chemistry-lk'],
    'Whole retained HB application competence, genuine prerequisites and existing two HB course targets were specifically accepted as own acquisition; no official whole-source credit.')

# Preserve only the directly used temporary scientific originals and bounded
# whole-goal scope inputs. Embedded historical strings remain byte-exact.
c95_in = T/'c95-BB-BE-retained-existing-target-scope-author-v1/CAS.one-whole-c95-BB-BE-own-scope.inactive.json'
c95_clean = T/'c95-BB-BE-retained-existing-target-scope-author-v1/REVIEW-INPUT.clean-whole-c95-P-BB-BE-primary-courses-and-current-exclusion.json'
c95a = T/'c95-BB-BE-retained-target-scope-independent-a-v1/FIRST.independent-a.c95-BB-BE-own-scope.json'
c95b = T/'c95-BB-BE-retained-target-scope-independent-b-v1/FIRST.review.json'
evidence(c95_clean)
row = read(c95_in)['wholeGoalChanges'][0]; baseline(row['after'], c95_in, '/wholeGoalChanges/0/after')
for jur in ['DE-BB', 'DE-BE']:
    proof(row['goalId'], jur, 'c95-exact-BB-BE-own-acquisition', [locator(c95a, '/decision', read(c95a)['decision']),
        locator(c95b, '/scopeDelta', read(c95b)['scopeDelta']), locator(c95_in, '/wholeGoalChanges/0', row)],
        [f'de-{jur[-2:].lower()}-gym-chemistry-{c}' for c in ['gk', 'lk']], 'The complete corrosion comparison and its genuine route are retained as explicit own acquisition in the four already authored BB/BE GK/LK contexts, not restored as a prerequisite for another goal.')

ni4955in = T/'NI4955-own-acquisition-compiler-input-author-successor-v1/REVIEW-INPUT.FINAL.clean-NI4955-source32-source50-whole-acquisition-and-one-compilerinput.json'
ni4955a = T/'NI4955-own-acquisition-independent-a-v1/FOLLOWUP.NI-GK-LK-SCOPE.json'
ni4955b = T/'NI4955-own-acquisition-independent-b-v1/FIRST.review.json'
evidence(T/'NI4955-own-acquisition-independent-a-v1/FIRST.json')
evidence(T/'NI4955-two-prior-GK-LK-scope-author-successor-v1/REVIEW-INPUT.clean-two-whole-priors-current-P-and-true-NI-GK-LK-scope.json')
evidence(ni4955in)
g = read(ni4955in)['wholeTeacherAfter']; baseline(g, ni4955in, '/wholeTeacherAfter')
proof(g['id'], 'DE-NI', 'NI4955-specific-GK-collateral-hold-resolved', [locator(ni4955a, '/resolvedHold', read(ni4955a)['resolvedHold']),
    locator(ni4955b, '/wholeAcquisitionChecks/0', read(ni4955b)['wholeAcquisitionChecks'][0]),
    locator(ni4955a, '/scopeFindings', read(ni4955a)['scopeFindings'])], ['de-ni-gym-chemistry-lk'],
    '4955 remains the existing LK rubber acquisition example. The earlier A HOLD concerned undisclosed GK collateral 7f/0278 scope, explicitly resolved in the accepted follow-up; it is not silently counted as original unconditional KEEP.')

# Exact post-partition retentions: source science and the declared coordinate
# sets are independently recorded in D5. These are not source-coverage votes.
d5a = N17/'chemie-current442-five-description-two-duty-split-independent-a-20261018-v1/REVIEW.five-D-two-duty.informed-independent-a.json'
d5b = N17/'chemie-current442-five-description-two-duty-split-independent-b-20261018-v1/REVIEW.informed-five-description-two-duty.independent-b.json'
d5ad = read(d5a); d5bd = read(d5b)
d5_input = N17/'chemie-current442-five-description-two-duty-split-author-20261017-v1/AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json'
d5_input_data = read(d5_input)
for field in ['records', 'newCandidateGoals']:
    for index, row in enumerate(d5_input_data[field]):
        baseline(row['afterGoal'], d5_input, f'/{field}/{index}/afterGoal')
for gid, jurisdictions in {
    '223e33a4-5545-5332-ac4e-7d7a6cbc587c': ['DE-BB','DE-BE','DE-HE','DE-HH','DE-MV','DE-RP','DE-SH','DE-SL','DE-SN','DE-ST','DE-TH'],
    '4965395d-e0c5-5e23-a408-a11712aab409': ['DE-SH'],
    '3eb2a06c-d283-57aa-9eb4-088940c4801a': ['DE-HB'],
}.items():
    af = 'newNarrowGoalReviews' if gid != '3eb2a06c-d283-57aa-9eb4-088940c4801a' else 'existingGoalReviews'
    bf = 'newGoalFindings' if af == 'newNarrowGoalReviews' else 'existingGoalFindings'
    ai, ar = next((i,q) for i,q in enumerate(d5ad[af]) if q['goalId']==gid)
    bi, br = next((i,q) for i,q in enumerate(d5bd[bf]) if q['goalId']==gid)
    for jur in jurisdictions:
        proof(gid, jur, 'exact-D5-whole-duty-partition-retention', [locator(d5a, f'/{af}/{ai}', ar),
            locator(d5b, f'/{bf}/{bi}', br), locator(d5b, '/scopeFindings', d5bd['scopeFindings'])], rationale=ar.get('scopeRationaleDe', ar.get('positiveFindingDe')))

delta_proofs = defaultdict(list)
profile_successor_proofs = {}
for gid in ['0959eef2-3c7d-5b33-a109-ddf332a5dbd9','3eb2a06c-d283-57aa-9eb4-088940c4801a','223e33a4-5545-5332-ac4e-7d7a6cbc587c','4965395d-e0c5-5e23-a408-a11712aab409']:
    af = 'existingGoalReviews' if gid in ['0959eef2-3c7d-5b33-a109-ddf332a5dbd9','3eb2a06c-d283-57aa-9eb4-088940c4801a'] else 'newNarrowGoalReviews'
    bf = 'existingGoalFindings' if af == 'existingGoalReviews' else 'newGoalFindings'
    ai, ar = next((i,q) for i,q in enumerate(d5ad[af]) if q['goalId']==gid)
    bi, br = next((i,q) for i,q in enumerate(d5bd[bf]) if q['goalId']==gid)
    delta_proofs[gid] = [locator(d5a, f'/{af}/{ai}', ar), locator(d5b, f'/{bf}/{bi}', br)]

# The two new duty profiles have a later, explicitly reviewed disjoint-case
# binding. Retain the earlier partition judgment and bind this actual successor
# rather than pretending its profile hash equals the earlier compact brief.
p2b = N17/'chemie-current447-v1-p2-targeted-independent-b-20261018-v1/P2.V2.ADDENDUM.disjoint-baseline-fresh.independent-b.json'
for index, record in enumerate(read(p2b)['records']):
    gid = record['goalId']
    baseline(record['wholeGoalContext'], p2b, f'/records/{index}/wholeGoalContext')
    refs = [locator(p2b, f'/records/{index}', record), locator(p2b, f'/records/{index}/wholeProposedProfile', record['wholeProposedProfile'])]
    delta_proofs[gid].extend(refs)
    profile_successor_proofs[gid] = {'expectedCurrentProfileObjectSHA256':objsha(record['wholeProposedProfile']),
        'actualExistingVerdict':record['recommendation'],'locators':refs,
        'deltaMeaning':'Exact existing P2-v2 staged baseline/fresh binding, not a new profile/scientific review or a changed acquisition jurisdiction.'}

scope64b = N17/'chemie-current450-ten-corrections-informed-independent-b-20261018-v1/FOLLOWUP.B-64b-HB-exact-scope-successor.accepted.sealed.json'
scope64ba = N17/'chemie-current450-ten-corrections-informed-independent-a-20261018-v1/AUTHOR.64b0-HB-term-route-bounded-successor.pending.json'
s64 = read(scope64b)
delta_proofs['64b03eff-a967-54a1-ace3-89cb7650a65c'] = [locator(scope64b, '/verdict', s64['verdict']), locator(scope64b, '/scientificRationaleDe', s64['scientificRationaleDe']), locator(scope64ba, '', purpose='A is author of the actual scope successor, not a second independent approval.')]
proof('64b03eff-a967-54a1-ace3-89cb7650a65c','DE-HB','exact-HB64b-own-scope-and-GK-compatibility-successor',delta_proofs['64b03eff-a967-54a1-ace3-89cb7650a65c'],
    ['de-hb-gym-chemistry-gk','de-hb-gym-chemistry-lk','de-hb-gym-sekii-chemistry-gk','de-hb-gym-sekii-chemistry-lk'],
    'HB source35 has all three historical terms in the shared topic4.2 box; source37 retains official theme choice. B specifically accepted the given-model whole goal in the four precise HB upper-stage GK/LK contexts. No second independent A scope vote is claimed.')

he_a = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE145-327-current-admission-informed-independent-a-20261016-v1/FIRST.two-current-whole-HE-admissions.independent-a.science.frozen.json')
he_b = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE145-327-current-admission-informed-independent-b-20261016-v1/science.FIRST.two-current-primary-admissions.independent-b.json')
he_ra = T/'HE-recycling-final-five-wholes-eight-views-independent-a-v1/FIRST.final-recycling-five-wholes-eight-views.independent-a.science.frozen.json'
he_rb = T/'HE-recycling-five-wholes-eight-views-current-independent-b-v1/FIRST.recycling-five-wholes-eight-views-independent-b.science.json'
for gid, course in [('14577339-9e0c-5b44-8e47-91e1a4947367','gk'),('32705a3a-9b7f-5cc0-ba41-881d13d0c45b','lk')]:
    bi, br = next((i,q) for i,q in enumerate(read(he_b)['currentPrimaryDecisions']) if q['goalId']==gid)
    ri, rr = next((i,q) for i,q in enumerate(read(he_rb)['fiveWholeJudgments']) if q['goalId']==gid)
    proof(gid,'DE-HE','HE-context-only-explicitly-not-whole-admission-release',[
        locator(he_b,f'/currentPrimaryDecisions/{bi}/endpointPurpose',br['endpointPurpose']),
        locator(he_a,'/admissionScience/wholeCourseBoundaryCanBeLegitimate',True),
        locator(he_a,'/contentScience',read(he_a)['contentScience']),
        locator(he_ra,'/twoPrimaryAdmissions',read(he_ra)['twoPrimaryAdmissions']),
        locator(he_rb,f'/fiveWholeJudgments/{ri}',rr)],
        [f'de-he-gym-chemistry-{course}',f'de-he-gym-sekii-chemistry-{course}'],
        'Only legitimacy of explicit DE-HE association for the named bounded Hesse course capstone. Prior REVISE on admission lists and their bounded successors remain accurately represented. This proposal certifies neither current whole prerequisite lists nor complete HE course/source coverage, terminal release or mastery.')

# Assemble the finite current matrix, no normal records are changed.
goals_doc = read(BASE/'inputs/current87-whole-goals.json')
ap_doc = read(BASE/'inputs/current87-existing-applicability-facts.json')
view_doc = read(BASE/'inputs/current87-authored-view-contexts.json')
profile_doc = read(BASE/'inputs/current85-profile-index.json')
registry = read(BASE/'inputs/current-chemistry-override-registry.json')['landscape']['goalApplicabilityOverrides']
goal_map = {g['id']:g for g in goals_doc['goals']}
goal_index = {g['id']:i for i,g in enumerate(goals_doc['goals'])}
ap_map = {g['goalId']:g for g in ap_doc['goals']}
ap_index = {g['goalId']:i for i,g in enumerate(ap_doc['goals'])}
profile_map = {p['goalId']:p for p in profile_doc['records']}
profile_rows = {json.loads(l)['goalId']:json.loads(l) for l in (BASE/'inputs/current85-exact-profile-records.jsonl').read_text().splitlines()}
scope_fields = ['title','titleEn','description','descriptionEn','tags','dimensionTags']
records = []
all_pair_rows = []
for wi, warning in enumerate(ap_doc['findings']):
    gid = warning['goalId']; goal = goal_map[gid]; ext_data = goal.get('extendedData',{})
    override_values = sorted(set(registry.get(gid,{}).get('jurisdiction',[])) | set(ext_data.get('applicabilityOverrides',{}).get('jurisdiction',[])))
    best = min(baseline_goals.get(gid,[]), key=lambda row: sum(goal.get(k)!=row['wholeGoal'].get(k) for k in scope_fields), default=None)
    changed = [k for k in scope_fields if goal.get(k)!=best['wholeGoal'].get(k)] if best else []
    for jur in override_values:
        contexts = [{**q,'sourceContextPointer':f'/contexts/{i}'} for i,q in enumerate(view_doc['contexts']) if q['goalId']==gid and q['scope'].get('jurisdiction')==jur]
        eligible = [q for q in contexts if q['individualFiltersFromExistingAPReportPass']]
        decl = [({'currentGoalPointer':f'/goals/{goal_index[gid]}/extendedData/skillPilotAcquisitionExtensions/{i}',
                  'objectSHA256':objsha(e),'wholeDeclaredScope':e})
                for i,e in enumerate(ext_data.get('skillPilotAcquisitionExtensions',[])) if e.get('jurisdiction')==jur]
        declared_views = sorted({v for e in decl for v in e['wholeDeclaredScope'].get('viewIds',[])})
        actual_views = sorted(q['viewId'] for q in eligible)
        proofs = pair_proofs.get((gid,jur),[])
        holds = []
        if not proofs: holds.append('No exact existing scientific own-scope/context decision located for this current goal/country pair.')
        if not eligible: holds.append('No current authored context passes the individual existing-AP filters.')
        if set(declared_views)-set(actual_views): holds.append('At least one explicitly declared current view is not presently eligible.')
        if changed and gid not in delta_proofs:
            holds.append('Current scoped goal fields differ from the selected reviewed whole-goal input without a specific successor locator: '+','.join(changed))
        profile_successor = profile_successor_proofs.get(gid)
        if profile_successor and profile_map[gid]['profileObjectSHA256'] != profile_successor['expectedCurrentProfileObjectSHA256']:
            holds.append('The current whole profile does not match the exact known targeted successor profile.')
        if not decl and not gid in ['14577339-9e0c-5b44-8e47-91e1a4947367','32705a3a-9b7f-5cc0-ba41-881d13d0c45b']:
            holds.append('No explicit current own-acquisition declaration for this pair.')
        later_projection = [q for q in eligible if q['viewId'] not in declared_views and q['scope'].get('stage')=='SekII']
        terminal = gid in ['14577339-9e0c-5b44-8e47-91e1a4947367','32705a3a-9b7f-5cc0-ba41-881d13d0c45b']
        delta = 'EXACT_EXISTING_SCOPE_FIELDS' if best and not changed else 'BOUNDED_HE_METADATA_CONTEXT_ONLY_WITH_WHOLE_ROUTE_OUT_OF_SCOPE' if terminal else 'SPECIFIC_EXISTING_SUCCESSOR_BOUND'
        rationale = (f'{goal["title"]}: Der konkrete {jur}-Override dokumentiert den eigenen Erwerb in '+', '.join(actual_views)+'. ')
        if proofs:
            rationale += str(proofs[-1].get('existingScientificRationale') or proofs[0].get('existingScientificRationale') or 'Die unten lokalisierten Einzelentscheidungen begründen diesen konkreten Erwerbs-/Kontextumfang.')
        if terminal:
            rationale = f'{goal["title"]}: Ausschließlich die bewusste {jur}-Zuordnung der ausdrücklich benannten begrenzten Kursabschlussaufgabe wird vorgeschlagen. Vorhandene unabhängige Zweck-/Inhaltsurteile tragen diesen Länderkontext; aktuelle ganze Eintrittslisten, amtliche Quellendeckung und HE-Ganzroutenfreigabe werden damit nicht akzeptiert.'
        if gid=='32705a3a-9b7f-5cc0-ba41-881d13d0c45b':
            rationale += ' Das vorhandene Inline-Override erzeugt die Warnung, wird in den endgültigen AP-Fakten aber vollständig durch assessment-requires ersetzt; Annahme beträfe nur diese dokumentierte Altmetadaten-Grenze.'
        row={'goalId':gid,'jurisdiction':jur,'authorDecision':'HOLD' if holds else 'PROPOSE_ACCEPT_BOUNDED_CONTEXT',
            'decisionAuthority':'author_candidate_pending_independent_binding_review',
            'currentGoalObjectSHA256':objsha(goal),'currentProfile':profile_map.get(gid),
            'specificCurrentProfileSuccessorBinding':profile_successor,
            'overrideInputOrigins':([{'source':'registry','value':jur}] if jur in registry.get(gid,{}).get('jurisdiction',[]) else [])+([{'source':'extendedData.applicabilityOverrides','value':jur}] if jur in ext_data.get('applicabilityOverrides',{}).get('jurisdiction',[]) else []),
            'existingFinalAPFact':{'compiledApplicability':ap_map[gid]['compiledApplicability'], 'evidenceForThisCountry':[q for q in ap_map[gid]['evidence'] if q.get('value')==jur]},
            'currentDeclaredScopeObjects':decl,'declaredViewIds':declared_views,'actualEligibleViewIds':actual_views,
            'actualAuthoredViewContexts':contexts,'existingScientificScopeDecisions':proofs,
            'currentScopeDelta':{'verdict':delta,'changedScopeFields':changed,'selectedWholeReviewedBaseline':({'excerptIndex':history_excerpts.index(best),'wholeGoalObjectSHA256':best['wholeGoalObjectSHA256'],'source':best['source'],'jsonPointer':best['jsonPointer']} if best else None),
                'allRelevantHistoricalScopeComparisons':[{'excerptIndex':history_excerpts.index(old),'source':old['source'],'jsonPointer':old['jsonPointer'],
                    'changedFieldsVsThisEarlierInput':[k for k in scope_fields if goal.get(k)!=old['wholeGoal'].get(k)],
                    'disposition':'Specific existing successor locators below, rather than pretending the older whole scope stayed unchanged.' if gid in delta_proofs and any(goal.get(k)!=old['wholeGoal'].get(k) for k in scope_fields) else 'Current scoped goal fields match this actual historical input.' if all(goal.get(k)==old['wholeGoal'].get(k) for k in scope_fields) else 'Older comparison is retained; the selected later baseline supplies the current exact scope.'}
                    for old in baseline_goals.get(gid,[])],
                'specificSuccessorDecisions':delta_proofs.get(gid,[]),
                'additionalNarrowerSekIIProjectionContexts':[q['viewId'] for q in later_projection] if not terminal else [],
                'projectionBoundary':'Additional stage-specific HB view IDs narrow a previously reviewed upper-stage branch; this author proposal asks A to verify same country/course/whole goal, and does not infer a new source duty or accept new content.' if later_projection and not terminal else None},
            'individualRationaleDe':rationale,'holds':holds,'officialWholeSourceCoverageClaim':False,'wholeHETerminalRouteApproval':False,'newDPAMVReview':False,'humanApproval':False}
        all_pair_rows.append(row)
    own_rows=[q for q in all_pair_rows if q['goalId']==gid]
    key='|'.join([warning['code'],warning['landscapeId'],gid,warning.get('dimension',''),warning.get('value','')])
    records.append({'warningOrdinal':wi+1,'warningKey':key,'exactCurrentWarning':warning,
        'authorDecision':'HOLD' if any(q['authorDecision']=='HOLD' for q in own_rows) else 'PROPOSE_ACCEPT_BOUNDED_CONTEXT',
        'currentGoalSnapshot':{'path':rel(BASE/'inputs/current87-whole-goals.json'),'jsonPointer':f'/goals/{goal_index[gid]}','objectSHA256':objsha(goal)},
        'currentNativeProfileBinding':profile_map.get(gid),'currentExistingAPFactPointer':f'/goals/{ap_index[gid]}',
        'exactCurrentOverrideJurisdictions':override_values,'pairOrdinals':[all_pair_rows.index(q)+1 for q in own_rows],
        'individualWarningRationaleDe':f'{goal["title"]}: individuelle Annahme nur für die exakt gebundenen Länder '+', '.join(override_values)+'. Alle Länder-/View-Begründungen und etwaige HOLDs stehen in den referenzierten Paarzeilen. Keine amtliche Quellendeckung, P-Neufreigabe oder ganze HE-Routenfreigabe.',
        'candidateOnly':True})

assert len(records)==87 and len(all_pair_rows)==221
assert len({q['warningKey'] for q in records})==87
assert len({(q['goalId'],q['jurisdiction']) for q in all_pair_rows})==221
write(BASE/'inputs/previous-reviewed-whole-scope-excerpts.json',{'role':'Minimal exact parsed whole-goal excerpts from the actual scientific input packets; no new review library or rewritten historical originals',
    'hashRule':'UTF-8 JSON sorted keys,ensure_ascii=false,compact separators','rows':history_excerpts})
write(BASE/'portable-original-evidence-map.json',{'role':'Directly referenced temporary original evidence copied byte-for-byte. Historical nested path strings are retained, not rewritten. Repository-native evidence is referenced in place.',
    'copies':list({q['original']['path']:q for q in portable_map}.values())})
write(BASE/'existing-evidence-file-index.json',{'role':'Actual existing science/author/input files used by finite locators. No inferred reviewer/model identities.', 'files':list(evidence_files.values())})
counts={'warningKeys':len(records),'goalJurisdictionPairs':len(all_pair_rows),'proposedAcceptKeys':sum(q['authorDecision']!='HOLD' for q in records),
    'holdKeys':sum(q['authorDecision']=='HOLD' for q in records),'proposedAcceptPairs':sum(q['authorDecision']!='HOLD' for q in all_pair_rows),
    'holdPairs':sum(q['authorDecision']=='HOLD' for q in all_pair_rows),'currentOrdinaryProfileRecords':85,
    'viewObjectsReadWithoutCompiler':view_doc['counts']['views'],'byteExactTemporaryOriginalFiles':len({q['original']['path'] for q in portable_map})}
write(BASE/'CANDIDATE.current87-221-warning-context-decisions.json',{
    'schemaVersion':1,'artifactRole':'Finite current applicability-warning author candidate for independent targeted binding review',
    'packageId':'chemie-current450-applicability-warning-binding-author-20261018-v1','createdAtUTC':datetime.now(timezone.utc).isoformat(),
    'authorId':'/root/chemie450_caption1_native_fresh_b','status':'AUTHOR_CANDIDATE_PENDING_INDEPENDENT_BINDING_REVIEW',
    'blindReviewClaim':False,'newScientificReviewerVote':False,'normalRegistration':False,
    'decisionScope':'Only documented legitimacy of the exact current override/context metadata. No official source coverage, whole HE route release, new D/P/A/M/V review, human approval or learner performance.',
    'APV202Policy':'Existing 2241 partial-only diagnostics remain outside acceptance records and are not changed.',
    'source3Boundary':'No source extraction, mapping, source union, source-credit claim or source-course qualifier is changed by this packet.',
    'hashRule':'File sha256 is exact bytes; object SHA256 uses UTF-8 JSON, sorted keys,ensure_ascii=false,compact separators. No formal fingerprint is reconstructed.',
    'currentInputPins':read(BASE/'inputs/current-input-pins.json'),'counts':counts,'warningDecisions':records,'pairDecisions':all_pair_rows,
    'requiredNextStep':'Independent A verifies current exact 87 keys/221 pairs, portable original science locators, scope-specific deltas, current role/filter facts and bounded HE wording. Root alone may separately integrate reviewed decisions. No normal mutation is authorized by this candidate.'})
print(json.dumps(counts))
for q in all_pair_rows:
    if q['holds']:
        print(q['goalId'],q['jurisdiction'],q['holds'])
