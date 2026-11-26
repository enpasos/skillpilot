#!/usr/bin/env python3
"""K4 authoring source and expected marks. Never supply this file to blind markers."""
import csv
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parents[1]
REL = 'curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/k4/v1'
GOAL = 'b77a7e93-22f9-5722-a4cc-f18a149ab030'
EXAM = '2569d84a-5bf1-542b-bc43-6ade1df971c4'
ROOT = next(p for p in BASE.parents if (p / 'LICENSING.md').exists())

def save(rel, value):
    p = BASE / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

task_de = '''Zwei kleine Körper A und B sind in einer Momentaufnahme als Punkte dargestellt: A bei x = 0 m, B bei x = 3 m rechts davon. Alle Geschwindigkeiten beziehen sich auf den ruhenden Boden.

Für Skizze I gilt: Ortsmaßstab 1 cm ≙ 1 m. Ein als v_A beschrifteter Geschwindigkeitspfeil beginnt bei A und ist 3 cm nach rechts lang. Sein eigener Pfeilmaßstab lautet 1 cm ≙ 2 m/s. Die gezeichnete Spitze fällt dadurch scheinbar auf B.

1. Lies ab: Zu welchem Körper gehört der Pfeil, in welche Richtung weist seine Geschwindigkeit und welchen Betrag mit Einheit hat sie? Zeige, wie du den Betrag abliest.
2. Zeichne beide Skizzen lesbar, auf Papier oder digital, mit markierten Körpern und beschrifteten Maßstäben. Skizze II zeigt denselben Augenblick und dieselbe Geschwindigkeit. Nur der Pfeilmaßstab wechselt zu 1 cm ≙ 3 m/s; der Ortsmaßstab bleibt gleich. Bestimme und zeichne die neue Pfeillänge. Eine reine Textbeschreibung ersetzt die Zeichnung nicht; ein angegebener Rastermaßstab ist zulässig.
3. Sage voraus, ob die Spitze in II noch auf B fällt. Erkläre, was die scheinbare Berührung in I aussagt, was der Pfeil über einen Ort von A aussagt und was sich physikalisch beim Wechsel des Pfeilmaßstabs ändert. Unterscheide Ortsmaßstab und Geschwindigkeitspfeilmaßstab.'''

task_en = '''Two small objects A and B are represented as points in one snapshot: A at x = 0 m and B at x = 3 m to its right. All velocities are relative to the stationary ground.

For sketch I, the position scale is 1 cm ≙ 1 m. A velocity arrow labelled v_A starts at A and is 3 cm long towards the right. Its own arrow scale is 1 cm ≙ 2 m/s. The drawn tip therefore appears to coincide with B.

1. Read the arrow: To which object does it belong, which way is its velocity directed, and what is its magnitude with unit? Show how you read the magnitude.
2. Make legible drawings of both sketches, on paper or digitally, with the objects marked and the scales labelled. Sketch II represents the same instant and the same velocity. Only the arrow scale changes to 1 cm ≙ 3 m/s; the position scale stays the same. Find and draw the new arrow length. A text description alone does not replace the drawing; a stated grid scale is acceptable.
3. Predict whether the tip still coincides with B in II. Explain what the apparent contact in I means, what the arrow says about a position of A, and what changes physically when the arrow scale changes. Distinguish the position scale from the velocity-arrow scale.'''

answer_de = '''Der Pfeil gehört zu A; die Geschwindigkeit relativ zum Boden weist nach rechts. Aus 3 cm · (2 m/s)/cm folgen 6 m/s. In beiden Zeichnungen startet v_A am Punkt A; A und B bleiben 3 cm auseinander. Legenden: Ort 1 cm ≙ 1 m; v_A in I 1 cm ≙ 2 m/s, in II 1 cm ≙ 3 m/s. Der neue Pfeil ist (6 m/s)/((3 m/s)/cm) = 2 cm lang und weist weiter nach rechts.

In II endet die gezeichnete Spitze 1 cm vor B. Ihr scheinbares Zusammentreffen mit B in I ist eine Folge des Pfeilmaßstabs und zeigt weder Berührung noch einen jetzigen oder zukünftigen Ort von A an. Der Pfeil stellt eine Geschwindigkeit in m/s dar, keine Strecke in m. Nur die gezeichnete Länge und Spitze ändern sich; Körperorte, Abstand, Richtung und Geschwindigkeitsbetrag bleiben gleich. Für einen zukünftigen Ort wäre zusätzlich eine Zeitangabe und ein Bewegungsmodell nötig.'''
answer_en = '''The arrow belongs to A; its velocity relative to the ground points right. The magnitude is 3 cm · (2 m/s)/cm = 6 m/s. In both drawings v_A starts at point A; A and B stay 3 cm apart. Legends: position 1 cm ≙ 1 m; v_A in I 1 cm ≙ 2 m/s and in II 1 cm ≙ 3 m/s. The new arrow is (6 m/s)/((3 m/s)/cm) = 2 cm long, still pointing right.

In II the drawn tip ends 1 cm short of B. Its apparent coincidence with B in I comes from the arrow scale and establishes neither contact nor a present or future position of A. The arrow represents velocity in m/s, not distance in m. Only its drawn length and tip change; object positions, separation, direction and speed stay the same. Predicting a future position would additionally need a time and a motion model.'''

