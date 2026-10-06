#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind existing Root-reviewed P2/A2/M2/V2; this is no new scientific review."""
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
PREP=OWN.parent/'biologie-q1-bacterial-structure-fission-native-candidate-v1';B=OWN.parent/'biologie-q1-bacterial-structure-fission-current-independent-d-b-v1'
ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
science=read(B/'independent-p-a-m-v-scientific-decisions.json');rows={x['goalId']:x for x in science['rows']};assert len(rows)==2 and science['openFindings']==[]
positive=read(B/'positive-evidence.independently-reviewed.candidates.json');author=read(PREP/'positive-evidence.candidates.json');assert {x['goalId']:x['profile'] for x in positive['goals']}=={x['goalId']:x['profile'] for x in author['goals']}
shutil.copy2(B/'positive-evidence.independently-reviewed.candidates.json',OWN/'positive-evidence.candidates.json')
pc=read(PREP/'positive.validation-only.config.json');pc.update(reviewId=positive['reviewId'],reviewPath=str(REL/'positive-evidence.review.jsonl'));pc['scope']['label']='Two actual Root independently reviewed current machine candidates; E1/G1 needs human review';write(OWN/'positive-evidence.config.json',pc)
proof=[]
for lane,reasonkey in [('atomicity','atomicityReason'),('memory','memoryReason')]:
 cfg=read(PREP/f'full-{lane}.candidate.config.json');lines=(ROOT/cfg['reviewPath']).read_text().splitlines(keepends=True);before=[json.loads(x) for x in lines];changed=[]
 for i,line in enumerate(lines):
  row=json.loads(line);gid=row['goalId']
  if gid not in rows:continue
  expected=rows[gid]
  assert expected['positiveDecision']=='PASS' and expected['atomicityDecision']=='atomic' and expected['memoryDecision']=='no_memory_needed'
  row.update(reason=expected[reasonkey],reviewedAt=science['reviewedAt'],reviewer=science['reviewer'])
  lines[i]=json.dumps(row,ensure_ascii=False,separators=(',',':'))+'\n';changed.append(gid)
 assert set(changed)==set(rows)
 dest=OWN/f'full-{lane}.review.jsonl';dest.write_text(''.join(lines));cfg['reviewPath']=str(dest.relative_to(ROOT));cfg['reportPath']=str(REL/f'full-{lane}.report.md')
 if cfg.get('cardReviewPath'):
  cards=ROOT/cfg['cardReviewPath'];shutil.copy2(cards,OWN/'full-memory.cards.review.jsonl');cfg['cardReviewPath']=str(REL/'full-memory.cards.review.jsonl')
 write(OWN/f'full-{lane}.config.json',cfg)
 aft=[json.loads(x) for x in dest.read_text().splitlines()];assert len(before)==len(aft)==365 and all(a==b for a,b in zip(before,aft) if a['goalId'] not in rows)
 proof.append({'lane':lane,'wholeLedgerRows':365,'exactUnchangedRows':363,'onlyTwoAlreadyReviewedScientificReasonsAndReviewerMetadataImported':changed,'fingerprintsChangedByThisStep':0})
qrel='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json';q=read(ISO/qrel);old=copy.deepcopy(q)
model=read(OWN/'native-finalbook/bundle/book-model.json');pages={p['goalId']:p for p in model['pages']};canonical=read(ISO/pc['landscapePath']);goals={g['id']:g for g in canonical['goals']}
assets=[]
for row in q['records']:
 if row['goalId'] not in rows:continue
 d=rows[row['goalId']];page=pages[row['goalId']];goal=goals[row['goalId']];link=next(x for x in goal['resourceLinks'] if x['type']=='goal-visualization' and x['role']=='primary')
 assert page['goalFingerprint']==d['currentGoalFingerprint'] and page['pageFingerprint']==d['currentPageFingerprint']
 assert row['assetSha256']==d['actualPixelSHA256'] and link['altText']==d['actualAltText']
 paths=[row['canonicalAssetPath'],row['publicAssetPath'],'backend/src/main/resources/static'+link['url']]
 for path in paths:assert 'sha256:'+sha(ISO/path)==d['actualPixelSHA256']
 assert row['humanApproved']=='no' and not d['humanApproved']
 row.update(aiApproved='yes',aiApprovedAssetSha256=d['actualPixelSHA256'],aiReviewedAt=science['reviewedAt'],aiReviewer=science['reviewer'],aiNotes=d['visualReason'],umlautsCorrectChatGpt='yes',contentApprovedChatGpt='yes',chatGptReviewedAt=science['reviewedAt'],chatGptReviewer=science['reviewer'],chatGptNotes=d['visualReason'])
 assets.append({'goalId':row['goalId'],'actualPixelSHA256':d['actualPixelSHA256'],'currentAltTextExactlyRootReviewed':True,'sourceFrontendBackendCopiesVerified':paths,'existingIndependentMachineDecisionImportedOnly':True,'newScienceReview':False,'humanApproval':False})
