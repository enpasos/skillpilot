# HE Mathematik Sek II: K3-Prozessquelle (unregistrierter Kandidat)

Stand: 27. September 2026. Dies ist eine **separate, nichtkanonische Source-Extraction zur fachlichen Prüfung**, keine neue Landschaft, kein freigegebenes Mapping und keine M7-Freigabe. Sie setzt den [K3-Quellenarchitektur-Vorschlag](../../../../../../../../../docs/qa-ci/math-he-k3-process-source-candidate-2026-09-27.md) technisch um, ohne die bestehende E/Q-Extraktion (25 Passagen, 316 Source-Ziele), den kanonischen Graphen, Mappings, das Publikationsprofil oder zentrale QA zu ändern.

## Quelle und Inhalt

Primärquelle ist das [amtliche HMKB-Kerncurriculum Mathematik gymnasiale Oberstufe, Ausgabe 2024](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), lokal unter `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`. Der geprüfte lokale PDF-SHA-256 ist `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`.

Die [Kandidaten-Extraktion](DE_HE_MATHEMATIK_SEKII_KC2024_PROCESS_K3.candidate.source-extraction.json) enthält die vollständige K3-Definition von **gedruckter S. 14** als Kontextpassage und die acht nummerierten Standards **K3.1–K3.8 von gedruckter S. 22** als zweite Passage und acht Source-Ziele. K3.1–K3.3 stehen im Anforderungsbereich I, K3.4–K3.6 in II und K3.7–K3.8 in III. Die K2.3-Zeile oberhalb des K3-Blocks gehört nicht dazu. Jedes Source-Ziel hat einen genauen Seiten-/Standardverweis. PDF-Rohtext und normalisierter Lesetext sind getrennt gespeichert; die Source-Ziel-Beschreibungen sind lesbare Ableitungen, keine neuen kanonischen Lernziele.

Der Generator `app/scripts/generateHeMathSekiiK3ProcessSourceExtraction.mjs` prüft PDF-Hash, Druckseitenmarker, Abschnittsgrenzen, vollständige Kennungen und Reihenfolge, amtlichen Wortlaut sowie AB-Zuordnungen fail-closed. Reproduktion und Negativtests:

```bash
node app/scripts/generateHeMathSekiiK3ProcessSourceExtraction.mjs --check
node --test app/scripts/generateHeMathSekiiK3ProcessSourceExtraction.test.mjs
```

Die Projektlizenz Apache-2.0 gilt für den eigenen Generator und Testcode. Die amtlichen HMKB-Quellentexte und PDF-Auszüge behalten ihre **Dritt-Rechte**; weder CC-BY-4.0 für eigene Lerninhalte noch Apache-2.0 für Code wird auf diese amtlichen Auszüge übertragen. Der lokale Kandidat behauptet keine allgemeine Weiterverbreitungserlaubnis für die Quelle. Bei Export oder Publikation sind die Rechte am amtlichen Auszug eigenständig zu prüfen.

## Offene Integrations- und Qualitätsgrenzen

`MAPPING-1` und `MAPPING-2` bezeichnen hier nur die reproduzierbare Extraktion; **`MAPPING-3` bleibt unvollständig**. Für alle acht Standards fehlen fachlich geprüfte Zuordnungen zu kanonischen Zielen. Die K3-Stelle stützt insbesondere `fde351a8-98b1-5d75-b4df-813beb2bbe3c` nicht vollständig: Sie nennt weder Ungleichungen noch die Bedeutung einzelner Terme im Kontext. Ein `exact`-Mapping oder automatisches Umschreiben der vorhandenen `K2.3`-Tags wäre unbegründet. K3.7 gehört zudem zu AB III, was bei einer etwaigen AB2-Zielbindung eigens zu beurteilen ist.

Für eine spätere Publikationsaufnahme verlangt der aktuelle Profilvertrag für die Mapping-Collection `reviewPath`, `sourceExtractionPath` und `legacyMappingPath` sowie abgestimmte `expectedCounts`; der Release-Validator erwartet für jedes Source-Ziel eine geprüfte `mapped`-Entscheidung mit existierendem kanonischem Ziel und `exact`/`partial`-Kante. Dieser Kandidat erfindet dafür keine Scheinzuordnung und ist im Profil **nicht registriert**. Erst nach fachlichem Mapping- und Rechte-Review wären Quellverifikation, Quellrationalen, Geltung, betroffene D/P/A/M/V-Bindungen und Status neu zu prüfen. Acht extrahierte Source-Ziele sind **kein** Zuwachs des kanonischen `curricularAtomic`-Nenners und kein strenger M7-KEEP.
