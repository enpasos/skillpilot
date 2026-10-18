import copy,datetime,hashlib,json,pathlib,subprocess
repo=pathlib.Path.cwd()
base=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-native-input-prerequisites-technical-20261018-v1/final-cut/current-binding-v2'
agent='/root/chemie_final_native_round_a_20261018'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def pin(p):
 p=p.resolve();b=p.read_bytes();return {'path':str(p.relative_to(repo)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):
 assert not p.exists(),str(p)
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
for n in range(1,7):
 p=base/f'batch-{n:03d}'/'round-a';own=p/'reviewer-receipts'
 campaign=json.loads((p/'description-review-campaign.json').read_text());batch=campaign['batches'][0]
 manifest=json.loads((p/'review-bundle-manifest.json').read_text())
 native=json.loads((p/'description-review-input.json').read_text())
 batch_file=p/'batches'/(batch['batchId']+'.input.jsonl');rows=[json.loads(l) for l in batch_file.read_text().splitlines()]
 bundle_file=p.parent/'bundle/review-input.json';bundle_bytes=bundle_file.read_bytes();bundle=json.loads(bundle_bytes)
 artifact=next(x for x in manifest['artifacts'] if x['role']=='review_input_json')
 assert artifact['digest']=='sha256:'+hashlib.sha256(bundle_bytes).hexdigest()
 assert artifact['bytes']==len(bundle_bytes)
 assert len(rows)==len(native['goals'])==len(bundle['pages'])==campaign['goalCount']==20
 assert native['bookDigest']==bundle['modelDigest']==manifest['bookModelDigest']==campaign['bookDigest']
 checks=[]
 for row,g,page in zip(rows,native['goals'],bundle['pages']):
  q=page['page']
  check={'goalId':g['goalId'],'assignedJsonlGoalExactlyEqualsBilingualInputGoal':row['goal']==g,'bundlePageAndCurrentEvidenceProfileExactlyEqualActuallyReadReviewContext':g['reviewContext']==page,'goalIdMatchesBundlePage':g['goalId']==q['goalId'],'deTitleExactlyEqual':g['currentTitleDe']==q['title'],'deDescriptionExactlyEqual':g['currentDescriptionDe']==q['description'],'goalFingerprintExactlyEqual':g['goalFingerprint']==q['goalFingerprint'],'pageFingerprintExactlyEqual':g['pageFingerprint']==q['pageFingerprint']}
  assert all(v is True for k,v in check.items() if k!='goalId'),check
  checks.append(check)
 assert [x['goalId'] for x in checks]==batch['goalIds']
 # Native bilingual/canonical fields remain bound to the existing V3 input; the bundle review_input_json itself contains page/P contexts, not a second canonical bilingual landscape.
 proof={'schemaVersion':1,'reviewerId':agent,'checkedAt':now(),'purpose':'Technical artifact-role correction only; not a further scientific assessment or model vote.','actualMethod':'Parsed the complete bound bundle/review-input.json and compared each full page+current-P object structurally with the already actually read assigned native reviewContext. Compared each whole JSONL goal with its existing bilingual V3 input goal. Compared titles, descriptions, identifiers and fingerprints independently as listed. Hashes bind these equality findings and are not scientific evidence.','newJudgment':False,'peerResultsReadBeforeOwnSeal':False,'historicalMetadataContact':'Current P metadata and legacy reference IDs are present in the unchanged input. Some such metadata was displayed during the first pass and the A006 bundle-manifest inspection. No old D record, author decision, other round result or synthesis was opened or followed. Equality checks include these metadata bytes without treating their verdicts as scientific authority.','limits':'No image inspection, source-map verification, practical execution, human approval or new learner performance. English/canonical fields are the exactly matched existing native V3/JSONL fields; bundle review_input_json page contexts are primarily German.','inputs':{'manifest':pin(p/'review-bundle-manifest.json'),'bundleReviewInput':pin(bundle_file),'nativeBilingualInput':pin(p/'description-review-input.json'),'assignedJsonl':pin(batch_file)},'allFullContextsExactlyEqual':True,'goalCount':len(checks),'goalChecks':checks}
 proof_path=own/'bundle-review-input-equivalence.actual.receipt.json';write(proof_path,proof)
 old_records=p/'results'/(batch['batchId']+'.records.jsonl');old_run=p/'results'/(batch['batchId']+'.run.json');first=own/'independent-first-pass.receipt.json';seal=own/'independent-first-pass.seal.json'
 original_pins={k:pin(x) for k,x in [('nativeRecords',old_records),('nativeRun',old_run),('originalFirstPassReceipt',first),('originalFirstPassSeal',seal)]}
 sealed=json.loads(seal.read_text())
 for name,expected in sealed['files'].items():
  x=pathlib.Path(name);assert 'sha256:'+pin(x)['sha256']==expected
 original=json.loads(old_run.read_text());old_artifact=next(x for x in original['inputArtifacts'] if x['role']=='review_input_json')
 if n<6:
  successor=p/'technical-successors/bundle-review-input-binding-v1';result=successor/'results';receipts=successor/'reviewer-receipts';result.mkdir(parents=True,exist_ok=True)
  records=result/old_records.name;assert not records.exists();records.write_bytes(old_records.read_bytes())
  corrected=copy.deepcopy(original);new_artifact=next(x for x in corrected['inputArtifacts'] if x['role']=='review_input_json');new_artifact['digest']=artifact['digest']
  assert corrected!=original
  comparison=copy.deepcopy(corrected);next(x for x in comparison['inputArtifacts'] if x['role']=='review_input_json')['digest']=old_artifact['digest'];assert comparison==original
  run=result/old_run.name;write(run,corrected)
  assert records.read_bytes()==old_records.read_bytes()
  correction={'schemaVersion':1,'correctedAt':now(),'reviewerId':agent,'correctionType':'review_input_json_artifact_binding_only','newReviewVote':False,'newScientificJudgment':False,'newModelInvocation':False,'originalRunTimesPreserved':True,'runIdPreserved':True,'recordBytesPreserved':True,'allOtherRunFieldsPreserved':True,'peerResultsReadBeforeOwnSeal':False,'originals':original_pins,'equivalenceReceipt':pin(proof_path),'correctArtifact':artifact,'previousIncorrectArtifact':old_artifact,'correctedNativeRun':pin(run),'unchangedNativeRecords':pin(records),'explanation':'The original authoring helper incorrectly used SHA256(description-review-input.json) for role review_input_json. This technical successor binds the actually read and structurally equal bundle review-input surface. Existing judgment records, run identity, model metadata and original review times remain unchanged. The successor is a replacement transport representation of the same one vote; never count both originals and successor.'}
  correction_path=receipts/'technical-artifact-binding-correction.receipt.json';write(correction_path,correction)
  adapter={'reviewerId':agent,'reviewMode':'stock_blind_final_input_first_pass','finalInputActuallyRead':True,'peerResultsReadBeforeOwnSeal':False,'nativeRun':pin(run),'nativeRecords':pin(records),'originalFirstPassReceipt':pin(first),'originalFirstPassSeal':pin(seal),'technicalCorrectionReceipt':pin(correction_path),'adapterWrittenAt':now(),'newReviewVote':False,'note':'Technical transport successor for the same original first-pass vote. Original review times and provider/model details are preserved. The original files remain unchanged. Use this directory instead of, never in addition to, original results.'}
  adapter_path=receipts/'ADAPTER.actual-final-first-pass.receipt.json';write(adapter_path,adapter)
  successor_seal=receipts/'technical-artifact-binding-correction.seal.json';write(successor_seal,{'sealedAt':now(),'newReviewVote':False,'peerResultsReadBeforeOwnSeal':False,'files':[pin(x) for x in [records,run,correction_path,adapter_path,proof_path]],'originalFirstPassSeal':pin(seal)})
  validation_receipts=receipts
 else:
  result=p/'results';validation_receipts=own
 started=now()
 args=[str(repo/'app/node_modules/.bin/tsx'),'scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(p/'review-bundle-manifest.json'),'--input',str(p/'description-review-input.json'),'--campaign',str(p/'description-review-campaign.json'),'--batches-dir',str(p/'batches'),'--results-dir',str(result)]
 completed=subprocess.run(args,cwd=repo/'app',capture_output=True,text=True)
 validation={'startedAt':started,'completedAt':now(),'exitCode':completed.returncode,'command':args,'stdout':completed.stdout,'stderr':completed.stderr,'newReviewVote':False}
 execution=validation_receipts/'stock-campaign-results-check.execution.json';write(execution,validation)
 assert completed.returncode==0,validation
 for key,x in [('nativeRecords',old_records),('nativeRun',old_run),('originalFirstPassReceipt',first),('originalFirstPassSeal',seal)]:assert pin(x)==original_pins[key]
 print(json.dumps({'batch':n,'proof':pin(proof_path),'resultsDirectory':str(result.relative_to(repo)),'stockValidation':pin(execution),'exitCode':completed.returncode,'successorSeal':pin(successor_seal) if n<6 else None},ensure_ascii=False))
