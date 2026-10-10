import json,shutil,sys,hashlib
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
from run import R,P,T,C,ref,atomic,run,tsx
ids=json.loads((R/P/'inputs/eight-ids-and-technical-current-base.json').read_text())['goalIds']
captions=json.loads("[[\"Außenskelett mit innenliegenden Muskeln und Innenskelett mit Muskeln um Knochen, als vereinfachte Beinmodelle.\",\"Die vereinfachten Schnittbilder stellen Lage von Skelett und Muskel gegenüber; sie sind keine vollständige Rekonstruktion einzelner Muskelansätze oder aller Gelenkbewegungen.\"],[\"Heuschrecke springt an Land, erwachsener Gelbrandkäfer paddelt im Wasser und Libelle fliegt mit zwei Flügelpaaren.\",\"Die dargestellten Anpassungen schließen weitere Bewegungsformen nicht aus; ein erwachsener Gelbrandkäfer kann ebenfalls fliegen.\"],[\"Blaue Tracheen führen Sauerstoff direkt zum Insektengewebe; goldene Nährstoffwege bleiben getrennt. Beim Fisch führen Kiemen und Blutkreislauf zum Gewebe.\",\"Vereinfachtes Modell: Insektenluftweg und Nährstofftransport getrennt; beim Fisch Herz→Kiemen→Gewebe→Herz. Einzelne Labeldetails ergänzen die große farblich getrennte Darstellung.\"],[\"Mandibeln kauen am Blatt, ein Schmetterlingsrüssel saugt Nektar und ein weiblicher Stechmückenrüssel sticht in eine vereinfachte Hautschicht.\",\"Die Beispiele zeigen Werkzeug und Nahrungszugang; Bestäubung und Krankheitsübertragung sind keine garantierten Folgen jeder Nahrungsaufnahme.\"],[\"Käfer und Säugetier: Befruchtung innen; Fischbeispiel: Befruchtung außen. Entwicklung erfolgt beim Käfer im abgelegten Ei, beim Fisch im Wasser und beim Säugetier im Mutterkörper.\",\"Die beiden Tabellenzeilen trennen Befruchtungsort und Entwicklungsort; innere Befruchtung bedeutet nicht automatisch Entwicklung bis zur Geburt im Mutterkörper.\"],[\"Schmetterling: Ei, Raupe, Puppe, Falter; Heuschrecke: Ei, Nymphe, Adulttier ohne Puppe; Frosch: Ei, Kaulquappe, Jungfrosch ohne Insektenpuppe.\",\"Die großen Stadien und Pfeile stellen vollständige beziehungsweise unvollständige Insektenmetamorphose und Amphibienentwicklung gegenüber; Häutung ist nicht mit jeder vollständigen Metamorphose gleichzusetzen.\"],[\"Gleich ausgerichtete Seitenansichten: Insektenhirn und ventrale Ganglienkette an der Bauchseite; Wirbeltiergehirn und dorsales Rückenmark an der Rückenseite.\",\"Das Insekten-Nervensystem ist als Grundmodell vereinfacht; Ganglienzahl, Paarigkeit und Verschmelzungen sind keine Behauptung für jede Art. Beide Tiere besitzen ein Gehirn.\"],[\"Duftspur zwischen Ameisen derselben Art, Schall zwischen Grillen derselben Art und schwarzgelbes optisches Warnsignal einer Wespe gegenüber einem Vogel.\",\"Signalquelle und Empfänger sind getrennt; erlernte Warnwirkung ist nicht garantiert und eine optische Wirkung bei fehlender Sicht wird nicht behauptet.\"]]")
provider='OpenAI / ChatGPT-Codex integrated image_gen tool'
land=str(P/'candidate/whole479327-with-eight-raster-links.inactive.json')
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
for gid,(alt,caption) in zip(ids,captions):
 d=P/f'assets/biologie/{gid}'
 run(f'normal-prepare-{gid}',['node','scripts/prepare_goal_visualization.mjs',gid,'--landscape',land,'--subject','biologie','--provider',provider,'--review-status','pilot'],C)
 prep=C/f'tmp/goal-visualizations/{gid}'
 for src,dst in [('nano-banana-prompt.de.md','normal-prepared-prompt-package.de.md'),('metadata.json','normal-prepared-metadata.json')]:shutil.copy2(prep/src,R/d/dst)
 prompt=d/('actual-correction-prompt.txt' if (R/d/'actual-correction-prompt.txt').exists() else 'actual-provider-prompt.txt')
 run(f'normal-import-{gid}',['node','scripts/import_goal_visualization.mjs',gid,str(d/f'{gid}.png'),'--landscape',land,'--subject','biologie','--provider',provider,'--review-status','pilot','--license','CC-BY-4.0','--prompt',str(prompt),'--reconstruction-prompt',str(d/'actual-reconstruction-prompt.txt'),'--alt-text',alt,'--description',caption],C)
 for name in ['prompt.de.md','image-reconstruction-prompt.de.md']:shutil.copy2(C/f'curricula/DE/Gymnasium/visualizations/biologie/{gid}'/name,R/d/name)
 b=(R/d/f'{gid}.png').read_bytes()
 for root in ['curricula/DE/Gymnasium/visualizations/biologie','app/public/assets/goal-visualizations/biologie','backend/src/main/resources/static/assets/goal-visualizations/biologie']:
  assert b==(C/root/gid/f'{gid}.png').read_bytes()
shutil.copy2(C/land,R/land)
after=json.loads((R/land).read_text());before=json.loads((R/P/'inputs/current479327-canonical.exact.json').read_text());bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']}
changed=[gid for gid in bg if bg[gid]!=ag[gid]];assert set(changed)==set(ids)
for gid in ids:assert {**bg[gid],'resourceLinks':ag[gid]['resourceLinks']}==ag[gid]
proof={'schemaVersion':1,'normalPrepareImportCommands':16,'whole479IDsExact':True,'exactOnlyEightResourceLinkDeltaIds':changed,'allEightSourcePublicBackendPNGBytesExact':True,'license':'CC-BY-4.0','reviewStatus':'pilot','noGoodExistingRasterReplaced':True,'newScientificReview':False,'independentVApproval':False,'humanApproval':False,'strictGain':0,'activeWrites':False}
atomic(R/P/'checks/actual-normal-eight-import-resource-only-and-original-copy-proof.json',json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
for label,args in [
('normal-current-P8-materialize',[tsx,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(P/'positive/eight-current-raster.P.author.config.json'),'--candidates',str(P/'positive/eight-current-raster.P.technical-candidates.json'),'--write']),
('normal-current-P8-check',[tsx,'app/scripts/positiveGoalEvidenceReview.ts',f'--config={P}/positive/eight-current-raster.P.author.config.json','--mode=check']),
('normal-current-P8-reproduce',[tsx,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(P/'positive/eight-current-raster.P.author.config.json'),'--candidates',str(P/'positive/eight-current-raster.P.technical-candidates.json')])]:run(label,args,C)
atomic(R/P/'positive/eight-current-raster.P.author.review.jsonl',(C/P/'positive/eight-current-raster.P.author.review.jsonl').read_bytes())
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
print(json.dumps({'normalCurrentP8Ready':True,'allEightScienceBodiesUnchanged':True,'activeWrites':False,'strictGain':0}))

