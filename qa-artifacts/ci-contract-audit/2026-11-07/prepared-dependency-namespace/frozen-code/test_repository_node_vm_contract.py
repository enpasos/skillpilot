#!/usr/bin/env python3
"""Normal one-byte Node OS observations and closed contract controls."""
import argparse
import json
from pathlib import Path
import platform
import sys
import tempfile
import unittest

sys.dont_write_bytecode=True
import test_repository_read_launcher as fixture_module
from identity_qa_read_launcher import run_readonly
from identity_qa_read_trace import FileBinding,ReadContract,RuntimeObservationContract,authenticate_trace,digest

EVIDENCE=None
RUNS=[]
JS=r'''import fs from 'node:fs';
const inputs=fs.readdirSync('data',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>({name:e.name,bytes:fs.readFileSync('data/'+e.name).length}));
const fd=fs.openSync('/proc/sys/vm/overcommit_memory','r');
const bytes=fs.readSync(fd,Buffer.alloc(Number(process.argv[2])),0,Number(process.argv[2]),null);
fs.closeSync(fd);
console.log(JSON.stringify({inputs,bytes}));
'''


class NodeVmTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture_module.LauncherTests.setUpClass()
        cls.helper=fixture_module.LauncherTests('test_actual_two_role_node_discovery_with_bound_stdio_and_exact_runtime')
        if digest(cls.helper.node)!=RuntimeObservationContract.NODE_VM_EXECUTABLE_SHA256:
            raise RuntimeError('This Node binary needs its own separately reviewed VM observation profile')

    @classmethod
    def tearDownClass(cls):
        fixture_module.LauncherTests.tearDownClass()

    def launch(self,role='original',width=1):
        root,script,old,baseline=self.helper.context(role)
        script.write_text(JS)
        files=dict(old.files)
        files['tool/discovery.mjs']=FileBinding('tool',digest(script),'exact ordinary Node one-byte OS observation fixture')
        contract=ReadContract(root,role,files,dict(old.directories),aliases=dict(old.aliases),external_files=dict(old.external_files),
                              external_directory_metadata=dict(old.external_directory_metadata),expected_tool_failures=old.expected_tool_failures,required_discovery={'data'})
        directory=Path(tempfile.mkdtemp(prefix='node-vm-owned-',dir=self.helper.fixture.base));directory.rmdir()
        launch=run_readonly(role,root,root,[str(self.helper.node),str(script),str(width)],directory)
        rules=dict(baseline.paths);rules[baseline.NODE_VM_PATH]=baseline.measured_node_vm_rule()
        runtime=RuntimeObservationContract(digest(self.helper.node),platform.release(),launch.trace_sha256,rules,absent_fd_probes=baseline.absent_fd_probes)
        record={'case':self.id().split('.')[-1]+'.'+role,'width':width,'launch':launch.receipt(),'producerExitCode':launch.returncode,
                'stdout':json.loads(launch.stdout),'qaValidityClaimed':False}
        RUNS.append(record)
        if EVIDENCE:
            dest=EVIDENCE/record['case'];dest.mkdir()
            (dest/'producer.strace').write_text(launch.trace)
            (dest/'recorder.strace').write_text(launch.recorder_trace)
            (dest/'interpreted-recorder.strace').write_text(launch.recorder_trace)
            (dest/'stdout.json').write_bytes(launch.stdout);(dest/'stderr.txt').write_bytes(launch.stderr)
        return contract,runtime,launch,record

    def test_actual_one_byte_reads_in_both_roles(self):
        for role in ('original','candidate'):
            contract,runtime,launch,record=self.launch(role)
            facts=authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,runtime=runtime)
            observed=[r for r in facts['volatileRuntimeObservations'] if r.get('declaredPath')==runtime.NODE_VM_PATH]
            self.assertGreaterEqual(len(observed),3)
            self.assertEqual({r['operation'] for r in observed},{'openat','read','close'})
            self.assertTrue(all(r['executableSha256']==runtime.NODE_VM_EXECUTABLE_SHA256 and r['launchTraceSha256']==launch.trace_sha256
                                and r['contentSha256'] is None and not r['immutableCurriculumInput'] for r in observed))
            self.assertTrue(all(r['bytesReported']==1 for r in observed if r['operation']=='read'))
            self.assertTrue(facts['actualSourceReadOrMapPaths'])
            record['boundedAuthenticationFacts']=facts

    def test_actual_larger_read_stays_closed(self):
        contract,runtime,launch,record=self.launch(width=2)
        with self.assertRaisesRegex(ValueError,'Node VM observation read width differs'):
            authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,runtime=runtime)
        record['largerReadRejected']=True

    def test_actual_missing_rule_stays_closed(self):
        contract,runtime,launch,record=self.launch()
        rules=dict(runtime.paths);del rules[runtime.NODE_VM_PATH]
        old=RuntimeObservationContract(runtime.producer_sha256,runtime.kernel_release,runtime.measured_trace_sha256,rules,absent_fd_probes=runtime.absent_fd_probes)
        with self.assertRaisesRegex(ValueError,'Unclassified process/FD alias'):
            authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,runtime=old)
        with self.assertRaisesRegex(ValueError,'rule is not declared'):
            old.check_node_vm_context(launch,self.helper.node,launch.producer_boundary['hostPid'])
        record['missingRuleRejected']=True

    def test_other_executable_unknown_group_kernel_trace_and_fake_launch_reject(self):
        contract,runtime,launch,record=self.launch()
        with self.assertRaisesRegex(ValueError,'exact bound Node executable'):
            runtime.check_node_vm_context(launch,self.helper.fixture.binary,launch.producer_boundary['hostPid'])
        with self.assertRaisesRegex(ValueError,'PID-group provenance'):
            runtime.check_node_vm_context(launch,self.helper.node,-1)
        for kernel,trace in [('unreviewed-kernel',launch.trace_sha256),(runtime.kernel_release,'0'*64)]:
            bad=RuntimeObservationContract(runtime.producer_sha256,kernel,trace,dict(runtime.paths),absent_fd_probes=runtime.absent_fd_probes)
            with self.assertRaises(ValueError):
                authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,runtime=bad)
        with self.assertRaisesRegex(ValueError,'Actual Node VM launch evidence'):
            runtime.check_node_vm_context({'verified':True},self.helper.node,launch.producer_boundary['hostPid'])
        record['separateContextControlsRejected']=['actual-different-executable-file','unknown-group','wrong-kernel','wrong-trace','fake-launch-JSON']

    def test_prefix_other_path_executable_flags_and_operation_contracts_reject(self):
        measured=RuntimeObservationContract.measured_node_vm_rule()
        for path in ('/proc/sys/','/proc/sys/vm/overcommit_ratio'):
            with self.assertRaisesRegex(ValueError,'Unmeasured runtime path/prefix'):
                RuntimeObservationContract(digest(self.helper.node),platform.release(),'0'*64,{path:measured})
        changes=[{'openFlags':'O_RDONLY'},{'operations':['openat','read','close','newfstatat']},
                 {'readBytes':2},{'readBytes':True},{'executableSha256':digest(self.helper.fixture.binary)}]
        for change in changes:
            with self.assertRaisesRegex(ValueError,'exact measured Node executable/operations/flags/read width'):
                RuntimeObservationContract(digest(self.helper.node),platform.release(),'0'*64,{RuntimeObservationContract.NODE_VM_PATH:{**measured,**change}})
        with self.assertRaisesRegex(ValueError,'exact measured Node executable/operations/flags/read width'):
            RuntimeObservationContract(digest(self.helper.fixture.binary),platform.release(),'0'*64,{RuntimeObservationContract.NODE_VM_PATH:measured})


if __name__=='__main__':
    parser=argparse.ArgumentParser(add_help=False);parser.add_argument('--evidence-dir',type=Path)
    known,rest=parser.parse_known_args();EVIDENCE=known.evidence_dir
    if EVIDENCE:EVIDENCE=EVIDENCE.resolve();EVIDENCE.mkdir(parents=True,exist_ok=False);(EVIDENCE/'observation.mjs').write_text(JS)
    program=unittest.main(argv=[sys.argv[0],*rest],exit=False)
    if EVIDENCE:
        (EVIDENCE/'results.json').write_text(json.dumps({'purpose':'exact-bound-Node-one-byte-OS-observation-controls-not-QA-pass',
            'testsRun':program.result.testsRun,'failures':len(program.result.failures),'errors':len(program.result.errors),
            'skips':len(program.result.skipped),'actualNativeRuns':RUNS,'capture19Changed':False},indent=2)+'\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
