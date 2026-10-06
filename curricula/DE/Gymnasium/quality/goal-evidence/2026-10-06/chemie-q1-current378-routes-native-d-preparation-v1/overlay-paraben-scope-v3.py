from pathlib import Path
import hashlib,json,shutil,datetime
ROOT=Path('/home/enpasos/projects/skillpilot');REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
V3=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-paraben-use-scope-author-remediation-v3'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
freeze=V3/'author-paraben-scope.final.freeze.json';assert sha(freeze)=='e01b6f6c00a38e4323bc842d24681a8394fce4738f3a64d3928e808ebc937a09'
f=json.loads(freeze.read_text());assert len(f['files'])==3
for row in f['files']:
 p=V3/row['path'];assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes']
canon=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');src=V3/'proposed-active-tree'/canon;dst=ISO/canon
before=json.loads(dst.read_text());after=json.loads(src.read_text());b={g['id']:g for g in before['goals']};a={g['id']:g for g in after['goals']};changes=[id for id in b if b[id]!=a[id]];assert changes==['0d59b62e-d3f9-5969-b961-0c5e26316c04']
id=changes[0];trim=json.loads(json.dumps(a[id]));assert trim['extendedData'].pop('applicabilityMappingInheritance')=='boundary';assert trim==b[id]
beforeSha=sha(dst);shutil.copy2(src,dst)
receipt={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verifiedV3FreezeSHA256':sha(freeze),'verifiedV3Files':3,'beforeCanonicalSHA256':beforeSha,'afterCanonicalSHA256':sha(dst),'changedGoalIds':changes,'changedField':'extendedData.applicabilityMappingInheritance','beforeValue':None,'afterValue':'boundary','other478WholeGoalsExact':True,'sameGoalAllOtherFieldsExact':True,'activeWrites':False,'nativeCompilerChanged':False,'scienceReviewDecision':None}
(OWN/'paraben-scope-v3-overlay.actual.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
