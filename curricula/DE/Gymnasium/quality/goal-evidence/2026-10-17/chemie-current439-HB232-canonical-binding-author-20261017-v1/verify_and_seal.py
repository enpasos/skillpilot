"""Bounded author-package integrity checks. No science acceptance or active writes."""
import json,pathlib,hashlib,collections,csv,io
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=pathlib.Path(__file__).resolve().parent
def read(n):return json.loads((OUT/n).read_text())
def pin(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def dump(n,x):(OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
pins=read('INPUTS.pinned.json')
for k,v in pins.items():assert pin(ROOT/v['path'])==v,('Input changed',k)
s=json.loads((ROOT/pins['source232']['path']).read_text())
c=json.loads((ROOT/pins['C650']['path']).read_text())
p={r['goalId']:r['profile'] for r in map(json.loads,(ROOT/pins['P439']['path']).read_text().splitlines())}
goals={g['id']:g for g in c['goals']}
d=read('AUTHOR.HB232.all-clause-bindings.pending.json'); rs=d['records']
assert len(rs)==232 and [r['ordinal'] for r in rs]==list(range(1,233))
assert len({r['sourceGoalId'] for r in rs})==232
assert [r['sourceGoalId'] for r in rs]==[g['id'] for g in s['sourceGoals']]
assert all(r['decision']=='pending_independent_review' and r['sourceCompletionClaimed'] is False for r in rs)
assert not any(r['status'].startswith('OPEN') for r in rs)
assert all(r['sourceSpan'] and r['sourceClauseIds'] for r in rs)
pv={x['sourceGoalId']:x for x in s['sourceGoalProvenance']}
for r,src in zip(rs,s['sourceGoals']):
    assert r['sourceText']==src['description']
    assert r['requiredOperators']==pv[src['id']]['requiredOperators']
    assert r['scopeQualifications']['courseLevelExact']==src['courseLevel']
    assert r['scopeQualifications']['sourceScopeExact']==pv[src['id']]['sourceScope']
    if r['status'].startswith('HOLD'):assert r['missingDutyDe'] and r['holdKind']=='needsCanonicalGoal/P-correction'
    else:assert r['components'] and not r['missingDutyDe']
    for i in r['canonicalGoalIds']:assert i in p and not goals[i].get('contains')
    for component in r['components']:
        assert component['rationaleDe'] and component['canonicalGoalIds']
        for e in component['wholeGoalProfileEvidence']:
            assert e['expectationIds']==[x['id'] for x in p[e['goalId']]['expectations']]
            assert e['applicationCaseIds']==[x['id'] for x in p[e['goalId']]['applicationCaseBriefs']]
term=read('AUTHOR.27-mandatory-termsets.pending.json')
assert term['termSetCount']==27 and len(term['termSets'])==27
for ts,source in zip(term['termSets'],s['mandatoryTermSets']):
    assert ts['termSetId']==source['termSetId']
    assert [x['term'] for x in ts['terms']]==source['terms']
    for x in ts['terms']:
        assert x['status'] in ['AUTHOR_term_use_candidate_pending_independent_review','HOLD_term_use_gap']
        if x['status'].startswith('HOLD'):assert x['missingUseDe']
        for i in x['canonicalGoalIds']:assert i in p and not goals[i].get('contains')
hist=read('HISTORY.40-derived-source-mappings-retired.json')
assert len(hist['derivedTeachingEntries'])==40
assert len({x['historicalSourceGoalId'] for x in hist['derivedTeachingEntries']})==40
assert all(x['new232SourceCredit'] is False for x in hist['derivedTeachingEntries'])
assert sum(r['oldIdReusedDiscoveryOnly'] for r in rs)==57
assert not any(r['oldMappingTransferred'] for r in rs)
m=read('AUTHOR.HB232.mapping-schema.pending.review.json')
assert len(m['decisions'])==232 and m['status']['authorPreparedSourceGoals']==232
assert m['status']['mappedSourceGoals']==m['status']['reviewedSourceGoals']==m['status']['unworkedSourceGoals']==0
assert all(x['reviewStatus']=='pending_independent_review' and x['activationAllowed'] is False for x in m['mappings'])
assert len(s['optionalSourceSuggestions'])==113
e=read('EVIDENCE.whole-selected-current-goals-and-profiles.json')
needed=set(i for r in rs for i in r['canonicalGoalIds'])|set(i for ts in term['termSets'] for t in ts['terms'] for i in t['canonicalGoalIds'])
assert {r['goal']['id'] for r in e['records']}==needed
for r in e['records']:assert r['goal']==goals[r['goal']['id']] and r['profile']==p[r['goal']['id']]
counts=collections.Counter(r['status'] for r in rs)
termcounts=collections.Counter(t['status'] for ts in term['termSets'] for t in ts['terms'])
def tsv(n,header,rows):
    f=io.StringIO();w=csv.writer(f,delimiter='\t',lineterminator='\n');w.writerow(header);w.writerows(rows);(OUT/n).write_text(f.getvalue())
tsv('ROSTER.all232.tsv',['ordinal','sourceGoalId','topic','course','status','canonicalGoalIds','missingDutyDe'],[(r['ordinal'],r['sourceGoalId'],r['topicCode'],r['scopeQualifications']['courseLevelExact'],r['status'],';'.join(r['canonicalGoalIds']),r['missingDutyDe']) for r in rs])
tsv('HOLDS.exact45.tsv',['ordinal','sourceGoalId','missingDutyDe'],[(r['ordinal'],r['sourceGoalId'],r['missingDutyDe']) for r in rs if r['status'].startswith('HOLD')])
tsv('HOLDS.terms.exact21.tsv',['termSetId','term','missingUseDe'],[(ts['termSetId'],t['term'],t['missingUseDe']) for ts in term['termSets'] for t in ts['terms'] if t['status'].startswith('HOLD')])
checks={'result':'PASS bounded author-package integrity only','clauseCount':232,'authorPrepared':232,'unworked':0,'clauseCounts':dict(counts),'termSetCount':27,'termEntryCount':sum(len(ts['terms']) for ts in term['termSets']),'termCounts':dict(termcounts),'wholeCarrierGoalCount':len(needed),'proposedPartialMappingLinks':len(m['mappings']),'independentMappingsApproved':0,'inputPinsUnchanged':True,'inputPinCount':len(pins),'allCarrierUUIDsAtomicAndInCurrent439P':True,'sourceOperatorsAndScopesExact':True,'all232SourceIdsAndClauseBodiesPreserved':True,'reused57IdsRejudgedWithoutOldMappingTransfer':True,'derived40NoPrimaryCredit':True,'optional113RemainOptional':True,'nativeDOrScienceAcceptanceClaimed':False,'activeOrGitWritesByPackage':False}
dump('CHECKS.bounded-author-package.json',checks)
(OUT/'STATUS.md').write_text('# HB232 author candidate — pending independent review\n\n232/232 clauses authored; no unworked rows.\n\n'+ '\n'.join(f'- {k}: {v}' for k,v in counts.items())+'\n\n27 mandatory term sets; 247 vocabulary entries: 226 use candidates and 21 concrete gaps.\n\nAll 465 partial mapping links remain pending independent review. 57 reused IDs were reconsidered; 40 derived historical entries receive no primary credit; 113 optional suggestions remain optional. No active source/canonical/P/registry/gate/runtime/Git changes, human approval or global M7 claim.\n\nBounded input, full roster, atomic UUID, operator/scope and whole-body equality checks: PASS. Source inventory fidelity reused from paired receipt.\n')
files=[p for p in sorted(OUT.iterdir()) if p.is_file() and not p.name.startswith('SELECTOR.')]
selector={'role':'Sealed complete finite HB232 canonical-binding AUTHOR candidate; all science pending independent review','inputPins':pins,'outputPins':[pin(p) for p in files],'checks':checks,'sourceFidelityReReview':False,'sourceActivated':False,'canonicalPRegistryOrRuntimeMutated':False,'independentReviewClaimed':False,'nativeDManifest':False,'humanApproval':False,'globalM7Claimed':False,'coauthorship':'A authored1–152 and term27; bounded child authored153–232. Neither is independent of their own proposed mappings.'}
dump('SELECTOR.HB232-canonical-binding-author.complete.pending.sealed.json',selector)
sel=OUT/'SELECTOR.HB232-canonical-binding-author.complete.pending.sealed.json'
(OUT/'SELECTOR.HB232-canonical-binding-author.complete.pending.sealed.sha256').write_text(hashlib.sha256(sel.read_bytes()).hexdigest()+'  '+sel.name+'\n')
print(json.dumps({'checks':checks,'selector':pin(sel)}))
