# Separater Nachfolger der Informatik-Materialentwürfe

Die vier erforderlichen Befunde FMR-01 bis FMR-04 und die klaren redaktionellen Stellen aus FMR-05 sind korrigiert. Dieser separat gepinnte Nachfolger bleibt **Autorenentwurf / draft**. Ein gezielter unabhängiger Nachtest steht aus; dieses Paket enthält keine eigene Materialfreigabe oder approved-Ledger-Eintragung.

Ausgangsmaterial: `424d79c1c84ff7f0973c312756730008428a23d5bdfd84ab866287352c537364`.
Neues `native-examData.json`: `cb82c27a5cf0a53d7d946475dfd4f2ceae8e1065348580f97b7f0f9202871c92`.
Die ursprünglichen Materialien und der unabhängige Vollreview bleiben unverändert an ihren eigenen dauerhaften Orten. Der Nachfolger ist an deren Pins, den privaten Sourceentwurf `7586e38b…` und die unveränderte aktive Quelle `85411185…` gebunden.

- **FMR-01:** T21 beginnt ausdrücklich mit seinen eigenen Anfangsrechten. Seine Lösung unterscheidet den neuen Sichtzugriff vom weiterhin vorhandenen Basisrecht und nennt das eigenständige REVOKE. Das betrifft ausschließlich Alt41, Bibliothek23 und Festival23; T25/T33 werden nicht umgedeutet.
- **FMR-02:** Bei vollständig belegter SQL- und Ergebniskompetenz kostet ein isolierter nebensächlicher Preis-Abschreibfehler keinen wesentlichen Punkt: korrektes SQL und verstandene vier Zeilen, nur39 statt40, ergeben ausdrücklich C1=1/C2=1. Echte Join-, Filter-, Gruppierungs-, Sortier-, Mengen- und Sicherheitsfehler bleiben offen. Die Regel gilt konsistent für vergleichbare Ergebniskriterien. Schwellen, Kriterienanzahl und Pflichtkompetenzen bleiben erhalten.
- **FMR-03:** C-T07/C-T20 sind Python-Codeblöcke mit unverändertem Code und unveränderter Einrückung; Erläuterungen stehen außerhalb. Beide Blöcke wurden durch die unmodifizierte tatsächliche GoalCard gerendert und in Chromium geprüft. Der aus ihrem DOM gelesene Code wurde anschließend kompiliert und gegen SQLite ausgeführt.
- **FMR-04:** Die Festivalrubrik verlangt den wiederholbaren Auftrittsauftrag, seine Offen-Invariante und die optionale tatsächliche Endzeit.
- **FMR-05:** Die konkreten Leser-/Gastformulierungen und Servicenamen sind geglättet. Historische Exportfeldnamen werden ausdrücklich erläutert, statt Schlüssel oder FDs umzubenennen. Der allgemeine BCNF-Schemafall ist klar von Bibliothek/Festival getrennt.

Die vollen **45 Zielbedeutungen**, alle **91 Fälle**, die fünf Prüfungsidentitäten und ihre exakte geordnete Abdeckung **10/20/41/23/23** bleiben erhalten. Auch die vollständige875-Leistung mit Hierarchie und Parallelität bleibt im41er- und beiden23er-Materialien. Eigene20 und HE10 bleiben eigenständige Verträge. Keine Quelle, Kohorte, Runtime, Mastery, Karte oder aktive Produktdatei wird durch dieses Paket geändert.

Eigene Prüfungen:

- Alle **265 ursprünglichen Referenzprüfungen** erneut bestanden. Die drei ausführbaren Referenzprogramme und der ursprüngliche Runner sind bytegleich; der kleine Replaywrapper bindet nur den Pfad der ebenfalls bytegleich mitgelieferten eingefrorenen Inputdatei um.
- **215 gezielte Prüfungen** bestanden. Die DCL-Zustände wurden zusätzlich auf einer isolierten lokalen **PostgreSQL18.1**-Instanz mit nativen GRANT/REVOKE und wirklichen Abfragen unter der Rolle `auskunft` geprüft: Basisrecht vor/nach GRANT erlaubt, nach REVOKE SQLSTATE42501, Sicht danach weiterhin erlaubt. Die temporäre Instanz wurde gestoppt und entfernt; es wurde keine bestehende Installation oder Produktionskonfiguration geändert.
- Rubrikgegenfälle basieren auf ausgeführtem SQL und konkreten Antworten: der einzelne Preisübertrag besteht; fehlender Join, fehlender Statusfilter, falsche Sortierung und fehlende Ergebniszeile bleiben negativ. Eine zusätzliche unabhängige Gegenfixture unterscheidet den im ursprünglichen Datensatz allein nicht sichtbaren fehlenden Statusfilter. Dies sind endliche Testantworten, kein neuer allgemeiner Bewertungsruntime.
- Die tatsächliche GoalCard samt LanguageProvider wurde unverändert per React-SSR gerendert und anschließend in Chromium geöffnet. Nur isolierte Darstellungs-Kopien lassen den Draft-Status weg, um den vorhandenen Displayguard zu durchlaufen; die gepinnten Dateien bleiben draft. Das synthetische Mastery-Prop ist eine Renderprobe und schreibt kein Lernresultat. Beide Screenshots wurden visuell geprüft. Es handelt sich nicht um vollständige Anwendungs- oder Hostabnahme.

`correction-delta.json` listet die endlichen Änderungen. `casebank.json`, `exam-assemblies.json` und `native-examData.json` sind die vollständigen Nachfolgerdaten. `targeted-execution.json`, `postgres-dcl-execution.json`, `render-checks.json` und `preservation-and-replay.json` binden die eigenen Nachweise und unveränderten Originale. Das Siegel dokumentiert Integrität, keine Fachfreigabe.

Reproduktion im eigenen privaten Arbeitsverzeichnis:

```sh
python3 build-successor.py
python3 replay-original-265.py
node render-successor.mjs
python3 targeted-checks.py
```

Der Builder liest die dauerhaft gepinnten Ausgangsdateien aus dem vorhandenen Repository. Die Rendererprobe benötigt dessen installierte React-/Markdown-/Playwright-/esbuild-Abhängigkeiten; die DCL-Probe verwendet die vorhandenen PostgreSQL18-Binaries. Große temporäre Renderbundles und PostgreSQL-Daten gehören ausschließlich ins RAM-Arbeitsverzeichnis und sind nicht Bestandteil dieses dauerhaften Pakets.

Lizenzgrenzen bleiben wie im Ausgangsmaterial: eigene Aufgaben/Falldaten/Lösungen/Rubriken CC-BY-4.0, SkillPilot; technische Prüfscripte/Referenzprogramme Apache-2.0; zitierte Drittquellen und ihre Attribution bleiben eigenständig.
