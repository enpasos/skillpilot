"""Apply the W1 DE/EN recall cores and their native author-review records."""
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

root = Path.cwd()
base = Path(__file__).resolve().parent.relative_to(Path.cwd())
goals = json.loads((root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json').read_text())
goal_by_id = {g['id']: g for g in goals['goals']}
ids = {'B': '6ba20688-8cbf-5db1-bda8-346893798d2f', 'G': '77b44d13-4368-5950-a943-decb377c7302', 'T': '43b2c500-bbd9-5c92-9f3e-618d310e5690', 'F': '3a2accd7-639f-50e1-a7b1-5a9d3c2432a6'}
texts = {
 'B': {
  'de': ('Kräfte auf einer Linie: Wie entstehen Vorzeichen und Resultierende?', 'Für denselben Körper eine positive Richtung wählen. Die kollinearen äußeren Kräfte tragen das entsprechende Vorzeichen; $F_\\mathrm{res}=\\sum F_\\mathrm{ext}$. Bei $F_\\mathrm{res}\\ne0$ gibt das Vorzeichen die Richtung der Resultierenden an. Bei $F_\\mathrm{res}=0$ sind Ruhe und geradlinig konstante Geschwindigkeit möglich. Kraftpfeile beginnen am Körper; ihre Länge folgt dem Kraftmaßstab.'),
  'en': ('Forces along a line: how are signs and the net force determined?', 'Choose a positive direction for the same body. Give each collinear external force the appropriate sign; $F_\\mathrm{net}=\\sum F_\\mathrm{ext}$. If $F_\\mathrm{net}\\ne0$, its sign gives the net-force direction. Zero net force is consistent with rest and with constant velocity along a straight line. Force arrows start at the body; their lengths follow the force scale.')},
 'G': {
  'de': ('Gewichtskraft am Hang: Was leistet die zeichnerische Zerlegung?', 'Den Gewichtspfeil am Körper in einen zur Ebene parallelen und einen dazu senkrechten Pfeil zerlegen. Beide beginnen am selben Körper; ihre Beträge werden am Kraftmaßstab abgelesen. Ihre Vektorsumme ergibt den ursprünglichen Gewichtspfeil. Die Komponenten ersetzen die Gewichtskraft, sie kommen nicht als weitere Kräfte hinzu. Die Kontakt-Normalkraft ist eine andere Kraft.'),
  'en': ('Weight on an incline: what does a scale construction show?', 'Resolve the weight arrow at the body into a component parallel and a component perpendicular to the slope. Both start at the same body; read their magnitudes from the force scale. Their vector sum reproduces the original weight arrow. The components replace the weight in the calculation; they are not extra forces. The contact normal force is a different force.')},
 'T': {
  'de': ('Gewichtskomponenten bei Hangwinkel α zur Waagerechten und positiver Richtung hangabwärts bzw. senkrecht nach außen?', '$F_\\parallel=+F_G\\sin\\alpha$, $F_\\perp=-F_G\\cos\\alpha$. Im rechtwinkligen Kräftedreieck liegt die Parallelkomponente dem Winkel $\\alpha$ gegenüber; die senkrechte Komponente liegt an. Bei $\\alpha=0^\\circ$ ist $F_\\parallel=0$; für $\\alpha\\to90^\\circ$ geht $F_\\perp$ gegen null. Andere Achsen können die Vorzeichen ändern, nicht die physikalischen Richtungen.'),
  'en': ('Weight components for slope angle α to the horizontal, positive downhill and perpendicular outwards?', '$F_\\parallel=+F_G\\sin\\alpha$, $F_\\perp=-F_G\\cos\\alpha$. In the right triangle of force vectors, the parallel component is opposite $\\alpha$ and the perpendicular component is adjacent. At $\\alpha=0^\\circ$, $F_\\parallel=0$; as $\\alpha\\to90^\\circ$, $F_\\perp$ tends to zero. Different axes may change the signs, not the physical directions.')},
 'F': {
  'de': ('Trockene Reibung: Wann haftet der Kontakt, und welche Reibungskraft wirkt?', 'Mit dem Betrag $N$ der Kontakt-Normalkraft gilt: Haften ist möglich, solange der nötige Tangentialbetrag $F_\\mathrm{nötig}\\le\\mu_H N$ ist. Die tatsächliche Haftreibung passt sich an diesen Bedarf an und wirkt gegen drohendes Relativgleiten; Gleichheit ist noch ein möglicher Haftgrenzfall. Bei bereits gleitenden Flächen gilt $|F_R|=\\mu_G N$, entgegen ihrer Relativbewegung. Der Reibungspfeil beginnt am betrachteten Körper.'),
  'en': ('Dry friction: when can a contact stick, and which friction force acts?', 'Let $N$ be the magnitude of the contact normal force. Sticking is possible while the required tangential magnitude satisfies $F_\\mathrm{required}\\le\\mu_S N$. Actual static friction adjusts to that demand and opposes impending relative sliding; equality can still be a limiting case of sticking. For surfaces already sliding, $|F_R|=\\mu_K N$, opposite their relative motion. The friction arrow starts at the selected body.')}
}
corner = {
 'de': ('Ebene Kurve mit gegebener maximaler Haftkraft: Bedingung für rutschfreies Fahren?', 'Wenn die Haftreibung die radiale Kraft liefert, muss $\\frac{mv^2}{r}\\le F_{H,\\max}$ gelten. Dabei ist $F_{H,\\max}$ als verfügbarer Höchstwert gegeben. Bei konstantem Höchstwert folgt $v_\\max=\\sqrt{\\frac{F_{H,\\max}r}{m}}$. Die tatsächliche Haftkraft ist die benötigte Radialkraft, nicht pauschal der Höchstwert.'),
 'en': ('Level curve with a given maximum static friction force: condition for no skidding?', 'When static friction supplies the radial force, $\\frac{mv^2}{r}\\le F_{S,\\max}$ is required. Here $F_{S,\\max}$ is the given available maximum. For a constant maximum, $v_\\max=\\sqrt{\\frac{F_{S,\\max}r}{m}}$. Actual static friction is the required radial force, not automatically the maximum.')
}
changed = {}
for locale in ['de', 'en']:
 p = root / f'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.{locale}.json'
 d = json.loads(p.read_text())
 old = next(c for c in d['cards'] if c['id'] == 'physics_e_cov_041')
 old['front'], old['back'] = corner[locale]
 for key, goal_id in ids.items():
  card_id = 'physics_e2_forces_' + key.lower()
  d['cards'] = [c for c in d['cards'] if c['id'] != card_id]
  front, back = texts[key][locale]
  d['cards'].append({'id': card_id, 'front': front, 'back': back, 'originGoalIds': [goal_id], 'category': 'Mechanik' if locale == 'de' else 'Mechanics', 'tags': ['GK', 'LK', 'goal:' + goal_id]})
 p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
 changed[locale] = [c for c in d['cards'] if c['id'].startswith('physics_e2_forces_') or c['id'] == 'physics_e_cov_041']

normalize = lambda x: re.sub(r'\s+', ' ', str(x or '')).strip()
def fp(payload):
 return 'sha256:' + hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def goal_fp(g):
 return fp({'ruleVersion': 'memory-card-review-v1', 'goalId': g['id'], 'shortKey': g.get('shortKey',''), **{k: normalize(g.get(k)) for k in ['title','titleEn','description','descriptionEn']}, **{k: normalize(g.get('dimensionTags',{}).get(k)) for k in ['phase','area','topicCode']}, 'nodeKind': normalize(g.get('nodeKind'))})
def card_fp(c):
 return fp({'ruleVersion':'memory-card-review-v1', 'deckId':'de_gymnasium_physics_mechanics_ephase', 'cardId':c['id'], 'front':normalize(c['front']), 'back':normalize(c['back']), 'category':normalize(c['category']), 'tags':[normalize(t) for t in c['tags']]})
qa = root / 'curricula/DE/Gymnasium/quality/memory-card-review'
now = datetime.now(timezone.utc).isoformat().replace('+00:00','Z')
common = {'schemaVersion':1,'reviewId':'canonical-physics-full','ruleVersion':'memory-card-review-v1','landscapeId':goals['landscapeId'],'reviewedAt':now,'reviewer':'OpenAI Codex W1 media author; actual current DE/EN material inspection'}
def update_jsonl(p, rows, key):
 previous = [json.loads(x) for x in p.read_text().splitlines() if x]
 replaced = {r[key] for r in rows}
 previous = [r for r in previous if r[key] not in replaced] + rows
 p.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in previous))
