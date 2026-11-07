#!/usr/bin/env python3
"""Tiny actual prepared parent metadata and ordinary closed-scope controls."""
import argparse
import copy
import json
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import unittest

sys.dont_write_bytecode=True
from identity_qa_namespace_parent import prepared_namespace_parents,require_prepared_parent,bind_namespace_parent,PreparedNamespaceParent
from identity_qa_namespace_view import run_prepared_namespace
from identity_qa_read_trace import FileBinding,ReadContract,RuntimeObservationContract,authenticate_trace,calls,c_string,digest
from identity_qa_tool_tree import bind_dependency_tree,negative_metadata_locator
import test_repository_prepared_namespace as prepared_fixture

EVIDENCE=None
RUNS=[]
JS=r'''import fs from 'node:fs';import {createRequire} from 'node:module';
try{createRequire(import.meta.url).resolve('controlled-uninstalled-native-fixture')}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error}
const root=new URL('../../..',import.meta.url);
let writable=true,accessError=null;try{fs.accessSync(root,fs.constants.W_OK)}catch(error){writable=false;accessError=error.code}
const members=fs.readdirSync(root,{withFileTypes:true}).map(e=>({name:e.name,kind:e.isDirectory()?'directory':e.isSymbolicLink()?'symlink':'file'})).sort((a,b)=>a.name.localeCompare(b.name));
const source=JSON.parse(fs.readFileSync('../curricula/DE/Gymnasium/canonical/fixture.json','utf8'));
console.log(JSON.stringify({writable,accessError,members,goalIds:source.goals.map(g=>g.id)}));
'''
RULES={
 '/proc/self/cgroup':{'operations':['openat','read','close'],'resultClass':'volatile-kernel-observation'},
 '/proc/self/maps':{'operations':['openat','newfstatat','read','close'],'resultClass':'volatile-kernel-observation'},
 '/proc/self/exe':{'operations':['readlink'],'resultClass':'volatile-kernel-observation'},
 '/proc/meminfo':{'operations':['openat','read','close'],'resultClass':'volatile-kernel-observation'},
 '/sys/fs/cgroup/non-systemd/memory.max':{'operations':['openat'],'resultClass':'ENOENT-probe'},
 '/sys/fs/cgroup/non-systemd/memory.high':{'operations':['openat'],'resultClass':'ENOENT-probe'},
 RuntimeObservationContract.NODE_VM_PATH:RuntimeObservationContract.measured_node_vm_rule()}


class NamespaceParentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        prepared_fixture.PreparedNamespaceTests.setUpClass()
        cls.fixture=prepared_fixture.PreparedNamespaceTests('test_actual_both_role_namespace_exec_fd_alias_types_and_closed_directory')
        cls.node=Path(shutil.which('node')).resolve(strict=True)
        cls.installed=cls.fixture.base/'parent-node-fixture';(cls.installed/'pkg').mkdir(parents=True)
        (cls.installed/'pkg/probe.mjs').write_text(JS)

    @classmethod
    def tearDownClass(cls):prepared_fixture.PreparedNamespaceTests.tearDownClass()

    def pair(self):return self.fixture.pair(installed_source=self.installed)

    def actual(self,role='original',parent_mount=True,existing_search_directory=False):
        top,base,views,graph,before,after=self.pair()
        if existing_search_directory:(views[role]._roles[role]/'node_modules').mkdir()
        parents=prepared_namespace_parents(views);parent=parents[role];root=parent.root
        old=self.fixture.contract(role,views,graph)
        external={**old.external_files,str(self.node):FileBinding('tool',digest(self.node),'actual separately pinned Node executable'),
            '/dev/null':FileBinding('tool',digest('/dev/null'),'actual stdin device'),
            '/etc/ssl/openssl.cnf':FileBinding('tool',digest('/etc/ssl/openssl.cnf'),'actual Node config')}
        for token in subprocess.check_output(['ldd',str(self.node)],text=True).split():
            if token.startswith('/') and Path(token).is_file():external[token]=FileBinding('dependency',digest(token),'exact Node native dependency')
        contract=ReadContract(root,role,dict(old.files),{**old.directories,'.':[(r['name'],r['kind']) for r in parent.mount_binding()['members']]},
            external_files=external,external_directory_metadata={str(p):{'statx'} for p in root.parents if p!=Path('/')},
            expected_tool_failures=old.expected_tool_failures,mount_views=tuple(views.values()))
        launch=run_prepared_namespace(role,views,[str(self.node),str(views[role].visible_root/'pkg/probe.mjs')],top/'controller',
                                      namespace_parent=parent if parent_mount else None)
        output=json.loads(launch.stdout)
        record={'case':self.id().split('.')[-1]+'.'+role,'launch':launch.receipt(),'stdout':output,
            'producerExitCode':launch.returncode,'sourceAQaValidityClaimed':False}
        RUNS.append(record)
        if EVIDENCE:
            dest=EVIDENCE/record['case'];dest.mkdir()
            for name,raw in [('producer.strace',launch.trace.encode()),('recorder.strace',launch.recorder_trace.encode()),
                             ('stdout.json',launch.stdout),('stderr.txt',launch.stderr)]: (dest/name).write_bytes(raw)
            (dest/'preparation.json').write_bytes((base/'preparation.json').read_bytes())
            (dest/'fixture-proof.raw.json').write_bytes((base/'source-a.json').read_bytes())
            (dest/'parent-membership.json').write_text(json.dumps(dict(parent.mount_binding()),indent=2)+'\n')
        return parent,views,contract,launch,record

    def test_actual_both_role_ro_membership_and_exact_negative_then_higher_boundary(self):
        for role in ('original','candidate'):
            parent,views,contract,launch,record=self.actual(role)
            output=record['stdout'];self.assertFalse(output['writable']);self.assertEqual(output['accessError'],'EROFS')
            self.assertEqual(output['members'],[{'name':r['name'],'kind':r['kind']} for r in parent.mount_binding()['members']])
            self.assertEqual(output['goalIds'],['old-id' if role=='original' else '00000000-0000-4000-8000-000000000001'])
            bound=bind_namespace_parent(parent,launch).verify(launch,contract)
            event=next(e for e in calls(launch.trace) if e[3]=='statx' and e[4][1]=='"'+str(parent.root/'node_modules')+'"')
            fact=bound.prove_negative_lookup(event,parent.root/'node_modules',launch.cwd)
            self.assertFalse(fact['payloadReadAuthorized']);self.assertEqual(fact['errno'],'ENOENT')
            observed=set()
            for e in calls(launch.trace):
                if e[3] in ('open','openat','readlink','stat','statx','newfstatat'):
                    index=1 if e[3] in ('openat','statx','newfstatat') else 0
                    if e[4][index].startswith('"'):observed.add(c_string(e[4][index]))
            runtime=RuntimeObservationContract(digest(self.node),platform.release(),launch.trace_sha256,
                {p:v for p,v in RULES.items() if p in observed},absent_fd_probes=range(3,17))
            with self.assertRaises(ValueError) as error:
                authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,runtime=runtime,
                    dependency_trees=tuple(bind_dependency_tree(v,launch) for v in views.values()),namespace_parents=[bound])
            self.assertIn(str(parent.root.parent/'node_modules'),str(error.exception))
            record.update(parentAbsenceFact=fact,nextAuthenticationBoundary=str(error.exception),wholeReadAuthenticationPassed=False)

    def test_absent_actual_parent_mount_and_fake_or_other_scope_are_closed(self):
        parent,views,contract,launch,record=self.actual(parent_mount=False)
        with self.assertRaisesRegex(ValueError,'Exact readonly prepared parent mount'):
            bind_namespace_parent(parent,launch)
        with self.assertRaisesRegex(ValueError,'Actual factory-minted'):
            PreparedNamespaceParent(object(),views['original'])
        with self.assertRaisesRegex(ValueError,'Actual factory-minted'):
            require_prepared_parent({'readonly':True,'complete':True},parent.root,parent.role,tuple(views.values()))
        with self.assertRaisesRegex(ValueError,'another role/root/capture'):
            require_prepared_parent(parent,parent.root.parent,'original',tuple(views.values()))
        with self.assertRaisesRegex(ValueError,'Actual factory-minted read-launch'):
            receipt=launch.receipt();receipt['readonlyNamespaceParents']=[{**dict(parent.mount_binding()),'readonly':False}]
            bind_namespace_parent(parent,receipt)
        record['unboundMountAndCallerClaimsRejected']=True

    def test_source_tool_classification_complete_scope_and_missing_payload_remain_errors(self):
        parent,views,contract,launch,record=self.actual();bound=bind_namespace_parent(parent,launch)
        graph='curricula/DE/Gymnasium/canonical/fixture.json'
        for mutation in ('omit-source','reclassify-source'):
            files=dict(contract.files)
            if mutation=='omit-source':del files[graph]
            else:files[graph]=FileBinding('tool',files[graph].sha256,'invalid source reclassification')
            wrong=ReadContract(contract.root,contract.role,files,dict(contract.directories),external_files=dict(contract.external_files),
                               mount_views=tuple(views.values()))
            with self.assertRaisesRegex(ValueError,'complete expected source/tool|reclassified'):
                bound.verify(launch,wrong)
        (parent.root/graph).unlink()
        with self.assertRaises((ValueError,FileNotFoundError)):parent.verify()
        record['missingSourceAndIncompleteOrReclassifiedContractsRejected']=True

    def test_actual_complete_parent_membership_changes_are_rejected(self):
        for mutation in ('new-member','type','link-text'):
            top,base,views,graph,before,after=self.pair();root=views['original']._roles['original']
            if mutation=='type':(root/'local-slot').write_text('owned unselected metadata')
            if mutation=='link-text':(root/'local-alias').symlink_to('app',target_is_directory=True)
            parent=prepared_namespace_parents(views)['original']
            if mutation=='new-member':(root/'extra-member').mkdir()
            elif mutation=='type':(root/'local-slot').unlink();(root/'local-slot').mkdir()
            else:(root/'local-alias').unlink();(root/'local-alias').symlink_to('curricula',target_is_directory=True)
            with self.assertRaisesRegex(ValueError,'complete immediate membership changed'):parent.verify()

    def test_actual_unrepresented_source_overlay_cannot_mint_parent_scope(self):
        top,base,views,graph,before,after=self.fixture.pair(installed_source=self.installed,
            source_files={'curricula/DE/Gymnasium/assets/utf16-values.csv':'value\n1\n'.encode('utf-16')})
        preparation=views['original']._capture.prepared_receipt()
        self.assertTrue(preparation['binaryReadOnlyMounts'])
        with self.assertRaisesRegex(ValueError,'source overlays not represented'):prepared_namespace_parents(views)
        if EVIDENCE:
            dest=EVIDENCE/'source-overlay-control';dest.mkdir()
            (dest/'preparation.json').write_bytes((base/'preparation.json').read_bytes())
            (dest/'fixture-proof.raw.json').write_bytes((base/'source-a.json').read_bytes())
            item=preparation['binaryReadOnlyMounts'][0]
            (dest/'actual-captured-source.bytes').write_bytes(Path(item['hostPath']).read_bytes())
            (dest/'rejection.json').write_text(json.dumps({'expectedError':'source overlays not represented',
                'actualBinaryMounts':len(preparation['binaryReadOnlyMounts']),'binaryCapture':item,
                'rootStubBytes':(views['original']._roles['original']/item['path']).stat().st_size,
                'producerLaunched':False,'sourceAQaValidityClaimed':False},indent=2)+'\n')
            subprocess.run(['git','-C',preparation['hostRepo'],'bundle','create',str(dest/'fixture.git.bundle'),'HEAD'],check=True)

    def test_existing_member_wrong_errno_flags_and_payload_operations_do_not_prove_absence(self):
        parent,views,contract,launch,record=self.actual(existing_search_directory=True)
        bound=bind_namespace_parent(parent,launch)
        event=next(e for e in calls(launch.trace) if e[3]=='statx' and e[4][1]=='"'+str(parent.root/'node_modules')+'"')
        self.assertFalse(event[5].startswith('-1 '))
        with self.assertRaisesRegex(ValueError,'actual ENOENT'):
            bound.prove_negative_lookup(event,parent.root/'node_modules',launch.cwd)
        # Pure argument controls never alter or submit recorder bytes.
        missing=parent.root/'node_modules';cwd=launch.cwd
        for operation,args,result in [
            ('statx',['AT_FDCWD','"'+str(missing)+'"','AT_EMPTY_PATH','STATX_ALL','0x0'],'-1 ENOENT (No such file or directory)'),
            ('statx',['AT_FDCWD','"'+str(missing)+'"','AT_STATX_SYNC_AS_STAT','STATX_ALL','0x0'],'-1 EACCES (Permission denied)'),
            ('openat',['AT_FDCWD','"'+str(missing)+'"','O_WRONLY'],'-1 ENOENT (No such file or directory)')]:
            with self.assertRaises(ValueError):negative_metadata_locator((0,0,1,operation,args,result),missing,cwd)
        self.assertFalse(bound.contains(parent.root.parent/'node_modules'))
        self.assertFalse(bound.contains(parent.root/'curricula'/'missing.json'))
        record['actualExistingMemberAndPureNearControlsRejected']=True

    def test_other_actual_executable_does_not_inherit_node_search_authority(self):
        top,base,views,graph,before,after=self.fixture.pair()
        parent=prepared_namespace_parents(views)['original']
        launch=run_prepared_namespace('original',views,[str(views['original'].visible_root/'pkg/helper')],
                                      top/'controller',namespace_parent=parent)
        self.assertEqual(json.loads(launch.stdout),before)
        with self.assertRaisesRegex(ValueError,'bound actual Node executable'):bind_namespace_parent(parent,launch)
        row={'case':self.id().split('.')[-1],'launch':launch.receipt(),'producerExitCode':launch.returncode,
             'differentActualExecutableRejected':True,'sourceAQaValidityClaimed':False}
        RUNS.append(row)
        if EVIDENCE:
            dest=EVIDENCE/row['case'];dest.mkdir()
            (dest/'producer.strace').write_text(launch.trace);(dest/'recorder.strace').write_text(launch.recorder_trace)


if __name__=='__main__':
    parser=argparse.ArgumentParser(add_help=False);parser.add_argument('--evidence-dir',type=Path)
    known,rest=parser.parse_known_args();EVIDENCE=known.evidence_dir
    if EVIDENCE:EVIDENCE=EVIDENCE.resolve();EVIDENCE.mkdir(parents=True,exist_ok=False);(EVIDENCE/'probe.mjs').write_text(JS)
    program=unittest.main(argv=[sys.argv[0],*rest],exit=False)
    if EVIDENCE:(EVIDENCE/'results.json').write_text(json.dumps({'purpose':'actual-prepared-role-parent-contract-not-SourceA-QA',
        'testsRun':program.result.testsRun,'errors':len(program.result.errors),'failures':len(program.result.failures),
        'skips':len(program.result.skipped),'actualNativeRuns':RUNS,'capture19Changed':False},indent=2)+'\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
