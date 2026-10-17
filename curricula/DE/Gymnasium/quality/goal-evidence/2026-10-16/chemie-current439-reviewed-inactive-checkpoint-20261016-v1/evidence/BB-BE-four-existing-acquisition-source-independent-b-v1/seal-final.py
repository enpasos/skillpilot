# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json, pathlib
R=pathlib.Path('/home/enpasos/projects/skillpilot')
O=R/'tmp/chemie-m7-resumed-20261016/BB-BE-four-existing-acquisition-source-independent-b-v1'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def put(n,v):
 p=O/n
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
 return pin(p)
first=read(O/'FIRST.independent-b.whole-source-scope-decisions.before-stock.frozen.json')
check=read(O/'CHECK.independent-b.four-readonly-schema-compile-roles-source-boundaries.json')
assert first['decisionCounts']=={'KEEP':54,'REVISE':0,'HOLD':1}
assert check['wholeCAS']['sha256']=='sha256:bf5613e8dfd15f315b8ae5714792810a7481b27ba35972834bbc7eae9ca97f4f'
for p in read(O/'SEAL.FIRST.independent-b.before-stock.json')['files']:assert pin(R/p['path'])==p
for p in check['protectedPins']:assert pin(R/p['path'])==p
summary=put('VERDICT.FINAL.independent-b.source-role-HOLD.json',{
 'role':'Independent non-author B review, limited to four existing BB/BE CrossStage Chemistry views',
 'reviewedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'overallDecision':'HOLD exact selected FINAL CAS for the open source-fit finding B-SOURCE-01. No application approval.',
 'scientificCounts':first['decisionCounts'],
 'finding':{
  'id':'B-SOURCE-01','goalId':'5c4788a7-6760-53dc-894e-e04bca6f8cd9',
  'title':'Gasverhalten mit dem kinetischen Teilchenmodell deuten',
  'fourScopes':['de-bb-gk','de-bb-lk','de-be-gk','de-be-lk'],
  'reasonDe':'Das vollständige unveränderte P fordert Wandstöße als Gasdruckursache, Erwärmung bei festem N,V und isotherme Kompression bei festem N,T. Die tatsächlich gelesenen amtlichen Stellen SekI S20/33/38, E S18 und Q S34 nennen allgemeine Modellkompetenz, Zustandswechsel, molare Gasvolumina beziehungsweise kinetische Energie und Aggregatzustand. Der zusätzliche volle Druck-/Volumenoperator ist dadurch noch nicht hinreichend als vorhandenes amtlich gestütztes Thema belegt.',
  'requiredNextStepDe':'Eine genaue amtliche Primärstelle oder eine explizite geprüfte Entscheidung über diese didaktische Erweiterung vorlegen; anderenfalls die neue Target-Ergänzung dieses Ziels im Folge-CAS auslassen. Keine versteckte prerequisiteOnly-Umstellung und keine Entwertung des fachlich korrekten bestehenden Ziels oder gültiger alter P-Wissenschaft.',
  'ownerPolicyDe':'Alle autorisierten Themen im passenden Scope gehören zum SkillPilot-Zielumfang. Diese Regel verändert weder den amtlichen Wahlpflichtstatus noch GK/LK-Spalten und ersetzt keinen fehlenden konkreten Quellenschritt.'},
 'evidenceBoundaryDe':'54 weitere unterschiedliche Ziele erhalten KEEP ausschließlich für die geprüfte Quellen-/Erwerbsrolle. E17 wahrt die schulspezifische Auswahl, Q26 die gemeinsamen Inhalte plus LK-Zusätze. Ganze SourceRows mit allen Mappingpartnern wurden gelesen; geerbte oder partielle Clustertraces, Applicability und requires wurden nicht als vollständiger Quellenbeweis gewertet. Die ganzen Q/R- und W-Fälle für 4b6/805 erhalten ihre lokalen synthetischen Regeln. Bestehende andere Autoren-HOLDs werden nicht geschlossen.',
 'actualChecks':check['actualChecks'],
 'fourViewResults':[{
  'viewId':r['viewId'],'schemaPASS':r['schemaValid'],
  'exact37RawCompileErrors':len(r['rawCanonicalCompile']['errors']),
  'separateCurrentRawCompileErrors':len(r['separateCurrentRawCanonicalCompile']['errors']),
  'currentCompileFindingsIdentical':r['separateCurrentRawCanonicalCompile']['findingsIdenticalToExact37Baseline'],
  'addedByKind':r['addedByKind'],'lostTargets':r['lostTargets'],
  'existingSupportRolesRetained':True,
  'kindAwareErrorsBefore':r['kindAugmentedDiagnostic']['beforeErrorCount'],
  'kindAwareErrorsAfter':r['kindAugmentedDiagnostic']['afterErrorCount'],
  'newKindAwareErrors':r['kindAugmentedDiagnostic']['newErrors'],
  'remainingTransitiveMissingIds':[x['goalId']for x in r['remainingTransitiveMissing']],
  'missingCurrentMemoryReferenceOccurrences':len(r['newlyTargetedOrdinaryMissingMemoryReferences'])
 }for r in check['fourScopes']],
 'canonicalDrift':check['canonicalBindingDrift'],
 'selectedRequiresGraph':check['selectedRequiresGraph'],
 'normalOrL6Writes':0,'newSourceMappingVotes':0,'newDPAMVReviews':0,
 'allRoutesClosed':False,'M7Claim':False,'HumanApproval':False,'HumanTrial':False
})
files=[pin(p)for p in sorted(O.iterdir())if p.is_file()]
seal=put('SEAL.FINAL.independent-b.files.json',{'role':'Final independent B immutable file manifest, excluding this seal and the following output selector','files':files,'sealedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'M7Claim':False,'HumanApproval':False})
selector=put('OUTPUTS.FINAL.BB-BE-four-existing-acquisition-source.INDEPENDENT-B.selector.json',{
 'role':'Sealed independent B finite source/role review, no application or M7 approval',
 'verdict':'HOLD exact FINAL CAS: B-SOURCE-01 remains open',
 'reviewedAuthorSelector':check['authorSelector'],
 'reviewedWholeCAS':check['wholeCAS'],
 'CASBoundOriginalCanonical':check['canonicalBindingDrift']['CASBoundCanonical'],
 'exactDigestMatched37SnapshotActuallyCompiled':check['exact37CanonicalSnapshot'],
 'separateCurrentPrivateCanonicalActuallyCompiled':check['currentPrivateCanonical'],
 'scientificFirst':pin(O/'FIRST.independent-b.whole-source-scope-decisions.before-stock.frozen.json'),
 'scientificFirstSeal':pin(O/'SEAL.FIRST.independent-b.before-stock.json'),
 'wholeExistingSourceCells':pin(O/'INPUT.whole-92-source-rows-and-mapping-cells.read-bound.json'),
 'actualReadonlyChecks':pin(O/'CHECK.independent-b.four-readonly-schema-compile-roles-source-boundaries.json'),
 'firstAbortedAttempt':pin(O/'RECEIPT.first-readonly-attempt-aborted-before-checks.json'),
 'finalVerdict':summary,'finalFileSeal':seal,
 'reviewedWholeAfterViews':[r['after']for r in check['fourScopes']],
 'scientificDecisionCounts':first['decisionCounts'],
 'actualChecks':check['actualChecks'],
 'authorHOLDsRemainOpen':True,'allRoutesClosed':False,'M7Claim':False,'HumanApproval':False,'normalOrL6Writes':0
})
receipt=put('SEAL.OUTPUT-SELECTOR.independent-b.json',{'role':'Final output selector digest receipt','selector':selector,'fileSeal':seal,'sealedUTC':datetime.datetime.now(datetime.timezone.utc).isoformat()})
print(json.dumps({'selector':selector,'selectorSeal':receipt,'verdict':summary,'scienceCounts':first['decisionCounts'],'wholeCAS':check['wholeCAS']},ensure_ascii=False))
