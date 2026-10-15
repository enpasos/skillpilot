# SPDX-License-Identifier: Apache-2.0
"""Finite allowed science inputs only, with final texts; no native or review claims."""
import datetime,hashlib,json
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']);return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
isrc=E/'chemie-kp-one-mobile-standard-state-image-correction-author-root-20261015-v1/NEUTRAL.one-actual-Kp-PNG-image-only-author.selector.json'
assert ref(isrc)['sha256']=='sha256:942af6c667489f7a41dce4ed79d859645b09c28552ae2f166e7f8e81e5186c7f'
i=load(isrc);canonical=i['currentImageOnlyCanonical'];semantic=i['currentSemanticUnchanged'];assert canonical['sha256']=='sha256:a142c2c533d14fd92c5e285a2f047ab717129389a78afe52054733e52c300053'
c=load(verify(canonical));verify(semantic);verify(i['image']);by={g['id']:g for g in c['goals']}
oldcontext=load(OWN/'inputs/four-current-whole-goals-requires-and-parents.neutral.json');ids=oldcontext['targetGoalIds'];context=dict(oldcontext);context['canonical']=canonical
context['goals']=[by[g['id']] for g in oldcontext['goals']]
context['targetRelations']=[{'goalId':g,'wholeGoal':by[g],'wholeDirectPrerequisites':[by[r] for r in by[g].get('requires',[])],'wholeDirectParents':[p for p in c['goals'] if g in p.get('contains',[])]} for g in ids]
fp=OWN/'inputs/four-final-a142-whole-goals-requires-and-parents.neutral.json';put(fp,context)
oldpartners=load(OWN/'inputs/whole-current-source-union-partners-requires-and-parents.neutral.json');partners=dict(oldpartners);partners.update(canonical=canonical,goals=[by[g] for g in partners['goalIds']])
pp=OWN/'inputs/whole-final-a142-source-union-partners-requires-and-parents.neutral.json';put(pp,partners)
images=OWN/'inputs/final-a142-four-target-asset-contents-and-text-bindings.neutral.json'
put(images,{'role':'Actual current image/text contents and physical byte reference only; no QA/provider/peer judgment','canonical':canonical,'semantic':semantic,'updatedKpImage':i['image'],'targetWholeResourceLinks':[{'goalId':g,'resourceLinks':by[g].get('resourceLinks',[])} for g in ids],'bookPagesPrepared':0,'imageGenerationByThisPreparationRole':0})
primary=OWN/'inputs/PRIMARY.HE2027.whole-Chemie-physical121-127.actual.txt';assert primary.read_text().count('\f')==7
allowed=[fp,pp,images,OWN/'inputs/eight-whole-DEEN-cases-four-scientific-profile-bodies.neutral.json',OWN/'inputs/eight-authored-components-and-explicit-assumptions.unreviewed.neutral.json',OWN/'inputs/four-existing-LK-target-author-declaration.unreviewed.neutral.json',OWN/'inputs/whole-official-BY-HE-RP-source-cells-passages-and-existing-union-edges.neutral.json',OWN/'inputs/existing-whole-primary-page-texts.reference-only.neutral.json',OWN/'inputs/actual-existing-LK-and-SourceAtlas-four-target-compiler-scope.neutral.json',primary]
externalprimary=[]
for doc in load(OWN/'inputs/existing-whole-primary-page-texts.reference-only.neutral.json')['documents']:
 verify(doc['originalPdf']);externalprimary.append(doc['completeSelectedText']);verify(doc['completeSelectedText'])
