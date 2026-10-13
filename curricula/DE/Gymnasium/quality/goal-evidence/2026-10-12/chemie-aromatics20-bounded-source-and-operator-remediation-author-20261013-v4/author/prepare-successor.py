"""Apache-2.0. Bounded author proposals; teaching cases CC-BY-4.0.
No live adoption, whole-source clearance or independent scientific vote.
"""
from pathlib import Path
import copy, datetime, hashlib, json, os, shutil, stat, subprocess

R=Path('/home/enpasos/projects/skillpilot')
NAME='chemie-aromatics20-bounded-source-and-operator-remediation-author-20261013-v4'
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
O=E/NAME
B=E/'chemie-aromatics-dyes20-current231-scientific-author-20261013-v1'
I=E/'chemie-aromatics-three-missing-raster-author-20261013-v2'
J=E/'chemie-e594-three-ring-vertex-correction-raster-author-20261013-v4'
C=R/'tmp'/NAME/'private-parent'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(p): return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def objhash(x): return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rel(p): return str(Path(p).relative_to(R))
def read(p): return json.loads(Path(p).read_text())
def safe(p):
    p=Path(p)
    for q in [p,*p.parents]:
        if q.exists() or q.is_symlink():
            s=q.lstat()
            assert not stat.S_ISLNK(s.st_mode), str(q)
            if q==p and q.is_file(): assert s.st_nlink==1, str(q)
    p.parent.mkdir(parents=True,exist_ok=True)
    return p
