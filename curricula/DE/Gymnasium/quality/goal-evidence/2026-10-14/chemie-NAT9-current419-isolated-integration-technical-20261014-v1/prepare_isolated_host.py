# SPDX-License-Identifier: Apache-2.0
"""Exact technical overlay. Never writes predecessor H or active data."""
from pathlib import Path
import json,hashlib,shutil,os,copy
from datetime import datetime,timezone
R=Path('/home/enpasos/projects/skillpilot')
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
O=B/'chemie-NAT9-current419-isolated-integration-technical-20261014-v1'
P=B/'chemie-NAT31-nine-reviewed-children-four-parent-clusters-current414-minimal-author-integration-proposal-20261014-v1'
I=B/'chemie-rest6-native2-plus-f7-475-existing292-QA-sort-successor-inactive-integration-technical-20261014-v2'
OLD=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
H=R/'tmp/chemie-resume-20261014/NAT9-host'
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
SEM=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
def read(p): return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def dump(p,j):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def b(p):return {'path':str(Path(p).relative_to(R)) if Path(p).is_absolute() else str(p),'sha256':sha(p),'bytes':Path(p).stat().st_size}
def split_dir(p):
 if p.is_symlink():
  target=p.resolve(); assert target.is_dir();p.unlink();p.mkdir()
  for child in target.iterdir(): (p/child.name).symlink_to(child, target_is_directory=child.is_dir())
 elif not p.exists():p.mkdir()
def materialize(rel,raw):
 p=H/rel
 for parent in reversed(p.parents):
  if parent==H.parent:continue
  if parent==H or H in parent.parents: split_dir(parent)
 if p.is_symlink(): p.unlink()
 elif p.exists(): assert p.is_file()
 p.write_bytes(raw)
 return p
if not H.exists():
 H.mkdir(parents=True)
 for child in OLD.iterdir():
  if child.is_dir(): (H/child.name).symlink_to(child,target_is_directory=True)
 split_dir(H/'app')
 (H/'app/scripts').unlink();shutil.copytree(R/'app/scripts',H/'app/scripts')
 split_dir(H/'curricula');split_dir(H/'curricula/DE');split_dir(H/'curricula/DE/Gymnasium');split_dir(H/'curricula/DE/Gymnasium/quality')
 (H/'curricula/DE/Gymnasium/quality/goal-evidence').unlink()
 (H/'curricula/DE/Gymnasium/quality/goal-evidence').symlink_to(R/'curricula/DE/Gymnasium/quality/goal-evidence',target_is_directory=True)
final=read(R/I/'FINAL.actual296-of414-normal-paired-native2-plus-historical-f7-475-inactive-integration.manifest.json')
prior_alias=[]
for bind in final['actualCurrentAliasBindings']:
 p=OLD/bind['path'];assert sha(p)==bind['sha256'], ('prior H drift',bind,p)
 prior_alias.append(b(p))
