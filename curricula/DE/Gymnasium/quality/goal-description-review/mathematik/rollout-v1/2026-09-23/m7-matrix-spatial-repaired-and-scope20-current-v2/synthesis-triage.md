# D20 v2: fachliche Synthese-Triage (2026-09-23)

Diese Triage vergleicht die beiden abgeschlossenen, fingerprint-gebundenen D-Erstrunden A/B für dieselben 20 aktuellen Mathematikziele. Bindung: Bundle `sha256:ac6b0e618dddcd2d82f4ac754235b1e5b28aa92949f6c4c40811ab540e3928bf`, Book `sha256:75b11e839792e6543141fe39d86097af9264285d76ee0b96aa40febb57c47fb2`, Input `sha256:c894789d0e2df572be1c8923cd7103a66f44bc4a51faa767533c11a8be946f86`. Die native Dual-Round-Prüfung ist gültig. A und B haben je 17 `keep`, 2 `revise`, 1 `split_review`; die **Entscheidung** stimmt bei 17/20 überein. Der native Vergleich meldet trotzdem 0/20 *wortgleiche* Records, weil auch bei gleicher Entscheidung die frei formulierten Evidenz- und Begründungsfelder verschieden sind. Das ist kein Widerspruch. Alle 40 Records bleiben `candidate`/`ai_candidate`, alle empfehlen ein noch nicht angelegtes V2-Verständnisprofil; es gibt keine automatische Freigabe.

## KEEP/KEEP: ohne Änderung der kanonischen Beschreibung weiterverwendbar

Diese 16 D-Beschreibungen können unverändert in die weitere Kandidaten-/Profilprüfung gehen; das ist keine menschliche Abnahme und ersetzt keine Evidenzprofile:

| ID | Ziel |
| --- | --- |
| `0de1e45c-aea9-5e53-932a-027dcf509efa` | Matrixpotenzen für langfristige Übergangsprozesse nutzen (LK) |
| `922d89fc-1cbd-56e9-ac5d-5cb59085de6c` | Grenzprozesse und Grenzmatrizen interpretieren (LK) |
| `4d331ba0-56d6-5730-a51b-e3d1126b31ba` | Bildpunkte mit Matrizen berechnen |
| `b72d87d4-763e-54aa-940d-31f195b51700` | Orthogonale Spiegelungen an Koordinatenebenen mit Matrizen darstellen |
| `55039f9c-4ebc-5115-add5-fae95b915e46` | Parallelprojektionen auf Koordinatenebenen mit Matrizen darstellen |
| `35558905-753d-5fcb-b25e-7f85ffdbff56` | Zentrische Streckungen am Koordinatenursprung mit Matrizen darstellen |
| `7bd8f022-5002-5610-994c-a9cec1890558` | Drehungen um Koordinatenachsen mit Matrizen darstellen (LK) |
| `c3b9c561-dd83-5903-9ec6-49c7f51bafd5` | Bedingte Wahrscheinlichkeiten berechnen |
| `be0e8715-3c3a-5ffb-937a-0b6bce4f01d8` | Vektoren als Orts-, Richtungs- und Verschiebungsvektoren im Raum beschreiben |
| `aae119f2-925f-5fc1-b795-b52c9e980863` | Räumliche Objekte im Koordinatensystem verorten |
| `eb6bfdd9-3cbe-51b5-9798-a741bdc2782e` | Geometriesoftware zur Raumorientierung nutzen |
| `72dfc164-455d-4b63-85f0-96e803c9a1d5` | Linearkombinationen von Vektoren bilden und deuten |
| `6fc9246a-9448-4cdb-b627-cf20ea1c65d3` | Lineare Abhängigkeit und Unabhängigkeit von Vektoren prüfen — Bildkandidat siehe V-HOLD unten |
| `54cfe5ce-693e-5d4a-ac1b-009570fbbc11` | Kollinearität von Vektoren im Raum prüfen |
| `68d4faef-1a56-5898-9c31-80b7d5d2e430` | Abstand zweier Punkte im Raum berechnen |
| `69eda7f9-1898-5220-932d-e7bec839b7af` | Streckenlängen im Raum bestimmen |

## Vier Fälle mit Änderungs- oder Strukturbedarf

