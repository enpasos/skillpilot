# Fachliche Promptdurchsicht vom 24.09.2026

Geprüft wurden Prompt 3 und 5–22 gegen die aktuellen kanonischen Zieltexte und die im Prompt geforderten Zahlen, Koordinaten und Figuren. Diese Durchsicht betrifft die Arbeitsanweisungen für Bildkandidaten. Sie ist weder eine Prüfung bereitgestellter Bilddateien noch eine maschinelle V-Freigabe. Im Eingang lagen zum Zeitpunkt der Durchsicht weiterhin nur die bereits zugeordneten Bilder zu Prompt 1 und 2.

Eine zweite, unabhängige Textdurchsicht fand nach den Korrekturen keinen weiteren konkreten mathematischen Fehler oder Jahrgangswiderspruch. Sie empfahl die jetzt eingearbeitete Präzisierung der parallelen Schnitte in Prompt 3.

| Prompt | Ergebnis | Konkreter Grund |
| --- | --- | --- |
| 3 | Präzisiert | Cavalieri-Vergleich: horizontale Grundebenen und Schnitte in jeweils gleicher senkrechter Höhe sichern die gleiche Schnittfläche `G` und damit `V=G·h`. |
| 5 | Präzisiert | Der zweite, zugeordnete Grundriss ist nun verbindlich; die vier Koordinaten liegen in vier verschiedenen Quadranten und bilden ein konvexes Viereck. |
| 6 | Präzisiert | `A` bleibt bei größerem `k` die gleiche Signalspitze; die Kurven werden nicht als auf Fläche 1 normierte Dichten ausgegeben. |
| 7 | Korrigiert | Eine feste Alternative `p₁=0,6` und tatsächliche diskrete Entscheidungsgrenzen ersetzen die unhaltbare Forderung nach identischer tatsächlicher Fehlerwahrscheinlichkeit `α`. |
| 8 | Korrigiert | Das gebundene Positiv-Evidenzprofil verwendet `a·cosh(x/a)+c`; dessen Minimum ist `(0,a+c)`, nicht `(0,c)`. Genau diese Parametrisierung steht nun im Prompt; unterschiedliche `a` werden weder auf dasselbe Minimum noch auf unveränderte Stützpunkte gezwungen. |
| 9 | Beibehalten | Der Thaleskreis über `OP` liefert bei äußerem `P` die beiden Berührpunkte; der Radius steht dort senkrecht zur Tangente. |
| 10 | Beibehalten | Für `f(x)=x²−2` ergeben die Tangenten `x₁=1,5` und `x₂≈1,4167`; die echte Nullstelle bleibt `√2`. |
| 11 | Beibehalten | Die Scheitel von `x²−2ax` sind `(a,−a²)` und liegen auf `y=−x²`. |
| 12 | Beibehalten | Die Wendepunkte von `x³−3ax²` sind `(a,−2a³)` und liegen auf `y=−2x³`. |
| 13 | Präzisiert | Die drei Parameter werden nun in getrennten Panels mit jeweils festgehaltenen anderen Parametern verändert. |
| 14 | Beibehalten | Alle Kurven `eˣ+a·x` treffen sich in `(0,1)`; nur `a=−1` hat dort ein Minimum. |
| 15 | Beibehalten | Lotfußbedingung `(P−H)·v=0` und Abstand `|PH|` stimmen überein. |
| 16 | Präzisiert | Die Wegstücke `(2,0,0)`, `(2,1,0)`, `(2,1,3)` binden jede Komponente eindeutig an ihre Achse. |
| 17 | Beibehalten | Die Sekante durch `(1,−1)` und `(2,2)` schneidet die x-Achse bei `4/3<√2`; das neue Vorzeichenintervall ist `[4/3,2]`. |
| 18 | Beibehalten | Satz und Umkehrung sind mit rechtem Winkel bei `C` und Durchmesser `AB` richtig angelegt. |
| 19 | Korrigiert | Seiten `a,b,c` sind nun ausdrücklich den gegenüberliegenden Winkeln `α,β,γ` zugeordnet; `α` liegt für den Kosinussatz zwischen `b` und `c`. |
| 20 | Beibehalten | `ln(x−2)+1` verschiebt `(1,0)` nach `(3,1)` und die Asymptote nach `x=2`; `2ln(x)` verdoppelt nur y-Werte. |
| 21 | Präzisiert | Die Diagonale erklärt die `360°` des Vierecks über zwei Dreiecke; die Nebenwinkel an Parallelen bleiben auf derselben Seite der Transversale. |
| 22 | Präzisiert | Konstruktion und Abstandseigenschaft liegen in zwei passenden Panels; `F` ist ein Schnitt der gleichradiusigen Bögen innerhalb des Winkels und verschieden von `B`. |

Für Prompt 7 gilt beim einseitigen nicht randomisierten Test mit nominal `5 %`: `K≥32` bei `n=50` ergibt tatsächliches `α≈0,03245` und `β≈0,66439` unter `p₁=0,6`; `K≥113` bei `n=200` ergibt `α≈0,03842` und `β≈0,13966`. Das erklärt, warum der größere Stichprobenumfang hier `β` senkt, während die tatsächlichen `α` nicht identisch sind.

Prompt 4 wurde separat nach Nutzerhinweis auf horizontale Stockwerke umgestellt. Das zugehörige Ziel liegt in Jahrgang 10 und verlangt Plausibilisierung. Seine kleine Integralzeile ist eine mathematisch exakte Vertiefung, keine Voraussetzung für das Jahrgangsziel. Alle 22 Prompts bleiben Bildkandidaten-Anweisungen; kein zentrales Fünf-Gate-Ergebnis ändert sich durch diese Textkorrekturen.
