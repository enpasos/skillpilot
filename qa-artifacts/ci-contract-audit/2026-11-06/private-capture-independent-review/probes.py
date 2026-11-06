"""Independent tiny materializer/launcher counterprobes; no production inputs written."""
import copy,hashlib,json,os,subprocess,sys,tempfile
from pathlib import Path
from types import SimpleNamespace
REPO=Path(os.environ['SKILLPILOT_CAPTURE_REVIEW_REPO']).resolve()
sys.path.insert(0,str(REPO/'scripts'))
import prepare_identity_qa_candidate as p
k=p.load_kernel(REPO)
results=[]
def make_pair(top,output_paths=None):
 repo,base=top/'host',top/'pair'
 subprocess.run(['git','init','-q',str(repo)],check=True)
 graph_path='curricula/DE/Gymnasium/canonical/capture-fixture.json'
 graph={'landscapeId':'capture-fixture-owner','goals':[{'id':'capture-old-goal','title':'Original','requires':[],'contains':[]}]}
 files={'app/package-lock.json':b'{"lockfileVersion":3}\n','app/package.json':b'{"name":"capture-fixture"}\n','app/scripts/fixture.js':b'authentic-tool\n','app/public/assets/goal-visualizations/a.bin':b'authentic\x00asset',graph_path:json.dumps(graph).encode()}
 for path,raw in files.items():
  q=repo/path;q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(raw)
 (repo/'app/node_modules/pkg').mkdir(parents=True);(repo/'app/node_modules/pkg/tool.js').write_text('dependency')
 subprocess.run(['git','add',*files],cwd=repo,check=True)
 subprocess.run(['git','-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','Private capture review fixture'],cwd=repo,check=True)
 commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
 after=copy.deepcopy(graph);after['goals'][0]['id']='00000000-0000-4000-8000-000000000001'
 asset='app/public/assets/goal-visualizations/a.bin'
 proof={'catalog':{'sourceFiles':[{'path':graph_path,'sha256':k.digest(files[graph_path])}]},'documents':[{'path':graph_path,'handling':'project-typed-fields','sourceSha256':k.digest(files[graph_path]),'hypotheticalCanonicalSha256':k.digest(k.stable(after)),'fields':[{'pointer':'/goals/0/id','kind':'value','before':'capture-old-goal','after':after['goals'][0]['id']}]},{'path':asset,'handling':'preserve-exact-bytes','sourceSha256':k.digest(files[asset])}]}
 raw=json.dumps(proof).encode();args=SimpleNamespace(expected_base_commit=commit,accepted_manifest_sha256=k.digest(raw),extend=False,max_private_bytes=10000,max_binary_bytes=10000,max_dependency_bytes=10000,reserve_bytes=0,accepted_dependency_tree_sha256=p.inventory_digest(p.dependency_inventory(repo/'app/node_modules')),output_paths=output_paths,read_trace=[])
 base.mkdir();snapshot=k.GitSnapshot(repo,commit)
 try:p.materialize(args,repo,k,proof,{},snapshot,base,False,raw)
 finally:snapshot.close()
 return repo,base,json.loads((base/'preparation.json').read_text()),graph_path,asset

