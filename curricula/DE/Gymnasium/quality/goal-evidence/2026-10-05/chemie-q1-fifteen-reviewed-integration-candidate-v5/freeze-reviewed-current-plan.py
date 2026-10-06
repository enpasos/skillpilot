#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Require actual isolated central success and freeze the reviewable inactive plan."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
ISO=ROOT/'tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v4'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(name,v):(OWN/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
plan=read(OWN/'integration-plan.json');receiptpath=OWN/'future-chemie-central-after-native-qa-inventory.terminal.receipt.json';receipt=read(receiptpath);reportpath=ROOT/receipt['reportPath'];s=read(reportpath)['subjects'][0]
assert receipt['actualExitCode']==0 and receipt['reportSHA256']==sha(reportpath)
assert s['strictComplete']==104 and s['denominator']==376 and s['issues']==[] and all(x['status']=='pass' for x in s['requiredChecks'])
assert set(plan['protectedCurrentStrict90GoalIds']).issubset(s['strictCompleteGoalIds'])
assert set(s['strictCompleteGoalIds'])-set(plan['protectedCurrentStrict90GoalIds'])==set(plan['expectedFourteenNewScientificGoalIds'])
assert not set(plan['sixSourceHoldGoalIds'])&set(s['strictCompleteGoalIds'])
plan.update({'status':'actual_isolated_native_all_six_checks_pass_reviewable_current104_candidate','futureCentralReceiptPath':str(receiptpath.relative_to(ROOT)),'futureCentralReceiptSHA256':sha(receiptpath),'futureCentralReportPath':str(reportpath.relative_to(ROOT)),'futureCentralReportSHA256':sha(reportpath),'actualFutureStrict':104,'actualFutureGates':s['gates'],'activeBaselineStrict':90,'activeNetIncreaseByThisPreparation':0,'predictedNetAfterRootApplication':14})
reviewguards=[]
for p in [OWN.parent/'chemie-q1-fourteen-current-native-candidate-v4/prepared-current-inputs.final.freeze.json',OWN.parent/'chemie-q1-fifteen-current-independent-d-a-v2/final.freeze.json',OWN.parent/'chemie-q1-fifteen-current-independent-d-b-v4/independent-review.final.freeze.json',OWN.parent/'chemie-q1-fourteen-current-independent-p-v3/independent-review.final.freeze.json',ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-eight-current-independent-v-qa-20261005-v3/review.freeze.manifest.json']:
 for f in read(p)['files']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
 reviewguards.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'files':len(read(p)['files'])})
plan['exactReviewFreezeGuards']=reviewguards
proofsrc=ISO/REL/'native-current-fifteen-entire-page-binding-proof.actual.json';assert read(proofsrc)['entireFifteenCurrentPagesExact'];shutil.copy2(proofsrc,OWN/proofsrc.name)
atlas=read(ISO/'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json');unchanged={}
delta={r['futureActivePath']:r for r in plan['explicitFutureDeltaFiles']}
for row in atlas['inputBindings']:
 expected=row['sha256'].removeprefix('sha256:');assert sha(ISO/row['path'])==expected
 if row['path'] not in delta:assert sha(ROOT/row['path'])==expected;unchanged[row['path']]=expected
active=next(x for x in read(OWN/'central-registry.before.snapshot.json')['subjects'] if x['subject']=='chemie')
for cfgp in active['semanticAtomicityConfigPaths']+active['positiveEvidenceConfigPaths']+[active['memoryReviewConfigPath']]:
 unchanged[cfgp]=sha(ROOT/cfgp);cfg=read(ROOT/cfgp)
 for key in ['reviewPath','cardReviewPath','reviewCriteriaPath']:
  if cfg.get(key):unchanged[cfg[key]]=sha(ROOT/cfg[key])
