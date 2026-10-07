# SPDX-License-Identifier: Apache-2.0
"""Inactive HB components with portable own receipts; primary PDF text stays in tmp."""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import re
ROOT = Path.cwd(); OWN = Path(__file__).resolve().parent
V12 = OWN.parent / 'chemie-b008-current169-routing-placement-author-v12'
PREVIOUS = OWN.parent / 'chemie-b008-st-current480-source-placement-author-v17'
assert not (OWN / 'author.final.freeze.json').exists()
def read(p): return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
for p in read(PREVIOUS/'author.final.freeze.json')['payloads']:assert bind(ROOT/p['path'])==p
assert bind(ROOT/read(PREVIOUS/'current480-three-way-bounded-field-rebase.actual.json')['current480']['path'])==read(PREVIOUS/'current480-three-way-bounded-field-rebase.actual.json')['current480']
candidate=read(PREVIOUS/'candidate/canonical.current504-st-source-metadata.author-candidate.json');before=deepcopy(candidate);by_goal={g['id']:g for g in candidate['goals']}
routine_ids=read(V12/'current169-protected-guard-and-field-intents.author.json')['routineGoalIds']
original=read(V12/'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json');duties=[r for r in original['originalWholeDuties'] if '/HB/' in r['sourceExtractionPath']];assert len(duties)==60
sources={};passages={};source_inputs=[];texts={}
for stage,directory in [('SekI','lower-secondary'),('SekII','upper-secondary')]:
 path=next((ROOT/f'curricula/DE/Gymnasium/input/HB/{directory}/source-extraction').glob('*CHEMIE*.source-extraction.json'));source=read(path);sources[stage]=source;passages[stage]={r['id']:r for r in source['passages']}
 texts[stage]=(ROOT/f'tmp/chemie-b008-hb-v18-primary/{stage}.layout.txt').read_text().split('\f')
 source_inputs.append({'stage':stage,'exactCurrentExtraction':bind(path),'exactSnapshot':bind(OWN/'inputs'/f'{directory}.exact-hb-source-extraction.json.bin'),'actualPrimaryPdf':bind(ROOT/source['sourceDocument']['path']),'officialSourceDocuments':source.get('sourceDocuments',[source['sourceDocument']])})
