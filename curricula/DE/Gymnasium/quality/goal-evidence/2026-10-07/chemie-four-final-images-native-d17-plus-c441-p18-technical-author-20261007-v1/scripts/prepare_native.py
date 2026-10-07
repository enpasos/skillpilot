"""Prepare an isolated repository for unchanged native D/P/import tools."""
from pathlib import Path
import json, shutil, re, hashlib
from datetime import datetime, timezone

ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=Path(__file__).resolve().parent.parent
NATIVE=BASE/'native-root'
V2=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-targeted-description-routing-context-author-v2-20261007'
V3=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next17-p580b-control-material-author-v3-20261007'
ASSETS=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-four-evidenced-friendly-comic-author-20261007-v1'
C441=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-c441-gasfoermige-caption-targeted-author-20261007-v1'
def read(p):return json.loads(p.read_text())
def write(p,obj):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def pin(p):
 d=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}
if NATIVE.exists():raise SystemExit('Fresh technical package only; do not rebuild an existing native-root.')
NATIVE.mkdir(parents=True)
(BASE/'receipts').mkdir()
copied=set()
def copy_module(p):
 if p in copied:return
 copied.add(p); dest=NATIVE/p.relative_to(ROOT);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
 if p.suffix not in ('.ts','.tsx','.mjs','.js'):return
 for rel in re.findall(r'''(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+)['"]''',p.read_text()):
  q=(p.parent/rel).resolve()
  options=[q,q.with_suffix('.ts'),q.with_suffix('.tsx'),q.with_suffix('.mjs'),q.with_suffix('.js'),q/'index.ts']
  resolved=next((x for x in options if x.is_file()),None)
  if not resolved:raise RuntimeError(f'Cannot resolve native dependency {p}: {rel}')
  copy_module(resolved)
for rel in ['app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/buildGoalBookModel.ts','scripts/import_goal_visualization.mjs','scripts/prepare_goal_visualization.mjs']:
 copy_module(ROOT/rel)
for rel in ['contracts/goal-book','contracts/goal-evidence','contracts/goal-description-review','contracts/curriculum-package']:
 for p in (ROOT/rel).rglob('*'):
  if p.is_file():dest=NATIVE/p.relative_to(ROOT);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest);copied.add(p)
for rel in ['LICENSING.md','LICENSE','LICENSES/CC-BY-4.0.txt','app/package.json','app/package-lock.json']:
 p=ROOT/rel
 if p.exists():dest=NATIVE/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest);copied.add(p)
