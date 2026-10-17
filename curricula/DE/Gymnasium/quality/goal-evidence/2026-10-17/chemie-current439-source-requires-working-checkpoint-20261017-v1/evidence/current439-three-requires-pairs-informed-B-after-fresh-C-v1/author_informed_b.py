"""Additive informed B reconsideration of three pairs. Never edit old FIRSTs."""
import datetime,hashlib,json,pathlib

OUT=pathlib.Path(__file__).parent
NEUTRAL=OUT.parent/'current439-three-requires-necessity-dissent-neutral-preparation-root-v1'
SEL=NEUTRAL/'SELECTOR.clean-three-physical-requires-pairs.current-whole-inputs.sealed.json'
C=OUT.parent/'current439-three-requires-pairs-fresh-independent-c-v1/FIRST.independent-scientific-review.json'
OLD=OUT.parent/'current439-source-surrogate-necessity-independent-b-v1'
OLDS=OLD/'SELECTOR.independent-b-FIRST.sealed.json'
EQ=pathlib.Path('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json')
SH=pathlib.Path('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-one-coherent-selected-theme-process-chain-author-successor-20261016-v1/materials/TWO.complete-nonisomorphic-DE-EN-cases-and-fresh-transfers.AUTHOR.inactive.json')
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def pin(p):
 p=pathlib.Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def jd(x):return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def write(name,x):
 with (OUT/name).open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')

