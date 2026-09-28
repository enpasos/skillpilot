# Drei aktuelle Mathematik-Bildseiten: D-Synthese-Kandidaten

Stand: 2026-09-27. Dieses Dokument ist eine fachliche **KI-Synthese**, keine
menschliche Freigabe und keine kanonische Textänderung. Die beiden getrennten
Blinddurchgänge benutzen dieselben gebundenen drei Seiten, Kriterien und
Record-Schemas. Beide stammen von OpenAI/GPT-6; die zwei Reviewer waren
voneinander blind, eine Provider- oder Modelldiversität wird nicht behauptet.
Die Kampagnenvalidatoren bestätigen je 3/3 Records. `dual-summary.json` meldet
3/3 Synthesebedarf und `automaticAcceptance: false`.

| Ziel | Runde A | Runde B | Synthese auf unveränderter aktueller Seite |
| --- | --- | --- | --- |
| `0408ac7f-0530-5de5-b248-cf581c9b5a17` | `revise` | `revise` | Textrevision nötig; D offen. |
| `27bdc580-ba17-5399-bf02-48f354846d1d` | `revise` | `revise` | Textrevision nötig; D offen. |
| `18be713b-7d90-4f01-b60a-5582ac4df0e8` | `block` | `keep` | Quellen-, Objektpaar- und Voraussetzungs-Konflikt; D offen. |

## 0408ac7f: Ziehen mit Zurücklegen

Beide Runden bemängeln, dass der bisherige Text kein bestimmtes
Wahrscheinlichkeitsereignis nennt und dass „Ergebnisse ... nachvollziehen“
durch Nachmachen eines Beispiels erfüllbar wäre. Die Quellenextraktion zu
Hessen Q3.1, Spiegelstrich 7, nennt einfache Aufgaben zur Binomialverteilung
bei Urnenziehungen mit Zurücklegen. Der folgende kurze, zweisprachige Text
bleibt innerhalb dieses Umfangs und verbindet die konstante
Trefferwahrscheinlichkeit mit der Zählrolle des Binomialkoeffizienten:

> DE: Die lernende Person kann bei Ziehungen mit Zurücklegen die
> Wahrscheinlichkeit für genau k Treffer mit dem Binomialkoeffizienten
> berechnen und erklären, wie konstante Trefferwahrscheinlichkeit und mögliche
> Reihenfolgen das Ergebnis bestimmen.

> EN: The learner can calculate the probability of exactly k successes in
> draws with replacement using the binomial coefficient and explain how a
> constant success probability and the possible orders determine the result.

Das ist ein **Revisionskandidat**, kein `keep_current`. Der aktuelle P-v2-Kandidat
deckt Unabhängigkeit und genau-k-Zählung ab, benötigt nach einem Textwechsel
neue Goal- und Review-Input-Fingerprints. Sein zweiter Fall variiert derzeit
vor allem Urnenmischung, Zugzahl und Trefferzahl; die Transferqualität ist
gegen eine eigenständig geänderte Darstellung oder Ereignisstruktur erneut zu
prüfen. Das aktuelle PNG `sha256:a522c90588fefc0b8a112963a693a0531bf4cb9116d2128a69c79e34807b4c53`
zeigt einen fachlich passenden Einstiegsfall und bleibt unverändert.

## 27bdc580: heuristische Zwischenwertidee

Beide Runden sehen denselben mathematischen Fehler: „ohne Sprung“ schließt
eine hebbare Lücke nicht aus und rechtfertigt allein keine
Zwischenwertfolgerung. Der Quellenwortlaut verwendet diese Heuristik; die
Beschreibung muss ihre Intervallvoraussetzung und Existenzfolge klar machen,
ohne einen formalen Stetigkeitsbeweis zu verlangen:

> DE: Wenn der Funktionsgraph im betrachteten Intervall durchgehend verläuft,
> kann die lernende Person mit der Zwischenwertidee begründen, warum jeder
> Wert zwischen zwei gegebenen Funktionswerten angenommen wird, ohne einen
> formalen Stetigkeitsbeweis zu führen.

> EN: When a function graph is continuous throughout the interval under
> consideration, the learner can use the intermediate value idea to explain
> why every value between two given function values is attained, without
> giving a formal proof of continuity.

