# Kandidat: J7-Prisma in Volumen und Oberfläche trennen

Stand: 2026-09-27. Fachlicher Umsetzungsvorschlag, **keine** Änderung des Kanons, der Quellenzuordnungen, Prüfungen, Bilder oder M7-Nachweise. Das aktuelle Ziel `59d5a330-61be-4590-ab46-cf7cefecd144` bündelt zwei unabhängig prüfbare Leistungen. Beide aktuellen D-Reviews entscheiden `split_review`. Der ältere Atomicity-Eintrag `atomic` und das vorhandene P-Profil mit zwei getrennten Erwartungen sind nach einer Strukturentscheidung neu zu prüfen.

## Vorgeschlagene Zielidentität

| Rolle | ID / shortKey | Titel DE / EN | Beschreibung DE / EN |
| --- | --- | --- | --- |
| Historische Sammel-ID als Cluster | `59d5a330-61be-4590-ab46-cf7cefecd144` / `canonical_math_sek1_j7_right_prism_volume_surface` | „Volumen und Oberfläche gerader Prismen“ / “Volume and surface area of right prisms” | „Dieser Ordner bündelt die getrennten Lernziele zum Volumen und zur gesamten Oberfläche gerader Prismen.“ / “This folder groups the separate goals for the volume and total surface area of right prisms.” |
| Neues atomisches Volumenziel | `68fb0e78-34f2-5572-8db6-e7f5ebcff70f` / `canonical_math_sek1_j7_right_prism_volume` | „Volumen gerader Prismen berechnen“ / “Calculate the volume of right prisms” | „Die lernende Person kann bei einem geraden Prisma die Grundfläche und die dazu senkrechte Körperhöhe bestimmen, daraus mit V = G · h das Volumen berechnen und das Ergebnis mit passender Volumeneinheit im Sachkontext deuten.“ / “The learner can identify the base area and perpendicular height of a right prism, calculate its volume using V = G × h, and interpret the result with an appropriate volume unit in context.” |
| Neues atomisches Oberflächenziel | `f1348d40-3872-5e44-8892-3600c811796f` / `canonical_math_sek1_j7_right_prism_surface_area` | „Oberfläche gerader Prismen berechnen“ / “Calculate the surface area of right prisms” | „Die lernende Person kann an einem geraden Prisma die zwei Grundflächen und alle Mantelflächen bestimmen, ihre Flächeninhalte zur gesamten Oberfläche addieren und das Ergebnis mit passender Flächeneinheit im Sachkontext deuten.“ / “The learner can identify both bases and all lateral faces of a right prism, add their areas to find the total surface area, and interpret the result with an appropriate area unit in context.” |

Die zwei vorgeschlagenen Kinder-IDs folgen der deterministischen SHA-1-ShortKey-Regel in `app/scripts/applyMathBatch012VolumeStructuralSplit.ts`; sie sind im aktuellen Kanon nicht belegt. Die alte ID bleibt als Cluster erhalten, damit bestehende Verweise auf den Themenpfad zeigen. Sie darf nicht stillschweigend zu „Volumen“ umgedeutet werden: gespeicherte Mastery unter der früher kombinierten ID ist keine getrennte Bestätigung beider neuen Kompetenzen. Vor Ausrollung ist dafür eine ausdrückliche, getestete Übergangsregel erforderlich.

Beide Kinder bleiben J7, `Geometry`, `core: true`, `AB2`, `L2`. Der bestehende Elterncluster `5ecf51c3-07bd-44fb-9862-5f2e5f2a99d1` kann weiterhin die alte ID enthalten; diese enthält dann genau die zwei Kinder. Vorfahrengewicht und `curricularAtomic`-Nenner steigen durch diesen einen Split von 797 auf 798. Die Tags und Geltungsbereiche der Kinder folgen **einzeln** aus Quellen, nicht automatisch dem alten Ziel.

## Quellen und direkte Folgen im Graphen

Die [hessische Sek-I-Kerncurriculum-Quelle](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf), Kapitel 7.3, nennt bei J7/8 für Prisma sowohl Volumen als auch Oberflächeninhalt. Die im Repository extrahierten Zeilen `he-math-seki-kc-7-3-koerper-j7-8-02-d13ff17e` und `he-math-seki-kc-7-3-messvorgaenge-j7-8-02-c4e78487` tragen beide Teilkompetenzen. Die Zeile „Grundkörper (Prisma, Kreiszylinder)“ trägt hingegen keine Berechnung. Im hessischen G8/G9-Lehrplan sind die Zeilen „Oberflächeninhalt, Volumen“ tragfähige Kandidaten für beide Kinder; die benachbarten Modell-/Netz-/Schrägbild-Zeilen sind keine Berechnungsbelege. Das alte Ziel besitzt insgesamt zehn Source-Review-Zuordnungen in HE, BW, MV und SH plus eine ältere BB-Zuordnung. Besonders wichtig: MV hat hier nur eine partielle „Volumen“-Zeile; SH nur eine partielle Körperarten-Zeile. Alle Zuordnungen brauchen eine individuelle Entscheidung, bevor die alten Kanten abgelöst werden.

