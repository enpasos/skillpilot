# Neun räumliche P-v2-Kandidaten – informierte Vorarbeit

Stand: 22. September 2026, Europe/Berlin; technische Zeitstempel in UTC.

## Ergebnis und Grenze

Neun individuell ausgearbeitete Profile mit je zwei neuen, voneinander unabhängig verwendbaren DE/EN-Anwendungsfällen. Alle bleiben `needs_human_review` / `ai_candidate`, Evidenzniveau E1, maximaler Aussageumfang G1. Es gibt keine neue D-, V- oder Human-Freigabe, keine behauptete Lernendenleistung und keinen Realhost-Nachweis.

Die Original-A/B-Understanding-Evidence wurde vollständig für genau diese neun Ziele gelesen und fachlich ausgewertet. Diese Arbeit ist **informierte Autorenschaft**, kein Blindreview. Die historischen Bildentscheidungen werden weder erneuert noch allein aufgrund gleicher Texte oder Fingerprints als erledigt betrachtet.

Die aktuellen Bildbindungen sind im Umbau. Deshalb enthält dieses Paket **keine materialisierten P-Reviewrecords, keinen reviewInputFingerprint und keine finale Assetbindung**. Es wurde nichts registriert und weder Canonical noch zentrale QA, Registry oder Ledger verändert.

## Dateien

- `spatial-nine.candidates.json`: natives Authoring-Format `positive-understanding-evidence-candidates-v1`; neun Profile, 18 Fälle.
- `authoring-context.json`: aktueller DE/EN-Text, Voraussetzungen und Elternkontext je Ziel; originale A/B-Evidenz samt Quelldatei-, Zeilenhash und Record-ID; expliziter Kandidaten-/Pending-Status.
- `check-authoring.mjs`: ausschließlich lesender, wiederholbarer Schema-, Bindungs- und Rechencheck.
- `validation.json`: tatsächlich ausgeführter Prüflauf einschließlich nativer Profil-/Goal-Fingerprints, 18 Quellen- und 18 Fallnachweisen.

Der native Authoring-Container hat selbst keine `status`-/`reviewAuthority`-Felder. Diese werden gemäß bestehendem Materializer erst bei der späteren Materialisierung zu `needs_human_review` / `ai_candidate`; das Begleitmanifest legt diesen Status schon jetzt ausdrücklich fest. Nicht native Zusatzfelder wurden dem CandidateSpec nicht untergeschoben.

## Individuelle fachliche Herleitung

