#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Technical native synthesis of existing current independent D3 evidence."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
PREP=OWN.parent/'biologie-q1-bacterial-structure-fission-native-candidate-v1';PREL=PREP.relative_to(ROOT)
A=OWN.parent/'biologie-q1-bacterial-structure-fission-current-independent-d-a-v1'
B=OWN.parent/'biologie-q1-bacterial-structure-fission-current-independent-d-b-v1'
ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1';OUT=ISO/PREL/'native-finalbook'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
guards=[(PREP/'author-native-candidate.final.freeze.json','c214e20716f5402e1ba744359f73ac4f8d298ab5039bc6b7e9857dbe9d45837b'),(A/'final.freeze.json','7f74304bf1aa0266f9ef7e389faf56c946207e8c6b3acce0b53e8167e799d3e7'),(B/'independent-review.final.freeze.json','fc4fc370eb57acd6dfd62272d41c8cb8e78b3b8cc57e67707a92b4b460a1c657')]
for p,digest in guards:
 assert sha(p)==digest
 for f in read(p)['files']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
for row in read(PREP/'prepared-inputs.freeze.json')['files']:
 assert sha(ROOT/row['preparedPath'])==row['sha256'].removeprefix('sha256:') and sha(ISO/row['path'])==row['sha256'].removeprefix('sha256:')
assert sha(OUT/'bundle/book-model.json')==sha(PREP/'native-finalbook/bundle/book-model.json')
copies=[];pairs=[]
for source,lane in [(A,'round-a'),(B,'round-b')]:
 for p in sorted((source/'results').glob('*')):
  dst=OUT/lane/'results'/p.name
  if dst.exists():assert sha(dst)==sha(p)
  else:shutil.copy2(p,dst)
  copies.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'copiedScratchPath':str(dst.relative_to(ISO))})
 rows=[json.loads(x) for p in (source/'results').glob('*.records.jsonl') for x in p.read_text().splitlines()];pairs.append({x['goalId']:x for x in rows})
ids=read(PREP/'batch.config.json')['goalIds'];assert len(ids)==3 and pairs[0].keys()==pairs[1].keys()==set(ids)
for gid in ids:
 a,b=pairs[0][gid],pairs[1][gid];assert a['decision']==b['decision']=='keep'
 for key in ['goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','bookDigest','bundleFingerprint']:assert a[key]==b[key]
reason={
'7c6bf0cc':('Beide aktuellen unabhängigen Runden bestätigen nur die neue Bakterienbau-Nachfolger-/Seitenbindung des unveränderten Zelltypenvergleichs. Beobachteter Lichtmikroskopbefund und ergänzendes Modell bleiben getrennt. Gültiges bestehendes P und gutes PNG bleiben unverändert; kein neuer fachlicher Abschluss.','Both current independent rounds confirm only the bacterial-structure successor/page binding of the unchanged cell-type comparison. Observed light-microscope evidence and supplementary models stay distinct. Preserve existing P and good PNG; no new scientific completion.'),
'5b2571d9':('Beide aktuellen unabhängigen Runden bestätigen den gegebenen prokaryotischen Bauplan mit genetischem Material ohne membranumhüllten Kern und ausdrücklich möglichen Plasmiden. Vermehrung bleibt im getrennten Begleiter erhalten. Direkte Zelltypen-Voraussetzung, tatsächliche aktuelle Seiten/PNG und partielle originale Länderquellen tragen diesen begrenzten Scope; kein ganzer Sammeloperatorabschluss.','Both current independent rounds confirm the supplied prokaryotic plan with genetic material outside a membrane-bound nucleus and explicitly optional plasmids. Reproduction is preserved in a separate companion. The cell-type prerequisite, actual current pages/PNG and partial official source components support this bounded scope, not entire umbrella operators.'),
'49dbe8fa':('Beide aktuellen unabhängigen Runden bestätigen die Erklärung einer gegebenen Kopie–Verteilung–Trennung-Folge ohne Kernmitose oder vollständige molekulare Replikationskompetenz. Die Modellhilfe bleibt in DE/EN erhalten; optionale Zählillustration ist keine Populationsleistung. Tatsächliche aktuelle Seiten/PNG, Bakterienbau-Voraussetzung und partielle Länderquellen passen; TH-Vermehrung, Kulturkurven und ganze Quellenziele bleiben offen.','Both current independent rounds confirm explanation of a supplied copying–partitioning–separation sequence without nuclear mitosis or full molecular replication. DE/EN preserve model support; optional counting is not population performance. Actual pages/PNG, the bacterial-structure prerequisite and partial official source components fit; TH reproduction, culture curves and whole source goals remain open.')}
author={'schemaVersion':1,'manifestId':'biologie-q1-bacterial-structure-fission-current-reviewed-20261005-v2','synthesizedBy':'Codex technical integrator of existing independent current A/Root-B evidence; no new scientific review claim','decisions':[{'goalId':gid,'resolutionDecision':'keep_current' if gid.startswith('7c6b') else 'current_after_revision','evidenceRound':'second','rationaleDe':reason[gid[:8]][0],'rationaleEn':reason[gid[:8]][1]} for gid in ids]}
write(OUT/'synthesis-authoring.json',author)
write(OWN/'actual-existing-independent-pair-synthesis.receipt.json',{'at':datetime.now(timezone.utc).isoformat(),'existingCurrentPairFiles':copies,'actualSixExistingRationalesRead':True,'allThreeCompleteCurrentDEENAndNativeBindingsEqual':True,'specificSynthesisAuthoring':author,'newIndependentScienceReviews':0,'unresolvedSemanticDissent':[],'humanApproval':False,'activeWrites':0})
terminal=[]
def run(name,args):
 s=datetime.now(timezone.utc).isoformat();p=subprocess.run(args,cwd=ISO,capture_output=True);e=datetime.now(timezone.utc).isoformat();o=OWN/(name+'.stdout.txt');err=OWN/(name+'.stderr.txt');o.write_bytes(p.stdout);err.write_bytes(p.stderr);terminal.append({'command':args,'cwd':str(ISO),'startedAt':s,'completedAt':e,'actualExitCode':p.returncode,'stdoutPath':str(o.relative_to(ROOT)),'stdoutSHA256':sha(o),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err)});write(OWN/'native-current-three-synthesis.actual.receipt.json',{'commands':terminal,'activeWrites':0,'humanApproval':False});print(name,p.returncode,p.stdout.decode()[:500],p.stderr.decode()[:1200],flush=True);assert p.returncode==0
cfg=str(PREL/'batch.config.json');out=str(PREL/'native-finalbook')
run('dual-three-summarize',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write'])
run('three-synthesis-manifest',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',out+'/synthesis-authoring.json','--write'])
run('three-resolutions-materialize',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',out+'/synthesis-decisions.json','--write'])
run('three-index-materialize',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write'])
run('three-index-current-check',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg])
shutil.copytree(OUT,OWN/'native-finalbook')
for p,digest in guards:
 assert sha(p)==digest
 for f in read(p)['files']:assert sha(ROOT/f['path'])==f['sha256'].removeprefix('sha256:')
write(OWN/'existing-scientific-author-and-review-freezes-preserved.actual.json',{'guards':[{'path':str(p.relative_to(ROOT)),'sha256':d,'files':len(read(p)['files'])} for p,d in guards],'allExact':True,'scratchRoot':str(ISO),'newFullRepositoryCopy':False,'humanApproval':False,'activeWrites':0})
print(json.dumps({'nativeD3Complete':True,'newScientificClosureCandidates':2,'existingContextBindingRestorationCandidates':1,'activeWrites':0,'humanApproval':False}))