| ID | A / B | Synthese und belegter nächster Schritt |
| --- | --- | --- |
| `4c494716-567b-59c2-855c-6ea45635c666` | `revise` / `revise` | **Lokale D-Korrektur.** „Schattenwürfe“ ist ohne Bedingung zu weit: Eine Zentralprojektion ist im üblichen Koordinatenraum nicht die gezeigte lineare Matrixabbildung. Das aktuell gebundene PNG zeigt ausdrücklich parallele Projektionspfeile und `S(x,y)=(x+y,0)`. Die Quelle Q2.5, S. 44, nennt Schattenwürfe als Beispiel; deshalb ist A's qualifizierende Fassung gegenüber B's Weglassen des Beispiels vorzuziehen: „Die lernende Person kann lineare geometrische Abbildungen, etwa als Parallelprojektion modellierte Schattenwürfe, mithilfe von Matrizen beschreiben und ihre geometrische Wirkung deuten.“ / “The learner can describe linear geometric mappings, such as shadows modeled by parallel projection, using matrices and interpret their geometric effect.” Das ist ein Vorschlag zur fachlichen Freigabe, kein angewendeter Patch. |
| `52e57eb5-7cd1-5df0-a8c6-7b090f097d9f` | `revise` / `keep` | **Dissent; kleine D-Präzisierung empfohlen.** „Bedingte Wahrscheinlichkeiten ablesen“ kann einen einzelnen Zellenwert nahelegen. Das aktuell gebundene PNG zeigt gerade die unterschiedlichen Bezugsgruppen: `30/100`, `30/50`, `30/40`; Q3.1, S. 46, nennt das Darstellen und Berechnen mit Vier-/Mehrfeldertafeln. Eine enge Fassung soll den Tabellenfokus und AB1 bewahren, etwa: „… gemeinsame Wahrscheinlichkeiten ablesen und bedingte Wahrscheinlichkeiten anhand der passenden Bezugsgruppe aus der Tafel ermitteln.“ / “… read joint probabilities and obtain conditional probabilities from the table using the appropriate reference group.” A's Richtung ist richtig; „bestimmen und deuten“ im gesamten A-Vorschlag sollte vor Übernahme gegen das separate Berechnungsziel `c3b9c561-dd83-5903-9ec6-49c7f51bafd5` abgegrenzt werden. |
| `f37b0a72-9e23-51c7-aad5-438c17a56899` | `keep` / `split_review` | **Strukturelle Split-Prüfung empfohlen; nicht per Satzglättung erledigt.** Addition/Verkettung und Skalarmultiplikation/Streckung sind unabhängig prüfbare Operationen, auch wenn Q2.2, S. 41, beide im selben offiziellen Quellenaspekt „Rechnen mit Vektoren“ nennt. Das gebundene Bild hat zwei getrennte Tafeln und veranschaulicht rechts nur Faktor 2, nicht negative Faktoren. Eine fachliche Aufteilung müsste beide Quellenteile, Voraussetzungen und bestehende ID-Verweise erhalten; noch keine neuen IDs oder Freigabe festlegen. |
| `4bc6cc77-3d20-5d27-a74a-8efb0a038d17` | `split_review` / `revise` | **Identitäts-/Doppelungsprüfung vor jeder Wortkorrektur.** Der aktuelle Wortlaut vereinigt nahezu genau `0de1e45c-aea9-5e53-932a-027dcf509efa` (Matrixpotenzen, Zwischenergebnisse) und `922d89fc-1cbd-56e9-ac5d-5cb59085de6c` (Grenzprozesse, Grenzmatrix, stabile Entwicklung). Die KC-Stelle Q2.4, S. 43, nennt Potenzen und Grenzprozesse/Interpretieren von Grenzmatrizen nebeneinander; die lokale Quellenextraktion zerlegt sie in zwei Aspekte. B's Hinweis ist mathematisch richtig: Eine Grenzmatrix existiert nicht für jeden Übergangsprozess; die gebundene Grafik zeigt nur einen konvergenten Fall in Zeilenvektor-Konvention. B's lokale Revision beseitigt aber die Doppelung nicht. Daher A's `split_review` als struktureller Prüfauftrag: entscheiden, ob die ID redundant ist oder eine nachweisbar eigenständige integrierte Kompetenz bekommt; **nicht** automatisch zwei weitere Kopien der bereits vorhandenen Ziele erzeugen. |

Die vier Grenzfallbilder wurden gegen die in der D-Eingabe gebundenen öffentlichen Assets und ihre SHA-256 geprüft. Die genannten Quellenstellen wurden zusätzlich im lokalen [KC-Mathematik-PDF](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf) und der [Q2/Q3-Extraktion](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json) gegengeprüft. Eine vollständige effektive Composition-View-/Source-Mapping-Prüfung ist damit nicht behauptet.

## 6fc: fachlicher D-KEEP-Befund, aktueller D/V-HOLD

`6fc9246a-9448-4cdb-b627-cf20ea1c65d3` ist in beiden D-Runden `keep`: Die Beschreibung benötigt keine Änderung. Das aktuell gebundene JPG (`sha256:ad5f2098065421f707e8f42637a4c427d5f7ce5fc136fb488d1195bd9b98507d`) bleibt der geprüfte, aber **nicht V-freigegebene** Stand: In beiden oberen `Vektoren`-Reihen zeigen gleichgerichtete Pfeile verschiedene Koordinatenvektoren. Die frühere AI-V-Freigabe für genau dieses Bild wurde im aktuellen QA-Ledger deshalb auf `aiApproved: no` widerrufen. Der neue Korrekturversuch `attempt-01.png` ist **als Ersatz auf HOLD**, weil statt einer lokalen Sechs-Symbol-Retusche die ganze Seite neu gezeichnet und von 2752 × 1536 auf 1678 × 937 px reduziert wurde; die algebraischen Hauptaussagen dort sind nicht der Ablehnungsgrund. Siehe [separates Prüfprotokoll](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-linear-dependence-6fc-correction-20260923-v1/attempt-01.review.md). D-Entscheidung, bestehendes Bild und Kandidatenurteil dürfen nicht miteinander verwechselt werden.

Für einen **aktuellen D-Teilabschluss** ist 6fc deshalb aus dem 15er-Teilindex ausgeschlossen: Nach `qaStatus: review_candidate -> rejected` ist sein aktueller Page-Fingerprint `sha256:3c0fa5b4c4a3165a71b786eb94fcec301b5e90e23a832b21ab258d766b5e01f9`, nicht mehr der im D-Review gebundene `sha256:12e525a08b070bc1f4c48e98eac73618c404dcc51e6b0cced9bd2117f4773823`. Goal-Fingerprint und Bildbytes blieben gleich; das reicht nicht für eine current-page-D-Resolution. Nach Bildkorrektur sind eine gezielte neue Seiten-/Reviewbindung und eigene V-Prüfung nötig. Die übrigen 15 fachlichen KEEP/KEEP-Ziele sind einzeln gegen die aktuelle Seite geprüft; der globale BookModel-Digest allein ist dafür nicht der Nachweis.

**Status:** reine Synthese-Triage. Keine Canonical-, Registry-, QA- oder Profilmutation; keine menschliche Adjudikation und keine Behauptung eines M7- oder Quellenabschlusses.
