# SPDX-License-Identifier: Apache-2.0
"""Generate inert author components; never writes active curricula or assigns IDs."""
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
V3 = OWN.parent / 'biologie-q1-four-current383-source-scope-author-remediation-v3'

def case(key, material, task, solution, material_en, task_en, solution_en, essentials):
    return dict(caseId=key, dataOrigin='fictional supplied school model; no performed experiment or learner evidence',
                material=material, task=task, solution=solution, materialEn=material_en,
                taskEn=task_en, solutionEn=solution_en, positiveEssentialPassingConditions=essentials)

def component(key, goal_id, title, title_en, description, description_en, sources, tasks, boundary):
    return dict(candidateKey=key, canonicalGoalId=goal_id, newAssignedGoalId=None,
                status='author_candidate_pending_independent_source_scope_and_P_review',
                title=title, titleEn=title_en, description=description, descriptionEn=description_en,
                sourceScopes=sources, tasks=tasks, boundaryAndPreservation=boundary,
                wholeSourceClosure=False, nativeDRecords=0, independentApproval=False)

classic = component('classical_genetic_information_carriers_dna_gene_chromosome', None,
    'DNA, Gen und Chromosom als Informationsträger verknüpfen',
    'Relate DNA, genes and chromosomes as information carriers',
    'Die lernende Person kann in einem einfachen Modell DNA als Material der Erbinformation, ein Gen als Abschnitt dieses Materials und ein Chromosom als organisierte Trägerstruktur unterscheiden und miteinander verknüpfen.',
    'The learner can use a simple model to distinguish and relate DNA as the material of genetic information, a gene as a section of that material and a chromosome as an organised carrier structure.',
    [{'jurisdiction':r, 'stage':'SekI; thematic genetics placement, not an original universal year assertion',
      'sourceGoalId':r[3:].lower()+'-biology-seki-rlp-2015-3-7-27-chromosomen-gene-und-dna-als-trager-der-erbinformation-erklaren',
      'originalLocation':'Teil C Biologie 2015, 3.7, printed/physical36',
      'originalOperatorBoundary':'Chromosomes as carriers; DNA and gene/allele as mandatory terminology. No original nucleotide/complementarity demand claimed.'} for r in ['DE-BE','DE-BB']],
    [case('classical-carriers-a',
      'Fiktive Modellkarte einer Tierzelle: Im Zellkern liegen vier Chromosomen. Ein einzelnes Chromosom enthält einen langen DNA-Faden mit mehreren markierten Abschnitten. Abschnitt G trägt im Modell eine Anleitung; G ist ein Gen. DNA bezeichnet das Material, nicht ein zusätzliches Chromosom. Nicht jede DNA-Stelle wird in diesem Modell als Gen bezeichnet.',
      'Erkläre die Beziehung zwischen Zellkern, Chromosom, DNA und Gen G. Korrigiere die Aussagen „vier Chromosomen bedeuten vier Gene“ und „DNA und Gen sind zwei gleich große getrennte Träger“. Welche Größenangabe über die Zahl aller Gene fehlt?',
      'Der Zellkern enthält die vier Chromosomen; DNA ist in deren Struktur organisiert. G ist ein Abschnitt der DNA und kein zusätzlicher Träger neben ihr. Ein Chromosom kann mehrere Gene tragen. Die Chromosomenzahl legt die Gesamtzahl der Gene nicht fest; eine vollständige Abschnittsliste fehlt.',
      'Fictional animal-cell model: the nucleus contains four chromosomes. One chromosome includes a long DNA thread with several marked sections. G holds an instruction and is a gene. DNA names the material, not an extra chromosome. Not every DNA position is labelled a gene in this model.',
      'Explain the relationship among nucleus, chromosome, DNA and G. Correct “four chromosomes mean four genes” and “DNA and gene are equally sized separate carriers”. What information about total gene number is absent?',
      'The nucleus contains the four chromosomes, with DNA organised in chromosome structure. G is a DNA section, not an additional separate carrier. A chromosome can carry several genes. Chromosome count does not determine total gene count; a complete section list is absent.',
      ['Relate the three carrier levels using supplied nesting', 'Explain why one chromosome can contain multiple genes', 'Bound gene-count inference to the incomplete model']),
     case('classical-carriers-b',
      'Neues fiktives Modell: Zwei homologe Chromosomen A1 und A2 tragen an gleicher Stelle Gen G. Die G-Abschnitte enthalten unterschiedliche Anleitungsvarianten g1/g2 (Allele); sonstige Chromosomen sind unverändert. In Variante V wird nur g1 durch g3 ersetzt. DNA-Chemie und die Wirkung dieser Anleitung sind nicht dargestellt.',
      'Erkläre Gen und Allel im Modell und verfolge V. Ändert V allein die Chromosomenzahl? Warum genügt die Angabe eines anderen Allels noch nicht für eine bestimmte Merkmals- oder Krankheitsaussage?',
      'G bezeichnet hier den entsprechenden DNA-Abschnitt auf beiden Homologen; g1/g2/g3 sind Varianten dieser Anleitung. V verändert eine Variante am selben Ort, fügt aber kein Chromosom hinzu. Ohne Genprodukt- und Merkmalsdaten folgt kein bestimmtes sichtbares Merkmal und keine Krankheit.',
      'New fictional model: homologous chromosomes A1/A2 carry G at the same location. G sections hold different instruction variants g1/g2, called alleles; other chromosomes are unchanged. V replaces only g1 by g3. DNA chemistry and the instruction’s effect are not shown.',
      'Explain gene versus allele and trace V. Does V alone change chromosome number? Why does a different allele not establish a particular trait or disease?',
      'G denotes the corresponding DNA section on both homologues; g1/g2/g3 are instruction variants. V changes a variant at the same location without adding a chromosome. No specific visible trait or disease follows without gene-product and trait data.',
      ['Distinguish gene location from instruction variant', 'Keep allele change separate from chromosome-number change', 'Explain the absent gene-product/trait evidence'])],
    'New null-ID component is bounded to classical terminology. Existing 0daa remains unchanged and is not asserted as a complete BE/BB whole-target partner. No nucleotide chemistry, Code-Sonne, Mendelian-cross or molecular-transcription prerequisite is added.')

