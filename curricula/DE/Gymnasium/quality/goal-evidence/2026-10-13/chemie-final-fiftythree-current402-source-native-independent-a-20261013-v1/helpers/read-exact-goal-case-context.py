import json,sys
from pathlib import Path
p=Path(__file__).resolve().parent.parent
a=p/'inputs/frozen-author'
group,start,count=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
goals=json.loads((a/f'native-{group}/round-a/description-review-input.json').read_text())['goals']
profiles={x['goalId']:x['profile'] for x in json.loads((p/'inputs/whole37AuthorProfiles.json').read_text())['profiles']}
cases=json.loads((p/'inputs/whole74BilingualCases.json').read_text())['cases']
for g in goals[start:start+count]:
 print('GOAL',g['goalId'],g['currentTitleDe'],'/',g['currentTitleEn'])
 print('DE',g['currentDescriptionDe']); print('EN',g['currentDescriptionEn']);print('CONTEXT',json.dumps(g['canonicalContext'],ensure_ascii=False))
 if g['goalId'] in profiles:
  pr=profiles[g['goalId']];print('PROFILE',json.dumps({k:pr[k] for k in ['archetype','expectations','coverageExpectations','variationAxes']},ensure_ascii=False))
 for c in cases:
  if c['goalId']==g['goalId']:
   print('CASE',c['caseId'],json.dumps({k:c[k] for k in ['dataDe','dataEn','taskDe','taskEn','modelAnswerDe','modelAnswerEn','maximumPoints','gradingBoundary']},ensure_ascii=False))
   print('RUBRIC',json.dumps([{k:r[k] for k in ['criterionId','expectationId','expectationIds','maximumPoints','creditBasis','criterionDe','criterionEn','fullCreditDe','fullCreditEn'] if k in r} for r in c['rubric']],ensure_ascii=False))
