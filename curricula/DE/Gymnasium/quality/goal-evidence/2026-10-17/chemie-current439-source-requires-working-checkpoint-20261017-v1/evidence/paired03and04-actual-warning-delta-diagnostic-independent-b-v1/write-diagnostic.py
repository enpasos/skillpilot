import json,hashlib,datetime,collections
from pathlib import Path
O=Path(__file__).parent
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,v):
 p=O/n
 if p.exists():raise RuntimeError('Existing immutable output: '+str(p))
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return pin(p)
j=json.load(open(O/'EXTRACT.actual-stock-warning-delta-and-whole-mapping-contexts.json'))
mappingcheck=json.load(open(O/'CHECK.v2.actual-mapping-files-unchanged-versus-baseline-APV-capsule.json'))
assert j['actualSummaryBefore']['warnings']==58 and j['actualSummaryAfter']['warnings']==86
assert len(j['rawIntroducedWarnings'])==29 and len(j['rawRemovedWarnings'])==1
assert mappingcheck['exactUnchanged']==44
contexts={r['goalId']:r for r in j['actualAffectedWholeContexts']}
rows=[]
for f in j['rawIntroducedWarnings']:
 r=contexts[f['goalId']];g=r['wholeAfterGoal'];ext=g.get('extendedData',{});annotations=ext.get('skillPilotAcquisitionExtensions',[])
 if f['code']=='APV-201':
  classification='EXPECTED_EXPLICIT_OWN_SCOPE_OVERRIDE_NOTICE_RETAINED'
  cause='Stock emits APV-201 whenever any supported explicit jurisdiction override is used, regardless of source completeness. The changed actual override values match concrete own-acquisition annotations; every such added jurisdiction has only override evidence, no new direct mapping/provenance evidence.'
  action='Retain warning and exact whole-goal scope annotation with paired scientific provenance. Preserve officialWholeSourceCredit=false, actual course/view boundaries and elective/source limitations. No new official whole-source credit, no warning waiver and no mapping-strength promotion. No content change is justified by this warning alone.'
 elif r['actualRemovedCompiledJurisdictions']:
  classification='REAL_HB_TARGET_SCOPE_GAP_RETAIN_HOLD' if f['goalId'].startswith('7f140') else 'REAL_HB_CHILD_UNION_CONTRACTION_SAME_HOLD'
  cause=('The only old HB evidence for7f was requires-closure from188. Removing188→7f removed that inherited HB applicability;7f now compiles BY only, although raw field and HB GK/LK placements retain HB.' if f['goalId'].startswith('7f140') else 'The cluster uses child-union. Its7f child lost HB and its other child6c9a remains BY, so5428 also loses HB. Direct mappings/provenance attached to a cluster are not independently used by the stock child-union branch. This is the same missing HB atomic path, not a second independent science failure.')
  action='Keep the concrete two HB7f target exclusions open. Await separately authorized independent whole-content/source-or-explicit-own-acquisition correction for7f; only then measure7f and5428 with exact new guards and actual stock projection. Do not restore the removed188 prerequisite, delete/demote the intended targets, invent a source mapping, add an automatic override or clear the mismatch by changing raw HB away.'
 elif f['goalId'].startswith('210669'):
  classification='EXPECTED_MEMORY_ORIGIN_PROPAGATION_RAW_FIELD_DIFFERENCE'
  cause='Unchanged Memory2106 derives its applicability from its actual M439 ordinary origincc5a. The cc5a own-scope addition propagates eight jurisdictions through memory-review-origin; raw Memoryapplicability remains HE. No card, selector, Memoryoverride or M vote was changed.'
  action='Keep APV-203 visible and bind the actual compiled context in later technical integration; preserve origincc5a memory_required/deck trace and same-view teacher roles. Continue only the already measured eight restored pairs/subset; do not claim a new full-M or learner-mastery pass.'
 elif f['goalId'].startswith('54bc6'):
  classification='EXPECTED_ORDINARY_TEACHER_REQUIRES_CLOSURE_RAW_FIELD_DIFFERENCE'
  cause='Existing ordinary dependents87d8 and61da require54bc. Their explicit BW own scopes add BW to54bc through two actual requires-closure evidence entries, with no independent54bc override. Its authored own BW teacher annotation corresponds to that path; raw field remains precompilation.'
  action='Preserve the necessary ordinary teacher and its actual BW target/support placement semantics; retain mismatch record. A future guarded applicability materialization is a technical serialization step only, not new official source coverage or new scientific approval.'
 elif f['goalId'].startswith(('c21d430b','e5941581')):
  classification='EXPECTED_CHILD_UNION_EXPANSION_RAW_FIELD_DIFFERENCE'
  cause=('Clusterc21d gains the same eight jurisdictions as its two explicit ordinary children2d16/cc5a.' if f['goalId'].startswith('c21d') else 'Clustere594 gains RP because its existing9812 child now has the explicit own RP scope; the report says one RP-visible child, not both mechanistic children.')+' Stock derives cluster applicability from visible-child union; the cluster raw field remains precompilation.'
  action='Retain APV-203 and child-specific evidence. Do not infer that every child or every cluster topic is officially required or acquired in that jurisdiction. No parent override or blanket child mapping is needed; future guarded materialization must preserve this child-union meaning.'
 else:
  classification='EXPECTED_EXPLICIT_OWN_SCOPE_EXPANSION_RAW_FIELD_DIFFERENCE'
  cause='The actual compiled jurisdiction set adds exactly the ordinary goal explicit own-scope override values; its stored raw applicability field is unchanged. This is a genuine raw/compiled mismatch caused by the proposed expansion, not an order-only difference or proof of missing official curriculum coverage.'
  action='Keep APV-203 and the explicit own-acquisition/source distinction visible. Later bind the measured compiled scope under guarded technical provenance if materialization is requested; do not silently refresh raw hashes or claim official source completeness. The diagnostic itself calls for no new content vote.'
 rows.append({'actualFinding':f,'technicalClassification':classification,'realCause':cause,'necessaryAction':action,'scopeHold':bool(r['actualRemovedCompiledJurisdictions']),'noWarningWaiver':True,'noNewScientificVote':True,'rawApplicability':g.get('applicability'),'actualBeforeCompiled':r['beforeReport']['compiledApplicability'],'actualAfterCompiled':r['afterReport']['compiledApplicability'],'addedCompiledJurisdictions':r['actualAddedCompiledJurisdictions'],'removedCompiledJurisdictions':r['actualRemovedCompiledJurisdictions'],'actualAfterEvidence':r['afterReport']['evidence'],'relevantOrdinaryScopeAnnotations':annotations})
