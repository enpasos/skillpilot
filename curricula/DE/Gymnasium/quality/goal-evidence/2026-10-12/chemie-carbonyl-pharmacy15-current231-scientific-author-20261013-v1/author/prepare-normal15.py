"""Apache-2.0; creates normal author candidates, no positive independent decisions."""
from pathlib import Path
import json,hashlib,datetime
O=Path(__file__).resolve().parent.parent; R=Path.cwd(); rel=str(O.relative_to(R)); rd=lambda p:json.loads(Path(p).read_text());h=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def wr(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
b=rd(O/'author/current15.base-goal-tuples.json');ids=b['goalIds'];profiles=rd(O/'author/whole15.profile-payloads.author.json')['profiles'];t=datetime.datetime.now(datetime.timezone.utc).isoformat();review='chemie-carbonyl-pharmacy15-current231-whole-author-20261013-v1'
assert h(b['canonicalBinding']['path'])==b['canonicalBinding']['sha256'];p=dict(schemaVersion=1,authoringContract='positive-understanding-evidence-candidates-v1',reviewId=review,reviewedAt=t,reviewer='Codex scientific author /root/chemie_carbonyl15_scientific_author',goals=[dict(goalId=x['goalId'],reason='Original complete DE/EN design with two distinct cases and explicit data/task/model-answer/rubric. Author E1/G1 only; no independent review, human approval or actual learner/lab/clinical performance. Exact source aliases, practical channels and missing/current image findings remain held.',evidenceLevel='E1',maximumClaimScope='G1',dissent=['Source-route aliases/legacy-only route and current visual holds require bounded independent resolution; this author is not a source/visual/description reviewer.'],profile=x['profile'])for x in profiles]);wr(O/'author/P15.normal-v2.candidate-set.json',p)
wr(O/'configs/P15.author.inactive.config.json',{'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':review,'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':rd(b['canonicalBinding']['path'])['landscapeId'],'landscapePath':b['canonicalBinding']['path'],'semanticKindLedgerPath':'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','reviewCriteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md','reviewPath':rel+'/author/P15.normal-v2.author-candidates.jsonl','reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'Inactive Carbonyl/pharmacy15 author candidates; source/visual/independent gates pending','goalIds':ids}})
wr(O/'configs/A15.author.inactive.config.json',dict(schemaVersion=1,reviewId='chemie-carbonyl15-author-atomicity-candidates-20261013-v1',ruleVersion='semantic-atomicity-v1',landscapeId=rd(b['canonicalBinding']['path'])['landscapeId'],landscapePath=b['canonicalBinding']['path'],reviewPath=rel+'/author/A15.normal-author-candidates.jsonl',scope=dict(label='Author reasoning only; no independent positive atomicity vote',leafGoalIds=ids)))
mc=rd(rd(O/'author/current15.memory-retention.bindings.json')['inputConfig']['path']);rows=[json.loads(l)for l in Path(mc['cardReviewPath']).read_text().splitlines()if l.strip()];rows=[r for r in rows if set(r.get('originGoalIds',[]))&set(ids)];decks={}
for path in Path('curricula/DE/Gymnasium/memory-decks').glob('*chemistry*.json'):
 d=rd(path)
 if d.get('deckId')in{r['deckId']for r in rows}:decks[d['deckId']]=(path,d)
# Deck IDs may be named id.
if len(decks)!=2:
 decks={}
 for path in Path('curricula/DE/Gymnasium/memory-decks').glob('*chemistry*.json'):
  d=rd(path)
  for r in rows:
   if any(c['id']==r['cardId']for c in d.get('cards',[])):decks[r['deckId']]=(path,d)
traces=[]
for row in rows:
 path,d=decks[row['deckId']];public=Path('app/public/data')/path.name;assert h(path)==h(public);card=next(c for c in d['cards']if c['id']==row['cardId']);assert row['status']=='kept'and row['necessary'];assert all(i in ids for i in row['originGoalIds']);traces.append(dict(cardReviewRecord=row,actualCard=card,sourceDeckBinding=dict(path=str(path),sha256=h(path)),publicDeckBinding=dict(path=str(public),sha256=h(public)),requiredOriginGoalIds=row['originGoalIds'],authorNecessity='Compact detector names, interaction vocabulary and IR/NMR purpose recall retained. Actual experiment/structure/transfer reasoning is assessed separately.'))
wr(O/'author/current15.three-existing-card-traces.read-and-retained.json',dict(schemaVersion=1,currentMrawExact=True,memoryRequired=3,noMemoryNeeded=12,existingCards=3,cardReviewBinding=dict(path=mc['cardReviewPath'],sha256=h(mc['cardReviewPath'])),wholeActualCardsAndBindings=traces,visibilityScopeBindings=[dict(path=s['viewPath'],sha256=h(s['viewPath']),label=s['label'])for s in mc['visibilityScopes']],newDecksOrCards=0,newMemoryVotes=0))
print(json.dumps(dict(P15Candidates=len(p['goals']),A15Pending=15,MrawExact=15,existingCards=len(traces),newScience=0)))
