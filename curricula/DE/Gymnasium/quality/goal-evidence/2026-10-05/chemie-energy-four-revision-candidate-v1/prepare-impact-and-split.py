"""Read current public inputs and write only inactive artifacts in this directory."""
import copy
import hashlib
import json
import uuid
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parent
REPO = OUT.parents[6]
def read(rel): return json.loads((REPO / rel).read_text())
def sha(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def dump(name, data):
    p = OUT / name
    assert p.resolve().is_relative_to(OUT)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def ledger(rel): return [json.loads(x) for x in (REPO/rel).read_text().splitlines() if x.strip()]
def refs(data, goalid, pointer=''):
    found=[]
    if isinstance(data,dict):
        if data.get('goalId')==goalid: found.append({'pointer':pointer,'kind':data.get('kind'),'projectionRole':data.get('projectionRole','target')})
        for k,v in data.items():found.extend(refs(v,goalid,pointer+'/'+str(k)))
    elif isinstance(data,list):
        for i,v in enumerate(data):found.extend(refs(v,goalid,pointer+'/'+str(i)))
    return found

CANONICAL='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical=read(CANONICAL); goals={g['id']:g for g in canonical['goals']}
descriptions=read(str((OUT/'description-decisions.candidates.json').relative_to(REPO)))
ids=[g['goalId'] for g in descriptions['goals']]
parentid='8ceb1749-fce0-584f-a2b8-0a309282329a'
atlas='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
atlasdata=read(atlas)
mapping_rows={}
for rel in atlasdata['mappingPaths']:
    d=read(rel)
    for gid in ids+[parentid]:
        hits=[m for m in d.get('mappings',[]) if m.get('canonicalGoalId')==gid]
        if hits:
            mapping_rows.setdefault(gid,[]).append({'path':rel,'fileDigest':sha(REPO/rel),'sourceExtractionPath':d.get('sourceExtractionPath'),'mappings':hits,'decisions':[v for v in d.get('decisions',[]) if gid in v.get('canonicalGoalIds',[])]})
A='curricula/DE/Gymnasium/quality/semantic-atomicity/chemie-energy13-current-20261005-v1/canonical-chemistry-ephase-fossil-fuels.review.jsonl'
M='curricula/DE/Gymnasium/quality/memory-card-review/chemie-energy13-current-20261005-v1/canonical-chemistry-full.review.jsonl'
CARDS='curricula/DE/Gymnasium/quality/memory-card-review/chemie-energy13-current-20261005-v1/canonical-chemistry-full.cards.review.jsonl'
V='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
K='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
batch='curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-04/batch-011-ephase-fuels-energy-current-13-v1'
review=read(batch+'/bundle/review-input.json')
byid={p['page']['goalId']:p for p in review['pages']}
a={r['goalId']:r for r in ledger(A)};m={r['goalId']:r for r in ledger(M)}
cardrows=ledger(CARDS)
v={r['goalId']:r for r in read(V)['records']};k={r['goalId']:r for r in read(K)['decisions']}

alt={
ids[0]:'Zwei Kohlenwasserstoffe werden bei vollständiger Verbrennung auf derselben Massenbasis verglichen. Die dargestellten Modell-Brennwerte beziehen sich auf ein Kilogramm Brennstoff und flüssiges Produktwasser; sie sind keine Nutzwärme- oder vollständige Klimabilanz.',
ids[1]:'Übersicht über Erdöl als Ausgangsstoff für Kraftstoffe, Kunststoffe, Schmierstoffe und weitere Anwendungen sowie unterschiedliche Umweltpfade. Die Symbole verknüpfen Verwendung und mögliche Folgen; ein begründetes Nutzen-Umwelt-Urteil benötigt konkrete Falldaten. Langlebigkeit allein verursacht keine Freisetzung, sondern kann bei Verlust oder schlechter Entsorgung zur Persistenz beitragen.',
ids[2]:'Zwei geschlossene Reaktionssysteme: links ein starres Gefäß bei konstantem Volumen ohne Volumenarbeit, rechts ein beweglicher Kolben bei konstantem Druck mit Volumenarbeit. Die dargestellten Beziehungen Q_V = ΔU und Q_p = ΔH gelten für ausschließlich Volumenarbeit, ohne elektrische oder sonstige Arbeit; U und H sind Zustandsgrößen, ΔU und ΔH deren Änderungen. Die Teilchensymbole stellen keine benannte Reaktionsgleichung dar.',
ids[3]:'Symbolische Gegenüberstellung einer exothermen und einer endothermen Reaktion: Bindungen zu lösen kostet Energie, Bindungen zu bilden setzt Energie frei. Die Produkt- und Eduktlagen werden jeweils relativ innerhalb derselben Reaktion verglichen. Plattformen, farbige Kugeln, Münzen und Waagen sind qualitative Metaphern ohne Atom- oder Mengenlegende. Die zentrale Summenschreibweise ist ein vereinfachtes gasförmiges Bindungsbudget mit mittleren Werten, keine allgemein exakte Messgleichung; Phase und zwischenmolekulare Beiträge benötigen zusätzliche Daten.'
}
plans=[]
for proposal in descriptions['goals']:
    gid=proposal['goalId']; g=goals[gid]
    link=next(x for x in g['resourceLinks'] if x['type']=='goal-visualization')
    src=Path('curricula/DE/Gymnasium/visualizations/chemie')/gid/(gid+'.jpg')
    im=Image.open(REPO/src)
    copies=[str(src),'app/public'+link['url'],'backend/src/main/resources/static'+link['url']]
    imageinfo={'decision':'focused_correction_candidate' if gid==ids[0] else 'KEEP_candidate_with_documented_context','assetPaths':copies,'actualSourceDimensions':list(im.size),'actualAssetDigests':{p:sha(REPO/p) if (REPO/p).is_file() else None for p in copies},'storedQaRecord':v[gid],'nativeViewed':True,'width360Viewed':True,'width680Viewed':True,'previewPaths':[str((OUT/'inspection-previews'/f'{gid}.width-{w}.png').relative_to(REPO)) for w in [360,680]],'candidateAltText':alt[gid],'newPixelAssetGeneratedByThisPreparation':False,'independentVReview':'pending; preserve historical reviews, do not rewrite them into current approval'}
    plans.append({'goalId':gid,'descriptionProposal':proposal,'canonicalFieldsAffected':['description','descriptionEn','resourceLinks[primary,de].altText'],'topologyChangeForFourGoalPass':False,'requiresCurrent':g.get('requires',[]),'directContainsParents':[x['id'] for x in canonical['goals'] if gid in x.get('contains',[])],'directDependentContextGoalIds':[x['id'] for x in canonical['goals'] if gid in x.get('requires',[])],'boundHistoricalPage':byid[gid]['page'],'sourceMappingsCurrent':mapping_rows.get(gid,[]),'sourceDisposition':'Recheck named HE/BY scope against revised text; retain unchanged source inputs, immutable history and unrelated mappings. No inference from raw applicability to exact source coverage.','semanticKind':{'path':K,'currentDecision':k[gid],'action':'Keep curricularAtomic meaning; recalculate current source fingerprint under existing contract after text change, with an explicit decision receipt.'},'A':{'path':A,'currentRecord':a[gid],'action':'One causal competence remains; document substantive continued atomicity and bind to revised semantic fields, rather than copy a fingerprint.'},'M':{'path':M,'currentRecord':m[gid],'candidateStatus':'no_memory_needed','rationale':'Reasoning from supplied reaction/data/model/application information is central; no new compact item requires uncued recall.','action':'Retain the substantive no-memory rationale after local review, bind to new semantic fingerprint. No new memory goal/deck/card.'},'cards':{'path':CARDS,'directOriginRecords':[r for r in cardrows if gid in r.get('originGoalIds',[])],'action':'No direct origin card found; active decks and unrelated kept cards need no content mutation.'},'image':imageinfo,'D_P_rebinding':{'ownGoalFingerprint':'changes after description edit','ownPageFingerprint':'changes after description/alt and, for 8ece, image change','sourceFingerprint':'recompute actual changed bindings only','contextFingerprint':'build fresh current bundle; compare named prerequisite/dependent contexts before choosing carry-forward or successor records','review': 'Two independent substantive D/P reviews of final descriptions/profiles; source/image issues remain explicitly separate from profile quality.','doNotClaim':'No human approval, practical learner evidence, runtime integration or M7 completion is established by this preparation.'}})
dump('four-source-binding-impact-plan.json',{'schemaVersion':1,'status':'inactive_author_candidate','canonicalInputDigest':sha(REPO/CANONICAL),'atlasInputPath':atlas,'atlasInputDigest':sha(REPO/atlas),'currentAtlasSubsetBoundary':{'expectedCurricularAtomicGoalCount':atlasdata['expectedCurricularAtomicGoalCount'],'expectedUnresolvedScopeDecisionCount':atlasdata['expectedUnresolvedScopeDecisionCount'],'interpretation':'Publication source subset and unresolved scopes remain separate from the full canonical Chemistry denominator.'},'goals':plans})

# Stable IDs extend the evidenced existing UUIDv5 convention, with documented new suffixes.
ns=uuid.UUID('fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb')
landscape=canonical['landscapeId']
specs=[('fractional-distillation-physical-separation','5db9ba57-6a80-56db-8b9d-e8ca4ac41855','canonical_chemistry_fractional_distillation_physical_separation','Fraktionierte Destillation von Erdöl erklären','Explain fractional distillation of petroleum','Die lernende Person kann die fraktionierte Destillation von Erdöl als physikalische Trennung nach unterschiedlichen Siedebereichen erklären, typische Fraktionen zuordnen und begründen, warum dabei die Kohlenwasserstoffmoleküle unverändert bleiben.','The learner can explain fractional distillation of petroleum as physical separation by different boiling ranges, assign typical fractions and explain why the hydrocarbon molecules remain unchanged.'),('thermal-cracking-chemical-conversion','7c22f436-e550-5b0b-85ae-a073b0c50418','canonical_chemistry_thermal_cracking_chemical_conversion','Thermisches Cracken erklären','Explain thermal cracking','Die lernende Person kann thermisches Cracken als chemische Umwandlung längerer Kohlenwasserstoffmoleküle erklären und typische kürzere Produkte, darunter Alkane und Alkene, anhand eines einfachen Molekülmodells zuordnen.','The learner can explain thermal cracking as the chemical conversion of longer hydrocarbon molecules and use a simple molecular model to assign typical shorter products, including alkanes and alkenes.')]
children=[]; uuids=[]
for suffix,gid,short,title,titleen,desc,descen in specs:
    seed=f'chemistry:{landscape}:{parentid}:{suffix}'
    assert str(uuid.uuid5(ns,seed))==gid and gid not in goals
    g=copy.deepcopy(goals[parentid]);g.update({'id':gid,'shortKey':short,'title':title,'titleEn':titleen,'description':desc,'descriptionEn':descen,'contains':[],'type':'atomic','weight':0.45,'resourceLinks':[]})
    # Only HE source clauses were reviewed for these child mechanisms here.
    # Other states require their own source/placement evidence before expansion.
    g['applicability']={'jurisdiction':['DE-HE']}
    # Both independent mechanisms inherit the existing source/context prerequisite.
    g['extendedData']['provenance'].update({'splitFromCanonicalGoalId':parentid,'splitSourceClause': 'fraktionierte Destillation' if suffix.startswith('fractional') else 'Cracken'})
    children.append(g);uuids.append({'goalId':gid,'namespace':str(ns),'seed':seed,'status':'candidate stable semantic suffix, not preexisting child-seed convention','mechanismEvidence':'scripts/adopt_hessen_upper_secondary_into_canonical.py:17,225,1265'})
newparent=copy.deepcopy(goals[parentid]);newparent.update({'type':'cluster','contains':[g['id'] for g in children],'requires':[]})
# Preserve sum of ordinary descendant weights (0.9), pending explicit product weighting review.
newparent['description']='Die lernende Person kann die Gewinnung und Verarbeitung von Kohlenwasserstoffen aus Erdöl über fraktionierte Destillation und thermisches Cracken einordnen.'
newparent['descriptionEn']='The learner can place the separation and processing of petroleum hydrocarbons through fractional distillation and thermal cracking in context.'
incoming=[]
for g in canonical['goals']:
    if parentid in g.get('requires',[]):
        new=[]
        for r in g['requires']: new.extend([c['id'] for c in children] if r==parentid else [r])
        incoming.append({'goalId':g['id'],'title':g['title'],'beforeRequires':g['requires'],'afterRequires':list(dict.fromkeys(new)),'rationale':'Conservative preservation of existing combined dependency on both mechanisms; any narrowing needs separate didactic evidence.'})
viewimpacts=[]
for base in ['curricula/DE/Gymnasium/composition-views/chemie','app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas','app/scripts/config/goal-books/navigation']:
    for p in (REPO/base).glob('*.json'):
        found=refs(json.loads(p.read_text()),parentid)
        if found:viewimpacts.append({'path':str(p.relative_to(REPO)),'references':found,'action':'Review goalEntry-to-cluster behavior; explicitly expose target children, for example canonicalSubtree at the preserved parent. Do not infer child role/scope from phase or raw all-state applicability.'})
dump('split-8ceb.graph-delta.candidates.json',{'schemaVersion':1,'status':'inactive_structural_author_candidate','inputCanonicalDigest':sha(REPO/CANONICAL),'reason':'Both independent D rounds split_review and both P reviews HOLD identify two separately assessable mechanisms; no title-only repair can remove this structural defect.','parentBefore':goals[parentid],'parentAfterCandidate':newparent,'childCandidates':children,'uuidReceipts':uuids,'weighting':'Candidate uses 0.45 per child and existing parent 0.9 to preserve the prior total ordinary weight. This is an explicit proposal, not a normative chemistry weight rule; decide weighting before integration.','incomingRequiresCandidates':incoming,'directContainsParents':[g['id'] for g in canonical['goals'] if parentid in g.get('contains',[])],'sourceMappingsCurrent':mapping_rows.get(parentid,[]),'truthfulSourceCandidate':{'HE_SekII':'E.4#B02A01 each child partial: fractional-distillation child covers fraktionierte Destillation, cracking child covers Cracken; their union covers the processing procedures in this bullet. Parent source binding becomes aggregate, never proof of one atomic child.','HE_SekI':'10.4#B01A01 remains partial: broader formation, processing, use, gasoline boiling analysis and fuel-comparison clauses are not all covered by this split.','BY':'No direct active BY raw or extraction mapping to current parent found. BY petroleum-use/environment source for b95 does not explicitly name these processes. Do not create BY exact child claims from raw applicability.','otherStates':'Mappings and fallback views listed are routing witnesses requiring clause-specific review; no blanket promotion of parent mappings to exact children.'},'viewImpacts':viewimpacts,'semanticKindCandidates':{'parent':'curricularArea','children':{'5db9ba57-6a80-56db-8b9d-e8ca4ac41855':'curricularAtomic','7c22f436-e550-5b0b-85ae-a073b0c50418':'curricularAtomic'},'ledgerPath':K},'A_M_candidates':{'APath':A,'existingParentA':a[parentid],'parentAction':'Combined parent leaves ordinary-leaf A denominator. Preserve conflicting historical atomic record as history; new children need independent substantive atomicity decisions with current fingerprints.','MPath':M,'existingParentM':m[parentid],'childrenStatusCandidate':'no_memory_needed','childrenReason':'Causal separation/conversion and molecule-model reasoning, not uncued fraction-name or fixed-equation recall.','cardOriginRecords':[r for r in cardrows if parentid in r.get('originGoalIds',[])],'memoryDeckAction':'No new cards/decks justified; parent ceases to be an ordinary content leaf. Recheck children and configured visibility if any memory_required decision emerges.'},'image':'KEEP exact existing source/frontend/backend JPG bytes and resourceLinks on surviving parent as qualitative aggregate overview. Child PNGs need distinct actual generation and independent native/360/680 QA; prompts are drafts only.','bookAndQA':'Parent page becomes chapter context; add two ordinary child pages. Recheck direct/reverse link destinations, chapter tree, source projections, semantic counts, affected D/P/A/M/V binding and central gates after integration. Atlas subset 358 is not automatically incremented.','masteryAndRuntime':'Preserve historical parent-ID learner state as history; it cannot independently prove mastery of either new child. Parent becomes derived cluster progress. Validate compatibility handling and frontier against new atomic prerequisites before active rollout.','authorization':'No active graph, source mappings, semantic ledger, registry, memory deck, visualization asset or rollout configuration was written.'})
print('Prepared impact plan for',len(plans),'goals and split with',len(children),'children;',len(viewimpacts),'direct view files.')