policy_de = '''Vier tragende Leistungen zu je 3 P; bestanden allein ab 10/12 P. Belege überall in Text und tatsächlicher Zeichnung werten, auch bei gleichwertiger Rasterdarstellung. Eine bloße Zeichnungsbeschreibung erhält nur die ausdrücklich vorgesehenen Textpunkte. Aus dem richtigen Endwert keine fehlende Leistung ergänzen. Die Einzelanteile sind unabhängig; keine zusätzliche Bestehenssperre.

Ein nachweislich isolierter kleiner Rechen-, Zeichen-, Einheiten- oder Beschriftungsfehler bei sichtbar richtigem Kern kostet höchstens 0,5 P einmal an seinem Ursprung; seine konsistenten Folgen nicht erneut belasten. Verschiedene unabhängige kleine Fehler dürfen je 0,5 P kosten. Eine ausdrücklich beibehaltene fachliche Fehlvorstellung setzt die betroffene ganze Leistung auf 0, auch neben richtigen Angaben. Eine ausdrückliche Rücknahme im selben Text löst den Widerspruch. Fehlende Belege erhalten Teilpunkte nach Raster, keinen zusätzlichen Abzug. Bereits bewertete falsche Prämissen nicht in anderen Leistungen erneut abziehen; dort zählt die tatsächlich gezeigte Weiterarbeit.'''
policy_en = '''Four carrying performances have 3 points each; the total alone passes at 10/12. Credit evidence anywhere in the text and actual drawing, including equivalent stated grid scales. A mere drawing description earns only the specified text credit. Do not infer missing performances from a correct final value. The allocations are independent; there is no extra pass condition.

A demonstrably isolated minor arithmetic, drawing, unit or label slip with visibly sound core reasoning costs at most 0.5 once at its origin; do not deduct again for consistent consequences. Distinct independent minor slips may each cost 0.5. An explicit maintained misconception sets the entire affected performance to 0, even alongside correct statements. Explicit retraction in the same response resolves the contradiction. Missing evidence receives the rubric's partial credit with no extra deduction. Do not charge an already scored wrong premise again in other performances; assess the actual follow-through there.'''

