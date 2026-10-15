from pathlib import Path
import json,copy,hashlib,datetime,sys,shutil
import jsonschema
R=Path('/home/enpasos/projects/skillpilot')
rel=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-four-original-HB-BW-ST-scope-duty-remediation-author-20261014-v1');O=R/rel
C=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-source34-minimal18-whole-scope-fresh-independent-c-20261014-v1'
def L(p):return json.loads((O/p).read_text())
def S(p,j):
 q=O/p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def H(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):return {'path':str(p.relative_to(R)),'sha256':H(p),'bytes':p.stat().st_size}
before=L('before/canonical539.current412.exact.json');after=L('candidate/canonical540.current413.one-new-research-operator.author.json');new=L('candidate/one-new-whole-atomic-goal.author.json');cases=L('cases/five-source-duty-units-ten-complete-DEEN-cases.author.json')
ids=set(x for u in cases['units']for x in u['wholeCurrentGoalIds']);required=set(x for g in after['goals']if g['id']in ids for x in g.get('requires',[]))
S('candidate/WHOLE.existing-partner-goals-new-author-goal-and-direct-prerequisites.json',{'authorOnly':True,'selectedWholeGoalIds':sorted(ids),'directPrerequisiteIds':sorted(required),'wholeGoalBodies':[g for g in after['goals']if g['id']in ids|required],'notAnIndependentReview':True})
primary=[]
for code,pages,path in [
 ('HB',[34,36,37],'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf'),
 ('BW',[42],'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf'),
 ('ST',[31],'curricula/DE/Gymnasium/input/ST/FLP_Chemie_Gym_01082022_swd.pdf')]:
 for page in pages:
  text=C/f'primary-read/{code}.physical-{page}.actual-bounded-page.txt'
  row={'primaryPdf':binding(R/path),'physicalPage':page,'actualOriginalBoundedText':binding(text),'context':'full actual original page, including compulsory/example/course distinctions; read the actual PDF/page, not a compiler verdict'}
  img=C/f'primary-read/screens/{code}.physical-{page}.actual-page.png'
  if img.exists():row['actualOriginalPageRender']=binding(img)
  primary.append(row)
# ST physical30 is the first page of the original carbon competency table; actual PDF remains primary.
primary.append({'primaryPdf':binding(R/'curricula/DE/Gymnasium/input/ST/FLP_Chemie_Gym_01082022_swd.pdf'),'physicalPage':30,'context':'read this actual original table page for the161/174 model structure/property clauses;31 is continuation with nanotubes'})
S('primary/actual-original-primary-pages.exact-bindings.json',{'notAnApproval':True,'pages':primary,'supplementaryDyePrimaryReferences':[{'url':'https://www.basf.com/global/de/who-we-are/history/chronology/1865-1901/1897','usedOnlyFor':'Historical1897 launch of synthetic indigo. Corporate first-party history, not a neutral environmental evaluation.'},{'url':'https://www.acs.org/molecule-of-the-week/archive/i/indigo.html','usedOnlyFor':'Indigo insolubility, reduced leuco form and aerial oxidation; supplied fictional future-study data remain explicitly invented.'}],'thirdPartyRights':'Actual original authority pages remain third-party official source material, not relicensed by this author packet; own drafted teaching cases/goal wording are CC-BY-4.0.'})

changes=[]
def diff(a,b,path=''):
 if type(a)!=type(b):return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):
  out=[]
  for k in sorted(a.keys()|b.keys()):
   if k not in a:out.append({'path':path+'/'+k,'beforeAbsent':True,'after':b[k]})
   elif k not in b:out.append({'path':path+'/'+k,'before':a[k],'afterAbsent':True})
   else:out+=diff(a[k],b[k],path+'/'+k)
  return out
 if isinstance(a,list):
  # Whole cells/rows are recorded rather than misleading index shifts after an append/removal.
  if a==b:return []
  return [{'path':path,'before':a,'after':b}]
 return []if a==b else [{'path':path,'before':a,'after':b}]
