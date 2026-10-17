# SPDX-License-Identifier: Apache-2.0
"""Compose already serialized disjoint source operations; retain scientific HOLDs."""
from pathlib import Path
from collections import defaultdict,Counter
import ast,copy,hashlib,json,shutil

R=Path.cwd();T=R/'tmp/chemie-m7-resumed-20261016/joint-normal-source-composition'
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O=E/'chemie-four-module-normal-source-exact-key-composition-technical-20261016-v1'
AUDIT=T/'AUDIT.actual-complete-module-deltas-and-all-exact-key-overlaps.json'
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(v):
 p=R/v['path'];assert pin(p)==v,v;return p
def put(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
KEYS={'sourceGoals':('id',),'passages':('id',),'decisions':('sourceGoalId',),'mappings':('legacyGoalId','canonicalGoalId')}
def keyed(v,keys):
 d={tuple(x.get(k) for k in keys):x for x in v};assert len(d)==len(v);return d

assert not O.exists();audit=read(AUDIT);by_alias=defaultdict(list)
for v in audit['modulePairs']:
 verify(v['baseline']);verify(v['candidate']);by_alias[v['alias']].append(v)
current={};delta_records=[];provenance={};summary_receipts=[]
for alias,pairs in sorted(by_alias.items()):
 before=read(verify(pairs[0]['baseline']));assert all(p['baseline']==pairs[0]['baseline'] for p in pairs)
 after=copy.deepcopy(before);author_bodies={p['module']:read(verify(p['candidate'])) for p in pairs}
 changes=defaultdict(list)
 for p in pairs:
  a=author_bodies[p['module']]
  for field in sorted(set(before)|set(a)):
   if before.get(field)==a.get(field):continue
   if field in KEYS:
    bmap=keyed(before.get(field,[]),KEYS[field]);amap=keyed(a.get(field,[]),KEYS[field])
    for key in list(bmap)+[k for k in amap if k not in bmap]:
     if bmap.get(key)!=amap.get(key):changes[(field,key)].append({'module':p['module'],'before':bmap.get(key),'after':amap.get(key)})
   else:changes[(field,None)].append({'module':p['module'],'before':before.get(field),'after':a.get(field)})
 for (field,key),ops in changes.items():
  b=ops[0]['before'];assert all(v['before']==b for v in ops)
  if all(v['after']==ops[0]['after'] for v in ops):a=ops[0]['after']
  elif field=='summary':
   # Only accepted independent counter deltas; never a whole-source approval.
   assert all(isinstance(x,dict) for x in [b]+[v['after'] for v in ops]);a=copy.deepcopy(b)
   for k in sorted(set(b)|{k for v in ops for k in v['after']}):
    if all(v['after'].get(k)==b.get(k) for v in ops):continue
    assert isinstance(b.get(k),int) and all(isinstance(v['after'].get(k),int) for v in ops)
    a[k]=b[k]+sum(v['after'][k]-b[k] for v in ops)
   summary_receipts.append({'alias':alias,'wholeHistoricalBefore':b,'exactModuleDeltas':ops,'wholeComposedHistoricalSummary':a,'meaning':'Independent explicitly serialized counter deltas only; original preexisting counter offsets are not reinterpreted as reviewed factual completeness.'})
  else:
   assert isinstance(b,dict) and all(isinstance(v['after'],dict) for v in ops),(alias,field,key)
   a=copy.deepcopy(b);seen={}
   for op in ops:
    for k in sorted(set(b)|set(op['after'])):
     if b.get(k)==op['after'].get(k):continue
     if field=='passages' and k=='sourceGoalIds':continue # rebuilt from final current SourceGoals below
     if k in seen:assert seen[k]==op['after'].get(k),(alias,field,key,k)
     seen[k]=op['after'].get(k)
     if k in op['after']:a[k]=copy.deepcopy(op['after'][k])
     else:a.pop(k,None)
  if key is None:
   if a is None:after.pop(field,None)
   else:after[field]=copy.deepcopy(a)
  else:
   keys=KEYS[field];arr=after.get(field,[]);existing=[i for i,x in enumerate(arr) if tuple(x.get(k) for k in keys)==key]
   assert len(existing)<=1
   if a is None:
    assert existing;del arr[existing[0]]
   elif existing:arr[existing[0]]=copy.deepcopy(a)
   else:arr.append(copy.deepcopy(a))
   after[field]=arr
  delta_records.append({'alias':alias,'field':field,'key':list(key) if key is not None else None,'modules':[v['module'] for v in ops],'moduleBeforeAfterWholeObjects':ops})
 if 'sourceGoals' in after:
  changed_passages={key[0] for field,key in changes if field=='passages'}
  for p in after['passages']:
   if p['id'] in changed_passages:p['sourceGoalIds']=[g['id'] for g in after['sourceGoals'] if g['passageId']==p['id']]
  gs=keyed(after['sourceGoals'],('id',));ps=keyed(after['passages'],('id',))
  assert all((g['passageId'],) in ps for g in after['sourceGoals'])
  assert all(p['sourceGoalIds']==[g['id'] for g in after['sourceGoals'] if g['passageId']==p['id']] for p in after['passages'] if p['id'] in changed_passages)
 current[alias]=after;provenance[alias]=pairs

# Complete pair/edge consistency is tested on actual composed bytes in memory.
pair_checks=[]
for alias,m in current.items():
 if 'sourceExtractionPath' not in m:continue
 e=current.get(m['sourceExtractionPath'])
 if e is None:e=read(R/m['sourceExtractionPath'])
 assert m['sourceLandscapeId']==e['sourceLandscapeId']
 ids={g['id'] for g in e['sourceGoals']};assert len(ids)==len(e['sourceGoals'])
 counts=Counter(x['sourceGoalId'] for x in m['decisions']);assert set(counts)==ids and set(counts.values())=={1}
 edges=defaultdict(set)
 assert len(m['mappings'])==len({(x['legacyGoalId'],x['canonicalGoalId']) for x in m['mappings']})
 for x in m['mappings']:assert x['legacyGoalId'] in ids;edges[x['legacyGoalId']].add(x['canonicalGoalId'])
 for x in m['decisions']:assert set(x['canonicalGoalIds'])==edges[x['sourceGoalId']]
 pair_checks.append({'normalMappingAlias':alias,'normalExtractionAlias':m['sourceExtractionPath'],'sourceGoalCount':len(ids),'oneDecisionPerCurrentSourceGoal':True,'completeLegacyDecisionTargetEquality':True})

O.mkdir(parents=True);aliases=[];merged=[]
for index,(alias,body) in enumerate(sorted(current.items()),1):
 pairs=provenance[alias];matching=[p for p in pairs if read(R/p['candidate']['path'])==body]
 if matching:physical=matching[0]['candidate'];newfile=False
 elif read(R/alias)==body:physical=pin(R/alias);newfile=False
 else:
  p=O/'composed'/(f'{index:02d}-'+Path(alias).name);put(p,body);physical=pin(p);newfile=True;merged.append(physical)
 aliases.append({'normalHostAlias':alias,'physicalRepositorySource':physical,'baseline':pairs[0]['baseline'],'moduleSources':pairs,'newComposedWholeFile':newfile})
put(O/'OPERATIONS.actual-exact-key-object-deltas.json',{'schemaVersion':1,'role':'Exact accepted-module serialization operations, not scientific acceptance','deltas':delta_records})
put(O/'MECHANICAL.summary-delta-and-HB-current-membership-composition.json',{'summaryCounterCompositions':summary_receipts,'HBPassageRule':'Apply Foundation whole corrected passage field deltas without discarding its literal/candidate distinctions. Rebuild only touched passage memberships from actual final SourceGoal array, retaining all unchanged Q23 neighbors and adding exactly the Acid new LK cell.','scientificSourceWordingNewlyAuthored':False})
put(O/'CHECKS.actual-eighteen-complete-pair-consistency.json',{'schemaVersion':1,'pairs':pair_checks,'allPassed':True,'sourceProjectionReady':False,'NormalPAMV':0,'Native':0,'Central':0})
put(O/'NEUTRAL.exact-normal-source-aliases-and-whole-pairs.json',{'schemaVersion':1,'role':'Composed current complete-source aliases, pending informed serialized review and explicit historical-partner dispositions','aliases':aliases,'newWholeComposedFileCount':len(merged),'completeNormalFileAliasCount':len(aliases),'completePairs':len(pair_checks),'scientificSourceUnionApproval':False,'remainingHOLDs':['Original informed Foundation32 serialized review and Alcohol7 serialized review pending.','Acid30 historical unlisted target dispositions remain open, including two unsupported-current330 inheritance edges.','Actual final sparse host, source Atlas and finalized current page-context checks have not run.'],'HumanApproval':False,'HumanTrial':False})
put(O/'OUTPUTS.finite-four-module-exact-source-composition.selector.json',{'schemaVersion':1,'role':'Technical exact-key composition only, no final scientific/current projection acceptance','neutralCompletePairs':pin(O/'NEUTRAL.exact-normal-source-aliases-and-whole-pairs.json'),'exactObjectOperations':pin(O/'OPERATIONS.actual-exact-key-object-deltas.json'),'explicitCollisionResolution':pin(O/'MECHANICAL.summary-delta-and-HB-current-membership-composition.json'),'actualCompletePairChecks':pin(O/'CHECKS.actual-eighteen-complete-pair-consistency.json'),'sourceProjectionReady':False,'newIndependentVotes':0,'actualHostsCreated':0,'NormalPAMV':0,'Atlas':0,'Native':0,'Central':0,'activeWrites':0,'GitWrites':0})
(O/'scripts').mkdir();shutil.copyfile(T/'compose_exact_sources.py',O/'scripts/compose_exact_sources.py')
put(O/'SEAL.finite-four-module-exact-source-composition.json',{'files':[pin(p) for p in sorted(O.rglob('*')) if p.is_file()],'noSelfHash':True})
print(json.dumps({'selector':pin(O/'OUTPUTS.finite-four-module-exact-source-composition.selector.json'),'normalAliases':len(aliases),'completePairs':len(pair_checks),'newWholeComposedFiles':len(merged),'bytes':sum(p.stat().st_size for p in O.rglob('*') if p.is_file()),'sourceProjectionReady':False},indent=2))
