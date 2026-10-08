#!/usr/bin/env python3
"""Correct the initial unsealed source-role plan using actual native visibility findings."""
import pathlib,json,hashlib
from datetime import datetime,timezone
OWN=pathlib.Path(__file__).resolve().parent
ROOT=OWN.parents[6]
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def bind(p):return{'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(name,obj):
 p=OWN/name;assert not p.exists(),name;p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'four-ion-intentions-whole-source-author-v4.first.freeze.json').exists()
prior=read(OWN/'two-new-whole-carbonate-ammonium-DEEN-source-cases.author-v4.json')
common={k:v for k,v in prior['wholeCases'][0].items() if k in ['sourceGoalIds','canonicalWitnessCandidateGoalId','status','reviewAuthority','humanReviewStatus','evidenceLevel','maximumClaimScope','actualLearnerOrExperimentEvidence','referenceResponseNature','license']}
bromide={**common,'caseLocalKey':'bbbe-bromide-silver-controlled-salt-intention-author-v4','intentionSpecies':'Br−',
 'material':{'de':['Eigener schriftlicher Modellfall bei25°C, kein tatsächlich durchgeführter Versuch. Die farblose Reinsalzprobe S ist ausdrücklich entweder KBr oder KCl. Für getrennte Teilproben sind fachgerecht beaufsichtigte fiktive Befunde vorgegeben: geeignete verdünnte Salpetersäurevorbehandlung, anschließend Silberion-Reagenz; S bildet einen cremefarbenen/hellgelben Niederschlag. Reagenz-Leerprobe bleibt klar, KBr-Referenz reagiert gleich S, KCl-Referenz bildet unter denselben Bedingungen einen weißen Niederschlag.',
                  'Gegebenes Modell: Ag++Br− → AgBr↓ und Ag++Cl− → AgCl↓. Die Säurevorbehandlung begrenzt störende Carbonatfällung in der untersuchten Modellprobe. Reagenzverunreinigung, andere Silberionen-fällende Bestandteile und störende Eigenfarben sind für diese binäre Auswahl ausgeschlossen. Keine Angaben über Stoffmengen oder tatsächliche praktische Lernendenleistungen liegen vor.'],
             'en':['An original written model at25°C, not an actually performed experiment. The colorless pure-salt sample S is explicitly either KBr or KCl. Professionally supervised fictional observations are supplied for separate portions: appropriate dilute nitric-acid pretreatment followed by silver-ion reagent; S forms a cream/pale-yellow precipitate. The reagent blank stays clear, the KBr reference responds like S and the KCl reference forms a white precipitate under the same conditions.',
                  'The supplied model is Ag++Br− → AgBr↓ and Ag++Cl− → AgCl↓. Acid pretreatment limits interfering carbonate precipitation in the modeled sample. Reagent contamination, other silver-precipitating constituents and intrinsic color interference are excluded from this binary set. No substance amounts or actual learner practical performance are provided.']},
 'learnerTask':{'de':'Wähle aus dem Material die passende getrennte Nachweis-/Kontrollfolge, bestimme S innerhalb der Auswahl und erkläre den Niederschlag mit einer ladungsbilanzierten Ionengleichung. Trennt der Befund eine Bromidion-Aussage von einer Kalium- oder Mengen-Aussage? Eine andere Person ersetzt HNO3 in einer frischen Cl−-freien Probe durch HCl: Warum kann dann weißer Niederschlag kein sicherer Nachweis ursprünglich vorhandenen Chlorids sein?',
                'en':'Select the relevant separate detection/control sequence, identify S within the supplied set and explain its precipitate using a charge-balanced ionic equation. Distinguish bromide evidence from potassium or amount claims. Another person substitutes HCl for HNO3 in a fresh initially Cl−-free sample: why does a subsequent white precipitate fail to prove initially present chloride?'},
 'modelAnswer':{'de':'Im ausdrücklich eingeschränkten Modell ist S KBr. Der zugeordnete Niederschlag ist AgBr: Ag++Br− → AgBr↓ erhält Atome und ergibt auf beiden Seiten Gesamtladung0. Gleiche Referenzbedingungen, passende Vorbehandlung sowie Leer-/Positivkontrollen stützen die qualitative Bromidzuordnung. Die K+-Zuordnung folgt nur aus der Kandidatenauswahl; Silberionen liefern keinen Kalium-Nachweis und die Farbe liefert keine Stoffmenge. In der frischen Probe bringt HCl selbst Cl− ein, das AgCl bilden kann. Ein weißer Niederschlag belegt dort nicht ohne geeignete Reagenz-/Vorherkontrolle ursprünglich vorhandenes Chlorid. HNO3-Vorbehandlung wird daher im gegebenen Modell nicht durch die chloridhaltige Säure ersetzt. Außerhalb der vorgegebenen Kandidaten-/Störungsgrenzen wäre eine Niederschlagsfarbe allein keine eindeutige komplette Ionen- oder Salzidentifikation.',
                'en':'In the explicitly restricted model S is KBr. Its assigned precipitate is AgBr: Ag++Br− → AgBr↓ conserves atoms and gives total charge0 on both sides. Matched reference conditions, suitable pretreatment and blank/positive controls support qualitative bromide assignment. K+ follows only from the candidate set; silver ions do not test potassium, and color supplies no amount. In the fresh case HCl itself adds Cl− capable of forming AgCl. A white precipitate does not establish initially present chloride without suitable reagent/before controls. Nitric-acid pretreatment is therefore not replaced with chloride-containing acid in this supplied model. Outside its candidate/interference bounds, precipitate color alone is no unique complete ion or salt identification.'},
 'transfer':{'de':{'task':'Eine frische Probe ist jetzt ausdrücklich ein unbekanntes Gemisch, und nach demselben Test ist der Niederschlag cremeweiß. Sind „nur Br− vorhanden“, „reines KBr“ oder ein Bromid-Massenanteil dadurch belegt?',
                    'expected':'Keine dieser Behauptungen folgt allein aus der Mischfarbe. Der ursprüngliche binäre Reinstoffschluss darf nicht auf das Gemisch übertragen werden. Geeignete weitere selektive Differenzierung und Kontrollen können qualitative Teilbehauptungen prüfen; Gegenionen, Reinheit und Anteile brauchen jeweils eigene passende Evidenz. Eine neue Zusatzaufgabenquote folgt daraus nicht.'},
             'en':{'task':'A fresh sample is now explicitly an unknown mixture and its precipitate is cream-white. Does that establish “only Br− present”, “pure KBr” or a bromide mass fraction?',
                   'expected':'None follows from mixed color alone. The original binary pure-substance inference cannot be transferred to the mixture. Appropriate additional selective discrimination and controls can test qualitative component claims; counterions, purity and amounts need their own suitable evidence. This creates no extra task quota.'}},
 'positiveUnderstandingEdge':{'de':'Bromid wird in der tatsächlich vorgesehenen Salz-Nachweisabsicht anhand eigener Kontrollen und Teilchenreaktion erklärt; die Quelle wird nicht auf den nicht sichtbaren Substitutionszweig umgebogen.','en':'Bromide is explained within the actual salt-detection intention using its own controls and ionic reaction; the source is not rerouted through the unselected substitution branch.'},
 'materialAndSourceLimits':['Actual source45 names Br− among the original Q intentions. New host a44 is already a current target in BB/BE GK/LK; its whole original body/profile is not rewritten.','Existing strict413 full P is retained as supplementary chemical test/control knowledge. Actual scope checks show it is not selected in some current BB/BE views, so it is excluded from the operative source union.','Own synthetic source case, pending two genuinely independent targeted reviews; no laboratory execution, human approval, full source closure or new M7 goal approval.']}