steps = [
    {'id':'A','points':3,'description':
     'Träger und Ansatz: 1 P für die eindeutige Zuordnung der Geschwindigkeit zu A (Text oder v_A); 2 P für den sichtbaren Pfeilanfang bei A in beiden tatsächlichen Zeichnungen, je 1 P. Ohne Zeichnungen höchstens 1 P. Eine bloße Endspitze bei B ordnet den Pfeil nicht B zu. Aufrechterhaltene Aussage, der Geschwindigkeitspfeil gehöre B oder dürfe in der Ortsskizze beliebig beginnen: A = 0. Ein bereits hier bewerteter falscher Ansatzpunkt kostet in B/C keine Folgepunkte. Gemeinsame Fehlerregel anwenden. / EN: Carrier and origin: 1 for unambiguously assigning the velocity to A (text or v_A); 2 for visible arrow origins at A in both actual drawings, 1 each. Without drawings, at most 1. A tip at B does not assign the arrow to B. A maintained claim that the velocity arrow belongs to B or may start anywhere in the position sketch sets A to 0. Do not charge an origin error already assessed here again in B/C. Apply the shared slip policy.'},
    {'id':'B','points':3,'description':
     'Richtung: 1 P für das Lesen „Geschwindigkeit von A relativ zum Boden nach rechts“, auch durch eindeutige Beschriftung in der Zeichnung; 2 P für tatsächlich nach rechts gerichtete Pfeile, je 1 P in I und II. Ohne Zeichnungen höchstens 1 P. Die Zeichnung braucht eine erkennbare Pfeilspitze, keine besondere Pfeilform. Aufrechterhaltene systematische Verwechslung von Richtung und Gegenrichtung: B = 0. Ein nachweislich einzelner verkehrt gesetzter Pfeilkopf bei sonst eindeutig richtigem Kern ist ein Zeichenfehler nach gemeinsamer Regel, kein automatischer Verlust aller Richtungspunkte. / EN: Direction: 1 for reading A\'s velocity relative to the ground as rightwards, including an unambiguous drawing label; 2 for actual rightward arrows, 1 in I and 1 in II. Without drawings, at most 1. An identifiable arrowhead is needed, no particular style. A maintained systematic reversal of direction sets B to 0. One demonstrably misplaced arrowhead with otherwise clear correct reasoning is a drawing slip under the shared policy, not an automatic loss of all direction credit.'},
    {'id':'C','points':3,'description':
     'Betrag und Maßstäbe: je 1 P für (i) Ablesen 3 · 2 = 6 m/s oder gleichwertigen exakten Term, (ii) Berechnen 6/3 = 2 cm und dazu passende tatsächliche zweite Pfeillänge, (iii) getrennte, beschriftete Orts- und Geschwindigkeitspfeilmaßstäbe mit m bzw. m/s in den Darstellungen. Bei (ii) nur richtige Rechnung/Längenangabe ohne passende Zeichnung: 0,5 P. Einheiten/Legenden nur isoliert ausgelassen oder verschrieben bei sichtbarer Unterscheidung: gemeinsamer Formfehler höchstens −0,5 einmal, keine weiteren Abzüge für dessen Folgen. Die reale Anzeigegröße ist unwichtig; Verhältnisse und angegebener Rastermaßstab zählen. Aufrechterhaltenes Gleichsetzen von Pfeillänge mit Ortsstrecke oder systematisch falsche Maßstabsrechnung: C = 0. / EN: Magnitude and scales: 1 each for (i) reading 3 · 2 = 6 m/s or an equivalent exact expression, (ii) calculating 6/3 = 2 cm and showing that length in the actual second drawing, (iii) separate labelled position and velocity-arrow scales, in m and m/s respectively, in the drawings. For (ii), correct calculation/length alone without a matching drawing earns 0.5. Units/legends only locally omitted or miswritten with the distinction visible: shared formal slip, at most −0.5 once, no further consequential deductions. Display size is irrelevant; ratios and a stated grid scale count. Maintained identification of arrow length with position distance or a systematically false scale calculation sets C to 0.'},
    {'id':'D','points':3,'description':
     'Bedeutung der Spitze: je 1 P für (i) begründete Voraussage, dass die neue Spitze vor B liegt (2 statt 3 cm; gleichwertige Rechnung zählt), (ii) Erklärung, dass das scheinbare Treffen von B in I nur durch den Pfeilmaßstab entsteht und weder Kontakt noch einen jetzigen/zukünftigen Ort von A belegt, (iii) ausdrücklich unveränderte Körperorte und unveränderte physikalische Geschwindigkeit beim bloßen Maßstabswechsel; nur Darstellung/Spitze ändern sich. Die genaue Lücke von 1 cm ist kein zusätzliches Muss. Eine bereits in C bewertete falsche Länge hier konsistent deuten. Aufrechterhaltene Aussage „Spitze ist Ort/Kontakt“ oder „Maßstabswechsel ändert die wirkliche Geschwindigkeit/Lage“: D = 0. Rücknahmen und kleine Fehler nach gemeinsamer Regel. / EN: Tip meaning: 1 each for (i) a reasoned prediction that the new tip lies short of B (2 rather than 3 cm; equivalent working counts), (ii) explaining that apparent coincidence with B in I is only due to the arrow scale and establishes neither contact nor a present/future position of A, (iii) explicitly unchanged object positions and physical velocity under the scale change; only the representation/tip changes. The exact 1 cm gap is not additionally required. Credit consistent interpretation of a wrong length already assessed in C. A maintained claim that the tip is a place/contact or that changing scale changes actual velocity/position sets D to 0. Retractions and minor slips use the shared policy.'},
]

lands = ['BB','BE','BY','HB','HH','MV','NI','NW','RP','SH','SL','SN','ST','TH']
jurisdictions = ['DE-' + x for x in lands]
candidate = {
    'id':EXAM,'shortKey':'seki_directed_quantity_arrows_read_draw_scale',
    'title':'Prüfungsaufgabe: Geschwindigkeitspfeile lesen und mit anderem Maßstab zeichnen',
    'titleEn':'Assessment Task: Read Velocity Arrows and Draw Them at Another Scale',
    'description':'Die lernende Person kann Geschwindigkeitspfeile ihrem Körper zuordnen, Richtung und Betrag ablesen, dieselbe Situation mit geändertem Pfeilmaßstab zeichnen und erklären, warum die Spitze keinen Ort oder Kontakt bezeichnet.',
    'descriptionEn':'The learner can assign velocity arrows to their object, read direction and magnitude, draw the same situation at a changed arrow scale and explain why the tip indicates no place or contact.',
    'weight':0.9,'tags':['GK','LK','Practice','Assessment','canonical','SekI'],
    'type':'atomic','contains':[],'requires':[GOAL],
    'dimensionTags':{'framework':'canonical-gymnasium-physics','demandLevel':'AB2','processCompetencies':['PK3_MATHEMATISIEREN','PK4_KOMMUNIZIEREN'],'guidingIdeas':['LI_BEWEGUNG'],'phase':'GLOBAL','area':'Mechanik','topicCode':'SEKI_DIRECTED_QUANTITY_ARROWS_READ_DRAW_SCALE'},
    'applicability':{'jurisdiction':jurisdictions},
    'extendedData':{'applicabilityMappingInheritance':'boundary','applicabilityOverrides':{'jurisdiction':jurisdictions}},
    'examData':{'reviewStatus':'needs_review','coveredGoalIds':[GOAL],'coveredStrands':['LI_BEWEGUNG'],'demandLevels':['AB2'],'sourceArtifactPath':REL+'/task-and-marking.md','taskContent':task_de,'taskContentEn':task_en,'solutionContent':answer_de+'\n\n'+policy_de,'solutionContentEn':answer_en+'\n\n'+policy_en,'scoring':{'maxPoints':12,'passingPoints':10,'steps':steps}}
}
save('candidate.goal.json',candidate)
save('rubric.json',candidate['examData']['scoring'])
Path('/tmp/skillpilot-a2/K4-draft.json').write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n')
task_md = '# Prüfungsaufgabe: Geschwindigkeitspfeile lesen und mit anderem Maßstab zeichnen\n\n## Aufgabe\n\n'+task_de+'\n\n## Lösung und Bewertung\n\n'+answer_de+'\n\n'+policy_de
task_md += '\n\n'+'\n\n'.join('**'+s['id']+' · 3 P**\n\n'+s['description'].split(' / EN: ')[0] for s in steps)
task_md += '\n\n# Assessment Task: Read Velocity Arrows and Draw Them at Another Scale\n\n## Task\n\n'+task_en+'\n\n## Solution and scoring\n\n'+answer_en+'\n\n'+policy_en
task_md += '\n\n'+'\n\n'.join('**'+s['id']+' · 3 points**\n\n'+s['description'].split(' / EN: ')[1] for s in steps)+'\n'
(BASE/'task-and-marking.md').write_text(task_md)

