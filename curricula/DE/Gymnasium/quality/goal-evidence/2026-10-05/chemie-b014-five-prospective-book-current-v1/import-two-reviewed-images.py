from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil, subprocess
ROOT=Path.cwd().resolve(); REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1'); OWN=ROOT/REL; ISO=ROOT/'tmp/chemie-b014-five-native-isolated-20261005-v1'
def read(p): return json.loads(Path(p).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
v16rel=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-redox-mobile-independent-v-qa-20261005-v1/independent-v-review.candidate.json');v16=read(ROOT/v16rel)
v026rel=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-titration-b010-ion-lattice-independent-v-qa-20261005-v1/independent-two-image-v-qa.receipt.json');v026all=read(ROOT/v026rel);v026=next(x for x in v026all['records'] if x['goalId'].startswith('02634'))
assert v16['decision']==v026['decision']=='PASS'
rows=[{'id':v16['goalId'],'asset':v16['inspectedActualImages'][0]['path'],'sha':'sha256:'+v16['assetSha256'].removeprefix('sha256:'),'alt':v16['altText'],'prompt':'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-redox-series-mobile-correction-candidate-20261005-v2/16da6a4d-mobile.prompt.md','qa':str(v16rel),'de':v16['currentDescriptionDe'],'en':v16['currentDescriptionEn']}, {'id':v026['goalId'],'asset':v026['assetPath'],'sha':'sha256:'+v026['assetSha256'].removeprefix('sha256:'),'alt':v026['metadataIntegrationRequirement']['reviewedAltText']['de'],'prompt':v026['provenance']['promptPath'],'qa':str(v026rel),'de':v026['boundGoalDescription'],'en':v026['boundGoalDescriptionEn']}]
canonicalRel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical=read(ISO/canonicalRel);terminal=[]
for row in rows:
 goal=next(g for g in canonical['goals'] if g['id']==row['id'])
 assert goal['description']==row['de'] and goal['descriptionEn']==row['en']
 assert 'sha256:'+sha(ROOT/row['asset'])==row['sha']
 # Keep all previous image bytes/history. New PNG targets are detached before native mutation.
 for p in [f'curricula/DE/Gymnasium/visualizations/chemie/{row["id"]}/{row["id"]}.png',f'app/public/assets/goal-visualizations/chemie/{row["id"]}/{row["id"]}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{row["id"]}/{row["id"]}.png',f'curricula/DE/Gymnasium/visualizations/chemie/{row["id"]}/prompt.de.md']:
  target=ISO/p
  if target.is_symlink():target.unlink();shutil.copy2(ROOT/p,target)
 args=['node','scripts/import_goal_visualization.mjs','--goal',row['id'],'--image',str(ROOT/row['asset']),'--landscape',canonicalRel,'--subject','chemie','--lang','de','--provider','OpenAI / ChatGPT-Codex image generation','--review-status','pilot','--license','CC-BY-4.0','--description','Gezielt korrigierter, unabhängig fachlich und visuell geprüfter Comic-PNG-Kandidat; qualitative Orientierung, keine praktische Leistung und keine menschliche Freigabe.','--alt-text',row['alt'],'--prompt',str(ROOT/row['prompt'])]
 started=datetime.now(timezone.utc).isoformat();run=subprocess.run(args,cwd=ISO,text=True,capture_output=True);ended=datetime.now(timezone.utc).isoformat()
 (OWN/f'{row["id"][:8]}-native-image-import.stdout.txt').write_text(run.stdout);(OWN/f'{row["id"][:8]}-native-image-import.stderr.txt').write_text(run.stderr)
 terminal.append({'goalId':row['id'],'cwd':str(ISO),'args':args,'startedAtUTC':started,'endedAtUTC':ended,'actualExitCode':run.returncode,'stdoutSha256':sha(OWN/f'{row["id"][:8]}-native-image-import.stdout.txt'),'stderrSha256':sha(OWN/f'{row["id"][:8]}-native-image-import.stderr.txt'),'independentVisualReceiptPath':row['qa'],'exactExpectedPNGHash':row['sha']})
 assert run.returncode==0,run.stderr
 for p in [f'curricula/DE/Gymnasium/visualizations/chemie/{row["id"]}/{row["id"]}.png',f'app/public/assets/goal-visualizations/chemie/{row["id"]}/{row["id"]}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{row["id"]}/{row["id"]}.png']:
  assert 'sha256:'+sha(ISO/p)==row['sha']
write(OWN/'two-native-image-imports.actual.receipt.json',{'status':'PASS_isolated_native_import_of_independently_reviewed_exact_pixels','commands':terminal,'allThreeCopiesEachMatchIndependentPixelHash':True,'originalPromptPathsPreserved':True,'providerModelNotInferred':True,'humanApproval':False,'activeWrites':0})
print(json.dumps({'nativeImports':len(terminal),'actualExitCodes':[t['actualExitCode'] for t in terminal],'activeWrites':0}))
