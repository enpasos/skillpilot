import ast,datetime,json,pathlib,re,zipfile,xml.etree.ElementTree as ET
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from openpyxl import Workbook,load_workbook
from openpyxl.styles import Font,PatternFill,Alignment
H=pathlib.Path(__file__).resolve().parent
base='/assets/assessments/mathematik/functions-finance-six-same-identity-2026-11-04-v1'
assets=[]
# Genuine plotted mathematical solutions; not an input-image substitute.
for lang in ['de','en']:
 fig,ax=plt.subplots(figsize=(11,4.6),layout='constrained');t=np.linspace(0,48,961);tv=np.linspace(0,24,481)
 ax.plot(t,10+8*np.sin(np.pi*t/12),color='#1656a0',lw=2.5,label='T: erstes Modell' if lang=='de' else 'T: initial model')
 ax.plot(tv,12+6*np.sin(np.pi*tv/12),color='#ae4625',lw=2.5,ls='--',label='T_v: verändertes Modell' if lang=='de' else 'T_v: changed model')
 ax.scatter([0,6,12,18,24],[10,18,10,2,10],color='#11263f',zorder=4,label='Messwerte' if lang=='de' else 'observations')
 ax.scatter([6,30,18,42],[18,18,2,2],s=65,facecolors='none',edgecolors='#1656a0',zorder=5)
 ax.set(xlim=(0,48),ylim=(0,21),xticks=np.arange(0,49,6),yticks=np.arange(0,21,2),xlabel='t in h seit 6 Uhr morgens' if lang=='de' else 't in hours since 6 a.m.',ylabel='Temperatur in °C' if lang=='de' else 'temperature in °C',title='Periodisches Temperaturmodell und Variation' if lang=='de' else 'Periodic temperature model and variation')
 ax.grid(alpha=.3);ax.legend(loc='upper right');p=H/'7f11ffe0-7c43-4507-9101-50374a60b0e8'/f'solution-graph.{lang}.png';fig.savefig(p,dpi=160);plt.close(fig);assets.append({'localPath':str(p.relative_to(H)),'kind':'solution-graph','language':lang})
 fig,axs=plt.subplots(1,2,figsize=(11.8,4.8),layout='constrained');t=np.linspace(0,9,901);tv=np.linspace(4,9,501)
 axs[0].plot(t,100*2**(t/2),lw=2.5,label='ursprünglich' if lang=='de' else 'initial');axs[0].plot(tv,400*1.1**(tv-4),lw=2.5,ls='--',label='ab t=4 verändert' if lang=='de' else 'changed after t=4');axs[0].scatter([0,2,4],[100,200,400],color='#122c4c',zorder=4)
 axs[0].set(title='Zellzahl: Wachstum' if lang=='de' else 'Cell count: growth',xlabel='t in h',ylabel='Anzahl Zellen' if lang=='de' else 'number of cells',xlim=(0,9),ylim=(0,2400),xticks=range(10));axs[0].legend(loc='upper left')
 axs[1].plot(t,80*.5**(t/3),lw=2.5,color='#ae4625');axs[1].scatter([0,3,6],[80,40,20],color='#122c4c',zorder=4)
 axs[1].set(title='Stoffmenge: Abklingen' if lang=='de' else 'Amount: decay',xlabel='t in h',ylabel='Stoffmenge in mg' if lang=='de' else 'amount in mg',xlim=(0,9),ylim=(0,90),xticks=range(10));
 for ax in axs:ax.grid(alpha=.3)
 p=H/'27b63e2e-6a34-483e-8e5a-fe0f49670d1d'/f'solution-graph.{lang}.png';fig.savefig(p,dpi=160);plt.close(fig);assets.append({'localPath':str(p.relative_to(H)),'kind':'solution-graph','language':lang})
(H/'graph-assets.json').write_text(json.dumps({'status':'FOUR_ACTUAL_SOLUTION_PNGS_REVIEW_SIDECARS_ONLY_NO_RUNTIME_DEPENDENCY','assets':assets},ensure_ascii=False,indent=2)+'\n')
# Build real XLSX files with spreadsheet cell formulas and independently evaluated caches.
# This finite arithmetic evaluator is a technical author check, not a claim of Excel/LibreOffice execution.
checks=[]
def format_sheet(ws):
 ws.freeze_panes='B2'
 for cell in ws[1]:cell.font=Font(bold=True,color='FFFFFF');cell.fill=PatternFill('solid',fgColor='245987');cell.alignment=Alignment(wrap_text=True)
 ws.row_dimensions[1].height=35
 for col in ['A','B','C','D','E']:ws.column_dimensions[col].width=24
 for row in ws.iter_rows(min_row=2):
  for c in row:c.number_format='#,##0.00'
 if ws.title=='Rates':
  for row in ws.iter_rows(min_row=2,min_col=1,max_col=1):row[0].number_format='0.00%'

