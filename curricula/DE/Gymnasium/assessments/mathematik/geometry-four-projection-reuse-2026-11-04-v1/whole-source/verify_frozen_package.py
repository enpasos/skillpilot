"""Verify frozen private input and content invariants; never grants content approval."""
from pathlib import Path
import json,hashlib
H=Path(__file__).resolve().parent;R=H.parents[2]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(n):return json.loads((H/n).read_text())
manifest=load('review-input-manifest.json')
for entry in manifest['files']:
 p=H/entry['path'];assert p.is_file(),entry['path'];assert sha(p)==entry['sha256'],entry['path'];assert p.stat().st_size==entry['bytes']
for entry in manifest['externalInputBindings']:
 p=R/entry.get('inputRoot','.')/entry['path'];assert sha(p)==entry['sha256'],str(p)
frozen=load('frozen-input.json');canon=load('original/canonical.current.json');by={g['id']:g for g in canon['goals']};assert sha(H/'original/canonical.current.json')==frozen['canonical']['sha256']
pack=load('author-package.json');assert len(pack['forms'])==4
for f in pack['forms']:
 g=load(f['goalId']+'/competency-contract.current.json');assert g==by[f['goalId']];draft=load(f['contentPath']);assert draft['canonicalGoalMutation'] is False and draft['newAssessmentIdAssigned'] is False;assert draft['reviewDecision']=='PENDING_GENUINE_INDEPENDENT_CONTENT_REVIEW'
 e=draft['examDataContent'];assert e['coveredGoalIds']==[f['goalId']];assert e['reviewStatus']=='draft';assert sum(r['points'] for r in e['scoring']['steps'])==e['scoring']['maxPoints']==20;assert e['scoring']['passingPoints']==15
 for field,md,lang in [('taskContent','task','de'),('taskContentEn','task','en'),('solutionContent','solution','de'),('solutionContentEn','solution','en')]:
  source=(H/f['goalId']/f'{md}.{lang}.md').read_text();expected=source if md=='task' else source+'\n'+(H/f['goalId']/f'rubric.{lang}.md').read_text();assert e[field]==expected
  row=next(r for r in load('author-rendering-check.json')['fields'] if r['goalId']==f['goalId'] and r['field']==field);assert hashlib.sha256(e[field].encode()).hexdigest()==row['sha256']
  if md=='task':assert '![' not in source and 'coordinate-views-solution-v1' not in source
assert len(load('current-eight-registered-am-rows.json')['rows'])==8
for short in ['A','M']:
 lines=(H/f'original/registered-before-{short}.review.jsonl').read_text().splitlines();assert len(lines)==807
 for row in load('current-eight-registered-am-rows.json')['rows']:
  if row['lane']==('semantic-atomicity' if short=='A' else 'memory-card-review'):assert lines[row['line']-1]==row['rawCurrentRegisteredLine'];assert json.loads(lines[row['line']-1])==row['wholeCurrentRow']
assert load('original/semantic-kinds.current.json')['counts']['curricularAtomic']==807
p=load('whole-contracts-and-preparation.json');assert p['count']==len(p['wholePreparationContracts'])==41
for g in p['wholePreparationContracts']:assert by[g['id']]==g
for row in p['perGoal']:assert row['wholeContract']==by[row['goalId']];assert row['originalRequires']==by[row['goalId']]['requires']
for copy in load('private-original-copies.json')['copies']:assert sha(H/copy['privateCopy'])==copy['originalBinding']['sha256']
fig=load('solution-figure-boundary.json');assert sha(H/fig['sourcePng'])==fig['pngSha256'];assert sha(H/fig['sourceSvg'])==fig['svgSha256']
assert not (R/fig['futurePublicPath']).exists(),'Private proposed public asset must not have been materialized by this content batch.'
render=load('author-rendering-check.json');assert render['fieldCount']==16 and render['screenshotCount']==24;assert sum(r['images'] for r in render['fields'])==2
for row in render['screenshots']:assert sha(H/row['screenshot'])==row['sha256'];assert row['actualBrowserChecks']['pageOverflow'] is False and row['actualBrowserChecks']['allImagesLoaded'] is True
reuse=load('existing-e3-reuse-whole-scope-candidate-effect.json');assert reuse['wholeUnchangedExistingExam']==by['e3c70a12-7886-51f7-8bcd-ed54865415d6'];assert reuse['counts']['actualScopesRead']==161;assert reuse['counts']['conditionalCandidateEffectScopes']==12;assert reuse['counts']['contextsNeedingRecompile']==120
for effect in reuse['hypotheticalEffects']:assert effect['newlyNeededContextGoalIds']==['5748633c-113f-5ea8-9041-24da55919de7'];assert effect['newProtectedAssessmentCount']==effect['newTargetCount']==0
result={'status':'PASS_FROZEN_PRIVATE_PACKAGE_AND_CURRENT_INPUT_BINDINGS_NO_INDEPENDENT_APPROVAL','manifestSha256':sha(H/'review-input-manifest.json'),'boundFiles':len(manifest['files']),'externalInputBindings':len(manifest['externalInputBindings']),'wholeDraftForms':4,'originalAMRows':8,'originalAMObligationsPerLane':807,'actualRenderedFields':16,'strictKatexExpressions':render['katexExpressions'],'realBrowserScreenshots':24,'wholePreparationContracts':41,'staticConditionalReuseScopes':12,'independentContentReview':'PENDING','canonicalOrRoleMutation':False,'nativeMatrixRun':False,'M7AcceptanceClaim':False}
(H/'frozen-verification.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result))
