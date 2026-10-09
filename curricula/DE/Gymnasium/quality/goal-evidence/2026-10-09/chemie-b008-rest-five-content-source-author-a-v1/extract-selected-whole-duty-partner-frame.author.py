from pathlib import Path
import json,hashlib,datetime
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09');O=B/'chemie-b008-rest-five-content-source-author-a-v1'
x=json.loads((O/'remaining-five-whole-current-goals-and-original-source-pool.author-neutral-input.json').read_text())
cp=B/'chemie-b008-current-twenty-six-native-preparation-author-v1/candidate/canonical504-current26-resource-links.inactive.json';canonical=json.loads(cp.read_text());byid={g['id']:g for g in canonical['goals']}
def ref(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
scope={'HE':['he-chem-sekii-q3-3-b04-a01-a7519947','he-chem-sekii-q3-3-b08-a01-0471a266','he-chem-sekii-q3-3-b09-a01-a728efd6','he-chem-sekii-q3-4-b03-a01-30991228','he-chem-sekii-q3-4-b04-a01-78b64823'],'RP':['rp-chem-sekii-rp-ch-sekii-2022-baustein-3-3-004-3794fee6','rp-chem-sekii-rp-ch-sekii-2022-baustein-4-2-005-9d54a074','rp-chem-sekii-rp-ch-sekii-2022-baustein-5-2-009-c98acf79','rp-chem-sekii-rp-ch-sekii-2022-baustein-5-2-016-e5b16808','rp-chem-sekii-rp-ch-sekii-2022-baustein-4-6-007-41078297']}
rows=[];seen=set();unique=[];refs=[]
for jur,ids in scope.items():
 meta=next(m for m in x['originalSourcePoolMetadata']if f'/{jur}/upper-secondary/'in m['sourceExtraction']['path']);e=json.loads(Path(meta['sourceExtraction']['path']).read_text());m=json.loads(Path(meta['mapping']['path']).read_text());refs+=[ref(meta['sourceExtraction']['path']),ref(meta['mapping']['path']),ref(meta['sourceDocument']['path'])]
 for sid in ids:
  si,g=next((i,g)for i,g in enumerate(e['sourceGoals'])if g['id']==sid);pas=next((i,p)for i,p in enumerate(e['passages'])if p['id']==g['passageId']);di,d=next((i,d)for i,d in enumerate(m['decisions'])if d['sourceGoalId']==sid)
  edges=[{'pointer':f'/mappings/{i}','value':v}for i,v in enumerate(m['mappings'])if v['legacyGoalId']==sid];roots=d['canonicalGoalIds'];allids=[]
  def visit(gid):
   if gid in allids:return
   allids.append(gid)
   for child in byid[gid].get('contains',[]):visit(child)
  for gid in roots:visit(gid)
  partners=[{'canonicalPointer':'/goals/'+str(next(i for i,g in enumerate(canonical['goals'])if g['id']==gid)),'wholeGoal':byid[gid]}for gid in allids]
  for v in partners:
   if v['wholeGoal']['id']not in seen:seen.add(v['wholeGoal']['id']);unique.append(v)
  rows.append({'jurisdiction':jur,'sourceExtraction':ref(meta['sourceExtraction']['path']),'mapping':ref(meta['mapping']['path']),'actualPrimary':ref(meta['sourceDocument']['path']),'sourceGoalPointer':f'/sourceGoals/{si}','wholeOriginalSourceGoal':g,'passagePointer':f'/passages/{pas[0]}','wholeOriginalPassage':pas[1],'decisionPointer':f'/decisions/{di}','wholeOriginalDecision':d,'allOriginalMappingEdges':edges,'originalDecisionPartnerRoots':roots,'wholeAllOriginalPartnersAndDescendants':partners,'allOriginalDutyAndPartnerBodiesRetained':True,'historicalPositiveDecisionNotNewSourceQA':True})
requirements=[]
for row in x['wholeFiveRows']:
 g=row['wholeCurrentProspectiveGoal'];requirements.append({'goalId':g['id'],'wholePrerequisiteGoals':[byid[r]for r in g['requires']]})
out={'schemaVersion':1,'role':'literal neutral selected source duty, original partners and cluster-descendant frame for author and later independent whole review','author':'/root/bio_science14_independent_a','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualInputs':[ref(cp)]+refs,'rows':rows,'uniqueWholePartners':unique,'wholeCurrentFivePrerequisiteGoals':requirements,'currentSourceApproval':False,'activeWrites':False,'strictGain':0}
f=O/'selected-ten-whole-source-duty-and-original-partner-frame.author-neutral.json';assert not f.exists();f.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'output':ref(f),'sourceClauses':len(rows),'allOriginalEdges':sum(len(r['allOriginalMappingEdges'])for r in rows),'partnerOccurrences':sum(len(r['wholeAllOriginalPartnersAndDescendants'])for r in rows),'uniquePartnerBodies':len(unique)},ensure_ascii=False,indent=2))
for i,r in enumerate(rows):print(i,r['wholeOriginalSourceGoal']['id'],len(r['allOriginalMappingEdges']),[p['wholeGoal']['id']for p in r['wholeAllOriginalPartnersAndDescendants']])
