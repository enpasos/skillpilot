# Aktuelle Unit-Prüfungsbindung: konstante Beschleunigung

15.11.2026, Europe/Berlin. **Aktueller zweigliedriger Unitnachweis nach konkreter Root-Inhaltsentscheidung; native Abschlussprüfung bleibt gesondert.**

Der Integrationsagent hat die vollständigen aktuellen DE/EN-Ziele, das volle
e4b-P-Profil und beide vollständigen Aufgaben, Lösungen und Raster gelesen.
Dies ist eine benannte AI-Inhaltsprüfung. Sie ergänzt die tatsächlich
vorliegenden unabhängigen früheren Inhaltsreviews; sie wird nicht als neue
blinde Runde, Humanabnahme oder Lernerversuch ausgegeben.

Die bisherige Unit `physics-constant-acceleration` besitzt dieselben zwei
gewöhnlichen Ziele: e4b (konstantes Beschleunigungsmodell) und d6dc (Modellierung
und Idealisierung). Der bisherige c580-Task prüft d6dc mit selbst aufgestellten
Orts-/Geschwindigkeitsgesetzen, begründeter Achsenwahl, Massepunkt- und
Reibungsannahme und begrenztem Gültigkeitsintervall. Alle sieben Kriterien
sind bei 24/24 zwingend. Seine volle e4b-Behauptung ist hingegen unzulässig:
Selbst 24/24 verlangt keine Trennung von Ortsänderung und Strecke nach Umkehr.
Die frühere bindende Reviewaussage für e4b wird deshalb ausdrücklich korrigiert;
die damaligen Texte, Reviewdateien und frühere Resultate bleiben erhalten.

Der bereits konkret vorhandene a8dc-Task prüft das volle e4b mit zwei getrennten
Bewegungsfällen. A konstruiert alle drei Darstellungen aus einem t-a-Protokoll,
berücksichtigt den verschobenen Zeitnullpunkt, Umkehr und vorzeichenbehaftete
Flächen. Ortsänderung +2 m und Strecke 2,50 m sind ausdrücklich getrennt.
B konstruiert die Bremsdarstellungen neu und begrenzt die rechnerische
Rückwärtsfortsetzung nach dem Stillstand. Fünf notwendige Vier-Punkte-Kriterien
ergeben 20/20. Fehlende Strecke/Ortsänderung oder fehlender neuer Bremsfall
verhindern jeweils die volle Punktzahl; der alte c580-Pass ersetzt sie nicht.
Die Zahlen wurden nachgerechnet: Umkehr bei t=2,5 s/s=4,75 m, s(4)=7 m,
Bremsstopp bei 3 s/9 m und unzulässige Fortsetzung v(5)=-4 m/s/s(5)=5 m.

Die neue Unitrevision `2026-11-15-v2` behält beide ordinary Goals und den
bestehenden 24-Punkte-Task. c580 trägt ausschließlich d6dc-Coverage.
Der unveränderte a8dc-Task kommt als zweite eigene Assessment-Platzierung
hinzu und trägt ausschließlich e4b-Coverage. Beide tatsächlichen Leistungen
sind nötig; keine neue künstliche Voraussetzung und keine abgesenkte Schwelle
ersetzt eine fehlende Leistung.

| Task | Eigener ordinary Anspruch | taskRevision | rubricRevision |
| --- | --- | --- | --- |
| c5807a37-129e-5df6-8989-482bc7f5683e | d6dc0e02-831d-4894-a61a-852bcc74f147 | sha256:45c2c559b0ddf2b4f35060b459438cd9dd22dac456abfc04ef91855538c68324 | sha256:dc7256b9a559ea7ec359f8b5c53c377a4b99481628aced62a68b885d71c11ad7 |
| a8dc0290-9f80-5763-8943-e16b8d2aa860 | e4b38061-1f28-43ad-8371-a3e7c0e81856 | sha256:8a5ccaa3f596ace70e6a4dad6f644a2ddaa046be5f2c598a012a1ff40d9b17ef | sha256:62bf8143588daa963566318ada486cc4a189906d6a6b92d2e428ec8fe5383163 |

Vorhandene echte unabhängige Inhaltsbasis sind das ursprüngliche gebundene
Unitreview vom 13.11.2026 für d6dc sowie die erhaltenen vollständigen
K6-v2-/K6-v3-Inhaltsreviews für a8dc. Die echte Root-Disposition zum 21-Claim-Audit bestätigt den begrenzten Coverageentzug und diese konkrete Unitreparatur: `curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/stage-plan-k3k6-current-v1/root-review/direct-claim-removal-root-disposition.actual.json`. Der Generator bindet a8dc über die oben genannten
festen Task-/Rubrikrevisionen und prüft seinen aktuellen Released-Status;
er verfasst oder dupliziert seine Inhalte nicht.

Keine gespeicherten Lernendenresultate, Mastery- oder SRS-Daten werden durch
die Änderung geschrieben, übertragen oder zurückgenommen. Die native Unitvalidierung besteht für 21 Landschaften und 3 Units ohne Befund; 34 bestehende Unitvertragsfälle bestehen. Frisch aus den aktuellen Java-Quellen kompilierter Compiler/Evaluator bestätigen vier tatsächliche synthetische Unit-Zielmengenfälle: leer, nur c580 und nur a8 bleiben offen, erst beide Tasks schließen den Scope. Die Ausführung liest oder schreibt keine Learnerdaten und ist kein Service-/Hosttest. Belege: `../goal-evidence/2026-11-15/stage-plan-k3k6-current-v1/unit-native/unit-native-two-assessment.actual.json` und `../goal-evidence/2026-11-15/stage-plan-k3k6-current-v1/unit-native/unit-native-java-executions.actual.json`. Integrierte Qualitätsprüfung und frische erfolgreiche Main-CI stehen weiter aus.
