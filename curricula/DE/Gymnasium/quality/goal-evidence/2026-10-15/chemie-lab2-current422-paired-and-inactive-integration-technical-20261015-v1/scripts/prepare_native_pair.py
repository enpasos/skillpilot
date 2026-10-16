# SPDX-License-Identifier: Apache-2.0
"""Bind genuine original D2 rounds; only batch config address/digest transport."""
import copy,hashlib,json,re,shutil
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-integration.seal.json').exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
PREP=E+'chemie-lab2-corrected-material-current422-native-preparation-technical-20261015-v1'
BASE=E+'chemie-current422-source3-lab1-bounded-inactive-integration-technical-20261015-v1'
A=E+'chemie-lab2-current422-corrected-native-independent-a-20261015-v1'
B=E+'chemie-lab2-current422-corrected-native-independent-b-20261015-v1'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):
 q=OWN/p;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def cp(src,dst):
 q=OWN/dst;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/src,q);assert q.read_bytes()==(ROOT/src).read_bytes()
for d in ['checks','config','candidate','science-originals']: (OWN/d).mkdir(exist_ok=True)
# Snapshot the same protected inputs afresh; no active data are changed.
protected=read(BASE+'/checks/PROTECTED.active-inputs.before.json')
protected['files']=[bind(r['path']) for r in protected['files']]
write('checks/PROTECTED.active-inputs.before.json',protected)
assert not (OWN/'native-two').exists()
shutil.copytree(ROOT/PREP/'native-two',OWN/'native-two')
for p in (ROOT/A/'D/results').iterdir():cp(p.relative_to(ROOT).as_posix(),'native-two/round-a/results/'+p.name)
for p in (ROOT/B/'round-b').rglob('*'):
 if p.is_file():cp(p.relative_to(ROOT).as_posix(),'native-two/round-b/'+p.relative_to(ROOT/B/'round-b').as_posix())
cfg=read(PREP+'/config/native2.normal-prepare-only.config.json');cfg['outputDirectory']=REL+'/native-two'
cfgpath=REL+'/config/native2.exact-original-bundle-transport.config.json';write('config/native2.exact-original-bundle-transport.config.json',cfg)
original=read(PREP+'/native-two/batch-manifest.json');transport=copy.deepcopy(original)
transport['configPath']=cfgpath;transport['configDigest']=bind(cfgpath)['sha256']
write('native-two/batch-manifest.json',transport)
assert {k:v for k,v in transport.items() if k not in ['configPath','configDigest']}=={k:v for k,v in original.items() if k not in ['configPath','configDigest']}
copies=[]
for p in (ROOT/PREP/'native-two').rglob('*'):
 if p.is_file() and p.name!='batch-manifest.json':
  target=REL+'/native-two/'+p.relative_to(ROOT/PREP/'native-two').as_posix()
  assert (ROOT/target).read_bytes()==p.read_bytes();copies.append({'source':bind(p.relative_to(ROOT).as_posix()),'copy':bind(target)})
for label,src in [('a',A+'/D/results'),('b',B+'/round-b/results')]:
 for p in (ROOT/src).iterdir():
  if p.is_file():
   target=REL+'/native-two/round-'+label+'/results/'+p.name
   assert p.read_bytes()==(ROOT/target).read_bytes();copies.append({'source':bind(p.relative_to(ROOT).as_posix()),'copy':bind(target)})
