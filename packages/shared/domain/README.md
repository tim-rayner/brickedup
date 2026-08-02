# `@repo/domain`

Shared Bricked Up domain validation (Zod) and rules.

Shapes are **derived from** `@repo/db` Drizzle tables via `drizzle-zod`, then refined for product invariants (trim/max lengths, age, activation). Uses `zod/v4` (compatible with `zod@^3.25`).

See [docs/adr/0002-drizzle-as-schema-source-of-truth.md](../../../docs/adr/0002-drizzle-as-schema-source-of-truth.md).

```ts
import { userSchema, evaluateProfileActivation } from '@repo/domain';
```
