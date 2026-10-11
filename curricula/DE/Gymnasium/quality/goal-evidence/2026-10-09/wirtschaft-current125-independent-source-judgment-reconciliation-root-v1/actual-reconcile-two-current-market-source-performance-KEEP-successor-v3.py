from copy import deepcopy
from collections import Counter
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import subprocess

ROOT=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file() and (p/'curricula').is_dir())
OUT=Path(__file__).resolve().parent
FOREIGN=OUT.parent/'wirtschaft-BE-market02-current2026-P981-P4-and-two-source-unions-independent-bounded-review-v1'
OLD=OUT/'actual-current125-qualified-P13-series-marketing-and-P981-temporal-boundary-successor-v2.json'
NEW=FOREIGN/'two-individual-whole-current-source-facet-performance-union-KEEP-judgments.json'
RECEIPT=FOREIGN/'actual-final-independent-current2026-P981-P4-and-two-whole-source-performance-unions-KEEP.receipt.json'


def bind(p):
    raw=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+sha256(raw).hexdigest(),'bytes':len(raw)}


old=json.loads(OLD.read_text())
source=ROOT/old['currentSource']['path']
inputs=[OLD,NEW,RECEIPT,source,ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']
guards=[bind(p) for p in inputs]
assert bind(OLD)['sha256']=='sha256:80280baab7e187ede2b651f76bd815705e47bb11bcdd37dc3ad8b8fa2cef7c36'
assert bind(NEW)['sha256']=='sha256:9ba6878166a1214190b33a35e7207e0e0f73b935e278a0dfb76bec37830e2e6b'
assert bind(RECEIPT)['sha256']=='sha256:12554875d82c2adcae94a146dfe8b98b1358ec15535cd6ebb98397d85336f312'
assert bind(source)['sha256']==old['currentSource']['sha256']
source_rows={g['id']:g for g in json.loads(source.read_text())['sourceGoals']}
assert len(source_rows)==len(old['rows'])==125
for row in old['rows']:
    raw=json.dumps(source_rows[row['sourceAspectId']],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()
    assert 'sha256:'+sha256(raw).hexdigest()==row['currentWholeRow']['rowSha256']
judgments=json.loads(NEW.read_text())['judgments']
assert len(judgments)==2
current=deepcopy(old)
by_id={row['sourceAspectId']:row for row in current['rows']}
changed=[]
for judgment in judgments:
    target=judgment['sourceAspectId'];row=by_id[target]
    assert row['currentBoundedPerformanceUnionDecision']=='REVISE' and judgment['decision']=='KEEP'
    assert judgment['wholeExactCurrentV6SourceRow']==source_rows[target]
    assert judgment['decisionScope']=='ONLY_CURRENT_BOUNDED_WHOLE_SOURCE_FACET_PERFORMANCE_UNION_CONTENT'
    assert judgment['wholeSource125CoverageApproved'] is False and judgment['wholeCourseApproved'] is False
    row['currentBoundedPerformanceUnionDecision']='KEEP'
    row['lineage'].append({'wholeIndependentJudgmentFile':bind(NEW),'independentFinalReceipt':bind(RECEIPT),
                           'sourceAspectId':target,'decision':'KEEP','priorIndependentDecision':'REVISE',
                           'acceptedWholePerformanceUnionGoalIds':judgment['acceptedWholePerformanceUnionGoalIds'],
                           'currentnessLimit':judgment['currentnessLimit']})
    row['wholePerformanceReasonDe']=judgment['wholePerformanceComparisonDe']
    row['remainingPerformanceDe']=judgment['remainingWholeSourcePerformance']
    row['explicitTrueCourseRoleQualifier']['specificWholeRoleConstraintDe']='Der aktuelle begrenzte ganze Source-Leistungsunion ist unabhängig KEEP. Kanonische Targetrollen, native Mappingentscheidung und ganze Kursfreigabe bleiben getrennt offen; keine Rollenableitung ausTags/Phase oder anderem Kurs.'
    row['explicitTrueCourseRoleQualifier']['actualCurrentIndependentSourcePerformanceCourseEvidence']=judgment['trueBoundedCourseEvidence']
    assert not row['nativeMappedDecisionApproved'] and not row['normativeWholeCourseApproved'] and not row['whole125CoverageApproved']
    changed.append(target)
assert all(row==by_id[row['sourceAspectId']] for row in old['rows'] if row['sourceAspectId'] not in changed)
counts=dict(Counter(row['currentBoundedPerformanceUnionDecision'] for row in current['rows']))
assert counts=={'KEEP':120,'BLOCK':5}
current.update({'at':datetime.now(timezone.utc).isoformat(),
                'kind':'Current-ID-qualified reconciliation of two actual independently reviewed2026Source-performance unions; not a fresh Root subject review, native mapping or whole-course approval.',
                'counts':counts,'previousLedger':bind(OLD),'newUniqueQualifiedSourcePerformanceClosures':17,
                'thisPackageNewQualifiedSourcePerformanceClosures':2,'openSourceRows':5,
                'actualWholeRowsExactAcrossAllInputReviews':True,'nativeMappedDecisionApproved':False,
                'whole125CoverageApproved':False,'normativeWholeCourseApproved':False,
                'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0})
target=OUT/'actual-current125-qualified-current2026-P981-P4-two-market-source-unions-successor-v3.json'
assert not target.exists();target.write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n');json.loads(target.read_text())
assert guards==[bind(p) for p in inputs]
ignored=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in inputs+[target]],cwd=ROOT,capture_output=True,text=True)
assert ignored.returncode in [0,1] and not ignored.stdout.strip()
receipt={'schemaVersion':1,'createdAt':datetime.now(timezone.utc).isoformat(),'reconciler':'/root',
         'scope':'Qualified current-source performance metadata only; independently accepted new actual P4/current problem closes exactly2previous Source-performance gaps.',
         'actualCurrentSource':bind(source),'originalWhole125JudgmentLedger':bind(OLD),'actualForeignWhole2Judgments':bind(NEW),
         'actualForeignFinalReceipt':bind(RECEIPT),'newQualifiedWhole125Ledger':bind(target),
         'currentWholeSourceRows':125,'wholeRowHashesActuallyVerified':125,'unaffectedWholeJudgmentRowsExact':123,
         'changedCurrentSourceAspectIds':changed,'counts':counts,'openSourceRows':[{'sourceAspectId':r['sourceAspectId'],'decision':r['currentBoundedPerformanceUnionDecision'],'remainingPerformanceDe':r['remainingPerformanceDe']} for r in current['rows'] if r['currentBoundedPerformanceUnionDecision']!='KEEP'],
         'newQualifiedSourcePerformanceClosuresThisPackage':2,'totalQualifiedSourcePerformanceClosuresSince103Baseline':17,
         'originalCurrentSourceRowsAndGoalBytesExact':True,'nativeMappedDecisionApproved':False,'wholeSource125CoverageApproved':False,
         'wholeCanonicalCourseTargetRolesApproved':False,'humanReview':'pending','humanRelease':'pending','liveWrites':False,
         'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,
         'strictBefore':{'closed':300,'total':311},'strictAfter':{'closed':300,'total':311},
         'nextStep':'Independently inspect actual E-model/household P8 andSource2 successors; complete remaining Personnel/Cycle/EU performances, then explicit current native mapping/whole-course integration.'}
p=OUT/'actual-current125-qualified-performance120-KEEP-open5-current-market-two-successor-v3.receipt.json';assert not p.exists();p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':bind(p),'counts':counts,'newQualifiedSourceClosures':2,'openSourceRows':5,'newStrictClosures':0,'restoredStrictBindings':0,'strictNetGain':0},ensure_ascii=False))
