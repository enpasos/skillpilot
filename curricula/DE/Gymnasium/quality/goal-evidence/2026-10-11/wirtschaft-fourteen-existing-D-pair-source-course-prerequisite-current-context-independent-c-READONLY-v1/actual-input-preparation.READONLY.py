from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,collections
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
O=Q/'wirtschaft-fourteen-existing-D-pair-source-course-prerequisite-current-context-independent-c-READONLY-v1';O.mkdir(exist_ok=True)
I=Q/'wirtschaft-current346-D130-preserved-pairs-owner-page-context-readonly-c-v1/current130-IDs-original-two-round-pairs-and-current-binding-inventory.READONLY.json'
S=Q/'wirtschaft-current-D246-open100-whole-binding-package-scoping-READONLY-c-v1/actual-current100-six-disjoint-packages-and-current49-concrete-owner-context-inputs.READONLY.json'
NP=Q/'wirtschaft-current-D246-open100-whole-binding-package-scoping-READONLY-c-v1/actual-post-RootP2-original-native-current-open100-full-page-and-canonical-contexts.READONLY.json'
C=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';REG=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';B=R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
def load(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bind(p):p=Path(p);return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def put(p,x):
 p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():raise Exception('immutable collision')
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def diff(a,b,path=''):
 if isinstance(a,dict)and isinstance(b,dict):
  out=[]
  for k in sorted(a.keys()|b.keys()):out+=diff(a.get(k),b.get(k),path+'/'+k)
  return out
 if isinstance(a,list)and isinstance(b,list):
  if len(a)!=len(b):return [{'path':path,'before':a,'after':b}]
  return [d for i,(u,v)in enumerate(zip(a,b))for d in diff(u,v,path+'/'+str(i))]
 return []if a==b else[{'path':path,'before':a,'after':b}]
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip();start=datetime.now(timezone.utc).isoformat();cfg=load(B);PP=R/cfg['evidenceReviewPaths'][0];can={g['id']:g for g in load(C)['goals']};pcur={g['goalId']:g for g in map(json.loads,PP.read_text().splitlines())};pn=load(NP);pages={g['goalId']:g for g in pn['wholeCurrentOpenPages']};contexts={g['goalId']:g['context']for g in pn['wholeCurrentCanonicalContexts']};rows={g['goalId']:g for g in load(I)['goals']};scoperows=[r for r in load(S)['current100Rows']if r['packageClass']=='changed-canonical-source-course-prerequisite-context'];ids=[r['goalId']for r in scoperows];assert len(ids)==14
guards={b['path']:b for b in [bind(p)for p in [I,S,NP,C,REG,B,PP]]};cache={}
def tracked(p):
 p=Path(p);p=R/p if not p.is_absolute()else p;key=str(p.relative_to(R));guards[key]=bind(p)
 if key not in cache:cache[key]=load(p)
 return cache[key]
maps=[]
for mp in sorted((R/'curricula/DE/Gymnasium/mapping').rglob('*.review.json')):
 try:m=load(mp)
 except:continue
 sp=R/m.get('sourceExtractionPath','')
 if not sp.is_file():continue
 if not any(e.get('canonicalGoalId')in ids for e in m.get('mappings',[])):continue
 source=tracked(sp);tracked(mp);maps.append((mp,m,sp,source))
summary=[]
for gid in ids:
 r=rows[gid];selected_origin='inflight-candidate-context-stale' if r.get('inFlightOriginalPair') else 'registered-owner';pair=r['inFlightOriginalPair'] if r.get('inFlightOriginalPair') else r['registeredOwnerOriginalPair'];resolution=tracked(pair['resolution']['path']);rounds=[]
 for rnd in pair['existingIndependentRounds']:
  inp=tracked(rnd['reviewInput']['path']);g=next(v for v in inp['goals']if v['goalId']==gid);rp=R/rnd['actualResults']['path'];guards[str(rp.relative_to(R))]=bind(rp);line=next(l.rstrip(b'\r')for l in rp.read_bytes().split(b'\n')if l.strip()and json.loads(l)['goalId']==gid);assert 'sha256:'+hashlib.sha256(line).hexdigest()==rnd['actualRecordDigest'];rec=json.loads(line);run=tracked(rnd['runManifest']['path']);tracked(rnd['campaign']['path']);oldpage=g['reviewContext']['page'];oldp=g['reviewContext'].get('evidenceProfile')
  if oldp is None:oldp=oldpage.get('evidenceProfile')
  pdiff=None if oldp is None else diff(oldp['profile'],pcur[gid]['profile'])
  rounds.append({'round':rnd['round'],'wholeOriginalNativeGoalInput':g,'wholeOriginalScientificRecord':rec,'wholeOriginalRunManifest':run,'originalPhysicalBindings':rnd,'oldPWasAbsentAfterActualNestedPageLookup':oldp is None,'actualWholeOriginalPRecord':oldp,'DEENDiff':diff({k:g[k]for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},{'currentTitleDe':can[gid]['title'],'currentTitleEn':can[gid]['titleEn'],'currentDescriptionDe':can[gid]['description'],'currentDescriptionEn':can[gid]['descriptionEn']}),'actualCanonicalContextDiff':diff(g['canonicalContext'],contexts[gid]),'actualPProfilePayloadDiff':pdiff,'actualPageDiff':diff(oldpage,pages[gid])})
 neighbors={v['goalId']for f in ['requires','reverseRequires','externalPrerequisites','externalReverseRequires']for v in pages[gid].get(f,[])}
 for rr in rounds:
  oldp=rr['wholeOriginalNativeGoalInput']['reviewContext']['page'];neighbors|={v['goalId']for f in ['requires','reverseRequires','externalPrerequisites','externalReverseRequires']for v in oldp.get(f,[])}
 sourcecontexts=[]
 for mp,m,sp,src in maps:
  for e in m['mappings']:
   if e.get('canonicalGoalId')!=gid:continue
   atom=next((v for v in src.get('sourceGoals',[])if v.get('id')==e['legacyGoalId']),None);parent=next((v for v in src.get('passages',[])if atom and v.get('id')==atom.get('passageId')),None);d=[v for v in m.get('decisions',[])if v.get('sourceGoalId')==e['legacyGoalId']]
   sourcecontexts.append({'mappingBinding':bind(mp),'sourceBinding':bind(sp),'edge':e,'wholeCurrentSourceAtom':atom,'wholeCurrentSourceParent':parent,'wholeCurrentMappingDecisions':d,'currentPartialSourceOrSelectedScopeDoesNotGrantWholeNorm':True})
 whole={'goalId':gid,'title':can[gid]['title'],'scope':'EXISTING_VALID_DESCRIPTION_SCIENCE_CURRENT_BOUNDED_SOURCE_COURSE_PREREQUISITE_CONTEXT_QUALIFICATION','observedAtUtc':start,'beforeHEAD':head,'selectedOriginalPairOrigin':selected_origin,'selectedOriginalSciencePair':pair,'wholeOriginalResolvedSynthesis':resolution,'wholeOriginalBothRounds':rounds,'wholeActualCurrentGoal':can[gid],'wholeActualCurrentPositiveRecord':pcur[gid],'wholeActualCurrentNativePage':pages[gid],'wholeActualCurrentCanonicalContext':contexts[gid],'wholeCurrentNeighborGoals':[can[x]for x in sorted(neighbors)if x in can],'wholeActualCurrentDirectSourceContexts':sourcecontexts,'originalReviewsRetainedNotNewCurrentReviewRuns':True,'contextJudgement':None,'activeWrites':0}
 b=put(O/'whole14-inputs'/(gid+'.INPUT.READONLY.json'),whole)
 summary.append({'goalId':gid,'title':can[gid]['title'],'wholeInputsBinding':b,'sourceContextCount':len(sourcecontexts),'rounds':[{'round':x['round'],'DEENDiffCount':len(x['DEENDiff']),'canonicalDiff':x['actualCanonicalContextDiff'],'PNull':x['oldPWasAbsentAfterActualNestedPageLookup'],'PDeltaFields':None if x['actualPProfilePayloadDiff']is None else [d['path']for d in x['actualPProfilePayloadDiff']],'pageDiffFields':[d['path']for d in x['actualPageDiff']]}for x in rounds]})
end=[{'path':p,'beforeSHA256':b['sha256'],'endSHA256':sha(R/p),'exact':b['sha256']==sha(R/p)}for p,b in guards.items()];assert all(x['exact']for x in end);assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()==head
put(O/'actual14-original-pairs-current-whole-goal-profile-page-source-inputs-and-before-guards.READONLY.json',{'status':'ACTUAL_READONLY_INPUTS_PENDING_BOUNDED_CONTEXT_JUDGEMENT','observedAtUtc':start,'HEAD':head,'currentRegBinding':bind(REG),'currentBookConfigBinding':bind(B),'currentP346Binding':bind(PP),'currentCANBinding':bind(C),'goalIds':ids,'goals':summary,'physicalInputGuards':list(guards.values()),'initialPreparationEndguards':end,'oldActualReviewsAreNotNewReviews':True,'newDReviewRuns':0,'activeWrites':0,'strictClosures':0})
print(json.dumps({'output':str(O.relative_to(R)),'goals':summary,'guards':len(guards)},ensure_ascii=False))
