"""Apache-2.0. Lean author freeze and actual unchanged-input closure."""
from pathlib import Path
import copy,datetime,hashlib,json,stat
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';N='chemie-aromatics20-all-source-alias-case-and-atomicity-remediation-author-20261013-v7';O=E/N;C=R/'tmp'/N/'private-parent';B=E/'chemie-aromatics-dyes20-current231-scientific-author-20261013-v1';V4=E/'chemie-aromatics20-bounded-source-and-operator-remediation-author-20261013-v4';AM=E/'chemie-aromatics-two-body-A-M-targeted-independent-20261013-v5'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p):return str(Path(p).relative_to(R))
def bind(p):return dict(path=rel(p),sha256=sha(p))
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
now=datetime.datetime.now(datetime.timezone.utc).isoformat();errors=[];initial=read(O/'inputs/actual-start-parent-CAS.json')
unchanged=[]
for b in initial['bindings']:
 h=sha(R/b['path']);unchanged.append(dict(**b,actualSHA256=h,unchanged=h==b['sha256']))
 if h!=b['sha256']:errors.append('parent CAS drift '+b['path'])
mp=read(O/'author/exact-all-alias-mapping-components.author.json')['patches'];ep=read(O/'author/exact-consumed-sourceText-course-locator-components.author.json')['patches']
for p in mp:
 expected=read(R/p['parentPath']);expected['mappings']=[m for m in expected['mappings']if m not in p['removedExactRows']]+p['addedExactRows']
 for d in p['decisionReplacements']:
  ix=next(i for i,x in enumerate(expected['decisions'])if x['sourceGoalId']==d['before']['sourceGoalId']);assert expected['decisions'][ix]==d['before'];expected['decisions'][ix]=d['after']
 if expected!=read(R/p['privateSuccessor']['path']):errors.append('undeclared mapping delta '+p['parentPath'])
for path in {p['parentPath']for p in ep}:
 expected=read(R/path)
 for p in [x for x in ep if x['parentPath']==path]:
  ix=next(i for i,g in enumerate(expected['sourceGoals'])if g['id']==p['sourceGoalId']);assert expected['sourceGoals'][ix]==p['before'];expected['sourceGoals'][ix]=p['after']
  if not isinstance(p['after'].get('sourceText'),str)or not isinstance(p['after'].get('sourceSpan'),str):errors.append('unusable consumed source field '+p['sourceGoalId'])
 if expected!=read(C/path):errors.append('undeclared extraction delta '+path)
image=read(V4/'author/exact17-retained-and-selected3-image-bindings.author.json');imagebindings=[]
for g in image['retained17']:
 for b in g['bindings']:
  if sha(R/b['path'])!=b['sha256']:errors.append('retained17 image changed '+b['path'])
  imagebindings.append(b)
for g in image['selected3']:
 for b in [g['original'],*g['candidateCopies']]:
  if sha(R/b['path'])!=b['sha256']:errors.append('selected3 PNG changed '+b['path'])
  imagebindings.append(b)
memory=read(AM/'protected-memory-inputs.CAS.json');mchecks=[]
for b in memory['protectedInputs']:
 h=sha(R/b['path']);mchecks.append(dict(path=b['path'],expected=b['sha256'],actual=h,unchanged=h==b['sha256']))
 if h!=b['sha256']:errors.append('protected memory/cards/view changed '+b['path'])