removed=[]
for f in j['rawRemovedWarnings']:
 r=contexts[f['goalId']]
 removed.append({'actualFinding':f,'realCause':'9812 raw field already contains BY/RP. Old compiler produced BY only; the explicit own RP addition now produces BY/RP and removes this raw-field mismatch. APV-201 is newly emitted for the override. No raw field was rewritten, and no new RP source mapping was added.','necessaryAction':'Retain both before/after history and own RP/elective boundaries; disappearance of APV-203 does not establish official full-source credit.','rawApplicability':r['wholeAfterGoal'].get('applicability'),'actualBeforeCompiled':r['beforeReport']['compiledApplicability'],'actualAfterCompiled':r['afterReport']['compiledApplicability'],'newOfficialSourceCredit':False})
sourcechecks=[]
for r in j['actualAffectedWholeContexts']:
 g=r['wholeAfterGoal'];annotations=g.get('extendedData',{}).get('skillPilotAcquisitionExtensions',[]);ov=g.get('extendedData',{}).get('applicabilityOverrides',{}).get('jurisdiction',[])
 if ov:
  checks=[]
  for v in ov:
   evid=[e for e in r['afterReport']['evidence'] if e['value']==v]
   ann=[a for a in annotations if a.get('jurisdiction')==v]
   checks.append({'jurisdiction':v,'actualEvidenceKinds':sorted(set(e['kind'] for e in evid)),'noNewDirectMappingOrProvenance':not any(e['kind'] in ['mapping','provenance'] for e in evid),'annotationExists':len(ann)>0,'officialWholeSourceCreditExplicitlyFalse':len(ann)>0 and all(a.get('officialWholeSourceCredit') is False for a in ann),'courseProfiles':sorted({p for a in ann for p in a.get('courseProfiles',[])})})
  sourcechecks.append({'goalId':g['id'],'title':g['title'],'wholeGoalContextLocation':'EXTRACT.actual-stock-warning-delta-and-whole-mapping-contexts.json / actualAffectedWholeContexts','overrideValues':checks})
