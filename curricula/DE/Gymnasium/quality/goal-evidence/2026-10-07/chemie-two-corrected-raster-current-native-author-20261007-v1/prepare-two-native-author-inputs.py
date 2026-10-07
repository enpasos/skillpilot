import hashlib
import json
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[7]
OWN=Path(__file__).resolve().parent
BASE=OWN.parent
V2=BASE/'chemie-b007-b014-four-current479-native-refresh-author-20261007-v2'
VIS=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-two-evidenced-particle-flow-corrections-root-author-20261007-v1'
IDS=['f0939f88-a6af-5334-ac4d-5d54732af25a','1c1420c2-a8e2-520f-8015-6df637a973bd']
def read(p):return json.loads(p.read_text())
def write(p,x):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
canonical=read(V2/'candidate/canonical.current479-four-bounded-proposals.json')
support=read(V2/'memory/arrhenius-existing-reviewed-support-node.author-proposal.json')['wholeMemoryNode']
assert support['id'] not in [g['id'] for g in canonical['goals']]
canonical['goals'].append(support)
next(g for g in canonical['goals'] if g['id']=='f97b9c87-16d0-58fd-bcb2-c51574aa36d0')['contains'].append(support['id'])
by={g['id']:g for g in canonical['goals']}
qa=read(V2/'candidate/visualization-qa.original-input.json')
for gid,file,alt in [
 (IDS[0],'f0939f88.candidate-v1.png','Ein galvanisches Zink-Kupfer-Element: Zink ist die negative Oxidationselektrode, Kupfer die positive Reduktionselektrode. Elektronen fließen im äußeren Stromkreis mit einer Lampe von Zink zu Kupfer; Nitrat-Ionen wandern in der Salzbrücke zur Zinkseite und Kalium-Ionen zur Kupferseite. Die beiden Elektrodenreaktionen zeigen Elektronenabgabe und Elektronenaufnahme.'),
 (IDS[1],'1c1420c2.candidate-v2.png','Protonenübertragung von einer Säure auf eine Base, am Beispiel HCl und Wasser mit den konjugierten Paaren HCl/Cl− und H₂O/H₃O⁺. Wasser wird mit zwei, Hydronium mit drei Wasserstoffatomen dargestellt. Zwei schematische Lösungsbilder zeigen ausdrücklich beschriftete Teilchenarten statt ungenauer Atommodelle: H₃O⁺, Cl− und H₂O sowie OH−, Na⁺ und H₂O.')]:
 dst=OWN/'selected-images'/f'{gid}.png';dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(VIS/file,dst)
 link=next(r for r in by[gid]['resourceLinks'] if r['type']=='goal-visualization')
 link.update(url=f'/assets/goal-visualizations/chemie/{gid}/{gid}.png',provider='OpenAI / ChatGPT-Codex built-in image_gen',description=alt,altText=alt,license='CC-BY-4.0',reviewStatus='pilot')
 row=next(r for r in qa['records'] if r['goalId']==gid)
 row.update(title=by[gid]['title'],description=by[gid]['description'],imageUrl=link['url'],publicAssetPath=str(dst.relative_to(ROOT)),canonicalAssetPath=str(dst.relative_to(ROOT)),assetSha256='sha256:'+hashlib.sha256(dst.read_bytes()).hexdigest(),aiApproved='no',contentApprovedChatGpt='no',aiApprovedAssetSha256='',aiNotes='Corrected author candidate only; two actual independent current reviews pending',humanApproved='no')
write(OWN/'candidate/canonical.current480-two-corrected-images-and-reviewed-support.json',canonical)
write(OWN/'candidate/visualization-qa.author-input.json',qa)
for name in ['semantic-kinds.original-input.json','review-view.original-input.json']:
 write(OWN/'candidate'/name,read(V2/'candidate'/name))
write(OWN/'selected-goals.json',{'goalIds':IDS,'role':'Two image changes only; four bounded text proposals and exact reviewed supporting memory node remain visible in complete current candidate','authorIndependentApproval':False,'humanApproval':False})
print(json.dumps({'wholeGoals':len(canonical['goals']),'selectedImageChanges':2,'activeWrites':0}))
