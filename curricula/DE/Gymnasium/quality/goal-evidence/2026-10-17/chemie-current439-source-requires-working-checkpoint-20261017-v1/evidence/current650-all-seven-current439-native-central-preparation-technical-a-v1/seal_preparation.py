from pathlib import Path
import os,json,hashlib,datetime,subprocess

O=Path(__file__).parent; C=O/'capsule'; R=Path('/home/enpasos/projects/skillpilot')
H=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
    p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':H(b),'bytes':len(b)}
def write(n,x):
    p=O/n
    with p.open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
    return pin(p)
def checkpin(p):
    got=pin(p['path']);assert got['sha256']==p['sha256'] and got['bytes']==p['bytes'],p['path']

completed=json.loads((O/'EXECUTION.exactly-one-full439-model.completed.json').read_text())
assert completed['exitCode']==0 and completed['modelInvocationCount']==1 and completed['exactCurrentCurricularAtomic439IDSet']
checkpin(completed['model'])
ready=json.loads((O/'PREPARATION.ready-for-exactly-one-model-run.json').read_text())
stage=json.loads((O/'MANIFEST.prepared-capsule-staged-inputs.json').read_text())
deps=json.loads((O/'DEPENDENCIES.exact105D75A-source-byte-pins.no-validation.json').read_text())
prep=json.loads((O/'CHECK.prepared439-P112-V-assets-M-input-differences-and-protected.json').read_text())
print('endguard: verify pinned old sources, staged bytecopies and2977 declared D/A dependencies',flush=True)
assert not deps['missing'] and deps['counts']['DIndices']==105 and deps['counts']['AConfigs']==75
assert len(prep['assetChecks'])==924 and all(a['matchesDeclared'] for a in prep['assetChecks'])
assert [h['id'] for h in prep['holds']]==['M-L6-VS-CURRENT-E-INPUT-DIFFERENCE']
for pp in stage['allPinnedReadInputs']:checkpin(pp)
for pp in stage['stagedFiles']:
    target=C/pp['relativePath'];b=target.read_bytes()
    assert H(b)==pp['sha256'] and len(b)==pp['bytes'],target
for pp in deps['files']:
    checkpin(pp['source']);target=C/pp['relativePath'];b=target.read_bytes()
    assert H(b)==pp['source']['sha256'] and len(b)==pp['source']['bytes'],target
for pp in prep['protectedCurrentRInputs']:
    checkpin(pp);rel=Path(pp['path']).relative_to(R);assert (C/rel).read_bytes()==Path(pp['path']).read_bytes(),rel

# Copy the current structural Central schema into an owned directory; no gate/report invocation.
schemaRel=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json')
target=C/schemaRel
assert not target.parent.is_symlink()
if target.is_symlink():target.unlink()
elif target.exists():
    assert target.read_bytes()==(R/schemaRel).read_bytes()
target.write_bytes((R/schemaRel).read_bytes())
assert target.read_bytes()==(R/schemaRel).read_bytes()
validator="""const fs=require('fs'); const Ajv=require('/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js');const ajv=new Ajv({allErrors:true,strict:true});const schema=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const validate=ajv.compile(schema);for(const p of process.argv.slice(2)){if(!validate(JSON.parse(fs.readFileSync(p,'utf8')))){console.error(p,JSON.stringify(validate.errors));process.exit(1)}}console.log('two central configuration JSON Schemas valid; no Central/gate invoked')"""
central=C/ready['centralConfigRelative'];main=C/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
cp=subprocess.run(['node','-e',validator,str(target),str(central),str(main)],text=True,capture_output=True,cwd=C)
assert cp.returncode==0,cp.stderr
print(cp.stdout.strip(),flush=True)
configValidation=write('CHECK.central-configs-current-stock-schema-only.no-gates.json',{'schema':pin(target),'sourceCurrentRSchema':pin(R/schemaRel),'configurations':[pin(central),pin(main)],'exitCode':cp.returncode,'stdout':cp.stdout,'stderr':cp.stderr,'CentralInvoked':False,'childGateChecksInvoked':False})

