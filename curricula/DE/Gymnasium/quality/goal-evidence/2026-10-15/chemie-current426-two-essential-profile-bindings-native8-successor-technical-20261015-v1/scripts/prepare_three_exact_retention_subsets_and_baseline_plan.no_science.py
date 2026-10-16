# SPDX-License-Identifier: Apache-2.0
"""Bytegleiche sechs Retentionszeilen und rein mechanischer Baseline-Owner-Plan."""
from pathlib import Path
import copy,hashlib,json,jsonschema
R=Path.cwd();O=Path(__file__).resolve().parents[1]
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
prep=load(O/'PREPARED.exact-eight-essential-field-delta-and-new-host.awaiting-genuine-P2.json');base=load(R/prep['baseTechnicalSelector']['path']);recipe=load(R/base['rootReuseRecipesNotExecuted']['path']);oldbook=load(R/base['neutralFinalNative8']['path']);goals=oldbook['goalIds'];replacement={'1d2e7b80-653d-57b8-a284-8ede5a353b73','b47d542d-c2d7-5554-95dc-10b47ab622ab'};bcfg=load(R/base['positiveGoalEvidenceConfigPaths'][0]);pcfg=load(R/base['P2Config']['path']);cfg077ref=recipe['oneRootOwnedCentralAfterGenuineDResolution']['normalCurrentSelection']['existingP077TransportConfig'];cfg077=load(R/cfg077ref['path']);schema=load(R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json');validator=jsonschema.Draft202012Validator(schema,format_checker=jsonschema.FormatChecker())
def select_manifests(cfg,records):
 ids={i for r in records for i in r['reviewRunIds']};keep=[];drop=[]
 for path in cfg.get('reviewRunManifestPaths',[]):
  manifest=load(R/path)
  (keep if manifest['runId'] in ids else drop).append(path)
 assert ids=={load(R/p)['runId'] for p in keep}
 return keep,drop
retentions=[]
for label,cfg,source,keep in [('P4-original-P5-without-b47',bcfg,base['P5Records'],set(bcfg['scope']['goalIds'])-replacement),('P1-original-neighbor-e9',pcfg,base['P2Records'],{'e9d34f34-2a43-5cc7-bcca-1d08e057531d'}),('P1-original-current077',cfg077,base['P077ExactCurrentOriginalRecord'],{'0773a104-aaeb-5e96-a615-2a2bec3eb096'})]:
 original=R/source['path'];selected=[line for line in original.read_bytes().splitlines(keepends=True) if json.loads(line)['goalId'] in keep];records=[json.loads(l) for l in selected];assert {r['goalId'] for r in records}==keep and len(records)==len(keep);rp=O/('retentions/'+label+'.byte-exact-original-lines.jsonl');rp.parent.mkdir(exist_ok=True);assert not rp.exists();rp.write_bytes(b''.join(selected));new=copy.deepcopy(cfg);new['reviewPath']=rp.relative_to(R).as_posix();new['scope']={'label':'Bytegleiche ursprüngliche Teilmenge für eindeutige aktuelle P-Eigentümerschaft: '+label,'goalIds':[r['goalId'] for r in records]};kept,dropped=select_manifests(cfg,records)
 if 'reviewRunManifestPaths' in new:new['reviewRunManifestPaths']=kept
 cp=O/('config/'+label+'.retained-original-review-id.config.json');put(cp,new);validator.validate(new);assert all(r['reviewId']==new['reviewId'] for r in records)
 retentions.append({'label':label,'sourceWholeRecords':source,'retainedRecords':ref(rp),'config':ref(cp),'goalIds':new['scope']['goalIds'],'recordLinesByteExact':True,'originalReviewId':new['reviewId'],'retainedOriginalRunManifests':[ref(R/p) for p in kept],'omittedUnreferencedManifestPaths':dropped,'originalManifestBytesAndWholeGoalIdsUnchanged':True})
assert sum(len(r['goalIds']) for r in retentions)==len({g for r in retentions for g in r['goalIds']})==6;assert {g for r in retentions for g in r['goalIds']}==set(goals)-replacement
baseline_ref=recipe['oneRootOwnedCentralAfterGenuineDResolution']['baselineConfigForAddressAndHistoricalSelection'];central=load(R/baseline_ref['path']);subject=next(s for s in central['subjects'] if s['subject']=='chemie');plans=[];owners={}
for path in subject['positiveEvidenceConfigPaths']:
 cfg=load(R/path);scope=set(cfg['scope']['goalIds']);removed=scope&set(goals);retained=scope-set(goals);records=[json.loads(l) for l in (R/cfg['reviewPath']).read_text().splitlines() if l.strip()];kept=[r for r in records if r['goalId'] in retained];manifests,omitted=select_manifests(cfg,kept)
 assert {r['goalId'] for r in kept}==retained
 for g in scope:owners.setdefault(g,[]).append(path)
 plans.append({'originalConfig':ref(R/path),'originalRecords':ref(R/cfg['reviewPath']),'action':'pass-through-unchanged' if not removed else ('omit-empty-scope' if not retained else 'new-retention-config-and-byte-exact-rest-lines-required'),'removedForCurrentEightOwnerSelection':sorted(removed),'retainedGoalIds':[g for g in cfg['scope']['goalIds'] if g in retained],'originalReviewIdMustRemain':cfg['reviewId'],'retainedOriginalRunManifests':[ref(R/p) for p in manifests],'omitUnreferencedManifests':omitted,'originalManifestBytesAndGoalIdsMustRemain':True})
put(O/'PREPARED.three-byte-exact-retentions-and-baseline-owner-partition.awaiting-P2.json',{'schemaVersion':1,'role':'Reine Retentions-/Besitzvorbereitung; keine neue P-Wissenschaft oder zentrale Ausführung','threeExactRetentions':retentions,'unchangedOriginalNormalRecords':6,'newP2OwnerGoalIds':sorted(replacement),'newP2NormalRecordsCreated':0,'finalBookGoalIds':goals,'allRetainedAndReplacementOwnerIdsUnique':True,'baselineConfig':baseline_ref,'actualBaselinePConfigCount':len(plans),'baselineRetentionPlan':plans,'baselineExistingOwnerCollisions':[{'goalId':g,'configs':v} for g,v in owners.items() if len(v)>1],'laterBaselineRetentionWrites':0,'finalGlobalOwnerAuditScript':ref(O/'scripts/audit_P_scope_owners_before_Root_Central.read_only.py'),'rootMustMergeOtherParallelAcceptedSelectionsBeforeGlobal426OwnerAudit':True,'oldConfigOrRecordWrites':0,'oldManifestWrites':0,'newRunIdentities':0,'newScienceVotes':0,'newStockChecks':0,'newModelCalls':0,'nativeRenders':0,'centralRuns':0,'awaitingAcceptedP2':True})
print(json.dumps({'retentionGroups':[len(r['goalIds']) for r in retentions],'unchangedOriginalNormalRows':6,'actualBaselinePConfigs':len(plans),'baselineRetentionsNeedingNewCopies':sum(p['action']=='new-retention-config-and-byte-exact-rest-lines-required' for p in plans),'normalNewP2':0,'modelCalls':0,'renders':0},ensure_ascii=False))
