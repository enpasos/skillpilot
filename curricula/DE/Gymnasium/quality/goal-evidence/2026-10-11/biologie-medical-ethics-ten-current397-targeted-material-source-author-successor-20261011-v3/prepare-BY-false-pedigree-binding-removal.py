# SPDX-License-Identifier: Apache-2.0
"""Remove one proven erroneous candidate edge; preserve its literal curricular obligation."""
from pathlib import Path
import copy, hashlib, json, shutil
from bs4 import BeautifulSoup
R=Path.cwd();P=Path(__file__).resolve().parent
BASE=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-nature-eight-current397-targeted-material-source-author-successor-root-20261011-v2'
C=R/'tmp/medical10-current397-v3-normal-private-capsule'
def load(p):return json.loads(p.read_text())
def ref(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
def put(name,x):
 f=P/name;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return f
cfg=load(P/'sources/normal397-medical10.author.inputs.json');oldpath=R/load(BASE/'sources/normal397.author.inputs.json')['mappingPaths'][3]
m=load(oldpath);before=copy.deepcopy(m)
sid='550a30ba-48e0-5822-8733-38683473e37e';gid='440854be-7f06-5678-91cb-ba8dcab56959'
removed=[x for x in m['mappings'] if x['legacyGoalId']==sid and x['canonicalGoalId']==gid];assert len(removed)==1
m['mappings']=[x for x in m['mappings'] if not(x['legacyGoalId']==sid and x['canonicalGoalId']==gid)]
d=next(x for x in m['decisions'] if x['sourceGoalId']==sid);olddecision=copy.deepcopy(d)
d['canonicalGoalIds']=[g for g in d['canonicalGoalIds'] if g!=gid];assert not d['canonicalGoalIds']
d.update({'decision':'needsCanonicalGoal','matchType':'partial','rationale':'AUTHOR targeted source correction: actual B12-EA.3.1/GA.3.1 constructs a phylogenetic cladogram from molecular features. This cannot evidence a human-family inheritance pedigree. The erroneous550→440 edge is removed; correct f368→440 family-inheritance evidence is retained. The literal cladogram obligation remains and needs an independently reviewed appropriate canonical mapping; no source-union clearance.','reviewedAt':'2026-10-11','reviewer':'Codex Medical10 continuation AUTHOR, targeted independent source review pending'})
assert all(x==y for x,y in zip(m['decisions'],before['decisions']) if x['sourceGoalId']!=sid)
assert [x for x in m['mappings'] if x['legacyGoalId']!=sid]==[x for x in before['mappings'] if x['legacyGoalId']!=sid]
good='f368e24c-c167-5f00-82ba-2bbab5597740'
assert [x for x in m['mappings'] if x['legacyGoalId']==good]==[x for x in before['mappings'] if x['legacyGoalId']==good]
m['summary']['mappedSourceGoals']=sum(x['decision']=='mapped' for x in m['decisions'])
m['summary']['needsCanonicalGoal']=sum(x['decision']=='needsCanonicalGoal' for x in m['decisions'])
m['summary']['exactMappings']=sum(x.get('matchType')=='exact' for x in m['mappings'])
m['summary']['partialMappings']=sum(x.get('matchType')=='partial' for x in m['mappings'])
extract=R/m['sourceExtractionPath'];primaries=[]
for key in ['12-EA','12-GA']:
 f=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-biotechnologie-evolution-eight-whole-material-and-raster-author-candidate-v1/primary'/key/'bundle/book.html'
 text=' '.join(BeautifulSoup(f.read_text(),'html.parser').stripped_strings)
 passages={}
 for term in ['Kladogramm','Familienstammbäume']:
  i=text.find(term);assert i>=0;passages[term]=text[max(0,i-170):i+300]
 primaries.append({'authority':key,'originalWholePrimary':ref(f),'actualContextSpans':passages})
m['authorMedicalProtected440CladogramBoundaryCorrection']={'status':'inactive_author_candidate','falseEdgeRemoved':removed[0],'allOtherMappingsDecisionsAndExtractionExact':True,'correctFamilyPedigreeBindingRetained':True,'literalCladogramSourceObligationRetained':True,'sourceUnionApproval':False,'canonicalMappingDebtSourceGoalId':sid}
out=put('sources/mappings/03-BY.whole-false-cladogram-pedigree-edge-removal.author.review.json',m)
cfg['mappingPaths'][3]=str(out.relative_to(R));config=put('sources/normal397-medical10.author.inputs.json',cfg)
put('sources/BY550-false-pedigree-edge-removal.actual-author-delta.json',{'role':'AUTHOR raw targeted source delta, not independent review','oldWholeMapping':ref(oldpath),'unchangedWholeExtraction':ref(extract),'removedFalseEdge':removed[0],'oldWholeDecision':olddecision,'newWholeDecision':d,'correctF368FamilyPedigreeEdgesRetainedExactly':[x for x in m['mappings'] if x['legacyGoalId']==good],'wholePrimariesActuallyRead':primaries,'allOtherMappingsAndDecisionsExact':True,'openActualCladogramObligationNeedsCanonicalMapping':True,'newCanonicalPhylogenyPartnerNotStarted':True,'sourceUnionApproval':False,'independentApproval':False})
for f in [out,config]:
 dst=C/f.relative_to(R);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,dst)
print(json.dumps({'falseEdgeRemoved':1,'source550NeedsCanonicalGoal':1,'correctFamilyBindingRetained':True,'allOtherEdgesExact':True,'newPartners':0,'strictGain':0}))
