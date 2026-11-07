#!/usr/bin/env python3
"""Read active repository bytes; write only this finite PoWi inventory folder.
No native Source-A producer/probe, DB access, candidate tree or active write.
"""
import collections, copy, gzip, hashlib, importlib.util, json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
OWNER = '51b60137-46e8-5498-973e-ea38bb32f327'
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json'
EXPECTED = 'dc148f0be7b3156c2014ca1b23137273ce62b9bd44b34ffb28ff43957c224896'
sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location('identity_kernel', ROOT/'scripts/canonical_goal_identity_migration.py')
k = importlib.util.module_from_spec(spec); spec.loader.exec_module(k)
def raw(path): return (ROOT/path).read_bytes()
def sha(value): return hashlib.sha256(value).hexdigest()
def write(name, value):
    data=(json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode()
    if name in ('definitions-and-bijection.json','active-reference-pointers.json','graph-invalid-references.json','catalog-pins.json'):
        (OUT/(name+'.gz')).write_bytes(gzip.compress(data,mtime=0))
    else: (OUT/name).write_bytes(data)
assert sha(raw(SOURCE)) == EXPECTED
source = k.parse_json(raw(SOURCE))
bad = {g['id']: (i,g) for i,g in enumerate(source['goals']) if not k.UUID_PATTERN.fullmatch(g['id'])}
assert len(bad) == 157
matcher = re.compile('|'.join(map(re.escape, sorted(bad,key=len,reverse=True))))
paths = subprocess.check_output(['rg','--files','curricula','-g','*.json','-g','!**/quality/**','-g','!**/visualizations/**'],cwd=ROOT,text=True).splitlines()
catalog = {}; parsed = {}; files = []
for path in paths:
    try: doc = k.parse_json(raw(path))
    except (ValueError,UnicodeDecodeError): continue
    if isinstance(doc,dict) and isinstance(doc.get('landscapeId'),str) and isinstance(doc.get('goals'),list):
        catalog[path] = doc; files.append({'path':path,'sha256':sha(raw(path)),'landscapeId':doc['landscapeId'],'goalCount':len(doc['goals'])})
    if matcher.search(raw(path).decode('utf8')): parsed[path] = doc
owners,keys = k.identity_index(catalog)
rules = [r for r in k.build_bijection(catalog) if r['landscapeId']==OWNER]
assert {r['sourceGoalId'] for r in rules} == set(bad)
prior=json.loads(raw('docs/dev/ci-graph-repairs/canonical-goal-id-format-2026-11-06.proposal.json'))
oldtargets={r['sourceGoalId']:r['targetGoalId'] for r in prior['rules'] if r['landscapeId']==OWNER}
assert all(oldtargets[r['sourceGoalId']]==r['targetGoalId'] for r in rules)
renamed={(OWNER,r['sourceGoalId']):r['targetGoalId'] for r in rules}
registry=k.parse_json(raw(k.REGISTRY_PATH))
documents=[]; refs=[]; blockers=[]; preserved=[]
for path,doc in sorted(parsed.items()):
    kind,_=k.document_class(path,path in catalog)
    if kind:
        candidate,fields,keep,errors,inverse=k.transform_document(doc,kind,registry,renamed,owners,keys,matcher)
        documents.append({'path':path,'sha256':sha(raw(path)),'class':kind,'fieldCount':len(fields),'inverseEqual':inverse==k.digest(k.stable(doc)),'candidateCanonicalSha256':k.digest(k.stable(candidate)),'preservedFieldCount':len(keep),'blockerCount':len(errors)})
        refs.extend(dict(path=path,**field) for field in fields)
        preserved.extend(dict(path=path,**field) for field in keep)
        blockers.extend(dict(path=path,**field) for field in errors)
    else:
        hits=[{'pointer':p,'isKey':iskey,'value':v,'ids':sorted(set(matcher.findall(v)))} for p,v,iskey in k.string_fields(doc) if matcher.search(v)]
        documents.append({'path':path,'sha256':sha(raw(path)),'class':'unclassified-nonquality-json','fieldCount':0,'occurrenceCount':len(hits)})
        preserved.extend(dict(path=path,**hit) for hit in hits)
# Flat currently consumed QA inputs, not their historical evidence trees.
quality=[]
for path in sorted((ROOT/'curricula/DE/Gymnasium/quality').glob('*/*')):
    if not path.is_file() or path.suffix not in ('.json','.jsonl'): continue
    data=path.read_bytes()
    if not matcher.search(data.decode('utf8')): continue
    relative=str(path.relative_to(ROOT)); rows=[k.parse_json(line) for line in data.splitlines() if line.strip()] if path.suffix=='.jsonl' else [k.parse_json(data)]
    hits=[]
    for index,row in enumerate(rows):
        for pointer,value,iskey in k.string_fields(row):
            if matcher.search(value): hits.append({'line':index+1 if path.suffix=='.jsonl' else None,'pointer':pointer,'isKey':iskey,'value':value,'ids':sorted(set(matcher.findall(value)))})
    quality.append({'path':relative,'sha256':sha(data),'rowCount':len(rows),'occurrenceCount':len(hits),'hits':hits,'handling':'preserve-original-bytes; reviewed typed QA identity projection required'})
# Current public deck copies and source decks have stable card identities/URLs.
decks=[]
for base in ['curricula/DE/Gymnasium/memory-decks','app/public/data','backend/src/main/resources/static/data']:
    for path in sorted((ROOT/base).glob('*politics_economics*.json')):
        doc=k.parse_json(path.read_bytes()); hits=[{'pointer':p,'value':v,'ids':sorted(set(matcher.findall(v)))} for p,v,is_key in k.string_fields(doc) if matcher.search(v)]
        decks.append({'path':str(path.relative_to(ROOT)),'sha256':sha(path.read_bytes()),'bytes':path.stat().st_size,'hits':hits})
family=lambda index: 'memory-6' if index<7 else 'BY-PuG11-52' if index<364 else 'BY-PuG12-55' if index<419 else 'BY-PuG13-44'
rule_by={r['sourceGoalId']:r for r in rules}
definitions=[]
for goal_id,(index,goal) in bad.items():
    inbound=[{'path':f['path'],'pointer':f['pointer'],'role':f['role'],'qualified':':' in f['before']} for f in refs if f['before'].split(':')[-1]==goal_id]
    outgoing=[]
    for pointer,value,is_key in k.string_fields(goal):
        if is_key: continue
        if any(k.pointer_matches(rule['pointer'],'/goals/'+str(index)+pointer) for rule in registry['activeFields'] if rule['class']=='runtime-graph' and rule['role']=='reference'):
            target=k.resolve_reference(value,OWNER,owners,keys)
            outgoing.append({'pointer':pointer,'value':value,'resolvedOwner':target[0],'resolvedGoalId':target[1],'targetAlsoMalformed':target[1] in bad})
    definitions.append({'sourceGoalId':goal_id,'targetGoalId':rule_by[goal_id]['targetGoalId'],'sourcePointer':'/goals/'+str(index),'beforeFullDefinitionSha256':k.digest(k.stable(goal)),'title':goal['title'],'family':family(index),'isAtomic':not goal.get('contains'),'fullDefinition':goal,'inboundActiveReferences':inbound,'outgoingTypedReferences':outgoing})
# All actual authored graph findings with bad endpoints; source graph plus foreign roots.
graphrefs=[]
for path,doc in catalog.items():
    for index,goal in enumerate(doc['goals']):
        for relation in ('contains','requires'):
            for offset,value in enumerate(goal.get(relation,[])):
                if value.split(':')[-1] in bad:
                    resolved=k.resolve_reference(value,doc['landscapeId'],owners,keys)
                    graphrefs.append({'path':path,'sourceOwner':doc['landscapeId'],'sourceGoalId':goal['id'],'pointer':f'/goals/{index}/{relation}/{offset}','raw':value,'resolvedOwner':resolved[0],'resolvedGoalId':resolved[1]})
# Kernel negatives are real calls to the existing resolver, never a Source-A replay.
negative={}
def reject(label,fn):
    try: fn()
    except k.ContractError as error: negative[label]={'rejected':True,'message':str(error)}
    else: raise AssertionError(label+' unexpectedly accepted')
sample=next(iter(bad)); foreign='deadbeef-dead-4bee-8fed-0123456789ab'
reject('wrong-qualified-owner',lambda:k.resolve_reference(foreign+':'+sample,OWNER,owners,keys))
reject('unknown-unqualified-id',lambda:k.resolve_reference('powi_not_an_authored_goal',OWNER,owners,keys))
duplicate_owners={key:set(value) for key,value in owners.items()}; duplicate_owners[sample].add(foreign)
duplicate_keys=set(keys)|{(foreign,sample)}
reject('ambiguous-ownerless-reference',lambda:k.resolve_reference(sample,None,duplicate_owners,duplicate_keys))
collision=copy.deepcopy(catalog)
collision[SOURCE]['goals'].append({'id':rules[0]['targetGoalId'].upper()})
reject('casefold-target-collision',lambda:k.build_bijection(collision))
duplicate=copy.deepcopy(catalog);duplicate[SOURCE]['goals'].append(copy.deepcopy(bad[sample][1]))
reject('duplicate-source-definition',lambda:k.build_bijection(duplicate))
summary={'source':{'path':SOURCE,'sha256':EXPECTED,'owner':OWNER},'runtimeCatalogFiles':len(catalog),'runtimeSerializedGoals':sum(len(d['goals']) for d in catalog.values()),'uniqueMalformedGoals':len(bad),'families':dict(collections.Counter(d['family'] for d in definitions)),'graphReferenceCountAllCatalog':len(graphrefs),'graphReferencesByRelation':dict(collections.Counter(r['pointer'].split('/')[-2] for r in graphrefs)),'uniqueGraphReferenceEndpoints':len({r['resolvedGoalId'] for r in graphrefs}),'graphUnresolvedCount':0,'activeFieldCount':len(refs),'activeDocuments':sum(d['fieldCount']>0 for d in documents),'activeFieldsByClass':dict(collections.Counter(next(d['class'] for d in documents if d['path']==f['path']) for f in refs)),'activeProjectionBlockers':blockers,'currentQualityInputs':len(quality),'qualityOccurrences':sum(q['occurrenceCount'] for q in quality),'deckFiles':len(decks),'deckOccurrences':sum(len(d['hits']) for d in decks),'rulesRetainPriorUuidDerivation':True,'currentGlobalTargetCollisions':0,'negativeControls':negative,'runtimeApplied':False,'qaApprovalClaimed':False,'sourceAProbeExecuted':False}
write('summary.json',summary);write('definitions-and-bijection.json',definitions);write('active-reference-pointers.json',refs);write('current-documents.json',documents);write('preserved-occurrences.json',preserved);write('current-quality-inputs.json',quality);write('deck-inputs.json',decks);write('graph-invalid-references.json',graphrefs);write('catalog-pins.json',files)
print(json.dumps(summary,ensure_ascii=False,indent=2))
