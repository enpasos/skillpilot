from pathlib import Path
import json,copy,hashlib,os,gzip
ROOT=Path('/home/enpasos/projects/skillpilot');Q=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-M4-twelve-foreign-company-current597-status-nav-scope-author-a-v1';CAP=Path('/tmp/economics-company12-current597-author-a-e3_teq0o/capsule');R='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def load(p):return json.loads(p.read_text())
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):return {'path':str(p.relative_to(ROOT)),'sha256':h(p),'bytes':p.stat().st_size}
def save(n,x):p=O/n;assert not p.exists(),p; p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return binding(p)
def guard(p):assert p.resolve().is_relative_to(CAP.resolve());assert not p.is_symlink();assert not os.path.samefile(p,ROOT/p.relative_to(CAP))
receipt=Q/'wirtschaft-M4-twelve-company-whole-science-independent-merge-audit-v1/actual-final-twelve-company-whole-DEEN-science-three-real-remedies-independent-KEEP.handoff.receipt.json';assert h(receipt)=='e1fd11510e51fb3f6eb1ca83d47116d17d0e93d926b66e11b1b0457dbbef245b';rc=load(receipt);assert rc['scientificVerdict']=='KEEP_all12'
for k in ['qualifiedFinalWhole12','qualifiedFinalAuthorHandoff','current597AndP24Intake']:
 p=ROOT/rc[k]['path'];assert h(p)==rc[k]['sha256'];assert p.stat().st_size==rc[k]['bytes']
bodies=load(ROOT/rc['qualifiedFinalWhole12']['path']);assert len(bodies)==12
base=load(O/'whole-current597-before-company-scope.active-exact.json');assert h(ROOT/R)==h(O/'whole-current597-before-company-scope.active-exact.json')=='6118557f37604ddd3fa5c5b8a418ee9d0061c570dfeea14a12d29ee7cb4addf3';assert len(base['goals'])==597
beforeNative=json.loads(gzip.decompress((Q/'wirtschaft-M4-twelve-local-consumption-communication-media-one-contract-author-a-v1/own-before-current597-consumer12-author-A.actual-native.json.gz').read_bytes()));assert beforeNative['compiler']['summary']['errors']==0
compiled={r['goalId']:r for r in beforeNative['compiler']['goals']}
navs={'E':'14c05eec-87af-5fd6-832a-4f5d9d280e66','Katalog':'5317d078-413b-58bb-9262-d57387d51655','Q4':'5113c64b-405d-5f4b-bae9-70fe530b5e69'}
desc={
'E':(' Weitere eigenständige E-Fallübungen behandeln betriebliche Rahmenbedingungen, Wettbewerbsformen, Finanzierung und Haftung, Produktionsorganisation sowie die Durchführung und Anpassung eines Teamprojekts.',' Further standalone E-phase cases address business framework conditions, competition, financing and liability, production organization, and executing and adapting a team project.'),
'Katalog':(' Weitere eigenständige Fälle vergleichen Kaizen, Lean und Just-in-Sequence sowie fünf Unternehmensstrategien unter konkreten Kapital- und Haftungsbedingungen.',' Further standalone cases compare Kaizen, Lean and just-in-sequence, and five business strategies under concrete capital and liability conditions.'),
'Q4':(' Weitere eigenständige Q4-Fälle untersuchen überprüfbare Unternehmensverantwortung, Folgen unternehmerischer Globalisierung, Schutz und Governance, datenbasierte Beeinflussung und KI sowie Lieferkettenkodizes. Die drei vertiefenden Materialien behalten ihre ausschließliche LK-Kursgrenze.',' Further standalone Q4 cases investigate verifiable corporate responsibility, corporate globalization, protection and governance, data-based influence and AI, and supply-chain codes. The three advanced materials retain their exclusive LK course limits.')}
after=copy.deepcopy(base);am={g['id']:g for g in after['goals']};deltas=[];released=[]
for g in bodies:
 assert g['id'] not in am;assert g['examData']['reviewStatus']=='draft';assert g['requires']==g['examData']['coveredGoalIds'] and len(g['requires'])==1
 n=copy.deepcopy(g);n['examData']['reviewStatus']='released';n['examData']['reviewNote']='Maschinelle fachliche Curriculum-QS durch unabhängige KI-Prüfung abgeschlossen: '+str(receipt.relative_to(ROOT))+'. Menschliche Prüfung, Freigabe und Erprobung bleiben getrennt; keine menschliche Freigabe behauptet.';released.append(n);after['goals'].append(n);am[n['id']]=n
 assert all(n[k]==g[k] for k in g if k!='examData');ng=copy.deepcopy(n['examData']);ng['reviewStatus']='draft';ng.pop('reviewNote');assert ng==g['examData']