def write(p,d): safe(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def cp(a,b): safe(b);shutil.copyfile(a,b);assert digest(a)==digest(b)
def binding(p): return dict(path=rel(p),sha256=digest(p))

base=read(B/'AUTHOR.future-inputs.additive.json'); ids=base['goalIds']
canpath=R/base['canonicalInputBinding']['path']; assert digest(canpath)==base['canonicalInputBinding']['sha256']
can=read(canpath); live=copy.deepcopy(can); goals={g['id']:g for g in can['goals']}
holds=read(B/'author/HOLDS.exact-source-stage-operator-and-V.author.json')['findings']
inventory=read(B/'author/current20.literal-source-witness-inventory.json')
guardpaths={str(canpath),str(R/base['claimInputBinding']['path'])}
for f in holds: guardpaths.update(str(R/f[k]) for k in ['extractionPath','mappingPath']);guardpaths.add(str(R/f['sourceDocument']['path']))
for b in inventory['inputBindings']+inventory['sourceReceiptInputBindings']: guardpaths.add(str(R/b['path']))
for old in [B,I,J]:
    guardpaths.update(str(p) for p in old.rglob('*') if p.is_file())
for n in ['chemie-aromatics-three-actual-V-fresh-independent-20261013-v3','chemie-e594-vertex-corrected-actual-V-fresh-independent-20261013-v5']:
    guardpaths.update(str(p) for p in (E/n).glob('FINAL.*.json'))
guards=[binding(Path(p)) for p in sorted(guardpaths)]
write(O/'inputs/actual-initial-parent-CAS.json',dict(schemaVersion=1,atUTC=NOW,bindings=guards,canonicalNodes=len(can['goals']),curricularAtomic=402,currentStrictSupplied=231))

# Reread the actual page text, retaining only narrow relevant lines and exact page identity.
pages=[(0,48,['Leistungskurs','Struktur ausgewählter','Chromatografie, Rf-Werte','Absorptionsspektrum','ohne','elektrophile Erstsubstitution']),
       (0,49,['Leistungskurs','Untersuchungen','chromatografische Untersuchung','mögliche Beiträge','beschreiben, wie sich']),
       (4,26,['nur erhöhtes','mesomere Grenzformeln']), (5,20,['Schuljahrgänge 7/8','Farbstoffgemisch','Verbindliche Schülerexperimente','Chromatografie']),
       (6,22,['Sek. I','Säure-Base-Reaktionen','Protonenübertragung, pH-Wert und Indikatoren','Kontexten']),
       (7,25,['Klasse 9','SE: Nachweis der Hydroxid','Begriff Indikator','Anzeiger']),
       (8,29,['saure, alkalische und neutrale Lösungen','Prüfen verschiedener Lösungen','pH-Wert als Maß','pH-Skala']),
       (9,24,['Lernbereich 5','experimentelles Untersuchen von sauren','Lösungen mit Indikatoren','SE']),
       (10,27,['Klassenstufe 9','Lernbereich 1','experimentelles Untersuchen von Lösungen','mit Indikatoren','SE']),
       (11,27,['Schuljahrgänge 7/8','Farbänderung von Indikatoren','erklären']),
       (12,26,['Schuljahrgänge 7/8','Farbänderung von Indikatoren','Ionen erklären','Indikatoren experimentell prüfen']),
       (14,23,['2.1.1.6','charakteristische Färbung','im Schülerexperiment','Calciumhydroxid-Lösung','untersuchen']),
       (16,24,['2.1.1.7','im Schülerexperiment','Neutralisation mit Farbindikator']),
       (17,47,['6.2 organische','Grundfach (Fundamentum)','Leistungsfach (Additum)','Azofarbstoffe und Mechanismus','Synthese','weitere Farbstoffklassen','mechanistische Betrachtungen','wendig','Triphenylmethanfarbstoffe','Anthocyane'])]
primary=[]
for i,p,terms in pages:
    src=R/holds[i]['sourceDocument']['path']
    t=subprocess.check_output(['pdftotext','-f',str(p),'-l',str(p),'-layout',str(src),'-']).decode()
    selected=[dict(line1Based=k+1,text=s.rstrip()) for k,s in enumerate(t.splitlines()) if any(q.casefold() in s.casefold() for q in terms)]
    primary.append(dict(source=binding(src),physicalPDFPage=p,pageTextSHA256='sha256:'+hashlib.sha256(t.encode()).hexdigest(),selectedLines=selected,method='actual pdftotext -layout physical-page read; exact printed labels retained; layout fragments are not authored operators'))
he=R/'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'
ht=subprocess.check_output(['pdftotext','-f','43','-l','43','-layout',str(he),'-']).decode()
primary.append(dict(source=binding(he),physicalPDFPage=43,selectedLines=[dict(line1Based=i+1,text=s.rstrip()) for i,s in enumerate(ht.splitlines()) if any(q in s for q in ['grundlegendes','erhöhtes','Toluol','Phenol','Anilin','Nitrobenzen','Zweitsubstitution','induktive'])]))
by=R/holds[18]['sourceDocument']['path']; bg=read(by)['goals']; bx=read(R/holds[18]['extractionPath'])
byselected=[]
for row in inventory['wholeSourceGoalRowsAndPassages']:
    if row['jurisdiction']!='DE-BY':continue
    g=row['sourceGoal']; occurrences=g.get('sourceOccurrences',[dict(sourceGoalId=g['id'],sourceSpan=g.get('sourceSpan'),courseLevel=g.get('courseLevel'))])
    actual=[]
    for occurrence in occurrences:
        matches=[x for x in bg if x['id']==occurrence['sourceGoalId']];assert len(matches)==1
        assert matches[0]['description']==g['rawSourceText']
        actual.append(dict(**occurrence,actualPrimaryDescription=matches[0]['description']))
    byselected.append(dict(sourceGoalId=g['id'],rawSourceText=g['rawSourceText'],actualPrimaryOccurrences=actual))
primary.append(dict(source=binding(by),actualSelectedPrimaryGoalRows=byselected,method='actual original government export IDs/descriptions, occurrence-level course labels retained'))
write(O/'inputs/actual-primary-page-and-BY-occurrence-reads.json',dict(schemaVersion=1,readAtUTC=NOW,receipts=primary,RPActualPhysicalAndPrintedPage=47,rawLiteralNeverEquivalentToDerivedDescriptor=True,unreadOtherSourcesNotApproved=True))

# Narrow source literal/context annotations. Source IDs and primary bytes never change.
literal={
4: ('mesomere Grenzformeln der Peptidgruppe',26,'printed26; HH1.3 only increased level'),
5: ('Farbstoffgemisch chromatografisch trennen',20,'printed20; ST school years7/8; compulsory pupil chromatography'),
6: ('Säure-Base-Reaktionen als Protonenübertragung, pH-Wert und Indikatoren',22,'printed22; HH SekI binding content; everyday contexts are examples'),
7: ('SE: Nachweis der Hydroxid-Ionen; Begriff Indikator; Indikatoren als Anzeiger von Ionen verwenden.',25,'printed21; MV class9; pupil experiment plus content and guidance columns'),
8: ('saure, alkalische und neutrale Lösungen; SE: Prüfen verschiedener Lösungen mit Indikatoren; pH-Wert als Maß für saure, alkalische und neutrale Lösungen; pH-Skala',29,'printed25; MV class9; separate content and pupil-experiment lines; existing S24 locator incomplete'),
9: ('experimentelles Untersuchen von sauren Lösungen mit Indikatoren',24,'printed12; SN class8 LB5; SE explicitly indicated'),
10: ('Kennen der sauren, basischen oder neutralen Eigenschaft von Lösungen; experimentelles Untersuchen von Lösungen mit Indikatoren',27,'printed15; SN class9 LB1; SE explicitly indicated'),
11: ('Farbänderung von Indikatoren mit dem Überschuss an Hydroxid-Ionen erklären',27,'printed27; ST school years7/8 Sachkompetenz'),
12: ('Farbänderung von Indikatoren mit dem Überschuss an Wasserstoff-Ionen erklären',26,'printed26; ST school years7/8 Sachkompetenz; historical source term retained'),
13: ('saure Lösungen mit unterschiedlichen Indikatoren experimentell prüfen',26,'printed26; ST school years7/8 Erkenntnisgewinnungskompetenz'),
14: ('Eigenschaften basischer Lösungen nennen: charakteristische Färbung von Indikatoren (pH-Wert > 7)',23,'printed18; TH classes7/8; parent operator plus indented content'),
15: ('im Schülerexperiment: Calciumhydroxid-Lösung ausgehend von Calcium herstellen und mit Indikator untersuchen',23,'printed18; TH classes7/8'),
16: ('im Schülerexperiment: eine Neutralisation mit Farbindikator durchführen',24,'printed19; TH classes7/8'),
17: ('mindestens zwei weitere Farbstoffklassen (mechanistische Betrachtungen nicht notwendig), z. B. Triphenylmethanfarbstoffe, Anthocyane …',47,'printed47; RP6.2 elective Leistungsfach Additum; mechanism explicitly not necessary')}
exparents={f['extractionPath']:read(R/f['extractionPath']) for f in holds[:18]}
exnew=copy.deepcopy(exparents); exdelta=[]
for i,f in enumerate(holds[:18]):
    d=exnew[f['extractionPath']];g=next(x for x in d['sourceGoals'] if x['id']==f['sourceGoalId']); before=copy.deepcopy(g)
    raw,page,context=literal.get(i,(g['sourceText'],48,'printed48; BB/BE3.2.7 Leistungskurs only'))
    # Semicolon-joined clauses remain visibly clause collections, never alleged verbatim single sentences.
    g['rawSourceText']=raw;g['rawSourceSpan']=f'Physical PDF page{page}; {context}'
    g.setdefault('metadata',{})['aromatics20AuthorLiteralContext']={
        'status':'author_candidate_needs_independent_review','sourceTextRole':'existing derived extraction descriptor retained; consult rawSourceText and primary locator for literal scope',
        'rawTextRole':'normalized primary clause collection, with semicolons only between separate literal clauses; no invented assessed operator',
        'primaryDocumentSHA256':digest(R/f['sourceDocument']['path']),'physicalPDFPage':page,'scopeContext':context,'wholeSourceUnionApproved':False}
    if i in [0,1,2,3]:g['courseLevel']='LK';g['tags']=[t for t in g.get('tags',[]) if not t.startswith('courseLevel:')]+['courseLevel:LK']
    if i==8:
        g['sourceRef']='Rahmenplan Chemie MV2021,Klasse9,Säuren und saure Lösungen,physical PDF29/printed25'
        g['sourceSpan']='Klasse9,Säuren und saure Lösungen,saure/alkalische/neutrale Lösungen und pH; physical PDF29/printed25'
    if i==17:g['sourceRef']='RP-CH-SEKII-2022,6.2,physical PDF47/printed47,Leistungsfach Additum';g['courseLevel']='LK'
    exdelta.append(dict(extractionPath=f['extractionPath'],sourceGoalId=g['id'],before=before,after=copy.deepcopy(g)))
# The entire BB/BE3.2.7 table is explicitly LK; retain IDs and existing descriptors, annotate all12 rows.
for p,d in exnew.items():
    if '/BB/' in p or '/BE/' in p:
        for g in d['sourceGoals']:
            if g.get('topicCode')!='3.2.7' or any(x['sourceGoalId']==g['id'] for x in exdelta):continue
            before=copy.deepcopy(g);g['courseLevel']='LK';g['tags']=[t for t in g.get('tags',[]) if not t.startswith('courseLevel:')]+['courseLevel:LK']
            g.setdefault('metadata',{})['aromatics20AuthorScope']={'status':'author_candidate_needs_independent_review','literalHeader':'Leistungskurs','physicalPDFPage':48,'scopeInference':'literal table header, not canonical phase or authored-view fallback','fullTargetBodyEntitlement':False}
            exdelta.append(dict(extractionPath=p,sourceGoalId=g['id'],before=before,after=copy.deepcopy(g)))

mappingparents={f['mappingPath']:read(R/f['mappingPath']) for f in holds[:18]};mappingnew=copy.deepcopy(mappingparents); patches=[]
for f in holds[:18]:
    d=mappingnew[f['mappingPath']];sid=f['sourceGoalId'];removed=set(f['boundedTargetGoalIds']);before=next(copy.deepcopy(x) for x in d['decisions'] if x['sourceGoalId']==sid)
    edges=[copy.deepcopy(x) for x in d['mappings'] if x['legacyGoalId']==sid and x['canonicalGoalId'] in removed];assert len(edges)==len(removed)
    d['mappings']=[x for x in d['mappings'] if not(x['legacyGoalId']==sid and x['canonicalGoalId'] in removed)]
    after=next(x for x in d['decisions'] if x['sourceGoalId']==sid);after['canonicalGoalIds']=[x for x in after['canonicalGoalIds'] if x not in removed]
    assert after['canonicalGoalIds']
    after['rationale']='Bounded author correction of unsupported components only: '+f['reasonDe']+' Remaining partner components are retained, not scientifically approved or declared a complete union.'
    after['authorComponentProposal']={'status':'needs_independent_review','removedCanonicalGoalIds':sorted(removed),'wholePartnerUnionApproved':False,'retainedPartnerBodiesUnchanged':True,'sourceExecutionCreditFromPaperData':False}
    patches.append(dict(mappingPath=f['mappingPath'],parentSHA256=digest(R/f['mappingPath']),sourceGoalId=sid,removedExactMappingRows=edges,beforeDecision=before,afterDecision=copy.deepcopy(after),retainedExactMappingRows=[copy.deepcopy(x) for x in d['mappings'] if x['legacyGoalId']==sid],primaryScopeFinding=f['findingKind'],remainingUnionRequiresIndependentReview=True))

successors=[]
for p,d in exnew.items():
    target=O/'source-successors'/p; write(target,d);cp(target,C/p)
    successors.append(dict(kind='extraction',parent=binding(R/p),candidate=binding(target),capsulePath=rel(C/p),changedSourceGoalIds=[x['sourceGoalId'] for x in exdelta if x['extractionPath']==p]))
for p,d in mappingnew.items():
    # Pair each review specimen with its actual candidate extraction; root must merge components across shared files.
    d['sourceExtractionPath']=rel(O/'source-successors'/d['sourceExtractionPath'])
    d['authorAromatics20Successor']={'status':'inactive_author_candidate_needs_independent_review','derivedFrom':binding(R/p),'changedSourceGoalIds':[x['sourceGoalId'] for x in patches if x['mappingPath']==p],'wholeFileReplacementAuthorized':False,'sharedTHRPPolymerComponentsRetained':True}
    target=O/'source-successors'/p;write(target,d);cp(target,C/p)
    successors.append(dict(kind='mapping',parent=binding(R/p),candidate=binding(target),capsulePath=rel(C/p),changedSourceGoalIds=[x['sourceGoalId'] for x in patches if x['mappingPath']==p]))
write(O/'author/exact18-component-mapping-patches.author.json',dict(schemaVersion=1,status='author_candidate_no_independent_votes',patches=patches,removedMappingComponents=sum(len(x['removedExactMappingRows']) for x in patches),newEdges=0,newGoals=0,sharedFileInstruction='Merge exact disjoint TH/RP components; do not overwrite source worker Polymer proposals or whole active files.'))
write(O/'author/exact-source-extraction-literal-scope-patches.author.json',dict(schemaVersion=1,patches=exdelta,sourcePrimaryBytesChanged=False,sourceIDsChanged=False,rawLiteralAndDerivedDescriptorExplicitlySeparated=True))
write(O/'author/source-successor-bindings.author.json',dict(schemaVersion=1,successors=successors,noIndependentSourceApproval=True,noEntireCompoundSourceCleared=True))

# Two evidenced body fields, one research facet; preserve all other bodies/IDs/edges/weights.
props=read(B/'author/BOUNDED.translation-and-research-operator.proposals.author.json')['proposals']
bodypatches=[]
for x in props:
    g=goals[x['goalId']]
    fields={x['field']:x['after']}
    if 'afterEn' in x:fields['descriptionEn']=x['afterEn']
    for field,value in fields.items():bodypatches.append(dict(goalId=g['id'],field=field,before=g[field],after=value,evidenceSourceGoalIds=x['sourceGoalIds']));g[field]=value
write(O/'author/exact-two-goal-body-field-patches.author.json',dict(schemaVersion=1,patches=bodypatches,requiresChanges=[],newGoals=[],independentApproval=False))

# Retain17 reviewed asset byte triples; add only the exact three already selected candidate bytes.
images=read(I/'AUTHOR.three-links.additive.json')['draftOnlyResourceLinks']; correction=read(J/'AUTHOR.e594-correction.additive.json'); retained17=[];selected3=[]
for gid in ids:
    for l in goals[gid].get('resourceLinks',[]):
        if l['type']!='goal-visualization':continue
        suffix=l['url'].split('/assets/goal-visualizations/')[1]
        paths=[R/'curricula/DE/Gymnasium/visualizations'/suffix,R/'app/public'/l['url'][1:],R/'backend/src/main/resources/static'/l['url'][1:]]
        assert len({digest(p) for p in paths})==1
        for p in paths:cp(p,C/p.relative_to(R));guardpaths.add(str(p))
        retained17.append(dict(goalId=gid,bindings=[binding(p) for p in paths]))
for x in images:
    gid=x['goalId'];link=x['link'];assert goals[gid].get('resourceLinks',[])==[]
    src=R/(correction['selectedGeneratedOriginal']['path'] if gid==correction['goalId'] else x['assetBindings'][0]['path'])
    wanted=correction['selectedGeneratedOriginal']['sha256'] if gid==correction['goalId'] else x['assetBindings'][0]['sha256'];assert digest(src)==wanted
    goals[gid]['resourceLinks']=[copy.deepcopy(link)]
    suffix=link['url'].split('/assets/goal-visualizations/')[1]
    privatecopies=[C/'curricula/DE/Gymnasium/visualizations'/suffix,C/'app/public'/link['url'][1:],C/'backend/src/main/resources/static'/link['url'][1:]]
    portable=[]
    for role,p in zip(['source','app','backend'],privatecopies):cp(src,p);out=O/'candidate-copies'/role/(gid+'.png');cp(src,out);portable.append(binding(out))
    selected3.append(dict(goalId=gid,link=link,original=binding(src),candidateCopies=portable,bytesPreservedIncludingC2PA=True))
write(O/'author/exact17-retained-and-selected3-image-bindings.author.json',dict(schemaVersion=1,retained17=retained17,selected3=selected3,independentVAuthority='Existing independent V3 for f0/sigma and V5 for corrected e594, reported by root; no new votes authored here',newImages=0))
write(O/'author/canonical-whole523.two-body-three-link.author-candidate.json',can)
cp(O/'author/canonical-whole523.two-body-three-link.author-candidate.json',C/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')

cases=read(B/'author/whole40.expanded-cases.author.json');profiles=read(B/'author/whole20.profile-payloads.author.json');oldcases=copy.deepcopy(cases);oldprofiles=copy.deepcopy(profiles)
researchid=ids[13]
researchTasks=[(
'Öffne OpenStax Organic Chemistry, Abschnitt17.2 (Properties of Alcohols and Phenols) und24.4 (Basicity of Arylamines). Recherchiere für den Phenol/Ethanol- und den Anilin/Alkylamin-Vergleich jeweils eine passende Fundstelle. Dokumentiere URL, Abschnitt, dein tatsächliches Zugriffsdatum und die Fundstelle; erläutere jeweils in eigenen Worten, wie sie deine Erklärung stützt. Verwende die gegebenen pKₐ-Werte für die Rechnung. Ein kopierter Muster-Zugriffsvermerk gilt nicht als Recherche.',
'Open OpenStax Organic Chemistry sections17.2 (Properties of Alcohols and Phenols) and24.4 (Basicity of Arylamines). Research one relevant passage for each phenol/ethanol and aniline/alkylamine comparison. Record the URL, section, your actual access date and passage location; explain in your own words how each supports your explanation. Use the supplied pKₐ values for calculation. A copied model access note is not research.'),(
'Öffne OpenStax Organic Chemistry, Abschnitt20.4 (Substituent Effects on Acidity) und24.4 (Basicity of Arylamines). Recherchiere jeweils eine Fundstelle zum elektronenziehenden Substituenteneffekt auf Carbonsäuren bzw. zur geringeren Basizität von para-Nitroanilin. Dokumentiere URL, Abschnitt, dein tatsächliches Zugriffsdatum und die Fundstelle; erläutere jeweils in eigenen Worten den Bezug zu deiner I/M-Begründung. Verwende die gegebenen pKₐ-Werte für die Rangfolge. Ein kopierter Muster-Zugriffsvermerk gilt nicht als Recherche.',
'Open OpenStax Organic Chemistry sections20.4 (Substituent Effects on Acidity) and24.4 (Basicity of Arylamines). Research one passage on electron-withdrawing substituents in carboxylic acids and one on the lower basicity of para-nitroaniline. Record the URL, section, your actual access date and passage location; explain each connection to your I/M reasoning in your own words. Use the supplied pKₐ values for the ranking. A copied model access note is not research.')]
researchAnswers=[(
'Ein vollständiger Recherche-Nachweis nennt die tatsächlich geöffneten Abschnitte17.2 und24.4 mit URL, Fundstelle und eigenem Zugriffsdatum. Die selbst formulierte Zuordnung erklärt: Phenoxid wird gegenüber Ethoxid durch Delokalisierung stabilisiert; bei Arylaminen ist das N-Paar gegenüber Alkylaminen delokalisiert und weniger für Protonierung verfügbar. Das Muster legt kein Zugriffsdatum fest und bescheinigt keinen erfolgten Zugriff.',
'Complete research evidence identifies the actually accessed sections17.2 and24.4 by URL, passage location and the learner’s own access date. The learner’s explanation links phenoxide delocalization versus ethoxide and arylamine lone-pair delocalization versus alkylamines to the comparisons. This model sets no access date and certifies no completed access.'),(
'Ein vollständiger Recherche-Nachweis nennt die tatsächlich geöffneten Abschnitte20.4 und24.4 mit URL, Fundstelle und eigenem Zugriffsdatum. Die selbst formulierte Zuordnung erklärt: elektronenziehende Substituenten begünstigen die Carbonsäure-Dissoziation durch Stabilisierung des Carboxylats; die para-Nitrogruppe mindert die Anilinbasizität durch Elektronenentzug einschließlich mesomerer Kopplung. Das Muster legt kein Zugriffsdatum fest und bescheinigt keinen erfolgten Zugriff.',
'Complete research evidence identifies the actually accessed sections20.4 and24.4 by URL, passage location and the learner’s own access date. The learner’s explanation links electron withdrawal to carboxylate stabilization and the para-nitro group to reduced aniline basicity through withdrawal including resonance coupling. This model sets no access date and certifies no completed access.')]
urls=['https://openstax.org/books/organic-chemistry/pages/17-2-properties-of-alcohols-and-phenols','https://openstax.org/books/organic-chemistry/pages/20-4-substituent-effects-on-acidity','https://openstax.org/books/organic-chemistry/pages/24-4-basicity-of-arylamines']
for k,c in enumerate([x for x in cases['cases'] if x['goalId']==researchid]):
    cl=researchTasks[k];an=researchAnswers[k]
    for lang,z in [('De',0),('En',1)]:
        c['data'+lang]+='\n'+('Recherchezugänge: ' if lang=='De' else 'Research entry points: ')+', '.join([urls[k],urls[2]])
        c['task'+lang]+='\n3. '+cl[z];c['modelAnswer'+lang]+='\n3. '+an[z]
    c['expectationIds'].append('e3')
    r=copy.deepcopy(c['rubric'][0]);r.update(criterionId=c['caseId']+'-r3',expectationIds=['e3'],taskClauseDe=cl[0],taskClauseEn=cl[1],criterionDe=an[0],criterionEn=an[1],creditBasis='written-explicit-source-research-evidence')
    r['partialCreditDe']='1 Punkt für zwei tatsächlich lokalisierbare Fundstellen mit vollständigen URL-/Abschnitt-/Zugriffsangaben; 1 weiterer Punkt für die ausdrücklich verlangte eigene fachliche Zuordnung beider Fundstellen. Kein Zugriff allein aus Musterdaten oder abgeschriebenem Vermerk behauptet.'
    r['partialCreditEn']='1 point for two locatable passages with complete URL, section and actual access information; 1 further point for the explicitly requested original scientific connection of both passages. Model data or a copied note do not establish access.'
    for lang in ['De','En']:r['taskSpan'+lang]={'start':c['task'+lang].index(r['taskClause'+lang]),'end':c['task'+lang].index(r['taskClause'+lang])+len(r['taskClause'+lang])}
    c['rubric'].append(r);c['maximumPoints']+=2;c['researchEvidenceRequired']=True
    c['researchExecutionBoundary']='Future task requires actual source access and a checkable source-specific explanation. Author browser reads are reference validation, never a learner performance record; synthetic paper data cannot satisfy research.'
    p=next(x['profile'] for x in profiles['profiles'] if x['goalId']==researchid);brief=next(x for x in p['applicationCaseBriefs'] if x['id']==c['caseId'])
    for lang in ['De','En']:brief['taskDemand'+lang]=c['data'+lang]+'\n'+c['task'+lang];brief['expectedPerformance'+lang]=c['modelAnswer'+lang];brief['understandingFocus'+lang]+=' / '+an[0 if lang=='De' else 1]
p['expectations'].append(dict(id='e3',essentialUnderstandingDe='Ein Struktur-Eigenschafts-Vergleich kann überprüfbare Informationen aus tatsächlich erschlossenen Quellen einbeziehen.',essentialUnderstandingEn='A structure-property comparison can use checkable information from actually accessed sources.',observablePerformanceDe='Erschließt konkrete Fundstellen zu einfachen organischen Verbindungen und verknüpft sie mit eigener I/M-Begründung.',observablePerformanceEn='Locates passages on simple organic compounds and connects them to original I/M reasoning.'))
p['coverageExpectations']['requiredExpectationIds'].append('e3');p['variationAxes'].append(dict(id='v3',textDe='Eigenständige Quellenerschließung für Acidität und Basizität',textEn='Independent source access for acidity and basicity'))
for d in [cases,profiles]:d['authoredAtUTC']=NOW;d['successorOf']=base['authorPackage'];d['independentReviews']=0
write(O/'author/whole40.expanded-cases.author.json',cases);write(O/'author/whole20.profile-payloads.author.json',profiles)
materializer=read(B/'author/whole20.normal-materializer-input.author.json');materializer.update(reviewId=NAME,reviewedAt=NOW,reviewer='Codex aromatics author; no independent review')
for row in materializer['goals']:
    row['profile']=next(x['profile'] for x in profiles['profiles'] if x['goalId']==row['goalId'])
    if row['goalId']==researchid:row['reason']+=' Successor explicitly assesses actual primary/reference source access alongside I/M comparisons; author preparation is not learner performance.'
write(O/'author/whole20.normal-materializer-input.author.json',materializer)
caseaudit=[]
for c in cases['cases']:
    old=next(x for x in oldcases['cases'] if x['caseId']==c['caseId']); changed=c!=old
    for r in c['rubric']:
        for lang in ['De','En']:sp=r['taskSpan'+lang];assert c['task'+lang][sp['start']:sp['end']]==r['taskClause'+lang]
    caseaudit.append(dict(caseId=c['caseId'],goalId=c['goalId'],classification='changed_research_operator' if changed else 'genuinely_unchanged_case',beforeWholeCaseSHA256=objhash(old),afterWholeCaseSHA256=objhash(c),exactSemanticObjectRetained=not changed,completeBilingual=True,rubric=c['rubric'],optionalUngradedRemarksDe=c['optionalModelRemarksDe'],optionalUngradedRemarksEn=c['optionalModelRemarksEn'],actualLabPerformance=False,actualLearnerResearchPerformance=False))
write(O/'author/whole40.exact-demand-and-retention-audit.author.json',dict(schemaVersion=1,cases=caseaudit,changedCases=2,retainedCompleteCases=38,criteria=sum(len(c['rubric']) for c in cases['cases']),allPrintedDemandSpansExact=True,newScientificApprovals=0))
impact=[]
for gid in ids:
    removed=[p for p in patches if gid in p['afterDecision']['authorComponentProposal']['removedCanonicalGoalIds']]
    direct=[w for w in inventory['witnessGroups'] if gid==w['mappedTargetGoalId'] and w['coverage']=='direct']
    impact.append(dict(goalId=gid,title=goals[gid]['title'],bodyFieldsChanged=[x['field'] for x in bodypatches if x['goalId']==gid],profileChanged=gid==researchid,changedCaseIds=[x['caseId'] for x in caseaudit if x['goalId']==gid and not x['exactSemanticObjectRetained']],retainedCaseIds=[x['caseId'] for x in caseaudit if x['goalId']==gid and x['exactSemanticObjectRetained']],removedSourceComponents=[dict(mappingPath=x['mappingPath'],sourceGoalId=x['sourceGoalId']) for x in removed],priorDirectWitnessesRead=direct,resourceAction='exact selected raster additive link' if gid in [x['goalId'] for x in selected3] else 'retain original17 byte triples',caseScientificStatus='author_candidate_needs_independent_review',sourceStatus='bounded component proposals; partner and other source unions remain unapproved',actualClassroomExecution=False,newIndependentVotes=0))
write(O/'author/per-goal20.scientific-impact-matrix.author.json',dict(schemaVersion=1,records=impact,goalCount=20,canonicalNodes=523,curricularAtomic=402,currentStrictPreserved=231,newScientificStrictGain=0))

# Production-like stock P author materializer runs only inside regular private directories.
for p in ['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/goalEvidenceProfileModel.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',base['normalPConfig']]:cp(R/p,C/p)
cfg=read(R/base['normalPConfig']);cfg['reviewId']=NAME;cfg['reviewPath']='author/P20.normal-v2.author-candidates.jsonl';cfg['scope']['label']='Inactive bounded source/operator author successor20; no scientific approval'
for p in [cfg['semanticKindLedgerPath'],cfg['reviewCriteriaPath']]:cp(R/p,C/p)
cp(O/'author/whole20.normal-materializer-input.author.json',C/'author/whole20.normal-materializer-input.author.json')
write(C/'configs/P20.author.inactive.config.json',cfg);write(O/'configs/P20.private-stock.inactive.config.json',cfg)
write(O/'inputs/stock-private-parent-chain.actual.json',dict(schemaVersion=1,root=rel(C),eachOutputParentCheckedBySafeBeforeEveryWrite=True,allParentsRegularAtStockPreparation=True,existingSymlinks=[rel(p) for p in C.rglob('*') if p.is_symlink()],readOnlyNodeDependencyResolution='tsx invocation from live app; copied models resolve dependencies via real copied required package folders if needed',noProductionWriteThrough=True))
assert not any(p.is_symlink() for p in C.rglob('*'))
write(O/'inputs/actual-initial-parent-CAS.json',dict(schemaVersion=1,atUTC=NOW,bindings=[binding(Path(p)) for p in sorted(guardpaths)],canonicalNodes=523,curricularAtomic=402,currentStrictSupplied=231))
print(json.dumps({'output':rel(O),'privateParent':rel(C),'mappingDecisions':len(patches),'removedEdges':sum(len(x['removedExactMappingRows']) for x in patches),'extractionRows':len(exdelta),'cases':40,'changedCases':2,'retainedCases':38,'criteria':sum(len(c['rubric']) for c in cases['cases']),'newIndependentVotes':0}))
