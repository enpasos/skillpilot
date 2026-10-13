"""Apache-2.0. Final scoped read checks; no active or approval writes."""
from pathlib import Path
import json,hashlib,datetime,sys,importlib.util
O=Path(__file__).resolve().parent.parent;R=Path.cwd();rd=lambda p:json.loads(Path(p).read_text());h=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def wr(name,x):p=O/'checks'/name;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
b=rd(O/'author/current15.base-goal-tuples.json');ids=b['goalIds'];can=rd(b['canonicalBinding']['path']);by={g['id']:g for g in can['goals']};mc=rd(rd(O/'author/current15.memory-retention.bindings.json')['inputConfig']['path']);ms=[json.loads(l)for l in (O/'author/current15.memory.raw-exact-retained.jsonl').read_text().splitlines()if l.strip()];mr=[m for m in ms if m['status']=='memory_required'];errors=[];views=[]
# The current normal M visibility traversal: target goalEntry/canonicalSubtree; prerequisiteOnly omitted.
for scope in mc['visibilityScopes']:
 view=rd(scope['viewPath']);visible=set()
 def add(id,visiting):
  if id in visible or id in visiting:return
  if id not in by:errors.append(scope['viewPath']+': missing '+id);return
  visible.add(id)
  for child in by[id].get('contains',[]):add(child,visiting|{id})
 def visit(row):
  if row.get('projectionRole')=='prerequisiteOnly':return
  if row.get('kind')=='canonicalSubtree':add(row['goalId'],set())
  elif row.get('kind')=='goalEntry':visible.add(row['goalId'])
  else:
   for child in row.get('children',[]):visit(child)
 for row in view['rootNodes']:visit(row)
 checks=[]
 for m in mr:
  if m['goalId']in visible:
   ok=bool(set(m['memoryGoalIds'])&visible);checks.append(dict(originGoalId=m['goalId'],memoryGoalIds=m['memoryGoalIds'],memoryGoalVisible=ok));
   if not ok:errors.append(scope['viewPath']+': memory visibility '+m['goalId'])
 views.append(dict(label=scope['label'],viewBinding=dict(path=scope['viewPath'],sha256=h(scope['viewPath'])),checkedRequiredOrigins=checks))
wr('M15.current-three-origin-visibility.actual.json',dict(schemaVersion=1,checkedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),currentRequiredOriginGoals=3,currentViewsRead=len(views),checkedVisibleOriginInstances=sum(len(v['checkedRequiredOrigins'])for v in views),views=views,normalTraversalBinding=dict(path='app/scripts/memoryCardReview.ts',sha256=h('app/scripts/memoryCardReview.ts')),newMemoryVotes=0,errors=errors,passed=not errors))
inv=rd(O/'author/current15.literal-source-witness-inventory.json');bindings=inv['inputBindings']+inv['sourceReceiptInputBindings']+rd(O/'author/current15.primary-literal-baselines-and-whole-partner-unions.actual.json')['inputBindings'];unique={x['path']:x for x in bindings};cas=[dict(path=x['path'],expected=x['sha256'],actual=h(x['path']),unchanged=h(x['path'])==x['sha256'])for x in unique.values()];errors += [r['path']+': CAS drift'for r in cas if not r['unchanged']]
parsed=[]
for f in O.rglob('*'):
 if f.suffix=='.json':rd(f);assert f.read_bytes().endswith(b'\n'),f;parsed.append(str(f.relative_to(O)))
 elif f.suffix=='.jsonl':
  text=f.read_text();assert text.endswith('\n'),f
  for l in text.splitlines():
   if l.strip():json.loads(l)
  parsed.append(str(f.relative_to(O)))
spec=importlib.util.spec_from_file_location('normal_schema_validator','scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);symlink_errors=module.curriculum_symlink_errors(str(R));errors+=symlink_errors
wr('FINAL.inputs-CAS-parse-and-symlinks.actual.json',dict(schemaVersion=1,checkedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),exactGoalCount=15,exactRegisteredClaimMatches=ids==rd(b['claimBinding']['path'])['goalIds'],currentCanonicalSHA=h(b['canonicalBinding']['path']),currentCanonicalWholeCount=len(can['goals']),currentCurricularAtomicFromDeclaredScope=402,currentStrictCompleteFromParentVerifiedBaseline=231,scientificCompletionsFromThisAuthor=0,inputCASChecks=cas,completeJsonAndJsonlParsedFiles=parsed,curriculumSymlinkErrors=symlink_errors,symlinkValidatorBinding=dict(path='scripts/validate_schemas.py',sha256=h('scripts/validate_schemas.py')),errors=errors,passed=not errors,limitations=['Current231 baseline is parent verified; this author did not run a full campaign/status/build','Author-only E1/G1 pending source/image/independent gates; no new approvals or actual human performance']))
print(json.dumps(dict(inputCAS=len(cas),parsed=len(parsed),views=len(views),visibleOrigins=sum(len(v['checkedRequiredOrigins'])for v in views),symlinkErrors=symlink_errors,errors=errors,passed=not errors)));assert not errors
