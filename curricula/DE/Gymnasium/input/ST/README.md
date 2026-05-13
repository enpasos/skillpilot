# Sachsen-Anhalt (ST) - Gymnasium Curricula

## Mathematik
### Sekundarstufe I (Klassen 5-10)
- **Archivierter Fachlehrplan Mathematik Gymnasium/Berufliches Gymnasium (Stand: 01.07.2019)**:
  - archived file: `curricula/DE/Gymnasium/input/ST/Mathematik_FLP_Gym_01_07_2019.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung/Mathematik_FLP_Gym_01_07_2019.pdf`
  - official overview: `https://lisa.sachsen-anhalt.de/unterricht/lehrplaene`
  - first source snapshot: `curricula/DE/Gymnasium/input/ST/lower-secondary/source-json/DE_SAN_S_GYM_1_MATHEMATIK.de.json.snapshot`

### Sekundarstufe II (Klassen 11-12)
- **Archivierter Fachlehrplan Mathematik Gymnasium/Berufliches Gymnasium (gleiche offizielle PDF, Qualifikationsphase 11/12)**:
  - archived file: `curricula/DE/Gymnasium/input/ST/Mathematik_FLP_Gym_01_07_2019.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung/Mathematik_FLP_Gym_01_07_2019.pdf`
  - companion document: `curricula/DE/Gymnasium/input/ST/GSB_Gymnasium_010822_swd.pdf`
  - first source snapshot: `curricula/DE/Gymnasium/input/ST/upper-secondary/source-json/DE_SAN_S_GYM_2_MATHEMATIK.de.json.snapshot`

## Physik
### Sekundarstufe I und II (Klassen 5-12)
- **Archivierter Fachlehrplan Physik Gymnasium/Berufliches Gymnasium (Stand: 01.07.2019)**:
  - archived file: `curricula/DE/Gymnasium/input/ST/Physik_FLP_Gym_01_07_2019.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung/Physik_FLP_Gym_01_07_2019.pdf`
  - note: the archived official PDF covers Sek I and Sek II in one retained Physics source family, including Schuljahrgaenge `6`, `7/8`, `9`, `10 (Einfuehrungsphase)`, and `11/12 (Qualifikationsphase)`
- **Archivierter Anpassungsstand Physik Gymnasium/Berufliches Gymnasium (Stand: 01.08.2022)**:
  - archived file: `curricula/DE/Gymnasium/input/ST/FLP_Physik_Gym_01082022_swd.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung_2022/FLP_Physik_Gym_01082022_swd.pdf`
- **Offizielle Lehrplan-Uebersicht**:
  - `https://lisa.sachsen-anhalt.de/unterricht/lehrplaene`

### Physik-Naechste Schritte
- die archivierte Sachsen-Anhalt-Physikquelle jetzt als aktive retained Source-Lanes mit source-backed Snapshots in
  - `lower-secondary/source-json/DE_SAN_S_GYM_1_PHYSIK.de.json.snapshot`
  - `upper-secondary/source-json/DE_SAN_S_GYM_2_PHYSIK.de.json.snapshot`
  stabil halten
- die Aktivierung ist dokumentiert in `curricula/DE/Gymnasium/provenance/st-physics-onboarding.md`
- vor jedem topic-spezifischen ST-Physik-Mapping erst die restlichen neu archivierten Bundeslaender ebenfalls auf `P2` bringen

## Chemie
### Sekundarstufe I und II (Klassen 7-12)
- **Archivierter Fachlehrplan Chemie Gymnasium (Stand: 01.08.2022)**:
  - archived file: `curricula/DE/Gymnasium/input/ST/FLP_Chemie_Gym_01082022_swd.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung_2022/FLP_Chemie_Gym_01082022_swd.pdf`
  - note: this is the current retained Chemistry source for the first source-extraction pass; it covers Schuljahrgaenge `7/8`, `9`, `10 (Einfuehrungsphase)`, and `11/12 (Qualifikationsphase)`.
- **Archivierter Fachlehrplan Chemie Gymnasium (Stand: 01.07.2019)**:
  - archived file: `curricula/DE/Gymnasium/input/ST/Chemie_FLP_Gym_01_07_2019.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung/Chemie_FLP_Gym_01_07_2019.pdf`
  - note: retained as the previous baseline for delta checks against the 2022 adaptation.
- **Offizielle Lehrplan-Uebersicht**:
  - `https://lisa.sachsen-anhalt.de/unterricht/lehrplaene`

### Chemie-Naechste Schritte
- die archivierte Sachsen-Anhalt-Chemiequelle jetzt als aktive retained Source-Lane mit source extractions stabil halten:
  - `lower-secondary/source-extraction/DE_ST_CHEMIE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json`
  - `upper-secondary/source-extraction/DE_ST_CHEMIE_SEKII_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json`
- die Aktivierung ist dokumentiert in `curricula/DE/Gymnasium/provenance/st-chemistry-onboarding.md`
- die reviewed Mapping-Dateien fuer die beiden Source-Extraction-IDs stabil halten:
  - `curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json`
  - `curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json`
- die kompilierte `DE-ST`-Applicability in der kanonischen Chemie-Landschaft stabil halten
- die source-backed Sachsen-Anhalt-Chemie-Composition-Views stabil halten:
  - `curricula/DE/Gymnasium/composition-views/chemie/de-st-gk.view.json`
  - `curricula/DE/Gymnasium/composition-views/chemie/de-st-lk.view.json`
- als naechstes die noch fehlenden Chemie-Source-Lanes fuer Mecklenburg-Vorpommern, Rheinland-Pfalz, Saarland, Sachsen und Thueringen onboarden

## Biologie
### Sekundarstufe I (Schuljahrgaenge 5/6-10)
- **Archivierter Fachlehrplan Biologie Gymnasium (Stand: 01.08.2022)**:
  - archived file: `curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf`
  - official source: `https://lisa.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LISA/Unterricht/Lehrplaene/Gym/Anpassung_2022/FLP_Biologie_Gym_01082022_swd.pdf`
  - official overview: `https://lisa.sachsen-anhalt.de/unterricht/lehrplaene`
  - source extraction: `curricula/DE/Gymnasium/input/ST/lower-secondary/source-extraction/DE_ST_BIOLOGIE_SEKI_FACHLEHRPLAN_GYMNASIUM_2022.source-extraction.json`
  - reviewed mapping: `curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_biology_lower_secondary_source_extraction_to_canonical_biology.review.json`
  - note: this retained Biology source covers Schuljahrgaenge `5/6`, `7/8`, `9`, and `10 (Einfuehrungsphase)`; the first lower-secondary source-extraction pass maps the official competence areas onto existing canonical Biology atomics.