| Ziel | Aus A/B übernommener Kompetenzkern | Neue unabhängige Fälle und nachgerechnete Resultate |
| --- | --- | --- |
| `be0e8715` – Vektorrollen | Ursprung, Verschiebung, von null verschiedene Richtung; Ursprungswechsel | A=(-1,2,0), B=(2,0,4) ergeben AB=(3,-2,4), mit klaren Pfeilenden und Richtungsrolle. Separater Ursprungswechsel: O'P=(3,2,3), O'Q=(1,5,3), PQ=(-2,3,0) bleibt gleich. |
| `aae119f2` – räumliche Verortung | Ursprung, gerichtete Achsen, Einheit und konsistente Eckpunkte | Selbst gewählter Eckbezug für einen 5×2×6-cm-Block: acht Ecktripel. Eigenständiger Aquariumfall: {±40}×{±20}×{0,50} wird bei Ursprungswechsel zu {0,80}×{0,40}×{0,50}; der Körper bewegt sich nicht. |
| `eb6bfdd9` – Geometriesoftware | Wirkliches Konstruieren/Bedienen; Projektionsüberdeckung anhand anderer Ansicht und Koordinaten klären | P=(-2,3,4) und Q=(-2,3,-1) überdecken sich in xy, sind räumlich verschieden. Eigenständiges Streckenmodell zeigt eine xy-Kreuzung, aber feste Höhen 2 und -1; daher keinen räumlichen Schnitt. Keine Softwareausführung durch die Autorenschaft behauptet. |
| `f37b0a72` – Addition und Skalierung | Drei Komponenten, Kopf-an-Schwanz, Vorzeichen und Längenfaktor | a+2b=(7,0,1), 2b=(6,2,-2). Eigenständiger Fall mit (-1/2)u und v ergibt (1,2,-2), Rückvektor (-1,-2,2), außerdem 0u=0 ohne Richtung. |
| `72dfc164` – Linearkombinationen | Gewichte bestimmen, alle Komponenten prüfen und Verkettung deuten | w=(2,1,-1)=2(1,1,0)-(0,1,1). Separater redundanter Fall q=2p: (3,0) und (1,1) ergeben t=(6,-3,0); s=(6,-3,1) ist wegen der z-Komponente nicht darstellbar. |
| `6fc9246a` – Abhängigkeit | Nichttriviale Nullkombination, ganze Familie statt nur Paare; Nullvektor | Für a=(1,2,0), b=(0,1,1), c=(2,5,1) gilt 2a+b-c=0, obwohl kein Paar kollinear ist. Neue Dreierfamilie p=(1,0,1), q=(0,1,1), r=(0,0,2) ist unabhängig; ergänzter Nullvektor macht die Familie abhängig, die Spannweite bleibt R³. |
| `54cfe5ce` – Kollinearität | Ein Skalar für alle Komponenten, Nullkomponenten ohne Division, Vorzeichen deuten | w=(-2/3)v für v=(0,3,-6), w=(0,-2,4); t=(1,-2,4) scheitert an x. Separater Parameterfall u=(2,0,-1), w_k=(6,k,-3) verlangt genau k=0; ergänzter Nullvektor wird unter expliziter Konvention algebraisch behandelt. |
| `68d4faef` – Punktabstand | Verbindungsvektor und Betrag; gerader Abstand, Reihenfolge-/Ursprungsinvarianz | AB=(4,-4,2) hat Betrag 6 m, der achsenparallele Weg 10 m. Neues Punktpaar hat PQ=(2,3,6), Betrag 7 cm; im verschobenen Bezug ergibt der rückwärts gebildete Vektor (-2,-3,-6) erneut 7 cm. |
| `69eda7f9` – Strecken im Kontext | Richtige Endpunkte für die tatsächlich gefragte Körperstrecke wählen | Innenstrebe AG=(4,4,7): 9 m, Bodendiagonale AC: 4√2 m. Eigenständige versetzte Pyramide: Seitenkante BS=(-3,3,4) hat √34 cm, Bodenstrecke AC=(6,6,0) hat 6√2 cm. Keine Endpunkte im Ursprung erforderlich. |

Die Fallpaare wechseln nicht lediglich Zahlen. Sie wechseln insbesondere Bezugssystem, Objektart, Darstellungsform, Richtung/Nullfall, Redundanz, algebraische Entscheidungsart oder die geometrische Rolle der gesuchten Strecke. Jeder Fall enthält seine eigenen Daten; Fall 2 benötigt kein Ergebnis aus Fall 1.

Die Koeffizienten-/Abhängigkeitsziele werden nicht auf eine bestimmte Rechenmethode verengt. Der Rechenchecker benutzt bei einer unabhängigen Dreierfamilie zusätzlich die Determinante 2 als interne Gegenprobe; die Lernaufgabe fordert ausdrücklich nur eine zulässige Komponentenbegründung und keine Determinantenroutine.

## Darstellungs- und Dimensionssicherheit

