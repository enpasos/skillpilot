#!/usr/bin/env python3
"""Tiny actual captures and normal file/metadata checks, outside Capture19."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
from identity_qa_private_capture import dependency_inventory, inventory_digest
from identity_qa_read_launcher import run_readonly
from identity_qa_read_trace import FileBinding, ReadContract, authenticate_trace, calls, digest
from identity_qa_tool_tree import CapturedDependencyTree, BoundDependencyTree, capture_dependency_tree, bind_dependency_tree

EVIDENCE = None
RUNS = []
C = r'''
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/stat.h>
static void readfile(const char *p){char b[100];int fd=open(p,O_RDONLY|O_CLOEXEC);if(fd>=0){read(fd,b,sizeof b);close(fd);}}
int main(int argc,char **argv){
 const char *mode=argv[1],*tree=argv[2];char p[4096];struct stat s;
 readfile(argv[3]);
 if(!strcmp(mode,"source-missing")){snprintf(p,sizeof p,"%s.missing",argv[3]);readfile(p);return 0;}
 if(!strcmp(mode,"unknown-root")){readfile(argv[4]);return 0;}
 if(!strcmp(mode,"write-flags")){snprintf(p,sizeof p,"%s/pkg/absent.json",tree);int fd=open(p,O_WRONLY|O_CLOEXEC);if(fd>=0)close(fd);return 0;}
 if(!strcmp(mode,"non-directory")){snprintf(p,sizeof p,"%s/pkg/package.json/no.json",tree);readfile(p);return 0;}
 if(!strcmp(mode,"wrong-errno")){snprintf(p,sizeof p,"%s/pkg/package.json",tree);access(p,W_OK);return 0;}
 snprintf(p,sizeof p,"%s/pkg/package.json",tree);readfile(p);
 snprintf(p,sizeof p,"%s/pkg/absent.json",tree);readfile(p);
 snprintf(p,sizeof p,"%s/pkg/missing-dir/deep.json",tree);stat(p,&s);
 snprintf(p,sizeof p,"%s/alias/absent.json",tree);readfile(p);
 return 0;
}
'''


class ToolTreeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for tool in ('git','cc','bwrap','strace'):
            if not shutil.which(tool):
                raise RuntimeError('Required real fixture tool unavailable: ' + tool)
        cls.temp = tempfile.TemporaryDirectory(prefix='skillpilot-tool-tree-', dir='/dev/shm')
        cls.base = Path(cls.temp.name)
        cls.binary = cls.base / 'producer'
        (cls.base / 'producer.c').write_text(C)
        subprocess.run(['cc','-O0','-o',str(cls.binary),str(cls.base/'producer.c')],check=True)
        cls.git = cls.base / 'git'
        (cls.git/'app').mkdir(parents=True)
        (cls.git/'app/package-lock.json').write_text('{"lockfileVersion":3,"name":"tiny-real-tool-fixture","packages":{}}\n')
        for command in (["git","init","-q",str(cls.git)],['git','-C',str(cls.git),'add','.'],
                        ['git','-C',str(cls.git),'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','Actual lock fixture']):
            subprocess.run(command,check=True)
        cls.commit = subprocess.check_output(['git','-C',str(cls.git),'rev-parse','HEAD'],text=True).strip()
        path = Path(__file__).with_name('canonical_goal_identity_migration.py')
        spec=importlib.util.spec_from_file_location('tool_tree_actual_kernel',path)
        cls.kernel=importlib.util.module_from_spec(spec);spec.loader.exec_module(cls.kernel)
        cls.snapshot=cls.kernel.GitSnapshot(cls.git,cls.commit)
        cls.runtime={p:FileBinding('tool' if p in (str(cls.binary),'/etc/ld.so.cache') else 'dependency',digest(p),'exact native fixture tool bytes')
                     for p in (str(cls.binary),'/etc/ld.so.cache','/lib/x86_64-linux-gnu/libc.so.6','/lib64/ld-linux-x86-64.so.2')}
        if EVIDENCE:
            (EVIDENCE/'producer.c').write_text(C)
            shutil.copyfile(cls.binary,EVIDENCE/'producer.bin')
            subprocess.run(['git','-C',str(cls.git),'bundle','create',str(EVIDENCE/'fixture.git.bundle'),'HEAD'],check=True)

    @classmethod
    def tearDownClass(cls):
        cls.snapshot.close()
        cls.temp.cleanup()

    def context(self,role='original'):
        base=Path(tempfile.mkdtemp(prefix='case-',dir=self.base))
        installed=base/'installed'
        (installed/'pkg').mkdir(parents=True)
        (installed/'pkg/package.json').write_text('{"name":"pkg","version":"1.0.0"}\n')
        (installed/'pkg/helper.txt').write_text('second regular dependency input\n')
        (installed/'alias').symlink_to('pkg',target_is_directory=True)
        accepted=inventory_digest(dependency_inventory(installed))
        capture=capture_dependency_tree(self.snapshot,installed,base/'node_modules',accepted,10000,base)
        root=base/role
        (root/'data').mkdir(parents=True)
        (root/'data/goal.json').write_text('{"id":"controlled-'+role+'"}\n')
        (root/'tool').mkdir()
        shutil.copyfile(self.binary,root/'tool/producer')
        (root/'tool/producer').chmod(0o555)
        external={**self.runtime,**capture.file_bindings()}
        contract=ReadContract(root,role,{'data/goal.json':FileBinding('source',digest(root/'data/goal.json'),'controlled ordinary input'),
                                      'tool/producer':FileBinding('tool',digest(root/'tool/producer'),'exact copied native fixture tool')},
                              {'.':[],'data':[],'tool':[]},external_files=external,external_directory_metadata=capture.directory_metadata(),
                              expected_tool_failures={('access','/etc/ld.so.preload','ENOENT')})
        return base,root,capture,contract

    def launch(self,mode='normal',role='original',mount=True):
        base,root,capture,contract=self.context(role)
        unknown=base/'unbound-node_modules/pkg/absent.json'
        unknown.parent.mkdir(parents=True)
        launch=run_readonly(role,root,root,[str(root/'tool/producer'),mode,str(capture.root),str(root/'data/goal.json'),str(unknown)],
                            base/'controller',dependency_captures=(capture,) if mount else ())
        record={'case':self.id().split('.')[-1]+'.'+role+'.'+mode,'launch':launch.receipt(),'producerExitCode':launch.returncode,
                'capture':capture.receipt(),'sourceAQaClaimed':False}
        RUNS.append(record)
        if EVIDENCE:
            target=EVIDENCE/record['case'];target.mkdir()
            (target/'producer.strace').write_text(launch.trace)
            (target/'recorder.strace').write_text(launch.recorder_trace)
            (target/'stdout.txt').write_bytes(launch.stdout)
            (target/'stderr.txt').write_bytes(launch.stderr)
            (target/'bindings.json').write_text(json.dumps({'capture':capture.receipt(),'sourceSha256':digest(root/'data/goal.json')},indent=2)+'\n')
        return capture,contract,launch,record

    def test_actual_two_role_leaf_intermediate_and_internal_alias_absence(self):
        for role in ('original','candidate'):
            capture,contract,launch,record=self.launch(role=role)
            bound=bind_dependency_tree(capture,launch)
            facts=authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,dependency_trees=(bound,))
            absences=[item for item in facts['explicitToolProbeFailures'] if item['category']=='dependency-metadata-absence']
            self.assertEqual(len(absences),3)
            self.assertEqual([a['firstMissingComponent'] for a in absences],['pkg/absent.json','pkg/missing-dir','pkg/absent.json'])
            self.assertEqual(absences[-1]['aliasHops'],[{'path':'alias','target':'pkg'}])
            self.assertEqual(facts['actualSourceReadOrMapPaths'],['data/goal.json'])
            record['boundedFacts']=facts

    def test_actual_source_and_unknown_roots_stay_closed(self):
        for mode in ('source-missing','unknown-root'):
            capture,contract,launch,record=self.launch(mode)
            with self.assertRaisesRegex(ValueError,'Failed/unexplained input attempt'):
                authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,dependency_trees=(bind_dependency_tree(capture,launch),))
            record['rejectedAsExpected']=True

    def test_actual_write_flags_errno_and_non_directory_stay_closed(self):
        for mode,pattern in [('write-flags','write-capable'),('wrong-errno','actual ENOENT'),('non-directory','actual ENOENT')]:
            capture,contract,launch,record=self.launch(mode)
            with self.assertRaisesRegex(ValueError,pattern):
                authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,dependency_trees=(bind_dependency_tree(capture,launch),))
            record['rejectedAsExpected']=True

    def test_missing_actual_mount_and_forged_capabilities_reject(self):
        capture,contract,launch,record=self.launch(mount=False)
        with self.assertRaisesRegex(ValueError,'readonly dependency mount'):
            bind_dependency_tree(capture,launch)
        with self.assertRaisesRegex(ValueError,'genuine actual readonly launch'):
            bind_dependency_tree(capture,{'verified':True})
        with self.assertRaisesRegex(ValueError,'actual dependency capture'):
            CapturedDependencyTree(object(),None,None,None,None)
        with self.assertRaisesRegex(ValueError,'genuine readonly dependency launch'):
            BoundDependencyTree(object(),capture,launch)
        with self.assertRaises(TypeError):
            capture._root=contract.root
        record['rejectedMissingMountAndForgedCapabilities']=True

    def test_existing_files_and_unobserved_events_do_not_prove_absence(self):
        capture,contract,launch,record=self.launch()
        bound=bind_dependency_tree(capture,launch)
        successful=next(event for event in calls(launch.trace) if event[3]=='openat' and str(capture.root/'pkg/package.json') in event[4][1])
        with self.assertRaisesRegex(ValueError,'actual ENOENT'):
            bound.prove_negative_lookup(successful,capture.root/'pkg/package.json',contract.root)
        with self.assertRaisesRegex(ValueError,'absent from the actual launch trace'):
            bound.prove_negative_lookup((-1,-1,1,'openat',['AT_FDCWD','"'+str(capture.root/'pkg/package.json')+'"','O_RDONLY'],'-1 ENOENT (No such file or directory)'),capture.root/'pkg/package.json',contract.root)
        record['rejectedExistingFileAndUnobservedEvent']=True

    def test_missing_file_binding_and_other_actual_launch_reject(self):
        capture,contract,launch,record=self.launch()
        bound=bind_dependency_tree(capture,launch)
        external=dict(contract.external_files)
        del external[str(capture.root/'pkg/package.json')]
        incomplete=ReadContract(contract.root,contract.role,dict(contract.files),dict(contract.directories),
                                external_files=external,external_directory_metadata=dict(contract.external_directory_metadata),
                                expected_tool_failures=contract.expected_tool_failures)
        with self.assertRaisesRegex(ValueError,'Dependency file binding is missing'):
            authenticate_trace(launch.trace,launch.cwd,incomplete,launch=launch,dependency_trees=(bound,))
        other,other_contract,other_launch,other_record=self.launch(role='candidate')
        with self.assertRaisesRegex(ValueError,'another actual launch'):
            authenticate_trace(other_launch.trace,other_launch.cwd,other_contract,launch=other_launch,dependency_trees=(bound,))
        record['rejectedMissingDependencyFileBinding']=True
        other_record['rejectedCapabilityFromOtherActualLaunch']=True

    def test_changed_membership_types_and_aliases_reject_before_a_launch(self):
        mutations=('added','removed','type','bytes','alias')
        for mutation in mutations:
            base,root,capture,contract=self.context()
            target=capture.root/'pkg/package.json'
            if mutation=='added': (capture.root/'new.json').write_text('{}')
            elif mutation=='removed': target.unlink()
            elif mutation=='type': target.unlink();target.mkdir()
            elif mutation=='bytes': target.chmod(0o644);target.write_text('changed')
            else: (capture.root/'alias').unlink();(capture.root/'alias').symlink_to('pkg/package.json')
            with self.assertRaisesRegex(ValueError,'membership/type/bytes changed'):
                capture.verify()


if __name__=='__main__':
    parser=argparse.ArgumentParser(add_help=False)
    parser.add_argument('--evidence-dir',type=Path)
    known,rest=parser.parse_known_args();EVIDENCE=known.evidence_dir
    if EVIDENCE:EVIDENCE=EVIDENCE.resolve();EVIDENCE.mkdir(parents=True,exist_ok=False)
    program=unittest.main(argv=[sys.argv[0],*rest],exit=False)
    if EVIDENCE:
        (EVIDENCE/'results.json').write_text(json.dumps({'purpose':'tiny-real-private-capture-tool-metadata-tests-not-QA-pass',
            'testsRun':program.result.testsRun,'failures':len(program.result.failures),'errors':len(program.result.errors),
            'skips':len(program.result.skipped),'actualNativeRuns':RUNS,'capture19Changed':False},indent=2)+'\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
