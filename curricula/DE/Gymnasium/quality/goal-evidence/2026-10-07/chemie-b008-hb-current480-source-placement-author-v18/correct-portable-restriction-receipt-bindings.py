# SPDX-License-Identifier: Apache-2.0
"""Append truthful correction; preserve the first sealed files and diagnostic history."""
from pathlib import Path
from copy import deepcopy
from datetime import datetime,timezone
import json,hashlib
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
assert not (OWN/'author.corrected-portable-receipts.final.freeze.json').exists()
def read(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
first=read(OWN/'author.final.freeze.json')
for r in first['payloads']:assert bind(ROOT/r['path'])==r
changes=[]
def rebind(v,pointer):
 if isinstance(v,dict):
  if set(v)=={'path','sha256','bytes'} and v['path'].startswith(str(OWN.relative_to(ROOT)/'primary-receipts')):
   now=bind(ROOT/v['path'])
   if now!=v:changes.append({'jsonPointer':pointer,'before':deepcopy(v),'after':now});v.update(now)
  else:
   for k,item in v.items():rebind(item,pointer+'/'+k)
 elif isinstance(v,list):
  for i,item in enumerate(v):rebind(item,pointer+'/'+str(i))
proposal=read(OWN/'exact-hb-primary-course-components-and-three-view-proposals.author.json');rebind(proposal,'/proposal');write(OWN/'exact-hb-primary-course-components-and-three-view-proposals.portable-bindings-corrected.author.json',proposal)
reading=read(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.json');rebind(reading,'/reading');write(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.portable-bindings-corrected.json',reading)
assert len({r['after']['path'] for r in changes})==2
entry=read(OWN/'bounded-neutral-hb-source-placement-review-entry.json');entry['wholeSourceComponentsAndViewProposals']=bind(OWN/'exact-hb-primary-course-components-and-three-view-proposals.portable-bindings-corrected.author.json');entry['actualScopedSourceReadingAndUnchangedBodyBindings']=bind(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.portable-bindings-corrected.json');entry['initialSealedPortableReceiptBinderFailureRetained']=bind(OWN/'author.final.freeze.json')
checks=[]
def verify(v,pointer):
 if isinstance(v,dict):
  if set(v)=={'path','sha256','bytes'}:
   assert bind(ROOT/v['path'])==v,(pointer,v);checks.append(pointer)
  else:
   for k,item in v.items():verify(item,pointer+'/'+k)
 elif isinstance(v,list):
  for i,item in enumerate(v):verify(item,pointer+'/'+str(i))
verify(proposal,'/correctedProposal');verify(reading,'/correctedReading');verify(entry,'/correctedEntry')
write(OWN/'portable-restriction-receipt-binder-correction.actual.json',{'role':'Actual technical correction of two unpaginated restriction receipts; no repeated scientific review','immutableInitialFreeze':bind(OWN/'author.final.freeze.json'),'actualPriorError':'A pre-freeze local rebind snippet shadowed its helper path with a receipt-loop path, raised FileNotFoundError, and did not update the two receipt bindings after printedPage was correctly changed to null. Initial freeze preserved exact, no independent approval had been claimed.','affectedReceiptFiles':sorted({r['after']['path'] for r in changes}),'actualAllRepeatedReferencesCorrected':changes,'currentCorrectedProposal':bind(OWN/'exact-hb-primary-course-components-and-three-view-proposals.portable-bindings-corrected.author.json'),'currentCorrectedReading':bind(OWN/'actual-bounded-primary-reading-and-unchanged-text-material-reuse.portable-bindings-corrected.json'),'allSourceBodiesContextsMappingsViewsAndNativeResultsUnchanged':True,'actualNestedExactBindersVerified':len(checks),'newScientificReview':False,'strictGain':0,'activeWrites':0,'humanApproval':False})
entry['actualPortableReceiptBinderCorrection']=bind(OWN/'portable-restriction-receipt-binder-correction.actual.json');write(OWN/'bounded-neutral-hb-source-placement-review-entry.portable-bindings-corrected.json',entry)
(OWN/'PORTABLE-BINDER-CORRECTION.md').write_text('''# Current neutral Bremen entry

Use `bounded-neutral-hb-source-placement-review-entry.portable-bindings-corrected.json` and `author.corrected-portable-receipts.final.freeze.json` for review. The first freeze and all of its payload bytes remain unchanged.

Two unpaginated 2022 restriction receipts were correctly changed from a guessed printed page to null before the initial freeze, but an actual failed local rebinding snippet left their old hashes in repeated proposal and reading references. This appended correction binds their actual existing bytes. Source bodies, author findings, mappings, scopes, all candidate views and actual native results remain unchanged. No scientific review is repeated or invented. Every nested exact binder in the corrected neutral inputs is now actually checked, instead of only checking outer payload-file hashes. No active changes or strict gain.
''')
freeze={'schemaVersion':1,'role':'Author-only HB v18 final with appended validated portable binder correction','createdAtUTC':datetime.now(timezone.utc).isoformat(),'initialAuthorFreezeRetainedExact':bind(OWN/'author.final.freeze.json'),'currentNeutralEntry':bind(OWN/'bounded-neutral-hb-source-placement-review-entry.portable-bindings-corrected.json'),'wholeSourceClosure':False,'sourceIndependentApproval':False,'strictGain':0,'activeWrites':0,'humanApproval':False,'payloads':[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]}
write(OWN/'author.corrected-portable-receipts.final.freeze.json',freeze)
for r in freeze['payloads']:assert bind(ROOT/r['path'])==r
print(json.dumps({'seal':bind(OWN/'author.corrected-portable-receipts.final.freeze.json'),'payloads':len(freeze['payloads']),'correctedRepeatedBindings':len(changes),'actualNestedExactBindersVerified':len(checks)}))
