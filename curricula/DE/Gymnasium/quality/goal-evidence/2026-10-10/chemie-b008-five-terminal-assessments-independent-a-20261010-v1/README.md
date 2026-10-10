<!-- SPDX-License-Identifier: Apache-2.0 -->
# Chemie B008: unabhängige vollständige Prüfung A

Geprüft ist exakt der versiegelte, inaktive 517-Ziele-Entwurf des Autorenpakets. Die fünf vollständigen Aufgaben, Lösungen und Bewertungsmaßstäbe, der neue Sek-I-Übungscluster, neun vollständige Prozessziele und ihre 21 wörtlichen historischen Quellenpartner wurden gelesen. Unveränderte historische Quellenentscheidungen und Bilder bleiben erhalten.

Die erste fachliche Prüfung und ihr Freeze entstanden vor der Kenntnis der neuen B-Prüfung. `FIRST.independent-full-assessment-science-and-route-findings.actual.json` enthält die vollständigen Entscheidungen, Leistungsanforderungen, Quellenbegrenzungen und 14 eigenständig begründete Klassifikationsempfehlungen. Diese Empfehlungen sind keine Änderungen am maßgeblichen Ledger.

## Offener Befund

A-01: In Werkstatt 4 des Modellportfolios fordert der Auftrag nur einen Hypothesentest, während die Rubrik ihn für beide komplexen Fälle verlangt. Der Aufgabenauftrag muss diese bewertete Leistung ausdrücklich für jeden der beiden Fälle fordern. Dies ist vor einer maschinellen Freigabe gezielt in einem zusätzlichen Autorenstand aufzulösen; der hier versiegelte Erststand bleibt unverändert.

Die übrigen vier Aufgabenentwürfe sind fachlich stimmig. Die C11-Wissensentwicklungsaufgabe bleibt unabhängig davon ohne geklärte Kurszuordnung gesperrt. Teilbelege aus C12/13 verleihen C11 weder GK/LK-Zuordnung noch vollständige Quellenfreigabe. Der neue Sek-I-Zweig ist keine belegte bundesweite Jahrgangszuordnung.

## Technische Prüfergebnisse und Grenzen

Die exakten Eingangsbindungen, 507 unveränderten bisherigen Zielkörper, vier ausschließlich geänderten `contains`-Felder und historischen partial-Quellenentscheidungen sind überprüft. Der normale Fingerprint-Vertrag bestätigt acht bestehende veraltete und sechs fehlende Klassifikationsentscheidungen. Runtime-Schema und der normale Curriculum-Symlink-Check bestehen.

Die separate Aufgaben-/Lösungsdatei enthält zusätzlich genau die eigene CC-BY-4.0-Lizenzzeile und einen abschließenden Zeilenumbruch; der restliche Inhalt ist mit dem eingebetteten `examData` identisch. Der anfängliche Prüfversuch mit der zu strengen Bytegleichheitsannahme ist samt Quellstand und Fehlerausgabe erhalten. Dies ist keine inhaltliche Abweichung.

Ein aktueller nativer 517-Ziele-Kontext, die operative Wahrung aller nicht kompensierbaren eigenen Leistungen und die zweite unabhängige Prüfung bleiben separate Integrationsvoraussetzungen. `reviewStatus=needs_review`, der erwartete CQR-202-Fehler und die C11-Sperre werden durch dieses Gutachten nicht umgeschrieben. Keine Bilder geändert, keine Lernendenleistung beobachtet, keine menschliche Freigabe und kein aktiver M7-Zuwachs.

## Reproduktion

Vom Repository-Wurzelverzeichnis:

```sh
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-five-terminal-assessments-independent-a-20261010-v1/technical/verify_review_bindings.py
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-five-terminal-assessments-independent-a-20261010-v1/technical/verify_normal_semantic_bindings.mts
```

Beide Befehle prüfen nur die gebundenen Kandidaten und schreiben Prüfdaten auf stdout. Sie aktivieren, veröffentlichen oder genehmigen keine Ziele.
