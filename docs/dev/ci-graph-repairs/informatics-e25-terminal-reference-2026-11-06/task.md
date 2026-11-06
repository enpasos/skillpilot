# Werkstatttag: Netz, Webanwendung und sichere Kommunikation

**Projektprüfung E25 – vollständiger fester Umfang einschließlich der LK-Kompetenz zur Paketübertragung.** Arbeiten Sie ausschließlich mit den hier erfundenen Daten. Die fertige Seite ist eine lokale Simulation: keine echten Anmeldungen, Konten, Nachrichten oder Serverzugriffe. Die Netzwerk- und Mailspuren sind vorgegebene synthetische Beobachtungen, keine Aufforderung, Verbindungen herzustellen.

Reichen Sie ein zusammenhängendes Portfolio ein: Antworten A01–A25, vollständigen HTML/CSS/JavaScript-Quelltext, tatsächlich unterscheidbare Versionsstände, Testprogramme und beobachtete Ausgaben sowie Ihre Präsentation. Beginnen Sie mit der Planung A12/A25, bevor Sie die Anwendung schrittweise bauen. Aufgaben und normale Bewertung bilden einen einzigen Prüfungsabschluss. Für jedes der 25 Kriterien gibt es einen Punkt ausschließlich bei vollständig erbrachter Leistung; erforderlich sind 25 von 25 Punkten. Es gibt keine zusätzlichen gespeicherten Teilabschlüsse. Eine feste Bearbeitungszeit wird für diese umfangreiche Projektprüfung nicht behauptet.

## Materialien

### M0 – Auftrag und tatsächlich verfügbare Produktanforderungen

Die Schul-AG möchte für ihren Werkstatttag eine überprüfbare lokale Demonstration erstellen. Die folgenden Aussagen gehören zum Auftrag; Annahmen darüber hinaus sind kenntlich zu machen.

- **AG-Leitung:** „Die drei Angebote aus M4 sollen mit ihren anfänglich freien Plätzen sichtbar sein. Nach einer erfolgreichen lokalen Reservierung sollen die angezeigten freien Plätze zum neuen Zustand passen. Bei einem Fehler darf die Belegung nicht geändert werden.“
- **Sekretariat:** „Wir brauchen einen erfundenen Namen, eine erfundene E-Mail-Adresse, ein gewähltes Angebot und eine Anzahl von 1 bis 6 ganzen Plätzen. Ein gesetztes Kontrollkästchen bestätigt die ausschließliche Verwendung von Testdaten. Unbekannte Angebote und ungültige Eingaben werden abgewiesen. Die Demonstration sendet nichts ab und speichert keine Daten dauerhaft.“
- **Kassen-Team:** „Ein Platz kostet 3,00 EUR. Ab vier Plätzen in derselben Anfrage werden einmalig 2,00 EUR Gruppenrabatt vom Gesamtpreis abgezogen. Eine erfolglose Anfrage reserviert nichts. Der Rabatt hängt von der angefragten Anzahl ab, nicht von früheren Anfragen.“
- **Besuchervertretung:** „Die Seite soll bei 320 Pixeln nutzbar sein und alle Angebote untereinander zeigen. Ab 768 Pixeln sollen drei gleich breite Angebotskarten nebeneinander stehen. Navigation, Beschriftungen, sichtbarer Tastaturfokus und verständliche Rückmeldungen sind wichtig.“
- **Projektbetreuung:** „Dokumentieren Sie mindestens drei tatsächlich unterschiedliche sinnvolle Entwicklungsstände und deren geprüfte Funktionen. Eine Sammlung umbenannter identischer Dateien ist kein inkrementeller Prototyp. Wählen und begründen Sie geeignete Werkzeuge. Diskutieren Sie die Qualität anhand nachvollziehbarer Belege und benennen Sie verbleibende Nachweislücken.“

Der Auslieferungsumfang ist ein selbstständiges HTML-Dokument mit eingebettetem CSS und JavaScript oder ein gleichwertiger vollständiger lokaler Dateisatz. Zur fachlichen Abgabe gehören die Quelldateien, nicht nur Bildschirmbilder. Ein Browser darf lokal zum Arbeiten verwendet werden; Netzwerkverbindungen sind für die Aufgabe nicht erforderlich. Node/Python oder vergleichbare lokale Werkzeuge dürfen für reproduzierbare Tests verwendet werden. Halten Sie tatsächlich ausgeführte Prüfungen und bloße Erwartungen auseinander.

### M1 – Konkretes Netzmodell und Dienstbeobachtungen