Auch dies ist ein **Revisionskandidat**. Das P-v2-Profil enthält weiterhin die
unzureichende Formulierung „ohne Sprung“ und kontrastiert bisher nur einen
Sprungfall. Seine Bedingung und ein Gegenfall mit Lücke müssen fachlich
nachgeprüft werden; bloßes Neu-Hashen wäre keine Inhaltsprüfung. Das PNG
`sha256:4d134eb230ac996f76b52ace1b44fa83879b39c788689ac7b2a836e42e3e8f51`
illustriert den zulässigen durchgehenden Spezialfall und bleibt unverändert.

## 18be713b: Objektpaare und GK/LK-Voraussetzung

Runde B hält den allgemeinen Text aus dem gebundenen Dreier-Input heraus für
methodenneutral. Runde A blockiert wegen unbestimmter Objektpaare und eines
LK-markierten Vorgängers für ein GK/LK-Ziel. Der gesonderte, read-only
[`source-scope-and-dependency-audit.md`](../m7-ten-current-png-20260927-v1/source-scope-and-dependency-audit.md)
prüft die vollständigen Quellen- und Graphbeziehungen und bestätigt den
Blocker: Hessen Q2.3, Spiegelstrich 3, behandelt den Winkel **zweier Geraden**;
Spiegelstrich 8 und separate kanonische Ziele behandeln Gerade–Ebene und
Ebene–Ebene. Fünf aktuelle Ebenen-Voraussetzungen, darunter ein LK-Ziel,
passen nicht zum Geradenwinkel für GK und LK. Zudem brauchen die betroffenen
HB-/NW-Quellencrosswalks und ein abhängiges Exam-Ziel eine zielgenaue
Nachprüfung. Ein gegenwärtiges `keep_current` würde diese Überlappung
verdecken; ein isolierter Beschreibungstausch würde die Graph- und
Quellenbindungen falsch lassen. Der Audit enthält einen konkreten
Gerade–Gerade-Reparaturvorschlag. Das neue PNG
`sha256:984456f9834149a31314167bc77a31b4ebdb1f9b4b896810ffb104427067bde2`
zeigt korrekt diesen einen Fall und bleibt unverändert.

## Bindung und nächster D-Schritt

Dieses Paket bindet das aktuelle BookModel
`sha256:68ee96e62750a4e020d3f6930ef42a1ba97227bb1cbcbe97e83320e0ffcac327`
und den Review-Input
`sha256:f6e649268cef7516a65cda248aa64216a59a565069015ba4a74006777034e3fc`.
Die aktuellen Seitenfingerprints sind `0408…`:
`sha256:46e17f74a01afa0f7ea8f40ee612db93ce737f721bcf75c2fd7a33779fa8860a`,
`27bd…`:
`sha256:bf8ac1b51cba4321a7f7161ec846f0c4e417da79d44c802b18bf218cebf1e0e7`
und `18be…`:
`sha256:b6ad0b569b8f3fd9875b23c903f5f45276026138cfffa41e331cf4695da5caa2`.
Diese Bindungen und alle drei Bildbytes wurden nicht geändert.

Ein künftiger kanonischer Text- oder Graphwechsel verändert Ziel-, Seiten-,
BookModel- und Landscape-Digests. Danach sind die betroffenen D-Pakete neu
vorzubereiten und aktuell erneut unabhängig zu prüfen. Ebenso sind
Fingerprint-gebundene Semantic-Atomicity- und Memory-Records, P-v2-Profile,
Visualisierungs-QA mit gespiegeltem Titel/Beschreibung sowie abgeleitete
Statusberichte gezielt zu aktualisieren und inhaltlich zu prüfen. Das gilt
besonders für den 18be-Quellen-/Graphumbau. Die aktuellen KI-Profile bleiben
`needs_human_review`/`ai_candidate`; weder diese Synthese noch die Bilder
liefern menschliche Freigabe oder Lernerfolgsnachweis.

Der Standard-`synthesis-decisions.json`-Vertrag materialisiert strenge
`keep_current`-Resolutionen, nicht unvollzogene Textrevisionen oder
Scope-Blocker. Für diese drei Ziele wird deshalb kein strenger D-Index
erzeugt und keine zentrale D-Registrierung geändert.
