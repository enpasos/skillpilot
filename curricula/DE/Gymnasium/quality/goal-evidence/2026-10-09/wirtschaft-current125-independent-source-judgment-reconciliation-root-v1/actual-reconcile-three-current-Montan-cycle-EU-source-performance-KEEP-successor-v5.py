from collections import Counter
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json
import subprocess

OUT=Path(__file__).resolve().parent
ROOT=next(p for p in OUT.parents if (p/'AGENTS.md').is_file() and (p/'curricula').is_dir())
FOREIGN=OUT.parent/'wirtschaft-BE-three-source-rests-director-cycle-EU-independent-whole-performance-need-review-v1'
OLD=OUT/'actual-current125-qualified-E-own-model-household-P8-two-source-unions-successor-v4.json'
NEW=FOREIGN/'three-individual-whole-current-source-facet-performance-union-KEEP-judgments.json'
FINAL=FOREIGN/'actual-final-independent-four-P12-three-qualified-source-unions-and-one-new-director-Need-AM-M-KEEP.receipt.json'
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+sha256(p.read_bytes()).hexdigest()}
old=json.loads(OLD.read_text())
source=ROOT/old['currentSource']['path']
inputs=[OLD,NEW,FINAL,source,ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']
guards=[bind(p) for p in inputs]
assert bind(NEW)['sha256']=='sha256:8c2feecce04ccd8bb7e5b6f0c73c517e90598e7acafa899ebb0490a170cca399'
assert bind(FINAL)['sha256']=='sha256:2b760571c675ef4bee6a2edf8ace1e9bdb8a91db9d54850bf488c168c1d11241'
assert bind(source)['sha256']==old['currentSource']['sha256']
sources={s['id']:s for s in json.loads(source.read_text())['sourceGoals']}
assert len(sources)==len(old['rows'])==125
for row in old['rows']:
    assert row['currentWholeRow']['rowSha256']=='sha256:'+sha256(json.dumps(sources[row['sourceAspectId']],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
judgments=json.loads(NEW.read_text())['judgments']
assert len(judgments)==3
current=deepcopy(old)
rows={r['sourceAspectId']:r for r in current['rows']}
changed=[]
for j in judgments:
    target=j['sourceAspectId'];row=rows[target]
    assert row['currentBoundedPerformanceUnionDecision']=='BLOCK' and j['decision']=='KEEP'
    assert j['wholeExactCurrentV6SourceRow']==sources[target]
    assert j['decisionScope']=='ONLY_CURRENT_BOUNDED_WHOLE_SOURCE_FACET_PERFORMANCE_UNION_CONTENT'
    assert not j['wholeSource125CoverageApproved'] and not j['wholeCourseApproved'] and not j['humanApproval']
    row['currentBoundedPerformanceUnionDecision']='KEEP'
    row['lineage'].append({'wholeIndependentJudgmentFile':bind(NEW),'independentFinalReceipt':bind(FINAL),'sourceAspectId':target,'decision':'KEEP','priorIndependentDecision':'BLOCK','acceptedWholePerformanceUnionGoalIds':j['acceptedWholePerformanceUnionGoalIds'],'currentnessLimit':j['currentnessLimit']})
    row['wholePerformanceReasonDe']=j['wholePerformanceComparisonDe']
    row['remainingPerformanceDe']=j['remainingWholeSourcePerformance']
    qualifier=row['explicitTrueCourseRoleQualifier'] or {}
    qualifier.update({'specificWholeRoleConstraintDe':'Die ganze begrenzte Source-Leistungsunion ist unabhängig KEEP. Native Mappingentscheidungen, ganzer kanonischer Target-/Kursnachweis und aktuelle neue Ziel-/D-/P-/V-Integration bleiben eigene Nachweise.','actualCurrentIndependentSourcePerformanceCourseEvidence':j['trueBoundedCourseEvidence']})
    row['explicitTrueCourseRoleQualifier']=qualifier
    changed.append(target)
assert all(row==rows[row['sourceAspectId']] for row in old['rows'] if row['sourceAspectId'] not in changed)
counts=dict(Counter(r['currentBoundedPerformanceUnionDecision'] for r in current['rows']))
assert counts=={'KEEP':125},counts
current.update({'at':datetime.now(timezone.utc).isoformat(),'kind':'Qualified whole current source-performance judgments reconciled for all125 exact current IDs. This is neither whole native source coverage nor course/target-role approval.','previousLedger':bind(OLD),'counts':counts,'newUniqueQualifiedSourcePerformanceClosures':22,'thisPackageNewQualifiedSourcePerformanceClosures':3,'openSourceRows':0,'nativeMappedDecisionApproved':False,'whole125CoverageApproved':False,'normativeWholeCourseApproved':False,'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0})
target=OUT/'actual-current125-qualified-all-performance-KEEP-Montan-cycle-EU-three-source-unions-successor-v5.json'
with target.open('x') as f:f.write(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
assert guards==[bind(p) for p in inputs]
ignored=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in inputs+[target]],cwd=ROOT,capture_output=True,text=True)
assert ignored.returncode in (0,1) and not ignored.stdout.strip(),ignored.stdout
receipt={'at':datetime.now(timezone.utc).isoformat(),'reconciler':'/root','scope':'Qualified source-performance metadata only; no repeated historical review or new whole-course approval.','frozenInputs':guards,'newLedger':bind(target),'wholeCurrentSourceRowsActuallyVerified':125,'unaffectedWholeJudgmentRowsExact':122,'changedCurrentSourceAspectIds':changed,'counts':counts,'openQualifiedSourcePerformanceRows':0,'newQualifiedSourcePerformanceClosuresThisPackage':3,'totalQualifiedSourcePerformanceClosuresSince103Baseline':22,'originalSource125WholeBytesExact':True,'liveGoalBytesExact':True,'nativeMappedDecisionApproved':False,'wholeSource125CoverageApproved':False,'wholeCanonicalCourseTargetRolesApproved':False,'newGoal912_DAndCurrentPAndVIntegrationApproved':False,'humanApproval':False,'strictBefore':{'closed':300,'total':311},'strictAfter':{'closed':300,'total':311},'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,'nextStep':'Integrate only individually accepted current source unions and explicit whole-goal/course role components; independently finish native mapping and whole normative Berlin view/scope closure, new912PNG/D/P bindings, terminal material routes and final owner-page dual description review.'}
final=OUT/'actual-current125-qualified-performance125-KEEP-open0-Montan-cycle-EU-three-successor-v5.receipt.json'
with final.open('x') as f:f.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':bind(final),'qualifiedWholePerformanceCounts':counts,'newQualifiedSourcePerformanceClosures':3,'wholeSourceCourseOrNativeMappingApproved':False,'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0}))
