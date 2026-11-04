"""Freeze exact existing contracts, source bindings and actual review context."""
from pathlib import Path
from hashlib import sha256
import json,re,subprocess
H=Path(__file__).resolve().parent;R=H.parents[2]
assert not (H/'content-review-handoff.json').exists()
load=lambda p:json.loads(p.read_text())
bind=lambda p:{'path':str(p.relative_to(R)),'sha256':sha256(p.read_bytes()).hexdigest()}
cp=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';canon=load(cp);by={g['id']:g for g in canon['goals']}
ids=['50612a57-7b9d-45fd-bc08-e95556444760','49f9059a-876c-5051-8146-d008b5cc691c','8e18154d-41d6-592e-ba98-537edad338e8','5ba7b5aa-7ad5-5605-bcb5-f4aa4b4c6b2d']
all_r=set();contexts=[]
for i in ids:
 g=by[i];assert not g.get('examData') and not g.get('nodeKind')
 p=H/i;p.mkdir(exist_ok=True);(p/'competency-contract.current.json').write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n')
 seen=set();todo=list(g['requires'])
 while todo:
  j=todo.pop()
  if j in seen:continue
  assert j in by,j
  seen.add(j);todo.extend(by[j].get('requires',[]))
 all_r.update(seen);contexts.append({'goalId':i,'wholeCurrentGoal':g,'directRequires':g['requires'],'transitiveRequiresGoalIds':sorted(seen),'transitiveRequiresGoalCount':len(seen)})
