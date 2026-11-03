# Batch 2: eine eigene Modellprüfung für drei echte Aufgabenlücken

**Entwurf, nicht integriert.** Grundlage ist der aktuelle Mathematikkanon `3a3792d14057854c79a3d8c4d38cd98dd6e28e936865ebd3447107404b58474c`. Kein bestehendes Goal, keine Source-Ansicht und kein Produktcode werden geändert. Die vollständige Aufgabenfassung, Lösung und Rubrik stehen in [candidate.de.md](candidate.de.md) und [candidate.en.md](candidate.en.md). Der Kandidat ist absichtlich `draft`, somit noch nicht zur Laufzeit freigegeben.

## Warum die drei zunächst vorgeschlagenen Zuordnungen bleiben

| Fehlende Kompetenz | Geprüfte bestehende Aufgabe | Entscheidung |
| --- | --- | --- |
| `8e1b0d9c…` Polynomrekonstruktion | `ec707244…`, J9-Ballparabel | Unverändert. Kohorte30 untersagt ausdrücklich, den gerade entfernten Koeffizienten-LGS-Zwang durch eine neue Requires-Kante zurückzuholen. Der vorgegebene Scheitel ist keine selbstständige Rekonstruktion. |
| `4b16fce6…` sprung-/knickfreie Anschlüsse | `68a262fc…`, historische Hängebrücke | Unverändert. Der ausdrücklich historische 30-BE-Abiturvertrag wird weder um Teile ergänzt noch unter derselben ID umbenannt. |
| `b88cbf71…` Modell aus Wendebedingung | `2f626446…`, J10-Führungsschiene | Unverändert. Dessen Goalvertrag untersucht einen vorgegebenen Term; die neue Modellaufstellung wäre eine zusätzliche Kompetenz. |

Die unveränderten Ausgangsverträge samt vollständigem ExamData stehen in `before.contracts.json`. Die drei Kohorte30-Befunde werden in `candidate.delta.json` erneut ausdrücklich gebunden. Alle 27 historischen Abitur-Goalobjekte sind mit ihren vollständigen normalisierten Hashes in `historical-27-preservation.json` festgehalten.

Für die Hängebrücke ist die Herkunft lokal belegbar: kanonische Provenienz verweist auf Quelllandschaft `2796fc7b…`, Quellziel `bc60e300…`; dessen 30-BE-Vertrag liegt im archivierten hessischen Oberstufen-JSON. Das ursprüngliche Bild ist `/assets/abi/2026_1/image4.png`. `historical-origin.json` bindet Archiv und Goal. Diese Archivbindung belegt allein keine amtliche Herausgeberschaft. Die neue Aufgabe übernimmt weder Bild noch historische Aufgabenformulierungen.

## Prüfung vorhandener eigener Autonomieaufgaben

Drei nahe eigene Verträge wurden vollständig gelesen:

- `450a77d6…` prüft einfache Extremwertmodellierung; sein geprüfter Korrekturvermerk schließt Rekonstruktion, Wendestellen und Anschlüsse ausdrücklich aus.
- `e7013f6e…` prüft lineare, quadratische und symmetrische Darstellungen, keine neue Anschluss-/Wendemodellierung.
- `3095e125…` ist allgemein als selbstständige Modellierung beschrieben, sein konkreter bestehender 20-BE-Vertrag prüft aber lineare Cateringkosten und Modellgrenzen. Ein Austausch gegen eine Quartik wäre eine neue fachliche Vorbereitung und ein anderer Arbeitsumfang. Ein ausdrücklich gewählter äquivalenter Slot wäre gesondert zu entscheiden; hier wird keine stille Ersetzung vorgenommen.

Das ist eine begrenzte Suche nach passenden vorhandenen Verträgen, kein erneutes Review aller 165 Aufgaben.

## Der zusammenhängende neue Auftrag

Vorgeschlagen wird **eine** eigene Assessment-ID `4293cf40-06fb-51e3-9799-6fde0bf2771b`: ein Übergangsweg zwischen einem fallenden geraden Abschnitt und einem waagerechten Abschnitt. Beide Nähte sollen sprung- und knickfrei sein; zusätzlich ist bei (t=10) eine Wendestelle vorgegeben. Aus diesen fünf Anforderungen wird ein Polynom bis Grad vier selbst aufgestellt, gelöst und geprüft. Die Wendebedingung ist somit tatsächlich Bestandteil der Modellbildung, keine nachträglich angehängte Untersuchung eines fertigen Terms.

Die eindeutige Lösung lautet

\[
q(t)=\frac{t^4}{80000}-\frac{3t^3}{8000}+\frac{3t^2}{800}-\frac t{10}+5.
\]

Die explizit bepunkteten Handlungen sind:

- **Rekonstruktion:** vollständiger Koeffizientenansatz, LGS, nachvollziehbare Lösung und Kontrolle aller Bedingungen — 4 BE.
- **Anschlussmodellierung:** vier Werte-/Steigungsbedingungen mit Kontextdeutung und Kontrolle beider Nähte — zusammen 4 BE.
- **Wendemodellierung:** notwendige Modellbedingung, Unterscheidung von notwendiger/hinreichender Bedingung, tatsächlicher Wechsel und Kontextdeutung — zusammen 4 BE.
- **Modellprüfung:** Höhenbereich und eine Modellgrenze — 1 BE.

13 BE insgesamt; vorgeschlagene reguläre Bestehensgrenze 13 BE. Die Hürde ist im Entwurf bewusst so gewählt: Die eine Aufgabe soll alle drei nachgewiesen fehlenden Handlungen belegen. Eine vollständig fehlende Modellbedingung oder ungeprüfte Naht darf nicht durch Punkte aus einem anderen Teil ersetzt werden. Es gibt weder serverseitige Teilqualifikationen noch ein zweites Ergebnisprofil.

