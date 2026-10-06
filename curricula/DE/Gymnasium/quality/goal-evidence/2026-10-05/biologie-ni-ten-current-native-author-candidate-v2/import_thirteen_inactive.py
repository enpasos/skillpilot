# SPDX-License-Identifier: Apache-2.0
"""Native raster import confined to a small, physical, inactive root."""
from pathlib import Path
import json,subprocess,shutil,hashlib
root=Path.cwd(); here=Path(__file__).resolve().parent
meta=json.loads((here/'prospective-paths.json').read_text()); canon=root/meta['canonicalPath']
data=json.loads((here/'images/actual-initial-and-correction-tool-request-data.json').read_text())
import_root=here/'visual-import-root';(import_root/'scripts').mkdir(parents=True,exist_ok=True)
for name in ('prepare_goal_visualization.mjs','import_goal_visualization.mjs','goal_visualization_common.mjs'):
 shutil.copy2(root/'scripts'/name,import_root/'scripts'/name)
assert not (import_root/'curricula').is_symlink()
alts=[
 'Zwei Körbe zeigen das vorgegebene Sortiermerkmal: links Blätter mit glattem Rand, rechts Blätter mit gezähntem Rand; ein weiteres Blatt liegt noch außerhalb.',
 'Ein einzelner Fisch steht der Gruppe von Fischen derselben Art in einem gemeinsamen Teich gegenüber: Organismus und Population.',
 'Vereinfachtes Pflanzenmodell: sexuelle Fortpflanzung kombiniert vorhandene Merkmale zweier Eltern und kann unterschiedliche Nachkommen ergeben; Kopien behalten im dargestellten Beispiel dieselben Merkmale.',
 'Vier getrennte Bildfelder zeigen ausgewählte Erkennungsmerkmale von Rotbuche, Stieleiche, Hängebirke und Bergahorn: Blätter sowie Knospe, Rinde oder Früchte.',
 'Bei einem erblichen Merkmal werden aus unterschiedlich großen Blütenpflanzen bestimmte Eltern ausgewählt; ihre Nachkommen sind erneut unterschiedlich groß.',
 'Links verbessert eine Person ihre Leistung durch Training; rechts ändern sich über Generationen die Häufigkeiten vererbbarer heller und dunkler Käfermerkmale.',
 'Ähnliche Merkmale von Familienmitgliedern geben im dargestellten Beispiel einen begrenzten Hinweis auf Verwandtschaft; ein Fragezeichen zeigt die Grenze des Schlusses.',
 'Ein Stammbaum verbindet Hund und Wolf mit einem unbekannten gemeinsamen Vorfahren und zeigt zwei getrennte heutige Zweige.',
 'Fünf traditionelle Wirbeltiergruppen sind durch Fisch, Frosch, Eidechse, Vogel und Kaninchen dargestellt; eine symbolische Wirbelsäule verweist auf ihr gemeinsames Merkmal.',
 'Geschachtelte Gruppen ordnen Hauskatze und Tiger über gemeinsame Merkmale hierarchisch ein; ein Hund liegt innerhalb der Säugetiere außerhalb der dargestellten Katzenartigen.',
 'Vereinfachte Fortpflanzungsbeispiele vergleichen Enten mit fruchtbaren Nachkommen und Pferd sowie Esel mit meist unfruchtbarem Maultiernachkommen.',
 'Vereinfachtes Modell ohne molekulare Details: Mutation kann Erbinformation verändern; Rekombination kombiniert vorhandene Varianten neu. Ein Fragezeichen begrenzt die dargestellte Merkmalsfolge.',
 'Helle und dunkle Käfer zeigen das begrenzte Evolutionsmodell: Mutation und Rekombination tragen zu Variation bei; unterschiedliche Fortpflanzung kann die Häufigkeiten vererbbarer Varianten über Generationen ändern.'
]
receipts=[]
for job,alt in zip(data['jobs'],alts,strict=True):
 gid=job['id']; version=2 if gid in {'08fa0412-7bcb-53b5-8660-5c4effa680ff','87ce1746-9904-56ad-9705-ffabbd918c5b'} else 1
 image=here/'images'/f'{gid}.candidate-v{version}.png'; prompt=here/'images'/f'{gid}.actual-initial-tool-request.txt'
 prompt.write_text(job['prompt']+'\n')
 selected_prompt=prompt
 if version==2:
  correction=next(c for c in data['corrections'] if c['id']==gid)
  selected_prompt=here/'images'/f'{gid}.actual-correction-v2-tool-request.txt';selected_prompt.write_text(correction['prompt']+'\n')
 reconstruction=here/'images'/f'{gid}.standalone-reconstruction-author.txt'
 reconstruction.write_text(job['prompt']+('\n\nRequired corrected details:\n'+correction['prompt'] if version==2 else '')+'\n')
 common=['--landscape',str(canon),'--subject','biologie','--lang','de','--provider','OpenAI built-in image_gen; model identifier not exposed','--review-status','pilot']
 commands=[['node',str(import_root/'scripts/prepare_goal_visualization.mjs'),gid,*common],['node',str(import_root/'scripts/import_goal_visualization.mjs'),gid,str(image),*common,'--license','CC-BY-4.0','--alt-text',alt,'--prompt',str(selected_prompt),'--reconstruction-prompt',str(reconstruction)]]
 results=[]
 for i,cmd in enumerate(commands):
  run=subprocess.run(cmd,cwd=root,text=True,capture_output=True); log=here/'images'/f'{gid}.native-'+Path('') if False else here/'images'/f'{gid}.native-{i}.stdout.txt'
  log.write_text(run.stdout+run.stderr);results.append({'argv':cmd,'exitCode':run.returncode,'outputPath':str(log.relative_to(root))})
  if run.returncode:raise RuntimeError(f'Native visualization operation failed: {gid}: {run.stderr}')
 native_public=Path(meta['nativeInputRoot'])/'app/public/assets/goal-visualizations/biologie'/gid/(gid+'.png')
 native_public.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(image,native_public)
 copies=[import_root/'curricula/DE/Gymnasium/visualizations/biologie'/gid/(gid+'.png'),import_root/'app/public/assets/goal-visualizations/biologie'/gid/(gid+'.png'),import_root/'backend/src/main/resources/static/assets/goal-visualizations/biologie'/gid/(gid+'.png'),native_public]
 sha=hashlib.sha256(image.read_bytes()).hexdigest()
 assert all(p.exists() and hashlib.sha256(p.read_bytes()).hexdigest()==sha for p in copies)
 receipts.append({'goalId':gid,'selectedCandidateVersion':version,'assetSha256':sha,'copies':[str(p.relative_to(root)) for p in copies],'commands':results,'candidateOnly':True,'humanApproval':False,'currentMachineVisualizationApproval':False,'altText':alt})
