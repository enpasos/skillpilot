# Schul-AG: Einen Webabruf erklären und absichern

Dies ist ein abgeschlossener Modellfall. Alle Adressen, Namen, Personenkennungen und Tokens sind erfunden. Es werden keine fremden Systeme angesprochen. Die Netze sind in der Zeichnung bereits korrekt verbunden; Subnetzberechnungen, Paketzerlegung, Kryptoverfahren und Serverimplementierung sind nicht verlangt.

## Material N1: Netz und Dienst

```text
Schul-LAN                              andere Netze
Notebook A ── Switch S ── Router R ── Internet ── Webserver W
                 │                       └────── DNS-Server D
             Drucker P

A: 192.0.2.10   P: 192.0.2.20   R im Schul-LAN: 192.0.2.1
D: 198.51.100.53               W: 203.0.113.20
```

Der Browser auf A soll `http://ag.schule.test/status` öffnen. Die Browser- und Betriebssystem-Caches sind leer. Für diesen Fall antwortet D auf die DNS-Anfrage nach `ag.schule.test` mit `203.0.113.20`. Anschließend besteht eine TCP-Verbindung von A zu Port 80 auf W. Die lokale Kabelverbindung verwendet Ethernet. Die DNS-Anfrage verwendet hier UDP. Diese Annahmen gelten nur für den Modellfall.

W bietet den Dienst „freie AG-Plätze anzeigen“ an. Ein fiktiver, vorher ausgegebener Bearer-Token wird als Zugangsberechtigung geprüft. W akzeptiert `DEMO-NUR-AUFGABE`; ohne akzeptierten Token liefert W `401 Unauthorized`. Besitz dieses Tokens ist keine verlässliche Identifikation einer bestimmten Person.

## Material N2: Vollständiger fachlich relevanter Ausschnitt

Die folgenden Zeilen wurden nach Aufbau der Verbindung aufgezeichnet. Nicht abgedruckte Transportdetails sind nicht Gegenstand der Aufgabe.

```http
GET /status HTTP/1.1
Host: ag.schule.test
Authorization: Bearer DEMO-NUR-AUFGABE

HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Connection: close

Freie AG-Plaetze: 4
```

Danach enthält das Serverlog folgende Zeile:

```text
10:00:01 client=192.0.2.10 path=/status status=200 token=DEMO-NUR-AUFGABE
```

Der Modellabruf verwendet unverschlüsseltes HTTP. Eine Person mit Zugriff auf die entsprechende unverschlüsselte Übertragungsstrecke kann diese Anwendungsdaten mitlesen. Die Administrationsgruppe kann das Serverlog lesen.

## Arbeitsauftrag

1. Erklären Sie am gezeichneten Abruf die Aufgaben von Notebook/Browser, Switch, Router, DNS-Server und Webserver. Unterscheiden Sie einen Weg zum lokalen Drucker von einem Weg zum Webserver. (3 Kriterien)
2. Erklären Sie den Unterschied zwischen Domainname und IP-Adresse und die DNS-Auflösung im Fall. Ordnen Sie HTTP und DNS, TCP und UDP, IP sowie Ethernet den vier Schichten des TCP/IP-Modells zu. Erklären Sie an diesem Abruf, weshalb DNS allein noch keine Webseite liefert. (3 Kriterien)
3. Erläutern Sie Dienst, Protokoll und Client-/Serverrolle am Ausschnitt. Interpretieren Sie Pfad, Status `200` und Nutzdaten. Sagen Sie begründet voraus, was W laut Material bei einem fehlenden Token liefert. (3 Kriterien)
4. Erläutern Sie zwei verschiedene Risiken: das Mitlesen des HTTP-Abrufs und das gespeicherte Token im Log. Nennen Sie jeweils eine passende Gegenmaßnahme und eine Grenze dieser Maßnahme. Beurteilen Sie die Aussage: „Status 200 beweist, welche Person den Abruf ausgelöst hat.“ (3 Kriterien)

Abgabe: beschriftete Netzskizze oder eindeutige Textzuordnung, Schichtentabelle und begründete Antworten. Jede richtige gleichwertige Darstellung ist zulässig. Ein Detailfehler wird nicht allein wegen unüblicher Formulierung unterstellt.
