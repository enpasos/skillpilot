# B014 Arrhenius: unabhängige S/A/M-, Karten- und Sichtprüfung

**Eingefrorene unabhängige Prüfung eines inaktiven Autorenkandidaten.** `ai_candidate`, informiert und nicht blind. Kein aktiver QS-Abschluss, keine D-Doppelprüfung, kein P/V, keine menschliche Freigabe. Strenger Nettozuwachs **0**, neue fachliche Abschlüsse **0**, wiederhergestellte aktive Bindungen **0**.

Der eingefrorene Root-Kandidat hat Manifest-SHA256 `768e192e0d6fe15287906178f9f6e4215d53af6ef7fc70c74f1ad70cde082228`. Seine 20 eigenen Artefakte und die zehn tatsächlich verwendeten externen Eingaben sind unverändert. Der Reviewer hat die tatsächliche amtliche HE-Seite 35 und sämtliche 18 DE- sowie 18 EN-Karten gelesen; keine inhaltlichen Ergebnisse anderer Reviewer und keine P-Profile gelesen. Die spätere Korrekturauflösung durch denselben Reviewer ist keine zweite unabhängige Beschreibungsprüfung.

## Ersturteil zum ursprünglichen Kandidaten

Die Originalurteile sind separat eingefroren in `original-independent-per-card-and-goal.judgments.json` und bleiben erhalten.

- **M-DE-WORD-01 HOLD:** Neun deutsche Rückseiten sprechen von „ungelösten Molekülen“. Das betrifft eine andere Frage als die Darstellung gelöster Teilchen. Schwache Säuren können in Wasser sowohl undissoziierte Moleküle als auch Ionen enthalten. Die Aussage muss fachlich präzise bleiben. [OpenStax Chemistry 2e, 14.3](https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases).
- **M-REV-02 HOLD:** Salzsäure, Natronlauge, Kalilauge, Kalkwasser und Barytwasser werden im ursprünglichen Satz nur von der Formel aus abgefragt. Für die behaupteten zwei Richtungen der neun Stoff-/Lösungsbeziehungen fehlen diese fünf Lösungsnamen als Eingabe der Rückwärtsabfrage. Alle neun Vorwärtskarten bestehen die Fachprüfung; vier englische Rückwärtskarten bestehen bereits, fünf haben diese Abdeckungslücke.
- **M-SCOPE-03 HOLD:** Die neue Memorynode ist HE-exklusiv, während ihr notwendiger gewöhnlicher Ursprung `28bb9d15-f865-5843-a035-6066580fea64` in allen 16 Bundesländern gilt. Die realen GK/LK-Kompositionen mit dem tatsächlichen `goalMatchesFilters` ergeben **30 fehlende Origin/Memory-Paare** außerhalb Hessens. Ein grüner nativer M-Bericht über ungefilterte Views schließt diese Lücke nicht.

Die Stoffnamen, neun Formeln und Trennung von Stoff und wässriger Lösung sind fachlich passend. Alle neun Zusammensetzungen wurden zusätzlich tatsächlich über die primäre [NIH PubChem PUG-REST-API](https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/sulfuric%20acid/property/MolecularFormula,IUPACName/JSON) abgefragt; Einzel-URLs und Antworten liegen in `nine-formulas.pubchem-primary.actual.receipt.json`. Unterschiedliche Elementreihenfolge der Datenbankformeln wurde über Elementzahlen geprüft. Der HCl-Datensatz ist kein Nachweis für die Trennung von Gas und Lösung; diese wird gesondert fachlich beurteilt.

## Konkrete geprüfte Korrekturvorlage

