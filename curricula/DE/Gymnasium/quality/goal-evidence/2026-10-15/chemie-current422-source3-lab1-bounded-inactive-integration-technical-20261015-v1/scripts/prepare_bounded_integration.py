# SPDX-License-Identifier: Apache-2.0
"""Exact inactive transport of sealed science. No checker or scientific vote runs here."""
import copy,hashlib,json,re
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(REPO).as_posix()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
BASE=E+'chemie-acid10-current419-paired-native-inactive-integration-root-20261015-v1'
SEQ=E+'chemie-source3-three-cluster-sequencing-author-20261015-v1'
PREP=E+'chemie-source3-six-contexts-current422-native-preparation-root-20261015-v1'
S9=E+'chemie-source9-paired-six-contexts-prospective422-technical-root-20261015-v1'
S5=E+'chemie-source5-current422-paired-native-integration-technical-20261015-v1'
SA=E+'chemie-source3-six-contexts-current422-native-fresh-independent-a-20261015-v1'
SB=E+'chemie-source3-six-contexts-current422-native-fresh-independent-b-20261015-v1'
LAB=E+'chemie-lab15-current419-original-positive-atomicity-a-20261015-v1'
LD=E+'chemie-lab15-current419-paired-one-basic-laboratory-context-root-20261015-v1'
PAM=E+'chemie-c441-sequencing-successor-positive-atomicity-memory-independent-a-20261015-v1'
V2=E+'chemie-lab15-analysis-image-readable-visual-review-20261015-v2'
ACQ=E+'chemie-three-source-duty-acquisition-routes-author-20261015-v1'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
SEM='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
HOST='tmp/chemie-m7-resumed-20261015/current422-source3-lab1-integration-host-v1'
C441='c441d9e8-d9d9-5e55-a189-a37345541321';CFA='cfa5c1e4-6714-5be7-9a57-a24b201b6231'
def read(p):return json.loads((REPO/p).read_text())
def bind(p):
 b=(REPO/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,d):
 (OWN/p).parent.mkdir(parents=True,exist_ok=True);(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return REL+'/'+p
def lines(p):return (REPO/p).read_bytes().splitlines(keepends=True)
assert not (OWN/'FILES.finite-integration.seal.json').exists()
# All genuine inputs must be sealed before central preparation.
sealpaths=[BASE+'/FILES.finite-integration.seal.json',SEQ+'/FILES.finite-own-artifacts.seal.json',
 S9+'/FILES.finite-paired-contexts.seal.json',S5+'/FILES.finite-paired-source5.seal.json',
 SA+'/FILES.finite-original-independent-a.seal.json',SB+'/FILES.finite-own-artifacts.seal.json',
 LAB+'/FILES.finite-own-artifacts.seal.json',LD+'/FILES.finite-paired-description.seal.json',
 PAM+'/FILES.final-finite-c441-PAM-independent-a.seal.json',V2+'/FILES.finite-own-artifacts.seal.json']
# The LAB description seal has its own finite filename; select only its declared neutral.
ldneutral=read(LD+'/NEUTRAL.paired-one-description-no-central-measurement.json')
sealpaths[7]=ldneutral.get('finiteSealPath',LD+'/FILES.finite-paired-description.seal.json')
if not (REPO/sealpaths[7]).is_file():
 hits=list((REPO/LD).glob('FILES.*seal.json'));assert len(hits)==1;sealpaths[7]=hits[0].relative_to(REPO).as_posix()
assert all((REPO/p).is_file() for p in sealpaths)
dump('INPUTS.sealed-scientific-source-bindings.json',{'role':'Exact input seals, not new science','seals':[bind(p) for p in sealpaths],
 'rootAuthorization':'Additive current422 inactive technical integration; only fresh c441 M record.reviewId may be transported to canonical-chemistry-full, all scientific fields and originals exact; no other identity transport authorized.',
 'baseline':bind(BASE+'/checks/CENTRAL.current419-P10-A7-D3.stock-report.actual.json'),'newScientificVotes':0})

central=read(BASE+'/config/central.current419.P10-A7-D3.final.inactive.config.json');s=central['subjects'][0]
central['reportId']='chemie-current422-source3-lab1-bounded-inactive-integration-20261015-v1'
seqsel=read(SEQ+'/INPUTS.physical-exact-selector.json');canonical=read(seqsel['canonical']['path'])
before=copy.deepcopy(canonical);G={g['id']:g for g in canonical['goals']}
vsel=read(V2+'/NEUTRAL.finite-readable-image-machine-V1-review.json');vqa=read(vsel['qaComponent']['path'])['records'][0]
vgoal=read(V2+'/review/one-whole-goal.V-input-fragment.json')['goals'][0]
assert {k:v for k,v in G[CFA].items() if k!='resourceLinks'}=={k:v for k,v in vgoal.items() if k!='resourceLinks'}
G[CFA]['resourceLinks']=copy.deepcopy(vgoal['resourceLinks'])
canpath=dump('candidate/canonical554.prospective422.sequencing-plus-reviewed-cfa-image.exact.json',canonical)
changed=[i for i,g in enumerate(canonical['goals']) if g!=before['goals'][i]];assert len(changed)==1
dump('CAS.one-whole-cfa-resource-only-on-sequencing554.json',{'before':seqsel['canonical'],'after':bind(canpath),
 'wholeBefore':before['goals'][changed[0]],'wholeAfter':canonical['goals'][changed[0]],'changedFields':['resourceLinks'],'other553WholeObjectsExact':True,
 'actualV':vsel['review'],'cfaPWithheld':True,'cfaAtomicityStillNonAtomic':True,'newVotes':0})
semantic=read(seqsel['semanticLedger']['path']);semantic['sourceLandscapePath']=CAN
sempath=dump('candidate/semantic554.same-classifications.normal-address.json',semantic)

transports=[];filtered=[]
def filtered_config(path,excluded,label,key):
 cfg=read(path);raw=lines(cfg['reviewPath']);kept=[b for b in raw if json.loads(b)['goalId'] not in excluded]
 removed=[b for b in raw if json.loads(b)['goalId'] in excluded]
 assert removed and kept
 rp=REL+'/records/'+label+'.exact-retained.jsonl';(REPO/rp).write_bytes(b''.join(kept))
 after=copy.deepcopy(cfg);after['reviewPath']=rp;after['landscapePath']=CAN
 if 'semanticKindLedgerPath' in after:after['semanticKindLedgerPath']=SEM
 ids=[json.loads(b)['goalId'] for b in kept]
 after['scope']={'label':cfg['scope']['label']+'; explicit technical residual, replaced rows excluded','leafGoalIds' if key=='semanticAtomicityConfigPaths' else 'goalIds':ids}
 out=dump('config/'+label+'.config.json',after)
 filtered.append({'sourceConfig':bind(path),'successorConfig':bind(out),'sourceRecords':bind(cfg['reviewPath']),'successorRecords':bind(rp),
  'removedGoalIds':[json.loads(b)['goalId'] for b in removed],'retainedGoalIds':ids,
  'allRetainedLineBytesExact':True,'reason':'Explicit replacement/withholding in current integration only. Historical full rows/config/run bytes retained; no changed science.'})
 return out
replaceA=set(read(LAB+'/A/normal-atomicity-fifteen.config.json')['scope']['leafGoalIds'])|{C441}
for key,excluded in [('semanticAtomicityConfigPaths',replaceA),('positiveEvidenceConfigPaths',{C441})]:
 result=[]
 for n,path in enumerate(s[key]):
  cfg=read(path);ids={json.loads(b)['goalId'] for b in lines(cfg['reviewPath']) if b.strip()}
  result.append(filtered_config(path,excluded,key+'-old-residual-'+str(n+1),key) if ids&excluded else path)
 s[key]=result
def transport_config(path,label,key,excluded=None):
 if excluded:return filtered_config(path,excluded,label,key)
 cfg=read(path);after=copy.deepcopy(cfg);after['landscapePath']=CAN
 if 'semanticKindLedgerPath' in after:after['semanticKindLedgerPath']=SEM
 out=dump('config/'+label+'.config.json',after)
 delta=[k for k in set(cfg)|set(after) if cfg.get(k)!=after.get(k)]
 assert set(delta)<={'landscapePath','semanticKindLedgerPath'}
 transports.append({'source':bind(path),'successor':bind(out),'changedFields':delta,'allScienceRecordsAndRunPathsExact':True})
 return out
for key,src,label in [('positiveEvidenceConfigPaths',SA+'/pa/positive-profiles.original.config.json','P3-source-original-A-normal-address'),
 ('semanticAtomicityConfigPaths',SA+'/pa/atomicity.original.config.json','A3-source-original-A-normal-address'),
 ('positiveEvidenceConfigPaths',LAB+'/P/normal-positive-fifteen.config.json','P14-lab-original-except-current-cfa'),
 ('semanticAtomicityConfigPaths',LAB+'/A/normal-atomicity-fifteen.config.json','A15-lab-original-normal-address'),
 ('positiveEvidenceConfigPaths',PAM+'/P/c441.current-positive.config.json','P1-c441-fresh-original-normal-address'),
 ('semanticAtomicityConfigPaths',PAM+'/A/c441.config.json','A1-c441-fresh-original-normal-address')]:
 s[key].append(transport_config(src,label,key,{CFA} if label.startswith('P14') else None))
dump('checks/CONFIG.address-only-and-explicit-residual-CAS.json',{'addressOnly':transports,'filteredSuccessors':filtered,'newScientificVotes':0,'noDuplicatedPOrARecords':True})

# Add whole immutable native indexes and extend each existing unique terminal chain.
newindexes=[S9+'/native-nine/resolution-index.json',S5+'/native-five/resolution-index.json',LD+'/native-fifteen/resolution-index.json']
newedges=[]
for newindex in newindexes:
 idx=read(newindex)
 for r in idx['resolutions']:
  gid=r['goalId'];owners=[p for p in s['resolutionIndexPaths'] if any(a['goalId']==gid for a in read(p)['resolutions'])]
  if owners:
   nonterminal={e['supersededIndexPath'] for e in s['resolutionSupersessions'] if e['goalId']==gid}
   terminal=[p for p in owners if p not in nonterminal];assert len(terminal)==1,(gid,terminal)
   edge={'goalId':gid,'supersededIndexPath':terminal[0],'replacementIndexPath':newindex}
   s['resolutionSupersessions'].append(edge);newedges.append(edge)
 s['resolutionIndexPaths'].append(newindex)
dump('checks/D.whole-index-additions-and-terminal-supersessions.json',{'addedWholeIndexes':[bind(p) for p in newindexes],
 'newTerminalEdges':newedges,'allPriorEdgesPreserved':True,'nativeSource5InputCanonicalUnchanged':True,'newVotes':0})

# M422: preserve418 old line byte sequences,3 original Source M lines and the real new c441 science.
mcfg=read(s['memoryReviewConfigPath']);mold=lines(mcfg['reviewPath']);assert len(mold)==419
fresh=lines(PAM+'/M/c441.review.jsonl');assert len(fresh)==1
moldc=[b for b in mold if json.loads(b)['goalId']==C441];assert len(moldc)==1
mbefore=json.loads(fresh[0]);mafter=copy.deepcopy(mbefore);mafter['reviewId']=mcfg['reviewId']
assert [k for k in set(mbefore)|set(mafter) if mbefore.get(k)!=mafter.get(k)]==['reviewId']
freshalias=(json.dumps(mafter,ensure_ascii=False)+'\n').encode()
msource=lines(SB+'/MV3/memory-three.review.jsonl');assert len(msource)==3 and all(json.loads(b)['reviewId']==mcfg['reviewId'] for b in msource)
mlines=[freshalias if json.loads(b)['goalId']==C441 else b for b in mold]+msource
assert len({json.loads(b)['goalId'] for b in mlines})==422
(OWN/'M/M422.original418-plus-renewed-c441-plus-source3.exact.jsonl').write_bytes(b''.join(mlines))
(OWN/'M/c441.original-fresh-row.exact.jsonl').write_bytes(fresh[0]);(OWN/'M/c441.superseded-old419-row.exact.jsonl').write_bytes(moldc[0])
dump('CAS.M1.single-reviewId-container-identity-transport.json',{'role':'Explicit root-authorized metadata-only aggregate identity alias; not a new M review or foreign run participation',
 'originalSource':bind(PAM+'/M/c441.review.jsonl'),'ownOriginalExactRow':bind(REL+'/M/c441.original-fresh-row.exact.jsonl'),
 'wholeBefore':mbefore,'wholeAfter':mafter,'changedFields':['reviewId'],'allScientificFieldsExact':True,
 'original418LineBytesExact':True,'source3OriginalLineBytesExact':True,'sourceReviewerTimeReasonFingerprintStatusAndOptionalDeckGoalIdsExact':True,'newVotes':0})
mcfg['reviewPath']=REL+'/M/M422.original418-plus-renewed-c441-plus-source3.exact.jsonl'
mcfg['reportPath']=REL+'/checks/M422.stock-report-not-written-in-check-mode.md'
mcfg['visibilityScopes']+=read(SB+'/MV3/memory-three.config.json')['visibilityScopes']
s['memoryReviewConfigPath']=dump('config/M422.original-scopes-metadata-transport-only.config.json',mcfg)

# Keep every unaffected QA object. Source3 KEEP and new cfa approval come only from real existing reviews.
mapbase=read(BASE+'/checks/REBUILD.current419-P10-A7-native-pair.physical-map.json')
oldqpath=next(r['physicalRepositorySource']['path'] for r in mapbase['aliases'] if r['normalHostAlias']==QA)
q=read(oldqpath);qbefore=copy.deepcopy(q);sourceqa=read(SB+'/MV3/visualization-three.qa.json')
for originalrow in sourceqa['records']+[vqa]:
 row=copy.deepcopy(originalrow);row['landscapePath']=CAN
 oldrows=[i for i,a in enumerate(q['records']) if a['goalId']==row['goalId']]
 if oldrows:assert len(oldrows)==1;q['records'][oldrows[0]]=row
 else:q['records'].append(row)
assert len(q['records'])==438
qpath=dump('candidate/QA438.original434-plus-real-source3-and-new-cfa-V.json',q)
dump('CAS.QA.only-three-new-source-rows-and-one-cfa-successor.json',{'wholeBefore':bind(oldqpath),'wholeAfter':bind(qpath),
 'source3OriginalQa':bind(SB+'/MV3/visualization-three.qa.json'),'cfaOriginalNewQa':vsel['qaComponent'],
 'oldCfaWholeRow':next(r for r in qbefore['records'] if r['goalId']==CFA),'newCfaWholeRow':next(r for r in q['records'] if r['goalId']==CFA),
 'oldJpgAndHumanHistoryRetained':bind(V2+'/history/original-JPG-and-rejected-first-PNG-preserved.json'),
 'unaffected434WholeQaRowsExact':all(r==next(a for a in q['records'] if a['goalId']==r['goalId']) for r in qbefore['records'] if r['goalId']!=CFA),
 'addressTransportOnlyForOriginalSource3AndCfaRows':['landscapePath'],'newVotes':0})
dump('config/central.current422.source3-lab1.final.inactive.config.json',central)

# Exactly50 baseline normal address aliases, updated only for reviewed candidate inputs/views/QA.
physical=read(PREP+'/checks/REBUILD.prospective422-nine.physical-map.json')
overrides={CAN:canpath,SEM:sempath,QA:qpath}
for r in read(ACQ+'/CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json')['rows']:
 overrides['curricula/DE/Gymnasium/composition-views/chemie/'+r['name']+'.view.json']=r['after']['path']
for row in mapbase['aliases']:
 p=overrides.get(row['normalHostAlias'],row['physicalRepositorySource']['path']);row['physicalRepositorySource']=bind(p)
 row['materialization']='physical JSON/JSONL copy in new ignored sparse host only'
assets=copy.deepcopy(physical['selectedCurrentAssetRows'])
cfarow=next(r for r in assets if r['goalId']==CFA);cfarow['physicalRepositorySource']=vsel['reviewedPng']
cfarow['normalCanonicalDestination']=vqa['canonicalAssetPath'];cfarow['normalPublicDestination']=vqa['publicAssetPath']
cfarow['publicMustBePhysicalWithinHostPublicRoot']=True
# Physical stock-module closure, not a full app/source copy.
modules={};todo=[REPO/p for p in [*[r['path'] for r in mapbase['stockPhysicalModules']],'app/scripts/reportDeepUnderstandingRollout.ts','app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/generateGoalVisualizationQaLedgers.ts']]
while todo:
 path=todo.pop();rel=path.relative_to(REPO).as_posix()
 if rel in modules:continue
 assert path.is_file();modules[rel]=bind(rel)
 for target in re.findall(r"(?:\bfrom\s*|\bimport\s*)['\"](\.{1,2}/[^'\"]+)['\"]",path.read_text()):
  raw=(path.parent/target).resolve();candidates=[raw,Path(str(raw)+'.ts'),Path(str(raw)+'.tsx'),Path(str(raw)+'.mjs'),raw/'index.ts']
  found=next((p for p in candidates if p.is_file()),None);assert found,(path,target);todo.append(found)
mapbase.update({'role':'New inactive exact current422 physical sparse host map; no earlier host writes','executionHost':HOST,
 'selectedCurrentAssetRows':assets,'stockPhysicalModules':[modules[k] for k in sorted(modules)],'normalAliasFilesMustBePhysical':True,
 'physicalPublicSelectedCount':sum(bool(r['publicMustBePhysicalWithinHostPublicRoot']) for r in assets),
 'fullTreeCopies':0,'hardlinksCreated':0,'mainOrEarlierHostWrites':0,
 'legacyQaDispositionPolicy':'Reproduce exact frozen315 discovery input (zero selected chemistry legacy markdown), by an empty private host discovery directory. Real repository historical QA review files remain untouched and explicitly bound.',
 'sourceBaseline315Map':bind(BASE+'/checks/REBUILD.current419-P10-A7-native-pair.physical-map.json')})
assert len(mapbase['aliases'])==50 and len(assets)==431
dump('checks/REBUILD.current422-final.alias50-selected431.physical-map.json',mapbase)

# Protected active inputs: read-only snapshots, evaluated again after central.
protected=set(['curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','docs/qa-ci/status/curriculum-quality-status.json'])
globalcfg=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
for sub in globalcfg['subjects']:
 if sub['subject'] in ('mathematik','physik','biologie'):
  for k in ('landscapePath','semanticKindLedgerPath','visualizationQaPath','memoryReviewConfigPath'):protected.add(sub[k])
  for k in ('semanticAtomicityConfigPaths','positiveEvidenceConfigPaths','resolutionIndexPaths'):protected.update(sub.get(k,[]))
protected.update(['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'])
dump('checks/PROTECTED.active-inputs.before.json',{'role':'Read-only preservation snapshot, not new whole-subject QA','files':[bind(p) for p in sorted(protected)],'activeChemistryKnownBaseline':'231/402 M6 unchanged; separate last inactive315/419','noActiveWrites':True})
print(json.dumps({'wholeGoals':554,'denominator':422,'nativeIndexesAdded':3,'newTerminalSupersessionEdges':len(newedges),'PAAddressTransports':len(transports),'filteredConfigSuccessors':len(filtered),'memoryRows':422,'qaRows':438,'normalAliases':50,'selectedAssets':431,'stockModules':len(modules),'centralNotRun':True,'newVotes':0}))
