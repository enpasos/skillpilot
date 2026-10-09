#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Local didactic simulation, not learner evidence or production code.

Two inherited phenotypes in an asexual population. Survival weighting differs
between phenotypes; offspring inherit a sampled survivor's phenotype. This toy
is not a diploid genotype model and does not simulate real breeding organisms.
"""
import argparse, json, random
from statistics import mean

def run(seed, n, generations, survival_brown, survival_light):
    rng=random.Random(seed)
    brown=n//2
    trajectory=[{'generation':0,'brown':brown,'light':n-brown,'brownFrequency':brown/n}]
    for generation in range(1,generations+1):
        total=brown*survival_brown+(n-brown)*survival_light
        chance=(brown*survival_brown/total) if total else brown/n
        brown=sum(rng.random()<chance for _ in range(n))
        trajectory.append({'generation':generation,'brown':brown,'light':n-brown,'brownFrequency':brown/n})
    return trajectory

def main():
    p=argparse.ArgumentParser();p.add_argument('--n',type=int,default=200);p.add_argument('--generations',type=int,default=5);p.add_argument('--replicates',type=int,default=40);p.add_argument('--seed',type=int,default=7300)
    a=p.parse_args()
    if a.n<2 or a.generations<1 or a.replicates<2:p.error('n>=2, generations>=1, replicates>=2 required')
    conditions=[('neutral',1.0,1.0),('brown-favoured',1.0,0.25),('light-favoured',0.25,1.0)]
    out={'schemaVersion':1,'role':'actual-author-software-execution-only','syntheticModel':True,'actualHumanExperiment':False,'actualLearnerPerformance':False,'seed':a.seed,'populationSize':a.n,'generations':a.generations,'replicates':a.replicates,'conditions':[]}
    for name,b,l in conditions:
        series=[run(a.seed+i,a.n,a.generations,b,l) for i in range(a.replicates)]
        assert all(row['brown']+row['light']==a.n for s in series for row in s)
        out['conditions'].append({'name':name,'survivalWeights':{'brown':b,'light':l},'replicateTrajectories':series,'meanBrownFrequencyByGeneration':[mean(s[g]['brownFrequency'] for s in series) for g in range(a.generations+1)]})
    neutral,brown,light=[c['meanBrownFrequencyByGeneration'][-1] for c in out['conditions']]
    assert brown>neutral>light, 'Selection reversal/control must retain causal direction'
    assert 0.35<neutral<0.65, 'Neutral control must not mimic a strong directional selection result'
    print(json.dumps(out,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
