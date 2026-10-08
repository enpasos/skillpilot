from pathlib import Path
import json, copy, hashlib, datetime
own=Path(__file__).resolve().parent;base=own.parent;root=own.parents[6]
previous=base/'wirtschaft-q2-labour-twelve-bilingual-positive-author-v1'
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,value):
 with p.open('x') as f:f.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
assert not (own/'positive.candidates.json').exists()
gid='776457c2-8bb3-53b9-838b-a028319175fb'
levels={'60ec0ead-a218-563b-8627-58f5cf661fcc':'AB3','85f0b64f-c385-5a4a-82d2-fcfdf61f48a0':'AB2',gid:'AB3','a5009946-62bb-5e6a-8c92-732d02e8fd70':'AB3'}
goals=read(own/'whole-goals.candidate.json');old_goals=read(previous/'whole-goals.candidate.json')
assert len(goals)==12
positive=read(previous/'positive.candidates.json');positive=copy.deepcopy(positive)
positive.update(reviewId='canonical-economics-q2-labour-twelve-positive-author-20261008-v2',reviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),reviewer='codex-economics-q2-labour-twelve-author-20261008-v2')
enum_patches=[]
for row in positive['goals']:
 archetype=row['profile']['archetype']
 if archetype in {'case','model','judgment'}:
  next_value='modeling' if archetype in {'case','model'} else 'concept'
  enum_patches.append({'goalId':row['goalId'],'path':'/profile/archetype','before':archetype,'after':next_value})
  row['profile']['archetype']=next_value
 if row['goalId']!=gid:continue
 profile=row['profile'];expectation=profile['expectations'][0]
 expectation['essentialUnderstandingDe']+=' Eine begründete Beurteilung berücksichtigt konkrete gesetzliche Rechte, Schutz und Beteiligung sowie betriebliche Koordination und Umsetzung; unterschiedliche Kriteriengewichte erlauben verschiedene fallgestützte Urteile.'
 expectation['essentialUnderstandingEn']+=' A justified assessment considers concrete legal rights, protection and participation alongside workplace coordination and implementation; different criterion weights can support different case-based judgments.'
 expectation['observablePerformanceDe']='Die Person erklärt an neuen Betriebsfällen Formen, Funktionen und Bedeutung der bereitgestellten aktuellen Mitbestimmungsrechte für Beschäftigte und Unternehmen, ordnet Zuständigkeiten und Grenzen korrekt ein, erläutert den jeweiligen Beteiligungsweg und beurteilt die betriebliche Mitbestimmung anhand transparenter Kriterien, Fallbelege und beider Perspektiven begründet.'
 expectation['observablePerformanceEn']='Through new workplace cases, the learner explains forms, functions and significance of supplied current co-determination rights for employees and firms, correctly identifies competence and limits, explains the relevant participation process, and makes a justified assessment of workplace co-determination using explicit criteria, case evidence and both perspectives.'
 cases=profile['applicationCaseBriefs'];assert len(cases)==2
 cases[0]['taskDemandDe']+=' Der Betrieb verlangt kurzfristige Dienstplanwechsel, Beschäftigte benötigen Planbarkeit. Beurteile die Mitbestimmung in dieser Lage anhand aktueller Regeln und begründeter Kriterien aus beiden Perspektiven.'
 cases[0]['taskDemandEn']+=' The firm wants short-notice roster changes while workers need predictability. Assess co-determination in this situation using current rules and justified criteria from both perspectives.'
 cases[0]['expectedPerformanceDe']+=' Sie beurteilt Schutz und Mitsprache, verlässliche Planung, Reaktionsfähigkeit und Umsetzungsaufwand anhand des konkreten Falls; ihr Schluss wägt beide Perspektiven begründet ab und setzt Abwägung nicht mit Freiheit zur Missachtung der aktuellen gesetzlichen Rechte gleich.'
 cases[0]['expectedPerformanceEn']+=' They assess protection and voice, reliable planning, responsiveness and implementation effort using the actual case; their conclusion weighs both perspectives with reasons and does not equate balancing with freedom to disregard current legal rights.'
 cases[0]['understandingFocusDe']+=' Zusätzlich ein regelgebundenes, begründetes Urteil mit beidseitigen Kriterien entwickeln.'
 cases[0]['understandingFocusEn']+=' Additionally develop a rule-bound justified judgment using criteria from both sides.'
 cases[1]['taskDemandDe']+=' Der Betrieb nennt begrenzte Organisationsressourcen, Beschäftigte berichten konkrete Schutz- und Vereinbarkeitsprobleme. Beurteile die Bedeutung der Mitbestimmung anhand aktueller Regeln und beider Perspektiven.'
 cases[1]['taskDemandEn']+=' The firm cites limited organisational resources while workers report specific protection and reconciliation problems. Assess the significance of co-determination using current rules and both perspectives.'
 cases[1]['expectedPerformanceDe']+=' Sie beurteilt Schutzwirkung, Informationsqualität, Konfliktbearbeitung und betriebliche Umsetzung anhand der genannten Probleme und Ressourcen, berücksichtigt beidseitige Interessen und begründet ihren fallbezogenen Schluss mit Kriterien statt einer pauschalen Zustimmung oder Ablehnung.'
 cases[1]['expectedPerformanceEn']+=' They assess protection effects, information quality, conflict handling and implementation using the stated problems and resources, consider both sides and justify a case-specific conclusion with criteria rather than blanket support or rejection.'
 cases[1]['understandingFocusDe']+=' Die Erklärung durch ein fallbelegtes Urteil zu einer anderen Beteiligungsform ergänzen.'
 cases[1]['understandingFocusEn']+=' Extend explanation with a case-supported judgment concerning a different participation form.'
 profile['variationAxes'].append({'id':'assessment-criteria','textDe':'Begründete Abwägung von Schutz, Mitsprache, Planung und Umsetzung unter aktuellen gesetzlichen Grenzen.','textEn':'Justified assessment of protection, voice, planning and implementation within current legal limits.'})
 row['reason']+=' Bounded source-fidelity successor: preserve all explanatory forms/functions and both perspectives, add the actually required original BW judgment operator through supplied current legal case material; author proposal pending independent whole-goal/profile/A/M impact review.'
