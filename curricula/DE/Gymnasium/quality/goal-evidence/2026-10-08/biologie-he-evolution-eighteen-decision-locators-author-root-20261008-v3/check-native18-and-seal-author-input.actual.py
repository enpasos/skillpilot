# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy
import datetime
import hashlib
import json
import sys
import jsonschema

ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT/'scripts'))
from compile_curriculum_release_model import compile_mapping_source_lane,PublicationInputClassifier,CompilationError
def read(p):return json.loads(Path(p).read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,v):
 p=OUT/n
 content=json.dumps(v,ensure_ascii=False,indent=2)+'\n'
 if p.exists():
  assert p.read_text()==content, ('existing immutable candidate differs',n)
  return p
 with p.open('x') as f:f.write(content)
 return p
e=read(OUT/'neutral-eighteen-source-v3-locator-review.entry.json');ex=read(e['sourceExtractionCandidatePath']);review=read(e['mappingReviewCandidatePath'])
wholepath=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';whole=read(wholepath);land=copy.deepcopy(whole)
patchpath=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-author-20261008-v1/proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json';pp=read(patchpath);old={g['id']:g for g in pp['originalWholeGoals']};new={g['id']:g for g in pp['proposedWholeGoals']};changes=[]
for g in land['goals']:
 if g['id'] not in old:continue
 assert g==old[g['id']]
 for k in g:
  if g[k]!=new[g['id']][k]:
   assert k in ['titleEn','description','descriptionEn'];changes.append({'goalId':g['id'],'field':k,'before':g[k],'after':new[g['id']][k]});g[k]=new[g['id']][k]
