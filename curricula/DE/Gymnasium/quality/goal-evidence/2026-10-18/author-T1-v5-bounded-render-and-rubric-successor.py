# SPDX-License-Identifier: Apache-2.0
import hashlib,json,re,shutil
from pathlib import Path
B=Path(__file__).parent
old=B/'chemie-current450-T1-terminal-exams-author-20261018-v4'
new=B/'chemie-current450-T1-terminal-exams-author-20261018-v5'
assert not new.exists()
shutil.copytree(old,new)
(new/'FREEZE.author.sha256.json').unlink()
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
a=read(new/'AUTHOR.new-goals.full.draft.json')
changes=[]
for g in a['newGoals']:
 e=g['examData']
 if g['id']=='8b7ac0a3-f893-5a7f-bad0-0b299c7fba6a':
  for field in ['taskContent','taskContentEn']:
   before=e[field]
   # Only the two exact spatial MO ladders are fenced; their scientific bytes stay exact.
   pattern=r'((?:N2|O2): relative [^\n]+\n(?:[^\n]*\n)*?niedrig/low[^\n]*|(?:N2|O2): relative [^\n]+\n(?:[^\n]*\n)*?low[^\n]*)'
   blocks=[]
   def fence(m): blocks.append(m.group(0));return '```text\n'+m.group(0)+'\n```'
   after=re.sub(pattern,fence,before)
   assert len(blocks)==2,(field,len(blocks))
   e[field]=after
   changes.append({'goalId':g['id'],'field':field,'operation':'fence_two_existing_MO_ladders_as_plain_text','beforeExactBlocks':blocks,'afterExactBlocks':['```text\n'+b+'\n```' for b in blocks],'scientificLadderCharactersPreserved':True})
 if g['id']=='6303e470-a790-542b-ac6a-17142e14ba16':
  fixes={
   's1b':(
    'Aufgabe 1, begründete Geltungsgrenze: Die Abgangsgruppen-Basizität stützt die angegebene Rangfolge nur im Vergleich mit demselben Nucleophil bei vergleichbarer Temperatur, gleichem Medium und passenden Protonenübertragungen. Die pKa-Werte der konjugierten Säuren sind keine Aktivierungsbarrieren oder Geschwindigkeitskonstanten; aus ihnen allein folgt keine allgemeine Reaktivitätsordnung für beliebige Bedingungen.',
    'Task 1, reasoned scope limit: Leaving-group basicity supports the stated ranking only with the same nucleophile at comparable temperature, in the same medium and with suitable proton transfers. The conjugate-acid pKa values are neither activation barriers nor rate constants; they alone do not establish a general reactivity ranking for arbitrary conditions.'),
   's2b':(
    'Aufgabe 2, begründete Geltungsgrenze: Acylchlorid in kaltem Wasser und katalysierte Esterspaltung bei höherer Temperatur unterscheiden sich in Medium, Temperatur und Katalyse. Ohne kontrollierte vergleichbare Geschwindigkeitsdaten erlauben diese beiden Versuche keine allgemeine Klassenrangfolge; der Strukturtransfer gilt nur für die gemeinsam festgelegten Propanoylfälle.',
    'Task 2, reasoned scope limit: Acyl chloride in cold water and catalysed ester cleavage at higher temperature differ in medium, temperature and catalysis. Without controlled comparable rate data these two experiments do not establish a general class ranking; the structural transfer applies only to the matched propanoyl cases.')}
  for s in e['scoring']['steps']:
   if s['id'] in fixes:
    for field,sol,txt in zip(['description','descriptionEn'],['solutionContent','solutionContentEn'],fixes[s['id']]):
     prev=s[field]; newshort=txt.split(': ',1)[1]
     oldshort=prev.split(': ',1)[1]
     assert oldshort in e[sol]
     e[sol]=e[sol].replace(oldshort,newshort)
     s[field]=txt
     changes.append({'goalId':g['id'],'scoringStepId':s['id'],'field':field,'before':prev,'after':txt,'samePoints':s['points']})
   if s['id']=='s2a':
    s['description']=s['description'].replace('den zwei anderen Messwerten','den zwei anderen Versuchen')
    s['descriptionEn']=s['descriptionEn'].replace('the other two readings','the other two experiments')
  e['solutionContent']=e['solutionContent'].replace('den zwei anderen Messwerten','den zwei anderen Versuchen')
  e['solutionContentEn']=e['solutionContentEn'].replace('the other two readings','the other two experiments')
 # Rebind only own author package locators. Historic selected P and ordinary input bodies remain unchanged.
 for k,v in list(g.items()):
  if isinstance(v,str):g[k]=v.replace(str(old),str(new))
 def rebind(x):
  if isinstance(x,str):return x.replace(str(old),str(new))
  if isinstance(x,list):return [rebind(y) for y in x]
  if isinstance(x,dict):return {k:rebind(v) for k,v in x.items()}
  return x
 g.update(rebind(g))
 for field,suffix in [('taskContent','task.de'),('taskContentEn','task.en'),('solutionContent','solution.de'),('solutionContentEn','solution.en')]:
  (new/'tasks'/f'{g["id"]}.{suffix}.md').write_text(g['examData'][field]+'\n')
