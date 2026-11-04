# Unabhängiger Inhaltsreview der vier vollständigen Raumgeometrieformen

**Ergebnis: drei Formen PASS; Ebenenschar NEEDS_REVISION wegen genau eines
begrenzten Rubrikbefunds.** Die Mathematik aller vier Musterlösungen stimmt.

Geprüft wurden alle vier ganzen Alt-/Neuverträge und sämtliche 24 DE/EN-Texte.
Der Einstieg ist an Handoff-SHA
`585943faa0c0d5aea502ee1895fc7edd9d13d57534f24257109c9fcfd5efe71c` und
Manifest-SHA `b0f6fb93d4fe29ed7688aa750413177412280da114e4d84405762949b32430e1`
gebunden. Alle 52 Dateien stimmen mit dem Manifest überein. Die vier alten
Objekte stimmen weiterhin mit den entsprechenden aktuellen kanonischen
Objekten überein. Pro Objekt ändern sich ausschließlich `nodeKind` und
`examData`; die äußeren und eingebetteten Texte stimmen überein. Vollständige
Einzelbindungen und Entscheidungen stehen in `review.json`.

Die Prüfung erfolgte unabhängig von der Autorprüfung: Die 37 eigenen exakten
Algebra-/Fallprüfungen in `independent_checks.py` wurden aus Aufgaben und
Lösungen erstellt, ohne Autorprogramme zu importieren oder auszuführen.
Alle 37 bestehen. Die Benotung wurde zusätzlich inhaltlich gegen mögliche
Auslassungen geprüft; sie folgt nicht allein aus diesen Rechenprüfungen.

| Lernziel | Entscheidung zur ganzen eingefrorenen Form | Inhaltliche Begründung |
|---|---|---|
| 492463cf – geradlinige Bewegung | PASS | Modell aus zeitlich versetzten Messungen, Rückrechnung auf t=0, Orts- und Verschiebungsauswertung, gerichtete Änderung pro Zeit und dreidimensionale Erreichbarkeit prüfen die vollständige ursprüngliche Kompetenz. |
| a9fde754 – Spurpunkte | PASS | Alle drei Koordinatenebenen werden berechnet und geprüft; gemeinsame Zugehörigkeit, Abgrenzung von bloßem Nullsetzen und die beiden Fälle einer enthaltenen bzw. echt parallelen Geraden werden sinnvoll gedeutet. |
| edaf0bb4 – Geradenschar | PASS | Schar-/Laufparameter, allgemeine Lageuntersuchung mit vollständiger Fallmenge, Herleitung einer weiteren Schnittbedingung und geometrische Deutung bilden die ganze Kompetenz ab. |
| fd4b7145 – Ebenenschar | NEEDS_REVISION | Aufgabe und Lösung passen vollständig; die Rubrik sichert den selbst als zentral bezeichneten Sonderfall a=1/F nur bei Verlust durch unzulässige Division, nicht bei bloßem Auslassen. |

Die Bewegungsrechnung ergibt v=(2,−1,−1)ᵀ, x₀=(1,5,10)ᵀ, x(6)=(13,−1,4)ᵀ
und die Verschiebung (6,−3,−3)ᵀ. R wird nur bei t=7 erreicht; S nie.
Bei den Spurpunkten stimmen r=3, 3/2 und −2 und die Punkte (5,3,0),
(7/2,0,3) und (0,−7,10). Die Sonderfälle h⊂xy und k∩xy=∅ sind korrekt.
Die Geradenschar ist zu h nur bei a=0 echt parallel, bei a=1 im Ursprung
schneidend und sonst windschief; kein Mitglied ist identisch mit h.
Zu k schneiden genau a=−1 und a=2 an verschiedenen Punkten.
Die Ebenenschar ist bei a=1 identisch mit F und sonst in
L=(0,1,1)ᵀ+t(1,1,−1)ᵀ schneidend. L ist genau der gemeinsame Punktbestand
aller Scharebenen. P verlangt a=3/2; zu G gilt echte Parallelität nur bei a=1.

AB2/L3 für Bewegung und Spurpunkte sowie AB3/L3/LK für die Scharen passen.
Die Aufgaben verbinden jeweils eine zusammenhängende Tätigkeit mit ihren
Erklärungen und Kontrollen. Die Scharaufgaben verlangen allgemeine Bedingungen
statt bloßer Beispielrechnung; die Ebenenaufgabe zusätzlich einen Schluss über
alle Scharmitglieder. Umfang und 20-BE-Verteilung sind für einzelne
Oberstufenprüfungsformen vertretbar. Eine empirische Zeitkalibrierung wird damit
nicht behauptet.

Die Sprache ist verständliche Schulsprache. Pfeile kennzeichnen die relevanten
Vektorgrößen; Punkt-, Vektor- und Parameterrollen sind unterscheidbar. DE und
EN stimmen in Anforderungen, Ergebnissen, Teilpunkten und Kappungen überein.
Die vorhandenen Vorbereitungsziele tragen die benötigten Vektoroperationen,
Parameterdarstellungen, Gleichungssysteme, Normalen und Lagebeziehungen.
Ableitungen, Geschwindigkeitsbeträge, Kreuzprodukte oder neue Scharverfahren
werden nicht heimlich verlangt; die einfache Faktorisierung der Geradenschar
ist angegeben. Kein neuer fachlicher Voraussetzungsmangel wurde gefunden.

