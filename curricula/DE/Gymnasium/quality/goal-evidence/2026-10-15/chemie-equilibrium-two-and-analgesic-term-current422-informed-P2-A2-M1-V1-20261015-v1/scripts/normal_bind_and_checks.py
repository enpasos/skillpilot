# SPDX-License-Identifier: Apache-2.0
"""Bound informed science only; private refs, preserved histories, targeted checks."""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import json
import os
import shutil
import subprocess

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
E15 = OWN.parent
REL = OWN.relative_to(REPO).as_posix()
HOST = REPO / 'tmp/chemie-m7-resumed-20261015/equilibrium-P2-A2-rezeptfrei-M1-V1-reference-host-v1'
E0 = 'e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd'
IA = '1a51362e-fd84-5964-89b5-b435772c2149'
F71 = 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528'
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEMANTIC = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
MRECORD = 'records/M422.original421-plus-rezeptfrei-genuine-M1.review.jsonl'
MCONFIG = 'config/M422.whole-ten-scopes.rezeptfrei-M1.config.json'
PCONFIG = 'config/P2.current-image-bound.config.json'
ACONFIG = 'config/A2.current-text.config.json'
ARECORD = 'normal/A2.current-text.review.jsonl'


def now():
    return datetime.now(timezone.utc).isoformat()


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def write(p, d):
    t = p.with_name(p.name + '.partial')
    t.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    os.replace(t, p)


def install(source, alias):
    target = HOST / alias
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)


def run(name, args):
    receipt = OWN / f'checks/{name}.command.actual.json'
    assert not receipt.exists(), receipt
    start = now()
    r = subprocess.run(args, cwd=HOST, capture_output=True)
    (OWN / f'checks/{name}.stdout.actual.txt').write_bytes(r.stdout)
    (OWN / f'checks/{name}.stderr.actual.txt').write_bytes(r.stderr)
    write(receipt, {'argv': args, 'cwd': HOST.relative_to(REPO).as_posix(),
                    'startedAtUTC': start, 'completedAtUTC': now(), 'exitCode': r.returncode})
    print(name, r.returncode, r.stdout.decode(), flush=True)
    assert r.returncode == 0, r.stderr.decode() + r.stdout.decode()


def tsx():
    return ['node', str(REPO / 'app/node_modules/tsx/dist/cli.mjs')]


def context():
    return read(OWN / 'inputs/whole-three-contexts-two-profiles-six-cases.actual.json')


def prepare():
    assert not HOST.exists()
    ctx = context()
    for role in ['P2', 'A2', 'M1', 'V1']:
        s = read(OWN / f'science/FIRST.actual-informed-{role}.seal.json')
        assert s['normalNewRecordsAtSeal'] == s['normalNewFingerprintsAtSeal'] == 0
        for r in s['files']:
            assert ref(REPO / r['path']) == r
    vmap = read(E15 / 'chemie-equilibrium-two-mobile-final-context-independent-V2-20261015-v1/checks/REBUILD.two-PNG-V2.final-minimal-host.json')
    mmap = read(E15 / 'chemie-equilibrium-four-final-wording-memory-informed-20261015-v1/checks/REBUILD.four-M-final.minimal-host.json')
    sources = {r['normalHostAlias']: r['physicalRepositorySource'] for r in vmap['sourceMap']
               if r['normalHostAlias'].startswith(('app/scripts/', 'app/src/', 'scripts/', 'contracts/'))}
    for r in mmap['sourceMap']:
        physical = r['physicalRepositorySource']
        if '/chemie-equilibrium-four-final-wording-memory-informed-' not in physical['path']:
            sources[r['normalHostAlias']] = physical
    sources[CANONICAL], sources[SEMANTIC] = ctx['finalCanonical'], ctx['finalSemantic']
    for alias in ['contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
                  'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
                  'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
                  'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md']:
        sources[alias] = ref(REPO / alias)
    HOST.mkdir(parents=True)
    for alias, physical in sources.items():
        assert ref(REPO / physical['path']) == physical
        install(REPO / physical['path'], alias)
    (HOST / 'app/node_modules').symlink_to(REPO / 'app/node_modules', target_is_directory=True)
    image_aliases = []
    for whole in ctx['wholeContexts']:
        gid = whole['goal']['id']
        image = whole['actualImage']
        assert ref(REPO / image['path']) == image
        link = next(l for l in whole['goal']['resourceLinks'] if l['type'] == 'goal-visualization')
        extension = Path(image['path']).suffix
        for alias in ['app/public' + link['url'], f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}{extension}']:
            target = HOST / alias
            target.parent.mkdir(parents=True, exist_ok=True)
            target.symlink_to(REPO / image['path'])
            image_aliases.append({'normalHostAlias': alias, 'physicalRepositorySource': image, 'readOnlyReference': True})
    write(OWN / 'checks/REBUILD.prebind.reference-host.json', {
        'executionHost': HOST.relative_to(REPO).as_posix(),
        'sourceMap': [{'normalHostAlias': a, 'physicalRepositorySource': p} for a, p in sorted(sources.items())],
        'imageAliases': image_aliases, 'sourceImageCopies': 0, 'newRenders': 0,
        'dependencySymlink': 'app/node_modules', 'normalChecksExecutedAtPreparation': 0})


