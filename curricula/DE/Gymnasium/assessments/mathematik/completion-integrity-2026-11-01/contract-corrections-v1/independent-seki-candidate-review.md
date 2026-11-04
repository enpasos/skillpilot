Die unabhängige Nachprüfung der genau 21 Sek-I-Korrekturfälle ist abgeschlossen: **20 PASS, 1 CHANGES_REQUIRED**. Sämtliche ursprünglich dokumentierten Reparaturen sind erledigt. Es bleibt genau ein zusätzlicher Coverage-Eintrag bei `c9d7546d`; das unten exakt gebundene Metadatendelta ist bereits fachlich genehmigt. Mit ausschließlich diesem Delta sind alle 21 Fälle inhaltlich PASS. Aufgaben-, Lösungs- und Rubrikqualität sowie direkte Vorbereitung sind in allen 21 Fällen vertretbar. Das ist keine Source-, Scope-, M7- oder Aktivierungsfreigabe.

Die [21-Fall-Matrix](independent-seki-candidate-review.json) enthält die vollständigen direkten Goalverträge und die Alt-/Neu-Bindungen von Aufgabe, Lösung, Rubrik und Endpunktvertrag. Geprüft wurde gegen den ursprünglichen 60er-Befund (39 PASS / 21 CHANGES_REQUIRED). Keine Aufgabe wurde vom unabhängigen Reviewer neu verfasst.

| Eingabe | SHA-256 |
|---|---|
| `common-offline-canonical-math.released.json` | `9c9a273a6b320fbfeba72567094327f4236b58f354836203aac98d7d70050bce` |
| `candidate-seki-corrections.json` | `b7658298298a0f6e6ae0b37640288b06767482a205b77dfb454669ba6e575160` |
| `common-offline-canonical-math.seki-candidate.json` | `138574f9e007ac03217a1c418167e4b6b9975cd927e7cdd279524f897a404f4d` |
| `seki-endpoint-review.json` | `23e0cfed5480e4d1c898628c9c4d40a7ae98d6688d23d2b001a8d3f5ec0013c8` |

| Endpunkt | Entscheidung | Konkrete Feststellung |
|---|---|---|
| `311ab2f2` | PASS | Nicht ausgeführte Rechengesetz-Coverage entfernt; Zahlrechnung, Rundung und Nachfolgerargument richtig. |
| `b48c65fd` | PASS | Koordinaten-Zeichenclaim entfernt; Rechteck- und Schätzungsaufgabe unverändert richtig. |
| `47c515c9` | PASS | Prozenttextvertrag entfernt; Anteil, Diagrammkritik, Spiegelung und Muster bleiben. |
| `3ce97753` | PASS | Keine tatsächliche Rechnernutzung mehr als Coverage behauptet; Geschwindigkeit richtig. |
| `4ef1ec52` | PASS | Exakt Titel von 5 auf 8 BE geändert; gesamtes examData unverändert. |
| `af96c2fc` | PASS | Sachfremder Diagrammfehlervertrag entfernt; echte Algebra-Verträge bleiben. |
| `df9ecf0f` | PASS | Breiter Methodenvergleich durch vorhandene lineare Algebra-Vorbereitung ersetzt. |
| `9accf4e2` | PASS | Gruppenanzahl zwingend positiv ganzzahlig; reelle Fortsetzung ausdrücklich getrennt. |
| `e96bc8e4` | PASS | Positive Größen lösen Nullfallproblem; falsche Nenner- und Notations-Coverage entfernt. |
| `3045f00d` | PASS | Mantelclaim entfernt; tatsächliche Tangentenzeichnung samt eigenem Rubrikanteil ergänzt. |
| `fbf10244` | PASS | Falsche Tabellenkalkulationsverträge durch lineare Algebra und Prozentrechnung ersetzt. |
| `10a77422` | PASS | Parameterdeutung ersetzt Schnittpunkt- und Geradenaufstellungsclaims. |
| `18db552f` | PASS | Heron-Softwareclaim entfernt; richtige Handrechnung und echte Vorbereitung erhalten. |
| `ec707244` | PASS | Kein Dreiunbekannten-LGS- oder Scheitelermittlungsclaim; Formwahl und Gleichabstandsdeutung passend. |
| `8a360e18` | PASS | Konkretes korrektes Strahlensatz-Gegenbeispiel; Erkennen ersetzt Zeichnen und Software. |
| `5f6496ef` | PASS | Falsche Aussage über die Wirkung der 7/8-Schwelle entfernt; Punkte, Deckel und Schwelle unverändert. |
| `af7905d0` | PASS | 661,6 Wh richtig gerundet; Jahre definiert; überbreite Modellierungsbeziehung entfernt. |
| `c9d7546d` | CHANGES_REQUIRED | Drei Herleitungsclaims entfernt; zusätzlich 0500f77f aus Coverage entfernen, siehe exaktes Delta. |
| `ea664a30` | PASS | Überbreite Mehrkörpermodellierung entfernt; Drohnenrechnung und Kegelvolumen richtig. |
| `c34c6132` | PASS | 45°-Konvention mit halber Tiefe gegeben und bepunktet; Netz, Draufsicht und Verknüpfung erhalten. |
| `0d2cfddc` | PASS | Lesbarer Hyperbelgraph mit echter Ablese- und Graphprobe; keine vorgegebene Lösung. |

