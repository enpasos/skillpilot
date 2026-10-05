# Unabhängige Fachprüfung A — Chemie Energy13, aktueller Stand

## Durchführung und Grenzen

- Reviewer: OpenAI, GPT-6-Familie. Der genaue bereitgestellte Modell-Identifier und Samplingparameter sind im Agentenkontext nicht verfügbar; die RunManifest benennt diese Grenze, ohne eine konkrete Modellvariante zu erfinden.
- D-Start, erster sicher beobachteter UTC-Zeitpunkt: `2026-10-04T22:40:26Z`; D-Abschluss: `2026-10-04T22:47:12Z`.
- D-Run: `chemie-energy13-current-20261005-d-first-pass-a`; Independence Group A aus der Kampagne. Blind zu Round B, deren Ergebnissen und Notizen, Synthese, historischen unabhängigen D-Entscheidungen und Autor-Entscheidungskandidaten.
- D-Entscheidungen und vollständige bilinguale Verständnis-/Leistungs-/Transferketten wurden geschrieben und eingefroren, **bevor** P-Kandidaten geöffnet wurden. Der nachfolgende P-Durchgang änderte keine D-Entscheidung.
- Nur aktuelle öffentliche Lehrplandaten, kanonischer Chemie-Stand, eigener Round-A-Input und gebundene PDF-Seiten wurden verwendet. Eine allgemeine Gedächtnisnotiz zu unveränderten Evidenzbindungen und der Trennung von Maschinen- und Humanfreigaben wurde konsultiert; keine historische Chemieentscheidung wurde verwendet.
- Alle Ergebnisse sind `candidate` / `ai_candidate`. Kein menschliches Approval, Trial, registriertes P-Profil, Laufzeitnachweis oder Release wird behauptet. Unveränderte A/M/V-Befunde wurden nicht neu gestartet oder verändert.

## Exakte Bindungen und Sichtprüfung

| Gegenstand | Bindung |
| --- | --- |
| Bundle | `sha256:8fc4dbcca9c5f9e45264276a893a3055773c4a728d40c49d1f361af825a208e3` |
| BookModel semantischer Digest | `sha256:a3c08b0a21961a4e65c65e8b546d00e3fc667964825a90add19c2d6965bba00a` |
| PDF-Datei, nachgerechnet | `sha256:34b9a8c0a7edc322b7977ce1faacf8d7ad7fde993572af5ccde8c74d707f13d0` |
| Round-A Batchdatei, nachgerechnet | `sha256:e313b005f2e9b216099a176bf4797d97da5e21c91f976c0887d17d41215a52a1` |
| Eingefrorener D-Output | `sha256:5000254178ac3bf0901000863200490d8cc2be68e70c148ede59dd0fd642cdef` |
| Nach D geprüfte P-Datei | `sha256:26ac6534a9825171c28aafef6c1aa5d163242a1f6c93d47815e13f15c7e132c1` |

Die P-Datei ist `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy13-current-p-v1/positive-evidence.candidates.json`; geprüft wurden die **inneren** Profile aller 13 Ziele, nicht bloß Autorlabels oder äußere Schemafelder.

Das PDF wurde mit `pdftoppm -r 110 -png` in das nachweislich ignorierte Verzeichnis `tmp/chem-energy13-d-a-render/` gerendert. Alle fünf Kontakte wurden mit `view_image(detail=original)` tatsächlich angesehen. Das PDF hat zwei Vorspannseiten und 13 vollständige Lernzielseiten; physische Seiten 3–15 entsprechen Lernzielseiten 1–13. Vollständige Lernziel-IDs, Beschreibungen, direkte und externe Voraussetzungstexte und Bildinhalte waren lesbar. Keine abgeschnittene oder auf mehrere Seiten fortgesetzte Zielbeschreibung wurde gefunden.

`pypdf` prüfte 20 benannte Ziele und die Linkannotation: keine fehlende benannte Destination, 48 URI-Annotationen. In-Buch-Voraussetzungen verweisen auf passende Zielseiten; externe Voraussetzungen und Nachfolger bleiben ausdrücklich außerhalb des Buchs. Die aktuelle kanonische Datei wurde für Texte und direkte `requires` mit dem gefrorenen Round-A-Input abgeglichen: 13/13 identische DE/EN-Titel und Beschreibungen sowie Voraussetzungslists. Damit ist keine live veröffentlichte Vollbuchverfügbarkeit bewiesen.

