#!/usr/bin/env python3
"""One actual native preparation before the requested bounded builtin edit."""
from pathlib import Path
import datetime,hashlib,json,shutil,subprocess
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[5]
prior=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro21-friendly-comic-primary-raster-author-20261007-v1'
raw_path=prior/'first-seven/first-seven-whole-goal-material-source-original-raster-native-routing.author.raw.json';raw=json.loads(raw_path.read_text())
item=next(x for x in raw['records'] if x['goalId'].startswith('ce19'));gid=item['goalId'];canonical=ROOT/raw['frozenStage02Canonical']['path']
def bind(p):
    d=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
before=bind(canonical);args=['npm','--prefix','app','run','visualization:prepare','--',gid,'--landscape='+raw['frozenStage02Canonical']['path'],'--subject=biologie','--lang=de','--provider=OpenAI / ChatGPT-Codex image generation','--review-status=pilot']
start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=ROOT,capture_output=True,text=True);finish=datetime.datetime.now(datetime.timezone.utc).isoformat()
folder=OUT/'native-prepare-before-edit';folder.mkdir(parents=True,exist_ok=True);(folder/'actual.stdout.txt').write_text(r.stdout);(folder/'actual.stderr.txt').write_text(r.stderr);assert r.returncode==0
for name in ['metadata.json','nano-banana-prompt.de.md']:shutil.copyfile(ROOT/'tmp/goal-visualizations'/gid/name,folder/name)
assert bind(canonical)==before
obj={'role':'image author targeted ce19 leader correction; no independent V','wholeHistoricalSevenRaw':bind(raw_path),'historicalSevenFreeze':bind(prior/'first-seven-original-raster-native-routed.author-v1.final.freeze.json'),'wholeUnchangedStage02Goal':item['wholeStage02CandidateGoal'],'completeUnchangedDEENReferenceCases':item['completeDEENReferenceCases'],'actualFrozenSourceWitnessEffectiveBindings':item['actualFrozenSourceWitnessEffectiveBindings'],'frozenStage02Canonical':before,'unchangedPriorOriginal':item['selectedUnchangedOriginalAsset'],'boundedImageAltTextDe':item['boundedImageAltTextDe'],'receivedTargetedFinding':'Axon leader ends on outer pale myelin at approximately x943/y493 instead of clearly at the inner axon. Move only this leader endpoint onto a visibly exposed unmyelinated axon segment.','nativePrepareBeforeEdit':{'argv':args,'startedAt':start,'finishedAt':finish,'exitCode':r.returncode,'metadata':bind(folder/'metadata.json'),'stdout':bind(folder/'actual.stdout.txt'),'stderr':bind(folder/'actual.stderr.txt')},'sixOtherHistoricalImagesUnmodified':True,'allSourceHoldsPreserved':True,'activeWrites':False,'humanApproval':False,'independentVisualApproval':False,'newStrictCompletion':0}
(OUT/'one-whole-goal-original-targeted-finding-native-prepared.author.raw.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'nativePrepareBeforeEdit':r.returncode,'canonicalUnchanged':True,'goalId':gid}))
