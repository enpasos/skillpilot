import json,pathlib,sys
x=json.loads(pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/review-scientific-views-root-v1/REVIEW.P13.whole-scientific-content.no-historical-review-metadata.json').read_text())
for i in map(int,sys.argv[1:]):
 g=x['goals'][i];print('\nGOAL',i,g['goalId']); print('DE',g['currentTitleDe'],g['currentDescriptionDe']);print('EN',g['currentTitleEn'],g['currentDescriptionEn']);print('CONTEXT',json.dumps(g['canonicalContext'],ensure_ascii=False));
 for k,v in g['teacherContext'].items():
  if isinstance(v,list):
   for z in v: print(k,json.dumps({f:z.get(f) for f in ['id','title','titleEn','description','descriptionEn','requires','contains','dimensionTags']},ensure_ascii=False))
 seen={}
 def walk(v,path='P'):
  if isinstance(v,dict):
   if not v:print(path,'{}')
   for k,z in v.items():walk(z,path+'.'+k)
  elif isinstance(v,list):
   if not v:print(path,'[]')
   for j,z in enumerate(v):walk(z,path+f'[{j}]')
  elif isinstance(v,str) and v in seen:print(path,'= duplicate',seen[v])
  else:
   print(path,json.dumps(v,ensure_ascii=False))
   if isinstance(v,str):seen[v]=path
 walk(g['reviewContext']['evidenceProfile'])
