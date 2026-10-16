# SPDX-License-Identifier: Apache-2.0
"""Read-only verification of a finite inactive checkpoint; no science votes/builds."""
from pathlib import Path, PureWindowsPath
import argparse
import ast
import hashlib
import importlib.util
import json
import os
import sys

sys.dont_write_bytecode = True
OWN = Path(__file__).resolve().parent
ROOT = next(p for p in OWN.parents if (p/'AGENTS.md').is_file() and (p/'app').is_dir())
SELECTOR = OWN/'FINAL.finite-current422-checkpoint.json'


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            h.update(chunk)
    return 'sha256:' + h.hexdigest()


def repository_path(raw):
    p = Path(raw)
    assert not p.is_absolute() and not PureWindowsPath(raw).is_absolute(), raw
    assert '..' not in p.parts, raw
    return ROOT/p


def verify_artifact(entry):
    p = repository_path(entry['path'])
    assert p.is_file(), p
    assert p.resolve(strict=True).is_relative_to(ROOT), p
    assert digest(p) == entry.get('sha256', entry.get('digest')), p
    assert p.stat().st_size == entry['bytes'], p
    return p


def physical_entries(directory):
    """List physical leaves and directory links without traversing their targets."""
    found = set()
    for parent, directories, files in os.walk(directory, followlinks=False):
        parent = Path(parent)
        for name in tuple(directories):
            p = parent/name
            if p.is_symlink():
                found.add(p)
                directories.remove(name)
        for name in files:
            p = parent/name
            assert p.is_file() or p.is_symlink(), p
            found.add(p)
    return found


def payload_path(package_root, row):
    raw = Path(row['path'])
    assert not raw.is_absolute() and not PureWindowsPath(row['path']).is_absolute(), raw
    assert '..' not in raw.parts, raw
    relative_root = package_root.relative_to(ROOT)
    p = ROOT/raw if raw.is_relative_to(relative_root) else package_root/raw
    assert p.is_relative_to(package_root), p
    return p


def inspect_payload(package_root, row, counts):
    p = payload_path(package_root, row)
    resolved = p.resolve(strict=True)
    assert resolved.is_relative_to(ROOT), p
    if p.is_symlink():
        target = os.readlink(p)
        assert not os.path.isabs(target) and not PureWindowsPath(target).is_absolute(), p
        if 'symlinkTarget' in row:
            assert target == row['symlinkTarget'], p
        if 'target' in row:
            assert target == row['target'], p
        text_bytes = os.fsencode(target)
        if 'linkTextSha256' in row:
            assert 'sha256:'+hashlib.sha256(text_bytes).hexdigest() == row['linkTextSha256'], p
        if 'linkTextBytes' in row:
            assert len(text_bytes) == row['linkTextBytes'], p
        if 'resolvedRepositoryPath' in row:
            assert resolved.relative_to(ROOT).as_posix() == row['resolvedRepositoryPath'], p
        counts['symlinks'] += 1
        if resolved.is_dir():
            assert row.get('kind') == 'directory_symlink', p
            counts['directorySymlinks'] += 1
            declared_targets = {repository_path(raw_target) for raw_target in row['resolvedCommittableTargetPaths']}
            assert declared_targets == physical_entries(resolved), p
            for raw_target in row['resolvedCommittableTargetPaths']:
                q = repository_path(raw_target)
                assert q.is_file() and q.resolve().is_relative_to(resolved), q
            return
    assert p.is_file(), p
    assert digest(p) == row.get('sha256', row.get('resolvedSha256')), p
    assert p.stat().st_size == row.get('bytes', row.get('resolvedBytes')), p
    counts['payloadFiles'] += 1
    if p.suffix == '.json':
        json.loads(p.read_text())
        counts['JSON'] += 1
    elif p.suffix == '.jsonl':
        text = p.read_text()
        assert not text or text.endswith('\n'), p
        for line in text.splitlines():
            if line.strip():
                json.loads(line)
                counts['JSONLrows'] += 1
        counts['JSONLfiles'] += 1
    elif p.suffix == '.py':
        ast.parse(p.read_text(), filename=str(p))
        counts['PythonAST'] += 1