write('one-new-whole-bromide-DEEN-current-a44-source-case.author-v4.json',{'role':'Third specific source witness after actual current-scope check; old accepted413 is not assigned invisible operative scope','wholeCaseCount':1,'wholeCase':bromide,'independentApprovals':0,'activeWrites':0,'humanApproval':False})
allcases=[bromide,*prior['wholeCases']]
write('three-operative-new-whole-DEEN-ion-source-cases.manifest.author-v4.json',{'role':'Operative new source-case set: all three whole materials/tasks/models/transfers, current a44 host, independent reviews pending','wholeCaseCount':3,'languageBodies':6,'wholeCases':allcases,
 'exactCaseFileBindings':[bind(OWN/'one-new-whole-bromide-DEEN-current-a44-source-case.author-v4.json'),bind(OWN/'two-new-whole-carbonate-ammonium-DEEN-source-cases.author-v4.json')],'currentWholeGoalBodiesChanged':0,'oldWholeProfilesChanged':0,'independentApprovals':0,'humanApproval':False,'activeWrites':0})
originalmap=read(OWN/'four-original-ion-intentions-to-exact-whole-goal-case-witness-map.author-v4.json')
fixed=[]
for row in originalmap['rows']:
 c=dict(row)
 if c['originalIntentSpecies']=='Br−':
  a=next(x for x in originalmap['rows']if x['originalIntentSpecies']=='Cl−')
  for key in ['currentCanonicalWitnessGoalId','wholeCurrentGoalDigest','retainedCurrentPBinding']:c[key]=a[key]
  c.update(exactWitnessCaseIds=[bromide['caseLocalKey']],newSourceSpecificCasePending=True,boundedRoleRationale='New whole bromide source case hosted under visible current a44; strict413 chemical knowledge retained only as supplementary, because current actual BB/BE scope does not universally select413.')
 fixed.append(c)
