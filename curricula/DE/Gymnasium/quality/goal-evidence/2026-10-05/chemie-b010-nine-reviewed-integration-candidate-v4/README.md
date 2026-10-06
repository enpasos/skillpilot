# B010 – neun unabhängig geprüfte aktuelle Bindungen, Integrationskandidat v4

Dieses Dossier ist ein **inaktiver maschineller Integrationskandidat**. Keine aktive Registry, kein aktiver Kanon, keine aktiven Lernzielbilder und kein In-flight-Ledger wurden durch diese Vorbereitung geändert. Menschliche Freigabe und Erprobung sind nicht erfolgt.

## Tatsächlicher Fortschritt

Der Chemie-Bericht `future-chemie-central-after-native-qa-sync.report.json` wurde im physischen Isolat nativ mit tatsächlichem Exit 0 erzeugt: **90/376 strikt abgeschlossen (23,9 %)**; **D90/P90/A199/M376/V354**, keine berichteten Probleme. Alle sechs erforderlichen maschinellen Prüfgruppen bestehen. Dies ist kein M7-Abschluss des gesamten Fachs; 286 Ziele bleiben offen.

- Alle bisherigen **85** strengen Abschlüsse sind nach aktuellen Ziel-IDs erhalten.
- **5** neue fachliche Abschlüsse: 950c73c6 (Ionengitter), 16a80de2 (Metalle/Oxide mit Wasser), 58486300 (Halogene/Verwendung), 414489cb (Rauchgasentschwefelung), 1f5ee84f (Düngemittel).
- **4** bestehende Abschlüsse mit erneut gültigen tatsächlichen Bindungen: fcc73fb5, 42a84bca, b5086548, d726e00e. Deren Beitrag zum Nettozuwachs ist **0**.
- HOLD H2/Halogen/HCl sowie 72236f2c und e0e201bd sind ausdrücklich ausgeschlossen; ihre Befunde werden nicht durch dieses Paket abgeschlossen.

## Unabhängige Nachweise und native Synthese

Die tatsächlich gelesenen unabhängigen D-A- und D-B-v3-Runden haben jeweils neun gültige aktuelle Urteile. Beide Runden waren bei ihrer Erstprüfung voneinander unabhängig. Die Synthese wurde anschließend mit den bestehenden nativen Synthesis-, Resolution- und Finalize-Helfern erzeugt. Neun native Resolutions stehen unter `native-finalbook/resolution-index.json`; alle tatsächlichen Erzeugungs- und Prüfkommandos mit Zeiten, Exitcodes und Digests stehen in `native-nine-synthesis-finalization.terminal.receipt.json`. Beide unabhängigen Reviewverzeichnisse, die vorbereiteten v1/v3-Bundles und ihre historischen Urteile bleiben unverändert.

Sieben vollständige v3-Seiteninputs waren gegenüber den vorher tatsächlich geprüften Inputs exakt gleich. Die zwei korrigierten Seiten 16a/1f wurden in tatsächlichem nativen PDF und HTML einschließlich Originalbild und 360-/680-Pixel-Ansichten unabhängig nachgeprüft. d726 bindet das bereits akzeptierte aktuelle PNG; das ältere JPG ist keine aktuelle Seitenfreigabe. Der zunächst behauptete b508-Titelanschnitt wurde anhand der tatsächlichen PDF-Seite und Zeichen-Bbox zurückgenommen; kein Rendererfix wurde daraus abgeleitet.

## Tatsächliche Bildkorrekturen und wahrer Status

16a: Das Natriumstück liegt nun eindeutig an der Wasseroberfläche; die zuvor unbelegte Unterwasser-/Flammeninszenierung ist korrigiert. 1f: Die falsche Phosphat→Nitrat-Verbindung ist entfernt. Der Generator hat außerdem kleine Pfade und Pflanzenaufnahme-Pfeile/-Text geändert; diese Zusatzänderung wurde offen dokumentiert und das gesamte neue Bild geprüft. Beide PNGs und fachlich passenden Alttexte haben echte unabhängige maschinelle V-Nachweise. Bereits gute Bilder 584/414 bleiben KEEP; 950 nutzt das unabhängige gültige Urteil zum exakt gleichen PNG und Beschreibungspayload. Keine Erzeugung oder Metadatensynchronisierung wird als fachliche Prüfung ausgegeben.

