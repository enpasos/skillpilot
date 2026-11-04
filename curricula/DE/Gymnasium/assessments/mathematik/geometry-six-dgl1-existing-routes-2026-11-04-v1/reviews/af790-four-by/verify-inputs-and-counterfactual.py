import json, gzip, hashlib, pathlib, math, unicodedata, re, collections
BASE=pathlib.Path('tmp/approach-review-20261101/math-geometry-six-dgl1-existing-route-integration-20261104-v1/af790-four-by-scopes-review-input-v1')
OUT=pathlib.Path('tmp/approach-review-20261101/astra-af790-four-by-independent-review-20261104-v1')
def read(p):return json.loads(p.read_text())
def digest(b):return hashlib.sha256(b).hexdigest()
def norm(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def nh(x):return digest(norm(x).encode())
def reach(edges, roots, mastered=()):
 out=set();todo=list(roots);mastered=set(mastered)
 while todo:
  v=todo.pop()
  if v in out:continue
  out.add(v)
  if v not in mastered:todo.extend(edges.get(v,()))
 return out
m=read(BASE/'review-input-manifest.json')
assert digest((BASE/'review-input-manifest.json').read_bytes())=='61a907c65343b5a81e548b37857e8043dbcdfa0d10f219fdfbe1c6b16ad50a76'
for x in m['files']:
 p=BASE/x['path'];assert len(p.read_bytes())==x['bytes'] and digest(p.read_bytes())==x['sha256'],x['path']
canon=read(BASE/'input/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json');goals={g['id']:g for g in canon['goals']}
af=read(BASE/'af790-whole-original-task-and-all-canonical-r.json');ROOT=af['rootId'];LOG='3c1d6ce7-099e-4267-9ff2-3d1526209a89';HALF='c19d1f8f-b297-5a58-b1d4-26d811e4aff4';EXP='27b63e2e-6a34-483e-8e5a-fe0f49670d1d'
edges={k:g.get('requires',[])+g.get('contains',[]) for k,g in goals.items()};closure=reach(edges,[ROOT]);assert closure=={g['id'] for g in af['wholeCanonicalGoalObjects']}
assert all(g==goals[g['id']] for g in af['wholeCanonicalGoalObjects'])
assert LOG in goals[HALF]['requires'] and HALF in goals[ROOT]['requires']
assert all(not a['requires'] for v in af['allContainsAncestorsForEachClosureGoal'].values() for a in v)
# Verify all ancestor objects against the complete canonical input rather than rely on summaries.
for v in af['allContainsAncestorsForEachClosureGoal'].values():
 for a in v:
  g=goals[a['goalId']];assert a['requires']==g.get('requires',[]) and a['contains']==g.get('contains',[]) and a['title']==g['title']
np=pathlib.Path('tmp/approach-review-20261101/geometry-four-projection-reuse-native-20261104-v1/candidate.json.gz')
assert digest(np.read_bytes())=='2017f30338bdc5efea5124241c937d9cb2b60d4fbded84b35ad83aed6491d4d2'
native=json.load(gzip.open(np,'rt'));ns={s['scope']:s for s in native['scopes']};old=read(BASE/'af790-all-84-actual-existing-protected-scope-contexts.json')['wholeOriginalScopeRows']
assert len(old)==84
oldreport=[]
for s in old:
 n=ns[s['scope']];assert s==n,s['scope']
 assert ROOT in s['selectedProtectedTargetGoalIds']
 assert len(s['visibleGoalPaths'][ROOT])==1
 assert set(s['effectiveDirectPrerequisitesByContextGoalId'][ROOT])==set(goals[ROOT]['requires'])
 nr=reach(s['effectiveDirectPrerequisitesByContextGoalId'],s['selectedProtectedTargetGoalIds'])
 assert nr==set(s['neededContextGoalIdsAtM0']),s['scope']
 rc=reach(s['effectiveDirectPrerequisitesByContextGoalId'],[ROOT]);assert rc==closure,s['scope']
 oldreport.append({'scope':s['scope'],'fullNativeRecordVerified':True,'targetCount':len(s['targetGoalIds']),'protectedRootCount':len(s['selectedProtectedTargetGoalIds']),'af790Path':s['visibleGoalPaths'][ROOT],'af790WholePreparationClosureSize':len(rc),'logReachable':LOG in rc,'existingUncoveredTargetCount':len(s['uncoveredTargetGoalIds'])})
rows=read(BASE/'four-whole-scope-records-and-real-preparation-membership.json')['rows'];counter=[]
for row in rows:
 s=row['wholeActualN4Scope'];c=row['wholeProvisionalIntendedG5Scope'];assert all(s[k]==v for k,v in ns[row['scope']].items()),row['scope']
 T=set(s['targetGoalIds']);C=set(s['contextGoalIds']);assert ROOT not in C
 nr=reach(s['effectiveDirectPrerequisitesByContextGoalId'],s['selectedProtectedTargetGoalIds']);assert nr==set(s['neededContextGoalIdsAtM0'])
 g5edges=c['wholeProposedEffectiveDirectPrerequisitesByContextGoalId'];g5roots=set(s['selectedProtectedTargetGoalIds'])|set(c['proposedNewProtectedGoalIds']);g5T=T|set(c['proposedAdditionalTargetGoalIds'])
 g5needed=reach(g5edges,g5roots);assert g5needed==set(c['proposedWholeM0DemandGoalIds'])
 assert g5T-g5needed==set(c['proposedUncoveredTargetGoalIds'])
 afteredges={**g5edges,**{k:edges[k] for k in closure-C}}
 afterroots=g5roots|{ROOT};afterT=g5T|{ROOT};afterneeded=reach(afteredges,afterroots)
 beforeHoles=g5T-g5needed;afterHoles=afterT-afterneeded
 afOnly=reach(afteredges,[ROOT]);assert afOnly==closure
 withAfMastery=reach(afteredges,afterroots,{ROOT})
 assert withAfMastery==g5needed|{ROOT},row['scope']
 withHalfMastery=reach(afteredges,[ROOT],{HALF})
 assert LOG not in withHalfMastery
 counter.append({'scope':row['scope'],'viewIds':s['compositionViewIds'],'baselineN4TargetCount':len(T),'provisionalG5TargetCount':len(g5T),'afterAf790TargetCount':len(afterT),'oldOrdinaryTargetsUnchanged':True,'newSelectedProtectedTargetIds':[ROOT],'newOrdinarySupportIds':sorted(closure-C-{ROOT}),'existingClosureSupportOutsideTargets':sorted((closure-T)&C),'wholeCanonicalPreparationClosureSize':len(closure),'wholeCanonicalPreparationHasHiddenProtectedSupport':False,'provisionalG5BeforeHoleCount':len(beforeHoles),'afterAf790HoleCount':len(afterHoles),'closedExistingTargetIds':sorted(beforeHoles-afterHoles),'newTargetHoles':sorted(afterHoles-beforeHoles),'newNeededContextIds':sorted(afterneeded-g5needed),'allOldProtectedRootsRetained':g5roots<=afterroots,'masteredAf790StopsOwnDemand':True,'masteredHalfLifeStopsRouteToLog':True,'hypotheticalOnlyNotNativeGeneration':True})
# Preserve authoritative A/M classifications; verify semantic fingerprints independently.
def txt(v):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(v or ''))).strip()
amp=[]
for name in ['semantic-atomicity','memory-card-review']:
 fn='original-registered-'+name+'-af790-r.raw.jsonl';rs=[json.loads(x) for x in (BASE/fn).read_text().splitlines()];verified=[]
 for r in rs:
  g=goals[r['goalId']];dt=g.get('dimensionTags',{});p={'ruleVersion':r['ruleVersion'],'goalId':g['id'],'shortKey':g.get('shortKey',''),'title':txt(g.get('title')),'titleEn':txt(g.get('titleEn')),'description':txt(g.get('description')),'descriptionEn':txt(g.get('descriptionEn')),'phase':txt(dt.get('phase')),'area':txt(dt.get('area')),'topicCode':txt(dt.get('topicCode')),'nodeKind':txt(g.get('nodeKind'))}
  fp='sha256:'+nh(p);assert fp==r['fingerprint'],(name,g['id'],fp,r['fingerprint'])
  verified.append({'goalId':g['id'],'fingerprint':fp,'status':r['status'],'rawRowSha256':digest(next(x for x in (BASE/fn).read_bytes().splitlines() if json.loads(x)['goalId']==g['id']))})
 assert set(x['goalId'] for x in rs)==closure-{ROOT,'65365dce-f33f-49d8-9516-42f75883aa86'}
 amp.append({'lane':name,'file':fn,'sha256':digest((BASE/fn).read_bytes()),'verifiedCount':len(rs),'statuses':dict(collections.Counter(x['status'] for x in rs)),'verifiedRows':verified})
