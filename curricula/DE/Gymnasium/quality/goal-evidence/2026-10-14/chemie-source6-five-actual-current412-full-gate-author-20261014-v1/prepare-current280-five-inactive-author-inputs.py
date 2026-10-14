# Apache-2.0. Small author successor; physical host is read only.
import copy,datetime,hashlib,json,os,pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;E=O.parent
I=E/'chemie-current407-naturstoffe-seven-paired-resolution-existing274-integration-technical-20261014-v1'
P=E/'chemie-source-duty-conditional-QA-integration-plan-author-20261014-v1'
S=E/'chemie-six-current-full-source-duty-remediation-author-20261014-v1'
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
read=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(n,x):
 p=O/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
def link(src,name):
 p=O/name;assert not p.exists();os.link(src,p);assert p.read_bytes()==src.read_bytes();return p
ids=['ee78e2c9-45c9-5023-8193-7e9c20bce0a6','d72cbb62-0b65-5b9a-aece-70c23d4e618a','03e12e4f-83eb-56a7-85ac-e0d628412dcc','f4f7f028-10db-53f9-bdae-456e0c6d0896','0559cec7-330b-57f1-a409-31cf1b4ac9fb']
final=read(I/'FINAL.native7-existing274-to-actual280-technical-integration.manifest.json')
seal=I/'SEAL.finite-native7-existing274-to-actual280-technical-integration.actual.json';assert sha(seal)=='sha256:17920cc589a081396110f027cf5f32073fd5b212bef7e7b3072d5008c26d4541'
for b in read(seal)['files']:assert sha(R/b['path'])==b['sha256']
basepath=R/final['canonicalCandidate']['path'];base=read(basepath);baseby={g['id']:g for g in base['goals']}
oldplan=read(P/'candidate/canonical539.current407-plus-five-source-duty-atoms-and-offering-boundary.author-only.json');planby={g['id']:g for g in oldplan['goals']}
cas=read(P/'CAS.current407-plus-exact-five-source6-goals-and-offering-boundary.author-only.json');supp=cas['newWholeSupplementCluster'];root='442c31c5-c561-5c7a-90bb-2335d779175c'
assert set(planby)-set(baseby)==set(ids)|{supp['id']}
candidate=copy.deepcopy(base);rootbefore=copy.deepcopy(baseby[root]);rootafter=next(g for g in candidate['goals']if g['id']==root)
rootafter['contains'].append(supp['id']);rootafter['weight']+=supp['weight']
candidate['goals'] += [copy.deepcopy(planby[i])for i in ids]+[copy.deepcopy(supp)]
ci={g['id']:g for g in candidate['goals']};assert len(ci)==539
for gid,g in baseby.items():
 if gid!=root:assert ci[gid]==g
 assert ci[gid].get('requires',[])==g.get('requires',[])
 assert ci[gid].get('resourceLinks',[])==g.get('resourceLinks',[])
