# SPDX-License-Identifier: Apache-2.0
import json,hashlib,tempfile,os,datetime,subprocess,copy,re,requests
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-source24-author'
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1')
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,b):
 p=R/p;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),str(p)
 if isinstance(b,(dict,list)):b=(json.dumps(b,ensure_ascii=False,indent=2)+'\n').encode()
 elif isinstance(b,str):b=b.encode()
 with tempfile.NamedTemporaryFile(dir=T,delete=False) as f:f.write(b);stage=f.name
 os.replace(stage,p)
idx=read(B/'source/whole-current-source-documents-extractions-partners-and-holds.actual-index.json')
frame=read(B/'source/whole-seven-retained-families-and-existing-original-source-partner-frames.actual.json')
canon=read(B/'candidate/current-whole511-398-B008.inactive.json');goals={g['id']:g for g in canon['goals']}
parents={c:f for f in frame['wholeFamilies'] for c in f['wholeCurrentDeclaredChildIds']}
assert len(parents)==24
familyPartners=sum(len(f['wholeExistingDirectOriginalSourcePartners']) for f in frame['wholeFamilies']);assert familyPartners==1180
by=next(x for x in idx['wholeCurrentMappingExtractionPairs'] if 'bavaria_chemistry' in x['wholeCurrentMapping']['ownExactCopy']['path'])
st=next(x for x in idx['wholeCurrentMappingExtractionPairs'] if Path(x['wholeCurrentMapping']['ownExactCopy']['path']).name.startswith('29-'))
byext=read(Path(by['wholeCurrentExtraction']['ownExactCopy']['path']));bygoals={g['id']:g for g in byext['sourceGoals']};byspans={g['sourceSpan']:g['id'] for g in byext['sourceGoals']}
stext=read(Path(st['wholeCurrentExtraction']['ownExactCopy']['path']));stgoals={g['id']:g for g in stext['sourceGoals']}
plans=[
('6c7ce93c-7675-51da-bc0c-7d0257f7ff7d',['C8.1.6','C8.1.7','C9-NTG.1.6','C10-HG_SG_MUG_WWG_SWG.1.7'],'Modellverwendung, Vergleich mit Phänomenen, Aussagekraft, Grenzen und hypothesengeleitete Auswahl werden getrennt durch die ganzen Sek-I-Operatoren begründet. Digitale Modellierung stammt aus den zugehörigen ganzen Lernbereichsinhalten; Simulation ist eine eigene prüfbare Operationalisierung dieser Modellkompetenz, kein zusätzlicher amtlicher Einzelauftrag.'),
('86d34f1f-692d-5522-a9a4-a71c65b24de7',['C11.1.6','C12-GA.1.4','C12-GA.1.6','C12-GA.1.9','C12-GA.1.11','C12-GA.1.13'],'Komplexe Organik/Wirkstoff-Rezeptor/Substrat-Enzym ist ausdrücklich C11.1.6; Atombau, Gleichgewicht, Bindung, theoriegestützte Modellwahl und Grenzen werden ergänzend von den tatsächlichen C12-Operatoren getragen. C11 erhält dabei kein erfundenes GK/LK-Profil; C12-Beiträge bleiben auf ihre eigenen Aussagen begrenzt.'),
('9fc800d1-92d1-5ef6-81c1-33960ae034dd',['C8.1.2','C10-NTG.1.2','C12-GA.1.10'],'Nachvollziehbare Dokumentation wird in C8 und C10 wörtlich gefordert. Größen/Einheiten und Beobachtung gegenüber Erklärung stehen in den ganzen Lernbereichsinhalten; Herkunft und Untersuchungsbedingungen operationalisieren die Nachvollziehbarkeit. C12-Messwerterfassung ist nur ein begrenzter zusätzlicher Dokumentationsbeitrag, keine Vollabdeckung des gesamten Operators.'),
('7d9fcc7f-1c20-5d5b-9cf6-05f6b624dab6',['C8.1.4','C9-NTG.1.4','C10-HG_SG_MUG_WWG_SWG.1.4'],'Sek-I-Dateninterpretation und Bezug auf Eingangshypothesen sowie Trends/Strukturen/Beziehungen werden aus den ganzen einschlägigen Sek-I-Sätzen zusammengesetzt. Eine C12-Forderung wird hier nicht als Sek-I-Kursnachweis eingesetzt.'),
('9e3fae29-84d5-5600-bfb3-82d49ea3f1b5',['C12-GA.1.7','C12-GA.1.10','C12-GA.1.12','C12-EA.1.12'],'Mathematische quantitative Auswertung, digitale Werkzeuge und fachübergreifende Stützung/Falsifizierung ergeben einen begrenzten prüfbaren Methodenbeitrag. Die konkreten Auswahlbegründungen und Untersuchungsbedingungen sind eigene didaktische Operationalisierung; Quellenoperatoren und GA/EA-Vorkommen bleiben unverändert.'),
('4aa3a130-b517-5ac5-87b2-147fe432cadd',['C10-HG_SG_MUG_WWG_SWG.1.4','C11.1.4','C12-GA.1.27','C12-GA.3.3'],'Datenvalidität/Mess- und Verfahrensfehler werden mit Angemessenheit, Grenzen und Tragweite verbunden. Das sind begrenzte Beiträge verschiedener ganzer Sätze; weder C11-Kursprofil noch der ganze C12-Analytikunterricht wird freigegeben.'),
('7f140b34-ed26-59e7-8ad2-ccb6b56bc9d6',['C9-HG_SG_MUG_WWG_SWG.1.13'],'Aus dem ganzen C9-Satz wird ausschließlich Aufgaben-/Anwendungsbeschreibung und gesellschaftliche Diskussion als Teilkompetenz abgetrennt. Mensch/Umwelt/Nachhaltigkeit ist in den ganzen Lernbereichsinhalten konkretisiert; der ebenfalls genannte Berufswahlteil bleibt dem getrennten Kind vorbehalten.'),
('6c9adc36-b6d0-57fa-8e02-5e156aebfecc',['C9-HG_SG_MUG_WWG_SWG.1.13'],'Der ausdrückliche Auftrag, vielfältige chemische Berufsfelder in die Berufswahl einzubeziehen, trägt den begrenzten Berufsorientierungsbeitrag. Vergleich konkreter Anforderungen ist eigene Operationalisierung des Auftrags, keine amtliche Berufseignungsprüfung oder Vollfreigabe aller Berufsfelder.'),
('75e2eff1-f871-5461-9e3f-26d0b333ce2f',['C8.1.3','C9-NTG.1.3','C10-NTG.1.3'],'Fragestellung und hypothesengeleitete Untersuchung werden aus den wörtlichen Sek-I-Operatoren begründet. Eigene prüfbare Hypothese und erwarteter Gegenbefund operationalisieren den Hypothesenbezug; es wird kein vollständiger Experimentierauftrag durch dieses eine Kind abgedeckt.'),
('503dedcb-0efc-5e6b-bbc9-20761a0951f5',['C11.1.3','C12-GA.1.8'],'Theoriebasierte Hypothesen und theoriegeleitete Fragestellungen sind wörtlich belegt. Erwartbarer Befund/Gegenbefund ist eigene prüfbare Operationalisierung. C11 bleibt profile-unspecified, die normale C12-Scoping-Aussage betrifft nur C12-Vorkommen.'),
('e81a4aed-9695-533e-8eb7-7a0c714346ea',[],'Die ganze ST-7/8-Primärseite20 verlangt einfache Experimente unter Anleitung mit Sicherheitsbeachtung und enthält das Wiedergeben von Beobachtungen. Variable/Schrittbindung, Hypothesenprüfung und das vollständige Protokoll sind eigene begrenzte Operationalisierung im Erkenntnisweg; kein Ersatz für den gesamten ST-Themenblock und keine Durchführungsevidenz aus Lernendendaten.'),
('42391b16-bbae-5c77-84e1-d488e714167b',['C9-NTG.1.3','C10-NTG.1.2','C10-NTG.1.3'],'Eigene qualitative/quantitative Versuchsplanung und selbstständige Durchführung/Dokumentation werden durch die ganzen Sek-I-Operatoren und ihre Sicherheits-/Variablenkontroll-Inhalte begründet. Durchführen bleibt eine echte praktische Anforderung; ein Textplan wird nicht als tatsächliches Experimentieren ausgewiesen.'),
('f79f15c0-e848-5e17-9eb5-26753d35c93b',['C11.1.2','C11.1.3','C12-GA.1.9'],'C11 verlangt selbstständige sicherheitsgerechte Untersuchungen mit Analysemethoden; C12 verlangt tatsächliche qualitative/quantitative Durchführung und Protokollierung. Analysenmethodenwahl ist begrenzte eigene Operationalisierung. Das bzw.-Modellieren in C12 wird nicht genutzt, um tatsächliche Durchführung aus diesem Kind zu entfernen.'),
('e5a5dcd8-053c-55fd-b5c7-bba93779da53',['C11.1.11'],'C11.1.11 nennt soziale, kulturelle, technologische, ökologische und ökonomische Einflüsse auf Wissensentwicklung ausdrücklich. Historische Erklärung und Abgrenzung empirischer Gültigkeit gegen Zustimmung operationalisieren diesen Auftrag. Kursprofil bleibt unspecified; der gesonderte C12-Wirkungsoperator ist kein Kursbeleg für diesen Satz.'),
('9f892457-c4e5-56da-830c-bf6cac0c98d7',['C12-GA.1.31','C12-GA.1.33'],'Gesellschaftliche/ökologische Relevanz sowie historische/aktuelle Wirkungen chemischer Produkte/Methoden/Erkenntnisse werden ausdrücklich einschließlich drei Nachhaltigkeitsperspektiven und eigener Handlung angesprochen. Das ist der Wirkungsteil, nicht derselbe Gegenstand wie die C11-Wissensentwicklung.'),
('5b1bb5d9-07b1-5ba9-b320-cc97be917c60',['C8.1.10','C9-NTG.1.9','C10-HG_SG_MUG_WWG_SWG.1.9'],'Informationsentnahme aus vorgegebenen bzw. recherchierten Quellen und adressatengerechte Auswertung sind Sek-I-Operatoren. Strukturierung/Quellenangabe sind eigene nachvollziehbare Operationalisierung; Komplexität oder Oberstufenselbstständigkeit werden nicht aus dem einfachen C8-Text behauptet.'),
('ac8b6c0f-98b2-5092-806d-d9498efbfa35',['C12-GA.1.16','C12-GA.1.17','C12-GA.1.20','C12-GA.1.23'],'Recherche, komplexe Darstellungsformen, Schlussfolgern und Urheberschaft/Zitate werden durch verschiedene ganze C12-Sätze begründet. Pharmazeutische Beispiele sind eine eigene konkrete Anwendung chemischer Quellenkompetenz, kein separater amtlicher Pharmakologiekurs.'),
('36666b4a-97af-51fc-9983-56cdcc7a8229',['C11.1.9','C12-GA.1.18','C12-GA.1.23','C12-GA.1.26'],'Quelleneignung, Vergleich/Vertrauenswürdigkeit/Validität, Urheberschaft und Autorenintention stehen in den ganzen Quellensätzen. Jeder Beitrag bleibt begrenzt; C11-Kursunsicherheit bleibt bestehen und Quellenkritik ersetzt keinen Originalquellenrechtsnachweis.'),
('431a0f03-f28a-5e56-a61f-000336d0b410',['C8.1.11','C9-NTG.1.10','C10-HG_SG_MUG_WWG_SWG.1.12'],'Vorgegebene Argumente vergleichen, eigene Argumente finden und Kriterien recherchieren sind verschiedene wörtliche Anforderungen. Ihr Zusammenspiel wird als eigenes einzelnes Abwägungsprodukt operationalisiert; fremde Argumente werden nicht als selbst gefundene ausgegeben. Eine zusätzliche Oberstufenplatzierung bleibt ohne neuen Kursbeleg offen.'),
('31781d00-8f20-5041-bd7f-e261b27af162',['C11.1.8','C12-GA.1.19'],'Überführung in adressaten-/situationsgerechte Darstellungen und Reflexion ihrer Verwendung sind wörtlich belegt. Bezugsgrößen und begrenzte/erhaltene Aussagen sind eigene didaktische Operationalisierung. C11 bleibt profile-unspecified; zusätzlicher Sek-I-Beitrag wird hier nicht erfunden.'),
('38e30bb9-6145-5da0-80b8-36e3c45e15d0',['C12-GA.1.22'],'Der ganze C12-Satz verlangt analoge/digitale Präsentation eigener Lern-/Arbeitsergebnisse; begründete Medien-/Aufbauwahl operationalisiert die Eignung. Daraus wird kein Beleg für zusätzliche Sek-I- oder nationale Präsentationsrouten abgeleitet.'),
('a8800c36-d13c-5f63-962c-cf18c3795c63',['C8.1.5','C9-NTG.1.5','C10-HG_SG_MUG_WWG_SWG.1.5'],'Erkenntnisweg, chemisch beantwortbare Fragestellung und Grenzen/Gültigkeit werden getrennt in den ganzen Sek-I-Sätzen gefordert. Die Zusammenführung zu einem erklärbaren gegebenen Erkenntnisweg ist eigene Operationalisierung, nicht die Behauptung universeller Beantwortbarkeit.'),
('99d41b0f-e958-54cf-a077-9bed1704a303',['C12-GA.1.14'],'Reflexion eigener Ergebnisse und eigener Erkenntnisgewinnung trägt den begrenzten Beitrag. Konkrete Begründungen/Unsicherheiten/Verbesserungen sind eigene prüfbare Operationalisierung. Diese C12-Quelle liefert keinen zusätzlichen Sek-I-Scopingbeleg.'),
('a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1',['C12-GA.1.15'],'Alle fünf wissenschaftlichen Gültigkeitskriterien werden im ganzen amtlichen Satz ausdrücklich genannt. Die Unterscheidung belastbarer Gegenbefunde von Durchführungs-/Messfehlern ist eigene Operationalisierung; ein fehlgeschlagener Versuch ist nicht automatisch Falsifikation.')]
assert len(plans)==24 and set(i for i,_,_ in plans)==set(parents)
planRows=[];byAdds={};stAdds={}
for goalId,spans,reason in plans:
 family=parents[goalId];partners=family['wholeExistingDirectOriginalSourcePartners'];chosen=[]
 ids=[byspans[s] for s in spans]
 if goalId=='e81a4aed-9695-533e-8eb7-7a0c714346ea':ids=['st-chem-seki-st-schuljahrgange-7-8-chemie-als-naturwissenschaft-beschreiben-005-8890f0b9']
 for sid in ids:
  match=next(x for x in partners if x['wholeOriginalSourceBody']['id']==sid)
  assert match['wholeOriginalMappingPartnerEdge']['canonicalGoalId']==family['retainedOriginalGoalId']
  chosen.append(match)
  adds=byAdds if sid in bygoals else stAdds
  adds.setdefault(sid,[]).append(goalId)
  s=match['wholeOriginalSourceBody'];stage=next((t.split(':',1)[1] for t in s.get('tags',[]) if t.startswith('stage:')),None)
  assert stage in goals[goalId]['tags'],(goalId,sid,stage)
 planRows.append({'goalId':goalId,'retainedParentId':family['retainedOriginalGoalId'],'wholeCurrentChild':goals[goalId],'wholeRetainedParent':family['wholeCurrentRetainedAreaBody'],'selectedWholeOriginalPartnerBodies':chosen,'authorContribution':'authoredOperationalization','matchType':'partial','authorStatus':'independent_source_review_pending','reasonDe':reason,'wholeOriginalDutyOrCourseApproval':False,'scopeBoundary':'Only actually resolved official source-metadata scopes. Existing raw source occurrences/facets remain exact; any unspecified course stays unresolved. No inherited all-child coverage.'})