assert len(assets)==2
assert all(a==b for a,b in zip(old['records'],q['records']) if a['goalId'] not in rows)
assert not (ISO/qrel).is_symlink();write(ISO/qrel,q);write(OWN/'qa-before-native-normalization.snapshot.json',q)
write(OWN/'existing-root-science-current-bindings.actual.json',{'existingScienceSourcePath':str((B/'independent-p-a-m-v-scientific-decisions.json').relative_to(ROOT)),'existingScienceSourceSHA256':sha(B/'independent-p-a-m-v-scientific-decisions.json'),'existingRootPInnerProfilesExact':True,'fullAMLedgerProof':proof,'actualV2Bindings':assets,'allOther363QARecordsExact':True,'allHumanFieldsPreserved':True,'newScienceReviewClaims':0,'activeWrites':0})
shutil.copytree(OWN,ISO/REL,dirs_exist_ok=True)
terminal=[]
def run(name,cmd):
 start=datetime.now(timezone.utc).isoformat();p=subprocess.run(cmd,cwd=ISO,capture_output=True);o=OWN/(name+'.stdout.txt');e=OWN/(name+'.stderr.txt');o.write_bytes(p.stdout);e.write_bytes(p.stderr);terminal.append({'command':cmd,'cwd':str(ISO),'startedAt':start,'completedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':p.returncode,'stdoutPath':str(o.relative_to(ROOT)),'stdoutSHA256':sha(o),'stderrPath':str(e.relative_to(ROOT)),'stderrSHA256':sha(e)});write(OWN/'native-current-root-P-A-M-V-terminal.actual.json',{'commands':terminal,'newScienceReviewClaims':0,'humanApproval':False,'activeWrites':0});print(name,p.returncode,p.stdout.decode()[:600],p.stderr.decode()[:1600],flush=True);assert p.returncode==0
run('p2-current-native-materialize',['app/node_modules/.bin/tsx','app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(REL/'positive-evidence.config.json'),'--candidates',str(REL/'positive-evidence.candidates.json'),'--write'])
run('p2-current-native-check',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(REL/'positive-evidence.config.json'),'--mode=check'])
for lane,script in [('atomicity','semanticAtomicityReview.ts'),('memory','memoryCardReview.ts')]:run(f'{lane}-365-current-native-check',['app/node_modules/.bin/tsx','app/scripts/'+script,'--config='+str(REL/f'full-{lane}.config.json'),'--mode=check'])
run('v2-existing-reviewed-native-inventory',['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=biologie'])
run('v2-existing-reviewed-native-freshness',['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=biologie','--check'])
current=read(ISO/qrel);a={r['goalId']:r for r in q['records']};b={r['goalId']:r for r in current['records']};assert a.keys()==b.keys();diff=[]
for gid in a:
 for key in a[gid].keys()|b[gid].keys():
  if a[gid].get(key)!=b[gid].get(key):
   assert gid in rows and key in ['chatGptNotes','aiNotes'] and ' '.join(a[gid][key].split())==b[gid][key]
   diff.append({'goalId':gid,'field':key,'normalization':'Whitespace only'})
for name in ['positive-evidence.review.jsonl']:
 shutil.copy2(ISO/REL/name,OWN/name)
write(OWN/'qa-current-normalization.exact-fields.actual.json',{'actualChangedFields':diff,'allOtherRowsExact':True,'allHumanFieldsExact':True,'scienceApprovalsUnchanged':True,'activeWrites':0})
dst=OWN/'prospective-input-tree'/qrel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ISO/qrel,dst)
print(json.dumps({'actualP2NativeCurrent':True,'wholeA365M365NativeCurrent':True,'existingIndependentlyReviewedV2NativeCurrent':True,'humanApproval':False,'activeWrites':0}))
