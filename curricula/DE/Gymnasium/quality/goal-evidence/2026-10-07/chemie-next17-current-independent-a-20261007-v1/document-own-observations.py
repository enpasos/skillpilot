#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Serialize observations from this reviewer's actual page/source inspections."""
from pathlib import Path
import json,hashlib
B=Path(__file__).resolve().parent
def load(p):return json.loads(p.read_text())
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,o):p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
inp=load(B/'inputs/native-d-seventeen/round-a/description-review-input.json')
guide=load(B/'inputs/seventeen-bounded-primary-source-components-and-two-split-source-routing.author.json')
image_notes=[
 'The three named tests show relighting, limewater turbidity and a small controlled pop. The page is complete and identifiers/description/prerequisite links are visible. This schematic is orientation and not experimental learner evidence.',
 'The illustrated 20.0 g mixture and 12.0 g salt give the displayed 60% correctly. Dissolving, filtering and evaporation form a coherent selective-separation example; the independent written cases use different masses and include a nonselective loss counterexample.',
 'Actual decisive defect: the card says lemon juice pH2 while its red arrow meets the scale at pH3. This visible mismatch is not rescued by the correct description. The current canonical primary link is empty; this page is historical.',
 'The four displayed monovalent ions balance total positive/negative charge in each vessel. The illustration omits solvent and minority acid/base ions; this must remain a simplified major-species model. It cannot justify the misleading inference that mere presence distinguishes acidity/basicity.',
 'Water-cycle and carbon-cycle panels distinguish phases from chemical transformations in an accessible schematic. The page remains an illustrative overview. Canonical SekII and BY12 competence conflict with the printed process-chapter SekI label.',
 'The water representation moves from everyday name to bulk properties, water molecules and H2O. The visible molecules each retain two H per O. It exemplifies one representation change, not the entire taught symbol-language competence.',
 'NaCl/Cu/water panels associate lattice/electron/molecular structures with relative properties. These are representative models, not universal substance-identification rules. The printed SekI chapter conflicts with canonical SekII and the bounded BY12 source.',
 'Two A and two B atoms remain two of each after formation of two AB units. The page distinguishes law, hypothesis and model explicitly. Equal-atom imagery is historical Dalton modeling, not a denial of isotopes.',
 'Zn 0→+II loses two electrons and Cu +II→0 accepts two; the displayed half and overall equations balance. The page demonstrates a simple aqueous redox pattern, while the fresh written case adds H/O balance in an explicitly acidic medium.',
 'The Zn/H+ redox and H+/OH− proton-transfer panels conserve atoms and charge. The proton/electron distinction is operational; H+ is the simplified aqueous proton notation, not a claim of free bare protons in water.',
 'HCl/H2O and Mg/Cu2+ equations balance and their donor/acceptor units differ. The generic equilibrium diagram illustrates forward/reverse routes without establishing a specific mechanism or ease of reversal. The SekI breadcrumb conflicts with canonical SekII/BY12.',
 'Actual decisive risk: aqueous Na+ and K+ tubes are painted and labeled yellow/violet corresponding to flame colors, inviting a false intrinsic solution-color reading. The salt-pairing panel also lacks the pure/binary bounds required to reconstruct salts from ions in mixtures. The current image link is withdrawn.',
 'Lewis-style HCl, NH3 and H2O models mark the acid donation site, base lone pair and both water functions; NH4+ and Cl− charges are appropriate. The source supports structural suitability as the first clause of a broader suitability/reversibility source unit, with direct child routing still absent.',
 'Actual decisive defect: the lower OH−-addition pathway is labeled more products A− and BH+, but OH− also deprotonates BH+ to B and water. An increase of both original products is not the stated universal consequence. The historical image is still in this PDF; the current link is withdrawn.',
 'H3O+ + OH− → 2 H2O is balanced. The strong-acid/base example retains Na+/Cl− spectators and explicitly warns that neutralization does not remove dissolved salts or pollutants. No practical disposal/medication approval follows.',
 'The four functional groups and ethanol/formaldehyde/acetone/acetic-acid structures are consistent. The classification orientation does not establish that all oxygenated molecules occupy exactly one of these four families; the fresh case specifically challenges that inference.',
 'The displayed butan-2-ol, propanal, propanone and propanoic-acid structures match their German names. The page is complete with stable ID and predecessor link. The independent fresh case adds branching and principal-group numbering.',
]
source_notes={
 '580b3616':'BY8 C8.2.4 directly names all three gas tests as one competence. The review accepts only this explicit analytical clause, not every broad mapping row or all jurisdictions.',
 'e313c1ee':'BY8 C8.2.5 explicitly combines experimental/rechnerisch constituent content with measurement-method reliability, supporting the integrated competence and its bounded written cases.',
 '0bf26276':'BY10 general/NTG clauses expressly cover pH consequences in daily, technical and biological contexts. They do not give a universal aquatic legal range; the P range is explicit fictional material.',
 'fd309753':'BY10 C10.4.3 uses the same presence wording as the description. This establishes provenance but does not remove the scientific ambiguity: both ion species coexist, and relative predominance is the bounded correction.',
 'c0f1bf09':'BY12 C12-GA.1.3 explicitly connects reaction types and physical processes in cycles. Canonical SekII matches this clause; the historical SekI breadcrumb must not be used to infer a lower-stage source approval.',
 '95dc0ee5':'BY8/9 directly support everyday/technical translation, substance/particle distinction and symbolic language; BY9 also names particle interactions. Partial BY12/broader-text rows are not full independent endorsements of every sibling claim.',
 '02dc29ae':'BY12 C12-GA.1.1 supports structure/property classification and predictions while separating substance and particle levels. Review preserves the canonical SekII competence despite the historical SekI chapter label.',
 '9b5d6326':'BY8 supports rearrangement and historical model limitations in separate components. Independently seen HE-G9 physical17/printed16 explicitly contains Dalton atomic hypothesis and distinction among law, hypothesis and model; that closes this narrow conceptual source question only.',
 '22133f29':'BY10 C10.5.2 explicitly limits redox-half-equation construction to aqueous solutions. The English description lacks that existing qualification; its restoration is bounded source fidelity.',
 '1f30d81c':'BY10-NTG C10.3.4 explicitly compares metals/acid with carbonate/acid. Electron versus proton transfer is appropriate to the specific contrast, without claiming acid-media reactions are always pure protolysis.',
 '7a05a1ce':'BY12 C12-GA.1.2 directly supports selected mechanisms, reversibility and donor/acceptor classification. The adjacent broad reactivity clause contributes only related context, not a full source pass for all reactivity routines.',
 'a44af1fa':'BY8 C8.4.7 supports selected ions and pure-salt inference; BY12 C12-GA.3.1 expressly adds mixtures, acidic/basic solutions and product information. This cross-stage collection does not prove every SekI learner projection contains the full BY12 claim.',
 '597ac03c':'Official BY10 C10.4.6 first clause directly names structural suitability from formula representations. Only this first component supports the selected atomic child; deriving reversibility belongs to the sibling. Current direct child mapping count is zero.',
 '9751b6d8':'Official BY10-NTG C10.2.8 explicitly explains influence by reversibility. That supports the concise reversibility wording correction. Current direct child mapping count is zero; the independent finding does not create or integrate a mapping.',
 '88ee181f':'BY10 general/NTG clauses explicitly connect particle neutralization and applications. They do not establish that neutralized mixed waste is safe or authorize medicine dosage; the supplied cases correctly retain these limits.',
 '7990387d':'BY9 C9.5.2 explicitly classifies the four families through functional groups and familiar representatives. The source is not a complete mutually exclusive taxonomy of all oxygenated molecules.',
 'e14abd24':'BY9 C9.5.3 directly names basic IUPAC naming of the four families. The reviewed examples preserve this scope and do not require isotope/stereochemical naming.',
}
observations=[]
sources=[]
for g,note in zip(inp['goals'],image_notes):
 p=g['reviewContext']['page'];physical=p['pageNumber']+2;raster=B/'raster'/f'native-page-{physical:02}.png'
 observations.append({'goalId':g['goalId'],'logicalGoalPage':p['pageNumber'],'physicalPdfPage':physical,
  'rasterPath':str(raster.relative_to(B)), 'rasterDigest':digest(raster),
  'actualPageViewedByReviewer':True,'fullIdDescriptionAndPageBottomVisible':True,
  'pageObservation':note,'newVisualizationApproval':False,'currentPageRebuilt':False})
 row=next(r for r in guide['rows'] if r['goalId']==g['goalId'])
 refs=[{'sourceGoalId':w['sourceGoalId'],'sourceSpan':w['wholeSourceGoal']['sourceSpan'],
   'sourceRef':w['wholeSourceGoal']['sourceRef'],'primaryTextPath':w['primaryText']['path'],
   'scope':'only the explicitly discussed competence component'} for w in row['boundedLiteralBYWitnesses']]
 split=next((s for s in guide['splitCurrentSourceInputs'] if s['goalId']==g['goalId']),None)
 if split:refs.append({'sourceGoalId':split['wholeExistingSourceGoal']['id'],
  'sourceSpan':split['wholeExistingSourceGoal']['sourceSpan'], 'sourceRef':split['wholeExistingSourceGoal']['sourceRef'],
  'primaryTextPath':split['actualOriginalText']['path'],'currentDirectChildMappingCount':0})
 sources.append({'goalId':g['goalId'],'reviewAuthority':'ai_candidate','status':'needs_human_review',
  'independentComponentJudgment':source_notes[g['goalId'][:8]],'boundSourceComponents':refs,
  'wholeSourceApproved':False,'wholeProjectionApproved':False,'currentRoutingIntegrated':False if split else None})
