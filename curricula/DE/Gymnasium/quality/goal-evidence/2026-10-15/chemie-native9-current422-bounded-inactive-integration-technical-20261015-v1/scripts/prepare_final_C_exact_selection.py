# SPDX-License-Identifier: Apache-2.0
"""Select genuine finite C records, without rewriting science or original runs."""
import hashlib,json,shutil
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
C=E/'chemie-equilibrium-two-and-analgesic-term-current422-informed-P2-A2-M1-V1-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,v):
 assert not p.exists(),p
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
selector=C/'SELECTION.final-informed-P2-A2-and-rezeptfrei-M1-V1.json'
assert ref(selector)['sha256']=='sha256:7cd797806bcef39ff813e250979d677dd18fca2f1bd6371e3afea9deb117fea9'
c=load(selector)
for group in ['P2','A2']:
 src=verify(c[group]['records']);dest=OWN/'records'/f'{group}.genuine-informed-C.whole-records.exact.jsonl'
 assert not dest.exists();shutil.copyfile(src,dest);assert src.read_bytes()==dest.read_bytes()
 cfg=load(verify(c[group]['config']));cfg['landscapePath']='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
 if group=='P2':
  cfg['semanticKindLedgerPath']='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
  verify(c[group]['runManifest'])
 cfg['reviewPath']=ref(dest)['path']
 put(OWN/'config'/f'{group}.genuine-informed-C.normal-address-only.config.json',cfg)
p=load(OWN/'candidate/PREPARED.PA-exact-selections.awaiting-final-gates.json')
print('template keys',list(p))
mp=load(OWN/'checks/REBUILD.check-only-zero-raster-copy.prepared-map.json')
qa=verify(c['V1']['wholeQA438Candidate']);verify(c['M1']['whole422Records']);verify(c['M1']['whole422TenViewsConfig'])
qa_alias='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
row=next(r for r in mp['aliases'] if r['normalHostAlias']==qa_alias)
old=row['physicalRepositorySource'];row['physicalRepositorySource']=ref(qa)
mp.update(role='Final current check-only inactive integration host; exact A/B2/C finite inputs',finalCSelector=ref(selector),finalMemoryConfig=c['M1']['whole422TenViewsConfig'],finalQa=c['V1']['wholeQA438Candidate'],ROOTREADY=True,centralAllowed=True,allowedCentralRuns=1)
put(OWN/'checks/REBUILD.current422.final-A-B2-C.physical-map.json',mp)
host=REPO/mp['executionHost'];target=host/qa_alias
assert target.is_file() and not target.is_symlink() and ref(target)['sha256']==old['sha256']
shutil.copyfile(qa,target);assert target.read_bytes()==qa.read_bytes()
put(OWN/'checks/CAS.private-host-QA-alias-final-C-only.json',{'role':'Private host alias switch only; source and old host bytes unchanged','oldQa':old,'actualCFinalQa':ref(qa),'privateHostAlias':ref(target),'newVotes':0,'newQaGeneration':0})
put(OWN/'checks/SELECTION.final-C-exact-P2-A2-M422-QA438.json',{'role':'Finite C records selected unchanged; no invented fingerprint transport','selector':ref(selector),'sealPath':c['finalSealPath'],'P2Original':c['P2'],'A2Original':c['A2'],'finalM422':c['M1']['whole422Records'],'finalM422Config':c['M1']['whole422TenViewsConfig'],'finalQA438':c['V1']['wholeQA438Candidate'],'e0And1aNoDSourceCourseGrant':True,'other421MRawLinesExactClaimFromOriginalC':True,'other437QaWholeObjectsExactClaimFromOriginalC':True,'newScienceVotes':0})
print(json.dumps({'P2A2RecordsExact':True,'originalPRunPreserved':True,'M422':c['M1']['whole422Records']['sha256'],'QA438':ref(qa)['sha256'],'hostRasterCopies':0,'newVotes':0}))
