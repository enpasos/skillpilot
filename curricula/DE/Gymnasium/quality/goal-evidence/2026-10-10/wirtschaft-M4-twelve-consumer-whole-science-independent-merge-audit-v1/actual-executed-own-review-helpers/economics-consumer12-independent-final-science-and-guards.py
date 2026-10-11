import json,pathlib,hashlib,copy,shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-consumer-whole-science-independent-merge-audit-v1';D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1';V4=D/'two-real-separate-sustainability-and-actual-mutation-whole-boundary-author-successor-v4';V5=V4/'one-real-entirely-absent-offline-articulation-boundary-author-successor-v5'
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'symlink':p.is_symlink()}
def write(n,v):
 p=O/n;assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return bind(p)
def freeze(p):
 q=O/'whole-inputs'/p.relative_to(R);q.parent.mkdir(parents=True,exist_ok=True)
 if q.exists():assert q.read_bytes()==p.read_bytes()
 else:shutil.copyfile(p,q)
 return {'original':bind(p),'ownFrozenWhole':bind(q)}
originalp=D/'whole-twelve-readable-DEEN-whole-essential-groups.DRAFT-author-successor-v3.json';finalp=V5/'whole-twelve-consumer-DRAFT.three-real-separated-essential-boundaries-v5.json';orig=load(originalp);final=load(finalp);mid=load(V4/'whole-twelve-consumer-DRAFT.two-real-separated-essential-boundaries-v4.json')
intake=load(O/'actual-whole-twelve-consumer-DEEN-goals-P24-and-final-original-bodies.current-intake.independent.json');rows=intake['actualWholeGoalP24Rows'];works=load(O/'actual-thirtysix-complete-consumer-independent-six-answer-works-and432-individual-criterion-marks.json')['actualWholeWorks'];calc=load(O/'actual-independent-sixtyfour-Fraction-calculations-and-twelve-rubric-sum-checks.json')
active=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';current=load(active);gmap={g['id']:g for g in current['goals']};pfile=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current597-legal-social311-20261010-v15/whole-current336-original-positive-profiles685cases-no-profile-or-input-change.jsonl';pmap={x['goalId']:x for x in map(json.loads,pfile.read_text().splitlines())};assert len(pmap)==336;assert sum(len(x['profile']['applicationCaseBriefs']) for x in pmap.values())==685
assert len(rows)==12 and sum(len(r['wholeOriginalPositiveV2Record']['profile']['applicationCaseBriefs']) for r in rows)==24
for r in rows:
 assert gmap[r['goalId']]==r['wholeCurrentDEENGoal'];assert pmap[r['goalId']]==r['wholeOriginalPositiveV2Record']
oldactiveinputs=load(D/'actual-final-current597-whole144-input-endguards-original12-P24-and-all597-old-goals.author.json')['whole144ActiveInputs'];actualguards=[]
for b in oldactiveinputs:
 p=R/b['path'];actual=bind(p);assert actual['sha256']==b['sha256'],p;assert actual['bytes']==b['bytes'];assert not actual['symlink'];actualguards.append(actual)
assert len(actualguards)==144
originalmanifest=load(D/'actual-final-twelve-DRAFT-body-author-whole-immutable-portable.manifest.json');authorhistoricalguards=[]
for b in originalmanifest['files']:
 p=R/b['path'];a=bind(p);assert a['sha256']==b['sha256'];assert a['bytes']==b['bytes'];assert not a['symlink'];authorhistoricalguards.append(a)
assert len(works)==36 and sum(len(w['individualTwoCriterionMarks'])*2 for w in works)==432
for w in works:
 assert len(w['wholeSixAnswers'])==6 and all(isinstance(t,str) and len(t)>15 for t in w['wholeSixAnswers']);assert len(w['individualTwoCriterionMarks'])==6;assert all(len(t)==2 and all(v in (0,1,2) for v in t) for t in w['individualTwoCriterionMarks']);assert w['raw']==sum(map(sum,w['individualTwoCriterionMarks']))