for gid in ids:assert ci[gid]==planby[gid]
cp=write('candidate/canonical539.prospective-current412-on-actual280.author-only.json',candidate)
link(basepath,'inputs/canonical533.actual280-base.immutable-hardlink.json')
link(R/final['operativeQACandidate']['path'],'inputs/QA419.actual280-base.immutable-hardlink.json')
link(R/final['semanticCandidate']['path'],'inputs/semantic533.actual407-base.immutable-hardlink.json')
measure=read(I/'MEASURE.actual280-existing274-and-protected262-retained-N7-P6.actual.json')
assert measure['actualStrictCount']==280 and len(measure['protected262StrictIds'])==262
for gid in measure['actualStrictGoalIds']:assert ci[gid]==baseby[gid]
source=read(P/'SOURCE6.full-original-duty-conditions-partner-unions-and-bound-sealed-decisions.json');sourceRows=source['rows'][1:]
write('inputs/whole-six-original-source-conditions-seven-carrier-unions.exact-from-sealed-plan.json',source)
write('inputs/whole-seven-static-programme-candidates.exact-from-sealed-plan.json',read(P/'PROGRAM.source6-seven-static-review-programmes-and-existing-LayerA-fields.author-only.json'))
link(S/'inputs/six-whole-source-cells.actual-before.json','inputs/six-whole-source-cells.original-author-before.immutable-hardlink.json')
contexts=[];relationships=[]
for gid in ids:
 g=ci[gid];row=next(x for x in sourceRows if x['wholeCurrentOrProposedTarget']['id']==gid)
 contexts.append({'goalId':gid,'wholeCurrentCandidateGoal':g,'wholeDirectPrerequisites':[ci[r]for r in g['requires']],
  'wholeReversePrerequisites':[x for x in candidate['goals']if gid in x.get('requires',[])],
  'wholeContainmentParents':[x for x in candidate['goals']if gid in x.get('contains',[])],
  'wholeSourceRecordAndAllCarrierAlternatives':row,
  'sourceCondition':row['exactStageAndSourceCondition'],'courseEligibility':row['courseEligibility'],
  'originalPrerequisitesRetainedVerbatim':True,'newClassroomSelectionClaim':False})
 for c in row['wholeOriginalAndConditionalCarrierCAS']:
  frozen=R/c['mappingCarrierFrozenBinding']['path'];assert sha(frozen)==c['mappingCarrierFrozenBinding']['sha256']
  m=read(frozen);orig=[a for a in m['mappings']if a['legacyGoalId']==row['sourceGoalId']]
  assert orig==c['expectedBeforeAllMappingsForSourceCell']
  conditional=c['NONOPERATIVEConditionalAfterAllMappingsForSourceCell'];partnerIds={a['canonicalGoalId']for a in orig+conditional}
  relationships.append({'sourceGoalId':row['sourceGoalId'],'actualWholeFrozenCarrier':bind(frozen),
   'wholeOriginalMappingRows':orig,'wholeOriginalMappedPartnerGoals':[ci[i]for i in sorted({a['canonicalGoalId']for a in orig})],
   'wholeUnactivatedProposedUnionRows':conditional,'wholeUnactivatedProposedPartnerGoals':[ci[i]for i in sorted(partnerIds)],
   'allOriginalDecisionAndPartnerUnionsPreservedInWholeSourceRecord':True,'actualBeforeUnionEmpty':not orig,
   'newMappingOrWholeSourceGrant':False})
write('WHOLE.five-goals-prerequisites-successors-source-course-and-full-partner-unions.author.json',{'schemaVersion':1,'authorOnly':True,'goals':contexts,'relationships':relationships})
# Include the separate neighbouring literal operators and every currently mapped partner; do not claim their closure.
neighbours=[]
for row in sourceRows:
 for c in row['wholeOriginalContexts']:
  logical=pathlib.Path(c['sourceExtraction']['path']);frozen=S/'inputs/frozen-regular-originals'/logical
  assert frozen.exists(),frozen
  src=read(frozen);cells=src['sourceGoals'];carrier=R/row['wholeOriginalAndConditionalCarrierCAS'][0]['mappingCarrierFrozenBinding']['path'];mapping=read(carrier)
  if row['sourceGoalId'].startswith('rp-') and '6-2-003' in row['sourceGoalId']:selected=[g for g in cells if g.get('topicCode')=='BAUSTEIN-6-2']
  elif row['sourceGoalId'].startswith('sn-'):selected=[g for g in cells if 'grundkurs-wb1-011' in g['id']or 'grundkurs-wb1-010' in g['id']]
  elif row['sourceGoalId'].startswith('th-'):selected=[g for g in cells if 'synthesen-171' in g['id']]
  else:selected=[]
  for g in selected:
   maps=[x for x in mapping['mappings']if x['legacyGoalId']==g['id']]
   neighbours.append({'wholeSourceCell':g,'wholeSourceCarrier':bind(frozen),'allCurrentMappingRows':maps,
    'wholeCurrentCanonicalPartners':[ci[i]for i in sorted({x['canonicalGoalId']for x in maps})],'noNeighbourSourceDutyApproval':True})
