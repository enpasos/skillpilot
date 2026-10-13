# Apache-2.0. Primary-grounded scoped author proposals, not independent votes.
from pathlib import Path
import copy, datetime, hashlib, json, os, shutil, uuid
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N=E/'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13'
OLD=E/'chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11'
F=E/'chemie-f947-bounded-source-route-remediation-author-20261013-v9'
S=R/'tmp/chemie-f947-final-neutral-native-execution-20261013-v11';X=R/'tmp/chemie-f947-primary-case-author-private-20261013-v13'
G='f947cd04-952a-5a9d-9445-3ffc70e02c3c';HB20='hb-chemistry-sekii-gyo2022-3-2-e-kunststoffe-020-2d42e381';HB76='hb-chemistry-sekii-gyo2022-3-3-4-1-kunststoffe-076-c8507858';TH='th-chem-sekii-th-ch-sekii-4-1-8-synthesen-170-01-90f79527';RP='rp-chem-sekii-rp-ch-sekii-2022-baustein-13-4-007-4a8501d0'
HB_LITERAL='erklären die Entstehung wichtiger Kunststoffe über Reaktionen der Polymerisation, Polyaddition und Polykondensation und beschreiben deren Struktur.'
HB_NEW='hb-chemistry-sekii-gyo2022-primary-3-3-4-1-bullet-02-'+str(uuid.uuid5(uuid.NAMESPACE_URL,'HB-GYO-CHEMIE-2022|printed34|fachinhaltliche2|'+HB_LITERAL))
FAMILY=['6eb14e47-187c-5ba1-8b08-a0ee95ad88a9','9b942490-ad8f-52ba-8c5a-f8a9792b7db5',G]
CLASS=['3e9eb5d0-3407-5a1e-9492-ad87f98d303d','2652caef-b557-58b9-9b28-70db62625ce5']
rd=lambda p:json.loads(p.read_text());rp=lambda p:str(p.relative_to(R));h=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:{'path':rp(p),'sha256':h(p),'bytes':p.stat().st_size}
def wr(p,d):
 assert p.is_relative_to(N);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def private_parent(path):
 assert path.is_relative_to(X);cur=X
 for part in path.relative_to(X).parts:
  cur=cur/part
  if cur.is_symlink():
   src=cur.resolve(strict=True);assert src.is_dir();cur.unlink();cur.mkdir()
   for child in src.iterdir():(cur/child.name).symlink_to(child,target_is_directory=child.is_dir())
  elif not cur.exists():cur.mkdir()
  assert cur.is_dir() and not cur.is_symlink(),cur
def private_bytes(p,b):
 private_parent(p.parent)
 if p.exists() or p.is_symlink():p.unlink()
 p.write_bytes(b);assert not p.is_symlink() and p.resolve().is_relative_to(X)
if not X.exists():
 X.mkdir()
 for directory,dirs,files in os.walk(S,followlinks=False):
  dest=X/Path(directory).relative_to(S);dest.mkdir(parents=True,exist_ok=True)
  for name in list(dirs):
   src=Path(directory)/name
   if src.is_symlink():(dest/name).symlink_to(src.resolve(strict=True),target_is_directory=True);dirs.remove(name)
  for name in files:
   src=Path(directory)/name
   if src.is_symlink():(dest/name).symlink_to(src.resolve(strict=True))
   else:shutil.copyfile(src,dest/name)
private_parent(X/rp(N))
oldplan=rd(OLD/'source/FINAL.source-route-author-plan.pending-scientific-judgment.json');by_original={p['originalLiveBinding']['path']:p for p in oldplan['authorProposedSourceChanges']}
mapping_files={p['originalLiveBinding']['path']:R/p['originalLiveBinding']['path'] for p in oldplan['authorProposedSourceChanges']}
for p in (R/'curricula/DE/Gymnasium/mapping').rglob('*.json'):
 if 'quality' in p.parts:continue
 d=rd(p)
 if any(r.get('legacyGoalId') in [HB20,HB76,TH,RP] for r in d.get('mappings',[])):mapping_files[rp(p)]=p
