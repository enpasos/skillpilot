import collections, datetime, hashlib, json, pathlib, re
from read_group import GROUPS, GOALS, PROFILES, ANCHORS, CELLS, BASE

OUT=pathlib.Path(__file__).parent
SELECTOR=BASE/'SELECTOR.clean-current437-requires-closure-independent-science-inputs.sealed.json'
EXPECTED_SELECTOR='ed274c616121f0e0a4368a625b40a5f6b0ed59770eac66a11b37263415d43de0'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,x):
    with (OUT/name).open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
def pin(p):
    p=pathlib.Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}

assert sha(SELECTOR)==EXPECTED_SELECTOR
selector=json.loads(SELECTOR.read_text())
primaries=selector['exactLocalPrimaryPartners']
physical=json.loads((OUT/'FIRST-PHYSICAL-EDGE-DECISIONS.frozen.json').read_text())['groups']
physicalByEdge={(x['prerequisiteGoalId'],x['directDependentGoalId']):x for x in physical}
assert len(physicalByEdge)==83
sources=json.loads((OUT/'FIRST-SOURCE-READING-DECISIONS.frozen.json').read_text())['rows']
sourceByPair={s['pairKey']:s for s in sources}
assert len(sourceByPair)==109

# Preserve first wording, and disclose the two locator refinements separately.
errata=[{'pairKey':s['pairKey'],'firstActualPDFPages':s['actualPDFPages'],
         'correctActualPDFPages':[30],
         'reasonDe':'Die ausgewählte MV-Löslichkeitszelle steht tatsächlich auf PDF-S.30, gedruckte S.26; PDF-S.28 enthält den Säure-Base-Titrationsteil. Inhaltlicher LK-Befund und HOLD bleiben unverändert.'}
        for s in sources if s['groupIndex']==27 and s['jurisdiction']=='DE-MV']
errata +=[{'pairKey':s['pairKey'],'firstActualPDFPages':s['actualPDFPages'],
           'correctActualPDFPages':[37,38],
           'reasonDe':'Die ausgewählte Geschichte/Grundlagen der Arzneimittelkunde steht auf S.37; die geprüfte alternative Arzneimittelforschung/Qualitätskontrolle auf S.38. Beide sind Wahlangebote. HOLD wegen fehlendem konkretem vollständigem aktuellen Schmerzmittel-Rechercheoperator bleibt unverändert.'}
          for s in sources if s['groupIndex']==35 and s['jurisdiction']=='DE-RP']
