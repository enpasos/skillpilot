import pathlib,json,hashlib,copy,datetime
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');A=B/'biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1';O=B/'biologie-stoffwechsel-first-three-operative-scope-independent-b-20261008-v1';P=B/'biologie-stoffwechsel-first-three-source-roles-independent-b-20261008-v1'
def r(p):return json.loads(pathlib.Path(p).read_text())
def w(name,v):(O/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def b(p):
 p=pathlib.Path(p);v=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(v).hexdigest(),'bytes':len(v)}
checks=[]
def ck(name,ok,detail=None):
 x={'check':name,'pass':bool(ok)}
 if detail is not None:x['detail']=detail
 checks.append(x)
selected=['32f47903-0788-5c27-ac88-7464f481f2f7','135447a0-5d55-564a-afc3-3e3fbed77819','ec782ce3-475e-5628-b3fe-947d72e74a74']
diff=r(A/'candidate/authoritative-decision-and-compatible-edge.current20-removals.diff.json');beforecanonical=r(A/'input/canonical.current476.after19.exact.json');goals={g['id']:g for g in beforecanonical['goals']};duties=r(A/'input/twenty-current-whole-source-duties-and-decisions.exact.json')['rows'];partners=r(A/'input/all268-current-whole-partner-bodies-after19.exact.json')['rows']
byoriginal={g['original']['path']:g['portableExactInput']['path'] for g in r(A/'input/actual-current476-after19-input.guards.json')['guards']}
changes=[];removed=0
for mc in diff['mappingChecks']:
 old=r(byoriginal[mc['original']['path']]);new=r(mc['candidate']['path']) if 'candidate' in mc else r(mc['original']['path']);sid=set(mc.get('changedSourceIds',[]));oldrows={d['sourceGoalId']:d for d in old['decisions']};newrows={d['sourceGoalId']:d for d in new['decisions']}
 ck('same decision/source set:'+mc['original']['path'],oldrows.keys()==newrows.keys())
 for id,x in oldrows.items():
  y=newrows[id]
  if id not in sid:ck('unrelated whole decision exact:'+id,x==y)
  else:
   rm=[t for t in x['canonicalGoalIds'] if t not in y['canonicalGoalIds']];ck('selected removals only no added target:'+id,bool(rm) and set(rm)<=set(selected) and y['canonicalGoalIds']==[t for t in x['canonicalGoalIds'] if t not in rm] and y['decision']=='mapped' and bool(y['reviewer']) and bool(y['reviewedAt']))
   changes.append({'sourceGoalId':id,'removed':rm});removed+=len(rm)
 oldm=old['mappings'];newm=new['mappings'];expected=[m for m in oldm if not(m['legacyGoalId'] in sid and m['canonicalGoalId'] in next(x['removed'] for x in changes if x['sourceGoalId']==m['legacyGoalId']))]
 ck('compatibility edges remove exactly same target pairs:'+mc['original']['path'],newm==expected)
 ck('all other root mapping fields exact:'+mc['original']['path'],{k:v for k,v in old.items() if k not in ['decisions','mappings']}=={k:v for k,v in new.items() if k not in ['decisions','mappings']})
ck('15whole decisions20edges',len(changes)==15 and removed==20)
for row in duties:
 ext=r(byoriginal[row['sourceExtractionPath']]);sg=next(g for g in ext['sourceGoals'] if g['id']==row['wholeSourceDuty']['id']);ck('whole original source duty exact:'+str(row['sourceOrdinal']),sg==row['wholeSourceDuty'])
for i,x in enumerate(partners):ck('whole actual partner body exact:'+str(i+1),goals[x['wholeCurrentCanonicalPartnerBody']['id']]==x['wholeCurrentCanonicalPartnerBody'])
ck('20duties268wholepartners',len(duties)==20 and len(partners)==268)
base=r(A/'native/current392.ordinary-model.before.exact.json');after=r(A/'native/current392.ordinary-model.after.actual-candidate.json');bp={x['goalId']:x for x in base['pages']};ap={x['goalId']:x for x in after['pages']};pagechanges=[]
ck('whole392sameorderedgoaluniverse',[x['goalId'] for x in base['pages']]==[x['goalId'] for x in after['pages']] and len(ap)==392)
for id,x in bp.items():
 y=ap[id]
 if id not in selected:ck('unrelated whole page exact:'+id,x==y)
 else:
  fields=[k for k in x if x[k]!=y[k]];ck('selected scientific/png/context/goal-fingerprints exact:'+id,set(fields)=={'applicability','pageFingerprint'})
  scopes=[{'jurisdiction':g['jurisdiction'],**s} for g in y['applicability'] for s in g['scopes']]
  ck('advanced whole target no SekI and HE retained:'+id,all(z['stage']!='SekI' for z in scopes) and any(z['jurisdiction']=='DE-HE' and z['stage']=='SekII' for z in scopes) and (id!=selected[2] or all(z['jurisdiction']!='DE-BY' for z in scopes)))
  pagechanges.append({'goalId':id,'actualChangedFields':fields,'actualWholeAfterApplicability':y['applicability']})
