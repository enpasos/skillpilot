exec(open('tmp/acid7-v4-run-stock.py').read().split('label,which')[0])
import hashlib,shutil
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14'
B=E/'chemie-acid7-current419-targeted-six-independent-b-20261014-v3';A=E/'chemie-acid7-current419-targeted-six-fresh-independent-a-20261014-v3'
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
sp=B/'FILES.finite-independent-current-six.seal.json';s=json.loads(sp.read_text())
assert sha(sp)=='sha256:fd3dcdeb2ad294b4a8c275b13dd10573e94efa9729837c965e209043c29211ee'
for row in s['files']:
 p=Path(row['path']);p=p if p.is_absolute() else R/p
 assert sha(p)==row['sha256'],str(p)
assert sha(B/'FINAL.receipt.json')=='sha256:a1a6f4cc0a748c82a6f8f696d71cf29d5b55537e4dc3da44d60747b9ba2988df'
rows=[]
for letter,root in [('a',A),('b',B)]:
 for f in (root/f'native-round-{letter}/results').iterdir():
  assert f.name.endswith(('.records.jsonl','.run.json'))
  to=O/f'native-six-current/round-{letter}/results'/f.name;shutil.copy2(f,to)
  rows.append({'source':str(f.relative_to(R)),'copy':str(to.relative_to(R)),'sha256':sha(f),'byteEqual':f.read_bytes()==to.read_bytes()})
records=[json.loads(x) for x in next((O/'native-six-current/round-a/results').glob('*.records.jsonl')).read_text().splitlines()]
assert len(records)==6 and all(x['decision']=='keep' for x in records)
spec={'schemaVersion':1,'manifestId':'chemie-acid7-six-current-successor-actual-paired-keepers-informed-20261014-v4','synthesizedBy':'Codex informed technical integrator; original A reviewer and wording proposer; current scientific votes supplied by unrelated fresh A and actual B','decisions':[{'goalId':x['goalId'],'evidenceRound':'first','rationaleDe':'Die zwei tatsächlich abgeschlossenen aktuellen Sechser-Prüfungen behalten diese aktuelle ganze Zielseite samt Kontext bei. Die informierte technische Synthese übernimmt die genuine Evidence-Fassung des unbeteiligten frischen A. Frühere revise/block-Befunde bleiben im vollständigen historischen Siebener-Container erhalten; diese Ausführung fügt keine unabhängige fachliche Stimme hinzu.','rationaleEn':'Both actually completed current six-goal reviews keep this whole current goal page and context. Informed technical synthesis selects the genuine evidence formulation from unrelated fresh A. Earlier revise/block findings remain in the complete historical seven-goal container; this execution adds no independent scientific vote.'} for x in records]}
(O/'native-six-current/synthesis-authoring.informed-six-actual-current-keeps.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
(O/'checks/D6.actual-complete-B-seal-and-full-AB-import.json').write_text(json.dumps({'checkedAtUTC':datetime.now(timezone.utc).isoformat(),'Bseal':str(sp.relative_to(R)),'BsealSha256':sha(sp),'BboundFileCount':len(s['files']),'BcallerCapacityErrorNotScientificFailure':True,'copies':rows,'fullStreamsUnmodified':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'BfilesVerified':len(s['files']),'wholeNormalResultFilesCopied':len(rows)}))
