from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import difflib

P=Path(__file__).resolve().parent
R=P.parents[3]
def load(n): return json.loads((P/n).read_bytes())
def sha(b): return hashlib.sha256(b).hexdigest()
def save(n,v): (P/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
review=load('independent-review.json')
native=load('native-kind-check.json')
delta=load('ledger-delta.json')
freshness=load('additional-D-freshness-hold.json')
protected=load('protected-inputs.before.json')
for pin in protected:
    data=(R/pin['path']).read_bytes()
    assert len(data)==pin['bytes'] and sha(data)==pin['sha256'],pin['path']
post={'checkedAtActualUTC':datetime.now(timezone.utc).isoformat(),'protectedFilesChecked':len(protected),'allUnchanged':True,'activeSourceSha256':review['sourcePins']['before']['sha256'],'activeLedgerSha256':review['oldLedger']['sha256'],'allOldSourceAndCombinedPackageFilesUnchanged':True,'gitActions':0,'producerRuns':0}
save('postguard.json',post)

text=['# Unabhängige Semantic-kind-Prüfung: genau 15 Mathematikziele','',
      'Actor: **Codex /root/math15_semantic_kind_review**, unabhängiger KI-Reviewer. Attestierung nach fachlicher Prüfung: `'+review['attestedAtActualUTC']+'`.',
      '', 'Alle 15 Entscheidungen lauten nach aktueller Einzelprüfung **curricularAtomic**. Die Entscheidung beruht auf den vollständigen DE/EN-Kompetenztexten, Blattform, fehlenden Prüfungs-/Kartenworkflowmerkmalen und den tatsächlichen fachlichen Eltern/Programmplatzierungen. Der alte Typ ist Vergleich, keine Entscheidungsregel. Beispiele unten erläutern die Beobachtbarkeit; sie sind keine neu freigegebenen P-Aufgaben.',
      '', 'Source15: `'+review['sourcePins']['after']['sha256']+'`. Aktive Vergleichsquelle: `'+review['sourcePins']['before']['sha256']+'`. Vollständige alte/neue Goalobjekte, Eltern/Vorfahren, Platzierungen, Unit-Ketten, Metadaten und Quellzeiger stehen in `independent-review.json`.',
      '', 'Gemeinsame Strukturbelege: `type=atomic`, `contains=[]`; ein Feld `goalType` ist im kanonischen Objekt nicht vorhanden. Auch `nodeKind`, `examData`, Karten-/Deckfelder und `extendedData` fehlen; Tags enthalten keine Practice-/Assessment-/Motivation-/Orientation-/memorization-/srs-deck-Marker. Die Bildlinks sind Lehrmaterial. Alle 15 direkten Placements sind leer; die belegten Sek-II-/Phasenplatzierungen liegen an Vorfahren. Eine Phase aus dimensionTags wird nicht als direktes Placement ausgegeben.',
      '', 'Die normativen Unterscheidungen stehen im gepinnten Mathematik-Ontologieprofil `/semanticKinds`, im geschlossenen Ledger-Schema und in Node Types. `curricularAtomic` ist die fachliche Kompetenzklasse, keine neue Bestätigung des A-Gates. Weder die Zahl der Verben noch ein Titel oder die bloße Blattform ersetzt die Einzelentscheidung.']
for n,row in enumerate(review['decisions'],1):
    g=row['currentGoalComplete']
    text += ['',f'## {n}. {g["title"]}', '',f'`{g["id"]}` — **curricularAtomic**', '',g['description'],'',
             '**Fachliches Urteil:** '+row['competenceJudgment'],'',
             '**Beobachtbare Leistung:** '+row['observablePerformance'],'',
             '**Platzierung:** '+row['placementJudgment'],'',
             '**Abgrenzung:** '+row['alternativeKindsRejected'],'',
             '**Vorher/nachher:** '+row['requiresChangeJudgment'],'',
             'Alte direkte requires: `'+', '.join(row['fieldChange']['before'])+'`.',
             'Source15 requires: `'+', '.join(row['fieldChange']['after'])+'`.']
(P/'individual-decisions.md').write_text('\n'.join(text)+'\n')

old=(R/review['oldLedger']['path']).read_text()
candidate=(P/'mathematik.semantic-kinds.candidate.json').read_text()
(P/'ledger-candidate.diff').write_text(''.join(difflib.unified_diff(old.splitlines(keepends=True),candidate.splitlines(keepends=True),fromfile=review['oldLedger']['path'],tofile='PRIVATE/mathematik.semantic-kinds.candidate.json')))

readme='''# Privater Kindnachfolger für genau 15 Mathematikziele

**Alle 15 Ziele bleiben nach eigenständiger aktueller Fachprüfung `curricularAtomic`.**
Die [15 Einzelurteile](individual-decisions.md) begründen Kompetenz, beobachtbare Leistung,
Platzierung, Abgrenzung zu den sechs anderen Klassen und die Wirkung des Kantenentzugs.
Der [vollständige Beleg](independent-review.json) enthält tatsächlichen Actor/Zeit,
exakte Sourcepins, ganze Vorher-/Nachherobjekte und sämtliche relevanten kanonischen
Eltern/Vorfahren/Programmplatzierungen. Dies ist eine KI-Kindprüfung, keine menschliche
Freigabe, neue Atomicity-Prüfung oder Beschreibungssynthese.

Geprüfter Source15: `9f3945e209e0cef503428e0a20c3c2302261346e35f533bf1264e525f16cdf96`.
Die aktive Quelle bleibt `e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06`.
Exakter kombinierter Vorgänger: Receipt
`1686711c3df95a7a7a376809ba88075b5dfa4388f977b94db93063c6c0c56ef0`, Inventory
`a0ff2d286f89f9c2261906bf02042329e03e4730bf74684cb52cd3a87c701e0b`.

Der [schema-konforme vollständige Ledgerkandidat](mathematik.semantic-kinds.candidate.json)
hat SHA256 `CANDIDATE_SHA`. Das [Delta](ledger-delta.json) ersetzt genau 15 Entscheidungen;
die anderen **1237 Zeilen**, alle Zähler (**807 curricularAtomic / 1252 insgesamt**)
und `reviewMethod` bleiben gleich. Die 15 neuen Entscheidungen verwenden den bereits
zulässigen Basiswert `reviewed-current-semantic-recheck-curricular-atomic`.
Actor/Zeit/Begründung bleiben außerhalb der geschlossenen Ledgerzeilen. Die alten
Ledgerbytes mit SHA256 `188ff969598df64e6f455c761f30f65240cba6ad6304558baaefd15b8d82baea`
sind unangetastet.

Der [native begrenzte Kindcheck](native-kind-check.json) akzeptiert Originalquelle/Altledger
und Source15/neuen Kandidaten. Er verwirft Source15/Altledger sowie Altquelle/neuen Ledger.
Alle 15 neuen nativen Fingerprints stimmen mit den erwarteten Source15-Fingerprints
überein. Zusätzliche Actorfelder und erfundene Ledger-Reviewmethoden werden vom
geschlossenen Schema abgewiesen. Die Ausführung lief mit schreibgeschütztem Root,
isoliertem Netzwerk und ausschließlich diesem Paket als schreibbarem Repositorypfad.
Es gab **null kombinierte Produzentläufe**, null SourceA-Probes, Git-, DB- oder
Deploymentaktionen. `postguard.json` bestätigt die unveränderten 1017 gepinnten
Eingaben einschließlich aller Dateien beider alten privaten Quell-/Transportpakete.

**Zusätzlicher konkreter D-Freshness-Hold:** Die [belegten aktuellen D-Inputs](additional-D-freshness-hold.json)
in **10 registrierten Indizes** enthalten für **alle 15 Ziele in beiden Runden
(30 Kontexte)** noch das entfernte Intro in `canonicalContext.requires`. Die Listen
stimmen exakt mit der alten Quelle überein. `buildGoalDescriptionCanonicalContext`
nimmt requires auf; `validateCurrentGoalBindings` vergleicht diesen Kontext exakt
mit der aktuellen Quelle. Bisher kehrte der Produzent bereits wegen des Kind-Holds
vor dem Laden der Runden zurück. Nach einem Kindnachfolger ist deshalb weiterhin
kein vollständiger D-Pass zu erwarten. Die nötigen neuen D-Belege sind durch den
bestehenden D-Prozess zu gewinnen; alte Runden, Actor/Zeit oder Auflösungen dürfen
nicht unter frischen Hashes umetikettiert werden. Dieser Review ist keine blinde
D-Runde. Kein D-Freshnessinput wurde geändert.

A/M-Payloads enthalten weder requires noch Ledgerbytes; kein entsprechender Rebind
folgt aus diesem Delta. Der vorhandene Source15/P15/V-Nachfolger wird hier nicht
erneut freigegeben. In den drei konkreten Transportartefakten (qualifizierter Index,
Capsulemanifest, Math58-Pindatei) wurde keine Referenz auf den Mathematik-Kindledger
oder dessen alten SHA gefunden; allein dieser Kindnachfolger erzwingt dort keinen
identifizierten neuen Bindungswert. Die aktuelle Gesamtauswertung bleibt Roots
separater Entscheidung und tatsächlichem neuen Lauf vorbehalten. **Kein 807-D/P/A/M-
oder 132-V-Gesamtpass, kein M7 und keine Aktivierung werden behauptet.**
'''.replace('CANDIDATE_SHA',native['candidateSha256'])
(P/'README.md').write_text(readme)

files=[]
for path in sorted(P.rglob('*')):
    if path.is_file() and path.name not in {'inventory.json','receipt.json'}:
        b=path.read_bytes();files.append({'path':str(path.relative_to(P)),'sha256':sha(b),'bytes':len(b)})
save('inventory.json',files)
receipt={
    'schemaVersion':1,
    'status':'SEALED_PRIVATE_FIFTEEN_CURRENT_KIND_DECISIONS_WITH_ADDITIONAL_D_FRESHNESS_HOLD',
    'sealedAtActualUTC':datetime.now(timezone.utc).isoformat(),
    'actor':'Codex /root/math15_semantic_kind_review',
    'inventory':{'path':'inventory.json','sha256':sha((P/'inventory.json').read_bytes()),'files':len(files),'bytes':sum(x['bytes'] for x in files)},
    'source15Sha256':review['sourcePins']['after']['sha256'],
    'activeSourceSha256Unchanged':review['sourcePins']['before']['sha256'],
    'oldLedgerSha256Unchanged':review['oldLedger']['sha256'],
    'candidateLedgerSha256':native['candidateSha256'],
    'independentDecisions':15,'kind':'curricularAtomic','unchangedLedgerDecisions':1237,
    'unchangedCounts':delta['countsUnchanged'],'nativeKindChecks':len(native['checks']),
    'additionalDContextHold':{'goals':15,'bothRoundContexts':30,'registeredIndices':10,'inputModified':False,'dProducerRun':False},
    'preservedInputs':len(protected),'activeChanges':False,'producerRuns':0,'sourceAProbes':0,'gitActions':0,
    'M7Claim':False,'humanApprovalClaim':False,'activation':False,
}
save('receipt.json',receipt)
print(json.dumps({'package':str(P.relative_to(R)),'receiptSha256':sha((P/'receipt.json').read_bytes()),'inventorySha256':receipt['inventory']['sha256'],'candidateSha256':native['candidateSha256'],'DHoldGoals':15,'allProtectedInputsUnchanged':True}))
