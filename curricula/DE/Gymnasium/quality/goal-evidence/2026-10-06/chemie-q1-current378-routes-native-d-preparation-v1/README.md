# Technische Vorbereitung der aktuellen Chemie-D-Prüfung: final-v4

Dieses inaktive Paket bereitet die native unabhängige Beschreibungsprüfung vor. Es enthält keine fachliche D/P/A/M/V-Entscheidung, keine aktive Curriculumänderung und keine menschliche Freigabe.

## Tatsächliche Grundlage

Die 407 Dateien des überprüften Vorgängers, 35 Dateien des Routenautors, fünf Kontroll-v2-Dateien, drei Scope-v3-Dateien und fünf final-v4-Dateien wurden gegen ihre bestehenden Freezes geprüft. In einer neuen physischen Isolation wurden zunächst die tatsächlichen aktuellen 376 Ziele gebaut, danach ausschließlich dort die 40 exakten Vorgänger-Writes und neun Löschungen sowie die additiven Autorenstände übernommen. Native Werkzeuge, Compiler, Schemas und Ignore-Regeln sind unverändert. Die alte Hardlink-Isolation wurde nur gelesen.

Die wenigen notwendigen Klassifikationsbindungen wurden einzeln dokumentiert: eine für den Kontroll-v2-Aufgabenteil, eine für die Scope-v3-Vererbungsgrenze und fünf für den Routen-/Aufgabenstand v4. Diese technischen Aktualisierungen erzeugen keine fachliche Zustimmung. Die erste Vermutung, die Vererbungsgrenze brauche keine Bindungsaktualisierung, wurde durch den tatsächlichen nativen Fehler widerlegt und ausdrücklich zurückgenommen.

## Aktuelle Prüfunterlagen

Die drei Verzeichnisse `native-current-d-batches/batch-001`, `batch-002` und `batch-003` enthalten jeweils ein natives PDF/HTML, Modell, A/B-Kampagnen, tatsächliche Eingaben, Kriterien und JSONL-Schemata. Alle sechs prepare/check-Schritte sind terminal erfolgreich. Umfang: 20, 20 und 13 Ziele; physische PDF-Seiten: 22, 22 und 15, jeweils einschließlich zwei Vorsatzseiten.

Die genaue Union ist 45 veränderte Seiten bisheriger 104 Strict-Ziele plus acht weitere Anker aus dem früheren Zehnerheft. Zwei der zehn Anker liegen bereits in den 45. Grundlage der 45: 34 Routenänderungen plus 19 frühere Änderungen minus acht Überschneidungen. 59 weitere bisherige Strict-Gesamtseiten sind unverändert. Alle 104 vollständigen eigenen kanonischen Fachziele bleiben exakt.

`old407-to-current-v4.actual-wholepage-binding-delta-and-53-reconciliation.json` und die zugehörige CSV unterscheiden ausdrücklich die früheren Gesamtseiten, aktuellen Gesamtseiten und aktuellen Teilheftseiten. Von diesen 53 Gesamtseiten ändern sich gegenüber dem bereits 378 Ziele umfassenden 407er Vorgänger 42; die übrigen elf werden wegen der vollständigen aktuellen Union ebenfalls geprüft. Ein Teilheft hat eigene Seitenzahlen und verlagert Verweise nach außen; seine Bindung darf nicht mit einer Gesamtbuchbindung gleichgesetzt werden. Keine Supersession- oder Registry-Datei wurde geschrieben.

## Quellen und Geltung

Der finale native Atlas umfasst 359 Ziele bei 378 kanonischen Fachzielen, 48 Quellenansichten und 496 noch ungelösten Quellenentscheidungen. Er wurde im frischen Isolat erzeugt und geprüft. Das aktuelle ursprüngliche 376er Quellensystem wurde zusätzlich ausschließlich lesend nativ geprüft: 358 Atlasziele und dieselben 48 Quellenansichten. Die drei ursprünglichen BY-Quellenansichten bleiben vollständig bytegenau: SekI 91, GK 111, LK 142 Ziele.

Die neue Paraben-Vererbungsgrenze entfernt den allgemeinen BY-Mapping-Einlauf als Quellenbeleg. V3 allein ließ BY über drei allgemeine Aufgaben bestehen; der tatsächliche Fehler blieb dokumentiert. Erst v4 entfernt daraus ausschließlich das neue HE-Paraben-Ziel. Danach sind Paraben-Ziel und neue Aufgabe, die zwei quantitativen Ziele, ihr fachlicher Cluster und ihre neue Aufgabe nativ HE-only. Gegenüber v3 fallen aus den rohen BY-Zielmengen genau die zwei neuen Paraben-Ziel-/Aufgaben-IDs heraus. Assessment-requires ist Geltungsevidenz und kein Quellenbeleg.

Alle ursprünglichen 474 kanonischen IDs bleiben erhalten. Das ursprünglich atomare quantitative Sammelziel `d3cd250f-5221-589d-aa1c-44a4692d1acb` bleibt als fachlicher Cluster für die zwei getrennten HE-Teilkompetenzen erhalten. Die Zahl 376 bezeichnet deshalb keine unverändert atomar gebliebenen 376 IDs. Dieser Cluster war kein Ziel der ursprünglichen drei BY-Quellenansichten. Seit dem Kontroll-v2-Stand bleiben alle Mapping-, Extraktions-, Originalquellen- und Policy-Eingaben exakt; nur Canonical und Klassifikationsledger ändern ihre Bindungen.

Die verbleibende native APV-203-Warnung betrifft ausschließlich die neue Aufgabe `4cb74d76-99f1-5264-b1e3-448cda47b005`: Rohfeld `applicability.jurisdiction` noch BY+HE, aus requires tatsächlich HE-only. Der Parent bereitet hierfür einen eigenen additiven v5-Metadatenstand vor und prüft die Gleichheit der 53 vorbereiteten Eingaben. Die v4-Prüfunterlagen bleiben unverändert.

Ein separat ausgeführter lesender Compilerlauf im Live-Repository nahm auch Mappingkopien aus historischen/inaktiven Qualitätsisolaten auf. Dieses tatsächliche Diagnoseartefakt bleibt erhalten, dient aber nicht als Quellenfreigabe. Die Quelleprüfung der ursprünglichen 376er Atlasprojektion verwendet den nativen expliziten Quellenatlas-Checker. Die frühere Feldbezeichnung `directSourceEvidence` in Diagnosehelfern bezeichnet nur native Mapping-/Provenance-Evidence; sie beweist weder Direktheit noch vollständige fachliche Deckung. Im Atlas bleiben direkte/inherited und partial/whole Aussagen getrennt.

## Portabilität und Freeze

`native-d-review-final-v4.portable.zip` enthält die drei unveränderten nativen Prüfunterlagen, Konfigurationen, Bindungstabellen und die 53 erforderlichen Bilddateien. In ein eigenes leeres Verzeichnis entpacken. Die PDFs sind eigenständig; für HTML kann das entpackte Verzeichnis statisch bereitgestellt werden, damit `/assets/...` auf die beigefügten Bilder zeigt. Es wurden keine amtlichen Original-PDFs in dieses Archiv aufgenommen. Dateien und ZIP sind mit SHA-256 gebunden.

Das technische Paket endet bei der Vorbereitung. Tatsächliche unabhängige A/B-D-Reviews, Registry-/P-Bindung, zentrale Prüfung und eine etwaige Integration führt der Parent separat aus. Aktiver Stand bleibt 104/376; eine vorbereitete Seite oder maschinell geprüfte synthetische Aufgabe ist kein empirischer Lernnachweis und keine menschliche Freigabe.