plan['unchangedCurrentEvidenceGuards']=[{'path':p,'sha256':v} for p,v in sorted(unchanged.items())]
write('integration-plan.json',plan)
write('actual-future104-and-protected90-six-holds.receipt.json',{'at':datetime.now(timezone.utc).isoformat(),'actualFutureStrict':104,'actualDenominator':376,'actualGates':s['gates'],'allSixNativeRequiredChecksPass':True,'blockingIssues':[],'allCurrent90StrictIdsPreserved':True,'fourteenNewScientificStrictIds':sorted(set(s['strictCompleteGoalIds'])-set(plan['protectedCurrentStrict90GoalIds'])),'bd36OneCurrentBindingRestorationNetZero':plan['bindingRestorationGoalIds'],'sixSourceHoldsStillUnclosed':plan['sixSourceHoldGoalIds'],'all103ActualAtlasInputsSHA256Verified':True,'unchangedEvidenceGuardCount':len(unchanged),'fourteenPStatusNeedsHumanReview':all(json.loads(x)['status']=='needs_human_review' for x in (OWN/'positive-evidence.review.jsonl').read_text().splitlines()),'existingAcceptedJPGsKept':True,'newMissingActivePNGGoalIds':['ca216bc6-5205-5b46-abbd-fd5628e4ca5b','6765f741-42a6-55c5-a218-81b883b1f5ae','8a491e3b-5d0b-51d3-9b14-0977ec035dd6'],'replacedExistingJPGGoalIds':['db66635f-f1d1-5f70-bcc0-fed1ae424e52'],'humanApproval':False,'humanTrial':False,'activeWrites':0,'activeStrictNetIncrease':0})
cmd=['python',str(REL/'apply-reviewed-integration-plan.py')];p=subprocess.run(cmd,cwd=ROOT,capture_output=True);(OWN/'root-readonly-preflight.stdout.txt').write_bytes(p.stdout);(OWN/'root-readonly-preflight.stderr.txt').write_bytes(p.stderr);write('root-readonly-preflight.actual.receipt.json',{'command':cmd,'actualExitCode':p.returncode,'stdoutSHA256':sha(OWN/'root-readonly-preflight.stdout.txt'),'stderrSHA256':sha(OWN/'root-readonly-preflight.stderr.txt'),'activeWrites':0});assert p.returncode==0,p.stderr.decode()
(OWN/'README.md').write_text('''# Chemie Q1: geprüfter, inaktiver Integrationskandidat v5

Der tatsächliche isolierte zentrale Bericht bestätigt **104/376 (27,7 %)**, D104/P104/A199/M376/V356, alle sechs Abschlusschecks bestanden, keine Issues. Aktiv bleibt bis zur Root-Anwendung 90/376.

Genau 14 neue fachliche Abschlüsse; bd36 aktualisiert eine bestehende Seiten-/Quellenbindung und erhöht die Gesamtzahl nicht. Alle bisherigen 90 strengen IDs und die sechs offenen SOURCE HOLDs bleiben erhalten. Drei aktive Bildlücken werden mit unabhängig geprüften PNGs geschlossen; ein bestehendes Ascorbat-JPG wird nach dokumentierter Fachkorrektur ersetzt. Gute vorhandene JPGs bleiben erhalten. Die bisherige Ascorbatdatei, alle drei Kopien und der Prompt sind hier exakt archiviert. Inaktive frühere Erzeugungsversuche und alle eingefrorenen Reviews bleiben unverändert.

Zwei aktuelle unabhängige D15-Runden, 14 unabhängig fachlich geprüfte P-v2-Profile mit 28 Fällen, sieben tatsächliche A/M-Entscheidungen einschließlich gezielter Titelkorrektur und V8 sind gebunden. P bleibt `needs_human_review` (E1/G1); KI-Ergebnisse sind keine menschliche Prüfung oder Erprobung.

`integration-plan.json` enthält 24 explizite Dateideltas, nur tatsächlich geänderte Q1-Zielfelder und genau eine bestehende D-Supersession. Die aktuelle außerfachliche Cluster-Anwendbarkeit bleibt erhalten; keine historische Vollbasis wird zurückgesetzt. Der native QA-Generator stellt lediglich die Datensatzreihenfolge wieder her: sämtliche 376 Datensätze und menschlichen Felder sind exakt gleich. Ganze aktuelle D15-Seiten einschließlich Kontext-, Quellen- und Bildbindungen sind tatsächlich identisch mit dem geprüften Modell.

`apply-reviewed-integration-plan.py` führt standardmäßig einen schreibfreien Preflight aus. Root kann nach eigener Artefaktprüfung `--apply` ausführen. Es bewahrt den dann aktuellen Biologie-Registryeintrag, die Mathematik-/Physik-Grenzen und sämtliche nicht betroffenen Ziele. Der tatsächliche zentrale Bericht und alle Eingangsfreezes sind verpflichtende Schutzbedingungen. Keine aktive Anwendung, Veröffentlichung, menschliche Freigabe oder Erprobung wurde durch diese Vorbereitung vorgenommen.
''')
files=[{'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(OWN.rglob('*')) if p.is_file() and p.name not in {'reviewed-integration.final.freeze.json','reviewed-integration.final.freeze.sha256'}]
write('reviewed-integration.final.freeze.json',{'schemaVersion':1,'status':'actual_future104_native_pass_inactive_reviewed_plan','at':datetime.now(timezone.utc).isoformat(),'files':files,'activeWrites':0,'humanApproval':False,'humanTrial':False});digest=sha(OWN/'reviewed-integration.final.freeze.json');(OWN/'reviewed-integration.final.freeze.sha256').write_text(digest+'\n');print(json.dumps({'planPath':str(REL/'integration-plan.json'),'freezeSHA256':digest,'frozenFiles':len(files),'actualFutureStrict':104,'activeBaseline':90,'netAfterRootApplication':14,'humanApproval':False,'activeWrites':0}))
