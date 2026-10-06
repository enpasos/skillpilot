#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reuse only own unchanged science after complete current-input comparison."""
from pathlib import Path
import copy, datetime, hashlib, json, subprocess
import fitz
from PIL import Image, ImageChops

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
BASE = OWN.parent
OLD = BASE / 'biologie-ephase-seven-current-independent-d-a-v1'
AUTHOR = BASE / 'biologie-ephase-seven-current-native-candidate-v1'
CURRENT = BASE / 'biologie-ephase-seven-current365-native-candidate-v2'
ROUND = CURRENT / 'native-finalbook/round-a'
ISO = ROOT / 'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
def dump(p, v): p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
started = now()
freezes = [
 (OLD/'independent-d-a.final.freeze.json', '6c96444898515569f86335270dbb22b58acc9eb8d5a9560ba6bfe173b29bc6b4',56),
 (AUTHOR/'author-native-candidate.final.freeze.json','36a3cd9763d06419dba9a1464a2b36ea62f4e88a539fcdcf7ff3cfacf0dcc790',195),
 (CURRENT/'technical-current365-candidate.final.freeze.json','7f92fa4e8f5aa8a83987f95301cb42006d8d0eff9b7ce7a4aacac24dfe874318',122)]
def verify_freezes():
 for file, digest, count in freezes:
  assert sha(file)==digest, str(file)
  rows=read(file)['files']; assert len(rows)==count
  for row in rows: assert sha(ROOT/row['path'])==row['sha256'].removeprefix('sha256:'), row['path']
verify_freezes()
oi=read(AUTHOR/'native-finalbook/round-a/description-review-input.json')
ni=read(ROUND/'description-review-input.json')
assert len(oi['goals'])==len(ni['goals'])==7 and oi['goals']==ni['goals']
om=read(AUTHOR/'native-finalbook/bundle/book-model.json')
nm=read(CURRENT/'native-finalbook/bundle/book-model.json')
assert om['pages']==nm['pages'] and len(nm['pages'])==7
sources=[]
for name in ['full.current-original-sources.json','seven-goal-d-book.current-original-sources.json']:
 a,b=read(AUTHOR/name),read(CURRENT/name)
 # Full atlas includes the new independent bacterial atom; compare exact E7 facets.
 ids={v['goalId'] for v in ni['goals']}
 def selected(j):
  rows=j['goals']
  if isinstance(rows,dict): return {k:v for k,v in rows.items() if k in ids}
  return [v for v in rows if v.get('goalId',v.get('id')) in ids]
 assert selected(a)==selected(b)
 assert len(selected(a))==7
 def complete_bound_facets(j):
  facets=selected(j)
  assert isinstance(facets,dict)
  evidence_ids={eid for rows in facets.values() for row in rows for eid in row['evidenceIds']}
  evidence=[v for v in j['evidence'] if v['id'] in evidence_ids]
  assert len(evidence)==len(evidence_ids)
  docids={v['documentId'] for v in evidence}
  return {'goals':facets,'evidence':evidence,'documents':[v for v in j['documents'] if v['id'] in docids]}
 assert complete_bound_facets(a)==complete_bound_facets(b)
 sources.append({'path':name,'oldSHA256':sha(AUTHOR/name),'currentSHA256':sha(CURRENT/name),'completeSevenGoalFacetObjectsAndActualBoundEvidenceAndDocumentsExact':True,'boundEvidenceCount':len(complete_bound_facets(a)['evidence']),'wholeDocumentExact':a==b})
pdfa=fitz.open(AUTHOR/'native-finalbook/bundle/book.pdf'); pdfb=fitz.open(CURRENT/'native-finalbook/bundle/book.pdf')
assert len(pdfa)==len(pdfb)==9
pixels=[]
for n in range(2,9):
 pa,pb=pdfa[n].get_pixmap(matrix=fitz.Matrix(1.15,1.15),alpha=False),pdfb[n].get_pixmap(matrix=fitz.Matrix(1.15,1.15),alpha=False)
 a,b=Image.frombytes('RGB',(pa.width,pa.height),pa.samples),Image.frombytes('RGB',(pb.width,pb.height),pb.samples)
 assert a.size==b.size
 bbox=ImageChops.difference(a,b).getbbox()
 assert bbox is not None and bbox[1]>a.height*.96, (n,bbox,a.size)
 bodyheight=int(a.height*.96)
 assert a.crop((0,0,a.width,bodyheight)).tobytes()==b.crop((0,0,b.width,bodyheight)).tobytes()
 pixels.append({'physicalPage':n+1,'rasterSize':list(a.size),'changedPixelBBox':list(bbox),'bodyPixelsExactAboveY':bodyheight})
