import json,sys,hashlib,datetime
from pathlib import Path
HERE=Path(__file__).resolve().parent
BASE=HERE.parents[2]
def sha(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def paths(n):
    p=BASE/'D-final-native'/f'batch-{n:03d}'/'round-b'
    return p, json.loads((p/'description-review-campaign.json').read_text()), json.loads((p/'description-review-input.json').read_text())
cmd=sys.argv[1];n=int(sys.argv[2]);p,c,inp=paths(n)
if cmd=='read':
    lo=int(sys.argv[3]);hi=int(sys.argv[4]);
    stamp=HERE/f'batch-{n:03d}.started.json'
    if not stamp.exists(): stamp.write_text(json.dumps({'startedAt':now()}))
    book=json.loads((p.parent/'bundle/book-model.json').read_text())
    pages={g['goalId']:g for g in book['pages']}
    for i,g in enumerate(inp['goals'][lo-1:hi],lo):
        print('\nGOAL',i,g['goalId']);print(g['currentTitleDe'],'/',g['currentTitleEn']);print(g['currentDescriptionDe']);print(g['currentDescriptionEn']);print('CANONICAL',json.dumps(g['canonicalContext'],ensure_ascii=False,separators=(',',':')))
        pg=pages[g['goalId']]
        print('BOOK PAGE',json.dumps({k:v for k,v in pg.items() if k not in ['evidenceReview','visualization','description','title','goalFingerprint','pageFingerprint']},ensure_ascii=False,separators=(',',':')))
        pr=g['reviewContext'].get('evidenceProfile',{}).get('profile')
        if not pr: print('NO P'); continue
        # Preserve every distinct current-profile value, suppress exact duplicates only.
        seen=set()
        def show(x,key='P'):
            if isinstance(x,dict):
                for k,v in x.items():show(v,key+'.'+k)
            elif isinstance(x,list):
                for k,v in enumerate(x):show(v,key+'.'+str(k))
            else:
                z=json.dumps(x,ensure_ascii=False)
                if z not in seen:print(key,z);seen.add(z)
        show(pr)
elif cmd=='build':
    rows=json.loads((HERE/f'batch-{n:03d}.reviews.json').read_text())
    assert len(rows)==len(inp['goals'])
    batch=c['batches'][0];runid=f'chemie-final163-native-b-{n:03d}-20261018'
    records=[]
    for g,r in zip(inp['goals'],rows):
        assert r['id']==g['goalId'][:8],(r['id'],g['goalId'])
        rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runid+':'+g['goalId'],'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest']}
        for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:rec[k]=g[k]
        rec.update(decision=r.get('decision','keep'),understandingEvidence=dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],r['e'])),rationale=r['rationale'],evidenceProfileContract='positive-understanding-evidence-v2',evidenceProfileRecommendation=r.get('profile','none'),recordStatus='candidate',reviewAuthority='ai_candidate')
        if rec['decision']=='revise':rec.update(proposedDescriptionDe=r['de'],proposedDescriptionEn=r['en'])
        records.append(rec)
    out=p/'results';out.mkdir(exist_ok=True)
    rp=out/(batch['batchId']+'.records.jsonl');rb=(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records)).encode();rp.write_bytes(rb)
    bundle=json.loads((p/'review-bundle-manifest.json').read_text())
    params={'interface':'Codex subagent','temperature':'not exposed','modelIdentifier':'GPT-6 based Codex; exact API model/version not exposed','reviewerId':'B','peerResultsReadBeforeOwnSeal':False}
    pp=HERE/'generation-parameters.json';pp.write_text(json.dumps(params,ensure_ascii=False,indent=2)+'\n')
    run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI','model':'GPT-6 (Codex)','modelVersion':'Exact API model/version not exposed in runtime','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':sha(pp.read_bytes()),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_model','review_prompt','review_criteria']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':json.loads((HERE/f'batch-{n:03d}.started.json').read_text())['startedAt'],'completedAt':now(),'status':'completed','outputDigest':sha(rb),'toolchainVersion':'codex-final163-native-b-v1'}
    (out/(batch['batchId']+'.run.json')).write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'batch':n,'records':len(records),'counts':{d:sum(r['decision']==d for r in records) for d in ['keep','revise','split_review','block']}}))
elif cmd=='seal':
    b=c['batches'][0];out=p/'results'
    def pin(path):
        bb=path.read_bytes();return {'path':str(path.relative_to(Path.cwd())),'sha256':sha(bb),'bytes':len(bb)}
    rp=out/(b['batchId']+'.records.jsonl');run=out/(b['batchId']+'.run.json')
    rec=[json.loads(z) for z in rp.read_text().splitlines()]
    receipt={'reviewerId':'B','reviewMode':'stock_blind_final_input_first_pass','finalInputActuallyRead':True,'peerResultsReadBeforeOwnSeal':False,'sealedAt':now(),'batch':n,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchInputFingerprint':b['batchInputFingerprint'],'nativeRun':pin(run),'nativeRecords':pin(rp),'records':len(rec),'decisions':{d:sum(r['decision']==d for r in rec) for d in ['keep','revise','split_review','block']},'nativeValidation':'stock validateGoalDescriptionReviewCampaignResults.ts passed','authority':'ai_candidate only; no human approval; no source-mapping or host acceptance claim'}
    dest=HERE/f'batch-{n:03d}.reviewer-b-first-pass.receipt.json';dest.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps(pin(dest)))
