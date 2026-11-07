# Lösung und Rubrik: Formular

Die beigefügten `web-solution.html` und `web-solution.css` sind eine vollständige Musterlösung. Der HTML-Link auf `/info` bleibt eine vorgegebene Zieladresse; diese Aufgabe benötigt keine zusätzliche Infoseite. Der lokale Server wird nicht implementiert.

**W1, 3 Kriterien:** (1) Vollständiges korrekt verschachteltes HTML mit Grundgerüst, `main`, Überschriften, `section`, Liste und Hyperlink. (2) Formular mit `action="/anmeldung"`, `method="post"`, Textfeld `name="name"`, Auswahlfeld `name="termin"`, passenden Labels und Submitbutton. (3) `id` identifiziert ein Element im Dokument und dient hier der Labelzuordnung; `name` benennt den übertragenen Formularwert. Allein `id="person"` sendet keinen `name`-Wert.

**W2, 2 Kriterien:** (1) Baum enthält korrekt `main -> h1,p,section,form`, `p -> a`, `section -> h2,ul`, `ul -> li,li`. (2) `form -> div,div,button`; erstes `div -> label,input`; zweites `div -> label,select`; `select -> option,option`. Eine gleichwertige andere gültige eigene HTML-Lösung erhält ihren dazu passenden Baum. Geschwister sind keine Unterelemente voneinander.

**W3, 3 Kriterien:** (1) Korrekte Grundtypografie und `main`-Breite, Innenabstand, automatische horizontale Außenränder. (2) `form` verwendet `display:grid`, eine Spalte und den verlangten Gap; die Feldgruppen ordnen Label und Eingabe untereinander. (3) `.feld` trifft beide Klassenmitglieder, `#feld` hätte nur ein Element mit `id="feld"` getroffen, das im Ausgangsdokument gar nicht vorhanden ist. Andere passende einfache CSS-Lösungen zählen, solange der verlangte Grundgrid wirklich benutzt wird.

**W4, 2 Kriterien:** (1) Übertragung `name=Lea&termin=fr`; POST-Body enthält diese Zeichenfolge bei `Content-Type: application/x-www-form-urlencoded`; bei GET lägen die gleichen Daten in `/anmeldung?name=Lea&termin=fr`. Der Button besitzt keinen Namen und erzeugt hier kein eigenes Feld. (2) GET/POST regeln unter anderem Anfrageform/-semantik, sind keine Verschlüsselung. Beide brauchen für geschützten Transport HTTPS; sensible Daten können außerdem in Logs, Endgeräten oder Serveranwendungen sichtbar bleiben. W1 benutzt POST wegen des konkret festgelegten Serververtrags, nicht weil POST an sich geheim wäre.

**Bewertung:** 10 binäre Mindestkriterien, je 1 Punkt; bestanden bei 10/10. Die vier abgedeckten Kompetenzen werden dadurch nicht gegeneinander ausgeglichen. Stilpräferenzen und unnötige Zusatzfeatures sind keine Kriterien.

**Gegenfälle:** Nur `method` ändern lässt den Namen verschwinden; nur `id="name"` ergänzt weiterhin keinen Übertragungsnamen. Der Baum `input -> label` ist falsch. Ein funktionierender Blocksatz ohne Grid erfüllt W3.2 nicht. Ein Grid mit zwei Spalten statt der verlangten einen ist kein korrekter Ersatz. „POST ist verschlüsselt“ verfehlt W4.2. Dieses einfache Grid prüft keine Anpassung an unterschiedliche Viewports; das weitergehende kanonische Ziel `f15d09fd...` wird nicht anerkannt.