def evaluate(ws):
 values={};formulas={}
 for row in ws.iter_rows():
  for c in row:
   if c.data_type!='f':
    if isinstance(c.value,(int,float)):values[c.coordinate]=c.value
    continue
   formula=c.value;expr=re.sub(r'(\d+(?:\.\d+)?)%',r'(\1/100)',formula[1:]);refs=re.findall(r'\b[A-Z]+\d+\b',expr)
   for ref in refs:assert ref in values,(ws.title,c.coordinate,formula,ref)
   expr=re.sub(r'\b[A-Z]+\d+\b',lambda m:repr(values[m[0]]),expr);tree=ast.parse(expr,mode='eval')
   assert all(isinstance(n,(ast.Expression,ast.Constant,ast.BinOp,ast.UnaryOp,ast.Add,ast.Sub,ast.Mult,ast.Div,ast.Pow,ast.USub,ast.UAdd,ast.Load)) for n in ast.walk(tree)),expr
   value=eval(compile(tree,'<finite-author-spreadsheet-arithmetic>','eval'),{'__builtins__':{}});values[c.coordinate]=value;formulas[c.coordinate]=value
 return values,formulas

def finish(wb,p):
 caches={};sheetfacts=[]
 for ws in wb:
  format_sheet(ws);values,forms=evaluate(ws);caches[ws.title]=forms;sheetfacts.append({'sheet':ws.title,'formulaCells':len(forms),'evaluatedValues':values})
 wb.properties.created=datetime.datetime(2026,11,4);wb.properties.modified=datetime.datetime(2026,11,4);wb.save(p)
 with zipfile.ZipFile(p) as z:items={i.filename:(i,z.read(i.filename)) for i in z.infolist()}
 ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'};prefix='{'+ns['m']+'}'
 for i,ws in enumerate(wb,1):
  name=f'xl/worksheets/sheet{i}.xml';info,xml=items[name];root=ET.fromstring(xml)
  for c in root.findall('.//m:c',ns):
   if c.get('r') not in caches[ws.title]:continue
   v=c.find('m:v',ns)
   if v is None:v=ET.SubElement(c,prefix+'v')
   v.text=repr(caches[ws.title][c.get('r')])
  items[name]=(info,ET.tostring(root,encoding='utf-8',xml_declaration=True))
 with zipfile.ZipFile(p,'w') as z:
  for name,(info,content) in items.items():z.writestr(info,content)
 cached=load_workbook(p,data_only=True);formula=load_workbook(p,data_only=False)
 for name,forms in caches.items():
  for ref,v in forms.items():assert cached[name][ref].value==v and formula[name][ref].data_type=='f'
 checks.append({'workbook':str(p.relative_to(H)),'cacheReadbackMatchedAllFormulaCells':True,'evaluationMethod':'Finite arithmetic evaluation of actual authored cell formulas; cached values written and read back with openpyxl. No Excel/LibreOffice host run claimed.','sheets':sheetfacts})

wb=Workbook();ws=wb.active;ws.title='Rates';ws.append(['Zinssatz / annual rate','Jahr / year 1 EUR','Jahr / year 2 EUR','Jahr / year 3 EUR','Differenz / difference EUR'])
for i,r in enumerate([.04,.05,.06,.0506,.0507,.0508],2):ws.append([r,f'=2000*(1+A{i})',f'=B{i}*(1+A{i})',f'=C{i}*(1+A{i})',f'=D{i}-2320'])
p=H/'1842da92-ca2c-5fed-a946-e6413a6285bb'/'solution-spreadsheet.xlsx';finish(wb,p)
wb=Workbook();ws=wb.active;ws.title='Savings';ws.append(['Jahresrate / annual EUR','Jahr / year 1 EUR','Jahr / year 2 EUR','Jahr / year 3 EUR','Jahr / year 4 EUR'])
for i,r in enumerate([450,475,500,478,479],2):ws.append([r,f'=A{i}',f'=B{i}*1.03+A{i}',f'=C{i}*1.03+A{i}',f'=D{i}*1.03+A{i}'])
p=H/'f6574cdc-e29c-5a8f-a009-9f28b3bcf9be'/'solution-spreadsheet.xlsx';finish(wb,p)
wb=Workbook();wb.remove(wb.active)
for title,rate,last in [('2pct',.02,7),('0pct',0,8)]:
 ws=wb.create_sheet(title);ws.append(['Jahr / year','Anfang / opening EUR','Zinsen / interest EUR','Einzahlung / deposit EUR','Ende / closing EUR']);ws.append([0,None,None,None,1000])
 for i in range(3,last+3):ws.append([f'=A{i-1}+1',f'=E{i-1}',f'=B{i}*{rate}',200,f'=B{i}+C{i}+D{i}'])
p=H/'fc34449a-fbf4-574c-884f-ecdf48b42d2e'/'solution-spreadsheet.xlsx';finish(wb,p)
(H/'author-spreadsheet-formula-and-cache-check.json').write_text(json.dumps({'status':'AUTHOR_SHEETS_FORMULAS_AND_CACHE_CHECK_PASS_NOT_HOST_ACCEPTANCE','workbooks':checks},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'graphs':len(assets),'workbooks':len(checks),'formulaCells':sum(s['formulaCells'] for w in checks for s in w['sheets'])}))
