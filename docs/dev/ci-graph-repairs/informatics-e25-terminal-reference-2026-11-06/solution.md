# Musterlösung zur Projektprüfung E25

Dies ist eine ausgearbeitete Referenzabgabe zur unveränderten vollständigen 25er-Coverage, keine Schülerabgabe und keine Behauptung eines Lernerfolgs. Andere eigenständig begründete, lauffähige Lösungen sind zulässig. Die Antworten beziehen sich auf die konkreten Materialien M0–M7. Bei K01–K25 wird jeweils die ganze zugeordnete Leistung geprüft; der bloße Besitz dieser Musterlösung genügt nicht. K23 gehört zum vollständigen LK-Vertrag und wird nicht für einen GK-Teilpass ausgelassen.

## S01 – Komponenten und Zusammenspiel (A01/K01)

L1 ist der Client: Er fordert einen Dienst an und zeigt dessen Ergebnis. AP1 verbindet die WLAN-Station mit dem lokalen Netz. S1 vermittelt lokale Ethernet-Verbindungen zwischen den angeschlossenen Geräten. W liefert die Angebotsdaten als Webserver. D beantwortet die Namensauflösung. P ist ein nutzbarer Netzdrucker, aber am gegebenen Webabruf nicht beteiligt. R verbindet unterschiedliche Netze; über ihn könnte der externe Maildienst erreicht werden.

L1 fragt zunächst den DNS-Dienst D nach `werkstatt.schule.test` und erhält `10.10.0.20`. Anschließend baut der Client über AP1 und S1 die Verbindung zum Server W auf. Beide liegen im angegebenen `/24`-Netz `10.10.0.0/24`; der lokale Webweg benötigt deshalb R nicht als Weiterleitungsstation. Die vorgegebenen DNS- und Webdaten sind verschiedene Dienste. W verarbeitet die entschlüsselte HTTP-Anfrage und liefert die Angebotsdaten; L1 kann daraus zum Beispiel die drei freien Robotikplätze anzeigen. Ein Abruf des externen Maildiensts hätte dagegen einen Weg über R. Die Skizze verlangt weder eine eigene NAT-Konfiguration noch die Verwendung des Druckers als Zwischenstation.

## S02 – TCP/IP, Namen, Adressen und Ports (A02/K02)

| Ebene im hier benutzten Vier-Schichten-Modell | Konkretes Element | Leistung |
| --- | --- | --- |
| Anwendung | DNS-Frage/Antwort; HTTP `GET /angebote?kurs=robotik` und JSON-Antwort | Bedeutung der Dienstnachrichten |
| Transport | TCP, Clientport 51514 und Serverport 443; SYN/SYN,ACK/ACK | Zuordnung zur Verbindung; zuverlässiger geordneter Bytestrom |
| Internet | IP-Adressen `10.10.0.10` und `10.10.0.20` | Adressierung und Weiterleitung zwischen IP-Endpunkten |
| Netzzugang | WLAN über AP1, lokaler Link über S1 | Übertragung auf den jeweils verwendeten lokalen Verbindungen |

`werkstatt.schule.test` ist ein Name; DNS liefert dafür hier eine IP-Adresse. Die Server-IP bezeichnet den Netzendpunkt, Port 443 den dort adressierten Dienst. Unterschiedliche Verbindungen können dieselbe Server-IP und denselben Serverport verwenden, während Clientadresse/-port sie unterscheiden. Anwendungstext wird in Transportdaten, diese in IP-Pakete und diese in die jeweilige lokale Übertragungsform eingebettet. Am Ziel werden diese Schichten ausgewertet und die Nutzdaten an die Anwendung gereicht. Der gegebene TLS-Kanal liegt über TCP; die dargestellten HTTP-Zeilen wurden am Endpunkt entschlüsselt und sind kein Klartextmitschnitt außerhalb dieses Kanals. DNS wird hier nur als Anwendungsdienst eingeordnet; ein für diese Beobachtung nicht angegebener DNS-Transport wird nicht nachträglich erfunden.

## S03 – SMTP-Analyse (A03/K03)

`220` begrüßt den Client; `EHLO` und die `250`-Zeilen geben die angebotenen Möglichkeiten an. `AUTH PLAIN` überträgt hier den Base64-Token, `235` meldet die erfolgreiche Anmeldung. Lokal dekodiert ergibt er die Bytes `NUL aguser NUL demo-pass`, also Benutzer `aguser` und Passwort `demo-pass`. Base64 ist eine reversible Codierung und schützt diese Daten nicht vor Mitlesen.

`MAIL FROM` setzt den Envelope-Absender, `RCPT TO` den Empfänger. `DATA` und `354` eröffnen die Nachricht; Header, Leerzeile und Text folgen. Der einzelne Punkt beendet diese Datenphase. `250 Queued as LAB-17` belegt die Annahme in die Warteschlange dieses Servers. `QUIT`/`221` beendet die Sitzung. Daraus folgt weder schon die endgültige Zustellung beim Empfänger noch die Berechtigung des Benutzers, im Namen der Schulleitung zu senden. Die Aufgabe enthält dazu keine Rollenregel.