frozen={'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'canonical':bind(cp),'AGENTS':bind(R/'AGENTS.md'),'wholeGoals':[by[i] for i in ids],'noCanonicalMutation':True}
(H/'frozen-input.json').write_text(json.dumps(frozen,ensure_ascii=False,indent=2)+'\n')
(H/'whole-contracts-and-preparation.json').write_text(json.dumps({'canonical':bind(cp),'goals':contexts,'wholePreparationUnion':[by[i] for i in sorted(all_r)],'preparationMeaning':'Original authored R only. It is not assessed coverage and does not create mastery. No new R or goal IDs.'},ensure_ascii=False,indent=2)+'\n')

am=[]
for lane in ['semantic-atomicity','memory-card-review']:
 p=R/f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json';cfg=load(p);rp=R/cfg['reviewPath']
 for n,line in enumerate(rp.read_text().splitlines(),1):
  row=json.loads(line)
  if row.get('goalId') in ids:am.append({'lane':lane,'registeredConfig':bind(p),'registeredReview':bind(rp),'line':n,'wholeCurrentRow':row})
assert len(am)==8
(H/'current-eight-registered-am-rows.json').write_text(json.dumps({'status':'ORIGINAL_CURRENT_ROWS_ONLY_NO_NEW_REVIEW_DECISION','rows':am},ensure_ascii=False,indent=2)+'\n')

pairs=[
 ('curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json','curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'),
 ('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json','curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json'),
 ('curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json','curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json'),
 ('curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json','curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_MATHEMATIK_SEKI_BP2016.source-extraction.json')]
records=[]
for mp,sp in pairs:
 m=load(R/mp);s=load(R/sp);goals={g['id']:g for g in s['sourceGoals']};passages={p['id']:p for p in s['passages']}
 for row in m['mappings']:
  if row.get('canonicalGoalId') not in ids:continue
  g=goals[row['legacyGoalId']];p=passages[g['passageId']];key=g.get('sourceDocumentKey',p.get('sourceDocumentKey'));source=g.get('sourcePath',p.get('sourcePath'))
  docs=s.get('sourceDocuments',[])
  candidates=[d for d in docs if (not key or d.get('key')==key) and (not source or d.get('path')==source)]
  # Resolve the particular sourceGoal/passsage binding. Never take docs[0].
  assert len(candidates)==1,(sp,g['id'],key,source,[d.get('key') for d in candidates])
  document=candidates[0];assert document['path']==source
  decisions=[d for d in m.get('decisions',[]) if d.get('sourceGoalId',d.get('legacyGoalId',d.get('id')))==g['id']]
  records.append({'canonicalGoalId':row['canonicalGoalId'],'mapping':bind(R/mp),'extraction':bind(R/sp),'wholeMappingRow':row,'wholeSourceGoal':g,'wholeSourcePassage':p,'selectedSourceDocument':document,'selectedPhysicalDocument':bind(R/document['path']),'wholeMappingDecisions':decisions,'firstHeaderNotUsed':s.get('sourceDocument'),'bindingMethod':'Exact sourceGoal/passsage sourceDocumentKey + sourcePath to one sourceDocuments entry.'})
primary={i:[r for r in records if r['canonicalGoalId']==i][0] for i in ids}
assert primary[ids[0]]['selectedSourceDocument']['key']=='JGST10'
assert primary[ids[1]]['selectedSourceDocument']['key']=='JGST12_EA'
assert primary[ids[2]]['selectedSourceDocument']['key']=='JGST12_VERTIEFUNG'
(H/'document-specific-source-context.json').write_text(json.dumps({'status':'EXACT_DOCUMENT_SPECIFIC_EXISTING_SOURCE_BINDINGS_NO_SOURCE_OR_SCOPE_MUTATION','records':records,'primarySourceDocumentKeys':{i:r['selectedSourceDocument']['key'] for i,r in primary.items()},'headerTrapAvoided':True,'asymptoticFormulaRecovery':{'localPdf':'curricula/DE/Gymnasium/input/BY/raw/Gymnasium_Mathematik_Jgst_12_eA.pdf','physicalPage':1,'observation':'Local text and actually viewed page show empty formula boxes. The official HTML and two official SVG resources were read, saved and viewed; no claim that the local PDF itself contained readable formulas.','officialUrl':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer','officialSvgResources':['https://www.lehrplanplus.bayern.de/sixcms/media.php/84/GYM_M_12-1.19308.svg','https://www.lehrplanplus.bayern.de/sixcms/media.php/84/GYM_M_12-2.svg'],'visibleOriginalExpressions':['limit x→+∞ of x^n/e^x','limit x→−∞ of x^n*e^x'],'noExtractionRepairOrNewSourceApprovalClaimed':True}},ensure_ascii=False,indent=2)+'\n')

rx=re.compile(r'Kegel|\bcone\b|Pyramid|asymptot|e-Funktion.*dominiert|exponential dominates|Einheitswurz|roots of unity|konjugiert|conjugate|Komplexe Zahlen|complex numbers',re.I)
matches=[]
for g in canon['goals']:
 e=g.get('examData')
 if not e:continue
 direct=set(g.get('requires',[]))&set(ids);covered=set(e.get('coveredGoalIds',[]))&set(ids)
 text=' '.join(e.get(k,'') for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn'])
 if direct or covered or rx.search(text):matches.append({'wholeExistingExamGoal':g,'requestedIdsInAuthoredR':sorted(direct),'requestedIdsInCoverageMetadata':sorted(covered)})
priority=R/'tmp/approach-review-20261101/astra-next-math-route-priorities-20261104-v1/report.md'
conclusions={'cone':'Keep existing BW drone/space-line exam intact. It has foreign substantive preparation and a 5/10 threshold; broad whole-exam reuse is not a clean cone-limit form. Pure cone-volume/composite-solid/pyramid-integration tasks in the lexical matches do not establish the polygonal-pyramid limiting explanation. New isolated cone-limit content is justified, with no scope/role decision here.','asymptotic':'B2 5d3fd2c4 is actual whole reuse candidate in the separately proposed 36 compatible scopes. This new content is only for the remaining BY gap; no global extra obligation. A1 57c6506d covers a linear-power quotient plus extrema/sketch under 3/5 scoring, not the whole two-direction comparison contract. No metadata/threshold is changed.','unity':'No actual whole exam for determining and geometrically interpreting roots of unity was found. The complex-number history task is not such a task.','division':'No actual whole algebraic complex-division/conjugate task was found. The historical complex-number task does not assess the operation.'}
(H/'whole-existing-exams-and-reuse.json').write_text(json.dumps({'status':'ACTUAL_CURRENT_WHOLE_EXAMS_AND_R_INSPECTED_BOUNDED_CONTENT_DECISIONS_ONLY','canonical':bind(cp),'matches':matches,'authorConclusions':conclusions,'priorityRecommendation':bind(priority),'priorityIsStaticPlanningNotCurrentNativeAcceptance':True,'noExistingExamChanged':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'wholeCurrentContracts':4,'AMRows':8,'sourceRecords':len(records),'selectedKeys':{i:r['selectedSourceDocument']['key'] for i,r in primary.items()},'wholeReuseMatches':len(matches),'preparationCounts':[g['transitiveRequiresGoalCount'] for g in contexts],'preparationUnion':len(all_r)}))
