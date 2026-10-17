from pathlib import Path
import json,hashlib,datetime,copy,subprocess,os
E=Path('/mnt/e/skillpilot-chemie-L7-20261017');R=Path('/home/enpasos/projects/skillpilot')
DN=E/'current439-native12-paired-synthesis-technical-v1';ds=json.loads((DN/'SELECTOR.actual-native12-paired-technical.D114-prospective.P1-open.sealed.json').read_text());BASE=Path(ds['capsule'])
O=E/'current439-f79-paired-P1-BY-default-memory-root-integration-v1';CAP=O/'capsule';assert not O.exists();CAP.mkdir(parents=True)
for p in BASE.iterdir():(CAP/p.name).symlink_to(p,target_is_directory=p.is_dir())
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-f79-paired-P1-BY-default-memory-root-integration-v1')
def own_parent(rel):
 p=CAP
 for part in rel.parts:
  p=p/part
  if p.is_symlink():
   t=p.resolve();p.unlink();p.mkdir()
   for c in t.iterdir():(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
  elif not p.exists():p.mkdir()
 return p
OUT=own_parent(Q)
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def w(p,d):
 with p.open('x') as f:json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
def cp(p,rel):
 data=p.read_bytes();own_parent(rel.parent);d=CAP/rel;assert not d.exists() and not d.is_symlink()
 with d.open('xb') as f:f.write(data)
 assert pin(d)['sha256']==pin(p)['sha256'];return pin(d)
GID='f79f15c0-e848-5e17-9eb5-26753d35c93b';A=E/'current439-f79-ratio-informed-independent-a-v1/SELECTOR.informed-independent-a-D1-P1.sealed.json';B=E/'current439-f79-ratio-informed-independent-b-v1/SELECTOR.f79-informed-P1-accepted-D1-technical-HOLD.sealed.json'
a=json.loads(A.read_text());b=json.loads(B.read_text());assert a['PDecision']==b['P1decision']=='KEEP_PROFILE_EXACT' and b['B-P-01resolvedForExactNewBody'] is True
for inp in [a['scientificFIRST'],b['FIRST']]:assert pin(Path(inp['path']))==inp
author=E/'current439-f79-explicit-concentration-ratio-author-root-v1';p=json.loads((author/'PREPARATION.author-f79-correction.json').read_text());AQ=Path(p['relative']);AP=author/'capsule'/AQ
copies=[]
for source,rel in [(A,Q/'independent-a'/'SELECTOR.informed-P1-and-technical-D1-HOLD.exact.json'),(Path(a['scientificFIRST']['path']),Q/'independent-a'/Path(a['scientificFIRST']['path']).name),(B,Q/'independent-b'/'SELECTOR.informed-P1-and-technical-D1-HOLD.exact.json'),(Path(b['FIRST']['path']),Q/'independent-b'/Path(b['FIRST']['path']).name)]:copies.append(cp(source,rel))
for name in ['P1.current-f79.author-candidate.jsonl','AUTHOR.current-f79-whole-profile-and-two-cases.explicit-B-over-A.json','INPUT.original-current-f79-whole-profile-and-two-cases.exact.json','AUTHOR.exact-scientific-delta.twelve-fields.json']:
 copies.append(cp(AP/name,Q/'materials'/name))
oldcfg=Path(p['previousOwnerConfig']['path']);oc=json.loads(oldcfg.read_text());K=E/'current439-remediation14-guarded-root-integration-technical-v1/capsule';oldrows=(K/oc['reviewPath']).read_bytes().splitlines(keepends=True)
assert len(oldrows)==len(oc['scope']['goalIds'])==33
oldgoalids=[json.loads(l)['goalId'] for l in oldrows];assert GID in oldgoalids
newrows=[l for l in oldrows if json.loads(l)['goalId']!=GID];assert len(newrows)==32
rec_rel=Q/'records'/'P039.other32.whole-original-lines.exact.jsonl';own_parent(rec_rel.parent)
with (CAP/rec_rel).open('xb') as f:f.write(b''.join(newrows))
nc=copy.deepcopy(oc);nc['reviewPath']=str(rec_rel);nc['scope']['goalIds']=[g for g in oc['scope']['goalIds'] if g!=GID]
nc_rel=Q/'config'/'P039.other32.original-wrapper-and-criteria.successor.config.json';own_parent(nc_rel.parent);w(CAP/nc_rel,nc)
pc=json.loads((AP/'P1.author.config.json').read_text());pc['reviewPath']=str(Q/'materials'/'P1.current-f79.author-candidate.jsonl');pc['scope']['label']='One exact authored ratio correction, independently checked by informed A/B; human/practical/source approvals absent'
pc_rel=Q/'config'/'P1.f79-explicit-ratio.paired-machine-candidate.config.json';w(CAP/pc_rel,pc)
central=json.loads(Path(ds['prospectiveCentral']['path']).read_text());s=central['subjects'][0];oldrel=str(oldcfg.relative_to(K));assert s['positiveEvidenceConfigPaths'].count(oldrel)==1
s['positiveEvidenceConfigPaths']=[str(nc_rel) if x==oldrel else x for x in s['positiveEvidenceConfigPaths']]+[str(pc_rel)]
assert len(s['positiveEvidenceConfigPaths'])==124
# Preserve the original frozen M439 config; select an additive successor instead.
BY=E/'current439-main-portable-integration-plan-technical-v1/proposals/BY-inactive-pilots-and-full-default-memory-proof-v3';bs=BY/'PROPOSAL.actual-full-default-BY-GK-LK-memory-and-card-origin-proof.sealed.json';bd=json.loads(bs.read_text());assert bd['stockVisibilityErrors']==[] and bd['missingCurrentKeptCardOrigins']==[]
byfiles=[]
for x in bd['originalDefinitionBindings']:byfiles.append(cp(Path(x['exactCopyPin']['path']),Path(x['inactiveReviewOnlyRepoPath'])))
for x in bd['fullDefaultReports']:byfiles.append(cp(Path(x['proofViewPin']['path']),Path(x['proofViewRepoPath'])))
mc=json.loads(Path(bd['candidateM439ConfigPin']['path']).read_text());mc_rel=Q/'config'/'M439.full-default-BY-and-inactive-pilot-proof.successor.config.json';w(CAP/mc_rel,mc);s['memoryReviewConfigPath']=str(mc_rel)
assert len(mc['visibilityScopes'])==41
currentids=[]
for rel in s['positiveEvidenceConfigPaths']:
 cfg=json.loads((CAP/rel).read_text());currentids+=cfg['scope']['goalIds']
assert len(currentids)==len(set(currentids))==439 and currentids.count(GID)==1
newcentral=OUT/'central.current439.D114-P1paired-M41.PROSPECTIVE.D1-and-Source-open.config.json';w(newcentral,central)
receipt={'role':'Actual informed paired P1 correction and full BY default-memory technical composition; blind D1 and lower source gates remain open','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'capsule':str(CAP),'prospectiveCentral':pin(newcentral),'prospectiveCentralRelativePath':str(newcentral.relative_to(CAP)),'oldWhole33ConfigPreserved':pin(oldcfg),'oldWhole33RecordsPreserved':pin(K/oc['reviewPath']),'other32WholeLinesExact':True,'correctedP1ExactAuthorBytes':True,'currentPositiveEvidenceOwnership':{'records':439,'uniqueIds':439,'configs':124},'newP1ScientificFollowups':2,'P1FindingResolvedForExactBody':True,'blindD1FormalHoldStillOpen':True,'newStrictGainMeasured':False,'newStrictGainClaimed':0,'BYExistingFullDefaultMemoryProof':pin(bs),'BYSourceRolesAndQualifiersPreserved':True,'currentWhole439MRowsAnd80CardsUnchanged':True,'visibilityScopes':41,'normalPilotCatalogExclusionNotAppliedHere':True,'historicalOriginalConfigsAndReviewsPreserved':True,'copies':copies,'BYproofCopies':byfiles,'new32PConfig':str(nc_rel),'newP1Config':str(pc_rel),'newM41Config':str(mc_rel),'fullCentralOrGlobalOrBookBuildRun':False,'MainAndKMutated':False,'humanApproval':False,'actualLearnerPerformance':False,'safetyApproval':False,'wholeSourceApproval':False}
w(O/'RECEIPT.paired-one-P-and-additive-BY-M41-integration.json',receipt)
print(json.dumps({'receipt':str(O/'RECEIPT.paired-one-P-and-additive-BY-M41-integration.json'),'central':pin(newcentral),'Punique':len(set(currentids)),'Mscopes':41},ensure_ascii=False),flush=True)