Risiko 1: Die unverschlüsselte Verbindung gibt Token und Nachricht an einen Mitleser preis. Ein authentisierter verschlüsselter Transport mit korrekt geprüftem Server schützt den Transport; ein kompromittierter Endpunkt bleibt dennoch ein Risiko. Risiko 2: Ein angemeldeter Benutzer könnte ohne passende Absenderregel unzulässige Envelope-Absender setzen. Eine serverseitige Zuordnung und Prüfung der erlaubten Absender wäre nötig; der vorliegende Dialog beweist weder ihr Vorhandensein noch ihr Fehlen. Zusätzlich helfen begrenzte Anmeldeversuche und sichere Zugangsdaten gegen Missbrauch; sie ersetzen keine Transportverschlüsselung. Das angegebene Log ist ein Untersuchungsanlass, kein Beweis eines erfolgreichen Einbruchs.

## S04 – Vollständiges selbst erstelltes Dokument (A04/K04)

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

## S05 – Selektoren, Layout und Typografie (A05/K05)

Der Elementselektor `body` legt Schrift, Zeilenhöhe, Textfarbe und Hintergrund fest. `header, footer` gestalten Kopf und Abschluss einheitlich. Die Klasse `.card` steuert Rand, Innenabstand, Hintergrund und Rundung jeder Angebotskarte; `.cards` legt das gemeinsame Grid fest. Der ID-Selektor `#status` hebt genau die Ergebnisrückmeldung durch Hintergrund und linke Kante hervor. `nav a` beschränkt seine Linkgestaltung auf die Navigation. `:focus-visible` macht den Tastaturfokus sichtbar, ohne daraus bereits eine vollständige Barrierefreiheitsprüfung abzuleiten.

`main` begrenzt die Lesebreite auf 70rem und zentriert sie; `padding` lässt auf schmalen Geräten Abstand zum Rand. `box-sizing: border-box` und `max-width: 100%` begrenzen die Formelemente. `minmax(0, 1fr)` und `min-width: 0` erlauben den Karten, auf die verfügbare Breite zu schrumpfen. Schrift- und Abstandsentscheidungen sind an den tatsächlich sichtbaren Karten und Rückmeldungen überprüfbar, nicht nur als Stilwunsch formuliert.

## S06 – Formelemente und nachvollziehbare HTTP-Beispiele (A06/K06)

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

## S07 – Datentypen und tatsächliche Ein-/Ausgabe (A07/K07)

`field('places').value` ist zunächst die Zeichenkette `"2"`; `Number(...)` erzeugt die Zahl 2. `Number.isInteger`, Unter- und Obergrenze verhindern eine Verwendung von `"2x"`, 0, 7 oder 1,5 als gültige Anzahl. `name` und `email` werden als Zeichenketten gelesen und getrimmt; `checked` liefert einen booleschen Wert. `course` ist nach der Auswahl ein Objekt; `reserved` und `capacity` sind Zahlen. `result` enthält einen booleschen Status, bei Erfolg Preis und freie Plätze sowie eine auszugebende Zeichenkette.

Ein tatsächlich ausgeführter Normalfall lieferte:

```text
Eingabe: Jana Jung / jana@example.test / robotik / "2" / true
Ausgabe: Jana Jung: 2 Platz/Plätze in Robotik; 6,00 EUR; noch 1 frei.
Neuer Objektwert: reserved = 5
```

Mit `places: "2x"` lautet die Ausgabe `Eingaben prüfen; es wurde nichts reserviert.`; alle Kursobjekte bleiben im Ausgangszustand. Gleiches wurde für leeren Namen, eine offensichtlich fehlerhafte Adresse ohne `@`, einen unbekannten Kurs und eine nicht gesetzte Bestätigung geprüft. Die Referenzprüfung für E-Mail-Adressen ist bewusst eine einfache lokale Eingabeprüfung; sie verifiziert weder Existenz noch Zustellbarkeit einer Adresse.

## S08 – Zustandsänderungen ohne Mutation bei Fehlern (A08/K08)

Die Abgabe verwendet `course.reserved = course.reserved + places` ausschließlich nach vollständiger Prüfung. Die drei aufeinanderfolgenden Reservierungsversuche am **selben** Objekt ergeben:

| Schritt | Anfrage | reserved vorher | frei vorher | Ergebnis | reserved nachher | frei nachher |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| Start | – | 3 | 3 | – | 3 | 3 |
| 1 | 2 | 3 | 3 | erfolgreich | 5 | 1 |
| 2 | 2 | 5 | 1 | abgewiesen | 5 | 1 |
| 3 | 1 | 5 | 1 | erfolgreich | 6 | 0 |

Die zweite Anfrage verändert nichts, weil ihre Anzahl die aktuell freie Kapazität überschreitet. Die dritte füllt die Restkapazität exakt. Diese Folge wurde sowohl mit lokalen Assertions als auch über das echte Formular der Referenzseite ausgeführt. Jede unabhängige Testfolge beginnt dagegen mit neu angelegten Ausgangsobjekten; sonst würde ein früherer Test den nächsten verfälschen.

## S09 – Eigene Schleife und Verzweigung (A09/K09)

`availableCourses` aus S04 durchläuft jedes Kursobjekt mit `for...of`, berechnet die freien Plätze und fügt nur bei `free > 0` einen Eintrag hinzu. Das ist eine eigene Schleife mit eigener Auswahlbedingung. Zu Beginn lautet ihr Ergebnis `[{id:'robotik',free:3},{id:'laser',free:4}]`. Nach der ersten Anfrage aus S08 sind es Robotik 1 und Laser 4; nach dem dritten Schritt bleibt nur Laser 4. Medien wird immer ausgelassen, weil es schon ausgebucht ist. Es ist damit nicht nur eine behauptete Filterwirkung, sondern ein nachvollziehbarer Ablauf mit Zustandsbezug.

