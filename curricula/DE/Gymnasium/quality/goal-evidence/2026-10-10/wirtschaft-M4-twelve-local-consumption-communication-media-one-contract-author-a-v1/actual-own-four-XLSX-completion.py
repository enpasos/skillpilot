from pathlib import Path
from decimal import Decimal
import json,zipfile,xml.etree.ElementTree as ET,re,ast,hashlib
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1'
def rec(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return rec(p)
put('actual-own-products-first-finalization-Decimal-JSON-failure.preserved-history.json',{'role':'TECHNICAL_AUTHOR_FINALIZATION_FAILURE_NOT_SCIENCE_FAILURE','error':'TypeError: Object of type Decimal is not JSON serializable','actualCompletedBeforeFailure':['whole36 authorworks/432 manual marks','60 exact Fraction checks','all4 XLSX products saved and actual saved formulas parsed/evaluated'],'failedArtifactWasNotCreated':'actual-own-four-XLSX-linked-budget-products-parsed-formulas-and-two-real-input-mutations.json','fix':'New completion reads the actual unchanged four saved workbooks, executes formulas again and serializes numeric inputs explicitly as decimal strings; no rerun/overwrite of earlier evidence.'})
NS='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
def evcell(cells,ref,memo):
 if ref in memo:return memo[ref]
 t=cells[ref]
 if not t.startswith('='):v=Decimal(t)
 else:
  s=t[1:]
  def summ(z):
   a,b=z.group(1),z.group(2);assert a[0]==b[0];return str(sum(evcell(cells,f'{a[0]}{i}',memo)for i in range(int(a[1:]),int(b[1:])+1)))
  s=re.sub(r'SUM\(([A-Z][0-9]+):([A-Z][0-9]+)\)',summ,s)
  s=re.sub(r'\b[A-Z][0-9]+\b',lambda z:str(evcell(cells,z.group(),memo)),s)
  def ev(n):
   if isinstance(n,ast.Expression):return ev(n.body)
   if isinstance(n,ast.Constant):return Decimal(str(n.value))
   if isinstance(n,ast.BinOp):
    a,b=ev(n.left),ev(n.right)
    if isinstance(n.op,ast.Add):return a+b
    if isinstance(n.op,ast.Sub):return a-b
    if isinstance(n.op,ast.Div):return a/b
   raise ValueError(ast.dump(n))
  v=ev(ast.parse(s,mode='eval'))
 memo[ref]=v;return v
rows=[]
for n in ['own-budget-A-input100-formulas.xlsx','own-budget-A-only-variable115-formulas.xlsx','own-budget-B-year180-formulas.xlsx','own-budget-B-only-year300-formulas.xlsx']:
 p=O/n
 with zipfile.ZipFile(p)as z:
  assert z.testzip()is None;tree=ET.fromstring(z.read('xl/worksheets/sheet1.xml'));cells={};cache={}
  for c in tree.findall(f'.//{{{NS}}}c'):
   f=c.find(f'{{{NS}}}f');v=c.find(f'{{{NS}}}v')
   if v is None:continue
   cells[c.attrib['r']]='='+f.text if f is not None else v.text;cache[c.attrib['r']]=v.text
  results={k:str(evcell(cells,k,{}))for k in cells};assert all(Decimal(results[k])==Decimal(cache[k])for k in cells)
  rows.append({'file':rec(p),'actualSavedCells':cells,'actualSavedFormulaEvaluation':results,'formulaCount':sum(v.startswith('=')for v in cells.values()),'zipAndXMLValidation':True,'realOfficeApplicationOpened':False,'humanLearnerEvidence':False})
assert [k for k in rows[0]['actualSavedCells']if rows[0]['actualSavedCells'][k]!=rows[1]['actualSavedCells'][k]]==['B4']
assert [k for k in rows[2]['actualSavedCells']if rows[2]['actualSavedCells'][k]!=rows[3]['actualSavedCells'][k]]==['B5']
assert rows[0]['actualSavedFormulaEvaluation']['B7']=='15'and rows[1]['actualSavedFormulaEvaluation']['B7']=='0'
assert rows[2]['actualSavedFormulaEvaluation']['B9']=='15'and rows[3]['actualSavedFormulaEvaluation']['B9']=='5'
put('actual-own-four-XLSX-linked-budget-products-parsed-formulas-and-two-real-input-mutations.json',{'role':'ACTUALLY_SAVED_AND_PARSED_OWN_AUTHOR_PRODUCTS','workbooks':rows,'actualWorkbookCount':4,'executedSavedFormulaCount':sum(x['formulaCount']for x in rows),'changedInputsOnlyA_B4_B_B5':True,'bothOriginalAndChangedFormulaStringsExact':True,'noOfficeOrHumanObservedAcceptanceClaim':True})
put('actual-own-media-two-target-audiences-written-and-table-products.no-oral-observation.json',{'role':'OWN_AUTHOR_WRITTEN_AND_MEDIA_PRODUCTS_NOT_ORAL_EVIDENCE','youthWrittenCard':'Reparatur prüfen: 45 Euro im 80-Euro-Budget, mögliche weitere Nutzung, keine Jahresgarantie. Ersatz für 110 Euro braucht weitere Mittel.','youthMediaTable':{'columns':['Option','Euro','Budget fit','Uncertainty'],'rows':[['Repair',45,'35 remaining','Follow-up defects'],['Replacement',110,'30 short','No financing supplied'],['Budget',80,'Limit','Model only']]},'managementWrittenBrief':'A 720/B 600: Priorität ist der Bedarf von 40 Einheiten in drei Tagen bei knappem Lager. A verlässlich zwei Tage, B ein bis acht Tage. Einkaufsvorteil 120 Euro ist kein Gesamtvorteil; ohne Risikodaten bedingt A.','managementMediaTable':{'columns':['Supplier','Units','UnitEuro','TotalEuro','Days'],'rows':[['A',40,18,720,'2 reliable'],['B',40,15,600,'1–8']]},'actualOralRecording':False,'actualHumanTrial':False,'transcriptDoesNotReplaceActualOralPerformance':True})
print(json.dumps({'actualXLSX':4,'actualSavedFormulaEvaluations':sum(x['formulaCount']for x in rows),'ownAuthorCompletion':'PASS','foreignScienceKEEP':False}))
