#!/usr/bin/env python3
"""Technical inactive transport only: no normal writes, new review, AP or build."""
from pathlib import Path
import copy, datetime, hashlib, json, shutil

ROOT=Path('/home/enpasos/projects/skillpilot')
N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
O=N/'chemie-current442-normal-integration-20261017-v1'
OUT=N/'chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1'
BASE=ROOT/OUT
BASE.mkdir(exist_ok=True)
D5=N/'chemie-current442-five-description-two-duty-split-author-20261017-v1/AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json'
P5=N/'chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.five-current-P-scope-operator-remedies.pending.json'
PH=O/'benzene-phase-Q1-native-adapter-v1/PLAN.C1-SEM1-A1-M1-P1.PENDING-root-integration.json'
CP=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
SEM=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
P442=O/'P442.review.jsonl'
PSELECT=O/'P442-plan/P442.actual-selected-whole-profile-writer-input.jsonl'
SRC=Path('curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json')
MAP=Path('curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json')
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()

def pin(p):
 p=Path(p);b=(ROOT/p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def objsha(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def read(p):return json.loads((ROOT/p).read_text())
def write(name,x):
 p=BASE/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(OUT/name)
def ref(p,ptr,x):return {**pin(p),'jsonPointer':ptr,'wholeObjectSHA256':objsha(x)}
def readjsonl(p):return [json.loads(x) for x in (ROOT/p).read_text().splitlines()]
def escape(x):return x.replace('~','~0').replace('/','~1')
def changed(a,b,p=''):
 if a==b:return []
 if not isinstance(a,dict) or not isinstance(b,dict):return [p or '/']
 out=[]
 for k in sorted(set(a)|set(b)):
  if k not in a or k not in b:out.append(p+'/'+escape(k))
  else:out+=changed(a[k],b[k],p+'/'+escape(k))
 return out
def at(x,p):
 for t in p.split('/')[1:]:
  t=t.replace('~1','/').replace('~0','~');x=x[int(t)] if isinstance(x,list) else x[t]
 return x
boundary={'normalActivation':False,'newScientificJudgments':0,'nativeApproval':False,'M7Claim':False,'humanApproval':False,'humanTrial':False,'APExecuted':False,'buildExecuted':False}

expected={CP:'1334c2f7e637c23737c32fffcda9adc9273b83e0d61f536c2e6b404699eee262',SEM:'87aaf21f6c3f185b192938ee63a616d29ad243bb37a1eb5a4c1b34e842f17044',REG:'5d9ea777d108f1d1e3a20aca63ea8d9ba70e8f1bf1e7f87a952e0f0a4079b025',D5:'14d6a2540f20143a44d8be657be4fef0b923c6c4a3e7b08efe6e4849526f4ce8',P5:'724fd382644a173e3d07bae21dbaa878c882f4205d872c50721c139fe5e5f883'}
for p,sha in expected.items():assert pin(p)['sha256']==sha,(p,pin(p))
inputs=[pin(x) for x in [CP,SEM,REG,D5,P5,PH,P442,PSELECT,SRC,MAP]]
d,p,phase=read(D5),read(P5),read(PH)
# Exact author seals only, no independent scientific review artifacts are read here.
for pack in [D5.parent,P5.parent]:
 seal=read(pack/'SEAL.json')
 # Different author seal layouts are preserved as exact inputs; author-file pins above are decisive.
 inputs.append(pin(pack/'SEAL.json'))

c=read(CP);before={g['id']:g for g in c['goals']};candidate=copy.deepcopy(c)
by={g['id']:g for g in candidate['goals']}
assert len(by)==654
gpatches=[]
for i,r in enumerate(d['records']):
 gid=r['goalId'];assert before[gid]==r['beforeGoal']
 after=copy.deepcopy(r['afterGoal']);assert objsha(after)==r['afterWholeGoalSHA256']
 by[gid]=after
 gpatches.append({'goalId':gid,'source':ref(D5,f'/records/{i}/afterGoal',r['afterGoal']),'beforeSHA256':objsha(before[gid]),'authorAfterSHA256':objsha(after),'rootTransportOverride':None})
# Root supplies the final English model term. This does not edit the sealed D5 AUTHOR.
atom=next(x for x in by if x.startswith('72236f2c'))
assert by[atom]['titleEn']=='Describe the nuclear-shell model and atomic constituents'
by[atom]['titleEn']='Describe the nuclear model of the atom and atomic constituents'
gpatches[0]['rootTransportOverride']={'field':'/titleEn','sealedAuthorValue':'Describe the nuclear-shell model and atomic constituents','candidateValue':by[atom]['titleEn'],'authority':'Final explicit Root instruction during technical assembly, superseding the earlier core-shell transport wording','scientificReviewClaim':False,'reason':'Root chooses nuclear model of the atom to name Rutherford without ambiguity with the nuclear shell model or materials core-shell terminology. The sealed author is unchanged, and exact final whole-context native D remains pending.'}
phid=phase['goalId'];assert before[phid]['dimensionTags']['phase']=='Q2'
by[phid]=copy.deepcopy(before[phid]);by[phid]['dimensionTags']['phase']='Q1'
gpatches.append({'goalId':phid,'source':pin(PH),'beforeSHA256':objsha(before[phid]),'changedFields':['/dimensionTags/phase'],'before':'Q2','after':'Q1','basis':'Root supplies separate paired phase science; assembler adds no scientific vote and reads no new peer judgments.'})

newrows=[]
for i,r in enumerate(d['newCandidateGoals']):newrows.append((r['goalId'],r['afterGoal'],D5,f'/newCandidateGoals/{i}/afterGoal',r['profile'],f'/newCandidateGoals/{i}/profile',{'scopePlan':r['scopePlan'],'sourceBindingProposal':r['sourceBindingProposal'],'memoryProposal':r['authorMemoryHypothesis'],'primaryImageBinding':r['primaryImageBinding']}))
for i,r in enumerate(p['newWholeGoalAndProfileCandidates']):newrows.append((r['goalId'],r['wholeGoalCandidate'],P5,f'/newWholeGoalAndProfileCandidates/{i}/wholeGoalCandidate',r['wholeProfileCandidate'],f'/newWholeGoalAndProfileCandidates/{i}/wholeProfileCandidate',{'scope':r['scope'],'memoryProposal':r['memoryProposal'],'visualizationReuseOption':r['visualizationReuseOption'],'authorAtomicityRationale':r['authorAtomicityRationale']}))
assert len(newrows)==5 and len({r[0] for r in newrows})==5
meta=[]
for gid,g,author,ptr,pr,pptr,scope in newrows:
 assert gid not in before
 stripped=copy.deepcopy(g);removed=[]
 def strip(v,ptr=''):
  if isinstance(v,dict):
   for k in list(v):
    if k in ['authorCandidate','authorProposal']:
     removed.append({'jsonPointer':ptr+'/'+escape(k),'exactValue':v.pop(k)})
    else:strip(v[k],ptr+'/'+escape(k))
  elif isinstance(v,list):
   for j,item in enumerate(v):strip(item,ptr+'/'+str(j))
 strip(stripped)
 assert len(removed)==1
 by[gid]=stripped
 meta.append({'goalId':gid,'wholeSealedAuthorGoal':ref(author,ptr,g),'originalWholeObjectSHA256':objsha(g),'strippedCandidateWholeObjectSHA256':objsha(stripped),'removedTransientFields':removed,'fullExternalBoundariesPreserved':scope,'externalAuthorTransportIsNotApproval':True})
candidate['goals']=[by[g['id']] for g in c['goals']]+[by[r[0]] for r in newrows]
CPIN=write('C659.447ordinary-68memory.two-author-candidates.INACTIVE.json',candidate)
write('ARCHIVE.five-new-goals-exact-transient-author-metadata.json',{'artifactRole':'Exact removed metadata transport; no author boundary discarded',**boundary,'rows':meta})

oldsem=read(SEM);oldkind={x['goalId']:x['semanticKind'] for x in oldsem['decisions']}
assert len(oldkind)==654
normalprofiles=readjsonl(P442);selected=readjsonl(PSELECT)
np={x['goalId']:(i,x) for i,x in enumerate(normalprofiles)};sel={x['goalId']:x for x in selected}
assert len(np)==442==len(sel)
ordinary={x for x,k in oldkind.items() if k=='curricularAtomic'}
assert set(np)==ordinary
for gid,(_,r) in np.items():assert r['profile']==sel[gid]['profile'],gid
overrides={}
for i,r in enumerate(p['existingWholeGoalAndProfileCandidates']):
 gid=r['goalId'];assert before[gid]==r['wholeCurrentGoal'];assert np[gid][1]['profile']==r['wholeCurrentProfile']
 assert objsha(r['wholeProposedProfile'])==r['profileAfterObjectSHA256']
 overrides[gid]=(r['wholeProposedProfile'],ref(P5,f'/existingWholeGoalAndProfileCandidates/{i}/wholeProposedProfile',r['wholeProposedProfile']))
for i,r in enumerate(d['records']):
 gid=r['goalId'];assert np[gid][1]['profile']==r['beforeWholeProfile']
 if r['beforeWholeProfile']!=r['afterWholeProfile']:
  assert gid not in overrides
  overrides[gid]=(r['afterWholeProfile'],ref(D5,f'/records/{i}/afterWholeProfile',r['afterWholeProfile']))
assert len(overrides)==8
profiles=[]
for gid in [x['id'] for x in c['goals'] if x['id'] in ordinary]:
 i,old=np[gid];prof,origin=overrides.get(gid,(old['profile'],{**pin(P442),'format':'jsonl','lineOneBased':i+1,'jsonPointer':'/profile','wholeObjectSHA256':objsha(old['profile'])}))
 profiles.append({'goalId':gid,'profile':copy.deepcopy(prof),'wholeProfileSHA256':objsha(prof),'source':origin,
    'baselineNativeRecord':{**pin(P442),'format':'jsonl','lineOneBased':i+1,'wholeObjectSHA256':objsha(old)},
    'currentOwnerLocator':sel[gid]['owner'],
    'baselineProfileBindingContext':{k:copy.deepcopy(sel[gid].get(k)) for k in ['profileSource','profileLocatorBase','baselineMaterialBindingPolicy','currentConfigPath','reviewId','namespaceOrdinal']},
    'profileBodyChanged':gid in overrides,'newGoal':False,
    'transportOnly':True,'noFingerprintRebindOrNativeApproval':True})
for gid,g,author,ptr,pr,pptr,scope in newrows:
 profiles.append({'goalId':gid,'profile':copy.deepcopy(pr),'wholeProfileSHA256':objsha(pr),'source':ref(author,pptr,pr),
   'baselineNativeRecord':None,'currentOwnerLocator':None,'baselineProfileBindingContext':None,'profileBodyChanged':True,'newGoal':True,'transportOnly':True,'noFingerprintRebindOrNativeApproval':True})
assert len(profiles)==447 and len({x['goalId'] for x in profiles})==447
PROFP=OUT/'P447.complete-selected-whole-profiles.INACTIVE.jsonl'
(ROOT/PROFP).write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in profiles))
ppin=pin(PROFP);pindex={r['goalId']:i for i,r in enumerate(profiles)}