assert calc['actualIndependentCalculationCount']==64 and all(c['actualSum']==c['declaredMax']==24 and c['passing']==15 for c in calc['rubricSumChecks'])
def differences(a,b,p=''):
 if type(a)!=type(b):return [{'pointer':p,'before':a,'after':b}]
 if isinstance(a,dict):
  out=[]
  for k in a.keys()|b.keys():out+=differences(a.get(k),b.get(k),p+'/'+str(k))
  return out
 if isinstance(a,list):
  assert len(a)==len(b);return [z for i,(x,y) in enumerate(zip(a,b)) for z in differences(x,y,p+'/'+str(i))]
 return [] if a==b else [{'pointer':p,'before':a,'after':b}]
all12diff=differences(orig,final);assert len(all12diff)==12
assert all(x['pointer'] in ['/materials/'+str(i)+'/examData/'+k for i in [2,3,5] for k in ['taskContent','solutionContent','taskContentEn','solutionContentEn']] for x in all12diff)
for x in all12diff:
 assert isinstance(x['before'],str) and isinstance(x['after'],str);assert x['before'].rsplit('\n\n',1)[0]==x['after'].rsplit('\n\n',1)[0]
assert len(differences(orig,mid))==8 and len(differences(mid,final))==4
assert [i for i,(a,b) in enumerate(zip(orig['materials'],final['materials'])) if a!=b]==[2,3,5]
for i,m in enumerate(final['materials']):
 assert m['examData']['reviewStatus']=='draft';assert m['requires']==m['examData']['coveredGoalIds']==[rows[i]['goalId']];assert m['examData']['scoring']==orig['materials'][i]['examData']['scoring']
 assert m['extendedData']==orig['materials'][i]['extendedData']

