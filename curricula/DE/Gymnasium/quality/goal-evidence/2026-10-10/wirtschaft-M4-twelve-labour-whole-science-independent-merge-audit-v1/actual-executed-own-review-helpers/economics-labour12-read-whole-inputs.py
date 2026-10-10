import json,pathlib,sys
D=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-labour-society-one-contract-local-whole-material-author-b-v1');h=json.loads((D/'actual-final-twelve-labour-society-current597-whole-DEEN-P24-DRAFT.author-handoff.json').read_text());a=json.loads(pathlib.Path(h['wholeOriginalCurrentTwelveGoalsAndP24']['path']).read_text())['actualWholeTwelveGoalAndP24Guards'];b=json.loads(pathlib.Path(h['wholeFinalTwelveDRAFT']['path']).read_text())
for n in map(int,sys.argv[1:]):
 m=b[n];r=a[n];print('\nMATERIALINDEX',n,'WHOLEGOAL',json.dumps(r['wholeCurrentDEENGoal'],ensure_ascii=False));print('WHOLE ORIGINAL P PROFILE',json.dumps(r['wholeOriginalP']['profile'],ensure_ascii=False));print('MATERIALOUTER',json.dumps({k:v for k,v in m.items() if k!='examData'},ensure_ascii=False));e=m['examData'];print('EXAM META',json.dumps({k:v for k,v in e.items() if k not in ('taskContent','taskContentEn','solutionContent','solutionContentEn')},ensure_ascii=False));
 for k in ('taskContent','taskContentEn','solutionContent','solutionContentEn'):
  t=e[k];other='taskContentEn' if k=='solutionContentEn' else 'taskContent';
  if k.startswith('solution') and t.rsplit('\n\n',1)[-1]==e[other].rsplit('\n\n',1)[-1]:t=t.rsplit('\n\n',1)[0]+'\n[ENDING SCORING PARAGRAPH EXACT TO WHOLE TASK ABOVE]'
  print(k,t)
