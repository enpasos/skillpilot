# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime, hashlib, json, re, subprocess, unicodedata

R = Path.cwd()
P = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-v6-current-text-four-genuine-independent-b-AM-supplement-20261011-v1')
B = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-combined-Bio3-targeted-author-successor-20261011-v6')
O = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-v6-genuine-independent-b-20261011-v1')
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p): return json.loads((R/p).read_text())
def ref(p):
    b = (R/p).read_bytes()
    return {'path':str(p),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def put(n,x): (R/P/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def norm(x): return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(x or ''))).strip()
def fingerprint(g, rule):
    d = g.get('dimensionTags',{})
    obj = {'ruleVersion':rule,'goalId':g['id'],'shortKey':g.get('shortKey',''),
           **{k:norm(g.get(k)) for k in ['title','titleEn','description','descriptionEn','nodeKind']},
           **{k:norm(d.get(k)) for k in ['phase','area','topicCode']}}
    return 'sha256:'+hashlib.sha256(json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

old = ref(O/'original-independent-b.freeze.json')
assert old['sha256']=='sha256:c93312f6092c4ddd37cc209b4a8421769f485fcf0abafc0cb0d836c3e88e4e7f'
landpath = B/'candidate/whole484-current369-Bio3-combined.author.inactive.json'
land=read(landpath)
by={g['id']:g for g in land['goals']}
ids=['430b2b73-641a-5122-bb6d-162b0d1eaf2d','528a3cd3-4a4d-550d-939a-8dc8656446e4',
     '9b40dae5-6d89-5714-ac96-373e72a7045e','a3f483ce-126e-595c-999c-aa4d95106221']
productpath=B/'inputs/whole-current397-machine-profile-products.neutral.json'
prod={p['goalId']:p for p in read(productpath)['records']}
modelpath=B/'native/whole397.currentRoot-Bio3-plus-Bio8.normal-model.actual.json'
pages={p['goalId']:p for p in read(modelpath)['pages']}
raw={i:{'wholeCurrentGoal':by[i],'wholeCurrentPositiveProfileProduct':prod[i],
        'wholeCurrentNormalPage':pages[i],
        'wholeCanonicalPrerequisites':[by[j] for j in by[i].get('requires',[])],
        'wholeCanonicalReverseNeighbours':[g for g in land['goals'] if i in g.get('requires',[])]}
     for i in ids}
put('FIRST.whole-current-v6-goal-profile-context-inputs.json',{
    'role':'Original Bio8v6 raw source for scoped independent B continuation; no peer verdict read',
    'basis':ref(landpath),'profileBasis':ref(productpath),'normalPageBasis':ref(modelpath),
    'existingOwnIndependentBSeal':old,'records':raw,
    'readPeerVerdicts':False,'authoredBio8Candidate':False})

A = {
 ids[0]: 'Eine beleggestützte Rekonstruktion biologischer Menschheitsentwicklung: Merkmale und Zeitlage begründen eine Hypothese, deren zeitliche Ordnung und Grenzen gemeinsam beurteilt werden. Dies ist eine einzelne inferenzielle Kompetenz. Der aktuelle Text verlangt keine zusätzliche Analyse kultureller Wissensweitergabe; diese ist im getrennten Ziel 80235254 modelliert. Eine Chronologie wird ausdrücklich nicht als bewiesene direkte Ahnenreihe gewertet.',
 ids[1]: 'Eine modellierte Fremd-DNA-Übertragungs- und Klonierungsprozedur: Träger aufnehmen, DNA kopieren und Kopien weitergeben gehören zu derselben kausalen Prozesskette. Plasmid oder Virus sind alternative modellierte Wege. Der aktuelle Text verlangt keine eigenständige Proteinexpressionsprüfung; diese ist im getrennten Ziel 374e6de5 modelliert. Aufnahme, stabile Weitergabe, Integration und Proteinbildung bleiben unterscheidbar, ohne daraus mehrere unabhängige Zielroutinen zu machen.',
 ids[2]: 'Eine mechanistische Einordnung von Entwicklungsgenetik in Evolutionsprozesse: räumliche beziehungsweise zeitliche Genregulation wird mit Gestaltvariation verbunden und hinsichtlich Vererbung, Selektion und Artbildung begrenzt. Hox-Identität und Enhancer-Timing sind verschiedene Belegkontexte dieser einen Zusammenhangskompetenz. Plastizität oder ein einzelner steriler Eingriff werden nicht als bezeugte Evolution behauptet; keine zusätzliche Liste unabhängiger Evolutionsverfahren wird verlangt.',
 ids[3]: 'Eine Erklärung des PCR-Prinzips im Anwendungskontext: Strangtrennung, Primerbindung, Polymeraseverlängerung und die damit mögliche gezielte DNA-Vervielfältigung bilden einen zusammenhängenden Mechanismus. Der Zweck und die Kontrollen erläutern die Aussagekraft derselben Methode. Eine selbstständige Geltrennungsroutine oder tatsächlich ausgeführte Laborbedienung wird im aktuellen Text nicht verlangt; Größenanalyse ist ein getrennter Nachweisschritt.',
}
M = {
 ids[0]: 'Kein eigenständiger Abrufkatalog. Fundalter und Merkmale werden im Fall vorgegeben; Leistung ist begründetes Ordnen und Revidieren bei neuem Fund oder Erhaltungsbias. Das Auswendiglernen von Artennamen, festen Jahreszahlen oder einer linearen Ahnenliste ist weder im aktuellen Ziel noch im P-Kern erforderlich.',
 ids[1]: 'Kein eigenständiger Erinnerungsgegenstand. Die neue Vektorkarte gibt Replikations-, Aufnahme- und Weitergabebedingungen vor; daraus wird begründet, ob Kopierung und Zellklone möglich sind. Feste Enzymnamen oder Listen aller Virusvektoren sind nicht Zielinhalt. Wiederholter Begriffsabruf würde den kausalen Transfer nicht ersetzen.',
 ids[2]: 'Keine notwendige Zuordnungsliste aus Genen, Arten oder Segmentnamen. Modellkarten liefern Hox-/Enhancerbefunde; Leistung ist die Erklärung von Orts-/Zeitregulation und die Abgrenzung von Plastizität, erblicher Variation und unbelegter Selektion. Einzelne Termini unterstützen die Erklärung, tragen aber keinen separaten Verified-Recall-Leistungskern.',
 ids[3]: 'Das Lernen der drei Schrittbezeichnungen allein genügt nicht. Aktuelle Fälle verlangen die Erklärung von Primerposition/-orientierung und die Schlussfolgerung bei geänderter vorlagenfreier Kontrolle. Keine festen Temperaturwerte, Reagenzienmengen oder Geräteschritte werden als unabhängiger Abrufinhalt verlangt. Eine zusätzliche SRS-Karte ist für diese Kompetenz nicht erforderlich.',
}
records=[]
for i in ids:
    g=by[i]
    assert not g.get('contains') and not any(t=='memorization' or t.startswith('srs-deck:') for t in g.get('tags',[]))
    records.append({'goalId':i,'goalFingerprint':prod[i]['goalFingerprint'],
                    'profileFingerprint':prod[i]['profileFingerprint'],
                    'reviewInputFingerprint':prod[i]['reviewInputFingerprint'],
                    'semanticAtomicityFingerprint':fingerprint(g,'semantic-atomicity-v1'),
                    'semanticAtomicityDecision':'atomic','semanticAtomic':True,'atomicityReasonDe':A[i],
                    'memoryFingerprint':fingerprint(g,'memory-card-review-v1'),
                    'memoryDecision':'no_memory_needed','memoryUseful':False,'memoryReasonDe':M[i],
                    'newMemoryGoalIds':[],'newDeckIds':[], 'newCards':0,
                    'cardVisibilityCheckRequiredForThisDecision':False,
                    'cardVisibilityReasonDe':'Es wird kein Memory-Ziel angelegt, gefordert oder diesem Inhaltsziel neu zugeordnet. Daher keine neue Karten-/Sichtbarkeitsfreigabe in diesem begrenzten Ergänzungsschritt. Vorhandene unabhängige Karten-/Sichtbarkeitsnachweise werden nicht verändert.'})
put('A4-M4.original-current-text-scoped-continuation.json',{
    'role':'Own genuine independent B scoped continuation of the existing original B judgment',
    'reviewerTask':'/root/bio8_v6_genuine_independent_b','reviewedAtUTC':NOW,
    'originalOwnIndependentBSeal':old,'records':records,'readAuthorOrPeerVerdicts':False,
    'newIndependentVote':False,'newDRun':False,'newPApproval':False,'newVApproval':False,
    'humanApproval':False,'sourceUnionFullApproval':False,'openAMFindings':[],'activeWrites':False})

for lane,rule,key in [('A','semantic-atomicity-v1','semanticAtomicityFingerprint'),
                      ('M','memory-card-review-v1','memoryFingerprint')]:
    rid='biologie-Bio8-v6-four-current-text-genuine-independent-b-'+lane.lower()+'-continuation-20261011-v1'
    config={'schemaVersion':1,'reviewId':rid,'ruleVersion':rule,'landscapeId':land['landscapeId'],
            'landscapePath':str(landpath),'reviewPath':str(P/(lane+'4.original.review.jsonl')),
            'scope':{'label':'Four actually changed current Bio8v6 text bindings; original independent B scoped continuation','leafGoalIds':ids}}
    put(lane+'4.original.config.json',config)
    ledger=[]
    for rec in records:
        row={'schemaVersion':1,'reviewId':rid,'ruleVersion':rule,'landscapeId':land['landscapeId'],
             'goalId':rec['goalId'],'fingerprint':rec[key],'reviewedAt':NOW,
             'reviewer':'/root/bio8_v6_genuine_independent_b (same original B, scoped continuation)'}
        if lane=='A':row.update(status='atomic',semanticAtomic=True,reason=rec['atomicityReasonDe'])
        else:row.update(status='no_memory_needed',memoryUseful=False,reason=rec['memoryReasonDe'])
        ledger.append(row)
    (R/P/(lane+'4.original.review.jsonl')).write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in ledger))
    if lane == 'M':
        # The normal empty card ledger is required even for a no-memory scope.
        # It has zero decisions: no cards belong to these four reviewed content goals.
        (R/P/'M4.original.cards.review.jsonl').write_text('')

