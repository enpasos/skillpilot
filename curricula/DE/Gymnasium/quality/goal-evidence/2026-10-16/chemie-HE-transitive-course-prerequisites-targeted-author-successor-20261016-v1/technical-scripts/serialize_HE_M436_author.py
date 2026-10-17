from pathlib import Path
import json,hashlib,re,unicodedata,datetime,os
H=Path('tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1');C=Path('tmp/chemie-m7-resumed-20261016/he-transitive-course-stock-capsule');O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HE-transitive-course-prerequisites-targeted-author-successor-20261016-v1');D=O/'author-prospective-M436';D.mkdir(exist_ok=True)
def read(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);t=Path(str(p)+'.tmp');t.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def stable(x):return json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def digest(x):return 'sha256:'+hashlib.sha256(stable(x).encode()).hexdigest()
def norm(x):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(x or ''))).strip()
def goalfp(g):return digest({'ruleVersion':'memory-card-review-v1','goalId':g['id'],'shortKey':g.get('shortKey',''),'title':norm(g.get('title')),'titleEn':norm(g.get('titleEn')),'description':norm(g.get('description')),'descriptionEn':norm(g.get('descriptionEn')),'phase':norm(g.get('dimensionTags',{}).get('phase')),'area':norm(g.get('dimensionTags',{}).get('area')),'topicCode':norm(g.get('dimensionTags',{}).get('topicCode')),'nodeKind':norm(g.get('nodeKind'))})
config=read(H/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json');oldrows=(H/config['reviewPath']).read_text().splitlines();rows=[json.loads(l) for l in oldrows if l.strip()];oldcards=(H/config['cardReviewPath']).read_text().splitlines();cards=[json.loads(l) for l in oldcards if l.strip()];before={g['id']:g for g in read(H/config['landscapePath'])['goals']};after={**before}
for p in (O/'author-goal-and-course-candidates').glob('GOAL.*.after.author-draft.json'):
 g=read(p);after[g['id']]=g
assert len(rows)==435;assert all(goalfp(before[r['goalId']])==r['fingerprint'] for r in rows),'Reproduced exact current stock M fingerprints for all435 required'
Q='0e3f849b-133d-57da-882c-0d67c3eb05b8';M='03b08b91-6809-576a-8cf1-4a131caab4e5';d8='d8eeed29-d1b7-5a48-94b5-343629f8e867';now=datetime.datetime.now(datetime.timezone.utc).isoformat();author='AUTHOR /root/chemie_native17_independent_b_20261016; not independent review'
for r in rows:
 if r['goalId']==d8:r.update(fingerprint=goalfp(after[d8]),reviewedAt=now,reviewer=author,reason='AUTHOR E0/G0 successor proposal: spatially specified amino-acid representation, Fischer/DL/enantiomer reasoning and transfer need no separate memorization unit; conventional orientation is provided and application is assessed in the two full cases. Two independent content reviews remain pending.',reviewAuthority='ai_candidate',evidenceLevel='E0',maximumClaimScope='G0',HumanApproval=False,HumanTrial=False)
for r in rows:
 if r['goalId']=='0959eef2-3c7d-5b33-a109-ddf332a5dbd9':
  old=read(H/config['reviewPath']) if False else next(json.loads(l) for l in oldrows if l.strip() and json.loads(l)['goalId']==r['goalId']);write(D/'HISTORY.095-whole-M-before-reference-binding.json',old);r['memoryGoalIds']=list(dict.fromkeys(r.get('memoryGoalIds',[])+['f6d7386c-dda4-501d-84da-0c881362e724']));r['reviewedAt']=now;r['reviewer']=author;r['reason']='AUTHOR reference-binding successor only: unchanged functional-group card chem_org_q1_002 explicitly has origin095 and is selected by unchanged f6d existing selector. Actual HE-GK view replacement of broad organic recall therefore uses this real same-card reference. Original necessity/content judgment stays historical; independent scope/content reviews pending.';r['reviewAuthority']='ai_candidate';r['evidenceLevel']='E0';r['maximumClaimScope']='G0';r['memoryReferenceBindingReview']={'role':'AUTHOR same-card reference successor, not independent acceptance','selectedCardId':'chem_org_q1_002','memoryGoalId':'f6d7386c-dda4-501d-84da-0c881362e724','twoIndependentReviewsPending':True};r['HumanApproval']=False;r['HumanTrial']=False
rows.append({'schemaVersion':1,'reviewId':config['reviewId'],'ruleVersion':config['ruleVersion'],'landscapeId':config['landscapeId'],'goalId':Q,'fingerprint':goalfp(after[Q]),'status':'memory_required','memoryUseful':True,'memoryGoalIds':[M],'deckIds':['de_gymnasium_chemistry_equilibria_q3'],'reviewedAt':now,'reviewer':author,'reason':'AUTHOR E0/G0 proposal: two narrow verbal cards retain qualitative charge/electron/amount/mass laws after understanding. Actual selections012/013 do not include quantitative008; applications, model limits and fresh transfer remain ordinary performance. The memory unit follows the actual learned qualitative origin in HE-LK and valid quantitative-country routes. Two independent reviews remain pending.','reviewAuthority':'ai_candidate','evidenceLevel':'E0','maximumClaimScope':'G0','HumanApproval':False,'HumanTrial':False})
newdeck=read(O/'author-qualitative-faraday/candidate-deck/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json');olddeck=read(H/'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json');assert newdeck['cards'][:len(olddeck['cards'])]==olddeck['cards']
for c in newdeck['cards'][len(olddeck['cards']):]:
 fp=digest({'ruleVersion':config['ruleVersion'],'deckId':newdeck['deckId'],'cardId':c['id'],'front':c['front'],'back':c['back'],'category':c.get('category',''),'tags':c.get('tags',[])})
 cards.append({'schemaVersion':1,'reviewId':config['reviewId'],'ruleVersion':config['ruleVersion'],'landscapeId':config['landscapeId'],'deckId':newdeck['deckId'],'cardId':c['id'],'fingerprint':fp,'status':'kept','necessary':True,'originGoalIds':[Q],'reviewedAt':now,'reviewer':author,'reason':'AUTHOR E0/G0 kept-candidate for a pure verbal Faraday statement after acquisition; no numerical substitution or independent/human approval. Two actual independent content reviews remain pending.','reviewAuthority':'ai_candidate','evidenceLevel':'E0','maximumClaimScope':'G0','HumanApproval':False,'HumanTrial':False})
config['reviewPath']=str(D/'M436.author-candidate.review.jsonl');config['cardReviewPath']=str(D/'cards79.author-candidate.review.jsonl');config['reportPath']=str(D/'REPORT.actual-stock-M436-cards79-recall58.author.md');config['scope']['label']='Prospective AUTHOR436 ordinary with58 recall nodes; exact prior435/57 scope retained plus source-qualified Faraday addition; independent content reviews pending';config['scope']['leafGoalIds'] += [Q,M]
for p,values in [(D/'M436.author-candidate.review.jsonl',rows),(D/'cards79.author-candidate.review.jsonl',cards)]:t=Path(str(p)+'.tmp');t.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in values));t.replace(p)
write(D/'M436.author-candidate.config.json',config)
for p in D.iterdir():
 if p.is_file():q=C/p;q.parent.mkdir(parents=True,exist_ok=True);t=Path(str(q)+'.tmp');t.write_bytes(p.read_bytes());t.replace(q)
