from pathlib import Path
import json,hashlib,copy,sys
from datetime import datetime,timezone
import jsonschema
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent.relative_to(ROOT);A=OWN/'input-snapshots/author-v2'
sys.path.insert(0,str(ROOT/'scripts'))
from compile_curriculum_release_model import compile_mapping_source_lane,PublicationInputClassifier,CompilationError
def read(p):return json.loads(Path(p).read_text())
def write(name,value):
 with (OWN/name).open('x') as f:json.dump(value,f,ensure_ascii=False,indent=2);f.write('\n')
ex=read(A/'DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-portable-final-20261008-v2.source-extraction.json');review=read(OWN/'input-snapshots/author-v3/hessen_biology_upper_secondary.evolution18-decision-locators.author-20261008-v3.review.json');delta=read(A/'targeted-eighteen-operative-source-before-after.author.json')
selected={d['sourceGoalId'] for d in delta['deltas']}
base_ex=read(A/'input-snapshots/curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-ephase-seven-current365-20261005-v2.source-extraction.json')
base_review=read(A/'input-snapshots/curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-ephase-seven-current365-20261005-v2.review.json')
assert len(ex['sourceGoals'])==len(base_ex['sourceGoals'])==len(review['decisions'])==144
assert ex['extractionId']==base_ex['extractionId'] and ex['sourceLandscapeId']==base_ex['sourceLandscapeId']
assert [s['id'] for s in ex['sourceGoals']]==[s['id'] for s in base_ex['sourceGoals']]
assert [s for s in ex['sourceGoals'] if s['id'] not in selected]==[s for s in base_ex['sourceGoals'] if s['id'] not in selected]
assert [d for d in review['decisions'] if d['sourceGoalId'] not in selected]==[d for d in base_review['decisions'] if d['sourceGoalId'] not in selected]
assert [d for d in review['mappings'] if d['legacyGoalId'] not in selected]==[d for d in base_review['mappings'] if d['legacyGoalId'] not in selected]
assert ex['sourceDocuments']==base_ex['sourceDocuments']
gk2=next(d for d in review['decisions'] if d['sourceGoalId']=='ca155d02-5fae-5222-85a4-881c0a69b0de')
assert gk2['decision']=='needs_canonical_goal' and gk2==next(d for d in base_review['decisions'] if d['sourceGoalId']==gk2['sourceGoalId'])
land=read(OWN/'input-snapshots/author-v3/current476-plus-only-two-reviewed-wording-fixes.inactive.candidate.json');canonical={g['id'] for g in land['goals']}
prior=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-independent-b-20261008-v1/targeted-two-wording/whole-canonical.inactive.json')
prior_by_id={g['id']:g for g in read(prior)['goals']};current_by_id={g['id']:g for g in land['goals']}
assert all(current_by_id[d['canonicalGoalId']]==prior_by_id[d['canonicalGoalId']] for d in delta['deltas']),'All18 selected complete goals must equal own genuine previously reviewed two-word repaired bodies.'
profile=read('contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json');classifications={'fieldClassifications':profile['fieldClassifications']}
# Only paths are copied to this packet for the existing native compiler.
full_ex=copy.deepcopy(ex);full_review=copy.deepcopy(review)
full_review['sourceExtractionPath']=str(OWN/'source-full144.native-input.json')
write('source-full144.native-input.json',full_ex);write('mapping-full144.native-input.review.json',full_review)
binding={'mappingCollectionId':review['reviewId'],'reviewPath':str(OWN/'mapping-full144.native-input.review.json'),'sourceExtractionPath':str(OWN/'source-full144.native-input.json'),'legacyMappingPath':str(OWN/'mapping-full144.native-input.review.json')}
full_status={'passed':False,'retainedOpenGoalId':gk2['sourceGoalId']}
try:
 compile_mapping_source_lane(binding,land['landscapeId'],canonical,{ex['sourceLandscapeId']:{s['id'] for s in ex['sourceGoals']}},PublicationInputClassifier(classifications),{'binding-core':'curriculum'})
 raise AssertionError('Whole144 must not silently drop its existing unsupported needs_canonical_goal decision.')
