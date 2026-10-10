#!/usr/bin/env python3
"""Bounded migration audit; writes only independent QA proofs and raw logs."""
import collections
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import sys

REPO = Path.cwd()
OUT = Path(__file__).resolve().parent
AUTHOR = REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1'
errors = []
def check(ok, message):
    if not ok: errors.append(message)
def sha(data): return hashlib.sha256(data).hexdigest()
def load(path): return json.loads(Path(path).read_bytes())
def binding(path, expected=None):
    b=(REPO/path).read_bytes()
    h=sha(b)
    if expected: check(h==expected.removeprefix('sha256:'), 'binding mismatch: '+path)
    return {'path':path,'sha256':h,'bytes':len(b)}
def compact(obj): return json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()

planpath=str((AUTHOR/'actual-current125-registry-mapping-source-root-activation-and-byteexact-old-BE-history.author-plan.json').relative_to(REPO))
plan=load(REPO/planpath)
source=plan['sourceArtifact']
source_binding=binding(source['path'],'963f5b0a737d5520305d15f32a08f0be04029ffcea0d1367cf0ffd5d5794e28d')
source_doc=load(REPO/source['path'])
map_path=str((AUTHOR/'current-V13-Source125-one-actual-union-member-technical-binding-only-v1/be_wirtschaft_current125_exact208partial_three_currentV13_decision_union_path_bindings_only.author-successor-v6.json').relative_to(REPO))
map_binding=binding(map_path,'56c175f4aaeb5ab66710f8dcf2ca958b08bbd9571864fbeeb061ce19873ecf71')
mapping=load(REPO/map_path)
pre_map=str((AUTHOR/'current-V13-Source125-one-actual-union-member-technical-binding-only-v1/be_wirtschaft_current125_exact208partial_and125qualified_science_V13_union_reference_only.author-successor-v5.json').relative_to(REPO))
previous_map=load(REPO/pre_map)
check(mapping['mappings']==previous_map['mappings'], '208 partial mapping whole objects changed from prior qualified V13 adapter')
check(len(mapping['mappings'])==208 and all(x['matchType']=='partial' for x in mapping['mappings']), 'partial208 facts differ')
check(mapping['sourceExtractionPath']==plan['activeSourcePath'], 'latest map does not bind exact intended active source path')
check(mapping['authorCommittableSourceArtifact']==source, 'latest map does not bind exact qualified portable sourcev8')
check(mapping['sourceLandscapeId']==source_doc['sourceLandscapeId']=='c0713ece-7c59-57bc-bc4d-313d9405e1ad', 'new source ID mismatch')
check(all(mapping[k] is False for k in ['nativeMappedApproved','wholeCourseApproved','humanApproval']), 'qualification overstated in map flags')
check('candidate' in mapping['status'], 'candidate status lost')
for step in source_doc['pipelineStatus']['steps']:
    check(step['status']=='incomplete' and all(x['passed'] is False for x in step['checks']), 'source native/course pipeline falsely complete')
rootforeign='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-final493-and-native43basis-source3-adapter-independent-root-v1/actual-final-independent-qualified493-43-native-enums-header-two-FP-eight-kinds-and-three-source-pointers-KEEP.receipt.json'
rootforeign_binding=binding(rootforeign,'030cb907fea0a45c3242c03479bf1cc2bb2dd61ac9ae265bee37ce4b686f695f')
foreign=load(REPO/rootforeign)
foreign_bindings=[binding(x['path'],x['sha256']) for x in foreign['bindings']]
performance_receipt='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-independent-source-judgment-reconciliation-root-v1/actual-current125-qualified-performance125-KEEP-open0-Montan-cycle-EU-three-successor-v5.receipt.json'
performance_binding=binding(performance_receipt,'3c63b00f2bc25ce327af238eabef59a8ec6acdd979ce4121332f2d06214b81f1')
performance=load(REPO/performance_receipt)
qualified_binding=binding(performance['newLedger']['path'],performance['newLedger']['sha256'])
qualified=load(REPO/performance['newLedger']['path'])
qualified_rows={x['sourceAspectId']:x for x in qualified['rows']}
source_rows={x['id']:x for x in source_doc['sourceGoals']}
decision_rows={x['sourceGoalId']:x for x in mapping['decisions']}
check(len(source_rows)==len(qualified_rows)==len(decision_rows)==125, 'source/qualified/decision count is not125')
check(source_rows.keys()==qualified_rows.keys()==decision_rows.keys(), 'source/qualification/decision ID sets differ')
performance_inputs={}
for source_id,s in source_rows.items():
    q=qualified_rows[source_id];d=decision_rows[source_id]
    h=sha(compact(s))
    check(h==q['currentWholeRow']['rowSha256'].removeprefix('sha256:')==d['wholeSourceRowSHA256'], 'qualified whole source row mismatch: '+source_id)
    check(q['currentBoundedPerformanceUnionDecision']=='KEEP', 'prior source-performance KEEP absent: '+source_id)
    for ref in q['lineage']:
        item=ref['wholeIndependentJudgmentFile']
        performance_inputs[item['path']]=binding(item['path'],item['sha256'])
    item=d['exactIndependentWholePerformanceKEEP']
    performance_inputs[item['path']]=binding(item['path'],item['sha256'])
    check(d['decision']=='mapped', 'unreviewed/unmapped source row silently altered: '+source_id)
    check(d['currentPerformanceUnionBinding']['sourceAspectId']==source_id,'current union row mismatch')
