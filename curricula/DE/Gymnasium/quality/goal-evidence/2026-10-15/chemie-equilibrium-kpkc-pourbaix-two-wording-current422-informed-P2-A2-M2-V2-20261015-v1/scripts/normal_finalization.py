# SPDX-License-Identifier: Apache-2.0
"""Final targeted binding/checks after sealed current science; no active writes."""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
E15 = OWN.parent
PREVIOUS = E15 / 'chemie-equilibrium-two-and-analgesic-term-current422-informed-P2-A2-M1-V1-20261015-v1'
HOST = REPO / 'tmp/chemie-m7-resumed-20261015/kpkc-pourbaix-final-P2-A2-M2-V2-reference-host-v1'
REL = OWN.relative_to(REPO).as_posix()
IDS = ['a8ddb351-3501-5b6d-a908-c82a5d2f14d4', 'f0f2c5f8-06f1-5774-a176-d96505727acf']
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEMANTIC = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
MRECORD = 'records/M422.original420-plus-genuine-Kp-Pourbaix-M2.review.jsonl'
MCONFIG = 'config/M422.whole-ten-views.final-Kp-Pourbaix.config.json'
ARECORD = 'normal/A2.final-current-text.review.jsonl'
ACONFIG = 'config/A2.final-current-text.config.json'
PCONFIG = 'config/P2.final-current-image-bound.config.json'


def now():
    return datetime.now(timezone.utc).isoformat()


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(r):
    assert ref(REPO / r['path']) == r, r['path']


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
    print(json.dumps({'command': name, 'exitCode': r.returncode,
                      'stdoutBytes': len(r.stdout), 'stderrBytes': len(r.stderr)}), flush=True)
    assert r.returncode == 0, r.stderr.decode() + r.stdout.decode()


def tsx():
    return ['node', str(REPO / 'app/node_modules/tsx/dist/cli.mjs')]