model=json.loads(Path(completed['model']['path']).read_text())
canon=json.loads((C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text());goalmap={g['id']:g for g in canon['goals']}
qa=json.loads((C/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json').read_text());qamap={g['goalId']:g for g in qa['records']}
fresh=[]
for pg in model['pages']:
    g=goalmap[pg['goalId']];q=qamap[pg['goalId']]
    primary=[r for r in g.get('resourceLinks',[]) if r.get('type')=='goal-visualization' and r.get('role')=='primary']
    fresh.append({'goalId':pg['goalId'],'titleExact':q['title']==g['title'],'descriptionExact':q['description']==g['description'],'primaryURLExact':len(primary)==1 and primary[0]['url']==q['imageUrl']})
freshIssues=[x for x in fresh if not(x['titleExact'] and x['descriptionExact'] and x['primaryURLExact'])]
if freshIssues:
    # Preserve the actual metadata limitation without changing old VQA or creating a V vote.
    prep['holds'].append({'id':'EXISTING-VQA-CURRENT-GOAL-METADATA-DIFFERENCE','status':'HOLD','issues':freshIssues,'VQAChanged':False})
endguard=write('CHECK.final-preparation-inputs-unchanged-and439-model-exact.json',{'role':'Final byte/presence/configuration-schema and model-scope check; no Science/Native/Central gate','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'oldSourcePinsReverified':len(stage['allPinnedReadInputs']),'stagedFilesReverified':len(stage['stagedFiles']),'declaredDADependenciesReverified':len(deps['files']),'D105Preserved':True,'A75Preserved':True,'P112DisjointWhole439Preserved':True,'QA462PublicAndCanonical924BytePinsExact':True,'QA439ExistingTitleDescriptionAndPrimaryURLComparison':fresh,'QA439MetadataDifferenceCount':len(freshIssues),'currentModel':completed['model'],'exactCurrent439IDSet':True,'actualModelInvocations':1,'configurationSchemaCheck':configValidation,'protectedCurrentRInputsExact':True,'holds':prep['holds'],'oldInputsMutated':False,'NativeInvocations':0,'CentralInvocations':0,'CompilerInvocations':0,'M7':False,'HumanApproval':False})

handoff={'role':'Prepared private full review capsule and exactly one actual current439 JSON model; no new scientific votes','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'ai_candidate','humanReviewStatus':'needs_human_review','decision':'PREPARED_CURRENT439_MODEL_AND_CENTRAL_CONFIG; EXISTING_M_INPUT_DIFFERENCE_EXPLICIT_HOLD','capsuleRoot':str(C),'model':completed['model'],'modelDigest':completed['modelDigest'],'actualStockModelInvocationCount':1,'actualModelExitCode':0,'actualModelPageCount':439,'actualModelDistinctIDCount':439,'exactCurrentCurricularAtomic439IDSet':True,'modelExecution':pin(O/'EXECUTION.exactly-one-full439-model.completed.json'),'baseConfig':pin(C/ready['goalBookConfigRelative']),'preparedCentralConfig':pin(central),'preparedDefaultRegistry':pin(main),'latestCanonical':pin(C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'latestP439':completed['exactWholeP439'],'latestSEM650':completed['semanticKindLedger'],'declaredDependencies':pin(O/'DEPENDENCIES.exact105D75A-source-byte-pins.no-validation.json'),'endguard':endguard,'existingMemoryWholeDifference':pin(O/'DIFF.existing-L6-M439-cards79-vs-current-E-M439-cards80.no-new-vote.json'),'sourceActualScopeReceiptVerification':pin(O/'VERIFY.final-source-R-stats-before-model.no-new-compiler.json'),'counts':{'DIndices':105,'AConfigs':75,'PNamespaceConfigs':112,'P439WholeRecords':439,'currentCurricularAtomic':439,'wholeCanonicalGoals':650,'SEMWholeDecisions':650,'chemistryViews':39,'currentWholeMRecords':439,'currentCardReviewRecords':80,'decks':7,'MemoryUnits':67,'MConfiguredLeafScope':506,'QARecords':462,'currentAtomicWithQA':439,'publicAndCanonicalAssetByteChecks':924,'DADependencyFiles':2977},'preservedDControlCounts':{'resolutionSupersessions':214,'resolutionWithdrawals':7,'semanticRetirements':3},'holds':prep['holds'],'preparationPathCorrection':{'initialPreModelPreparationStoppedOnConcreteMissingRRootPackageJSON':True,'resolution':'R has no root package.json; preserve exact existing private L6 stub. app/package.json and all scripts/src/contracts are byte-exact current R. Resumed existing owned E preparation; no model had started.','observationTimeoutRestart':False},'nextControlledStep':'Root may coordinate the prepared Central read/report and targeted current-context work. This handoff itself invokes neither. Existing full M/card difference requires its current gate/provenance check; no replacement vote was created.','privateAliasingBoundary':'Unchanged L6 subtrees remain exact read-only private aliases. Every staged mutation has physical owned ancestors/files. This is not a portable committable export; later export must materialize aliases. Every further write must use an owned successor/copy-on-write path.','generatedStatusBoundary':'Current R protected status/floor files are retained byte-exact as existing inputs; no current439 status/floor/CQR303 regeneration was performed.','modelPublicationBoundary':'Private review JSON only: no PDF/HTML publication, renderer, native assessment or learner performance.','noNewScienceOrMemoryVotes':True,'NativeInvocations':0,'CentralInvocations':0,'CompilerInvocations':0,'MainNormalL6L7OldCapsuleWrites':False,'M7':False,'HumanApproval':False,'HumanTrial':False,'hostAcceptance':False}
h=write('HANDOFF.actual-current439-model-and-prepared-full-capsule.json',handoff)
md='''# Private current439-Capsule vorbereitet

Ein Stock-Aufruf von `buildGoalBookModel.ts` mit `loadGoalBookBuildInputs` ist erfolgreich beendet: **439 Seiten, 439 verschiedene IDs, exakt das aktuelle curricularAtomic-Set**. Kein PDF, HTML-Render, Native-, Central- oder Compilerlauf wurde hier gestartet.

Die neue Capsule erhält650 ganze Ziele, aktuelle SEM650/P439 und39 Chemie-Views;105 D-Indizes und75 A-Konfigurationen mit2.977 gepinnten Originalabhängigkeiten sind vorhanden.112 aktuelle P-Konfigurationen behalten ihre eigenen ursprünglichen Kriterien und enthalten die439 ganzen Datensätze disjunkt und unverändert.214 Supersessions,7 Withdrawals und3 semantische Retirements bleiben erhalten. Alle924 public/canonical-Assetchecks zu462 vorhandenen QA-Zeilen stimmen bytegenau; alle439 aktuellen Atome besitzen QA-Einträge.

**Offen bleibt der konkrete Memory-Eingangsunterschied:** Gegen L6 unterscheiden sich zwölf vorhandene M-Zeilen (elf aktuelle Successor-/Referenzstände plus F03-Identitätsmetadaten) und fünf geänderte/zusätzliche Kartenreview-Zeilen; keine alte Kartenzeile fehlt. Gestaged sind unveränderte aktuelle E-Inputs439/80, sieben Decks,67 Memory-Units und Scope506 mit39 Views. Dies ist ein expliziter HOLD für die koordinierte aktuelle M-/Provenienzprüfung, kein neuer M-Vote und keine Fingerprint-Neuschreibung. Der vollständige Vergleich liegt separat bei.

Die neue einzelne Centralkonfiguration und der Default-Mehrfachregisterstand sind gegen das aktuelle Stock-Schema strukturell gültig. Nicht-Chemie-Subjektkonfigurationen, aktuelle R-Mathe-/Physik-/Biologie-Canonical-/QA-Grundlagen und geschützte Floorinputs bleiben bytegenau erhalten. Bestehende Statusdateien sind Kopien des vorhandenen R-Standes; ein aktueller439-CQR303-/Floorbericht wurde hier nicht generiert.

Unveränderte L6-Unterbäume sind für diese private Prüfung schreibgeschützte, exakt gepinnte Aliasse. Jede hier beschriebene Datei und jeder zu verändernde Vorfahr gehört physisch der neuen E-Capsule. Für portable Exporte sind später echte committable Dateien erforderlich; jede weitere Änderung verlangt einen eigenen Nachfolger beziehungsweise Copy-on-write. Main, L6, L7 und alte Capsules wurden nicht beschrieben.

Modellpfad, SHA, Zentral-/Basiskonfigurationspins, Ausführung und offene Grenzen stehen vollständig in `HANDOFF.actual-current439-model-and-prepared-full-capsule.json`. Die anschließende tatsächliche Central-/Native-/M-/V-/Quellenprüfung wird vom Root koordiniert. Kein neuer wissenschaftlicher Vote, keine M7-, Human- oder Hostabnahme.
'''
with (O/'HANDOFF.actual-current439-model-and-prepared-full-capsule.md').open('x') as f:f.write(md)
print('handoff written; seal owned files without following any L6 aliases',flush=True)
owned=[]
for dp,dirs,files in os.walk(O,followlinks=False):
    # os.walk does not descend into any old-capsule alias.
    for name in files:
        p=Path(dp)/name
        if p.is_symlink():continue
        if 'cache' in p.relative_to(O).parts:continue
        owned.append(pin(p))
seal=write('SEAL.prepared-current439-model-and-central-config.json',{'role':'Immutable technical preparation seal; no scientific/native/central approval','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'handoff':h,'currentModel':completed['model'],'preparedCentralConfig':pin(central),'allOwnedFilesBeforeSeal':owned,'oldInputPins':stage['allPinnedReadInputs'],'declaredDAInputPins':[p['source'] for p in deps['files']],'futureWritesRequireOwnedSuccessorOrCopyOnWrite':True,'privateThinAliasesNotPortableExport':True,'M7':False,'HumanApproval':False})
with (O/'SEAL.sha256').open('x') as f:f.write(seal['sha256']+'  SEAL.prepared-current439-model-and-central-config.json\n')
for row in owned:Path(row['path']).chmod(0o444)
(O/'SEAL.prepared-current439-model-and-central-config.json').chmod(0o444)
(O/'SEAL.sha256').chmod(0o444)
for n in ['HANDOFF.actual-current439-model-and-prepared-full-capsule.json','HANDOFF.actual-current439-model-and-prepared-full-capsule.md','CHECK.final-preparation-inputs-unchanged-and439-model-exact.json','SEAL.prepared-current439-model-and-central-config.json']:
    print(json.dumps(pin(O/n)),flush=True)
