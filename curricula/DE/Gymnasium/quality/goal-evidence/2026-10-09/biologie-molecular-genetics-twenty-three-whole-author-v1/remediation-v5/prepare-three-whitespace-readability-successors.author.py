from pathlib import Path
import json, copy, re, hashlib, datetime

B = Path(__file__).resolve().parent.relative_to(Path.cwd().resolve())
S = B.parent
def read(p): return json.loads(Path(p).read_text())
def bind(p):
    p=Path(p); z=p.read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def write(n,x):
    p=B/n; p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n'); return p
old=read(S/'remediation-v4/twenty-three-whole46-bilingual-cases-and-P.v4.author-candidate.json')
out=copy.deepcopy(old)
fixes='''actualold|actual old
newcomplementarystrands|new complementary strands
comparessemiconservativecellcopying|compares semiconservative cell copying
withdenature|with denature
andadaptsannealingfailures|and adapts annealing failures
Usecomplete|Use complete
drawold|draw old
orderdenature|order denature
explainthermostability|explain thermostability
andretainedrepairvalue|and retained repair value
answerwrong|answer wrong
missingprimerconditions|missing primer conditions
eachcellular|each cellular
daughterold|daughter old
originalstrands|original strands
growopposed|grow opposed
Retainedrepairandwrong|Retained repair and wrong
justifiedinthecompleteworkedanswer|justified in the complete worked answer
secondstrand|second strand
completesequences|complete sequences
comparecell|compare cell
explainbaseexcision|explain base excision
residualerrors|residual errors
andcontrols|and controls
answerdistinctmismatchandannealingperturbations|answer distinct mismatch and annealing perturbations
distinguishsemiconservativecopying|distinguish semiconservative copying
technicalcycles|technical cycles
lesionsjustified|lesions justified
neitheruniversal|neither universal
repairnorperfection|repair nor perfection
newannealing|new annealing
repairconditionsseparate|repair conditions separate
Solvecomplete|Solve complete
newstrands|new strands
explainheat|explain heat
andmissingprimers|and missing primers
withoutmandatory|without mandatory
Eachcellulardaughterold|Each cellular daughter old
retained|retained
enzymehavedifferentroles|enzyme have different roles
nostartends|no start ends
nosynthesis|no synthesis
secondtemplate|second template
withends|with ends
insteadofexponentialamplification|instead of exponential amplification
singlestrands|single strands
give|give
notargetwithoutcontamination|no target without contamination
Wrong|Wrong
cannotannealundertherule|cannot anneal under the rule
Independentlycountsall|Independently counts all
inwholestimuli|in whole stimuli
locatesindividual|locates individual
setchanges|set changes
andinfersmutationtypes|and infers mutation types
withoutsupplieddiagnosticlabels|without supplied diagnostic labels
independentlytotal|independently total
locatetype|locate type
versusfullsets|versus full sets
andboundtrait|and bound trait
functioninferences|function inferences
solvewholeplantvariation|solve whole plant variation
Nomutationnamedinstimulus|No mutation named in stimulus
onlytype|only type
only|only
fullsets|full sets
nofixedhumaneffect|no fixed human effect
Complementalonedemonstratesneitheractualphenotypenordisease|Complement alone demonstrates neither actual phenotype nor disease
separateadditionalfindings|separate additional findings
basesubstitutionlimit|base substitution limit
withouthealthguarantees|without health guarantees
nofullsetincrease|no full set increase
Thasonlytrait|T has only trait
separatefunction|separate function
normalcountyetbasesubstitution|normal count yet base substitution
nocertainclinicaldiagnosis|no certain clinical diagnosis
universalexpression|universal expression
andone|and one
onprimer|on primer
withone|with one
andideal|and ideal
andboth|and both
inboth|in both
aftercycles|after cycles
andthe|and the
fromthe|from the
addmandatory|add mandatory
tothe|to the
inright|in right
withfree|with free
andretain|and retain
eachwithone|each with one
retainone|retain one
plusone|plus one
containone|contain one
butnot|but not
anoriginal|an original
andthermostability|and thermostability
froma|from a
norevery|nor every
buttemplates|but templates
andpolymerase|and polymerase
andpredict|and predict
ornodoubling|or no doubling
notprovided|not provided
inthis|in this
withno|with no
inthe|in the
bothprimers|both primers
andenzyme|and enzyme
hasnotemplate|has no template
nopolymerase|no polymerase
Inacell|In a cell
andcompleted|and completed
eachcontainone|each contain one
Allcounts|All counts
andcompare|and compare
andbound|and bound
insynthesis|in synthesis
eachwithanew|each with a new
arealso|are also
butgenome|but genome
isnot|is not
withthe|with the
onlynew|only new
ratherthan|rather than
allowsno|allows no
henceno|hence no
copieseachofthe|copies each of the
oncepercycle|once per cycle
onconditions|on conditions
noactual|no actual
forall|for all
inaconstructed|in a constructed
Eachnumber|Each number
ofthattype|of that type
meansabsent|means absent
areincluded|are included
withnomutation|with no mutation
isthe|is the
isnota|is not a
arenot|are not
eachtype|each type
anddistinguish|and distinguish
versuswhole|versus whole
Discusspossible|Discuss possible
butseparate|but separate
anddisease|and disease
noextra|no extra
instead|instead
hencetrisomy|hence trisomy
hencemonosomy|hence monosomy
Bothareaneuploidies|Both are aneuploidies
notwhole|not whole
andthree|and three
hencetriploidy|hence triploidy
apolyploid|a polyploid
hasfive|has five
ofeach|of each
Newline|New line
nomutation|no mutation
whatidentical|what identical
iscertainly|is certainly
allfive|all five
fourcomplete|four complete
Asecond|A second
againalltypes|again all types
andwholechromosomes|and whole chromosomes
onlyanexternaltrait|only an external trait
nofunctionfinding|no function finding
alsoaseparate|also a separate
functionfinding|function finding
asuppliedbase|a supplied base
Noactual|No actual
Count|Count
thedifferenttype|the different type
andjustify|and justify
andfunction|and function
Explainpossible|Explain possible
andresolutionlimits|and resolution limits
acounted|a counted
auniversal|a universal
clinicaldiagnosis|clinical diagnosis
hasthreecopies|has three copies
allothertypes|all other types
nottriploidy|not triploidy
against|against
alltypes|all types
andevaluate|and evaluate
ineveryperson|in every person
Noadditionalfindings|No additional findings
oneextra|one extra
comparedwith|compared with
notamultiplication|not a multiplication
ofalltypes|of all types
hencesex|hence sex
semikonservativeZellkopie|semikonservative Zellkopie
neuekomplementäreStränge|neue komplementäre Stränge
undadaptiertAnlagerungsfehler|und adaptiert Anlagerungsfehler
lokaleTochterjealt|lokale Tochter je alt
verlängerninGegenrichtungenje|verlängern in Gegenrichtungen je
fehlendePrimerwerdenkonkretwieindergezeigtenvollständigenAntwortbegründet|fehlende Primer werden konkret wie in der gezeigten vollständigen Antwort begründet
Läsionenexactbegründet|Läsionen exact begründet
semikonservativeKopieundtechnischeZyklenunterscheiden|semikonservative Kopie und technische Zyklen unterscheiden
ursprünglicheSträngebleiben|ursprüngliche Stränge bleiben
ohneStartendenkeineSynthese|ohne Startenden keine Synthese
EnzymmitverschiedenenRollen|Enzym mit verschiedenen Rollen
NkeinZielohneKontamination|N kein Ziel ohne Kontamination
FalscherRlagertnachModellnichtan|Falscher R lagert nach Modell nicht an
BestandsbefundalleinbelegtkeinenPhänotyp|Bestandsbefund allein belegt keinen Phänotyp
RtrotznormalerAnzahlBasensubstitution|R trotz normaler Anzahl Basensubstitution
keinesichereklinischeDiagnose|keine sichere klinische Diagnose
keineganzeSatzvermehrung|keine ganze Satzvermehrung
ohnevorgegebeneDiagnoselabelsab|ohne vorgegebene Diagnoselabels ab
semikonservative|semikonservative
mitje|mit je
undeinem|und einem
undeinen|und einen
auseinem|aus einem
derzwei|der zwei
undbehalten|und behalten
undbegründe|und begründe
undkeine|und keine
undvergleiche|und vergleiche
undvollständige|und vollständige
fehltjede|fehlt jede
Töchterje|Töchter je
tragenje|tragen je
Töchterebenfalls|Töchter ebenfalls
demrechten|dem rechten
vonlinks|von links
nachrechts|nach rechts
einschließlichseines|einschließlich seines
dergegebenen|der gegebenen
kopiertjede|kopiert jede
Vorlagenje|Vorlagen je
allein|allein
bedeutetabwesend|bedeutet abwesend
sinderfasst|sind erfasst
istvorgegeben|ist vorgegeben
alsgegebenen|als gegebenen
istkein|ist kein
sindnicht|sind nicht
diejeweiligen|die jeweiligen
undunterscheide|und unterscheide
abertrenne|aber trenne
sindAneuploidien|sind Aneuploidien
welchegleiche|welche gleiche
sicherbelegt|sicher belegt
weiterhinalle|weiterhin alle
wirdalsvergleichbarer|wird als vergleichbarer
Bestandgegeben|Bestand gegeben
istnamentlich|ist namentlich
nuräußerliches|nur äußerliches
zusätzlichgesondert|zusätzlich gesondert
zusätzlichgegebene|zusätzlich gegebene
Keineechten|Keine echten
istkeineuniverselle|ist keine universelle
übrigeTypenwie|übrige Typen wie
keineVermehrungallerTypen|keine Vermehrung aller Typen
mehrals|mehr als
dieganzezweite|die ganze zweite
dieganze|die ganze
diegegebenen|die gegebenen
denunveränderten|den unveränderten
dievollständigen|die vollständigen
dievollständige|die vollständige
diezweitevollständige|die zweite vollständige
denabweichenden|den abweichenden
inganzen|in ganzen
undklassifiziere|und klassifiziere
undprüfe|und prüfe
leiteausganzerneuer|leite aus ganzer neuer
zumgleichen|zum gleichen
beimMenschen|beim Menschen
stattExponentialamplifikation|statt Exponentialamplifikation
newcomplementary|new complementary
PCRcycles|PCR cycles
PCRcycle|PCR cycle
PCRphases|PCR phases
EArepairand|EA repair and
EArepair|EA repair
EAlesioncards|EA lesion cards
PCRrepair|PCR repair
withonly|with only
Rgrow|R grow
onecycle|one cycle
thanexponential|than exponential
thantwo|than two
Reparaturteilundfalscher|Reparaturteil und falscher
Strängeninsgesamt|Strängen insgesamt
Rverlängern|R verlängern
Reparaturfolgeund|Reparaturfolge und
Reparaturbedingungengetrennt|Reparaturbedingungen getrennt
undfehlende|und fehlende
undzähle|und zähle
undcount|und count
andcount|and count
Ekeine|E keine
Nno|N no
Eno|E no
Rcannot|R cannot
Einzelsträngenach|Einzelstränge nach
strandsafter|strands after
Xvsganze|X vs ganze
Xversus|X versus
vsganze|vs ganze
Rtable|R table
Dtable|D table
Xsingle|X single
Xeinfach|X einfach
nichtgleiche|nicht gleiche
mitfalschem|mit falschem
K′mit|K′ mit
K′wrong|K′ wrong
withtype|with type
Rnormal|R normal
Tnur|T nur
sowieganze|sowie ganze
undbeziehe|und beziehe
sindim|sind im
Materialnichtvorgegeben|Material nicht vorgegeben
Yab|Y ab
Yfromwholefresh|Y from whole fresh
Qcard|Q card
und leitet|und leitet
undleitet|und leitet
T/T247|T/T2 47
evaluate“|evaluate “
3′extension|3′ extension
3′directions|3′ directions
PCRZyklus|PCR Zyklus
Zelltochteralt|Zelltochter alt
prüfefehlende|prüfe fehlende
strandsretained|strands retained
undein|und ein
enthaltenje|enthalten je
jealt|je alt
daher2n|daher 2n
undganze|und ganze
Aussagenzu|Aussagen zu
einegezählte|eine gezählte
Ymehr|Y mehr'''
pairs=[x.split('|',1) for x in fixes.splitlines() if x.strip()]
pairs.sort(key=lambda x:len(x[0]),reverse=True)
assert all(re.sub(r'\s','',a)==re.sub(r'\s','',b) for a,b in pairs)
def spacing(s):
    # File/pointer identifiers are exact input bindings, not prose.
    paths=[]
    def hold(m): paths.append(m[0]);return '⟦'+str(len(paths)-1)+'⟧'
    s=re.sub(r'curricula/[^\s]+',hold,s)
    s=s.replace('T/T247','T/T2 47')
    # Keep exact source/table identifiers and ploidy notation intact.
    s=re.sub(r'T2|2n',hold,s)
    for a,b in pairs:s=s.replace(a,b)
    s=re.sub(r'(?<=[a-zäöüß])(?=[A-ZÄÖÜ])',' ',s)
    s=re.sub(r'(?<=[A-Za-zäöüÄÖÜß])(?=[0-9])',' ',s)
    s=re.sub(r'(?<=[0-9])(?=[A-Za-zäöüÄÖÜß])',' ',s)
    s=re.sub(r'([;:])(?=[^\s])',r'\1 ',s)
    s=re.sub(r',(?=[^\s0-9])',', ',s)
    s=re.sub(r'(?<![0-9]),(?=[0-9])',', ',s)
    for a,b in pairs:s=s.replace(a,b)
    for i,p in enumerate(paths):s=s.replace('⟦'+str(i)+'⟧',p)
    s=s.replace('T2gesonderte','T2 gesonderte').replace('T2separate','T2 separate').replace('daher2n','daher 2n').replace('1: 2,2: 4','1: 2, 2: 4')
    return s