commands=[]
for lane,script in [('A','semanticAtomicityReview.ts'),('M','memoryCardReview.ts')]:
    argv=[str(R/'app/node_modules/.bin/tsx'),str(R/'app/scripts'/script),'--config='+str(P/(lane+'4.original.config.json')),'--mode=check']
    run=subprocess.run(argv,cwd=R,capture_output=True,text=True)
    commands.append({'lane':lane,'argv':argv,'exitCode':run.returncode,'stdout':run.stdout,'stderr':run.stderr})
    assert run.returncode==0,run.stderr+run.stdout
assert ref(O/'original-independent-b.freeze.json')==old
put('normal-original-AM4-scoped-checks.actual.json',{'commands':commands,'normalHelpersUnmodified':True,
    'oldOriginalBSealUnmodified':old,'newIndependentVote':False,'activeWrites':False})
for file in (R/P).glob('*.json'):json.loads(file.read_text())
(R/P/'README.md').write_text('''# Original independent B: four current-text A/M continuations

This is a targeted continuation by the same independent Bio8v6 B reviewer.
The original D19/P10/V19 review and its seal remain unchanged. This is not a second
independent vote. No author or peer verdict was read for these A/M decisions.

The four actual current goal bodies and their complete current P/page/UUID neighbours
are preserved in FIRST. Each is semantically atomic with a stated individual reason.
Each has no required independent recall/card goal. No new cards or visibility approval
is claimed. Both ordinary scoped A/M checkers passed with current fingerprints after
the substantive decisions. Human and source-union full approval remain separate.
''')
files=[ref(f.relative_to(R)) for f in sorted((R/P).rglob('*')) if f.is_file()]
put('original-B-scoped-AM4-continuation.freeze.json',{
    'schemaVersion':1,'role':'Original independent B supplemental A/M seal; same vote, no historical mutation',
    'createdAtUTC':NOW,'files':files,'fileCount':len(files),
    'externalInputs':[ref(landpath),ref(productpath),ref(modelpath),old,
                       ref(Path('app/scripts/semanticAtomicityReview.ts')),ref(Path('app/scripts/memoryCardReview.ts'))],
    'newIndependentVote':False,'activeWrites':False})
seal=read(P/'original-B-scoped-AM4-continuation.freeze.json')
for f in seal['files']+seal['externalInputs']:assert ref(Path(f['path']))==f
print(json.dumps({'seal':ref(P/'original-B-scoped-AM4-continuation.freeze.json'),
                  'decisions':ref(P/'A4-M4.original-current-text-scoped-continuation.json'),
                  'normalAPassed':True,'normalMPassed':True,'newIndependentVote':False},indent=2))
