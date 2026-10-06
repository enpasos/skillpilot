# SPDX-License-Identifier: Apache-2.0
"""Independent, inert review receipts. Never mutate the author or active inputs."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import hashlib
import json
import subprocess
import urllib.request

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).parent
AUTHOR = OUT.parent / 'biologie-q1-four-current383-source-scope-author-remediation-v4'
V3 = OUT.parent / 'biologie-q1-four-current383-source-scope-author-remediation-v3'
NOW = datetime.now(timezone.utc).isoformat()

def read(path):
    return json.loads(path.read_text())

def sha(data):
    return hashlib.sha256(data).hexdigest()

def objsha(data):
    return sha(json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())

def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def fileinfo(path, role):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(data), 'bytes': len(data), 'reviewMode': role}

expected = '89816e95a26d30ff82e900565ec164acb3427cb341129f86aaa154adce82419f'
assert sha((AUTHOR / 'author-source-scope-remediation-v4.final.freeze.json').read_bytes()) == expected
verification = {}
for name, base in [('author-source-scope-remediation-v4.final.freeze.json', AUTHOR), ('actual-reviewed-inputs.author.freeze.json', ROOT)]:
    manifest = read(AUTHOR / name)
    failures = []
    for row in manifest['files']:
        path = base / row['path']
        if not path.exists():
            failures.append({'path': row['path'], 'error': 'missing'})
        else:
            data = path.read_bytes()
            if sha(data) != row['sha256'] or len(data) != row['bytes']:
                failures.append({'path': row['path'], 'error': 'binding drift'})
    verification[name] = {'measuredCount': len(manifest['files']), 'failures': failures}
    assert not failures

components = read(AUTHOR / 'four-main-components-eight-positive-cases.author-candidate.json')['components'] + read(AUTHOR / 'mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json')['components']

# Each rationale was independently formed from the actual source and complete DE/EN case.
component_facts = {
 'classical_genetic_information_carriers_dna_gene_chromosome': {
   'decision': 'KEEP', 'source': 'BE/BB 2015 Teil C, 3.7, physical/printed36: chromosome carrier content and DNA plus Gen/Allel terminology. The page does not prescribe nucleotide chemistry or complementarity. This supports this bounded terminology component, not the whole original3.7 genetics field or the whole molecular0daa target.',
   'atom': 'One coherent nesting/variant competence. Allele appears in caseB and must remain in the source-component binding. No universal original year is established by this topic page.',
   'route': 'No whole0daa or electron-microscopy prerequisite accepted. Supplied nesting and homologue model permit a basic carrier component; actual ID/placement/native context remains unresolved.'},
 'by9_gene_product_trait_genwirk_chain': {
   'decision': 'KEEP', 'source': 'Current official BY Gymnasium9 B9.3.1 names explaining protein formation/trait contribution and content with enzyme roles and Genwirkkette. Two sequential enzyme actions and transport-versus-catalysis adequately support the trait-chain part. Basic protein formation remains a separate partial475 partner; structural diversity remains a separate28850 obligation.',
   'atom': 'Causal contribution of several products to a trait is coherent with0263; does not revise its NI-reviewed whole goal.',
   'route': 'Existing0263 plant/animal-cell prerequisite remains unchanged. No new molecular-code, full meiosis or crossing-over requirement is established.'},
 'he_code_sun_forward_and_existing_reverse': {
   'decision': 'KEEP', 'source': 'HE KC2024 physical/printed38 Q1.1 basic GK+LK explicitly requires use of Code-Sonne. Actual ring tracing is demanded and answered. Existing e349 reverse reconstruction remains valid canonical content; it is not a literal HE reverse-direction requirement.',
   'atom': 'Forward use and nonunique inverse reconstruction form one existing code competence. Preserve bounded HE forward evidence instead of asserting exact support for the entire bidirectional goal.',
   'route': 'Existing DNA/RNA-comparison prerequisite preserved; it is plausible for molecular Q1, but not a reason to transplant this whole route into BE/BB carrier terminology.'},
 'he_pro_euk_mrna_ribosome_trna_mechanism': {
   'decision': 'REVISE', 'source': 'HE Q1.1 physical/printed38 names pro/euk synthesis, transcription, mRNA structure/function, translation, ribosome and tRNA. ModelA addresses those roles and compartments; modelB provides an appropriate export-versus-charged-tRNA intervention. Life significance is supplied existing1ec4 semantics, not a new literal HE source bullet.',
   'atom': 'Connected information-flow comparison and supplied function are coherent with existing1ec4. ModelA needs an explicit abbreviation/fragment convention before calling the translated short product a life-essential enzyme.',
   'route': 'Existing1ec4/e349 prerequisites remain unchanged. No inherited lower-stage route is accepted from this upper-stage example.'},
 'mutation_levels_gen_chromosome_genome': {
   'decision': 'KEEP', 'source': 'SN2025 physical42/43, printed30/31: kennen mutation causes (Mutagene) and Gen/Chromosom/Genom types. TH2024 physical29/printed23: erläutern genetic variability with these three types, causes and consequences. Tasks distinguish local sequence, segment structure and count, with supplied immediate consequences. External-mutagen content needs the separate cause component.',
   'atom': 'Comparing the three scales is a coherent discrimination competence, not three unrelated atoms. Avoid unneeded duplicated global goals when resolving the narrower ST point/genome partner.',
   'route': 'Proposed classical-carrier component is a plausible minimal provisional prerequisite; counting/homologue/gamete conventions must remain supplied or independently routed. Whole0daa/organelle or3417 recombination chain not accepted.'},
 'point_and_genome_mutation': {
   'decision': 'KEEP', 'source': 'ST2022 physical/printed42/43 expressly names Punkt-/Genommutation and explains mutation as changed genetic information. It does not name the complete SN/TH structural taxonomy in this clause. The source heading is Schuljahrgang10 (Einführungsphase), so this cannot be approved as a universal SekI placement.',
   'atom': 'The two-scale discrimination is coherent. Preserve stated substitution working definition; do not export it as a universal definition of every point mutation. Resolve semantic overlap with the broader type component at canonical authoring.',
   'route': 'Classical carrier is a suitable provisional minimal candidate; actual ST10/E-phase program/stage binding requires explicit review. Existing lower-secondary filename is not stage evidence.'},
 'mutagen_causes_and_protection': {
   'decision': 'REVISE', 'source': 'BY12 GA+EA B12.2.4 explicitly combine mutation causes, protein-function effects and protection; supplied cases cover the cause/protection subcomponent. SN names Mutagene as causes. MV physical30/printed26 additionally asks everyday-life reflection; ST43 asks evaluating environmental genetic risks. Generic R/M data alone do not complete those latter operators. TH protection is honestly a didactic addition, not an original compulsory protection clause.',
   'atom': 'Causal influence and evidence-based prevention form a bounded competence. Retain the sound R/M data, but add or explicitly bind a concrete everyday/environmental decision with criteria, uncertainty and a reasoned judgement for MV/ST.',
   'route': 'Classical carrier is provisional only. ST10/E-phase classification remains unresolved; no full recombination requirement is needed for these supplied cases.'},
 'somatic_and_germline': {
   'decision': 'KEEP', 'source': 'MV10 physical30/printed26 names effects on somatic cells and germline; BY12 GA/EA content explicitly names both. Actual lineage/timing models adequately support conditional spread and offspring transmission, without forcing every mutation to be inherited.',
   'atom': 'One coherent lineage/transmission competence, distinct from molecular mutation events and disease diagnosis.',
   'route': 'Supplied separated animal-cell lineages avoid requiring the whole mitosis/meiosis partner. Classical-carrier prerequisite is provisional; organism/model restriction must remain explicit.'},
 'mutation_vs_modification': {
   'decision': 'KEEP', 'source': 'MV10 comparison, SN10 genotype/phenotype variability application, ST10 criteria-based comparison and conclusions, and TH9/10 genetic versus environmental variability are actually present. Genotype/environment controls and coexisting contributions support these bounded comparisons.',
   'atom': 'Coherent evidence-based distinction. Neither visible sameness nor reversibility alone is exported as a universal genotype test.',
   'route': 'Classical carrier is provisional. Preserve stipulated model-wide invariance; a single measured unchanged gene is not a real-world whole-genome proof. No whole3417/crossing-over prerequisite accepted.'},
 'protein_function_from_mutation_data': {
   'decision': 'REVISE', 'source': 'BY12 GA+EA B12.2.4 expressly requires explaining effect on encoded-protein function. Controlled amount and test conditions address function rather than inferring it from sequence. ModelA calls a fully stopped three-residue gene product a protein with measured activity without making an abbreviation convention explicit; modelB correctly states a marked protein segment.',
   'atom': 'Measured molecular effect is a suitable supplement toffef. Repair modelA wording as an explicitly abbreviated longer protein/model, preserving stop/codon/control logic. It does not cover every mutation event in ffef or the complete BY clause by itself.',
   'route': 'Existing ffef→475 prerequisite is appropriate at molecular BY12 level and retained. This does not clear wholeffef in each inherited lower-stage scope.'},
 'replication_error_control_and_repair': {
   'decision': 'KEEP', 'source': 'TH physical28/printed22 explicitly names error control and repair under information-preserving replication. BY12 GA+EA2.4 content names repair enzymes; EA2.3 separately requires PCR comparison and DNA repair including an excision example. Simple mismatch models support the significance subcomponent, not the complete EA2.3 obligation.',
   'atom': 'Checking versus template-based correction and persistence form one bounded competence. Mismatch is not already a fixed mutation; intact-template/new-strand assumptions are explicit.',
   'route': 'Classical carrier alone does not teach base complementarity. Keep pairing/direction rules in tasks or review a minimal structural/copier prerequisite. Full PCR partner76ad is not a compulsory TH9/10 predecessor.'}
}

case_facts = {
 'classical-carriers-a': ('KEEP', 'Nucleus→chromosome→DNA→gene nesting, multiple genes per chromosome and incomplete total-gene count are correctly explained. Positive performance demands relationships and a bounded inference, not mere labels.'),
 'classical-carriers-b': ('KEEP', 'Same-locus allele variant changes no chromosome number; absent gene-product/trait data prevent disease inference. DE/EN both preserve this distinction.'),
 'gene-chain-a': ('KEEP', 'Two-step E1/E2 route yields red/colourless/yellow forA/B/C. Both genes contribute causally; enzyme protein is not converted DNA or a universal one-gene trait rule.'),
 'gene-chain-b': ('KEEP', 'Transport precedes catalysis;20/2/1 residual amounts are consistent with supplied alternative/background paths. The solution correctly separates the two protein functions and residual output from a fully intact pathway.'),
 'code-wheel-a': ('KEEP', 'Both coding DNA strands yield Met–Glu–Phe then stop. GAA is traced G→A→A. Synonymous and stop alternatives explain nonuniqueness, without claiming equal regulation/function.'),
 'code-wheel-b': ('KEEP', 'ATG AAA TGC TAG andATG AAG TGT TGA both yield Met–Lys–Cys then stop. UGC ring path is correct. Two valid alternatives and forward checking give substantive positive understanding.'),
 'mechanism-pro-euk-a': ('REVISE', 'GAA anticodon3′CUU5′ equals5′UUC3′; compartment/timing and roles are correct. Material gives a complete ATG GAA TTT TGA gene and calls its Met–Glu–Phe product a life-essential enzyme. Explicitly mark a schematic abbreviation or a segment of a longer protein, and keep enzyme significance separate from the short code illustration; this is a model-scope ambiguity, not a claim that every short peptide lacks any activity.'),
 'mechanism-pro-euk-b': ('KEEP', 'X preserves transcription but blocks export of new RNA;Y permits export but removes charged tRNA forGAA, preventing complete new reporter. Old molecules persist, P lacks nuclear export and still needs tRNA. This is an actual causal transfer case.'),
 'levels-a': ('KEEP', 'ACGT→ATGT is local; twelve-gene segment duplication leaves count4; gamete mis-segregation yields count5. Only case1 has controlled50±2→20±2 activity evidence. Structural/copy-count consequences and unmeasured traits remain correctly separate.'),
 'levels-b': ('KEEP', 'One-base loss, reversed eight-gene segment after breaks and whole-chromosome loss differ in scale and immediate information. Given causes are explained and no unmeasured function is inferred.'),
 'point-genome-a': ('KEEP', 'ACTA→ATTA changes one position; whole-chromosomeB3 changes count4→5. Counting cannot exclude a sequence mutation. The substitution-only working definition is bounded.'),
 'point-genome-b': ('KEEP', 'GCAA→GCTA is one changed position; absentC2 changes count6→5. A specified sequence comparison is needed for an additional local mutation. No stage clearance follows from the correct classification.'),
 'mutagen-protection-a': ('REVISE', 'Causal subset is sound:3/27/6 per1000 give0.3/2.7/0.6percent and ratio9. Tested shielding reduces the observed model effect without zero-risk or person-level inference. For claimed MV everyday reflection/ST environmental evaluation, add a concrete context and explicit criteria-based judgement; genericR is not that complete operator case.'),
 'mutagen-protection-b': ('REVISE', '2/18/17 per1000 are correct; supplied nonretaining paper and closed substitute justify choice without claiming deterministic mutation. Keep this cause/prevention material; supply an actual everyday/environmental decision and criteria for MV/ST rather than upgrading genericM to their full reflection/evaluation operator.'),
 'lineage-a': ('KEEP', 'K remains somatic in the stated separated animal model;G transmission is conditional on a participating affected gamete. Both remain mutations; cellular inheritance and offspring inheritance are distinguished.'),
 'lineage-b': ('KEEP', 'EarlyE can reach both lines, lateS is local, unused mutatedG gamete does not transmit to the specified offspring. Timing and actual fertilisation give fresh transfer without a disease claim.'),
 'mutation-modification-a': ('KEEP', 'The model stipulates unchanged genotype during light change and returns both groups to16; the confirmed mutatedM may look equal. This stipulation, not a single unchanged assay alone, carries the modification conclusion.'),
 'mutation-modification-b': ('KEEP', 'The extra6 units are reversible environmental effect while measured genotype difference persists. The solution does not attribute the baseline8/10 difference solely to one variant without function evidence.'),
 'protein-function-a': ('REVISE', 'Codon and activity reasoning is correct: reference/W encode Met–Glu–Phe, VMet–Asp–Phe;12±2 differs strongly from100±4, W98±4 is not clearly different. Explicitly describe the stopped three-residue sequence as an abbreviation of a longer protein or separate the short peptide-code model from supplied whole-protein function data. Fictitious numbers alone do not explain that representational boundary.'),
 'protein-function-b': ('KEEP', 'The explicitly marked segment gives Glu→Asp or in-frame Gly deletion. Controlled1µM binding75±3 versus40±3 supports increased tested binding;39±3 does not show a clear change. No universal function/health inference is made.'),
 'repair-a': ('KEEP', 'TACG template requiresATGC; mismatch atposition3 correctedA→G.30−24=6 unresolved mispairs, not automatically6 permanent mutations; positive conditions connect checking, intact template and restoration.'),
 'repair-b': ('KEEP', 'GTAC template requiresCATG;position3G→T correction. Rrestores, Ndetection alone retains the error with possible fixation on recopying. No universal repair efficiency or real frequency follows.')
}

reviews = []
for c in components:
    r = {'candidateKey': c['candidateKey'], 'canonicalGoalId': c['canonicalGoalId'], 'componentTextSHA256': objsha({n: c.get(n) for n in ['title','titleEn','description','descriptionEn','sourceScopes']}), **component_facts[c['candidateKey']], 'wholeOriginalSourceApproval': False, 'AAssessment': {'boundedKind':'ordinary assessable curricular competence candidate','rationale':'Actual cases demand explanation of relationships, classification with evidence, causal model transfer or controlled-data judgement. They are neither orientation closure nor mere recall; the per-case judgement determines adequacy.','nativeAuthorityCreated':False}, 'MemoryAssessment': {'decision':'no new native M decision','rationale':'Pairing, codes and model facts are supplied for application; success in these cases is not card/Verified-Recall evidence. This does not decide whole-goal or source-specific memory suitability, nor authorize bulk no_memory_needed.','preserveExistingMemoryEvidence':True}, 'nativeIntegrationDecision': 'BLOCK', 'nativeIntegrationReason': 'Null ID/actual native bindings unresolved' if c['canonicalGoalId'] is None else 'Supplement only; actual source/page/goal/P bindings and full source-scope gate unresolved', 'cases': []}
    for t in c['tasks']:
        key = t.get('caseId', t.get('caseKey'))
        decision, rationale = case_facts[key]
        fields = ['material','task','solution','materialEn','taskEn','solutionEn'] if 'caseId' in t else ['materialDe','promptDe','solutionDe','materialEn','promptEn','solutionEn']
        conditions = t.get('positiveEssentialPassingConditions', t.get('positiveEssentialConditions'))
        assert all(isinstance(t.get(n),str) and t[n].strip() for n in fields)
        assert conditions
        # Markdown content was actually read; ensure it is the JSON-bound content too.
        md = (AUTHOR / ('four-main-components-eight-positive-cases.author-review.md' if 'caseId' in t else 'mutation-source-components-author/bounded-components-fourteen-positive-cases.review.md')).read_text()
        assert all(t[n] in md for n in fields)
        r['cases'].append({'caseKey':key,'decision':decision,'rationale':rationale,'completeCaseSHA256':objsha(t),'reviewedAllSixDEENBodies':True,'positiveConditionsSHA256':objsha(conditions),'scientificQuantitiesAndSequenceChecked':True,'learnerPerformanceClaimed':False})
    reviews.append(r)
assert len(reviews)==11 and sum(len(x['cases']) for x in reviews)==22
write('eleven-components-twenty-two-cases.independent-a.json', {'createdAtUTC':NOW,'role':'independent A bounded source/operator/science review','componentCounts':dict(Counter(r['decision'] for r in reviews)),'caseCounts':dict(Counter(t['decision'] for r in reviews for t in r['cases'])),'components':reviews,'humanApproval':False,'newM7Credit':0})

canonical = json.loads(read(AUTHOR / 'canonical-preserved.inert-envelope.json')['preservedCanonicalUTF8'])
old = read(V3 / 'prospective-canonical.unchanged.snapshot.json')
current = read(ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
gi = {x['id']:x for x in canonical['goals']}
ci = {x['id']:x for x in current['goals']}
assert canonical == old
changed = {k: sorted(n for n in set(gi[k])|set(ci[k]) if gi[k].get(n)!=ci[k].get(n)) for k in gi if gi[k]!=ci[k]}
assert len(changed)==4 and all(v==['description','descriptionEn','resourceLinks'] for v in changed.values())
book = read(AUTHOR / 'native-preserved383.book-model.actual.json')
oldbook = read(V3 / 'prospective-native383.book-model.json')
atlas = read(AUTHOR / 'native-source-atlas.actual.receipt.json')
oldatlas = read(V3 / 'source-atlas.native-technical.actual.json')
assert book==oldbook and len(book['pages'])==383
assert atlas['scopes']==oldatlas['scopes'] and len(atlas['scopes'])==20
assert not atlas['unresolvedSourceScopes']
profiles = read(AUTHOR / 'positive-four.native-candidate-records.json')['records']
assert profiles==read(V3 / 'positive-four.native-candidate-records.json')['records']

# Independent standard-table comparison against NCBI table1, preserving its T→U alphabet convention.
aas = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG'
aa_names = dict(zip('FLSYCWPHQRIMTNKV ADEG'.replace(' ',''), ['Phe','Leu','Ser','Tyr','Cys','Trp','Pro','His','Gln','Arg','Ile','Met','Thr','Asn','Lys','Val','Ala','Asp','Glu','Gly']))
aa_names['*']='Stopp'
bases='UCAG'
table={a+b+c:aa_names[aas[i*16+j*4+k]] for i,a in enumerate(bases) for j,b in enumerate(bases) for k,c in enumerate(bases)}
assert read(AUTHOR / 'standard-code-sun.codon-data.actual.json')['codonAssignments']==table
def translate(dna):
    rna=dna.replace('T','U');return [table[rna[i:i+3]] for i in range(0,len(rna),3)]
seq_checks = {s:translate(s) for s in ['ATGGAATTTTGA','ATGGAGTTTTAA','ATGAAATGCTAG','ATGAAGTGTTGA','ATGGAATTCTAA','ATGGACTTCTAA','ATGGAGTTCTAA','GAAGGT','GACGGT']}
assert seq_checks['ATGGAATTTTGA']==['Met','Glu','Phe','Stopp']
assert seq_checks['ATGAAATGCTAG']==['Met','Lys','Cys','Stopp']
complement=str.maketrans('ATCG','TAGC')
assert 'TACG'.translate(complement)=='ATGC' and 'GTAC'.translate(complement)=='CATG'
assert 'GAA'.translate(str.maketrans('AUCG','UAGC'))=='CUU'

four_facts = {
 '0daa79f6-8f61-5506-98f9-65db83062ba8': 'KEEP bounded nucleotide/sequence/complementary-structure description and both complete positive cases. HE38 supports molecular structure separately from replication; BE/BB36 supports the new classical carrier component, not whole0daa. Existing EM-organelle predecessor is excessive as an automatic lower-stage prerequisite and is not cleared here.',
 '475eebb4-4eb0-524f-b1ec-4a672bf856d2': 'KEEP connected transcription/translation description and both positive cases. Whole-flow performance is required; the coherent process does not require an automatic atom split. Its model-onlyP does not complete the HE code-wheel and pro/euk-detail clause or BY9 genwirk trait clause without independently bound supplements.',
 'ffef97e3-12d6-5090-9816-46ab9e57fae2': 'KEEP four mutation-event types and gene-context consequences with both retained positive cases, including explicit copy-origin evidence and controlled test-function data. HE38 names these four events. BY12 protection/mutagens, body/germline and measured-function supplements must remain separately bound; molecular analysis is not automatically approved in inherited SekI views.',
 'e70d8a85-2dea-5165-919b-200fee9f4db4': 'KEEP semiconservative model and significance with both positive cases; old material versus copied information through two rounds is correct. HE38 and BY9 basic schema support this bounded competence. TH repair and BY EA PCR/repair comparison are separate obligations, not cleared by this text or image.'}
four=[]
for p in profiles:
    k=p['goalId'];four.append({'goalId':k,'descriptionDecision':'KEEP','retainedPositiveCaseDecision':'KEEP','currentWholeGoalIntegrationDecision':'BLOCK','rationale':four_facts[k],'goalObjectSHA256':objsha(gi[k]),'profileBodySHA256':objsha(p['profile']),'retainedApplicationCases':[{'id':t['id'],'bilingualBodySHA256':objsha(t),'decision':'KEEP'} for t in p['profile']['applicationCaseBriefs']],'wholeSourceApproval':False,'newNativeDApproval':False,'newPAuthority':False,'newVAuthority':False,'newM7Credit':False})
write('current-four.independent-a.json',{'createdAtUTC':NOW,'currentFour':four,'claimBoundary':'KEEP is bounded semantic/P-body retention, not strict/current/source/native approval. Existing P-body references to simplified coding sequences and supplied function data are retained; new full-short-gene assertions require clearer representation.'})

primary=[]
author_primary=read(AUTHOR / 'mutation-source-components-author/actual-primary-pages-and-clause-hashes.json')['sources']
pdfs=[('BE',ROOT/'curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Biologie_2015_11_10.pdf',[36]),('BB-byte-identical-primary',ROOT/'curricula/DE/Gymnasium/input/BB/lower-secondary/Teil_C_Biologie_2015_11_10.pdf',[36]),('HE',ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf',[38])]
pdfs += [(s['sourceKey'], ROOT/s['retainedPrimaryPath'], ([2,26] if s['sourceKey']=='TH' else []) + [a['physicalPage'] for a in s['pages']]) for s in author_primary if 'retainedPrimaryPath' in s]
for key,path,pages in pdfs:
    hashes=[]
    for pg in pages:
        data=subprocess.check_output(['pdftotext','-f',str(pg),'-l',str(pg),'-layout',str(path),'-'])
        hashes.append({'physicalPage':pg,'independentlyExtractedPageTextSHA256':sha(data),'bytes':len(data)})
    primary.append({'sourceKey':key,**fileinfo(path,'actual primary PDF content inspection'), 'pages':hashes,'fullOfficialExtractCommitted':False})

web=[]
for url in ['https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/biologie','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht','https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi','https://mb.sachsen-anhalt.de/themen/schulsystem/allgemeinbildende-schulen/gymnasium']:
    with urllib.request.urlopen(url,timeout=30) as resp:
        data=resp.read();web.append({'requestedURL':url,'actualURL':resp.url,'httpStatus':resp.status,'retrievedAtUTC':NOW,'responseSHA256':sha(data),'responseBytes':len(data),'htmlCommitted':False,'reviewMethod':'Official page also inspected with web tool; no whole-page copy stored'})
write('actual-primary-inspection.independent-a.json',{'createdAtUTC':NOW,'pdfs':primary,'officialWebReads':web,'extraCohortInspection':{'TH2024':'Actual physical2: effective2025/26 in grades7,9,11. TH9/10 content is scoped to this retained edition; no unreviewed source replacement is implied.','ST':'Actual42 explicitly says10(Einführungsphase); current ministry also calls10 the Oberstufe entry phase. Lower-secondary path/tag alone cannot settle stage.','SH':'Frozen2023 source remains outgoing/legacy only;2026 incoming content was not reviewed.'},'imageReads':[{**r,'actualRasterRead':True,'newVisualApproval':False} for r in read(AUTHOR/'visualization-final-candidate-inputs.v3.json')['records']],'codeSunActualRasterRead':True})

lanes=[]
for path in sorted((AUTHOR/'source-overlays-inert').glob('lane-*.json')):
    d=read(path);payload=d['candidatePayload'];base=ROOT/d['v3CandidatePath']
    assert payload==read(base)
    lanes.append({'path':str(path.relative_to(ROOT)),'wholeSourceClosure':d['wholeSourceClosure'],'payloadExactVsV3':True,'mappingCount':len(payload.get('mappings',[]))})
assert len(lanes)==13
held=[]
for path in sorted((AUTHOR/'source-overlays-inert').glob('lane-*.json')):
    payload=read(path)['candidatePayload']
    for m in payload.get('mappings',[]):
        if m.get('canonicalGoalId','').startswith('3417'):
            held.append({'lane':path.name,**m,'clearance':'held partial; no current independent whole-goal/stage approval'})
write('measured-preservation.independent-a.json',{'createdAtUTC':NOW,'authorFreezeSHA256':expected,'manifestVerification':verification,'canonicalWholeGoalsExactVsV3':len(gi),'changedVsActiveCurrent':changed,'otherCurrentWholeGoalsExact':len(gi)-len(changed),'protectedNIWholeGoalsExact':[k for k in gi if k.startswith(('0263','3417','747')) and gi[k]==ci[k]],'wholeBookExactVsV3':True,'wholePagesExactVsV3':len(book['pages']),'sourceScopesExactVsV3':len(atlas['scopes']),'unresolvedNativeSourceScopes':atlas['unresolvedSourceScopes'],'technicalScopeReceiptIsSubstantiveApproval':False,'originalEightPBriefsExactVsV3':sum(len(x['profile']['applicationCaseBriefs']) for x in profiles),'standardCodeAll64Exact':True,'independentSequenceTranslations':seq_checks,'numericChecks':{'Rrates':[3/1000,27/1000,6/1000],'RvsControlRatio':27/3,'Mrates':[2/1000,18/1000,17/1000],'repairInitiallyUnresolved':30-24,'temperatureAdditionalEffect':[14-8,16-10]},'thirteenInertLanes':lanes,'held3417Relations':held,'sourceVsWholeTargetGate':'Partial mapped components, new prototypes and technical visibility cannot clear whole original source/target. All wholeSourceClosure flags retained false.','compilerRerunPerformedByReviewer':False,'verificationMethod':'Independent JSON whole-object comparisons and sequence/numeric calculations; existing author native artifacts inspected, no new compiler/central-QA claim.','newCanonicalIDs':[],'newDRecords':0,'activeWrites':0,'newStrictM7Credit':0,'humanApproval':False})

matrix=read(AUTHOR/'ten-open-obligations.concrete-remediation.author-matrix.json')['concreteAuthorRows']
obligations=[]
for row in matrix:
    o=row['originalOpenObligation'];keys=row['concreteAuthorComponentKeys'];decisions={k:component_facts[k]['decision'] for k in keys}
    obligations.append({'jurisdiction':o['jurisdiction'],'sourceGoalId':o['sourceGoalId'],'originalAuthorQueueLabel':o['component'],'actualScopeCorrection':'MV actual page does not enumerate the full SN/TH molecular mutation taxonomy; do not import the broad old queue label.' if o['jurisdiction']=='DE-MV' else 'ST10 is expressly Einführungsphase; stage binding remains unresolved.' if o['jurisdiction']=='DE-ST' else None,'componentDecisions':decisions,'wholeSourceDecision':'BLOCK','reason':'Actual native binding/route/ID and strict source gate unresolved; specific REVISE components above must be corrected before clearance.','wholeSourceClosure':False})
write('ten-obligations-open-boundaries.independent-a.json',{'createdAtUTC':NOW,'obligations':obligations,'heldBoundaries':['Seven null IDs have no canonical/runtime/nativeD/P identity; zero completion credit.','MV/SN/ST/TH held3417 source obligations remain until actual independently reviewed replacement; no unsupported full NI crossing-over import.','SH2023 retains only old/outgoing content; SH2026 and wider SH stage/prerequisite scope remain unreviewed.','BYEA cancer: oncogene/anti-oncogene source component, cell-cycle/apoptosis and7f76 separate exact component/task binding remain open; existing goal additionally mentions metastasis.','BYEA PCR/repair comparison and explicit repair-method duty are not closed by two simple mismatch cases.','BY9 structural diversity on28850 remains preserved and unapproved here.','HE forward Code-Sonne source does not approve literal reverse-source obligation.'],'newM7Credit':0})

semantic_names=['README.md','four-main-components-eight-positive-cases.author-candidate.json','four-main-components-eight-positive-cases.author-review.md','mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json','mutation-source-components-author/bounded-components-fourteen-positive-cases.review.md','mutation-source-components-author/actual-primary-pages-and-clause-hashes.json','prerequisite-and-source-integration-plan.author.json','separate-real-open-source-boundaries.author.json','ten-open-obligations.concrete-remediation.author-matrix.json','eleven-components.A-M-author-rationale.json','positive-four.native-candidate-records.json','canonical-preserved.inert-envelope.json','native-preserved383.book-model.actual.json','native-source-atlas.actual.receipt.json','visualization-final-candidate-inputs.v3.json','standard-code-sun.codon-data.actual.json']
reviewed=[fileinfo(AUTHOR/n,'semantic body/content or whole-object preservation review') for n in semantic_names]
reviewed += [fileinfo(path,'inert preserved source/mapping payload content review') for path in sorted((AUTHOR/'source-overlays-inert').glob('*.json'))]
reviewed += [fileinfo(ROOT/'AGENTS.md','applicable repository instructions'),fileinfo(V3/'47-source-relations.before-after.author-candidate.json','author relation facts only; no prior reviewer conclusions')]
write('actual-reviewed-inputs.independent-a.freeze.json',{'createdAtUTC':NOW,'authorOwnFreeze':fileinfo(AUTHOR/'author-source-scope-remediation-v4.final.freeze.json','verified author63-file manifest'),'all179AuthorInputBindingsVerified':verification['actual-reviewed-inputs.author.freeze.json'],'contentReviewedFiles':reviewed,'all179InputBindings':[{**r,'reviewMode':'byte binding verification; substantive review only where separately listed'} for r in read(AUTHOR/'actual-reviewed-inputs.author.freeze.json')['files']],'primaryContentReviewReceipt':'actual-primary-inspection.independent-a.json','priorABReviewerConclusionsRead':False,'claimBoundary':'All bindings verified; this is not a claim to have semantically reviewed every unrelated asset among179 inputs.'})
print(json.dumps({'components':dict(Counter(r['decision'] for r in reviews)),'cases':dict(Counter(t['decision'] for r in reviews for t in r['cases'])),'currentFourTextKeep':len(four),'wholeSourceCurrentIntegrationApproved':0,'ownDirectory':str(OUT.relative_to(ROOT))}))
