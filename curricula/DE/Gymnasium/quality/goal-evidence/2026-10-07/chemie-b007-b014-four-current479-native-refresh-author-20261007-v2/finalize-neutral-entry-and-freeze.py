# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json, os, pathlib, shutil, subprocess
ROOT=pathlib.Path.cwd(); OWN=pathlib.Path(__file__).resolve().parent
assert not (OWN/'author.final.freeze.json').exists()
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-nine-current479-bounded-native-author-20261007-v1'
def read(p):return json.loads(p.read_text())
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
links=[]
# Only newly copied preparation directories are writable; historical source paths are unchanged.
for directory in [OWN/'selected-existing-images']:
 directory.chmod(directory.stat().st_mode | 0o200)
for p in (OWN/'selected-existing-images').iterdir():
 target=OLD/'selected-existing-images'/p.name;assert p.read_bytes()==target.read_bytes();b=bind(p);p.unlink();relative=os.path.relpath(target,p.parent);p.symlink_to(relative);links.append({**b,'relativeAlias':relative,'target':str(target.relative_to(ROOT)),'sameBytes':True})
for p in (OWN/'native/public').rglob('*.jpg'):
 target=OWN/'selected-existing-images'/p.name;assert p.read_bytes()==target.read_bytes();b=bind(p);p.unlink();relative=os.path.relpath(target,p.parent);p.symlink_to(relative);links.append({**b,'relativeAlias':relative,'target':str(target.relative_to(ROOT)),'sameBytes':True})
write(OWN/'visualization/portable-existing-asset-links.actual.json',{'role':'Existing exact historical reviewed asset bytes reused via portable relative Git-visible aliases; no new generation or approval','links':links})
ignoredCopies=[]
for p in list(OWN.rglob('*.pdf'))+list(OWN.rglob('*.html')):
 if not p.is_file():continue
 target=p.with_name(p.name+'.bin');target.write_bytes(p.read_bytes());ignoredCopies.append({'localRenderPath':str(p.relative_to(ROOT)),'trackedExactSnapshot':bind(target),'role':'Exact author-render artifact bytes; not curriculum source evidence or publication'})
