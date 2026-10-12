from pathlib import Path
import json
import hashlib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import MultipleLocator

OWN = Path(__file__).resolve().parent.parent
REPO = Path(__file__).resolve().parents[8]
PARENT = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-live-context-author-20261012-v2'
REL = OWN.relative_to(REPO)
OUT = OWN / 'positive/assessment-graphs'
OUT.mkdir(exist_ok=True)
specs = [
    ('q3-18-a', lambda t: .8-.014*t+.0002*t*t, 20., -.006, 30., (0., .9), .1, .02, r'$c_A\,/\,(\mathrm{mol\,L^{-1}})$', '0.8-0.014*t+0.0002*t^2', .0004),
    ('q3-18-a-fresh', lambda t: 2*(.8-.014*t+.0002*t*t), 20., -.012, 30., (0., 1.8), .2, .04, r'$n_A\,/\,\mathrm{mol}$', '2*(0.8-0.014*t+0.0002*t^2)', .0008),
    ('q3-18-b', lambda t: 3*(t/60)**3-15*(t/60)**2+36*(t/60), 60., .25, 120., (0., 42.), 6., 3., r'$V_{\rm Gas}\,/\,\mathrm{mL}$', '3*(t/60)^3-15*(t/60)^2+36*(t/60)', .02),
    ('q3-18-b-fresh', lambda t: .64*t-.0032*t*t, 25., .48, 60., (0., 32.), 4., 2., r'$V_{\rm Gas}\,/\,\mathrm{mL}$', '0.64*t-0.0032*t^2', .025),
]
receipts = []
for name, curve, time, slope, xmax, ylim, major, minor, ylabel, expression, tolerance in specs:
    x = np.linspace(0, xmax, 601)
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=160)
    fig.subplots_adjust(left=.14, right=.97, bottom=.15, top=.94)
    ax.plot(x, curve(x), color='#1767a8', linewidth=3.2, label='Modellkurve / model curve')
    ax.plot(x, curve(time)+slope*(x-time), color='#bd4c35', linewidth=2.8, label=f'Tangente / tangent: t = {time:g} s')
    ax.scatter([time], [curve(time)], color='#bd4c35', s=60, zorder=4)
    ax.set_xlim(0, xmax); ax.set_ylim(*ylim)
    ax.set_xlabel(r'$t\,/\,\mathrm{s}$', fontsize=21); ax.set_ylabel(ylabel, fontsize=21)
    ax.xaxis.set_major_locator(MultipleLocator(5 if xmax==30 else (30 if xmax==120 else 10)))
    ax.xaxis.set_minor_locator(MultipleLocator(1 if xmax==30 else (15 if xmax==120 else 5)))
    ax.yaxis.set_major_locator(MultipleLocator(major)); ax.yaxis.set_minor_locator(MultipleLocator(minor))
    ax.tick_params(axis='both', which='major', labelsize=16)
    ax.grid(which='major', color='#acbed0', linewidth=.9); ax.grid(which='minor', color='#dce6ef', linewidth=.55)
    ax.legend(fontsize=15, loc='lower right', framealpha=.95)
    image = OUT / (name+'.png'); fig.savefig(image); plt.close(fig)
    receipts.append({'graphId':name, 'path':str(image.relative_to(REPO)), 'sha256':'sha256:'+hashlib.sha256(image.read_bytes()).hexdigest(),
                     'width':1600, 'height':1040, 'curveAuthorFormula':expression,
                     'tangentTimeSeconds':time, 'authorExpectedDerivative':slope, 'acceptableAbsoluteReadOffError':tolerance,
                     'learnerPngPrintsNumericalSlope':False, 'role':'synthetic_scaled_assessment_plot_not_goal_visualization'})

