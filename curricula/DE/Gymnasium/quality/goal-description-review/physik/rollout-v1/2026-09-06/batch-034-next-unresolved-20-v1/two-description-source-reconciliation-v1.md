# B034: begrenzte Adoption zweier Beschreibungs-/Übersetzungskorrekturen

Stand: 2026-09-06. Ausführung durch OpenAI/Codex im ausdrücklich beauftragten Layer-A-Umfang. Dies ist keine neue Blindrunde und keine menschliche, Quellen- oder Bildfreigabe. Die Umsetzung und Bytebindungen werden in `two-description-adoption-receipt-v1.json` festgehalten.

## d1306bda-35ff-53e9-9458-3cbc128874d8

Deutscher Titel und deutsche Beschreibung bleiben vollständig unverändert. Derzeit enthalten beide englischen Felder denselben deutschen Text. Übernommen werden ausschließlich:

- `titleEn`: Evaluate cyclotron applications in radiotherapy
- `descriptionEn`: The learner can relate the operating principle of the cyclotron to radiotherapy and evaluate the benefits and risks of medical applications using physical criteria.

Gelesene Quelle: `curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_PHYSIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json`, Quellziel `520d58c3-4ec9-5af0-92ac-5a33bbe86ae1`, Ph12-GA-BIO.3.5. Die bestehende partielle Zuordnung steht in `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json`. Die Quelle verbindet Zyklotronverständnis und therapeutische Bedeutung mit Nutzen-/Risikodiskussion sowie Reflexion eines Bewertungsprozesses. Die Übersetzung bildet nur die unveränderte kanonische Aussage ab; sie beansprucht nicht sämtliche Quellenteile allein für dieses Ziel.

Die vorhandenen Voraussetzungen `2d62b444-796e-548d-aeee-cfd9c6665ddc` (Kreisbeschleunigervergleich) und `23fd87f3-9e79-5e0e-b9d1-7c15f3d119e0` (Bewertungscluster) wurden gelesen. Der medizinische Anwendungsbezug trägt eine zusammenhängende physikalisch begründete Bewertung; die Übersetzung fügt weder eine Beschleunigerkonstruktion noch eine neue medizinische Routine hinzu.

Erneute fachliche AI-Entscheidungen: `atomic` und `no_memory_needed`. Begründung: Ein anwendungsbezogener Kriterienentscheid bleibt der gemeinsame Leistungskern; Funktionswissen dient dieser Begründung. Nutzen-/Risikenurteile werden aus Kontext und physikalischen Argumenten entwickelt, nicht durch ein neues isoliertes Fakten-/Formeldeck ersetzt.

## 28f6a324-5f5e-5771-91d2-c007f6c275aa

Beide Titel bleiben unverändert. Übernommen werden:

DE: Die lernende Person kann das Plancksche Wirkungsquantum h aus Fotoeffekt-Messdaten durch eine lineare Auswertung der Einstein-Gleichung für die maximale kinetische Energie bestimmen und den Zusammenhang zwischen Geradensteigung und h physikalisch deuten.

EN: The learner can determine Planck's constant h from photoelectric-effect measurement data by linearly analysing Einstein's equation for the maximum kinetic energy and physically interpret the relationship between the slope of the straight line and h.

Die bisherige deutsche Beschreibung nennt bereits die Einstein-Gleichung und experimentelle Messdaten. Die neue Fassung präzisiert deren Energiebegriff und die physikalische Bedeutung der bereits angelegten linearen Auswertung; sie erweitert nicht auf andere Bestimmungsexperimente. Sie schreibt insbesondere keine Energieachse vor: Bei maximaler kinetischer Energie in Joule gegen Frequenz in Hertz ist die Steigung h; bei positiver Gegenspannung in Volt gegen Frequenz ist sie h/e. Der Zusammenhang bleibt unter entsprechender Einheitenumrechnung derselbe.

Gelesene aktuelle Quellenextraktionen und direkte partielle Zuordnungen:

