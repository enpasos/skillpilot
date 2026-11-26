#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Recheck all Mathematics demands and the three repaired current witness paths.

Follows the accepted 24 November current-witness procedure: every live
consumer/place/edge and real Mathematics target or acquisition marker is
checked. This never replays or rebinds the historical backend observation.
"""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p/'scripts/normalize_mathematics_stage_views.py').exists())
sys.path.insert(0, str(ROOT/'scripts'))
from generate_mathematics_foreign_acquisition_policy import authored_places, earliest_consumer
from normalize_mathematics_stage_views import Normalizer, encode

POLICY = 'app/scripts/config/math-foreign-acquisition-demand.json'
BASE = '284063239d'


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def historical(path):
    return subprocess.check_output(['git', 'show', BASE + ':' + path], cwd=ROOT)


def markers(nodes):
    found = set()
    for node in nodes:
        if node.get('acquisitionPlacement') is True:
            found.add(node['goalId'])
        if node['kind']=='structure':
            found.update(markers(node['children']))
    return found


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--write-current-bindings', action='store_true')
    p.add_argument('--output', type=Path, required=True)
    args=p.parse_args()
    assert not args.output.exists(), 'Choose a fresh output; prior evidence is immutable'
    before_bytes = historical(POLICY)
    before=json.loads(before_bytes)
    live=json.loads((ROOT/POLICY).read_bytes())
    policy=json.loads(before_bytes)
    old_policy_bytes=(ROOT/POLICY).read_bytes()
    changes=[]
    # Removing the unnecessary kinetic-energy prerequisite leaves a direct
    # potential-energy-to-mass edge. Preserve every consumer, place and demand;
    # shorten only the three witnesses that used that removed detour.
    expected_changes={('de-de-gym-sekii-math-gk',25),('de-de-gym-sekii-math-lk',25),('de-rp-gym-sekii-math-gk',23)}
    potential='6affc2ea-ecd2-4fcd-8877-3ffa15b0425b'
    kinetic='7eeff2de-6015-49a6-a96e-a488d886dc9f'
    mass='a6469c01-6ca3-5eb2-a82c-94f3d0560b32'
    for math_id,demands in policy['views'].items():
        for index,row in enumerate(demands):
            chain=row['requiresPath']
            if any(chain[i:i+3]==[potential,kinetic,mass] for i in range(len(chain)-2)):
                assert (math_id,index) in expected_changes
                previous=json.loads(json.dumps(row))
                start=chain.index(potential)
                row['requiresPath']=chain[:start+1]+chain[start+2:]
                changes.append(dict(mathViewId=math_id,rowIndex=index,changedFields=['requiresPath'],before=previous,current=row))
    assert {(r['mathViewId'],r['rowIndex']) for r in changes}==expected_changes
    assert {k:v for k,v in live.items() if k not in ['views','currentPhysicsSourcePins']} == {k:v for k,v in before.items() if k not in ['views','currentPhysicsSourcePins']}
    assert live['views'] in [before['views'],policy['views']], 'Unexpected demand mutation'
    historical_report=ROOT/'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/foreign-math-recheck.actual.json'
    historical_report_bytes=historical_report.read_bytes()

    n=Normalizer(ROOT)
    math, math_markers, math_inputs = {}, {}, []
    for path in sorted((ROOT/'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.view.json')):
        rel=str(path.relative_to(ROOT));raw=path.read_bytes()
        assert raw==historical(rel), ('Mathematics source view changed', rel)
        v=json.loads(raw);math[v['viewId']]=n.atomic_roles(v['rootNodes']);math_markers[v['viewId']]=markers(v['rootNodes'])
        math_inputs.append(dict(path=rel,sha256=digest(raw),unchangedFromBase=True))
    sources=[]
    for path in sorted((ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json')):
        rel=str(path.relative_to(ROOT));raw=path.read_bytes()
        if 'PHYSIK' not in path.name:
            assert raw==historical(rel), ('Foreign canonical changed', rel)
        sources.append(dict(path=rel,sha256=digest(raw),unchangedFromBase=raw==historical(rel)))
    for path in sorted((ROOT/'curricula/DE/Gymnasium/mapping').glob('DE-*/**/*math*source_extraction*.json')):
        for q in [path, ROOT/json.loads(path.read_bytes())['sourceExtractionPath']]:
            rel=str(q.relative_to(ROOT));raw=q.read_bytes();assert raw==historical(rel),rel
            sources.append(dict(path=rel,sha256=digest(raw),unchangedFromBase=True))
    places, pins, pin_checks = {}, {}, []
    for path, old_pin in before['currentPhysicsSourcePins'].items():
        raw=(ROOT/path).read_bytes();v=json.loads(raw)
        places[v['viewId']]=authored_places(v,n)
        pins[path]=digest(raw)
        assert old_pin==digest(historical(path)),('Baseline pin not reproduced',path)
        pin_checks.append(dict(path=path,previousPin=old_pin,baselineSourceSha256=digest(historical(path)),
            currentSha256=pins[path],renewed=old_pin!=pins[path]))
    rows=[];types={'target':0,'explicit-acquisition-marker':0};atoms=set();edges=0
    for math_id, demands in policy['views'].items():
        for index,row in enumerate(demands):
            atom=row['goalId'];assert atom in n.math_atoms and atom in math[math_id]
            placement='target' if math[math_id][atom]=='target' else 'explicit-acquisition-marker'
            if placement!='target':assert atom in math_markers[math_id],(math_id,atom)
            consumer,location=earliest_consumer(places[row['physicsViewId']],atom,n)
            assert row['consumerGoalId']==consumer,(math_id,index,'consumer')
            assert row['consumerStructurePath']==location['path'],(math_id,index,'path')
            assert row['demandPlace']==(list(location['place']) if location['place'] else None),(math_id,index,'time')
            chain=row['requiresPath'];assert chain[0]==consumer and chain[-1]==atom
            for dependent,prerequisite in zip(chain,chain[1:]):
                assert prerequisite in [x.split(':')[-1] for x in n.goals[dependent].get('requires',[])],(math_id,index,dependent,prerequisite)
                edges+=1
            types[placement]+=1;atoms.add(atom)
            rows.append(dict(mathViewId=math_id,rowIndex=index,goalId=atom,physicsViewId=row['physicsViewId'],
                consumerGoalId=consumer,consumerStructurePath=location['path'],demandPlace=row['demandPlace'],
                requiresPath=chain,actualContexts=row['actualContexts'],mathematicsPlaceType=placement,
                currentRowSha256=digest(encode(row).encode()),
                unchangedFromBaseline=row==before['views'][math_id][index],
                everyCurrentEdgeAndEarliestConsumerValid=True))
    assert (len(rows),len(atoms),len(policy['views']),len(math),types['target'],types['explicit-acquisition-marker'])==(1036,47,69,100,15,1021)
    assert len(pins)==63
    assert edges==sum(len(row['requiresPath'])-1 for values in before['views'].values() for row in values)-3
    renewed=dict(policy,currentPhysicsSourcePins=pins)
    assert (ROOT/POLICY).read_bytes()==old_policy_bytes, 'Concurrent policy mutation'
    assert historical_report.read_bytes()==historical_report_bytes, 'Historical report changed'
    for pin in sources+math_inputs:
        assert digest((ROOT/pin['path']).read_bytes())==pin['sha256'],pin['path']
    for pin in pin_checks:
        assert digest((ROOT/pin['path']).read_bytes())==pin['currentSha256'],pin['path']
    if args.write_current_bindings:
        (ROOT/POLICY).write_text(encode(renewed))
    else:
        assert live==renewed,'Refresh current bindings only after every witness passes'
    report=dict(schemaVersion=1,status='PASS',baselineCommit=BASE,
        contract='physics-e2-energy-current-mathematics-witness-successor-v1',
        measuredAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        baselinePolicySha256=digest(before_bytes),
        preservedHistoricalReport=dict(path=str(historical_report.relative_to(ROOT)),sha256=digest(historical_report_bytes)),
        method='Accepted 24 November exhaustive retained-witness method. Current canonical atomic paths, current earliest source consumer and actual Mathematics target/acquisition markers; no replay of historical backend sessions.',
        historicalObservationHashes={k:policy[k] for k in ['actualWitnessSha256','actualNativeViewsSha256']},
        policySha256=digest(encode(renewed).encode()),policyRowChanges=changes,
        unchangedDemandIdentitiesAndPlaces=1036,unchangedCompleteRows=1033,
        historicalObservationHashesPreserved=True,semanticRecheckCompletedBeforePolicyWrite=True,
        demandRows=len(rows),mathematicsAtoms=len(atoms),mathPolicyViews=len(policy['views']),mathematicsSourceViews=len(math),
        classifications=types,verifiedRequiresEdges=edges,renewedPinCount=sum(x['renewed'] for x in pin_checks),
        physicsSourcePins=pin_checks,unchangedMathematicsSourceViews=math_inputs,
        canonicalAndSourceInputs=sources,allRetainedRowChecks=rows,
        boundaries=['This successor changes no Mathematics source targets, canonical Mathematics, Mathematics maps, demand identities or historical observation hashes.',
            'Exactly three requiresPath witnesses omit the removed kinetic-energy detour and now use the actual direct potential-energy-to-mass edge. All 1036 demand identities, consumers, times, places, contexts and Mathematics acquisition obligations remain unchanged.',
            'No native backend/frontier acceptance or new subject-matter approval is claimed by this structural current-state recheck.'])
    args.output.parent.mkdir(parents=True,exist_ok=True)
    with args.output.open('x') as output:output.write(encode(report))
    print(json.dumps({k:report[k] for k in ['status','demandRows','mathematicsAtoms','renewedPinCount','verifiedRequiresEdges']}))

if __name__=='__main__':
    main()
