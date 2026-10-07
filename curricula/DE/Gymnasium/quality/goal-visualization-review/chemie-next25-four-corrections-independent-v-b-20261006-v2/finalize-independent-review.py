#!/usr/bin/env python3
import datetime, hashlib, json, pathlib, struct, os
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=pathlib.Path(__file__).resolve().parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-four-targeted-raster-corrections-author-20261006-v2'
def sha(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):
    p=p.resolve();return dict(path=str(p.relative_to(ROOT)),sha256=sha(p),bytes=p.stat().st_size)
def write(name,value): (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
rawpath=AUTHOR/'seven-exact-assets-four-targeted-current-corrections.raw-v2-review-input.json'
raw=json.loads(rawpath.read_text())
current=json.loads((OUT/'whole-current-seven-and-three-exact-historical-carry.actual.json').read_text())
browser=json.loads((OUT/'independent-responsive-browser-render.actual.json').read_text())
fpath=AUTHOR/'four-targeted-raster-corrections.author-v2.final.freeze.json'
freeze=json.loads(fpath.read_text())
authorfiles=[]
for r in freeze['files']:
    p=AUTHOR/r['path'];actual=binding(p)
    assert actual['sha256'].removeprefix('sha256:')==r['sha256'].removeprefix('sha256:') and actual['bytes']==r['bytes']
    authorfiles.append(actual)
assert len(authorfiles)==29
originals=[]
for r in raw['rows']:
    for b in r['originalSourceFrontendBackendExactBefore']:
        assert binding(ROOT/b['path'])==b
        originals.append(b)
    p=ROOT/r['selectedPNG']['path']; header=p.read_bytes()[:24]
    assert header[:8]==b'\x89PNG\r\n\x1a\n'
    assert list(struct.unpack('>II',header[16:24]))==r['nativeSize']
assert len(originals)==21
assert binding(ROOT/raw['currentCanonical']['path'])==raw['currentCanonical']
ids=[x['goalId'] for x in current['newIndependentContentReviewInputs']]
assert len(browser['rows'])==16
for ident in ids:
    rows=[x for x in browser['rows'] if x['goalId']==ident]
    assert sorted(x['metrics']['imageBox']['width'] for x in rows)==[316,360,636,680]
    for r in rows:
        assert r['metrics']['computedImageCSS']['objectFit']=='contain'
        assert r['metrics']['computedImageCSS']['maxHeight']=='448px'
        for key in ['html','actualCardScreenshot','actualFigureScreenshot']: assert binding(ROOT/r[key]['path'])==r[key]
observations={
'965':{
 'science':['Two Al³⁺ and three O²⁻ are actually drawn; both counts and superscript signs agree with the 2:3 ratio and Al₂O₃.','2·(+3)+3·(−2)=0 is correct; neutral ratio-formula depiction has no uncharged oxide or missing oxygen.'],
 '360':'Ion labels Al³⁺/O²⁻, subscripts, ratio and charge-sum equation are directly distinguishable at actual image width 360; no zoom or reconstruction from the author hint was required.',
 '680':'Labels and stoichiometric relation remain clear at actual image width 680 with contain and 448px maximum height.',
 '316':'Mandatory ion charges, counts and equation remain distinguishable in the additional 316px image; the lower explanatory sentence is smaller.',
 'scope':'One aluminium-oxide example supports deriving a salt ratio formula. Molecular-ion salts, reverse naming and salt properties remain parts of the whole goal and are not shown or assessed by this picture.',
 'alt':'Zwei Al³⁺-Ionen und drei O²⁻-Ionen stehen im Verhältnis 2:3. Daraus folgt die Verhältnisformel Al₂O₃; die Ladungssumme 2·(+3)+3·(−2) ist null.'},
'747':{
 'science':['HCl is depicted with H δ+ and Cl δ−; chlorine is the more electron-attracting partner. Blue is consistently electron-poor/δ+, red electron-rich/δ−.','Linear O=C=O has negative ends and a positive carbon region. Two opposite equal qualitative bond-polarity arrows cancel, so the molecule is nonpolar although its C=O bonds are polar.','The colored envelopes are qualitative charge-coded illustrations, not quantitatively calculated electron-density plots; the arrows use the displayed chemical charge-shift convention.'],
 '360':'δ+/δ−, the two colors and their explicit legend, HCl polar, CO₂ nonpolar, and opposite arrows with zero sum are distinguishable at actual image width 360.',
 '680':'All required partial-charge signs, legend terms and cancellation relation are clear at actual image width 680.',
 '316':'Mandatory partial charges and color-key association remain distinguishable in the narrower additional rendering; headings and explanatory legend words are smaller.',
 'scope':'HCl and CO₂ give a bounded polarity comparison. This does not assess deriving polarity for every geometry or establish interpretation of quantitative electron-density data.',
 'alt':'Schematische ladungscodierte Oberflächen: Bei HCl ist H blau und δ+, Cl rot und δ−; das Molekül ist polar. Im linearen CO₂ sind beide O-Enden rot und δ−, C blau und δ+. Die entgegengesetzten Bindungsdipole heben sich auf, CO₂ ist unpolar. Blau bedeutet elektronenarm, Rot elektronenreich.'},
'492':{
 'science':['The chart shows first-ionization values Be 900, B 801, N 1402 and O 1314 kJ/mol; all four rounded numbers agree with the independent NIST reference calculation.','Bars share a zero baseline and their plotted heights agree approximately with the numerical axis; Be>B and N>O are preserved. The horizontal axis names selected elements, not equally spaced atomic-number measurements.','The right side is a qualitative many-electron subshell model, 1s below 2s below 2p. It correctly associates n=1 with 1s, n=2 with 2s/2p, ℓ=0 with s, and ℓ=1 with p.','The spectrum strip is an unassigned schematic line-spectrum cue, not a measured spectrum of Be, B, N or O. The N/O decrease is not asserted to be solely the s/p energy split; a complete explanation also involves occupation/electron repulsion.'],
 '360':'The four values, selected element symbols, kJ/mol, n=1/n=2 and ℓ=0/ℓ=1 remain distinguishable at actual image width 360. Axis-tick numbers and the energy/unit caption are smaller than the headline, but were actually read.',
 '680':'Values, units, model labels, braces and principal/angular-momentum numbers are clear at actual image width 680.',
 '316':'Data and required n/ℓ digits remain identifiable. The kJ/mol caption, tick labels and ℓ annotation are small and need close attention; this is recorded as an additional narrow-card typography limitation, not relabeled decorative.',
 'scope':'The image illustrates first-ionization comparisons and a qualitative subshell model. It does not show flame colors or an element-assigned emission spectrum, and it does not constitute the whole performance described in DE/EN or unchanged P evidence.',
 'alt':'Balken für erste Ionisierungsenergien: Be 900, B 801, N 1402 und O 1314 kJ/mol. Daneben ein qualitatives Energiemodell mit 1s bei n=1 sowie 2s und 2p bei n=2; s gehört zu ℓ=0, p zu ℓ=1. Ein schematischer Linien-Spektrumstreifen ist keinem Element zugeordnet.'},
'5e2':{
 'science':['Upper panels distinguish a small H₂O molecule below 1nm, typical nanoparticles in the 1–100nm range, and a macroscopic cube. The small-molecule qualifier and macromolecule caveat avoid making all molecules smaller than 1nm.','Exactly eight complete separated small cubes are drawn in two rows of four. Their perspective agrees with the large cube; corresponding projected front, vertical and depth edges are approximately half as large.','The large edge a and small edge a/2 are correctly labeled. Eight volumes (a/2)³ sum to a³; exposed area rises from 6a² to 12a² when the pieces are separated.','The statement that larger surface area can speed reactions is conditional and appropriate; it does not assert that every particle-size change has this sole cause or guarantees a faster reaction.'],
 '360':'The eight pieces, matching perspective and approximate 2:1 large/small edge ratio are visibly consistent at actual image width 360. The a/2 label and the 1–100nm range are distinguishable without zoom; the a/2 annotation is small.',
 '680':'The a and a/2 dimension labels, full eight-cube count, size range and equal-volume/more-surface statement are clearly readable at actual image width 680.',
 '316':'All eight pieces and half-edge geometry remain visible. The a/2 label is still identifiable, but the dimension label, macromolecule caveat and upper captions are small. No universal mobile/font-size or full-app acceptance is claimed; this narrower typography risk is retained explicitly.',
 'scope':'The cube partition is a surface/volume illustration, not a numerical scale drawing connecting the three upper panels. It does not assess all orders of magnitude or all changes in material properties in the whole DE/EN goal.',
 'alt':'Ein kleines H₂O-Molekül unter 1nm, typische Nanopartikel von 1–100nm und ein makroskopischer Würfel stehen für verschiedene Größenordnungen. Ein Würfel mit Kante a wird in acht getrennte Würfel mit Kante a/2 aufgeteilt. Das Gesamtvolumen bleibt gleich, die freie Gesamtoberfläche steigt; größere Oberfläche kann Reaktionen beschleunigen.'}
}
records=[]
for item in current['newIndependentContentReviewInputs']:
    g=item['wholeCurrentGoal'];o=observations[g['id'][:3]]
    records.append({'goalId':g['id'],'title':g['title'],'titleEn':g['titleEn'],'description':g['description'],'descriptionEn':g['descriptionEn'],'wholeCurrentGoal':g,'wholeCurrentGoalReadAndExact':True,'selectedPNG':item['selectedPNG'],'nativeSize':item['nativeSize'],'independentV_BDecision':'KEEP','reviewState':'ai_candidate','newIndependentContentReview':True,'actualNativeFullSizeSight':True,'actual360ImageWidthVerdict':o['360'],'actual680ImageWidthVerdict':o['680'],'additional316ImageWidthRisk':o['316'],'additional636ImageWidthSight':True,'scienceAndRepresentationObservations':o['science'],'representationAndScopeLimit':o['scope'],'proposedBoundedAltTextDE':o['alt'],'altTextStatus':'candidate only; current active generic alt text not rewritten','openRequiredCorrection':None,'sourceCoverageApproval':False,'newPApproval':False,'nativeBookOrFullAppAcceptanceClaim':False,'humanApproval':False,'humanTrial':False})
receipts=[dict(goalId=r['goalId'],actualNativePNG=r['selectedPNG'],actualPNGNativeDetail='original',actualResponsiveFigureSight=[{ 'imageWidth':v['metrics']['imageBox']['width'],'containerWidth':v['viewportWidth'],'screenshot':v['actualFigureScreenshot']} for v in browser['rows'] if v['goalId']==r['goalId']],actualFullCardSightWidths=[360] if r['goalId'].startswith(('492','5e2')) else []) for r in records]
write('independent-v-b.actual-model-sight.json',{'model':'Codex direct visual review, based on GPT-6; exact model variant not exposed','createdAtUTC':now,'fourNativePNGsActuallySeen':True,'responsiveFigureViewsActuallySeen':16,'actualFullCardScreenshotsActuallySeen':2,'rows':receipts,'zoomOrAssetModification':False})
factor=1.602176634e-19*6.02214076e23/1000
nums={el:{'NIST_eV':ev,'calculatedKJPerMol':ev*factor,'roundedKJPerMol':round(ev*factor)} for el,ev in [('Be',9.3227),('B',8.2980),('N',14.5341),('O',13.6181)]}
write('independent-primary-reference-and-geometry-check.actual.json',{'reviewerRole':'independent V-B scientific reference check','accessedAtUTC':now,'NISTAtomicSpectroscopy':{'url':'https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=926987','physicalPDFPage8Printed184Table':'11.3','quantumNumberDefinitionsPhysicalPDFPage2Printed178':'n positive integer, ℓ=0,...,n−1; s/p correspond to ℓ=0/1; shared n is a shell and shared n/ℓ a subshell','values':nums},'NISTConstants':{'url':'https://physics.nist.gov/cuu/Constants/Table/allascii.txt','electronVoltJoule':1.602176634e-19,'AvogadroPerMol':6.02214076e23,'eVtoKJPerMolCalculated':factor},'NISTNanoparticleRange':{'url':'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1200-13.pdf','physicalPDFPage6Printed2':'terminology, approximate 1–100nm range'},'IUPACElectronegativity':{'url':'https://old.goldbook.iupac.org/html/E/E01990.html','accessMethod':'primary-domain search result content read; later direct page opens returned internal error','boundedParaphrase':'Relative ability to attract electrons; qualitative basis for unequal sharing.'},'independentCubeGeometry':{'method':'direct original-raster sight and approximate manual projected edge endpoint comparison; not automated 3D reconstruction','nativePixelApproximateVertices':{'largeFrontTopLeft':[110,586],'largeFrontTopRight':[298,601],'largeFrontBottomLeft':[110,762],'largeBackTopLeft':[211,526],'firstSmallFrontTopLeft':[605,545],'firstSmallFrontTopRight':[695,549],'firstSmallFrontBottomLeft':[605,635],'firstSmallBackTopLeft':[646,515]},'actualVisibleFullSmallCubeCount':8,'projectedRatios':'about 0.48 front horizontal; 0.51 vertical; roughly half the projected depth. Illustration tolerances, not exact CAD dimensions.','perspective':'common projected front/depth directions','derivedVolumeEquality':'8·(a/2)^3 = a^3','derivedExposedSurface':'8·6·(a/2)^2 = 12a^2, versus 6a^2 before separation'},'referencesAreNotCurriculumSourceClosure':True})
result={'schemaVersion':1,'documentType':'four actual raster corrections independent V-B machine review; three unchanged exact prior A/B carry','createdAtUTC':now,'reviewerRole':'independent V-B','status':'ai_candidate','authorFreeze':binding(fpath),'reviewerIndependence':{'reviewerAgent':'/root/chemie_current_four_and_coordinate_native_d_independent_a','imageAuthorAgent':'/root','ownImageAuthorRole':False,'priorBWMetadataAuthorRole':'separate source-metadata lane; no raster authorship','peerV_A_V2Read':False,'peerV_B_V1FourChangedVerdictsRead':False,'historicalThreeKEEPRecordsOnlyRead':True,'rawAuthorCorrectionHintsKnown':True,'blindToPeerNewScienceVerdicts':True},'records':records,'historicalCarry':current['unchangedExactCarry'],'freshReviewDecisionCounts':{'KEEP':4,'REVISE':0},'historicalCarryCounts':{'unchangedExactIndependentA_B_KEEP':3,'newContentReviews':0},'actualMethod':{'nativeFullSizeImages':4,'requestedExact360680ImageWidthViews':8,'additional316636ImageWidthViews':8,'actualBrowserRender':binding(OUT/'independent-responsive-browser-render.actual.json'),'actualModelSight':binding(OUT/'independent-v-b.actual-model-sight.json'),'currentWholeBinding':binding(OUT/'whole-current-seven-and-three-exact-historical-carry.actual.json'),'primaryReferenceAndGeometry':binding(OUT/'independent-primary-reference-and-geometry-check.actual.json'),'specialCSS':False,'fullAppMounted':False,'nativeBookRendered':False},'narrowTypographyRiskRetained':{'492':'At additional image width316 the axis/unit caption and ℓ text are small; mandatory notation remains identifiable. Required actual360/680 was checked separately.','5e2':'At additional image width316 the a/2 label and small ancillary captions are small. Required actual360/680 remains distinguishable; no broad mobile acceptance claim.'},'unresolvedMandatoryVFindings':[],'currentActiveOriginal21CopiesExact':True,'newActiveQAApproval':False,'activeWrites':False,'newPOrSourceApproval':False,'newStrictClosures':0,'restoredStrictClosures':0,'strictNetGain':0,'newHumanApproval':False,'newHumanTrial':False}
write('independent-v-b-four-current-raster-verdicts.actual.json',result)
write('independent-review-run.actual.json',{'schemaVersion':1,'role':'independent V-B machine candidate','startedAtUTC':'2026-10-06, actual tool-run times retained in browser/current-binding receipts','completedAtUTC':now,'reviewer':'Codex direct review based on GPT-6; exact serving variant not exposed','fakeAPIModelRun':False,'actualBrowserVersion':browser['browserVersion'],'actualPlaywrightVersion':browser['playwrightVersion'],'freshScope':ids,'freshDecisions':{'KEEP':4,'REVISE':0},'carryOnlyIds':[r['goalId'] for r in current['unchangedExactCarry']],'authorFreezeAll29FilesVerified':True,'unmodifiedActiveOriginalCopies':len(originals),'ownFailures':[],'referenceAccessLimitation':'IUPAC primary-domain search content available; later direct page open gave internal error, retained explicitly in reference receipt','activeWrites':False,'scienceOrM7NetGain':0})
README='''# Independent V-B: four corrected Chemistry raster candidates

Status: **ai_candidate**, inert, 4 fresh KEEP / 0 REVISE. The unchanged a163/c441/235 PNGs are exact historical A/B KEEP carry; no new content review of those three occurred.

The reviewer read all seven complete current DE/EN goals and independently saw the four new native 1672×941 PNGs. Chromium 147.0.7727.15 / Playwright 1.59.1 rendered the unchanged GoalCard image and container rules (`p-5`, border, `block h-auto max-h-[28rem] w-full object-contain`). No asset-specific CSS, image filters or regenerated rasters were used.

## Actual responsive dimensions and scope

Requested **image widths 360 / 680** use container widths 404 / 724 after card padding and two borders. An additional narrower probe uses containers 360 / 680, yielding actual images **316 / 636**. The browser receipt records each measured box and computed `max-height: 448px` / `object-fit: contain`. The reviewer saw all 16 figure screenshots; only the 492/5e2 full-card 360-container screenshots were additionally sighted. This is an isolated CSS scaffold, not mounted full-app or native-book acceptance.

Required charge signs and sum, partial charges and color legend, four first-ionization data and n/ℓ notation, and a/2 were actually read at image widths 360 and 680. At 316, the 492 axis/unit/subshell labels and 5e2 dimension/caveat text are small and require attention. This narrower typography risk is retained; no universal small-screen acceptance is claimed. Mandatory notation was not reclassified as decoration.

## Bounded findings

- 965: two Al³⁺ and three O²⁻, ratio 2:3, Al₂O₃ and neutral charge sum agree. This one example does not assess molecular-ion salts, reverse naming or properties.
- 747: HCl partial charges, linear CO₂ with opposite bond dipoles, and the blue/electron-poor versus red/electron-rich legend agree. The surfaces are qualitative illustrations.
- 492: Be 900, B 801, N 1402 and O 1314 kJ/mol agree with the independently converted [NIST neutral-atom data, Table 11.3](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=926987), using the [NIST SI conversion constants](https://physics.nist.gov/cuu/Constants/Table/allascii.txt). The same NIST chapter supports n/ℓ shell/subshell notation. The spectrum strip is unassigned and schematic; no measured element spectrum or flame color is claimed. The model is qualitative for multi-electron atoms, and the N/O decrease is not explained solely by s/p splitting.
- 5e2: eight complete pieces in matching perspective have approximately half the projected edges. Independent volume/surface calculations give a³ total volume and 12a² exposed area after separation, versus 6a² before. The illustrated typical 1–100nm range agrees with [NIST SP1200-13 terminology](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1200-13.pdf). The panels do not form a common numerical scale drawing.

The primary IUPAC electronegativity search entry was read; later direct opens failed, and that limitation is recorded. Known author correction hints were allowed. No peer V-A-v2 or historical V-B-v1 verdict for the four changed images was read. The three carry records alone were extracted and verified against their actual asset hashes and current whole goals.

## Handoff

Use `independent-v-b-four-current-raster-verdicts.actual.json` for the four exact PNG-hash decisions and bounded German alt-text candidates. Use `whole-current-seven-and-three-exact-historical-carry.actual.json` for whole-goal equality and the three exact A/B carry records. `independent-v-b.actual-model-sight.json` distinguishes actual model sight from browser rendering. The final freeze pins all own artifacts and concrete external inputs.

The seven current original assets and all 21 source/frontend/backend copies remain exact. Current canonical references still point to original JPGs; proposed alt text and new PNG decisions are candidates only. No active writes, global build, extra science review, P/source closure, whole-curriculum coverage, M7 gain, human approval, or human trial is claimed. Historical review and author artifacts remain immutable.
'''
(OUT/'README.md').write_text(README)
external={b['path']:b for b in authorfiles+originals+[binding(fpath),binding(rawpath),raw['currentCanonical'],binding(ROOT/'AGENTS.md'),binding(ROOT/'LICENSING.md'),binding(ROOT/'docs/concept/skill-graph/atomic-goal-visualizations.md'),binding(ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/checklist.md'),binding(ROOT/'app/src/components/GoalCard.tsx')]}
for r in raw['rows']:
    for key in ['selectedPNG','actualPrompt','firstIndependentReviewA','firstIndependentReviewB']:
        b=r[key]; assert binding(ROOT/b['path'])==b; external[b['path']]=b
write('external-inputs.final.actual.json',{'schemaVersion':1,'documentType':'actual immutable inputs for independent V-B four corrections and three exact carry','inputs':list(external.values()),'priorFourPeerVerdictsNotRead':True})
files=[]
freezeout=OUT/'independent-four-targeted-raster-corrections-v-b-v2.final.freeze.json'
for p in sorted(OUT.rglob('*')):
    if p.is_file() and p!=freezeout: files.append(dict(path=str(p.relative_to(OUT)),sha256=sha(p),bytes=p.stat().st_size))
write(freezeout.name,{'schemaVersion':1,'documentType':'inert independent V-B exact raster candidate freeze','frozenAtUTC':now,'role':'independent V-B','status':'ai_candidate','files':files,'externalInputs':list(external.values()),'freshKEEP':4,'freshREVISE':0,'unchangedExactPriorABCarry':3,'actualNativePNGSight':4,'actualRequested360680ImageWidthSight':8,'additional316636ImageWidthSight':8,'activeWrites':False,'strictNetGain':0,'humanApproval':False,'humanTrial':False})
for r in files:
    p=OUT/r['path'];assert sha(p)==r['sha256'] and p.stat().st_size==r['bytes']
for r in external.values(): assert binding(ROOT/r['path'])==r
for p in OUT.rglob('*'):
    if not p.is_symlink(): p.chmod(0o555 if p.is_dir() else 0o444)
OUT.chmod(0o555)
print(json.dumps({'freeze':binding(freezeout),'ownFiles':len(files),'externalInputs':len(external),'freshKEEP':4,'historicalCarry':3,'activeWrites':False,'strictNetGain':0},ensure_ascii=False))
