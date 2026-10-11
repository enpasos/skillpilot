import json,pathlib,hashlib,zipfile,xml.etree.ElementTree as ET,ast,re,copy
from fractions import Fraction as F
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-consumer-whole-science-independent-merge-audit-v1';D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1';h=json.load(open(D/'actual-final-twelve-local-consumption-communication-media-current597-whole-DRAFT.author-handoff.json'))
def rec(p):b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def wr(n,d):p=O/n;assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return rec(p)
checks=[]
def ck(label,actual,expected):assert actual==expected,(label,actual,expected);checks.append({'label':label,'actual':str(actual),'expectedIndependentlySpecified':str(expected),'PASS':True})
ck('music-equivalent-30days',F(1)*30,F(30));ck('app-default-share',F(70,100),F(7,10));ck('app-optin-share',F(40,100),F(2,5));ck('app-difference-share',F(70,100)-F(40,100),F(3,10));ck('app-difference-percentagepoints',(F(70,100)-F(40,100))*100,F(30));ck('lamp-rating-difference',F(8)-5,F(3))
for l,x,y in [('both-bicycle-options',F(45)+60,105),('repair-remainder',F(75)-45,30),('accessory-remainder',F(75)-60,15),('bagX-remainder',F(90)-30,60),('bagY-remainder',F(90)-80,10),('bagX-annual',F(30,1),30),('bagY-annual',F(80,4),20),('bag-expected-annual-diff',F(30)-F(80,4),10),('budgetA-expenses',F(90)+100,190),('budgetA-original-rest',F(240)-90-100-35,15),('budgetA-new-expenses',F(90)+115,205),('budgetA-mutated-rest',F(240)-90-115-35,0),('budgetB-reserve',F(180,12),15),('budgetB-original-sum',F(170)+110+F(180,12),295),('budgetB-original-rest',F(360)-170-110-F(180,12)-50,15),('budgetB-new-reserve',F(300,12),25),('budgetB-new-sum',F(170)+110+F(300,12),305),('budgetB-new-rest',F(360)-170-110-F(300,12)-50,5),('annual-change-monthly',F(300-180,12),10),('speaker-price-gap',F(110)-45,65),('speaker-repair-slack',F(80)-45,35),('speaker-replacement-shortfall',F(110)-80,30),('supplierA-total',F(18)*40,720),('supplierB-total',F(15)*40,600),('supplier-total-gap',F(18-15)*40,120),('municipal-cost-rise',F(130000)-100000,30000),('municipal-rise-fraction',F(130000-100000,100000),F(3,10)),('municipal-rise-percent',F(130000-100000,100000)*100,30),('model-wage-original',F(12)*20,240),('model-wage-new',F(14)*20,280),('model-wage-individual-increase',F(14-12)*20,40),('model-two-workers-increase',F(14-12)*20*2,80),('factory-day1-productivity',F(60,6),10),('factory-day2-productivity',F(80,8),10),('factory-hourly-change',F(80,8)-F(60,6),0),('factory-daily-rise',F(80)-60,20),('culture-combined-cost',F(40)+30,70),('culture-budget-shortfall',F(70)-60,10),('culture-clothing-rest',F(60)-40,20),('culture-outing-rest',F(60)-30,30),('kiosk-dayA-disposable',F(120)*F('0.25'),30),('kiosk-dayB-disposable',F(60)*F('0.25'),15),('kiosk-dayA-reusable',F(14)+120*F('0.05'),20),('kiosk-dayB-reusable',F(14)+60*F('0.05'),17),('kiosk-A-extrap-disposable',2*120*F('0.25'),60),('kiosk-A-extrap-reusable',2*(F(14)+120*F('0.05')),40),('kiosk-B-extrap-disposable',2*60*F('0.25'),30),('kiosk-B-extrap-reusable',2*(F(14)+60*F('0.05')),34),('kiosk-disposable-total',(120+60)*F('0.25'),45),('kiosk-reusable-total',2*F(14)+(120+60)*F('0.05'),37),('kiosk-complete-savings',F(45)-37,8),('kiosk-A-extrap-savings',F(60)-40,20),('kiosk-B-extrap-extra',F(34)-30,4),('kiosk-extrap-overestimate',F(20)-8,12),('kiosk-correct-mean-volume',F(120+60,2),90),('legal-log-original-yes',F(1)+1,2),('legal-log-revised-A',F(0)+0,0),('legal-log-revised-B',F(1)+1,2)]:ck(l,x,F(y))
# Use only our earlier own actual XLSX writer function, extracted without rerunning its evidence script.
a=ast.parse(pathlib.Path('/tmp/economics-consumer12-independent-intake-and-counterworks.py').read_text());node=next(x for x in a.body if isinstance(x,ast.FunctionDef) and x.name=='actual_xlsx');ns={'zipfile':zipfile,'html':__import__('html')};exec(compile(ast.Module(body=[node],type_ignores=[]),'<own-XLSX-writer>','exec'),ns);save=ns['actual_xlsx']
P=O/'actually-created-own-XLSX-and-project-products';P.mkdir(exist_ok=False)
A={'C2':240,'C3':90,'C4':100,'C5':35,'C6':'=SUM(C3:C4)','C7':'=C2-C6-C5'};B={'C2':360,'C3':170,'C4':110,'C5':180,'C6':50,'C7':'=C5/12','C8':'=SUM(C3:C4)+C7','C9':'=C2-C8-C6'}
def parse_xlsx(p):
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None;data=z.read('xl/worksheets/sheet1.xml');root=ET.fromstring(data);ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};cells={}
  for c in root.findall('.//s:c',ns):
   f=c.find('s:f',ns);v=c.find('s:v',ns)
   if f is not None:cells[c.attrib['r']]='='+f.text
   elif v is not None:cells[c.attrib['r']]=F(v.text)
  return cells
