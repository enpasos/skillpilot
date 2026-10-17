import json,pathlib,hashlib,collections,copy,datetime,re
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17';O=B/'chemie-current441-HB232-complete-view-integration-candidates-20261017-v1';(O/'views').mkdir(parents=True,exist_ok=True)
load=lambda p:json.loads(p.read_text());sh=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();oh=lambda v:hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rel(p):return str(p.relative_to(R))
def pin(p):return {'path':rel(p),'sha256':sh(p),'bytes':p.stat().st_size}
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
cp=B/'chemie-current441-final-material-image-selection-20261017-v1/C652.final-material-image.PENDING-source-context.json.snapshot';C=load(cp);G={g['id']:g for g in C['goals']};GI={g['id']:i for i,g in enumerate(C['goals'])};sp=cp.parent/'SEM652.final-material-image.PENDING-source-context.json';K={z['goalId']:z['semanticKind']for z in load(sp)['decisions']}
MP=B/'chemie-current441-HB232-final-source-mapping-integration-20261017-v1';up=MP/'SOURCE232.paired-current-unions.json';U=load(up);ep=MP/'HB232.current-paired.source-extraction.json.snapshot';E=load(ep);upperdec=load(MP/'HB232.current-paired-mapping.review.json');SG={z['id']:z for z in E['sourceGoals']}
lp=R/'curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json';L=load(lp);lep=R/L['sourceExtractionPath'];LE=load(lep);LS={z['id']:z for z in LE['sourceGoals']}
EB=B/'chemie-current439-source-requires-working-checkpoint-20261017-v1/evidence';VB=EB/'paired-all-seven-packages-and-HB7f-actual-current650-technical-v1';vp=VB/'PROSPECTIVE.whole39views.all-seven-and-HB7f.PENDING-final-union-approval.json.snapshot';V=load(vp);selp=VB/'SELECTOR.actual-all-seven-HB7f-current650-bounded-scope.json.snapshot';assert sh(vp)==load(selp)['outputs']['whole39Views']['sha256']
locp=EB/'current439-main-portable-integration-plan-technical-v1/remaining-lower-layer-cause-and-remediation-plan-v1/LOCATORS.existing-bounded-acquisition-scope-science-for-50-APV201-not-new-acceptance.json.snapshot';LOC=load(locp)
# Resolve historical primary science locators using portable names; no new judgments are made.
proofs=[]
for p in LOC['proofs']:
 q=p['pin']['path']; suffix=q.split('/skillpilot-chemie-L7-20261017/')[-1];local=EB/(suffix+'.snapshot')
 if local.is_file(): proofs.append({'pin':pin(local),'historicalPin':p['pin'],'mentionedGoalIds':p.get('warningGoalIdsMentioned',[]),'boundary':p['scopeBoundary']})
def childref(p,ptr,obj):return {**pin(p),'jsonPointer':ptr,'objectSHA256':oh(obj)}
def parseid(i):return i.split(':')[-1]
def allowed(i,profile):
 tags=G[i].get('tags',[]);courses=set(tags)&{'GK','LK'};return not courses or profile in courses
# Same bounded official-source inheritance rule as sourceAtlasDescendants.
def lower_desc(i,inherited=False,seen=None):
 seen=set()if seen is None else seen
 if i in seen:return []
 seen=seen|{i};g=G[i];d=g.get('extendedData',{})
 if d.get('applicabilityProjection')=='excluded'or(inherited and d.get('applicabilityMappingInheritance')=='boundary'):return []
 if K[i]=='curricularAtomic':return [i]
 return list(dict.fromkeys(j for c in g.get('contains',[])for j in lower_desc(parseid(c),True,seen)))
def atomdesc(i,seen=None):
 seen=set()if seen is None else seen
 if i in seen:return set()
 seen=seen|{i};g=G.get(i,{})
 if K.get(i)=='curricularAtomic':return {i}
 return set(j for c in g.get('contains',[])for j in atomdesc(parseid(c),seen))
def flatten(nodes,path='',parents=()):
 out=[]
 for n,node in enumerate(nodes):
  ptr=f'{path}/{n}'
  if node['kind']in['goalEntry','canonicalSubtree']:out.append({'goalId':node['goalId'],'role':node.get('projectionRole','target'),'kind':node['kind'],'pointer':ptr,'parents':list(parents),'node':node})
  out+=flatten(node.get('children',[]),ptr+'/children',parents+(node.get('id',node.get('label','')),))
 return out