mathcheck={'B0':1200,'B3':1200*.82**3,'thresholdHours':math.log(500/1200)/math.log(.82),'halfLifeHours':math.log(.5)/math.log(.82),'K5':2500*1.035**5}
g=goals[ROOT]
report={'status':'INDEPENDENT_INPUT_AND_COUNTERFACTUAL_CHECKS_PASS_NOT_NATIVE_ACCEPTANCE','reviewer':'astra_af790_scope_and_next_route_review','inputManifestSha256':digest((BASE/'review-input-manifest.json').read_bytes()),'inputFilesVerified':len(m['files']),'inputPins':12,'actualN4Sha256':digest(np.read_bytes()),'actualN4ScopeCount':len(ns),'wholeOriginalGoalNormalizedSha256':nh(g),'taskRawUtf8Sha256':digest(g['examData']['taskContent'].encode()),'solutionRawUtf8Sha256':digest(g['examData']['solutionContent'].encode()),'rubricNormalizedSha256':nh(g['examData']['scoring']),'allRequiresNormalizedSha256':nh(g['requires']),'coveredGoalIdsNormalizedSha256':nh(g['examData']['coveredGoalIds']),'unchangedWholePass':g['examData']['scoring'],'wholeClosureCount':len(closure),'uniqueContainsAncestorCount':len({a['goalId'] for v in af['allContainsAncestorsForEachClosureGoal'].values() for a in v}),'allAncestorRequiresEmpty':True,'mathematics':mathcheck,'existing84NativeContexts':oldreport,'fourIndependentCounterfactuals':counter,'currentOriginalAtomicityMemoryBindings':amp,'rootWrites':False,'gitWrites':False,'nativeRun':False,'stagePassClaim':False}
(OUT/'independent-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['existing84NativeContexts','currentOriginalAtomicityMemoryBindings']},ensure_ascii=False,indent=2))