qa=json.loads((here/'visualization.five-kept.native-preview-only.qa.json').read_text());goals={g['id']:g for g in json.loads(canon.read_text())['goals']}
for row in receipts:
 g=goals[row['goalId']];url=f"/assets/goal-visualizations/biologie/{g['id']}/{g['id']}.png"
 qa['records'].append({'goalId':g['id'],'title':g['title'],'description':g['description'],'subject':'biologie','landscapeId':'08a43a1b-d97e-522c-9dfa-c950a493364e','landscapePath':meta['canonicalPath'],'visualizationState':'available','missingReason':'','imageUrl':url,'publicAssetPath':'app/public'+url,'canonicalAssetPath':str((import_root/'curricula/DE/Gymnasium/visualizations/biologie'/g['id']/(g['id']+'.png')).relative_to(root)),'assetSha256':'sha256:'+row['assetSha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'Inactive author candidate. Actual visual author inspection is documented separately; independent current machine visualization QA is pending.','humanReviewedAt':None,'humanReviewer':''})
(here/'visualization.eighteen.native-preview-only.qa.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n')
book=json.loads((here/'book.config.json').read_text());book['goalVisualizationQaPath']=str((here/'visualization.eighteen.native-preview-only.qa.json').relative_to(root));(here/'book.config.json').write_text(json.dumps(book,ensure_ascii=False,indent=2)+'\n')
(here/'images/native-thirteen-inactive-prepare-import.actual.receipt.json').write_text(json.dumps({'candidateOnly':True,'activeWrites':0,'humanApproval':False,'currentMachineVisualizationApproval':False,'physicalImportRoot':str(import_root.relative_to(root)),'records':receipts},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'nativeImports':len(receipts),'exactCopies':sum(len(r['copies']) for r in receipts),'activeWrites':0,'currentVApproved':0}))
