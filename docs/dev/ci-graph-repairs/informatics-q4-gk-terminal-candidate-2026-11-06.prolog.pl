% Reference program for the separate six-goal candidate; not released.
parent(ada,ben).
parent(ada,clara).
parent(ben,dora).
parent(clara,emil).
grandparent(X,Z) :- parent(X,Y), parent(Y,Z).
sibling(X,Y) :- parent(P,X), parent(P,Y), X \= Y.

role(ada,staff).
role(ben,student).
role(clara,staff).
badge(ada,valid).
badge(ben,valid).
badge(clara,expired).
zone(lab,staff).
zone(library,student).
can_enter(P,Z) :- role(P,R), zone(Z,R), badge(P,valid).
needs_renewal(P) :- badge(P,expired).
