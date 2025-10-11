# 🔐 API Authentication Guide

## Overview

Your application now supports **TWO types of authentication**:

1. **JWT Tokens** - For admin dashboard (browser-based)
2. **API Tokens** - For automation tools like n8n, Zapier, Make, etc.

---

## 📊 API Authentication Matrix

### ✅ APIs Supporting HYBRID Auth (JWT + API Tokens)

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/admin/authors` | GET, POST | List/Create authors - **NOW SUPPORTS API TOKENS** |
| `/api/admin/authors/[id]` | GET, PUT, DELETE | Get/Update/Delete author - **NOW SUPPORTS API TOKENS** |

### ❌ APIs Supporting JWT ONLY (Dashboard use only)

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/admin/backup` | GET, POST | Backup operations |
| `/api/admin/backup/[id]` | POST, DELETE | Restore/Delete backups |
| `/api/admin/categories` | GET, POST | Category management |
| `/api/admin/categories/[id]` | GET, PUT, DELETE | Category operations |
| `/api/admin/save-robots` | POST | Update robots.txt |

### 🔓 Public APIs (No auth required)

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/recipe` | GET | Get published recipes (public data) |
| `/api/auth/login` | POST | Admin login |

---

## 🚀 How to Use API Tokens with n8n

### Step 1: Generate an API Token

**Currently, API token generation is not implemented in the UI.** You need to create tokens directly in the database:

```sql
INSERT INTO api_tokens (
  id,
  name,
  token,
  created_at,
  expires_at,
  is_active,
  created_by,
  description
) VALUES (
  gen_random_uuid()::text,
  'n8n Integration',
  'rtk_YOUR_RANDOM_STRING_HERE',  -- Must start with 'rtk_'
  NOW(),
  NOW() + INTERVAL '1 year',
  true,
  'admin@guelma.com',
  'Token for n8n automation workflows'
);
```

**Important:** API tokens **must start with `rtk_`** prefix!

Example valid token: `rtk_abc123def456ghi789jkl012mno345pqr`

### Step 2: Configure n8n HTTP Request Node

In your n8n workflow:

1. **Add HTTP Request Node**
2. **Configure URL:**
   ```
   https://your-domain.com/api/admin/authors
   ```

3. **Set Authentication:**
   - Method: `GET` (or `POST`, `PUT`, `DELETE`)
   - Authentication: `Generic Credential Type`
   - Or use `Header Auth`

4. **Add Header:**
   ```
   Key: Authorization
   Value: Bearer rtk_YOUR_TOKEN_HERE
   ```

5. **Test the connection**

### Step 3: Test with cURL

```bash
# List all authors
curl -X GET "https://your-domain.com/api/admin/authors" \
  -H "Authorization: Bearer rtk_YOUR_TOKEN_HERE"

# Get specific author
curl -X GET "https://your-domain.com/api/admin/authors/AUTHOR_ID" \
  -H "Authorization: Bearer rtk_YOUR_TOKEN_HERE"

# Create new author
curl -X POST "https://your-domain.com/api/admin/authors" \
  -H "Authorization: Bearer rtk_YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "bio": "Expert chef",
    "img": "/uploads/john.jpg",
    "avatar": "/uploads/john-avatar.jpg",
    "link": "https://example.com/john"
  }'

# Update author
curl -X PUT "https://your-domain.com/api/admin/authors/AUTHOR_ID" \
  -H "Authorization: Bearer rtk_YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "bio": "Master chef"
  }'

# Delete author
curl -X DELETE "https://your-domain.com/api/admin/authors/AUTHOR_ID" \
  -H "Authorization: Bearer rtk_YOUR_TOKEN_HERE"
```

---

## 🔧 Technical Implementation

### How It Works

The `checkHybridAuthOrRespond()` function checks both auth types:

```typescript
// 1. Extracts Authorization header: "Bearer <token>"
// 2. Checks if token starts with 'rtk_' → API token
// 3. If not, treats it as JWT token
// 4. Verifies against database (API) or JWT_SECRET (JWT)
// 5. Returns authorized: true/false
```

### Auth Flow Diagram

```
Request → checkHybridAuthOrRespond()
           ↓
         Get Authorization Header
           ↓
       Token starts with 'rtk_'?
         ↙            ↘
       YES             NO
        ↓              ↓
   API Token      JWT Token
        ↓              ↓
  Check Database  Verify JWT_SECRET
        ↓              ↓
   Update lastUsedAt  Check expiry
        ↓              ↓
       ✅ Authorized  ✅ Authorized
