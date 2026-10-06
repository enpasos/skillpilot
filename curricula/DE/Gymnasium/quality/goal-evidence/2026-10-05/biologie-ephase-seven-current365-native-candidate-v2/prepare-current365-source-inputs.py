#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Apply only seven explicit source candidates to the actual current365 scratch."""
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,shutil
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
AUTHOR=OWN.parent/'biologie-ephase-seven-current-native-candidate-v1'
ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
ATLAS='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
freeze=AUTHOR/'author-native-candidate.final.freeze.json';assert sha(freeze)=='36a3cd9763d06419dba9a1464a2b36ea62f4e88a539fcdcf7ff3cfacf0dcc790'
for f in read(freeze)['files']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
contract=read(AUTHOR/'E7-targeted-source-patches-for-future365.json');assert not contract['goalObjectPatches'] and len(contract['sourceRowPatches'])==7
assert sha(ROOT/CAN)=='45f3d79713ba3c5e0817df9e8da04989aacab3daf65e275838af9f35c91abfba'
canon=read(ROOT/CAN);assert len(canon['goals'])==443 and any(g['id']=='49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd' for g in canon['goals'])
currentRegistry=read(ROOT/REG);bio=next(x for x in currentRegistry['subjects'] if x['subject']=='biologie');assert 'bacterial-structure-fission-reviewed-integration-candidate-v2' in bio['semanticAtomicityConfigPath']
currentReport=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-q1-bacteria-e7-integration-v1/integrated-central-current.stdout.txt'
baseline=next(s for s in read(currentReport)['subjects'] if s['subject']=='biologie');assert baseline['strictComplete']==42 and baseline['denominator']==365 and baseline['issues']==[]
assert all(x['status']=='pass' for x in baseline['requiredChecks'])
atlas=read(ROOT/ATLAS);oldMapping=next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p);mapping=read(ROOT/oldMapping);oldExtraction=mapping['sourceExtractionPath'];extraction=read(ROOT/oldExtraction)
beforeExtraction=copy.deepcopy(extraction);beforeMapping=copy.deepcopy(mapping);changedTypes=[]
for patch in contract['sourceRowPatches']:
 sid=patch['sourceGoalId'];idx=next(i for i,g in enumerate(extraction['sourceGoals']) if g['id']==sid);assert extraction['sourceGoals'][idx]==patch['before'];extraction['sourceGoals'][idx]=copy.deepcopy(patch['after'])
 mi=next(i for i,m in enumerate(mapping['mappings']) if m['legacyGoalId']==sid and m['canonicalGoalId']==patch['goalId']);assert mapping['mappings'][mi]==patch['mappingBefore'];mapping['mappings'][mi]=copy.deepcopy(patch['mappingAfter'])
 di=next(i for i,d in enumerate(mapping['decisions']) if d['sourceGoalId']==sid);assert mapping['decisions'][di]==patch['decisionBefore'];mapping['decisions'][di]=copy.deepcopy(patch['decisionAfter'])
 if patch['mappingBefore']['matchType']!=patch['mappingAfter']['matchType']:changedTypes.append({'sourceGoalId':sid,'goalId':patch['goalId'],'before':patch['mappingBefore']['matchType'],'after':patch['mappingAfter']['matchType']})
assert len(changedTypes)==3 and all(x['before']=='exact' and x['after']=='partial' for x in changedTypes)
assert any(d['key']==contract['newSourceDocumentKey'] for d in extraction['sourceDocuments'])
sourceIds={x['sourceGoalId'] for x in contract['sourceRowPatches']}
assert all(a==b for a,b in zip(beforeExtraction['sourceGoals'],extraction['sourceGoals']) if a['id'] not in sourceIds)
assert all(a==b for a,b in zip(beforeMapping['mappings'],mapping['mappings']) if a['legacyGoalId'] not in sourceIds)
assert all(a==b for a,b in zip(beforeMapping['decisions'],mapping['decisions']) if a['sourceGoalId'] not in sourceIds)
assert len(mapping['mappings'])==len(beforeMapping['mappings']) and len(extraction['sourceGoals'])==len(beforeExtraction['sourceGoals'])
newExtraction='curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-ephase-seven-current365-20261005-v2.source-extraction.json'
newMapping='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-ephase-seven-current365-20261005-v2.review.json'
mapping['reviewId']=Path(newMapping).stem;mapping['sourceExtractionPath']=newExtraction;mapping['summary']['exactMappings']-=3;mapping['summary']['partialMappings']+=3
atlas['mappingPaths']=[newMapping if p==oldMapping else p for p in atlas['mappingPaths']]
assert atlas['expectedCurricularAtomicGoalCount']==365
copied=[]
def cp(rel):
 source=ROOT/rel;dest=ISO/rel;assert source.is_file();dest.parent.mkdir(parents=True,exist_ok=True)
 # Detach only this scratch leaf; never write through an input symlink.
 assert dest.parent.resolve().is_relative_to(ISO.resolve()),str(dest.parent.resolve())
 detached=dest.is_symlink()
 if detached:dest.unlink()
 if not dest.exists() or sha(dest)!=sha(source):shutil.copy2(source,dest);copied.append({'path':rel,'sha256':sha(source),'bytes':source.stat().st_size})
 if detached:copied[-1]['detachedReadOnlyScratchLeaf']=True