oldgoals={g['id']:g for g in before['goals']};newgoals={g['id']:g for g in after['goals']}
changedOld=[g for g in oldgoals if oldgoals[g]!=newgoals[g]]
assert changedOld==['4a98bbee-41cb-5aef-91c6-f18d7bf2a214']
pd=diff(oldgoals[changedOld[0]],newgoals[changedOld[0]])
assert {d['path']for d in pd}=={'/contains','/weight'}
assert newgoals[changedOld[0]]['contains']==oldgoals[changedOld[0]]['contains']+[new['id']]
assert newgoals[changedOld[0]]['weight']==11
assert [g['id']for g in after['goals']if g['id']not in oldgoals]==[new['id']]
changes.append({'carrier':'canonical','unchangedExistingWholeBodies':538,'newAtomicIds':[new['id']],'oneChangedParentWholeBefore':oldgoals[changedOld[0]],'oneChangedParentWholeAfter':newgoals[changedOld[0]],'exactChangedFields':pd,'rawRootBodyUnchanged':True})
hb0=L('before/HB-source.json');hb1=L('candidate/HB-source.author.json');st0=L('before/ST-source.json');st1=L('candidate/ST-source.author.json');bw0=L('before/BW-source.json');bw1=L('candidate/BW-source.unchanged.json')
assert hb1['sourceGoals'][:len(hb0['sourceGoals'])]==hb0['sourceGoals']
assert hb1['passages'][:len(hb0['passages'])]==hb0['passages']
assert len(hb1['sourceGoals'])==92 and len(hb1['passages'])==28
changedST=[(a,b)for a,b in zip(st0['sourceGoals'],st1['sourceGoals'])if a!=b]
assert len(changedST)==1 and '-188-'in changedST[0][0]['id']
assert bw0==bw1 and H(O/'before/BW-source.json')==H(O/'candidate/BW-source.unchanged.json')
changes.append({'carrier':'HB-source','wholeExisting89SourceCellsExactUnchanged':True,'wholeExisting25PassagesExactUnchanged':True,'newSourceCells':hb1['sourceGoals'][89:],'newPassages':hb1['passages'][25:],'pipelineMetadataDelta':diff(hb0['pipelineStatus'],hb1['pipelineStatus']),'qualityMetadataDelta':diff(hb0['qualityReview'],hb1['qualityReview'])})
changes.append({'carrier':'ST-source','269OtherSourceCellsExactUnchanged':True,'wholeChangedSourceCellBefore':changedST[0][0],'wholeChangedSourceCellAfter':changedST[0][1],'exactChangedCellFields':diff(*changedST[0]),'passageDelta':diff(st0['passages'],st1['passages']),'pipelineDelta':diff(st0['pipelineStatus'],st1['pipelineStatus'])})
changes.append({'carrier':'BW-source','whole126SourceCellsAnd13PassagesByteExactUnchanged':True})
props=L('candidate/seven-exact-source-decision-proposals.author.json')['rows']
assert len(props)==7
for code in ['HB','BW','ST']:
 b=L(f'before/{code}-mapping.json');a=L(f'candidate/{code}-mapping.author-pending.json');touch={r['sourceGoalId']for r in props if r['jurisdiction']==f'DE-{code}'}
 assert [r for r in b['mappings']if r['legacyGoalId']not in touch]==[r for r in a['mappings']if r['legacyGoalId']not in touch]
 assert [d for d in b['decisions']if d['sourceGoalId']not in touch]==[d for d in a['decisions']if d['sourceGoalId']not in touch]
 assert all(d['decision']=='pending_independent_review'and not d['reviewer']and not d['reviewedAt']for d in a['decisions']if d['sourceGoalId']in touch)
 changes.append({'carrier':f'{code}-mapping','sourceGoalIdsChanged':sorted(touch),'allOtherEdgesAndDecisionsExactUnchanged':True,'changedDecisionsDoNotCountAsMappedOrReviewed':True,'topLevelDeltaExcludingRows':diff({k:v for k,v in b.items()if k not in ['mappings','decisions']},{k:v for k,v in a.items()if k not in ['mappings','decisions']})})
for name in ['de-hb-lk','de-bw-lk','de-st-gk','de-st-lk']:
 b=L(f'before/{name}.view.json');a=L(f'candidate/{name}.view.author.json')
 changes.append({'carrier':name,'wholeViewBeforeBinding':binding(O/f'before/{name}.view.json'),'wholeViewAfterBinding':binding(O/f'candidate/{name}.view.author.json'),'exactChangedFields':diff(b,a)if name=='de-bw-lk'else ('no changes; byte exact'if name.startswith('de-st')else 'exact authored HB goalEntry additions visible in stock-runtime target delta and whole before/after; no other entries rewritten')})
S('checks/EXACT.whole-before-after-CAS-and-affected-fields.json',{'technicalOnly':True,'scienceApproval':False,'noExistingAtomicBodyChanges':True,'noExistingRequiresChanges':True,'rootWeightAndBodyPreserved':True,'source6Rest6M311NotAdoptedOrOverwritten':True,'changes':changes})

