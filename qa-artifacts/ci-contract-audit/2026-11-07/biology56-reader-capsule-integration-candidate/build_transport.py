#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Build one separately versioned finite successor with the unchanged raw kernel."""
from prepare_and_qualify import R, P, W, sha, js, write
import json
import shutil
import subprocess
import time
from datetime import datetime, timezone

OLD_PATH = 'contracts/goal-visualization-context/v1/qualified-context-index-math58-132-2026-11-07.candidate.json'
OLD_SHA = '441b710b8965f529c231f046bbde6ade4be17d2c0bd4a43baf46829ee0287803'
INDEX_PATH = 'contracts/goal-visualization-context/v1/qualified-context-index-biology56-188-2026-11-07.candidate.json'


def main():
    old = json.loads((R / OLD_PATH).read_bytes())
    assert sha((R / OLD_PATH).read_bytes()) == OLD_SHA
    qualified = json.loads((P / 'native-qualification-and-regression.json').read_bytes())
    originals = {r['gitCommit'] + ':' + r['path']: r for r in qualified['originalReferences']}
    assert all(originals[r['gitCommit'] + ':' + r['path']] == r for r in old['originalReferences'])
    current = {r['path']: r for r in old['currentReferences']}
    for ref in qualified['currentReferencesReadFromRepository']:
        assert ref['path'] not in current or current[ref['path']] == ref
        current[ref['path']] = ref
    bio_ids = [r['goalId'] for r in qualified['rows'][132:]]
    assert len(bio_ids) == 56
    binding = {'profile': 'biology-sealed-native-three-families-v1',
        'prior132Index': {'path': OLD_PATH, 'sha256': OLD_SHA},
        'source': {'path': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
                   'sha256': '9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79'},
        'biology56GoalIds': bio_ids, 'all188GoalIds': sorted(r['goalId'] for r in qualified['rows'])}
    index = {**old, 'rows': qualified['rows'], 'originalReferences': qualified['originalReferences'],
        'currentReferences': sorted(current.values(), key=lambda row: row['path']), 'biology56ContextBinding': binding}
    assert len(index['rows']) == 188 and index['rows'][:132] == old['rows']
    assert len(index['currentReferences']) == 521 and len(index['originalReferences']) == 683
    index_file = P / 'candidate' / INDEX_PATH
    js(index_file, index)
    index_sha = sha(index_file.read_bytes())
    selector_file = P / 'candidate/scripts/visualization_qualified_context_capsule.py'
    selector = (R / 'scripts/visualization_qualified_context_capsule.py').read_text()
    needle = '\n_ACCEPTED_INDEXES = {'
    assert selector.count(needle) == 1
    selector = selector.replace(needle, '\nBIO188_INDEX_SHA256 = ' + repr(index_sha) + '\nBIO188_CONTEXT_BINDING = ' + repr(binding) + '\n' + needle)
    selector = selector.replace('_ACCEPTED_INDEXES = {', "_ACCEPTED_INDEXES = {\n    BIO188_INDEX_SHA256: ('25a6f2164a81a7e6ae50db3557d20521fecf5124', 188),", 1)
    selector = selector.replace("if accepted_index == MATH132_INDEX_SHA256:\n        expected_fields |= {'currentReferences', 'currentContextBinding'}",
        "if accepted_index in (MATH132_INDEX_SHA256, BIO188_INDEX_SHA256):\n        expected_fields |= {'currentReferences', 'currentContextBinding'}\n    if accepted_index == BIO188_INDEX_SHA256:\n        expected_fields.add('biology56ContextBinding')")
    selector = selector.replace("if accepted_index == MATH132_INDEX_SHA256:\n        kernel.require(index['currentContextBinding']", "if accepted_index in (MATH132_INDEX_SHA256, BIO188_INDEX_SHA256):\n        kernel.require(index['currentContextBinding']")
    selector = selector.replace("sorted(row['goalId'] for row in index['rows']) == MATH132_CONTEXT_BINDING['all132GoalIds']", "sorted(row['goalId'] for row in index['rows'][:132]) == MATH132_CONTEXT_BINDING['all132GoalIds']")
    selector = selector.replace("kernel.require(len(index['currentReferences']) == 408 and len({r['path'] for r in index['currentReferences']}) == 408,", "count = 521 if accepted_index == BIO188_INDEX_SHA256 else 408\n        kernel.require(len(index['currentReferences']) == count and len({r['path'] for r in index['currentReferences']}) == count,")
    needle = '    return index, [refs[key] for key in sorted(refs)], receipts, [working[path] for path in sorted(working)]'
    assert selector.count(needle) == 1
    selector = selector.replace(needle, "    if accepted_index == BIO188_INDEX_SHA256:\n        kernel.require(index['biology56ContextBinding'] == BIO188_CONTEXT_BINDING, 'Fixed188 Bio source/goal binding differs')\n        prior_ref = BIO188_CONTEXT_BINDING['prior132Index']\n        add_working(prior_ref['path'], prior_ref['sha256'])\n        prior132 = json.loads(kernel.read_bound(root, prior_ref['path'], prior_ref['sha256']))\n        kernel.require(index['rows'][:132] == prior132['rows'], 'Historical132 receipt rows changed')\n        kernel.require(sorted(row['goalId'] for row in index['rows']) == BIO188_CONTEXT_BINDING['all188GoalIds']\n                       and [row['goalId'] for row in index['rows'][132:]] == BIO188_CONTEXT_BINDING['biology56GoalIds'], 'Fixed188 finite IDs differ')\n" + needle)
    selector_file.write_text(selector)
    shutil.copytree(R / 'contracts/goal-visualization-context/v1', W / 'contracts-v1')
    shutil.copy2(index_file, W / 'contracts-v1' / index_file.name)
    # Build with finite provisional ceilings only to measure the new closure.
    # A final fixed-resource guard is written from actual measured totals below.
    arguments = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev-bind', '/dev', '/dev',
        '--bind', str(P), str(P), '--bind', str(W), str(W), '--ro-bind', str(W / 'contracts-v1'), str(R / 'contracts/goal-visualization-context/v1'),
        '--ro-bind', str(selector_file), str(R / 'scripts/visualization_qualified_context_capsule.py'), '--chdir', str(R), '--',
        'python3', '-B', str(R / 'scripts/visualization_qualified_context_capsule.py'), 'build', '--repository-root', str(R),
        '--accepted-commit', old['acceptedRepositoryCommit'], '--accepted-census-sha256', index_sha, '--census-path', INDEX_PATH,
        '--output', str(W / 'capsule-188'), '--maximum-working-bytes', str(768 * 1024 * 1024),
        '--maximum-object-bytes', str(768 * 1024 * 1024), '--maximum-embedded-bytes', str(20 * 1024 * 1024)]
    begin = time.monotonic()
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(arguments, capture_output=True)
    write(P / 'capsule-build.stdout', result.stdout)
    write(P / 'capsule-build.stderr', result.stderr)
    js(P / 'capsule-build.execution.json', {'argv': arguments, 'exitCode': result.returncode, 'startedAtActualUTC': started,
        'finishedAtActualUTC': datetime.now(timezone.utc).isoformat(), 'elapsedSeconds': time.monotonic() - begin,
        'rawGitKernelModified': False, 'activeGitRefsWritten': False, 'qualificationOrProducerRun': False})
    print(result.returncode, result.stdout.decode()[-5000:], result.stderr.decode()[-5000:], flush=True)
    assert result.returncode == 0
    body = json.loads((W / 'capsule-188/capsule.json').read_bytes())
    working = sum({row['sha256']: row['bytes'] for row in body['workingInputs']}.values())
    objects = sum(row['bytes'] for row in body['objects'])
    embedded = sum(row['bytes'] for row in body['objects'] if row['storage'] == 'embedded')
    ceiling = lambda n: ((n + 1024 * 1024 - 1) // (1024 * 1024)) * 1024 * 1024
    limits = {'working': ceiling(working), 'object': ceiling(objects), 'embedded': ceiling(embedded)}
    # The only new transport guard is specific to this exact independently reviewable finite index.
    guard = '''        fixed188 = args.accepted_census_sha256 == BIO188_INDEX_SHA256
        if fixed188:
            for kind, maximum in BIO188_RESOURCE_LIMITS.items():
                allowance = getattr(args, "maximum_" + kind + "_bytes")
                kernel.require(0 <= allowance <= maximum, "Fixed188 " + kind + " allowance exceeds its measured finite bound")
            kernel.require(args.maximum_object_bytes >= BIO188_OBJECT_BYTES, "Fixed188 actual object bytes exceed caller budget")
            kernel.require(args.maximum_embedded_bytes >= BIO188_EMBEDDED_BYTES, "Fixed188 actual embedded bytes exceed caller budget")
            _, _, _, working = index_originals(args.repository_root.resolve(strict=True), args.census_path, args.accepted_census_sha256)
            kernel.require(sum({r['sha256']: r['bytes'] for r in working}.values()) <= args.maximum_working_bytes,
                           "Fixed188 actual working bytes exceed caller budget")
'''
    selector = selector.replace('\nBIO188_CONTEXT_BINDING = ', '\nBIO188_RESOURCE_LIMITS = ' + repr(limits) + '\nBIO188_OBJECT_BYTES = ' + str(objects)
        + '\nBIO188_EMBEDDED_BYTES = ' + str(embedded) + '\nBIO188_CONTEXT_BINDING = ', 1)
    assert selector.count('        result = action(args)') == 1
    selector = selector.replace('        result = action(args)', guard + '        result = action(args)')
    selector = selector.replace('        return result\n    return bounded', '''        if fixed188 and action.__name__ == "build":
            body = json.loads((args.output / "capsule.json").read_bytes())
            kernel.require(sum(r['bytes'] for r in body['objects']) == BIO188_OBJECT_BYTES
                           and sum(r['bytes'] for r in body['objects'] if r['storage'] == 'embedded') == BIO188_EMBEDDED_BYTES,
                           "Fixed188 measured original object set differs")
        return result
    return bounded''')
    selector_file.write_text(selector)
    # Only the actual small capsule payload is copied to a new regular repository proof path.
    shutil.copytree(W / 'capsule-188', P / 'capsule-188')
    capsule_sha = sha((P / 'capsule-188/capsule.json').read_bytes())
    authority = (R / 'app/scripts/lib/qualifiedVisualizationContextAuthority.ts').read_text()
    authority = authority.replace(OLD_PATH, INDEX_PATH).replace(OLD_SHA, index_sha)
    authority = authority.replace('qa-artifacts/ci-contract-audit/2026-11-07/math58-active-integration/capsule-132', P.relative_to(R).as_posix() + '/capsule-188')
    authority = authority.replace('bf797d97d48d3ebb436037cfcf487189e06455e9cf2120a4d385f7921b20b0bf', capsule_sha)
    authority = authority.replace('index.rows.length !== 132 || rows.size !== 132', 'index.rows.length !== 188 || rows.size !== 188')
    authority = authority.replace("'322961408'", repr(str(limits['working']))).replace("'295698432'", repr(str(limits['object']))).replace("'14680064'", repr(str(limits['embedded'])))
    (P / 'candidate/app/scripts/lib/qualifiedVisualizationContextAuthority.ts').write_text(authority)
    js(P / 'transport-measurements.json', {'indexPath': INDEX_PATH, 'indexSha256': index_sha,
        'capsulePath': P.relative_to(R).as_posix() + '/capsule-188', 'capsuleSha256': capsule_sha,
        'actualWorkingUniqueBytes': working, 'actualWorkingPaths': len(body['workingInputs']), 'actualObjectPayloadBytes': objects,
        'actualObjectCount': len(body['objects']), 'actualEmbeddedUncompressedBytes': embedded, 'actualCapsuleManifestBytes': (P / 'capsule-188/capsule.json').stat().st_size,
        'actualCapsuleStoredBytes': sum(p.stat().st_size for p in (P / 'capsule-188').rglob('*') if p.is_file()),
        'finiteMaximumBytes': limits, 'originalReferences': len(index['originalReferences']), 'currentReferences': len(index['currentReferences']),
        'old132RowsExact': True, 'old433OriginalReferencesExact': True, 'old408CurrentReferencesExact': True,
        'newBioReceipts': 56, 'newOriginalReferences': 250, 'newCurrentReferences': 113,
        'rawKernelModified': False, 'source15Included': False, 'combinedProducerRuns': 0})
    print(json.dumps(json.loads((P / 'transport-measurements.json').read_bytes()), indent=2), flush=True)


if __name__ == '__main__':
    main()
