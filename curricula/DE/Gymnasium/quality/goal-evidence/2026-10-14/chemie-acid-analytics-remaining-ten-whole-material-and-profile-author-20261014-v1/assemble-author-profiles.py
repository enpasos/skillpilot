# SPDX-License-Identifier: Apache-2.0
"""Assemble author-only raw profiles; never emit approval records or execute cases."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def digest(obj):
    return "sha256:" + hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def dump(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


# Each row supplies understanding DE/EN and the observable performance DE/EN.
# These are positive author expectations, not findings about any actual learner.
SPEC = [
    ("experiment", [
        ("Unter festgelegten pH- und Matrixbedingungen bindet EDTA die erfassten Metallionen im Verhältnis 1:1; Puffer und Metallindikator ermöglichen einen auswertbaren Endpunkt.",
         "Under specified pH and matrix conditions, EDTA binds the measured metal ions in a 1:1 ratio; buffer and metal indicator enable an interpretable endpoint.",
         "Die lernende Person erklärt Komplexbildung, bedingte Stabilität und Indikatorverdrängung und begrenzt den Befund auf die Ca/Mg-Summe.",
         "The learner explains complex formation, conditional stability and indicator displacement, limiting the result to the Ca/Mg sum."),
        ("Eine durchgeführte Titration erfordert beobachtetes sachgerechtes Handeln; eine gelesene Verbrauchstabelle belegt diese Handlung nicht.",
         "Performing a titration requires observed competent handling; reading a titer table does not demonstrate that action.",
         "Sie stellt nach tatsächlicher örtlicher Freigabe Verdünnungen und Aliquote her, bedient die Bürette und dokumentiert pH, Ablesungen und kontrollierten Farbumschlag. Ohne reale Beobachtung bleibt dieser Nachweis offen.",
         "After actual local authorization, the learner prepares dilutions and aliquots, operates the burette and records pH, readings and a controlled colour endpoint. Without real observation this evidence remains absent."),
        ("Blindwert, Aliquot und Verdünnung beziehen den stöchiometrisch ermittelten Metallgehalt auf die ursprüngliche Probe.",
         "Blank, aliquot and dilution relate the stoichiometric metal amount to the original sample.",
         "Sie korrigiert den mittleren Verbrauch, berechnet Stoffmenge und Summenkonzentration mit Einheiten und begründet den Rückrechnungsfaktor bei der verdünnten Probe.",
         "The learner corrects the mean titer, calculates amount and total concentration with units and explains the dilution factor back to the original sample."),
        ("Wiederholbarkeit, Wiederfindung und Selektivität beantworten verschiedene Fragen; eine gute Wiederfindung trennt Ca und Mg nicht.",
         "Repeatability, recovery and selectivity answer different questions; good recovery does not separate Ca from Mg.",
         "Sie berechnet die Referenz- beziehungsweise Aufstockwiederfindung, prüft die vorgegebene Toleranz und widerlegt eine unzulässige Einzelmetall- oder universelle Matrixaussage.",
         "The learner calculates reference or spike recovery, checks the supplied tolerance and refutes an unsupported individual-metal or universal matrix claim."),
    ], [
        ("sample-preparation", "Direkte Probe mit einer unabhängig hergestellten Verdünnung und einer Aufstockkontrolle vergleichen.", "Compare a direct sample with an independently prepared dilution and spike control."),
        ("observation-and-log", "Tatsächlich beobachtete Handhabung von der getrennten Auswertung synthetischer Protokolle unterscheiden.", "Distinguish observed handling from separate evaluation of synthetic logs."),
        ("quality-and-selectivity", "Von enger Verbrauchsstreuung zur Prüfung von Richtigkeit und begrenzter Ca/Mg-Selektivität wechseln.", "Move from narrow titer scatter to checking trueness and limited Ca/Mg selectivity."),
    ], [
        ("Den Ca/Mg-Gesamtgehalt aus Blindwert und Referenzkontrolle bestimmen; Titrationshandhabung getrennt tatsächlich beobachten.", "Determine total Ca/Mg using a blank and reference control; observe titration handling separately.", "Referenzkontrolle und Stöchiometrie begrenzen die Aussage; die Tabelle ersetzt keine Durchführung.", "Reference control and stoichiometry bound the claim; the table does not replace performance."),
        ("Eine vierfach verdünnte Probe und eine Metallaufstockung auswerten; ursprüngliche Aliquotmenge und praktische Verdünnung beachten.", "Evaluate a fourfold dilution and metal spike, retaining the original aliquot amount and practical dilution requirement.", "Ein zusätzlicher Stoffmengenbeitrag ist vom Rückrechnungsfaktor zu unterscheiden; gute Wiederfindung identifiziert keine Einzelmetalle.", "Distinguish the added amount from the back-calculation factor; good recovery does not identify individual metals."),
    ]),
    ("experiment", [
        ("Ein Absorptionsmaximum wird unter kontrollierten Messbedingungen aus einem Spektrum ermittelt; Leerprobe und gleiche Schichtdicke ermöglichen den Vergleich.",
         "An absorption maximum is determined from a spectrum under controlled conditions; a blank and equal optical path length enable comparison.",
         "Die lernende Person misst nach örtlicher Freigabe den vorgesehenen Scan und die Leerprobe, protokolliert die Bedienung und benennt das Maximum unter den gemessenen Wellenlängen samt Auflösungsgrenze.",
         "After local authorization, the learner measures the specified scan and blank, records instrument use and identifies the maximum among measured wavelengths with its resolution limit."),
        ("Eine Kalibriergerade ist ein empirisch geprüfter Zusammenhang in einem begrenzten Bereich; ein abweichender Standard darf nicht unbemerkt als linear behandelt werden.",
         "A calibration line is an empirically checked relationship over a limited range; a deviating standard cannot silently be treated as linear.",
         "Sie stellt Standards her und misst sie unter tatsächlich beobachteter Bedienung; sie bestimmt Steigung, Achsenabschnitt und gültigen Bereich und begründet die Behandlung des nichtlinearen oberen Standards.",
         "The learner prepares and measures standards under actual observation, determines slope, intercept and valid range, and justifies treatment of the nonlinear upper standard."),
        ("Der Probengehalt folgt aus der gültigen Kalibrierung und dem Verdünnungsfaktor; eine rechnerisch mögliche Interpolation ist noch keine bestätigte Richtigkeit.",
         "Sample concentration follows from valid calibration and dilution; mathematically valid interpolation is not yet confirmed trueness.",
         "Sie berechnet aus dem mittleren Absorptionswert den verdünnten und ursprünglichen Gehalt und kennzeichnet ein Ergebnis bei fehlgeschlagener Kontrolle als vorläufig.",
         "The learner calculates diluted and original concentrations from mean absorbance and labels a result provisional when its control fails."),
        ("Enge Wiederholstreuung belegt Wiederholbarkeit; eine unabhängige Kontrolle prüft die Richtigkeit unter den angegebenen Bedingungen.",
         "Narrow replicate scatter indicates repeatability; an independent control checks trueness under stated conditions.",
         "Sie berechnet die relative Referenzabweichung, trennt sie von der Streuung und entscheidet begründet zwischen Freigabe im Modell und Zurückhalten des Ergebnisses.",
         "The learner calculates relative reference deviation, distinguishes it from scatter and justifies accepting the model result or withholding it."),
    ], [
        ("calibration-validity", "Eine lineare Standardreihe mit einer Reihe mit oberer Abweichung vergleichen; den gültigen Bereich begründen.", "Compare a linear standard series with one showing upper-range deviation and justify the valid range."),
        ("precision-versus-trueness", "Ähnlich kleine Wiederholstreuung bei bestandener und fehlgeschlagener Referenzkontrolle beurteilen.", "Judge similarly small replicate scatter with passing and failing reference controls."),
        ("measurement-versus-data", "Eigenen Scan und Standardherstellung beobachten; synthetische Daten ausschließlich als Auswertungsmaterial nutzen.", "Observe the learner's scan and standard preparation; use synthetic data solely as evaluation material."),
    ], [
        ("Scan, lineare Standards und eine fünffach verdünnte Probe mit unabhängiger Kontrolle auswerten; eigene Messung getrennt beobachten.", "Evaluate a scan, linear standards and a fivefold diluted sample with an independent control; observe actual measurement separately.", "Das gemessene Maximum, die lineare Interpolation und die Referenzprüfung müssen zusammenpassen.", "The sampled maximum, linear interpolation and reference check must agree."),
        ("Eine obere Kalibrierabweichung und eine trotz kleiner Streuung um 10 % abweichende Kontrolle beurteilen.", "Judge upper-range calibration deviation and a control biased by 10% despite narrow scatter.", "Ein plausibler Rechenwert darf bei fehlgeschlagener Richtigkeitskontrolle nicht als bestätigter Gehalt ausgegeben werden.", "A plausible calculation must not be reported as confirmed concentration after a failed trueness check."),
    ]),
    ("modeling", [
        ("Mehrprotonige Systeme besitzen aufeinanderfolgende korrespondierende Paare; Ladung, Teilchenform und pH bestimmen die relevante Stufe.",
         "Polyprotic systems contain successive conjugate pairs; charge, species form and pH determine the relevant stage.",
         "Die lernende Person formuliert die drei Phosphatstufen und ordnet H₂G⁺, HG und G⁻ den beiden Glycinstufen korrekt zu.",
         "The learner writes the three phosphate stages and correctly assigns H₂G⁺, HG and G⁻ to the two glycine stages."),
        ("Quantitative pH-Aussagen benötigen die passende Stoffmengenbilanz und eine begründete Gleichgewichtsnäherung.",
         "Quantitative pH claims require the appropriate amount balance and a justified equilibrium approximation.",
         "Sie berechnet den Phosphat-pH vor und nach Säurezugabe sowie Glycin-Halbstufen und Äquivalenzbereiche; sie verwendet die gegebene quadratische Korrektur, wo die formale Halbmenge nicht pH=pKₐ erlaubt.",
         "The learner calculates phosphate pH before and after acid addition and glycine half-stages and equivalence regions, using the supplied quadratic correction where formal half amounts do not justify pH=pKₐ."),
        ("Eine dominante Ampholytform ist nicht automatisch ein wirksamer Puffer; Pufferbereiche liegen bei geeigneten Mengen beider Nachbarpartner.",
         "A dominant ampholyte is not automatically an effective buffer; buffer regions require suitable amounts of both neighbouring partners.",
         "Sie beurteilt die Phosphat- und Glycinbereiche aus Nachbarstufen, Partneranteilen und pKₐ-Abständen und erklärt die schwache Pufferung im Glycin-Ampholytbereich.",
         "The learner judges phosphate and glycine regions from adjacent stages, partner fractions and pKₐ separation, explaining weak buffering in the glycine ampholyte region."),
        ("Beim Wechsel des pH-Bereichs oder bei erheblicher Dissoziation muss das Modell erneut geprüft werden.",
         "Changing pH region or substantial dissociation requires reassessing the model.",
         "Sie wechselt bei pH 2.15 zum ersten Phosphatpaar und erklärt mit h/c*≈0.108, warum formale Glycin-Halbmengen keine gleichen tatsächlichen Konzentrationen garantieren.",
         "The learner switches to the first phosphate pair at pH 2.15 and uses h/c*≈0.108 to explain why formal glycine half amounts do not guarantee equal actual concentrations."),
    ], [
        ("stage-selection", "Vom mittleren Phosphatpaar zur ersten Stufe und zu einem zweistufigen Ampholyten wechseln.", "Move from the middle phosphate pair to the first stage and a two-stage ampholyte."),
        ("approximation-check", "Eine gut getrennte Pufferstufe mit einer formalen Halbtitration mit relevanter Dissoziationskorrektur vergleichen.", "Compare a well-separated buffer stage with a formal half-titration requiring a significant dissociation correction."),
        ("dominance-and-buffering", "Dominante Spezies und nutzbaren Pufferbereich getrennt begründen.", "Explain dominant species and useful buffering regions separately."),
    ], [
        ("Die drei Phosphatstufen angeben, das mittlere Paar berechnen und den Wechsel zu pH 2.15 beurteilen.", "State the three phosphate stages, calculate the middle pair and judge a change to pH 2.15.", "Die jeweils relevante Stufe muss aus dem chemischen Bereich folgen; alte Stoffmengen dürfen nicht unbesehen übertragen werden.", "The relevant stage follows from the chemical region; old amounts cannot simply be carried over."),
        ("Eine zweiprotonige Glycin-Titration einschließlich der gegebenen Korrektur an der ersten Halbmenge erklären.", "Explain a diprotic glycine titration including the supplied first-half amount correction.", "Formale Zugabemengen, tatsächliche Spezies und Pufferwirkung sind verschiedene Größen.", "Formal added amounts, actual species and buffering effectiveness are distinct."),
    ]),
    ("modeling", [
        ("Ein Puffer nimmt begrenzte Säure- und Basemengen durch ein korrespondierendes Paar auf; die Partner werden dabei umgesetzt.",
         "A buffer takes up limited acid and base through a conjugate pair whose partners are consumed in the process.",
         "Die lernende Person formuliert die beiden Aufnahmereaktionen und verbindet sie mit der benötigten pH-Nähe und endlichen Reserve.",
         "The learner writes the two uptake reactions, relating them to the required pH region and finite reserve."),
        ("Ein passender pKₐ ist notwendig für eine begründete Auswahl, ersetzt aber keine Prüfung der chemischen Verträglichkeit.",
         "An appropriate pKₐ supports selection but does not replace a chemical compatibility check.",
         "Sie vergleicht die gegebenen Kandidaten und schließt Phosphat bei der ausdrücklich angegebenen Calciumfällung oder Analytbindung aus; bei fehlendem geeigneten Kandidaten benennt sie die Datenlücke.",
         "The learner compares the supplied candidates, excludes phosphate where calcium precipitation or analyte loss is stated and identifies the data gap when no suitable candidate is available."),
        ("Die Reichweite einer Quelle hängt von Herkunft, Bedingungen und untersuchtem System ab.",
         "A source's reach depends on provenance, conditions and the system investigated.",
         "Sie vergleicht die vollständig gegebenen fiktiven Quellen nach Bedingungen, Wiederholungen, Kontrollmessungen und Interessenkonflikten und begrenzt Laborbefunde auf den tatsächlich untersuchten Bereich.",
         "The learner compares the fully supplied fictional sources by conditions, replicates, control measurements and interests, limiting laboratory findings to the investigated scope."),
        ("Mehr Pufferstoff löst weder jede chemische Unverträglichkeit noch begründet ein Laborbefund automatisch medizinische oder ökologische Eignung.",
         "More buffer does not resolve every chemical incompatibility, and a laboratory finding does not automatically establish medical or ecological suitability.",
         "Sie widerlegt die behauptete Lösung durch Verdoppeln der Phosphatmenge beziehungsweise die Übertragung von 100-mL-Proben auf ein offenes Gewässer und nennt fehlende Prüfungen.",
         "The learner refutes doubling phosphate as a universal remedy and extrapolating 100 mL vials to open water, stating the missing checks."),
    ], [
        ("application-constraints", "Forschungsassay, calciumhaltigen Technikprozess und Umweltprobe unter verschiedenen Verträglichkeitsbedingungen vergleichen.", "Compare a research assay, calcium-containing technical process and environmental sample under different compatibility constraints."),
        ("source-scope", "Unabhängigen begrenzten Prüfbericht und ungestützte Anbieterbehauptung anhand der gegebenen vollständigen Texte vergleichen.", "Compare a bounded independent report and unsupported vendor claim using the full supplied texts."),
        ("scale-and-claim", "Von einer Laborentscheidung zur Frage einer medizinischen oder ökologischen Übertragung wechseln, ohne diese zu behaupten.", "Move from a laboratory decision to considering medical or ecological extrapolation without asserting it."),
    ], [
        ("Für einen Forschungsassay und einen Calciumprozess einen Puffer wählen und eine medizinische Werbeaussage prüfen.", "Select a buffer for a research assay and calcium process and assess a medical marketing claim.", "pH-Passung und chemische Verträglichkeit sind gemeinsam nötig; eine nicht belegte Alternative bleibt offen.", "pH suitability and chemical compatibility are jointly required; an unsupported alternative remains unresolved."),
        ("Pufferkandidaten und zwei Quellentexte für eine kleine Umweltprobe vergleichen; die Übertragung auf ein Gewässer prüfen.", "Compare buffer candidates and two sources for a small environmental sample and assess extrapolation to open water.", "Geringe Wiederholstreuung in kleinen Gefäßen belegt keine Repräsentativität oder Umweltverträglichkeit.", "Low replicate scatter in small vessels does not establish representativeness or ecological compatibility."),
    ]),
    ("data", [
        ("Äquivalenzpunkt, Halbäquivalenzpunkt und Indikatorendpunkt haben unterschiedliche Bedeutungen; die Kurvenform enthält Informationen zur Säurestärke.",
         "Equivalence point, half-equivalence point and indicator endpoint have different meanings; curve shape provides evidence about acid strength.",
         "Die lernende Person ordnet die vorgelegten Kurven einer starken beziehungsweise schwachen Säure zu und begründet die charakteristischen Bereiche und den Äquivalenzverbrauch.",
         "The learner assigns the supplied curves to strong and weak acids, explaining their characteristic regions and equivalence volume."),
        ("Anfang, Halbmenge, Äquivalenz und Überschuss verlangen jeweils ein passendes Stoffmengen- und Gleichgewichtsmodell.",
         "Initial solution, half amount, equivalence and excess each require an appropriate amount and equilibrium model.",
         "Sie berechnet die vier gegebenen Kurvenpunkte mit Verdünnung und Einheiten und begründet die Näherungen für schwache Säure und hydrolysierendes Salz.",
         "The learner calculates the four supplied curve points with dilution and units, justifying the weak-acid and hydrolysing-salt approximations."),
        ("Ein Indikator muss zum steilen Kurvenbereich und zur geforderten Endpunkttoleranz passen; der neutrale pH ist temperaturabhängig.",
         "An indicator must fit the steep curve region and required endpoint tolerance; neutral pH depends on temperature.",
         "Sie vergleicht die gegebenen Umschlagsbereiche, begründet BTB beziehungsweise Phenolphthalein als geeignete Kandidaten und trennt qualitative Eignung von einem nicht berechneten Volumenfehler.",
         "The learner compares supplied transition ranges, justifies BTB or phenolphthalein as candidates and separates qualitative suitability from an uncalculated volume error."),
        ("Gleiche Ausgangsstoffmenge kann trotz verschiedener Säurestärke den gleichen Äquivalenzverbrauch ergeben; pH 7 ist keine allgemeine Definition von Äquivalenz.",
         "Equal initial amounts can give equal equivalence volumes despite different acid strengths; pH 7 does not generally define equivalence.",
         "Sie erklärt gemeinsame und verschiedene Kurvenbereiche gleich konzentrierter starker und schwacher Säuren und berechnet bei pKᵥ=13.20 den neutralen pH 6.60.",
         "The learner explains shared and different regions for equally concentrated strong and weak acids and calculates neutral pH 6.60 at pKᵥ=13.20."),
    ], [
        ("acid-strength", "Bei gleicher Stoffmenge von starker zu schwacher Säure wechseln und die veränderten Gleichgewichte begründen.", "Change from strong to weak acid at equal amount and explain the altered equilibria."),
        ("curve-region", "Dasselbe Reagenzsystem vor, bei und nach Äquivalenz mit unterschiedlichen Bilanzmodellen behandeln.", "Use different balance models for the same reagent system before, at and after equivalence."),
        ("temperature-and-indicator", "Neutralität bei verändertem pKᵥ und die begrenzte Aussage eines Indikatorbereichs prüfen.", "Check neutrality at changed pKᵥ and the limited information supplied by an indicator range."),
    ], [
        ("Eine starke Säure mit NaOH titrieren, vier Punkte berechnen und Neutralität bei geändertem pKᵥ prüfen.", "Evaluate a strong acid titrated with NaOH, calculate four points and test neutrality at changed pKᵥ.", "Stöchiometrie bestimmt die Äquivalenz; Wasser bestimmt im idealen Fall den temperaturabhängigen neutralen pH.", "Stoichiometry determines equivalence; water determines temperature-dependent neutral pH in the ideal case."),
        ("Eine schwache Säure mit derselben Ausgangsstoffmenge auswerten und einen passenden Indikator begründen.", "Evaluate a weak acid with the same initial amount and justify an appropriate indicator.", "Pufferbereich und Salzhydrolyse ändern den pH, aber nicht die für vollständige Neutralisation nötige Stoffmenge.", "The buffer region and salt hydrolysis alter pH but not the amount required for complete neutralisation."),
    ]),
    ("modeling", [
        ("Die Henderson-Hasselbalch-Gleichung verbindet im geeigneten Modell den pH mit pKₐ und dem Verhältnis des korrespondierenden Paares.",
         "In an appropriate model, the Henderson–Hasselbalch equation relates pH to pKₐ and the conjugate-pair ratio.",
         "Die lernende Person ordnet Säure und Base zu, bildet den Quotienten in der richtigen Richtung und berechnet den Ausgangs-pH beider gegebenen Systeme.",
         "The learner identifies acid and base, forms the ratio in the correct direction and calculates initial pH for both supplied systems."),
        ("Eine starke Säure- oder Basezugabe verändert zuerst die Partnerstoffmengen; erst danach wird das Gleichgewichtsmodell angewendet.",
         "Added strong acid or base first changes the partner amounts; only then is the equilibrium model applied.",
         "Sie bilanziert HCl beziehungsweise OH⁻ mit dem passenden Partner und berechnet den neuen pH aus den positiven Restmengen.",
         "The learner balances HCl or OH⁻ against its reacting partner and calculates the new pH from positive remaining amounts."),
        ("Konstantes Partnerverhältnis bedeutet im idealen Modell gleichen pH, aber nicht gleiche Pufferreserve je Liter; vollständiger Partnerverbrauch beendet die einfache Pufferrechnung.",
         "A constant partner ratio implies equal pH in the ideal model but not equal reserve per litre; complete consumption of a partner ends the simple buffer calculation.",
         "Sie erklärt die zehnfache Verdünnung und erkennt bei 60 mmol OH⁻ den erschöpften NH₄⁺-Vorrat, statt einen Logarithmus negativer Mengen zu verwenden.",
         "The learner explains tenfold dilution and recognises exhausted NH₄⁺ after 60 mmol OH⁻ rather than taking a logarithm of negative amounts."),
        ("Verdünnung, freie starke Säure und Stoffaustausch dürfen nicht durch ein unverändert übernommenes Verhältnis verwechselt werden.",
         "Dilution, free strong acid and matter exchange cannot be handled by blindly retaining the original ratio.",
         "Sie widerlegt eine pH-Abnahme um genau eins bei idealer Pufferverdünnung und begründet, warum unbekannter NH₃-Verlust eine neue Mengenbilanz verlangt.",
         "The learner refutes an exact one-unit pH fall on ideal buffer dilution and explains why unknown NH₃ loss requires a new amount balance."),
    ], [
        ("acid-versus-base-dose", "Vom Acetatpuffer mit Säurelast zum Ammoniumpuffer mit Baselast wechseln und den jeweils verbrauchten Partner bestimmen.", "Change from acetate under acid load to ammonium under base load, identifying the consumed partner."),
        ("ratio-and-reserve", "Gleiches Verhältnis nach Verdünnung mit veränderter Reserve und mit erschöpftem Partner vergleichen.", "Compare an unchanged dilution ratio with altered reserve and an exhausted partner."),
        ("closed-to-open", "Die geschlossene Mengenbilanz mit unbekanntem NH₃-Verlust konfrontieren, ohne ungestützte Zahlen zu erzeugen.", "Challenge the closed amount balance with unknown NH₃ loss without inventing numerical results."),
    ], [
        ("Acetatpuffer vor und nach HCl berechnen und die zehnfache Verdünnung prüfen.", "Calculate acetate buffer pH before and after HCl and assess tenfold dilution.", "Reaktion kommt vor Logarithmus; pH-Verhältnis und Reserve sind getrennt zu beurteilen.", "Reaction precedes the logarithm; assess the pH ratio and reserve separately."),
        ("NH₄⁺/NH₃ mit kleiner und übergroßer OH⁻-Last sowie mit unbekanntem NH₃-Verlust beurteilen.", "Assess NH₄⁺/NH₃ under small and excessive OH⁻ loads and unknown NH₃ loss.", "Partnererschöpfung und Stoffaustausch verlangen ein anderes oder ergänztes Modell.", "Partner exhaustion and matter exchange require a different or augmented model."),
    ]),
    ("concept", [
        ("Ein nach der definierten Zugabe geschlossenes Phosphatpuffersystem tauscht keine Stoffe mit seiner Umgebung aus; seine Partner bleiben ineinander umwandelbar.",
         "A phosphate buffer closed after the defined addition exchanges no matter with its surroundings; its partners can still interconvert.",
         "Die lernende Person benennt H₂PO₄⁻/HPO₄²⁻ und grenzt fehlenden Stoffaustausch von fortbestehender Gleichgewichtsreaktion ab.",
         "The learner names H₂PO₄⁻/HPO₄²⁻ and distinguishes absent matter exchange from continuing equilibrium reaction."),
        ("Säure- und Baseaufnahme folgen entgegengesetzten Umsetzungen des korrespondierenden Paares.",
         "Acid and base uptake follow opposite reactions of the conjugate pair.",
         "Sie formuliert beide ausgeglichenen Aufnahmereaktionen und erläutert die Verschiebung nach Le Chatelier mit den verbrauchten und gebildeten Partnern.",
         "The learner writes both balanced uptake reactions and explains the Le Chatelier shift using consumed and formed partners."),
        ("Pufferung vermindert die pH-Änderung innerhalb endlicher Stoffmengengrenzen; sie hält den pH nicht exakt konstant.",
         "Buffering reduces pH change within finite amount limits; it does not hold pH exactly constant.",
         "Sie verfolgt die Mengenänderungen bei kleinen Säure-/Baselasten und begründet pH-Richtung sowie das Ende der betrachteten Paarreserve.",
         "The learner tracks amounts under small acid/base loads, explaining pH direction and the end of the specified pair's reserve."),
        ("Gleicher Anfangsquotient kann mit verschiedenen Reserven einhergehen; formaler Paarverbrauch beweist nicht, dass jeder darüber hinausgehende Basenanteil frei bleibt.",
         "Equal initial ratios can coexist with different reserves; formal pair exhaustion does not prove every further base amount remains free.",
         "Sie erklärt die kleinere Quotientenänderung bei doppelter Ausgangsmenge und benennt bei erschöpftem H₂PO₄⁻ mögliche weitere Phosphat-/Wassergleichgewichte statt ungestützt freien OH⁻-Überschuss zu behaupten.",
         "The learner explains the smaller ratio change at doubled starting amounts and identifies possible further phosphate/water equilibria after H₂PO₄⁻ exhaustion rather than claiming unsupported free OH⁻ excess."),
    ], [
        ("acid-and-base", "Säure- und Baseimpuls getrennt auf denselben geschlossenen Puffer anwenden.", "Apply separate acid and base pulses to the same closed buffer."),
        ("ratio-and-amount", "Ein symmetrisches Paar mit einem unsymmetrischen Paar und mit doppelter Gesamtmenge vergleichen.", "Compare a symmetric pair with an asymmetric pair and doubled total amounts."),
        ("pair-boundary", "Vom noch wirksamen betrachteten Paar zur erschöpften Teilreserve wechseln, ohne weitere Stufen zu unterschlagen.", "Move from an active specified pair to exhaustion of its partial reserve without ignoring further stages."),
    ], [
        ("Einen symmetrischen Phosphatpuffer unter getrennten Säure-/Baseimpulsen erklären und die Menge verdoppeln.", "Explain a symmetric phosphate buffer under separate acid/base pulses and double its amount.", "Le Chatelier erklärt die Reaktion; der Quotient verändert sich trotz Pufferwirkung.", "Le Chatelier explains reaction; the ratio changes despite buffering."),
        ("Einen basenreichen Phosphatpuffer mit Säure und Base belasten und die Grenze der H₂PO₄⁻-Reserve beurteilen.", "Apply acid and base to a base-rich phosphate buffer and assess the H₂PO₄⁻ reserve limit.", "Die Grenze eines Paares ist von einer vollständigen Rechnung aller Phosphatstufen zu unterscheiden.", "Distinguish a single pair's limit from a full calculation of every phosphate stage."),
    ]),
    ("representation", [
        ("Titrationskurven unterscheiden starke und schwache Säuren beziehungsweise Basen durch Verlauf, Pufferbereich und Lage des Äquivalenz-pH.",
         "Titration curves distinguish strong and weak acids or bases by progression, buffer region and equivalence pH.",
         "Die lernende Person ordnet alle vier vorgelegten Kurvenklassen zu und begründet aufsteigende beziehungsweise fallende Verläufe.",
         "The learner assigns all four supplied curve classes, explaining rising and falling progression."),
        ("Am Halbäquivalenzpunkt einer hinreichend geeigneten schwachen Protolyse liefert der pH den pKₐ des relevanten Säurepartners.",
         "At half-equivalence for a suitably weak protolysis, pH yields the pKₐ of the relevant acid partner.",
         "Sie liest pKₐ(HA)=4.76 beziehungsweise pKₐ(BH⁺)=9.25 ab, berechnet pKᵦ=4.75 bei pKᵥ=14 und vermeidet eine eindeutige Stoffidentifikation allein aus diesen Werten.",
         "The learner reads pKₐ(HA)=4.76 or pKₐ(BH⁺)=9.25, calculates pKᵦ=4.75 at pKᵥ=14 and avoids identifying a unique substance from these values alone."),
        ("Gleicher Äquivalenzverbrauch belegt bei gleicher Stöchiometrie gleiche Stoffmenge, während Salzprotolyse und Indikatorlage von der Art der schwachen Komponente abhängen.",
         "Equal equivalence volume indicates equal amount at equal stoichiometry, while salt protolysis and indicator placement depend on the weak component.",
         "Sie begründet den gemeinsamen Äquivalenzverbrauch und die jeweiligen Indikatorkandidaten, ohne aus wenigen Punkten einen exakten Endpunktfehler zu erfinden.",
         "The learner explains equal equivalence volumes and appropriate indicator candidates without inventing an exact endpoint error from sparse points."),
        ("Eine schwache Säure erzeugt bei Neutralisation eine basische korrespondierende Base; eine schwache Base erzeugt eine saure korrespondierende Säure.",
         "Neutralising a weak acid produces a basic conjugate base; neutralising a weak base produces an acidic conjugate acid.",
         "Sie erklärt die gegensinnigen Äquivalenz-pH-Werte aus den Salzreaktionen und widerlegt, dass ein starker Titrant jeden Äquivalenzpunkt neutral mache.",
         "The learner explains opposite equivalence pH shifts from salt reactions and refutes the claim that a strong titrant makes every equivalence point neutral."),
    ], [
        ("acid-to-base", "Aufsteigende Säurekurven und fallende Basekurven mit identischer Stoffmenge vergleichen.", "Compare rising acid curves and falling base curves at equal amount."),
        ("strength-and-amount", "Bei gleichem Äquivalenzvolumen starke und schwache Ausgangsstoffe unterscheiden.", "Distinguish strong and weak starting substances at equal equivalence volume."),
        ("interpretation-limits", "Aus Kurven pK-Werte und Indikatorkandidaten begründen, aber eindeutige Identität und exakte Fehlergröße offenlassen.", "Use curves to justify pK values and indicator candidates while leaving unique identity and exact error unresolved."),
    ], [
        ("Zwei Säurekurven gleicher Ausgangsstoffmenge vergleichen und Puffer-, Äquivalenz- und Indikatorbereiche erklären.", "Compare two acid curves at equal initial amount and explain buffer, equivalence and indicator regions.", "Kurvenform beschreibt Stärke und Gleichgewichte; gleicher Verbrauch beschreibt die stöchiometrische Menge.", "Curve shape describes strength and equilibria; equal volume describes stoichiometric amount."),
        ("Zwei Basenkurven vergleichen und den sauren Äquivalenzpunkt auf die korrespondierende Säure beziehen.", "Compare two base curves and relate acidic equivalence to the conjugate acid.", "Der Wechsel von schwacher Säure zu schwacher Base kehrt die Salzprotolyse um.", "Changing from weak acid to weak base reverses salt protolysis."),
    ]),
    ("concept", [
        ("Ein offenes Puffersystem tauscht benannte Stoffe über eine Systemgrenze aus; die Wirkung hängt vom Austauschweg ab.",
         "An open buffer exchanges specified matter across a system boundary; its effect depends on the exchange pathway.",
         "Die lernende Person kennzeichnet CO₂-Abgabe beziehungsweise -Aufnahme und NH₃-Verlust beziehungsweise -Nachschub und benennt die jeweiligen korrespondierenden Paare.",
         "The learner marks CO₂ removal or uptake and NH₃ loss or resupply, identifying the respective conjugate pairs."),
        ("Protolyse und Stoffaustausch sind gekoppelt: Entfernung oder Nachlieferung eines Partners kann die Reaktion beeinflussen.",
         "Protolysis and matter exchange are coupled: removal or resupply of a partner can influence reaction.",
         "Sie formuliert Säure-/Baseaufnahme von Hydrogencarbonat und Ammoniak/Ammonium und verbindet CO₂-Abfuhr beziehungsweise NH₃-Nachschub mit der möglichen Säureaufnahme.",
         "The learner writes acid/base uptake for bicarbonate and ammonia/ammonium, relating CO₂ removal or NH₃ resupply to possible acid uptake."),
        ("Offenheit allein garantiert weder stabileren pH noch unendliche Kapazität; Stoffmengen, Transportrichtung und Fluss begrenzen die Wirkung.",
         "Openness alone guarantees neither more stable pH nor infinite capacity; amounts, transport direction and flow limit the effect.",
         "Sie vergleicht geschlossene und offene Szenarien qualitativ, erklärt die pH-Senkung bei NH₃-Verlust und benennt ohne Flussdaten die Grenze einer quantitativen Aussage.",
         "The learner compares closed and open scenarios qualitatively, explains pH reduction on NH₃ loss and states why unspecified flows prevent a quantitative claim."),
        ("Umgekehrter Stofffluss oder ein verbleibendes Reaktionsprodukt kann eine vermeintliche Pufferverbesserung aufheben.",
         "Reversed matter flow or a retained reaction product can undermine an apparent buffering improvement.",
         "Sie erklärt die Säurewirkung von CO₂-Eintrag sowie die NH₄⁺-Anreicherung trotz NH₃-Nachschub und widerlegt eine beliebig konstante pH-Zahl oder klinische Schlussfolgerung.",
         "The learner explains the acid contribution from CO₂ uptake and NH₄⁺ accumulation despite NH₃ resupply, refuting arbitrary constant pH or clinical inferences."),
    ], [
        ("exchange-direction", "CO₂-Abgabe mit CO₂-Eintrag und NH₃-Verlust mit NH₃-Nachschub vergleichen.", "Compare CO₂ removal with uptake and NH₃ loss with resupply."),
        ("system-boundary", "Geschlossene und offene Gefäße anhand tatsächlich benannter Stoffwege unterscheiden.", "Distinguish closed and open vessels using explicitly named matter pathways."),
        ("finite-dynamic-reserve", "Partnerverbrauch und Produktanreicherung trotz fortgesetztem Austausch verfolgen.", "Track partner consumption and product accumulation despite continuing exchange."),
    ], [
        ("Hydrogencarbonat mit geschlossenem Gefäß, CO₂-Abgabe und umgekehrtem CO₂-Eintrag qualitativ vergleichen.", "Qualitatively compare bicarbonate in a closed vessel, with CO₂ removal and with reversed CO₂ uptake.", "Der Austauschweg muss zusammen mit seiner Richtung betrachtet werden; das Modell ist keine Blut- oder Behandlungsanalyse.", "Consider the exchange pathway together with direction; this model is not a blood or treatment analysis."),
        ("NH₃-Verlust und kontrollierten endlichen Nachschub bei verbleibendem NH₄⁺ erklären.", "Explain NH₃ loss and controlled finite resupply while NH₄⁺ remains.", "Nachschub ersetzt weder Produktabfuhr noch eine Mengenbilanz und garantiert keine unbegrenzte Stabilität.", "Resupply replaces neither product removal nor an amount balance and guarantees no unlimited stability."),
    ]),
    ("modeling", [
        ("Ein gewünschter pH legt im angegebenen idealen Paarmodell das Partnerverhältnis fest; Gesamtvolumen und Gesamtkonzentration legen die Mengen fest.",
         "In the supplied ideal pair model, target pH sets the partner ratio; total volume and concentration set the amounts.",
         "Die lernende Person konstruiert die Phosphat- und Acetatentwürfe mit korrekten Partnerstoffmengen und Einheiten, ohne eine reale Herstellung zu behaupten.",
         "The learner designs phosphate and acetate buffers with correct partner amounts and units without claiming actual preparation."),
        ("Die gegebene Pufferkapazität β ist eine lokale Ableitung pro Liter und pH-Schritt, keine endliche Gesamtreserve.",
         "The supplied buffer capacity β is a local derivative per litre and pH step, not a finite total reserve.",
         "Sie berechnet β und βV, erläutert die Einheiten und benennt ausgeschlossene Wasser-, Mehrstufen- und Aktivitätseffekte.",
         "The learner calculates β and βV, explains their units and states excluded water, multistage and activity effects."),
        ("Eine vorgegebene endliche Säure- oder Baselast muss mit der stöchiometrischen Partnerbilanz gegen die pH-Grenze geprüft werden.",
         "A specified finite acid or base load must be checked against the pH boundary using the stoichiometric partner balance.",
         "Sie berechnet pH nach der Last und die maximal zulässige Last und unterscheidet den exakten Modellgrenzwert von βVΔpH als lokaler Näherung.",
         "The learner calculates pH after the load and the maximum permitted load, distinguishing the exact model limit from the local βVΔpH approximation."),
        ("Gleiches Verhältnis kann bei größerer Konzentration oder größerem Volumen unterschiedliche Reserven liefern; β je Liter und Gesamtbelastbarkeit skalieren verschieden.",
         "An equal ratio can give different reserves at increased concentration or volume; β per litre and total tolerance scale differently.",
         "Sie bestimmt die nötige Phosphat-Gesamtkonzentration für dieselbe Säurelast und erklärt beim Acetatentwurf die Folgen einer Volumenverdopplung einschließlich unverändertem Anfangs-pH.",
         "The learner determines the phosphate concentration needed for the same acid load and explains the effects of doubling acetate volume, including unchanged initial pH."),
    ], [
        ("acid-to-base-load", "Phosphat unter Säurelast und Acetat unter Baselast mit verschiedenen Zielbereichen entwerfen.", "Design phosphate under acid load and acetate under base load for different target ranges."),
        ("local-to-finite", "Lokale Differentialkapazität mit einer endlichen pH-Toleranz und exakt bilanzierten Grenzlast vergleichen.", "Compare local differential capacity with a finite pH tolerance and an exactly balanced boundary load."),
        ("concentration-to-volume", "Eine zu kleine Konzentration neu dimensionieren und davon eine reine Volumenverdopplung unterscheiden.", "Redesign an insufficient concentration and distinguish this from doubling volume alone."),
    ], [
        ("Einen Phosphatpuffer für pH 7.40 entwerfen, 5 mmol HCl gegen pH 7.30 prüfen und die nötige Konzentration neu bestimmen.", "Design a phosphate buffer at pH 7.40, test 5 mmol HCl against pH 7.30 and determine the required concentration.", "Ein unveränderter Soll-pH garantiert keine ausreichende endliche Säurereserve.", "An unchanged target pH does not guarantee adequate finite acid reserve."),
        ("Einen Acetatpuffer für pH 5.00 entwerfen, 4 mmol OH⁻ prüfen und die Volumenverdopplung beurteilen.", "Design an acetate buffer at pH 5.00, test 4 mmol OH⁻ and assess doubling the volume.", "Kapazität pro Liter, Kapazität des gesamten Ansatzes und endliche Grenzlast müssen getrennt werden.", "Separate capacity per litre, capacity of the whole preparation and finite boundary load."),
    ]),
]


def main():
    selected = json.loads((ROOT / "inputs/whole-ten-current-goals.exact.json").read_text())
    cases = json.loads((ROOT / "materials/twenty-complete-DEEN-cases.author.json").read_text())["cases"]
    rows = []
    for i, (goal, spec) in enumerate(zip(selected["goals"], SPEC, strict=True)):
        archetype, expectations, axes, briefs = spec
        own_cases = [c for c in cases if c["goalId"] == goal["id"]]
        assert len(own_cases) == 2
        profile = {
            "archetype": archetype,
            "expectations": [dict(zip(("id", "essentialUnderstandingDe", "essentialUnderstandingEn", "observablePerformanceDe", "observablePerformanceEn"), (f"e{j+1}", *v))) for j, v in enumerate(expectations)],
            "variationAxes": [dict(zip(("id", "textDe", "textEn"), v)) for v in axes],
            "applicationCaseBriefs": [],
            "coverageExpectations": {"requiredExpectationIds": ["e1", "e2", "e3", "e4"], "alternativeExpectationGroups": [], "minimumIndependentDemonstrations": 2, "freshVariationRequired": True, "independentTransferRequired": True},
        }
        refs = []
        for case, brief in zip(own_cases, briefs, strict=True):
            de, en, focus_de, focus_en = brief
            profile["applicationCaseBriefs"].append({
                "id": case["id"].lower(),
                "taskDemandDe": de + f" Vollständiges Material, Auftrag, Lösung und vier Kriterien: materials/twenty-complete-DEEN-cases.author.json, Fall {case['id']}.",
                "taskDemandEn": en + f" Complete material, task, solution and four criteria: materials/twenty-complete-DEEN-cases.author.json, case {case['id']}.",
                "expectedPerformanceDe": case["modelAnswerDe"].strip(),
                "expectedPerformanceEn": case["modelAnswerEn"].strip(),
                "understandingFocusDe": focus_de,
                "understandingFocusEn": focus_en,
            })
            refs.append({"caseId": case["id"], "path": "materials/twenty-complete-DEEN-cases.author.json", "jsonPointer": f"/cases/{cases.index(case)}", "wholeCaseObjectSha256": digest(case), "coveredExpectationIds": ["e1", "e2", "e3", "e4"]})
        rows.append({"goalId": goal["id"], "goalTitleDe": goal["title"], "wholeGoalObjectSha256": digest(goal), "wholeGoalObjectDigestRule": "UTF-8 JSON, recursively sorted keys, no spaces, ensure_ascii=false; not a production goal fingerprint", "authorStatus": "unreviewed-author-shape", "evidenceLevel": "E0", "maximumClaimScope": "G0", "fullCaseReferences": refs, "profile": profile})
    dump("author-profiles.ten.raw.json", {"schemaVersion": 1, "license": "CC-BY-4.0", "profileRuleVersion": "positive-understanding-evidence-v2", "role": "AUTHOR only; no independent review of own packet", "goalIds": selected["goalIds"], "evidenceLevel": "E0", "maximumClaimScope": "G0", "unreviewed": True, "reviewRecordsCreated": False, "activeConfigCreated": False, "gateClearancesCreated": [], "independentScientificReviewRunIds": [], "learnerExecutions": [], "strictGain": 0, "profiles": rows})
    print(json.dumps({"profiles": len(rows), "expectations": sum(len(r["profile"]["expectations"]) for r in rows), "fullCaseReferences": sum(len(r["fullCaseReferences"]) for r in rows), "acceptedReviewRows": 0}))


if __name__ == "__main__":
    main()
