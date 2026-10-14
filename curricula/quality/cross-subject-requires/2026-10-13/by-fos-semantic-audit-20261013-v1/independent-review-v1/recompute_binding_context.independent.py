# Apache-2.0. Independent, read-only reconstruction; no verdict generation.
import json, pathlib, hashlib, subprocess, collections, datetime

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
AUTHOR = ROOT / 'tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
OUT = ROOT / 'tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v1'
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def canon(o): return json.dumps(o, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
def fp(o): return sha(canon(o))
def read(p): return json.loads((ROOT / p).read_bytes())
manifest = read(str(AUTHOR.relative_to(ROOT) / 'manifest.json'))
ledger = read(manifest['primaryLedgerPath'])
context = read(str(AUTHOR.relative_to(ROOT) / 'full-read-ownership-scope.context.exact.json'))
paths_artifact = read(str(AUTHOR.relative_to(ROOT) / 'current-effective-requires.full-origin-paths.json'))
errors = []
for row in manifest['sealedArtifacts'] + manifest['frozenInputFiles']:
    b = (ROOT / row['path']).read_bytes()
    if sha(b) != row['sha256'] or ('bytes' in row and len(b) != row['bytes']): errors.append(['binding',row['path']])
all_files = subprocess.check_output(['rg','--files','curricula','-g','*.json'], cwd=ROOT, text=True).splitlines()
documents = {}
for path in sorted(all_files):
    if {'quality','input','archive'}.intersection(pathlib.PurePosixPath(path).parts): continue
    try: d = read(path)
    except (json.JSONDecodeError,UnicodeDecodeError): continue
    if isinstance(d,dict) and isinstance(d.get('landscapeId'),str) and isinstance(d.get('goals'),list): documents[path] = d
nodes = {}; occurrences = collections.defaultdict(list); owners = collections.defaultdict(list)
for path,d in documents.items():
    for g in d['goals']:
        key = d['landscapeId'] + ':' + g['id']
        occurrences[g['id']].append({'path':path,'key':key,'fileSha256':sha((ROOT/path).read_bytes()),'goalSha256':fp(g)})
        if key not in nodes:
            nodes[key] = g; owners[g['id']].append(key)
def relationship(k):
    g=nodes[k]; return (tuple(sorted(set(g.get('requires',[])))),tuple(sorted(set(g.get('contains',[])))))
def resolve(ref,lid):
    if ':' in ref:
        a,b=ref.split(':',1); return (a or lid)+':'+b if (a or lid)+':'+b in nodes else None
    local=lid+':'+ref
    if local in nodes:return local
    ks=owners.get(ref,[])
    if len(ks)==1 or (ks and all(relationship(k)==relationship(ks[0]) for k in ks)):return ks[0]
    return None
parents=collections.defaultdict(set); contains={}; declarations={}
for k,g in nodes.items():
    lid=k.split(':',1)[0]; contains[k]=set(); declarations[k]=[]
    for r in g.get('contains',[]):
        t=resolve(r,lid)
        if t: contains[k].add(t);parents[t].add(k)
    for r in g.get('requires',[]):
        t=resolve(r,lid)
        if t:declarations[k].append((r,t))
def inheritance_paths(key):
    # Enumerates only contains ancestors, never follows requires.
    def walk(k,rev):
        yield list(reversed(rev))
        for p in sorted(parents[k]):
            if p not in rev:yield from walk(p,rev+[p])
    yield from walk(key,[key])
author_origins={r['goalId']:r for r in paths_artifact['records']}
author_contexts={r['goalId']:r for r in context['records']}
proof=[];path_count=0
for e in ledger['entries']:
    path=e['sourcePath'];d=documents[path];g=d['goals'][e['sourceIndex']];key=d['landscapeId']+':'+g['id']
    if g['id']!=e['goalId'] or fp(g)!=e['fullGoalSha256']:errors.append(['full_goal',e['goalId']])
    if fp({'description':g.get('description'), 'descriptionEn':g.get('descriptionEn')})!=e['fullDescriptionSha256']: errors.append(['description_pair',e['goalId']])
    observed = sorted((x['path'],x['key'],x['goalSha256']) for x in occurrences[g['id']])
    claimed = sorted((x['path'],x['key'],x['goalDefinitionSha256']) for x in e['actualOwnerOccurrences'])
    if observed!=claimed:errors.append(['owner_occurrences',g['id']])
    groups=collections.defaultdict(list); excluded=[]
    for p in inheritance_paths(key):
        ids={nodes[n]['id'] for n in p}
        for reference,target in declarations[p[0]]:
            # Native compatibility removes own stable ID at every step.
            if nodes[target]['id'] in ids:
                excluded.append({'declaration':p[0],'target':target,'containsPath':p});continue
            origin={'prerequisiteKey':target,'declaredByKey':p[0],'reference':reference,'inherited':len(p)>1}
            groups[json.dumps(origin,sort_keys=True)].append(p)
    reqs=sorted({json.loads(k)['prerequisiteKey'] for k in groups})
    actual_origins=author_origins[g['id']]
    claimed_groups={json.dumps(x['origin'],sort_keys=True):sorted(x['containsInheritancePaths']) for x in actual_origins['effectiveOriginContainsPaths']}
    if {k:sorted(v) for k,v in groups.items()}!=claimed_groups:errors.append(['origin_paths',g['id']])
    if reqs!=actual_origins['effectivePrerequisites'] or reqs!=e['currentEffectivePrerequisitesObserved']:errors.append(['effective_set',g['id']])
    direct=[r for r in g.get('requires',[])]; local_contains=list(g.get('contains',[]))
    if direct!=e['currentDirectRequiresObserved'] or local_contains!=e['currentDirectContainsObserved']:errors.append(['direct_relations',g['id']])
    for witness in actual_origins['effectiveOriginContainsPaths']:
        w=witness['directRequiresDeclarationWitness'];decl=w['declaredByKey']
        if w['reference'] not in nodes[decl].get('requires',[]) or resolve(w['reference'],decl.split(':',1)[0])!=w['prerequisiteKey']:errors.append(['declared_reference_witness',g['id']])
    path_count+=sum(len(v) for v in groups.values())
    proof.append({'goalId':g['id'],'selectedOccurrenceKey':key,'sourcePath':path,'sourceIndex':e['sourceIndex'],'actualGoalSha256':fp(g),'exactOwnerOccurrences':occurrences[g['id']],'globalEffectivePrerequisites':reqs,'independentOriginContainsPaths':[{'origin':json.loads(k),'paths':sorted(v)} for k,v in sorted(groups.items())],'selfExcludedAtInheritanceStep':excluded,'matchesAuthorContext':not any(x[1]==g['id'] for x in errors)})
for pn in paths_artifact['pathNodes']:
    for occ in pn['actualOccurrences']:
        d=documents[occ['path']];actual=next(g for g in d['goals'] if d['landscapeId']+':'+g['id']==pn['key'])
        if fp(actual)!=occ['fullGoalSha256'] or sha((ROOT/occ['path']).read_bytes())!=occ['fileSha256']:errors.append(['path_node',pn['key']])
receipt={'schemaVersion':1,'artifactId':'by-fos-independent-context-reconstruction-v1','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewerAgent':'/root/requires_canonical_review','reviewerRole':'INDEPENDENT_REVIEWER','model':'gpt-6.1-sol','reasoningEffort':'ultra','authorManifestSha256':sha((AUTHOR/'manifest.json').read_bytes()),'primaryAuthorLedgerSha256':sha((AUTHOR/'semantic-role-ownership-scope.author-ledger.final.json').read_bytes()),'independentDiscoveryMethod':'rg --files curricula; reject quality/input/archive path components; parse actual landscapeId+goals documents','activeDocumentCount':len(documents),'selectedGoalCount':len(proof),'independentlyReconstructedOriginPathCount':path_count,'authorSealedArtifactBindingsChecked':len(manifest['sealedArtifacts']),'frozenInputBindingsChecked':len(manifest['frozenInputFiles']),'selfExclusionAtEachContainsInheritanceStep':True,'requiresTransitiveMastery':False,'errors':errors,'status':'PASS' if not errors else 'FAIL','records':proof,'scientificApprovalMade':False,'activeFilesChanged':False,'license':'Apache-2.0'}
with (OUT/'binding-context.independent-reconstruction-v1.json').open('x') as f:json.dump(receipt,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({k:receipt[k] for k in ['status','activeDocumentCount','selectedGoalCount','independentlyReconstructedOriginPathCount','errors']},ensure_ascii=False))
