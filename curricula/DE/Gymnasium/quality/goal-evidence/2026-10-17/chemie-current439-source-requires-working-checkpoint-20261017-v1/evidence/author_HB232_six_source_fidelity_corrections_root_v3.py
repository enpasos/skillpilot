from pathlib import Path
import copy, datetime, hashlib, json, shutil

E=Path('/mnt/e/skillpilot-chemie-L7-20261017')
OLD=E/'current439-HB-whole-primary-source-inventory-author-successor-v2/candidate/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.AUTHOR-PENDING.description-only-v2.json'
HC=E/'current439-HB-primary232-neutral-scientific-review-preparation-root-v1'
A=E/'current439-HB-primary232-inventory-informed-independent-a-v1/FIRST.HB232-informed-A.scientific-findings.sealed.json'
B=E/'current439-HB-primary232-inventory-informed-independent-b-v1/FIRST.HB-primary232.informed-B.scientific.frozen.md'
O=E/'current439-HB-whole-primary-source-inventory-author-successor-v3'
assert not O.exists()
(O/'candidate').mkdir(parents=True)
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def w(p,d):
 with p.open('x') as f:json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
guards=[pin(p) for p in [OLD,A,B,HC/'SELECTOR.clean-HB-primary232-whole-science-for-independent-source-review.sealed.json',HC/'REVIEW.HB-current232-whole-source-clauses-terms-optional-derived.safe.json',HC/'GyO_Chemie_2022.primary-exact.pdf']]
assert guards[0]['sha256']=='78e6a31de4e556e3d8a1e81f4bad9f230a02d921568ab7728d470a768cae32b8'
assert guards[1]['sha256']=='f6c4ee34c53dfa167e6107992c35ec6c2468cbd2332052cc6961e6f8e7c90035'
assert guards[2]['sha256']=='d1e275babfd2a2d0c462e287c523d70add5083d2cb44870a98b9b18e1d6d70e3'
original=json.loads(OLD.read_text());candidate=copy.deepcopy(original)
changes={
 0:{'text':'Ordnungsprinzipien für Stoffe beschreiben, begründen und anwenden','description':'Die lernende Person kann Ordnungsprinzipien für Stoffe beschreiben und begründen und diese anwenden.','basis':'S1 physical/printed7: preserve describing and justifying the principles as well as applying them; existing provenance already records all operators.'},
 20:{'text':'Experiment- oder modellbasierte Vorgehensweisen planen, gegebenenfalls mit Variablenkontrolle, auch zur Prüfung von Hypothesen, Aussagen oder Theorien','description':'Die lernende Person kann experiment- oder modellbasierte Vorgehensweisen, auch zur Prüfung von Hypothesen, Aussagen oder Theorien, gegebenenfalls unter Berücksichtigung der Variablenkontrolle planen.','basis':'E4 physical/printed9: retain also, the three alternative objects and conditional variable control; do not add a conduct requirement or universal hypothesis-testing quota.'},
 28:{'text':'Möglichkeiten und Grenzen des konkreten Erkenntnisgewinnungsprozesses und der gewonnenen Erkenntnisse reflektieren, beispielsweise mit Blick auf Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logische Konsistenz oder Vorläufigkeit','description':'Die lernende Person kann Möglichkeiten und Grenzen des konkreten Erkenntnisgewinnungsprozesses und der gewonnenen Erkenntnisse reflektieren, beispielsweise mit Blick auf Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logische Konsistenz oder Vorläufigkeit.','basis':'E12 physical/printed9: preserve possibilities/limits and illustrative status of the five examples, without inventing a fixed five-part evidence quota.'},
 54:{'text':'Auswirkungen chemischer Produkte, Methoden, Verfahren und Erkenntnisse sowie des eigenen Handelns im Sinne nachhaltiger Entwicklung aus ökologischer, ökonomischer und sozialer Perspektive beurteilen und bewerten','description':'Die lernende Person kann Auswirkungen chemischer Produkte, Methoden, Verfahren und Erkenntnisse sowie des eigenen Handelns im Sinne nachhaltiger Entwicklung aus ökologischer, ökonomischer und sozialer Perspektive beurteilen und bewerten.','basis':'B13 physical/printed12: restore the explicitly named Verfahren and Erkenntnisse alongside products, methods and own action; preserve both judgment operators and three sustainability perspectives.'},
 209:{'text':'Durch Nanostrukturierung und Nanopartikelverstärkung hervorgerufene Eigenschaftsänderungen von Kunststoffen beschreiben','description':None,'basis':'LK plastics physical/printed34: align stale title/source/parent/passage copies with the already correct current description. Keep that description and course provenance exact.'},
 231:{'text':'Auswirkungen der Entwicklung neuer Medikamente anhand ausgewählter Beispiele in historischen und aktuellen gesellschaftlichen Zusammenhängen bewerten','description':'Die lernende Person kann die Auswirkungen der Entwicklung neuer Medikamente anhand ausgewählter Beispiele in historischen und aktuellen gesellschaftlichen Zusammenhängen bewerten.','basis':'Process clause physical/printed36: consequences of development are the evaluation object. Keep theme4.3 LK applicability and selected examples, not a universal medication or clinical approval.'},
}
deltas=[];changed_passages=set()
for i,change in changes.items():
 old=original['sourceGoals'][i];new=candidate['sourceGoals'][i]
 assert len(old['sourceClauseIds'])==1
 fields=['title','sourceText','parentBulletText']
 for field in fields:new[field]=change['text']
 if change['description'] is not None:new['description']=change['description'];fields.append('description')
 passage=next(p for p in candidate['passages'] if p['id']==old['passageId'])
 assert passage['text'].count(old['sourceText'])==1,(i,old['id'])
 passage['text']=passage['text'].replace(old['sourceText'],new['sourceText'])
 changed_passages.add(passage['id'])
 deltas.append({'sourceGoalIndex':i,'goalId':old['id'],'clauseIds':old['sourceClauseIds'],'sourceRef':old['sourceRef'],'basis':change['basis'],'fieldChanges':[{'pointer':f'/sourceGoals/{i}/{field}','before':old[field],'after':new[field]} for field in fields],'companionPassageId':passage['id']})
