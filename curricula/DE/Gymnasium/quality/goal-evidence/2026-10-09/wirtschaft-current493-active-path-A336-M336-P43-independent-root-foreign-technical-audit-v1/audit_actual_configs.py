#!/usr/bin/env python3
"""Independent bounded adapter audit. Writes only this audit's additive artifacts."""
import collections
import difflib
import hashlib
import json
from pathlib import Path
import subprocess
import sys
from datetime import datetime, timezone

REPO = Path.cwd()
OUT = Path(__file__).resolve().parent
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/current493-active-path-A336-M336-P43-technical-adapter-author-v1'
ACTIVE_ROOT = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current493-reviewed-20261009-v1/'
CAN_TARGET = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
SEM_TARGET = ACTIVE_ROOT + 'wirtschaftswissenschaften.semantic-kinds.json'
errors = []

def require(condition, detail):
    if not condition:
        errors.append(detail)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def load(path):
    return json.loads(Path(path).read_bytes())

def fielddiff(old, new, pointer=''):
    if isinstance(old, dict) and isinstance(new, dict):
        result = []
        for k in sorted(old.keys() | new.keys()):
            at = pointer + '/' + k.replace('~', '~0').replace('/', '~1')
            if k not in old or k not in new:
                result.append({'jsonPointer': at, 'before': old.get(k), 'after': new.get(k), 'missingSide': 'before' if k not in old else 'after'})
            else:
                result.extend(fielddiff(old[k], new[k], at))
        return result
    if isinstance(old, list) and isinstance(new, list) and len(old) == len(new):
        return [x for i, (a, b) in enumerate(zip(old, new)) for x in fielddiff(a, b, pointer+'/'+str(i))]
    return [] if old == new else [{'jsonPointer': pointer, 'before': old, 'after': new}]

def input_hashes(manifest):
    result = []
    for path, expected in manifest['inputBeforeAfterExact'].items():
        data = (REPO/path).read_bytes()
        current = {'path': path, 'sha256': sha(data), 'bytes': len(data)}
        require(current['sha256'] == expected['sha256'] and current['bytes'] == expected['bytes'], '121 input binding drift: '+path)
        result.append(current)
    return result

handoff = load(AUTHOR/'actual-final-A336-M336-P43-active-path-only-technical-adapter.handoff.receipt.json')
final_can = load(REPO/handoff['finalCAN493']['path'])
goal_by_id = {g['id']: g for g in final_can['goals']}

def native_scope_goal_ids(config, lane):
    scope = config['scope']
    if lane == 'P':
        return set(scope['goalIds'])
    explicit = scope.get('leafGoalIds', [])
    if explicit:
        selected = set(explicit)
    else:
        selected = set()
        def visit(goal_id):
            if goal_id in selected or goal_id not in goal_by_id:
                return
            selected.add(goal_id)
            for child in goal_by_id[goal_id].get('contains', []):
                visit(child)
        for root_id in scope.get('rootGoalIds', []):
            visit(root_id)
    if lane == 'M':
        # Same current native isLeaf/isReviewRelevantGoal rules as memoryCardReview.ts.
        def relevant(goal_id):
            g = goal_by_id[goal_id]
            tags = g.get('tags', [])
            memory = g.get('nodeKind') == 'memory' or 'memorization' in tags or any(t.startswith('srs-deck:') for t in tags)
            return not g.get('contains') and not any(t in tags for t in ['Practice','Assessment','Motivation','Orientation']) and not memory and not g.get('examData')
        return {goal_id for goal_id in selected if relevant(goal_id)}
    return selected