def run(base,role,code):
 pin=hashlib.sha256((base/'preparation.json').read_bytes()).hexdigest()
 r=subprocess.run([sys.executable,str(base/'run-isolated.py'),'--accepted-preparation-sha256',pin,role,'--',sys.executable,'-c',code],text=True,capture_output=True)
 return {'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr}

def trial(name,mutation,role,code):
 with tempfile.TemporaryDirectory(prefix='capture-peer-',dir='/dev/shm') as d:
  repo,base,receipt,graph,asset=make_pair(Path(d))
  details=mutation(repo,base,receipt,graph,asset)
  results.append({'case':name,'boundary':'actual materializer then actual bwrap launcher, synthetic tiny Git inputs; no full Source-A authority','mutation':details,**run(base,role,code)})

def text_change(repo,base,receipt,graph,asset):
 target=base/'original80/app/scripts/fixture.js';before=target.read_bytes();target.chmod(0o600);target.write_bytes(b'tampered-tool\n')
 return {'path':'app/scripts/fixture.js','declaredOriginalHash':next(x['sha256'] for x in receipt['selectedFiles'] if x['path']=='app/scripts/fixture.js'),'oldSha256':k.digest(before),'newSha256':k.digest(target.read_bytes()),'preparationReceiptChanged':False}
trial('TEXT_SELECTED_INPUT_TAMPER',text_change,'original',"from pathlib import Path;assert Path('scripts/fixture.js').read_text()=='tampered-tool\\n';print('tampered bound producer text accepted')")

def graph_change(repo,base,receipt,graph,asset):
 target=base/'projectedA80'/graph;before=target.read_bytes();q=json.loads(before);q['goals'][0]['title']='Not Original';target.chmod(0o600);target.write_bytes(json.dumps(q).encode())
 return {'path':graph,'projectedDocumentListed':graph in receipt['projectedDocuments'],'oldSha256':k.digest(before),'newSha256':k.digest(target.read_bytes()),'preparationReceiptChanged':False}
trial('PROJECTED_GRAPH_TEXT_TAMPER',graph_change,'candidate',"import json;from pathlib import Path;p=Path.cwd().parent/'curricula/DE/Gymnasium/canonical/capture-fixture.json';assert json.loads(p.read_text())['goals'][0]['title']=='Not Original';print('tampered projected graph accepted')")

def forest_change(repo,base,receipt,graph,asset):
 mount=next(x for x in receipt['directoryReadOnlyMounts'] if x['rootRole']=='original' and x['path']=='app/public/assets/goal-visualizations')
 target=Path(mount['hostPath'])/'a.bin';before=target.read_bytes();target.unlink();target.write_bytes(b'changed\x00mounted-asset')
 blob=next(x for x in receipt['binaryReadOnlyMounts'] if x['path']==asset)
 assert k.digest(Path(blob['hostPath']).read_bytes())==blob['sha256']
 return {'logicalAsset':asset,'storeBlobStillMatchesReceipt':True,'mountedAssetSha256':k.digest(target.read_bytes()),'expectedSha256':blob['sha256'],'preparationReceiptChanged':False}
trial('GROUPED_ASSET_ENTRY_REPLACEMENT',forest_change,'original',"from pathlib import Path;p=Path('public/assets/goal-visualizations/a.bin');assert p.read_bytes()==b'changed\\x00mounted-asset';print('unbound grouped asset bytes accepted')")

def direct_blob_change(repo,base,receipt,graph,asset):
 blob=next(x for x in receipt['binaryReadOnlyMounts'] if x['path']==asset);target=Path(blob['hostPath']);target.chmod(0o600);target.write_bytes(b'changed\x00store');return {'logicalAsset':asset}
trial('CONTROL_STORE_BLOB_TAMPER_REJECTED',direct_blob_change,'original',"raise AssertionError('must never execute')")

with tempfile.TemporaryDirectory(prefix='capture-output-peer-',dir='/dev/shm') as d:
 top=Path(d);victim=top/'outside-capture-sentinel.txt';victim.write_text('DO NOT CHANGE');before=victim.read_bytes();config=top/'outputs.json';config.write_text(json.dumps({'reportPaths':[str(victim)],'configs':[]}));outcome=None
 try:
  _,base,receipt,_,_=make_pair(top,config)
  outcome={'returnedPreparation':True,'outputPathIncluded':str(victim) in receipt['detachedOutputPaths']}
 except Exception as exc:outcome={'exceptionType':type(exc).__name__,'exception':str(exc)}
 results.append({'case':'ABSOLUTE_OUTPUT_PATH_ESCAPES_CAPTURE','boundary':'actual tiny Git materializer, arbitrary outside-capture sentinel owned by this probe only','before':before.decode(),'after':victim.read_text(),'outsideSentinelChanged':victim.read_bytes()!=before,**outcome})

with tempfile.TemporaryDirectory(prefix='capture-proc-peer-',dir='/dev/shm') as d:
 top=Path(d);repo,base,receipt,_,_=make_pair(top)
 sentinel=repo/'private-probe-sentinel.txt';sentinel.write_text('OWN-PROBE-HOST-SENTINEL')
 host_process=os.getpid();indirect='/proc/'+str(host_process)+'/root'+str(sentinel)
 code="from pathlib import Path;direct=Path("+repr(str(sentinel))+");indirect=Path("+repr(indirect)+");assert not direct.exists();print(indirect.read_text())"
 results.append({'case':'HOST_WORKTREE_VIA_PARENT_PROCESS_ROOT','boundary':'actual bwrap launcher and probe-owned host sentinel only; no real private file accessed','directHostPathMaskedExpected':True,**run(base,'original',code)})

out=Path(os.environ['SKILLPILOT_CAPTURE_REVIEW_OUTPUT'])
out.write_text(json.dumps({'status':'actual-independent-small-counterprobes','sourceWritesPerformed':False,'fullSourceAClaimed':False,'results':results},indent=2)+'\n')
print(json.dumps(results,indent=2))
