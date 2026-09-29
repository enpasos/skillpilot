# Vektor- und Mittelwertziele: Quellen-/Scope-Korrektur, 29.09.2026

Diese begrenzte Änderung betrifft `b025df0c-994c-4807-9c5f-2d548905b73f`, `ba343971-10e5-4b05-b005-405b9c1ce447` und `c1c80b80-733f-599d-a2fc-f4dc50eabde2`. Sie erhält stabile IDs, Voraussetzungen und Bilder. Nur b025 erhält eine inhaltlich präzisierte DE/EN-Beschreibung. Die nachfolgende Native-Prüfung ist keine D/P/A/M/V-Freigabe oder menschliche Zustimmung.

## Ziel- und Quellenmatrix

| Ziel | Belegter operativer Scope | Direkt geprüfte Originalstelle |
| --- | --- | --- |
| b025 – Lage zweier Raumgeraden und Schnittpunkte | BW / SekI / J10 | BW BP2016, Druck-S.34 / PDF-S.36, 3.3.3(13). |
| ba343 – gleichförmige geradlinige Bewegung mit Orts-/Geschwindigkeitsvektor | BW / SekI / J10 | BW BP2016, Druck-S.34 / PDF-S.36, 3.3.3(14). |
| c1c80 – Funktionsmittelwert durch Integral | HE / SekII / GK und LK | HE KC2024, Q1.2, S.37, mittlere Bestände und mittlere Änderungsraten. |
| c1c80 | SH / SekII / GK und LK | SH Fachanforderungen2024, S.63, Integral zur Mittelwertbestimmung. Originalseite visuell geprüft: Mittelwert-Zeilen sind nicht als ausschließlich erhöhtes Niveau hervorgehoben; in derselben Tabelle ist nur das uneigentliche Integral entsprechend markiert. |
| c1c80 | BW / SekII / LK | BW BP2016, Druck-S.41 / PDF-S.43, 3.4.2(8), ausdrücklich Leistungsfach. |
| c1c80 | HB / SekII / LK | HB GyO2022, S.25, A2.8, ausdrücklich LK. |
| c1c80 | SL / SekII / LK | SL Hauptphase LK2019, S.17, Mittelwertformel, Flächenbilanz und Kontextdeutung. |

Originaldateien unter `curricula/DE/Gymnasium/input/`: `BW/BP2016BW_ALLG_GYM_M.pdf`, `HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, `SH/Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf`, `HB/GyO_Mathematik_2022.pdf`, `SL/LP_Ma_LK_HP_2019.pdf`.

Die BW-Vektorzeilen (13)/(14) sind auf der tatsächlich betrachteten Seite unterstrichen. Die Regel auf Druck-S.33 / PDF-S.35 ordnet diese Teilkompetenzen ausdrücklich J10 zu. Frühere Source-Extraction-Referenzen nennen teilweise Druck-S.33; die operative Mappingentscheidung hält nun die genaue Zeilenseite fest. Andere Bundesländer erhalten durch diese BW-Quelle keine J10-Pflicht.

HE Q2.3 S.42 trägt entsprechende Oberstufenkompetenzen, ist aber bereits an `69beb31d-5d02-4505-9500-3ec81af86f1e` (Geradenlage/Schnittpunkt) sowie `492463cf-6cb2-5a5a-98e0-c1d77c36c256` (Bewegungen) gebunden. Diese Quellen, IDs und Targets bleiben erhalten; die beiden J10-Atome werden nicht zusätzlich als doppelte HE-SekII-Ziele eingeführt.

## Beschreibung und Rollen

b025 benennt jetzt alle vier Fälle ausdrücklich: identisch, echt parallel, sich schneidend und windschief. Dies präzisiert den bisherigen allgemeinen Ausdruck „Lage zweier Geraden im Raum“; es erzeugt kein neues Atom. Die englische Beschreibung ist entsprechend angepasst. Die ba343- und c1c80-Texte bleiben fachlich unverändert.

b025 und ba343 erhalten BW/SekI-Applicability, eine Grenze gegen Mapping-Vererbung und je ein BW-J10-Placement. c1c80 erhält explizite SekII-Applicability und fünf Landesplacements: HE/SH ohne Kursbeschränkung, BW/HB/SL mit LK-Kontext. Zusammensetzungsansichten setzen unbelegte Targets gezielt auf `prerequisiteOnly`. Andere atomare Zielmengen bleiben gleich. Nationale Ansichten bleiben Inhaltskataloge.

Zusätzliche freigegebene SL-Reparatur: In `de-sl-gk.view.json` und `de-sl-lk.view.json` wurde die redundante direkte Referenz auf `baea3966-5d10-53bf-8193-3fcda7b1e73f` entfernt. Der benachbarte Parent-Subtree `6248bbd7-c7e8-4f91-b3dc-de885cf5abce` enthält das Ziel weiterhin. Beide nativen Compiler melden danach 0 Fehler; das Kugelvolumen-Herleitungsziel erscheint je Ansicht genau einmal unter Jahrgang10. Seine Target-Mitgliedschaft ändert sich nicht.

## Prüfung und Folgearbeit

[Prüfprotokoll](native-validation.json) und [vollständiges Dateimanifest](changed-files.json) verwenden unmittelbar vor/nach dieser Änderung eingefrorene Snapshots. Ergebnis: Canon 0 Findings, 88 Ansichten geprüft, 0 neue Compilerfehler, 0 fremde atomare Target-Deltas und 0 unbelegte authored Targets. Der Änderungssatz umfasst Canon, 39 Views und zwei BW-Mappingreviews. Der Vergleich überprüft atomare Target-Deltas und konkrete Rollen der drei Ziele; technische Knotenindexverschiebungen zählen nicht als neue fachliche Compilerfehler.

Vor erneuter Schließung brauchen alle drei Ziele aktuelle unabhängige D-Bindungen für ihre neue Geltung. b025 braucht außerdem eine aktuelle Text-/Semantic-/P-Bindung bzw. Bewertung; unveränderte Voraussetzungen allein beweisen keine P-Freigabe für den präzisierten Text. Bestehende Review-/Registry-Einträge wurden hier nicht selbst umgedeutet oder freigegeben.

Bei der tatsächlichen b025-Bildsicht wurde ein zusätzlicher Bildfehler festgestellt: Die blaue Gerade wird mit Stützpunkt (0,0,0) beschriftet, verläuft aber nicht durch den eingezeichneten Ursprung. Die Rechnung s=t=1/2 und der Schnittpunkt sind korrekt. Das alte Bitmap bleibt in diesem Scope-Auftrag unverändert; eine aktuelle D/V-Schließung muss den Bildbefund gesondert behandeln.

Der vollständige Atlas-Neubau war bereits vor den Reparaturen durch fremde veraltete Semantic-Kind-Bindungen blockiert. Der neue b025-Text macht zusätzlich seine eigene aktuelle Inhaltsbindung erforderlich. Keine Registry wurde umgangen; der zentrale aktuelle Atlas-/Fünf-Gate-Lauf bleibt ein gesonderter notwendiger Schritt.