declared = load(AUTHOR/'actual45-active-path-only-configurations-individual-exact-field-and-raw-line-deltas.json')
manifest = load(AUTHOR/'actual45-active-path-only-configs-qualified-input-whole-byte-manifest.json')
lineage = load(AUTHOR/'actual43-qualified-positive-review-groups-raw-lines-and685-case-preservation.index.json')
before = input_hashes(manifest)
require(len(before) == 121, 'input binding count is not 121')
rows = declared['configurations']
require(len(rows) == 45, 'configuration index count is not 45')
require(collections.Counter(r['lane'] for r in rows) == {'A': 1, 'M': 1, 'P': 43}, 'lane counts differ from A1/M1/P43')
discovered = {str(p.relative_to(REPO)) for p in AUTHOR.rglob('*.config.json')}
require(discovered == {r['candidateConfigPath'] for r in rows}, 'exact 45 config file set differs')
require(len({r['candidateConfigPath'] for r in rows}) == 45, 'duplicate candidate config path')
require(len({r['proposedActiveTargetPath'] for r in rows}) == 45, 'duplicate active target path')
config_results = []
actual_deltas = collections.Counter()
all_p_rows = []
all_p_raw = {}
review_reads = {}
native_p_root = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/current-V13-native-positive-config-groups-v1/'
for r in rows:
    oldbytes = (REPO/r['originalConfigPath']).read_bytes()
    newbytes = (REPO/r['candidateConfigPath']).read_bytes()
    old = json.loads(oldbytes)
    new = json.loads(newbytes)
    require(sha(oldbytes) == r['originalConfigSha256'], 'original config digest drift: '+r['originalConfigPath'])
    require(sha(newbytes) == r['candidateConfigSha256'], 'candidate config digest drift: '+r['candidateConfigPath'])
    diff = fielddiff(old, new)
    lane = r['lane']
    expected = {'/landscapePath': CAN_TARGET}
    if lane == 'P':
        expected['/semanticKindLedgerPath'] = SEM_TARGET
        number = Path(r['candidateConfigPath']).name.split('.')[0]
        require(r['originalConfigPath'] == native_p_root+number+'.positive-current-native.inert.config.json', 'P baseline is not exact corresponding V13 original')
    if lane == 'M':
        expected.update({'/reportPath': ACTIVE_ROOT+'wirtschaftswissenschaften.memory336-current-national-report.md', '/visibilityScopes/0/viewPath': 'curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-gk.view.json', '/visibilityScopes/1/viewPath': 'curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-lk.view.json'})
    require({x['jsonPointer']: x['after'] for x in diff} == expected, 'unexpected actual JSON changes: '+r['candidateConfigPath'])
    require(diff == r['fields'], 'author field delta description differs from actual JSON diff: '+r['candidateConfigPath'])
    patched = oldbytes
    for d in diff:
        oldtoken = json.dumps(d['before'], ensure_ascii=False).encode()
        newtoken = json.dumps(d['after'], ensure_ascii=False).encode()
        require(patched.count(oldtoken) == 1, 'path value is not unique raw byte token: '+r['candidateConfigPath']+d['jsonPointer'])
        patched = patched.replace(oldtoken, newtoken, 1)
    require(patched == newbytes, 'nonpath raw bytes changed: '+r['candidateConfigPath'])
    oldlines, newlines = oldbytes.splitlines(keepends=True), newbytes.splitlines(keepends=True)
    unchanged = b''.join(a for a,b in zip(oldlines, newlines) if a == b)
    require(len(oldlines) == len(newlines), 'raw line count changed')
    require(sha(unchanged) == r['unchangedRawLinesSha256'], 'actual unchanged raw line digest differs from index')
    target = ACTIVE_ROOT + str(Path(r['candidateConfigPath']).relative_to(AUTHOR.relative_to(REPO)))
    require(target == r['proposedActiveTargetPath'], 'active target is not exact retained candidate-relative path')
    actual_deltas[lane] += len(diff)
    review = new['reviewPath']
    require(review == old['reviewPath'], 'evidence ledger path changed')
    rb = (REPO/review).read_bytes()
    review_reads[review] = {'sha256': sha(rb), 'bytes': len(rb)}
    records = [json.loads(line) for line in rb.splitlines() if line.strip()]
    scopeids = native_scope_goal_ids(new, lane)
    require(len(scopeids) == len(set(scopeids)), 'duplicate scope ids')
    require(set(scopeids) == {x['goalId'] for x in records}, 'scope does not equal whole evidence ledger')
    require(all(x['reviewId'] == new['reviewId'] for x in records), 'review ID differs between native config and ledger')
    if lane in ('A','M'):
        require('semanticKindLedgerPath' not in new, 'unsupported SEM field introduced in A/M')
    if lane == 'M':
        cp = new['cardReviewPath']
        require(cp == old['cardReviewPath'], 'card ledger path changed')
        cb = (REPO/cp).read_bytes()
        review_reads[cp] = {'sha256': sha(cb), 'bytes': len(cb)}
        cards = [json.loads(line) for line in cb.splitlines() if line.strip()]
        require(collections.Counter(x['status'] for x in records) == {'memory_required':65,'no_memory_needed':271}, 'M336 native status counts differ')
        require(new['visibilityScopeCoverageRequired'] is True, 'M visibility coverage weakened')
    if lane == 'P':
        all_p_rows.extend(records)
        for line in rb.splitlines(keepends=True):
            if line.strip():
                goalid = json.loads(line)['goalId']
                require(goalid not in all_p_raw, 'duplicate P whole goal ID')
                all_p_raw[goalid] = line
    config_results.append({'lane':lane,'originalConfigPath':r['originalConfigPath'],'originalConfigSha256Actual':sha(oldbytes),'candidateConfigPath':r['candidateConfigPath'],'candidateConfigSha256Actual':sha(newbytes),'proposedActiveTargetPath':target,'actualJsonFieldDeltas':diff,'unchangedRawLinesSha256Actual':sha(unchanged),'exactOriginalBytesAfterOnlyAllowedPathTokens':patched == newbytes})