schema=json.loads((R/'contracts/curriculum-package/v1/composition-view.schema.json').read_text());schemaRows=[]
for p in sorted((O/'candidate/schema-only').glob('*.json')):
 errs=[{'path':list(e.absolute_path),'message':e.message}for e in jsonschema.Draft202012Validator(schema).iter_errors(json.loads(p.read_text()))]
 assert not errs,(p,errs)
 schemaRows.append({'binding':binding(p),'schema':str((R/'contracts/curriculum-package/v1/composition-view.schema.json').relative_to(R)),'errors':errs})
runtime_schema=json.loads((R/'docs/landscape-runtime.schema.json').read_text())
runtime_errors=[]
for p in [O/'before/canonical539.current412.exact.json',O/'candidate/canonical540.current413.one-new-research-operator.author.json']:
 errs=[{'path':list(e.absolute_path),'message':e.message}for e in jsonschema.Draft202012Validator(runtime_schema).iter_errors(json.loads(p.read_text()))]
 runtime_errors.append({'binding':binding(p),'errors':errs})
assert runtime_errors[1]['errors']==runtime_errors[0]['errors'],runtime_errors
assert len(cases['units'])==5 and sum(len(u['cases'])for u in cases['units'])==10
assert all(len(c['rubric'])==4 and all(c.get(k)for k in ['materialDe','materialEn','taskDemandDe','taskDemandEn','modelAnswerDe','modelAnswerEn'])and not c['executed']and not c['learnerWorkPresent']and c['evidenceLevel']=='E0'for u in cases['units']for c in u['cases'])
assert all(',, 'not in c['materialEn']and ',;'not in c['materialDe']for u in cases['units']for c in u['cases'])
S('checks/SCHEMA-and-complete-material-shape.actual.json',{'technicalOnly':True,'closedViewSchemaChecks':schemaRows,'canonicalRuntimeSchemaBeforeAfter':runtime_errors,'newCanonicalSchemaErrors':0,'caseUnits':5,'completeDEENCases':10,'explicitRubricExpectations':40,'allCasesE0G0UnexecutedAuthorOnly':True,'scienceApproval':False,'scopeBoundary':'Schema validity and supplied material completeness do not establish semantic sufficiency or approve a source union.'})

shutil.copyfile('/tmp/author_four_duty_sources_20261014.py',O/'reproduction/author-exact-four-duty-carriers.py')
shutil.copyfile('/tmp/author_four_duty_cases_20261014.py',O/'reproduction/author-ten-complete-DEEN-material-cases.py')
neutral={'schemaVersion':1,'role':'AUTHOR candidate, not an independent review','authorRoleTransition':'Same agent previously sealed Source34-C; that unchanged C result is not an independent vote for THIS authored successor. Other reviewers must inspect actual originals/full bodies/materials.','bindingOrder':['actual originals and course/choice conditions','full existing and new whole goals','all ten complete supplied cases and rubrics','whole source/mapping/programme before/after','technical delta/checks only after own science determination'],'primary':binding(O/'primary/actual-original-primary-pages.exact-bindings.json'),'wholeGoals':binding(O/'candidate/WHOLE.existing-partner-goals-new-author-goal-and-direct-prerequisites.json'),'newWholeGoal':binding(O/'candidate/one-new-whole-atomic-goal.author.json'),'allCases':binding(O/'cases/five-source-duty-units-ten-complete-DEEN-cases.author.json'),'sourceAndMappingWholePairs':[{'jurisdiction':f'DE-{code}','sourceBefore':binding(O/f'before/{code}-source.json'),'sourceAfter':binding(O/f'candidate/{code}-source.author.json')if code!='BW'else binding(O/'candidate/BW-source.unchanged.json'),'mappingBefore':binding(O/f'before/{code}-mapping.json'),'mappingAfter':binding(O/f'candidate/{code}-mapping.author-pending.json')}for code in ['HB','BW','ST']],'programmePairs':[{'name':name,'before':binding(O/f'before/{name}.view.json'),'after':binding(O/f'candidate/{name}.view.author.json')}for name in ['de-hb-lk','de-bw-lk','de-st-gk','de-st-lk']],'conditions':binding(O/'candidate/exact-course-and-selected-family-author-conditions.json'),'canonicalBefore':binding(O/'before/canonical539.current412.exact.json'),'canonicalAfter':binding(O/'candidate/canonical540.current413.one-new-research-operator.author.json'),'closureClaims':0,'pendingQuestions':['Does each existing goal union actually carry the supplied original source operator, including Wirkstoff concept and selected-family future research, rather than just contribute useful foundations?','Is the sole new research-feedback goal minimal and nonduplicating, and are its two complete cases adequate author designs for later independent D/P/A/M/V work?','Does HB nanotechnology cover both actual selected polymer-matrix reinforcement and surface nanostructuring without incorrect chemistry or unearned safety conclusions?','Do ST cases retain the actual carbon/allotrope/nanotube context at appropriate SekI level?','HB5e2 has one new direct edge to fcc73, which was already absent in the before view despite existing42a84/5a709 requirements. The author neither changes requires nor invents prerequisiteOnly scope; this baseline dependency issue remains explicit.'],'notPermissions':['No H/active integration','No existing strict closure or new independent gate vote','No human review/release/efficacy claim','No Source6/Rest6/M311 adoption','No Git publication/build']}
S('NEUTRAL.exact-whole-four-original-duty-author-successor-inputs.json',neutral)

