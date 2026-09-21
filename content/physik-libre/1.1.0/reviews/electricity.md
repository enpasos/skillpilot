# Physik Libre: Elektrostatik, Stromkreise, Elektromagnetismus

Stand: 2026-09-21. Eigenständiges KI-Zuordnungsreview; keine Anbieterfreigabe und keine Aussage vollständiger Material- oder Kompetenzabdeckung.

## Ergebnis

`electricity-materials.json` enthält **56 präzise Abschnittslinks zu 65 aktuellen curricularAtomic-Zielen**, verteilt auf **30 Seiten**. Je Ziel höchstens zwei Links. Alle Ziel-IDs gehören zur autoritativen Physik-Klassifikation. Offline-Paketschema und alle angegebenen Anker/Abschnittsüberschriften gegen den am selben Tag geladenen lokalen Provider-Snapshot geprüft.

Die expliziten Zuordnungsentscheidungen stehen in `electricity-decisions.mjs`; daraus wurden nur Format, Originalüberschriften und feste URLs mechanisch aufgebaut. Keine automatische Keyword-Zuordnung. Zielbeschreibung und verlinkter Abschnitt wurden jeweils fachlich verglichen. Bei teilweiser Unterstützung benennt die Rationale die verbleibende Lernarbeit ausdrücklich. Die Quelle ersetzt weder Verständnisprüfung noch Experiment noch menschliche QS. Keine vollständigen Providertexte in den Katalog übernehmen.

Abgedeckte Themen: Ladungserhaltung/Reibungselektrizität; Coulomb- und Dipolfelder; Potenzial; Strom- und Spannungsmessung; Kennlinien, spezifischer Widerstand und Schaltungen; Kondensator und Feldenergie; elektrische Leistung und Akkuangaben; Millikan-Ergebnis; Magnetfelder und Dipole; Lorentzkraft, Teilchenbahnen und Fadenstrahlrohr; Hall-Effekt und Massenspektrograph; Induktion und Selbstinduktion; Generator, Motor, Transformator und Gleichrichtung; Meißner-Effekt; LC-Schwingkreis; Maxwell-Überblick; Wechselstrombauteile/Filter; Rückkopplung, Dipol und elektromagnetisches Spektrum.

## Bewusste Lücken statt unpassender Verlinkung

| Ziel-ID | Entscheidung und Grund |
| --- | --- |
| `7ca44ba0-b77e-52bf-8562-f67b44767172` | Kein Einstieg über `electric-circuits#simple-circuit`: Die Beschreibung der leeren Batterie als ausgeglichener Ladungsunterschied und der Energielieferung als Bewegungsenergie der Elektronen kann ein falsches Batteriemodell festigen. |
| `69f8f59c-b0c3-5b0b-82db-834a0e655736` | Abbildungen von Schaltplänen sind vorhanden, aber kein eigenständiger geeigneter Abschnitt zum Übersetzen zwischen realem Aufbau und abstraktem Verbindungsplan. |
| `a5f652cc-e091-4c90-bec2-c357ae54fcf1` | Keine gebündelte, geeignete Darstellung aller vier Stromwirkungen; der Ørsted-Einstieg fordert einen direkt mit Batterie verbundenen Draht ohne klare Strombegrenzung und wird nicht als Schülerexperiment empfohlen. |
| `c156d2fb-0fe9-5f13-8baa-3e74d7da151e` | Der Gewitterabschnitt verallgemeinert sichere Zuflucht auf Bauwerke. Für ein Sicherheitslernziel nicht als umfassende Handlungshilfe zuordnen. |
| `e3bce51c-cfeb-4706-b95e-a22b76e7dd73` | Q/A erscheint beim Plattenfeld, aber die Flächenladungsdichte wird nicht sauber als eigene Größe eingeführt; Q wird dort zudem missverständlich Gesamtladung genannt. |
| `38e0ff49-f132-44c8-b17a-73dada5344db` | Die Quelle gibt das Plattenfeld ausdrücklich ohne Herleitung an; ein Herleitungsziel bekommt keinen Ergebnislink als vermeintlich passende Vollunterstützung. |
| `741774ef-15fc-4bcf-a370-e2c5cf4257d0` | Beschleunigungsenergie kommt im Fadenstrahlrohr vor, aber keine geeignete eigenständige Darstellung der elektrischen Bahnformen samt Anfangsrichtung. |
| `5fda8623-69e0-5503-9c6d-86d054a8cf91` | Keine passende Erklärung der Braunschen Röhre einschließlich Zeitbasis gefunden. |
| `09f2cdbd-64e0-55d2-ada7-1190f4fd50df` | Kondensator-Ladekurven vorhanden, aber hier keine explizite Prüfung eines Exponentialansatzes an DGL und Anfangsbedingung. |
| `a844895e-2cdc-4665-aad2-a49c62f11759` | `tuned-circuit-and-mechanical-oscillator` ordnet bei x ↔ Q fälschlich Federkonstante k direkt Kapazität C statt 1/C zu. Nicht verlinkt. |
| `a7255b83-336c-4d42-ba5c-bc2f6248ea36` | Die Eigenfrequenz wird aus Wechselstromwiderständen ermittelt, nicht mittels Lösung der LC-Differentialgleichung durch Ansatz. |
| `3857891b-d328-585b-9936-85c7aff122ee` | Die Diode-Seite zeigt eine Kennlinie, aber ihre Erklärung mit positivem/negativem Potenzialhügel ist fachlich irreführend; außerdem kein klarer strombegrenzter Kennlinienversuch. |
| `af50bb9a-fd7b-50f5-9698-48c4efe99032` | Keine geeignete Analyse von Arbeitspunkt, Kennlinien und unverzerrtem Verstärkungsbereich. |
| `c2af45aa-e3fc-5119-9159-c5a260b4135a` | Ein astabiler Multivibrator ist vorhanden, aber kein bistabiles Transistor-Flipflop. Nicht gleichsetzen. |
| `0dd1e39c-8557-5a4e-b467-caae964fff67` | Keine passende Untersuchung von Solarmodulen unter Reihen-/Parallelschaltung, Neigung und Beschattung. |
| `922f32ba-f214-5a82-be5c-1111aca51d4a` | Funkmodulation deckt keinen Audio-Licht-Übertragungsversuch ab. |
| `e19fccd7-6a35-5c9e-86e1-dcca76481e9c` | Ein EKG wird bei Bioelektrizität erwähnt; daraus folgt keine Unterstützung des Dipolmodells, seiner Messgrößen und Modellgrenzen. |
| `2825b528-00ee-52d0-870e-686890cb1195` | Keine physikalische Beurteilung von Nervenleitungs-Messverfahren. |
| `c2e0fc31-27a2-5727-9025-a824db9150d2` | Kein Axon-Ersatzschaltungsmodell. |
| `8cdef591-6ddb-5151-8c74-a80be0271079` | Keine Membran-/Axialwiderstands-Analyse im passiven Leitermodell. |
| `3aaac6ad-948e-502a-9d49-ce40db0f2ca3` | Keine explizite RC-Analogie des passiven Axonsegments; allgemeine Ladekurven wären als alleinige Zuordnung zu unspezifisch. |
| `8fbae050-c5c9-52b6-9983-2c366e9c8ade` | Keine saltatorische Signalleitung mit aktiver Regeneration und passiven Internodien. |
| `0b08aed8-3c0f-5b38-844c-1bb363abbf68` | Kein gemeinsames Modell biologischer und künstlicher neuronaler Verschaltungen. |

