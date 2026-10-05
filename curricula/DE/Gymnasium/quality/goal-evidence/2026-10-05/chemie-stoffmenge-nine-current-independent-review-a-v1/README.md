# Aktuelle unabhängige Beschreibungsreview Chemie B013, Runde A

Die neue aktuelle Neuner-Runde ist unabhängig von fremden Reviewentscheidungen
geprüft und in `frozen-receipt.json` eingefroren. Alle neun Entscheidungen lauten
`keep`, jeweils mit sechs zielbezogenen DE/EN-Verständnisnachweisen und der
Empfehlung `create` für `positive-understanding-evidence-v2`. Die Ergebnisse
bleiben `candidate` / `ai_candidate`; es wird keine menschliche Freigabe behauptet.

## Aktuelle Bindungen

- BookModel: `sha256:d4db3e89d3b1bb4f59d3a9588bd02dea00547dc4116a6c4b6d0a53c3071ccd22`
- Bundle: `sha256:a4e79b98d9b49310751f80ef24fe684e8d2bbf8b7a8aa31a2135aae8473012b1`
- PDF-Datei: `sha256:606fe821352c19116c9c66219dc9a5aba217ec20a3ae271f08f6809efbbe1593`
- Records: `sha256:61c734818d45566f5dac12f29800ccb477d571c129b1e3d8db38dd0e2bd2a2f2`
- Run: `sha256:71016befe0ee533556023931d2948bdc1045e53b1a926182ba305d85dad2bdef`
- Frozen Receipt: `sha256:998453b4d22c229ad3b8b13a26f9448dfeed82ab2b0ba2b060142671f3cb36df`

Die aktuellen Dateien liegen ausschließlich im zugehörigen B013-
`round-a/results/` als
`chemie-rollout-v1-batch-013-stoffmenge-revised-nine-current-v1-20261005-first-pass-a.batch-001.records.jsonl`
und gleichnamige `.run.json`. Die eigene erste Zehner-Runde wurde nicht verändert.

## Tatsächliche aktuelle Prüfung

Das aktuelle PDF hat elf physische Seiten, darunter zwei Vorspannseiten.
Alle neun Lernzielseiten wurden neu mit Poppler 22.02.0 bei 105 dpi gerendert
und tatsächlich mit `view_image` angesehen: physische Seiten 3–11 entsprechen
logischen Lernzielseiten 1–9. Vollständige IDs und Beschreibungen, Abbildungen,
Kapitelkontext sowie unmittelbare Vor-/Nachbedingungen wurden geprüft.
Die aktuellen englischen Texte, kanonischen Kontextfelder und Fingerprints
stammen aus dem gebundenen neuen Runde-A-Input. Die Seiten-PNG-Digests stehen
im Receipt; der alte PDF-Render wurde nicht als aktueller Nachweis verwendet.

Die sieben präzisierten Beschreibungen wurden einzeln auf korrekte fachliche
Bedeutung, DE/EN-Äquivalenz, ursprünglichen Umfang und semantische Atomarität
geprüft:

- Festgelegte Teilchen und eindeutige Molangabe gehören zum Begriff Stoffmenge;
  ein zusätzlicher Avogadro-Rechenauftrag wird daraus nicht abgeleitet.
- Masse pro Stoffmenge, Formelbezug und m/n-Verknüpfung beschreiben dieselbe
  molare Masse. Formelermittlung und Reaktionsumsatz bleiben eigene Kompetenzen.
- u und g sind unterschiedliche Einheiten derselben Massengröße. Die
  Teilchen-/Portionsverknüpfung bleibt derselbe Größenbezug und keine neue
  Messkompetenz; eine einzelne Teilchenmasse darf auch in g angegeben werden.
- Bei der Avogadro-These werden die schon geltenden Bedingungen Temperatur,
  Druck und ideales Gasmodell ausdrücklich. Eine vollständige Herleitung der
  idealen Gasgleichung oder neue Versuchsreihe wird nicht verlangt.
- Die Gas-Masse-Inferenz benutzt Masse und Volumen bei bekannten Bedingungen
  zusammen mit einem passenden gegebenen molaren Volumen. Sie führt keine
  neue Gaswägungsdurchführung, Gemischanalyse oder Zustandsgleichungsherleitung ein.
