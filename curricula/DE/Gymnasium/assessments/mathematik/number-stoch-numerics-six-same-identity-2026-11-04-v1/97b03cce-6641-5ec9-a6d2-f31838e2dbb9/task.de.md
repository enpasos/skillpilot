# Ein mathematisches RSA-Modell

Eine Empfängerin verwendet die verschiedenen Primzahlen $p=11$ und $q=17$
und den öffentlichen Exponenten $e=7$. Nachrichten sind hier die ganzen
Zahlen $m$ mit $0\leq m<n$, wobei $n=pq$ gilt. Zeige die Rechenschritte
und begründe deine Aussagen. Insgesamt sind **20 BE** erreichbar.

**1. Schlüssel bilden (4 BE)**

Berechne $n$ und $\varphi(n)=(p-1)(q-1)$. Prüfe die Bedingung an $e$ und
bestimme einen positiven privaten Exponenten $d<\varphi(n)$ mit
$ed\equiv1\pmod{\varphi(n)}$. Prüfe dein Ergebnis.

**2. Asymmetrisches Prinzip erläutern (3 BE)**

Gib den öffentlichen und den privaten Schlüssel in einer eindeutig erklärten
Schreibweise an. Beschreibe, welche Daten ein Absender zum Verschlüsseln
benutzt und welche Daten die Empfängerin zum Entschlüsseln verwendet.
Erläutere daran, was hier „asymmetrisch“ bedeutet.

**3. Nachrichten verschlüsseln und zurückgewinnen (6 BE)**

Verschlüssele $m=20$ und $m=11$ mit $c\equiv m^e\pmod n$; wähle jeweils
$0\leq c<n$. Zeige eine nachvollziehbare modulare Potenzrechnung.
Entschlüssele beide Ergebnisse mit $m'\equiv c^d\pmod n$ und prüfe,
welche ursprüngliche Nachricht zurückkommt. Eine geeignete
Quadrat-und-Multiplizier-Rechnung oder eine gleichwertige modulare Rechnung
genügt; bloß ausgegebene Endwerte genügen nicht.

**4. Korrektheit plausibel begründen (7 BE)**

Begründe für **jede** Nachricht $0\leq m<n$, warum Entschlüsseln nach
Verschlüsseln wieder $m$ ergibt. Betrachte dazu die Reste modulo $11$ und
modulo $17$ und führe die Ergebnisse zusammen. Berücksichtige ausdrücklich,
dass eine Nachricht durch $11$ oder durch $17$ teilbar sein kann, und ordne
das Beispiel $m=11$ ein.

Beurteile die Aussage: „Man darf für alle Nachrichten einfach
$m^{\varphi(n)}\equiv1\pmod n$ einsetzen.“ Du darfst den kleinen Satz
von Fermat und den chinesischen Restsatz verwenden; ein erneuter Beweis
dieser Sätze ist nicht verlangt. Eine andere mathematisch tragfähige
Begründung, die alle Nachrichten einschließlich der nicht teilerfremden
abdeckt, ist gleichwertig.
