# SPDX-License-Identifier: Apache-2.0
"""Additive HH source-only precision; preserve all v1 files and other cells."""
from pathlib import Path
import copy
import hashlib
import json

R=Path('/home/enpasos/projects/skillpilot')
V=R/'tmp/chemie-m7-resumed-20261016/eight-empty-compiled-source-author-candidate-v1'
O=Path(__file__).parent
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
pin=lambda p:{'path':str(Path(p).relative_to(R)),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def put(name,x):
 p=O/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p

old_selector=V/'OUTPUTS.concrete-source8-author-candidate.selector.json'
assert sha(old_selector)=='sha256:7f6b93ea3f2d2c4f828dbd7b4b681fc4273eb1fefc6f15d104267a2b647a172e'
cas=read(V/'CAS.guarded-thirty-whole-files.source8.AUTHOR.inactive.json')
audit=read(V/'CELLS.nine-exact-whole-source-and-selected-mapping-before-after.AUTHOR.json')
sid='de-hh-chemie-sekii-bildungsplan-2022-3-1-072-b84cc8ad'
nominal='Entsorgung und Recycling von Batterien und Akkumulatoren'
logical='curricula/DE/Gymnasium/input/HH/upper-secondary/source-extraction/DE_HH_CHEMIE_SEKII_BILDUNGSPLAN_2022.source-extraction.json'
L=Path(cas['baselineRoot']);before=read(L/logical);after=copy.deepcopy(before)
g=next(g for g in after['sourceGoals'] if g['id']==sid)
assert g['sourceText']==nominal+' bewerten'
g['sourceText']=nominal
g['sourceSpan']['label']='3.1, S. 31: '+nominal
g['metadata']['source8NominalClauseBoundary']={
 'sourceTextAndLocatorRole':'Literal nominal original HH31 item, without an added assessment verb',
 'titleAndDescriptionRole':'Derived BNE-supported teaching operationalization; bewerten is not claimed as a literal verb in this nominal source item',
 'sourceCourseAndAllOtherCompetenciesUnchanged':True,
 'independentReviewPending':True,
}
g['metadata']['extractionMethod']='literal-primary-clause-with-explicit-derived-BNE-title-and-description'
p=next(p for p in after['passages'] if p['id']==g['passageId'])
assert p['rawText'].count(nominal+' bewerten')==1
p['rawText']=p['rawText'].replace(nominal+' bewerten',nominal)
source_after=put('after/'+logical,after)
cas['fileOperations'].append({'logicalPath':logical,'before':pin(L/logical),'after':pin(source_after),'modifiedSections':['sourceGoals:selectedHH072','passages:selectedHH3.1SingleNominalLine'],'sourceCases':['HH']})
hh=next(c for c in audit['cells'] if c['sourceCase']=='HH')
hh['afterWholeSourceCell']=copy.deepcopy(g)
hh['afterWholeDedicatedPassages']=[copy.deepcopy(p)]
hh['sourceAndCourseBoundary']+=' Literal sourceText and sourceSpan label now exactly preserve the nominal HH31 item; title/description remain explicitly derived BNE operationalizations.'
changed=[]
for op in cas['fileOperations']:
 if '/mapping/DE-HH/' not in op['logicalPath']:continue
 data=read(R/op['after']['path'])
 selected=[d for d in data.get('decisions',[]) if d.get('sourceGoalId')==sid]
 if not selected:continue
 assert len(selected)==1
 d=selected[0]
 if isinstance(d['sourceSpan'],str):
  assert d['sourceSpan'].endswith(nominal+' bewerten')
  d['sourceSpan']=d['sourceSpan'][:-len(' bewerten')]
 else:
  assert d['sourceSpan']['label'].endswith(nominal+' bewerten')
  d['sourceSpan']['label']=d['sourceSpan']['label'][:-len(' bewerten')]
 oldafter=op['after']
 newpath=put('after/'+op['logicalPath'],data)
 op['after']=pin(newpath)
 changed.append({'logicalPath':op['logicalPath'],'v1After':oldafter,'v2After':op['after'],'delta':'Selected HH072 decision sourceSpan locator only; target arrays/rationale/status/other cells exact'})
 cell=next(x for x in hh['mappingArrays'] if x['logicalPath']==op['logicalPath'])
 cell['afterWholeSelectedDecisionArray']=copy.deepcopy(selected)
assert len(changed)==2
cellpath=put('CELLS.nine-exact-whole-source-and-selected-mapping-before-after.AUTHOR.v2.json',audit)
cas['role']='Additive AUTHOR source8 v2: exact HH nominal original; v1 fully preserved; independent review pending'
cas['selectedCellPairs']=pin(cellpath)
cas['protectedRoots'].append(str(O))
cas['allowedWholeAfterRoots']=[str(V.relative_to(R)),str(O.relative_to(R))]
cas['originalV1Selector']=pin(old_selector)
cas['v2Deltas']={'newHHSourceFile':logical,'changedV1WholeAfterFiles':changed,'allOther28V1WholeAfterFilesExact':True,'originalV1Unchanged':True}
caspath=put('CAS.guarded-thirty-one-whole-files.source8.AUTHOR.v2.inactive.json',cas)
for op in cas['fileOperations']:
 assert sha(R/op['before']['path'])==op['before']['sha256']
 assert sha(R/op['after']['path'])==op['after']['sha256']
assert sha(old_selector)=='sha256:7f6b93ea3f2d2c4f828dbd7b4b681fc4273eb1fefc6f15d104267a2b647a172e'
put('CHECK.HH-source-only-additive-v2.author.json',{'role':'AUTHOR mechanical delta check; no independent vote','v1Selector':pin(old_selector),'newSourceFile':pin(source_after),'changedV1AfterFiles':changed,'other28V1AfterFilesExact':True,'sourceGoalTitleDescriptionAndCourseExact':all(g[k]==next(q for q in before['sourceGoals'] if q['id']==sid)[k] for k in ['id','title','description','courseLevel','tags']),'allOtherHHSourceGoalsExact':[q for q in before['sourceGoals'] if q['id']!=sid]==[q for q in after['sourceGoals'] if q['id']!=sid],'oneHHSourcePassageLineChanged':True,'RorL4Writes':False,'newVotes':0,'HumanApproval':False})
print('Prepared HH nominal v2 only; not yet final selector')
