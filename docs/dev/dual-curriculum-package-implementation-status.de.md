# Duale Curriculum-Pakete: Umsetzungsstand

Stand: **19. November 2026**. Diese Seite trennt den aktuellen Repositoryvertrag vom abgeschlossenen technischen Nachweis des Juli-Kandidaten. Sie verleiht keinem Paket eine neue Veröffentlichungserlaubnis und behauptet keine neue CI-Abnahme.

## Aktuelle Verträge und Inhalte

| Bereich | Geprüfter Repositorystand |
| --- | --- |
| Paketverträge 1.0 und 1.1 | Frühere Verträge bleiben unverändert. Neue Felder dürfen nicht stillschweigend unter einem älteren Profil ausgeliefert werden. |
| Paketvertrag 1.2 | Trägt `learningUnitsV1` mit den bestehenden Einheiten-, Eigentums- und Reviewdefinitionen. Das bestätigt nicht die vollständige Laufzeitumsetzung des Zielmodells. |
| Gemeinsamer Kandidat 1.3 | Ergänzt Landes-/Dauer-Stufenpläne, `assessmentMaterialsV1` und Composition-Views im Sourceformat 1.2 einschließlich `childOrder.after` und `acquisitionPlacement`. Er bleibt ein unveröffentlichter Kandidat. |
| Mathematikansichten | 100 `*.view.json` im aktuellen Quellinventar. Die 88 Ansichten des eingefrorenen Juli-Pakets sind eine historische Paketmenge; `publicationBaseViewCount` bewahrt sie ausdrücklich. |
| Fachqualität | Mathematik steht im eingecheckten Qualitätsbericht vom 17. November auf **M7**. Das ist Maschinen-QS mit gebundenen Inhaltsreviews, keine Humanerprobung und keine Freigabe eines neuen Pakets. |
| Lizenzen und Lernzielbuch | Eigene Lerninhalte und die Lernzielbücher stehen unter **CC-BY-4.0**; #163 macht Lizenz und OER-Status sichtbar. Software und technische Verträge stehen unter Apache-2.0. Fremdrechte und Freigabeentscheidungen bleiben gesondert. |

Die [1.3-Vertragsdokumentation](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1.3/README.md) benennt Transport, CLI-Auswahl, getrennte Weitergabebelege und noch offene Integration. Das [Buildprofil](https://github.com/enpasos/skillpilot/blob/main/contracts/curriculum-package/v1.3/profiles/de-gymnasium-mathematik-release-model-v1.3.profile.json) bindet das aktuelle Inventar. [Qualitätsbericht](../qa-ci/status/curriculum-quality-status.json), [Lizenzabgrenzung](https://github.com/enpasos/skillpilot/blob/main/LICENSING.md) und [Management Summary](stage-plan-management-summary.md) sind die jeweiligen Nachweise.

Ein erfolgreich gebauter 1.3-JSON-Kandidat belegt weder einen gleichwertigen 1.3-FWU-OWL-Roundtrip noch einen aktivierten realen Landesplan, eine vollständige Anerkennungsruntime oder Produktionseinsatz. Die vorhandenen R1–R5-Verträge bleiben maßgeblich. Der [Einheitenabschluss-Vorschlag vom 19. November](../concept/skill-graph/unit-assessment-discussion-2026-11-19.de.md) ändert sie nicht automatisch.

## Erhaltener technischer Abschluss vom Juli

Der [vollständige unveränderte Juli-Nachweis](https://github.com/enpasos/skillpilot/blob/6bdf9474025b390d7dc6432ce756c19792d41590/docs/dev/dual-curriculum-package-implementation-status.de.md) hält P0–P2 und DPK-000 bis DPK-008d mit ihren damaligen Eingaben, Hashes und lokalen Prüfungen fest. Seine letzte abgeschlossene Lieferung rekonstruiert ein installierbares JSON-Runtime-Paket aus dem unabhängig validierten FWU-OWL-ZIP, ohne Original-JSON oder TypeScript-Vorwärtsexporter. Zwei hermetische Läufe erzeugten identische Outputs; unabhängige Validatoren prüften die Pakete und die gebundene Evidenz. Diese Ergebnisse werden nicht auf den heutigen Katalog übertragen.

| Historischer Meilenstein | Ergebnis und Grenze |
| --- | --- |
| P0 | Paket-, Profil- und Äquivalenzverträge sowie Mathematik-Conformance-Modell. |
| P1 | Hermetischer JSON-Package-Consumer mit Katalog-, Quellen-, Karten- und Ressourcenauflösung. |
| DPK-006c-c | Exakte View-/Offering-Auflösung der damaligen Package-Generation. Ein kollabierter Cluster ist dadurch kein fachlich anerkanntes Atom; diese historische Consumergrenze hebt die atomaren Voraussetzungen nicht auf. |
| P2 / DPK-008d | Core-first FWU-OWL, unabhängiger Validator und isolierter Reverse Compiler; 111 logische Artefakte und 757 bytegleiche Binärressourcen im damaligen Nachweis. |
| P3–P6 | Der Juli-Datensatz nennt sie `not_started`: gemeinsamer semantischer Dual-Release-Abschluss, Generalisierung, signierter Betrieb und vollständige Entkopplung. Diese Seite behauptet keine spätere vollständige Abnahme. |

## Nächste überprüfbare Lieferung

Die offenen Dual-Release-Gates müssen Original und Rückkompilation derselben aktuellen Vertragsversion gemeinsam binden: normalisierter `contentDigest`, unabhängiger Äquivalenzreport und zwei reproduzierbare Variantenpaare. Ein früherer DPK-Pass oder ein heutiges Fach-M7 ersetzt das nicht. Aktuelle Einheiten-/Stufenplanarbeit wird nach dem [Auftrag vom 15. November](stage-plan-units-handover-2026-11-15.md) geliefert und im Management Summary fortgeschrieben.

Öffentliche Pakete benötigen zusätzlich die [menschlichen Releaseprüfungen](../qa-ci/curriculum-package-human-review-gates.md), die [Readiness-Gates](../qa-ci/curriculum-package-readiness.md) und die jeweiligen Rechteentscheidungen. Auf Veröffentlichung, Deployment und Hostabnahme darf aus lokalen Paketprüfungen nicht geschlossen werden.
