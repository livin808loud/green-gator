# Claim Green Gator tenant #1 (required once)

Multi-tenant RLS is live. Cloud data only loads for a signed-in user who is in `org_members`.

## 1. Create your Auth user

Supabase Dashboard → **Authentication** → **Users** → **Add user**

- Email: your real email
- Password: set one (use Password sign-in in the app)
- Auto-confirm: **ON**

Copy the user **UUID**.

## 2. Auth URL config (magic link / redirects)

Authentication → **URL Configuration**

- **Site URL:** `https://livin808loud.github.io/green-gator/`
- **Redirect URLs:** add
  - `https://livin808loud.github.io/green-gator/`
  - `http://localhost:5500/` (optional local)
  - `http://127.0.0.1:5500/` (optional local)

## 3. Link yourself to tenant #1

SQL Editor → run (paste your UUID):

```sql
insert into public.org_members (org_id, user_id, role)
values (
  '11111111-1111-4111-8111-111111111111',
  'PASTE-YOUR-AUTH-USER-UUID-HERE',
  'owner'
);
```

## 4. Sign in on the dashboard

Open the deployed app → Password sign-in with that email/password.

You should see CLOUD + your data again.

## 5. Isolation check (before any beta user)

1. Add a second Auth user with a different email.
2. Sign in as them → should see **No carrier linked**.
3. (Optional) `select create_org('Test Carrier LLC', null, null, null);` as that user.
4. Confirm neither account sees the other's `gg_log` rows.

## Hosting note

GitHub Pages is fine for CDN. For SaaS launch, prefer **Cloudflare Pages** (commercial free tier, `_headers`, preview deploys, Workers for Stripe webhook). Buy a real domain before taking cards. Keep Supabase for DB/Auth/Edge Functions. Make the GitHub repo **private** before public launch so dispatch logic is not open source to competitors.