a['packageId']=str(new)
(new/'AUTHOR.new-goals.full.draft.json').write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
for name in ['AUTHOR.sparse-contains-placement.proposals.json','AUTHOR.exam-interfaces-and-scope.json','AUTHOR.semantic-kind.proposals.json','README.md']:
 f=new/name;f.write_text(f.read_text().replace(str(old),str(new)).replace('v4 successor','v5 successor'))
t2=B/'chemie-current450-T2-terminal-exams-author-20261018-v4'
ta=read(t2/'AUTHOR.new-goals.full.draft.json')
fischer=[];ascii_candidates=[]
for g in ta['newGoals']:
 for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
  txt=g['examData'][field]
  if 'Fischer' in txt:fischer.append({'goalId':g['id'],'field':field,'representation':'explicit CHO/CH2OH convention and complete R/L strings; no space-dependent projection drawing'})
  lines=[l for l in txt.splitlines() if re.search(r'^\s*[|]|\[\s*(?:up|down)|hoch/high|niedrig/low|^\s*H[-–]+[CO]',l)]
  if lines:ascii_candidates.append({'goalId':g['id'],'field':field,'lines':lines})
assert not ascii_candidates
check={'role':'Narrow T2 material representation audit, no new science review or independent approval','T2v4WholeGoalFileSHA256':sha(t2/'AUTHOR.new-goals.full.draft.json'),'all19NewDEENTaskSolutionFieldsExaminedForSpaceDependentLadders':True,'fischerCases':fischer,'spaceDependentASCIILaddersFound':ascii_candidates,'T2Mutated':False}
(new/'CHECK.T2v4-Fischer-and-diagram-functional-form.json').write_text(json.dumps(check,ensure_ascii=False,indent=2)+'\n')
receipt={'role':'AUTHOR bounded v5 fixes from actual foreign findings, not an independent vote','predecessor':{'path':str(old/'FREEZE.author.sha256.json'),'sha256':sha(old/'FREEZE.author.sha256.json')},'changes':changes,'unchangedGoalIds':[g['id'] for g in a['newGoals'] if g['id'] not in ['8b7ac0a3-f893-5a7f-bad0-0b299c7fba6a','6303e470-a790-542b-ac6a-17142e14ba16']],'ordinaryAndPInputsExact':True,'allNewExamsRemainDraft':True,'normalWrites':0,'foreignReviewStillRequired':True}
(new/'AUTHOR.v5-bounded-MO-render-and-acyl-rubric-corrections.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'newPackage':str(new),'fixCount':len(changes),'T2FischerRecordsChecked':len(fischer),'newExams':len(a['newGoals']),'sealed':False}))
