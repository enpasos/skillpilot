from fractions import Fraction as F
import json

def product(a, b):
    return [[sum(x * y for x, y in zip(row, column)) for column in zip(*b)] for row in a]
def identity(n):
    return [[F(i == j) for j in range(n)] for i in range(n)]
def render(matrix):
    return [[str(x) for x in row] for row in matrix]

a = [[F(3), F(1)], [F(1), F(1)]]
b = [[F(1, 2), F(-1, 2)], [F(-1, 2), F(3, 2)]]
d = [[F(2), F(0), F(0)], [F(0), F(-4), F(0)], [F(0), F(0), F(1, 2)]]
e = [[F(1, 2), F(0), F(0)], [F(0), F(-1, 4), F(0)], [F(0), F(0), F(2)]]
image_a = [[F(2), F(1)], [F(1), F(1)]]
image_b = [[F(1), F(-1)], [F(-1), F(2)]]
assert product(a, b) == identity(2)
assert product(b, a) == identity(2)  # Verified here; not an extra learner obligation.
assert product(d, e) == identity(3)
assert product(image_a, image_b) == identity(2)
unscaled = [[F(1), F(-1)], [F(-1), F(3)]]
partial = [[F(1, 2), F(0)], [F(-1, 2), F(0)]]
wrong_sign = [[F(1, 2), F(0), F(0)], [F(0), F(1, 4), F(0)], [F(0), F(0), F(2)]]
assert product(a, unscaled) == [[F(2), F(0)], [F(0), F(2)]]
assert product(a, image_b) != identity(2)
assert product(a, partial)[0][0] == 1 and product(a, partial) != identity(2)
assert product(d, wrong_sign) != identity(3)
print(json.dumps({'determinant2':str(a[0][0]*a[1][1]-a[0][1]*a[1][0]),
    'case1FullAB':render(product(a,b)), 'case2FullDE':render(product(d,e)),
    'actualV2ExampleProduct':render(product(image_a,image_b)),
    'unscaledAdjugateFails':render(product(a,unscaled)), 'copiedImageInverseFails':render(product(a,image_b)),
    'oneCorrectEntryIsInsufficient':render(product(a,partial)), 'lostNegativeSignFails':render(product(d,wrong_sign)),
    'reverseProductIsNotAdditionalTaskRequirement':True},ensure_ascii=False,indent=2))
