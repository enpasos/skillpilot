# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy,hashlib,json,shutil
import jsonschema
R=Path.cwd();O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-edta-five-normal-source-adapter-author-20261016-v1';T=R/'tmp/chemie-m7-resumed-20261016/edta-five-normal-source-adapter'
def read(p):return json.loads(p.read_text())
def pin(p):
 p=Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,v):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
n=read(O/'NEUTRAL.five-complete-normal-shaped-source-and-mapping-inputs.selector.json');original=read(R/n['originalFrozenAuthorInput']['path']);s=read(O/'CHECKS.actual-bounded-normal-reader-and-stock-source-facets.json');assert s['allPassed']
source_schema={'type':'object','required':['schemaVersion','extractionId','sourceLandscapeId','jurisdiction','subject','stage','sourceDocument','passages','sourceGoals'],'properties':{'sourceGoals':{'type':'array','items':{'type':'object','required':['id','passageId','title','description','sourceText','sourceRef','courseLevel','tags'],'properties':{'id':{'type':'string','minLength':1},'passageId':{'type':'string','minLength':1},'title':{'type':'string','minLength':1},'description':{'type':'string','minLength':1},'sourceText':{'type':'string','minLength':1},'courseLevel':{'type':'string'},'tags':{'type':'array','items':{'type':'string'}}}}},'passages':{'type':'array','items':{'type':'object','required':['id','topicCode','title','sourceGoalIds']}},'sourceDocument':{'type':'object','required':['key','path','official']}}}
mapping_schema={'type':'object','required':['version','reviewId','sourceLandscapeId','targetLandscapeId','sourceExtractionPath','status','mappings','decisions'],'properties':{'mappings':{'type':'array','items':{'type':'object','required':['legacyGoalId','canonicalGoalId','matchType','reviewDecisionId'],'properties':{'matchType':{'enum':['exact','partial']}}}},'decisions':{'type':'array','items':{'type':'object','required':['sourceGoalId','decision','canonicalGoalIds','rationale','reviewedAt','reviewer'],'properties':{'canonicalGoalIds':{'type':'array','items':{'type':'string'},'uniqueItems':True}}}}}}
put(O/'checks/BOUNDED.normal-reader-compatible-structural-schemas.json',{'role':'Explicit local bounded compatibility schemas, not an official source publication schema or scientific acceptance','sourceExtraction':source_schema,'mapping':mapping_schema})
actual=[]
for row in n['rows']:
 e=read(R/row['completeExtraction']['path']);m=read(R/row['completeMapping']['path']);jsonschema.Draft202012Validator(source_schema).validate(e);jsonschema.Draft202012Validator(mapping_schema).validate(m)
 actual.append({'jurisdiction':row['jurisdiction'],'completeExtractionLocalStructuralSchema':'PASS','completeMappingLocalStructuralSchema':'PASS','sourceGoals':len(e['sourceGoals']),'decisions':len(m['decisions'])})
# Actual runtime JSON Schema of only the affected target objects, not a full gate.
canonical=read(R/n['canonicalTargetContext']['path']);runtime=read(R/'docs/landscape-runtime.schema.json');affected={e['canonicalGoalId'] for a in read(O/'OPERATIONS.five-exact-before-after-and-four-source-fragments.author.json')['operations'] for e in a['legacyEdgesAfter']+a['additionalLegacyEdges']}
bounded=copy.deepcopy(canonical);bounded['goals']=[g for g in canonical['goals'] if g['id'] in affected];assert {g['id'] for g in bounded['goals']}==affected
jsonschema.Draft202012Validator(runtime).validate(bounded)
untouched=[]
for row in original:
 for field in ['mappingBinding','extractionBinding']:
  assert pin(row[field]['path'])==row[field];untouched.append(row[field])
