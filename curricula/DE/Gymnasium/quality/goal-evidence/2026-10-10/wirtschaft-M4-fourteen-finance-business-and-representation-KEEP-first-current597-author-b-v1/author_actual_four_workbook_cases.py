"""Saved author work, not a learner submission or spreadsheet-host acceptance."""
from pathlib import Path
from fractions import Fraction as F
import hashlib,json,zipfile,copy,ast,re
from openpyxl import Workbook,load_workbook
from openpyxl.chart import BarChart,Reference
from openpyxl.workbook.properties import CalcProperties
O=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def chart(w,title,cols,start,end,cat,where,unit,stack=False):
 c=BarChart();c.title=title;c.y_axis.title=unit;c.x_axis.title='Kategorie / Zeitpunkt'
 c.add_data(Reference(w,min_col=cols[0],max_col=cols[-1],min_row=start,max_row=end),titles_from_data=True)
 c.set_categories(Reference(w,min_col=cat,min_row=start+1,max_row=end))
 if stack:c.grouping='stacked';c.overlap=100
 c.width=19;c.height=10;w.add_chart(c,where)
b=Workbook();b.remove(b.active);b.calculation=CalcProperties(calcId=191029,fullCalcOnLoad=True,forceFullCalc=True,calcMode='auto')
a=b.create_sheet('8328_A_2024');a.append(['WZ 2008','Statistische Unternehmen','Beschäftigungsverhältnisse','Beschäftigung je Unternehmen'])
a.append(['C Verarbeitendes Gewerbe',198362,7801230,'=C2/B2']);a.append(['G Handel',538248,6017332,'=C3/B3'])
a['A6']='2024; Destatis, Stand 3.8.2026. Jahresdurchschnitt der Beschäftigungsverhältnisse; keine Personenquote.'
chart(a,'Unternehmen: Anzahl 2024',[2],1,3,1,'A8','Unternehmen');chart(a,'Beschäftigung: Jahresdurchschnitt 2024',[3],1,3,1,'L8','Beschäftigungsverhältnisse')
w=b.create_sheet('8328_B_Handwerk');w.append(['Wirtschaftsabschnitt','Rechtliche Einheiten gesamt (1000)','Handwerk (1000)','Modellanteil gerundeter Werte'])
w.append(['C Verarbeitendes Gewerbe',210,86,'=C2/B2']);w.append(['F Baugewerbe',388,253,'=C3/B3'])
w['A6']='2024; Destatis, Stand 23.4.2026. Gerechnete gerundete Anteile können veröffentlichte Originalanteile verfehlen.'
chart(w,'Handwerksanteil: gerundete Modellbasis',[4],1,3,1,'A8','Anteil (0 bis 1)')
w=b.create_sheet('685_A_GuV');w.append(['Jahr','Umsatz (1000 EUR)','Gewinn (1000 EUR)','Gewinn/Umsatz'])
for r in [(2023,100,12),(2024,130,13),(2025,150,9)]:w.append([*r,f'=C{w.max_row+1}/B{w.max_row+1}'])
w['A7']='Eigene fiktive gleich abgegrenzte Jahre; absolute Werte und Marge sind verschiedene Größen.'
chart(w,'Umsatzverlauf',[2],1,4,1,'A9','1000 EUR');chart(w,'Gewinnverlauf',[3],1,4,1,'L9','1000 EUR')
w=b.create_sheet('685_B_Bilanz');w.append(['Stichtagsmodell','Eigenkapital (1000 EUR)','Schulden (1000 EUR)','Summe','EK-Anteil','Schuldenanteil'])
w.append(['31.12. fiktiv',90,210,'=B2+C2','=B2/D2','=C2/D2'])
w['A5']='Aktiva insgesamt 300; nicht als dritter Finanzierungsanteil addieren. Fälligkeiten und liquide Mittel fehlen.'
chart(w,'Finanzierungsstruktur am Stichtag',[2,3],1,2,1,'A7','1000 EUR',True)
for w in b:
 w.freeze_panes='B2'
 for col in ['A','B','C','D','E','F']:w.column_dimensions[col].width=28 if col!='A' else 39
 for row in w:
  for c in row:
   if c.data_type=='f':c.number_format='0.00%' if (w.title!='8328_A_2024' and c.column>=4) else '0.00'