write('SOURCE-READING-LOCATOR-ERRATA.frozen.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'firstSourceDecisionsUnchanged':True,'errata':errata})
pageCorrections={e['pairKey']:e['correctActualPDFPages'] for e in errata}

ea=pathlib.Path('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-halftitration-electrophoresis-two-source-course-targeted-author-successor-20261016-v1/primary/BY-C13-erhoeht.actual.html')
assert sha(ea)=='10cbe247c5cb05ed5a11db607b6ebe0a77f6e242692372443e15e5945a94397a'
ga=OUT/'primary-cache/BY-C13-GA.actual-read.html'
assert sha(ga)=='cb55b51375001b19f5b605800a1c62a89a0d2669d6559e1e2be5d7bdce757c4a'
byOriginals=[dict(pin(ea),url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/chemie/erhoeht',
                 clause='C13 4.1 Natürliche Makromoleküle, Kompetenzerwartung zur Durchführung von Nachweisen für Aminocarbonsäuren/Peptide',
                 officialCourse='Chemie 13, erhöhtes Anforderungsniveau',originalSeparatelyRead=True),
             dict(pin(ga),url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/chemie/grundlegend',
                 clause='C13 4.1 Natürliche Makromoleküle, Kompetenzerwartung zur Durchführung von Nachweisen für Aminocarbonsäuren/Peptide',
                 officialCourse='Chemie 13, grundlegendes Anforderungsniveau',originalSeparatelyRead=True,
                 retrievedOnUTC='2026-10-17',cacheOnlyNotPortablePayload=True)]
write('ADDITIONAL-ORIGINAL-PRIMARY-LOCATORS.frozen.json',{'originals':byOriginals,
      'note':'Portable proof is exact original hash, official URL, course and narrow clause. Full HTML and PDF text caches are not portable evidence payloads and must not be committed.'})

def primaryForCell(c):
    m=c['sourceDocumentMetadata'];docs=[m.get('sourceDocument',{})]+m.get('sourceDocuments',[])
    result=[]
    for doc in docs:
        paths=[doc.get('path'),doc.get('localPath')]
        for path in paths:
            if not path:continue
            name=pathlib.Path(path).name
            matches=[p for p in primaries if pathlib.Path(p['path']).name.endswith('-'+name)]
            for p in matches:
                result.append(dict(p,url=doc.get('url') or doc.get('officialUrl'),documentKey=doc.get('key'),
                                   documentTitle=doc.get('title'),originalPageReadForThisDocket=False))
    # Avoid silently pretending the authored BY export is the official clause.
    return list({r['path']:r for r in result}.values())

def binding(aid):
    a=ANCHORS[aid];c=CELLS[a['sourceCellId']];s=c['wholeCurrentSourceGoal'];m=c['sourceDocumentMetadata']
    t=s.get('sourceText') or s.get('description') or ''
    return {'anchorId':aid,'anchorSHA256':digest(a),'endpointGoalId':a['endpointGoalId'],
      'sourceCellId':a['sourceCellId'],'sourceCellSHA256':digest(c),
      'sourceGoalId':s.get('id'),'sourceRefExact':s.get('sourceRef'),
      'sourceSpanExact':s.get('sourceSpan'),'rawCourseLevel':s.get('courseLevel'),
      'rawStage':m.get('stage'),'sourceClauseLocatorExcerpt':t[:260],
      'excerptIsFullSourceGoal':len(t)<=260,
      'originalPartners':primaryForCell(c),
      'mappingMatchType':a['mappingProvenance']['wholeMappingEdge']['matchType'],
      'mappedTargetToEndpointContainsPath':a['mappingProvenance']['mappedCanonicalTargetToEndpointContainsPath']}

def originalReading(s):
    p=s['primaryPrefix']
    if p=='BY-ORIGINALS':return {'originals':byOriginals,'actualClause':'C13 4.1','actualOriginalCourseStageProgram':s['originalCourseStageProgram']}
    if not p:return {'originals':[],'primaryLimitDe':'Kein hinreichender passender Original-/Operator-/Kursnachweis für diese Paarzeile; genaue Quellzelle und Original-Locator sind separat gebunden.'}
    matches=[x for x in primaries if pathlib.Path(x['path']).name.startswith(p)]
    assert len(matches)==1,(p,matches)
    pp=matches[0]; urls=[]
    for aid in s['witnessAnchorIds']:
        for item in primaryForCell(CELLS[ANCHORS[aid]['sourceCellId']]):
            if item['path']==pp['path'] and item.get('url'):urls.append(item['url'])
    return {'originals':[dict(pp,url=next(iter(urls),None),originalSeparatelyRead=True)],
      'actualPDFPages':pageCorrections.get(s['pairKey'],s['actualPDFPages']),
      'actualOriginalCourseStageProgram':s['originalCourseStageProgram'],
      'narrowOriginalFindingDe':s['sourceScientificReasonDe'],
      'rawMetadataNotRewritten':True,'locatorErratumApplied':s['pairKey'] in pageCorrections}

def flaggedReason(d,b):
    reasons=[];flags=d['knownOpenSourceFlags']
    for f in flags:
        if 'SN-current' in f:reasons.append('Das aktuelle sächsische Quelleninventar und die Deckung der vollständigen aktuellen Kompetenz sind noch nicht geklärt; ein einzelner ursprünglicher Inhalt trägt keine Freigabe des ganzen Bestands.')
        elif 'HB97' in f:reasons.append('Die Bremer Granularität und Bestandszählung bleiben offen; der konkrete Einzelanker liefert keine whole97-Freigabe und belegt nicht automatisch den gesamten aktuellen Operatorumfang.')
        elif 'Separate selected BcP' in f:reasons.append('Der konkrete Anker gehört zum separat gewählten BcP-Praktikums-/Projektprogramm. Auswahl, tatsächliche praktische Tätigkeit und programmgerechte Platzierung sind nicht als allgemeine Chemie-GK/LK-Pflicht belegt.')
        elif 'not target' in f:reasons.append('Der belegte Endpunkt ist in keiner aktuellen Landes-Zielprojektion target. Eine tatsächlich passende Platzierung und fachliche Erwerbspflicht für den Ausgangspunkt fehlen.')
        elif 'Whole selected path' in f:reasons.append('Der ganze ausgewählte Pfad besteht den aktuellen Kursfilter nicht für alle Zielkurse des Vorziels: '+str(d['prerequisiteTargetCoursesWithoutSameCourseWholePath'])+'. Ein kursgleicher konkreter Alternativpfad ist nicht unabhängig belegt.')
        else:raise ValueError(f)
    reasons.append('Konkreter ursprünglicher Anker: '+str(b['sourceRefExact'])+'; Rohkurs '+str(b['rawCourseLevel'])+'.')
    return ' '.join(reasons)

pairRows={}; groupRows=[]
for i,g in enumerate(GROUPS):
    pg=physical[i];assert pg['reviewGroupId']==g['reviewGroupId']
    dossiers=[]
    for d in g['jurisdictionDockets']:
        key=d['goalId']+'::'+d['jurisdiction'];path=d['technicalSelectedPathPrerequisiteToDependent']
        edges=[physicalByEdge[(a,b)] for a,b in zip(path,path[1:])]
        rejected=[e for e in edges if e['physicalNecessityDecision']=='reject']
        b=binding(d['endpointAnchorId']);s=sourceByPair.get(key)
        if d['knownOpenSourceFlags']:
            verdict='hold';reason=flaggedReason(d,b);basis='known-source-course-placement-program-qualification'
        elif rejected:
            verdict='reject';basis='concrete-unnecessary-edge-in-selected-chain'
            reason=' '.join(e['scientificNecessityRationaleDe'] for e in rejected)
            reason+=' Der konkrete Endanker ('+str(b['sourceRefExact'])+', Rohkurs '+str(b['rawCourseLevel'])+') kann diese fachlich unnötige volle Zwischenkompetenz nicht in eine notwendige Vorleistung verwandeln.'
        else:
            assert s,key;verdict=s['decision'];reason=s['sourceScientificReasonDe'];basis='actual-original-source-reading'
        row={'pairKey':key,'goalId':d['goalId'],'jurisdiction':d['jurisdiction'],
             'decision':verdict,'decisionBasis':basis,'scientificReasonDe':reason,
             'decisionAppliesTo':'Concrete selected source-surrogate candidate and explicitly checked same-endpoint witness alternatives; not a claim that no future alternative can exist.',
             'selectedLiteralRequiresPath':path,'selectedEndpointAnchor':b,
             'fullCurrentGoalBindings':[{'goalId':gid,'title':GOALS[gid]['title'],
                  'wholeCurrentGoalSHA256':digest(GOALS[gid]),
                  'wholeCurrentProfileSHA256':digest(PROFILES.get(gid)),
                  'hasCurrentProfile':gid in PROFILES} for gid in path],
             'everyIntermediateEdgeJudgment':[{'reviewGroupId':e['reviewGroupId'],
                  'prerequisiteGoalId':e['prerequisiteGoalId'],'dependentGoalId':e['directDependentGoalId'],
                  'physicalNecessityDecision':e['physicalNecessityDecision'],
                  'concreteScientificReasonDe':e['scientificNecessityRationaleDe']} for e in edges],
             'knownOpenSourceFlags':d['knownOpenSourceFlags'],
             'actualCurrentTargetCourseScopeContexts':d['actualCurrentTargetCourseScopeContexts'],
             'prerequisiteTargetCoursesWithoutSameCourseWholePath':d['prerequisiteTargetCoursesWithoutSameCourseWholePath'],
             'endpointNotATargetInAnyCurrentStateScope':d['endpointNotATargetInAnyCurrentStateScope'],
             'chainIncludesSeparateBcPProgram':d['chainIncludesSeparateBcPProgram'],
             'sameEndpointWitnessAlternatives':[],
             'allReachableAlternativesExhaustivelyApproved':False,
             'acquisitionSupportOnly':True,'directOfficialPrerequisiteClaim':False,
             'actualLearnerPerformanceCertified':False,'M7Passed':False}
        if s:
            row['sameEndpointWitnessAlternatives']=[binding(a) for a in s['witnessAnchorIds']]
            row['sourceOriginalReading']=originalReading(s)
            row['scopeQualificationDe']=s['scopeQualificationDe']
            row['originalMechanicallySelectedAnchorRetainedForAudit']=True
        else:
            row['sourceOriginalReading']={'originals':[],
                'primaryLimitDe':'Kein positiver Quellenbefund behauptet: der konkrete ausgewählte Pfad ist fachlich verworfen oder wegen expliziter Quellen-/Kurs-/Programmlücke zurückgestellt. Original-Locator und exakter Zellinhalt bleiben als Input nachprüfbar gebunden.'}
        if key not in pairRows:pairRows[key]=row
        else:
            prev=pairRows[key]
            assert prev['decision']==row['decision'] and prev['selectedLiteralRequiresPath']==path
        dossiers.append({'pairKey':key,'jurisdiction':d['jurisdiction'],'decision':verdict,
                         'scientificReasonDe':reason,'selectedEndpointAnchorId':d['endpointAnchorId'],
                         'sourceRefExact':b['sourceRefExact'],'rawOriginalCourse':b['rawCourseLevel'],
                         'fullPairRecord':'FIRST-JURISDICTION-PAIR-DECISIONS.frozen.json#'+key})
    groupRows.append(dict(pg,jurisdictionJudgments=dossiers))

assert len(pairRows)==315 and len(groupRows)==83
assert sum(len(g['jurisdictionJudgments']) for g in groupRows)==323
assert sum(bool(r['knownOpenSourceFlags']) for r in pairRows.values())==65
assert all(r['decision']=='hold' for r in pairRows.values() if r['knownOpenSourceFlags'])
assert all(all(e['physicalNecessityDecision']=='approve' for e in r['everyIntermediateEdgeJudgment']) for r in pairRows.values() if r['decision']=='approve')
assert all(r['sourceOriginalReading']['originals'] for r in pairRows.values() if r['decision']=='approve')

at=datetime.datetime.now(datetime.timezone.utc).isoformat()
summary={'uniqueJurisdictionPairDockets':315,'groupDocketsIncludingRepeatedIntermediateAppearances':323,
         'physicalGroups':83,'physicalDecisions':dict(collections.Counter(p['physicalNecessityDecision'] for p in physical)),
         'pairDecisions':dict(collections.Counter(r['decision'] for r in pairRows.values())),
         'sourceFlaggedPairsHeld':65,'unflaggedPairs':250,
         'unflaggedRejectedSelectedRoutes':141,'unflaggedSourceHoldsAfterPhysicalPass':55,
         'positiveScientificAcquisitionSupportCandidates':54}
write('FIRST-JURISDICTION-PAIR-DECISIONS.frozen.json',{'atUTC':at,'reviewer':'fresh-independent-scientific-B',
      'cleanSelector':pin(SELECTOR),'summary':summary,'pairs':list(pairRows.values())})
write('FIRST-GROUP-AND-JURISDICTION-DECISIONS.frozen.json',{'atUTC':at,'reviewer':'fresh-independent-scientific-B',
      'summary':summary,'groups':groupRows})
write('FIRST-SCIENTIFIC-B-SUMMARY.frozen.json',dict(summary,atUTC=at,sourceABOutputsRead=False,
      canonicalWrites=0,sourceWrites=0,registryWrites=0,gateRelaxations=0,MainWrites=0,KWrites=0,
      fullBuilds=0,unanchoredPairsStillOpen={'noWitness':55,'noEligibleEndpoint':54,'unresolvedConcreteSourceRowPartner':13},
      sourceAcceptanceOrM7Claimed=False,sourceReviewIndependence='No other reviewer output, corrector decisions, or prior scientific verdict read.'))
print(json.dumps(summary,ensure_ascii=False))
