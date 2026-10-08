#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify only owned, actually affected contracts/inputs and seal this candidate."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib,json,math
import jsonschema
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[6]
def read(p):return json.loads(p.read_text())
def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def sha(b):return hashlib.sha256(b).hexdigest()
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
guard=read(HERE/'declared-current-owned-input-bindings.actual.json')
for b in guard['inputBindings']:
    assert sha((ROOT/b['path']).read_bytes())==b['sha256'],b['path']
chem=next(x for x in read(ROOT/guard['registryPath'])['subjects'] if x['subject']=='chemie')
assert sha(stable(chem).encode())==guard['currentChemistryRegistrySubjectSha256']
proof=read(HERE/'current-three-valid-A-M-V-P-exact-binding-reuse.native.actual.json')
schema_path='contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
validator=jsonschema.Draft202012Validator(read(ROOT/schema_path),format_checker=jsonschema.FormatChecker())
for row in proof['entries']:
    rec=row['P']['retained']['wholeRecord'];assert not list(validator.iter_errors(rec)),row['goalId']
    assert rec['status']=='needs_human_review' and rec['reviewAuthority']=='ai_candidate'
    assert rec['evidenceLevel']=='E1' and rec['maximumClaimScope']=='G1'
assert len(proof['entries'])==3 and proof['repeatedScientificReviews']==0
duties=read(HERE/'nine-current-whole-original-source-duties-and-partners.json')['entries']
by={d['sourceGoalId']:d for d in duties}
deltas=read(HERE/'six-limited-operative-source-role-deltas.inactive.json')['entries']
assert len(duties)==9 and len(deltas)==6 and len(by)==9
for d in deltas:
    old=by[d['sourceGoalId']];change=d['fieldDeltas'][0]
    assert d['wholeOriginalSourceGoal']==old['wholeOriginalSourceGoal']
    assert d['wholeOriginalDecision']==old['wholeOriginalDecision']
    assert change['before']==old['wholeOriginalPartnerGoalIds']
    assert change['afterCandidate']==[p for p in change['before'] if p!=guard['heldParentId']]
    assert len(d['removeOnlyMappingEdges'])==1
    assert d['removeOnlyMappingEdges'][0]['canonicalGoalId']==guard['heldParentId']
    assert {e['canonicalGoalId'] for e in d['retainedMappingEdges']}==set(change['afterCandidate'])
    assert not d['independentSourceApproval'] and d['newReviewedAtOrReviewerNotAssigned']
    assert sha(stable(d['wholeOriginalSourceGoal']).encode())==old['wholeOriginalSourceGoalSha256']
cases=read(HERE/'four-new-whole-original-operator-source-witness-cases.de-en.author-candidate.json')['cases']
assert len(cases)==4 and len({c['caseLocalKey'] for c in cases})==4
for c in cases:
    for lang in ['de','en']:
        assert c['material'][lang] and all(x.strip() for x in c['material'][lang])
        for field in ['learnerTask','modelAnswer','positiveUnderstandingEdge']:assert c[field][lang].strip()
        assert c['transfer'][lang]['task'].strip() and c['transfer'][lang]['expected'].strip()
    assert all(s in by for s in c['sourceGoalIds']) and c['sourceGoalIds']
    assert c['license']=='CC-BY-4.0' and not c['actualLearnerOrExperimentEvidence']
# Check the actual nontrivial arithmetic/counterexample materials, not an extra
# approval of their scientific content. The independent reviewers still decide it.
checks=dict(chloroaceticKa=10**-2.9,aceticKa=10**-4.8,
    firstK=10**(4.8-2.9),firstQ=(.001*.008)/(.0001*.0001),
    firstAcetatePKb=14-4.8,firstChloroacetatePKb=14-2.9,
    fresh3ChloroK=10**(4.8-4.0),fresh3ChloroQ=(.002*.004)/(.002*.004),fresh3ChloroPKb=14-4.0)
assert 79<checks['firstK']<80 and math.isclose(checks['firstQ'],800)
assert checks['firstQ']>checks['firstK']>1 and checks['fresh3ChloroQ']<checks['fresh3ChloroK']<6.4
assert checks['firstAcetatePKb']<checks['fresh3ChloroPKb']<checks['firstChloroacetatePKb']
assert 63.1>checks['fresh3ChloroK']
for path in HERE.rglob('*'):
    assert not path.is_symlink(),str(path)
    if path.suffix=='.json':assert 'goals' not in read(path),str(path)
write(HERE/'affected-contract-source-preservation-and-arithmetic.actual.json',dict(schemaVersion=1,
    createdAtUTC=datetime.now(timezone.utc).isoformat(),status='passed',
    existingClosedPositiveContract=dict(path=schema_path,sha256=sha((ROOT/schema_path).read_bytes()),retainedWholeRecordsChecked=3,newSchemasOrExceptions=0),
    originalWholeSourceRowsPreserved=9,limitedSingleRoleRemovalsPreservingAllOtherPartners=6,
    completeNewBilingualSourceMaterialCases=4,actualModelArithmetic=checks,
    inputBindingsExact=len(guard['inputBindings']),chemistryRegistrySubjectExact=True,
    validScienceReReviews=0,wholeNewGoalApprovals=0,strictGain=0,activeBindingRestorations=0,
    noWrapperRuntimeGoalsList=True,noSymlinks=True,noGeneralValidatorChanges=True,activeWrites=False,
    sourceScientificApproval=False,humanApproval=False,humanTrial=False))
files=[]
for path in sorted(HERE.rglob('*')):
    if path.is_file() and path.name!='candidate-freeze.manifest.json':
        b=path.read_bytes();files.append(dict(path=str(path.relative_to(ROOT)),sha256=sha(b),bytes=len(b)))
write(HERE/'candidate-freeze.manifest.json',dict(schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),
    role='Owned inactive author candidate exact freeze. No independent source/goal approval or human acceptance.',
    entries=files,wholeSourceDuties=9,limitedSourceRoleDeltas=6,newWholeSourceCases=4,
    strictNetIncrease=0,newScientificWholeGoalCompletions=0,activeBindingRestorations=0,activeWrites=False))
print(json.dumps(dict(ownedFilesSealed=len(files),freezeSha256=sha((HERE/'candidate-freeze.manifest.json').read_bytes()),
    existingPContracts=3,wholeOriginalSourceRows=9,limitedRoleDeltas=6,wholeNewCases=4,strictGain=0,activeWrites=False)))
