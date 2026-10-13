"""Apache-2.0. Exact bounded output validation and seal; no review votes."""
from pathlib import Path
import copy, datetime, hashlib, json, stat
R=Path('/home/enpasos/projects/skillpilot')
NAME='chemie-aromatics20-bounded-source-and-operator-remediation-author-20261013-v4'
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';O=E/NAME
B=E/'chemie-aromatics-dyes20-current231-scientific-author-20261013-v1'
C=R/'tmp'/NAME/'private-parent'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p):return str(Path(p).relative_to(R))
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def binding(p):return {'path':rel(p),'sha256':sha(p)}
now=datetime.datetime.now(datetime.timezone.utc).isoformat();errors=[]
initial=read(O/'inputs/actual-initial-parent-CAS.json');cas=[]
for b in initial['bindings']:
    actual=sha(R/b['path']);ok=actual==b['sha256'];cas.append(dict(**b,actualSHA256=actual,unchanged=ok))
    if not ok:errors.append('parent drift '+b['path'])
sources=read(O/'author/source-successor-bindings.author.json')['successors']
mp=read(O/'author/exact18-component-mapping-patches.author.json')['patches'];ep=read(O/'author/exact-source-extraction-literal-scope-patches.author.json')['patches']
closure=[]
for s in sources:
    before=read(R/s['parent']['path']);after=read(R/s['candidate']['path']);p=s['parent']['path']
    if sha(R/s['parent']['path'])!=s['parent']['sha256'] or sha(R/s['candidate']['path'])!=s['candidate']['sha256']:errors.append('source SHA '+p)
    if s['kind']=='extraction':
        expected=copy.deepcopy(before)
        for patch in [x for x in ep if x['extractionPath']==p]:
            ix=next(i for i,g in enumerate(expected['sourceGoals']) if g['id']==patch['sourceGoalId']);assert expected['sourceGoals'][ix]==patch['before'];expected['sourceGoals'][ix]=patch['after']
        if expected!=after:errors.append('unexpected extraction delta '+p)
        if [g['id'] for g in before['sourceGoals']]!=[g['id'] for g in after['sourceGoals']]:errors.append('source IDs '+p)
    else:
        expected=copy.deepcopy(before);relevant=[x for x in mp if x['mappingPath']==p]
        for patch in relevant:
            expected['mappings']=[m for m in expected['mappings'] if m not in patch['removedExactMappingRows']]
            ix=next(i for i,d in enumerate(expected['decisions']) if d['sourceGoalId']==patch['sourceGoalId']);assert expected['decisions'][ix]==patch['beforeDecision'];expected['decisions'][ix]=patch['afterDecision']
        expected['sourceExtractionPath']=after['sourceExtractionPath'];expected['authorAromatics20Successor']=after['authorAromatics20Successor']
        if expected!=after:errors.append('unexpected mapping delta '+p)
        for d in after['decisions']:
            rows={m['canonicalGoalId'] for m in after['mappings'] if m['legacyGoalId']==d['sourceGoalId']}
            if rows!=set(d['canonicalGoalIds']):errors.append('mapping-decision component mismatch '+d['sourceGoalId'])
        if not (R/after['sourceExtractionPath']).is_file():errors.append('candidate extraction route '+p)
    closure.append(dict(parent=s['parent'],candidate=s['candidate'],onlyExactDeclaredComponentsChanged=True,wholeSourceScientificallyApproved=False))