```text
Laptop L1 (10.10.0.10/24) -- WLAN -- AP1 -- Switch S1 -- Webserver W (10.10.0.20/24)
                                              |       DNS D (10.10.0.53/24)
                                              |       Drucker P (10.10.0.30/24)
                                              +---- Router R (LAN: 10.10.0.1/24) ---- externes Schulnetz
```

AP1 verbindet das WLAN mit dem lokalen Netz; S1 verbindet die lokalen Geräte. Das externe Schulnetz enthält den Maildienst aus M2. Die externe Weiterleitung ist für diese Aufgabe vorgegeben; eine NAT-Konfiguration ist nicht zu entwerfen.

| Beobachtung | Konkreter Inhalt |
| --- | --- |
| DNS-Anfrage | L1 fragt D: `A werkstatt.schule.test` |
| DNS-Antwort | `werkstatt.schule.test A 10.10.0.20`, TTL 300 Sekunden |
| TCP-Verbindungsaufbau | `10.10.0.10:51514 → 10.10.0.20:443 SYN`; Antwort `SYN,ACK`; abschließend `ACK` |
| Verbindungsschutz | Für diesen Webdienst ist ein authentisierter TLS-Kanal vorgegeben; er wird hier nicht selbst implementiert oder durch einen echten Mitschnitt nachgewiesen. |
| Am Endpunkt entschlüsselte HTTP-Anfrage | `GET /angebote?kurs=robotik HTTP/1.1`, `Host: werkstatt.schule.test` |
| HTTP-Antwort | `HTTP/1.1 200 OK`, `Content-Type: application/json`, Nutzdaten: `{"id":"robotik","capacity":6,"reserved":3}` |

Die HTTP-Zeilen sind eine Darstellung **nach** der Entschlüsselung am Endpunkt. Sie sind keine Behauptung, dass derselbe Klartext außerhalb des TLS-Endpunkts auf dem Netz lesbar wäre.

### M2 – Vollständiger vereinfachter SMTP-Dialog und zugehöriges Log

Der zweite Dienst ist absichtlich ein anderes Modell: eine **unverschlüsselte** Laborverbindung zum Mailserver. `C` bezeichnet den Client, `S` den Server. Alle Namen und Zugangsdaten sind synthetische Testdaten.

```text
S: 220 mail.schule.test ESMTP
C: EHLO client.schule.test
S: 250-mail.schule.test
S: 250 AUTH PLAIN
C: AUTH PLAIN AGFndXNlcgBkZW1vLXBhc3M=
S: 235 Authentication successful
C: MAIL FROM:<schulleitung@schule.test>
S: 250 Sender accepted
C: RCPT TO:<sekretariat@schule.test>
S: 250 Recipient accepted
C: DATA
S: 354 End data with <CRLF>.<CRLF>
C: Subject: Werkstatttag
C:
C: Die lokale Demonstration ist bereit.
C: .
S: 250 Queued as LAB-17
C: QUIT
S: 221 Bye
```

Für `AUTH PLAIN` ist die Bytefolge `NUL + Benutzername + NUL + Passwort` Base64-codiert. Ein `NUL` ist Byte 0. Die Zeichenfolge ist keine Verschlüsselung. Diese Erklärung gibt das Datenformat vor, nicht die dekodierten Werte oder die Bewertung der Beobachtung.

```text
09:00:00Z AUTH_FAIL session=s17 user=aguser src=198.51.100.77
09:00:02Z AUTH_FAIL session=s17 user=aguser src=198.51.100.77
09:00:04Z AUTH_FAIL session=s17 user=aguser src=198.51.100.77
09:00:08Z AUTH_OK   session=s17 user=aguser src=198.51.100.77
09:00:10Z MAIL_ACCEPT session=s17 envelopeFrom=schulleitung@schule.test queue=LAB-17
```

Es gibt hier keine weitere Rollen-/Absenderberechtigungsregel und keine Aussage darüber, wem die Quelladresse tatsächlich gehört. Folgern Sie daher weder einen bewiesenen Einbruch noch eine bewiesene Versandberechtigung allein aus einem Statuscode.

### M3 – Vorgegebener HTML-Ausschnitt zur Strukturanalyse

```html
<section id="beispiel">
  <h2>Hinweise</h2>
  <ul>
    <li><span>Robotik</span></li>
    <li><span>Medienlabor</span></li>
  </ul>
  <p>Nutzen Sie ausschließlich Testdaten.</p>
</section>
```