put(O/'CHECKS.actual-local-structural-and-affected-target-runtime-schema.json',{'schemaVersion':1,'role':'Actual bounded schema/identity checks; no full curriculum gate','rows':actual,'affectedTargetObjectCount':len(affected),'affectedTargetGoalIds':sorted(affected),'runtimeSchema':pin(R/'docs/landscape-runtime.schema.json'),'runtimeSchemaValidationForAffectedTargetObjects':'PASS','allOriginalTenInputFilesUnchanged':untouched,'normalPAMVWritten':0,'sourceProjectionOrAtlasBuilds':0,'nativeOrCentralRuns':0})
(O/'scripts').mkdir()
for f in ['serialize_five.py','check_bounded_reader.mts','seal_five.py']:shutil.copyfile(T/f,O/'scripts'/f)
readme='''# EDTA-five: complete bounded source-adapter author candidate

The neutral selector chooses five complete normal-shaped extraction files and five complete mapping files. They are actual JSON artifacts, not source-row wrappers. Mapping sourceExtractionPath values intentionally retain their normal logical aliases; the explicit candidate alias map is required to read the candidate bytes. No host or active alias has been changed.

Original-A informed science554992... is the bounded source basis; this adapter is not a new independent vote. Four existing official-fragment UUIDs are completed as SourceGoals in BB/BE, with the same3.2.5 passage/document, actual42/LK locator and transparent authored description. Both original whole passages/rawText are retained; only sourceGoalIds append two each. Existing BB/BE cell13 uses the exact proposed partial edge set. BY extraction and mapping are wholly byte-exact. RP/BW remove only the unsupported EDTA edge; RP applies the accepted optional/page36 metadata repair. All other source wording, whole goals, decisions and edges remain exact unchanged objects.

Changed/new decisions are informed-author candidates with ai_candidate authority and explicit partial-source/wholeUnion limits. Historical top-level status/pipeline fields are retained history, not a new whole-course acceptance or human approval. RP/BW complete retained source-partner unions remain HOLD. Future joint source integration and original-A informed review of these serialized bytes are required.

Bounded checks cover strict original file/object before-equality, unique source IDs, one decision perSourceGoal, complete legacy-edge/decision consistency, no dangling passage/document/target, local normal-reader structural schemas, affected target-object runtime schema, and actual imported stock sourceAtlasFacet reads over the five complete candidate pairs. No Atlas build, Native, NormalP/A/M/V, Central, active writes or Git occurred. All original ten files are pinned again unchanged. Existing unresolved source-course facets are reported and not silently repaired or approved.

Own technical adapter code and this technical documentation are Apache-2.0. Original official source text retains its original rights; the adapter does not relicense third-party material. No private learner or session data is present.
'''
(O/'README.author-boundaries.md').write_text(readme)
selector={'schemaVersion':1,'role':'Finite bounded complete-source adapter author result, independent informed serialized-byte acceptance pending','neutralInputs':pin(O/'NEUTRAL.five-complete-normal-shaped-source-and-mapping-inputs.selector.json'),'exactBeforeAfterOperations':pin(O/'OPERATIONS.five-exact-before-after-and-four-source-fragments.author.json'),'unchangedObjectPins':pin(O/'PRESERVED.all-untouched-source-goal-decision-passage-and-head-pins.json'),'actualStructuralReader':pin(O/'CHECKS.actual-five-complete-files.structural-reader.json'),'actualBoundedStockReader':pin(O/'CHECKS.actual-bounded-normal-reader-and-stock-source-facets.json'),'actualSchemaCheck':pin(O/'CHECKS.actual-local-structural-and-affected-target-runtime-schema.json'),'completeExtractionFiles':5,'completeMappingFiles':5,'newOfficialSourceFragmentUUIDs':4,'BYWholeSourceAndMappingByteExact':True,'RPAndBWOtherEdgesPreserved':True,'wholeSourceUnionApproval':False,'wholeCourseApproval':False,'independentReviewVotes':0,'HumanApproval':False,'HumanTrial':False,'normalPAMVWritten':0,'actualHostsCreated':0,'actualAtlasBuilds':0,'Native':0,'Central':0,'activeWrites':0,'GitWrites':0,'sealPath':(O/'SEAL.finite-five-normal-source-adapter-author-output.json').relative_to(R).as_posix()}
put(O/'OUTPUTS.finite-five-complete-normal-source-adapter.author-selector.json',selector)
for p in O.rglob('*.json'):json.loads(p.read_text())
files=[pin(p) for p in sorted(O.rglob('*')) if p.is_file()];put(O/'SEAL.finite-five-normal-source-adapter-author-output.json',{'schemaVersion':1,'files':files,'outputCountIncludingSeal':len(files)+1,'noSelfHash':True,'allFilesParsedWhereJSON':True})
print(json.dumps({'selector':pin(O/'OUTPUTS.finite-five-complete-normal-source-adapter.author-selector.json'),'seal':pin(O/'SEAL.finite-five-normal-source-adapter-author-output.json'),'fileCount':len(files)+1,'totalBytes':sum(p.stat().st_size for p in O.rglob('*') if p.is_file()),'rows':actual,'affectedTargetObjects':len(affected)},ensure_ascii=False,indent=2))
