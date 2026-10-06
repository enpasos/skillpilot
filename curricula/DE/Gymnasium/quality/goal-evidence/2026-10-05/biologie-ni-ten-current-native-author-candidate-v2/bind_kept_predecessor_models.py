#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind exact frozen predecessor PNGs inside the inactive tiny input root only."""
import copy,hashlib,json,shutil
from pathlib import Path
root=Path.cwd();own=Path(__file__).resolve().parent;rel=own.relative_to(root).as_posix();native=Path(json.loads((own/'prospective-paths.json').read_text())['nativeInputRoot'])
read=lambda p:json.loads(Path(p).read_text())
def write(n,v):(own/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
canon=read(own/'canonical.biologie.current.inactive.snapshot.json');goals={g['id']:g for g in canon['goals']};qa=read(root/'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
sources=[]
for stem in ['intraspecies-variation','gene-product-trait','mitotic-identity']:
 receipt_path=root/f'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ni-{stem}-candidate-20261005-v1/root-native-responsive-review.receipt.json';r=read(receipt_path)
 sources.append((r['candidateGoalId'],r['assetPath'],r['assetSha256'],r['altTextDe'],str(receipt_path.relative_to(root))))
alts={'independent-assortment':'Zwei alternative Verteilungen zweier homologer Chromosomenpaare zeigen unterschiedliche ganze elterliche Chromosomenkombinationen. Jede Alternative führt zu vier Keimzellen mit je einem langen und einem kurzen Chromosom; es sind keine acht Produkte einer einzelnen Meiose dargestellt.','chromatid-segment-exchange':'Vorher und nachher eines vereinfachten Crossing-over-Modells: Zwei Nichtschwesterchromatiden homologer Chromosomen tauschen entsprechende distale Abschnitte gegenseitig aus. Zwei andere Chromatiden bleiben unverändert; Zentromere und Chromosomenzahl bleiben erhalten. Das Bild zeigt keine vollständige Keimzellbildung.'}
for stem in ['independent-assortment','chromatid-segment-exchange']:
 ver='v1' if stem=='independent-assortment' else 'v2';receipt_path=root/f'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ni-{stem}-candidate-20261005-v1/candidate-{ver}-root-native-360-680-review.frozen.json';r=read(receipt_path)
 sources.append((r['goalId'],r['assetPath'],r['assetSha256'],alts[stem],str(receipt_path.relative_to(root))))
public=native/'app/public'
if public.is_symlink(): public.unlink();public.mkdir()
assert public.is_dir() and not public.is_symlink()
for entry in (root/'app/public').iterdir():
 target=public/entry.name
 if entry.name!='assets' and not target.exists():target.symlink_to(entry,target_is_directory=entry.is_dir())
assets=public/'assets';assets.mkdir(exist_ok=True)
for entry in (root/'app/public/assets').iterdir():
 target=assets/entry.name
 if entry.name!='goal-visualizations' and not target.exists():target.symlink_to(entry,target_is_directory=entry.is_dir())
vis=assets/'goal-visualizations';vis.mkdir(exist_ok=True)
for entry in (root/'app/public/assets/goal-visualizations').iterdir():
 target=vis/entry.name
 if entry.name!='biologie' and not target.exists():target.symlink_to(entry,target_is_directory=entry.is_dir())
bio=vis/'biologie';bio.mkdir(exist_ok=True)
for entry in (root/'app/public/assets/goal-visualizations/biologie').iterdir():
 target=bio/entry.name
 if not target.exists():target.symlink_to(entry,target_is_directory=entry.is_dir())
rows=[]
for gid,src,digest,alt,review in sources:
 assert sha(root/src)==digest
 target=bio/gid/(gid+'.png');assert not target.parent.is_symlink();target.parent.mkdir(exist_ok=True);shutil.copyfile(root/src,target);assert sha(target)==digest
 g=goals[gid];url=f'/assets/goal-visualizations/biologie/{gid}/{gid}.png'
 assert not g.get('resourceLinks'),'Predecessor links unexpectedly already present; explicitly reconcile'
 g['resourceLinks']=[dict(type='goal-visualization',role='primary',resourceType='image',title='Visualisierung: '+g['title'],url=url,skillpilotId=gid,altText=alt)]
 row=dict(goalId=gid,title=g['title'],description=g['description'],subject='biologie',landscapeId=canon['landscapeId'],landscapePath=rel+'/canonical.biologie.current.inactive.snapshot.json',visualizationState='available',imageUrl=url,publicAssetPath='app/public'+url,canonicalAssetPath=src,assetSha256=digest,umlautsCorrectChatGpt='no',contentApprovedChatGpt='no',humanApproved='no',humanIssueIdentified='no',humanIssueDescription='',chatGptReviewedAt=None,chatGptReviewer='',chatGptNotes='Inactive native preview binding of exact frozen predecessor PNG; earlier candidate-only science/visual reviews retained as history. Current context/V approval and operative adoption pending.',humanReviewedAt=None,humanReviewer='')
 assert not any(r['goalId']==gid for r in qa['records']);qa['records'].append(row)
 rows.append(dict(goalId=gid,KEEP=True,sourcePath=src,sourceSha256=digest,ownPhysicalPath=str(target.relative_to(root)),priorActualReviewPath=review,currentApproval=False,newImageCreated=False))
write('canonical.biologie.current.inactive.snapshot.json',canon);write('visualization.five-kept.native-preview-only.qa.json',qa)
book=read(own/'book.config.json');book['goalVisualizationQaPath']=rel+'/visualization.five-kept.native-preview-only.qa.json';write('book.config.json',book)
for config,folder in [('batch.config.json','native-eighteen-kept-models-finalbook'),('existing-five-bindings.batch.config.json','native-existing-five-current-bindings-finalbook')]:
 b=read(own/config);b['outputDirectory']=rel+'/'+folder;write(config,b)
write('five-kept-png.exact-byte-native-binding.receipt.json',dict(candidateOnly=True,activeWrites=0,humanApproval=False,currentVApproval=False,physicalNewPNGCount=5,newlyGeneratedImages=0,existingPNGBytesUnchanged=True,rows=rows,remainingNewNIImagesMissing=13,allOtherPublicEntries='Read-only aliases to current actual repository; no whole public/assets copy'))
print(json.dumps(dict(keptExactPNGs=5,activeWrites=0,currentVApprovals=0,missingNewPNGs=13)))
