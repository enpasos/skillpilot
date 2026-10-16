# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy,hashlib,json,shutil
R=Path.cwd();E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16';O=E/'chemie-six-genuine-machine-visual-normal-bindings-technical-20261016-v1'
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
assert not O.exists();O.mkdir()
B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-eight-reviewed-inactive-integration-technical-20261016-v1/REBUILD.final-current426-eight-reviewed-inactive-integration.physical-map.json';b=read(B);qp=R/b['finalQA']['path'];assert pin(qp)==b['finalQA'];old=read(qp);qa=copy.deepcopy(old)
C=E/'chemie-joint578-current-semantic-ledger-technical-20261016-v1/candidate/CANONICAL.joint578.two-memory-bodies-appended.technical-preview.json';c=read(C);goals={g['id']:g for g in c['goals']}
fp=E/'chemie-acid-four-new-PNG-actual-independent-visual-20261016-v1/FIRST.four-new-PNG.actual-independent-scientific-and-visual-review.json';f=read(fp);assert not f['openImageFindings']
rows=[(g['goalId'],g['image'],f['reviewedAtUTC'],fp,g['observationsDe'],g['limitsDe']) for g in f['goalReviews']]
for rel in ['chemie-conductometry-targeted-kink-actual-independent-machine-visual-followup-20261016-v2/FOLLOWUP.actual-independent-targeted-kink-disposition.json','chemie-ethanol-targeted-acetate-actual-independent-visual-followup-20261016-v2/FOLLOWUP.exact-acetate-finding-disposition.json']:
 p=E/rel;d=read(p);assert not d['openImageFindings'];rows.append((d['goalId'],d['image'],d['reviewedAtUTC'],p,d['findingDisposition'][0]['observationsDe'],'Exact corrected image only; original image and FIRST retained; no whole source/performance approval.'))
assert len(rows)==6;ids={r['goalId'] for r in old['records']};proofs=[];aliases=[]
for gid,image,date,proof,notes,limits in rows:
 assert gid not in ids;g=goals[gid];assert pin(R/image['path'])==image;links=[l for l in g['resourceLinks'] if l['type']=='goal-visualization'];assert len(links)==1;url=links[0]['url'];assert url.endswith('/'+gid+'.png')
 public='app/public'+url;canonical='curricula/DE/Gymnasium/visualizations'+url.removeprefix('/assets/goal-visualizations')
 record={'goalId':gid,'title':g['title'],'description':g['description'],'subject':'chemie','landscapeId':c['landscapeId'],'landscapePath':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','visualizationState':'available','missingReason':'','imageUrl':url,'publicAssetPath':public,'canonicalAssetPath':canonical,'assetSha256':image['sha256'],'umlautsCorrectChatGpt':'no','contentApprovedChatGpt':'no','humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','chatGptReviewedAt':None,'chatGptReviewer':'','chatGptNotes':'','humanReviewedAt':None,'humanReviewer':'','aiApproved':'yes','aiApprovedAssetSha256':image['sha256'],'aiReviewedAt':date,'aiReviewer':'Independent actual machine scientific/visual reviewer, exact evidence: '+proof.relative_to(R).as_posix(),'aiNotes':'Actual native,360 and680 visual inspections, not generation or human approval. '+json.dumps(notes,ensure_ascii=False)+' Limits: '+limits}
 qa['records'].append(record);proofs.append({'goalId':gid,'actualVisualReview':pin(proof),'exactImage':image,'wholeCurrentGoal':g,'normalQaRecord':record,'newIndependentVoteByMaterialization':False,'HumanApproval':False,'HumanTrial':False});aliases.append({'normalCanonicalDestination':canonical,'normalPublicDestination':public,'physicalRepositorySource':image,'readOnlySymlinksOnly':True})
assert qa['records'][:len(old['records'])]==old['records'];assert len(qa['records'])==len(old['records'])+6
qpout=O/'QA449.original443-whole-records-and-six-genuine-exact-machine-bindings.json';put(qpout,qa)
put(O/'BINDINGS.six-actual-visual-FIRSTs-to-current-whole-goals-and-exact-records.json',{'schemaVersion':1,'role':'Technical normal QA binding of actual independently performed inspections, not new votes','originalWholeQA':pin(qp),'currentCanonical':pin(C),'bindings':proofs,'allOriginalRecordsExact':True,'oldRecords':len(old['records']),'newRecords':6,'NormalVStockCoverageChecksRun':0,'HumanApproval':False,'HumanTrial':False})
put(O/'ALIASES.six-read-only-normal-canonical-and-public-image-paths.json',{'aliases':aliases,'actualHostCreated':False,'imageByteCopies':0})
put(O/'OUTPUTS.finite-six-genuine-normal-visual-bindings.selector.json',{'schemaVersion':1,'role':'Six genuine normal QA bindings, pending actual alias load and stock coverage check','QA':pin(qpout),'actualBindings':pin(O/'BINDINGS.six-actual-visual-FIRSTs-to-current-whole-goals-and-exact-records.json'),'exactImageAliases':pin(O/'ALIASES.six-read-only-normal-canonical-and-public-image-paths.json'),'normalStockChecks':0,'Native':0,'Central':0,'newScienceVotes':0,'HumanApproval':False,'HumanTrial':False})
(O/'scripts').mkdir();shutil.copyfile(Path(__file__),O/'scripts/materialize_six.py')
put(O/'SEAL.finite-six-genuine-normal-visual-bindings.json',{'files':[pin(p) for p in sorted(O.rglob('*')) if p.is_file()],'noSelfHash':True})
print(json.dumps({'selector':pin(O/'OUTPUTS.finite-six-genuine-normal-visual-bindings.selector.json'),'QA':pin(qpout),'originalRecordsExact':len(old['records']),'newRecords':6,'totalRecords':len(qa['records'])},indent=2))