# These are actual drawing artifacts in synthetic learner scripts, not an official stimulus.
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=ImageFont.truetype(font_path,24)
small=ImageFont.truetype(font_path,20)
def draw_pair(name, *, origin='A',direction=1,length2=2,unit='m/s',scales=True,head2=True,hide=False):
    image=Image.new('RGB',(1400,440),'white'); d=ImageDraw.Draw(image)
    for j in range(2):
        y=110+j*210; xa=410; xb=770; start=xa if origin=='A' else xb
        length=3 if j==0 else length2; tip=start+direction*120*length
        d.text((30,y-88),'I' if j==0 else 'II',font=font,fill='#182738')
        d.text((90,y-88),'x : 1 cm ≙ 1 m',font=font,fill='#182738')
        if scales:
            d.text((520,y-88),f'v_A : 1 cm ≙ {2 if j==0 else 3} {unit}',font=font,fill='#126587')
        d.line((xa,y+65,xb+60,y+65),fill='#6a737e',width=2)
        for k in range(8):
            px=xa+k*60; d.line((px,y+58,px,y+72),fill='#6a737e',width=2)
        d.text((xa,y+82),'0',font=small,fill='#182738')
        d.text((xa+115,y+82),'1',font=small,fill='#182738')
        d.text((xa+235,y+82),'2',font=small,fill='#182738')
        d.text((xa+355,y+82),'3 cm',font=small,fill='#182738')
        d.text((xa-48,y+16),'A: 0 m',font=font,fill='#182738')
        d.text((xb-12,y+16),'B: 3 m',font=font,fill='#182738')
        if not hide:
            d.line((start,y,tip,y),fill='#126587',width=5)
            if j==0 or head2:
                d.polygon([(tip,y),(tip-direction*18,y-9),(tip-direction*18,y+9)],fill='#126587')
            d.text(((start+tip)/2-25,y-37),'v_A',font=font,fill='#126587')
        for px in (xa,xb): d.ellipse((px-5,y-5,px+5,y+5),fill='#182738')
    p=BASE/'blind/drawings'/f'{name}.png'; image.save(p)

draw_pair('R01')
draw_pair('R02',origin='B')
draw_pair('R03',direction=-1)
draw_pair('R04',length2=3)
draw_pair('R05',length2=2.5)
draw_pair('R06',unit='m')
draw_pair('R08',head2=False)

full_de = '''Der Pfeil gehört zu A und beschreibt A relativ zum ruhenden Boden nach rechts. Aus 3 · 2 folgen 6 m/s. Für II rechne ich 6/3 = 2 cm. Meine Zeichnung ist beigefügt; ihr Lineal legt die gezeichneten Zentimeter fest. Beide Ortsskizzen verwenden 1 cm ≙ 1 m, die beiden eigenen v_A-Skalen 1 cm ≙ 2 m/s und 1 cm ≙ 3 m/s.

Die neue Spitze liegt vor B, weil 2 cm kleiner als der unveränderte gezeichnete Abstand 3 cm sind. Das Treffen von B in I entsteht nur durch den Pfeilmaßstab: Die Spitze zeigt weder Kontakt noch einen jetzigen oder zukünftigen Ort von A. Die m/s des Pfeils sind keine Meter der Ortsskizze. Die Orte A und B und die wirkliche Geschwindigkeit von A, 6 m/s nach rechts, bleiben gleich; nur Pfeillänge und Spitze ändern sich.'''
full_en = '''The arrow belongs to A and represents A's velocity relative to the stationary ground, rightwards. Reading 3 · 2 gives 6 m/s. For II I calculate 6/3 = 2 cm. My drawing is attached; its ruler defines the drawn centimetres. Both position sketches use 1 cm ≙ 1 m; the two separate v_A scales are 1 cm ≙ 2 m/s and 1 cm ≙ 3 m/s.

The new tip lies short of B because 2 cm is less than the unchanged drawn separation of 3 cm. Coincidence with B in I comes only from the arrow scale: the tip establishes neither contact nor a present or future position of A. The arrow's m/s are not metres of the position sketch. A's and B's positions and A's actual velocity, 6 m/s rightwards, stay the same; only arrow length and tip change.'''