for phase,nid in navs.items():
 old=next(g for g in base['goals'] if g['id']==nid);n=am[nid];ids=[g['id'] for g in released if g['phase']==phase];assert len(ids)=={'E':5,'Katalog':2,'Q4':5}[phase]
 n['contains']+=ids;n['description']+=desc[phase][0];n['descriptionEn']+=desc[phase][1]
 actualUnion=sorted(set().union(*[set(compiled[c]['compiledApplicability'].get('jurisdiction',[])) if c in compiled else set(compiled[am[c]['requires'][0]]['compiledApplicability'].get('jurisdiction',[])) for c in n['contains']]))
 previous=n.get('applicability',{}).get('jurisdiction')
 if isinstance(previous,list) and sorted(previous)!=actualUnion:n['applicability']['jurisdiction']=actualUnion
 deltas.append({'goalId':nid,'phase':phase,'newMaterialIds':ids,'wholeBefore':old,'wholeAfter':n,'actualChildJurisdictionUnion':actualUnion,'jurisdictionMetadataChanged':previous!=n.get('applicability',{}).get('jurisdiction'),'sourceClaimAdded':False})
for g in base['goals']:
 if g['id'] not in navs.values():assert am[g['id']]==g
assert len(after['goals'])==609
bodybinding=save('whole-twelve-company-foreign-KEEP-status-only-released.author-candidate.json',released)
canbinding=save('whole-current609-company12-threeNav-actual-child-union.INERT-author-candidate.json',after)
navbinding=save('actual-three-purposeful-Nav-and-qualified-derived-jurisdiction-field-deltas.author.json',deltas)
sealbinding=save('actual-final-company12-foreign-whole-science-byte-reuse-and-current597-start.author-intake.json',{'role':'AUTHOR_STATUS_NAV_SCOPE_ONLY_NO_OWN_FOREIGN_KEEP','foreignScienceReceipt':binding(receipt),'qualifiedFinalAuthorHandoff':rc['qualifiedFinalAuthorHandoff'],'qualifiedWhole12':rc['qualifiedFinalWhole12'],'currentWholeP24Intake':rc['current597AndP24Intake'],'wholeTaskSolutionScoringTagsRequiresAndCoveredExact':True,'statusOnly12WithExplicitAIReviewNote':bodybinding,'actualPurposefulNavAndDerivedFieldRows':navbinding,'wholeBeforeCanonical':binding(O/'whole-current597-before-company-scope.active-exact.json'),'wholeAfterCanonical':canbinding,'navPhaseCounts':{'E':5,'Katalog':2,'Q4':5},'LKOnlyMaterials': [g['id'] for g in released if 'LK' in g['tags'] and 'GK' not in g['tags']],'humanApproval':False,'activeWrites':0})
guard(CAP/R);(CAP/R).write_text(json.dumps(after,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'candidate':canbinding,'body':bodybinding,'intake':sealbinding,'navJurisdictionChanged':[{'id':d['goalId'],'jurisdiction':d['actualChildJurisdictionUnion']} for d in deltas if d['jurisdictionMetadataChanged']]}))
