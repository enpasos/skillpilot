from pathlib import Path
import json, copy, hashlib, datetime, jsonschema

B = Path(__file__).resolve().parent.relative_to(Path.cwd().resolve())
S = B.parent
V2 = S / 'remediation-v2'
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p): return json.loads(Path(p).read_text())
def bind(p):
    p=Path(p); z=p.read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def write(n,x):
    p=B/n; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n'); return p

# Original first author judgments and scientific material remain immutable.
for p in [S/'whole23-science-author.first.freeze.json', V2/'whole23-targeted-two-fidelity-and-pair-rubrics.author-v2.first.freeze.json']:
    f=read(p)
    for x in f['inputs']+f['outputs']: assert bind(x['path'])==x
materials=read(V2/'twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json')
old=copy.deepcopy(materials)
ea,ga,kg=[materials['entries'][i] for i in (11,21,22)]

cardDe='''Vollständiges konstruiertes 12-Basen-Modell, keine Laboranleitung. Obere alte Vorlage U: 5′-ATG CCT AAA GGT-3′; darunter antiparallele alte Vorlage T: 3′-TAC GGA TTT CCA-5′. A paart mit T, G mit C. Die drei Basen langen Modellprimer dienen nur der sichtbaren Rechnung; reale PCR-Primer sind länger und benötigen experimentell passende Bedingungen.
Zellkarte: Helicase trennt U/T. Primase stellt passende RNA-Startstücke bereit. DNA-Polymerase verlängert von einem passenden freien 3′-Ende ausschließlich 5′→3′; RNA-Primer werden danach entfernt und durch DNA ersetzt, Lücken verbunden. Betrachte das vollständig kopierte lokale Stück: Jede Tochter enthält genau einen ALTEN und einen NEUEN komplementären DNA-Strang. Im Gesamtgenom muss auch diskontinuierliche Synthese organisiert werden; das kurze Modell zeigt nicht jede Replikationsgabel.
PCR-Karte: DNA-Primer F=5′-ATG-3′ passt an T links; DNA-Primer R=5′-ACC-3′ passt antiparallel an U rechts. Vollständiger Modellzyklus:95°C trennt die Stränge;55°C lässt die passenden Primer anlagern;72°C erlaubt der thermostabilen Polymerase die Verlängerung vom 3′-Ende. F wird auf T nach rechts verlängert, R auf U nach links. Nach jeder Verlängerung liegen hier vollständige Ziel-Doppelstränge vor, die im nächsten Zyklus wieder Vorlagen sind. Start: ein Doppelstrang, beide Primer im Überschuss und ideale vollständige Kopie. Reale Temperaturen/Effizienz sind primer- und enzymabhängig;95/55/72 ist eine gegebene Modellfolge. Eine hitzeempfindliche Polymerase verliert beim Trennen Aktivität.'''
cardEn='''Complete constructed12-base model, not a laboratory protocol. Old upper template U:5′-ATG CCT AAA GGT-3′; antiparallel old lower template T:3′-TAC GGA TTT CCA-5′. A pairs withT andG withC. Three-base primers are only visible calculation models; real PCR uses longer primers and suitable experimental conditions.
Cell card: helicase separates U/T. Primase supplies appropriate RNA starts. DNA polymerase extends an appropriate free3′ end only5′→3′; RNA primers are subsequently removed/replaced by DNA and gaps joined. At completion each local daughter duplex has exactly one OLD andone NEW complementary DNA strand. Genome replication also needs discontinuous synthesis organisation; this short model does not depict every replication fork.
PCR card: DNA primer F=5′-ATG-3′ binds T at left; R=5′-ACC-3′ binds U antiparallel at right. Complete model cycle:95°C separates strands;55°C permits matching primer annealing;72°C permits thermostable polymerase to extend from3′ ends. F extends rightward onT, R leftward onU. Each completed local target duplex can be a template next cycle. Start withone duplex, excess primers andideal complete copying. Actual temperatures/efficiency depend onprimer/enzyme;95/55/72 is the supplied model sequence. Heat-sensitive polymerase loses activity at separation.'''
taskDe='Zeichne U und T mit Enden. Ergänze beide neuen Stränge mit 5′-/3′-Enden und markiere alt/neu in beiden Zell-Tochtermolekülen. Ordne dann die drei PCR-Schritte, zeichne F/R passend antiparallel und beide Verlängerungsrichtungen. Begründe die Strangzusammensetzung nach Zyklus1 und2 sowie die technische Wärme-Lösung. Vergleiche vollständige Genomkopie und begrenztes PCR-Ziel; ergänze keine GA-Reparaturpflicht.'
taskEn='Draw U/T ends andboth new complementary strands, marking old/new inboth cellular daughters. Order all three PCR phases, draw antiparallel F/R binding andboth extension directions. Explain strand composition aftercycles1/2 andthe heat solution; distinguish genome copying fromthe limited target. Do not addmandatory repair detail tothe GA case.'
workedDe='''Auf alter T entsteht neue U′:5′-ATG CCT AAA GGT-3′, nach rechts. Auf alter U entsteht neue T′, in gleicher Bildausrichtung3′-TAC GGA TTT CCA-5′; gelesen in Syntheserichtung von rechts nach links5′-ACC TTT AGG CAT-3′. Zelltochter1=(U alt,T′ neu), Tochter2=(T alt,U′ neu): semikonservativ, nicht ein vollständig altes undein vollständig neues Molekül.
PCR: denaturieren→Primer anlagern→verlängern. F=ATG am linken Ende derT, sein freies3′-Ende zeigt nach rechts. R=ACC am rechten Ende derU, sein freies3′-Ende zeigt nach links. Beide neuen DNA-Stränge entstehen5′→3′ undbehalten dieDNA-Primer. Zyklus1 ergibt2 Duplexe mitje einem ursprünglichen undeinem neuen Strang. Nach Zyklus2:4 Duplexe;2 enthaltenje einen ursprünglichen Strang undeinen inZyklus2 neuen,2 bestehen auseinem Zyklus1-Strang undeinem Zyklus2-Strang. Jeder Kopierschritt bleibt semikonservativ, doch nicht jede spätere Kopie trägt einen derzwei ursprünglichen Stränge. Hitze übernimmt Trennung, thermostabiles Enzym übersteht sie. Die Zelle organisiert Genomkopie, PCR wählt den flankierten Abschnitt; dieses Modell beansprucht weder reale Ausbeute noch jede Zellfunktion.'''
workedEn='''Old T templates new U′:5′-ATG CCT AAA GGT-3′, extended rightward. Old U templates new T′, aligned3′-TAC GGA TTT CCA-5′; read inright-to-left synthesis direction5′-ACC TTT AGG CAT-3′. Cellular daughter1=(oldU,newT′), daughter2=(oldT,newU′): semiconservative, not one wholly old andone wholly new molecule.
PCR order: denature→anneal primers→extend. F=ATG binds T left withfree3′ end pointing right; R=ACC binds U right withfree3′ end pointing left. Both newDNA strands grow5′→3′ andretain DNA primers. Cycle1 gives2 duplexes, eachwithone original andone new strand. Cycle2 gives4:2 retainone original plusone cycle2 strand;2 containone cycle1 plusone cycle2 strand. Every copying event is semiconservative, butnot every later copy retains anoriginal starting strand. Heat replaces separation andthermostability preserves enzyme activity. Cellular genome replication differs froma primer-bounded target; this model claims neither real yield norevery cellular function.'''
freshDe='Frische Abweichung: Im gleichen vollständigen PCR-Modell fehlen BEIDE Primer beim55°C-Schritt; Vorlagen, Nukleotide undPolymerase sind vorhanden. Zeichne, welche Startenden fehlen, undbegründe das72°C-Ergebnis. Ist „thermostabil“ ein Ersatz für Anlagerung?'
freshEn='Fresh change: BOTH primers are absent at55°C, buttemplates,nucleotides andpolymerase remain. Identify missing start ends andpredict72°C. Does thermostability replace annealing?'
freshWorkedDe='Ohne Primer gibt es keine gegebenen passenden freien3′-Startenden auf U/T. Die spezifizierte DNA-Polymerase kann nicht de novo starten: keine neuen Zielstränge undkeine Verdopplung. Thermostabilität löst den Hitzeverlust, nicht die fehlende Initiation; eine andere Initiationsmöglichkeit wäre zusätzliche, hier nicht gegebene Evidenz.'
freshWorkedEn='No primers means no supplied appropriate free3′ starting ends onU/T. The specified DNA polymerase cannot initiate de novo: no new target strands ornodoubling. Thermostability prevents heat loss, not missing initiation; another start mechanism would require additional evidence notprovided.'

