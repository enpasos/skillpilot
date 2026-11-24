# Aktuelle MP-Rückkehr und HH/SN-Nachfolger, 24.11.2026

Diese additiven Nachweise sichern getrennte Zwischenstände. Sie ersetzen keine
früheren hashgebundenen Belege und behaupten weder eine neue MP-Fachfreigabe noch
einen vollständig grünen Backend-Endlauf.

- `authorized-mp-placement.actual.json`: tatsächlich autorisierte Rückkehr der
  bestehenden LK-MP von E.3 unmittelbar hinter die vier E.1-Kinder, acht rohe
  hessische Ansichten. Die Fachaufgabe blieb dabei unverändert. Der Reproducer
  liest die damaligen exakten Bytes aus `77cd98398d` und den HE-Dateien von
  `fbde900bc8`; sein Ergebnis wurde bytegenau mit diesem Beleg verglichen.
- `post-hh-sn-seventy-plus-two-roles.compact.actual.json`: vollständige native
  Rollenberechnung `77cd98398d` → `fbde900bc8`. Alle 70 nationalen Atlasansichten
  behalten ihre gesamten Ziel-/Supportmengen; 489 curriculare atomare Atlasziele.
  Der 70er-Verbund enthält die direkten HH/SN-Sek-I-Ansichten nicht. Deshalb
  berechnet der Nachfolger diese zwei Ansichten zusätzlich und nennt sämtliche
  tatsächlichen Differenz-IDs: HH verliert LAWS als Ziel und drei Supportziele;
  SN verliert Energieerhaltung und Zentripetalkraft als Ziele und sieben
  Supportziele. Alle übrigen vollständigen Mengen sind über Anzahl und Digest
  gebunden. Rohrollen einschließlich Cluster sind keine atomaren Seed-Counts.
- `post-hh-sn-ten-D-P-bindings.compact.actual.json`: alle zehn tatsächlich
  unabhängig geprüften aktuellen D/P-Ziele gegen das neue native Atlasbuch.
  Goal-Fingerprints, exakt gelesene Profilkörper, Profil-Fingerprints und
  Anwendbarkeitsmengen stimmen mit beiden tatsächlichen Reviewpaketen überein.
  Vier native P-Konfigurationen, zusammen zehn Ziele: jeweils null blockierende
  Befunde. Die unveränderten nationalen Anwendbarkeitsvereinigungen verdecken
  die oben ausdrücklich dokumentierten unteren Rückstellungen nicht.
- `backend-pre-deferral/`: abgeschlossener gezielter MP-Rückkehrlauf 182/182 PASS,
  vor den HH/SN-Rückstellungen. Drei ausdrücklich gekennzeichnete JUnit-Auszüge
  enthalten nur Suite-/Fallstatus; die vollständigen Roh-XML bleiben in `/tmp`.
- `backend-isolated-fbde/`: echter isolierter breiter Lauf auf exakt
  `fbde900bc87417aa718b08d79400a9f811eb5b6e`, zwölf ausgewählte aktuelle Klassen
  plus eine genaue Seed-Methode. Ergebnis **476/481 PASS, fünf FAIL**, keine
  übersprungenen Fälle. Die historische Zwölferliste mit 527 Fällen ist nicht
  vollständig rekonstruierbar; die Auswahl behauptet diese alte Abdeckung nicht.
- `backend-memory-current-origins/`: echter gezielter Nachlauf der vier
  veralteten Karten-Fixtures, **4/4 PASS**. Nur `LearnerServiceTest` wurde über den
  isolierten fbde-Stand gelegt. BES und FALL allein schalten 007/009 nicht frei:
  007 braucht zusätzlich TV; 009 braucht LAWS. Die Tests setzen diese aktuellen
  Grundlagen ausdrücklich und prüfen die vorherige Sperre zusätzlich.
- `backend-isolated-failure-and-memory-successor.actual.json`: Herkunft,
  tatsächliche Ergebnisse und offener fünfter Fall. Direkter Kindeinstieg führt
  nach dessen bestätigtem Opening noch zum Eltern-Opening. Die gewünschte
  Assertion bleibt unverändert; der getrennte Task-3-Fix ist `ed480edcfe`.
  Ein gemeinsamer Endlauf einschließlich dieses Fixes steht noch aus.

Die vollständigen nativen JUnit-XML (einschließlich großer Systemoutputs) und
zwei stark wiederholte ältere Rollenberichte bleiben unverändert in `/tmp`.
Die Roh-SHAs und markierten Statusauszüge sind gebunden. Der additive
`raw-role-report-location-followup.actual.json` erklärt die Verlagerung des
unveröffentlichten Rohrollenberichts; historische Belege bleiben unverändert.

Reproduktion aus dem Repository-Wurzelverzeichnis, Node 20:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-mp-return-current-v1/derive-compact-roles-fbde.mts
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-mp-return-current-v1/derive-authorized-mp-placement.py
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-mp-return-current-v1/derive-post-deferral-bindings.py tmp/goal-books/physics-e1-post-hh-sn-current-national-context-20261124.book-model.json
```

Das dritte Skript verlangt das genau hashgebundene native Zwischenstandsbuch
und die tatsächlichen vier P-Checklogs unter `/tmp/e1-t5`; spätere MP-Aktivierung
benötigt einen neuen Nachfolger. Weder Lernschnitt noch Stammdaten noch eine
MP-Neufassung werden mit diesen Berichten aktiviert.