oldcases=read(B/'author/whole40.expanded-cases.author.json')['cases'];cases=read(O/'author/whole40.expanded-cases.author.json')['cases'];oldprofs=read(B/'author/whole20.profile-payloads.author.json')['profiles'];profs=read(O/'author/whole20.profile-payloads.author.json')['profiles']
changed=[c['caseId'] for c in cases if c!=next(x for x in oldcases if x['caseId']==c['caseId'])]
if changed!=['4b9810b0-case-1','4b9810b0-case-2']:errors.append('unexpected case delta')
profilechanged=[p['goalId'] for p in profs if p!=next(x for x in oldprofs if x['goalId']==p['goalId'])]
if profilechanged!=['4b9810b0-5d3d-59d8-a948-c3f6dd6303c7']:errors.append('unexpected profile delta')
audit=read(B/'author/whole40.author-scientific-selfaudit.json')['records']
newaudit=[]
for c in cases:
    row=copy.deepcopy(next(x for x in audit if x['caseId']==c['caseId']))
    if c['caseId'] in changed:
        row['scientificFocus']+=' Added real source research supports the exact existing acid/base comparisons; source concepts were actually checked at OpenStax17.2/20.4/24.4. Given approximate numbers remain teaching assumptions, not alleged reference measurements. Source access must be located and explained; no model access date or fictional learner performance.'
        row['authorReadInThisSuccessor']=['complete DE/EN task+data+model+rubric','explicit source access clause','actual linked reference sections','exact research demand span','no laboratory or learner-access claim']
    else:
        row['authorReadInThisSuccessor']=['actual complete case equality with previously authored/read sealed case','all task-span/brief/profile joins'];row['retainedOriginalPersonalScientificReadBinding']=binding(B/'author/whole40.author-scientific-selfaudit.json')
    row['successorCaseChanged']=c['caseId'] in changed;row['realLearnerResearchPerformed']=False;row['independentJudgment']=False
    for cr in c['rubric']:
        for lang in ['De','En']:
            span=cr['taskSpan'+lang]
            if c['task'+lang][span['start']:span['end']]!=cr['taskClause'+lang]:errors.append('printed task-span mismatch '+cr['criterionId'])
    newaudit.append(row)
write(O/'author/whole40.author-scientific-selfaudit.json',dict(schemaVersion=1,records=newaudit,criteria=86,changedWholeCases=2,retainedWholeCases=38,scientificStrictGain=0,independentReviews=0))
(O/'author/whole40.author-scientific-selfaudit.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n'for x in newaudit))
images=read(O/'author/exact17-retained-and-selected3-image-bindings.author.json');ib=[]
for row in images['retained17']:
    for b in row['bindings']:
        if sha(R/b['path'])!=b['sha256']:errors.append('retained17 image drift '+b['path'])
    ib.append(dict(goalId=row['goalId'],retainedActiveTripleExact=True,newImage=False))
for row in images['selected3']:
    hashes=[sha(R/x['path']) for x in row['candidateCopies']]
    if any(h!=row['original']['sha256'] for h in hashes):errors.append('selected3 image drift '+row['goalId'])
    ib.append(dict(goalId=row['goalId'],selectedNewTripleExact=True,sha256=row['original']['sha256'],newImage=False))
