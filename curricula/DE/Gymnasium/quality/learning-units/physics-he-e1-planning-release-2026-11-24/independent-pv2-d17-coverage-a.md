**APPROVE** für die exakte inhaltliche Beziehung zwischen D17, dem aktuellen BES-Ziel und P-v2. Ein regulär bewertetes Bestehen mit 17/20 BE trägt die drei verpflichtenden Verständniserwartungen. Ich finde keinen fehlenden verpflichtenden Kern.

P-v2 sowie Aufgabe, DE/EN-Lösungen und sämtliche Bewertungsstufen von D17 wurden vollständig gelesen. Referenzierte Fremdreviews und Integratornotizen wurden nicht geöffnet; Dateien wurden nicht geändert.

| P-v2-Erwartung | D-Zeilen | Unabhängige Abdeckungsprüfung |
|---|---|---|
| `constant-acceleration` | D1, D2, D3; ergänzend D4 | Die konstanten Beschleunigungen erzeugen lineare Geschwindigkeitsverläufe. D2 verlangt ausdrücklich die Beschleunigungsfläche als Geschwindigkeitsänderung; damit wird die Beziehung \(a=\Delta v/\Delta t\) angewandt. Beim Wagen verkleinert positives \(a\) zunächst den Betrag der negativen Geschwindigkeit; nach der Umkehr wächst dieser. Negatives \(a\) beschreibt im zweiten Modell zunächst Bremsen und bei mathematischer Fortsetzung zunehmende Rückwärtsgeschwindigkeit. |
| `linked-three-graphs` | D1, D3, verbunden durch D2 | Beide Bewegungsfälle verlangen drei konsistente Darstellungen: waagerechtes \(t\)-\(a\), geradliniges \(t\)-\(v\), parabelförmiges \(t\)-\(s\). Steigungsrichtung und Krümmung müssen zu Geschwindigkeit beziehungsweise Beschleunigung passen. D2 sichert zusätzlich die Verbindung der Ortsänderung mit den vorzeichenbehafteten Geschwindigkeitsflächen. |
| `zero-velocity-and-validity` | D1, D3, D4 | Am Wagenumkehrpunkt bei \(2{,}5\,s\) durchquert \(v\) die Nulllinie, \(s\) erreicht ein Minimum und \(a\) bleibt unverändert positiv. Diese drei unterschiedlichen Graphenrollen sind verpflichtend konsistent darzustellen. D4 verlangt die begründete Unterscheidung zwischen mathematischer Fortsetzung und einem Fahrzeug, das stehen bleibt. |

Die Rechnungen stimmen unabhängig geprüft: Für den Wagen gelten, mit \(t\) in Sekunden, \(v=2t-5\) und \(s=t^2-5t+11\). Daraus folgen \(s(2{,}5)=4{,}75\,m\), \(s(3)=5\,m\), \(s(4)=7\,m\). Die Geschwindigkeitsflächen betragen \(-0{,}25\,m\) und \(+2{,}25\,m\): Ortsänderung \(+2\,m\), Strecke \(2{,}5\,m\). Beim Bremsmodell ergeben sich Stoppzeit \(3\,s\), Bremsweg \(9\,m\) und bei unveränderter Fortsetzung \(v(5)=-4\,m/s,\ s(5)=5\,m\). DE und EN stimmen fachlich überein.

Die **17/20-Schwelle schützt die Kernleistungen**: Jede Zeile vergibt weitere BE erst ab ihrer beschriebenen 2-BE-Stufe. Fehlt deren Kern, bleiben höchstens 1 BE und insgesamt \(1+5+5+5=16\) BE. Das betrifft insbesondere inkonsistente Umkehrdiagramme beziehungsweise \(v=0\Rightarrow a=0\) in D1, fehlende vorzeichenbezogene Flächenbilanz in D2, fehlende konsistente Bremsdarstellungen in D3 oder fehlende physikalische Begründungsgrenze in D4. Rechen- und Detailfehler bleiben dagegen mit Bestehen vereinbar. Dafür ist keine zusätzliche Bestehensregel erforderlich.