Bei **`c9d7546d-3d4a-5f68-b609-831ee8de8877`** verlangt `0500f77f-8c12-5f7e-97b0-a75125eaa99b` ausdrücklich die Termbestimmung **aus einem gegebenen trigonometrischen Graphen**. Teil 3 enthält dagegen nur die bereits abgelesenen Angaben: Mittellinie 6, Amplitude 2, Periode 12, Maximum bei 3. Ein Graph ist nicht vorhanden. Die mathematisch richtige Aufgabe bleibt erhalten; ausschließlich diese Coverage-ID entfällt. Dies ist ein beim vollständigen Nachlesen erkannter Restfehler, der im ersten 60er-Bericht noch nicht einzeln benannt war.

Exakt genehmigte Nachkorrektur, noch nicht in den gebundenen Input geschrieben:

- Ausschließlich `examData.coveredGoalIds` des Goals `c9d7546d-3d4a-5f68-b609-831ee8de8877` ändern.
- Vorher vollständiger normalisierter Goal-SHA: `a914ea49a84674938af28bbae6c914ee6198936d49cb6f864bde5174f572f7df`.
- Nachher vollständiger normalisierter Goal-SHA: `ed0d8ac793bb2e6bf78c67dcff4fec42a77f709ce958535df73e91970596d94b`.
- Vollständige Nachher-Liste in unveränderter Reihenfolge:

```json
[
  "46bdcc16-418f-417a-89cf-033d7ae6c8cc",
  "82597dfb-0ec6-4a77-abaf-e1d6bdd12041",
  "7f11ffe0-7c43-4507-9101-50374a60b0e8",
  "f9fdb733-5838-4983-888a-05624eabbe17"
]
```

Alle übrigen Felder einschließlich `requires`, Aufgabe, Lösung, Rubrik, `reviewStatus: draft` und Reviewnote bleiben exakt gleich. Root kann diese eine Änderung nach dem separaten 28er-Patch anwenden und gegen den vollständigen Nachher-Hash prüfen. Die hier gebundenen 21er-Inputdateien und Receipts werden dafür nicht überschrieben. Die Hashnormalisierung entspricht `scripts/apply_math_assessment_contract_candidates.py::normalized_sha`: UTF-8, sortierte Schlüssel, `ensure_ascii=False`, Separatoren `,` und `:` ohne JSON-Whitespace.

