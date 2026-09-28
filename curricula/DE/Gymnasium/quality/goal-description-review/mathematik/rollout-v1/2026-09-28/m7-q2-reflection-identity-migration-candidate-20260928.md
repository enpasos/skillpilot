# Q2.3 Spiegelungen: Zielidentität und Migration (Kandidat, 2026-09-28)

**Status:** Fachlicher Arbeitsvorschlag, keine D-Freigabe und keine Änderung an Kanon,
Mappings, Ansichten, gespeicherter Mastery oder M7-Zähler. Die zwei unabhängigen
D-Reviews halten alle drei hier betrachteten LK-Atome weiter auf `block/block`
([Synthese vom 27.09.](../2026-09-27/m7-vready-remainder19-recheck-20260927-v1/synthesis-assessment.md)).

## Quellen- und Bestandsbefund

- Das [hessische KCGO Mathematik 2024, Q2.3, S. 42–43](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf)
  verlangt im grundlegenden Teil ausdrücklich das Spiegeln **eines Punktes an einer Ebene**.
  Im erhöhten Teil steht „Spiegeln von Punkten, Geraden und Ebenen allgemein“.
  Dort ist das **Spiegelobjekt nicht benannt**; eine Ebene als Spiegel ist eine
  naheliegende, aber zu adjudizierende Operationalisierung aus dem Q2.3-Kontext,
  kein wörtlich festgelegter LK-Sachverhalt.
- Das bestehende gemeinsame GK/LK-Ziel `8cb5c712…` kann bereits einen Punkt
  **an einer beliebigen Ebene** samt Lotfuß-/Mittelpunktbegründung spiegeln.
  Die vorhandene positive Evidenz enthält sogar eine schiefe Ebene. Das
  zusätzliche LK-Punktziel `fcd1d180…` benennt dagegen kein Spiegelobjekt;
  seine Visualisierung zeigt nur die Koordinatenebene `x = 2`. Es gibt derzeit
  keine belegte zusätzliche Punktkompetenz. „Allgemein“ allein macht aus
  demselben Punkt-an-Ebene-Verfahren kein neues curricular atomisches Ziel.
- Die LK-Ziele `a97c7cce…` (Gerade) und `985d5529…` (Ebene) sind als
  **unterschiedliche Objektleistungen** fachlich trennbar: Bildgerade aus
  geeigneten Punktbildern und Richtungsprüfung; Bildebene aus drei nicht
  kollinearen Punktbildern oder äquivalenter Gleichungstransformation.
  Ihre derzeitigen Texte benennen die Spiegeltransformation jedoch nicht.
  Die Bestandsbilder behandeln nur achsenparallele Speziallagen (`x = 2`).
  Ein vorhandener [P-Evidenzkandidat](../../../../goal-evidence/m7-q2-line-plane-oblique-mirror-p-candidate-20260926-v1/positive-evidence.candidates.json)
  prüft schiefe Spiegelebenen, ist aber weder Quellenentscheid noch D-/A-/V-Freigabe.
- Die [BW-Quelle, Leistungsfach 3.4.3(7)](../../../../../input/BW/upper-secondary/source-extraction/DE_BW_MATHEMATIK_SEKII_BP2016.source-extraction.json)
  nennt ausdrücklich eine **Gerade an einem Punkt**, neben einem Punkt an
  einer Ebene. Das geprüfte BW-Mapping bindet diese Gerade nur `partial` an
  den breiten Cluster `dd042c27…`, nicht an `a97c7cce…`. Eine Präzisierung
  von `a97c7cce…` auf „Gerade an Ebene“ deckt **nicht** den BW-Fall.
  Die gesichtete BY-LehrplanPLUS-Extraktion enthält keinen entsprechenden
  Spiegelungstreffer; dies ist ein Prüfbedarf, kein Beweis einer inhaltlichen
  Nichtexistenz im gesamten bayerischen Lehrplan.
- Der Cluster `dd042c27…` wird als `canonicalSubtree` in acht HE-, BW- und
  BY-LK-Ansichten referenziert; eine fehlende `projectionRole` bedeutet dort
  `target`. Die drei Kinder sind somit nicht bloß internes HE-Material. Vor
  einer Änderung sind alle aufgelösten Länder-Scope-Projektionen zu prüfen.
- Die freigegebene Q2-Klausur `2f8a3a90…` listet alle drei Spiegelziele in
  `requires` **und** `examData.coveredGoalIds`, fragt aber nur Punktlage,
  Geraden-Ebenen-Schnitt, Hesse-Normalform und Quader-Schnittfigur ab. Sie
  prüft **keine** Spiegelung. Diese Metadaten sind falsche Assessment-Deckung.

## Kleinster fachlich redlicher Zielzuschnitt

