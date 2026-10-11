import datetime, hashlib, json, pathlib, subprocess

ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=pathlib.Path(__file__).resolve().parent
SRC=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-ten-new-current-goals-author-source-scope-native-inputbundle-AUTHOR-INERT-v1'
def bind(path):
 p=pathlib.Path(path);p=p if p.is_absolute() else ROOT/p
 b=p.read_bytes()
 return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def same_binding(expected):
 actual=bind(expected['path']); e='sha256:'+expected['sha256'].removeprefix('sha256:')
 assert actual['sha256']==e and actual['bytes']==expected['bytes'], actual['path']
 return actual
def write_new(name,data):
 p=OUT/name;assert not p.exists();p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return bind(p)

initial=json.loads((OUT/'actual-input-before-guards.READONLY.json').read_text())
extended=json.loads((OUT/'actual-extended-consumed-input-before-guards.READONLY.json').read_text())
source=json.loads((SRC/'actual-ten-current-source-edges-whole-atoms-parents-and-partial-bounds.INPUT.json').read_text())
extra=json.loads((SRC/'actual-ten-native-bound-whole-goals-P20-pages-authors-and-source-context.INPUT.json').read_text())
native_input=json.loads((SRC/'native/round-a/description-review-input.json').read_text())
bindings={}
registry_path='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
root_delta=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-third-M7-twelve-current-dual-description-synthesis-root-v1'
registry_before=root_delta/'registry-before-current-D12.EXACT.json'
registry_candidate=root_delta/'candidate-registry.only-twelve-qualified-current-D-pairs.INERT.config.json'
if not registry_candidate.exists():
 registry_candidate=root_delta/'registry.only-twelve-qualified-current-D-pairs.INERT.config.json'
registry_authority=root_delta/'10-actual-twelve-current-dual-pairs-and-eight-contexts-registry-activation.receipt.json'
reg_expected=next(v for v in initial['inputGuards']if v['path']==registry_path)
assert bind(registry_before)['sha256']==reg_expected['sha256']
assert (ROOT/registry_path).read_bytes()==registry_candidate.read_bytes()
reg_a=json.loads(registry_before.read_text());reg_b=json.loads((ROOT/registry_path).read_text())
assert set(reg_a)==set(reg_b) and reg_a['subjects'][:4]==reg_b['subjects'][:4] and reg_a['subjects'][5:]==reg_b['subjects'][5:]
ra,rb=reg_a['subjects'][4],reg_b['subjects'][4]
assert {k:v for k,v in ra.items()if k not in ['resolutionIndexPaths','resolutionSupersessions']}=={k:v for k,v in rb.items()if k not in ['resolutionIndexPaths','resolutionSupersessions']}
assert rb['resolutionIndexPaths'][:len(ra['resolutionIndexPaths'])]==ra['resolutionIndexPaths'] and len(rb['resolutionIndexPaths'])-len(ra['resolutionIndexPaths'])==2
assert rb['resolutionSupersessions'][:len(ra['resolutionSupersessions'])]==ra['resolutionSupersessions'] and len(rb['resolutionSupersessions'])-len(ra['resolutionSupersessions'])==11
registry_delta={'before':bind(registry_before),'current':bind(registry_path),'exactCandidate':bind(registry_candidate),'rootActivationAuthority':bind(registry_authority),'allowedFields':['subjects/4/resolutionIndexPaths','subjects/4/resolutionSupersessions'],'appendedIndexCount':2,'appendedSupersessionCount':11,'wholeForeignSubjectsAndAllOtherRegistryFieldsExact':True,'existingListPrefixesExact':True,'rootCurrentNewReviewRecordsNotRead':True,'ownNativeInputArtifactsUnchanged':True}
for expected in initial['inputGuards']+extended['bindings']+source['actualSourceFileBindings']:
 if expected['path']==registry_path: continue
 actual=same_binding(expected);bindings[actual['path']]=actual
can_path=ROOT/extra['currentCanonicalBinding']['path'];same_binding(extra['currentCanonicalBinding'])
canon={g['id']:g for g in json.loads(can_path.read_text())['goals']}
parities=[]
for supplied,inp in zip(extra['goals'],native_input['goals']):
 gid=supplied['goalId'];assert gid==inp['goalId']
 assert supplied['wholeCurrentGoal']==canon[gid]
 p=supplied['currentNativePRecordAndConfig']
 for expected in [p['configBinding'],p['recordBinding']]:
  b=same_binding(expected);bindings[b['path']]=b
 cfg=json.loads((ROOT/p['configPath']).read_text());assert cfg==p['wholeConfig']
 rows=[json.loads(line) for line in (ROOT/p['recordPath']).read_text().splitlines()]
 record=next(r for r in rows if r['goalId']==gid)
 assert record==p['wholeRecord']
 book=supplied['wholeNativeCombinedBookPRecord'];assert book==inp['reviewContext']['evidenceProfile']
 diffs=[k for k in set(book)|set(record) if book.get(k)!=record.get(k)]
 assert diffs==supplied['actualBookVersusConfiguredPConsumerBinding']['actualDifferingFields'] or set(diffs)==set(supplied['actualBookVersusConfiguredPConsumerBinding']['actualDifferingFields'])
 assert diffs in [[],['reviewInputFingerprint']]
 assert book['status']==record['status']=='needs_human_review' and book['reviewAuthority']==record['reviewAuthority']=='ai_candidate'
 assert book['evidenceLevel']==record['evidenceLevel']=='E1' and book['maximumClaimScope']==record['maximumClaimScope']=='G1'
 parities.append({'goalId':gid,'actualWholeGoalExactCurrentCanonical':True,'actualWholeConfiguredPRecordExact':True,'nativeBookPEvidenceExact':True,'actualBookVersusConfiguredPDifferingFields':diffs,'wholeProfileStatusAuthorityReviewerTimeAndHumanMetadataExact':all(book.get(k)==record.get(k) for k in set(book)|set(record) if k!='reviewInputFingerprint'),'sourceEdgeCount':len(source['goalSourceContexts'][gid]),'sourceMatchTypes':[v['edge']['matchType'] for v in source['goalSourceContexts'][gid]]})

