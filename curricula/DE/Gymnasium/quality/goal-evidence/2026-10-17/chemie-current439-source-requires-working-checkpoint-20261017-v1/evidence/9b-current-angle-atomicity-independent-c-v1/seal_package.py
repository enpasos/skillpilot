from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import json,os
O=Path(__file__).resolve().parent
C=O/'capsule';F=Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule')
R=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-9b-current-angle-atomicity-independent-c-v1')
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def write(name,value):
 p=O/name;assert not p.exists();text=json.dumps(value,ensure_ascii=False,indent=2)+'\n';json.loads(text);p.write_text(text)
first=read(O/'FIRST.semantic-decision.independent-c.json');firstseal=read(O/'SEAL.FIRST.semantic-decision.sha256.json');prep=read(O/'PREPARATION.post-FIRST.fresh-A1-and-exact-rest24.json')
for item in firstseal['files']:assert pin(Path(item['path']))==item
for item in prep['sourcePins']:
 actual=pin(Path(item['path']));assert actual['sha256']==item['sha256'].removeprefix('sha256:');assert actual['bytes']==item['bytes']
checks=[]
for role,n in [('retained24',24),('new1',1)]:
 e=read(O/(role+'.stock-check.execution.json'));assert e['exitCode']==0 and e['allInputsUnchanged'];text=(O/(role+'.stock-check.stdout.txt')).read_text()
 for target in [f'Content leaf goals in scope: {n}',f'Current reviewed atomic: {n}','Missing review records: 0','Stale review records: 0','Obsolete review records: 0','Current needs developer review: 0','Current non-atomic: 0']:assert target in text
 checks.append({'role':role,'scopeCount':n,'currentAtomic':n,'missing':0,'stale':0,'obsolete':0,'needsDeveloperReview':0,'nonAtomic':0,'exitCode':e['exitCode'],'elapsedSeconds':e['elapsedSeconds'],'executionPin':pin(O/(role+'.stock-check.execution.json')),'stdoutPin':pin(O/(role+'.stock-check.stdout.txt')),'stderrPin':pin(O/(role+'.stock-check.stderr.txt'))})
links=[];physical=[]
for root,dirs,files in os.walk(C,followlinks=False):
 for name in dirs+files:
  p=Path(root)/name
  if p.is_symlink():
   target=os.readlink(p);assert target.startswith(str(F)+'/');links.append({'path':str(p),'target':target,'resolvedTarget':str(p.resolve()),'usedReadOnly':True})
  elif p.is_file():
   assert p.is_relative_to(C/R);physical.append(pin(p))
