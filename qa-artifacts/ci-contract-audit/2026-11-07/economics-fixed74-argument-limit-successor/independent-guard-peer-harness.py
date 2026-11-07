#!/usr/bin/env python3
"""Independent real-kernel parser probe; stop only at original action boundaries."""
import argparse, ast, datetime, hashlib, json, runpy, sys
from pathlib import Path

root = Path(__file__).resolve().parents[4]
out = Path(__file__).resolve().parent
candidate = out / 'private-code/scripts/visualization_qualified_context_capsule.py'
cs = hashlib.sha256(candidate.read_bytes()).hexdigest()
assert cs == '466ea51b476ba60602616c9c807b8281c8c9c516c408061f5299dab4e4f6aed5'
raw = root / 'scripts/visualization_review_git_capsule.py'
ks = hashlib.sha256(raw.read_bytes()).hexdigest()
assert ks == '307bb0b0ca99c680261afa176eed7ab05e88b108d79261cafb28903ddf231f34'
sys.path.insert(0, str(root / 'scripts'))
import visualization_review_git_capsule as kernel

fixed = '234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785'
old57 = '46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0'
old54 = '3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e'
selector_forms = [
    ('normal', ['--accepted-census-sha256', fixed], fixed),
    ('equals', ['--accepted-census-sha256=' + fixed], fixed),
    ('abbrev', ['--accepted-census-s', fixed], fixed),
    ('abbrevEquals', ['--accepted-census-s=' + fixed], fixed),
    ('duplicate57then74', ['--accepted-census-sha256', old57, '--accepted-census-sha256', fixed], fixed),
    ('duplicate74then57', ['--accepted-census-sha256', fixed, '--accepted-census-sha256', old57], old57),
    ('duplicate74then54', ['--accepted-census-sha256', fixed, '--accepted-census-sha256', old54], old54),
]
resources = [
    ('working', '--maximum-working-bytes', '--maximum-w', 201326592, 'maximum_working_bytes'),
    ('object', '--maximum-object-bytes', '--maximum-o', 268435456, 'maximum_object_bytes'),
    ('embedded', '--maximum-embedded-bytes', '--maximum-e', 16777216, 'maximum_embedded_bytes'),
]
saved_parse = argparse.ArgumentParser.parse_args
results = []


class ActionReached(BaseException):
    pass


for action in ['build', 'materialize']:
    for resource, full, short, cap, field in resources:
        limitforms = [
            ('normal', [full, str(cap + 1)], cap + 1),
            ('equals', [full + '=' + str(cap + 1)], cap + 1),
            ('abbrev', [short, str(cap + 1)], cap + 1),
            ('abbrevEquals', [short + '=' + str(cap + 1)], cap + 1),
            ('duplicateValidThenOver', [full, str(cap), full, str(cap + 1)], cap + 1),
            ('duplicateOverThenValid', [full, str(cap + 1), full, str(cap)], cap),
            ('exactBound', [full, str(cap)], cap),
            ('plusInteger', [full, '+' + str(cap + 1)], cap + 1),
            ('spacedInteger', [full, ' ' + str(cap + 1) + ' '], cap + 1),
        ]
        for slabel, sargs, selector in selector_forms:
            for llabel, largs, effective in limitforms:
                parses, actions = [], []

                def observe(self, *a, **kw):
                    ns = saved_parse(self, *a, **kw)
                    parses.append(ns)
                    return ns

                def operation(ns):
                    actions.append(ns)
                    raise ActionReached()

                argparse.ArgumentParser.parse_args = observe
                # The candidate wraps these spies exactly where it wraps actual
                # original kernel actions in native execution. Parsing is real.
                kernel.build = operation
                kernel.materialize = operation
                defaults = []
                for r, f, s, c, n in resources:
                    if r != resource:
                        defaults.extend([f, str(c)])
                argv = [
                    action, '--repository-root', str(root), '--accepted-commit',
                    '25a6f2164a81a7e6ae50db3557d20521fecf5124', '--output',
                    '/dev/shm/not-created-by-peer-probe', *defaults, *sargs, *largs,
                ]
                sys.argv = [str(candidate), *argv]
                expected_reject = selector == fixed and effective > cap
                try:
                    runpy.run_path(str(candidate), run_name='__main__')
                except ActionReached:
                    actual_reject = False
                except ValueError as exc:
                    actual_reject = True
                    assert 'Fixed74 ' + resource + ' allowance exceeds' in str(exc), (action, resource, slabel, llabel, str(exc))
                else:
                    raise AssertionError('Action spy was not reached or guard did not reject')
                assert len(parses) == 1
                assert parses[0].accepted_census_sha256 == selector
                assert getattr(parses[0], field) == effective
                assert actual_reject == expected_reject, (action, resource, slabel, llabel)
                assert bool(actions) == (not expected_reject)
                if actions:
                    assert actions[0] is parses[0]
                results.append({
                    'action': action, 'resource': resource, 'selectorForm': slabel,
                    'limitForm': llabel, 'rejected': actual_reject,
                    'selector': selector, 'effectiveLimit': effective,
                })

