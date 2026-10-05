# Chemie: unabhängige Vorprüfung des Zwölfer-Kandidaten, Runde A

Stand: 5. Oktober 2026. Ausschließlich inaktive Review-Artefakte; keine Änderung an Canonical, Registry, Ledger, Bildern, Karten oder historischen Reviews. Die Originaldateien der Kandidaten wurden von diesem Reviewer nicht verfasst.

## Ablauf und Befund

1. Operative Beschreibungen, tatsächliche Primärquellen, Ist-Bindungen, Voraussetzungen und A-/M-Vorschläge wurden ohne Öffnen der P-Datei geprüft.
2. Das D-/Quellen-/A-/M-Urteil wurde in [description-source-am-verdict.frozen.json](description-source-am-verdict.frozen.json) eingefroren. [D-before-P.freeze.receipt.json](D-before-P.freeze.receipt.json) hält SHA-256 und die Eingabefassung fest. Diese Urteilsdatei wurde nach Öffnen der P-Datei nicht verändert.
3. Anschließend wurden die P-Kandidaten fallbezogen fachlich geprüft. [positive-evidence-verdict.json](positive-evidence-verdict.json) enthält die unabhängigen Urteile einschließlich Datenhilfe, Transfer, Sprachvergleich und verbleibender Grenzen.

| Prüfung | Ergebnis | Grenze |
| --- | --- | --- |
| Beschreibungen | 10 × KEEP der exakt vorhandenen DE-/EN-Fassung; 1 × alleinige EN-Angleichung bei `11bea4c6`; 1 × HOLD bei `965ca297` | Kein pauschales 12/12. |
| Semantische Atomarität | Elf begrenzte integrierte Kompetenzen akzeptiert | Bei 965 ist die Eigenschaftserklärung zusätzlich selbstständig prüfbar; eine Engführung ohne vollständigen Erhalt wird abgelehnt. Historische A-Artefakte bleiben unverändert. |
| P-Inhalt | 11 × PASS für inaktive Kandidaten, 22 frische bilinguale Fälle | e675 bleibt trotz fachlich passendem P-Inhalt unter einem offenen Quellenbefund. 965 erhält nur eine eng begrenzte Formel-Diagnose, kein vollständiges aktuelles P. |
| P-Profilvertrag | Alle 12 inneren Profile formal gültig | Die Autorenhülle ist kein materialisierter aktueller P-v2-Nachweis; das zwölfte Profil bleibt fachlich unvollständig für das aktuelle Ziel. |
| Zahlen und Erhaltung | 39 unabhängig nachgerechnete Prüfungen bestanden | Schema und richtige Zahlen allein beweisen weder Verständnis noch tatsächliche Lernendenleistung. |
| Bestehende A-/M-Bindungen | Zwölf Ist-Einträge zum Prüfzeitpunkt gültig | Die EN-Angleichung braucht neue betroffene Bindungen. Die zurückgehaltene Salz-Engführung wurde nicht in den Prüf-Overlay übernommen. |
| Memory | Vier erforderliche Karten inhaltlich erhalten; zwölf konfigurierte Sichtprüfungen bestanden | Drei konfigurierte DE-Sichten, jeweils vier Karten-/Ursprungszielpaare. Keine Behauptung zu allen Kohorten oder zur Runtime-Jahrgangsfrontier. |
| Bestehende Visualisierungen | 36 Source-/Frontend-/Backend-Dateibindungen unverändert geprüft | Keine neue fachliche oder visuelle V-Freigabe in dieser Zuständigkeit. Gute vorhandene Assets bleiben erhalten. |

## Tatsächliche Quellenprüfung und offene Grenzen

