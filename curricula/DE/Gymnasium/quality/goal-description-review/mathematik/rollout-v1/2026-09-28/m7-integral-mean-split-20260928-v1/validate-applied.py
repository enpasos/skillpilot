from pathlib import Path
import json,collections,hashlib
from fractions import Fraction as F
T=Path('tmp/m7-20260928-continuation/809ef-analysis');B=Path('curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-28/m7-integral-mean-split-20260928-v1')
def load(p):return json.loads(Path(p).read_text())
old='809ef78a-f282-5593-89be-0f2cb95570ac';new='c1c80b80-733f-599d-a2fc-f4dc50eabde2';rows=load(B/'routing-285.json')['decisions'];checks=[]
for r in rows:
 d=load(r['path']);ms=[m for m in d['mappings'] if m['legacyGoalId']==r['sourceGoalId']];targets={m['canonicalGoalId'] for m in ms};expected=set(r['replacementGoalIds'])|set(r['preserveOtherTargetIds']);assert targets==expected,(r['ordinal'],targets,expected)
 dec=next(x for x in d['decisions'] if x['sourceGoalId']==r['sourceGoalId']);assert set(dec['canonicalGoalIds'])==targets
 ex=load(d['sourceExtractionPath']);source=next(x for x in ex['sourceGoals'] if x['id']==r['sourceGoalId']);assert hashlib.sha256(json.dumps(source,sort_keys=True,ensure_ascii=False).encode()).hexdigest()==r['oldSourceFingerprint']
 checks.append({'ordinal':r['ordinal'],'sourceGoalId':r['sourceGoalId'],'exactTargetSetPreserved':True,'sourceUnchanged':True,'decisionMatchesMappings':True})
legacy=load(B/'legacy-routing-5.json')
for r in legacy:
 d=load(r['path']);ms=[m for m in d['mappings'] if m['legacyGoalId']==r['mapping']['legacyGoalId']];assert not any(m['canonicalGoalId']==old for m in ms)
 for target in r['replacementGoalIds']:assert any(m['canonicalGoalId']==target and m['matchType']=='partial' for m in ms)
for r in load(B/'additional-mean-source-2.json'):
 d=load(r['path']);assert any(m['legacyGoalId']==r['source']['id'] and m['canonicalGoalId']==new and m['matchType']=='partial' for m in d['mappings'])
for p in Path('curricula/DE/Gymnasium/mapping').rglob('*.json'):
 d=load(p);assert not any(m.get('canonicalGoalId')==old for m in d.get('mappings',[])),str(p)
c=load('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json');by={g['id']:g for g in c['goals']};assert not any(old in g.get('requires',[]) for g in c['goals']);assert by[new]['applicability']==by[old]['applicability'];assert by[old]['extendedData']['applicabilityProjection']=='excluded'
# Independent exact arithmetic, including deliberately non-symmetric averaging interval.
z_integral=lambda t:-F(t**3,12)+t*t+3*t
B_integral=lambda t:12*t-F(t**4,48)+F(t**3,3)+F(3*t*t,2)
assert z_integral(8)==F(136,3) and z_integral(8)/8==F(17,3)
assert B_integral(4)==88 and B_integral(4)/4==22
assert (12+12+z_integral(4))/2==F(70,3) and F(70,3)!=22
flow=by['0f18f4e2-efd9-58b8-9b7e-f26aa2fbf43b'];sc=flow['examData']['scoring'];assert sum(x['points'] for x in sc['steps'])==sc['maxPoints']==28;assert sc['passingPoints']==26;assert flow['requires']==flow['examData']['coveredGoalIds'];assert sc['maxPoints']-3<sc['passingPoints'];assert sc['maxPoints']-4<sc['passingPoints']
result={'authority':'automated_validation','humanApproval':False,'reviewRows':len(checks),'legacyRows':len(legacy),'additionalMeanRows':2,'noOldTargetMappings':True,'noOldDirectPrerequisites':True,'sameAuthoredJurisdictionMetadata':True,'exactArithmetic':{'totalInflow':'136/3','meanRate':'17/3','stockIntegral0to4':'88','meanStock0to4':'22','endpointMean0to4':'70/3'},'assessmentCoreModelCapPreventsPass':True,'checks':checks}
(B/'applied-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('PASS: 285+5 individually routed source edges, 2 additions, no old mappings/requires, exact task arithmetic and scoring caps')
