# Schul-AG: Ein Formular nachvollziehbar reparieren

Die Seite läuft in einem lokalen Übungsrahmen. Es gibt keine echten Anmeldungen. Der folgende Serververtrag ist vollständig für diese Aufgabe: `POST /anmeldung` nimmt `application/x-www-form-urlencoded` mit den Feldern `name` und `termin` entgegen; bei dem Beispiel `name=Lea&termin=fr` antwortet er mit `200 OK` und `Anfrage empfangen`. Er bucht keine Plätze. Kein JavaScript und kein eigener Servercode sind für diese Aufgabe nötig.

## Material W1: Fehlerhafter Ausgangsstand

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>AG-Anfrage</title>
  <link rel="stylesheet" href="ag.css">
</head>
<body>
  <main>
    <h1>AG-Anfrage</h1>
    <p>Informationen stehen bei <a href="/info">unserer AG</a>.</p>
    <form action="/anmeldung" method="get">
      <div class="feld">
        <label for="person">Name</label>
        <input id="person" type="text" required>
      </div>
      <div class="feld">
        <label for="termin">Termin</label>
        <select id="termin" name="termin">
          <option value="do">Donnerstag</option>
          <option value="fr">Freitag</option>
        </select>
      </div>
      <button type="submit">Anfragen</button>
    </form>
  </main>
</body>
</html>
```

```css
/* ag.css */
body { font-family: sans-serif; }
#feld { margin-bottom: 0.75rem; }
form { display: block; }
```

## Arbeitsauftrag

1. Geben Sie ein vollständiges korrigiertes HTML-Dokument ab. Ergänzen Sie vor dem Formular einen mit `h2` überschriebenen Abschnitt mit einer ungeordneten Liste der beiden Termine. Verwenden Sie weiterhin `main`, gültige Verschachtelung, den vorhandenen Hyperlink und zwei verschiedene Eingabeelementtypen. Das Formular muss den genannten Serververtrag erfüllen. Erläutern Sie am Namenfeld den Unterschied zwischen `id` und `name`. (3 Kriterien)
2. Zeichnen Sie den Elementbaum Ihres `main`-Elements bis einschließlich `input`, `select`, dessen `option`-Elementen und dem Button. Textknoten müssen nicht eingezeichnet werden. Begründen Sie die Eltern-Kind-Beziehungen zwischen Formular, Feldgruppen und Eingabeelementen. (2 Kriterien)
3. Korrigieren und ergänzen Sie die CSS-Datei: serifenlose Schrift; `main` mit höchstens `36rem` Breite, automatisch gleichen Außenrändern links/rechts und `1rem` Innenabstand; das Formular als **einspaltiges** Grid mit `0.75rem` Abstand zwischen seinen direkten Kindern; jede `.feld`-Gruppe mit Label oberhalb des Eingabeelements. Erläutern Sie Klasse und ID am fehlerhaften Selektor `#feld`. Keine Breakpoints, zweite Layoutvariante oder Responsive-Spezialleistung sind verlangt. (3 Kriterien)
4. Nehmen Sie die Eingabe `Lea`, Auswahl `Freitag`. Schreiben Sie die resultierenden Feld-Wert-Paare und den Anfragebody in der vorhandenen Reihenfolge. Vergleichen Sie damit die Query einer entsprechenden GET-Anfrage. Begründen Sie, weshalb POST allein keine Verschlüsselung gewährleistet. (2 Kriterien)

Abgabe: vollständiges HTML, vollständiges CSS, Baum und kurze Erläuterungen. Die Dokumente müssen aus den Angaben allein rekonstruierbar sein. Exakte Einrückung oder zusätzliche sinnvolle Attribute sind keine Pflicht.
