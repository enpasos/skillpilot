# Kandidat: aus dem Graphen von f eine Stammfunktion F skizzieren

Stand: 2026-09-28. Der ursprüngliche Quellen- und Kanonaudit führte inzwischen zur Anlage des unten beschriebenen Ziels und einer eigenen graphischen Assessment-Aufgabe. **Keine M7-Freigabe:** unabhängige D-/P-/V-Nachweise und menschliche Erprobung fehlen.

## Befund: fachliche Lücke trotz verwandter Ziele

Die [offizielle bayerische M12-Vorgabe, M12 1.1](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer) verlangt, aus dem Graphen einer Funktion auf den Graphen einer zugehörigen Stammfunktion zu schließen und das Vorgehen zu begründen. Derselbe Quellensatz verlangt außerdem für ganzrationale Funktionen, Stammfunktionsterme aus Funktionstermen zu ermitteln. Die Source-Extraction-ID ist `74fdeb6a-176b-539c-9455-b882e50c1c9f`; inzwischen führen getrennte `partial`-Kanten zu `31be24f0-3ab1-54d2-856d-fa9b7f36552f` (**Term**-Leistung) und `21676dae-8619-59d1-89e3-a35bb2297e2c` (**Graph**-Leistung).

Verwandte kanonische Ziele vermeiden eine vorschnelle Neuanlage, decken die M12-Leistung aber derzeit nicht als eigenes prüfbares Ziel ab:

| Bestehende ID | Inhalt | Abgrenzung |
| --- | --- | --- |
| `845440ce-f63f-5835-903f-739145ca27bd` | Aussagen aus Graphen von f und f′ in beide Richtungen, besonders Monotonie und Extrema | Nennt kein begründetes **Skizzieren eines Stammfunktionsgraphen** und keine freie vertikale Lage. Gute Voraussetzung. |
| `0404f20e-34cc-5c9b-ae6a-62cc9cf02bae` | Stammfunktion als Funktion mit F′ = f verstehen | Begriff und Beschreibung, keine selbständige Graphkonstruktion. Gute Voraussetzung. |
| `31be24f0-3ab1-54d2-856d-fa9b7f36552f` | Stammfunktionsterm für Polynom bestimmen und ableitend prüfen | Symbolisches Verfahren, während die BY-Quelle zusätzlich von einem **gegebenen Graphen** ausgeht. |
| `5042fd2b-bab2-50be-8144-c9ccf5618615` | Graphen von Integrand und Integralfunktion wechselseitig deuten | Spätere [bayerische M13-Vorgabe](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/mathematik), Source-ID `703f1e88-755c-54ac-98ac-4ac2450e398a`. Setzt Integralfunktion und Hauptsatz voraus; M13 unterscheidet Integralfunktion ausdrücklich von Stammfunktion. Die aktuellen D-Reviews dieses Ziels urteilen `keep`; hier ist kein Split als Nebenfolge angezeigt. |

Die [hessische E.2-Quelle, S. 32](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) nennt das begründete wechselseitige Darstellen von Ableitungs- und Funktionsgraphen zusammen mit dem Begriff der Stammfunktion. Die extrahierten Aspekte `he-math-sekii-e-2-b03-a03-15b85123` und `he-math-sekii-e-2-b03-a04-cb125239` stützen die Graphleistung zusammen. Der a03-Aspekt ist nun mit getrennten `partial`-Kanten an die vorhandene f/f′-Graphdeutung und das neue F-Skizzieren gebunden; a04 bleibt Begriffsbeleg für `0404f20e…`.

## Genau ein zusätzliches atomisches Inhaltsziel: umgesetzt als Kandidat

- Kanonische ID: `21676dae-8619-59d1-89e3-a35bb2297e2c`, deterministisch aus `canonical_math_sek2_antiderivative_graph_from_function_graph` nach der vorhandenen Math-ShortKey-Regel.
- Titel DE: **„Aus dem Funktionsgraphen einen Stammfunktionsgraphen skizzieren“**.
- Title EN: **“Sketch an antiderivative graph from a function graph”**.
- Beschreibung DE: **„Die lernende Person kann aus dem Graphen einer Funktion f den Verlauf des Graphen einer möglichen Stammfunktion F skizzieren, diesen mithilfe der Beziehung F′ = f begründen und erklären, warum ein anderer gewählter Anfangswert den Graphen nur vertikal verschiebt.“**
- Description EN: **“The learner can sketch the graph of a possible antiderivative F from the graph of a function f, justify its course using F′ = f, and explain why choosing a different initial value only shifts the graph vertically.”**
- Beobachtbare Leistung: An einem **neu** gegebenen f-Graphen Vorzeichen und Größe von f als Steigung von F deuten; Steigen/Fallen und stationäre Stellen von F korrekt skizzieren; einen Startwert für F selbst wählen oder übernehmen und die vertikale Verschiebungsfreiheit erklären. Eine Nullstelle von f ohne Vorzeichenwechsel darf nicht automatisch als Extremum von F markiert werden. Kein Integralterm und keine symbolische Polynom-Integration sind Teil dieses Atoms.
- Kandidaten-Metadaten: `type: atomic`, `core: true`, `tags: [GK, LK, canonical]`, `area: Analysis`, `demandLevel: AB2`, `guidingIdeas: [L1, L4]`, `phase: E` als HE-kompatible Strukturangabe. BY-Jahrgang 12 wird über seine View/Source-Platzierung aufgelöst, nicht über eine zweite kanonische ID. Die technischen BY-Profile GK/LK richten sich nach der festgelegten Zwischenregel; das Quellfeld `courseLevel: LK` meint dort das erhöhte Anforderungsniveau und rechtfertigt keinen Ausschluss aus BY-GK.

