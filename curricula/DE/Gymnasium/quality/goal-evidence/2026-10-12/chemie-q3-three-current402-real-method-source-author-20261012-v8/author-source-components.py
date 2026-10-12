import copy,json,pathlib
BASE=pathlib.Path(__file__).resolve().parent;ROOT=BASE.parents[6]
def read(p):return json.loads(p.read_text())
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
inventory=read(BASE/'sources/after.all-raw-sourceGoal-operators-and-fresh-normal-citations.inventory.json')
ids=['81373fb7-2a4a-5b2c-acd0-b4e775acaa65','8be14f15-2258-58e6-ae4e-38953f5d0570','c8844ac6-c414-5a0e-9fcd-7d0a82177d09']
# These are literal clauses actually read in the fresh raw inventory. Every
# other row remains an explicit literal HOLD. No lexical match becomes a
# whole-source approval, and no execution operator is rewritten as analysis.
equilibrium_exact={
 'Umkehrbarkeit chemischer Reaktionen als Voraussetzung für das chemische Gleichgewicht',
 'Merkmale des chemischen Gleichgewichts','Merkmale chemischer Gleichgewichte beschreiben',
 'die Umkehrbarkeit einer Reaktion als Voraussetzung für die Einstellung eines Gleichgewichts nennen',
 'die Einstellung des chemischen Gleichgewichts aufgrund der Angleichung der Reaktionsraten der Hin und Rückreaktion erklären',
 'Nachweis des gleichzeitigen Vorliegens von Edukten und Produkten',
 'Definition des chemischen Gleichgewichts als dynamisches Gleichgewicht: Hin- und Rückreaktion',
 'die Umkehrbarkeit chemischer Reaktionen beschreiben','dynamisches chemisches Gleichgewicht beschreiben',
 'beschreiben das chemische Gleichgewicht auf Stoff- und Teilchenebene.',
 'beschreiben die Notwendigkeit eines geschlossenen Systems für die Einstellung des chemischen Gleichgewichts.',
 'unterscheiden zwischen Ausgangskonzentration und Gleichgewichtskonzentration.',
 'führen Experimente zum chemischen Gleichgewicht durch.',
 'schließen aus Versuchsdaten auf Kennzeichen des chemischen Gleichgewichts.',
 'schließen aus einem Modellversuch auf Kennzeichen des chemischen Gleichgewichts.',
 'nutzen das Modell zur Erklärung des chemischen Gleichgewichts.',
 'beschreiben die Merkmale eines chemischen Gleichgewichtes anhand ausgewählter Reaktionen',
 'Gleichgewichtsreaktion (Hinund Rückreaktion, Gleichgewichtseinstellung und Gleichgewichtszustand, dynamisches Gleichgewicht)',
 'kinetische Deutung der Gleichgewichtseinstellung (vhin ≠ vrück, vges ≠ 0) und des Gleichgewichtszustandes (vhin = vrück, vges = 0)',
 'nennen die Umkehrbarkeit (Reversibilität) und ein geschlossenes System als notwendige Voraussetzungen für die Einstellung eines chemischen Gleichgewichts,',
 'nennen die Merkmale eines chemischen Gleichgewichts.',
 'Sachkompetenz: Umkehrbarkeit chemischer Reaktionen exemplarisch erklären',
 'Grundlegende Wissensbestände: Umkehrbarkeit chemischer Reaktion',
 'Sachkompetenz: Voraussetzungen und Merkmale eines chemischen Gleichgewichts beschreiben',
 'Grundlegende Wissensbestände: chemische Gleichgewichte',
 'das chemische Gleichgewicht als dynamisches Gleichgewicht auf Teilchenebene und als statischen Zustand auf Stoffebene kennzeichnen',
 'die Merkmale chemischer Gleichgewichte erläutern: unvollständiger Stoffumsatz',
 'die Merkmale chemischer Gleichgewichte erläutern: Konstanz der Konzentrationsverhältnisse',
 'die Merkmale chemischer Gleichgewichte erläutern: Einstellbarkeit von beiden Seiten',
 'die Merkmale chemischer Gleichgewichte erläutern: gleiche Reaktionsgeschwindigkeit von Hin- und Rückreaktion'}
