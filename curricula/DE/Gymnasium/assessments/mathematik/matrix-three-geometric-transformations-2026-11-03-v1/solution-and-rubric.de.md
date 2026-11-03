**A · Zentrische Streckung**

Jeder Standardbasisvektor wird auf sein Doppeltes abgebildet. Deshalb sind die Spalten $2\vec e_1,2\vec e_2,2\vec e_3$ und
$$Z=\begin{pmatrix}2&0&0\\0&2&0\\0&0&2\end{pmatrix}.$$
Gleichwertig liefert die geometrische Vorgabe direkt $(x,y,z)\mapsto(2x,2y,2z)$. Damit
$$Z\vec p=\begin{pmatrix}4\\2\\6\end{pmatrix}.$$
Der Ursprung bleibt fest, denn $Z\vec 0=\vec0$. Für jeden von null verschiedenen Ortsvektor gilt $Z\vec v=2\vec v$: Weil der Faktor positiv ist, bleibt sein Ursprungsstrahl erhalten. Zudem gilt $\lVert Z\vec v\rVert=2\lVert\vec v\rVert$. Für $P$ verdoppelt sich der Abstand $\sqrt{14}$ zu $2\sqrt{14}$. Die allgemeine Abstandsaussage genügt; die beiden Wurzelwerte sind nicht zusätzlich verlangt.

**B · Parallelprojektionen**

Die Gerade hat die Koordinaten $(x+t,y,z+t)$. In der $xy$-Ebene gilt $z+t=0$, also $t=-z$. Daher
$$Q\vec v=\begin{pmatrix}x-z\\y\\0\end{pmatrix},\qquad Q=\begin{pmatrix}1&0&-1\\0&1&0\\0&0&0\end{pmatrix}.$$
Die Spalten sind die Bilder $(1,0,0)^{\mathsf T}$, $(0,1,0)^{\mathsf T}$ und $(-1,0,0)^{\mathsf T}$ der drei Standardbasisvektoren. Für $P$ ergibt sich $Q\vec p=(-1,1,0)^{\mathsf T}$.

Alle Punkte $(x,y,0)$ bleiben fest, weil ihre letzte Koordinate bereits null ist. Es gilt $\vec p+\vec r=(3,1,4)^{\mathsf T}$ und $Q(\vec p+\vec r)=(-1,1,0)^{\mathsf T}=Q\vec p$. Allgemein bewirkt eine Änderung um $s\vec r$ keine Bildänderung: $(x+s)-(z+s)=x-z$. Information über die Lage in dieser Richtung geht verloren. Da das erste Bild in der festen Zielebene liegt, ändert eine zweite Projektion es nicht: $Q(Q\vec v)=Q\vec v$. Eine passende allgemeine Rechnung oder $Q^2=Q$ mit Deutung zählt gleichwertig.

Bei der orthogonalen Projektion auf die $xz$-Ebene wird die $y$-Koordinate null, bei derjenigen auf die $yz$-Ebene die $x$-Koordinate. Damit
$$Q_{xz}=\begin{pmatrix}1&0&0\\0&0&0\\0&0&1\end{pmatrix},\quad Q_{xz}\vec p=\begin{pmatrix}2\\0\\3\end{pmatrix},$$
$$Q_{yz}=\begin{pmatrix}0&0&0\\0&1&0\\0&0&1\end{pmatrix},\quad Q_{yz}\vec p=\begin{pmatrix}0\\1\\3\end{pmatrix}.$$

**C · Gerichtete Streckung**

Aus Linearität und den geometrischen Vorgaben folgen
$$M\vec e_1=\frac{3\vec d+\vec n}{2}=\begin{pmatrix}2\\1\\0\end{pmatrix},\quad M\vec e_2=\frac{3\vec d-\vec n}{2}=\begin{pmatrix}1\\2\\0\end{pmatrix},\quad M\vec e_3=\begin{pmatrix}0\\0\\1\end{pmatrix}.$$
Diese drei Bildspalten ergeben
$$M=\begin{pmatrix}2&1&0\\1&2&0\\0&0&1\end{pmatrix}.$$
Die Tests liefern $M\vec d=(3,3,0)^{\mathsf T}=3\vec d$, $M\vec n=(1,-1,0)^{\mathsf T}=\vec n$ und $M\vec e_3=(0,0,1)^{\mathsf T}=\vec e_3$.

