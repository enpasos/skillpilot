# Learning-unit catalogs

One JSON file per canonical subject landscape. A catalog assigns atomic goals of
that landscape to learning units; it copies no goal data and changes no goal,
edge, assessment or source claim. Format and validation rules:
`contracts/drafts/learning-unit/v1/README.md`.

```bash
npm --prefix app run validate:learning-units
```

The catalogs have no runtime effect yet. Implicit recognition is not implemented
in the backend; until it is, every goal is completed through its own explicit
result exactly as before.

| File | Landscape | State |
| --- | --- | --- |
| `mathematik.json` | Canonical Gymnasium Mathematics | `partial`; first pilot unit |

Review records for unit coverage (rule R2) live in
`curricula/DE/Gymnasium/quality/learning-units/`.
