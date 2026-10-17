"""Optional technical selector alignment. No review wrappers or report run generated."""
import argparse,datetime,hashlib,json,os,uuid
from pathlib import Path
O=Path(__file__).resolve().parent;J=Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-remediation14-guarded-root-integration-technical-v1');K=J/'capsule'
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads(Path(p).read_text())
ap=argparse.ArgumentParser();ap.add_argument('--apply-root',action='store_true');args=ap.parse_args()
cp=K/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor/central.current439.D113-P439V3.PROSPECTIVE.config.json';assert pin(cp)['sha256']=='ab71b7955ddfedca35dba08afcb9b3e6f05e911d8a8d33904d158b94adb9bf6c';subject=read(cp)['subjects'][0]
active=K/subject['memoryReviewConfigPath'];current=read(active);default=K/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';old=read(default);oldbytes=default.read_bytes();activebytes=active.read_bytes()
fields=['reviewId','landscapeId','landscapePath','ruleVersion','scope','visibilityScopes','visibilityScopeCoverageRequired'];assert all(old.get(f)==current.get(f) for f in fields)
assert len(current['scope']['leafGoalIds'])==506 and len(current['visibilityScopes'])==39
records=K/current['reviewPath'];cards=K/current['cardReviewPath'];guards=[pin(active),pin(records),pin(cards),pin(cp)]
assert len([x for x in records.read_text().splitlines() if x])==439
assert len([x for x in cards.read_text().splitlines() if x])==80
draft=O/'DRAFT.canonical-chemistry-full.exact-current-M439-config.json'
if draft.exists():assert draft.read_bytes()==activebytes
else:draft.write_bytes(activebytes)
before=pin(default);foreign=default.resolve();foreignpin=pin(foreign) if foreign!=default else None
def own_dir(p):
 assert p==K or K in p.parents
 if p==K:return
 own_dir(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);p.unlink();p.mkdir()
  for x in src.iterdir():(p/x.name).symlink_to(x,target_is_directory=x.is_dir())
 else:p.mkdir(exist_ok=True)
if args.apply_root:
 registry=read(K/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');chem=next(x for x in registry['subjects'] if x['subject']=='chemie');assert chem['memoryReviewConfigPath']==subject['memoryReviewConfigPath'],'Apply the reviewed Chem-only global registry first'
 (O/'ARCHIVE.default-M-selector.before-root-apply.exact.json').write_bytes(oldbytes)
 own_dir(default.parent)
 tmp=default.with_name(default.name+'.root-M439-'+uuid.uuid4().hex+'.tmp')
 with tmp.open('xb') as f:f.write(activebytes)
 os.replace(tmp,default) # Break a symlink/hardlink without modifying its source inode.
 assert default.read_bytes()==activebytes
 if foreignpin:assert pin(foreign)==foreignpin
for v in guards:assert pin(v['path'])==v
report=K/current['reportPath'];result={'role':'Optional Root-only default M selector alignment to exact already reviewed M439 inputs; no new review, report or gate run','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootApplied':args.apply_root,'source':pin(active),'previousDefault':before,'draft':pin(draft),'defaultAfter':pin(default),'allDiscoveryGuardFieldsAlreadyEqual':True,'normalPrehookAlreadySelectsActiveRegistryPath':True,'defaultAlignmentRequiredForNormalPrehook':False,'goalReviewRows':439,'cardReviewRows':80,'visibilityScopes':39,'currentReportTarget':str(report),'currentReportExistsNow':report.exists(),'reportGenerationOwner':'Existing npm quality:curriculum-status prehook → runMemoryCardReviewConfigs.ts → discoverActiveMemoryCardReviewConfigs → active M439 report path. No extra report run is needed after the correct global registry is installed.','scientificInputsUnchanged':guards,'newReviewWrappers':0,'newScientificVotes':0,'mainChanged':False}
p=O/('RECEIPT.root-default-M439-selector-aligned.json' if args.apply_root else 'PLAN.default-M439-selector-alignment.readonly.json');assert not p.exists();p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(pin(p)))
