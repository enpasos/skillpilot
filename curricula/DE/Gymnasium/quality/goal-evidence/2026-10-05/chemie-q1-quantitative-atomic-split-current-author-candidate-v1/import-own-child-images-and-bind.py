#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime,hashlib,json,shutil,subprocess
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;REL=O.relative_to(R);I=R/'tmp/chemie-q1-quantitative-atomic-split-native-isolated-20261005-v1'
rows=[('3d6699ae-ebbd-5a55-8798-b809a9d74f0a','ascorbic-candidate-2.png','ascorbic-correction-2-exact-builtin.prompt.txt','Comicartige Orientierung zur kontrollierten Ascorbinsäurebestimmung: Probe, Blindwert und bekannter Standard, beispielhafte Iodtitration mit molarem Verhältnis Ascorbinsäure:I₂1:1, Indikatorendpunkt sowie Blindwertkorrektur, Verdünnung und Prüfung weiterer reduzierender Stoffe. Die Zeichnung belegt keine tatsächliche Versuchsdurchführung.'),('18819a59-2442-530f-a7c3-26755398ec66','paraben-candidate-1.png','paraben-exact-builtin-generation.prompt.txt','Comicartige Orientierung zur quantitativen Bestimmung eines vorgegebenen Paraben-Esters, hier Methylparaben: Probe, Blindprobe und Standards; HPLC als Beispielmethode mit zeitabhängigem Chromatogramm und getrennter Kalibrierung der Peakfläche über der Konzentration im Arbeitsbereich. Verdünnung und Selektivität sind zu prüfen; die Skizze ist kein eigener Messnachweis.')]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for p in O.rglob('*'):
 if p.is_file():t=I/REL/p.relative_to(O);t.parent.mkdir(parents=True,exist_ok=True);assert not t.is_symlink();shutil.copy2(p,t)
receipt=[]
for gid,image,prompt,alt in rows:
 args=['node','scripts/import_goal_visualization.mjs',gid,str(O/'image-candidates'/image),'--landscape','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','--subject','chemie','--provider','OpenAI ChatGPT/Codex image_gen','--review-status','pending-independent-actual-review','--alt-text',alt,'--prompt',str(O/prompt)];p=subprocess.run(args,cwd=I,capture_output=True,text=True);(O/(gid[:8]+'-native-image-import.stdout.txt')).write_text(p.stdout);(O/(gid[:8]+'-native-image-import.stderr.txt')).write_text(p.stderr);assert p.returncode==0,p.stderr
 copies=[]
 for top in ['curricula/DE/Gymnasium/visualizations/chemie','app/public/assets/goal-visualizations/chemie','backend/src/main/resources/static/assets/goal-visualizations/chemie']:
  f=I/top/gid/(gid+'.png');assert not f.is_symlink();assert sha(f)==sha(O/'image-candidates'/image);copies.append({'path':str(f.relative_to(I)),'sha256':sha(f)})
 receipt.append({'goalId':gid,'inputPNG':str((O/'image-candidates'/image).relative_to(R)),'inputSHA256':sha(O/'image-candidates'/image),'authorAltText':alt,'nativeImportArgs':args,'exitCode':p.returncode,'actualThreeCopies':copies,'independentVApproval':False})
(O/'two-native-child-image-imports.actual.receipt.json').write_text(json.dumps({'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':receipt,'actualGenerationDoesNotGrantApproval':True,'oldWorkflowImageRetainedForAggregateSHA256':'47a02abeb096fa7d40ce0bc00409e593902740428b95d7bbbaff19d64b3f04f3','activeWrites':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n');print('Two physical native imports PASS; independent V pending')
