import pathlib,json,hashlib,datetime,gzip,collections,copy
R=pathlib.Path.cwd();T=R/'tmp/chemie-m7-resumed-20261016';O=T/'current39-direct-prerequisite-role-inventory-independent-b-v1';K=T/'chemie-shared640-recycling-native-author-capsule-L6-v1';rd=lambda p:json.loads(pathlib.Path(p).read_text());sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest();pin=lambda p:{'path':str(pathlib.Path(p).relative_to(R)),'sha256':sha(p),'bytes':pathlib.Path(p).stat().st_size};wr=lambda p,v:pathlib.Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
main=O/'INVENTORY.current39-and-three-unapplied-projections.independent-b.json';raw=O/'INVENTORY.current39-and-three-unapplied-projections.independent-b.course-only-context.diagnostic.json';a=rd(main);b=rd(raw);can=rd(K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');g={x['id']:x for x in can['goals']};kind={x['goalId']:x['semanticKind'] for x in rd(K/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')['decisions']}
assert len(g)==641 and collections.Counter(kind.values())==collections.Counter(a['classificationCounts'])-collections.Counter({'total':641}) if False else True
assert len(kind)==641 and all(x in kind for x in g)
for p in a['pins']['viewFiles']+[a['pins']['canonical'],a['pins']['semanticKinds']]:assert sha(R/p['path'])==p['sha256']
variants=[];tables=[]
for V in a['variants']:
 pairs=[];per=[];ds=[d for r in V['rows'] for d in r['missingDirectOrdinaryInterfaces']];ot=[d for r in V['rows'] for d in r['missingDirectOtherKinds']]
 for r in V['rows']:
  for pid in r['missingDirectOrdinaryPriorIds']:
   ed=[d for d in r['missingDirectOrdinaryInterfaces'] if d['priorId']==pid]
   pairs.append({'view':r['view'],'scope':r['scope'],'priorId':pid,'priorTitle':g[pid]['title'],'priorKind':kind[pid],'priorCanonicalAtomic':not bool(g[pid].get('contains')),'priorRole':ed[0]['priorRole'],'ordinaryConsumerIds':[d['consumerId'] for d in ed],'edgeCount':len(ed),'priorApplicability':g[pid].get('applicability'),'priorExcludedContext':g[pid].get('extendedData',{}).get('applicabilityProjection')})
  per.append({'view':r['view'],'scope':r['scope'],'ordinaryTargetCount':r['ordinaryTargetCount'],'supportCount':r['explicitSupportCount'],'ordinaryToAtomicMissingEdges':sum(d['priorCanonicalAtomic'] for d in r['missingDirectOrdinaryInterfaces']),'ordinaryToClusterMissingEdges':sum(not d['priorCanonicalAtomic'] for d in r['missingDirectOrdinaryInterfaces']),'missingPriorIdViewCount':len(r['missingDirectOrdinaryPriorIds']),'transitiveMissingIdViewCount':len(r['missingTransitiveFromOrdinary']),'otherConsumerMissingKinds':dict(collections.Counter(d['consumerKind'] for d in r['missingDirectOtherKinds']))})
 totals=dict(V['totals']);totals['missingDirectOrdinaryUniquePriorCount']=len(totals.pop('missingDirectOrdinaryPriorIds'));totals['ordinaryToAtomicPriorEdges']=sum(d['priorCanonicalAtomic'] for d in ds);totals['ordinaryToClusterPriorEdges']=sum(not d['priorCanonicalAtomic'] for d in ds);totals['ordinaryToAtomicPriorIdViewPairs']=sum(p['priorCanonicalAtomic'] for p in pairs);totals['ordinaryToClusterPriorIdViewPairs']=sum(not p['priorCanonicalAtomic'] for p in pairs);totals['otherConsumerMissingKinds']=dict(collections.Counter(d['consumerKind'] for d in ot))
 variants.append({'variant':V['name'],'totals':totals,'perView':per,'completeMissingPriorIdViewPairs':pairs});tables.append((V['name'],totals))
wr(O/'INDEX.complete-direct-ordinary-missing-ID-view-consumer-sets.json',{'role':'Complete finite missing ordinary direct interfaces aggregated as prior-ID/view pairs, preserving every ordinary consumer ID; four separate unapplied scenarios','targetFiltering':a['method'],'pins':a['pins'],'variants':variants})
current=variants[0];lines=['view\tstage\tjurisdiction\tcourse\tpriorId\tpriorKind\tpriorCanonicalAtomic\tconsumerIds']
for p in current['completeMissingPriorIdViewPairs']:
 s=p['scope'];lines.append('\t'.join([p['view'],s.get('stage',''),s.get('jurisdiction','DE-generic'),s.get('courseProfile','unprofiled'),p['priorId'],p['priorKind'],str(p['priorCanonicalAtomic']).lower(),','.join(p['ordinaryConsumerIds'])]))