voltage_exact={'Redoxreihe der Metalle','elektrochemische Spannungsreihe','Zellspannungen mithilfe von Standardpotenzialen rechnerisch ermitteln',
 'Zellspannung unter Standardbedingungen berechnen: 𝑈 = 𝐸0(𝐴𝑘𝑧𝑒𝑝𝑡𝑜𝑟) − 𝐸0(𝐷𝑜𝑛𝑎𝑡𝑜𝑟)',
 'Standardpotenziale zur Vorhersage von elektrochemischen Reaktionen und zur Berechnung von Zellspannungen unter Standardbedingungen anwenden',
 'treffen Vorhersagen über den Verlauf von Redoxreaktionen und ermitteln die Leerlaufspannung bzw. Zellspannung galvanischer Zellen mithilfe der elektrochemischen Spannungsreihe.',
 'Redoxreihen und Spannungsreihen zur Vorhersage freiwilliger Redoxreaktionen nutzen','definieren das Standard-Elektrodenpotenzial.',
 'nutzen Tabellen von Standard-Elektrodenpotenzialen zur Vorhersage des Ablaufs von Redoxreaktionen.','wählen aussagekräftige Informationen aus.','argumentieren sachlogisch unter Verwendung von Tabellenwerten.'}
narrow_uuid={
 '1163f8a7-1ed7-501c-a602-34bca1a57977':('Stoff-/Teilchenmodell des dynamischen Gleichgewichts und die statisch/dynamische Unterscheidung','Einflussfaktoren/Katalysatoreinsatz bleiben zusätzliche eigenständige Quellenteile.'),
 '6889f4be-3848-531b-a136-28dd6c13bcb3':('Charakterisierung von Stoff-/Teilchenebene und statisch/dynamischer Abgrenzung','Keine pauschale Freigabe anderer Quellengruppenteile.'),
 'e5448ab7-57f5-5533-b570-40dcdc66ae71':('Standardbedingte Redoxvorhersage und Potenzialdifferenzen aus der Spannungsreihe','Nernst-Gleichung/Nichtstandardbedingungen bleiben b7521ac7 und dessen tatsächlichen Quellenpflichten vorbehalten.'),
 'he-chem-sekii-e-1-b06-a01-5428c244':('SHE als relative Referenz und Standard-Zellspannungsberechnung','Praktischer SHE-Aufbau bleibt der eigenen aktuellen Standard-Wasserstoff-Halbzellen-Kompetenz vorbehalten.'),
 'he-chem-sekii-q3-3-b03-a01-27ea846d':('Relative Standardpotenziale und Standard-Potenzialdifferenzen/Zellspannung','Realer SHE-Aufbau oder Standard-Spannungsmessung werden nicht durch Tabellenaufgaben ersetzt.'),
 '2e11d486-d607-5210-bae5-6ec33e409867':('Bau-/Funktionsprinzip auf Primärzellen übertragen und fachliche/gesellschaftliche Batterietypenabwägung','Die BY-Kompetenz bleibt quellengetreu Primärzellenbeurteilung; keine importierte Akku-/Brennstoffzellenkompetenz.'),
 'be-chemistry-sekii-rlp-3-2-9-inhalte-005-681e2e5c':('Primärelement-Teil der Arten elektrochemischer Spannungsquellen','Sekundärelemente/Brennstoffzellen bleiben16b24dc5/ecce0306; ihre gesamte Klausel wird hier nicht abgeschlossen.'),
 'bb-chemistry-sekii-rlp-3-2-9-inhalte-005-681e2e5c':('Primärelement-Teil der Arten elektrochemischer Spannungsquellen','Sekundärelemente/Brennstoffzellen bleiben16b24dc5/ecce0306; ihre gesamte Klausel wird hier nicht abgeschlossen.'),
 'hb-chemistry-sekii-gyo2022-3-3-3-2-elektrochemie-069-24343b2f':('Fachliche/nachhaltigkeitsbezogene Beurteilung ausschließlich der Batterien als Primärzellen','Akkumulatoren und Brennstoffzellen sind gesonderte Eigentümer-/Assessmentpflichten.'),
 'de-hh-chemie-sekii-bildungsplan-2022-3-1-070-94780f35':('Aufbau und Reaktionen verschiedener Primärbatterien','Keine Akku-/Brennstoffzellen-Teilreaktionen übernommen.'),
 'de-hh-chemie-sekii-bildungsplan-2022-3-1-072-b84cc8ad':('Entsorgungs-/Recycling-Abwägung von Primärbatterien','Akkumulatorbezogene Recyclingpflicht bleibt offen/bei den vorhandenen Sekundärzellenzielen.'),
 'th-chem-sekii-th-ch-sekii-4-1-5-elektrochemische-spannungsquellen-111-01-8894e9ac':('Primärelement-Zuordnung und ein Primärzellenbeispiel','Sekundär-/Tertiärelemente, ihre Beispiele und die ganze Dreifachzuordnung bleiben gesondert.'),
 'sn-chem-sekii-sn-ch-jahrgangsstufe-12-leistungskurs-lb1-071-01-1d465147':('Primärelement-bezogene exemplarische Anwendung und kriteriengebundene Nachhaltigkeitsbeurteilung','Projektorientiertes Arbeiten/Dokumentation/Präsentation werden nicht aus einem Musterantworttext als tatsächlich durchgeführt behauptet.')}