Direktes `requires` ist `0404f20e-34cc-5c9b-ae6a-62cc9cf02bae` (Begriff F′ = f); dieses Ziel erbt `845440ce-f63f-5835-903f-739145ca27bd` (Graphbeziehung f/f′). Keine Voraussetzung aus der M13-Integralfunktion (`24f21c0c…`) oder dem Hauptsatz (`90662398…`): beides würde den bayerischen M12-Zugang zeitlich falsch sperren.

## Quellenkanten und Platzierung

| Quelle | Kante | Begründung |
| --- | --- | --- |
| BY `74fdeb6a-176b-539c-9455-b882e50c1c9f`, M12-EA.1.1 | zusätzlich zum erhaltenen `31be24f0…` eine `partial`-Kante auf das neue Ziel | Eine Quellenaussage enthält **graphisches Schließen** und **Termermittlung**. Jede kanonische Kante deckt genau ihren eigenen Teil. |
| HE `he-math-sekii-e-2-b03-a03-15b85123`, E.2 | `partial` auf neues Ziel und `partial` auf `845440ce…` | Die HE-Vorgabe verlangt wechselseitiges begründetes Darstellen von Ableitungs- und Funktionsgraphen; das neue Ziel fixiert die Richtung f = F′ → F. |
| HE `he-math-sekii-e-2-b03-a04-cb125239`, E.2 | bestehende `exact`-Kante zu `0404f20e…` behalten | Der Begriff der Stammfunktion stützt die Voraussetzung F′ = f, belegt allein aber keine Graphzeichnung. |
| BY M13 `703f1e88-755c-54ac-98ac-4ac2450e398a` | **keine automatische neue Kante** | Bereits exakt an `5042fd2b…` für Integralfunktion gebunden; die begriffliche Trennung muss erkennbar bleiben. |

Im Kanon ist das Inhaltsziel Kind von `bc68c585-3b1d-4c94-8a2b-c10a4dcdb4e8` („Einstieg Ableitungsbegriff und Änderungsraten“) unmittelbar nach `0404f20e…`. Die vier BY-Views `de-by-gk`, `de-by-lk`, `de-by-sekii-gk`, `de-by-sekii-lk` enthalten es explizit in der J12-Zielgruppe bei `31be24f0…`; die HE-Views erben es genau einmal aus dem E.2-Teilbaum. Die nationale Lernzielbuch-Navigation enthält es genau einmal. In anderen Länderviews bleibt es `prerequisiteOnly` statt irrtümlichem Target. Der HE-E.2-Beleg ist kein pauschaler Export in alle Länder.

## Zähler und Qualitätskette

Die Neuanlage erhöht den Math-`curricularAtomic`-Nenner bei unverändertem Rest von 797 auf **798**. Bis zum Abschluss aller Gates sinkt die strikte M7-Quote zunächst; vorhandene Nachweise von `845440ce…`, `31be24f0…` oder `5042fd2b…` sind nicht übertragbar. Quellgebundene Atomicity- und Memory-Entscheide liegen nur als AI-Kandidaten vor. Eine echte lokale Zeichenprüfung ist als `728fd537-40d3-5fdf-8b08-925cba0b2004` unter `Übungen E-Phase` angelegt: der f-Streckenzug steht als vorgelegter Textplot samt exakten Eckpunkten in der Aufgabe, 9 von 12 Punkten bewerten den tatsächlich gezeichneten F-Graphen, und `requires`/`coveredGoalIds` zeigen allein auf `21676…`. Das Assessment bleibt `needs_review`. Ein positives P-Profil, begrenzte D-Buchseite mit zwei unabhängigen aktuellen Reviews, korrektes Querformatbild mit V-QS sowie globale Statusregeneration fehlen weiterhin. Kein M7-Gain oder menschlicher Test ist mit dieser Notiz behauptet.
