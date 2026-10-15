#!/usr/bin/env python3
"""Complete only this inactive author dossier. No host, source-carrier, or engine writes."""
import collections,copy,datetime,hashlib,importlib.util,json,pathlib,subprocess
import jsonschema

REPO=pathlib.Path('/home/enpasos/projects/skillpilot'); OWN=pathlib.Path(__file__).resolve().parent; REL=OWN.relative_to(REPO)
def read(p):return json.loads((REPO/p).read_text())
def load(p):return read(pathlib.Path(p))
def put(n,d):
 p=OWN/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return str(p.relative_to(REPO))
def binding(p):
 p=pathlib.Path(p);p=p.relative_to(REPO) if p.is_absolute() else p;b=(REPO/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
inputs=load(REL/'INPUTS.exact-whole-material-selection.external-bindings.json'); children=inputs['selectedChildIds'];parents=inputs['selectedParentIds']
base=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-rest6-two-whole-atoms-on-final-source6-current412-minimal-inactive-technical-20261014-v1')
i292=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-source6-current412-five-paired-native-whole-gates-existing287-integration-technical-20261014-v1')
cpath=REL/'candidate/canonical551.prospective419.on-final542.exact-reviewed-NAT9.inactive.json'; c=read(cpath)
def jsonl(p):return [json.loads(x) for x in (REPO/p).read_text().splitlines() if x.strip()]
def raw_lines(p):return (REPO/p).read_bytes().splitlines(keepends=True)
def write_lines(n,lines):
 p=OWN/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b''.join(lines));return str(p.relative_to(REPO))