Dies ist ein Analyseausschnitt, keine vollständige Lösung für die von Ihnen zu erstellende Seite. Die Angebotskarten und das Formular aus M0/M4 müssen Sie selbst strukturieren und implementieren.

### M4 – Vollständige Ausgangsdaten der Anwendung

| ID | Angebot | Kapazität | Schon reserviert |
| --- | --- | ---: | ---: |
| `robotik` | Robotik | 6 | 3 |
| `medien` | Medienlabor | 4 | 4 |
| `laser` | Licht und Laser | 5 | 1 |

```javascript
const courses = [
  { id: 'robotik', title: 'Robotik', capacity: 6, reserved: 3 },
  { id: 'medien', title: 'Medienlabor', capacity: 4, reserved: 4 },
  { id: 'laser', title: 'Licht und Laser', capacity: 5, reserved: 1 }
];
```

Als normaler Eingabefall stehen `Jana Jung`, `jana@example.test`, Angebot `robotik`, Anzahltext `"2"` und ein gesetztes Testdatenkästchen bereit. Entwickeln Sie zusätzliche Grenz- und Fehlerfälle selbst. Die ursprünglichen Daten müssen für jeden unabhängigen Test neu hergestellt werden.

### M5 – Tatsächlich vorgegebener alter Programmcode

```javascript
export function reserveV0(course, places) {
  const free = course.capacity - course.reserved;
  if (places >= free) {
    course.reserved = places;
    return true;
  }
  return false;
}
export function priceV0(places) { return 300 * places; }
```

`priceV0` rechnet in Cent und bildet den alten Tarif ohne Rabatt ab. `reserveV0` ist fehlerhaft. Untersuchen und verändern Sie diesen vorgegebenen Code nachvollziehbar, statt lediglich eine unverbundene neue Datei mit einem behaupteten Ergebnis abzugeben. Weitere von Ihnen benötigte Funktionen und deren Zerlegung sind nicht vorgegeben.

### M6 – Exakte klassische Kryptodaten und moderne Einsatzfälle

In den Rechenbeispielen gibt es ausschließlich `A` bis `Z`, ohne Leerzeichen oder Umlaute. `A=0,…,Z=25`; alle Additionen werden modulo 26 ausgeführt. Bei Caesar gilt `C=P+k`. Bei Vigenère wird der Schlüssel periodisch wiederholt und `C_i=P_i+K_i` gerechnet. Diese Verfahren sind Laborbeispiele, keine Wahl für echten Schutz personenbezogener Daten.

| Fall | Gegebene Daten | Gesuchte eigene Leistung |
| --- | --- | --- |
| C1 | Klartext `TREFFENAMTOR`, Caesar-Schlüssel 5 | Verschlüsseln und Kontrollentschlüsselung |
| C2 | Caesar-Geheimtext `CANOONWDVINQW`, Schlüssel unbekannt | Angriff, begründete Schlüsselauswahl und Klartext |
| C3 | Klartext `SCHULTAG`, Vigenère-Schlüssel `UNI` | Verschlüsseln und Kontrollentschlüsselung |
| C4 | Vigenère-Geheimtext `ATJERAUTDRUYOZFK`; Schlüsselperiode 3; bekanntes Klartextpräfix `ANMELDUNG` | Schlüssel rekonstruieren, Präfix prüfen und vollständigen Text entschlüsseln |

Für die Bewertung moderner Kryptografie stehen drei konkrete Situationen bereit:

1. Die spätere echte Veranstaltungsseite soll Namen und E-Mail-Adressen von einem offenen WLAN an den Schulserver übertragen. Es ist zu entscheiden, was ein authentisierter verschlüsselter Transport schützen kann und was er nicht löst.
2. Ein Softwarepaket und dessen SHA-256-Wert werden von **derselben** möglicherweise manipulierten Downloadseite angeboten. Das Sekretariat kann einen öffentlichen Verifikationsschlüssel über einen davon unabhängigen authentischen Weg verteilen. Bewerten Sie Hashvergleich und digitale Signatur sowie die Abhängigkeit vom richtigen Schlüssel.
3. Eine echte Teilnehmerliste könnte auf einem gestohlenen Laptop liegen. Eine Verschlüsselungsdatei und deren ungeschützter Entschlüsselungsschlüssel befinden sich auf demselben Datenträger. Bewerten Sie die Schutzwirkung und nennen Sie Bedingungen und verbleibende Risiken.

### M7 – Konkretes Paketmodell für den vollständigen E25-/LK-Vertrag

