import json,hashlib,copy,shutil,subprocess
from pathlib import Path
from datetime import datetime,timezone
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-whole-material-and-raster-author-candidate-v1')
N=P/'inputs/ten-whole-current-direct-source-witnesses.neutral.json'
s=json.load(open(N));goals=json.load(open(P/'inputs/ten-whole-current-DE-EN-goals.neutral.json'))['wholeGoalBodies'];IDS=[g['id'] for g in goals]
def bind(f):return {'path':str(f),'sha256':'sha256:'+hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size}
def dump(f,v):f.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
he=[(r,w) for r in s['rows'] for w in r['wholeDirectSourceWitnesses'] if w['sourceDocument'].get('key')=='KC2024_BIOLOGIE_SEKII']
assert len(he)==6
baseex=Path(he[0][1]['extraction']['path']);basemap=Path(he[0][1]['mapping']['path'])
for path,b in [(baseex,he[0][1]['extraction']),(basemap,he[0][1]['mapping'])]:assert bind(path)==b
shutil.copyfile(baseex,P/'inputs/HE-whole144-before-six-source-precision.exact.json');shutil.copyfile(basemap,P/'inputs/HE-whole157-144-before-six-source-precision.exact.json')
ex=json.load(open(baseex));mp=json.load(open(basemap));before=copy.deepcopy(ex)
primary=P/'primary/HE-KC2024-biologie.whole-current.pdf.snapshot';ph=bind(primary)
q24='ein Sinnesorgan: Aufbau und Signaltransduktion (von der Sinneswahrnehmung über die Erregungsleitung zur Reaktion)'
q24lk='Gehirnaufbau und -funktion beim Menschen (Übersicht)'
q23lk='Verrechnung des Informationsflusses an Synapsen (EPSP, IPSP, räumliche und zeitliche Summation, Funktion einer hemmenden Synapse)'
q23dis='Störungen des neuronalen Systems (Prinzip: zum Beispiel Alzheimer oder Parkinson)'
conf={IDS[0]:('Q2.4','GK_LK',q24,'Didaktische Hauptbahn-Operationalisierung eines ausgewählten Sinnesorgans; genauer Weg bis Sehrinde und Faserkreuzung sind hier keine eigene amtliche Pflichtzeile. Zieltag LK wird durch den GK/LK-Oberoperator allein nicht belegt.'),IDS[1]:('Q2.4','LK',q24lk,'Verarbeitung in Arealen operationalisiert den LK-Überblick. Störungen stehen separat in Q2.3 ausschließlich im erhöhten Niveau; der aktuelle GK/LK-Zieltag ist aus diesen Passagen nicht insgesamt begründet.'),IDS[2]:('Q2.3','LK',q23lk,'Schmerzbezogene Weiterleitung/Modulation ist ein ergänzendes Anwendungskonzept zur synaptischen Verrechnung. Nozizeption und Schmerz sind in dieser Seite nicht ausdrücklich genannt; keine amtliche Schmerzkompetenz oder ganze Zieldeckung behauptet.'),IDS[3]:('Q2.4','GK_LK',q24,'Hören als gewähltes Sinnesorgan operationalisiert Aufbau/Transduktion. Der vollständige zentrale Weg bis auditorischer Cortex ist keine eigene amtliche Pflichtzeile; LK-Bindung aus diesem Oberoperator nicht belegt.'),IDS[4]:('Q2.4','GK_LK',q24,'Aufbau und Funktion ausgewählter Organe ist breitere eigene Operationalisierung. Amtlich ist EIN Sinnesorgan mit Transduktion gefordert, keine Pflicht beide Organe zu prüfen.'),IDS[5]:('Q2.4','LK',q24lk,'Eigene prüfbare Beschreibung des echten LK-Überblicks zu Gehirnaufbau/-funktion. Dies ist keine wörtliche amtliche Teilnummer Q2.4.3; genaue Auswahl der Areale ist didaktisch authored.')}
changes=[]
for row,w in he:
 gid=row['goalId'];sid=w['wholeCurrentSourceGoal']['id'];topic,course,text,why=conf[gid]
 current=next(x for x in ex['sourceGoals'] if x['id']==sid);original=copy.deepcopy(current)
 oldalias=current['sourceSpan'];locator=f'{topic}, '+('erhöhtes Niveau (Leistungskurs)' if course=='LK' else 'grundlegendes Niveau (Grundkurs und Leistungskurs)')+', physische/gedruckte S.43, unnummerierter amtlicher Spiegelstrich'
 current.update({'passageId':'he-bio-sekii:'+topic.lower(),'topicCode':topic,'sourceText':text,'parentBulletText':text,'rawSourceText':text,'rawParentBulletText':text,'sourceSpan':locator,'rawSourceSpan':locator,'sourceRef':'Hessen Kerncurriculum Biologie gymnasiale Oberstufe, Ausgabe2024, Stand01.08.2025, '+locator,'courseLevel':course,'granularity':'authoredOperationalization','sourceKind':'boundedDidacticOperationalizationOfPrimaryPrinciple','authoredComponent':True,'isOfficialBullet':False,'officialNumberingClaim':False,'sourcePage':43})
 current['tags']=[t for t in current['tags'] if not t.startswith(('courseLevel:','topic:'))]+['courseLevel:'+course,'topic:'+topic]
 current['metadata']={**current.get('metadata',{}),'authorLocalAliasBefore':oldalias,'sourcePrintedPage':43,'sourcePhysicalPage':43,'zeroBasedPdfPage':42,'localBulletIndexIsNotOfficialNumbering':True,'primarySourceTextIsTheQuotedPrincipleNotTheAuthoredDescription':True,'sourceDocumentSHA256':ph['sha256'],'actualWholePrimaryDocument':str(primary),'actualWholePrimaryPageText':str(P/'primary/HE-physical-page043.actual.txt'),'actualWholePrimaryPageRaster':str(P/'primary/HE-physical-page043.actual.png'),'primaryUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','sourceStand':'Ausgabe 2024, Stand 01.08.2025','authoredBoundedContribution':why,'wholeOriginalBulletCoverage':False,'wholeGoalPrimaryCoverageEstablished':False,'courseApplicabilityApproval':False,'independentCurrentSourceReview':'pending_two_independent_source_and_D_reviews','humanApproval':False}
 if gid==IDS[1]:current['metadata']['separateRelatedPrimaryContext']={'topicCode':'Q2.3','courseLevel':'LK','sourceText':q23dis,'physicalPage':43,'role':'Separate related context; not a combined fabricated official bullet or GK obligation'}
 for m in mp['mappings']:
  if m['legacyGoalId']==sid and m['canonicalGoalId']==gid:m['matchType']='partial'
 for d in mp['decisions']:
  if d['sourceGoalId']==sid:d.update({'topicCode':topic,'sourceSpan':locator,'matchType':'partial','rationale':why+' Eigener SOURCEFIX-Kandidat, keine neue Quellen- oder Kursfreigabe; targeted D/P/A/M-Verschränkungen neu prüfen.','reviewedAt':'2026-10-10','reviewer':'/root/docs_checkout_runtime_review AUTHOR candidate'})
 changes.append({'goalId':gid,'sourceGoalId':sid,'wholeBefore':original,'wholeAfter':copy.deepcopy(current),'mappingBefore':w['wholeCurrentMappingRecord'],'mappingAfter':next(m for m in mp['mappings'] if m['legacyGoalId']==sid and m['canonicalGoalId']==gid),'reason':why,'activeAffectedBindings':{'D':'needs_targeted_recheck','P':'needs_targeted_recheck','A':'needs_targeted_recheck','M':'needs_targeted_recheck','V':'new_image_candidate_needs_independent_visual_review','source':'needs_targeted_recheck','course':'HOLD_no_course_approval'},'activeWrites':0})
