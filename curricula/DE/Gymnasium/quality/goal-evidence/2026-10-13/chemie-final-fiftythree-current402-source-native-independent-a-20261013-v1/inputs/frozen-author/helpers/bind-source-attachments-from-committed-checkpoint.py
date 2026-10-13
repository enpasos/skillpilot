# Apache-2.0. Exact source attachment addresses and whole cells, without an approval vote.
from pathlib import Path
import json, gzip, hashlib

R=Path.cwd()
N=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-poly18-aro19-final-current231-source-native-author-root-20261013-v1'
C=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie231-source-first-inactive-checkpoint-root-20261013-v1'
read=lambda p: json.loads(p.read_text())
sha=lambda p: 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
bind=lambda p: {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
handoff=read(C/'RESUME.inactive-checkpoint.actual.json')
transport={i['futureLiveBinding']['path']:i['inactiveCheckpointBinding'] for i in handoff['candidateCarriers']}
matrix=json.loads(gzip.decompress((C/'receipts/compiler-current-vs-final523-goal-P-A-M-D-and-source-input-impact.actual.json.gz').read_bytes()))
scope=read(N/'inputs/exact-final-native-scope-and-separate-source-impacts.actual.json')
ids=set(scope['nativeUnionGoalIds'])|set(scope['sourceOnlyProtectedWitnessChangedGoalIds'])
files={};references={}

def resolve_source(path):
    candidate=transport.get(path)
    actual=R/(candidate['path'] if candidate else path)
    assert actual.exists() and actual.resolve().is_relative_to(R),path
    assert '/tmp/' not in str(actual.resolve()),path
    if candidate: assert sha(actual)==candidate['sha256'],path
    binding=bind(actual)
    references[path]={'compilerReferencedPath':path,'committableExactBinding':binding,
                      'transportOnly':candidate is not None,'approvalByThisReceipt':False}
    if path not in files:files[path]=read(actual)
    return files[path],binding

rows=[]
for row in matrix['rows']:
    if row['goalId'] not in ids:continue
    resolved=[]
    for witness in row['finalSourceWitnesses']:
        extraction,sb=resolve_source(witness['sourceExtractionPath'])
        mapping,mb=resolve_source(witness['mappingPath'])
        source=next(g for g in extraction['sourceGoals'] if g['id']==witness['sourceGoalId'])
        mappings=[g for g in mapping.get('mappings',[]) if g.get('legacyGoalId')==witness['sourceGoalId'] and g.get('canonicalGoalId')==witness['mappedTargetGoalId']]
        decisions=[g for g in mapping.get('decisions',[]) if g.get('sourceGoalId')==witness['sourceGoalId']]
        assert mappings,witness
        resolved.append({'compiledWitness':witness,'wholeSourceCell':source,
                         'matchingMappingCells':mappings,'wholeSourceDecisionCells':decisions,
                         'exactExtractionBinding':sb,'exactMappingBinding':mb})
    rows.append({'goalId':row['goalId'],'title':row['title'],'isProtected231':row['isProtected231'],
                 'inNative53':row['goalId'] in scope['nativeUnionGoalIds'],
                 'canonicalDContextChangedFields':row['canonicalDescriptionContextChangedFields'],
                 'currentLiveSourceScopes':row['currentLiveSourceScopes'],
                 'finalSourceScopes':row['finalSourceScopes'],
                 'sourceScopeSetChanged':row['sourceScopeSetChanged'],
                 'sourceComponentWitnessSetChanged':row['sourceComponentWitnessSetChanged'],
                 'currentCompiledWitnesses':row['currentSourceWitnesses'],
                 'finalCompiledWitnessesWithExactWholeCells':resolved,
                 'missingMappedSourceWitness':not bool(resolved),
                 'nativePageIsNotSourceEntitlement':True,'newApproval':False})
assert len(rows)==len(ids)
out={'schemaVersion':1,'role':'Exact committable source attachments for the frozen native53 and separately affected protected69; no source or D approval',
     'nativeGoalCount':53,'separateProtectedWitnessChangedCount':69,'unionGoalCount':len(ids),
     'inputScopeBinding':bind(N/'inputs/exact-final-native-scope-and-separate-source-impacts.actual.json'),
     'committedCheckpointBinding':bind(C/'RESUME.inactive-checkpoint.actual.json'),
     'sourceImpactMatrixBinding':bind(C/'receipts/compiler-current-vs-final523-goal-P-A-M-D-and-source-input-impact.actual.json.gz'),
     'references':list(references.values()),'goals':rows,'newScientificVotes':0,
     'heldMissingWitnessesExplicit':[r['goalId'] for r in rows if r['missingMappedSourceWitness']],
     'activeWrites':False,'nativePageIsNotSourceEntitlement':True}
target=N/'inputs/final-compiled-source-witnesses.whole-cells-and-portable-addresses.actual.json.gz'
assert not target.exists()
target.write_bytes(gzip.compress((json.dumps(out,ensure_ascii=False,indent=2)+'\n').encode(),mtime=0))
print(json.dumps({'sourceAttachment':bind(target),'unionGoals':len(ids),'sourceReferences':len(references),'missingWitnesses':out['heldMissingWitnessesExplicit']},ensure_ascii=False))
