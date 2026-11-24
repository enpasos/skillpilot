from pathlib import Path
import json,shutil,sys,hashlib
sys.path.insert(0,'/tmp/e1-t4/pdf-tools')
import pymupdf
root=Path('/home/enpasos/projects/skillpilot-e1-nachweise');name=sys.argv[1];tag=sys.argv[2];base=root/'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-24'/name;book=json.load(open(base/'bundle/book-model.json'));goalids=[p['goalId'] for p in book['pages']];sourcebase=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-current-nine-v1';profiles=[json.loads(l)['goal']['reviewContext']['evidenceProfile'] for l in next((base/'round-a'/'batches').glob('*.input.jsonl')).read_text().splitlines() if l.strip()];assert all(r is not None for r in profiles);scope=json.load(open(Path(sys.argv[3]) if len(sys.argv)>3 else sourcebase/'native-national-scope-supplement.json'));scope['goals']=[g for g in scope['goals'] if g['goalId'] in goalids];canonical=json.load(open(root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'));allgoals={g['id']:g for g in canonical['goals']};cards=[]
for f in (root/'curricula/DE/Gymnasium/memory-decks').glob('*physics*ephase*'):
 d=json.load(open(f));rows=d.get('cards',[]) if isinstance(d,dict) else d
 for r in rows:
  if set(r.get('originGoalIds',[]))&set(goalids):cards.append({'source':str(f.relative_to(root)),'card':r})
# A small scientific context, not prior QA opinions or author rationales.
physics={g['id']:g for g in canonical['goals']};contextids=set(goalids);pending=list(goalids)
for doc in (root/'curricula/DE/Gymnasium/canonical').glob('*.json'):
 for g in json.load(open(doc))['goals']:allgoals[g['id']]=g
while pending:
 g=allgoals[pending.pop()]
 for i in g.get('requires',[]):
  i=i.split(':')[-1]
  if i not in contextids:contextids.add(i);pending.append(i)
context=[{k:g[k] for k in ['id','title','titleEn','description','descriptionEn','requires','tags','dimensionTags'] if k in g} for i in sorted(contextids) if (g:=allgoals[i])]
ue={k:{'type':'string','minLength':1} for k in ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']}
dprops={'goalId':{'type':'string','enum':goalids},'decision':{'type':'string','enum':['keep','revise','split_review','block']},'proposedDescriptionDe':{'type':['string','null']},'proposedDescriptionEn':{'type':['string','null']},'understandingEvidence':{'type':'object','additionalProperties':False,'properties':ue,'required':list(ue)},'rationale':{'type':'string','minLength':1},'evidenceProfileContract':{'type':'string','const':'positive-understanding-evidence-v2'},'evidenceProfileRecommendation':{'type':'string','enum':['none','create','revise']}}
ppr={'goalId':{'type':'string','enum':goalids},'decision':{'type':'string','enum':['keep','revise','block']},'reason':{'type':'string','minLength':1},'requiredChanges':{'type':'array','items':{'type':'string'}}}
schema={'type':'object','additionalProperties':False,'properties':{'descriptionReviews':{'type':'array','minItems':len(goalids),'maxItems':len(goalids),'items':{'type':'object','additionalProperties':False,'properties':dprops,'required':list(dprops)}},'profileReviews':{'type':'array','minItems':len(goalids),'maxItems':len(goalids),'items':{'type':'object','additionalProperties':False,'properties':ppr,'required':list(ppr)}},'limitations':{'type':'array','items':{'type':'string'}}},'required':['descriptionReviews','profileReviews','limitations']}
for round in ['a','b']:
 out=Path('/tmp/e1-t5')/(tag+'-'+round);out.mkdir(exist_ok=False)
 for src,dest in [(base/'round-'+round if False else base/('round-'+round),out)]:
  pass
 for f in ['prompt.md','criteria.md','description-review-campaign.json','description-review-input.json','review-bundle-manifest.json']:shutil.copy2(base/('round-'+round)/f,out/f)
 for f in ['book.pdf','book-model.json']:shutil.copy2(base/'bundle'/f,out/f)
 batch=next((base/('round-'+round)/'batches').glob('*.input.jsonl'));shutil.copy2(batch,out/'batch.input.jsonl')
 shutil.copy2(root/'contracts/goal-description-review/v1/goal-description-review-record.schema.json',out/'native-record.schema.json')
 shutil.copy2(root/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-positive-understanding-evidence-profile-criteria-v1.md',out/'positive-profile-criteria.md')
 (out/'positive-profiles.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2)+'\n');(out/'native-national-scope.json').write_text(json.dumps(scope,ensure_ascii=False,indent=2)+'\n');(out/'memory-cards.json').write_text(json.dumps(cards,ensure_ascii=False,indent=2)+'\n');(out/'prerequisite-context.json').write_text(json.dumps(context,ensure_ascii=False,indent=2)+'\n');(out/'output.schema.json').write_text(json.dumps(schema,indent=2)+'\n')
 pdf=pymupdf.open(out/'book.pdf');images=[]
 for i,p in enumerate(pdf):
  dest=out/f'book-page-{i+1:03}.png';p.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2)).save(dest);images.append(dest.name)
 for gid in goalids:
  g=physics[gid]
  for r in g.get('resourceLinks',[]):
   if r.get('type')=='goal-visualization' and r.get('role')=='primary':
    f=root/'app/public'/r['url'].lstrip('/');dest=out/('goal-image-'+gid+f.suffix);shutil.copy2(f,dest);images.append(dest.name)
 prompt='''You are an independent Physics description-and-understanding-profile reviewer in a new isolated session. You did not author these candidates. Use ONLY files in this directory and attached images. Do not read parent directories, other review outputs, historical QA or repository files. Do not edit anything.

Read native prompt.md and criteria.md completely and apply their scientific review requirements. Read the exact current assigned goal(s) in batch.input.jsonl/description-review-input.json, book-model.json, book.pdf and attached rendered pages/primary image. Read positive-profiles.json and positive-profile-criteria.md for the exact candidate P bodies. native-national-scope.json supplies actual compiled national applicability; the complete canonical review view in the book is diagnostic context, not an expansion of learner scope. prerequisite-context.json is a current prerequisite closure without prior review opinions. memory-cards.json supplies current relevant card text/origins as presentation context, not evidence of learner mastery. Goal flags/old ledgers are context, not authority.

Return ONLY JSON matching output.schema.json, with descriptionReviews and profileReviews covering every assigned goal exactly once. Scientific decision bodies will be mechanically joined to the frozen native campaign metadata after this real run; do not invent hashes, timestamps or approvals. For each description use keep/revise/split_review/block critically; proposed descriptions are null when no correction is proposed. Supply all6 positive understanding-evidence fields in equivalent DE/EN, specific to this exact competence and meaningful fresh transfer. evidenceProfileContract is positive-understanding-evidence-v2; recommend none only if the exact supplied P profile is already adequate. Separately judge that exact profile body keep/revise/block, with any precise required changes. Check all cases, expected values and coverage, experimental provenance/safety, signs/units/representations, stage-appropriate method neutrality, independence, and scope separation from neighboring competencies. Do not approve just because a schema or previous status says so. Do not invent defects. State anything you did not actually inspect. No verdict is expected.
'''
 (out/'driver-prompt.txt').write_text(prompt);(out/'attached-images.json').write_text(json.dumps(images,indent=2)+'\n');print(out,'PDF pages',len(pdf),'attached images',len(images),'profiles',len(profiles),'cards',len(cards))
