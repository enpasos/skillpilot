import pathlib,json,hashlib,datetime,copy
R=pathlib.Path.cwd();T=R/'tmp/chemie-m7-resumed-20261016';K=T/'chemie-shared640-recycling-native-author-capsule-L6-v1';O=T/'BW-lab-aggregate-existing-child-acquisition-author-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):return {'path':str(p.relative_to(R)),'sha256':sha(p)}
def put(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
f=O/'FIRST.scientific-source-and-role-semantics.AUTHOR.frozen.json';assert sha(f)=='83ea6c8675a23928347cc06dfa624a0039a5ba3b2381bc0729aae5146ead9caa'
repl=[]
for course in ['gk','lk']:
 rel=f'curricula/DE/Gymnasium/composition-views/chemie/de-bw-{course}.view.json';src=K/rel;v=json.loads(src.read_text());before=O/'before'/f'de-bw-{course}.view.json';before.parent.mkdir(exist_ok=True);before.write_bytes(src.read_bytes())
 after=copy.deepcopy(v);after['rootNodes'][0]['children'].append({'kind':'canonicalSubtree','goalId':'266a2b2a-9ee2-52f6-ae09-59343da9a60b','projectionRole':'prerequisiteOnly'})
 restored=copy.deepcopy(after);added=restored['rootNodes'][0]['children'].pop();assert restored==v
 ap=O/'after'/f'de-bw-{course}.view.json';put(ap,after)
 repl.append({'targetPath':rel,'expectedCurrentSHA256':sha(src),'beforeWhole':pin(before),'afterWhole':pin(ap),'onlySemanticDelta':{'jsonPath':'rootNodes[0].children[append]','addedNode':added}})
cas={'documentType':'guarded-whole-file-author-candidate-CAS','schemaVersion':1,'author':'chemie_native9_fresh_independent_b_20261016','status':'AUTHOR_INACTIVE_REQUIRES_FOREIGN_QA','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Exactly two BW CrossStage views; sole aggregate prerequisiteOnly canonicalSubtree reference appended per view. All child targets and other fields retained.','scienceFirst':pin(f),'baseCanonicalSHA256':'ae53884b26285d9483b315f030216566b74fb7067e9fc962610e493aadeb3fb2','baseSemanticKindsSHA256':'23347dac27ae2d616a2334b5c30c5465c031ae177a034d6d1f7df18e2585295a','wholeFileReplacements':repl,'zeroOtherMutations':['canonical ordinary/cluster bodies','all requires','source extraction/mappings','all P profiles and materials','all cards/images','normal/capsule files']}
put(O/'CAS.two-whole-BW-views.existing-lab-aggregate-only.AUTHOR.inactive.json',cas)
from jsonschema import Draft202012Validator
schema=K/'contracts/curriculum-package/v1/composition-view.schema.json';validator=Draft202012Validator(json.loads(schema.read_text()));res=[]
for r in repl:
 for side in ['beforeWhole','afterWhole']:
  p=R/r[side]['path'];errors=[{'instancePath':list(e.path),'schemaPath':list(e.schema_path),'message':e.message} for e in validator.iter_errors(json.loads(p.read_text()))];res.append({'file':pin(p),'side':side,'errors':errors})
assert not any(x['errors'] for x in res)
put(O/'CHECK.real-stock-schema.two-views.before-after.json',{'executed':True,'checker':'python jsonschema.Draft202012Validator against actual stock complete composition-view.schema.json','schema':pin(schema),'results':res,'PASS':True})
print(json.dumps({'CAS':pin(O/'CAS.two-whole-BW-views.existing-lab-aggregate-only.AUTHOR.inactive.json'),'schemaPASS':True},indent=2))