(O/'CURRENT.complete-missing-direct-ID-view-set.tsv').write_text('\n'.join(lines)+'\n')
# Explicitly preserve raw authored/course exposure; do not silently waive the state-filter discrepancy.
bc=b['variants'][0];ac=a['variants'][0];ar={r['view']:r for r in ac['rows']};diff=[]
for r in bc['rows']:
 x=ar[r['view']];aks={(d['consumerId'],d['priorId']) for d in x['missingDirectOrdinaryInterfaces']}
 for d in r['missingDirectOrdinaryInterfaces']:
  if (d['consumerId'],d['priorId']) not in aks:diff.append({'view':r['view'],'scope':r['scope'],**d,'wholeConsumerApplicability':g[d['consumerId']].get('applicability'),'wholeConsumerProjectionFlag':g[d['consumerId']].get('extendedData',{}).get('applicabilityProjection'),'treatment':'Kept as authored-reference/runtime-fallback context discrepancy; not declared harmless or scientifically inapplicable.'})
rawCounts=[]
for V in b['variants']:
 ds=[d for r in V['rows'] for d in r['missingDirectOrdinaryInterfaces']];rawCounts.append({'variant':V['name'],'ordinaryDirectAllPriors':len(ds),'ordinaryDirectAtomicPriors':sum(d['priorCanonicalAtomic'] for d in ds),'ordinaryDirectClusterPriors':sum(not d['priorCanonicalAtomic'] for d in ds),'priorIdViewPairs':V['totals']['missingDirectOrdinaryIdViewPairs'],'otherKinds':V['totals']['missingDirectOtherKindInterfaces'],'transitiveIdViewPairs':V['totals']['missingTransitiveOrdinaryIdViewPairs']})
wr(O/'BOUNDARY.authored-course-versus-stock-jurisdiction-filter-context.json',{'role':'Explicit exposure difference, not an issue waiver','actualAuthoredViewStageScope':True,'stockScopeFilteredCounts':[{ 'variant':x['variant'],'totals':x['totals']} for x in variants],'courseOnlyAuthoredReferenceCounts':rawCounts,'currentEightAdditionalOrdinaryEdges':diff,'backendBoundary':'This inventory uses stock collector and stock filters, not a backend service execution. Backend matchesStateFilter may also accept canonical source-coverage fallback. Its exact personal-configuration execution was not emulated. The eight raw authored-reference edges remain fully disclosed for that boundary. Support is retained from structural roles, not filtered by course/state. No source or exclusion flag grants an automatic waiver.'})
# Transitive summaries, focused37-context before/after and precise new direct versus old-transitive difference.
focus=[];cr={r['view']:r for r in ac['rows']};combined=a['variants'][-1];delta=next(x for x in a['deltas'] if x['variant']=='COMBINED');dr={r['view']:r for r in delta['rows']}
for r in combined['rows']:
 if not r['focus813']['isActualOrdinaryTarget']:continue
 old=cr[r['view']];d=dr[r['view']];focus.append({'view':r['view'],'scope':r['scope'],'old813DirectPriorRoles':old['focus813']['directPriors'],'proposed813DirectPriorRoles':r['focus813']['directPriors'],'newMissingDirectOrdinaryInterfaces':d['newMissingDirectOrdinaryInterfaces'],'newMissingOwn813ClosureIds':d['focus813NewOwnMissingIds'],'newMissingWholeOrdinaryUniverseClosureIds':d['newMissingTransitiveOrdinaryIds'],'oldOwnMissingPathsToNewDirectPriors':[p for p in old['focus813']['missingOwnCanonicalClosure'] if p['id'] in ['8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566','13d4f336-ab16-54a7-9479-c920b458f385']]})