assert len(sourcechecks)==12
assert sum(len(x['overrideValues']) for x in sourcechecks)==46
assert all(y['actualEvidenceKinds']==['override'] and y['annotationExists'] and y['officialWholeSourceCreditExplicitlyFalse'] for x in sourcechecks for y in x['overrideValues'])
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
diag={'recordType':'Independent bounded technical warning-delta diagnosis; no science or author votes','atUTC':now,'machineOnly':True,'humanApproval':False,'newScientificVotes':0,'newFormalReviewRunIds':[],'scope':'Actual combined03/04 snapshot only; no package01/02/06/07 integration performed','inputPins':j['inputPins'],'extractedWholeContext':pin(O/'EXTRACT.actual-stock-warning-delta-and-whole-mapping-contexts.json'),'result':{'warningsBefore':58,'warningsAfter':86,'introduced':29,'removed':1,'retained':57,'introducedCodes':{'APV-201':12,'APV-203':17},'compilerErrorsBefore':0,'compilerErrorsAfter':0,'affectedWholeGoals':18,'newAPV203Expansions':15,'newAPV203Contractions':2,'explicitOverrideGoalCount':12,'explicitOverrideJurisdictionValues':46,'all46HaveOwnScopeAnnotationNoWholeOfficialCredit':True,'all46AddedJurisdictionsHaveOnlyOverrideEvidence':True,'noNewMappingFilesAmongInspected44':True,'orderOnlyRawMismatches':0,'warningsWaivedOrLowered':0,'newCompilerInvocationsByThisDiagnostic':0},'stockCodeInterpretation':[
 {'path':'app/scripts/applicabilityCompiler.ts','lines':'1150-1174','meaning':'APV-201 is unconditional warning when overrideValues is nonempty; override evidence adds jurisdiction.'},
 {'path':'app/scripts/applicabilityCompiler.ts','lines':'1388-1405','meaning':'APV-203 compares normalized committed applicability with compiled applicability using JSON serialization. It does not classify whether difference is expansion, contraction, scientifically justified, or official source coverage.'},
 {'path':'app/scripts/applicabilityCompiler.ts','lines':'1016-1045','meaning':'Cluster applicability comes from visible-child union and returns before atomic provenance/mapping collection.'},
 {'path':'app/scripts/applicabilityCompiler.ts','lines':'1177-1189 / 1232-1261 / 1357-1386','meaning':'Memory origin and ordinary requires-closure propagate applicability. Such propagation is visibility evidence, not source duty or prerequisite mastery.'}],
 'introducedWarningDiagnostics':rows,'removedWarningDiagnostics':removed,'actualOverrideSourceContextChecks':sourcechecks,
 'realOpenScopeIssue':{'goalId':'7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6','parentCluster':'542822de-cb96-56cf-a487-0fc3b5820f57','actualNewTargetExclusions':j['newlyExcludedTargetPairsFromMeasuredFrontend'],'underlyingIssueCount':1,'technicalHold':'KEEP existing HB target-scope HOLD.7f has no current compiled HB route after removal of188→7f;5428 reflects the same loss.','officialHBSourceCoverageVerdict':'not newly adjudicated here; absence of current HB mapping/evidence does not prove the original HB curriculum lacks the competence. Separate whole-content/source-or-own-extension review is already running.','noAutomaticRemediationApplied':True},
 'sourceCoverageBoundary':{'finding':'The12 APV-201 and15 expanding APV-203 are expected actual diagnostics of explicit own acquisition additions/propagation at this snapshot. They are retained and must remain traceable; they do not supply official whole-source credit. The two contracting APV-203 expose a concrete existing HB scope gap.','notFullOfficialCoverageApproval':True,'existingMappingStrengthsAndSourceCourseElectiveLimitsRemain':True,'newCoverageDefectsInferredSolelyFromWarningCount':False,'rawApplicabilityNotBlindlyRewritten':True,'originalPrimaryPDFReReviewPerformed':False,'reason':'This is technical diagnosis of already reviewed whole scope annotations and actual compiler evidence. It checks why warnings occur; it does not replace those independent scientific decisions.'},
 'mappingByteComparison':pin(O/'CHECK.v2.actual-mapping-files-unchanged-versus-baseline-APV-capsule.json'),'historyOfInitialComparison':{'path':str(O/'CHECK.actual-mapping-files-unchanged-versus-current-C20-capsule.json'),'meaning':'First lookup selected a P-only capsule with no mapping resources; no mapping-change conclusion was drawn from that missing comparison. Additive v2 uses actual baseline APV capsule and proves44/44 exact bytes unchanged.'},
 'necessaryNextActions':[
 'Retain all actual warnings and per-goal reasons, with exact paired science/scope provenance from existing accepted packages; this diagnostic adds no science vote.',
 'Finish the independent HB7f source/own-acquisition correction and then measure both7f target pairs and parent5428. No target deletion or wrong prerequisite restoration.',
 'For the12 overrides retain jurisdiction-specific own source/optional/course limits; for Memory/teacher/cluster propagation retain actual origin/dependency/child boundaries.',
 'Any future raw-applicability materialization and P/SEM/M/card source binding must use explicit whole guards and actual stable integrated bytes; removing APV-203 alone is not scientific or final-scope approval.',
 'Preserve the76 current exclusions, including74 old and2new at this snapshot. No final source/native/Central/fullM/APV/build/M7/human or learner-performance claim.'],
 'protectedFilesWritten':False,'outputDirectory':str(O)}