## S10 – Eigene Zerlegung und verwendete Rückgabewerte (A10/K10)

| Unterprogramm | Parameter | Rückgabe | Tatsächlicher Aufrufer und Verwendung |
| --- | --- | --- | --- |
| `priceCents` | gültige Platzanzahl | Centbetrag; Fehler bei ungültiger Anzahl | `book` übernimmt den Betrag in Ergebnis und Rückmeldetext |
| `available` | Kursobjekt | Kapazität minus Reservierungen | `reserve` prüft damit die Restkapazität; Ausgabe und Karten verwenden den Wert |
| `reserve` | Kurs und Anzahl | `true` nach Mutation, sonst `false` ohne Mutation | `book` entscheidet damit zwischen Erfolg und Kapazitätsfehler |
| `availableCourses` | Kursliste | neue Liste mit buchbaren IDs/freien Plätzen | Test/Analyse S09 verwendet die ausgegebene Liste |
| `book` | Kursliste und Eingabewerte | strukturiertes Ergebnis mit Status und Text | Submit-Handler gibt `result.message` aus |
| `installForm` | Dokument, optional Kursliste | veränderte Kursliste für die Modelltests | baut Handler und Kartenaktualisierung auf; der reale Seitenstart ruft es auf |

Die Verantwortung ist auf Eingabe-/Ablaufsteuerung, Berechnung, Mutation und Darstellung verteilt. Im Submit-Handler führt `book → priceCents/reserve → available` zur Entscheidung; erst danach werden Rückmeldung und alle freien Plätze neu dargestellt. Die Zerlegung ist ausführbar im vollständigen Code; bloße Funktionsnamen ohne Parameter-/Rückgabebeziehung würden die Leistung nicht belegen.

## S11 – Echte Fehlersuche am gegebenen V0 (A11/K11)

Drei unabhängige Fälle mit Robotik jeweils frisch `capacity=6, reserved=3` zeigen die Fehler:

| Anzahl | Begründete Erwartung | Tatsächliches V0 | Wirkung nach Korrektur |
| ---: | --- | --- | --- |
| 2 | erlaubt, reserved 5 | abgewiesen, reserved 3 | erlaubt, reserved 5 |
| 3 | erlaubt, reserved 6 | erlaubt, reserved 3 | erlaubt, reserved 6 |
| 4 | abgewiesen, reserved 3 | erlaubt, reserved 4 | abgewiesen, reserved 3 |

Werkzeug: Ausgeführte Node-Assertions mit protokollierten Erwartungs-/Istwerten. Der V0-Gegenlauf hatte absichtlich Exit 1 und drei fehlgeschlagene Fälle; das ist ein erwarteter Fehlernachweis und kein grüner Anwendungstest. Der korrigierte Lauf prüfte dieselben Kapazitätsgrenzen erfolgreich.

Fehler 1 liegt in `places >= free`: kleine gültige Anfragen werden abgewiesen und zu große zugelassen. Stattdessen muss vor dem Erfolg `places > free` zum Abbruch führen. Fehler 2 ist `course.reserved = places`: Es überschreibt den bisherigen Belegungszustand, statt die neue Anzahl zu addieren. Hinzu kommen die nötigen Prüfungen auf ganze positive Zahlen und die vereinbarte Obergrenze. Diese konkreten Änderungen führen zu `reserve` in S04; ein stilles Auswechseln des ganzen Projekts wäre kein nachvollziehbares Debugging.

## S12 – Konkrete Anforderungsliste, Arbeitsplan und Werkzeuge (A12/K12)

Eine mögliche vor der eigenen Umsetzung festzuhaltende Planung lautet:

| Arbeitspaket | Ergebnis und Abhängigkeit | Priorität | Werkzeug und Grund |
| --- | --- | --- | --- |
| P1 Auftrag analysieren | Pflichtenheft S25, offene Annahmen festlegen | Muss, zuerst | Markdown/Tabelle: Anforderungen und Abnahme gut vergleichbar |
| P2 Strukturprototyp | V1: semantische Seite, Karten, beschriftetes deaktiviertes Formular; nach P1 | Muss | Texteditor und Browser: vollständige Quellen und direkt sichtbare Struktur |
| P3 Zustandskern | V2: Restplätze, gültige/ungültige Reservierungen, Grundtarif; nach P1/M4/M5 | Muss | JavaScript-Modul + Node-Assertions: reproduzierbare Mutationstests ohne Server |
| P4 Integration | V3: Submit-Handler, Rabatt, aktualisierte Anzeige; nach P2/P3 | Muss | Browser plus Module: echte Ein-/Ausgabe und berechenbare Kernlogik |
| P5 Responsive und Grenztests | 320/767/768/1024, Fehler-/Wiederholungsfälle; nach P4 | Muss | lokale Chromium-Ausführung, Layoutwerte und Console-/Scriptfehler |
| P6 Netz/Krypto erklären | S01–S03, S15–S18, S23; parallel zu P2–P5 | Muss | kleine lokale Rechenprogramme, unabhängig nachgerechnete Werte |
| P7 Qualität/Präsentation | S14/S24, reale Belege zusammenstellen; nach den Beobachtungen | Muss | fünfteiliger Text-/Foliensatz, gespeicherte Quellen und Ergebnisdateien |

