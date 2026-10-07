import datetime,hashlib,json,pathlib
repo=pathlib.Path('/home/enpasos/projects/skillpilot')
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own=base+'biologie-q1-carrier-image-and-projection-independent-b-v1/'
prepared=base+'biologie-q1-carrier-projection-and-image-targeted-author-v2/'
inputs={}
def bind(path):
 b=(repo/path).read_bytes();r=dict(path=path,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b));inputs[path]=r;return r
def read(path):bind(path);return json.loads((repo/path).read_bytes())
for name in ['six-country-views.independent-b.actual.json','native-d-actual-input-bindings.json','carrier-current-profile-and-two-full-cases.independent-b.actual.json','carrier-current-final-page-and-389-preservation.independent-b.actual.json']:
 d=read(own+name)
 for r in d['allActualInputs']:
  actual=bind(r['path'])
  if actual['sha256']!=r['sha256'].removeprefix('sha256:') or actual['bytes']!=r['bytes']:raise AssertionError('Read input changed since actual review: '+r['path'])
v=read(own+'carrier-corrected-geometry-v.independent-b.actual.json')
for r in v['actualInspections']:
 actual=bind(r['path'])
 if actual['sha256']!=r['sha256'] or actual['bytes']!=r['bytes']:raise AssertionError('Actually viewed raster changed')
for name in ['native-d-validator.actual.json','native-p-validator.actual.json','native-memory-eight-scopes.actual.json']:
 d=read(own+name)
 if d['actualExitCode']!=0 or d['gateWeakening']:raise AssertionError('Native gate failed')
for name in ['AGENTS.md','app/scripts/goalBookModel.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/applicabilityCompiler.ts','app/scripts/generateCurriculumQualityStatus.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','app/scripts/memoryCardReview.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/compositionViewRuntime.ts','app/src/goalTypes.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json']:
 bind(name)
for name in ['round-b/description-review-input.json','round-b/description-review-campaign.json','round-b/prompt.md','round-b/criteria.md','round-b/contracts/goal-description-review-record.schema.json','positive.six-exact.config.json','positive.six-exact.review.jsonl','full-country-target-preservation.author.actual.json']:
 bind(prepared+name)
for name in ['full-memory.current.config.json','full-memory.review.jsonl','full-memory.cards.review.jsonl']:
 bind(base+'biologie-q1-seven-reviewed-integration-candidate-v1/'+name)
for name in ['independent-b-v7.first-pass.final.freeze.json','independent-b-v8-targeted-followup.final.freeze.json']:
 bind(base+'biologie-q1-seven-native-v7-independent-b-v1/'+name)
for name in ['BE.physical-036.independent-b-original-pdf.txt','BB.physical-036.independent-b-original-pdf.txt']:
 bind(base+'biologie-q1-seven-native-v7-independent-b-v1/sources/'+name)
for name in ['native-d-independent-b.final.freeze.json']:
 bind(base+'biologie-q1-seven-final-native-d-independent-b-v1/'+name)
bind(base+'biologie-q1-seven-final-native-p-independent-b-v1/native-p-independent-b.final.freeze.json')
bind(base+'biologie-q1-seven-active-integration-independent-b-v1/historical-evidence-byte-continuity.independent-b.actual.json')
views=read(own+'six-country-views.independent-b.actual.json')
for row in views['views']:
 path='curricula/DE/Gymnasium/composition-views/biologie/'+pathlib.PurePosixPath(row['path']).name
 if read(path)!=read(row['path']):raise AssertionError('Actual active country view differs from reviewed final candidate')
views['memoryEightScopeNativeCheckPending']=False
views['memoryEightScopeActualReceiptPath']=own+'native-memory-eight-scopes.actual.json'
(repo/own/'six-country-views.independent-b.actual.json').write_text(json.dumps(views,ensure_ascii=False,indent=2)+'\n')
continuity=read(own+'six-positive-records-byte-continuity.independent-b.actual.json')
if bind(continuity['reviewPath'])['sha256']!=continuity['actualSHA256']:raise AssertionError('Other six current P records changed')
inputs={path:r for path,r in inputs.items() if not path.startswith(own)}
outputs=[]
for f in sorted((repo/own).rglob('*')):
 if f.is_file() and not f.is_symlink() and f.name!='targeted-carrier-and-six-country-views.independent-b.final.freeze.json':
  b=f.read_bytes();outputs.append(dict(path=str(f.relative_to(repo/own)),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b)))
out=dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),role='Independent B targeted corrected carrier visual/final native D/P and six full country projection review; no global active-integration or whole-source approval',verdict='KEEP',actualReadInputBindings=list(inputs.values()),ownOutputs=outputs,scope=dict(carrierGoalId='ac9e824f-003c-50ac-8751-2b8456004c63',actualNewPNG='sha256:0fd0144161c94b06907b24e75a47c30446a6d97763c759d60014319f8b2e2115',actualPDFPhysicalPage=3,fullCountryViews=6),nativeDB=dict(records=1,validatorActualExit=0,bundleFingerprint='sha256:4376f97fe4b37b9307809191a243eca4486cca3baf214dea4b663faf7e9de7c5',reviewInputFingerprint='sha256:80b34e20e73b90f547d9bb2e61b72a62a8eaa3a3f7c03e04315f9178d3baceef'),nativePB=dict(records=1,validatorActualExit=0,inputFingerprint='sha256:1e9e67b528c8e30a811ed0ced22e606a0d01d2922cd768f1ad7291051532a404',status='needs_human_review',authority='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1'),nativeMemory=dict(goals=390,primaryCards=27,visibilityScopes=8,visibilityGoalChecks=37,missingVisibleMemory=0,actualExit=0),viewVerdicts=[dict(path=r['path'],scope=r['scope'],verdict=r['verdict'],targets=r['targetCount'],curricularTargets=r['curricularTargetCount'])for r in views['views']],wholeSTSekIOld180UUIDsPreserved=True,wholeCountryUnions=[169,183,185,186],nationalFullGUITargets=[174,443],whole389OtherPagesExactlyPreserved=True,whole390GoalFingerprintsPreserved=True,otherSixPRecordsByteExact=True,rawCarrierRequiresClosureIsAvailabilityOnly=True,actualCarrierRoleIsPrerequisiteOnlyOutsideBEBB=True,canonicalMasteryIDsAndRequiresRetained=True,learnerSessionMasteryWriteOrHostAcceptanceExercised=False,sourceComponentsUnchanged=13,wholeOriginalSourceClearance=False,oldV6V7V8AuthorHistoryUnmodified=True,oldHistoricalHashPrefixDiagnosticResolved=True,peerANewReviewOutputFilesRead=False,centralFullCheckPerformedByThisReviewer=False,all19InputsEqualityClaimed=False,nativeApplicabilityCompilerGlobalTraversalByteEqualityClaimed=False,inputBindingsMeaning='Exact selected actual read/bound files at their review and freeze times; no claim that every transitive native-compiler repository input or all19 central guards is unchanged.',activeWrites=False,gitOperation=False,humanApproval=False,humanTrial=False,learnerEvidence=False,publicationOrDeployment=False)
file=repo/own/'targeted-carrier-and-six-country-views.independent-b.final.freeze.json';file.write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(dict(path=str(file.relative_to(repo)),sha256=hashlib.sha256(file.read_bytes()).hexdigest(),inputs=len(inputs),outputs=len(outputs),verdict='KEEP')))