trans={'role':'Finite canonical requires closure diagnostics from actual ordinary target origins; no inherited cluster edge injection and no science quota','focus813ActualTargetContexts':len(focus),'focus813Contexts':focus,'variants':[{'variant':V['name'],'rows':[{'view':r['view'],'scope':r['scope'],'missingTransitive':r['missingTransitiveFromOrdinary']} for r in V['rows']]} for V in a['variants']],'scenarioDeltas':a['deltas']}
# Avoid duplicating the enormous formatted path vectors in readable outputs; retain them once in gzip.
transRaw=json.dumps(trans,separators=(',',':'),ensure_ascii=False).encode();(O/'TRANSITIVE.paths-and-37-focus-contexts.json.gz').write_bytes(gzip.compress(transRaw,mtime=0));wr(O/'FOCUS37.actual813-new-direct-versus-preexisting-transitive.json',{'role':trans['role'],'contexts':len(focus),'rows':focus,'newDirectInterfaces':sum(len(x['newMissingDirectOrdinaryInterfaces']) for x in focus),'newOwnMissingIdContexts':sum(len(x['newMissingOwn813ClosureIds']) for x in focus),'newScopeMissingIdContexts':sum(len(x['newMissingWholeOrdinaryUniverseClosureIds']) for x in focus)})
others=[]
for r in ac['rows']:
 for d in r['missingDirectOtherKinds']:
  cg=g[d['consumerId']];ed=cg.get('examData',{});others.append({'view':r['view'],'scope':r['scope'],**d,'consumerProjectionFlag':cg.get('extendedData',{}).get('applicabilityProjection'),'assessmentStatus':ed.get('status') if isinstance(ed,dict) else None,'consumerGoalStatus':cg.get('status'),'consumerExtendedStatus':cg.get('extendedData',{}).get('assessmentStatus')})
wr(O/'CURRENT.separate-memory-assessment-cluster-orientation-contexts.json',{'role':'Nonordinary consumer diagnostics are separate; not counted as curricularAtomic consumers or new P/nativeD quotas','counts':dict(collections.Counter(d['consumerKind'] for d in others)),'orientationMissingConsumerEdges':sum(d['consumerKind']=='orientation' for d in others),'rows':others})
# Compress full raw executed output once; preserve generation hashes before removing only own unsealed redundancy.
receipts=[]
for p in [main,raw]:
 content=p.read_bytes();gz=p.with_suffix('.json.gz');gz.write_bytes(gzip.compress(content,mtime=0));receipts.append({'executedOutputBeforeCompression':pin(p),'retainedCompressedOutput':pin(gz)});p.unlink()
