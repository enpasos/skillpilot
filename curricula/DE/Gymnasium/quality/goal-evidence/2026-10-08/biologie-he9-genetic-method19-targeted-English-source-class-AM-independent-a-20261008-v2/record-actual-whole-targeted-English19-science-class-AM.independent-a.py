# SPDX-License-Identifier: Apache-2.0
"""Record real targeted whole-goal judgment, no fabricated current native page."""
import copy, hashlib, json, datetime
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent/'biologie-he9-genetic-method19-targeted-English-whole-science-author-root-v2'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(name,value):
 with (OWN/name).open('x') as f:f.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
freeze=AUTHOR/'targeted-English19-whole-science-author-input.first.freeze.json'
assert bind(freeze)['sha256']=='5789db4f688028a21a88fa6d0fd1c2b7879dfde8cff7097cfe690d83aadc3f81'
f=read(freeze);files=f.get('files',f.get('frozenFiles'))
for b in files:assert bind(ROOT/b['path'])==b
old=read(AUTHOR/'original-whole-current-DEEN-goal.exact.json')['goal'];new=read(AUTHOR/'proposed-whole-current-DEEN-goal.targeted-English.author.json')['goal']
assert {k for k in new if new[k]!=old[k]}=={'titleEn','descriptionEn'}
assert new['titleEn']=='Basic Concepts of Gene Technology'
assert new['descriptionEn']=='The learner can outline basic methods and applications of gene technology.'
materials=read(AUTHOR/'two-whole-complete-DEEN-cases.unchanged.exact.json')
profile=read(AUTHOR/'one-whole-positive-profile.unchanged.exact.json')
pending=read(OWN.parent/'biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1/pending/exact-eighteen-whole-goals-profiles-and-forty-conditional-DEEN-cases.input.json')
prior=next(r for r in pending['records'] if r['goal']['id']==new['id'])
assert old==prior['goal'];assert materials==prior['wholeCases'];assert profile['profile']==prior['wholeCurrentV2Profile']
assert len(materials['cases'])==len(profile['profile']['applicationCaseBriefs'])==2
raster=read(AUTHOR/'actual-unchanged-PNG-width-and-native-original-page.exact.json');im=raster['image']
assert bind(ROOT/im['path'])['sha256']==im['sha256']
for row in read(ROOT/raster['widthCaptureReceipt'])['captures']:
 assert row['width'] in [360,680] and row['measured']['renderedWidth']==row['width']
 assert (ROOT/row['path']).is_file()
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
write('actual-input-targeted-English19-and-whole-primary-reading.independent-a.receipt.json',{'artifactKind':'actual targeted whole19 input and wholeHE9.4 primary rereading','recordedAt':stamp,
 'authorSeal':bind(freeze),'actualFrozenFilesVerified':len(files),'originalWholeGoal':bind(AUTHOR/'original-whole-current-DEEN-goal.exact.json'),'proposedWholeGoal':bind(AUTHOR/'proposed-whole-current-DEEN-goal.targeted-English.author.json'),
 'actualWholePrimaryReading':{'officialUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf','pdfSha256':'93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1','physicalPage':27,'printedPage':26,'actualReadMethod':'complete physical27 page pdftotext -f27 -l27 -layout output genuinely read, including rationale, compulsory/facultative entries and all methodology/social-context notes','exactShortSourceTerms':['Methoden der Gentechnik','Gentest, Gentherapie, Klonen'],
 'sourceUnderstanding':'At grade9 basic selected gene-method distinctions precede deeper grade12 genetics. Tests, therapy and cloning form the stated bounded gene-related family. Other whole9.4 inheritance/karyogram/aberration duties belong to other selected canonical goals; the image is not all source duties.'},
 'twoCompleteCasesAndWholeNormativeProfileActuallyRead':True,'caseScienceRetainedExact':2,'profileBodyRetainedExact':True,
 'currentSourceRefRole':'KC G9 Biologie,9.4.5 is a legacy authored condensation, not an official PDF numbered suboperator or literal quote.',
 'sourcePartnerDutyBoundary':'No universal union of all mapped partner rows or all-country original-operator reading claimed. Only actual source-grounded whole current goal19 scope and unchanged partner bindings.',
 'originalA18KEEPSealsPreserved':True,'actualOldBroaderEnglishIndependentlyRereadAfterParentNotifiedFinding':True,'newPeerTargetedBOutputsRead':False,'newNativePageOrInputRead':False,'activeWrites':0,'humanApproval':False})
