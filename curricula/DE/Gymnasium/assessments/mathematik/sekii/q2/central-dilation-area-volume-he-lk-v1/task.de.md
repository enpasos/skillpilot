# Q2.5-LK-Prüfung: Flächen- und Volumenskalierung

## Aufgabe

Ein Quader hat den Eckpunkt $O(0\mid0\mid0)$ und die drei an $O$ anliegenden, zueinander senkrechten Kantenenden $A(3\mid0\mid0)$, $B(0\mid6\mid0)$ und $C(0\mid0\mid9)$. Als Grundfläche gilt das von $OA$ und $OB$ aufgespannte Rechteck in der $xy$-Ebene. Alle Längen sind in Zentimetern angegeben. Der Quader wird am Ursprung zentrisch mit einem positiven Faktor $k$ gestreckt. Im konkreten Fall gilt $k=\frac{2}{3}$.

1. Bestimmen Sie die Bildpunkte $A'$, $B'$ und $C'$ für den konkreten Faktor. Erklären Sie daran, was mit den drei Kantenlängen geschieht. (1 BE)
2. Begründen Sie aus der Skalierung zweier Kanten, warum der Flächeninhalt der Grundfläche für **beliebiges $k>0$** den Faktor $k^2$ erhält. Berechnen Sie den ursprünglichen und den neuen Grundflächeninhalt für $k=\frac{2}{3}$. (5 BE)
3. Begründen Sie entsprechend aus den drei Kantenlängen, warum das Volumen für **beliebiges $k>0$** den Faktor $k^3$ erhält. Berechnen Sie das ursprüngliche und das neue Volumen für $k=\frac{2}{3}$. (5 BE)
4. Eine Mitschülerin sagt: „Weil $k=\frac{2}{3}$ ist, werden Grundfläche und Volumen jeweils auf zwei Drittel verkleinert.“ Beurteilen Sie diese Aussage mit den richtigen Bruchteilen und erklären Sie den Unterschied. (1 BE)

Bearbeitungszeit: etwa 15 Minuten. Hilfsmittel: keine erforderlich. Gesamt: 12 BE.

## Lösung und Bewertung

1. Die zentrische Streckung am Ursprung ist $S_k(x,y,z)=(kx,ky,kz)$. Für $k=\frac{2}{3}$ folgen $A'(2\mid0\mid0)$, $B'(0\mid4\mid0)$ und $C'(0\mid0\mid6)$; die Kantenlängen werden aus $3$, $6$, $9$ zu $2$, $4$, $6$ cm. 1 BE für die drei Bildpunkte samt zugehöriger Deutung der Kantenlängen. Eine gleichwertige Herleitung ohne ausgeschriebene Abbildungsvorschrift ist zulässig.
2. Vorher ist der Grundflächeninhalt $A_G=3\cdot6=18\,\mathrm{cm}^2$. Nach der Streckung sind beide Grundkanten um denselben Faktor $k$ verändert: $A'_G=(3k)(6k)=18k^2\,\mathrm{cm}^2$. Daher ist $A'_G/A_G=k^2$ für jedes $k>0$. Für $k=\frac{2}{3}$ gilt $A'_G=2\cdot4=8\,\mathrm{cm}^2$, also $A'_G/A_G=\frac{4}{9}$. 4 BE für die allgemeine Herleitung aus den beiden skalierten Grundkanten bis zum Verhältnis $k^2$: höchstens 1 BE für einen bloßen richtigen Ansatz mit skalierten Kanten, mindestens 2 BE erst, wenn aus deren Produkt der Flächenfaktor $k^2$ tatsächlich begründet ist; weitere BE für eine vollständige, auf beliebiges $k>0$ übertragbare Argumentation. 1 BE für beide konkreten Flächeninhalte.
3. Vorher ist $V=3\cdot6\cdot9=162\,\mathrm{cm}^3$. Nach der Streckung gilt aus den drei Kantenlängen $V'=(3k)(6k)(9k)=162k^3\,\mathrm{cm}^3$, folglich $V'/V=k^3$ für jedes $k>0$. Für $k=\frac{2}{3}$ ergibt sich $V'=2\cdot4\cdot6=48\,\mathrm{cm}^3$ und $V'/V=\frac{8}{27}$. 4 BE für die allgemeine Herleitung aus den drei skalierten Kanten bis zum Verhältnis $k^3$: höchstens 1 BE für einen bloßen richtigen Ansatz mit skalierten Kanten, mindestens 2 BE erst, wenn aus deren Produkt der Volumenfaktor $k^3$ tatsächlich begründet ist; weitere BE für eine vollständige, auf beliebiges $k>0$ übertragbare Argumentation. 1 BE für beide konkreten Volumina.
4. Die Aussage ist falsch: Die Grundfläche beträgt $\frac{4}{9}$ und das Volumen $\frac{8}{27}$ des jeweiligen Ausgangswerts, nicht jeweils $\frac{2}{3}$. Ein Längenfaktor wirkt bei einer Rechtecksfläche zweimal, bei einem Quader dreimal. 1 BE für das richtige Urteil, beide Bruchteile und die dimensionsbezogene Erklärung zusammen. Schon in Teil 2 und 3 korrekt genannte Bruchteile können hier übernommen werden; Urteil und Erklärung bleiben erforderlich.

Fachlich gleichwertige Rechenwege und Formulierungen sind zu akzeptieren. Ein einzelner Folgefehler bei einem Bildpunkt soll nicht erneut bei einer mathematisch korrekt begründeten Faktorregel bestraft werden. Die Begründungen für $k^2$ und $k^3$ sind eigenständige Bewertungskriterien; bloßes Einsetzen in auswendig genannte Formeln genügt dafür nicht. Gesamt: 12 BE; Bestehensgrenze: 10 BE. Sind in einer der beiden allgemeinen Herleitungen weniger als 2 von 4 BE erreicht, sind insgesamt höchstens 9 BE möglich; ein Bestehen setzt damit beide aus den Kanten begründeten Skalierungsgesetze voraus.
