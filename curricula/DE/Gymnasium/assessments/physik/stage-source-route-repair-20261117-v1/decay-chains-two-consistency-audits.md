# Prüfungsaufgabe: Zwei Zerfallsreihen auf Konsistenz prüfen

Eigene SkillPilot-Schulaufgabe; Kandidat für unabhängigen Inhaltsreview, keine amtliche Aufgabe. Noch keine Freigabe oder Live-Aktivierung.

Ziel: `3b50255a-6b01-578b-8f5c-4383536a3221`. Aufgabe: `797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00`.

## Aufgabe

Prüfe zwei vorgegebene Zerfallsreihen. [A,Z] steht für Massenzahl A (Anzahl der Nukleonen) und Kernladungszahl Z (Anzahl der Protonen). Die Zahlen sind eigens gewählte formale Prüfbeispiele, keine Behauptung über die Existenz oder tatsächlichen Zerfallswege dieser Nuklide. Geprüft wird nur die A-/Z-Konsistenz, nicht die energetische Möglichkeit oder Halbwertszeit.

Alle benötigten Regeln: Beim α-Zerfall ändern sich die Kernzahlen um ΔA=−4 und ΔZ=−2; das abgegebene α-Teilchen trägt A=4 und die Ladungszahl +2. Beim β⁻-Zerfall gilt ΔA=0, ΔZ=+1; das Elektron trägt zur A-Bilanz 0 und zur Ladungsbilanz −1 bei, das zusätzlich abgegebene Antineutrino jeweils 0. Bei γ-Abgabe ändern sich A und Z nicht; das Photon trägt jeweils 0 bei. Bei den Bilanzgleichungen ist rechts der Tochterkern samt abgegebenen Teilchen zu berücksichtigen. Für γ ist der vorher angeregte Zustand vorausgesetzt, ohne ihn in [A,Z] gesondert anzugeben.

A: [220,90] —α→ [216,88] —β⁻→ [216,87] —α→ [212,85].
A1 Prüfe JEDEN gedruckten Pfeil zunächst allein mit seinem gedruckten Start- und Endpaar. Gib ΔA und ΔZ an und entscheide mit der jeweiligen Regel, ob dieser einzelne Schritt stimmt.
A2 Berichtige anschließend die GESAMTE Reihe vom unveränderten Anfang [220,90] aus. Behalte die drei Zerfallsarten bei. Erkläre, warum ein für sich regelgerechter gedruckter Pfeil trotzdem einen falschen Endkern der Gesamtfolge liefern kann.
A3 Begründe die Konsistenz deiner berichtigten Folge durch eine A- und eine Ladungsbilanz für jeden der drei Schritte, einschließlich der jeweils abgegebenen Teilchen.

B: [180,72] —β⁻→ [180,73] —α→ [176,72] —β⁻→ [176,73] —γ→ [176,73].
B1 Erstelle unabhängig von A eine vollständige Prüfung aller vier gedruckten Pfeile mit ΔA, ΔZ und Regelentscheidung.
B2 Berichtige die ganze Folge ab [180,72], ohne die vier Zerfallsarten zu ändern. Unterscheide ausdrücklich den ersten lokalen Regelverstoß von seinen Auswirkungen auf spätere Kernzahlen.
B3 Gib für jeden berichtigten Schritt A- und Ladungsbilanz einschließlich der abgegebenen Teilchen an. Erkläre gesondert, warum der γ-Schritt trotz Energieabgabe die hier geprüften beiden Kernzahlen unverändert lässt. Eine Prüfung nur der beiden Endpunkte ersetzt die Prüfung der Zwischenkerne nicht.

## Task

Check two supplied decay chains. [A,Z] denotes mass number A (number of nucleons) and atomic number Z (number of protons). These numbers are original formal checking examples, not claims that these nuclides or decay paths exist. Check A/Z consistency only, not energetic feasibility or half-life.