chain = component('by9_gene_product_trait_genwirk_chain', '0263fb84-33b1-52a3-a47e-dad56be7c9bc',
    'Genprodukte in einer einfachen Genwirkkette verfolgen', 'Trace gene products in a simple sequential pathway',
    'Die lernende Person kann im einfachen Modell die Wirkung mehrerer Genprodukte auf eine Merkmalsbildung als Genwirkkette erklären und die Rolle eines Enzyms von einer vorgegebenen weiteren Proteinrolle unterscheiden.',
    'The learner can explain how multiple gene products contribute to a trait through a simple sequential pathway and distinguish an enzyme role from a supplied additional protein role.',
    [{'jurisdiction':'DE-BY','stage':'Gymnasium9','sourceGoalId':'a6ad1554-558e-51e4-9d05-aa9b38ebfa40',
      'originalLocation':'B9 3.1 competency3 and final content clause, current official HTML',
      'originalOperatorBoundary':'Explain basic protein formation and protein contribution to traits; content includes enzymes and Genwirkkette. Structural diversity is a separate duty.'}],
    [case('gene-chain-a',
      'Fiktives Pflanzenmodell unter gleichen Bedingungen: Gen G1 liefert Enzym E1 für X (farblos) → Y (gelb); Gen G2 liefert E2 für Y → Z (rot). X ist im Überschuss vorhanden; nur diese Reaktionen bestimmen hier die Farbe. Karte A: E1 und E2 aktiv. B: E1 fehlt, E2 aktiv. C: E1 aktiv, E2 fehlt. Ein Enzym wirkt hier als Protein, das seine jeweilige Umwandlung ermöglicht; die DNA wird dabei nicht selbst zu Farbstoff.',
      'Verfolge für A/B/C den Reaktionsweg und erkläre die Farbe über Gen → Protein → Reaktion → Merkmal. Warum lässt das Modell nicht die Regel „jedes Merkmal wird durch genau ein Gen bestimmt“ zu?',
      'A erreicht Z und ist rot. B kann X nicht zu Y umsetzen und bleibt farblos, trotz E2. C sammelt Y und ist gelb. Die Anleitungen wirken über die Enzymprodukte, nicht durch eine direkte DNA-Farbstoffumwandlung. Zwei Genprodukte wirken zusammen; das Beispiel begründet keine allgemeine Ein-Gen-ein-Merkmal-Regel.',
      'Fictional plant model, equal conditions: G1 supplies enzyme E1 for colourless X → yellow Y; G2 supplies E2 for Y → red Z. X is abundant; only these reactions determine colour here. A has E1/E2 active; B lacks E1 but has E2; C has E1 but lacks E2. An enzyme is a protein enabling its specified conversion; DNA does not itself become pigment.',
      'Trace A/B/C and explain colour through gene → protein → reaction → trait. Why does this not establish “each trait is determined by exactly one gene”?',
      'A reaches Z and is red. B cannot convert X into Y and remains colourless despite E2. C accumulates Y and is yellow. Instructions act through enzyme products, not a direct DNA-to-pigment conversion. Two gene products contribute together; no universal one-gene-one-trait rule follows.',
      ['Correctly trace all three sequential paths', 'Explain the causal gene-product-reaction-trait chain', 'Explain contribution of multiple genes without a universal one-to-one claim']),
     case('gene-chain-b',
      'Neues fiktives Modell: Gt liefert Transportprotein T in der Zellmembran; T lässt Baustoff B in die Zelle. Ge liefert Enzym E; E setzt verfügbares B zu festem Zellwandmaterial W um. Für dieses Modell ist W-Menge die gemessene Wanddicke. Unter gleichen Bedingungen: T aktiv/E aktiv → 20 Einheiten W; T fehlt/E aktiv → 2 (kleiner T-unabhängiger Hintergrundtransport); T aktiv/E fehlt → 1 (vorgegebener Rest). T und E sind verschiedene Proteine; T transportiert, E katalysiert.',
      'Verbinde die drei Befunde mit beiden Genprodukten und ihren unterschiedlichen Funktionen. Welche Reihenfolge liegt vor? Warum beweist die kleine Restmenge keinen vollständig funktionsfähigen Weg und keine einzelne direkte Gen-Wanddicke-Regel?',
      'T stellt B bereit, danach setzt E B zu W um. Beide aktiven Produkte ermöglichen hier die hohe W-Menge20. Fehlendes T begrenzt Bereitstellung auf den angegebenen Hintergrund, fehlendes E die Umwandlung auf den Rest. Transport und Katalyse sind unterschiedliche Proteinrollen. Kleine Restmengen heben die Blockade nicht auf; mehrere Produkte und vorgegebene Bedingungen beeinflussen die Wanddicke.',
      'New fictional model: Gt supplies membrane transport protein T, which imports B. Ge supplies enzyme E converting available B into solid wall material W. W amount is the wall-thickness measure here. Equal conditions: active T/E →20 units W; absent T/active E →2 via a small supplied T-independent transport; active T/absent E →1 supplied residual. T transports and E catalyses; they are different proteins.',
      'Connect the three results to both products and their different functions. What sequence applies? Why does a small residual not prove an intact pathway or one direct gene-wall-thickness rule?',
      'T makes B available; E then converts B to W. Both active products support the high W amount20. Absent T limits supply to the stated background; absent E limits conversion to the residual. Transport and catalysis are distinct roles. Small residuals do not remove the block; several products and supplied conditions contribute to wall thickness.',
      ['Distinguish transport from enzyme function', 'Use fresh pathway and numerical residual data causally', 'Keep protein contributions separate from a direct universal gene-trait rule'])],
    'Supplemental author material only. The existing NI-reviewed whole goal, requires, image and current P profile are preserved byteexact. It does not cover BY9 protein structural diversity: source caa62aba-fb03-5b28-8df1-d09624168990 remains on existing 28850d2e-062d-5341-ac66-bd787a8fc84f, unchanged and subject to its own binding review.')

