from pathlib import Path
import json, hashlib, re, copy
R=Path('/home/enpasos/projects/skillpilot')
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-policy-wage-skills-scenarios-one-contract-local-author-a-v1'
V=O/'one-real-independent-employer-position-boundary-and-observed-word-spacing-author-successor-v3'
V.mkdir(exist_ok=False)
p=O/'actual-word-spacing-and-one-self-found-independent-macro-boundary-author-successor-v2/whole-seven-readable-policy-DRAFT.one-self-found-separated-growth-jobs-environment-boundary.author-v2.json'
before=json.loads(p.read_text()); after=copy.deepcopy(before)
replacements={
'Premoves':'P removes','Pmay':'P may','Qneeds':'Q needs','Lcan':'L can','Iremoves':'I removes','Lallows':'L allows','Ireduces':'I reduces','userfee':'user fee','afterfee':'after fee','afterbonus':'after bonus','payrise':'pay rise','fromyear':'from year','inyear':'in year','withtraining':'with training','trainingalone':'training alone','alljob':'all job','basispoints':'basis points','Uconverts':'U converts','T/Bapproaches':'T/B approaches','Ufunding':'U funding','Separateactual':'Separate actual','ppdecision':'pp decision','inventedhousehold':'invented household','uncertaintransmission':'uncertain transmission','raiseprices':'raise prices','energyshortage':'energy shortage','reduceenergyneed':'reduce energy need','requiringresources':'requiring resources','sameperiod':'same period','asone-offbudget':'as one-off budget','Bothdisplace':'Both displace','demandmay':'demand may','supportoutput':'support output','orprices':'or prices','constraininvestment':'constrain investment','timeunit':'time unit','Tor Bcan':'T or B can','defendedconditionally':'defended conditionally','deliverycost':'delivery cost','Monitoractualsavings':'Monitor actual savings','assuredoutput':'assured output','Conversionchangesfunding':'Conversion changes funding','notautomaticloss':'not automatic loss','Uhasinitialgap':'U has initial gap','withadditionalfunding':'with additional funding','holdinglimit':'holding limit','Ugap':'U gap','versusloss':'versus loss','Pilotmay':'Pilot may','checkaccess':'check access','broadmay':'broad may','scalefaster':'scale faster','fundingrisks':'funding risks','Distinguishpublic':'Distinguish public','laterdecision':'later decision','areconditions':'are conditions','Peoplewithoutsmartphones':'People without smartphones','needcards':'need cards','banksneedliquidityplanning':'banks need liquidity planning','merchantsfacepaymentcosts':'merchants face payment costs','Justifyadaptation':'Justify adaptation','displacesalternatives':'displaces alternatives','andcreates':'and creates',
'jekontrollierter':'je kontrollierter','bereitsdurch':'bereits durch','istgegeben':'ist gegeben','selbstbeschließen':'selbst beschließen','Umwandlungohneweitere':'Umwandlung ohne weitere','Modellmöglich':'Modell möglich','möglichsein':'möglich sein','nichtgarantiert':'nicht garantiert','späterweniger':'später weniger','erzeugtphysisch':'erzeugt physisch','undgesamt':'und gesamt','nichtmit':'nicht mit','Einmalbudgetzeitlichgleichsetzen':'Einmalbudget zeitlich gleichsetzen','Tzielgenauer':'T zielgenauer','Beffizienz':'B effizienz','undbreiter':'und breiter','beideverdrängen':'beide verdrängen','Jobsstützen':'Jobs stützen','Preisebei':'Preise bei','Investitionbremsen':'Investition bremsen','Produktivitätsreaktionoffen':'Produktivitätsreaktion offen','Tmit':'T mit','istvertretbar':'ist vertretbar','auchbedingt':'auch bedingt','Umweltinklusive':'Umwelt inklusive','keinegesicherte':'keine gesicherte','Umwandlungändert':'Umwandlung ändert','nichtautomatisch':'nicht automatisch','Zeitreaktionoffen':'Zeitreaktion offen','Keineheutige':'Keine heutige','oderbreit':'oder breit','Risikenprüfen':'Risiken prüfen','Reichweitebeschleunigen':'Reichweite beschleunigen','abermehr':'aber mehr','undprivate':'und private','Bankeinlageunterscheiden':'Bankeinlage unterscheiden','Menschenohne':'Menschen ohne','profitierenvon':'profitieren von','Händlernutzen':'Händler nutzen','Zahlungsverfahrenmit':'Zahlungsverfahren mit','Urteilezählen':'Urteile zählen','fehltanderen':'fehlt anderen','löstkein':'löst kein','mindestenszwei':'mindestens zwei'
}
def space(s):
    urls=[]
    def keep(m): urls.append(m[0]); return f'URLTOKEN_{len(urls)-1}_END'
    s=re.sub(r'https?://[^\s)]+',keep,s)
    for a,b in replacements.items(): s=s.replace(a,b)
    s=re.sub(r'([;:])(?=[A-Za-zÄÖÜäöü0-9])',r'\1 ',s)
    for i,u in enumerate(urls): s=s.replace(f'URLTOKEN_{i}_END',u)
    return s
