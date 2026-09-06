# B033a — unabhängiger AI-Inhaltsreview der vier positiven Profile

Stand: 2026-09-06. Ergebnis: **4 × KEEP als fachliche AI-Empfehlung**, keine materiellen Inhaltsmängel gefunden. Dies ist ein eigenständiger Inhaltsreview der Profile, kein neuer Blind-Beschreibungsreview, keine `human_authoritative`-Entscheidung und keine Aussage über tatsächliche Lernendenleistungen. Die Kandidaten bleiben E1/G1; Modellzustimmung ist keine menschliche Freigabe.

## Gelesener Stand und Grenze

Vollständig gelesen wurden die [Mathematik-Kriterien v2](../../../../../goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md) (139 Zeilen), die [vier Kandidaten](../../../../../goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-033a-functions-4-v1.candidates.json) (261 Zeilen) sowie die vier vollständigen aktuellen Records aus `canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`, einschließlich Beschreibungen DE/EN, demandLevel, Phase, direkter Voraussetzungen, Eltern und applicability. Keine erneute breite Quellen- oder Assessmentprüfung.

Aufnahmestand 2026-09-06T05:19:50.740Z; SHA-256 der UTF-8-Dateien:

- Kandidaten: `073baca230b420f4ceaef759f198b3daea04e8fd06f84fc119e85ad5d7ad4ee9`.
- Kriterien: `12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816`.

## Einzelentscheidungen und Rechnungsprüfung

### c65ecabf-d00b-4e2d-99ae-b64692325ffb — Funktionswerte berechnen — KEEP

Aktueller Scope: E, AB1, GK/LK; Auswerten konkreter Eingaben und Deuten als zugehörige Ausgaben. Das Profil `procedure` trifft diesen Scope. Es verlangt weder Umkehrfunktionen noch zusätzliche Graphenkonstruktionen.

Die Ergebnisse stimmen: `3·(−1)−2=−5`, `3·4−2=10`, `−(−2)²=−4`, `(−(−2))²=4`, `(−2)²=4`. Klammerung und das außenstehende Minus sind korrekt unterschieden. Beide Fälle verlangen ausdrücklich die Eingabe-Ausgabe-Deutung; der zweite macht zusätzlich die Zuordnung verschiedener Eingaben zur gleichen Ausgabe sichtbar. Das ist noch Deutung der konkreten Werte, keine neue Injektivitäts- oder Umkehrkompetenz. DE/EN sind gleichwertig.

### d8c9eb57-1614-4c1d-829a-618134def352 — Symmetrie von Funktionsgraphen nachweisen — KEEP

Aktueller Scope: E, AB2, GK/LK; rechnerischer Nachweis einschließlich Definitionsmenge. `proof` passt. Die allgemeine Termidentität wird nicht durch einzelne passende Zahlenpaare ersetzt; einzelne Gegenbeispiele werden zulässig zum Ausschluss verwendet.

Auf R gilt `p(−x)=p(x)` für `p=x⁴−x²`; `p(2)=p(−2)=12` widerspricht Ursprungssymmetrie. Für `q=x³−x` gilt `q(−x)=−q(x)`; `q(2)=6` und `q(−2)=−6` schließen y-Achsensymmetrie aus. Bei `h=x²` auf `[−2,2]` ist y-Achsensymmetrie nachgewiesen und Ursprungssymmetrie durch die Werte bei ±1 ausgeschlossen. Auf `[−1,2]` fehlen zu `(2,4)` sowohl `(-2,4)` als auch `(-2,-4)`: Beide Symmetrien scheitern an der Definitionsmenge. Die Termgleichheit auf dem gemeinsamen Teilbereich wird nicht fälschlich zur Aussage über den gesamten Graphen erhoben. DE/EN bilden dieselben Bedingungen und Schlussrichtungen ab.

### 53b47494-ec60-4128-840d-2a4c4bab6d32 — Winkel auf den Grundbereich zurückführen — KEEP

Aktueller Scope: J10, AB2, core; Einheitskreis und Erläuterung der Reduktionsschritte. Die Koordinatendeutung ist die gegebene Voraussetzung, nicht eine zusätzlich verlangte Umkehrfunktionskompetenz. `representation` und der nicht numerisch bestimmte Winkel bleiben alters- und zielgerecht.

`13π/6−2π=π/6` mit `(cos,sin)=(√3/2,1/2)` und `−π/3+2π=5π/3` mit `(1/2,−√3/2)` sind richtig. `(3/5,4/5)` liegt auf dem Einheitskreis. Für `α−6π` liefern drei ganze Umdrehungen den gleichen Punkt bei α. `4π−α` wird durch Periodizität zunächst zu `2π−α`; dessen Punkt entsteht gegenüber α durch Spiegelung an der waagerechten Achse, also `(3/5,−4/5)`. Das Profil behauptet gerade nicht, eine Spiegelung ließe beide Koordinaten unverändert. `−4π` führt zu `(1,0)`; die erläuterte Zulassung von 0 oder 2π erzwingt keine im Ziel fehlende halboffene Konvention. Beide Sprachfassungen stimmen einschließlich Vorzeichen, Drehsinn und fehlender numerischer α-Berechnung überein.

