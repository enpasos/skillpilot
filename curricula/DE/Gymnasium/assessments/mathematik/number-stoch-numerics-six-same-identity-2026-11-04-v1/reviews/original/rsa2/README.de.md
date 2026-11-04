# Zwei vollständige Prüfungsformen für bestehende Zahlentheorie-Kompetenzen

Dieses private Autorenpaket enthält je eine ganze eigene DE/EN-Prüfungsform für
`97b03cce-6641-5ec9-a6d2-f31838e2dbb9` (RSA) und
`1c1754b7-2cd3-5635-824d-ce93f7b99514` (Faktorisierungsverfahren).
Es wartet auf echte unabhängige Inhalts- und A/M-Prüfung. Es enthält keine
behauptete Astra-Freigabe und schreibt keine Curriculum-, Git- oder Lernerdaten.

Der aktuelle Canon enthielt für diese beiden IDs noch keine Prüfungsform.
Eine gezielte Suche in den tatsächlichen Aufgabenfeldern der bestehenden
kanonischen Prüfungen fand auch keine passende ganze RSA-/Sieb-Aufgabe oder
bestehende bewertete Abdeckung einer der beiden IDs. `reuse-search.json`
zeichnet die Suche auf; historische Entwürfe und die statische Priorisierung
sind kein Abnahmebeleg.

Jeder ID-Ordner enthält Aufgabe, Musterlösung und Gesamtbewertung in DE/EN,
den gesamten ursprünglichen und vorgeschlagenen Zielvertrag sowie einen
vollständigen Alt/Neu-Vergleich. Die Vorschläge ergänzen ausschließlich
`nodeKind: exam` und `examData` mit `reviewStatus: draft`. Alle bisherigen
Attribute einschließlich Texte, Quellenbezug, LK, AB3, Applicability, Gewicht,
ID und `requires` bleiben unverändert. Bewertet ist ausschließlich die eigene
bestehende ID; keine Voraussetzung wird durch `coveredGoalIds` zusätzlich
abgedeckt. Jeder Vorschlag hat 20 BE, eine Bestehensgrenze von 15 BE und
fachlich begründete Gesamtpunktkappungen von 14 BE bei vollständig fehlenden
Kernhandlungen. Es bleibt bei genau einem binären Gesamtergebnis.

RSA verlangt Schlüsselbildung, asymmetrische Schlüsselrollen, tatsächliche
modulare Ver- und Entschlüsselung und eine plausible allgemeine
Korrektheitsbegründung. Mit p=11, q=17 und e=7 entstehen n=187 und d=23.
Die Nachrichten 20 und 11 zeigen einen teilerfremden und einen nicht
teilerfremden Fall. Die Begründung nach beiden Primmoduln behandelt Nullreste
und Nichtnullreste getrennt und verwendet danach CRT; eine nur auf Einheiten
anwendbare Euler-Kürzung wird nicht auf alle Nachrichten ausgedehnt.
Fermats Satz und CRT dürfen verwendet werden; ihre eigenständigen ganzen
Kompetenzen werden nicht zusätzlich bewertet.

Die Faktorisierungsform wählt ausdrücklich das im ursprünglichen Ziel als
Beispiel genannte quadratische Sieb. Die kleine Zahl 1649 und die Faktorbasis
{2,5} halten die Rechnung handhabbar. Die anspruchsvolle Methodenleistung
bleibt: wiederkehrende Teilbarkeitsstellen über Restklassen erklären,
glatte Beziehungen auswählen, Exponentenparitäten kombinieren, die
Quadratkongruenz begründen und nichttriviale Faktoren per ggT gewinnen.
Die beiden glatten Werte 32 und 200 sind jeweils keine Quadrate; ihr Produkt
wird erst durch die begründete Kombination zum Quadrat. Das Verfahren wird
nicht durch bloße Probedivision der Zielzahl ersetzt. Ein triviales
Quadratepaar mit nur den ggT-Werten 1 und N prüft die Verfahrensgrenze.
Eine andere vollständige Faktorzerlegungsmethode kann weiterhin Gegenstand
einer anderen Form derselben unveränderten allgemeinen Kompetenz sein.

Der amtliche [LehrplanPLUS, Mathematik 12 Vertiefungskurs, Modul 4](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft)
stützt die vorhandenen Gegenstände RSA und Faktorisierungsverfahren; das
quadratische Sieb wird dort als Methodenbeispiel genannt. Die Auswahl hier
ist ein Aufgabenentwurf zum bestehenden kanonischen Vertrag und fügt keine
amtliche Pflicht, Kurswahl oder Abdeckungsbehauptung hinzu. Der methodische
Abgleich mit [Eric Landquists Darstellung des quadratischen Siebs, §§3–4](https://www.fdi.ucm.es/profesor/m_alonso/Documentos/factorizacion/quadsieve.pdf)
betrifft glatte Beziehungen, Exponentenparitäten und ggT-Gewinn. Eigene
Zahlen, Aufgaben, Lösungen und Rubriken wurden neu verfasst; Laufzeit- oder
Sicherheitsaussagen dieser Darstellung werden nicht übernommen.

`whole-current-contracts-and-preparation.json` enthält beide ganzen aktuellen
Ziele und alle jeweils 25 vollständigen transitiven Vorbereitungsziele.
`current-four-registered-am-rows.json` enthält die vier tatsächlich aktuell
registrierten A/M-Zeilen samt Konfigurations- und Ledgerbindung. Beide
Memory-Entscheidungen sind derzeit `no_memory_needed`; es wird kein Deck
angelegt oder entfernt. Die neue Prüfungsform beseitigt die curriculare
A/M-Pflicht nicht. Die durch den neuen `nodeKind` geänderten Fingerprints
brauchen eine echte gezielte unabhängige Revalidierung und werden nicht als
mechanische Freigabe behandelt.

Die Vorlage für das Prüfungsformat sind die tatsächlich angenommenen
Analysis8-/Space4-Protokolle; deren Freigaben gelten nicht automatisch für
diese zwei neuen Formen. Dieses Paket beansprucht weder neue Source-/Scope-
Abnahme noch Native-/Producer-, M7-, CI-, Host- oder Menschenabnahme.
Die statischen 84-Scopes-/Routenwirkungszahlen werden nicht zu technischen
Abnahmeresultaten umgedeutet. Die Original-Quell- und Kurskennzeichnungen
bleiben erhalten. Die eigenständig verfassten Aufgaben, Lösungen und
Rubriken fallen als eigene Wissens-/Aufgabeninhalte unter CC-BY-4.0 gemäß
`LICENSING.md`; fremde Quellen werden dadurch nicht umgelizenziert.
