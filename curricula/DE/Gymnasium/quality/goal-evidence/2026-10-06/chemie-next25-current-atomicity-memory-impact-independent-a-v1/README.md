# Chemie25: unabhängige gezielte A/M-Vorprüfung

## Ergebnis

Die vorhandenen **25 Atomaritätsentscheidungen und 25 Memory-Entscheidungen sind aktuell gültig**. Bestehende wissenschaftliche Reviews unveränderter Ziele wurden nicht neu begonnen. Die Memory-Entscheidungen sind **6 × memory_required / 19 × no_memory_needed**; zwei referenzierte Decks mit insgesamt **22 kept-Karten** behalten ihre tatsächlichen Fingerprints, `necessary: true` und ursprünglichen Herkunftsbindungen.

Der EN-only-Kandidat verändert tatsächlich ausschließlich `descriptionEn` von `3bc48951-025c-5144-99b1-924db611a5f9`. Seine 478 übrigen ganzen Ziele, alle 479 `requires`/`contains` und die 127 geschützten ganzen Chemieziele sind exakt erhalten. Ganze aktuelle DE/EN- und Kandidatenziele wurden gelesen. Die bislang ausgelassene englische Erklärung von Elektronenverteilungen in **Atomen und Atom-Ionen** ist bereits Teil des deutschen Kompetenzumfangs.

**Gezielter wissenschaftlicher Entscheid für genau diesen EN-only-Kandidaten: atomic KEEP und memory_required KEEP.** Die Memory-Zuordnung bleibt `1e519951-9850-5a07-ac82-d9f0075e3d05` → `de_gymnasium_chemistry_bonding_structure` → `chem_bond_008`. Die unveränderte konkrete Karte dient dem kompakten Abruf von Aufbau-/Pauli-/Hund-Regel. Sie beweist nicht die Erklärung der Natrium-Doppellinie, der vollständigen PSE-Anordnung oder beliebiger Atom-Ion-Konfigurationen. Keine neue Karte oder neues Deck ist erforderlich oder erzeugt worden.

**3bc-Sichtbindung bleibt ausdrücklich HOLD.** Die native Ein-Ziel-Vorschau und ein positiver technischer Check sind keine vollständige M-/GUI-Superset-Freigabe.

## Eingänge und exakte Gültigkeit

RAW-v1: `chemie-next-coherent-current-gap-native-author-v1/exact-current25-native-d-p-review-input-routing.author.json`, durch tatsächlichen historischen Autorfreeze `fefb94c429e677895dcf3afe1f45392644336ebc830b972859b265eec984369c` gebunden. Es wurden dessen Roh-Ziel-IDs und technische Route, keine neuen D/P-/V-Peerverdikte verwendet.

RAW-v2: `chemie-next-coherent-current-gap-native-author-v2/canonical.en-only-before-final-pngs.author-candidate.json`. Das ist noch eine **unversiegelte Vorbereitung vor den sieben endgültigen Rasterbindungen**, kein fertiger operativer Native-D/P/A/M/V-Stand. Beide konkreten Ganzkanonstände wurden vor den Checks in eigenen isolierten Snapshots gebunden. Alle 31 tatsächlich verwendeten ursprünglichen Konfigurations-/Ledger-/Goal-/Deck-/View-/Helper-/Policy-Eingänge sind beim abschließenden Guard unverändert exakt.

Die aktive zentrale Registry führt die A-Zeilen der 25 Ziele durch vier bestehende Configs mit **13 + 8 + 3 + 1** passenden Zeilen. Der aktive M-Config bleibt `canonical-chemistry-full` mit seinen ursprünglichen drei Sicht-Scopes. Sämtliche Original-Reviewer, Daten, Gründe, Status- und Kartenfelder unveränderter Zeilen werden bytegleich wiederverwendet; historische Ledgers und Configs werden nicht umgeschrieben.

## Tatsächliche native Fingerprintwirkung

`measure-actual-native-functions-and-stage-bounded-fixtures.mjs` liest die **unveränderten Originaldefinitionen** von `semanticAtomicityReview.ts` und `memoryCardReview.ts`; deren genaue Funktions- und Source-Hashes sind gebunden. Es transpiliert diese Definitionen nur für lesende Funktionsaufrufe. Die anschließend ausgeführten CLI-Checks verwenden die echten unveränderten nativen Skripte, keine ersetzte Prüflogik.

Beide semantischen Fingerprints enthalten DE/EN-Titel und -Beschreibungen sowie die bestehenden semantischen Metadaten. `resourceLinks` und Rasterbytes sind in A/M nicht enthalten. Ein ausdrücklich künstlicher Abhängigkeitsprobe-Eingang ersetzt für genau die sieben angekündigten Bildziele die Ressourcenfelder; beide Originalfunktionen liefern weiterhin denselben A/M-Fingerprint. Das ist **keine Bildprüfung, keine Erzeugung oder Bildfreigabe**. Endgültige Bild-/Seiten-/D/P/V-Bindungen bleiben andere Prüfstränge.

| Gate / 3bc | Aktuell | EN-only-Vorschau |
| --- | --- | --- |
| A | `sha256:5ef2e7a49c2e1ea2ef4e780158d5730d598f128a73161ce4bcf3d1dc4fd96190` | `sha256:b75ae825e4308f297a44827461f816e887731d9299de376f17f1c434ecde500e` |
| M | `sha256:326e98883a8dd5cae1d7d76c9760cff21391fb62db015e19289bd5e9c57683ea` | `sha256:f4d23af3743f0c4fc8ea9c171bff32d9ef7774167293ff3a89ddcb598cbbe00e` |