lower_rows=[];lower_set=set();lower_by_goal=collections.defaultdict(list);empty=[]
for n,d in enumerate(L['decisions']):
 if d['decision']!='mapped':continue
 ids=[]
 for target in d['canonicalGoalIds']:
  ds=lower_desc(target);ids+=ds
  if not ds:empty.append({'decisionIndex':n,'sourceGoalId':d['sourceGoalId'],'targetGoalId':target,'targetTitle':G[target]['title'],'reason':'No current curricularAtomic child reachable without violating explicit applicabilityMappingInheritance boundary','sourceDecisionRef':childref(lp,f'/decisions/{n}',d)})
 for i in dict.fromkeys(ids):lower_set.add(i);lower_by_goal[i].append({'decisionIndex':n,'sourceGoalId':d['sourceGoalId'],'topicCode':d['topicCode']})
 lower_rows.append({'index':n,'sourceGoalId':d['sourceGoalId'],'directTargetGoalIds':d['canonicalGoalIds'],'currentPermittedAtomicGoalIds':list(dict.fromkeys(ids)),'ref':childref(lp,f'/decisions/{n}',d)})
HBEXT={}
for g in C['goals']:
 es=[(n,e)for n,e in enumerate(g.get('extendedData',{}).get('skillPilotAcquisitionExtensions',[]))if e.get('jurisdiction')=='DE-HB']
 if es:HBEXT[g['id']]=es
ORIENT='a9c22adc-b543-5b0c-a2d8-3189facdff08';GREEN='31cce65a-480a-5111-ab3c-da2feb3d4065';INV='42391b16-bbae-5c77-84e1-d488e714167b'
labels={'STD-S':'Sachkompetenz','STD-E':'Erkenntnisgewinnung','STD-K':'Kommunikation','STD-B':'Bewertung','PROCESS':'Übergreifende chemische Arbeitsweisen','E-ATOME':'Atome und Bindungen','E-ORGANIK':'Organische Verbindungen','E-KUNSTSTOFFE':'Kunststoffe und Nachhaltigkeit','E-REDOX':'Redoxreaktionen und Elektrochemie','E-SAEURE-BASE':'Säure-Base-Reaktionen','1.1':'Chemisches Gleichgewicht','1.2':'Protolysegleichgewichte','1.3':'Reaktionskinetik und Katalyse','2.1':'Kohlenhydrate','2.2':'Aminosäuren und Proteine','2.3':'Fette und Öle','3.1':'Energetik','3.2':'Elektrochemie','3.3':'Nachwachsende Rohstoffe und Klimawandel','4.1':'Kunststoffe','4.2':'Pflanzliche und synthetische Farbstoffe','4.3':'Aromatische Systeme in Natur- und Wirkstoffen'}
def structure(id,label,ids,role='target'):return {'kind':'structure','id':id,'label':label,'children':[{'kind':'goalEntry','goalId':i,'projectionRole':role}for i in ids]}
def sourcegroups(profile):
 by=collections.OrderedDict();witness=collections.defaultdict(list);filtered=[]
 for n,r in enumerate(U['rows']):
  if r['sourceCourseLevel']not in ['GK_LK',profile]:continue
  for i in r['canonicalGoalIds']:
   if not allowed(i,profile):filtered.append({'sourceOrdinal':r['ordinal'],'goalId':i,'reason':'canonical-course-restriction','tags':G[i].get('tags')});continue
   witness[i].append({'ordinal':r['ordinal'],'sourceGoalId':r['sourceGoalId'],'topicCode':r['topicCode'],'sourceCourseLevel':r['sourceCourseLevel'],'sourceUnionRef':childref(up,f'/rows/{n}',r)})
   by.setdefault(r['topicCode'],[])
   if not any(i in a for a in by.values()):by[r['topicCode']].append(i)
 return by,witness,filtered