cases = json.loads((PARENT/'positive/whole28.material-task-model-scoring-transfer.de-en.author.json').read_text())
current = {g['id']:g for g in json.loads((OWN/'inputs/current523.author-successor.de.json').read_text())['goals']}
en_old = 'so it gives half the Cu amount, not necessarily half the mass.'
en_new = 'so, at equal passed charge, the deposited amount of Cu in moles is half the deposited amount of Ag; its mass is not necessarily half the deposited Ag mass.'
for c in cases['cases']:
    c['wholeCurrentGoal'] = current[c['goalId']]
    if c['caseId']=='q3-09-c-qualitative-contribution':
        assert en_old in c['modelResponse']['en']
        c['modelResponse']['en']=c['modelResponse']['en'].replace(en_old, en_new)
    if c['caseId']=='q3-18-a':
        main, fresh = receipts[0], receipts[1]
        c['assessmentGraphs']={'main':main, 'freshTransfer':fresh, 'derivativeAndFormulaMetadataAreAuthorOnly':True}
        c['material']['de']='Synthetischer Verlauf für 2A→B in konstantem 1,00 L. Das vollständig skalierte Konzentrations-Zeit-Diagramm q3-18-a.png zeigt die Kurve und die Tangente bei 20 s. Stoffmenge nA=cA·V. Die Tangentensteigung ist nicht angegeben; sie muss aus dem Diagramm bestimmt werden.'
        c['material']['en']='Synthetic curve for 2A→B at constant 1.00 L. The fully scaled concentration-time graph q3-18-a.png shows the curve and the tangent at 20 s. Amount nA=cA·V. No tangent slope is supplied; it must be determined from the graph.'
        c['task']['de']+=' Lies die Kurvenwerte bei 0 und 20 s sowie zwei ausreichend weit getrennte Punkte der eingezeichneten Tangente ab. Zeige das Steigungsdreieck mit Δc und Δt; lies nicht nur einen Tabellenwert ab.'
        c['task']['en']+=' Read curve values at 0 and 20 s and two sufficiently separated points of the plotted tangent. Show the slope triangle with Δc and Δt; do not merely copy a table value.'
        c['modelResponse']['de']+=' Diagramm: cA(0)=0,80 und cA(20)=0,60 mol/L. Beispielsweise Tangentenpunkte (0 s;0,72 mol/L) und (30 s;0,54 mol/L) liefern dcA/dt=−0,18/30=−0,0060 mol/(L·s). Ablesetoleranz ±0,0004 mol/(L·s); daraus abgeleitete Größen dürfen entsprechend abweichen.'
        c['modelResponse']['en']+=' Graph: cA(0)=0.80 and cA(20)=0.60 mol/L. For example, tangent points (0 s;0.72 mol/L) and (30 s;0.54 mol/L) give dcA/dt=−0.18/30=−0.0060 mol/(L·s). Accept read-off error ±0.0004 mol/(L·s) and consistently propagated uncertainty.'
        c['scoring']['criteria'][0]['criterion']={'de':'Kurvenpunkte ablesen und Intervallsekante mit Δc/Δt bestimmen; mittlere A-Verbrauchsrate 0,0100±0,0005 mol/(L·s).','en':'Read curve points and determine interval secant using Δc/Δt; average A disappearance 0.0100±0.0005 mol/(L·s).'}
        c['scoring']['criteria'][1]['criterion']={'de':'Zwei Tangentenpunkte und Steigungsdreieck zeigen; negative Ableitung −0,0060±0,0004 von positiver Verbrauchsrate unterscheiden. Vorgegebene Zahlen ohne graphische Herleitung genügen nicht.','en':'Show two tangent points and a slope triangle; distinguish derivative −0.0060±0.0004 from positive disappearance. Numbers without graphical derivation are insufficient.'}
        c['freshTransfer']['task']={'de':'Frisch: q3-18-a-fresh.png zeigt statt der Konzentration die Stoffmenge nA im Volumen 2,00 L. Bestimme die momentane Stoffmengen-Verbrauchsrate bei 20 s aus der eingezeichneten Tangente und vergleiche die daraus berechnete Konzentrationsrate mit dem Hauptfall. Keine Steigung ist vorgegeben.','en':'Fresh: q3-18-a-fresh.png plots amount nA instead of concentration at volume 2.00 L. Determine instantaneous amount disappearance at 20 s from the tangent and compare the resulting concentration rate with the main case. No slope is supplied.'}
        c['freshTransfer']['modelResponse']={'de':'Die Tangente liefert dnA/dt=−0,0120±0,0008 mol/s, also Verbrauch 0,0120 mol/s. Division durch 2,00 L ergibt 0,0060 mol/(L·s), unverändert gegenüber dem Hauptfall. Andere Ordinate und doppeltes Volumen verändern die Stoffmengenrate, nicht die Konzentrationsrate.','en':'The tangent gives dnA/dt=−0.0120±0.0008 mol/s, hence disappearance 0.0120 mol/s. Dividing by 2.00 L gives 0.0060 mol/(L·s), unchanged from the main case. The changed ordinate and doubled volume alter amount rate, not concentration rate.'}
        c['scoring']['criteria'][-1]['criterion']=c['freshTransfer']['modelResponse'].copy()
    if c['caseId']=='q3-18-b':
        main, fresh=receipts[2], receipts[3]
        c['assessmentGraphs']={'main':main, 'freshTransfer':fresh, 'derivativeAndFormulaMetadataAreAuthorOnly':True}
        c['material']['de']='Synthetisch gesammeltes Produktgas bei konstantem T,p. Das vollständig skalierte Zeit-Volumen-Diagramm q3-18-b.png zeigt die Kurve und die Tangente bei 60 s. Gegeben sind molares Gasvolumen 24,0 L/mol und konstantes Lösungsvolumen 0,500 L; 1 mol Gas entspricht 1 mol Reaktionsumsatz. Kurvenwerte und Tangentensteigung werden aus dem Diagramm abgelesen, nicht als Zahlen geliefert.'
        c['material']['en']='Synthetic collected product gas at constant T,p. The fully scaled time-volume graph q3-18-b.png shows the curve and tangent at 60 s. Supplied molar gas volume is 24.0 L/mol and constant solution volume 0.500 L; 1 mol gas equals 1 mol reaction conversion. Curve values and tangent slope must be read from the graph, rather than supplied numerically.'
        c['task']['de']+=' Lies Kurvenwerte bei 0,60,120 s und zwei weit getrennte Tangentenpunkte ab; dokumentiere ΔV/Δt mit Steigungsdreieck.'
        c['task']['en']+=' Read curve values at 0,60,120 s and two separated tangent points; document ΔV/Δt with a slope triangle.'
        c['modelResponse']['de']+=' Graphisch: V(0)=0,V(60)=24,V(120)=36 mL. Tangentenpunkte (0 s;9 mL) und (120 s;39 mL) liefern 30/120=0,25 mL/s. Zulässige Ablesetoleranz der Volumenraten ±0,02 mL/s; Folgegrößen mit entsprechend fortgepflanzter Toleranz.'
        c['modelResponse']['en']+=' Graphically: V(0)=0,V(60)=24,V(120)=36 mL. Tangent points (0 s;9 mL) and (120 s;39 mL) give 30/120=0.25 mL/s. Accept volume-rate read-off error ±0.02 mL/s and propagated uncertainty in converted rates.'
        c['scoring']['criteria'][0]['criterion']={'de':'Kurvenpunkte und zwei Tangentenpunkte mit Steigungsdreieck verwenden; Intervallraten 0,40/0,20 und lokale Tangentenrate 0,25 mL/s unterscheiden, je ±0,02 mL/s.','en':'Use curve points and two tangent points with slope triangle; distinguish interval rates 0.40/0.20 from local tangent rate 0.25 mL/s, each ±0.02 mL/s.'}
        c['freshTransfer']['task']={'de':'Frisch: Bestimme aus q3-18-b-fresh.png die Tangentenrate bei 25 s. Molares Gasvolumen weiterhin 24,0 L/mol, Lösungsvolumen jetzt 1,00 L. Bestimme Stoffmengenrate und auf Lösungsvolumen bezogene Rate; keine Tangentensteigung wird angegeben.','en':'Fresh: determine tangent rate at 25 s from q3-18-b-fresh.png. Molar gas volume remains 24.0 L/mol; solution volume is now 1.00 L. Determine amount rate and solution-volume-normalized rate; no tangent slope is supplied.'}
        c['freshTransfer']['modelResponse']={'de':'Tangentenpunkte (0 s;2 mL) und (50 s;26 mL) liefern 24/50=0,48±0,025 mL/s. Daraus 0,00048/24=2,00·10⁻⁵ mol/s und 2,00·10⁻⁵ mol/(L·s), mit fortgepflanzter Ablesetoleranz.','en':'Tangent points (0 s;2 mL) and (50 s;26 mL) give 24/50=0.48±0.025 mL/s. Thus 0.00048/24=2.00·10⁻⁵ mol/s and 2.00·10⁻⁵ mol/(L·s), with propagated read-off uncertainty.'}
        c['scoring']['criteria'][-1]['criterion']=c['freshTransfer']['modelResponse'].copy()

