# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text())
def save(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):return {'path':str(p.relative_to(R)),'sha256':digest(p),'bytes':p.stat().st_size}
reg=load(O/'protected/current-registry.exact.json');chem=next(s for s in reg['subjects'] if s['subject']=='chemie');report=load(O/'protected/current151-central-terminal-report.exact.json');ids=next(s for s in report['subjects'] if s['subject']=='chemie')['strictCompleteGoalIds'];rows={i:{'goalId':i,'D':[],'P':[],'A':[],'M':None,'V':None} for i in ids};declared={}
def use(p):b=binding(p);declared[b['path']]=b;return b
def jsonl(p):use(p);return [json.loads(l) for l in p.read_text().splitlines() if l.strip()]
superseded={(r['goalId'],r['supersededIndexPath']) for r in chem.get('resolutionSupersessions',[])};withdrawn={(r['goalId'],r['indexPath']) for r in chem.get('resolutionWithdrawals',[])}
for ip in chem['resolutionIndexPaths']:
 p=R/ip;idx=load(p);use(p);groups={g['groupId']:g for g in idx['groups']}
 for entry in idx['resolutions']:
  gid=entry['goalId']
  if gid not in rows or (gid,ip)in superseded or (gid,ip)in withdrawn:continue
  group=groups[entry['groupId']];base=p.parent/group['artifactDirectory'];rp=base/entry['resolutionPath'];res=load(rp);assert digest(rp)==entry['resolutionDigest'];use(rp);use(base/group['dualSummaryPath'])
  if res.get('synthesisDecisionManifest'):use(base/res['synthesisDecisionManifest']['manifestPath'])
  rows[gid]['D'].append({'index':binding(p),'wholeEntry':entry,'resolution':binding(rp),'wholeNativeGoalPageContextBinding':res['goal'],'wholeRoundBindings':res['rounds'],'wholeSynthesisIdentity':{'synthesisId':res['synthesis']['synthesisId'],'authority':res['synthesis']['authority'],'resolutionStatus':res['status']},'currentRegisteredNonSuperseded':True})
  for rn in ['round-a','round-b']:
   rd=base/rn
   for fn in ['description-review-input.json','description-review-campaign.json','review-bundle-manifest.json']:
    f=rd/fn
    if f.exists():use(f)
   resultdir=rd/'results'
   if resultdir.exists():
    for f in resultdir.glob('*'):
     if f.is_file():use(f)
for cp in chem['positiveEvidenceConfigPaths']:
 c=load(R/cp);use(R/cp)
 for q in c.get('reviewRunManifestPaths',[]):use(R/q)
 for r in jsonl(R/c['reviewPath']):
  if r.get('goalId')in rows:rows[r['goalId']]['P'].append({'configPath':cp,'recordsPath':c['reviewPath'],'wholeRecord':r})
for cp in chem['semanticAtomicityConfigPaths']:
 c=load(R/cp);use(R/cp)
 for r in jsonl(R/c['reviewPath']):
  if r.get('goalId')in rows:rows[r['goalId']]['A'].append({'configPath':cp,'recordsPath':c['reviewPath'],'wholeRecord':r})
m=load(R/chem['memoryReviewConfigPath']);use(R/chem['memoryReviewConfigPath'])
for r in jsonl(R/m['reviewPath']):
 if r['goalId']in rows:rows[r['goalId']]['M']={'configPath':chem['memoryReviewConfigPath'],'recordsPath':m['reviewPath'],'wholeRecord':r}
use(R/m['cardReviewPath']);qa=load(R/chem['visualizationQaPath']);use(R/chem['visualizationQaPath']);assetBindings=[]
for r in qa['records']:
 if r.get('visualizationState')=='available':
  asset=R/r['publicAssetPath'];assetBindings.append(use(asset));assert digest(asset).removeprefix('sha256:')==r['assetSha256'].removeprefix('sha256:')
 if r.get('goalId')in rows:
  rows[r['goalId']]['V']={'qaPath':chem['visualizationQaPath'],'wholeRecord':r,'actualAssetBindings':[]}
  for k in ['publicAssetPath','sourceAssetPath','backendAssetPath']:
   if r.get(k):
    asset=R/r[k];assert digest(asset).removeprefix('sha256:')==r['assetSha256'].removeprefix('sha256:');rows[r['goalId']]['V']['actualAssetBindings'].append(use(asset))
for r in rows.values():assert r['D'] and r['P'] and r['A'] and r['M'] and r['V'],r['goalId']
save(O/'protected/current151-exact-native-D-page-context-and-whole-PAMV.records.json',{'count':151,'baselineProtectedIDSetExact':True,'allExistingNativeRecordsUnchanged':True,'new17IDsDisjointFrom151':True,'records':list(rows.values()),'note':'Current non-superseded registered native D bindings are preserved as whole fingerprint/text/round records. Their historical campaign pages stay exact; the new private17book is not a replacement for them. Current protected whole P/A/M/V records and original raster bindings remain exact. No new reviewer, verdict or human attestation is invented.'})
save(O/'protected/native-gates-and-all-available-raster-declared-inputs.actual.json',{'files':list(declared.values()),'allAvailableChemRastersHashed':len(assetBindings),'exactProtected151NativeGateRecordsDeclared':True})
print(json.dumps({'protected151WholeDPAMV':151,'declaredGateAndRasterInputs':len(declared),'availableChemRasters':len(assetBindings)}))