| Kante | Kandidat | Grund |
| --- | --- | --- |
| Volumen-`requires` | `87c55be5-06a9-41e2-a0d4-c60f7c8b8078` (Flächeninhalte), `57fbbf31-9b8c-5408-9af5-fbc73acd12bb` (Volumeneinheiten), `65365dce-f33f-49d8-9516-42f75883aa86` (Orientierung) | Entspricht den drei bisherigen direkten Voraussetzungen; die Körperhöhe wird im Kind selbst gelernt. |
| Oberfläche-`requires` | `87c55be5-06a9-41e2-a0d4-c60f7c8b8078`, `65365dce-f33f-49d8-9516-42f75883aa86` | Flächen und Umfang sind fachlich erforderlich; der Umfang ist bereits transitiv über die Flächen-Grundlage angebunden. Volumeneinheiten sind keine Voraussetzung. |
| J7-Prüfung `0dded9c1-043e-57cb-82fc-792b391e9cb0` | Beide Kinder in `requires` und `examData.coveredGoalIds` | Teil 2 prüft Volumen, Teil 3 Oberfläche; Teil 4 Dichte benötigt das Volumen. Aufgabeninhalt und Bewertung müssen nach der Umstellung erneut geprüft werden. |

In 22 Mathematik-Composition-Views steht die alte ID direkt. Für jeden betroffenen Geltungsbereich ist der Cluster-/Kinderpfad sowie die Sichtbarkeit der zwei Teilkompetenzen gegen Originalquellen zu prüfen. Das nationale Lernzielbuch, Quellenbegründungen, Surrogatbelege und der Routenauswahltest `validateLearnerGoalSelection.ts` referenzieren die alte ID ebenfalls. Ein bloßes Ersetzen der ID in allen Dateien wäre fachlich falsch.

## Bilder: zwei gezielte PNG-Kandidaten

Das heutige JPG zeigt **beide** Rechnungen auf einer Fläche. Sein 3-4-5-Dreiecksprisma mit Körperhöhe 10 cm und den Ergebnissen 60 cm³ und 132 cm² ist rechnerisch plausibel, ist aber nach dem Split keine primäre Visualisierung für genau ein atomisches Ziel. Als historische Abbildung erhalten; für jedes Kind ein eigenes gut lesbares Querformat-PNG mit geprüfter Provenienz, Alt-Text und V-Review. Die folgenden Prompts sind Kandidaten für eine Bildgenerierung, keine Bildfreigaben.

### PNG 1 – Volumen

> Freundliche, klare mathematische Cartoon-Infografik im Querformat für Jahrgang 7, gut lesbar auf dem Handy. Zeige genau **ein gerades Dreiecksprisma** als durchsichtiges Gefäß. Seine rechtwinklige dreieckige Grundfläche hat Katheten 3 cm und 4 cm; ihre Fläche ist G = 6 cm². Markiere den senkrechten Abstand der zwei parallelen Grundflächen als Körperhöhe h = 10 cm. Hebe den **Innenraum** als Füllraum hervor. Nur die Rechnung `V = G · h = 6 cm² · 10 cm = 60 cm³`. Die 3 cm und 4 cm liegen sichtbar am Grunddreieck; 10 cm liegt entlang der senkrecht dazu stehenden Prismenkante. Keine Oberflächen-, Netz- oder Mantelflächenrechnung, keine weitere Figur, keine Plattformnamen oder Wasserzeichen. Keine vom Prisma abweichende Pyramidenform.

### PNG 2 – Oberfläche

> Freundliche, klare mathematische Cartoon-Infografik im Querformat für Jahrgang 7, gut lesbar auf dem Handy. Zeige genau **ein gerades Dreiecksprisma** mit rechtwinkligem Grunddreieck 3 cm, 4 cm, 5 cm und Körperhöhe 10 cm. Daneben ein **faltbares, geometrisch korrektes Netz** mit genau zwei kongruenten 3-4-5-Dreiecken und drei Rechtecken 3×10 cm, 4×10 cm, 5×10 cm. Beide Grunddreiecke gelb, die drei Mantelrechtecke grün; alle fünf Teilflächen sind eindeutig zuordenbar und genau einmal gezählt. Zeige knapp `G = 6 cm²`, `M = (3+4+5) cm · 10 cm = 120 cm²`, `O = 2G + M = 132 cm²`. Die Oberfläche ist die Außenhülle, nicht der Innenraum. Keine Volumenformel, keine cm³-Einheit, keine weiteren Körper, Plattformnamen oder Wasserzeichen.

Für die Abnahme die korrekten Formeln **und** die Perspektive, Maßpfeile, Netzkanten, Einheiten, deutsche Schreibweise und Lesbarkeit bei kleiner Darstellung am tatsächlichen Pixelbild prüfen. Bei missverständlichem Netz das Bild neu erstellen; ein korrektes Ergebnis allein genügt nicht.

## Nachweise vor einer M7-Zählung

Pro Kind neue semantische Atomicity- und Memory-Entscheide, eigenes P-v2-Profil mit genau einer Kompetenz, neue begrenzte D-Buchseite mit zwei unabhängigen aktuellen Reviews sowie eigener A-/M-/V-Beleg. Die bisherigen P-Erwartungen `prism-volume` und `prism-surface` liefern Entwurfsstoff, keine übertragbaren Fingerprints. Alte D-Reviews und das alte JPG belegen lediglich den Splitbedarf. Nach Kanon-, Quellen-, View- und Assessment-Änderung gezielte Graph-/Scope-/Assessment-Tests, Buch- und Statusregeneration und erst dann die strikte D/P/A/M/V-Schnittmenge neu berechnen. Eine menschliche Freigabe ist dadurch nicht behauptet.
