from pathlib import Path
import json,hashlib,importlib.util,shutil,jsonschema
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-thirty-existing-foreign-KEEP-E7-global-access-bindings-author-v1/actual-schema-field-name-native-author-successor-v2';read=lambda p:json.loads(p.read_text())
def fp(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def wr(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
ix=read(O/'actual-current518-thirty-accesses-six-views-full-closure-fieldwise-author.index.json');b=read(O/'before-current518-without30-additional-accesses.actual-native.json');a=read(O/'after-current518-only30-existing-whole-material-accesses.actual-native.json');n=read(O/'negative-BEGK-trade-access-drop.actual-native.json');assert len(b['allScopeRows'])==len(a['allScopeRows'])==64
for x,y in zip(b['allScopeRows'],a['allScopeRows']):
 assert all(x[k]==y[k]for k in ['viewPath','jurisdiction','scopeFilters','ordinaryTargetIds']);
 newpractice=set(y['actualTerminalIds'])-set(x['actualTerminalIds'])
 for k in ['visibleAllAtomicIds','visibleTargetAtomicIds']:assert set(x[k])==set(y[k])-newpractice
 assert not y['wholeMaterialCoverageBindingIssues']and not y['wholeMaterialPrerequisiteClosureIssues']
assert b['sourceRule']==a['sourceRule']==n['sourceRule'];assert b['compilerSummary']==a['compilerSummary']==n['compilerSummary'];assert a['compilerSummary']['errors']==a['compilerSummary']['warnings']==0
checks=[]
for row in ix['wholeChanged6']:
 d=read(R/row['before']['path']);e=read(R/row['after']['path']);assert all(d[k]==e[k]for k in d if k not in ['viewId','rootNodes']);assert len(d['rootNodes'])==len(e['rootNodes'])==1;assert all(d['rootNodes'][0][k]==e['rootNodes'][0][k]for k in d['rootNodes'][0]if k!='children');assert e['rootNodes'][0]['children']==d['rootNodes'][0]['children']+row['appendReferences'];errs=list(jsonschema.Draft202012Validator(read(R/'contracts/curriculum-package/v1/composition-view.schema.json')).iter_errors(e));assert not errs;checks.append({'input':row['after'],'closedSchemaErrors':0})
rule=lambda d:next(r for r in d['nativeRules']if r['id']=='CQR-104');assert rule(b)['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute']==2044;assert rule(a)['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute']==2036;assert rule(n)['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute']==2040
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-local-E-whole-science-independent-b-v1/one-real-responsibility-whole-performance-independent-followup-v2/actual-final-E7-seven-whole-science-independent-b-KEEP.handoff.receipt.json';G=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-globalisation-whole-science-independent-root-v1/actual-final-seven-globalisation-whole-science-independent-root-KEEP.handoff.receipt.json';assert E.exists()and G.exists()
for path in ['/tmp/economics-30-qualified-access-author-v2.py','/tmp/economics-30-qualified-access-seal.py','/tmp/skillpilot-economics-macro12-current504-wxkcpkyv/native-macro12-current504-intake.ts']:
 q=O/'technical-reproduction'/Path(path).name;q.parent.mkdir(exist_ok=True);shutil.copyfile(path,q)
(O/'technical-reproduction/actual-run-argv.raw.txt').write_text('\n'.join(' '.join(c['argv'])for c in ix['nativeCommands'])+'\n')
sp=importlib.util.spec_from_file_location('schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod);assert not mod.curriculum_symlink_errors(str(R))
proof=wr('actual-three-native-frames-six-closed-schemas-64-whole-ordinary-source-memory-preservation.author-proof.json',{'authorPendingIndependentScopeReview':True,'closedSchemas6':checks,'all64OriginalOrdinary6974SupportMemoryExactlyRetained':True,'wholeCAN518SEM518P336685Unchanged':True,'nativeCompiler':a['compilerSummary'],'wholeSourceRule':a['sourceRule'],'before':rule(b),'after':rule(a),'negativeBEGKOnlyOneWholeTradeAccessRemoved':rule(n),'noUnreviewedBodyScienceClaims':True,'sourceAtomicAndMappingRowsUnchanged':True,'firstSetupFailure':'Incorrect guessed semanticLedgerPath key; actual semanticKindLedgerPath used in additive V2 before real native runs.','activeWrites':0})
files=[]
for p in sorted(O.rglob('*')):
 if p.is_file():
  assert not p.is_symlink()
  if p.suffix=='.json':assert p.read_bytes().endswith(b'\n');json.loads(p.read_text())
  if p.suffix=='.jsonl':assert p.read_bytes().endswith(b'\n');[json.loads(l)for l in p.read_text().splitlines()if l.strip()]
  files.append(fp(p))
manifest=wr('actual-thirty-existing-whole-material-accesses-portable-author-freeze.manifest.json',{'files':files,'wholeJSONLFParse':True,'curriculumSymlinkErrors':0,'activeWrites':0})
h=wr('actual-final-thirty-existing-foreign-KEEP-material-accesses-six-current518-views.author-handoff.json',{'role':'INERT_AUTHOR_CANDIDATE_PENDING_FOREIGN_SCOPE_REVIEW','manifest':fp(manifest),'index':fp(O/'actual-current518-thirty-accesses-six-views-full-closure-fieldwise-author.index.json'),'proof':fp(proof),'wholeForeignE7Science':fp(E),'wholeForeignGlob7Science':fp(G),'candidateChanges':'Only6viewId and30practice goalEntry targets appended to existingRootchildren. No ordinary target/support/memory/Goal/P/SEM/source/Registry change.','actualNative':'64 scopes/6974 ordinary exact; Source16/2134/unsupported0/reverse0 exact; Compiler5180/0; complete material covered/prerequisite closure and stage0; missingExpected scopes16->13; local2044/175->2036/175; own BE-GK one-access deletion2036->2040.','integrationFieldsOnly':['append30 whole refs to current exact6 views; preserve existing child prefixes','viewId6 metadata only'],'actualAuthorOnlyNoWholeM4M6OrHumanApproval':True,'strictGain':0,'activeWrites':0})
print(json.dumps({'handoff':fp(h),'manifest':fp(manifest),'index':fp(O/'actual-current518-thirty-accesses-six-views-full-closure-fieldwise-author.index.json')},ensure_ascii=False))