changed={r['sourceGoalId'] for r in changes}
assert all(x==next(a for a in before['sourceGoals'] if a['id']==x['id']) for x in ex['sourceGoals'] if x['id'] not in changed)
for doc in [ex['sourceDocument']]+ex.get('sourceDocuments',[]):
    doc['historicalResearchPathBeforeSourcefix']=doc['path'];doc['path']=str(primary);doc['sha256']=ph['sha256']
for passage in ex['passages']:
    if passage['id']=='he-bio-sekii:q2.4':
        passage['text']='grundlegendes Niveau (Grundkurs und Leistungskurs): '+q24+'\n'+'erhöhtes Niveau (Leistungskurs): '+q24lk
        passage['rawText']=passage['text'];passage['sourcePath']=str(primary)
        passage['sourceUrl']='https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
        passage['sourceGoalIds']=[i for i in passage['sourceGoalIds'] if i!='07c646c1-7106-40c6-9b40-38a831504f92']
        passage['metadata']={'physicalPage':43,'printedPage':43,'containsAuthoredOperationalizations':True,'noOfficialSubnumbering':True,'newSourceApproval':False}
    if passage['id']=='he-bio-sekii:q2.3' and '07c646c1-7106-40c6-9b40-38a831504f92' not in passage['sourceGoalIds']:
        passage['sourceGoalIds'].append('07c646c1-7106-40c6-9b40-38a831504f92')
