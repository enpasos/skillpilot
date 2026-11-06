# Q4-Netzschutz: neuer Inhaltsreview nach Voraussetzungskorrektur

Stand: 6. November 2026. Der [neue Einzelbeleg](informatics-q4-network-security-successor-review-2026-11-06.json)
prüft die tatsächlich geänderte Definition von „Netz- und Systemsicherheit“
erneut gegen das vollständige Material C1, die Lösung und Kriterium K09 des
bereits separat geprüften 19-Kompetenzen-Assessments. **Das fachliche Ergebnis
ist positiv; Anwendung und QA-Freigabe werden nicht behauptet.** Die alten
Inhaltsreview- und Aufgabenbytes bleiben unverändert.

Die neue Vorbereitung behandelt Authentifizierung, Logfiles und Risiken von
Client-Server-Diensten. Ihr vorhandener Vorpfad liefert Protokoll- und
TCP/IP-Grundlagen. Das passt zu den konkreten Vorfällen: Mitlesen im WLAN,
ein gültig angemeldetes Konto ohne erforderliche Rolle und ein unerlaubter
direkter Zugriff auf den Datenbankport. Binär-/Hexrechnung und Zweierkomplement
sind für diese Leistungen nicht erforderlich. Die Klassifizierung der drei
Schutzmechanismen und ihrer Grenzen bleibt die neu nachzuweisende Kompetenz.

Material C1 enthält alle Verbindungen, Zertifikatsbedingungen, Rollen- und
Firewallregeln. Die Lösung unterscheidet Transportvertraulichkeit/-integrität,
Serverauthentisierung, Anwendungsberechtigung und Netzfilterung korrekt. Sie
erhält die notwendige interne Verbindung und benennt die Grenzen bei
kompromittierten Endgeräten, gespeichertem Inhalt und weiteren unverschlüsselten
Verbindungen. K09 verlangt weiterhin sämtliche Zuordnungen, konkreten
Verbindungsentscheidungen und Grenzen. Alle 19 binären Kriterien sind
verpflichtend; andere Themen können eine fehlende Netzschutzleistung nicht
ausgleichen.

Nur das `requires`-Array dieses einen der 19 Coverage-Ziele ändert sich. Die
übrigen 18 vollständigen Kompetenzdefinitionen, sämtliche sechs GK-Ziele,
die 19 Coverage-IDs und Reihenfolge sowie Aufgaben-, Lösungs- und Rubrikbytes
sind nachweislich unverändert. Der technische Elterncluster verfasst keine
zusätzliche Voraussetzung. Der neue Beleg bindet die alte und die neue
Definition sowie den vollständig zusammengesetzten Kandidaten; er ersetzt
keinen historischen Fingerprint und erzeugt keinen Praxisnachweis.

Roots zweiter Blick und die tatsächlichen kombinierten Schema-, Graph-,
Scope-, Applicability- und QA-Prüfungen bleiben Voraussetzung der Anwendung.
Dies ist keine menschliche Erprobung, Netzwerk-Ausführung, neue amtliche
Quellenfreigabe oder Meilensteinbestätigung.