## Quellenprüfung

Verwendet wurden die aktuellen aktiven HE-/BY-Nachfolger mit Suffix `.m7-energy13-current-20261005-v1.review.json`, ihre zielbezogenen Mappings und die zugeordneten Source-Extraction-Passagen. Die hessischen Originalpassagen E.4/E.5 wurden zusätzlich aus der offiziellen lokalen PDF auf gedruckter Seite 36 mit `pdftotext` gelesen; die offizielle URL war im Web-Werkzeug nicht erreichbar, daher wird keine erfolgreiche Live-Abfrage der Hessen-PDF behauptet:
[Hessen KC Chemie 2024](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-chemie.pdf).

Die relevanten bayerischen Passagen wurden auf den aktuellen offiziellen Seiten gelesen:
[Chemie 9 NTG, Lernbereich 5](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg),
[Chemie 10 HG/SG/MuG/WWG/SWG, Lernbereiche 3 und 5](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch),
[Chemie 12 GA, Lernbereich 5 und K12](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend),
[Chemie 12 EA, Lernbereich 5](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht).

Die belegten Zuordnungen sind HE E.4 B01/B02/B04 und E.5 B01/B02/B03 sowie BY C9-NTG.5.5 mit paralleler C10-Stelle, C10.5.7 und C12 GA/EA.5.1–5, GA.5.7/EA.5.13. Ein offizieller Sammelbullet beweist keine semantische Atomarität. HE E.4 B03 bleibt nur teilweise abgedeckt; HE E.5 B01 bleibt ebenfalls partial, weil Wasserstoffherstellung durch Elektrolyse separat liegt. BY K12 erklärt Quellen-/Zitatdokumentation im quellenkritischen Maßnahmenziel. Diese Prüfung bestätigt ausschließlich den benannten 13-Ziel-Scope und seine HE/BY-Stellen; sie macht aus dem ausdrücklich begrenzten 358-Ziel-Sourceatlas keine vollständige 376-Ziel-Quellenaussage und bestätigt nicht pauschal jede kanonisch aufgelistete Jurisdiktion.

## D-Entscheidungen

Die Produktionsdatei enthält genau 13 Schema-konforme Records in Kampagnenreihenfolge. Ergebnis: **8 keep, 4 revise, 1 split_review**. Die vier Vorschläge sind vollständig DE/EN ausgeführt und erweitern keine Fachroutine.

