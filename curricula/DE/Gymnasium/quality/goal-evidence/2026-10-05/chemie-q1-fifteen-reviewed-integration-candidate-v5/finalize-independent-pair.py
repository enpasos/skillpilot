# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil,os

ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);BASE=OWN.parent
PREP=BASE/'chemie-q1-fourteen-current-native-candidate-v4';PREL=PREP.relative_to(ROOT)
SOURCE_ISO=ROOT/'tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v4'
ISO=SOURCE_ISO
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
read=lambda p:json.loads(Path(p).read_text())
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
frozen=[(PREP/'prepared-current-inputs.final.freeze.json','8074044abb2e695f7c98fd61251d5084fe45f1f664c224083f9b1160736cb5ea'),(BASE/'chemie-q1-fifteen-current-independent-d-a-v2/final.freeze.json','e1cab21e6bb397ecef1f40e5e3fc8f53a42bcdec8c96b52294b4d25f316fa702'),(BASE/'chemie-q1-fifteen-current-independent-d-b-v4/independent-review.final.freeze.json','06556d9012ae0ab095a7caa432fd94a186ef05ad6ead137013a52cc94dce3df9')]
for p,d in frozen:
 assert sha(p)==d,p
 for r in read(p)['files']:assert sha(ROOT/r['path'])==r['sha256'].removeprefix('sha256:'),r['path']
assert ISO.exists() and not (OWN/'native-finalbook').exists()
# Existing physically isolated scratch is disposable; all repo freezes remain exact.
# Native batch keeps its original verified config/path; new results export to OWN.
OUT=ISO/PREL/'native-finalbook';copied=[];pair={}
for letter,directory in [('a','chemie-q1-fifteen-current-independent-d-a-v2'),('b','chemie-q1-fifteen-current-independent-d-b-v4')]:
 dest=OUT/('round-'+letter)/'results';assert not list(dest.iterdir())
 for s in sorted((BASE/directory/'results').iterdir()):
  assert s.name.endswith(('.records.jsonl','.run.json'));shutil.copy2(s,dest/s.name);copied.append({'sourcePath':str(s.relative_to(ROOT)),'isolatePath':str((dest/s.name).relative_to(ISO)),'sha256':sha(s)})
 pair[letter]={r['goalId']:r for f in dest.glob('*.records.jsonl') for r in [json.loads(l) for l in f.read_text().splitlines()]}