assert sha(SEL)=='bc7b14e4de53c8d5970a258c4c48e3d665c0f111920bed7577a2e5b6d1a07272'
assert sha(C)=='a9ea825801db77855eb8b324f4e3ae46572f90c1167ed64390d8d6a7d41d6fe4'
assert sha(OLDS)=='c1b77916306142add0ba0ba2948572361c2672250de67a016342a5e361e4f7cf'
s=json.loads(SEL.read_text());oldSelector=json.loads(OLDS.read_text())
sciencePins=[s['currentPairInput'],*s['completeScientificPartners'],s['currentWholeCanonical']]
for p in sciencePins:assert sha(p['path'])==p['sha256'],p
for p in oldSelector['portableOwnReviewArtifacts']:assert sha(p['path'])==p['sha256'],p
assert sha(EQ)=='86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e'
assert sha(SH)=='06b1933b21eb36c0ec4e5ae584dbd6032caf63238acbd11c702c096db3981f2f'
guardPins=[pin(SEL),*sciencePins,pin(C),pin(EQ),pin(SH),pin(OLDS),*oldSelector['portableOwnReviewArtifacts']]
guardPins=list({p['path']:p for p in guardPins}.values())
write('INPUT-AND-OLD-FIRST-GUARDS.before.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'pins':guardPins,'allMatch':True,'meaning':'Before own informed additive output creation; old B FIRSTs and selector are read-only inputs.'})

pairs=json.loads(pathlib.Path(s['currentPairInput']['path']).read_text())['pairs']
profiles={p['goalId']:p['profile'] for p in json.loads(pathlib.Path(s['completeScientificPartners'][0]['path']).read_text())['profiles']}
oldPhysical=json.loads((OLD/'FIRST-PHYSICAL-EDGE-DECISIONS.frozen.json').read_text())['groups']
oldByEdge={(p['prerequisiteGoalId'],p['directDependentGoalId']):p for p in oldPhysical}

verdicts=[
 {'verdict':'reject','priorBPhysicalVerdict':'approve','changeFromPriorB':'reconsidered',
  'conclusionDe':'Die volle methodenspezifische Vorleistung 22133f29 ist keine notwendige allgemeine Zugangsschranke für das vollständige aktuelle Korrosionsziel. Korrekte Redoxteilgleichungen und Atom-/Ladungserhaltung bleiben unverzichtbar.',
  'evaluationOfCArgumentDe':'Der Gegenbeweis überzeugt nach Prüfung beider vollständigen Korrosionsmaterialien einschließlich saurem und Fremdstrom-Transfer. Mein erster Befund hatte die Notwendigkeit redoxchemischer Bilanzierung richtig erkannt, daraus aber zu viel für die ausdrücklich oxidationszahlbezogene Gesamtkompetenz geschlossen. Die fehlende Notwendigkeit betrifft die Methode, nicht bloß die andere Stoffauswahl.',
  'completeCounterexampleDe':[
   'Eine lernende Person versteht den galvanischen Elektronen- und Ionenstromkreis und kennt die chemisch zulässigen Partner des neutralen bzw. sauren Korrosionsmodells. Sie kann Zn → Zn2+ + 2e− und Fe → Fe2+ + 2e− unmittelbar aus Atom- und Gesamtladungsbilanz herleiten. Für O2/H2O/OH− werden zuerst O und H ausgeglichen: O2 + 2H2O → 4OH−; die Ladungsdifferenz verlangt anschließend vier Elektronen links. Dafür ist keine formale Oxidationszahlzuweisung an Atome mehratomiger Ionen erforderlich.',
   'Im neutralen Fall erklärt sie die Zinkoxidation, den metallischen Elektronenweg und die Sauerstoffreduktion am geschützten Stahl. Beim verkratzten Zinn ist Eisen die lokale Anode. Sie unterscheidet Barriere- und Opferwirkung und begründet den möglichen Angriff einer kleinen Anodenfläche bei großer Kathodenfläche, ohne aus Standardpotenzialen eine Rate zu erfinden.',
   'Im sauerstoffarmen sauren Transfer gleicht sie 2H+ + 2e− → H2 direkt nach H-Atomen und Ladung aus und prüft die bisherige Sauerstoffbegründung neu. In Fall B erkennt sie den fehlenden Metallkontakt, die getrennten Reaktionsorte des Belüftungselements, die Rolle des Elektrolyten und einen überprüfbaren Wartungsplan mit Kontakt-, Massen- und Potenzialkontrollen.',
   'Bei Fremdstrom begründet sie die negative Polung des zu schützenden Stahls und den Wegfall des Zinkverbrauchs als Wartungsgröße. Damit werden e1, e2, e3 und beide frischen Transfers vollständig und selbstständig erfüllt. Dennoch kann die Person die formale Oxidationszahlmethodik für mehratomige Systeme, etwa die im Vorziel verlangte MnO4−-Bilanzierung aus Oxidationszahlen, noch nicht beherrschen.'
  ],
  'sharedCoreNotRemovedDe':'Anodische/kathodische Teilreaktionen, milieuabhängige Partner, Elektronenausgleich sowie Atom-/Ladungsprüfung sind weiterhin erforderlich. Die Gegenroute ist selbstständige Herleitung und Erklärung; bloßes Abschreiben einer Musterlösung wäre kein Gegenbeispiel.',
  'noChangedDependentDemands':True,
  'operativeCasesRead':['chem-next20-22133f29-case-1','chem-next20-22133f29-case-2','eqrk16-03-a','eqrk16-03-b']},
 {'verdict':'approve','priorBPhysicalVerdict':'approve','changeFromPriorB':'sustained',
  'conclusionDe':'Die kanonische Kompetenz zur fachlichen Erschließung vorgegebener ODER selbst recherchierter Informationen ist für den vollständigen aktuellen SH-Prozesskettenauftrag notwendig. Eine allgemeine Pflicht zur eigenen Recherche wird damit nicht behauptet.',
  'evaluationOfCArgumentDe':'Der konkrete C-Befund bestätigt die schon zuvor befürwortete Kante. Er trifft den gemeinsamen Tätigkeitskern und hält die bedingte BY-C9-NTG-Erweiterung von der SH-Materialroute getrennt. Entscheidend ist nicht die Übereinstimmung der Urteile, sondern dass beide vollständigen SH-Fälle ohne Informationsauswahl, fachliche Ordnung und situationsgerechte begrenzte Mitteilung nicht erfüllt werden können.',
  'completeNecessityReasonDe':[
   'In A muss die Person A1 als zellfreien Modellbefund, A2 als beschriebenen Laborprozess, A3 als getrennten abgeschlossenen Chargenbefund plus ungeprüften Übertragungsplan und A4 als Absatz-/Werbeaussage unterscheiden. Sie muss für jede Frage die relevante Information auswählen und den verbundenen Weg begründen. Eine Stationsliste oder das isolierte Ausrechnen von 75%, 100 Packungen und 120 Euro erfüllt die vier Erwartungen nicht.',
   'In B müssen dieselben 100-mmol-Bezüge erhalten, Formulierung und Hydrolyse unterschieden, unmittelbare 99/1-, 92/8- und 98/2-Zusammensetzungen von Haltbarkeit getrennt und die nichtrepräsentative 80/120-Designpräferenz von Nachfrage, Produktqualität und Wirkung abgegrenzt werden. Die begrenzte interne Produktinformation ist eine konkrete adressaten- und situationsgerechte Auswertung für das Vorhaben.',
   'Neue Verunreinigung und späterer 94/6-Lagerbefund verändern relevante Prozess-/Produktentscheidungen, ohne aus früheren Befunden nachträglich andere Aussagen zu machen. Dies verlangt selbstständige strukturierte Quelleninterpretation einschließlich ihrer Herkunft und Grenzen. Der Bezug auf A1/A3/B2/B3 macht die verwendeten Materialquellen sichtbar; eine zusätzliche Bibliografie oder externe Recherche ist hierfür nicht erforderlich.'
  ],
  'counterexampleAssessmentDe':'Keine externe Suche auszuführen ist kein Gegenbeispiel, weil der kanonische Wortlaut eine vorgegebene Materialroute ausdrücklich erlaubt. Die zusätzlichen eigenen Such-/Lese-/Zitierhandlungen sind nur im tatsächlich recherchepflichtigen BY-C9-NTG-Kontext erforderlich. Unterschiedliche Reinigungs-/Verpackungsthemen und konkrete Zielgruppen sind Transferkontexte, keine gesonderten pharmazeutischen Tatsachenvoraussetzungen.',
  'scopeBoundaryDe':'Nur kanonischer gegebener-Quellen-Weg. Keine Übertragung der BY-UND-Recherchepflicht, keine neue Quellenvalidierung, keine Vermarktungs- oder Durchführungsevidenz. Die offizielle Optionalität des SH-Medikamententhemas bleibt bestehen.',
  'operativeCasesRead':['sek1-source-information-cleaning-advice','sek1-source-information-packaging-table','sh032-salicylate-scale-market','sh032-salicylate-stability-feedback']},
 {'verdict':'approve','priorBPhysicalVerdict':'reject','changeFromPriorB':'reconsidered',
  'conclusionDe':'Das Verständnis konstanter Zusammensetzung einer bestimmten reinen Verbindung ist echte Vorleistung für die vollständige aktuelle Atommasse-/Formelermittlung. Oxid-, Sulfid- und Überschussfälle operationalisieren diesen übertragbaren Kern; sie sind keine zusätzliche notwendige Tatsachenliste.',
  'evaluationOfCArgumentDe':'Der Einwand überzeugt. Mein erster Befund hatte den CuO-/FeS- und Überschusskontext zu stark als zusätzliche eigenständige Kompetenz gelesen. Der einzige inhaltliche Erwartungskern des vollständigen Vorprofils ist jedoch mengenunabhängige reine Produktzusammensetzung und ihre Trennung von vorgelegter Eduktmasse. Für den Transfer aus den gegebenen FeS-Zahlen ist keine weitere Sulfidchemie oder Versuchsausführung erforderlich.',
  'completeNecessityReasonDe':[
   'Die Wasseraufgabe verknüpft ein bestimmtes reines Produkt mit dem Elementmassenverhältnis 2:16 und dem Atomverhältnis 2:1. Das Verhältnis ist Zusammensetzung desselben Produkts und nicht zufällige Größe des Ansatzes; bei Ar(H)=1 folgt daraus Ar(O)=16. Eine bloße Gesamtmassensumme ersetzt diesen Zusammensetzungsschluss nicht.',
   'In den binären Gasfällen liefern 12:16 und 12:32 nach Division durch Ar(C) und Ar(O) die Atomverhältnisse 1:1 und 1:2. Die unterschiedlichen Verhältnisse kennzeichnen verschiedene Zusammensetzungen, nicht einfach eine größere Menge desselben reinen Produkts. Die zusätzlichen molaren Massen 28 und 44 wählen daraus CO bzw. CO2. Diese Erklärung setzt voraus, dass das ermittelte Elementverhältnis die definierte Verbindung charakterisiert.',
   'Genau die Trennung von reiner Produktzusammensetzung, Mengenänderung und etwaigem überschüssigem Ausgangsstoff leistet das Vorziel. Die CuO-Verdopplung und die 7-g-Fe-Restmasse sind variierende Evidenz für denselben Kern. Es muss im abhängigen Material kein identischer Metall-/Sulfidversuch oder eigener Überschussfall wiederkehren, damit diese Einsicht fachlich gebraucht wird.',
   'Die zusätzliche reine Sauerstoffgasprobe wird aus ρE/ρHe=8, M(He)=4 und Ar(O)=16 zu O2 erschlossen und benötigt für sich allein kein binäres Massenverhältnis. Sie ersetzt aber nicht die verpflichtenden Wasser-/CO-/CO2-Anforderungen des Gesamtprofils. Nur diese Elementgasaufgabe zu lösen wäre deshalb kein vollständiges Gegenbeispiel.'
  ],
  'counterexampleAssessmentDe':'Reines Ausführen eines m/Ar-Rezeptes ohne Verständnis dessen, was die gegebenen Elementmassen für ein bestimmtes reines Produkt bedeuten, erfüllt den verlangten erklärenden Zusammensetzungs-/Formelschluss nicht. Umgekehrt wird aus der Zustimmung nicht behauptet, konstante Proportionen allein lieferten Molekülgröße, gleiche T/p oder das ideale Gasmodell; diese bleiben zusätzliche Anforderungen.',
  'scopeBoundaryDe':'Keine besondere Beherrschung von Kupferoxid-, Eisensulfid- oder Versuchskontextwissen als zusätzlicher Zugangsschranke; maßgeblich ist die übertragbare vollständig erklärte Produktverhältnis-Kompetenz des aktuellen Vorprofils.',
  'operativeCasesRead':['copper-oxide-ratio','fresh-iron-sulfide-excess','chem-next25-e675fa94-case-1','chem-next25-e675fa94-case-2']}
]

for p,v in zip(pairs,verdicts):
 a=p['prerequisiteGoalId'];b=p['directDependentGoalId'];old=oldByEdge[(a,b)]
 assert old['physicalNecessityDecision']==v['priorBPhysicalVerdict']
 v.update(prerequisiteGoalId=a,directDependentGoalId=b,reviewGroupId=old['reviewGroupId'],
          originalZeroBasedGroupIndex=old['groupIndex'],originalOneBasedGroupNumber=old['groupIndex']+1,
          priorBExactPhysicalRecord=old,
          fullCurrentInputBindings=[{'goalId':g['id'],'wholeGoalSHA256':jd(g),'wholeCurrentProfileSHA256':jd(profiles[g['id']])} for g in [p['wholePrerequisite'],p['wholeDependent']]],
          missingOperativeEvidence=[],changesAnyOriginalSourceCourseVerdict=False)

record={'schemaVersion':1,'role':'INFORMED B reconsideration after sealed fresh C, additive finite three-pair record',
 'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'reviewer':'/root/chemie_source_surrogate_necessity_independent_b_20261017',
 'exposure':{'informedByC':True,'CScientificFIRST':pin(C),'originalOwnBPhysicalFIRSTRead':True,
             'AOutputsRead':False,'otherReviewerOrCorrectorOutputsReadBeyondAuthorizedC':False,
             'freshBlindIndependentReviewClaimed':False,'nativeBlindDManifestClaimed':False},
 'cleanCurrentInputSelector':pin(SEL),'completeCurrentScientificInputPins':sciencePins,
 'additionalWholeOperativeMaterialPins':[pin(EQ),pin(SH)],
 'judgmentRule':'Actual complete competency and dependent demands; accept an argument or sustain a complete counterexample, not a majority vote. Transferable core is distinguished from incidental examples and explicit method requirements.',
 'decisions':verdicts,'summary':{'approve':2,'reject':1,'hold':0,'priorBPhysicalJudgmentsReconsidered':2,'priorBPhysicalJudgmentsSustained':1},
 'originalBSealedSelector':pin(OLDS),'allOriginal83PhysicalAnd315SourceFIRSTsRemainUnmodified':True,
 'original315SourceCourseJudgmentsAutomaticallyChanged':False,'registryWrites':0,'sourceWrites':0,
 'canonicalOrDAGWrites':0,'gateChanges':0,'MainWrites':0,'KWrites':0,'fullBuildsOrStatusRuns':0,
 'sourceABApprovalClaimed':False,'nativeDManifestCreated':False,'M7Claimed':False,'humanApprovalClaimed':False}
write('FIRST.additive-informed-B-after-C.scientific-judgments.json',record)
dest=OUT/'FIRST.additive-informed-B-after-C.scientific-judgments.json';dest.chmod(0o444)
print('SCIENTIFIC_FIRST',sha(dest))

checks=[]
for p in guardPins:checks.append(dict(p,actualAfterSHA256=sha(p['path']),match=sha(p['path'])==p['sha256']))
assert all(p['match'] for p in checks)
write('INPUT-AND-OLD-FIRST-GUARDS.after.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'pins':checks,'allMatch':True,'guardCount':len(checks),'old83PhysicalAnd315SourceFirstsUnchanged':True,
 'onlyOwnNewDirectoryWritten':True,'noNewScientificAcceptanceOrGraphMutation':True})
final={'schemaVersion':1,'role':record['role'],'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'readFirst':pin(OUT/'REVIEW.informed-B-after-C.md'),'scientificFirst':pin(dest),
 'ownOutputPins':[pin(OUT/n) for n in ['FIRST.additive-informed-B-after-C.scientific-judgments.json',
     'INPUT-AND-OLD-FIRST-GUARDS.before.json','INPUT-AND-OLD-FIRST-GUARDS.after.json','REVIEW.informed-B-after-C.md','author_informed_b.py']],
 'inputAndPriorFirstGuards':guardPins,'summary':record['summary'],
 'informedNotBlind':True,'onlyThreeExactPairs':True,'originalBFirstsUnchanged':True,
 'noAutomatic315SourceCourseVerdictChange':True,'sourceRegistryDAGApprovalOrM7Claimed':False}
write('SELECTOR.informed-B-after-C.sealed.json',final)
print('SELECTOR',sha(OUT/'SELECTOR.informed-B-after-C.sealed.json'),'GUARDS',len(checks))