write(OWN/'native/portable-local-render-snapshots.actual.json',{'role':'Byte-exact durable copies of actually rendered review PDF/HTML, retained with generic non-cache extensions','artifacts':ignoredCopies,'restoration':'For each artifact, copy trackedExactSnapshot.path bytes to localRenderPath if a relocated native review needs that generated cache path. Check the declared SHA-256 first. No regenerated content may masquerade as these actual bytes.'})
raw=read(OWN/'four-current-whole-native-D-and-P-review.author.raw.json')
neutral={'role':'Complete neutral current four-goal review input; no author visual verdicts or peer verdicts','targetGoalIds':raw['targetGoalIds'],'prerequisiteSafeNativeOrder':raw['prerequisiteSafeNativeOrder'],'wholeGoals':raw['wholeGoals'],'actualPDF':'native/four/book.pdf','actualHTML':'native/four/book.html','sourceBoundaries':'source/four-bounded-existing-source-rows-and-original-partner-duties.author.json','humanApproval':False,'independentApproval':False,'strictGain':0}
write(OWN/'four-current-whole-native-D-P-neutral.input.json',neutral)
sel=read(OWN/'nine-current-goals-and-four-bounded-candidates.author.raw.json')
entry={'role':'Neutral frozen author input for two independent current D/P reviews and actual V checks; no peer verdicts','wholeCurrentCanonicalCount':479,'curricularAtomicCount':378,'targetGoalIds':sel['reviewReadyGoalIds'],'heldFiveGoalIds':sel['heldGoalIds'],'wholeCurrentAndCandidateDPNative':'four-current-whole-native-D-P-neutral.input.json','candidateCanonical':'candidate/canonical.current479-four-bounded-proposals.json','completeDEENMaterials':'materials/four-whole-goals-eight-complete-DE-EN-cases.reviewer-ready.md','nativePositiveProfiles':'native/positive-four.current-author-candidate.jsonl','actualPDF':'native/four/book.pdf','actualPDFPageNumbers':[3,4,5,6],'actualPDFPageImages':['native/four/actual-page-'+str(n)+'.png'for n in [3,4,5,6]],'actualHTML':'native/four/book.html','nativeBundle':'native/four/bundle','roundA':'native/four/round-a','roundB':'native/four/round-b','sourceOriginalRowsAndDuties':'source/four-bounded-existing-source-rows-and-original-partner-duties.author.json','primaryReadings':['source/HE-G9-physical12.actual-author-reading.txt','source/HE-KC2024-physical34-35.actual-author-reading.txt','source/HE-current2026-physical34-35.actual-author-reading.txt'],'originalImageFiles':['selected-existing-images/'+gid+'.jpg'for gid in sel['reviewReadyGoalIds']],'imageDisplay360680':'visualization/four-original-assets-display-widths-360-680.review-input.html','portableRenderSnapshots':'native/portable-local-render-snapshots.actual.json','actualNativePreSealCheck':'native/final-persisted-output-pre-seal.actual.validation.json','strictGain':0,'activeWrites':0,'humanApproval':False,'independentApproval':False}
write(OWN/'independent-neutral-review-entry.json',entry)
(OWN/'README.md').write_text('''<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# Vier aktuelle Chemie-Kandidaten auf der Basis 479/378

Dies ist eine isolierte technische Vorbereitung für aktuelle unabhängige D/P-Reviews und die Sichtprüfung der unveränderten JPGs. Der strenge Fortschritt beträgt **0**; aktive Registry, Landschaft und Nachweise wurden nicht geändert.

## Neutraler Einstieg

`independent-neutral-review-entry.json` führt zu den vollständigen aktuellen DE/EN-Zielen, acht vollständigen Aufgaben-/Antwort-/Transferfällen, Originalquellen-Kontext, echten vier PDF-Seiten und zwei unabhängigen nativen leeren Review-Verträgen. Die Runde A und Runde B haben getrennte Independence-Groups. Es gibt keine vom Autor erstellten Review-Records oder Run-Manifeste. Der neutrale Einstieg enthält keine Beobachtungen zu Bildern oder Peer-Befunde.

## Aktuelle Grundlage und Wiederverwendung

Die vier bewachten Feldvorschläge wurden in die aktuelle 479er Chemielandschaft übernommen. Sechs inzwischen integrierte Änderungen an anderen Zielen bleiben vollständig erhalten. Alle übrigen 475 Ziele sind exakt zur aktuellen Basis, sämtliche fünf gehaltenen Ziele unverändert. Die versiegelten Vorgängerartefakte bleiben unberührt.

Das native Vollmodell hat 378 Seiten. Die vier Kandidaten wurden wirklich als native HTML/PDF-Seiten gerendert. Die nativen zwei Kampagnenverträge und vier ehrlichen E1/G1-Profile `ai_candidate`/`needs_human_review` sind schema- und bindungsgültig; dies ist keine fachliche Freigabe. Zwei historische Etikettenmaterialien bleiben bytegleich; sechs andere Fälle bleiben zur Erstprüfung bereit.

Drei gültige historische A-Records, zwei M-Records und die getrennte Arrhenius-Memory-Vorbereitung mit 18 unveränderten Primärkarten wurden erneut nur gegen die aktuellen Bindungen geprüft. Kein historischer Review wurde umgeschrieben. Die unveränderten Arrhenius-Memory-Nachweise bestehen auf dem isolierten 480er Memory-Klon mit sieben konfigurierten Sichten und genau zwei tatsächlich sichtbaren Ziel/Sicht-Paaren. Er fügt kein curricularAtomic-Ziel hinzu.

Für das geänderte Gefahrstoffziel stehen gezielte A/M-Prüfung und aktuelle Karten-/Sichtbarkeitsbindung aus. Die Datei `memory/9e-current-atomicity-and-memory-suitability.pending-author-proposals.json` enthält ausdrücklich unfreigegebene Autorenvorschläge. Vorhandene Bildbytes werden über relative, Git-sichtbare historische Aliase wiederverwendet. Autorensichtungen sind keine unabhängige V-Freigabe.

## Portabilität und Vorbereitungshistorie

Tatsächlich gerenderte PDF/HTML-Dateien besitzen bytegleiche `.bin`-Snapshots; `native/portable-local-render-snapshots.actual.json` dokumentiert die Wiederherstellung dieser lokal ignorierten Darstellungsdateien. Die erste Vorbereitung erreichte das native Rendern und die Kampagnen-/Profilprüfung, scheiterte aber beim letzten Komfortexport an einer fehlenden kopierten Bildkontextdatei. Das Fehlerprotokoll blieb erhalten; der Export wurde aus den unveränderten, real gerenderten Inputs vervollständigt und sämtliche persistierten nativen Inputs anschließend erfolgreich geprüft.

Fünf Quelle-/Split-Grenzfälle, Salze als Originalpflicht, numerische Spannungs-/Referenzzellbegleiter und übergeordnete Source-/Placement-Pflichten bleiben offen. Menschliche Freigaben und reale Lernleistung werden nicht behauptet. Das vollständige aktuelle 479er bzw. isolierte 480er Autoreneingabeobjekt darf keine jüngere aktive Landschaft ersetzen; die spätere Integration ist auf die bewachten Feldänderungen begrenzt.
''')
inputs=read(OWN/'all-declared-input-snapshot-index.actual.json')['inputs']
for r in inputs:
 p=ROOT/r['originalPathAtUse']; assert bind(p)==r['originalBinding'],r['originalPathAtUse']
validation=read(OWN/'native/final-persisted-output-pre-seal.actual.validation.json');assert not validation['errors'];assert validation['profileRecords']==4
write(OWN/'current-input-drift-at-final-freeze.actual.json',{'role':'Exact current declared inputs checked again before freeze; no modified historical input','checkedInputs':len(inputs),'drift':[],'strictGain':0})
files=[p for p in OWN.rglob('*')if p.is_file()and p.name!='author.final.freeze.json'];payloads=[bind(p)for p in sorted(files)]
freeze={'schemaVersion':1,'role':'Immutable technical current479/378 four-candidate input preparation, no author approval','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'payloads':payloads,'relativeExistingAssetAliases':links,'independentReviewEntry':bind(OWN/'independent-neutral-review-entry.json'),'targetGoalIds':sel['reviewReadyGoalIds'],'wholeCanonicalCount':479,'curricularAtomicCount':378,'activeWrites':0,'strictGain':0,'humanApproval':False,'independentApproval':False}
write(OWN/'author.final.freeze.json',freeze)
print(json.dumps({'entry':str((OWN/'independent-neutral-review-entry.json').relative_to(ROOT)),'freeze':bind(OWN/'author.final.freeze.json'),'payloads':len(payloads),'nativeValidationErrors':validation['errors'],'portableImageAliases':len(links),'strictGain':0}))
