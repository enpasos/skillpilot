# Mathematik B035 – unabhängige positive V2-Autorenschaft

Ergebnis: sieben neue, inhaltsbezogene DE/EN-Kandidaten mit insgesamt 14 unabhängigen Anwendungsfällen. Pro Profil sind mindestens zwei Demonstrationen, frische Variation und unabhängiger Transfer verpflichtend. Alle materiell erzeugten Records sind E1/G1, `needs_human_review` / `ai_candidate`; `reviewRunIds` bleibt entsprechend der Originalkonfiguration leer.

## Umfang und Unabhängigkeit

Vollständig gelesen wurden der Authoring-v2-Prompt, die mathematischen Profilkriterien-v2, das V2-Profilschema und der Kandidatenvertrag im nativen Materialisierer, die vorgegebene positive Konfiguration sowie alle sieben neuen Originalseiten in `bundle/review-input.jsonl`. Ergänzend wurden ausschließlich die unbewerteten Originalziel-/DE/EN-/Kontextfelder aus `round-b/description-review-input.json` gelesen. Keine A/B-Ergebnisrecords, Synthese, fremden Profile oder früheren kanonischen Diffs wurden eingelesen. Die aktuelle Kanonik und das Semantic-Kind-Ledger wurden vom nativen Materialisierer nur lesend zur Gültigkeitsprüfung verwendet; alle sieben ursprünglichen DE/EN-Fassungen wurden zusätzlich gegen den aktuellen Stand geprüft.

Die Seiten sind gebunden an das vorbereitete Buchmodell `sha256:aba0b19bed58b990eda7371063b6343a591db2b4a2917adeb84bae1f3a736f6d` und Bundle `sha256:c0a371043b40b9add2206c5a77c8d3adb61a7ec0042dca3f395f87893ed45210`. Positive Profil-, Ziel- und Eingabefingerprints wurden ausschließlich durch die native V2-Implementierung erzeugt, nicht aus diesen Buchdigests abgeleitet.

Die zentrale positive `.config.json`, ihr `reviewPath`, die Registry und die Kanonik blieben unverändert. Die batchlokale Validierungskonfiguration ist eine Kopie, die ausschließlich `reviewPath` auf den eigenen Prüfbeleg umlegt. Sie ist nicht registriert und vermittelt keine Freigabe. Sämtliche Dateischreibungen dieses Auftrags erfolgten mit `apply_patch`.

## Mathematische Gegenprüfungen

| Ziel | Unabhängige Fälle und geprüfte Ergebnisse |
| --- | --- |
| bf17cada-3ccd-5d9a-b9e3-42065cfdbb01 | Durchschnittskosten: `C(q)=(600+4q)/q=600/q+4`, `C(100)=10`, Grenzwert 4. Neue Beziehung innerhalb derselben gebrochenrationalen Klasse: `R(c)=80c/(4+c)`, `R(0)=0`, `R(4)=40`, `R(12)=60`, Grenzwert 80 und Halbwert-Eingabe 4. |
| d8f1fd06-785e-5d15-a8e5-7d8b36f91287 | Vorwärtsverkettung Zeit–Radius–Fläche: `A(5)=4pi`. Sachbezogene Rückzerlegung einer Anzeige in Spannung und Kalibrierung: `F(U(t))=10+40exp(-t/5)`, `T(0)=50`, `T(5)=10+40/e≈24,7152`. Zwischenvariablen und Bereiche stimmen. |
| ce2eb0a8-8f4e-5a94-b81d-8d7502dccf9c | Unterschiedliche Werte `56/100=0,56` und `3/6=0,5`; gleicher Wert aus zwei Begründungen `30/40=3/4=0,75`. Endliche Beobachtungsquote und modellbedingte Wahrscheinlichkeit werden in beiden Fällen getrennt. Keine Quote für jede Folgegruppe und kein Testentscheid werden behauptet. |
| 5b54f272-f588-5009-8b42-eb15f846d3e2 | `sigma/mu=sqrt(np(1-p))/(np)=sqrt((1-p)/(np))` für `n>=1,0<p<1`. Allgemein gilt bei festem p für `n2>n1` der Quotientenfaktor `sqrt(n1/n2)<1`. Für `(100;0,2)`: `mu=20,sigma=4,CV=0,2`; für `(400;0,2)`: `80,8,0,1`. Rückwärtsfall `p=0,3,CV<=0,1`: `n>=700/3`, kleinste ganze Zahl 234; n=233 scheitert, n=234 erfüllt die Grenze. |
| 18293a33-a5ff-4a0f-9b6a-085f171cbffe | 30 verschiedene Kartons aus einem Los von 120 sowie vier Behälter in jedem von drei Zeitabschnitten, insgesamt zwölf Erfassungen. Geprüft wurden eindeutige Einheit, passende Variablendefinition, Auswahl-/Zeitbezug, Einheiten und Dokumentation fehlender Werte. Nur synthetische Planungsfälle; keine tatsächliche Erhebung, keine Lernenden- oder Personendaten. |
| 3aea4d33-4170-5ecc-82b0-3a3974cc2237 | Würfelschnitt `x+y+z=2`: genau `(2,0,0),(0,2,0),(0,0,2)`, Seitenlängen `2sqrt(2)`. Prismenschnitt `x+z=3`: zyklisch `(3,0,0),(3,1,0),(0,4,3),(0,0,3)`, rechtwinkliges Trapez mit parallelen Seitenlängen 1 und 4. Alle Kanten wurden unabhängig enumeriert; Segmentgrenzen, enthaltene obere Kante, doppelte Treffer und gemeinsame Randflächen wurden geprüft. |
| 7d37513b-fa1a-54cc-9e2a-9279a381f0f0 | Streckung verdoppelt beide orthogonalen Spannvektoren: Dreiecksfläche `3->12`, Faktor 4. Scherung `(x,y,z)->(x+z,y,z)`: Grundfläche 6, Höhe 4, Volumen 24 bleibt erhalten. Zusätzlich unabhängig durch Kreuz-/Spatprodukt geprüft; diese Methode ist im Profil nicht vorgeschrieben. |