Die zusätzliche Supportkorrektur ist **PASS**: Nur `415bd48b-8a76-4d4f-bfdd-d085573e7ac3 → f0a49da2-018b-4cda-adbd-27047b610a0f` entfällt. Zylindervolumen aus Grundfläche und Höhe benötigt keinen Dreieckskongruenzsatz. Der Kongruenzvertrag selbst und alle übrigen Vorbereitungen bleiben unverändert. Die entfernte Anforderung kommt in diesem Consumer nicht indirekt zurück.
Nachher-Goalhash des Zylindervolumen-Consumers: `6eb6ba7a6c88984c129317f18c877ae548c2dfbe2e0d612dda3df1d09d028cde`.

Der [Hyperbel-SVG](seki-assets/assets/assessment-materials/mathematik/0d2cfddc-7af6-5709-819f-929e6cf9c192/hyperbola.svg) wurde lokal in Chromium gerendert und visuell geprüft. Die Asymptoten x = 2 und y = −1, P = (4, 2) und f(5) = 1 sind gut ablesbar. Die beiden Äste stimmen mit 6/(x−2)−1. Funktionsterm und gesuchte Parameter stehen weder sichtbar noch in Titel, Beschreibung oder Alttext als Lösung.
Gebundener SVG-SHA: `87ccee29de967329c0279ff41cb8682e99f8c64b7da362ea33d20ca9bb9a5b2f`. Der Stimulus muss vor späterer Verwendung bytegleich im vorgesehenen Assetpfad verfügbar sein; Paketexport und tatsächliche Hostanzeige sind hier nicht belegt. Kein Runtimefix wurde vorgenommen.

Selbst ausgeführt: `python scripts/test_math_seki_assessment_candidates.py` – **12 Tests PASS**. Zusätzlich geprüft: exakte Patch-Anwendung im Speicher gegen die gelieferte Kandidatendatei; genau 21 Endpunkte plus ein Supportgoal geändert; alle Punktsummen und bisherigen Schwellen; vollständiger geerbter und expandierter DAG; kein indirekter Rückimport der konkret entfernten direkten Vorbereitungsverträge in ihren Consumern. Die richtige 6224-Aufgabe samt deutscher und englischer Lösung sowie die früheren neun Korrekturfassungen und Prisma-Taskbytes bleiben exakt unverändert. Das ist kein fachlicher Whole-Context-PASS.

**Geltung bleibt separat offen.** Genau diese fünf `applicabilityFromRequires`-Consumer haben geänderte direkte Vorbereitung und benötigen einen frischen tatsächlichen Angebotsvergleich:

- `47c515c9-2174-58c7-a844-6865fc67c243`
- `e96bc8e4-463b-5e86-b0c4-2c87b74d68f5`
- `8a360e18-c40f-5e77-a445-1311a8f8430e`
- `af7905d0-e684-5ea3-99ac-8a045455370e`
- `ea664a30-98be-508e-90ac-5304679814ee`

Die zwölf ehrlich ausgewiesenen Verluste der letzten kanonischen Schutzwurzelroute sind rechnerisch bestätigt und in der JSON einzeln benannt. Sie dürfen durch keine sachfremden Kanten oder falsche Coverage gerettet werden. Ob die betroffenen gewöhnlichen Ziele in einem konkreten Angebot Targetpflichten sind und welche fachlich echten Routen nötig sind, bleibt im finalen Angebots- und Scopeverfahren zu klären. Eine Arbeitsphase beweist keine Klassen-, Landes- oder Kursgeltung. Die Geltung von 4c319/2f8 wird separat entschieden.

Aktiver Canon unverändert: `2888d646a6730203a56cfb8f41fa3bad1388ba3e303b0c8f04f9df9142066986`. Keine Produkt- oder Canonicalwrites, kein Gradle und keine Produktionsläufe. **Vorhandene gültige Mastery bleibt gültig.** Es entstehen weder eine rückwirkende Requalifikation noch ein zweiter Lernendenstatus oder automatisch kopierte Mastery aus Coverage.
