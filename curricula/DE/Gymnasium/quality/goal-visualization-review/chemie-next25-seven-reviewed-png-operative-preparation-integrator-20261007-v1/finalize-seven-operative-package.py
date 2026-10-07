#!/usr/bin/env python3
import datetime,hashlib,json,pathlib
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OUT=pathlib.Path(__file__).resolve().parent
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):p=p.resolve();return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def write(n,x):p=OUT/n;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
inp=json.loads((OUT/'preparation-current-inputs.actual.json').read_text());routing=json.loads((OUT/'seven-png-21-copy-and-seven-prompt-operative-routing.raw.json').read_text());index=json.loads((OUT/'seven-current-whole-resource-only-templates.index.json').read_text());prompts=json.loads((OUT/'seven-source-prompt-native-helper-and-import-argv.routing.json').read_text());checks=json.loads((OUT/'actual-native-seven-operative-payload-binding-checks.receipt.json').read_text())
assert checks['allPASS'] and checks['nativeInputCount']==7
canonpath=ROOT/inp['canonical']['path'];canon=json.loads(canonpath.read_text());goals={g['id']:g for g in canon['goals']};qa=json.loads((ROOT/inp['qa']['path']).read_text());qby={r['goalId']:r for r in qa['records']}
for r in index['rows']:
 assert goals[r['goalId']]==r['beforeGoal'];assert qby[r['goalId']]==inp['sevenOldQARecords'][r['goalId']]
 assert bind(ROOT/r['template']['path'])==r['template'];assert bind(ROOT/r['QAReplacement']['path'])==r['QAReplacement']
before_after=[]
for r in index['rows']:
 before=r['beforeGoal'];after=r['afterGoal'];bi=before['resourceLinks'][0];ai=after['resourceLinks'][0]
 assert {k:v for k,v in before.items() if k!='resourceLinks'}=={k:v for k,v in after.items() if k!='resourceLinks'}
 fields=[{'field':f'resourceLinks[0].{key}','before':bi[key],'after':ai[key]} for key in ai if ai[key]!=bi[key]]
 expectedfields={'resourceLinks[0].url','resourceLinks[0].provider','resourceLinks[0].altText','resourceLinks[0].license'}
 if bi['reviewStatus']!=ai['reviewStatus']:
  assert r['goalId']=='a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca' and bi['reviewStatus']=='accepted' and ai['reviewStatus']=='pilot'
  expectedfields.add('resourceLinks[0].reviewStatus')
 assert {x['field'] for x in fields}==expectedfields
 newqa=json.loads((ROOT/r['QAReplacement']['path']).read_text());oldqa=qby[r['goalId']]
 before_after.append({'goalId':r['goalId'],'resourceOnlyExactScalarDelta':fields,'qaBeforeExact':oldqa,'qaAfterCandidateExact':newqa,'qaChangedFields':[k for k in newqa if newqa[k]!=oldqa[k]],'humanFlagsAssetArchiveOnlyNotTransferred':True})
for row in routing['imageInstallRouting']:
 assert bind(ROOT/row['sourceReviewedSelectedPNG']['path'])==row['sourceReviewedSelectedPNG'];assert bind(ROOT/row['preparedExactCopy']['path'])==row['preparedExactCopy']
for row in routing['unchanged18OriginalJPGs']:
 for b in row['copies']:assert bind(ROOT/b['path'])==b
 assert goals[row['goalId']]==row['unchangedWholeCurrentGoal'];assert qby[row['goalId']]==row['unchangedQARecord']
