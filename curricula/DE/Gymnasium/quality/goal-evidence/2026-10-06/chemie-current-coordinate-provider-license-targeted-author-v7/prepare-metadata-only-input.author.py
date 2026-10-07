"""Two actually evidenced provider/license corrections; no active changes."""
from pathlib import Path
import datetime, hashlib, json, os, shutil, tempfile
OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
REL = OWN.relative_to(REPO).as_posix()
BASE = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/"
V6 = BASE + "chemie-current-aromatic-delocalization-final-native-author-v6/"
V4 = BASE + "chemie-current-coordinate-bond-visual-correction-author-v4/"
GID = "363c5740-8a3c-50b8-8c3a-5548c80c36ea"
def read(p): return json.loads((REPO / p).read_text())
def bind(p):
    b=(REPO / p).read_bytes()
    return {"path":p,"sha256":"sha256:"+hashlib.sha256(b).hexdigest(),"bytes":len(b)}
def write(n,v):
    p=OWN/n;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+"\n")
    return REL+"/"+n
for f in read(V6+"final-aromatic-native-author-v6.final.freeze.json")["files"]:
    assert bind(f["path"])["sha256"]==f["sha256"]
for f in read(V4+"coordinate-bond-visual-author-v4.final.freeze.json")["files"]:
    assert bind(f["path"])["sha256"]==f["sha256"]
provenance=read(V4+"actual-selected-raster-science-format-browser-provenance.author.json")
assert provenance["generator"]=="ChatGPT/Codex built-in image_gen; underlying generator model/version not reported"
assert provenance["ownKnowledgeContentLicense"].startswith("CC-BY-4.0")
assert provenance["attempts"][1]["output"]["sha256"]=="sha256:7c2c562d42d59480f71def10d700fd45fd885e1622a515ac171aff74dd0b003e"
can=read(V6+"prospective-current378.canonical.author-candidate.json")
before=json.loads(json.dumps(next(g for g in can["goals"] if g["id"]==GID)))
after=next(g for g in can["goals"] if g["id"]==GID)
link=next(l for l in after["resourceLinks"] if l["type"]=="goal-visualization")
assert link["provider"]=="Google Gemini / Nano Banana Pro"
assert link["license"]=="AI-generated, SkillPilot-curated"
link["provider"]="ChatGPT/Codex builtin image generation"
link["license"]="CC-BY-4.0"
canonical_path=write("prospective-current378.canonical.metadata-only.author-candidate.json",can)
kinds=read(V6+"prospective-current378.semantic-kinds.author-input.json")
kinds["sourceLandscapePath"]=canonical_path
kind_path=write("prospective-current378.semantic-kinds.exact-decisions.author-input.json",kinds)
cfg=read(V6+"full-prospective378.book.config.json")
cfg.update(landscapePath=canonical_path,semanticKindLedgerPath=kind_path,outputPath=REL+"/qa-artifacts/full-prospective378.book-model.json")
write("full-prospective378.book.config.json",cfg)
write("two-resource-metadata-fields.raw-author-input.json",{"schemaVersion":1,"documentType":"inert-author-source-metadata-only-input","goalId":GID,"beforeWholeGoal":before,"prospectiveWholeGoal":after,"literalFieldDeltas":[{"path":"resourceLinks/0/provider","before":before["resourceLinks"][0]["provider"],"after":link["provider"]},{"path":"resourceLinks/0/license","before":before["resourceLinks"][0]["license"],"after":link["license"]}],"actuallyReadGeneratorAndLicenseReceipt":bind(V4+"actual-selected-raster-science-format-browser-provenance.author.json"),"actualGenerator":provenance["generator"],"underlyingGeneratorModelVersionNotInvented":True,"actuallyReadOwnContentAllocation":bind("LICENSING.md"),"actualSelectedGeneratorOutput":bind(provenance["attempts"][1]["output"]["path"]),"generatorProvenanceIsNotOwnershipProof":True,"noIndependentScienceVerdict":True,"activeWrites":False,"strictNetGain":0})
iso=Path(tempfile.mkdtemp(prefix="skillpilot-chemie-coordinate-metadata-v7-"))
def cp(src,dst):
    p=iso/dst;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(REPO/src,p)
def symlink(src,dst):
    p=iso/dst;p.parent.mkdir(parents=True,exist_ok=True);p.symlink_to(os.path.relpath(REPO/src,p.parent))
for p in (REPO/"app/scripts").iterdir():
    if p.is_file():cp(p.relative_to(REPO).as_posix(),p.relative_to(REPO).as_posix())
for p in ["app/scripts/config","app/src","app/node_modules","curricula","contracts","docs","scripts"]:symlink(p,p)
cp("app/package.json","app/package.json")
images={
"b8d3b453-d638-5518-aab0-d84ec2e8567c":BASE+"chemie-current-atomic-description-positive-gap-author-v2/visual-candidates/b8/attempt-01.png",
"973c12d9-d863-5292-8c68-9c80cdacf9e2":BASE+"chemie-current-atomic-description-positive-gap-author-v2/visual-candidates/carbonyl/attempt-01.png",
GID:V4+"visual-candidate/attempt-02.png"}
for p in (REPO/"app/public/assets/goal-visualizations/chemie").iterdir():
    if p.name not in images:symlink(p.relative_to(REPO).as_posix(),p.relative_to(REPO).as_posix())
for id,source in images.items():cp(source,"app/public/assets/goal-visualizations/chemie/"+id+"/"+id+".png")
for p in (REPO/"app/public/data").iterdir():
    if p.name=="de_gymnasium_chemistry_flashcards_organic_q1.de.json":cp(BASE+"chemie-current-four-native-atomicity-memory-integration-preparation-author-v1/organic-q1-deck.one-reviewed-card.author-candidate.json",p.relative_to(REPO).as_posix())
    else:symlink(p.relative_to(REPO).as_posix(),p.relative_to(REPO).as_posix())
root_positive=BASE+"chemie-current-fifteen-positive-reviewed-bindings-v1/"
positive_config=read(root_positive+"positive.eight.current-reviewed-bindings.config.json")
selected_line=next(l for l in (REPO/positive_config["reviewPath"]).read_bytes().splitlines(keepends=True) if json.loads(l)["goalId"]==GID)
(OWN/"positive.coordinate-one.exact-reviewed-record.jsonl").write_bytes(selected_line)
positive_config.update(landscapePath=canonical_path,semanticKindLedgerPath=kind_path,reviewPath=REL+"/positive.coordinate-one.exact-reviewed-record.jsonl")
positive_config["scope"]={"label":"One actual source-metadata-only correction; exact previously independently reviewed science/status preserved","goalIds":[GID]}
write("positive.coordinate-one.exact-reviewed-record.config.json",positive_config)
write("temporary-isolated-root.metadata-only.author.json",{"schemaVersion":1,"documentType":"inert-author-new-temporary-metadata-root","createdAtUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"isolatedRootUsed":str(iso),"canonicalPath":canonical_path,"kindPath":kind_path,"all3ActualPngs":{id:bind(path) for id,path in images.items()},"priorV6RootNotMutated":True,"activeWrites":False})
print(json.dumps({"isolatedRoot":str(iso),"goalId":GID,"providerAndLicenseOnly":True}))
