from pathlib import Path
from datetime import datetime, timezone
import concurrent.futures, copy, hashlib, json, subprocess, time

R = Path('/home/enpasos/projects/skillpilot')
Q = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
O = Path(__file__).parent
S = Q / 'wirtschaft-twelve-deferrals-native-one-and-eleven-reviewer-split-AUTHOR-INERT-v1'
P = Q / 'wirtschaft-two-P-terminology-followup-to-current-D-recommendations-AUTHOR-INERT-root-v1'
NODE = Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def obj(p): return json.loads(p.read_text())
def bind(p): return {'path':str(p.relative_to(R)), 'sha256':sha(p.read_bytes())}
def stable(x): return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def write_new(p,b):
    p.parent.mkdir(exist_ok=True,parents=True)
    with p.open('xb') as f: f.write(b)
def json_bytes(x): return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()

activation = obj(P/'03-actual-two-independently-qualified-P-terminology-corrections-and-Book-follower-activated.receipt.json')
for key in ['activeRegistry','activeBookConfig','activeWholePositive346']:
    guard=activation[key]
    assert sha((R/guard['path']).read_bytes()) == guard['sha256']
proposal=obj(P/'actual-eight-field-only-P-terminology-proposal-whole-original-two-profiles.AUTHOR-INERT.json')
approved_bodies={x['goalId']:x['candidateWholeProfile'] for x in proposal['wholeTwoProfileInputsAndCandidateBodies']}
checks=obj(O/'05-actual-current-P2-native-two-campaign-followers-prepare-check.receipt.json')
assert checks['status']=='PASS'
whitelist={'campaignId','roundId','bundleFingerprint','bookDigest','pageFingerprint'}
comparisons=[]
configs=[]
for lane in ['one-monopoly','eleven-other-deferrals']:
    old_cfg=obj(S/(lane+'.native-batch.config.json'))
    cfg_path=O/(lane+'.native-qualified-P2-follower.config.json')
    cfg=obj(cfg_path)
    assert cfg['goalIds']==old_cfg['goalIds']
    old_root=R/old_cfg['outputDirectory']
    new_root=R/cfg['outputDirectory']
    for label,role in [('round-a','first'),('round-b','second')]:
        old_dir,new_dir=old_root/label,new_root/label
        old_input,new_input=obj(old_dir/'description-review-input.json'),obj(new_dir/'description-review-input.json')
        old_campaign,new_campaign=obj(old_dir/'description-review-campaign.json'),obj(new_dir/'description-review-campaign.json')
        assert old_campaign['promptFingerprint']==new_campaign['promptFingerprint']
        assert old_campaign['criteriaFingerprint']==new_campaign['criteriaFingerprint']
        old_batch=old_campaign['batches'][0]['batchId']
        new_batch=new_campaign['batches'][0]['batchId']
        source_file=old_dir/'results'/(old_batch+'.records.jsonl')
        old_records=[json.loads(l) for l in source_file.read_text().splitlines() if l.strip()]
        records=[]
        for goal_id in cfg['goalIds']:
            before=next(x for x in old_input['goals'] if x['goalId']==goal_id)
            after=next(x for x in new_input['goals'] if x['goalId']==goal_id)
            changed_profile=goal_id in approved_bodies
            if not changed_profile:
                assert before==after,goal_id
            else:
                assert {k:v for k,v in before.items() if k not in ['pageFingerprint','reviewContext']}=={k:v for k,v in after.items() if k not in ['pageFingerprint','reviewContext']}
                a,b=before['reviewContext'],after['reviewContext']
                assert {k:v for k,v in a.items() if k not in ['page','evidenceProfile']}=={k:v for k,v in b.items() if k not in ['page','evidenceProfile']}
                assert {k:v for k,v in a['page'].items() if k not in ['evidenceReview','pageFingerprint']}=={k:v for k,v in b['page'].items() if k not in ['evidenceReview','pageFingerprint']}
                assert b['evidenceProfile']['profile']==approved_bodies[goal_id]
                for key in ['status','reviewAuthority','evidenceLevel','maximumClaimScope','reviewInputFingerprint','goalFingerprint','reviewCriteriaFingerprint','reviewRunIds','dissent']:
                    assert a['evidenceProfile'][key]==b['evidenceProfile'][key]
            old=next(x for x in old_records if x['goalId']==goal_id)
            new=copy.deepcopy(old)
            for key in ['campaignId','roundId']: new[key]=new_campaign[key]
            new['bundleFingerprint']=new_input['bundleFingerprint']
            new['bookDigest']=new_input['bookDigest']
            new['pageFingerprint']=after['pageFingerprint']
            assert {k:v for k,v in old.items() if k not in whitelist}=={k:v for k,v in new.items() if k not in whitelist}
            assert new['goalFingerprint']==after['goalFingerprint']
            records.append(new)
            comparisons.append({'goalId':goal_id,'round':role,'wholeOriginalScientificReviewRecordExactExcludingTechnicalBindings':True,'wholeCanonicalContextAndGoalDEENExact':True,'wholeCurrentInputGoalExact':not changed_profile,'onlyTwoPAndPageDeltasActuallyQualified':changed_profile,'newScientificReview':False,'originalReviewRunId':old['runId'],'originalRecordId':old['recordId'],'bindingFieldDifferences':[k for k in old if old.get(k)!=new.get(k)]})
        record_bytes=('\n'.join(json.dumps(x,ensure_ascii=False,separators=(',',':')) for x in records)+'\n').encode()
        original_run_path=old_dir/'results'/(old_batch+'.run.json')
        original_run=obj(original_run_path)
        run=copy.deepcopy(original_run)
        for key in ['campaignId','roundId','bundleFingerprint','bookDigest','promptFingerprint','criteriaFingerprint','independenceGroupId']: run[key]=new_campaign[key]
        run['batchId']=new_batch
        run['batchInputFingerprint']=new_campaign['batches'][0]['batchInputFingerprint']
        run['goalIds']=cfg['goalIds']
        run['outputDigest']=sha(record_bytes)
        bundle=obj(new_dir/'review-bundle-manifest.json')
        run['inputArtifacts']=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':sha((new_dir/'batches'/(new_batch+'.input.jsonl')).read_bytes())}]
        for key in ['runId','provider','model','startedAt','completedAt','generationParametersFingerprint','blindToOtherRuns','status','toolchainVersion']:
            assert run[key]==original_run[key]
        dest=new_dir/'results'
        write_new(dest/(new_batch+'.records.jsonl'),record_bytes)
        write_new(dest/(new_batch+'.run.json'),json_bytes(run))
        sidecar={'status':'TECHNICAL_CURRENT_CONTAINER_OF_ALREADY_ACTUAL_INDEPENDENT_REVIEW_NOT_NEW_INFERENCE','recordedAt':datetime.now(timezone.utc).isoformat(),'originalCompletedReview':bind(original_run_path),'originalResults':bind(source_file),'newScientificReview':False,'reviewIdentityProviderModelParametersAndScientificTimesWholePreserved':True,'originalBlindnessAndIndependenceFlagsAreHistoricalFacts':'Root technical composition reads both completed reviews and claims no fresh blind first pass. Flags belong to the two original independently completed scientific reviews.','reviewedP2CurrentMeaningQualifications':bind(P/'03-actual-two-independently-qualified-P-terminology-corrections-and-Book-follower-activated.receipt.json'),'humanApproval':False,'activeWrites':0}
        write_new(new_dir/'technical-preserved-current-review-container.ROOT.receipt.json',json_bytes(sidecar))
    old_authoring_path=old_root/('synthesis-authoring.ROOT.json' if lane=='one-monopoly' else 'synthesis-authoring.ROOT.description-only-P-hold-v2.json')
    authoring=obj(old_authoring_path)
    authoring['manifestId']=cfg['batchId']+'-root-resolved-current-context-synthesis'
    for d in authoring['decisions']:
        if d['goalId'] in approved_bodies:
            if d['goalId'].startswith('3e26'):
                de='Beide tatsächlich unabhängigen aktuellen Beschreibungsrunden bestätigen Datenübertragung, entlohnte Dienstleistungen und Plattformbeziehungen als getrennte Funktionen. Der P-Terminologiehinweis der ersten Runde ist durch exakt sechs Wortlautfelder des Root-Folgers und zwei unabhängige ganze P-/Vierfallprüfungen aufgelöst; Sollleistungen, Zahlen, Deckungsregeln und IDs bleiben erhalten. Die zwei gegenwärtigen P-/Seitenbindungen sind gezielt qualifiziert; alle sechs Verständnisfelder und ursprünglichen Reviewidentitäten/Zeiten beider D-Runden bleiben vollständig erhalten. Keine neue historische D-Review, ganze Sourcefreigabe oder menschliche Freigabe.'
                en='Both actually independent current description rounds confirm data transfer, paid services and platform relationships as distinct functions. The first-round P wording finding is resolved by exactly six wording fields in the Root follower and two independent whole-P/four-case checks; performances, figures, coverage rules and IDs remain. The two current P/page bindings are explicitly qualified; all six understanding fields and original review identities/times of both D rounds remain whole. No repeated historical D review, whole-source approval or human approval.'
            else:
                de='Beide tatsächlich unabhängigen aktuellen Beschreibungsrunden bestätigen Klima- und Nachhaltigkeitsrahmen als richtige gemeinsame Kategorie: SDGs sind ein Mehrzielrahmen, Paris ein Klimaabkommen. Der P-Aufgabenwortlauthinweis der ersten Runde ist durch exakt zwei DE/EN-Rahmenformulierungen des Root-Folgers und zwei unabhängige ganze P-/Vierfallprüfungen aufgelöst. Sollleistungen, Verbindlichkeitsunterscheidung, Deckungsregeln und IDs bleiben erhalten; aktuelle P-/Seitenbindungen sind gezielt qualifiziert. Die ursprüngliche tatsächliche D-Wissenschaft und Reviewzeiten bleiben vollständig erhalten, ohne neue ganze Source- oder menschliche Freigabe.'
                en='Both actually independent current description rounds confirm climate and sustainability frameworks as the correct shared category: the SDGs are a multiple-objective framework, Paris a climate agreement. The first-round task-wording finding is resolved by exactly two bilingual framework formulations in the Root follower and two independent whole-P/four-case checks. Expected performances, distinctions in commitment, coverage rules and IDs remain; current P/page bindings are explicitly qualified. Actual original D science and review times remain whole, without new whole-source or human approval.'
            d['rationaleDe'],d['rationaleEn']=de,en
    write_new(new_root/'synthesis-authoring.current-P2-qualified.ROOT.json',json_bytes(authoring))
    configs.append((lane,cfg_path,new_root))