ga0=ga['newAuthoredWholeCases'][0]
for k,v in dict(materialDe=cardDe,materialEn=cardEn,taskDe=taskDe,taskEn=taskEn,workedResponseDe=workedDe,workedResponseEn=workedEn,freshTransferTaskDe=freshDe,freshTransferTaskEn=freshEn,workedFreshTransferDe=freshWorkedDe,workedFreshTransferEn=freshWorkedEn).items():ga0[k]=v

# A second complete sequence model uses distinct sequence, explicit controls and
# a changed annealing rule; original ideal-count/efficiency reasoning remains.
secondDe='''Vollständige zweite lokale Modellvorlage: U alt=5′-GCA TTA CCG AAT-3′; T alt=3′-CGT AAT GGC TTA-5′. F=5′-GCA-3′, R=5′-ATT-3′. Nur vollständig passende Primer werden im gegebenen vereinfachten Modell angelagert/verlängert; es gibt keine anderen Bindungsstellen. Reihenfolge jedes Zyklus:95°C trennen→55°C anlagern→72°C5′→3′ verlängern. Die DNA-Startstücke bleiben imPCR-Produkt. K besitzt2 Zielduplexe, beidePrimer, Nukleotide undEnzym. N fehltjede Vorlage, E diePolymerase. Bei gleicher Zellvorlage würden Helicase/Primase die Trennung/Initiation ermöglichen undvollständige lokale Töchterje einen alten/neuen Strang enthalten. Alle Zahlen sind Modellwerte.'''
secondEn='''Complete second local template: oldU=5′-GCA TTA CCG AAT-3′; oldT=3′-CGT AAT GGC TTA-5′. F=5′-GCA-3′, R=5′-ATT-3′. Only fully matching primers anneal/extend inthis simplified model, withno other binding sites. Every cycle:95°C separation→55°C annealing→72°C5′→3′ extension. DNA starts remain inthe PCR product. K has2 target duplexes,bothprimers,nucleotides andenzyme;N hasnotemplate,E nopolymerase. Inacell helicase/primase separate/initiate andcompleted local daughters eachcontainone old/new strand. Allcounts are model values.'''
g1=ga['newAuthoredWholeCases'][1]
g1['materialDe']=secondDe;g1['materialEn']=secondEn
g1['taskDe']='Ergänze beide neuen vollständigen Stränge samt Enden, markiere alt/neu nach Zyklus1 und2 undvergleiche Zellkopie. Berechne K nach5 vollständigen Zyklen, sage N/E voraus undbegründe Grenzen idealer Verdopplung.'
g1['taskEn']='Complete both new strands/ends;mark old/new aftercycles1/2 andcompare cellular copying. Calculate K after5 complete cycles,predict N/E andbound ideal doubling.'
g1['workedResponseDe']='Auf T entsteht U′=5′-GCA TTA CCG AAT-3′, auf U entsteht T′=3′-CGT AAT GGC TTA-5′, in Syntheserichtung5′-ATT CGG TAA TGC-3′. F rechtswärts,R linkswärts: beide5′→3′. Aus2 Duplexen werden Zyklus1:4 (jealt+neu),Zyklus2:8;4 tragenje einen ursprünglichen Strang,4 einen Strang ausZyklus1, alle einen neuen Zyklus2-Partner. In derZelle bleiben lokale Töchterebenfalls semikonservativ, die Genomkopie wird aber nicht durch5 künstliche Wärmezyklen organisiert. '+old['entries'][21]['newAuthoredWholeCases'][1]['workedResponseDe']
g1['workedResponseEn']='T templates U′=5′-GCA TTA CCG AAT-3′;U templates T′=3′-CGT AAT GGC TTA-5′, read insynthesis direction5′-ATT CGG TAA TGC-3′. F extends right,R left,both5′→3′. From2 duplexes cycle1 gives4(old+new),cycle2 gives8:4 retainone original and4 onecycle1 strand,eachwithanew cycle2 partner. Cellular local daughters arealso semiconservative, butgenome copying isnot organised by5 artificial heat cycles. '+old['entries'][21]['newAuthoredWholeCases'][1]['workedResponseEn']
g1['freshTransferTaskDe']=old['entries'][21]['newAuthoredWholeCases'][1]['freshTransferTaskDe']+' Zweite frische Abweichung K′: R wird durch5′-AAA-3′ ersetzt. Zeichne dessen antiparallele Lage über demrechten U-EndeAAT. Gilt weiter2ⁿ-Verdopplung? Zähle nach3 Zyklen nur die neu gebildeten U-Stränge bei weiterhin2 ursprünglichen T-Vorlagen.'
g1['freshTransferTaskEn']=old['entries'][21]['newAuthoredWholeCases'][1]['freshTransferTaskEn']+' Second fresh change K′ replaces R by5′-AAA-3′. Align it antiparallel withthe right U-endAAT. Does2ⁿ doubling remain? Count onlynew U strands after3 cycles with2 original T templates remaining.'
g1['workedFreshTransferDe']=old['entries'][21]['newAuthoredWholeCases'][1]['workedFreshTransferDe']+' K′: Der falsche Primer wäre vonlinks nachrechts3′-AAA-5′ gegenüber5′-AAT-3′; zwei Positionen sind nicht komplementär, einschließlichseines3′-Endes. Nach dergegebenen strengen Modellregel keine R-Anlagerung/-Verlängerung, also keine neuen T-Stränge. F kopiertjede der2 ursprünglichen T-Vorlagenje Zyklus:3×2=6 neue einzelne U-Stränge, linear statt exponentiell. Dies ist eine Strangzählung,nicht6 zusätzliche vollständige Duplexe. Reale Fehlanlagerung hängt vonBedingungen ab; unser strenges Modell allein erlaubt keine reale Ausbeuteprognose.'
g1['workedFreshTransferEn']=old['entries'][21]['newAuthoredWholeCases'][1]['workedFreshTransferEn']+' K′: Aligned left-to-right,wrong primer3′-AAA-5′ opposes5′-AAT-3′. Two positions are noncomplementary,including its3′ end. The supplied strict rule allowsno R annealing/extension,henceno new T strands. F copieseachofthe2 originalT templates oncepercycle:3×2=6 new single U strands,linear ratherthanexponential. This counts strands,not6 extra complete duplexes. Real mismatch annealing depends onconditions; this strict model alone predicts noactual yield.'
shared=write('finite-GA-two-complete-strand-and-cycle-models.DEEN.author-material.json',{'schemaVersion':1,'goalId':ga['goalId'],'cases':copy.deepcopy(ga['newAuthoredWholeCases']),'scope':'Two complete constructed GA models, no repair requirement or performedPCR','actualExperimentPerformed':False,'humanApproval':False})

