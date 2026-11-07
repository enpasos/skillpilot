% Candidate reference program; not released. Clause and goal order are part of the traces.
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

member_id(X,[X|_]).
member_id(X,[_|Xs]) :- member_id(X,Xs).
length_list([],0).
length_list([_|Xs],N) :- length_list(Xs,M), N is M+1.
append_list([],Ys,Ys).
append_list([X|Xs],Ys,[X|Zs]) :- append_list(Xs,Ys,Zs).
reverse_list([],[]).
reverse_list([X|Xs],R) :- reverse_list(Xs,T), append_list(T,[X],R).

edge(start,a).
edge(start,b).
edge(a,finish).
edge(b,a).
edge(a,start).
path(S,T,P) :- walk(S,T,[S],Rev), reverse_list(Rev,P).
walk(T,T,V,V).
walk(V,T,Seen,P) :- edge(V,N), \+ member_id(N,Seen), walk(N,T,[N|Seen],P).

candidate_gate(west).
candidate_gate(east).
open(east).
gate_bug(X) :- candidate_gate(X), !, open(X).
gate(X) :- candidate_gate(X), open(X).
first_open(X) :- candidate_gate(X), open(X), !.

total_rel([],0).
total_rel([X|Xs],T) :- total_rel(Xs,R), T is (X+1)+R.
