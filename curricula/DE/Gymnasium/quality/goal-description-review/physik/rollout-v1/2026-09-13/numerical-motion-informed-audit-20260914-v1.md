# Numerische Bewegungssimulation: informierte Kontextprüfung

Datum: 14. September 2026. Ziel: `761a0879-fc15-5d0c-a2b7-2b439efecd5b`.
Autorität: informierte KI-Prüfung; keine neue Blindprüfung, keine menschliche
Freigabe, keine Resolution und kein Fortschrittsanspruch. Canonical, Registry,
Claims, ursprüngliche Reviews, P-Profile und Bildfreigaben wurden nicht geändert.

## Ergebnis und kleinster nächster Schritt

Ein fachlicher Mangel des aktuellen Zieltexts, ein notwendiger Split oder eine
zusätzliche Quellenlücke ist aus dem untersuchten Vorbehalt nicht abzuleiten.
Modellierung und numerische Umsetzung einer Bewegung mit Reibung sind eine
zusammenhängende Kompetenz. Die beiden Voraussetzungen tragen die benötigte
Physik beziehungsweise die Tabellenmodellierung; das bestehende P-Profil
verlangt eigenständige Konstruktion, veränderte Kräfte und Numerikkontrolle.

Der D049-Vorbehalt ist dennoch nicht durch unveränderte Übernahme der alten
KEEP-Records zu schließen: Der Titel einer Voraussetzung auf der gebundenen
Buchseite hat sich tatsächlich geändert. Bei erneuter Erzeugung desselben
D049-Subsets aus dem aktuellen Buch ändern sich Seiten- und Kontextfingerprint.
Die ursprünglichen Reviews sind gültige historische Evidenz, jedoch keine zwei
Reviews des vollständigen aktuellen Seitenkontexts.

Die kleinste nächste Aktion ist daher ein aktuelles Einziel-D-Paket für dieses
Ziel, mit zwei unabhängigen Prüfungen des aktuellen Kontexts und anschließender
informierter Synthese der tatsächlichen Ergebnisse. Der Zieltext, die stabile
ID, Voraussetzungen, Quellenzuordnungen, das gute vorhandene Bild und das
aktuelle P-Profil benötigen dafür keine vorbeugende Änderung. Die übrigen
19 Ziele des alten D049-Pakets werden nicht erneut geprüft. Erst ein gültiger
aktueller D-Abschluss und die bestehenden nativen Gesamtprüfungen erlauben
Registrierung und Entfernung dieses einzelnen Claims. Hier wurde kein solches
Paket gestartet oder vorbereitet.

## Vorbehalt und vorhandene D-Evidenz

Die aktuelle Claim-Datei ist
`curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-13/resumed-current-remaining-2-after-stellar-two-v1.config.json`.
Sie ist im zentralen `goal-description-review/in-flight-work-ledger.json`
referenziert und enthält dieses Ziel ausdrücklich weiter.

Der konkrete Ausschlussgrund steht in
`curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/batch-049-current-splits-and-models-final-20-v1/current-subset-materialization.receipt.json`:
Die Fallbewegungs-Voraussetzung wurde nach den Runden präzisiert; beide Reviews
sollen erhalten bleiben, und der aktuelle Kontext ist nachzuprüfen.

Die zwei Originalrecords stehen jeweils in Zeile 1:

- `curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/batch-049-current-splits-and-models-final-20-v1/round-a/results/physik-rollout-v1-batch-049-current-splits-and-models-final-20-v1-20260908-first-pass-a.batch-001.records.jsonl`
- `curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/batch-049-current-splits-and-models-final-20-v1/round-b/results/physik-rollout-v1-batch-049-current-splits-and-models-final-20-v1-20260908-first-pass-b.batch-001.records.jsonl`

Beide entscheiden `keep`. Die vorhandene `dual-summary.json` verlangt wegen
unterschiedlicher Verständnis-Evidenz und Begründungen eine Synthese; sie erteilt
keine automatische Annahme. D050 enthält dieses Ziel weder in seiner
`batch-050-current-dependent-contexts-16-v1.config.json` noch in den Ergebnisrecords.
Seine Erwähnung im vollständigen D050-Buchmodell ist kein D050-Review dieses Ziels.

