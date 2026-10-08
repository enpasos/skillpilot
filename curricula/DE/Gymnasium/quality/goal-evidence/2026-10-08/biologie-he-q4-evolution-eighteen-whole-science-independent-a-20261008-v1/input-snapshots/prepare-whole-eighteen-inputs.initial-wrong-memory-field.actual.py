from pathlib import Path
import copy, datetime, hashlib, json, shutil, subprocess

ROOT = Path.cwd()
OWN = Path(__file__).parent
IDS = '7008979d-7890-5f7b-ad07-27b8bb597cbe 002543f9-2d14-5c57-99b4-fb4bf7e53734 302c6d6d-bf10-5dbc-adda-65e4b5c63e49 0c999ebb-b4cb-5da3-90a1-69e3c6614db1 a305bb18-69a3-5d92-9cfa-abf94b2eb051 934d496d-eda4-5835-96d6-389885b93a51 c5ffd083-2596-5726-ac1c-a8e2c06c1139 80b42b5f-4b20-5035-907f-974a4a88618b 3718c6fe-0b58-5ff7-996c-25ca45b609d2 6bfcb8da-e337-5395-a50a-848f6a3abf4d 28b4ae51-e3f7-5abc-a363-022114f50f0f 9fb0a26b-abb0-505f-b92a-320b2e6290e9 0f4f3635-c0e9-517c-9a9d-1635b0d5fab5 3accc03b-3daf-5119-9f33-93af6f709919 05a4f839-6b10-581e-a942-ba4497e6a279 34b06272-e997-59af-b12b-0a5e05d7d45f 35b016d8-ed2c-570c-ab64-ac39f8f962b2 4abd762a-3c24-5909-a5d4-c8dfbcfe6275'.split()

def read(p): return json.loads(Path(p).read_text())
def write(n,x):
    p=OWN/n; assert not p.exists(), p
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def rel(p): return str(Path(p).relative_to(ROOT)) if Path(p).is_absolute() else str(p)
def snap(p):
    target=OWN/'input-snapshots'/p;target.parent.mkdir(parents=True,exist_ok=True)
    assert not target.exists(),target
    shutil.copyfile(p,target)
    return rel(target)

canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
kinds='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
extract='curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.source-extraction.json'
mapping='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.review.json'
land=read(canonical); by={g['id']:g for g in land['goals']};goals=[by[k] for k in IDS]
source=read(extract);sourceby={g['id']:g for g in source['sourceGoals']}
sourceids={g['extendedData']['provenance']['sourceGoalId'] for g in goals}
sources=[sourceby[g['extendedData']['provenance']['sourceGoalId']] for g in goals]
maps=read(mapping)
write('selected-eighteen-current-goal-ids.author.json',IDS)
write('current-eighteen-whole-DEEN-goals.actual.json',{'schemaVersion':1,'canonicalPath':canonical,'canonicalSha256':hashlib.sha256(Path(canonical).read_bytes()).hexdigest(),'wholeGoals':goals,'wholeGoalBodiesChanged':False,'authorRole':'Candidate author, not independent reviewer'})
write('eighteen-whole-normalized-source-rows-and-mappings.actual.json',{'schemaVersion':1,'warning':'These are normalized existing author-derived rows, NOT verbatim original curriculum passages. Existing officialCompetency labels require exact primary-scope review.','wholeSourceGoals':sources,'mappings':[m for m in maps['mappings'] if m['legacyGoalId'] in sourceids],'decisions':[d for d in maps['decisions'] if d['sourceGoalId'] in sourceids],'wholeParentPassages':[p for p in source['passages'] if p['id'] in {s['passageId'] for s in sources}]})
context=[]
for g in goals:
    context.append({'goalId':g['id'],'wholePrerequisites':[by[k] for k in g.get('requires',[])],'wholeContainingParents':[p for p in land['goals'] if g['id'] in p.get('contains',[])],'wholeDirectConsumers':[p for p in land['goals'] if g['id'] in p.get('requires',[])]})
write('current-eighteen-whole-parent-prerequisite-consumer-context.actual.json',{'schemaVersion':1,'contexts':context})

