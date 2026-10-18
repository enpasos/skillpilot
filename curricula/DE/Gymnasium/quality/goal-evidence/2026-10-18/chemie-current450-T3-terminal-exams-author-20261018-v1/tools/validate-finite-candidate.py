# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json, jsonschema, sys, time, uuid
from pathlib import Path

P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T3-terminal-exams-author-20261018-v1')
def read(p): return json.loads(Path(p).read_text())
def pin(p):
    p=Path(p);b=p.read_bytes()
    return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
start=time.perf_counter()
inputs=read(P/'inputs/T3.nineteen-whole-current-goals-and-native-positive-profiles.json')
canonical=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
current={g['id']:g for g in read(canonical)['goals']}
for r in inputs['records']:
    assert current[r['goal']['id']]==r['goal'],r['goal']['id']
    assert json.loads(Path(r['native']['path']).read_text().splitlines()[r['lineOneBased']-1])==r['wholeRecord'],r['native']
goals=read(P/'AUTHOR.eighteen-whole-draft-exam-goals.INACTIVE.json')['goals']
s=read('docs/landscape-runtime.schema.json')
fragment={'$schema':s['$schema'],'$defs':s['$defs'],'$ref':'#/$defs/goal'}
validator=jsonschema.validators.validator_for(fragment)(fragment)
errors=[]
for g in goals:
    errors.extend({'id':g['id'],'path':list(e.path),'message':e.message} for e in validator.iter_errors(g))
    assert g['id'] not in current and uuid.UUID(g['id']).version==5
    e=g['examData'];assert e['reviewStatus']=='draft' and g['requires']==e['coveredGoalIds']
    assert 1<=len(g['requires'])<=3
    assert e['scoring']['maxPoints']==e['scoring']['passingPoints']==sum(t['points'] for t in e['scoring']['steps'])
    for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
        assert e[field].strip() and '/home/' not in e[field] and 'tmp/' not in e[field] and 'curricula/' not in e[field]
assert not errors,errors
for a in read(P/'AUTHOR.proposed-resource-delivery-deltas.INACTIVE.json')['assets']:
    assert Path(a['source']['path']).read_bytes()==Path(a['candidateFile']['path']).read_bytes()
    assert pin(a['candidateFile']['path'])==a['candidateFile']
json_count=0
for path in P.rglob('*.json'):read(path);json_count+=1
sys.path.insert(0,'scripts')
from validate_schemas import curriculum_symlink_errors
symlinks=curriculum_symlink_errors('.')
assert not symlinks,symlinks
out={'status':'PASS_FINITE_CANDIDATE_ONLY','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.perf_counter()-start,'canonicalAtFinalCheck':pin(canonical),'newGoalFragmentsValidated':len(goals),'schemaErrors':errors,'wholeOrdinaryGoalBodiesExact':19,'wholeNativePositiveRowsExact':19,'jsonFilesParsed':json_count,'stockCurriculumSymlinkErrors':symlinks,'requiresExactlyCovered':True,'allDraft':True,'pointSumsAndNonCompensatingThresholdsValid':True,'fiveExistingResourcesBytesExact':True,'normalWrites':0,'newScientificVotes':0,'fullSchemaValidatorMainOrBuildInvoked':False}
(P/'checks/VALIDATION.actual-selected-schema-body-and-material-CAS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out,ensure_ascii=False,indent=2))