def current_goal_ref(gid):
 i=next(i for i,g in enumerate(candidate['goals']) if g['id']==gid)
 return {**CPIN,'jsonPointer':f'/goals/{i}','wholeObjectSHA256':objsha(by[gid])}
def current_profile_ref(gid):
 i=pindex[gid]
 return {**ppin,'format':'jsonl','lineOneBased':i+1,'jsonPointer':'/profile','wholeObjectSHA256':objsha(profiles[i]['profile'])}

scope=read(Path(d['scopeRetentionPlan']['path']))
views={};viewpins={};originalviews={}
for vf in sorted((ROOT/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.view.json')):
 rel=vf.relative_to(ROOT);v=read(rel);vid=v['viewId'];assert vid not in views
 views[vid]=copy.deepcopy(v);originalviews[vid]=v;viewpins[vid]=pin(rel)
assert len(views)==41
planned=[];seen=set()
def add(vid,new,anchorptr,baselineanchor,basis,scopepin):
 assert (vid,new) not in seen;seen.add((vid,new))
 v=views[vid];original=originalviews[vid];assert at(original,anchorptr)==baselineanchor
 parentptr=anchorptr.rsplit('/',1)[0];parent=at(v,parentptr);assert isinstance(parent,list)
 node={'kind':'goalEntry','goalId':new,'projectionRole':'target'}
 parent.append(node);afterptr=parentptr+'/'+str(len(parent)-1)
 planned.append({'viewId':vid,'normalView':viewpins[vid],'scope':original['scope'],'newGoalId':new,
    'operation':{'op':'add','path':parentptr+'/-','value':node},'actualCandidateNodePointer':afterptr,
    'baselineAnchorPointer':anchorptr,'baselineAnchor':baselineanchor,'explicitRole':'target',
    'basis':basis,'authorScope':scopepin,'phaseOrRequiresInference':False,'officialWholeSourceCredit':False,
    'normalActivation':False,'independentScopeApprovalNotCreatedByTransport':True})
for r in scope['rows']:
 vid=r['viewId'];assert viewpins[vid]==r['currentViewPin']
 refs=r['currentReferences'];assert refs
 # Append in the existing referenced branch; no old node/index is shifted.
 anchor=sorted(refs,key=lambda x:(x['node']['kind']!='goalEntry',x['pointer']))[0]
 add(vid,r['separateDutyGoalId'],anchor['pointer'],anchor['node'],r['dutyScopeBasis'],pin(Path(d['scopeRetentionPlan']['path'])))

def find_anchor(v,gid):
 out=[]
 def walk(nodes,base):
  for i,n in enumerate(nodes):
   path=base+'/'+str(i)
   if n['kind']=='structure':walk(n['children'],path+'/children')
   elif n.get('goalId')==gid and n.get('projectionRole','target')=='target':out.append((path,n))
 walk(v['rootNodes'],'/rootNodes');assert out,(v['viewId'],gid)
 return sorted(out,key=lambda x:(x[1]['kind']!='goalEntry',x[0]))[0]
anchors={p['newWholeGoalAndProfileCandidates'][0]['goalId']:'684ffe86-3a9f-5514-866a-47d16372f2d4',p['newWholeGoalAndProfileCandidates'][1]['goalId']:'0278a515-8990-5a1c-8a1b-a03382a144a3',p['newWholeGoalAndProfileCandidates'][2]['goalId']:'02634fdd-c8ba-591a-b240-77129b1bebb8'}
for i,r in enumerate(p['newWholeGoalAndProfileCandidates']):
 for vid,v in originalviews.items():
  if v['scope'].get('jurisdiction')=='DE-HB' and v['scope'].get('courseProfile') in r['scope']['courses']:
   assert v['scope']['stage'] in ['CrossStage','SekII']
   ptr,node=find_anchor(v,anchors[r['goalId']])
   add(vid,r['goalId'],ptr,node,'Exact HB-only scope in sealed P author; no inference from phase or prerequisite',ref(P5,f'/newWholeGoalAndProfileCandidates/{i}/scope',r['scope']))
assert len(planned)==48
for gid in [r[0] for r in newrows]:
 count=sum(x['newGoalId']==gid for x in planned)
 assert count==(32 if gid==newrows[0][0] else 4)
views_payload=[]
for vid in sorted(views):
 views_payload.append({'viewId':vid,'normalPath':viewpins[vid]['path'],'before':viewpins[vid],'wholeCandidateView':views[vid],'wholeCandidateObjectSHA256':objsha(views[vid]),'wholeViewUnchanged':views[vid]==originalviews[vid]})
VPIN=write('VIEWS41.complete-five-new-target-proposals.INACTIVE.json',{'role':'Full inactive author view candidates, no AP or normal registration',**boundary,'rows':views_payload})
write('PLAN.exact-48-view-entry-additions-and-old-target-retention.json',{'role':'Exact authored additions only; no existing target removed',**boundary,'views':VPIN,'rows':planned,'counts':{'allViews':41,'changedViews':sum(v!=originalviews[k] for k,v in views.items()),'newExplicitTargetOccurrences':48,'bio':32,'societal':4,'PnewHBOnly':12},
  'noBYBioImport':True,'noHBGKSocietalTarget':True,'canonicalContainsBoundary':'No existing contains/root/weight field is changed in this technical C candidate. Five new atoms are explicit view references. Original optional parent-insertion proposals are archived below, not silently applied.',
  'archivedAuthorCanonicalParentInsertionOptions':scope['canonicalPlacementProposals'],'oldCoreReferenceRetention':'All old whole view nodes and inherited target/prerequisiteOnly roles are retained. Root must apply actual scope/source approvals and AP later; raw target parity is not final applicability approval.'})

# Combine exactly13+2 current whole-source proposals; no current peer judgment is read.
src=read(SRC);mapping=read(MAP);proposals={}
for i,r in enumerate(p['sourceUnionCandidates']):
 o=r['ordinal'];assert o not in proposals
 assert src['sourceGoals'][o-1]==r['wholeCurrentSourceGoal'];assert mapping['decisions'][o-1]==r['currentWholeDecision']
 proposals[o]={'ids':r['wholeProposedPartialCarrierUnion'],'author':ref(P5,f'/sourceUnionCandidates/{i}',r),'reason':r['reasonForCandidate']}
dsourcepath=Path(d['newCandidateGoals'][0]['sourceBindingProposal']['path']);dsource=read(dsourcepath)
overlaps=[]
for i,r in enumerate(dsource['rows']):
 o=r['ordinal'];overlaps.append(o) if o in proposals else None
 assert o not in proposals
 beforeids=mapping['decisions'][o-1]['canonicalGoalIds'];rep=r['replaceOnlyCarrier'];assert beforeids.count(rep['fromCanonicalGoalId'])==1
 afterids=[rep['toCandidateGoalId'] if x==rep['fromCanonicalGoalId'] else x for x in beforeids]
 proposals[o]={'ids':afterids,'author':ref(dsourcepath,f'/rows/{i}',r),'reason':'Exact one-carrier duty partition from sealed D5 author; preserve every other carrier, course/topic scope and partial relation.'}
assert len(proposals)==15 and overlaps==[]
source_rows=[];fifteen=[];flat=[]
for i,old in enumerate(mapping['decisions']):
 o=i+1;currentids=old['canonicalGoalIds'];selected=proposals.get(o);afterids=selected['ids'] if selected else currentids
 assert len(afterids)==len(set(afterids)) and all(g in by for g in afterids)
 row={'ordinal':o,'sourceGoalId':old['sourceGoalId'],'wholeSourceGoal':ref(SRC,f'/sourceGoals/{i}',src['sourceGoals'][i]),
   'baselineWholeDecision':ref(MAP,f'/decisions/{i}',old),'wholeCurrentCarrierIds':currentids,
   'wholeCandidateCarrierIds':afterids,'matchType':'partial','singleGoalMasteryCompletesWholeOfficialSource':False,
   'courseAndScopeExact':{'courseLevel':old['sourceCourseLevel'],'sourceScopeExact':old['sourceScopeExact']},
   'candidateBindings':[{'goalId':g,'wholeCandidateGoal':current_goal_ref(g),'wholeCandidateProfile':current_profile_ref(g)} for g in afterids],
   'authorProposal':selected['author'] if selected else None,
   'status':'PENDING_WHOLE_UNION_INDEPENDENT_REVIEW' if selected else 'BASELINE_NORMAL_UNION_MEMBERSHIP_RETAINED_NO_NEW_JUDGMENT',
   'newScientificJudgment':False,'normalActivation':False}
 source_rows.append(row)
 if selected:
  fifteen.append({**row,'wholeCurrentSourceGoal':src['sourceGoals'][i],'wholeCurrentDecision':old,'authorReason':selected['reason'],'membershipChanged':currentids!=afterids})
 flat += [{'sourceGoalId':old['sourceGoalId'],'canonicalGoalId':g,'matchType':'partial','proposedNotActivated':True} for g in afterids]
assert len(flat)==467
SPIN=write('SOURCE232.complete-current-unions-plus15-author-proposals.INACTIVE.json',{'role':'Full source-union transport; 15 proposals,217 retained baseline memberships, no new verdict',**boundary,'sourceExtraction':pin(SRC),'baselineMappingReview':pin(MAP),'rows':source_rows})
write('SOURCE15.whole-combined-13plus2-candidates-and-overlap-check.json',{'role':'Complete15 targeted author proposal rows, not acceptance',**boundary,'whole232':SPIN,'overlappingOrdinals':overlaps,'proposalOrdinals':sorted(proposals),'rows':fifteen,'flatCandidateEdges':flat,
  'counts':{'sourceGoals':232,'targetedWholeUnionProposals':15,'baselineUnselectedUnionMemberships':217,'candidatePartialEdges':len(flat),'baselinePartialEdges':len(mapping['mappings']),'membershipChangedUnions':sum(r['membershipChanged'] for r in fifteen)},
  'boundary':'All15 remain pending in this technical transport. Unselected217 baseline memberships are preserved, not scientifically re-reviewed against any new context. Actual source/P scopes and full operative materials remain at their sealed author refs; raw clause IDs never create GK/LK duties.'})

materials=write('MATERIAL.all-current-bindings-and-two-exact-author-routes.json',{'role':'No material rewrite; exact operative author routes remain binding',**boundary,
 'D5Routes':d['operativeMaterials'],'P5Routes':p['completeBilingualMaterials'],'P447':ppin,
 'boundary':'Unchanged normal profiles keep their actual current-owner material locators. Every successor and new profile comes with its exact author material route. Supplied fiction never counts as practical execution, independently acquired data, safety release or real learner performance.'})

changed_goals=[];unchanged_goals=[]
for gid,g in before.items():
 row={'goalId':gid,'normalWholeObjectSHA256':objsha(g),'candidateWholeObjectSHA256':objsha(by[gid])}
 if g==by[gid]:unchanged_goals.append(row)
 else:changed_goals.append({**row,'changedFields':changed(g,by[gid])})
assert len(changed_goals)==6 and len(unchanged_goals)==648
for gid in before:
 for f in ['requires','contains','tags','applicability']:
  assert before[gid].get(f)==by[gid].get(f),(gid,f)
for gid in before:
 if gid!=phid:assert before[gid].get('dimensionTags')==by[gid].get('dimensionTags')
for edge in ['requires','contains']:
 done=set();active=set()
 def visit(gid):
  if gid in done:return
  assert gid not in active,(edge,gid)
  active.add(gid)
  for target in by[gid].get(edge,[]):assert target in by,(gid,target);visit(target)
  active.remove(gid);done.add(gid)
 for gid in by:visit(gid)
assert len(by)==659
retained_profiles=[{'goalId':r['goalId'],'wholeProfileSHA256':r['wholeProfileSHA256']} for r in profiles if not r['profileBodyChanged']]
assert len(retained_profiles)==434
write('RETENTION.actual648-whole-goals-434-whole-profiles-and-all-old-edges.json',{'role':'Mechanical whole-object parity, not source or P acceptance',**boundary,
 'unchangedWholeGoals':unchanged_goals,'changedExistingWholeGoals':changed_goals,'unchangedWholeProfiles':retained_profiles,
 'changedExistingProfileGoalIds':sorted(overrides),'newGoalIds':[r[0] for r in newrows],
 'allOldRequiresContainsTagsApplicabilityExact':True,'oldDimensionsExactExceptOnePhase':True,'canonicalTopLevelMetadataExact':{k:v for k,v in candidate.items() if k!='goals'}=={k:v for k,v in c.items() if k!='goals'},
 'allExistingIDsAndOrderPreserved':True,'requiresDAG':True,'containsDAG':True,'danglingReferences':0,
 'classificationBoundary':'All existing654 kind decisions are retained, with only actual stock source-fingerprint changes in the subsequent SEM transport. Five new kinds are explicit author hypotheses, not reviewed/native schema decisions.'})
write('ASSEMBLY.inputs-and-exact-author-deltas.json',{'role':'Technical assembly manifest; no review or normal registration', 'atUTC':NOW,**boundary,'inputs':inputs,
 'canonical':CPIN,'profiles':ppin,'views':VPIN,'sourceUnions':SPIN,'materialRoutes':materials,
 'existingGoalPatches':gpatches,'newGoalMetadataArchive':str(OUT/'ARCHIVE.five-new-goals-exact-transient-author-metadata.json'),
 'profileOverrides':[{'goalId':gid,'source':x[1],'wholeProfileSHA256':objsha(x[0])} for gid,x in overrides.items()],
 'counts':{'candidateAllGoals':659,'ordinaryGoals':447,'memoryGoals':68,'changedExistingGoalBodies':6,'unchangedExistingWholeGoals':648,'existingProfileSuccessors':8,'unchangedWholeProfiles':434,'newProfiles':5,'allProfiles':447,'views':41,'newTargetOccurrences':48,'wholeSourceProposals':15},
 'rootEnglishTitleOverride':gpatches[0]['rootTransportOverride'],
 'noImplicitParentEdits':True,'noIndependentJudgmentsReadForThisTechnicalTask':True,
 'laterIntegration':'Root supplies actual paired science and scope acceptance, resolves new image/native review requirements, then can serialize native classifications and run AP/build. This inactive transport supplies no authorization to activate.'})
shutil.copyfile(Path(__file__),BASE/'assemble.technical-candidates.py')
print(json.dumps({'out':str(OUT),'C':CPIN,'P447':ppin,'views':VPIN,'source':SPIN,'changedGoals':len(changed_goals),'unchangedGoals':len(unchanged_goals),'newIds':[r[0] for r in newrows]},indent=2))
