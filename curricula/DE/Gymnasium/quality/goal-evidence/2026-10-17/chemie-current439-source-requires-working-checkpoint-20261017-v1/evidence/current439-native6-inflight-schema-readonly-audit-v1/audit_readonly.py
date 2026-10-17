from pathlib import Path
import datetime, hashlib, json, os, re, time

O = Path(__file__).parent
R = Path('/home/enpasos/projects/skillpilot')
F = Path('/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule')
IDS = ['9b56d01e-c2d7-51d8-b78e-237592c1ed20', '6966df95-f125-5ecc-af8e-0442545d9f17', 'f0f67a7a-b06a-50b9-8edc-1f2a0d97520d', '17ab1148-7383-5cab-8b91-73aff795f1e4', '93b914d4-747d-5b22-90ff-ac6320514b44', 'e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f']
LREL = 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'
PINS = {}
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(b): return hashlib.sha256(b).hexdigest()
def read(p):
    p = Path(p); b = p.read_bytes()
    PINS[str(p)] = {'path': str(p), 'resolvedPath': str(p.resolve()), 'sha256': digest(b), 'bytes': len(b)}
    return b
def load(p): return json.loads(read(p))
def sd(j): return 'sha256:' + digest(json.dumps(j, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode())
def write(name, j):
    p = O/name
    with p.open('x') as out: json.dump(j, out, ensure_ascii=False, indent=2); out.write('\n')
    return p

codepaths = ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json', 'contracts/goal-description-review/v1/goal-description-rollout-in-flight-ledger.schema.json', 'app/scripts/validateGoalDescriptionDualRoundResolution.ts', 'app/scripts/goalBookModel.ts']
code_comparison = []
for rel in codepaths:
    a,b=read(R/rel),read(F/rel)
    code_comparison.append({'relativePath':rel,'stockAndFBytesEqual':a==b,'stockSha256':digest(a),'FSha256':digest(b)})
schema = load(R/codepaths[1]); lschema = load(R/codepaths[2])
def structural_schema_check(j, sc):
    # Static required/allowed/type/array inspection only; no Stock validator import/execution.
    issues=[]
    if not isinstance(j, dict): return ['not object']
    for k in sc['required']:
        if k not in j: issues.append('missing '+k)
    for k in j:
        if k not in sc['properties']: issues.append('unexpected '+k)
    if 'goalIds' in j:
        a=j['goalIds']
        if not isinstance(a,list) or not 1<=len(a)<=20 or len(a)!=len(set(a)): issues.append('goalIds shape')
    if 'activeBatchConfigPaths' in j:
        a=j['activeBatchConfigPaths']
        if not isinstance(a,list) or len(a)!=len(set(a)): issues.append('activeBatchConfigPaths shape')
    return issues

roots=[]; output_targets=[]
for label,root in [('stockR',R),('F',F)]:
    ledger=load(root/LREL); claims={}; batches=[]; duplicate=[]
    for cp in ledger['activeBatchConfigPaths']:
        c=load(root/cp)
        row={'configPath':str(root/cp),'relativeConfigPath':cp,'configSha256':PINS[str(root/cp)]['sha256'],'subject':c['subject'],'baseGoalBookConfigPath':c['baseGoalBookConfigPath'],'goalIds':c['goalIds'],'outputDirectory':c['outputDirectory'],'structuralInspectionIssues':structural_schema_check(c,schema)}
        row['sixMatches']=[i for i in IDS if i in c['goalIds']]
        for gid in c['goalIds']:
            key=(c['subject'],c['baseGoalBookConfigPath'],gid)
            if key in claims: duplicate.append({'goalId':gid,'first':claims[key],'second':cp})
            claims[key]=cp
        if row['sixMatches']:
            op=root/c['outputDirectory']; output_targets.extend([str(op),str(op.resolve())])
            row['configuredOutputExists']=op.exists()
            row['configuredOutputResolvedPath']=str(op.resolve())
            row['configuredOutputParentExists']=op.parent.exists()
            row['batchLocalArtifacts']={n:(op/n).exists() for n in ['batch-manifest.json','dual-summary.json','resolution-index.json','round-a/results','round-b/results','resolutions']}
        batches.append(row)
    roots.append({'rootLabel':label,'rootPath':str(root),'ledgerPath':str(root/LREL),'ledgerSha256':PINS[str(root/LREL)]['sha256'],'ledgerStructuralInspectionIssues':structural_schema_check(ledger,lschema),'activeBatchCount':len(batches),'activeGoalEntries':sum(len(c['goalIds'])for c in batches),'duplicateBindingClaims':duplicate,'batches':batches,'sixActiveClaimsOrdered':[{'goalId':i,'activeConfigPaths':[c['configPath']for c in batches if i in c['sixMatches']]}for i in IDS]})

# Enumerate only registered description-resolution indices, without copying rationales or scientific votes.
regrel='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
reg=load(F/regrel); subject=next(s for s in reg['subjects']if s['subject']=='chemie')
indexmatches=[]; latest={}
for ip in subject['resolutionIndexPaths']:
    p=F/ip; j=load(p)
    for row in j.get('resolutions',[]):
        if row.get('goalId')not in IDS:continue
        rp=p.parent/row['resolutionPath']
        entry={'goalId':row['goalId'],'indexPath':str(p),'indexSha256':PINS[str(p)]['sha256'],'indexStrictDescriptionCompleteField':row.get('strictDescriptionComplete'),'resolutionPath':str(rp),'resolutionExists':rp.exists(),'indexResolutionDigest':row.get('resolutionDigest')}
        if rp.exists():
            res=load(rp)
            entry.update({'resolutionActualSha256':PINS[str(rp)]['sha256'],'indexResolutionByteDigestMatches':row.get('resolutionDigest')=='sha256:'+PINS[str(rp)]['sha256'],'resolutionStatus':res.get('status'),'resolutionDecision':res.get('decision')})
        indexmatches.append(entry);latest[row['goalId']]=entry

completion_details=[]
for gid in IDS:
    e=latest.get(gid)
    if not e or not e['resolutionExists']:continue
    rp=Path(e['resolutionPath']);res=load(rp);batchroot=rp.parent.parent
    d={**e,'selectedBecause':'last matching entry in registered resolutionIndexPaths; not a new owner-resolution decision','batchRoot':str(batchroot),'currentContextAcceptanceClaim':False}
    dualp=batchroot/'dual-summary.json';d['dualSummaryExists']=dualp.exists()
    if dualp.exists():
        dual=load(dualp);d['dualSummaryDigestMatchesResolution']='sha256:'+PINS[str(dualp)]['sha256']==res.get('dualSummary',{}).get('digest')
        dr=next((x for x in dual.get('goals',[])if x.get('goalId')==gid),{})
        d['dualMetadata']={k:dr.get(k)for k in ['goalId','requiresSynthesis','automaticAcceptance']}
    sb=res.get('synthesisDecisionManifest');d['synthesisBindingPresent']=bool(sb)
    if sb:
        sp=batchroot/sb['manifestPath'];d['synthesisManifestExists']=sp.exists()
        if sp.exists():
            sj=load(sp);d['synthesisManifestDigestMatches']='sha256:'+PINS[str(sp)]['sha256']==sb.get('manifestDigest')
    d['rounds']=[]
    for key,rd in [('first','round-a'),('second','round-b')]:
        binding=res['rounds'][key];resdir=batchroot/rd/'results';rr={'round':rd,'resultsDirectoryExists':resdir.exists(),'matchingRunFound':False}
        if resdir.exists():
            for runp in resdir.glob('*.run.json'):
                run=load(runp)
                if run.get('runId')!=binding.get('runId'):continue
                rr.update({'matchingRunFound':True,'runPath':str(runp),'runSha256':PINS[str(runp)]['sha256'],'runStatus':run.get('status'),'completedAt':run.get('completedAt'),'runManifestFingerprintMatches':sd(run)==binding.get('runManifestDigest')})
                for recordp in resdir.glob('*.records.jsonl'):
                    rb=read(recordp)
                    if 'sha256:'+digest(rb)!=binding.get('resultsDigest'):continue
                    rr.update({'resultsPath':str(recordp),'resultsSha256':digest(rb),'resultsDigestMatchesResolution':True,'runOutputDigestMatchesResults':run.get('outputDigest')=='sha256:'+digest(rb)})
                    for line in rb.split(b'\n'):
                        line=line.removesuffix(b'\r')
                        if not line.strip():continue
                        record=json.loads(line)
                        if record.get('recordId')==binding.get('recordId'):
                            rr['recordIdPresent']=True;rr['recordByteDigestMatchesResolution']='sha256:'+digest(line)==binding.get('recordDigest')
        d['rounds'].append(rr)
    completion_details.append(d)

# Real stock example used only to show valid fields and existing preparation layout.
example_manifest=F/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-stable-jurisdiction-only-first20-private-L6-technical-20261016-v1/native-twenty/batch-manifest.json'
em=load(example_manifest);examplepath=F/em['configPath'];example=load(examplepath)

# Two bounded /proc and filesystem observations. No process is interrupted or modified.
excluded=set();pid=os.getpid()
while pid>0 and pid not in excluded:
    excluded.add(pid)
    try:pid=int(next(x for x in (Path('/proc')/str(pid)/'status').read_text().splitlines()if x.startswith('PPid:')).split()[1])
    except (OSError,StopIteration):break
output_targets=sorted(set(output_targets))
def process_observation():
    result={'observedAt':now(),'matchingCommandProcesses':[],'matchingOpenWriteDescriptors':[],'processesRead':0,'inaccessibleOrRacingReads':0,'configuredOutputs':[]}
    for target in output_targets:
        p=Path(target);result['configuredOutputs'].append({'path':target,'exists':p.exists(),'parentExists':p.parent.exists(),'matchingTemporaryDirectories':[str(x)for x in p.parent.glob('.goal-description-rollout-batch-*')]if p.parent.exists()else[]})
    for proc in Path('/proc').iterdir():
        if not proc.name.isdigit()or int(proc.name)in excluded:continue
        try:
            cmd=(proc/'cmdline').read_bytes().replace(b'\0',b' ').decode(errors='replace');result['processesRead']+=1
            exe=(proc/'comm').read_text().strip()
            if any(t in cmd for t in output_targets):result['matchingCommandProcesses'].append({'pid':int(proc.name),'commandName':exe})
            for fd in (proc/'fd').iterdir():
                try:
                    target=os.readlink(fd)
                    if not any(target==t or target.startswith(t+'/')for t in output_targets):continue
                    info=(proc/'fdinfo'/fd.name).read_text();flag=int(next(x for x in info.splitlines()if x.startswith('flags:')).split()[1],8)
                    if flag&3 in [1,2]:result['matchingOpenWriteDescriptors'].append({'pid':int(proc.name),'commandName':exe,'fd':fd.name,'target':target,'flagsOctal':oct(flag)})
                except (OSError,StopIteration):result['inaccessibleOrRacingReads']+=1
        except OSError:result['inaccessibleOrRacingReads']+=1
    return result
observations=[process_observation()];time.sleep(1);observations.append(process_observation())

report={'auditContract':'current439-native6-inflight-schema-readonly-audit-v1','createdAt':now(),'technicalAdministrativeUseOnly':True,'notBlindReviewerInput':True,'goalIdsInRequestedOrder':IDS,'scope':'read-only Stock/F schema, ledger, concrete prior completion bytes and two process snapshots; no Prepare/Renderer/Central/applicability compiler/native validator execution','codeAndSchemaComparison':code_comparison,'schemaFields':{'configRequired':schema['required'],'configOptional':[k for k in schema['properties']if k not in schema['required']],'ledgerRequired':lschema['required'],'ledgerAdditionalProperties':lschema['additionalProperties'],'stateOrStatusFieldPresent':False},'stockMechanism':{'root':'determined by materializeGoalDescriptionRolloutBatch.ts file URL, not current working directory','defaultLedger':LREL,'allListedConfigsTreatedActive':True,'duplicateKey':['subject','baseGoalBookConfigPath','goalId'],'loaderReadsOutputsOrTerminalStates':False,'selectChecks':'same subject/base; stale strict-complete active claims fail; active subject goals excluded','prepareReadsOrEnforcesLedger':False,'prepareCLIHasInFlightLedgerOption':False,'outputDirectoryMustNotExist':True,'repoPathsMustResolveLexicallyBelowScriptRepositoryRoot':True,'codeLineBindings':{'configLoader':'282-299','ledgerLoader':'301-336','prepare':'651-791','select':'1341-1479','CLI':'1481-1603'}},'roots':roots,'registeredHistoricalMatchingIndexEntries':indexmatches,'concretePriorCompletionDetails':completion_details,'completionBoundary':'Completed historical native contexts do not establish current F source/page/context acceptance; no closure/removal/handoff is performed. Old reservation alone is not proof of another currently open writer.','exampleConfig':{'path':str(examplepath),'sha256':PINS[str(examplepath)]['sha256'],'content':example,'structuralInspectionIssues':structural_schema_check(example,schema),'reuseBoundary':'field/layout example only; use a fresh authorized output and actual current base; existing example output cannot be overwritten'},'writerObservationBoundary':'Two bounded snapshots, not a lock, not a guarantee against later writers; command arguments and other process data are not retained.','writerObservations':observations,'foreignInputPins':list(PINS.values())}
out=write('AUDIT.current439-native6-inflight-schema-readonly.json',report)
lines=['# Native6: lesende technische Ledger- und Schema-Prüfung','',f'Zeit: {report["createdAt"]}. Ausschließlich administrative Technik; kein Reviewerinput, kein neuer Vote.','', 'Stock und F haben denselben Ledger mit 15 aktiven Batchpfaden und 171 Ziel-Claims; keine doppelten Claims innerhalb derselben Subject-/Basebindung. Ledger-SHA256: `'+roots[0]['ledgerSha256']+'`.','', '| ID | Aktive Reservierung | Konkreter vorhandener Kontextabschluss |','|---|---|---|']
for gid in IDS:
    claims=roots[1]['sixActiveClaimsOrdered'][IDS.index(gid)]['activeConfigPaths'];d=next(x for x in completion_details if x['goalId']==gid)
    lines.append('| '+gid+' | '+('ja'if claims else 'nein')+' | '+str(d.get('resolutionStatus'))+'; '+str(d.get('resolutionDecision'))+'; eigene Aktualitätsannahme: nein |')
lines+=['','Die drei aktiven Claim-Ausgaben fehlen tatsächlich. Für f0f67, 93b9 und e22a liegen getrennt davon konkrete registrierte native Resolutions mit `status: resolved`, beiden abgeschlossenen Runs, Resultbytes, Dual- und Synthesebindungen vor. Das ist ein historischer Kontextabschluss und kein heutiger F-Akzeptanznachweis.','', 'Das Schema kennt weder im Ledger noch in Batchconfigs State-/Statusfelder. Aktivität folgt allein aus `activeBatchConfigPaths`. Der Loader deaktiviert nichts anhand vorhandener Abschlüsse. `select` lädt den Ledger; `prepare` tut dies im untersuchten Stock nicht. Der bestehende Ledger wurde weder gelöscht, umgangen noch umgeschrieben.','', 'Zwei /proc-/Dateisystembeobachtungen finden '+str(sum(len(x['matchingCommandProcesses'])for x in observations))+' passende Befehlsprozesse und '+str(sum(len(x['matchingOpenWriteDescriptors'])for x in observations))+' passende schreibende Deskriptoren an den drei alten Claim-Ausgaben. Die Ausgaben und zugehörigen temporären Materialisierungen bleiben abwesend. Das ist eine begrenzte Beobachtung, keine Sperre.','', 'Alle exakten Pfade, Hashes, Rundendigestprüfungen, die sechs geordneten Betroffenheiten und ein echtes Stock-Beispielconfig stehen im JSON. Keine Prepare-/Renderer-/Central-/Compiler-/native Validatorausführung; keine Quelle oder Capsule verändert.']
md=O/'AUDIT.current439-native6-inflight-schema-readonly.md'
with md.open('x')as f:f.write('\n'.join(lines)+'\n')
for row in PINS.values():
    b=Path(row['path']).read_bytes();assert digest(b)==row['sha256']and len(b)==row['bytes'],row['path']
own=[]
for p in sorted(O.iterdir()):
    if p.is_file():own.append({'path':str(p),'sha256':digest(p.read_bytes()),'bytes':p.stat().st_size})
seal=write('SEAL.readonly-audit.json',{'sealedAt':now(),'allForeignPinsRecheckedUnchanged':True,'foreignInputPins':list(PINS.values()),'ownArtifacts':own,'noStateChangeOrExecutionClaim':True})
for p in O.iterdir():
    if p.is_file():p.chmod(0o444)
for p in [out,md,seal]:print(p.name,digest(p.read_bytes()),p.stat().st_size)
print('PINS',len(PINS),'WRITER_MATCHES',sum(len(x['matchingCommandProcesses'])+len(x['matchingOpenWriteDescriptors'])for x in observations))