goal_rows = [{**common,'goalId':gid,'fingerprint':goal_fp(goal_by_id[gid]),'status':'memory_required','memoryUseful':True,'memoryGoalIds':['9f2f5ab8-0ae4-5792-b831-82a05af5895c'],'deckIds':['de_gymnasium_physics_mechanics_ephase'],'reason':'Ein eigener knapper DE/EN-Abrufkern für die neue Kompetenz: '+{'B':'Vorzeichenbilanz und Nullresultierende.','G':'Komponenten als Ersatz derselben Gewichtskraft, Rückaddition und Unterschied zur Kontaktnormalkraft.','T':'Sinus-/Kosinuszuordnung, Achsenvorzeichen und Grenzfälle.','F':'angepasstes Haften, Gleichheit an der Grenze und getrenntes Gleitgesetz.'}[k]+' Die selbstständige Anwendung und Konstruktion bleiben Aufgabenleistungen. Tatsächliche KI-Autorenprüfung, keine unabhängige oder menschliche Freigabe.'} for k,gid in ids.items()]
update_jsonl(qa/'canonical-physics-full.review.jsonl',goal_rows,'goalId')
card_rows = [{**common,'deckId':'de_gymnasium_physics_mechanics_ephase','cardId':c['id'],'fingerprint':card_fp(c),'status':'kept','necessary':True,'originGoalIds':c['originGoalIds'],'reason':('Korrigierter Pflichtabruf ohne Reibungskoeffizient: benötigte Radialkraft mit gegebenem verfügbaren Haft-Höchstwert vergleichen; tatsächliche Kraft nicht mit Höchstwert gleichsetzen. ' if c['id']=='physics_e_cov_041' else 'Eigenständiger eng begrenzter DE/EN-Abrufkern passend zum allein genannten Verständnisziel. ')+'Beide Sprachfassungen wurden tatsächlich gelesen. Recall ist kein Nachweis freier Konstruktion, Modellwahl oder Transfer. KI-Autorenprüfung; unabhängige Prüfung folgt getrennt.'} for c in changed['de']]
update_jsonl(qa/'canonical-physics-full.cards.review.jsonl',card_rows,'cardId')
(base/'cards.actual.json').write_text(json.dumps({'schemaVersion':1,'reviewedAt':now,'cards':changed,'authorGoalReviews':goal_rows,'authorCardReviews':card_rows},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'changedLogicalCards':len(changed['de']),'localeEntries':sum(map(len,changed.values())),'newLogicalCards':len(ids)}))
