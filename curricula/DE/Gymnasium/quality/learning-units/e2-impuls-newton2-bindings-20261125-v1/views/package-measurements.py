#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Package the real native and authoring measurements with exact current pins."""
import argparse
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p/'scripts/generate_laender_physics_stage_views.py').exists())
KEYS = ['53afbda1','ecbaa101','059c1adc','a94cfe1c','839ecc8f','f524f05c','b1dcc191']


def write(path, value):
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--native',type=Path,required=True)
    p.add_argument('--authoring-report',type=Path,required=True)
    args=p.parse_args()
    raw=args.native.read_bytes();native=json.loads(raw)
    pins=json.loads((HERE/'placements.actual.json').read_text());by_id={r['viewId']:r for r in pins['views']}
    rows=[];timing=[]
    for r in native['rows']:
        pinned=by_id[r['physicsViewId']]
        assert hashlib.sha256((ROOT/pinned['file']).read_bytes()).hexdigest()==pinned['sha256'],pinned['file']
        pair=r['pairs'][0];physics={}
        for key in KEYS:
            actual=pair['goals'][key]
            independently_projected=next((g for g in pinned['goals'] if g['goalId']==actual['id']),None)
            if independently_projected:
                assert independently_projected['target']==actual['physicsOperationalTarget']
                assert independently_projected['inLearning']==actual['inPhysicsLearningBasis']
            physics[key]={k:actual[k] for k in ['id','physicsAuthoredRole','physicsOperationalTarget','inPhysicsLearningBasis','physicsRequirementPath','physicsMapPath','physicsAuthored']}
        def combined(p):
            return dict(mathFile=p['mathFile'],mathViewId=p['mathViewId'],mathScope=p['mathScope'],goals={k:{f:p['goals'][k][f] for f in ['combinedMapPath','mathOperationalTarget','mathMapPath','mathAuthored']} for k in KEYS})
        rows.append(dict(file=r['file'],viewId=r['physicsViewId'],scope=r['scope'],sha256=pinned['sha256'],seedCount=r['physicsSeedCount'],learningCount=r['physicsLearningBasisCount'],goals=physics,
            combined=[combined(p) for p in r['pairs']],sensitivityMathGK=[combined(p) for p in r['sensitivityPairs']]))
        if physics['f524f05c']['physicsOperationalTarget']:
            timing.append(dict(file=r['file'],scope=r['scope'],proof=physics['f524f05c']['physicsMapPath'],rateI=physics['059c1adc']['physicsMapPath'],nativeMathematics=pair['goals']['b1dcc191']['mathMapPath'],combinedMathematics=pair['goals']['b1dcc191']['combinedMapPath'],combinedProof=pair['goals']['f524f05c']['combinedMapPath'],combinedRateI=pair['goals']['059c1adc']['combinedMapPath']))
    assert (len(rows),sum(len(x['combined']) for x in rows),sum(len(x['sensitivityMathGK']) for x in rows),len(timing))==(90,92,36,32)
    write(HERE/'native-projection.actual.json',dict(schemaVersion=1,method=native['method'],canonicalPhysicsSha256=pins['canonicalPhysicsSha256'],rawMeasurementSha256=hashlib.sha256(raw).hexdigest(),physicsViews=len(rows),mainCombinedPairs=92,sensitivityMathGKPairs=36,nativePythonTargetAndLearningMismatches=0,
        boundaries=['Actual app composition, Personal Curriculum, navigation and map projection. Synthetic deterministic scope; no real learner session or backend frontier acceptance.','SN Math11/12 overlaps Physics11; ST Math11/12 overlaps new PhysicsQ11/12. Neither span proves strictly earlier calendar treatment.'],views=rows))
    write(HERE/'native-derivation-timing.actual.json',dict(method='Actual native paths; phase overlap is not strict chronological precedence. Direct backend frontier is separate.',derivationTargetViews=32,views=timing))
    authoring=json.loads(args.authoring_report.read_bytes());tracked=set(native['ids'].values());new_ids={native['ids'][k] for k in KEYS[:3]};relevant=[]
    def shift(row):
        result={k:v for k,v in row.items() if k!='retainedSourceAssignment'}
        if 'retainedSourceAssignment' in row:
            assignment=row['retainedSourceAssignment'];encoded=json.dumps(assignment,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
            result['retainedSourceAssignmentSha256']=hashlib.sha256(encoded).hexdigest()
            result['retainedSourceTopic']=assignment.get('sourceTopic')
            result['sourceAssignmentBoundary']='Full retained mapping is reproducible in the --report output; only new momentum source assignments are duplicated here.'
        return result
    for row in authoring:
        if row.get('reviewedMomentumBindings') or any(x['goalId'] in tracked for x in row.get('earlierDemandPlacements',[])):
            relevant.append(dict(file=row['file'],reviewedMomentumBindings=row.get('reviewedMomentumBindings',[]),reviewedSourceAssignmentCorrections=row.get('reviewedSourceAssignmentCorrections',[]),reviewedNewMomentumPreparationPlaces=row.get('reviewedNewMomentumPreparationPlaces',[]),sourceAssignments={k:v for k,v in row.get('sourceAssignments',{}).items() if k in new_ids or (k==native['ids']['f524f05c'] and row['file'].startswith(('de-sn-','de-st-'))) or (row.get('reviewedSourceAssignmentCorrections') and k.startswith('839ecc8f'))},earlierDemandPlacements=[shift(x) for x in row.get('earlierDemandPlacements',[]) if x['goalId'] in tracked],commonCourseEarlierDemandPlacements=[shift(x) for x in row.get('commonCourseEarlierDemandPlacements',[]) if x['goalId'] in tracked]))
    write(HERE/'source-placement-witnesses.actual.json',dict(schemaVersion=1,sourcePolicySha256=hashlib.sha256((ROOT/'scripts/generate_laender_physics_stage_views.sources.json').read_bytes()).hexdigest(),report='Actual final generator report, restricted to tracked momentum/derivation/math identities. Broad retained source assignments are hashed, not duplicated.',views=relevant))
    print('90 native views, 92 combined pairs, 36 sensitivity pairs; 0 role/learning mismatches; 32 derivation contexts.')

if __name__=='__main__':
    main()
