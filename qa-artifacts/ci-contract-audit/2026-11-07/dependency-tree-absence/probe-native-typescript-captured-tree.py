#!/usr/bin/env python3
"""Small real tsx probe on a genuine complete private tool-root capture."""
import argparse
import importlib.util
import json
from pathlib import Path
import platform
import subprocess
import sys

sys.dont_write_bytecode = True
parser=argparse.ArgumentParser()
parser.add_argument('--repo-root',type=Path,required=True)
parser.add_argument('--base-commit',required=True)
parser.add_argument('--source-tool-tree',type=Path,required=True)
parser.add_argument('--expected-tool-tree-sha256',required=True)
parser.add_argument('--private-root',type=Path,required=True)
parser.add_argument('--evidence-dir',type=Path,required=True)
args=parser.parse_args()
repo=args.repo_root.resolve(strict=True)
args.private_root.mkdir(parents=True,exist_ok=False)
args.evidence_dir.mkdir(parents=True,exist_ok=False)
evidence=args.evidence_dir.resolve(strict=True)
sys.path.insert(0,str(repo/'scripts'))
import test_repository_read_launcher as helpers
from identity_qa_read_launcher import run_readonly
from identity_qa_read_trace import FileBinding,ReadContract,RuntimeObservationContract,authenticate_trace,digest,calls,c_string
from identity_qa_tool_tree import capture_dependency_tree,bind_dependency_tree

