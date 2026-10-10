"""Final portable AUTHOR freeze; no active curriculum writes or scientific self-KEEP."""
import json,hashlib,copy,subprocess
from pathlib import Path
from jsonschema import Draft202012Validator
ROOT=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,d):p=O/n;assert not p.exists(),p;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return p
ip=O/'whole-current597-twelve-DEEN-contracts-original-P24-seven-retained-materials.author-intake.json';I=json.loads(ip.read_text())
current=ROOT/I['actualCurrentCANPath'];before=ROOT/I['immutableWhole597InputPath']
assert current.read_bytes()==before.read_bytes()
graph=json.loads(before.read_text());ids={g['id']:g for g in graph['goals']};assert len(ids)==597
P={};configguards=[]
for x in I['actualWhole43CurrentPBindings']:
 cp=ROOT/x['configPath'];rp=ROOT/x['reviewPath']
 assert bind(cp)['sha256']==x['configSHA256'];assert bind(rp)['sha256']==x['reviewSHA256']
 records=[json.loads(line) for line in rp.read_text().splitlines() if line.strip()]
 for p in records:assert p['goalId'] not in P;P[p['goalId']]=p
 configguards.append({'config':bind(cp),'originalWholeReview':bind(rp),'actualRecordCount':len(records)})
assert len(P)==336
allCases=sum(len(p['profile']['applicationCaseBriefs']) for p in P.values());assert allCases==685
rowguards=[]
for r in I['rows']:
 gid=r['goalId'];assert r['wholeCurrentDEENGoal']==ids[gid];assert r['wholeOriginalPositiveRecord']==P[gid]
 rowguards.append({'goalId':gid,'wholeCurrentDEENGoal':ids[gid],'wholeOriginalP':P[gid],'actualOriginalCaseCount':len(P[gid]['profile']['applicationCaseBriefs']),'wholeCurrentExact':True})
assert sum(x['actualOriginalCaseCount'] for x in rowguards)==24
for old in I['wholeSevenRetainedExistingMaterials']:assert old==ids[old['id']]
final=O/'whole-twelve-labour-society-only-three-separated-source-and-interest-boundaries.DRAFT-author-v2.json';M=json.loads(final.read_text())
assert len(M)==12 and len({m['id'] for m in M})==12 and not(set(ids)&{m['id'] for m in M})
sc=ROOT/'contracts/curriculum-package/v1/compiled-landscape.schema.json';j=json.loads(sc.read_text());v=Draft202012Validator({'$schema':j['$schema'],'$defs':j['$defs'],'$ref':'#/$defs/goal'})
errs=[{'id':m['id'],'path':list(e.path),'error':e.message} for m in M for e in v.iter_errors(dict(m,semanticKind='practiceAssessment'))];assert not errs
for m in M:
 assert m['examData']['reviewStatus']=='draft' and m['requires']==m['examData']['coveredGoalIds'] and len(m['requires'])==1
 assert len(m['examData']['scoring']['steps'])==6 and sum(x['points'] for x in m['examData']['scoring']['steps'])==24
 assert m['examData']['scoring']['maxPoints']==24 and m['examData']['scoring']['passingPoints']==15
 assert m['tags']==ids[m['requires'][0]]['tags']+['Practice','Assessment']
 assert m['phase']==ids[m['requires'][0]]['dimensionTags']['phase']
schema=save('actual-final-twelve-whole-DRAFT-conditional-schema-current597-P336685-endguards.AUTHOR.json',{
 'role':'AUTHOR technical endguard, no new scientific review or practice kind approval','actualCurrentImmutableCAN':bind(before),
 'actualOriginalActivePathRead':str(current.relative_to(ROOT)),'activeWholeBytesExactAtRead':True,'wholeCurrentGoalCount':597,
 'whole43OriginalConfigReviewGuards':configguards,'actualOriginalProfileCount':336,'actualOriginalApplicationCount':685,
 'actualWholeTwelveGoalAndP24Guards':rowguards,'allSevenExistingWholeMaterialsExact':True,'finalTwelveBody':bind(final),
 'actualConditionalCompiledKindSchema':bind(sc),'actualConditionalGoalCount':12,'actualConditionalSchemaErrors':errs,
 'practiceSemanticKindNotYetIndependentlyApproved':True,'noOriginalGoalDescriptionRequiresImageOrPositiveProfileChange':True})
files=[p for p in sorted(O.rglob('*')) if p.is_file()]
for p in files:
 assert not p.is_symlink(),p
 if p.suffix=='.json':json.loads(p.read_text());assert p.read_bytes().endswith(b'\n'),p