- Die Zweiatomigkeit wird an einem gegebenen oder bereits erarbeiteten
  Teilchenmodell erklärt. Die dargestellten zwei gleichen Atome begründen
  den Formelindex; daraus entsteht kein neuer Bindungsalgorithmus, keine
  experimentelle Formelermittlung und kein allgemeines Gleichungslöseverfahren.
- Der Schluss aus CO₂/H₂O-Nachweisen auf C/H in der Probe ist die schon
  beanspruchte qualitative Analyse. Bereitgestellte zuverlässige Daten genügen;
  quantitative Verhältnisse, Summenformeln und selbständig ausgeführte gefährliche
  Verbrennungen werden nicht ergänzt. Mögliche Kontamination und geeignete
  Blindproben gehören zur Belastbarkeit des qualitativen Schlusses.

Die beiden unveränderten Beschreibungen zur Avogadro-Konstante und zum molaren
Volumen wurden ebenfalls erneut im aktuellen Seiten-/Textkontext geprüft und
erhalten eigene aktuelle Bindungen. Für die Konstante bleibt ein gerundeter
Schulwert eine Näherung des heutigen exakten SI-Wertes; V_m bleibt an seine
Druck-/Temperaturbedingungen gebunden.

Das Ziel `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` gehört nicht zu diesem Batch.
Seine vorhandene externe Voraussetzung der Elementaranalyse ist im aktuellen
Input und PDF sichtbar. Diese Runde erteilt ihm keine neue Entscheidung und
ändert seine globale `curricularAtomic`-Zugehörigkeit nicht.

## Unabhängigkeit, Quellen und Ausführung

Es wurden vor dem Freeze keine fremden ersten oder aktuellen Runden,
Sibling-Verdicts, Root-Adjudication, P-Profile oder kanonischen Diffs gelesen.
Die eigene frühere Sachkenntnis und die eigenen Evidenzformulierungen wurden
wie ausdrücklich beauftragt genutzt und an die tatsächlich geprüften aktuellen
Texte angepasst. Pfad und Digest der eigenen früheren Records stehen im Receipt.
Es wurde kein Kindagent gestartet.

Die Primärquellen wurden in der eigenen vorherigen Runde dieses selben
Agenten unmittelbar gelesen. Die neue Runde nutzt diese Sachkenntnis; eine
erneute Quellenabfrage wird nicht behauptet:

- [HE G9 Chemie, gedruckte Seiten 16, 17 und 26](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf).
- [BY Chemie 8 NTG, insbesondere LB3](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie).
- [BIPM: Mole](https://www.bipm.org/en/si-base-units/mole).

Roh-Applicability ist keine vollständige Prüfung aller effektiven Länder- oder
Jahrgangsprojektionen. Es wird keine vollständige externe Mappingfreigabe
beansprucht. Die tatsächlich angesehenen Bilder sind Unterrichtskontext und
erhalten durch diese D-Runde keine zusätzliche V- oder menschliche Freigabe.

Die Ausführung war eine lokale OpenAI-Codex-Agentensitzung. Eine konkrete
Provider-API-Modell-ID, Generierungsparameter oder Provider-Zeitstempel lagen
nicht vor und werden als `unexposed` geführt. Tatsächliche Toolchain und
Ausführungskenntnis stehen in `execution-parameters.json`. Der Run-Start ist
die erste für diese neue Runde erfasste tatsächliche UTC-Uhrzeit;
vorbereitende Instruktions-/Input-Lesevorgänge gingen ihr voraus. Abschluss
und Freeze verwenden die tatsächliche lokale UTC-Uhrzeit.

## Validierung

Das tatsächlich mit dieser Runde gebundene Record-Schema und das vorhandene
Run-Manifest-Schema wurden verwendet. Der technische Kampagnenvalidator meldete:

```text
Goal-description review batch valid: 9
```

`validation.json` dokumentiert außerdem alle zwölf tatsächlichen
Bundle-Dateien gegen Digest und Bytezahl, neu berechnete semantische
BookModel-/Bundle-Digests, exakte Reihenfolge und Anzahl der neun IDs,
aktuelle DE/EN-Text-/Goal-/Page-Bindungen und unveränderte eingefrorene Outputs.
Kanonische Daten, Registry, Ledger, P-Profile und andere Reviewrunden wurden
nicht verändert.
