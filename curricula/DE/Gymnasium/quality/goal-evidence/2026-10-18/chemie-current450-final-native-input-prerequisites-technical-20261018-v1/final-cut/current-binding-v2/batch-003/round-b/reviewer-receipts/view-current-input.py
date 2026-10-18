import json,sys,pathlib
p=pathlib.Path(sys.argv[1]); d=json.loads((p/'description-review-input.json').read_text())
for i in range(int(sys.argv[2])-1,int(sys.argv[3])):
 g=d['goals'][i]; out={k:v for k,v in g.items() if k!='reviewContext'}; page=g['reviewContext']['page']; out['page']={k:v for k,v in page.items() if k not in ['evidenceReview','goalFingerprint','pageFingerprint','description','goalId','title']}; prof=g['reviewContext'].get('evidenceProfile');out['currentP']={k:prof.get(k) for k in ['profile','dissent','evidenceLevel','maximumClaimScope']} if prof else None
 seen={}
 def dedup(v,path):
  if isinstance(v,str) and len(v)>100:
   if v in seen:return {'exactTextRepeatedAt':seen[v]}
   seen[v]=path;return v
  if isinstance(v,dict):return {k:dedup(x,path+'.'+k) for k,x in v.items()}
  if isinstance(v,list):return [dedup(x,path+'['+str(n)+']') for n,x in enumerate(v)]
  return v
 print('GOAL',i+1); print(json.dumps(dedup(out,'$'),ensure_ascii=False))
