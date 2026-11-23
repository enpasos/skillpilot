# Ortskurve bei konstanter Beschleunigung aus der Ruhe

Die generierte Ortskurve stieg anfangs zu langsam. Bei halber Zeitspanne erreichte der zweite Entwurf rund 17 % der Endhöhe, der gezielte Korrekturversuch 22,3 %. Aus s(t) = ½at² folgt hier 25 %.

Als Grundlage diente der zweite Entwurf auf 1600 × 900 px. Der Renderer ermittelt den bisherigen orangefarbenen Strich im rechten oberen Diagramm und füllt dessen Umgebung aus dem benachbarten Papierhintergrund. Zwischen demselben Ursprung und Endpunkt zeichnet er den neuen Strich mit der normierten Höhe u² für den Zeitanteil u. 5.465 Pixel innerhalb des betroffenen Diagramms unterscheiden sich von der Grundlage. Die drei anderen Graphen, Formeln und Beschriftungen sind pixelgleich.

Eine separate Messung der Strichmitte im gespeicherten PNG ergab folgende Werte. Die Endhöhe entspricht 165 px.

| Anteil der Zeitspanne | Sollhöhe | Gemessene Höhe | Abweichung der Strichmitte |
| --- | --- | --- | --- |
| ¼ | 6,25 % | 6,21 % | 0,06 px |
| ½ | 25 % | 25,00 % | 0,00 px |
| ¾ | 56,25 % | 56,36 % | 0,19 px |

Der folgende Aufruf reproduziert die Bilddatei aus diesem Verzeichnis mit Python 3.12.9 und Pillow 12.1.0.

```bash
python3 correct_quadratic_curve.py --base base.png --recipe recipe.json \
  --output /tmp/physics-motion-laws.png --report /tmp/physics-motion-laws.json
sha256sum /tmp/physics-motion-laws.png
```

Der SHA-256 der reproduzierten Datei lautet `4a0639dc17549678f36a5a0ca97278abd6eca56577d308eac092ef865eacdf97`. Der SHA-256 der zugrunde liegenden Generatorfassung steht in [recipe.json](recipe.json). Beide Darstellungen wurden im Vollbild und auf 360 px Breite angesehen.
