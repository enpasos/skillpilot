#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Own concrete materials complete the prior brief-only cases; no approval."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib,json
HERE=Path(__file__).resolve().parent; ROOT=HERE.parents[6]
PRIOR='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-8ceb-split-scope-preservation-candidate-v1'
old=json.loads((ROOT/PRIOR/'positive-evidence.full.candidates.json').read_text())
DIST='5db9ba57-6a80-56db-8b9d-e8ca4ac41855'; CRACK='7c22f436-e550-5b0b-85ae-a073b0c50418'
def pair(de,en):return dict(de=de,en=en)
cases=[
 dict(candidateGoalId=DIST,caseLocalKey='distillation-whole-column-supplied-ranges-v2',
   material=pair(
     'Vereinfachtes Papiermodell einer Erdölkolonne: unten heiß, nach oben kühler; Dampf steigt auf, kondensierte Flüssigkeit kann nach unten zurücklaufen. Gegebene Modellgruppen bei gleichem Druck: L siedet überwiegend bei 40–170 °C (Nutzung Benzin), M bei 170–340 °C (Diesel/Heizöl), H bei 340–500 °C (schweres Öl). Alle Gruppen sind Gemische; die Zahlen sind vereinfachte Modelldaten, keine universellen Raffineriegrenzen. Das Modell hat Abzüge oben, in der Mitte und unten.',
     'Simplified paper model of a petroleum column: hot at the bottom, cooler upwards; vapour rises and condensed liquid can flow down. Supplied groups at the same pressure: L mainly boils at 40–170 °C (gasoline use), M at 170–340 °C (diesel/heating oil), H at 340–500 °C (heavy oil). All groups are mixtures; the numbers are simplified model data, not universal refinery cut limits. Draw-offs are high, intermediate and low.'),
   learnerTask=pair(
     'Ordne L/M/H den drei Abzugshöhen qualitativ zu. Erkläre das Anreichern durch wiederholtes Verdampfen und Kondensieren und den Zusammenhang von Siedeverhalten und Temperaturverlauf. Beurteile: „Oben entstehen dabei neue kürzere Moleküle; Diesel wird aus anderen Molekülen chemisch hergestellt.“',
     'Qualitatively assign L/M/H to the three draw-off heights. Explain enrichment through repeated evaporation and condensation, relating boiling behaviour to the temperature gradient. Assess: “New shorter molecules form at the top; diesel is chemically produced from different molecules.”'),
   expectedResponseOrSolution=pair(
     'L wird höher, M mittig und H tiefer angereichert. Verdampfende Bestandteile steigen auf und können unter kühleren Bedingungen kondensieren; wiederholter Kontakt führt zur Anreicherung, nicht zu einer scharfen Reintrennung. Die bereitgestellten Nutzungen gehören zu den jeweiligen Fraktionen. Beide Behauptungen einer chemischen Herstellung durch Destillation sind falsch: vorhandene Kohlenwasserstoffmoleküle werden physikalisch verteilt, ihre Identität bleibt erhalten. Fraktionen bleiben im Allgemeinen Gemische.',
     'L is enriched higher, M at intermediate height and H lower. Vaporised components rise and can condense in cooler conditions; repeated contact enriches them without sharp pure separation. The supplied uses relate to their fractions. Both claims of chemical production by distillation are false: existing hydrocarbon molecules are physically redistributed with unchanged identity. Fractions generally remain mixtures.'),
   transferOrCountercase=pair(
     'Frischer Einsatz enthält nur die Modellgruppen M und H. Kann dieselbe Kolonne allein L erzeugen? Begründe. Erwartet: Nein, sie trennt Vorhandenes und erzeugt keine fehlenden Moleküle; eine neue chemische Umwandlung wäre ein anderes Verfahren.',
     'A fresh feed contains only groups M and H. Can the same column alone create L? Justify. Expected: no; it separates existing material without creating missing molecules; chemical conversion would be a different process.'),
   essentialUnderstanding=pair(
     'Unterschiedliches Siedeverhalten und ein Temperaturgradient erlauben physikalische Anreicherung vorhandener Moleküle; Gemischfraktionen sind keine chemisch neu erzeugten Reinstoffe.',
     'Differing boiling behaviour and a temperature gradient allow physical enrichment of existing molecules; mixture fractions are not chemically created pure substances.')),
 dict(candidateGoalId=DIST,caseLocalKey='distillation-whole-isomer-feed-transfer-v2',
   material=pair(
     'Gegebenes frisches Modell: n-Octan CH3–(CH2)6–CH3 und 2,2,4-Trimethylpentan CH3–C(CH3)2–CH2–CH(CH3)–CH3 besitzen beide C8H18. Normale Siedetemperaturen als bereitgestellte, gerundete Daten: etwa 126 °C bzw. 99 °C. In einer geeigneten Kolonne ist es unten heißer und oben kühler. Ein zweites Eingangsgemisch enthält ausschließlich Bestandteile im Bereich360–480 °C; die Zielgruppe für die gedachte Benzinfraktion liegt bei40–170 °C. Es gibt keine Reinheits-/Ausbeutendaten.',
     'Fresh supplied model: n-octane CH3–(CH2)6–CH3 and 2,2,4-trimethylpentane CH3–C(CH3)2–CH2–CH(CH3)–CH3 both have C8H18. Supplied rounded normal boiling points are about 126 °C and 99 °C, respectively. A suitable column is hotter below and cooler above. A second feed contains only components in the 360–480 °C range; the intended gasoline group lies at 40–170 °C. No purity or yield data are supplied.'),
   learnerTask=pair(
     'Welches Isomer wird weiter oben stärker angereichert? Begründe mit den Daten statt nur mit der Kohlenstoffzahl. Beurteile „Gleiche Summenformel heißt nicht trennbar“ und erkläre, ob aus dem zweiten Eingangsgemisch durch Destillation allein die fehlende Zielgruppe entstehen kann.',
     'Which isomer is preferentially enriched higher up? Justify using the data rather than carbon count alone. Assess “same formula means inseparable”, and explain whether distillation alone can make the missing target group from the second feed.'),
   expectedResponseOrSolution=pair(
     'Das bei 99 °C siedende 2,2,4-Trimethylpentan wird gegenüber n-Octan weiter oben angereichert. Gleiche Summenformeln bedeuten hier verschiedene Strukturen und gegebenes unterschiedliches Siedeverhalten; sie verhindern die Trennung nicht. Die jeweilige Molekülidentität bleibt erhalten. Die schwere zweite Mischung liefert durch bloße Trennung keine fehlenden leichten Moleküle. Aus zwei Siedepunkten folgt keine völlig reine Fraktion und keine bestimmte Ausbeute.',
     'The 99 °C 2,2,4-trimethylpentane is preferentially enriched higher than n-octane. Here the same formula accompanies different structures and supplied different boiling behaviour; it does not prevent separation. Each molecular identity is retained. Mere separation of the heavy second mixture cannot create missing light molecules. Two boiling points do not establish perfect purity or a particular yield.'),
   transferOrCountercase=pair(
     'Die Kolonne enthält wieder beide Isomere, die gesamte Anlage bleibt aber kalt und beide verdampfen nicht. Reicht der Stoffname, um denselben Trenneffekt zu erwarten? Erwartet: Nein; das dargestellte Verfahren braucht passende Verdampfungs-/Kondensationsbedingungen. Das ändert keine Molekülformel.',
     'Both isomers are present again, but the whole apparatus remains cold and neither vaporises. Is knowing the names enough to expect the same separation? Expected: no; the model requires suitable vaporisation/condensation conditions. This does not change either formula.'),
   essentialUnderstanding=pair(
     'Siedeverhalten und Prozessbedingungen erklären die Trennung; gleiche Summenformeln und fehlende leichte Bestandteile verlangen eine eigenständige Übertragung, keine reine Bildwiederholung.',
     'Boiling behaviour and process conditions explain separation; matching formulas and missing light constituents require independent transfer rather than repeating a diagram.'),
   scienceFactReferences=[
     {'title':'NIST Chemistry WebBook, octane normal boiling point','url':'https://webbook.nist.gov/cgi/cbook.cgi?ID=C111659&Type=TBOIL','actualChecked20261007':'398.8 K gives125.65 °C, rounded126 °C; formula C8H18.'},
     {'title':'NIST Chemistry WebBook,2,2,4-trimethylpentane normal boiling point','url':'https://webbook.nist.gov/cgi/cbook.cgi?ID=C540841&Type=TBOIL','actualChecked20261007':'372.4 K gives99.25 °C, rounded99 °C; no external exercise/image copied.'}]),
 dict(candidateGoalId=CRACK,caseLocalKey='thermal-cracking-whole-condensed-structures-v2',
   material=pair(
     'Vollständig gegebenes vereinfachtes thermisches Crackmodell bei hoher Temperatur, keine Versuchsanweisung: CH3–(CH2)8–CH3 → CH3–(CH2)6–CH3 + CH2=CH2. Dazu C10H22 → C8H18 + C2H4. Der lange gesättigte Ausgangsstoff ist Decan, die Produkte im Modell sind Octan und Ethen. „–“ bezeichnet Einfachbindung, „=“ Doppelbindung; die Wiederholung in Klammern zählt die CH2-Gruppen. Dies ist ein möglicher Modellweg, keine vollständige reale Produktausbeute.',
     'Fully supplied simplified thermal-cracking model at high temperature, not experimental instructions: CH3–(CH2)8–CH3 → CH3–(CH2)6–CH3 + CH2=CH2, with C10H22 → C8H18 + C2H4. The long saturated feed is decane and the model products are octane and ethene. “–” denotes a single bond and “=” a double bond; parentheses count repeated CH2 groups. This is one possible model pathway, not a complete real product yield.'),
   learnerTask=pair(
     'Erkläre den chemischen Bindungsumbau und ordne die beiden Produktarten zu. Prüfe C- und H-Atomerhaltung. Beurteile „Die Anlage hat nur bereits vorhandene Moleküle nach Siedepunkten sortiert.“ Was kann das Modell über reale ausschließliche Produktanteile aussagen?',
     'Explain chemical bond rearrangement and assign the two product classes. Check carbon and hydrogen conservation. Assess “the plant merely sorted already existing molecules by boiling point.” What can this model establish about exclusive real product proportions?'),
   expectedResponseOrSolution=pair(
     'Aus einem längeren gesättigten Molekül entstehen durch Bindungsspaltung/-umbau neue kürzere Moleküle: ein Alkan mit Einfachbindungen und Ethen als Alken mit C=C. Insgesamt bleiben zehn C- und 22 H-Atome erhalten. Dies ist chemische Umwandlung und keine Destillation vorhandener Moleküle. Der Modellweg zeigt eine mögliche Produktkombination; reale Crackgemische enthalten mehrere Produkte und Wege, deren Anteile hier nicht bestimmt werden.',
     'Bond cleavage/rearrangement transforms one longer saturated molecule into new shorter molecules: an alkane with single bonds and ethene as an alkene with C=C. Ten carbon and 22 hydrogen atoms are conserved overall. This is chemical conversion rather than distillation of existing molecules. The pathway shows one possible product combination; real cracking mixtures contain several products and pathways whose proportions are not established here.'),
   transferOrCountercase=pair(
     'Frischer Vorschlag: C6H14 → C4H10 + C2H4. Begründe unabhängig, ob dieser vereinfachte Weg Atome erhält und welche Produktklasse neu entsteht. Erwartet: sechs C / 14 H erhalten, kürzeres Alkan plus Alken; erneut neue Moleküle, keine Sortierung.',
     'Fresh proposal: C6H14 → C4H10 + C2H4. Independently justify whether this simplified pathway conserves atoms and what new product class appears. Expected: six C / 14 H conserved, shorter alkane plus alkene; new molecules again rather than sorting.'),
   essentialUnderstanding=pair(
     'Thermisches Cracken ist eine chemische Umwandlung längerer Kohlenwasserstoffe zu kürzeren Produkten einschließlich ungesättigter Moleküle; Atome bleiben bei verändertem Bindungsmuster erhalten.',
     'Thermal cracking chemically converts longer hydrocarbons into shorter products including unsaturated molecules; atoms are conserved while bonding patterns change.')),
 dict(candidateGoalId=CRACK,caseLocalKey='thermal-cracking-whole-fresh-structure-conservation-v2',
   material=pair(
     'Frisches thermisches Crackmodell startet mit Dodecan CH3–(CH2)10–CH3, C12H26. Zwei vorgeschlagene alleinige Produktkombinationen sind vollständig gegeben: A: Octan CH3–(CH2)6–CH3, C8H18, plus But-1-en CH2=CH–CH2–CH3, C4H8; B: dasselbe Octan plus Butan CH3–CH2–CH2–CH3, C4H10. Keine weitere Stoffzufuhr ist im Modell enthalten. Für die reale Anlage werden mehrere mögliche Spaltungswege genannt; Ausbeuten sind nicht angegeben.',
     'A fresh thermal-cracking model starts with dodecane CH3–(CH2)10–CH3, C12H26. Two proposed sole product combinations are fully supplied: A: octane CH3–(CH2)6–CH3, C8H18, plus but-1-ene CH2=CH–CH2–CH3, C4H8; B: the same octane plus butane CH3–CH2–CH2–CH3, C4H10. The model supplies no other feed. Several possible cleavage pathways are mentioned for the real plant; no yields are given.'),
   learnerTask=pair(
     'Welche Kombination ist in diesem vereinfachten Modell atomkonservierend möglich? Begründe an Formeln und Bindungen statt nur an der Kettenlänge. Was fehlt für B? Welches Produkt ist ungesättigt? Muss in einer echten Crackanlage ausschließlich A entstehen?',
     'Which combination is atom-conserving in this simplified model? Justify using formulas and bonds rather than chain length alone. What is missing for B? Which product is unsaturated? Must a real cracking plant produce only A?'),
   expectedResponseOrSolution=pair(
     'A erhält zwölf C und 26 H; die explizite C=C-Bindung macht But-1-en zum ungesättigten Alken. B hätte zwölf C, aber 28 H und verlangt eine zusätzliche H-Quelle; H-Atome entstehen nicht aus dem Nichts. A beschreibt neue Molekülidentitäten und ist eine mögliche Modellkombination. Andere Spaltungen sind möglich; eine ausschließliche reale Ausbeute A ist nicht gegeben. Aus der Summenformel C4H8 allein folgt ohne Struktur nicht allgemein „Alken“, hier ist die Doppelbindung tatsächlich bereitgestellt.',
     'A conserves twelve C and 26 H; the explicit C=C bond identifies but-1-ene as an unsaturated alkene. B would contain twelve C but 28 H and needs an additional hydrogen source; H atoms do not appear from nothing. A represents new molecular identities and one possible model combination. Other cleavages are possible, so exclusive real yield A is not established. C4H8 alone does not universally imply “alkene”; here the structure actually supplies the double bond.'),
   transferOrCountercase=pair(
     'Eine Mitschülerin nennt Destillation als Weg, um aus reinem Dodecan ohne chemische Umwandlung genau Octan und But-1-en zu erzeugen. Erwartet: Das geht nicht; physikalische Trennung verteilt vorhandene Moleküle, während die vorgeschlagenen Produkte neue Identitäten und Bindungsmuster verlangen.',
     'A classmate proposes distillation to turn pure dodecane into exactly octane and but-1-ene without chemical conversion. Expected: impossible; physical separation redistributes existing molecules, whereas the proposed products require new identities and bonding patterns.'),
   essentialUnderstanding=pair(
     'Ein frischer strukturierter Produktvorschlag verlangt positive Begründung von Umwandlung, Sättigungsart und Atomerhaltung; eine fehlende Stoffquelle und der Modellcharakter werden erkannt.',
     'A fresh structured product proposal requires positive justification of conversion, saturation and atom conservation; a missing material source and the model limits are recognised.'))
]
for c in cases:
    # Keep the transfer question separate from its model answer. An answer
    # printed in the learner demand would not be positive learner evidence.
    for lang,separator in [('de','Erwartet:'),('en','Expected:')]:
        question,mark,answer=c['transferOrCountercase'][lang].partition(separator)
        assert mark and question.strip() and answer.strip()
        c['transferOrCountercase'][lang]=dict(task=question.strip(),expected=answer.strip())
    c['status']='own_inactive_author_case_not_independent_approval'
    c['license']='CC-BY-4.0'
    c['actualLearnerPerformance']=False
    c['materialAndSourceLimitations']=pair(
        'Reines qualitatives Papier-/Textmodell, keine reale thermische Durchführung, Benzin-Siedeanalyse oder ökonomische Urteilsleistung. Die vier Quellen-/Regional-Holds bleiben unverändert; keine neue V-Freigabe.',
        'Qualitative paper/text model only; no real thermal experiment, gasoline boiling analysis or economic judgment performance. The four source/regional holds remain; no new visualization approval.')
    for lang in ['de','en']:
        whole=c['material'][lang]+' '+c['learnerTask'][lang]+' Transfer: '+c['transferOrCountercase'][lang]['task']
        assert len(whole)<=2000,(c['caseLocalKey'],lang,len(whole))