ex['authorBio10SourcePrecisionSuccessor']={'status':'ai_candidate_needs_independent_source_and_course_review','changedSourceGoalIds':sorted(changed),'preservedOtherSourceGoals':138,'originalFakeLocatorsRetainedOnlyAsHistoricalAliases':True,'officialNumberingClaim':False,'newSourceApproval':False}
ex['extractionId']=ex['extractionId']+'-bio10-six-source-precision-author-v1'
expath=P/'sourcefix/HE-whole144-six-precision-authored-operationalization.candidate.json';mppath=P/'sourcefix/HE-whole157-144-six-partial-edges.candidate.json'
mp['sourceExtractionPath']=str(expath);mp['authorBio10SourcePrecisionSuccessor']={'status':'ai_candidate_needs_independent_review','changedSourceGoalIds':sorted(changed),'newSourceApproval':False,'activeWrites':0}
dump(expath,ex);dump(mppath,mp)
dump(P/'sourcefix/six-exact-primary-source-precision-deltas.author.json',{'schemaVersion':1,'createdAt':datetime.now(timezone.utc).isoformat(),'role':'Actual primary reading and own AUTHOR sourcefix candidate; not independent approval','wholeOriginal41Witnesses':bind(N),'primaryWholePDF':ph,'primaryPhysical43Text':bind(P/'primary/HE-physical-page043.actual.txt'),'primaryPhysical43Raster':bind(P/'primary/HE-physical-page043.actual.png'),'changes':changes,'otherDirectPartnersBoundedAssessment':[{'goalId':IDS[0],'sourceGoalId':'ad855269','contribution':'BY B8.2.2 supports light perception via eye/retina/brain and optical defects; it is broader SekI context, not an independent explicit LK central-visual-route requirement. Exact edge requires targeted review.','wholeGoalSourceCoverageEstablished':False},{'goalId':IDS[3],'contribution':'BY B8.2.3 hearing-damage prevention is a partial applied contribution; it does not literally supply the complete auditory pathway.','wholeGoalSourceCoverageEstablished':False},{'goalId':IDS[2],'contribution':'Only current direct HE source partner, with no explicit pain/nociception bullet on the actual page. No new direct curricular partner invented.','wholeGoalSourceCoverageEstablished':False}], 'allTenNextChecks':[{'goalId':i,'currentSourceWitnesses':len(next(r for r in s['rows'] if r['goalId']==i)['wholeDirectSourceWitnesses']),'D':'needs_targeted_recheck_after_source_or_native_change' if i in conf else 'independent_current_D_pending','P':'current_before_raster_candidate_native_and_picture_rebind_pending','A':'independent_current_semantic_boundary_check_pending','M':'independent_current_policy_check_pending','V':'independent_actual_raster_and_native_review_pending'} for i in IDS],'strictGain':0,'humanApproval':False,'courseApproval':False,'operativeWrites':0})
print('Six source precision deltas, whole144/157/144 successors; unchanged138source goals preserved')
