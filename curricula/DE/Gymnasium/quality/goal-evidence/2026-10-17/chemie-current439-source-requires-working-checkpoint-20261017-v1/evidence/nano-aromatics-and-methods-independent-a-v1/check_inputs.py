import json,hashlib,copy
from pathlib import Path
O=Path('/mnt/e/skillpilot-chemie-L7-20261017/nano-aromatics-and-methods-independent-a-v1');A=Path('/mnt/e/skillpilot-chemie-L7-20261017/nano-aromatics-and-methods-retained-target-scope-author-v1');ROOT=Path('/home/enpasos/projects/skillpilot')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dig(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(n,x):
 p=O/n
 with p.open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
 return p
sp=A/'SELECTOR.clean-content-for-two-other-reviewers.json';ip=A/'REVIEW-INPUT.clean-ten-whole-Nano-aromatic-methods-goals-Ps-primary-and25contexts.json';cp=A/'CAS.ten-whole-goals-two-derived-teachers-and-eight-own-scopes.inactive.json'
for p,h in [(sp,'a2b8d0085039fc03d917312c4ac3ffad613540d7ae9a1bb6b78d47f49dce3313'),(ip,'f9aeaf767fbbb6fe20e88ea23e01c78acd6c7a98ae39920c002890ed2baf0744'),(cp,'8a0ad4cf2c0e092ee2e9aaefe022ebe80890b52be864635b01c8308f89024403')]:assert pin(p)['sha256']==h
r=json.loads(ip.read_text());cas=json.loads(cp.read_text());assert cas==r['wholeGuardedCAS'] and cas['wholeObjects']==r['wholeTenBeforeAndProposedGoals'];pins=[pin(p) for p in [sp,ip,cp]]
for k in ['baseCanonical','base39Views','currentWholeP439','inventory']:
 assert pin(r[k]['path'])==r[k];pins.append(r[k])
base=json.loads(Path(r['baseCanonical']['path']).read_text());gs={g['id']:g for g in base['goals']};vs=json.loads(Path(r['base39Views']['path']).read_text());vmap={v['viewId']:v for v in vs};records={x['goalId']:x for x in map(json.loads,Path(r['currentWholeP439']['path']).read_text().splitlines())};profiles={i:x['profile'] for i,x in records.items()};ten=r['wholeTenGoalsAndProfiles'];assert len(gs)==650 and len(vs)==39 and len(records)==439 and len(ten)==10
changes=cas['wholeObjects'];ids={x['goalId'] for x in changes};teachers={x['goalId'] for x in r['derivedTeachers']};assert len(teachers)==2
news=copy.deepcopy(gs);direct=[];derived=[]
for x in changes:
 i=x['goalId'];assert x['before']==gs[i] and dig(x['before'])==x['beforeDigest'] and dig(x['after'])==x['afterDigest'];after=copy.deepcopy(x['after']);ed=after['extendedData'];ext=ed.pop('skillPilotAcquisitionExtensions');assert all(e['officialWholeSourceCredit'] is False for e in ext)
 if i in teachers:
  assert 'applicabilityOverrides' not in ed;derived.append(i)
 else:direct.append({'goalId':i,'jurisdictions':ed.pop('applicabilityOverrides')['jurisdiction']})
 assert after==x['before'];news[i]=x['after']
assert len(direct)==8 and sum(len(x['jurisdictions']) for x in direct)==14 and set(derived)==teachers
for x in ten:assert x['wholeGoal']==gs[x['goalId']] and x['wholeProfile']==profiles[x['goalId']]
assert ten==r['wholeTenUnchangedCurrentProfiles'];context={x['wholeGoal']['id']:x for x in r['wholeTransitiveGoalsAndProfiles']};assert len(context)==51
for i,x in context.items():
 assert x['wholeGoal']==gs[i]
 assert x.get('wholeProfile')==profiles.get(i)
# Compare current paired03/04 data already introduced as the exact base in the separate HB review; no author/peer verdict is read.
currentc=Path('/mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/candidate.canonical650.C20-plus-paired-package03-and04.private.json')
currentp=Path('/mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-paired-package03-and04-current650-technical-v1/P439.current.exact437-plus-paired-package03-and04.jsonl')
assert pin(currentc)['sha256']=='d9835ea71c19876bc0aa15319a1fce54eb02953d6268563f067cd57f5daeeb62' and pin(currentp)['sha256']=='8f8a2a870cca12e918838c8e4ee36f56421d0d024ab2c73f04bc07ad427e7437';pins += [pin(currentc),pin(currentp)]
currentgs={g['id']:g for g in json.loads(currentc.read_text())['goals']};currentps={x['goalId']:x['profile'] for x in map(json.loads,currentp.read_text().splitlines())};assert all(currentgs[i]==gs[i] and currentps.get(i)==profiles.get(i) for i in context)
def walk(ns,path=()):
 for n in ns:yield n,path;yield from walk(n.get('children',[]),path+(n.get('label',n.get('id','')),))
def project(v):
 found={}
 def sub(i,role,d,path=()):
  assert i not in path;found.setdefault(i,[]).append((-d,role))
  for c in gs[i].get('contains',[]):sub(c,role,d+1,path+(i,))
 for n,p in walk(v['rootNodes']):
  if n['kind']=='goalEntry':found.setdefault(n['goalId'],[]).append((1000000,n.get('projectionRole','target')))
  elif n['kind']=='canonicalSubtree':sub(n['goalId'],n.get('projectionRole','target'),0)
 return {i:('target' if any(d==max(d for d,r in rr) and r=='target' for d,r in rr) else 'prerequisiteOnly') for i,rr in found.items()}
roles={v['viewId']:project(v) for v in vs};tree_context=[]
assert len(r['wholeAffectedViews'])==14
for v in r['wholeAffectedViews']:
 assert v==vmap[v['viewId']];nodes=[{'wholeNodeWithoutChildren':{k:z for k,z in n.items() if k!='children'},'parentLabels':p} for n,p in walk(v['rootNodes'])];tree_context.append({'viewId':v['viewId'],'wholeViewDigest':dig(v),'scope':v['scope'],'wholeOrderedTreeWalk':nodes,'relevantWhole51GoalRoles':[{'goalId':i,'title':gs[i]['title'],'role':roles[v['viewId']].get(i,'absent')} for i in context]})
treep=write('READ.own-fourteen-whole-tree-walks-and51-context-roles.json',tree_context)
def closure(ids):
 seen=set();todo=list(ids)
 while todo:
  i=todo.pop()
  if i in seen:continue
  seen.add(i);todo.extend(gs[i].get('requires',[]))
 return seen
assert len(r['rows'])==25;pairchecks=[]
for row in r['rows']:
 i=row['goalId'];vid=row['viewId'];cl=closure([i]);assert roles[vid][i]==row['currentRole']=='target';reported={x['goalId']:x['role'] for x in row['requiresClosure']};assert set(reported)==cl
 assert all(roles[vid].get(q,'absent')==ro for q,ro in reported.items());assert all(roles[vid].get(q)=='target' for q in cl)
 pairchecks.append({'goalId':i,'viewId':vid,'scope':vmap[vid]['scope'],'existingTargetPreserved':True,'declaredRequiresClosureGoalIds':sorted(cl),'allDeclaredRequiresRolesTarget':True,'deeperSubjectPrerequisitesAndMasteryNotProved':True})
assert gs['dfbccd62-1203-5d1b-927d-65a4ca41bbad']['requires'][0]=='5e2eb826-6e60-5273-91d6-c23f6dfa33b1';assert gs['503dedcb-0efc-5e6b-bbc9-20761a0951f5']['requires']==['75e2eff1-f871-5461-9e3f-26d0b333ce2f'];assert all(gs[i]['requires']==news[i]['requires'] for i in ids)
# Real primary source and original material object matching, not merely supplied summaries.
for source in r['primarySourcesWithWholeRelevantPages']:
 for k in ['sourceExtractionPin','originalPDF']:
  assert pin(source[k]['path'])==source[k];pins.append(source[k])
 fresh=Path(O/(source['sourceLabel']+'.original.whole.layout.txt')).read_text().split('\f')
 for p in source['wholeRelevantPages']:assert fresh[p['physicalPageOneBased']-1].strip()==p['layoutText'].strip()
materials=[];known_sources={}
def seek(obj,target):
 if isinstance(obj,dict):
  if obj==target:return True
  return any(seek(v,target) for v in obj.values() if isinstance(v,(dict,list)))
 if isinstance(obj,list):return any(seek(v,target) for v in obj)
 return False
for c in r['wholeCurrentCaseMaterialSelections']:
 i=c['goalId'];actual=next(z for z in profiles[i]['applicationCaseBriefs'] if z['id']==c['caseId']);assert actual==c['wholeCurrentCaseBrief']
 for source in c['originalWholeMaterialSources']:
  p=source['pin'];assert pin(p['path'])==p
  if p['path'] not in known_sources:known_sources[p['path']]=json.loads(Path(p['path']).read_text());pins.append(p)
  assert seek(known_sources[p['path']],source['wholeOriginalCase']);materials.append({'goalId':i,'caseId':c['caseId'],'originalWholeCaseDigest':dig(source['wholeOriginalCase']),'sourcePin':p})
kit=r['wholePrintableOriginalModelKit'];assert pin(kit['pin']['path'])==kit['pin'] and Path(kit['pin']['path']).read_text()==kit['wholeText'];pins.append(kit['pin'])
six=next(c['explicitCurrentSixRuleTests'] for c in r['wholeCurrentCaseMaterialSelections'] if c.get('explicitCurrentSixRuleTests'));assert six['pairs']==[['+','-'],['+','+'],['-','-'],['-','+'],['+','0'],['-','0']]
computed=['undetermined' if '0' in x else 'attraction' if x[0]!=x[1] else 'repulsion' for x in six['pairs']];assert computed==six['expected']
# Current real memory records and actual filter code semantics.
cap=Path(r['currentWholeP439']['path'])
while cap.name!='capsule':cap=cap.parent
cfgp=cap/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';cfg=json.loads(cfgp.read_text());mp=cap/cfg['reviewPath'];crp=cap/cfg['cardReviewPath'];mr={x['goalId']:x for x in map(json.loads,mp.read_text().splitlines())};cr=list(map(json.loads,crp.read_text().splitlines()));pins += [pin(p) for p in [cfgp,mp,crp]]
ex={'structure','root','module','lesson','vocabulary','grammar','practice','memorization','A1','A2','B1','B2','C1','C2'};decks={}
for row in r['wholeSevenDecks']:
 assert pin(row['pin']['path'])==row['pin'] and json.loads(Path(row['pin']['path']).read_text())==row['wholeDeck'];pins.append(row['pin']);decks[row['wholeDeck']['deckId']]=row['wholeDeck']
selections=[]
for x in r['all67MemorySelections']:
 i=x['goalId'];g=gs[i];assert g==x['wholeMemoryGoal'];ts=g['tags'];ft=[t for t in ts if t.startswith('select:')];ft=ft or [t for t in ts if not t.startswith('srs-deck') and t not in ex];did=next(t.split(':',1)[1] for t in ts if t.startswith('srs-deck:'));deck=decks[did];cards=[c['id'] for c in deck['cards'] if not ft or set(ft)&set(c.get('tags',[]))];assert ft==x['filterTags'] and cards==x['cardIds']
 assert all(roles[z['viewId']].get(i,'absent')==z['role'] for z in x['roles']);selections.append({'goalId':i,'deckId':did,'actualFilterTags':ft,'actualCardIds':cards,'unchanged':True})
assert len(selections)==67
memory10=[{'goalId':i,'existingStatus':mr[i]['status'],'existingMemoryGoalIds':mr[i].get('memoryGoalIds',[]),'existingDeckIds':mr[i].get('deckIds',[])} for i in sorted(ids)]
assert sum(x['existingStatus']=='memory_required' for x in memory10)==1
core=next(c for d in decks.values() for c in d['cards'] if c['id']=='chem_bond_003');coreledger=next(x for x in cr if x['cardId']==core['id']);assert coreledger['originGoalIds']==['23533087-89ea-5f29-8ec1-9f2e01197bb6'] and coreledger['status']=='kept' and coreledger['necessary']
visible_memory=[]
for vid in ['de-bb-gym-chemistry-lk','de-be-gym-chemistry-lk']:
 mid='e16c2a63-fc78-5dd4-86d8-143647167717';sel=next(x for x in selections if x['goalId']==mid);assert roles[vid][mid]=='target' and core['id'] in sel['actualCardIds'];assert all(roles[vid].get(i)=='target' for i in gs[mid]['requires']);visible_memory.append({'viewId':vid,'unchangedVisibleMemoryGoalId':mid,'actualCoreCardId':core['id'],'actualRequiresAllTarget':True})
for p in ['app/scripts/applicabilityCompiler.ts','app/src/utils/srsTags.ts','app/src/components/srs/FlashcardDrill.tsx','AGENTS.md']:pins.append(pin(ROOT/p))
result={'role':'OWN BOUNDED OBJECT, MATERIAL, PRIMARY, ROLE AND MEMORY CHECKS; not full compiler or native science approval','inputPins':pins,'wholeTenCASObjectsExact':True,'wholeTenCurrentPExactAndUnchanged':True,'whole51ContextGoalsAndProfilesExactAlsoAgainstActualPaired03_04':True,'ordinaryAfterScopeInputs':direct,'twoDerivedTeachersNoOwnOverride':derived,'existing25TargetViewPairChecks':pairchecks,'whole14ViewTraversal':pin(treep),'whole39ViewsUnmodified':True,'allOldTargetSupportMemoryRolesPreserved':True,'all67ActualMemorySelectorsRecomputed':selections,'tenCurrentMemorySuitabilityInputsNoNewVotes':memory10,'actualUnchangedCoreMemoryCard':core,'actualCoreCardOriginIds':coreledger['originGoalIds'],'existingBEBBMemoryRoutes':visible_memory,'wholeOriginalCaseMaterialMatches':materials,'newSixCaseMaterialEnumeration':{'given':six,'independentRuleResults':computed,'currentAnalogueORDigitalPUnchanged':True,'noActualLearnerRuleExecution':True},'currentEvidenceLevelsNoUpgrade':[{'goalId':i,**{k:records[i].get(k) for k in ['evidenceLevel','maximumClaimScope','status','reviewAuthority']}} for i in sorted(ids)],'actualAfterCompilerObserved':False,'fullAPVNativeBuild':False,'normalMainL6L7OtherCapsulesMutated':False}
q=write('CHECK.own-ten-whole-goals25-roles67-selectors-current-materials.json',result);print(json.dumps({'check':pin(q),'inputPins':len(pins),'pairs':25,'contexts':len(context),'materialOriginalCases':len(materials),'selectors':len(selections),'memoryRequiredAmongTen':[x['goalId'] for x in memory10 if x['existingStatus']=='memory_required'],'directCarriers':len(direct),'derivedTeachers':len(derived),'sixRuleResults':computed},indent=2))
