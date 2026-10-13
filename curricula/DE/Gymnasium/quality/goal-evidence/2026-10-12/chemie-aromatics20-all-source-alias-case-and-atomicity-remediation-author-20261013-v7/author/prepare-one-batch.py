"""Apache-2.0. One bounded author successor; teaching content CC-BY-4.0.
Only this new root and its regular private scratch files may be written.
"""
from pathlib import Path
import copy, datetime, hashlib, json, shutil, stat
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N='chemie-aromatics20-all-source-alias-case-and-atomicity-remediation-author-20261013-v7';O=E/N;C=R/'tmp'/N/'private-parent'
B=E/'chemie-aromatics-dyes20-current231-scientific-author-20261013-v1';V4=E/'chemie-aromatics20-bounded-source-and-operator-remediation-author-20261013-v4'
AUD=E/'chemie-aromatics20-primary-operator-early-independent-a-20261013-v6';AM=E/'chemie-aromatics-two-body-A-M-targeted-independent-20261013-v5'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def oh(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rel(p):return str(Path(p).relative_to(R))
def safe(p):
 p=Path(p);assert p.is_relative_to(O) or p.is_relative_to(C)
 for q in [p,*p.parents]:
  if q.exists() or q.is_symlink():
   s=q.lstat();assert not stat.S_ISLNK(s.st_mode),str(q)
   if q==p and q.is_file():assert s.st_nlink==1;q.chmod(0o600)
 p.parent.mkdir(parents=True,exist_ok=True);return p
def write(p,d):safe(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def bind(p):return dict(path=rel(p),sha256=sha(p))
base=read(B/'AUTHOR.future-inputs.additive.json');IDS=base['goalIds'];can=read(R/base['canonicalInputBinding']['path']);assert sha(R/base['canonicalInputBinding']['path'])==base['canonicalInputBinding']['sha256']
routes=read(AUD/'ROUTE_MATRIX.actual.json');parents={x['path']:read(R/x['path'])for x in routes['mappingFiles']}
extracts={x['path']:read(R/x['path'])for x in routes['sourceExtractions'] if 'chemie-aromatics20-bounded-source-and-operator-remediation' not in x['path']}
baseline={p:copy.deepcopy(x)for p,x in extracts.items()};maps=copy.deepcopy(parents)
guards=[bind(R/p) for p in [*parents,*extracts,base['canonicalInputBinding']['path'],base['claimInputBinding']['path']]]
for q in [B,V4,AUD,AM]:guards.extend(bind(p)for p in q.glob('*SEAL*.json'));guards.extend(bind(p)for p in q.glob('FINAL*.json'))
write(O/'inputs/actual-start-parent-CAS.json',dict(schemaVersion=1,atUTC=NOW,bindings=guards,canonicalNodes=523,curricularAtomic=402,strictBaseline231Preserved=True))
write(O/'inputs/accepted-report-and-image-references.json',dict(schemaVersion=1,reports=[bind(AUD/x)for x in ['SCIENTIFIC_REPORT.actual.md','PER_GOAL_FINDINGS.actual.json','ROUTE_MATRIX.actual.json','SOURCE_PAGE_FACTS.actual.json','SEAL.actual.json']]+[bind(AM/x)for x in ['REPORT.md','FIRST.raw-input-CAS-and-judgments.json','SEAL.json']],images=bind(V4/'author/exact17-retained-and-selected3-image-bindings.author.json'),oldSealsPreserved=True,newVVotes=0))

# Put the verified primary content into the field that all three actual consumers read.
oldEP=read(V4/'author/exact-source-extraction-literal-scope-patches.author.json')['patches']
ep=[]
def sourcepatch(path,gid,changes,reason):
 d=extracts[path];g=next((x for x in d['sourceGoals'] if x['id']==gid),None)
 if g is None:return
 before=copy.deepcopy(g);g.update(changes)
 if not isinstance(g.get('sourceSpan'),str):g['sourceSpan']=json.dumps(g.get('sourceSpan'),ensure_ascii=False,separators=(',',':'))
 if g.get('sourceScopeCondition'):
  g['sourceSpan']+='; verified primary scope context: '+g['sourceScopeCondition']
 g.setdefault('metadata',{})['aromaticsV7LiteralDerivation']={'status':'author_candidate_needs_independent_review','sourceTextRole':'normalized primary clause or explicit clause collection; no invented assessed verb','titleDescriptionRole':'derived teaching descriptor, not a verbatim curriculum quotation','reason':reason,'wholeSourceUnionApproved':False}
 # One patch per row; merge sequentially while retaining the actual original parent row.
 previous=next((x for x in ep if x['parentPath']==path and x['sourceGoalId']==gid),None)
 if previous:previous['after']=copy.deepcopy(g);previous['reasons'].append(reason)
 else:ep.append(dict(parentPath=path,parentSHA256=sha(R/path),sourceGoalId=gid,before=before,after=copy.deepcopy(g),reasons=[reason]))
for p in oldEP:
 path=p['extractionPath']
 if path not in extracts:continue
 a=p['after'];ch={k:copy.deepcopy(v)for k,v in a.items() if k not in ['metadata','title','description']}
 if a.get('rawSourceText'):ch['sourceText']=a['rawSourceText']
 context=a.get('metadata',{}).get('aromatics20AuthorLiteralContext',{})
 page=context.get('physicalPDFPage',48 if '/BB/'in path or '/BE/'in path else None)
 if page:ch['sourcePage']=page;ch['sourceSpan']=f'physical PDF{page}; '+str(a.get('rawSourceSpan',a.get('sourceSpan')))
 sourcepatch(path,p['sourceGoalId'],ch,'Independent complete audit: fix consumed sourceText, primary locator and literal course scope; retain derived title/description separately.')

facts=read(AUD/'SOURCE_PAGE_FACTS.actual.json')['actualPrimaryReads'];factby={x.get('path'):x for x in facts if x.get('path')}
for path,d in extracts.items():
 for g in list(d['sourceGoals']):
  gid=g['id'];selected=any(x['sourceGoalId']==gid for x in routes['components'])
  if not selected:continue
  ch={};reason=[]
  if '/NW/'in path and gid.endswith('008-6ff1b9c4'):ch.update(sourcePage=54,sourceRef='NW KLP Chemie2022,LK,Reaktionswege organische Chemie,physical PDF54/printed54',sourceSpan='LK aromatic reactivity and mesomerie; physical PDF54/printed54');reason.append('actual aromatic competence is54, not53')
  if '/MV/upper-'in path and any(z in gid for z in ['014-c5c3d61e','015-0ce5f3c8']):ch.update(sourcePage=19,sourceRef='MV Qualifikationsphase2022,Stoffe/Strukturen/Eigenschaften,LK,physical PDF19/printed15',sourceSpan='physical PDF19/printed15; additional LK cyclic hydrocarbons/electrophilic substitution');reason.append('actual physical19/printed15')
  if '/TH/'in path and 'aromatische-systeme' in gid:
   raw='das aromatische System mithilfe mesomerer Grenzstrukturformeln am Beispiel des Benzen-Moleküls beschreiben' if '134-01' in gid else 'die relative Stabilität des aromatischen Systems gegenüber Additionsreagenzien begründen'
   ch.update(sourceText=raw,rawSourceText=raw,sourcePage=55,sourceRef='TH Chemie2024,4.1.6,Aromatische Systeme,zusätzlich erhöhtes Niveau,physical PDF55/printed50',sourceSpan='Aromatische Systeme,zusätzlich erhöhtes Niveau; physical PDF55/printed50',courseLevel='LK',tags=[t for t in g.get('tags',[])if not(t.startswith('course:')or t.startswith('courseLevel:'))]+['course:LK'])
   reason.append('repair truncated consumed literal and actual increased-only column')
  if 'DE_BW' in path or 'whole-BW126' in path:
   if g.get('topicCode')=='3.4.8':ch.update(sourcePage=42,sourceRef='BW BP2016 Chemie,3.4.8,physical PDF42/printed40',sourceSpan='3.4.8 selected additional material; physical PDF42/printed40');reason.append('selected further class; dyes are optional example, not complete dye operator family')
   elif str(g.get('topicCode','')).startswith('3.4.5'):ch.update(sourcePage=38,sourceRef='BW BP2016 Chemie,3.4.5,physical PDF38/printed36',sourceSpan='aromatic LF content; physical PDF38/printed36');reason.append('physical38/printed36, not physical36')
  if '/HE/upper' in path and 'q2-3' in gid:ch.update(sourcePage=43,sourceRef='HE KC Chemie2024/current2026,Q2.3,physical PDF43/printed43; elective selection rule physical32',sourceSpan='Q2.3 elective; clause physical PDF43/printed43, selection context physical32');reason.append('Q2.3 is elective beyond mandatory Q2.1/Q2.2; course tags do not imply compulsory selection')
  if '/HE/upper' in path and 'q1-1' in gid:ch.update(sourcePage=38,sourceRef='HE KC Chemie2024/current2026,Q1.1,LK,physical PDF38/printed38',sourceSpan='Q1.1 LK aromatic clause; physical PDF38/printed38');reason.append('actual38 LK resonance/structure subset, no expanded orbital/energy mandate')
  if '/SN/upper' in path and '085-03-f32f7126' in gid:ch.update(sourcePage=60,sourceRef='SN Chemie2025,Jahrgang12 LK,Systematisierung,physical PDF60/printed48',sourceSpan='Beurteilen des Einsatzes und der Grenzen von Modellen; physical PDF60/printed48');reason.append('model evaluation continues at60, not59')
  if '/SN/upper' in path and '-wb' in gid:ch['sourceScopeCondition']='elective Wahlbereich; no mandatory full-course entitlement';reason.append('actual Wahlbereich stays optional')
  if '/SH/upper' in path:ch['sourceScopeCondition']='aromatics compulsory eA and optional gA; dyes conditional eA unless another Chemie-und-Leben topic, optional gA; actual selection page69';reason.append('actual conditional selection, not unrestricted mandatory GK/LK dye scope')
  if '/RP/upper' in path:
   tc=str(g.get('topicCode',''));pg=36 if tc=='1.5'else 47 if tc in ['6.1','6.2']else 48 if tc.startswith('6.')else 54 if tc=='8.3'else 55 if tc.startswith('8.')else 62 if tc=='12.2'else 73 if tc=='17.2'else None
   if pg:ch.update(sourcePage=pg,sourceRef=f'RP Chemie MSS2022,{tc},physical PDF{pg}/printed{pg}',sourceSpan=f'{tc}; physical PDF{pg}/printed{pg}');reason.append('actual content page replaces index-page locator; elective/additum context stays explicit')
   if tc=='6.2' and ('002-'in gid or '003-'in gid):ch['courseLevel']='LK';ch['sourceScopeCondition']='LK Wahlpflicht/Additum, not compulsory for all courses'
  if '/HB/upper' in path:
   suffix=next((k for k in range(80,89)if f'-{k:03d}-'in gid),None)
   raw={80:'erklären Farbigkeit als Wechselwirkung von Strahlung und Materie.',81:'vergleichen und bewerten verschiedene natürliche und künstliche Farbstoffe anhand ausgewählter Kriterien (Nutzen und Risiko).',82:'interpretieren Absorptionsspektren photometrischer Messungen.',83:'beschreiben die Molekülstruktur von farbigen, organischen Verbindungen und ordnen Farbstoffklassen zu.',84:'Farben und Färben im Alltag (z. B. Kleidung, Lebensmittel, Tätowierungen)',85:'erklären die Struktur und Bindungsverhältnisse im Benzol mit dem Mesomeriemodell.; diskutieren die Grenzen der Lewis-Schreibweise zur Darstellung von Benzol.',86:'geben typische Reaktionen aromatischer Verbindungen an und beschreiben typische Reaktionsbedingungen für einfache Beispiele.',87:'Zweitsubstitution, mesomerer und induktiver Effekt, Substituenten 1. und 2. Ordnung',88:'erörtern Nutzen und Risiken von kanzerogenen aromatischen Verbindungen.'}.get(suffix)
   if raw:ch.update(sourceText=raw,rawSourceText=raw,sourcePage=35 if suffix<85 else 36,courseLevel='GK_LK',sourceScopeCondition='optional Vertiefungen thin box' if suffix in [84,87]else 'binding thick competence box; named deeper canonical operators are partial contributions only');reason.append('actual HB primary clauses; remove invented mechanism/research/history verbs; optional boxes stay optional')
  if ch:sourcepatch(path,gid,ch,'; '.join(reason))

# Synchronize every plain alias and older review, not just the book's chosen review path.
remove={}
for p in read(V4/'author/exact18-component-mapping-patches.author.json')['patches']:remove.setdefault(p['sourceGoalId'],set()).update(x['canonicalGoalId']for x in p['removedExactMappingRows'])
ac='ac700167-001f-5ff8-9a7d-85909f5daa4f';dye='fa21e8e1-b430-54ad-9647-f763bc4137ba';spec=IDS[5];exc=IDS[15];ind=IDS[10]
remove.setdefault('de-hh-chemie-sekii-bildungsplan-2022-1-3-025-5debb6d4',set()).add(ac)
remove.setdefault('st-chem-seki-st-schuljahrgange-7-8-chemie-als-naturwissenschaft-beschreiben-007-44a82400',set()).add(dye)
remove.setdefault('hb-chemistry-sekii-gyo2022-3-3-4-2-farbstoffe-083-3ac261be',set()).add(IDS[6])
remove.setdefault('hb-chemistry-sekii-gyo2022-3-3-4-2-farbstoffe-084-3542605a',set()).add(IDS[9])
for sid,targets in [('rp-chem-sekii-rp-ch-sekii-2022-baustein-6-2-003-34dc2823',[dye,exc,spec,IDS[6]]),('rp-chem-sekii-rp-ch-sekii-2022-baustein-12-2-005-929c5e9d',[ac,IDS[1],IDS[12],IDS[11]]),('rp-chem-sekii-rp-ch-sekii-2022-baustein-1-5-005-e1909ebc',[dye,exc,spec]),('rp-chem-sekii-rp-ch-sekii-2022-baustein-17-2-010-7a5dc35f',[dye,exc,spec])]:remove.setdefault(sid,set()).update(targets)
# All additional SekI indicator/titration aliases are the same evidenced depth/method error.
for path,d in extracts.items():
 for g in d['sourceGoals']:
  if str(d.get('stage','')).casefold()in ['seki','lower-secondary'] and any(m['legacyGoalId']==g['id']and m['canonicalGoalId']==ind for mp in parents.values()for m in mp.get('mappings',[])):remove.setdefault(g['id'],set()).add(ind)
  if g['id'].startswith(('th-chem-sekii-th-ch-sekii-4-1-4','sn-chem-sekii-sn-ch-jahrgangsstufe-11')) and any(t in g.get('sourceText','').casefold()for t in ['indikator','titration']):remove.setdefault(g['id'],set()).add(ind)
mapchanges=[]
for path,d in maps.items():
 before=parents[path];removed=[m for m in d.get('mappings',[])if m.get('canonicalGoalId')in remove.get(m.get('legacyGoalId'),set())]
 if not removed:continue
 d['mappings']=[m for m in d['mappings']if m not in removed];dec=[]
 for row in d.get('decisions',[]):
  bad=remove.get(row.get('sourceGoalId'),set());old=copy.deepcopy(row);row['canonicalGoalIds']=[x for x in row.get('canonicalGoalIds',[])if x not in bad]
  if row!=old:
   row['rationale']='Bounded v7 author component correction: unsupported chemical family/method/depth or ancestor removed. Retained partner components are not a full-source-union approval.'
   if not row['canonicalGoalIds']:row['decision']='excluded'
   dec.append(dict(before=old,after=copy.deepcopy(row)))
 mapchanges.append(dict(parentPath=path,parentSHA256=sha(R/path),removedExactRows=removed,decisionReplacements=dec,addedExactRows=[]))
def add(sid,target,reason):
 for path,d in maps.items():
  if not any(x.get('legacyGoalId')==sid for x in d.get('mappings',[])):continue
  if any(x.get('legacyGoalId')==sid and x.get('canonicalGoalId')==target for x in d['mappings']):continue
  row=dict(legacyGoalId=sid,canonicalGoalId=target,matchType='partial',reviewDecisionId=sid);d['mappings'].append(row)
  change=next((x for x in mapchanges if x['parentPath']==path),None)
  if not change:change=dict(parentPath=path,parentSHA256=sha(R/path),removedExactRows=[],decisionReplacements=[],addedExactRows=[]);mapchanges.append(change)
  change['addedExactRows'].append(row)
  for dec in d.get('decisions',[]):
   if dec.get('sourceGoalId')!=sid:continue
   old=copy.deepcopy(dec);dec['canonicalGoalIds'].append(target);dec['decision']='mapped';dec['rationale']='Bounded v7 author partial component allocation: '+reason+' Full partner body and whole source union are not approved.'
   earlier=next((x for x in change['decisionReplacements']if x['before']['sourceGoalId']==sid),None)
   if earlier:earlier['after']=copy.deepcopy(dec)
   else:change['decisionReplacements'].append(dict(before=old,after=copy.deepcopy(dec)))
add('aaed261c-20d8-5529-ab11-3d8cfa68bc0a',IDS[0],'Actual BY C12-EA.5.6 explicitly carries the atomic orbital/resonance/energy facet; ancestor inheritance is blocked.')
for sid in ['he-chem-sekii-q2-3-b02-a01-f8de3123','he-chem-sekii-q2-3-b04-a01-beb090df']:add(sid,IDS[18],'Sigma-complex substep is derived from the explicitly required first electrophilic-substitution mechanism, not a fictitious separately named literal clause.')
add('bf96116a-73d6-589a-b3a7-dd2377e8d6af','ac8b6c0f-98b2-5092-806d-d9498efbfa35','Research/retrieval/documentation allocated to existing source-method partner. BY simple-organic research is a partial digital-source instance; analogue/complex-representation/citation breadth of the full partner remains unapproved.')
for p in ep:
 # Synchronize decision sourceSpan as it is read before source-goal sourceSpan by the rationale consumer.
 for path,d in maps.items():
  if d.get('sourceExtractionPath')!=p['parentPath']:continue
  for dec in d.get('decisions',[]):
   if dec.get('sourceGoalId')!=p['sourceGoalId']:continue
   old=copy.deepcopy(dec);dec['sourceSpan']=str(p['after']['sourceSpan'])
   if dec==old:continue
   change=next((x for x in mapchanges if x['parentPath']==path),None)
   if not change:change=dict(parentPath=path,parentSHA256=sha(R/path),removedExactRows=[],decisionReplacements=[],addedExactRows=[]);mapchanges.append(change)
   prior=next((x for x in change['decisionReplacements']if x['before']['sourceGoalId']==p['sourceGoalId']),None)
   if prior:prior['after']=copy.deepcopy(dec)
   else:change['decisionReplacements'].append(dict(before=old,after=copy.deepcopy(dec)))
for x in mapchanges:write(C/x['parentPath'],maps[x['parentPath']]);x['privateSuccessor']=bind(C/x['parentPath'])
for path in {x['parentPath']for x in ep}:write(C/path,extracts[path])
write(O/'author/exact-all-alias-mapping-components.author.json',dict(schemaVersion=1,patches=mapchanges,allOriginal18AliasesAndOlderHHIncluded=True,wholeFileOverwriteInstruction=False,newIndependentVotes=0))
write(O/'author/exact-consumed-sourceText-course-locator-components.author.json',dict(schemaVersion=1,patches=ep,sourceSuccessors=[dict(parentPath=p,privateSuccessor=bind(C/p))for p in sorted({x['parentPath']for x in ep})],consumedField='sourceText',ignoredRawOnlyFixAvoided=True,primaryFilesUnchanged=True))

# Atomic I/M restored. Accepted EN parity and selected3 image bytes remain exact.
candidate=copy.deepcopy(can);gg={g['id']:g for g in candidate['goals']};v4can=read(V4/'author/canonical-whole523.two-body-three-link.author-candidate.json');vg={g['id']:g for g in v4can['goals']}
goalpatch=[]
for gid in IDS:
 before=copy.deepcopy(gg[gid]);gg[gid].setdefault('extendedData',{})['applicabilityMappingInheritance']='boundary'
 if gid==IDS[17]:gg[gid]['descriptionEn']=vg[gid]['descriptionEn']
 if gid in [IDS[0],IDS[6],IDS[18]]:gg[gid]['resourceLinks']=copy.deepcopy(vg[gid]['resourceLinks'])
 goalpatch.append(dict(goalId=gid,before=before,after=copy.deepcopy(gg[gid]),reason='Existing inheritance-boundary contract blocks every broad source ancestor; only explicit atomic facets may contribute. No ID/body/edge split.'))
write(O/'author/exact20-goal-source-boundary-and-d61EN-three-link-patches.author.json',dict(schemaVersion=1,patches=goalpatch,originalAtomic4bBodyRestored=gg[IDS[13]]['description']==next(g['description']for g in can['goals']if g['id']==IDS[13]),newIDs=[],edgeChanges=[]))
write(C/'candidate/canonical-whole523.json',candidate)
write(O/'author/research-existing-partner-allocation.author.json',dict(schemaVersion=1,chemistryGoalId=IDS[13],researchPartnerWhole=next(x for x in can['goals']if x['id']=='ac8b6c0f-98b2-5092-806d-d9498efbfa35'),sourceGoalId='bf96116a-73d6-589a-b3a7-dd2377e8d6af',sourceOccurrences=['C13-GA.3.4','C13-EA.3.4'],fit='partial source-research method component only; broader analogue/complex representation requirements are not certified',independentAllocationApproval=False,scienceCasesAndProfileRestoreReference=bind(B/'author/whole20.profile-payloads.author.json'),researchSupplementReference=bind(V4/'author/whole40.expanded-cases.author.json'),scope='v4 r3/e3 becomes supplemental evidence for the existing process partner; no separate research requirement or credit on atomic I/M goal'))
write(O/'author/HOLD.b7-official-full-course-entitlement.json',dict(schemaVersion=1,goalId=IDS[19],status='HOLD_no_current_Gymnasium_full_official_route_demonstrated',bodyAndTwoScienceCases='KEEP',primaryAudit=bind(AUD/'PER_GOAL_FINDINGS.actual.json'),actualSearchDate='2026-10-13',searchedOfficialDomains=['kultus.hessen.de','lehrplanplus.bayern.de','bildungsplaene-bw.de','bildung.saarland.de','nibis.de'],foundOutsideScope=[dict(url='https://kultus.hessen.de/sites/kultus.hessen.de/files/2023-07/kc_fos_chemisch-physikalische_technik_2022.pdf',reason='Fachoberschule, not current Gymnasium route'),dict(url='https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kcbg_chemietechnik_ausgabe2018.pdf',reason='Berufliches Gymnasium Chemietechnik, not the current general Gymnasium subject/source scope')],SL78='Alkylation only, no acylation/planning-control mandate',HEAuthoredSource='Retained authored source JSON is not an official primary mandate',fullSourceUnionApproved=False,newStrictGain=0))
print(json.dumps({'writtenMappingFiles':len(mapchanges),'removedAliasRows':sum(len(x['removedExactRows'])for x in mapchanges),'addedFacetRows':sum(len(x['addedExactRows'])for x in mapchanges),'writtenExtractionRows':len(ep),'boundaryGoalRows':20,'b7':'explicit HOLD','activeWrites':False}))