bs=r(A/'native/current392.original-sources.before.exact.json');ns=r(A/'native/current392.original-sources.after.actual-candidate.json')
def resolved(index,id):
 ev={e['id']:e for e in index['evidence']};doc={d['id']:d for d in index['documents']}
 def expand(v):
  if isinstance(v,list):return [expand(x) for x in v]
  if isinstance(v,dict):
   out={k:expand(x) for k,x in v.items()}
   if 'evidenceIds' in out:out['evidenceIds']=sorted(out['evidenceIds'],key=lambda x:json.dumps(x,sort_keys=True,ensure_ascii=False))
   return out
  if isinstance(v,str) and v in ev:
   e=copy.deepcopy(ev[v]);d=copy.deepcopy(doc[e['documentId']]);e.pop('id',None);e.pop('documentId',None);d.pop('id',None);e['document']=d;return e
  return v
 return expand(index['goals'][id])
for id in ap:
 if id not in selected:ck('unrelated whole resolved source evidence exact:'+id,resolved(bs,id)==resolved(ns,id))
old=r(P/'three-whole-targets25-source-roles.actual-independent-b.first-verdict.json');holds=r(A/'candidate/four-original-operator-HOLDs.exact-KEEP.json')['residuals']
ck('all4originalBoperatorHOLDsretained',len(holds)==4 and all(any(h['sourceGoalId']==q['sourceGoalId'] and h['status']==q['status'] for h in holds) for q in old['preservedFourRealOriginalOperatorHolds']))
comp=r(A/'pending-companions/two-real-basic-goal-bodies.ai-candidate.json');ck('2realcompanionbodiespendingoutside392',len(comp['goalTemplates'])==2 and all(g['id'] not in goals and g['id'] not in ap for g in comp['goalTemplates']) and comp['strictClosedCountClaimed']==0)
fail=[x for x in checks if not x['pass']]
w('actual15-decisions20-edges268-partners392-pages.independent-b.check.json',{'checks':checks,'failureCount':len(fail),'failures':fail,'wholeDecisionChanges':changes,'actual20RemovedEdges':removed,'actualThreePageChanges':pagechanges,'all389WholeOtherPagesAndResolvedOriginalSourceContentExact':not fail,'oldFourOperatorHoldsRetained':True,'pendingCompanionsRemainOutside392':True,'activeWrites':0,'strictGain':0,'humanApproval':False})
assert not fail,fail
records=[]
reason_by_ord={1:'RLP3.2 trägt die Vernetzung von Stoffkreisläufen, Energiefluss und grundlegender Fotosynthese; die vollständige Q3-Modellroutine mit Licht-/Dunkelkopplung und Einflussanalyse wird daraus nicht als Ganzes abgeleitet.',2:'RLP3.3 verlangt das Prinzip der menschlichen Energieversorgung und die Gegenüberstellung aeroben/anaeroben Abbaus; das ist keine Pflicht zur ganzen Glykolyse/Citratzyklus/Atmungsketten-Skizze.',3:'Der Berliner RLP3.2-Originalbeleg bleibt getrennt erhalten; die grundlegende Ökosystemvernetzung rechtfertigt die gleiche Begrenzung wie BB, keine fiktive Leistungsfachzuordnung.',4:'Der Berliner RLP3.3-Originalbeleg bleibt getrennt; Grundprinzip und aerober/anaerober Abbau tragen die fehlende grundlegende Kompetenz, nicht das ganze Q3-Stadienschema.',6:'Die tatsächliche BY-11/12-Pflicht ist Chromatographie des Blattfarbstoffgemischs. Der theoretische Lichtsammelkomplex ist fachlich ein Kontext, kein Verfahrensvollzug. Seine ganze Pflichtzielplatzierung in BY-GK/LK wird richtig zurückgenommen; der verbleibende Lichtabhängigkeits-Partner schließt Chromatographie ebenfalls nicht.',11:'MV8 verlangt grundlegende Assimilation/Dissimilation und Atmung/Kreislauf. Die ganzen HE-Q3-Modell- und Atmungsstadienroutinen gehen über diesen Beitrag hinaus; die tatsächliche Grundkompetenz bleibt im offenen Companion-Verfahren.',12:'NW-Samenpflanzen verlangt Bedeutung und grundlegende Erklärung der Fotosynthese, keinen ganzen Q3-Licht-/Dunkelmechanismus mit Oberstufenmodell. Die übrigen Pflanzenorgane-/Keimungs-/Fortpflanzungs-Partner bleiben erhalten.',13:'NW-Ökologie verlangt Energiefluss/Stoffkreislauf/Natur- und Umweltschutz. Dies stellt einen Stoffwechselkontext bereit, keine vollständige dreistufige Zellatmungsroutine.',14:'SH-SekI führt Stoff-/Energieumwandlung und Organismus-/Ökosystembezüge zusammen. Die Oberstufenziele1/2 sind in ihrer ganzen Routine nicht universell aus diesem breiten Grundbeitrag verpflichtend; die Originalkompetenzen werden nicht gelöscht.',15:'SN9 enthält tatsächliche Licht-/Dunkelreaktionskopplung und Grundzusammenhänge der Zellatmung. Diese echte SekI-Pflicht bleibt ausdrücklich im pending Kopplungs-Companion und grundlegenden Zellatmungs-Companion erhalten. Die Entfernung der ganzen HE-Q3-Ziele darf deshalb nur begrenzte Scope-Behebung, keine ganze SN-Pflichtabdeckung heißen.',16:'ST-Zellen/Mikroorganismen trägt Gärung/Experimentieren als eigenen Beitrag. Die ganze Q3-Zellatmungsroute ist kein Ersatz; Schüler-Gärungsversuche mit Temperatur bleiben tatsächlicher offener Operator.',17:'ST-Menschliche Systemebenen verlangt grundlegende Zellatmungs-/Energieversorgung im Organsystemkontext. Der offene grundlegende Companion erhält diese Pflicht; die drei Oberstufenabbauwege werden nicht aus dem Systemrahmen erzwungen.',18:'ST-Samenpflanzen verlangt Fotosynthese/Dissimilation und Stoff-/Energiestoffwechsel auf Systemebenen. Grundgleichung/Energiebeziehungen bleiben echte Pflichten; die ganzen HE-Q3-Routinen1/2 werden passend aus dieser SekI-Zielplatzierung entfernt.',19:'TH7/8 menschliche Organsysteme und Stoffwechsel tragen Energieversorgung und Atmungsbezüge, kein vollständiges Oberstufenstadienschema. Die übrigen vielen originalen Partner bleiben unverändert.',20:'TH9/10 verlangt Pflanzenphysiologie, organische Stoffbildung, Zellatmung und tatsächliche Versuche. Diese Grund-/Praxisanteile dürfen nicht durch ein theoretisches Q3-Schema als vollständig erledigt ausgegeben werden; die Originalpflicht und alle anderen Partner bleiben erhalten.'}
for row in diff['rows']:
 records.append({'sourceOrdinal':row['sourceOrdinal'],'sourceGoalId':row['sourceGoalId'],'decision':'ACCEPT_BOUNDED_OPERATIVE_TARGET_REMOVAL','actualRemovedWholeTargetIds':row['removedMisplacedTargetIds'],'independentReasonDe':reason_by_ord[row['sourceOrdinal']],'remainingOriginalDutiesAndPartnerTextsRetained':True,'pendingBasicCompanionsApproved':False,'wholeRegionalDutyCoverageApproved':False})
