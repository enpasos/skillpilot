"""Actual AUTHOR fair works and immutable portable handoff."""
import hashlib,json
from pathlib import Path
O=Path(__file__).resolve().parent; R=Path('/home/enpasos/projects/skillpilot'); B=O.parent
def bind(p): return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
works=[{
 'materialId':'d795f9f5-4405-5179-b65f-9db7d1e4a77d','kind':'own new whole fair partial; actual alternative instrument present',
 'completeSixAnswers':[
 'Der Modellpuffer beträgt20, die vierfache Einkommensgrenze120; der Antrag überschreitet sie um30. Gemeinsame Immobilienpreise verbinden mehrere Banken, deshalb ist das keine bloße Einzelbankfrage. Einen ausgeführten gemeinsamen Ausfallpfad ergänze ich hier nicht.',
 'Der Bankpuffer erhöht Verlusttragfähigkeit; die alternative Einkommensgrenze verhindert hier den Kredit150 und begrenzt Verschuldung auf120. Sie greift am neuen Schuldnerkredit an, nicht am vorhandenen Bankkapital. Eine einzelne schlechte Bank kann anders begründet gefährdet sein. Die einzelnen Aufsichtsmaßnahmen benenne ich nicht genauer.',
 'Beide Instrumente können die gemeinsame Überdehnung begrenzen, aber Finanzierung einschränken. Für die Einkommensgrenze müssen Einkommen glaubwürdig gemessen werden; Ausweichen zu anderen Anbietern kann sie unterlaufen. Dies ist nur die gegebene Modellregel. Eine ausgearbeitete Kalibrierung fehlt.',
 'Nach Verlust bleiben62 Eigenkapital. Gesamtanforderung70 bedeutet Abstand−8; nach Freigabe50 bedeutet+12. Kasse bleibt6, Eigenkapital bleibt62. Die Freigabe ist keine Einzahlung20.',
 'Der regulatorische Druck zum Kreditabbau kann nachlassen. Tragfähige Nachfrage, Refinanzierung und Liquidität bleiben entscheidend; Antragsteller M kann auch jetzt nicht zurückzahlen. Es folgen keine automatischen20 Kredite.',
 'Ich befürworte die Freigabe bedingt, wenn tatsächliche gemeinsame Verluste und Tragfähigkeit überprüft werden; zusätzliche starke Verluste könnten weitere Instabilität auslösen. Ich führe in B keine konkrete zusätzliche Maßnahme aus. Die Alternative ist jedoch im A-Fall nachvollziehbar angewandt.'
 ],
 'manualMarks':[
  {'step':'s1','marks':[2,1],'reason':'Alle Zahlen korrekt; gemeinsamer Marktbezug, aber kein vollständiger Ausfallpfad.'},
  {'step':'s2','marks':[2,1],'reason':'Tatsächliche verschiedene Ansatzpunkte; Einzelbankgrenze nur kurz.'},
  {'step':'s3','marks':[2,1],'reason':'Bedingte Vorteile/Zugangskonflikt; Daten/Ausweichen/Modell, Kalibrierung nur teilweise.'},
  {'step':'s4','marks':[2,2],'reason':'Alle Abstände und Kapital/Kasse/Anforderung getrennt.'},
  {'step':'s5','marks':[2,2],'reason':'Abbaudruck plus konkrete Nachfrage/Tragfähigkeit/Liquidität.'},
  {'step':'s6','marks':[2,0],'reason':'Bedingte Empfehlung und Gegenposition; keine konkrete Ergänzung in B.'}],
 'coreBoundaryApplied':False,'reasonBoundaryNotApplied':'Meaningful alternative instrument in A; meaningful systemic buffer work in A and B. No perfection or task-specific minimum.'},
 {
 'materialId':'9cb7ba90-1243-5e68-826c-430b35e90d6c','kind':'own new whole fair partial; actual property comparison present',
 'completeSixAnswers':[
 'Beide Modelle behalten private Unternehmen und damit privates Eigentum. Beide nutzen Marktpreise; S enthält sozialen Ausgleich, G gewichtet zusätzliche Sozial-/Umweltkriterien für Beschaffung. Die Behauptung besserer Gesamtwirkung untersuche ich hier nicht näher.',
 'Aussicht auf Aufträge kann bessere überprüfte Arbeits-/Ressourcenpraktiken belohnen. Es braucht messbare Kriterien und tatsächliche Kontrolle. Kontrolle kostet; kleine Firmen können wegen Aufwand ausgeschlossen werden, sodass gerechtere Ziele nicht automatisch bessere Verteilung garantieren.',
 'G ist wegen seines Namens keine Zentralplanung: Preise bleiben. S enthält ausdrücklich soziale Ziele. Ich bevorzuge bedingte überprüfte Zusatzgewichtung; der Kontrollaufwand spricht dagegen. Eine weitere abgewogene Priorisierung lasse ich offen.',
 'Der Betriebsbericht ergänzt Zieltransparenz, ändert Marktpreise sowie staatliche Steuer-/Sozialregeln nicht und ist kein landesweiter Rechtsakt. Eigentum in B nenne ich hier nicht nochmals; in A habe ich dieses eigenständige Vergleichskriterium ausdrücklich behandelt.',
 'Arbeitszeitdaten sind überprüfbar, Umweltangaben zunächst Selbstauskunft. Es braucht Umweltbelege und Vergleichswerte. Kunden könnten Verträge ändern; die genaue Folge für Beschäftigte oder eine gemessene Netto-Wirkung arbeite ich nicht aus.',
 'Ich würde den freiwilligen Bericht bei verständlicher und geprüfter Methode nutzen. Die Gegenposition verweist auf Selbstwerbung und Aufwand ohne Wirkung. Verlange tatsächliche Umwelt-/Arbeitsfolgen und Ausgangswerte; das Instrument ist weder eine bewiesene neue Ordnung noch automatisch wertlos.'
 ],
 'manualMarks':[
  {'step':'s1','marks':[3,0],'reason':'Drei Dimensionen konkret; Behauptung/Modell nicht ausreichend eigenständig gekennzeichnet.'},
  {'step':'s2','marks':[2,2],'reason':'Konkreter Anreiz plus Kontroll-/Zugangsbedingung.'},
  {'step':'s3','marks':[2,1],'reason':'Beide falschen Etiketten begründet; Urteil/Gegenposition nur kurz.'},
  {'step':'s4','marks':[3],'reason':'Ziele/Koordination und Betrieb/Staat vorhanden; Eigentum hier nicht erneut ausgeführt.'},
  {'step':'s5','marks':[2,1],'reason':'Datenbeleggrenze vollständig, Kundenwirkung nur teilweise.'},
  {'step':'s6','marks':[2,2],'reason':'Bedingtes Urteil/Gegenposition und konkrete Beleganforderungen.'}],
 'coreBoundaryApplied':False,'reasonBoundaryNotApplied':'Recognisable correct property comparison in A; rule-grounded meaningful framework comparisons across both cases. Repetition of every detail in each task is not required.'}]