Sinnvolle Zwischenstände werden als tatsächliche verschiedene Dateien oder Versionskontrollstände gesichert, nicht als rückdatierte Geschichte. Der hier vorliegende Referenzsatz hat wirklich verschiedene Dateien V1, V2 und V3 und ausgeführte Modellprüfungen. Er ersetzt keine individuelle Planungsentscheidung oder Prozessdokumentation der lernenden Person. Eine während der Referenzprüfung vorgenommene konkrete Anpassung war die Prüfung auch bei 767/768 Pixeln, damit der exakte Umschaltpunkt zusätzlich zu 320/1024 beobachtet wurde. Die browserbezogenen Befunde werden erst nach dem entsprechenden Lauf dokumentiert; es wird keine vorherige Beobachtung erfunden.

## S13 – Drei tatsächlich unterschiedliche Referenzstände (A13/K13)

V1 ist ein statischer Strukturprototyp mit deaktiviertem Submit und ohne Script. Seine konkrete Prüfung kontrolliert das Vorhandensein der drei Karten, Formelemente und des deaktivierten Buttons sowie die Abwesenheit eines Scripts. V2 ist ein ausführbares Modul für lokale Reservierungen mit Grundtarif: vier Plätze kosten dort 1200 Cent. V3 ist die vollständige Seite aus S04 mit Gruppenrabatt: vier Plätze kosten 1000 Cent. V2 wurde durch tatsächlichen Import und Funktionsaufruf geprüft; V3 zusätzlich im lokalen Browser. V1 ist ausdrücklich noch keine funktionierende Anmeldung und V2 noch keine vollständige Benutzeroberfläche.

Die folgenden Quellen machen die Unterschiede vollständig prüfbar. Dies sind **wirkliche Referenzartefakte**, aber keine behauptete Entwicklungszeitlinie oder menschliche Erprobung.

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

## S14 – Ausgearbeitete Ergebnispräsentation (A14/K14)

**Teil 1 – Problem und zugesagter Umfang.** „Unsere Schul-AG braucht eine lokale Demonstration für drei Werkstätten. Wir erfassen nur erfundene Daten. Ein Platz kostet drei Euro; ab vier Plätzen gibt es zwei Euro Rabatt pro Anfrage. Das Produkt bucht keine echten Plätze und sendet nichts. Seine Abnahme muss Erfolg, Abweisung ohne Zustandsänderung und eine schmale Darstellung umfassen.“ Gezeigt wird die Anforderungstabelle S25.

**Teil 2 – Aufbau und Entscheidungen.** „Die Seite trennt semantische HTML-Struktur, CSS-Grid und den kleinen JavaScript-Zustandskern. Der Submit-Handler liest Formwerte, `book` prüft und steuert, `reserve` ändert erst nach erfolgreicher Prüfung den Zustand. Centbeträge vermeiden in diesem Tarif unnötige Dezimalgeldrechnungen. Die Karten werden nach jedem Versuch aus dem tatsächlichen Zustand aktualisiert.“ Gezeigt werden der Aufrufplan aus S10 und die drei Karten im Produkt.

**Teil 3 – Tatsächliche Demonstration.** „Bei frischem Zustand Robotik 3/6 reservieren wir zwei Plätze. Die Meldung zeigt 6,00 EUR, die Karte einen freien Platz. Derselbe Versuch mit zwei weiteren Plätzen wird abgewiesen; die Karte zeigt weiterhin eins. Ein letzter Platz gelingt und ergibt null freie Plätze.“ Diese Folge entspricht den gespeicherten lokalen Beobachtungen; eine Vorführung soll dieselben Schritte auf einer frischen Seite zeigen. Als Kontrast wird die V0-Tabelle aus S11 gezeigt.

**Teil 4 – Tests und Befunde.** „Der V0-Gegenlauf scheitert an drei gezielten Fällen. Der korrigierte Kern besteht zehn gruppierte Node-Fälle, darunter Mutation, Eingabeprüfung, Tarif und Submit-Bindung. Ein unabhängiges Python-Programm rechnet Kryptowerte und ACKs nach und vergleicht die eingebettete Logik. Im lokalen Chromium wurden bei 320/767 eine und bei 768/1024 drei Kartenspalten gemessen, ohne horizontales Überlaufen; die echte Formularfolge lief ohne Scriptfehler. Diese Beobachtung gilt für dieses lokale Modell, nicht für jeden Browser oder eine produktive Plattform.“

**Teil 5 – Reflexion und nächster Schritt.** „Stärken sind die vollständigen Quellen, deterministischen Testdaten und die Trennung von Prüfung und Mutation. Grenzen: keine echte Authentisierung, keine konkurrierenden Benutzer, keine Serverprüfung, keine dauerhafte Speicherung, keine Messung mit tatsächlichen Nutzern und nur ein lokaler Browser. Für einen echten Dienst kämen eine geprüfte serverseitige Transaktion, Datenschutz-/Berechtigungskonzept und Tests mit weiteren Browsern und Personen hinzu. Das wäre ein neuer Auftrag; wir deklarieren es nicht schon als erreicht.“

## S15 – Vier konkrete Chiffrenleistungen (A15/K15)

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

Die vier Ausgangs-/Ergebnispaare und Kontrollen wurden in Node und unabhängig in Python ausgeführt. Ein Werkzeug darf die Rechnung unterstützen; die Abgabe muss die angegebene Schlüsselinformation und ihre Verwendung erklären. Nur C1/C3 oder nur ein geratener Klartext würden K15 nicht erfüllen.

## S16 – Demonstrierte Angriffe und Grenzen (A16/K16)

