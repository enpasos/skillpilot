<!-- SPDX-License-Identifier: CC-BY-4.0 -->
# B008-Modellportfolio: gezielte Autorenkorrektur A-01

**AUTHOR / inactive / needs_review / keine Freigabe.** Der unabhängige Befund A-01 betrifft ausschließlich den Unterschied zwischen einem singulären Hypothesenauftrag in Werkstatt 4 und der unveränderten Rubrik, die beide Rezeptor-/Enzymfälle bewertet.

Der ganze Nachfolger umfasst weiterhin 517 Ziele. Nur bei `7bfe515c-e59f-521c-9781-b75e33caf0ec` ändert sich der vollständige Aufgabeninhalt in einem Satz:

Vorher: „Prüfen Sie selbst eine Hypothese über eine Veränderung von Kontakt, Konzentration bzw. Substratangebot mit eigener Modellrechnung oder Simulation.“

Nachher: „Prüfen Sie für **beide Fälle A und B jeweils eine eigene Hypothese** über eine Veränderung von Kontakt, Konzentration bzw. Substratangebot mit eigener Modellrechnung oder Simulation.“

Damit wird die bewertete Hypothesenleistung ausdrücklich für Rezeptorfall A und Enzymfall B verlangt. Lösung und vollständiges Bewertungsraster bleiben exakt. Der zweite notwendige Goal-Diff ist `examData.sourceArtifactPath`: Er bindet den vollständigen korrigierten Aufgabeninhalt an die neue Task-Datei in diesem Nachfolger. Alle übrigen Felder des Zielkörpers und alle anderen 516 ganzen Ziele sind exakt erhalten, einschließlich Quellen-/Kursgrenzen, `requires`, Coverage-IDs, Bildern, tatsächlichen Leistungsanforderungen und `needs_review`.

Ausgangspunkt ist der versiegelte Whole517-Autorenkandidat mit SHA-256 `6568038620a0675425f334a7104d189484ff3e76468720611c9a288d02414485`. Alle 29 alten versiegelten Dateien werden vor und nach der Korrektur unverändert geprüft. Die Eingabebindungen verwenden portable Repositorypfade; die neue Task-Quelle stimmt vollständig mit `examData.taskContent` überein. Normale gezielte JSON-Prüfung, explizites Runtime-Schema, Unverändertheits- und Portability-Prüfungen sind dokumentiert. Struktur und Routen ändern sich nicht; es wird kein Gesamt-M6/M7-Nachweis daraus abgeleitet.

Die Autorenkorrektur ist für eine gezielte unabhängige Nachprüfung vorbereitet. Sie erklärt den unabhängigen Befund nicht selbst für freigegeben. C11 bleibt **HOLD_UNSPECIFIED_C11**, P bleibt unselektiert, alle Prüfungen bleiben `needs_review`; strenger aktiver Zuwachs **0**, aktueller strenger Nenner **null**. Es gibt keine operative Integration, Git-/GitHub-Schreiboperation oder Änderung alter Seals.

Aufgabe und Wissenslandschaftskandidat: SkillPilot, CC-BY-4.0. Technischer Assembler/Prüfer: Apache-2.0.
