# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy,hashlib,json
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;E=O.parent;L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-two-GK-priors-final-review-capsule-v1';SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def pin(p):return {'path':str(Path(p).relative_to(R)),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def put(n,x):
 p=O/n;assert not p.exists();p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
log=[]
def stage(p):
 rel=p.relative_to(R);cur=L
 for part in rel.parent.parts:
  cur=cur/part
  if cur.is_symlink():
   origin=cur.resolve(strict=True);children=list(origin.iterdir());cur.unlink();cur.mkdir()
   for ch in children:(cur/ch.name).symlink_to(ch)
   log.append({'detachedParent':str(cur.relative_to(L)),'origin':str(origin)})
  elif not cur.exists():cur.mkdir()
 dst=L/rel;prior={'nlink':dst.lstat().st_nlink,'symlink':dst.is_symlink()}if dst.exists()or dst.is_symlink()else None
 if dst.exists()or dst.is_symlink():dst.unlink()
 with dst.open('xb')as f:f.write(p.read_bytes())
 assert dst.stat().st_nlink==1 and not dst.is_symlink();log.append({'path':str(rel),'prior':prior,'afterNlink':1,'sha256':sha(dst)})
measured=O/'central.current437.six-current-native-bindings.private-L4.inactive.config.json';cfg=read(measured);s=cfg['subjects'][0];replacements=[]
for n,root in [('4','chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1'),('2','chemie-two-generic-GK-priors-and-recall-fresh-independent-a-20261016-v1')]:
 source=E/root/f'P{n}.current-independent.config.json';before=read(source);after=copy.deepcopy(before);after['semanticKindLedgerPath']=SEM;p=put(f'config/P{n}.actual-original-independent-A.normal-kind-address-only.config.json',after);assert {k:v for k,v in before.items()if k!='semanticKindLedgerPath'}=={k:v for k,v in after.items()if k!='semanticKindLedgerPath'};stage(p);i=s['positiveEvidenceConfigPaths'].index(str(source.relative_to(R)));s['positiveEvidenceConfigPaths'][i]=str(p.relative_to(R));replacements.append({'sourceConfig':pin(source),'aliasConfig':pin(p),'changedFields':['semanticKindLedgerPath'],'beforeSemanticKindLedgerPath':before['semanticKindLedgerPath'],'afterSemanticKindLedgerPath':SEM,'reviewIdExact':after['reviewId']==before['reviewId'],'wholeOriginalReviewFile':pin(R/after['reviewPath']),'wholeReviewBytesExactInL4':sha(L/after['reviewPath'])==sha(R/after['reviewPath'])})
cfg['reportId']+='-P6-normal-kind-address-only-successor';p=put('central.current437.P6-normal-kind-address-only.after-measured-failure.inactive.config.json',cfg);stage(p);put('ALIAS.P6.actual-original-records-and-reviewIds-semantic-path-only.receipt.json',{'role':'Technical canonical-semantic address alias only; source records and original reviewer identities unchanged','replacements':replacements,'measuredFirstCentralConfigUnchanged':pin(measured),'newInactiveConfig':pin(p),'writeDetachmentLog':log,'noSecondCentralRun':True,'HumanApproval':False,'HumanTrial':False,'M7Claim':False});print(json.dumps({'aliasConfigs':[r['aliasConfig']for r in replacements],'newInactiveConfig':pin(p)},indent=2))