assert len(changed_passages)==5
assert len(candidate['sourceGoals'])==232
assert sum(x!=y for x,y in zip(original['sourceGoals'],candidate['sourceGoals']))==6
assert sum(x!=y for x,y in zip(original['passages'],candidate['passages']))==5
for key in original:
 if key not in ['sourceGoals','passages']:assert original[key]==candidate[key],key
for i,(old,new) in enumerate(zip(original['sourceGoals'],candidate['sourceGoals'])):
 allowed={'title','sourceText','parentBulletText','description'} if i in changes else set()
 for key in old:
  if key not in allowed:assert old[key]==new[key],(i,key)
 if i==209:assert old['description']==new['description']
for old,new in zip(original['passages'],candidate['passages']):
 for key in old:
  if key!='text':assert old[key]==new[key],key
raw=O/'candidate/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.AUTHOR-PENDING.six-row-fidelity-v3.json'
w(raw,candidate)
w(O/'AUTHOR.exact-six-row-and-five-passage-scientific-delta.json',{'role':'Inactive author successor after two separately frozen independent source reviews; acceptance pending','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'oldCandidate':pin(OLD),'frozenSourceFindings':[pin(A),pin(B)],'changes':deltas,'changedPassageIds':sorted(changed_passages),'other226WholeSourceGoalObjectsValueExact':True,'all232ProvenanceObjectsValueExact':True,'allOtherFieldsValueExact':True,'canonicalMappingsAccepted':0,'humanApproval':False,'MainOrKModified':False})
# Use exactly the earlier clean scientific whitelist; neither independent result
# nor the author issue list is included in the current review science projection.
clean_keys=json.loads((HC/'REVIEW.HB-current232-whole-source-clauses-terms-optional-derived.safe.json').read_text()).keys()
science={k:candidate[k] for k in clean_keys}
view=O/'REVIEW.HB-current232-v3-six-row-fidelity.whole-science.safe.json'
w(view,science)
primary=O/'GyO_Chemie_2022.primary-exact.pdf';shutil.copyfile(HC/primary.name,primary)
selector={'role':'Current whole HB232 scientific source inventory with six authored source-fidelity corrections. Independent source follow-up may reuse its own prior findings; other reviewer results are not provided. No canonical binding acceptance.','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scientificView':pin(view),'previousScientificView':pin(HC/'REVIEW.HB-current232-whole-source-clauses-terms-optional-derived.safe.json'),'actualPrimary':pin(primary),'authorCandidateSourceBinding':pin(raw),'targetedSourceGoalIndices':list(changes),'targetedSourceGoalIds':[candidate['sourceGoals'][i]['id'] for i in changes],'changedPassageIds':sorted(changed_passages),'expectedCounts':{'sourceGoals':232,'sourceGoalProvenance':232,'passages':28,'mandatoryTermSets':27,'optionalSourceSuggestions':113,'derivedTeachingEntries':40,'section2Section3_1SourceOverlaps':14},'other226GoalBodiesAndAllProvenanceUnchanged':True,'allCanonicalCarrierBindingsOpen':True,'sourceActivated':False,'humanApproval':False}
w(O/'SELECTOR.clean-HB232-v3-six-row-fidelity-targeted-source-review.sealed.json',selector)
for g in guards:assert pin(Path(g['path']))==g
w(O/'CHECK.actual-six-row-only-author-successor-and-original-input-guards.json',{'inputGuards':guards,'allInputGuardsUnchanged':True,'changedWholeGoals':6,'changedPassages':5,'allOtherSourceFieldsValueExact':True,'allCanonicalSourceBindingsOpen':True,'MainAndKUnchanged':True})
print(json.dumps({'selector':pin(O/'SELECTOR.clean-HB232-v3-six-row-fidelity-targeted-source-review.sealed.json'),'candidate':pin(raw),'changedRows':6,'changedPassages':5}),flush=True)