put(P/'candidate/twenty-four-whole-child-source-contributions.author-candidate.json',{'schemaVersion':1,'role':'Targeted factual author candidates for partial operationalizations; not independent decisions or whole source approval','wholeOriginalFamilyPartnerEdgeCount':1180,'rows':planRows,'humanApproval':False,'strictGain':0,'activeWrites':False})
# Official ST primary independently re-fetched and byte compared, one entire needed page only.
stDoc=st['currentSourceDocument'];raw=(R/stDoc['path']).read_bytes();rr=requests.get(stDoc['url'],timeout=25);rr.raise_for_status();assert rr.content==raw,'Live ST official PDF differs from existing exact original'
(T/'ST-whole62-live.cache.pdf').write_bytes(rr.content)
page=subprocess.run(['pdftotext','-f','20','-l','20','-layout',str(T/'ST-whole62-live.cache.pdf'),'-'],check=True,capture_output=True).stdout
put(P/'primary/ST-physical020.whole.actual.txt',page)
put(P/'primary/actual-ST-whole-primary-and-physical020.receipt.json',{'schemaVersion':1,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'url':stDoc['url'],'httpStatus':rr.status_code,'wholePDF':ref(Path(stDoc['path'])),'liveWholeOriginalBytesExact':True,'wholePDFLocalCacheNotNewAuthority':True,'wholePhysicalPage20':ref(P/'primary/ST-physical020.whole.actual.txt'),'pageRights':'Original primary labels CC BY-SA 3.0; unchanged source page, not relicensed as our CC-BY-4.0 material.','wholeSourceOrCourseApproval':False,'humanApproval':False})
# Only two whole mapping successors. Every original row/edge retained, selected decisions add partial children.
deltas=[];successors={}
for key,pair,adds in [('BY',by,byAdds),('ST',st,stAdds)]:
 old=read(Path(pair['wholeCurrentMapping']['ownExactCopy']['path']));new=copy.deepcopy(old)
 new['reviewId']=f'chemie-b008-source24-{key.lower()}-bounded-parent-split-author-20261010-v1'
 new['status']='candidate'
 new['note']=old.get('note','')+' Additiver inaktiver Source24-Autorenkandidat: ganze bisherige Pflichten, Entscheidungen und Partnerkanten erhalten; nur explizite begrenzte partial-Kindbeiträge, unabhängige Quellen-A/B-Prüfung offen. Keine ganze Source-/Kurs-/Human-Freigabe.'
 edits=[]
 for d in new['decisions']:
  if d['sourceGoalId'] not in adds:continue
  od=copy.deepcopy(d);extra=adds[d['sourceGoalId']];assert not set(extra)&set(d['canonicalGoalIds'])
  d['canonicalGoalIds'].extend(extra)
  d['rationale']=od['rationale']+' Source24-Autorenkandidat (2026-10-10): zusätzliche explizite partial-Beiträge nur an '+', '.join(extra)+'. Eigene begrenzte Operationalisierung, noch keine unabhängige Quellenfreigabe; alte vollständige Quellpflicht und sämtliche ursprünglichen Partner bleiben erhalten.'
  d['authorCandidateBoundary']={'authorRole':'technical_source_author_with_actual_primary_inspection','candidateCreatedAt':'2026-10-10','reviewedOriginalFieldsRetained':True,'newPartialChildContributionsIndependentReviewPending':True,'wholeSourceApproval':False,'wholeCourseApproval':False,'humanApproval':False}
  edits.append({'sourceGoalId':d['sourceGoalId'],'wholeBeforeDecision':od,'wholeAfterDecision':d,'addedChildIds':extra})
  for child in extra:new['mappings'].append({'legacyGoalId':d['sourceGoalId'],'canonicalGoalId':child,'matchType':'partial','reviewDecisionId':d['sourceGoalId']})
 new['source24AuthorCandidateDelta']={'newPartialEdges':sum(len(v) for v in adds.values()),'originalAllEdgesRetained':True,'newSourceDuties':0,'sourceExtractionUnmodified':True,'independentReviewPending':True,'wholeSourceApproval':False,'wholeCourseApproval':False,'humanApproval':False}
 target=P/'candidate'/f'{key}-whole-original-with-targeted-partial-child-contributions.inactive.review.json';put(target,new)
 assert new['mappings'][:len(old['mappings'])]==old['mappings']
 untouched=[d for d in old['decisions'] if d['sourceGoalId'] not in adds];newBy={d['sourceGoalId']:d for d in new['decisions']};assert all(newBy[d['sourceGoalId']]==d for d in untouched)
 successors[pair['wholeCurrentMapping']['original']['path']]=str(target)
 deltas.append({'jurisdiction':key,'wholeOriginal':pair['wholeCurrentMapping'],'wholeSuccessor':ref(target),'originalDutyCount':pair['wholeCurrentSourceDutyCount'],'originalAllEdges':len(old['mappings']),'newAllEdges':len(new['mappings']),'addedPartialEdges':sum(len(v) for v in adds.values()),'allOriginalEdgesExact':True,'unchangedWholeDecisionCount':len(untouched),'changedWholeDecisions':edits,'wholeExtraction':pair['wholeCurrentExtraction'],'newScientificIndependentReview':False})