def verify_package(package, counts):
    root = repository_path(package['path'])
    seal_path = verify_artifact(package['currentFiniteSeal'])
    seal = json.loads(seal_path.read_text())
    rows = seal['files']
    assert len(rows) == package['payloadEntries'], seal_path
    expected = {payload_path(root, row) for row in rows} | {seal_path}
    assert len(expected) == len(rows)+1, seal_path
    aliases = seal.get('committableAliasedWholeInputs', [])
    for alias in aliases:
        link = repository_path(alias['alias'])
        assert link.is_relative_to(root) and link.is_symlink(), link
        target = os.readlink(link)
        assert target == alias['relativeTarget']
        assert not os.path.isabs(target) and not PureWindowsPath(target).is_absolute()
        resolved = link.resolve(strict=True)
        assert resolved == repository_path(alias['resolvedSource']) and resolved.is_dir()
        sources = set()
        for binding in alias['wholeFileBindings']:
            source = verify_artifact(binding['source'])
            alias_path = repository_path(binding['aliasPath'])
            assert alias_path.is_relative_to(link) and source.is_relative_to(resolved)
            assert alias_path.relative_to(link) == source.relative_to(resolved)
            assert alias_path.resolve(strict=True) == source.resolve(strict=True)
            sources.add(source)
            counts['directoryAliasWholeFileBindings'] += 1
        assert sources == physical_entries(resolved), link
        expected.add(link)
        counts['directorySymlinks'] += 1
        counts['symlinks'] += 1
    actual = physical_entries(root)
    assert expected == actual, (root.as_posix(), sorted(str(p.relative_to(ROOT)) for p in expected ^ actual))
    for row in rows:
        inspect_payload(root, row, counts)
    for item in package.get('currentSelectorBindings', []):
        verify_artifact(item)
    counts['packages'] += 1
    counts['physicalEntries'] += len(actual)


