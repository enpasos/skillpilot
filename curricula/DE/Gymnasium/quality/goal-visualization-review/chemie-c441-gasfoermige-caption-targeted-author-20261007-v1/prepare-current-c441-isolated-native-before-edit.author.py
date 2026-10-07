#!/usr/bin/env python3
"""One bounded caption edit: freeze actual current inputs and prepare in a physical native root."""
from pathlib import Path
import datetime,hashlib,json,shutil,subprocess
from PIL import Image
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[5];gid='c441d9e8-d9d9-5e55-a189-a37345541321'
def bind(p):
    d=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';canon=json.loads(canonical.read_text());goal=next(g for g in canon['goals'] if g['id']==gid)
qa_path=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';qa=json.loads(qa_path.read_text());qr=next(r for r in qa['records'] if r['goalId']==gid)
config_path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-reviewed-integration-preparation-root-v1/positive24.future-active.config.json';config=json.loads(config_path.read_text());profile_path=ROOT/config['reviewPath'];line=next(l for l in profile_path.read_text().splitlines(keepends=True) if json.loads(l)['goalId']==gid);profile=json.loads(line)
assert profile['goalId']==gid and len(profile['profile']['applicationCaseBriefs'])==2
OUT.mkdir(parents=True,exist_ok=True);(OUT/'current-c441-whole-positive-record.exact-original-line.jsonl').write_text(line)
copies=[]
for base in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
    p=ROOT/base/gid/(gid+'.png');target=OUT/'historical-original-copies'/p.relative_to(ROOT);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target);assert target.read_bytes()==p.read_bytes();copies.append({'activeOriginal':bind(p),'ownUnchangedHistoryCopy':bind(target)})
assert len({r['activeOriginal']['sha256'] for r in copies})==1
assert copies[0]['activeOriginal']['sha256']=='78fa3b4d779b7716069d189a3d4aff6bf1d68e3112a65f1424cd076a25032214'
assert qr['assetSha256'].removeprefix('sha256:')==copies[0]['activeOriginal']['sha256']
original=ROOT/copies[0]['activeOriginal']['path']
book_path=ROOT/'app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json';book=json.loads(book_path.read_text());page=next(p for p in book['pages'] if p['goalId']==gid)
iso=OUT/'native-root';(iso/'scripts').mkdir(parents=True,exist_ok=True);helpers=[]
for n in ['prepare_goal_visualization.mjs','import_goal_visualization.mjs','goal_visualization_common.mjs']:
    p=ROOT/'scripts'/n;dst=iso/'scripts'/n;shutil.copyfile(p,dst);assert p.read_bytes()==dst.read_bytes();helpers.append({'productionOriginal':bind(p),'byteIdenticalOwnCopy':bind(dst)})
snapshot=iso/'current-canonical.input.json';shutil.copyfile(canonical,snapshot);assert canonical.read_bytes()==snapshot.read_bytes()
args=['node','scripts/prepare_goal_visualization.mjs',gid,'--landscape=current-canonical.input.json','--subject=chemie','--lang=de','--provider=OpenAI / ChatGPT-Codex image generation','--review-status=pilot']
start=datetime.datetime.now(datetime.timezone.utc).isoformat();result=subprocess.run(args,cwd=iso,capture_output=True,text=True);finish=datetime.datetime.now(datetime.timezone.utc).isoformat();stdout=OUT/'native-prepare.actual.stdout.txt';stderr=OUT/'native-prepare.actual.stderr.txt';stdout.write_text(result.stdout);stderr.write_text(result.stderr);assert result.returncode==0
metadata=iso/'tmp/goal-visualizations'/gid/'metadata.json';assert json.loads(metadata.read_text())['provider']=='OpenAI / ChatGPT-Codex image generation'
external=[canonical,qa_path,config_path,profile_path,book_path,ROOT/'AGENTS.md',ROOT/'LICENSING.md',ROOT/'docs/concept/skill-graph/atomic-goal-visualizations.md',ROOT/'app/src/components/GoalCard.tsx']+[ROOT/r['activeOriginal']['path'] for r in copies]+[ROOT/r['productionOriginal']['path'] for r in helpers]
write(OUT/'current-c441-whole-goal-profile-page-context-original-assets-native-prepared.author.raw.json',{'role':'image author one bounded caption correction; no independent V or D/P science','actualTargetIdentification':{'initiallyMentioned973WasViewedAndIsDifferentCorrectAldehydeImage':True,'actualTargetGoalId':gid,'actualTypoSeen':'Gasuförmige Ionen:','requestedExactCorrection':'Gasförmige Ionen:'},'wholeCurrentCanonicalGoal':goal,'wholeCurrentPositiveRecordExact':profile,'exactOriginalPositiveLine':bind(OUT/'current-c441-whole-positive-record.exact-original-line.jsonl'),'wholeActualCurrentNativePage':page,'actualCurrentBookModel':bind(book_path),'directPrerequisiteWholeCurrentGoals':[next(g for g in canon['goals'] if g['id']==i) for i in goal['requires']],'reversePrerequisiteWholeCurrentGoals':[g for g in canon['goals'] if gid in g.get('requires',[])],'directContainingWholeCurrentGoals':[g for g in canon['goals'] if gid in g.get('contains',[])],'wholeCurrentQARecordExactHistoricalForOldAsset':qr,'threeActiveOriginalCopiesAndExactOwnArchives':copies,'actualOriginalPixelDimensions':list(Image.open(original).size),'nativePhysicalIsolationRoot':str(iso.relative_to(ROOT)),'actualNativeHelpers':helpers,'wholeCanonicalInputExactSnapshot':bind(snapshot),'nativePrepareBeforeGeneration':{'argv':args,'cwd':str(iso),'startedAt':start,'finishedAt':finish,'exitCode':result.returncode,'stdout':bind(stdout),'stderr':bind(stderr),'actualMetadata':bind(metadata)},'externalCurrentInputsGuard':[bind(p) for p in external],'priorWholeScienceReviewsRemainHistory':True,'wholeGoalAndProfileContentNotEdited':True,'activeWrites':False,'independentVisualApproval':False,'humanApproval':False,'newStrictCompletion':0})
print(json.dumps({'actualGoalId':gid,'oldPNGsha256':copies[0]['activeOriginal']['sha256'],'actualOriginalDimensions':list(Image.open(original).size),'nativePrepareBeforeGenerationExit0':result.returncode,'nativeRoot':str(iso),'activeWrites':False}))