# Independent restrictive formula evaluator; it evaluates the saved XML dependency graph, not author cached values or any Office host.
def eval_saved(cells):
 cache={};trail=set()
 def val(k):
  if k in cache:return cache[k]
  assert k not in trail and k in cells,(k,trail);trail.add(k);x=cells[k]
  if isinstance(x,F):r=x
  else:
   def rng(m):
    c1,r1,c2,r2=m.groups();assert c1==c2;r1=int(r1);r2=int(r2);return str(sum((val(c1+str(i)) for i in range(r1,r2+1)),F(0)))
   s=re.sub(r'SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)',rng,x[1:]);tree=ast.parse(s,mode='eval')
   def ex(n):
    if isinstance(n,ast.Constant) and isinstance(n.value,(int,float)):return F(str(n.value))
    if isinstance(n,ast.Name):return val(n.id)
    if isinstance(n,ast.BinOp):
     aa,bb=ex(n.left),ex(n.right)
     if isinstance(n.op,ast.Add):return aa+bb
     if isinstance(n.op,ast.Sub):return aa-bb
     if isinstance(n.op,ast.Mult):return aa*bb
     if isinstance(n.op,ast.Div):return aa/bb
    raise AssertionError(ast.dump(n))
   r=ex(tree.body)
  trail.remove(k);cache[k]=r;return r
 return {k:str(val(k)) for k in cells if isinstance(cells[k],str)}
own=[]
for name,cells,expected in [('A-initial.xlsx',A,{'C6':'190','C7':'15'}),('A-mutated.xlsx',{**A,'C4':115},{'C6':'205','C7':'0'}),('B-initial.xlsx',B,{'C7':'15','C8':'295','C9':'15'}),('B-mutated.xlsx',{**B,'C5':300},{'C7':'25','C8':'305','C9':'5'})]:
 path=P/name;save(path,cells);saved=parse_xlsx(path);actual=eval_saved(saved);assert actual==expected;own.append({'file':rec(path),'savedCells':{k:str(v) for k,v in saved.items()},'actuallyEvaluatedSavedFormulas':actual})
for pair,key in [(own[:2],'C4'),(own[2:],'C5')]:assert [k for k in pair[0]['savedCells'] if pair[0]['savedCells'][k]!=pair[1]['savedCells'][k]]==[key]
# Foreign four actual author XLSX inputs are checked by this independent evaluator, not counted as own products.
foreign=[];fd=json.load(open(R/h['actualFourSavedXLSX10FormulaEvaluationsTwoInputMutations']['path']))
for row,exp in zip(fd['workbooks'],[{'B6':'190','B7':'15'},{'B6':'205','B7':'0'},{'B7':'15','B8':'295','B9':'15'},{'B7':'25','B8':'305','B9':'5'}]):
 p=R/row['file']['path'];assert rec(p)['sha256']==row['file']['sha256'];actual=eval_saved(parse_xlsx(p));assert actual==exp;foreign.append({'foreignFile':rec(p),'independentSavedFormulaEvaluation':actual})