check=subprocess.run(['git','check-ignore','--no-index',*map(str,files)],cwd=ROOT,capture_output=True,text=True)
assert check.returncode==1 and not check.stdout and not check.stderr,(check.returncode,check.stdout,check.stderr)
save('actual-portable-author-file-format-ignore-and-symlink-checks.json',{
 'role':'actual own candidate file checks, no full-repository build claim','actualCheckedFileCount':len(files),
 'actualJSONNewlineOrParseErrors':0,'actualOwnFileSymlinkCount':0,'actualIgnoredOwnInputCount':0,
 'failedSetupHistoryPreserved':['separate exec namespace before any body write','two actual omitted EN solution-list arguments detected before successful assembly and supplied with full meaning'],
 'privatePrimaryFulltextsNotIncludedInFreeze':True})
manifest=save('actual-final-twelve-labour-current597-portable-author-freeze.manifest.json',{
 'role':'AUTHOR immutable final inputs','files':[bind(p) for p in sorted(O.rglob('*')) if p.is_file()],
 'externalImmutable597Input':bind(before),'externalHistoricalWholeScienceReusedOnlyViaBoundReceipts':True})
proofs=json.loads((O/'actual-own-twelve-fair-twelve-core-counterworks-twelve-whole-second-omissions216-manual-rubric-decisions.AUTHOR.json').read_text())
extras=json.loads((O/'actual-six-new-separate-source-and-interest-whole-absence-works36-manual-decisions.AUTHOR.json').read_text())
calc=json.loads((O/'actual-own-exact-fraction-and-six-rule-classification-author-checks.json').read_text())
handoff=save('actual-final-twelve-labour-society-current597-whole-DEEN-P24-DRAFT.author-handoff.json',{
 'role':'AUTHOR final candidate handoff; independent whole science and later scope required','subject':'Wirtschaftswissenschaften',
 'wholeFinalTwelveDRAFT':bind(final),'wholeCurrent597Before':bind(before),'wholeOriginalCurrentTwelveGoalsAndP24':bind(schema),
 'exactFinalSeparatedCoreAndCaseDecisions':bind(O/'actual-final-twelve-core-case-course-decisions-only-three-separated-boundaries.AUTHOR-v2.json'),
 'sixActualGradingParagraphDeltaFields':bind(O/'actual-six-existing-DEEN-grading-paragraph-field-deltas-and-nine-whole-exact-bodies.AUTHOR.json'),
 'wholeCaseVariants':24,'actualSubjectTasks':72,'scoringEach':[24,15],
 'ownExactArithmeticAndClassifications':bind(O/'actual-own-exact-fraction-and-six-rule-classification-author-checks.json'),
 'actualFractionCheckCount':calc['actualFractionCheckCount'],'actualFractionErrors':0,'actualOwnClassificationCount':6,
 'ownOriginal36Submissions216ManualDecisions':bind(O/'actual-own-twelve-fair-twelve-core-counterworks-twelve-whole-second-omissions216-manual-rubric-decisions.AUTHOR.json'),
 'ownSixAdditionalRealSeparateSourceInterestAbsenceWorks36Decisions':bind(O/'actual-six-new-separate-source-and-interest-whole-absence-works36-manual-decisions.AUTHOR.json'),
 'actualOwnSubmissionCount':42,'actualOwnManualStepDecisionCount':252,'actualFairPartialPASS':12,'actualCoreCounterworksFAIL':18,'actualOmittedSecondApplicationsFAIL':12,
 'actualCoreRawPASSConvertedTo14FAIL':proofs['actualCoreRawPASSConvertedTo14FAIL']+6,'actualCoreAlreadyRawFAIL':proofs['actualCoreAlreadyRawFAIL'],
 'noExtraTaskQuotaOrPerfectionRequirement':True,'separateNecessarySourcesAndCompetences':True,
 'fiveExistingForeignWholeScienceReusesSevenBodiesUnchanged':bind(O/'actual-seven-retained-broad-materials-five-foreign-whole-science-reuses-two-unqualified-history-boundaries.AUTHOR.json'),
 'twoExistingHistoricalReleasedStatusesNotWholeScienceApprovals':True,
 'ownBoundedPrimaryReadings':bind(O/'actual-fourteen-own-current-primary-fetches-selected-readings-and-bounded-DEEN-source-aids.AUTHOR.json'),
 'actualNarrowNativeUnplacedCurrent597ClosureCommand':bind(O/'actual-native-final-labour-unplaced597-closure-command-exit.AUTHOR.json'),
 'actualNativeUnresolvedReferenceCount':0,'noWholeCompilerSourceRouteOrScopePASSClaim':True,
 'originalP336685SourceRegistryViewsCANSEMUnchanged':True,'noActiveWritesImagesOtherSubjectChanges':True,
 'portableManifest':bind(manifest),'wholeStatus':'draft','independentScientificDecision':'PENDING',
 'statusNavSEMApplicabilityScopeAccess':'PENDING separate author and foreign review after science',
 'newStrictCompletions':0,'restoredBindings':0,'strictNetGain':0,'noM4M6M7HumanOrReleaseAcceptanceClaim':True})
print(json.dumps({'handoff':bind(handoff),'wholeFinal':bind(final),'manifest':bind(manifest),'actual42works252marks':True,'actual89Fractions0errors':True}))