Caesar hat bei festem Alphabet nur 26 Schlüssel. Der tatsächliche Suchlauf erzeugt alle 26 Kandidaten. Im konkreten Fall erlaubt die erkennbare deutsche Mitteilung die Wahl von Schlüssel 9; erneutes Verschlüsseln kontrolliert die Rechnung. Bei zufälligem sehr kurzem Klartext wäre diese sprachliche Auswahl nicht automatisch eindeutig. Bei Caesar bleiben überdies Muster einer monoalphabetischen Ersetzung erhalten.

Ein unbekannter genau dreibuchstabiger Vigenère-Schlüssel hat 26³=17576 Möglichkeiten. In C4 ist jedoch nicht nur der Geheimtext bekannt: Aus neun bekannten Klartextzeichen und Periode drei lässt sich für jede Schlüsselposition der Rest `C−P mod 26` bestimmen und zweimal zusätzlich kontrollieren. Die Folge der neun Reste ist `0,6,23,0,6,23,0,6,23`, also `AGXAGXAGX`. Das ist ein wirklich am Material demonstrierter bekannter-Klartext-Angriff, kein vollständiger 17576er-Bruteforcelauf. Er nutzt den wiederholten kurzen Schlüssel und das bekannte Präfix. Ohne diese Zusatzinformation würde dieses Verfahren den Schlüssel nicht auf dieselbe Weise beweisen. Beide Angriffe betreffen die schwachen klassischen Labormodelle, nicht moderne Transportverschlüsselung oder digitale Signaturen.

## S17 – Drei begründete moderne Schutzentscheidungen (A17/K17)

1. **Offenes WLAN und Webformular:** Ein authentisierter TLS-Transport mit korrekt geprüftem Server schützt den Inhalt und die Integrität auf dem Übertragungsweg und erschwert das Unterschieben eines falschen Servers. Voraussetzung sind eine passende vertrauenswürdige Serveridentität und sichere Endpunkte. Er beweist keine fachliche Berechtigung des Benutzers und schützt nicht vor einem bereits kompromittierten Endgerät, einem fehlerhaften Server oder unzulässiger Speicherung. „POST“ ist dafür kein Ersatz.
2. **Download und Hash von derselben Seite:** Der Hashvergleich kann eine versehentliche Veränderung erkennen, wenn der Vergleichswert vertrauenswürdig ist. Wer Datei und Hash gemeinsam auf der Seite austauschen kann, kann beides passend manipulieren. Eine digitale Signatur mit dem unabhängig authentisch verteilten öffentlichen Schlüssel kann Herkunft/Integrität des Pakets prüfen, sofern der private Schlüssel geschützt ist und die Verifikation das richtige signierte Objekt erfasst. Sie verschlüsselt das Paket nicht und garantiert weder Fehlerfreiheit noch Ungefährlichkeit seines Inhalts.
3. **Gestohlener Laptop:** Verschlüsselung gespeicherter Daten kann die vertrauliche Liste schützen, wenn ein starker Schlüssel nicht zugleich offen auf demselben Datenträger liegt und nicht anderweitig zugänglich ist. Im gegebenen Fall kann der Dieb den ungeschützten Schlüssel mitnehmen; die Schutzannahme ist verletzt. Getrennte geeignete Schlüsselaufbewahrung und gesperrte Geräte verbessern die Lage. Ein entsperrter kompromittierter Rechner oder vorab kopierter Klartext bleibt ein Risiko. Kryptografie ersetzt keine Zugriffskontrolle, Datensparsamkeit oder sichere Betriebsprozesse.

Dies ist eine fachliche Bewertung der gegebenen Fälle, kein durchgeführter TLS-/Signatur-/Laptop-Sicherheitstest.

## S18 – Beobachtung, Authentisierung, Berechtigung und Logrisiken (A18/K18)

Das Log verbindet drei fehlgeschlagene und eine erfolgreiche Anmeldung über `session=s17`, Benutzer und Quelladresse. `MAIL_ACCEPT` mit `queue=LAB-17` passt zur SMTP-Warteschlangenbestätigung. Beobachtet ist: Der Server meldet zuerst Fehler, dann erfolgreiche Anmeldung und Annahme einer Nachricht. Nicht bewiesen sind die Identität einer Person hinter der IP-Adresse, ein tatsächlicher Angriff oder die endgültige Zustellung. Der angemeldete Benutzer `aguser` ist auch nicht automatisch berechtigt, den Envelope-Absender `schulleitung@schule.test` zu verwenden.

Eine begründete Reaktion ist, das Muster zeitnah zu prüfen: erwartete Anmeldung beim Kontoinhaber klären, Zugangsdaten-/Absenderregeln und weitere korrelierte Ereignisse untersuchen und gegebenenfalls nach festgelegtem Verfahren Zugang begrenzen oder Daten ändern. Eine reine Folge von drei Fehlern und einem Erfolg rechtfertigt nicht die erfundene Feststellung eines nachgewiesenen Einbruchs. Die klartextnahe Authentisierung des Laborprotokolls muss für einen realen Dienst durch einen geeigneten geschützten Transport ersetzt werden.

Logs sollten selbst zugriffsgeschützt, zweckgebunden und sparsam sein. Passwörter oder der AUTH-Token gehören nicht in ein allgemeines Betriebslog. Unbegrenzte Speicherung von Adressen und Nachrichtentexten schafft zusätzliche Datenschutz- und Missbrauchsrisiken. Fehlende oder manipulierbare Logs erschweren die Untersuchung; ein vorhandenes Log ist umgekehrt nicht automatisch eine unangreifbare Wahrheit.

