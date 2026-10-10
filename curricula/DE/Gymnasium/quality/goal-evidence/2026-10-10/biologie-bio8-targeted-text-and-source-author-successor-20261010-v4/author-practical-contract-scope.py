# SPDX-License-Identifier: Apache-2.0
"""Primary-based author distinction between machine contracts and human trials."""
import hashlib,json,pathlib,fitz
from bs4 import BeautifulSoup
R=pathlib.Path(__file__).resolve().parents[7]
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
P=B/'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
specs=[('SN','bde9c7af4c25',[30,43,44]),('ST','58b106c65a71',[28,29,30,31,44,45]),('TH','d77b5661a184',[21,30,31]),('HH','8ed7ac127a75',[25,27]),('MV','aa350433c07b',[17,32]),('BB-BE','e9a386033898',[38]),('RP','307f5d841072',[46,48]),('HE','52c278d6f5a7',[33,38,39,40])]
primary=[]
for code,digest,ns in specs:
 p=O/'primary'/digest/'bundle/book.pdf';d=fitz.open(R/p)
 pages=[{'physicalPage':n,'wholePageText':d[n-1].get_text()}for n in ns]
 primary.append({'jurisdiction':code,'primary':ref(p),'wholePageTextExtraction':put('primary-reading/'+code+'.whole-relevant-pages.actual.json',{'physicalPages':pages,'primary':ref(p),'primaryBytesActuallyRead':True,'method':'PyMuPDF text extraction from the exact complete regular PDF'})})
for code,digest,keys in [('BY9','db60ac5d738a',['B9 Lernbereich 2','B9 3.3']),('BY10','d260f03e09a4',['B10 Lernbereich 4'])]:
 p=O/'primary'/digest/'bundle/book.html';s=BeautifulSoup((R/p).read_text(),'html.parser');sections=[]
 for key in keys:
  h=next(h for h in s.find_all(['h2','h3','h4','h5'])if key in h.get_text())
  sections.append({'section':key,'wholeSectionText':h.find_parent('section').get_text(' ',strip=True)})
 primary.append({'jurisdiction':code,'primary':ref(p),'wholeSectionTextExtraction':put('primary-reading/'+code+'.whole-relevant-sections.actual.json',{'sections':sections,'primary':ref(p),'primaryBytesActuallyRead':True,'method':'BeautifulSoup complete relevant section extraction from the exact complete regular official HTML'})})
findings=[
 {'jurisdiction':'DE-SN','primaryPhysicalPages':[30,43,44],'boundedBio8Contribution':'4a microbial-use explanation;430 fossil inference;802 cultural effects',
  'separateWholeSourceContractDuties':['experiment with air-exposure plates/yoghurt cultures','microscopic comparison of plant cross-sections'],
  'machineContractDeficit':'The Bio8 explanation/fossil contracts do not cover these distinct experiment/microscopy operators. Review the existing method partners and their exact contracts; do not make human execution a gate for Bio8 machineM7.'},
 {'jurisdiction':'DE-ST','primaryPhysicalPages':[28,29,30,31,44,45],'boundedBio8Contribution':'4a use explanation;430 material-supported ancestry inference',
  'separateWholeSourceContractDuties':['plan, perform and record fermentation under varied conditions','microscope handling/preparation/drawing','selection-model execution/evaluation','use selection simulation software'],
  'machineContractDeficit':'A complete source claim would need separate contracts for the stated observable methods. Current partial Bio8 contribution is not a claim that those methods were performed.'},
 {'jurisdiction':'DE-TH','primaryPhysicalPages':[21,30,31],'boundedBio8Contribution':'4a microbial significance;430 hominisation inference;802 cultural example',
  'separateWholeSourceContractDuties':['microscope handling','prepare fresh specimens and analyze/record microscopic images'],
  'machineContractDeficit':'Separate microscopy/preparation contracts require review in their own partner frame. The given explanation and cultural-example operators remain legitimate bounded machine contributions.'},
 {'jurisdiction':'DE-MV','primaryPhysicalPages':[17,32],'boundedBio8Contribution':'4a microbial-use reasoning;430 biological fossil inference;802 cultural effects',
  'separateWholeSourceContractDuties':['microscopy of yeast','discuss human-dispersal theories','judge future opportunities and limits of cultural evolution'],
  'machineContractDeficit':'802 adds only cultural-transmission/present-effects analysis. Future evaluation and microscopy have distinct operators and remain open in the full partner frame.'},
 {'jurisdiction':'DE-BB and DE-BE','primaryPhysicalPages':[38],'boundedBio8Contribution':'430 compares supplied fossil traits/dates and revises a phylogenetic hypothesis',
  'separateWholeSourceContractDuties':['review the rest of the evolution source partners'],
  'machineContractDeficit':'No distinct machine defect established merely because the supplied comparison cards are constructed. The official comparison operator and the bounded analytical contract can correspond without claiming real learner work or real fossil handling.'},
 {'jurisdiction':'DE-HH','primaryPhysicalPages':[25,27],'boundedBio8Contribution':'4a describes microbial use in food production;430 human ancestry evidence',
  'separateWholeSourceContractDuties':['general practical competence partners beyond the concrete bounded clauses'],
  'machineContractDeficit':'The inspected concrete food-production clause asks for description. No direct practical-method deficit in this bounded clause is established by actualLearnerPerformance=false.'},
 {'jurisdiction':'DE-BY','primarySections':['B9.2','B9.3.3','B10.4'],
  'boundedBio8Contribution':'4a explains structure/reproduction/metabolism as a basis for microbial use;528 transfer technique;430 plus802 biological/cultural analysis',
  'separateWholeSourceContractDuties':['societal/medical/ethical assessment partners for B9.3.3','other whole topic partners'],
  'machineContractDeficit':'No new actual-human-execution prerequisite follows from these bounded explanation/analysis clauses. Whole-source assessment coverage requires its own exact contracts.'}]
put('checks/source-practical-machine-contract-deficits.author.json',{'role':'author_not_independent_reviewer','actualPrimaryReading':primary,'sourcePrimaryFactsNotWholeSourceApproval':True,
 'machineM7HumanTrialRequired':False,'humanTrialStatusIndependent':True,'actualLearnerPerformance':False,'actualLaboratoryExecution':False,
 'aiCandidateCasesAreMachinePerformanceContracts':True,'records':findings,'blanketHumanHold':False,'wholeSourcePartnerReview':'OPEN_WHERE_EXACT_OPERATOR_CONTRACT_UNCONFIRMED','strictGain':0})
print(json.dumps({'actualPrimaryPDFsRead':8,'actualPrimaryHTMLsRead':2,'jurisdictionContractQualifications':len(findings),'blanketHumanHold':False,'humanTrialClaimed':False}))
