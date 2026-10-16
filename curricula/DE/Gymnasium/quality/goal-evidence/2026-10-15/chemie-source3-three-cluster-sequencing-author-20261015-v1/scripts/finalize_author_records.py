#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Write bounded author rationale, exact selectors and neutral handoff before sealing."""
import hashlib,json
from pathlib import Path
ROOT=Path.cwd();OUT=Path(__file__).resolve().parents[1];REL=OUT.relative_to(ROOT).as_posix()
def read(p):return json.loads((ROOT/p).read_text())
def own(p):return json.loads((OUT/p).read_text())
def write(p,x):(OUT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
sel=own('INPUTS.physical-exact-selector.json');base=read(sel['baseCanonical']['path']);after=read(sel['canonical']['path'])
G={g['id']:g for g in base['goals']};A={g['id']:g for g in after['goals']}
def gid(p):return next(i for i in G if i.startswith(p))
clusterids=list(map(gid,['a00d302b','fb3bdf39','1e803ef8']))
def descend(i):
 out=[]
 for c in G[i]['contains']:out.append(c);out.extend(descend(c))
 return out
reason={
 '8d4ef102':'Stoffänderung gegenüber Zustandsänderung erfordert die vorhandene Zustands-/Eigenschaftskette 326d→fcc73→266a mit Arbeitsweise und Sicherheit. Wasserpolarität, Salzenergie und Brønsted-Neutralisation werden hier weder benutzt noch vorausgesetzt.',
 'bcf8b24b':'Das Erkennen einfacher Sauerstoffübertragungen baut auf 8d4 (chemischer Reaktion) auf. Elektronenbilanz und das gesamte Säure-Base-Programm sind spätere Erweiterungen, kein Vorwissen dieser ersten Unterscheidung.',
 'bb707fda':'Der engere Verbrennungscluster behält 8d4 ausdrücklich. Seine drei Kinder beginnen mit Luftzusammensetzung und führen über Verbrennung zum Löschen; die pauschale Voraussetzung sämtlicher Grundlagen ist dafür nicht universell.',
 '2dae4132':'Die Zusammensetzung der Luft und das Deuten des Sauerstoffanteils benutzen Stoff-/Reaktionsbeobachtung über 8d4. Gasuntersuchung ist Gegenstand dieser Lerngelegenheit; vollständige Säure-Base-Theorie ist keine Einstiegsvoraussetzung.',
 'fa203f3a':'Verbrennung als Reaktion mit Luftsauerstoff baut ausdrücklich auf 2dae auf. Die grundlegenden Beobachtungs- und Sicherheitsziele bleiben in dessen Kette erhalten.',
 '350a394f':'Löschmittel werden über den unterbrochenen Verbrennungsvorgang begründet; fa203 bleibt explizite Voraussetzung. Weder Ionengitter noch alle Stofftrennverfahren müssen dafür abgeschlossen sein.',
 '1286f2fe':'Energieabgabe/-aufnahme wird erstmals anhand bekannter chemischer Reaktionen aus 8d4 eingeführt. Es wäre didaktisch rückwärts, vorher Salzbildung mit Gitterenergie zu verlangen; 1286 wird stattdessen die konkrete Voraussetzung für deren Exothermieargument.',
 '1bdaf7f2':'Massenerhaltung braucht die Unterscheidung einer chemischen Reaktion aus 8d4; die Massenerhaltung ist selbst Einstieg in die folgende Massenverhältnis-/Dalton-Kette. Sie setzt diese nicht bereits voraus.',
 '542d88e9':'Energieprofile bauen auf der ausdrücklich vorhandenen Exo-/Endothermie aus 1286 auf. Das spätere Teilchen-/Bindungsmodell ist keine notwendige Voraussetzung zum ersten Deuten eines bereitgestellten Profils.',
 'a530ee7d':'Die qualitative Energiebilanz von Bindungsbruch und Bindungsbildung behält Dalton 9b5d sowie Exo-/Endothermie 1286. Das Erklären mit Bindungsänderungen ist das Ziel selbst; vollständiges Orbital-, Lewis- und Polaritätsprogramm wäre eine unnötige zusätzliche Einstiegshürde.',
 '871eabde':'Der engere Bewertungscluster behält Verbrennung fa203 und Exo-/Endothermie 1286. Seine Kinder bauen die gemeinsame Bezugsgröße, Kohlenstoffpfade und Kriterien schrittweise auf; der entfernte Obercluster hat diese spezifischen Kanten nicht ersetzt.',
 '4dab7d52':'Vergleich pro gemeinsamer Energiemenge braucht Verbrennung und Exothermie, die direkt verlangt bleiben. Gelieferte Daten begründen den Vergleich; eine Säure-Base-Lösungskette wird dabei nicht benutzt.',
 '0503c975':'Der fossile Kohlenstoffpfad setzt den CO2-/Energievergleich 4dab voraus. Die Unterscheidung kurzfristigen und langfristigen Kohlenstoffs ist hier Lerngegenstand, kein Grund für das gesamte Grundlageninventar als Voraussetzung.',
 '9198b4cf':'Die Bewertung von Brennstoffen behält sowohl Datenvergleich 4dab als auch Kohlenstoffpfade 0503. Kriterien und Gegenargumente werden im Ziel bearbeitet; nicht benötigte Elektrolyt- und Wasserstrukturaspekte bleiben im Inventar, werden aber nicht universelle Vorbedingungen.',
 '1f30d81c':'Die anspruchsvollere Redox-/Säure-Base-Abgrenzung behält spezifisch Oxidationszahlen 4961130b und Brønsted 1c1420c2. Damit werden die gerade hier nötigen höheren Konzepte weiter ausdrücklich erworben; die Migration senkt diesen Anspruch nicht.',
 '17fe22c4':'Die Bedeutung von Redoxreaktionen wird erst nach dem expliziten Redoxkonzept 04fa0ba1 erörtert. Dessen vollständige konkrete Voraussetzungskette bleibt erhalten; die gesamte Sammlung allgemeiner Grundlagen ist keine zusätzliche universelle Abhängigkeit.',
 '945d69d5':'Aktivierungsenergie und Katalyse behalten 1286, Energieprofile 542d und die bestehende Orientierung. Die dafür nötige Unterscheidung von Reaktionsenergie und Aktivierung bleibt sichtbar, ohne vorab vollständige Bindungsgeometrie zu fordern.',
 '8576b82b':'Brandbedingungen und Brandschutz bauen explizit auf Verbrennung fa203 und Exothermie 1286 auf. Die Sicherheits-/Arbeitsweisenkette bleibt über die Reaktionsgrundlagen erreichbar. Ein theoretisches Ergebnis ersetzt keine im ganzen Ziel verlangte praktische Beobachtung.',
 'e0d05c36':'Konstante Massenverhältnisse setzen direkt die Massenerhaltung 1bdaf voraus. Luftzusammensetzung, Katalyse, Brennstoffbewertung und die gesamte Redox-/Säure-Base-Abgrenzung werden nicht benötigt, um Massenverhältnisse zu untersuchen.',
 '9b5d6326':'Daltons Teilchenmodell erklärt die zuvor erworbenen konstanten Massenverhältnisse e0d05. Es begründet die spätere Symbol-/Atombaukette; sämtliche Energie- und Redoxanwendungen davor zu verlangen wäre eine Rückkopplung.',
 'e7c363d4':'Symbole und Formeln beruhen auf dem Modell 9b5d. Die Unterscheidung von Teilchenart und Anzahl wird hier erworben; eine bereits vollständig gemeisterte Reaktionsgleichungs- oder Bindungslehre ist dafür nicht nötig.',
 '11bea4c6':'Das Aufstellen einfacher Gleichungen behält Symbole/Formeln e7c363 und das Reaktionsverständnis 8d4. Die Erhaltung der Atome wird hier auf Gleichungen angewendet, ohne jede Verbrennungs-, Katalyse- oder Redoxanwendung vorweg zu verlangen.',
 '22133f29':'Erste Redoxgleichungen behalten einfache Gleichungen 11bea und einfache Oxidation/Reduktion bcf8. Die Verwendung von Oxidationszahlen ist Teil des ganzen Ziels und wird nicht durch das Entfernen einer überbreiten Clusterkante gestrichen.',
 '72236f2c':'Das Kern-Hülle-Modell erweitert ausdrücklich Dalton 9b5d. Die entsprechenden Modellgrenzen werden hier erarbeitet. Vollständige chemische Gleichungen und erste Redoxschemata sind keine Voraussetzung für die Einführung von Kern, Hülle und Elementarteilchen.',
 'f5efab9d':'Die Elektronenverteilung baut ausdrücklich auf dem Kern-Hülle-Modell 72236 auf. Modellnutzung auf Energiestufen ist hier Gegenstand des Erwerbs, ohne vorab sämtliche Symbolanwendungen zu verlangen.',
 'e9d74940':'Die Strukturdeutung im Periodensystem behält die Elektronenverteilung f5ef. Der Zusammenhang von Perioden/Gruppen und Elektronen wird hier aufgebaut; vollständige Redoxgleichungen sind dafür nicht nötig.',
 'a1632ea9':'Ionenbildung behält Periodensystem e9d74940 sowie die konkrete Ionen-Grundlage 4285. Über deren vorhandene Kette bleibt die tatsächlich benötigte Symbolsprache e7c363 erreichbar. Vollständige Reaktions-/Redoxgleichungen sind nicht erforderlich.',
 '950c73c6':'Ionengitter setzen ausdrücklich Ionenbildung a163 voraus. Gittermodell und Stoffeigenschaften werden hier verknüpft. Die notwendige Formel-/Ionenkette bleibt konkret erhalten.',
 'fcaf8c9b':'Das Metallmodell wird aus Stoffeigenschaften entwickelt. Dalton 9b5d und Leitfähigkeit 018bec90 bleiben direkt verlangt. Das fertige Metallmodell oder das komplette Symbol-/Redoxprogramm vorweg zu fordern würde den Modellbildungscharakter verfehlen.',
 '79db6d68':'Der Vergleich molekularer und ionogener Verbindungen behält ausdrücklich Formelsprache e7c363 und Ionengitter 950c. Der Vergleich verbindet vorhandene Modelle und braucht nicht das gesamte Reaktionsgleichungsprogramm.',
 '7964cb36':'Molekül- und Verhältnisformeln werden nach dem konkreten Vergleich 79db6 unterschieden. Dessen Formel-/Ionenketten bleiben erhalten; die entfernte Clusterkante lieferte darüber hinaus nicht universell nötige Reaktionsschemata.',
 '965ca297':'Salzformeln aus Ladungen behalten Ionenbildung a163 und Ionengitter 950c. Ladungsausgleich und Formelrepräsentation werden hier angewendet; alle Symbole sind über die konkrete Ionen-Kette weiterhin vorausgesetzt.',
 'c441d9e8':'Die ganze Beschreibung verlangt ausdrücklich den exothermen Verlauf und Gitterenergie als Triebkraft. f5ef, a163 und 950c tragen Energiezustände, Ionen und Gitter, aber keine allgemeine Exo-/Endothermieklassifikation. Daher wird 1286 als genau eine explizite atomare Voraussetzung ergänzt. Alle vorhandenen Voraussetzungen bleiben erhalten. Die vorliegenden NaCl-/MgO-Fälle setzen das Urteil exotherm bereits voraus und ersetzen diesen Erwerb nicht.',
 'e74f5301':'Orbital-/Valenzmodell behält Elektronenverteilung f5ef, Periodensystem e9d74940 und Ionenbildung a163. Diese konkrete Kette liefert auch Formelsprache; das vollständige erste Redoxgleichungsprogramm ist hier keine universelle Voraussetzung.',
 'bbe038e9':'Die Elektronenpaarbindung wird auf dem expliziten Orbital-/Valenzmodell e74f aufgebaut. Orbitalüberlappung ist Zielgegenstand und wird nicht als bereits abgeschlossenes verstecktes Vorwissen angenommen.',
 '23533087':'Lewis-/Valenzstrichformeln und Mesomerie behalten e74f und Elektronenpaarbindung bbe038. Die dazu nötige Symbol-/Teilchenvorstellung liegt auf diesen konkreten Ketten; sämtliche Redoxschemata sind nicht erforderlich.',
 '92c99237':'Das Umwandeln von Moleküldarstellungen behält Lewis-Darstellung 235330 und die konkrete Sprach-/Darstellungsgrundlage 95dc0. Deren Symbolkette bleibt erreichbar. Ein vollständiger Kurs chemischer Gleichungen ist kein universeller Vorgänger.',
 '747c5777':'Bindungs- und Molekülpolarität behalten Periodensystem e9d74940, kovalente Bindung bbe038, Bindungstypen 448815 und EPA 9b56. Damit sind gerade die verschiedenen notwendigen Modellkomponenten explizit; keine wird durch die Migration entfernt.',
 '67cd332f':'Molekülgeometrien behalten Elektronenpaarbindung bbe038 und Lewis-Darstellung 235330. Die räumliche Ableitung wird im EPA-Ziel erworben; weitere Reaktionsschemata sind keine Voraussetzung.',
 '1e519951':'Der bestehende Memorierknoten behält Kern-Hülle 72236, Periodensystem e9d74940 und EPA 67cd. Kartenbestand und M-Bindungen werden weder verändert noch neu genehmigt; dieser Knoten wird nicht als normaler curriculärer Inhalt umklassifiziert.'
}
groups=[]
for cid in clusterids:
 rows=[]
 for i in descend(cid):
  prefix=i[:8];assert prefix in reason,i
  rows.append({'goalId':i,'wholeGoalPointer':sel['baseCanonical']['path']+'#/goals/'+str(next(n for n,g in enumerate(base['goals']) if g['id']==i)),
   'title':G[i]['title'],'wholeOriginalRequires':G[i]['requires'],'wholeCandidateRequires':A[i]['requires'],
   'authorScientificRationaleDe':reason[prefix],
   'practicalOperatorPolicy':'Retain the whole operator; actual future observable execution where required. No pre-existing human/learner trial is a machine-M7 prerequisite.'})
 rationale={
 'a00d302b':'Die Grundlagen-Sammlung 3588 enthält auch Wasser-/Ionen-/Säure-Base-Ziele, die ihrerseits Reaktions-, Dalton- oder Bindungsmodelle brauchen. Sie ist kein universeller Vorgänger jeder ersten Reaktionsbeobachtung. Das bestehende 8d4→326d→fcc73→266a-Gerüst erhält Stoffeigenschaften, Arbeitsweise und Sicherheit. Anspruchsvollere Kinder behalten ihre jeweils spezifischen Voraussetzungen. Engere Verbrennungs- und Bewertungscluster bleiben vollständig unverändert.',
 'fb3bdf39':'Die fünf Kinder bilden bereits eine schlüssige atomare Folge: Massenerhaltung→Massenverhältnisse→Dalton→Symbole→Gleichungen; die Redoxschemata ergänzen einfache Oxidation/Reduktion. Die bisherige Voraussetzung des gesamten Reaktions-/Energieclusters fordert viele Anwendungen vor der für sie benötigten Symbol-/Teilchenbasis. Diese Universalität ist fachlich nicht begründet.',
 '1e803ef8':'Die Kinder unterscheiden elementare Modellbildung von fortgeschrittenen Formel-/Bindungsanwendungen. Alle behalten Dalton und konstante Massenverhältnisse auf ihren konkreten Ketten; die 13 Formel-/Ionen-/Bindungszweige behalten die tatsächlich benötigte Formelsprache. Kern-Hülle, Elektronenverteilung, Periodensystem und Entwicklung des Metallmodells benötigen nicht den Abschluss aller Reaktions-/Redoxgleichungen. Nur die ausdrücklich energetische Salzbildung verliert mit der Clusterkante eine fachlich notwendige allgemeine Exothermiegrundlage; dafür wird gezielt c441→1286 ergänzt.'}[cid[:8]]
 groups.append({'clusterId':cid,'wholeOriginalCluster':G[cid],'wholeCandidateCluster':A[cid],
  'allDirectChildrenRead':G[cid]['contains'],'allDescendantsRead':[r['goalId'] for r in rows],
  'authorScientificRationaleDe':rationale,'childrenAndDescendants':rows})
write('AUTHOR.per-cluster-and-every-child-scientific-rationale.json',{
 'schemaVersion':1,'license':'CC-BY-4.0','role':'Informed author reasoning; no independent scientific verdict',
 'decision':'Remove exactly three non-universal cluster requirements, preserve every original atomic edge, and add exactly one necessary c441→1286 energy-classification edge.',
 'wholeReadContext':bind(REL+'/source-context/whole-three-clusters-all-children-and-prerequisites.exact.json'),
 'groups':groups,'rationaleRows':sum(len(g['childrenAndDescendants']) for g in groups),
 'authorAssistance':'An informed author assistant read the whole 1e803ef8 branch and existing c441 materials. Its analysis is author assistance, not a D/P/A/M/V reviewer or vote.',
 'sourceDutyPolicy':'No new official source mappings, source labels, semantic kinds or curricular duties are asserted. Sequencing follows whole existing competencies, not the fact that an algorithm becomes acyclic.',
 'newVotes':0})

c441paths=[
 ('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2/fifty-complete-materials.de-en.author-candidates.json',['/materials/10','/materials/11'],'Whole existing NaCl and MgO author cases read by informed author assistant; not learner data.'),
 ('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2/twenty-five-positive-profile-specifications.author-candidates.json',['/goals/5'],'Whole existing c441 positive-profile specification.'),
 ('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-final18-native-paired-integration-preparation-technical-20261007-v1/native-d-c441/bundle/review-input.json',[],'Whole existing c441 native input, including its three external prerequisites; no fresh image QA.'),
 ('curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json',['goal:dff826a2-8cec-5842-a618-a95ed6f97670'],'Read source goal only, not a new full source audit.'),
 ('curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',['sourceSpan:C9-HG_SG_MUG_WWG_SWG.6.2','occurrence:C9-NTG.3.2'],'Source occurrence read; retained source semantics, no new mapping.')]
sourceRows=[]
for path,pointers,scope in c441paths:
 if not (ROOT/path).is_file():raise FileNotFoundError(path)
 sourceRows.append({'input':bind(path),'readPointers':pointers,'readScope':scope})
write('source-context/actual-read-inventory-and-energy-edge-source-context.json',{
 'role':'Actual bounded whole-goal reading and inherited source provenance; not an independent source review',
 'wholeCanonicalRead':sel['baseCanonical'],'allWholeClusterChildrenAndRawPrerequisites':bind(REL+'/source-context/whole-three-clusters-all-children-and-prerequisites.exact.json'),
 'wholeObjectsInBoundedContext':96,'wholeEffectiveRouteComparison':bind(REL+'/checks/CHECK.all554-actual-effective-requirements-before-after.json'),
 'wholeCandidateViewInputs':[r for r in own('CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json')['rows']],
 'energyEdgeEvidence':sourceRows,
 'energyExamples':{'NaClSuppliedModelKJPerMol':[108,122,496,-349,-787],'NaClTotal':-410,'MgOSuppliedModel':[3000,-3600],'MgOTotal':-600,
  'claim':'Own fictional author energy models, not observed lab data. The provided solutions use the exothermic classification; they do not introduce its general meaning as prerequisite acquisition.'},
 'officialHB36HB37BW42Policy':'The complete official page readings and lawful source-duty context are preserved in the sealed acquisition packet. This packet changes no source target text or mapping and does not claim a new complete official-source audit.',
 'sealedAcquisitionResume':bind('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-acquisition-routes-author-20261015-v1/NEUTRAL.final-acquisition-route-author-resume.json'),
 'rules':{'wholeBeforeAfter':True,'noSourceLabelForCuratedPrerequisites':True,'noFreshVotes':True}})

book=own('checks/CHECK.actual-stock-book315-context-fingerprint-radius.json');eff=own('checks/CHECK.all554-actual-effective-requirements-before-after.json');routes=own('checks/CHECK.stock-compiler-positive-scopes-and-prerequisites.actual.json')
assert book['changed315GoalIds']==[gid('1286f2fe'),gid('c441d9e8')]
assert routes['pass'] and eff['affectedGoalCount']==347 and len(eff['selfReachableBefore'])==50 and not eff['selfReachableAfter']
write('REVIEW.changed-context-radius-and-prior-vote-preservation.author.json',{
 'role':'Author handoff of real changed inputs; no review decision or gate rebind',
 'wholeSourceObjectsChanged':[r['goalId'] for r in own('CAS.four-whole-object-sequencing-deltas.author.json')['rows']],
 'wholeOtherObjectsExact':550,'semanticClassificationsChanged':0,'semanticSourceBindingsMechanicallyChanged':4,
 'historical315Binding':sel['current315Source'],'fullStockBookSurface':bind(REL+'/checks/CHECK.actual-stock-book315-context-fingerprint-radius.json'),
 'actualBookContext315Changed':2,'actualBookContext315Unchanged':313,'actualChanged315GoalIds':book['changed315GoalIds'],
 'changeExplanation':{'1286f2fe':'Unchanged whole goal and text fingerprint; new reverse-requires link to c441 changes its actual stock page and review context.',
  'c441d9e8':'Unchanged goal text fingerprint; new direct prerequisite changes its actual stock page and canonical review context. Its P assessment/acquisition context must also be evaluated, not silently rebound from unchanged task text.'},
 'globalActualEffectiveRequirementChanges':347,'directActualEffectiveRequirementChanges':43,
 'previousSelfReachableGoals':50,'candidateSelfReachableGoals':0,
 'sequencingReviewScope':'The whole three clusters, every child/atomic prerequisite, and the actual effective-route delta for347 goals require genuine scientific review of this migration. The2-page native D radius is not a claim that only2 learning routes changed.',
 'parentPlannedIndependentNativeTargets':[ *sel['sourceGoalIds'],gid('1286f2fe'),gid('c441d9e8')],
 'preservationPolicy':'Keep all historical reviews/votes and valid unchanged bindings. No blanket invalidation of313 unchanged native contexts. Do not approve or automatically restore any changed-context vote. Actual later native inputs and relevant D/P/A/M/V contracts decide their own precise re-review/binding needs.',
 'newD':0,'newP':0,'newA':0,'newM':0,'newV':0,'newStrictClosures':0,'restoredBindings':0,
 'M7':False,'noClaimOfCurrent313Or315CandidateStrictIntersection':True})

cas=own('CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json')
sel['wholeViewInputs']=[{'view':r['name'],'wholeBefore':r['before'],'wholeAfter':r['after'],
 'beforeTargets':next(x['beforeTargetAtomicCount'] for x in routes['reports'] if x['view']==r['name']),
 'afterTargets':next(x['afterTargetAtomicCount'] for x in routes['reports'] if x['view']==r['name'])} for r in cas['rows']]
sel['changedWholeGoalIds']=[r['goalId'] for r in own('CAS.four-whole-object-sequencing-deltas.author.json')['rows']]
sel['actualChanged315BookContextGoalIds']=book['changed315GoalIds']
sel['nativeReviewContextRadius']=bind(REL+'/checks/CHECK.actual-stock-book315-context-fingerprint-radius.json')
sel['globalEffectiveRouteDelta']=bind(REL+'/checks/CHECK.all554-actual-effective-requirements-before-after.json')
sel['authorRationale']=bind(REL+'/AUTHOR.per-cluster-and-every-child-scientific-rationale.json')
sel['actualReadInventory']=bind(REL+'/source-context/actual-read-inventory-and-energy-edge-source-context.json')
sel['M7']=False
write('INPUTS.physical-exact-selector.json',sel)
write('NEUTRAL.final-three-cluster-sequencing-author-resume.json',{
 'schemaVersion':1,'status':'finite inactive informed-author candidate; not independently approved',
 'selector':bind(REL+'/INPUTS.physical-exact-selector.json'),'wholeCanonical':sel['canonical'],'wholeSemanticCompanion':sel['semanticLedger'],
 'wholeLKViews':[x for x in sel['wholeViewInputs'] if x['view'].endswith('-lk')],
 'GKControls':[x for x in sel['wholeViewInputs'] if x['view'].endswith('-gk')],
 'dataDelta':{'clusterRequiresRemoved':3,'atomicPrerequisitesAdded':[{'goalId':gid('c441d9e8'),'requires':gid('1286f2fe')}],
  'allOriginalAtomicRequiresPreserved':True,'wholeObjectsChanged':4,'otherWholeObjectsExact':550,'textsContainsScopeResourcesChanged':0},
 'checks':{'wholeGoals':554,'curricularAtomic':422,'stockRuntimeSchemaAndRawDAG':True,
  'stockDirectAndContainsExpandedClosure':True,'stockActualEffectiveAcquisitionOfThreeCarriersAndAllNewTargets':True,
  'HB-LK':[185,189],'BW-LK':[166,174],'GKExact':[155,144],
  'actualGlobalEffectiveChanges':347,'directEffectiveChanges':43,'selfReachableBeforeAfter':[50,0]},
 'native315Radius':{'changed':2,'unchanged':313,'changedGoalIds':book['changed315GoalIds'],
  'limitation':'Actual unrendered full stock book fingerprints; later genuine native inputs must bind their own exact pages and contexts.'},
 'requiredNextReview':'Independent native and scientific review of three source carriers plus1286/c441, whole sequencing/acquisition rationale, and actual347-route effects. Author findings do not supply those votes.',
 'holdsPreserved':['All original source/course/full optional-inventory holds remain separate; no new approvals. A curated BW dye route is one additional selected group, not all examples as compulsory.',
  'No active canonical, registry, ledger, mappings, views, runtime, QA gate or learner state is changed.',
  'Source3 whole texts/11 cases, original15 whole laboratory goals/30 cases, and ten acquisition opportunities remain exact.',
  'Practical operators retain actual future observation, safety, controls and uncertainty; no completed paper exercise is claimed as physical performance. Actual prior learner/lab trials are not a machine-M7 prerequisite.',
  'No new source mapping or scope reduction; all original curricular and optional targets stay available.'],
 'newApprovals':0,'newStrictClosures':0,'restoredBindings':0,'activeIntegration':False,'M7':False,
 'sealPolicy':'Final serialization/input checks and normal curriculum_symlink_errors precede the separate finite file seal; no writes after seal.'})

resume='''# Drei Cluster: begrenzter Sequenzierungsentwurf

Status: **AUTOR**, inaktiv, keine unabhängige Freigabe und kein M7-Zuwachs.

## Konkrete Änderung

Drei pauschale Cluster-Voraussetzungen entfallen: a00d302b→3588c15e, fb3bdf39→a00d302b und 1e803ef8→fb3bdf39. Alle ursprünglichen atomaren Kanten bleiben erhalten. Salzbildung c441d9e8 erhält genau eine konkrete Voraussetzung zu Exo-/Endothermie1286f2fe, weil ihr ganzer unveränderter Text den exothermen Verlauf mit Gitterenergie erklärt. 550/554 ganze Objekte bleiben exakt gleich. Die semantischen Klassifikationen bleiben gleich; vier reale Quellfingerprints werden mechanisch nachgeführt.

Die vollständige Begründung steht in AUTHOR.per-cluster-and-every-child-scientific-rationale.json, mit40 Zeilen für sämtliche Kinder und Nachkommen der drei Cluster. Sie begründet die fachlichen Erwerbsfolgen anhand der ganzen Ziele. Die Beseitigung eines Zyklus ist kein fachlicher Freigabegrund.

## Tatsächliche Prüfungen

Unveränderte Produktionshelfer kompilieren die bereits versiegelten ganzen LK-Sichten: HB185→189 und BW166→174; GK bleibt155/144. Die drei Carrier sind schon in den gebundenen v3-Ausgangskandidaten enthalten. Alle neu ergänzten Target-Atome und alle drei Carrier haben nach tatsächlicher Stock-Projektion erreichbare Voraussetzungen ohne Selbstabhängigkeit oder fehlendes Target. Direkte/Contains-Schließung und effektive Projektion werden getrennt ausgewiesen. Die Originalsicht- und Kandidaten-Targetmengen stehen vollständig im Routenreceipt.

Global ändern sich347 effektive Lernweg-Kontexte, davon43 direkte effectiveRequires-Mengen;50 vormals selbst-erreichbare Ziele werden zu0. Dies ist eine bewusst überprüfbare globale Datenwirkung, keine Engineänderung. Direkter requires-DAG, contains-DAG, normales Laufzeitschema und Stock-Canonical-Prüfung bestehen.

Zwei tatsächlich erzeugte Stock-Buchmodelle mit je422 Seiten wurden nur im Speicher verglichen. Unter den gebundenen bisherigen315 sind313 Reviewkontexte exakt gleich. Nur1286f2fe-89b7-4454-8e11-85b6abd6e278 (neuer Rückverweis) undc441d9e8-d9d9-5e55-a189-a37345541321 (neue direkte Voraussetzung) ändern ihre Seiten-/Kontextfingerprints. Das ist die tatsächliche native D-Seitenradiusmessung, keine Verengung der wissenschaftlichen Sequenzierungsprüfung auf zwei Ziele. Keine neue PDF-/Host-Erzeugung und keine neue Bildfreigabe.

## Übergabe

INPUTS.physical-exact-selector.json bindet den ganzen554-Graphen, das ganze semantische Companion, beide ganzen LK-Sichten, GK-Kontrollen und beide konkreten Kontext-IDs. REVIEW.changed-context-radius-and-prior-vote-preservation.author.json trennt unveränderte historische Votes, geänderte Seiten sowie347 geänderte effektive Lernwege. Keine pauschale Neubewertung oder automatische Rebinds. c441 benötigt auch eine echte Prüfung seines geänderten Erwerbs-/P-Kontexts.

Alle Source-/Kurs-/Originalinventar-Holds bleiben getrennt erhalten. Source3-Texte/11 Fälle, Labor15/30 Fälle, zehn Erwerbsgelegenheiten und alle bestehenden Bilder bleiben unverändert. Praktische Operatoren verlangen künftig echte beobachtbare Ausführung; vergangene menschliche Versuche sind kein Maschinen-M7-Gate. Neu:0 D/P/A/M/V-Votes,0 Strict-Closures,0 Restores; M7=false. Eigenes Material CC-BY-4.0; technische Skripte Apache-2.0. Nach dem endlichen Dateisiegel keine weiteren Schreibzugriffe.
'''
(OUT/'RESUME.md').write_text(resume)
print(json.dumps({'rationaleRows':sum(len(g['childrenAndDescendants']) for g in groups),'wholeObjectsChanged':4,'otherObjectsExact':550,'wholeLKInputs':2,'actualChanged315GoalIds':book['changed315GoalIds'],'newVotes':0}))
