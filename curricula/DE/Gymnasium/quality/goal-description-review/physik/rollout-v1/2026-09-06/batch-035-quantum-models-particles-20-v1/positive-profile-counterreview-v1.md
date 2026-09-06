# Physik B035 – fachliche Gegenprüfung der positiven V2-Profile

Stand: 6. September 2026. Hauptinstanz, unabhängig von der Profilautorenschaft.
Dies ist eine KI-Gegenprüfung, keine menschliche Abnahme.

Alle 20 ursprünglichen zweisprachigen Profilkörper einschließlich aller
40 konkreten Anwendungsfälle, erwarteten Leistungen, Variationsachsen und
Coverage-Angaben wurden vollständig gelesen. Die ursprüngliche Kandidatendatei
bleibt unverändert; ihr Digest und die begrenzten Änderungen am abgeleiteten
18er-Satz stehen in `positive-profile-counterreview-v1.json`.

## Konkrete Korrekturen und Abgrenzungen

- Beim Spektrallinienfall wurde „weißes Licht“ durch explizit breitbandige
  Strahlung mit 2, 3 und 5 eV ersetzt: 5 eV entspricht etwa 248 nm und liegt
  außerhalb des sichtbaren Bereichs. Das synthetische Energieniveauschema wird
  nicht als exaktes Wasserstoffspektrum ausgegeben.
- Das Messproblem-Profil ordnet Kollaps nun auch in Erwartungen und erstem
  Fall ausdrücklich modellabhängig ein. Keine Bewusstseinsursache oder
  ausnahmslose Zustandsänderung wird vorausgesetzt.
- Die deutschsprachige Bindungsenergie-Aufzählung verwendet Semikolons,
  damit Dezimalkommas keine unklaren Listen erzeugen. Ein elektronischer
  Energiegewinn allein beweist keine stabile Bindung; der zweite Fall
  berücksichtigt die Gesamtenergie einschließlich abstoßender Beiträge.
- Historische REVISE-/SPLIT-Befunde bleiben nachvollziehbar. Die fünf lokalen
  Reparaturen wurden nicht als Wiederverwendung alter Reviewurteile ausgegeben;
  die aktuelle Fassung erhielt zwei neue unabhängige Runden in B035r.
- Die beiden SPLIT-Fälle zu Energieniveaus/Pauli und
  Kastenenergien/Bereichswahrscheinlichkeit sind nicht im aktuellen
  18er-Profil-Set registriert und bleiben streng offen. Ein vorhandener
  Atomicity-Record wird nicht gegen den neuen fachlichen Befund ausgespielt.

## Unabhängige rechnerische Stichproben aller betroffenen Fallfamilien

Der ausgeführte Gegencheck bestätigte 41 numerische Assertions:
Wasserstoff- und wasserstoffähnliche Energien samt Übergängen,
Franck-Hertz-Abstand und Kontaktpotential, Moseley-Quadrate, Bragg-Bedingung
einschließlich unmöglicher Ordnung, normierte Sinusquadrat-Dichten für
n = 1 bis 6, Orbital-Teilwahrscheinlichkeiten, Quark-/Hadronladungen und die
beiden Bindungsenergiebeispiele. Diese 41 Checks sind nicht mit den separat
berichteten Autorenchecks zu einer angeblich disjunkten Gesamtzahl addiert.

Im heralded-photon-Fall ergeben 10 000 Heraldereignisse und je 0,25 bedingte
Einzelwahrscheinlichkeit unter dem gegebenen unabhängigen Vergleichsmodell
625 Doppelnachweise; 5/625 = 0,008. Untergrund, Mehrphotonenanteil und
Nachweiseffizienz bleiben Voraussetzungen der Interpretation. PET-Koinzidenz
weist nicht die Unteilbarkeit eines einzelnen Photons am Strahlteiler nach.

## Erhaltener Umfang und Autorität

Die Fälle variieren physikalisch relevante Strukturen statt nur Zahlen:
Präparation/Anregung, Darstellung, Randbedingungen, Messfolge, Potentialform,
Material versus Beschleunigungsspannung, geometrischer gegenüber elektronischem
STM-Kontrast sowie Rolle einer Wechselwirkung in verschiedenen Systemen.
Normalisierbare Zustände werden von der idealen ebenen Welle unterschieden;
Minimal-Unschärfe wird nicht für beliebige Zustände behauptet.

Die abgeleiteten 18 Profile wurden anschließend nativ auf aktuelle Semantik-,
Ziel-, Kriterien- und Visualisierungsbindungen materialisiert und validiert.
Sie behalten E1/G1, `needs_human_review` und `ai_candidate`. Quellenlücken,
Bildfreigaben, tatsächliche Lernendenleistung und Runtime-Mastery werden durch
Profilautorenschaft nicht genehmigt oder verändert.
