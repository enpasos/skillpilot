# SPDX-License-Identifier: Apache-2.0
"""Seal only actual author results; historical seals and all active files stay unchanged."""
from pathlib import Path
from datetime import datetime,timezone
from collections import Counter
import hashlib,json,ast
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;PREVIOUS=OWN.parent/'chemie-b008-hb-current480-source-placement-author-v18';assert not (OWN/'author.final.freeze.json').exists()
def read(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
prior=read(PREVIOUS/'author.corrected-portable-receipts.final.freeze.json')
for r in prior['payloads']:assert bind(ROOT/r['path'])==r
proposals=read(OWN/'exact-sh-primary-course-components-and-three-view-proposals.author.json');native=read(OWN/'actual-native43-source-view-findings-three-SH-models-and-current173-contexts.json');guard=read(OWN/'current480-three-way-bounded-field-rebase.actual.json')
assert bind(ROOT/guard['current480']['path'])==guard['current480']
current=read(OWN/'inputs/active-current480.json.bin');candidate=read(OWN/'candidate/canonical.current504-sh-source-metadata.author-candidate.json');byc={g['id']:g for g in current['goals']};byn={g['id']:g for g in candidate['goals']}
ids=['f0939f88-a6af-5334-ac4d-5d54732af25a','1c1420c2-a8e2-520f-8015-6df637a973bd','28bb9d15-f865-5843-a035-6066580fea64','9e656697-fc05-5aa9-9aca-871af2e89eb7','417e65ec-68be-5f2e-9452-c3ba9b1d362f','f97b9c87-16d0-58fd-bcb2-c51574aa36d0']
for i in ids:assert byc[i]==byn[i]
for i in guard['all173ProtectedTextImageAndMetadataValuesExact']:assert {k:v for k,v in byc[i].items() if k!='requires'}=={k:v for k,v in byn[i].items() if k!='requires'}
assert native['actualProtectedContextHolds']==8 and native['actualBeforeCPV009']==54 and native['actualAfterCPV009']==43
assert next(r for r in native['all173ProtectedActualPageContextComparisons'] if r['goalId']=='d2ccd1d5-56f7-583f-9724-e97441367f91')['currentPageExcludingPaginationExact']
registry=read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');oldregistry=read(OWN/'inputs/active-rollout-registry.json.bin');assert next(s for s in registry['subjects'] if s['subject']=='chemie')==next(s for s in oldregistry['subjects'] if s['subject']=='chemie')
material=read(PREVIOUS/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.portable-bindings-corrected.json')
for r in material['actual52WholeMaterialBodiesUnchanged']+material['actual26WholeOldProfileBodiesUnchanged']+[material['exactOriginalV11Binder']]:assert bind(ROOT/r['path'])==r
reading={'role':'Actual SH author scoped reading and binding retention; no independent review','portableOwnActualWholePrimaryPageReceipts':proposals['portableOwnPrimaryReceipts'],'rawOfficialPdfTextCommitted':False,'currentWholeSourceGoalCountReadAndBound':32,'specificPartialComponentsAuthored':53,'wholeOriginalSHDutiesRetained':158,'unchanged26WholeDEENTextNativeComparison':native['exact26WholeDescriptionsRetained'],**{k:material[k] for k in ['actual52WholeMaterialBodiesUnchanged','actual26WholeOldProfileBodiesUnchanged','exactOriginalV11Binder','materialBodyStatus','actualLearnerPerformance','priorScientificReviewNotRestarted','newIndependentSourceReview','newNativeDOrPApproval','humanApproval']}}
write(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.json',reading)
remaining=read(PREVIOUS/'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json');groups=Counter();views=[]
for r in native['actual43SourceViews']:
 if r['actualAfterCPV009']:
  groups[r['scope']['jurisdiction']]+=r['actualAfterCPV009'];views.append({'viewId':r['viewId'],'scope':r['scope'],'actualCPV009':r['actualAfterCPV009'],'currentExactView':r['afterViewBinding'],'actualFindings':r['actualAfterFindings']})
remaining['actualRemainingCPV009ByJurisdiction']=dict(groups);remaining['actualRemainingCPV009']=43;remaining['actualCurrentRemainingSourceViews']=views;remaining['actualEightProtectedContextHolds']=[r for r in native['all173ProtectedActualPageContextComparisons'] if not r['currentPageExcludingPaginationExact']]
write(OWN/'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json',remaining)
parsed=[]
for p in OWN.rglob('*'):
 assert not p.is_symlink()
 if p.is_file() and (p.suffix=='.json' or p.name.endswith('.json.bin')):read(p);parsed.append(str(p.relative_to(OWN)))
 elif p.is_file() and p.suffix=='.py':ast.parse(p.read_text())
checks={'role':'Targeted inert SH author technical checks only','actualNativeCommand':'./node_modules/.bin/tsx ../'+str(OWN.relative_to(ROOT))+'/compile-current504-sh-bounded-native-source-candidates.mts','actualNativeCommandCwd':'app','actualExitCode':0,'actualStdout':bind(OWN/'native-compiler.actual.stdout.log'),'actualStderr':bind(OWN/'native-compiler.actual.stderr.log'),'actualViews':43,'actualBeforeCPV009':54,'actualAfterCPV009':43,'actualThreeSHViews':[{'viewId':r['viewId'],'targetPurePages':r['actualNativeTargetPages']} for r in native['actualThreeSHSourcePureModels']],'immutablePreviousSeal':bind(PREVIOUS/'author.corrected-portable-receipts.final.freeze.json'),'actualPreviousPayloadsVerified':len(prior['payloads']),'freshCurrentWholeGoalValuesExact':ids,'d2ccActualReverseContextExact':True,'allCurrentChemistryRegistryFieldsUnchanged':True,'actualProtected173TextImageMetadataValuesExact':True,'actualEightOldProtectedContextHolds':8,'newProtectedContextHolds':0,'actual52MaterialAnd26ProfileFileBindingsUnchanged':True,'syntaxParsedLocalJSONFileCount':len(parsed),'symlinks':0,'rawOfficialPDFTextExports':0,'fullRepositorySchemaAndBuildDeferredToStableRootIntegration':True,'strictGain':0,'activeWrites':0,'humanApproval':False}
write(OWN/'targeted-technical-checks.actual.json',checks)
entry={'role':'Neutral complete SH sources/course/grade/components/metadata/views; no peer results','sealedPrevious':bind(PREVIOUS/'author.corrected-portable-receipts.final.freeze.json'),'current480ThreeWayRebase':bind(OWN/'current480-three-way-bounded-field-rebase.actual.json'),'wholeSourceComponentsAndViewProposals':bind(OWN/'exact-sh-primary-course-components-and-three-view-proposals.author.json'),'wholeCurrent504InactiveCandidate':bind(OWN/'candidate/canonical.current504-sh-source-metadata.author-candidate.json'),'actual43AndThreeSHNativeModels':bind(OWN/'actual-native43-source-view-findings-three-SH-models-and-current173-contexts.json'),'remainingOriginalDutiesAndEightContextHolds':bind(OWN/'remaining-jurisdictions-original-source-duties-and-protected-context-holds.json'),'actualScopedSourceReadingAndUnchangedBodyBindings':bind(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.json'),'actualTargetedTechnicalChecks':bind(OWN/'targeted-technical-checks.actual.json'),'independentSourceAnchorComponentAndPlacementReviewRequired':True,'independentWhole26NativeDAndPReviewNotAdded':True,'rawOfficialTextExports':0,'newImagesOrVisualApproval':0,'wholeSourceClosure':False,'strictGain':0,'activeWrites':0,'humanApproval':False}
write(OWN/'bounded-neutral-sh-source-placement-review-entry.json',entry)
(OWN/'README.md').write_text("""# B008 v19: Schleswig-Holstein source components

Inert author packet: strict +0, active writes0, no independent or human approval. Current Chemistry173/378 (480whole), candidate504whole/395curricularAtomic/7memory. All previous freezes stay exact, including the corrected final HB portable-receipt freeze.

Actual whole primary reading distinguishes cumulative lower Gymnasium transition standards, variable early entry, E/Q progression, common versus enhanced contents, noncontinuous-course limits and choices among LIFE and WATER/SOIL contexts. 32 whole current source goals supply53 bounded partial course/component bindings,15 metadata proposals and three explicit views (10lower;9upper targets plus7prerequisiteOnly each). The upper process paragraphs39–44 lack corresponding existing source-goal IDs: actual portable whole-page receipts are separate operator witnesses, not invented IDs or whole domain proof. Concrete water/soil components remain alternatives within a selected context. Common fat-index evaluation is qualitative; generic quantitative analysis comes from actual common39/40/65 standards, not an invented common fat experiment duty.

One actual course fault is corrected only in the inert extraction candidate: source83d965d2 experimental fat-index work is currentlyGK_LK but actually appears in the enhanced-only right column on physical/printed65. It supplies LK components only, while GK uses genuine shared analytics. Amino-acid RF chromatography on64 is likewise LK-only. Whole original source bodies remain exact. All158original SH family duties and1646national duties are retained, with original16BYfacets,58STtwo-hour elective duties, whole complex model domains and full personal career-choice performance still HOLD. The truncated original lower source ending ggf is retained as HOLD rather than silently completed. Whole26DEEN routine texts,52material bodies and26profiles are unchanged binding reuse, not repeated review.

Actual native43views:54→43CPV-009, no other new errors; SHpure target pages132/174/180. Current378/candidate395pages and current fresh Chemistry173 protections verified. Protected165pages exact outside pagination; exactly the previous8requires/reverseRequires contexts remain HOLD, new0. Current417eMemory, four Chemistry corrections andd2ccreverse context remain exact. These technical results do not constitute source closure, D/P/A/M/V completion or M7 gain.

Raw official PDF text stays only in local ignored tmp. 27 portable own whole-page reading receipts bind official references, source PDF digest, reproduction method and bounded findings; no new full official text export. Actual nested exact binders are checked before final freeze. Full schema/build work stays bundled at stable root integration, no special schema exclusions.

Neutral entry: bounded-neutral-sh-source-placement-review-entry.json. Independent course/source/operator/component/placement review is pending. Eight protected routing contexts, dependent26D/P/A/M/V and all whole source facets remain separate closure work. Larger remaining candidate groups: SL8/TH8/SN7. No publication or human trial claim.
""")
# Recursively verify real exact input references before freezing, including all portable page receipts.
nested=[]
def verify(v,pointer):
 if isinstance(v,dict):
  if set(v)=={'path','sha256','bytes'}:
   assert bind(ROOT/v['path'])==v,(pointer,v);nested.append(pointer)
  else:
   for k,item in v.items():verify(item,pointer+'/'+k)
 elif isinstance(v,list):
  for i,item in enumerate(v):verify(item,pointer+'/'+str(i))
verify(proposals,'/proposals');verify(reading,'/reading');verify(entry,'/entry')
write(OWN/'actual-nested-portable-receipts-and-unchanged-input-binders.check.json',{'role':'Actual technical exact binder validation; no scientific or human approval','actualExactNestedReferencesVerified':len(nested),'currentWholeSourceGoals':32,'portableOwnWholePageReceipts':len(proposals['portableOwnPrimaryReceipts']),'rawOfficialTextExports':0,'firstHBPortableReceiptFailureIsPreventedBeforeThisFreeze':True,'strictGain':0,'activeWrites':0,'humanApproval':False})
freeze={'schemaVersion':1,'role':'Author-only neutral SH v19 packet, inactive and unapproved','createdAtUTC':datetime.now(timezone.utc).isoformat(),'currentActiveChemistryWhole':480,'currentActiveChemistryStrict':173,'currentActiveChemistryCurricularAtomic':378,'candidateWholeGoals':504,'candidateCurricularAtomic':395,'actualCPV009Before':54,'actualCPV009After':43,'partialSourceComponents':53,'actualWholeSelectedSourceGoals':32,'sourceCourseCorrectionCandidates':1,'rawOfficialTextExports':0,'wholeSourceClosure':False,'sourceIndependentApproval':False,'strictGain':0,'activeWrites':0,'humanApproval':False,'payloads':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]}
write(OWN/'author.final.freeze.json',freeze)
for r in freeze['payloads']:assert bind(ROOT/r['path'])==r
print(json.dumps({'seal':bind(OWN/'author.final.freeze.json'),'payloads':len(freeze['payloads']),'actualCPV009':'54->43','strictGain':0}))