allfiles=[p for p in O.rglob('*') if p.is_file()]
bad=[rel(p) for p in [O,*O.rglob('*'),C,*C.rglob('*')] if p.is_symlink() or (p.is_file() and p.stat().st_nlink!=1)]
if bad:errors.append('alias paths '+str(bad))
guards=dict(schemaVersion=1,atUTC=now,currentCanonicalSHA256=sha(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),parentCAS=cas,sourceSuccessorClosure=closure,imageRetention=ib,symlinkOrHardlinkPaths=bad,errors=errors,passed=not errors,scientificStrictGain=0,independentVotes=0,activeWrites=False)
write(O/'checks/actual-final-parent-CAS-component-case-image-alias-closure.json',guards)
if errors:raise SystemExit(json.dumps(errors))
future=dict(schemaVersion=1,authorPackage=NAME,status='sealed_inactive_bounded_author_candidate_needs_independent_review',priorAuthorSeal=binding(B/'FINAL.author20-candidate.freeze.json'),canonicalInput=initial['bindings'][0] if initial['bindings'][0]['path'].endswith('DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json') else binding(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),bodyPatch=binding(O/'author/exact-two-goal-body-field-patches.author.json'),wholeCanonicalSpecimen=binding(O/'author/canonical-whole523.two-body-three-link.author-candidate.json'),mappingComponentPatches=binding(O/'author/exact18-component-mapping-patches.author.json'),extractionComponentPatches=binding(O/'author/exact-source-extraction-literal-scope-patches.author.json'),sourceSuccessors=binding(O/'author/source-successor-bindings.author.json'),supplementalExistingPartnerProposals=binding(O/'author/supplemental12-existing-SekI-partner-edges.author-proposals.json'),remainingSourceLimits=binding(O/'author/actual19-remediation-and-residual-scope-limits.author.json'),wholeCases=binding(O/'author/whole40.expanded-cases.author.json'),profiles=binding(O/'author/whole20.profile-payloads.author.json'),normalP20=binding(O/'author/P20.normal-v2.author-candidates.jsonl'),A20Pending=binding(O/'author/A20.normal-author-candidates.jsonl'),M18Retained2Pending=binding(O/'author/M20.author-successor-pending2-retained18.jsonl'),selectedImageBindings=binding(O/'author/exact17-retained-and-selected3-image-bindings.author.json'),impactMatrix=binding(O/'author/per-goal20.scientific-impact-matrix.author.json'),bindingClosure=binding(O/'checks/actual-P-A-M-case-resource-binding-closure.json'),finalCASClosure=binding(O/'checks/actual-final-parent-CAS-component-case-image-alias-closure.json'),privateProductionParent=rel(C),unchangedWholeCases=38,changedWholeCases=2,changedProfiles=1,changedGoalBodies=2,bodyChangedFields=3,mappingDecisions=18,removedInScopeMappingEdges=21,sourceExtractionRows=38,optionalSupplementalExistingPartnerEdges=12,goalFingerprintDeltas=2,profileFingerprintDeltas=1,resourceInputFingerprintDeltas=5,canonicalNodes=523,curricularAtomic=402,currentStrictPreserved=231,newScientificStrictGain=0,newIndependentVotes=0,humanApproval=False,actualLaboratoryExecution=False,actualLearnerResearchExecution=False,activationPayloads=[],rootInstruction='Merge exact components with source-worker TH/RP proposals; whole mapping/canonical files are private review specimens. Independently review body/source/operator/atomicity and changed M decisions before root stabilization and native integration. No whole-source or course/body entitlement inferred from lexical mention, generic partner, raw-hash match, or authored-view fallback.')
write(O/'AUTHOR.future-inputs.additive.json',future)
write(O/'checks/actual-private-production-parent-file-bindings.json',dict(schemaVersion=1,root=rel(C),allParentsRegular=True,symlinks=[],hardlinks=[],files=[dict(**binding(p),bytes=p.stat().st_size)for p in sorted(C.rglob('*'))if p.is_file()],noActiveWriteThrough=True))
files=[dict(**binding(p),bytes=p.stat().st_size)for p in sorted(O.rglob('*'))if p.is_file() and p.name!='FINAL.bounded-source-operator-author.freeze.json']
seal=dict(schemaVersion=1,authorPackage=NAME,sealedAtUTC=now,kind='immutable_author_candidate_only',files=files,fileCount=len(files),newIndependentVotes=0,newScientificStrictGain=0,activeWrites=False,humanApproval=False,wholeCompoundSourceCleared=False)
write(O/'FINAL.bounded-source-operator-author.freeze.json',seal)
for p in O.rglob('*'):
    if p.is_file():p.chmod(0o444)
print(json.dumps({'seal':binding(O/'FINAL.bounded-source-operator-author.freeze.json'),'files':len(files),'allExactChecksPassed':True,'normalP20Pending':20,'A20Pending':20,'MrawRetained18':18,'Mpending2':2,'newScientificStrictGain':0}))
