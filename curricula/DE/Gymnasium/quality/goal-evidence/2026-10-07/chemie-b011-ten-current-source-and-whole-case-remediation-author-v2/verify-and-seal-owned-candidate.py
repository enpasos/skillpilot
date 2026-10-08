#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Affected native checks and immutable local author handoff; no active writes."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib,json,subprocess
from jsonschema import Draft202012Validator
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[6]
def sha(b):return hashlib.sha256(b).hexdigest()
def load(p):return json.loads(p.read_text())
def write(p,x):(HERE/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert not (HERE/'author.final.freeze.json').exists(),'Sealed packets are immutable'
guard=load(HERE/'declared-current-input-bindings.actual.json')
for b in guard['inputBindings']:assert sha((ROOT/b['path']).read_bytes())==b['sha256'],b['path']
view_receipt=load(HERE/'native/actual-affected-author-view-preservation.check.json')
for b in view_receipt['actualBindings']:assert 'sha256:'+sha((ROOT/b['path']).read_bytes())==b['sha256'],b['path']
contracts=[]
for f,s in [('native/current482.inert.landscape.json','docs/landscape-runtime.schema.json'),
            ('native/current482.inert.semantic-kinds.json','contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'),
            ('native/positive-two.inactive.config.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')]:
    validator=Draft202012Validator(load(ROOT/s));errors=list(validator.iter_errors(load(HERE/f)))
    assert not errors,(f,[e.message for e in errors]);contracts.append(dict(path=f,schemaPath=s,actualErrors=0))
profile_schema='contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
validator=Draft202012Validator(load(ROOT/profile_schema))
for n,line in enumerate((HERE/'native/positive-two.inactive.records.jsonl').read_text().splitlines(),1):
    record=json.loads(line);errors=list(validator.iter_errors(record));assert not errors,[e.message for e in errors]
    assert record['status']=='needs_human_review' and record['reviewAuthority']=='ai_candidate' and not record['reviewRunIds']
    for c in record['profile']['applicationCaseBriefs']:
        assert 'Erwartet:' not in c['taskDemandDe'] and 'Expected:' not in c['taskDemandEn']
    contracts.append(dict(path='native/positive-two.inactive.records.jsonl',line=n,schemaPath=profile_schema,actualErrors=0))
cfg=str((HERE/'native/positive-two.inactive.config.json').relative_to(ROOT))
cmd=['./app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+cfg,'--mode=check']
result=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True)
(HERE/'native/positive-two.inactive.check.actual.txt').write_text(result.stdout)
(HERE/'native/positive-two.inactive.check.actual.stderr.txt').write_text(result.stderr)
assert result.returncode==0,(result.stdout,result.stderr)
assert 'Approved: 0' in result.stdout and 'Needs human review: 2' in result.stdout and 'Blocking issues: 0' in result.stdout
parsed=[]
for p in sorted(HERE.rglob('*')):
    assert not p.is_symlink(),str(p)
    if p.suffix=='.json':
        x=load(p);parsed.append(str(p.relative_to(HERE)))
        if isinstance(x,dict) and isinstance(x.get('goals'),list):
            # A top-level goals list is only emitted as an actual full landscape,
            # matching the unmodified repository schema validator's contract.
            assert p.name=='current482.inert.landscape.json'
            assert all(k in x for k in ['landscapeId','title','description'])
    elif p.suffix=='.jsonl':
        for l in p.read_text().splitlines():json.loads(l)
for b in guard['inputBindings']:assert sha((ROOT/b['path']).read_bytes())==b['sha256'],b['path']
for b in view_receipt['actualBindings']:assert 'sha256:'+sha((ROOT/b['path']).read_bytes())==b['sha256'],b['path']
page_receipt=load(HERE/'native/current-and-inert-whole-selected-pages-and-contexts.raw.json')
assert page_receipt['bindingOnlyPagePositionChanges']==289
assert len(page_receipt['actualContextChangeGoalIds'])==3
assert page_receipt['protectedCurrentStrictTextGoalsExactlyKept']==173
write('affected-contract-native-and-final-input-preservation.actual.json',dict(
    schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),
    role='actual affected contract/native verification; not independent scientific review',
    closedContractChecks=contracts,actualClosedContractPassCount=len(contracts),
    nativePositiveCommand=cmd,actualNativePositiveExitCode=result.returncode,
    nativePositiveSummary={'configured':2,'approved':0,'needs_human_review':2,'rejected':0,'blockingIssues':0},
    actualDeclaredInputBindingsMatched=len(guard['inputBindings']),actualAffectedViewBindingsMatched=len(view_receipt['actualBindings']),
    actualWholeJsonParseChecks=parsed,symlinks=0,partialTopGoalsWrapperEmitted=False,
    unchangedProtectedStrictGoalTexts=173,trueProtectedContextChanges=page_receipt['protectedGoalContextChangeIds'],
    bindingOnlyPagePositionChanges=289,heldWholeSourceRows=4,boundedOperatorAuthorCandidates=6,
    wholeChildAllNationalSourceBindingsReady=False,scientificApprovals=0,activeBindingRestorations=0,strictNetIncrease=0,
    fullBuildPerformed=False,activeWrites=False,humanApproval=False,humanTrial=False))
files=[]
for p in sorted(HERE.rglob('*')):
    if p.is_file():files.append(dict(path=str(p.relative_to(ROOT)),sha256=sha(p.read_bytes()),bytes=p.stat().st_size))
freeze=dict(schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),
    role='immutable author handoff; candidates and true holds preserved; no independent QA approval',
    ownFolder=str(HERE.relative_to(ROOT)),files=files,
    unchangedCurrentInputs=guard['inputBindings'],unchangedAffectedAuthorViews=view_receipt['actualBindings'],
    newWholeCases=4,boundedWholeOperatorCandidates=6,trueWholeSourceHolds=4,
    wholeChildAllCountrySourceReady=False,newScientificClosures=0,activeBindingRestorations=0,strictNetIncrease=0,
    nextIndependentReviewEntry=str((HERE/'current-own-lineage-and-neutral-review-entry.json').relative_to(ROOT)),
    activeWrites=False,humanApproval=False,humanTrial=False)
write('author.final.freeze.json',freeze)
print(json.dumps(dict(ownedFiles=len(files),inputBindings=len(guard['inputBindings']),affectedViewBindings=len(view_receipt['actualBindings']),
    closedContractPasses=len(contracts),actualNativePExit=result.returncode,scientificApprovals=0,strictNetGain=0,
    freezeSha256=sha((HERE/'author.final.freeze.json').read_bytes()))))