# EA cases explicitly carry and bind the actual shared GA materials. Repair text
# is retained literally as a separate EA-only part, never added to the GA scope.
for j,c in enumerate(ea['newAuthoredWholeCases']):
    original=old['entries'][11]['newAuthoredWholeCases'][j]
    core=ga['newAuthoredWholeCases'][j]
    c['corePrerequisiteExactBinding']={'goalId':ga['goalId'],'caseId':core['caseId'],'path':str(shared),'materialBinding':bind(shared),'pointer':'/cases/'+str(j),'authority':'author material successor, independent followup pending'}
    for lang in ('De','En'):
        c['material'+lang]=core['material'+lang]+'\n\n'+original['material'+lang]
        c['task'+lang]=core['task'+lang]+'\n\n'+original['task'+lang]
        c['workedResponse'+lang]=core['workedResponse'+lang]+'\n\n'+original['workedResponse'+lang]
        c['freshTransferTask'+lang]=original['freshTransferTask'+lang]+'\n\n'+core['freshTransferTask'+lang]
        c['workedFreshTransfer'+lang]=original['workedFreshTransfer'+lang]+'\n\n'+core['workedFreshTransfer'+lang]
    c['EArepairFacetOriginalExact']=True

# Complete numerical stimuli before the learners infer any mutation name.
types=[str(i) for i in range(1,23)]+['X','Y']
def counts(aut=2,X=2,Y=0,over=None):
    z={str(i):aut for i in range(1,23)};z.update(X=X,Y=Y);z.update(over or {});return z
