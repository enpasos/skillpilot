#!/usr/bin/env python3
"""Follow-up: one exact absent tool locator derived from a bound tsx tree.

The predecessor's real blocked runs stay immutable. No source failure or
directory prefix is exempted; other unknown reads still fail closed.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys

sys.dont_write_bytecode = True
parser = argparse.ArgumentParser()
parser.add_argument('--repo-root', required=True, type=Path)
parser.add_argument('--evidence-dir', required=True, type=Path)
options = parser.parse_args()
repo = options.repo_root.resolve(strict=True)
evidence = options.evidence_dir.resolve()
evidence.mkdir(parents=True, exist_ok=False)
sys.path.insert(0, str(repo / 'scripts'))
import test_repository_read_launcher as helpers
from identity_qa_read_launcher import run_readonly
from identity_qa_read_trace import FileBinding, ReadContract, RuntimeObservationContract, authenticate_trace, digest, calls, c_string


def membership(package):
    entries = {}
    for parent, directories, files in os.walk(package, followlinks=False):
        for name in sorted([*directories, *files]):
            path = Path(parent) / name
            relative = path.relative_to(package).as_posix()
            if path.is_symlink():
                entries[relative] = {'kind':'symlink', 'target':os.readlink(path)}
            elif path.is_dir():
                entries[relative] = {'kind':'directory'}
            elif path.is_file():
                entries[relative] = {'kind':'file', 'sha256':digest(path)}
            else:
                raise ValueError('Unsupported tool tree member type')
    return dict(sorted(entries.items()))


def membership_digest(entries):
    return hashlib.sha256(json.dumps(entries, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

TS = r'''import {readFileSync,readdirSync} from 'node:fs';
type Goal = {id:string; contains?:string[]; requires?:string[]};
type Landscape = {landscapeId:string; goals:Goal[]};
const entries:{name:string;bytes:number}[]=readdirSync('data',{withFileTypes:true})
 .filter(entry=>entry.isFile()).map(entry=>({name:entry.name,bytes:readFileSync('data/'+entry.name).length}))
 .sort((a,b)=>a.name.localeCompare(b.name));
const source:Landscape=JSON.parse(readFileSync('data/goal.json','utf8'));
console.log(JSON.stringify({producer:'actual-tsx-typescript-discovery',inputs:entries,owner:source.landscapeId,goalIds:source.goals.map(goal=>goal.id)}));
'''
rows = []
helpers.LauncherTests.setUpClass()
try:
    helper = helpers.LauncherTests('test_actual_two_role_node_discovery_with_bound_stdio_and_exact_runtime')
    subprocess.run(['git', '-C', str(helper.fixture.repo), 'bundle', 'create', str(evidence / 'fixture.git.bundle'), 'HEAD'], check=True)
    packages = ['tsx', 'esbuild', 'get-tsconfig', 'resolve-pkg-maps', '@esbuild/linux-x64']
    dependency_files = {str(path.resolve()): FileBinding('dependency', digest(path), 'exact installed tsx tool dependency pinned before the run')
                        for package in packages for path in (repo / 'app/node_modules' / package).rglob('*') if path.is_file()}
    tsx = repo / 'app/node_modules/tsx/dist/cli.mjs'
    package = (repo / 'app/node_modules/tsx').resolve(strict=True)
    tool_tree = membership(package)
    absent_locator = package / 'dist/package.json'
    if tool_tree.get('dist') != {'kind':'directory'} or 'dist/package.json' in tool_tree or absent_locator.exists() or absent_locator.is_symlink():
        raise ValueError('The exact measured tool-metadata locator is not absent from the bound tree')
    if package / 'dist' != (package / 'dist').resolve(strict=True):
        raise ValueError('Tool-metadata parent must not be an alias')
    for name, entry in tool_tree.items():
        if entry['kind'] == 'file' and dependency_files[str(package / name)].sha256 != entry['sha256']:
            raise ValueError('Tool membership and separately bound dependency bytes disagree')
    metadata_profile = {'purpose':'one-exact-observed-tool-metadata-absence-not-source-exception',
                        'packageRoot':str(package), 'packageManifestSha256':digest(package / 'package.json'),
                        'packageMembership':tool_tree, 'packageMembershipSha256':membership_digest(tool_tree),
                        'probe':{'operation':'openat', 'locator':str(absent_locator), 'openFlags':'O_RDONLY|O_CLOEXEC', 'outcome':'ENOENT'},
                        'observedPredecessor':'typescript-first-blocked', 'directoryPrefixPermitted':False,
                        'curriculumFailureExempted':False}
    (evidence / 'tool-metadata-profile.json').write_text(json.dumps(metadata_profile, indent=2) + '\n')
    for role in ('original', 'candidate'):
        root, _, contract, runtime = helper.context(role)
        script = root / 'tool/discovery.mts'
        script.write_text(TS)
        (root / 'package.json').write_text('{"type":"module"}\n')
        (root / 'tsconfig.json').write_text('{"compilerOptions":{"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext"}}\n')
        files = dict(contract.files)
        for name in ('tool/discovery.mts', 'package.json', 'tsconfig.json'):
            files[name] = FileBinding('tool', digest(root / name), 'explicit tiny TypeScript probe input pinned before launch')
        external = {**contract.external_files, **dependency_files}
        metadata = {path:set(ops) for path, ops in contract.external_directory_metadata.items()}
        for path in [*map(Path, external), repo]:
            for ancestor in path.parents:
                if ancestor.is_dir() and ancestor != Path('/'):
                    metadata.setdefault(str(ancestor), set()).update(('statx', 'newfstatat', 'stat', 'lstat'))
        if package.is_relative_to(root) or root.is_relative_to(package):
            raise ValueError('A role source tree cannot be declared as the external tool tree')
        exact_tool_failure = ('openat', str(absent_locator), 'ENOENT')
        bound = ReadContract(root, role, files, dict(contract.directories), aliases=dict(contract.aliases), external_files=external,
                             external_directory_metadata=metadata, expected_tool_failures=contract.expected_tool_failures | {exact_tool_failure},
                             required_discovery={'data'})
        role_output = evidence / role
        role_output.mkdir()
        for logical in files:
            destination = role_output / 'inputs' / logical
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes((root / logical).read_bytes())
        bound.verify_bytes_and_aliases()
        launch = run_readonly(role, root, root, [str(helper.node), str(tsx), '--no-cache', '--tsconfig', str(root / 'tsconfig.json'), str(script)],
                              role_output / 'controller-evidence')
        result = json.loads(launch.stdout)
        observed = []
        for _, _, pid, operation, args, outcome in calls(launch.trace):
            if operation == 'openat' and c_string(args[1]) == str(absent_locator):
                if args[2:] != ['O_RDONLY|O_CLOEXEC'] or not outcome.startswith('-1 ENOENT '):
                    raise ValueError('Actual exact tool locator operation/flags/outcome differ from its measured binding')
                observed.append({'hostPid':pid,'operation':operation,'locator':str(absent_locator),'openFlags':args[2], 'outcome':'ENOENT'})
        if not observed or membership(package) != tool_tree:
            raise ValueError('Exact probe was not observed or bound tool membership changed')
        expected_ids = ['legacy'] if role == 'original' else ['00000000-0000-4000-8000-000000000001']
        if launch.returncode != 0 or result['goalIds'] != expected_ids or {row['name'] for row in result['inputs']} != {name for name, _ in helper.fixture.git_data_selector}:
            raise RuntimeError('Actual TypeScript output does not match its physical role input')
        actual_runtime = RuntimeObservationContract(digest(helper.node), platform.release(), launch.trace_sha256,
                                                    dict(runtime.paths), absent_fd_probes=runtime.absent_fd_probes)
        try:
            facts = authenticate_trace(launch.trace, root, bound, launch=launch, runtime=actual_runtime)
            authentication = {'status':'bounded-facts-only', 'facts':facts, 'sourceAQaValidityClaimed':False}
        except ValueError as error:
            authentication = {'status':'blocked', 'reason':str(error), 'sourceAQaValidityClaimed':False}
        (role_output / 'producer.strace').write_text(launch.trace)
        (role_output / 'stdout.json').write_bytes(launch.stdout)
        (role_output / 'stderr.txt').write_bytes(launch.stderr)
        (role_output / 'launch.json').write_text(json.dumps(launch.receipt(), indent=2) + '\n')
        bindings = {'files':{path:vars(binding) for path,binding in files.items()},
                    'externalFiles':{path:vars(binding) for path,binding in external.items()},
                    'externalDirectoryMetadata':{path:sorted(ops) for path,ops in metadata.items()},
                    'originalFixtureGitCommit':helper.fixture.commit, 'fixtureGitBundleSha256':digest(evidence / 'fixture.git.bundle'),
                    'candidateTypedFields':helper.fixture.fields,
                    'existingProjectionKernelSha256':digest(repo / 'scripts/canonical_goal_identity_migration.py'),
                    'actual164ProductionProofClaimed':False}
        (role_output / 'bindings.json').write_text(json.dumps(bindings, indent=2) + '\n')
        rows.append({'role':role, 'producerExitCode':launch.returncode, 'actualTypeScriptOutput':result,
                     'authentication':authentication, 'launch':launch.receipt(),
                     'exactBoundToolMetadataObservations':observed, 'toolMembershipBeforeAfterEqual':True,
                     'sourceInputsBeforeAfterChecked':True})
    (evidence / 'discovery.mts').write_text(TS)
    (evidence / 'results.json').write_text(json.dumps({'purpose':'actual-small-tsx-discovery-not-production-QA-acceptance',
        'runs':rows, 'capture19Changed':False, 'aqa02_03Claimed':False}, indent=2) + '\n')
    print(json.dumps([{'role':row['role'],'producerExitCode':row['producerExitCode'],'authentication':row['authentication']['status'],
                       'reason':row['authentication'].get('reason')} for row in rows]))
finally:
    helpers.LauncherTests.tearDownClass()