Für jeden Vektor parallel zu $\vec d$ gilt aufgrund der Linearität $M(t\vec d)=3t\vec d$. Ein Vektor ist genau dann senkrecht zu $\vec d$, wenn seine ersten beiden Koordinaten entgegengesetzt sind; er hat also die Form $(a,-a,b)^{\mathsf T}$. Direktes Einsetzen ergibt
$$M\begin{pmatrix}a\\-a\\b\end{pmatrix}=\begin{pmatrix}a\\-a\\b\end{pmatrix}.$$
Gleichwertig: $\vec n$ und $\vec e_3$ spannen sämtliche senkrechten Richtungen auf und beide bleiben fest. Somit werden die ganzen geforderten Richtungsanteile erfasst, nicht nur einzelne Testpunkte. Es ist kein Eigenwertargument nötig.

Für den gegebenen Punkt folgt
$$M\vec p=\begin{pmatrix}2\cdot2+1\\2+2\cdot1\\3\end{pmatrix}=\begin{pmatrix}5\\4\\3\end{pmatrix}.$$
Dies ist keine zentrische Streckung mit Faktor $3$: Beispielsweise bleibt $\vec n$ unverändert, während $3I$ diesen von null verschiedenen Vektor verdreifachen würde. Ebenso kann $\vec e_3$ als Gegenbeispiel verwendet werden.

**Bewertung:** Die folgende Referenz ist nicht ausschließlich. Gleichwertige korrekte Darstellungen, Methoden und nachvollziehbare Folgearbeit zählen. Nur verlässlich lesbare eingereichte Arbeit bewerten; keine nicht gezeigten Leistungen unterstellen.

**Eine normale Gesamtkappung:** Zuerst werden die unten beschriebenen Teilpunkte zu einer einzigen Rohsumme von höchstens 30 BE addiert. Die Gesamtpunktzahl wird vor dem Vergleich mit der Schwelle von 22 BE auf höchstens 21 BE begrenzt, wenn mindestens eine der folgenden Kernhandlungen vollständig fehlt oder nur ein konzeptionell ungeeignetes Modell dafür vorliegt:

- In einem der Teile A, B oder C fehlt eine fachlich tragfähige Herleitung der jeweiligen Matrix aus den geometrischen Vorgaben. Ein bloß hingeschriebenes Matrixresultat ohne erkennbaren Zusammenhang mit diesen Vorgaben ersetzt die verlangte Herleitung nicht. Als konzeptionell ungeeignet gelten etwa eine rein orthogonale $xy$-Projektion in B trotz der schrägen Richtung oder $3I$ in C trotz der festbleibenden senkrechten Richtungen.
- In A oder B fehlt jede echte Bildpunktanwendung: weder ein richtiger Bildpunkt noch ein nachvollziehbarer Matrix-Vektor-Ansatz mit fachlich richtiger Folgearbeit ist erkennbar.
- In A fehlt jede tragfähige Begründung der Richtungs- und Abstandswirkung der zentrischen Streckung; die bloße Feststellung, dass der Ursprung fest bleibt, reicht hierfür nicht. In B fehlt jede tragfähige begründete Untersuchung der Projektion, etwa zur festen Zielebene, zum Informationsverlust entlang der Projektionsrichtung oder zur erneuten Projektion. Ebenso greift die Kappung, wenn in B beide kurzen Varianten auf die anderen Koordinatenebenen vollständig fehlen oder nur konzeptionell falsch behandelt werden.
- In C fehlt jeder tatsächliche rechnerische Test der konstruierten Matrix an den geometrischen Anforderungen, oder jede tragfähige Begründung, weshalb ihre Wirkung die geforderten parallelen und senkrechten Richtungen abdeckt. Ein einziger Punktbildwert ersetzt weder den Richtungstest noch die Begründung.

Entscheidend ist der Inhalt der gesamten eingereichten Arbeit, nicht die Position einer Antwort oder ein bestimmtes Schlüsselwort. Eine Leistung, die an anderer Stelle erbracht wird, zählt ebenfalls; derselbe inhaltliche Schritt erhält jedoch nicht doppelte Punkte. Eine knappe richtige Rechnung oder Erklärung genügt. Die Kappung ist keine Forderung nach Fehlerfreiheit: Ein isolierter Rechen-, Vorzeichen- oder Abschreibfehler bei erkennbar geeignetem Modell und nachvollziehbarer Methode löst sie nicht aus. Derselbe lokale Fehler wird nur einmal abgezogen; die darauf folgenden richtig ausgeführten Operationen und folgerichtigen Erklärungen werden nach ihren jeweiligen Kriterien bewertet, ohne das falsche Ausgangsergebnis als richtig auszugeben. Das Fehlen eines einzelnen Teilaspekts ist nach der Rubrik zu bewerten und löst nur dann die Kappung aus, wenn eine der oben genannten Kernhandlungen insgesamt fehlt. Es gibt eine Gesamtpunktzahl und eine Schwelle, keine Teilpassfelder oder zweite Qualifikation.