require(dict(actual_deltas) == {'A':1,'M':4,'P':86}, 'actual path field delta totals differ from A1 M4 P86')
require(sum(actual_deltas.values()) == 91, 'total actual path field delta count is not 91')
require(len(all_p_rows) == 336, 'P record count differs from 336')
cases = sum(len(x['profile']['applicationCaseBriefs']) for x in all_p_rows)
require(cases == 685, 'P case count differs from 685')
baseline_whole = native_p_root.rsplit('/current-V13-native-positive-config-groups-v1/',1)[0]+'/whole-P336-only-two-current-reviewed-requires-input-fingerprint-successors.jsonl'
whole_raw = {json.loads(line)['goalId']: line for line in (REPO/baseline_whole).read_bytes().splitlines(keepends=True) if line.strip()}
require(len(whole_raw) == 336 and whole_raw == all_p_raw, 'grouped P whole raw rows differ from qualified V13 whole P336 ledger')
group_results = []
require(len(lineage['groups']) == 43, 'lineage group count differs')
for g in lineage['groups']:
    config = load(REPO/g['originalConfigPath'])
    require(config['reviewPath'] == g['reviewPath'], 'lineage is bound to a different native review path')
    data = (REPO/g['reviewPath']).read_bytes()
    lines = [x for x in data.splitlines(keepends=True) if x.strip()]
    parsed = [json.loads(x) for x in lines]
    count = sum(len(x['profile']['applicationCaseBriefs']) for x in parsed)
    require(sha(data) == g['reviewWholeBytesSha256'], 'whole P evidence bytes drift')
    require([sha(x) for x in lines] == g['rawLineSha256s'], 'P raw evidence line digest drift')
    require(len(lines) == g['records'] and count == g['caseCount'], 'P evidence group actual counts differ')
    group_results.append({'group':g['group'],'reviewPath':g['reviewPath'],'sha256Actual':sha(data),'rawLineSha256sActual':[sha(x) for x in lines],'actualRecords':len(lines),'actualCases':count})
sem = load(REPO/handoff['finalClosedSEM493']['path'])
atomic = {x['goalId'] for x in sem['decisions'] if x['semanticKind'] == 'curricularAtomic' and x['decisionStatus']=='authoritative'}
require(len(atomic)==336 and atomic == set(all_p_raw), 'finalSEM336 and P336 whole IDs differ')
for r in (x for x in rows if x['lane'] in ('A', 'M')):
    config = load(REPO/r['candidateConfigPath'])
    require(native_scope_goal_ids(config, r['lane']) == atomic, 'A/M336 native resolved scope differs from final authoritative SEM336')
for obj in handoff['candidateConfigs']:
    data = (REPO/obj['path']).read_bytes()
    require(len(data) == obj['bytes'] and sha(data) == obj['sha256'], 'handoff candidate file binding drift')
require(handoff['candidateConfigs']==manifest['candidateConfigs'], 'manifest and handoff candidate bindings differ')
require({x['path'] for x in handoff['candidateConfigs']} == discovered, 'handoff exact file set differs')
pending = []
for x in manifest['pendingActiveInputs']:
    candidate = (REPO/x['exactCandidatePath']).read_bytes()
    require(sha(candidate)==x['sha256'], 'future input candidate binding drift: '+x['path'])
    target = REPO/x['path']
    pending.append({**x,'candidateSha256Actual':sha(candidate),'activeTargetPresent':target.is_file(),'activeTargetAlreadyExact':target.is_file() and target.read_bytes()==candidate})
after = input_hashes(manifest)
require(before == after, 'audit-time input drift')
result = {'documentType':'independent-root-foreign-bounded-technical-adapter-audit','writtenAtUtc':datetime.now(timezone.utc).isoformat(),'reviewerRole':'independent technical adapter reviewer, not adapter author or curriculum scientific reviewer','scope':'Actual native original/candidate JSON and raw byte differences; closed P native schemas run separately; historical files read-only','configurationCountActual':len(rows),'actualFieldDeltaCounts':dict(actual_deltas),'actualTotalFieldDeltaCount':sum(actual_deltas.values()),'inputBindingCountActual':len(before),'inputBindingsReadBeforeAndAfter':before,'configurationsActual':config_results,'positiveGroupsActual':group_results,'evidenceLedgersActual':review_reads,'P336StatusAuthorityEvidenceClaimCountsActual':{'status':dict(collections.Counter(x['status'] for x in all_p_rows)),'reviewAuthority':dict(collections.Counter(x['reviewAuthority'] for x in all_p_rows)),'evidenceLevel':dict(collections.Counter(x['evidenceLevel'] for x in all_p_rows)),'maximumClaimScope':dict(collections.Counter(x['maximumClaimScope'] for x in all_p_rows))},'P336WholeRawLinesEqualQualifiedV13WholeLedger':whole_raw==all_p_raw,'P336CaseCountActual':cases,'finalAuthoritativeCurricularAtomicCountActual':len(atomic),'pendingActiveInputsActual':pending,'activeTargetPathsExact':[x['proposedActiveTargetPath'] for x in config_results],'scientificApproval':False,'humanRelease':False,'activeIntegration':False,'strictNetGainClaim':0,'errors':errors,'technicalJsonByteAuditPassed':not errors}
(OUT/'actual-json-byte-input-bindings.audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'configs':len(rows),'actualPathDeltas':dict(actual_deltas),'inputBindings':len(before),'PwholeRecords':len(all_p_rows),'Pcases':cases,'errors':errors,'passed':not errors},ensure_ascii=False))
sys.exit(bool(errors))
