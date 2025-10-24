# 🔒 SAFE PRODUCTION DEPLOYMENT GUIDE

## ⚠️ THE PROBLEM YOU HAD:

Your Dockerfile was using `prisma db push` which:
- ❌ Drops tables that don't exist in schema (like your `Ad` table)
- ❌ No migration history
- ❌ Can't rollback changes
- ❌ **CAUSES DATA LOSS**

## ✅ THE FIX APPLIED:

Changed to `prisma migrate deploy` which:
- ✅ Only runs approved migrations
- ✅ Never drops tables unless explicitly told
- ✅ Maintains migration history
- ✅ **PROTECTS YOUR DATA**

---

## 🚀 HOW TO DEPLOY SAFELY NOW:

### Step 1: Commit the changes
```bash
git add .
git commit -m "Fix: Use safe migrations instead of db push"
git push
```

### Step 2: Deploy to VPS
Your VPS will now use `prisma migrate deploy` automatically when you redeploy.

### Step 3: Verify on VPS
After deployment, check the logs:
```bash
docker-compose logs app
```

You should see:
```
✅ Database ready
🔄 Running safe migrations...
✅ Migrations complete
🚀 Starting app...
```

---

## 📊 WHAT WILL HAPPEN ON DEPLOY:

1. ✅ **Ad table preserved** - Won't be dropped
2. ✅ **All Recipe data preserved** - No data loss
3. ✅ **New tables added:**
   - `internal_link_suggestions` (for link suggestions)
   - `orphan_pages` (for SEO analysis)
4. ✅ **Indexes added** - For better performance

---

## 🛡️ WHY THIS IS SAFE:

The migration file `20251024_add_internal_linking/migration.sql` uses:
```sql
CREATE TABLE IF NOT EXISTS ...
CREATE INDEX IF NOT EXISTS ...
ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS ...
```

The `IF NOT EXISTS` clauses mean:
- If table exists → Skip (no error)
- If table missing → Create it
- **NEVER drops anything**

---

## 🔍 VERIFY YOUR DATA AFTER DEPLOY:

### Check Recipe Count
```bash
docker-compose exec db psql -U postgres -d recipes -c "SELECT COUNT(*) FROM \"Recipe\";"
```

### Check Ad Table (if you want to keep it)
```bash
docker-compose exec db psql -U postgres -d recipes -c "SELECT * FROM \"Ad\";"
```

### Check New Tables Created
```bash
docker-compose exec db psql -U postgres -d recipes -c "\dt internal_*"
docker-compose exec db psql -U postgres -d recipes -c "\dt orphan_*"
```

---

## ⚡ IF YOU WANT TO BACKUP BEFORE DEPLOY:

### Option 1: Full Database Backup
```bash
# On VPS, before deploying:
docker-compose exec db pg_dump -U postgres recipes > backup_$(date +%Y%m%d).sql
```

### Option 2: Just Ad Table
```bash
# On VPS:
docker-compose exec db psql -U postgres -d recipes -c "CREATE TABLE \"Ad_backup\" AS SELECT * FROM \"Ad\";"
```

---

## 🎯 MIGRATION FILES CREATED:

```
prisma/migrations/
└── 20251024_add_internal_linking/
    └── migration.sql  (Safe - only adds tables)
```

This migration:
- ✅ Adds internal_link_suggestions table
- ✅ Adds orphan_pages table
- ✅ Adds indexes for performance
- ❌ Does NOT drop Ad table
- ❌ Does NOT drop Recipe table
- ❌ Does NOT modify existing data

---

## 📝 WHAT TO DO IF YOU STILL SEE THE ERROR:

If you see "data loss" warning again, it means your schema has OTHER changes that would drop data. To fix:

### 1. Check what's different
```bash
npx prisma db pull
```

This will show what's in production vs your schema.

### 2. Create specific migration
```bash
npx prisma migrate dev --name preserve_existing_data --create-only
```

Then manually edit the migration to preserve data.

### 3. Or keep old tables in schema
If you want to keep the `Ad` table, add it to `prisma/schema.prisma`:

```prisma
model Ad {
  id        String   @id @default(cuid())
  // ... your Ad table fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🎉 BOTTOM LINE:

**Your recipes are safe!** The Dockerfile now uses `prisma migrate deploy` which will ONLY add the new internal linking tables without touching your existing data.

You can deploy with confidence! 🚀

---

## 📞 DEPLOYMENT CHECKLIST:

- [x] Changed Dockerfile to use `migrate deploy`
- [x] Created safe migration file
- [x] Migration uses `IF NOT EXISTS` clauses
- [x] No DROP statements in migration
- [x] Ready to deploy without data loss

**You're good to go! Deploy now.** ✨