diagpin=write('DIAGNOSIS.actual29-warning-causes-actions-and-HB-HOLD.json',diag)
lines=['# Kombinierte Pakete03/04: technische Warnungsdiagnose','',
 '**58 alte − 1 entfallene + 29 neue = 86 Warnungen; 57 alte bleiben erhalten. Keine neue Compilation, keine neue fachliche Stimme, keine Warnung erlassen.**','',
 '| Gruppe | Anzahl | Tatsächliche Ursache und Konsequenz |','|---|---:|---|',
 '| APV-201 |12| Explizite Overrides auf12 gewöhnlichen Zielen, insgesamt46 Jurisdiktionswerte. Jeder dieser Werte hat tatsächlich nur Override-Evidenz und eine konkrete eigene Erwerbsannotation mit officialWholeSourceCredit=false. Erwartete Hinweise; sichtbare Quellen-/Kurs-/Wahlgrenzen behalten. |',
 '| APV-203, Erweiterung |15|11 gewöhnliche Override-Erweiterungen plus Lehrer54bc über requires-closure, Memory2106 über Origin cc5a und Cluster c21d/e594 über child-union. Das gespeicherte Rohfeld blieb vor der Compilation unverändert. Echter Roh-/Compilerunterschied, kein automatischer Quellenfehler und kein Quellenpass. |',
 '| APV-203, HB-Verengung |2|7f verliert HB; Obercluster5428 verliert HB als Folgewirkung. Das ist der reale separate HB-Scope-HOLD, keine harmlose Erweiterungswarnung. |',
 '| APV-203 entfernt |1|9812 war im Rohfeld bereits BY/RP, kompilierte vorher nur BY. Der explizite eigene RP-Scope stellt BY/RP her. Kein Rohfeld wurde zur Warnungsunterdrückung geändert; APV-201 bleibt neu. |','',
 '## Alle betroffenen Ziele','', '| Goal | Neue Codes | Compilerdelta | Ursache / nötige Aktion |','|---|---|---|---|']
for r in j['actualAffectedWholeContexts']:
 codes=', '.join(r['newWarningCodes']);added=','.join(r['actualAddedCompiledJurisdictions']);removedj=','.join(r['actualRemovedCompiledJurisdictions']);delta= ('+'+added if added else '')+(' −'+removedj if removedj else '')
 rr=[x for x in rows if x['actualFinding']['goalId']==r['goalId']]
 causes='; '.join(dict.fromkeys(x['technicalClassification'] for x in rr))
 lines.append('| '+r['goalId'][:8]+' '+r['title']+' | '+codes+' | '+delta+' | '+causes+'; genaue Ursache/Aktion im JSON. |')
