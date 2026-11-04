# Worked solution: qualitative second-order investigation

**1. Meaning**

The highest derivative present is $y''$, so the equation is second order.
$y'$ is velocity and $y''$ is acceleration. If $y>0$, then $y''<0$;
if $y<0$, then $y''>0$; if $y=0$, then $y''=0$.
At nonzero displacement, acceleration points towards equilibrium and is
therefore restoring. It need not point in the direction of the velocity.

**2. Candidates**

For $u$, $u'=-4\sin(2t)$ and $u''=-8\cos(2t)=-4u$.
Also $u(0)=2$ and $u'(0)=0$, so all conditions hold.
For $v$, $v'=-8\sin(4t)$ and $v''=-32\cos(4t)=-16v$,
which is not $-4v$. Both initial conditions hold, but already at $t=0$,
$v''(0)=-32$ differs from $-4v(0)=-8$.
For $w$, $w'=-4e^{-2t}$ and $w''=8e^{-2t}=4w$.
The equation fails, and $w'(0)=-4$ instead of $0$ as well.
The fact that $w(0)=2$ is not sufficient.

**3. Periodic behaviour**

The displacements at the listed times are $2,0,-2,0,2$ cm.
The graph starts at the positive maximum, falls through equilibrium to the
negative minimum, then rises through equilibrium to the positive maximum.
Amplitude is $2$ cm and period is $\pi$ s.
At $t=0$, $y=2$, $y'=0$, $y''=-8$ (in cm, cm/s, and cm/s² respectively).
This is a turning point with acceleration towards equilibrium.
At $t=\pi/4$, $y=0$, $y'=-4$, $y''=0$.
Velocity is not zero: the oscillator crosses equilibrium with zero
instantaneous acceleration. At $t=\pi/2$, correspondingly,
$y=-2$, $y'=0$, $y''=8$.
A correct sketch with explanation, or another suitable turning point and
equilibrium crossing, demonstrates the same performance.

**4. Second behaviour**

$z'=-3\sin(3t)$ and $z''=-9\cos(3t)=-9z$.
This solution is also sinusoidal and periodic, with amplitude $1$ cm and
a start at the positive maximum. Its period is $2\pi/3$ s, shorter than
$\pi$ s. The second oscillator completes a cycle in two thirds of the
time of the first. No general solution family is required for either
equation.