cases=[]; expected=[]
def case(n,de,en,points,purpose,rationale,drawing='R01'):
    sid=f'S{n:02d}'
    cases.append({'id':sid,'responseDe':de,'responseEn':en,'drawingPaths':[f'drawings/{drawing}.png'] if drawing else []})
    pp=dict(zip('ABCD',points)); total=sum(points)
    expected.append({'id':sid,'expectedPointsDe':pp,'expectedPointsEn':pp,'expectedTotal':total,'expectedPass':total>=10,'purpose':purpose,'rationale':rationale})

case(1,full_de,full_en,[3,3,3,3],'vollständige Referenz','Vier Leistungen vollständig und tatsächliche Zeichnungen.')
case(2,full_de+'\nAm abschließenden Geschwindigkeitswert schreibe ich versehentlich 6 m; in Rechnung und beiden Pfeillegenden steht m/s.',full_en+'\nAt the final speed value I accidentally write 6 m; the calculation and both arrow legends use m/s.',[3,3,2.5,3],'ein kleiner Einheitenfehler','C einmal −0,5; klarer Kern und sonst richtige Einheiten.')
case(3,full_de.split('\n\n')[0]+'\n\nDie Spitze liegt in II nicht auf B. Weitere Erklärungen zur Spitze gebe ich nicht.',full_en.split('\n\n')[0]+'\n\nThe tip does not coincide with B in II. I give no further explanation of the tip.',[3,3,3,1],'eine tragende Leistung nur teilweise','D(i) durch Rechnung 2 cm gegen gezeichnete 3 cm; D(ii)/(iii) fehlen. Genau10.')
case(4,full_de.split('\n\n')[0]+'\nAm Ergebnis schreibe ich 6 m, während ich oben und in den Legenden m/s verwendet habe.\n\nDie Spitze liegt in II nicht auf B. Weitere Erklärungen zur Spitze gebe ich nicht.',full_en.split('\n\n')[0]+'\nI label the result 6 m, although I used m/s above and in the legends.\n\nThe tip does not coincide with B in II. I give no further explanation of the tip.',[3,3,2.5,1],'unmittelbar unter Bestehensgrenze','Wie S03, unabhängiger isolierter Einheitenfehler in C;9,5.')
case(5,full_de.split('\n\n')[0],full_en.split('\n\n')[0],[3,3,3,0],'Spitzendeutung ausgelassen','Keine Voraussage/Erklärung in Text; die richtige Zeichnung allein ist keine begründete Voraussage D(i).')
case(6,full_de+'\nTrotzdem gehört der Geschwindigkeitspfeil nach meiner Ansicht zu B, weil er dort endet. Diese Aussage halte ich aufrecht.',full_en+'\nNevertheless, I think the velocity arrow belongs to B because it ends there. I maintain that statement.',[0,3,3,3],'beibehaltene falsche Trägerzuordnung','A vollständig0 trotz richtiger Zeichnung; keine Folgeverluste.')
case(7,full_de+'\nAußerdem behaupte ich: Geschwindigkeitspfeile darf ich in der Ortsskizze überall beginnen lassen; der Körper ist dafür egal. Daran halte ich fest.',full_en+'\nI also claim that velocity arrows may start anywhere in a position sketch; the object does not matter. I maintain this.',[0,3,3,3],'beliebiger Pfeilanfang als Regel','A0 durch beibehaltene Fehlvorstellung.')
case(8,full_de+'\nIch halte aber auch fest: Ein nach rechts weisender Geschwindigkeitspfeil bedeutet Bewegung nach links.',full_en+'\nBut I also maintain that a velocity arrow pointing right means motion to the left.',[3,0,3,3],'beibehaltene Richtungsumkehr','B0 trotz rechter Pfeile; keine neue Maßstabs- oder Spitzendeutung behauptet.')
case(9,full_de+'\nTrotz der m/s-Angaben gilt für mich: Die Pfeillänge ist eine Strecke von A im Ortsraum; 6 m/s und 6 m bedeuten hier dasselbe. Das halte ich aufrecht.',full_en+'\nDespite the m/s labels, I hold that arrow length is a distance of A in position space; 6 m/s and 6 m mean the same thing here. I maintain this.',[3,3,0,3],'Einheitenräume gleichgesetzt','C0; D enthält unabhängig ausdrücklich die richtige Spitzendeutung, keine erneute pauschale Strafe.')
case(10,full_de+'\nDie Spitze in I beweist aber zugleich, dass A jetzt B berührt. Diese Behauptung nehme ich nicht zurück.',full_en+'\nBut the tip in I also proves that A is touching B now. I do not retract this claim.',[3,3,3,0],'Kontaktfehlvorstellung','D0 für ausdrücklich beibehaltenen Kernwiderspruch.')
case(11,full_de+'\nIch bleibe außerdem dabei: Die neue Pfeilskala ändert die wirkliche Geschwindigkeit von A.',full_en+'\nI also maintain that the new arrow scale changes A\'s actual velocity.',[3,3,3,0],'Skala verändert physikalische Größe','D0 trotz richtiger früherer Aussagen.')
case(12,full_de+'\nZuerst dachte ich, A berühre B an der Spitze. Das nehme ich ausdrücklich zurück: Der Tippunkt ist kein Ort von A; das scheinbare Treffen liegt nur am Maßstab.',full_en+'\nAt first I thought A touched B at the tip. I explicitly retract that: the tip is not a position of A; the apparent coincidence is only due to scale.',[3,3,3,3],'ausdrückliche Selbstkorrektur','Rücknahme löst den Widerspruch; kein Fehlvorstellungsabzug.')
case(13,full_de.replace('Meine Zeichnung ist beigefügt; ihr Lineal legt die gezeichneten Zentimeter fest.','Eine Zeichnung fertige ich nicht an; ich habe die beiden Skizzen nur beschrieben.'),full_en.replace('My drawing is attached; its ruler defines the drawn centimetres.','I do not make a drawing; I have described the two sketches only.'),[1,1,1.5,3],'nur Text, kein Zeichnen','A/B höchstens1; C(i)1 und C(ii)0,5, C(iii)keine Legenden in tatsächlichen Darstellungen.',drawing=None)
case(14,full_de.replace('6/3 = 2 cm','6/3 = 2,5 cm')+'\nDie sichtbaren 2,5 cm habe ich vom falsch notierten Rechenergebnis übernommen; 6/3 war mein einziger Rechenfehler.',full_en.replace('6/3 = 2 cm','6/3 = 2.5 cm')+'\nI copied the visible 2.5 cm from my mistaken calculation; 6/3 was my only arithmetic slip.',[3,3,2.5,3],'ein Rechenfehler mit konsistenter Zeichnungsfolge','C einmal−0,5; Spitze weiter vorB und richtige physikalische Deutung zählen inD.',drawing='R05')
case(15,full_de+'\nIn meinen beiden Pfeillegenden steht versehentlich m statt m/s; Rechnung und die Unterscheidung zwischen Geschwindigkeit und Ortsstrecke sind wie oben.',full_en+'\nMy two arrow legends accidentally say m instead of m/s; the calculation and distinction between velocity and position distance are as above.',[3,3,2.5,3],'gemeinsamer Legendenfehler','Gemeinsame falsche Einheit in beiden Legenden nur einmal−0,5 inC.',drawing='R06')
case(16,full_de+'\nIn II habe ich den Pfeilkopf aus Versehen weggelassen; Pfeilrichtung, Länge und Beschriftung habe ich wie oben gemeint.',full_en+'\nIn II I accidentally omitted the arrowhead; I intended the direction, length and label as stated above.',[3,2.5,3,3],'ein Zeichenfehler','B einmal−0,5; linker Anfang und v_A werden in Zeichnung/Text eindeutig.',drawing='R08')
case(17,full_de.replace('Der Pfeil gehört zu A','Der Pfeil gehört zu B').replace('6/3 = 2 cm','6/3 = 2 cm')+'\nMeine Pfeile beginnen absichtlich an B, weil die Geschwindigkeit B gehört. Dabei bleibe ich.',full_en.replace('The arrow belongs to A','The arrow belongs to B')+'\nMy arrows deliberately start at B because the velocity belongs to B. I maintain this.',[0,3,3,3],'falscher Ansatz, andere Kriterien unabhängig','A0; andere mathematische Eigenschaften und Deutung aus Text eigenständig; Zeichnungsfolge des falschen Ursprungs nicht nochmals werten.',drawing='R02')
case(18,full_de+'\nDie Pfeile in meiner Zeichnung zeigen absichtlich nach links. Ich behaupte, das sei dieselbe Richtung wie rechts, und halte daran fest.',full_en+'\nThe arrows in my drawing deliberately point left. I claim this is the same direction as right and maintain that claim.',[3,0,3,3],'systematische falsche Zeichnungsrichtung','B0; C bewertet unsigned Längen; D textlich unabhängig richtig.',drawing='R03')
case(19,full_de.replace('6/3 = 2 cm','6/3 = 3 cm')+'\nDie Pfeillänge muss bei einem anderen Pfeilmaßstab immer gleich bleiben; diese Regel halte ich aufrecht.',full_en.replace('6/3 = 2 cm','6/3 = 3 cm')+'\nThe arrow length must always stay the same under a change of arrow scale; I maintain this rule.',[3,3,0,3],'beibehaltene falsche Maßstabsregel','C0; D enthält ausdrücklich eigene korrekte Deutung undVoraussage, keine zweite automatische Strafe.',drawing='R04')
case(20,full_de.split('\n\n')[0]+'\n\nDass die Spitze in I auf B fällt, liegt allein am Maßstab und beweist keinen Kontakt oder Ort von A. Zu II und zu unveränderten physikalischen Größen erkläre ich nichts weiter.',full_en.split('\n\n')[0]+'\n\nCoincidence with B in I is only due to scale and proves no contact or position of A. I give no further explanation of II or unchanged physical quantities.',[3,3,3,1],'alternative fehlende Teilfacetten an Bestehensgrenze','D(ii)1; keine begründete Voraussage und keine ausdrückliche Invarianz. Genau10.')

