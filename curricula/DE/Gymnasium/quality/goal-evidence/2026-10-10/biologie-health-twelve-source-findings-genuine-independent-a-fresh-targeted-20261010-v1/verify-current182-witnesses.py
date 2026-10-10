# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json, hashlib

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent.relative_to(ROOT)
AUTHOR=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1')
def read(p):return json.loads(Path(p).read_text())
def ref(p):
    p=Path(p);b=p.read_bytes();assert p.is_file() and not p.is_symlink()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
witnesses=read(AUTHOR/'sources/current182-whole-direct-witnesses-and-actual-primaries.neutral.json')
checks=[]
for row in witnesses['rows']:
    assert row['directWitnessCount']==len(row['wholeDirectSourceWitnesses'])
    for w in row['wholeDirectSourceWitnesses']:
        m=read(w['mapping']['path']);e=read(w['extraction']['path'])
        source=w['wholeCurrentSourceGoal'];mapping=w['wholeCurrentMappingRecord']
        assert mapping['canonicalGoalId']==row['goalId']
        assert source==next(g for g in e['sourceGoals'] if g['id']==source['id'])
        assert mapping in m['mappings']
        assert w['wholeCurrentSourceDecisions']==[d for d in m['decisions'] if d.get('sourceGoalId')==source['id']]
        assert ref(w['mapping']['path'])==w['mapping']
        assert ref(w['extraction']['path'])==w['extraction']
        assert ref(w['actualReadOperatorPrimaryBinding']['path'])==w['actualReadOperatorPrimaryBinding']
        assert ref(w['actualRegularNormativeDocumentBinding']['path'])==w['actualRegularNormativeDocumentBinding']
        if mapping.get('sourceContributionScope'):
            assert w['targetSpecificActualPrimaryLocator']==mapping['sourceContributionScope']['actualPrimaryLocator']
        checks.append({'goalId':row['goalId'],'sourceGoalId':source['id'],'mapping':w['mapping'],'extraction':w['extraction'],'wholeSourceGoalExact':True,'wholeMappingExact':True,'wholeDecisionsExact':True,'actualWholeOperatorPrimaryExact':True,'actualNormativePrimaryExact':True,'targetLocatorExact':True,'newSubstantiveSourceApproval':False})
assert len(checks)==182
contexts=read(AUTHOR/'native/targeted-source-affected-complete-current-page-contexts.neutral.json')
model=read(AUTHOR/'native/current394-source-corrected.actual-normal-model.json');pages={p['goalId']:p for p in model['pages']}
for r in contexts['records']:
    assert r['wholeBeforeNativePage']==r['wholeAfterNativePage']==pages[r['goalId']]
proof={'schemaVersion':1,'wholeDirectWitnessCount':len(checks),'whole31SourcePairCount':len(witnesses['whole31PairBindings']),'records':checks,'wholeCurrentTenPageContextsExact':True,'scienceApprovalForUnchangedHistoricalWitnessesClaimed':False,'humanApproved':0,'strictGain':0,'activeWrites':[]}
out=OWN/'checks/current182-whole-witness-record-integrity.actual.json';assert not out.exists();out.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');assert read(out)==proof
print(json.dumps({'whole182WitnessRecordsAndActualPrimariesExact':True,'wholeTenNativeContextsExact':True,'humanApproved':0,'strictGain':0}))