selections=[];prior_audit=[];retention_audit=[]
for profile in ['GK','LK']:
 p=profile.lower();vi,v=next((n,z)for n,z in enumerate(V)if z['scope'].get('jurisdiction')=='DE-HB'and z['scope'].get('courseProfile')==profile);old=flatten(v['rootNodes'],'/rootNodes');old_ids={z['goalId']for z in old if z['role']=='target'};old_atoms={i for i in old_ids if K.get(i)=='curricularAtomic'};oldnon={i for i in old_ids if K.get(i)in['memory','practiceAssessment','orientation']};oldrefs={z['goalId']:z for z in old};ownroot={z['goalId']for z in old if z['role']=='target'and K.get(z['goalId'])=='curricularAtomic'and not any('source-backed'in q for q in z['parents'])};by,witness,filtered=sourcegroups(profile);upper=set(witness);lower={i for i in lower_set if allowed(i,profile)}
 # The original17/25 risk set is recorded independently of the eventual retention proposal.
 initial=upper|lower|{ORIENT};initialmiss=collections.defaultdict(list)
 for i in upper:
  for q in G[i].get('requires',[]):
   q=parseid(q)
   if q not in initial:initialmiss[q].append(i)
 explicit={i for i,es in HBEXT.items()if any(profile in e.get('courseProfiles',[])for n,e in es)}
 # Preserve only existing acquisition roots plus demonstrably needed already selected teachers.
 retain=(ownroot|explicit)-upper-lower;needfromold=set();candidates=upper|lower|retain|oldnon
 while True:
  add=set()
  for i in candidates:
   for q in G[i].get('requires',[]):
    q=parseid(q)
    if q in old_atoms and allowed(q,profile)and q not in candidates:add.add(q)
  if not add:break
  candidates|=add;needfromold|=add
 retain|=needfromold
 # Collect whole old-support roles without inventing any from requires.
 oldsupport={z['goalId']for z in old if z['role']=='prerequisiteOnly'}
 for stage in ['CrossStage','SekII']:
  name=f'de-hb-{p}.view.json'if stage=='CrossStage'else f'de-hb-sekii-{p}.view.json';viewid=f'de-hb-gym-chemistry-{p}'if stage=='CrossStage'else f'de-hb-gym-sekii-chemistry-{p}'
  target=set(upper)|set(retain)|set(oldnon);support=set(oldsupport)
  if stage=='CrossStage':target|=lower
  # Lower-stage atoms are explicit entry prerequisites only when actually needed in the new SekII scope.
  if stage=='SekII':
   todo=list(target);seen=set()
   while todo:
    i=todo.pop()
    if i in seen:continue
    seen.add(i)
    for raw in G[i].get('requires',[]):
     q=parseid(raw)
     if q in lower and q not in target and q not in support:support.add(q);todo.append(q)
     if q in G and K.get(q)=='curricularArea' and any(q in z['directTargetGoalIds'] for z in lower_rows):
      family=atomdesc(q)
      if family and family<=lower|target:
       if q not in target and q not in support:support.add(q);todo.append(q)
       for a in family-target-support:support.add(a);todo.append(a)
  # Nonassessable aggregate guard may be represented only if all ordinary children are already scoped.
  aggregate=set()
  while True:
   add=set()
   for i in target|support:
    for raw in G[i].get('requires',[]):
     q=parseid(raw)
     if q in target|support or q not in G or K[q] not in ['curricularArea','programStructure']:continue
     children=atomdesc(q)
     if children and children<=target|support:add.add(q)
   if not add:break
   support|=add;aggregate|=add
  support-=target;used=set();nodes=[];nodes.append({'kind':'goalEntry','goalId':ORIENT,'displayLabel':'Warum Chemie?','projectionRole':'target'});used.add(ORIENT)
  uppernodes=[]
  for topic,ids in by.items():
   selected=[i for i in ids if i in target and i not in used];used.update(selected)
   if not selected:continue
   suf=' (Einführungsphase)'if topic.startswith('E-')else' (Qualifikationsphase)'if re.match(r'^\d',topic)else''
   uppernodes.append(structure(f'chemistry-hb-{p}-primary-{re.sub(r"[^a-z0-9]+","-",topic.lower())}',labels.get(topic,topic)+suf,selected))
  nodes.append({'kind':'structure','id':f'chemistry-hb-{p}-sekii-primary232','label':'Chemie der Oberstufe','children':uppernodes})
  if stage=='CrossStage':
   lby=collections.OrderedDict()
   for r in lower_rows:
    available=[i for i in r['currentPermittedAtomicGoalIds']if i in target and i not in used];used.update(available)
    if available:lby.setdefault(r['sourceGoalId'].split('-')[5]if False else L['decisions'][r['index']]['topicCode'],[]).extend(available)
   lower_labels={z['topicCode']:z['title'].removeprefix(z['topicCode']).strip().replace('Loesungsmittel','Lösungsmittel') for z in LE.get('passages',[])}
   lnodes=[structure(f'chemistry-hb-{p}-lower-{n}',lower_labels.get(topic,topic),ids)for n,(topic,ids)in enumerate(lby.items())]
   if lnodes:nodes.append({'kind':'structure','id':f'chemistry-hb-{p}-seki-source-retained','label':'Chemie der Sekundarstufe I','children':lnodes})
  # Retained own acquisition is a separate authored contribution, never disguised as source coverage.
  ownids=[i for i in G if i in target and i not in used and K[i]=='curricularAtomic'];used.update(ownids)
  if ownids:nodes.append(structure(f'chemistry-hb-{p}-own-retained-learning','Ergänzende Grundlagen und Anwendungen',ownids))
  practice=[i for i in G if i in target and i not in used and K[i]=='practiceAssessment'];used.update(practice)
  if practice:nodes.append(structure(f'chemistry-hb-{p}-retained-practical-completion','Praktische Chemie: eigene Durchführung und Auswertung',practice))
  memory=[i for i in G if i in target and i not in used and K[i]=='memory'];used.update(memory)
  if memory:nodes.append(structure(f'chemistry-hb-{p}-retained-memory','Lernkarten zur Wiederholung',memory))
  assert used==target,(stage,profile,target-used)
  roots=[{'kind':'structure','id':'chemistry-root','label':'Chemie','children':nodes}]
  for i in G:
   if i in support:roots.append({'kind':'goalEntry','goalId':i,'projectionRole':'prerequisiteOnly'})
  view={'viewId':viewid,'landscapeId':C['landscapeId'],'scope':{'schoolForm':'Gymnasium','jurisdiction':'DE-HB','stage':stage,'courseProfile':profile},'rootNodes':roots};write(O/'views'/name,view)
  readset=target|support;missing=[]
  for i in target|support:
   for raw in G[i].get('requires',[]):
    q=parseid(raw)
    if q not in readset:missing.append({'consumerGoalId':i,'priorGoalId':q,'priorTitle':G.get(q,{}).get('title'),'reason':'No automatic scope/target/support import from requires; separate exact science/entry-scope confirmation remains pending'})
  selection=[]
  for i in G:
   if i not in readset:continue
   bases=[]
   if i in upper:bases.append('paired-current-HB232-qualified-source-union')
   if i in lower:bases.append('retained-normal-HB-SekI-source-atomic-descendant-boundaries-respected')
   if i in oldnon:bases.append('existing-current650-origin-selection-'+K[i])
   if i in ownroot:bases.append('retained-explicit-current650-own-acquisition-root')
   if i in needfromold:bases.append('needed-existing-current650-teacher-retained-selectively-no-new-official-credit')
   if i in explicit:bases.append('explicit-current-C652-HB-own-acquisition-annotation')
   if i in aggregate:bases.append('closed-nonatomic-aggregate-prerequisite-guard-only')
   if i in support and i in lower:bases.append('new-explicit-SekII-lower-stage-entry-support-proposal')
   origin=oldrefs.get(i)
   science=[p['pin']for p in proofs if i in p['mentionedGoalIds']]
   # Neutral selectors and mentions are never treated as new current tuple approval.
   stat='existing_paired_source_union'if i in upper else'retained_normal_lower_mapping'if i in lower and i not in aggregate else'pending_current_exact_scope_origin_and_view_binding_confirmation'
   selection.append({'goalId':i,'title':G[i]['title'],'semanticKind':K[i],'role':'target'if i in target else'prerequisiteOnly','goalRef':childref(cp,f'/goals/{GI[i]}',G[i]),'selectionBases':bases,'sourceUnionWitnesses':witness.get(i,[]),'lowerWitnesses':lower_by_goal.get(i,[]),'current650OriginRef':childref(vp,f'/{vi}'+origin['pointer'],origin['node'])if origin else None,'existingScienceLocators':science,'locatorMentionDoesNotApproveCurrentTuple':True,'currentScientificBindingStatus':stat,'HBExtensions':[{'index':n,'annotation':e,'newStageViewApproval':False}for n,e in HBEXT.get(i,[])if profile in e.get('courseProfiles',[])],'officialSourceCreditFromOwnRetention':False if i not in upper|lower else None,'newStageTransfer':stage=='SekII'and i not in upper,'masteryAssumed':False})
  selections.append({'viewPath':rel(O/'views'/name),'viewId':viewid,'scope':view['scope'],'completeCandidate':True,'sourceAtomicTargetCount':len(upper),'lowerAtomicAvailableCount':len(lower),'targetGoalIds':[i for i in G if i in target],'prerequisiteOnlyGoalIds':[i for i in G if i in support],'targetCounts':dict(collections.Counter(K[i]for i in target)),'supportCounts':dict(collections.Counter(K[i]for i in support)),'selection':selection,'directMissingPriorRows':missing,'newViewExactScopeApproval':'pending','scopeScienceOrOriginApprovalClaimed':False})
 for q,consumers in sorted(initialmiss.items()):
  prior_audit.append({'courseProfile':profile,'priorGoalId':q,'priorTitle':G.get(q,{}).get('title'),'currentConsumers':consumers,'currentGoalRef':childref(cp,f'/goals/{GI[q]}',G[q])if q in G else None,'selectedInLatest650HB':q in old_ids,'explicitOwnRootInLatest650HB':q in ownroot,'presentAsRetainedCandidate':q in retain,'sourceOrLowerWitness':q in upper|lower,'HBExplicitOwnAnnotation':q in explicit,'existingScienceLocators':[a['pin']for a in proofs if q in a['mentionedGoalIds']],'status':'pending_current_exact_HB_acquisition_or_entry_scope_confirmation','neverAutoImportedAsApprovedFromRequires':True})
 # Complete classification of every old Main ref, not just new Upper carriers.
 mainp=R/f'curricula/DE/Gymnasium/composition-views/chemie/de-hb-{p}.view.json';oldmain=flatten(load(mainp)['rootNodes'],'/rootNodes')
 for z in oldmain:
  i=z['goalId'];kind=K.get(i);status='retained-current-source-atomic'if i in upper else'replaced-lower-cluster-by-permitted-current-atoms'if any(i in r['directTargetGoalIds']for r in lower_rows)and kind=='curricularArea'else'retained-lower-current-atomic'if i in lower else'retained-selected-own-acquisition-candidate-pending-current-binding'if i in retain else'retained-nonordinary-origin-selection'if i in oldnon else'replaced-superseded-old88-upper-source-role-no-current-whole-source-credit'
  retention_audit.append({'courseProfile':profile,'goalId':i,'title':G.get(i,{}).get('title'),'semanticKindCurrent':kind,'oldMainNodeRef':childref(mainp,z['pointer'],z['node']),'disposition':status,'currentLowerAtomReplacement':lower_desc(i)if i in G and kind=='curricularArea'else[],'newSourceCarrier':i in upper,'hasPendingPriorCase':q in initialmiss if False else i in initialmiss})