write('realexact-seven-resource-only-and-qa-before-after.candidates.json',{'status':'inert technical candidate','wholeCurrentGoalCount':479,'sevenGoalsBeforeAfter':before_after,'actualResourceScalarDeltas':sum(len(x['resourceOnlyExactScalarDelta']) for x in before_after),'oldAcceptedA163StatusNotTransferredToNewCandidate':True,'otherWholeGoalFieldsUnchanged':True,'noFullCanonicalReplacement':True,'noNewScience':True})
prov=[]
raw=json.loads((ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-four-targeted-raster-corrections-author-20261006-v2/seven-exact-assets-four-targeted-current-corrections.raw-v2-review-input.json').read_text())
for r in raw['rows']:
 prov.append({'goalId':r['goalId'],'actualSelectedPNG':r['selectedPNG'],'nativeSize':r['nativeSize'],'actualTool':r['actualTool'],'generatorProviderForImport':'OpenAI / ChatGPT-Codex image generation','imageModel':'unknown; not separately exposed','actualPrompt':r['actualPrompt'],'selectedAttempt':r['selectedAttempt'],'ownImageLicenseForLink':'CC-BY-4.0','licenseAuthority':bind(ROOT/'LICENSING.md'),'generationAuthorFreeze':bind(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-four-targeted-raster-corrections-author-20261006-v2/four-targeted-raster-corrections.author-v2.final.freeze.json'),'generationNotApproval':True})
write('seven-actual-provider-prompt-license-and-unknown-image-model.routing.json',{'role':'technical provenance routing only','rows':prov,'newRightsOrScienceDecision':False})
routing.update(wholeGoalTemplatesIndex=bind(OUT/'seven-current-whole-resource-only-templates.index.json'),sevenPromptInstallRouting=prompts['promptRouting'],sevenNativeImportCalls=prompts['nativeImportCallsForRootOnly'],sevenQARecordPaths=[x['QAReplacement'] for x in index['rows']],actualPureNativeChecks=bind(OUT/'actual-native-seven-operative-payload-binding-checks.receipt.json'),exactBeforeAfter=bind(OUT/'realexact-seven-resource-only-and-qa-before-after.candidates.json'),technicalRoleOnly=True,awaitRootFinalSignal=True,recipient='Root only; previous Author25 thread no longer live',baselineCurrentCanonicalAtFinalization=bind(canonpath))
write('seven-reviewed-png-operative-candidates.final-routing.json',routing)
ownerrors=[{'errorReceipt':bind(OUT/'own-preparation-attempt-001.path-shape-failure.actual.json'),'resolution':'Historical manifests use repository-relative paths, current ones dossier-relative paths. Own reader now resolves the documented representation before exact hash checking. No validator or historical artifact altered.','laterExactVerificationPASS':True}]
ownerrors.append({'errorReceipt':bind(OUT/'own-preparation-attempt-002.review-status-delta-assumption-failure.actual.json'),'resolution':'Actual resource-only delta includes a163 accepted-to-pilot for the new PNG candidate; all actual fields are now recorded rather than assuming four per goal. No production helper was changed.','laterExactVerificationPASS':True})
write('actual-final-whole-binding-technical-role-and-no-active-write.receipt.json',{'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentWholeGoalCount':479,'canonicalAtEntry':inp['canonical'],'canonicalAtFinalization':bind(canonpath),'allSevenWholeGoalsExactAcrossBWMetadataDelta':True,'onlyPreparedSevenResourceLinkChanges':True,'sevenPreparedQARecordsExactSchemaKeys':True,'threeUnchangedPriorIndependentPairsCarried':3,'fourTargetedCurrentIndependentPairsBound':4,'preparedImageCopies':21,'preparedPromptsFromActualProductionHelper':7,'goodOriginalJPGsPreserved':18,'goodOriginalCopyBindingsPreserved':54,'oldJPGArchiveCopies':21,'oldAssetBoundQAAndHumanArchives':7,'nativePureProductionFunctionsAllSevenPASS':True,'ownErrorsRetainedAndResolved':ownerrors,'role':'technical integrator; no additional independent or scientific review','activeWrites':False,'nativeImporterActuallyExecuted':False,'centralOrGlobalBuild':False,'newStrictClosures':0,'strictNetGain':0,'newHumanApproval':False,'newHumanTrial':False})
README='''# Seven Chemistry PNGs: inert operative integration candidates

Role: **technical integrator**, candidate only. The prior V-B reviewer now prepares installation payloads; this is not another independent science round. Four actual author-v2 PNGs have current independent A/B KEEP. Three byte-exact a163/c441/235 PNGs retain their prior independent A/B KEEP without another content review.

## Concrete handoff

`seven-reviewed-png-operative-candidates.final-routing.json` contains the complete routing. `seven-current-whole-resource-only-templates.index.json` and `whole-goal-resource-only-templates/*.json` provide exactly seven before/after whole goals; only their primary resource links differ. `qa-replacement-records/*.json` are exactly seven replacement records with the current ordinary `chemie.qa.json` field set. `realexact-seven-resource-only-and-qa-before-after.candidates.json` records all actual before/after fields.

The package contains 21 byte-exact PNG copies under `prospective-install-tree/`: seven curriculum sources, seven app/public assets and seven backend static assets. Seven `prompt.de.md` candidates were produced by the unchanged production `createPromptMetadataMarkdown` helper from each actual selected generation prompt. The same production `createGoalVisualizationLink` function generated the resource candidates. Explicit provider is `OpenAI / ChatGPT-Codex image generation`; actual builtin tool receipts remain bound separately. The image model is unknown/not separately exposed. Own-image license is `CC-BY-4.0` under current LICENSING.md; provider provenance is not a license. Review status stays `pilot` for the proposed operative link.

## Current baseline and application rule

Actual preparation uses the current **479-goal** canonical after Root's BW metadata application, SHA256 `4f3e7abaf7233c36b6e36a09ad2e03f1335dcb6d7fed6c1e7ec99fcca73751a6`. The seven whole goals remain exactly equal to the immutable raster review inputs. The old canonical review hash has an actual retained immutable copy; old review runs were not relabeled after the unrelated BW delta.

**Never replace a complete canonical or QA ledger from this package.** No full canonical copy is provided. Immediately before later Root application, require exact equality of each seven current whole goals and exact seven old QA records, then import/update only the seven primary resources and replace only the seven QA rows. All other goals, source mappings and QA records stay current. Prepared native importer argument arrays and expected helper output are concrete reviewable instructions; they have not been executed here. Root's final signal and separate native application/validation remain pending.

## History and preservation

All seven previous JPGs have exact source/public/backend history copies under `historical-originals/`, plus the exact old QA records and old prompts. The old human flags, timestamps, reviewers and issue text are archived against their original asset SHA; they are **not transferred** to the new PNG. New PNG human fields are ordinary unreviewed defaults (`no`, empty, null). Old AI/ChatGPT field history remains in its old-asset archive. Current independent A/B evidence supplies proposed new machine fields, using actual review timestamps and exact PNG SHA values. This does not issue a human approval.

The exact 18 good original JPGs and all 54 source/public/backend bindings are listed as byte-preserved KEEP. No content re-review, regeneration, provider conversion or format normalization was performed on them. The seven superseded JPGs can be retired from the active layout only after Root verifies their prepared history copies and successfully installs the replacements; their history is preserved.

## Actual technical checks and visual boundaries

`actual-native-seven-operative-payload-binding-checks.receipt.json` records actual PASS for seven ordinary QA field blocks through unchanged `normalizeGoalVisualizationAiReview`, `isAiApprovedForCurrentAsset`, `hasCompletedDeepUnderstandingVisualizationReview` and `hasCurrentExactByteAiQaEvidence`, with the isolated exact canonical/public PNG copies and separately checked backend copies. These are pure function checks, not a central rollout, global build or new subject review.

The frozen independent review records retain actual native and actual 360/680 image-width sight; current v2 views also record the additional narrower 316 case. The 492/5e2 fine-text limitation at 316 remains in the A/B dossiers and is not expanded into full-app acceptance. Bounded alt text only describes the depicted image facets and does not reduce whole DE/EN goal or P performance to those examples. Native-book, new D/P/source approval, full SourceAtlas/GK-LK/superset closure, Human Approval and Human Trial remain separate.

Two own preparation assumptions failed and are retained: the historical A-v1 freeze uses repository-relative paths, and a163 additionally changes its old accepted link to pilot for the new candidate. The own reader and actual delta capture were corrected; every frozen input subsequently passed unchanged hash verification. The actual resource scalar count is 29. No production validator was changed.

No active files, Git, central registry, floors, status, global builds or strict counts were written. New scientific strict closures and strict net gain are **0**. Send this immutable package to Root only; await the separate Root signal before any Author25-v2 finalization work.
'''
(OUT/'README.md').write_text(README)
external={b['path']:b for b in inp['externalInputs']}
for path in ['scripts/goal_visualization_common.mjs','scripts/import_goal_visualization.mjs','app/scripts/goalVisualizationQaModel.ts','app/src/utils/goalVisualizationQaStatus.ts','app/scripts/reportGoalVisualizationRolloutStatus.ts','app/scripts/reportDeepUnderstandingRollout.ts','AGENTS.md','LICENSING.md','docs/concept/skill-graph/atomic-goal-visualizations.md']:
 b=bind(ROOT/path);external[b['path']]=b
for b in external.values():assert bind(ROOT/b['path'])==b,b['path']
write('exact-external-operative-inputs.final.json',{'role':'technical integrator','externalInputs':list(external.values()),'activeCanonicalIsBaselineGuardNotReplacementPayload':True})
freezepath=OUT/'seven-reviewed-png-operative-preparation.integrator-v1.final.freeze.json';files=[]
for p in sorted(OUT.rglob('*')):
 if p.is_file() and p!=freezepath:files.append({'path':str(p.relative_to(OUT)),'sha256':sha(p),'bytes':p.stat().st_size})
write(freezepath.name,{'schemaVersion':1,'documentType':'inert seven-reviewed-PNG operative preparation freeze','frozenAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'technical integrator','status':'candidate','files':files,'externalInputs':list(external.values()),'wholeGoalTemplates':7,'qaReplacementRecords':7,'imageInstallCopies':21,'actualProductionHelperPrompts':7,'goodOriginalJPGsExactUntouched':18,'oldAssetBoundHumanArchives':7,'currentIndependentPairs':4,'exactHistoricalIndependentPairs':3,'actualPureNativePayloadChecksPASS':7,'ownErrorsRetained':2,'activeWrites':False,'newIndependentScienceRounds':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False})
for b in files:
 p=OUT/b['path'];assert sha(p)==b['sha256'] and p.stat().st_size==b['bytes']
for p in OUT.rglob('*'):
 if not p.is_symlink():p.chmod(0o555 if p.is_dir() else 0o444)
OUT.chmod(0o555)
print(json.dumps({'freeze':bind(freezepath),'ownPayloadFiles':len(files),'externalInputFiles':len(external),'wholeGoalTemplates':7,'qaRecords':7,'nativeCopies':21,'prompts':7,'unchangedGoodJPGs':18,'nativePureChecksPASS':7,'activeWrites':False,'strictNetGain':0}))
