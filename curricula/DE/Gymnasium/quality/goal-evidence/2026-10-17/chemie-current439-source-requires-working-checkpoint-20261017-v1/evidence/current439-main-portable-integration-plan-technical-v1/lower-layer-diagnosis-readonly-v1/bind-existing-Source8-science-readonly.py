from pathlib import Path
import hashlib,json,datetime
M=Path('/home/enpasos/projects/skillpilot');K=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-remediation14-guarded-root-integration-technical-v1/capsule');L=M/'tmp/chemie-m7-resumed-20261016/chemie-combined639-source8-reviewed-integration-capsule-L5-v1';O=Path(__file__).resolve().parent;R=M/'tmp/chemie-m7-resumed-20261016'
def load(p):return json.loads(Path(p).read_text())
def pin(p):return {'path':str(p),'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest(),'bytes':Path(p).stat().st_size}
def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
proofs={}
def checked(rel,expected=None):
 p=M/rel;v=pin(p)
 if expected:assert v['sha256']==expected.removeprefix('sha256:')
 proofs[str(p)]=v;return v
relroot='tmp/chemie-m7-resumed-20261016/'
rootfirst=load(R/'source8-root-independent-science-v1/FIRST.source8-v1.actual-informed-root.science.json');follow=load(R/'source8-root-independent-science-v1/FOLLOWUP.source8-HH-v2.actual-informed-root.KEEP.json')
rootpin=checked(relroot+'source8-root-independent-science-v1/FIRST.source8-v1.actual-informed-root.science.json',follow['previousRootFirst']['sha256'])
bfirst=load(R/'eight-empty-compiled-source-independent-b-v1/FIRST.source8-v1.actual-independent-b.science.json');bpin=checked(relroot+'eight-empty-compiled-source-independent-b-v1/FIRST.source8-v1.actual-independent-b.science.json','a35cf72bc24cbfcbd287453d00f880256ab9d1daa1e70e5fd73580e3eb5abc19')
receipts=[]
for name in ['EXECUTION.actual-source8-v2-paired-private-apply.receipt.json','EXECUTION.actual-two-SN-source-partial-private-apply.receipt.json']:
 p=R/'source8-reviewed-L5-private-technical-integration-v1'/name;x=load(p);receipts.append(pin(p));proofs[str(p)]=pin(p)
 refs=x.get('reviewSources',[]) + [x[k]for k in ['rootScience','independentBScience','authorCAS']if k in x]
 for item in refs:
  checked(item['path'],item['sha256']);obj=load(M/item['path'])
  for field in ['scienceFIRST','immutableOriginalFIRST']:
   if field in obj:checked(obj[field]['path'],obj[field]['sha256'])
  for f in obj.get('files',[]):checked(f['path'],f['sha256'])
D=load(O/'DIAGNOSIS.actual-427-unsupported-82-source-gaps-148-warnings.exact-IDs.json');rows=[r for r in D['reverseUnmappedSourceGoals']if any(a['targetIntersectsCurrentView']for a in r['currentMappings'])]
paths=sorted({m['mappingPath']for r in rows for m in r['currentDecisions']});comparisons=[]
for rel in paths:
 a=load(K/rel);b=load(L/rel);assert a==b
 comparisons.append({'mappingRepoPath':rel,'currentKPin':pin(K/rel),'actualReviewedPrivateL5Pin':pin(L/rel),'wholeJSONObjectEqual':True,'wholeByteEqual':(K/rel).read_bytes()==(L/rel).read_bytes()})
relC='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';C={g['id']:g for g in load(K/relC)['goals']};oldC={g['id']:g for g in load(L/relC)['goals']};targetChecks=[]
for g in rootfirst['eightExistingOrdinaryNewPartialSourceContributions']:
 gid=g['goalId'];assert C[gid]==oldC[gid];targetChecks.append({'goalId':gid,'title':C[gid]['title'],'wholeCurrentGoalEqualsSource8ReviewedL5':True,'actualRootVerdict':g['verdict'],'actualRootReason':g.get('independentScienceReason'),'currentGoalBodyDigest':'sha256:'+hashlib.sha256(stable(C[gid]).encode()).hexdigest()})
assert C['d2ccd1d5-56f7-583f-9724-e97441367f91']==oldC['d2ccd1d5-56f7-583f-9724-e97441367f91']
hbrel='curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json';hb=load(K/hbrel);hbold=load(M/hbrel);hbl5=load(L/hbrel);assert hb==hbl5
ma={g['id']:g for g in hbold['sourceGoals']};ca={g['id']:g for g in hb['sourceGoals']}
proposals=[]
for r in rows:
 decisions=r['currentDecisions'];proposal={'sourceGoalId':r['sourceGoalId'],'jurisdiction':r['jurisdiction'],'currentWholeSelectedDecisions':[{'mappingPath':d['mappingPath'],'wholeCurrentDecisionSha256':'sha256:'+hashlib.sha256(stable(d['decision']).encode()).hexdigest()}for d in decisions],'scienceAlreadyExistsForBoundedContributions':True,'proposedSerialization':'Add an explicit paired contribution-review binding with original FIRST/followup references, exact current source/edge/goal digests and honest partial/full component limits. Preserve original author candidate and scientific files unchanged.','currentWholeRowDecisionNotAutomaticallyPromoted':True,'wholeSourceUnionApprovalInferred':False,'newScientificVote':False}
 if r['jurisdiction']=='DE-NW':proposal['wholeOperatorException']='Original Root explicitly KEEP_EXACT for b7 whole integrated operator; original B/current whole target exactness must be bound before any owner M3 full-row serialization. 1df remains partial.'
 proposals.append(proposal)
out={'role':'Read-only existing Source8 paired-science/current-body reconciliation and explicit serialization proposals; not new science or source closure','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'proofPins':list(proofs.values()),'actualPrivateApplyReceipts':receipts,'current10MappingWholesEqualActualPairedL5':comparisons,'actualEightReviewedOrdinaryWholesEqualCurrent650':targetChecks,'SNCurrentD2ccWholeEqualsReviewedL5':True,'actualRootV1IndependenceDisclosure':rootfirst['independenceDisclosure'],'actualRootV1SourceCellVerdicts':rootfirst['sourceCellVerdicts'],'HHActualFollowupNoWholeSourceUnionApproval':follow['noWholeSourceUnionApproval'],'source9SerializationProposals':proposals,'HB97':{'currentPin':pin(K/hbrel),'sameWholeJSONObjectAsActualPairedL5':True,'qualityReviewCount':hb['qualityReview']['sourceGoalCountPeerBaseline'],'MainOldWholeSourceGoalCount':len(ma),'currentWholeSourceGoalCount':len(ca),'removedMainSourceGoalIds':sorted(ma.keys()-ca.keys()),'addedCurrentSourceGoalIds':sorted(ca.keys()-ma.keys()),'changedCommonSourceGoalIds':sorted(gid for gid in ma.keys()&ca.keys()if ma[gid]!=ca[gid]),'existing88AcceptanceNotTransferred':True,'current97CountAcceptanceFoundInTheseActualSource8Artifacts':False},'noBlindCandidateStatusFlip':True,'noWholeUnionFromPartialContributionInference':True,'MainMutated':False,'KMutated':False,'noFullGatesOrBuildsRun':True}
for rel in ['source8-root-independent-science-v1/FIRST.source8-v1.actual-informed-root.science.json','eight-empty-compiled-source-independent-b-v1/FIRST.source8-v1.actual-independent-b.science.json']:
 assert pin(R/rel)==proofs[str(R/rel)]
p=O/'PROPOSAL.existing-Source8-paired-current9-contributions-and-HB97-honest-metadata.sealed.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');p.chmod(0o444);print(json.dumps(pin(p)))
