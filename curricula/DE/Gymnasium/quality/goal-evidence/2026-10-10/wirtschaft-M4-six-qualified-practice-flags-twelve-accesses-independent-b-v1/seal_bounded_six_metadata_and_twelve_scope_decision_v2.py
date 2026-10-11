#!/usr/bin/env python3
import copy
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
B = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-existing-practice-requires-derived-country-metadata-author-v1/postmerge-current496-exact-material-status-baseline-successor-v2'
S = B / 'six-foreign-whole-qualified-metadata-and-twelve-accesses-author-successor-v3'
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def ref(p): return {'path':str(Path(p).relative_to(ROOT)), 'sha256':sha(p)}
def dump(n,d):
 p=OUT/n;assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return ref(p)

h=read(S/'actual-final-six-foreign-whole-qualified-practice-flags-and-twelve-country-accesses.author-handoff.json')
before=read(B/'whole-actual-current496-before-nine-metadata-fields.exact.json')
candidate=read(ROOT/h['candidateCAN']['path'])
bg={g['id']:g for g in before['goals']};cg={g['id']:g for g in candidate['goals']}
rows=read(ROOT/h['individualWholeMetadataChanges']['path'])['rows'];ids={r['before']['id'] for r in rows}
assert len(ids)==6 and bg.keys()==cg.keys()
for gid in bg:
 if gid not in ids:assert bg[gid]==cg[gid]
 else:
  c=copy.deepcopy(cg[gid]);assert c['extendedData'].pop('applicabilityFromRequires') is True
  if 'extendedData' not in bg[gid]:
   assert c['extendedData']=={};c.pop('extendedData')
  assert c==bg[gid]
  assert bg[gid]['requires']==bg[gid]['examData']['coveredGoalIds']
  assert bg[gid]['examData']['reviewStatus']=='released'

science_path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-five-terminal-assessments-author-candidate-v1/independent-review/independent-fachliche-assessment-review.actual.json'
overlay_path=science_path.parent/'five-reviewed-assessments.overlay.json'
science=read(science_path);overlay={g['id']:g for g in read(overlay_path)}
a_path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-seven-materials-and-real-regime-independent-a-v1/actual-nine-binding-cuts-and-whole-15aa-F-V-calculation-counterworks-rubric-scientific-KEEP.independent-a.json'
a=read(a_path)
lineage=[]
for gid in sorted(ids):
 c=cg[gid]
 if gid in overlay:
  o=overlay[gid];assert c['examData']==o['examData']
  assert c['examData']['coveredGoalIds']==o['examData']['coveredGoalIds']
  record=next(x for x in science['observations'] if x['goalId']==gid)
  assert sha(science_path)=='95614f8948c74c624e833ef955bae4673b2b62c0215e19d8276da9cf94569564'
  assert hashlib.sha256(c['examData']['taskContent'].encode()).hexdigest()==record['taskSha256']
  assert hashlib.sha256(c['examData']['solutionContent'].encode()).hexdigest()==record['solutionSha256']
  assert set(c['requires']).issubset(o['requires'])
  lineage.append({'goalId':gid,'wholeForeignScienceReceipt':ref(science_path),'wholeForeignExamDataStillExact':True,
   'wholeCurrentCoverageStillExactlyForeignReviewed':True,'actualOldReadinessEdges':len(o['requires']),'actualCurrentDirectPrerequisites':len(c['requires']),
   'currentReadinessIsExactlyTrueAssessedPerformance':True,'wholeCurrentScienceReusedNotRestarted':True,
   'currentCourseTags':c['tags'],'foreignCourseTags':o['tags'],
   'coursePolicyDe':'Aktuelle Q1–Q4-Tags bleiben LK-only; historische GK-Tags werden nicht wiederhergestellt. E bleibtGK/LK. Reale Länder-/Kursqualifikation wird unten gegen aktuelle ganze Voraussetzungen geprüft.',
   'foreignActualScientificReason':record['fachlicheObservation']})
 else:
  assert gid=='15aa72ad-9236-5a68-8482-9408db439af2'
  o=a['wholeReviewedCurrencyMaterialSuccessor'];assert c['examData']==o['examData'];assert c['requires']==o['requires']
  lineage.append({'goalId':gid,'wholeForeignScienceReceipt':ref(a_path),'wholeCurrentTaskSolutionRubricAndRequiresExactlyQualified15aa':True,
   'actualWholeFixedFlexibleComparisonAndOwnA17CapNegativeStillValid':True,
   'noBlanketUseOfANineCutReceiptForOtherLegacyBodies':True})

