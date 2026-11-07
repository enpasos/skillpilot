# Vollständige Musterlösung zum eigenständigen GK24-Draft

Diese Referenz gehört zum neuen 24er-Vertrag. Sie erteilt keine Freigabe, wertet keine alte 25er-Leistung um und ist kein Nachweis eines Lernerfolgs. Alle Materialien und Lösungen stehen hier vollständig; eine eigenständige Lernendenleistung darf nicht aus dem bloßen Kopieren der Musterlösung abgeleitet werden.

Die Web-/Kryptobausteine wurden aus dem gesondert geprüften LK-Entwurf übernommen und für diesen anderen Umfang fachlich abgegrenzt. Dessen alte Ausführungsbelege bleiben historisch und unverändert. **Für diesen GK24-Draft gibt es noch keinen eigenen Autor-Referenzlauf.** Zahlen in den folgenden Tabellen sind berechnete Sollwerte, bis eine eigene Ausführung sie als Beobachtung belegt. Lernende müssen die in A07/A08/A11/A13/A20/A21/A22 verlangten eigenen Ausführungen/Prozessbelege tatsächlich liefern.

## S01 – Komponenten und Zusammenspiel (A01/G01)

L1 ist der Client: Er fordert einen Dienst an und zeigt dessen Ergebnis. AP1 verbindet die WLAN-Station mit dem lokalen Netz. S1 vermittelt lokale Ethernet-Verbindungen zwischen den angeschlossenen Geräten. W liefert die Angebotsdaten als Webserver. D beantwortet die Namensauflösung. P ist ein nutzbarer Netzdrucker, aber am gegebenen Webabruf nicht beteiligt. R verbindet unterschiedliche Netze; über ihn könnte der externe Maildienst erreicht werden.

L1 fragt zunächst den DNS-Dienst D nach `werkstatt.schule.test` und erhält `10.10.0.20`. Anschließend baut der Client über AP1 und S1 die Verbindung zum Server W auf. Beide liegen im angegebenen `/24`-Netz `10.10.0.0/24`; der lokale Webweg benötigt deshalb R nicht als Weiterleitungsstation. Die vorgegebenen DNS- und Webdaten sind verschiedene Dienste. W verarbeitet die entschlüsselte HTTP-Anfrage und liefert die Angebotsdaten; L1 kann daraus zum Beispiel die drei freien Robotikplätze anzeigen. Ein Abruf des externen Maildiensts hätte dagegen einen Weg über R. Die Skizze verlangt weder eine eigene NAT-Konfiguration noch die Verwendung des Druckers als Zwischenstation.
## S02 – IP, DNS und vier Diensteebenen (A02/G02)

| Ebene | Konkrete Elemente | Eigene geforderte Erklärung |
| --- | --- | --- |
| Anwendung | DNS-Abfrage/Antwort, HTTP-GET, JSON-Nutzdaten | DNS löst den Namen auf; HTTP beschreibt die Anforderung und die Bedeutung der Antwort. |
| Transport | TCP-Verbindung; Clientport 51514, Serverport 443 | Die Ports ordnen die Verbindung den beteiligten Anwendungen zu. Der geordnete zuverlässige Bytestrom ist in M1 gegeben. |
| Internet | 10.10.0.10 und 10.10.0.20 | Die IP-Adressen kennzeichnen die Netzendpunkte; Routing verbindet unterschiedliche Netze. |
| Netzzugang | WLAN/AP1, lokale Verbindung über S1 | Diese Ebene trägt den jeweils benutzten lokalen Übertragungsweg. |

Der DNS-Name ist keine IP-Adresse und kein Dienstport. L1 erhält hier zu `werkstatt.schule.test` die Serveradresse `10.10.0.20` und benutzt danach den Webdienst am Port 443. Die Anwendung nutzt TCP, TCP nutzt die IP-Funktion und diese den jeweiligen Netzzugang; am Ziel steht das Ergebnis dem passenden Dienst zur Verfügung. Das erklärt die vier Rollen und ihr Zusammenwirken, ohne die innere Realisierung des gegebenen Transportdienstes zu prüfen. Der lokale `/24`-Weg und der Routerweg werden in S01 unterschieden. Die HTTP-Darstellung stammt nach Entschlüsselung vom Endpunkt. Aus dem Material folgt weder ein sichtbarer HTTP-Klartext außerhalb des TLS-Endpunkts noch ein konkreter hier nicht angegebener DNS-Transport. Keine Segment-, ACK- oder Rekonstruktionsrechnung ist Teil dieser Leistung.
## S03 – SMTP-Analyse (A03/G03)

`220` begrüßt den Client; `EHLO` und die `250`-Zeilen geben die angebotenen Möglichkeiten an. `AUTH PLAIN` überträgt hier den Base64-Token, `235` meldet die erfolgreiche Anmeldung. Lokal dekodiert ergibt er die Bytes `NUL aguser NUL demo-pass`, also Benutzer `aguser` und Passwort `demo-pass`. Base64 ist eine reversible Codierung und schützt diese Daten nicht vor Mitlesen.

`MAIL FROM` setzt den Envelope-Absender, `RCPT TO` den Empfänger. `DATA` und `354` eröffnen die Nachricht; Header, Leerzeile und Text folgen. Der einzelne Punkt beendet diese Datenphase. `250 Queued as LAB-17` belegt die Annahme in die Warteschlange dieses Servers. `QUIT`/`221` beendet die Sitzung. Daraus folgt weder schon die endgültige Zustellung beim Empfänger noch die Berechtigung des Benutzers, im Namen der Schulleitung zu senden. Die Aufgabe enthält dazu keine Rollenregel.

Risiko 1: Die unverschlüsselte Verbindung gibt Token und Nachricht an einen Mitleser preis. Ein authentisierter verschlüsselter Transport mit korrekt geprüftem Server schützt den Transport; ein kompromittierter Endpunkt bleibt dennoch ein Risiko. Risiko 2: Ein angemeldeter Benutzer könnte ohne passende Absenderregel unzulässige Envelope-Absender setzen. Eine serverseitige Zuordnung und Prüfung der erlaubten Absender wäre nötig; der vorliegende Dialog beweist weder ihr Vorhandensein noch ihr Fehlen. Zusätzlich helfen begrenzte Anmeldeversuche und sichere Zugangsdaten gegen Missbrauch; sie ersetzen keine Transportverschlüsselung. Das angegebene Log ist ein Untersuchungsanlass, kein Beweis eines erfolgreichen Einbruchs.
## S04 – Vollständiges selbst erstelltes Dokument (A04/G04)

