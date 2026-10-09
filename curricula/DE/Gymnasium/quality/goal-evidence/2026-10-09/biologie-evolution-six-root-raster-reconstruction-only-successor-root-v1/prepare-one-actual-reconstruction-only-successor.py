#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Correct only the actual image reconstruction count in an additive successor."""
import copy,hashlib,json
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[7];OUT=Path(__file__).resolve().parent
OLD=OUT.parent/'biologie-evolution-systematics-behavior-six-raster-author-root-v1'
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):
 assert not p.exists(),p
 p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');assert json.loads(p.read_text())==x
entry=OLD/'neutral-completed-six-selected-actual-PNGs.independent-V-review.entry.json'
meta=OLD/'six-selected-PNGs.actual-metadata-and-reconstruction.candidates.json'
original=json.loads(meta.read_text());successor=copy.deepcopy(original)
row=next(r for r in successor['images'] if r['ordinal']==18)
oldrecon=ROOT/row['reconstructionPrompt']['path']
text=oldrecon.read_text()
before='fünf Erwachsenen unter „Selektion“, vier langhalsig und einer mittellang'
after='sechs Erwachsenen unter „Selektion“, fünf langhalsig und einer niedriger gezeichneten'
assert text.count(before)==1
newrecon=OUT/'image-reconstruction-prompt.theories-selected-v2.six-actually-visible.successor.de.md'
assert not newrecon.exists();newrecon.write_text(text.replace(before,after))
row['reconstructionPrompt']={**bind(newrecon),'derivedFromActualSeenImage':True,'generationExecuted':False}
masked=copy.deepcopy(successor);maskedrow=next(r for r in masked['images'] if r['ordinal']==18)
maskedrow['reconstructionPrompt']=next(r for r in original['images'] if r['ordinal']==18)['reconstructionPrompt']
assert masked==original
newmeta=OUT/'six-original-PNGs.one-reconstruction-count-only.successor.metadata.json'
write(newmeta,successor)
first=OUT/'one-reconstruction-only-successor.technical-input.freeze.json'
write(first,{'schemaVersion':1,'role':'Historical input and scientific visual FIRST preserved; additive text correction only','originalEntry':bind(entry),'originalMetadata':bind(meta),'originalReconstruction':bind(oldrecon),'pixelFirstNeutralInput':bind(OLD/'six-selected-actual-PNGs.pixel-FIRST-neutral-input.json'),'actualAuthorObservation':'Selected v2 right-hand later population contains six adult giraffes: five taller and one lower on the far right. There are three in the preceding variation sample. Exact original provider request remains history, not a claim about emitted pixels.','findingId':'EVO6-V-A-META-001','allPNGsAndCaptionAltAndLinkFieldsUnchanged':True})
newentry=OUT/'neutral-one-reconstruction-count-only-successor.metadata-followup.entry.json'
write(newentry,{'schemaVersion':1,'createdAt':datetime.now(timezone.utc).isoformat(),'role':'Additive standalone reconstruction count correction; existing six PNGs and all link/caption/provider fields unchanged','originalAuthorEntry':bind(entry),'pixelFirstNeutralInput':bind(OLD/'six-selected-actual-PNGs.pixel-FIRST-neutral-input.json'),'postFirstMetadataInput':bind(newmeta),'onlyChangedGoalId':row['goalId'],'correctedReconstruction':bind(newrecon),'inputFirst':bind(first),'historicalFindingId':'EVO6-V-A-META-001','maskedWholeMetadataEquality':True,'changedPNGCount':0,'originalProviderPromptsUnchanged':True,'captionAltResourceLinksUnchanged':True,'independentFollowupStatus':'PENDING','sourceNativePApproval':False,'strictGain':0,'humanApproval':False,'activeWrites':[]})
seal=OUT/'reconstruction-only-successor.author.final.freeze.json'
write(seal,{'schemaVersion':1,'role':'Technical author successor, no new V approval','entry':bind(newentry),'files':[bind(p) for p in sorted(OUT.iterdir()) if p.is_file() and p!=seal]})
print(json.dumps({'entry':bind(newentry),'newRecon':bind(newrecon),'maskedMetadataExact':True,'changedPNGs':0}))
