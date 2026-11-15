# Quellen, tatsächlicher Aufgabenumfang und Grenzen

Am 15. November 2026 wurde der aktuelle kanonische Mathematikstand gelesen,
einschließlich der vollständigen Beschreibungen von `80c232f1`, `496f16a0`,
`fcfbff12` und `d668c22d`. Die Viererkette beginnt nur bei der Orientierung
`65365dce`. Die sechs hier relevanten bestehenden Knoten, die aktive
Profilfassung und ihre Rohdatei-Hashes stehen unter `inputs/` und
`input-pins.json`.

Das aktive zentrale D/P-Register
`quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json`
führt für diese vier Ziele tatsächlich
`quality/goal-evidence/2026-11-13/feedback-image-and-terminology-current-v1/math-b037a-retained-eighteen.config.json`.
Dessen vier Profile haben unverändert je zwei Pflicht-Erwartungen, mindestens
zwei unabhängige Demonstrationen sowie Variations- und Transferbedarf. Sie
stehen weiterhin auf `ai_candidate` / `needs_human_review`; diese Aufgabe
erhebt sie nicht zu menschlich genehmigten Standards. Die geforderten
beobachtbaren Leistungen werden in `rubric-coverage-and-omission-bounds.json`
den Kriterien zugeordnet. Fallbeispiele der Profile werden nicht als amtliche
oder erschöpfende Aufgabenspezifikation ausgegeben. Der neue Achsenfall
variiert quantitative Zeitachsen gegen Kategorien mit Einheitenfaktor; der
neue Korrekturfall variiert den Bezug einer gezeichneten Länge gegen Anteile
unterschiedlich großer Gruppen. Negative Temperaturskalen und flächenhafte
Piktogramme werden durch diese konkreten Prüfungen nicht eigens nachgewiesen.

Die **Primärquellen wurden tatsächlich geöffnet**, nicht aus Suchschnipseln
übernommen:

- [LISUM, Materialien zur Diagnose und Förderung, Daten und Zufall](https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/rlp-online/Teil_C/Mathematik/Materialien/Ma_MzDuF_L5__Daten_und_Zufall_Gesamt_2023-05.pdf): Die PDF-Seiten 45/46 verbinden Lesen, Kennwerte und Aussagenprüfung und begründen die Wahl von Diagrammtyp und Achseneinteilung aus den Daten. Seite 46 behandelt relative Häufigkeiten als Vergleichsbasis für unterschiedlich große Gruppen. Die Einleitung auf Seite 2 trennt Diagnose von anschließender Förderung. Daraus folgt unsere didaktische Entscheidung, die Anforderungen getrennt sichtbar und Fehler korrigierbar zu machen. Es folgt keine bestätigte Wirkung von SkillPilot und keine pauschale Jahrgangszuordnung.
- [IQB, Lernaufgaben Mathematik Sekundarstufe I](https://www.iqb.hu-berlin.de/de/schule/aufgaben/seki/lernaufgaben-mathematik/): Der aktuelle Originalkatalog unterscheidet Unterrichtsphasen sowie prozess- und inhaltsbezogene Kompetenzdimensionen. Er ist Orientierung für Aufgabenzwecke, keine Freigabe unserer acht neuen Fälle. Es wurde keine IQB-Aufgabe kopiert oder auf unsere Konstruktion umetikettiert.

Die J7-Platzierung folgt den **heutigen** kanonischen Zielmarken und dem
vorhandenen Ordner „Prüfungen Jahrgangsstufe 7“. Sie wird nicht als Aussage
ausgegeben, alle Länder verlangten diese vier Ziele offiziell gerade in J7.
Die Prüfungen übernehmen die aktuelle Anwendbarkeit ihres jeweiligen Ziels
und erhalten zusätzlich `applicabilityFromRequires`; die vorhandenen
Ländermappings werden hier weder erweitert noch neu interpretiert. Eine
notwendige Vorbereitung ist weiterhin keine amtliche Quellenzuordnung.

Alle Werte, Kontexte, Texte und Diagramme sind neu verfasste Konstruktionen:

| Material | Daten | Festgelegte Bedeutung |
| --- | --- | --- |
| Wasser A/B | Zeit 0, 2, 4, 6 h; A 40, 50, 60, 50 L; B immer 50 L | Gerade Abschnitte definieren einen Modellverlauf; keine echte Messreihe, keine Ursacheninformation. |
| Budget | Bus 2,5 und Material 4 auf einer Achse in 100 EUR | Horizontale Geldachse, senkrechte Kategorien; Beträge 250 / 400 EUR. |
| Plateau C | Zeit 0, 1, 3, 5 h; Volumen 20, 50, 50, 30 L | Ein höchster Wert kann über ein ganzes Intervall vorliegen. |
| Ausschnitt A/B | 40 / 60 L; sichtbarer Achsenbeginn 30 L | Gezeichnete Höhen 10 / 30 entsprechen nicht dem Verhältnis der ganzen Werte. |
| Zeitentwurf D | Zeitmarken 0, 1, 5 h gleich weit gezeichnet; 10, 20, 30 L | Gleiche Zunahmen treffen auf 1 h beziehungsweise 4 h. |
| Teilnahme A/B | 24 von 40 und 27 von 60 | Die größere Anzahl und der größere Anteil liegen in verschiedenen Gruppen. |

Das exakte Zahlenlesen, die sichtbare Nullbasis und die absichtlich ungleichen
Zeitabstände sind die zu bewertenden mathematischen Objekte. Deshalb sind
native Vektordiagramme mit deterministischem Rasterexport hier fachlich
begründet. Es handelt sich um Prüfungsstimuli, nicht um einen Austausch der
bestehenden freundlichen Orientierungsbilder oder eine Behauptung über einen
Bildgenerierungsanbieter. Die vier vorhandenen Lernzielbilder bleiben gleich.

Die verschiedenen Kompetenznachweise bleiben getrennt: bloß richtige Werte
reichen nicht als Erklärung eines Fehlers, eine Fehlermeldung ohne konkrete
Alternative reicht nicht als klarere Darstellung und das Erklären eines
Distributivgesetzfehlers beweist keine Diagrammkompetenz. Aus einem
Achsenausschnitt allein folgt weder Fehlerhaftigkeit für jeden Zweck noch
Täuschungsabsicht. Aus dem Wasserverlauf folgen weder Pumpenursache noch
sicherer Verlauf nach dem dargestellten Zeitende.