code = component('he_code_sun_forward_and_existing_reverse', 'e349d8c4-2ba3-5360-bd44-13457e5c0aa3',
    'Code-Sonne anwenden und mögliche codierende DNA rekonstruieren', 'Use the code wheel and reconstruct possible coding DNA',
    'Die lernende Person kann orientierte codierende DNA in mRNA überführen, die Code-Sonne von innen nach außen auf mRNA-Codons anwenden und für die gegebene Aminosäurefolge mehrere mögliche codierende DNA-Folgen begründen.',
    'The learner can convert oriented coding DNA to mRNA, read mRNA codons on the code wheel from inside out and justify multiple possible coding DNA sequences for a given amino-acid sequence.',
    [{'jurisdiction':'DE-HE','stage':'Q1.1 GK+LK basic level','sourceGoalId':'098832af-d236-4b95-8dd6-c8d45ba2293b',
      'originalLocation':'KC2024 printed/physical38 bullet2',
      'originalOperatorBoundary':'Use of the code wheel is explicit. Reverse reconstruction belongs to the existing canonical goal and is NOT claimed as literal HE duty.'}],
    [case('code-wheel-a',
      'Fiktives intronfreies Gen: codierender DNA-Strang 5′-ATG GAA TTT TGA-3′. Start und Leseraster sind fest vorgegeben; die Standard-Code-Sonne aus v3 ist das Arbeitsmittel. Eine zweite codierende Folge lautet 5′-ATG GAG TTT TAA-3′. Nur die dargestellte Peptidfolge wird verglichen; Regulations- und Funktionsdaten fehlen.',
      'Leite beide mRNA-Folgen5′→3′ ab. Zeige für GAA an der Code-Sonne den Weg von innen nach außen und übersetze bis Stopp. Erkläre, warum die Aminosäurefolge die DNA nicht eindeutig festlegt und welche Funktionsaussage trotzdem offenbleibt.',
      'mRNA1 AUG GAA UUU UGA; mRNA2 AUG GAG UUU UAA. GAA wird innen G, zweiter Ring A, äußerer Codonring A gelesen und ergibt Glu. Beide liefern Met–Glu–Phe, danach Stopp, das keine Aminosäure ist. GAA/GAG und verschiedene Stoppcodons erlauben hier unterschiedliche DNA mit gleicher Peptidfolge. Das allein beweist keine Gleichheit jeder Genregulation oder Proteinfunktion.',
      'Fictional intron-free gene: coding DNA5′-ATG GAA TTT TGA-3′. Start/frame are fixed; the v3 standard code wheel is the working aid. Second coding sequence5′-ATG GAG TTT TAA-3′. Only the shown peptide sequence is compared; regulatory/function data are absent.',
      'Derive both mRNAs5′→3′. Show GAA’s inside-to-outside route on the code wheel and translate to stop. Explain nonunique reconstruction and the function claim that remains unsupported.',
      'mRNA1 AUG GAA UUU UGA; mRNA2 AUG GAG UUU UAA. Read G in the centre, A in the second ring and A in the outer codon ring to obtain Glu. Both yield Met–Glu–Phe then stop, not another amino acid. GAA/GAG and alternative stops allow distinct coding DNA for the same peptide. This does not establish equality of every regulatory or protein-function effect.',
      ['Preserve coding-strand orientation and change T to U', 'Actually trace the three code-wheel rings and handle stop', 'Explain codon degeneracy with a valid alternative and bounded function claim']),
     case('code-wheel-b',
      'Neues fiktives Beispiel: gewünschte kurze Produktfolge Met–Lys–Cys, danach Stopp. Start, Leseraster und intronfreier codierender Strang5′→3′ sind vorgegeben. Nutze dieselbe vollständige Standard-Code-Sonne; keine bestimmte Original-DNA wurde gemessen.',
      'Rekonstruiere zwei unterschiedliche gültige codierende DNA-Folgen samt mRNA. Zeige den Code-Sonnen-Weg für UGC und prüfe beide Rekonstruktionen durch Vorwärtsübersetzung. Belege, warum du nicht „die Original-DNA“ gefunden hast.',
      'Beispiel1 DNA ATG AAA TGC TAG → mRNA AUG AAA UGC UAG; Beispiel2 DNA ATG AAG TGT TGA → mRNA AUG AAG UGU UGA. UGC: innen U, dann G, dann C → Cys. Beide übersetzen zu Met–Lys–Cys und Stopp. AAA/AAG für Lys sowie UGC/UGU für Cys zeigen Mehrdeutigkeit. Weitere korrekte Varianten sind zulässig; ohne Originalmessung ist keine eindeutige Original-DNA bestimmt.',
      'Fresh fictional product sequence: Met–Lys–Cys followed by stop. Start/frame and intron-free coding-strand orientation5′→3′ are fixed. Use the same complete standard code wheel; no original DNA was measured.',
      'Reconstruct two different valid coding DNA sequences and their mRNAs. Show UGC’s code-wheel route and verify each by forward translation. Explain why you have not identified “the original DNA”.',
      'Example1 DNA ATG AAA TGC TAG → mRNA AUG AAA UGC UAG; example2 DNA ATG AAG TGT TGA → mRNA AUG AAG UGU UGA. UGC is U inside, then G, then C → Cys. Both translate to Met–Lys–Cys and stop. AAA/AAG and UGC/UGU demonstrate nonuniqueness. Other valid variants are acceptable; no unique original DNA is established without measurement.',
      ['Provide two valid different coding DNA/mRNA pairs', 'Trace the code wheel and verify by forward translation', 'Explain nonunique reverse mapping without inventing an original measurement'])],
    'Preserves the full current bidirectional goal, while source coverage assigns only the forward code-wheel component to HE. Reuses the exact complete v3 SVG/codon data; no new PNG or visual approval. Mechanistic roles are supplied separately on 1ec4 and retained475.')