argparse.ArgumentParser.parse_args = saved_parse
assert hashlib.sha256(raw.read_bytes()).hexdigest() == ks
assert hashlib.sha256(candidate.read_bytes()).hexdigest() == cs
old = root / 'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate'
manifest = (old / 'manifest.json').read_bytes()
assert hashlib.sha256(manifest).hexdigest() == 'd2d550a83825310c97a0424abac69c120eb2e92d508725cdbfacc147cd90c29e'
for ref in json.loads(manifest)['files']:
    assert hashlib.sha256((old / ref['path']).read_bytes()).hexdigest() == ref['sha256']
old_ast = ast.parse((old / 'private-code/scripts/visualization_qualified_context_capsule.py').read_text())
new_ast = ast.parse(candidate.read_text())
get_function = lambda tree, name: next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == name)
assert ast.dump(get_function(old_ast, 'index_originals')) == ast.dump(get_function(new_ast, 'index_originals'))
get_map = lambda tree: next(node for node in tree.body if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == '_ACCEPTED_INDEXES' for target in node.targets))
assert ast.dump(get_map(old_ast)) == ast.dump(get_map(new_ast))
report = {
    'kind': 'independent-effective-kernel-namespace-guard-peer-review',
    'completedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'candidateSha256': cs, 'rawKernelSha256': ks,
    'executedHarnessSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    'ownActualRawParserCases': len(results),
    'rejectedBeforeOriginalAction': sum(row['rejected'] for row in results),
    'allowedSameNamespaceToOriginalAction': sum(not row['rejected'] for row in results),
    'exactlyOneActualParsePerCase': True,
    'allowedOriginalActionReceivesIdenticalNamespaceObject': True,
    'allExpectationsPassed': True,
    'actions': ['build', 'materialize'],
    'resources': [{'name': r, 'fixed74Maximum': c} for r, f, s, c, n in resources],
    'limitForms': [row[0] for row in limitforms],
    'selectorForms': [row[0] for row in selector_forms],
    'old54And57EffectiveLastSelectorRetainsPreviousBehavior': True,
    'fixedTransportTupleMapUnchanged': True,
    'indexOriginalsBodyAstUnchanged': True,
    'old74ManifestAndAll891PayloadFilesUnchanged': True,
    'runtimeModelIdentifierIndependentlyVerified': False,
    'limits': [
        'This probe runs the actual unchanged ArgumentParser and stops only at the original action boundary.',
        'The original build/materialize bodies are replaced only in this instrumentation process; this is not a real materialization or build proof.',
        'Native materialization, build and normal maturity regression are separately required and supplied by the parent execution package.',
        'No new image subject review, human approval, global M7 acceptance or active host integration is claimed.',
        'Only the two explicitly authorized new sibling audit files are written; original packet, kernel, active files and Git remain unchanged.',
    ],
    'newAiImageReviews': 0, 'newHumanApprovals': 0,
    'results': results,
}
assert report['ownActualRawParserCases'] == 378
assert report['rejectedBeforeOriginalAction'] == 210
assert report['allowedSameNamespaceToOriginalAction'] == 168
(out / 'independent-guard-peer-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: value for key, value in report.items() if key not in {'results', 'limits'}}, indent=2))
