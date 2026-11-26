#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Compare actual nested map relations, keeping projection contracts separate."""
import argparse
import hashlib
import json
from pathlib import Path
HERE=Path(__file__).resolve().parent
TRACKED={'53afbda1-5776-502b-8867-471975d7b766','ecbaa101-cb10-5da3-9368-ae40ff587d74','059c1adc-e4d2-5222-a923-15abc417d59f','f524f05c-4456-4fc3-a1f7-f40741fc1f16'}

def contexts(data,mode):
    if mode=='compiler':return [dict(contextId=r['viewId'],viewId=r['viewId'],scope=r['scope'],levels=r['levels']) for r in data['rows']]
    if mode=='physicsOnly':return [dict(contextId=r['physicsViewId'],viewId=r['physicsViewId'],scope=r['scope'],levels=r['physicsBackflows']) for r in data['rows']]
    pair_key='sensitivityPairs' if mode.startswith('sensitivity') else 'pairs'
    return [dict(contextId=r['physicsViewId']+'|'+p['mathViewId'],viewId=r['physicsViewId'],scope=r['scope'],mathViewId=p['mathViewId'],levels=p['combinedBackflows']) for r in data['rows'] for p in r[pair_key]]

def scan(rows,key):
    relations={};atomic=set();occurrences=0;levels=0
    per_view=[]
    for r in rows:
        local=set();count=0;levels+=len(r['levels'])
        for level in r['levels']:
            for edge in level.get(key) or []:
                identity=(r['contextId'],edge['scope'],edge['source'],edge['target'])
                local.add(identity);count+=1;occurrences+=1
                witness={(x['requiredGoalId'],x['dependentGoalId']) for x in edge['provenance']}
                if identity not in relations:
                    relations[identity]=dict(contextId=r['contextId'],viewId=r['viewId'],scopeId=edge['scope'],scopeTitle=edge['scopeTitle'],source=edge['source'],sourceTitle=edge['sourceTitle'],target=edge['target'],targetTitle=edge['targetTitle'],atomicWitnesses=set())
                relations[identity]['atomicWitnesses'].update(witness)
                atomic.update((r['contextId'],*p) for p in witness)
        per_view.append(dict(contextId=r['contextId'],viewId=r['viewId'],jurisdiction=r['scope'].get('jurisdiction','DE'),previewLevels=len(r['levels']),backwardOccurrences=count,distinctBackwardRelations=len(local)))
    for r in relations.values():r['atomicWitnesses']=[dict(requiredGoalId=a,dependentGoalId=b) for a,b in sorted(r['atomicWitnesses'])]
    return dict(metrics=dict(contexts=len(rows),nestedPreviewLevels=levels,backwardOccurrences=occurrences,distinctBackwardRelations=len(relations),atomicWitnessPairsByContext=len(atomic),distinctAtomicPairs=len({x[1:] for x in atomic})),relations=relations,atomic=atomic,perContext=per_view)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for x in ['compiler-before','compiler-current','personal-before','personal-current']:p.add_argument('--'+x,type=Path,required=True)
    args=p.parse_args();inputs={k:v for k,v in vars(args).items()};data={k:json.loads(v.read_bytes()) for k,v in inputs.items()}
    comparisons=[]
    modes=[('compiler','backwards'),('physicsOnly','backwards'),('mainCombinedPhysics','backwards'),('mainCombinedAll','combinedAllBackwards'),('mainCombinedMath','mathematicsBackwards'),('sensitivityPhysics','backwards'),('sensitivityAll','combinedAllBackwards'),('sensitivityMath','mathematicsBackwards')]
    for mode,key in modes:
        frame='compiler' if mode=='compiler' else 'personal';b=scan(contexts(data[frame+'_before'],mode),key);a=scan(contexts(data[frame+'_current'],mode),key)
        added=set(a['relations'])-set(b['relations']);removed=set(b['relations'])-set(a['relations']);new_atoms=a['atomic']-b['atomic'];old_atoms=b['atomic']-a['atomic'];lands={}
        for epoch,result in [('before',b),('after',a)]:
            for row in result['perContext']:
                land=lands.setdefault(row['jurisdiction'],{}).setdefault(epoch,dict(contexts=0,nestedPreviewLevels=0,backwardOccurrences=0,distinctBackwardRelations=0))
                land['contexts']+=1;land['nestedPreviewLevels']+=row['previewLevels'];land['backwardOccurrences']+=row['backwardOccurrences'];land['distinctBackwardRelations']+=row['distinctBackwardRelations']
        atom_row=lambda t:dict(contextId=t[0],requiredGoalId=t[1],dependentGoalId=t[2])
        comparisons.append(dict(projection=mode,before=b['metrics'],after=a['metrics'],byJurisdiction=lands,
            addedRelations=[a['relations'][k] for k in sorted(added)],removedRelations=[b['relations'][k] for k in sorted(removed)],
            addedAtomicWitnesses=[atom_row(x) for x in sorted(new_atoms)],removedAtomicWitnesses=[atom_row(x) for x in sorted(old_atoms)],
            newlyIntroducedTrackedWitnesses=[atom_row(x) for x in sorted(new_atoms) if set(x[1:])&TRACKED],
            currentDistinctRelations=[a['relations'][k] for k in sorted(a['relations'])],perContextBefore=b['perContext'],perContextAfter=a['perContext']))
    pins={k:dict(sha256=hashlib.sha256(path.read_bytes()).hexdigest(),sourceState=data[k]['sourceState']) for k,path in inputs.items()}
    result=dict(schemaVersion=1,baseline='1001aa2c7f',method='Actual current app functions on baseline/current canonical and real authored views. Every preview level and every nested scopeRelations board is inspected; grouped arrows and atomic provenance are compared as sets, not only counts.',
        inputMeasurementPins=pins,comparisons=comparisons,
        boundaries=['The unpersonalized compiler fixture reproduces the historical90/356/10/32 contract. Task-G uses a deterministic Personal Curriculum derived from eligible source seeds and complete requires closure; these are different projection contracts.',
            'National DE is reported separately from the16 Länder in every byJurisdiction table. HE includes all10 views; SN and ST include all5 each.',
            'No edge is hidden or deleted for this measurement. No learner results, browser host acceptance, activated plan or formal F6 acceptance is claimed.'])
    (HERE/'backflows.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps([{k:r[k] for k in ['projection','before','after']} for r in comparisons],indent=2))
if __name__=='__main__':main()