def bind():
    ctx = context()
    assert not (OWN / 'BINDING.informed-P2-A2-M1-V1.actual.json').exists()
    run('P2.fingerprint-binding', tsx() + [str(OWN / 'scripts/bind_P2.mts'), str(REPO), str(HOST), str(OWN)])
    for p in [OWN / PCONFIG, OWN / 'normal/P2.actual-informed.run.json', OWN / 'normal/P2.current-image-bound.E1G1.ai-candidates.jsonl']:
        install(p, p.relative_to(REPO).as_posix())
    a_first = read(OWN / 'science/FIRST.actual-informed-A2.original.json')
    records = []
    for d in a_first['decisions']:
        records.append({'schemaVersion': 1, 'reviewId': 'chemie-equilibrium-two-current-final-informed-A2-20261015-v1',
                        'ruleVersion': 'semantic-atomicity-v1',
                        'landscapeId': read(REPO / ctx['finalCanonical']['path'])['landscapeId'],
                        'goalId': d['goalId'], 'fingerprint': 'pending-sealed-science-stock-binding',
                        'status': d['status'], 'semanticAtomic': d['semanticAtomic'],
                        'reviewedAt': a_first['completedAtUTC'], 'reviewer': 'Codex C informed A2 of final wording; not description author',
                        'reason': d['reason'] + ' Kern: ' + d['competenceCore'] + ' Prärequisiten: ' + d['prerequisiteApplication'] + ' Transfergrenze: ' + d['transferBoundary']})
    (OWN / ARECORD).write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
    a_config = {'schemaVersion': 1, 'reviewId': records[0]['reviewId'], 'ruleVersion': records[0]['ruleVersion'],
                'landscapeId': records[0]['landscapeId'], 'landscapePath': CANONICAL,
                'reviewPath': REL + '/' + ARECORD,
                'scope': {'label': 'Only e0/1a bounded final competence cores; no source/course clearance', 'leafGoalIds': [E0, IA]}}
    write(OWN / ACONFIG, a_config)
    install(OWN / ARECORD, REL + '/' + ARECORD)
    install(OWN / ACONFIG, REL + '/' + ACONFIG)
    run('A2.stock-fingerprint-binding', tsx() + ['app/scripts/semanticAtomicityReview.ts', '--config=' + REL + '/' + ACONFIG, '--write-fingerprints'])
    writer_a = (HOST / (REL + '/' + ARECORD)).read_bytes()
    (OWN / 'checks/A2.stock-fingerprint-writer.original.jsonl').write_bytes(writer_a)
    bound_a = [json.loads(l) for l in writer_a.decode().splitlines()]
    assert len(bound_a) == 2
    for a, b in zip(records, bound_a):
        assert {k: v for k, v in a.items() if k != 'fingerprint'} == {k: v for k, v in b.items() if k != 'fingerprint'}
    (OWN / ARECORD).write_bytes(writer_a)
    m_first = read(OWN / 'science/FIRST.actual-informed-M1.original.json')
    m_decision = m_first['decisions'][0]
    original_m = REPO / ctx['M422Baseline']['path']
    assert ref(original_m) == ctx['M422Baseline']
    original_lines = original_m.read_text().splitlines(keepends=True)
    selected_lines = []
    for line in original_lines:
        old = json.loads(line)
        if old['goalId'] != F71:
            selected_lines.append(line)
        else:
            assert old == m_decision['wholePriorMDecision']
            new = {**old, 'fingerprint': 'pending-sealed-science-stock-binding',
                   'status': m_decision['status'], 'memoryUseful': m_decision['memoryUseful'],
                   'reviewedAt': m_first['completedAtUTC'],
                   'reviewer': 'Codex C informed genuine rezeptfrei one-term Memory review',
                   'reason': m_decision['reason'], 'firstScienceSeal': ref(OWN / 'science/FIRST.actual-informed-M1.seal.json')}
            selected_lines.append(json.dumps(new, ensure_ascii=False, separators=(',', ':')) + '\n')
    assert len(original_lines) == len(selected_lines) == 422
    (OWN / MRECORD).write_text(''.join(selected_lines))
    (OWN / 'records/M422.before-stock-binding.original.jsonl').write_bytes((OWN / MRECORD).read_bytes())
    old_config_path = E15 / 'chemie-equilibrium-four-final-wording-memory-informed-20261015-v1/config/M422.whole-ten-scopes.four-final-wording.config.json'
    m_config = read(old_config_path)
    m_config['reviewPath'] = REL + '/' + MRECORD
    m_config['reportPath'] = REL + '/checks/M422.report.not-written.md'
    write(OWN / MCONFIG, m_config)
    install(OWN / MCONFIG, REL + '/' + MCONFIG)
    install(OWN / MRECORD, m_config['reviewPath'])
    run('M1.stock-fingerprint-binding', tsx() + ['app/scripts/memoryCardReview.ts', '--config=' + REL + '/' + MCONFIG, '--mode=report', '--write-fingerprints'])
    private_record = HOST / m_config['reviewPath']
    writer_m = private_record.read_bytes()
    (OWN / 'checks/M422.stock-fingerprint-writer.unselected-original.jsonl').write_bytes(writer_m)
    by_id = {json.loads(l)['goalId']: (l, json.loads(l)) for l in writer_m.decode().splitlines(keepends=True)}
    before = {json.loads(l)['goalId']: json.loads(l) for l in selected_lines}
    final_lines = []
    for line in original_lines:
        old = json.loads(line)
        new_line, bound = by_id[old['goalId']]
        if old['goalId'] == F71:
            expected = before[F71].copy()
            expected['fingerprint'] = bound['fingerprint']
            assert expected == bound
            final_lines.append(new_line)
        else:
            assert old == bound, ('unexpected non-target M fingerprint/science change', old['goalId'])
            final_lines.append(line)
    assert sum(a == b for a, b in zip(original_lines, final_lines)) == 421
    (OWN / MRECORD).write_text(''.join(final_lines))
    private_record.write_bytes((OWN / MRECORD).read_bytes())
    cards = REPO / m_config['cardReviewPath']
    private_cards = HOST / m_config['cardReviewPath']
    writer_cards = private_cards.read_bytes()
    (OWN / 'checks/cards75.stock-writer.unselected-original.jsonl').write_bytes(writer_cards)
    assert [json.loads(l) for l in writer_cards.decode().splitlines()] == [json.loads(l) for l in cards.read_text().splitlines()]
    private_cards.write_bytes(cards.read_bytes())
    v_first = read(OWN / 'science/FIRST.actual-informed-V1.original.json')
    v_decision = v_first['decisions'][0]
    goal = next(g['goal'] for g in ctx['wholeContexts'] if g['goal']['id'] == F71)
    image = v_decision['actualPNG']
    normal_row = {**v_decision['wholePriorVRecord'], 'title': goal['title'], 'description': goal['description'],
                  'landscapePath': CANONICAL,
                  'aiReviewedAt': v_first['completedAtUTC'],
                  'aiReviewer': 'Codex C informed one-term actual final context V1 addendum; unchanged PNG',
                  'aiNotes': v_decision['reason'] + ' FIRST ' + ref(OWN / 'science/FIRST.actual-informed-V1.original.json')['sha256']}
    assert normal_row['assetSha256'] == image['sha256'] and normal_row['aiApproved'] == 'yes'
    normal_v = {'schemaVersion': 1, 'subject': 'chemie',
                'source': {'canonicalRoot': 'curricula/DE/Gymnasium/canonical', 'publicAssetRoot': 'app/public/assets/goal-visualizations'},
                'records': [normal_row]}
    write(OWN / 'qa/V1.rezeptfrei-context.normal-alias.qa.json', normal_v)
    physical_row = {**normal_row, 'landscapePath': ctx['finalCanonical']['path'],
                    'canonicalAssetPath': image['path'], 'publicAssetPath': image['path']}
    write(OWN / 'qa/V1.rezeptfrei-context.physical-transport.qa.json',
          {**normal_v, 'source': {'canonicalRoot': str(Path(ctx['finalCanonical']['path']).parent),
                                'publicAssetRoot': str(Path(image['path']).parents[2])}, 'records': [physical_row]})
    qa_old = read(REPO / ctx['V438Baseline']['path'])
    assert ref(REPO / ctx['V438Baseline']['path']) == ctx['V438Baseline']
    qa_new = {**qa_old, 'records': [normal_row if r['goalId'] == F71 else r for r in qa_old['records']]}
    assert len(qa_new['records']) == 438
    assert sum(a == b for a, b in zip(qa_old['records'], qa_new['records'])) == 437
    write(OWN / 'qa/QA438.original437-plus-rezeptfrei-context-V1.candidate.json', qa_new)
    write(OWN / 'BINDING.informed-P2-A2-M1-V1.actual.json', {
        'boundAtUTC': now(), 'role': 'Only normal binding of four separately sealed informed science roles',
        'finalCanonical': ctx['finalCanonical'], 'finalSemantic': ctx['finalSemantic'],
        'FIRSTSeals': [ref(OWN / f'science/FIRST.actual-informed-{r}.seal.json') for r in ['P2', 'A2', 'M1', 'V1']],
        'P2Records': ref(OWN / 'normal/P2.current-image-bound.E1G1.ai-candidates.jsonl'),
        'A2Records': ref(OWN / ARECORD), 'M422Records': ref(OWN / MRECORD),
        'V1NormalQA': ref(OWN / 'qa/V1.rezeptfrei-context.normal-alias.qa.json'),
        'V1PhysicalTransportQA': ref(OWN / 'qa/V1.rezeptfrei-context.physical-transport.qa.json'),
        'QA438Candidate': ref(OWN / 'qa/QA438.original437-plus-rezeptfrei-context-V1.candidate.json'),
        'unchanged75Cards': ref(cards), 'original421MRawLinesExact': True, 'other437WholeQAObjectsExact': True,
        'originalProfiles2WholeBodiesExact': True, 'physicalTransportAddsVotes': 0,
        'newDOrSourceCourseHumanApproval': False, 'activeWrites': 0})