# All candidate-only changes are atomic replacements; readonly H input hardlinks are never opened for writes.
regrel='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=read(H/regrel)
for s in reg['subjects']:
 if s.get('landscapePath')==config['landscapePath']:s['memoryReviewConfigPath']=str(D/'M436.author-candidate.config.json')
write(C/regrel,reg)
public=C/'app/public/data';public.mkdir(parents=True,exist_ok=True)
for p in (H/'app/public/data').iterdir():
 q=public/p.name
 if not q.exists() and not q.is_symlink():q.symlink_to(p.resolve())
for rel in ['curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json','app/public/data/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json']:write(C/rel,newdeck)
for name in ['memoryCardReview.ts']:
 p=C/'app/scripts'/name
 if not p.exists():os.link(H/'app/scripts'/name,p)
write(D/'SERIALIZATION.actual-scope-and-provenance.author.json',{'role':'Inactive normal-format M candidate serialization, not independent science/M acceptance','old435GoalFingerprintsReproducedAgainstCurrentStockFields':True,'existing435RowsRetainedExceptD8SemanticAnd095SameCardReference':True,'ordinaryRecords':len(rows),'cardRecords':len(cards),'memoryNodesInScope':58,'oldPrimaryQ3CardObjects11Exact':True,'newCardsOnly':['chem_eq_q3_012','chem_eq_q3_013'],'actualCandidateMRegistryBindingOnlyInCapsule':str(C/regrel),'memoryAuthorityOfNewRows':'AUTHOR ai_candidate E0/G0, two independent reviews pending','HumanApproval':False,'HumanTrial':False});print('M candidate',len(rows),len(cards),'scope',len(config['scope']['leafGoalIds']))