data1={'A':counts(),'B':counts(over={'21':3}),'C':counts(X=1),'D':counts(aut=3,X=2,Y=1)}
data2={'T':counts(X=1,Y=1,over={'18':3}),'T2':counts(X=1,Y=1,over={'18':3}),'R':counts(X=1,Y=1)}
fresh2={'Q':counts(X=1,Y=2)}
def texttable(ds):
    names=list(ds)
    return 'Typ / '+ ' / '.join(names)+'\n'+'\n'.join(t+': '+ ' / '.join(str(ds[n][t]) for n in names) for t in types)
k0,k1=kg['newAuthoredWholeCases']
k0['materialDe']='Fiktive vollständige Anzahlmatrix aller24 Chromosomentypen einer konstruierten menschlichen Zelle. Jede Zahl zählt ganze Chromosomen desTyps;0 bedeutetabwesend. Alle1–22 undX/Y sinderfasst, keineMutation istvorgegeben. Vergleiche A alsgegebenen Referenzbestand. Tabelle:\n'+texttable(data1)+'\nWeitere Zellfunktions-/Gesundheitsbefunde fehlen. Diese abstrakte Sortier-/Anzahldarstellung istkein Patientenkaryogramm; Basenmutationen/kleine Strukturänderungen sindnicht aufgelöst.'
k0['materialEn']='Fictional complete count matrix forall24 chromosome types inaconstructed human cell. Eachnumber counts whole chromosomes ofthattype;0 meansabsent. All1–22,X/Y areincluded,withnomutation named. A isthe supplied reference complement. Table:\n'+texttable(data1)+'\nNo further function/health findings. This abstract sorted-count stimulus isnota patient karyogram; base mutations/small structural changes arenot resolved.'
k0['completeChromosomeCountStimulus']=data1
k0['taskDe']='Zähle die Gesamtzahl inA/B/C/D selbst. Vergleiche jedenTyp mitA, leite ausB/C/D diejeweiligen numerischen Genommutationen ab undunterscheide Änderung einesTyps vonÄnderung ganzer Sätze. Beschreibe mögliche organismische Folgen, abertrenne Bestandsbeleg, Phänotyp undKrankheit; keine zusätzliche EA-Mehr-Ebenenpflicht.'
k0['taskEn']='Independently total A/B/C/D,compare eachtype withA,infer numerical genome-mutation types anddistinguish one-type versuswhole-set change. Discusspossible organism effects,butseparate complement evidence,phenotype anddisease; noextra mandatory EA multilevel detail.'
k0['workedResponseDe']='A:22×2+2+0=46. B:21×2+3+2+0=47; nurTyp21 hat3statt2, alsoTrisomie21. C:22×2+1=45; X hat1statt2, alsoMonosomieX. Beide sindAneuploidien,keine Vermehrung ganzer Sätze. D:22×3+2+1=69, also3Autosomesätze und3Gonosomen statt2; triploider Bestand,Polyploidie. '+old['entries'][22]['newAuthoredWholeCases'][0]['workedResponseDe']
k0['workedResponseEn']='A:22×2+2+0=46. B:21×2+3+2+0=47;onlytype21 has3instead2,hencetrisomy21. C:22×2+1=45;X has1instead2,hencemonosomyX. Bothareaneuploidies,notwhole-set multiplication. D:22×3+2+1=69,three autosome sets andthree sex chromosomes ratherthantwo:hencetriploidy,apolyploid complement. '+old['entries'][22]['newAuthoredWholeCases'][0]['workedResponseEn']
k0['freshTransferTaskDe']='Neue Pflanzenart: haploider Satz hat die fünfTypenI–V. Referenz:je2Kopien,daher2n=10. NeueLinie: I=4,II=4,III=4,IV=4,V=4; keinMutationstyp istvorgegeben. Zähle undklassifiziere; welchegleiche Folge beimMenschen ist damit sicherbelegt?'
k0['freshTransferTaskEn']='Fresh plant species hasfive haploid typesI–V. Reference:2copies ofeach,2n=10. Newline:I=4,II=4,III=4,IV=4,V=4,nomutation named. Count/classify; whatidentical human effect iscertainly established?'
k0['workedFreshTransferDe']='5×4=20 statt10, alle fünfTypen tragen4statt2Kopien: vier vollständige Sätze,tetraploid. '+old['entries'][22]['newAuthoredWholeCases'][0]['workedFreshTransferDe']
k0['workedFreshTransferEn']='5×4=20 instead10;allfive types have4ratherthan2copies:fourcomplete sets,tetraploid. '+old['entries'][22]['newAuthoredWholeCases'][0]['workedFreshTransferEn']
k1['materialDe']='Andere vollständige fiktive Anzahlmatrix; hierT/T2/R, weiterhinalleTypen1–22,X,Y undganzeChromosomen. ReferenzR wirdalsvergleichbarer zweisätziger menschlicher Bestandgegeben. KeineMutation istnamentlich vorgegeben.\n'+texttable(data2)+'\nZusatzkarten: T nuräußerliches Merkmal,keinFunktionsbefund;T2 zusätzlichgesondert konstruierter Funktionsbefund;R zusätzlichgegebene Basensubstitution. Keineechten Personen-/Patientenbefunde.'
k1['materialEn']='Asecond complete fictional count matrix T/T2/R,againalltypes1–22,X/Y andwholechromosomes. R isthe supplied comparable two-set human reference,nomutation named.\n'+texttable(data2)+'\nAdditional cards:T onlyanexternaltrait,nofunctionfinding;T2 alsoaseparate constructed functionfinding;R asuppliedbase substitution. Noactual person/patient data.'
k1['completeChromosomeCountStimulus']=data2
k1['taskDe']='Zähle T/T2/R, ermittle denabweichendenTyp undbegründe Einzeltyp-/Satzänderung. Formuliere getrennte AussagenzuChromosomenbestand,Merkmal undFunktion/Gesundheit. Erkläre möglicheFolgen sowieAuflösungsgrenzen; einegezählteAbweichung istkeineuniverselle klinischeDiagnose.'
k1['taskEn']='CountT/T2/R,identify thedifferenttype andjustify single-type/set distinction. State complement,trait andfunction/health findings separately. Explainpossible effects andresolutionlimits; acounted difference isnot auniversal clinicaldiagnosis.'
k1['workedResponseDe']='R:22×2+1+1=46. T/T2:21×2+3+1+1=47; jeweilsTyp18dreifach, übrigeTypenwieR,alsoTrisomie18/Aneuploidie,nichtTriploidie. '+old['entries'][22]['newAuthoredWholeCases'][1]['workedResponseDe'].replace('Chromosom21','Chromosom18')
k1['workedResponseEn']='R:22×2+1+1=46. T/T2:21×2+3+1+1=47;type18 hasthreecopies,allothertypes matchR,hencetrisomy18/aneuploidy,nottriploidy. '+old['entries'][22]['newAuthoredWholeCases'][1]['workedResponseEn'].replace('chromosome21','chromosome18')
k1['freshTransferTaskDe']='Frische vollständige KarteQ zumgleichenReferenzbestandR: alleTypen1–22je2Kopien,X=1,Y=2. Zähle, benenne Einzeltyp-/Satzänderung undprüfe dieÜberschrift „Karyogramm beweist bei jederPerson dasselbeLeiden“. Zusatzbefunde fehlen.'
k1['freshTransferTaskEn']='Fresh complete Q card againstR:alltypes1–22 have2copies,X=1,Y=2. Count,classify single-type/set change andevaluate“karyogram proves identical suffering ineveryperson”. Noadditionalfindings.'
k1['workedFreshTransferDe']='Q:44+1+2=47; einYmehralsR,keineVermehrungallerTypen,alsoGonosomen-Aneuploidie/zusätzlichesY. '+old['entries'][22]['newAuthoredWholeCases'][1]['workedFreshTransferDe']
k1['workedFreshTransferEn']='Q:44+1+2=47;oneextraY comparedwithR,notamultiplication ofalltypes,hencesex-chromosome aneuploidy/extraY. '+old['entries'][22]['newAuthoredWholeCases'][1]['workedFreshTransferEn']
k1['freshCompleteChromosomeCountStimulus']=fresh2
write('complete24-chromosome-type-stimuli.two-distinct-cases-and-fresh-variation.author.json',{'schemaVersion':1,'types':types,'case1':data1,'case2':data2,'fresh2':fresh2,'plantFresh':{'types':['I','II','III','IV','V'],'referenceCopiesEach':2,'candidateCopiesEach':4},'noMutationNameInStimuli':True,'actualPatientData':False})