Eine separate Laboranwendung überträgt auf einer bereits aufgebauten TCP-Verbindung innerhalb des LAN den ASCII-Nutztext `TERMINE2026OK!`. Diese Verbindung ist nicht der TLS-Webmitschnitt aus M1. Die erste Nutzbyte-Sequenznummer ist 1001; ein Segment enthält höchstens fünf Nutzbytes. Segmente treffen in der Reihenfolge **3, 1, 2** ein; es gibt keine Verluste. Der Empfänger puffert außereinander eintreffende Bytes und bestätigt kumulativ immer die Nummer des nächsten noch fehlenden Nutzbytes.

Absender ist `10.10.0.10:51000`, Empfänger `10.10.0.20:9000`. Es werden keine realen Pakete gesendet. Ein selbst verfasstes lokales Rechenprogramm darf diese Modellregeln nachvollziehen.

## Teilaufgaben und abzugebende Leistungen

**A01 – Lokales Netz (K01).** Benennen Sie die Funktionen von L1, AP1, S1, R, W, D und P. Beschreiben Sie am konkreten Abruf aus M1 die Zusammenarbeit mindestens von Client, AP/Switch, DNS und Server und den Unterschied zwischen lokaler Verbindung und Routerweg. Geben Sie nicht nur eine Komponentenliste ab.

**A02 – IP, DNS und Schichten (K02).** Erläutern Sie anhand der konkreten Adressen und Dienstnamen die Rolle von IP und DNS. Ordnen Sie DNS/HTTP, TCP, IP und die lokale Übertragung den vier Ebenen des TCP/IP-Modells zu. Erklären Sie den Unterschied zwischen Server-IP, Dienstport und Namen sowie die gekapselte Zusammenarbeit der Ebenen.

**A03 – Protokollanalyse (K03).** Analysieren Sie den vollständigen SMTP-Dialog in M2: Verbindungsbeginn, Anmeldung, Absender/Empfänger, Datenphase und Ende. Dekodieren Sie den Authentisierungstoken lokal. Diskutieren Sie mindestens zwei konkrete Sicherheitsrisiken und passende Maßnahmen samt Grenzen. Unterscheiden Sie die durch den Dialog belegte Beobachtung von bloß vermuteter Absenderberechtigung, tatsächlicher Zustellung und einem tatsächlichen Angriff.

**A04 – HTML erstellen (K04).** Erstellen Sie selbst das vollständige HTML-Dokument für M0/M4 mit sinnvoll verschachtelten semantischen Bereichen für Kopf, Navigation, Hauptinhalt, Angebote, Anmeldung und Abschluss. Jede Angebotskarte muss ein eigenständiges strukturiertes Inhaltselement sein. Vermeiden Sie eine reine Sammlung unstrukturierter `div`-Elemente.

**A05 – CSS (K05).** Implementieren und begründen Sie Selektoren und grundlegende CSS-Eigenschaften für Typografie, Abstände, Karten und Rückmeldungen. Verwenden Sie mindestens einen passend eingesetzten Klassen-, ID- und Elementselektor. Stellen Sie ihre tatsächliche Wirkung an Ihrem Produkt dar.

**A06 – Formular und Übertragung (K06).** Implementieren Sie Name, E-Mail-Adresse, Kurswahl, ganzzahlige Platzanzahl und Testdatenkästchen mit passenden Eingabeelementen und Beschriftungen. Die lokale Demo verhindert die echte Übermittlung. Stellen Sie zusätzlich für dieselben vorgegebenen synthetischen Daten je ein vollständiges nachvollziehbares GET- und POST-Beispiel dar: Ziel, URL-Parameter beziehungsweise Nachrichtentext, Content-Type und Namen der übertragenen Felder. Erklären Sie die Unterschiede und die Konsequenz für personenbezogene URL-Inhalte; POST allein ist keine Verschlüsselung.

**A07 – Datentypen, Variablen und Ein-/Ausgabe (K07).** Implementieren Sie das Einlesen und Prüfen der Formwerte in Ihrem Programm. Unterscheiden Sie ausdrücklich Anzahltext und numerische Anzahl sowie eine boolesche Bestätigung und eine Zeichenkette für den Namen. Geben Sie eine berechnete Rückmeldung aus und zeigen Sie einen tatsächlich ausgeführten gültigen und ungültigen Eingabefall.

