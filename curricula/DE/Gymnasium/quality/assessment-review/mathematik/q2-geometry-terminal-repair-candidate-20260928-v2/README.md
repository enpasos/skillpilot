# Q2-Geometrie: priorisierte Reparaturvorbereitung v2

**Status:** nichtkanonischer AI-Kandidat vom 28.09.2026. Keine Aufgabenfreigabe, keine Änderung an Canonical, Atlas, Prüfungsregistrierung oder M7-Zähler. Die freigegebene alte Aufgabe und ihre Lernstände bleiben unverändert, bis eine neue Fassung und die Ersatzrouten zusammen fachlich geprüft sind.

Die [erste Diagnose und zwölf Aufgabenentwürfe](../q2-geometry-terminal-repair-candidate-20260927-v1/README.md) bleiben als historische Vorarbeit erhalten. Diese v2 bindet den **aktuellen** Graphen: Die Q2-Prüfung `1878f680-095c-511d-aaed-e98393f7fde9` enthält 42 direkte `requires` und 42 `coveredGoalIds`. `7d37513b-fa1a-54cc-9e2a-9279a381f0f0` wurde bereits aus beiden Listen entfernt. Eine fachlich begründete Reduktion auf vier Ziele nähme somit **38**, nicht mehr 39, direkte Links zurück; **16** davon hätten im derzeitigen, noch nicht nach Kurssicht projizierten Graphen keinen Weg mehr zu einem Sek-II-Prüfungsende. Für alle 38 fehlt eine andere **direkte** Prüfungszuordnung. Der alte `verify.mjs`-Check erwartet 43/39/17 und ist für diesen Graphen veraltet.

## Was die alte vierteilige Aufgabe wirklich prüft

- **Eindeutig durch die bestehende Aufgabe belegt:** `9460c3ff-e72d-4107-bc73-087d217200aa` (Skalarprodukt und Orthogonalität, Teil 1) und `5390691d-1b7c-5572-9589-a69c2bba9a27` (rechtwinklige Dreiecksfläche, Teile 1–2).
- **Nur nach Fachprüfung eventuell als dritte Zuordnung haltbar:** `5f548596-9bc3-532e-88a0-81d5029809e9` (Körpereigenschaften für Volumen). Die alte Lösung setzt Grundfläche und Lot-Höhe ein, bewertet deren Nutzung/Erklärung aber nicht ausdrücklich. Der unten vorgeschlagene Teil 3 macht das bewertbar.
- **Erst mit geänderter Aufgabe als vierte Zuordnung möglich:** `288633c1-f61c-5b48-af7e-a80357f96cad` verlangt den begründeten Drittelfaktor im Vergleich mit einem Prisma gleicher Grundfläche und senkrechter Höhe. Dieser Vergleich fehlt bislang. Die neue Teil-3-Fassung ergänzt ihn innerhalb der vorhandenen 20 BE.

Der alte Teil 4 zur gleichmäßigen Längenskalierung ist ein sinnvoller Transferteil. Aus ihm wird keine zusätzliche bundesweit gültige LK-Coverage abgeleitet. `7d37513b…` ist inzwischen als hessischer LK-Inhalt zur **zentrischen Streckung mit positivem Faktor** enger modelliert. Der ältere Kandidat zur anisotropen Abbildung `T(x,y,z)=(2x,y,3z)` passt inhaltlich nicht mehr zu diesem Ziel. Auch dessen bisherige Kopplung mit `e9181209…` hat keine freigegebene gemeinsame Kurs-/Ländersicht; sie wird hier nicht übernommen.

## Erste drei gezielte Aufgabenentwürfe

[TASKS.md](TASKS.md) enthält vollständige Aufgaben, Lösungen und Bewertungseinheiten. Die vorläufigen Zuordnungen stehen in [candidate-routes.json](candidate-routes.json):