# Actual own written/media products and bounded project execution. No actual oral delivery, person contact, or human observations.
(P/'youth-card-and-cost-bars.txt').write_text('Jugendkarte: Erst Reparatur prüfen,45 im80-Budget; mögliche weitere Nutzung, keine Garantie.\nReparatur45 |█████████\nBudget80    |████████████████\nErsatz110   |██████████████████████\nKostenbalken:5 Euro je Block. Unsicherheit steht neben den Kosten; keine behauptete Ökobilanz.\n')
(P/'management-brief-and-window.txt').write_text('An Leitung:40 Einheiten werden in3 Tagen gebraucht.\nA:720 Euro | 2 Tage zuverlässig\nB:600 Euro | 1–8 Tage\nPreisvorteil120, aber keine bekannte Ausfallwahrscheinlichkeit. Bei kritischem Termin zunächst A; Teilmengenentscheidung benötigt konkreten Mengen-/Lagerbedarf. Diese eigene schriftliche/mediale Vorlage wurde nicht mündlich vorgetragen.\n')
plan={'question':'Two-day supplied kiosk money costs','provisionalSelectedDay':'A','initialDailySales':120,'initialTwoDays':2,'initialDisposable':str(2*120*F('0.25')),'initialReusable':str(2*(14+120*F('0.05'))),'actualProcedureRevision':'Use actual supplied fictional A120 and B60 separately, then aggregate; cleaning each open day','executedDays':[{'day':'A','disposable':str(120*F('0.25')),'reusable':str(14+120*F('0.05'))},{'day':'B','disposable':str(60*F('0.25')),'reusable':str(14+60*F('0.05'))}],'actualAggregatedDisposable':'45','actualAggregatedReusable':'37','savings':'8','oldOverestimatedSavings':'20','methodEffect':'12 overstatement removed; varying quantity and fixed cleaning handled explicitly','limits':'Fictional execution only; no real kiosk/environment/demand/return trial.'}
(P/'actually-executed-kiosk-project.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n');(P/'actual-kiosk-decision-report.txt').write_text('Die vollständig ausgewerteten Modelltage ergeben45 Einweg/37 Mehrweg; Geldvorteil8 statt20 bei vorläufigerA-Extrapolation. Das Aggregieren ersetzt tatsächlich eine unpassende Tagesannahme. Umwelt-, Nachfrage- und Rückgabedaten fehlen. Kein realer Schulversuch.\n')
(P/'own-law-information-card-and-model-request.txt').write_text('Eigene Karte: Bei hier vorausgesetztem behebbaren anfänglichen Mangel und Nacherfüllungsanspruch kann grundsätzlich Reparatur oder mangelfreie Lieferung gewählt werden. Gesetzliche Grenzen für unverhältnismäßige Kosten und die andere Abhilfe beachten; Kopfhörer bereitstellen. Keine automatische Geldrückforderung aus dieser Hilfe.\nEigene Musteranfrage im Modell: Ich bitte um Reparatur des angegebenen Mangels und biete die Kopfhörer zur Nacherfüllung an.\nErste Prüffrage: Findest du diese Karte verständlich? Protokoll zweimalJa.\nNeue Fragen: Welche Abhilfe verlangst du? Wie stellst du die Sache zur Verfügung?\n')
trial={'inputIsSuppliedFictionalProtocol':True,'actualFirstQuestion':'Findest du diese Karte verständlich?','originalSelfReports':['Ja','Ja'],'originalMethod':'Two yes responses suggest clarity; they do not assess legal application.','changedOwnMethod':'Score explicit appropriate remedy and availability separately0/1 using supplied norm aid.','actuallyAppliedRows':[{'person':'A','response':'automatic immediate money back','remedy':0,'availability':0,'total':0},{'person':'B','response':'repair and item offered','remedy':1,'availability':1,'total':2}],'actualOutcomeComparison':'2 positive self-reports change to different0/2 application marks','limits':'Own rubric actually executed on supplied log, no contact/survey/real learners or full refund analysis.'}
(P/'actually-applied-own-law-project-rubric.json').write_text(json.dumps(trial,ensure_ascii=False,indent=2)+'\n')
products=wr('actual-own-saved-XLSX-four-two-mutations-and-independent-foreign-four-replays.project-products.json',{'reviewer':'/root/economics_merge_audit','actualOwnFourWorkbooks':own,'actualOwnSavedFormulaEvaluations':10,'actualOnlyTwoExecutedInputMutations':True,'actualForeignFourWorkbooksIndependentReplays':foreign,'actualForeignSavedFormulaEvaluations':10,'evaluationBoundary':'Actual ZIP/XML saved formula dependency evaluation in an independent restricted Fraction interpreter. No spreadsheet GUI/Office host acceptance or cached-result verification is claimed.','ownActualWrittenMediaAndProjectProducts':[rec(p) for p in sorted(P.iterdir()) if not p.name.endswith('.xlsx')],'actualOralDelivery':False,'humanLearnersOrRealInstitutionsOrPrivateData':False})
wr('actual-independent-sixtyfour-Fraction-calculations-and-twelve-rubric-sum-checks.json',{'reviewer':'/root/economics_merge_audit','actualIndependentCalculationChecks':checks,'actualIndependentCalculationCount':len(checks),'rubricSumChecks':[{'materialId':m['id'],'actualSum':sum(s['points'] for s in m['examData']['scoring']['steps']),'declaredMax':m['examData']['scoring']['maxPoints'],'passing':m['examData']['scoring']['passingPoints']} for m in json.load(open(R/h['wholeFinalTwelveDEENMaterials']['path']))['materials']],'actualProducts':products,'noAuthorChecksCountedAsIndependent':True})
print(json.dumps({'actualFractionCount':len(checks),'ownFormulaEvaluations':10,'foreignFormulaEvaluations':10,'products':products}))
