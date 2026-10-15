from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,os
O=Path(__file__).resolve().parent;M=Path('/home/enpasos/projects/skillpilot');R=O/'isolated-root'
B=Path('curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/fresh-four-existing-math-portable-v1')
reg=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
ids=set(json.loads((R/B/'current-P/four.config.json').read_text())['scope']['goalIds'])
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def detached(p):
    cur=R
    for part in p.relative_to(R).parts[:-1]:
        cur=cur/part
        if cur.is_symlink():
            src=cur.resolve();cur.unlink();cur.mkdir()
            for ch in src.iterdir():(cur/ch.name).symlink_to(ch,target_is_directory=ch.is_dir())
        else:cur.mkdir(exist_ok=True)
    if p.is_symlink():p.unlink()
    assert p.parent.resolve().is_relative_to(R)
def write(p,b):
    detached(p);p.write_bytes(b)
def emit(p,x):
    assert not p.exists(),p
    write(p,(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode())
raw=(M/reg).read_bytes();assert sha(raw)=='sha256:c0dd4e1a34a95d44855f08848b0f6836c2d04b34729724f84a930ac5d1eef94d'
main=json.loads(raw);before=(R/reg).read_bytes();old=json.loads(before)
orig=R/B/'originals/P20-rebase';orig.mkdir(parents=True,exist_ok=True)
for name,data in [('registry.private-before-P20.exact.json',before),('registry.Main-P20.exact.json',raw)]:
    assert not (orig/name).exists();(orig/name).write_bytes(data)
mp=next(s for s in main['subjects'] if s['subject']=='physik');op=next(s for s in old['subjects'] if s['subject']=='physik')
assert len(main['subjects'])==5
assert [s for s in main['subjects'] if s['subject']!='physik']==[s for s in old['subjects'] if s['subject']!='physik']
snap=[]
# Preserve the actual adopted P20 leaves physically; they are existing Main inputs,
# not proposed R4 changes and will therefore be excluded from the export delta.
p20=Path('curricula/DE/Gymnasium/quality/goal-evidence/physik/twenty-explicit-profile-conditions-current-20261015-v1')
for src in sorted((M/p20).iterdir()):
    if src.is_file():
        rel=src.relative_to(M);data=src.read_bytes();write(R/rel,data);snap.append({'path':str(rel),'sha256':sha(data),'bytes':len(data)})
rows=[];newpaths=[];n=0
for reltext in mp['positiveEvidenceConfigPaths']:
    rel=Path(reltext);cfg=json.loads((M/rel).read_text());selected=ids&set(cfg['scope'].get('goalIds',[]))
    if not selected:newpaths.append(reltext);continue
    n+=1;recordrel=Path(cfg['reviewPath']);rawrecords=(M/recordrel).read_bytes();lines=rawrecords.splitlines(keepends=True)
    omitted=[json.loads(x)['goalId'] for x in lines if json.loads(x)['goalId'] in selected]
    retained=b''.join(x for x in lines if json.loads(x)['goalId'] not in selected)
    assert set(omitted)==selected
    (orig/f'owner-{n:02d}.Main.config.exact.json').write_bytes((M/rel).read_bytes());(orig/f'owner-{n:02d}.Main.records.exact.jsonl').write_bytes(rawrecords)
    outconfig=B/f'current-P/P20-rebased-retained-owner-{n:02d}.config.json';outrecords=B/f'current-P/P20-rebased-retained-owner-{n:02d}.review.jsonl'
    cfg['scope']['goalIds']=[x for x in cfg['scope']['goalIds'] if x not in selected];cfg['reviewPath']=str(outrecords)
    emit(R/outconfig,cfg);write(R/outrecords,retained);newpaths.append(str(outconfig))
    rows.append({'MainConfigPath':reltext,'MainConfigDigest':sha((M/rel).read_bytes()),'MainReviewPath':str(recordrel),'MainReviewDigest':sha(rawrecords),'omittedActualGoalIds':sorted(selected),'newConfigPath':str(outconfig),'newReviewPath':str(outrecords),'retainedLineCount':len(retained.splitlines()),'retainedLineBytesExact':True})
assert n==3 and set(x for r in rows for x in r['omittedActualGoalIds'])==ids
newpaths.append(str(B/'current-P/four.config.json'));mp['positiveEvidenceConfigPaths']=newpaths
# Undo the pre-P20 private edits of old owner configs. The new active partition
# uses new R4 configs, and original historical owners remain exact Main bytes.
restored=[]
for reltext in op['positiveEvidenceConfigPaths']:
    rel=Path(reltext)
    if not (M/rel).is_file():continue
    if (R/rel).read_bytes()!=(M/rel).read_bytes():
        saved=orig/f'old-private-owner-{len(restored)+1:02d}.exact.json';saved.write_bytes((R/rel).read_bytes());write(R/rel,(M/rel).read_bytes());restored.append(str(rel))
write(R/reg,(json.dumps(main,ensure_ascii=False,indent=2)+'\n').encode())
assert [s for s in json.loads((R/reg).read_text())['subjects'] if s['subject']!='physik']==[s for s in json.loads(raw)['subjects'] if s['subject']!='physik']
emit(R/B/'current-P/actual-P20-owner-rebase.provenance.json',{'createdAt':datetime.now(timezone.utc).isoformat(),'actualMainRegistry':{'path':str(reg),'sha256':sha(raw)},'privateBeforeRegistryDigest':sha(before),'newPrivateRegistryDigest':sha((R/reg).read_bytes()),'preservedSubjects':5,'fourNonPhysicsEntriesStructureExact':True,'actualP20Snapshot':snap,'actualThreeOwnerPartitions':rows,'oldPrivateHistoricalOwnerConfigsRestoredExactMain':restored,'fourActualPRecordsUnchanged':sha((R/B/'current-P/four.review.jsonl').read_bytes()),'fourGoalPAssetAndNativeDContextUnchangedByRebase':True,'authority':'Administrative current-owner rebase only, no new judgments, model or human authority.'})
print(json.dumps({'owners':rows,'P20Leaves':len(snap),'registrySHA':sha((R/reg).read_bytes()),'restored':restored},indent=2))