(NATIVE/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
for src,dest in [(V2/'candidate/canonical.whole-current-plus-targeted-corrections.json','candidate/canonical.final-image-candidate.json'),(V2/'candidate/full378-context.view.json','candidate/full378.v2-context.view.json'),(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json','candidate/full378.c441-retained-context.view.json'),(V2/'candidate/semantic-kinds.candidate.json','inputs/semantic-kinds.v2.exact.json'),(ASSETS/'inputs/current-chemie.qa.snapshot.json','inputs/current-chemie.qa.exact.json')]:
 d=NATIVE/dest;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,d)
routes=read(ASSETS/'selected-four-assets-and-prospective-routing.author.json')['selectedAssets']
selected_ids={x['goalId'] for x in routes}
qa=read(NATIVE/'inputs/current-chemie.qa.exact.json')
assetpins=[]
for record in qa['records']:
 if record['visualizationState']!='available':continue
 p=ROOT/record['publicAssetPath'];assetpins.append(pin(p));dest=NATIVE/record['publicAssetPath'];dest.parent.mkdir(parents=True,exist_ok=True)
 # Real copies are used for every rendered retained page. Other existing assets
 # are read-only symlinks for native full-context QA hashing, never rendered.
 retained_ids=set(read(V2/'configs/native-d-seventeen.batch.config.json')['goalIds'])-selected_ids
 if record['goalId'] in retained_ids:shutil.copy2(p,dest)
 else:dest.symlink_to(p)
spec=read(V3/'candidate/positive17.corrected-author-candidate-set.json')
old=read(C441/'current-c441-whole-positive-record.exact-original-line.jsonl')
spec['reviewId']=BASE.name;spec['reviewedAt']=datetime.now(timezone.utc).isoformat();spec['reviewer']='AUTHOR technical native binding only; no new independent D/P science judgment'
spec['goals'].append({'goalId':old['goalId'],'reason':'Exact supplied c441 positive profile reused for fresh raster binding only; existing record remains history. No learner/human/independent approval.','evidenceLevel':'E1','maximumClaimScope':'G1','dissent':[],'profile':old['profile']})
write(NATIVE/'candidate/positive18.author-candidate-set.json',spec)
shutil.copy2(V3/'candidate/complete34-bilingual-material-cases.author-v3.json',NATIVE/'candidate/complete34-bilingual-material-cases.v3.exact.json')
shutil.copy2(ASSETS/'candidate-four-whole-goals-profiles-material-context-and-assets.author.json',NATIVE/'candidate/whole-four-author-science-and-material.exact.json')
write(BASE/'receipts/unchanged-native-tool-inputs-and-assets.json',{'role':'Technical isolation and byte reuse; no checker exceptions','nativeCopiedModulesAndContracts':[pin(p) for p in sorted(copied)],'existingAssetsReadOnlyAndExact':assetpins,'nodeModulesSymlink':str(ROOT/'app/node_modules'),'newAssetAuthorFreeze':pin(ASSETS/'final-own-files-and-reused-inputs.freeze.json'),'v2AuthorFreeze':pin(V2/'final-own-files.freeze.json'),'v3AuthorFreeze':pin(V3/'final-own-files-and-reused-inputs.freeze.json'),'oldC441WholePInput':pin(C441/'current-c441-whole-positive-record.exact-original-line.jsonl'),'c441RetainedDView':pin(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json'),'activeWrites':False})
alt={
 '0bf26276':'Comic mit einer pH-Skala von0 bis14: Der Pfeil einer Zitrone mit Beispielwert pH2 endet bei2, Wasser bei7, Seifenlösung mit Beispielwert pH10 bei10. Zahn, Fisch und Handschuhe veranschaulichen Alltags-, biologische und technische Folgen von pH-Änderungen.',
 'a44af1fa':'Ausgewählte Ionennachweise: Flammenproben zeigen Na+ gelb, K+ violett und Cu2+ blaugrün. Ein Chlorid-Beispiel zeigt nach HNO3 und AgNO3 weißen AgCl-Niederschlag. Für das gezeigte Reinsalz führen Na+ und Cl− im Verhältnis1:1 zu NaCl; bei einem Gemisch folgt aus nachgewiesenen Ionen keine eindeutige Zuordnung von Salzpaaren.',
 '9751b6d8':'Reversible Protonenübertragung zwischen NH3 und NH4+ in Wasser. H3O+-Zugabe begünstigt NH4+, OH−-Zugabe NH3. Reaktionsgleichungen zeigen den jeweiligen Protonenübergang und die Wasserbildung. Die Teilchenbilder zeigen nur ausgewählte Stickstoffteilchen, keine vollständige Lösung oder gemessene Gleichgewichtsanteile.',
 'c441d9e8':'Schematischer thermodynamischer Energieverlauf für NaCl aus Na(s) und einem halben Cl2(g): Die Vorbereitung zu gasförmigen Na+- und Cl−-Ionen benötigt netto Energie. Beide Ionen haben Edelgaskonfiguration. Die Gitterbildung setzt mehr Energie frei; das feste NaCl-Gitter liegt energetisch tiefer als die Elemente, insgesamt ΔH<0. Kein kinetischer Aktivierungsenergieverlauf.'}
imports=[]
for row in routes:
 gid=row['goalId'];prefix=gid[:8];attempt=row['selectedAttempt']
 promptpaths=[ASSETS/'prompts'/f'{prefix}.actual-imagegen.prompt.txt']+[ASSETS/'prompts'/f'{prefix}.attempt-{n}.actual-imagegen.prompt.txt' for n in range(2,attempt+1)]
 combined='\n\n'.join(f'ACTUAL CALL {n+1}\n'+p.read_text() for n,p in enumerate(promptpaths))
 prompt=NATIVE/'inputs'/f'{gid}.actual-generation-sequence.txt';prompt.write_text(combined)
 imports.append({'goalId':gid,'image':str(ROOT/row['asset']['path']),'prompt':str(prompt),'altTextDe':alt[prefix],'selectedSha256':row['asset']['sha256'],'actualPromptInputs':[pin(p) for p in promptpaths]})
write(BASE/'native-import-plan.author.json',{'role':'Inert native import plan only','nativeRoot':str(NATIVE.relative_to(ROOT)),'landscape':'candidate/canonical.final-image-candidate.json','imports':imports,'activeWrites':False})
print(json.dumps({'nativeToolCopies':len(copied),'existingAssetPins':len(assetpins),'PCount':len(spec['goals']),'root':str(NATIVE.relative_to(ROOT))}))
