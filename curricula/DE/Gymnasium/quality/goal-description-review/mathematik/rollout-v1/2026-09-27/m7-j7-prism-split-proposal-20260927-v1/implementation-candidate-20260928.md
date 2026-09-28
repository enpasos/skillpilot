# J7-Prisma: implementierter Strukturkandidat und offene Freigaben

Stand: 2026-09-28. Dieser Stand **trennt die fachlichen Ziele im Kanon**, ist aber weder eine neue D/P/A/M/V-Freigabe noch eine abgeschlossene Bestandsdatenmigration oder M7-Abnahme. Der vorangehende [Quellen- und Migrationsaudit](current-source-and-migration-audit-20260928.md) bleibt als Begründung erhalten.

## Modellierte Identität

| Rolle | Stabile ID | Bedeutung |
| --- | --- | --- |
| Alter Sammelknoten | `59d5a330-61be-4590-ab46-cf7cefecd144` | Jetzt `curricularArea`/Cluster mit unveränderter ID und unverändertem ShortKey; keine eigene atomare Kompetenz mehr. |
| Volumen | `68fb0e78-34f2-5572-8db6-e7f5ebcff70f` | `curricularAtomic`: Grundfläche und dazu senkrechte Körperhöhe, `V = G · h`, Volumeneinheit und Bedeutung als Rauminhalt. |
| Oberflächeninhalt | `f1348d40-3872-5e44-8892-3600c811796f` | `curricularAtomic`: beide kongruenten Grundflächen und alle Mantelflächen, keine Auslassung/Doppelzählung, Flächeneinheit und Bedeutung als Außenhülle. |

Die beiden Atome sind Geschwister. Das Oberflächenziel erbt **keine** Volumeneinheiten als Voraussetzung. Die drei Semantic-Kind-Einträge sind ausschließlich Strukturklassifikationen mit Fingerprints der aktuellen Ziele; sie ersetzen keine unabhängige semantische Atomicity-, Memory- oder Beschreibungsprüfung. Der bisher gespeicherte Mastery-Wert der alten ID ist kein Nachweis für eines der beiden Kinder. Backend und Cockpit berechnen die Kompetenz eines Clusters aus den Kindwerten statt aus einem alten direkt gespeicherten Clusterwert; eine automatische Aufwertung der Kinder wurde bewusst nicht eingeführt.

## Gezielte Folgen

- BB-Legacy: Die alte `exact`-Sammelkante ist entfernt; beide Teilziele haben je eine fachlich begründete `partial`-Kante. Diese Legacy-Quelle allein beweist keine BE-Geltung.
- BW 3.3.2(7): Beide Teilziele sind nur `partial` einer breiteren Körperkompetenz. Die amtliche Jahrgangsstufe 9/10 ist nicht in J7 umgedeutet.
- HE: Die drei alten Berechnungskanten aus reinen Grundkörper-/Darstellungszeilen sind entfernt. Die vier Zeilen zu Volumen/Oberflächeninhalt bzw. Messvorgängen tragen je zwei neu begründete `partial`-Kanten; „Beschreibung“ ist nicht pauschal gleich selbstständiger Berechnung.
- MV: Die Volumenzeile unter der Prisma-Überschrift bindet nur das Volumenkind. Die benachbarte Oberflächenzeile bindet nur das Oberflächenkind und nicht mehr ein Q2-Ziel zu ebenen Figuren.
- SH: Die bloße Körperartenzeile T052 stützt keine der beiden Berechnungen mehr. K024 stützt beide nur `partial`; T052 bleibt Kontext für Körpererkennung.
- Die 22 direkten Composition-View-Verweise auf die alte ID sind nun `canonicalSubtree`-Referenzen; die alte ID bleibt damit der sichtbare Themenpfad zu den beiden Kindern. Auch der nationale Atlas nutzt den Unterbaum. Die vorhandene breite 15-Länder-Geltung der Kinder ist vorerst aus dem Sammelknoten übernommen, **nicht** für alle Länder durch Einzelquellen bewiesen und vor Freigabe je Scope zu prüfen.
- Die J7-Aufgabe `0dded9c1-043e-57cb-82fc-792b391e9cb0` referenziert beide Kinder. Ein neuer v6-Aufgaben- und Lösungskandidat verlangt ausdrücklich die Deutung von Volumen und Oberfläche. Er bleibt `needs_review`: Ein globaler Schwellenwert von 7/8 BE sichert ohne technisch bindende Teilmindestleistungen nicht den Nachweis **beider** Ziele. Die alte v1-Freigabe darf nicht auf v6 übertragen werden.

## Vor Produktivfreigabe und M7-Zählung offen

1. Bestandsschutz und Navigation mit realistisch gespeicherter alter Mastery, altem aktiven Ziel und Fokus testen; gegebenenfalls ausdrücklich korrigieren, ohne alte Sammelmastery als zwei getrennte Lernerfolge umzuschreiben.
2. Länder- und Jahrgangsprojektion gegen die einzelnen amtlichen Quellen prüfen, besonders BE trotz BB-Legacy, BW/MV-Jahrgang und die Länder ohne neue direkte Teilzielquelle. Quellenrationalen und öffentliches Surrogat aus dem finalen Stand neu erzeugen.
3. J7-v6-Prüfung mit eigenständigem Nachweis beider Teilkompetenzen und erneuter Aufgaben-, Lösungs-, Bewertungs- und Bindungsprüfung freigeben. Bis dahin nicht als bestandene Prüfung ausliefern.
4. Für **jedes** Kind neue aktuelle D-Doppelreview/Synthese, P-v2 mit unabhängigen Aufgaben und Transfer, A- und M-Entscheidung sowie ein separates fachlich pixelgeprüftes V-Bild mit Provenienz erstellen. Das alte kombinierte JPG ist kein Freigabebeleg für die neuen Kinder. Erst die aktuelle Schnittmenge dieser Gates darf den M7-Status erhöhen.

Auch ein bestandener Strukturtest bestätigt nur syntaktische/graphische Konsistenz. Er behauptet weder inhaltliche Freigabe noch vollständige Quellenabdeckung oder Production-Readiness.