rationales=[
'Die Musik-Tarifvariation trennt voreingestellte Option von transparent gleichwertigem Tages-/Gesamtpreis; der Rucksackfall prüft den unbestätigten Referenzwert anhand einer isolierten Vergleichsvariation. Beide tatsächlichen Lösungen und eigene Antworten trennen Hypothese, Gruppenwirkung, bewusste Wahl und unbekannte Motive. Die erzwungene Ankerleugnung scheitert trotz sonst hoher Punkte.',
'App-Verlängerung und Lampenbewertung verlangen jeweils konkrete mögliche Verhaltenswirkung, bedingungskonstanten Vergleich und Abgrenzung individueller Präferenzen. 30 Prozentpunkte und drei Bewertungspunkte werden weder vermischt noch als Geld oder tatsächliche allgemeine Verbreitung ausgegeben. Der durchgehend ausgeschlossene individuelle Präferenzbeitrag wird nicht kompensiert.',
'Reparatur/Zubehör und Taschenwahl verlangen Bedarf und Budget, eigene Anreize, konkrete ökologische Folgen mit Informationsgrenzen und bewusste neutralisierte Werbeabwägung. Der ursprüngliche Nachhaltigkeits-Totalabsenzgegenfall21 ist ein REVISE; die echte getrennte Nachfolgeregel schützt genau diese Leistung, ohne eine bestimmte nachhaltige Kaufwahl, Ökobilanz oder vollständige Detailausführung zu erzwingen.',
'Zwei unterschiedliche Budgettabellen müssen wirklich erstellt und mit verknüpften Formeln nach realer Eingabeänderung ausgewertet werden. Rücklage, Sparziel und Fälligkeit bleiben getrennt. Vier eigene gespeicherte XLSX und tatsächliche Mutation zeigen den positiven Weg; die korrekte hypothetische Änderung bei nur initialen Dateien16 darf die ausgeführte Kernhandlung nicht ersetzen. Die getrennte Nachfolgeregel behebt dies.',
'Die beiden konkreten Empfehlungskontexte verlangen adressatengerechte schriftliche und mediale Produkte sowie tatsächliche mündliche Erläuterung mit Rückfrage. Eigene Jugendkarte/Grafik und Leitungsvorlage wurden tatsächlich erstellt. Eine mündliche Darbietung wurde nicht beobachtet: die eigenen lediglich schriftlichen/hypothetisch-mündlichen Arbeiten sind daher tatsächlich auf14 begrenzt; die bedingten24/22 sind ausdrücklich keine beobachteten PASS. Die Aufgaben- und Bewertungsregel ist fachlich passend, ohne dass diese Reviewarbeit mündliche Leistung vortäuscht.',
'Die vollständig fiktiven Tarif- und Arbeitsbedingungsverfahren verlangen konkrete analoge und digitale Artikulationswege, adressiertes Organ, Fristen, Ressourcen und Abgrenzung zur bindenden Entscheidung. Die ursprüngliche rein digitale Ganzantwort18 enthielt keinerlei analoge Leistung und war REVISE. Die getrennte Nachfolgeregel erkennt genau diese Absenz; geeignete analoge Teilleistung anderswo in der Gesamtarbeit zählt weiterhin.',
'Quellengebundener Kostenbeitrag und aufmerksamkeitsselektierte Plattformdarstellung prüfen Information, öffentliche Kontrolle sowie Auswahl, Stimmenvielfalt und Zugang. Der konkrete Kostenanstieg30% ist kein Verdopplungsnachweis; Aufrufe beweisen weder Wahrheit noch Demokratie. Eigene Kontrolle-Totalabsenzantwort scheitert trotz sachgerechter Informations-/Teilhabeanteile.',
'Die eigenen fiktiven Lohn- und Umweltabgabenbeiträge sowie beschriebenen Karikaturen verlangen nachvollziehbare Text-/Bilddeutung, Interesse, Fakt/Wertung und fallbezogene Freiheits-, Effizienz-, Sozial- und Umweltabwägung. 12/14 sind Modelllöhne und keine Behauptung eines aktuellen gesetzlichen Satzes; externe Schäden werden nicht aus privatem Kostenzuwachs berechnet. Freiheit kann nicht ganz durch andere passende Kriterien ersetzt werden.',
'Jeweils ursprüngliche fiktive Filmminiatur, literarische Stimme und Sachskizze verlangen tatsächliche formbezogene ökonomische Interpretation und empirische Grenzen. Output60/80 bei6/8Stunden ergibt gleiche Stundenproduktivität; Wahlbudget und Opportunitätsabwägung bleiben getrennt. Völlig ausgelassene Literatur kann nicht durch richtige Film-/Sachrechnung kompensiert werden.',
'Das Kiosk- und Rechtsinformationsprojekt verlangt abgegrenzten Plan, wirklich erzeugte Produkte, tatsächlich revidierte Methode, erneute Anwendung und begründeten Ergebnisvergleich. Eigene ausgeführte Tagesaggregation und neu erstelltes/appliziertes0/1-Rechtsraster sind reale eigene Artefakte auf fiktiven Daten, kein echter Schulversuch oder menschliche Befragung. Die begrenzte §439-Hilfe verspricht weder automatischen Rücktritt noch allgemeine Rechtsvollständigkeit.',
'Bäckerei- und Busfragen unterscheiden betriebliche Steuerungsfragen von allgemeinen Markt-/Haushaltsfragen anhand des Untersuchungsziels. Mikroökonomie kann einen einzelnen Haushalt behandeln; Datenquelle, Akteurszahl und Gegenstand machen eine Frage nicht automatisch BWL. Die vollständig falsche Mikrozuordnung scheitert trotz richtiger anderer Zuordnungen.',
'Busnachfrage und Reparaturwahl ordnen konkrete ökonomische Menschen-/Institutionsfragen sozialwissenschaftlich ein und verbinden sachliche Beiträge benachbarter Disziplinen. Mathematik, technische Geräte und Datenerhebung werden nicht mit der gesamten Fachzuordnung gleichgesetzt. Die vollständig fehlende konkrete Nachbarleistung scheitert trotz korrekter ökonomischer Einordnung.'
]
originaldecisions=[]
for i,(m,r) in enumerate(zip(orig['materials'],rows)):
 originaldecisions.append({'materialId':m['id'],'wholeCurrentGoalId':r['goalId'],'decision':'REVISE' if i in [2,3,5] else 'KEEP','wholeGoalDEENAndAllOriginalPActuallyRead':True,'wholeMaterialDEENTasksSolutionsScoringActuallyRead':True,'rationale':rationales[i],'wholeIndependentWorks':works[3*i:3*i+3],'actualOriginalEssentialCounterScore':works[3*i+2]['actualFinal'],'oralObserved':False,'oralBoundaryApplies':i==4,'scopeStatusSEMSourceHumanApproval':False})
