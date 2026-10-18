# SPDX-License-Identifier: Apache-2.0
"""Prepare finite inactivated native P2 records/configs; never mutate normal owners."""
import copy, hashlib, json
from datetime import datetime, timezone
from pathlib import Path

R=Path.cwd();O=Path(__file__).resolve().parent.parent;OP=str(O.relative_to(R))+'/'
N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
A=N+'chemie-current450-NI-ST-three-operative-source-remediation-author-20261018-v1/'
B=N+'chemie-current450-NI-ST-three-operative-source-remediation-informed-independent-b-20261018-v1/'
F=N+'chemie-current450-NI-ST-three-operative-source-remediation-informed-root-review-20261018-v1/'
CENTRAL='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
G=['8ceb1749-fce0-584f-a2b8-0a309282329a','e81a4aed-9695-533e-8eb7-7a0c714346ea']
read=lambda p:json.loads((R/p).read_text())
def sha(b):return hashlib.sha256(b).hexdigest()
def dig(x):return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def pin(p):
 p=Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':sha(b),'bytes':len(b)}
def wr(p,x):
 p=O/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');assert json.loads(p.read_text())==x;return pin(p)
def verify(p):assert pin(p['path'])==p,p

seals=[]
for p,want in [(A+'SEAL.author-candidate.json','81104aceac623dee4d648a4530a649cd08302ebc13eac88a2c84f4625a980580'),(B+'SEAL.own-first-informed-independent-b.json','2d954e1637e8f3ab4fe34e56fd88a064334436f6160452911dc5777de66cc8ad'),(F+'SEAL.root-informed-bounded-scientific-review.json','206ff7aee488c424af776f3e2100071a191c999365c2b309f8f82fb0adfe026f')]:
 assert pin(p)['sha256']==want
 for f in read(p)['files']:verify(f)
 seals.append(pin(p))
rootfirst=F+'FIRST.root-informed-three-source-and-two-whole-profile-designs.json'
assert pin(rootfirst)['sha256']=='a25c317167b87b7e2872d27fa0aea5a6a72fbfadd358fbce12dac23862e00fe9'
scienceB=B+'REVIEW.three-partial-source-relations-and-two-whole-profile-designs.FIRST.informed-independent-b.json'
assert len(read(rootfirst)['judgments'])==3 and all(j['wholeProfileDesignDecision']=='ACCEPT_BOUNDED_ADDITION_WITH_ALL_OLD_FIELDS_RETAINED' for j in read(rootfirst)['judgments'])

central=read(CENTRAL);subjectIndex=next(i for i,s in enumerate(central['subjects']) if s['subject']=='chemie');subject=central['subjects'][subjectIndex];paths=subject['positiveEvidenceConfigPaths'];assert len(paths)==133
can=read(subject['landscapePath']);goals={g['id']:g for g in can['goals']};inputs=read(A+'INPUT.exact-three-sources-two-whole-current-goals-profiles.json');deltas=read(A+'DELTA.two-whole-profile-additions.pending.json')['profileDeltas']
owner={};inventory=[];protected={CENTRAL:pin(CENTRAL),subject['landscapePath']:pin(subject['landscapePath']),subject['semanticKindLedgerPath']:pin(subject['semanticKindLedgerPath'])}
for index,p in enumerate(paths):
 c=read(p);protected[p]=pin(p);rp=c['reviewPath'];protected[rp]=pin(rp);lines=(R/rp).read_bytes().splitlines(keepends=True);rs=[(i,json.loads(l)) for i,l in enumerate(lines) if l.strip()];rmap={r['goalId']:(i,r) for i,r in rs}
 assert len(rmap)==len(rs) and set(rmap)==set(c['scope']['goalIds'])
 for gid in c['scope']['goalIds']:
  li,r=rmap[gid];inventory.append({'goalId':gid,'config':pin(p),'review':pin(rp),'lineOneBased':li+1,'wholeRecordCanonicalSHA256':dig(r),'wholeLineBytesSHA256':sha(lines[li]),'wholeProfileCanonicalSHA256':dig(r['profile'])})
  if gid in G:
   assert gid not in owner;owner[gid]={'path':p,'config':c,'record':r,'line':li+1,'lines':lines,'pathIndex':index}
assert len(inventory)==450 and len({x['goalId'] for x in inventory})==450 and set(owner)==set(G)