**A08 – Objektzustände (K08).** Korrigieren und verwenden Sie die Wertzuweisungen zur lokalen Belegung. Zeigen Sie den Objektzustand des Robotikkurses vor und nach zwei nacheinander angefragten Reservierungen zu je zwei Plätzen sowie einer anschließenden Anfrage zu einem Platz. Erläutern Sie, warum ein Fehlschlag den Zustand unverändert lässt. Legen Sie die tatsächlich ausgeführten Ergebnisse Ihres korrigierten Programms vor.

**A09 – Kontrollstrukturen (K09).** Entwickeln Sie eine eigene Schleife mit Verzweigung, die aus M4 die aktuell buchbaren Angebote samt freien Plätzen ermittelt. Führen Sie sie vor und nach Ihren Zustandsänderungen aus und erklären Sie ihren Ablauf. Der Aufruf einer Bibliotheksfilterfunktion allein erfüllt diese verlangte Implementierung nicht.

**A10 – Unterprogramme (K10).** Zerlegen Sie Ihre Gesamtaufgabe sinnvoll in mindestens zwei eigene Unterprogramme über den unverändert nur zitierten V0-Code hinaus. Dokumentieren Sie Verantwortung, Parameter, Rückgabewert und konkrete Verwendung des Rückgabewerts im Aufrufer. Zeigen Sie die Aufrufzusammenhänge anhand Ihrer lauffähigen Implementierung.

**A11 – Debugging (K11).** Untersuchen Sie `reserveV0` mit selbst entwickelten Testfällen und einem tatsächlich eingesetzten Werkzeug zur Fehlersuche, beispielsweise gezielten Console-Traces plus lokalen Assertions. Lokalisieren Sie mindestens zwei verschiedene Fehler, begründen Sie Ihre Korrekturen und führen Sie dieselben Gegenfälle danach erneut aus. Nur „der Code ist falsch“ oder ein unkommentierter Ersatzcode genügt nicht.

**A12 – Projektstruktur (K12).** Leiten Sie aus den Aussagen in M0 eine priorisierte Anforderungsliste und einen eigenen Arbeitsplan mit Abhängigkeiten ab. Wählen und begründen Sie Werkzeuge für Entwicklung, Versionsstände, Tests und Präsentation. Halten Sie Ihre Entscheidungen vor der Umsetzung fest und erläutern Sie später begründete Anpassungen.

**A13 – Inkrementeller Prototyp (K13).** Geben Sie mindestens drei tatsächlich verschiedene lauffähig beziehungsweise als statischer Prototyp klar gekennzeichnete Versionen mit vollständigen Quellen ab. Dokumentieren Sie je Version den neu umgesetzten Funktionsumfang und mindestens eine konkrete Prüfung samt Ergebnis. Die Endfassung muss M0 erfüllen. Eine ausschließlich erfundene oder rückdatierte Versionsgeschichte zählt nicht.

**A14 – Ergebnispräsentation (K14).** Präsentieren Sie Ihr tatsächlich gebautes Produkt in einem nachvollziehbaren fünfteiligen Deck oder gleichwertigen dokumentierten Vortrag: Problem/Anforderungen, wesentliche Umsetzung, konkrete Demonstration eines Erfolgs und Fehlers, echte Testbefunde, Reflexion und nächste sinnvolle Verbesserung. Verwenden Sie Ihre eigenen Artefakte und unterscheiden Sie geprüfte Eigenschaften von offenen Annahmen.

**A15 – Klassische Verfahren (K15).** Bearbeiten Sie **alle vier** Fälle C1–C4 in M6. Zeigen Sie nachvollziehbare Rechnungen oder ein eigenes kurzes Programm, Kontrollschritte und die bei den Angriffen hergeleiteten Schlüssel. Ein bloß angegebener Klartext genügt nicht; sowohl monoalphabetisches als auch polyalphabetisches Anwenden und Brechen müssen erkennbar sein.

**A16 – Angriffe einordnen (K16).** Demonstrieren Sie am Material den Suchraumangriff auf Caesar und den bekannten-Klartext-Angriff auf den periodischen Schlüssel. Erklären Sie die ausgenutzte Schwäche und vergleichen Sie den Suchraum bei unbekanntem dreibuchstabigem Schlüssel mit der konkreten Information aus C4. Benennen Sie eine Grenze Ihres jeweiligen Angriffsnachweises; schließen Sie nicht aus einem Laborbeispiel auf das Brechen moderner Kryptografie.