spec=importlib.util.spec_from_file_location('actual_tree_probe_kernel',repo/'scripts/canonical_goal_identity_migration.py')
kernel=importlib.util.module_from_spec(spec);spec.loader.exec_module(kernel)
snapshot=kernel.GitSnapshot(repo,args.base_commit)
capture=capture_dependency_tree(snapshot,args.source_tool_tree,args.private_root/'node_modules',args.expected_tool_tree_sha256,64_000_000,args.private_root)
snapshot.close()
(evidence/'capture-receipt.json').write_text(json.dumps(capture.receipt(),indent=2)+'\n')
(evidence/'actual-source-base.txt').write_text(args.base_commit+'\n')
TS='''import {readFileSync,readdirSync} from 'node:fs';
type Goal={id:string;requires?:string[];contains?:string[]};
type Landscape={landscapeId:string;goals:Goal[]};
const inputs:{name:string;bytes:number}[]=readdirSync('data',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>({name:e.name,bytes:readFileSync('data/'+e.name).length})).sort((a,b)=>a.name.localeCompare(b.name));
const source:Landscape=JSON.parse(readFileSync('data/goal.json','utf8'));
console.log(JSON.stringify({producer:'actual-tsx-on-private-complete-tool-tree',inputs,owner:source.landscapeId,goalIds:source.goals.map(g=>g.id)}));
'''
rows=[]
helpers.LauncherTests.setUpClass()
try:
    helper=helpers.LauncherTests('test_actual_two_role_node_discovery_with_bound_stdio_and_exact_runtime')
    subprocess.run(['git','-C',str(helper.fixture.repo),'bundle','create',str(evidence/'fixture.git.bundle'),'HEAD'],check=True)
    for role in ('original','candidate'):
        root,_,old,runtime=helper.context(role)
        script=root/'tool/discovery.mts';script.write_text(TS)
        (root/'package.json').write_text('{"type":"module"}\n')
        (root/'tsconfig.json').write_text('{"compilerOptions":{"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext"}}\n')
        files=dict(old.files)
        for name in ('tool/discovery.mts','package.json','tsconfig.json'):
            files[name]=FileBinding('tool',digest(root/name),'exact tiny TypeScript producer/config pinned before launch')
        external={**old.external_files,**capture.file_bindings()}
        metadata={path:set(ops) for path,ops in old.external_directory_metadata.items()}
        metadata.update({path:set(ops) for path,ops in capture.directory_metadata().items()})
        for parent in capture.root.parents:
            if parent!=Path('/'):metadata.setdefault(str(parent),set()).update(('statx','newfstatat','stat','lstat'))
        contract=ReadContract(root,role,files,dict(old.directories),aliases=dict(old.aliases),external_files=external,
                              external_directory_metadata=metadata,expected_tool_failures=old.expected_tool_failures,required_discovery={'data'})
        role_evidence=evidence/role;role_evidence.mkdir()
        for logical in files:
            dest=role_evidence/'inputs'/logical;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes((root/logical).read_bytes())
        contract.verify_bytes_and_aliases()
        launch=run_readonly(role,root,root,[str(helper.node),str(capture.root/'tsx/dist/cli.mjs'),'--no-cache','--tsconfig',str(root/'tsconfig.json'),str(script)],
                            role_evidence/'controller',dependency_captures=(capture,))
        bound=bind_dependency_tree(capture,launch)
        output=json.loads(launch.stdout)
        expected=['legacy'] if role=='original' else ['00000000-0000-4000-8000-000000000001']
        if output['goalIds']!=expected:raise RuntimeError('Actual TS output differs from physical role bytes')
        measured_runtime=RuntimeObservationContract(digest(helper.node),platform.release(),launch.trace_sha256,dict(runtime.paths),absent_fd_probes=runtime.absent_fd_probes)
        try:
            facts=authenticate_trace(launch.trace,root,contract,launch=launch,runtime=measured_runtime,dependency_trees=(bound,))
            authentication={'status':'bounded-facts-only','facts':facts}
        except ValueError as error:
            authentication={'status':'blocked','firstFinding':str(error)}
        # Evidence only: exercise the SAME absence prover on actual absolute
        # lookup events in the checked prefix before the observed OS blocker.
        # This does not recover or mint a successful full authentication report.
        prefix_proofs=[]
        for event in calls(launch.trace):
            operation=event[3]
            if operation not in ('open','openat','stat','lstat','statx','newfstatat','access'):
                continue
            token=event[4][1] if operation in ('openat','statx','newfstatat') else event[4][0]
            if not token.startswith('"'):
                continue
            path=Path(c_string(token))
            if str(path)=='/proc/sys/vm/overcommit_memory':
                break
            if path.is_absolute() and bound.contains(path) and event[5].startswith('-1 ENOENT '):
                prefix_proofs.append(bound.prove_negative_lookup(event,path,root))
        capture.verify();contract.verify_bytes_and_aliases()
        (role_evidence/'producer.strace').write_text(launch.trace)
        (role_evidence/'stdout.json').write_bytes(launch.stdout)
        (role_evidence/'stderr.txt').write_bytes(launch.stderr)
        (role_evidence/'launch.json').write_text(json.dumps(launch.receipt(),indent=2)+'\n')
        (role_evidence/'bindings.json').write_text(json.dumps({'files':{p:vars(b) for p,b in files.items()},'externalFiles':{p:vars(b) for p,b in external.items()},
            'externalDirectoryMetadata':{p:sorted(v) for p,v in metadata.items()},'capture':capture.receipt()},indent=2)+'\n')
        rows.append({'role':role,'producerExitCode':launch.returncode,'output':output,'authentication':authentication,
                     'actualToolAbsenceProofsBeforeObservedOsBlock':prefix_proofs,
                     'launch':launch.receipt(),'captureAndSourceBytesAfterChecked':True,'qaValidityClaimed':False})
    (evidence/'discovery.mts').write_text(TS)
    (evidence/'results.json').write_text(json.dumps({'purpose':'actual-small-private-capture-tsx-probe-not-SourceA-QA-acceptance','runs':rows,
        'capture19Changed':False,'originalFixtureGitCommit':helper.fixture.commit,'candidateTypedFields':helper.fixture.fields},indent=2)+'\n')
    print(json.dumps([{'role':r['role'],'producerExitCode':r['producerExitCode'],'authentication':r['authentication']['status'],
                       'firstFinding':r['authentication'].get('firstFinding')} for r in rows]))
finally:
    helpers.LauncherTests.tearDownClass()