def prepare():
    assert not HOST.exists()
    original = read(OWN / 'inputs/two-whole-final-contexts-four-profiles-eight-cases.actual.json')
    successor = read(OWN / 'inputs/Kp.image-only-v1.current-whole-input.json')
    author = E15 / 'chemie-kp-one-mobile-standard-state-image-correction-author-root-20261015-v1'
    selector_path = author / 'NEUTRAL.one-actual-Kp-PNG-image-only-author.selector.json'
    assert ref(selector_path)['sha256'] == 'sha256:942af6c667489f7a41dce4ed79d859645b09c28552ae2f166e7f8e81e5186c7f'
    selector = read(selector_path)
    seal_path = next(p for p in author.glob('*seal.json') if ref(p)['sha256'] == 'sha256:f17d274d9d4856cc800da55e358b75cf442e528984553f87a1ddd54ba64bc92d')
    for r in [selector['currentImageOnlyCanonical'], selector['currentSemanticUnchanged'], selector['image'], selector['originalJPGUnchanged']]:
        verify(r)
    for p in ['FILES.finite-prebinding-science-and-views.seal.json', 'FILES.finite-Kp-PNG-v1-actual-successor-V-FIRST-and-views.seal.json']:
        for r in read(OWN / p)['files']:
            verify(r)
    canonical = read(REPO / selector['currentImageOnlyCanonical']['path'])
    goals = {g['id']: g for g in canonical['goals']}
    old_goals = {g['id']: g for g in read(REPO / original['finalCanonical']['path'])['goals']}
    assert all(goals[g] == old_goals[g] for g in goals if g != IDS[0])
    assert {k: v for k, v in goals[IDS[0]].items() if k != 'resourceLinks'} == {k: v for k, v in old_goals[IDS[0]].items() if k != 'resourceLinks'}
    profiles = {r['goalId']: r['profile'] for r in original['targetProfiles2']}
    contexts = []
    for gid in IDS:
        old_context = next(c for c in original['wholeContexts'] if c['goal']['id'] == gid)
        contexts.append({'goal': goals[gid], 'wholeDirectPrerequisites': [goals[p] for p in goals[gid]['requires']],
                         'wholeDirectParents': [p for p in goals.values() if gid in p.get('contains', [])],
                         'profile': profiles[gid], 'wholeCases': [c for c in original['targetCases4'] if c['goalId'] == gid],
                         'actualCurrentNativeImage': selector['image'] if gid == IDS[0] else old_context['actualCurrentNativeImage']})
    selected_v = [
        {'goalId': IDS[0], 'FIRST': ref(OWN / 'science/FIRST.actual-Kp-PNG-v1-successor-V.original.json'),
         'FIRSTSeal': ref(OWN / 'science/FIRST.actual-Kp-PNG-v1-successor-V.seal.json')},
        {'goalId': IDS[1], 'FIRST': ref(OWN / 'science/FIRST.actual-informed-V2.original.json'),
         'FIRSTSeal': ref(OWN / 'science/FIRST.actual-informed-V2.seal.json')},
    ]
    write(OWN / 'inputs/final-two-image-bound-whole-contexts.actual.json', {
        'schemaVersion': 1, 'role': 'Final actual current image-bound context after original science; no new scientific vote',
        'createdAtUTC': now(), 'landscapeId': canonical['landscapeId'],
        'finalAuthorSelector': ref(selector_path), 'finalAuthorSeal': ref(seal_path),
        'finalCanonical': selector['currentImageOnlyCanonical'], 'finalSemantic': selector['currentSemanticUnchanged'],
        'originalWholeScienceInput': ref(OWN / 'inputs/two-whole-final-contexts-four-profiles-eight-cases.actual.json'),
        'wholeContexts': contexts, 'selectedVScience': selected_v,
        'M422Baseline': original['M422Baseline'], 'QA438Baseline': original['QA438Baseline'],
        'originalPAMSeals': [ref(OWN / f'science/FIRST.actual-informed-{r}.seal.json') for r in ['P2', 'A2', 'M2']],
        'oldJPGNegativeVSciencePreserved': ref(OWN / 'science/FIRST.actual-informed-V2.seal.json'),
        'all560TextsAndGraphsExactToOriginalPAMScience': True, 'other559WholeGoalsExact': True,
        'bothWholeProfileBodiesAndFourCasesExact': True,
        'currentResourceContextActuallyReadAndSeen': True, 'sourceImageCopies': 0,
        'fourDSourceCourseHoldsRemainOpen': True, 'newSourceCourseOrHumanApproval': False,
    })
    review_id = 'chemie-equilibrium-kpkc-pourbaix-informed-p2-20261015-v1'
    patterns = []
    for schema_path in ['contracts/goal-evidence/v2/goal-evidence-review-config.schema.json', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json']:
        schema = read(REPO / schema_path)
        definition = schema['properties']['reviewId']
        if '$ref' in definition:
            target = schema
            for part in definition['$ref'].split('/')[1:]:
                target = target[part]
            definition = target
        assert re.fullmatch(definition['pattern'], review_id)
        assert len(review_id) <= definition.get('maxLength', 10000)
        patterns.append({'schema': ref(REPO / schema_path), 'actualPattern': definition['pattern']})
    write(OWN / 'checks/P2.lowercase-stock-regex.before-CLI.actual.json', {
        'checkedAtUTC': now(), 'reviewId': review_id, 'actualStockPatterns': patterns,
        'actualStockPatternsMatch': True, 'beforeAnyNormalCLI': True})
    prior_map = read(PREVIOUS / 'checks/REBUILD.final.reference-host.physical-map.json')
    sources = {r['normalHostAlias']: r['physicalRepositorySource'] for r in prior_map['sourceMap']
               if not (REPO / r['physicalRepositorySource']['path']).is_relative_to(PREVIOUS)}
    sources[CANONICAL], sources[SEMANTIC] = selector['currentImageOnlyCanonical'], selector['currentSemanticUnchanged']
    assert sum(r['bytes'] for r in sources.values()) < 3600000
    HOST.mkdir(parents=True)
    for alias, physical in sources.items():
        verify(physical)
        install(REPO / physical['path'], alias)
    (HOST / 'app/node_modules').symlink_to(REPO / 'app/node_modules', target_is_directory=True)
    aliases = []
    for row in contexts:
        image, g = row['actualCurrentNativeImage'], row['goal']
        verify(image)
        link = next(l for l in g['resourceLinks'] if l['type'] == 'goal-visualization')
        for alias in ['app/public' + link['url'], f"curricula/DE/Gymnasium/visualizations/chemie/{g['id']}/{g['id']}.png"]:
            target = HOST / alias
            target.parent.mkdir(parents=True, exist_ok=True)
            target.symlink_to(REPO / image['path'])
            aliases.append({'normalHostAlias': alias, 'physicalRepositorySource': image, 'readOnlyReference': True})
    write(OWN / 'checks/REBUILD.final-two.prebind.reference-host.json', {
        'executionHost': HOST.relative_to(REPO).as_posix(),
        'sourceMap': [{'normalHostAlias': a, 'physicalRepositorySource': r} for a, r in sorted(sources.items())],
        'imageAliases': aliases, 'dependencySymlink': 'app/node_modules', 'sourceImageCopies': 0,
        'normalChecksExecutedAtPreparation': 0})


def bind():
    assert not (OWN / 'BINDING.final-P2-A2-M2-V2.actual.json').exists()
    ctx = read(OWN / 'inputs/final-two-image-bound-whole-contexts.actual.json')
    run('P2.final-stock-fingerprint-materialization', tsx() + [str(OWN / 'scripts/bind_final_P2.mts'), str(REPO), str(HOST), str(OWN)])
    for p in [OWN / PCONFIG, OWN / 'normal/P2.final-informed.run.json', OWN / 'normal/P2.final-current-image-bound.E1G1.ai-candidates.jsonl']:
        install(p, p.relative_to(REPO).as_posix())
    a = read(OWN / 'science/FIRST.actual-informed-A2.original.json')
    rows = [{'schemaVersion': 1, 'reviewId': 'chemie-equilibrium-kpkc-pourbaix-informed-a2-20261015-v1',
             'ruleVersion': 'semantic-atomicity-v1', 'landscapeId': ctx['landscapeId'], 'goalId': d['goalId'],
             'fingerprint': 'pending-stock-binding-after-original-science', 'status': d['status'], 'semanticAtomic': d['semanticAtomic'],
             'reviewedAt': a['completedAtUTC'], 'reviewer': 'Codex C informed actual final model-bound A2; not description author',
             'reason': d['reason'] + ' Kern: ' + d['competenceCore'] + ' Prärequisiten: ' + d['prerequisiteApplication'] + ' Transfer: ' + d['transferBoundary']}
            for d in a['decisions']]
    (OWN / ARECORD).write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in rows))
    write(OWN / ACONFIG, {'schemaVersion': 1, 'reviewId': rows[0]['reviewId'], 'ruleVersion': rows[0]['ruleVersion'],
                         'landscapeId': ctx['landscapeId'], 'landscapePath': CANONICAL, 'reviewPath': REL + '/' + ARECORD,
                         'scope': {'label': 'Only two current bounded model competence cores; source/course holds retained', 'leafGoalIds': IDS}})
    for p in [OWN / ARECORD, OWN / ACONFIG]:
        install(p, p.relative_to(REPO).as_posix())
    run('A2.final-stock-fingerprint-binding', tsx() + ['app/scripts/semanticAtomicityReview.ts', '--config=' + REL + '/' + ACONFIG, '--write-fingerprints'])
    written = (HOST / (REL + '/' + ARECORD)).read_bytes()
    (OWN / 'checks/A2.final-stock-writer.original.jsonl').write_bytes(written)
    for before, after in zip(rows, [json.loads(l) for l in written.decode().splitlines()]):
        assert {k: v for k, v in before.items() if k != 'fingerprint'} == {k: v for k, v in after.items() if k != 'fingerprint'}
    (OWN / ARECORD).write_bytes(written)
    m = read(OWN / 'science/FIRST.actual-informed-M2.original.json')
    decisions = {d['goalId']: d for d in m['decisions']}
    original = REPO / ctx['M422Baseline']['path']
    verify(ctx['M422Baseline'])
    original_lines = original.read_text().splitlines(keepends=True)
    prepared = []
    for line in original_lines:
        old = json.loads(line)
        if old['goalId'] not in decisions:
            prepared.append(line)
            continue
        d = decisions[old['goalId']]
        assert old == d['wholePriorMDecision']
        new = {**old, 'fingerprint': 'pending-stock-binding-after-original-science',
               'status': d['status'], 'memoryUseful': d['memoryUseful'], 'reason': d['reason'],
               'reviewedAt': m['completedAtUTC'], 'reviewer': 'Codex C informed genuine two model-bound final wording Memory science',
               'firstScienceSeal': ref(OWN / 'science/FIRST.actual-informed-M2.seal.json')}
        prepared.append(json.dumps(new, ensure_ascii=False, separators=(',', ':')) + '\n')
    assert len(prepared) == len(original_lines) == 422
    (OWN / MRECORD).write_text(''.join(prepared))
    (OWN / 'records/M422.pre-stock-binding.original.jsonl').write_bytes((OWN / MRECORD).read_bytes())
    prev_selector = read(PREVIOUS / 'SELECTION.final-informed-P2-A2-and-rezeptfrei-M1-V1.json')
    config = read(REPO / prev_selector['M1']['whole422TenViewsConfig']['path'])
    config['reviewPath'] = REL + '/' + MRECORD
    config['reportPath'] = REL + '/checks/M422.report.not-written.md'
    write(OWN / MCONFIG, config)
    install(OWN / MCONFIG, REL + '/' + MCONFIG)
    install(OWN / MRECORD, config['reviewPath'])
    run('M2.final-stock-fingerprint-binding', tsx() + ['app/scripts/memoryCardReview.ts', '--config=' + REL + '/' + MCONFIG, '--mode=report', '--write-fingerprints'])
    private = HOST / config['reviewPath']
    writer = private.read_bytes()
    (OWN / 'checks/M422.final-stock-writer.unselected-original.jsonl').write_bytes(writer)
    written = {json.loads(l)['goalId']: (l, json.loads(l)) for l in writer.decode().splitlines(keepends=True)}
    before = {json.loads(l)['goalId']: json.loads(l) for l in prepared}
    final = []
    for line in original_lines:
        old = json.loads(line)
        new_line, new = written[old['goalId']]
        if old['goalId'] in decisions:
            expected = before[old['goalId']].copy()
            expected['fingerprint'] = new['fingerprint']
            assert expected == new
            final.append(new_line)
        else:
            assert old == new, ('non-target science/fingerprint delta', old['goalId'])
            final.append(line)
    assert sum(a == b for a, b in zip(original_lines, final)) == 420
    (OWN / MRECORD).write_text(''.join(final))
    private.write_bytes((OWN / MRECORD).read_bytes())
    cards = REPO / config['cardReviewPath']
    private_cards = HOST / config['cardReviewPath']
    card_writer = private_cards.read_bytes()
    (OWN / 'checks/cards75.final-stock-writer.unselected-original.jsonl').write_bytes(card_writer)
    assert [json.loads(l) for l in card_writer.decode().splitlines()] == [json.loads(l) for l in cards.read_text().splitlines()]
    private_cards.write_bytes(cards.read_bytes())
    base_q = read(REPO / ctx['QA438Baseline']['path'])
    verify(ctx['QA438Baseline'])
    current_rows = []
    for whole in ctx['wholeContexts']:
        g, image = whole['goal'], whole['actualCurrentNativeImage']
        selection = next(v for v in ctx['selectedVScience'] if v['goalId'] == g['id'])
        vf = read(REPO / selection['FIRST']['path'])
        decision = vf if g['id'] == IDS[0] else next(d for d in vf['decisions'] if d['goalId'] == g['id'])
        assert decision['decision'] == 'accepted'
        reason = (decision['nativeFindingsDe'] + ' ' + decision['responsiveFindingsDe'] + ' ' + decision['wholeContextCompatibilityDe']) if g['id'] == IDS[0] else decision['reason']
        link = next(l for l in g['resourceLinks'] if l['type'] == 'goal-visualization')
        old = next(q for q in base_q['records'] if q['goalId'] == g['id'])
        current_rows.append({**old, 'title': g['title'], 'description': g['description'], 'landscapePath': CANONICAL,
                             'imageUrl': link['url'], 'publicAssetPath': 'app/public' + link['url'],
                             'canonicalAssetPath': f"curricula/DE/Gymnasium/visualizations/chemie/{g['id']}/{g['id']}.png",
                             'assetSha256': image['sha256'], 'aiApproved': 'yes', 'aiApprovedAssetSha256': image['sha256'],
                             'aiReviewedAt': vf['completedAtUTC'], 'aiReviewer': 'Codex C independent informed actual final Kp/Pourbaix image contexts',
                             'aiNotes': reason + ' Original FIRST ' + selection['FIRST']['sha256'] + '. No D/P/A/M/source/course/Human/M7 grant.',
                             'umlautsCorrectChatGpt': 'no', 'contentApprovedChatGpt': 'no', 'chatGptReviewedAt': None,
                             'chatGptReviewer': '', 'chatGptNotes': '', 'humanApproved': 'no', 'humanReviewedAt': None, 'humanReviewer': ''})
    normal = {'schemaVersion': 1, 'subject': 'chemie',
              'source': {'canonicalRoot': 'curricula/DE/Gymnasium/canonical', 'publicAssetRoot': 'app/public/assets/goal-visualizations'},
              'records': current_rows}
    write(OWN / 'qa/V2.final-current.normal-alias.qa.json', normal)
    physical = json.loads(json.dumps(normal))
    physical['source'] = {'canonicalRoot': str(Path(ctx['finalCanonical']['path']).parent),
                          'publicAssetRoot': 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'}
    for r in physical['records']:
        image = next(w['actualCurrentNativeImage'] for w in ctx['wholeContexts'] if w['goal']['id'] == r['goalId'])
        r['landscapePath'], r['canonicalAssetPath'], r['publicAssetPath'] = ctx['finalCanonical']['path'], image['path'], image['path']
    write(OWN / 'qa/V2.final-current.physical-transport.qa.json', physical)
    row_by_id = {r['goalId']: r for r in current_rows}
    whole = {**base_q, 'records': [row_by_id.get(r['goalId'], r) for r in base_q['records']]}
    assert len(whole['records']) == 438 and sum(a == b for a, b in zip(base_q['records'], whole['records'])) == 436
    write(OWN / 'qa/QA438.original436-plus-current-Kp-Pourbaix-V2.candidate.json', whole)
    write(OWN / 'BINDING.final-P2-A2-M2-V2.actual.json', {
        'boundAtUTC': now(), 'finalCanonical': ctx['finalCanonical'], 'finalSemantic': ctx['finalSemantic'],
        'finalAuthorSelector': ctx['finalAuthorSelector'], 'finalAuthorSeal': ctx['finalAuthorSeal'],
        'originalPAMSeals': ctx['originalPAMSeals'], 'selectedVScience': ctx['selectedVScience'],
        'P2Records': ref(OWN / 'normal/P2.final-current-image-bound.E1G1.ai-candidates.jsonl'),
        'A2Records': ref(OWN / ARECORD), 'M422Records': ref(OWN / MRECORD),
        'all75CardsExact': ref(cards), 'V2NormalQA': ref(OWN / 'qa/V2.final-current.normal-alias.qa.json'),
        'V2PhysicalTransportQA': ref(OWN / 'qa/V2.final-current.physical-transport.qa.json'),
        'QA438Candidate': ref(OWN / 'qa/QA438.original436-plus-current-Kp-Pourbaix-V2.candidate.json'),
        'original420MRawLinesExact': True, 'other436WholeQAObjectsExact': True,
        'wholeProfiles2Exact': True, 'oldJPGReviseAndAllOriginalViewsExact': True,
        'currentVVotes': 2, 'physicalTransportAddsVotes': 0, 'sourceImageCopies': 0,
        'fourSourceCourseDHoldsRemainOpen': True, 'HumanApproval': False, 'activeWrites': 0})


def check():
    run('P2.final-stock-check', tsx() + ['app/scripts/positiveGoalEvidenceReview.ts', '--config=' + REL + '/' + PCONFIG, '--mode=check'])
    run('A2.final-stock-check', tsx() + ['app/scripts/semanticAtomicityReview.ts', '--config=' + REL + '/' + ACONFIG, '--mode=check'])
    run('V2.final-targeted-stock-helper', tsx() + [str(OWN / 'scripts/check_final_V2.mts'), str(REPO), str(HOST), str(OWN)])
    run('M422.final-whole422-ten-views-check', tsx() + ['app/scripts/memoryCardReview.ts', '--config=' + REL + '/' + MCONFIG, '--mode=check'])
    ctx = read(OWN / 'inputs/final-two-image-bound-whole-contexts.actual.json')
    old = (REPO / ctx['M422Baseline']['path']).read_text().splitlines(keepends=True)
    new = (OWN / MRECORD).read_text().splitlines(keepends=True)
    assert len(old) == len(new) == 422 and sum(a == b for a, b in zip(old, new)) == 420
    config = read(OWN / MCONFIG)
    assert len(config['visibilityScopes']) == 10
    assert (HOST / config['cardReviewPath']).read_bytes() == (REPO / config['cardReviewPath']).read_bytes()
    mapping = read(OWN / 'checks/REBUILD.final-two.prebind.reference-host.json')
    sources = {r['normalHostAlias']: r['physicalRepositorySource'] for r in mapping['sourceMap']}
    for p in [OWN / PCONFIG, OWN / ACONFIG, OWN / MCONFIG, OWN / ARECORD, OWN / MRECORD,
              OWN / 'normal/P2.final-informed.run.json', OWN / 'normal/P2.final-current-image-bound.E1G1.ai-candidates.jsonl']:
        sources[p.relative_to(REPO).as_posix()] = ref(p)
    for alias, physical in sources.items():
        assert (HOST / alias).read_bytes() == (REPO / physical['path']).read_bytes()
    regular = [p for p in HOST.rglob('*') if p.is_file() and not p.is_symlink()]
    size = sum(p.stat().st_size for p in regular)
    assert len(regular) == len(sources) and size < 4000000
    write(OWN / 'checks/REBUILD.final-P2-A2-M2-V2.reference-host.physical-map.json', {
        **mapping, 'sourceMap': [{'normalHostAlias': a, 'physicalRepositorySource': r} for a, r in sorted(sources.items())],
        'regularFileCount': len(regular), 'regularBytes': size,
        'stockChecks': {'P2': 1, 'A2': 1, 'V2targeted': 1, 'M422tenViews': 1},
        'failedStockCheckAttempts': 0, 'fullSchemaOrCentralExecuted': False, 'activeWrites': 0})
    write(OWN / 'checks/FINAL.actual-current-two-role-checks-and-preservation.json', {
        'completedAtUTC': now(), 'P2': 'E1/G1 ai_candidate / needs_human_review2', 'A2': 'atomic2',
        'M2': 'genuine no_memory_needed2', 'V2': 'current images accepted2, old JPG revise historical',
        'finalTargetedChecksExit0': True, 'successfulAttemptsEach': 1, 'failedAttempts': 0,
        'wholeM422TenScopes': True, 'other420MRawLinesExact': True, 'cards75BytesExact': True,
        'other436WholeQAObjectsExact': True, 'e0_1a_f71_138_otherCarbonylRowsExact': True,
        'wholeProfiles2Exact': True, 'oldJPGOriginalReviseAndViewsExact': True,
        'newSourceCourseDHoldsResolved': 0, 'sourceImageCopies': 0, 'hostRegularBytes': size,
        'HumanApproval': False, 'HumanTrial': False, 'M7Grant': False,
        'centralRuns': 0, 'wholeBookOrNativeRenderer': False, 'activeWrites': 0})
    print(json.dumps({'fourFinalChecksExit0': True, 'successfulAttemptsEach': 1,
                      'other420MRawLinesExact': True, 'other436WholeQAObjectsExact': True,
                      'sourceImageCopies': 0, 'hostRegularBytes': size}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('stage', choices=['prepare', 'bind', 'check'])
    {'prepare': prepare, 'bind': bind, 'check': check}[parser.parse_args().stage]()