**A17 – Moderne Kryptografie (K17).** Bewerten Sie alle drei modernen Situationen aus M6. Beschreiben Sie jeweils ein passendes Schutzverfahren, die nötige Schlüssel-/Vertrauensannahme und mindestens eine verbleibende Grenze. Unterscheiden Sie insbesondere Transportverschlüsselung, nachweisbare Herkunft/Integrität und den Schutz gespeicherter Daten.

**A18 – Authentisierung und Logs (K18).** Korrelieren Sie Dialog und Log aus M2 über Session/Queue. Trennen Sie Anmeldung, Absenderberechtigung und Beobachtung im Log. Nennen Sie eine begründete Reaktion auf das auffällige Muster sowie notwendige weitere Klärung; erläutern Sie die Risiken des unverschlüsselten Dienstes und eines übermäßig datenreichen oder ungeschützten Logs. Ein behaupteter sicher bewiesener Einbruch zählt nicht als korrekte Logauswertung.

**A19 – Dokumentbaum (K19).** Modellieren Sie den vollständigen Elementbaum von M3 mit Eltern-/Kindbeziehungen. Fügen Sie gedanklich innerhalb des ersten `span` ein `strong`-Element für einen neuen hervorgehobenen Teiltext ein und zeichnen Sie die neue Verschachtelung. Übertragen Sie das Prinzip auf einen eigenen Kartenausschnitt aus A04; liefern Sie dessen passenden Quelltext und Baum.

**A20 – Responsive Gestaltung (K20).** Implementieren Sie das Layout aus M0 mit CSS-Grid oder Flexbox. Erklären Sie den konkreten Umschaltpunkt und die Regeln für 320 und 1024 Pixel. Prüfen Sie mit den verfügbaren Werkzeugen auf Bedienbarkeit und horizontales Überlaufen und dokumentieren Sie, welche Eigenschaften Sie tatsächlich beobachtet haben. Eine nur behauptete visuelle Browserprüfung ist kein Nachweis.

**A21 – Teststrategie (K21).** Planen und dokumentieren Sie eine echte Testreihe mit Normal-, Grenz-, Fehler- und Wiederholungsfällen für Formular, Belegung, Tarif und Anzeige. Nennen Sie Ausgangszustand, Eingabe, begründete Erwartung, beobachteten Wert und verwendetes Werkzeug. Mindestens ein fehlgeschlagener Test der alten Version und die erfolgreiche Wiederholung nach der Korrektur gehören dazu. Trennen Sie Zustands-/Programmlogiktests von Dokumentstruktur- oder tatsächlichen Browserprüfungen.

**A22 – Gegebenen Code anpassen (K22).** Entwickeln Sie `priceV0` gezielt zum Tarif aus M0 weiter. Halten Sie die Cent-Rechnung bei und stellen Sie die Änderung am gegebenen Code dar. Prüfen Sie mindestens die Anfragen zu 1, 3, 4 und 6 Plätzen und eine ungültige Anzahl. Zeigen Sie, dass die Anwendung die angepasste lauffähige Funktion tatsächlich verwendet.

**A23 – Adressierung und Segmentierung (K23).** Ermitteln Sie aus M7 die Nutzdaten und Sequenznummer jedes Segments, die Ankunftsfolge und die drei kumulativen ACK-Werte. Erklären Sie anhand dieses Beispiels Adressierung über IP/Ports, Segmentierung, Pufferung und Wiederzusammensetzung; begründen Sie, warum die ursprüngliche Nachricht trotz anderer Ankunftsreihenfolge erhalten bleibt. Diese Aufgabe gehört verbindlich zum vollen E25-/LK-Umfang.

**A24 – Softwarequalität (K24).** Bewerten Sie die eigene Endfassung entlang Funktionalität, Zuverlässigkeit, Benutzbarkeit, Effizienz, Änderbarkeit und Übertragbarkeit. Geben Sie je Kriterium mindestens einen konkreten Produkt-/Testbeleg und eine begründete Aussage oder offene Grenze an. Reine Lobwörter ohne Bezug zu Ihrem Code oder Ihren tatsächlichen Prüfungen genügen nicht.

**A25 – Pflichtenheft (K25).** Ermitteln und dokumentieren Sie aus M0 ein prüfbares Pflichtenheft mit Ziel/Nichtziel, funktionalen und nichtfunktionalen Anforderungen, Schnittstellen/Daten und Abnahmekriterien. Kennzeichnen Sie Annahmen und klären Sie widersprüchliche oder unpräzise Aussagen durch begründete, überprüfbare Festlegungen. Binden Sie die Abnahmekriterien an konkrete Produkt- und Testartefakte Ihrer Abgabe.