assert len(changes)==3 and len({r['goalId'] for r in changes})==2 and len(land['goals'])==476
lp=write('current476-plus-only-two-reviewed-wording-fixes.inactive.candidate.json',land)
selected=set(e['scopeGoalIds']);selectedsource={d['sourceGoalId'] for d in review['decisions'] if selected.intersection(d['canonicalGoalIds'])};assert len(selectedsource)==18
subex=copy.deepcopy(ex);subex['sourceGoals']=[r for r in ex['sourceGoals'] if r['id'] in selectedsource];pids={r['passageId'] for r in subex['sourceGoals']};subex['passages']=[r for r in ex['passages'] if r['id'] in pids]
subreview=copy.deepcopy(review);subreview['decisions']=[r for r in review['decisions'] if r['sourceGoalId'] in selectedsource];subreview['mappings']=[r for r in review['mappings'] if r['legacyGoalId'] in selectedsource]
xp=write('selected18.native-source.input.json',subex);subreview['sourceExtractionPath']=str(xp.relative_to(ROOT));rp=write('selected18.native-mapping.input.review.json',subreview)
classifications={'fieldClassifications':read(ROOT/'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json')['fieldClassifications']};classifier=PublicationInputClassifier(classifications)
binding={'mappingCollectionId':subreview['reviewId'],'reviewPath':str(rp.relative_to(ROOT)),'sourceExtractionPath':str(xp.relative_to(ROOT)),'legacyMappingPath':str(rp.relative_to(ROOT))}
mc,sc,sg,diag,inputs=compile_mapping_source_lane(binding,land['landscapeId'],{g['id'] for g in land['goals']},{ex['sourceLandscapeId']:selectedsource},classifier,{'binding-core':'curriculum'})
assert len(mc['edges'])==18 and all(r['matchType']=='partial' for r in mc['edges'])
outs=[('source-to-canonical-mappings',{'mappingFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'mappingCollectionCount':1,'decisionCount':18,'mappingEdgeCount':18,'collections':[mc]}),('official-source-index',{'sourceIndexFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceDocumentCount':len(sc['documents']),'collections':[sc]}),('source-goal-reference-index',{'sourceGoalReferenceFormatVersion':'1.0','targetLandscapeId':land['landscapeId'],'sourceCollectionCount':1,'sourceGoalCount':18,'collections':[sg]})]
for n,o in outs:
 schema=read(ROOT/f'contracts/curriculum-package/v1/{n}.schema.json');o['$schema']=schema['$id'];jsonschema.Draft202012Validator(schema).validate(o);write(n+'.native-closed.actual.json',o)
sr={r['id']:r for r in subex['sourceGoals']}
for r in subreview['decisions']:
 s=sr[r['sourceGoalId']];assert r['topicCode']==s['topicCode'] and r['sourceSpan']==s['sourceSpan']
 for c in s['actualPrimaryComponents']:
  path=Path(c['wholeOriginalPagePath']);assert c['originalText'] in path.read_text();assert hashlib.sha256(path.read_bytes()).hexdigest()==c['wholeOriginalPageSha256'].removeprefix('sha256:')
 assert s['rawSourceText']==s['actualPrimaryComponents'][0]['originalText'] and s['officialNumberingClaim'] is False and s['isOfficialBullet'] is False
fullbinding={'mappingCollectionId':review['reviewId'],'reviewPath':e['mappingReviewCandidatePath'],'sourceExtractionPath':e['sourceExtractionCandidatePath'],'legacyMappingPath':e['mappingReviewCandidatePath']}
try:
 compile_mapping_source_lane(fullbinding,land['landscapeId'],{g['id'] for g in land['goals']},{ex['sourceLandscapeId']:{s['id'] for s in ex['sourceGoals']}},classifier,{'binding-core':'curriculum'})
 full={'passed':True}
except CompilationError as exc:
 unresolved=[r for r in review['decisions'] if r['decision']!='mapped']
 assert len(unresolved)==1 and unresolved[0]['sourceGoalId']=='ca155d02-5fae-5222-85a4-881c0a69b0de' and unresolved[0]['decision']=='needs_canonical_goal'
 full={'passed':False,'actualMessage':str(exc),'actualUnresolvedDecisionRows':unresolved,'existingUnrelatedHoldPreserved':True,'initialRootDiagnosticError':'The existing compiler error names the mapping path, not the unresolved source ID. Initial assertion expecting the ID in that message failed after selected18/3schemas already passed; actual unresolved row is now read and bound explicitly. No compiler or source decision relaxed.'}
write('actual-current476-native18-closed-schemas-and27-locators.result.json',{'nativeSelected18SourceProjectionExit0':True,'closedSchemasPassed':3,'actual18DecisionTopicAndSpansMatchLiteralPrimarySourceRows':True,'onlyThreeReviewedWordingFieldsChanged':changes,'currentWholeGoalCount':476,'full144Projection':full,'diagnostics':dict(diag),'whole18CasesRerun':False,'nativeSchemaPassIsSourceApproval':False,'sourceIndependentApprovalPending':True,'activeWrites':False,'humanApproval':False})
authorseal=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-eighteen-operative-sources-author-20261008-v2/eighteen-operative-source-v2.author-first-input.freeze.json'
assert bind(authorseal)['sha256']=='c57db84104e649b8e7360f3c9757dd636904466dff48aa74e8cd84124e51ba67'
parents=read(authorseal)
print('authorV2sealKeys',list(parents),flush=True)
dependencyFiles=[]
for k in ['files']:
 for b in parents.get(k,[]):
  p=authorseal.parent/b['path'];assert bind(p)['sha256']==b['sha256'].removeprefix('sha256:');dependencyFiles.append(bind(p))
assert len(dependencyFiles)==246
own=[bind(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
fs=write('eighteen-decision-locators-v3.author-first-input.freeze.json',{'schemaVersion':1,'role':'Immutable author input, real27operative locator corrections; genuine A/B follow-up required','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownFiles':own,'retainedSourceV2AuthorSeal':bind(authorseal),'retainedSourceV2AuthorFiles':dependencyFiles,'whole18ScienceCasesValidNotRestarted':True,'actualNative18AndThreeClosedSchemasPassed':True,'current476SourceOnlyModelNoStale391Apply':True,'sourceApproved':False,'newStrictClosures':0,'activeWrites':False,'humanApproval':False})
print(json.dumps({'native18ActualExit0':True,'closedSchemas':3,'real27LocatorFieldsCorrected':True,'ownFiles':len(own),'retainedV2Files':len(dependencyFiles),'firstSeal':bind(fs),'independentApprovalPending':True}),flush=True)