lines += ['', '## Konkreter HB-HOLD','',
 'Vorher hatte7f die einzige HB-Evidenz `requires-closure: required by188bd684`. Nach Entfernen der fachlich korrigierten Kante188→7f bleibt BY aus den bestehenden partiellen Mappings und der anderen BY-Anforderung6c9a.7f ist weiterhin als HB-GK/LK-Target platziert, wird aber jetzt in beiden Sichten ausgeschlossen. Der Obercluster5428 vereinigt nur seine sichtbaren Kinder und verliert daher ebenfalls HB. Das sind zwei Warnungen zu einem zugrunde liegenden offenen atomaren Erwerbsscope. Die ursprüngliche HB-Quelle wird hier fachlich weder verworfen noch neu gutgeschrieben. Die bereits laufende unabhängige7f-Korrektur muss konkret abgeschlossen und anschließend technisch gemessen werden. Keine falsche Kante zurücksetzen, keine Targets löschen und keinen automatischen Override setzen.','',
 '## Quellen- und Mappinggrenze','',
 'Die18 ganzen betroffenen Vorher-/Nachherziele, alle tatsächlichen Evidenceketten und relevanten vollständigen Mappingeinträge sind im separaten Extrakt gepinnt. Die44 berührten Mappingdateien stimmen bytegenau mit der tatsächlichen Baseline-APV-Capsule überein. Es wurden keine neuen amtlichen Quellbezüge erzeugt. Alle46 neuen direkten Jurisdiktionsevidenzen heißen tatsächlich ausschließlich override. Die gewöhnlichen Annotationen deklarieren eigene Erwerbserweiterung und keinen Vollquellenkredit; allgemeine oder partielle Alt-Mappings werden dadurch nicht stärker. Die vollständigen Original-PDFs werden für diese reine Diagnose nicht nochmals fachlich freigegeben.','',
 'Insbesondere sind courseProfiles/viewIds in den eigenen Annotationen keine zusätzliche vom Jurisdictioncompiler implementierte Kursdimension. Aktuelle Projektionsmessung und geprüfte Wholeviews bleiben maßgeblich. RP-/SH-/SN-Wahlstatus, BW-Kursgrenzen und die übrigen benannten Originalquellengrenzen werden durch eine Compilerwarnung weder ersetzt noch aufgehoben.','',
 '## Nächste Aktionen','']
for x in diag['necessaryNextActions']:lines.append('- '+x)
lines += ['', '## Unveränderliche Pins','']
for p in j['inputPins']:lines.append('- `'+p['sha256']+'` — '+p['path'])
lines += ['', 'Die erste Dateivergleichsdiagnose hatte versehentlich die kleine P-Capsule als Mappingbasis gewählt; sie hatte dort keine Ressourcen und ist unverändert als fehlgeschlagene Vergleichshistorie erhalten. Der additive Vergleich gegen die tatsächliche Baseline-APV-Capsule belegt44/44 unveränderte Mappingbytes. Keine dieser Diagnosen schreibt einen Bestand um.','']
report=O/'REPORT.warning-delta-causes-and-actions.md';assert not report.exists();report.write_text('\n'.join(lines))
seal=write('SEAL.technical-diagnostic.sha256.json',{'role':'Immutable additive technical warning diagnosis, no scientific approval','sealedAt':now,'inputPins':j['inputPins'],'files':[diagpin,pin(report),pin(O/'EXTRACT.actual-stock-warning-delta-and-whole-mapping-contexts.json'),pin(O/'CHECK.actual-mapping-files-unchanged-versus-current-C20-capsule.json'),pin(O/'CHECK.v2.actual-mapping-files-unchanged-versus-baseline-APV-capsule.json'),pin(O/'extract-actual-warning-contexts.py'),pin(O/'write-diagnostic.py')],'newCompilerInvocations':0,'newScientificVotes':0,'warningsWaived':False,'HBscopeHOLDRetained':True,'normalWrites':False})
selector=write('SELECTOR.technical-warning-diagnostic.json',{'diagnosis':diagpin,'report':pin(report),'seal':seal,'scope':'Combined03/04 actual snapshot warning delta only','conclusion':'12 expected explicit override notices +15 expanding raw/compiled diagnostics;2 contracting HB diagnostics retain concrete same underlying scope HOLD;1 mismatch removed without raw rewrite','scientificVotes':0,'noFuturePackagesIntegrated':True})
print(json.dumps({'diagnosis':diagpin,'report':pin(report),'seal':seal,'selector':selector},ensure_ascii=False,indent=2))
