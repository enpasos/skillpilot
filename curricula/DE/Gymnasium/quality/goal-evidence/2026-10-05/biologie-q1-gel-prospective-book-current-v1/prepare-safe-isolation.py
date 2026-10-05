from pathlib import Path
from datetime import datetime,timezone
import os,json,hashlib,shutil
ROOT=Path.cwd().resolve(); OWN=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-gel-prospective-book-current-v1';ISO=ROOT/'tmp/biologie-q1-gel-native-isolated-20261005-v1'
assert not ISO.exists(),'Reuse requires deliberate inspection, not destructive reset'
ISO.mkdir(parents=True)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def jsonwrite(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
code=[];replicated=[];dirs=[]
for rel in ['app/scripts','scripts']:
 shutil.copytree(ROOT/rel,ISO/rel,symlinks=False)
 for p in sorted((ROOT/rel).rglob('*')):
  if p.is_file():
   q=ISO/p.relative_to(ROOT);assert sha(p)==sha(q)
   code.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size,'isolatedCopyByteIdentical':True})
for rel in ['app/src','app/node_modules','docs','contracts']:
 q=ISO/rel;q.parent.mkdir(parents=True,exist_ok=True);q.symlink_to(ROOT/rel,target_is_directory=True);dirs.append({'path':rel,'realTarget':str(ROOT/rel),'use':'read_only'})
for rel in ['curricula','app/public','backend/src/main/resources/static']:
 for base,children,files in os.walk(ROOT/rel,followlinks=False):
  base=Path(base); relative=base.relative_to(ROOT); target=ISO/relative;target.mkdir(parents=True,exist_ok=True)
  for name in files:
   src=base/name;dst=target/name
   if dst.exists() or dst.is_symlink():continue
   dst.symlink_to(src);replicated.append(str(src.relative_to(ROOT)))
for rel in ['app/package.json','app/tsconfig.json','app/tsconfig.node.json','package.json','AGENTS.md','LICENSING.md','LICENSE']:
 p=ROOT/rel
 if p.exists():q=ISO/rel;q.parent.mkdir(parents=True,exist_ok=True);q.symlink_to(p)
# Mutable native inputs become detached files before their first write.
mutable=['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json','curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json']
for rel in mutable:
 p=ISO/rel;assert p.is_symlink();p.unlink();shutil.copy2(ROOT/rel,p);assert not p.is_symlink()
now=datetime.now(timezone.utc).isoformat()
receipt={'createdAtUTC':now,'isolationRoot':str(ISO),'nativeAppScriptsAndRootScriptsCopiedUnmodified':code,'codeFileCount':len([x for x in code if Path(x['path']).suffix in ['.ts','.mts','.cts','.mjs','.cjs','.js']]),'readOnlyDirectorySymlinks':dirs,'replicatedLeafFileSymlinkCount':len(replicated),'replicatedRoots':['curricula','app/public','backend/src/main/resources/static'],'mutableInputsDetachedBeforeWrite':[{'path':rel,'baselineSHA256':sha(ROOT/rel),'detachedSHA256':sha(ISO/rel),'isSymlink':False} for rel in mutable],'activeWrites':0,'copyPolicy':'Never write through a symlink: detach prospective changed inputs and any output path before writes. Missing/new output directories are local real directories.'}
jsonwrite(OWN/'isolation-and-native-code-baseline.receipt.json',receipt)
# Relative configurations are deliberately the exact future-active paths.
own=str(OWN.relative_to(ROOT));book=json.loads((ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.json').read_text());book['outputPath']=own+'/prospective-full-base.book-model.json';jsonwrite(OWN/'book.config.json',book)
batch={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'biologie-q1-gel-prospective-current-20261005-v1','subject':'biologie','subjectLabel':'Biologie','bookId':'de-gym-biologie-q1-gel-prospective-current-20261005-v1','title':'Biologie Q1 – Gelelektrophorese, endgültiger aktueller Einzelzielstand','baseGoalBookConfigPath':own+'/book.config.json','goalIds':['8eb86a82-122d-5cae-8f80-bb2850b29c2f'],'outputDirectory':own+'/native-finalbook','feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md','printDerivativeProfile':'bounded-atlas'}
jsonwrite(OWN/'batch.config.json',batch)
for name in ['book.config.json','batch.config.json']:
 p=ISO/own/name
 if p.is_symlink():p.unlink()
 p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(OWN/name,p)
canonrel=mutable[0];canonical=json.loads((ISO/canonrel).read_text());before=json.loads((ROOT/canonrel).read_text());candidates=json.loads((ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1/six-finalized-description.candidates.json').read_text());goal=next(g for g in candidates['goals'] if g['goalId'].startswith('8eb'))['finalizedCandidateGoal'];row=next(g for g in canonical['goals'] if g['id']==goal['id'])
# Preserve any current fields not covered by the agreed one-goal description/prerequisite correction.
for field in ['title','titleEn','description','descriptionEn','requires']:row[field]=goal[field]
assert len(canonical['goals'])==len(before['goals'])==441
assert set(g['id'] for g in canonical['goals'])==set(g['id'] for g in before['goals'])
changed=[g['id'] for a,g in zip(before['goals'],canonical['goals']) if a!=g];assert changed==[goal['id']],changed
jsonwrite(ISO/canonrel,canonical)
qa=json.loads((ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-four-new-independent-v-qa-20261005-v1/independent-v-qa.receipt.json').read_text());visual=next(g for g in qa['goals'] if g['goalId']==goal['id']);image=ROOT/visual['candidateImagePath'];assert 'sha256:'+sha(image)==visual['assetSha256']
request=json.loads((ROOT/visual['provenance']['exactRequestPath']).read_text());(OWN/'original-imagegen.prompt.txt').write_text(request['prompt'])
importargs=['node','scripts/import_goal_visualization.mjs','--goal',goal['id'],'--image',str(image),'--landscape',canonrel,'--subject','biologie','--lang','de','--provider',visual['provenance']['provider'],'--review-status','accepted','--license','CC-BY-4.0','--description','Qualitatives comicartiges Schema einer DNA-Gelelektrophorese mit Größenmarker und zwei Proben; Trennprinzip und Vergleich vorgegebener Banden, ohne Durchführung oder exakte Fragmentlängen zu behaupten.','--alt-text',visual['altTextRecommendationDe'],'--prompt',str(OWN/'original-imagegen.prompt.txt')]
# Import target files do not exist in active roots; if they did, detach first.
for rel in [f'curricula/DE/Gymnasium/visualizations/biologie/{goal["id"]}/{goal["id"]}.png',f'app/public/assets/goal-visualizations/biologie/{goal["id"]}/{goal["id"]}.png',f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{goal["id"]}/{goal["id"]}.png',f'curricula/DE/Gymnasium/visualizations/biologie/{goal["id"]}/{goal["id"]}.prompt.de.md']:
 p=ISO/rel
 if p.is_symlink():p.unlink();shutil.copy2(ROOT/rel,p)
jsonwrite(OWN/'native-import-plan.json',{'cwd':str(ISO),'args':importargs,'exactExpectedPNGHash':visual['assetSha256'],'sourceIndependentQAReceiptPath':'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-four-new-independent-v-qa-20261005-v1/independent-v-qa.receipt.json','onlyGoalIdChanged':goal['id'],'activeWrites':0})
print(json.dumps({'isolationReady':str(ISO),'copiedNativeFiles':len(code),'replicatedLeafSymlinks':len(replicated),'detachedNativeInputs':len(mutable),'goalDelta':changed,'activeWrites':0}))
