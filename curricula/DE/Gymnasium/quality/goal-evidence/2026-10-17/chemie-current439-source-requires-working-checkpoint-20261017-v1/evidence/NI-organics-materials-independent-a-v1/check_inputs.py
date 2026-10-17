import json,hashlib,copy
from pathlib import Path
O=Path('/mnt/e/skillpilot-chemie-L7-20261017/NI-organics-materials-independent-a-v1')
A=Path('/mnt/e/skillpilot-chemie-L7-20261017/NI-organics-materials-retained-target-scope-author-root-v1')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dig(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
selector=A/'SELECTOR.clean-current-paired-context-v2.json';inputp=A/'REVIEW-INPUT.clean-NI-package05-current-paired-cc5a-context-v2.json';casp=A/'CAS.whole14-NI-acquisition-goals-and-one-teacher-view.unapplied.json';seal=A/'SEAL.author-package05-current-paired-context-v2.json'
for p,h in [(selector,'e05eb2b3eaa1365ebb7a4b57de8c013c14f5801cc3aee691da3aad5fee94ac3c'),(inputp,'b4c5289c8e11ad442998c18baf0086947d80fd8eeee7f76fb687dc29ca498839'),(casp,'723f727077c65a16a7e41fb43b5a9808ffd3ef5fd03f443fd9de936f0d14eb5e'),(seal,'d5eb0b0833a588e483dbc3ba4a9750fa7e8509d926b75646670f1f6ae091e83d')]:assert pin(p)['sha256']==h
r=json.loads(inputp.read_text());cas=json.loads(casp.read_text());assert cas==r['wholeGuardedProposal'];cp=r['baseCanonical'];vp=r['baseWhole39Views'];p0=r['originalP439'];pn=r['latestPairedContextP439'];cn=r['latestPairedContextCanonical'];gs0=json.loads(Path(cp['path']).read_text());gs={g['id']:g for g in gs0['goals']};vs=json.loads(Path(vp['path']).read_text());vmap={v['viewId']:v for v in vs};pg={x['goalId']:x['profile'] for x in map(json.loads,Path(pn['path']).read_text().splitlines())};gsp={g['id']:g for g in json.loads(Path(cn['path']).read_text())['goals']};ps={x['goalId']:x['wholeProfile'] for x in r['wholeCurrentPositiveProfilesContentOnly']}
pins=[pin(x) for x in [selector,inputp,casp,seal]]
for k in ['baseCanonical','baseWhole39Views','originalP439','currentActualInventory','wholeCanonicalCandidate','whole39ViewsCandidate','originalNIPrimaryPDF','originalFullG6MaterialSource','originalV1ContentPreserved','latestPairedContextP439','latestPairedContextCanonical','actualAuthorHelperMeasurement']:
 assert pin(r[k]['path'])==r[k],k;pins.append(r[k])
for row in r['allSevenExistingDeckPins']+r['primarySourceVisualViews']:assert pin(row['path'])==row;pins.append(row)
assert len(gs)==650 and len(vs)==39 and len(ps)==74
assert all(pg[i]==p for i,p in ps.items())
changed=cas['canonicalWholeGoalChanges'];assert len(changed)==14
for x in changed:
 i=x['goalId'];assert x['before']==gs[i]==gsp[i];assert dig(x['before'])==x['beforeDigest'] and dig(x['after'])==x['afterDigest']
 b=copy.deepcopy(x['after']);ed=b['extendedData'];assert ed.pop('applicabilityOverrides')=={'jurisdiction':['DE-NI']};ext=ed.pop('skillPilotAcquisitionExtensions');assert b==x['before'];assert len(ext)==1 and ext[0]['officialWholeSourceCredit'] is False
 assert ext[0]['wholeRetainedPositiveProfileDigest']==dig(ps[i]);assert ext[0]['acquisitionScope']==x['before']['description'];assert ext[0]['viewIds']==(['de-ni-gym-chemistry-lk'] if i not in ['afa7dae7-9378-5687-aa8d-69a04afaa0d8','73cbd4d8-5da1-5e54-85ce-c88e7b1613fe'] else ['de-ni-gym-chemistry-gk','de-ni-gym-chemistry-lk'])
can2=json.loads(Path(r['wholeCanonicalCandidate']['path']).read_text());newgs={g['id']:g for g in can2['goals']};changeids={x['goalId'] for x in changed}
assert len(newgs)==650 and all(newgs[i]==(next(x['after'] for x in changed if x['goalId']==i) if i in changeids else g) for i,g in gs.items())
context={g['id']:g for g in r['wholeCurrentOrdinaryAndMemoryContextGoals']};assert len(context)==78 and all(gsp[i]==g for i,g in context.items());assert all(gs[i]==g for i,g in context.items() if not i.startswith('cc5a'))
ps0={x['goalId']:x['profile'] for x in map(json.loads,Path(p0['path']).read_text().splitlines())};assert [i for i,p in ps.items() if ps0[i]!=p]==['cc5a626a-dc85-57e2-b422-259f92901545']
for pref in ['9b56','95dc']:
 i=next(i for i in ps if i.startswith(pref));assert ps[i]==pg[i]==ps0[i]
vc=cas['wholeViewChanges'];assert len(vc)==1;x=vc[0];assert x['before']==vmap[x['viewId']];assert dig(x['before'])==x['beforeDigest'] and dig(x['after'])==x['afterDigest']
newvs=json.loads(Path(r['whole39ViewsCandidate']['path']).read_text());newvmap={v['viewId']:v for v in newvs};assert len(newvs)==39 and all(newvmap[i]==(x['after'] if i==x['viewId'] else v) for i,v in vmap.items())
def walk(ns):
 for n in ns:yield n;yield from walk(n.get('children',[]))
def project(v):
 found={}
 def sub(i,role,d,path=()):
  assert i not in path;found.setdefault(i,[]).append((-d,role))
  for child in gs[i].get('contains',[]):sub(child,role,d+1,path+(i,))
 for n in walk(v['rootNodes']):
  if n['kind']=='goalEntry':found.setdefault(n['goalId'],[]).append((1000000,n.get('projectionRole','target')))
  elif n['kind']=='canonicalSubtree':sub(n['goalId'],n.get('projectionRole','target'),0)
 return {i:('target' if any(a==max(x for x,y in rr) and b=='target' for a,b in rr) else 'prerequisiteOnly') for i,rr in found.items()}
roles={i:project(v) for i,v in vmap.items()};newroles={i:project(v) for i,v in newvmap.items()};newpairs=[]
for vid in vmap:
 assert all(newroles[vid][i]==ro for i,ro in roles[vid].items())
 newpairs += [{'viewId':vid,'goalId':i,'afterRole':ro} for i,ro in newroles[vid].items() if i not in roles[vid]]
assert newpairs==[{'viewId':'de-ni-gym-chemistry-lk','goalId':'ca216bc6-5205-5b46-abbd-fd5628e4ca5b','afterRole':'target'}]
b=copy.deepcopy(x['after']);stage=b['rootNodes'][0]['children'][1]['children'][11]['children'];added=stage.pop(4);assert added=={'kind':'goalEntry','goalId':'ca216bc6-5205-5b46-abbd-fd5628e4ca5b','projectionRole':'target'} and b==x['before']
origpairs=[{'goalId':x['goalId'],'viewId':vid} for x in r['wholeOriginalFifteenExcludedTargetRows'] for vid in x['viewIds']];assert len(origpairs)==17 and all(roles[x['viewId']][x['goalId']]==newroles[x['viewId']][x['goalId']]=='target' for x in origpairs)
def closure(ids):
 seen=set();todo=list(ids)
 while todo:
  i=todo.pop()
  if i in seen:continue
  seen.add(i);todo.extend(gs[i].get('requires',[]))
 return seen
closures=[]
for vid in ['de-ni-gym-chemistry-gk','de-ni-gym-chemistry-lk']:
 start=[x['goalId'] for x in r['wholeOriginalFifteenExcludedTargetRows'] if vid in x['viewIds'] and x['nodeKind']=='atomic'];cl=closure(start)
 missing=[i for i in cl if not gs[i].get('contains') and gs[i].get('semanticKind')!='orientation' and roles[vid].get(i)!='target'];after=[i for i in cl if not gs[i].get('contains') and gs[i].get('semanticKind')!='orientation' and newroles[vid].get(i)!='target']
 closures.append({'viewId':vid,'wholeDeclaredRequiresGoalIds':sorted(cl),'ordinaryNonTargetBefore':sorted(missing),'ordinaryNonTargetAfter':sorted(after),'isOnlyDeclaredGraphRoleCheck':True,'doesNotProveAllDeepConceptualPrerequisitesOrActualMastery':True})
 assert missing==([] if vid.endswith('gk') else ['ca216bc6-5205-5b46-abbd-fd5628e4ca5b']);assert after==[]
# Full actual deck selection, never infer selectors from selectedCardIds metadata.
cap=Path(cn['path']).parents[4];cfgp=cap/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';cfg=json.loads(cfgp.read_text());mp=cap/cfg['reviewPath'];crp=cap/cfg['cardReviewPath'];mrs=[json.loads(l) for l in mp.read_text().splitlines()];crs=[json.loads(l) for l in crp.read_text().splitlines()];pins.extend([pin(z) for z in [cfgp,mp,crp]])
exclude={'structure','root','module','lesson','vocabulary','grammar','practice','memorization','A1','A2','B1','B2','C1','C2'};memory=[]
for m in r['twoExistingRelevantMemoryGoals']:
 assert m==gs[m['id']]==newgs[m['id']];s=next(s for s in r['all67ExistingMemorySelections'] if s['goalId']==m['id']);deck=json.loads(Path(s['actualDeckPin']['path']).read_text());ft=[t for t in m['tags'] if t.startswith('select:')];ft=ft or [t for t in m['tags'] if not t.startswith('srs-deck') and t not in exclude];selected=[c for c in deck['cards'] if not ft or set(c.get('tags',[]))&set(ft)];assert ft==s['actualFilterTags'] and [c['id'] for c in selected]==s['selectedCardIds'] and len(selected)==1
 origins=sorted(mr['goalId'] for mr in mrs if mr['status']=='memory_required' and m['id'] in mr.get('memoryGoalIds',[]));cardrow=next(c for c in crs if c['cardId']==selected[0]['id']);assert cardrow['status']=='kept' and cardrow['necessary'] is True
 memory.append({'goalId':m['id'],'wholeExistingGoal':m,'actualSelectorTags':ft,'wholeSelectedCards':selected,'actualCurrentReviewedOriginGoalIds':origins,'actualKeptCardOriginGoalIds':cardrow['originGoalIds'],'unchangedRequires':m['requires'],'noAllOriginsRequirementIntroduced':True,'newMemoryOrCardVote':False})
assert memory[0]['actualCurrentReviewedOriginGoalIds']==['f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7'];assert len(memory[1]['actualCurrentReviewedOriginGoalIds'])==4
for s in r['all67ExistingMemorySelections']:
 m=gs[s['goalId']];deck=json.loads(Path(s['actualDeckPin']['path']).read_text());ft=[t for t in m['tags'] if t.startswith('select:')];ft=ft or [t for t in m['tags'] if not t.startswith('srs-deck') and t not in exclude];assert [c['id'] for c in deck['cards'] if not ft or set(c.get('tags',[]))&set(ft)]==s['selectedCardIds']
for z in ['app/scripts/applicabilityCompiler.ts','app/src/utils/srsTags.ts','app/src/components/srs/FlashcardDrill.tsx','AGENTS.md']:pins.append(pin(Path('/home/enpasos/projects/skillpilot')/z))
# Pin exact original-page readings, freshly extracted from the original primary binary.
pages=Path(O/'NI-original.whole.layout.txt').read_text().split('\f');sourcepages=[]
for row in r['wholeActualPrimaryPages']:
 n=row['physicalPDFPage'];assert row['literalWholeLayoutText'].strip()==pages[n-1].strip();p=O/('NI-physical-'+str(n)+'.actual.layout.txt');p.write_text(pages[n-1]);sourcepages.append({'physicalAndPrintedPage':n,'ownFreshExtraction':pin(p),'originalCleanLiteralMatches':True})
g6=json.loads(Path(r['originalFullG6MaterialSource']['path']).read_text());g6=g6['cases']
for c in r['wholeOriginalTwoG6Cases']:
 original=next(x for x in g6 if x['id']==c['id']);assert original==c;assert 'sha256:'+hashlib.sha256(c['fullCaseText'].encode()).hexdigest()==c['fullCaseTextSha256']
assert cas['positiveProfileWholeBodyChanges']==[]
result={'role':'own bounded input/role/material checks, not full compiler or science acceptance','inputPins':pins,'whole14CASAndCandidateExact':True,'wholePContext74ExactActualPairedBodies':True,'wholeGoalContext78ExactPairedCanonical':True,'originalC20ContextDiffOnlyPairedCc5a':True,'currentP9BodiesRetained':True,'oldRolesAcross39ViewsPreserved':True,'preservedActualTargetViewPairs':origpairs,'onlyNewTeacherTarget':newpairs,'declaredTeacherClosures':closures,'actualTwoMemoryRoutes':memory,'all67ActualCardSelectorsRecomputedUnchanged':True,'freshOriginalSourcePageComparisons':sourcepages,'newPBodyCardImageOrAtomChanges':0,'actualAfterCompilerObserved':False,'fullAPVNativeBuildInvocations':0,'currentE0G0NotUpgraded':[i for i,v in r['currentActualRecordEvidenceLevels'].items() if v['evidenceLevel']=='E0'],'normalMainOtherCapsuleMutation':False}
with (O/'CHECK.own-bounded-input-roles-sources-memory.json').open('x') as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'pins':len(pins),'goalCAS':14,'viewCAS':1,'retainedPairs':17,'newTeacherPairs':len(newpairs),'wholeCurrentPContexts':len(ps),'wholeCurrentGoalContexts':len(context),'actualMemoryOriginCounts':[len(m['actualCurrentReviewedOriginGoalIds']) for m in memory],'retainedE0G0':result['currentE0G0NotUpgraded'],'sourcePages':len(sourcepages),'noFullCompiler':True},ensure_ascii=False,indent=2))