for w in works:
 assert len(w['completeSixAnswers'])==len(w['manualMarks'])==6
 w['actualRawScore']=sum(sum(x['marks']) for x in w['manualMarks'])
 w['actualFinalScore']=w['actualRawScore'];w['result']='PASS'
 assert w['actualFinalScore']>=15
work=save('actual-two-own-fair-whole-works-and-twelve-manual-rubric-decisions.AUTHOR.json',{'role':'AUTHOR not independent approval','works':works,'actualManualRubricDecisions':12})
oldmanifest=json.loads((B/'actual-final-twelve-finance-current597-portable-author-freeze.manifest.json').read_text())
entries=oldmanifest.get('files',oldmanifest.get('inputs',[]))
assert entries
for e in entries:
 p=R/e['path'];assert bind(p)==e,(p,bind(p),e)
active=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
assert hashlib.sha256(active.read_bytes()).hexdigest()=='6118557f37604ddd3fa5c5b8a418ee9d0061c570dfeea14a12d29ee7cb4addf3'
guard=save('actual-original-whole-freeze-and-current597-endguards.AUTHOR.json',{'role':'technical exact endguard, no fresh scientific approval','allOriginalFrozenFilesWholeExact':len(entries),'activeWhole597ExactToFrozenInput':True,'immutable597':bind(B/'whole-current597-immutable-economics-before-finance12.exact.json'),'originalCurrentContractsAndP':bind(B/'actual-current-whole-twelve-contracts-original-P24-and43-P336685-endguards.AUTHOR.json'),'fourFieldDeltaOnly':True,'nativeWholeClosureReuseJustification':'Requires, inherited placement, all outer fields and all twelve IDs exactly unchanged. Original narrow unplaced closure run remains meaningful; no redundant native run or whole-compiler claim.'})
manifest=save('actual-final-four-field-total-absence-successor.portable-manifest.json',{'role':'AUTHOR freeze','files':[bind(p) for p in sorted(O.iterdir()) if p.is_file()]})
handoff=save('actual-final-twelve-finance-ten-whole-exact-two-essential-boundaries.author-handoff-v3.json',{
 'role':'AUTHOR narrow followup; no scientific self-KEEP','wholeFinalTwelveDRAFT':bind(O/'whole-twelve-finance-only-two-separate-essential-total-absence-boundaries.DRAFT-author-v3.json'),
 'actualFourWholeTaskFieldDeltas':bind(O/'actual-four-DEEN-whole-task-field-deltas-and-ten-whole-unchanged-bodies.AUTHOR.json'),
 'foreignOriginalTwoWholeCounterworksReplayed':bind(O/'actual-two-foreign-original-whole-works19-22-to14-14-author-replays.json'),
 'ownTwoFairWholeWorks':bind(work),'foreignRawScores':[19,22],'foreignFinalScores':[14,14],'ownFairFinalScores':[w['actualFinalScore'] for w in works],
 'freshActualSelectedBISGuidelinePDF':bind(O/'actual-fresh-BIS-PDF-selected-reading-and-original-HTML-scope-source-aid.AUTHOR.json'),
 'exactOriginalFreezeAndCurrent597':bind(guard),'originalWholeScienceReuse':'Root controls independent decisions; all ten unaffected bodies exact, only two genuine total-absence boundaries corrected.',
 'manifest':bind(manifest),'wholeStatus':'draft','sourceScopeNavSEMRelease':'not approved or authored','strictNetGain':0,'noHumanReviewOrAcceptanceClaim':True,'noActiveWrites':True})
print(json.dumps({'handoff':bind(handoff),'whole':bind(O/'whole-twelve-finance-only-two-separate-essential-total-absence-boundaries.DRAFT-author-v3.json'),'ownFairScores':[w['actualFinalScore'] for w in works]}))