| Lernziel | D | Tragender Befund |
| --- | --- | --- |
| `2be9e61a-88ea-56fe-8294-ee46e3c9a8ef` Rohstoffvorkommen | keep | Eine begründete Rohstoffeinordnung verknüpft Förderung, Endlichkeit, konkrete Risiken und Lieferabhängigkeit. Das Bild zeigt nur die ersten technischen/ökologischen Aspekte; geopolitische Informationen müssen im Fall geliefert werden. |
| `8ceb1749-fce0-584f-a2b8-0a309282329a` Fraktionierung/Cracken | split_review | Physikalische Gemischtrennung und chemischer Bindungsumbau sind separat erlern- und prüfbare Mechanismen. Die zwei eigenständigen Bildpanels und die aktuelle Leistungsforderung stützen die offene Entwicklerprüfung. Ein Vergleichswort darf eine Aufteilung nicht verdecken. |
| `8ece9beb-9458-5ea1-8e45-9be04670f464` Brennstoffe | revise | Energetischer Vergleich benötigt eine benannte gemeinsame Bezugsbasis; „im Kontext diskutieren“ sagt diese Bedingung nicht. Die Bildseite enthält außerdem Ethanol außerhalb der beschriebenen Kohlenwasserstoffe und CO2-Ranglabels ohne erkennbare Bezugsgröße. |
| `b95cdf98-fc97-5a94-b133-878922d28156` Erdölprodukte | revise | Die Quelle und der Titel verlangen Beurteilung der Bedeutung. Nutzen plus Umweltfolgen bilden den nötigen Vergleich; reine Einsatzzuordnung und Folgenabschätzung machen ihn noch nicht deutlich. Geeignet für BY Jahrgang 9/10. |
| `a0e8f0f2-24e2-5945-a511-597d32e73796` Rohstoffnachhaltigkeit | keep | Recherche und Energie-/Grundstoffrollen dienen derselben kriteriengestützten Bewertung. Keine pauschale Gleichsetzung „nachwachsend = folgenfrei“. |
| `8b98d8ba-65c6-58d7-92f0-45f4b2456573` Maßnahmen/Quellen | keep | Einsparung und Alternative sind Handlungsoptionen desselben Rohstoffproblems; Quellenprüfung ist die durch Vorgänger und BY K12 gedeckte Arbeitsweise. |
| `4928d5d1-e790-5883-9349-3b03a1c63b99` U/H | revise | U und H sind Zustandsgrößen; Reaktionsenergie und Reaktionsenthalpie deren Änderungen. Diese Änderungen müssen ausdrücklich benannt werden. Systemklassifikation und Arbeit/Wärme erklären denselben Unterschied. |
| `3e433dae-99f9-5a95-ad63-d5fa0b5f6836` Bindungen/Enthalpie | revise | Energiereich/energiearm braucht den relativen Bezug auf verglichene Edukt-/Produktsysteme. Das Bindungsmodell erklärt qualitativ die Bilanz; die Bildsumme darf nicht als allgemein exakte phasenunabhängige Gleichung gelten. |
| `4663fd80-1618-5211-8020-18f4b80979fc` Bildungsenthalpien | keep | Rechnen und Vorzeichendeutung dienen derselben Exo-/Endotherm-Einordnung. Bildrechnung, Koeffizienten und H2O(l)-Bezug sind konsistent. |
| `3c9bfa10-9a13-50cc-96c8-6213e28d6c54` Halogenkohlenwasserstoffe | keep | Stoffbezogenes Urteil und belegte Quellen sind ein zusammenhängender Bewertungszweck; keine zusätzliche Mechanismusprüfung oder Pauschalwirkung ist beansprucht. |
| `b759d50d-0e82-5b10-89a2-fe5271106e50` Brennstoffzelle | keep | Zellfunktion, Reaktionsdarstellung und Energieträger-/Wandlerrolle sind derselbe Struktur-Funktionszusammenhang. Das aktuelle PEM-Bild bilanziert Atome/Ladung korrekt und trennt Protonen- und Elektronenwege; die Elektrolyse bleibt außerhalb des Ziels. |
| `27e4fe9b-4796-579b-8f7d-06c65fb600c0` Bleiakku | keep | Qualitative reversible Stoffumwandlung trägt Speicherfunktion und knappe Nutzungseinordnung. Bildplatten und äußere Elektronenrichtungen beim Laden/Entladen sind konsistent; Stoffpfeile sind keine vollständigen Gleichungen. |
| `6b82f80e-f493-5e6b-9709-2d4eca98c137` Li-Ionen-Akku | keep | Bauteile und getrennte Ladungswege erklären einen Speicher; vereinfachtes Modell und Nutzung bleiben bei derselben Kompetenz. Die detaillierte LK-Fahrzeuganalyse ist Nachfolger, kein aktueller Zusatzanspruch. |

Bildunterstützung ist in keiner Zeile unabhängige Lernendenleistung. Die benannten tatsächlichen Bildgrenzen sind kein Auftrag zum pauschalen Neustart historisch unveränderter A/M/V-Evidenz.

## Anschließende P-v2-Inhaltsprüfung

**PASS_CANDIDATE_ONLY** bedeutet eine fachlich/didaktisch brauchbare aktuelle P-Kandidatenkette für das betrachtete Ziel, einschließlich echter Variation. Es bestätigt weder D-Abschluss noch registrierte Autorität, Bindung an eine später geänderte Beschreibung, maschinelles Gesamt-M7 oder menschliche Freigabe. **HOLD** hält den konkret benannten inhaltlichen oder Scopebefund offen.

