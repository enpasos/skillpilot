# SPDX-License-Identifier: Apache-2.0
"""Technical synthesis of existing completed independent D records, never a review run."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, shutil, subprocess, tempfile

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
read = lambda p: json.loads(Path(p).read_text())
stable = lambda v: json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def write(p, v):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists(), p
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
def rel(p): return str(Path(p).relative_to(ROOT))
def binding(p): return {'path': rel(p), 'sha256': sha(p), 'bytes': Path(p).stat().st_size}

ORIG = BASE/'chemie-current-atomic-description-positive-gap-author-v1'
V5 = BASE/'chemie-current-coordinate-final-native-review-inputs-author-v5'
V6 = BASE/'chemie-current-aromatic-delocalization-final-native-author-v6'
A1 = BASE/'chemie-current-fifteen-native-d-independent-a-v1'
B1 = BASE/'chemie-current-fifteen-native-d-independent-b-v1'
A5 = BASE/'chemie-current-four-and-coordinate-native-d-blind-independent-a-v5'
B5 = BASE/'chemie-current-coordinate-final-native-d-independent-b-v5'
A6 = BASE/'chemie-current-aromatic-native-d-targeted-independent-a-v6'
B6 = BASE/'chemie-current-aromatic-one-native-d-independent-b-v6'
CHANGED = ['3d3231f9-039d-5ce5-9e8e-af219c7fee08','b8d3b453-d638-5518-aab0-d84ec2e8567c','9decc36b-a69a-5599-a9f0-fcebdf0203d8','973c12d9-d863-5292-8c68-9c80cdacf9e2','363c5740-8a3c-50b8-8c3a-5548c80c36ea']
AROMATIC = CHANGED[1]
CASES = [
    {'group':'native-original-ten','config':ORIG/'native-d-fifteen.batch.config.json','author':ORIG,'inputBase':'native-d-fifteen','a':A1/'results','b':B1/'results','defer':CHANGED},
    {'group':'native-current-three','config':V5/'native-d-four-excluding-coordinate.batch.config.json','author':V5,'inputBase':'native-d-four-excluding-coordinate','a':A5/'four/round-a/results','b':B5/'native-d-four/results','defer':[AROMATIC]},
    {'group':'native-coordinate-single','config':V5/'native-d-coordinate-single.batch.config.json','author':V5,'inputBase':'native-d-coordinate-single','a':A5/'coordinate/round-a/results','b':B5/'native-d-one/results','defer':[]},
    {'group':'native-aromatic-single','config':V6/'native-d-aromatic-single.batch.config.json','author':V6,'inputBase':'native-d-aromatic-single','a':A6/'round-a/results','b':B6/'results','defer':[]},
]
FREEZES = [
    ORIG/'native-d-stage-v1.final.freeze.json',
    A1/'native-fifteen-d-independent-a.final.freeze.json',
    B1/'native-d-fifteen.independent-b.final.freeze.json',
    V5/'native-d-four-stage-author-v5.final.freeze.json',
    V5/'native-d-one-stage-author-v5.final.freeze.json',
    A5/'native-description-independent-a-v5.final.freeze.json',
    B5/'independent-native-four-plus-one-d-b.final.freeze.json',
    V6/'native-d-aromatic-one-stage-author-v6.final.freeze.json',
    A6/'native-aromatic-description-independent-a-v6.final.freeze.json',
    B6/'independent-aromatic-one-native-d-b.final.freeze.json',
]

# Existing review verdicts and findings are never edited or relabelled.
frozen = []
for f in FREEZES:
    v = read(f); entries = v.get('files', v.get('outputs', []))
    for x in entries:
        p = ROOT/x['path']; expected = x['sha256']
        assert sha(p) == 'sha256:' + expected.removeprefix('sha256:'), p
    frozen.append({'freeze': binding(f), 'verifiedImmutableOutputs': entries})
assert sha(V6/'native-d-aromatic-one-stage-author-v6.final.freeze.json') == 'sha256:b8069d54f1ebec4d938f51d124c0e2c620aebbf6b108a3dfa16cf34c6a28b657'
assert sha(A6/'native-aromatic-description-independent-a-v6.final.freeze.json') == 'sha256:e437d71d35e5874c7b85afe3402eb78e39e1d6c8645b52bb6995dc2c560d4f01'
assert sha(B6/'independent-aromatic-one-native-d-b.final.freeze.json') == 'sha256:2816e36cc8cf802cf412592b2d290e816a802d200ba073677f964b6b2e12905b'
write(OWN/'immutable-source-freezes.before-synthesis.json', frozen)

ISO = Path(tempfile.mkdtemp(prefix='skillpilot-chemie-d-synthesis-v1-'))
write(OWN/'physical-isolation.receipt.json', {'role':'technical_synthesizer','root':str(ISO),'originalConfigBytesAndPathsPreserved':True,'helpersCopiedWithoutModification':True,'activeWrites':0,'newIndependentReviewRounds':0})
for d in ['app/scripts','app/src','contracts']:
    shutil.copytree(ROOT/d, ISO/d)
(ISO/'app/node_modules').symlink_to(ROOT/'app/node_modules', target_is_directory=True)
shutil.copy2(ROOT/'app/package.json', ISO/'app/package.json')
if (ROOT/'app/tsconfig.json').exists(): shutil.copy2(ROOT/'app/tsconfig.json',ISO/'app/tsconfig.json')

copies = {}
def mirror(p, expected=None):
    p = Path(p); dst = ISO/rel(p)
    if expected: assert sha(p) == 'sha256:' + expected.removeprefix('sha256:'), p
    if dst.exists(): assert sha(dst) == sha(p), p
    else:
        dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(p, dst)
    copies[rel(p)] = binding(p)
    return dst

# SourceAtlas source text, full source mappings and school/course views remain
# inputs, never a blanket claim of physical source-coverage review.
oldRaw = read(ORIG/'actual-current378-national359-subset15-page-source-context-bindings.json')
for x in oldRaw['actualNativeInputBindings']: mirror(ROOT/x['path'], x['sha256'])
mirror(ROOT/oldRaw['actualCurrentWholeCanonical']['path'],oldRaw['actualCurrentWholeCanonical']['sha256'])
for c in CASES:
    cfg = read(c['config']); mirror(c['config'])
    mirror(ROOT/cfg['baseGoalBookConfigPath'])
    for k in ['promptPath','criteriaPath']: mirror(ROOT/cfg[k])
    manifest = read(c['author']/c['inputBase']/'batch-manifest.json')
    mirror(ROOT/manifest['source']['landscapePath'])
    out = ISO/cfg['outputDirectory']
    assert not out.exists(); shutil.copytree(c['author']/c['inputBase'],out)
    c['scratchOutput'] = out
    c['ids'] = cfg['goalIds']
    c['keepIds'] = [g for g in cfg['goalIds'] if g not in c['defer']]
    c['pairs'] = {}
    for letter in ['a','b']:
        dest = out/('round-'+letter)/'results'
        dest.mkdir(exist_ok=True); assert not list(dest.iterdir()), dest
        sourceFiles = sorted(c[letter].iterdir())
        assert len(sourceFiles) == 2 and all(p.name.endswith(('.records.jsonl','.run.json')) for p in sourceFiles), c[letter]
        for p in sourceFiles:
            shutil.copy2(p,dest/p.name)
            copies[rel(p)] = binding(p)
        records = [json.loads(l) for p in dest.glob('*.records.jsonl') for l in p.read_text().splitlines()]
        assert [r['goalId'] for r in records] == cfg['goalIds']
        c['pairs'][letter] = {r['goalId']:r for r in records}
    for gid in c['ids']:
        a,b = c['pairs']['a'][gid],c['pairs']['b'][gid]
        for key in ['goalId','goalFingerprint','pageFingerprint','bookDigest','bundleFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
            assert a[key] == b[key], (gid,key)
        if gid in c['keepIds']: assert a['decision'] == b['decision'] == 'keep', (gid,a['decision'],b['decision'])

for p in [V5/'prospective-current378.canonical.author-candidate.json', V5/'qa-artifacts/full-prospective378.book-model.json', V5/'actual-one-delta-full378-and-fourteen-reuse.native-bindings.json',V6/'prospective-current378.canonical.author-candidate.json', V6/'qa-artifacts/full-prospective378.book-model.json',V6/'actual-full378-single-aromatic-native-source-context-bindings.json',ORIG/'actual-current378-national359-subset15-page-source-context-bindings.json']:
    mirror(p)

# Lock physical helper/config/input copies. Only scratch result/resolution output
# folders remain writable; no repository source is linked as an output target.
outputDirs = [c['scratchOutput'] for c in CASES]
for p in ISO.rglob('*'):
    if p.is_file() and not p.is_symlink() and not any(p.is_relative_to(d) for d in outputDirs): p.chmod(0o444)
write(OWN/'exact-physical-input-copies.receipt.json', {'copies':list(copies.values()),'reviewRunsRelabelled':False,'newReviewRuns':0,'readOnlyProductionHelperCopies':True})

REASONS = {
 'dd58c029': ('Beide tatsächlichen Originalrunden erhalten die eine Strukturgrammatik für Namen/Formeln, homologe Reihen und einfache Konstitutionsisomerie. HE E.3 trägt Alkane/Alkene, HE Q1.1 trägt zusätzlich Alkine und Skelettformeln; das E-Breadcrumb erweitert diese Pflicht nicht. Ganze aktuelle v6-Ziel-/Seiten-/Quellen-/Bildpayloads sind unverändert.', 'Both actual original rounds preserve the single structural grammar connecting names/formulas, homologous series and simple constitutional isomerism. HE E.3 supports alkanes/alkenes; HE Q1.1 additionally supports alkynes and skeletal formulas. The E breadcrumb does not widen this obligation. Complete current v6 goal/page/source/image payloads are unchanged.'),
 '3be2d0b7': ('Beide Originalrunden begründen Start, zwei Fortpflanzungsschritte und Abbruch durch Radikal-/Atombilanzen. Die unterschiedlichen neuen Alkanfälle sind kompatible Transferformen. HE E.3/Q1.1 und die unveränderte Methan/Brom-Darstellung bleiben gebunden; kein tatsächlicher Versuch oder Produktverteilungsanspruch.', 'Both original rounds explain initiation, both propagation steps and termination using radical and atom bookkeeping. Their different fresh alkane cases are compatible transfer variants. HE E.3/Q1.1 and the unchanged methane/bromine depiction remain bound, without claims of an actual experiment or product distribution.'),
 'e1214210': ('Beide Originalrunden verbinden Ethanol-Hydroxygruppe, Wasserstoffbrücken und begrenzte Mischbarkeits-/Siedevergleiche. Alkylrest und Dispersionskräfte bleiben relevant; Sieden bricht keine O-H-Bindung. Der gesundheitliche Obercluster fügt keine Gesundheitsprüfung hinzu. Vollständige aktuelle Bindungen sind exakt.', 'Both original rounds connect ethanol hydroxyl groups and hydrogen bonds to bounded miscibility and boiling comparisons. The alkyl residue and dispersion remain relevant; boiling does not break O-H bonds. The health-related parent does not add a health assessment. Complete current bindings are exact.'),
 '448815cc': ('Beide Originalrunden vergleichen Metall-, Ionen- und Elektronenpaarbindung als eine Bindungsmodellkompetenz mit passenden Teilchen und Ladungen. HE Q1.1 GK/LK trägt die Modelle. Die unveränderten drei Bildspalten erklären keine zusätzliche vollständige Kristall-/MO-Theorie.', 'Both original rounds compare metallic, ionic and covalent bonding as one bonding-model competence using appropriate particles and charges. HE Q1.1 GK/LK supports these models. The unchanged three image panels do not add complete crystal or MO theory.'),
 '5a30273a': ('Beide Originalrunden erhalten den Struktur-Eigenschafts-Zusammenhang einschließlich konkurrierender Wechselwirkungen beim Mischen und notwendiger Packungs-/Messdaten beim Schmelzen. Die begrenzte Siedebeispielreihe ist keine universelle Schmelzregel; Lösemittelwahl und qualitative Prognose bleiben Anwendungen derselben Erklärung.', 'Both original rounds preserve the structure-property relationship, competing interactions during mixing, and necessary packing or measured information for melting. The bounded boiling examples are not a universal melting rule; solvent selection and qualitative prediction remain applications of the same explanation.'),
 '622f09e5': ('Beide endgültigen Originalrunden geben KEEP für die generische bilinguale Bindungsänderungs-/Nachweiskompetenz; der B-Vorab-BLOCK wird nicht verwendet. H2/Cl2 ist ein gültiges generisches Bildbeispiel. Der separate organische HE-Q1.1-Source/page-HOLD bleibt ausdrücklich erhalten: organische Bromierungs-/Additionsmuster müssen im separaten P-Kontext gezeigt werden; AgCl stammt aus Q1.2, saure Wirkung beweist kein Chlorid. Keine globale Quellenfreigabe.', 'Both final original rounds give KEEP for the generic bilingual bond-change/test competence; the preliminary B BLOCK is not used. H2/Cl2 is a valid generic illustration. The separate organic HE-Q1.1 source/page HOLD is explicitly preserved: organic bromination/addition patterns require separate P-context evidence; AgCl belongs to Q1.2 and acidic behaviour does not prove chloride. No global source approval.'),
 'b92bfa45': ('Beide Originalrunden prüfen die vollständigen vier Substituenten eines tetraedrischen C-Atoms und passende Gegenbeispiele. HE Q2.1 S.42 GK/LK trägt die Aminosäurenbeziehung; das Q1-Breadcrumb erzeugt keine Q1-Pflicht. Kein R/S-Verfahren und keine Behauptung, sämtliche Chiralität brauche ein C-Stereozentrum.', 'Both original rounds examine the complete four substituents of a tetrahedral carbon and suitable counterexamples. HE Q2.1 p.42 GK/LK supports the amino-acid relation; the Q1 breadcrumb creates no Q1 obligation. No R/S procedure or claim that all chirality requires a carbon stereocentre is added.'),
 '345fdca9': ('Beide Originalrunden erhalten Konnektivität, Valenz und sichtbare OH-Gruppe beim Wechsel zwischen Struktur-, Halbstruktur- und Skelettformel desselben Alkanols. HE Q1.2 GK/LK trägt die Darstellung. Benennung bleibt direkter Vorläufer, keine zusätzliche Isomerfindungs-/Eigenschaftsprüfung.', 'Both original rounds preserve connectivity, valence and the visible OH group across full structural, condensed and skeletal forms of the same alkanol. HE Q1.2 GK/LK supports representation. Naming remains a direct prerequisite without extra isomer-search or property assessment.'),
 '3899edf4': ('Beide Originalrunden verbinden Nukleophil-Donator, elektrophiles Akzeptorzentrum und Abgangsgruppe durch konsistente Elektronenpaar-/Ladungsbilanz. Das unveränderte OH-/CH3Br-Bild ist ausdrücklich ein SN2-Beispiel, keine universelle Gleichzeitigkeit oder GK-SN1/SN2-Kinetikpflicht. HE Q1.2-Reaktionstyp und LK-Mechanismendifferenzierung bleiben getrennt.', 'Both original rounds connect nucleophile donor, electrophilic acceptor centre and leaving group through consistent electron-pair and charge bookkeeping. The unchanged hydroxide/methyl-bromide picture is an explicit SN2 example, without universal concertedness or compulsory GK SN1/SN2 kinetics. HE Q1.2 reaction type and advanced mechanism differentiation remain distinct.'),
 'd4928773': ('Beide Originalrunden fordern selbstständige Gleichungsbildung mit Atom-/Ladungsbilanz unter passenden Substitutionsbedingungen. Das korrekte Brommethanbeispiel ist keine allgemeine Produktgarantie bei anderem Lösemittel oder stärkerer Erwärmung. HE Q1.2 GK/LK trägt diese Gleichungskompetenz; praktische Bedingungsfälle bleiben separat.', 'Both original rounds require independently constructing an atom- and charge-balanced equation under appropriate substitution conditions. The valid methyl-bromide example is no general product guarantee for changed solvent or heating. HE Q1.2 GK/LK supports this equation competence; practical condition cases remain separate.'),
 '3d3231f9': ('Beide aktuellen v5-Runden bestätigen den vollständig gebundenen korrigierten Kraftnamen und eine zusammenhängende Erklärung für ausgewählte Stoffe. Das tatsächliche CH4/CH3Cl/CH3OH-Bild trägt nur einen begrenzten Siedevergleich; Schmelzpackung und Löslichkeitskonkurrenz bleiben im V2-Verständnis. HE E.3/Q1.1/Q1.2 ist begrenzt, keine nationale Quellenfreigabe.', 'Both current v5 rounds confirm the fully bound corrected force name and one explanation for selected substances. The actual methane/chloromethane/methanol image supports a bounded boiling comparison; melting packing and solubility competition remain in V2 understanding. HE E.3/Q1.1/Q1.2 is bounded, without national source approval.'),
 '9decc36b': ('Beide aktuellen v5-Runden bestätigen die neue explizite Paarrelation: gleiche Konstitution, räumliche Beziehung, gegebenenfalls Stereoisomerietyp. Ein identisches Paar darf nein ergeben. HE Q1-LK E/Z und Q2-GK/LK Enantiomerie bleiben verschiedene Quellenbereiche; keine vollständige Taxonomie/R/S- oder nationale GK-Freigabe.', 'Both current v5 rounds confirm the explicit pair relation: identical constitution, spatial relationship and, where applicable, stereoisomer type. An identical pair may correctly yield no isomerism. HE Q1 advanced E/Z and Q2 GK/LK enantiomerism remain separate source scopes, without complete taxonomy, R/S or national GK approval.'),
 '973c12d9': ('Beide aktuellen v5-Runden sehen die korrigierte konkrete Ethanal/Propanon-Bildbindung und erhalten die tatsächliche Durchführungs- plus Deutungskompetenz. Kein universeller positiver Aldehydbeweis/negativer Ketonnachweis. HE Q1.2 trägt Fehling; Tollens ist alternative Illustration. Aufsicht, Kontrollen und Schutz/Entsorgung sowie separates P-Durchführungsevidenz bleiben erforderlich.', 'Both current v5 rounds inspect the corrected concrete ethanal/propanone image binding and retain actual performance plus interpretation. No universal positive aldehyde proof or negative ketone test follows. HE Q1.2 supports Fehling; Tollens is an alternative illustration. Supervision, controls, protection/disposal and separate P execution evidence remain required.'),
 '363c5740': ('Beide aktuellen v5-Einzelrunden bestätigen den tatsächlich gesehenen Modellausschnitt: ein ausgewähltes Tartrat-O-Elektronenpaar, ein geeignetes Cu2+-Akzeptororbital und ein gemeinsames lokales Paar. Keine Vollkomplex-Stöchiometrie, acht Donoren oder vollständige d-Schale. Das B-v3-Bild-BLOCK-Finding ist am neuen exakten Kandidaten aufgelöst, sein historischer Record bleibt unangetastet. HE Q1.2 LK wird nicht zu GK erweitert.', 'Both current v5 single rounds confirm the actually viewed local model: one selected tartrate O lone pair, one suitable Cu2+ acceptor orbital and one shared local pair. No full-complex stoichiometry, eight donors or full d shell is claimed. The B-v3 image BLOCK finding is resolved in the exact new candidate while its historical record stays unchanged. HE Q1.2 advanced scope is not widened to GK.'),
 'b8d3b453': ('Beide aktuellen v6-Einzelrunden bestätigen die explizite Elektronendelokalisierung als Begründungsbasis der Reaktivität in den tatsächlichen DE/EN-Texten. Damit ist der eigene v5-A-Textbefund am exakten Kandidaten aufgelöst. Das unveränderte gute PNG zeigt aromatische Ausgangs-/Endringe, einen einfach positiven nichtaromatischen Areniumbeitrag und Rearomatisierung mit H+-Abgabe. HE Q1.1 LK trägt den Zusammenhang; kein allgemeiner Detailmechanismus, Geschwindigkeits-/Regioselektivitätsanspruch oder nationale GK-Freigabe.', 'Both current v6 single rounds confirm explicit electron delocalization as the basis for explaining reactivity in the actual DE/EN descriptions. This resolves the own v5-A text finding in the exact candidate. The unchanged good PNG shows aromatic starting/product rings, one singly positive nonaromatic arenium contributor and rearomatization by H+ release. HE Q1.1 advanced scope supports this relation without universal detailed mechanisms, rate/regioselectivity claims or national GK approval.'),
}

receipt = []
for c in CASES:
    author = {'schemaVersion':1,'manifestId':'chemie-current-fifteen-'+c['group']+'-synthesis-20261006-v1','synthesizedBy':'Codex technical synthesizer: actual existing completed A/B records read; no additional independent review round','decisions':[]}
    for gid in c['keepIds']:
        de,en = REASONS[gid[:8]]
        author['decisions'].append({'goalId':gid,'resolutionDecision':'keep_current' if c['group']=='native-original-ten' else 'current_after_revision','evidenceRound':'second','rationaleDe':de,'rationaleEn':en})
    if c['defer']:
        author['deferredGoals'] = []
        for gid in c['ids']:
            if gid not in c['defer']: continue
            a,b = c['pairs']['a'][gid],c['pairs']['b'][gid]
            author['deferredGoals'].append({'goalId':gid,'rationaleDe':f"Dieser unveränderte historische Batch enthält für diese inzwischen materiell geänderte Seite die originalen A/B-Entscheidungen {a['decision']}/{b['decision']}. Sie werden nicht umetikettiert oder als aktueller Abschluss verwendet. Die tatsächlich korrigierte aktuelle Seite besitzt eine getrennte gezielte native A/B-Gruppe; bei b8 gilt ausschließlich v6 mit expliziter Delokalisierung.",'rationaleEn':f"This unchanged historical batch retains the original A/B decisions {a['decision']}/{b['decision']} for a page since materially changed. They are not relabelled or used as current completion. The actually corrected current page has a separate targeted native A/B group; b8 is completed only by v6 with explicit delocalization."})
    write(c['scratchOutput']/'synthesis-authoring.json',author)
    receipt.append({'group':c['group'],'authoring':author,'actualPairs':{gid:{letter:c['pairs'][letter][gid] for letter in ['a','b']} for gid in c['ids']},'originalConfig':binding(c['config'])})
write(OWN/'actual-existing-independent-pairs-and-substantive-synthesis.receipt.json',{'role':'technical_synthesizer','newIndependentReviewRounds':0,'groups':receipt,'unresolvedSemanticDissentAmongSelected15':[],'sourceCoverageLimitsPreserved':True,'PReviewedByThisSynthesis':False,'humanApproval':False,'activeWrites':0})

commands = []
def run(name,args):
    started = datetime.now(timezone.utc).isoformat()
    p = subprocess.run(args,cwd=ISO,capture_output=True)
    completed = datetime.now(timezone.utc).isoformat()
    out=OWN/'terminal'/(name+'.stdout.txt');err=OWN/'terminal'/(name+'.stderr.txt')
    out.parent.mkdir(exist_ok=True);out.write_bytes(p.stdout);err.write_bytes(p.stderr)
    commands.append({'name':name,'args':args,'cwd':str(ISO),'startedAt':started,'completedAt':completed,'actualExitCode':p.returncode,'stdout':binding(out),'stderr':binding(err)})
    rec=OWN/'native-synthesis-finalization.actual.receipt.json'
    rec.write_text(json.dumps({'role':'technical_synthesizer','commands':commands,'productionValidatorsModified':False,'activeWrites':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'name':name,'actualExitCode':p.returncode,'stdout':p.stdout.decode()[:700],'stderr':p.stderr.decode()[:1800]}),flush=True)
    assert p.returncode==0,(name,p.stderr.decode())

# No native prepare/build/review is repeated. Existing frozen native artifacts
# and completed review bytes are checked and synthesized by unchanged helpers.
for c in CASES:
    cfg=rel(c['config']);out=str(c['scratchOutput'].relative_to(ISO));prefix=c['group']
    tsx='app/node_modules/.bin/tsx'
    run(prefix+'-prepared-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',cfg])
    run(prefix+'-dual-summarize',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',cfg,'--write'])
    run(prefix+'-synthesis-manifest',[tsx,'app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',out+'/synthesis-authoring.json','--write'])
    run(prefix+'-resolutions-materialize',[tsx,'app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',out+'/synthesis-decisions.json','--write'])
    run(prefix+'-finalize',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write'])
    run(prefix+'-finalize-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg])
    shutil.copytree(c['scratchOutput'],OWN/c['group'])
    idx=read(OWN/c['group']/'resolution-index.json')
    assert len(idx['resolutions'])==len(c['keepIds']) and all(r['strictDescriptionComplete'] for r in idx['resolutions'])
    assert idx.get('deferredGoalIds',[])==[g for g in c['ids'] if g in c['defer']]

actualIds=[r['goalId'] for c in CASES for r in read(OWN/c['group']/'resolution-index.json')['resolutions']]
expectedIds=read(ORIG/'native-d-fifteen.batch.config.json')['goalIds']
assert len(actualIds)==len(set(actualIds))==15 and set(actualIds)==set(expectedIds)
for f in frozen:
    assert sha(ROOT/f['freeze']['path'])==f['freeze']['sha256']
    for x in f['verifiedImmutableOutputs']: assert sha(ROOT/x['path'])=='sha256:'+x['sha256'].removeprefix('sha256:')
write(OWN/'four-native-current-indices.actual.receipt.json',{'role':'technical_synthesizer','strictDescriptionCandidates':15,'newIndependentReviewRounds':0,'originalReviewRunsRelabelled':False,'groups':[{'index':binding(OWN/c['group']/'resolution-index.json'),'strictGoalIds':c['keepIds'],'deferredHistoricalGoalIds':[g for g in c['ids'] if g in c['defer']]} for c in CASES],'unchangedHistoryAndAuthorAndIndependentReviewOutputsVerifiedAfterSynthesis':True,'actualNativeTerminalChecksPassed':len(commands),'activeStrictGain':0,'activeWrites':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'ownDirectory':rel(OWN),'strict15':True,'indices':4,'physicalScratch':str(ISO),'activeWrites':0}),flush=True)
