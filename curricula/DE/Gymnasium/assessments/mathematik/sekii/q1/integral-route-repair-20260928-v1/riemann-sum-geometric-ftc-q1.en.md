# Explain product sums and the geometric fundamental theorem

Consider the area under $f(t)=2t$ on [0,1].

1. Divide [0,1] into n equal strips. Form lower and upper rectangle sums using $1+\cdots+n=n(n+1)/2$. (4 points)
2. Show how the sums converge to a common value, explain the passage to the definite integral and check the triangle area. (4 points)
3. For $A(x)=\int_0^x2t\,dt$, describe the narrow area added from x to x+h. Explain geometrically why $A'(x)=2x$, then use that relationship to determine $\int_1^2 2t\,dt$. (4 points)

## Solution

The lower and upper sums are $L_n=(n-1)/n$ and $U_n=(n+1)/n$. Their difference is 2/n and both approach 1, the definite integral and triangle area. The added area is $\int_x^{x+h}2t\,dt$; dividing by h gives a height approaching 2x, hence $A'(x)=2x$. With $A(x)=x^2$, the integral from 1 to 2 equals 4-1=3.
