# Niedersachsen: begrenzte Quellen- und Kompetenzerhaltung

**Inaktiver Autorenkandidat, 5. Oktober 2026. Kein fachlicher Abschluss wird gezählt.**

## Tatsächlich geprüfte Anforderungen

Die lokale amtliche NI-Ausgabe wurde auf den gedruckten Seiten 87–90 gelesen; die Tabellen auf 88/89 wurden zusätzlich als Bilder geprüft. Die amtliche PDF wurde auch live geöffnet. Ihr gesamter Text wurde nicht als neues Prüfartefakt kopiert. Retained-PDF-Hash, genaue Fundstellen und Grenzen stehen in `source-audit.receipt.json`.

| Anforderung | Tatsächlicher Umfang | Erhaltungskandidat |
|---|---|---|
| FW7-001/002, S.89 | Ende Klasse 6: Individualität/Variation innerhalb einer Art und ungerichtete Unterschiede zwischen Generationen | **359e6313-cd86-54d1-bee5-8e680101dc32**, neues beobachtbares Variationskonzept |
| FW7-003, S.89 | Ende Klasse 10: Mutation/Rekombination ausdrücklich ohne Molekulargenetik | bestehendes **9f73b963**, kausal und hinsichtlich der Voraussetzung korrigiert |
| FW7-012, S.90 | Ende Klasse 10: Zusammenwirken von Mutation, Rekombination und Selektion | dasselbe korrigierte **9f73b963**; kein neues Doppelziel |
| FW6-010/011, S.88 | Ende Klasse 10: Gene als Chromosomenabschnitte; Genprodukte/Merkmale ohne Molekulargenetik | **0263fb84-33b1-52a3-a47e-dad56be7c9bc**, neues einfaches Genwirkungsmodell |

Die Tabellenzuordnung ist relevant: Die gemeinsame alte Kennzeichnung `5/6–9/10` belegt diese unterschiedlichen Altersanforderungen nicht. Nur die sechs benannten Quellenzellen werden hier korrigiert. Das fehlende Molekulargenetik-Verbot in FW7-003 wird im Wortlaut wiederhergestellt. FW6-010/011 stammen von Seite 88; die bisherige Angabe 87 ist falsch. FW7-012 steht auf Seite 90.

## Konkrete Korrekturen

- **9f73b963:** Mutation/Rekombination erzeugen Varianten beziehungsweise neue Kombinationen; Selektion wirkt auf vorhandene Variation. Die bisherige Formulierung, Selektion sei eine Ursache ihrer Entstehung, ist fachlich falsch. Als Voraussetzung ersetzt einfache Mitose/Meiose `1d2b1038` die molekulare Mutationsklassifikation `ffef`. Dies beweist keine Klasse-6-Kompetenz.
- **Klasse 6:** Artenvielfalt/Artensterben `5f39`, Kennzeichen des Lebens `55bd`, Sukzession `02ca` und das evolutionsgenetische `9f` sind keine passende Beschreibung individueller Nachkommenvariation. Das neue Ziel fordert Beobachtung, Vergleich und eine nichtzielgerichtete Einordnung, weder Meiose noch Mutationen.
- **Klasse 10:** DNA-Struktur `0daa`, vier Proteinstrukturebenen `28850`, Enzymkatalyse `0dbe` und dominant/rezessive Erbgänge `b8fc` ersetzen nicht das verlangte einfache Gen→Genprodukt→Merkmal-Modell. Der neue Kandidat benötigt Zellverständnis, keine DNA-Sequenz und keine Transkription/Translation.
- Die ungeeigneten Mappingzeilen werden durch genau benannte passende Teilbindungen ersetzt. Je zwei benachbarte Quellenzellen bilden die dokumentierte Union für jedes vollständige vorgeschlagene Ziel. Keine einzelne `partial`-Zeile wird als Vollbeleg ausgegeben.

Aus den sechs geänderten Quellenzellen folgt für die NI-Quellensicht konkret: `0daa`, `ffef` und die hier nicht belegte Artenvielfalt/Sukzession `02ca` entfallen; die zwei neuen Atome kommen hinzu. Die auf Mapping-Atome begrenzte Kandidatenmenge geht damit von 136 auf 135 Einträge. Das ist eine Quellen-/Sichtkorrektur, kein strenger Abschluss. Die zusätzliche offene Replikationsquellen-Entscheidung ist in dieser Zahl noch nicht enthalten.

