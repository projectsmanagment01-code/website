# API Token Persistent View Feature

## Overview
Enhanced the API Token Manager to allow viewing and copying tokens multiple times, not just once after creation.

## Problem
Previously, API tokens were only shown in full once (immediately after creation). After that, the GET endpoint returned masked tokens (`****-****-****-XXXXXXXX`) for security. Users couldn't view or copy tokens later, making it difficult to retrieve them when needed.

## Solution
Implemented a browser localStorage-based approach that stores full tokens locally while maintaining server-side security:

### Implementation Details

1. **Token Storage** (Line ~105-109)
   - When a token is created, the full token is stored in `localStorage` under `api_tokens_full`
   - Format: `{ tokenId: fullToken }`
   - Only tokens created in this browser session are stored

2. **Token Retrieval Helper** (Line ~177-181)
   ```typescript
   const getFullToken = (tokenId: string, maskedToken: string): string => {
     const storedTokens = JSON.parse(localStorage.getItem('api_tokens_full') || '{}');
     return storedTokens[tokenId] || maskedToken;
   };
   ```

3. **Token Display** (Line ~344-346)
   - Shows masked token by default (`****-****-****-XXXXXXXX`)
   - Click eye icon to reveal full token (if available in localStorage)
   - If not in localStorage, shows masked version

4. **Copy Functionality** (Line ~354)
   - Copy button uses `getFullToken()` to copy full token if available
   - Falls back to masked token if not in localStorage

5. **Cleanup** (Line ~138-141)
   - When token is deleted/revoked, also removed from localStorage
   - Prevents accumulation of deleted tokens

## Security Considerations

### Pros
- ✅ Tokens still masked by default in UI
- ✅ Server never exposes full tokens after creation (API security maintained)
- ✅ Only visible to user who created them in that browser
- ✅ User convenience: can view/copy tokens anytime

### Cons
- ⚠️ Tokens stored in browser localStorage (accessible via DevTools)
- ⚠️ If user clears browser data, tokens are lost (need to regenerate)
- ⚠️ Only works in the browser where token was created

### Alternative Approaches Considered

1. **Database Encryption + Decrypt Endpoint**
   - More secure but complex
   - Requires encryption/decryption infrastructure
   - Adds server-side complexity

2. **Regenerate Instead of View**
   - Best security practice (like GitHub)
   - But user loses old token, breaking existing integrations
   - Not suitable for production tokens

3. **Session Storage Only**
   - More secure than localStorage
   - But lost on browser close/refresh
   - Poor UX for long-running tokens

## Usage

### For Admin Users

1. **Create Token**
   - Click "Create Token" button
   - Fill in name, duration, description
   - Token is shown and automatically saved

2. **View Token Later**
   - Find token in token list
   - Click eye icon (👁️) to reveal full token
   - Click again (🙈) to hide it

3. **Copy Token**
   - Click copy button (📋)
   - Copies full token if available
   - Checkmark appears when copied

### For Developers

The token storage structure in localStorage:
```json
{
  "api_tokens_full": {
    "token-id-1": "rtk_abc123...",
    "token-id-2": "rtk_def456...",
    "token-id-3": "rtk_ghi789..."
  }
}
```

## UI Changes

1. **Token Created Modal**
   - Changed from yellow warning to blue info
   - Updated message: "Copy your token now. You can also view it later by clicking the eye icon in the token list."
   - Less alarming, more helpful

2. **Token List**
   - Added tooltips to eye and copy buttons
   - Eye icon toggles between visible/hidden state
   - Copy button always copies full token (if available)

## Files Modified

- `components/admin/ApiTokenManager.tsx`
  - Added `getFullToken()` helper function
  - Modified `createToken()` to store in localStorage
  - Modified `deleteToken()` to remove from localStorage
  - Updated token display logic
  - Updated token created modal styling and message

## Testing

### Test Cases

1. **Create New Token**
   - ✅ Token appears in modal
   - ✅ Token stored in localStorage
   - ✅ Token copyable from modal

2. **View Token Later**
   - ✅ Token masked by default
   - ✅ Click eye icon reveals full token
   - ✅ Click again hides it

3. **Copy Token**
   - ✅ Copy button copies full token
   - ✅ Checkmark appears on success

4. **Delete Token**
   - ✅ Token removed from database
   - ✅ Token removed from localStorage
   - ✅ Token removed from UI

5. **Browser Refresh**
   - ✅ Tokens still viewable after refresh
   - ✅ localStorage persists

6. **Token Not in localStorage**
   - ✅ Shows masked token
   - ✅ Copy button copies masked token
   - ✅ No errors or crashes

## Migration Notes

- Existing tokens (created before this update) won't be in localStorage
- They will show as masked until regenerated
- This is expected and secure behavior
- User should regenerate tokens if full access needed

## Future Enhancements

1. **Export/Import Tokens**
   - Allow exporting tokens to encrypted file
   - Import on different browser/machine

2. **Token Expiry Warning**
   - Show notification when token nearing expiration
   - Suggest regeneration

3. **Usage Statistics**
   - Show last used date in UI
   - Track API calls per token

4. **Encrypted localStorage**
   - Encrypt tokens before storing in localStorage
   - Add extra security layer

## Related Documentation

- `docs/API_TOKEN_SYSTEM.md` - Complete API token system documentation
- `app/api/admin/tokens/route.ts` - Token CRUD API endpoints
- `lib/api-auth.ts` - Token verification logic

## Date
January 2025
