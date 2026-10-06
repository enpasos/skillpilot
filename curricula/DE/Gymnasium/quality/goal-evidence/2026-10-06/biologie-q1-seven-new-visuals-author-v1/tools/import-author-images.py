import json,hashlib,subprocess,shutil,datetime
from pathlib import Path
root=Path('/home/enpasos/projects/skillpilot')
pkg=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-new-visuals-author-v1'
base=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-native-source-preparation-author-v6'
iso=root/'tmp/biologie-q1-seven-new-visuals-author-v1/native-import-root'
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
envelope=json.loads((base/'canonical-390.component-first.author-candidate.inert-envelope.json').read_text())
(iso/canon).write_text(envelope['candidateCanonicalUTF8'])
selections=[
('ac9e824f-003c-50ac-8751-2b8456004c63',1,'Ein schematisches Chromosom wird zur DNA-Doppelhelix entfaltet; ein hervorgehobener DNA-Abschnitt ist als Gen markiert. Größen und Abschnittslänge sind vereinfacht.'),
('bfb5dfb6-8e35-5452-b581-96e061d8b826',1,'Zwei Modellvergleiche: Links ändert sich an einer Basenpaarposition G-C zu A-T. Rechts erhöht sich in einem vereinfachten Vier-Chromosomen-Modell die Anzahl eines Chromosomentyps von zwei auf drei; die beiden anderen bleiben erhalten.'),
('5eb7c923-469d-5934-b1e8-292e1bb40d95',1,'Drei vereinfachte Mutationsmodelle zeigen eine Änderung im Gen, den Verlust eines Chromosomenabschnitts und eine Änderung der Chromosomenzahl. Die markierten DNA-Paare sind symbolisch und nennen keine konkreten Basen.'),
('3a0d6c82-f9f0-5ad1-bb0b-b948e4450d04',2,'Eine comicartige Schulszene vergleicht UV-Exposition mit Hut, bedeckender Kleidung und Schatten als Schutzmöglichkeiten. Ein vergrößertes DNA-Modell zeigt eine symbolische Verbindung benachbarter Basen desselben Strangs bei erhaltenem Rückgrat. Schutz verringert das Risiko und schließt es nicht vollständig aus.'),
('9d830422-acc7-5fa8-aee9-4dae4cedbf49',3,'Eine frühe Embryonalzelle führt zu getrennten Körperzell- und Keimbahnlinien. Eine späte Körperzellmutation bleibt in ihrer Nachkommenlinie. Eine markierte Keimzelle kann die Mutation an Nachkommen weitergeben, wenn sie an der Befruchtung beteiligt ist; der Pfeil ist deshalb gestrichelt und als möglich bezeichnet. Sterne sind Mutationensymbole, keine Merkmalsprognosen.'),
('d0c3e6a7-581b-57bd-8027-e940c6b77af8',1,'Pflanzenmodelle vergleichen unterschiedliche Lichtbedingungen bei gleichem Genotyp mit einem veränderten Genotyp unter gleichen Lichtbedingungen. Gleichheits- und Ungleichheitszeichen markieren die DNA-Vergleiche. Ein Fragezeichen erinnert daran, dass ein Merkmal allein Mutation und Modifikation nicht unterscheidet.'),
('aab2a358-b2ee-57a5-a957-8fb9845506b1',2,'Ein Kopiermodell zeigt eine A-C-Fehlpaarung in der Mitte. Der Reparaturweg links stellt A-T her. Eine spätere Kopie rechts kann G-C und damit eine bleibende Änderung erzeugen. Alle drei Ausschnitte enthalten dieselben sechs Paarpositionen; der mögliche Kopierweg ist gestrichelt und kein vollständig garantierter Reparaturprozess.')]
receipts=[];rows=[]
for id,v,alt in selections:
 image=pkg/'images'/id/f'generation-v{v}.png'
 prompt=pkg/'prompts'/(f'{id}.prompt.txt' if v==1 else f'{id}.targeted-revision-v{v}.prompt.txt')
 for operation in ['prepare','import']:
  argv=['node',str(iso/'scripts'/f'{operation}_goal_visualization.mjs'),id]
  if operation=='import':argv.append(str(image))
  argv+=['--landscape',str(iso/canon),'--subject','biologie','--provider','ChatGPT/Codex image_gen built-in','--review-status','ai_candidate']
  if operation=='import':argv+=['--prompt',str(prompt),'--license','CC-BY-4.0','--alt-text',alt]
  result=subprocess.run(argv,cwd=root,text=True,capture_output=True)
  receipts.append({'operation':operation,'goalId':id,'argv':argv,'exitCode':result.returncode,'stdoutActual':result.stdout,'stderrActual':result.stderr})
  assert result.returncode==0,result.stderr
 assets=[]
 for rel in [f'curricula/DE/Gymnasium/visualizations/biologie/{id}',f'app/public/assets/goal-visualizations/biologie/{id}',f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{id}']:
  folder=iso/rel
  assert (folder/f'{id}.png').read_bytes()==image.read_bytes()
  for f in sorted(folder.glob('*')):
   if f.is_file():
    dest=pkg/'native-helper-output'/rel/f.name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,dest)
    assets.append({'path':str(dest.relative_to(root)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'bytes':dest.stat().st_size})
 rows.append({'goalId':id,'selectedAttempt':v,'selectedImagePath':str(image.relative_to(root)),'assetSha256':hashlib.sha256(image.read_bytes()).hexdigest(),'actualPromptPath':str(prompt.relative_to(root)),'actualPromptSha256':hashlib.sha256(prompt.read_bytes()).hexdigest(),'altText':alt,'nativeHelperOutputs':assets,'authorDecision':'KEEP_CANDIDATE_PENDING_INDEPENDENT_V','machineVisualApproval':False,'humanApproval':False})
candidate=(iso/canon).read_text()
(pkg/'canonical-390-with-seven-images.author-candidate.inert-envelope.json').write_text(json.dumps({'schemaVersion':1,'role':'isolated helper-generated seven-image candidate on component-first author v6; not active integration or independent approval','candidateCanonicalUTF8':candidate,'baseAuthorEnvelopePath':str((base/'canonical-390.component-first.author-candidate.inert-envelope.json').relative_to(root)),'baseAuthorEnvelopeSha256':hashlib.sha256((base/'canonical-390.component-first.author-candidate.inert-envelope.json').read_bytes()).hexdigest(),'existing464NonRootGoalFieldsUnchanged':True,'newImageLinks':7,'activeWrites':False,'strictGain':0,'machineVisualApproval':False,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
(pkg/'actual-native-prepare-and-import.receipt.json').write_text(json.dumps({'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'isolateRoot':str(iso),'actualCommands':receipts,'activeWrites':False,'assetImportIsApproval':False},ensure_ascii=False,indent=2)+'\n')
(pkg/'seven-selected-images-and-alt-text.author-candidate.json').write_text(json.dumps({'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provider':'ChatGPT/Codex image_gen built-in','modelVersion':'not exposed by tool; not inferred','license':'CC-BY-4.0 for authored own didactic candidates','decisions':rows,'generatedAttempts':11,'existingGoodImagesReplaced':False,'machineVisualApproval':False,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'actualPrepareImportCommands':len(receipts),'allExitZero':all(x['exitCode']==0 for x in receipts),'selectedNewRasterCandidates':len(rows),'activeWrites':False}))
