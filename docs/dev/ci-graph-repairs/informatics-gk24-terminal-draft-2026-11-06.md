# GK24: eigenständiger vollständiger Prüfungsdraft

Der neue Entwurf prüft genau die 24 bestehenden GK-Kompetenzen der E-Phase.
Die zusätzliche LK-Kompetenz zur paketorientierten Übertragung ist nicht
enthalten. Die vier übrigen Netzwerkleistungen bleiben vollständig:
Netzkomponenten und Zusammenspiel, IP/DNS und TCP/IP-Modell, eigene
SMTP-Protokollanalyse sowie eigene Authentisierungs-/Log- und Risikoanalyse.
Der Transportdienst ist gegeben; Segmentierung, Sequenz-/ACK-Rechnung,
Pufferung und Wiederzusammensetzung werden nicht versteckt verlangt.

- [Vollständige Lernendenmaterialien und Aufgaben A01–A24](informatics-gk24-terminal-draft-2026-11-06.task.md):
  konkrete Netz-/Dienstbeobachtungen, vollständiger synthetischer Dialog und
  Logs, Datenbestand, fehlerhafter Altcode, HTML-Analyseausschnitt, Auftrag
  und alle vier klassischen sowie drei modernen Kryptofälle.
- [Vollständige Musterlösung S01–S24](informatics-gk24-terminal-draft-2026-11-06.solution.md):
  vollständige lokale HTML/CSS/JavaScript-Endfassung, drei unterscheidbare
  Referenzstände, ganze Rechnungen, Zustandsfolgen, Fehlersuche, Testplanung,
  Qualitätsurteile und Pflichtenheft. Die Quellen sind eingebetteter
  Prüfungsinhalt; keine Software-/Produktdatei wird geändert.
- [examData-Draft](informatics-gk24-terminal-draft-2026-11-06.exam-data.json):
  exakt 24 eindeutige `coveredGoalIds`, 24 notwendige Einpunktkriterien und
  24 Punkte zum Bestehen. Eine fehlende Leistung lässt höchstens 23 Punkte
  zu; daraus folgt keine automatische fachliche Bewertung.
- [Reviewinput mit jeder einzelnen Leistung](informatics-gk24-terminal-draft-2026-11-06.review-input.json):
  aktuelles Originalziel samt Eltern → Material → Teilaufgabe → eigene
  beobachtbare Leistung → Lösung → Kriterium. Die zwei im Original fehlenden
  englischen Beschreibungen werden nicht erfunden.

Die mögliche neue Identität `604c84fc-7fa3-5aa0-a6c6-33136a71a4a7` ist nur ein
**unreservierter Draft**. Der gesonderte Praxiscontainer-Vorschlag lautet
`b9d05b6a-be59-5b89-aa9b-fb00cb6f1b84`. Ihre UUID-v5-Herleitung ist dokumentiert;
vor Annahme fehlen die vollständigen globalen Namensraumprüfungen und die
explizite Identitäts-/Integrationsentscheidung. Die bisherige Identität
`49ba66cf-accd-5938-a63e-f031bc786767` behält ihren vollen 25er-Vertrag.
Es gibt keinen 24er-Teilpass unter ihr, kein Alias und keine Übertragung,
Neubewertung oder Löschung bestehender Ergebnisse.

Die bewährten Web-/Kryptobausteine des getrennt positiv geprüften
[LK25-Drafts](informatics-e25-terminal-candidate-2026-11-06.md) wurden für
anderen Umfang wiederverwendet und in vollständige GK-Dokumente übernommen.
Dessen eingefrorene Inhalte und Ausführungsbelege bleiben bytegleich.
**Der GK24-Draft besitzt noch keinen eigenen Autor-Referenzlauf und keinen
unabhängigen Inhaltsreview.** Berechnete Sollwerte und geplante Prüfungen
werden nicht als neue Beobachtungen ausgegeben. Die Lernenden müssen ihre
jeweils verlangten eigenen Programme, Prozesse und tatsächlichen Prüfungen
belegen; Kopieren der Referenzstände erfüllt diese Leistungen nicht.
Der [begrenzte Konsistenzcheck](informatics-gk24-content-consistency-2026-11-06.json)
prüft Zuordnung und Punktarithmetik. Der bestehende Materialprüfer blockiert
auch diesen Entwurf korrekt mit `reviewStatus=draft`; das ist kein QA-Pass.

Der [konkrete Integrationsplan für alle 35 Scopes](informatics-gk24-integration-plan-2026-11-06.md)
trennt die drei vollständigen GK-Angebote von den drei LK-Angeboten und
fordert eine eigene sichtbare GK-Praxisstruktur sowie eine neue geschlossene
QA-Endpunktkonfiguration. 24 Coverage-IDs werden **nicht** blind in 24 direkte
`requires`-Kanten umgewandelt. Ein fachlich legitimer minimaler Vorpfad bleibt
expliziter Hold, ebenso die umstrittene Auth-/Log→SMTP-Trägerkante.
Kein kanonischer Goal, keine View, QA-Freigabe, Quelle, State oder neue
Lerneinheitenruntime wurde geschrieben. Der Inhaltsdraft kann geprüft
werden, während diese Integrationspflichten ausdrücklich offen bleiben.