checker_paths=['app/scripts/validateGoalDescriptionReviewCampaign.ts','app/scripts/validateGoalEvidenceFindings.ts','app/scripts/goalBookModel.ts','contracts/goal-description-review/v1/goal-description-review-record.schema.json','contracts/goal-description-review/v2/goal-description-review-campaign.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','app/node_modules/tsx/package.json','AGENTS.md']
checker_bindings=[bind(p) for p in checker_paths]
node=pathlib.Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
version=subprocess.check_output([node,'--version'],text=True).strip()
tsx=json.loads((ROOT/'app/node_modules/tsx/package.json').read_text())['version']
assert version=='v20.20.2' and tsx=='4.21.0'
campaign=json.loads((SRC/'native/round-a/description-review-campaign.json').read_text());batch_id=campaign['batches'][0]['batchId']
records_path=OUT/'round-a/results'/f'{batch_id}.records.jsonl';run_path=OUT/'round-a/results'/f'{batch_id}.run.json'
records=[json.loads(line)for line in records_path.read_text().splitlines()];run=json.loads(run_path.read_text())
assert [r['goalId']for r in records]==campaign['batches'][0]['goalIds'] and len(records)==10
assert all(r['recordStatus']=='candidate' and r['reviewAuthority']=='ai_candidate' for r in records)
assert run['outputDigest']==bind(records_path)['sha256']
assert run['generationParametersFingerprint']==bind(OUT/'actual-generation-parameters-and-independence-disclosure.json')['sha256']
validation=json.loads((OUT/'actual-native-own-D10-one-batch.validation.receipt.json').read_text());assert validation['exitCode']==0
head_end=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
guard_receipt=write_new('actual-current-input-endguards-and-ten-whole-P-consumer-parities.READONLY.json',{'observedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEADbefore':initial['HEAD'],'HEADend':head_end,'HEADunchanged':initial['HEAD']==head_end,'exactBeforeEndInputFileCount':len(bindings),'allExplicitBeforeAndSuppliedNativeSourcePBindingsExactExceptDocumentedRegistryDelta':True,'documentedAuthorizedRegistryDelta':registry_delta,'inputBindings':list(bindings.values()),'checkerAndSchemaCurrentBindingsAtValidation':checker_bindings,'actualToolchain':{'node':version,'tsx':tsx,'runtime':'Codex'},'wholeCurrentTenGoalAndPParities':parities,'actualScopedPConsumerInputDifferenceCount':sum(bool(p['actualBookVersusConfiguredPDifferingFields'])for p in parities),'allScientificPFieldsAndHumanMetadataUnchanged':True,'technicalBoundary':'D native input consumes the combined Book P record, which binds actual QA asset digest. Seven scoped P44/P45 records intentionally bind visualization link metadata with null asset digest. Only their reviewInputFingerprint differs; no science or historical reviewer facts altered.','currentOtherRoundFilesRead':False,'activeWrites':0,'humanApproval':False,'strictM7Claim':False})
artifact_bindings=[bind(p)for p in sorted(OUT.rglob('*'))if p.is_file() and not p.name.startswith('SEALED-')]
seal=write_new('SEALED-ten-current-native-independent-round-A-individual-KEEP-candidates.READONLY.json',{'artifactKind':'sealed-independent-current-native-description-review-round-A','sealedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'ten-scientifically-reviewed-ai-candidates-native-schema-binding-PASS','reviewerAgent':'/root/economics_final56_current_round_a','assignedGoalIds':campaign['batches'][0]['goalIds'],'individualDecisions':{r['goalId']:r['decision']for r in records},'individualCaseSolutionCount':20,'bilingualUnderstandingFieldCount':60,'nativeCLIExitCode':0,'nativeOutput':'Goal-description review batch valid: 10','recordBinding':bind(records_path),'runBinding':bind(run_path),'actualGenerationMetadataBinding':bind(OUT/'actual-generation-parameters-and-independence-disclosure.json'),'inputEndguardReceipt':guard_receipt,'documentedAuthorizedRegistryDelta':registry_delta,'inputPackageSeal':bind(SRC/'SEALED-ten-current-native-description-inputs-and-author-source-boundaries.AUTHOR-INERT.json'),'HEADbefore':initial['HEAD'],'HEADend':head_end,'artifacts':artifact_bindings,'scientificScope':'Whole10 current DE/EN goals, their20 full DE/EN P cases and expectation/variation/status fields, actual native subset/base page context, direct whole prerequisites, actual10 bound PNG and20 whole supplied source edge/atom/parent/decision contexts. Individual case answers, fresh counterexamples and atomic/neighbor/source boundaries are authored in own proof.','independence':'Current other-round outputs unread. None of the10Goal/P contracts authored by reviewer. Earlier source/stage/atomarity/memory/image/technical exposure and own7c/BE-P12/BY source authoring disclosed;7c excluded. No new source-science or V approval from this D review.','publicationBoundary':{'recordStatus':'candidate','reviewAuthority':'ai_candidate','Pstatus':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'observedLearnerPerformance':False,'strictM7Claim':False,'activeWrites':0,'indexOrRegistryRegistration':False}})
print(json.dumps({'seal':seal,'inputEndguards':len(bindings),'HEAD':head_end,'nativeExitCode':0,'decisionCounts':{'keep':sum(r['decision']=='keep'for r in records)}}))
