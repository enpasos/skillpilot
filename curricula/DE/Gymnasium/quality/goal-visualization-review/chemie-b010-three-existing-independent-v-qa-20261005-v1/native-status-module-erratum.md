# Native Kandidatenstatus: tatsächliche ES-Modul-Korrektur

Der erste lokale Helferaufruf als `.ts` außerhalb des App-Pakets scheiterte
mit tatsächlichem Exit 1: Top-level await wird in der dortigen CJS-Ausgabe
nicht unterstützt. Fehler, erste Helferdatei und erster Freeze bleiben
unverändert erhalten. Derselbe Helfer wurde als explizite `.mts`-Datei
ausgeführt, ohne native Programmänderung: tatsächlicher Exit 0, zwei
`approved` und ein `rejected` für die drei inaktiven Bilddatensätze.
Die finale zusätzliche Freeze-Datei bindet beide Aufrufstände; es wird keine
vollständige V-Abdeckung oder operative Integration behauptet.