put(P/'checks/actual-two-whole-mapping-successor-exact-deltas.json',{'schemaVersion':1,'mappingSuccessors':deltas,'originalWhole32Mappings':len(idx['wholeCurrentMappingExtractionPairs']),'originalWholeSourceDuties':sum(x['wholeCurrentSourceDutyCount'] for x in idx['wholeCurrentMappingExtractionPairs']),'originalWholeMappingEdges':sum(x['wholeCurrentMappingPartnerEdgeCount'] for x in idx['wholeCurrentMappingExtractionPairs']),'originalFamilyPartnerEdgesRetainedExact':1180,'strictGain':0,'activeWrites':False,'humanApproval':False})
put(P/'inputs/whole32-original-mapping-extraction-index.exact.json',(R/B/'source/whole-current-source-documents-extractions-partners-and-holds.actual-index.json').read_bytes())
put(P/'inputs/whole-current511-398-candidate.exact.json',(R/B/'candidate/current-whole511-398-B008.inactive.json').read_bytes())
put(P/'inputs/current511-semantic-kinds.path-only.json',dict(read(B/'candidate/current511.semantic-kinds.inactive.json'),sourceLandscapePath=str(P/'inputs/whole-current511-398-candidate.exact.json')))
put(P/'inputs/current180-protected-and-other-subjects.exact.json',(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-eight-reviewed-integration-technical-portable-successor-v2/current323-exact-strict-ID-gain-and-protected-subjects.actual.json').read_bytes())
config=read(B/'source-atlas/current398-full-source-scope.normal-probe.inputs.json')
config['landscapePath']=str(P/'inputs/whole-current511-398-candidate.exact.json');config['semanticKindLedgerPath']=str(P/'inputs/current511-semantic-kinds.path-only.json')
config['mappingPaths']=[successors.get(x,x) for x in config['mappingPaths']]
# Keep the ordinary full398 assertion and all496 unresolved source decisions.
assert config['expectedCurricularAtomicGoalCount']==398 and config['expectedUnresolvedScopeDecisionCount']==496
put(P/'source-atlas/whole398-source24.normal-probe.inputs.json',config)
print(json.dumps({'partialChildContributions':len(planRows),'wholeSourceDuties':sum(x['wholeCurrentSourceDutyCount'] for x in idx['wholeCurrentMappingExtractionPairs']),'originalEdges':sum(x['wholeCurrentMappingPartnerEdgeCount'] for x in idx['wholeCurrentMappingExtractionPairs']),'newPartialEdges':sum(sum(len(v) for v in a.values()) for a in [byAdds,stAdds]),'wholeSuccessors':2,'strictGain':0},indent=2))
