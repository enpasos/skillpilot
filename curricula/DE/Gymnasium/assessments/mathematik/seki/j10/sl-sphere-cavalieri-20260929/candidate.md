# Kugelvolumen mit Cavalieri – SL Jahrgang 10

Status: KI-Entwurf, `needs_review`; keine Freigabe oder menschliche Erprobung. Ziel: `baea3966-5d10-53bf-8193-3fcda7b1e73f`; Prüfungs-ID: `79f5f4cc-10e1-56a5-8ed3-8cd51688db41`.

Quelle: Saarland LP Mathematik Gymnasium G9 Klassenstufe10 (2026), S.34–36. Pflichtalternative Volumen-Herleitung gewählt; die Oberflächen-Herleitung wird nicht zusätzlich als Pflicht gefordert.

<a id="aufgabe"></a>

## Aufgabe (12 BE)

Für ein Modell aus waagerechten Schichten werden zwei Körper verglichen. Eine Kugel mit Radius $r>0$ liegt mit ihrem Mittelpunkt in der Höhe $z=0$. Ein gerader Zylinder mit demselben Radius reicht von $z=-r$ bis $z=r$. Aus dem Zylinder werden zwei gerade Kegel herausgenommen: Beide Spitzen liegen im Zylindermittelpunkt; die Grundkreise sind die obere und die untere Zylindergrundfläche. Jeder Kegel hat also Radius und Höhe $r$. Mit „Restkörper“ ist der Zylinder ohne diese beiden Kegel gemeint.

1. Beginne mit $r=3\,\mathrm{cm}$. Bestimme für Kugel und Restkörper die Querschnittsflächen in den Höhen $z=0$ und $z=1{,}5\,\mathrm{cm}$. Skizziere dazu einen senkrechten Schnitt durch die gemeinsame Achse. (2 BE)
2. Betrachte nun einen beliebigen Radius $r$ und eine beliebige Höhe $-r\le z\le r$. Leite mit Pythagoras den Flächeninhalt des Kugelquerschnitts her. Begründe über ähnliche Dreiecke den Radius des herausgenommenen Kegelquerschnitts und bestimme damit den Flächeninhalt des Restkörperquerschnitts. Vergleiche beide Ausdrücke. (4 BE)
3. Begründe, warum der Satz von Cavalieri auf die Kugel und den Restkörper anwendbar ist. Leite daraus mit den bekannten Zylinder- und Kegelvolumenformeln eine Formel für das Kugelvolumen her. Bestimme anschließend das Volumen für $r=3\,\mathrm{cm}$. Die Kugelvolumenformel darfst du hier nicht voraussetzen. (4 BE)
4. Jemand meint: „Es reicht, dass beide Körper gleich hoch sind und ihre Schnitte bei $z=0$ dieselbe Fläche haben.“ Beurteile diese Begründung und erläutere, welche Aussage stattdessen benötigt wird. (2 BE)

## Lösung

1. Bei $r=3$ gilt für beide Körper: In der Mitte $z=0$ beträgt der Schnittinhalt $9\pi\,\mathrm{cm}^2$; bei $z=1{,}5$ beträgt er $(9-2{,}25)\pi=6{,}75\pi\,\mathrm{cm}^2$. Im Achsenschnitt erscheint die Kugel als Kreis und der Restkörper als Rechteck nach Herausnahme zweier Dreiecke mit gemeinsamer Spitze im Mittelpunkt.

2. Für den Kugelschnittradius $\rho$ gilt $\rho^2+z^2=r^2$, daher $A_K(z)=\pi(r^2-z^2)$. Im jeweiligen Kegel gilt wegen ähnlicher Dreiecke $q/r=|z|/r$, also $q=|z|$. Der Restkörper hat einen Kreisringquerschnitt mit $A_R(z)=\pi r^2-\pi|z|^2=\pi(r^2-z^2)$. Bei $z=0$ ist der herausgenommene Kreis entartet; bei $z=\pm r$ ist die Restfläche null. Die Flächeninhalte stimmen in jeder Höhe überein, obwohl Kreis und Kreisring verschiedene Formen besitzen.

3. Beide Körper reichen von $-r$ bis $r$, haben also dieselbe Höhe $2r$. Alle Schnitte parallel zu den Grundebenen haben in gleicher Höhe denselben Flächeninhalt. Cavalieri liefert daher gleiche Volumina. Der Restkörper hat $V_R=\pi r^2\cdot2r-2\cdot\frac13\pi r^2r=(2-\frac23)\pi r^3=\frac43\pi r^3$. Somit ist dies auch das Kugelvolumen. Für $r=3\,\mathrm{cm}$ ergibt sich $V=36\pi\,\mathrm{cm}^3\approx113{,}1\,\mathrm{cm}^3$.

4. Die Behauptung reicht nicht: Gleiche Gesamthöhe und nur ein gleicher Querschnitt schließen unterschiedliche übrige Schichtflächen und somit verschiedene Volumina nicht aus. Erforderlich ist die Gleichheit der Querschnittsflächen in jeder gleichen Höhe. Die allgemeine Rechnung in Teilaufgabe 2 liefert genau diese Aussage; zwei numerische Probeschnitte allein liefern sie nicht.

## Bewertung

{
  "maxPoints": 12,
  "passingPoints": 10,
  "steps": [
    {
      "id": "sphere_cavalieri_examples",
      "points": 2,
      "description": "Achsenbild und beide numerischen Querschnittsvergleiche stimmen."
    },
    {
      "id": "sphere_cavalieri_general_sections",
      "points": 4,
      "description": "Kugelschnitt aus Pythagoras (2 BE), Kegelschnittradius aus Ähnlichkeit und Restfläche (2 BE) allgemein hergeleitet; bloße Angabe der Gleichheit ersetzt keine Herleitung."
    },
    {
      "id": "sphere_cavalieri_volume_derivation",
      "points": 4,
      "description": "Gleiche Höhen und alle höhengleichen Querschnittsflächen begründet (1 BE), Zylinder minus zwei Kegel zur Kugelformel umgeformt (2 BE), Zahlenwert und Volumeneinheit (1 BE). Voraussetzen der Kugelformel erhält keine Herleitungs-BE."
    },
    {
      "id": "sphere_cavalieri_condition_check",
      "points": 2,
      "description": "Ein einzelner Querschnitt reicht nicht; notwendige Bedingung für jede gleiche Höhe erläutert."
    }
  ]
}

10 von 12 BE sind zum Bestehen nötig. Ohne allgemeine Querschnittsherleitung oder ohne Volumenherleitung sind jeweils höchstens 8 BE erreichbar. Abgedeckt wird ausschließlich die Herleitungskompetenz; vorausgesetzte Zylinder-/Kegelberechnungen, Ähnlichkeit und Pythagoras werden nicht als zusätzliche gemeisterte Ziele ausgegeben.
