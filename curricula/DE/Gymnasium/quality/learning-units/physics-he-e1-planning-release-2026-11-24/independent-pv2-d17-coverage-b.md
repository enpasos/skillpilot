**APPROVE – für die Inhaltsbeziehung des exakten D17 zum aktuellen BES-Ziel und P-v2.** Ein reguläres Bestehen mit 17/20 trägt die beanspruchte Verständnisleistung. Die offenen Aktivierungs- und Bindungsschritte sind damit nicht erledigt.

Geprüft wurden der vollständige [P-v2-Profilkörper](/home/enpasos/projects/skillpilot-e1-nachweise/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-bes-current-v2/positive-evidence.candidates.json:11), das vollständige [D17 einschließlich DE/EN und Raster](/tmp/e1-t5/successor-candidates/f13ca187.D17.goal.json), aktuelle Zielbedeutung und Ownership sowie die gelieferten Kriterien. Referenzierte Fremdreviews wurden nicht geöffnet; Dateien wurden nicht verändert.

| Verbindliche Erwartung | D-Zeilen und fachlicher Nachweis | Wirksame Punktgrenze |
|---|---|---|
| `constant-acceleration` | **D1/D2**, erneut **D3/D4**: Konstantes a wird mit linearer Geschwindigkeitsänderung verbunden. Beim Wagen bedeutet positives a zunächst sinkenden, nach der Umkehr steigenden Geschwindigkeitsbetrag. Die Vorzeichenbeziehung wird durch die konsistenten Bewegungsdarstellungen gezeigt; eine bestimmte verbale Formulierung ist dafür nicht erforderlich. | Ohne konstantes a und dazu konsistente Bewegungsgraphen fehlt die Zweipunktbasis in D1 beziehungsweise D3: höchstens **16/20**. |
| `linked-three-graphs` | **D1 und D3** verlangen jeweils drei konsistente Darstellungen; **D2** zusätzlich die begründete Verbindung zwischen Geschwindigkeitsflächen und Ortsänderung. Ortsgesetze, Graphen und Flächenbilanz bilden gemeinsam eine zulässige Erklärung von Steigung und Krümmung. | Ohne die drei konsistenten Graphen D1/D3 höchstens 1 Punkt; ohne vorzeichenrichtige Flächenbilanz D2 höchstens 1 Punkt. Jeweils insgesamt höchstens **16/20**. |
| `zero-velocity-and-validity` | **D1**: Beim Umkehren durchquert v die Nulllinie, s erreicht ein Minimum, a bleibt positiv konstant. **D4**: Eine rechnerische Fortsetzung ist von einer physikalisch begründeten Fortsetzung zu unterscheiden; dauerhafter Stillstand verlangt ein anderes Anschlussmodell. | `v=0 ⇒ a=0` widerspricht der konsistenten D1-Basis. Bloße Fortsetzungszahlen ohne Erklärung tragen die D4-Basis nicht. Jeweils höchstens **16/20**. |

Diese Grenzen folgen aus dem vorhandenen Stufenraster: Zusatzpunkte gibt es erst **ab der Zweipunktbasis**. Es wird kein nachträgliches Zusatzveto eingeführt. **2+5+5+5=17** darf bestehen: Die Kernleistungen bleiben vorhanden, während rechnerische oder ergänzende Leistungen fehlen dürfen.

Die physikalischen Ergebnisse habe ich unabhängig nachgerechnet:

- Wagen: \(v=2t-5\), \(s=t^2-5t+11\); Umkehr bei **2,5 s und 4,75 m**, anschließend \(s(3)=5\) m und \(s(4)=7\) m. Die Geschwindigkeitsflächen sind **−0,25 m** und **+2,25 m**: Ortsänderung **+2 m**, Strecke **2,5 m**. 7 m liegt im Kontrollintervall **[6,98; 7,08] m**.
- Bremsung: \(v=6-2t\), \(s=6t-t^2\); Stopp bei **3 s und 9 m**. Unveränderte Fortsetzung ergibt bei 5 s **−4 m/s und 5 m**. Das ist mathematisch konsistent, beschreibt aber kein stehen bleibendes Fahrzeug. Für dessen Anschlussmodell gelten \(a=0,\ v=0,\ s=9\) m.