texts['restriction']=(ROOT/'tmp/chemie-b008-hb-v18-primary/restriction.layout.txt').read_text().split('\f')
restriction_doc=sources['SekI']['sourceDocuments'][1]
notes={
 ('SekI',35):'Chemistry-specific experiment/model/information/communication roles, society and career orientation. A career-orientation role is not personal career-choice performance.',
 ('SekI',37):'Actual original grades8/9/10 topic table; current 2022 restriction supersedes the old grade10 allocation.',
 ('SekI',40):'End-grade8 Luft/Feuer data charts and safe experiments with protocols/evaluation.',
 ('SekI',41):'Rohstoff quantitative formula inference, flow diagrams and verbal/schematic processes; resources and actual self-performed observations.',
 ('SekI',42):'Household experiments and water models; these selected standards become end-grade9 requirements under actual restriction.',
 ('SekI',43):'Water atom-model/property relations precede the old energy/polymer themes. Do not reuse removed later themes as compulsory current SekI.',
 ('SekI',61):'Operator definitions give performance meaning, not an automatic obligation for every generic routine.',
 ('SekI',62):'Planning/hypothesis/interpretation operator vocabulary only; no lower inquiry family is added merely from vocabulary.',
 ('SekII',5):'Real experiments/safety and orientation; no model case is represented as actually performed learner work.',
 ('SekII',6):'E and Q progression; AHR standards developed at both levels. LK adds complexity/depth/self-direction, not GK transfer of LK-exclusive topics.',
 ('SekII',9):'Whole E1-E12 standards: questions/theory hypotheses/planning/safe real experiments/digital data/models/data/reflection/scientific reach.',
 ('SekII',10):'Whole information selection/comparison/trustworthiness and representation conversion standards.',
 ('SekII',11):'Communication/presentation/source attribution and assessment rationale. Source attribution does not substitute author/intention review.',
 ('SekII',12):'Whole B2-B14 sources, data reach, decisions, career relevance and sustainability. Career relevance alone is not whole personal choice.',
 ('SekII',14):'Section3.1 begins after energy/digital framing. The seven extracted process goals are structured aggregates, not seven verbatim page14 bullets.',
 ('SekII',15):'Section3.1 actual common experiment/documentation/information/digital-model/data expectations extend into E and Q. Thick-frame duties versus thin-frame possible contexts/experiments remain distinct.',
 ('SekII',16):'Actual four compulsory E topic motivations and macro/micro/symbol progression.',
 ('SekII',21):'Q table frame convention and topic scope; optional contexts are not transformed into mandatory examples.',
 ('SekII',37):'Actual compulsory common Q topics, LK-only aromatics, and course-specific elective choices (GK one/LK two). Generic components do not make every elective topic compulsory.',
 ('SekII',40):'Actual AHR operator definitions, including theory-based hypothesis and evaluation.',
 ('SekII',41):'Actual planning/interpretation/compare operators; operator meaning does not prove whole domain coverage.',
 ('restriction',3):'Actual 2022 chemistry restriction: grade8 Luft/Feuer/Rohstoffe, grade9 Haushalt/Wasser; energy and polymers moved to upper secondary.',
 ('restriction',4):'Actual retained grade9 household experiment and water model duties; old end-grade10 label remains historical in raw fields.',
}
receipts={}
for (stage,page),note in notes.items():
 doc=restriction_doc if stage=='restriction' else sources[stage]['sourceDocument'];raw=texts[stage][page-1].encode();p=OWN/'primary-receipts'/f'{stage}.physical-page-{page:03}.own-reading-receipt.json'
 write(p,{'role':'Own actual whole primary-page reading receipt; no full official text export','officialSourceDocument':doc,'actualSourcePdf':bind(ROOT/doc['path']),'physicalPage1Based':page,'printedPage':None if stage=='restriction' else (page if page<=37 or stage=='SekI' else ('O.1' if page==40 else 'O.2')),'wholePageTextExtractionSha256':hashlib.sha256(raw).hexdigest(),'wholePageTextExtractionBytes':len(raw),'reproductionCommand':['pdftotext','-layout',doc['path'],'<local-tmp-output>'],'pageSelection':'Split actual layout output on form-feed; use index physicalPage1Based-1','ownBoundedReadingResult':note,'wholePageActuallyRead':True,'rawOfficialTextCommitted':False,'independentApproval':False})
 receipts[(stage,page)]=bind(p)