# Copy only current Biology runtime/source inputs and native code, not subject-wide history.
manifest=read(ROOT/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json')
for row in manifest['inputBindings']:cp(row['path'])
cp(CAN);cp(REG);cp(bio['semanticKindLedgerPath']);cp(bio['visualizationQaPath'])
for p in (ROOT/'app/scripts').glob('*.ts'):cp(str(p.relative_to(ROOT)))
for cfgp in [bio['semanticAtomicityConfigPath'],bio['memoryReviewConfigPath']]+bio['positiveEvidenceConfigPaths']:
 cp(cfgp);cfg=read(ROOT/cfgp)
 for key in ['reviewPath','cardReviewPath','reviewCriteriaPath']:
  if cfg.get(key):cp(cfg[key])
for row in read(AUTHOR/'prepared-inputs.actual.freeze.json')['inputs']:
 # Historic author E7 outputs stay untouched. Only new source candidates are written.
 assert sha(ROOT/row['candidatePath'])==row['sha256'].removeprefix('sha256:')
write(ISO/newExtraction,extraction);write(ISO/newMapping,mapping);write(ISO/ATLAS,atlas)
for rel in [newExtraction,newMapping,ATLAS]:
 dest=OWN/'prospective-input-tree'/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ISO/rel,dest)
book=read(ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.json');book['outputPath']=str(REL/'prospective-full.book-model.json');write(OWN/'book.config.json',book)
batch=read(AUTHOR/'batch.config.json');batch.update(batchId='biologie-ephase-seven-current365-20261005-v2',bookId='de-gym-biologie-ephase-seven-current365-20261005-v2',baseGoalBookConfigPath=str(REL/'book.config.json'),outputDirectory=str(REL/'native-finalbook'));write(OWN/'batch.config.json',batch)
write(OWN/'central-current-protection.config.json',{**currentRegistry,'subjects':[bio]})
write(OWN/'current365-source-rebase.actual.receipt.json',{'at':datetime.now(timezone.utc).isoformat(),'status':'inactive_native_source_candidate_only_science_adoption_pending','isolationRoot':str(ISO),'baselineCurrentReportPath':str(currentReport.relative_to(ROOT)),'baselineCurrentReportSHA256':sha(currentReport),'baselineStrict':42,'baselineDenominator':365,'protectedCurrentStrict42GoalIds':baseline['strictCompleteGoalIds'],'canonicalSHA256':sha(ROOT/CAN),'canonicalGoalPayloadChanges':0,'singleNewBacterialFissionPreserved':True,'oldHEExtractionPath':oldExtraction,'oldHEExtractionSHA256':sha(ROOT/oldExtraction),'oldHEMappingPath':oldMapping,'oldHEMappingSHA256':sha(ROOT/oldMapping),'futureHEExtractionPath':newExtraction,'futureHEMappingPath':newMapping,'sevenSourceRowPatchesExactlyAuthorCandidates':True,'threeActualExactToPartialChanges':changedTypes,'allOther143SourceRowsAndAllBacterialRowsExact':True,'allOtherMappingsAndDecisionsExact':True,'originalSourceDocumentKey2025Preserved':True,'SLAdjacentProposalAdopted':False,'NI_BY_BW_SLInputsPreserved':True,'currentNativeDependencyCopies':copied,'newFullRepositoryCopy':False,'P7Reviewed':False,'QAApprovalChanged':False,'nativeD7InputsNotYetAuthoritativeUntilComparison':True,'humanApproval':False,'humanTrial':False,'activeWrites':0})
shutil.copytree(OWN,ISO/REL,dirs_exist_ok=True)
assert sha(ROOT/CAN)==sha(ISO/CAN)
print(json.dumps({'current365BaseStrict':42,'sourceRowsChanged':7,'exactToPartialChanges':3,'canonicalGoalChanges':0,'nativeD7ReadyToGenerate':True,'activeWrites':0,'scienceApprovalPending':True}))