## Quellenkritische Begrenzungen

- Der gezielte Link auf leitende Oberflächen bewertet nicht die gesamte Nachbarseite: Die Formulierung zur Krümmung in `peak-field-density` kehrt den Zusammenhang sprachlich um; die Erdungsdarstellung in `faraday-cage` kann eine unnötige Erdungsvoraussetzung suggerieren. Daher keine Verlinkung dieser Abschnitte als Erklärung des Faraday-Käfigs.
- `superconductivity` nennt Cooper-Paare pauschal Spin 1. Stattdessen wird nur der eigenständig geeignete Meißner-Abschnitt empfohlen, begrenzt auf den Meißner-Zustand.
- `semiconductor` nennt pauschal etwa 3 eV Ablösearbeit; die mikroskopische Diode-/BJT-Erklärung ist problematisch. Der Transistorschalter erhält deshalb nur das funktionale Dämmerungsschaltungsbeispiel, ausdrücklich ohne damit das Halbleitermodell abzudecken.
- `capacitors#dielectric` vermischt Feldschwächung und festgehaltene Spannung und erklärt das Theremin verkürzt/falsch. Das Kondensatorziel bekommt deshalb nur die Luft-/Vakuum-Geometrie; Polarisation wird separat aus dem Polarisationseintrag unterstützt.
- `radiation-applications#microwave` und `#infrared` enthalten unpassende Frequenz-/Wellenlängenpaare. Die Spektrumszuordnung verwendet nur die grobe Einordnung im eigenständigen Übersichtsabschnitt, nicht diese Anwendungs-Unterabschnitte.
- Der Millikan-Link zielt auf die Ergebnis-/Quantisierungsdarstellung. Die weiter oben veröffentlichte Steig-/Fallformel ist nicht Gegenstand dieser Empfehlung oder einer Validierungsbehauptung.
- Die Spannungsquelle-/Potenzialseite enthält abseits der zugeordneten Abschnitte eine veraltete Aussage zum Pluspol amerikanischer Fahrzeuge; diese ist nicht als überprüfter Materialteil referenziert.
- Konkrete Sicherheitsanleitungen für Gewitter, Schutzleiter/RCD-Wartung oder Netzinstallation werden nicht als umfassende Lernzielabdeckung freigegeben. Der sichere Anlagenschutz-Abschnitt behandelt nur Überlastung/Kurzschluss.

Aus diesen Befunden folgt weder eine pauschale Anbieterabwertung noch eine Vollfreigabe der Website. Die Zuordnung ist abschnittsbezogen; unverlinkte Nachbartexte bleiben außerhalb des Reviewanspruchs. Falls dies auf Produktebene als zu schwache Trennung gilt, können die betroffenen Seiten zunächst vollständig zurückgestellt werden.
