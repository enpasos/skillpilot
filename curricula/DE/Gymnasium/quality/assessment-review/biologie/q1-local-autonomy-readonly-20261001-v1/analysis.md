# Biologie Q1: lokale Prüfungsroute, lesender Befund

Stand 2026-10-01. Grundlage ist der aktuelle kanonische Bio-Kanon, dessen SHA-256 und die **vollständigen 39 Ziel-IDs** in `candidate-packages.json` gebunden sind. Der Kanon wurde für diese Analyse nicht geändert. Kandidaten für neue Aufgaben sind weder Prüfungsfreigaben noch M7-Abschlüsse.

## Tatsächliche Deckung

Q1 enthält 47 `atomic`-Knoten: 44 fachliche Inhaltsziele und drei lokale Prüfungsaufgaben. Der globale Sek-II-Knoten `1cfb2f8b` listet 44 der fachlichen Q1-Ziele in `examData.coveredGoalIds`; für **39** ist er der einzige deklarierte Prüfungsbezug. Sein `taskContent` umfasst nur einen generischen Auftrag ohne konkretes Fallmaterial, Daten oder zielgebundene Lösung, während `coveredGoalIds` 223 Sek-II-Ziele behauptet. Das ist eine strukturelle Route, kein fachlicher Nachweis für die 39.

Die vorhandenen drei Q1-Prüfungen wurden gegen ihre Aufgaben **und** die vollständigen Zielbeschreibungen gelesen:

| Prüfungsziel | Deklarierte Q1-Inhaltsziele | Fachlicher Befund |
| --- | --- | --- |
| `f9637b40` Operonsteuerung | `0daa79f6`, `475eebb4`, `7975e43b` | Transkription/Translation (`475eebb4`) sind tatsächlich abgefragt. Für `0daa79f6` fehlen Nukleotide, Doppelhelix und Replikation; für `7975e43b` fehlt die geforderte epigenetische Genregulation neben dem Operon. Diese zwei Deckungsbehauptungen sind nur teilweise bzw. nicht belegt. |
| `1d0c84df` Insulinproduktion | Nur zwei Q1-**Cluster** `9eb03a1e`, `96bdf495`; kein Q1-Inhaltsatom | cDNA, Restriktions-/Gelbefund und DNA→Protein sind konkret. Für das naheliegende Atom `27b22c33` fehlt jedoch ein Befund zur Herstellung/Prüfung eines wirksamen Arzneiprodukts; auch andere verwandte Methodenatome werden nur teilweise geprüft. Ein bloßes Ergänzen ihrer IDs würde Deckung vortäuschen. |
| `3ac1cbb1` Tumorsuppressor | `475eebb4`, `946ce2e7`, `7f76ff0b` | `475eebb4` und `946ce2e7` sind durch Transkriptionsfaktoren, DNA-Methylierung und Proteinbiosynthese fachlich getragen. Für `7f76ff0b` wird Tumorbildung, aber **keine Metastasierung** geprüft; volle Deckung fehlt. |

Damit sind unter den fünf lokal **deklarierten** Q1-Inhaltszielen nur zwei nach aktuellem Aufgabeninhalt vollständig gestützt. Keines der 39 ausschließlich im generischen Capstone gelisteten Ziele hat derzeit eine vollwertige lokale Prüfung. `CQR-101` kann eine Route strukturell passieren lassen, aber keine tatsächliche fachliche Deckung dieser Aufgaben bestätigen.

## Lokale Kandidatenpakete

Die JSON-Karte ordnet alle 39 Ziele **genau einmal** acht fachlich zusammenhängenden Arbeitspaketen und 14 eng begrenzten Aufgabenkandidaten zu. Dreizehn wären neu, ein vorhandener Insulinfall müsste gezielt erweitert und anschließend neu geprüft werden. Jeder Aufgabenkandidat nennt nur zwei bis vier konkrete Ziel-IDs; es wird kein Q1-Sammel-`coveredGoalIds` vorgeschlagen.

| Paket | Ziele | Aufgabe und prüfbare Materialien |
| --- | ---: | --- |
| P1 Insulin, Bakterien und Plasmide | 4 | Vorhandenen Insulinfall um Produkt-/Funktionsbefund erweitern; eigene Kultur-/Transformationsaufgabe zu Zellbau, Vektorstrategie und Klonierung. |
| P2 DNA-Analytik und Sequenzdaten | 6 | PCR/Restriktion/Gel mit Kontrollen; getrennt NGS-Workflow, Alignment und SNP-Befund mit Qualitätsschwellen. |
| P3 Genregulation und Epigenetik | 7 | Zwei Regulationsmodelle mit Feedback; RNAi im Netzwerk; Histonacetylierung **und** -methylierung mit Chromatinzugänglichkeit. |
| P4 Mutation und Populationsentwicklung | 6 | Vier Mutationstypen, Rekombination und Selektion; getrennt Allelfrequenzen, Hardy-Weinberg, Gründer-/Flaschenhalsereignis und Migration. |
| P5 Familiengenetik und Beratung | 6 | Mehrdeutiger Stammbaum, Gentests und Populationsrisiko; getrennt molekulare/pränatale Diagnostik, multifaktorielle Ursache und ergebnisoffene Beratung. |
| P6 Pränatale und präimplantative Entscheidungen | 2 | PND und PID an **getrennten** Verfahrensmaterialien mit Aussagegrenzen und ethischer Abwägung. |
| P7 Genomeditierung und Gentherapie | 4 | CRISPR-Mechanismus und Zielsequenz, alternative Therapiestrategien, Off-target-Befund und begründete Risiken. |
| P8 Gentechnische Anwendung und öffentliche Entscheidung | 4 | Konkreter veränderter Organismus mit Nutzen-/Risikodaten, Positionen und einem **aktuell belegten** Regelungsauszug. |

Die Pakete sind ein prüfbarer Zuschnitt für die nächste Kandidatenproduktion, keine automatische `coveredGoalIds`-Freigabe. Vor jeder Bindung müssen die tatsächlichen Aufgaben, Lösungserwartungen, Punkte und Fallmaterialien die **ganze** Zielbeschreibung tragen; Ziel- und Jurisdiktionsscope sowie `requires` sind pro lokalem Endpunkt zu prüfen. Der generische globale Capstone kann zusätzliche Prüfung bleiben, seine 223er-Liste ersetzt diese lokalen Nachweise nicht. Separate menschliche Release-Gates und der zentrale Fünf-Gate-Bericht bleiben unberührt; strenger Nettozuwachs dieser lesenden Analyse: **0**.
