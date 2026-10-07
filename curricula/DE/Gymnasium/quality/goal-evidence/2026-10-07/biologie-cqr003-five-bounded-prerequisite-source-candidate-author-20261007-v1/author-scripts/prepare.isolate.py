from pathlib import Path
import os,json,hashlib,shutil
R=Path.cwd();B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cqr003-five-bounded-prerequisite-source-candidate-author-20261007-v1';T=R/'tmp/bio-cqr003-five-scope/native-repo';T.mkdir(parents=True,exist_ok=True)
for root,dirs,files in os.walk(R/'curricula'):
 dirs[:]=[d for d in dirs if d!='quality']
 for name in files:
  if not name.endswith('.json'):continue
  src=Path(root)/name;dst=T/src.relative_to(R);dst.parent.mkdir(parents=True,exist_ok=True)
  if not dst.exists():dst.symlink_to(os.path.relpath(src,dst.parent))
for rel in ['curricula/DE/Gymnasium/quality','app/src','app/node_modules','app/public','docs']:
 src=R/rel;dst=T/rel;dst.parent.mkdir(parents=True,exist_ok=True)
 if not dst.exists():dst.symlink_to(os.path.relpath(src,dst.parent),target_is_directory=True)
script=T/'app/scripts';script.mkdir(exist_ok=True)
for src in (R/'app/scripts').iterdir():
 dst=script/src.name
 if src.name in ['applicabilityCompiler.ts','generateCurriculumQualityStatus.ts']:continue
 if not dst.exists():dst.symlink_to(os.path.relpath(src,dst.parent),target_is_directory=src.is_dir())
shutil.copy2(R/'app/scripts/applicabilityCompiler.ts',script/'applicabilityCompiler.ts')
source=(R/'app/scripts/generateCurriculumQualityStatus.ts').read_text();(script/'generateCurriculumQualityStatus.ts').write_text(source+'\nexport {readJurisdictionCoverageByLandscapeId,evaluateBundeslandCoverage,readCompositionViewAtomicGoalIds};\n')
canon=B/'candidate/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json';c=json.loads(canon.read_text());g=next(g for g in c['goals'] if g['id']=='9f73b963-5fac-5a90-a993-d7b7c0cc8526');g['description']='Die lernende Person kann Mutation und Rekombination als Ursachen erblicher Variabilität beschreiben und erklären, wie Selektion über unterschiedlichen Überlebens- und Fortpflanzungserfolg die Häufigkeit erblicher Varianten in einer Population verändert.';g['descriptionEn']='The learner can describe mutation and recombination as causes of heritable variation and explain how selection through differences in survival and reproductive success changes the frequencies of heritable variants in a population.';canon.write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
for rel,src in [('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',canon),('curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_biology_lower_secondary_source_extraction_to_canonical_biology.review.json',B/'candidate/mapping/DE-TH/lower-secondary/th_biology_lower_secondary_source_extraction_to_canonical_biology.review.json')]:
 dst=T/rel
 if dst.is_symlink():dst.unlink()
 shutil.copy2(src,dst)
manifest={'technicalRole':'isolated candidate native probe only; no active apply or scientific closure','sourceCodeChanges':{'applicabilityCompiler':'byte-exact copy','qualityStatusAggregator':'byte-exact native body plus export-only access to three existing private functions; main not invoked'},'root':str(T),'nativeScriptSha256':{p:hashlib.sha256((R/p).read_bytes()).hexdigest() for p in ['app/scripts/applicabilityCompiler.ts','app/scripts/generateCurriculumQualityStatus.ts']},'activeWrites':False,'historicalWrites':False}
(B/'checks/native-probe-input-route-manifest.actual.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(T)
