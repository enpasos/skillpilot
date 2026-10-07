# SPDX-License-Identifier: Apache-2.0
"""Seal only actual author results; historical seals and all active files stay unchanged."""
from pathlib import Path
from datetime import datetime,timezone
from collections import Counter
import hashlib,json,ast
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;PREVIOUS=OWN.parent/'chemie-b008-st-current480-source-placement-author-v17';assert not (OWN/'author.final.freeze.json').exists()
def read(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
prior=read(PREVIOUS/'author.final.freeze.json')
for r in prior['payloads']:assert bind(ROOT/r['path'])==r
proposals=read(OWN/'exact-hb-primary-course-components-and-three-view-proposals.author.json');native=read(OWN/'actual-native43-source-view-findings-three-HB-models-and-current173-contexts.json');guard=read(OWN/'current480-three-way-bounded-field-rebase.actual.json')
assert bind(ROOT/guard['current480']['path'])==guard['current480']
current=read(OWN/'inputs/active-current480.json.bin');candidate=read(OWN/'candidate/canonical.current504-hb-source-metadata.author-candidate.json');byc={g['id']:g for g in current['goals']};byn={g['id']:g for g in candidate['goals']}
ids=['f0939f88-a6af-5334-ac4d-5d54732af25a','1c1420c2-a8e2-520f-8015-6df637a973bd','28bb9d15-f865-5843-a035-6066580fea64','9e656697-fc05-5aa9-9aca-871af2e89eb7','417e65ec-68be-5f2e-9452-c3ba9b1d362f','f97b9c87-16d0-58fd-bcb2-c51574aa36d0']
for i in ids:assert byc[i]==byn[i]
for i in guard['all173ProtectedTextImageAndMetadataValuesExact']:assert {k:v for k,v in byc[i].items() if k!='requires'}=={k:v for k,v in byn[i].items() if k!='requires'}
assert native['actualProtectedContextHolds']==8 and native['actualBeforeCPV009']==68 and native['actualAfterCPV009']==54
assert next(r for r in native['all173ProtectedActualPageContextComparisons'] if r['goalId']=='d2ccd1d5-56f7-583f-9724-e97441367f91')['currentPageExcludingPaginationExact']
registry=read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');oldregistry=read(OWN/'inputs/active-rollout-registry.json.bin');assert next(s for s in registry['subjects'] if s['subject']=='chemie')==next(s for s in oldregistry['subjects'] if s['subject']=='chemie')
material=read(PREVIOUS/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.json')
for r in material['actual52WholeMaterialBodiesUnchanged']+material['actual26WholeOldProfileBodiesUnchanged']+[material['exactOriginalV11Binder']]:assert bind(ROOT/r['path'])==r
reading={'role':'Actual HB author scoped reading and binding retention; no independent review','portableOwnActualWholePrimaryPageReceipts':proposals['portableOwnPrimaryReceipts'],'rawOfficialPdfTextCommitted':False,'currentWholeSourceGoalCountReadAndBound':17,'specificPartialComponentsAuthored':39,'wholeOriginalHBDutiesRetained':60,'unchanged26WholeDEENTextNativeComparison':native['exact26WholeDescriptionsRetained'],**{k:material[k] for k in ['actual52WholeMaterialBodiesUnchanged','actual26WholeOldProfileBodiesUnchanged','exactOriginalV11Binder','materialBodyStatus','actualLearnerPerformance','priorScientificReviewNotRestarted','newIndependentSourceReview','newNativeDOrPApproval','humanApproval']}}
write(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.json',reading)
remaining=read(PREVIOUS/'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json');groups=Counter();views=[]
for r in native['actual43SourceViews']:
 if r['actualAfterCPV009']:
  groups[r['scope']['jurisdiction']]+=r['actualAfterCPV009'];views.append({'viewId':r['viewId'],'scope':r['scope'],'actualCPV009':r['actualAfterCPV009'],'currentExactView':r['afterViewBinding'],'actualFindings':r['actualAfterFindings']})
remaining['actualRemainingCPV009ByJurisdiction']=dict(groups);remaining['actualRemainingCPV009']=54;remaining['actualCurrentRemainingSourceViews']=views;remaining['actualEightProtectedContextHolds']=[r for r in native['all173ProtectedActualPageContextComparisons'] if not r['currentPageExcludingPaginationExact']]
write(OWN/'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json',remaining)
parsed=[]
for p in OWN.rglob('*'):
 assert not p.is_symlink()
 if p.is_file() and (p.suffix=='.json' or p.name.endswith('.json.bin')):read(p);parsed.append(str(p.relative_to(OWN)))
 elif p.is_file() and p.suffix=='.py':ast.parse(p.read_text())
checks={'role':'Targeted inert HB author technical checks only','actualNativeCommand':'./node_modules/.bin/tsx ../'+str(OWN.relative_to(ROOT))+'/compile-current504-hb-bounded-native-source-candidates.mts','actualNativeCommandCwd':'app','actualExitCode':0,'actualStdout':bind(OWN/'native-compiler.actual.stdout.log'),'actualStderr':bind(OWN/'native-compiler.actual.stderr.log'),'actualViews':43,'actualBeforeCPV009':68,'actualAfterCPV009':54,'actualThreeHBViews':[{'viewId':r['viewId'],'targetPurePages':r['actualNativeTargetPages']} for r in native['actualThreeHBSourcePureModels']],'immutablePreviousSeal':bind(PREVIOUS/'author.final.freeze.json'),'actualPreviousPayloadsVerified':len(prior['payloads']),'freshCurrentWholeGoalValuesExact':ids,'d2ccActualReverseContextExact':True,'allCurrentChemistryRegistryFieldsUnchanged':True,'actualProtected173TextImageMetadataValuesExact':True,'actualEightOldProtectedContextHolds':8,'newProtectedContextHolds':0,'actual52MaterialAnd26ProfileFileBindingsUnchanged':True,'syntaxParsedLocalJSONFileCount':len(parsed),'symlinks':0,'initialCwdPathFailureRetained':True,'rawOfficialPDFTextExports':0,'fullRepositorySchemaAndBuildDeferredToStableRootIntegration':True,'strictGain':0,'activeWrites':0,'humanApproval':False}
write(OWN/'targeted-technical-checks.actual.json',checks)
entry={'role':'Neutral complete HB sources/course/grade/components/metadata/views; no peer results','sealedPrevious':bind(PREVIOUS/'author.final.freeze.json'),'current480ThreeWayRebase':bind(OWN/'current480-three-way-bounded-field-rebase.actual.json'),'wholeSourceComponentsAndViewProposals':bind(OWN/'exact-hb-primary-course-components-and-three-view-proposals.author.json'),'wholeCurrent504InactiveCandidate':bind(OWN/'candidate/canonical.current504-hb-source-metadata.author-candidate.json'),'actual43AndThreeHBNativeModels':bind(OWN/'actual-native43-source-view-findings-three-HB-models-and-current173-contexts.json'),'remainingOriginalDutiesAndEightContextHolds':bind(OWN/'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json'),'actualScopedSourceReadingAndUnchangedBodyBindings':bind(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.json'),'actualTargetedTechnicalChecks':bind(OWN/'targeted-technical-checks.actual.json'),'independentSourceAnchorComponentAndPlacementReviewRequired':True,'independentWhole26NativeDAndPReviewNotAdded':True,'rawOfficialTextExports':0,'newImagesOrVisualApproval':0,'wholeSourceClosure':False,'strictGain':0,'activeWrites':0,'humanApproval':False}
write(OWN/'bounded-neutral-hb-source-placement-review-entry.json',entry)
(OWN/'README.md').write_text('''# B008 v18: Bremen source components

Inert author packet: strict +0, active writes0, no independent or human approval. Current Chemistry remains173/378 (480whole goals); source candidate504whole/395curricularAtomic/7memory. Previous v17 and all older freezes remain unchanged.

Actual whole primary-page reading distinguishes the 2022 restriction to grades5–9, current grade8/9 chemistry, common upper standards developed in E/Q, GK/LK depth, compulsory Q topics and choices among elective themes. The existing seven upper process-source texts are retained structured aggregates, not seven new verbatim page14 quotes. Their operative anchor candidates point to actual9/10/11/12/15 with separate whole-page context receipts, while all raw historical fields remain exact. Lower inquiry is not added just because its operator vocabulary exists. Career relevance and simple model operators remain partial; personal career choice and complex receptor/enzyme model domains remain HOLD.

17 whole current source goals supply39 specific partial course/component bindings,16 applicability proposals,7 bounded anchors, three views (7lower targets;13upper targets plus6prerequisiteOnly in each). All60 original HB family duties and all1646 original national duties remain retained and open. The original16BY facets and58STtwo-hour-elective duty routes remain HOLD. Whole26DEEN texts and52whole materials are exact binding reuse, not new scientific review or actual learner performance.

Actual native43view compilation:68→54CPV-009, no other new errors, threeHBmodels87/156/187pages. Current full378/candidate395pure pages verified. Protected165/173pages exact outside pagination; exactly the old8requires/reverseRequires contexts remain HOLD, with no new protected context change. Current417eMemory, four Chemistry fixes andd2ccreverse context are preserved. Full schema/build runs remain bundled at stable root integration; no schema exceptions added.

All new raw official PDF text stays in ignored local tmp. Portable own reading/finding receipts bind the official URL, exact source PDF, extraction method and page digest and explain bounded findings without exporting full official text. The initial wrong-cwd helper failure is retained as actual diagnostic history.

Neutral independent-review entry: bounded-neutral-hb-source-placement-review-entry.json. Independent source/anchor/component/course/placement review is pending. Whole26D/P/A/M/V, eight routing contexts and source facets are not completed by this technical result. Next bounded package: Schleswig-Holstein11CPV-009. No publication or human trial claim.
''')
freeze={'schemaVersion':1,'role':'Author-only neutral HB v18 packet, inactive and unapproved','createdAtUTC':datetime.now(timezone.utc).isoformat(),'currentActiveChemistryWhole':480,'currentActiveChemistryStrict':173,'currentActiveChemistryCurricularAtomic':378,'candidateWholeGoals':504,'candidateCurricularAtomic':395,'actualCPV009Before':68,'actualCPV009After':54,'partialSourceComponents':39,'actualWholeSelectedSourceGoals':17,'sourceAnchorCorrectionCandidates':7,'rawOfficialTextExports':0,'wholeSourceClosure':False,'sourceIndependentApproval':False,'strictGain':0,'activeWrites':0,'humanApproval':False,'payloads':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]}
write(OWN/'author.final.freeze.json',freeze)
for r in freeze['payloads']:assert bind(ROOT/r['path'])==r
print(json.dumps({'seal':bind(OWN/'author.final.freeze.json'),'payloads':len(freeze['payloads']),'actualCPV009':'68->54','strictGain':0}))