out=[]
for r0 in inventory['rawRows']:
 r=copy.deepcopy(r0);literal=r['actualLiteralClause'];sid=r['rawSourceGoalId'];gid=r['goalId'];own=None;remaining='Die vollständige wörtliche Quellenpflicht ist durch dieses Q3-Paket nicht fachlich abgeschlossen; keine Durchführung, Berechnung oder fremde Teilkompetenz wird auf eine leichtere Auswertung reduziert.'
 if gid==ids[0] and literal in equilibrium_exact:own=literal;remaining='Nur die bezeichnete Gleichgewichtskomponente ist als E1-Assessmentanlage geprüft; die volle Passage, tatsächlich ausgeführte Performance und andere Literaloperatoren bleiben getrennt.'
 elif gid==ids[1] and literal in voltage_exact:own=literal;remaining='Nur Standard-/Tabellenanwendung bzw. nachvollziehbare Sachargumentation; praktische Messung/Aufstellung/SHE-Aufbau/Nernst sind zusätzliche Verpflichtungen und nicht durch q3-10-a/b erledigt.'
 elif sid in narrow_uuid and ((gid==ids[0] and sid in ['1163f8a7-1ed7-501c-a602-34bca1a57977','6889f4be-3848-531b-a136-28dd6c13bcb3']) or (gid==ids[1] and sid in ['e5448ab7-57f5-5533-b570-40dcdc66ae71','he-chem-sekii-e-1-b06-a01-5428c244','he-chem-sekii-q3-3-b03-a01-27ea846d']) or (gid==ids[2] and sid not in ['1163f8a7-1ed7-501c-a602-34bca1a57977','6889f4be-3848-531b-a136-28dd6c13bcb3','e5448ab7-57f5-5533-b570-40dcdc66ae71','he-chem-sekii-e-1-b06-a01-5428c244','he-chem-sekii-q3-3-b03-a01-27ea846d'])):own,remaining=narrow_uuid[sid]
 if sid=='th-chem-sekii-th-ch-sekii-4-1-3-loslichkeitsgleichgewichte-062-01-64035951':
  own=None;remaining='TH49 ist die heterogene Sättigungs-/Bodensatzpflicht auf LK. Der reale semantische Eigentümer ac1bcf34 Löslichkeitsgleichgewichte interpretieren wird vollständig benannt; seine ganze Pflicht ist hier nicht bewertet. Die GK-Entfernung bleibt erhalten; keine GK-Verpflichtung wird erzeugt.'
 r['ownComponentJudgment']='AUTHOR_NARROW_COMPONENT_CANDIDATE' if own else 'HOLD_LITERAL_OPERATOR_NOT_COMPLETED_HERE';r['ownClaimedClause']=own;r['remainingLiteralSourceDuty']=remaining
 r['assessmentCaseIds']=(['q3-01-a','q3-01-b','q3-01-e-executable-chemical-coexistence'] if gid==ids[0] else ['q3-10-a','q3-10-b'] if gid==ids[1] else ['q3-12-a','q3-12-b']) if own else []
 r['rawExistingPartnerGoalIds']=r['wholeMappingDecision']['canonicalGoalIds'];r['actualExecutionClaim']=False;r['fullSourceGoalCompleted']=False;r['independentReview']=False
 out.append(r)
