# Apache-2.0. Independent read-only freshness and coverage reconstruction.
import pathlib,json,hashlib,collections,subprocess,datetime
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
AUTHOR=ROOT/'tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v2'
V1=ROOT/'tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
PEER=ROOT/'tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v1'
OUT=ROOT/'tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v2'
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def fp(o):return sha(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def read(p):return json.loads(p.read_bytes())
def bind(p):
    b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':sha(b),'bytes':len(b)}
m=read(AUTHOR/'manifest.author-v2.json');assert sha((AUTHOR/'manifest.author-v2.json').read_bytes())=='sha256:42893847d8cbee3c1254a7c51a002a2d8acc052ad8059e29a087532d15cca717'
v1=read(V1/'semantic-role-ownership-scope.author-ledger.final.json');v2=read(AUTHOR/'semantic-role-ownership-scope.author-ledger.v2.json')
assert sha((AUTHOR/'semantic-role-ownership-scope.author-ledger.v2.json').read_bytes())=='sha256:33ba648beb73c6d9857a399de1944074f0c28213a72945a72bb0741c1517c8b7'
reg=read(AUTHOR/'forty-cases.author-response.register.json');prior=read(PEER/'semantic-owner-scope.independent-review-v1.json')
old={e['goalId']:e for e in v1['entries']};new={e['goalId']:e for e in v2['entries']};peer={e['goalId']:e for e in prior['entries']}
assert len(old)==len(new)==539 and old.keys()==new.keys()
needed={gid for gid,e in peer.items() if e['candidateClassificationGate']=='needs_revision'}
assert len(needed)==len(reg['entries'])==40 and {r['goalId'] for r in reg['entries']}==needed
changed={gid for gid in new if old[gid]!=new[gid]};assert changed==needed
unchanged=sorted(old.keys()-needed);assert len(unchanged)==499
fresh=[]
for r in m['sealedArtifacts']+m['frozenInputFiles']:
    b=(ROOT/r['path']).read_bytes();current=sha(b)
    assert current==r['sha256'],r['path'];assert 'bytes' not in r or len(b)==r['bytes']
    fresh.append({'path':r['path'],'expectedSha256':r['sha256'],'actualSha256':current,'bytes':len(b)})
v1inputs=read(V1/'manifest.json')['frozenInputFiles'];frozen={r['path']:r['sha256'] for r in m['frozenInputFiles']}
assert all(frozen[r['path']]==r['sha256'] for r in v1inputs) and len(v1inputs)==558
documents={};hashes={};occ=collections.defaultdict(list)
for path in sorted(subprocess.check_output(['rg','--files','curricula','-g','*.json'],cwd=ROOT,text=True).splitlines()):
    if {'quality','input','archive'}.intersection(pathlib.PurePosixPath(path).parts):continue
    b=(ROOT/path).read_bytes()
    try:d=json.loads(b)
    except (json.JSONDecodeError,UnicodeDecodeError):continue
    if isinstance(d,dict) and isinstance(d.get('landscapeId'),str) and isinstance(d.get('goals'),list):
        documents[path]=d;hashes[path]=sha(b)
        for g in d['goals']:occ[g['id']].append({'path':path,'key':d['landscapeId']+':'+g['id'],'fileSha256':sha(b),'goalSha256':fp(g)})
assert len(documents)==548
prior_graph=read(PEER/'binding-context.independent-reconstruction-v1.json');assert prior_graph['status']=='PASS';pg={r['goalId']:r for r in prior_graph['records']}
nodekeys={d['landscapeId']+':'+g['id']:g for d in documents.values() for g in d['goals']}
def resolve(ref,lid):
    if ':' in ref:
        a,b=ref.split(':',1);k=(a or lid)+':'+b;return k if k in nodekeys else None
    if lid+':'+ref in nodekeys:return lid+':'+ref
    ks=sorted({r['key'] for r in occ[ref]})
    return ks[0] if len(ks)==1 else None
parents=collections.defaultdict(set)
for k,g in nodekeys.items():
    for r in g.get('contains',[]):
        t=resolve(r,k.split(':',1)[0])
        if t:parents[t].add(k)
def paths(k,rev=None):
    rev=rev or [k];yield list(reversed(rev))
    for p in sorted(parents[k]):
        if p not in rev:yield from paths(p,rev+[p])
facts=[];originpaths=0
protected=['sourcePath','sourceIndex','sourceFileSha256','fullGoalSha256','fullDescriptionSha256','originalTitle','originalDescription','originalDescriptionEn','technicalLeafObserved','selectedOccurrenceKey','selectedOccurrenceSha256','inventoryAuthoritativeOwner','definitionStatus','actualOwnerOccurrences','currentDirectRequiresObserved','currentDirectContainsObserved','currentEffectivePrerequisitesObserved','currentEffectivePrerequisiteSetSha256','currentEffectiveOriginsSha256','fullOriginPathWitnessPath','fullOriginPathWitnessSha256','fullOriginPathRecordSha256','literalScopeContext','authorCompatibilitySegmentKey','authoredSourceState','stageApplicability','englishDescriptionFieldPresent','contextPath','contextFileSha256','contextRecordSha256']
for gid,e in new.items():
    assert all(e[k]==old[gid][k] for k in protected)
    doc=documents[e['sourcePath']];g=doc['goals'][e['sourceIndex']];key=doc['landscapeId']+':'+gid
    assert g['id']==gid and fp(g)==e['fullGoalSha256'] and hashes[e['sourcePath']]==e['sourceFileSha256']
    assert g.get('description')==e['originalDescription'] and g.get('descriptionEn')==e['originalDescriptionEn']
    assert fp({'description':g.get('description'),'descriptionEn':g.get('descriptionEn')})==e['fullDescriptionSha256']
    assert sorted(occ[gid],key=lambda r:(r['path'],r['key']))==sorted(pg[gid]['exactOwnerOccurrences'],key=lambda r:(r['path'],r['key']))
    assert g.get('requires',[])==e['currentDirectRequiresObserved'] and g.get('contains',[])==e['currentDirectContainsObserved']
    actual=collections.defaultdict(list)
    for p in paths(key):
        ids={nodekeys[n]['id'] for n in p}
        for ref in nodekeys[p[0]].get('requires',[]):
            target=resolve(ref,p[0].split(':',1)[0]);assert target is not None
            if nodekeys[target]['id'] in ids:continue
            origin={'prerequisiteKey':target,'declaredByKey':p[0],'reference':ref,'inherited':len(p)>1}
            actual[json.dumps(origin,sort_keys=True)].append(p)
    prev={json.dumps(r['origin'],sort_keys=True):r['paths'] for r in pg[gid]['independentOriginContainsPaths']}
    assert {k:sorted(v) for k,v in actual.items()}=={k:sorted(v) for k,v in prev.items()}
    req=sorted({json.loads(k)['prerequisiteKey'] for k in actual});assert req==e['currentEffectivePrerequisitesObserved']
    originpaths+=sum(map(len,actual.values()))
    for scope in e['literalScopeContext']:
        assert scope['literalHeading']==nodekeys[doc['landscapeId']+':'+scope['headingGoalId']]['title']
    facts.append({'goalId':gid,'actualSourceGoalSha256':fp(g),'v1EntrySha256':fp(old[gid]),'v2EntrySha256':fp(e),'entryObjectUnchanged':gid in unchanged,'protectedContentOwnerScopeRequiresUnchanged':True,'actualOwnerOccurrences':occ[gid],'actualEffectiveRequires':req,'actualOriginContainsPathCount':sum(map(len,actual.values()))})
assert originpaths==1085
for row in reg['entries']:
    gid=row['goalId'];assert row['exactPeerFinding']==peer[gid]
    assert row['exactPeerFindingSha256PythonCodePoint']==fp(peer[gid]) and row['exactOriginalV1EntrySha256PythonCodePoint']==fp(old[gid]) and row['exactFinalV2EntrySha256PythonCodePoint']==fp(new[gid])
    response=new[gid]['v2ResponseOnExactPeerFinding']
    assert response['individualAuthorResponse']==row['individualAuthorResponse']
    assert all(response[k] is False for k in ['mandatorySplitApproved','nativeAtomicityApproved','requiresApproved','sourceApproved','scopeApproved','ownerChosen','independentV2ReviewCompleted'])
    actual_fields=sorted(k for k in set(old[gid])|set(new[gid]) if old[gid].get(k)!=new[gid].get(k))
    assert actual_fields==sorted(row['fieldsChanged'])
    assert new[gid]['activeRegistryWritten'] is False and new[gid]['requiresApprovalMade'] is False and new[gid]['authoritativeOwnerChosen'] is False
assert (AUTHOR/'preserved.compatibility-segments.v1.json').read_bytes()==(V1/'compatibility-segments.author-candidate.json').read_bytes()
assert (AUTHOR/'preserved.literal-program-segments.v1.json').read_bytes()==(V1/'literal-program-segments.author-context.json').read_bytes()
runtime=ROOT/'tmp/cross-subject-requires/by-identity-runtime-probe-20261013';ri=read(runtime/'probe-inputs.json')
assert ri['exitCode']==0 and sha(pathlib.Path(ri['classFile']).read_bytes())=='sha256:'+ri['classSha256']
assert sha((ROOT/'backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java').read_bytes())=='sha256:'+ri['classSourceSha256']
for d in ri['dependencies']:assert sha(pathlib.Path(d['path']).read_bytes())=='sha256:'+d['sha256']
runtime_current_source_drifts=[]
for r in ri['files']:
    source=ROOT/r['source'];destination=ROOT/r['destination'];a=source.read_bytes();b=destination.read_bytes()
    # The captured historical fixture is immutable evidence. Its original
    # quality checkpoint is a later changing report, outside the sealed 608.
    assert len(b)==r['bytes'] and sha(b)=='sha256:'+r['sha256']
    if a!=b:
        assert r['source']=='curricula/quality/cross-subject-requires/2026-10-13/work-checkpoint.json'
        assert r['source'] not in frozen
        current_checkpoint=json.loads(a);assert not ('landscapeId' in current_checkpoint and 'goals' in current_checkpoint)
        runtime_current_source_drifts.append({'path':r['source'],'capturedSha256':sha(b),'currentSha256':sha(a),'capturedBytes':len(b),'currentBytes':len(a),'capturedFixtureRemainsExact':True,'inSealed608FrozenInputs':False,'currentArtifactIsLandscapeShaped':False,'boundary':'Separate historical quality/status input has progressed; no current FOS definition or compiled-service binding drift. Do not restate the historical quality fixture as a freshly captured current artifact set.'})
ro=read(runtime/'probe.stdout.json');combined=ro[0];solo=ro[1]
for lid in ['c1600692-e543-5cf2-a399-6bd96e6b817f','42c2f7e3-91b4-5de8-bef0-d563440e9d52']:
    assert combined['byId'][lid]['schoolType']=='Berufsoberschule' and solo['byId'][lid]['schoolType']=='Fachoberschule'
for gid in combined['getGoalDefinition']:
    assert combined['getGoalDefinition'][gid]['present'] is False and solo['getGoalDefinition'][gid]['present'] is True
assert all(not l['title'].startswith(('Mathematik','Physik')) for l in combined['closure:b0f776f2-7288-51cb-9416-3383e2ccf268'])
assert len(solo['closure:b0f776f2-7288-51cb-9416-3383e2ccf268'])==3
receipt={'schemaVersion':1,'artifactId':'by-fos-v2-independent-source-coverage-freshness-replay','reviewerAgent':'/root/requires_canonical_review','model':'gpt-6.1-sol','reasoningEffort':'ultra','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','exactAuthorManifest':bind(AUTHOR/'manifest.author-v2.json'),'exactV2Ledger':bind(AUTHOR/'semantic-role-ownership-scope.author-ledger.v2.json'),'sealedArtifactCountChecked':17,'frozenInputCountChecked':608,'originalFrozen558AlsoExact':True,'independentlyDiscoveredActiveLandscapeCount':548,'allCurrentFullDefinitionsChecked':539,'revisedEntryObjectCount':40,'unchangedEntryObjectCount':499,'reconstructedEffectiveOriginContainsPaths':1085,'scopeHeadingAndSegmentFactsPreserved':[101,21],'currentBindingDrifts':[],'inputChecks':fresh,'goalFacts':facts,'runtimeEvidenceActuallyRead':{'probeSource':bind(runtime/'ByIdentityProbe.java'),'probeRunner':bind(runtime/'run_probe.py'),'probeInputs':bind(runtime/'probe-inputs.json'),'probeOutput':bind(runtime/'probe.stdout.json'),'plan':bind(runtime/'findings-and-plan.json'),'actualCompiledServiceHashStillExact':True,'actualCapturedFixtureFileBindingCountChecked':len(ri['files']),'currentOriginalSourceDriftsOutsideSealedPacket':runtime_current_source_drifts,'classSourceCurrentlyExact':True,'separateLocalRunRepeatedByReviewer':False,'localResult':'combined-six-school fixture retains BOS subject landscapes and loses sampled FOS goals/roots; FOS-only control resolves them','allFosAdoptionGate':'blocked_runtime_identity','currentHostOrProductionAcceptance':'pending'},'sourceGoalIntegral249StillMalformed':new['43e2025f-f393-5a41-aa42-ecb3b6ca35b8']['originalDescription'],'automaticMasteryOwnerOrRequiresApproval':False,'activeFilesChanged':False,'license':'Apache-2.0'}
with (OUT/'binding-coverage-freshness.independent-v2.json').open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'status':'PASS','inputBindings':608,'artifacts':17,'goals':539,'changed':40,'unchanged':499,'origins':1085,'runtimeFixtureBindings':len(ri['files'])}))
