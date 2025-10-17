# Quick Start Guide - Security Migration

## ✅ What Was Done

All configuration files have been moved from the **public** `uploads/` directory to the **secure** `data/config/` directory to prevent unauthorized access to sensitive data including API keys.

---

## 🚀 Next Steps

### 1. Test Your Site (5 minutes)

Start your development server and test:

```powershell
npm run dev
```

Visit these pages:
- ✓ Admin panel: http://localhost:3000/admin
- ✓ Site settings: http://localhost:3000/admin/settings/site
- ✓ Homepage: http://localhost:3000
- ✓ AI settings: http://localhost:3000/admin/settings/ai

### 2. Run the Cleanup Script (1 minute)

After confirming everything works, delete the old public files:

```powershell
.\scripts\cleanup-old-config-files.ps1
```

This will:
- Check that new files exist in `data/config/`
- List old files to be deleted
- Ask for confirmation before deleting
- Remove exposed configuration files

### 3. Secure Your API Keys (2 minutes)

Your API keys are currently in `data/config/ai-settings.json`. For better security, move them to environment variables:

1. Create or edit `.env.local`:
```bash
GEMINI_API_KEY=AIzaSyC_oeScJEKg1cf-xKUTS3DlgXGoRiPqNO0
OPENAI_API_KEY=your-openai-key-here
```

2. Add to `.gitignore`:
```
.env.local
data/config/*.json
```

---

## 📋 What Changed

### Files Moved
```
OLD (Public):              NEW (Secure):
uploads/ai-settings.json → data/config/ai-settings.json
uploads/content/site.json → data/config/site.json
uploads/content/home.json → data/config/home.json
uploads/contact-content.json → data/config/contact-content.json
uploads/cookies-content.json → data/config/cookies-content.json
```

### Files Updated (19 files)
All references updated to use the new secure location:
- 9 Admin API routes
- 3 Public API routes  
- 7 Library/utility files

---

## ⚠️ Important Notes

### About custom-code-settings.json
This file is **orphaned** (not used by any code). Your custom code is actually stored in the **database** via Prisma. You can safely delete this file immediately:

```powershell
Remove-Item "uploads\custom-code-settings.json" -Force
```

### Automatic Migration
The system will automatically migrate files on first use:
1. Checks if file exists in `data/config/`
2. If not found, copies from old `uploads/` location
3. Uses the new location for all future operations

This means **zero downtime** - everything continues working during migration.

---

## 🔒 Security Improvements

**Before:**
- ❌ API keys accessible at `/uploads/ai-settings.json`
- ❌ Site config accessible at `/uploads/content/site.json`
- ❌ Anyone could read these files via direct URL

**After:**
- ✅ API keys in `data/config/` (not served by Next.js)
- ✅ Configuration files protected from public access
- ✅ Only authenticated admin API routes can access them

---

## 📖 Full Documentation

For complete details, see: `docs/SECURITY_MIGRATION_COMPLETE.md`

---

## 🆘 Troubleshooting

**"Site not loading"**
- Check if `data/config/` directory exists
- Run: `Test-Path "data\config"`

**"Admin panel not working"**
- Check browser console for errors
- Check terminal for API errors
- Old files may not have migrated yet - system will do this on first use

**"Want to rollback"**
- Don't delete old files yet
- System will read from `uploads/` if `data/config/` doesn't exist

---

**Status:** ✅ Migration Complete - Ready for Testing