cas=read(R/P/'CAS.exact-four-parent-structure-plus-nine-reviewed-whole-children.NOT-APPLIED.json')
current=read(OLD/CAN); base=copy.deepcopy(current);oldmap={g['id']:g for g in current['goals']}
parents={r['goalId']:r for r in cas['replaceExactlyFourWholeObjects']}
for row in parents.values(): assert oldmap[row['goalId']]==row['beforeWholeGoal'],row['goalId']
current['goals']=[copy.deepcopy(parents[g['id']]['afterWholeGoal']) if g['id'] in parents else g for g in current['goals']]
children=cas['appendExactlyNineWholeObjects']
print('CHILD KEYS', [list(x)[:5] for x in children])
children=[r.get('wholeGoal',r.get('afterWholeGoal',r)) for r in children]
assert all('id' in g for g in children)
current['goals']+=children
assert len(current['goals'])==551
newmap={g['id']:g for g in current['goals']}
measured=read(R/I/'MEASURE.actual296-of414-new-rest2-plus-two-existing-selection-restorations-preserved292.actual.json')
assert all(newmap[i]==oldmap[i] for i in measured['strictCompleteGoalIds'])
assert all(newmap[i]==g for i,g in oldmap.items() if i not in parents)
canout=R/O/'candidate/canonical551.current419.preserve-actual296.exact13-delta.inactive.json';dump(canout,current)
materialize(CAN,canout.read_bytes())
sem=read(OLD/SEM); proposed=read(R/P/'candidate/semantic551.prospective419.existing-paired-kind-science.json')
print('SEM KEYS',list(sem),list(proposed))
# Both carry exact current object fingerprints; retain all other original rows.
key='decisions'
print('SEM ROW KEY',key)
changes=set(parents)|{g['id'] for g in children}
pm={g.get('goalId',g.get('id')):g for g in proposed[key]}
sem[key]=[copy.deepcopy(pm[g.get('goalId',g.get('id'))]) if g.get('goalId',g.get('id')) in changes else g for g in sem[key]]+[copy.deepcopy(pm[g['id']]) for g in children]
sem['counts']=copy.deepcopy(proposed['counts'])
semout=R/O/'candidate/semantic551.current419.preserve-prior538.exact13-delta.inactive.json';dump(semout,sem);materialize(SEM,semout.read_bytes())
views=read(R/P/'CAS.current-Chemistry-views-only-four-parent-reference-kinds.NOT-APPLIED.json');vrows=[]
for row in views['changes']:
 orig=row['original'];src=OLD/orig['path'];before=read(src);after=copy.deepcopy(before)
 # Apply exact reviewed entry deltas; preserve newer unrelated predecessor fields.
 for delta in row['changes']:
  keys=delta['jsonPointer'].strip('/').split('/');node=after
  for k in keys[:-1]:node=node[int(k)] if isinstance(node,list) else node[k]
  k=keys[-1];k=int(k) if isinstance(node,list) else k
  assert node[k]==delta['before'],(orig['path'],delta['jsonPointer']);node[k]=copy.deepcopy(delta['after'])
 for k,v in row.get('mechanicalRequiredFormatMetadataAdded',{}).items():assert k not in after or after[k]==v;after[k]=v
 raw=(json.dumps(after,ensure_ascii=False,indent=2)+'\n').encode();materialize(Path(orig['path']),raw)
 target=R/O/'candidate/views'/Path(orig['path']).name;dump(target,after)
 vrows.append({'path':orig['path'],'oldEqualsOriginalMainProposal':sha(src)==orig['sha256'],'oldSHA256':sha(src),'newSHA256':sha(target),'deltaCount':len(row['changes'])})
# Actual reviewed complete deck and both runtime languages if same published deck.
deckcas=read(R/P/'CAS.two-card-origin-tags-with-separate-paired-retarget-science.NOT-APPLIED.json')
raw=(R/deckcas['candidateDeck']).read_bytes()
materialize(Path(deckcas['originalDeck']['path']),raw)
publicpaths=[]
for path in (OLD/'app/public/data').glob('*natural*q2*.json'):
 try:j=read(path)
 except Exception:continue
 if j==deckcas['wholeOriginalDeck']:
  rel=path.relative_to(OLD);materialize(rel,raw);publicpaths.append(str(rel))
assert publicpaths,'normal published natural Q2 deck missing'
# Separate materialized config uses normal aliases, original9 visibility scopes unchanged.
mcfg=read(R/P/'config/M419.exact-original-memory-science-and-all-original-visibility-scopes.UNEXECUTED.inactive.config.json')
mcfg['landscapePath']=str(CAN);mcfg['reportPath']=str(O/'receipts/M419.normal-all-nine-visibility.actual.md')
mout=R/O/'config/M419.normal-current419-all-nine-original-visibility.inactive.config.json';dump(mout,mcfg)
dump(R/O/'checks/CAS.exact-isolated13-objects-82-views-two-tags.preserve296.actual.json',{'schemaVersion':1,'createdAtUTC':datetime.now(timezone.utc).isoformat(),'role':'technical integration only, not independent scientific review','priorHostAliasesVerified':prior_alias,'baseObjectCount':len(base['goals']),'newObjectCount':len(current['goals']),'prior296WholeObjectsExact':True,'other538WholeObjectsExact':True,'rootWeightUnchanged':True,'canonical':b(canout),'semantic':b(semout),'viewDeltas':vrows,'normalPublishedDeckCopies':publicpaths,'memoryConfig':b(mout),'originalNineVisibilityScopesPreserved':mcfg['visibilityScopes']==read(R/P/'config/M419.exact-original-memory-science-and-all-original-visibility-scopes.UNEXECUTED.inactive.config.json')['visibilityScopes'],'sourceCourseAcquisitionHoldsResolved':False,'originalHostWritten':False,'activeDataWritten':False})
print('HOST READY',H)
