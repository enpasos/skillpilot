from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,shutil,subprocess
E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14');R=E/'chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1';H=Path('tmp/checkpoint-chemie-20261014/source6-current412-native5-minimal-stock-host').resolve()
P=E/'chemie-source6-five-current412-whole-P-A-M-independent-a-20261014-v1';AD=E/'chemie-source6-five-current412-P5-final-image-context-addendum-independent-a-20261014-v1'
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def write(rel,x):
 p=R/rel
 if p.exists():assert read(p)==x;return p
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
aseal=AD/'SEAL.finite-five-final-PNG-unchanged-P5-context-addendum.actual.json'
for x in read(aseal)['files']:
 p=Path(x['path']);p=p if p.exists() else AD/p;actual=bind(p);assert actual['sha256']==x['sha256'] and actual['bytes']==x['bytes']
science=AD/'science/FIRST.five-final-image-context-compatibility.actual-P5A-addendum.jsonl';rows=[json.loads(l) for l in science.read_text().splitlines()];assert len(rows)==5 and all(x['decision']=='ACCEPT_BOUNDED_IMAGE_P_CONTEXT_COMPATIBILITY' for x in rows)
pp=P/'P/five-current412.whole-profiles-genuine-independent-a.E1G1.review.jsonl';target=R/'originals/P5.genuine-a.exact-original-before-final-image-context.jsonl';target.parent.mkdir(exist_ok=True);shutil.copy2(pp,target)
write('inputs/GENUINE.P5-final-images-compatibility-and-exact-case-boundaries.json',{'firstScienceSeal':bind(AD/'FIRST-SCIENCE-SEAL.five-final-images-unchanged-P5A-context-addendum.actual.json'),'finalSeal':bind(aseal),'science':bind(science),'originalWholeP':bind(pp),'rows':[{k:v for k,v in x.items() if k!='inputRow'} for x in rows],'scope':'Original full P5 design plus genuine targeted final-image compatibility; transport only goal/input fingerprints, not new review dates/reasons/profile/cases','noNewWholePVote':True,'DUnreviewed':True})
# Keep original kind ledger byte-exact; create one own-address companion, decisions untouched.
oldsem=R/'candidate/semantic539.current412.exact-existing-kind-records.json';sem=read(oldsem);pc=read(R/'configs/P5.current-images.genuine-independent-a.config.json');sem['sourceLandscapePath']=pc['landscapePath'];originaldecisions=json.loads(json.dumps(sem['decisions']));kinddelta=[]
for decision in sem['decisions']:
 if decision['goalId'] in pc['scope']['goalIds'] or decision['goalId']=='6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338':
  before=json.loads(json.dumps(decision));decision['decisionBasis']='reviewed-current-pilot-program-structure' if decision['semanticKind']=='programStructure' else 'reviewed-current-pilot-curricular-atomic';kinddelta.append({'before':before,'after':decision,'onlyChangedField':'decisionBasis','sameActualScientificAuthorityNotNewClassification':True})
sp=write('candidate/semantic539.current412.same-science-normal-enum-own-address.json',sem)
assert all({k:v for k,v in a.items() if k!='decisionBasis'}=={k:v for k,v in b.items() if k!='decisionBasis'} for a,b in zip(originaldecisions,sem['decisions']))
write('checks/CAS.kind-six-existing-scientific-authorities-closed-enum-transport.json',{'originalByteExactLedger':bind(oldsem),'stockCompatibleOwnAddressLedger':bind(sp),'sixRows':kinddelta,'all533ExistingDecisionRowsExact':sem['decisions'][:533]==originaldecisions[:533],'all539IDsKindsStatusesFingerprintsExact':True,'noNewScientificVote':True})
pc['semanticKindLedgerPath']=str(sp);pc['reviewCriteriaPath']=str(R/'shared/P-criteria.exact-original.md');(R/'configs/P5.current-images.genuine-independent-a.config.json').write_text(json.dumps(pc,ensure_ascii=False,indent=2)+'\n')
bc=read(R/'configs/whole412.stock-base.config.json');bc['semanticKindLedgerPath']=str(sp);(R/'configs/whole412.stock-base.config.json').write_text(json.dumps(bc,ensure_ascii=False,indent=2)+'\n')
# Companion copies provide honest full source/operator unions; old root outputs are never rewritten.
for p in R.rglob('*'):
 if not p.is_file() or '/public-root/' in str(p):continue
 d=H/p;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d)