## S19 – Vollständige Elementbäume (A19/K19)

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

## S20 – Wirkliche lokale Layoutbeobachtungen (A20/K20)

Die Standardregel erzeugt eine Grid-Spalte; `@media (min-width: 768px)` überschreibt sie mit drei gleich breiten Spalten. 767 liegt unter dem inklusiven Umschaltpunkt, 768 genau darauf. `meta viewport` sorgt bei mobilen Browsern für die beabsichtigte Layoutbreite. Die tatsächlich lokal ausgeführte Chromium-Prüfung ergab:

| Viewport | document.scrollWidth | Spalten | Kartenoberkanten in Pixeln |
| ---: | ---: | ---: | --- |
| 320 | 320 | 1 | 327, 546, 742 |
| 767 | 767 | 1 | 279, 474, 670 |
| 768 | 768 | 3 | 279, 279, 279 |
| 1024 | 1024 | 3 | 279, 279, 279 |

Damit gab es in diesen vier Läufen kein horizontales Überlaufen. Bei jedem Viewport wurde über die echte Seite die Reservierungsfolge 2/2/1 ausgeführt; Rückmeldung und freie Plätze stimmten, Scriptfehler blieben aus. Alle HTTP(S)-Versuche wurden im Prüfkontext blockiert, und es wurde kein solcher Versuch beobachtet. Die Seite blieb eine lokale `file:`-Seite. Das belegt konkrete Struktur, Layout und Bediensequenz dieses Modells in diesem Browser; es ersetzt keine Prüfung anderer Browser, Screenreader oder tatsächlicher Benutzer. Eine automatische Beobachtung wird nicht als menschlicher Bedienversuch ausgegeben.

## S21 – Geplante Testmatrix mit tatsächlichen Ergebnissen (A21/K21)

Die Kernfälle benutzen jeweils neue Ausgangsdaten, soweit nicht die ausdrücklich genannte Sequenz getestet wird. `OK` bedeutet hier die tatsächlich erhaltene Übereinstimmung von Erwartung und Beobachtung im Referenzlauf.

| Test | Ausgang/Eingabe | Erwartung | Beobachtung/Werkzeug |
| --- | --- | --- | --- |
| T01 Normal | Robotik 3/6, zwei Plätze | Erfolg; reserved5, frei1, 600 Cent | OK; Node und echte lokale Formularbedienung |
| T02 Wiederholung | nach T01 nochmals zwei | Fehler, reserved bleibt5 | OK; Node/Browser |
| T03 exakte Restkapazität | nach T02 ein Platz | Erfolg, reserved6/frei0 | OK; Node/Browser |
| T04 Überbuchung | frische Robotik, vier Plätze | abgewiesen, reserved3 | OK korrigiert; V0 fälschlich Erfolg/reserved4 |
| T05 Anzahlgrenzen | 0, −1, 1,5, 7, NaN | keine Mutation, ungültig | OK; Node-Assertions |
| T06 Formfehler | leerer Name, ungültige einfache E-Mail, unbekannter Kurs, `2x`, unbestätigt | gesamter Zustand unverändert | OK; Node, jeder Fall separat |
| T07 Tarif | 1,3,4,6 Plätze | 300,900,1000,1600 Cent | OK; Node und V2/V3-Vergleich |
| T08 alte Logik | V0 mit 2/3/4 | erwartete Sollwerte aus Kapazität | drei rote Ist/Soll-Vergleiche, absichtlicher Exit1 |
| T09 Submit-Anbindung | benannte Felder und Testdaten true | Default verhindert; Ergebnis und Karten aus echtem Zustand | OK; DOM-Testdouble plus echte Chromium-Seite |
| T10 Layout | 320/767/768/1024 | 1/1/3/3 Spalten, kein Überlauf | OK; tatsächliche Layoutwerte S20 |
| T11 Krypto | alle vier festen C-Fälle | S15 und inverse Kontrollen | OK; Node und unabhängiges Python |
| T12 Paketmodell | M7, Ankunft 3/1/2 | Segmente und ACKs S23 | OK; Node und unabhängiges Python |
| T13 Quellenintegration | eingebetteter JS-Kern der HTML-Seite | exakt derselbe geprüfte Anwendungskern | OK; unabhängiger Python-Textvergleich; Browser prüft zusätzlich reale Wirkung |

Die Teststrategie trennt Berechnung/Mutation, Formularbindung, Struktur und tatsächliche Browserbeobachtung. Console-Ausgaben und Assertions lokalisieren die Fehler in M5. Es wurden keine echten HTTP-/SMTP-Verbindungen, keine Lastmessung und keine Produktionstests ausgeführt. Ein grüner Testtitel allein ersetzt nicht die im Ergebnisprotokoll enthaltenen Erwartungs-/Istwerte.

## S22 – Gezielte lauffähige Tarifanpassung (A22/K22)

Aus `return 300 * places` wird nach der vereinbarten Anzahlprüfung `return 300 * places - (places >= 4 ? 200 : 0)`. Der Rabatt wird genau einmal je Anfrage abgezogen. Eine Änderung am bereits gespeicherten Reservierungsstand ist dafür nicht erforderlich. Die Anwendung ruft diese neue Funktion in `book` vor der erfolgreichen Reservierung auf und übernimmt ihren Wert in die sichtbare Meldung.

