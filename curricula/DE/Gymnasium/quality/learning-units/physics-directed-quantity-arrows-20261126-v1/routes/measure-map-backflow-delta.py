#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Compare every current nested map scope against the byte-exact N baseline."""
import argparse,hashlib,json,runpy
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[6]
MEASURE='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views'

def main():
    parser=argparse.ArgumentParser()
    for name in ('compiler-before','compiler-current','personal-before','personal-current'):
        parser.add_argument('--'+name,type=Path,required=True)
    parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
    if args.output.exists():raise ValueError('Choose a fresh output; retained evidence is immutable')
    helper=ROOT/MEASURE/'lower-closures-v1/package-backflows.py';api=runpy.run_path(str(helper))
    inputs={name:getattr(args,name) for name in ('compiler_before','compiler_current','personal_before','personal_current')}
    data={name:json.loads(path.read_bytes()) for name,path in inputs.items()}
    modes=[('compiler','backwards'),('physicsOnly','backwards'),('mainCombinedPhysics','backwards'),('mainCombinedAll','combinedAllBackwards'),('mainCombinedMath','mathematicsBackwards'),('sensitivityPhysics','backwards'),('sensitivityAll','combinedAllBackwards'),('sensitivityMath','mathematicsBackwards')]
    comparisons=[]
    for mode,key in modes:
        frame='compiler' if mode=='compiler' else 'personal'
        before=api['scan'](api['contexts'](data[frame+'_before'],mode),key)
        after=api['scan'](api['contexts'](data[frame+'_current'],mode),key)
        by_land={}
        for epoch,result in [('before',before),('after',after)]:
            for row in result['perContext']:
                land=by_land.setdefault(row['jurisdiction'],{}).setdefault(epoch,dict(contexts=0,nestedPreviewLevels=0,backwardOccurrences=0,distinctBackwardRelations=0))
                for dest,source in [('contexts',None),('nestedPreviewLevels','previewLevels'),('backwardOccurrences','backwardOccurrences'),('distinctBackwardRelations','distinctBackwardRelations')]:
                    land[dest]+=row[source] if source else 1
        added=set(after['relations'])-set(before['relations']);removed=set(before['relations'])-set(after['relations'])
        atom=lambda t:dict(contextId=t[0],requiredGoalId=t[1],dependentGoalId=t[2])
        comparisons.append(dict(projection=mode,before=before['metrics'],after=after['metrics'],byJurisdiction=by_land,
            addedRelations=[after['relations'][k] for k in sorted(added)],removedRelations=[before['relations'][k] for k in sorted(removed)],
            addedAtomicWitnesses=[atom(x) for x in sorted(after['atomic']-before['atomic'])],removedAtomicWitnesses=[atom(x) for x in sorted(before['atomic']-after['atomic'])]))
    paths=[str((ROOT/MEASURE/f).relative_to(ROOT)) for f in ('measure-compiler-backflows.ts','measure-native-backflows.ts','lower-closures-v1/package-backflows.py')]
    for folder in ['canonical','composition-views/physik','composition-views/mathematik']:
        paths.extend(str(p.relative_to(ROOT)) for p in sorted((ROOT/'curricula/DE/Gymnasium'/folder).glob('*.json')))
    pins=[dict(path=p,sha256=hashlib.sha256((ROOT/p).read_bytes()).hexdigest()) for p in paths]
    unchanged=all(not c[k] for c in comparisons for k in ('addedRelations','removedRelations','addedAtomicWitnesses','removedAtomicWitnesses'))
    report=dict(schema='physics-arrow-actual-nested-backflow-delta-v1',status='PASS' if unchanged else 'CHANGED',baseCommit='eb77c4fb68',
        method='Unchanged retained H measurement functions applied to exact N base data and actual A2 data. Every nested preview level is inspected. Unpersonalized compiler, source-eligible synthetic Physics Personal Curriculum, matched Mathematics combinations and GK sensitivity contexts are separate contracts. Relation sets and atomic provenance sets are compared, not only counts.',
        externalRawReports={key:dict(path=str(path),sha256=hashlib.sha256(path.read_bytes()).hexdigest(),sourceState=data[key]['sourceState']) for key,path in inputs.items()},
        currentInputBindings=pins,results=comparisons,
        boundaries=['National DE is reported separately from all sixteen Länder. Existing combined foreign-subject and unpersonalized-compiler findings remain visible.','No requires edge is hidden or deleted for this measurement; no learner results or host acceptance are claimed.'])
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps([dict(projection=r['projection'],before=r['before'],after=r['after']) for r in comparisons]))
    if not unchanged:raise SystemExit('Actual nested backflow relations or provenance changed; inspect the fresh report')
if __name__=='__main__':main()