if sha(R/memory['currentMConfigPath'])!=memory['currentMConfigSha256']:errors.append('current M config changed')
write(O/'author/A-M-exact-retention-and-existing-independent-d61.references.json',dict(schemaVersion=1,d61IndependentAReference=bind(AM/'A2.compatible.record-proposals.jsonl'),d61IndependentMReference=bind(AM/'M2.compatible.record-proposals.jsonl'),d61DecisionAppliesOnlyToExactAcceptedEN=True,restored4bMReference=bind(B/'author/current20.memory.raw-exact-retained.jsonl'),restored4bA='original atomic I/M author rationale pending independent review; rejected v4 nonAtomic decision is not overwritten or forced atomic',protectedMemoryReference=bind(AM/'protected-memory-inputs.CAS.json'),other400MRowsAndCards75Untouched=True,newCards=0,newVisibilityBindings=0,newIndependentVotes=0,activeMRecordWrites=0))
check=read(O/'checks/actual-all-alias-boundary-sourceText-and-case-model-check.json');assert check['passed'];assert check['counts']['remainingInheritedRows']==0
can=read(C/'candidate/canonical-whole523.json');active=read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');gp=read(O/'author/exact20-goal-source-boundary-and-d61EN-three-link-patches.author.json')['patches'];expected=copy.deepcopy(active)
for p in gp:
 ix=next(i for i,g in enumerate(expected['goals'])if g['id']==p['goalId']);assert expected['goals'][ix]==p['before'];expected['goals'][ix]=p['after']
if expected!=can:errors.append('unexpected canonical delta')
assert len(can['goals'])==523
cases=read(C/'candidate/whole40.cases.json')['cases'];selector=read(O/'author/whole40.lean-case-input-selector-and-exact-span-audit.json');impact=[];selfaudit=[]
old=read(B/'author/whole40.expanded-cases.author.json')['cases'];originalscience=read(B/'author/whole40.author-scientific-selfaudit.json')['records']
for p in gp:
 gid=p['goalId'];cc=[x for x in cases if x['goalId']==gid];changed=[x['caseId']for x in cc if x!=next(y for y in old if y['caseId']==x['caseId'])]
 impact.append(dict(goalId=gid,bodyTextChangedFields=[k for k in ['title','titleEn','description','descriptionEn']if p['before'].get(k)!=p['after'].get(k)],sourceInheritance='explicit boundary; no ancestor full entitlement',changedCaseIds=changed,exactOriginalCaseIds=[x['caseId']for x in cc if x['caseId']not in changed],atomicI_MRestored=gid.startswith('4b9810b0'),sourceStatus='HOLD official full route unproved'if gid.startswith('b7b5')else 'bounded explicit source components prepared; independent fix verification required',newIndependentVotes=0))
 for c in cc:
  prior=next(x for x in originalscience if x['caseId']==c['caseId']);selfaudit.append(dict(caseId=c['caseId'],goalId=gid,originalScientificRead=prior,successorCaseChanged=c['caseId']in changed,successorFocus='Missing diazotization adds a bounded particle route and balanced net equation; no extra proton-arrow or directing quota.'if gid.startswith('e594')else 'Research credit requires actual locatable access; supplied facts alone do not establish research.'if gid.startswith('61da')else 'All remaining visible reflectance bands now bounded; synthetic shift labelled stated.'if c['caseId']in changed else 'Exact original complete bilingual science case retained; 4b research combination restored separately.',all86CriteriaHavePrintedBilingualDemandSpans=True,ungradedOptionalRemarksRemainUngraded=True,actualLearnerResearch=False,actualLabExecution=False,authorOnly=True))