write('four-original-ion-intentions-operative-current-scope-witness-map.author-v4.json',{'role':'Operative map correcting the initial unsealed413 visibility assumption; no source approval','rows':fixed,
 'supersededInitialAuthorMapBinding':bind(OWN/'four-original-ion-intentions-to-exact-whole-goal-case-witness-map.author-v4.json'),
 'retainedWholeChlorideCases':2,'newWholeSourceCases':3,'oldValid413ScienceReviewedAgain':False,'independentApprovals':0,'sourceClosureApproved':False})
plan=read(OWN/'two-source-row-operative-union-plan.pending-two-real-reviews.author-v4.json')
union=['1c1420c2-a8e2-520f-8015-6df637a973bd','fd309753-4d48-5570-a4ec-09dfeb20ff9c','a44af1fa-5988-5b7d-b206-691c6bbf7dd4']
rows=[]
for old in plan['rows']:
 r=dict(old);r['candidateAfter']=union
 r['candidateNewEdges']=[{'legacyGoalId':r['sourceGoalId'],'canonicalGoalId':g,'matchType':'partial','reviewDecisionId':r['sourceGoalId']}for g in union]
 r['candidateRationale']='The current visible1c/fd/a44 union hosts proton-reaction reasoning, water-ion predominance and actual selected-ion detection. The prior unchanged water-ion source cases and retained chloride cases plus the three new a44 source witnesses cover the six named intentions as pending author evidence. d2 and413 remain valid science/prerequisite knowledge but are not assigned an invisible current target/source role. No new goal, view placement, organic-family/protein/Gas-O2-H2/MWG duty or extra-task quota is introduced.'
 rows.append(r)
write('two-source-row-operative-current-scope-union-plan.pending-two-real-reviews.author-v4.json',{
 **{k:v for k,v in plan.items()if k!='rows'},'rows':rows,
 'supersededInitialFiveMemberUnionBinding':bind(OWN/'two-source-row-operative-union-plan.pending-two-real-reviews.author-v4.json'),
 'concreteAuthorCorrection':'Actual native current view revealed absent d2/413 selection; author adds specific Br source case to current visible a44 and uses only1c/fd/a44 operative union. Original accepted profiles and current views are retained, not loosened or edited.',
 'newCandidateViewFiles':0,'currentApplicabilityChanges':0,'currentRequiresChanges':0,'newSourceCasesPending':3,
 'twoNewIndependentReviewersRequired':True,'authorNotEligibleAsIndependentB':True,'originalBScienceFirstSealUnchanged':True})
print(json.dumps({'actualAuthorScopeCorrection':True,'operativeNewWholeCases':3,'operativeUnion':union,'newViewOrCanonicalChanges':0,'independentApprovals':0}))
