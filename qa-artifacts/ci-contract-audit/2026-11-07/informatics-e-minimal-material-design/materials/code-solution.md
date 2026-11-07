# Lösung und Rubrik: Buchungslogik

`code-solution.mjs` ist die vollständige lauffähige Musterlösung; die Factory erzeugt lediglich frische Testobjekte. Für die gegebene Benutzeroberfläche wird deren `plan` verwendet. Keine Eingabe wird an einen Server gesendet.

**P1, 3 Kriterien:** (1) Tatsächlicher Trace für `2,1`: nach erstem Durchlauf `teil="2"`, `n=2`, `summe="02"`, Typ `string`; nach zweitem `teil="1"`, `n=1`, `summe="021"`, Typ `string`. Der Operator addiert hier eine Zeichenkette an; beim Vergleich wird `"021"` als 21 interpretiert, daher ungerechtfertigte Ablehnung. Die Korrektur summiert `n`. (2) Eingabe `4` füllt bei Anfangsbelegung 2 genau 6 Plätze; `>=` lehnt diese zulässige Grenze ab, `>` ist richtig. (3) `this.belegt = summe` überschreibt frühere Belegung und kann im Ausgangscode sogar einen String speichern; erforderlich ist die numerische Erhöhung um die neue Summe.

**P2, 4 Kriterien:** (1) `summeAnfragen` iteriert über das ganze Eingabefeld, konvertiert jeden Teil, prüft Leere/Ganzzahligkeit/1–6 und liefert bei irgendeinem ungültigen Teil `null`; keine zustandsändernde Teilbuchung. (2) Gültige Teile werden numerisch aufsummiert und die vollständige Summe zurückgegeben. (3) `buche` übergibt den Eingabestring, nutzt den Rückgabewert, unterscheidet `null` von Zahlen, prüft die aktuelle freie Kapazität und lässt den Zustand bei Ablehnung unverändert; genaues Füllen ist erlaubt. (4) Der vollständige korrigierte Code läuft; Ablaufplan/Schnittstellenerklärung begründen die reine Auswertung getrennt von zustandsabhängiger Buchung. Eine bloße Übernahme zweier Funktionsnamen ohne funktionierende Zerlegung genügt nicht.

**P3, 2 Kriterien:** (1) Die selbst ergänzte Ereignishülle liest tatsächlich einen String aus dem Textfeld, übergibt ihn an `buche` und weist den Nachrichtentext `textContent` zu. Die Erklärung stimmt damit überein: `buche` nutzt die Rückgabe der Auswertungsfunktion. Nummer, String, Feld und Wahrheitsausdruck werden an ihren tatsächlichen Verwendungen unterschieden. (2) Nach `2,1`: `belegt=5`, frei=1, Ausgabe `Gebucht: 3; frei: 1`; nach anschließendem `1`: `belegt=6`, frei=0, Ausgabe `Gebucht: 1; frei: 0`. Die Objektzuweisung bleibt über Aufrufe erhalten, die lokale Summe wird je Aufruf neu berechnet. Reine Änderung einer lokalen Zahl ändert `plan.belegt` nicht.

Vollständige Ergänzung der Ereignishülle:

```javascript
document.querySelector("#buchen").addEventListener("click", () => {
  const eingabe = document.querySelector("#gruppen").value;
  document.querySelector("#antwort").textContent = plan.buche(eingabe);
});
```

**P4, 3 Kriterien:** (1) Der Testplan begründet Normalfall, Grenzen und Fehlerklassen einschließlich leerem Teil; nicht nur drei ähnliche Erfolgseingaben. (2) Tatsächliches Protokoll enthält Erwartung und Beobachtung für Ausgabe **und** Zustand, frische Ausgangszustände sowie die Klickfolge. Ablehnung von `2,3` bei Belegung2 darf nicht erst zwei Plätze buchen und danach ablehnen. (3) Ein echter Trace/Debuggerbeleg und der beobachtete Vorher-/Nachher-Gegenfall werden zur Fehlerlokalisierung und erfolgreichen Reparatur verwendet; erwartete Werte allein gelten nicht als ausgeführter Test.

Muster-Testwerte bei frischem Zustand `(Kapazität6, belegt2)`:

| Eingabe | Ergebnis | Endbelegung |
|---|---|---:|
| `2,1` | `Gebucht: 3; frei: 1` |5|
| `4` | `Gebucht: 4; frei: 0` |6|
| `5` | `Nicht genug Plätze.` |2|
| `1` | `Gebucht: 1; frei: 3` |3|
| `6` | `Nicht genug Plätze.` |2|
| `2,3` | `Nicht genug Plätze.` |2|
| `2,x` / `2,,1` / leere Eingabe | `Ungültige Eingabe.` |2|
| `0` / `7` / `1.5` / `Infinity` | `Ungültige Eingabe.` |2|
| ` 2 , 1 ` | `Gebucht: 3; frei: 1` |5|

Bei der Folge `2,1` → `1` → `1` entstehen Belegungen5 →6 →6; der letzte Aufruf wird mit `Nicht genug Plätze.` abgelehnt. Gemäß explizitem Sprachkonvertierungsvertrag sind auch `2e0` und `0x2` als Zahl2 zulässig; ein schulisches anderes Eingabeformat müsste ausdrücklich einen anderen Vertrag und andere Lösung bekommen.

**Bewertung:** 12 binäre Mindestkriterien, je 1 Punkt; bestanden bei 12/12. Sprachstil und ein bestimmtes Werkzeug werden nicht bewertet; die fachliche Prüfung muss tatsächlich stattgefunden haben. Code allein ohne Zustands-/Testnachweis reicht nicht für die deklarierte Coverage. Ein wenig kürzerer Code genügt, sofern alle Anforderungen erkennbar erfüllt sind.

**Gegenfälle:** Zeichenkettenaddition; `>=` statt `>`; Überschreiben statt Erhöhen der Belegung; Zustandsänderung vor vollständiger Validierung; Testen nur der Rückgaben, ohne `belegt` und dessen numerischen Typ zu kontrollieren; wiederverwendetes Objekt versehentlich als frischer Test; reine Behauptung, Tests seien erfolgreich. Alle sind durch konkrete Eingaben unterscheidbar. Qualitätssiegel, formales Pflichtenheft, Versionsmanagement oder Teamprojektleistung werden nicht miterteilt.
