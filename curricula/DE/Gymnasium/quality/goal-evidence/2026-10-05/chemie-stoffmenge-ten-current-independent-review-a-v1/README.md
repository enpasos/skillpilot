# Unabhängige aktuelle Beschreibungsreview Chemie, Runde A

Die zehn Entscheidungen sind in `frozen-receipt.json` eingefroren. Alle zehn
lauten `keep`; jedes Ziel hat sechs eigene DE/EN-Felder für Verständnis,
beobachtbare Leistung und einen fachlich veränderten Transferfall. Für alle
zehn bisher nicht mitgelieferten Evidenzprofile lautet die Empfehlung `create`
unter `positive-understanding-evidence-v2`. Das sind ausschließlich
`candidate` / `ai_candidate`, keine menschliche Freigabe.

## Gebundene aktuelle Artefakte

- BookModel: `sha256:faa6f1912fc6fa17cb3ce21cc036a7b50b1d7a6bb5b8ff0e46c1790de4d0a0cc`
- Bundle: `sha256:e7f0fe1ec2dbbdbfd21a18c1135c6ad3eae6e33fe72fd7c9eb7facc7f5342c67`
- PDF-Datei: `sha256:20fb5d4d2b86e434babae7cb70bc755823a859eb2334e7dacaa7e09e73a372b7`
- Records: `sha256:690726b7139c5ed51f51bfd9a2cc44981cd88e0a2de38e387365a6d1a7b4540f`
- Run: `sha256:abcee554b4b177b1ec0e65c09af1e46535578a3918cf9f1c283885bd30dcff36`
- Frozen Receipt: `sha256:50350bb7c16d7f24e5908635a3d1ebc5cbf7d2c70e984e49a586e8d192b8ac1f`

Ergebnisse liegen im zugehörigen aktuellen `round-a/results/` als
`chemie-rollout-v1-batch-012-stoffmenge-current-10-v1-20261005-first-pass-a.batch-001.records.jsonl`
und gleichnamige `.run.json`. Kein kanonischer Text, Registry, Ledger,
P-Profil oder Inhalt einer anderen Runde wurde verändert.

## Tatsächliche Prüfung

Das aktuelle PDF besitzt zwei Vorspannseiten und zehn Lernzielseiten.
Mit Poppler 22.02.0 wurden die tatsächlichen PDF-Seiten bei 105 dpi gerendert.
`view_image` wurde für alle zehn Lernzielseiten verwendet: physische Seiten
3–12 entsprechen logischen Lernzielseiten 1–10. IDs, vollständige Beschreibungen,
Abbildungen und unmittelbare Vor-/Nachbedingungen wurden angesehen.
Die zugehörigen EN-Texte und kanonischen Kontextfelder wurden aus dem aktuellen,
gebundenen Runde-A-Input gelesen. Die PNG-Digests stehen im Receipt.

Die fachliche Prüfung behandelte insbesondere:

- Stoffmenge und spezifizierte Teilcheneinheit getrennt von Masse und Anzahl;
- molare Masse als zusammengehöriges Bestimmen und Anwenden einer Größe;
- u und g als zwei Masseneinheiten, ohne exklusive Zuordnung zu Teilchen oder Portion;
- den heutigen exakten Avogadro-Wert gegenüber historischen Schulnäherungen;
- gleichen Druck und gleiche Temperatur sowie den Modellbereich bei Gasbezügen;
- Gasmasse aus einem passenden Stoffmengen-/Volumenbezug;
- zweiatomige wichtige Elementgase ohne Verallgemeinerung auf alle Elementgase;
- einfache Gleichungsdarstellungen einschließlich der aktuell in beiden Sprachen
  enthaltenen Teil-/Gesamtgleichungen; das besondere Nachfolgeziel zur Herleitung
  von Redoxgleichungen mit Oxidationszahlen wurde nicht hineingelesen;
- qualitative Elementnachweise, Beobachtung und Schlussfolgerung sowie
  Kontaminations- und Blindprobenbefunde; keine quantitative Formelermittlung.

Alle Beschreibungen wurden einzeln fachlich und auf semantische Atomarität
beurteilt. Bestimmen/Deuten beziehungsweise Darstellen/Anwenden beziehen sich
hier jeweils auf dieselbe Beziehung oder Eigenschaft. Die Bilddarstellungen
gelten als Unterrichtskontext und nicht als Beweis einer unabhängigen
Lernendenleistung oder als separate V-Freigabe.

## Quellen

Primärtexte wurden unmittelbar gelesen:

- [HE G9 Chemie, gedruckte Seiten 16, 17 und 26](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-chemie.pdf):
  Größen-/Gasbezüge, einfache Gleichungen und qualitative Elementaranalyse.
- [BY Chemie 8 NTG](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie):
  LB1 Symbolsprache; LB3 Gaswägung, Avogadro-Hypothese, Größen und
  Umrechnungsgrößen sowie einfache Kohlenwasserstoffverbrennungen.
- [BY Chemie 10](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch)
  und [BY Chemie 10 NTG](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg):
  LB1 benennt ausdrücklich Teil- und Gesamtgleichungen. Auf diesen Seiten
  wurde keine ausdrückliche Klausel zur qualitativen Elementaranalyse gefunden;
  diese Kompetenz wird hier unmittelbar mit HE S.26 geprüft.
- [BIPM: Mole](https://www.bipm.org/en/si-base-units/mole): spezifizierte
  elementare Einheiten und exakter Wert `6.02214076 × 10^23 mol^-1`.

Die Roh-Applicability des Inputs ist keine Bestätigung aller tatsächlichen
Länder-/Jahrgangsprojektionen. Es wird keine vollständige Mappingfreigabe behauptet.

## Unabhängigkeit und Ausführung

Vor dem Freeze wurden keine Inhalte aus Runde B, früheren Candidate-D/P-Vermerken,
Synthese, Adjudication, P oder fremden Verdicts geöffnet. Eine anfängliche
Dateiliste zeigte Nachbar-Dateinamen; deren Inhalte blieben ungelesen.
Es wurde kein Kindagent gestartet.

Die Ausführung war eine lokale OpenAI-Codex-Agentensitzung. Eine konkrete
Provider-API-Modell-ID, API-Generierungsparameter oder Provider-Zeitstempel
standen nicht zur Verfügung und werden als `unexposed` geführt.
`execution-parameters.json` enthält die tatsächlich bekannte Toolchain.
Der Run-Start ist die erste erfasste UTC-Uhrzeit dieser Prüfung;
vorbereitende Instruktions-/Input-Lesevorgänge gingen diesem Zeitpunkt voraus.
Abschluss und Freeze verwenden tatsächliche lokale UTC-Uhrzeiten.

Der im Auftrag genannte `goal-evidence-ai-review-record.schema.json` existiert
hier nicht. Verwendet wurde das tatsächlich mit Runde A gebundene
`contracts/goal-description-review-record.schema.json` sowie das vorhandene
`goal-evidence-ai-run-manifest.schema.json`.

## Validierung

`app/scripts/validateGoalDescriptionReviewCampaign.ts` meldete:

```text
Goal-description review batch valid: 10
```

`validation.json` dokumentiert außerdem die Prüfung aller zwölf Bundle-Artefakte
gegen tatsächliche Dateibytes und Größen, die neu berechneten semantischen
BookModel- und Bundle-Digests, die exakte Reihenfolge der zehn IDs,
aktuelle Text-/Goal-/Page-Bindungen und unveränderte eingefrorene Outputs.