(OWN/'positive/whole28.material-task-model-scoring-transfer.de-en.author.json').write_text(json.dumps(cases,ensure_ascii=False,indent=2)+'\n')
(OUT/'assessment-graphs.author-calibration.json').write_text(json.dumps({'role':'author_calibration_not_learner_givens','synthetic':True,'humanTrial':False,'performedExperiment':False,'plots':receipts},ensure_ascii=False,indent=2)+'\n')
candidate=json.loads((OWN/'positive/P13.author.candidates.json').read_text())
by_case={c['caseId']:c for c in cases['cases']}
for g in candidate['goals']:
    if g['goalId'].startswith('b8c8'):
        for brief in g['profile']['applicationCaseBriefs']:
            for key in brief:
                if isinstance(brief[key],str):brief[key]=brief[key].replace(en_old,en_new)
    if g['goalId'].startswith('56bc'):
        for brief in g['profile']['applicationCaseBriefs']:
            c=by_case[brief['id']]
            for lang,label in [('de','De'),('en','En')]:
                paths=f" Main graph: {c['assessmentGraphs']['main']['path']}; fresh graph: {c['assessmentGraphs']['freshTransfer']['path']}."
                brief['taskDemand'+label]=c['material'][lang]+' '+c['task'][lang]+paths+' Fresh transfer: '+c['freshTransfer']['task'][lang]
                brief['expectedPerformance'+label]=c['modelResponse'][lang]+' Scoring /10: '+'; '.join(f"{r['points']}P: {r['criterion'][lang]}" for r in c['scoring']['criteria'])
        g['profile']['variationAxes'][0]['textDe']='Skalierte Konzentrations-Zeit- und Zeit-Volumen-Kurven mit selbstständig abgelesener Sekanten-/Tangentensteigung; neue Stoffmengenordinate und frische Gaskurve.'
        g['profile']['variationAxes'][0]['textEn']='Scaled concentration-time and time-volume curves with independently read secant/tangent slopes; changed amount ordinate and fresh gas curve.'
(OWN/'positive/P13.author.candidates.json').write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n')
print('Four real scaled PNG assessment graphs; two graph cases and one exact Cu-versus-Ag EN clarification prepared.')
