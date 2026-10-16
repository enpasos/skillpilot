import json,sys,hashlib,datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT.parent
A=BASE/'chemie-acid-analytics-ten-current419-bounded-author-remediation-20261015-v1'
P=BASE/'chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1'
i=int(sys.argv[1])-1
cases=json.loads((A/'materials/twenty-complete-DEEN-cases.author.json').read_text())['cases'][i*2:i*2+2]
profile=json.loads((A/'author-profiles.ten.raw.json').read_text())['profiles'][i]
seen={}
def fold(x,path):
 if isinstance(x,str):
  if len(x)>80 and x in seen:return {'EXACT_REPEAT_OF':seen[x]}
  if len(x)>80:seen[x]=path
  return x
 if isinstance(x,list):return [fold(v,path+'/'+str(j)) for j,v in enumerate(x)]
 if isinstance(x,dict):return {k:fold(v,path+'/'+k) for k,v in x.items()}
 return x
x={'wholeCases':fold(cases,'/wholeCases'),'wholeRawProfile':fold(profile,'/wholeRawProfile')}
t=json.dumps(x,ensure_ascii=False,separators=(',',':'))
(ROOT/'reads'/('T%02d.full-cases-profile.lossless-deduplicated.txt'%(i+1))).write_text(t+'\n')
print(t)
