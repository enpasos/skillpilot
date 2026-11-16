from pathlib import Path
import json,hashlib,datetime,collections,importlib.metadata
from jsonschema import Draft202012Validator
root=Path('tmp/physics-release840-20261115/refined10');r=root/'ten-native-d/round-a';out=Path('tmp/physics-current10-inputrevision2-a-20261115')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
run='physics-current10-inputrevision2-a-20261115'
before=json.loads((out/'input-pins.before.json').read_text());el=json.loads((out/'eligibility-initial.json').read_text())
a=[json.loads(s) for s in (r/'batches/independent-a-inputrevision2.batch-001.input.jsonl').read_text().splitlines()]
c=json.loads((r/'description-review-campaign.json').read_text());bm=json.loads((root/'ten-review-bundle/book-model.json').read_text());rec=[json.loads(s) for s in (out/'records.jsonl').read_text().splitlines()]
schema=json.loads((r/'contracts/goal-description-review-record.schema.json').read_text());Draft202012Validator.check_schema(schema);v=Draft202012Validator(schema)
errs=[{'ordinal':i,'path':list(e.path),'message':e.message} for i,q in enumerate(rec,1) for e in v.iter_errors(q)]
check={}
check['exactlyTenRecords']=len(rec)==len(a)==c['goalCount']==10
check['schemaValid']=not errs
check['assignedOrder']=[x['goalId'] for x in rec]==c['batches'][0]['goalIds']==a[0]['batchGoalIds']
check['uniqueGoalIds']=len({q['goalId'] for q in rec})==10
check['uniqueRecordIds']=len({q['recordId'] for q in rec})==10
check['candidateAiAuthorityOnly']=all(q['recordStatus']=='candidate' and q['reviewAuthority']=='ai_candidate' for q in rec)
keys=['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']
check['exactCurrentGoalAndTextBindings']=all(all(q[k]==x['goal'][k] for k in keys) for q,x in zip(rec,a))
check['exactCurrentCampaignRoundBindings']=all(q['campaignId']==c['campaignId'] and q['roundId']==c['roundId'] for q in rec)
check['exactCurrentBundleBookBindings']=all(q['bundleFingerprint']==x['bundleFingerprint']==c['bundleFingerprint']=='sha256:009845e47ea3d42fa2d429beb00e25ab9c1986416bdc5f1c5536002b8673941a' and q['bookDigest']==x['bookDigest']==c['bookDigest']==bm['digest']=='sha256:61f177eb8b0652f240480bdbe55974473d97691f23ce68051a3ff71d08c2fecf' for q,x in zip(rec,a))
check['locallyAssignedNewRunId']=all(q['runId']==run for q in rec)
check['runIdAbsentFromSuppliedCampaignBatch']='runId' not in c and all('runId' not in x for x in a)
check['schemaRawDigestMatches']='sha256:'+sha(r/'contracts/goal-description-review-record.schema.json')==c['recordSchemaDigest']
check['promptRawDigestMatches']='sha256:'+sha(r/'prompt.md')==c['promptFingerprint']
check['criteriaRawDigestMatches']='sha256:'+sha(r/'criteria.md')==c['criteriaFingerprint']
check['newInputSealRawDigestMatches']=sha(root/'ten-current-input-revision2-seal.actual.json')=='1d379c9399080781a45e251cf20c363ab565e8366c38e004e6348c887881f30f'
check['noProposalForNonRevise']=all(('proposedDescriptionDe' not in q and 'proposedDescriptionEn' not in q) if q['decision']!='revise' else ('proposedDescriptionDe' in q and 'proposedDescriptionEn' in q) for q in rec)
check['sixEvidenceFieldsEach']=all(len(q['understandingEvidence'])==6 and all(s.strip() for s in q['understandingEvidence'].values()) for q in rec)
check['tenDistinctEvidenceChains']=len({json.dumps(q['understandingEvidence'],sort_keys=True) for q in rec})==10
check['correctProfileContract']=all(q['evidenceProfileContract']=='positive-understanding-evidence-v2' for q in rec)
check['jsonlOnlyWithFinalNewline']=len((out/'records.jsonl').read_text().splitlines())==10 and (out/'records.jsonl').read_bytes().endswith(b'\n')
originals=[]
for x in a:
 g=x['goal'];ps=[p for p in (root/'supplied-illustrations').glob(g['goalId']+'.*') if p.suffix.lower() in ['.jpg','.png']];assert len(ps)==1
 p=ps[0];originals.append({'goalId':g['goalId'],'path':str(p),'sha256':sha(p),'matchesBoundOriginalDigest':'sha256:'+sha(p)==g['reviewContext']['page']['visualization']['originalDigest']})
