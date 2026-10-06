from pathlib import Path
import hashlib,json,shutil,datetime
ROOT=Path('/home/enpasos/projects/skillpilot');REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-final53-v5-metadata-binding-guard-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
V4=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
V5=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-terminal-applicability-metadata-author-v5'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(p,obj):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
v4freeze=V4/'technical-preparation.final-v4.freeze.json';assert sha(v4freeze)=='737d5389d611b670eef5f3e8fbe2a910caa12ed11e87157bdc0d6ad618c575ab'
f=json.loads(v4freeze.read_text())
for row in f['files']:
 p=ROOT/row['path'];assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes'],p
freeze=V5/'author-terminal-applicability.final.freeze.json';assert sha(freeze)=='cc0065145b47bcbe7393a5cd9490507b06155196e8a22508b223debf6319615d';f=json.loads(freeze.read_text());assert len(f['files'])==3
for row in f['files']:
 p=ROOT/row['path'];assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes']
canon=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');src=V5/'proposed-active-tree'/canon;dst=ISO/canon
assert sha(dst)=='19b5b242d16d3720faeee2719af1851923c82e84fdcb7bc1647f0fe1f825897d'
before=json.loads(dst.read_text());after=json.loads(src.read_text());b={g['id']:g for g in before['goals']};a={g['id']:g for g in after['goals']};changes=[id for id in b if b[id]!=a[id]];assert changes==['4cb74d76-99f1-5264-b1e3-448cda47b005']
id=changes[0];trim=json.loads(json.dumps(a[id]));trim['applicability']=b[id]['applicability'];assert trim==b[id]
assert b[id]['applicability']=={'jurisdiction':['DE-BY','DE-HE']};assert a[id]['applicability']=={'jurisdiction':['DE-HE']}
beforeSHA=sha(dst);shutil.copy2(src,dst)
receipt={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'priorV4FreezeSHA256':sha(v4freeze),'priorV4VerifiedFiles':403,'verifiedV5AuthorFreezeSHA256':sha(freeze),'verifiedV5AuthorFiles':3,'beforeCanonicalSHA256':beforeSHA,'afterCanonicalSHA256':sha(dst),'changedGoalId':id,'changedField':'applicability.jurisdiction','before':['DE-BY','DE-HE'],'after':['DE-HE'],'other478WholeGoalsExact':True,'sameGoalAllOtherFieldsExact':True,'preparedV4InputsModified':False,'nativeCodeModified':False,'classificationLedgerModified':False,'scienceReviewDecision':None,'activeWrites':False,'humanApproval':False}
wr(OWN/'v5-metadata-only-overlay.actual.receipt.json',receipt)
shutil.copy2(dst,OWN/'canonical.final-v5.inactive.json')
for srcName,dstName in [('full-current378-routes-v2.config.json','full-current378-v5.config.json'),('source-atlas359-routes-v2.config.json','source-atlas359-v5.config.json')]:
 cfg=json.loads((V4/srcName).read_text());cfg['outputPath']=str(REL/'native-models'/dstName.replace('.config.json','.book-model.json'))
 for root in [ROOT,ISO]:wr(root/REL/dstName,cfg)
print(json.dumps({'v5MetadataChangedGoalCount':1,'other478Exact':True,'old403FilesStillExact':True,'afterCanonicalSHA256':sha(dst)}))