All required rules: In α decay the nuclear numbers change by ΔA=−4 and ΔZ=−2; the emitted α particle contributes A=4 and charge number +2. In β⁻ decay, ΔA=0 and ΔZ=+1; the electron contributes 0 to the A balance and −1 to the charge balance, and the accompanying antineutrino contributes 0 to both. γ emission leaves A and Z unchanged; the photon contributes 0 to both balances. The right-hand side of each balance includes the daughter nucleus and emitted particles. An initially excited state is assumed for γ emission without being separately displayed in [A,Z].

A: [220,90] —α→ [216,88] —β⁻→ [216,87] —α→ [212,85].
A1 First check EVERY printed arrow locally using its printed starting and ending pair. Give ΔA and ΔZ and use the relevant rule to decide whether that individual step is correct.
A2 Then correct the ENTIRE chain from the unchanged starting pair [220,90]. Keep all three decay types. Explain why a printed arrow that is locally consistent can nevertheless give an incorrect final nucleus in the overall sequence.
A3 Justify your corrected sequence with an A balance and a charge balance for each of its three steps, including emitted particles.

B: [180,72] —β⁻→ [180,73] —α→ [176,72] —β⁻→ [176,73] —γ→ [176,73].
B1 Independently of A, check all four printed arrows, giving ΔA, ΔZ, and a rule-based decision for each.
B2 Correct the entire chain from [180,72] without changing its four decay types. Explicitly distinguish the first local rule violation from its effects on later nuclear numbers.
B3 Give the A and charge balances for every corrected step, including emitted particles. Explain separately why the γ step leaves both nuclear numbers being checked unchanged despite releasing energy. Checking only the two endpoints does not replace checking the intermediate nuclei.

## Lösung und Bewertung

A1: Die gedruckten Änderungen sind (−4,−2), (0,−1), (−4,−2). Nur der zweite Pfeil verletzt seine Regel: β⁻ verlangt +1 statt −1 für Z. A2: Die konsistente Folge lautet [220,90]→[216,88]→[216,89]→[212,87]. Der letzte gedruckte α-Schritt ist gegenüber seinem gedruckten Start lokal richtig; dieser Start wurde jedoch vom falschen β⁻-Ergebnis übernommen. Deshalb ist auch der gedruckte Gesamtendpunkt falsch. A3: Schritt 1: 220=216+4 und 90=88+2. Schritt 2: 216=216+0+0 und 88=89−1+0. Schritt 3: 216=212+4 und 89=87+2. In jeder Bilanz sind Kern und Emissionen enthalten.

B1: Gedruckt ergeben sich (0,+1), (−4,−1), (0,+1), (0,0). Nur der zweite Pfeil verletzt lokal die Regel, denn α erfordert ΔZ=−2. B2: [180,72]→[180,73]→[176,71]→[176,72]→[176,72]. Die gedruckten Schritte 3 und 4 wenden ihre Regeln zwar auf die jeweils gedruckten Ausgangszahlen richtig an, übernehmen aber die beim zweiten Schritt erzeugte falsche Kernladungszahl. B3: Schritt 1: 180=180+0+0; 72=73−1+0. Schritt 2: 180=176+4; 73=71+2. Schritt 3: 176=176+0+0; 71=72−1+0. Schritt 4: 176=176+0; 72=72+0. Beim γ-Schritt wird Energie als Photon abgegeben, aber es verlässt kein Nukleon den Kern und die Protonenzahl ändert sich nicht. Daher bleiben A und Z gleich. A ist eine Nukleonenzahl, keine in kg gemessene Kernmasse; aus unverändertem A folgt keine Aussage über unveränderte Ruheenergie.