# Each existing source supplies only its named operation component. Lower has no inquiry parent to replace.
lower=[
 ('c45c53e8','sek1-model-use-criticism',43,[35], 'Current grade9 simple atom-model interpretation only; complex domains and entire criticism routine remain unapproved.'),
 ('dc378339','sek1-model-use-criticism',43,[35], 'Grade9 structure/property relation supplies a bounded model-use component.'),
 ('53c9bfdf','data-documentation',40,[61], 'Actual safe experiment protocols, not a simulated E1 performance claim.'),
 ('001611fd','data-documentation',40,[61], 'Read/create experiment charts; quantities/provenance details remain bounded authored elaborations.'),
 ('e74eb1e2','lower-chemical-data-interpretation',40,[61], 'Mass-conservation inference from actual results, not whole hypothesis breadth.'),
 ('2a0f7af4','lower-chemical-data-interpretation',41,[61], 'Quantitative formula inference; original chemistry result remains whole.'),
 ('124c93e2','chemical-applications-society',40,[35], 'Environment/health consequences of combustion as a society component.'),
 ('50e512d9','chemical-applications-society',41,[35], 'Real resource-sparing chemistry use; no personal career-choice requirement.'),
 ('b92ddd8a','sek1-source-information',41,[35], 'Extract chemical flow information from a provided diagram; autonomous source search/criticism is not fully supplied.'),
 ('9f07bfaf','chemical-representation-transformation',41,[35,61], 'Actual verbal/schematic process transformation, not every representation domain.'),
 ('9f07bfaf','chemical-presentation',41,[35,61], 'Actual verbal/schematic process communication; generic audience/media choice is still a partial elaboration.'),
]
upper=[
 ('c3d5aff1','upper-theory-based-question-hypothesis',9,[6,14,15,40], 'Actual E1-E3 theory-based inquiry at both levels; existing aggregated source body retained, not a verbatim page14 quote.'),
 ('c3d5aff1','upper-hypothesis-investigation',9,[5,6,14,15], 'E4/E5 plus actual3.1 self-work/safe experiments; whole performed experiments required, not paper work.'),
 ('c3d5aff1','own-inquiry-process-reflection',9,[6,15], 'Actual E10 reflection and3.1 actual experiment evaluation; no evidence of learner performance supplied.'),
 ('1deb298b','data-documentation',15,[9], 'Actual digital measurement/documentation on page15 plus E5/E6; page14 label alone previously missed the body.'),
 ('1deb298b','upper-quantitative-hypothesis-data-evaluation',15,[9], 'Digital tools, E6/E8 theory-based data relations only; generic full quantitative/cross-domain scope remains HOLD.'),
 ('c3d5aff1','data-validity',9,[12,15], 'E12 scientific limits plus B3 data reach: bounded validity component, not each specific error-domain whole closure.'),
 ('dc69edad','upper-model-use-criticism',9,[6,14,15], 'Actual E7/E9 model use/limits; receptor/enzyme complex-domain coverage is not implied.'),
 ('22958b15','upper-model-use-criticism',15,[9,14], 'Actual digital representations/models; simulations E6 are bounded context, no all-complex-domain closure.'),
 ('9d064789','upper-source-information',10,[11,15], 'Actual K1/K2/K8/K12 plus3.1 research; pharma-domain universal obligation is not inferred.'),
 ('9d064789','upper-source-criticism',10,[11,12,15], 'Actual K3/K4/K12 andB2/B4 trust/author/intention, not an invented new source ID.'),
 ('fab5f148','chemical-representation-transformation',10,[11,15], 'Actual K5-K9 and common3.1 Fachsprache/representation operators.'),
 ('fab5f148','chemical-presentation',11,[10,15], 'Actual K11 and common3.1 analogue/digital presentation; generic claim remains partial.'),
 ('97cd606b','chemical-applications-society',12,[5,11,15], 'Actual B10/B12/B13 society/application consequences, not full all-substance content.'),
 ('97cd606b','chemistry-career-choice',12,[5,15], 'Actual B8 career relevance and orientation frompage5 only; comparing careers and personal choice remain unapproved.'),
]
components=[];anchors={}
for lane,items in [('lower',lower),('GK',upper),('LK',upper)]:
 stage='SekI' if lane=='lower' else 'SekII'
 for suffix,key,page,contexts,rationale in items:
  matches=[g for g in sources[stage]['sourceGoals'] if g['id'].endswith('-'+suffix)];assert len(matches)==1;g=matches[0];assert g['courseLevel']=='GK_LK'
  old=int(re.search(r'S\. (\d+)',g['sourceSpan']).group(1))
  if old!=page:
   correction=deepcopy(g)
   for field in ['sourceSpan','sourceRef']:correction[field]=re.sub(r'S\. \d+',f'S. {page}',correction[field])
   anchors[g['id']]={'stage':stage,'wholeCurrentSourceGoal':g,'wholeTargetedAnchorCandidate':correction,'originalPage':old,'actualPage':page,'actualPrimaryReadingReceipt':receipts[(stage,page)],'sourceBodyIsRetainedStructuredAggregateNotNewVerbatimQuote':True,'originalRawFieldsUnchanged':True,'independentApproval':False}
  components.append({'stage':stage,'actualSourceLane':lane,'actualCourseLevel':g['courseLevel'],'wholeUnchangedCurrentSourceGoal':g,'wholeCurrentPassage':passages[stage][g['passageId']],'currentExistingSourceGoalId':g['id'],'specificCandidateKey':key,'specificChildGoalId':routine_ids[key],'actualPrimaryPhysicalPage':page,'actualPrimaryReadingReceipt':receipts[(stage,page)],'actualBoundedGeneralOperatorContexts':[receipts[(stage,n)] for n in contexts], 'actualRestrictionContexts':[receipts[('restriction',3)],receipts[('restriction',4)]] if stage=='SekI' else [], 'boundedComponentRationale':rationale,'matchType':'partial','wholeOriginalSourceClosure':False,'independentSourceApproval':False})