for g in after:
    for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']: g['examData'][k]=space(g['examData'][k])
    for t in g['examData']['scoring']['steps']: t['description']=space(t['description'])
wage=next(g for g in after if g['requires'][0].startswith('94264'))
de_old='beide tatsächlichen Interessenpositionen als datierte Forderungen'
de_new='die tatsächliche datierte Gewerkschaftsposition mit ihrem Interesse; die tatsächliche datierte Arbeitgeberposition mit ihrem Interesse'
en_old='both actual dated interested positions'
en_new='the actual dated union position with its interest; the actual dated employer position with its interest'
for k in ['taskContent','solutionContent']: assert de_old in wage['examData'][k]; wage['examData'][k]=wage['examData'][k].replace(de_old,de_new)
for k in ['taskContentEn','solutionContentEn']: assert en_old in wage['examData'][k]; wage['examData'][k]=wage['examData'][k].replace(en_old,en_new)
deltas=[]
for b,a in zip(before,after):
    cleanb=copy.deepcopy(b); cleana=copy.deepcopy(a)
    for k in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
        x=b['examData'][k];y=a['examData'][k]
        if x!=y: deltas.append({'materialId':a['id'],'field':'examData.'+k,'wholeBefore':x,'wholeAfter':y,'whitespaceOnly':re.sub(r'\s','',x)==re.sub(r'\s','',y)})
        cleanb['examData'][k]='';cleana['examData'][k]=''
    for i,(x,y) in enumerate(zip(b['examData']['scoring']['steps'],a['examData']['scoring']['steps'])):
        if x['description']!=y['description']:deltas.append({'materialId':a['id'],'field':f'examData.scoring.steps.{i}.description','wholeBefore':x['description'],'wholeAfter':y['description'],'whitespaceOnly':re.sub(r'\s','',x['description'])==re.sub(r'\s','',y['description'])})
        cleanb['examData']['scoring']['steps'][i]['description']='';cleana['examData']['scoring']['steps'][i]['description']=''
    assert cleanb==cleana
non=[d for d in deltas if not d['whitespaceOnly']];assert len(non)==4 and all(d['materialId']==wage['id'] for d in non)
f=V/'whole-seven-policy-DEEN.only-one-independent-two-party-boundary-and-word-spacing.DRAFT-author-v3.json';f.write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
finding=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-policy-whole-science-independent-root-v1/actual-one-entire-dated-employer-position-absence22PASS-and-observed-word-boundaries.independent-REVISE.json'
assert hashlib.sha256(finding.read_bytes()).hexdigest()=='bafebc79eb1fe246df6467c0d7d59c198c26d1a114e1b52a3c1559268f2caa18'
idx={'role':'AUTHOR_REMEDY_REQUIRES_INDEPENDENT_FOLLOWUP','wholeV2Path':str(p.relative_to(R)),'wholeV2SHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'wholeV3Path':str(f.relative_to(R)),'wholeV3SHA256':hashlib.sha256(f.read_bytes()).hexdigest(),'independentFindingPath':str(finding.relative_to(R)),'independentFindingSHA256':hashlib.sha256(finding.read_bytes()).hexdigest(),'actualWholeFieldDeltas':deltas,'actualNonWhitespaceDeltaCount':4,'actualNonWhitespaceDeltas':non,'requiresCoveredGoalIDsTagsSourceFactsScoringPointsOtherFieldsExact':True,'fairPartialAnywhereUnchanged':True,'historyUnchanged':True,'noOwnIndependentKEEP':True}
(V/'actual-one-independent-party-boundary-four-strings-and-observed-whitespace-only-followers.author.json').write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'wholeBodyPath':str(f.relative_to(R)),'wholeBodySHA256':idx['wholeV3SHA256'],'bytes':f.stat().st_size,'actualStringDeltas':len(deltas),'scientificStrings':4}))