# Audit source map and exact selected current tuples without performing any source science again.
write(O/'SELECTION.complete-four-views.json',{'artifactType':'complete-four-HB-view-authoring-selection-no-new-science','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'active':False,'reviewAuthority':'ai_candidate','M7Claim':False,'HumanApproval':False,'HumanTrial':False,'newSourceScience':False,'sourceSelectionPin':pin(up),'sourceMappingPin':pin(MP/'HB232.current-paired-mapping.review.json'),'sourceExtractionPin':pin(ep),'canonicalPin':pin(cp),'semanticKindsPin':pin(sp),'current650Whole39ViewPin':pin(vp),'current650AppliedSelectorPin':pin(selp),'scopeRulesExact':U['scopeRulesExact'],'allIndividualSourceRelations':'partial','singleMasteryCompletesWholeSource':False,'views':selections})
write(O/'RETENTION.old-main-and-current650-origins.json',{'oldMainEveryReferenceDisposition':retention_audit,'latest650BeforeLowerAndUpperRemap':{'GK':childref(vp,'/13',V[13]),'LK':childref(vp,'/14',V[14])},'current650AppliedWhole39SHAExactlyMatchesProspectiveStoredBytes':True,'neutral593SelectorIsNotActivationApproval':True,'onlyHBViewsWritten':True})
write(O/'BOUNDARIES.lower-gaps-priors-and-origin-bindings.json',{'active':False,'scientificScopeActivation':'HOLD','lowerSourceInventory':{'directTargets':58,'currentPermittedAtomicDescendants':len(lower_set),'sourceDecisions':42,'lowerMappingPin':pin(lp),'lowerExtractionPin':pin(lep),'rows':lower_rows},'lowerBoundaryGapRows':empty,'distinctEmptyMappedClusterIds':list(dict.fromkeys(z['targetGoalId']for z in empty)),'affectedLowerSourceDecisionCount':len({z['decisionIndex']for z in empty}),'affectedLowerSourceEdgeCount':len(empty),'initialSourcePlusLowerMissingPriors17GK25LK':prior_audit,'source232ScienceNotReopened':True,'selectionPendingDoesNotMeanNewScientificHOLDOn232':True,'oldAcquisitionLocatorPin':pin(locp),'allEvidenceLocatorPins':proofs,'newSekIIScopeRoleTransfer':'Authored new candidate only. Source target selection is explicit and source-bound; old CrossStage acquisition and Memory origin roles are retained prospectively with separate current binding confirmation pending. Lower entry support contributes no target progress and no acquisition-from-unknown claim.','practicePolicy':'Only two preexisting current650 HB practical-completion endpoints7fe/ac75 retained. All other hidden exam/practice endpoints remain unselected. No endpoint inferred from global applicability or requires, no exam/quota/passed-lab claim.'})
(O/'README.md').write_text('''# Vier vollständige HB-Chemie-View-Kandidaten\n\nEnthält die beiden CrossStage-Nachfolger und zwei neue explizite SekII-GK/LK-Views gegen den finalen C652-Material-/Bildkandidaten. Keine normale Aktivierung, keine neue Quellenwissenschaft.\n\nDie neue Oberstufenauswahl verwendet alle232 gepaarten Quellenunionen, tatsächliche amtliche Kursgrenzen und die ursprünglichen Quellthemen.31c liegt erstmals unter E-Organik;4239 ist ausdrücklich imHB-SekII-Umfang referenziert. Globale Zieltexte/Tags/Phasen bleiben unverändert. Jeder sichtbare Target wird einmal geführt.\n\nFür CrossStage werden die42 normalen Lower-Quellentscheidungen mit58 direkten Trägern weitergeführt. Die vorhandene Vererbungsgrenze wird beachtet:77 aktuelle Atome sind erreichbar; fünf alteCluster führen bei14 Quellentscheidungen/15 Kanten zu keinen zulässigen Atomic-Nachfolgern. Diese Grenze wird nicht mit unerlaubter Clustervererbung geschlossen.\n\nDie Retention folgt der tatsächlichen650-Overlay-Whole39-Datei (SHA00cf1869...), deren Bytes exakt dem angewandten Selector/Receipt entsprechen, und nicht nur dem älteren neutralen593-Selector. Vorhandene Memory-/Orientierungs- und genau zwei praktische Endpunkte werden erhalten. Eigen-Erwerbsgrundlagen und notwendige schon vorhandene Lehrer werden getrennt vom Quellenkredit geführt. Noch nicht auf die aktuelle ganze HB-/Stage-Tupelbindung aufgelöste Science bleibt ausdrücklich pending. Ein früherer Selector oder ein bloßer Locatorhinweis wird nicht als Freigabe ausgegeben.\n\n`SELECTION.complete-four-views.json` gibt jeden ausgewählten Zielkörper, Rollen-/Quellen-/Originbeleg und die offenen Bindungen an. `RETENTION...` klassifiziert jede alte Main-Referenz. `BOUNDARIES...` enthält sämtliche anfänglichen17GK-/25LK-Priorfälle sowie die echten Lower-Lücken. Im neuen SekII-Umfang bleiben bekannte Lower-Eintrittsvoraussetzungen und geschlossene Aggregate gesondert prerequisiteOnly, ohne Zielprogress oder angenommene Mastery. Es wird kein vollständiger Erwerbspfad aus unbekannter Vorbeherrschung behauptet.\n\nStockcompile-Ergebnisse stehen im separaten Prüfbericht. Auch bei fehlerfreier Strukturkompilierung bleibt fachliche Aktivierung/HB-Anwendbarkeitscompiler/native Kontextintegration offen. Keine Builds/volleQA, Runtimeänderung, D/P-Neufreigabe, M7, HumanApproval oder HumanTrial.\n''')
# Input/read pin manifest is bounded to actual support metadata; primary source science is retained, not repeated.
write(O/'INPUTS.exact-current-and-retained-pins.json',{'pins':[pin(p)for p in [cp,sp,up,ep,MP/'HB232.current-paired-mapping.review.json',lp,lep,vp,selp,VB/'RECEIPT.actual-all-seven-HB7f-76-to-zero-bounded-scope.json.snapshot',locp]],'scope':'HB only; old source science and origin records reused at exact retained bounds, all unfinished current bindings explicit.'})
print(rel(O));print('LOWER',len(lower_set),'GAPCLUSTERS',len({z['targetGoalId']for z in empty}),'DECISIONS',len({z['decisionIndex']for z in empty}),'EDGES',len(empty))
for s in selections:print(s['viewId'],s['targetCounts'],'POnly',len(s['prerequisiteOnlyGoalIds']),'missingdirect',len(s['directMissingPriorRows']))
