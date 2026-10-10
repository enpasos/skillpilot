import ast, copy, hashlib, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
REPO = pathlib.Path.cwd()
OUT = ROOT / 'two-solutions-original-numeric-token-readability-author-successor-v2'
OUT.mkdir(exist_ok=True)
pred = ROOT / 'whole-one-pure-Gini-LK-two-real-transfer-and-ranking-cases.DRAFT-author-v1.json'
src = ROOT / 'author_one_pure_Gini_LK_whole_material.py'
body = json.loads(pred.read_text())
originals = {}
for node in ast.parse(src.read_text()).body:
    if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name) and node.targets[0].id in ('SD', 'SE'):
        originals[node.targets[0].id] = ast.literal_eval(node.value)
assert set(originals) == {'SD', 'SE'}
candidate = copy.deepcopy(body)
records = []
for key, field in [('SD','solutionContent'),('SE','solutionContentEn')]:
    text = originals[key]
    # Recover the original numeric tokens from author literals. Never join digits
    # in the rejected product text or guess which numbers they were intended to be.
    text = re.sub(r'(?<=[a-zäöü])(?=\d)', ' ', text)
    text = re.sub(r'(?<=\d)(?=[A-Za-zÄÖÜäöü])', ' ', text)
    for old, new in [('ursprünglichesA','ursprüngliches A'), ('wieBvorher','wie B vorher'), ('erhältC','erhält C '), ('stattB','statt B '), ('vonC','von C'), ('initialA','initial A'), ('pre-transferB','pre-transfer B'), ('versusB','versus B ')]:
        text = text.replace(old,new)
    assert re.sub(r'\s','',text) == re.sub(r'\s','',body['examData'][field])
    assert not re.search(r'\d \d',text)
    candidate['examData'][field] = text
    records.append({'field':field,'sourceLiteral':key,'nonWhitespaceCharactersExact':True,'originalNumericTokensUsed':re.findall(r'\d+(?:[.,]\d+)?',originals[key]),'successorNumericTokens':re.findall(r'\d+(?:[.,]\d+)?',text)})
    assert records[-1]['originalNumericTokensUsed'] == records[-1]['successorNumericTokens']
old = copy.deepcopy(body); new = copy.deepcopy(candidate)
for field in ['solutionContent','solutionContentEn']:
    del old['examData'][field]; del new['examData'][field]
assert old == new
def dump(name, obj):
    path = OUT/name; path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n'); return {'path':str(path.relative_to(REPO)), 'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
whole = dump('whole-one-pure-Gini-LK.only-two-solutions-original-number-tokens.DRAFT-author-v2.json',candidate)
delta = dump('actual-two-original-literal-numeric-token-and-all-other-fields-exact.author.json',{'status':'AUTHOR_CANDIDATE_PENDING_FOREIGN_REVIEW','predecessorSha256':hashlib.sha256(pred.read_bytes()).hexdigest(),'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'wholeSuccessor':whole,'onlyChangedFields':['examData.solutionContent','examData.solutionContentEn'],'allOtherWholeFieldsExact':True,'noSemanticNumericFormulaScoringRequiresStatusOrScopeChange':True,'records':records})
receipt = dump('actual-two-solutions-original-number-token-only-author-successor.handoff.json',{'status':'DRAFT_PENDING_FOREIGN_TARGETED_REVIEW','wholeCandidate':whole,'actualDelta':delta,'rejectedPredecessorPreserved':True,'rootFinding':'Systematic digit separation in both solution strings; no approval claimed for predecessor','reviewScope':'Only two solution texts; whole task/rubric/Goal/P inputs unchanged; no active writes, no machine release, no native or overall gate PASS claim'})
print(json.dumps({'whole':whole,'delta':delta,'handoff':receipt},ensure_ascii=False))