comparison={'startedAt':started,'completedAt':now(),'wholeSevenDInputObjectsExact':True,'wholeSevenBookModelPagesExact':True,'sourceFacetComparisons':sources,'ownActualPDFPixelComparisons':pixels,'topLevelDInputKeysChanged':[k for k in ni if oi.get(k)!=ni[k]],'topLevelBookModelKeysChanged':[k for k in nm if om.get(k)!=nm[k]],'actualCurrentCoverAndPhysicalPage3Viewed':True,'actualViewedFiles':[{'path':str(CURRENT/'actual-current-page-views'/f'physical-page-{n:02}.png').removeprefix(str(ROOT)+'/'),'sha256':sha(CURRENT/'actual-current-page-views'/f'physical-page-{n:02}.png')} for n in [1,3]],'reusedScienceSource':'own frozen D-A v1 only','otherCurrentIndependentScienceRead':False,'newScientificClosures':0,'reboundOwnOuterBindings':7,'humanApproval':False,'humanTrial':False,'activeWrites':0}
dump(OWN/'own-full-current365-binding-comparison.actual.json',comparison)
c=read(ROUND/'description-review-campaign.json'); batch=c['batches'][0]
oldfiles=list((OLD/'results').glob('*.records.jsonl')); assert len(oldfiles)==1
oldrecords=[json.loads(v) for v in oldfiles[0].read_text().splitlines()]
assert len(oldrecords)==7
runid='biologie-ephase-seven-current365-independent-d-a-20261005-v2'
records=[]
for n,(old,g) in enumerate(zip(oldrecords,ni['goals']),1):
 assert old['goalId']==g['goalId']
 for k in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']: assert old[k]==g[k]
 rec=copy.deepcopy(old)
 rec.update(recordId=f'{runid}.record-{n:03}',runId=runid,campaignId=c['campaignId'],roundId=c['roundId'],bundleFingerprint=c['bundleFingerprint'],bookDigest=c['bookDigest'])
 assert rec['understandingEvidence']==old['understandingEvidence'] and rec['rationale']==old['rationale']
 records.append(rec)
out=OWN/'results'; out.mkdir()
recfile=out/(batch['batchId']+'.records.jsonl')
recfile.write_text(''.join(json.dumps(v,ensure_ascii=False,separators=(',',':'))+'\n' for v in records))
params={'reviewer':'same independent OpenAI Codex D-A reviewer','procedure':'exact whole-input science reuse; own current binding comparison and actual cover/footer inspection','originalScienceDirectory':str(OLD).removeprefix(str(ROOT)+'/'),'originalScienceFreezeSHA256':freezes[0][1],'unchangedScienceVerdictsReused':7,'newScienceVerdicts':0,'independentBindingChecks':7,'E7DescriptionsOrProfilesAuthored':False,'otherCurrentE7DescriptionReviewsRead':False,'currentActualPDFPagesViewed':[1,3],'allSevenCurrentPDFBodyPixelsCompared':True,'humanApproval':False,'humanTrial':False,'standaloneVApprovalClaim':False,'activeWrites':0}
dump(OWN/'generation-parameters.json',params)
bundle=read(ROUND/'review-bundle-manifest.json')
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':c['campaignId'],'roundId':c['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':c['bundleFingerprint'],'bookDigest':c['bookDigest'],'provider':'OpenAI Codex','model':'Codex reviewer; exact model identifier not exposed','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':c['promptFingerprint'],'criteriaFingerprint':c['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+sha(OWN/'generation-parameters.json'),'independenceGroupId':c['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':v['role'],'digest':v['digest']} for v in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':started,'completedAt':now(),'status':'completed','outputDigest':'sha256:'+sha(recfile),'toolchainVersion':'goal-description-review-v1'}
runfile=out/(batch['batchId']+'.run.json'); dump(runfile,run)
validator=ISO/'app/scripts/validateGoalDescriptionReviewCampaign.ts'
assert sha(validator)==sha(ROOT/'app/scripts/validateGoalDescriptionReviewCampaign.ts')
cmd=[str(ISO/'app/node_modules/.bin/tsx'),str(validator),'--bundle',str(ROUND/'review-bundle-manifest.json'),'--input',str(ROUND/'description-review-input.json'),'--campaign',str(ROUND/'description-review-campaign.json'),'--run',str(runfile),'--batch-input',str(ROUND/'batches'/(batch['batchId']+'.input.jsonl')),'--records',str(recfile)]
start=now(); p=subprocess.run(cmd,cwd=ISO,capture_output=True,text=True)
(OWN/'native-round-validation.stdout.txt').write_text(p.stdout); (OWN/'native-round-validation.stderr.txt').write_text(p.stderr)
dump(OWN/'own-native-round-validation.actual.json',{'command':cmd,'cwd':str(ISO),'startedAt':start,'completedAt':now(),'exitCode':p.returncode,'stdoutPath':str(OWN/'native-round-validation.stdout.txt').removeprefix(str(ROOT)+'/'),'stdoutSHA256':sha(OWN/'native-round-validation.stdout.txt'),'stderrSHA256':sha(OWN/'native-round-validation.stderr.txt'),'validatorScriptSHA256':sha(validator),'recordsSHA256':sha(recfile),'runSHA256':sha(runfile),'affectedRoundOnly':True,'newScientificClosures':0,'reboundOuterBindings':7,'humanApproval':False,'humanTrial':False,'activeWrites':0})
assert p.returncode==0, p.stdout+p.stderr
verify_freezes()
print(p.stdout)
print('Own A7 current365 binding continuation: KEEP7, new science0, independent native round exit0; active writes0')
