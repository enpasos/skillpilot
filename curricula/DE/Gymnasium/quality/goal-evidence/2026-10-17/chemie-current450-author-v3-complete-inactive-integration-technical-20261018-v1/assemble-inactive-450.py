#!/usr/bin/env python3
"""Apache-2.0. Exact inactive transport; no science votes or normal writes."""
import copy, datetime, hashlib, json
from pathlib import Path
ROOT=Path.cwd();N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/'
OUT=N+'chemie-current450-author-v3-complete-inactive-integration-technical-20261018-v1/'
AUTHOR=N+'chemie-current447-final-four-scope-corrections-author-20261018-v3/'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
S='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
R='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
IMAGE=N+'chemie-current450-three-new-visual-author-20261018-v1/INPUT.three-current-goal-exact-image.pending.json'
def read(p):return json.loads((ROOT/p).read_text())
def pin(p):
 b=(ROOT/p).read_bytes();return dict(path=p,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def sh(x):return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def write(p,x):
 q=ROOT/(OUT+p);q.parent.mkdir(parents=True,exist_ok=True)
 with q.open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
 return OUT+p
def write_lines(p,lines):
 q=ROOT/(OUT+p);q.parent.mkdir(parents=True,exist_ok=True)
 with q.open('x') as f:f.writelines(lines)
 return OUT+p
def jsonline(x):return json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n'
def rawrows(p):return [(line if line.endswith('\n') else line+'\n',json.loads(line)) for line in (ROOT/p).read_text().splitlines(keepends=True) if line.strip()]
def check(p):assert pin(p['path'])==p, 'Input drift '+p['path']
seal=read(AUTHOR+'SEAL.actual-author-ten-profiles-three-preserved-duties.pending.json');assert pin(AUTHOR+'SEAL.actual-author-ten-profiles-three-preserved-duties.pending.json')['sha256']=='2c289e319df89722b61e15142e6307cac207392f21292f90a455afd4fc5837e0'
for p in seal['files']:check(p)
a=read(AUTHOR+'AUTHOR.complete-eight-profiles-three-goals-and-operative-materials.pending.json');vp=read(AUTHOR+'VIEWS.four-whole-HB-views-and-twelve-target-additions.pending.json');sp=read(AUTHOR+'SOURCE.four-exact-current-union-partitions-and-term-ownership.pending.json');amp=read(AUTHOR+'SEM-A-M.three-explicit-author-candidates-and-old-boundary-retention.pending.json');im=read(IMAGE)
assert pin(IMAGE)['sha256']=='3387e2eb99b5e516edcb1510426e31f58b4bf40345da96617986a52b5c55c57d'
before=read(C);sem=read(S);reg=read(R);chem=next(s for s in reg['subjects'] if s['subject']=='chemie');assert pin(R)['sha256']=='44b49957ed723bd6667fa66ce129167261df4c80d20d4d8cb8c7224cf853312b'
assert len(chem['resolutionIndexPaths'])==126 and len(chem['resolutionSupersessions'])==553
for p in a['inputPins']:
 if p['path']!=R:check(p)
old={g['id']:g for g in before['goals']};c=copy.deepcopy(before);by={g['id']:g for g in c['goals']};newids=[g['id'] for g in a['newGoals']];assert len(newids)==3 and not set(newids)&set(old)
newrows={r['goalId']:r for r in a['records'] if r['goalId'] in newids};oldrows={r['goalId']:r for r in a['records'] if r['goalId'] not in newids};assert len(oldrows)==7
for g,r in oldrows.items():assert old[g]==r['currentWholeGoal']==r['wholeProposedGoal']
assetrows=[]
for g in a['newGoals']:
 r=next(r for r in im['records'] if r['goalId']==g['id']);check(r['actualImage']);assert {k:v for k,v in r['wholeCandidateGoal'].items() if k!='resourceLinks'}=={k:v for k,v in g.items() if k!='resourceLinks'}
 n=copy.deepcopy(g);n['resourceLinks']=copy.deepcopy(r['wholeCandidateGoal']['resourceLinks']);c['goals'].append(n);by[n['id']]=n
 for l in n['resourceLinks']:assetrows.append(dict(goalId=n['id'],url=l['url'],sourceImage=r['actualImage'],futurePublicPath='app/public'+l['url'],exactResourceLink=l,actualVApprovalPending=True))
rootid=vp['canonicalRootContainsProposal']['rootGoalId'];assert rootid=='442c31c5-c561-5c7a-90bb-2335d779175c';assert vp['canonicalRootContainsProposal']['appendNewGoalIds']==newids
by[rootid]['contains']+=newids
assert len(c['goals'])==662 and all(by[g]==old[g] for g in old if g!=rootid)
assert {k:v for k,v in by[rootid].items() if k!='contains'}=={k:v for k,v in old[rootid].items() if k!='contains'}
cp=write('C662.450ordinary-68memory.author-v3-with-root-and-exact-image-links.INACTIVE.json',c)
write('IMAGES3.exact-source-to-proposed-normal-link-inputs.json',dict(source=pin(IMAGE),records=assetrows,assetsCopied=False,visualReviewApprovalClaimed=False))
for r in sem['decisions']:assert r['goalId'] in old
sem['ledgerId']='chemie-current662-450ordinary-three-author-candidates-inactive-20261018-v1';sem['sourceLandscapePath']=cp;sem['counts']['curricularAtomic']=450;sem['counts']['total']=662
for g in newids:sem['decisions'].append(dict(goalId=g,sourceFingerprint='PENDING_TECHNICAL_STOCK_SOURCE_FP',semanticKind='curricularAtomic',decisionStatus='author_candidate',decisionBasis='inactive-unreviewed-author-curricular-atomic-proposal'))
write('SEM662.old659-classifications-plus-three-author-assumptions.INACTIVE-TRANSPORT.json',sem)
check(sp['mappingExact']);mapping=read(sp['mappingExact']['path']);m=copy.deepcopy(mapping);md=[]
for r in sp['rows']:
 i=r['ordinalOneBased']-1;assert m['decisions'][i]==r['wholeCurrentDecision'];m['decisions'][i]=copy.deepcopy(r['wholeProposedDecision']);gid=r['wholeSourceGoal']['id'];edges=[e for e in m['mappings'] if e['legacyGoalId']==gid];oldedge=[e for e in edges if e['canonicalGoalId']==r['removeOnlyReassignedCarrier']];assert len(oldedge)==1;oldedge[0]['canonicalGoalId']=r['replacementCarrier'];assert all(e['matchType']=='partial' for e in edges);assert {e['canonicalGoalId'] for e in edges}==set(r['wholeProposedDecision']['canonicalGoalIds']);md.append(dict(ordinalOneBased=r['ordinalOneBased'],sourceGoalId=gid,beforeCarrier=r['removeOnlyReassignedCarrier'],afterCarrier=r['replacementCarrier'],matchType='partial',wholeSourceCompletionFromSingleGoalMasteryAllowed=False))
m['active']=False;m['status']['scientificReview']='inactive_author_v3_four_union_proposals_pending_actual_paired_science';m['status']['normalActivation']='inactive_no_normal_write_or_AP'
mp=write('HB232.four-union-partition-successor.INACTIVE.json',m)
assert len(m['mappings'])==len(mapping['mappings']) and all(m['decisions'][i]==mapping['decisions'][i] for i in range(232) if i not in {r['ordinalOneBased']-1 for r in sp['rows']})
write('SOURCE4.exact-partial-carrier-deltas-and-HB153-retention.json',dict(candidate=pin(mp),changes=md,other228DecisionsWholeExact=True,sourceInventoryAndScopeRulesExact=True,conditionalHB21HB23ChoicePreserved=True,HB153UnchangedSource=pin(AUTHOR+'SCOPE.HB153-exact-current-partial-union-and-conditional-performance.pending.json'),noWholeSourceCreditInvented=True))
viewmap={};viewrows=[]
for r in vp['wholeViews']:
 check(r['wholeCurrentFile']);p=write('views/'+Path(r['path']).stem+'.INACTIVE.json',r['wholeProposedView']);viewmap[r['path']]=p;viewrows.append(dict(normalPath=r['path'],wholeBefore=r['wholeCurrentFile'],candidate=pin(p)))
mcfg=read(chem['memoryReviewConfigPath']);assert len(mcfg['scope']['rootGoalIds'])==2 and mcfg['scope']['rootGoalIds']==[rootid,'8edee6b6-9ead-515e-93f5-feada64522b2'];assert len(mcfg['visibilityScopes'])==41
whole41=[]
for v in mcfg['visibilityScopes']:
 p=v['viewPath'];whole41.append(dict(normalPath=p,before=pin(p),wholeCandidateView=read(viewmap[p]) if p in viewmap else read(p),candidatePath=viewmap.get(p,p)))
write('VIEWS41.current37-plus-four-author-successors.INACTIVE.json',dict(rows=whole41,expectedNewTuples=vp['rows'],expectedAdditionCount=12,normalWrites=False))
write('VIEWS4.normal-installation-plan.PENDING-actual-science.json',dict(rows=viewrows,exactTwelveTuples=vp['rows'],allExistingRolesMustRemainExact=True,normalWriteAuthorized=False))
arows={};pbase={};powner={};asources=[];psources=[]
for conf in chem['semanticAtomicityConfigPaths']:
 cfg=read(conf);rows=rawrows(cfg['reviewPath']);asources.append(dict(config=pin(conf),records=pin(cfg['reviewPath'])))
 for raw,r in rows:assert r['goalId'] not in arows;arows[r['goalId']]=(raw,r,conf)
for conf in chem['positiveEvidenceConfigPaths']:
 cfg=read(conf);rows=rawrows(cfg['reviewPath']);psources.append(dict(config=pin(conf),records=pin(cfg['reviewPath'])))
 for raw,r in rows:assert r['goalId'] not in pbase;pbase[r['goalId']]=(raw,r);powner[r['goalId']]=(conf,cfg)
mrows=rawrows(mcfg['reviewPath']);assert len(arows)==len(pbase)==len(mrows)==447
for g,r in oldrows.items():assert pbase[g][1]['profile']==r['wholeCurrentProfile']
ordinary=[r['goalId'] for r in sem['decisions'] if r['semanticKind']=='curricularAtomic'];assert len(ordinary)==450
writer=[];affected=set(r['goalId'] for r in a['records'])
for g in ordinary:
 r=next((r for r in a['records'] if r['goalId']==g),None);base=pbase.get(g)
 writer.append(dict(goalId=g,profile=copy.deepcopy(r['wholeProposedProfile'] if r else base[1]['profile']),baselineNativeRecord=base[1] if base else None,currentOwnerConfig=powner[g][0] if base else None,profileChanged=r is not None,newGoal=g in newids,statusProposal=r['newRecordStatusProposal'] if r else dict(status=base[1]['status'],reviewAuthority=base[1]['reviewAuthority'],evidenceLevel=base[1]['evidenceLevel'],maximumClaimScope=base[1]['maximumClaimScope']),profileSource=dict(path=AUTHOR+'AUTHOR.complete-eight-profiles-three-goals-and-operative-materials.pending.json',jsonPointer='/records/'+str(a['records'].index(r))+'/wholeProposedProfile',filePin=pin(AUTHOR+'AUTHOR.complete-eight-profiles-three-goals-and-operative-materials.pending.json')) if r else dict(nativeRecordFile=powner[g][1]['reviewPath'],goalId=g),wholeProfileObjectSHA256=sh(r['wholeProposedProfile'] if r else base[1]['profile']),newSciencePending=r is not None,materialRoute=pin(AUTHOR+'MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json') if r else None))
write_lines('P450.complete-selected-whole-profile-writer-input.INACTIVE.jsonl',[jsonline(r) for r in writer]);assert sum(not r['profileChanged'] for r in writer)==440
write_lines('A447.actual-normal-whole-records.byte-exact.jsonl',[arows[g][0] for g in ordinary if g not in newids]);write_lines('M447.actual-normal-whole-records.byte-exact.jsonl',[raw for raw,_ in mrows]);write_lines('P440.retained-current-native-records.byte-exact.jsonl',[pbase[g][0] for g in ordinary if g not in affected])
at=datetime.datetime.now(datetime.timezone.utc).isoformat();an=[];mn=[]
for g in newids:
 proposal=next(r for r in amp['newDecisions'] if r['goalId']==g);common=dict(schemaVersion=1,landscapeId=c['landscapeId'],goalId=g,fingerprint='PENDING_TECHNICAL_STOCK_FP',status='needs_developer_review',reviewedAt=at,reviewer='Technical inactive transport of author v3 proposal; independent science pending')
 an.append(dict(common,reviewId='canonical-chemistry-current450-three-author-atomicity-proposals',ruleVersion='semantic-atomicity-v1',semanticAtomic=None,reason='AUTHOR PROPOSAL keep_atomic; no actual independent acceptance serialized. '+proposal['semanticAtomicityRationaleDe']))
 mn.append(dict(common,reviewId=mcfg['reviewId'],ruleVersion=mcfg['ruleVersion'],memoryUseful=None,memoryGoalIds=[],deckIds=[],reason='AUTHOR PROPOSAL no_memory; independent review pending, no new cards proposed. '+proposal['memoryRationaleDe']))
write_lines('A/A3.pending-author-records.jsonl',[jsonline(r) for r in an]);write_lines('M/M3.pending-author-records.jsonl',[jsonline(r) for r in mn])
write('A/A3.pending-author.normal-installation.config.json',dict(schemaVersion=1,reviewId=an[0]['reviewId'],ruleVersion=an[0]['ruleVersion'],landscapeId=c['landscapeId'],landscapePath=C,reviewPath=OUT+'A/A3.pending-author-records.jsonl',scope=dict(label='Exactly three author proposals, actual science pending',leafGoalIds=newids)))
normalM=copy.deepcopy(mcfg);normalM['reviewPath']=OUT+'M450.pending-science.full-original-memory-refs.jsonl';normalM['reportPath']=OUT+'M450.pending-science.report.md';write('M450.exact-two-root.normal-installation.config.json',normalM)
inactiveM=copy.deepcopy(normalM);inactiveM['landscapePath']=cp
for v in inactiveM['visibilityScopes']:v['viewPath']=viewmap.get(v['viewPath'],v['viewPath'])
write('M450.exact-two-root.INACTIVE.config.json',inactiveM)
acfgs=list(chem['semanticAtomicityConfigPaths'])+[OUT+'A/A3.pending-author.normal-installation.config.json'];pcfgs=[];pdelta=[];candidateSets=[]
for i,conf in enumerate(chem['positiveEvidenceConfigPaths']):
 cfg=read(conf);changed=[g for g in cfg['scope']['goalIds'] if g in oldrows]
 if not changed:pcfgs.append(conf);continue
 keep=[g for g in cfg['scope']['goalIds'] if g not in oldrows];after=None
 if keep:
  rp=write_lines(f'P/residual/P{i+1:03d}.exact-current-rest.jsonl',[pbase[g][0] for g in keep]);rc=copy.deepcopy(cfg);rc['reviewPath']=rp;rc['scope']['goalIds']=keep;after=write(f'P/residual/P{i+1:03d}.same-owner.config.json',rc);pcfgs.append(after)
 nc=copy.deepcopy(cfg);nc['reviewPath']=OUT+f'P/successors/P{i+1:03d}.pending-native.review.jsonl';nc['scope']=dict(label='Exact current namespace; author v3 successors pending paired science',goalIds=changed);normalcp=write(f'P/successors/P{i+1:03d}.pending-native.normal.config.json',nc);pcfgs.append(normalcp)
 cs=dict(schemaVersion=1,authoringContract='positive-understanding-evidence-candidates-v1',reviewId=cfg['reviewId'],reviewedAt=at,reviewer='Technical author-v3 candidate transport; actual paired science pending',goals=[dict(goalId=g,reason='AUTHOR V3 WHOLE-P successor; independent acceptance pending, original measured evidence level retained, no D/P/M7/human approval created.',evidenceLevel=pbase[g][1]['evidenceLevel'],maximumClaimScope=pbase[g][1]['maximumClaimScope'],dissent=pbase[g][1]['dissent'],profile=oldrows[g]['wholeProposedProfile']) for g in changed]);csfile=write(f'P/successors/P{i+1:03d}.pending-native.candidates.json',cs);candidateSets.append(dict(config=normalcp,candidateSet=csfile,goalIds=changed,existingReviewIdPreserved=cfg['reviewId']));pdelta.append(dict(before=conf,residual=after,successor=normalcp,changedGoalIds=changed,untouchedRecordLinesExact=True))
newPid='canonical-chemistry-current450-three-narrow-author-proposals-20261018-v1';pcfg=dict(schemaVersion=2,reviewId=newPid,goalFingerprintRuleVersion='goal-evidence-v1',profileRuleVersion='positive-understanding-evidence-v2',landscapeId=c['landscapeId'],landscapePath=C,semanticKindLedgerPath=S,reviewCriteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath=OUT+'P/P3.pending-native.review.jsonl',reviewRunManifestPaths=[],reviewedResourceTypes=['goal-visualization'],requireApproved=False,scope=dict(label='Three new author-v3 complete profiles; actual science/V still pending',goalIds=newids));npc=write('P/P3.pending-native.normal.config.json',pcfg);pcfgs.append(npc)
ncs=write('P/P3.pending-native.candidates.json',dict(schemaVersion=1,authoringContract='positive-understanding-evidence-candidates-v1',reviewId=newPid,reviewedAt=at,reviewer='Technical author-v3 candidate transport; actual paired science pending',goals=[dict(goalId=g,reason='Inactive author-v3 whole goal/P proposal; no independent acceptance serialized. E0/G0 retained; actual performance and all native/human gates remain open.',evidenceLevel='E0',maximumClaimScope='G0',dissent=[],profile=newrows[g]['wholeProposedProfile']) for g in newids]));candidateSets.append(dict(config=npc,candidateSet=ncs,goalIds=newids,newLevel='E0',newClaim='G0'))
write('AMP450.complete-serialization-inputs-and-finite-owner-delta.INACTIVE.json',dict(role='Concrete inactive input selection, not actual AMP acceptance or application',normalRegistry=pin(R),authorSeal=pin(AUTHOR+'SEAL.actual-author-ten-profiles-three-preserved-duties.pending.json'),wholeCandidateCanonical=pin(cp),old447ARecordsExact=True,old447MRecordsExact=True,old440WholePProfilesAndNativeRecordsExact=True,new3AAndMPending=True,new3MemoryProposal='no_memory',new3PendingNativeStatus='needs_developer_review',new3PEvidenceLevel='E0',new3PMaximumClaimScope='G0',A=dict(beforeConfigPaths=chem['semanticAtomicityConfigPaths'],proposedConfigPaths=acfgs),M=dict(beforeConfig=chem['memoryReviewConfigPath'],proposedConfig=OUT+'M450.exact-two-root.normal-installation.config.json',rootGoalIds=normalM['scope']['rootGoalIds'],visibilityScopes=41,cards=pin(normalM['cardReviewPath'])),P=dict(beforeConfigPaths=chem['positiveEvidenceConfigPaths'],proposedConfigPaths=pcfgs,ownerDeltas=pdelta,exactStockCandidateSets=candidateSets,selectedWholeProfileCount=450,old7NamespacesReviewIdsAndRulesPreserved=True),D=dict(historicalIndices=126,supersessionEdges=553,entireDFieldsMustRemainExact=True,explicitDDeferrals=['127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a','2f3cdec5-f845-5b0f-841e-8b1d47de0281','87d8cc68-fe82-5273-9e43-c18b566ecb6c','92c99237-1c74-54fc-bf08-9191656afaa6']),beforeRootAuthorization=False,normalFilesWritten=False,APRun=False,buildRun=False,newScientificJudgments=0,stockMaterializerNotYetExecuted=True,actualPrerequisitesForNativeP=['Root actual paired10 science pins','actual V3 pins and normal3asset installation','actual authoritative new3 SEM after paired class/A/M science','final AP stage and sourceFP replay before native final binding']))
write('INPUTS.actual-current447-and-author-v3-pins.json',dict(currentCanonical=pin(C),currentSemantic=pin(S),currentRegistry=pin(R),historicalAuthorRegistryDifference='Author pinned5539 predates actual D29. Current44b differs by authorized D-only126/553 selection; do not overwrite it.',authorSeal=pin(AUTHOR+'SEAL.actual-author-ten-profiles-three-preserved-duties.pending.json'),imageInput=pin(IMAGE),currentA=asources,currentP=psources,currentMConfig=pin(chem['memoryReviewConfigPath']),currentMRecords=pin(mcfg['reviewPath']),currentCards=pin(mcfg['cardReviewPath']),other4WholeSubjectObjectSHA256={s['subject']:sh(s) for s in reg['subjects'] if s['subject']!='chemie'}))
write('CHECK.python-whole-body-and-exact-author-retention.json',dict(totalCandidateGoals=662,ordinaryCount=450,memoryCount=68,wholeOldGoalObjectsExact=658,wholeOldOrdinaryGoalObjectsExact=447,changedExistingGoalFields=[dict(goalId=rootid,field='contains',onlyAppended=newids)],newGoalsWithExactProposedImageLinks=newids,newGoalsAttachedBeforeAP=True,existingWholeProfileBodiesExact=440,changedExistingWholeProfiles=7,newWholeProfiles=3,author10WholeProfilesExact=True,oldA447WholeRowsExact=True,oldM447WholeRowsExact=True,oldP440WholeRowsExact=True,oldMRootsExactTwo=True,HBSourceUnionProposals=4,other228SourceDecisionsWholeExact=True,sourceMappingEdgeCountBefore=len(mapping['mappings']),sourceMappingEdgeCountAfter=len(m['mappings']),normalFilesWritten=False,APRun=False,buildRun=False,scienceCreated=0))
print(json.dumps(dict(output=OUT,canonical=pin(cp),profiles=pin(OUT+'P450.complete-selected-whole-profile-writer-input.INACTIVE.jsonl'),oldProfileBodiesExact=440,newProfileRows=10,PStockCandidateSetGroups=len(candidateSets),oldNamespacesSplit=len(pdelta)),indent=2))