replacements=[];residuals=[]
for gid in G:
 x=owner[gid];b=next(w for w in inputs['wholeGoalProfileBindings'] if w['goalId']==gid);d=next(w for w in deltas if w['goalId']==gid)
 assert goals[gid]==b['wholeCurrentGoal'] and dig(goals[gid])==b['wholeGoalSHA256'];assert x['record']['profile']==b['wholeCurrentProfile'];assert dig(x['record']['profile'])==d['beforeWholeProfileSHA256']
 new=read(d['afterProfile']['path']);verify(d['afterProfile']);assert dig(new)==d['afterWholeProfileSHA256']
 applied=copy.deepcopy(x['record']['profile'])
 for op in d['arrayAppendOperations']:
  pp=op['pointer'].split('/')[2:-1];target=applied
  for k in pp:target=target[k]
  assert isinstance(target,list);target.extend(copy.deepcopy(op['values']))
 assert applied==new
 number='P044' if gid==G[1] else 'P106';config=copy.deepcopy(x['config']);config['scope']['goalIds']=[g for g in config['scope']['goalIds'] if g!=gid];assert config['scope']['goalIds'];config['reviewPath']=OP+f'residual/{number}.exact-other-records.review.jsonl'
 confrel=f'residual/{number}.scope-without-remediated-goal.config.json';cp=wr(confrel,config)
 data=b''.join(l for l in x['lines'] if not l.strip() or json.loads(l)['goalId']!=gid);q=R/config['reviewPath'];q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(data)
 selected=[json.loads(l) for l in data.splitlines() if l.strip()];assert [r['goalId'] for r in selected]==config['scope']['goalIds']
 assert all(r==json.loads(l) for r,l in zip(selected,[l for l in x['lines'] if l.strip() and json.loads(l)['goalId']!=gid]))
 residuals.append({'removedGoalId':gid,'oldConfig':pin(x['path']),'oldReview':pin(x['config']['reviewPath']),'newConfig':cp,'newReview':pin(config['reviewPath']),'retainedWholeRecords':len(selected),'retainedLineBytesExact':True,'retainedReviewId':config['reviewId']})
 replacements.append({'index':x['pathIndex'],'old':x['path'],'new':cp['path']})

reviewId='chemie-current450-ni-st-two-whole-p-informed-native-candidate-20261018-v1'
cfg=copy.deepcopy(owner[G[1]]['config']);cfg['reviewId']=reviewId;cfg['reviewPath']=OP+'native/P2.whole-accepted-bodies.inactive.review.jsonl';cfg['reviewCriteriaPath']='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md';cfg['reviewRunManifestPaths']=[];cfg['requireApproved']=False;cfg['scope']={'label':'Inactive native whole P2 candidate from actual informed independent B and Root whole C/P/material design reviews; no new D, blind review, human release or learner execution','goalIds':G}
cfgpin=wr('config/P2.informed-whole-profiles.inactive.config.json',cfg)
reasons={
 G[0]:'Technical native binding of the exact whole profile/material design accepted by the actual informed independent B and Root scientific reviews. NI EP Source004 uses the actual refinery diagram and a fresh wrong bypass; separation/transformation reasoning and all original HB18/20 and generic DE/EN duties remain. No new blind review, D vote, whole-source release, plant operation, learner performance or human approval.',
 G[1]:'Technical native binding of the exact whole profile/material design accepted by the actual informed independent B and Root scientific reviews. The two ST7/8 source routes require genuine personally performed supervised safe Mg/MgO work, own raw observations and blank protocol completion; paper/reference data do not count. All old whole DE/EN profile duties and the HB digital-recording boundary remain. No new blind review, D vote, whole-source release, learner performance or human approval.'}
candidates={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':reviewId,'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'Codex B technical native candidate preparation; actual informed whole-profile/material science by independent B and Root, exact model revision unknown','goals':[{'goalId':gid,'reason':reasons[gid],'evidenceLevel':'E1','maximumClaimScope':'G1','dissent':['Inactive candidate only; central normal owners remain unchanged until explicitly authorized activation after the A86 seal.','No human approval/trial or observed learner execution is certified. Official whole-source duties remain separate.','Existing native D pairs remain unchanged; current informed whole-C/P/material compatibility evidence is attached separately, without a new D decision.'],'profile':read(next(d for d in deltas if d['goalId']==gid)['afterProfile']['path'])} for gid in G]}
candpin=wr('INPUT.accepted-whole-P2.stock-candidate-set.json',candidates)

post=paths[:]
ops=[]
for x in replacements:
 ptr=f'/subjects/{subjectIndex}/positiveEvidenceConfigPaths/{x["index"]}';ops.extend([{'op':'test','path':ptr,'value':x['old']},{'op':'replace','path':ptr,'value':x['new']}]);post[x['index']]=x['new']
ops.append({'op':'add','path':f'/subjects/{subjectIndex}/positiveEvidenceConfigPaths/-','value':cfgpin['path']});post.append(cfgpin['path']);assert len(post)==134
postids=[g for p in post for g in read(p)['scope']['goalIds']];assert len(postids)==450 and len(set(postids))==450 and set(postids)=={x['goalId'] for x in inventory}
wr('PATCH.central-positive-evidence-configs-133-to134.INACTIVE.json',{'schemaVersion':1,'active':False,'normalMutationPerformed':False,'role':'FINITE_REVIEWABLE_PATCH_ONLY_DO_NOT_APPLY_BEFORE_ROOT_AUTHORIZATION_AFTER_A86_SEAL','centralBefore':pin(CENTRAL),'subject':'chemie','subjectIndex':subjectIndex,'beforePConfigArrayCanonicalSHA256':dig(paths),'beforeConfigCount':133,'afterConfigCount':134,'uniqueGoalCountBeforeAndAfter':450,'replacementOwners':replacements,'newP2Config':cfgpin,'operations':ops,'otherSubjectAndChemistryFieldsDelta':[]})