| Lernziel | P | Inhalt, Hilfe und frischer Transfer |
| --- | --- | --- |
| `2be9e61a-88ea-56fe-8294-ee46e3c9a8ef` | PASS_CANDIDATE_ONLY | `deposit-extraction-dependence` ist ein kausaler Zusammenhang, keine Begriffsabfrage. Offshore-Porenlager mit 70-%-Importweg versus tight-gas mit Wasser-/Abdichtungsdaten ändert Durchlässigkeit, Umweltpfad und Versorgung. Geologisches Profil und Lieferdaten sind zulässige Fallhilfe; die begründete technische/ökologische/geopolitische Verknüpfung muss der Lernende leisten. Keine reale Förderung wird verlangt. |
| `8ceb1749-fce0-584f-a2b8-0a309282329a` | HOLD | Die Wissenschaft stimmt: Trennung verändert keine Molekülidentität, `C10H22 → C8H18 + C2H4` bilanziert C/H. Das einzige essentielle ID bündelt jedoch weiterhin zwei unabhängig assessierbare Mechanismen. Ein Destillationsfall und ein Crackfall lösen den D-Atomicitybefund nicht; Registrierung unter einem vermeintlich atomaren Gesamtziel bleibt offen. Siede- und Produktdaten sind Hilfe, die Zuordnung/Identitätsbegründung ist Eigenleistung. |
| `8ece9beb-9458-5ea1-8e45-9be04670f464` | PASS_CANDIDATE_ONLY | `combustion-common-comparison-basis` enthält verständnisrelevante Bezugsgröße/Systemgrenze. Reaktionen und Werte sind korrekt: 55,6 versus 50,5 kJ/g; bei Nutzwärme/Wirkungsgrad etwa 61,8 versus 62,6 g CO2 je 1000 kJ. Zweiter Fall ändert Nutzungseffizienz und Aussagegrenze, nicht nur Zahlen. Tabellen und Effizienzen sind Datenhilfe; Rangänderung und fehlende vorgelagerte Emissionen verlangen Eigenbegründung. Die D-Präzisierung und Bildgrenze bleiben separat offen. |
| `b95cdf98-fc97-5a94-b133-878922d28156` | PASS_CANDIDATE_ONLY | `petroleum-application-impact` verbindet Produktfunktion, Nutzen und Freisetzungsweg. Diesel/Kunststoff versus Schmieröl/Bitumen ist eine echte Änderung von Anwendung und Umweltpfad. Kurzdaten dürfen Folgen liefern; Nutzen-Abwägung und Begrenzung eines Gesamturteils sind selbst zu erklären. Alter und Fachumfang bleiben bei BY Sek I. Der P-Kandidat passt bereits zum begründeten D-Vorschlag, er erledigt diesen nicht. |
| `a0e8f0f2-24e2-5945-a511-597d32e73796` | PASS_CANDIDATE_ONLY | `renewable-feedstock-sustainability` grenzt biologische Herkunft von Lebenszyklusurteil ab. Heizöl/Holz für gleiche Nutzwärme versus Polymer-Grundstoffe für gleiche Verpackungsfunktion prüft den Wechsel von Energie- zu Materialnutzen sowie Anbau-/Entsorgungsfragen. Eigene belegte Recherche bleibt verlangt; Dossierdaten ersetzen kein Urteil. Keine automatische CO2-Freiheit oder biologische Abbaubarkeit wird angenommen. |
| `8b98d8ba-65c6-58d7-92f0-45f4b2456573` | PASS_CANDIDATE_ONLY | `resource-measures-with-traceable-sources` ist eine evidenzgestützte Handlungsableitung. Verkehr versus Polymerrohstoff mit absoluter Werbeaussage verändert Bedarf und Quellenlage. Vorlagen liefern Werbung/Studienrahmen, aber nicht die begründete Einspar-/Alternativmaßnahme; ergänzende Recherche und korrekte reale Zitatkennzeichnung bleiben Eigenarbeit. Ein wirtschaftliches Interesse macht eine Quelle nicht automatisch falsch. |
| `4928d5d1-e790-5883-9349-3b03a1c63b99` | HOLD | Essentielles ID und Kolbenfall sind fachlich tragfähig: `q=+500 J`, `w=−200 J`, `ΔU=+300 J`, bei konstantem Druck/reiner Volumenarbeit `ΔH=+500 J`. Der frische Fall benennt aber nur eine **wärme- und stoffisolierte** Umhüllung und verlangt daraus „isoliert“ und `ΔU=0`. Arbeit ist damit nicht ausgeschlossen: ein adiabatischer geschlossener beweglicher Kolben kann Arbeit abgeben und U ändern. Beide Tasksprachen müssen vollständige Energieisolierung einschließlich Arbeit oder eine starre, nicht arbeitende Gesamtgrenze angeben. Der Datenwechsel von Kolben zu starrem Gefäß/offener Grenze ist ansonsten echter Transfer. |
| `3e433dae-99f9-5a95-ad63-d5fa0b5f6836` | HOLD | Essentielles ID vermeidet den falschen Energiegewinn beim Bindungsbruch und benennt Näherung/Phasengrenze. Die Zahlen −183/−103 sowie der 44,0-kJ/mol-Wasserphaseneffekt sind rechnerisch plausibel. Der erste Erwartungstext verlangt jedoch explizit zwei **berechnete Bindungsenergiebudgets**. BY C12-GA/EA.5 definiert diesen Molekülbau-/Verbrennungswärme-Zusammenhang als qualitative Je-desto-Beziehungen mit „keine Berechnungen“. Eine qualitative Begründung aus bereitgestellten Bilanzen muss genügen; verpflichtende Bindungsenergierechnung ist hier ein Scopeüberschuss. Phase statt Halogenwechsel ist echte unabhängige Variation. |
| `4663fd80-1618-5211-8020-18f4b80979fc` | PASS_CANDIDATE_ONLY | Trotz Archetyp `procedure` ist `formation-enthalpy-state-and-sign` keine reine Substitutionsroutine: Referenzzustand, Koeffizient, Reaktionsrichtung und Phase sind essentiell. NH3 liefert −92,2 kJ je dargestellter Reaktion; Methan/H2O(l)/(g) liefert −890,3/−802,3 kJ und 88,0 kJ Differenz. Die Phase ist eine echte Zustandsvariation. Tabellenwerte sind Hilfe, selbst gewählte Gewichtung/Phasen und Deutung sind gefordert. Das bekannte Methan-Bildbeispiel allein zählt nicht als frische Leistung. |
| `3c9bfa10-9a13-50cc-96c8-6213e28d6c54` | PASS_CANDIDATE_ONLY | `halogenated-use-release-source-judgment` fordert stoffbezogene Evidenz und Exposition. FCKW versus chlorfreies HFKW ändert den Wirkungsweg Ozon/Klima und falsifiziert eine pauschale Wirkungsschablone. Dossierinformationen über Wirkung sind Fallhilfe; Urheberschaft, Ergänzungsquelle, Abwägung und Aussagegrenze sind eigenständig. Mensch-/Umweltfolge wird aus Daten abgeleitet, keine unbelegte aktuelle Rechtslage oder reale Freisetzung verlangt. |
| `b759d50d-0e82-5b10-89a2-fe5271106e50` | HOLD | `fuel-cell-electrodes-and-storage-role` und der PEM-Fall sind wissenschaftlich korrekt und prüfen Ladungswege/Bilanz, nicht bloße Formelwiedergabe. Der zweite Fall ändert sinnvoll Systemgrenze und Stoffzufuhr. Seine verpflichtende Leistung verlangt aber die Erklärung **endothermer/energiebedürftiger Wasserspaltung** im Elektrolyseur; die observable/essential-Kette macht Herstellung zum eigenen Bewertungsaspekt. Das überschreitet den gefrorenen Zielumfang: HE E.5 B01 ist gerade deshalb partial, weil H2-Herstellung beim separaten Elektrolyseziel liegt. Vorherige Energiezufuhr darf als bereitgestellter Kontext den Wandler/Speicher-Unterschied klären; Elektrolysechemie darf hier keine zusätzliche Masterybedingung sein. |
| `27e4fe9b-4796-579b-8f7d-06c65fb600c0` | PASS_CANDIDATE_ONLY | `lead-battery-reversible-conversion` verbindet Stoffänderung, Energiezufuhr und Ladungswege. Qualitative Gesamtbilanz `Pb + PbO2 + 2 H2SO4 → 2 PbSO4 + 2 H2O` ist korrekt; Säureverbrauch erklärt die Dichteabnahme. Starterfall versus Laden/gewichtsbeschränkter Einsatz ändert Richtung und Anwendung. Vorher-/Nachherstoffe sind Fallhilfe; Interpretation und Widerlegung eines freien Elektronenvorrats bleiben Eigenleistung. Keine praktische Akkuöffnung/Ladung wird verlangt. |
| `6b82f80e-f493-5e6b-9709-2d4eca98c137` | PASS_CANDIDATE_ONLY | `lithium-ion-host-ion-electron-path` beschreibt den vereinfachten Struktur-Funktionszusammenhang mit getrennten Transportwegen und reversibler Belegung. Entladen eines Graphit/Metalloxid-Modells versus Laden/Separatorbrücke verändert Betriebsrichtung und Fehlerursache. Modellbauteile und Ausgangsbelegung sind Hilfe; Transport, Kurzschlussfolgerung und Energiezufuhr müssen eigenständig erklärt werden. Keine Gleichung einer unbenannten Akkuchemie und kein manipulierter realer Akku werden gefordert. |

