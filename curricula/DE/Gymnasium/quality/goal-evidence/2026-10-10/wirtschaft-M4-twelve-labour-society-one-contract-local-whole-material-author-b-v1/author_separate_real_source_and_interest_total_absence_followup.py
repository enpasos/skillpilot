"""Proactive narrow AUTHOR remedy before final handoff; original whole draft immutable."""
import copy,json,hashlib
from pathlib import Path
O=Path(__file__).resolve().parent
oldp=O/'whole-twelve-labour-society-DEEN-readable-two-case-one-contract.DRAFT-author-v1.json'
old=json.loads(oldp.read_text());new=copy.deepcopy(old)
decisions=json.loads((O/'actual-twelve-individual-separated-core-two-case-and-course-author-decisions.json').read_text())
criteria={
'e20f9304':[
 ('die fallbezogene Erklärung der Finanzierung des vorgelegten Versicherungszweigs','case-based explanation of the supplied insurance branch’s financing'),
 ('eine kriteriensgestützte Beurteilung sozialer Gerechtigkeit','criterion-based assessment of social justice'),
 ('die tatsächliche Einordnung des gelieferten datierten GKV-Materials als bedingte Modellanalyse statt Istwert oder beschlossenes Recht','actual treatment of the supplied dated healthcare material as conditional model analysis rather than observed outcome or enacted law'),
 ('die tatsächliche Einordnung des gelieferten datierten Rentenmaterials als bedingte Modellanalyse statt garantiertem Verlauf oder neu beschlossenem Recht','actual treatment of the supplied dated pension material as conditional analysis rather than a guaranteed path or newly enacted law')],
'eee7217a':[
 ('die tatsächliche fallbezogene Anwendung der gelieferten ILO-Erwerbsstatusdefinitionen','actual case-based application of the supplied ILO labour-force definitions'),
 ('die tatsächliche fallbezogene Anwendung der gelieferten Register-/SGB-Definitionen einschließlich des vorgegebenen Maßnahmestatus','actual case-based application of the supplied register/SGB definitions including the stipulated programme status'),
 ('die ursächliche Analyse der Passung einer Maßnahme zum internationalen Arbeitsmarktproblem','causal analysis of a policy’s fit to the international labour-market problem'),
 ('die Prüfung beobachteter Entwicklung gegenüber bedingter Maßnahmewirkung','assessment of observed developments versus conditional policy effects')],
'85f0b64f':[
 ('die fallbezogene Unterscheidung individueller und kollektiver Vertrags-/Normsetzung','case-based distinction of individual and collective contracts or norm-making'),
 ('die tatsächliche Regelanwendung mit Bindungs- und Geltungsgrenze','actual rule application with binding status and scope'),
 ('die tatsächliche Verbindung der Arbeitnehmerperspektive mit der konkreten Arbeitsorganisation','actual connection of the worker perspective to the supplied work organisation'),
 ('die tatsächliche Verbindung der Arbeitgeberperspektive mit der konkreten Arbeitsorganisation','actual connection of the employer perspective to the supplied work organisation')]}
changed=[]
for g,d in zip(new,decisions['rows']):
 prefix=d['goalId'][:8]
 if prefix not in criteria:continue
 previous=d['independentEssentialCoreComponents'];replacement=criteria[prefix]
 for field,i in [('taskContent',0),('taskContentEn',1)]:
  before=g['examData'][field]
  joined='; '.join(x[i] for x in previous)
  assert before.count(joined)==1
  after=before.replace(joined,'; '.join(x[i] for x in replacement))
  assert after.split('\n\n',1)[1]==before.split('\n\n',1)[1]
  g['examData'][field]=after
  changed.append({'materialId':g['id'],'assessedGoalId':d['goalId'],'field':'examData.'+field,'wholeBeforeTask':before,'wholeAfterTask':after})
 d['independentEssentialCoreComponents']=replacement
for a,b in zip(old,new):
 x=copy.deepcopy(b)
 for f in ['taskContent','taskContentEn']:x['examData'][f]=a['examData'][f]
 assert x==a
