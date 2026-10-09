import json,pathlib,hashlib,datetime,importlib.util
from PIL import Image
B=pathlib.Path(__file__).parent;S=B.parent
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
def binding(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def exact(x):
 p=pathlib.Path(x['path']);return p.is_file() and binding(p)['sha256']==x['sha256'] and p.stat().st_size==x['bytes']
scienceFreeze=json.loads((S/'whole23-science-author.first.freeze.json').read_text())
assert all(exact(x) for x in scienceFreeze['inputs']+scienceFreeze['outputs']), 'Original scientific first seal changed'
manifest=json.loads((B/'23-goal-derived-original-prompts.author-input.json').read_text())['entries']
images=[];selected=[];checks=[]
for n in range(1,8):
 e=manifest[n-1];d=B/(str(n).zfill(2)+'-'+e['goalId']);row=json.loads((d/'neutral-selected-candidate.actual-author-binding.entry.json').read_text());images.append(row)
 assert row['wholeCurrentGoal']==e['wholeGoal'] and row['goalId']==e['goalId']
 im=Image.open(row['path']);assert im.format=='PNG' and list(im.size)==row['dimensions'] and .01<abs(im.width/im.height-16/9)+.01<.03
 assert row['humanApproval'] is False and row['independentReviews']==[] and row['actualAuthorInspection']['originalSeen'] and row['actualAuthorInspection']['width360Seen'] and row['actualAuthorInspection']['width680Seen']
 for w in (360,680):
  pv=pathlib.Path(row['path']).with_name(pathlib.Path(row['path']).stem+'.preview-'+str(w)+'.png');assert Image.open(pv).width==w
 selected.append(d)
 checks.append({'goalId':e['goalId'],'asset':binding(row['path']),'actualPNG':True,'actualDimensions':list(im.size),'wholeGoalExact':True,'sourceScienceFirstSealUnchanged':True,'original360680AuthorInspectionRecorded':True,'independentApproval':False})
checkPath=B/'first-seven-actual-png-goal-format-and-original-seal.technical-check.json'
checkPath.write_text(json.dumps({'schemaVersion':1,'checkedAt':now,'images':checks,'scientificFirstSealActualOutputs':len(scienceFreeze['outputs']),'scientificFirstSealActualInputs':len(scienceFreeze['inputs']),'errors':[],'activeWrites':False},ensure_ascii=False,indent=2)+'\n')
entry=B/'neutral-first-seven-actual-PNGs-whole-science23-bound.author-entry.json'
obj={'schemaVersion':1,'role':'neutral inactive image author candidates for independent visualization review','preparedAt':now,'wholeScienceEntry':binding(S/'neutral-whole23-source38-partners44-P23-cases46.author-independent-review.entry.json'),'originalScienceFirstSeal':binding(S/'whole23-science-author.first.freeze.json'),'wholeScienceMaterialCases':binding(S/'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json'),'sourceReadingBindings':binding(S/'input/actual-primary-whole-context-reading.bindings.json'),'currentFrame':{'canonicalNodes':479,'curricularAtomicGoals':394,'strictCompleteBiology':276},'selectedGoalIds':[r['goalId'] for r in images],'images':images,'technicalCheck':binding(checkPath),'generationScope':{'firstSevenOf23':True,'remaining16GenerationPending':True,'first5v1RetainedAfterTwoActualScientificDefects':True,'selected5v2':True},'reviewState':{'status':'ai_candidate','independentV':[],'nativeDP':'pending actual complete resource context','humanApproval':False,'humanTrial':False},'sourceAndCourseScopeApproval':False,'strictGain':0,'activeWrites':False}
entry.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
outputs=[entry,checkPath,pathlib.Path(__file__),B/'register-actual-viewed-candidates.author.py',B/'register-actual-first-seven-tail.author.py']
for d in selected:outputs.extend(p for p in sorted(d.rglob('*')) if p.is_file())
for p in outputs:
 if p.suffix=='.json':json.loads(p.read_text())
inputs=[binding(S/'whole23-science-author.first.freeze.json'),binding(S/'neutral-whole23-source38-partners44-P23-cases46.author-independent-review.entry.json'),binding(S/'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json'),binding(B/'23-goal-derived-original-prompts.author-input.json')]
freeze=B/'first-seven-actual-images-author.first.freeze.json'
assert not freeze.exists(),'Do not overwrite an existing first freeze'
freeze.write_text(json.dumps({'schemaVersion':1,'role':'first frozen actual author seven-image packet; no independent approval','createdAt':now,'entry':binding(entry),'inputs':inputs,'outputs':[binding(p) for p in sorted(set(outputs))],'actualAssets':7,'all23ImagesNotComplete':True,'strictGain':0,'activeWrites':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'entry':binding(entry),'firstFreeze':binding(freeze),'outputs':len(set(outputs)),'actualAssets':7,'actualScienceInputBindingsUnchanged':len(scienceFreeze['inputs']),'actualScienceOutputsUnchanged':len(scienceFreeze['outputs']),'errors':[],'strictGain':0}))