write('actual-original-twelve-consumer-nine-whole-KEEP-three-whole-essential-REVISE.independent.json',{'role':'INDEPENDENT_ORIGINAL_V3_WHOLE_SCIENTIFIC_DECISIONS','wholeOriginalBodies':bind(originalp),'wholeOriginalCurrentIntake':bind(D/'whole-twelve-current597-DEEN-contracts24-original-P-cases-and-current43-bindings.exact-author-intake.json'),'actualTwelveIndividualJudgments':originaldecisions,'actualOriginalKEEPCount':9,'actualOriginalREVISECount':3,'allOriginalWholeWorksUnchanged':True,'noAuthorWorksOrScoresCountedAsIndependent':True,'activeWrites':0})
regrades=[]
for i in [2,3,5]:
 m=final['materials'][i];negative=works[i*3+2];partial=works[i*3+1];positive=works[i*3]
 raw=negative['raw'];assert raw in (21,16,18);assert partial['actualFinal'] in (19,21,20)
 regrades.append({'materialId':m['id'],'wholeCurrentGoalId':rows[i]['goalId'],'decision':'KEEP','rationale':rationales[i],'wholeOldCounterwork':negative,'newFinalScore':14,'newPass':False,'capRationale':negative['missingWholeCore']+' Die gelesenen aktuellen DE/EN-Regeln nennen diese Leistung jetzt als selbständige Ganzleistung. Die übrigen12Kriteriumsmarkierungen bleiben unverändert; nur die Obergrenze wird tatsächlich neu angewendet.','wholeOwnFairPartialWork':partial,'actualFairPartialScoreUnchanged':partial['actualFinal'],'fairPartialPass':True,'wholeOwnCorrectWork':positive,'actualOwnCorrectScoreUnchanged':24,'meaningfulCorrectPartAnywhereCounts':True,'noPerTaskQuotaOrPerfectCaseRequirement':True})
