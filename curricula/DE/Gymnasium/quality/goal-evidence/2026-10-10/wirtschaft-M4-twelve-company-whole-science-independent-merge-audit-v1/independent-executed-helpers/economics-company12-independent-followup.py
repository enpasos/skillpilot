import pathlib,json,copy,hashlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-company-whole-science-independent-merge-audit-v1';hpath=pathlib.Path('/tmp/economics-company12-root-author-final-path.txt').read_text().strip();H=json.loads(pathlib.Path(hpath).read_text());original=json.loads((R/H['wholeOriginalDRAFT12']['path']).read_text());final=json.loads((R/H['wholeDRAFT12']['path']).read_text());W=json.loads((O/'actual-thirtysix-whole-independent-company-works-individual-marking-audited-successor-v2.json').read_text())['actualWholeWorks36']
def file(p):p=pathlib.Path(p);return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def differences(a,b,p=''):
 if a==b:return []
 if isinstance(a,dict)and isinstance(b,dict):
  out=[]
  for k in sorted(set(a)|set(b)):out+=differences(a.get(k),b.get(k),p+'/'+k)
  return out
 if isinstance(a,list)and isinstance(b,list)and len(a)==len(b):
  out=[]
  for i,(x,y)in enumerate(zip(a,b)):out+=differences(x,y,p+'/'+str(i))
  return out
 return [{'path':p,'before':a,'after':b}]