(O/'README.md').write_text('''# Four original HB/BW/ST duties — author successor only

This packet is a deliberately **inactive, unreviewed author candidate**. It does not close the four original-source HOLDs, grant any D/P/A/M/V gate, or change H/current source/runtime/Git. The immutable earlier Source34-C review and V2-A records remain unchanged. Their author became the author of this successor, so those older votes are **not independent reviews of these new proposals**.

## Exact proposal

- HB: preserve all89 existing source cells/25passages. Append exactly3 actual compulsory LK clauses (plastic nanotechnology on34; active-ingredient concept/isolation and analysis/synthesis/MolecularModelling on36, course rule37). Existing atoms contribute tightly bounded PARTIAL unions. One genuinely absent research-feedback operator is drafted as atomic93a7ce4d-1c90-568c-9368-cac423011ef9, with two complete supplied DE/EN cases and rubrics. This remains unreviewed and has no image/memory/positive-execution evidence.
- HB-LK: add exactly3 target entries (5e2eb826, dfbccd62, new93a7ce4d), no GK change. Existing539 bodies remain byte-logically unchanged except the pharmacy parent receives the new child and its derived weight10→11. The old raw root body/weight1.2 is preserved.
- BW: preserve the126-cell original extraction exactly. Make the existing selected **dye** family explicit in the Leistungsfach view label. Historical/current/future research is instantiated in two complete supplied material cases and linked to five existing atomic contributions; the old dye cluster alone is navigation, not research-duty proof. Other suggested families are alternatives, not simultaneous duties. No target is added.
- ST: preserve269 other cells; correct nanotube cell188’s physical locator to31 with a narrowly bound continuation passage. Replace unrelated overbroad mappings for the carbon structure/property operators161/174 with the existing02dc29ae PARTIAL. Retain dimension/nano contributions for188 and add actual carbon structure context. Two complete supplied cases use diamond/graphite/tubes and modern composite material. Both current views stay byte exact; no new GK nano target.
- All7 changed source decisions deliberately say `pending_independent_review`, with empty reviewer/reviewedAt. They cannot be counted as mapped scientific approval. Existing unaffected historical rows remain unchanged.

## Checks and open limits

The four actual stock runtime/compiler checks have no new compiler errors or removed targets. Closed composition shape and canonical runtime schema checks are supplied. Before views already contain direct prerequisite gaps; adding5e2 creates one new edge to the SAME already missingfcc73 prerequisite. No new missing prerequisite ID appears. This is disclosed and left unresolved rather than changing requires or inferring projection roles.

All10 cases are complete theoretical author designs (40 rubric expectations), **E0/G0, unexecuted**, not demonstrated learner work or full-profile replacements for existing goals. Model values and study scenarios are explicitly invented. Supplementary real indigo history/chemistry references are separately attributed; actual official pages retain third-party rights. No materials are handled and no therapeutic directions are given.

Start independent work with `NEUTRAL.exact-whole-four-original-duty-author-successor-inputs.json`. Judge source-duty semantics and whole bodies before relying on the technical checks. In particular, reviewers must assess whether the existing active-ingredient and BW-future-research unions truly carry those operators or still need a narrower author correction. No proposed union has been presupposed KEEP.

Own goal/case content: CC-BY-4.0. Technical reproduction/checking files: Apache-2.0. Third-party sources are not relicensed. Root owns H and all integration. Source6, Rest6 and M311 remain separate.
''')
print(json.dumps({'newAtom':new['id'],'wholeExistingAtomsUnchanged':412,'sevenChangedRowsPending':len(props),'viewsSchemaPass':len(schemaRows),'newCanonicalSchemaErrors':0,'cases':10,'rubricExpectations':40,'neutralSHA256':H(O/'NEUTRAL.exact-whole-four-original-duty-author-successor-inputs.json'),'scientificClosures':0}))