Bewertung: 6 Kernleistungen mit je 3 BE; insgesamt 18 BE, Bestehensgrenze 17 BE. Ein Kern erhält 3 BE für eine vollständige fachlich richtige Demonstration. 2 BE sind nur bei vollständig gezeigtem Kern mit einem isolierten nicht konzeptionellen Schreib-, Rechen- oder Rundungsfehler zulässig. Fehlt ein zentraler Teil oder liegt ein konzeptioneller Fehler vor, erhält dieser Kern 0 BE. Damit kann weder ein fehlender Kern noch ein fehlender Fall ausgeglichen werden. Gleichwertige fachlich richtige Begründungen, Darstellungen und Methoden sind zulässig; exakte Wörter der Musterlösung sind nicht verlangt. Beide Fälle brauchen eigenständige Antworten; ein bloßer Verweis auf den anderen Fall ersetzt keine Leistung.

## Solution and grading

A1: The printed changes are (−4,−2), (0,−1), (−4,−2). Only the second arrow violates its rule: β⁻ requires Z to increase by 1 rather than decrease by 1. A2: The consistent chain is [220,90]→[216,88]→[216,89]→[212,87]. The final printed α step is locally correct relative to its printed starting pair, but that starting pair was inherited from the erroneous β⁻ result. Thus the printed overall endpoint is also wrong. A3: Step 1: 220=216+4 and 90=88+2. Step 2: 216=216+0+0 and 88=89−1+0. Step 3: 216=212+4 and 89=87+2. Each balance includes the nucleus and emissions.

B1: The printed changes are (0,+1), (−4,−1), (0,+1), (0,0). Only the second arrow violates its local rule, since α requires ΔZ=−2. B2: [180,72]→[180,73]→[176,71]→[176,72]→[176,72]. Printed steps 3 and 4 correctly apply their rules to their printed starting numbers, but inherit the wrong atomic number produced at step 2. B3: Step 1: 180=180+0+0; 72=73−1+0. Step 2: 180=176+4; 73=71+2. Step 3: 176=176+0+0; 71=72−1+0. Step 4: 176=176+0; 72=72+0. γ emission releases energy as a photon without a nucleon leaving the nucleus or the number of protons changing. Hence A and Z stay unchanged. A counts nucleons; it is not the nuclear mass in kg. Unchanged A does not imply unchanged rest energy.

Grading: 6 core performances worth 3 points each; total 18, passing threshold 17. Award 3 for a complete scientifically correct demonstration. Award 2 only when the core is fully demonstrated with one isolated non-conceptual writing, arithmetic, or rounding slip. A missing central component or a conceptual error earns 0 for that core. Thus neither an absent core nor an absent case can be compensated. Scientifically equivalent explanations, representations, and methods are accepted; the reference solution's exact wording is not required. Both cases require independent answers; merely referring to the other case does not demonstrate a performance.

## Kernleistungen / Core performances

- A-local: A: Jeden gedruckten Pfeil mit beiden Änderungen und korrekter lokaler Regelentscheidung prüfen. / EN: A: Check every printed arrow using both changes and the correct local rule decision.
- A-chain: A: Gesamte Folge korrekt berichtigen und lokalen Fehler von Folgefehlern unterscheiden. / EN: A: Correct the complete chain and distinguish a local error from propagated errors.
- A-balance: A: Alle Schritte durch vollständige A-/Ladungsbilanzen begründen. / EN: A: Justify all steps with complete A/charge balances.
- B-local: B: Jeden gedruckten Pfeil mit beiden Änderungen und korrekter lokaler Regelentscheidung prüfen. / EN: B: Check every printed arrow using both changes and the correct local rule decision.
- B-chain: B: Gesamte Folge korrekt berichtigen und lokalen Fehler von Folgefehlern unterscheiden. / EN: B: Correct the complete chain and distinguish a local error from propagated errors.
- B-balance: B: Alle Schritte durch vollständige A-/Ladungsbilanzen begründen; in B zusätzlich γ richtig deuten. / EN: B: Justify all steps with complete A/charge balances; additionally interpret γ correctly in B.