assert len(changed)==6
def save(n,d):p=O/n;assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return p
body=save('whole-twelve-labour-society-only-three-separated-source-and-interest-boundaries.DRAFT-author-v2.json',new)
decisions['role']='AUTHOR final separate essential criteria, not independent review';decisions['wholeBodySha256']=hashlib.sha256(body.read_bytes()).hexdigest()
save('actual-final-twelve-core-case-course-decisions-only-three-separated-boundaries.AUTHOR-v2.json',decisions)
save('actual-six-existing-DEEN-grading-paragraph-field-deltas-and-nine-whole-exact-bodies.AUTHOR.json',{
 'role':'AUTHOR proactive actual ambiguity prevention, no reviewer approval','actualFieldDeltas':changed,
 'wholeBeforeSha256':hashlib.sha256(oldp.read_bytes()).hexdigest(),'wholeFinalSha256':hashlib.sha256(body.read_bytes()).hexdigest(),
 'allCasesOutsideGradingParagraphAndAllSolutionsRubricsOuterFieldsExact':True,'actualUnchangedWholeBodyCount':9,
 'reason':'Given source facets and both interest perspectives are each necessary under whole current original profiles. Partial work in one must not silently substitute for total absence of another. No extra task quota, perfection or required literal date/wording was introduced.',
 'sourceStatusOrStudentEvidenceAuthorityChanged':False,'allTwelveRemainDRAFT':True})
base=json.loads((O/'actual-own-twelve-fair-twelve-core-counterworks-twelve-whole-second-omissions216-manual-rubric-decisions.AUTHOR.json').read_text())
fairs={x['assessedGoalId'][:8]:x for x in base['works'] if x['kind'].startswith('own new fair')}
extra=[]
def add(k,missing,replacements,marks,reasons):
 f=fairs[k];answers=copy.deepcopy(f['actualCompleteSixAnswerWork'])
 for i,a in replacements.items():answers[i]=a
 raw=sum(marks);assert len(marks)==len(reasons)==6
 extra.append({'assessedGoalId':f['assessedGoalId'],'materialId':f['materialId'],'actualMissingSeparateEssentialPerformance':missing,
 'actualSixAnswerWholeWork':answers,'actualIndividualManualDecisions':[{'step':'s'+str(i+1),'actualPoints':m,'stepMaximum':4,'reason':r} for i,(m,r) in enumerate(zip(marks,reasons))],
 'actualRawScore':raw,'actualTotalAbsenceConditionMet':True,'actualFinalScore':min(raw,14),'actualResult':'FAIL','AUTHOROnlyNotIndependentEvidence':True})