D='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-corrected447-final-native/batch-002/'
drefs=[]
for gid in G:
 p=D+'resolutions/'+gid+'.resolution.json';dr=read(p);protected[p]=pin(p);final=dr['goal']['finalText'];goal=goals[gid]
 assert final=={'titleDe':goal['title'],'titleEn':goal['titleEn'],'descriptionDe':goal['description'],'descriptionEn':goal['descriptionEn']}
 drefs.append({'goalId':gid,'existingResolution':pin(p),'existingPairedRoundIdentitiesUnchanged':dr['rounds'],'existingGoalFingerprint':dr['goal']['goalFingerprint'],'oldGoalReviewContextFingerprintPreservedAsHistoricalExactBinding':dr['goal']['goalReviewContextFingerprint'],'newDVote':False})
for p in [D+'resolution-index.json',D+'dual-summary.json']:
 protected[p]=pin(p)
wr('CONTEXT.two-current-bilingual-C-P-material-compatibility.from-actual-science.json',{'schemaVersion':1,'active':False,'role':'ACTUAL_INFORMED_WHOLE_PROFILE_AND_MATERIAL_COMPATIBILITY_BINDING_NO_NEW_D_VOTE','scientificSeals':seals,'wholeProfileScientificBReview':pin(scienceB),'wholeProfileScientificRootReview':pin(rootfirst),'wholeAcceptedMaterial':pin(A+'materials/THREE.complete-DE-EN-source-cases.pending.json'),'acceptedActualDiagram':pin(A+'materials/NI-EP5-refinery-bilingual.svg'),'exactAcceptedProfileDeltas':pin(A+'DELTA.two-whole-profile-additions.pending.json'),'wholeGoalSourceInput':pin(A+'INPUT.exact-three-sources-two-whole-current-goals-profiles.json'),'existingDPairBindings':drefs,'currentContextCompatibility':[{'goalId':gid,'wholeCurrentCanonicalGoalSHA256':dig(goals[gid]),'wholeAcceptedProfileBodySHA256':dig(read(next(d for d in deltas if d['goalId']==gid)['afterProfile']['path'])),'actualScientificBasis':'Full bilingual current C/P before and after and complete material cases were actually reviewed in the two pinned informed scientific reviews; this transport creates no fresh blinded scientific vote.','acceptedBoundedAddition':reasons[gid],'allOldProfileFieldsAndDutiesRetainedByExactAppendProof':True} for gid in G],'newDDecisions':0,'oldDContextFingerprintRewritten':False,'hashEqualityAloneUsedAsNewScientificReview':False,'humanOrActualLearnerExecutionClaim':False})
wr('INPUT.current-450-native-owner-inventory.structural-retention-only.json',{'role':'Structural whole-record retention pins only; no scientific rereview of448 others','activeCentralBefore':pin(CENTRAL),'ownerConfigCount':133,'uniqueGoals':450,'records':inventory,'candidateResiduals':residuals,'unchangedOther448WholeRecordAndProfileIds':[x['goalId'] for x in inventory if x['goalId'] not in G]})
for w in inputs['wholeGoalProfileBindings']:
 for link in goals[w['goalId']].get('resourceLinks',[]):
  if link.get('type')=='goal-visualization':
   p='app/public'+link['url'];protected[p]=pin(p)
for p in [cfg['reviewCriteriaPath'],cfg['semanticKindLedgerPath']]:protected[p]=pin(p)
wr('BEFORE.protected-normal-P-registry-D-and-two-C-pins.json',{'normalWritesAllowed':False,'protectedPins':[protected[k] for k in sorted(protected)],'source3MappingCASApplied':False,'apCompilerGlobalBuildRuns':0})
wr('PLAN.inactive-native-P2-and-exact-residues.json',{'active':False,'oldOwnerConfigCount':133,'proposedOwnerConfigCount':134,'uniqueCurrentPGoals':450,'targetGoalIds':G,'exactNewStockConfig':cfgpin,'exactStockCandidateSet':candpin,'residuals':residuals,'independentActualScientificSeals':seals,'newScientificFirstDecisions':0,'newDDecisions':0,'normalWrites':0})
print(json.dumps({'status':'PREPARED_INACTIVE_ONLY','output':OP,'residualCounts':[r['retainedWholeRecords'] for r in residuals],'configsBeforeAfter':[133,134],'uniqueGoals':450,'normalWrites':0},ensure_ascii=False))