union=mapping['currentWholeUnionIndex']
union_binding=binding(union['path'],union['sha256'])
canonical=load(REPO/foreign['canonical493']['path'])
canon_ids={g['id'] for g in canonical['goals']}
check(all(x['legacyGoalId'] in source_rows and x['canonicalGoalId'] in canon_ids for x in mapping['mappings']), 'mapping refers to missing current source/canonical goal')

registry_path='curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
registry_bytes=(REPO/registry_path).read_bytes()
registry=load(REPO/registry_path)
candidate=load(REPO/plan['registryArtifact']['path'])
candidate_binding=binding(plan['registryArtifact']['path'],plan['registryArtifact']['sha256'])
old_id='3ed24627-4b87-54b7-865f-98a0744fd1a5';new_id='c0713ece-7c59-57bc-bc4d-313d9405e1ad'
old_entries=[x for x in registry['entries'] if x['landscapeId']==old_id]
new_entries=[x for x in candidate['entries'] if x['landscapeId']==new_id]
check(len(old_entries)==len(new_entries)==1,'expected unique old/current125 registry entries not present')
check(not any(x['landscapeId']==new_id for x in registry['entries']), 'source registry already changed during prewrite guard')
new_entry=new_entries[0]
check(new_entry['sourcePath']==new_entry['archiveSourcePath']==new_entry['sourceExtractionPath']==plan['activeSourcePath'],'new registry source path mismatch')
check(new_entry['mappingReviewPath']==plan['activeMappingPath'],'new registry mapping path mismatch')
check(new_entry['courseWholeReviewPending'] is True and new_entry['officialGKChoiceAmbiguityRetained'] is True,'pending normative/course boundaries lost')
others=[x for x in registry['entries'] if x['landscapeId']!=old_id]
author_others=[x for x in candidate['entries'] if x['landscapeId']!=new_id]
author_other_by_id={x['landscapeId']:x for x in author_others}
author_other_drift=[x['landscapeId'] for x in others if author_other_by_id.get(x['landscapeId'])!=x]
check(not author_other_drift,'author full-registry candidate is stale for some other entries; current-only fieldwise assembly remains required')
simulated=[new_entry if x['landscapeId']==old_id else x for x in registry['entries']]
check([x for x in simulated if x['landscapeId']!=new_id]==others,'simulated replacement changes unrelated current registry entries')
check(len(simulated)==len(registry['entries'])==302,'registry entry count unexpectedly changes')

history=[]
for h in plan['historicalBytes']:
    a=(REPO/h['originalOperativePath']).read_bytes();b=(REPO/h['wholeExactHistoricalArtifact']['path']).read_bytes()
    check(a==b and sha(a)==h['originalWholeSHA256'],'old operative/history bytes differ')
    history.append({'originalOperativePath':h['originalOperativePath'],'proposedExistingExactArchivePath':h['wholeExactHistoricalArtifact']['path'],'originalAndArchiveWholeSha256Actual':sha(a),'bytesActual':len(a),'wholeBytesExact':a==b})
oldmap=load(REPO/history[1]['proposedExistingExactArchivePath'])
check(oldmap['sourceExtractionPath']==history[0]['originalOperativePath'],'old historical map original source reference changed')
check(oldmap['sourceLandscapeId']==old_id,'old historical source id not exact')