```

### Code Location

- **Auth Helper:** `lib/auth-standard.ts`
  - `checkHybridAuthOrRespond()` - Main function
  - `requireHybridAuth()` - Low-level verification

- **API Token Verification:** `lib/api-auth.ts`
  - `verifyApiToken()` - Database lookup
  - Updates `lastUsedAt` timestamp

- **Protected Routes:**
  - `app/api/admin/authors/route.ts`
  - `app/api/admin/authors/[id]/route.ts`

---

## 🛠️ Need to Create API Token Management UI?

To make API tokens easier to manage, you should create an admin page:

### Suggested Features

1. **List Tokens** - Show all API tokens with:
   - Name
   - Created date
   - Last used
   - Expires at
   - Active status

2. **Generate Token** - Button to create new token:
   - Auto-generate `rtk_` prefixed string
   - Set expiration (30 days, 90 days, 1 year, never)
   - Add description

3. **Revoke Token** - Disable token (set `isActive: false`)

4. **Delete Token** - Permanently remove

### Quick Implementation Path

Create: `app/admin/api-tokens/page.tsx`
Create: `app/api/admin/api-tokens/route.ts`

Would you like me to create these files for you?

---

## 🔒 Security Best Practices

### API Token Security

1. ✅ **Store tokens securely** - Never commit tokens to git
2. ✅ **Use HTTPS** - Always use SSL in production
3. ✅ **Set expiration** - Tokens should expire after 90 days
4. ✅ **Monitor usage** - Check `lastUsedAt` for suspicious activity
5. ✅ **Rotate regularly** - Replace tokens every 6 months
6. ✅ **Limit scope** - Only give tokens minimum required permissions

### What NOT to Do

- ❌ Don't share tokens between services
- ❌ Don't use tokens in client-side code
- ❌ Don't log tokens in console/files
- ❌ Don't create tokens without expiration

---

## 🐛 Troubleshooting

### "Unauthorized" Error in n8n

**Problem:** Getting 401 Unauthorized response

**Solutions:**

1. **Check token prefix:**
   ```sql
   SELECT token FROM api_tokens WHERE name = 'n8n Integration';
   -- Should start with 'rtk_'
   ```

2. **Check token is active:**
   ```sql
   SELECT is_active, expires_at FROM api_tokens 
   WHERE token = 'rtk_YOUR_TOKEN';
   -- is_active should be true
   -- expires_at should be in the future
   ```

3. **Check Authorization header:**
   - Must be: `Authorization: Bearer rtk_YOUR_TOKEN`
   - NOT: `Authorization: rtk_YOUR_TOKEN` (missing "Bearer")

4. **Check API endpoint:**
   - Use: `/api/admin/authors` ✅
   - NOT: `/admin/authors` ❌

### Token Not Working After Update

If you just updated the code, restart your Next.js server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
# or
npm run build && npm start
```

### Check Token in Database

```sql
-- View all tokens
SELECT 
  name,
  token,
  is_active,
  expires_at,
  last_used_at,
  created_by
FROM api_tokens
ORDER BY created_at DESC;

-- Check specific token
SELECT * FROM api_tokens 
WHERE token = 'rtk_YOUR_TOKEN';
```

---

## 📝 Summary

### What Changed

- ✅ **Authors API** now supports API tokens (was JWT-only)
- ✅ Added `checkHybridAuthOrRespond()` function
- ✅ Tokens with `rtk_` prefix are verified against database
- ✅ JWT tokens continue to work for dashboard

### What You Can Do Now

1. **Generate API token** in database (starts with `rtk_`)
2. **Use token in n8n** with `Authorization: Bearer rtk_...`
3. **Fetch/Create/Update/Delete authors** via API
4. **Monitor token usage** via `lastUsedAt` field

### Next Steps

1. Test API token with cURL
2. Configure n8n workflow
3. (Optional) Create admin UI for token management
4. (Optional) Add more APIs to hybrid auth (backup, categories)

---

## 🤔 Questions?

If you need help with:
- Creating the API token management UI
- Adding hybrid auth to other endpoints
- Setting up token rotation
- Implementing rate limiting

Just ask! 🚀
