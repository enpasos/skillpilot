# Offener Folgeaudit-Vorschlag: fachliche Notwendigkeit der Parameter-Voraussetzungen

Read-only Untersuchung, 14. September 2026 (Europe/Berlin), Datenprüfung am 13. September 2026 um 22:55:04 UTC. Nur diese neue Auditdatei wurde geschrieben; keine Kante, Beschreibung, View, Aufgabe oder Evidenz wurde verändert. **Status: offener, nicht implementierter Vorschlag für den commitfähigen Zwischenmeilenstein.** Gemäß dem anschließenden Nutzerauftrag wird die Arbeit danach beendet und das Ziel pausiert; keine Folgearbeiten werden begonnen. Keine eigene CI-Verifikation oder Curriculum-Freigabe.

## Ergebnis

**Die sechs Kanten, die die konkrete Integrationssperre erzeugen, sind durch die aktuellen Zielkompetenzen nicht als allgemeine Pflichtvoraussetzungen begründet.** Ihre kanonische Entfernung ist fachlich begründbar, ohne GK-Zielduplikate, ohne Ersatz-IDs und ohne Änderung der Zielbeschreibungen. Das ist eine semantische Korrektur der Abhängigkeiten, keine nur für HE-GK versteckte Ausnahme.

Auch die zusätzlich untersuchte Kante `91e2f564-… → 71683f37-…` ist keine notwendige Voraussetzung für das aktuelle Ziel. Sie bildet höchstens eine mögliche Unterrichtsfolge ab. `71683f37-…` selbst besitzt **keine** Voraussetzung zur ln-Stammfunktion; seine einzige aktuelle Voraussetzung ist die Mathematik-Motivation. Eine entsprechende ln-Kante darf dort folglich nicht erfunden oder als entfernt gemeldet werden.

„Nicht notwendig“ bedeutet hier: Die geforderte Handlung benötigt diese gesamte Vorgängerkompetenz nicht regelhaft. Einzelne gewählte Aufgaben können sie zusätzlich benötigen; dann gehört sie zu den Voraussetzungen dieser konkreten Aufgabe. Eine passende Unterrichtsreihenfolge ist nicht automatisch eine universelle `requires`-Beziehung. Die tatsächliche historische Entstehung der Kanten wurde nicht untersucht.

## Geprüfte Grundlage

Aktuelle vollständige DE-/EN-Beschreibungen, direkte Voraussetzungen und relevante reale Aufgaben samt Lösungen aus `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`; gelesene Dateiversion SHA-256: `36b2d0ca01cf52a4ebe4391b79c6ab55ea16c59c308f9382a632bdf15749a2d1`.

| Kürzel | Vollständige ID | Maßgebliche aktuelle Handlung |
|---|---|---|
| I | `993a14e8-60f0-5764-9340-b2447a5fa84b` | Parameter als veränderliche Größe deuten; Einfluss auf **eine ausgewählte Grapheneigenschaft qualitativ** erklären. |
| P | `c0e34fa8-fde5-5a4e-9b84-c5d5db719b58` | Fragestellung präzise mathematisch formulieren, Annahmen explizit machen und Zielgrößen festlegen. Nicht: das gesamte Problem lösen. |
| A | `972cc7e8-be9c-444c-ba45-98e817b3cf14` | Mit Parametern Lage/Form beeinflussen, Werte aus Bedingungen ableiten und begründen. |
| K | `91e2f564-3bc8-4924-af85-2a3fa84c1471` | Parameter im Kontext interpretieren und ihren Einfluss auf charakteristische Eigenschaften untersuchen. |
| L | `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` | ln als Stammfunktion von 1/x in einfachen Integralrechnungen und Begründungen verwenden. |
| B | `71683f37-24de-4e0f-badd-858b56fa4d64` | Parameter aus Bedingungen einer Fragestellung oder eines Sachkontexts bestimmen. |