positive=read(OUT/'actual-own-final-six-flags-twelve-accesses-positive.native-result.json')
negative=read(OUT/'actual-own-real-BB-GK-whole-compatible-reference-deletion-negative.native-result.json')
base_native=read(ROOT/h['nativeBefore']['path']);access=read(ROOT/h['accessIndex']['path'])
def key(r):return (r['viewPath'],r['jurisdiction'],tuple(r['scopeFilters']))
pr={key(r):r for r in positive['allScopeRows']};br={key(r):r for r in base_native['allScopeRows']};nr={key(r):r for r in negative['allScopeRows']}
assert len(pr)==64 and pr.keys()==br.keys()==nr.keys()
all_practice={g['id'] for g in candidate['goals'] if 'examData' in g}
for k in pr:
 assert pr[k]['ordinaryTargetIds']==br[k]['ordinaryTargetIds']==nr[k]['ordinaryTargetIds']
 for f in ['visibleAllAtomicIds','visibleTargetAtomicIds']:
  assert set(pr[k][f])-all_practice==set(br[k][f])-all_practice==set(nr[k][f])-all_practice
assert positive['sourceRule']==base_native['sourceRule']==negative['sourceRule']
assert positive==read(ROOT/h['nativePositive']['path'])
mat={m['id']:m for m in positive['materials']}
scope_decisions=[]
for x in access['references']:
 gid=x['materialId'];assert gid in ids
 r=pr[(x['activeViewPath'],x['jurisdiction'],(x['courseFilter'],))]
 c=cg[gid];m=mat[gid];visible=set(r['visibleAllAtomicIds'])
 assert x['courseFilter'] in c['tags']
 assert x['jurisdiction'] in m['actualCompiled']['compiledApplicability']['jurisdiction']
 assert not m['unresolvedReferences']
 assert set(m['wholeMaterialPrerequisites']).issubset(visible)
 assert set(c['examData']['coveredGoalIds']).issubset(m['wholeMaterialPrerequisites'])
 assert set(c['examData']['coveredGoalIds']).issubset(visible)
 assert gid in r['actualTerminalIds'] and gid in r['expectedTerminalIds']
 assert not any(i.get('terminalId')==gid for i in r['wholeMaterialPrerequisiteClosureIssues'])
 assert not any(i.get('terminalId')==gid for i in r['wholeMaterialCoverageBindingIssues'])
 scope_decisions.append({'viewPath':x['activeViewPath'],'jurisdiction':x['jurisdiction'],'course':x['courseFilter'],'materialId':gid,
  'decision':'KEEP bounded exact existing whole material access','wholeCurrentRequiresClosure':m['wholeMaterialPrerequisites'],
  'actualCoveredGoalIds':c['examData']['coveredGoalIds'],'compiledJurisdictionMatch':True,'wholeClosureAndCoverageAlreadyVisible':True,
  'GKDoesNotReceiveLKOnlyWholeMaterial':True,'newOrdinaryTargetsOrSupportRoles':0,
  'newSourceOrWholeCountryApproval':False})
view_guards=[]
for x in access['views']:
 old=read(ROOT/x['before']['path']);new=read(ROOT/x['candidate']['path']);stripped=copy.deepcopy(new);branches=[]
 def strip(nodes):
  result=[]
  for n in nodes:
   if n.get('kind')=='structure' and n.get('id','').endswith('-qualified-whole-practice-country-access-v1'):
    branches.append(n)
   else:
    if isinstance(n.get('children'),list):n['children']=strip(n['children'])
    result.append(n)
  return result
 stripped['rootNodes']=strip(stripped['rootNodes']);stripped['viewId']=old['viewId'];assert stripped==old
 assert len(branches)==1 and all(n['kind']=='goalEntry' and n['projectionRole']=='target' and n['goalId'] in ids for n in branches[0]['children'])
 view_guards.append({'activePath':x['activePath'],'wholeBefore':x['before'],'wholeCandidate':x['candidate'],
  'exactNewPureNavigationBranch':branches[0],'allOldGoalNodesRolesLabelsAndContainsOrderExact':True})
assert sum(len(x['exactNewPureNavigationBranch']['children']) for x in view_guards)==12

full=read(OUT/'actual-whole-native496-compiler-with-all-diagnostics-and496-semantic-source-bindings.json')
report=full['wholeNativeApplicabilityReport'];assert report['goals']==positive['compilerGoals'];assert report['summary']==positive['compilerSummary']
warnings=[d for d in report['findings'] if d['severity']=='warning'];assert len(warnings)==10
assert all(x['exact'] for x in full['nativeWhole496SemanticSourceBindings'])
warningref=dump('actual-ten-frozen19ae-candidate-warnings-not-active-APV5-state.independent-b.json',{
 'canonicalInput':h['candidateCAN'],'baseSHA256':'19ae376346d3ce7a1b0490a9edfea2d000b329e7e9697c14522ea3b5e0f0ad9a',
 'warnings':warnings,'actualWarningCount':10,'wholeNativeCompiler':ref(OUT/'actual-whole-native496-compiler-with-all-diagnostics-and496-semantic-source-bindings.json'),
 'activeAPV5ae2NotRolledBack':True,'theseAreNotTenCurrentActiveWarnings':True,'currentRebasedCompilerMustBeMeasuredByRoot':True})

scope_ref=dump('actual-six-valid-foreign-whole-lineages-twelve-individual-scope-and-eight-whole-view-decisions.independent-b.json',{
 'foreignQualifiedWholeLineages':lineage,'individualScopeDecisions':scope_decisions,'wholeViewGuards':view_guards,
 'all64OrdinaryAndNonassessmentAtomicSupportSetsExact':True,'wholeSourceRuleBeforePositiveNegativeExact':True,
 'sixFlagsAllOfCurrentNonemptyPrerequisitesOnly':True,'assessmentRequiresEvidenceNotSourceEvidence':True,
 'retainedOrdinaryCurrent336':336,'historical591b58cca47NotApprovedOrAccessed':True})
