#!/usr/bin/env python3
"""Tiny actual materializer + exact app cwd/namespace dependency layout."""
import argparse
import json
from pathlib import Path
import platform
import shutil
import subprocess
import sys

sys.dont_write_bytecode=True
parser=argparse.ArgumentParser()
parser.add_argument('--repo-root',required=True,type=Path)
parser.add_argument('--source-tool-tree',required=True,type=Path)
parser.add_argument('--expected-tool-tree-sha256',required=True)
parser.add_argument('--evidence-dir',required=True,type=Path)
args=parser.parse_args();repo=args.repo_root.resolve(strict=True)
sys.path.insert(0,str(repo/'scripts'))
from identity_qa_read_trace import FileBinding,ReadContract,RuntimeObservationContract,authenticate_trace,calls,c_string,digest
from identity_qa_tool_tree import bind_dependency_tree
from identity_qa_namespace_view import run_prepared_namespace
from identity_qa_private_capture import dependency_inventory,inventory_digest
from test_repository_prepared_namespace import PreparedNamespaceTests

args.evidence_dir.mkdir(parents=True,exist_ok=False);evidence=args.evidence_dir.resolve()
if inventory_digest(dependency_inventory(args.source_tool_tree))!=args.expected_tool_tree_sha256:
    raise ValueError('External complete source tool-tree pin differs')
TS='''import {readFileSync} from 'node:fs';
type Goal={id:string;requires?:string[];contains?:string[]};
type Landscape={landscapeId:string;goals:Goal[]};
const source:Landscape=JSON.parse(readFileSync('../curricula/DE/Gymnasium/canonical/fixture.json','utf8'));
console.log(JSON.stringify({producer:'actual-prepared-layout-tsx',owner:source.landscapeId,goalIds:source.goals.map(goal=>goal.id)}));
'''
RULES={
 '/proc/self/cgroup':{'operations':['openat','read','close'],'resultClass':'volatile-kernel-observation'},
 '/proc/self/maps':{'operations':['openat','newfstatat','read','close'],'resultClass':'volatile-kernel-observation'},
 '/proc/self/exe':{'operations':['readlink'],'resultClass':'volatile-kernel-observation'},
 '/proc/meminfo':{'operations':['openat','read','close'],'resultClass':'volatile-kernel-observation'},
 '/sys/fs/cgroup/non-systemd/memory.max':{'operations':['openat'],'resultClass':'ENOENT-probe'},
 '/sys/fs/cgroup/non-systemd/memory.high':{'operations':['openat'],'resultClass':'ENOENT-probe'},
 RuntimeObservationContract.NODE_VM_PATH:RuntimeObservationContract.measured_node_vm_rule()}
PreparedNamespaceTests.setUpClass()
rows=[]
try:
    fixture=PreparedNamespaceTests('test_actual_both_role_namespace_exec_fd_alias_types_and_closed_directory')
    top,base,views,graph_path,before,after=fixture.pair(installed_source=args.source_tool_tree,source_files={
        'app/scripts/discovery.mts':TS.encode(),'app/tsconfig.json':b'{"compilerOptions":{"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext"}}\n'})
    capture=views['original']._capture
    if capture._tree_sha256!=args.expected_tool_tree_sha256:raise ValueError('Actual materializer capture differs from external tool pin')
    (evidence/'preparation.json').write_bytes((base/'preparation.json').read_bytes())
    (evidence/'fixture-proof.raw.json').write_bytes((base/'source-a.json').read_bytes())
    subprocess.run(['git','-C',capture.prepared_receipt()['hostRepo'],'bundle','create',str(evidence/'fixture.git.bundle'),'HEAD'],check=True)
    (evidence/'capture-receipt.json').write_text(json.dumps(capture.receipt(),indent=2)+'\n')
    node=Path(shutil.which('node')).resolve(strict=True)
    external={**fixture.external, str(node):FileBinding('tool',digest(node),'actual separately pinned Node executable'),
              '/dev/null':FileBinding('tool',digest('/dev/null'),'actual Node stdin device'),
              '/etc/ssl/openssl.cnf':FileBinding('tool',digest('/etc/ssl/openssl.cnf'),'explicit Node configuration bytes')}
    for token in subprocess.check_output(['ldd',str(node)],text=True).split():
        if token.startswith('/') and Path(token).is_file():external[token]=FileBinding('dependency',digest(token),'exact Node native dependency')
    for role,expected in (('original',before),('candidate',after)):
        root=views[role]._roles[role];old=fixture.contract(role,views,graph_path)
        metadata={str(parent):{'statx'} for parent in root.parents if parent!=Path('/')}
        contract=ReadContract(root,role,dict(old.files),{**old.directories,'app/scripts':[]},external_files=external,
            external_directory_metadata=metadata,expected_tool_failures=old.expected_tool_failures,mount_views=tuple(views.values()))
        out=evidence/role;out.mkdir()
        launch=run_prepared_namespace(role,views,[str(node),str(views[role].visible_root/'tsx/dist/cli.mjs'),
            '--no-cache','--tsconfig',str(root/'app/tsconfig.json'),str(root/'app/scripts/discovery.mts')],out/'controller')
        result=json.loads(launch.stdout)
        if result['goalIds']!=[goal['id'] for goal in expected['goals']]:raise ValueError('Actual producer output differs from role source')
        observed=set()
        for event in calls(launch.trace):
            if event[3] in ('open','openat','readlink','stat','statx','newfstatat'):
                index=1 if event[3] in ('openat','statx','newfstatat') else 0
                if event[4][index].startswith('"'):observed.add(c_string(event[4][index]))
        rules={path:value for path,value in RULES.items() if path in observed}
        runtime=RuntimeObservationContract(digest(node),platform.release(),launch.trace_sha256,rules,absent_fd_probes=range(3,17))
        bound=tuple(bind_dependency_tree(view,launch) for view in views.values())
        try:
            facts=authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,runtime=runtime,dependency_trees=bound)
            authentication={'status':'bounded-facts-pass','facts':facts}
        except ValueError as error:authentication={'status':'blocked','firstFinding':str(error)}
        for view in views.values():view.verify()
        (out/'producer.strace').write_text(launch.trace)
        (out/'stdout.json').write_bytes(launch.stdout);(out/'stderr.txt').write_bytes(launch.stderr)
        (out/'launch.json').write_text(json.dumps(launch.receipt(),indent=2)+'\n')
        (out/'source-graph.json').write_bytes((root/graph_path).read_bytes())
        for logical in contract.files:
            copied=out/'inputs'/logical;copied.parent.mkdir(parents=True,exist_ok=True);copied.write_bytes((root/logical).read_bytes())
        rows.append({'role':role,'producerExitCode':launch.returncode,'output':result,'authentication':authentication,
                     'launch':launch.receipt(),'sourceAQaValidityClaimed':False})
    (evidence/'discovery.mts').write_text(TS)
    (evidence/'results.json').write_text(json.dumps({'purpose':'actual-small-preparer-layout-native-tsx-not-production-qa',
       'runs':rows,'capture19Changed':False,'largeSourceAProducerRun':False},indent=2)+'\n')
    print(json.dumps([{'role':r['role'],'producerExitCode':r['producerExitCode'],'authentication':r['authentication']['status'],
                      'firstFinding':r['authentication'].get('firstFinding')} for r in rows]))
finally:
    PreparedNamespaceTests.tearDownClass()
