#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only replay of explicitly guarded current-catalog Informatics variants."""
from pathlib import Path
import copy, hashlib, json, sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'scripts'))
import canonical_goal_identity_migration as cj
sys.path.insert(0,str(Path(__file__).resolve().parent))
from verify_informatics_ordinary_prerequisites_hypothesis import relations,definition_delta,cyclic_keys,require


def sha(raw):return hashlib.sha256(raw).hexdigest()


def inspect(context):
    documents=[]
    expected_paths={r['path'] for r in context['catalogSources']}
    actual_paths={str(p.relative_to(ROOT)) for p in (ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json')}
    require(expected_paths==actual_paths and len(expected_paths)==21,'Exactly all21 declared canonical source files required')
    for binding in context['catalogSources']:
        raw=(ROOT/binding['path']).read_bytes();require(sha(raw)==binding['sha256'],'Pinned actual source differs: '+binding['path'])
        d=json.loads(raw);require(d['landscapeId']==binding['landscapeId'] and len(d['goals'])==binding['goalCount'],'Owner/count differs');documents.append(d)
    for binding in [context['mathLedger'],*context['inputs'].values()]:require(sha((ROOT/binding['path']).read_bytes())==binding['sha256'],'Review/data input differs: '+binding['path'])
    owner=context['source']['landscapeId'];source=next(d for d in documents if d['landscapeId']==owner);before,be,bg,ba,bc=relations(documents)
    index={k:i for i,k in enumerate(before.keys)};ai={k:i for i,k in enumerate(before.atom_keys)}
    architecture=owner+':'+context['architectureGoalId'];architecture_bit=1<<ai[architecture]
    orientation=owner+':'+context['orientationGoalId'];orientation_bit=1<<ai[orientation]
    doc_key=owner+':'+context['documentationGoalId'];held_id=context['alwaysHeldIsaOperation'][0]['guardGoalId'];terminals={g['id'] for g in source['goals'] if g.get('examData') or g.get('extendedData',{}).get('examData')}
    result={'schemaVersion':1,'status':'actual-current-catalog-read-only-demand-analysis-NOT-application','sourceDataApplied':False,'qaApprovalClaimed':False,'observationHead':context['observationHead'],'source':context['source'],'catalogSources':context['catalogSources'],'goalKeys':len(before.keys),'atomicKeys':len(before.atom_keys),'variants':{}}
    expected_counts={'baseline':0,'ordinary24':24,'cache-only1':1,'ordinary25-with-cache':25,'turing-only1':1,'documentation-motivation-only1':1,'ordinary24-turing-documentation26':26,'ordinary25-cache-turing-documentation27':27}
    require(set(context['variants'])==set(expected_counts),'Unexpected variant set')
    for name,v in context['variants'].items():
        require(len(v['operations'])==expected_counts[name] and sha(cj.stable(v['operations']))==v['operationsCanonicalSha256'],'Operation pin/count differs')
        candidate=copy.deepcopy(source);seen=set()
        for op in v['operations']:
            parts=op['path'].split('/');require(op['op']=='replace' and op['file']==context['source']['path'] and len(parts)==4 and parts[:2]==['','goals'] and parts[3]=='requires','Only exact requires field pointers')
            g=candidate['goals'][int(parts[2])];id=g['id'];require(id==op['guardGoalId'] and id not in seen and id not in terminals and id!=held_id and not id.startswith('875cb53c-'),'Wrong/repeated/held/terminal author')
            require(not g.get('contains') and g.get('semanticKind') not in ['orientation','memory','integrativeAssessment'],'Ordinary atomic author required')
            require(sha(cj.stable(g))==op['guardGoalCanonicalSha256'] and g['requires']==op['guardRequiresBefore'],'Goal payload/array guard differs');seen.add(id)
            require(isinstance(op['value'],list) and all(isinstance(ref,str) for ref in op['value']) and len(set(op['value']))==len(op['value']),'Malformed replacement refs')
            g['requires']=copy.deepcopy(op['value'])
        require(sha((json.dumps(candidate,ensure_ascii=False,indent=2)+'\n').encode())==v['hypotheticalSourceSha256'],'Candidate serialization differs')
        for old,new in zip(source['goals'],candidate['goals']):
            require({k:v for k,v in old.items() if k!='requires'}=={k:v for k,v in new.items() if k!='requires'},'Non-requires mutation')
            if old['id'] in terminals or old['id']==held_id:require(old==new,'Held ISA or terminal payload changed')
        after,ae,ag,aa,ac=relations([candidate if d['landscapeId']==owner else d for d in documents]);gd=definition_delta(before.keys,bg,ag,before);ad=definition_delta(before.atom_keys,ba,aa,before)
        gbc,gac=cyclic_keys(before.keys,bg),cyclic_keys(after.keys,ag);abc,aac=cyclic_keys(before.atom_keys,ba),cyclic_keys(after.atom_keys,aa)
        require(not(set(gac)-set(gbc)) and not(set(aac)-set(abc)),'New cycle participants')
        protected=[]
        for id in context['protectedTerminalGoalIds']:
            key=owner+':'+id;old=bool(ba[ai[key]]&architecture_bit);new=bool(aa[ai[key]]&architecture_bit)
            protected.append({'goalId':id,'architectureDemandBefore':old,'architectureDemandAfter':new,'newArchitectureDemand':new and not old,'terminalPayloadUnchanged':before.nodes[key][1]==after.nodes[key][1]})
        doc_rows=[]
        for i,key in enumerate(before.atom_keys):
            if ba[i]!=aa[i] and name=='documentation-motivation-only1':
                require(not(ba[i]&~aa[i]),'Documentation motivation removed existing atomic demand')
                require(not((aa[i]&~ba[i])&~orientation_bit),'Documentation motivation adds a subject competence')
                doc_rows.append({'sourceKey':key,'allExistingAtomicDemandsPreserved':True,'onlyAddedDemandIsExistingOrientation':True})
        if name=='documentation-motivation-only1':require(aa[ai[doc_key]]&orientation_bit,'Documentation has no orientation path')
        if name in ['ordinary24','ordinary24-turing-documentation26']:require(not any(r['newArchitectureDemand'] for r in protected),'Candidate introduces held terminal architecture demand')
        result['variants'][name]={'operationCount':len(v['operations']),'hypotheticalSourceSha256':v['hypotheticalSourceSha256'],'goalDemandDeltas':gd,'atomicDemandDeltas':ad,'changedForeignGoalSources':sum(not r['sourceKey'].startswith(owner+':') for r in gd),'changedForeignAtomicSources':sum(not r['sourceKey'].startswith(owner+':') for r in ad),'cycleComponentCountsBefore':bc,'cycleComponentCountsAfter':ac,'sameGoalCycleParticipants':gbc==gac,'sameAtomicCycleParticipants':abc==aac,'protectedTerminalArchitectureDemand':protected,'documentationStandalonePreservation':doc_rows,'allTerminalPayloadsUnchanged':True,'heldIsaPayloadUnchanged':True}
    for binding in context['catalogSources']+[context['mathLedger']]:require(sha((ROOT/binding['path']).read_bytes())==binding['sha256'],'Input changed during analysis')
    return result

if __name__=='__main__':
    try:
        path=ROOT/'docs/dev/ci-graph-repairs/informatics-bounded-current-candidate-context-2026-11-06.json'
        print(json.dumps(inspect(json.loads(path.read_text())),ensure_ascii=False,indent=2))
    except (ValueError,KeyError,IndexError,OSError) as error:
        print(str(error),file=sys.stderr);raise SystemExit(1)