Genau **eine A- und eine M-Zeile** werden durch die EN-Korrektur technisch stale. Die sieben reinen Ressourcenänderungen erzeugen keine weitere semantische A/M-Staleness. Die neuen Ein-Ziel-Zeilen sind wissenschaftlich neu begründete, isolierte **candidate-preview**-Artefakte; sie binden diesen konkreten EN-only-Snapshot. Bei einem späteren Meta-Basis-/Endstandwechsel sind tatsächliche Gleichheit der semantischen Payloads und native Fingerprints zu prüfen. Weder bloßes Retaggen noch ein pauschales `--write-fingerprints` ist erfolgt.

## Unveränderte native Checks: 9 begrenzte Läufe

`run-bounded-native-checks.py` führt ausschließlich `--mode=check` aus; kein Bootstrap, kein Fingerprint-Schreibflag und kein Report-Schreibflag. Stdout, Stderr und tatsächliche Exitcodes liegen unter `qa-artifacts/`.

| Konkreter Lauf | Ergebnis |
| --- | --- |
| Aktuelle A-Zeilen in vier exakten Teilscope-Configs (13/8/3/1) | 4 × Exit 0 |
| Neue EN-Beschreibung gegen die alte einzelne A-Zeile | Exit 1, **stale** |
| Neue EN-Beschreibung gegen unabhängig neu begründete A-Vorschau | Exit 0 |
| Aktuelle M-Zeilen plus unveränderte gemeinsame Karten-Herkunft | Exit 0 |
| Neue EN-Beschreibung gegen alte M-Zeile | Exit 1, **stale / fehlende aktuelle Karten-Originbindung** |
| Neue EN-Beschreibung gegen unabhängig neu begründete M-Vorschau | Exit 0 |

Die beiden gemeinsamen Decks haben Kartenherkunft außerhalb der 25 Arbeitsziele. Damit der echte native Kartenvertrag erhalten bleibt, enthält die begrenzte M-Prüfsicht **41 bestehende normale Herkunfts-/Arbeitsziele + 2 bestehende Memoryziele**, nicht nur 25 unvollständige Originzeilen. Die zusätzlichen unveränderten Herkunftszeilen werden technisch exakt wiederverwendet, wissenschaftlich nicht neu geprüft. Alle 22 bestehenden Karten bleiben `kept`, `necessary: true`; keine Removal-/Review-Schuld wird umgedeutet.

## Konkreter Sicht-HOLD für 3bc

| Tatsächliche konfigurierte Lernendensicht | Sichtbare Ziele aus den 25 | Sichtbare memory_required-Arbeitsziele aus den 25 | 3bc selbst sichtbar? | Referenz-Memoryziel 1e519 sichtbar? |
| --- | --- | --- | --- | --- |
| Chemie Gymnasium GK (DE) | 22 | 5 | Nein | Ja |
| Chemie Gymnasium LK (DE) | 22 | 5 | Nein | Ja |
| Chemie Gymnasium Sek I (DE) | 14 | 5 | Nein | Ja |

Die 15 tatsächlich ausgelösten konditionalen Prüfungen der fünf dort sichtbaren Memory-Arbeitsziele bestehen. **Für 3bc selbst wurde in diesen drei Scopes kein konditionaler Sichtnachweis ausgeführt**, weil das Arbeitsziel dort nicht sichtbar ist. Die ganze Menge sichtbarer Ziele bleibt zwischen aktuellem und EN-only-Snapshot exakt. Der Original-Config setzt `visibilityScopeCoverageRequired` nicht; dieses Flag wurde nicht verändert oder zum Umgehen eines Fehlers abgesenkt. Ein PASS dieser bestehenden Config beweist daher nicht die fehlende konkrete 3bc-Ziel-/Memory-Sichtpaarung.

Nächster notwendiger begrenzter Schritt: tatsächliche betroffene **learner-facing** Kompositionssichten identifizieren, in denen 3bc als Ziel sichtbar ist, und in derselben Sicht das Referenz-Memoryziel 1e519 samt unverändertem Deck/Karte prüfen. Source-book-only-Sichten dürfen nicht automatisch als Lernenden-Memory-Sichtnachweis ausgegeben werden. Dies ist ein offen dokumentierter Bindungs-HOLD, keine Quellen-/Whole-Superset-Freigabe oder Aufforderung zu einer Checker-Ausnahme.

## Abschlussgrenzen

Keine aktive Datei, keine historische Reviewdatei und keine native Prüflogik wurde geändert. Keine neuen D/P/V-/Whole-Source-Gates, keine vollständige Länder-/GUI-Superset-Freigabe, keine menschliche Freigabe oder Erprobung und keine echten Lernendenbeweise. Die sieben endgültigen PNG-Freigaben sind nicht Teil dieser Aufgabe.

**Neue strenge Abschlüsse 0; neue aktive Bindungsrestaurierungen 0; Nettozuwachs 0.** Wissenschaftliche Ein-Ziel-Entscheidung, aktuelle technische Gültigkeit und offene operative Endstand-/Sichtbindung sind getrennt dokumentiert. Nach diesem Freeze beginnt hier keine neue Aufgabe.