save('blind/scripts.json',{'schemaVersion':1,'cases':cases})
save('author/expectations.json',{'status':'sealed-author-expectations-not-independent-review','maxPoints':12,'passingPoints':10,'cases':expected})
save('blind/marking-template.json',{'markerIdentity':'','independenceStatement':'','rubricAccepted':None,'findings':[],'cases':[{'id':c['id'],'de':{'points':dict.fromkeys('ABCD',None),'total':None,'pass':None,'rationale':''},'en':{'points':dict.fromkeys('ABCD',None),'total':None,'pass':None,'rationale':''}} for c in cases]})
(BASE/'blind/scripts.md').write_text('# Schriftliche Abgaben / Written submissions\n\n'+ '\n\n'.join('## '+c['id']+'\n\nDE:\n\n'+c['responseDe']+'\n\nEN:\n\n'+c['responseEn']+'\n\n'+('Zeichnung / drawing: '+', '.join('['+p+']('+p+')' for p in c['drawingPaths']) if c['drawingPaths'] else 'Keine Zeichnung beigefügt / No drawing attached.') for c in cases)+'\n')
(BASE/'blind/instructions.md').write_text('''# Getrennte Blindbewertung / Independent blind marking

Read `../candidate.goal.json`, `../task-and-marking.md`, `scripts.json`, and every drawing referenced by a script. Do not read `../author/`, authoring source, author expectations, the other marker's output or reconciliation. Neutral case and drawing IDs contain no intended judgement. The actual drawings form part of the submissions; do not replace their visual inspection with reading the prose. One drawing can be shared by several submissions. The ruler defines its scale irrespective of screen zoom.

Grade all 20 fully written cases independently, in German and English separately: A–D points, total, pass/fail, and decisive evidence. Explain any bilingual difference. Do not invent missing work. Use `marking-template.json` if helpful. In particular distinguish a local slip, an omission, a maintained misconception, a contradiction that was explicitly retracted, and consistent follow-through from an earlier error.

Decide also whether the task is physically correct, age appropriate, clear, feasible through coach chat with an attached actual drawing, and sufficient to test its one stated goal. Check that all four carrying performances have their own protected weight, that one small slip can pass, that the total alone implements the pass threshold, and that a text-only response cannot evade the drawing requirement. Report a material ambiguity with a concrete case and minimal proposed repair. The author has not released the task; no existing positive verdict should influence yours. Do not edit the candidate, and do not communicate your marks to the other marker.

The two languages in a case are equivalent versions of one synthetic submission, not consecutive attempts by a learner. All scripts and drawings are synthetic author materials. These blind markings are content-quality evidence, never real learner results.
''')

