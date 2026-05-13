# Sachsen (SN) - Gymnasium Curricula

## Mathematik
### Sekundarstufe I (Klassen 5-10)
- **Lehrplan Mathematik Gymnasium (2019; weiter eingefuehrt bis Jahrgang 12 in 2023)**:
  - archived file: `curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-mathematik-sachsen-2019.pdf`
  - official source: `https://www.schulportal.sachsen.de/lplandb/lehrplan/file/121/galmOUYkLcTVJh8Sk6g9`
  - official overview: `https://www.schule.sachsen.de/lehrplaene/`
  - first source snapshot: `curricula/DE/Gymnasium/input/SN/lower-secondary/source-json/DE_SAC_S_GYM_1_MATHEMATIK.de.json.snapshot`

### Sekundarstufe II (Klassen 11-12)
- **Lehrplan Mathematik Gymnasium (same official PDF; Jahrgang 11 ab 2022, Jahrgang 12 ab 2023)**:
  - archived file: `curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-mathematik-sachsen-2019.pdf`
  - official source: `https://www.schulportal.sachsen.de/lplandb/lehrplan/file/121/galmOUYkLcTVJh8Sk6g9`
  - note: the public Sachsen Lehrplandatenbank currently exposes one shared Gymnasium mathematics PDF covering classes 5-10 and year levels 11/12
  - first source snapshot: `curricula/DE/Gymnasium/input/SN/upper-secondary/source-json/DE_SAC_S_GYM_2_MATHEMATIK.de.json.snapshot`

## Physik
### Sekundarstufe I und II
- **Lehrplan Physik Gymnasium (2004/2007/2009/2011/2019/2022/2025; Klassenstufen 6-10 und Jahrgangsstufen 11/12)**:
  - archived file: `curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf`
  - official source: `https://www.schulportal.sachsen.de/lplandb/lehrplan/file/125/vo3eXMDs8Ua4hqbRxPxG`
  - official overview: `https://www.schule.sachsen.de/lehrplaene/`
  - note: the public Sachsen Lehrplandatenbank currently exposes one shared Gymnasium physics PDF covering classes `6-10` and year levels `11/12`

### Physik-Naechste Schritte
- die archivierte saechsische Gymnasium-Physikquelle jetzt als aktive retained Source-Lanes mit source-backed Snapshots in
  - `lower-secondary/source-json/DE_SAC_S_GYM_1_PHYSIK.de.json.snapshot`
  - `upper-secondary/source-json/DE_SAC_S_GYM_2_PHYSIK.de.json.snapshot`
  stabil halten
- die Aktivierung ist dokumentiert in `curricula/DE/Gymnasium/provenance/sn-physics-onboarding.md`
- vor jedem topic-spezifischen SN-Physik-Mapping erst die restlichen neu archivierten Bundeslaender ebenfalls auf `P2` bringen

## Chemie

Archived official source input on `2026-05-11`:

- `lehrplan-gymnasium-chemie-sachsen-2025.pdf`
  - Lehrplan Gymnasium Chemie Sachsen `2004/2007/2009/2011/2019/2022/2025`
  - Klassenstufen `7-10` und Jahrgangsstufen `11/12`
  - direct PDF source: `https://www.schulportal.sachsen.de/lplandb/lehrplan/file/521/lnuYavMOfLLQRd2MlehG`
  - public Lehrplandatenbank overview: `https://www.schulportal.sachsen.de/lplandb/lehrplan/521`

Operational note:

- `DE-SN` now has a real archived lower-secondary plus upper-secondary Chemistry source bundle from the shared official Gymnasium PDF.
- The first retained lower-secondary and upper-secondary Chemistry source extractions now live at:
  - `curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_CHEMIE_SEKI_LEHRPLAN_GYMNASIUM_2025.source-extraction.json`
  - `curricula/DE/Gymnasium/input/SN/upper-secondary/source-extraction/DE_SN_CHEMIE_SEKII_LEHRPLAN_GYMNASIUM_2025.source-extraction.json`
- Sachsen Chemistry M3 status:
  - Sek I: `complete` (176 Source-Ziele)
  - Sek II: `complete` (302 Source-Ziele)
- Sachsen Chemistry composition views:
  - `active`
- The next meaningful step is keeping Sachsen Chemistry stable while Thueringen source onboarding continues.

## Biologie

Archived official source input on `2026-05-13`:

- `lehrplan-gymnasium-biologie-sachsen-2025.pdf`
  - Lehrplan Gymnasium Biologie Sachsen `2004/2007/2009/2011/2017/2019/2022/2025`
  - Klassenstufen `5-10` und Jahrgangsstufen `11/12`
  - direct PDF source: `https://www.schulportal.sachsen.de/lplandb/lehrplan/file/522/OF2Vfum2JVmFeuc2FOuf`
  - public Lehrplandatenbank overview: `https://www.schulportal.sachsen.de/lplandb/lehrplan/522`

Operational note:

- `DE-SN` now has a real archived lower-secondary Biology source bundle from the shared official Gymnasium PDF.
- The retained lower-secondary Biology source extraction now lives at:
  - `curricula/DE/Gymnasium/input/SN/lower-secondary/source-extraction/DE_SN_BIOLOGIE_SEKI_LEHRPLAN_GYMNASIUM_2025.source-extraction.json`
- Sachsen Biology M3 status:
  - Sek I: `complete` (10 Source-Ziele)
- The next meaningful Biology step is adding the remaining open states `DE-ST` and `DE-TH`.
