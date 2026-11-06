# Unabhängiges gezieltes Dichte-R2-Review

**GO für den exakten privaten R2-Inhaltskandidaten. F1 ist geschlossen.** Die neue normale Rubrik vergibt bei einem ansonsten vollständigen und richtigen Folgeweg ausdrücklich 3 BE anhand der eigenen vorherigen Werte. Ein bereits abgezogener kleiner Rechenfehler kostet keine weiteren Punkte. Ein neuer eigenständiger Fehler bleibt abzugsfähig. Die unveränderten Kompetenzkerne und Nullpunktregeln verhindern weiterhin die Kompensation einer wesentlichen Auslassung.

Gebundener R2-Freeze: `570f885bfe435c84f61016a97aa4eb65b4094f74321c296e78970e16f4a40f0a`; alle **36 Artefakte** sind in Hash und Länge geprüft. Gegenstand ist Q `21d2273f-ccb7-5452-9a87-b26bcea4f68d` für das unveränderte gewöhnliche Ziel `2345ae25-5805-4c72-b830-32e63cc6262a`, Einheitenentwurf `math-sh-material-density`, Revision `2026-11-05-draft-v3-r2`.

Reviewer: `/root/astra_sh_tools_review`, unabhängig vom Autorenagenten `/root/sol_density_rubric_followthrough`. Für diese Reviewinstanz wurde die angeforderte Konfiguration `gpt-6-astra`, `ultra`, `fork_turns=none` von Root bestätigt. Sichtbare Systemidentität: Codex auf GPT-6-Basis; eine verborgene Deployment-/Patchversion wird nicht attestiert. Dieses gezielte Folgeurteil verwendet das eigene R1-Review nur für die nachgewiesen unveränderten Bestandteile. Prüfzeit und strukturierte Einzelbefunde stehen in der JSON-Datei.

## Tatsächlich ausgelieferte Regel und eigene Bewertung

Gelesen wurden die neuen deutschen `candidate-goal.json:goal.examData.scoring.steps[].description` und englischen `task-variant.en.json:scoring.steps[].description`. Beide enthalten exakt die gesamte normale Regel, den jeweiligen Kern sowie die zugehörigen 0-/2-/3-BE-Zeilen der bilingualen Rubrik. Die F1-Reparatur steht somit im normalen verfügbaren Bewertungstext und benötigt keine private Evidenzdatei oder zusätzliche Laufzeitbedingung.

Die 2-BE-Zeilen in Schritt 2 und 3 verlangen nun einen **neuen eigenständigen** kleinen Fehler in diesem Schritt. Die 3-BE-Zeilen erlauben ausdrücklich volle Punkte für den ansonsten vollständig und richtig anhand der eigenen vorherigen Werte ausgeführten Folgeschritt. Referenzzahlen setzen fehlerfreie Ausgangswerte voraus. Diese konkrete Ausnahme zur Zahlenkorrektheit beseitigt die frühere Mehrdeutigkeit; die inhaltliche Vollständigkeit bleibt erforderlich. Die deutsche und englische Regel sind in diesem Punkt gleichbedeutend.

Die vollständigen Abgaben in `evidence/r2-concrete-follow-through-cases.json` wurden unabhängig anhand dieses Textes bewertet; ihre Autoren-Sollpunkte wurden nicht als Beweis übernommen:

| Eigener Prüffall | Normale Punkte | Ergebnis |
| --- | --- | --- |
| Einmalig `450/180 = 2,4`; anschließend richtige Masse-pro-cm³-Deutung, vollständige Halbierungsbegründung und `2,4·80 = 192 g`; alle Vergleiche richtig | `(2,3,3) = 8/9` | Pass |
| Derselbe Fall, aber zusätzlich neue falsche Multiplikation `2,4·80 = 191 g` bei richtigem Modell, Einheit und Entscheidung | `(2,3,2) = 7/9` | Pass |
| Ausgangswerte richtig; lediglich neue letzte Rechnung `2,5·80 = 199 g`, sonst vollständig | `(3,3,2) = 8/9` | Pass |
| 2,4-Fall, aber Deutung von B fehlt | höchstens `(2,0,3) = 5/9` | Kein Pass |
| 2,4-Fall, aber die Dichte soll sich mit Masse und Volumen halbieren | höchstens `(2,0,3) = 5/9` | Kein Pass |
| 2,4-Fall, aber B wird wegen seiner Gesamtmasse als dichter bezeichnet | höchstens `(2,3,0) = 5/9` | Kein Pass |
| 2,4-Fall, aber nur eine der beiden 80-cm³-Anwendungen wird ausgeführt | höchstens `(2,3,0) = 5/9` | Kein Pass |
| Strukturell falsch `0,180 L = 0,180 cm³`; selbst bei unabhängig vollständig richtigen Folgekernen | höchstens `(0,3,3) = 6/9` | Kein Pass |

