# SPDX-License-Identifier: Apache-2.0
"""Read whole primary contexts and bind source/course residuals without approving them."""
import hashlib,json
from pathlib import Path
import fitz
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):
 q=OWN/p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
specs=[('HE','curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf',[49,50,51]),('BB','curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',[22,23,24,25]),('HB','curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf',[19,28,31,32,34]),('BW','curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',[26,30,40,41,42,43])]
rows=[]
for state,p,pages in specs:
 doc=fitz.open(ROOT/p);parts=[{'physicalPageOneBased':n,'wholeExtractedPageText':doc[n-1].get_text()} for n in pages]
 write('sources/primary-'+state+'.whole-pages.exact-text.json',{'source':bind(p),'role':'Complete selected primary pages read; original pagination retained; no changed source status','pages':parts});rows.append({'jurisdiction':state,'source':bind(p),'physicalPages':pages})
# Entire structured official BY partner units and all contained actual bodies.
p='curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json';by=read(p);G={g['id']:g for g in by['goals']};wanted=[]
for g in G.values():
 if any(g.get('title','').startswith(k) for k in ['C12 Lernbereich 8','C13 Lernbereich 5','C10 Lernbereich 4']):wanted.append(g['id'])
# The extraction gives exact unit IDs even where raw unit headings differ.
source=read(OWN.relative_to(ROOT).as_posix()+'/sources/all-direct-current-source-cells-partner-unions-whole-passages.json')
for lane in source['sources']:
 if lane['jurisdiction']=='DE-BY':
  for cell in lane['wholeExactDirectCellsAndPartnerUnions']:
   for passage in cell['wholeRelevantPassages']:
    if passage.get('id') in G:wanted.append(passage['id'])
todo=list(dict.fromkeys(wanted));seen=set()
while todo:
 i=todo.pop()
 if i in seen or i not in G:continue
 seen.add(i);todo+=G[i].get('contains',[])
write('sources/primary-BY.whole-related-structured-units-and-children.json',{'source':bind(p),'unitIds':list(dict.fromkeys(wanted)),'wholeRelatedOfficialBodies':[G[i] for i in sorted(seen)],'separateRawIdsFromCanonicalIds':True})
web=[{'url':'https://www.energy.gov/cmei/fuels/types-fuel-cells','publisher':'US Department of Energy','usedFor':'PEM versus alkaline electrolyte and qualitative application limits; author equations balanced independently.'},{'url':'https://www.energy.gov/cmei/fuels/fuel-cell-basics','publisher':'US Department of Energy','usedFor':'Hydrogen as carrier, ionic/electronic path separation; supplied case numbers are fictional.'},{'url':'https://www.energy.gov/sites/default/files/2023-09/KORE_PowerEA_Sept%202023%20Appendices.pdf','publisher':'US Department of Energy','usedFor':'Battery principle source locator for future independent source research; no present market specifications assumed.'},{'url':'https://www.acs.org/green-chemistry-sustainability/research-innovation/engineerings-metrics.html','publisher':'American Chemical Society','usedFor':'Distinguish theoretical atom economy from process material input; no atom economy assigned to mixing alone.'},{'url':'https://pubs.acs.org/doi/abs/10.1021/acssuschemeng.7b03505','publisher':'ACS original review paper','usedFor':'E-factor is waste/product; explicitly fixed system boundaries; mass metrics cannot replace broader environmental evaluation.'},{'url':'https://www.epa.gov/saferchoice/safer-choice-criteria-surfactants','publisher':'US EPA','usedFor':'Degradation rate, degradates and aquatic toxicity are separate evidence dimensions; no invented product approval.'}]
write('sources/primary-web-verification-and-own-model-provenance.json',{'actualWebSearchDate':'2026-10-15','references':web,'allNumericalCaseData':'Own explicitly fictional teaching models, not official measurements or current product performance.','noCopiedWholeOfficialTextsFromWeb':True,'noProductRecommendationOrHumanData':True})
write('sources/AUTHOR.source-course-and-atomic-boundaries.json',{'role':'Informed author diagnosis/proposals, no independent source/A/D/P vote','wholePrimaryReadInventory':rows,'wholeBYStructuredSource':bind(p),'decisions':[
 {'goalId':'e64a79df-7f21-5651-9b5d-e7d17580569e','finding':'HE50: plant oils/triglycerides are GK+LK; methanol transesterification/biodiesel is an additional LK bullet. Current one whole goal contains both.','action':'Supply both complete mechanisms/evaluations, mark actual course distinction. Do not reduce the whole target to plant oil or demand LK transesterification from GK by implication. Concrete future split proposal retained separately; current universal course suitability remains open.','noApproval':True},
 {'goalId':'c21d430b-424d-5b13-adf6-999f2490d2dc','finding':'HE51 has two independent LK bullets: ion-exchange structure/function and microbial surfactant degradation. Same detergent context does not make these one assessable competence.','action':'Supply both whole domains with independent observable rubrics and a concrete whole parent/two-child split proposal. Keep original body/current classification untouched in the selected input. No atomic judgement, no deleted operator.','noApproval':True},
 {'goalId':'ebfa2c18-0599-5282-bf7a-80c14d86331e','finding':'Atom economy refers to a balanced chemical reaction, whereas a formulation mixture alone has no reaction atom economy. PMI/E depend on declared input/waste boundary.','action':'Provide an upstream surfactant-component synthesis with balanced equations plus a separate complete formulation mass-flow boundary. Propose minimal whole-description correction; arbitrary mixing is explicitly non-evidence. Direct broad partial source links remain partial, not proof of this exact metric obligation.','noApproval':True},
 {'goalId':'e64a79df-7f21-5651-9b5d-e7d17580569e','finding':'Current English omits vegetable-oil fuels and transesterification/biodiesel from German goal.','action':'Whole-object English parity candidate only; no other semantic fields or course labels changed.','noApproval':True},
 {'goalId':'a76ab487-4663-5005-8454-cb3196f3773b','finding':'Current English omits starch-bearing plants and glucose-molecule structure required by DE/HE50.','action':'Whole-object English parity candidate only; preserve complete glucose/fermentation/risk-benefit chain.','noApproval':True},
 {'goalId':'a78aacf9-92ea-5627-8776-a595111f754c','finding':'BW3.4.8(4) selects one further material group. Current reviewed Source3 route chose dyes; detergents are not an extra universal compulsory GK/LK route.','action':'Preserve optional inventory and existing omission/selection holds; own detergent cases are curricular material, not retrospective source or selection approval. Actual learner trials are not a prerequisite to machine M7.','noApproval':True}
 ],'HBExactSourceBoundary':'Read primary19/28/31/32/34 against extracted labels. Several labels are paraphrases/broad unions, not literal atomic duties (e.g. primary28 does not demand biodiesel, primary31 Nernst is LK and fuel cells are a Vertiefung). Preserve all existing source holds and partner unions; no source mapping/status edited.','allOtherNationalBindings':'All22 lanes/151 direct cells and their full partners are retained as provenance. Broad/partial mappings are not silently upgraded; lower-stage general sustainability does not establish upper-stage Nernst/metric/EV full demand.','missingPrimaryImages':['0cf2ffe1-a988-5ffb-ab37-0ac7d58b23dd','0773a104-aaeb-5e96-a615-2a2bec3eb096'],'existing18ImagePolicy':'KEEP original current bytes and votes; zero new image generation or visual votes.','newScientificVotes':0,'M7':False})
print(json.dumps({'primaryPDFContexts':len(rows),'wholeBYBodies':len(seen),'newSourceVotes':0,'holdsRetained':True}))