# Selection is intentionally restricted to views with a lower-stage target.
placement_path=Path(sys.argv[1])
rows=list(csv.DictReader(placement_path.open(),delimiter='\t'))
scope_rows=[]
for row in rows:
    scope=__import__('ast').literal_eval(row['Scope'])
    if scope.get('jurisdiction') in jurisdictions and scope.get('stage') in ['SekI','CrossStage']:
        scope_rows.append({'viewFilename':row['Sicht'],'scope':scope,'placement':row['Lernort A (Kompetenzvariante)']})
save('scope.json',{'status':'intended-lower-stage-target-offers-not-activation','assessmentId':EXAM,'requiresAndCoversOnly':GOAL,'jurisdictions':jurisdictions,'excludedJurisdictions':['DE-HE','DE-BW'],'regularTargetLandCount':14,'offerViews':scope_rows,'sourceBasis':'Accepted task L and A2 cut at 2026-11-26 05:40 CET. Scale separation and tip meaning are SkillPilot didactic elaboration in every Land.','note':'Upper-stage-only views receive preparation of the goal, not this closing assessment. Actual placements and source roles are the integrator\'s reviewed contract.'})

source_inputs=[placement_path,placement_path.with_name('review.md'),placement_path.with_name('source-table.md'),ROOT/'LICENSING.md',ROOT/'docs/dev/directed-quantity-arrows-plan-2026-11-25.md']
save('author/source-basis.actual.json',{'interpretation':'Accepted task L determines placement and source roles. No retained official source was changed, and no official assessment wording is claimed.','inputs':[{'logicalName':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in source_inputs],'licensingReview':['Own educational task and own synthetic scripts; content allocation is CC-BY-4.0 for rights the project can grant.','Licensor, contributor and third-party provider roles remain distinct. AI provenance is not a license or proof of ownership.','No new compulsory per-goal attribution, consent or rights approval was introduced.']})

save('author/authorship.actual.json',{'role':'assessment-author','tool':'Codex collaboration agent','agentTask':'/root/a2_k4','model':'inherited root model; no exact runtime model metadata exposed','rubricVersion':1,'maximumRubricVersions':3,'ownMaterial':['assessment wording DE and EN','solution and scoring DE and EN','20 bilingual synthetic submissions','7 legible drawing artifacts'],'borrowedThirdPartyAssessment':False,'officialSourceClaim':'No official task; this is SkillPilot\'s own assessment. Accepted task L determines Land roles; sources are not reinterpreted here.','observedK4MarkerOutputs':False,'authorExpectationsAreIndependentEvidence':False,'publicContentLicense':'CC-BY-4.0 for project-owned contributions within LICENSING.md; no claim of copyright in facts or AI provenance alone','technicalAuthoringCodeLicense':'Apache-2.0','licensorRole':'Project-owned rights held by enpasos - Enterprise Patterns & Solutions GmbH, subject to retained contributor rights and existing notices','additionalCompulsoryAttributionAdded':False,'learnerMasteryWritten':False,'catalogWritten':False})

(BASE/'README.md').write_text('''# K4 · Geschwindigkeitspfeile lesen und zeichnen

Version 1 ist ein verfasster Kandidat; zwei getrennte Blindbewertungen stehen aus. Keine Katalogaktivierung und keine Lernendenresultate.

Die eigene kurze Aufgabe fordert zwei tatsächliche lesbare Zeichnungen desselben Augenblicks. Der Geschwindigkeitspfeil an A ist zunächst 3 cm lang bei 1 cm ≙ 2 m/s und scheint auf B zu treffen. Bei unveränderten Orten und derselben Geschwindigkeit wird er mit 1 cm ≙ 3 m/s neu gezeichnet. Die vier tragenden Leistungen sind Träger/Ansatz, Richtung, Betrag mit eigenem Maßstab sowie Spitzenbedeutung beim Maßstabswechsel. Je 3 Punkte; die Summe besteht ab 10 von 12 (83,33 Prozent). Der Verlust einer ganzen Leistung kann nicht durch andere ersetzt werden. Ein isolierter kleiner Fehler kostet höchstens einmal 0,5 Punkte; eine beibehaltene Kernfehlvorstellung verliert die ganze betroffene Leistung.

Die Aufgabe verlangt und deckt allein `b77a7e93-22f9-5722-a4cc-f18a149ab030` ab. Sie braucht keine Kraftgesetze oder vorausgesetzte Vektorrechnung; Geschwindigkeit, Richtung, Einheiten und Bezugsrahmen sind im Auftrag benannt. Die Landrollen folgen der angenommenen Knotenprüfung L und dem A2-Zuschnitt vom 26. November 2026, 05:40 CET: Abschlussangebot dort, wo das Pfeilziel ein Ziel der Sekundarstufe I ist; kein Pflichtabschlussangebot für die eigene Vorbereitung in HE/BW oder für reine Oberstufenvorbereitung. Trennung der Maßstäbe und Spitzenbedeutung bleiben in allen Ländern SkillPilots didaktische Ausgestaltung, keine angeblich wörtliche amtliche Forderung.

`candidate.goal.json`, `task-and-marking.md`, `rubric.json` und `blind/` sind das saubere Blindpaket. 20 vollständige deutsch/englische Abgaben verweisen auf sieben tatsächliche Zeichnungsdateien. Die Bilder sind synthetische Lernendenabgaben, keine freigegebenen Unterrichtsbilder: Einige enthalten gezielt falsche Darstellungen. Marker müssen die jeweils referenzierten Pixel ansehen. Die Lineale sichern die Verhältnisse unabhängig vom Zoom. Die eigene Aufgabenstellung enthält den absichtlich scheinbar berührenden Anfangsfall ausdrücklich als zu prüfende Fehlinterpretation; sie behauptet keinen Kontakt.

`author/expectations.json` enthält getrennte, vor der Bewertung verfasste Erwartungen. `author/authorship.actual.json` benennt Urheberschaft, Rollen und Lizenzgrenzen; `author/manifest.json` versiegelt die Eingaben. Die Autorenerwartungen sind keine unabhängige Prüfung. Der Autor hat keine K4-Markerantwort gelesen. Die Blinddateien enthalten keine erwarteten Punktzahlen oder Fallzwecke.

Diese eigene didaktische Aufgabe und die synthetischen Abgaben unterliegen für die Rechte, die das Projekt vergeben kann, CC-BY-4.0; das technische Authoringskript Apache-2.0 nach `LICENSING.md`. KI-Provenienz und fachliche Freigabe begründen keine Rechte an Fremdmaterial. Es werden keine zusätzlichen verbindlichen Einzelcredits oder anderen Attributionserfordernisse eingeführt.
''')

files=[p for p in BASE.rglob('*') if p.is_file() and p.relative_to(BASE).as_posix() not in ['author/manifest.json','author/validation.actual.json']]
save('author/manifest.json',{'status':'sealed-before-independent-marking','rubricVersion':1,'maximumRubricVersions':3,'files':[{'path':p.relative_to(BASE).as_posix(),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]})
print(json.dumps({'candidate':str(BASE/'candidate.goal.json'),'cases':len(cases),'drawings':7,'offerViews':len(scope_rows),'stepUtf16':{s['id']:len(s['description'].encode('utf-16-le'))//2 for s in steps}},ensure_ascii=False))
