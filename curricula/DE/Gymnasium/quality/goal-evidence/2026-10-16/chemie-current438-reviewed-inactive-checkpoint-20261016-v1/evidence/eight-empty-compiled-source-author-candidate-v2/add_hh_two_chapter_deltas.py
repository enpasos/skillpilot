# SPDX-License-Identifier: Apache-2.0
"""Move only the two new HH f9 entries to an accurate navigation chapter."""
from pathlib import Path
import copy, hashlib, json
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).parent
V=R/'tmp/chemie-m7-resumed-20261016/eight-empty-compiled-source-author-candidate-v1'
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
pin=lambda p:{'path':str(Path(p).relative_to(R)),'sha256':sha(p),'bytes':Path(p).stat().st_size}
cp=O/'CAS.guarded-thirty-one-whole-files.source8.AUTHOR.v2.inactive.json';cas=read(cp)
original=read(V/'CAS.guarded-thirty-whole-files.source8.AUTHOR.inactive.json')
originalops={op['logicalPath']:op for op in original['fileOperations']}
entry={'kind':'goalEntry','goalId':'f9e6d689-6e59-59a4-9f21-8c2d44413244','projectionRole':'target'}
views=[]
def find(node,key,value):
 if isinstance(node,dict):
  if node.get(key)==value:return node
  for x in node.values():
   if isinstance(x,(dict,list)):
    r=find(x,key,value)
    if r is not None:return r
 elif isinstance(node,list):
  for x in node:
   r=find(x,key,value)
   if r is not None:return r
 return None
for course in ['gk','lk']:
 logical=f'curricula/DE/Gymnasium/composition-views/chemie/de-hh-{course}.view.json'
 op=next(op for op in cas['fileOperations'] if op['logicalPath']==logical)
 v1=read(R/originalops[logical]['after']['path']);v2=copy.deepcopy(v1)
 oldid=f'chemistry-de-hh-{course}-chemisches-gleichgewicht'
 newid=f'chemistry-de-hh-{course}-elektrochemische-spannungsquellen'
 old=find(v2,'id',oldid);parent=find(v2,'id',f'chemistry-de-hh-{course}-source-backed')
 assert old is not None and parent is not None and old['children'][-1]==entry and find(v2,'id',newid) is None
 old['children'].pop()
 new={'kind':'structure','id':newid,'label':'Elektrochemische Spannungsquellen','children':[copy.deepcopy(entry)]}
 parent['children'].insert(parent['children'].index(old)+1,new)
 reverse=copy.deepcopy(v2);rp=find(reverse,'id',f'chemistry-de-hh-{course}-source-backed');rn=find(reverse,'id',newid);rp['children'].remove(rn);find(reverse,'id',oldid)['children'].append(copy.deepcopy(entry));assert reverse==v1
 p=O/'after'/logical;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v2,ensure_ascii=False,indent=2)+'\n');op['after']=pin(p)
 views.append({'logicalPath':logical,'v1WholeAfter':originalops[logical]['after'],'v2WholeAfter':pin(p),'oldVisibleChapter':'Chemisches Gleichgewicht','newVisibleChapter':'Elektrochemische Spannungsquellen','sameExactExistingTargetEntry':entry,'allTargetAndSupportRolesUnchanged':True,'allOtherNodesExactModuloNewEmptyNavigationStructureAndMovedEntry':True})
changed=[op['logicalPath'] for op in cas['fileOperations'] if op['logicalPath'] in originalops and op['after']['sha256']!=originalops[op['logicalPath']]['after']['sha256']]
assert len(changed)==4 and all('/DE-HH/' in x or '/de-hh-' in x for x in changed)
cas['v2Deltas'].update({'changedV1WholeAfterFileCount':4,'changedV1WholeAfterLogicalPaths':changed,'allOther26V1WholeAfterFilesExact':True,'HHVisibleChapterOnlyDeltas':views})
cas['v2Deltas'].pop('allOther28V1WholeAfterFilesExact',None)
cp.write_text(json.dumps(cas,ensure_ascii=False,indent=2)+'\n')
(O/'CHECK.HH-two-visible-chapter-deltas.author.json').write_text(json.dumps({'role':'Additive AUTHOR chapter correction, no independent vote','views':views,'sameTargetsSameRolesSameOrdinaryWholes':True,'noOtherJurisdictionOrViewEdited':True,'HumanApproval':False},ensure_ascii=False,indent=2)+'\n')
print('Two HH chapter-only deltas prepared; four v1 after-files changed,26 retained exactly, one new HH source file.')