Drei Abgrenzungen sind wesentlich:

**Modellannahme und Daten:** In D17 ist a für ein ganzes Intervall vorgegeben. Im Profilfall `starting-from-rest` wird die Konstanz zwischen den Stützstellen ausdrücklich angenommen. Gleiche mittlere Beschleunigungen aus wenigen Messpunkten beweisen diese kontinuierliche Konstanz nicht. Auch die Kontrollablesung in D2 bestätigt nur Verträglichkeit; sie beweist weder den gesamten Verlauf noch einen Kraftmechanismus.

**Umkehr und Gültigkeit:** Die drei Graphen haben unterschiedliche Rollen. Der a-Graph allein bestimmt ohne Anfangsgeschwindigkeit keinen Umkehrzeitpunkt. Die Angaben bestimmen die Bewegung einschließlich des Modellendes; danach ist eine zusätzliche Beschleunigungsannahme nötig. D4 prüft genau diese Unterscheidung anhand zweier verschiedener Anschlussmodelle.

**Methoden:** Die Dreiecks- und Rechtecksflächen benötigen keine Integralrechnung. Auch die Graphenerklärung setzt keine formale Differentialrechnung voraus. DE und EN sind hinsichtlich dieser Anforderungen gleichwertig.

P-v2 verlangt alle drei Erwartungs-IDs, keine Alternativgruppe, **mindestens zwei unabhängige Demonstrationen**, frische Variation und unabhängigen Transfer. D1/D2 bilden eine Anwendung, D3/D4 eine zweite; vier Zeilen werden nicht als vier Anwendungen gezählt. Neue Anfangswerte, ein anderer Zeitbeginn und das umgekehrte Beschleunigungsvorzeichen verlangen erneute Konstruktion.

Die beiden Profilfälle sind fachliche Fallskizzen, keine Pflicht zur Wiederholung ihrer Zahlen. Die Achse `relative-signs` wird deutlich genutzt. `starting-representation` wird **nicht wörtlich** ausgespielt: D17 gibt keine fertige t-v-Gerade vor. Das Profil verlangt jedoch keine gesonderte Abnahme jeder Achse; seine verpflichtenden Erwartungs-IDs und die frische unabhängige Anwendung werden durch D17 getragen. Einen gesonderten Nachweis gerade dieser Eingangsform bescheinige ich nicht.

Qualifizierter Inhaltsbezug ausschließlich:

- **Eigenes gewöhnliches Ziel BES:** `e4b38061-1f28-43ad-8371-a3e7c0e81856`
- **Prüfungszeuge:** `f13ca187-b680-5f47-b4ad-76bd474bd8a2`, exaktes **D17**, Zeugen D1–D4
- **Owner:** `physics-constant-acceleration`, Revision **`2026-11-23-v4`**

Aus verwendeten Voraussetzungen oder Kontrollwerten folgt keine zusätzliche Zielanerkennung, insbesondere keine vollständige Anerkennung von Mathematik-, Messunsicherheits- oder Experimentierzielen.

Die Rohdatei-SHA-256 waren vor und nach der Prüfung identisch:

```text
P-v2:
3c07b96dd47f877596a43575a44d2a2087624c9a16dae02854acbf7d929704a2
D17:
e12d8bcafaa2bcd824b76bbab56e63ed7d3ef87044eafaa24f30f877a4e3683f
coverage-successor-inputs.json:
452986171d8ae100962668877589d89fad7b8e2883ea2047bd88fe6ce3d7b220
criteria.md:
d2e2318ffac0bc56fb454b754163a4379a4d36b31bda8dff8ce37db57f838ef3
```

Profilbindung: `reviewId=physik-e1-bes-current-20261124-v2`, vollständiges `goals[0].profile`, nicht ein älterer Profilstand.

Die Freigabe betrifft ausschließlich diese Inhaltsbeziehung. Aktuelle P-/Bildaktivierung und endgültige native D-Bindungen bleiben offen. Sie bescheinigt weder menschliche Abnahme, Lernendenversuch, persönliche Experimentdurchführung, CI noch Übertragung alter Receipts.