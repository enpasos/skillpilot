# SPDX-License-Identifier: Apache-2.0
"""Validate and seal the finite Foundation32 mechanical author output."""
from pathlib import Path
import copy,hashlib,json,shutil
import jsonschema
R=Path.cwd();O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-foundation-thirtytwo-normal-source-adapter-author-20261016-v1';T=R/'tmp/chemie-m7-resumed-20261016/foundation-thirtytwo-normal-source-adapter'
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
n=read(O/'NEUTRAL.nine-complete-source-mapping-pairs.thirtytwo-current-cells.selector.json')
stock=read(O/'CHECKS.actual-bounded-reader-stock-facets-and-exact-documents.json');assert stock['allPassed'] and stock['selectedCurrentCellsChecked']==32 and not stock['holds']
# Explicit stock-reader-compatible local structural checks, not a nonexistent official extraction schema.
source_schema={'type':'object','required':['schemaVersion','extractionId','sourceLandscapeId','jurisdiction','subject','stage','sourceDocument','passages','sourceGoals'],'properties':{'sourceGoals':{'type':'array','items':{'type':'object','required':['id','passageId','title','description','sourceText','tags'],'properties':{'id':{'type':'string','minLength':1},'passageId':{'type':'string','minLength':1},'title':{'type':'string','minLength':1},'description':{'type':'string','minLength':1},'sourceText':{'type':'string','minLength':1},'tags':{'type':'array','items':{'type':'string'}}}}},'passages':{'type':'array','items':{'type':'object','required':['id','topicCode','title','sourceGoalIds'],'properties':{'sourceGoalIds':{'type':'array','items':{'type':'string'},'uniqueItems':True}}}},'sourceDocument':{'type':'object','required':['key','path','official']}}}
mapping_schema={'type':'object','required':['version','reviewId','sourceLandscapeId','targetLandscapeId','sourceExtractionPath','status','mappings','decisions'],'properties':{'mappings':{'type':'array','items':{'type':'object','required':['legacyGoalId','canonicalGoalId','matchType','reviewDecisionId'],'properties':{'matchType':{'enum':['exact','partial']}}}},'decisions':{'type':'array','items':{'type':'object','required':['sourceGoalId','decision','canonicalGoalIds','rationale','reviewedAt','reviewer'],'properties':{'canonicalGoalIds':{'type':'array','items':{'type':'string'},'uniqueItems':True}}}}}}
put(O/'checks/BOUNDED.stock-reader-compatible-local-structural-schemas.json',{'role':'Local explicitly bounded structural schemas only; not source science, publication acceptance or official authoring schema','sourceExtraction':source_schema,'mapping':mapping_schema})
actual=[]
for row in n['rows']:
 e=read(R/row['completeExtraction']['path']);m=read(R/row['completeMapping']['path']);assert pin(row['completeExtraction']['path'])==row['completeExtraction'];assert pin(row['completeMapping']['path'])==row['completeMapping']
 jsonschema.Draft202012Validator(source_schema).validate(e);jsonschema.Draft202012Validator(mapping_schema).validate(m)
 actual.append({'jurisdiction':row['jurisdiction'],'stage':row['stage'],'completeExtractionLocalStructuralSchema':'PASS','completeMappingLocalStructuralSchema':'PASS','sourceGoals':len(e['sourceGoals']),'decisions':len(m['decisions']),'legacyEdges':len(m['mappings'])})