Die native Funktion `validateGoalDescriptionReviewCampaignResultDirectories`
validierte beide vollständigen historischen D049-Runden ohne Fehler, jeweils
20 Records. Die anschließende reine In-memory-Berechnung mit
`buildGoalDescriptionRolloutSubsetModel` verwendete dieselben 20 IDs,
dieselbe Reihenfolge, dieselbe Book-ID und denselben Titel aus der D049-Config.
Der aktuelle Ausgangspunkt war
`app/public/lernzielbuch/de-gym-physik-bundesweit.book-model.json`.
Abgesehen von den daraus folgenden Fingerprintfeldern gab es für das hier
untersuchte Ziel exakt eine Differenz:

`reviewContext.page.externalPrerequisites[1].title`:
`Freier Fall mit Luftreibung und Grenzgeschwindigkeit` →
`Fallbewegung mit Luftwiderstand und Grenzgeschwindigkeit`.

| Bindung | Historisch | Aktuell, bei identischem D049-Subset |
| --- | --- | --- |
| Goal | `sha256:3bfc8a52e9b6080aaa9486b7f51a92f404bcb9424593a2b4baebd94cd2b0d43a` | unverändert |
| Page | `sha256:62918e2fd886e6580be4a4a4f19fefae2406e02c6ce40224fba8e8c1f62fa925` | `sha256:9ee32ef0b6b43ca98df6bd99f74a94b7aa166c4b5eb3c58e48685243ed34346a` |
| V3-Kontext | `sha256:206dfbf3a251a38ef70c5f72455cd2bcb6808b3b345ffa4efb5ea6472e946c1b` | `sha256:0527c11a8b44352c7788710514ee02c5184e96da34a822dad3f744b1f7f7ea75` |

Die Kontextwerte wurden mit `fingerprintGoalDescriptionReviewContext` berechnet.
Dieser Vergleich vermeidet den unzulässigen direkten Vergleich eines
Vollatlas-Seitenfingerprints mit dem Seitenfingerprint eines Teilbuchs.

## Fachlicher Kontext und Verständnisprofil