def chemistry_subject(report):
    selected = [s for s in report['subjects'] if s['subject'] == 'chemie']
    assert len(selected) == 1
    return selected[0]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--preseal', action='store_true', help='Initial receipt before sealing this wrapper only')
    args = parser.parse_args()
    checkpoint = json.loads(SELECTOR.read_text())
    counts = {'packages':0, 'payloadFiles':0, 'physicalEntries':0, 'JSON':0, 'JSONLfiles':0, 'JSONLrows':0, 'PythonAST':0, 'symlinks':0, 'directorySymlinks':0, 'directoryAliasWholeFileBindings':0}
    assert len(checkpoint['packages']) == checkpoint['packageCount'] == 22
    assert len({p['path'] for p in checkpoint['packages']}) == 22
    assert sorted(p['path'] for p in checkpoint['packages']) == checkpoint['capturedInputRootPaths']
    selected_twenty = json.loads(verify_artifact(checkpoint['completedTwentyRootSelection']).read_text())
    assert selected_twenty['rootCount'] == len(selected_twenty['selectedRoots']) == 20
    package_by_path = {p['path']: p for p in checkpoint['packages']}
    for selected in selected_twenty['selectedRoots']:
        package = package_by_path[selected['root']]
        assert package['currentFiniteSeal'] == selected['selectedCurrentFiniteSeal']
        assert package['payloadEntries'] == selected['payloadEntries']
    for package in checkpoint['packages']:
        verify_package(package, counts)
    assert counts['physicalEntries'] == checkpoint['inputPhysicalEntryCount'] == 1038
    assert counts['directorySymlinks'] == checkpoint['physicalDirectorySymlinkCount'] == 5
    for binding in checkpoint['artifactBindings']:
        verify_artifact(binding)
    old = chemistry_subject(json.loads(verify_artifact(checkpoint['baseline321']['report']).read_text()))
    current_report = json.loads(verify_artifact(checkpoint['currentCentralReport']).read_text())
    current = chemistry_subject(current_report)
    net = json.loads(verify_artifact(checkpoint['exactNetIdComparison']).read_text())
    old_ids = set(old['strictCompleteGoalIds']); now_ids = set(current['strictCompleteGoalIds'])
    assert old['strictComplete'] == len(old_ids) == checkpoint['previousStrict'] == 321
    assert old_ids <= now_ids and not (old_ids-now_ids)
    assert len(current['currentGoalIds']) == len(set(current['currentGoalIds'])) == current['denominator'] == checkpoint['currentDenominator']
    assert set(current['currentGoalIds']) == set(old['currentGoalIds'])
    assert current['strictComplete'] == len(now_ids) == checkpoint['currentStrict']
    assert current['remaining'] == current['denominator']-len(now_ids) == checkpoint['remaining']
    assert current['percentage'] == checkpoint['percentage']
    assert current['gates'] == checkpoint['gates']
    assert current_report['blockingIssueCount'] == 0 and current['issues'] == []
    assert len(current['requiredChecks']) == 6 and all(r['status']=='pass' for r in current['requiredChecks'])
    assert net['baselineStrictGoalIds'] == sorted(old_ids)
    assert net['currentStrictGoalIds'] == sorted(now_ids)
    assert net['addedGoalIds'] == sorted(now_ids-old_ids)
    assert net['lostGoalIds'] == [] and net['old321Retained'] == len(old_ids & now_ids)
    assert len(net['addedGoalIds']) == checkpoint['strictGainFromBoundEvidence']
    protected = json.loads(verify_artifact(checkpoint['protectedActiveInputs']['before']).read_text())
    assert len(protected['files']) == 697
    assert protected['baselineOtherSubjects'] == checkpoint['protectedMachineM7Baseline']
    for binding in protected['files']:
        verify_artifact(binding)
    after = json.loads(verify_artifact(checkpoint['protectedActiveInputs']['after']).read_text())
    assert after['exact'] is True and after['protectedFileCount'] == 697
    assert after['changedPaths'] == [] and after['activeWrites'] == after['registryOrLedgerWrites'] == 0
    assert after['before'] == checkpoint['protectedActiveInputs']['before']
    provenance_net = json.loads(verify_artifact(checkpoint['integrationExactNetProvenance']).read_text())
    assert provenance_net['old321RetainedGoalIds'] == sorted(old_ids)
    assert provenance_net['newStrictGoalIds'] == sorted(now_ids-old_ids)
    assert provenance_net['lostGoalIds'] == provenance_net['outsideAssigned18AddedGoalIds'] == []
    assert provenance_net['netStrictIncrease'] == 17
    ci = json.loads(verify_artifact(checkpoint['previousActualGitHubCI']).read_text())
    assert ci['head'] == ci['originMainAtFinal'] == checkpoint['ciHead']
    assert ci['allEightMainJobsPassed'] and ci['allCurrentHeadChecksPassed'] and ci['allCurrentHeadWorkflowsPassed']
    assert len(ci['mainJobs']) == 8 and len(ci['checks']) == ci['checkCount'] == 14
    assert set(ci['expectedMainJobs']) == {j['name'] for j in ci['mainJobs']}
    assert all(j['status']=='completed' and j['conclusion']=='success' for j in ci['mainJobs']+ci['checks'])
    verify_artifact(checkpoint['stockSymlinkChecker'])
    spec = importlib.util.spec_from_file_location('production_schema_checkpoint', ROOT/'scripts/validate_schemas.py')
    production = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(production)
    errors = production.curriculum_symlink_errors(ROOT)
    assert not errors, errors
    if not args.preseal:
        own_seal_path = OWN/'FILES.finite-checkpoint.seal.json'
        own_seal = json.loads(own_seal_path.read_text())
        assert own_seal['fileCount'] == len(own_seal['files'])
        expected = {repository_path(row['path']) for row in own_seal['files']} | {own_seal_path}
        assert expected == physical_entries(OWN)
        for row in own_seal['files']:
            p = verify_artifact(row)
            if p.suffix == '.json':
                json.loads(p.read_text())
            elif p.suffix == '.py':
                ast.parse(p.read_text(), filename=str(p))
        assert own_seal['totalBytes'] == sum(row['bytes'] for row in own_seal['files'])
    own_json_files = sorted(p for p in physical_entries(OWN) if p.suffix == '.json')
    schema = json.loads(verify_artifact(checkpoint['productionRuntimeSchema']).read_text())
    for p in own_json_files:
        assert production.validate_file(str(p), schema), p
    print(json.dumps({**counts, 'allFiniteBytesAndEntrySetsExact':True,
        'strict':current['strictComplete'], 'denominator':current['denominator'],
        'percentage':current['percentage'], 'remaining':current['remaining'],
        'old321Retained':len(old_ids & now_ids), 'old321Lost':len(old_ids-now_ids),
        'strictGainFromBoundEvidence':len(now_ids-old_ids),
        'requiredChecksPassed':6, 'blockingIssueCount':0, 'issues':[],
        'protectedActiveFilesExact':697,
        'protectedMachineM7Baseline':protected['baselineOtherSubjects'],
        'activeChemistry':checkpoint['activeChemistry'], 'previousCIHead':ci['head'],
        'previousCIChecksPassed':14, 'previousCIMainJobsPassed':8,
        'actualRepositorySymlinkErrors':errors, 'stockSymlinkCheckerUnmodified':True,
        'ownJsonFilesCheckedByUnmodifiedProductionValidateFile':len(own_json_files),
        'ownSealVerified':not args.preseal, 'newScientificVotes':0,
        'fullBuildExecuted':False, 'wholeRepositorySchemaGateReservedForRoot':True,
        'activeIntegration':False, 'humanApproval':False, 'humanTrial':False}, indent=2))


if __name__ == '__main__':
    main()
