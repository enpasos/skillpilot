# Prüfprotokoll: 6fc-Korrekturversuch 01

Ziel: `6fc9246a-9448-4cdb-b627-cf20ea1c65d3`, „Lineare Abhängigkeit und Unabhängigkeit von Vektoren prüfen“. Dieses Protokoll bewertet ausschließlich den neuen Bildkandidaten gegen das tatsächlich ausgelieferte Original und das aktuelle kanonische Lernziel. Es ist keine menschliche Freigabe und ändert weder Curriculum noch Bildregister oder QA.

| Bild | SHA-256 | Abmessungen |
| --- | --- | --- |
| `attempt-01.png` | `c25c912b991a976f78e90d55d46c5423de8e37774985f0bf3e6384e6566fab5b` | 1678 × 937 px |
| ausgeliefertes und kanonisches Original `6fc9246a-9448-4cdb-b627-cf20ea1c65d3.jpg` | `ad5f2098065421f707e8f42637a4c427d5f7ce5fc136fb488d1195bd9b98507d` | 2752 × 1536 px |

## Befund

Der konkret verlangte Austausch ist erkennbar gelungen: Die sechs farbigen, aber sachlich irreführenden Richtungspfeile über den Vektor-Koordinaten wurden in beiden oberen Leisten durch sechs richtungsneutrale Farbpunkte ersetzt. Beschriftungen und Farben bleiben dort zuordenbar.

Die mathematischen Hauptaussagen sind im Kandidaten weiterhin richtig. Links gelten `a=(1,0,0)`, `b=(0,1,0)`, `c=(1,1,0)`, also `c=a+b` und die nichttriviale Nullkombination `a+b-c=0`; alle drei liegen in `z=0`, die Liste ist abhängig. Rechts bilden `e1=(1,0,0)`, `e2=(0,1,0)`, `e3=(0,0,1)` die unabhängige Standardbasis; aus `x·e1+y·e2+z·e3=0` folgt nur `x=y=z=0`. Titel, Kastenüberschriften, diese Formeln und die wesentlichen Erklärungstexte sind lesbar. Die untere linke Ebenenskizze bleibt qualitativ: Auch im Kandidaten ist sie keine maßstabsgetreue grafische Vektoraddition, sondern illustriert nur die gemeinsame Ebene. Sie darf nicht als exakte Summenkonstruktion ausgegeben werden.

Der Kandidat erfüllt jedoch die geforderte *punktuelle* Korrektur nicht. Statt nur der sechs oberen Symbole wurden Typografie, Zeilenumbrüche, Abstände, Kastenproportionen, dekorative Achsen und die unteren Vektor-/Ebenendiagramme sichtbar neu gerendert. Die Auflösung beträgt nur rund 37 % der Pixelzahl des Originals; das Seitenverhältnis ist nahezu gleich, die ursprüngliche hochauflösende Datei bleibt aber nicht erhalten. Dadurch müsste die gesamte Seite neu geprüft und gebunden werden, nicht bloß die sechs Marker.

**Entscheidung: Kandidat nicht als Ersatz importieren (HOLD/REJECT für diesen präzisen Edit).** Der inhaltliche Verbesserungsansatz ist gut, und ich sehe in Versuch 01 keinen neuen eindeutigen Algebrafehler. Für eine Ablösung des aktuell mit seinem exakten SHA gebundenen Originals reicht diese weitreichende Neuzeichnung samt Auflösungsverlust nicht. Das bereits geprüfte Original bleibt unverändert. Ein weiterer Versuch müsste die sechs Icons im Original lokal ersetzen und alle übrigen Bildbereiche und die Originalabmessungen erhalten; andernfalls wäre eine vollständige neue Bildprüfung nötig.