deltas=[]
def walk(a,path):
    if isinstance(a,dict):
        for k,v in a.items():
            if isinstance(v,str) and k.endswith(('De','En')):
                z=spacing(v)
                assert re.sub(r'\s','',z)==re.sub(r'\s','',v),(path,k)
                if z!=v:deltas.append({'pointer':path+'/'+k,'before':v,'after':z,'onlyWhitespaceChanged':True})
                a[k]=z
            elif isinstance(v,(dict,list)):walk(v,path+'/'+k)
    elif isinstance(a,list):
        for i,v in enumerate(a):walk(v,path+'/'+str(i))
for i in (11,21,22):
    walk(out['entries'][i]['wholeProfile'],'/entries/'+str(i)+'/wholeProfile')
    walk(out['entries'][i]['newAuthoredWholeCases'],'/entries/'+str(i)+'/newAuthoredWholeCases')
for i in range(23):
    assert out['entries'][i]['wholeCurrentGoal']==old['entries'][i]['wholeCurrentGoal']
    if i not in (11,21,22):assert out['entries'][i]==old['entries'][i]
assert out['exactHistoricalWholeCases']==old['exactHistoricalWholeCases']
for i in (11,21,22):
    for j in range(2):
        a=old['entries'][i]['newAuthoredWholeCases'][j];b=out['entries'][i]['newAuthoredWholeCases'][j]
        for k in ('completeChromosomeCountStimulus','corePrerequisiteExactBinding','freshCompleteChromosomeCountStimulus'):
            if k in a:assert a[k]==b[k]