ids=read(PREP/'batch.config.json')['goalIds'];assert list(pair['a'])==ids and list(pair['b'])==ids
for gid in ids:
 a,b=pair['a'][gid],pair['b'][gid]
 for k in ['goalId','goalFingerprint','pageFingerprint','bookDigest','bundleFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
  assert a[k]==b[k],(gid,k)
 assert a['decision']==b['decision']=='keep'

# Substantive reconciliation of both actual complete records. Distinct cases
# are compatible evidence variants, never an approval by matching votes.
reasons={
 'a3788e40':('Beide Runden begrenzen die Stoffklassen-Erkennung auf COOH, saure Beobachtung und Reihendarstellung; keine exklusive Säureidentifikation. Nomenklatur/Eigenschaften bleiben eigene Begleiter.','Both rounds bound compound-class recognition to COOH, acidic observations and series representations without exclusive identification; naming and property companions remain separate.'),
 'ca216bc6':('Beide Runden erklären Säurestärke durch konjugierte Base, eine delokalisierte Carboxylatladung und getrennte induktive Effekte; Substitutionsbeispiele sind kompatibel. Das exakte aktuelle PNG bleibt erhalten.','Both rounds explain acidity through the conjugate base, one delocalised carboxylate charge and distinct inductive effects; substitution examples are compatible. Preserve the exact current PNG.'),
 '70b34ae7':('Der konkrete englische Titelbefund ist von beiden Runden an tatsächlichem aktuellem PDF/HTML und DE/EN aufgelöst. Formation/condensation, zwischenmolekulare Eigenschaften und Einsatz gehören zum jetzigen gleichwertigen Titel; beide P-Fälle bleiben exakt. HE-Ganzgruppen-Nomenklatur/Mechanismus-HOLDs bleiben offen.','Both rounds resolve the English-title defect against actual current PDF/HTML and DE/EN. Formation, condensation, intermolecular properties and uses match the corrected equivalent title; both P cases remain exact. Whole HE-group naming and mechanism HOLDs remain open.'),
 '667bc303':('Beide Runden erhalten bedingungsabhängige saure Reversibilität versus praktisch einseitige alkalische Carboxylatbildung. Produktbilanz und Alltagserklärung sind derselbe Reaktionszusammenhang, keine LK-Mechanismus-Mitfreigabe.','Both rounds preserve condition-dependent acidic reversibility versus effectively one-way alkaline carboxylate formation. Product balance and everyday explanations assess the same relation without releasing the separate advanced mechanism.'),
 '4da0839d':('Beide Runden bestätigen den LK-Acylmechanismus mit richtig geladener tetraedrischer Zwischenstufe und Protonenübertragung. Die aktuelle exakte HE-Mechanismusquelle ersetzt die falsche Di-/Trisäurebindung.','Both rounds confirm the advanced acyl mechanism, correctly charged tetrahedral intermediate and proton transfer. The exact current HE mechanism clause replaces the false di/tricarboxylic-acid binding.'),
 '9d97f628':('Beide Runden prüfen Alkoholrestetausch, Planung und Gleichgewichtsbeurteilung einschließlich neuer Bedingungen. HE Q2.1 LK ist der Quellenanker; Q1-Navigation wird nicht als normative Q1-Pflicht ausgegeben.','Both rounds assess alcohol-residue exchange, planning and equilibrium reasoning under changed conditions. HE Q2.1 advanced level is the source anchor; Q1 navigation is not claimed as a normative Q1 requirement.'),
 '6765f741':('Beide Runden erhalten die tatsächlich erforderliche betreute Verseifungsdurchführung, Glycerin/3 Fettsäuresalze und Aussalzen als Trennung. Neue Fettfälle sind kompatibel. P bleibt E1/G1 needs_human_review; keine echte Praxis wird aus dem PNG abgeleitet.','Both rounds retain required actual supervised saponification, glycerol and three fatty-acid salts, and salting out as separation. Different fat cases are compatible. P remains E1/G1 needs_human_review; an image does not establish practical performance.'),
 '6966df95':('Beide Runden verbinden Amphiphilie, Orientierung, Micellen/Grenzfläche, Emulgieren und Oberflächenspannung. Schematische Öltröpfchen sind keine maßstäbliche gewöhnliche Micelle; der pH-Brønsted-Begleiter bleibt separat.','Both rounds connect amphiphilicity, orientation, micelles/interfaces, emulsification and surface tension. Schematic oil droplets are not scale depictions of ordinary micelles; the pH/Brønsted companion remains separate.'),
 'e874ee60':('Beide Runden erhalten den tatsächlichen BY-SekI-Vergleichs-/Bewertungsoperator. Kopfgruppen/Anwendungsdaten tragen bedingte Vor- und Nachteile; keine universelle Synthetik-/Bioabbaubarkeitseigenschaft. Eigenes aktuelles P ist extern vorhanden, auch wenn A wegen Null im Buchfeld create empfiehlt.','Both rounds retain the actual BY lower-secondary compare/evaluate operator. Head groups and application data support conditional advantages and disadvantages, without universal synthetic-surfactant or biodegradability properties. Current P exists externally even though A recommends create from the null book field.'),
 '1837690e':('Beide Runden prüfen einen kontrollierten Waschfaktoren-Zusammenhang samt Dispergierung/Micellen und Kalkseifen. Neue Datenfälle sind kompatibel, keine unbegrenzte Temperatur-/Konzentrations- oder Schaumgarantie.','Both rounds assess a controlled washing-factor relation including dispersion/micelles and insoluble soaps. New data cases are compatible; there is no unlimited temperature, concentration or foam guarantee.'),
 '8a491e3b':('Beide Runden bestätigen temporäre/permanente/Gesamthärte und Ionenaustausch, das calciumbezogene Carbonatbeispiel statt universellem MgCO3. Der frühere Titelclip ist am tatsächlichen aktuellen Bild nicht reproduzierbar.','Both rounds confirm temporary/permanent/total hardness and ion exchange, using a calcium carbonate example rather than universal MgCO3. The earlier title-clipping concern is not reproduced in actual current views.'),
 'e9ea1606':('Beide Runden begrenzen die Kompetenz auf Abbaubarkeitskriterien und trennen Primärwirkungverlust von geeigneten Endpunkten/Umwandlung. Testbedingungen und Grenzen bleiben nötig; spezielle LK-Wege und Rechtsfreigabe werden nicht mit behauptet.','Both rounds limit the competence to biodegradability criteria, distinguishing primary functional loss from suitable endpoints and transformation. Conditions and limits remain necessary; advanced pathways and legal clearance are not claimed.'),
 '33e845cc':('Beide Runden verbinden historische/moderne Wirkprinzipien mit konkreten kontextabhängigen Risiken; modern ist keine Sicherheitsgarantie. Besondere Sorbin-/Redox- oder quantitative Quellen-HOLDs bleiben offen.','Both rounds relate historical/modern operating principles to concrete contextual risks; modern is no safety guarantee. Specific sorbate, redox or quantitative source HOLDs remain open.'),
 'db66635f':('Beide Runden erhalten tatsächlichen qualitativen betreuten Nachweis, Reduktion des Reagenzes durch Elektronendonator-Ascorbat und Matrixgrenzen. Iod-/DCPIP-Fälle sind passende Varianten; keine Konzentrationsbestimmung oder behauptete Erprobung.','Both rounds retain actual supervised qualitative testing, reagent reduction by electron-donating ascorbate and matrix limits. Iodine and DCPIP are suitable variants; no concentration determination or trial is claimed.'),
 'bd36dc58':('Beide Runden reparieren ausschließlich die bestehende aktuelle Seiten-/Quellen-/Voraussetzungsbindung. Die gültige unveränderte Di-/Trisäure-Strukturkompetenz und P/V bleiben erhalten, kein neuer fachlicher Abschluss.','Both rounds repair only the current page/source/prerequisite binding. Preserve the valid unchanged di/tricarboxylic-acid structure competence and P/V; this is not a new scientific completion.')}
author={'schemaVersion':1,'manifestId':'chemie-q1-fifteen-current-reviewed-synthesis-20261005-v5','synthesizedBy':'Codex technical Q1 integration synthesis after both actual complete current independent records were read','decisions':[{'goalId':gid,'resolutionDecision':'keep_current' if gid.startswith('bd36') else 'current_after_revision','evidenceRound':'second','rationaleDe':reasons[gid[:8]][0],'rationaleEn':reasons[gid[:8]][1]} for gid in ids]}
write(OUT/'synthesis-authoring.json',author)
write(OWN/'both-current-rounds-read-and-substantively-compared.actual.receipt.json',{'reviewedAt':datetime.now(timezone.utc).isoformat(),'actualSourcePairFiles':copied,'specificBilingualSynthesisAuthoring':author,'all15CurrentBindingFieldsExactlyEqual':True,'unresolvedSemanticDissent':[],'externalPCreateRecommendationReconciled':'Book field null truthfully; actual current 14 profiles plus existing bd36 external and natively current. A create recommendation does not imply missing provided P or human approval.','humanApproval':False,'activeWrites':0})
terminal=[]
def run(name,args):
 s=datetime.now(timezone.utc).isoformat();p=subprocess.run(args,cwd=ISO,capture_output=True);e=datetime.now(timezone.utc).isoformat();o=OWN/(name+'.stdout.txt');r=OWN/(name+'.stderr.txt');o.write_bytes(p.stdout);r.write_bytes(p.stderr);terminal.append({'name':name,'args':args,'cwd':str(ISO),'startedAt':s,'completedAt':e,'actualExitCode':p.returncode,'stdoutPath':str(o.relative_to(ROOT)),'stdoutSHA256':sha(o),'stderrPath':str(r.relative_to(ROOT)),'stderrSHA256':sha(r)});write(OWN/'native-synthesis-finalization.actual.receipt.json',{'commands':terminal,'activeWrites':0,'humanApproval':False});print(json.dumps({'command':name,'exitCode':p.returncode,'stdout':p.stdout.decode()[:500],'stderr':p.stderr.decode()[:1500]}),flush=True);assert p.returncode==0
cfg=str(PREL/'batch.config.json');out=str(PREL/'native-finalbook')
run('dual-summarize',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write'])
run('synthesis-manifest-generate',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',out+'/synthesis-authoring.json','--write'])
run('fifteen-resolutions-materialize',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',out+'/synthesis-decisions.json','--write'])
run('fifteen-final-index-materialize',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write'])
run('fifteen-final-index-check',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg])
shutil.copytree(OUT,OWN/'native-finalbook');idx=read(OWN/'native-finalbook/resolution-index.json');assert len(idx['resolutions'])==15 and all(x['strictDescriptionComplete'] for x in idx['resolutions'])
for p,d in frozen:
 assert sha(p)==d
 for r in read(p)['files']:assert sha(ROOT/r['path'])==r['sha256'].removeprefix('sha256:')
write(OWN/'finalized-native-tree.actual.receipt.json',{'nativeFinalIndexSHA256':sha(OWN/'native-finalbook/resolution-index.json'),'strictCurrentDescriptionCandidates':15,'newScientificClosureCandidates':14,'existingBindingRepairCandidates':1,'sourcePhysicalDirectory':str(OUT),'isolationRoot':str(ISO),'historicalFrozenPrepAndAAndBPreserved':True,'activeWrites':0,'activeStrictNetIncrease':0,'humanApproval':False})