assert len(mapping_files)==25
source_paths=sorted({rd(p).get('sourceExtractionPath') for p in mapping_files.values() if rd(p).get('sourceExtractionPath') and any(r.get('legacyGoalId') in [HB20,HB76,TH,RP] for r in rd(p).get('mappings',[]))})
extractions={};source_changes=[]
for path in source_paths:
 original=rd(R/path);new=copy.deepcopy(original);changed=[]
 def isolated_passage(goal,tag,text,page,span,course=None):
  oldp=next(p for p in new['passages'] if p['id']==goal['passageId'])
  if goal['id'] in oldp.get('sourceGoalIds',[]):oldp['sourceGoalIds']=[id for id in oldp['sourceGoalIds'] if id!=goal['id']]
  passage={'id':goal['passageId']+'-primary-'+tag,'topicCode':goal['topicCode'],'title':span,'text':text,'rawText':text,'page':page,'sourcePath':oldp.get('sourcePath',original.get('sourceDocument',{}).get('path')),'sourceGoalIds':[goal['id']]}
  if oldp.get('sourceDocumentKey'):passage['sourceDocumentKey']=oldp['sourceDocumentKey']
  if course:passage['courseLevel']=course
  new['passages'].append(passage);goal['passageId']=passage['id']
 for goal in new['sourceGoals']:
  id=goal['id']
  if id==HB20:
   literal='beschreiben die Entstehung von Makromolekülen aus Monomeren.'
   goal.update(title='Entstehung von Makromolekülen aus Monomeren beschreiben',description='Die lernende Person kann die Entstehung von Makromolekülen aus Monomeren beschreiben.',sourceText=literal,rawSourceText=literal,parentBulletText=literal,rawParentBulletText=literal)
   isolated_passage(goal,'macro-bullet-2',literal,19,'HB gedruckte und physische Seite 19: fachinhaltlicher Makromolekül-Bullet')
   changed.append(id)
  elif id==HB76:
   literal='ordnen Kunststoffe anhand ihrer Eigenschaften und Strukturen.'
   goal.update(title='Kunststoffe anhand ihrer Eigenschaften und Strukturen ordnen',description='Die lernende Person kann Kunststoffe anhand ihrer Eigenschaften und Strukturen ordnen.',sourceText=literal,rawSourceText=literal,parentBulletText=literal,rawParentBulletText=literal)
   isolated_passage(goal,'classification-bullet-1',literal,34,'HB gedruckte und physische Seite 34: Thema 4.1, fachinhaltlicher Klassifikations-Bullet')
   changed.append(id)
  elif id==TH:
   span='Qualifikationsphase, 4.1.8 Kunststoffe, Synthesen; rechte Spalte zusätzlich erhöhtes Anforderungsniveau; physische PDF-S. 58 / gedruckte S. 53'
   goal.update(courseLevel='LK',sourceSpan=span,rawSourceSpan=span,sourceRef='Lehrplan Gymnasium Chemie Thüringen 2024, '+span)
   goal['tags']=[('course:LK' if t=='course:GK_LK' else t) for t in goal['tags']]
   isolated_passage(goal,'polyaddition-eAN',goal['rawSourceText'],58,span,'LK');changed.append(id)
  elif id==RP:
   span='13.4 ökologisch-ökonomische Betrachtungen; Vertiefungs- bzw. Verzahnungsmöglichkeiten (wahlweise); physische und gedruckte S. 65'
   goal.update(sourceSpan=span,rawSourceSpan=span,sourceRef='RP-CH-SEKII-2022, '+span,courseLevel='GK_LK')
   goal['tags']=[('courseLevel:GK_LK' if t=='courseLevel:LK' else t) for t in goal['tags']]+['selection:optional-deepening']
   isolated_passage(goal,'optional-polyaddition',goal['rawSourceText'],65,span,'GK_LK');changed.append(id)
 if HB20 in changed:
  prototype=copy.deepcopy(next(g for g in new['sourceGoals'] if g['id']==HB76));prototype.update(id=HB_NEW,passageId='hb-chemistry-sekii:3.3-4-1-KUNSTSTOFFE-primary-formation-bullet-2',bulletIndex=89,aspectIndex=1,title='Entstehung wichtiger Kunststoffe durch drei Bildungsreaktionen erklären',description='Die lernende Person kann die Entstehung wichtiger Kunststoffe über Polymerisation, Polyaddition und Polykondensation erklären und deren Struktur beschreiben.',sourceText=HB_LITERAL,rawSourceText=HB_LITERAL,parentBulletText=HB_LITERAL,rawParentBulletText=HB_LITERAL,sourceSpan='3.3-4-1-KUNSTSTOFFE, fachinhaltlicher Bullet 2; physische und gedruckte S. 34',rawSourceSpan='3.3-4-1-KUNSTSTOFFE, fachinhaltlicher Bullet 2; physische und gedruckte S. 34',sourceRef='Bremen Bildungsplan Chemie Gymnasiale Oberstufe 2022, Thema 4.1, fachinhaltlicher Bullet 2, physische/gedruckte S. 34')
  new['sourceGoals'].append(prototype);new['passages'].append({'id':prototype['passageId'],'topicCode':prototype['topicCode'],'title':'Thema 4.1 Kunststoffe: Bildung und Struktur','text':HB_LITERAL,'rawText':HB_LITERAL,'page':34,'sourcePath':'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','sourceDocumentKey':'HB-GYO-CHEMIE-2022','sourceGoalIds':[HB_NEW],'courseLevel':'GK_LK'})
 new['pipelineStatus']['currentStep']='MAPPING-3'
 for step in new['pipelineStatus']['steps']:
  if step['id']=='MAPPING-3':step['status']='in_progress';step['checks']=[{'id':'author-primary-amendment-pending-independent-review','label':'Gezielte Primärkorrekturen sind Autorkandidaten; Quellenoperator- und Mapping-Freigabe noch offen','passed':False,'details':', '.join(changed)+('; neue exakte HB34-Quelle '+HB_NEW if HB20 in changed else '')}]
 name=Path(path).stem+'.primary-author-'+h(R/path).split(':')[1][:10]+'.json';dest=N/'source/candidate-extraction-successors'/name;wr(dest,new)
 extractions[path]=rp(dest);source_changes.append({'originalBinding':bind(R/path),'candidateBinding':bind(dest),'changedSourceGoalIds':changed,'newExactPrimarySourceGoalIds':[HB_NEW] if HB20 in changed else [],'allOtherWholeSourceGoalRowsExact':True,'allPrimaryDocumentBytesUnchanged':True,'amendmentIndependentlyApproved':False})