write('CAPSULE.layout.readonly-source-links-and-own-physical-files.json',{'schemaVersion':1,'sourceRoot':str(F),'physicalCapsule':str(C),'newReviewRoot':str(C/R),'sourceLinks':links,'ownPhysicalFiles':physical,'stockMode':'check','sourcePermissionChanges':False,'sourceFilesWritten':False})
summary={'schemaVersion':1,'status':'INDEPENDENT_AI_ATOMIC_CURRENT_A1_AND_EXACT_REST24_STOCK_CHECKS_PASS','goalId':first['goalId'],'independentSemanticDecision':'atomic','reviewAuthority':'ai_candidate','human':False,'humanApprovalClaim':False,'firstSealedBeforeOldAInputsAndFingerprint':True,'firstPin':pin(O/'FIRST.semantic-decision.independent-c.json'),'firstSealPin':pin(O/'SEAL.FIRST.semantic-decision.sha256.json'),'newReviewId':first['reviewId'],'freshCurrent9bFingerprint':prep['current9bFingerprint'],'oldFingerprintNotCopied':prep['old9bFingerprintNotCopied'],'rest24Sha256':prep['rest24Pin']['sha256'],'rest24WholeOriginalLinesExact':True,'old24ReviewIdentityAndFingerprintsExact':True,'original25Unchanged':True,'configPaths':[x['relativePath'] for x in prep['configs']],'checks':checks,'fullCentralCompilerPdfRun':False,'applied':False,'newIndependentScienceVotes':1,'newHumanVotes':0,'M7Claim':False,'sourceInputsRecheckedUnchanged':True,'packagingDigestPrefixAssertionFailurePreserved':True,'scienceAndChecksRerun':False}
write('SUMMARY.independent-c.current-A1-and-rest24-checks.json',summary)
readme='''# Current 9b atomicity: independent C

Independent semantic result: **atomic**, AI candidate, human=false. The FIRST decision was written and sealed before reading the old A ledger/config or computing a current semantic fingerprint. Inputs were exactly the current whole 9b goal, whole 67 prerequisite goal, and complete current 9b P line, plus AGENTS §7.1. The mandated whole P line contains references to earlier work; none of those referenced judgments was opened or treated as authority.

The assessed single performance is a qualified EPA bond-angle explanation for supplied molecular shapes/electron domains. Assigning an ideal angle, explaining a qualitative lone-pair deviation, and limiting the claim against an exact measured angle concern the same angle claim. Deriving molecular geometry from Lewis representations stays in prerequisite 67. DE/EN and the complete P profile retain that separation. No separate measurement-uncertainty calculation or experimental design task is required. The older broad image-link caption is recorded in FIRST; this atomicity decision grants no image approval.

After sealing FIRST, a fresh one-goal A row and a new review ID were created. The exact stock fingerprint helper body was used only as the later technical anchor; the actual unmodified stock check independently confirms freshness. Current fingerprint: `'''+prep['current9bFingerprint']+'''`.

The old 25-line file remains unchanged. Removing only the complete 9b line yields exactly 24 original whole lines, in original order, with unchanged review identity, fingerprints and judgments. Rest24 SHA-256: `638f423ba2060eda5952d150f95b87fdaef2959fcee9220f3dcb82988f394521`.

The thin physical check capsule contains the new 24+1 configs and ledgers under a new E17 path. Its other source entries are symlinks used only for reading; shared permissions were not changed. The unmodified stock `semanticAtomicityReview.ts` was executed separately with `--mode=check` for each scope, preserving symlink paths so the module resolves the physical capsule as repo root.

| Scope | Current atomic | Missing | Stale | Obsolete | Actual exit |
| --- | ---: | ---: | ---: | ---: | ---: |
| Exact retained24 | 24/24 | 0 | 0 | 0 | 0 |
| New independent 9b | 1/1 | 0 | 0 | 0 | 0 |

Each scope ran once. Actual timings, exact commands, source/config/ledger/canonical pins before and after, and unchanged inputs are recorded in the two execution JSON files. Raw stdout/stderr are `.txt`. Every written JSON/JSONL file was parsed before sealing.

The initial final-packaging command failed on a digest-prefix comparison before writing packaging outputs. The failure is retained in `SEAL-attempt1.tooling-failure.txt`; only that packaging comparison was corrected. No semantic decision or stock check was rerun.

The scientific decision is an independent AI atomicity candidate. The old rest24 is technical retention, not 24 new reviews. No central run, compiler, PDF, activation, M7 claim, human approval, or runtime/client acceptance is asserted. Main, F and other capsules were not edited.
'''
p=O/'README.independent-current-9b-and-exact-rest24.md';assert not p.exists();p.write_text(readme)
files=[]
for root,dirs,names in os.walk(O,followlinks=False):
 for name in names:
  p=Path(root)/name
  if p.is_symlink():continue
  if p.suffix=='.json':json.loads(p.read_text());assert p.read_bytes().endswith(b'\n')
  if p.suffix=='.jsonl':
   assert p.read_bytes().endswith(b'\n')
   for line in p.read_text().splitlines():json.loads(line)
  files.append(p)
seal={'schemaVersion':1,'role':'Independent semantic FIRST plus post-FIRST A1/current-anchor and exact retained24 technical stock checks','sealedAt':datetime.now(timezone.utc).isoformat(),'files':[pin(p) for p in sorted(files)],'human':False,'applied':False}
write('SEAL.independent-c.complete.sha256.json',seal)
selector={'schemaVersion':1,'role':'Independent current 9b semantic atomicity and separate stock24+1 checks','summary':summary,'physicalCapsule':str(C),'newReviewRoot':str(C/R),'seal':pin(O/'SEAL.independent-c.complete.sha256.json'),'first':pin(O/'FIRST.semantic-decision.independent-c.json'),'outputs':[pin(p) for p in sorted(files)],'applied':False}
write('SELECTOR.independent-c.current-A1-rest24.sealed.json',selector)
for p in seal['files']:assert pin(Path(p['path']))==p
print(json.dumps({'selector':pin(O/'SELECTOR.independent-c.current-A1-rest24.sealed.json'),'seal':pin(O/'SEAL.independent-c.complete.sha256.json'),'first':selector['first'],'configs':summary['configPaths'],'checks':checks,'sourceLinkCount':len(links),'ownCapsuleFileCount':len(physical)},indent=2))
