from pathlib import Path
import copy,hashlib,json
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
def read(p):return json.loads((R/p).read_text())
def dump(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
state=json.loads((O/'private-workspace.json').read_text());ID=state['goalId'];goal=json.loads((O/'whole-current-goal.json').read_text());old=state['Prow'];native=json.loads((O/'native-check-summary.json').read_text());newInput=native['checks']['new-image-independent-V-ledger-native-bindings']['P']['expectedCurrentInputFingerprintFromNative']
relative=O.relative_to(R).as_posix();reviewId='canonical-math-boxplot-label-context-refresh-20261107-v1'
pc=state['Pconfig'];conf=state['PconfigObject'];lines=(R/conf['reviewPath']).read_text().splitlines(keepends=True);retained=[x for x in lines if json.loads(x)['goalId']!=ID]
assert len(retained)==12
(O/'P-retained12.review.jsonl').write_text(''.join(retained))
c12=copy.deepcopy(conf);c12['reviewPath']=relative+'/P-retained12.review.jsonl';c12['scope']['goalIds']=[g for g in conf['scope']['goalIds'] if g!=ID];c12['scope']['label']='Twelve unchanged historical profiles; exact raw review rows retained after private boxplot candidate split. No new review.'
dump(O/'P-retained12.config.json',c12)
c1=copy.deepcopy(conf);c1['reviewId']=reviewId;c1['reviewPath']=relative+'/P-target.review.jsonl';c1['scope']={'label':'One boxplot image annotation correction; independent current-image P review required before activation.','goalIds':[ID]};dump(O/'P-target.config.pending.json',c1)
proposal={k:v for k,v in old.items() if k not in ['reviewId','reviewedAt','reviewer','reason','reviewRunIds','dissent']};proposal['reviewId']=reviewId;proposal['reviewInputFingerprint']=newInput
dump(O/'P-target.profile-payload.pending.json',{'notAnAdmissibleReviewRecord':True,'noReviewPerformedByPreparer':True,'mechanicalPayloadOnly':proposal,'requiredIndependentlyAuthoredFields':['reviewedAt','reviewer','reason','reviewRunIds','dissent'],'requiredReasonScope':'Re-evaluate all three expectations and all three bilingual application cases against the unchanged current AB2/J7 goal, exact v2 image hash, unchanged source/requirements and fresh independent performance. Record actual checks and limitations. Keep AI candidate/E1/G1 and do not claim human approval.'})
reg='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';registry=read(reg);si=next(i for i,x in enumerate(registry['subjects'])if x['subject']=='mathematik');paths=state['subject']['positiveEvidenceConfigPaths'];pi=paths.index(pc);jpath=f'/subjects/{si}/positiveEvidenceConfigPaths/{pi}'
dump(O/'P-routing-application-diff.pending.json',{'requiresIndependentPReview':True,'target':reg,'beforeSha256':state['protected'][reg]['sha256'],'operations':[{'op':'test','path':jpath,'value':pc},{'op':'remove','path':jpath},{'op':'add','path':jpath,'value':relative+'/P-retained12.config.json'},{'op':'add','path':f'/subjects/{si}/positiveEvidenceConfigPaths/{pi+1}','value':relative+'/P-target.config.json'}],'pendingTargetConfigMustNotBeRoutedYet':'P-target.config.pending.json must become P-target.config.json only after a real independent P-target.review.jsonl exists and passes native checks.','historicalOriginalConfigAndReviewRemainUnchanged':True,'goalSetBefore':conf['scope']['goalIds'],'goalSetAfterUnion':c12['scope']['goalIds']+[ID],'duplicateOwnershipAfter':False,'netPCountDeltaRequired':0})

dindex=state['Dindex'];droot=(R/dindex).parent;di=read(dindex);dentry=next(x for x in di['resolutions']if x['goalId']==ID);dr=json.loads((droot/dentry['resolutionPath']).read_text());inp=json.loads((droot/'round-a/description-review-input.json').read_text());dgoal=next(x for x in inp['goals']if x['goalId']==ID)
dump(O/'D-existing-bindings-and-retention-question.json',{'indexPath':dindex,'indexSha256':sha(R/dindex),'resolutionPath':str((droot/dentry['resolutionPath']).relative_to(R)),'resolutionSha256':sha(droot/dentry['resolutionPath']),'existingResolutionGoalBindings':dr['goal'],'existingBoundPageVisualization':dgoal['reviewContext']['page'].get('visualization'),'currentCanonicalGoalUnchanged':True,'nativeExistingDChainValid':native['checks']['new-image-independent-V-ledger-native-bindings']['D'],'additionalIndependentDReviewRequired':False,'scopeClarification':'Native D protects unchanged verbal goal/canonical context here, not actual PNG bytes. No new D gate is imposed. Current-image/goal fit is independently covered by V2; native D pass is not a new image-byte approval.','currentCanonicalBindingAuditFormatApplicability':{'format':'current-canonical-binding-audit-v1','actualGoalHasExtendedDataProvenance':bool(goal.get('extendedData',{}).get('provenance')),'applicableForThisUnchangedCanonicalGoal':False,'reason':'The native format requires sourceGoalId/sourceLandscapeId in extendedData.provenance plus exact reviewed mapping/extraction decisions. This goal has no such provenance object. Do not invent source mappings or misuse the source audit as an image-byte rebind.'}})

md=['# Unabhängige aktuelle P-Prüfung: Boxplot-Labelkorrektur','',
'Dies ist ein Reviewpaket, keine Freigabe. Der Ersteller dieses Pakets ist Bildautor und darf die aktuelle fachliche P-Entscheidung nicht ersetzen.','',
f'Ziel: `{ID}`. Phase J7, demandLevel AB2, keine numerische level-Angabe.',
f'DE: **{goal["title"]}** — {goal["description"]}',
f'EN: **{goal["titleEn"]}** — {goal["descriptionEn"]}','',
f'Neues Bild: `../boxplot-label-image-correction-candidate/{ID}-candidate-v2.png`, SHA256 `{state["newHash"]}`.',
f'Altes Bild: SHA256 `{state["oldHash"]}`; alle drei aktiven Kopien weiterhin unverändert.',
'Die unabhängige native/360/680-Bildprüfung steht in `../boxplot-label-image-correction-independent-review/review.json`. Sie ersetzt keine P-Profilprüfung. Zieltexte, Scope, prerequisites, URL und Quell-JSON sind unverändert.','',
'## Tatsächliche Native-Befunde','',
'A: 807/807 aktuell; M: 807/807 aktuell. D: bestehende Fünfer-Indexgruppe nativ 5/5 gültig; der Checker liest jedoch keine neuen PNG-Bytes und erzeugt keine neue Bildseite. Das ist keine neue D/Bild-Kontextfreigabe.',
'P: vorher 13/13 ohne Bindingfehler; nach reinem PNG-Overlay exakt ein stale reviewInputFingerprint für dieses Ziel. Die anderen zwölf Zeilen bleiben unverändert. V-Ledger-Freshness mit der tatsächlichen unabhängigen V2-Review besteht. Die aktuelle Produktions-Authority besitzt die neue immutable receipt noch nicht; der separate Math58-Kandidat wird hier nicht als Produktion ausgegeben.','',
'## Verlangte unabhängige Entscheidung','',
'Prüfe alle nachstehenden Erwartungen und Aufgaben samt Erwartungshorizonten in DE und EN gegen das vollständige aktuelle Ziel und das tatsächlich betrachtete neue Bild. Der Bildhinweis ist keine Leistungsaufgabe: frische Variation und selbstständiger Transfer müssen erhalten bleiben. Entscheide eng, ob das unveränderte Profil nach dieser reinen Beschriftungskorrektur weiter geeignet ist oder fachlich geändert werden muss. Halte die konkrete Prüfung, Einschränkungen, den tatsächlichen Actor und tatsächlichen Zeitpunkt fest.',
'D bleibt auf den unveränderten verbalen Zieltext und kanonischen Kontext begrenzt; der bestehende native D-Vertrag bindet hier keine aktuellen PNG-Bytes. Eine neue D-Entscheidung wird durch diese reine Bildbeschriftungskorrektur nicht verlangt. Der aktuelle Bild/Goal-Fit wurde bereits in V2 unabhängig geprüft. Alte D-Reviewzeiten, Page-/Kontext-/Resolutionhashes bleiben unverändert. Der source-provenance canonical-binding-audit passt mangels extendedData.provenance nicht und wird nicht verwendet.',
'Ein positiver P-Nachfolger bleibt status=needs_human_review, reviewAuthority=ai_candidate, E1/G1; die historische Kennzeichnung bedeutet keinen offenen menschlichen M7-Gate und wird nicht in human approval umgedeutet. Eine positive Entscheidung braucht den neuen Inputhash und neue echte Reviewmetadaten, keine pauschale approved-Setzung.','',
'## Bestehende Erwartungen / Rubrikkern','']
for e in old['profile']['expectations']:
 md += [f'### {e["id"]}','',f'DE Verständnis: {e["essentialUnderstandingDe"]}',f'DE beobachtbare Leistung: {e["observablePerformanceDe"]}',f'EN understanding: {e["essentialUnderstandingEn"]}',f'EN observable performance: {e["observablePerformanceEn"]}','']
md+=['## Bestehende Aufgaben und Erwartungshorizonte','']
for c in old['profile']['applicationCaseBriefs']:
 md += [f'### {c["id"]}','',f'DE Aufgabe: {c["taskDemandDe"]}',f'DE Erwartungshorizont: {c["expectedPerformanceDe"]}',f'DE Verstehensfokus: {c["understandingFocusDe"]}',f'EN task: {c["taskDemandEn"]}',f'EN expected performance: {c["expectedPerformanceEn"]}',f'EN understanding focus: {c["understandingFocusEn"]}','']
md+=['## Coverage und native Fingerprints','',json.dumps(old['profile']['coverageExpectations'],ensure_ascii=False,indent=2),'',f'GoalFingerprint bleibt `{old["goalFingerprint"]}`.',f'ProfileFingerprint bleibt `{old["profileFingerprint"]}`.',f'Alte ReviewInputFingerprint: `{old["reviewInputFingerprint"]}`.',f'Neue native erwartete ReviewInputFingerprint: `{newInput}`.','',
'`P-target.profile-payload.pending.json` enthält ausschließlich das mechanische Payload mit noch fehlenden unabhängigen Reviewfeldern. Es ist absichtlich kein zulässiger Reviewrecord. `P-target.config.pending.json` ist noch nicht geroutet. Die zwölf unveränderten Altprofile stehen raw-byte-identisch im separaten Retained-Scope.','',
'Historische humanApproved/humanReviewed-Felder in der V-Ledger-Zeile werden nicht verändert und nicht für die neuen PNG-Bytes erneuert. Neue Maschinenreview ist ausschließlich an die neue PNG-SHA gebunden. Das Paket enthält keine menschliche Abnahme.']
(O/'independent-P-D-review-packet.md').write_text('\n\n'.join(md)+'\n')

history=R/f'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-v-only-corrections-13-20260920-v1/{ID}/candidate-v1.png'
dump(O/'application-plan.pending.json',{
 'status':'private-mechanical-package-independent-P-review-and-final-native-routing-required',
 'expectedSourceSha256':state['protected'][state['source']]['sha256'],
 'sourceOrGoalJsonChangesRequired':False,
 'assetReplacements':[{'path':p,'expectedBeforeSha256':state['oldHash'],'afterSha256':state['newHash']} for p in state['assets']],
 'promptReplacement':{'target':f'curricula/DE/Gymnasium/visualizations/mathematik/{ID}/prompt.de.md','expectedBeforeSha256':state['protected'][f'curricula/DE/Gymnasium/visualizations/mathematik/{ID}/prompt.de.md']['sha256'],'source':'after-native-import-prompt.de.md'},
 'Vledger':'Apply exact row diff only, bound to existing independent V2 review and preserved human fields. Other rows byte/semantically unchanged.',
 'Pnext':'Only after independent P review: preserve old config+review as history; route unchanged retained12 and one new current-image record through the pending exact registry diff. Native-check target1, retained12, and no duplicate/lost ownership.',
 'Dnext':'No new D review or binding change: verbal goal and canonical context unchanged. Existing native D scope does not include PNG bytes. V2 independently covers current image fit.',
 'AMchangesRequired':False,
 'qualifiedVAuthorityNext':'Separate Math58 reader/capsule supplies new immutable reviewed-context authority; actual current authority correctly fails until then. Not authored or claimed by this package.',
 'preservedOldPublishedBytes':{'path':str(history.relative_to(R)),'exists':history.exists(),'sha256':sha(history) if history.exists() else None,'matchesOld':history.exists() and sha(history)==state['oldHash']},
 'requiredRemainingIndependentEvidence':['Current-image P profile suitability/rebind finding for all3 expectations/cases, with actual actor/time and exact new image hash.','Completed separate Math58 authority/capsule integration proof for new image bytes.'],
 'requiredPostApplicationChecks':['Source e4de and goal/resource URL unchanged.','All3 PNG copies equal e1bda; old published173f history retained.','V ledger row mapped only to independent V2 review; human fields unchanged.','Native P target1 plus retained12 pass, no overlap/loss, subject P goal set/count unchanged.','Native A/M remain807/807; D scope remains intact through unchanged verbal-goal/canonical-context proof; V2 separately covers image fit.','Only affected native checks; no full CQR or prohibited Source-A probe.'],
 'activeWrites':False,'humanApprovalChanges':False,'newPReviewByPreparer':False,'oldReviewsRewritten':False,
})
changed=[p for p,g in state['protected'].items()if sha(R/p)!=g['sha256']];assert not changed,changed
dump(O/'after-input-guards.json',{p:{'sha256':sha(R/p),'unchanged':True}for p in state['protected']})
print(json.dumps({'packet':str(O/'independent-P-D-review-packet.md'),'activeUnchanged':True,'retainedRawRows':12,'newPReviewStillMissing':True},indent=2))