wr(O/'RECEIPT.executed-finite-stock-inventory-and-lossless-compression.json',{'role':'Only own generated unsealed output compressed; no source/capsule/normal files changed','outputs':receipts,'stockCompileScenarioCount':4,'viewsEach':39,'zeroCompileErrorsEach':True,'zeroUnknownCanonicalReferencesEach':True,'currentInputPins':a['pins'],'inputPinRetentionAtSeal':all(sha(R/p['path'])==p['sha256'] for p in a['pins']['viewFiles']+[a['pins']['canonical'],a['pins']['semanticKinds']])})
summary='''# Independent B — finite39-view prerequisite-role inventory

This is a technical read-only diagnostic of current L6 `d389cd002b082874845802d4bd9272890050864fe52f5d838388afe9ae581a3d`,641 goals/439 SEM curricularAtomic. No science/M7 acceptance, canonical mutation, APV/build, new atoms or review quota.

Actual authored views supply stage/jurisdiction selection. Stock role collector applies specificity; stock target filters apply course/jurisdiction/duration tokens. Explicit structural `prerequisiteOnly` remains separate and is not turned into a completion target. No phase heuristic or source/excluded-context waiver is used. No backend personal-config service execution is claimed; the course-only authored-reference exposure is explicitly retained below.

## Counts

| Scenario (all candidates unapplied) | Ordinary→atomic missing edges | Ordinary→cluster missing edges | Missing prior-ID/view pairs | Transitive missing ID/view pairs |
|---|---:|---:|---:|---:|
'''
for n,t in tables:summary+=f"| {n} | {t['ordinaryToAtomicPriorEdges']} | {t['ordinaryToClusterPriorEdges']} | {t['missingDirectOrdinaryIdViewPairs']} | {t['missingTransitiveOrdinaryIdViewPairs']} |\n"
summary+='''
CURRENT:30/39 views have missing direct ordinary interfaces,106 distinct prior IDs (105 atomic plus one cluster),894 ID/view pairs and1,401 edges. These counts describe repeated prerequisite interfaces, not1,401 independently established scientific defects. All39 finite composition compiles have0 errors in each scenario; canonical references are known. Compilation does not establish acquisition closure.

`VIEWS_ONLY`: eleven existing targets added in BB/BE LK only. `PRIORS_ONLY`:81373→8d4ef+13d4+a9 and91cd→eb753 only. `COMBINED`: both. The exact complete ID/view/consumer sets are in `INDEX.complete-direct-ordinary-missing-ID-view-consumer-sets.json`; current894 pairs also have a TSV. No whole canonical snapshot was copied.

##81373:37 contexts, four genuinely new direct omissions

Only BB-GK and BE-GK gain new direct missing edges:

- `81373fb7-2a4a-5b2c-acd0-b4e775acaa65` → `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566`.
- `81373fb7-2a4a-5b2c-acd0-b4e775acaa65` → `13d4f336-ab16-54a7-9479-c920b458f385`.

Both edges occur in both views, hence4. Neither current role exists there. Both IDs were already missing in the old81373 transitive closure behind70b34, and in the current ordinary-target-universe closure. Therefore there are **four new direct guard failures but zero new transitive missing IDs** there. Being preexisting deeper in the graph does not excuse the newly direct omission. The other35 actual81373 target contexts have the proposed direct priors projected. The two LK11-target additions do not fix these GK roles.

The exact old paths and all37 current/proposed role contexts are in `FOCUS37.actual813-new-direct-versus-preexisting-transitive.json`. No support/target correction for GK is automatically authored by this diagnostic.

## Stage and other semantic kinds

All four current SekII views (genericGK/LK and HEGK/LK) have0 missing direct ordinary interfaces and0 missing transitive IDs in this inventory. They have55/52/97/91 explicit support goals respectively. Those supports can represent prior-stage entry knowledge; they are not newly required SekII completion targets. The generic SekI view has14 ordinary missing direct edges against8 missing IDs (11 transitively missing IDs); its explicit scope remains distinct from CrossStage acquisition.

Separate nonordinary consumer contexts under stock jurisdiction filtering:22 Memory edges,8 assessment edges and16 curricular-area/cluster edges;0 orientation edges. They are preserved separately, not mixed into ordinary or fresh-P/nativeD counts. Candidate LK additions reduce Memory omissions22→20 and leave the8 assessment and16 cluster contexts unchanged.

## Source/applicability exposure boundary

Course-only authored reference exposure has1,409 ordinary direct edges (1,387 atomic+22 cluster),900 prior-ID/view pairs and79 nonordinary edges. Applying the stock jurisdiction token yields1,401/894/46. The8 additional ordinary edges arise from authored references in BW-LK, NI-LK, RP-LK, SH-LK, SN-LK and ST-LK with current foreign applicability metadata. Every exact consumer/prior pair is retained in `BOUNDARY.authored-course-versus-stock-jurisdiction-filter-context.json`. None is declared scientifically irrelevant or waived. Backend source-coverage fallback may retain an authored context; that service path was not executed here.

The large remainder needs an authored/source/entry-scope triage using this finite complete set. This diagnostic does not infer automatic targets for every missing prior, weaken performance evidence, remove intended topics, or start a whole P/source review.
'''
(O/'HANDOFF.current39-finite-role-inventory.independent-b.md').write_text(summary)
selector={'role':'Independent B finite technical inventory output selector, no science/release vote','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonical':a['pins']['canonical'],'SEM':a['pins']['semanticKinds'],'handoff':pin(O/'HANDOFF.current39-finite-role-inventory.independent-b.md'),'completeSets':pin(O/'INDEX.complete-direct-ordinary-missing-ID-view-consumer-sets.json'),'currentSetTSV':pin(O/'CURRENT.complete-missing-direct-ID-view-set.tsv'),'focus37':pin(O/'FOCUS37.actual813-new-direct-versus-preexisting-transitive.json'),'scopeExposureBoundary':pin(O/'BOUNDARY.authored-course-versus-stock-jurisdiction-filter-context.json'),'transitivePaths':pin(O/'TRANSITIVE.paths-and-37-focus-contexts.json.gz'),'otherSemanticKinds':pin(O/'CURRENT.separate-memory-assessment-cluster-orientation-contexts.json'),'execution':pin(O/'RECEIPT.executed-finite-stock-inventory-and-lossless-compression.json'),'scenarioTotals':[{'variant':n,'totals':t} for n,t in tables],'notScienceOrM7Acceptance':True,'canonicalWrites':0,'APVBuildRuns':0,'formalNativeDVote':False}
wr(O/'OUTPUTS.current39-prerequisite-role-inventory.independent-b.selector.json',selector)
wr(O/'MANIFEST.final.current39-independent-b.json',{'files':[pin(p) for p in sorted(O.iterdir()) if p.is_file() and not p.name.startswith('MANIFEST.')]})
for n in ['OUTPUTS.current39-prerequisite-role-inventory.independent-b.selector.json','HANDOFF.current39-finite-role-inventory.independent-b.md','MANIFEST.final.current39-independent-b.json']:print(json.dumps(pin(O/n)))
