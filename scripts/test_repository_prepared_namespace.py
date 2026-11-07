#!/usr/bin/env python3
"""Actual tiny materializer/capture, mounted dependency execution and reads."""
import argparse
import copy
import hashlib
import fcntl
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest

sys.dont_write_bytecode=True
from identity_qa_namespace_view import prepared_dependency_views,run_prepared_namespace,PreparedDependencyView
from identity_qa_read_launcher import run_readonly
from identity_qa_read_trace import FileBinding,ReadContract,authenticate_trace,digest
from identity_qa_tool_tree import bind_dependency_tree

EVIDENCE=None
RUNS=[]
C=r'''
#include <unistd.h>
#include <fcntl.h>
#include <dirent.h>
#include <sys/stat.h>
#include <stdio.h>
#include <string.h>
static void consume(int fd){char b[4096];if(fd>=0){read(fd,b,sizeof b);close(fd);}}
int main(int argc,char **argv){
 char goal[4096]={0},target[100]={0},cwd[4096];struct stat s;
 getcwd(cwd,sizeof cwd);
 int g=open("../curricula/DE/Gymnasium/canonical/fixture.json",O_RDONLY|O_CLOEXEC);int n=read(g,goal,sizeof(goal)-1);close(g);
 if(n<=0)return 2;
 int saved=open(".",O_RDONLY|O_DIRECTORY|O_CLOEXEC);
 int dir=open("node_modules/pkg",O_RDONLY|O_DIRECTORY|O_CLOEXEC);
 consume(openat(dir,"value.txt",O_RDONLY|O_CLOEXEC));
 fchdir(dir);getcwd(cwd,sizeof cwd);consume(open("value.txt",O_RDONLY|O_CLOEXEC));fchdir(saved);close(dir);close(saved);
 consume(open("node_modules/alias/value.txt",O_RDONLY|O_CLOEXEC));
 readlink("node_modules/alias",target,sizeof(target)-1);
 if(strcmp(target,"pkg"))return 3;
 stat("node_modules/pkg/value.txt",&s);
 stat("node_modules/pkg/missing.txt",&s);
 DIR *stream=opendir("node_modules");while(readdir(stream));closedir(stream);
 printf("%s\n",goal);return 0;
}
'''


def load_prepare():
    path=Path(__file__).with_name('prepare_identity_qa_candidate.py')
    spec=importlib.util.spec_from_file_location('actual_prepared_namespace_materializer',path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result)
    return result


class PreparedNamespaceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        for tool in ('git','cc','bwrap','strace'):
            if not shutil.which(tool):raise RuntimeError('Required actual fixture tool unavailable: '+tool)
        cls.temporary=tempfile.TemporaryDirectory(prefix='skillpilot-prepared-namespace-',dir='/dev/shm')
        cls.base=Path(cls.temporary.name)
        cls.prepare=load_prepare()
        cls.kernel=cls.prepare.load_kernel(Path(__file__).resolve().parents[1])
        cls.external={path:FileBinding('tool' if path=='/etc/ld.so.cache' else 'dependency',digest(path),'explicit actual C loader/runtime bytes')
                      for path in ('/etc/ld.so.cache','/lib/x86_64-linux-gnu/libc.so.6','/lib64/ld-linux-x86-64.so.2')}

    @classmethod
    def tearDownClass(cls):cls.temporary.cleanup()

    def pair(self,installed_source=None,source_files=None):
        top=Path(tempfile.mkdtemp(prefix='case-',dir=self.base));repo=top/'host';base=top/'pair'
        graph_path='curricula/DE/Gymnasium/canonical/fixture.json'
        before={'landscapeId':'fixture-owner','goals':[{'id':'old-id','title':'Controlled fixture','contains':[],'requires':[]}]}
        after=copy.deepcopy(before);after['goals'][0]['id']='00000000-0000-4000-8000-000000000001'
        files={'app/package-lock.json':b'{"lockfileVersion":3}\n','app/package.json':b'{"name":"prepared-view-fixture","type":"module"}\n',
               graph_path:json.dumps(before).encode()}
        files.update(source_files or {})
        for name,raw in files.items():
            path=repo/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(raw)
        installed=repo/'app/node_modules'
        if installed_source is None:
            (installed/'pkg').mkdir(parents=True)
            (installed/'pkg/value.txt').write_text('exact privately captured dependency bytes\n')
            (installed/'alias').symlink_to('pkg',target_is_directory=True)
            (top/'helper.c').write_text(C)
            subprocess.run(['cc','-O0','-o',str(installed/'pkg/helper'),str(top/'helper.c')],check=True)
        else:
            shutil.copytree(installed_source,installed,symlinks=True)
        subprocess.run(['git','init','-q',str(repo)],check=True)
        subprocess.run(['git','-C',str(repo),'add',*files],check=True)
        subprocess.run(['git','-C',str(repo),'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','Actual tiny namespace materializer'],check=True)
        commit=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip()
        proof={'catalog':{'sourceFiles':[{'path':graph_path,'sha256':self.kernel.digest(files[graph_path])}]},'documents':[
            {'path':graph_path,'handling':'project-typed-fields','sourceSha256':self.kernel.digest(files[graph_path]),
             'hypotheticalCanonicalSha256':self.kernel.digest(self.kernel.stable(after)),
             'fields':[{'pointer':'/goals/0/id','kind':'value','before':'old-id','after':after['goals'][0]['id']}]}]}
        raw=json.dumps(proof).encode();tree_sha=self.prepare.inventory_digest(self.prepare.dependency_inventory(installed))
        args=SimpleNamespace(expected_base_commit=commit,accepted_manifest_sha256=self.kernel.digest(raw),extend=False,
            max_private_bytes=100000,max_binary_bytes=100000,max_dependency_bytes=64000000,reserve_bytes=0,
            accepted_dependency_tree_sha256=tree_sha,output_paths=None,read_trace=[])
        base.mkdir();snapshot=self.kernel.GitSnapshot(repo,commit)
        try:
            # Real materializer boundary, not a synthetic full Source-A authority.
            self.prepare.materialize(args,repo,self.kernel,proof,{},snapshot,base,False,raw)
            pin=hashlib.sha256((base/'preparation.json').read_bytes()).hexdigest()
            views=prepared_dependency_views(base/'preparation.json',pin,tree_sha,snapshot)
        finally:snapshot.close()
        return top,base,views,graph_path,before,after

    def contract(self,role,views,graph_path):
        root=views[role]._roles[role]
        preparation=views[role]._capture.prepared_receipt()
        projected={r['path']:r for r in preparation['projectedDocumentBindings']}
        files={}
        for item in preparation['selectedFiles']:
            if item['binaryReadOnlyMount']:continue
            row=projected[item['path']] if role=='candidate' and item['path'] in projected else item
            files[item['path']]=FileBinding('source' if item['path']==graph_path else 'tool',row['sha256'],'actual materialized source bytes')
        directories={'.':[],'app':[],'curricula':[],'curricula/DE':[],'curricula/DE/Gymnasium':[],'curricula/DE/Gymnasium/canonical':[]}
        return ReadContract(root,role,files,directories,external_files=self.external,
            expected_tool_failures={('access','/etc/ld.so.preload','ENOENT')},mount_views=tuple(views.values()))

    def test_actual_both_role_namespace_exec_fd_alias_types_and_closed_directory(self):
        top,base,views,graph_path,before,after=self.pair()
        for role,expected in (('original',before),('candidate',after)):
            root=views[role]._roles[role]
            executable=root/'app/node_modules/pkg/helper'
            self.assertFalse(executable.exists()) # physical mount stub has no helper
            launch=run_prepared_namespace(role,views,[str(executable)],top/('evidence-'+role))
            self.assertEqual(json.loads(launch.stdout),expected)
            self.assertEqual(launch.cwd,root/'app')
            self.assertEqual(launch.tool_context['producerExecutable'],str(executable))
            self.assertEqual(launch.tool_context['producerExecutableSource'],str(views[role]._capture.root/'pkg/helper'))
            contract=self.contract(role,views,graph_path)
            bound=tuple(bind_dependency_tree(view,launch) for view in views.values())
            row={'case':self.id().split('.')[-1]+'.'+role,'launch':launch.receipt(),'stdout':json.loads(launch.stdout),
                 'authentication':'not-completed','actualMaterializerUsed':True,'fullSourceAProofClaimed':False}
            RUNS.append(row)
            if EVIDENCE:
                dest=EVIDENCE/role;dest.mkdir()
                (dest/'producer.strace').write_text(launch.trace);(dest/'recorder.strace').write_text(launch.recorder_trace)
                (dest/'interpreted-recorder.strace').write_text(launch.recorder_trace)
                (dest/'stdout.json').write_bytes(launch.stdout);(dest/'stderr.txt').write_bytes(launch.stderr)
                (dest/'preparation.json').write_bytes((base/'preparation.json').read_bytes())
                (dest/'fixture-proof.raw.json').write_bytes((base/'source-a.json').read_bytes())
                (dest/'capture-receipt.json').write_text(json.dumps(views[role]._capture.receipt(),indent=2)+'\n')
                (dest/'read-bindings.json').write_text(json.dumps({'files':{p:vars(v) for p,v in contract.files.items()}},indent=2)+'\n')
                (dest/'source-graph.json').write_bytes((root/graph_path).read_bytes())
            facts=authenticate_trace(launch.trace,launch.cwd,contract,launch=launch,dependency_trees=bound)
            self.assertEqual(facts['actualSourceReadOrMapPaths'],[graph_path])
            mapped=[f for f in facts['files'] if f['category']=='dependency']
            self.assertTrue(any(f.get('namespacePath')==str(executable) and 'execve' in f['observedOperations'] for f in mapped))
            self.assertTrue(any(f.get('namespacePath')==str(root/'app/node_modules/pkg/value.txt') for f in mapped))
            self.assertTrue(any(k.startswith('dependency:'+role+':') for k in facts['closedDirectoryDiscoveries']))
            self.assertTrue(any(f.get('firstMissingComponent')=='pkg/missing.txt' for f in facts['explicitToolProbeFailures']))
            self.assertFalse(executable.exists())
            row.update({'facts':facts,'authentication':'bounded-facts-pass'})
        if EVIDENCE:
            (EVIDENCE/'helper.c').write_text(C)
            shutil.copyfile(views['original']._capture.root/'pkg/helper',EVIDENCE/'helper.bin')
            subprocess.run(['git','-C',views['original']._capture.prepared_receipt()['hostRepo'],
                            'bundle','create',str(EVIDENCE/'fixture.git.bundle'),'HEAD'],check=True)

    def test_wrong_raw_pin_nonempty_stub_and_fake_view_are_closed(self):
        top,base,views,graph_path,before,after=self.pair()
        snapshot=self.kernel.GitSnapshot(Path(views['original']._capture.prepared_receipt()['hostRepo']),views['original']._capture.prepared_receipt()['sourceBase'])
        try:
            with self.assertRaisesRegex(ValueError,'External preparation byte pin'):
                prepared_dependency_views(base/'preparation.json','0'*64,views['original']._capture._tree_sha256,snapshot)
        finally:snapshot.close()
        with self.assertRaisesRegex(ValueError,'actual prepared dependency view'):
            PreparedDependencyView(object(),None,'original')
        stub=views['original'].visible_root/'not-captured.txt';stub.write_text('unbound')
        with self.assertRaisesRegex(ValueError,'hide unbound host-stub'):
            views['original'].verify()

    def test_namespace_views_require_actual_lock_and_bound_contract(self):
        top,base,views,graph_path,before,after=self.pair();root=views['original']._roles['original']
        with self.assertRaisesRegex(ValueError,'Genuine preparation lock lease'):
            run_readonly('original',root,root/'app',[str(root/'app/node_modules/pkg/helper')],top/'unreachable',
                         dependency_views=tuple(views.values()),prepared_lease={'verified':True})
        self.assertFalse((top/'unreachable').exists())

    def test_existing_preparation_lock_excludes_a_concurrent_launch(self):
        top,base,views,graph_path,before,after=self.pair()
        with (base/'.preparation.lock').open('a+b') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
            with self.assertRaises(BlockingIOError):
                run_prepared_namespace('original',views,[str(views['original'].visible_root/'pkg/helper')],top/'blocked')
        self.assertFalse((top/'blocked').exists())

    def test_changed_capture_alias_bytes_or_types_remain_closed(self):
        for change in ('alias','bytes','type'):
            top,base,views,graph_path,before,after=self.pair()
            capture=views['original']._capture.root
            if change=='alias':(capture/'alias').unlink();(capture/'alias').symlink_to('pkg/value.txt')
            elif change=='bytes':(capture/'pkg/value.txt').chmod(0o644);(capture/'pkg/value.txt').write_text('changed')
            else:(capture/'pkg/value.txt').unlink();(capture/'pkg/value.txt').mkdir()
            with self.assertRaisesRegex(ValueError,'dependency tree changed|membership/type/bytes changed'):
                views['original'].verify()

    def test_source_overlap_kernel_identity_and_missing_actual_mount_reject(self):
        top,base,views,graph_path,before,after=self.pair()
        view=views['original'];root=view._roles['original']
        contract=self.contract('original',views,graph_path)
        files=dict(contract.files)
        files['app/node_modules/pkg/value.txt']=FileBinding('source',digest(view._capture.root/'pkg/value.txt'),'invalid overlapping source declaration')
        overlap=ReadContract(root,'original',files,dict(contract.directories),external_files=self.external,mount_views=tuple(views.values()))
        with self.assertRaisesRegex(ValueError,'overlaps a source/tool binding'):overlap.verify_bytes_and_aliases()
        with self.assertRaisesRegex(ValueError,'Kernel FD identity differs'):
            view.lookup(view.visible_root/'pkg/value.txt',(0,0,0,'read',[],''),str(view._capture.root/'pkg/value.txt'))
        launch=run_readonly('original',root,root/'app',['/usr/bin/true'],top/'normal-no-view')
        with self.assertRaisesRegex(ValueError,'Exact readonly dependency mount'):
            bind_dependency_tree(view,launch)
        RUNS.append({'case':self.id().split('.')[-1],'producerExitCode':launch.returncode,'launch':launch.receipt(),
                     'missingMountRejected':True,'fullSourceAProofClaimed':False})
        if EVIDENCE:
            dest=EVIDENCE/'normal-no-view';dest.mkdir()
            (dest/'producer.strace').write_text(launch.trace);(dest/'recorder.strace').write_text(launch.recorder_trace)


if __name__=='__main__':
    parser=argparse.ArgumentParser(add_help=False);parser.add_argument('--evidence-dir',type=Path)
    known,rest=parser.parse_known_args();EVIDENCE=known.evidence_dir
    if EVIDENCE:EVIDENCE=EVIDENCE.resolve();EVIDENCE.mkdir(parents=True,exist_ok=False)
    program=unittest.main(argv=[sys.argv[0],*rest],exit=False)
    if EVIDENCE:
        (EVIDENCE/'results.json').write_text(json.dumps({'purpose':'tiny-actual-materializer-prepared-namespace-tests-not-SourceA-QA',
            'testsRun':program.result.testsRun,'failures':len(program.result.failures),'errors':len(program.result.errors),
            'skips':len(program.result.skipped),'actualNativeRuns':RUNS,'capture19Changed':False},indent=2)+'\n')
    raise SystemExit(0 if program.result.wasSuccessful() else 1)