Der ausführbare Prüfhelfer enthält numerische Assertions sowie eine unabhängige Kantenenumeration. Die allgemeine Monotonie- und Skalierungsbegründung wurde außerdem algebraisch geprüft; endlich viele numerische Tests werden nicht als allgemeiner Beweis ausgegeben. DE/EN wurden auf gleiche Gegenstände, Bedingungen, Parameter, Rechnungen und Transferansprüche geprüft.

## Native Validierung

Beide nativen Aufrufe waren erfolgreich (Exit 0):

- `materializePositiveGoalEvidenceCandidates.ts` ohne `--write`: `7 current AI candidate profile(s)`; bytegenauer Abgleich gegen den batchlokalen nativen Recordsbeleg.
- `positiveGoalEvidenceReview.ts --mode=check`: 7 konfigurierte Ziele, 0 approved, 7 needs human review, 0 rejected, 0 blocking issues.
- Eigener Prüfhelfer: PASS; exakt geordnete Scope-IDs, sieben aktuelle bilinguale Originalbindungen, 14 Anwendungsfälle und sämtliche mathematischen Assertions gültig.

Die Originalkonfiguration setzt `reviewedResourceTypes: []`. Bilder sind daher keine als geprüft gebundenen Ressourcen dieser Profilspur, keine Leistungsnachweise und erhalten hier keine Freigabe. Keine Originalquellenfreigabe wird behauptet.

Wesentliche Bindungen:

- Kandidaten-Rohbytes: `sha256:34c46f317f0a2ba089957e3d324cc83b30ab012205abd32f7175696cb81df148`
- Originalkonfiguration-Rohbytes: `sha256:b2d51d5d900357de5184c297f4dfcd67eb35e25013e41940d7bee498c2de9946`
- Authoring-Prompt: `sha256:f164aaa2f0c5af439aa62ec9dc333ac01282c6c66c3cffdf37d7d994861e3f29`
- mathematische Profilkriterien: `sha256:12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816`
- V2-Profilschema: `sha256:331d50bf11f99e3de56cf4356034ebbc37fe5b6d47d28d1edd167da57915c944`

Alle sieben exakten Ziel-/Review-Input-/Profilfingerprints stehen im Prüfbericht und im nativen Recordsbeleg.

## Verbleibende Unsicherheit

Drei Profile enthalten ausdrücklichen dissent:

1. `bf17cada...`: Die zulässige erweiterte Funktionsklasse ist im gelieferten Original nicht abschließend definiert. Beide Fälle verwenden dieselbe exemplarische gebrochenrationale Klasse; ihre konkrete Quellenpassung bleibt offen.
2. `5b54f272...`: Strenge Abnahme benötigt `0<p<1`; `p=1` ergibt konstant null, `p=0` einen undefinierten Quotienten. Diese mathematischen Randfälle sind gesichert; ihre explizite curriculare Formulierung wird nicht stillschweigend geändert.
3. `7d37513b...`: Die genau zulässigen Transformationen sind nicht durch eine Originalquellenpassage eingegrenzt. Streckung und einfache vorgegebene Scherung sind begrenzte Kandidatenfälle, kein Anspruch auf beliebige lineare Abbildungen.

Menschliche Prüfung und Root-Gegenprüfung bleiben ausstehend. Keine tatsächliche Lernendenleistung, Autorität über Mastery oder Annahme der Profile wird aus der technischen Gültigkeit abgeleitet.

## Ausführung und Artefakte

Tatsächlich gelesene UTC-Zeiten: Start `2026-09-06T08:11:23Z`, Abschluss der finalen Kandidatenfassung `2026-09-06T08:25:32Z`, abschließende native Prüfungen `2026-09-06T08:25:55Z`. Modellbezeichnung Codex; ein interner Modell-Snapshot wird nicht erfunden.

Kandidaten: `curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-035-sibling-priority-remainder-7-v1.candidates.json`

Eigene Prüfnachweise in diesem Batchordner:

- `positive-evidence-author-check.mjs`
- `positive-evidence-author-check-report.json`
- `positive-evidence-author-native-records.jsonl`
- `positive-evidence-author-validation.config.json`
- `positive-evidence-author-execution.md` (diese Notiz)

Reproduzierbar vom Repository-Root:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-035-sibling-priority-remainder-7-v1/positive-evidence-author-check.mjs
app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-035-sibling-priority-remainder-7-v1/positive-evidence-author-validation.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-035-sibling-priority-remainder-7-v1.candidates.json
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-035-sibling-priority-remainder-7-v1/positive-evidence-author-validation.config.json --mode=check
```
