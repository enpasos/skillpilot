# B034: unabhängiger Gegencheck der 15 Keep-Profile

Prüfstand einschließlich begrenzter Nachprüfung: 2026-09-06, 06:49 UTC. Prüfrolle: OpenAI/Codex, unabhängiger fachlicher Gegencheck, keine erneute Blind-Beschreibungsrunde und keine Freigabe. Ergebnis am ursprünglichen Autorenkandidaten: **13 PASS, 2 begrenzte Präzisierungsbedarfe**. Die beiden Präzisierungen sind im separaten Gegenreview-Kandidaten behoben und unten als PASS nachgeprüft. Sämtliche nachgerechneten Zahlenwerte sind korrekt. Die ursprüngliche Kandidatendatei blieb unverändert.

## Prüfgegenstand und Grenzen

Vollständig gelesen wurden die 15 ausgewählten positiven Profile einschließlich Erwartungen, Coverage, Variationen, Fällen und DE/EN-Feldern sowie die zugehörigen aktuellen kanonischen DE/EN-Zieltexte. Nicht geprüft wurden die drei Split-Ziele `ea17b0af`, `49872cc0`, `7df923a0` und die zwei Revise-Ziele `d1306bda`, `28f6a324`.

- Kandidaten: `curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-034-next-unresolved-20-v1.candidates.json`, SHA-256 `3f3099ad1d84ed4f40c1e9579be1db3d3363a43f30d0e280ea28aae4dae6f703`.
- Aktuelle Ziele: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`, SHA-256 `4d21330a783dc38687abcaf1dafc768a54af80ae9e949f38c2256c04afb48fb0`.
- Der generische Materializer `app/scripts/materializePositiveGoalEvidenceCandidates.ts`, insbesondere Zeilen 210–243, wurde zur Abgrenzung von AI-Kandidat und Freigabe gelesen. Er erzeugt `status: needs_human_review` und `reviewAuthority: ai_candidate`; dieser Gegencheck verändert beides nicht.

Keine Prüfung oder Freigabe von Bildern, Curriculum-Quellenabdeckung, Runtime, Maturity oder Gesamtabschluss. PASS bedeutet hier: kein konkreter fachlicher, arithmetischer oder DE/EN-Deckungsfehler im geprüften positiven Profil festgestellt. Ein PASS ist kein Human-Review.

## Entscheidungen je Ziel

Die Zeilen verweisen auf den Anfang des jeweiligen Eintrags in der oben genannten Kandidatendatei.

| Ziel-ID | Zeile | Ergebnis | Konkreter Prüfpunkt |
| --- | ---: | --- | --- |
| `f74c691b-0b76-54e0-8fd6-a22211994e0a` | 9 | PASS | A/Z/N, Isotope versus gleiche Massenzahl korrekt; C-12/C-14 und O-16/O-18 stimmen. Keine zusätzliche Zerfalls- oder Elektronenbilanz. |
| `512f81af-1480-56a8-ae52-af3aa1a6a859` | 72 | PASS | Synthetische Messwerte sind so bezeichnet; 0,40 gegenüber 0,00±0,02 widerspricht der Modellvorhersage. Kein alleiniger Postulatbeweis und kein behaupteter alleiniger Einfluss auf Einstein. |
| `455c65ca-814a-56ad-918a-013155883c52` | 137 | PASS | Vektorsystem am selben Ort, Vorzeichen und Richtung korrekt: 200 N/C westwärts; 500 N/C bei 53,13° nördlich von Osten. |
| `af1094c1-511a-5aae-9e0a-3e9196a82d9a` | 200 | CONCERN | AC-Zahlen und Energieerhaltung korrekt. DC-Nebensatz in `step-up-and-dc` braucht explizite Modellgrenze; siehe unten. |
| `58fc7852-722c-5a67-be6a-bfd1be0b527e` | 263 | PASS | Beide Totalreflexionsbedingungen, Lotbezug und Kern/Mantel passen. Gegebene Grenzwinkel erlauben qualitative Entscheidung ohne eingeschobene Snellius-Rechnung; passt zu AB1. |
| `a359c859-eee0-40ef-a9d1-88db2e6c55b2` | 391 | PASS | Photon und Elektron sind beide konkret vertreten. Einzelereignisse und Ensembleverteilungen werden getrennt; keine behaupteten beobachteten Einzelbahnen. |
| `defe44d2-c3d3-456b-a786-fad2cef13fe8` | 454 | PASS | Modellreflexion ist an konkreten Photon-/Elektronbefunden verankert und nicht bloß generische Erkenntnistheorie. Kein Verbot alternativer Interpretationen behauptet. |
| `14ec85b9-68f6-5400-ad43-5e8dddfddf44` | 649 | PASS | Austauschbarer Forschungsfall beschreibt konkrete Physik: Interferometrie, kompakte Doppelobjekte, astronomischer Erkenntnisnutzen und Störungsprüfung. Kein zusätzlicher Auswahlblocker allein wegen des Beispiels; siehe unten. |
| `5c0d5040-92e4-50f6-9695-9d33d889a080` | 714 | CONCERN | Tatsächlicher Optik-/Laufzeittransfer statt bloßer Forschungsfloskeln. Zahlen stimmen, aber ΔL muss im Interferometerfall ausdrücklich differentiell definiert werden. |
| `4888444f-4520-437a-9ba7-e74e8f8ed129` | 779 | PASS | Vorzeichenaddition und Phasendrift richtig; 2 cm, Auslöschung und 0,4 cm korrekt. Schwebung bleibt qualitativ, keine neue quantitative Schwebungsformel verlangt. |
| `d2860d7f-32ff-5d74-b2f8-b7bfc8d75aec` | 907 | PASS | Vakuumbedingung explizit; E=hf, p=E/c=h/λ und alle Zahlen korrekt. Impulsbetrag wird nicht fälschlich an Ruhemasse gebunden; Photonenzahl ist von Einzelphotonenergie getrennt. |
| `cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f` | 970 | PASS | Einphotonenregime, Austrittsarbeit, maximale statt beliebiger kinetischer Energie sowie Intensität/Frequenz sauber unterschieden. Keine angenommene gleiche Quantenausbeute bei Frequenzwechsel. |
| `f75c494c-5723-5cd8-8ec9-dc3d8ec7eca6` | 1033 | PASS | Funktionsidee und offene Fragen sind vom aktuellen Ziel gedeckt. Solarenergieversorgung und separat versorgte Sensorsteuerung richtig getrennt; kein Bandmodellzwang und kein Vakuum-Fotoeffekt als notwendiger Solarzellenmechanismus. |
| `dfa53498-34f5-5326-9d94-87e7b528caf3` | 1161 | PASS | Materiewellen λ=h/p korrekt, p=mv nur nichtrelativistisch; alle Werte stimmen. Größenvergleich erklärt Beobachtbarkeit, behauptet weder λ=0 noch ein Gesetz nur für Elektronen. |
| `2aa2ef4b-8204-59b9-ad53-71c994cd6180` | 1224 | PASS | Photon+Elektron als Erhaltungssystem und anfänglich ruhendes freies/schwach gebundenes Elektron benannt. Linienwerte plausibel; Winkel- und Flussvariation bleiben qualitativ trotz AB3, wie vom Ziel verlangt. |

DE und EN tragen bei allen 15 Profilen denselben fachlichen Umfang. Die zwei unten genannten Unschärfen stehen jeweils in beiden Sprachen; es handelt sich nicht um fehlende Übersetzungen.

## Concern 1: ΔL im Forschungs-Interferometerfall

Ort: `5c0d5040`, Fall `interferometer-scale`, Kandidatenzeilen 758–766. Die Aufgabe gibt `h=ΔL/L` und `Δφ=4πΔL/λ` vor; die Erwartung nennt lediglich eine „Armlängenänderung“ / “arm-length change”. Das lässt offen, ob eine Einzelarmänderung oder die Änderung der Armlängendifferenz gemeint ist. Für die verwendete optische Phasendifferenz ist die differentielle Definition entscheidend. Die LIGO-Kalibrationsdarstellung bindet h an die differentielle Armlängenänderung; reale Resonatoren/Regelungen sind im Kandidaten bereits korrekt als ausgelassen markiert. [LIGO SURF: GW strain calibration, S. 1–2](https://dcc-lho.ligo.org/public/0183/T2200255/001/Shechter_FinalReport_ThirdDraft.pdf).

Minimale vorgeschlagene Ergänzung, jeweils in Aufgabenstellung und Größenzuordnung konsistent:

> DE: L ist die ungestörte Länge jedes Arms; ΔL=δLₓ−δLᵧ bezeichnet die Änderung der Armlängendifferenz, nicht die Änderung nur eines Arms. h ist hier das darauf bezogene differentielle Dehnungssignal. Δφ ist die Änderung der Phasendifferenz der zurückkehrenden Strahlen im einfachen Hin-und-Rückweg-Modell.

> EN: L is the unperturbed length of each arm; ΔL=δLₓ−δLᵧ denotes the change in the arm-length difference, not the change in just one arm. Here h is the corresponding differential strain signal. Δφ is the change in phase difference between the returning beams in the simple round-trip model.

Damit bleiben die gegebenen Beziehungen und Zahlen unverändert: ΔL=4,0·10⁻¹⁸ m; Δφ=4,7242·10⁻¹¹ rad liegt im Intervall [4,3;5,3]·10⁻¹¹ rad. Keine neue Relativitätskompetenz und keine vollständige Instrumentantwort nötig. Der zweite Fall ist korrekt: d/c=10 ms; 7,0±0,2 ms vereinbar, 12,0±0,2 ms unvereinbar, keine eindeutige Quellenidentifikation allein aus Timing.

## Concern 2: DC-Folgerung beim idealen Transformator

Ort: `af1094c1`, Fall `step-up-and-dc`, Kandidatenzeilen 251–258. Die beiden Wechselstromrechnungen sind korrekt: 3 V / 0,20 A / 2,4 W sowie 12 V / 0,30 A / 3,6 W. Ohmsche Last und Effektivwerte sind angegeben.

Der ergänzte DC-Teil bleibt sprachlich im „gleichen idealen Lastmodell“, erklärt dann aber fehlenden dauernden Flusswechsel bei konstanter Spannung. Das ist keine direkte Folgerung aus diesem Idealmodell: Bei vernachlässigtem Wicklungswiderstand gilt U=N·dΦ/dt; konstantes U≠0 lässt Φ zunächst linear wachsen. Reale DC-Dauerbetriebsgrenzen betreffen unter anderem Magnetisierung, Sättigung und Widerstände. Die pauschale Alltagsschlussfolgerung ist nicht das Problem, sondern die vermischte Modellbegründung. [MIT OCW, Magnetics Part 2, S. 2–3](https://ocw.mit.edu/courses/6-622-power-electronics-spring-2023/mit6_622_s23_lec102.pdf).

Minimal ohne zusätzliche Elektrotechnikkompetenz: Den Zusatzfall ausdrücklich auf ein zeitlich unveränderliches Feld oder auf einen vorgegebenen stationären Primärstrom beziehen, etwa:

> DE: Erkläre außerdem am realen Transformator, weshalb ein nach dem Einschaltvorgang konstanter Primärstrom keine dauernde Sekundärspannung induziert.

> EN: Also explain for a real transformer why a primary current that is constant after the switching transient induces no sustained secondary voltage.

Erwartung entsprechend: konstanten Fluss und fehlende induzierte Sekundärspannung aus dem konstanten Primärstrom ableiten; möglichen Einschaltimpuls davon trennen. Die ideale AC-Übersetzungsrechnung nicht als DC-Dauerbetriebsmodell behandeln. Alternativ genügt es, den nicht erforderlichen DC-Zusatzfall wegzulassen; der aktuelle Zielkern bleibt durch beide AC-Fälle abgedeckt.

## Forschungsgebietsauswahl und Freigabestatus

Bei `14ec85b9` und `5c0d5040` ist Gravitationswellenastronomie als vorgeschlagener, austauschbarer Fall erkennbar. Die Beispiele enthalten ausreichende konkrete Physik und müssen nicht als kanonisch verpflichtende Auswahl gelesen werden. Ihre Auswahl ist für sich kein fachlicher Fehler und kein Grund, AI-Kandidaten zurückzuweisen.

Der Satz in `14ec85b9.dissent`, wonach vor Freigabe die Auswahl menschlich bestätigt oder ersetzt werden müsse, sollte nicht als zusätzlicher, aus dem Lernziel abgeleiteter Pflichtschritt fortgeschrieben werden. Die gewöhnlichen Freigabegrenzen des gesamten AI-Kandidaten bleiben unberührt; dieser Gegencheck erfindet keine erfolgte menschliche Bestätigung.

## Unabhängige Zahlenkontrolle

Alle quantitativen Fälle wurden mit direkter JavaScript-Arithmetik gegengerechnet, nicht aus der Kandidatenerwartung als richtig vorausgesetzt. Zusätzlich zu den oben dokumentierten Ergebnissen: 600 nm → 5,00·10¹⁴ Hz, 3,315·10⁻¹⁹ J, 1,105·10⁻²⁷ kg m/s; doppelter Photonenimpuls → 300 nm. Materiewellen: 0,20 nm, 6,63·10⁻¹⁰ m und 6,63·10⁻³² m. Comptonvergleich mit der üblichen Elektronen-Comptonwellenlänge: 0,07171065 nm bei 45° und 0,07342631 nm bei 90°, passend zu den gerundeten synthetischen Linien. Fotoeffektbilanzen: maximal 1,0 eV bzw. 0,5 eV.

## Begrenzte Nachprüfung der zwei korrigierten Profile

Die Hauptinstanz hat separat `curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-034-current-counterreviewed-15-v1.candidates.json` angelegt. Geprüfter SHA-256: `d091a77df97423850145be28b2c0f2a69955fcfeed3ec0655c143d1c475d6f71`.

Nur die beiden zuvor beanstandeten Profile wurden darin erneut inhaltlich gelesen:

- `af1094c1`: **PASS**. Der ideale AC-Lastfall und der reale stationäre Fall sind nun ausdrücklich getrennt. Konstanter Primärstrom und Fluss werden für den zweiten Fall vorgegeben; dΦ/dt=0 ist damit tragfähig. Die Erwartung schließt die falsche Folgerung allein aus konstanter Spannung an einer ideal verlustfreien Wicklung ausdrücklich aus. DE und EN stimmen überein; keine praktische DC-Arbeit und keine zusätzliche Halbleiter-/Sättigungsrechnung gefordert.
- `5c0d5040`: **PASS**. Aufgabe und Erwartung definieren ΔL=δLₓ−δLᵧ als Änderung der Armlängendifferenz, L als gemeinsame ungestörte Länge und h als projizierte differentielle Dehnung. Die Hin-und-Rückweg-Erklärung ordnet den Faktor 2 korrekt zu. Die richtigen Zahlen bleiben erhalten; Modellgrenzen und Austauschbarkeit des Forschungsfalls bleiben erkennbar. DE und EN stimmen überein.

Die anderen 13 Profile wurden nicht erneut fachlich geprüft; ein struktureller JSON-Vergleich bestätigte ihre Gleichheit mit den bereits geprüften Autorenprofilen. Somit sind die **15 Profile des separaten Gegenreview-Kandidaten in diesem begrenzten fachlichen Gegencheck PASS**. Das ist weiterhin keine Human-/Source-/Bildfreigabe, kein Schema- oder Runtime-Gesamtgate und keine Schließung der fünf ausgelassenen Ziele.

Einzige Änderung dieses Gegenchecks ist diese Berichtdatei. Autor-Kandidat, abgeleiteter Kandidat, kanonische Ziele und Register wurden von diesem Gegenprüfer nicht verändert.