- DE/EN jeweils weiterhin **18 Karten**, neun kompakte Tatsachen in zwei Richtungen. Neun Rückseiten sagen jetzt, dass die Formel die Stoffzusammensetzung beschreibt und nicht sämtliche Teilchen einer wässrigen Lösung. Keine Behauptung vollständiger Dissoziation aller Säuren.
- Die fünf Lösungsnamen dienen nun als Eingabe einer Formelabfrage. Die Rückseite nennt den Stoff und seine Formel. Die englischen Fragen verlangen nur die Formel, damit der im englischen Lösungsnamen enthaltene Stoffname keine verlangte Namensantwort verrät. Keine Lösung erhält eine eigene Summenformel; Kalkwasser bleibt die klare Lösung, keine Suspension.
- Die neue Memorynode `417e65ec-68be-5f2e-9452-c3ba9b1d362f` erhält genau die vorhandene Jurisdiktionsmenge des gewöhnlichen Ursprungs. Dies ist die Scope-Bindung des notwendigen Unterstützungsziels, keine Behauptung, jedes Land schreibe die neun HE-Beispiele ausdrücklich vor. Die tatsächlichen regionalen Quellenbindungen bleiben gesondert offen.
- Der gewöhnliche Vorschlag bleibt inhaltlich unverändert: Namen und Formeln angeben **und** die Wirkung in Wasser nach dem Arrhenius-Konzept erklären. Das ist eine zusammenhängende Verständnisleistung mit notwendigen Abrufwerkzeugen. Karten allein bestehen sie nicht. Die reine Memorynode erhöht den curricularAtomic-Nenner nicht.
- Alle 18 aktuellen Primärkarten sind zu Ursprung28 getaggt und im Kartenledger als notwendige Unterstützung verankert. Memory folgt der vorhandenen Indikator-Grundlage `d2ccd1d5-56f7-583f-9724-e97441367f91`; ihre tatsächlichen Voraussetzungen wurden geprüft. Im GK/LK-Baum stehen Origin und Memory jeweils einmal unter Protolysereaktionen, in Sek I keines von beiden.
- **375 unveränderte aktuelle M-Records und 55 alte Kartenrecords bleiben als exakte ursprüngliche JSONL-Zeilen erhalten.** Der Root-Kandidat hatte deren Recordinhalt erhalten und Leerzeichen beim Serialisieren geändert. Keiner dieser unveränderten Nachweise wurde fachlich neu geprüft. Review-ID, Regeln, Scope und bestehende Prüfgrenzen bleiben erhalten.

Alle korrigierten DE/EN-Karten sowie S/A/M-Grenzen stehen einzeln in `corrected-independent-per-card-and-goal.judgments.json`. Die korrigierten Decks, der inaktive Canonical-Graph und vollständige sowie betroffene M-Konfigurationen befinden sich ausschließlich in diesem Verzeichnis.

## Tatsächlich ausgeführte Prüfungen

| Prüfung | Terminaler Befund |
| --- | --- |
| Unveränderter nativer M-Checker, vollständiger inaktiver Layer | exit 0; 376 ordinary, 55 memory-required, 7 Memorynodes, 73 aktuelle Primärkarten; 0 missing/stale/obsolete/open |
| Unveränderter nativer M-Checker, Ursprung28 und neue Memorynode | exit 0; 1 ordinary, 18 aktuelle Primärkarten; `visibilityScopeCoverageRequired: true`; 0 missing/stale/obsolete/open |
| Echter CompositionCompiler, drei bestehende Views | exit 0; keine verlorenen bisherigen Targets, nur neue Memorynode im GK/LK; keine Compilerfehler |
| Tatsächliche Jurisdiktions-/Kursfilter | korrigiert 32/32 Origin/Memory-Paare PASS; ursprünglicher Negativnachweis mit 30 HOLDs erhalten |
| Effektive Memory-Voraussetzungen in den 32 Kontexten | 32/32 PASS; keine fehlenden oder ausgeblendeten erforderlichen Voraussetzungen |
| Contains-, Requires- und effektive Requires-DAGs | keine fehlenden Kanten, keine Zyklen |
| Eingaben und Originalurteile nach Prüfung | 20 Root-Artefakte und zehn externe Eingaben unverändert; Ersturteil-Hash unverändert |

Terminale Exit-Codes, unveränderte Eingaben und M-Metriken stehen in `native-terminal-and-input-integrity.receipt.json`. Keine automatischen Fingerprintrefreshes und keine Checkeränderung. Das historisch dokumentierte erste Autoren-Config-FAIL bleibt unverändert; es ist keine unabhängige Abnahme.

## Integrationsgrenze und nächster Schritt

**Salz-Quellenbreite bleibt HOLD in dieser Memoryprüfung.** HE-Seite35 fordert zusätzlich Salzbeziehungen; diese 18 Karten behaupten deren Abschluss nicht. Quellenverteilung auf die entsprechenden gewöhnlichen Salzkompetenzen bleibt in der getrennten B014-Quellenlane. Aktuelle operative D-Doppelprüfung, P, V und Quellen-/Seiten-/Kontextbindungen sind ebenfalls nicht abgeschlossen.

Als Nächstes die ausdrücklich korrigierte Vorlage übernehmen, endgültige öffentliche Deckpfade und erforderliche Runtimekopien herstellen und die gezielt betroffenen aktuellen A/M-Bindungen prüfen. Gute bestehende gewöhnliche Bilder erhalten und separat auf ihre aktuellen Bindungen prüfen; für die reine Memorynode wird kein neues Bild verlangt. Keine Veröffentlichung, keine menschliche Prüfung und kein Abschlusszuwachs durch diesen Kandidaten behauptet.