add('e20f9304','GKV primary dated-material treatment entirely absent',{
0:'Fiktiver GKV-Modellfall: Einnahmen170/Ausgaben190/Lücke20; künftig185/210/Lücke25. Die amtlichen Datums-/Milliarden-/Modell-/Rechtsangaben bespreche ich für GKV über die gesamte Arbeit ausdrücklich nicht.'
},[2,3,3,4,3,3],['Rechnung korrekt, aktuelle GKV-Quelleneinordnung fehlt.','Optionsanalyse erhalten.','Gerechtigkeitsurteil erhalten.','Rentenquelle/Umlage erhalten.','Rentenoptionen erhalten.','Rentenurteil erhalten.'])
add('e20f9304','pension primary dated-material treatment entirely absent',{
3:'Der fiktive Umlagefall ergibt600/600 und künftig540/720 mit180Lücke. Die gelieferte datierte Regierungs-/Rentenmodellangabe sowie ihre Unsicherheit oder Rechtsabgrenzung beurteile ich nirgends.',
4:'Fiktiver benötigter Satz720/2700=26⅔%; Steuer180 oder breitere Beschäftigung sind Möglichkeiten. Dieser Satz ist nur aus den hier vorgegebenen fiktiven Größen gerechnet. Zur anderen gelieferten datierten Rentenquelle mache ich keinerlei Aussage.'
},[4,3,3,3,3,3],['GKVQuelle/Zahlen erhalten.','GKVOptionen erhalten.','Gerechtigkeit erhalten.','Umlage/Rechnung, reale datierte Rentenquelle fehlt.','Modelloptionen, keine tatsächliche Rentenquelleneinordnung.','Generationen-/Einkommensurteil erhalten.'])
add('eee7217a','register/SGB source performance entirely absent despite ILO and policy work',{
0:'A ist wegen8bezahlter Stunden ILO-erwerbstätig, B ILO-erwerbslos, C ohne Suche keine Erwerbsperson. ILO100/1000=10%,Register120/1200=10%rechnerisch. Wer nach nationalen Regeln arbeitslos ist und welche Bedingungen gelten, bespreche ich nicht.',
3:'ILO80/1000=8%,Register100→80ist rein rechnerisch−20und−20%. Den nationalen Maßnahmestatus oder eine daraus folgende Status-/Beschäftigungsaussage bespreche ich nirgends.'
},[2,3,3,2,3,2],['ILOKlassifikation/Quotenzahlen, nationale Anwendung fehlt.','Strukturpassung erhalten.','Kontrollargument erhalten.','Rechenänderung/ILOQuote, §16Status fehlt.','Nachfragepassung erhalten.','4Punkte/Kausalgrenze erhalten.'])
add('eee7217a','ILO definition source performance entirely absent despite register and policy work',{
0:'A kann nach den ausdrücklich gegebenen Bedingungen mit8Wochenstunden und Verfügbarkeit20 registriert arbeitslos sein; B ist nicht registriert. Register120/1200=10%, die andere angegebene Aggregatquote ist100/1000=10%. ILO-Arbeits-/Such-/Verfügbarkeitsstatus wende ich nirgends an.',
3:'Register20Personen weniger folgt §16Abs.2 wegen aktiver Maßnahme, keine20nachgewiesenen neuen Jobs. Die andere Aggregatquote ist80/1000=8%. Den ILO-Status der Maßnahmeteilnehmenden oder ILO-Erwerbstätigkeit/-losigkeit interpretiere ich nirgends.'
},[2,3,3,2,3,2],['Registerstatus/Rechenquoten, ILOPersonenstatus fehlt.','Strukturpassung erhalten.','Kontrollargument erhalten.','Registerregel/Rechenquote, ILODefinition fehlt.','Nachfragepassung erhalten.','4Punkte/Kausalgrenze erhalten.'])
add('85f0b64f','worker-interest perspective entirely absent',{
2:'Für die Firma sind Besetzung, Kosten und verlässliche Einsatzfenster wichtig. Sie kann gemeinsam regelkonforme transparente Schichten und die zwingende25einhalten; persönliches Einverständnis hebt die Norm nicht auf. Arbeitnehmerinteressen oder -folgen beurteile ich nirgends.',
5:'Die Firma möchte Flexibilität und planbare Zuständigkeit; transparent vereinbarte Einsatzfenster mit richtiger Entgeltwirkung können helfen. Nichtbindung hebt andere Schutzregeln nicht auf. Arbeitnehmerinteressen und deren Arbeitsorganisationsfolgen lasse ich in der ganzen Arbeit aus.'
},[4,3,2,4,3,2],['Vertragssource erhalten.','Tarifscope erhalten.','Firmeninteresse/zulässige Gestaltung, Arbeitnehmer fehlt.','Statusquelle erhalten.','Tarifvarianten erhalten.','Firmenorganisation/Fallgrenze, Arbeitnehmer fehlt.'])
add('85f0b64f','employer-interest perspective entirely absent',{
2:'Beschäftigte brauchen planbare Wechsel und Einkommen. Vereinbarte transparente Zeiten und zwingende25helfen; persönliche Zustimmung kann die Norm nicht aufheben. Firmeninteressen, Kosten oder Besetzungsfolgen beurteile ich in der ganzen Arbeit nicht.',
5:'Beschäftigte benötigen verlässliche Zeiten und Vergütung; transparente Einsatzfenster und korrekte Normgeltung können helfen. Nichtbindung hebt Schutz nicht pauschal auf. Arbeitgeberinteressen und deren konkrete Organisationsfolgen lasse ich ausdrücklich aus.'
},[4,3,2,4,3,2],['Vertragssource erhalten.','Tarifscope erhalten.','Arbeitnehmerinteresse/Rechtsgrenze, Arbeitgeber fehlt.','Statusquelle erhalten.','Tarifvarianten erhalten.','Arbeitnehmerorganisation/Fallgrenze, Arbeitgeber fehlt.'])
assert len(extra)==6 and all(x['actualRawScore']>=15 for x in extra)
save('actual-six-new-separate-source-and-interest-whole-absence-works36-manual-decisions.AUTHOR.json',{
 'role':'AUTHOR real six additional whole counterworks, no independent approval','works':extra,
 'actualNewWholeWorkCount':6,'actualNewManualStepDecisions':36,'allSixRawPASSConvertedTo14FAIL':True,
 'allOriginalTwelveFairWorksRetainMeaningfulEachSeparatedFacet':True,'allOriginalTwelveFairScoresStillPASS':[w['actualFinalScore'] for w in fairs.values()],
 'wholeOriginal36WorksRetainedAndMeaningful':True,'newBodySha256':hashlib.sha256(body.read_bytes()).hexdigest()})
print(json.dumps({'finalBodySha256':hashlib.sha256(body.read_bytes()).hexdigest(),'fieldsChanged':6,'newCounterworkScores':[(x['actualRawScore'],x['actualFinalScore']) for x in extra]}))
