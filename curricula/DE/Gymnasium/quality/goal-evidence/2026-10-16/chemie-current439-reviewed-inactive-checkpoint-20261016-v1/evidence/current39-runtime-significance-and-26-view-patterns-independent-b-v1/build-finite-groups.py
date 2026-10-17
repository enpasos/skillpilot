import pathlib,json,collections,hashlib
R=pathlib.Path.cwd();T=R/'tmp/chemie-m7-resumed-20261016';O=T/'current39-runtime-significance-and-26-view-patterns-independent-b-v1';I=T/'current39-direct-prerequisite-role-inventory-independent-b-v1';K=T/'chemie-shared640-recycling-native-author-capsule-L6-v1';rd=lambda p:json.loads(pathlib.Path(p).read_text());sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest();pin=lambda p:{'path':str(pathlib.Path(p).relative_to(R)),'sha256':sha(p),'bytes':pathlib.Path(p).stat().st_size};wr=lambda p,v:pathlib.Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
ix=rd(I/'INDEX.complete-direct-ordinary-missing-ID-view-consumer-sets.json');V=ix['variants'][-1];can=rd(K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');g={a['id']:a for a in can['goals']};allowed={'DE-BW','DE-BY','DE-HB','DE-HH','DE-MV','DE-NI','DE-NW','DE-RP','DE-SH','DE-SL','DE-SN','DE-ST','DE-TH'};vs=[v for v in V['perView'] if v['scope'].get('jurisdiction') in allowed];pairs=[p for p in V['completeMissingPriorIdViewPairs'] if p['scope'].get('jurisdiction') in allowed];assert len(vs)==26 and len(pairs)==740
parent={};parents=collections.defaultdict(set)
for a in can['goals']:
 for z in a.get('contains',[]):
  parents[z].add(a['id'])
  if 'root' not in a.get('tags',[]):parent.setdefault(z,a['id'])
sourceMaps={};mapPins=[]
for st in sorted(allowed):
 selected=[p for p in (K/'curricula/DE/Gymnasium/mapping'/st).rglob('*.review.json') if p.name.endswith('_source_extraction_to_canonical_chemistry.review.json')];assert len(selected)==2
 edges=collections.defaultdict(list)
 for p in selected:
  x=rd(p);mapPins.append(pin(p))
  for e in x['mappings']:
   id=e.get('canonicalGoalId','').split(':')[-1]
   edges[id].append({'path':str(p.relative_to(R)),'sourceExtractionPath':x.get('sourceExtractionPath'),'sourceLandscapeId':x.get('sourceLandscapeId'),'sourceGoalId':e.get('legacyGoalId'),'matchType':e.get('matchType'),'courseLevelDecision':e.get('courseLevelDecision'),'stagePath':'SekI' if 'lower-secondary' in str(p) else 'SekII' if 'upper-secondary' in str(p) else 'mixed-or-not-separated-in-path'})
 sourceMaps[st]=edges
proc={'b6327e98-8ab9-5d7f-b826-4023bc1a56a7','49b13b33-34b7-5e4e-861c-b21082cb9922','91238ba1-5c63-50c7-a4fd-9bbe492c6b61','542822de-cb96-56cf-a487-0fc3b5820f57','871eabde-6e19-59d3-bc7c-60977a9837db'}
org={'9aec52cb-1f7d-5343-b5f9-a8e72ddd25fa','61446285-4415-5bd9-9fdc-c19bb9ec1b02','c2d3f72b-e28a-5cae-b52a-7ffaa39d17c2','55f35372-d7a3-5299-bf9e-9828d6720366','8519f683-7c31-50da-be59-649997a6fc47','b71d69bd-78d0-5a32-9755-b87e2cc989ea','47a40c98-ab20-5246-85e3-3abe5a9e95ed','66fcf3e4-771f-5092-95fb-949087d6d3d5'}
elect={'33766473-86a1-5f82-afc9-bdb8ed6a2ab6','702f774d-ad93-4a6b-98f6-c53310e176c4','cd7f484a-ac2e-55bb-b904-61d743e87821','1848c806-a7b6-5e77-bd16-356a82d0dfd9'}
bio={'24b47a95-c239-552a-9be7-324aa54a89dd','afad3a68-c643-5c49-8583-e5d8b1d8b56c','62149f36-87c0-5a2d-8a78-e7d4203f58c2'}
found={'fb3bdf39-4baf-4510-a192-c8a12fbf5dba','15e73664-8c3f-5aa6-ac65-b455fc3ed6d6','1e803ef8-fc76-493d-85c5-de877cd38fda','2facec3b-ea18-5769-9396-0ffdcc4455c3'}
def family(id):
 if id=='266a2b2a-9ee2-52f6-ae09-59343da9a60b':return '01-existing-laboratory-cluster-interface'
 if id=='8761cfd2-aa1a-56f1-9272-9cf66ef4b271':return '02-existing-carbohydrate-cluster-interface'
 p=parent.get(id)
 if p in proc:return '03-source-evidence-argument-and-evaluation-chains'
 if 'SekI' in g[id].get('tags',[]) or p in found:return '04-existing-atomic-foundations-and-representations'
 if p in org:return '05-organic-mechanism-carbonyl-and-substitution-chains'
 if p in elect:return '06-redox-electrochemical-chains'
 if p in bio:return '07-biomolecule-and-polymer-chains'
 return '08-remaining-topic-specific-interfaces'
def ancestors(id):
 # Routing only: preserve boundary nodes; no full source coverage is inferred.
 seen=set();q=list(parents[id]);out=[]
 while q:
  p=q.pop()
  if p in seen:continue
  seen.add(p);out.append(p)
  if g[p].get('extendedData',{}).get('applicabilityMappingInheritance')!='boundary':q.extend(parents[p])
 return out
for p in pairs:
 id=p['priorId'];src=sourceMaps[p['scope']['jurisdiction']];p['batchFamily']=family(id);p['canonicalPrimaryParent']={'id':parent.get(id),'title':g.get(parent.get(id),{}).get('title')};p['directSourceMappingWitnesses']=src.get(id,[]);anc=ancestors(id) if g[id].get('extendedData',{}).get('applicabilityMappingInheritance')!='boundary' else [];p['ancestorSourceMappingWitnesses']=[{'ancestorId':z,'ancestorTitle':g[z]['title'],'mappings':src[z]} for z in anc if z in src];p['sourceRoutingPattern']='direct-mapping-present-role-absent' if p['directSourceMappingWitnesses'] else 'ancestor-mapping-only-not-whole-approval' if p['ancestorSourceMappingWitnesses'] else 'no-current-local-review-map-witness';p['sourcePatternIsFullCoverageJudgment']=False
batches=[]
for f in sorted({p['batchFamily'] for p in pairs}):
 pp=[p for p in pairs if p['batchFamily']==f];prior=[]
 for id in sorted({p['priorId'] for p in pp},key=lambda z:(-sum(p['edgeCount'] for p in pp if p['priorId']==z),z)):
  zz=[p for p in pp if p['priorId']==id];prior.append({'id':id,'title':g[id]['title'],'canonicalParent':zz[0]['canonicalPrimaryParent'],'distinctViews':len(zz),'ordinaryEdges':sum(p['edgeCount'] for p in zz),'viewConsumerSets':[{'view':p['view'],'scope':p['scope'],'ordinaryConsumerIds':p['ordinaryConsumerIds'],'sourceRoutingPattern':p['sourceRoutingPattern']} for p in zz]})
 batches.append({'batchFamily':f,'distinctPriorIds':len(prior),'views':len({p['view'] for p in pp}),'idViewPairs':len(pp),'ordinaryEdges':sum(p['edgeCount'] for p in pp),'sourceRoutingPatterns':dict(collections.Counter(p['sourceRoutingPattern'] for p in pp)),'exactPriorInterfaceSets':prior})
# Runtime loader witnesses for the finite eight authored-reference exposure differences.
bd=rd(I/'BOUNDARY.authored-course-versus-stock-jurisdiction-filter-context.json');eight=bd['currentEightAdditionalOrdinaryEdges'];focusIds={p['consumerId'] for p in eight};runtimeMaps=[];aliasByState=collections.defaultdict(set)
for p in (R/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 if p.name.endswith('.review.json'):continue
 x=rd(p)
 if not isinstance(x,dict) or x.get('targetLandscapeId')!=can['landscapeId'] or any(k in x for k in ['reviewId','sourceExtractionPath','decisions']) or 'mappings' not in x:continue
 runtimeMaps.append(pin(p));state=next((s for s in p.parts if s.startswith('DE-')),None)
 if state:
  for e in x['mappings']:aliasByState[state].add(e.get('canonicalGoalId'))
for e in eight:
 st=e['scope']['jurisdiction'];goal=g[e['consumerId']];e['currentRuntimeAliasLoaderDirectWitness']=e['consumerId'] in aliasByState[st];e['canonicalLeafHasDescendantFallback']=bool(goal.get('contains'));e['actualProvenanceSourceLandscapeId']=goal.get('extendedData',{}).get('provenance',{}).get('sourceLandscapeId');e['actualProvenanceState']='DE-BY';e['runtimeStandardStateFilterConclusion']='filtered out: explicit applicability lacks state, no same-state runtime alias, leaf has no descendants, actual provenance BY';assert not e['currentRuntimeAliasLoaderDirectWitness'] and not e['canonicalLeafHasDescendantFallback']
wr(O/'SOURCE-METADATA.26-state-review-map-pins-and-eight-runtime-fallback-contexts.json',{'role':'Finite existing mapping metadata routing, no whole source/P review or source union decision','reviewMapPins':mapPins,'runtimeAliasMapPins':runtimeMaps,'runtimeAliasLoaderMapCount':len(runtimeMaps),'scope':'Current repository legacy loader inputs only; not proof of a deployed package generation','eightForeignAuthoredRefConclusions':eight})
wr(O/'GROUPS.remaining26-COMBINED-complete-prior-view-consumer-and-source-patterns.json',{'role':'Finite grouped routing inventory from sealed own COMBINED sets, not scientific classification/approval or automatic repairs','sourceInventory':pin(I/'INDEX.complete-direct-ordinary-missing-ID-view-consumer-sets.json'),'assumedContentBaseline':{'canonicalCurrentApplied':'37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80','SEMCurrentApplied':'8ae8d21eb7a4714309eb1a215e14663d85d40917d4b9e1829a5de559e85bc62b','knownParentNotification':'Paired813/91cd and22LK placements applied; no re-inventory for the same known changes.'},'scope':{'views':26,'viewsWithOmissions':25,'zeroMissingView':'de-by-c10-ethanol-risk-unit.current-pilot.view.json','priorIds':len({p['priorId'] for p in pairs}),'idViewPairs':len(pairs),'ordinaryEdges':sum(p['edgeCount'] for p in pairs),'nonordinaryMemoryConsumerEdgesInThese26':0},'batchMethod':'Exact existing prior-ID/interface/view sets are grouped by actual canonical parent and defined prior IDs. Canonical labels/phase are organizational metadata, not local course obligations. Source pattern reads existing mapping endpoints only; partial/ancestor edges are not full source approval.','viewSummaries':vs,'batches':batches,'completePairs':pairs})
print(json.dumps({'scope':{'views':26,'affected':25,'priorIds':len({p['priorId'] for p in pairs}),'pairs':len(pairs),'edges':sum(p['edgeCount'] for p in pairs)},'batches':[{k:v for k,v in x.items() if k!='exactPriorInterfaceSets'} for x in batches],'sourcePatterns':dict(collections.Counter(p['sourceRoutingPattern'] for p in pairs)),'runtimeMapCount':len(runtimeMaps),'foreignEdgesFiltered':len(eight)},ensure_ascii=False,indent=2))