a-basis · 2 BE: Bilder der drei Standardbasisvektoren aus der zentrischen Streckung hergeleitet, oder gleichwertig die allgemeine Koordinatenwirkung begründet: vollständig 2, sinnvoll teilweise 1.

a-matrix · 1 BE: Z=diag(2,2,2) korrekt als Matrix zusammengestellt.

a-point · 2 BE: Matrix-Vektor-Anwendung an p nachvollziehbar 1; Bildpunkt (4,2,6) korrekt 1. Fachlich richtige Folgearbeit getrennt anerkennen.

a-origin · 1 BE: Festbleiben des Ursprungs begründet.

a-direction-distance · 2 BE: Ursprungsstrahl wegen positiven Faktors erhalten begründet 1; Verdopplung des Ursprungsabstands begründet 1. Eine gemeinsame kurze allgemeine Erklärung genügt.

b-line-plane · 2 BE: Geradenansatz und Ebenenbedingung z+t=0 mit t=-z 1; daraus Bildform (x-z,y,0) hergeleitet 1. Gleichwertige geometrische Herleitung anerkennen.

b-columns-matrix · 2 BE: Standardbasisbilder oder korrekte Koeffizientenzuordnung zur Bildform 1; Q mit Zeilen (1,0,-1),(0,1,0),(0,0,0) korrekt 1.

b-point · 1 BE: Bildpunkt (-1,1,0) korrekt; sinnvoller Ansatz mit lokalem Rechenfehler kann 0,5 BE erhalten.

b-fixed-plane · 1 BE: Alle Punkte der xy-Ebene bleiben fest, aus z=0 begründet.

b-lost-direction · 1 BE: Gleiches Bild von p und p+r rechnerisch oder geometrisch begründet; Verlust der Unterscheidbarkeit in dieser Richtung erkennbar.

b-repeat · 1 BE: Zweite Anwendung ändert das Bild nicht, mit fester Zielebene oder passender Rechnung begründet.

b-xz · 1 BE: Orthogonale xz-Matrix diag(1,0,1) 0,5; Bild von P (2,0,3) 0,5.

b-yz · 1 BE: Orthogonale yz-Matrix diag(0,1,1) 0,5; Bild von P (0,1,3) 0,5.

c-column-one · 1 BE: Erste Standardbasisspalte aus e1=(d+n)/2 hergeleitet: (2,1,0). Gleichwertigen Weg anerkennen.

c-column-two · 1 BE: Zweite Standardbasisspalte aus e2=(d-n)/2 hergeleitet: (1,2,0). Gleichwertigen Weg anerkennen.

c-column-three · 1 BE: Dritte Standardbasisspalte (0,0,1) aus der festbleibenden senkrechten Richtung hergeleitet.

c-matrix · 1 BE: Die hergeleiteten Spalten korrekt zu M mit Zeilen (2,1,0),(1,2,0),(0,0,1) zusammengestellt.

c-test-d · 1 BE: Md=(3,3,0)=3d als tatsächlichen Test berechnet und zugeordnet.

c-test-n · 1 BE: Mn=(1,-1,0)=n als tatsächlichen Test berechnet und zugeordnet.

c-test-e3 · 1 BE: Me3=(0,0,1)=e3 als tatsächlichen Test berechnet und zugeordnet.

c-all-directions · 2 BE: Wirkung auf alle t*d durch Linearität oder Rechnung erklärt 1; gesamte senkrechte Ebene über (a,-a,b) oder Spann von n,e3 als fest begründet 1.

c-point · 2 BE: Matrix-Vektor-Anwendung an p nachvollziehbar 1; korrektes Ergebnis (5,4,3) 1.

c-not-central · 1 BE: Mit einem nichtnulligen senkrechten Vektor den Unterschied zu 3I begründet.