| Anzahl | Grundpreis | Rabatt | Neuer Betrag |
| ---: | ---: | ---: | ---: |
| 1 | 300 | 0 | 300 Cent |
| 3 | 900 | 0 | 900 Cent |
| 4 | 1200 | 200 | 1000 Cent |
| 6 | 1800 | 200 | 1600 Cent |

0, 7, 1,5 und NaN werden vor der Preisberechnung als gültiger Tariffall abgewiesen. Das Beibehalten der Integer-Cent-Rechnung vermeidet bei diesem Tarif Rundungsfragen. Auch die echte lokale Formularbedienung mit vier Laserplätzen zeigte 10,00 EUR und danach null freie Laserplätze. Die genannte Tabelle wurde tatsächlich aufgerufen; V2(4)=1200 und V3(4)=1000 zeigen die gezielte funktionale Änderung am gegebenen Grundtarif. Eine gewünschte Rabattregel lediglich in Text oder CSS zu schreiben, ohne ihre Verwendung im Programm nachzuweisen, erfüllt K22 nicht.

## S23 – Vollständige Adressierungs-/Segmentierungsantwort (A23/K23)

ASCII hat hier ein Byte je Zeichen. Der Text `TERMINE2026OK!` umfasst 14 Nutzbytes. Die maximale Nutzlänge fünf ergibt:

| Segment | Erste Sequenznummer | Nutztext | Länge | Nächste Sequenznummer nach zusammenhängendem Empfang |
| ---: | ---: | --- | ---: | ---: |
| 1 | 1001 | `TERMI` | 5 | 1006 |
| 2 | 1006 | `NE202` | 5 | 1011 |
| 3 | 1011 | `6OK!` | 4 | 1015 |

| Ankunft | Gerade empfangen | Gepufferter, aber noch nicht anschließbarer Bereich | Kumulatives ACK |
| ---: | --- | --- | ---: |
| 1 | Segment3, Bytes1011…1014 | 1011…1014, Anfang fehlt | 1001 |
| 2 | Segment1, Bytes1001…1005 | 1011…1014, Mitte fehlt | 1006 |
| 3 | Segment2, Bytes1006…1010 | nun alles zusammenhängend | 1015 |

Das ACK bezeichnet die Nummer des nächsten erwarteten Bytes, nicht die zuletzt erhaltene Segmentnummer. Nach Ankunft des mittleren Segments lässt sich auch der vorher gepufferte Rest direkt anschließen. Die Wiederzusammensetzung in Sequenzreihenfolge ergibt unverändert `TERMINE2026OK!`. Die IP-Adressen bezeichnen die beiden Netzendpunkte, die Ports 51000 und 9000 die hier zugeordnete Transportverbindung zu ihren Anwendungen. Die Folge ist ein Rechenmodell ohne reale Paketübertragung; sie erklärt Segmentierung, Adressierung, Pufferung und Wiederzusammensetzung. TCP stellt der Anwendung einen Bytestrom bereit; eine Anwendungsnachricht ist nicht allgemein mit genau einem TCP-Segment gleichzusetzen.

Ein vollständiger ausführbarer Rechner dafür lautet:

```javascript
export function segmentTrace(payload, start, maximum, order) {
  const bytes = Buffer.from(payload, 'ascii');
  const segments = [];
  for (let offset = 0; offset < bytes.length; offset += maximum) {
    segments.push({ sequence: start + offset, payload: bytes.subarray(offset, offset + maximum).toString('ascii') });
  }
  const received = new Set(); let expected = start;
  const arrivals = order.map(index => {
    const segment = segments[index];
    for (let offset = 0; offset < segment.payload.length; offset++) received.add(segment.sequence + offset);
    while (received.has(expected)) expected++;
    return { segment: index + 1, sequence: segment.sequence, length: segment.payload.length, cumulativeAck: expected };
  });
  return { segments, arrivals, endSequence: expected };
}
console.log(segmentTrace('TERMINE2026OK!', 1001, 5, [2, 0, 1]));
```

Die Node- und Python-Referenzen ergeben jeweils ACK 1001/1006/1015. Dieses Segmentmodell wird nicht mit den verschlüsselten HTTP-Endpunktdaten aus M1 vermischt.

## S24 – Sechs konkret begründete Qualitätsurteile (A24/K24)

| Qualitätskriterium | Konkreter Beleg am Referenzprodukt | Urteil und offene Grenze |
| --- | --- | --- |
| Funktionalität | Tabellen S08/S22, tatsächliche Formularfolge und alle M0-Eingabefelder | Für die beschriebene lokale Demonstration werden Zustand, Preis und Anzeige passend berechnet. Ein echter Buchungsdienst mit mehreren Benutzern ist nicht implementiert. |
| Zuverlässigkeit | ungültige/zu große/wiederholte Anfragen lassen reservierte Plätze unverändert; neue Daten je unabhängigen Test | Die geprüften Fehlerfälle erhalten den lokalen Zustand. Stromausfall, Serverausfall, Nebenläufigkeit oder dauerhafte Wiederherstellung wurden nicht untersucht. |
| Benutzbarkeit | verknüpfte Labels, verständliche Erfolg-/Fehlermeldung, sichtbarer Fokus, vier beobachtete Breiten | Die geprüfte Bediensequenz bleibt ausführbar und ohne horizontalen Überlauf. Keine Personengruppe oder assistive Technik wurde getestet; daraus folgt kein allgemeines Benutzbarkeitsurteil. |
| Effizienz | `availableCourses` und Kartenaktualisierung laufen jeweils einmal über die Kursliste; drei lokale Datensätze, kein Netzaufruf | Aufwand der Listenverarbeitung wächst linear mit n; bei n=3 ist die Struktur überschaubar. Es wurde keine Zeit-/Speicherbenchmark oder Skalierbarkeit eines Servers gemessen. |
| Änderbarkeit | gesonderte `priceCents`, `reserve`, `book`; V2→V3 ändert die Tarifformel bei gleichem Zustandskern | Eine konkrete Tarifänderung ist lokal und mit Grenztests absicherbar. Neue Datenarten oder Rollen wären zusätzliche Entwurfsarbeit, kein automatisch bestandener Erweiterungstest. |
| Übertragbarkeit | eigenständige Datei mit Standard-HTML/CSS/JS ohne externe Bibliotheken; tatsächlicher lokaler Chromium-Lauf | Die Abhängigkeiten sind klein. Es gibt nur den belegten lokalen Browserlauf, keine vollständige Browser-/Betriebssystemmatrix oder Installations-/Produktionsfreigabe. |

