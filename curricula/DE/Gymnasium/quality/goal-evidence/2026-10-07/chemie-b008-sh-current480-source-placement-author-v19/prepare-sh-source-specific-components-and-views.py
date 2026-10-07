# SPDX-License-Identifier: Apache-2.0
"""Inactive SH components with portable own receipts; primary PDF text stays in tmp."""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re
ROOT = Path.cwd(); OWN = Path(__file__).resolve().parent
V12 = OWN.parent / 'chemie-b008-current169-routing-placement-author-v12'
PREVIOUS = OWN.parent / 'chemie-b008-hb-current480-source-placement-author-v18'
assert not (OWN / 'author.final.freeze.json').exists()
def read(p): return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
for p in read(PREVIOUS/'author.corrected-portable-receipts.final.freeze.json')['payloads']:assert bind(ROOT/p['path'])==p
assert bind(ROOT/read(PREVIOUS/'current480-three-way-bounded-field-rebase.actual.json')['current480']['path'])==read(PREVIOUS/'current480-three-way-bounded-field-rebase.actual.json')['current480']
candidate=read(PREVIOUS/'candidate/canonical.current504-hb-source-metadata.author-candidate.json');before=deepcopy(candidate);by_goal={g['id']:g for g in candidate['goals']}
routine_ids=read(V12/'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
original=read(V12/'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json');duties=[r for r in original['originalWholeDuties'] if '/SH/' in r['sourceExtractionPath']];assert len(duties)==158
sources={};passages={};source_inputs=[];texts={}
for stage,directory in [('SekI','lower-secondary'),('SekII','upper-secondary')]:
 path=next((ROOT/f'curricula/DE/Gymnasium/input/SH/{directory}/source-extraction').glob('*CHEMIE*.source-extraction.json'));source=read(path);sources[stage]=source;passages[stage]={r['id']:r for r in source['passages']}
 texts[stage]=(ROOT/f'tmp/chemie-b008-sh-v19-primary/SH.layout.txt').read_text().split('\f')
 source_inputs.append({'stage':stage,'exactCurrentExtraction':bind(path),'exactSnapshot':bind(OWN/'inputs'/f'{directory}.exact-sh-source-extraction.json.bin'),'actualPrimaryPdf':bind(ROOT/source['sourceDocument']['path']),'officialSourceDocuments':source.get('sourceDocuments',[source['sourceDocument']])})
notes={
 ('SekI',12):'Current lower progression covers5/6 and7-9 or7-10; actual entry time can vary. No invented fixed year is imposed.',
 ('SekI',13):'Own chemical applications, research/career orientation and social relevance; personal career choice is not fully established.',
 ('SekI',16):'Gymnasium specifically prepares transition into upper secondary, not just an ESA/MSA minimum.',
 ('SekI',17):'Whole lower process competencies are cumulative, tied to content, age, autonomy and demand; not every detail is a grade5/6 obligation.',
 ('SekI',18):'Whole actual question/hypothesis/design/real safe experiments/protocol/data/models/limits table. Historical one-source truncation ending ggf remains open.',
 ('SekI',19):'Whole actual information/representation/presentation/arguments/decision table. Audience/source operations remain specific components.',
 ('SekI',20):'Content progression and actual marking of transition-to-upper requirements; late start does not remove lower prerequisites.',
 ('SekII',30):'Whole stage definition and common AHR basis; actual process dimensions develop cumulatively.',
 ('SekII',31):'Society/career orientation and sustainable everyday decisions; no whole personal career-choice result.',
 ('SekII',36):'Whole four upper competence areas, strengthened autonomy, real experimental methods.',
 ('SekII',37):'Generic upper competencies have no compulsory fixed content example; contents arise from teaching. Their native existing source IDs are not invented.',
 ('SekII',39):'Whole upper theory/hypothesis/design/safe real experiments and digital measurement operators; no fictitious corresponding source-goal IDs.',
 ('SekII',40):'Whole upper data/theory/hypothesis/precision/models/reflection/scientific-limit operators.',
 ('SekII',41):'Whole upper source research/comparison/trustworthiness and representation conversion operators.',
 ('SekII',42):'Whole presentation/source attribution/fachlanguage/discourse and representation of real data.',
 ('SekII',43):'Whole data/source intention/criteria/risks/society/career-relevance standards; no full personal choice evidence.',
 ('SekII',44):'Whole historical/current effects, sustainability and decision-reflection context.',
 ('SekII',45):'Exact stage placement and enhanced/profile content markings; noncontinuous courses may reduce content scope and remain outside a full-through-course claim.',
 ('SekII',58):'E and Q objectives and noncontinuous course restriction; generic operator examples do not erase narrower course choices.',
 ('SekII',59):'Actual typographic enhanced-level convention and flexible E/Q placement; optional additional GK instruction is not mandatory GK scope.',
 ('SekII',60):'Actual E profile/elevated versus basic-level autonomy and three common fields; partial source application only.',
 ('SekII',61):'Actual energy field provides applications/sustainable energy and occupational contexts, not all personal career choice.',
 ('SekII',62):'Actual common E energy/materials/sustainability source bodies, with separate enhanced mechanism note.',
 ('SekII',63):'Q fourfields all treated; LIFE selected proteins/carbohydrates/fats and LK-specific selections remain choices, not compulsory alltopics.',
 ('SekII',64):'Actual amino-acid chromatographic RF analysis is enhanced-only right-column content; not GK.',
 ('SekII',65):'Actual fat experimental indices are enhanced-only; common fat evaluation is qualitative. Exactly one WATER orSOIL environment mandatory, common analytics precision/errors/limits apply within chosen context.',
 ('SekII',66):'Actual water/soil/air content and chosen teaching focus. Enhanced chromatographic/instrumental analysis is not silently GK. Water/SOIL choice is retained.',
}
receipts={}
for (stage,page),note in notes.items():
 doc=sources[stage]['sourceDocument'];raw=texts[stage][page-1].encode();p=OWN/'primary-receipts'/f'{stage}.physical-page-{page:03}.own-reading-receipt.json'
 write(p,{'role':'Own actual whole primary-page reading receipt; no full official text export','officialSourceDocument':doc,'actualSourcePdf':bind(ROOT/doc['path']),'physicalPage1Based':page,'printedPage':page,'wholePageTextExtractionSha256':hashlib.sha256(raw).hexdigest(),'wholePageTextExtractionBytes':len(raw),'reproductionCommand':['pdftotext','-layout',doc['path'],'<local-tmp-output>'],'pageSelection':'Split actual layout output on form-feed; use index physicalPage1Based-1','ownBoundedReadingResult':note,'wholePageActuallyRead':True,'rawOfficialTextCommitted':False,'independentApproval':False})
 receipts[(stage,page)]=bind(p)
# Existing source goals, always a specific component; upper operator sections lack their own IDs.
lower=[
 ('5244d156','lower-chemical-question-hypothesis',18,[16,17],'Actual problem question based on prior knowledge; additional whole scientific scope stays partial.'),
 ('d1f2749a','lower-chemical-question-hypothesis',18,[16,17],'Actual hypothesis to a question, paired with concrete question sources.'),
 ('52fe1a09','lower-chemical-question-hypothesis',18,[17],'Actual hypotheses/counterhypotheses, not automatic all-domain mastery.'),
 ('dc68d6bc','lower-guided-hypothesis-investigation',18,[17],'Actually safely use instruments in a real planned arrangement; guided versus independent progression remains explicit.'),
 ('111a7f1b','lower-guided-hypothesis-investigation',18,[17],'Actual measurements, not a paper-case learner performance claim.'),
 ('25b956f5','lower-guided-hypothesis-investigation',18,[17],'Actual hypothesis comparison in investigation; whole original inference retained.'),
 ('a172cf60','lower-independently-planned-hypothesis-investigation',18,[16,17],'Actual own hypothesis-based design; autonomy depends cumulative progression, not uniform grade5/6.'),
 ('54871cb5','lower-independently-planned-hypothesis-investigation',18,[17],'Actually select suitable methods; entire performed investigation still required.'),
 ('dc68d6bc','lower-independently-planned-hypothesis-investigation',18,[17],'Safe actual execution component of planned inquiry.'),
 ('edafb207','data-documentation',18,[17],'Actual data generated in inquiry and protocolled.'),
 ('e1c3e7e8','data-documentation',18,[17],'Explicit observation/data versus interpretation separation.'),
 ('6e157f7f','data-documentation',18,[17],'Actual table/chart/graph representation, no simulated performance.'),
 ('a9c35efe','lower-chemical-data-interpretation',18,[17],'Actual mathematics and trend recognition as an analysis component.'),
 ('25b956f5','lower-chemical-data-interpretation',18,[17],'Actual data hypothesis support or rejection.'),
 ('dc779ab6','sek1-model-use-criticism',18,[16,17],'Actual suitable model selection/use.'),
 ('0b78e742','sek1-model-use-criticism',18,[17],'Actual models simplify only selected properties, not all real domain breadth.'),
 ('4d6bf928','sek1-model-use-criticism',18,[17],'Actual model limits and change, whole domain facets still pending.'),
 ('aa98398d','sek1-source-information',19,[16,17],'Actual select suitable sources.'),
 ('00d3f7b7','sek1-source-information',19,[17],'Actual information from different sources.'),
 ('014d9ca8','sek1-source-information',19,[17],'Actual source quality check; source attribution whole detail remains partial.'),
 ('3e516bb8','chemical-representation-transformation',19,[17],'Actual appropriate information structure and representation.'),
 ('46f99048','chemical-representation-transformation',19,[17],'Actual symbols/charts/formula/reaction-schema communication.'),
 ('2fae0ebd','chemical-presentation',19,[17],'Explicit target/audience choice of presentation and representations.'),
 ('0e050108','chemical-presentation',19,[17],'Explicit adequate fachlanguage and audience-sensitive communication.'),
 ('1369c287','chemical-applications-society',19,[12,13],'Actual personally/societally relevant chemical decisionfields, no personal career choice.'),
 ('119aa59e','chemical-applications-society',19,[13],'Consequences of own/other action form bounded relevance component.'),
]
upper=[
 ('bb186ab4','data-documentation',66,[36,37,39,40],'Actual water-analytics context plus real generic data/protocol operators; water orsoil selection remains conditional.'),
 ('763a4045','data-documentation',66,[36,37,39,40],'Distinct soil-analytics alternative, not an obligation to study both environmental fields.'),
 ('e9cfd07c','upper-quantitative-hypothesis-data-evaluation',65,[39,40,63],'COMMON fat-index evaluation explicitly qualitative. Generic quantitative operator comes only from actual39/40; not an invented mandatory common experimental fat-index duty.'),
 ('bb186ab4','upper-quantitative-hypothesis-data-evaluation',66,[39,40,65],'Chosen water analytical data/context plus actual upper quantitative theory/hypothesis operators.'),
 ('bb186ab4','data-validity',66,[40,43,65],'Actual common chosen-context analysis accuracy/errors/detectionlimits on65 and validity/range operations40/43.'),
 ('c23c15fa','upper-source-information',66,[37,41,42,65],'Actual chosen water-quality context; information research and source attribution are explicitly from real41/42, whose own source IDs are absent.'),
 ('516f793b','upper-source-information',66,[37,41,42,65],'Distinct chosen-soil alternative plus same real common operators; no two-environment mandatory claim.'),
 ('c23c15fa','upper-source-criticism',66,[41,42,43,65],'Bounded water assessment plus actual trust/source-intention standards41/43, no new process source ID.'),
 ('763a4045','chemical-representation-transformation',66,[37,41,42,65],'Chosen soil analysis context plus explicit common representation conversion41/42.'),
 ('bb186ab4','chemical-presentation',66,[37,41,42,65],'Chosen water analysis with common whole presentation/media/fachlanguage standards42.'),
 ('e4f94913','chemical-applications-society',62,[31,43,44,61],'Actual common energy/sustainability application source; no all-disciplinary source closure.'),
 ('e4f94913','chemistry-career-choice',62,[30,31,37,43,58,61],'Energy applications plus actual career relevance only. Whole career comparison/personal choice remains HOLD.'),
]
extra_lk=[
 ('83d965d2','data-documentation',65,[39,40,63],'Actual enhanced-only experimental fat indices; currentGK_LK extraction needs targeted course correction.'),
 ('83d965d2','upper-quantitative-hypothesis-data-evaluation',65,[39,40,63],'Actual enhanced-only experimental evaluation; never used as a GK compulsory duty.'),
 ('d19567b4','upper-quantitative-hypothesis-data-evaluation',64,[39,40,63],'Actual enhanced-only amino-acid chromatographic RF evaluation within selected LIFE topic.'),
]
components=[];anchors={}
for lane,items in [('lower',lower),('GK',upper),('LK',upper+extra_lk)]:
 stage='SekI' if lane=='lower' else 'SekII'
 for suffix,key,page,contexts,rationale in items:
  matches=[g for g in sources[stage]['sourceGoals'] if g['id'].endswith('-'+suffix)];assert len(matches)==1;g=matches[0]
  if lane=='GK':assert g['courseLevel']=='GK_LK' and suffix!='83d965d2'
  if suffix=='83d965d2':
   corrected=deepcopy(g);corrected['courseLevel']='LK';corrected['tags']=[t.replace('courseLevel:GK_LK','courseLevel:LK') for t in g['tags']]
   anchors[g['id']]={'stage':stage,'correctionType':'actualEnhancedOnlyCourseBoundary','wholeCurrentSourceGoal':g,'wholeTargetedAnchorCandidate':corrected,'originalCourseLevel':'GK_LK','actualCourseLevel':'LK','actualPage':65,'actualPrimaryReadingReceipt':receipts[(stage,65)],'actualGeneralCourseBoundaryReceipts':[receipts[('SekII',59)],receipts[('SekII',63)],receipts[('SekII',64)]],'allSourceBodiesAndOriginalSourceSpanUnchanged':True,'independentApproval':False}
  label=g['sourceSpan']['label'];old=int(re.search(r'S\. (\d+)',label).group(1));assert old==page,(g['id'],old,page)
  components.append({'stage':stage,'actualSourceLane':lane,'originalSourceCourseLevel':g['courseLevel'],'actualCourseLevel':'LK' if suffix=='83d965d2' else g['courseLevel'],'wholeUnchangedCurrentSourceGoal':g,'wholeCurrentPassage':passages[stage][g['passageId']],'currentExistingSourceGoalId':g['id'],'specificCandidateKey':key,'specificChildGoalId':routine_ids[key],'actualPrimaryPhysicalPage':page,'actualPrimaryReadingReceipt':receipts[(stage,page)],'actualBoundedGeneralOperatorContexts':[receipts[(stage,n)] for n in contexts],'boundedComponentRationale':rationale,'matchType':'partial','wholeOriginalSourceClosure':False,'independentSourceApproval':False,'commonWaterOrSoilChoiceNotBoth':stage=='SekII' and suffix in ['bb186ab4','763a4045','c23c15fa','516f793b'],'operatorContextSourceGoalIdsNotInvented':True})
lower_groups={'277a3c20-6082-5a95-be08-c1e386efe79b':['sek1-model-use-criticism'],'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-documentation','lower-chemical-data-interpretation'],'542822de-cb96-56cf-a487-0fc3b5820f57':['chemical-applications-society'],'91238ba1-5c63-50c7-a4fd-9bbe492c6b61':['lower-chemical-question-hypothesis','lower-guided-hypothesis-investigation','lower-independently-planned-hypothesis-investigation'],'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['sek1-source-information','chemical-representation-transformation','chemical-presentation']}
upper_groups={'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-documentation','upper-quantitative-hypothesis-data-evaluation','data-validity'],'542822de-cb96-56cf-a487-0fc3b5820f57':['chemical-applications-society','chemistry-career-choice'],'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['upper-source-information','upper-source-criticism','chemical-representation-transformation','chemical-presentation']}
metadata=[]
for key in sorted({r['specificCandidateKey'] for r in components}):
 g=by_goal[routine_ids[key]];old=deepcopy(g['applicability']);g['applicability']['jurisdiction']=list(dict.fromkeys(old['jurisdiction']+['DE-SH']));metadata.append({'goalId':g['id'],'candidateKey':key,'field':'applicability','before':old,'after':deepcopy(g['applicability']),'status':'author_candidate_pending_independent_source_placement_review'})
compilation=read(PREVIOUS/'actual-native43-source-view-findings-three-HB-models-and-current173-contexts.json');view_proposals=[]
for row in compilation['actual43SourceViews']:
 if row['scope']['jurisdiction']!='DE-SH':continue
 before_path=ROOT/row['afterViewBinding']['path'];view=read(before_path);stage=row['scope']['stage'];profile=row['scope'].get('courseProfile');lane='lower' if stage=='SekI' else profile;groups=lower_groups if stage=='SekI' else upper_groups;changes=[]
 def walk(nodes):
  result=[]
  for old in nodes:
   node=deepcopy(old)
   if node.get('kind')=='goalEntry' and node.get('goalId') in groups:
    keys=groups[node['goalId']];selected=[c for c in components if c['actualSourceLane']==lane and c['specificCandidateKey'] in keys];assert {c['specificCandidateKey'] for c in selected}==set(keys)
    children=[{'kind':'goalEntry','goalId':routine_ids[k]} for k in keys];result.extend(children);changes.append({'wholeOriginalParentNode':node,'explicitSourceSpecificChildren':children,'actualCourseAdmissibleWholeSourceComponents':selected,'wholeFamilyDutyClosure':False});continue
   if 'children' in node:node['children']=walk(node['children'])
   result.append(node)
  return result
 view['rootNodes']=walk(view['rootNodes']);assert len(changes)==(5 if stage=='SekI' else 3)
 prereqs=[] if stage=='SekI' else ['sek1-model-use-criticism','lower-chemical-data-interpretation','lower-chemical-question-hypothesis','lower-guided-hypothesis-investigation','lower-independently-planned-hypothesis-investigation','sek1-source-information','upper-theory-based-question-hypothesis']
 if prereqs:view['rootNodes'].append({'kind':'structure','id':'sh-b008-source-route-prerequisites-'+profile.lower(),'label':'Voraussetzungen der Quellenroutinen (Kandidatenprüfung)','children':[{'kind':'goalEntry','goalId':routine_ids[k],'projectionRole':'prerequisiteOnly'} for k in prereqs]})
 target=OWN/'source-view-candidates'/(row['viewId']+'.bounded-author-candidate.json');write(target,view);view_proposals.append({'viewId':row['viewId'],'scope':row['scope'],'actualSelectedSourceLane':lane,'beforeExactView':bind(before_path),'candidateView':bind(target),'explicitParentReplacements':changes,'targetRoutineCount':sum(map(len,groups.values())),'prerequisiteOnlyRoutineCount':len(prereqs),'GKUsesLKOnlySourceIds':False,'independentPlacementApproval':False})
mappings=[]
for stage,directory in [('SekI','lower-secondary'),('SekII','upper-secondary')]:
 path=next((ROOT/f'curricula/DE/Gymnasium/mapping/DE-SH/{directory}').glob('*chemistry*source_extraction*review.json'));existing=read(path);mapping=deepcopy(existing);seen={(r['legacyGoalId'],r['canonicalGoalId']) for r in mapping['mappings']};added=[]
 for c in [c for c in components if c['stage']==stage]:
  key=(c['currentExistingSourceGoalId'],c['specificChildGoalId'])
  if key not in seen:r={'legacyGoalId':key[0],'canonicalGoalId':key[1],'matchType':'partial','reviewDecisionId':key[0]};mapping['mappings'].append(r);added.append(r);seen.add(key)
 affected={c['currentExistingSourceGoalId'] for c in components if c['stage']==stage}
 for d in mapping['decisions']:
  if d['sourceGoalId'] in affected:
   old=deepcopy(d);d['canonicalGoalIds']=list(dict.fromkeys(r['canonicalGoalId'] for r in mapping['mappings'] if r['legacyGoalId']==d['sourceGoalId']));d.update({'decision':'needs_view_placement_review','reviewer':None,'reviewedAt':None,'rationale':'AUTHOR-only actual SH source/operator/stage/course components; original whole duties retained. Actual cumulative Gymnasium transition standards, common versus enhanced course contents and chosen Water/Soil/Life topics remain explicit; partial is not whole closure.','historicalDecisionBeforeCandidate':old})
 mapping.update({'reviewId':existing['reviewId']+'.sh-b008-author-v19','status':'author_candidate_pending_independent_source_and_placement_review','summary':{'allHistoricalMappingsExactAndRetained':True,'partialChildBindingsAdded':len(added),'pendingCurrentSourceDecisionIds':sorted(affected),'newIndependentSourceApproval':0,'wholeSourceIdsDeletedOrInvented':0}})
 snapshot=OWN/'inputs'/(stage+'.exact-sh-source-mapping.json.bin');snapshot.write_bytes(path.read_bytes());target=OWN/'candidate-source-mappings'/(stage+'.source-mapping.author-candidate.json');write(target,mapping);assert mapping['mappings'][:len(existing['mappings'])]==existing['mappings']
 extraction=deepcopy(sources[stage]);extraction['sourceGoals']=[anchors[g['id']]['wholeTargetedAnchorCandidate'] if g['id'] in anchors else g for g in extraction['sourceGoals']];ep=OWN/'candidate-source-extractions'/(stage+'.source-extraction.targeted-anchor.author-candidate.json');write(ep,extraction)
 mappings.append({'stage':stage,'exactCurrentMapping':bind(path),'exactSnapshot':bind(snapshot),'candidateMapping':bind(target),'exactAddedPartialMappings':added,'pendingActualSourceIds':sorted(affected),'targetedSourceAnchorCandidate':bind(ep),'historicalMappingsRetained':True,'newSourceApproval':0})
for g,b in zip(candidate['goals'],before['goals']):assert {k:v for k,v in g.items() if k!='applicability'}=={k:v for k,v in b.items() if k!='applicability'}
write(OWN/'candidate/canonical.current504-sh-source-metadata.author-candidate.json',candidate)
write(OWN/'exact-sh-primary-course-components-and-three-view-proposals.author.json',{'role':'Neutral complete SH partial sources/stage/course/components; no whole source closure','sealedV18':bind(PREVIOUS/'author.corrected-portable-receipts.final.freeze.json'),'immutableOriginal158SHDuties':duties,'immutableAll1646OriginalDuties':bind(V12/'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'),'sourceInputs':source_inputs,'specificPartialChildComponents':components,'targetedWholeSourceGoalAnchorCorrections':list(anchors.values()),'explicitSourceMetadataProposals':metadata,'threeSpecificCandidateViews':view_proposals,'guardedSourceMappingProposals':mappings,'portableOwnPrimaryReceipts':list(receipts.values()),'upperProcessSourceGoalIdsMissingAndNotInvented':True,'waterOrSoilAndLifeTopicChoicesRemainBounded':True,'actualExperimentalFatIndicesEnhancedOnlyCourseCorrection':True,'nativeOperatorParagraphsAreSeparateActualPageWitnesses':True,'allWholeUpperDomainAndChoiceDutiesStillHold':True,'careerChoiceWholeSourceCoverage':False,'upperAllComplexModelDomainsSourceCoverage':False,'wholeOriginalSourceClosure':False,'newSourceIds':0,'newImages':0,'strictGain':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'SHOriginalDutiesRetained':158,'components':len(components),'sourceGoals':len({c['currentExistingSourceGoalId'] for c in components}),'anchors':len(anchors),'metadata':len(metadata),'views':len(view_proposals),'rawOfficialTextExports':0,'strictGain':0}))