Die ersten drei Rubriken verhindern ein Bestehen bei vollständig fehlender
Kernhandlung: Bewegungsmodell, Untersuchung und Geschwindigkeitsdeutung sind
abgesichert; bei den Spurpunkten jede Ebene, geometrische Deutung und gemeinsame
Zugehörigkeitsprüfung; bei der Geradenschar allgemeine Parameteruntersuchung,
Herleitung aus Bedingungen und Lageinterpretation. Eine Zusatzaufgabe darf
teilweise fehlen, wenn dieselbe ursprüngliche Kernhandlung anderswo ausreichend
gezeigt wird. So kann die Geradenschar ohne Teil 3 höchstens 15 Punkte erreichen,
zeigt aber über Teil 2 bereits alle drei ursprünglichen Kompetenzbestandteile.
Das ist kein Bestehensweg über bloße Nebenleistungen.

In allen vier Rubriken zählen gleichwertige Ansätze und an anderer Stelle
gezeigte Leistungen. Ein lokaler Rechenfehler wird nicht zur mehrfachen
Entwertung richtiger Folgearbeit oder automatisch zur Kappung. Die Spurpunkt-
Rubrik erlaubt ausdrücklich eine kombinierte Bestimmung/Probe. Es entsteht
jeweils genau eine Gesamtentscheidung ab 15 von 20 BE; weder Teilbestehen noch
Mastery für Voraussetzungen werden eingeführt.

## F-PLANE-01: Sonderfallkappung kausal zu eng

Betroffen sind `fd4b7145…/rubric.de.md`, `rubric.en.md`, deren Einbettung in
`solutionContent`/`solutionContentEn` und der zugehörige `capReasonKeys`-Eintrag.
Der deutsche Satz beginnt „Wird der Sonderfall a=1 … ausschließlich durch
unzulässiges Teilen … ausgeschlossen“. Der englische Satz hat dieselbe Lücke.

`plane-cap-counterexample.de.md` enthält eine konkrete Abgabe mit exakt
15 BE: Normalen/E₀ 3, allgemeine Lage zu F ohne Sonderfall 5, gemeinsame Achse
4, Punktbedingung 2, bloßer Normalenvergleich zu G 1. Sie teilt nur unter
a≠1 und untersucht nirgends E₁∩F als ganze Ebene. Damit greift keine der
aktuellen Kappungsbedingungen. Der zentrale Sonderfall fehlt vollständig,
obwohl die Schwelle erreicht wird.

**Notwendige begrenzte Korrektur:** Die bestehende Gesamtpunktkappung muss
das vollständige Fehlen einer sachgerechten Behandlung des Falls a=1/F
unabhängig von der Ursache umfassen. Geeigneter Ersatz für den engen
Sonderfallsatz:

> Dieselbe Kappung gilt, wenn über die gesamte Abgabe keine fachlich tragfähige
> Untersuchung des Sonderfalls a=1 bei der Lage zu F erkennbar ist. Der Wechsel
> von der Schnittgeraden für a≠1 zur ganzen Ebene für a=1 darf nicht vollständig
> fehlen. Dies gilt bei bloßem Auslassen ebenso wie bei Verlust des Falls durch
> unzulässiges Teilen durch a−1. Eine knappe begründete Feststellung E₁=F genügt;
> eine richtige Behandlung an anderer Stelle zählt. Ein einzelner lokaler
> Rechen- oder Übertragungsfehler allein löst weiterhin keine Kappung aus.

Englische Entsprechung:

> The same cap applies if no mathematically sound treatment of the exceptional
> case a=1 relative to F is evident anywhere in the submission. The change from
> an intersection line for a≠1 to the entire plane for a=1 must not be entirely
> absent. This includes simply omitting the case as well as losing it through
> invalid division by a−1. A concise justified statement that E₁=F is sufficient;
> a correct treatment elsewhere counts. A single local arithmetic or copying
> error alone still does not trigger the cap.

Ein passender technischer Grundschlüssel wäre
`missing-or-invalid-special-case-a1`. Aufgaben, Lösungsmathematik, Punktbudget,
Schwelle, ID, Quellen und Vorbereitung müssen dafür nicht geändert werden.
Danach genügt ein gebundener gezielter Review der korrigierten DE/EN-Rubrik,
ihrer Einbettung und der Fälle „ausgelassen“, „unzulässig dividiert“, „anderswo
korrekt“ und „lokaler Fehler“. Die unveränderten drei PASS-Formen benötigen
keine neue fachliche Gesamtrunde.

Dieser Inhaltsreview ändert keine Draft-, Root-, Ledger- oder Gitdatei.
Er beansprucht weder A/M-Revalidierung noch technische Integration, M7-Abschluss,
menschliche Erprobung oder Hostakzeptanz. Die bereits grundsätzlich gebilligte
Same-ID-Prüfungsrolle und curriculare Mitgliedschaft wurden nicht erneut eröffnet.