# Normal P fields refer to the complete supplied materials with brief concrete
# demanded/expected performances, avoiding an overlength duplicated stimulus.
affected=(11,21,22)
mp=B/'twenty-three-whole46-bilingual-cases-and-P.v3.author-candidate.json'
briefTaskDe=['Bearbeite die vollständig gelieferten Strang-/Zyklus- und EA-Reparaturkarten: zeichne alte/neue komplementäreStränge mitEnden, ordneDenaturieren/Anlagern/Verlängern und2Zyklen, erkläreThermostabilität sowie denunveränderten Reparaturwert; beantworte diegegebenen falscherPrimer/fehlenderPrimer-Bedingungen.','Bearbeite dievollständigen zweitenStrang-/Zyklus- undEA-Läsionskarten: ergänzeStränge, vergleicheZell-/PCR-Kopie, erkläreBasenexzision/Gegenstrang/Ligase undRestfehler, berechne48 undKontrollen; bearbeiteFehlpaarungs- undfehlende/falscheAnlagerungsvariation.','Löse dievollständige12-Basen-Vorlage samtF/R,alten/neuenDNA-Strängen und3PCR-Schritten. Zeichne2Zyklen, erkläreWärmelösung/GenomvsZielabschnitt undprüfefehlendePrimer; keinGA-Reparaturmandat.','Löse diezweitevollständigeVorlage/K/N/E mitStrangenden,5′→3′-Richtungen und2Zyklen. Berechne64/32,4,korrigiereK′mitfalschemR undzähle6neueEinzelstränge stattExponentialamplifikation.','Nutze dieganze24-Typen-TabelleA/B/C/D: zähle46/47/45/69, lokalisiereTyp21/XvsganzeSätze undbezieheMerkmals-/Funktionsgrenzen sowieganzePflanzenvariation ein. Mutationstypen sindimMaterialnichtvorgegeben.','Nutze dieganzezweite24-Typen-TabelleT/T2/R: zähle47/47/46, lokalisiereTyp18vsganzeSätze, trenneZusatzbefunde undBasensubstitutionsgrenze; leiteausganzerneuerQ-Karte47/zusätzlichesYab,ohneGesundheitsgarantie.']
briefTaskEn=['Usecomplete strand/cycle andEArepair cards:drawold/newcomplementary strands/ends,orderdenature/anneal/extend and2cycles,explainthermostability andretainedrepairvalue;answerwrong/missingprimerconditions.','Usecomplete secondstrand/cycle andEAlesioncards:completesequences,comparecell/PCR,explainbaseexcision/template/ligase/residualerrors,calculate48andcontrols;answerdistinctmismatchandannealingperturbations.','Solvecomplete12-base template/F/R,old/newstrands andall3PCRphases;draw2cycles,explainheat/genome-versus-target andmissingprimers,withoutmandatoryGArepair.','Solvecomplete secondtemplate/K/N/E withends,5′→3′directions and2cycles;calculate64/32.4,adaptK′wrongR andcount6new singlestrands,insteadofexponentialamplification.','Usecomplete24-typeA/B/C/Dtable:independentlytotal46/47/45/69,locatetype21/Xversusfullsets andboundtrait/functioninferences;solvewholeplantvariation. Nomutationnamedinstimulus.','Usecomplete second24-typeT/T2/Rtable:total47/47/46,locatetype18versusfullsets,separateadditionalfindings/basesubstitutionlimit;infer47/extraYfromwholefreshQcard,withouthealthguarantees.']
briefExpectedDe=['U′=ATGCCTAAAGGT,T′=3′-TACGGATTTCCA-5′; lokaleTochterjealt+neu, PCRZyklus1:2,Zyklus2:4mit2ursprünglichenSträngeninsgesamt. F/RverlängerninGegenrichtungenje5′→3′. ReparaturteilundfalscherPrimer/fehlendePrimerwerdenkonkretwieindergezeigtenvollständigenAntwortbegründet.','ZweiteVorlageU′=GCATTACCGAAT,T′=3′-CGTAATGGCTTA-5′; semikonservativeKopieundtechnischeZyklenunterscheiden. EA-Reparaturfolgeund2vs30Läsionenexactbegründet;3×2⁴=48,keinePCR-Allreparatur/Fehlerfreiheitsbehauptung;neueAnlagerungs- undReparaturbedingungengetrennt.','U′=ATGCCTAAAGGT,T′=3′-TACGGATTTCCA-5′. JedeZelltochteralt+neu;PCR1:2,2:4,nur2ursprünglicheSträngebleiben. F/R5′→3′,Wärme/Primer/EnzymmitverschiedenenRollen;ohneStartendenkeineSynthese.','U′=GCATTACCGAAT,T′=3′-CGTAATGGCTTA-5′. NachZyklus1:4,Zyklus2:8beiStart2. K64,NkeinZielohneKontamination,EkeineSynthese;32,4Erwartungswert. FalscherRlagertnachModellnichtan:6neueU-Einzelsträngenach3Zyklen,linear.','A46,B47nurTyp21dreifach=Trisomie21,C45nurXeinfach=MonosomieX,D69ganze3Sätze=Triploidie. Pflanzen5×4=20tetraploid,nichtgleicheMenschenfolge. BestandsbefundalleinbelegtkeinenPhänotyp/keineKrankheit.','T/T247mitTyp18dreifach=Trisomie18,R46XY;keineganzeSatzvermehrung. TnurMerkmal,T2gesonderteFunktion,RtrotznormalerAnzahlBasensubstitution. Q47extraY,keinesichereklinischeDiagnose/gleicheAusprägung.']
briefExpectedEn=['U′=ATGCCTAAAGGT,T′=3′-TACGGATTTCCA-5′;eachcellular daughterold+new,PCRcycle1:2/cycle2:4withonly2originalstrands. F/Rgrowopposed,both5′→3′. Retainedrepairandwrong/missingprimerconditions justifiedinthecompleteworkedanswer.','SecondU′=GCATTACCGAAT,T′=3′-CGTAATGGCTTA-5′;distinguishsemiconservativecopying/technicalcycles. EArepairand2versus30lesionsjustified;3×2⁴=48,neitheruniversalPCRrepairnorperfection;newannealing/repairconditionsseparate.','U′=ATGCCTAAAGGT,T′=3′-TACGGATTTCCA-5′. Eachcellulardaughterold+new;PCR1:2/2:4withonly2originalstrandsretained. F/R5′→3′;heat/primers/enzymehavedifferentroles;nostartends,nosynthesis.','U′=GCATTACCGAAT,T′=3′-CGTAATGGCTTA-5′. Cycles1/2give4/8from2. K64,Nnotargetwithoutcontamination,Enosynthesis;32.4expectation. WrongRcannotannealundertherule:6newU singlestrandsafter3cycles,linear.','A46;B47onlytype21tripled=trisomy21;C45onlyXsingle=monosomyX;D69whole3sets=triploidy. Plant5×4=20tetraploid,nofixedhumaneffect. Complementalonedemonstratesneitheractualphenotypenordisease.','T/T247withtype18tripled=trisomy18;R46XY,nofullsetincrease. Thasonlytrait,T2separatefunction,Rnormalcountyetbasesubstitution. Q47extraY,nocertainclinicaldiagnosis/universalexpression.']
bi=0
for i in affected:
    e=materials['entries'][i]
    e['wholeProfile']['expectations'][0]['observablePerformanceDe']=('Ergänzt tatsächliche alte/neuekomplementäreStränge mitEnden, vergleicht semikonservativeZellkopie mitDenaturieren→Anlagern→5′→3′-Verlängern in2PCR-Zyklen undadaptiertAnlagerungsfehler.' if i!=22 else 'Zählt selbst alle1–22/X/Y-Typen inganzenStimuli, lokalisiertEinzeltyp-/Satzänderungen undleitetMutationstypen ohnevorgegebeneDiagnoselabelsab.')
    e['wholeProfile']['expectations'][0]['observablePerformanceEn']=('Completes actualold/newcomplementarystrands/ends,comparessemiconservativecellcopying withdenature→anneal→5′→3′extension across2PCRcycles andadaptsannealingfailures.' if i!=22 else 'Independentlycountsall1–22/X/Ytypes inwholestimuli,locatesindividual-type/setchanges andinfersmutationtypes withoutsupplieddiagnosticlabels.')
    for j,c in enumerate(e['newAuthoredWholeCases']):
        brief=e['wholeProfile']['applicationCaseBriefs'][j]
        brief['taskDemandDe']='Vollständiges endliches Material undAufgabe: '+str(mp)+'#/entries/'+str(i)+'/newAuthoredWholeCases/'+str(j)+'. '+briefTaskDe[bi]
        brief['taskDemandEn']='Complete finite material/task: '+str(mp)+'#/entries/'+str(i)+'/newAuthoredWholeCases/'+str(j)+'. '+briefTaskEn[bi]
        brief['expectedPerformanceDe']=briefExpectedDe[bi]
        brief['expectedPerformanceEn']=briefExpectedEn[bi]
        c['rubricReference']['path']=str(B/'whole21-pair-level-rubric-references.v3.author-candidate.json')
        c['rubric'][0]['criterionDe']=e['wholeProfile']['expectations'][0]['observablePerformanceDe']
        c['rubric'][0]['criterionEn']=e['wholeProfile']['expectations'][0]['observablePerformanceEn']
        c['targetedMaterialSuccessorOf']={'path':str(V2/'twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json'),'pointer':'/entries/'+str(i)+'/newAuthoredWholeCases/'+str(j),'originalPreserved':True}
        bi+=1
