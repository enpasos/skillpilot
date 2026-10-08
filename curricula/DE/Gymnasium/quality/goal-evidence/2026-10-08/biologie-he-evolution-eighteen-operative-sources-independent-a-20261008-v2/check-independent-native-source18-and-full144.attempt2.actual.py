"""Use the existing compiler and its existing closed schemas, with no overrides."""
from pathlib import Path
import copy, hashlib, json, sys
from collections import Counter
import jsonschema
ROOT=Path.cwd(); OWN=Path(__file__).parent.relative_to(ROOT)
sys.path.insert(0,str(ROOT/'scripts'))
from compile_curriculum_release_model import compile_mapping_source_lane, PublicationInputClassifier, CompilationError
def read(p):return json.loads(Path(p).read_text())
def write(name,x):
 with (OWN/'native-attempt2'/name).open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
entry=read(OWN/'native-inputs/neutral-final-only.native-entry.json')
ex=read(entry['sourceExtractionCandidatePath']);review=read(entry['mappingReviewCandidatePath'])
delta=read(OWN/'native-inputs/targeted-eighteen-operative-source-before-after.author.json')
selected={d['sourceGoalId'] for d in delta['deltas']}
land=read(OWN/'native-inputs/canonical.current-whole-plus-only-two-reviewed-wording-patches.inactive.candidate.json')
canonical={g['id'] for g in land['goals']}
profile=read('contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json')
# The native general compiler's existing source/mapping field classifications
# are subject-independent. No new classification, enum, ignore or fallback is added.
classifications={'fieldClassifications':profile['fieldClassifications']}
binding={'mappingCollectionId':review['reviewId'],'reviewPath':entry['mappingReviewCandidatePath'],'sourceExtractionPath':entry['sourceExtractionCandidatePath'],'legacyMappingPath':entry['mappingReviewCandidatePath']}
try:
 result=compile_mapping_source_lane(binding,land['landscapeId'],canonical,{ex['sourceLandscapeId']:{s['id'] for s in ex['sourceGoals']}},PublicationInputClassifier(classifications),{'binding-core':'curriculum'})
 write('native-full144-source-projection.first-attempt.actual.json',{'passed':True,'diagnostics':dict(result[3]),'wholeOutputCounts':[len(result[0]['edges']),len(result[1]['documents']),len(result[2]['sourceGoals'])]})
except CompilationError as exc:
 write('native-full144-source-projection.first-attempt.actual.json',{'passed':False,'exceptionType':type(exc).__name__,'actualMessage':str(exc),'scope':'Preserved full144 HOLD: unchanged Neuro GK2 needs_canonical_goal. Bounded18 source compiler is checked separately.','activeWrites':0})
subsetex=copy.deepcopy(ex);subsetex['sourceGoals']=[s for s in ex['sourceGoals'] if s['id'] in selected];pids={s['passageId'] for s in subsetex['sourceGoals']};subsetex['passages']=[p for p in ex['passages'] if p['id'] in pids]
subsetreview=copy.deepcopy(review);subsetreview['decisions']=[d for d in review['decisions'] if d['sourceGoalId'] in selected];subsetreview['mappings']=[d for d in review['mappings'] if d['legacyGoalId'] in selected]
xp=str(OWN/'native-attempt2/eighteen-source-only-native-closed-projection.input.json');rp=str(OWN/'native-attempt2/eighteen-mapping-only-native-closed-projection.input.review.json')
write(Path(xp).name,subsetex);subsetreview['sourceExtractionPath']=xp;write(Path(rp).name,subsetreview)
b={'mappingCollectionId':subsetreview['reviewId'],'reviewPath':rp,'sourceExtractionPath':xp,'legacyMappingPath':rp}
mc,sc,sg,diagnostics,inputs=compile_mapping_source_lane(b,land['landscapeId'],canonical,{ex['sourceLandscapeId']:selected},PublicationInputClassifier(classifications),{'binding-core':'curriculum'})
closed=[('source-to-canonical-mappings',{'mappingFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'mappingCollectionCount':1,'decisionCount':18,'mappingEdgeCount':len(mc['edges']),'collections':[mc]}),('official-source-index',{'sourceIndexFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceDocumentCount':len(sc['documents']),'collections':[sc]}),('source-goal-reference-index',{'sourceGoalReferenceFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceGoalCount':18,'collections':[sg]})]
out=[]
for name,value in closed:
 sp=ROOT/f'contracts/curriculum-package/v1/{name}.schema.json';schema=read(sp);value['$schema']=schema['$id'];jsonschema.Draft202012Validator(schema).validate(value)
 write(name+'.native-closed.candidate.json',value);out.append({'schemaPath':str(sp.relative_to(ROOT)),'schemaSha256':hashlib.sha256(sp.read_bytes()).hexdigest(),'outputPath':str(OWN/'native-attempt2'/(name+'.native-closed.candidate.json')),'nativeSchemaPassed':True})
rows={s['id']:s for s in subsetex['sourceGoals']};checks=[]
for d in delta['deltas']:
 s=rows[d['sourceGoalId']]
 for comp in s['actualPrimaryComponents']:
  page=Path(comp['wholeOriginalPagePath']);body=page.read_text();assert comp['originalText'] in body;assert hashlib.sha256(page.read_bytes()).hexdigest()==comp['wholeOriginalPageSha256'].removeprefix('sha256:');assert hashlib.sha256(comp['originalText'].encode()).hexdigest()==comp['originalTextSha256'].removeprefix('sha256:')
 assert s['rawSourceText']==s['actualPrimaryComponents'][0]['originalText']
 assert s['sourceText']==next(g for g in land['goals'] if g['id']==d['canonicalGoalId'])['description']
 assert s['officialNumberingClaim'] is False and s['isOfficialBullet'] is False
 assert 'bulletIndex' not in s and 'aspectIndex' not in s
 checks.append({'goalId':d['canonicalGoalId'],'sourceGoalId':s['id'],'literalRawAndAllComponentsMatchWholePrimary':True,'authoredTextMatchesWholeCandidateGoal':True,'sourceKind':s['sourceKind'],'category':s['category'],'partialEdges':sum(1 for x in mc['edges'] if x['sourceGoalId']==s['id'] and x['matchType']=='partial')})
assert sum(x['sourceKind']=='authoredModelSpecialisation' for x in checks)==3
assert len(mc['edges'])==18 and all(x['matchType']=='partial' for x in mc['edges'])
write('eighteen-native-source-schema-and-literal-primary-check.actual.json',{'schemaVersion':1,'nativeCompiler':'scripts/compile_curriculum_release_model.py::compile_mapping_source_lane','existingInputClassificationProfile':'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json','subjectSpecificProfileClaim':False,'selectedSourceRows':18,'partialEdges':18,'actualCompilerDiagnostics':dict(diagnostics),'closedSchemaOutputs':out,'checks':checks,'sourceIndependentApprovalCount':0,'whole144NativeReleaseProjectionPassed':read(OWN/'native-attempt2/native-full144-source-projection.first-attempt.actual.json')['passed'],'fullAtlasAPIRequiredSeparately':True,'activeWrites':0,'humanApproval':False})
print(json.dumps({'nativeSelectedSourceRows':18,'nativePartialEdges':18,'closedSchemasPassed':3,'literalWholePrimaryBindingsPassed':18,'nativeFull144ProjectionPassed':read(OWN/'native-attempt2/native-full144-source-projection.first-attempt.actual.json')['passed'],'activeWrites':0}))