- **Hessen G9:** Die offizielle PDF wurde aktuell abgerufen; ihre Bytes stimmen mit der erhaltenen Ausgabe überein. Die gedruckten Seiten 16/17/26 wurden textlich gelesen, die Tabellen auf 16/17 auch visuell geprüft. Mengenbegriffe und einfache Gleichungen gehören zum benannten Pflichtteil. Die experimentelle Gas-Formelbestimmung auf Seite 17 steht unter dem fakultativen Teil. Die alte Konstante im historischen PDF wurde nicht umgeschrieben.
- **Bayern:** Die aktuellen Seiten für 8 NTG, 9 andere Ausbildungsrichtungen und 10 andere Ausbildungsrichtungen wurden tatsächlich gelesen. C8.3.6 verlangt relative Atommassen und Molekülformelbestimmung. C9.3.6 nennt Molekülformelbestimmung ohne ausdrücklichen Teilauftrag zu relativen Atommassen. Deshalb bleibt die aktuelle BY9-Exact-Bindung zu **e675** ein gezielt zu lösender Quellengegenbefund. Die operative Kompetenz wird nicht zur Anpassung an diesen engeren Beleg beschnitten.
- **Salze:** C8.4.6 enthält Molekül-Ionen und Eigenschaften; C9.4.7 nennt binäre Salze und Eigenschaften. Die Formel-/Name-Kandidaten zu **965** decken keine Eigenschaftserklärung ab. Ein allgemeines Ionengitter-Voraussetzungsziel oder gleichzeitige statische Sichtbarkeit belegt deren vollständigen fachlichen, Quellen- und Sicht-Erhalt noch nicht. **HOLD bleibt bestehen.**
- **11bea:** Das deutsche Ist-Ziel verlangt bereits Teil- und Gesamtgleichungen; die englische Ist-Fassung lässt diesen Teil aus. Nur die passende EN-Ergänzung ist angenommen. Die P-Aufgabe liefert Teilgleichungen, Ladungen und Transferbedeutung ausdrücklich; die Lernleistung sind Multiplikation, Elektronen-Ausgleich, Addition sowie Atom-/Ladungserhaltung. Das wird nicht als allgemeine Jahrgang-9-Redoxpflicht dargestellt.
- **SI-Daten:** Aktuelle BIPM-Moldefinition und NIST-CODATA-Daten wurden gelesen. Der exakte Avogadro-Wert, gerundete Schulwerte für u und der näherungsweise Zusammenhang von u mit g/mol wurden sachgerecht auseinandergehalten. Gasvolumina sind an Modell, Temperatur und Druck gebunden.

Quellen- und Locator-Details samt Abrufbindungen stehen in der eingefrorenen D-Datei. Die Prüfung der 31 vorhandenen ausgewählten Mapping-Zeilen bestätigt die genaue Ist-Bindung; sie erteilt keine pauschale neue Freigabe aller Quellenzeilen oder Bundesländer.

## Prüfung reproduzieren

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-stoffmenge-twelve-independent-review-a-v1/check-p-contract.mts
```

Der Befehl prüft die unveränderte D-Fassung, den aktuellen inneren P-v2-Profilvertrag und die unabhängig berechneten Daten; er schreibt nur den eigenen P-Receipt. Der vorhandene D-/A-/M-Receipt hält die tatsächlichen Ist-Bindungen **zum früheren Prüfzeitpunkt** fest. Nach einer Integration ist er historische Vorprüfung; aktive Änderungen werden dadurch nicht automatisch freigegeben.

## Integration bleibt getrennt

Root hat angekündigt, e675 und 965 außerhalb eines engeren Zehnerpakets weiterzubearbeiten und zwei neue vollständig aktuelle D-Runden mit dem endgültigen Buchkontext vor P durchführen zu lassen. Diese vorgelagerte Prüfung ersetzt sie nicht. Für eine spätere Integration sind aktuelle operative, Seiten-, Kontext-, Quellen-, Memory- und Visualisierungsbindungen sowie die strengen zentralen Gates gesondert nachzuweisen.

**Fortschritt dieser Zuständigkeit:** null strenge aktuelle Abschlüsse, null integrierte neue fachliche Abschlüsse, null als Abschluss gezählte Bindungswiederherstellungen. Kein Human Approval, kein Human Trial, kein menschliches Release-Gate und keine tatsächliche Lernendenleistung behauptet.
