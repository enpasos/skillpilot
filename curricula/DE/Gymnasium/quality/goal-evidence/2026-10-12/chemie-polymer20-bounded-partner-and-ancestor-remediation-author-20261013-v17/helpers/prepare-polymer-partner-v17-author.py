# Apache-2.0. Whole bounded v16 partner batch in a new completely private author overlay.
from pathlib import Path
import copy,datetime,hashlib,json,os,shutil
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';OLD=E/'chemie-polymer20-source-course-locator-targeted-author-20261013-v15';A=E/'chemie-polymer20-targeted-source-course-fix-independent-a-20261013-v16';N=E/'chemie-polymer20-bounded-partner-and-ancestor-remediation-author-20261013-v17';S=R/'tmp/chemie-polymer-source-course-locator-private-20261013-v15';X=R/'tmp/chemie-polymer-bounded-partner-private-20261013-v17'
rd=lambda p:json.loads(p.read_text());rel=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
fixfile=A/'BOUNDED_PARTNER_ANCESTOR_FIXES.complete31-and42-carriers.independent.json';first=A/'FIRST.targeted-primary-resolved-and-partner-open-findings.json';seal=A/'FINAL.targeted-source-course-partner-independent.freeze.json'
assert sha(fixfile)=='sha256:a4f0e2468a79e4eec7c9d42f8db96fb0e87954efe2345c55bd068fc3a8f340d7';assert sha(first)=='sha256:8ebbaade62f4ac3f0396bd79653d5147d29240ef991ab6a02d86a8ef4fca0113';assert sha(seal)=='sha256:6f3b67549614651745a709b03ffd47dab4d170782c9c3b07538905b213d9a1e5'
for b in rd(seal)['files']:assert sha(R/b['path'])==b['sha256'],b['path']
priorseal=OLD/'FINAL.targeted-polymer-source-course-locator-author.freeze.json';assert sha(priorseal)=='sha256:2ee5794b401eec1506b073bae04a824dc62f2acdd6b8949f1673917ee5331059'
for b in rd(priorseal)['files']:assert sha(R/b['path'])==b['sha256'],b['path']
if N.exists():assert not any(N.iterdir())
else:N.mkdir()
if not X.exists():X.parent.mkdir(exist_ok=True);shutil.copytree(S,X,symlinks=True)
def own(p,d):
 assert p.is_relative_to(N) and not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def private(p,payload):
 assert p.is_relative_to(X);cur=X
 for part in p.parent.relative_to(X).parts:
  cur=cur/part
  if cur.is_symlink():
   src=cur.resolve(strict=True);cur.unlink();cur.mkdir()
   for child in src.iterdir():(cur/child.name).symlink_to(child,target_is_directory=child.is_dir())
  elif not cur.exists():cur.mkdir()
  assert not cur.is_symlink(),cur
 if p.is_symlink() or p.exists():p.unlink()
 p.write_bytes(payload);assert not p.is_symlink() and p.resolve().is_relative_to(X)
F=rd(fixfile);prior=rd(OLD/'SOURCE_COURSE_LOCATOR_AUTHOR.pending-exact-preflight-verification.json');byID={};byAddress={}
for f in F['rows']:
 p=R/f['candidateMappingBinding']['path'];assert sha(p)==f['candidateMappingBinding']['sha256'];obj=rd(p);d=next(d for d in obj.get('decisions',[]) if d['sourceGoalId']==f['sourceGoalId']);assert set(d['canonicalGoalIds'])==set(f['beforeCanonicalGoalIds']);byAddress[f['originalLiveMappingPath'],f['sourceGoalId']]=f
 if f['sourceGoalId'] in byID:
  assert byID[f['sourceGoalId']]['proposedBoundedCanonicalGoalIds']==f['proposedBoundedCanonicalGoalIds'] and byID[f['sourceGoalId']]['proposedDecision']==f['proposedDecision']
 byID[f['sourceGoalId']]=f