- Alle numerischen Vektorfälle sind ausdrücklich dreikomponentig. Bei Abhängigkeit wird zwischen Anzahl der Vektoren, Dimension des Umgebungsraums und Dimension der Spannweite unterschieden.
- `0·u` ist der Nullvektor. Ein Nullvektor hat keine Richtung; Aussagen wie „gleiche Trägergerade bleibt erhalten“ werden für diesen Fall nicht pauschal übernommen.
- Die Kollinearitätsfälle legen offen: `kollinear = linear abhängig`. Deshalb ist das Paar aus u und 0 algebraisch kollinear, ohne dem Nullvektor eine Richtung zuzuschreiben. Der Vergleich erfolgt mit Gleichungen, nicht mit undefinierten Komponentenquotienten.
- Die Softwarefälle nennen orthogonale xy-Draufsicht ausdrücklich. Gleiche Bildposition bedeutet dort gleiche x-/y-Werte, nicht automatisch denselben Raumpunkt. Der zweite Fall prüft Lage durch Ansichts- und Koordinatenvergleich, keine zusätzliche analytische Geradenschnittkompetenz.
- Falls aus den Aufgaben neue Skizzen erzeugt werden, müssen alle Punkte und Pfeile dieselbe erklärte Projektion benutzen. Die interne Gegenprobe verwendet zum Beispiel π(x,y,z)=(-x+y,-0.4x+z) mit positiver zweiter Bildkoordinate nach oben. Sie prüft π(a+kb)=π(a)+kπ(b). Das ist keine Aufforderung, genau diese Projektion zu verwenden, und keine zusätzliche Lernanforderung.
- Eine Schrägprojektion erhält Vektoraddition und Skalierung, aber im Allgemeinen weder Raumlängen noch Winkel; eine zweidimensionale Überdeckung beweist keine räumliche Identität oder Kollinearität. Die Profile verlangen daher keine aus Bildschirmmaßen abgelesenen Raumlängen.
- Für Abstand/Länge sind kartesische Achsen mit einheitlicher Längeneinheit festgelegt. In den Bauteilfällen sind geometrische Ideallängen ohne Anschlusszugaben gemeint.

## Tatsächliche Prüfungen

Aus dem Repository-Root:

```bash
node --import ./app/node_modules/tsx/dist/loader.mjs curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-22/m7-spatial-nine-positive-candidates-v1/check-authoring.mjs
```

Ergebnis des gespeicherten Laufs: **9/9 native Profilkörper schemakonform, 18/18 originale A/B-Quellrecords unverändert, 18/18 Fallgruppen bestanden, 91 mathematische Assertions bestanden**. Die DE/EN-Felder wurden zusätzlich inhaltlich parallel verfasst und auf gleiche Daten, Operationen und Ergebnisaussagen gelesen. Eine automatische Text-Sprachprüfung wird nicht behauptet.

Die Goal- und Profilfingerprints stammen aus den nativen Funktionen in `app/scripts/positiveGoalEvidenceProfileModel.ts`, nicht aus einer eigenen Ersatzimplementierung. Der Check vergleicht außerdem aktuellen Zieltext, Voraussetzungen, Anforderungsniveau und die gelesenen Kontexttexte. Er ist rein lesend und akzeptiert spätere Bildänderungen nicht als neue fachliche Freigabe.

Nicht ausgeführt: vollständiger nativer P-Review-Input-Gate, Materialisierung, Registrierung, Canonical- oder Maturity-Neuberechnung. Dies ist bewusst noch kein integrierter P-Abschluss. Der vollständige Gate kann erst nach stabilen Bildbindungen erfolgen.

## Übergabe nach unabhängigem Review

1. Die neun Profile fachlich unabhängig prüfen; besonders Nullvektor-Konvention, räumliche Darstellungen und zwei getrennte Demonstrationen beurteilen.
2. Nach finaler Auswahl der tatsächlich geprüften Bilder erneut sicherstellen, dass DE/EN-Zieltexte, Scope und Voraussetzungen unverändert sind.
3. Erst dann die passende versionierte P-Config mit exakt diesen neun IDs und `reviewedResourceTypes: ["goal-visualization"]` anlegen und mit dem bestehenden nativen Materializer aktuelle Resource-/Review-Input-Fingerprints erzeugen.
4. Den vollständigen nativen P-Check und die üblichen Integrations-/Maturity-Regressionsgates ausführen. Kandidatenstatus bleibt erhalten; es entsteht dadurch keine Human-Freigabe.