oldpaths=[x['originalOperativePath'] for x in history]
rg_args=['rg','-l','-F']
for x in oldpaths:rg_args+=['-e',x]
rg_args+=['curricula/DE/Gymnasium/quality/goal-description-review','curricula/DE/Gymnasium/quality/goal-evidence','qa-artifacts/native-review-inputs','app/scripts/config/goal-books','docs']
scan=subprocess.run(rg_args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
check(scan.returncode in [0,1],'historical reference scan failed')
(OUT/'raw-exact-old-path-reference-scan.log').write_text(scan.stdout+scan.stderr)
references=scan.stdout.splitlines()
native_d_p_jsonl=[x for x in references if x.endswith('.jsonl')]
check(not native_d_p_jsonl,'direct immutable D/P JSONL reference needs additional original-path replay handling')
collector=load(OUT/'actual-native-collector-discovery.before-source-activation.json')
check(collector['histories'][0]['sourceInputCollectorIncludesOriginal'],'native input collector did not find old source')
check(collector['histories'][1]['qualityMappingCollectorIncludesOriginal'] and collector['histories'][1]['applicabilityMappingCollectorIncludesOriginal'],'native source mapping collectors did not find old map')
check(all(not h[k] for h in collector['histories'] for k in ['sourceInputCollectorIncludesArchive','qualityMappingCollectorIncludesArchive','applicabilityMappingCollectorIncludesArchive']),'historical archive is still operative')
sourcepaths=collector['inputExtractions']
sourcepaths_after=[x for x in sourcepaths if x!=history[0]['originalOperativePath']]+[plan['activeSourcePath']]
mappingpaths_after=[x for x in collector['qualityMappings'] if x!=history[1]['originalOperativePath']]+[plan['activeMappingPath']]
check(history[0]['originalOperativePath'] not in sourcepaths_after and history[1]['originalOperativePath'] not in mappingpaths_after,'postplan would keep obsolete operative inputs')
check((REPO/registry_path).read_bytes()==registry_bytes,'current registry drifted during prewrite audit')
(OUT/'source-landscape-registry.current-before-migration.whole-byte.snapshot.json').write_bytes(registry_bytes)
result={'documentType':'independent-root-foreign-current125-source-migration-guard','writtenAtUtc':datetime.now(timezone.utc).isoformat(),'verdict':'KEEP bounded migration with latestV13Mapv6 and explicit original-path replay relocation' if not errors else 'REVISE','role':'independent technical migration reviewer; no new source, whole-course, country-role or scientific review','actualSource125Binding':source_binding,'actualLatestQualifiedMapV6Binding':map_binding,'staleAuthorPlanMapBinding':plan['mappingArtifact'],'activeDestinationsExact':{'source':plan['activeSourcePath'],'mapping':plan['activeMappingPath'],'registry':registry_path},'sourceStatusActual':source_doc['status'],'sourcePipelineActual':source_doc['pipelineStatus'],'mappingStatusActual':mapping['status'],'actual125QualifiedPerformanceDecisions':len(decision_rows),'actual208PartialMappingsWholeEqualPriorQualifiedV13':mapping['mappings']==previous_map['mappings'],'mappingNativeMappedWholeCourseHumanFlags':{k:mapping[k] for k in ['nativeMappedApproved','wholeCourseApproved','humanApproval']},'rootForeignQualified493Source3Receipt':rootforeign_binding,'rootForeignReceiptInputBindingsActual':foreign_bindings,'all125QualificationReceipt':performance_binding,'all125QualifiedLedgerActual':qualified_binding,'allReferencedIndependentWholePerformanceJudgmentsActual':list(performance_inputs.values()),'currentUnionActual':union_binding,'registryCurrentWholeBeforeSha256':sha(registry_bytes),'registryCandidateActual':candidate_binding,'oldRegistryEntryWholeExact':old_entries[0],'newRegistryEntryToSpliceWholeExact':new_entry,'allOtherCurrentRegistryEntriesCount':len(others),'allOtherCurrentRegistryEntriesDigest':sha(compact(others)),'authorFullRegistryOtherEntryDriftIDs':author_other_drift,'fieldwiseSimulationAllOtherCurrentEntriesWholeExact':True,'historicalSourceAndMapRelocationsExact':history,'historicalArchivedMapStillPointsToOldOriginalSourcePath':oldmap['sourceExtractionPath'],'oldExactPathReferenceCatalog':references,'oldExactPathReferenceFileCount':len(references),'directDOrPJsonlExactOldPathReferenceCount':len(native_d_p_jsonl),'replayRequirements':['Do not edit old map, source, registry evidence, D/P records or their fingerprints.','Keep both whole archived bytes and complete old registry entry in the committable QA history.','Add explicit originalOperativePath -> exactArchivePath, original bytes hash and sourceID old -> new operation receipt.','Historical native replays must reconstruct original relative paths in an isolated replay root from retained exact bytes. Relocation receipt is not an implemented path resolver.','Do not delete or edit preexisting isolated snapshots under qa-artifacts/native-review-inputs.'],'collectorActualProofPath':str((OUT/'actual-native-collector-discovery.before-source-activation.json').relative_to(REPO)),'postplanDiscoverySimulation':{'oldSourceAbsent':True,'oldMappingAbsent':True,'newSourcePathCount':sourcepaths_after.count(plan['activeSourcePath']),'newMappingPathCount':mappingpaths_after.count(plan['activeMappingPath'])},'limits':{'sourceScienceReopened':False,'newWholeSource125CoverageApproval':False,'normativeWholeCourseApproval':False,'humanApproval':False,'partialToExactUpgrade':False,'nativePipelineCompletedClaim':False,'activeWritePerformed':False,'backendJavaCollectorExecuted':False,'historicalPathResolverImplemented':False},'errors':errors,'passed':not errors}
(OUT/'actual-independent-current125-source-migration-guard.receipt.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'verdict':result['verdict'],'source125':len(source_rows),'partialEdges':len(mapping['mappings']),'unrelatedCurrentRegistryEntriesExact':len(others),'exactOldHistoryCopies':len(history),'historicalReferenceFiles':len(references),'directNativeDPJsonlRefs':len(native_d_p_jsonl),'errors':errors},ensure_ascii=False))
sys.exit(bool(errors))