| ID | Kandidat | Warum / neue Nachweise |
| --- | --- | --- |
| `fcd1d180…` | Nicht als zusätzliches LK-Atom zählen; die Punkt-an-Ebene-Leistung bleibt bei `8cb5c712…`. Nur falls eine Quelle eine **andere** Punktspiegelung eindeutig verlangt, dafür eine eigenständige präzise Kompetenz neu prüfen. | Kein gesonderter Prüfgegenstand gegenüber GK; `fcd1`-Bild und P-Fälle beweisen keine darüber hinausgehende Beherrschung. |
| `a97c7cce…` | Für HE **kandidatisch** „Eine Gerade an einer gegebenen, auch schiefen Ebene spiegeln und Bildgerade durch Punktbilder sowie Symmetriebedingungen prüfen“. | Von der Punktspiegelung abgeleitete, aber eigenständige Geradenleistung; HE-Spiegelobjekt fachlich entscheiden. BW-Gerade-an-Punkt benötigt eigenes Ziel/Mapping statt stiller Gleichsetzung. |
| `985d5529…` | Für HE **kandidatisch** „Eine Ebene an einer gegebenen, auch schiefen Ebene spiegeln und Bildgleichung durch Punktbilder oder Transformation prüfen“. | Eigenständige Ebenenleistung; HE-Spiegelobjekt fachlich entscheiden. Eine gespiegelte Bildgerade ist keine notwendige Voraussetzung dafür. |

Die `requires`-Kette über `fcd1` und von der Bildebene über `a97` ist
didaktisch nicht zwingend. Für eine Ebene genügen geeignete Punktbilder und
Ebenenkenntnisse; `8cb5` kann als echte Voraussetzung bleiben. Ob das breite
LK-Lotfuß-Abstandsziel `c2c49659…` nötig ist, muss gegen die **konkrete**
Spiegelungsaufgabe geprüft werden; dessen eigene D-Zerlegung ist noch offen.

## Migrations- und Freigabepfad

1. Quellenentscheidung protokollieren: HE-Spiegelobjekt für Gerade/Ebene,
   Verhältnis zu GK-Punktziel und BW-Gerade-an-Punkt einzeln klären. Keine
   `exact`-Kante für ein einzelnes Atom allein aus dem zusammengesetzten
   HE-Quellsatz ableiten. BW-`partial`-Clusterkante darf nicht als Beleg für
   Punkt-, Geraden-an-Ebene- **und** Ebenenkompetenz hochgerechnet werden;
   BY und die übrigen Jurisdiktionen separat quellenbinden.
2. Zielgraph/Scope erst danach ändern: `fcd1` aus dem lernendenwirksamen
   Zielbestand und aus Cluster-Gewicht/-Kindern entfernen; historische ID und
   Belege auffindbar halten. `a97`/`985` nur mit explizitem, freigegebenem
   Spiegelobjekt und passender Geltung weiterverwenden. Für BW nötigenfalls
   ein neues Atom „Gerade an einem Punkt spiegeln“ mit eigener ID anlegen.
   Acht explizite Ansichten und abgeleitete Landes-/GK-/LK-Projektionen,
   Referenzen und Counts neu prüfen; keine bloße Umbenennung des HE-Kanons
   als Lösung für BW/BY.
3. Gespeicherte Mastery ist ID-bezogen: alte `fcd1`-Werte **nicht** automatisch
   nach `8cb5` kopieren und nicht auf `a97`/`985` verteilen. Sie bleiben als
   historische Zustände lesbar, zählen aber nicht zum neuen Zielnenner.
   Ob bestehende `a97`-/`985`-Werte unter veränderter Semantik gelten, anhand
   tatsächlicher Evidenz prüfen; bei nicht belegter Identität neu beurteilen.
   Aktive Ziele, Fokuswurzeln, Frontiers und Prüfungs-Voraussetzungen gegen
   neue Targets revalidieren, ohne erreichte andere Ziele zu verlieren.
4. In `2f8a3a90…` die drei falschen `coveredGoalIds` und nicht nötigen
   Spiegelungs-`requires` mit neuer Assessment-Prüfung korrigieren. Für
   behaltene Geraden-/Ebenenleistungen echte, bewertbare Aufgaben zu einer
   schiefen Spiegelebene mit Musterlösung und geometrischer Kontrolle
   zuordnen; BW-Gerade-an-Punkt getrennt prüfen. Das alte `released`-Label
   ersetzt diese fachliche Prüfung nicht.
5. Erst nach kanonischem Zuschnitt D, P, A, M und V samt neuen Fingerprints,
   Scope-/View-Checks und unabhängigen Reviews ausführen. Die alten
   Spezialfallbilder und der oblique P-Kandidat sind allenfalls Startmaterial;
   **keines der drei Ziele wird durch dieses Dokument M7-fertig.**