materials['role']='Whole23 author-v3: exactly3 material/profile remedies with6 complete DEEN cases;20 other whole goal/profile/case entries exactv2 reuse; no newgoal/source/imagechange'
materials['createdAt']=STAMP
write(mp.name,materials)
pairs=read(V2/'whole21-pair-level-rubric-references.author-candidate.json')
for r in pairs['entries']:
    if r['goalId'] in [materials['entries'][i]['goalId'] for i in affected]:
        e=next(e for e in materials['entries'] if e['goalId']==r['goalId']);r['criteria']=copy.deepcopy(e['newAuthoredWholeCases'][0]['rubric'])
write('whole21-pair-level-rubric-references.v3.author-candidate.json',pairs)
cand=read(V2/'twenty-three-whole-positive-profile-candidate-set.v2.author.json');cand['reviewId']='biologie-molecular-genetics-twenty-three-whole-author-remediation-v3';cand['reviewedAt']=STAMP
for i in affected:cand['goals'][i]['profile']=copy.deepcopy(materials['entries'][i]['wholeProfile'])
write('twenty-three-whole-positive-profile-candidate-set.v3.author.json',cand)
conf=read(V2/'twenty-three-whole-positive.v2.author-candidate.config.json');conf['reviewId']=cand['reviewId'];conf['reviewPath']=str(B/'twenty-three-whole-positive.v3.author-candidate.review.jsonl');conf['scope']['label']='Whole23 current author successor; targeted3 concrete material remedies; current native/source/AM/V independent approval pending'
write('twenty-three-whole-positive.v3.author-candidate.config.json',conf)
schema=read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');v=jsonschema.Draft202012Validator({'$ref':'#/$defs/profile','$defs':schema['$defs']})
errors=[{'goalId':r['goalId'],'path':str(e.path),'message':e.message} for r in cand['goals'] for e in v.iter_errors(r['profile'])];assert not errors,errors
assert [i for i in range(23) if old['entries'][i]['wholeProfile']!=materials['entries'][i]['wholeProfile']]==list(affected)
for i in range(23):
    assert old['entries'][i]['wholeCurrentGoal']==materials['entries'][i]['wholeCurrentGoal']
    if i not in affected:assert old['entries'][i]==materials['entries'][i]
    if 'exactHistoricalWholeCases' in old['entries'][i]:assert old['entries'][i]['exactHistoricalWholeCases']==materials['entries'][i]['exactHistoricalWholeCases']
