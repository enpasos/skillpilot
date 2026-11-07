# Schul-AG: Kleine Buchungslogik korrigieren und prüfen

Dies ist eine reine lokale Übung; keine echte Buchung, Serververbindung oder Datenbank. Eine AG hat 6 Plätze, 2 sind schon belegt. Das bereitgestellte Objekt `plan` trägt genau diesen Zustand. Ein Klick auf den Button soll `plan.buche(...)` aufrufen und den Rückgabestring in das Ausgabelabel schreiben. Die GUI-Elemente und Ereignishülle sind gegeben; Sie ergänzen die Ein-/Ausgabe. Sie müssen weder Klassen entwerfen noch einen Server programmieren.

## Vollständiger Funktionsvertrag

Eine Eingabe besteht aus einer oder mehreren durch Kommas getrennten Gruppengrößen. Jeder Teil wird durch `Number(teil)` konvertiert und muss eine ganze Zahl zwischen 1 und 6 sein. Leere und nur aus Leerzeichen bestehende Teile sind ungültig. Alle von `Number` akzeptierten Darstellungen dieser Zahlen sind hier erlaubt. Es gibt absichtlich keine Beschränkung auf eine Ziffernschreibweise. `Number.isInteger(...)` ist vorgegeben als Prüfung auf eine endliche ganze Zahl. `split(",")` liefert ein Feld von Zeichenketten; `trim()` entfernt äußere Leerzeichen.

Die gesamte Anfrage wird atomar behandelt: Entweder alle Gruppen passen zusammen auf die noch freien Plätze oder keine wird gebucht. Teilbuchungen sind unzulässig. Bei ungültiger Eingabe lautet das Ergebnis exakt `Ungültige Eingabe.`; bei zu wenig Platz `Nicht genug Plätze.`. In beiden Fällen bleiben die belegten Plätze unverändert. Andernfalls erhöht sich `plan.belegt` um die Summe, und die Rückgabe lautet beispielsweise `Gebucht: 3; frei: 1`. Genaues Füllen ist erlaubt. Ein neuer Klick arbeitet auf dem aktuellen Objektzustand weiter.

## Material P1: Vollständig ausführbare, fehlerhafte Buchungsfunktion

```javascript
const plan = {
  kapazitaet: 6,
  belegt: 2,
  buche(eingabe) {
    let summe = 0;
    for (const teil of eingabe.split(",")) {
      const n = Number(teil);
      if (teil.trim() === "" || !Number.isInteger(n) || n < 1 || n > 6) {
        return "Ungültige Eingabe.";
      }
      summe = summe + teil;
    }
    if (summe >= this.kapazitaet - this.belegt) {
      return "Nicht genug Plätze.";
    }
    this.belegt = summe;
    return "Gebucht: " + summe + "; frei: " + (this.kapazitaet - this.belegt);
  }
};
```

## Material P2: Gegebene Benutzeroberfläche

```html
<label for="gruppen">Gruppengrößen</label>
<input id="gruppen" type="text" value="2,1">
<button id="buchen" type="button">Buchen</button>
<output id="antwort" aria-live="polite"></output>
```

```javascript
document.querySelector("#buchen").addEventListener("click", () => {
  // Ergänzen Sie hier Einlesen, Methodenaufruf und Ausgabe.
});
```

API-Hilfe: `document.querySelector("#gruppen").value` liest den aktuellen Text als String. Durch Zuweisung an `document.querySelector("#antwort").textContent` wird Text ausgegeben. Die vorgegebene Ereignishülle führt den ergänzten Code bei jedem Klick neu aus. Andere DOM- oder HTML-Kenntnisse sind hier nicht erforderlich.

## Arbeitsauftrag

1. Führen Sie den Ausgangscode für `2,1` schrittweise aus. Halten Sie mit einem tatsächlichen Konsolen-Trace oder Debugger-Watch nach jedem Schleifendurchlauf `teil`, `n`, `summe` und den Datentyp von `summe` fest. Erklären Sie Ursache und Auswirkung des Fehlers. Finden Sie außerdem einen Eingabefall, der das Grenzproblem der Platzprüfung zeigt, sowie den Fehler bei der Zustandsänderung. (3 Kriterien)
2. Korrigieren und zerlegen Sie den Code in eine Funktion `summeAnfragen(eingabe)`, die die Zahlensumme oder `null` zurückgibt und keine Zustände verändert, und die Methode `plan.buche(eingabe)`, die diese Funktion aufruft, die Kapazität prüft und gegebenenfalls den Objektzustand verändert. Geben Sie den vollständigen lauffähigen Code und einen kurzen Ablaufplan in Worten oder als Struktogramm ab. Begründen Sie die Wahl der Parameter, Rückgaben und die Trennung der beiden Aufgaben. (4 Kriterien)
3. Ergänzen Sie die Ereignishülle um lauffähige Ein-/Ausgabe. Erklären Sie an einem Klick mit `2,1` den Datenfluss vom Textfeld über Funktionsparameter und Rückgabe bis zum Ausgabeelement. Nennen Sie die belegten und freien Plätze vor/nach dem Klick und nach einem weiteren Klick mit `1`. Begründen Sie, weshalb `this.belegt` ein Objektzustand ist und weshalb reine lokale Summenänderungen den Zustand noch nicht buchen. (2 Kriterien)
4. Planen und führen Sie mindestens folgende Tests aus. Dokumentieren Sie für jeden Test Anfangszustand, Eingabe, erwartete Ausgabe/Endzustand, tatsächliche Ausgabe/Endzustand und Befund: normale Mehrfachgruppe, genaues Füllen, Überbuchung, fehlerhafte Eingabe einschließlich leerem Teil, Randwerte 1 und 6, aufeinanderfolgende Klicks und abgelehnte Anfrage ohne Teilbuchung. Verwenden Sie frische Objekte, wenn nicht ausdrücklich eine Folge geprüft wird. Zeigen Sie mindestens einen fehlgeschlagenen Ausgangstest und denselben erfolgreichen Test nach der Reparatur. (3 Kriterien)

Abgabe: Trace, korrigierter Code, Ablauf-/Schnittstellenerklärung und tatsächliches Testprotokoll. Programmiersprache dieses eigenen Übungsangebots ist JavaScript; daraus folgt keine Festlegung der Programmiersprache einer hessischen Schule. Gleichwertiger lauffähiger Code zählt, sofern die gegebenen Schnittstellen eingehalten werden. Die Übung prüft keine objektorientierte Modellierung oder Klassenhierarchie.