delta=differences(original,final);assert len(delta)==10
assert {d['path']for d in delta}=={'/'+str(i)+'/examData/'+k for i in [5,10]for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']}|{'/6/examData/solutionContent','/6/examData/solutionContentEn'}
for i,(a,b)in enumerate(zip(original,final)):
 assert a['id']==b['id']
 if i not in [5,6,10]:assert a==b
 ax={k:v for k,v in a.items()if k!='examData'};bx={k:v for k,v in b.items()if k!='examData'};assert ax==bx
 assert a['examData']['scoring']==b['examData']['scoring'];assert a['examData']['reviewStatus']==b['examData']['reviewStatus']=='draft'
 if i in [5,10]:
  for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
   assert a['examData'][k].split('**Bewertung:**')[0]if k.endswith('En')else True
   marker='**Assessment:**'if k.endswith('En')else'**Bewertung:**';assert a['examData'][k].split(marker)[0]==b['examData'][k].split(marker)[0]
  assert 'höchstens14/24BE'in b['examData']['solutionContent'];assert 'maximum14/24marks'in b['examData']['solutionContentEn']
# Actually read the targeted ten entire strings and all unchanged nine bodies; changes are only those listed.
follow=[]
for idx,core in [(32,'Concrete case-bound AI group effect/fairness'),(17,'Case-based quality requirement/effect')]:
 w=copy.deepcopy(W[idx]);w['kind']='Own entire original bypass regraded against actual V4';w['originalFinal']=w['final'];w['capApplied']=True;w['final']=14;w['pass']=False;w['whollyMissingIndividualCore']=core;w['appliedActualFinalMaterialSHA']=hashlib.sha256(json.dumps(final[10 if idx==32 else 5],ensure_ascii=False,sort_keys=True).encode()).hexdigest();follow.append(w)
# A genuinely separate privacy-absence work leaves proper group, mechanism and effective human authority, but neither personal-data autonomy nor affected-person choice/challenge is assessed anywhere.
a=copy.deepcopy(W[30]['completeSixAnswers']);a[0]='Datenprofile unterstützen gezielte Werbung und den wirtschaftlichen Anreiz zur Sammlung. Die bekannten Erlöse minus Dienstkosten sind 2.000 und 1.000. Beide decken diese bekannten Kosten; weitere Kosten und Rechtskonformität bleiben unbekannt. Eine Autonomie- oder Privatsphärenfolge wird nicht bewertet.';a[1]='Die tatsächlichen Nutzerinteressen, Wahl, Autonomie und Privatsphäre werden vollständig ausgelassen.';a[2]='Die Kontextwerbung erzielt 11.000 bei 10.000 bekannten Kosten. Der kleinere Erlösspielraum und zusätzliche unbekannte Kosten begrenzen die betriebliche Alternative. Ich beurteile weder Nutzerwahl noch Datenumfang und gebe keinen entsprechenden Prüfpunkt.';a[4]='Die Zeitersparnis ersetzt keine richtige qualifikationsbezogene Beurteilung. H hat Arbeitsproben, Informationen und wirkliche Änderungsbefugnis, J bestätigt nur. H muss tatsächlich prüfen statt nur zu unterschreiben. Die persönlichen Wahl- oder Widerspruchsinteressen werden nicht untersucht.';a[5]='Ich bevorzuge bedingt H oder ein geprüftes nichtautomatisches Verfahren. Nach Korrektur werden X-/Y-Fehlablehnungen mit dem Nenner der Qualifizierten erneut ermittelt. Ressourcen und menschliche Fehler bleiben Grenzen. Autonomie, Privatsphäre und individuelle Anfechtung lasse ich vollständig aus.'
marks=[[1,1,0,1],[0,0,0,0],[0,1,0,1],[1,1,1,1],[1,0,1,1],[1,1,0,1]];assert sum(map(sum,marks))==15
follow.append({'materialId':final[10]['id'],'kind':'Own new entire privacy/autonomy-absence counterwork','completeSixAnswers':a,'manual24CriterionMarks':marks,'raw':15,'capApplied':True,'final':14,'pass':False,'whollyMissingIndividualCore':'Concrete autonomy/privacy assessment across the entire work','criterionInterpretation':'Only finance is awarded in A; B has case-specific group effects, valid actual oversight authority and limits, while affected-person choice/challenge is expressly omitted. No indirect credit for privacy merely from data arithmetic or professional authority.'})
# Genuine imperfect autonomy performance: partial answer, clear actual effect of hidden choice; other core/group work remains evidenced.
a=copy.deepcopy(W[30]['completeSixAnswers']);a[1]='Die versteckte Alternative erschwert eine verständliche, frei erreichbare Wahl; ein vorbelegtes Teilen schafft keine frei informierte Auswahl. Weitere Dienstnutzen- oder einzelne Datenfolgen bespreche ich hier nicht.'
marks=[[1]*4,[0,1,0,0],[1]*4,[1]*4,[1]*4,[1]*4];assert sum(map(sum,marks))==21
follow.append({'materialId':final[10]['id'],'kind':'Own new incomplete autonomy response with meaningful correct core elsewhere','completeSixAnswers':a,'manual24CriterionMarks':marks,'raw':21,'capApplied':False,'final':21,'pass':True,'meaningfulCorrectPartialCore':'Actual hidden-choice effect is correct; the complete alternative A3 additionally concretely addresses choice and collection, and genuine group effects remain correct. A2 does not need four points or ideal wording.'})
# Genuine partial quality performance, no perfect measurement/procedure demand. Other cost/flexibility contributions unchanged from our own quality-absence counter.
a=copy.deepcopy(W[17]['completeSixAnswers']);a[1]='Zehn Wechsel dauern an der Linie 20 und im Team 5 Stunden; das spart 15 reine Umrüststunden. Vier Trainingstage sind Zusatzaufwand und mangels Tagesstunden/Wiederholung nicht von 15 abzuziehen. Verarbeitung, Personalkosten und Auslastung bleiben unbekannt. Als Qualitätsanforderung müssen die tatsächlich gefertigten Sondermaße an den benötigten Auftragsmaßen geprüft werden; Umstellbarkeit oder schnelle Wechsel allein beweisen diese Maßhaltigkeit nicht. Eine ausgearbeitete Messprozedur oder Fehlerquote liefere ich nicht.'
marks=copy.deepcopy(W[17]['manual24CriterionMarks']);marks[1][2]=1;assert sum(map(sum,marks))==20
follow.append({'materialId':final[5]['id'],'kind':'Own new incomplete but correct quality response','completeSixAnswers':a,'manual24CriterionMarks':marks,'raw':20,'capApplied':False,'final':20,'pass':True,'meaningfulCorrectPartialCore':'Actual case requirement for custom dimensions and distinction from flexibility are shown. No ideal measurement protocol, numeric defect rate, or full quality performance in every task is required.'})
for w in follow:
 assert len(w['completeSixAnswers'])==6 and sum(map(sum,w['manual24CriterionMarks']))==w['raw'];assert w['pass']==(w['final']>=15)
p=O/'actual-five-whole-independent-V4-followup-regradings-and-genuine-fair-partial-works.json';assert not p.exists();p.write_text(json.dumps({'reviewer':'/root/economics_merge_audit','actualV4AuthorHandoff':file(hpath),'actualFinalWhole12':file(R/H['wholeDRAFT12']['path']),'actualComparedTenLeafStringDeltas':delta,'nineOtherWholeMaterialsRetained':9,'all12OuterFieldsScoringRequiresCoveredTagsStatusExact':True,'original12DraftTrueAndFinalDraftTrue':True,'wholeWorks':follow,'actualThreeNewCompleteWorks':3,'twoWholeOriginalBypassesExactReused':True,'newManualCriterionMarks':72,'allFiveActualFinalScores':[w['final']for w in follow],'JISActualIndependentZipPositions':[2,4],'sourceScopeHumanStrictApprovals':0},ensure_ascii=False,indent=2)+'\n');print('Actual final', [w['final']for w in follow],file(p))
