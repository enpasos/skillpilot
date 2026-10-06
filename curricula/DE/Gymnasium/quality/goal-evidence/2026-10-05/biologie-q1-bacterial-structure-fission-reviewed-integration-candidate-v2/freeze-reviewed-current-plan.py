#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Freeze an inactive scoped plan only after actual future42 checks pass."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
PREP=OWN.parent/'biologie-q1-bacterial-structure-fission-native-candidate-v1';ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(name,v):(OWN/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
plan=read(OWN/'integration-plan.json');receiptpath=OWN/'future-biologie-central.terminal.receipt.json';receipt=read(receiptpath);reportpath=ROOT/receipt['reportPath'];s=read(reportpath)['subjects'][0]
assert receipt['actualExitCode']==0 and receipt['reportSHA256']==sha(reportpath)
assert s['subject']=='biologie' and s['strictComplete']==42 and s['denominator']==365 and s['issues']==[] and all(x['status']=='pass' for x in s['requiredChecks'])
assert set(plan['protectedCurrentStrict40GoalIds']).issubset(s['strictCompleteGoalIds'])
assert set(s['strictCompleteGoalIds'])-set(plan['protectedCurrentStrict40GoalIds'])==set(plan['expectedTwoNewScientificGoalIds'])
plan.update({'status':'actual_isolated_native_all_six_checks_pass_reviewable_current42_candidate','futureCentralReceiptPath':str(receiptpath.relative_to(ROOT)),'futureCentralReceiptSHA256':sha(receiptpath),'futureCentralReportPath':str(reportpath.relative_to(ROOT)),'futureCentralReportSHA256':sha(reportpath),'actualFutureStrict':42,'actualFutureGates':s['gates'],'activeBaselineStrict':40,'activeNetIncreaseByThisPreparation':0,'predictedNetAfterRootApplication':2})
guards=read(OWN/'existing-scientific-author-and-review-freezes-preserved.actual.json')['guards']
for row in guards:
 assert sha(ROOT/row['path'])==row['sha256']
 for f in read(ROOT/row['path'])['files']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
plan['exactReviewFreezeGuards']=guards
for name in ['native-current-three-entire-page-binding-proof.actual.json','whole-current-navigation-before-and-after.actual.json']:
 shutil.copy2(ISO/REL/name,OWN/name)
proof=read(OWN/'native-current-three-entire-page-binding-proof.actual.json');assert proof['entireThreeCurrentPagesExact'] and proof['navigationBaseDigestBoundToActualCurrentBase']
atlas=read(ISO/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json');unchanged={};delta={x['futureActivePath']:x for x in plan['explicitFutureDeltaFiles']}
for row in atlas['inputBindings']:
 expected=row['sha256'].removeprefix('sha256:');assert sha(ISO/row['path'])==expected
 if row['path'] not in delta:assert sha(ROOT/row['path'])==expected;unchanged[row['path']]=expected
active=next(s for s in read(OWN/'central-registry.before.snapshot.json')['subjects'] if s['subject']=='biologie')
for cfgp in [active['semanticAtomicityConfigPath'],active['memoryReviewConfigPath']]+active['positiveEvidenceConfigPaths']:
 unchanged[cfgp]=sha(ROOT/cfgp);cfg=read(ROOT/cfgp)
 for key in ['reviewPath','cardReviewPath','reviewCriteriaPath']:
  if cfg.get(key):unchanged[cfg[key]]=sha(ROOT/cfg[key])
for x in plan['unchangedPlannedInputs']:unchanged[x['path']]=x['sha256']
plan['unchangedCurrentEvidenceGuards']=[{'path':p,'sha256':v} for p,v in sorted(unchanged.items())];write('integration-plan.json',plan)
write('actual-future42-and-protected40-scientific-boundaries.receipt.json',{'at':datetime.now(timezone.utc).isoformat(),'actualFutureStrict':42,'actualDenominator':365,'actualGates':s['gates'],'allSixNativeRequiredChecksPass':True,'blockingIssues':[],'allCurrent40StrictIdsAndWholeGoalsPreserved':True,'twoNewScientificStrictIds':sorted(set(s['strictCompleteGoalIds'])-set(plan['protectedCurrentStrict40GoalIds'])),'7cExistingBindingRestorationNetZero':plan['bindingRestorationGoalIds'],'allCurrentAtlasInputBindingSHAsVerified':len(atlas['inputBindings']),'unchangedEvidenceGuardCount':len(unchanged),'P2StatusNeedsHumanReview':all(json.loads(x)['status']=='needs_human_review' for x in (OWN/'positive-evidence.review.jsonl').read_text().splitlines()),'innerProfilesExactExistingRootReviewedCandidates':True,'sourceUmbrellaHoldsNotClosed':True,'THReproductionNotAdded':True,'populationCultureAndMolecularReplicationCompetencesNotClaimed':True,'newIndependentScienceReviewsByTechnicalIntegrator':0,'humanApproval':False,'humanTrial':False,'activeWrites':0,'activeStrictNetIncrease':0})
cmd=['python',str(REL/'apply-reviewed-integration-plan.py')];p=subprocess.run(cmd,cwd=ROOT,capture_output=True);(OWN/'root-readonly-preflight.stdout.txt').write_bytes(p.stdout);(OWN/'root-readonly-preflight.stderr.txt').write_bytes(p.stderr);write('root-readonly-preflight.actual.receipt.json',{'command':cmd,'actualExitCode':p.returncode,'stdoutSHA256':sha(OWN/'root-readonly-preflight.stdout.txt'),'stderrSHA256':sha(OWN/'root-readonly-preflight.stderr.txt'),'activeWrites':0});assert p.returncode==0,p.stderr.decode()
(OWN/'README.md').write_text('''# Biologie Bakterien: geprüfter inaktiver Integrationskandidat v2

Der tatsächliche isolierte zentrale Bericht bestätigt **42/365 (11,5 %)**, D42/P42/A365/M365/V49, alle sechs Abschlusschecks bestanden, keine Issues. Aktiv bleibt bis zur Root-Anwendung 40/364.

Zwei neue fachliche Abschlüsse: bakterieller Zellbau und modellhafte Zweiteilung. Die eigenständige Zweiteilung bewahrt die bislang gemeinsam verlangte Reproduktionsleistung und erhöht den aktuellen Nenner um eins. Zelltypenvergleich 7c erhält eine gezielt unabhängig geprüfte aktuelle Nachfolger-/Seitenbindung; kein zusätzlicher fachlicher Abschluss. Alle 40 bisherigen strengen IDs und ganzen Zielobjekte bleiben erhalten. Partielle Quellenkomponenten erledigen keine ganzen mikrobiologischen Sammeloperatoren, exponentielles Wachstum, Kulturkurven oder TH-Vermehrung.

Dieser Integrator hat bestehende unabhängige D-A3/Root-D-B3-Runden samt Begründungen zusammengeführt und die bereits vorhandenen unabhängigen Root-P2/A2/M2/V2-Entscheidungen technisch gebunden. Es wird keine zusätzliche wissenschaftliche Prüfung oder neue Erzeugung behauptet. Innere P-Profile bleiben exakt, E1/G1 und `needs_human_review`; 363 andere A/M-Zeilen und erforderliche Karten bleiben erhalten. Gute vorhandene Bilder bleiben erhalten; die zwei unabhängig tatsächlich geprüften PNGs werden unverändert importiert. Menschliche Prüfung und Erprobung bleiben getrennt.

`integration-plan.json` enthält 30 tatsächlich geänderte Dateieingänge und 13 unveränderte Eingänge aus dem eingefrorenen Autorpaket. Es ändert nur die dokumentierten Felder von drei bestehenden Zielobjekten, fügt einen genau beschriebenen Begleiter nach dem Bauziel ein und supersediert ausschließlich den bestehenden 7c-Indexeintrag. Keine historische Vollbasis wird zurückgesetzt. Ganze aktuelle D3-Seiten einschließlich aller Text-, Quellen-, Kontext- und Bildbindungen sind exakt mit den geprüften Seiten gleich. Die Maschinenbildurteile verändern die rohe QA-Quelldatei; im übrigen Buch ändert sich allein der daraus abgeleitete Navigations-Basismodell-Digest. Dies wurde durch vollständigen Payloadvergleich belegt; keine fachliche Freigabe durch Hashanpassung.

`apply-reviewed-integration-plan.py` führt standardmäßig einen schreibfreien Preflight aus. Root kann nach eigener Artefaktprüfung `--apply` ausführen; die tatsächlichen aktuellen Zukunftschecks und Eingangsfreezes sind Pflicht. Der dann aktuelle Chemieeintrag, Mathematik-/Physik-Grenzen und nicht betroffene Eingänge bleiben erhalten. Kein aktiver Schreibvorgang, Veröffentlichungsschritt, menschliches Release-Gate oder Versuch wurde durch diese Vorbereitung vorgenommen.
''')
files=[{'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(OWN.rglob('*')) if p.is_file() and p.name not in {'reviewed-integration.final.freeze.json','reviewed-integration.final.freeze.sha256'}]
write('reviewed-integration.final.freeze.json',{'schemaVersion':1,'status':'actual_future42_native_pass_inactive_reviewed_plan','at':datetime.now(timezone.utc).isoformat(),'files':files,'newIndependentScienceReviews':0,'activeWrites':0,'humanApproval':False,'humanTrial':False});digest=sha(OWN/'reviewed-integration.final.freeze.json');(OWN/'reviewed-integration.final.freeze.sha256').write_text(digest+'\n');print(json.dumps({'planPath':str(REL/'integration-plan.json'),'freezeSHA256':digest,'frozenFiles':len(files),'actualFutureStrict':42,'actualFutureDenominator':365,'activeBaselineStrict':40,'netAfterRootApplication':2,'humanApproval':False,'activeWrites':0}))