Die folgende Endfassung ist als einzelne lokale HTML-Datei verwendbar. `header` enthält Einleitung und Navigation; `main` die zwei inhaltlichen Abschnitte; drei `article`-Elemente gliedern die Angebote; `footer` benennt den Modellkontext. Die `div.cards` ist nur der Layoutcontainer, nicht Ersatz für die semantische Gliederung. Die Seite benutzt ausschließlich erfundene Daten. Ihr Script verhindert das Abschicken des Formulars; es enthält weder einen Netzaufruf noch dauerhafte Speicherung.

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Werkstatttag – lokale Demo</title>
  <style>
    body { margin: 0; font: 1rem/1.5 system-ui, sans-serif; color: #172033; background: #f5f7fa; }
    header, footer { background: #173657; color: white; padding: 1rem; }
    nav a { color: inherit; margin-right: 1rem; }
    main { max-width: 70rem; margin: auto; padding: 1rem; }
    .cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
    .card { min-width: 0; background: white; border: 1px solid #566577; border-radius: .4rem; padding: 1rem; }
    label { display: block; margin-top: .8rem; }
    input, select, button { font: inherit; max-width: 100%; box-sizing: border-box; }
    button { margin-top: 1rem; padding: .5rem 1rem; }
    :focus-visible { outline: 3px solid #a74d00; outline-offset: 2px; }
    #status { padding: 1rem; border-left: .3rem solid #173657; background: white; }
    @media (min-width: 768px) { .cards { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  </style>
</head>
<body>
<header><h1>Werkstatttag</h1><p>Nur lokale Demo mit erfundenen Testdaten; keine Anmeldung wird übertragen.</p>
  <nav aria-label="Seitennavigation"><a href="#angebote">Angebote</a><a href="#anmeldung">Demo-Anmeldung</a></nav>
</header>
<main>
  <section id="angebote" aria-labelledby="angebote-titel"><h2 id="angebote-titel">Unsere Werkstätten</h2>
    <div class="cards">
      <article class="card"><h3>Robotik</h3><p>Motoren und Sensoren erproben.</p><p>Frei: <span data-free-for="robotik">3</span> von 6.</p></article>
      <article class="card"><h3>Medienlabor</h3><p>Kurze Hörstücke gestalten.</p><p>Frei: <span data-free-for="medien">0</span> von 4.</p></article>
      <article class="card"><h3>Licht und Laser</h3><p>Lichtwege untersuchen.</p><p>Frei: <span data-free-for="laser">4</span> von 5.</p></article>
    </div>
  </section>
  <section id="anmeldung"><h2>Reservierung simulieren</h2>
    <p>3,00 EUR je Platz; ab vier Plätzen einmalig 2,00 EUR Gruppenrabatt. Eine Anfrage umfasst 1 bis 6 ganze Plätze.</p>
    <form id="booking" action="/anmeldung" method="post">
      <label for="name">Erfundener Name</label><input id="name" name="name" autocomplete="off" required>
      <label for="email">Erfundene E-Mail-Adresse</label><input id="email" name="email" type="email" autocomplete="off" required>
      <label for="course">Werkstatt</label><select id="course" name="course"><option value="robotik">Robotik</option><option value="medien">Medienlabor</option><option value="laser">Licht und Laser</option></select>
      <label for="places">Plätze</label><input id="places" name="places" type="number" min="1" max="6" step="1" value="1" required>
      <label><input id="testdata" name="testdata" type="checkbox" required> Ich benutze ausschließlich erfundene Testdaten.</label>
      <button type="submit">Lokal prüfen</button>
    </form>
    <p id="status" role="status">Noch keine lokale Reservierung.</p>
  </section>
</main>
<footer><p>Schul-AG – Modellprodukt für eine Informatikprüfung.</p></footer>
<script>
const initialCourses = () => [
  { id: 'robotik', title: 'Robotik', capacity: 6, reserved: 3 },
  { id: 'medien', title: 'Medienlabor', capacity: 4, reserved: 4 },
  { id: 'laser', title: 'Licht und Laser', capacity: 5, reserved: 1 },
];
function priceCents(places) {
  if (!Number.isInteger(places) || places < 1 || places > 6) throw new RangeError('1 bis 6 ganze Plätze');
  return 300 * places - (places >= 4 ? 200 : 0);
}
function available(course) { return course.capacity - course.reserved; }
function reserve(course, places) {
  if (!Number.isInteger(places) || places < 1 || places > 6 || places > available(course)) return false;
  course.reserved = course.reserved + places;
  return true;
}
function availableCourses(courses) {
  const result = [];
  for (const course of courses) {
    if (available(course) > 0) result.push({ id: course.id, free: available(course) });
  }
  return result;
}
function book(courses, input) {
  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '').trim();
  const places = Number(input.places);
  const course = courses.find(candidate => candidate.id === input.course);
  if (!name || !email.includes('@') || input.confirmTestData !== true || !course
      || !Number.isInteger(places) || places < 1 || places > 6) {
    return { ok: false, message: 'Eingaben prüfen; es wurde nichts reserviert.' };
  }
  const price = priceCents(places);
  if (!reserve(course, places)) return { ok: false, message: 'Nicht genügend Plätze; es wurde nichts reserviert.' };
  return { ok: true, priceCents: price, free: available(course),
    message: `${name}: ${places} Platz/Plätze in ${course.title}; ${(price / 100).toFixed(2).replace('.', ',')} EUR; noch ${available(course)} frei.` };
}
function installForm(document, courses = initialCourses()) {
  const form = document.getElementById('booking');
  const output = document.getElementById('status');
  const renderAvailability = () => {
    for (const course of courses) document.querySelector(`[data-free-for="${course.id}"]`).textContent = String(available(course));
  };
  renderAvailability();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const field = name => form.elements.namedItem(name);
    const result = book(courses, { name: field('name').value, email: field('email').value,
      course: field('course').value, places: field('places').value,
      confirmTestData: field('testdata').checked });
    output.textContent = result.message;
    renderAvailability();
  });
  return courses;
}

installForm(document);
</script>
</body>
</html>
```
## S05 – Selektoren, Layout und Typografie (A05/G05)

Der Elementselektor `body` legt Schrift, Zeilenhöhe, Textfarbe und Hintergrund fest. `header, footer` gestalten Kopf und Abschluss einheitlich. Die Klasse `.card` steuert Rand, Innenabstand, Hintergrund und Rundung jeder Angebotskarte; `.cards` legt das gemeinsame Grid fest. Der ID-Selektor `#status` hebt genau die Ergebnisrückmeldung durch Hintergrund und linke Kante hervor. `nav a` beschränkt seine Linkgestaltung auf die Navigation. `:focus-visible` macht den Tastaturfokus sichtbar, ohne daraus bereits eine vollständige Barrierefreiheitsprüfung abzuleiten.

`main` begrenzt die Lesebreite auf 70rem und zentriert sie; `padding` lässt auf schmalen Geräten Abstand zum Rand. `box-sizing: border-box` und `max-width: 100%` begrenzen die Formelemente. `minmax(0, 1fr)` und `min-width: 0` erlauben den Karten, auf die verfügbare Breite zu schrumpfen. Schrift- und Abstandsentscheidungen sind an den tatsächlich sichtbaren Karten und Rückmeldungen überprüfbar, nicht nur als Stilwunsch formuliert.
## S06 – Formelemente und nachvollziehbare HTTP-Beispiele (A06/G06)

Die Endfassung verwendet Textfeld, E-Mail-Feld, `select`, ganzzahliges `number`-Feld, Checkbox und Submit-Schaltfläche. Die Beschriftungen sind über `for`/`id` beziehungsweise die umschließende Checkbox-Beschriftung zugeordnet. `required`, `min`, `max` und `step` unterstützen die Eingabeprüfung im Browser. Die eigene Logik prüft zusätzlich vor der Mutation. `preventDefault()` macht die aktuelle Seite zur lokalen Simulation; die folgenden HTTP-Nachrichten werden **nicht** ausgeführt.

Für die synthetischen Eingaben ist eine korrekte URL-Form-Codierung:

```text
name=Jana+Jung&email=jana%40example.test&course=robotik&places=2&testdata=on
```

Eine mögliche GET-Nachricht lautet:

```http
GET /anmeldung?name=Jana+Jung&email=jana%40example.test&course=robotik&places=2&testdata=on HTTP/1.1
Host: werkstatt.schule.test

```

GET übergibt diese Felder als Query der URL; die Anfrage hat hier keinen Body und benötigt dafür keinen `Content-Type`. Für eine zustandsändernde echte Reservierung wäre GET die falsche Methodenwahl. Das Beispiel erläutert die Übertragung, es ist keine Empfehlung für einen tatsächlichen Buchungsdienst.

```http
POST /anmeldung HTTP/1.1
Host: werkstatt.schule.test
Content-Type: application/x-www-form-urlencoded
Content-Length: 76

name=Jana+Jung&email=jana%40example.test&course=robotik&places=2&testdata=on
```

Der Body hat genau 76 ASCII-/UTF-8-Bytes ohne nachfolgendes Zeilenende. Bei POST liegen die Formdaten im Nachrichtentext. Namen und E-Mail-Adressen in einer URL können zum Beispiel in Verlauf oder URL-Logs erscheinen. POST allein verschlüsselt nichts; ohne verschlüsselten Transport ist auch sein Body lesbar. Für eine echte Anwendung wären zusätzlich serverseitige Prüfung, Autorisierung und konsistente konkurrierende Reservierungen nötig. Eine lokale JavaScript-Prüfung beweist diese Eigenschaften nicht.
## S07 – Datentypen und tatsächliche Ein-/Ausgabe (A07/G07)

`field('places').value` ist zunächst die Zeichenkette `"2"`; `Number(...)` erzeugt die Zahl 2. `Number.isInteger`, Unter- und Obergrenze verhindern eine Verwendung von `"2x"`, 0, 7 oder 1,5 als gültige Anzahl. `name` und `email` werden als Zeichenketten gelesen und getrimmt; `checked` liefert einen booleschen Wert. `course` ist nach der Auswahl ein Objekt; `reserved` und `capacity` sind Zahlen. `result` enthält einen booleschen Status, bei Erfolg Preis und freie Plätze sowie eine auszugebende Zeichenkette.

Für einen Normalfall ergibt sich folgende aus dem angegebenen Code nachvollziehbare Referenzerwartung:

```text
Eingabe: Jana Jung / jana@example.test / robotik / "2" / true
Ausgabe: Jana Jung: 2 Platz/Plätze in Robotik; 6,00 EUR; noch 1 frei.
Neuer Objektwert: reserved = 5
```

Mit `places: "2x"` lautet die Ausgabe `Eingaben prüfen; es wurde nichts reserviert.`; alle Kursobjekte bleiben im Ausgangszustand. Dasselbe ist für leeren Namen, eine offensichtlich fehlerhafte Adresse ohne `@`, einen unbekannten Kurs und eine nicht gesetzte Bestätigung zu prüfen. Diese GK24-Fassung enthält dafür noch keinen neuen Ausführungsbeleg. Die Referenzprüfung für E-Mail-Adressen ist bewusst eine einfache lokale Eingabeprüfung; sie verifiziert weder Existenz noch Zustellbarkeit einer Adresse.
## S08 – Zustandsänderungen ohne Mutation bei Fehlern (A08/G08)

Die Abgabe verwendet `course.reserved = course.reserved + places` ausschließlich nach vollständiger Prüfung. Die drei aufeinanderfolgenden Reservierungsversuche am **selben** Objekt ergeben:

| Schritt | Anfrage | reserved vorher | frei vorher | Ergebnis | reserved nachher | frei nachher |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| Start | – | 3 | 3 | – | 3 | 3 |
| 1 | 2 | 3 | 3 | erfolgreich | 5 | 1 |
| 2 | 2 | 5 | 1 | abgewiesen | 5 | 1 |
| 3 | 1 | 5 | 1 | erfolgreich | 6 | 0 |

Die zweite Anfrage verändert nichts, weil ihre Anzahl die aktuell freie Kapazität überschreitet. Die dritte füllt die Restkapazität exakt. Diese Folge ist sowohl mit lokalen Assertions als auch über das eigene Formular auszuführen; die Tabelle nennt berechnete Sollwerte und keinen neuen GK24-Beobachtungsbericht. Jede unabhängige Testfolge beginnt dagegen mit neu angelegten Ausgangsobjekten; sonst würde ein früherer Test den nächsten verfälschen.
## S09 – Eigene Schleife und Verzweigung (A09/G09)

`availableCourses` aus S04 durchläuft jedes Kursobjekt mit `for...of`, berechnet die freien Plätze und fügt nur bei `free > 0` einen Eintrag hinzu. Das ist eine eigene Schleife mit eigener Auswahlbedingung. Zu Beginn lautet ihr Ergebnis `[{id:'robotik',free:3},{id:'laser',free:4}]`. Nach der ersten Anfrage aus S08 sind es Robotik 1 und Laser 4; nach dem dritten Schritt bleibt nur Laser 4. Medien wird immer ausgelassen, weil es schon ausgebucht ist. Es ist damit nicht nur eine behauptete Filterwirkung, sondern ein nachvollziehbarer Ablauf mit Zustandsbezug.
## S10 – Eigene Zerlegung und verwendete Rückgabewerte (A10/G10)

| Unterprogramm | Parameter | Rückgabe | Tatsächlicher Aufrufer und Verwendung |
| --- | --- | --- | --- |
| `priceCents` | gültige Platzanzahl | Centbetrag; Fehler bei ungültiger Anzahl | `book` übernimmt den Betrag in Ergebnis und Rückmeldetext |
| `available` | Kursobjekt | Kapazität minus Reservierungen | `reserve` prüft damit die Restkapazität; Ausgabe und Karten verwenden den Wert |
| `reserve` | Kurs und Anzahl | `true` nach Mutation, sonst `false` ohne Mutation | `book` entscheidet damit zwischen Erfolg und Kapazitätsfehler |
| `availableCourses` | Kursliste | neue Liste mit buchbaren IDs/freien Plätzen | Test/Analyse S09 verwendet die ausgegebene Liste |
| `book` | Kursliste und Eingabewerte | strukturiertes Ergebnis mit Status und Text | Submit-Handler gibt `result.message` aus |
| `installForm` | Dokument, optional Kursliste | veränderte Kursliste für die Modelltests | baut Handler und Kartenaktualisierung auf; der reale Seitenstart ruft es auf |

Die Verantwortung ist auf Eingabe-/Ablaufsteuerung, Berechnung, Mutation und Darstellung verteilt. Im Submit-Handler führt `book → priceCents/reserve → available` zur Entscheidung; erst danach werden Rückmeldung und alle freien Plätze neu dargestellt. Die Zerlegung ist ausführbar im vollständigen Code; bloße Funktionsnamen ohne Parameter-/Rückgabebeziehung würden die Leistung nicht belegen.
## S11 – Echte Fehlersuche am gegebenen V0 (A11/G11)

Drei unabhängige Fälle mit Robotik jeweils frisch `capacity=6, reserved=3` zeigen die Fehler:

| Anzahl | Begründete Erwartung | Tatsächliches V0 | Wirkung nach Korrektur |
| ---: | --- | --- | --- |
| 2 | erlaubt, reserved 5 | abgewiesen, reserved 3 | erlaubt, reserved 5 |
| 3 | erlaubt, reserved 6 | erlaubt, reserved 3 | erlaubt, reserved 6 |
| 4 | abgewiesen, reserved 3 | erlaubt, reserved 4 | abgewiesen, reserved 3 |

Geeigneter Werkzeugnachweis: Node-Assertions oder gezielte Console-Traces protokollieren Erwartung und tatsächlichen Objektwert. Aus dem gegebenen V0 folgen die drei dargestellten Abweichungen; eine erwartbar rote Prüfung ist kein grüner Anwendungstest. Die lernende Person muss den roten Altcode und die erfolgreiche Wiederholung nach ihrer Korrektur selbst ausführen und dokumentieren. Für diesen neuen GK24-Entwurf wird kein zusätzlicher Autor-Ausführungslauf behauptet.

Fehler 1 liegt in `places >= free`: kleine gültige Anfragen werden abgewiesen und zu große zugelassen. Stattdessen muss vor dem Erfolg `places > free` zum Abbruch führen. Fehler 2 ist `course.reserved = places`: Es überschreibt den bisherigen Belegungszustand, statt die neue Anzahl zu addieren. Hinzu kommen die nötigen Prüfungen auf ganze positive Zahlen und die vereinbarte Obergrenze. Diese konkreten Änderungen führen zu `reserve` in S04; ein stilles Auswechseln des ganzen Projekts wäre kein nachvollziehbares Debugging.
## S12 – Eigene Planung vor Umsetzung (A12/G12)

| Paket | Ergebnis / Voraussetzung | Priorität | Geeignetes Werkzeug und Grund |
| --- | --- | --- | --- |
| P1 | M0 präzisieren, Pflichtenheft S24 und Annahmen vor Beginn festhalten | zuerst / Muss | Texteditor und Tabelle für prüfbare Anforderungen |
| P2 | V1: gegliederte Seite, Karten und beschriftetes deaktiviertes Formular; nach P1 | Muss | HTML/CSS und lokaler Browser für vollständige Quellen und Struktur |
| P3 | V2: Restplatz- und Reservierungsfunktionen, Eingabeprüfung und Grundtarif; nach P1 | Muss | JavaScript mit lokalen Assertions für reproduzierbare Zustände |
| P4 | V3: Formular anbinden, Rabatt einbauen, Rückmeldung und Karten aktualisieren; nach P2/P3 | Muss | Editor, eigene Tests und lokaler Browser |
| P5 | Fehler-, Grenz-, Wiederholungs- und vier Viewportprüfungen; nach P4 | Muss | Logiktests getrennt von tatsächlichen Layout-/Bedienbeobachtungen |
| P6 | Netz-/Dienst-/Loganalyse S01–S03/S18 und Kryptografie S15–S17 | parallel möglich | eigene begründete Tabellen und lokale Rechenkontrollen; keine Transportrealisierung |
| P7 | Präsentation S14 und sechs Qualitätsurteile S23 mit den eigenen Befunden binden | nach Beobachtungen | eigene Folien oder dokumentierter Vortrag |

Die Tabelle ist eine Referenz für sinnvolle Abhängigkeiten, kein Beweis einer bereits erfolgten Lernendenplanung. Die Abgabe braucht die eigene vor der Umsetzung gesicherte Entscheidung, Werkzeugbegründung und nachvollziehbare spätere Anpassungen. Versionszeitstempel allein ersetzen keine Planungsleistung; es wird keine Entwicklungszeitlinie für diesen neuen GK24-Draft erfunden.
## S13 – Drei konkrete Referenzstände (A13/G13)

V1 ist ein statischer Strukturprototyp mit deaktiviertem Submit und ohne Script. Eine passende eigene Prüfung kontrolliert das Vorhandensein der drei Karten, Formelemente und des deaktivierten Buttons sowie die Abwesenheit eines Scripts. V2 ist ein ausführbares Modul für lokale Reservierungen mit Grundtarif: vier Plätze kosten dort 1200 Cent. V3 ist die vollständige Seite aus S04 mit Gruppenrabatt: vier Plätze kosten 1000 Cent. V2 ist durch Import/Funktionsaufruf, V3 zusätzlich im lokalen Browser zu prüfen. Neue GK24-Ausführungsergebnisse liegen nicht vor. V1 ist ausdrücklich noch keine funktionierende Anmeldung und V2 noch keine vollständige Benutzeroberfläche.

Die folgenden Quellen machen die Unterschiede vollständig prüfbar. Die drei vollständigen, inhaltlich unterschiedlichen Quelltextfassungen sind vorgegebene Referenzen. Sie beweisen keine eigene Entwicklung oder Erprobung durch Lernende.

### Vollständige V1

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Werkstatttag – lokale Demo</title>
  <style>
    body { margin: 0; font: 1rem/1.5 system-ui, sans-serif; color: #172033; background: #f5f7fa; }
    header, footer { background: #173657; color: white; padding: 1rem; }
    nav a { color: inherit; margin-right: 1rem; }
    main { max-width: 70rem; margin: auto; padding: 1rem; }
    .cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
    .card { min-width: 0; background: white; border: 1px solid #566577; border-radius: .4rem; padding: 1rem; }
    label { display: block; margin-top: .8rem; }
    input, select, button { font: inherit; max-width: 100%; box-sizing: border-box; }
    button { margin-top: 1rem; padding: .5rem 1rem; }
    :focus-visible { outline: 3px solid #a74d00; outline-offset: 2px; }
    #status { padding: 1rem; border-left: .3rem solid #173657; background: white; }
    @media (min-width: 768px) { .cards { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  </style>
</head>
<body>
<header><h1>Werkstatttag</h1><p>Nur lokale Demo mit erfundenen Testdaten; keine Anmeldung wird übertragen.</p>
  <nav aria-label="Seitennavigation"><a href="#angebote">Angebote</a><a href="#anmeldung">Demo-Anmeldung</a></nav>
</header>
<main>
  <section id="angebote" aria-labelledby="angebote-titel"><h2 id="angebote-titel">Unsere Werkstätten</h2>
    <div class="cards">
      <article class="card"><h3>Robotik</h3><p>Motoren und Sensoren erproben.</p><p>Frei: <span data-free-for="robotik">3</span> von 6.</p></article>
      <article class="card"><h3>Medienlabor</h3><p>Kurze Hörstücke gestalten.</p><p>Frei: <span data-free-for="medien">0</span> von 4.</p></article>
      <article class="card"><h3>Licht und Laser</h3><p>Lichtwege untersuchen.</p><p>Frei: <span data-free-for="laser">4</span> von 5.</p></article>
    </div>
  </section>
  <section id="anmeldung"><h2>Reservierung simulieren</h2>
    <p>3,00 EUR je Platz; ab vier Plätzen einmalig 2,00 EUR Gruppenrabatt. Eine Anfrage umfasst 1 bis 6 ganze Plätze.</p>
    <form id="booking" action="/anmeldung" method="post">
      <label for="name">Erfundener Name</label><input id="name" name="name" autocomplete="off" required>
      <label for="email">Erfundene E-Mail-Adresse</label><input id="email" name="email" type="email" autocomplete="off" required>
      <label for="course">Werkstatt</label><select id="course" name="course"><option value="robotik">Robotik</option><option value="medien">Medienlabor</option><option value="laser">Licht und Laser</option></select>
      <label for="places">Plätze</label><input id="places" name="places" type="number" min="1" max="6" step="1" value="1" required>
      <label><input id="testdata" name="testdata" type="checkbox" required> Ich benutze ausschließlich erfundene Testdaten.</label>
      <button type="submit" disabled>Lokal prüfen</button>
    </form>
    <p id="status" role="status">Noch keine lokale Reservierung.</p>
  </section>
</main>
<footer><p>Schul-AG – Modellprodukt für eine Informatikprüfung.</p></footer>

</body>
</html>
```

### Vollständiger ausführbarer V2-Kern

```javascript
export const initialCourses = () => [
  { id: 'robotik', title: 'Robotik', capacity: 6, reserved: 3 },
  { id: 'medien', title: 'Medienlabor', capacity: 4, reserved: 4 },
  { id: 'laser', title: 'Licht und Laser', capacity: 5, reserved: 1 },
];
export function priceCents(places) {
  if (!Number.isInteger(places) || places < 1 || places > 6) throw new RangeError('1 bis 6 ganze Plätze');
  return 300 * places;
}
export function available(course) { return course.capacity - course.reserved; }
export function reserve(course, places) {
  if (!Number.isInteger(places) || places < 1 || places > 6 || places > available(course)) return false;
  course.reserved = course.reserved + places;
  return true;
}
export function availableCourses(courses) {
  const result = [];
  for (const course of courses) {
    if (available(course) > 0) result.push({ id: course.id, free: available(course) });
  }
  return result;
}
export function book(courses, input) {
  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '').trim();
  const places = Number(input.places);
  const course = courses.find(candidate => candidate.id === input.course);
  if (!name || !email.includes('@') || input.confirmTestData !== true || !course
      || !Number.isInteger(places) || places < 1 || places > 6) {
    return { ok: false, message: 'Eingaben prüfen; es wurde nichts reserviert.' };
  }
  const price = priceCents(places);
  if (!reserve(course, places)) return { ok: false, message: 'Nicht genügend Plätze; es wurde nichts reserviert.' };
  return { ok: true, priceCents: price, free: available(course),
    message: `${name}: ${places} Platz/Plätze in ${course.title}; ${(price / 100).toFixed(2).replace('.', ',')} EUR; noch ${available(course)} frei.` };
}
export function installForm(document, courses = initialCourses()) {
  const form = document.getElementById('booking');
  const output = document.getElementById('status');
  const renderAvailability = () => {
    for (const course of courses) document.querySelector(`[data-free-for="${course.id}"]`).textContent = String(available(course));
  };
  renderAvailability();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const field = name => form.elements.namedItem(name);
    const result = book(courses, { name: field('name').value, email: field('email').value,
      course: field('course').value, places: field('places').value,
      confirmTestData: field('testdata').checked });
    output.textContent = result.message;
    renderAvailability();
  });
  return courses;
}
```

V3 steht vollständig in S04. Bei einer Lernendenabgabe müssen deren eigene Versionen und Prüfungen beurteilt werden; das Kopieren dieser drei Referenzstände belegt keinen selbstständigen Entwicklungsprozess.
## S14 – Konkrete fünfteilige Referenzpräsentation (A14/G14)

1. **Problem und Umfang:** Drei Angebote, nur erfundene Daten, 3 EUR je Platz und einmalig 2 EUR Rabatt ab vier Plätzen derselben Anfrage. Gezeigt wird das eigene Pflichtenheft S24. Eine lokale Demonstration ist kein echter Buchungsdienst.
2. **Lösung und Entscheidungen:** Semantisches HTML, CSS-Grid und der eigene Zustandskern werden am tatsächlichen Quelltext erklärt. `book` prüft, `reserve` verändert nur nach Erfolg, `priceCents` gibt den Tarif zurück und der Handler aktualisiert Meldung und Karten. Die eigene Zerlegung aus S10 ist sichtbar.
3. **Demonstration:** Bei einem frischen Robotikkurs mit reserved=3 und capacity=6 führt eine Anfrage zu 2 Plätzen zu reserved=5 und 600 Cent; die nächste Anfrage zu 2 Plätzen scheitert ohne Mutation und die letzte Anfrage zu 1 Platz füllt auf 6. Die lernende Person führt diese Folge selbst vor und zeigt zusätzlich einen nachvollziehbaren V0-Fehler aus S11.
4. **Prüfbefunde:** Eigene Logik-, Formular-, Struktur-, Krypto- und Viewportprüfungen werden mit Ausgangszustand, Erwartung und tatsächlichem Ergebnis vorgestellt. Ohne neuen Lauf darf die Solltabelle S21 nicht als Beobachtung präsentiert werden. Es gibt keine Netzpaketprüfung in diesem GK-Vertrag.
5. **Reflexion:** Die lokale Zustandslogik und kleinen unabhängigen Funktionen werden an Belegen beurteilt; offene Punkte sind insbesondere echte Serverprüfung, konkurrierende Nutzer, Zugriffsschutz, dauerhafte Speicherung sowie nicht getestete Browser/Personen. Das sind offene nächste Aufträge und keine schon erreichten Eigenschaften.

Ein Deck mit diesen Überschriften allein erfüllt G14 nicht. Die selbständige Leistung besteht im verständlichen Vorstellen der eigenen Produktentscheidungen, tatsächlichen Demonstration/Befunde und begründeten Reflexion. Diese Musterlösung behauptet keine schon gehaltene Präsentation oder menschliche Erprobung.
## S15 – Vier konkrete Chiffrenleistungen (A15/G15)

| Fall | Rechnung/Angriff | Ergebnis und Kontrolle |
| --- | --- | --- |
| C1 | Caesar mit k=5: T(19)+5=24→Y, R(17)+5=22→W; alle Zeichen analog modulo 26 | `YWJKKJSFRYTW`; Entschlüsselung mit −5 ergibt `TREFFENAMTOR` |
| C2 | Für k=0…25 jeweils C−k bilden; k=9 ergibt eine sinnvolle deutsche Verabredung | k=9, `TREFFENUMZEHN`; erneutes Verschlüsseln ergibt exakt `CANOONWDVINQW` |
| C3 | Schlüssel wiederholt `UNIUNIUN`; z.B. S(18)+U(20)=38≡12→M, C(2)+N(13)=15→P | `MPPOYBUT`; Entschlüsselung mit demselben Schlüssel subtrahiert und liefert `SCHULTAG` |
| C4 | K_i=C_i−P_i: A−A=0→A; T−N=6→G; J−M≡23→X; weitere sechs Präfixpositionen bestätigen dieselben drei Reste | Schlüssel `AGX`; vollständiger Text `ANMELDUNGROBOTIK`; erneutes Verschlüsseln liefert `ATJERAUTDRUYOZFK` |

Das folgende kurze Programm enthält nicht nur Resultate, sondern reproduzierbare Anwendungen, einen Caesar-Suchlauf, die Präfixrekonstruktion und Kontrollen. Es arbeitet ausschließlich auf den gegebenen A–Z-Zeichen.

```javascript
export function caesar(text, key) {
  return [...text].map(character => String.fromCharCode(65 + ((character.charCodeAt(0) - 65 + key) % 26 + 26) % 26)).join('');
}
export function vigenere(text, key, direction = 1) {
  return [...text].map((character, index) => String.fromCharCode(65 + ((character.charCodeAt(0) - 65
    + direction * (key.charCodeAt(index % key.length) - 65)) % 26 + 26) % 26)).join('');
}
export function recoverVigenereKey(known, ciphertext, period) {
  const letters = Array(period).fill(null);
  for (let index = 0; index < known.length; index++) {
    const shift = (ciphertext.charCodeAt(index) - known.charCodeAt(index) + 26) % 26;
    if (letters[index % period] !== null && letters[index % period] !== shift) throw new Error('Prefix widerspricht Periode');
    letters[index % period] = shift;
  }
  if (letters.some(letter => letter === null)) throw new Error('Prefix deckt nicht alle Schlüsselpositionen');
  return letters.map(letter => String.fromCharCode(65 + letter)).join('');
}
const c1 = caesar('TREFFENAMTOR', 5);
console.log(c1, caesar(c1, -5));
for (let key = 0; key < 26; key++) console.log(key, caesar('CANOONWDVINQW', -key));
const c3 = vigenere('SCHULTAG', 'UNI');
console.log(c3, vigenere(c3, 'UNI', -1));
const key = recoverVigenereKey('ANMELDUNG', 'ATJERAUTDRUYOZFK', 3);
console.log(key, vigenere('ATJERAUTDRUYOZFK', key, -1));
```

Die vier Ausgangs-/Ergebnispaare und inversen Kontrollen sind oben vollständig angegeben; mit dem gezeigten lokalen Programm lassen sie sich prüfen. Ein neuer GK24-Node-/Pythonlauf ist in diesem Draft nicht dokumentiert. Ein Werkzeug darf die Rechnung unterstützen; die Abgabe muss die angegebene Schlüsselinformation und ihre Verwendung erklären. Nur C1/C3 oder nur ein geratener Klartext würden G15 nicht erfüllen.
## S16 – Demonstrierte Angriffe und Grenzen (A16/G16)

Caesar hat bei festem Alphabet nur 26 Schlüssel. Der angegebene Suchlauf erzeugt alle 26 Kandidaten. Im konkreten Fall erlaubt die erkennbare deutsche Mitteilung die Wahl von Schlüssel 9; erneutes Verschlüsseln kontrolliert die Rechnung. Bei zufälligem sehr kurzem Klartext wäre diese sprachliche Auswahl nicht automatisch eindeutig. Bei Caesar bleiben überdies Muster einer monoalphabetischen Ersetzung erhalten.

Ein unbekannter genau dreibuchstabiger Vigenère-Schlüssel hat 26³=17576 Möglichkeiten. In C4 ist jedoch nicht nur der Geheimtext bekannt: Aus neun bekannten Klartextzeichen und Periode drei lässt sich für jede Schlüsselposition der Rest `C−P mod 26` bestimmen und zweimal zusätzlich kontrollieren. Die Folge der neun Reste ist `0,6,23,0,6,23,0,6,23`, also `AGXAGXAGX`. Das ist ein wirklich am Material demonstrierter bekannter-Klartext-Angriff, kein vollständiger 17576er-Bruteforcelauf. Er nutzt den wiederholten kurzen Schlüssel und das bekannte Präfix. Ohne diese Zusatzinformation würde dieses Verfahren den Schlüssel nicht auf dieselbe Weise beweisen. Beide Angriffe betreffen die schwachen klassischen Labormodelle, nicht moderne Transportverschlüsselung oder digitale Signaturen.
## S17 – Drei begründete moderne Schutzentscheidungen (A17/G17)

1. **Offenes WLAN und Webformular:** Ein authentisierter TLS-Transport mit korrekt geprüftem Server schützt den Inhalt und die Integrität auf dem Übertragungsweg und erschwert das Unterschieben eines falschen Servers. Voraussetzung sind eine passende vertrauenswürdige Serveridentität und sichere Endpunkte. Er beweist keine fachliche Berechtigung des Benutzers und schützt nicht vor einem bereits kompromittierten Endgerät, einem fehlerhaften Server oder unzulässiger Speicherung. „POST“ ist dafür kein Ersatz.
2. **Download und Hash von derselben Seite:** Der Hashvergleich kann eine versehentliche Veränderung erkennen, wenn der Vergleichswert vertrauenswürdig ist. Wer Datei und Hash gemeinsam auf der Seite austauschen kann, kann beides passend manipulieren. Eine digitale Signatur mit dem unabhängig authentisch verteilten öffentlichen Schlüssel kann Herkunft/Integrität der Programmdatei prüfen, sofern der private Schlüssel geschützt ist und die Verifikation das richtige signierte Objekt erfasst. Sie verschlüsselt die Datei nicht und garantiert weder Fehlerfreiheit noch Ungefährlichkeit seines Inhalts.
3. **Gestohlener Laptop:** Verschlüsselung gespeicherter Daten kann die vertrauliche Liste schützen, wenn ein starker Schlüssel nicht zugleich offen auf demselben Datenträger liegt und nicht anderweitig zugänglich ist. Im gegebenen Fall kann der Dieb den ungeschützten Schlüssel mitnehmen; die Schutzannahme ist verletzt. Getrennte geeignete Schlüsselaufbewahrung und gesperrte Geräte verbessern die Lage. Ein entsperrter kompromittierter Rechner oder vorab kopierter Klartext bleibt ein Risiko. Kryptografie ersetzt keine Zugriffskontrolle, Datensparsamkeit oder sichere Betriebsprozesse.

Dies ist eine fachliche Bewertung der gegebenen Fälle, kein durchgeführter TLS-/Signatur-/Laptop-Sicherheitstest.
## S18 – Beobachtung, Authentisierung, Berechtigung und Logrisiken (A18/G18)

Das Log verbindet drei fehlgeschlagene und eine erfolgreiche Anmeldung über `session=s17`, Benutzer und Quelladresse. `MAIL_ACCEPT` mit `queue=LAB-17` passt zur SMTP-Warteschlangenbestätigung. Beobachtet ist: Der Server meldet zuerst Fehler, dann erfolgreiche Anmeldung und Annahme einer Nachricht. Nicht bewiesen sind die Identität einer Person hinter der IP-Adresse, ein tatsächlicher Angriff oder die endgültige Zustellung. Der angemeldete Benutzer `aguser` ist auch nicht automatisch berechtigt, den Envelope-Absender `schulleitung@schule.test` zu verwenden.

Eine begründete Reaktion ist, das Muster zeitnah zu prüfen: erwartete Anmeldung beim Kontoinhaber klären, Zugangsdaten-/Absenderregeln und weitere korrelierte Ereignisse untersuchen und gegebenenfalls nach festgelegtem Verfahren Zugang begrenzen oder Daten ändern. Eine reine Folge von drei Fehlern und einem Erfolg rechtfertigt nicht die erfundene Feststellung eines nachgewiesenen Einbruchs. Die klartextnahe Authentisierung des Laborprotokolls muss für einen realen Dienst durch einen geeigneten geschützten Transport ersetzt werden.

Logs sollten selbst zugriffsgeschützt, zweckgebunden und sparsam sein. Passwörter oder der AUTH-Token gehören nicht in ein allgemeines Betriebslog. Unbegrenzte Speicherung von Adressen und Nachrichtentexten schafft zusätzliche Datenschutz- und Missbrauchsrisiken. Fehlende oder manipulierbare Logs erschweren die Untersuchung; ein vorhandenes Log ist umgekehrt nicht automatisch eine unangreifbare Wahrheit.
## S19 – Vollständige Elementbäume (A19/G19)

Der ursprüngliche Elementbaum von M3 lautet (Textknoten sind ergänzend in Anführungszeichen notiert):

```text
section#beispiel
├─ h2 → "Hinweise"
├─ ul
│  ├─ li
│  │  └─ span → "Robotik"
│  └─ li
│     └─ span → "Medienlabor"
└─ p → "Nutzen Sie ausschließlich Testdaten."
```

Für den neuen Teiltext ist zum Beispiel `<span>Robotik <strong>neu</strong></span>` korrekt. Das erste `span` enthält dann den Textknoten `Robotik ` und als Kind `strong` mit Textknoten `neu`. `strong` ist kein Kind des äußeren `ul`, und `li` bleibt das Kind des `ul`; die Einfügung verändert diese Elternbeziehungen nicht.

Der geänderte vollständige Elementbaum enthält damit:

```text
section#beispiel
├─ h2 → "Hinweise"
├─ ul
│  ├─ li
│  │  └─ span
│  │     ├─ Text "Robotik "
│  │     └─ strong → "neu"
│  └─ li
│     └─ span → "Medienlabor"
└─ p → "Nutzen Sie ausschließlich Testdaten."
```

Ein eigener Kartenausschnitt der Endfassung lautet:

```html
<article class="card">
  <h3>Robotik</h3>
  <p>Motoren und Sensoren erproben.</p>
  <p>Frei: <span data-free-for="robotik">3</span> von 6.</p>
</article>
```

```text
article.card
├─ h3 → "Robotik"
├─ p → "Motoren und Sensoren erproben."
└─ p
   ├─ Text "Frei: "
   ├─ span[data-free-for=robotik] → "3"
   └─ Text " von 6."
```

Die spätere Änderung von `span.textContent` verändert den enthaltenen Text, nicht dessen Elternbeziehung zum zweiten Absatz.
## S20 – Responsive Regeln und noch zu beobachtende Wirkung (A20/G20)

Die Standardregel `.cards` benutzt eine Grid-Spalte; ab einschließlich 768 Pixeln überschreibt die Media-Query sie mit drei gleich breiten Spalten. `meta viewport`, `minmax(0,1fr)`, `min-width:0` und begrenzte Formelementbreiten unterstützen die schmale Darstellung. Die Regel erklärt den Übergang 767→768. Sie allein beweist noch keine tatsächliche Darstellung oder Barrierefreiheit.

| Viewport | Aus dem CSS erwartete Spalten | Zu dokumentierende eigene Beobachtung |
| ---: | ---: | --- |
| 320 | 1 | tatsächliche Spalten, Karten-/Formularbedienung und scrollWidth gegenüber innerWidth |
| 767 | 1 | Messung unmittelbar unter dem Umschaltpunkt |
| 768 | 3 | Messung genau am inklusiven Umschaltpunkt |
| 1024 | 3 | tatsächliches breites Layout und eigene Reservierungsfolge |

Für diesen GK24-Draft sind diese Messfelder noch offen. Die älteren LK-Referenzläufe werden nicht in neue GK-Beobachtungen umgedeutet. Die Lernenden müssen die eigene Seite wirklich prüfen und Abweichungen beheben oder wahrheitsgemäß benennen. Eine nur behauptete Browserprüfung erfüllt G20 nicht; ein lokaler Browserlauf wäre seinerseits keine allgemeine Browser-, Screenreader- oder Menschenabnahme.
## S21 – Vollständige Testplanung mit getrennten Soll-/Istfeldern (A21/G21)

Alle unabhängigen Fälle beginnen mit frischen Kursobjekten; nur T01–T03 bilden ausdrücklich eine zusammenhängende Folge. Die Werte sind aus M0/M4 und dem Code berechnete Erwartungen. Ein beobachteter Wert, Werkzeug und Ergebnis sind jeweils von der lernenden Person nach tatsächlichem Lauf zu ergänzen.

| Test | Ausgang/Eingabe | Begründeter Sollwert | Erforderlicher eigener Istnachweis |
| --- | --- | --- | --- |
| T01 normal | Robotik: reserved=3, capacity=6; 2 Plätze | Erfolg; reserved=5; frei=1; 600 Cent | ausgeführte Logikprüfung und echte Formulareingabe |
| T02 Wiederholung | nach T01 nochmals 2 Plätze | Ablehnung; reserved bleibt 5 | derselbe Zustand/Handler nach dem Versuch |
| T03 Restkapazität | nach T02 1 Platz | Erfolg; reserved=6; frei=0 | beobachteter Endzustand/Karte |
| T04 Überbuchung | frische Robotik; 4 Plätze | Ablehnung; reserved=3. V0 liefert falsch Erfolg und reserved=4 | roter Altcode-Gegenfall, Wiederholung am korrigierten Code |
| T05 Anzahlgrenzen |0, −1, 1.5, 7, NaN | ungültig; keine Mutation | pro Fall Eingabe-/Zustandswerte |
| T06 Formularfehler | leerer Name, E-Mail ohne @, unbekannter Kurs, „2x“, unbestätigt | ganze Kursliste unverändert | getrennte Fälle mit passenden eigenen Assertions |
| T07 Tarif | 1, 3, 4, 6 | 300, 900, 1000, 1600 Cent | tatsächlich aufgerufene Tarif-/UI-Ergebnisse |
| T08 Altcode |frische Robotik; V0 mit 2/3/4 | drei Abweichungen aus S11 | lokalisierter Fehler und nach Korrektur gleiche Gegenfälle |
| T09 Anbindung |benannte Formfelder und Bestätigung | Standardübermittlung verhindert; Meldung und Karten aus tatsächlichem Zustand | DOM/Browserbeobachtung, keine bloße Kernfunktionsausgabe |
| T10 Layout | 320/767/768/1024 | 1/1/3/3 Spalten; kein gewollter horizontaler Überlauf | echte Messwerte und gegebenenfalls Korrektur |
| T11 Krypto | C1–C4 | volle Werte und Kontrollen aus S15 | eigener Rechenweg/Programmausgabe mit erklärt verwendeten Schlüsseln |
| T12 Integration | eingebetteter HTML-Kern | tatsächlich verwendete geprüfte Funktionen | Quellbezug, Aufruf und reale Wirkung statt unverbundener Testdatei |

G21 fordert die selbständige Strategie, Fälle, Erwartungen und wahrheitsgemäß dokumentierte Beobachtungen. Ein ausschließlich kopierter Testtitel oder diese vorgegebene Solltabelle erfüllt es nicht. Netzverkehr, Transportsegmentierung und reale Kryptoschutzversuche sind nicht gefordert; tatsächliche Logik- und Browserprüfungen werden sauber getrennt. Die eigene Abgabe muss mindestens einen wirklichen V0-Fehllauf und dessen korrigierte Wiederholung enthalten.
## S22 – Gezielte lauffähige Tarifanpassung (A22/G22)

Aus `return 300 * places` wird nach der vereinbarten Anzahlprüfung `return 300 * places - (places >= 4 ? 200 : 0)`. Der Rabatt wird genau einmal je Anfrage abgezogen. Eine Änderung am bereits gespeicherten Reservierungsstand ist dafür nicht erforderlich. Die Anwendung ruft diese neue Funktion in `book` vor der erfolgreichen Reservierung auf und übernimmt ihren Wert in die sichtbare Meldung.

| Anzahl | Grundpreis | Rabatt | Neuer Betrag |
| ---: | ---: | ---: | ---: |
| 1 | 300 | 0 | 300 Cent |
| 3 | 900 | 0 | 900 Cent |
| 4 | 1200 | 200 | 1000 Cent |
| 6 | 1800 | 200 | 1600 Cent |

0, 7, 1,5 und NaN werden vor der Preisberechnung als gültiger Tariffall abgewiesen. Das Beibehalten der Integer-Cent-Rechnung vermeidet bei diesem Tarif Rundungsfragen. Für vier Laserplätze lautet der Sollwert 10,00 EUR und danach 0 freie Laserplätze. V2(4)=1200 und V3(4)=1000 unterscheiden die beiden gegebenen Referenzfassungen; die Lernenden müssen diese Änderung am eigenen Code und seiner tatsächlichen Verwendung nachweisen. Hier wird kein neuer GK24-Formularlauf behauptet. Eine gewünschte Rabattregel lediglich in Text oder CSS zu schreiben, ohne ihre Verwendung im Programm nachzuweisen, erfüllt G22 nicht.
## S23 – Sechs produktbezogene Qualitätsurteile (A23/G23)

| Kriterium | Konkreter Bezug zum Entwurf | Begründetes Urteil / offene Prüfung |
| --- | --- | --- |
| Funktionalität | S04, S08, S22: Prüfung vor Mutation,Zustands- und Tarifrechnung | Die Codepfade bilden M0 ab; eigene reale Funktionsnachweise fehlen bis zur Durchführung. Kein echter Mehrbenutzerbuchungsdienst. |
| Zuverlässigkeit | Ablehnung vor Zuweisung, frische Daten je unabhängigenTest | Fehler dürfen den Zustand nicht ändern; T02/T04/T05/T06 sind selbst nachzuweisen. Keine Wiederherstellung nach Strom-/Serverausfall implementiert. |
| Benutzbarkeit | Labels, Navigation, Status, Fokus sowie Regeln ausS20 | Konkrete Bedien-/Viewportbeobachtung erforderlich; keine behauptete Menschen- oder Assistenztechnikprüfung. |
| Effizienz | Schleife und Kartenaktualisierung jeweils über n Kurse, hier n=3 | Die Listenarbeit wächst im vorliegenden Code linear. Keine erfundene Laufzeit-/Serverlastmessung. |
| Änderbarkeit | Tarif und Mutation getrennt,V2→V3 nur eine neue Preisregel | Lokale Tarifänderung ist begründet und prüfbar; andere Datenmodelle/Rollen wären neue Entwurfsarbeit. |
| Übertragbarkeit | vollständiges lokalesHTML/CSS/JS ohne externe Bibliothek | Geringe Laufzeitabhängigkeiten; tatsächlich verwendete Browser sind zu benennen, keine ungeprüfte allgemeine Portabilitätszusage. |

Für G23 müssen alle sechs im Ziel genannten Qualitätsdimensionen mit eigenem Produkt-/Prüfbezug beurteilt werden. Das Vorliegen dieser Mustertabelle genügt nicht. Es ist zulässig, einen Punkt als noch ungeprüft zu bewerten und die passende Prüfung zu planen; eine fehlende eigene Qualitätsbeurteilung darf nicht durch andere Kriterien kompensiert werden.
## S24 – Konkretes Pflichtenheft und Abnahmebindung (A24/G24)

**Ziel:** Eine verständliche lokal ausführbare Demonstration von drei Werkstattangeboten, korrekter temporärer Reservierung und einem überprüfbaren Tarif. **Nichtziele:** echte Anmeldung, echte Konten, Mailversand, Zahlungsabwicklung, Mehrbenutzerbetrieb und dauerhafte personenbezogene Speicherung. Netz- und Kryptomaterialien bleiben analysierte beziehungsweise lokal berechnete Modelle.

**Daten/Schnittstellen:** `Course={id,title,capacity,reserved}` nach M4; Formularwerte `name,email,course,places,testdata`; Anzahltext wird vor Berechnung konvertiert und geprüft. Preise intern in Cent. Der Submit-Handler übergibt ein benanntes Eingabeobjekt an `book` und erhält Status/Text sowie bei Erfolg Betrag/freie Plätze. Eine reale HTTP-Schnittstelle wird erläutert, aber nicht aufgerufen. Neustart der Datei setzt die Demonstrationsdaten zurück; das ist für diesen Auftrag ausdrücklich vereinbart.

| ID | Ermittelte Anforderung und überprüfbare Festlegung | Abnahme/Artefakt |
| --- | --- | --- |
| F1 | Die drei Angebote und anfänglich3/0/4 freien Plätze werden angezeigt. | S04-Struktur; zu beobachtender Browserausgangszustand und `availableCourses` |
| F2 | Name und E-Mail dürfen nicht fehlen; nur bekannte Kurs-ID, ganze Zahl1…6 und bestätigte Testdaten werden verarbeitet. | T05/T06; Browser-Attribute und eigene Prüfung vor Mutation |
| F3 | Nur eine kapazitätsverträgliche Anfrage erhöht `reserved` um genau die Anzahl. | S08/T01–T04; exakte Objektwerte und unveränderte Ablehnung |
| F4 | Preis=300×Anzahl Cent; ab4 einmalig200 Cent Rabatt. | S22/T07; 1/3/4/6 und ungültige Grenzfälle |
| F5 | Nach jedem Versuch stimmen Rückmeldung und Kartenanzeige mit dem Zustand überein. | echter Handler/Browserfolge; keine Reservierung bei Fehler |
| N1 | Bei320/767 eine, ab768 drei Karten nebeneinander; kein horizontaler Überlauf in den geprüften Breiten. | S20/T10; vier selbst auszuführende Layoutmessungen |
| N2 | Navigation, Labels, Tastaturfokus und Statusrückmeldung sind im Dokument vorhanden. | S04/S05; Strukturprüfung; keine behauptete vollständige Nutzerprüfung |
| N3 | Kein echter Versand, keine Konten oder dauerhafte Speicherung. | Codeinspektion; Quellprüfung und bei einem eigenen Lauf protokollierte Netzversuche; kein neuer GK-Lauf behauptet |
| D1 | Mindestens drei echte unterschiedliche Stände mit geprüftem Funktionsumfang und vollständigen Quellen. | S13 V1/V2/V3 und eigene jeweilige Beobachtungen |
| D2 | Tests, Schwächen und Präsentation sind mit Produktbezug dokumentiert. | S11/S14/S21/S23; eigene gespeicherte Ergebnisse statt bloßer Behauptungen |

**Präzisierungen/Annahmen:** „Ab vier“ meint die Anzahl in einer einzelnen Anfrage. Die Kapazität wird nicht durch fehlerhafte Anfragen geändert. M0 fordert eine Simulation; ein Browserneustart darf deshalb die Belegung zurücksetzen. Die lokale E-Mail-Prüfung ist keine Ermittlung einer realen Person oder eines realen Postfachs. Der fiktive Datenbestand vermeidet echte personenbezogene Daten. Offene Anforderungen an einen produktiven Dienst werden als neuer Auftrag aufgelistet und nicht in die hier bestandene Abnahme hineingelesen.

Eine Lernendenabgabe muss eigene nachvollziehbare Anforderungsermittlung und Festlegungen zeigen, nicht lediglich eine allgemeine Überschrift „Pflichtenheft“. Die Beispielabnahme bindet konkrete Anforderungen an tatsächlich benannte Produkt-/Prüfartefakte; ihre Existenz ist keine Freigabe dieser Prüfung oder des Curriculums.