profiles=[]
for g in old['goals']:
    p=g['profile']; selected=[c for c in cases if c['candidateGoalId']==g['goalId']]
    profile=dict(p)
    profile['applicationCaseBriefs']=[dict(id=c['caseLocalKey'],
        taskDemandDe=c['material']['de']+' '+c['learnerTask']['de']+' Transfer: '+c['transferOrCountercase']['de']['task'],
        taskDemandEn=c['material']['en']+' '+c['learnerTask']['en']+' Transfer: '+c['transferOrCountercase']['en']['task'],
        expectedPerformanceDe=c['expectedResponseOrSolution']['de']+' Transfer: '+c['transferOrCountercase']['de']['expected'],
        expectedPerformanceEn=c['expectedResponseOrSolution']['en']+' Transfer: '+c['transferOrCountercase']['en']['expected'],
        understandingFocusDe=c['essentialUnderstanding']['de'],understandingFocusEn=c['essentialUnderstanding']['en']) for c in selected]
    profiles.append(dict(goalId=g['goalId'],wholePositiveProfile=profile,
                         priorExpectationAndCoverageKept=True,caseMaterialsSubstantivelyCompleted=True))
out=dict(schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),role='own whole author materials, not independent review',
    priorBriefPath=PRIOR+'/positive-evidence.full.candidates.json',
    priorBriefSha256=hashlib.sha256((ROOT/PRIOR/'positive-evidence.full.candidates.json').read_bytes()).hexdigest(),
    cases=cases,entries=profiles,
    scienceDelta='Prior claims that diagrams/ranges were supplied are now backed by concrete complete text models, ranges and condensed structures. Valid prior positive understanding/coverage edges are retained.',
    newScientificClosures=0,newActiveBindingRestorations=0,strictNetIncrease=0)
(HERE/'four-whole-material-cases.de-en.author-candidate.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(wholeConcreteCases=len(cases),wholeProfiles=len(profiles),allWholeTasksWithin2000=True,scientificApprovals=0)))