Gesamt der P-Inhaltsprüfung: **9 PASS_CANDIDATE_ONLY, 4 HOLD**. Bei D sind von diesen neun P-Pass-Kandidaten nur sieben Ziele `keep`; die zwei P-Pass/D-revise-Fälle bleiben bis zur gesonderten Integration/Neubindung offen. Alle essentiellen IDs wurden auf eine inhaltliche Verständnisforderung geprüft. Die vorhandenen `minimumIndependentDemonstrations: 2` dürfen im Coach später nicht als starre Zahl zusätzlicher Aufgaben oder automatisches Mastery-Urteil ausgelegt werden: echte unabhängige Teilbelege können innerhalb eines reichhaltigen Falls liegen. Hilfe-/Bildexposition muss später pro tatsächlicher Leistung bekannt sein; ein Profil behauptet noch keine solche Lernendenhistorie.

## Gezielte Validierung

Der vorhandene Kampagnenvalidator wurde ausschließlich für Round A mit eigenem Bundle/Input/Campaign/Batch-/Results-Verzeichnis ausgeführt:

`npm --prefix app run validate:goal-description-review-campaign -- --bundle .../round-a/review-bundle-manifest.json --input .../round-a/description-review-input.json --campaign .../round-a/description-review-campaign.json --batches-dir .../round-a/batches --results-dir .../round-a/results`

