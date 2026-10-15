# SPDX-License-Identifier: Apache-2.0
import json,hashlib,datetime,ast
from pathlib import Path
REPO=Path.cwd();R=Path(__file__).resolve().parents[1];REL=str(R.relative_to(REPO));seal=R/'FILES.finite-whole-material-author.seal.json';assert not seal.exists()
def j(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(REPO) if p.is_absolute() else p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,x):
 p=R/n;assert not p.exists(),p;p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def verify(row):
 a=bind(REPO/row['path']);assert a['sha256']==row['sha256'],row['path']
 if 'bytes'in row:assert a['bytes']==row['bytes'],row['path']
input=j(R/'inputs/final-author-physical-inputs.json');f=j(REPO/input['FIRST']['path'])
for x in f['files']:verify(x)
for k in ['canonical','semantic','criteria','finalExternalVSelector','finalExternalVSeal']:verify(input[k])
for x in j(REPO/input['finalExternalVSeal']['path'])['files']:
 candidate=REPO/x['path']
 if not candidate.is_file():
  x={**x,'path':str((Path(input['finalExternalVSeal']['path']).parent/x['path']))}
 verify(x)
checks=j(R/'checks/ACTUAL.author-material32-numeric-and-byte-checks.json');pc=j(R/'checks/PROFILE16.closed-schema-and-unmodified-normal-helper.actual.json');assert checks['pass'] and pc['pass']
profiles=R/'candidate/sixteen-unreviewed-E0G0.author-profiles.jsonl';rows=[json.loads(l) for l in profiles.read_text().splitlines()];assert len(rows)==16
casepath=R/'materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json';cases=j(casepath)['cases'];assert len(cases)==32
write('checks/COMMANDS.author-bind-and-check.actual.json',{'role':'Actual completed author helper executions; no review campaign, fullbuild or central run','commands':[{'argv':['app/node_modules/.bin/tsx',REL+'/scripts/bind_unreviewed_E0G0_profiles.mts'],'cwd':'/home/enpasos/projects/skillpilot','exitCode':0,'actualStdout':{'pass':True,'rawAuthorProfiles':16,'E0':16,'G0':16,'schemaErrors':0,'normalSemanticErrors':0,'independentApprovals':0,'newStrict':0},'output':bind(R/'checks/PROFILE16.closed-schema-and-unmodified-normal-helper.actual.json')},{'argv':['python',REL+'/scripts/check_actual_material_and_inputs.py'],'cwd':'/home/enpasos/projects/skillpilot','exitCode':0,'actualStdout':{'pass':True,'numericResults':41,'wholeCases':32,'profilesE0G0':16,'independentApprovals':0},'output':bind(R/'checks/ACTUAL.author-material32-numeric-and-byte-checks.json')}],'actualFullCentralRuns':0,'nativeBuilds':0,'independentVotes':0})
# Stable scientific inputs are repository-relative own snapshots and original physical sources.
# The temporary9.55MBtechnical routing is only historical provenance, not a required review input.
selected=[
 'inputs/sixteen-whole-final-contexts.exact.json','inputs/fifteen-final-assets.exact-bindings.json',
 'materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json','materials/thirty-two-blank-future-observation-records.json',
 'candidate/sixteen-unreviewed-E0G0.author-profiles.jsonl','science/sixteen-understanding-specifications.final-manual.author.json',
 'science/FIRST.sixteen-whole-material-understanding.author.json','science/FIRST.13838147-bounded-description-author-proposal.json','science/FILES.FIRST-author-science.seal.json',
 'sources/eighty-seven-whole-passages.exact.json','sources/whole-source-cells-and-canonical-partner-unions.exact.json',
 'sources/targeted-official-HE-BW-whole-pages.read.json','sources/AUTHOR.exact-source-course-and-model-boundaries.json','sources/targeted-official-science-web-verification.json',
 'checks/CAS.three-numerical-author-corrections.whole-cases.json','checks/CAS.manual-whole-prose-successor.actual.json','checks/MANUAL.successor-scope-and-failed-format-history.json',
 'checks/PROFILE16.closed-schema-and-unmodified-normal-helper.actual.json','checks/ACTUAL.author-material32-numeric-and-byte-checks.json','checks/COMMANDS.author-bind-and-check.actual.json']