mechanism = component('he_pro_euk_mrna_ribosome_trna_mechanism', '1ec4e3c2-f302-5246-b531-f2cebc3efb1d',
    'Proteinbiosynthese in Pro- und Eukaryoten am Modell erklären', 'Explain protein biosynthesis in prokaryotic and eukaryotic models',
    'Die lernende Person kann Transkription und Translation im typischen Bakterien- und kernhaltigen Eukaryotenmodell mit mRNA, Ribosom und tRNA verknüpfen, die räumlich-zeitlichen Unterschiede erklären und die Bedeutung neuer Proteinbildung anhand einer vorgegebenen Funktion begründen.',
    'The learner can connect transcription and translation with mRNA, ribosome and tRNA in typical bacterial and nucleated eukaryotic models, explain spatial and timing differences and justify the importance of new protein formation using a supplied function.',
    [{'jurisdiction':'DE-HE','stage':'Q1.1 GK+LK basic level','sourceGoalId':'098832af-d236-4b95-8dd6-c8d45ba2293b',
      'originalLocation':'KC2024 printed/physical38 bullet2',
      'originalOperatorBoundary':'Pro/euk transcription; mRNA structure/function; translation, ribosome and tRNA. Generic significance is existing canonical goal content, not a fabricated extra literal HE bullet.'}],
    [case('mechanism-pro-euk-a',
      'Fiktive typische Modelle: Bakterium P ohne Zellkern; kernhaltige eukaryotische Zelle E. Gleiches intronfreies Gen, codierende DNA5′-ATG GAA TTT TGA-3′. P: Transkription und Translation liegen im selben Zellraum, ein Ribosom kann bereits die entstehende mRNA ablesen. E: Transkription im Kern, Reifung der RNA, Export der reifen mRNA, Translation an Ribosomen im Cytoplasma. mRNA ist ein einzelsträngiger RNA-Informationsträger mit Codons. Materialcode AUG=Met,GAA=Glu,UUU=Phe,UGA=Stopp. tRNA für GAA trägt Glu und Anticodon3′-CUU-5′ (gleichbedeutend5′-UUC-3′). Das gebildete Enzym ist im Modell für eine lebensnotwendige Stoffwechselreaktion erforderlich.',
      'Verfolge Information vom Gen bis zur Peptidfolge für P und E. Erkläre Rolle und Strukturbezug von mRNA, Ribosom und tRNA; begründe das Anticodon. Vergleiche Raum/Zeit und leite die Bedeutung neuer Enzymbildung ab. Welche Verallgemeinerung über alle prokaryotischen/eukaryotischen Sonderfälle lässt das Material nicht zu?',
      'Transkription liefert mRNA5′-AUG GAA UUU UGA-3′; Translation Met–Glu–Phe, danach Stopp. Die RNA trägt Codons; das Ribosom liest sie und verknüpft bereitgestellte Aminosäuren. tRNA koppelt über antiparallele Basenpaarung GAA/3′CUU5′ die passende Aminosäure Glu an das Codon. P kann Prozesse hier koppeln, E trennt Kern/Reifung/Export von cytoplasmatischer Translation. Neue Enzymbildung ermöglicht Erhaltung/Erneuerung der angegebenen Stoffwechselfunktion; ein Einzelmodell erfasst nicht alle Organellen, Ausnahmen oder alle Proteinaufgaben.',
      'Fictional typical models: bacterium P lacks a nucleus; E is a nucleated eukaryotic cell. Same intron-free coding gene5′-ATG GAA TTT TGA-3′. P transcription/translation share a compartment; a ribosome may read emerging mRNA. E transcribes in the nucleus, processes RNA, exports mature mRNA and translates at cytoplasmic ribosomes. mRNA is single-stranded RNA carrying codons. Code AUG=Met,GAA=Glu,UUU=Phe,UGA=stop. GAA tRNA carries Glu and anticodon3′-CUU-5′, equivalent to5′-UUC-3′. The resulting enzyme is required for a supplied vital metabolic reaction.',
      'Trace information to the peptide in P/E. Explain mRNA, ribosome and tRNA structure/function and anticodon pairing. Compare space/timing and justify the importance of new enzyme production. What universal exception-free statement is unsupported?',
      'Transcription gives mRNA5′-AUG GAA UUU UGA-3′; translation gives Met–Glu–Phe then stop. RNA carries codons; the ribosome reads them and joins supplied amino acids. Antiparallel GAA/3′CUU5′ pairing connects tRNA-bound Glu with its codon. P can couple the processes here; E separates nuclear processing/export from cytoplasmic translation. New enzyme formation supports maintenance/replacement of the supplied metabolic function. This model does not represent every organelle, exception or protein role.',
      ['Explain the complete transcription-to-translation mechanism with all three roles', 'Use antiparallel codon/anticodon pairing correctly', 'Compare both compartments/timing and explain the supplied life-function contribution']),
     case('mechanism-pro-euk-b',
      'Neuer fiktiver Versuch an E: Es werden nur neu gebildete RNA und neu gebildete Peptide markiert. Alte mRNA/Proteine bleiben erhalten und werden in diesen Messungen nicht gezählt. Kontrollen: neue RNA wird im Kern gebildet, exportiert und cytoplasmatisch translatiert. X blockiert ausschließlich den Export neuer reifer mRNA; Transkription/Reifung bleiben normal. Y lässt den Export normal, entfernt aber alle passenden beladenen tRNAs für das erste nach dem Start gelesene GAA-Codon im neuen Reporter. Ribosomen bleiben vorhanden. In P gibt es in diesem Modell keinen Kernexport; tRNA-abhängige Translation bleibt notwendig. Der neue Reporter ist im Modell ein Enzym zum Ersatz abgebauter Enzymmoleküle.',
      'Sage für X/Y voraus, wo neue RNA liegt und welche neue Reporter-Peptidbildung stockt; erkläre jeweils den Mechanismus. Vergleiche die Rolle dieser beiden Eingriffe im angegebenen P-Modell. Warum ist „sofort alle Proteine in der Zelle weg“ falsch, und warum wird bei anhaltender Blockade die Enzymerneuerung beeinträchtigt?',
      'X: neue reife RNA sammelt sich im Kern, erreicht die cytoplasmatischen Ribosomen nicht; daraus entsteht dort kein neues Reporterpeptid. Y: neue RNA erreicht das Cytoplasma, aber das Ribosom kann den Glu-Schritt ohne passende beladene tRNA nicht fortsetzen; kein vollständiges neues Reporterprodukt. P hat den dargestellten Kernexportschritt nicht, benötigt aber ebenso passende tRNA. Alte Proteine verschwinden laut Material nicht; gemessen wird Neubildung. Eine anhaltend fehlende vollständige Neubildung verhindert hier den notwendigen Ersatz abgebauter Enzyme.',
      'Fresh fictional E experiment labels only newly produced RNA and peptides; old mRNA/proteins persist and are excluded. Controls: new RNA is transcribed in the nucleus, exported and translated in the cytoplasm. X blocks only export of new mature mRNA; transcription/processing remain normal. Y allows export but removes all matching charged tRNAs for the first GAA after start in the new reporter; ribosomes remain. P has no nuclear-export step in this model but still needs tRNA. New reporter enzyme replaces degraded enzyme molecules.',
      'Predict new RNA location and stalled new reporter formation for X/Y, explaining mechanisms. Compare these steps in the given P model. Why is “all cell proteins immediately disappear” false, and why does persistent blockage impair enzyme replacement?',
      'X accumulates new mature nuclear RNA without delivery to cytoplasmic ribosomes, so it makes no new cytoplasmic reporter peptide. Y delivers RNA but cannot continue through Glu without matching charged tRNA, producing no complete new reporter. P lacks the depicted nuclear-export step but still requires matching tRNA. Old proteins persist; only new production is measured. Continued failure of complete new synthesis prevents the supplied replacement of degraded enzymes.',
      ['Distinguish RNA production/export from amino-acid delivery and translation', 'Predict both interventions using the supplied model', 'Distinguish new synthesis from existing molecules and explain the renewal consequence'])],
    'Existing whole goal and requires are unchanged. This is a source-specific full mechanism supplement, not a replacement for the preserved475 cases. The material uses typical bacteria/nucleated eukaryotes and explicitly supplied intervention assumptions; no universal organism or clinical claim.')