- BY: dieselben Extraktions-/Mappingdateien wie oben, insbesondere `031e3a67-159e-5b74-becd-d351b324841f`, Ph13-EA.5.4 (Gegenfeldmethode zur h-Bestimmung). Zusätzlich gelesen wurden die direkt verknüpften Quellziele `7c42f59b-0b98-53c4-822d-70b89fe6d6bb`, `ed5ce03b-7a98-57de-a9c7-4f9f0f319d3e`, `99e805f2-f068-598a-9df4-441bce40565a` und `d5ccdb26-cfad-5afa-8c18-a23d95eb398f`. Diese enthalten unter anderem Elektronenbeugung, Röntgenspektrum, Argumentations- oder Unsicherheitsaspekte; ihre Mehrfachzuordnung ist kein Nachweis, dass dieses schon bisher auf die Einstein-Auswertung beschränkte Ziel alle diese Leistungen allein abdeckt.
- HE: `curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_PHYSIK_SEKII_KC2024.source-extraction.json`, `he-phys-sekii-q3-2-b03-a01-082af14a`, Q3.2; zugehörig `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`. Der Punkt verbindet Fotoelektronenenergie/Gegenfeldmethode mit Grenzfrequenz, Austrittsenergie und h.
- BW: `curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_PHYSIK_SEKII_BP2016_V2.source-extraction.json`; zugehörig `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_source_extraction_to_canonical_physics.review.json`. Gelesen: `bw-phys-sekii-3-4-1-b03-a01-da833636`, `bw-phys-sekii-3-4-6-b05-a01-3cf1fa4a`, `bw-phys-sekii-3-5-6-b01-a01-c11b8ec7`, `bw-phys-sekii-3-6-1-b03-a01-8f508781`, `bw-phys-sekii-3-6-6-b01-a01-e5c6fcd6`; belegt sind Naturkonstantenbedeutung und Einstein-Deutung des Fotoeffekts, nicht eine neu beanspruchte Pflichtachse.

Die vorhandenen Voraussetzungen `264dc31c-ec92-5e39-a8b8-16f1d74366d4` (Messkurven linearisieren, Geraden anpassen, Parameter deuten) und `cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f` (Fotoeffekt/Einstein-Deutung) wurden gelesen.

Erneute fachliche AI-Entscheidungen: `atomic` und `no_memory_needed`. Begründung: h aus einer linearen Datenauswertung bestimmen und den Steigungsbezug erklären sind Rechen- und Deutungsseite derselben Auswertung. Achsengröße und Einheiten sind aus der Einstein-Gleichung zu begründen; ein pauschaler Merksatz „Steigung = h“ wäre bei Spannungsdaten ungeeignet. Daher kein neues eigenständiges Deck.

## Änderungs- und Validierungsgrenzen

Erlaubt sind genau die genannten Textfelder, die zugehörigen Fingerprints der Semantic-Kind-, Atomicity- und Memory-Metadaten sowie beim Fotoeffekt der aus der Beschreibung gebildete Bild-Alttext und der deutsche QA-Beschreibungssnapshot. Die bestehenden Semantic-Kind-Entscheidungsstatus werden nicht neu verliehen. Atomicity und Memory werden mit den oben begründeten tatsächlichen AI-Neubewertungen datiert.

Die vier vorhandenen Bilddateien (kanonische und öffentliche Kopie je Ziel) bleiben byte-identisch. Alle Bildfreigaben, Prüfernamen und Bildprüfzeiten bleiben unverändert; es erfolgt keine neue Bildfreigabe. Die auftraggebende Hauptinstanz hat die Fotoeffektgrafik bereits visuell geprüft; dieser Teilauftrag behauptet keine eigene neue Bildprüfung.

Keine Änderungen an IDs, Gewichten, Tags, Anwendbarkeit, Kanten, Lernzustand, Decks, Quellenzuordnungen, Extraktionen, Registry, Laufprotokollen, Büchern, Materialisierung, globalen Berichten oder Runtime. Der Freeze-Check vor der Änderung ergab PASS. Fokussierte Fingerprint-, Text-/Struktur-, Bildhash- und lesende bestehende Ledgerprüfungen folgen der Adoption. Die globalen Abschluss-/Maturity-Gates verbleiben beim Hauptauftrag; diese Teiladoption allein behauptet keinen abgeschlossenen B034-Review oder Release.