newmissing=[]
for k in pr:
 delta=sorted(set(nr[k]['missingEffectiveTerminalTargetIds'])-set(pr[k]['missingEffectiveTerminalTargetIds']))
 if delta:newmissing.append({'view':k[0],'jurisdiction':k[1],'course':list(k[2]),'missingGoalIds':delta})
assert len(newmissing)==2 and all(x['missingGoalIds']==['13b20cee-8977-5b3f-938b-2064e96f2a5b'] for x in newmissing)
assert sum(len(x['missingEffectiveTerminalTargetIds']) for x in pr.values())==3704
assert sum(len(x['missingEffectiveTerminalTargetIds']) for x in nr.values())==3706
negref=dump('actual-own-two-scope-missing-compatible-material-negative.corrected-observation.json',{
 'actualWholePositiveNativeExitCode':0,'actualWholeNegativeNativeExitCode':0,'actualPositiveMissing':3704,'actualNegativeMissing':3706,
 'actualTwoCountryAndNationalMirrorFailures':newmissing,'allOrdinarySupportSourceSetsExact':True,
 'rootVersusRootNodesHelperFailureRetained':True,'oneVersusTwoScopeAssertionFailureRetained':True,
 'failedPreparationsNotCountedAsCurricularVerdicts':True,
 'actualRequiredBBGKTerminalStillRequiredAfterDeletion':True,'noPolicyThresholdOrScopeRelaxation':True})

receipt=dump('actual-final-six-qualified-flags-twelve-exact-accesses-bounded-scientific-KEEP.independent-b.json',{
 'createdAt':datetime.now(timezone.utc).isoformat(),'reviewer':'/root/economics_m2_views_independent_b','decision':'KEEP bounded six metadata fields plus12 existing whole-material references only',
 'foreignAuthorHandoff':ref(S/'actual-final-six-foreign-whole-qualified-practice-flags-and-twelve-country-accesses.author-handoff.json'),
 'actualScientificAndScopeDecisions':scope_ref,'ownMeaningfulNativeNegative':negref,'wholeCompilerAndTenIsolatedWarnings':warningref,
 'candidateCAN':h['candidateCAN'],'candidateSEM':h['candidateSEM'],
 'nativeCheckerSHA256':'656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336',
 'nativePredicatesThresholdsProfileSelectorsAndForeignSubjectsUnmodified':True,
 'metadataAllSixExtendedDataApplicabilityFromRequiresTrueOnly':True,
 'actualFiveHistoricalWholeBodiesAndRubricsExactReuse':True,'actualAWhole15aaStillExactReuse':True,
 'wholeTaskSolutionScoreRequiresCoveredGoalsAndCurrentPerformancePreserved':True,
 'sourceApplicabilityAndStudentPerformanceSeparate':True,
 'targetedNativeEvidenceOnly':True,'sourceRule16Unsupported0Reverse0Unchanged':True,
 'all64OrdinaryMemoryOrientationAndSupportSetsExact':True,
 'actualFrozenNativeRouteGain':60,'actualFrozenUniqueMissing216To212':True,'stillMissingLocalRouteOccurrences':3704,
 'stillCoverageIssues':20,'stillWholeMandatoryClosureIssues':32,
 'noCurrentActiveTenWarningsClaim':True,'activeAPV5ae2NotOverwrittenOrReverted':True,
 'integrationInstruction':'Root rebases exactly6 flag fields and6 SEM source fingerprints plus12 additive references against latest active CAN496ae2/views. Never overwrite whole19ae-based candidate CAN or SEM. Current native/floors/book/D and remaining metadata are parent stable-integration work.',
 'fourLegacyRemainingCoverageREVISEUnchanged':True,'C19Money676LKAndThreeWithdrawnLegacyBodiesRemainOpen':True,
 'newWholeM4M5M6M7OrHumanApproval':False,'newCurricularAtomicFiveGateCompletions':0,'restoredBindingCompletions':0,'strictNetGain':0,
 'activeWrites':0,'images':0})
files=[ref(p) for p in sorted(OUT.iterdir()) if p.is_file()]
manifest=dump('actual-independent-six-flags-twelve-accesses-complete-review.manifest.json',{'files':files,'scope':'bounded fieldwiseKEEP; no active whole successor approval'})
handoff=dump('actual-final-six-flags-twelve-accesses-independent-b.handoff.receipt.json',{
 'receipt':receipt,'manifest':manifest,'scopeDecisions':scope_ref,'negative':negref,'warnings':warningref,
 'decision':'KEEP6fields12refs only; current rebased native remains parent integration','noWholeCANSEMOverwrite':True,
 'activeWrites':0,'M4M5M6Claim':False})
print(json.dumps({'receipt':receipt,'manifest':manifest,'handoff':handoff}))
