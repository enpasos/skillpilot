# B038h: aktueller Quellen- und Routen-Gegencheck v2

Stand: 2026-09-06. **AI-Gegenprüfung, keine Übernahme und keine menschliche
Freigabe.** Der bestehende v1-Quellenbefund ist weiterhin richtig; sein
Requires-Kandidat ist nicht übernahmereif. Die sieben Holds bleiben ungezählt.
Keine Änderung an Kanonik, Mapping, Composition-Views, Registry oder Profilen.

## Reproduzierbarer Nachweis

Aus dem Repository-Root mit Node 20:

```bash
PATH=/home/enpasos/.nvm/versions/node/v20.20.2/bin:$PATH ./app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-038-derivative-applications-and-exponentials-20-v1/audit-he-g9-exponential-route-v2.ts .
```

Der read-only Helper lädt den vorhandenen
`emit-he-g9-exponential-scope-proposal-v1.mjs`, verifiziert dessen zehn
semantische Zielzustände und vier Quell-/Mappingslices und führt anschließend
die native `validateHardDirectAtomicRoutes` mit derselben Normalisierung,
Sek-II-Auswahl und Terminalmenge wie `app/scripts/validateGraph.ts` aus.
Die Findings werden auf die sieben Clusterkinder plus drei Logarithmus-/
Umkehrziele begrenzt. Alle tatsächlichen Mathematik-Views werden mit
`collectCompositionProjectionRoleGoalIds` geprüft, nicht mit einem Textgrep.
Der Helper hat weder Schreib- noch Apply-Modus und gibt seinen Befund auf
stdout aus; Fehler beziehungsweise relevante Drift führen zu Exit 1.

Ausgeführt und bestanden: aktueller gebundener Zustand ohne Findings;
Gegenbeispiele des alten Kandidaten werden ausdrücklich nachgewiesen. Das
Bestehen dieses Gegenchecks ist **keine Freigabe des alten Kandidaten**.

## Referenzbindungen dieses Audits

| Bindung | SHA-256 |
| --- | --- |
| v1: zehn semantische Zielzustände | `fcb87da6f07ea13a881ca248198f054a4b9df0159c9ae80ef9476578005f6f85` |
| v1: vier Quellziele | `67fb685b0e9a4552a1e0b9fbe073a4de249aab4b357406a5134cabf8df0b4572` |
| v1: vier Mapping-/Decision-Slices | `a4bee6bef6dbf31faa3ab60b082ab8043e9410ab2ba04b0b60d52d6bf5f02c9f` |
| aktuelle kanonische Mathematikdatei | `fd9108cf0ccc8176f1fdd3e5633ac716544cff9aa72bcaf8c1f11ad93728d34e` |
| aktuelles HE-Sek-I-Mapping | `ecc6b19f67dbb8a55e47ae00eec46a7a441527d92f2d68a52a2d6c558bde4ceb` |
| aktuelle HE-Sek-I-Extraktion | `3ec1451c515f4bc70d97690331ca66f922d933355c4326e1dc4100a95e3e664c` |
| aktuelle Mathematik-Semantic-Kinds | `466ede651ab865022d5ccca760f4c5e8814762092f7d89a88ad4884d3355266f` |
| geprüfte View-Menge, Pfad-/Bytehash-Paare sortiert | `c9fd6e01b26240e4172b6b2327798d4accc794b730ff8009faa2d92ef37e47b0` |

Die vollständigen Pfade sowie aktuelle Hashes der beteiligten Generator-/
Prüffunktionen und aller betroffenen Views stehen in der Helper-Ausgabe.
Die Ganzdateihashes dokumentieren diesen Checkpoint; bei einer unabhängigen
Änderung sind die fachlich betroffenen Slices zu vergleichen, nicht sämtliche
früheren Reviews blind neu auszuführen.

## Weiterhin bestätigtes Source-Delta

Der [amtliche G9-Lehrplan, Abschnitt 10.2, gedruckte S. 38](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf)
wurde erneut online gelesen: konkrete Exponentialgraphen, Wachstums- und
Zerfallskontexte, Logarithmus als Umkehrung sowie Datenmodelle mit Grenzen.
Dies trägt nicht die e-Ableitung oder den bayerischen asymptotischen
Grenzwertvergleich. Das [KC, Abschnitt 7.3](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf)
bleibt die binding-core-Quelle; die G9-Linie die vorhandene
legacy-grade-sequencing-reference.