Im aktuellen Canonical
`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
setzt das Ziel `12260012-cf04-5409-b57d-f5b3a46d9126` und
`ac25ffe3-fd42-592d-a937-79cc13460313` voraus. Die erste Kompetenz erklärt jetzt
explizit das Kräftegleichgewicht bei vernachlässigbarem Auftrieb. Das korrigiert
den früheren Begriff „freier Fall mit Luftreibung“, ohne das Reibungsverständnis
zu entfernen. Die zweite Kompetenz umfasst Anfangswerte, endliche Zeitschritte,
Tabellenformeln, Parameteränderungen und Interpretation. Das Ziel wendet diese
Methode auf reibungsbehaftete Bewegungen an; Modell und Umsetzung müssen nicht
als unabhängige Ziele getrennt werden.

Direkte Nachfolger sind die mehrschrittige Übungsaufgabe
`dd99528a-bae5-5b78-89e6-c6092c927f8d` und der E-Phasen-Abschluss
`7f83e25c-38f7-5ac2-8f9c-ec54eeef1026`. Der erste Nachfolger verwendet bei seinem
numerischen Teilschritt den neuen Geschwindigkeitswert für das Ortsupdate. Das
ist eine andere, konsistente Diskretisierung als das explizite Euler-Beispiel im
Bild; der aktuelle Zieltext schreibt keine einzelne Euler-Variante vor.
Dieser eine Teilschritt allein belegt keine vollständige eigenständige Simulation
mit Reibung. Dafür enthält das separate P-Profil zwei konkrete eigene Fälle.

Das aktiv registrierte P-Profil steht in Zeile 1 von
`curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-045-e-methods-and-entropy-4-v1.retained-after-final-context-v1.review.jsonl`.
Die gleichnamige Config validierte mit `reviewPositiveGoalEvidenceConfig` ohne
Fehler. `profileFingerprint` ist
`sha256:411a9f3b22cd46d8d531a43b53ec50f10b30ccd99aaf343011cf0176cc48b9b6`;
`reviewInputFingerprint` ist
`sha256:4099f898c2c4c9780d59f39057cdf7069ab61de7ad8b9170898aa5864ddc9e74`.
Es bleibt `ai_candidate` / `needs_human_review`.

Beide vollständigen DE/EN-Fälle wurden nachgerechnet: Reine lineare Reibung
liefert bei Δt=0,5 s die Paare (x₁,v₁)=(2;3) und (x₂,v₂)=(3,5;2,25) in
SI-Einheiten. Der übergroße Schritt Δt=3 s liefert v₁=−2 m/s und macht den
numerischen Vorzeichenfehler prüfbar. Beim Fall mit Gewicht und linearer Reibung
liefert aᵢ=10−vᵢ mit Δt=0,5 s die Geschwindigkeiten 5;7,5;8,75 m/s;
mg/k=10 m/s ist die Grenzgeschwindigkeit. Der Einzelschritt Δt=1 s liefert
bei derselben Endzeit 10 statt 7,5 m/s. Die Fälle ändern Kräfte und Grenzverhalten,
fordern eigene Tabellen und sind kein Nachzeichnen des Bilds. Die jetzige
Auftriebsbedingung der Voraussetzung ist mit den ausdrücklich vorgegebenen
Kräften dieser Fälle vereinbar.

Der frühere vollständige informierte Body-Gegencheck ist
`curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/p045-informed-body-counterreview.json`.
Er bestätigt denselben Körper ohne Änderungen und bleibt erhalten.

Das Originalbild unter
`curricula/DE/Gymnasium/visualizations/physik/761a0879-fc15-5d0c-a2b7-2b439efecd5b/761a0879-fc15-5d0c-a2b7-2b439efecd5b.png`
wurde vollständig betrachtet. Vorzeichen, Einheiten, alte Werte in beiden
expliziten Euler-Updates und die Tabelle bis x=24,4 m / v=5,12 m/s stimmen.
Datei-, QA- und bestehender AI-Approval-Hash sind identisch:
`sha256:29bd8295e43ecc1039d1591669add99755cc4edd96ed05f954a768fc730927da`.
`humanApproved` bleibt `no`; die alten ChatGPT-Triagefelder werden dadurch nicht
umgeschrieben. Die bestehende Entscheidung `atomic` im Atomicity-Ledger ist
mit der inhaltlichen Prüfung vereinbar; diese Notiz ersetzt keine Ledgerentscheidung.

## Quellen- und Abnahmegrenze

Der vorhandene Hessische Originaltext unter
`curricula/DE/Gymnasium/input/HE/upper-secondary/kernkurriculum_gymnasiale_oberstufe-physik.pdf`
wurde lokal gelesen; SHA-256:
`46f3e728b5d9fc6b5901f191247951a4a9d9c3df641afa60ca8b17a2e049813f`.
PDF-Seite 31, E.4, nennt numerische Simulation mit mathematischem Modell,
Differenzenquotienten und beispielsweise Tabellenkalkulation. Die benachbarten
Reibungsfälle tragen die gewählte Anwendung. PDF-Seite 27 bezeichnet nur E.1
bis E.3 als verbindlich: E.4 wird durch dieses Audit nicht zu allgemeinem
Pflichtstoff. Das ist eine lokale Bestätigung der bereits benannten HE-Quelle,
keine neue vollständige Quellen-/Projektionsfreigabe für alle Bundesländer.

Der jüngste Zwischenstand und die historische Pausenakte bleiben maßgeblich:
`docs/qa-ci/math-physics-resumed-checkpoint-2026-09-13.md` und
`docs/qa-ci/physics-paused-checkpoint-2026-09-08.md`. Die Pflicht, gültige Reviews
zu erhalten, wird eingehalten; die echte Änderung der gebundenen Seite wird
ebenso erhalten und nicht durch einen Hash-Refresh übergangen.

Geprüfte Eingangsbytes:

- Canonical Physik: `sha256:0b3a2f2e015cdfbdf7240dccc4a1d7318ee4283ab3007199f6e52c8e204f643e`.
- Aktuelles Physik-Buchmodell: `sha256:96a71a50ee80c1329d6f4c37d29ab43790d790ff0611db6799fb952c980504ce`.

Alle nativen Validierungen und Modellvergleiche liefen ohne Schreibmodus.
Diese informative Datei ist die einzige durch diesen Audit hinzugefügte Datei.