write('inputs/whole-neighbour-source-operators-and-all-current-partners.not-cleared.json',{'schemaVersion':1,'rows':neighbours})
progcheck=read(P/'CHECK.stock-whole-views-canonical-DAG-course-and-effective-acquisition.actual.json')
assert progcheck['results']['staticProgrammeMissingOrdinaryPrerequisiteTargets']==307
write('CAS.actual280-preserving-five-stable-whole-goals-and-separate-offering-boundary.author.json',{
 'schemaVersion':1,'authorOnly':True,'actual280BaseSeal':bind(seal),'base':bind(basepath),'after':bind(cp),'fiveWholeGoalBodiesExactPriorPlan':[ci[i]for i in ids],
 'existingWholeRootBefore':rootbefore,'existingWholeRootAfter':rootafter,'allowedRootChanges':['contains append offering cluster','weight plus5'],
 'newSeparateOfferingCluster':supp,'allOther532WholeGoalsExact':True,'all280StrictAnd262WholeBodiesExact':True,
 'allOriginalRequiresAndAllResourceLinksExact':True,'noOldParentOrTerminalRequiresChanged':True,
 'prospectiveAtoms':412,'currentOperativeAtoms':407,'currentStrictComplete':280,'measuredNewStrictGain':0,
 'sevenStaticProgrammeViewsUnregistered':True,'preexistingLayerAAcquisitionGapOccurrences':307,
 'allFiveNewD_P_A_M_VGatesUnapproved':True,'noWholeSourceOrDefaultScopeGrant':True})
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
advice={
 ids[0]:('Ein kausaler Vergleich der drei Siliconfamilien verbindet Funktionalität, Netzwerk und Nutzung; keine drei isolierten Stofflisten.','Öl/Harz/Kautschuk-Zuordnungen werden aus gegebenen Gruppen- und Eigenschaftsdaten erklärt; allgemeine Bindungs-/Polymergrundlagen bleiben Voraussetzungen, keine neue Pflichtkartei.'),
 ids[1]:('Eine einheitliche kriterientreue Klassifikationskompetenz über mehrere Dimensionen; keine Synthesemechanismen als versteckte Teilpflicht.','Strukturmerkmale und Klassifikationskarten sind vollständig bereitgestellt. Erklärte Einteilung und Transfer tragen das Ziel; isoliertes Namenslernen begründet keine neue Pflichtkartei.'),
 ids[2]:('Ein zusammenhängender lokaler Mechanismus wird in bifunktionelle Wiederholung übertragen; Elektronenpfeile, Ladung und Protonenrelay sind keine getrennten Ziele.','Die Pfeilfolge muss aus Paaren, Polarität und Ladungsbilanz hergeleitet werden. Ein auswendig gelerntes Bild ersetzt das nicht; kein neuer irreduzibler Faktenkern.'),
 ids[3]:('Ein kausaler Fixiervorgang mit Stoff-/Teilchenebene und notwendiger Abgrenzung gegen die Bildbildung; Nachbarexperiment bleibt separat.','Ligand- und Komplexformel sind im Fallmaterial angegeben. Die Leistung ist Auflösungserklärung und neue Stoffbilanz; keine neue Pflichtkartei über die bestehenden Grundlagen hinaus.'),
 ids[4]:('Eine vergleichende Kompetenz über drei Syntheserouten; die drei Beispiele sind Bezugsobjekte desselben Vergleichsoperators, keine Rate-/Laboraufgaben.','Die Bedingungen stehen in vollständigen Materialkarten; erklärt werden ihre chemischen Gründe und Grenzen. Keine universellen Temperaturzahlen als Abrufpflicht erfinden.')}
write('AUTHOR.five-semantic-atomicity-and-memory-proposals.not-independent.json',{'schemaVersion':1,'authorOnly':True,'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E0','maximumClaimScope':'G0',
 'historicalRoles':'This author previously performed Source-B and wrote the conditional Source6 data plan; current role is authoring, not an independent new source/P/D/A/M/V vote.',
 'rows':[{'goalId':i,'semanticAtomicityRecommendation':'atomic','semanticAtomicityReasonDe':advice[i][0],
  'memoryRecommendation':'no_memory_needed','memoryReasonDe':advice[i][1],
  'prerequisiteBoundaryDe':'Direkte requires bleiben unverändert. Mechanismus-/Komplexbegriffe werden im Material erläutert; ob das als didaktische Vorbereitung hinreichend ist, bleibt Gegenstand der unabhängigen ganzen Prüfung. Keine pauschale prerequisites-Entfernung.',
  'independentA_MDecisionPending':True}for i in ids]})
