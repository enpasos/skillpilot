"""Apache-2.0. Freeze exact inactive technical results; do not apply or approve."""
from pathlib import Path
import datetime,hashlib,json,subprocess
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
def rel(p):return str(Path(p).relative_to(ROOT))
def bind(p):
 b=Path(p).read_bytes();return {'path':rel(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(p):return json.loads(Path(p).read_text())
def write(p,o):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:f.write((o if isinstance(o,str)else json.dumps(o,ensure_ascii=False,indent=2))+'\n')
 return bind(p)
guards=read(OWN/'exact-current191-input-snapshots-and-rebase-guards.technical.json')
impact=read(OWN/'checks/full392-actual-page-position-vs-substantive-context-impact.technical.json')
trace=read(OWN/'checks/78-current-page-position-only-exact-historical-references-and-subset-proof.technical.json')
actualGoodChecks=['native391-to392-compile-v3','A2-scoped','M2-scoped','A-full-namespace-v2','M-full-namespace-v2','P2-native-current-pre-raster-correct-cli','78-historical-bindings-native-proof-v2']
checks=[]
for n in actualGoodChecks:
 p=OWN/f'checks/{n}.terminal.actual.json';j=read(p);assert j['actualTerminalExitCode']==0,n;checks.append({'check':n,'terminal':bind(p),'stdout':bind(ROOT/j['stdoutPath']),'stderr':bind(ROOT/j['stderrPath']),'actualExitCode':0})
schema=read(ROOT/'docs/landscape-runtime.schema.json')
candidate=OWN/'candidate/canonical.current476.reviewed-split.inactive.json'
jsonschema.Draft202012Validator(schema).validate(read(candidate))
allJson=sorted(OWN.rglob('*.json'))
for p in allJson:read(p)
symlinks=[]
for p in OWN.rglob('*'):
 if p.is_symlink():
  q=p.resolve(strict=True);assert q.is_relative_to(ROOT);symlinks.append({'path':rel(p),'target':str(q)})
assert not symlinks
write(OWN/'checks/affected476-runtime-schema-own-JSON-and-contained-files.actual.json',{'actualApi':'jsonschema.Draft202012Validator','schema':bind(ROOT/'docs/landscape-runtime.schema.json'),'wholeCandidate':bind(candidate),'actualRuntimeSchemaErrors':0,'actualOwnJSONFilesParsed':len(allJson),'actualOwnSymlinks':symlinks,'noSchemaOrIgnoreChanges':True,'fullRepositorySchemaRun':'not repeated; root bundles stable gates','activeWrites':0,'humanApproval':False})

legacy=OWN.parent/'biologie-he9-split-legacy-progress-readonly-audit-root-v1/existing-legacy-mapping-and-new-child-progress.actual-readonly-audit.json'
lj=read(legacy);assert lj['conclusion'].startswith('PASS') and lj['actualExistingFrontendRegression']['exitCode']==0
assert lj['runtimeFilesChanged']is False and lj['privateLearnerSessionChatDataRead']is False
for r in lj['frozenInputs']:
 p=ROOT/r['path'];assert bind(p)['sha256']==r['sha256'];assert bind(p)['bytes']==r['bytes']
actualChildren=read(candidate)['goals'][-2:]
for child in actualChildren:
 assert child['id']in lj['newChildIds']
 provenance=child['extendedData']['provenance'];assert provenance['canonicalSplitOriginGoalId']==lj['preservedHistoricalStableParentId'];assert 'splitFromCanonicalGoalId'not in provenance
write(OWN/'before/exact-root-legacy-progress-readonly-audit.json',legacy.read_text().rstrip('\n'))
legacyGate=write(OWN/'checks/current-child-legacy-readonly-root-audit.conditioned-adoption.actual.json',{'role':'technical exact adoption of root read-only runtime/mapping audit, not a new runtime or learner trial','rootActualAudit':bind(legacy),'sixActualAuditInputsReverified':lj['frozenInputs'],'wholeReviewedChildProvenanceExact':True,'existingRootPurePlanningRegressionExit':0,'status':'PASS conditioned','conditions':['Keep both entire reviewed child provenance bodies unchanged; canonicalSplitOriginGoalId remains historical metadata only.','Keep existing exact legacy mapping and runtime files unchanged.','Keep historical old-parent achievement and do not invent new-child achievement.'],'runtimeWrites':0,'privateDataRead':False,'humanTrialClaimed':False,'activeWrites':0})

manifestActive='app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'
futureManifest=read(ROOT/guards['snapshotMap'][manifestActive]);futureManifest['expectedCurricularAtomicGoalCount']=392
write(OWN/'candidate/atlas.sources.current392.future-active.json',futureManifest)
operative={
 'canonical':bind(candidate),
 'genuineScientificClassificationsInactive':bind(OWN/'candidate/semantic-kinds.current476.actual-paired-science.v3.inactive.json'),
 'genuineScientificClassificationsFutureActive':bind(OWN/'candidate/semantic-kinds.current476.actual-paired-science.v3.future-active.json'),
 'nativeFull392Config':bind(OWN/'native-v3/full392.reviewed-split.inactive.config.json'),
 'nativeFull392ActualPureModel':bind(OWN/'native-v3/full392.reviewed-split.no-new-raster.pure.book-model.json'),
 'nativeFull391ActualBeforePureModel':bind(OWN/'native-v3/full391.before.pure.book-model.json'),
 'atlasInactive':bind(OWN/'candidate/atlas.sources.current392.uniform-view-paths.inactive.json'),
 'atlasFutureActive':bind(OWN/'candidate/atlas.sources.current392.future-active.json'),
 'A392NativeConfig':bind(OWN/'candidate/A.current-full.namespace-v2.inactive.config.json'),
 'M392NativeConfig':bind(OWN/'candidate/M.current-full.namespace-v2.inactive.config.json'),
 'A392ActualLedger':bind(OWN/'candidate/A.current-full-reviewed.namespace-v2.inactive.jsonl'),
 'M392ActualLedger':bind(OWN/'candidate/M.current-full-reviewed.namespace-v2.inactive.jsonl'),
 'originalCardsRetained':bind(ROOT/guards['snapshotMap']['curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.cards.review.jsonl']),
 'P2ExactWholeSciencePreRasterConfig':bind(OWN/'candidate/P2.current-pre-raster.inactive.config.json'),
 'P2ExactWholeSciencePreRasterRecords':bind(OWN/'candidate/P2.whole-science-exact.pre-raster.review.jsonl'),
 'exactNativePageImpact':bind(OWN/'checks/full392-actual-page-position-vs-substantive-context-impact.technical.json'),
 '78PositionOnlyHistoricalReferencesAndSubsetProof':bind(OWN/'checks/78-current-page-position-only-exact-historical-references-and-subset-proof.technical.json'),
 'conditionedLegacyGate':legacyGate,
}
pending=['Actual two new child PNGs/mobile widths/native book-page independent D/P/V, including fresh actual image/context fingerprints.','Actual independent HE11/HE13 true native page-context rechecks; old description science and good actual images KEEP.','Root final392 model/standard original D reference-validation and explicit targeted technical78 binding restoration; historical artifacts unchanged, no fabricated runs.','Exact old191 strict IDs retained with unchanged Math807, Physics478, Chemistry173/current378 and all protected maturity floors in final central check.','Guard current baseline again; a newer whole goal or resource state needs targeted inactive rebase before root application.']
rejected=[]
for p in sorted((OWN/'checks').glob('*.terminal.actual.json')):
 j=read(p)
 if j['actualTerminalExitCode']!=0:rejected.append({'terminal':bind(p),'exitCode':j['actualTerminalExitCode'],'status':'preserved historical technical diagnostic; not operative or accepted'})
currentCanonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
unchangedNow=bind(currentCanonical)['sha256']==guards['baseline']['canonical']['sha256']
entry={'artifactKind':'inactive current191 HE12 split technical rebase after genuine independent source/class/AM science','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'operativeArtifactsOnly':operative,'exactPairedGenuineScienceSeals':guards['genuinePairedSealsActuallyVerified'],'actualTerminalChecks':checks,'preservedRejectedTechnicalAttempts':rejected,'baseline':guards['baseline'],'baselineStillExactAtFinalization':unchangedNow,'currentWholeCanonicalAtFinalization':bind(currentCanonical),'current476CandidateHasAll473OtherBaselineWholeGoalsExact':True,'actualNativeFullBeforePages':391,'actualNativeFullAfterPages':392,'native31ScopeChanges':{'plusOne':23,'unchanged':8},'memoryNewCards':0,'memoryRequiredViewsChecked':8,'memoryCardsAndScientificDecisionsUnchangedExceptTwoGenuineNewChildren':True,'legacyGate':'PASS conditioned on exact reviewed provenance and unchanged runtime/mapping','pageImpact':{'all390WholeGoalFingerprintsExact':True,'fullOldPageFingerprintsExact':261,'fullPositionOnly':127,'prior191StrictIDsPresent':191,'priorStrictExactPages':111,'priorStrictPositionOnly':78,'trueNativeContextGoalIds':impact['substantiveRelationContextGoalIds'],'sameNativeSubsetBeforeAfterContextsFor78Exact':True,'historicalNativeSubsetExactlyEqualToCurrentAfter':76,'twoAlreadyHistoricalSubsetDifferences':trace['originalHistoricalSubsetContextDifferencesNotClaimedAsNewSplitDefects']},'currentStrictGate':'PENDING; no structural integration or recovered binding claimed','pending':pending,'noNewScienceReviewsForUnchangedGoals':True,'humanApproval':False,'humanTrial':False,'activeWrites':0,'commits':0,'newScientificClosures':0,'restoredBindingsClaimed':0,'strictGainClaimed':0}
write(OWN/'neutral-inactive-current191-to392-technical-rebase.entry.json',entry)
write(OWN/'TECHNICAL-READINESS.md','''# Inaktiver HE12-Split auf tatsächlichem Stand 191

Der Kandidat verwendet den tatsächlich abgeschlossenen 191/391-Bericht und Canonical a1aa2550071a797e0f03084ea6aa2c77ad8bceb25e980af9bf96fad66f3e60fe. Alle 473 anderen ganzen Ziele bleiben exakt. Echte unabhängige Science A/B begründen den stabilen Eltern-Cluster und zwei atomare Kinder mit no_memory_needed. Die geschlossene native Klassenledger und die 392 Publikationsseiten sind tatsächlich kompiliert, keine Simulation.

Operativ sind ausschließlich die im neutral-inactive-current191-to392-technical-rebase.entry.json genannten Dateien. Die erste Sortierdiagnose, geschlossene Vertragsdiagnose und ursprünglichen reviewId-Konflikte bleiben erhalten; ihre Dateien sind keine operative Freigabe. Die finale Klassenledger nutzt das unveränderte geschlossene Standardvokabular; die vollständigen wissenschaftlichen Gründe stehen in beiden unveränderten echten Reviewseals. In den vollen A/M-Ledgern wurde bei den beiden echten neuen Sciencezeilen ausschließlich der technische reviewId-Namespace geändert; Datum, Reviewer, Gründe, Fingerprints und Entscheidungen sind exakt erhalten. Dies ist kein neuer fachlicher Review.

Tatsächlich terminal 0: Native 391→392, 31 Scopes/476-DAG, scoped A2/M2, full A392/M392 und P2 Standardprüfung. P2 bleibt needs_human_review/ai_candidate/E1/G1; noch ohne neue Bildbindung. 27 bestehende Primärkarten, 3 Memoryziele und 8 Sichtbarkeitsbereiche bleiben gültig; neue Karten 0. Der Root-Legacyaudit ist exakt an seine sechs tatsächlichen Code-/Mapping-/Kandidateninputs gebunden. Unter dessen Bedingungen bleibt die alte Elternhistorie erhalten, neue Kinder sind unassessed; keine Laufzeitänderung und keine privaten Daten.

Der tatsächliche native Seitenvergleich ergibt 261 identische und 127 nur positionsbedingt geänderte alte Seiten. Unter den 191 strengen IDs sind 111 Seiten exakt und 78 positionsbedingt; HE11/HE13 sind die beiden echten Kontextänderungen. Für 78 wurden die eindeutigen ursprünglichen D-Indices, unabhängigen Rundeneingaben, Resolution-/Runbindungen und realen Bildbytes gezielt gebunden. Der native Subsetcompiler beweist bei allen 78 denselben Seitenkontext 391→392. 76 historische Teilbuchseiten sind sogar zum aktuellen Subset exakt; 0daa79f6... und e70d8a85... hatten schon vor dem Split dieselbe bestehende Abweichung. Keine neue Reviewrunde und keine restaurierte strenge Bindung wird daraus behauptet. Autorenangabe 100 betraf ausschließlich native CompiledNodes in anderer Reihenfolge, nicht actual FullBookPages.

Offen bleiben echte zwei Raster/native D/P/V, HE11/HE13-Kontextprüfung, Root-Restaurierungsgate 78 auf dem endgültigen 392-Modell, neuer zentraler strenger Bericht und geschützte Qualitätsgrenzen. Falls der Root inzwischen ein weiteres Ziel integriert, muss der inaktive technische Kandidat gezielt neu gebunden werden; niemals das volle alte 476-JSON über einen neueren Bestand kopieren. Fortschritt dieses technischen Pakets: 0 fachliche Abschlüsse, 0 behauptete restaurierte Bindungen, 0 Nettozuwachs. Menschliche Release-/Erprobungsgates bleiben getrennt.
''')

files=sorted(p for p in OWN.rglob('*')if p.is_file())
argv=['git','check-ignore','--no-index','--stdin'];r=subprocess.run(argv,input='\n'.join(rel(p)for p in files)+'\n',capture_output=True,text=True);assert r.returncode==1 and not r.stdout,(r.returncode,r.stdout,r.stderr)
write(OWN/'checks/actual-own-committable-files.portability.json',{'actualArgv':argv,'actualTerminalExitCode':r.returncode,'actualStdout':r.stdout,'actualStderr':r.stderr,'actualOwnFiles':len(files),'ignoredRequiredOwnFiles':[],'ownSymlinks':0,'absoluteOrDanglingSymlinks':0,'schemaChanges':0,'gitignoreChanges':0,'forceAdds':0})
files=sorted(p for p in OWN.rglob('*')if p.is_file())
freeze=write(OWN/'completed-current191-inactive392-reviewed-science-technical-rebase.first.freeze.json',{'artifactKind':'exact inactive reviewed-science technical rebase and actual native checks; no active integration or strict gain','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenFiles':[bind(p)for p in files],'actualNativeCheckExits':{c['check']:0 for c in checks},'actualPurePages':[391,392],'all473OtherCurrentWholeGoalBodiesRetained':True,'same78NativeSubsetPageContextsExact':True,'pending':pending,'legacyGate':'PASS conditioned','activeWrites':0,'strictGainClaimed':0,'newIndependentScienceReviews':0,'humanApproval':False})
print(json.dumps({'actualFinalTechnicalFirstSeal':freeze,'entry':bind(OWN/'neutral-inactive-current191-to392-technical-rebase.entry.json'),'actualPureNativePages':392,'baselineStillExact':unchangedNow,'legacyGate':'PASS conditioned','allRequiredTerminalChecks0':True,'noStrictGain':True}))
