from collections import Counter
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json
import subprocess

OUT = Path(__file__).resolve().parent
ROOT = next(p for p in OUT.parents if (p/'AGENTS.md').is_file() and (p/'curricula').is_dir())
REVIEW = OUT.parent/'wirtschaft-two-E-source-rests-independent-whole-performance-root-v1'
OLD = OUT/'actual-current125-qualified-current2026-P981-P4-two-market-source-unions-successor-v3.json'
NEW = REVIEW/'two-individual-whole-current-E-source-performance-union-KEEP-judgments.json'
FINAL = REVIEW/'actual-final-independent-two-E-P8-four-new-cases-and-two-source-performance-unions-KEEP.receipt.json'
def bind(p):
    return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+sha256(p.read_bytes()).hexdigest()}
old = json.loads(OLD.read_text())
source = ROOT/old['currentSource']['path']
inputs = [OLD, NEW, FINAL, source, ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']
guards = [bind(p) for p in inputs]
assert bind(source)['sha256'] == old['currentSource']['sha256']
sources = {s['id']:s for s in json.loads(source.read_text())['sourceGoals']}
assert len(sources) == len(old['rows']) == 125
for row in old['rows']:
    assert row['currentWholeRow']['rowSha256'] == 'sha256:'+sha256(json.dumps(sources[row['sourceAspectId']],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
current = deepcopy(old)
rows = {r['sourceAspectId']:r for r in current['rows']}
judgments = json.loads(NEW.read_text())
changed=[]
for j in judgments:
    row=rows[j['sourceGoalId']]
    assert row['currentBoundedPerformanceUnionDecision']=='BLOCK' and j['decision']=='KEEP'
    assert j['wholeCurrentSourceRow']==sources[j['sourceGoalId']]
    assert j['sourcePerformanceApproved'] and not j['normativeWholeCourseApproved'] and not j['targetRolesApproved'] and not j['nativeMappedDecisionApproved']
    row['currentBoundedPerformanceUnionDecision']='KEEP'
    row['lineage'].append({'wholeIndependentJudgmentFile':bind(NEW),'independentFinalReceipt':bind(FINAL),'sourceAspectId':j['sourceGoalId'],'decision':'KEEP','priorIndependentDecision':'BLOCK','acceptedWholePerformanceUnionGoalIds':j['canonicalGoalIds'],'wholePRecordBinding':j['wholePRecordBinding'],'qualifiedPerformanceOnly':True})
    row['wholePerformanceReasonDe']=j['reasonDe']
    row['remainingPerformanceDe']='Keine weitere fachliche Restleistung in genau dem unabhängig gelesenen E-Quellenaspekt erkannt. Ganze kanonische Targetrollen, Quellenmapping und Kursfreigabe bleiben getrennt offen.'
    qualifier=row['explicitTrueCourseRoleQualifier'] or {}
    qualifier.update({'actualCurrentIndependentSourcePerformanceCourseEvidence':j['explicitSourceScope'],'specificWholeRoleConstraintDe':'Die E-Quellenleistung ist unabhängig KEEP. Die ganze bestehende Modellzielrolle wird gesondert an den quellengestützten E/GK/LK-Platzierungen geprüft; AB3 und kanonische KompatibilitätsphaseQ ersetzen diesen Nachweis nicht. Keine ganze Kurs- oder native Mappingfreigabe.'})
    row['explicitTrueCourseRoleQualifier']=qualifier
    changed.append(j['sourceGoalId'])
assert len(changed)==2
assert all(row==rows[row['sourceAspectId']] for row in old['rows'] if row['sourceAspectId'] not in changed)
counts=dict(Counter(r['currentBoundedPerformanceUnionDecision'] for r in current['rows']))
assert counts=={'KEEP':122,'BLOCK':3},counts
current.update({'at':datetime.now(timezone.utc).isoformat(),'kind':'Current-ID-qualified reconciliation of two independently reviewed whole E-source-performance unions, with explicit whole-goal/course-role boundaries.','previousLedger':bind(OLD),'counts':counts,'newUniqueQualifiedSourcePerformanceClosures':19,'thisPackageNewQualifiedSourcePerformanceClosures':2,'openSourceRows':3,'nativeMappedDecisionApproved':False,'whole125CoverageApproved':False,'normativeWholeCourseApproved':False,'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0})
target=OUT/'actual-current125-qualified-E-own-model-household-P8-two-source-unions-successor-v4.json'
with target.open('x') as f:f.write(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
assert guards==[bind(p) for p in inputs]
ignored=subprocess.run(['git','check-ignore','--no-index','--']+[str(p.relative_to(ROOT)) for p in inputs+[target]],cwd=ROOT,capture_output=True,text=True)
assert ignored.returncode in (0,1) and not ignored.stdout.strip(),ignored.stdout
receipt={'at':datetime.now(timezone.utc).isoformat(),'reconciler':'/root','scope':'Qualified current whole source-performance ledger only.','frozenInputs':guards,'newLedger':bind(target),'wholeSourceRowsActuallyVerified':125,'unaffectedWholeJudgmentRowsExact':123,'changedCurrentSourceAspectIds':changed,'counts':counts,'openSourceRows':[{'sourceAspectId':r['sourceAspectId'],'decision':r['currentBoundedPerformanceUnionDecision'],'remainingPerformanceDe':r['remainingPerformanceDe']} for r in current['rows'] if r['currentBoundedPerformanceUnionDecision']!='KEEP'],'newQualifiedSourcePerformanceClosuresThisPackage':2,'totalQualifiedSourcePerformanceClosuresSince103Baseline':19,'source125WholeBytesUnchanged':True,'liveGoalBytesUnchanged':True,'whole125CoverageApproved':False,'nativeMappedDecisionApproved':False,'wholeCanonicalCourseTargetRolesApproved':False,'humanApproval':False,'strictBefore':{'closed':300,'total':311},'strictAfter':{'closed':300,'total':311},'newStrictAcademicClosures':0,'restoredStrictBindings':0,'strictNetGain':0,'nextStep':'Complete independent Montan/Cycle/EU Source3 performance review and separately resolve actual whole-goal E/GK/LK roles before source/course integration.'}
final=OUT/'actual-current125-qualified-performance122-KEEP-open3-current-E-two-successor-v4.receipt.json'
with final.open('x') as f:f.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':bind(final),'counts':counts,'newQualifiedSourcePerformanceClosures':2,'openSourceRows':3,'newStrictClosures':0,'restoredStrictBindings':0,'strictNetGain':0}))
