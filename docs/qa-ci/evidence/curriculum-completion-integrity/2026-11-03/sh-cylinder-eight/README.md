# SH-Zylinder: transportierte Ausführungsnachweise

Die vier JSON-Berichte sind unveränderte Kopien der tatsächlichen privaten
Vorher-/Nachhermessung und der unabhängigen Gegenprüfungen. Die ursprüngliche
Aktivierungsfreigabe bleibt als `activation-receipt.original.json` bytegenau
erhalten. Im aktuellen Stage-Receipt wurden nur die vier primären Belegpfade
auf diese mit Git transportierten Kopien umgestellt.

Die internen Pfade der historischen Berichte beschreiben die damaligen lokalen
Ausführungskapseln. Sie sind keine zusätzlichen Build-Eingaben. Vollständige
temporäre Klassen, Abhängigkeiten und Rohprotokolle sind nicht Teil dieses
Transports. Die Quellensicherung liegt separat im
[Checkpoint-Archiv](../../../../../dev/checkpoints/2026-11-03/README.md).

Die Messung schließt 56 ungedeckte Ziel-Angebots-Paare in acht SH-Kontexten,
ohne neue hinzuzufügen. Alle 161 Mathematik-Angebote besitzen weiterhin
ungedeckte Abschlussrouten. Die privaten 233 Fokus-/Grenztests und diese
Freigabe belegen weder einen vollständigen Backendtest noch M7, GitHub-CI
oder Produktionsabnahme.