### 30c013ac-5164-4c3c-8bc1-9a10b2f49533 — Ganzzahlige Potenzfunktionen beschreiben — KEEP

Aktueller Scope: J9, AB1, core; bekannte charakteristische Eigenschaften beschreiben und typische Verläufe vergleichen. Die zusätzliche Einordnung unter einem E-Cluster rechtfertigt keine Anhebung: Das Profil bleibt ausdrücklich ohne Ableitungen, formale Grenzwertberechnung oder neue allgemeine Beweispflicht. `concept` ist passend.

Vorzeichen, Symmetrie, Punkte und Verlauf von `x²` und `x³` sind korrekt. Für `x⁻²` und `x⁻³` sind auf dem vorgegebenen Bereich `x≠0` Vorzeichen und Symmetrie richtig; ihre Beträge wachsen bei Annäherung an null und gehen bei großem Betrag von x gegen null. Das Vorzeichen von `x⁻³` bleibt abhängig von x; die Formulierung über Beträge macht keine falsche beidseitige Aussage über +∞. Der Gegensatz zu den beiden positiven Potenzen stimmt.

`h(x)=x⁰=1` wird ausdrücklich nur für `x≠0` definiert. Konstanz und y-Achsensymmetrie auf dieser symmetrischen Definitionsmenge sind richtig. Weder Aufgabe noch Erwartung legen `0⁰` fest oder verlangen eine Fortsetzung bei null. DE/EN bewahren diese Grenze vollständig.

## Erwartungsabdeckung, Variation und Unabhängigkeit

Alle deklarierten Erwartungen sind erforderlich; es gibt keine ausweichenden Alternativgruppen. Die Fälle decken sie gemeinsam konkret ab:

| Profil | Aufgabenbeleg der Erwartungen | Zweite, mathematisch geänderte Darbietung |
| --- | --- | --- |
| Funktionswerte | `evaluate-expression` und `input-output-meaning` in beiden Fällen | Linearer Term → Potenz/Klammerung und verschiedene Eingaben mit gleichem Ergebnis; nicht bloß neue Zahlen. |
| Symmetrie | `domain-and-symmetry` und `algebraic-verification` in beiden Fällen | Ganze Polynomgraphen → geänderter Definitionsbereich bei gleichem Term; eine notwendige Bedingung wird entscheidend. |
| Winkel | `full-turn-invariance` und `signed-angle-coordinates` in beiden Fällen | Konkrete Winkel → vorgegebener Kreispunkt bei unbekanntem Winkelmaß, zusätzliche Umdrehungen und Spiegelung; Endpunktfall zusätzlich enthalten. |
| Potenzfunktionen | `parity-and-sign` in beiden Fällen; `exponent-regime` durch deren Vergleich und den zweiten Fall | Positive Exponenten → Kehrwerte mit Definitionslücke und ausdrücklich definierter Exponent-0-Fall; keine bloße Zahlenvariation. |

Jeweils zwei unabhängige Darbietungen sind mit diesen Aufgabenbriefs möglich und angemessen; mehr wird nicht gefordert. Der Verweis des zweiten Potenzfalls auf die positiven Funktionen der ersten Aufgabe benennt Vergleichsobjekte, keine benötigte Coach-Zwischenlösung. Er macht die zweite Bearbeitung nicht automatisch zu einem wiederholten Versuch. Bei tatsächlicher Verwendung müssen Fälle selbstständig und ohne vorweggenommene Lösungen oder korrigierende Zwischenführung bearbeitet werden; das ist die bestehende Unabhängigkeitsbedingung, keine hier nachgewiesene Lernendenleistung.

Die Profile bleiben positiv formuliert, mathematisch spezifisch und innerhalb der vier aktuellen Ziele. Es wurde kein konkreter Mangel gefunden, der eine Profilrevision rechtfertigt. Insbesondere wären eine zusätzliche `0⁰`-Konvention, formale Analysis bei AB1 oder eine erzwungene Intervallkonvention beim Einheitskreis sachlich unnötige Verschärfungen.

## Provenienz und Änderungen

Reviewer: eigenständiger Codex-Subagent `physics_b033zb_source_reconcile`, AI-Inhaltsprüfung im Auftrag des Root-Agenten. Keine menschliche Einzelabnahme behauptet. Keine bestehenden Review-Records, Profile, Konfigurationen, Quellen oder kanonischen Daten verändert; ausschließlich dieser Bericht neu angelegt. Keine breite Testsuite und kein zusätzlicher Blindreview durchgeführt.