Normative Quellenlage aus der vorangegangenen vollständigen Quellenprüfung: HE-KC Mathematik GO, lokale PDF `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, E.3 S. 32, Q2.1 S. 40–41, Q4.1 S. 51. L ist ausdrücklich Q2.1 S. 41, Spiegelstrich 5, LK. I ist Q4.1 S. 51, Spiegelstrich 1, gemeinsames Niveau. Die bloße Anordnung Q2 vor Q4 begründet keine der untersuchten Kompetenzabhängigkeiten.

## Kantenurteil mit konkreter fachlicher Probe

Die Beispiele in dieser Tabelle sind neue **Prüfbeispiele für die Kantenanalyse**, keine registrierten oder freigegebenen Repository-Aufgaben.

| Kante | Urteil und tragender Grund | Begrenzte Probe mit Lösung |
|---|---|---|
| I → A | Entfernen empfohlen. Qualitative Vorwärtsdeutung benötigt keine Rückwärtsbestimmung von Parameterwerten und kein eigenständiges Einstellen eines Graphen. | `f_a(x)=x²+a`: Größeres a verschiebt den Scheitel nach oben, die Form bleibt gleich. Das beantwortet I, ohne einen Parameter aus Bedingungen zu berechnen. |
| I → K | Entfernen empfohlen. Die breitere Untersuchung im Kontext ist nicht Voraussetzung für ihre elementare qualitative Teilkompetenz. | `f_a(x)=a·x²`, a>0: Bei festem Abstand vom Scheitel sind die Funktionswerte für größeres a größer; der Scheitel bleibt (0,0). Keine kontextbezogene Scharanalyse nötig. |
| P → A | Entfernen empfohlen. Unbekannte und Nebenbedingungen in einer Problemsituation zu benennen ist nicht dasselbe wie Parameter einer Funktion zu bestimmen. | Rechteck aus 24 m Zaun: Annahmen rechteckig, vollständig eingezäunt, vernachlässigte Zaunbreite; x,y>0, `2x+2y=24`; Ziel `xy` maximieren. Damit ist das Problem formuliert, ohne einen Funktionsparameter zu rekonstruieren. |
| P → K | Entfernen empfohlen. Problemformulierung geht der Analyse eines möglicherweise gewählten Modells voraus; nicht jede Problemsituation enthält eine Funktionenschar. | Dieselbe vollständige Formulierung des Zaunproblems enthält keine Scharparameter und verlangt noch keine Optimierungslösung. |
| A → L | Entfernen empfohlen. Lage/Form und Bedingungen sind ohne Integralbedingungen zugänglich. | `f(x)=a(x-b)²+c` soll Scheitel (1,2) besitzen und durch (3,10) gehen. Daher b=1, c=2 und `10=4a+2`, also a=2. Alle geforderten Parameterhandlungen einschließlich Begründung kommen ohne Integration aus. |
| K → L | Entfernen empfohlen. Auch anspruchsvolle kontextbezogene Parameteranalyse benötigt nicht generell eine Stammfunktion von 1/x. | Idealisiertes Gewinnmodell `G_p(q)=pq-q²-20`, p>0, q≥0: p ist der Stückerlös; `G′_p(q)=p-2q`, somit optimale Menge p/2, maximaler Gewinn `p²/4-20`. Bedeutung und Einfluss des Parameters sind vollständig untersuchbar, ohne Logarithmus oder Integral. |
| K → B | Keine universelle Voraussetzung. Ein bereits gegebener/variierter Parameter muss nicht zuerst aus Beobachtungen rekonstruiert werden. | Im Gewinnmodell ist p gegeben bzw. wird variiert. K wird bearbeitet, ohne p aus Messdaten oder Kontextbedingungen zu bestimmen. B wäre erst für eine zusätzliche Kalibrierungsaufgabe notwendig. |

Umgekehrt wäre L beispielsweise für `∫₁ᵉ a/x dx=2` tatsächlich relevant: Das Integral ist a, also a=2. Das zeigt eine **aufgabenspezifische** Verbindung zwischen Parameterbestimmung und ln-Integration; es rechtfertigt keine Pflichtkante von jeder Parameterkompetenz auf L. Entsprechende anspruchsvollere Aufgaben behalten ihre fachlich notwendigen Inhaltsvoraussetzungen.

## Abgleich mit wirklich vorhandenen Aufgaben

- `1969d4dc-2ba6-5c26-ad7c-6e0114ab1fdf`, „Funktionenscharen und Ortskurven untersuchen“: Tatsächlich gegeben ist `f_a(x)=x²-2ax+2a`. Die Lösung bestimmt Scheitel `(a,-a²+2a)`, Ortskurve `y=-x²+2x`, fehlende reelle Nullstellen für 0<a<2 und bei a=3 die Fläche `4√3`. Selbst diese deutlich umfassendere Scharaufgabe benötigt nur polynomialen Integralstoff, **nicht** die Stammfunktion von 1/x.
- `f77b9b40-6afc-5d9e-821e-79903bbbcb94`, „Problemlösestrategien und Argumente entwickeln“: Reales Gehegeproblem mit Fläche 36 m². Schon Teil 1 formuliert `U(x)=2x+72/x`, x>0; erst danach folgen Minimierung und Ungleichungsargument. Die vollständige Lösung findet das Quadrat mit Seite 6 m und Umfang 24 m. Weder die Problemformulierung noch die Lösung verlangt Parameterkalibrierung oder ln-Integration.
- `450a77d6-2814-571a-af1e-78c9fa61ed2c`, „Extremwertprobleme modellieren“: 40 m Zaun an einer Hauswand, `A(x)=40x-2x²`, 0<x<20; Maximum bei Breite 10 m, Länge 20 m, Fläche 200 m². Auch hier sind Modellformulierung und Untersuchung konkret ohne ln möglich. Die umfangreiche deklarierte Abdeckung dieser Aufgabe wird **nicht** als Beweis genommen, dass sie jede dort referenzierte Parameterkompetenz tatsächlich prüft.
- `bd2c5e29-31c6-58bf-9858-d08e9c8a32ad`, „Funktionsverknüpfungen und Transformationen untersuchen“: `f(x)=2e^(0,5x)-3`, `g(x)=ln(x+3)`. Gefragt sind Transformation, Nullstelle, D/W und `g∘f=ln 2+0,5x`. Die reale Lösung braucht Logarithmus als Umkehrfunktion bzw. Logarithmusregeln, **keine ln-Stammfunktion und keine Integralrechnung**. Ihr deklarierter L-Link ist deshalb kein Gegenbeleg zur Entfernung der allgemeinen Parameter-L-Kanten. An dieser bestehenden Aufgabe wurde nichts geändert.

## Engere E.3-Grundlagen: brauchbare Unterscheidung, kein ID-Ersatzautomatismus

`6947245e-6bd7-52d7-9bc2-0c60cfa447c5` verlangt die Bestimmung einzelner Parameterwerte in ganzrationalen Funktionstermen aus Null-/Extrem-/Wendestelleneigenschaften. Es ist direkt auf HE E.3 S. 32, Source-Aspekt `he-math-sekii-e-3-b01-a04-377d6916`, bezogen. Beispiel: `f_a(x)=x²+ax+1` soll bei x=2 eine Extremstelle haben; `f′_a(2)=4+a=0`, also a=−4. Das illustriert die Rückwärtskompetenz, nicht eine Voraussetzung jeder qualitativen Parameterdeutung.

`250daae6-58fd-59e4-8a11-f994e789ee47` untersucht bei `g(x)=a·f(x)+b` Parameterwirkungen auf Lage, Streckung, Monotonie und charakteristische Punkte; HE E.3 S. 32, Source-Aspekt `he-math-sekii-e-3-b01-a05-b37e1496`. Das ist eine passende Vorwärts-Grundlage für entsprechende Aufgaben, verlangt aber schon mehr als I mit genau einer qualitativen Eigenschaft.

Weder Ziel ist deshalb ein pauschaler Ersatz für A, K oder L. Es wird keine neue Kante allein wegen gleicher Schlagwörter vorgeschlagen. Die aktuellen Beschreibungen von I und P sind bereits hinreichend begrenzt; eine zusätzliche bilinguale Textänderung ist zur Entfernung der sechs falschen Pflichtkanten nicht erforderlich. Eine Zusatzformulierung wie „nach Bestimmung der Parameter“ bei K würde den Inhalt erweitern und eine zuvor unnötige Voraussetzung künstlich erzwingen.

## Exakter minimaler Änderungsvorschlag und read-only Gegenprobe

Zur Auflösung der **konkreten** Integrationssperre reichen diese sechs kanonischen Kantenentfernungen. Keine Ersatzkante ist Teil dieses minimalen Vorschlags:

```json
[
  { "goalId": "993a14e8-60f0-5764-9340-b2447a5fa84b", "removeRequires": ["972cc7e8-be9c-444c-ba45-98e817b3cf14", "91e2f564-3bc8-4924-af85-2a3fa84c1471"] },
  { "goalId": "c0e34fa8-fde5-5a4e-9b84-c5d5db719b58", "removeRequires": ["972cc7e8-be9c-444c-ba45-98e817b3cf14", "91e2f564-3bc8-4924-af85-2a3fa84c1471"] },
  { "goalId": "972cc7e8-be9c-444c-ba45-98e817b3cf14", "removeRequires": ["3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4"] },
  { "goalId": "91e2f564-3bc8-4924-af85-2a3fa84c1471", "removeRequires": ["3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4"] }
]
```

Alle sechs Kanten existieren im geprüften aktuellen Graphen. Eine rein speicherinterne Gegenprobe des transitiven Abschlusses der direkten `requires` zeigt: Vorher erreicht jeder der vier betroffenen Ziele I/P/A/K die ln-Stammfunktion L; nach genau diesen sechs Entfernungen erreicht **keines** L. B erreicht L weder vorher noch nachher. Das bestätigt die technische Entkopplung dieser konkreten Inhaltsvoraussetzung; es ist keine Prüfung aller effektiven Laufzeitabhängigkeiten, Views oder Reifegradnachweise. Durch reine Kantenentfernung entsteht kein neuer `requires`-Zyklus.

Die siebte untersuchte Kante K→B ist fachlich ebenfalls zur Entfernung begründbar, wird aber vom minimalen Sechs-Kanten-Rezept getrennt ausgewiesen: Sie verursacht nicht die ln-Kopplung. Ihre Entfernung ließe K derzeit nur mit Motivation als direkter Voraussetzung zurück. Das ist kein Grund, die unzutreffende Kante als notwendig umzudeuten; vor einer weiteren Sequenzierungspräzisierung ist die tatsächlich passende Grundkompetenz im bestehenden Graphen gezielt zu wählen. Fachlich geht elementares Interpretieren dem umfassenderen Untersuchen voraus. I deshalb blind als neue Voraussetzung von K zu verdrahten wäre dennoch falsch: I ist aktuell in Q4 platziert, K in Q2, und die gegenläufige alte Kante muss berücksichtigt werden. Hier wird keine neue solche Kante implementiert oder als sofort austauschbarer Ersatz empfohlen.

Der Befund ist eine **konkrete fachliche Auflösung der zuvor gemeldeten Integrationssperre**, kein Antrag auf neue Nutzerfreigabe und kein Vorschlag, GK-Ziele zu duplizieren oder auszublenden. Auswirkungen einer kanonischen Korrektur auf andere Profile sind nachgelagert durch den Hauptagenten zu prüfen: Eine semantisch korrigierte Voraussetzung gilt grundsätzlich auch dort, nicht nur in HE-GK. Sichtbare Ziele und deren fachlicher Anspruch werden durch die vorgeschlagenen Entfernungen nicht umgeschrieben; Frontier-Reihenfolgen können sich erwartungsgemäß ändern.

Weitere noch vorhandene breite Voraussetzungen werden dadurch nicht automatisch als notwendig zertifiziert. Auffällig sind etwa P→`24174bba-a654-5f81-8de3-ca5bd09d9b6f` (Gerade–Ebene), P→`858113c5-e53b-57bb-b01f-ba95c3ddcb6f` (elementare Ableitung) und A→`61686d85-0301-550e-bab9-bd9411c3e7ce` (Kehrwertpotenzen): Die obigen konkreten Aufgaben können auch ohne diese ganzen Vorgängerkompetenzen formuliert bzw. gelöst werden. Sie sind ausdrücklich **nicht** Bestandteil des Sechs-Kanten-Rezepts und keine neu ausgeführten Folgearbeiten.

Quellenzuordnung der acht zusätzlichen Q2.1-Atome, echte Assessment-Abdeckung, die eigenständige Sek-II-Einstiegslücke und die Wirkung auf alle Views/Evidenzbindungen bleiben von diesem Kantenurteil getrennte Prüfgegenstände. Nach einer tatsächlichen Änderung sind die betroffenen Nachweise und geschützten Qualitäts-/Maturity-Floors durch den Hauptagenten zu prüfen; dieser Audit behauptet deren Bestehen nicht.