Zusätzlich gegengeprüft: Eine bloße Formel oder Einheit nach dem anfänglichen Zahlfehler ersetzt keine der beiden Deutungen; Schritt 2 bleibt null. `V/m` als Dichtemodell ist keine kleine Zahlabweichung und kann nicht über die Folgefehlerregel gerettet werden. Ein sonst richtiger, erklärter Halbierungsweg braucht weiterhin keine ausgerechneten Halbwerte. Wenn solche freiwilligen Zahlen einen neuen isolierten Übertragungsfehler enthalten, erlaubt die 2-BE-Regel den entsprechenden lokalen Abzug bei erkennbar unverändertem Kern. Enthält jeder der drei vollständigen Schritte einen eigenen kleinen Fehler, bleibt `(2,2,2)=6/9` ein reguläres Nichtbestehen. Die Reparatur macht nicht beliebig viele neue Fehler kostenfrei.

Die bisherige Wiederholungsabzugswertung `(2,2,2)` ist für den **einzigen** ursprünglichen 2,4-Fehler mit anschließend richtigem 192-g-Folgeweg jetzt ausdrücklich ausgeschlossen. Der Unterschied zum zusätzlichen neuen 191-g-Fehler ist ohne Rückgriff auf einen privaten Kriterienvektor auslieferbar beschrieben.

## Änderungsumfang und Auslassungsschranke

Ein unabhängiger strukturierter Vergleich bestätigt genau acht fachliche Rubrikänderungen: `score2De`, `score2En`, `score3De`, `score3En` jeweils für die Schritte 2 und 3. Unverändert sind die allgemeine normale Regel, sämtliche Kerne, sämtliche Nullpunktregeln, Schritt 1, drei Schrittmaxima von 3 BE, erlaubte Schrittwerte 0/2/3 und der normale Pass ab 7/9.

Die daraus abgeleiteten Lieferbeschreibungen ändern nur die zwei entsprechenden Schritte. Daneben wurden private Aufgabenlocator, Einheitenrevision, Vorgängerlocator und Rubrikfingerprint auf die neue private Revision gebunden. Diese Metadaten ändern weder Aufgabe noch Own oder Prüfungsidentität. Aufgaben, Lösungen und Aufgabenpaare in DE/EN sind rohe Bytes gleich R1. Die Methoden-/Einheitenfreiheit bleibt erhalten.

Unabhängig neu aufgezählt: **27 normale Punktvektoren, sieben Passvektoren**, ergänzend 64 ganzzahlige Vektoren im Würfel 0–3 sowie **8192 Belegungen der unveränderten 13 wesentlichen Facetten**. Keine fehlende wesentliche Facette erlaubt einen Pass: Ihr ganzer Schritt bleibt null, die beiden übrigen Schritte erreichen zusammen höchstens 6 Punkte. Diese Schranke gilt auch bei zwischenliegenden Teilpunkten bis 3 und erfordert weiterhin kriterientreue Bewertung durch den Coach. Der produktive Gesamtpunktvergleich erhält keine neue semantische Kontrollfähigkeit durch diese Enumeration.

Der Inhalts-GO für vollständige Dichtedeutung, passende Einheiten und Sachanwendung, die mathematischen Ergebnisse, äquivalente Methoden sowie Quellentreue und Sprachparität aus R1 wird für die nachgewiesen unveränderten Bestandteile gezielt übernommen. Die konkreten F1-Punktzuordnungen und ihr DE/EN-Liefertext wurden in diesem Review neu beurteilt. Es war keine Wiederholung des vollständigen Quell- und Graphreviews nötig.

## Historie und Geltungsgrenze

Der ursprüngliche Dichte-Freeze `f2ba7055…` ist mit allen **28 Artefakten** unverändert; der frühere Mess-/Rechner-Freeze `884f6641…` ebenso mit allen **43 Artefakten**. Die R1-Reviewkopien stimmen exakt mit dem eigenen ursprünglichen Review überein. Der kanonische Snapshot, das Ordinary-/Alt-Q-Objekt, Quellenartefakte, Own-Inventar, Scopevorschlag und vollständige geerbte Demand-/Normalisierungsvorschlag sind in R2 bytegleich zu R1.

Own bleibt genau aus dem gewöhnlichen Dichteziel und dem neuen expliziten Q zusammengesetzt. Kein alter Q-Pass oder M-Zustand erhält eine neue Bedeutung; Prüfungen und Karten werden nicht implizit bestanden. Diese Übernahme ist an die geprüften privaten Eingaben gebunden und keine erneute aktuelle Scope-, Native-, D/P- oder Vertragsabnahme.

**Keine weitere Reparatur innerhalb dieses Inhaltsreviews erforderlich.** Endgültige Quellen-/Programm-/Erwerbsplatzierung, Scopeaufnahme, gegebenenfalls normalisierte R- und geänderte D/P-Kontexte, englische Registrierung sowie native Angebots-, Paket-, Runtime-, Coach- und Hostnachweise bleiben getrennt. Das GO ist keine normative Aktivierung, M7- oder menschliche Freigabe.

Geschrieben wurden ausschließlich `astra-final-review.md` und `astra-final-review.json` in diesem privaten R2-Verzeichnis. Autoreneingaben, alte Freezes, normative Dateien, Git, Builds, Lernerdaten und Produktionszustand wurden nicht verändert.
