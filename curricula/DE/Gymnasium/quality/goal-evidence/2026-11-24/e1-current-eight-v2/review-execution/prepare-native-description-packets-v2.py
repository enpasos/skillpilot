from pathlib import Path
import json,sys,subprocess
name,tag=sys.argv[1:3];extra=sys.argv[3:]
subprocess.run(['python3','/tmp/e1-t5/prepare-native-description-packets.py',name,tag,*extra],check=True)
fall='d9a6ea85-f7e8-5cbd-afe9-62596e22040d'
for letter in ['a','b']:
 p=Path('/tmp/e1-t5')/(tag+'-'+letter);s=json.load(open(p/'output.schema.json'));assigned=s['properties']['descriptionReviews']['items']['properties']['goalId']['enum']
 if fall not in assigned:continue
 props={'goalId':{'type':'string','const':fall},'semanticAtomic':{'type':'boolean'},'atomicityReason':{'type':'string','minLength':1},'semanticKind':{'type':'string','enum':['curricularAtomic','practiceAssessment','navigationOnly']},'kindReason':{'type':'string','minLength':1}}
 s['properties']['currentFALLReview']={'type':'object','additionalProperties':False,'properties':props,'required':list(props)};s['required'].append('currentFALLReview');(p/'output.schema.json').write_text(json.dumps(s,indent=2)+'\n');prompt=(p/'driver-prompt.txt').read_text();prompt+='\nAdditionally assess the exact assigned FALL goal ('+fall+') for semantic atomicity and semantic kind. Return currentFALLReview with explicit reasons. One coherent comparison explained by a common physical relationship can be atomic despite requiring more than one observation. Decide critically from the current bilingual goal and full context; no verdict is expected. This is an additional actual current-goal review, not an inference from labels.\n';(p/'driver-prompt.txt').write_text(prompt)