save(B/'results/actual-seventeen-historical-page-observations.json',{'bookDigest':inp['bookDigest'],
 'physicalPages':19,'actualGoalPagesViewed':17,'rasterization':'pdftoppm -f 3 -l 19 -r 110 -png; actual pre-withdrawal PDF, not a generated replacement image',
 'scope':'17 goal-page inspection only; no app, mobile, client or human visualization acceptance','observations':observations})
save(B/'results/bounded-primary-source-independent-judgments.json',{'reviewAuthority':'ai_candidate',
 'goalCount':17,'judgments':sources,'sourceRowsAreNotGlobalPasses':True,
 'splitChildrenNeedSeparateRoutingIntegration':['597ac03c-d25f-5c34-a87c-52c059c87295','9751b6d8-cde3-527b-b37c-babb6cee79d2'],
 'notReviewed':['three excluded SOURCE-HOLD goals','whole original curricula','all-jurisdiction learner-facing supersets','all raw partial mapping rows'],
 'browserPrimaryPagesActuallyOpened':[
  'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie/ch-ntg',
  'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg',
  'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch',
  'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg',
  'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend'],
 'scientificReference':'IUPAC Gold Book P04524 pH definition, tool-visible official search result checked; direct open returned internal error',
 'scientificReferenceUrl':'https://goldbook.iupac.org/terms/view/P04524',
 'rawSourceLiteralCaution':'Five existing source descriptions match only after whitespace normalization (NBSP, double spaces, line breaks); raw byte-string matches are not claimed.'})
print('Saved independent observations of all17 actual historical pages and all17 bounded source judgments.')
