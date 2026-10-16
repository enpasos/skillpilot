# SPDX-License-Identifier: Apache-2.0
"""Genuine Originalentscheidungen zuordnen; finale96-V bleibt Voraussetzung."""
from pathlib import Path
import hashlib,json
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=R/r['path'];assert ref(p)==r,p;return p
raw=load(O/'PREPARED.raw-five-PA-two-texts-awaiting-genuine-context-and-final-bindings.json')
sources={k:load(verify(v['selector'])) for k,v in raw['genuineScientificSources'].items()}
ctxp=E/'chemie-two-local-text-successors-informed-PAV-context-20261015-v1/OUTPUTS.finite-two-local-texts-informed-PAV-context.selector.json'
assert ref(ctxp)['sha256']=='sha256:3054d17cc3eaca9e44db51ca5d74d6654363afb832c5929d38d53e62608a93d8';ctx=load(ctxp)
for r in load(R/ctx['sealPath'])['files']:verify(r)
spec=[('96d33fb6-ed14-50ab-b5c7-5ce0559d518a',ctx['FIRSTP2'],ctx['FIRSTA2']),('b47d542d-c2d7-5554-95dc-10b47ab622ab',sources['b47P1']['firstFinding'],sources['Q2PAV3']['FIRSTA3']),('ffec1761-c954-5b5d-a0cf-4c8367f91705',sources['Q2PAV3']['FIRSTP3'],sources['Q2PAV3']['FIRSTA3']),('0b5342b9-512d-573f-90d5-7522aee35efa',ctx['FIRSTP2'],ctx['FIRSTA2']),('f4d5a02d-711b-5a6b-a41d-971359c1f64d',sources['f4P1']['firstP1'],sources['P2A2']['firstA2'])]
rows=[]
for gid,pr,ar in spec:
 row={'goalId':gid}
 for gate,source in [('P',pr),('A',ar)]:
  whole=load(verify(source));record=next((r for r in whole.get('records',[]) if r['goalId']==gid),whole if whole.get('goalId')==gid else None);assert record
  row[gate]={'sourceFIRST':source,'wholeOriginalRecord':record,'originalReviewer':whole['reviewer'],'originalObservedAt':whole.get('observedAtUTC',whole.get('reviewedAtUTC'))}
 assert row['P']['wholeOriginalRecord']['evidenceLevel']=='E1' and row['P']['wholeOriginalRecord']['maximumClaimScope']=='G1'
 verdict=row['A']['wholeOriginalRecord'].get('semanticVerdict',row['A']['wholeOriginalRecord'].get('verdict'));assert verdict in ['ATOMIC','ATOMIC_REMAINS_APPLICABLE']
 rows.append(row)
out=O/'INPUTS.genuine-original-P5-A5-science-records.no-final-bindings.json';assert not out.exists();out.write_text(json.dumps({'schemaVersion':1,'role':'Wörtliche genuine Quellenzuordnung, keine neuen Urteile/Fingerprints','twoTextContextSelector':ref(ctxp),'records':rows,'normalReviewRunIdsWillRemainEmptyWithoutInventedScienceRuntime':True,'normalStatusWillRemainAiCandidateNeedsHumanReview':True,'newScienceVotes':0,'awaitingFinal96ImageAndGenuineV1':True,'awaitingFinalNeighborProfileScopeForNative8':True},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'genuinePRecordsMapped':5,'genuineARecordsMapped':5,'finalFingerprints':0,'checks':0,'final96VPending':True}),flush=True)
