# Q3-Stochastik: fachliches Addendum zum offenen Fünferpaket

Stand: 24. September 2026. Dieses Addendum korrigiert nur die Einordnung
bestehender **Kandidaten**; es ändert keine kanonischen Ziele, historischen
Review-Artefakte, QA-Ledger oder die zentrale M7-Registry.

Die beiden unabhängigen aktuellen Beschreibungsrunden wurden erneut mit
`npm run validate:goal-description-review-dual-round` und der Policy
`require_distinct_provider_or_model` gegen die unveränderten Bundle- und
Input-Fingerprints geprüft (Exit 0). Runde A (`gpt-5.6-sol`) und Runde B
(`gpt-6-sol`) sind formal unabhängig. Für alle fünf Ziele verlangt die
Validierung eine Synthese; sie bedeutet keine automatische Freigabe. Die
fünf kanonischen DE/EN-Beschreibungen stimmen weiterhin mit den im
[Kandidatenbericht](candidate-assessment.json) dokumentierten Ausgangstexten
überein. Der Gesamtdigest der Landschaft hat sich seither durch andere
Arbeiten geändert; vor jeder Integration sind die betroffenen Ziel-, Seiten-,
Kontext- und Folge-Gate-Bindungen erneut gezielt zu prüfen.

## `0408ac7f-0530-5de5-b248-cf581c9b5a17`: Binomial-Bedingung

Der [Syntheseentwurf](candidate-synthesis.json) verlangt
„gleichwahrscheinliche Einzelergebnisse“ und nennt das Ergebnis eine
„Laplace-Wahrscheinlichkeit“. Der zugrunde liegende Hessische Q3.1-Quellpunkt
behandelt tatsächlich Laplace-Zählverfahren beim Ziehen mit Zurücklegen.
**Für die Binomialformel selbst** sind aber unabhängige Versuche mit
gleichbleibender *Trefferwahrscheinlichkeit* erforderlich, nicht
gleichwahrscheinliche elementare Ergebnisse. Eine Urne mit mehreren
Trefferfarben kann beispielsweise unterschiedliche Elementarwahrscheinlichkeiten
haben und dennoch ein Binomialmodell für „Treffer/Nichttreffer“ liefern.
Der Entwurf darf diese engere Laplace-Beispielbedingung nicht als allgemeine
Voraussetzung des Binomialmodells darstellen. Runde B formuliert die
Modellbedingung bereits passend. Fachlich zu prüfender, noch **nicht**
integrierter Beschreibungskandidat:

> Die lernende Person kann bei unabhängigen Ziehungen mit Zurücklegen und
> gleichbleibender Trefferwahrscheinlichkeit die Wahrscheinlichkeit für genau
> k Treffer in n Ziehungen mithilfe eines Binomialkoeffizienten sowie der
> Treffer- und Nichttrefferwahrscheinlichkeit berechnen und das Ergebnis im
> Kontext deuten.

Vor Übernahme prüfen, ob die kanonische Titel-/Quellbindung auf den engeren
Laplace-Fall beschränkt bleiben soll; eine Änderung dieser fachlichen Reichweite
ist nicht durch dieses Addendum beschlossen. Nach einer Textänderung müssen
Beschreibung, positive Evidenz, Atomarität, Memory-Entscheidung, Seitenkontext
und spätere Visualisierung zielgenau neu gebunden werden.

## `9de07e13-6a5f-5b49-a6d4-0decefb95784`: tatsächlicher A/B-Befund

Im [Kandidatenbericht](candidate-assessment.json) steht unter
`atomicityCandidate.reason` irrtümlich „Both independent rounds call for
splitting“. Die aktuelle A/B-Validierung weist dagegen eindeutig
**A = `split_review`, B = `keep`** aus; auch die
[Kandidatensynthese](candidate-synthesis.json) behandelt das Ziel zutreffend
als offenen Konflikt. Weder zwei Split-Voten noch eine automatische
Atomicity-Freigabe dürfen daraus abgeleitet werden. Die im Curriculum
gemeinsam aufgeführten unbekannten Größen `n`, `p` und `k` entscheiden die
semantische Atomarität nicht. Hier bleiben fachliche Adjudikation und die
Visualisierung offen; bis dahin kein D-/M7-Abschlussclaim.

## Quickwin-Disposition

`66f432e9-22d3-51a9-8787-35f91db30616` wurde bereits mit unverändertem
Text und bestehendem Bild separat streng integriert; es ist kein neuer Gewinn
dieses Addendums. `70efdec0-110c-5564-849b-bc05cfff0f6a`,
`1b67aeb4-2a55-531f-94da-283b4e3df5f1` und `0408ac7f-0530-5de5-b248-cf581c9b5a17`
haben nur Beschreibungs-/Evidenzkandidaten und noch keine Visualisierung.
`9de07e13-6a5f-5b49-a6d4-0decefb95784` hat zusätzlich den ungelösten
Atomicity-Konflikt. Der strenge Nettozuwachs aus diesem Addendum ist **0**;
keine menschliche Freigabe oder Erprobung wird behauptet.