lower_groups={'277a3c20-6082-5a95-be08-c1e386efe79b':['sek1-model-use-criticism'],'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-documentation','lower-chemical-data-interpretation'],'542822de-cb96-56cf-a487-0fc3b5820f57':['chemical-applications-society'],'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['sek1-source-information','chemical-representation-transformation','chemical-presentation']}
upper_groups={**lower_groups,'277a3c20-6082-5a95-be08-c1e386efe79b':['upper-model-use-criticism'],'49b13b33-34b7-5e4e-861c-b21082cb9922':['data-documentation','upper-quantitative-hypothesis-data-evaluation','data-validity'],'542822de-cb96-56cf-a487-0fc3b5820f57':['chemical-applications-society','chemistry-career-choice'],'91238ba1-5c63-50c7-a4fd-9bbe492c6b61':['upper-theory-based-question-hypothesis','upper-hypothesis-investigation','own-inquiry-process-reflection'],'b6327e98-8ab9-5d7f-b826-4023bc1a56a7':['upper-source-information','upper-source-criticism','chemical-representation-transformation','chemical-presentation']}
metadata=[]
for key in sorted({r['specificCandidateKey'] for r in components}):
 g=by_goal[routine_ids[key]];old=deepcopy(g['applicability']);g['applicability']['jurisdiction']=list(dict.fromkeys(old['jurisdiction']+['DE-HB']));metadata.append({'goalId':g['id'],'candidateKey':key,'field':'applicability','before':old,'after':deepcopy(g['applicability']),'status':'author_candidate_pending_independent_source_placement_review'})
compilation=read(PREVIOUS/'actual-native43-source-view-findings-three-ST-models-and-current173-contexts.json');view_proposals=[]
for row in compilation['actual43SourceViews']:
 if row['scope']['jurisdiction']!='DE-HB':continue
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
 view['rootNodes']=walk(view['rootNodes']);assert len(changes)==(4 if stage=='SekI' else 5)
 prereqs=[] if stage=='SekI' else ['sek1-model-use-criticism','lower-chemical-data-interpretation','lower-chemical-question-hypothesis','lower-guided-hypothesis-investigation','lower-independently-planned-hypothesis-investigation','sek1-source-information']
 if prereqs:view['rootNodes'].append({'kind':'structure','id':'hb-b008-source-route-prerequisites-'+profile.lower(),'label':'Voraussetzungen der Quellenroutinen (Kandidatenprüfung)','children':[{'kind':'goalEntry','goalId':routine_ids[k],'projectionRole':'prerequisiteOnly'} for k in prereqs]})
 target=OWN/'source-view-candidates'/(row['viewId']+'.bounded-author-candidate.json');write(target,view);view_proposals.append({'viewId':row['viewId'],'scope':row['scope'],'actualSelectedSourceLane':lane,'beforeExactView':bind(before_path),'candidateView':bind(target),'explicitParentReplacements':changes,'targetRoutineCount':sum(map(len,groups.values())),'prerequisiteOnlyRoutineCount':len(prereqs),'GKUsesLKOnlySourceIds':False,'independentPlacementApproval':False})