plans=[];changed_mapping_rows=[]
for original_path,src in sorted(mapping_files.items()):
 original=rd(src);base=rd(R/by_original[original_path]['authorCandidateBinding']['path']) if original_path in by_original else copy.deepcopy(original);new=copy.deepcopy(base)
 effective_source=original.get('sourceExtractionPath')
 if not effective_source and any(r.get('legacyGoalId') in [HB20,HB76,TH,RP] for r in original.get('mappings',[])):
  jurisdiction=next(x for x in ['HB','TH','RP'] if '/DE-'+x+'/' in original_path)
  effective_source=next(path for path in source_paths if '/'+jurisdiction+'/' in path and '/input/' in path)
 if effective_source in extractions:new['sourceExtractionPath']=extractions[effective_source]
 target_changes={}
 for d in new.get('decisions',[]):
  id=d.get('sourceGoalId')
  if id not in [HB20,HB76,TH,RP]:continue
  old=copy.deepcopy(d);allowed=[] if id in [HB20,RP] else CLASS if id==HB76 else [G]
  d['canonicalGoalIds']=[t for t in d.get('canonicalGoalIds',[]) if t in allowed]
  if not d['canonicalGoalIds']:d['decision']='needs_review'
  d['rationale']='AUTHOR ONLY: actual primary/operator correction; no independent vote. '+('P19 has a general macromolecule bullet, not the synthetic formation triad. Existing unrelated mechanism/family claims are held; explicit formation is separately grounded in new HB34.' if id==HB20 else 'P34 literal is classification by properties and structures; formation-family components use the separate exact formation bullet.' if id==HB76 else 'Physical58/printed53 right additional elevated-level column describes polyaddition only; unrelated polymerisation/condensation, recycling, hydrolysis, substitution and coupling components are not claimed.' if id==TH else 'Physical/printed65 is optional deepening/interlinking, spanning the course columns. Stock unmodified API has no choice condition; unqualified course projection is held. Literal mechanism remains available for explicit optional judgment.')
  d['reviewer']='Codex bounded primary-source author; independent amendment judgment pending';d['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
  target_changes[id]={'before':old,'after':copy.deepcopy(d)}
 new['mappings']=[r for r in new.get('mappings',[]) if r.get('legacyGoalId') not in [HB20,HB76,TH,RP] or r['canonicalGoalId'] in ([] if r['legacyGoalId'] in [HB20,RP] else CLASS if r['legacyGoalId']==HB76 else [G])]
 if effective_source in extractions and any(g['id']==HB20 for g in rd(R/effective_source)['sourceGoals']):
  decision={'sourceGoalId':HB_NEW,'topicCode':'3.3-4-1-KUNSTSTOFFE','sourceSpan':'Thema 4.1, fachinhaltlicher Bullet 2, physische/gedruckte S.34','decision':'mapped','canonicalGoalIds':FAMILY,'mappingStrength':'partial','reviewer':'Codex source author; independent primary/operator judgment pending','reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rationale':'AUTHOR ONLY: exact official HB34 formation/structure bullet supports bounded components of the three named reaction families. No whole operator, every plastic, practical manufacture or complete sibling union is approved.'}
  if 'decisions' in new:new['decisions'].append(decision)
  new['mappings'] += [{'legacyGoalId':HB_NEW,'canonicalGoalId':id,'matchType':'partial',**({'reviewDecisionId':HB_NEW} if 'decisions' in new else {})} for id in FAMILY]
 rel=Path(original_path).relative_to('curricula/DE/Gymnasium/mapping');future='curricula/DE/Gymnasium/mapping/'+str(rel.parent/(Path(original_path).stem+'.three-primary-author-20261013-v13.json'));archive='curricula/DE/Gymnasium/mapping/author-f947-three-primary-history/quality/20261013-v13/'+str(rel)
 dest=N/'source/current-mapping-successors'/rel.parent/Path(future).name;wr(dest,new)
 private_old=X/original_path
 # Original aliases already retired by the v11 private simulation retain their old exact archive.
 if private_old.exists():assert h(private_old)==h(src);private_bytes(X/archive,src.read_bytes());private_old.unlink()
 else:private_bytes(X/archive,src.read_bytes())
 if original_path in by_original:
  prior=X/by_original[original_path]['proposedFutureLivePath'];assert prior.is_file() and not prior.is_symlink();prior.unlink()
 private_bytes(X/future,dest.read_bytes())
 plans.append({'originalLiveBinding':bind(src),'candidateBinding':bind(dest),'proposedFutureLivePath':future,'proposedFutureArchivePath':archive,'targetedPrimaryComponentChanges':target_changes,'allOtherWholeMappingComponentsAndFieldsExactExceptDeclaredExtractionPath':True,'originalWholeBytesArchivedPrivateExact':True,'newMappedHB34IsAuthorOnly':HB20 in target_changes})
 changed_mapping_rows += [{'mappingPath':original_path,'sourceGoalId':id,**change} for id,change in target_changes.items()]
source_config=rd(OLD/'source/source-atlas-final.config.json');replacement={old['proposedFutureLivePath']:next(p['proposedFutureLivePath'] for p in plans if p['originalLiveBinding']['path']==old['originalLiveBinding']['path']) for old in oldplan['authorProposedSourceChanges']};replacement.update({p['originalLiveBinding']['path']:p['proposedFutureLivePath'] for p in plans});source_config['mappingPaths']=[replacement.get(path,path) for path in source_config['mappingPaths']]
wr(N/'source/current-source-atlas-primary-author.config.json',source_config)
for p in N.rglob('*'):
 if p.is_file():private_bytes(X/rp(p),p.read_bytes())
wr(N/'source/PRIMARY_SOURCE_AUTHOR.proposed-current-transports-and-component-routing.json',{'schemaVersion':1,'newHB34PrimarySourceId':HB_NEW,'sourceExtractionSuccessors':source_changes,'mappingSuccessors':plans,'oldMappedPartnerIDsAndExactTargetedChanges':changed_mapping_rows,'allOriginalAliasesAndSourcesStillUnmodifiedActive':True,'conditionalRPUnqualifiedProjectionHeld':True,'THPolyadditionFactualLKOnly':True,'newScientificVotes':0,'activeWrites':False})
# Author case successor: add demanded/scored N/E mechanism; preserve all previous valid criteria/data.
cases=rd(OLD/'positive/whole-two-cases.complete-explicit-demands.author.json');before=copy.deepcopy(cases);c=cases['cases'][0]
c['taskDe']='Kennzeichne das Alkohol-Sauerstoffatom als Nucleophil und das NCO-Kohlenstoffatom als Elektrophil und begründe dies anhand der Elektronenpaare bzw. Bindungspolarisierung. Erläutere mit valenzrichtigen Zwischenformeln oder Elektronenpaarbewegungen einen vereinfachten Additions- und Protonübertragungsweg. '+c['taskDe']
c['taskEn']='Identify the alcohol oxygen as the nucleophile and the NCO carbon as the electrophile, explaining this through electron pairs and bond polarisation. Use valence-correct intermediate formulas or electron-pair movements to explain a simplified addition and proton-transfer route. '+c['taskEn']
c['modelAnswerDe']='Das Alkohol-O stellt ein freies Elektronenpaar bereit; das positiv polarisierte zentrale NCO-C ist der elektrophile Angriffsort. Als formales, valenzrichtiges Modell kann eine neue O–C-Bindung mit Verschiebung des C=N-π-Elektronenpaars zum N entstehen: R–N⁻–C(=O)–O⁺(H)–R′. Protonübertragung vom O zum N liefert neutrales R–NH–C(=O)–O–R′. Das ist ein vereinfachtes Elektronenpaarmodell, kein Nachweis eines langlebigen Zwischenprodukts; ein valenzrichtiger konzertierter oder protonenvermittelter Weg ist ebenfalls zulässig. Es wird kein H₂O abgespalten. '+c['modelAnswerDe']
c['modelAnswerEn']='The alcohol O supplies a lone pair; the positively polarised central NCO C is the electrophilic attack site. A formal valence-correct model forms a new O–C bond while shifting the C=N π pair to N: R–N⁻–C(=O)–O⁺(H)–R′. Proton transfer from O to N yields neutral R–NH–C(=O)–O–R′. This is a simplified electron-pair model, not evidence for a long-lived intermediate; a valence-correct concerted or proton-mediated route is also acceptable. No H₂O is eliminated. '+c['modelAnswerEn']
criterion={'expectationId':'e1','maximumPoints':3,'criterionDe':'Begründet O als Nucleophil und NCO-C als Elektrophil; zeigt valenzrichtige Addition und Protonübertragung zum Urethan ohne H₂O.','criterionEn':'Explains O as nucleophile and NCO C as electrophile; shows valence-correct addition and proton transfer to urethane without H₂O.','fullCreditDe':'1 Punkt: freies Elektronenpaar des Alkohol-O und polarisierter NCO-C als Reaktionspartner erklärt. 1 Punkt: neue O–C-Bindung und zulässige Elektronenpaar-/Bindungsänderung mit richtiger Ladung und Valenz gezeigt. 1 Punkt: Protonübertragung bzw. gültiger konzertierter/protonenvermittelter Weg zum neutralen Urethan ohne Wasserabspaltung erläutert.','fullCreditEn':'1 point: explains the alcohol O lone pair and polarised NCO C as reaction partners. 1 point: shows the new O–C bond and valid electron-pair/bond change with correct charge and valence. 1 point: explains proton transfer or a valid concerted/proton-mediated route to neutral urethane without water elimination.','partialCreditDe':'1 oder 2 Punkte nach den tatsächlich erfüllten Teilkriterien; eine bloße Produktformel ohne N/E-Begründung und Reaktionsweg erfüllt diesen Zusatz nicht.','partialCreditEn':'1 or 2 points for the subcriteria actually met; a product formula alone without N/E reasoning and a reaction route does not meet this addition.','zeroCreditDe':'0 Punkte: N/E-Rollen und valenzrichtiger Weg fehlen oder widersprechen der Struktur.','zeroCreditEn':'0 points: N/E roles and a valence-correct route are absent or contradict the structure.'}
c['rubric'].append(criterion);c['maximumPoints']=9;c['gradingBoundary']=c['gradingBoundary'].replace('Six points','Nine points')
assert c['dataDe']==before['cases'][0]['dataDe'] and c['dataEn']==before['cases'][0]['dataEn'];assert c['rubric'][:3]==before['cases'][0]['rubric'];assert cases['cases'][1]==before['cases'][1]
wr(N/'positive/whole-two-cases.nucleophile-electrophile.author-successor.json',cases)
spec=rd(OLD/'positive/P1.complete-demands.author-candidate-set.unbound.json');spec['reviewId']='chemie-f947-primary-and-NE-author-20261013-v13';spec['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();spec['reviewer']='Codex scoped source/case author; no independent acceptance';spec['goals'][0]['reason']='Source-primary and N/E remediation author candidate only. Case1 now explicitly demands and scores oxygen nucleophile, NCO carbon electrophile, valence-correct addition and proton transfer without H2O. Existing complete rubrics/data/balances and the actual PNG are preserved. Source scope, conditional RP and fresh paired judgments remain pending; no laboratory or human acceptance.'
profile=spec['goals'][0]['profile'];e1=next(e for e in profile['expectations'] if e['id']=='e1');e1['essentialUnderstandingDe']+=' Die Bildung lässt sich als nucleophile Addition des Alkohol-O am elektrophilen NCO-C mit Protonübertragung erklären.';e1['essentialUnderstandingEn']+=' Formation can be explained through nucleophilic addition of alcohol O at electrophilic NCO C with proton transfer.';e1['observablePerformanceDe']='Begründet N/E-Rollen, zeigt einen valenzrichtigen Additions-/Protonübertragungsweg und leitet Bindungsmotiv und Repetiereinheit mit korrekten O-, N- und Carbonylbindungen ab.';e1['observablePerformanceEn']='Explains N/E roles, shows a valence-correct addition/proton-transfer route and derives linkage and repeat unit with correct O, N and carbonyl bonds.'
e2=next(e for e in profile['expectations'] if e['id']=='e2');e2['essentialUnderstandingDe']=e2['essentialUnderstandingDe'].replace('Kettenbildung, Endgruppen und Vernetzung','Kettenbildung und Vernetzung');e2['essentialUnderstandingEn']=e2['essentialUnderstandingEn'].replace('chains, end groups and crosslinking','chains and crosslinking')
brief=next(b for b in profile['applicationCaseBriefs'] if b['id']==c['caseId']);brief.update(taskDemandDe=c['taskDe'],taskDemandEn=c['taskEn'],expectedPerformanceDe=c['modelAnswerDe'],expectedPerformanceEn=c['modelAnswerEn']);brief['understandingFocusDe']='Zusätzlich fallbezogen: Alkohol-O als Nucleophil und NCO-C als Elektrophil; valenzrichtige Addition/Protonübertragung ohne H₂O. '+brief['understandingFocusDe'];brief['understandingFocusEn']='Additional case-specific aspect: alcohol O as nucleophile and NCO C as electrophile; valence-correct addition/proton transfer without H₂O. '+brief['understandingFocusEn']
wr(N/'positive/P1.nucleophile-electrophile.author-candidate-set.unbound.json',spec)
wr(N/'checks/author-case-NE-demand-model-rubric-and-preserved-balances.actual.json',{'schemaVersion':1,'newMechanisticDemandAndScoringInBothLanguages':True,'correctOxygenNucleophileAndNCOCarbonElectrophile':True,'formalIntermediateNotClaimedAsObservedOrLongLived':True,'case1OriginalThreeRubricsAndAllSuppliedDataExact':True,'case2WholeCaseExact':True,'stoichiometry200_210_2CO2_4NCO_96Unchanged':True,'unscoredEndgroupClaimRemovedFromExpectationOnly':True,'maximumCase1Points':9,'actualPngUnchanged':'sha256:1704dabc275aea63e09ed793fe211d110a45a30a0ab09b013d32231a74dd7372','independentReviewPending':True,'activeWrites':False,'newScientificVotes':0})
print(json.dumps({'privateRoot':rp(X),'sourceSuccessorCount':len(source_changes),'mappingSuccessorCount':len(plans),'newHB34SourceId':HB_NEW,'NEDemandAndCriterionAuthored':True,'noNativeRendered':True,'activeWrites':False}))
