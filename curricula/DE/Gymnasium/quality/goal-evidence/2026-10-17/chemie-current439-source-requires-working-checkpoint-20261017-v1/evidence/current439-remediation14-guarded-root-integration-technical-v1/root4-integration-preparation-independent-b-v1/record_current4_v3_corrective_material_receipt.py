"""Copy factual paired dispositions into a current receipt; no new scientific vote."""
import argparse,datetime,hashlib,json
from pathlib import Path
O=Path(__file__).resolve().parent;J=O.parent;K=J/'capsule';E=J.parent
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor')
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads(Path(p).read_text())
def checked(p,h):
 p=Path(p);v=pin(p);assert v['sha256']==h,p;return v
def put(p,b):
 p=Path(p);bound=O if O in p.parents else K;assert bound in p.parents
 for a in [p.parent,*p.parent.parents]:
  if a==bound or bound in a.parents:assert not a.is_symlink(),a
 assert not p.is_symlink();p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert p.read_bytes()==b,p
 else:
  with p.open('xb') as f:f.write(b)
 return pin(p)
ap=argparse.ArgumentParser();ap.add_argument('--apply-root',action='store_true');args=ap.parse_args()
aroot=E/'chemie-current439-material4-v3-fresh-independent-a-v1';broot=E/'chemie-current439-material4-v2-fresh-independent-b-v1'
apath=aroot/'SELECTOR.independent-current4-v3-native-a.sealed.json';bpath=broot/'SELECTOR.current4-V3-fresh-independent-b.sealed.json';guards=[checked(apath,'faada5445a5151725c61bd7163001207e8cf725b7775248987a36fa822010964'),checked(bpath,'70479aaddafd169fee0928a5a4b80a10a54cd142113524efcbc223c78712f9ae')]
a=read(apath);b=read(bpath);af=read(aroot/'FIRST4.independent-v3-successor-science.json');bf=read(broot/'FIRST.independent-b-four-whole-current-scientific-decisions.json')
guards.extend([checked(aroot/'FIRST4.independent-v3-successor-science.json','783eb8d6504fbcccad4a7c6603d86d7645c2923c2da6db46d2cc81827ca5dd23'),checked(aroot/'FIRST4.frozen-native-v3-binding-confirmation.json','7d4cdde5270f281f426711a03f5eb095e725c0d45005cba7f3054da2b7a8cdeb'),checked(broot/'FIRST.independent-b-four-whole-current-scientific-decisions.json','962c93f323937824f69c29dc8774da79f1bd4043be383ad4a67ba988d291d849')])
aa={x['goalId']:x for x in af['results']};bb={x['goalId']:x for x in bf['judgments']};gids=b['goalIds'];assert set(aa)==set(bb)==set(gids) and len(gids)==4
assert not af['openFindings'] and all(not x['findings'] for x in bb.values())
dispositions=[]
for gid in gids:
 assert aa[gid]['descriptionVerdict'].lower()=='keep' and aa[gid]['positiveMaterialVerdict'].lower()=='keep'
 assert bb[gid]['Ddecision']=='keep' and bb[gid]['Pdecision']=='keep'
 dispositions.append({'goalId':gid,'actualIndependentA':{'D':'keep','wholeCurrentMaterialP':'keep'},'actualIndependentB':{'D':'keep','wholeCurrentMaterialP':'keep'},'reportedCurrentScientificFindings':[]})
for key in ['records','run']:guards.append(b['nativeP'][key])
for name in ['sourceNative4Selector','sourceAuthorV3Selector','currentWholeOperativeMaterial','currentOperativeBindings']:
 v=b[name];guards.append(checked(v['path'],v['sha256']))
for p in guards:assert pin(p['path'])==p,p['path']
notes=checked(J/'SYNTHESIS.native4-v3.actual-root-rationales.json','64533f2a86ffc935e9a091125c2716ef4cbd51a9763efd1838d12d877dccfa5e');guards.append(notes)
nativeIndex=None;prospective=None
if args.apply_root:
 dr=read(O/'RECEIPT.actual-stock-native4-v3-paired-D-synthesis.json');pr=read(O/'RECEIPT.root-prepared-D113-P439V3-prospective.json')
 nativeIndex=pin(K/dr['root']/'resolution-index.json');assert dr['indexDigest']=='sha256:'+nativeIndex['sha256'];assert pr['rootApplied'] is True
 prospective=pin(K/pr['targetRelativePath']);assert prospective==pr['targetPin']
history=pin(J/'RECEIPT.actual-stock-native14-paired-D-synthesis-P4-material-findings-open.json')
receipt={'schemaVersion':1,'role':'Current corrective material receipt for exact V3 inputs and two actual independently reported whole-material P dispositions; no new scientific vote','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootApplied':args.apply_root,'currentBindingSource':b['sourceNative4Selector'],'currentAuthorV3':b['sourceAuthorV3Selector'],'currentNineWholeOperativeCases':b['currentWholeOperativeMaterial'],'currentOperativeBindings':b['currentOperativeBindings'],'currentFourGoalDispositions':dispositions,'currentMaterialFindingStatus':'no_open_findings_reported_by_two_actual_independent_reviewers','formerOpenP4ReceiptHistoryOnly':history,'historyBoundary':'Old R14/V2 findings and receipts retain their exact earlier bindings and bytes. Current V3 independent dispositions apply only to these actual successor profiles/materials, without rewriting earlier judgments.','A_P_EvidenceForm':'Exact sealed A whole-science FIRST plus frozen-native binding confirmation; no separate A P-wrapper record is invented.','B_P_EvidenceForm':{'records':b['nativeP']['records'],'run':b['nativeP']['run'],'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1'},'activeProfileIdentityRule':'Keep exact Author-V3 P439 wrappers used in frozen D4 pages. Only 28c singleton owner changes; A/B reviews are separately pinned material evidence, never fabricated author run IDs.','rootScientificNotesExactPin':notes,'actualRootD4Index':nativeIndex,'prospectiveD113P439V3Config':prospective,'sourceEvidencePins':guards,'scientificVotesGeneratedByReceiptBuilder':0,'humanApproval':False,'HumanTrial':False,'centralActivated':False,'fullCentralReportRunByThisScript':False,'M7Claim':False}
data=(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n').encode();target=K/Q/'RECEIPT.current4-v3-corrective-material-paired-review.json' if args.apply_root else O/'draft-files/RECEIPT.current4-v3-corrective-material-paired-review.DRAFT.json';put(target,data)
if args.apply_root:put(O/'RECEIPT.root-recorded-current4-v3-corrective-material.json',data)
print(json.dumps({'receipt':pin(target),'rootApplied':args.apply_root,'actualPairedPKeep':4,'newScientificVotes':0}))
