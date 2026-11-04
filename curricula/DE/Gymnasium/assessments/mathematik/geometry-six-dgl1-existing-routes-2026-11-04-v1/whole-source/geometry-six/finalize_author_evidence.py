from pathlib import Path
import json,hashlib,shutil
H=Path(__file__).resolve().parent;R=H.parents[2]
assert not (H/'review-input-manifest.json').exists()
load=lambda n:json.loads((H/n).read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def put(n,v):(H/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
render=load('author-rendering-check.json');assert render['fieldCount']==20 and render['screenshotCount']==30;assert all(not r['actualBrowserChecks']['pageOverflow'] and r['actualBrowserChecks']['scrollContainers']==0 for r in render['screenshots'])
# Actual tool viewing in this author turn covered all final screenshots: the four revised roof tasks,
# six special-line, six final plane-angle, six parameter-angle, six parabola screenshots, plus
# the unchanged two roof-solution fields from the earlier exact screenshot set.
shots=[{'path':r['screenshot'],'sha256':sha(H/r['screenshot']),'field':r['field'],'width':r['width'],'authorActuallyViewed':True,'judgment':'Readable final formula givens, no page clipping, all rubric cells retained.'}for r in render['screenshots']]
for a,b in zip(shots,render['screenshots']):assert a['sha256']==b['sha256']
sourcepages=sorted((H/'source-pages').glob('*.png'));assert len(sourcepages)==8
put('author-visual-inspection.json',{'status':'AUTHOR_ACTUALLY_VIEWED_FINAL_30_BROWSER_AND_8_COMPLETE_OFFICIAL_PAGE_IMAGES','independentReview':False,'browserScreenshots':shots,'completeSourcePageImages':[{'path':str(p.relative_to(H)),'sha256':sha(p),'authorActuallyViewed':True}for p in sourcepages],'authorCorrectionsBeforeFreeze':['Moved roof coordinates and sun direction into dedicated displays for readable mobile givens.','Split the parameter-plane F display onto two aligned lines; final mobile math has no scrolling containers.','Escaped vertical bars in total-rubric cells; actual |a|=1 text and two cells per row retained.'],'assetBoundary':'All task givens are complete textual coordinates and equations. There are no task/solution image assets or published assets to materialize. Official page images and browser screenshots are private review evidence, not learner illustrations.'})
# Preserve the existing task's separately named durable artifact as well as its whole canonical object.
ex=load('whole-existing-exams-and-preparation.json');g=next(x for x in ex['wholeExistingExams']if x['id']=='8d314e15-69e9-5af1-a10a-be820b2f821d');relative=g['examData']['sourceArtifactPath'];bases=[R/'tmp/approach-review-20261101/statistics-pyramid-existing-route-native-20261104-v1/candidate-data',R/'tmp/approach-review-20261101/cone-complex-four-plus-b2-integration-20261104-v1/check-host',R];src=next(b/relative for b in bases if (b/relative).exists());dst=H/'original/existing-8d3-durable-task-artifact.md';shutil.copyfile(src,dst)
put('existing-8d3-whole-form.current.json',g)
put('existing-8d3-durable-artifact-binding.json',{'status':'BYTE_EXACT_EXISTING_SOURCE_ARTIFACT_RETAINED_IN_ADDITION_TO_WHOLE_CURRENT_CANONICAL_EXECUTION_CONTRACT','originalBinding':{'inputRoot':'.','path':str(src.relative_to(R)),'sha256':sha(src)},'privateCopy':str(dst.relative_to(H)),'wholeCurrentExecutionContract':'existing-8d3-whole-form.current.json','warning':'The whole exact current canonical execution contract is authoritative for the reuse judgment; the separately named durable source artifact is retained as original evidence and is not silently substituted for it.','taskOrScoreEdited':False})
print(json.dumps({'status':'FINAL_AUTHOR_EVIDENCE_READY_FOR_FREEZE','screenshotsActuallyViewed':len(shots),'sourcePagesActuallyViewed':len(sourcepages),'allMobileMathScrollContainers':0}))