cp(A+'/P/two-current422-positive.E1G1.ai-candidates.jsonl','science-originals/P2.original-independent-a.E1G1.jsonl')
pc=read(A+'/P/positive-two.current422.config.json');pc['landscapePath']='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';pc['semanticKindLedgerPath']='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';pc['reviewPath']=REL+'/science-originals/P2.original-independent-a.E1G1.jsonl'
write('config/P2.original-independent-a.normal-address.config.json',pc)
write('CAS.native2.config-address-only-and-exact-original-copies.json',{'role':'Informed technical transport, zero new review votes','wholeBefore':original,'wholeAfter':transport,'allowedMetadataFields':['configPath','configDigest'],'unchangedNativeCopies':copies,'P2Original':bind(A+'/P/two-current422-positive.E1G1.ai-candidates.jsonl'),'P2ExactCopy':bind(pc['reviewPath']),'originalPConfig':bind(A+'/P/positive-two.current422.config.json'),'normalAddressPConfig':bind(REL+'/config/P2.original-independent-a.normal-address.config.json'),'newScientificVotes':0})
decisions=[
 {'goalId':cfg['goalIds'][0],'resolutionDecision':'keep_current','evidenceRound':'second','rationaleDe':'Informierte technische Synthese der unveränderten echten A/B-Erstprüfungen, keine neue unabhängige Stimme: Beide behalten das ganze Ziel bei. Die vollständigen Salz- und Eisenfälle operationalisieren Rohstoff, Gewinnungsweg und begründete Verwendung. BW verlangt ein ausgewähltes Beispiel; daraus wird kein kumulativer Pflichtkatalog. 90 kg zurückgewonnenes NaCl aus 100 kg Anfangsbestand sind 90 % Rückgewinnung, keine Reinheitsaussage. Die im Fall ausdrücklich erklärte Roheisen/Stahl-Verarbeitung bleibt erforderlich; das vereinfachte bestehende Bild ersetzt sie nicht. A und B enthalten die vollständige fachliche Begründung unverändert in ihren Originalrecords. Ihre KEEP-Entscheidungen erteilen weder Vollquellen-/Kursfreigabe noch P/A/M/V/Human-Voten. Die gesondert später von A erzeugten zwei echten E1/G1-Profile werden separat gebunden.','rationaleEn':'Informed technical synthesis of unchanged genuine A/B first passes, not a new independent vote: both keep the whole goal. Complete salt and iron cases connect raw material, extraction route and justified use. BW asks for one selected example, not a cumulative compulsory inventory. Recovering 90 kg NaCl from an initial 100 kg means 90% recovery, not purity. The explicit pig-iron/steel processing step in the case remains required; the simplified existing image does not replace it. Complete original scientific reasons remain unchanged in both source records. KEEP does not grant whole-source/course clearance or P/A/M/V/human votes. A subsequently produced two genuine E1/G1 profiles, bound separately.'},
 {'goalId':cfg['goalIds'][1],'resolutionDecision':'keep_current','evidenceRound':'second','rationaleDe':'Informierte technische Synthese der unveränderten echten A/B-Erstprüfungen: Beide behalten den ganzen sicheren Isolierungs-/Reinigungs-/Ausbeute-/Reinheitsworkflow bei. Die amtlichen vollständigen BcP-Kontexte und Partnerunion bleiben maßgeblich: cf263 trägt Synthese/Isolierung/Aufarbeitung, 9ace präparative Herstellung und cfa allgemeine Analytik. Das verteilt Operatoren legitim; die Reinheitskontrolle nach 13.4.3 muss trotzdem am selbst hergestellten Präparat erfolgen. Genau das verknüpfen der verpflichtende ganze Fall 06b, Rohprofil und leere eigene Reinheitsakte; 06a allein reicht nicht. 0,30000579 g theoretische ASA, 0,1600 g gereinigte Probe und 82,0513 % Rückgewinnung aus 0,1950 g Teilprobe bleiben verschiedene Größen. 0,4–0,8 % freie Salicylsäure beweisen keine Gesamt-Reinheit; Zweikomponenten-Korrektur nur unter expliziter Annahme. Methodenquelle und eigene Anpassungen sowie Blankprotokolle sind zukünftiger Erwerbs-/Beobachtungsentwurf, keine bereits ausgeführten Lernendenversuche. Die amtliche Lernbereichsauswahl ist kein kumulativer Kurszwang. Ganze Originalbegründungen bleiben in A/B bytegenau erhalten; kein neues P/A/M/V/Human- oder Kursurteil durch die Synthese.','rationaleEn':'Informed technical synthesis of unchanged genuine A/B first passes: both keep the complete safe isolation, purification, yield and purity workflow. Whole official BcP contexts and the partner union remain binding: cf263 carries synthesis/isolation/workup, 9ace preparation and cfa general analysis. Operators may be distributed, while section13.4.3 still requires checking the self-synthesised preparation. Mandatory whole case06b, raw profile and blank own-purity record bind that object; case06a alone does not suffice. Theoretical ASA0.30000579g, purified sample0.1600g and82.0513% recovery from a0.1950g portion remain distinct. Free salicylic acid0.4–0.8% does not establish total purity; a two-component correction requires its explicit assumption. Primary methods, own adaptations and blank protocols design future observable acquisition, not completed learner trials. Official learning-area selection is not a cumulative course requirement. Whole original A/B reasons remain byte-exact; the synthesis adds no P/A/M/V/human or course judgement.'}
]
write('native-two/synthesis-authoring.json',{'schemaVersion':1,'manifestId':'chemie-lab2-current422-genuine-paired-keep-technical-20261015-v1','synthesizedBy':'Codex informed technical integrator after genuine original A+B first-pass seals; no new independent review or human approval','decisions':decisions})
mp=read(PREP+'/checks/REBUILD.current422-lab2-native.physical-map.json');mp['executionHost']='tmp/chemie-m7-resumed-20261015/lab2-paired-native-current422-host-v1';mp['role']='Exact original native D2 pairing only; no new prepare/render or scientific votes';mp['buildReceiptPath']='checks/REBUILD.actual-native-pair-host.json'
modules={r['path'] for r in mp['stockPhysicalModules']}
pending=['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','app/scripts/materializeGoalDescriptionRolloutResolutions.ts']
while pending:
 p=pending.pop()
 if p in modules:continue
 modules.add(p)
 for imp in re.findall(r"(?:from\s*|import\s*)['\"]([^'\"]+)['\"]",(ROOT/p).read_text()):
  if imp.startswith('.'):
   base=(ROOT/p).parent/imp
   candidates=[base,Path(str(base)+'.ts'),Path(str(base)+'.tsx'),base/'index.ts']
   found=next((q for q in candidates if q.is_file()),None)
   if found and found.suffix in ['.ts','.tsx']:pending.append(found.resolve().relative_to(ROOT).as_posix())
