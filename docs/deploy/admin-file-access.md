# Direkter Admin-Zugriff auf die Serverkonfiguration

Die Gruppe `skillpilot-admin` erlaubt dem ausdrücklich berechtigten
`admin2735`, die bestehende `/etc/skillpilot/skillpilot.env` über WinSCP zu
lesen und direkt zu bearbeiten. Die Datei gehört weiterhin Root. Diese
Gruppe ist für vertrauenswürdige Serveradministratoren bestimmt: Ihre
Mitglieder können alle Werte der gemeinsamen Backend-Konfiguration lesen
und ändern. Eine Mitgliedschaft in `wheel` allein gewährt diesen direkten
Dateizugriff nicht.

Die aktualisierten Deploymentprüfungen müssen vor der Rechteänderung auf dem
Server liegen. Sie akzeptieren weiterhin das Standardprofil `root:root 0600`
und zusätzlich ausschließlich dieses Admin-Profil am kanonischen Pfad:

| Pfad | Eigentümer und Gruppe | Modus |
| --- | --- | --- |
| `/etc/skillpilot` | `root:skillpilot-admin` | `0750` |
| `/etc/skillpilot/skillpilot.env` | `root:skillpilot-admin` | `0660` |

Als `admin2735` in der Serverkonsole ausführen:

```bash
sudo groupadd --system --force skillpilot-admin
sudo usermod -aG skillpilot-admin admin2735
sudo chown root:skillpilot-admin /etc/skillpilot /etc/skillpilot/skillpilot.env
sudo chmod 0750 /etc/skillpilot
sudo chmod 0660 /etc/skillpilot/skillpilot.env
sudo python3 -I /home/enpasos/skillpilot/scripts/lib/service_environment_permissions.py /etc/skillpilot/skillpilot.env
sudo -u admin2735 test -r /etc/skillpilot/skillpilot.env
sudo -u admin2735 test -w /etc/skillpilot/skillpilot.env
```

Die Prüfungen geben keine Dateiinhalte aus. Anschließend SSH und WinSCP
vollständig trennen und als `admin2735` neu verbinden, damit die neue
Gruppenmitgliedschaft in der Sitzung wirksam wird. In WinSCP den absoluten
Pfad `/etc/skillpilot/skillpilot.env` öffnen.

Das Verzeichnis bleibt für die Gruppe nicht schreibbar. Dateien direkt
überschreiben; eine WinSCP-Übertragung mit temporärem Dateinamen oder dem
Versuch, Dateirechte beziehungsweise Zeitstempel zu setzen, kann deshalb
zusätzliche Fehler melden. In diesem Fall diese Übertragungsoptionen für
die Verbindung deaktivieren, statt Verzeichnisrechte zu erweitern.

Die Befehle ändern nur die beiden genannten Pfade. Unterverzeichnisse wie
`openai-mtls` und andere Secret-Dateien behalten ihre bisherigen Rechte.
Weder Spring Boot noch Nginx benötigen für diese Dateirechte einen Neustart.
Inhaltliche Änderungen an der EnvironmentFile übernimmt der Dienst dagegen
erst beim nächsten kontrollierten Neustart.

Das getrennt installierte Claude-Notfallwerkzeug prüft weiterhin sein
ursprüngliches Secret-Profil. Vor dessen Plan-/Execute-Schritten die Datei
vorübergehend auf `root:root 0600` zurücksetzen, wie im
[Restricted Revocation Tool Contract](claude-support-readiness-runbook.md#restricted-revocation-tool-contract)
beschrieben. Seine installierten Bytes werden durch diese Einrichtung nicht
verändert.

Den direkten Admin-Dateizugriff bei Bedarf wieder entfernen:

```bash
sudo chown root:root /etc/skillpilot/skillpilot.env /etc/skillpilot
sudo chmod 0600 /etc/skillpilot/skillpilot.env
sudo chmod 0700 /etc/skillpilot
sudo gpasswd -d admin2735 skillpilot-admin
```