owners={'model-exchange-execution':'a0f6ba09-f072-5887-a797-fa369453c62a','MWG-constants':'20f92ba0-f7f4-5407-bb96-07e30da9002f','solubility-and-solid-residue':'ac1bcf34-169c-5339-92ba-efe8c3022560','saturation-data':'413040cd-ba74-5227-948c-a778b0bd0f56','catalyst-equilibrium':'d9cce642-4f89-57f8-832a-abeb62586195','redox-row-investigation':'16da6a4d-8e9c-5f5d-b69d-338d67a2d362','open-circuit-voltage-investigation':'7b39fa19-fec3-575e-9324-a3226b703358','Nernst-nonstandard':'b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b','secondary-cells':'16b24dc5-0e48-5e3b-8307-01289db8d1a9','fuel-cells':'ecce0306-13dc-5563-a097-afe69805a8d6','corrosion':'642d5ea5-b62f-50c8-b0bd-cf132619725f','micelle-emulsification':'6966df95-f125-5ecc-af8e-0442545d9f17'}
land=read(BASE/'candidate/canonical523.exact-v7-live-preserving.inactive.json');goals={g['id']:g for g in land['goals']}
result={'schemaVersion':1,'role':'AUTHOR explicit bounded components for ALL fresh raw rows; holds are literal and no complete-source vote is made','inventoryPath':str((BASE/'sources/after.all-raw-sourceGoal-operators-and-fresh-normal-citations.inventory.json').relative_to(ROOT)),'rows':out,'counts':{'allRawRows':len(out),'narrowComponentCandidates':sum(r['ownClaimedClause'] is not None for r in out),'literalHolds':sum(r['ownClaimedClause'] is None for r in out),'fullSourceGoalCompletionClaims':0},'existingSemanticSiblingOwners':{role:{'goalId':id,'wholeCurrentGoal':goals[id],'scopeAndActualCoverageStillRequireReview':True,'completedByThisPackage':False} for role,id in owners.items()},'noProductionHelperChange':True,'allFiveB007ApplicabilityFixesPreserved':True,'TH49GKRemovalPreserved':True,'SHThreeWrongTargetsRemoved':True,'wholeSourceUnionReleased':False,'HumanApproval':False,'HumanTrial':False}
write(BASE/'sources/whole-all-raw-source-component-attribution.author-candidates-and-literal-HOLDs.json',result)
joinpath=BASE/'inputs/neutral-whole-three-LIVE402-source382-P3-nine-cases-named-chemical-method-and-fresh-sources.author.join.json';j=read(joinpath);j['completeFreshRawSourceInventoryPath']=result['inventoryPath'];j['allRawSourceComponentAttributionPath']=str((BASE/'sources/whole-all-raw-source-component-attribution.author-candidates-and-literal-HOLDs.json').relative_to(ROOT));j['freshNormalizedEvidenceRows']=inventory['counts']['normalizedGoalEvidenceRows'];j['allRawSourceRows']=len(out);j['hiddenLiteralAliasRows']=inventory['counts']['hiddenLiteralAliasRows']
for g in j['goals']:g['completeAllRawMappedSourceOperators']= [r for r in out if r['goalId']==g['wholeCandidateGoal']['id']]
write(joinpath,j)
print(json.dumps(result['counts']))