mp['stockPhysicalModules']=[bind(p) for p in sorted(modules)]
write('checks/REBUILD.native-pair.physical-map.json',mp)
cp(BASE+'/scripts/build_new_sparse_host.py','scripts/build_new_sparse_host.py')
write('INPUTS.sealed-original-science-and-baseline.json',{'role':'Immutable source input bindings, informed technical integration only','baseline319':bind(BASE+'/NEUTRAL.final-current422-source3-lab1-bounded-inactive.json'),'baselineReport':bind(BASE+'/checks/CENTRAL.current422.final-P12.stock-report.actual.json'),'nativePreparation':bind(PREP+'/NEUTRAL.final-lab2-current422-native-preparation.json'),'originalA':bind(A+'/NEUTRAL.finite-D2-P2-independent-a-selector.json'),'originalB':bind(B+'/NEUTRAL.original-B-native-D2-final.json'),'originalASeal':bind(A+'/FILES.final-finite-D2-P2-independent-a.seal.json'),'originalBSeal':bind(B+'/FILES.finite-original-D2.seal.json'),'AMVReuseOnly':bind(A+'/REUSE.existing-A-M-V-bindings-only.json'),'noCanonicalDeltaFromLAB2':True,'newScientificVotes':0})
print(json.dumps({'native2ExactCopies':len(copies),'modules':len(modules),'P2ExactRows':2,'protectedInputs':len(protected['files']),'newVotes':0}))
