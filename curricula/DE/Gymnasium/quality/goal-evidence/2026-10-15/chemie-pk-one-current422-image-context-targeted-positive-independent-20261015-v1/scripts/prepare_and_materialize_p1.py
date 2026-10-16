from pathlib import Path
import json,hashlib,shutil,subprocess,datetime,os
ROOT=Path('/home/enpasos/projects/skillpilot')
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-pk-one-current422-image-context-targeted-positive-independent-20261015-v1')
r=ROOT/REL
host=ROOT/'tmp/chemie-m7-resumed-20261015/pk-one-current422-image-context-positive-host-v1'
start=json.loads((r/'REVIEW.start.actual.json').read_text())
first=json.loads((r/'first/FIRST.P1.scientific-decision.json').read_text())
def dig(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def binding(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':dig(b),'bytes':len(b)}
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
base=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bw-lk-memory-support-current422-native13-context-preparation-technical-root-20261015-v1'
sel=json.loads((base/'INPUTS.exact-native13-preparation.json').read_text())
can=ROOT/sel['canonical560']['path']; sem=ROOT/sel['semantic560']['path']
normalCan=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
normalSem=Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
rawSem=json.loads(sem.read_text());aliasSem=json.loads(sem.read_text());aliasSem['sourceLandscapePath']=str(normalCan)
assert all(rawSem[k]==aliasSem[k] for k in rawSem if k!='sourceLandscapePath')
write(r/'inputs/semantic560.normal-alias.exact-decisions.json',aliasSem)
write(r/'checks/SEM560.normal-address-only-transport.actual.json',{'role':'Technical normal-address transport only; all 560 original decisions and other fields unchanged.','original':binding(sem),'normalAddress':str(normalCan),'onlyChangedField':'sourceLandscapePath','originalSourceLandscapePath':rawSem['sourceLandscapePath'],'allDecisionsExact':rawSem['decisions']==aliasSem['decisions'],'decisionCount':len(aliasSem['decisions'])})
assert not host.exists(),'Use a new host; do not overwrite any earlier host.'
for p in (host/'app/scripts',host/'app/public',host/normalCan.parent,host/normalSem.parent,host/REL.parent):p.mkdir(parents=True,exist_ok=True)
(host/'contracts').symlink_to(ROOT/'contracts',target_is_directory=True)
(host/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
(host/REL).symlink_to(r,target_is_directory=True)
shutil.copyfile(ROOT/'app/package.json',host/'app/package.json')
modules=[]
for name in ('materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts'):
 src=ROOT/'app/scripts'/name;dst=host/'app/scripts'/name;shutil.copyfile(src,dst);assert dst.read_bytes()==src.read_bytes();modules.append(binding(src))
shutil.copyfile(can,host/normalCan);shutil.copyfile(r/'inputs/semantic560.normal-alias.exact-decisions.json',host/normalSem)
img=json.loads((r/'visual-inspection/ACTUAL.image-and-size-bindings.json').read_text());asset=ROOT/img['source'];gid=start['goalIds'][0]
url=f'assets/goal-visualizations/chemie/{gid}/{gid}.png'
for dst in (host/'app/public'/url,host/f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/{gid}.png'):
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(asset,dst);assert dig(dst.read_bytes())==img['sha256']
reason=('Fresh targeted scientific P1 review of the complete unchanged profile and both complete DE/EN G2 cases on current canonical560/semantic560, including the six new Memory selection nodes and whole direct/reverse contexts. Independently derived pKb 10/5, conjugate pKa 11/9 and cross-equilibrium constants 10^5, 10 and 0.1; amount/concentration, intrinsic strength, finite conversion and unknown initial reaction quotient remain distinct. The actual 1672x941 PNG 3c3eac20b0e373c7ef4c1b74f82d6d7921db0540158e24b59d1197a5936c8213 was inspected natively and at 360/680 pixels: both balanced protolyses, mass-action expressions and negative-log strength rules fit the whole profile without supplying assessment evidence. Whole existing expectation/variation/case/coverage structure retained after actual examination, not a hash-only repair. Scientific reasons were sealed before Stock materialization at first/FIRST.P1.scientific-decision.seal.json. Historical P7 opinions were visible, so this is informed P science, not a peer-blind D vote. E1/G1 design only; no executions, human approval, other P13 review, D/A/M/V decision, source-course release or active integration.')
original=json.loads((r/'inputs/P1.original-whole-record.exact.json').read_text())
candidate={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':start['reviewId'],'reviewedAt':first['completedAtUTC'],'reviewer':start['reviewer'],'goals':[{'goalId':gid,'reason':reason,'evidenceLevel':'E1','maximumClaimScope':'G1','dissent':[],'profile':original['profile']}]}
write(r/'P/P1.fresh-reviewed.candidates.json',candidate)
cfg={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':start['reviewId'],'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2','landscapeId':'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0','landscapePath':str(normalCan),'semanticKindLedgerPath':str(normalSem),'reviewCriteriaPath':str(REL/'inputs/P.criteria.original-exact.md'),'reviewPath':str(REL/'P/P1.stock-materialized-before-run-link.records.jsonl'),'reviewRunManifestPaths':[],'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':'Exactly one fresh current image-context positive-understanding-evidence design review; no other goal or release authority','goalIds':[gid]}}
write(r/'P/P1.materialize-only.config.json',cfg)
write(r/'checks/REBUILD.P1.small-physical-host.actual.json',{'executionHost':str(host.relative_to(ROOT)),'canonical':binding(can),'normalCanonicalPath':str(normalCan),'semanticOriginal':binding(sem),'normalSemanticPath':str(normalSem),'semanticTransport':binding(r/'inputs/semantic560.normal-alias.exact-decisions.json'),'physicalStockModules':modules,'physicalPublicImage':{'normalPath':'app/public/'+url,'source':binding(asset),'physical':True},'fullTreeCopies':False,'earlierHostWrites':False,'newScientificVotesOutsideP1':0,'stockSourcesModified':False})
cmd=[str(ROOT/'app/node_modules/.bin/tsx'),str(host/'app/scripts/materializePositiveGoalEvidenceCandidates.ts'),'--config',str(REL/'P/P1.materialize-only.config.json'),'--candidates',str(REL/'P/P1.fresh-reviewed.candidates.json'),'--write']
started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(cmd,cwd=host,text=True,capture_output=True)
(r/'checks/P1.stock-materialize.actual.stdout.txt').write_text(p.stdout);(r/'checks/P1.stock-materialize.actual.stderr.txt').write_text(p.stderr)
receipt={'startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':cmd,'cwd':str(host.relative_to(ROOT)),'exitCode':p.returncode,'firstScienceSeal':binding(r/'first/FIRST.P1.scientific-decision.seal.json'),'scientificFirstPrecedesStock':True}
write(r/'checks/P1.stock-materialize.actual.json',receipt)
print(json.dumps(receipt,indent=2));print(p.stdout);print(p.stderr)
raise SystemExit(p.returncode)