write('actual-three-bounded-whole-consumer-followups-twelve-ending-string-deltas-and-nine-whole-reused-KEEP.independent.json',{'role':'INDEPENDENT_TARGETED_FOLLOWUP_WITH_GENUINE_OWN_COMPLETE_REGRADES','wholeFinalV5':bind(finalp),'wholeOriginalV3':bind(originalp),'wholeV4':bind(V4/'whole-twelve-consumer-DRAFT.two-real-separated-essential-boundaries-v4.json'),'exactTwelveLeafStringDeltas':all12diff,'originalV3ToV4DeltaCount':8,'v4ToV5DeltaCount':4,'nineOtherWholeBodiesExact':True,'allTasksDossiersNumbersURLsSolutionsExceptEndingBoundaryScoringPointsRequiresCoverageTagsAndDraftStatusesExact':True,'actualThreeIndividualFollowups':regrades,'noNewAuthorAnswersUsedAsIndependent':True,'authorStatusAndHumanApprovalUnchanged':True})
write('actual-bounded-primary-source-reading-three-real-locators-and-two403-boundaries.independent.json',{'role':'OWN_BOUNDED_PRIMARY_READING_NOT_REPRODUCED_THIRD_PARTY_FULLTEXT','actualFreshBrowserReadDate':'2026-10-10','sources':[{'url':'https://www.gesetze-im-internet.de/bgb/__439.html','actualAccess':'Fresh browser open succeeded; complete displayed individual norm paragraphs1–6 read.','boundedOwnParaphrase':'Die Käuferwahl bei Nacherfüllung steht unter gesetzlichen Verweigerungsgrenzen; die Sache muss verfügbar gemacht werden. Das Unterrichtsprojekt setzt den Anspruch voraus und behandelt nur die bezeichneten Absätze, keine vollständige Rücktritts- oder Schadensersatzprüfung.'},{'url':'https://www.nobelprize.org/prizes/economic-sciences/2002/kahneman/biographical/','actualDirectAccess':'403 Forbidden','actualFallbackRead':'Actual official indexed passage sections Science74/rationality and Framing/mentalaccounting read; no successful direct full page or lecture-PDF read claimed.','boundedOwnParaphrase':'Der Primärautor beschreibt Ankerforschung und unterschiedliche Entscheidungen bei transparent gleichwertigen Darstellungen. Die Unterrichtsdaten sind eigene Fiktion; eine Darstellung beweist weder individuelle Motive noch universelle tatsächliche Wirkungen.'},{'url':'https://www.nobelprize.org/prizes/economic-sciences/2017/thaler/interview/','actualDirectAccess':'403 Forbidden','actualFallbackRead':'Actual official indexed telephone-interview transcript passage read; no fetched complete video/fullpage claimed.','boundedOwnParaphrase':'Der Primärautor erläutert voreingestellte Fonds und automatische Einschreibung als Gestaltung der Wahlumgebung. Die Materialien unterscheiden mögliche Defaultwirkung von bewussten Vorlieben und halten Vergleichsbedingungen fest.'}],'earlier2017PopularInformationDirect403RetainedAsFailure':True,'noThirdPartyFulltextStoredInCurricula':True,'noSourceCoveragePromotionFromScienceReceipt':True})
freezes=[freeze(p) for p in [finalp,V4/'actual-final-two-real-sustainability-and-actual-mutation-whole-boundary-author.handoff.json',V5/'actual-final-one-offline-articulation-and-prior-two-essential-boundary-author.handoff.json']]
can=copy.deepcopy(current);can['goals']+=copy.deepcopy(final['materials']);assert len(can['goals'])==609
newids={m['id'] for m in final['materials']};assert len(newids)==12 and not newids&set(gmap);allids={g['id'] for g in can['goals']};assert len(allids)==609
for g in can['goals']:
 for k in ('requires','contains'):
  assert set(g.get(k,[]))<=allids,(g['id'],k)
for rel in ('requires','contains'):
 byid={g['id']:g for g in can['goals']};gray=set();black=set()
 def dfs(x):
  assert x not in gray,(rel,x)
  if x in black:return
  gray.add(x)
  for y in byid[x].get(rel,[]):dfs(y)
  gray.remove(x);black.add(x)
 for gid in byid:dfs(gid)
write('whole-current609-final-twelve-consumer-V5-DRAFT-only-independent-schema-input.inert.json',can)
write('actual-current597-P336685-twelve-contracts-and-history-whole-endguards.independent.json',{'role':'TECHNICAL_WHOLE_BYTE_ENDGUARDS_NOT_SCIENCE_BY_HASH','wholeActiveBefore597':bind(active),'wholeP336685':bind(pfile),'actual144CurrentInputsByteExactToAuthorBefore':actualguards,'actualOriginalAuthorHistoricalFilesByteExact':authorhistoricalguards,'actualWholeOriginalGoalAndP24Exact':True,'all597OldWholeGoalsIn609Exact':all(a==b for a,b in zip(can['goals'][:597],current['goals'])),'requiresDAGAndContainsDAG609Pass':True,'all609RefsResolved':True,'actualNew12DraftStatus':True,'actualScienceFollowupWholeSnapshots':freezes,'own36Works432Marks64ChecksAnd12RubricSumsVerified':True,'activeWrites':0,'allScopeOrphanWarningsAndSourceIncompleteDraftDiagnosticsRemainUnqualified':True})
print(json.dumps({'actualOriginalKEEP':9,'actualOriginalREVISE':3,'followupScores':[[r['wholeOldCounterwork']['raw'],r['newFinalScore'],r['actualFairPartialScoreUnchanged']] for r in regrades],'externalCurrentGuards':len(actualguards),'authorHistoryGuards':len(authorhistoricalguards),'wholeCurrent597GoalAnd336P685Exact':True,'scopeClaim':False}))