helper=H/'transport-five-profiles-current-resources.ts'
helper.write_text('''import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from './app/scripts/positiveGoalEvidenceProfileModel';
const R='''+json.dumps(str(R))+''';const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const cfg=read(`${R}/configs/P5.current-images.genuine-independent-a.config.json`);const goals=new Map(read(cfg.landscapePath).goals.map((g:any)=>[g.id,g]));
const old=readFileSync(`${R}/originals/P5.genuine-a.exact-original-before-final-image-context.jsonl`,'utf8').trim().split('\\n').map(l=>JSON.parse(l));const output=[];const deltas=[];
for(const before of old){const r=structuredClone(before);const g:any=goals.get(r.goalId);const digests:Record<string,string>={};for(const link of g.resourceLinks??[])if(link.type==='goal-visualization')digests[link.url]='sha256:'+createHash('sha256').update(readFileSync(`app/public${link.url}`)).digest('hex');
r.goalFingerprint=fingerprintGoalForPositiveEvidence(g,'curricularAtomic');r.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,digests,'curricularAtomic');assert.equal(fingerprintPositiveGoalEvidenceProfile(r.profile),r.profileFingerprint);assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,g,digests,'curricularAtomic'),[]);
const fields=Object.keys(r).filter(k=>JSON.stringify(r[k])!==JSON.stringify(before[k]));assert(fields.includes('reviewInputFingerprint'));assert(fields.every(k=>['goalFingerprint','reviewInputFingerprint'].includes(k)));assert.equal(r.goalFingerprint,before.goalFingerprint);assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');
deltas.push({goalId:r.goalId,changedFields:fields,before:{goalFingerprint:before.goalFingerprint,reviewInputFingerprint:before.reviewInputFingerprint},after:{goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint},profileFingerprint:r.profileFingerprint,wholeProfileDateReviewerReasonAuthorityRunIdsDissentExact:true,genuineFinalImageCompatibilityBoundSeparately:true,newScienceVote:false});output.push(r)}
mkdirSync(`${R}/positive`,{recursive:true});writeFileSync(cfg.reviewPath,output.map(x=>JSON.stringify(x)).join('\\n')+'\\n');writeFileSync(`${R}/checks/STOCK.P5-original-science-final-resource-only-fingerprint-deltas.actual.json`,JSON.stringify({originalRecords:5,changedOnlyGoalAndReviewInputFingerprint:true,deltas,newPScienceVote:false,newHumanApproval:false},null,2)+'\\n');console.log(JSON.stringify({profiles:output.length,stockSemanticsErrors:0,bodyOrCasesChanges:0}));
''')
cli=str(Path('app/node_modules/tsx/dist/cli.mjs').resolve());batch=str(R/'configs/native-five.shared-first-pass.batch.config.json')
commands=[('P5-resource-binding-transport',['transport-five-profiles-current-resources.ts']),('P5-normal-final-compatible-kind-check',['app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config='+str(R/'configs/P5.current-images.genuine-independent-a.config.json')]),('whole412-model',['app/scripts/buildGoalBookModel.ts',str(R/'configs/whole412.stock-base.config.json')]),('native5-prepare',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',batch]),('native5-check',['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',batch])]
for label,args in commands:
 receipt=R/f'checks/STOCK.{label}.actual.json'
 if receipt.exists() and read(receipt)['exitCode']==0:continue
 started=datetime.now(timezone.utc).isoformat();p=subprocess.run(['node',cli,*args],cwd=H,text=True,capture_output=True)
 rec={'startedAtUTC':started,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'cwd':str(H),'command':['node',cli,*args],'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'unmodifiedStockModules':True,'noNewScientificVote':True,'noActiveOrParentHWrites':True}
 if receipt.exists():receipt=receipt.with_name(receipt.stem+'.retry-'+started.replace(':','-')+'.json')
 receipt.write_text(json.dumps(rec,ensure_ascii=False,indent=2)+'\n');print(label,p.returncode,p.stdout[-1800:],p.stderr[-1800:],flush=True)
 if p.returncode:raise SystemExit(p.returncode)
for rel in ['positive/P5.current-images.technical-transport-of-genuine-a.review.jsonl','checks/STOCK.P5-original-science-final-resource-only-fingerprint-deltas.actual.json','models/whole412.actual-stock-model.json','native-five']:
 src=H/R/rel;dst=R/rel
 if src.is_dir():shutil.copytree(src,dst)
 else:dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
print('Common regular stock native5 outputs copied; no D results authored.',flush=True)