Ergebnis: `Goal-description review campaign results valid: 13` (Exit 0). Das bestätigt Schema, Reihenfolge und Bindungen, nicht die fachliche Freigabe der offenen Befunde. Kein vollständiger QS-/Build-/CI-Lauf, Commit, Registry-Schreibzugriff oder P-Profiländerung wurde durchgeführt.

## Gezielter P-Nachfolger — ausschließlich Brennstoffzelle

- Geprüft am `2026-10-04T22:53:20Z`, nach Abschluss der ursprünglichen 13-Ziel-P-Prüfung.
- Nachfolgerdatei: `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy8-reviewed-p-v2/positive-evidence.candidates.json`.
- Nachgerechneter Dateidigest: `sha256:2cee08bad9ccec861b3d83df5c751691f15197ff60e2e8a57bc364fd61f5e0ce`.
- Ausschließlich geprüftes Ziel: `b759d50d-0e82-5b10-89a2-fe5271106e50`.
- Innerprofil-Digest (Python JSON, `ensure_ascii=False`, sortierte Schlüssel, kompakte Separatoren): `sha256:c08122435615595674c07e94ef1a51ae0a0bf01ba70cc2c926e6613e2a1c292d`.
- Ergebnis des gezielten Nachfolgers: **PASS_CANDIDATE_ONLY**.

