#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,datetime,shutil
R=Path('/home/enpasos/projects/skillpilot')
N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17')
O=N/'chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1'
B=R/O
def read(p):return json.loads((R/p).read_text())
def pin(p):
 p=Path(p);b=(R/p).read_bytes();return{'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,x):
 (B/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return pin(O/name)
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
m=read(O/'ASSEMBLY.inputs-and-exact-author-deltas.json')
for row in m['inputs']:assert pin(row['path'])==row,row['path']
parity=read(O/'PARITY.stock-SEM-source-fingerprints-and-raw41-view-roles.actual.json')
scope=read(O/'PLAN.exact-48-view-entry-additions-and-old-target-retention.json')
source=read(O/'SOURCE232.complete-current-unions-plus15-author-proposals.INACTIVE.json')
target15=read(O/'SOURCE15.whole-combined-13plus2-candidates-and-overlap-check.json')
c=read(O/'C659.447ordinary-68memory.two-author-candidates.INACTIVE.json')
assert m['canonical']==pin(m['canonical']['path'])
assert m['profiles']==pin(m['profiles']['path'])
assert parity['canonical']==m['canonical']
assert target15['whole232']==pin(target15['whole232']['path'])
assert source['baselineMappingReview']==pin(source['baselineMappingReview']['path'])
assert len(c['goals'])==659 and parity['counts']['ordinaryKinds']==447
own=[]
for row in scope['rows']:
 if row['newGoalId'] in ['223e33a4-5545-5332-ac4e-7d7a6cbc587c','4965395d-e0c5-5e23-a408-a11712aab409'] and row['scope'].get('jurisdiction')!='DE-HB':
  own.append({'newGoalId':row['newGoalId'],'viewId':row['viewId'],'scope':row['scope'],'reason':'New explicit own-acquisition retention proposed in sealed author scope matrix; no new official state-source credit. Final scope acceptance and actual supported provenance input remain Root steps.'})
removed=[]
for core in ['0959eef2-3c7d-5b33-a109-ddf332a5dbd9','3eb2a06c-d283-57aa-9eb4-088940c4801a']:
 before=[r['ordinal'] for r in source['rows'] if core in r['wholeCurrentCarrierIds']]
 after=[r['ordinal'] for r in source['rows'] if core in r['wholeCandidateCarrierIds']]
 removed.append({'coreGoalId':core,'beforeDirectHBSourceOrdinals':before,'afterCandidateDirectHBSourceOrdinals':after,
  'retainAllExistingCoreTargets':True,'ownHBTargetRetentionExplicitlyProposedInAuthorMatrix':True,
  'boundary':'Source-carrier partition must not delete the retained core from its old HB targets. Any required own-scope provenance input must be approved and supplied before later AP; raw view parity alone cannot establish applicability.'})
ownpin=write('PLAN.pending-own-scope-inputs-before-any-later-AP.json',{'role':'Finite technical applicability dependencies, not new scope acceptance','normalActivation':False,'APExecuted':False,'newSeparateDutyOwnAcquisitionCoordinates':own,'retainedCoreSourceMembershipDelta':removed,'authorScopeMatrix':read(Path(m['inputs'][3]['path']))['scopeRetentionPlan'],
 'boundary':'No provenance registry or applicability metadata is written by this package. Exact source and own-acquisition scope declarations remain explicit and pending their separate scientific/integration route. Existing source objects and all old view references stay exact.'})
receipt=write('RECEIPT.complete-inactive-C447-SEM659-P447-views-sources.technical.json',{
 'artifactRole':'Complete finite technical assembly; no new scientific decision or normal activation','atUTC':now,
 'canonical':m['canonical'],'semanticTransport':parity['candidateSEM'],'wholeProfiles':m['profiles'],'whole41Views':m['views'],'whole232Unions':m['sourceUnions'],
 'targeted15WholeUnionProposals':pin(O/'SOURCE15.whole-combined-13plus2-candidates-and-overlap-check.json'),
 'exactViewChanges':pin(O/'PLAN.exact-48-view-entry-additions-and-old-target-retention.json'),'pendingApplicabilityInputs':ownpin,
 'fieldDeltas':pin(O/'ASSEMBLY.inputs-and-exact-author-deltas.json'),'wholeObjectRetention':pin(O/'RETENTION.actual648-whole-goals-434-whole-profiles-and-all-old-edges.json'),
 'actualStockFPAndRawRoleParity':pin(O/'PARITY.stock-SEM-source-fingerprints-and-raw41-view-roles.actual.json'),
 'exactNewGoalMetadataArchive':pin(O/'ARCHIVE.five-new-goals-exact-transient-author-metadata.json'),'materialRoutes':m['materialRoutes'],
 'counts':m['counts'],'sourceCounts':target15['counts'],'stockCounts':parity['counts'],
 'rootEnglishTitleOverride':m['rootEnglishTitleOverride'],
 'status':{'candidateOnly':True,'normalWrites':0,'scientificReviewsPerformed':0,'independentReviewerArtifactsRead':0,'AP':False,'build':False,'nativeDRecordsGenerated':False,'nativeApproval':False,'M7':False,'HumanApproval':False,'HumanTrial':False},
 'SEMNativeBoundary':parity['nativeSEMSchemaBoundary'],
 'inputPinsStillExactAtSeal':True,'inputPins':m['inputs'],
 'assemblerDisclosure':'Assembler authored the earlier D5/two-duty proposal and HB view candidates and previously performed informed source/M/P/technical work. This is technical transport, not independent approval of any earlier own work. It reads sealed author inputs, exact normal bodies and stock sourceFP/role functions only; new peer judgments are not needed or read.',
 'canonicalStructureBoundary':'All old contains/requires, IDs, tags, applicability and order are exact. Five new goal objects are appended and explicitly referenced in views; no extra parent/root/weight patch is silently introduced. Author parent-insertion options remain external proposals.',
 'noSyntheticDataAsExecution':'All operative case/material bodies are unchanged. Practical execution, independent actual data, supervision/local release and all coverage requirements remain as authored; this transport certifies no performance.',
 'futureStepsRemainSeparate':['Root confirms actual paired science and exact final title/context','Serialize native classifications/A/M/P only from real accepted inputs','Complete new/changed visual-context and final native D requirements','Supply accepted source/own-scope inputs, then explicit normal integration and later AP/build']})
readme='''# Complete inactive Chemistry447 candidate transport

This package mechanically combines the two sealed author packages and the
separate Root-approved benzene phase field patch. It creates no scientific
review, normal registration, native approval, AP run, build, M7 or human claim.

- C659 has447 ordinary goals and68 memory goals. Exactly648 whole old goals
  remain exact; six old bodies change (five text/label/scope successors and one
  phase field). All old IDs, order, contains, requires, tags and applicability
  stay exact. Five new atoms are appended; no extra root/parent edit is hidden.
- P447 contains all complete current normal profiles, with eight exact author
  successors and five new profiles.434 whole profiles remain exact. Original
  owner/material locator context is retained, including transport-base limits.
- SEM659 uses actual Stock source fingerprints. All654 old classifications
  stay exact; six old source fingerprints change. Five new curricularAtomic
  rows are explicitly author_candidate assumptions. This transport is NOT a
  native valid reviewed ledger: the unchanged closed native contract requires
  authoritative/reviewed fields. No such approval is invented for these rows.
- All41 whole View candidates are included:48 explicit target references are
  added (32 route,4 medicine-society, and4 each for three HB-only P duties).
  Stock raw-role comparison preserves every old target and prerequisiteOnly
  role. Removing only the five new IDs restores each complete old view.
- The13+2 whole-source proposals are disjoint:15 ordinals, with217 other
  baseline source memberships retained and467 proposed partial edges. No new
  whole-source acceptance or single-goal completion claim is created.

The final722 English title is Root's explicit proposal:
“Describe the nuclear model of the atom and atomic constituents”. The original
sealed author files are unchanged. Final native D will evaluate the final text.

The five new transient authorCandidate/authorProposal objects are removed only
from candidate C and archived exactly outside it with their full scope/source,
profile, material and review-pending boundaries. Nothing is relabelled native.

There is no new BY route target and no HB GK medicine-society target. Retained
core targets must also survive the source-carrier partition. The finite own-scope
dependency plan records this before any later AP: raw view parity does not prove
final applicability. Existing source scopes, own-acquisition boundaries and
practical/independent-data/safety duties remain operative at their author refs.

Start with RECEIPT...technical.json for exact file pins and all boundaries.
No independent peer-review artifact is read for this technical assembly.
Own curriculum content: CC-BY-4.0. Technical scripts: Apache-2.0.
'''
(B/'README.md').write_text(readme)
shutil.copyfile(Path(__file__),B/'seal.complete-technical-transport.py')
outputpins=[pin(p.relative_to(R)) for p in sorted(B.rglob('*')) if p.is_file() and p.name!='SEAL.json']
sealp=write('SEAL.json',{'artifactRole':'Technical inactive transport seal, not scientific acceptance','sealedAtUTC':now,'receipt':receipt,'outputs':outputpins,'normalWrites':0,'newScientificJudgments':0,'AP':False,'build':False,'M7':False,'HumanApproval':False})
for p in outputpins:assert pin(p['path'])==p
print(json.dumps({'receipt':receipt,'seal':sealp,'files':len(outputpins)+1,'C':m['canonical'],'P':m['profiles'],'SEM':parity['candidateSEM'],'source':m['sourceUnions'],'views':m['views'],'counts':m['counts'],'coreSourceMembership':removed},indent=2))
