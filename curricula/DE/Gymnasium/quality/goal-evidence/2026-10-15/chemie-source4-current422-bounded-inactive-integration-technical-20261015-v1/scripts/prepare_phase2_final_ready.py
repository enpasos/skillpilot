# SPDX-License-Identifier: Apache-2.0
"""Pin finite current inputs before the once-authorized unchanged stock central run."""
import datetime
from phase2_exact_cas import *
s=load(OWN/'candidate/PREPARED.exact-current422-selection.awaiting-genuine-B-and-ROOTREADY.json')
cfg=load(verify(s['baseline367Config']));sub=cfg['subjects'][0];cfg['reportId']='chemie-source4-current422-bounded-inactive-final-20261015-v1'
for k in ['positiveEvidenceConfigPaths','semanticAtomicityConfigPaths']:sub[k]=s[k]
sub['memoryReviewConfigPath']=s['memoryReviewConfigPath'];sub['visualizationQaPath']=s['visualizationQaNormalAlias']
sub['resolutionIndexPaths']=s['unchangedResolutionIndexPaths']+[ref(OWN/'phase2/native-four/resolution-index.json')['path']]
assert sub['resolutionSupersessions']==s['unchangedResolutionSupersessions'] and sub['resolutionWithdrawals']==s['unchangedResolutionWithdrawals']
assert len(sub['resolutionIndexPaths'])==88 and len(set(sub['resolutionIndexPaths']))==88
cp=OWN/'phase2/config/central.current422.source4.original-A-B-C.inactive.final.config.json';put(cp,cfg)
cas=check();put(OWN/'phase2/READY.exact-current-source4-inputs-before-one-Central.actual.json',{'schemaVersion':1,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ROOTREADY':True,'rootAuthorization':'Parent /root explicitly authorized phase2 original independent D4 pairing and exactly one unchanged stock central after finite readiness; no active/source registration or M7 grant.','allowedCentralRuns':1,'actualCentralRunsBefore':0,'centralConfig':ref(cp),'CAS':cas})
mp=load(OWN/'checks/REBUILD.phase1.final-current-aliases.reference-only-assets.physical-map.json');mp['role']='Final source4 current alias map; byte-identical host from sealed phase1, pinned empty legacy discovery';mp['ROOTREADY']=True;mp['centralAllowed']=True;mp['unchangedPhase1HostMap']=ref(OWN/'checks/REBUILD.phase1.final-current-aliases.reference-only-assets.physical-map.json');mp['newD4ResolutionIndex']=ref(OWN/'phase2/native-four/resolution-index.json')
put(OWN/'phase2/REBUILD.final-current-source4.reference-only-assets.physical-map.json',mp)
print(json.dumps({'ROOTREADY':True,'centralRuns':0,'allowedCentralRuns':1,'CAS':cas},ensure_ascii=False))
