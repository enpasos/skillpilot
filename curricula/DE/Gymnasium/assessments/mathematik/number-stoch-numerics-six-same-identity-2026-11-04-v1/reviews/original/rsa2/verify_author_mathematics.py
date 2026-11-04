"""Exact author checks, not independent grading, acceptance or a learner trial."""
from pathlib import Path
from math import gcd, isqrt, prod
import json

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
checks=[]
def check(name, actual, expected):
    assert actual==expected,(name,actual,expected)
    checks.append({'check':name,'actual':actual,'expected':expected,'pass':True})

n,p,q,e,d=187,11,17,7,23
check('distinct prime factors', [all(k%a for a in range(2,isqrt(k)+1)) for k in [p,q]], [True,True])
check('RSA modulus',p*q,n)
check('totient by counting coprime residues',sum(gcd(m,n)==1 for m in range(n)),160)
check('public exponent inverse condition',gcd(e,160),1)
check('private exponent unique in selected interval',[i for i in range(1,160) if e*i%160==1],[23])
check('exponent product',e*d,161)
for m,c in [(20,147),(11,88)]:
    check(f'encrypt {m}',pow(m,e,n),c)
    check(f'decrypt {c}',pow(c,d,n),m)
check('encryption powers for 20',[pow(20,k,n) for k in [2,4]],[26,115])
check('encryption powers for 11',[pow(11,k,n) for k in [2,4]],[121,55])
check('decryption powers for 147',[pow(147,k,n) for k in [2,4,8,16]],[104,157,152,103])
check('decryption powers for 88',[pow(88,k,n) for k in [2,4,8,16]],[77,132,33,154])
check('traceable repeated-square products',[115*26*20%n,55*121*11%n,103*157*104*147%n,154*132*77*88%n],[147,88,20,11])
check('actual all-message RSA round-trip failures',[m for m in range(n) if pow(pow(m,e,n),d,n)!=m],[])
nonunits=[m for m in range(n) if gcd(m,n)!=1]
check('number of noncoprime messages including 0',len(nonunits),27)
check('noncoprime round-trip failures',[m for m in nonunits if pow(pow(m,e,n),d,n)!=m],[])
check('zero/nonzero prime-modulus proof for every message',all(pow(m,161,11)==m%11 and pow(m,161,17)==m%17 for m in range(n)),True)
check('Euler substitution fails on exactly the nonunits',[m for m in range(n) if pow(m,160,n)!=1],nonunits)
check('noncoprime example really is noncoprime',gcd(11,n),11)
check('invalid private exponent need not recover message',pow(pow(20,7,n),7,n)==20,False)
check('noninvertible public exponent has no private inverse',[i for i in range(1,160) if 10*i%160==1],[])

N=1649
check('chosen interval above square root',[40*40<N,41*41>N],[True,True])
check('sieve divisibility classes modulo 2',[x for x in range(2) if (x*x-N)%2==0],[1])
check('sieve divisibility classes modulo 5',[x for x in range(5) if (x*x-N)%5==0],[2,3])
check('periodic marked interval positions by 2',[x for x in range(41,46) if (x*x-N)%2==0],[41,43,45])
check('periodic marked interval positions by 5',[x for x in range(41,46) if (x*x-N)%5==0],[42,43])
rows=[]
for x in range(41,46):
    Q=x*x-N;remaining=Q;exponents=[]
    for prime in [2,5]:
        exponent=0
        while remaining%prime==0:remaining//=prime;exponent+=1
        exponents.append(exponent)
    rows.append({'x':x,'Q':Q,'exponents':exponents,'remaining':remaining,'retain':remaining==1})
check('five Q values',[r['Q'] for r in rows],[32,115,200,287,376])
check('residuals after complete division by base primes',[r['remaining'] for r in rows],[1,23,1,287,47])
check('retained smooth relations',[r['x'] for r in rows if r['retain']],[41,43])
check('retained complete exponent vectors',[r['exponents'] for r in rows if r['retain']],[[5,0],[3,2]])
check('both retained values are individually nonsquares',[isqrt(k)**2==k for k in [32,200]],[False,False])
check('combined exponent parity',[(5+3)%2,(0+2)%2],[0,0])
check('combined right-hand square',32*200,80*80)
X,Y=41*43,80
check('product representative',[X,X%N],[1763,114])
check('actual square congruence',(X*X-Y*Y)%N,0)
check('nontrivial gcds for full representative',[gcd(X-Y,N),gcd(X+Y,N)],[17,97])
check('nontrivial gcds for reduced representative',[gcd(114-Y,N),gcd(114+Y,N)],[17,97])
check('factorization product',17*97,N)
check('factorization nontriviality',all(1<factor<N for factor in [17,97]),True)
check('trivial candidate really satisfies congruence',(32*32-32*32)%N,0)
check('trivial candidate yields no nontrivial divisor',[gcd(32-32,N),gcd(32+32,N)],[N,1])
check('mixing an unsmooth relation need not make a square',isqrt(32*115)**2==32*115,False)

pack=json.loads((HERE/'author-package.json').read_text())
current=json.loads((ROOT/pack['canonical']['path']).read_text());current_by={g['id']:g for g in current['goals']}
for f in pack['forms']:
    id=f['goalId'];folder=HERE/id
    before=json.loads((folder/'current-whole-goal.json').read_text());after=json.loads((folder/'proposed-whole-goal.draft.json').read_text())
    check(f'{id} whole current goal remains unchanged',current_by[id],before)
    check(f'{id} all previous fields preserved',{k:v for k,v in after.items() if k not in ['nodeKind','examData']},before)
    check(f'{id} curricular text demand unchanged',after['dimensionTags']['demandLevel'],'AB3')
    check(f'{id} draft only',after['examData']['reviewStatus'],'draft')
    check(f'{id} only own existing coverage',after['examData']['coveredGoalIds'],[id])
    check(f'{id} single score',[after['examData']['scoring']['maxPoints'],after['examData']['scoring']['passingPoints']],[20,15])
    check(f'{id} step sum',sum(s['points'] for s in after['examData']['scoring']['steps']),20)
    for field,name in [('taskContent','task.de.md'),('taskContentEn','task.en.md')]:check(f'{id} exact {field}',after['examData'][field],(folder/name).read_text())
    for field,lang in [('solutionContent','de'),('solutionContentEn','en')]:check(f'{id} exact {field}',after['examData'][field],(folder/f'solution.{lang}.md').read_text()+'\n'+(folder/f'rubric.{lang}.md').read_text())
# Compact report: full whole-goal equality checks are already in the bound contracts.
for item in checks:
    if isinstance(item['actual'],(dict,str)) and len(str(item['actual']))>500:
        item['actual']='Full value compared in memory; see the complete bound goal/text files.'
        item['expected']='Full value compared in memory; see the complete bound goal/text files.'
report={'status':'PASS_AUTHOR_EXACT_INTEGER_AND_INVARIANT_CHECKS_NOT_INDEPENDENT_REVIEW','checkCount':len(checks),'checks':checks,'sieveRows':rows,'all187RSAResiduesActuallyChecked':True,'including27NoncoprimeMessages':True,'mathReasoningInBilingualSolutionsStillRequiresIndependentReview':True}
(HERE/'author-exact-mathematics.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','checks':len(checks),'RSAResidues':187,'noncoprimeMessages':27}))
