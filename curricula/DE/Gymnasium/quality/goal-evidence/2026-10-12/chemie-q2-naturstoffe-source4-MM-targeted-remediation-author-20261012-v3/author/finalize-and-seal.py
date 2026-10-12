# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json, pathlib, unicodedata, sys
R=pathlib.Path.cwd();P=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
B=P/'chemie-q2-naturstoffe-source4-MM-targeted-remediation-author-20261012-v3'
O=P/'chemie-q2-naturstoffe-current402-author-20261012-v2'
def read(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':digest(p)}
def norm(x):return ' '.join(unicodedata.normalize('NFKC',str(x or '')).split())
def stable(x):
    if isinstance(x,dict):return '{'+','.join(json.dumps(k,ensure_ascii=False)+':'+stable(v) for k,v in sorted(x.items()))+'}'
    if isinstance(x,list):return '['+','.join(stable(v) for v in x)+']'
    return json.dumps(x,ensure_ascii=False,separators=(',',':'))
def fingerprint(g,rv):
    x={'ruleVersion':rv,'goalId':g['id'],'shortKey':g.get('shortKey','')}
    for k in ['title','titleEn','description','descriptionEn','nodeKind']:x[k]=norm(g.get(k))
    for k in ['phase','area','topicCode']:x[k]=norm(g.get('dimensionTags',{}).get(k))
    return 'sha256:'+hashlib.sha256(stable(x).encode()).hexdigest()
assert not (B/'FINAL.author-package.freeze.json').exists(),'Already sealed; do not overwrite.'
land=read(B/'candidate/canonical532.current407.source4-MM.inactive.json');old=read(O/'candidate/canonical532.complete-inactive.json')
g={x['id']:x for x in land['goals']};og={x['id']:x for x in old['goals']}
ps=[json.loads(s) for s in (B/'positive/P6.actual-bound.ai-candidate.review.jsonl').read_text().splitlines()]
ids=[p['goalId'] for p in ps]
originals={x['goalId']:x for x in [json.loads(s) for s in (O/'author/A29.author-proposals.review.jsonl').read_text().splitlines()]}
ars=[]
for gid in ids:
    r=dict(originals.get(gid, next(iter(originals.values()))))
    r.update({'reviewId':'chemie-source4-mm-author-atomic6','goalId':gid,'fingerprint':fingerprint(g[gid],'semantic-atomicity-v1'),'status':'atomic','semanticAtomic':True,'reviewedAt':'2026-10-12','reviewer':'Codex author proposal; exact independent acceptance pending','reason':'One integrated construction/interpretation or guided execution remains. Substance/method variants keep explicit original source operators and do not erase source/track bounds. This is an author hypothesis for the exact new material, not reuse of prior independent votes.','suggestedSplit':[]})
    ars.append(r)
(B/'author/A6.author-proposals.review.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in ars))
write(B/'author/A6.author-proposals.config.json',{'schemaVersion':1,'reviewId':'chemie-source4-mm-author-atomic6','ruleVersion':'semantic-atomicity-v1','landscapeId':land['landscapeId'],'landscapePath':str((B/'candidate/canonical532.current407.source4-MM.inactive.json').relative_to(R)),'reviewPath':str((B/'author/A6.author-proposals.review.jsonl').relative_to(R)),'scope':{'label':'Six exact inactive author proposals, no independent acceptance','leafGoalIds':ids}})
memory=[json.loads(s) for s in (O/'memory/current407.author.necessity.jsonl').read_text().splitlines()]
md=[]
for r in memory:
    f=fingerprint(g[r['goalId']],r['ruleVersion'])
    if r['fingerprint']!=f:
        md.append({'goalId':r['goalId'],'before':r['fingerprint'],'after':f,'statusRetained':r['status']})
        r.update({'fingerprint':f,'reviewedAt':'2026-10-12','reviewer':'Codex author necessity successor; independent review pending','reason':'The exact new projection/method/model goal is demonstrated through complete worked tasks and original execution when required. No additional isolated memory card is needed; this author successor does not claim independent acceptance or override safety/context prerequisites.'})
(B/'memory').mkdir(exist_ok=True)
(B/'memory/current407.inactive.author.necessity.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in memory))
write(B/'memory/exact-necessity-fingerprint-deltas.json',{'records':md,'countedNecessityRecords':len(memory),'cardsAdded':0,'cardsChanged':0,'normalFullMemoryVisibilityGate':'pending combined root stage; no standalone M approval claimed'})

errors=[]
for relation in ['contains','requires']:
    visiting=set();done=set()
    def visit(gid):
        if gid in visiting:raise RuntimeError('cycle '+relation+' '+gid)
        if gid in done:return
        visiting.add(gid)
        for q in g[gid].get(relation,[]):
            if q not in g:raise RuntimeError('missing '+relation+' '+q)
            visit(q)
        visiting.remove(gid);done.add(gid)
    for gid in g:visit(gid)
assert set(g)==set(og)
changed=[gid for gid in g if g[gid]!=og[gid]]
assert set(changed)=={i for i in ids if i[:8] in ['978a6f25','d8eeed29','dfaef897','c245d5fd']}
assert g['2f3cdec5-f845-5b0f-841e-8b1d47de0281']==og['2f3cdec5-f845-5b0f-841e-8b1d47de0281']
assert g['e81a4aed-9695-533e-8eb7-7a0c714346ea']==og['e81a4aed-9695-533e-8eb7-7a0c714346ea']
allcases=read(B/'cases/whole5.DEEN.tasks-material-modelanswers-rubrics.json')['cases']+read(B/'cases/e81a4aed-BW-halogen-operator.DEEN.full-cases.json')['cases']
caseids={x['case']['id'] for x in allcases}
assert len(allcases)==len(caseids)==15
for x in allcases:
    assert sum(c['points'] for c in x['rubric']['criteria'])==x['rubric']['maximumPoints']
    assert x['materialAndData']['de'] and x['materialAndData']['en'] and not x['completedLearnerExecution']
    assert all(x['case'].get(k) for k in ['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn','understandingFocusDe','understandingFocusEn'])
raw=read(B/'sources/raw5.actual-literal-route-operator-audit.json')['bindings']
lits=read(B/'sources/source5.literal-inventory.actual-read.json')['records'];lm={(x['sourceExtractionPath'],x['sourceGoal']['id']):x['sourceGoal']['sourceText'] for x in lits}
for x in raw:
    assert x['literalSourceText']==lm[x['sourceExtractionPath'],x['sourceGoalId']]
    assert all(i in caseids for i in x['candidateCaseIds'])
    assert not x['wholeSourceOrTrackApproved']
for p in B.rglob('*'):
    if p.is_file() and p.suffix=='.json':read(p)
    elif p.is_file() and p.suffix=='.jsonl':
        for s in p.read_text().splitlines():
            if s.strip():json.loads(s)
write(B/'checks/targeted6.structural-bilingual-literal-and-original-preservation.actual.json',{'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidateNodes':len(g),'candidateAtomicCount':407,'deltaFrom407':0,'onlyChangedCanonicalGoals':changed,'stableIdsPreserved':True,'requiresAcyclic':True,'containsAcyclic':True,'fullNewBilingualCases':len(allcases),'sourceRawBindings':len(raw),'sourceLiteralGoals':len(lits),'allExactRawLiteralsMatch':True,'allCaseReferencesResolve':True,'specificRubricSumsPass':True,'unchangedPhysicalGoal':True,'unchangedPracticalOwnerCanonical':True,'unchangedCanonicalPartners':len(g)-len(changed),'errors':[],'scientificPassNotInferredFromChecks':True})
if '--prepare-only' in sys.argv:
    print(json.dumps({'preparedNormalAtomicityConfig':str((B/'author/A6.author-proposals.config.json').relative_to(R)),'preparedMemoryNecessity':len(memory),'structuralErrors':0,'sealed':False}));sys.exit(0)
orig_inputs=[O/'FINAL.author-package.freeze.json',P/'chemie-q2-naturstoffe-current407-fresh-independent-a-20261012-v2/FINAL.independent-a.review.freeze.json',P/'chemie-q2-naturstoffe-current407-independent-b-20261012-v2/ORIGINAL.freeze.json']
for p in orig_inputs:
    for row in read(p)['ownFiles']:assert digest(R/row['path'])==row['sha256'] and (R/row['path']).stat().st_size==row['bytes']
write(B/'checks/FINAL.original-author-A-B-owned-file-integrity.actual.json',{'seals':[ref(p) for p in orig_inputs],'allOriginalOwnedFilesMatch':True,'historicalOriginalsOverwritten':False})
entry=B/'FINAL.targeted6.neutral-review-input.json'
included=[p for p in sorted(B.rglob('*')) if p.is_file() and p!=entry and p.name!='FINAL.author-package.freeze.json']
write(entry,{'schemaVersion':1,'inputId':'chemie-source4-mm-targeted6-author-v3','role':'INACTIVE_AUTHOR_CANDIDATE','goalIds':ids,'primarySourceScopeGoalIds':[x for x in ids if not x.startswith('e81a4aed')],'existingPracticalCollateralGoalId':'e81a4aed-9695-533e-8eb7-7a0c714346ea','currentActiveAtomicCount':402,'sourceReviewedCandidateAtomicCount':407,'candidateAtomicCount':407,'atomicDeltaFrom407':0,'newIds':[],'removedIds':[],'originalAuthorSealSHA256':'sha256:99605741faec89bfc4393efab8c50211a19c2a2285019f0a79da13251e6d45d1','fileInputs':[ref(p) for p in included],'independentExactSuccessorAcceptancePending':True,'normalCompiledSourceVisibilityAndFullCollateralGates':'pending combined root stage','wholeSourceOrTrackApproved':False,'humanApproval':False,'humanTrial':False,'completedNewLaboratoryPerformance':0,'grantsCentralM7Progress':False,'activeWrites':False})
files=[p for p in sorted(B.rglob('*')) if p.is_file() and p.name!='FINAL.author-package.freeze.json']
write(B/'FINAL.author-package.freeze.json',{'schemaVersion':1,'packageId':B.name,'role':'INACTIVE_AUTHOR_SOURCE_SCOPE_REMEDIATION','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'neutralEntry':ref(entry),'ownFileCount':len(files),'ownFiles':[ref(p) for p in files],'retainedOriginalSeals':[ref(p) for p in orig_inputs],'current407DenominatorPreserved':True,'independentScientificAcceptancePending':True,'humanApproval':False,'humanTrial':False,'activeWrites':False})
print(json.dumps({'neutralEntry':str(entry.relative_to(R)),'neutralEntrySHA256':digest(entry),'ownSealSHA256':digest(B/'FINAL.author-package.freeze.json'),'sealedFiles':len(files),'goalIds':ids,'candidateAtomicCount':407},ensure_ascii=False))