**Fairness und Rechenfehler sind ausdrücklich Reviewgegenstand.** 13/13 verlangt keine bestimmte Schreibweise oder einen bestimmten Eliminationsweg. Fachlich gleichwertige Herleitungen sind gleich zu bewerten; ein offensichtlicher Schreibfehler ohne Änderung des nachvollziehbar richtigen Modells ist kein eigenständiger Kompetenzmangel. Bei einem echten Rechenfehler bleiben nachvollziehbar richtige Modellierungs- und Folgeüberlegungen nach der Rubrik anrechenbar. Ein vor Abgabe selbst erkannter und korrigierter Fehler kostet keinen Punkt. Ein unbereinigter Fehler, durch den tatsächlich ein Rubrikpunkt fehlt, führt unter der vorgeschlagenen 13/13-Regel allerdings noch nicht zum Bestehen. Das ist transparent, aber streng: Das unabhängige Review muss prüfen, ob diese Hürde angemessen ist oder eine andere Punkteverteilung/Bestehensgrenze dieselbe vollständige Kompetenzprüfung fairer erreicht. Eine fehlende Modellhandlung darf dabei nicht als bloßer Rechenfehler umgedeutet werden. Diese Bewertungsfrage ist vor Freigabe zu entscheiden; Fairness oder Wirksamkeit der Hürde wird hier nicht als erwiesen behauptet.

Direkte Vorbereitung sind die drei tatsächlich geprüften Kompetenzziele sowie `546bf0b3…` für das rechnerische Lösen des LGS. Das LGS-Ziel wird nicht als voll abgedeckt ausgewiesen: graphisches Lösen und umfassende Lösungsvielfalt werden hier nicht geprüft. Die drei `coveredGoalIds` sind durch eine explizite Rubrikzuordnung in `candidate.delta.json` begründet. Ihre eigenen kanonischen Voraussetzungen bleiben vollständig bestehen. Das analytisch-geometrische Q2-LGS-Ziel wird dem fachfremden Kontext nicht angehängt.

## Mathematische und technische Prüfung

`verify_math.py` und `symbolic-proof.json` belegen mit exakten rationalen Zahlen: Rang fünf des Koeffizientensystems, sämtliche fünf Bedingungen, beide C1-Nähte, tatsächliche Wendestellen bei (5) und (10), sowie Monotonie und Höhenbereich (7/2\le q\le5). Die zusätzliche Wendestelle wird in Aufgabe und Lösung ehrlich behandelt; Einzigkeit wurde nicht verlangt. Gleiche zweite Ableitungen an den Nähten oder bautechnische Eignung werden nicht behauptet.

`native-candidate-structure.json` prüft den Kandidaten isoliert mit dem vorhandenen Java-Compiler: DAG und echte Voraussetzungskanten, Erreichbarkeit aller drei geprüften Fähigkeiten von genau einem neuen geschützten Prüfungsziel und korrekte 13/13-Punkte. Der ausdrückliche Draftstatus bleibt runtime-unverfügbar. Diese isolierte Auswahl ist keine Änderung irgendeines realen Angebots.

## Zusätzliche Pflicht und spätere Auswahl

Der Vorschlag bedeutet nach fachlicher Freigabe höchstens **eine zusätzliche zusammenhängende Prüfung für drei nachgewiesen fehlende Handlungen**, nicht drei zusätzliche Prüfungsziele. Er ersetzt oder entfernt keine historische Aufgabe und entwertet keine bestehende Mastery. Die zusätzlichen 13 BE müssen vom Inhalts-/Scopeverantwortlichen ausdrücklich akzeptiert werden; eine automatische Einordnung nur anhand von Phase, Bundesland oder Kurslabel wird nicht vorgenommen.

Inhaltlich liegt die Aufgabe bei den E-Phasen-Ableitungsanwendungen und ist kein amtlicher Abiturvorschlag. Sie darf erst für konkret geprüfte Zielprojektionen ausgewählt werden, die diese drei Kompetenzen bereits beabsichtigen. `applicabilityFromRequires` ist lediglich eine ableitbare Geltungshilfe, kein Beleg offizieller Quellenabdeckung oder tatsächlicher Targetauswahl. Ein bloßer `prerequisiteOnly`-Eintrag genügt nicht. Die J9/J10- und historischen Prüfungsziele bleiben unverändert.

Unabhängiges Inhaltsreview, faire Platzierung, aktuelle tatsächliche Scopewirkung und einschlägige M7-Prüfungen stehen aus. Es wird keine menschliche Freigabe, Erprobung, Wirksamkeit oder vollständige Mathematikabnahme behauptet. Neu verfasster Aufgabeninhalt: CC-BY-4.0.

## Konkreter Auftrag an das unabhängige Inhaltsreview

1. Werden Polynomrekonstruktion, Modellierung beider C1-Nähte und Modellierung aus einer Wendebedingung jeweils durch eine verlangte, gelöste und bepunktete Handlung vollständig geprüft?
2. Sind 13/13, die Teilpunkte und der beschriebene Umgang mit Schreib-, Rechen- und Folgefehlern fachlich angemessen, ohne fehlende Kernhandlungen kompensierbar zu machen?
3. Passen die vier echten Vorbereitungsziele zum Inhalt, insbesondere das einfache Koeffizienten-LGS, ohne eine fachfremde geometrische LGS-Kompetenz zu verlangen?
4. Ist eine zusätzliche zusammenhängende 13-BE-Prüfung für diese drei Lücken vertretbar? Die konkrete Source-/Stufen-/Kursauswahl und Enrollment bleiben ausdrücklich ungeprüft und werden durch ein Inhalts-PASS nicht ersetzt.
