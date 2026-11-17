import datetime, hashlib, json, sys
from pathlib import Path
root=Path.cwd();sys.path.insert(0,str(root/'scripts'))
from generate_physics_partial_orders import course_seeds
base=root/'tmp/pipeline/laender-stufen/gesamt/review/physics-course-filter-v1';output=Path(sys.argv[1])
source=root/'scripts/generate_physics_partial_orders.py';before=hashlib.sha256(source.read_bytes()).hexdigest()
inputs=json.loads((base/'input.json').read_text());native=json.loads((base/'native.json').read_text());expected={x['id']:x for x in native['rows']};bad=[]
for item in inputs:
    for profile in ['GK','LK']:
        try:actual=item['id'] in course_seeds({item['id']},{item['id']:item['goal']},{'courseProfile':profile})
        except Exception as e:actual=type(e).__name__+': '+str(e)
        if actual!=expected[item['id']][profile]:bad.append({'id':item['id'],'profile':profile,'expected':expected[item['id']][profile],'actual':actual})
assert before==hashlib.sha256(source.read_bytes()).hexdigest()
result={'at':datetime.datetime.now().astimezone().isoformat(),'sourceSha256':before,'nativeSourceSha256':hashlib.sha256((root/'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java').read_bytes()).hexdigest(),'nativeClassSource':native['learnerServiceClassSource'],'boundEvidence':{str(base/p):hashlib.sha256((base/p).read_bytes()).hexdigest() for p in ['input.json','native.json','command.json']},'subjectGoals':len(inputs)-48,'syntheticGoals':48,'checkedComparisons':2*len(inputs),'differences':bad}
output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print({'checkedComparisons':result['checkedComparisons'],'differences':len(bad)})
assert not bad