canonical=read(R/n['canonicalTargetContext']['path']);runtime=read(R/'docs/landscape-runtime.schema.json')
ops=read(O/'OPERATIONS.twentysix-before-thirtytwo-after-source-and-mapping.author.json')['rows'];affected={e['canonicalGoalId'] for op in ops for e in op['wholeAfterLegacyEdges']}
bounded=copy.deepcopy(canonical);bounded['goals']=[g for g in canonical['goals'] if g['id'] in affected];assert {g['id'] for g in bounded['goals']}==affected
jsonschema.Draft202012Validator(runtime).validate(bounded)
# Recheck every original normal file and the independently inspected source PDF bytes unchanged.
originals={x['path']:x for op in ops for x in [op['originalExtraction'],op['originalMapping']]};assert len(originals)==18
for p in originals.values():assert pin(p['path'])==p
ref=read(O/'retained-inputs/identity-informed-review/REFPINS.review-inputs-and-primary-pages.json');review_pdf_pins={x['path']:x for x in ref['files'] if x['path'].endswith('.pdf')}
current_documents=read(O/'PRESERVED.all-unselected-whole-objects-and-original-eighteen-pins.json')['originalDocumentsReadNotCopied'];assert len(current_documents)==9
for doc in current_documents:assert doc==review_pdf_pins[doc['path']]==pin(doc['path'])
passage_ops=read(O/'OPERATIONS.fifteen-whole-passages-and-four-finding-repairs.author.json')['rows'];assert len(passage_ops)==15
for op in passage_ops:
 p=op['wholeAfter'];before=op['wholeBefore']
 if 'ID-F04' in op['identityFindingDisposition']:
  assert p['text'].startswith('Redaktionelle Zusammenfassung, kein wörtlicher Quellenauszug.') and p['metadata']['rawTextOrigin']['isVerbatimOfficialSourceQuote'] is False
  assert p.get('rawText')==op['wholeFinalFrozenAuthorPassageProposal'].get('rawText')
 if p['id']=='hb-chemistry-sekii:3.3-1-2-PROTOLYSE':assert {k:v for k,v in p.items() if k!='sourceGoalIds'}=={k:v for k,v in op['wholeFinalFrozenAuthorPassageProposal'].items() if k!='sourceGoalIds'}
