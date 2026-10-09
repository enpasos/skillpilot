#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Conservatively pair actual independent science judgments; do not activate unresolved candidates."""
import hashlib,json,subprocess,sys
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[7]
OUT=Path(__file__).resolve().parent
BASE=OUT.parent
sys.path.insert(0,str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads(p.read_text())
def write(p,x):
 assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');assert read(p)==x
b=BASE/'biologie-evolution-systematics-behavior-eighteen-whole-independent-b-v1'
c=BASE/'biologie-evolution-systematics-behavior-eighteen-whole-independent-c-v1'
author=BASE/'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
be=b/'completed-eighteen-whole-independent-b.review.entry.json'
ce=c/'completed-whole18-source35-partners30-P18-cases36-independent-c.neutral-integration.entry.json'
bv=b/'eighteen-whole-science-source-P-A-M.independent-b.first.verdict.json'
cv=c/'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json'
bj=read(bv);cj=read(cv)
assert bj['reviewer']!=cj['reviewer']
assert bj['freshPeerResultsReadBeforeThisFirst'] is False
assert bj['authorAMProposalsReadBeforeThisFirst'] is False
br=bj['goals18'];cr=cj['goalDecisions']
assert len(br)==len(cr)==18
assert [r['goalId'] for r in br]==[r['goalId'] for r in cr]
current_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
current=read(current_path);snapshot=read(author/'input/current-canonical479-root23-successor.snapshot.json')
assert current==snapshot and len(current['goals'])==479
raw=read(author/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json')
assert [r['goalId'] for r in br]==raw['selectedGoalIds']
assert len(raw['wholeOriginalSourceDutyRows'])==35
bindings=[be,ce,bv,cv,b/'eighteen-whole-science-source-P-A-M.independent-b.first.freeze.json',c/'whole18-science-source-P.independent-c.scientific-FIRST.freeze.json',b/'completed-eighteen-whole-independent-b.final.freeze.json',c/'completed-whole18-independent-c.final.freeze.json',c/'seven-source-holds.current-operative-vs-material-scope-and-closure-evidence.actual.json',c/'current35-ordinary-source-routes-and-eight-authored-views.actual.json',current_path,author/'input/whole-current18-source35-and-whole-partners30.exact-neutral-input.json']
verified=[];working_cache=[];seen=set()
def verify(x):
 if isinstance(x,dict):
  p=x.get('path');h=x.get('sha256')
  if isinstance(p,str) and isinstance(h,str) and len(h.removeprefix('sha256:'))==64:
   pp=Path(p);pp=pp if pp.is_absolute() else ROOT/pp
   try:r=str(pp.relative_to(ROOT))
   except ValueError:return
   key=(r,h)
   if key not in seen:
    seen.add(key)
    data=pp.read_bytes();assert hashlib.sha256(data).hexdigest()==h.removeprefix('sha256:'),r
    if isinstance(x.get('bytes'),int):assert len(data)==x['bytes'],r
    tracked=subprocess.run(['git','ls-files','--error-unmatch','--',r],cwd=ROOT,capture_output=True).returncode==0
    ignored=subprocess.run(['git','check-ignore','--quiet','--',r],cwd=ROOT).returncode==0 and not tracked
    row={**bind(pp),'alreadyTrackedOrStaged':tracked}
    (working_cache if ignored else verified).append(row)
  for v in x.values():verify(v)
 elif isinstance(x,list):
  for v in x:verify(v)
for p in bindings:
 verify(bind(p));verify(read(p))
assert not curriculum_symlink_errors(ROOT)
first=OUT/'eighteen-genuine-independent-firsts.technical-input.freeze.json'
write(first,{'schemaVersion':1,'role':'Existing actual FIRSTs only, no new independent science verdict','inputs':[bind(p) for p in bindings],'allVerifiedBindings':verified,'declaredWorkingCachesNotOperativeCommittableInputs':working_cache,'normalSymlinkErrors':[]})
pairs=[]
for rb,rc in zip(br,cr):
 holds=[f for f in bj['findings'] if f.get('goalId')==rb['goalId']]
 pairs.append({'ordinal':rb['ordinal'],'goalId':rb['goalId'],'independentBScientificCorrectness':rb['scientificCorrectness'],'independentCDecision':rc['decision'],'wholeOriginalGoalAndProfilesReadByBoth':True,'unresolvedIndependentFindings':holds,'boundedMaterialCandidateAccepted':not holds,'wholeCurrentSourceCourseNativeAndVClosed':False,'strictGain':0})
assert sum(r['boundedMaterialCandidateAccepted'] for r in pairs)==15
# Two material holds and one semantic-atomicity dispute remain conservative open.
result=OUT/'eighteen-whole-P-material-and-source.conservative-independent-pair.actual.json'
write(result,{'schemaVersion':1,'role':'Conservative pairing of independent whole science candidates with all unresolved findings retained','createdAt':datetime.now(timezone.utc).isoformat(),'reviewers':[bj['reviewer'],cj['reviewer']],'firstInputs':bind(first),'wholeGoals':18,'wholeBilingualCases':36,'wholeSourceDuties':35,'wholeOriginalPartners':30,'pairs':pairs,'independentBFindingsUnchanged':bj['findings'],'independentCSourceHoldsUnchanged':cj['sourceAndOperatorHolds'],'boundedPTextSupportedByBothIgnoringSeparateAtomicityHold':16,'fullyUncontestedBoundedMaterialAndSemanticCandidates':15,'unresolvedMaterialFindings':2,'unresolvedAtomicityFinding':1,'unresolvedWholeSourceCourseFindings':7,'sourceHoldsIncludeCurrentOperativeAtlasAndAuthoredViews':True,'normalPAMCLIResultsDoNotResolveScientificHolds':True,'activeWhole479AndCurrent394Unchanged':True,'currentDNativeAndCurrentVRemainPending':True,'strictGain':0,'newScientificM7Closures':0,'restoredM7Bindings':0,'humanApproval':False,'humanTrial':False,'activeWrites':[]})
entry=OUT/'neutral-completed-eighteen-conservative-science-pair.remaining-holds.entry.json'
write(entry,{'schemaVersion':1,'role':'Completed technical pair; whole18 current M7 still open','actualPair':bind(result),'existingIndependentFirstInputFreeze':bind(first),'wholeSourceHoldClosureRequirements':bind(c/'seven-source-holds.current-operative-vs-material-scope-and-closure-evidence.actual.json'),'counts':{'wholeGoals':18,'wholeSourceDuties':35,'wholeOriginalPartners':30,'caseBodies':36,'independentReviewers':2,'uncontestedBoundedPText':16,'uncontestedWithAtomicity':15,'materialHolds':2,'atomicityHolds':1,'sourceCourseHolds':7},'strictGain':0,'humanApproval':False,'humanTrial':False,'activeWrites':[]})
seal=OUT/'eighteen-conservative-science-pair.technical.final.freeze.json'
write(seal,{'schemaVersion':1,'role':'Technical immutable handoff, not new scientific closure','entry':bind(entry),'outputs':[bind(p) for p in sorted(OUT.iterdir()) if p.is_file() and p!=seal],'newScientificM7Closures':0})
print(json.dumps({'entry':bind(entry),'seal':bind(seal),'actualVerifiedBindings':len(verified),'declaredWorkingCaches':len(working_cache),'unresolvedMaterial':2,'unresolvedAtomicity':1,'unresolvedSourceCourse':7,'strictGain':0}))