# Two normal scoped A checks use exact original records and their original distinct review IDs.
a=load(REL/'A/nine-existing-a-records.selection.json'); checks=[]
prior_check_file=OWN/'CHECK.two-normal-stock-A7-A2-current-whole-candidate.actual.json'
prior_checks=json.loads(prior_check_file.read_text()) if prior_check_file.exists() else []
for group,n in [('seven-latest-original-a',7),('two-retained-original-a',2)]:
 p=REL/('A/'+group+'.records.jsonl'); rs=jsonl(p);assert len(rs)==n
 config={'schemaVersion':1,'reviewId':rs[0]['reviewId'],'ruleVersion':rs[0]['ruleVersion'],'landscapeId':c['landscapeId'],
   'landscapePath':str(cpath),'reviewPath':str(p),'scope':{'label':'Existing genuine A records; exact unchanged reviewed children on inactive current551; no new science','leafGoalIds':[r['goalId'] for r in rs]}}
 cp=put('config/A'+str(n)+'.original-records-on-current551.scoped.config.json',config)
 cmd=['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts','--config='+cp,'--mode=check']
 prior=next((x for x in prior_checks if x['command']==cmd and x['exitCode']==0 and (REPO/x['stdoutStderr']).is_file()),None)
 if prior:
  checks.append(prior);continue
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(cmd,cwd=REPO,capture_output=True,text=True)
 lp='receipts/A'+str(n)+'.normal-stock-atomicity.actual.txt';(OWN/lp).parent.mkdir(exist_ok=True);(OWN/lp).write_text(r.stdout+r.stderr)
 checks.append({'gate':'A'+str(n),'command':cmd,'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'stdoutStderr':str(REL/lp),'newScientificVote':False});assert r.returncode==0,r.stdout+r.stderr
put('CHECK.two-normal-stock-A7-A2-current-whole-candidate.actual.json',checks)

# Full scoped M419 proposal: preserve 408 remaining original M412 rows, two genuine Rest2 decisions and nine genuine NAT decisions.
# Only the Rest2 reviewId container alias is mechanical; no scientific field changes.
mcfg=read(i292/'config/M412.existing407-plus-genuine-five.normal-alias.config.json')
oldmlines=raw_lines(pathlib.Path(mcfg['reviewPath']));assert len(oldmlines)==412
kept=[line for line in oldmlines if json.loads(line)['goalId'] not in parents];assert len(kept)==408
restcfg=read(base/'config/M2.existing-genuine-independent-a.new-candidate-address-only.config.json')
restpath=pathlib.Path(restcfg['reviewPath']);rest=jsonl(restpath);assert len(rest)==2
transport=[];restlines=[]
for row in rest:
 after=copy.deepcopy(row);after['reviewId']=mcfg['reviewId'];assert all(after[k]==v for k,v in row.items() if k!='reviewId')
 transport.append({'source':binding(restpath),'beforeWholeRecord':row,'afterWholeRecord':after,'onlyChangedField':'reviewId','newMemoryDecision':False})
 restlines.append((json.dumps(after,ensure_ascii=False,separators=(',',':'))+'\n').encode())
natlines=raw_lines(REL/'M/seven-latest-original-a.records.jsonl')+raw_lines(REL/'M/two-retained-original-a.records.jsonl')
assert len(natlines)==9 and all(json.loads(line)['reviewId']==mcfg['reviewId'] for line in natlines)
mpath=write_lines('M/M419.original408-plus-two-reviewed-Rest-and-nine-reviewed-NAT.candidate.jsonl',kept+restlines+natlines)
allm=jsonl(pathlib.Path(mpath));assert len(allm)==len({r['goalId'] for r in allm})==419
atomicids={r['goalId'] for r in load(REL/'candidate/semantic551.prospective419.existing-paired-kind-science.json')['decisions'] if r['semanticKind']=='curricularAtomic'}
assert {r['goalId'] for r in allm}==atomicids
cards=load(REL/'M/current75.with-two-original-a-retarget-records.other73-whole-exact.candidate.json')
oldcardlines=raw_lines(pathlib.Path(mcfg['cardReviewPath'])); cardpair={r['cardId']:line for line in raw_lines(REL/'M/two-card-retargets.original-independent-a.records.jsonl') for r in [json.loads(line)]}
newcardlines=[cardpair.get(json.loads(line)['cardId'],line) if json.loads(line)['deckId']=='de_gymnasium_chemistry_natural_q2' else line for line in oldcardlines]
assert sum(a!=b for a,b in zip(oldcardlines,newcardlines))==2
cardpath=write_lines('M/current75.other73-original-lines-plus-two-original-a-retarget-lines.candidate.jsonl',newcardlines)
vcas=load(REL/'CAS.current-Chemistry-views-only-four-parent-reference-kinds.NOT-APPLIED.json');vmap={x['original']['path']:x['candidatePath'] for x in vcas['changes']}
mcandidate=copy.deepcopy(mcfg);mcandidate['landscapePath']=str(cpath);mcandidate['reviewPath']=mpath;mcandidate['cardReviewPath']=cardpath;mcandidate['reportPath']=str(REL/'receipts/M419.future-normal-host-check.NOT-EXECUTED.md')
for v in mcandidate['visibilityScopes']:v['viewPath']=vmap.get(v['viewPath'],v['viewPath'])
put('config/M419.exact-original-memory-science-and-all-original-visibility-scopes.UNEXECUTED.inactive.config.json',mcandidate)
put('CAS.M419-existing-science-container-and-operative-selection.NOT-APPLIED.json',{
 'baseMemoryConfig':binding(i292/'config/M412.existing407-plus-genuine-five.normal-alias.config.json'),'base412Records':binding(pathlib.Path(mcfg['reviewPath'])),
 'existing408RecordLinesExact':True,'excludedFourNonAtomicParentsFromOperativeSelectionOnly':parents,
 'originalParentSciencePreservedInBase':True,'nineNATRecordLinesExact':True,'twoRestMechanicalReviewIdContainerAliases':transport,
 'candidateMemoryReviewPath':mpath,'candidate75CardsPath':cardpath,'other73CardRecordLinesExact':True,
 'allOriginal9VisibilityScopesRetained':True,'sourceScopeAndActualAcquisitionHoldsRetained':True,
 'e9MemoryRequiredAndAllOriginalM311ContentRetained':True,'fullM419NormalCheckNotRun':True,
 'reasonNotRun':'Stock reads actual app/public memory decks. This author package cannot mutate H or published/active deck paths. Exact two-card tag staging and a normal all-visibility-scope check are required later; do not fake a public-root or clear the separate 21 acquisition/GOD/4 BB-BE holds.',
 'notApplied':True,'newMemoryScientificDecisions':0})

# Validate the finite formal contracts; no global curriculum checks or build.
schema_checks=[]
for schema_path, paths in [
 ('contracts/goal-evidence/v2/goal-evidence-profile.schema.json',[REL/'P/nine-existing-whole-profile-records.exact.jsonl']),
 ('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',[REL/'candidate/semantic551.prospective419.existing-paired-kind-science.json']),
 ('contracts/curriculum-package/v1/composition-view.schema.json',[pathlib.Path(v['candidatePath']) for v in vcas['changes']]),
 ('docs/landscape-runtime.schema.json',[cpath])]:
 schema=read(pathlib.Path(schema_path));validator=jsonschema.validators.validator_for(schema)(schema)
 for p in paths:
  rows=jsonl(p) if p.suffix=='.jsonl' else [read(p)]
  errors=[{'record':n,'path':'/'.join(map(str,e.absolute_path)),'message':e.message} for n,row in enumerate(rows,1) for e in validator.iter_errors(row)]
  schema_checks.append({'schema':binding(schema_path),'input':binding(p),'records':len(rows),'errors':errors,'pass':not errors})
put('CHECK.finite-P9-kind551-view28-canonical-formal-schemas.actual.json',schema_checks)

# Separate exact course/role and source-cell deltas from an approval of entire original sources.
source=load(REL/'SOURCE.whole-original-cells-all-original-partners-current-carrier-deltas.NO-GRANT.json')
changedcells=[x for x in source['sourceCells'] if not x['sourceCellWholeEqualToHistorical']]
current_changed=[]
for row in source['mappingRows']:
 oldrow=row['wholeOriginalMappingRow']; current=row['wholeCurrentSourceCellMappings'];
 if oldrow not in current:current_changed.append({'historicalRawBindingKey':row['originalRawBindingKey'],'sourceCellKey':row['sourceCellKey'],'wholeOldRow':oldrow,'wholeCurrentSourceCellMappings':current})
views=load(REL/'CHECK.stock-compile-28-affected-Chemistry-views-roles-and-prerequisites.json')
acquisition=[{'scope':v['scope'],'goalId':x['goalId'],'childRole':x['role'],'missingDirectPrerequisites':[p['goalId'] for p in x['directPrerequisites'] if p['role']=='absent']} for v in views['views'] for x in v['childScopes'] if x['role']=='target' and any(p['role']=='absent' for p in x['directPrerequisites'])]
put('HOLD.exact-current-source-course-view-acquisition-and-native-boundaries.json',{
 'wholeSourceApproval':False,'classroomChoiceAsserted':False,'sourceDirectRowsRead':251,'uniqueWholeOriginalSourceCells':229,
 'unchangedSourceCellCount':229-len(changedcells),'exactChangedSourceCells':changedcells,
 'currentMappingChangedRelativeToOriginalParentRowCount':len(current_changed),'currentMappingChanges':current_changed,
 'historicSourceParentUnionRemainsContributionOnly':True,
 'views':{'scopedNATDeltaPass':views['scopedNATDeltaPass'],'fullViewCompilePass':views['fullViewCompilePass'],'preexistingErrorOccurrences':views['preexistingErrorOccurrenceCount'],'remainingErrorOccurrences':views['remainingErrorOccurrenceCount'],'noNewErrors':True},
 'targetedChildrenMissingDirectAcquisitionInCurrentViewOccurrences':acquisition,
 'actualRuntimeRequiresArePreservedNotBlindlyPruned':True,
 'nativeCurrentContextDelta':'cf270 direct prerequisite197bc retains its current whole requires=[62149 aggregate], unlike historical=[e9d]. This author proposal preserves that stronger current dependency to protect197bc and292 accepted bodies. Ordinary current native context binding is not produced by copying historical page hashes.',
 'wholeSourceResidualExamples':[
  'Bavarian Fischer-from-systematic-names and fructose projection gaps received actual v3 text/case correction and genuine A/B review; reuse those current exact corrected bodies/cases, not v2.',
  'Whole original carbohydrate clauses may additionally demand hydrolysis, starch-iodine or explicit mechanism. The three child competencies alone do not certify every source clause or its complete partner union.',
  'Whole original fat clauses may demand electrophilic halogen addition, fat hardening, hydrolysis or transesterification. Physical-property and evidence-based-use children are not blanket substitutes.',
  'HH-LK mesomeric peptide-group source cell has an explicit current literal/locator correction. Preserve its current literal and the whole peptide partners; neither amino-acid child alone grants this operator.',
  'Four historical parent mappings can continue to name complete described aggregate scopes, but mapped/exact labels are historical decisions, not a new whole-source scientific approval of each descendant.'
 ],
 'remainingActualGates':['Complete ordinary current D provenance/context binding with full original pair containers and exact terminal owners; otherwise bounded fresh native context review.','Materialize exact approved PNGs to canonical/public paths and typed current-image QA; do not fabricate original reviewers/dates.','Stage two exact reviewed origin-tag changes, then full normal M419 original9-visibility-scope and acquisition check.','Integrate13 exact canonical/semantic decisions and82 view-reference kind edits without overwriting newer source/view data.','Only after authorized inactive integration, one normal required central check measures actual gains; no gain forecast is counted here.'],
 'newDPA_orMVScienceVotes':0,'strictGainMeasured':False,'HumanApproval':False,'HumanTrial':False})

put('CHECK.actual-first-attempts-and-preserved-boundaries.json',{
 'firstPreparation':{'exitCode':1,'actualCause':'Initial helper assumed eighteen cases. Exact input includes the later third Benedict case; assertion corrected to equality with all actual profile case IDs, giving nineteen. No source/scientific case modified.'},
 'firstFullViewModelCheck':{'exitCode':1,'actualSummary':{'semanticCount':551,'semanticMismatches':0,'canonicalErrors':0,'requiresErrors':0,'P9Errors':0,'AM18Mismatches':0,'viewCount':28,'viewErrors':28,'pixelMismatches':0,'pass':False},'actualCause':'Existing other curricularArea goalEntry references produce386 errors. Kept every stock finding; subsequently separate unchanged542 baseline from bounded NAT structural delta. No validator patch or full-view PASS.'},
 'sourceHelperCorrection':'Read actual sourceGoals and atlas-configured successor carrier paths. Do not report absent obsolete path as an actual missing current cell. The final comparison finds228 exact cells plus the explicit HH literal correction.',
 'modelsAfterBoundedComparison':load(REL/'CHECK.stock-compile-28-affected-Chemistry-views-roles-and-prerequisites.json')['scopedNATDeltaPass'],
 'normalFullViewGateStillHold':True,'sourceFilesOrGatesModified':False})

# Exact finite selector includes whole inputs rather than bare hash approval.
neutral_paths=[cpath,REL/'candidate/semantic551.prospective419.existing-paired-kind-science.json',REL/'CAS.exact-four-parent-structure-plus-nine-reviewed-whole-children.NOT-APPLIED.json',REL/'CONTEXT.current-whole-prerequisites-successors-and-untouched-dependent-requires.actual.json',REL/'SOURCE.whole-original-cells-all-original-partners-current-carrier-deltas.NO-GRANT.json',REL/'P/nine-existing-whole-profile-records.exact.jsonl',REL/'P/nineteen-complete-original-DEEN-cases-material-answers-rubrics.exact.json',REL/'V/nine-existing-actual-PNG-bindings-and-original-paired-science.NO-NEW-V.json',REL/'V/ee359-final-blue-exposed-tip-not-forceps-end.exact-existing-binding.json',REL/'CAS.two-card-origin-tags-with-separate-paired-retarget-science.NOT-APPLIED.json',REL/'CAS.current-Chemistry-views-only-four-parent-reference-kinds.NOT-APPLIED.json',REL/'CAS.M419-existing-science-container-and-operative-selection.NOT-APPLIED.json']
put('NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json',{
 'schemaVersion':1,'role':'Informed author integration proposal, not a blind independent vote','baseWhole542':binding(base/'candidate/canonical542.prospective414.on-final-source6-539.minimal-inactive.json'),
 'selectedChildIds':children,'selectedParentIds':parents,'wholeInputs':[binding(p) for p in neutral_paths],
 'genuineScienceHistorySeparatelyBound':binding(REL/'INPUTS.exact-whole-material-selection.external-bindings.json'),
 'originalSourceOperatorsWhole':True,'allOther538WholeGoalsExact':True,'allMeasured292BodiesExact':True,'rawRootWeight':1.2,
 'newScienceVotes':0,'newClosuresClaimed':0,'activeWrites':0,'hostWrites':0,'engineWrites':0,'gitMutations':0,'HumanApproval':False})

# Extend exact source/code/schema bindings without broad history scanning.
extra=[pathlib.Path(x) for x in ['app/scripts/goalBookModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts','scripts/validate_schemas.py']]
extra+=[i292/'config/M412.existing407-plus-genuine-five.normal-alias.config.json',pathlib.Path(mcfg['reviewPath']),pathlib.Path(mcfg['cardReviewPath']),base/'config/M2.existing-genuine-independent-a.new-candidate-address-only.config.json',restpath]
for p in extra:
 b=binding(p)
 if b['path'] not in {x['path'] for x in inputs['bindings']}:inputs['bindings'].append(b)
put('INPUTS.exact-whole-material-selection.external-bindings.json',inputs)
# Refresh selector pointer after final external-binding extension.
selector=load(REL/'NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json')
selector['genuineScienceHistorySeparatelyBound']=binding(REL/'INPUTS.exact-whole-material-selection.external-bindings.json')
put('NEUTRAL.exact-final542-to551-nine-whole-children-four-parent-clusters.author-integration-inputs.json',selector)
print(json.dumps({'stockA':[(x['gate'],x['exitCode']) for x in checks],'M419CandidateRecords':len(allm),'schemaDocuments':sum(x['records'] for x in schema_checks),'schemaErrors':sum(len(x['errors']) for x in schema_checks),'changedSourceCells':len(changedcells),'baselineViewErrors':views['preexistingErrorOccurrenceCount'],'scopedViewDeltaPass':views['scopedNATDeltaPass'],'viewAcquisitionHoldOccurrences':len(acquisition),'newScienceVotes':0}))