1. **Vektorkombination, Abhängigkeit und Kollinearität:** drei verlorene terminale Wege in einer kohärenten 20-BE-Aufgabe. Der aktuelle Projektionsaudit findet alle drei Ziele gemeinsam in 32/32 Sek-II-Kurssichten.
2. **Fünf Körpervolumina:** fünf verlorene Wege mit einzeln bepunkteten Teilaufgaben. Im aktuellen Projektionsaudit passen die fünf Ziele gemeinsam in 31/32 Sek-II-Kurssichten; **HE-LK ist auszunehmen**. Ob fünf gleichzeitige Voraussetzungen für eine einzige Prüfung didaktisch fair sind, bleibt offen. Der Entwurf darf nötigenfalls in kleinere Aufgaben geteilt werden.
3. **Spatprodukt in HE-LK:** eigenständige 12-BE-Aufgabe für `a594dec0…`, dessen Volumenkompetenz in HE-LK sichtbar ist, während die vier anderen Körperziele aus Aufgabe 2 dort fehlen. Sie verwendet andere Zahlen und begründet den Betrag des Spatprodukts. Ihre endgültige Geltung und faire Voraussetzung sind noch zu prüfen.

Diese drei Aufgaben betreffen **acht verschiedene** der 16 Ziele ohne hypothetischen Prüfungsweg. Sie ersetzen die übrigen acht nicht. Ebenso sind die anderen 22 zurückzunehmenden direkten Links noch auf echte lokale Prüfungsabdeckung zu prüfen: Ein indirekter Graphpfad ist keine benotete Deckung durch die alte Aufgabe. Insbesondere die zwei offenen Bildstimuli und die sechs weiteren im v1-Projektionsaudit kollidierenden Aufgabenpakete werden nicht stillschweigend als freigegeben behandelt.

Der aktuelle, nur diagnostische Projektionslauf mit `app/scripts/auditQ2GeometryAssessmentCandidateProjection.ts` ergab den GoalBook-Digest `sha256:522ff4e8b85c329d5a83e926a071070bacb769333ba4a5ed07acf0dd9262795b`: Volumen 31/32, Vektoren 32/32. Dieser Snapshot ist **keine** Freigabe und muss unmittelbar vor Integration mit dem dann aktuellen Atlas erneut geprüft werden. Auffällig ist außerdem, dass der alte gekoppelte `e918…`/`7d…`-Entwurf im generierten Buch derzeit in 29 gemeinsamen Sichten auftaucht, darunter GK, obwohl `7d…` kanonisch HE-only LK ist. Diese Projektion ist vor einer neuen 7d-Prüfung zu klären.

## Nächste Freigabeschritte

1. Die drei Entwürfe unabhängig mathematisch, didaktisch und je `coveredGoalId` prüfen; die fünffache Volumen-Voraussetzung und den hessischen Sonderfall ausdrücklich entscheiden.
2. Die alte Prüfung als unveränderte v1-Fassung archivieren. Eine geänderte v2-Aufgabe, Lösung, BE-Rubrik, `coveredStrands=L3` und getrennt geprüfte `requires`/`coveredGoalIds` als neue Version dokumentieren. Eine noch ungeprüfte v2 trägt `reviewStatus: needs_review`; `released` erst nach fachlicher Freigabe. Bestehende Freigaben und Lernstände nicht rückwirkend umdeuten.
3. Die Ersatzprüfungen zusammen mit der engeren alten Prüfung als kohärente Graph-/Ansichtsänderung integrieren; danach echte GK/LK-/Länder-Routen, Aufgabenabbildung, Quellen, GoalBook, D/P-Bindungen und M7/CQR prüfen. Keine `released`- oder 100%-Behauptung aus diesem Kandidaten ableiten.

`node verify.mjs` kontrolliert nur den aktuellen Basisgraphen, die acht Ziel-IDs, Rechenwerte, BE-Summen und die 16 hypothetischen Routenlücken. Er ersetzt keinen unabhängigen Review.