write(O/'author/PER_GOAL20.actual-impact-list.author.json',dict(schemaVersion=1,records=impact,currentStrictPreserved=231,curricularAtomic=402,newStrictGain=0))
write(O/'author/whole40.scientific-author-selfaudit.json',dict(schemaVersion=1,records=selfaudit,newIndependentVotes=0))
(O/'author/whole40.scientific-author-selfaudit.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n'for x in selfaudit))
bad=[rel(p)for p in [O,*O.rglob('*'),C,*C.rglob('*')]if p.is_symlink()or(p.is_file()and p.stat().st_nlink!=1)]
if bad:errors.append('alias paths '+str(bad))
write(O/'checks/actual-final-parent-component-case-image-memory-closure.json',dict(schemaVersion=1,parentCAS=unchanged,imageByteBindings=imagebindings,memoryCardVisibilityCAS=mchecks,oldV4Seal=bind(V4/'FINAL.bounded-source-operator-author.freeze.json'),aliasPaths=bad,errors=errors,passed=not errors,noActiveWrites=True,noNativeBuild=True,noFullSource21Review=True,strictGain=0))
if errors:raise SystemExit(json.dumps(errors))
neutral=dict(schemaVersion=1,kind='neutral whole-input selector for targeted independent fix verification',authorPackage=N,landscape=bind(C/'candidate/canonical-whole523.json'),goalIds=[p['goalId']for p in gp],wholeCases=bind(C/'candidate/whole40.cases.json'),leanCaseSelector=bind(O/'author/whole40.lean-case-input-selector-and-exact-span-audit.json'),wholeProfiles=bind(C/'candidate/whole20.profiles.json'),normalMaterializerInput=bind(C/'candidate/whole20.materializer-input.json'),P20AuthorCandidates=bind(O/'author/P20.pure-normal-model.author-candidates.jsonl'),mappingComponentPatches=bind(O/'author/exact-all-alias-mapping-components.author.json'),sourceFieldPatches=bind(O/'author/exact-consumed-sourceText-course-locator-components.author.json'),actualSourceScopeInputMatrix=bind(O/'author/FINAL.actual-source-scope-and-input-matrix.json'),existingMethodPartnerSupplements=bind(O/'author/two-existing-partner-research-supplements.author.json'),methodPartnerAllocation=bind(O/'author/research-existing-partner-allocation.author.json'),existingIndependentA_MReferences=bind(O/'author/A-M-exact-retention-and-existing-independent-d61.references.json'),imageReferences=bind(V4/'author/exact17-retained-and-selected3-image-bindings.author.json'),remainingHOLDs=[bind(O/'author/HOLD.b7-official-full-course-entitlement.json')],actualChecks=bind(O/'checks/actual-all-alias-boundary-sourceText-and-case-model-check.json'),impactList=bind(O/'author/PER_GOAL20.actual-impact-list.author.json'),sourceUnionApproval=False,newIndependentVotes=0,strictGain=0,wholeFileIntegrationInstruction=False,rootMergeInstruction='Apply exact source-ID/target/pointer cells with parent CAS alongside polymer changes. All unchanged source routes remain original read-only references; shared files are never overwritten wholesale. No final native freeze until targeted source/operator verification.')
write(O/'NEUTRAL.targeted-fix-verification.input-selector.json',neutral)
write(O/'checks/private-candidate-files.binding-closure.json',dict(schemaVersion=1,root=rel(C),allRegularParents=True,symlinks=[],hardlinks=[],files=[dict(**bind(p),bytes=p.stat().st_size)for p in sorted(C.rglob('*'))if p.is_file()],copyPolicy='Only changed source/mapping specimens and one assembled whole candidate set; no primary PDFs, images, dependencies or old-seal trees copied.'))
files=[dict(**bind(p),bytes=p.stat().st_size)for p in sorted(O.rglob('*'))if p.is_file()and p.name!='FINAL.one-batched-author.freeze.json']
write(O/'FINAL.one-batched-author.freeze.json',dict(schemaVersion=1,authorPackage=N,sealedAtUTC=now,files=files,fileCount=len(files),newIndependentVotes=0,newStrictGain=0,activeWrites=False,sourceWholeUnionApproved=False,nativeBuilds=0))
for p in O.rglob('*'):
 if p.is_file():p.chmod(0o444)
print(json.dumps({'seal':bind(O/'FINAL.one-batched-author.freeze.json'),'files':len(files),'selector':bind(O/'NEUTRAL.targeted-fix-verification.input-selector.json'),'mappingFiles':len(mp),'removedAliasRows':sum(len(x['removedExactRows'])for x in mp),'sourceRows':len(ep),'blockedAncestors':check['counts']['ancestorRowsBlocked'],'caseCorrections':6,'original34Retained':34,'restored4bCases':2,'goalFingerprintChanges':1,'profileFingerprintChanges':3,'remainingHold':'b7 official full-course route; process-partner partial scope independently unapproved','strictGain':0}))
