# SPDX-License-Identifier: Apache-2.0
import copy,json
ABSENT=object()
def identity(row,fields):
 v=[row.get(x)for x in fields];return v[0]if len(v)==1 else v
def parts(pointer):return [v.replace('~1','/').replace('~0','~')for v in pointer.split('/')[1:]]
def get(value,pointer):
 for k in parts(pointer):
  if not isinstance(value,dict)or k not in value:return ABSENT
  value=value[k]
 return value
def set_value(value,pointer,data,remove=False):
 ks=parts(pointer);assert ks
 for k in ks[:-1]:
  if k not in value:value[k]={}
  value=value[k]
 if remove:value.pop(ks[-1],None)
 else:value[ks[-1]]=copy.deepcopy(data)
def apply_overlay(live,route):
 result=copy.deepcopy(live);audit=[]
 for name,collection in route['collections'].items():
  rows=result[name];fields=collection['identityFields']
  assert len({json.dumps(identity(r,fields),sort_keys=True)for r in rows})==len(rows)
  for change in collection['authorChanges']:
   hits=[i for i,r in enumerate(rows)if identity(r,fields)==change['identity']];assert len(hits)<=1
   before,after=change['before'],change['after']
   if before is None:
    if not hits:rows.append(copy.deepcopy(after));action='add'
    else:assert rows[hits[0]]==after,('Added-row conflict',name,change['identity']);action='already-added'
   elif after is None:
    if not hits:action='already-removed'
    else:assert rows[hits[0]]==before,('Removed-row conflict',name,change['identity']);rows.pop(hits[0]);action='remove'
   else:
    assert hits,('Missing existing row',name,change['identity']);row=rows[hits[0]];action='field-only'
    for delta in change['fieldChanges']:
     pointer=delta['field'];assert pointer,('Unexpected whole existing-row replacement',name,change['identity'])
     current=get(row,pointer);expected=delta.get('before',ABSENT);wanted=delta.get('after',ABSENT)
     if current==wanted or(current is ABSENT and wanted is ABSENT):continue
     assert current==expected or(current is ABSENT and expected is ABSENT),('Field conflict',name,change['identity'],pointer)
     set_value(row,pointer,None if wanted is ABSENT else wanted,remove=wanted is ABSENT)
   audit.append({'collection':name,'identity':change['identity'],'action':action,'fieldPaths':[x['field']for x in change['fieldChanges']]})
 for delta in route.get('topLevelAuthorChanges',[]):
  pointer=delta['field'];current=get(result,pointer);expected=delta.get('before',ABSENT);wanted=delta.get('after',ABSENT)
  if current==wanted or(current is ABSENT and wanted is ABSENT):continue
  assert current==expected or(current is ABSENT and expected is ABSENT),('Top-level conflict',pointer)
  set_value(result,pointer,None if wanted is ABSENT else wanted,remove=wanted is ABSENT)
 return result,audit