Das genaue Source-Delta aus v1 ist unverändert reproduzierbar: die zu breite
Zeile-07-Kante auf `48e7615d` entfernen, die drei konkreten partial-Kanten auf
`781f133a`, `d900e0a4`, `ab720928` ergänzen und die drei vorhandenen atomaren
Zeile-07-Verweise auf partial präzisieren. Der rohe HE-G9-Scope verliert exakt
`628928a6`, `f05acdc5`, `49f9059a`; keine hinzugefügten Ziele.

Kleine Berichtigung zu v1: Die unveränderte Kante Zeile 04 → `346efb31` ist
aktuell **exact**, nicht partial. Der v1-Emitter erhält sie korrekt unverändert.

## Drei zusätzliche Gegenbefunde

1. **Die Ableitungsbasis darf nicht entfallen.** Nach alleiniger Entfernung von
   `781f133a → 858113c5` verlöre auch `628928a6` über seinen Vorgänger `346efb31`
   jede Ableitungsvoraussetzung. Sämtliche contains-Vorfahren haben leere
   requires. Fachlich kleinste Korrektur: diese Ableitungskante von `781` nach
   `628` verschieben. Die elementare Deutung wird calculusfrei; e-Eigenschaften
   und ihre weiterführenden Nachfolger bleiben abgesichert.
2. **Logarithmusvorgänger in 44 Views nicht vorhanden.** `d900e0a4` ist in 81
   aktuellen Views target. Bei 44 davon ist der in v1 neu geforderte
   `3c1d6ce7` weder target noch prerequisiteOnly. Die Helper-Ausgabe enthält die
   exakten Dateien. Eine globale Requires-Übernahme wäre daher keine lokale
   HE-G9-Korrektur; insbesondere Sek-II-Routen müssen ausdrücklich mitgeprüft
   werden. Bloßes prerequisiteOnly schafft keinen Lernweg für fehlende Mastery.
3. **Native Hard-Route-Gegenprobe rot.** Der aktuelle 7+3-Zustand hat null
   Findings. Der alte Kandidat erzeugt genau zwei: `d900e0a4` und `ab720928`
   verlieren ihre direkte atomare Sek-II-Motivationsroute. Ihr neuer Weg führt
   ausschließlich über das J10-Ziel `3c1d6ce7` zur Sek-I-Orientierung.

Zusätzlich bleibt die schon in v1 benannte HE-G9-Grenze bestehen: `781f133a`,
`c15fe32d` und `dbc13bb0` benötigen die dort fehlende E-Orientierung `71cec9fb`.
Ein spontaner Tausch auf Sek-I-Funktionsgrundlagen verschiebt nur das Problem:
`7dea79d2` ist dort target, in den geprüften HE/BY-Sek-II-Views aber absent.
Das ist keine Erlaubnis für pauschale neue Lernziel-, Motivations- oder
Mastery-Zuordnungen.

## Nächste begrenzte Adjudikation

Die Route-/Stage-Entscheidung muss fachlich vor einer wirksamen Source-Änderung
fallen. Zu prüfen sind die vorhandenen elementaren Sek-I-Gegenstücke und die
effektiven Lernwege in beiden Stufen, nicht bloß der HE-G9-Rohscope. Ein
explizites wiederverwendbares Ziel darf nicht durch seinen Austausch gegen
ein anderes Ziel still Mastery erben. Gute Beschreibungen und Bildbytes bleiben
erhalten. Eine gesonderte read-only Variantenprüfung folgt; dieses Audit legt
noch keine Variante als beschlossen fest.

Nach einer fachlich tragfähigen Auswahl: native Mapping-/Decision-Konsistenz,
Graph/Hard-Routes, sämtliche tatsächlich betroffenen Scope-/Voraussetzungs-
Deltas, Duration-Generator zunächst ohne Schreibflag, Composition-Views,
Quellen-/Applicability-Nachweise und M6-Floors prüfen. Betroffene Seiten-/
Kontext-/Profilbindungen danach gezielt erneuern; keine neue komplette B038-
Beschreibungsrunde für inhaltsidentische Ziele und keine Änderung eingefrorener
Runtime-Verträge.