Die vier historischen Eingaben pro ersetztem Bild (Source-/Public-/Backend-JPG plus alter Prompt) sind jeweils vor Integration bytegenau archiviert. Nur die sechs ausdrücklich aufgelisteten alten JPG-Kopien werden bei aktiver Integration entfernt; historische Archive bleiben erhalten. Auflösungen der beiden neuen PNGs: 1678×937 und 1679×937, etwa 16:9. Die tatsächlichen Ansichten wurden auf fachliche Richtigkeit und 360-/680-Pixel-Erkennbarkeit geprüft.

Alle fünf positiven V2-Evidence-Profile bleiben wahrheitsgemäß `needs_human_review`, E1/G1; keine menschliche Approval-Behauptung. Die fünf semantischen Atomaritätsentscheidungen sind echte geprüfte Wissenschaftspayloads; die 22 bzw. 4 nicht betroffenen alten A-Zeilen wurden exakt erhalten. Der vollständige gültige Memory-Wissenschaftspayload für 376 Ziele einschließlich nötiger Karten und Sichtbarkeitsprüfungen bleibt exakt erhalten und ist aktuell gebunden.

## Native QA-Frische – erster Versuch erhalten

Der erste zentrale Zukunftslauf ist als `future-chemie-central.report.json` mit tatsächlichem Exit 1 erhalten. Er hatte genau eine native QA-Frischeabweichung. Der bestehende native Ledgergenerator wurde danach im Isolat ausgeführt. Er stellte die native Sortierung her und entfernte ausschließlich ein führendes Leerzeichen in 1f.`chatGptNotes`; alle 376 wissenschaftlichen/visuellen Urteile, Bilddaten und menschlichen Statusfelder bleiben exakt. Es entstanden dadurch **0 neue fachliche Freigaben**.

Der neu aus den tatsächlich aktuellen Eingaben gebaute native Neun-Seiten-Modellstand wurde mit dem tatsächlich geprüften Bundle vollständig verglichen: **alle neun kompletten Seitenobjekte einschließlich Ziel-, Seiten-, Kontext- und Bildbindungen sind exakt gleich**. Nur der globale QA-Metadatendigest und daraus abgeleitete globale Modellmetadaten unterscheiden sich. Die 103 SourceAtlas-Rohbindungen bleiben aktuell exakt; die QA-Notiz ist keine Atlas-Eingabe. Die native Neun-Ziele-Finalprüfung besteht nach der Synchronisierung. Die technische Fehlprobe mit Top-level-Await bleibt ebenfalls als wirklicher fehlgeschlagener Versuch erhalten; der unterstützte Async-Helfer besteht anschließend, ohne QS-Codeänderung.

## Begrenzter Integrationsplan

`integration-plan.json` enthält genau **24** aktive Delta-Dateien, **49** unveränderte geschützte Eingaben, den neuen D9-Index mit expliziten Supersessions, aktuelle P5-/A-/M-Konfigurationen und die sechs nur nach Archiverhaltung zulässigen JPG-Entfernungen. fcc: Der bereits supersedierende historische Singleton wird ausschließlich aus der aktuellen Registry entfernt und seine ursprüngliche Supersession auf den neuen D9-Index ausgerichtet; seine Dateien bleiben unverändert erhalten. So entsteht keine doppelte aktuelle Ownership.

Mathematik- und Physik-Registry-Einträge bleiben bytegenau unverändert. Die aktive Anwendung ersetzt ausschließlich das Chemie-Objekt und erhält den zum Anwendungszeitpunkt vorhandenen Biologie-Eintrag exakt, einschließlich inzwischen unabhängig integrierter Fortschritte. Geschützte Mindeststände Mathematik807/807 und Physik478/478 bleiben verbindlich und werden bei der anschließenden zentralen Integration überprüft.

Vorprüfung (read-only):

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-nine-reviewed-integration-candidate-v4/apply-reviewed-integration-plan.py
```

Aktive Integration durch den zuständigen Root-Agent nach Prüfung dieses eingefrorenen Plans:

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-nine-reviewed-integration-candidate-v4/apply-reviewed-integration-plan.py --apply
```

Danach: aktuelle vollständige zentrale Prüfung aller vier Fächer am stabilen Integrationsstand, gezielte abhängige Layer-A-/Asset-/Schema-Prüfungen und Fortschrittseintrag durch Root. Keine Runtime-, Datenschutz-, Sicherheits-, Plugin- oder Veröffentlichungsänderungen sind Bestandteil dieses Pakets.