Der konkrete ursprüngliche Scopebefund ist behoben. Essentielles Verständnis und observable performance beanspruchen nun Zellreaktion, getrennte Ladungswege und die Rolle von zugeführtem Wasserstoff/Tank/Zelle. Elektrolysechemie und Akkuvergleich sind keine Pflichtleistung mehr. Im ersten Fall werden Halbgleichungen vorgegeben; diese Hilfe ist ausdrücklich als Grenze der ungelenkten Reaktionsformulierung ausgewiesen.

Der neue zweite Fall prüft das PEM-Zellprinzip unabhängig: Sauerstoff links und Wasserstoff rechts ändern die räumliche Darstellung; der Lernende muss Elektroden- und Gesamtreaktion mit Atom-/Ladungserhaltung selbst darstellen, den äußeren Elektronenfluss von rechts nach links herleiten und die Wirkungen von blockiertem H+-Transport sowie unterbrochener H2-Zufuhr erklären. Der blockierte innere Ladungsweg ist eine fachlich wirksame Variation, kein Zahlentausch. „Kein dauerhafter Außenstrom“ vermeidet die falsche Behauptung, dass überhaupt kein kurzer Ladungsausgleich auftreten könnte. Stoffzufuhr und Energieträger-/Wandlerrolle decken dieselbe aktuelle Kompetenz; keine neue Speicherchemie wird geprüft. DE/EN sind semantisch äquivalent, passend zum vereinfachten BY-Jahrgang-10-/HE-E-Niveau.

Die sieben anderen Nachfolgerprofile wurden nicht inhaltlich erneut geprüft. Der ursprüngliche Brennstoffzellen-HOLD bleibt als Befund zur ursprünglichen P-Datei nachvollziehbar; der PASS gilt allein dem genannten Nachfolgerdigest. D-Records/RunManifest, Graph und ursprüngliche P-Datei wurden dafür nicht geändert. Diese gezielte Inhaltsprüfung ist weiterhin eine AI-Kandidatenprüfung und keine registrierte oder menschliche Freigabe.

## Eng begrenzte Präzisierung v3 — Wasserstoff als begrenzendes Edukt

- Geprüft am `2026-10-04T22:55:46Z`.
- Nachfolger: `curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy8-reviewed-p-v3/positive-evidence.candidates.json`.
- Nachgerechneter Dateidigest: `sha256:e5d2410f744100f4a16066e24a83503769159e2dda8b9287808c978a866c0554`.
- Innerprofil-Digest für `b759d50d-0e82-5b10-89a2-fe5271106e50`, mit derselben sortierten kompakten JSON-Serialisierung wie oben: `sha256:ef77c46b57f4237f50a6a839427dce9a9640d5fc612b7492713db46088cf8d3d`.
- Ergebnis: **PASS_CANDIDATE_ONLY** für den eng begrenzt geprüften v3-Nachfolger.

Der Vergleich mit dem geprüften v2-Stand findet im Brennstoffzellen-Innerprofil exakt zwei geänderte Strings: `applicationCaseBriefs[1].expectedPerformanceDe` und `expectedPerformanceEn`. Beide sagen jetzt ausdrücklich, dass nach unterbrochener H2-Zufuhr die Umsetzung endet, sobald der verbliebene Wasserstoff verbraucht ist; überschüssiger oder weiter zugeführter Sauerstoff muss nicht erschöpft sein. Das ist für den angegebenen Ausfallfall chemisch korrekt und DE/EN-äquivalent. Die Reaktionsbilanz und sämtliche übrigen Beurteilungsanforderungen bleiben unverändert.

Nach Entfernen allein dieser beiden Strings sind die verbleibenden Brennstoffzellen-Profildaten in der genannten sortierten JSON-Serialisierung byteidentisch zu v2. Ebenso sind alle sieben übrigen Innerprofile byteidentisch in derselben Serialisierung; Zielreihenfolge und acht Ziel-IDs stimmen überein. Dies ist eine Gleichheitsprüfung, keine erneute Inhaltsprüfung unveränderter Ziele. Damit kann die zuvor belegte jeweilige Inhaltsbewertung auf unveränderte Profile übertragen werden. Der PASS bleibt eine Kandidatenbewertung; D-Records/Manifest, Graph, originale P-Datei und Registry wurden nicht geändert.