put(O/'CHECKS.actual-local-schemas-pins-and-four-finding-dispositions.json',{'role':'Actual bounded mechanical tests, no whole-source or machine-M7 acceptance','rows':actual,'selectedPartialTargetObjectCount':len(affected),'selectedPartialTargetGoalIds':sorted(affected),'actualRuntimeSchemaForOnlyAffectedTargetObjects':pin(R/'docs/landscape-runtime.schema.json'),'affectedTargetObjectRuntimeSchema':'PASS','allEighteenNormalBaselineFilesUnchanged':list(originals.values()),'allNineActualPDFsMatchRetainedIndependentReviewPins':current_documents,'allFifteenWholePassagesAndFourFindingRepairs':'PASS','allSelectedIdentitySupportPathsPortable':all(not op['wholeAfterDecisions'][0]['boundedSourceEvidence']['portableIdentityAuthorProposal']['path'].startswith('tmp/') for op in ops),'NormalPAMV':0,'actualAtlasBuildCalls':0,'Native':0,'Central':0,'HumanApproval':False,'HumanTrial':False})
(O/'scripts').mkdir()
for filename in ['serialize_thirtytwo.py','check_bounded_reader.mts','seal_thirtytwo.py']:shutil.copyfile(T/filename,O/'scripts'/filename)
readme='''# Foundation32: bounded complete normal-source adapter author candidate

This finite root contains nine complete source-extraction files and nine complete mapping files. They are normal-shaped full documents, with every unselected SourceGoal, Decision and compatibility edge preserved as an equal whole object. Mapping sourceExtractionPath remains a logical normal alias: use only the explicit candidate alias map in the neutral selector. No normal files, active host, Source Atlas, Native, Normal P/A/M/V, Central or Git state changed.

The exact full current Foundation source683e3037... and original26 before-source74d53ab0... are the source basis. The current-ID proposal and its informed independent identity review90435e63... are retained byte-exact in this repository root. The origin trace keeps former tmp paths as historical provenance only. Operational decision support selects portable retained proposal/REVIEW32/findings pins. Copied historical review manifests retain their old text honestly and do not define a new operative tmp dependency. No private primary fulltext, PDF, media or execution log was copied.

Twenty-one current IDs remain stable. Five old authored composite current IDs and all their old current decisions/edges are removed only in these new files and replaced by eleven pre-named complete HB20/HB23 cells. This gives32 selected current cells, not32 newly approved curricular targets. A retained old ID in historical lineage does not reintroduce it as a current alias.

All15 whole passage candidates are merged explicitly; repeated Q23 proposals were identical. Membership is rebuilt from the complete actual surviving SourceGoal inventory with the exact passageId. Q23 therefore contains the seven new cells and unchanged neighbors035/038/039/040; the old E20 row025 does not remain current. Q23 literal structured passage fields stay exact except for membership. HE-E.2 selects the current21.04.2026 KC2024 PDF. Seven HB20/MV/SN summary passages visibly say “Redaktionelle Zusammenfassung, kein wörtlicher Quellenauszug”; rawTextOrigin explicitly denies verbatim authority for any retained legacy raw summary. Original entire passage objects and extraction bytes remain pinned history. No invented normative apply operator is taken from these summaries.

SL actual main-phase GK/LK document objects already matched the frozen cells exactly in the original registry. The complete registry, including both EP documents for unchanged neighbors, is preserved unchanged. All nine actual selected PDF bytes match the retained independent review pins. No additional source/course inference is made.

Every selected changed/new Decision is an informed technical author ai_candidate, with exact partial contributions, no whole-source union or course approval and HumanApproval/HumanTrial false. The32-cell identity review was informed, not blind or a new scientific/D/P vote. The four findings are mechanically addressed in actual bytes; their original independent reviewer still must inspect the serialized result. Strict M7 progress was not recomputed.

Actual bounded checks passed: all18 normal before pins and26 whole Before bodies; full unchanged-object preservation; unique IDs; one Decision per SourceGoal; edge/Decision set equality; complete current membership of every passage; no dangling passage/target/document; local structural schemas; real runtime schema on only affected target objects; and imported stock sourceAtlasFacet with actual document resolution over all nine complete pairs.32 selected facets exactly match the informed identity support and no reader document HOLD occurred. This is no full-gate run.

Remaining boundary: RP and other overlaps with EDTA/Acid/Alcohol must compose exact before/after operations against their common original normal pins. These complete package candidates must not be integrated by last-writer-wins. Actual final Source projection and current page/context comparison precede Native queue selection.

Own technical scripts/documentation are Apache-2.0. Official source material keeps third-party rights; this output makes no new license or human approval claim.
'''
(O/'README.author-boundaries.md').write_text(readme)
selector={'schemaVersion':1,'role':'Finite bounded Foundation32 normal-source adapter AUTHOR result, informed serialized-byte review pending','neutralInputs':pin(O/'NEUTRAL.nine-complete-source-mapping-pairs.thirtytwo-current-cells.selector.json'),'exactBeforeAfterOperations':pin(O/'OPERATIONS.twentysix-before-thirtytwo-after-source-and-mapping.author.json'),'fifteenWholePassageOperations':pin(O/'OPERATIONS.fifteen-whole-passages-and-four-finding-repairs.author.json'),'portableRetainedIdentitySupport':pin(O/'RETAINED.finite-didactic-inputs.portable-origin-trace.json'),'unchangedObjectPins':pin(O/'PRESERVED.all-unselected-whole-objects-and-original-eighteen-pins.json'),'structuralIdentityChecks':pin(O/'CHECKS.actual-nine-pairs-structural-identity-membership.json'),'actualBoundedStockReader':pin(O/'CHECKS.actual-bounded-reader-stock-facets-and-exact-documents.json'),'actualSchemaAndFindingChecks':pin(O/'CHECKS.actual-local-schemas-pins-and-four-finding-dispositions.json'),'completeExtractionFiles':9,'completeMappingFiles':9,'selectedCurrentSourceCells':32,'stableCurrentSourceIDs':21,'oldBroadCurrentIDsRemoved':5,'newWholeOfficialSourceCells':11,'wholePassages':15,'wholeSourceUnionApproval':False,'wholeCourseApproval':False,'independentScienceVotes':0,'normalPAMVWritten':0,'actualHostsCreated':0,'actualAtlasBuilds':0,'Native':0,'Central':0,'HumanApproval':False,'HumanTrial':False,'activeWrites':0,'GitWrites':0,'strictM7CountChanged':False,'sealPath':(O/'SEAL.finite-thirtytwo-normal-source-adapter-author-output.json').relative_to(R).as_posix()}
put(O/'OUTPUTS.finite-thirtytwo-complete-normal-source-adapter.author-selector.json',selector)
for p in O.rglob('*.json'):read(p)
files=[pin(p) for p in sorted(O.rglob('*')) if p.is_file()]
put(O/'SEAL.finite-thirtytwo-normal-source-adapter-author-output.json',{'schemaVersion':1,'files':files,'outputCountIncludingSeal':len(files)+1,'noSelfHash':True,'allFilesParsedWhereJSON':True})
print(json.dumps({'selector':pin(O/'OUTPUTS.finite-thirtytwo-complete-normal-source-adapter.author-selector.json'),'seal':pin(O/'SEAL.finite-thirtytwo-normal-source-adapter-author-output.json'),'files':len(files)+1,'bytes':sum(p.stat().st_size for p in O.rglob('*') if p.is_file()),'affectedTargetObjects':len(affected),'rows':actual},ensure_ascii=False,indent=2))