write('candidate/semantic-five-atoms-one-cluster.NONOPERATIVE-author-proposals.json',{'schemaVersion':1,'authorOnly':True,
 'baseAuthoritativeLedgerRetainedByReference':final['semanticCandidate'],'prospectiveAtomicCount':412,'currentAuthoritativeAtomicCount':407,
 'proposedDecisions':[{'goalId':i,'proposedSemanticKind':'curricularAtomic','decisionStatus':'unreviewed_author_proposal'}for i in ids]+[{'goalId':supp['id'],'proposedSemanticKind':'curricularCluster','decisionStatus':'unreviewed_author_proposal'}],
 'notAnOperativeSemanticKindLedger':True,'needsIndependentReviewAndNormalIntegration':True})
ni=[]
for x in final['allThreeNIReviewedPartialCarrierHashesRetained']:
 assert sha(H/x['logicalHostPath'])==x['candidate']['sha256'];ni.append({'path':str((H/x['logicalHostPath']).relative_to(R)),'sha256':sha(H/x['logicalHostPath'])})
host=[]
for logical in ['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json']:
 host.append(bind(H/logical))
inputs=[bind(R/'AGENTS.md'),bind(seal),bind(I/'FINAL.native7-existing274-to-actual280-technical-integration.manifest.json'),bind(I/'MEASURE.actual280-existing274-and-protected262-retained-N7-P6.actual.json'),bind(P/'SEAL.finite-Source34-Source6-conditional-QA-data-plan-author-only.actual.json'),bind(S/'SEAL.finite-six-duty-author.actual.json'),bind(P/'SOURCE6.full-original-duty-conditions-partner-unions-and-bound-sealed-decisions.json'),bind(P/'PROGRAM.source6-seven-static-review-programmes-and-existing-LayerA-fields.author-only.json'),bind(P/'CHECK.stock-whole-views-canonical-DAG-course-and-effective-acquisition.actual.json')]
primaries=[]
for prefix in ['HB.physical-pages-33-35','RP.physical-pages-46-48','RP.physical-pages-64-66','SN.physical-pages-40-42','TH.physical-pages-57-59']:
 primaries.append({'completeAlreadyBoundLayoutTextRead':bind(S/f'primary/{prefix}.full-layout.txt'),'newSourceReviewClaim':False})
pdfs={c['sourceDocument']['path'] for row in sourceRows for c in row['wholeOriginalContexts']}
write('INPUTS.actual280-whole-source-conditions-and-protected-readonly-bindings.json',{
 'schemaVersion':1,'selectedAt':now,'goalIds':ids,'exactInputs':inputs,'wholePrimaryContextReads':primaries,'wholeOriginalPdfBindings':[bind(R/p)for p in sorted(pdfs)],
 'originalSourceA_BBodyJudgmentBindings':[source['AWholeScientificRecord'],source['BWholeScientificRecord']],
 'currentStrict280Ids':measure['actualStrictGoalIds'],'protected262Ids':measure['protected262StrictIds'],'readonlyHostObservedBindings':host,
 'readonlyHostNI3Bindings':ni,'baseFourN7ImageResourceChangesPreserved':read(I/'PREFLIGHT.exact-N7-I274-canonical-QA-P-A-M-and-NI3-preservation.actual.json')['canonicalChangedGoalIds'],
 'fiveStableBodiesHaveNoImageLinksYet':all(not ci[i].get('resourceLinks')for i in ids),'newScienceVote':False,'hostWrites':False,'activeWrites':False})
print(json.dumps({'canonicalNodes':len(ci),'prospectiveAtoms':412,'old532BodiesExact':True,'strict280WholeBodiesPreserved':True,'protected262WholeBodiesPreserved':True,'wholeOriginalAndConditionalPartnerUnions':len(relationships),'wholeNeighbourOperators':len(neighbours),'hostWrites':False}))
