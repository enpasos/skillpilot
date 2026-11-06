# Angewandte historische Belegarchivierung

Genau sieben Belege wurden mit unveraenderten Bytes und Dateimodi unter `qa-artifacts/ci-contract-audit/2026-11-06/` archiviert. An ihren sieben bisherigen Pfaden stehen die exakt geprueften relativen Git-Dateisymlinks. Zwei zusaetzliche relative Aliase erhalten die fuenf vorhandenen Markdownlinks auch am neuen Ort. Es gab keine inhaltliche Aenderung oder neue Freigabe historischer Ergebnisse.

Alle Before-Hashes und regulaeren Gitblobs wurden gegen 8a56 geprueft, alle Zielnamen waren frei. Nach Anwendung stimmen die sieben Archivbytes, neun Symlinkziele und ihre Gitobjekte exakt mit dem freigegebenen Plan ueberein. Die 21 aktiven kanonischen Quellen und die unveraenderten V1-Vertragsdateien behalten ihre Hashes.

Der echte gezielte Markdowncheck auf allen vier alten/neuen Markdownpfaden ist mit Exit 0 bestanden. Ein privater kleiner Gitbaum aus den tatsaechlichen angewandten Bytes fuehrt den unveraenderten GitSnapshot-Reader aus: sieben alte Locatorreads plus zwei Supportingreads liefern die richtigen Bytes; die native Treffermenge enthaelt exakt die sieben Archive. Zyklische, fehlende und aus dem Repository herausfuehrende Aliase werden tatsaechlich abgewiesen. Es wurde kein Commit im Projekt erstellt.

Ein Raw-Git-Zugriff auf den neuen alten Alias liefert Locatorbytes; fuer Rohbelegbytes gelten Archivpfad oder alter Commit. Die explizite Markdownpruefung ist keine Site-Renderingabnahme und keine allgemeine rekursive Symlinkpruefung. Ein neuer kompletter Source-A-Beweis folgt erst durch Root nach dem Checkpoint. V1, Registry und Verifier wurden nicht geaendert; QA-Records und Lernzustand ebenfalls nicht.

[Anwendungsquittung mit Hashes](source-identity-historical-evidence-archive-application-2026-11-06.json)
