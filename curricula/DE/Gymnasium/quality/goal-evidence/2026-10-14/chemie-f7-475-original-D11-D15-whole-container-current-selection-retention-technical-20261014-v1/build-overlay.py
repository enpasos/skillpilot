from pathlib import Path
import json,hashlib,copy,datetime
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).parent;E14=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14';B=E14/'chemie-source6-current412-five-paired-native-whole-gates-existing287-integration-technical-20261014-v1';bp=B/'config/chemie-current412-source6-five-on-existing287.inactive.config.json'
def read(p):return json.loads(Path(p).read_text())
def rel(p):return str(Path(p).relative_to(R))
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,d):p.parent.mkdir(exist_ok=True,parents=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
cfg=read(bp);before=copy.deepcopy(cfg);s=cfg['subjects'][0];bs=before['subjects'][0];newpaths={n:rel(O/n/'resolution-index.json') for n in ['D15','D11']};idx={n:read(R/p) for n,p in newpaths.items()};newrows={n:{x['goalId']:x for x in d['resolutions']} for n,d in idx.items()}
oldclaim={}
for ip in s['resolutionIndexPaths']:
 for row in read(R/ip)['resolutions']:oldclaim.setdefault(row['goalId'],[]).append(ip)
withdrawByPrefix={'c245d5fd':('D11','Whole current body differs from the reviewed historical own-enrichment v3 input: current DE/EN text, scope metadata and Requires were not that reviewed successor. No current D grant from this historical claim.'),'d1244f5d':('D11','Whole current d124 DE/EN body and Requires differ from the old v3 native input. Existing newer targeted P2 does not constitute D clearance; preserve current D/source/BYGA/SH holds.'),'0b5342b9':('D15','Current resourceLinks and reviewed image input differ from the historical v1 native page. No claim that old D reviewers inspected the current image; explicit historical D withdrawal pending proper current binding.'),'96d33fb6':('D15','Current whole-P/source/GOD acquisition and operator holds remain open. This historical D claim is explicitly unselected for this bounded two-goal integration; no block/revise is fabricated and no whole-source or new strict clearance is inferred.')}
newwithdraw=[]
for prefix,(n,reason) in withdrawByPrefix.items():
 matches=[g for g in newrows[n] if g.startswith(prefix)];assert len(matches)==1;g=matches[0];assert not oldclaim.get(g);x=newrows[n][g];newwithdraw.append({'goalId':g,'indexPath':newpaths[n],'historicalResolutionDigest':x['resolutionDigest'],'reason':reason})
withdrawids={x['goalId'] for x in newwithdraw};newedges=[];owners=[];selected={'f7f35d71-927a-511c-a49e-65a66794a9bc','47582f06-d724-5da9-acc6-16c91ab94f67'}
for gid in sorted(set(newrows['D15'])|set(newrows['D11'])):
 neworder=[newpaths[n] for n in ['D15','D11'] if gid in newrows[n]]
 if gid in selected:assert not oldclaim.get(gid);continue
 if gid in withdrawids:continue
 old=oldclaim.get(gid,[]);assert old,gid;es=[x for x in bs['resolutionSupersessions'] if x['goalId']==gid];oldstart=[p for p in old if p not in {e['replacementIndexPath'] for e in es}];assert len(oldstart)==1;(oldfirst,)=oldstart
 seq=neworder+[oldfirst]
 for f,t in zip(seq,seq[1:]):newedges.append({'goalId':gid,'supersededIndexPath':f,'replacementIndexPath':t})
 owners.append({'goalId':gid,'addedHistoricalPrefixInOriginalReviewChronology':neworder,'existingChainFirstUnchanged':oldfirst,'existingWholeChainEdgesUnchanged':es})
assert len(newedges)==18 and len(newwithdraw)==4
s['resolutionIndexPaths']+=list(newpaths.values());s['resolutionSupersessions']+=newedges;s['resolutionWithdrawals']+=newwithdraw
aliases=[]
for name in ['P1-f7','A1-f7','P1-475','A1-475']:
 src=O/'config'/f'{name}.current412.actual-candidate.scoped.config.json';d=read(src);d['landscapePath']=s['landscapePath']
 if name.startswith('P'):d['semanticKindLedgerPath']=s['semanticKindLedgerPath']
 dst=O/'config'/f'{name}.normal-address.future-inactive.config.json';write(dst,d);key='positiveEvidenceConfigPaths' if name.startswith('P') else 'semanticAtomicityConfigPaths';s[key].append(rel(dst));aliases.append({'candidateScopedVerifiedConfig':rel(src),'futureNormalAddressConfig':rel(dst),'changedKeys':['landscapePath']+(['semanticKindLedgerPath'] if name.startswith('P') else [])})
cfg['reportId']=cfg['reportId']+'-plus-f7-475-historical-pair-retention-unmeasured';out=O/'config/current412-existing292-plus-two-exact-history-selection.UNMEASURED.inactive.config.json';write(out,cfg)
assert s['resolutionSupersessions'][:131]==bs['resolutionSupersessions'];assert s['resolutionWithdrawals'][:1]==bs['resolutionWithdrawals'];assert s['resolutionIndexPaths'][:-2]==bs['resolutionIndexPaths']
cas={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'additive exact normal-index and owner-chain overlay; no new science, no central count claimed','base':{'configPath':rel(bp),'configSha256':sha(bp),'actualMeasuredStrict':292,'denominator':412,'existingSupersessionEdges':131,'existingWithdrawals':1},'completeHistoricalContainers':{'D11':{'indexPath':newpaths['D11'],'indexSha256':sha(R/newpaths['D11']),'originalGoalCount':11,'resolutions':10,'actualBlockDeferral':idx['D11']['deferredGoalIds']},'D15':{'indexPath':newpaths['D15'],'indexSha256':sha(R/newpaths['D15']),'originalGoalCount':15,'resolutions':14,'actualReviseDeferral':idx['D15']['deferredGoalIds']}},'append':{'resolutionIndexPaths':list(newpaths.values()),'resolutionSupersessions':newedges,'resolutionWithdrawals':newwithdraw,'semanticAtomicityConfigPaths':s['semanticAtomicityConfigPaths'][len(bs['semanticAtomicityConfigPaths']):],'positiveEvidenceConfigPaths':s['positiveEvidenceConfigPaths'][len(bs['positiveEvidenceConfigPaths']):]},'normalAliasOnlyBindings':aliases,'owners':owners,'onlyTwoNewCurrentSelections':sorted(selected),'original131EdgesAndOneWithdrawalExactlyPreserved':True,'noCurrentStaleClaimsAdmitted':True,'unmeasuredCompleteBase412Config':{'path':rel(out),'sha256':sha(out)},'laterCurrent414Integration':'Use append operations with exact preserved original131-edge/one-withdrawal prefix and all later Rest6 additions retained. No claim of already measured294 or296; actual central run owned separately by Root.','noHActiveGitEngineWrites':True,'noSourceOrHumanClearance':True,'newScientificVotes':0,'actualNewStrictMeasured':0}
write(O/'CAS.exact-D11-D15-full-originals-only-f7-475-current-selection.ADDITIVE-NOT-APPLIED.json',cas)
print('overlay',len(newedges),'real additive predecessor edges,',len(newwithdraw),'exact digest withdrawals; selected',sorted(selected))