source=j(R/'sources/whole-source-cells-and-canonical-partner-unions.exact.json');assets=j(R/'inputs/fifteen-final-assets.exact-bindings.json');external=[]
for k in ['canonical','semantic','criteria','finalExternalVSelector','finalExternalVSeal']:external.append(input[k])
claim=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-current402-all182-open-claims-root-20261012-v2/claims/equilibrium-redox-kinetics-16.current402.claim.config.json');external.append(bind(claim))
for route in source['routes']:external.extend([route['mapping'],route['extraction']])
external+=source['primaryDocuments'];external+=[{k:r[k] for k in ['path','sha256','bytes']} for r in assets['assets']]
external=list({r['path']:r for r in external}.values())
for r in external:verify(r);assert not r['path'].startswith('tmp/');assert not (REPO/r['path']).is_symlink()
readme='''# Gleichgewicht, Redox und Kinetik: 16 Autorenkandidaten\n\nDieses endliche Paket bearbeitet genau die 16 IDs des vorhandenen equilibrium-redox-kinetics-16-Claims. Es enthält **32 vollständige DE/EN-Fälle**, Daten, ganze Lösungswege, 96 konkrete Bewertungszeilen, Transferbedingungen und 32 leere Zukunftsprotokolle. **16 Profile sind ausdrücklich E0/G0 und ai_candidate/needs_human_review.** Es gibt keine unabhängigen D/P/A/M/V-Stimmen dieses Autors und keine Integration.\n\n## Verbindlicher Materialstand\n\nAusgewählt ist ausschließlich `materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json`. Die schlecht segmentierten automatischen Varianten bleiben unselektierte Fehlversuchshistorie. Der Nachfolger wurde aus dem Original in ganzen Sätzen von Hand geschrieben. Das ganze Vorher/Nachher steht im Prosa-CAS. Drei echte Rechenkorrekturen stehen getrennt im wissenschaftlichen Ganzfall-CAS: Metall/Hydroxid-Achsenabschnitt −0,05546 V; K ≈ 1,54·10^37 aus ungerundetem Logarithmus; reversible Wasserspannung gerundet 1,22884 V.\n\n## Aktueller Kontext\n\nDie endgültige Canonical560-Fassung e189 und Semantic560-Fassung 597c sind physisch gebunden. Nur138 erhielt den begründeten, gesondert vorgelegten Beschreibungsvorschlag und das extern erstellte finale PNG. Die anderen559 ganzen Ziele und die Struktureigenschaften bleiben exakt. Vierzehn alte JPGs bleiben unverändert; die neue138-PNG wurde vom Autor tatsächlich gesehen und besitzt eine gesonderte unabhängige V1. Pourbaix hat weiterhin kein Bild. Der Autor erzeugt keine V-Stimme und bearbeitet keine Bilddatei.\n\n## Quellen und Grenzen\n\nGelesen wurden die ganzen16 Ziele samt Prärequisiten und Partnerkompetenzen sowie87 ganze bereitgestellte Passagen, einschließlich50 mit ausschließlich `text`. Vollständige gezielte Primärseiten aus HE und BW ergänzen diese Lesung;24 Primärdateien sind gebunden, aber nicht alle24 Dokumente vollständig gelesen. Eine fehlende `rawText`-Eigenschaft bedeutet keinen Quellverlust.\n\nFür Kp/Kc, van’t Hoff, Mehrfachgleichgewichte, Pourbaix sowie Elektrolyse/Gleichgewicht fehlt im ausgewählten aktuellen Routing eine direkte Mappingkante. Das beweist keine curriculare Abwesenheit und wird nicht als Quellen- oder Kursfreigabe umgedeutet. Breite Partnerpassagen liefern nur die jeweilige Kompetenzklausel. Länder-, GK/LK-, Quellen- und Atomizitätsfragen bleiben für ihre eigenen Prüfungen offen. Insbesondere verlangt HE Nernst-Konzentrationsrechnungen ohne pH-/Temperaturabhängigkeit; eine bereitgestellte pH-Variation ist als Transfer begrenzt.\n\n## Tatsächliche Prüfungen\n\nDas geschlossene normale Profilschema und die unveränderten Produktionshelfer prüfen16 rohe Autorenprofile ohne Fehler.41 numerische Ergebnisse sowie explizite Atom-/Ladungsbilanzen wurden geprüft. Die aktuellen kanonischen Objekte, semantischen Bindungen, Quellrouten,24 Primärdateien und15 Bildassets wurden bytegenau gebunden. Keine native Vollerstellung und kein Zentralbericht liefen in diesem Auftrag.\n\nDie Fälle sind zukünftige Diagnoseangebote. Modellmessungen, Lösungen und leere Protokolle beweisen weder Lernendenleistung noch Unterrichts- oder Laborversuche. Die zwei Design-Demonstrationen sind keine starre Aufgabenquote für Mastery. Wo eine Durchführung verlangt ist, nennen die Fälle sichere kontrollierte Handlungen und künftig beobachtbare Originalprotokolle. Frühere menschliche Erprobung ist keine M7-Voraussetzung.\n\nDie eigenen Lernmaterialien stehen unter CC-BY-4.0, technische Skripte unter Apache-2.0 gemäß Repositoryaufteilung. Fremde Quellen und Bildprovenienz behalten ihre Grenzen; keine neue Rechtefreigabe wird behauptet.\n\nDer relative Finalselector nennt alle wissenschaftlichen Eingaben. Das9,55-MB-Routing im temporären Arbeitsbereich bleibt bloß frühere technische Herkunft; die eigentlichen Ziele, Fälle, Quellpassagen, Partner und physischen Originalquellen sind stabil im Repository gebunden. Vor späterer technischer Native16-Vorbereitung und zwei frischen Reviews prüft Root dieses Paket. **STOP nach Selector und Siegel.**\n'''
(R/'README.final-author-candidate.md').write_text(readme)
selector={'schemaVersion':1,'selectedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Final whole-material AUTHOR candidate for exactly16 equilibrium/redox/kinetics goals; no independent reviews','goalIds':input['goalIds'],'claim':bind(claim),'canonical560':input['canonical'],'semantic560':input['semantic'],'scientificReviewInputs':[bind(R/p) for p in selected],'externalPhysicalInputBindings':external,'README':bind(R/'README.final-author-candidate.md'),'selectedWholeCases':32,'selectedRawProfiles':16,'profileEvidenceLevel':'E0','maximumClaimScope':'G0','automaticSpacingVariantsSelected':False,'sourceRouteGapsRemain':j(R/'sources/AUTHOR.exact-source-course-and-model-boundaries.json')['goalsWithoutSelectedDirectNamedRoute'],'missingVisualizationGoalIds':assets['missingImageGoalIds'],'independentV1IsExternalOnly':input['finalExternalVSelector'],'newIndependentScientificVotes':0,'newDPAApprovals':0,'HumanApproval':False,'learnerOrLabTrials':False,'sourceCourseApproval':False,'wholeCourseM7':False,'activeWrites':0,'gitWrites':0,'nativeFullBuilds':0,'centralRuns':0,'temporaryRoutingIsRequiredScientificReviewInput':False,'nextAction':'STOP. Parent inspection before separate technical Native16 preparation and fresh independent D reviews.'}
sp=R/'INPUTS.final-equilibrium-redox-kinetics16-whole-material.author-selector.json';write(sp.name,selector)
# JSON/JSONL/Python parsing is a finite transport check, not a further scientific vote.
parsed={'json':0,'jsonl':0,'python':0}
for p in R.rglob('*'):
 if not p.is_file():continue
 if p.suffix=='.json':j(p);parsed['json']+=1
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
  parsed['jsonl']+=1
 elif p.suffix=='.py':ast.parse(p.read_text());parsed['python']+=1
files=[bind(p) for p in sorted(R.rglob('*')) if p.is_file() and not p.is_symlink() and p!=seal]
write(seal.name,{'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Finite unreviewed16whole-material author candidate; exact originals and failed-format history retained','root':REL,'fileCount':len(files),'totalBytes':sum(r['bytes'] for r in files),'files':files,'finalSelector':bind(sp),'parsedFilesBeforeSeal':parsed,'newIndependentVotes':0,'DPAApprovals':0,'HumanApproval':False,'newStrictClosures':0,'activeWrites':0,'finite':'STOP; parent inspection required'})
for r in j(seal)['files']:verify(r)
for r in j(sp)['externalPhysicalInputBindings']:verify(r)
print(json.dumps({'selector':bind(sp),'seal':bind(seal),'files':len(files),'bytes':sum(r['bytes'] for r in files),'selectedCases':32,'E0G0Profiles':16,'STOP':True},indent=2))
