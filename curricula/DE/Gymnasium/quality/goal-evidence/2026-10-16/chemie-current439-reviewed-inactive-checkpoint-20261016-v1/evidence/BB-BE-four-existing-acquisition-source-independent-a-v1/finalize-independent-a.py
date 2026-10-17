import json, pathlib, hashlib, datetime
R=pathlib.Path('/home/enpasos/projects/skillpilot')
O=pathlib.Path(__file__).parent
def read(p):return json.loads(pathlib.Path(p).read_text())
def pin(p):
 p=pathlib.Path(p);return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def put(n,v):
 p=O/n
 with p.open('x') as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
 return pin(p)
F=O/'FIRST.independent-a.source-role-science.before-stock.frozen.json'
C=O/'CHECK.independent-a.four-views.schema-stock-roles-source-status.actual.json'
first=read(F);check=read(C)
assert pin(F)==check['first']==read(O/'SEAL.FIRST.independent-a.json')['first']
for p in check['protectedPins']+first['actualSourceCollectionPins']+first['officialPrimaryDocuments']+first['wholeMaterialPins']+[first['currentPVector']]:assert pin(R/p['path'])==p,p
Pv={p['goalId']:p for p in map(json.loads,(R/first['currentPVector']['path']).read_text().splitlines())}
additionalIds=['8ceb1749-fce0-584f-a2b8-0a309282329a','64a5bb87-358d-5a22-958a-f66ba5521cd5','e74f5301-70d3-5869-bd3d-79a5763a1718','67cd332f-9db7-50e1-87f6-172ef3714300','92c99237-1c74-54fc-bf08-9191656afaa6']
addendum=put('ADDENDUM.independent-a.unchanged-residual-interface-HOLD-confirmation.after-finite-check.json',{
 'role':'Transparent post-check additional whole-profile reading; confirms retained scientific HOLDs without changing sealed FIRST or rerunning stock checks',
 'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'first':pin(F),'alreadyCompletedCheck':pin(C),
 'wholePRecordPins':[{'goalId':i,'profileFingerprint':Pv[i]['profileFingerprint'],'wholeRecordSha256':'sha256:'+hashlib.sha256(json.dumps(Pv[i],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()} for i in additionalIds],
 'observations':[
  {'scope':'e74','decision':'HOLD retained','reason':'Actual whole P case2 explicitly requires Hund/Pauli in 2p orbital boxes. Common Lewis/core-shell and the phrase Bohr-Sommerfeld do not by themselves establish this whole competence.'},
  {'scope':'235GK→67cd/92c','decision':'HOLD retained','reason':'Actual EPA cases supply H2O/CO2/NH3/CH4 Lewis structures; representation cases supply ethanol/ether/ethene connectivity. They need not independently construct nitrate/carbonate resonance as demanded by235. Full235 stays absent in GK and acquired only in LK.'},
  {'scope':'2be→8ceb','decision':'HOLD retained','reason':'Actual refinery P supplies crude mixture, column temperature gradient and oxygen-free cracking equations. It asks separation/conversion, balance and distribution limits; no reservoir/permeability/fracking/geopolitical argument is required.'},
  {'scope':'475/360/9fa→64a','decision':'HOLD retained','reason':'Actual64a P demands genuinely self-researched protein product declarations, function-normalised composition/price, sourced ecology/ethics and intention/counter-source assessment. It does not require a general complete food/nutrient/nutrition curriculum before this bounded operator.'},
  {'scope':'876→a76','decision':'HOLD retained','reason':'Original current energy material energy20-04-a/b, already read before FIRST, supplies full D-glucose Fischer card, hydrolysis ratio and fermentation/respiration model data. Whole carbohydrate cluster acquisition is not thereby made a universal entry requirement.'}
 ],'newRoleChanges':0,'newCanonicalEdges':0,'newPApprovals':0,'mechanicsRepeated':0,'M7Claim':False,'HumanApproval':False})
rows=[]
for s in check['scopes']:
 rows.append({'viewId':s['viewId'],'scope':s['scope'],'decision':'KEEP_FINITE_ADDITIVE_TARGET_ROLES_WITH_RETAINED_HOLDS','before':s['before'],'after':s['after'],'addedTargetCount':len(s['addedTargetGoalIds']),'addedByKind':s['addedByKind'],'schemaPASS':s['schemaPASS'],'stockRawCompileErrors':len(s['stockRawCompile']['errors']),'existingKindAwareDiagnosticErrors':len(s['kindAwareDiagnostic']['afterErrors']),'newKindAwareDiagnosticErrors':len(s['kindAwareDiagnostic']['newErrors']),'targetLosses':len(s['targetLosses']),'supportRolesExact':s['supportRolesExact'],'remainingOrdinaryDirectPrerequisiteEdges':len(s['gapsAfter']['ordinaryDirect']),'remainingOtherDirectPrerequisiteEdges':len(s['gapsAfter']['otherDirect']),'remainingTransitivePrerequisiteIds':len(s['gapsAfter']['transitive']),'newTransitiveMissingIds':len(s['newTransitiveMissing']),'missingCurrentMemoryReferenceOccurrences':len(s['missingCurrentMemoryReferences'])})
decision=put('DECISION.independent-a.final-four-view-source-acquisition.json',{
 'role':'Independent nonauthor source/acquisition-role review A; finite inactive whole-view CAS only',
 'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputSelector':first['inputSelector'],'selectedWholeViewCAS':first['selectedCAS'],'canonical':first['canonical'],'firstScience':pin(F),'finiteActualChecks':pin(C),'postCheckResidualConfirmation':addendum,
 'disposition':'KEEP the exact four additive target-role replacements, with the explicit residual HOLDs retained; no whole-source, whole-course, M6/M7 or runtime acceptance.',
 'fourOperations':rows,
 'dissent':{'mandatoryRevisionToSelectedCAS':[],'retainedScientificHOLDs':first['concreteVerdict']['HOLD'],'existingSourceStatus':'SekI collections retain68 mapped decisions each. Both SekII mappings remain author_candidate_pending_independent_review with204 mapped and1 pending decision each. Their embedded pipeline summaries still refer to203 historical rows while actual collections contain205; no status rewrite or source-lane acceptance is made here.','sourceCells':'All92 selected whole source rows, passages, mapping decisions and edges equal the actual L6 objects. They remain direct/partial/inherited evidence with their original scope, not a new source-union approval.','specificCourseAndChoiceLimits':'E topics remain selectable by school; LK-only SN and mesomeric acquisition stay LK-only. Technical all-authoredTopics target roles prove neither universal official duty nor an actual learner theme selection.','memory':'12 distinct current memory IDs remain absent across these scopes:12 occurrences in each GK and5 in each LK. GHS91e is actually course-filtered out of GK. No deck, origin, card, M-row or reference was rewritten or approved.'},
 'actualFiniteWork':{'schemaValidations':4,'stockRawFinalViewCompiles':4,'kindAwareBeforeAfterDiagnostics':8,'wholeSourceCellsVerified':92,'selectedRequiresNodes':80,'selectedRequiresAllKnown':True,'selectedRequiresAcyclic':True,'fullAPV':0,'globalM':0,'central':0,'builds':0,'nativeD':0,'fullBookRenders':0,'cardScienceReview':0},
 'preservation':{'sourceOperations':0,'canonicalOperations':0,'PChanges':0,'memoryOrCardChanges':0,'imageChanges':0,'L6Writes':0,'normalWrites':0,'applyPerformed':False},
 'claims':{'allRoutesClosed':False,'M7':False,'HumanApproval':False,'HumanTrial':False,'newSourceUnionApproval':False},
 'independence':'No memory, root journal, foreign independent reviewer files or peer judgments read. Parent supplied only the exact current author material path for the four handling/disposal cases.'})
readme='''# Unabhängige Quellen- und Rollenprüfung A

KEEP für den exakt gepinnten finalen inaktiven Vier-View-CAS. Die 55 unterschiedlichen ergänzten Zielrollen sind als begrenzter Erwerbspfad fachlich tragfähig. Sek-I-Grundlagen, gemeinsame GK/LK-Standards, auswählbare E-Themen und LK-Zusätze bleiben unterschieden. Beide kleinen `canonicalSubtree`-Referenzen wurden einschließlich ihrer Kinder geprüft.

Das eigene wissenschaftliche FIRST wurde vor den Stock-Prüfungen versiegelt. Die transparente spätere Zusatzlektüre bestätigt nur die unveränderten bestehenden Schnittstellen-HOLDs; sie ersetzt das FIRST nicht.

Tatsächlich ausgeführt: vier Schemas, vier rohe Stock-Finalcompiles ohne Fehler, acht zusätzliche kind-aware Vorher-/Nachherdiagnosen, Rollenbestand, 92 vollständige SourceRows/Passagen/Mappingcells/Edges gegen L6 und der relevante Requiresgraph mit 80 bekannten azyklischen Knoten. Je GK kommen 52 Targets hinzu, je LK32; keine Targetverluste, Supportänderungen oder neuen transitiven Lücken. Die alten kind-aware Diagnosen bleiben bei GK11/LK14.

Offen bleiben je GK7/LK6 transitive fachliche IDs, drei direkte breite Memory-Voraussetzungen je View und je GK12/LK5 fehlende aktuelle Memory-Verweisvorkommen. Die beiden Sek-II-Quellenmappings bleiben ausdrücklich Autorenkandidaten mit ausstehender unabhängiger Quellenentscheidung. Ein bestehender Pipeline-Zähler203 ist gegenüber tatsächlich205 SourceRows historisch; hier wurde nichts aktualisiert. Keine Gesamtquellenfreigabe, kein M7, keine menschliche Freigabe, kein Apply.

Reproduktion schreibt ausschließlich einen neuen eigenen Reportpfad, da der Checker bestehende Evidenz mit `wx` schützt:

`TSX_DISABLE_CACHE=1 ./app/node_modules/.bin/tsx tmp/chemie-m7-resumed-20261016/BB-BE-four-existing-acquisition-source-independent-a-v1/check-finite-independent-a.mts`
'''
with (O/'README.independent-a.md').open('x') as f:f.write(readme)
files=[p for p in O.iterdir() if p.is_file() and p.suffix in ['.json','.md','.py','.mts']]
for p in files:
 if p.suffix=='.json':read(p)
seal=put('SEAL.independent-a.final.json',{'role':'Finite own review files; no L6 or normal mutation','files':[pin(p) for p in sorted(files)],'selectedWholeViewCAS':first['selectedCAS'],'firstScience':pin(F),'allRoutesClosed':False,'M7Claim':False,'HumanApproval':False})
selector=put('OUTPUTS.independent-a.final.selector.json',{'role':'Independent A finite four-BB-BE-CrossStage source/acquisition judgment','selectedInputSelector':first['inputSelector'],'selectedWholeViewCAS':first['selectedCAS'],'canonical':first['canonical'],'decision':decision,'scienceFirst':pin(F),'actualFiniteChecks':pin(C),'additionalResidualReading':addendum,'seal':seal,'readme':pin(O/'README.independent-a.md'),'disposition':'KEEP_FINITE_ADDITIVE_TARGET_ROLES_WITH_RETAINED_HOLDS','allRoutesClosed':False,'M7Claim':False,'HumanApproval':False})
print(json.dumps({'selector':selector,'decision':decision,'first':pin(F),'checks':pin(C),'seal':seal},ensure_ascii=False))
