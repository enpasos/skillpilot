# Bayern: 30 nur teilweise zugeordnete Pflichtquellen-Atome

Stand 27. September 2026. Dies ist eine **Kandidaten-Triage**, keine
Mapping-Freigabe, keine D-Resolution und keine M7-Änderung. Maßgeblich sind
die amtlichen Fachlehrpläne [Mathematik 12](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer)
und [Mathematik 13](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/mathematik).
`partial` im Source-Mapping bedeutet nicht automatisch `optional`: Eine
amtliche Kompetenz kann in mehrere atomare Kanonziele aufgeteilt sein.
Ebenso wenig macht ein `partial`-Mapping das **gesamte** Ziel automatisch
zum bayerischen Pflichtstoff.

Erste quellenbezogene Einordnung der 30 curricularAtomic-Seiten mit
ausschließlich `partial`-Mappings aus `JGST12_EA` oder `JGST13_EA_TEIL1/2`:

| Fall | Ziel-ID-Präfixe | Nächster Schritt |
| --- | --- | --- |
| 22 plausibel vom Pflichtlehrplan gedeckte Teilkompetenzen | `da95ab35`, `55d0474b`, `8c32d941`, `628928a6`, `06ce2b1b`, `b9bbd2a8`, `e9ad45b9`, `075f1ef2`, `aae119f2`, `d81d888c`, `be0e8715`, `9460c3ff`, `ea4bd128`, `cf48c918`, `ae5010cc`, `972cc7e8`, `23589682`, `71683f37`, `24174bba`, `69beb31d`, `0f4f9957`, `3def350a` | Jedes Ziel samt zusätzlicher Kanon-Anforderung gegen die exakte Lehrplanstelle gegenprüfen; Source-Union begründen; danach fachlich zulässige BY-GK- und BY-LK-Placement und aktuelle D/P/A/M/V-Bindung herstellen. |
| 5 Ziele mit möglicher Überforderung gegenüber der BY-Pflichtquelle | `c406d5a0`, `0f180645`, `c72a8032`, `e28e906e`, `61686d85` | Bestehendes Ziel nicht pauschal als BY-Pflicht klassifizieren. Einen bereits passenden engeren Kanon-Ast wiederverwenden oder ein eigenes BY-Pflichtatom modellieren; überregionale Bedeutung des breiteren Ziels erhalten. |
| 3 fachlich noch nicht hinreichend geklärt | `ab720928`, `31be24f0`, `a9ed219d` | Exakten Wortlaut, ggf. Formeln im amtlichen PDF und vorhandene Source-Rationale vor jeder Geltungsentscheidung prüfen. |

Die vier aktuell selbst im BY-LK-Atlas fehlenden Ziele `24174bba`,
`69beb31d`, `0f4f9957` und `3def350a` betreffen Lagebeziehungen und
Schnittpunkte im Raum. Ein zweiter, unabhängiger Abgleich mit M13.3 und
den bereits in [M9.2.2](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/mathematik)
verlangten dreivariablen linearen Gleichungssystemen stützt alle vier
**als zusammengesetzt belegte Pflichtkompetenzen**. Ihre einzelnen
Mapping-Zeilen bleiben korrekt `partial`; eine Einzelzeile wird nicht
nachträglich als `exact` ausgegeben.

Vor dem Placement ist jedoch die Voraussetzungskette zu bereinigen:
`0f4f9957` (Ebenenlage) heißt noch „(LK)“ und verlangt derzeit u. a.
`36e0de23` (LK-spezifische Hesse-/Abstandsvertiefung) sowie zwei in
BY-GK nicht sichtbare Ziele `d76766a5` und `ce491ec0`. Bloßes
Einfügen in eine GK-View würde das Ziel im Frontier blockieren oder
irreführend bezeichnen. Auch die drei übrigen Ziele sind **noch nicht**
direkt einfügbar: Ihre Voraussetzungskette enthält `effe43eb`
(Raumgeraden), `9cc650e0` (Ebenen-Koordinatenform) bzw. `ea4bd128`
(Ebenengleichungen); alle drei sind im aktuell in-memory gebauten
BY-Atlas nur LK-Ziele, obwohl ihre kanonischen Tags GK zulassen.
Die erforderliche Pfadkette muss daher quellengebunden mitmodelliert
und getestet werden. Titel-, `requires`- und Scope-Änderungen brauchen
frische betroffene QA-Bindungen; die vorliegende Quellenprüfung ist
keine solche Freigabe.

Ein rein diagnostischer Durchlauf über die **transitiven** `requires`
der vier Atlas-Seiten findet derzeit 10, 6, 19 bzw. 11 vorausgesetzte
Seiten ohne BY-Sek-II-GK-`target` (in derselben Reihenfolge wie oben).
Das ist eine Arbeitsliste, **keine** Aufforderung, alle diese Seiten
blind in Sek II zu setzen: Frühere Sek-I-Kompetenzen und absichtlich
`prerequisiteOnly` referenzierte Ziele müssen von fehlenden Pflichtzielen
unterschieden werden. Für jedes neu platzierte Ziel wird die
erreichbare Frontier-Kette explizit getestet.

Konkrete Überclaim-Hinweise: `c406d5a0` verlangt auch einen unbekannten
Normalverteilungsparameter, während M13.2 passende Intervallgrenzen
verlangt. `0f180645` fordert eine Formelherleitung statt nur
Volumenbestimmung. `c72a8032` lässt die amtliche Einschränkung „in
einfachen Fällen“ weg. `e28e906e` verlangt eine Herleitung von
Sinus-/Kosinus-Ableitungen, während M12.1.3 eine grafische
Plausibilisierung fordert. `61686d85` reicht mit `1/x^n` für beliebige
positive `n` über die in M12.4.1 genannten einfachen gebrochen-rationalen
Funktionen hinaus. Die letzten beiden stehen bereits in BY-GK; ihre
bisherige Platzierung ist somit kein Qualitätsbeweis.

Die Review-Rationales im BY-Mapping zu `61686d85` und `71683f37`
beschreiben offenbar andere oder breitere Ziele als der aktuelle
Kanontext. Vor einer D-/Source-Freigabe sind diese Stellen am Original
und aktuellen Zieltext zu berichtigen, nicht lediglich neu zu hashen.

Die technische Zwischenregel bleibt unverändert: BY-`GK` ist das ganze
Pflichtfach; BY-`LK` enthält es plus **alle fünf** Vertiefungsmodule.
Von den 30 Seiten stehen derzeit sechs in beiden BY-Profilen, 20 nur
in BY-LK und vier in keinem. Diese Zahlen beschreiben den **Ist-Zustand**,
nicht die fachlich gewünschte Endprojektion. Der spätere echte
Wahlkurs-/Modulauswahl-UX-Umbau in Issue #59 ist davon unabhängig.
