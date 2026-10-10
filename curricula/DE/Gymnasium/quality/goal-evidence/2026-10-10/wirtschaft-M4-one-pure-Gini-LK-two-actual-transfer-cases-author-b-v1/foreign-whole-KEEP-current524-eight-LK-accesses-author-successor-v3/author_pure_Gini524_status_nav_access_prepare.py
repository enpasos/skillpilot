import copy,hashlib,json,pathlib,shutil,tempfile
ROOT=pathlib.Path.cwd();OUT=pathlib.Path(__file__).resolve().parent
BODY=OUT.parent/'two-solutions-original-numeric-token-readability-author-successor-v2/whole-one-pure-Gini-LK.only-two-solutions-original-number-tokens.DRAFT-author-v2.json'
SCI=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-one-pure424-Gini-whole-science-independent-root-v1/actual-final-one-pure424-Gini-whole-science-independent-root-KEEP.handoff.receipt.json'
assert hashlib.sha256(BODY.read_bytes()).hexdigest()=='8ffaf960336d29d866dafb91e0ed1662af8ba4003c8db9d0a57f04aa100a930a'
assert hashlib.sha256(SCI.read_bytes()).hexdigest()=='1709fe30e899d44e28d1f1e79992cab05764aa212ac43fcc814d83f7711df539'
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def dump(name,obj):
 p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return bind(p)
cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
before=json.loads((ROOT/cp).read_text());assert len(before['goals'])==524
assert hashlib.sha256((ROOT/cp).read_bytes()).hexdigest()=='21f69578c62f6890a9c2b428800c59a19d4ac3577652c65aa5dd5a375f7f0f40'
shutil.copy2(ROOT/cp,OUT/'whole-current524.exact-before.json')
m=json.loads(BODY.read_text());newm=copy.deepcopy(m);newm['examData']['reviewStatus']='released';newm['examData']['reviewNote']='Machine curriculum QS: independently reviewed complete bilingual two-case material, root receipt1709fe30; separate human release remains pending.'
status=dump('one-foreign-whole-KEEP-Gini.only-machine-status-note.inert.json',newm)
oldnav=next(g for g in before['goals'] if g['id'].startswith('5317'));nav=copy.deepcopy(oldnav);nav['contains'].append(m['id']);nav['description']+=' Eine weitere lokale LK-Übung behandelt Lorenzkurven, Gini, Transferwirkungen und begrenzte Verteilungsurteile.';nav['descriptionEn']+=' A further local LK exercise addresses Lorenz curves, Gini, transfer effects and bounded distribution judgments.'
delta=dump('one-existing5317-only-one-child-and-bounded-DEEN-purpose.fieldwise-author.json',{'goalId':nav['id'],'beforeWhole':oldnav,'afterWhole':nav,'changedFields':['contains','description','descriptionEn'],'newOrdinaryGoalClaims':0})
can=copy.deepcopy(before);can['goals']=[nav if g['id']==nav['id'] else g for g in can['goals']];can['goals'].append(newm)
whole=dump('whole-current524-plus-one-foreign-science-Gini-and-existing-nav525.inert.json',can)
base=ROOT/'curricula/DE/Gymnasium/composition-views/wirtschaft';views=[]
for v in sorted(base.glob('*.json')):
 b=json.loads(v.read_text());shutil.copy2(v,OUT/'before-views'/v.name) if (OUT/'before-views').exists() else ((OUT/'before-views').mkdir(),shutil.copy2(v,OUT/'before-views'/v.name))
 if b.get('scope',{}).get('stage')=='CrossStage' and b['scope'].get('courseProfile')=='LK' and (not b['scope'].get('jurisdiction') or b['scope']['jurisdiction'] in m['applicability']['jurisdiction']):
  a=copy.deepcopy(b);assert len(a['rootNodes'])==1;ref={'kind':'goalEntry','goalId':m['id'],'displayLabel':m['title'],'projectionRole':'target'};a['rootNodes'][0].setdefault('children',[]).append(ref);a['viewId']='econ-'+(b['scope'].get('jurisdiction') or 'DE-DE').lower()+'-lk-pure-Gini-v1-20261010';d=dump('eight-LK-view-candidates/'+v.name,a);views.append({'activePath':str(v.relative_to(ROOT)),'before':bind(OUT/'before-views'/v.name),'after':d,'addedReference':ref,'ordinaryTargetDelta':0,'prerequisiteOnlyDelta':0})
assert len(views)==8
index=dump('actual-one-status-nav-and-eight-LK-accesses.current524-fieldwise-author-index.json',{'role':'AUTHOR_ONLY_PENDING_FOREIGN_SCOPE','foreignWholeScience':bind(SCI),'beforeCAN':bind(OUT/'whole-current524.exact-before.json'),'afterCAN':whole,'wholeNewPractice':status,'navDelta':delta,'views':views,'actualDirectAppJurisdictions':m['applicability']['jurisdiction'],'newOrdinaryGoalOrTargetSourceClaims':0,'old81d572GiniBodiesAndTagsUnchanged':True,'expectedActualScopeInstances':14,'nativeApproval':'pending actual current unchanged native probe; no author self-KEEP'})
template=pathlib.Path('/tmp/skillpilot-econ-C19-held-Gini-author-B-zq5dzdqd/capsule');cap=pathlib.Path(tempfile.mkdtemp(prefix='skillpilot-econ-pure-Gini524-author-B-'))/'capsule';shutil.copytree(template,cap,symlinks=True)
def privatecopy(src,rel):
 dst=cap/rel
 for parent in list(dst.parents)[::-1]:
  if parent==cap or cap not in parent.parents:continue
  if parent.is_symlink():parent.unlink();parent.mkdir()
 if dst.is_symlink():dst.unlink()
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
privatecopy(OUT/'whole-current524.exact-before.json',cp)
for v in base.glob('*.json'):privatecopy(v,str(v.relative_to(ROOT)))
config='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';privatecopy(ROOT/config,config)
cfg=json.loads((ROOT/config).read_text());sem=next(s['semanticKindLedgerPath'] for s in cfg['subjects'] if s.get('subject')=='wirtschaftswissenschaften');privatecopy(ROOT/sem,sem)
mapping='curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_wirtschaft_current125_source_extraction_to_canonical_wirtschaft.review.json';privatecopy(ROOT/mapping,mapping)
checker=cap/'app/scripts/generateCurriculumQualityStatus.ts';source=(ROOT/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes();assert hashlib.sha256(source).hexdigest()=='656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336';checker.write_bytes(source+b'\nexport {routeProfiles,evaluateRouteProfile,readJurisdictionCoverageByLandscapeId,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure};\n')
privatecopy(ROOT/'app/scripts/applicabilityCompiler.ts','app/scripts/applicabilityCompiler.ts')
meta=dump('actual-private-current524-code-inputs-and-eight-view-capsule.author.json',{'capsule':str(cap),'wholeFieldwiseIndex':index,'checkerProductionSHA':hashlib.sha256(source).hexdigest(),'compilerProductionSHA':hashlib.sha256((ROOT/'app/scripts/applicabilityCompiler.ts').read_bytes()).hexdigest(),'semanticLedger':bind(ROOT/sem),'mapping':bind(ROOT/mapping),'config':bind(ROOT/config),'helperKind':'Only new foreign-qualified practice ID classified practiceAssessment in own readonly scope collector; no SEM active writes or semantic self-release'})
print(json.dumps(meta))
