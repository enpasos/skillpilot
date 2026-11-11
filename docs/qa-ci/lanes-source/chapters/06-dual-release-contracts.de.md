## Duale Curriculum-Release-Verträge {#sec:qal-dual-release}

`DPK-003` legt den Fail-Closed-Semantikvertrag für ein gekoppeltes Paar aus SkillPilot-JSON-Laufzeitpaket und Core-first-FWU-Ontologiepaket fest, ohne damit bereits ein Produktivpaket zu veröffentlichen.

### Verbindliche Vertragsinvarianten {#sec:qal-dual-invariants}

- **Lückenlose Feld-Registry:** Jedes Feld des Release-Modells muss exakt einem versionierten Registry-Eintrag entsprechen (Skalare, geordnete Listen, Mengen, Maps, Binärreferenzen, generierte nicht-semantische Felder). Unbekannte Felder blockieren das Ontologie-Release.
- **Explizite nullbasierte Ordnung in RDF:** Lernziele, direkte `contains`- und `requires`-Kanten, Ressourcenlinks, View-Kinder, Karten und Bewertungsschritte sind geordnet. RDF speichert eindeutige, lückenlose nullbasierte Positionen, da ungeordnete Core-Relationen die Autorenreihenfolge nicht rekonstruieren können.
- **Strikte Wertunterscheidung & Verbot breiter JSON-Container:** Fehlend, `null`, leer und Standardwert bleiben getrennt, sofern ein einzelner Registry-Eintrag nichts anderes festlegt. Bekannte curriculare Konzepte nutzen den FWU-Core; SkillPilot-Vokabular dient nur der Laufzeitsemantik und exakten Rückübersetzung. Kanonische JSON-Literale erfordern eine feldspezifische Core-Lücke, Granularität und Byte-Obergrenze; paket- oder landschaftsweite JSON-Träger sind verboten.
- **Pfadneutrale Binäridentität:** Binärressourcen gehen über stabile Ressourcen-ID, kanonische öffentliche Referenz, MIME-Typ, Byte-Länge und SHA-256 in den gemeinsamen Index ein; variantenspezifische ZIP-Pfade ändern `contentDigest` nicht.
- **Äquivalenzbericht & Signaturprojektion:** Ein bestandener Äquivalenzbericht bindet beide finalen ZIPs und Manifeste, Verträge, FWU-Core-IRI, Toolchain, Feldabdeckung, Rollen-Digests, Graph-/View-/Karten-/Asset-Vergleiche, isolierte Rückübersetzung, Validierung beider JSON-Pakete, hermetische Consumer-Läufe und Reproduzierbarkeit. Der externe Release-Index entfernt vor dem kanonischen Hashing den Signaturblock (keine Selbstreferenz); der `DPK-003`-Validator weist jeden `verified`- oder `stable`-Anspruch ab, bis `DPK-011` Signatur-, Identitäts- und Provenienzprüfungen ausführt (`staging` darf unsigniert bleiben).

### Ausführbares Gate und Abgrenzung {#sec:qal-dual-gate}

Ausführung vom Repository-Root (Teil der optionalen Ontologie-Lane in `./run_ci.sh owl`, `./run_ci.sh full` und `.github/workflows/owl-ci.yml`; erfordert `jsonschema==4.26.0`):

```bash
python3 -B scripts/validate_curriculum_dual_release_contracts.py
```

Der Validator weist doppelte JSON-Schlüssel, nicht-endliche Zahlen, ungültiges Unicode und RDF/XML-unsichere Steuerzeichen ab, prüft alle Schemata und Positiv-Fixtures, berechnet logische/binäre Records sowie den Gesamt-`contentDigest` neu und führt eine Mutationsmatrix aus (verlorene Ordnung, mehrdeutige Pfade, verwischte `missing`/`null`-Semantik, unzulässige JSON-Träger, gefälschte Digests, substituierte Berichte, nicht-isolierte Rekonstruktion, unbestätigte `stable`-Promotion).

:::warning{title="Synthetische Vertrags-Fixtures sind keine Curriculum-Evidenz"}
Die positiven Release- und Äquivalenzdateien unter `contracts/curriculum-package/v1/fixtures/dual-release/valid/` enthalten synthetische Hashes und Zähler ausschließlich zum Vertragstest und dürfen niemals als Curriculum-Nachweis veröffentlicht werden.
:::
