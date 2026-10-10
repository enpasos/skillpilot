import json,pathlib,hashlib,subprocess,collections
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';OUT=Q/'wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1'
def load(p):return json.loads(pathlib.Path(p).read_text())
def write(p,d):p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def rel(p):return str(pathlib.Path(p).relative_to(ROOT))
def bind(p):p=pathlib.Path(p);return {'path':rel(p),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
core=OUT/'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';CAN=load(core);goals={g['id']:g for g in CAN['goals']}; work=load(OUT/'actual-SEM-A-M-P-common-native-binding-worklist.INERT.json');changed=work['oldChangedSemanticIDs'];new=work['newOrdinaryIDs'];ordinary=sorted(work['nativeAMRawIDs']+changed+new); assert len(ordinary)==343
# Mechanical publication status only after root's whole scientific+scope qualification; human approval remains absent.
EU=Q/'wirtschaft-EU-two-whole-materials-and-23-owned-role-proposals-independent-root-v1/actual-independent-EU-materials-and-owned-retention-bounded.receipt.json'
BB=Q/'wirtschaft-BB-four-whole-goals-eight-cases-local-practice-independent-a-M6-review-INERT-v1/actual-independent-BB4-goals-eight-cases-48BE-source-choice-A4M4.SEALED.receipt.json'
DDrefs=list(Q.glob('wirtschaft-*/*receipt*.json'))
practice=[]
DDproof=Q/'wirtschaft-f08-036ea-two-whole-material-contracts-independent-root-v1/actual-two-whole-bilingual-materials-four-case-answers.independent-KEEP-only.receipt.json'
for gid in ['f6bc5493-e138-5717-a027-e0579c80d687','0b3dbe47-9b98-5540-92e5-a8edf1693b96','38b58eb0-ff40-5209-a872-797910ddab5f','f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96','036ea7f9-2a33-502f-8729-983fa8054694']:
 g=goals[gid];g['examData']['reviewStatus']='released';ref=BB if gid.startswith('38b') else (DDproof if gid.startswith(('f08','036ea')) else EU)
 note=' Native M6 publication descriptor after actual whole content/scope KEEP: '+rel(ref)+'. AI evidence E1/G1; no human release approval or learner performance.'
 if note not in g['examData'].get('reviewNote',''):g['examData']['reviewNote']=g['examData'].get('reviewNote','')+note
 practice.append({'goalId':gid,'field':'/examData/reviewStatus','before':'needs_review','after':'released','actualIndependentProof':bind(ref),'humanApproval':False})
# dd38/f08 and543/036ea remain pending until explicit exact proof supplied by Root; no unsupported release claim.
write(core,CAN);write(OUT/'actual-three-whole-qualified-practice-status-bindings.INERT.json',practice)
# Preserve every unaffected whole card and apply only independently closed three replacements + one public-good addition.
C=load(Q/'wirtschaft-nairu-memory-threshold-one-back-string-ADDENDUM-AUTHOR-INERT-root-v2/three-whole-cards.only-one-NAIRU-back-string.AUTHOR-INERT.json');C['replaced'].append(load(Q/'wirtschaft-625-three-required-environment-types-card-ADDENDUM-AUTHOR-INERT-root-v1/whole625-card.only-required-three-types.AUTHOR-INERT.json'));rep={c['id']:c for c in C['replaced']};cardchanges=[]
for lane in ['market_order_policy','macro_money_policy']:
 name='de_gymnasium_economics_flashcards_'+lane+'.de.json';d=load(ROOT/'curricula/DE/Gymnasium/memory-decks'/name);old={c['id']:c for c in d['cards']};d['cards']=[rep.get(c['id'],c) for c in d['cards']]
 if lane=='market_order_policy':d['cards']+=C['added']
 for c in d['cards']:
  if c['id'] not in rep and c['id'] not in {x['id'] for x in C['added']}:assert c==old[c['id']]
 for kind in ['canonical','runtime']:write(OUT/'candidate-memory'/kind/name,d)
 cardchanges.append({'deck':name,'replacements':[x for x in rep if x in old],'additions':[c['id'] for c in C['added']] if lane=='market_order_policy' else [],'allOtherWholeCardsExact':True})
write(OUT/'actual-three-card-replacements-one-addition-other63-raw-exact.INERT.json',cardchanges)
node=(pathlib.Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip());r=subprocess.run([node,str(ROOT/'app/node_modules/tsx/dist/cli.mjs'),str(OUT/'materialize-native-SEM-A-M-fingerprints.READONLY.ts')],cwd=ROOT,capture_output=True,text=True);assert r.returncode==0,r.stderr;print(r.stdout.strip())
FP=load(OUT/'actual-native-SEM-A-M-689-and-two-decks-fingerprints.READONLY.json');fps={x['goalId']:x for x in FP['rows']}
oldSEM=load(next((OUT/'retained-current-configs').glob('semantic*.json')));SEMs={d['goalId']:d for d in oldSEM['decisions']}
oldSEM['sourceLandscapePath']=rel(core);oldSEM['ledgerId']='wirtschaft-common689-343-qualified-M6-native-fieldwise-20261010-v1';oldSEM['decisions']=[]
for g in CAN['goals']:
 d=dict(SEMs[g['id']]) if g['id'] in SEMs else {'goalId':g['id'],'semanticKind':'curricularAtomic' if g['id'] in new else ('practiceAssessment' if 'examData' in g else 'curricularArea'),'decisionStatus':'authoritative','decisionBasis':('reviewed-current-post-split-curricular-atomic' if g['id'] in new else ('reviewed-current-post-split-practice-assessment' if 'examData' in g else 'reviewed-current-post-split-curricular-area'))}
 d['sourceFingerprint']=fps[g['id']]['SEM'];oldSEM['decisions'].append(d)
oldSEM['counts']={'total':len(CAN['goals']),**dict(collections.Counter(x['semanticKind'] for x in oldSEM['decisions']))};write(OUT/'semantic689.candidate-bound.INERT.json',oldSEM)
unitP=Q/'wirtschaft-twelve-already-whole-reviewed-contracts-bounded-atomicity-confirmations-independent-a-INERT-v1/twelve-individual-semantic-atomicity-confirmations.NO-NATIVE-FINGERPRINTS.json';units={x['goalId']:x for x in load(unitP)['records']}
bbP=Q/'wirtschaft-BB-four-whole-goals-eight-cases-local-practice-independent-a-M6-review-INERT-v1/four-whole-goal-individual-independent-A-and-M-decisions.NO-NATIVE-FINGERPRINTS.json';bbs={x['goalId']:x for x in load(bbP)['decisions']}
rootMP=Q/'wirtschaft-five-semantic-successor-memory-decisions-three-cards-AUTHOR-INERT-root-v1/five-goal-memory-decisions.no-native-fingerprints.AUTHOR-INERT.json';ms={x['goalId']:x for x in load(rootMP)['decisions']}
oldA={x['goalId']:x for x in map(json.loads,(OUT/'retained-current-ledgers/atomicity336.current-raw.EXACT.jsonl').read_text().splitlines())};oldM={x['goalId']:x for x in map(json.loads,(OUT/'retained-current-ledgers/memory336.current-raw.EXACT.jsonl').read_text().splitlines())}
base={'schemaVersion':1,'reviewId':'canonical-economics-full','landscapeId':CAN['landscapeId'],'reviewedAt':'2026-10-10','reviewer':'common-native-binding-adapter; underlying independent scientific reviewers identified in reason'}
scienceByGoal={
 'dd38e0c5-d77b-5893-815c-548ea2a84429':Q/'wirtschaft-dd38-one-whole-goal-two-case-independent-science-root-review-v1/actual-retained-hours-two-whole-case-answers-independent-KEEP-only.receipt.json',
 '543bf91f-f6c6-5b1b-ba9e-43de321d8c7f':Q/'wirtschaft-543b-andda734-two-whole-goals-four-case-independent-science-root-review-v1/actual-two-whole-poverty-goals-four-case-answers-independent-KEEP-only.receipt.json',
 '648224f4-cc8f-5f41-9cae-6d783cd1ae77':Q/'wirtschaft-6482-three-whole-goals-six-case-independent-science-root-review-v1/actual-three-whole-EU-goals-six-case-answers-independent-content-and-two-followups.receipt.json',
 '7c72848d-8bc9-58e2-a690-fd17ac650a88':Q/'wirtschaft-7c-and121-two-whole-goals-six-case-independent-science-root-review-v1/actual-two-whole-atomic-content-candidates-six-case-answers-independent-KEEP-only.receipt.json',
}
newA=[];newM=[]
for gid in changed+new:
 a={**oldA.get(gid,base),'fingerprint':fps[gid]['A'],'goalId':gid,'ruleVersion':'semantic-atomicity-v1','status':'atomic','semanticAtomic':True,'reviewedAt':'2026-10-10','reviewer':base['reviewer']}
 if gid in units:reason=units[gid]['reasonDe'];ref=unitP
 elif gid in bbs:reason=bbs[gid]['atomicityReasonDe'];ref=bbP
 else:reason='Die tatsächlich unabhängig geprüfte eingegrenzte Kompetenz ist eine einzelne materialgebundene Leistung; dd38 Arbeitsstunden-/Beschäftigungswirkung,543 vergleichende Armutsindikatoranalyse,648 wirtschafts-/fiskalpolitische EU-Koordinierung. Vorherige überbreite Proxyentscheidung wird nicht unbesehen fortgeschrieben.';ref=EU if gid.startswith('648') else Q/'wirtschaft-dd38-543b-f08-036ea-explicit-existing-role-retention-ADDENDUM-INERT-round-b-v1/SEALED-additive-INERT-handoff.json'
 if gid in scienceByGoal:ref=scienceByGoal[gid]
 if gid in scienceByGoal and gid!='7c72848d-8bc9-58e2-a690-fd17ac650a88':reason+=' Explizite unabhängige Einzel-A/M-Entscheidung: '+rel(Q/'wirtschaft-three-narrowed-existing-contracts-explicit-AM-independent-root-v1/actual-three-existing-narrowed-contracts-explicit-independent-AM.receipt.json')+'.'
 a['reason']=reason+' Wissenschaftliche Belege: '+rel(ref)+(('; explicit bounded A unit confirmation: '+rel(unitP)) if gid in units else '')+'. Native fingerprint adapter only; no new scientific self-approval.';newA.append(a)
 m={**oldM.get(gid,base),'fingerprint':fps[gid]['M'],'goalId':gid,'ruleVersion':'memory-card-review-v1','reviewedAt':'2026-10-10','reviewer':base['reviewer']}
 if gid in ms:
  x=ms[gid];m.update({k:x[k] for k in ['status','memoryUseful','memoryGoalIds','deckIds']});reason=x['reasonDe'];ref=Q/'wirtschaft-five-semantic-successor-memory-three-cards-independent-a-INERT-v1'
 elif gid in bbs:
  x=bbs[gid];m.update(status=x['memoryDecision'],memoryUseful=x['memoryUseful'],memoryGoalIds=x['memoryGoalIds'],deckIds=x['deckIds']);reason=x['memoryReasonDe'];ref=bbP
 else:
  reason='Die unabhängige ganze Beschreibungskorrektur erhält die individuelle bestehende Memoryentscheidung; bereitgestellte Fall-/Materialanalyse fügt keine Abrufquote hinzu. '+oldM[gid]['reason'];ref=Q/'wirtschaft-final56-seven-description-remedies-whole-independent-a-v1'
 if gid in scienceByGoal:
  ref=scienceByGoal[gid]
  if gid not in ms:reason='Individuelle bestehende '+oldM[gid]['status']+'-Entscheidung nach tatsächlicher unabhängiger Prüfung des eingegrenzten ganzen Lernziel-/P-Vertrags beibehalten; die aktuelle materialgebundene Leistung fügt keine unbereitgestellte Abrufpflicht hinzu. '+oldM[gid]['reason']
 if gid in scienceByGoal and gid!='7c72848d-8bc9-58e2-a690-fd17ac650a88':reason+=' Explizite unabhängig bestätigte individuelle Memoryentscheidung: '+rel(Q/'wirtschaft-three-narrowed-existing-contracts-explicit-AM-independent-root-v1/actual-three-existing-narrowed-contracts-explicit-independent-AM.receipt.json')+'.'
 m['reason']=reason+' Tatsächlicher Science-Beleg: '+rel(ref)+(('; separate individual Memory KEEP: '+str((Q/'wirtschaft-five-semantic-successor-memory-three-cards-independent-a-INERT-v1').relative_to(ROOT))) if gid in ms else '')+'. Native binding only; no human approval.';newM.append(m)
for lane,rows in [('atomicity',newA),('memory',newM)]:
 raw=(OUT/f'retained-current-ledgers/{lane}324.raw-unchanged.EXACT.jsonl').read_bytes();assert len(raw.splitlines())==324
 p=OUT/lane/f'{lane}343.324-raw-exact-19-qualified-native.review.jsonl';p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw+b''.join((json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n').encode() for x in rows));assert len(p.read_bytes().splitlines())==343
cards={x['cardId']:x for x in FP['cards']};affected=set(rep)|{x['id'] for x in C['added']};allraw=(OUT/'retained-current-ledgers/current-card-reviews.EXACT.jsonl').read_bytes().splitlines(keepends=True);raw=b''.join(line for line in allraw if json.loads(line)['cardId'] not in affected);assert len(raw.splitlines())==63
oldCard={json.loads(l)['cardId']:json.loads(l) for l in allraw};newCards=[]
for cid in sorted(affected):
 c=cards[cid];r={**oldCard.get(cid,base),'ruleVersion':'memory-card-review-v1','deckId':c['deckId'],'cardId':cid,'fingerprint':c['fingerprint'],'status':'kept','necessary':True,'originGoalIds':c['originGoalIds'],'reviewedAt':'2026-10-10','reviewer':base['reviewer'],'reason':'Fachlich eigener passender kompakter Memoryanker, unverändert aus tatsächlich unabhängig qualifiziertem Nachfolger übernommen. NAIRU Δπ=0; Monopoly bedingte Marktmacht; Public-Goods zwei Definitionen;625 genau drei erforderliche Umweltinstrumenttypen. Quellen: '+str(Q.relative_to(ROOT))+'/wirtschaft-five-semantic-successor-memory-three-cards-independent-a-INERT-v1; wirtschaft-625-three-environment-types-card-independent-a-closure-INERT-v1; wirtschaft-nairu-memory-threshold-one-back-string-independent-a-closure-INERT-v1/independent-targeted-closure.receipt.json. Native fingerprint binding only, no learner performance/human approval.'};newCards.append(r)
p=OUT/'memory/cards67.63-raw-exact-four-qualified-native.review.jsonl';p.write_bytes(raw+b''.join((json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n').encode() for r in newCards));assert len(p.read_bytes().splitlines())==67
for lane in ['atomicity','memory']:
 cfg=load(next((OUT/'retained-current-configs').glob(lane+'*.json')));cfg.update(landscapePath=rel(core),reviewPath=rel(OUT/lane/f'{lane}343.324-raw-exact-19-qualified-native.review.jsonl'),semanticKindLedgerPath=rel(OUT/'semantic689.candidate-bound.INERT.json'));cfg['scope']={'label':'343 actual curricularAtomic common689: unchanged324 native raw records plus19 independently qualified successor/new records','leafGoalIds':ordinary}
 if lane=='memory':cfg['scope']={'label':'343 ordinary and10 memory goals under current whole canonical root;324 raw exact plus19 qualified native bindings','rootGoalIds':['96183c48-b499-54d7-8530-578f6ff40207']};cfg.update(cardReviewPath=rel(OUT/'memory/cards67.63-raw-exact-four-qualified-native.review.jsonl'),reportPath=rel(OUT/'memory/native-memory343-report.INERT.md'));cfg['visibilityScopes']=[{'label':p.name,'viewPath':rel(p)} for p in sorted((OUT/'candidate-views').glob('*.view.json'))]
 write(OUT/lane/f'{lane}343.candidate-bound.INERT.config.json',cfg)
write(OUT/'actual-native-SEM-A-M-materialization-handoff.INERT.json',{'role':'TECHNICAL_ADAPTER_OF_EXISTING_INDEPENDENT_SCIENCE_ONLY','SEM':bind(OUT/'semantic689.candidate-bound.INERT.json'),'A343':bind(OUT/'atomicity/atomicity343.324-raw-exact-19-qualified-native.review.jsonl'),'M343':bind(OUT/'memory/memory343.324-raw-exact-19-qualified-native.review.jsonl'),'Cards67':bind(OUT/'memory/cards67.63-raw-exact-four-qualified-native.review.jsonl'),'raw324AandMexact':True,'raw63Cardsexact':True,'newScienceSelfApproval':False,'M6FinalClaim':False,'sourceClosurePending':True,'V19notRebound':True,'current679ResourceLinksExact':True})
print(json.dumps({'SEM':oldSEM['counts'],'A343':343,'M343':343,'Cards67':67,'candidateCore':bind(core),'candidateSEM':bind(OUT/'semantic689.candidate-bound.INERT.json')},indent=2))
