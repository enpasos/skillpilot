# Recordergrenze und kleine TypeScript-Probe

Der Recorder läuft jetzt außerhalb des Produzenten-Namespace. Sein Verzeichnis erscheint innen als leeres, schreibgeschütztes Dateisystem; sein Dateideskriptor ist dort nicht sichtbar. Der vollständige Recordertrace bleibt erhalten. Die beiden früheren Dockets bleiben unverändert.

Der [maschinelle Beleg](source-identity-recorder-namespace-boundary-2026-11-07.json) dokumentiert den vorherigen RW-Mount, den technischen Nachfolger und sämtliche Grenzen. Das [Dateiinventar](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/recorder-namespace-isolation/closure-inventory.json) bindet rund 7 MB ausgewählte lokale Belege einschließlich vollständiger Recordertraces und eingefrorener Codekopien.

Die unveränderten Regressionsfälle bestehen: 13 C-Tests mit 29 nativen Läufen und vier Node-Tests mit elf Läufen. Ein neuer gewöhnlicher Sichtbarkeits-/Berechtigungstest prüft beide Rollen: leeres Evidence-Verzeichnis, fehlender Recorderpfad, `W_OK → EROFS`, keine Recorder-FDs und kein Controller-PID im lokalen `/proc`. Alle Tests haben null Fehler und null Skips. Es wurde kein Trace-Manipulationsprogramm oder zusätzliches Escapeprogramm erstellt.

Die kleine echte tsx-Discovery liest in beiden Rollen die gebundenen unterschiedlichen Goal-IDs und beendet sich jeweils mit Exit 0. Ihre Leseauthentisierung bleibt ausdrücklich gesperrt:

| Stand | Erster blockierender Zugriff |
| --- | --- |
| Erste gebundene TS-Probe | `tsx/dist/package.json`, fehlgeschlagenes `openat` |
| Separater Nachfolger mit genau dieser erklärten Tool-Metadatensuche | `tsx/dist/node_modules/esbuild`, weiterhin ungebunden |

Der eine erklärte Locator wird aus der vollständigen tatsächlichen tsx-Paketmitgliedschaft und den gebundenen Dependency-Dateihashes hergeleitet: echter Elternordner, exakt fehlende Datei, ausschließlich beobachtetes `openat(O_RDONLY|O_CLOEXEC) → ENOENT`, unveränderte Mitgliedschaft vor/nach dem Lauf. Es gibt keine Prefixfreigabe und keine Ausnahme für fehlende Curriculuminputs. Beide tatsächlichen TS-Blöcke bleiben getrennt erhalten; weitere mögliche Befunde sind damit nicht inventarisiert.

Recorder und Produzent haben eine exakt geleerte Umgebung. Der Produzent besitzt einen eigenen PID-Namespace mit lokalem `/proc`. Die Auswertung bindet den ersten erfolgreichen Start des exakten Executables samt geordneten Argumenten und alle seine Nachkommen; der vollständige vorherige bwrap-Abschnitt bleibt getrennte Toolprovenienz. Host- und lokale Prozess-IDs stammen aus straces expliziter PID-Übersetzung und tatsächlichen `getpid`-Ergebnissen.

Dies ist ein unverdrahteter Baustein mit winzigen Git-/Projektionsfixtures. Capture19, Preparer und V-Dateien bleiben unverändert. Weder Produktions-Source-A-Prüfung noch tatsächliche Capture-Mountintegration, ganze Deep-/CQR-Produzenten, AQA02/03, Laufzeitaktivierung oder M6/M7-Wiederherstellung sind damit belegt.