instruction=OWN/'SOURCE-ONLY.fresh-reader-instructions.neutral.md'
instruction.write_text('''# Vorläufige unabhängige Quellenlektüre für vier Ziele

Dies ist eine endliche Auswahl ganzer wissenschaftlicher Materialien zu den endgültigen DE/EN-Texten a142/c443. Lies alle vier ganzen Kompetenzen mit tatsächlichen Requires/Eltern, alle acht ganzen DE/EN-Aufgaben samt Daten/Modelllösungen/Rubriken/Transfer und alle vier wissenschaftlichen Profilkörper. Lies die ganzen rohen Quellenzellen, Passagen und tatsächlichen Partnerkompetenzen sowie die ganzen referenzierten Primärseiten. Verwende bei Quellen `rawText`, falls nichtleer, sonst `text`; ein leeres `rawText` ist keine leere Quelle.

Die acht Autorenkomponenten, zusätzlichen Modellannahmen und LK-Rollen stehen ausdrücklich als ungeprüfte Autorenpropositionen getrennt von amtlichen Quellen. Prüfe ihren tatsächlichen Inhalt und Geltungsanspruch selbst. Die bestehenden nationalen und HE-LK-Zielumfänge enthalten alle vier Ziele; der bestehende BY-/HE-LK-SourceAtlas enthält sie nicht. Aus einer Autorenproposition folgt keine amtlich benannte Pflicht oder Quellen-/Kursfreigabe. Die vollständigen Chemie-Seiten des HE-Abiturerlasses2027 sind Primärmaterial zum Prüfungskontext2027; ihre Bedeutung für andere Geltungsbereiche ist zu prüfen.

Die aktuelle Kp-Bilddarstellung verwendet dimensionslose normierte Größen mit expliziten Standardzuständen. Beurteile Bild-/Text-/Modellkonventionen zusammen mit den ganzen Fällen; andere zulässig definierte Konventionen werden dadurch nicht zu falschen Formeln.

Diese Auswahl enthält noch keine aktuellen Buchseiten, kein Nativebundle und keine D-Bindung. Eine abschließende eigene FIRST-/Normalbindung erfolgt erst nach Lektüre des finalen kombinierten Quellen- und Seitenselectors. Diese vorläufige Quellenlektüre erteilt keine Reviewclaim-/Quellen-/Kurs-/Humanfreigabe. Ausschließlich die im Selector ausgewählten wissenschaftlichen Dateien sind Leseinputs; die übrigen technischen Arbeitsdateien dieses Roots gehören nicht zum unabhängigen Leseauftrag.
''')
allowed.append(instruction)
selector=OWN/'NEUTRAL.preliminary-source-only-four-final-a142-c443.selector.json'
put(selector,{'schemaVersion':1,'role':'Finite preliminary source-only independent reading input; final whole texts, no book pages or review claims','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonicalFinalTextAndImage':canonical,'semanticSourceIdentityOnly':semantic,'targetGoalIds':ids,'wholeFinalGoalsRequiresParents':ref(fp),'wholeFinalSourcePartners':ref(pp),'wholeEightCasesFourScientificProfileBodies':ref(OWN/'inputs/eight-whole-DEEN-cases-four-scientific-profile-bodies.neutral.json'),'wholeOfficialSourceCellsPassagesExistingUnionEdges':ref(OWN/'inputs/whole-official-BY-HE-RP-source-cells-passages-and-existing-union-edges.neutral.json'),'separateEightUnreviewedAuthorComponentsAndAssumptions':ref(OWN/'inputs/eight-authored-components-and-explicit-assumptions.unreviewed.neutral.json'),'separateUnreviewedExistingLKTargetDeclaration':ref(OWN/'inputs/four-existing-LK-target-author-declaration.unreviewed.neutral.json'),'actualExistingCompilerScopeAndWholeViews':ref(OWN/'inputs/actual-existing-LK-and-SourceAtlas-four-target-compiler-scope.neutral.json'),'wholeExistingPrimaryPageReferences':ref(OWN/'inputs/existing-whole-primary-page-texts.reference-only.neutral.json'),'wholeHE2027ChemistryPrimaryText':ref(primary),'HE2027OfficialPrimaryUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-07/abiturerlass_la_2027.pdf','HE2027WholePhysicalPages':[121,122,123,124,125,126,127],'currentImageContentsOnly':ref(images),'readingInstructions':ref(instruction),'allowedWholeScientificFiles':[ref(p) for p in allowed],'externalWholePrimaryPageTexts':externalprimary,'bookPagesPrepared':0,'nativePrepareRuns':0,'rendererRuns':0,'reviewClaims':0,'newSourceM3Decisions':0,'sourceComponentsOfficial':False,'authorComponentsActive':False,'sourceAtlasRegistrationApplied':False,'requiresFinalSourceAndPageSelectorBeforeIndependentFIRSTBinding':True,'activeWrites':0})
seal=OWN/'FILES.finite-preliminary-source-only-four.allowed-science.seal.json'
rows=[ref(p) for p in allowed]+[ref(selector)];put(seal,{'schemaVersion':1,'role':'Finite allowlist seal only; technical work outside this immutable scientific allowlist may continue','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selector':ref(selector),'files':rows,'externalWholePrimaryPageTexts':externalprimary,'fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),'bookPages':0,'reviewClaims':0})
for r in rows+externalprimary:verify(r)
print(json.dumps({'selector':ref(selector),'seal':ref(seal),'allowedFiles':len(rows),'bytes':sum(r['bytes'] for r in rows),'bookPages':0,'reviewClaims':0}))