write('first-whole19-English-source-class-AM-science.independent-a.verdict.json',{'schemaVersion':1,'artifactKind':'genuine independent A targeted whole genetic-method19 science semantic-kind atomicity memory first verdict','recordedAt':stamp,'goalId':new['id'],
 'exactWholeProposedInput':bind(AUTHOR/'proposed-whole-current-DEEN-goal.targeted-English.author.json'),
 'firstSourceScienceDecision':'PASS','EnglishScopeDecision':'PASS',
 'EnglishScopeRationale':'The former generic biotechnology wording could include fermentation unrelated to genes. Gene technology names the same gene-specific family as DE Gentechnik and the whole source section. It includes genetic testing as investigation as well as somatic gene therapy/DNA cloning; it does not require every diagnostic procedure to alter a genome or reduce the goal to genome editing. Title Basic Concepts conveys Grundbegriffe; description preserves basic methods/applications and outline/skizzieren.',
 'wholeCasesVerdict':'PASS','wholeProfileVerdict':'PASS_E1_G1_science_only_pending_new_native_binding',
 'caseSpecificScience':[{'caseId':'he9-19-19-case-1','decision':'PASS','rationale':'A sequence investigation is testing, B transfer to selected somatic cells is the given gene-addition therapy model, C selected fragment propagation is DNA cloning. Full DE/EN answers distinguish diagnosis from alteration, somatic from inherited change and DNA fragment from whole person; limits and nonclinical synthetic framing remain explicit.'},
 {'caseId':'he9-19-19-case-2','decision':'PASS','rationale':'Intron-free codingDNA and compatible vector/regulatory sequences support the simplified recombinant production chain. Production-cell amplification/expression and processed protein differ from transfer of a gene into the eventual recipient. DNA cloning is not donor-organism cloning; comparison provides a genuine contextual transfer. No full laboratory protocol, efficacy guarantee, real learner performance or personal treatment claim.'}],
 'semanticKindDecision':{'semanticKind':'curricularAtomic','decision':'PASS','rationale':'An ordinary assessable curriculum skill: classify and outline basic gene-related method purposes/pathways in examples. It is neither motivational orientation, structural program node, broad competency axis nor aggregate mastery marker. The two English corrections do not change this substantive kind.'},
 'atomicityDecision':{'status':'atomic','semanticAtomic':True,'decision':'PASS','rationale':'One bounded basic method-distinction/outline competence is assessed across a coherent family of three gene-related methods and one contrasting production context. The learner need not master unrelated complete testing, therapy and laboratory-cloning execution courses; varied examples exercise the same comparative conceptual skill. No independently required broad parenting/ethical-decision competence is silently bundled as with excluded12.'},
 'memoryDecision':{'status':'no_memory_needed','memoryUseful':False,'decision':'PASS','rationale':'Names of three methods alone cannot establish the goal: purpose, biological mechanism, limits and production-versus-recipient transfer must be explained in varied whole situations. These are understanding/application duties; no separate recall deck is needed to support mastery. The goal has no srs-deck/memorization tag. No new memorycard, shared-deck dependency, card-content or visibility mutation is required; existing unrelated cards/views remain untouched.'},
 'retainedImageDecision':{'decision':'KEEP','actualRasterSha256':im['sha256'],'originalOwnActualVisualReview':'biologie-he9-eighteen-final-raster-native-independent-a-20261008-v1/actual-eighteen-V-first-independent-a.verdicts.json','rationale':'The previously actually viewed fullPNG,360/680 captures and original whole page show exactly testing, somatic gene addition and identical selectedDNA propagation. Corrected English does not alter a depicted relation. Its small auxiliary words are not phone-only required text. No new raster edit or generation is warranted.'},
 'openScientificFindings':[],'newNativeSemanticKindAndAMFingerprints':'pending Root native candidate construction from this genuine substantive decision','newNativeD1P1V1PageBindings':'pending actual new whole current page/input and independent review, not approved by this science-only result',
 'historicalOriginalEnglishHoldAndA18KEEP':'both preserved; this is a genuine new targeted wording/science review, not history rewriting',
 'peerTargetedBReadBeforeFirstSeal':False,'PStatus':'needs_human_review/ai_candidate/E1/G1','realLearnerEvidence':False,'wholeCountrySourceClosureClaim':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
ownfiles=sorted(p for p in OWN.rglob('*') if p.is_file())
write('first-whole19-English-source-class-AM-science.independent-a.exact.freeze.json',{'schemaVersion':1,'artifactKind':'actual independent A whole19 English source class AM first science freeze','recordedAt':stamp,'exactAuthorSeal':bind(freeze),'frozenFiles':[bind(p) for p in ownfiles],
 'whole19SourceEnglishSciencePASS':True,'semanticKind':'curricularAtomic','atomicity':'atomic','memory':'no_memory_needed','retainedRaster':'KEEP unchanged actual original','newNativePageAndD1P1Bindings':'pending','peerTargetedBReadBeforeSeal':False,'historicalArtifactsUnchanged':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
print(bind(OWN/'first-whole19-English-source-class-AM-science.independent-a.exact.freeze.json'))