Auch die beiden P-Fallbriefe wurden geprüft: `starting-from-rest` ist mit \(a=0{,}40\,m/s^2\) und beispielsweise \(\Delta s_{1\to2}=0{,}60\,m\) stimmig; `deceleration-through-reversal` mit \(a=-0{,}50\,m/s^2\), Geschwindigkeitsnulldurchgang und Ortsmaximum bei \(2\,s\). Der konstante Beschleunigungsgraph allein bestimmt diesen Umkehrzeitpunkt ohne Anfangsgeschwindigkeit nicht.

Ihre konkreten Zahlen sind **keine zusätzlichen Pflichtaufgaben**. D1/D2 und D3/D4 liefern zwei eigenständig zu bearbeitende Demonstrationen mit geänderten Anfangsbedingungen, Beschleunigungszeichen und physikalischen Fortsetzungsbedingungen. Damit werden `minimumIndependentDemonstrations: 2`, frische Variation und unabhängiger Transfer inhaltlich getragen. Die Achse `relative-signs` wird tatsächlich genutzt. Der ausdrücklich beschriebene Wechsel der Ausgangsdarstellung `starting-representation` wird in D17 dagegen **nicht** durchgeführt; ich rechne ihn nicht als beobachtet an. Die `coverageExpectations` verlangen frische Variation, jedoch keine Ausschöpfung sämtlicher aufgeführter Variationsachsen.

Die Modellannahme bleibt sauber: Die P-Stützwerte beweisen nur gleiche mittlere Beschleunigungen; die Konstanz dazwischen ist ausdrücklich angenommen. D17 gibt die Beschleunigung für das ganze Intervall vor. Die einzelne Kontrollablesung bestätigt lediglich die Verträglichkeit der Ortsvorhersage, weder die gesamte kontinuierliche Bewegung noch einen Kraftmechanismus. D4 behandelt fortgesetztes negatives \(a\) korrekt als mögliche zusätzliche Modellannahme, die eine physikalische Begründung braucht. Für dauernden Stillstand gelten stattdessen \(a=0,\ v=0,\ s=9\,m\). Differential- oder Integralrechnung ist für diese Nachweise nicht erforderlich.

Die positive Inhaltsentscheidung betrifft ausschließlich:

- **Owned Goal:** BES `e4b38061-1f28-43ad-8371-a3e7c0e81856`.
- **Witness:** D17 `f13ca187-b680-5f47-b4ad-76bd474bd8a2`, Zeilen `D1`–`D4`.
- **Owner:** `physics-constant-acceleration`, Revision **`2026-11-23-v4`**.
- Der erforderliche Pfad besteht über `262f807a-30d0-503e-986f-856cbd048e8e` zu BES. Vorkommende Voraussetzungskompetenzen erhalten dadurch keine zusätzliche Ganzzielanerkennung.

Gelesene und abschließend erneut geprüfte **rohe SHA-256**:

| Datei | SHA-256 |
|---|---|
| [P-v2](/home/enpasos/projects/skillpilot-e1-nachweise/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-bes-current-v2/positive-evidence.candidates.json) | `3c07b96dd47f877596a43575a44d2a2087624c9a16dae02854acbf7d929704a2` |
| [D17](/tmp/e1-t5/successor-candidates/f13ca187.D17.goal.json) | `e12d8bcafaa2bcd824b76bbab56e63ed7d3ef87044eafaa24f30f877a4e3683f` |
| [Current Inputs](/tmp/e1-t5/coverage-successor-inputs.json) | `452986171d8ae100962668877589d89fad7b8e2883ea2047bd88fe6ce3d7b220` |
| [Kriterien](/tmp/e1-t5/criteria.md) | `d2e2318ffac0bc56fb454b754163a4379a4d36b31bda8dff8ce37db57f838ef3` |

Der gelesene Profilkörper ist `/goals/0/profile`, Review-ID `physik-e1-bes-current-20261124-v2`: alle drei IDs verpflichtend, keine Alternativgruppen, Mindestzahl 2, beide Transfer-/Variationsflags `true`. Sein SHA-256 bei UTF-8-Serialisierung mit sortierten Schlüsseln und kompakten Separatoren beträgt `bad9444b79813bc9ba8be3173d427ed1d84372da4d5f59e7463b8d14cacc0444`.

Diese Inhaltsprüfung erteilt keine P-/Bildaktivierung und keine finalen nativen D-Bindungen. Sie ersetzt weder menschliche Abnahme, Lernendenversuch, persönliche Experimentdurchführung noch CI. Alte Receipts erhalten gemäß R5 keine zusätzliche Anerkennung.