check['tenOriginalIllustrationsMatchBindings']=len(originals)==10 and all(x['matchesBoundOriginalDigest'] for x in originals)
m=json.loads((root/'supplied-materials/material-sources.json').read_text())
check['sixScientificMaterialFilesMatchContext']=len(m['files'])==6 and all(sha(root/'supplied-materials'/x['suppliedFile'])==x['sha256'] for x in m['files'])
pages=sorted(out.glob('physical-page-*.jpg'));check['twelvePhysicalPdfPagesRendered']=len(pages)==12
check['priorInvolvementDisclosedBeforeGoalReview']=el['eligibleForFirstEvaluationOfExactNewInputRevision'] and not el['historicallyFreshReviewer'] and not el['newIndependentPerson'] and bool(el['ownPriorInvolvement'])
check['counterpartBlindnessExplicitlyScoped']=el['blindToCounterpartCurrentAndEarlierOutputs'] and not el['earlierCounterpartVerdictsSeen']
after={p:sha(p) for p in before['files']};changed=[p for p,h in before['files'].items() if after[p]!=h];check['allFortyNewInputsUnchanged']=len(after)==40 and not changed
with (out/'input-pins.after.json').open('x') as f:f.write(json.dumps({'utc':now(),'files':after,'changedFiles':changed},indent=2)+'\n')
val={'runId':run,'validatedAtUtc':now(),'validator':{'name':'python-jsonschema','version':importlib.metadata.version('jsonschema'),'dialect':'2020-12','schemaPath':str(r/'contracts/goal-description-review-record.schema.json')},'checks':check,'allChecksPassed':all(check.values()),'schemaErrors':errs,'recordCount':len(rec),'decisionCounts':dict(collections.Counter(q['decision'] for q in rec)),'profileRecommendationCounts':dict(collections.Counter(q['evidenceProfileRecommendation'] for q in rec)),'limits':'Machine checks prove syntax, schema, order, binding copies and byte integrity. They do not prove visual viewing, historical freshness, scientific merit, learner performance, official sources, effective projections, human approval or publication authority.'}
with (out/'validation.json').open('x') as f:f.write(json.dumps(val,ensure_ascii=False,indent=2)+'\n')
if not val['allChecksPassed']:print(json.dumps(val,ensure_ascii=False,indent=2));raise SystemExit(1)
receipt={'agentTask':'/root/physics_release_finish/physics_eighteen_fresh_a','runId':run,'runIdOrigin':'locally assigned by this assignment; no supplied campaign/batch runId field','campaignId':c['campaignId'],'roundId':c['roundId'],'independenceGroupId':c['independenceGroupId'],'startedAtUtc':'2026-11-15T20:07:21Z','startSemantics':'first own UTC clock observation for this new assignment; new inputs pinned and eligibility statement written before substantive current-goal review','completedAtUtc':now(),'completionSemantics':'whole-current-input review authored and formal checks successful; final new-input hashes unchanged; receipt and final output seal follow in this same sealing step','eligibility':{**el,'reaffirmedAtCompletion':True,'noEligibilityRejectionTriggered':True,'noGenericHistoricallyFreshBlindnessClaim':True},'ownPriorInvolvement':{'sameAgentAsEarlierEighteenGoalReview':True,'ownEarlierRunIdKnownFromOwnConversation':'physics-current18-fresh-a-20261115','ownEarlierWorkRemembered':True,'oldOutputFilesReopened':False,'oldOutputsComparedOrUsedAsAuthority':False,'oldOutputsWritten':False,'oldFilesRehashed':False,'reasonOldHashesNotRechecked':'Assignment forbids reopening earlier outputs; no write outside new output directory occurred. Current byte-integrity checks cover allowed current inputs only.','historicallyFreshReviewer':False,'newIndependentPerson':False},'counterpartBlindness':{'currentCounterpartOutputsSeen':False,'earlierCounterpartOutputsSeen':False,'counterpartVerdictsInferred':False,'adjudicationsSeen':False,'canonicalDiffsSeen':False,'expectedDecisionsSupplied':False,'otherRoundOpened':False,'scope':'independent first evaluation of this exact newly sealed revision by the same previously involved reviewer, blind to counterpart outputs; not a claim of a newly unexposed person'},'inputSeal':{'path':str(root/'ten-current-input-revision2-seal.actual.json'),'sha256':sha(root/'ten-current-input-revision2-seal.actual.json')},'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'inputPinsBefore':{'path':str(out/'input-pins.before.json'),'sha256':sha(out/'input-pins.before.json'),'fileCount':40},'inputPinsAfter':{'path':str(out/'input-pins.after.json'),'sha256':sha(out/'input-pins.after.json'),'fileCount':40,'unchanged':not changed},'wholeCurrentInputRead':{'bilingualGoals':10,'wholeBilingualProfilesIncludingWrappers':10,'wholeCanonicalContexts':10,'wholeSuppliedPrerequisiteSuccessorContexts':10,'externalPrerequisiteFullTextFetched':False,'criteriaConsideredPerGoal':21},'actuallyViewed':{'tool':'view_image','manualAttestation':True,'pdf':{'source':str(root/'ten-review-bundle/book.pdf'),'physicalPageNumbers':list(range(1,13)),'frontMatter':[1,2],'goalPhysicalPages':list(range(3,13)),'renderCommand':'pdftoppm -jpeg -r 90 [new allowed book.pdf] [own new output]/physical-page','renderedFiles':[str(p) for p in pages]},'originalIllustrations':originals,'scientificPNGs':[{'path':str(root/'supplied-materials'/s),'sha256':sha(root/'supplied-materials'/s)} for s in ['cie1931-color-matching.png','spectrum-components.png','spectrum-filter-input.png']],'outputLimitCorrection':'The final helix original was omitted by one combined image-output limit, then actually displayed in a dedicated subsequent view_image call. The omitted block was not counted as a viewing.'},'machineValidation':{'path':str(out/'validation.json'),'sha256':sha(out/'validation.json'),'allChecksPassed':True},'outputs':{s:{'path':str(out/s),'sha256':sha(out/s)} for s in ['records.jsonl','review-explanation.md','eligibility-initial.json']},'authority':{'recordStatus':'candidate','reviewAuthority':'ai_candidate','humanApprovalClaimed':False,'learnerEvidenceOrMasteryClaimed':False,'officialSourceOrEffectiveProjectionApprovalClaimed':False,'publicationOrDeploymentPerformed':False,'sourceCurriculumQARegistryOrGitWritten':False}}
with (out/'receipt.json').open('x') as f:f.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
for p in out.glob('*.json'):json.loads(p.read_text())
for s in (out/'records.jsonl').read_text().splitlines():json.loads(s)
files={str(p):sha(p) for p in sorted(out.rglob('*')) if p.is_file() and p.name!='input-output-seal.json'}
seal={'sealedAtUtc':now(),'agentTask':receipt['agentTask'],'runId':run,'inputFileCount':40,'inputFiles':after,'inputBeforeAfterEqual':not changed,'outputFiles':files,'selfHashExcluded':True,'historicallyFreshReviewer':False,'counterpartOutputBlindness':True,'authorityLimit':'Byte seal only; same reviewer with disclosed own prior involvement. No learner, source, projection, human or publication approval.'}
with (out/'input-output-seal.json').open('x') as f:f.write(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
json.loads((out/'input-output-seal.json').read_text())
print('All',len(check),'checks passed; ten schema-valid current candidate records; 40 new inputs unchanged.')
for s in ['records.jsonl','receipt.json','input-output-seal.json']:print(s,sha(out/s))