known={p['originalLiveBinding']['path']:p for p in prior['mappingSuccessors']};allAliasRows=[]
for p in (R/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 if 'quality' in p.parts:continue
 data=rd(p);hits=sorted({m['legacyGoalId'] for m in data.get('mappings',[]) if m.get('legacyGoalId') in byID}|{d['sourceGoalId'] for d in data.get('decisions',[]) if d.get('sourceGoalId') in byID})
 if hits:assert rel(p) in known,p;allAliasRows.append({'originalLiveBinding':bind(p),'sourceGoalIds':hits,'coveredByPriorV15CarrierPlan':True})
carrier_plans=[];operations=[];flatOps=[];actualChanges=0
for oldplan in prior['mappingSuccessors']:
 origin=oldplan['originalLiveBinding']['path'];base=R/oldplan['candidateBinding']['path'];assert sha(base)==oldplan['candidateBinding']['sha256'];data=rd(base);before=copy.deepcopy(data)
 for d in data.get('decisions',[]):
  f=byAddress.get((origin,d['sourceGoalId']))
  if not f:continue
  assert set(d['canonicalGoalIds'])==set(f['beforeCanonicalGoalIds']);before_d=copy.deepcopy(d)
  if f['changeNeeded']:
   d['canonicalGoalIds']=f['proposedBoundedCanonicalGoalIds'];d['decision']=f['proposedDecision'];d['matchType']='partial'
   d['reviewer']='Codex bounded source-component author; independent exact-successor verification pending';d['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();d['rationale']='AUTHOR successor applying pinned genuine independent bounded source findings; no whole-target/source-union/practical approval. '+f['reason'];actualChanges+=1
  operations.append({'originalMappingPath':origin,'sourceGoalId':d['sourceGoalId'],'before':before_d,'after':copy.deepcopy(d),'changed':f['changeNeeded'],'actualIndependentFindingPayloadBinding':bind(fixfile),'currentCanonicalEntitlementMustNotBeInferredFromPrerequisites':True})
 # Keep both reviewed decisions and compatibility flat lists synchronized for every consumed alias.
 for id,f in byID.items():
  rows=[m for m in data.get('mappings',[]) if m.get('legacyGoalId')==id]
  if not rows:continue
  target=f['proposedBoundedCanonicalGoalIds'];actual=[m['canonicalGoalId'] for m in rows]
  if set(actual)==set(target):continue
  proto=copy.deepcopy(rows[0]);data['mappings']=[m for m in data['mappings'] if m.get('legacyGoalId')!=id]
  for goal in target:
   m=copy.deepcopy(proto);m['canonicalGoalId']=goal;m['matchType']='partial';data['mappings'].append(m)
  flatOps.append({'originalMappingPath':origin,'sourceGoalId':id,'before':rows,'after':[m for m in data['mappings'] if m.get('legacyGoalId')==id],'beforeCanonicalGoalIds':actual,'afterCanonicalGoalIds':target,'allOtherFlatRowsPreserved':True})
 changed=data!=before
 if changed:
  rpath=Path(origin).relative_to('curricula/DE/Gymnasium/mapping');filename=Path(origin).stem+'.polymer-bounded-partner-author-20261013-v17.json';dst=N/'mapping-successors'/rpath.parent/filename;own(dst,data);future='curricula/DE/Gymnasium/mapping/'+str(rpath.parent/filename)
  q=X/oldplan['proposedFutureLivePath'];assert q.exists() and sha(q)==sha(base);q.unlink();private(X/future,dst.read_bytes());candidate=bind(dst)
 else:future=oldplan['proposedFutureLivePath'];candidate=oldplan['candidateBinding']
 carrier_plans.append({'originalLiveBinding':oldplan['originalLiveBinding'],'priorV15CandidateBinding':bind(base),'candidateBinding':candidate,'proposedFutureLivePath':future,'proposedFutureArchivePath':oldplan['proposedFutureArchivePath'],'changedInV17':changed,'sourceExtractionBytesUnchangedToVerifiedV15':True,'noSourceReviewOrFullUnionVoteManufactured':True})
assert actualChanges==F['changedCarrierRows']==29;assert len(operations)==42
for p in carrier_plans:
 data=rd(R/p['candidateBinding']['path']);decs={d['sourceGoalId']:d for d in data.get('decisions',[])}
 for id,f in byID.items():
  rows=[m['canonicalGoalId'] for m in data.get('mappings',[]) if m.get('legacyGoalId')==id]
  if id in decs:assert set(rows)==set(decs[id]['canonicalGoalIds']),[p,id,rows,decs[id]]
  if rows:assert set(rows)==set(f['proposedBoundedCanonicalGoalIds']),[p,id,rows]
cfg=rd(OLD/'configs/source-atlas.targeted-author.config.json');replacement={p['proposedFutureLivePath']:next(n['proposedFutureLivePath'] for n in carrier_plans if n['originalLiveBinding']['path']==p['originalLiveBinding']['path']) for p in prior['mappingSuccessors']};cfg['mappingPaths']=[replacement.get(p,p) for p in cfg['mappingPaths']]
own(N/'configs/source-atlas.bounded-partner.author.initial-snapshot.config.json',cfg)
own(N/'PARTNER_ANCESTOR_AUTHOR.proposal.pending-exact-independent-verification.json',{'schemaVersion':1,'priorV15AuthorSeal':bind(priorseal),'pinnedIndependentV16Seal':bind(seal),'pinnedIndependentV16FIRST':bind(first),'pinnedIndependentBoundedFixPayload':bind(fixfile),'sourceExtractionSuccessorsReferencedExact':prior['sourceExtractionSuccessors'],'mappingSuccessors':carrier_plans,'sourceCellChangesInV17':0,'all31SourceRowsAnd42CarrierCellsAddressed':True,'sourceGoalIdsWithActualPartnerChanges':sorted(id for id,f in byID.items() if f['changeNeeded']),'reviewedDecisionCASOperations':operations,'allCompatibilityFlatCASOperations':flatOps,'allLiveAliasSearchClosure':allAliasRows,'actualReviewedCarrierCellsChanged':29,'actualUniqueSourcePartnerSetsChanged':len([f for f in byID.values() if f['changeNeeded']]),'actualChangedMappingCarrierFiles':sum(p['changedInV17'] for p in carrier_plans),'canonicalBodyAndMetadataInputsChanged':False,'P17A17M402NECasesAndSevenActualVBytesChanged':False,'newNativeRenders':0,'newIndependentScientificVotes':0,'newScientificCompletions':0,'activeOrGitWrites':False})
(N/'helpers').mkdir();shutil.copyfile(Path(__file__),N/'helpers'/Path(__file__).name)
for p in N.rglob('*'):
 if p.is_file():private(X/rel(p),p.read_bytes())
print(json.dumps({'root':rel(N),'reviewedCellsChecked42':len(operations),'reviewedCellsChanged29':actualChanges,'uniqueChangedSourceIDs':len([f for f in byID.values() if f['changeNeeded']]),'mappingFilesChanged':sum(p['changedInV17'] for p in carrier_plans),'actualAllLiveAliasCarriersChecked':len(allAliasRows),'sourceTextsChanged':0,'canonicalChanged':False,'newNative':0}))