write(own/'positive.candidates.json',positive)
criteria=(previous/'authoring-review.criteria.md').read_text().replace('German competence text and graph remain unchanged in this original candidate.','German competence text remains unchanged for11goals;7764 explicitly retains explanation and adds the actual BW source-required case-based judgment. All graph relationships remain unchanged.').replace('The actual BW source requires a judgment operator for7764 whereas this historical canonical version explains participation. That source-fidelity issue remains open and is being addressed in a separate immutable successor; do not treat this original candidate as a source-coverage closure. Four demandLevel fields are still absent until separately reviewed taxonomy/source decisions.','The actual BW source judgment operator is now an explicit bounded7764 author proposal in DE/EN/P, with AB3. Its full new whole goal and both entire cases require independent source/translation/positive/A/M impact review before counting. The other3 demandLevel proposals (60ec/a500AB3,85f0AB2) likewise remain inert until independently approved. Current statutory limits bound judgments; normative balancing cannot freely waive them.')
(own/'authoring-review.criteria.md').write_text(criteria)
verifier=(previous/'verify_candidate.mts').read_text()
before="if (JSON.stringify(changed) !== JSON.stringify(goal.id === '8fbd0f7b-839b-5fe5-a257-8e0f6d24751b' ? ['descriptionEn'] : ['descriptionEn', 'titleEn']))"
after="const expectedFields = goal.id === '776457c2-8bb3-53b9-838b-a028319175fb' ? ['description', 'descriptionEn', 'dimensionTags', 'title', 'titleEn'] : ['60ec0ead-a218-563b-8627-58f5cf661fcc','85f0b64f-c385-5a4a-82d2-fcfdf61f48a0','a5009946-62bb-5e6a-8c92-732d02e8fd70'].includes(goal.id) ? ['descriptionEn','dimensionTags','titleEn'] : goal.id === '8fbd0f7b-839b-5fe5-a257-8e0f6d24751b' ? ['descriptionEn'] : ['descriptionEn','titleEn']\n  if (JSON.stringify(changed) !== JSON.stringify(expectedFields))"
assert before in verifier
(own/'verify_candidate.mts').write_text(verifier.replace(before,after))
changes=[]
for a,b in zip(old_goals,goals):
 for field in set(a)|set(b):
  if a.get(field)!=b.get(field):changes.append({'goalId':a['id'],'path':'/'+field,'before':a.get(field),'after':b.get(field)})
write(own/'bounded-source-fidelity-and-enum-successor.actual.json',{'schemaVersion':1,'role':'author_source_fidelity_and_closed_enum_successor','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'predecessorPackage':str(previous.relative_to(root)),'historicalPredecessorWholeSha256':sha(previous/'whole-goals.candidate.json'),'historicalPredecessorPositiveSha256':sha(previous/'positive.candidates.json'),'predecessorNativeValidationPassed':False,'predecessorNativeFindings':'Nine invented archetype labels were rejected by the actual closed enum. Entire v1, failed native receipt and correct EN title preservation remain unchanged.','technicalArchetypeRepairs':enum_patches,'boundedWholeGoalChanges':changes,'substantiveProfileChangedGoalIds':[gid],'otherElevenProfileContentUnchangedExceptExplicitArchetypeEnumRepairs':True,'currentSourceFidelityGoal':gid,'demandLevelCandidateCount':4,'graphChanges':0,'independentApprovalClaimed':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0,'authorWorkingInterruption':'An initial successor construction referenced a nonexistent explanation-field key; it stopped before writing any P/config/review receipt. The whole-goal candidate bytes already produced remain unchanged. This continuation uses the actual six-field understandingFocus keys.'})
source=base/'wirtschaft-q2-labour-four-demand-level-source-fidelity-author-v2';source.mkdir(exist_ok=False)
write(source/'whole-goals.original.json',[g for g in read(previous/'whole-goals.original.json') if g['id'] in levels])
write(source/'whole-goals.candidate.json',[g for g in goals if g['id'] in levels])
write(source/'bounded-four-source-taxonomy-proposal.actual.json',{'role':'author_candidate','actualOriginalSourceReadingPredecessor':str((base/'wirtschaft-q2-labour-four-demand-level-author-v1/bounded-four-demand-level-author.actual.json').relative_to(root)),'goalIds':list(levels),'nativeTaxonomyProposals':levels,'strongerSourceOperatorRetainedBySuccessor':gid,'historicalOriginalSourceBytesUnmodified':True,'newWholeDEENAndPGoal':str(own.relative_to(root)),'independentSourceAndAMReviewRequired':True,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0})
print('Labour12 immutable v2: exact source-fidelity7764 and native enum corrections; oldv1 preserved; independent reviews pending.')
