import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone

root = Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-four-image-fresh-independent-v-v1')
source = Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-four-real-image-defects-author-root-v1/SELECTOR.four-selected-image-candidates-for-independent-review.json')
selector = json.loads(source.read_text())
manifest_path = root / 'TECHNICAL.real-browser-preview-manifest.json'
manifest = json.loads(manifest_path.read_text())
observations = {
 '28c90c6a-3020-5c51-ac40-d802f3f12d2d': {
  'title': 'Titrationskurven datengestützt deuten',
  'science': 'The explicitly schematic acetic-acid/NaOH example rises from acid through a CH3COOH/CH3COO− buffer to an alkaline equivalence solution and OH− excess. The acid dissociation and acetate hydrolysis equations conserve atoms and charge. pH≈pKs is limited by the depicted weak-acid system and half-equivalence marker. The phenolphthalein interval 8.2–10 straddles the steep section and the equivalence label states pH>7. The plot is a qualitative illustration, not numerical titration data or a quantitative indicator-error proof.',
  'oldDefectAndResolution': 'The actual old JPG said “nur Säure” at the initial acid solution and “nur Salz (CH3COONa)” at equivalence, suppressing the equilibria the goal requires learners to explain. The replacement removes both exclusivity claims, explicitly shows acid dissociation, and replaces “only salt” by acetate solution plus CH3COO− + H2O ⇌ CH3COOH + OH−. The excess region names OH− and acetate rather than undissociated NaOH.',
  'goalAndProfileAlignment': 'Directly illustrates interpretation of curve regions, buffer species and alkaline salt hydrolysis for one supplied weak-acid example. It does not claim that all titrations have buffer regions, that any half-volume proves pKs, or that pH 7 universally defines neutrality. The current P requires variation and bounded inference; this orientation image does not replace those cases.',
  'geometryAndLabels': 'All region arrows point to the intended sections, the half-equivalence marker is before equivalence and approximately midway in added volume, and the equivalence point is inside the indicator band. The hand-drawn tick spacing is approximate, so the explicit “schematisch” restriction matters: no numerical pH or volume should be measured off this image.',
  'responsive': 'At 680 px the main labels and equations are readable without cropping. At 360 px the curve, buffer, half-equivalence and equivalence marks, alkaline region and indicator band remain distinguishable. The long hydrolysis line and lower footer are small and are not a suitable phone text source; they are supplemental to the core visual, not an added phone reading task.',
  'remainingLimitations': ['Qualitative, schematically spaced axes: never use as numerical source data.', 'Long formula details require the larger view; the image remains orientation support.'],
  'personPerspective': 'No person is depicted.'
 },
 '7dc80ee2-64e3-50c1-8aaa-0fef0ed0919d': {
  'title': 'Künstliche Photosynthese und Wasserstoffspeicherung bewerten',
  'science': 'The DC negative terminal is connected to the cathode producing H2 and the positive terminal to the anode producing O2. 2 H2O → 2 H2 + O2 conserves H and O. The lower left light/catalyst route is separated from the electrical route. Pressure gas and deeply cooled liquid are physical storage; the lattice uses individual H symbols for metal-hydride binding and the organic carrier is shown as a chemical material-binding route. The central criteria include resource and catalyst demand, storage potential and losses, costs, environment and safety, without claiming a universal winner.',
  'oldDefectAndResolution': 'The actual old JPG connected its + supply terminal to the electrode labelled cathode (−), and its − terminal to anode (+). Its compressed-gas vessel contained triatomic H-labelled clusters, and its metal hydride contained intact H2 labels. The new PNG fixes supply polarity, removes the false gas clusters, and uses atomic H within the hydride lattice. It retains separate physical and chemical storage panels.',
  'goalAndProfileAlignment': 'Matches the current C/P split between electricity-driven and direct light-driven water splitting, physical versus hydride storage, resource need and conditional comparison. Artificial photosynthesis is labelled a goal; the diagram does not assert full CO2 fixation or carbohydrate synthesis. Neither the equation nor catalyst icon claims energy creation. It is an overview, not the quantitative energy/mass inventory required in P.',
  'geometryAndLabels': 'Electrode, supply and gas-product labels agree. The two drawn collection vessels have no volume scale or equal-volume assertion; the balanced equation supplies stoichiometry. The hydride and LOHC drawings are generic conceptual icons, not a fully specified molecular mechanism or measured lattice structure.',
  'responsive': 'The 680 px card makes polarity, H2/O2 products, equation and storage categories clear. At 360 px the three-column structure, electrolysis versus light path and physical versus chemical examples remain identifiable; some long criteria and carrier captions are small. The central icons and short headings carry the orientation; detailed labels should be read in the larger view.',
  'remainingLimitations': ['Do not infer a complete natural-photosynthesis analogy, quantitative yield or gas-volume ratio from the icons.', 'Phone view supports orientation; long carrier and comparison labels are secondary detail.'],
  'personPerspective': 'No person is depicted.'
 },
 'e20d205f-03a4-5f96-b456-9b20460605a2': {
  'title': 'Life-Cycle-Assessment anwenden',
  'science': 'The replacement compares named example pathways A and B on the same electricity quantity. Its vertical axis explicitly says relative climate impact, not undifferentiated total environmental impact. The brown, gray, blue, yellow and green phase colors appear once each and in the same order in both stacks, matching raw materials, production, transport, use and disposal. No invented numerical emissions, universal energy-carrier ranking, negative credits or complete multi-impact LCA conclusion are shown.',
  'oldDefectAndResolution': 'The actual old JPG used “Umweltwirkung (relativ)” as a single undifferentiated stack, did not declare an equal service, and duplicated/misordered colors within stack B (green/yellow below the large gray section as well as above). The new PNG makes the functional comparison “gleiche Strommenge” explicit, narrows the axis to Klimawirkung, and gives both stacks the same five-color order. It also removes the visually universal coal-versus-wind ranking.',
  'goalAndProfileAlignment': 'Directly fits the P requirement for a functional unit, declared effect category and bounded life-cycle account; the five phases convey a system boundary. The current P says a climate account is one limited LCA component. The PNG honors that by its axis label and illustrative data heading and makes no complete environmental judgement.',
  'geometryAndLabels': 'Stacks share a baseline and scale, each includes exactly five phase blocks, and there is no swapped or repeated color. Bar B is lower only in the declared example. The top phase icons are clearly distinct.',
  'responsive': 'At 360 px the phase icons, two bar totals, same-electricity heading and “Alle Phasen beachten” remain recognizable; the narrow axis wording is small but its larger-view text is explicit. At 680 px all main captions are comfortably readable. No card cropping occurs.',
  'remainingLimitations': ['This is a relative example, not a numerical inventory or evidence for a particular energy carrier.', 'Other environmental categories, credits and assumptions still belong in the learning material, not this overview.'],
  'personPerspective': 'The learner is viewed from behind and left, looking down at a clipboard whose clip is at the far/top edge; the visible Ökobilanz heading and writing direction agree with that use. Hand and pencil placement do not reverse the sheet or instruments.'
 },
 'c0f1bf09-5a70-5006-b1e9-e91f786a63bf': {
  'title': 'Stoffkreisläufe mit Reaktionen und physikalischen Vorgängen beschreiben',
  'science': 'The water panel separates invisible vapour in clear air, condensation into visible cloud droplets, and falling precipitation. Evaporation arrows rise from liquid water and the condensation arrow leads from the vapour label into the droplet cloud. The carbon panel directs CO2 toward the plant via photosynthesis and back toward atmospheric CO2 via plant/animal respiration and decomposition. Organic material moving toward soil is shown as a material flow, without the old explicit chemical-reaction marker on death. There is no mass or energy creation claim.',
  'oldDefectAndResolution': 'The actual old JPG conflated “Wasserdampf/Wolke”, combined condensation with rainfall, and explicitly marked “Absterben” as a chemical reaction using the red test-tube legend. The selected v2 PNG labels vapour invisible, puts droplets inside the cloud and rainfall below it, distinguishes condensation from precipitation, and removes both the death label and the chemical-reaction pictogram from biomass transfer. The physically distinct phases are no longer equated.',
  'goalAndProfileAlignment': 'The current C asks learners to use chemical reactions and physical processes to describe matter cycles; P distinguishes physical storage/transport from reaction and material cycling from useful-energy cycling. The two-panel orientation supports that distinction without claiming that its icons exhaust P, that all carbon-cycle processes are chemical, or that matter and usable energy share the same closed cycle.',
  'geometryAndLabels': 'Water-flow directions are consistent and no liquid droplets float in the clear-air area labelled invisible vapour. The carbon arrows have the correct direction. The stylized CO2 cloud is a label bubble, not a water-vapour phase model; the water panel explicitly distinguishes actual cloud droplets.',
  'responsive': 'At both 360 and 680 px the water cycle and carbon cycle remain distinct, major arrows remain visible, and the corrected vapour/cloud labels remain identifiable. Organic-material and soil labels are secondary small text at 360 px; the clear larger rendering supplies the detail. No crop or hidden panel occurs.',
  'remainingLimitations': ['The carbon-panel matter-flow arrow is not an equation and does not classify every transport or decomposition mechanism.', 'The image does not present the complete carbon or lime-cycle reaction/energy balances needed in P.'],
  'personPerspective': 'No person is depicted.'
 }
}