def check():
    run('P2.stock-check.after-id-correction', tsx() + ['app/scripts/positiveGoalEvidenceReview.ts', '--config=' + REL + '/' + PCONFIG, '--mode=check'])
    run('A2.stock-check', tsx() + ['app/scripts/semanticAtomicityReview.ts', '--config=' + REL + '/' + ACONFIG, '--mode=check'])
    run('V1.targeted-stock-helper', tsx() + [str(OWN / 'scripts/check_V1.mts'), str(REPO), str(HOST), str(OWN)])
    run('M422.whole422-ten-views-check', tsx() + ['app/scripts/memoryCardReview.ts', '--config=' + REL + '/' + MCONFIG, '--mode=check'])
    ctx = context()
    original = (REPO / ctx['M422Baseline']['path']).read_text().splitlines(keepends=True)
    current = (OWN / MRECORD).read_text().splitlines(keepends=True)
    assert len(original) == len(current) == 422
    assert sum(a == b for a, b in zip(original, current)) == 421
    for gid in ['13838147-c26d-54ca-b9be-5f2f0b8e9de5', '6d3a2bad-8c67-5964-a720-375f138adaba', E0, IA]:
        assert next(l for l in original if json.loads(l)['goalId'] == gid) == next(l for l in current if json.loads(l)['goalId'] == gid)
    mapping = read(OWN / 'checks/REBUILD.prebind.reference-host.json')
    sources = {r['normalHostAlias']: r['physicalRepositorySource'] for r in mapping['sourceMap']}
    for p in [OWN / PCONFIG, OWN / ACONFIG, OWN / MCONFIG,
              OWN / 'normal/P2.actual-informed.run.json',
              OWN / 'normal/P2.current-image-bound.E1G1.ai-candidates.jsonl', OWN / ARECORD, OWN / MRECORD]:
        sources[p.relative_to(REPO).as_posix()] = ref(p)
    for a, r in sources.items():
        assert (HOST / a).read_bytes() == (REPO / r['path']).read_bytes()
    regular = [p for p in HOST.rglob('*') if p.is_file() and not p.is_symlink()]
    assert len(regular) == len(sources)
    size = sum(p.stat().st_size for p in regular)
    assert size < 8 * 1024 * 1024
    write(OWN / 'checks/REBUILD.final.reference-host.physical-map.json', {
        **mapping, 'sourceMap': [{'normalHostAlias': a, 'physicalRepositorySource': p} for a, p in sorted(sources.items())],
        'regularFileCount': len(regular), 'regularBytes': size,
        'successfulStockChecks': {'P2': 1, 'A2': 1, 'V1targeted': 1, 'M422tenViews': 1},
        'fullSchemaOrCentralExecuted': False, 'activeWrites': 0})
    write(OWN / 'checks/FINAL.actual-role-checks-and-preservation.json', {
        'completedAtUTC': now(), 'P2': '2 E1/G1 ai_candidate / needs_human_review', 'A2': '2 atomic/true',
        'f71M1': 'genuine no_memory_needed/false', 'f71V1': 'accepted limited exact-PNG context addendum',
        'allFourFinalTargetedChecksExit0': True, 'originalFailedP2IdentifierAttemptPreserved': True,
        'P2FailedAttempts': 1, 'P2SuccessfulChecks': 1, 'wholeMGoals': 422, 'MVisibilityScopes': 10,
        'other421MRawLinesExact': True, 'cards75BytesExact': True,
        'genuine138CarbonylOtherAndE0IA_MRowsRetained': True, 'other437WholeQAObjectsExact': True,
        'actualProfileBodies2Exact': True, 'newRenders': 0, 'sourceImageCopies': 0,
        'sourceCourseDissentResolved': False, 'newDVotes': 0, 'humanApproval': False,
        'humanTrial': False, 'M7Grant': False, 'centralRuns': 0, 'activeWrites': 0})
    print(json.dumps({'allFourChecks': 0, 'P2': 2, 'A2': 2, 'M1': 1, 'V1': 1,
                      'other421MRawLinesExact': True, 'other437WholeQAObjectsExact': True,
                      'sourceImagesCopied': 0, 'hostRegularBytes': size}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('stage', choices=['prepare', 'bind', 'check'])
    stage = parser.parse_args().stage
    {'prepare': prepare, 'bind': bind, 'check': check}[stage]()