write('twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json',out)
cs=read(S/'remediation-v4/twenty-three-whole-positive-profile-candidate-set.v4.author.json')
cs['reviewId']='biologie-molecular-genetics-twenty-three-whole-author-remediation-v5'
for row in cs['goals']:
    e=next(x for x in out['entries'] if x['goalId']==row['goalId']);row['profile']=copy.deepcopy(e['wholeProfile'])
write('twenty-three-whole-positive-profile-candidate-set.v5.author.json',cs)
cfg=read(S/'remediation-v4/twenty-three-whole-positive.v4.author-candidate.config.json')
cfg['reviewId']='biologie-molecular-genetics-twenty-three-whole-author-remediation-v5'
cfg['reviewPath']=str(B/'twenty-three-whole-positive.v5.author-candidate.review.jsonl')
cfg['scope']['label']='Whole23 author whitespace-only successor for exactly three profiles and six cases; scientific content unchanged; independent current reviews pending'
write('twenty-three-whole-positive.v5.author-candidate.config.json',cfg)
write('exact-three-goal-six-case-whitespace-only-delta.actual.json',{'schemaVersion':1,'before':bind(S/'remediation-v4/twenty-three-whole46-bilingual-cases-and-P.v4.author-candidate.json'),'after':bind(B/'twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json'),'changedGoalIds':[out['entries'][i]['goalId'] for i in (11,21,22)],'changedTextFields':deltas,'everyChangedTextIdenticalAfterRemovingWhitespace':True,'other20WholeEntriesExactV4':True,'all23WholeGoalsExactV4':True,'completeMatricesNumbersSequencesConditionsAndEAGAScopeUnchanged':True,'historicalFourCasesExact':True,'strictGain':0,'activeWrites':0})
write('GA-helper-material-only-reference-current-profile-authority.actual.json',{'schemaVersion':1,'legacyStandaloneHelper':bind(S/'remediation-v3/finite-GA-two-complete-strand-and-cycle-models.DEEN.author-material.json'),'referenceRole':'Historical finite material/strand/cycle input only. Its older rubric criteria and pair reference are not current profile authority, reviewer decisions or approval.','currentWholeGAProfilePointer':str(B/'twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json')+'#/entries/21/wholeProfile','currentSixCasesPointers':[str(B/'twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json')+'#/entries/'+str(i)+'/newAuthoredWholeCases/'+str(j) for i in (11,21,22) for j in (0,1)],'legacyHelperBytesPreserved':True,'independentCurrentNativeP':'pending','strictGain':0,'activeWrites':0})
print(json.dumps({'changedTextFields':len(deltas),'whitespaceOnly':True,'other20Exact':True,'goalsUnchanged':23}))
