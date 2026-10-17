import json,pathlib,hashlib,datetime,runpy,collections
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=pathlib.Path(__file__).resolve().parent
A=OUT.parent/'chemie-current439-source-requires-working-checkpoint-20261017-v1'
ns=runpy.run_path(str(OUT/'author_bindings.py'))
S,C,P,G,R=(ns[x] for x in ['S','C','P','G','R'])
if (OUT/'AUTHOR.last80.components.json').exists():
    for r in json.loads((OUT/'AUTHOR.last80.components.json').read_text()):
        n=r.pop('ordinal');assert n not in R;R[n]=r
prov={x['sourceGoalId']:x for x in S['sourceGoalProvenance']}
paths={'source232':A/'candidate/HB232.source-inventory.inactive.json.snapshot','C650':A/'candidate/DE_DEU_S_GYM_CANONICAL_CHEMIE.C650.inactive.json','P439':A/'candidate/P439.f79-and-SN-corrected.inactive.jsonl','SEM650':A/'candidate/SEM650.inactive.json','original70AuthorInput':A/'evidence/current439-HB232-canonical-binding-author-a-v1/author_bindings.py','oldHB97':A/'evidence/current439-HB-whole-primary-source-inventory-author-successor-v1/historical/HB97.original-exact.json.snapshot','oldHB97mapping':A/'evidence/current439-HB232-canonical-binding-author-a-v1/history/HB97.mapping.original-exact.review.json.snapshot','sourceReceipt':A/'evidence/current439-HB232-source-inventory-paired-root-closure-v1/RECEIPT.actual-paired-bounded-HB232-inventory-source-fidelity-closed.json.snapshot'}
pins={k:{'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for k,p in paths.items()}
old=json.loads(paths['oldHB97'].read_text()); oldids={g['id'] for g in old['sourceGoals']}
def dump(name,obj): (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
dump('INPUTS.pinned.json',pins)
records=[];mappings=[];used=set()
for n,s in enumerate(S['sourceGoals'],1):
    p=prov[s['id']];r=R.get(n);cs=[]
    for j,c in enumerate(r['components'] if r else [],1):
        ids=[G[i]['id'] for i in c['ordinals']]
        assert all(i in P for i in ids),'No whole P body: '+str(ids)
        used.update(ids)
        cs.append({'componentId':f'HB232-{n:03d}-C{j}','canonicalGoalIds':ids,'canonicalGoalTitles':[G[i]['title'] for i in c['ordinals']], 'requiredOperators':c.get('operators') or p['requiredOperators'],'rationaleDe':c['rationaleDe'],'wholeGoalProfileEvidence':[{'goalId':i,'expectationIds':[e['id'] for e in P[i]['expectations']],'applicationCaseIds':[a['id'] for a in P[i]['applicationCaseBriefs']]} for i in ids]})
    hold=bool(r and r.get('missing'))
    status='HOLD_needsCanonicalGoal/P-correction' if hold else 'AUTHOR_union_candidate_pending_independent_review' if r else 'OPEN_not_yet_authored'
    scope=p.get('sourceScope',{})
    qualifications={'sourceScopeExact':scope,'courseLevelExact':s['courseLevel'],'phaseTagsAreNotAuthority':True,'crossTopicScope': 'Whole applicable upper-secondary course; no Q-only restriction inferred from legacy phase:Q tag' if s['topicCode'].startswith('STD') or s['topicCode']=='PROCESS' else None,'topicChoice':'1 GK / 2 LK from 2.1,2.2,2.3,4.2; official Schwerpunkt selection not inferred' if s['topicCode'] in ['2.1','2.2','2.3','4.2'] else None,'topic4_3':'LK only, including rows labelled common within topic' if '4.3' in s['topicCode'] or '4-3-AROMATEN' in s['topicCode'] else None,'ownerBroaderTargetDoesNotMakeOfficialChoiceUniversal':True,'BcPNotGeneralChemistryCredit':True}
    ids=list(dict.fromkeys(i for c in cs for i in c['canonicalGoalIds']))
    rec={'ordinal':n,'sourceGoalId':s['id'],'sourceClauseIds':s.get('sourceClauseIds',p.get('sourceClauseIds',[])),'sourceText':s['description'],'topicCode':s['topicCode'],'sourceSpan':s.get('sourceSpan',p.get('sourceSpan')),'sourcePassageId':s['passageId'],'requiredOperators':p['requiredOperators'],'status':status,'decision':'pending_independent_review','canonicalGoalIds':ids,'components':cs,'missingDutyDe':r.get('missing','') if r else 'Diese Klausel ist noch nicht inhaltlich zugeordnet; daraus folgt weder Abdeckung noch eine fachliche Lückenfeststellung.','holdKind':r.get('holdKind') if r else 'unworked','scopeQualifications':qualifications,'oldIdReusedDiscoveryOnly':s['id'] in oldids,'oldMappingTransferred':False,'sourceCompletionClaimed':False,'extraCanonicalTeachingContent':'Only the explicitly reasoned source component is proposed. Other whole-goal duties remain canonical teaching content and do not enlarge the official source clause.'}
    records.append(rec)
    for i in ids:mappings.append({'legacyGoalId':s['id'],'canonicalGoalId':i,'matchType':'partial','reviewDecisionId':s['id'],'reviewStatus':'pending_independent_review','activationAllowed':False})
counts=dict(collections.Counter(r['status'] for r in records))
dump('AUTHOR.HB232.all-clause-bindings.pending.json',{'role':'AUTHOR candidate, including explicit unworked rows; no independent review of own/coauthored mappings','version':1,'sourceLandscapeId':S['sourceLandscapeId'],'targetLandscapeId':C['landscapeId'],'sourceInventoryPin':pins['source232'],'wholeInputPins':pins,'sourceFidelityReceipt':pins['sourceReceipt'],'counts':counts,'sourceInventoryReReviewed':False,'scopeRulesExact':S['scopeRules'],'allBindingsApproved':False,'records':records})
dump('AUTHOR.HB232.mapping-schema.pending.review.json',{'version':1,'reviewId':'chemie-HB232-canonical-binding-author-20261017-v1','sourceLandscapeId':S['sourceLandscapeId'],'targetLandscapeId':C['landscapeId'],'sourceExtractionPath':'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json','sourceExtractionExactCandidate':pins['source232'],'status':{'totalSourceGoals':232,'reviewedSourceGoals':0,'mappedSourceGoals':0,'authorPreparedSourceGoals':len(R),'unworkedSourceGoals':232-len(R),'scientificReview':'pending','active':False},'mappings':mappings,'decisions':records})
evidence=[{'goal':g,'profile':P[g['id']]} for g in C['goals'] if g['id'] in used]
if (OUT/'AUTHOR.27-mandatory-termsets.pending.json').exists():
    termdoc=json.loads((OUT/'AUTHOR.27-mandatory-termsets.pending.json').read_text())
    used.update(i for ts in termdoc.get('termSets',[]) for t in ts.get('terms',[]) if isinstance(t,dict) for i in t.get('canonicalGoalIds',[]))
    evidence=[{'goal':g,'profile':P[g['id']]} for g in C['goals'] if g['id'] in used]
dump('EVIDENCE.whole-selected-current-goals-and-profiles.json',{'role':'Scientific content bodies only; wrapper acceptance metadata not used','C650Pin':pins['C650'],'P439Pin':pins['P439'],'goalCount':len(evidence),'records':evidence})
retired=[]
oldmap=json.loads(paths['oldHB97mapping'].read_text())
for d in S['derivedTeachingEntries']:
    item=d.get('historicalSourceGoal',d.get('sourceGoal',d))
    sid=item.get('id') or d.get('historicalSourceGoalId') or d.get('sourceGoalId')
    retired.append({'historicalSourceGoalId':sid,'authority':'derived own teaching entry, no primary clause authority','retainOwnTeachingContent':True,'new232SourceCredit':False,'oldMappingsRetiredFromCurrentPrimaryInventory':[m for m in oldmap['mappings'] if m['legacyGoalId']==sid]})
dump('HISTORY.40-derived-source-mappings-retired.json',{'original97Pin':pins['oldHB97'],'originalMappingPin':pins['oldHB97mapping'],'oldBytesPreserved':True,'derivedTeachingEntries':retired})
terms=OUT/'AUTHOR.27-mandatory-termsets.pending.json'
if not terms.exists():dump(terms.name,{'role':'AUTHOR term coverage candidates; no artificial extra atoms','status':'OPEN_not_yet_authored','termSets':[{'termSetId':t.get('id',t.get('termSetId')),'original':t,'status':'OPEN_not_yet_authored','coverageCandidates':[]} for t in S['mandatoryTermSets']]})
(OUT/'STATUS.md').write_text('# HB232 author candidate — pending independent review\n\n'+f'232 source clauses retained. {len(R)} clauses have concrete author components; {232-len(R)} remain not yet authored.\n\n'+ '\n'.join(f'- {k}: {v}' for k,v in counts.items())+'\n\nAll scientific mappings remain pending independent review. No active source/mapping/canonical/P/registry/gate changes, human approval or global M7 claim. The source inventory fidelity receipt is reused, not repeated.\n')
print(json.dumps({'prepared':len(R),'remaining':232-len(R),'counts':counts,'carrierGoals':len(evidence),'mappings':len(mappings)}))
