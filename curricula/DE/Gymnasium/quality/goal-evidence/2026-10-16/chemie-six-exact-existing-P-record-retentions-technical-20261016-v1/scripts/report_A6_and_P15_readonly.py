import hashlib
import json
from pathlib import Path

ROOT=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-six-exact-existing-P-record-retentions-technical-20261016-v1')
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence')
REUSE=Path('tmp/chemie-m7-resumed-20261016/remaining21-existing-P-reuse-readonly/REPORT.existing-P-reuse-for21.readonly.json')
pins={}
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def pin(p):
    p=Path(p);b=p.read_bytes();v={'path':str(p),'sha256':sha(b),'bytes':len(b)};pins[str(p)]=v;return v
def read(p):pin(p);return json.loads(Path(p).read_text())
def write(name,d):(ROOT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')

reuse=read(REUSE)
origin=read(ROOT/'ORIGIN.six-whole-byte-exact-original-P-lines.json')
ids=set(origin['goalIds'])
fingerprints={x['goalId']:x['currentAFingerprint'] for x in read(ROOT/'checks/READONLY.A6-current-stock-fingerprints.json')['rows']}
mapping=read(BASE/'2026-10-15/chemie-current426-eight-reviewed-inactive-integration-technical-20261016-v1/REBUILD.final-current426-eight-reviewed-inactive-integration.physical-map.json')
owners={}
for configpath in mapping['A406ConfigPaths']:
    c=read(configpath);scope=set(c.get('scope',{}).get('goalIds',[]));p=Path(c['reviewPath']);pin(p)
    for j,line in enumerate(p.read_bytes().splitlines(keepends=True),1):
        if not line.strip():continue
        x=json.loads(line)
        if x.get('goalId') in ids and (not scope or x['goalId'] in scope):
            owners.setdefault(x['goalId'],[]).append({'config':pin(configpath),'source':pin(p),'line':j,'wholeOriginalRecord':x,'wholeLineSha256IncludingOriginalTerminator':sha(line),'currentFingerprintExact':x['fingerprint']==fingerprints[x['goalId']]})

records={}
for rel in [
 '2026-10-12/chemie-q2-naturstoffe-current402-independent-b-20261012-v1/atomicity/A31.independent-b.review.jsonl',
 '2026-10-12/chemie-q2-naturstoffe-current402-independent-a-20261012-v1/atomicity/ORIGINAL.whole31.review.jsonl',
 '2026-10-12/chemie-q2-naturstoffe-current407-independent-b-20261012-v2/atomicity/A29.independent-b.review.jsonl',
 '2026-10-12/chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/atomicity/three.independent-b.review.jsonl',
 '2026-10-12/chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3/atomicity/three.independent-a.retained.review.jsonl',
]:
    p=BASE/rel;pin(p)
    for j,line in enumerate(p.read_bytes().splitlines(keepends=True),1):
        if not line.strip():continue
        x=json.loads(line)
        if x.get('goalId') in ids:
            records.setdefault(x['goalId'],[]).append({'source':pin(p),'line':j,'wholeOriginalRecord':x,'wholeLineSha256IncludingOriginalTerminator':sha(line),'currentFingerprintExact':x['fingerprint']==fingerprints[x['goalId']],'newARecord':False})

# Known latest genuine science: preserve actual positive-profile reasoning as such,
# without recasting a P or D claim as an original A vote.
science_path=BASE/'2026-10-12/chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/positive/P13.targeted-scientific-decisions.original-b.json'
science=read(science_path)
q3={x['goalId']:{'source':pin(science_path),'jsonPointer':f'/rows/{j}','wholeOriginalScienceDecision':x,'isFormalARecord':False,'isNewAFirst':False,'meaning':'Genuine already reviewed whole-goal/profile/case science with relevant competence reasoning; retained under its P identity, not relabelled as an A vote.'} for j,x in enumerate(science['rows']) if x['goalId'] in ids}
matrix_path=BASE/'2026-10-14/chemie-current407-open120-existing-Q2-Q3-Q4-evidence-gap-plan-technical-20261014-v1/MATRIX.current-open-Q2-Q3-existing-genuine-science-and-exact-gaps.actual.json'
matrix=read(matrix_path)
old_routing={x['goalId']:{'source':pin(matrix_path),'jsonPointer':f'/rows/{j}','existingARecordBindings':x.get('existingARecordBindings',[]),'meaning':'Earlier bounded routing inventory found no formal A records for these four. Not a new science review or proof that science is absent.'} for j,x in enumerate(matrix['rows']) if x['goalId'] in ids}
read(BASE/'2026-10-12/chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3/review-a.scientific-votes.original.json')
read(BASE/'2026-10-12/chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3/FINAL.targeted-independent-b.manifest.json')

rows=[]
for i in sorted(ids):
    selected=owners.get(i,[]);found=records.get(i,[])
    if selected:
        status='EXACT_SELECTED_ORIGINAL_A_OWNER_ALREADY_EXISTS'
        note='d8 has an exact selected original A record. Preserve existing owner; no repeat A review and no duplicate materialization.'
    elif found:
        status='EXACT_GENUINE_ORIGINAL_A_ROWS_EXIST_NOT_SELECTED'
        note='c245 has complete genuine independent A31-A/A31-B/A29-B records with exact current fingerprint. Missing selected owner is routing only. No new A review is required by that absence.'
    else:
        status='NO_FORMAL_A_ROW_OR_DISTINCT_A_FIRST_LOCATED_WITHIN_BOUNDED_SEARCH'
        note='Known Q3 successors retain A3 for three different changed goals and do not provide a formal A row for this goal. Genuine whole-goal/profile/case science exists with concrete competence reasoning, preserved below under its original P identity. No distinct explicit A-FIRST was located in these artifacts. This is a missing located A evidence carrier, not proof that historical scientific work is absent; no restart/new A vote is performed.'
    rows.append({'goalId':i,'currentAFingerprint':fingerprints[i],'status':status,'selectedBaselineAOwners':selected,'completeOriginalGenuineARows':found,'originalWholeGoalScienceWithoutRelabelling':q3.get(i),'earlierKnownARouting':old_routing.get(i),'specificRemainingBoundary':note,'newScientificReview':False,'newARecord':False,'newAConfig':False,'HumanApproval':False,'HumanTrial':False})
write('READONLY.A6-existing-genuine-records-and-FIRST-routing.json',{'role':'Bounded read-only A evidence location for retained P6. No A review/check/materialization and no author drafting.','scopeCount':6,'alreadySelectedExactA':sum(bool(x['selectedBaselineAOwners']) for x in rows),'unselectedExactGenuineARowsGoalCount':sum(bool(x['completeOriginalGenuineARows']) and not x['selectedBaselineAOwners'] for x in rows),'fourFormalCarriersNotLocatedMeaning':'The four Q3 goals have genuine already reviewed whole-goal science; no explicit A row or separate A-FIRST was located in the named original/continuation artifacts. No restart requirement is inferred.','rows':rows,'newARecords':0,'newScienceVotes':0,'HumanApproval':False,'HumanTrial':False})

remaining=[]
counts={}
for r in reuse['rows']:
    if r['goalId'] in ids:continue
    counts[r['reuseDisposition']]=counts.get(r['reuseDisposition'],0)+1
    refs=[]
    for p in r['wholeProfileAndBindingReferences']:
        refs.append({k:p[k] for k in ['source','line','reviewId','reviewer','reviewRunIds','currentGoalFingerprintExact','currentReviewInputFingerprintExact','profileSelfFingerprintExact','evidenceLevel','maximumClaimScope']})
    remaining.append({'goalId':r['goalId'],'titleDe':r['titleDe'],'reuseDisposition':r['reuseDisposition'],'wholeProfilesAlreadyExist':r['completeExistingProfileBodyLocated'],'existingProfileRefs':refs,'specificExistingFindingOrBindingNeed':r['specificCurrentReuseBoundaryOrOpenEvidenceFinding'],'newProfileOrScienceRequestedOrPerformed':False})
assert len(remaining)==15
write('READONLY.P15-remaining-existing-evidence-and-concrete-boundaries.json',{'role':'Small residual inventory after exact existing P6 retention; no new authoring or science','origin':pin(REUSE),'removedAsExactRetainedP6':sorted(ids),'remainingCount':15,'counts':counts,'rows':remaining,'registrationGapIsNotScienceGap':True,'sourceRemediationsNotRestarted':True,'newProfiles':0,'newScienceVotes':0,'newNormalPForThese15':0,'HumanApproval':False,'HumanTrial':False})
write('INPUTS.finite-A6-and-P15-readonly-pins.json',{'role':'Finite A6 and P15 located source pins; no hashes-as-science claim','pins':list(pins.values())})
print(json.dumps({'A6':{'selectedExact':1,'unselectedGenuineExact':1,'formalCarrierOrSeparateAFirstNotLocatedInNamedArtifacts':4},'P15':counts,'newARecords':0,'newP15Profiles':0},ensure_ascii=False,indent=2))
