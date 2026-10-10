# SPDX-License-Identifier: Apache-2.0
"""Original AUTHOR: actual final normal execution, portable proof and neutral seal."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess, sys, time
sys.dont_write_bytecode=True
import jsonschema
R=Path(__file__).resolve().parents[8]
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-machine-content-native-readiness-author-20261010-v1')
C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule'
O=P.parent/'chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1'
SC=P.parent/'chemie-b008-five-assessments-sc01-sum-gate-author-successor-20261010-v1'
assert not (R/P/'author-current517.final.freeze.json').exists()
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def run(label,args):
 assert not (R/P/f'terminal/{label}.terminal.actual.json').exists()
 start=time.monotonic();at=datetime.datetime.now(datetime.timezone.utc).isoformat();cmd=[str(R/'app/node_modules/.bin/tsx'),*args];r=subprocess.run(cmd,cwd=C,capture_output=True,text=True)
 put(f'terminal/{label}.terminal.actual.json',{'schemaVersion':1,'argv':cmd,'cwdDiagnosticOnly':str(C),'startedAt':at,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'stdout':r.stdout,'stderr':r.stderr,'normalRulesChanges':0,'activeWrites':[],'independentApproval':False})
 print(label,r.returncode,r.stdout[-650:],r.stderr[-650:],flush=True);return r
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
cfgp=P/'source-atlas/final-current517-bounded378-normal.inputs.json';cfg=read(cfgp)
for mode in ['build','check']:
 args=['app/scripts/buildGoalBookSourceAtlasInputs.ts','--config',str(cfgp)]+(['--check']if mode=='check'else [])
 assert run('normal-final-current517-source-bounded378-'+mode,args).returncode==0
out=Path(cfg['manifestPath']).parent;dest=P/'source-atlas/final-generated-actual';shutil.copytree(C/out,R/dest)
mf=read(dest/'source-manifest.json');pm=json.loads(json.dumps(mf));pm['navigationViewPath']=str(dest/'navigation.view.json');pm['sourcePaths']=[str(dest/'source-views'/Path(s).name)for s in mf['sourcePaths']];put('source-atlas/portable-final-current517-bounded378.source-manifest.json',pm)
aliases=[]
for f in sorted((C/out).rglob('*')):
 if f.is_file():
  physical=dest/f.relative_to(C/out);assert (R/physical).read_bytes()==f.read_bytes();aliases.append({'normalBookLocalLogicalOutputPath':str(f.relative_to(C)),'portableFrozenArtifact':ref(physical)})
put('checks/final-normal-source-outputs-exact-portable-copy-aliases.json',{'schemaVersion':1,'normalGeneratorBookLocalRestrictionPreserved':True,'rawNormalOutputsExact':aliases,'portableManifest':ref(P/'source-atlas/portable-final-current517-bounded378.source-manifest.json'),'portableManifestOnlyPathSubstitutionNoScopeChanges':True})
central=run('normal-final-current517-central-readiness-pending-native-review',['app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(P/'registry/chemie-only-current517-normal-check.inactive.config.json'),'--mode=check','--format=json'])
assert central.returncode==1 and central.stdout.lstrip().startswith('{');put('checks/normal-final-current517-central-readiness.actual.report.json',json.loads(central.stdout))
wholep=P/'candidate/whole517.inactive.machine-content-final-learner-copy-author.json';whole=read(wholep);old=read(SC/'candidate/whole517.inactive.SC01-five-assessment-author-successor.json');by={g['id']:g for g in whole['goals']};ob={g['id']:g for g in old['goals']};ids=[g['id']for g in whole['goals']if 'examData'in g and g['id']in ['2f53dea4-1ea9-59ad-bd2d-0492107627ee','ab315f52-a9e3-5c1c-a404-7fb1a96a3eaf','7bfe515c-e59f-521c-9781-b75e33caf0ec','b406eff8-3cd9-551b-a913-c6dda7223645','eed5eda3-2daf-5d48-b935-23dadd622d9b']]
assert len(ids)==5 and len(by)==517 and set(by)==set(ob)
assert all(g==ob[i]for i,g in by.items()if i not in ids)
jsonschema.validate(whole,read(Path('docs/landscape-runtime.schema.json')))
sourcechecks=[]
for i in ids:
 g=by[i];assert g['examData']['scoring']==ob[i]['examData']['scoring'];assert g['examData']['reviewStatus']=='released'
 for field in ['coveredGoalIds','coveredStrands','demandLevels']:assert g['examData'][field]==ob[i]['examData'][field]
 task=Path(g['examData']['sourceArtifactPath']);solution=task.with_name(task.name.replace('.task.de.md','.solution.de.md'))
 for f,field in [(task,'taskContent'),(solution,'solutionContent')]:
  text=(R/f).read_text();assert text.startswith('<!-- SPDX-License-Identifier: CC-BY-4.0 -->\n');assert text.split('\n',1)[1].strip()==g['examData'][field].strip();sourcechecks.append(ref(f))
 assert all(w not in g['examData']['taskContent']+g['examData']['solutionContent']for w in ['A01','SC01','P-selection','`released`','needs_review','operative Aktivierung'])
c11='eed5eda3-2daf-5d48-b935-23dadd622d9b';assert by[c11]['extendedData']['courseScopeHold']==ob[c11]['extendedData']['courseScopeHold']
for field in ['sourceRef','applicability','dimensionTags','requires','contains','tags']:assert by[c11].get(field)==ob[c11].get(field)
inputrefs=read(P/'inputs/exact-original-input-bindings.json')['inputs']
for rr in inputrefs:assert ref(Path(rr['path']))==rr,rr['path']
ledger=read(P/'candidate/current517-final-learner-copy-semantic-kinds.inactive.json');older=read(O/'candidate/current511-semantic-kinds.future-active.json');lb={d['goalId']:d for d in ledger['decisions']};odb={d['goalId']:d for d in older['decisions']};roleproof=read(P/'checks/fourteen-genuine-whole-role-reasons-and-current-normal-bindings.json')
# Eight affected existing decisions plus six new decisions; every other prior decision exact.
unchanged=[i for i in odb if odb[i]==lb[i]];assert len(unchanged)==503
delta=read(P/'checks/whole398-native-before-after-all-page-deltas.actual.json');currentmodel=read(P/'native/current398-whole-P205-normal-model.actual.json');mb={p['goalId']:p for p in currentmodel['pages']};assert all(row['wholeCurrentPage']==mb[row['goalId']]for row in delta['wholePageComparisons']);delta['wholeCurrentModel']=ref(P/'native/current398-whole-P205-normal-model.actual.json');put('checks/whole398-native-before-after-all-page-deltas.actual.json',delta)
ctx=read(P/'checks/final-learner-copy-normal398-and-D38-context-exact-retention.json');assert ctx['all398WholePagesAndPageFingerprintsExact'] and ctx['all38NormalCanonicalContextsAndGoalContextFingerprintsExact']
live=[]
for rr in read(P/'inputs/protected-live-paths.before.json')['bindings']:
 now=ref(Path(rr['path']));same=now==rr
 if rr['path'].endswith('de-gymnasium-math-physics.config.json'):live.append({'before':rr,'current':now,'sameBytes':same,'boundary':'Shared registry changed by ROOT Biology work; this author never writes it. Future integration is a Chemie subject-only merge.'})
 else:assert same,rr['path'];live.append({'before':rr,'current':now,'sameBytes':True})
maxdesc=max(len(s['description'].encode('utf-16-le'))//2 for i in ids for s in by[i]['examData']['scoring']['steps']);assert maxdesc==1171
put('checks/final-current517-schema-content-portable-input-and-protection-proof.actual.json',{'schemaVersion':1,'role':'Original AUTHOR mechanical proof; no independent approval','currentWhole':ref(wholep),'runtimeSchema':ref(Path('docs/landscape-runtime.schema.json')),'runtimeSchemaValid':True,'exactOtherWholeGoals':512,'exactFiveWholeScoringObjects':ids,'exactOtherPriorSemanticDecisions':503,'currentSemanticDecisions':517,'actualExternalRawInputBindingsVerified':len(inputrefs),'taskSolutionSourceBindings':sourcechecks,'wholeSC01ScientificMaterialAndScoringPreserved':True,'C11CourseSourceHoldsExact':True,'maximumStepDescriptionUtf16':maxdesc,'maximumBackendDescriptionUtf16':2000,'protectedLiveBindings':live,'noOwnSymlinks':not any(x.is_symlink()for x in (R/P).rglob('*')),'activeWrites':[],'independentApproval':False})
term=[]
for f in sorted((R/P/'terminal').glob('*.json')):
 t=json.loads(f.read_text());term.append({'artifact':ref(f.relative_to(R)),'actualExitCode':t.get('actualExitCode'),'purpose':f.stem})
put('checks/all-actual-terminal-process-exits.index.json',{'schemaVersion':1,'rows':term,'failedAttemptsPreserved':True,'centralNativeCurrentReviewHoldPreserved':True,'activeWrites':[]})
(R/P/'README.md').write_text('''# Inaktiver aktueller Chemie-Autorenstand (517 Ziele)\n\nOriginalautor; neutraler technischer Input für aktuelle unabhängige D/P-/Kontextprüfung. Keine Freigabe oder operative Integration durch diesen Eintrag.\n\nDie fünf Aufgaben tragen maschinelle Inhaltsfreigabemetadaten `released`. Lerntexte enthalten nur fachliche Aufgaben, erforderliche Leistungen und Bewertungsregeln. Menschliche Prüfung, reale Coach-Host-Bewertung und operative Aktivierung bleiben offen. Alle fünf SC01-Rubriken, Maxima und Summengrenzen bleiben exakt erhalten; 512 andere ganze Ziele sind unverändert. C11.1.11 bleibt auf Chemie 11 (NTG) begrenzt, Kursplatzierung HOLD und P-Auswahl false. Eine getrennte fachliche G1-Prüfung darf diese Platzierungsfrage nicht ersetzen.\n\nAktueller ganzer Kandidat: `candidate/whole517.inactive.machine-content-final-learner-copy-author.json`. Normale vollständige 398-Seiten-Ausgabe: `native/final-current398-whole-P205-normal-model.actual.json`. Die normal erzeugten 20/6/12-Bundles bleiben an den erhaltenen vorigen ganzen Input gebunden; `checks/final-learner-copy-normal398-and-D38-context-exact-retention.json` beweist die exakte aktuelle Bindung aller 398 Seiten und 38 Einzelkontexte. Unveränderte gute Bilder sind erhalten.\n\nCQR101/202/203 sind im normalen aktuellen Prüfer grün. Quellenatlas bleibt 378/398 mit 496 ungelösten Scope-Entscheidungen und 20 bewussten Auslassungen. Der normale zentrale Kandidatencheck bleibt wegen vier alten D-Kontextbindungen rot; er ist keine neue unabhängige Prüfung. Aktiver Chemiegewinn: 0; geschützte bisherige 180 bleiben erhalten. Shared Registry wird bei späterer Integration ausschließlich für Chemie zusammengeführt; ROOTs Bio343 bleibt erhalten.\n\nAlle tatsächlichen Prozesse einschließlich früher Fehlversuche sind dokumentiert. Kein Git-/GitHub-Schreiben, keine Veröffentlichung, keine menschliche oder Host-Akzeptanz.\n''')
selected=['candidate/whole517.inactive.machine-content-final-learner-copy-author.json','candidate/current517-final-learner-copy-semantic-kinds.inactive.json','candidate/current517-final-learner-copy-semantic-kinds.portable.inactive.json','candidate/current517-normal-QA.inactive.json','native/final-current398-whole-P205-normal-model.config.json','native/final-current398-whole-P205-normal-model.actual.json','checks/final-learner-copy-normal398-and-D38-context-exact-retention.json','checks/whole398-native-before-after-all-page-deltas.actual.json','checks/fourteen-genuine-whole-role-reasons-and-current-normal-bindings.json','checks/P25-plus-protected12-whole-profile-and-normal-context-candidate-bindings.json','checks/final-current517-normal-route-readiness-and-applicability.actual.json','checks/normal-final-current517-central-readiness.actual.report.json','checks/final-current517-schema-content-portable-input-and-protection-proof.actual.json','checks/all-actual-terminal-process-exits.index.json','source-atlas/final-current517-bounded378-normal.inputs.json','source-atlas/final-generated-actual/source-manifest.json','source-atlas/portable-final-current517-bounded378.source-manifest.json','checks/final-normal-source-outputs-exact-portable-copy-aliases.json','registry/chemie-subject.current517-technical-context-candidate.inactive.json','registry/chemie-only-current517-normal-check.inactive.config.json']
entry={'schemaVersion':1,'role':'Original AUTHOR neutral current native/readiness input, no independent approval','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeGoalCount':517,'curricularAtomicCount':398,'selectedPConservativeCount':205,'currentP25PlusProtected12WholeProfiles':37,'normalNativePreparedGoalCount':38,'normalNativeGroups':{'current20':20,'current6':6,'protected12':12},'actualSubstantiveOldToCurrentPageGoalIds':delta['actualSubstantiveChangedGoalIds'],'actualProtected180SubstantiveChangedGoalIds':delta['actualProtected180SubstantiveChangedGoalIds'],'all398PagesAnd38PerGoalContextsExactAfterLearnerCopy':True,'finalCandidateInputs':[ref(P/s)for s in selected],'retainedPriorWhole':ref(P/'candidate/whole517.inactive.machine-content-final-author.json'),'nativeBatchInputs':[ref(P/f'native/{g}.normal-rollout.batch.config.json')for g in ['current20','current6','protected12']],'nativeBundleInputModels':[ref(P/f'native/{g}/bundle/book-model.json')for g in ['current20','current6','protected12']],'nativeReviewInputs':[ref(P/f'native/{g}/{rnd}/description-review-input.json')for g in ['current20','current6','protected12']for rnd in ['round-a','round-b']],'allFilesSealedBy':'author-current517.final.freeze.json','candidateOnly':True,'activeChemie':{'strict':180,'denominator':381,'gain':0},'currentFinalIndependentNativeContextReview':'pending','currentAuthoritativeStrictDenominator':None,'remainingHolds':['Four normal central D bindings stale against repaired route context: 5b1bb5d9-07b1-5ba9-b320-cc97be917c60, 75e2eff1-f871-5461-9e3f-26d0b333ce2f, 9fc800d1-92d1-5ef6-81c1-33960ae034dd, 6c7ce93c-7675-51da-bc0c-7d0257f7ff7d; genuine current dual independent context decisions required.','C11 course placement and source applicability unresolved; conservative P205 does not select e5a5; separate current bounded G1 competence candidate/reviews follow.','Human Review/Trial and actual Coach Host assessment acceptance remain open.'],'sharedRegistryIntegration':'Chemie subject-only merge; ROOT current Bio343 retained.','activeWrites':[],'gitOrGithubWrites':[],'independentApproval':False}
put('author-current517.final.entry.json',entry)
files=[ref(f.relative_to(R))for f in sorted((R/P).rglob('*'))if f.is_file()];assert not any(f.is_symlink()for f in (R/P).rglob('*'))
put('author-current517.final.freeze.json',{'schemaVersion':1,'role':'Additive original AUTHOR frozen neutral input, not activation','entry':ref(P/'author-current517.final.entry.json'),'wholeCurrent':ref(wholep),'files':files,'fileCount':len(files),'bytes':sum(f['bytes']for f in files),'activeWrites':[],'independentApproval':False})
print(json.dumps({'entry':ref(P/'author-current517.final.entry.json'),'freeze':ref(P/'author-current517.final.freeze.json'),'whole':ref(wholep),'fileCount':len(files)},ensure_ascii=False),flush=True)