Die neuen stabilen UUIDv5-ID-Vorschläge einschließlich Namespace und vollständigen Seeds stehen in `canonical.delta.candidates.json`. Die bestehenden IDs bleiben erhalten. Beide neuen Atome erhalten eine direkte NI-Bindung und die vorhandene Bindungsgrenze gegen unbelegte breite Quellenvererbung; ihre fachlich passenden kanonischen Eltern bleiben erhalten. Der Kandidatencheck prüft mit dem echten `sourceAtlasDescendants`-Helfer, dass direkte Bindungen funktionieren und Wurzelbindungen die neuen Ziele nicht erfassen.

## Dateien und Prüfstand

- `current-bindings.snapshot.json`: genaue aktuelle Vorwerte der betroffenen Quellen, Mappingzeilen und kanonischen Ziele.
- `source-extraction.delta.candidates.json`: sechs versionierte Extraktionsänderungen mit Vor-/Nachwerten und getrennten Klassenstufen.
- `mapping.delta.candidates.json`: genaue Mapping-/Entscheidungsdeltas, Teilbindungen und Quellenunionen. Alte Prüfdatierungen werden nicht zu neuen Fachfreigaben umgedeutet.
- `canonical.delta.candidates.json`: zwei neue Ziele, minimale 9f-Korrektur und zwei `contains`-Ergänzungen.
- `positive-evidence.candidates.json`: drei vollständige enge P-v2-Innenprofile mit insgesamt sechs frischen DE/EN-Fällen; reine Autorenkandidaten, keine aktiven Nachweise.
- `semantic-memory.candidates.json`: begründete A/M-Vorschläge; keine aktuellen A/M-Freigaben und keine Kartenänderung.
- `image-prompts.candidates.json`: drei begrenzte Motive, PNG/etwa16:9, klarer Comicstil, tatsächliche 360-/680-Pixel-Sichtprüfung nach einer späteren Erzeugung. Noch keine Bilder oder V-Freigaben.
- `view-frontier.delta.candidates.json`: genaue betroffene Sichtzeilen, Klassenstufen, aktuelle abhängige Zielkontexte und vollständige vorgeschlagene Voraussetzungsketten einschließlich Elternvererbung.
- `candidate-check.receipt.json`: tatsächliche Profil-Schema-, Vorwert-, Mappingkonsistenz-, DAG- und Vererbungsgrenzenprüfung. Sie ersetzt keine unabhängige fachliche D/P-Prüfung und keine Prüfung einer aktuellen Laufzeitsicht.

## Zusätzlich direkt gefundene Quellenschwäche

`coupled-replication-source-finding.json` hält eine weitere tatsächlich gelesene Schwäche separat offen: **FW6-003** wurde aus Einleitungstext als selbstständiger Replikations-Tabellenpunkt erzeugt. Ein solcher Punkt fehlt in der Tabelle; derselbe Einleitungstext verlegt DNA-Bau und identische Replikation ausdrücklich in die Sekundarstufe II. Seine versionierte Stilllegung benötigt eine eigene begründete Entscheidung, keinen historischen Neustart. Das tatsächliche Mitoseziel **FW6-004** bleibt erhalten.

Auch seine aktuelle Bindung an das molekulare Replikationsziel `e70` ist als Molekulargenetik-Beleg ungeeignet. Die vorhandene Beschreibung `1d` unterstützt Mitose/Meiose nur teilweise und bestätigt hier noch nicht die ganze verlangte Begründung der Erbgleichheit. Diese Restanforderung wird ausdrücklich offen ausgewiesen; die bloße Entfernung alter Ziele wird nicht als vollständige Quellenerhaltung gezählt. Das kanonische Replikationsziel und belegte Anforderungen anderer Länder werden nicht entfernt.

## Vor einer Integration

Die Kandidaten benötigen zwei unabhängige fachliche Beschreibungsprüfungen und eine gezielte Quellen-/P-/A-/M-Prüfung. Die aktuelle Sicht und Frontier müssen die Klassen-6-Route ohne Klasse-10- oder Molekulargenetik-Hürde sowie die Klasse-10-Route mit ihren echten Voraussetzungen zeigen. Eine nach Bundesland und SekI eingeschränkte Quellenliste allein beweist keine jahrgangsbezogene Laufzeitsicht. Dieses Paket schlägt keine Runtime-Änderung vor.

Historische Quellen, Extraktionen, Mappings, Reviews, Ledger und Bilder bleiben unverändert. Keine Registry-, QA-, Karten-, Sicht- oder kanonische Änderung wurde aktiviert. **Neue fachliche Abschlüsse: 0; wiederhergestellte strenge Abschlüsse: 0.**

Eigene Zieltexte, Aufgabenprofile und didaktische Motive: CC-BY-4.0. Dieses Entwicklerdokument und die Autoren-/Prüfskripte: Apache-2.0. Rechte der amtlichen Drittquellen bleiben separat. Maschinelle Kandidaten sind keine menschliche Freigabe, keine rechtliche Freigabe und keine Erprobung.
