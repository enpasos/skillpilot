# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json, hashlib, subprocess, datetime
from jsonschema import Draft202012Validator
own=Path(__file__).parent;root=Path.cwd();author=own.parent/'biologie-evolution-eighteen-seven-source-course-remediation-author-v1'
def dump(name,d): (own/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def ref(p):
 p=Path(p);b=p.read_bytes();return {'path':p.as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
entry_path=author/'neutral-whole35-partner30-seven-source-author-successor.independent-review.entry.json';entry=json.loads(entry_path.read_text());refs=[]
def walk(v):
 if isinstance(v,dict):
  if 'path'in v and 'sha256'in v:refs.append(v)
  for x in v.values(): walk(x)
 elif isinstance(v,list):
  for x in v:walk(x)
walk(entry);seen=set();checks=[]
for b in refs:
 p=Path(b['path']);key=(str(p),b['sha256'])
 if key in seen:continue
 seen.add(key);data=p.read_bytes();assert hashlib.sha256(data).hexdigest()==b['sha256'].removeprefix('sha256:'),str(p)
 if 'bytes'in b:assert len(data)==b['bytes'],str(p)
 assert not p.is_absolute() and '..'not in p.parts and not p.is_symlink(),str(p)
 if p.suffix=='.json':json.loads(data)
 checks.append(ref(p))
frame=json.loads((author/'input/whole35-duty30-partner-original-frame.exact.json').read_text());inp=json.loads((own/'whole35-partner30-source7-view4-method5-companion2.science-only.input.json').read_text())
assert inp['wholeOriginal35DutyRows']==frame['wholeOriginalSourceDutyRows']
assert inp['wholeCurrent18GoalRows']==[x['wholeActiveGoal'] for x in frame['wholeCurrentGoalRows']]
assert inp['wholeOriginalAndCurrent30Partners']==frame['wholeOriginalAndCurrentPartnerGoals']
canon=json.loads((author/'input/current-canonical479.exact.json').read_text());expanded=json.loads((author/'candidate/current479-plus-one-assessable-behaviour-companion.canonical.json').read_text());assert len(canon['goals'])==479 and len(expanded['goals'])==480
old={g['id']:g for g in canon['goals']};new={g['id']:g for g in expanded['goals']};assert all(new[k]==v for k,v in old.items());assert set(new)-set(old)=={'7d2da9ab-aed0-562b-a99a-840825fca009'}
errors=[];validated=[]
schemas={'runtime':json.loads(Path('docs/landscape-runtime.schema.json').read_text()),'view':json.loads(Path('contracts/curriculum-package/v1/composition-view.schema.json').read_text())}
for p in [author/'input/current-canonical479.exact.json',author/'candidate/current479-plus-one-assessable-behaviour-companion.canonical.json']+sorted((author/'candidate/composition-views').glob('*.json'))+[author/'candidate/conditional/RP-SekI-plus-ancestry-behaviour-companion.view.json']:
 kind='runtime' if 'goals'in json.loads(p.read_text()) else 'view';es=list(Draft202012Validator(schemas[kind]).iter_errors(json.loads(p.read_text())));errors += [{'path':str(p),'message':x.message}for x in es];validated.append({'binding':ref(p),'schema':kind,'errors':len(es)})
parsed=[];sym=[];ignored=[]
for p in sorted(own.rglob('*')):
 if p.is_symlink():sym.append(str(p));continue
 if not p.is_file():continue
 if p.suffix=='.json':json.loads(p.read_text());parsed.append(ref(p))
 tr=subprocess.run(['git','ls-files','--error-unmatch','--',str(p)],capture_output=True).returncode==0
 if not tr and subprocess.run(['git','check-ignore','--quiet','--',str(p)],capture_output=True).returncode==0:ignored.append(str(p))
assert not errors and not sym and not ignored,(errors,sym,ignored)
legacy=json.loads((author/'candidate/mappings/HE144-four-source-and-course.whole-successor.review.json').read_text());ids=['e3167331-f855-5030-9673-29f55a7b4230','ac40db32-5dc7-5c43-8771-bf805d24aa3b','9b40dae5-6d89-5714-ac96-373e72a7045e'];paired=[]
for k in ids:
 edges=[x for x in legacy['mappings']if x['canonicalGoalId']==k];ds=[x for x in legacy['decisions']if k in x.get('canonicalGoalIds',[])];paired.append({'goalId':k,'wholeLegacyEdges':edges,'wholeCurrentDecisionRows':ds,'consumerMismatchConfirmed':all(x['matchType']=='exact'for x in edges)and all(x['matchType']=='partial'for x in ds)})
dump('normal-consumer-HE-three-exact-versus-partial.actual.json',{'schemaVersion':1,'role':'independent post-FIRST actual consumer-code and whole-edge consistency review','codeBindings':[ref('app/scripts/goalBookSourceAtlasInputs.ts'),ref('app/scripts/applicabilityCompiler.ts')],'atlasConsumer':'goalBookSourceAtlasInputs.ts:244-302 consumes decisions for scoped book coverage, mapped status, source facet and target; does not read legacy mappings strength. Catalog projection is not new science approval.','applicabilityConsumer':'applicabilityCompiler.ts:1131-1142 consumes mappingFile.mappings; any exact edge wins and publishes mappingStrength exact. Ordinary applicability is separate from whole source coverage but retained stronger edge is not equivalent to new partial primary qualification.','pairs':paired,'findingId':'EVO7S-A-LEGACY-004','decision':'HOLD targeted active mapping integration until all three retained current edges are made truthful partial in an additive author successor or the same bound is proven. Do not overwrite this historical candidate.','wholeSourceApproval':False,'strictGain':0})
dump('source7-independent-scoped-preservation-schema-portability.actual.json',{'schemaVersion':1,'role':'own targeted checks after independent Science-FIRST; no full builds','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'neutralEntryStillExact':ref(entry_path),'allNeutralBoundInputBytesExact':True,'verifiedInputBindings':checks,'whole35OriginalDutiesRetainedExact':True,'whole18CurrentGoalBodiesRetainedExact':True,'whole30OriginalAndCurrentPartnersRetainedExact':True,'whole479ExistingGoalObjectsRetainedExactInConditional480':True,'newCompanionIds':sorted(set(new)-set(old)),'runtimeAndViewSchemaChecks':validated,'schemaErrors':errors,'fullOwnJSONParseRecords':parsed,'ownSymlinks':sym,'ignoredUntrackedOwnMandatoryFiles':ignored,'ordinaryAtlasViewActual':ref(own/'normal-source-atlas-and-six-view-independent-check.v2.actual.json'),'preservedFirstDiagnosticFailure':ref(own/'normal-source-atlas-independent-first-run.actual.json'),'expectedCurrentAtomic394NotLowered':True,'mandatoryOnly393IsIncompleteDiagnostic':True,'activeWrites':False,'sourceApproval':False,'humanApproval':False,'strictGain':0})
print(json.dumps({'stableInputBindings':len(checks),'schemaChecks':len(validated),'schemaErrors':len(errors),'ownJSONParsed':len(parsed),'legacyPairs':len(paired),'noActiveWrite':True}))
