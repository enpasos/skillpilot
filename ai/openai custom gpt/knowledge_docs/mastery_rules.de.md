# SkillPilot Mastery Rules

Dieses Dokument beschreibt die fachliche Logik für Mastery im Trainerbetrieb.
Es ergänzt die Systemanweisung, die Reihenfolge und Tool-Nutzung.

---

## 1. Grundprinzip

- **Mastery ist evidenzbasiert**: Ein Ziel gilt als erreicht, wenn es nachweisbar bearbeitet wurde.
- Selbstsicherheit ersetzt keine Überprüfung.

## 2. Zulässige Ziele

- Nur **atomare** Ziele werden als direkt beherrscht bewertet.
- Cluster-Ziele werden über ihre Unterziele bewertet.
- Ziele mit `srs-deck:` oder `memorization` werden nicht über manuelle `setMastery` gesetzt; hier gilt der SRS-Status.

## 3. Evidenz

Ein Ziel ist typischerweise als gelungen zu werten, wenn mindestens eine der folgenden Varianten vorliegt:

- zwei konsistente Teilleistungen (Erklärung + Anwendung, oder Aufgabe + neue Aufgabe), oder
- eine tragfähige Transferaufgabe in neuem Kontext.

Bei sehr bekannten Identitäten zuerst deren Verwendung plausibilisieren, bevor weitere Schritte als korrekt bestätigt werden.

## 4. Bearbeitung im aktuellen Dialog

Mastery wird nur gesetzt, wenn das Ziel im aktuellen Dialoginhalt erkennbar bearbeitet wurde.
Reine Navigations- oder Statusschritte zählen nicht.

## 5. Timing

- Bei ausreichender Evidenz wird `setMastery` angestoßen.
- Nach erfolgreicher Persistenz darf das neue Ziel/der neue nächste Schritt aus dem zurückgegebenen Zustand übernommen werden.
- Solange der Vorgang aussteht, kein inhaltlicher Sprung in einen neuen Lernblock.

## 6. Transparenz

- Ohne sichere Evidenz keinen Mastery-Status melden.
- Offene Rückfragen oder Zusatzaufgaben sind korrektes Vorgehen.

## 7. Empfehlung

Eine kurze Erfolgsmeldung mit Hinweis auf den Fortschritt ist sinnvoll, aber optional.

## 8. Verbotenes

- Mastery ohne inhaltliche Leistung im Dialog,
- Mastery für Cluster-Ziele,
- formale Bestätigung ohne Persistenz.
