# Q4-Kurszuordnung: begrenzter Reparaturvorschlag

Stand: 6. November 2026. **Hypothese, nicht angewendet.** Der
[19er-Inhaltsreview](informatics-q4-terminal-independent-content-review-2026-11-06.md)
ist positiv; sein Scopebefund wird durch zwei eigenständige Prüfungsidentitäten
adressiert. Die genauen Guards und sieben Operationen stehen im
[Vorschlag](informatics-q4-course-scope-repair-proposal-2026-11-06.json), sämtliche
35 Targetvergleiche, die drei geänderten sichtbaren Bäume und Compilerbefunde im
[Hypothesenbeleg](informatics-q4-course-scope-repair-proof-2026-11-06.json).

Die ursprüngliche ID `a5e33d4d-f312-51d2-816b-e0b10dd1e701` behält ihre 19
Kompetenzen, Texte und eigene Ergebnisbedeutung. Ihre Tags werden auf LK,
Practice und Assessment begrenzt; examData erhält den separat geprüften
19/19-Kandidaten. Das neue GK-Assessment
`4a6fcdd7-bcec-5b66-9008-7267a5fcf636` heißt kanonisch **Schaltungen und
Wissensbasen vernetzt anwenden** und erhält ein eigenes explizites Ergebnis.
Die UUID ist reproduzierbar aus dem Informatik-Landscape und
`route-terminal-q4-gk-v1` abgeleitet; in den 593 tatsächlich gelesenen aktuellen
Katalogdateien mit 56171 Goalserialisierungen besteht keine UUID-Wertkollision.
Sie ist kein Alias der alten Prüfung.

Die sechs GK-Kompetenzen sind Binärsysteme, Schaltnetzentwurf, Fakten und Regeln,
Verwandtschaftsmodellierung, Addierer sowie wiederverwendbare Wissensbasen.
Das [eingefrorene GK-Metadatenartefakt](informatics-q4-gk-goal-metadata-proposal-2026-11-06.json)
enthält ihre exakten IDs und Originalhashes. Es hat bewusst keinen Rückverweis
auf den vollständigen Exam-/Scopebeleg; die separate Aufgabenprüfung kann es
ohne Hashzyklus binden. **Das endgültig geprüfte GK-examData muss vor Anwendung
noch in den vollständigen Goalpayload eingebunden werden.** Die vorliegende
Scopehypothese behauptet deshalb keine vollständige Schema-/Releasefreigabe.

Das neue Goal wird unmittelbar unter dem kanonischen Root eingeordnet. Als
Kind von „Übungen Q4“ würde es dessen beide unbeschränkten Clusteranforderungen
einschließlich der LK-Ziele erben. Stattdessen fordert es die zwei fachlichen
Grundlagen Addierer und Wissensbasis; deren vorhandene Zweige enthalten die
sechs GK-Kompetenzen. Die davor bestehenden Wege zum Q3-Terminal bleiben
unverändert. Deren weitergehende didaktische Angemessenheit wird durch diesen
Q4-Review ausdrücklich nicht freigegeben. Alte Ampel-/LK-Vorbereitung, andere
Assessments und sämtliche gewöhnlichen Goalpayloads bleiben unverändert.

In den HE-, BY- und kanonischen GK-Views wird jeweils unmittelbar neben der
vorhandenen Q4-Übungsgruppe ein expliziter `goalEntry` mit dem Anzeigetitel
„Q4 vernetzt anwenden (GK)“ ergänzt. Die kanonische Zielbedeutung und die
kursbezogene Darstellung bleiben damit getrennt; es entsteht kein neuer
Cluster und keine Einheit. Die vollständige Prüfung aller 19 authored Views
ergibt 35 Kurskombinationen:

| Kontexte | Ergebnis der Hypothese |
| --- | --- |
| HE-GK, BY-GK, kanonischer GK | Genau alte 19er-ID durch neue 6er-ID ersetzt; Targetzahlen 149, 149 und 182 bleiben gleich. |
| HE-LK, BY-LK, kanonischer LK | Gesamte Targetmengen und sichtbare Bäume unverändert; kein zusätzlicher GK-Zwang. |
| Übrige 29 Kombinationen einschließlich Sek I | Gesamte Targetmengen und sichtbare Bäume unverändert. |

Die übrigen Länder haben unterschiedliche Q4-Teilmengen und boten die alte
Prüfung nicht als Target an. Die neue Prüfung wird dort ebenfalls nicht
eingeführt. Ihre Applicability bleibt BY/HE. Der unveränderte Produktionscompiler
leitet genau diese Menge bereits aus vorhandenen Root-Mappings ab. Es wird
**kein neues Mapping, kein Override und keine Ableitung aus `requires`**
eingeführt; Letztere würde hier zusätzlich RP liefern. Vererbte Sichtbarkeit
ist kein unmittelbarer Quellennachweis für die neue Aufgabe.

Alle 19 Composition-Compilierungen haben vor und nach der Hypothese **null
Findings**. Die Applicability-Kompilierung lief unverändert über die aktuelle
Quelle und über ein isoliertes, nur lesbares Datei-Overlay: jeweils **null
Fehler, null Warnungen und null APV-203-Drifts**. Die kompilierten Mengen aller
282 bestehenden Ziele sind identisch. Beim neuen Goal kommt eine APV-202-
Diagnose für die bereits teilweise BY-Mappingbasis hinzu; sie bleibt offen
sichtbar und ist keine direkte Quellenfreigabe. Die Diagnosezahl steigt von
1132 auf 1133. Keine Warnungsbaseline wurde verändert.

Ausgeführt wurden die realen Produktionsfunktionen für Rollen, Filter,
Composition und sichtbare Frontendprojektion. Ein echter Backendservice- oder
Browserlauf wird dadurch nicht behauptet. Vor tatsächlicher Anwendung bleiben
der unabhängige GK-Inhaltsreview, Roots Zweitblick auf das zusammengesetzte
Paket und echte Graph-, Schema-, QA- und Reportprüfungen erforderlich.
Historische Mastery-, SRS-, Praxis- und Reviewdaten werden weder übertragen
noch neu etikettiert; es entsteht keine C(q)- oder Einheitenruntime.