records=[]
for candidate in selector['candidates']:
 gid=candidate['goalId']
 context_path=root/f'INPUT.{gid}.whole-scientific-context.json'
 context=json.loads(context_path.read_text())
 previews=[entry for entry in manifest['images'] if entry['goalId']==gid]
 record={
  'goalId':gid,'decision':'KEEP','machineDecision':'accepted_pilot_after_regeneration',
  'candidatePath':candidate['path'],'candidateSha256':candidate['sha256'],
  'originalPath':candidate['originalPath'],
  'originalSha256':next(entry['inputSha256'] for entry in previews if entry['role']=='original'),
  'goalFingerprint':context['goalFingerprint'],
  'profileFingerprint':context['reviewContext']['evidenceProfile']['profileFingerprint'],
  'scientificContext':{'path':str(context_path),'sha256':hashlib.sha256(context_path.read_bytes()).hexdigest()},
  'actualNativeOriginalAndCandidateViewed':True,
  'actualAllFourRenderedPreviewsViewed':True,
  'blockingFindings':[],
  **observations[gid],
  'screenshots':[{'role':entry['role'],'width':entry['width'],**entry['screenshot']} for entry in previews]
 }
 records.append(record)

first={
 'schemaVersion':1,
 'role':'Fresh independent visualization reviewer FIRST scientific observations, sealed before QA schema or ledger serialization',
 'reviewer':'Codex independent agent chemie_four_image_fresh_independent_v_20261017',
 'sealedAtUTC':datetime.now(timezone.utc).isoformat(),
 'scope':'Only four selected Chemistry PNG replacements, their exact original JPGs and current scientific contexts',
 'independence':{
  'imageAuthor':False,'peerReviewResultsRead':False,'historicalQAJudgmentsRead':False,
  'stockQASchemaReadBeforeFirst':False,
  'authorSelectorExposure':'The supplied selector was read as the required frozen input, including its author-provided preservedRejectedCandidate note. No archived rejected-v1 PNG was reviewed and no author decision was treated as approval.',
  'currentProfileStatusUsedAsApproval':False,
  'reviewBasis':'Own observations of eight native original-resolution images and sixteen real Chromium screenshots; exact current C/P scientific fields from sanitized views verified against current capsule canonical fields.'
 },
 'inputSelector':{'path':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},
 'previewManifest':{'path':str(manifest_path),'sha256':hashlib.sha256(manifest_path.read_bytes()).hexdigest()},
 'interpretation':'KEEP permits technical integration for machine V evidence of these exact candidates. It is not human approval, host acceptance, source evidence or full M7 completion. The image-only orientation role is essential to the recorded phone-detail limitations.',
 'humanApproval':False,'sourceMutations':False,'records':records
}
p=root/'FIRST.independent-scientific-observations.json'
assert not p.exists()
p.write_text(json.dumps(first,ensure_ascii=False,indent=2)+'\n')
seal={'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size,'sealedAtUTC':datetime.now(timezone.utc).isoformat(),'condition':'FIRST written before stock QA serialization; immutable original reviewer observations'}
(root/'FIRST.seal.json').write_text(json.dumps(seal,indent=2)+'\n')
print(json.dumps(seal,indent=2))
