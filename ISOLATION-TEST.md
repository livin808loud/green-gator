# Isolation test — 2026-08-20T20:19:30

## Setup
- Tenant #1 Green Gator: `11111111-1111-4111-8111-111111111111` (owner `e41e1662-98d6-4b92-9df3-7d04c6d0eb79`)
- Isolation user: `gg-isolation-test@greengator.local` / `e50ed8a0-191b-4cba-9f77-aa7f71c603b0`
- Isolation org: `06a414e2-aa24-496c-a112-8a6ebdbcd653` (Isolation Test Carrier LLC)
- Marker load: `ISO-TEST-PICKUP` / comments `isolation-canary`

## Fixes applied during test
- `gg_log.id` now has a sequence default (was missing → insert PK collisions for new tenants)

## Results
| Check | Result |
|-------|--------|
| create_org for user2 | **PASS** → `06a414e2-aa24-496c-a112-8a6ebdbcd653` |
| user2 GET org1 loads (forced filter) | **PASS** → 0 rows |
| user2 GET org1 config | **PASS** → [] |
| user2 list loads (no filter) | **PASS** → only own org (after canary insert) |
| user2 insert own load | **PASS** (after sequence fix) |
| shared orgs between owner and user2 | **PASS** → 0 |
| service counts | org1=90 · org2=1 |

## Verdict
**Isolation holds for SaaS dogfood.** Second carrier cannot read Green Gator rows.

## Cleanup (optional)
```sql
delete from public.gg_log where org_id = '06a414e2-aa24-496c-a112-8a6ebdbcd653';
delete from public.org_members where org_id = '06a414e2-aa24-496c-a112-8a6ebdbcd653';
delete from public.subscriptions where org_id = '06a414e2-aa24-496c-a112-8a6ebdbcd653';
delete from public.orgs where id = '06a414e2-aa24-496c-a112-8a6ebdbcd653';
-- optional: delete from auth.users where id = 'e50ed8a0-191b-4cba-9f77-aa7f71c603b0';
```

Do **not** leave the isolation password in git. User password is ephemeral per run.