assert [sum(ds.values()) for ds in data1.values()]==[46,47,45,69]
assert [sum(ds.values()) for ds in data2.values()]==[47,47,46]
assert sum(fresh2['Q'].values())==47
complement=str.maketrans('ATGC','TACG')
for u,t,f,r in [('ATGCCTAAAGGT','TACGGATTTCCA','ATG','ACC'),('GCATTACCGAAT','CGTAATGGCTTA','GCA','ATT')]:
    assert u.translate(complement)==t and u[:3]==f and u[-3:].translate(complement)[::-1]==r
write('exact-three-profile-six-case-remedy-and-complete-model-check.actual.json',{'schemaVersion':1,'affectedGoalIds':[materials['entries'][i]['goalId'] for i in affected],'changedProfiles':3,'changedCompleteBilingualCases':6,'other20WholeEntriesValueExactV2':True,'wholeCurrentGoalDEEN23ValueExactV2':True,'originalSourceDuties38AndPartners44RemainOriginalInputs':True,'fourHistoricalWholeCasesExact':True,'EARepairFacetOriginalLiteralTextsKept':True,'GANoRepairRequirement':True,'ordinaryProfileSchemaErrors':errors,'sequenceComplementAndPrimerOrientationActualPassed':True,'completeChromosomeTypeTotals':{'A':46,'B':47,'C':45,'D':69,'T':47,'T2':47,'R':46,'Q':47},'noPatientData':True,'actualExperimentPerformed':False,'independentReviewsPending':True,'strictGain':0,'activeWrites':False})
print(json.dumps({'profiles':23,'targetedProfiles':3,'completeDEENCases':6,'other20Exact':True,'schemaErrors':len(errors),'strictGain':0}))