except CompilationError as error:full_status['actualException']=str(error)
write('native-full144-retained-open-GK2.actual.json',full_status)
subsetex=copy.deepcopy(ex);subsetex['sourceGoals']=[s for s in ex['sourceGoals'] if s['id'] in selected];pids={s['passageId'] for s in subsetex['sourceGoals']};subsetex['passages']=[p for p in ex['passages'] if p['id'] in pids]
subsetreview=copy.deepcopy(review);subsetreview['decisions']=[d for d in review['decisions'] if d['sourceGoalId'] in selected];subsetreview['mappings']=[d for d in review['mappings'] if d['legacyGoalId'] in selected]
xp=str(OWN/'source-selected18.native-input.json');rp=str(OWN/'mapping-selected18.native-input.review.json');subsetreview['sourceExtractionPath']=xp
write('source-selected18.native-input.json',subsetex);write('mapping-selected18.native-input.review.json',subsetreview)
binding={'mappingCollectionId':review['reviewId'],'reviewPath':rp,'sourceExtractionPath':xp,'legacyMappingPath':rp}
mc,sc,sg,diagnostics,inputs=compile_mapping_source_lane(binding,land['landscapeId'],canonical,{ex['sourceLandscapeId']:selected},PublicationInputClassifier(classifications),{'binding-core':'curriculum'})
closed=[('source-to-canonical-mappings',{'mappingFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'mappingCollectionCount':1,'decisionCount':18,'mappingEdgeCount':len(mc['edges']),'collections':[mc]}),('official-source-index',{'sourceIndexFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceDocumentCount':len(sc['documents']),'collections':[sc]}),('source-goal-reference-index',{'sourceGoalReferenceFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceGoalCount':18,'collections':[sg]})]
outputs=[]
for name,value in closed:
 p=ROOT/f'contracts/curriculum-package/v1/{name}.schema.json';schema=read(p);value['$schema']=schema['$id'];jsonschema.Draft202012Validator(schema).validate(value)
 write(name+'.independent-b.native-closed.json',value);outputs.append({'schemaPath':str(p.relative_to(ROOT)),'schemaSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'outputPath':str(OWN/(name+'.independent-b.native-closed.json')),'passed':True})
assert len(mc['edges'])==18 and all(edge['matchType']=='partial' for edge in mc['edges'])
report={'recordedAt':datetime.now(timezone.utc).isoformat(),'nativeCompiler':'compile_mapping_source_lane','independentNativeRows':18,'partialEdges':18,'closedSchemas':outputs,'compilerDiagnostics':dict(diagnostics),'all144SourceIdsStable':True,'extractionIdStable':True,'all126UnselectedSourceRowsAndDecisionsExact':True,'unselectedLegacyMappingsExact':True,'sourceDocumentsExact':True,'whole144ReleasePassed':False,'whole144ExistingGK2Hold':gk2,'all18WholeBodiesMatchOwnPreviousWholeScienceAfterTwoWords':True,'unrelatedCurrentResourceLinksPreserved':True,'currentCanonicalInputDenominator':392,'currentWholeGoalCount':476,'operativeDecisionLocatorHOLD':0,'technicalPassDoesNotApproveDecisionLocators':True,'sourceBodyRoles':{'boundedPrimaryCompetencyComponent':15,'authoredModelSpecialisation':3},'reviewAuthority':'ai_candidate','status':'needs_human_review','humanApproval':False,'activeWrites':0}
write('native-eighteen-source-closed-schema-and-preservation.actual.json',report)
print(json.dumps({'nativeRows':18,'closedSchemas':3,'partialEdges':18,'unchangedOthers':126,'stableSourceIds':144,'whole144ReleasePassed':False,'operativeDecisionLocatorHOLD':0}))
