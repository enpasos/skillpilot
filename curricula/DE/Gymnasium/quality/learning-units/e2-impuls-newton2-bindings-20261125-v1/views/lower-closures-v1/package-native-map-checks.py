#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Compact reproducible acceptance checks for the current native90-view projection."""
import argparse,hashlib,json,pathlib
HERE=pathlib.Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'scripts/generate_laender_physics_stage_views.py').exists())
PREFIX='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v1/'
def read(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
p=argparse.ArgumentParser();p.add_argument('--raw',type=pathlib.Path,required=True);p.add_argument('--output',type=pathlib.Path,required=True);args=p.parse_args();assert not args.output.exists()
j=read(args.raw);native_path=ROOT/PREFIX/'current-offer-context.actual.json';native=read(native_path)
for pin in native['inputs']:assert sha(ROOT/pin['path'])==pin['sha256'],pin['path']
rows=[];offers=[];pairs=0;sensitivity=0
for row in j['rows']:
 expected=row['scope'].get('jurisdiction')=='DE-BW' and row['scope']['stage'] in ['CrossStage','SekI']
 all_pairs=row['pairs']+row['sensitivityPairs'];pairs+=len(row['pairs']);sensitivity+=len(row['sensitivityPairs'])
 for pair in all_pairs:
  goal=pair['goals']['b50e9903'];assert goal['physicsOperationalTarget']==expected and goal['inPhysicsLearningBasis']==expected
  assert bool(goal['physicsMapPath'])==expected and bool(goal['combinedMapPath'])==expected
  assert goal['mathAuthoredRole']=='absent' and not goal['inMathLearningBasis']
  if expected:offers.append({'viewId':row['physicsViewId'],'scope':row['scope'],'mathViewId':pair['mathViewId'],'sensitivity':pair in row['sensitivityPairs'],'goal':goal})
 rows.append({k:row[k] for k in ['file','physicsViewId','scope','physicsSeedCount','physicsLearningBasisCount','pairing']}|{'assessmentTarget':expected})
assert len(rows)==90 and sum(r['assessmentTarget'] for r in rows)==3
result={'schemaVersion':1,'status':'PASS','integrationComplete':False,'contract':'e2-k2-only-native-map-input-checks-v1','method':j['method'],'currentNativeContext':{'path':PREFIX+'current-offer-context.actual.json','sha256':sha(native_path)},'viewCount':90,'physicsMathPairCount':pairs,'sensitivityPairCount':sensitivity,'viewRows':rows,'actualK2TargetMapContexts':offers,'rawMeasurement':{'sha256':sha(args.raw),'retainedOutsideRepository':True},'boundary':'Native TypeScript current composition/navigation/map evidence, without real backend session, learner mastery or whole-CQR104 acceptance.'}
with args.output.open('x') as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps({'status':'PASS','views':90,'physicsMathPairs':pairs,'sensitivityPairs':sensitivity,'K2mapContexts':len(offers)}))
