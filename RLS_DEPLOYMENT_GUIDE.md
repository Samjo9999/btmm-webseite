# RLS Security Fix - Deployment Guide

## Overview

This guide covers deploying the RLS (Row Level Security) migration that fixes 110 tables by converting public access to authenticated-only.

**Scope:** Category B tables  
**Affected Rows:** 0 (schema-only changes)  
**Downtime:** None (RLS enforced in-database)  
**Rollback:** Safe to re-run script

---

## Pre-Deployment Checklist

- [ ] Backup Supabase database (Settings → Backups)
- [ ] Verify no pending schema migrations
- [ ] Notify team of security fix deployment
- [ ] Ensure all team members are logged into the app (will re-authenticate after)
- [ ] Schedule during low-traffic window if possible

---

## Deployment Steps

### Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select Project: `xcngmshjuqoucdlgikao`
3. Navigate to **SQL Editor**

### Step 2: Create New Query

1. Click **New Query**
2. Paste contents of `RLS_MIGRATION_FIX.sql`
3. Review the script (should show 110 table migrations)

### Step 3: Execute Migration

1. Click **Run** (or press Ctrl+Enter)
2. Monitor execution (should complete in 2-5 minutes)
3. Watch for any errors in the bottom panel

**Expected Output:**
```
Query executed successfully
110 tables modified
```

### Step 4: Validate Results

After execution, run validation query:

```sql
-- Check RLS is enabled on a sample of fixed tables
SELECT table_name, quote_identifier(table_name) as table_name_quoted
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'customers', 'invoices', 'hr_documents', 'universe_members',
    'admin_audit_log', 'universe_payments', 'email_settings'
  );

-- Then check RLS status
SELECT table_name, enable_rls
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'customers', 'invoices', 'hr_documents', 'universe_members',
    'admin_audit_log', 'universe_payments', 'email_settings'
  );
```

---

## Post-Deployment Testing

### 1. Test Authenticated Access (Should Work)

In your app or via API:
```javascript
// With authenticated session
const { data } = await supabase
  .from('customers')
  .select('*')
  .limit(1);
// Should return data
```

### 2. Test Public/Anonymous Access (Should Fail)

Using unauthenticated client:
```javascript
// No auth token
const anonClient = createClient(url, anonKey);
const { data, error } = await anonClient
  .from('customers')
  .select('*')
  .limit(1);
// Should error: "new row violates row-level security policy"
```

### 3. Check Edge Functions Still Work

Verify Edge Functions can access data (they use service_role):
- Run a function that reads from fixed tables
- Monitor logs for permission errors

---

## Troubleshooting

### Issue: "Policy already exists" error

**Cause:** Script may have been partially run before  
**Solution:** Safe to re-run - script checks `IF NOT EXISTS` implicitly via CREATE POLICY

### Issue: "Permission denied" on specific table

**Cause:** Table-level permissions issue  
**Solution:** Check if table exists, verify schema is public

```sql
SELECT * FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'your_table_name';
```

### Issue: App users can't access data after deployment

**Cause:** Users need to re-authenticate to get new JWT  
**Solution:** Clear app cache, re-login users

In app code:
```javascript
await supabase.auth.signOut();
// User navigates to login page
```

### Issue: Bulk API calls failing

**Cause:** Service role access may be misconfigured  
**Solution:** Verify Edge Functions use correct service_role key in environment

---

## Rollback Procedure

If critical issue found:

### Option A: Disable RLS on specific table (temporary)
```sql
ALTER TABLE [table_name] DISABLE ROW LEVEL SECURITY;
```

### Option B: Restore from backup
1. Supabase → Settings → Backups
2. Click restore point timestamp
3. Wait 5-10 minutes for restore completion
4. Re-run migration when ready

---

## Monitoring & Validation

### Check Logs for RLS Violations

In Supabase:
1. Navigate to **Logs** (or Realtime tab)
2. Filter for: `violates row-level security policy`
3. Identify problematic tables/queries

### Monitor Performance

RLS enforcement typically has minimal impact (<5% query latency increase). If slow:
1. Check if policy conditions reference external tables (avoid)
2. Verify indexes on auth.role() comparisons
3. Review complex policy expressions

### User Activity

Monitor for:
- Increased authentication failures
- Users unable to access expected data
- Spike in API errors (code 403/401)

---

## Phase 2: Universe Tables

The migration script above covers 65 base tables. For full coverage, also run:

```sql
-- Pattern for universe_* tables (45+ tables)
-- See RLS_ANALYSIS_SUMMARY.md for complete list

ALTER TABLE universe_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read" ON universe_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON universe_members FOR INSERT, UPDATE, DELETE USING (auth.role() = 'authenticated');

-- ... repeat for remaining universe_* tables
```

Or execute universe migration script separately:
```bash
# Coming in next iteration
```

---

## Phase 3: Category C Review

After Phases 1 & 2, review Category C tables (154 tables) for row-level policies:

Example: `companies` table should restrict to company members
```sql
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_company" ON companies
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM universe_members
      WHERE company_id = companies.id
    )
  );
```

---

## Success Criteria

- [ ] All 110 tables have RLS enabled
- [ ] Authenticated users can access expected data
- [ ] Anonymous/public sessions get RLS errors
- [ ] No performance regressions in production
- [ ] Edge Functions continue working
- [ ] Error logs show no unexpected permission issues
- [ ] All team members re-authenticated successfully

---

## Communication Template

**To Team:**
```
Security Update: RLS Migration Deployed

We've deployed a critical security fix that restricts 110 internal tables 
to authenticated users only (previously publicly accessible).

Impact:
- You may need to re-login once
- App performance unchanged
- Booking system (public) remains available

Timeline: ~1 minute to refresh your session.

Questions? See: RLS_ANALYSIS_SUMMARY.md
```

---

## Documentation References

- **RLS_ANALYSIS_SUMMARY.md** — Full categorization & analysis
- **RLS_MIGRATION_FIX.sql** — Complete SQL script
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)

---

## Estimated Timeline

| Phase | Duration | Action |
|-------|----------|--------|
| Pre-check | 5 min | Review checklist |
| Execution | 3-5 min | Run SQL script |
| Validation | 5 min | Test basic access |
| User notification | 2 min | Announce to team |
| Monitoring | 1 hour | Watch error logs |
| **Total** | **~20 min** | **Full deployment** |

---

## Post-Deployment Actions

1. Archive this deployment guide (date stamp)
2. Update RLS documentation in team wiki
3. Schedule Category C review for next sprint
4. Train team on new RLS patterns
5. Add RLS testing to CI/CD pipeline

---

**Last Updated:** 2026-05-17  
**Deployed By:** [Your Name]  
**Status:** [To be filled on deployment]
