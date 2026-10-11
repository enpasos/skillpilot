from pathlib import Path
import json,hashlib,re,copy
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-policy-wage-skills-scenarios-one-contract-local-author-a-v1';V=O/'actual-word-spacing-and-one-self-found-independent-macro-boundary-author-successor-v2';V.mkdir(exist_ok=False);p=O/'whole-seven-policy-wage-skills-scenarios-one-contract-DEEN.two-case-DRAFT.author-v1.json';before=json.loads(p.read_text());after=copy.deepcopy(before);deltas=[]
wordfix={'keyrates':'key rates','regionalassumptions':'regional assumptions','ratescreate':'rates create','noenergy':'no energy','foractual':'for actual','officialnational':'official national','perquery':'per query','permonth':'per month','peradditional':'per additional','beforebonus':'before bonus','post-expansionbuffer':'post-expansion buffer','newfinancing':'new financing','jobloss':'job loss','bankloss':'bank loss','ratecostsmay':'rate costs may','highercosts':'higher costs','savesconditionally':'saves conditionally','publiccentralbankmoney':'public central bank money','privatebankdeposits':'private bank deposits','no-programmecomparison':'no-programme comparison','actualtake-up':'actual take-up','high-techcentre':'high-tech centre','countereffects':'countereffects'}
def normal(s):
 urls=[]
 def keep(m):urls.append(m[0]);return f'URLTOKEN_{len(urls)-1}_END'
 s=re.sub(r'https?://[^\s)]+',keep,s)
 s=re.sub(r'(?<=[a-zäöüß])(?=[A-ZÄÖÜ])',' ',s);s=re.sub(r'(?<=[0-9])(?=[A-Za-zÄÖÜäöü])',' ',s);s=re.sub(r'(?<=[A-Za-zÄÖÜäöü])(?=[0-9])',' ',s);s=re.sub(r'(?<=[%€])(?=[A-Za-zÄÖÜäöü])',' ',s)
 for k,v in wordfix.items():s=s.replace(k,v)
 # Comma-space is a readable separator outside URLs.
 s=re.sub(r',(?=[A-Za-zÄÖÜäöü])',', ',s)
 for i,u in enumerate(urls):s=s.replace(f'URLTOKEN_{i}_END',u)
 return s
for g in after:
 for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
  g['examData'][k]=normal(g['examData'][k])
 for step in g['examData']['scoring']['steps']:step['description']=normal(step['description'])
scenario=next(g for g in after if g['requires'][0].startswith('7727'));assert 'Hoch/niedrig:E 50' in scenario['examData']['solutionContent'];scenario['examData']['solutionContent']=scenario['examData']['solutionContent'].replace('Hoch/niedrig:E 50','Hoch/niedrig: 50')
macro=next(g for g in after if g['requires'][0].startswith('94fe'))
for k in ['taskContent','solutionContent']:
 s=macro['examData'][k];old='eigenständig behandelte Wachstum/Beschäftigung und Umwelt';new='eine eigenständige Wachstumsabwägung; eine eigenständige Beschäftigungsabwägung; eine eigenständige Umweltabwägung';assert old in s;s=s.replace(old,new);macro['examData'][k]=s
for k in ['taskContentEn','solutionContentEn']:
 s=macro['examData'][k];old='separately considered growth/jobs and environment';new='a distinct growth assessment; a distinct employment assessment; a distinct environmental assessment';assert old in s;s=s.replace(old,new);macro['examData'][k]=s
for b,a in zip(before,after):
 assert b['id']==a['id'] and b['requires']==a['requires'] and b['tags']==a['tags'];assert b['examData']['scoring']['maxPoints']==a['examData']['scoring']['maxPoints']==24
 for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
  if b['examData'][k]!=a['examData'][k]:deltas.append({'goalId':a['id'],'field':'examData.'+k,'wholeBefore':b['examData'][k],'wholeAfter':a['examData'][k],'whitespaceOnly':re.sub(r'\s','',b['examData'][k])==re.sub(r'\s','',a['examData'][k])})
 for i,(s,t) in enumerate(zip(b['examData']['scoring']['steps'],a['examData']['scoring']['steps'])):
  assert s['points']==t['points']==4
  if s['description']!=t['description']:deltas.append({'goalId':a['id'],'field':f'examData.scoring.steps.{i}.description','wholeBefore':s['description'],'wholeAfter':t['description'],'whitespaceOnly':re.sub(r'\s','',s['description'])==re.sub(r'\s','',t['description'])})
# Every nonwhitespace delta is explicitly bounded: five actual strings (one accidental E + four independent macro performance clauses).
non=[x for x in deltas if not x['whitespaceOnly']];assert len(non)==5,[(x['goalId'],x['field']) for x in non]
f=V/'whole-seven-readable-policy-DRAFT.one-self-found-separated-growth-jobs-environment-boundary.author-v2.json';f.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n');idx=V/'actual-readable-seven-body-and-five-self-found-explicit-nonwhitespace-string-deltas.author.json';idx.write_text(json.dumps({'role':'AUTHOR_SUCCESSOR_NOT_FOREIGN_REVIEW','wholeOriginalV1SHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'wholeAfterV2SHA256':hashlib.sha256(f.read_bytes()).hexdigest(),'actualWholeFieldDeltas':deltas,'actualFiveNonWhitespaceDeltas':non,'scoringNumbersRequiresCoveredCourseSourceExact':True,'reason':'Before independent review, own formatting correction and actual isolated E typo; whole-macro performance group split to prevent an independently absent growth, employment or environment aspect from passing through another present aspect. All originals immutable, no self KEEP.'},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'path':str(f.relative_to(R)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size,'fieldDeltas':len(deltas),'nonWhitespaceDeltas':len(non)}))