components = [classic,chain,code,mechanism]
payload = dict(schemaVersion=1, role='author remediation, not independent review', components=components,
               nativeDRecords=0, assignedNewCanonicalGoalIds=[], activeWrites=0,
               independentApproval=False, humanApproval=False, wholeSourceClosure=False,
               licensing='Own didactic texts/tasks CC-BY-4.0; script Apache-2.0; original sources retain rights')
(OWN/'four-main-components-eight-positive-cases.author-candidate.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
lines=['# Vier konkrete DNA-/Genprodukt-/HE-Komponenten – Autorenkandidaten','',
       'Fiktive Schulmodelle und vorgegebene Daten. Keine neue ID, kein unabhängiger P/D/V-Abschluss. Eigene Inhalte CC-BY-4.0.','']
for c in components:
    lines += ['## '+c['title'],'', '`'+c['candidateKey']+'`; '+str(c['canonicalGoalId'] or 'Null-ID-Kandidat'),'',c['description'],'',c['descriptionEn'],'',c['boundaryAndPreservation'],'']
    for t in c['tasks']:
        lines += ['### '+t['caseId'],'','**Material DE:** '+t['material'],'','**Aufgabe DE:** '+t['task'],'','**Lösung DE:** '+t['solution'],'','**Material EN:** '+t['materialEn'],'','**Task EN:** '+t['taskEn'],'','**Solution EN:** '+t['solutionEn'],'','**Positive essentielle Bedingungen:**','']+[ '- '+x for x in t['positiveEssentialPassingConditions']]+['']
(OWN/'four-main-components-eight-positive-cases.author-review.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'mainComponents':len(components),'bilingualCases':sum(len(x['tasks']) for x in components),'newAssignedIDs':0,'activeWrites':0}))
