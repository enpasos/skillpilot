# SPDX-License-Identifier: Apache-2.0
"""Pin final source/text/image/QA inputs and prepare contracts; no renderer here."""
import hashlib,json,shutil
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']);return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
sel=E/'chemie-equilibrium-kpkc-pourbaix-two-wording-current422-informed-P2-A2-M2-V2-20261015-v1/SELECTION.final-current-Kp-Pourbaix-informed-P2-A2-M2-V2.json';assert ref(sel)['sha256']=='sha256:3a9a99865399b1d5ba938b0cd8f0188a5d0ec0093435f68972fdc3350fb17397'
c=load(sel);seal=REPO/c['finalSealPath'];assert ref(seal)['sha256']=='sha256:a9a49247611c57f632f143ac1f2a860017411d9cc7420bfea52165e37cf7e144'
for row in load(seal)['files']:verify(row)
plan=load(OWN/'checks/INPUTS.no-render-stock-context.plan.technical.json');base=load(verify(plan['base367Selector']));basemap=load(verify(base['finalExactRebuildMap']))
plan['baseAssets']=plan['assets'];plan['assets']=[dict(r) for r in plan['assets']]
plan['canonical']=c['finalCanonical'];plan['semantic']=c['finalSemanticSourceIdentities'];verify(plan['canonical']);verify(plan['semantic'])
plan['finalQA']=c['V2']['wholeQA438Candidate'];verify(plan['finalQA']);assert plan['finalQA']['sha256']=='sha256:c9cc9c5c3329cdbedd7e001bf52502159700f287a96c30850356dcd3c8927fb3'
plan['baseQA']=next(r['physicalRepositorySource'] for r in basemap['aliases'] if r['normalHostAlias'].endswith('chemie.qa.json'))
imgsel=E/'chemie-kp-one-mobile-standard-state-image-correction-author-root-20261015-v1/NEUTRAL.one-actual-Kp-PNG-image-only-author.selector.json';i=load(imgsel)
canon=load(verify(plan['canonical']));by={g['id']:g for g in canon['goals']};gid=i['goalId'];row=next(r for r in plan['assets'] if r['goalId']==gid);link=next(l for l in by[gid]['resourceLinks'] if l['type']=='goal-visualization')
row.update(physicalRepositorySource=i['image'],normalCanonicalDestination='curricula/DE/Gymnasium/visualizations/'+link['url'].split('/assets/goal-visualizations/',1)[1],normalPublicDestination='app/public'+link['url'])
plan.update(role='Final real source/image/QA ready no-render comparison and Native4 contract inputs; no science claims',finalQAReady=True,genuineCSelectorTechnicalOnly=ref(sel),genuineCSealTechnicalOnly=ref(seal),stockDGoalIds=plan['targetGoalIds'])
host=REPO/plan['host'];dest=host/row['normalPublicDestination'];dest.parent.mkdir(parents=True,exist_ok=True)
assert not dest.exists();dest.symlink_to(verify(i['image']))
for name in ['prospective-wording.selected-records.raw-technical.jsonl','prospective-raw-D4.selected-records.raw-technical.jsonl','four-current-raw-E0G0.stock-bound.neutral.jsonl']:
 p=OWN/'profiles'/name
 if p.exists():
  q=p.with_name(p.name+'.prior-invalid-resource-url-key-v1');assert not q.exists();p.rename(q)
put(OWN/'checks/INPUTS.no-render-stock-context.final-QA-ready.plan.technical.json',plan)
basecfg=load(E/'chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2/config/whole422.normal-stock-base.config.json')
batchid='chemie-equilibrium-four-source-scope-current422-native4-20261015-v1'
basecfg.update(bookId=batchid,title='Chemie – vier Modell- und Quellenkontexte',evidenceReviewPaths=[(OWN/'profiles/four-current-raw-E0G0.stock-bound.neutral.jsonl').relative_to(REPO).as_posix()],outputPath=(OWN/'diagnostic/NEVER-WRITTEN.full422-model.json').relative_to(REPO).as_posix())
basepath=OWN/'config/whole422.final-native4.normal-stock-base.config.json';put(basepath,basecfg)
cfg={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':batchid,'subject':'chemie','subjectLabel':'Chemie','bookId':batchid,'title':'Chemie – vier Modell- und Quellenkontexte','baseGoalBookConfigPath':basepath.relative_to(REPO).as_posix(),'goalIds':plan['targetGoalIds'],'outputDirectory':(OWN/'native-four').relative_to(REPO).as_posix(),'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','printDerivativeProfile':'bounded-atlas'}
put(OWN/'config/native4.final-once.normal-prepare.config.json',cfg)
put(OWN/'checks/READY.final-text-image-raw-source-and-QA-technical.json',{'role':'Final physical C QA readiness and unchanged science source allowlist; no C judgments selected as scientific input','finalCanonical':plan['canonical'],'finalSemantic':plan['semantic'],'finalQA':plan['finalQA'],'sourceOnlySelector':ref(OWN/'NEUTRAL.preliminary-source-only-four-final-a142-c443-complete-union-partners.v2.selector.json'),'genuineCSelectorAndSealTechnicalOnly':[ref(sel),ref(seal)],'nativeConfig':ref(OWN/'config/native4.final-once.normal-prepare.config.json'),'stockPrepareRunsSoFar':0,'authorizedMaximumPrepareRuns':1,'authorizedMaximumCheckRuns':1,'sourceMapOrCourseRegistrationApplied':False,'activeWrites':0})
print(json.dumps({'finalCanonical':plan['canonical']['sha256'],'finalQA':plan['finalQA']['sha256'],'prepareRuns':0,'contractsReady':True}))