inputs=[canonical,kinds,extract,mapping,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','app/scripts/config/curriculum-maturity-floor-policy.json']
snapshots={p:snap(p) for p in inputs}
am={}
for lane, configpath in [('A','curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json'),('M','curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json')]:
    cfg=read(configpath);snapshots[configpath]=snap(configpath)
    raw=Path(cfg['reviewPath']).read_text().splitlines()
    selected=[r for r in raw if json.loads(r)['goalId'] in IDS];assert len(selected)==18
    target=OWN/(lane+'18.exact-retained-current.review.jsonl');assert not target.exists();target.write_text('\n'.join(selected)+'\n')
    am[lane]=[json.loads(r) for r in selected]
    cfg['landscapePath']=snapshots[canonical];cfg['reviewPath']=rel(target)
    cfg['scope']={'label':'Eighteen current HE-derived evolution content goals: exact existing decisions only, no new scientific review','leafGoalIds':IDS}
    cfg['reportPath']=rel(OWN/(lane+'18.exact-retained-current.native-report.actual.md'))
    if lane=='M':
        assert all(r['decision']=='no_memory_needed' for r in am[lane]),'Actual memory closure required'
        target=OWN/'M18.exact-retained-current.cards.review.jsonl';assert not target.exists();target.write_text('')
        cfg['cardReviewPath']=rel(target)
        for v in cfg['visibilityScopes']:
            p=v['viewPath'];snapshots[p]=snap(p);v['viewPath']=snapshots[p]
    write(lane+'18.exact-retained-current.config.json',cfg)
write('retained-eighteen-current-AM-rows-and-limits.actual.json',{'schemaVersion':1,'exactExistingA':am['A'],'exactExistingM':am['M'],'memoryRequiredAmongSelected':0,'activeCardsRequiredForSelected':0,'interpretation':'Reuse of valid unchanged goal-bound A/M decisions only; source fidelity, newly authored cases, actual independent D and V remain separate. Concrete new text patches would invalidate relevant historical A/M semantic bindings and require targeted genuine judgments.'})

proposed=copy.deepcopy(goals)
patches=[]
changes={2:{'descriptionEn':'The learner can describe the fossil record, hypothetical phylogenetic trees, and the spread of modern humans.'},16:{'description':'Die lernende Person kann Kladistik und molekulare Methoden zur Stammbaumkonstruktion anwenden.','descriptionEn':'The learner can apply cladistics and molecular methods to construct phylogenetic trees.'}}
for i,fields in changes.items():
    for field,value in fields.items():
        patches.append({'goalId':proposed[i]['id'],'field':field,'before':proposed[i][field],'after':value,'reason':'Actual phylogenetic context: family tree suggests within-family genealogy; German Stammbauerkonstruktion is an actual typo. Smallest targeted semantic wording correction; no source/learner/Human approval inferred.'})
        proposed[i][field]=value
write('proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json',{'schemaVersion':1,'originalWholeGoals':goals,'proposedWholeGoals':proposed,'patches':patches,'unchangedOtherWholeGoals':16,'activeWrites':0,'independentApprovals':0,'requiredTargetedRebindings':['Changed goal descriptions','Source-kind sourceFingerprint via genuine source/class review','Affected A/M semantic fingerprints via genuine judgments','Affected P/D/current page/context before integration']})

receipt=read(OWN/'fresh-current-index-and-two-primary-PDF-retrieval.actual.json')
receipt['indexUrl']='https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula/kerncurricula-fuer-die-gymnasiale-oberstufe-kcgo'
receipt['retrievedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
receipt['currentPdfUrl']='https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
receipt['historic2024PdfUrl']='https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
(OWN/'fresh-current-index-and-two-primary-PDF-retrieval.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
write('declared-input-snapshots.actual.json',snapshots)
print(json.dumps({'wholeGoals':18,'wholeSourceRows':18,'retainedA':len(am['A']),'retainedM':len(am['M']),'memoryRequired':0,'targetedGoalWordingPatches':len(patches),'activeWrites':0}))