before=O/'own-four-spreadsheet-cases.before-actual-input-change.xlsx';after=O/'own-four-spreadsheet-cases.after-actual-input-change.xlsx'
assert not before.exists() and not after.exists();b.save(before)
mutations=[('8328_A_2024','C3',6017332,6117332),('8328_B_Handwerk','C3',253,250),('685_A_GuV','C4',9,18),('685_B_Bilanz','B2',90,110),('685_B_Bilanz','C2',210,190)]
m=load_workbook(before)
for s,c,x,y in mutations:assert m[s][c].value==x;m[s][c]=y
m.save(after)
def evaluate(w,coord):
 v=w[coord].value
 if not isinstance(v,str) or not v.startswith('='):return F(str(v))
 t=re.sub(r'\b[A-Z]+[0-9]+\b',lambda q:'('+str(evaluate(w,q.group()))+')',v[1:])
 def calc(n):
  if isinstance(n,ast.Expression):return calc(n.body)
  if isinstance(n,ast.Constant):return F(str(n.value))
  if isinstance(n,ast.BinOp):
   a,z=calc(n.left),calc(n.right)
   if isinstance(n.op,ast.Add):return a+z
   if isinstance(n.op,ast.Sub):return a-z
   if isinstance(n.op,ast.Mult):return a*z
   if isinstance(n.op,ast.Div):return a/z
  raise ValueError(ast.dump(n))
 return calc(ast.parse(t,mode='eval'))
checks=[]
expected={('8328_A_2024','D2'):(F(7801230,198362),F(7801230,198362)),('8328_A_2024','D3'):(F(6017332,538248),F(6117332,538248)),('8328_B_Handwerk','D2'):(F(86,210),F(86,210)),('8328_B_Handwerk','D3'):(F(253,388),F(250,388)),('685_A_GuV','D2'):(F(12,100),F(12,100)),('685_A_GuV','D3'):(F(13,130),F(13,130)),('685_A_GuV','D4'):(F(9,150),F(18,150)),('685_B_Bilanz','D2'):(F(300),F(300)),('685_B_Bilanz','E2'):(F(90,300),F(110,300)),('685_B_Bilanz','F2'):(F(210,300),F(190,300))}
for frame,p in enumerate([before,after]):
 actual=load_workbook(p,data_only=False)
 for (s,c),targets in expected.items():
  v=evaluate(actual[s],c);assert v==targets[frame];checks.append(dict(frame=p.name,sheet=s,cell=c,savedFormula=actual[s][c].value,actualRational=str(v),expectedRational=str(targets[frame]),pass_=True))
 wb0=load_workbook(before);changes=[];formula=0
 for w in actual:
  for row in w:
   for c in row:
    if c.data_type=='f':formula+=1;assert c.value==wb0[w.title][c.coordinate].value
    if c.value!=wb0[w.title][c.coordinate].value:changes.append((w.title,c.coordinate,wb0[w.title][c.coordinate].value,c.value))
 assert len(changes)==(0 if frame==0 else 5);assert formula==10
with zipfile.ZipFile(before) as z0,zipfile.ZipFile(after) as z1:
 charts=[x for x in z0.namelist() if re.fullmatch('xl/charts/chart[0-9]+.xml',x)]
 assert len(charts)==6
 for c in charts:assert z0.read(c)==z1.read(c),c
references=[]
import xml.etree.ElementTree as ET
with zipfile.ZipFile(before) as z:
 for c in charts:
  xml=z.read(c);r=ET.fromstring(xml);refs=[n.text for n in r.iter() if n.tag.endswith('}f')];assert refs
  references.append(dict(chart=c,sha256=hashlib.sha256(xml).hexdigest(),actualCellReferences=refs))
report=dict(role='AUTHOR actual saved XLSX and rational interpretation of saved formulas; not learner work or spreadsheet-host acceptance',before=dict(path=before.name,sha256=sha(before)),after=dict(path=after.name,sha256=sha(after)),actualSheets=4,actualCharts=6,actualSavedFormulas=10,actualInputChanges=[dict(sheet=s,cell=c,before=x,after=y) for s,c,x,y in mutations],actualFormulaChecks=checks,actualCheckCount=len(checks),chartReferencesBeforeAfterWholeExact=references,spreadsheetHostRecalculationClaim=False,actualHostRenderingClaim=False,checksErrors=0)
(O/'actual-four-saved-spreadsheet-cases-five-input-changes-six-linked-charts.AUTHOR.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'charts':6,'formulaChecks':len(checks),'errors':0}))