(O/'15-actual-operative-decisions.independent-b.records.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in records))
w('operative-scope-b.actual-first-verdict.json',{'createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'independent B','decision':'ACCEPT_BOUNDED_ACTUAL_ORDINARY_PROJECTION_REMEDIATION','resolvesOwnPriorFinding':'BIO123-B-OPERATIVE-PROJECTION-UNCHANGED','actual15WholeDecisionsChanged':15,'actual20MisplacedTargetEdgesRemoved':20,'actualOrdinaryFunctionRerun':b(O/'ordinary-atlas-current392.actual-independent-b.run.json'),'actual22SourceViews':22,'actualChangedWholeSourceViews':10,'allOther12WholeViewsExact':True,'actual392WholePagesCompared':392,'actual3ApplicabilityAndPageFingerprintChanges':pagechanges,'allOther389WholePageValuesAndResolvedOriginalSourceContentExact':True,'whole476CanonicalGoalsUnchanged':True,'wholeCurrent3ScientificBodiesAndAllCurrentRastersContextsUnchanged':True,'semanticKindsQAAndAllHumanFieldsUnchanged':True,'whole20SourceDuties268WholePartnerInputsRetained':True,'prior25BoundedSourceRoleJudgmentsRetainedNotNewReviews':True,'original28PrimaryPagesAnd2BYHTMLReadingRetained':b(P/'three-source-roles-b.first-verdict.seal.json'),'actualHEFull3SourcePlacementRetained':True,'BYAdvanced12TheoryContributionsRetainedWithOriginalOperatorHolds':True,'BYChromatographyNotLHCWholeApproval':True,'original4OperatorHoldsRetained':holds,'pendingBasicCompanions':comp['goalTemplates'],'pendingCompanionsRemainNotApprovedNotIn392':True,'noWholeRegionalSourceCoverageApproval':True,'peerNewOperativeSourceAReadBeforeFirstSeal':False,'nativeDOrPOrVNewlyApproved':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'checkCount':len(checks),'failures':fail,'records':len(records),'actual15decisions20edges':True,'whole392compared':True}))
