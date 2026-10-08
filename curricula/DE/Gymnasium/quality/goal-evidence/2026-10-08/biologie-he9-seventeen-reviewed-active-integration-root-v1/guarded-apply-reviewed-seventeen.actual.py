# SPDX-License-Identifier: Apache-2.0
"""Integrate only seventeen genuinely independently reviewed Biology candidates."""
import copy,hashlib,json,os,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[7]
base=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-reviewed-integration-preparation-technical-20261008-v1'
own=Path(__file__).parent
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def norm(s): return s.removeprefix('sha256:')
def verify(b):
    p=root/b['path']; assert p.is_file(),b['path']; assert sha(p)==norm(b['sha256']),b['path']
    if 'bytes' in b: assert p.stat().st_size==b['bytes'],b['path']
    if 'symlinkBytesSha256' in b: assert p.is_symlink() and hashlib.sha256(os.readlink(p).encode()).hexdigest()==b['symlinkBytesSha256']
def atomwrite(path,value):
    temp=Path(str(path)+'.root-apply.tmp');temp.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');os.replace(temp,path)
freeze=base/'technical-preparation.final.freeze.json'
assert sha(freeze)=='447149dc4ef0ed13a518fb0b535a6c4f18f64021c0b3c4a5744c7a1d654fe3f8'
f=read(freeze)
for row in f['frozenFiles']:verify(row)
for seal in f['actualIndependentSeals'].values():
    verify(seal['seal']);payload=read(root/seal['seal']['path'])
    rows=[row for key in ('frozenFiles','files','inputFiles','ownOutputFiles','inputs','outputs') for row in payload.get(key,[])]
    assert len(rows)==seal['actualEntriesVerified']
    for row in rows:verify(row)
p=read(base/'ready-root-reviewed-guarded-integration-plan.technical.json')
for row in p['beforeBindings'].values():verify(row)
canonpath=root/p['beforeBindings']['canonical']['path'];qapath=root/p['beforeBindings']['qa']['path'];regpath=root/p['beforeBindings']['registry']['path'];ledgerpath=root/p['beforeBindings']['ledger']['path']
old=read(canonpath);new=read(root/p['futureCanonicalSource']);assert sha(root/p['futureCanonicalSource'])==norm(p['futureCanonicalSha256'])
assert len(old['goals'])==len(new['goals'])==474
assert {k:v for k,v in old.items() if k!='goals'}=={k:v for k,v in new.items() if k!='goals'}
selected={op['target'].split('/')[-2] for op in p['assetOperations'] if op['target'].endswith('.png')};assert len(selected)==17
oldgoals={g['id']:g for g in old['goals']};newgoals={g['id']:g for g in new['goals']};assert oldgoals.keys()==newgoals.keys()
for id,g in oldgoals.items():
    n=newgoals[id]
    if id not in selected:assert g==n,id
    else:
        assert {k:v for k,v in g.items() if k!='resourceLinks'}=={k:v for k,v in n.items() if k!='resourceLinks'},id
        before=g.get('resourceLinks',[]);after=n.get('resourceLinks',[]);assert after[:len(before)]==before and len(after)==len(before)+1,id
        assert after[-1]['type']=='goal-visualization',id
assert len(p['protectedStrictGoalIds']['biologie'])==174 and not selected.intersection(p['protectedStrictGoalIds']['biologie'])
oldqa=read(qapath);newqa=read(root/p['replaceQaFrom']);assert {k:v for k,v in oldqa.items() if k!='records'}=={k:v for k,v in newqa.items() if k!='records'}
oldq={r['goalId']:r for r in oldqa['records']};newq={r['goalId']:r for r in newqa['records']};assert oldq.keys()==newq.keys()
for id,r in oldq.items():
    if id not in selected:assert r==newq[id],id
    else:
        n=newq[id];assert n['aiApproved']=='yes' and n['humanApproved']=='no' and n['contentApprovedChatGpt']=='no',id
        for k,v in r.items():
            if k.startswith('human'):assert n.get(k)==v,id
reg=read(regpath);future=read(root/p['mergeOnlyBiologyRegistryEntryFrom']);current=next(x for x in reg['subjects'] if x['subject']=='biologie')
expected=copy.deepcopy(current)
for field,count in [('resolutionIndexPaths',1),('positiveEvidenceConfigPaths',1)]:
    assert future[field][:-count]==current[field];assert len(future[field])==len(current[field])+count
    expected[field].extend(future[field][-count:])
assert not selected.intersection({p['deferred19'],p['excluded12Split']})
assert future.get('resolutionSupersessions')==current.get('resolutionSupersessions')
assert expected==future,'Only the genuine original D18 index with17 resolved and19 deferred plus P17 append is authorized'
other={s['subject']:copy.deepcopy(s) for s in reg['subjects'] if s['subject']!='biologie'}
current.clear();current.update(expected)
assert other=={s['subject']:s for s in reg['subjects'] if s['subject']!='biologie'}
assert len(p['assetOperations'])==85
for op in p['assetOperations']:
    assert op['action']=='copy_exact';verify({'path':op['source'],'sha256':op['sourceSha256']})
    target=root/op['target'];assert not target.exists(),f'Preserve existing asset {target}'
for id in selected:
    ops=[x for x in p['assetOperations'] if x['target'].endswith('/'+id+'.png')]
    assert len(ops)==3 and len({x['sourceSha256'] for x in ops})==1,id
    assert any(x['target'].startswith('backend/src/main/resources/static/') for x in ops),id
for name,path in [('canonical',canonpath),('visualization-qa',qapath),('registry',regpath),('ledger',ledgerpath)]:
    dest=own/'before'/f'{name}.json';dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();shutil.copyfile(path,dest)
for op in p['assetOperations']:
    target=root/op['target'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/op['source'],target);assert sha(target)==norm(op['sourceSha256'])
shutil.copyfile(root/p['futureCanonicalSource'],canonpath);shutil.copyfile(root/p['replaceQaFrom'],qapath);atomwrite(regpath,reg)
assert sha(ledgerpath)==norm(p['beforeBindings']['ledger']['sha256']),'Ledger retained byte exact; no Bio17 claim existed'
receipt={'artifactKind':'guarded-reviewed-seventeen-active-integration','canonicalBeforeSha256':norm(p['beforeBindings']['canonical']['sha256']),'canonicalAfterSha256':sha(canonpath),'selectedGoalIds':sorted(selected),'currentWholeGoals':474,'currentCurricularAtomicGoals':391,'unchangedOtherWholeGoals':457,'protectedStrictGoalIdsPreserved':174,'exactPngCopyOperations':51,'exactPromptAndProvenanceCopyOperations':34,'registryChange':'Biology-only original genuine D18 index17 resolved19 deferred and P17 append; no supersession','ledgerChange':'NOOP; seven Chemistry claims retained byte exact','technicalFreezeSha256':sha(freeze),'genuineIndependentSeals':f['actualIndependentSeals'],'newScientificClosuresClaimBeforeTerminalCentralCheck':0,'restoredStrictBindingsClaimBeforeTerminalCentralCheck':0,'humanApproval':False,'humanTrial':False,'terminalChecks':'pending'}
atomwrite(own/'guarded-active-seventeen-integration.actual.json',receipt)
print(json.dumps(receipt,ensure_ascii=False))