assert len(comparisons)==24
write_new(O/'06-actual-current-P2-twelve-whole-D-science-pairs-and-bounded-meaning-comparisons.ROOT.receipt.json',json_bytes({'status':'ACTUAL_CURRENT_P2_TWENTYFOUR_SCIENCE_RECORDS_PRESERVED_AND_TWO_CONTEXT_FINDINGS_RESOLVED','recordedAt':datetime.now(timezone.utc).isoformat(),'wholeScientificRecordComparisons':comparisons,'wholeCurrentInputGoalsExactCount':20,'onlyCurrentQualifiedTwoContextInputsAcrossTwoRounds':4,'independentPMeaningQualifications':bind(P/'03-actual-two-independently-qualified-P-terminology-corrections-and-Book-follower-activated.receipt.json'),'newScientificReviewRestarts':0,'previousActualNewDescriptionReviewPairs':12,'activeWrites':0,'humanApproval':False}))

def lane_checks(lane_cfg):
    lane,cfg_path,native=lane_cfg
    calls=[('summarize','materializeGoalDescriptionRolloutBatch.ts',['summarize','--config',str(cfg_path.relative_to(R)),'--write']),('synthesis','materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',str(cfg_path.relative_to(R)),'--authoring',str((native/'synthesis-authoring.current-P2-qualified.ROOT.json').relative_to(R)),'--write']),('resolutions','materializeGoalDescriptionRolloutResolutions.ts',['--config',str(cfg_path.relative_to(R)),'--synthesis-manifest',str((native/'synthesis-decisions.json').relative_to(R)),'--write']),('finalize','materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',str(cfg_path.relative_to(R)),'--write'])]
    results=[]
    for label,script,args in calls:
        log=O/(lane+'.qualified-P2-'+label+'.actual-native.raw.txt')
        receipt=O/(lane+'.qualified-P2-'+label+'.actual-command.receipt.json')
        assert not log.exists() and not receipt.exists()
        argv=[NODE,str(R/'app/node_modules/tsx/dist/cli.mjs'),str(R/'app/scripts'/script),*args]
        started=datetime.now(timezone.utc).isoformat()
        t=time.monotonic()
        with log.open('wb') as f: completed=subprocess.run(argv,cwd=R,stdout=f,stderr=subprocess.STDOUT)
        result={'label':lane+'.qualified-P2-'+label,'actualArgv':argv,'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':completed.returncode,'rawLog':bind(log),'activeRegistryWrites':0,'humanApproval':False}
        write_new(receipt,json_bytes(result))
        results.append(result)
        print(json.dumps({'label':result['label'],'exitCode':completed.returncode}),flush=True)
        if completed.returncode: break
    return results
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
    results=list(executor.map(lane_checks,configs))
success=all(len(group)==4 and all(r['exitCode']==0 for r in group) for group in results)
write_new(O/'07-actual-two-P2-qualified-native-current-D12-campaigns-and-syntheses.receipt.json',json_bytes({'status':'PASS' if success else 'FAIL','actualChecks':results,'actualCurrentCandidateDescriptionResolutions':12 if success else None,'activeRegistryWrites':0,'humanApproval':False}))
raise SystemExit(0 if success else 1)