mappings=[]
for stage,directory in [('SekI','lower-secondary'),('SekII','upper-secondary')]:
 path=next((ROOT/f'curricula/DE/Gymnasium/mapping/DE-HB/{directory}').glob('*chemistry*source_extraction*review.json'));existing=read(path);mapping=deepcopy(existing);seen={(r['legacyGoalId'],r['canonicalGoalId']) for r in mapping['mappings']};added=[]
 for c in [c for c in components if c['stage']==stage]:
  key=(c['currentExistingSourceGoalId'],c['specificChildGoalId'])
  if key not in seen:r={'legacyGoalId':key[0],'canonicalGoalId':key[1],'matchType':'partial','reviewDecisionId':key[0]};mapping['mappings'].append(r);added.append(r);seen.add(key)
 affected={c['currentExistingSourceGoalId'] for c in components if c['stage']==stage}
 for d in mapping['decisions']:
  if d['sourceGoalId'] in affected:
   old=deepcopy(d);d['canonicalGoalIds']=list(dict.fromkeys(r['canonicalGoalId'] for r in mapping['mappings'] if r['legacyGoalId']==d['sourceGoalId']));d.update({'decision':'needs_view_placement_review','reviewer':None,'reviewedAt':None,'rationale':'AUTHOR-only actual HB source/operator/stage/course components; original whole duties retained. Grade5-9 restriction and compulsory/elective topics remain explicit; partial is not whole closure.','historicalDecisionBeforeCandidate':old})
 mapping.update({'reviewId':existing['reviewId']+'.hb-b008-author-v18','status':'author_candidate_pending_independent_source_and_placement_review','summary':{'allHistoricalMappingsExactAndRetained':True,'partialChildBindingsAdded':len(added),'pendingCurrentSourceDecisionIds':sorted(affected),'newIndependentSourceApproval':0,'wholeSourceIdsDeletedOrInvented':0}})
 snapshot=OWN/'inputs'/(stage+'.exact-hb-source-mapping.json.bin');snapshot.write_bytes(path.read_bytes());target=OWN/'candidate-source-mappings'/(stage+'.source-mapping.author-candidate.json');write(target,mapping);assert mapping['mappings'][:len(existing['mappings'])]==existing['mappings']
 extraction=deepcopy(sources[stage]);extraction['sourceGoals']=[anchors[g['id']]['wholeTargetedAnchorCandidate'] if g['id'] in anchors else g for g in extraction['sourceGoals']];ep=OWN/'candidate-source-extractions'/(stage+'.source-extraction.targeted-anchor.author-candidate.json');write(ep,extraction)
 mappings.append({'stage':stage,'exactCurrentMapping':bind(path),'exactSnapshot':bind(snapshot),'candidateMapping':bind(target),'exactAddedPartialMappings':added,'pendingActualSourceIds':sorted(affected),'targetedSourceAnchorCandidate':bind(ep),'historicalMappingsRetained':True,'newSourceApproval':0})
for g,b in zip(candidate['goals'],before['goals']):assert {k:v for k,v in g.items() if k!='applicability'}=={k:v for k,v in b.items() if k!='applicability'}
write(OWN/'candidate/canonical.current504-hb-source-metadata.author-candidate.json',candidate)
write(OWN/'exact-hb-primary-course-components-and-three-view-proposals.author.json',{'role':'Neutral complete HB partial sources/stage/course/components; no whole source closure','sealedV17':bind(PREVIOUS/'author.final.freeze.json'),'immutableOriginal60HBDuties':duties,'immutableAll1646OriginalDuties':bind(V12/'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'),'sourceInputs':source_inputs,'specificPartialChildComponents':components,'targetedWholeSourceGoalAnchorCorrections':list(anchors.values()),'explicitSourceMetadataProposals':metadata,'threeSpecificCandidateViews':view_proposals,'guardedSourceMappingProposals':mappings,'portableOwnPrimaryReceipts':list(receipts.values()),'originalOldGrade10LabelsRemainHistorical':True,'currentLowerScopeGrades5To9WithRestriction':True,'upperGenericStandardsBothLevels':True,'originalAggregateBodiesAreNotNewVerbatimQuoteClaims':True,'allElectiveDomainWholeDutiesStillHold':True,'careerChoiceWholeSourceCoverage':False,'upperAllComplexModelDomainsSourceCoverage':False,'wholeOriginalSourceClosure':False,'newSourceIds':0,'newImages':0,'strictGain':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'HBOriginalDutiesRetained':60,'components':len(components),'sourceGoals':len({c['currentExistingSourceGoalId'] for c in components}),'anchors':len(anchors),'metadata':len(metadata),'views':len(view_proposals),'rawOfficialTextExports':0,'strictGain':0}))
