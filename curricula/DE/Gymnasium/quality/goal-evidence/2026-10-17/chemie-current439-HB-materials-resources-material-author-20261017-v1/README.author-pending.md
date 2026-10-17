# Materialien/Rohstoffe: abgeschlossener Autorenentwurf

Status: **AUTHOR pending**, E1/G1, `ai_candidate`, `needs_human_review`. Keine fachliche Selbstfreigabe, Quellenaktivierung, menschliche Erprobung oder M7-Aussage.

## Konkrete Ergebnisse

- `AUTHOR.whole-profile-successors.pending.json`: 14 ganze bestehende Profile mit `records[{goalId, profile, goalExact, currentGoalExact, ...}]`. Alle alten Erwartungen, Pflicht-IDs, Achsen und Fälle bleiben als exakte Präfixe erhalten. Alle sonstigen Coverage-Werte bleiben exakt. Neue Anforderungen und Fallbindungen sind pro Ziel benannt.
- `AUTHOR.two-new-whole-atoms.pending.json`: zwei vollständig deklarierte inaktive UUID5-Atome mit Goal/P/Source/Parent/prerequisite/SEM/M/Bildbedarf-Proposals: Klima `31cce65a-480a-5111-ab3c-da2feb3d4065`, BTL `abfa609d-9764-5bd8-999c-1d10a7eeac78`.
- `materials/`: zwölf vollständige eigene DE/EN-Fälle mit Angaben, Auftrag, Lösungserwartung, neuem Transfer und Rubrik. Die Fälle behandeln reale PLA-Untersuchung, Additive/Mikroplastik, drei Verwertungswege, Nanokomposite, Farbstoffgewinnung/Polyene, drei explizite Farbbegriffe, tatsächliche digitale Aromatenmodelle, historische/aktuelle Wirkstoffwirkung, Pflanzenölgewinnung/Generationen, echte Medienrecherche sowie Klima und BTL.
- Die fertigen vollständigen externen Fälle HB135 (Säure-/Basen-Recherche und Präsentation) und HB155 (Zuckergewinnung mit ökologischer/ökonomischer/sozialer Bewertung) sind bytegenau gebunden, ohne zweite Materialfassung. HB135 ist in beiden ganzen Profilen ac8b6c0f und 38e30bb9 verbindlich; HB155 im allein hier bearbeiteten 9f892457.
- `AUTHOR.source13-and-term11-proposals.pending.json`: konkrete Vorschläge für die 13 zugeteilten Quellenpflichten und elf Begriffe; tatsächliche Quellenkörper, Passagen und Geltung bleiben enthalten. Der Klimafall kann den sachlichen Inhalt des offenen Falls92 mittragen. Keine neue Quellenfreigabe.

## Drei notwendige ganze Goal-Nachfolger

`AUTHOR.three-existing-goal-scope-successors.pending.json` deklariert die drei absichtlichen Unterschiede gegenüber C54: 8721d943 ergänzt die energetische Abgrenzung; 0959eef2 die Gewinnung/Generationen; 3eb2a06c gesellschaftliche Bewertung und den HB-Kontext. Alte Texte, Pflichten und Bildbytes bleiben erhalten. Diese C-Proposals sind unabhängig fachlich und im geänderten Kontext zu prüfen. Der Root-Vorabcheck meldet deshalb diese drei C54-Unterschiede; sie sind keine behauptete Gleichheit.

## Prüfung und Grenzen

Der unveränderte Profil-Schemafragmentcheck besteht für alle 16 Profile. Die 14 alten Profile sind exakt additiv erhalten; der Root-Vorabcheck zeigt keine Profil-/Brief- oder Retentionsfehler. Alle sechs Eingangspins sind unverändert. Die SHA-Felder für ganze Objekte verwenden UTF-8, sortierte Schlüssel, kompakte JSON-Serialisierung ohne Schluss-LF.

Tatsächliche Versuche, digitale Handlungen, Recherche und Präsentation bleiben spätere reale Leistungen. Bereitgestellte Modellzahlen oder diese Erwartungstexte zählen nicht als solche Leistungen. Fehlende tatsächliche Proben, Zugänge, Quellen oder Zuhörer lassen die betreffende Handlung offen. PLA benötigt dokumentierte biobasierte Proben und örtliche Laborfreigabe. Die anderen Fälle verlangen keine gefährliche praktische Herstellung. Es werden keine zusätzlichen Aufgaben-/Versuchszahlen aus Quellenbeispielen abgeleitet; mehrstufiger eigenständiger Transfer innerhalb einer Aufgabe kann ausreichend sein.

Offizielle GK/LK- und Wahlthemen-Geltung bleibt erhalten; breitere SkillPilot-Zielaufnahme ist keine behauptete individuelle Themenwahl. Die drei Farbbegriffe werden ausdrücklich gebraucht und historisch fachlich qualifiziert. Klima unterscheidet Bestand und Absorption/Emission; BTL enthält Vergasung, Gasreinigung, FT und Gemischaufarbeitung mit korrekter Idealbilanz/LCA-Grenze. Es gibt keine neue Bildgenerierung; für die zwei neuen Atome ist echter Bildbedarf verzeichnet. Unabhängige Fach-/Quellen-/Graph-/Kontextprüfung und spätere technische Materialisierung sind offen.

Reale Primärlesungen einschließlich fehlgeschlagener direkter IUPAC-/Nobel-Aufrufe sind in `SOURCES.actual-primary-reading.json` ehrlich dokumentiert. Vorherige eigene FIRSTs und alle anderen Autoren-/Aktivdateien bleiben unverändert.