Damit werden alle sechs genannten Dimensionen beurteilt, ohne bloße positive Adjektive und ohne ungemessene Eigenschaften als bestanden auszugeben.

## S25 – Konkretes Pflichtenheft und Abnahmebindung (A25/K25)

**Ziel:** Eine verständliche lokal ausführbare Demonstration von drei Werkstattangeboten, korrekter temporärer Reservierung und einem überprüfbaren Tarif. **Nichtziele:** echte Anmeldung, echte Konten, Mailversand, Zahlungsabwicklung, Mehrbenutzerbetrieb und dauerhafte personenbezogene Speicherung. Netz- und Kryptomaterialien bleiben analysierte beziehungsweise lokal berechnete Modelle.

**Daten/Schnittstellen:** `Course={id,title,capacity,reserved}` nach M4; Formularwerte `name,email,course,places,testdata`; Anzahltext wird vor Berechnung konvertiert und geprüft. Preise intern in Cent. Der Submit-Handler übergibt ein benanntes Eingabeobjekt an `book` und erhält Status/Text sowie bei Erfolg Betrag/freie Plätze. Eine reale HTTP-Schnittstelle wird erläutert, aber nicht aufgerufen. Neustart der Datei setzt die Demonstrationsdaten zurück; das ist für diesen Auftrag ausdrücklich vereinbart.

| ID | Ermittelte Anforderung und überprüfbare Festlegung | Abnahme/Artefakt |
| --- | --- | --- |
| F1 | Die drei Angebote und anfänglich3/0/4 freien Plätze werden angezeigt. | S04-Struktur; Browserausgangszustand und `availableCourses` |
| F2 | Name und E-Mail dürfen nicht fehlen; nur bekannte Kurs-ID, ganze Zahl1…6 und bestätigte Testdaten werden verarbeitet. | T05/T06; Browser-Attribute und eigene Prüfung vor Mutation |
| F3 | Nur eine kapazitätsverträgliche Anfrage erhöht `reserved` um genau die Anzahl. | S08/T01–T04; exakte Objektwerte und unveränderte Ablehnung |
| F4 | Preis=300×Anzahl Cent; ab4 einmalig200 Cent Rabatt. | S22/T07; 1/3/4/6 und ungültige Grenzfälle |
| F5 | Nach jedem Versuch stimmen Rückmeldung und Kartenanzeige mit dem Zustand überein. | echter Handler/Browserfolge; keine Reservierung bei Fehler |
| N1 | Bei320/767 eine, ab768 drei Karten nebeneinander; kein horizontaler Überlauf in den geprüften Breiten. | S20/T10; vier tatsächliche Layoutmessungen |
| N2 | Navigation, Labels, Tastaturfokus und Statusrückmeldung sind im Dokument vorhanden. | S04/S05; Strukturprüfung; keine behauptete vollständige Nutzerprüfung |
| N3 | Kein echter Versand, keine Konten oder dauerhafte Speicherung. | Codeinspektion; blockierte HTTP(S)-Routen ohne beobachteten Versuch im lokalen Lauf |
| D1 | Mindestens drei echte unterschiedliche Stände mit geprüftem Funktionsumfang und vollständigen Quellen. | S13 V1/V2/V3 und jeweilige Beobachtungen |
| D2 | Tests, Schwächen und Präsentation sind mit Produktbezug dokumentiert. | S11/S14/S21/S24; gespeicherte Ergebnisse statt bloßer Behauptungen |

**Präzisierungen/Annahmen:** „Ab vier“ meint die Anzahl in einer einzelnen Anfrage. Die Kapazität wird nicht durch fehlerhafte Anfragen geändert. M0 fordert eine Simulation; ein Browserneustart darf deshalb die Belegung zurücksetzen. Die lokale E-Mail-Prüfung ist keine Ermittlung einer realen Person oder eines realen Postfachs. Der fiktive Datenbestand vermeidet echte personenbezogene Daten. Offene Anforderungen an einen produktiven Dienst werden als neuer Auftrag aufgelistet und nicht in die hier bestandene Abnahme hineingelesen.

Eine Lernendenabgabe muss eigene nachvollziehbare Anforderungsermittlung und Festlegungen zeigen, nicht lediglich eine allgemeine Überschrift „Pflichtenheft“. Die Beispielabnahme bindet konkrete Anforderungen an tatsächlich benannte Produkt-/Prüfartefakte; ihre Existenz ist keine Freigabe dieser Prüfung oder des Curriculums.
