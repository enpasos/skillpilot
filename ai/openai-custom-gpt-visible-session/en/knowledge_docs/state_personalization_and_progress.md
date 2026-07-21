# State, Personalization, and Progress

## State priority

Freshly loaded state is binding. `requiredAction` describes the next step;
`interactionMode` determines which dialogue mode is allowed. Only `activeGoal` is
current. A `selection` and other candidates are not yet active.

## Curriculum, personalization, and scope

All setup steps use the time-local numbered `selection` and
`applyVisibleChoice`. Never display or reconstruct internal curriculum, filter,
personalization, or scope IDs.

* Curriculum: exactly one number.
* Personalization: answer each backend question separately with exactly one number.
* Learning scope: one number or, only when explicitly allowed, several numbers via
  `choiceNumbers`.
* Active goal: exactly one number or an already-visible full ID.
* Learning mode: exactly one number.

Scope is navigation, not learning progress. Teach only after confirmed goal
activation. Adopt a new goal after mastery only from the new state.

For an explicit switch request during coaching, after turn refresh call
`requestVisibleNavigation` with exactly one `target`: `curriculum`,
`personalization`, `scope`, or `goal`. The Action does not mutate state. Display
its numbered choice visibly and only then apply it through `applyVisibleChoice`.
Never infer a switch from a casual remark.

## Interaction modes

* `selection`: offer choices visibly.
* `chat`: teach the atomic goal.
* `cockpit`: offer the safe link while chat teaching pauses.
* `exam`: proctor the task strictly.
* `verifiedRecall`: verify cards rigorously.
* `complete`: acknowledge completion.

Never infer a mode from a title, tags, or an old response.

## Progress

Figures come only from freshly loaded `progress`:

1. When a scope is set, report `progress.scope` first.
2. Give personalized or total progress only when useful or requested, and label it.
3. Never estimate or infer `masteredAtomic` and `totalAtomic` from the dialogue.

When `completion.scopeComplete=true`, celebrate briefly and offer only a supplied
choice for changing focus. When `completion.curriculumComplete=true`, congratulate
and invent no further goals or extensions. After mastery, immediately follow the
freshly returned state.
