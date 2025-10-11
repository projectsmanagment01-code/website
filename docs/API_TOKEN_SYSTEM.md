# API Token Management System

## Overview

The API Token Management System provides secure access control for your website's API endpoints. This system allows administrators to generate, manage, and revoke API tokens with different expiration periods.

## Features

### 🔐 Token Generation
- **Secure Token Generation**: Uses crypto.randomBytes for cryptographically secure tokens
- **Configurable Expiration**: 7 days, 1 month, 6 months, or 1 year
- **Token Naming**: Descriptive names for easy identification
- **Optional Descriptions**: Add context for each token's purpose

### 🛡️ Security Features
- **Token Masking**: Full tokens only shown once during creation
- **Access Control**: Admin authentication required for all operations
- **Expiration Tracking**: Automatic expiration handling
- **Usage Tracking**: Last used timestamps
- **Token Revocation**: Immediate token invalidation

### 📊 Management Interface
- **Dashboard Integration**: Seamlessly integrated into admin dashboard
- **Token Statistics**: Overview of active, expired, and inactive tokens
- **Bulk Operations**: Activate/deactivate multiple tokens
- **Search & Filter**: Find tokens quickly
- **Audit Trail**: Track token creation and usage

## API Endpoints

### `GET /api/admin/tokens`
Retrieve all API tokens for the authenticated admin.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "tokens": [
    {
      "id": "token_id",
      "name": "Token Name",
      "token": "****-****-****-abcd1234",
      "createdAt": "2025-01-20T10:00:00Z",
      "expiresAt": "2025-02-20T10:00:00Z",
      "isActive": true,
      "lastUsedAt": "2025-01-21T15:30:00Z",
      "createdBy": "admin",
      "description": "Token description"
    }
  ]
}
```

### `POST /api/admin/tokens`
Create a new API token.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Mobile App Token",
  "duration": "1month",
  "description": "Token for mobile application access"
}
```

**Duration Options:**
- `7days`: 7 days
- `1month`: 30 days
- `6months`: 180 days
- `1year`: 365 days

**Response:**
```json
{
  "message": "API token created successfully",
  "token": {
    "id": "new_token_id",
    "name": "Mobile App Token",
    "token": "rtk_abcdef1234567890...",
    "expiresAt": "2025-02-20T10:00:00Z",
    "description": "Token for mobile application access"
  }
}
```

### `PATCH /api/admin/tokens`
Update token status (activate/deactivate).

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "id": "token_id",
  "isActive": false
}
```

### `DELETE /api/admin/tokens?id=<token_id>`
Permanently revoke an API token.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

## Using API Tokens

### Authentication
Include the API token in the Authorization header:

```
Authorization: Bearer rtk_your_api_token_here
```

### Example Usage
```javascript
// Using fetch
const response = await fetch('/api/your-endpoint', {
  headers: {
    'Authorization': 'Bearer rtk_your_api_token_here',
    'Content-Type': 'application/json'
  }
});

// Using axios
const response = await axios.get('/api/your-endpoint', {
  headers: {
    'Authorization': 'Bearer rtk_your_api_token_here'
  }
});
```

## Token Format

API tokens follow this format:
```
rtk_<64_character_hex_string>
```

Example: `rtk_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

## Security Best Practices

### For Administrators
1. **Use Descriptive Names**: Make it easy to identify token purposes
2. **Set Appropriate Expiration**: Choose the shortest duration that meets your needs
3. **Regular Audits**: Periodically review and clean up unused tokens
4. **Immediate Revocation**: Revoke tokens when no longer needed
5. **Monitor Usage**: Check last used timestamps to identify inactive tokens

### For Developers
1. **Secure Storage**: Store tokens securely, never in client-side code
2. **Environment Variables**: Use environment variables for production tokens
3. **Error Handling**: Implement proper error handling for token expiration
4. **Token Rotation**: Regularly rotate tokens for enhanced security
5. **Limited Scope**: Request tokens with minimal required permissions

## Database Schema

```sql
CREATE TABLE api_tokens (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  token       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at  TIMESTAMP NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  created_by  TEXT NOT NULL,
  description TEXT
);

-- Indexes for performance
CREATE INDEX idx_api_tokens_token ON api_tokens(token);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_active);
CREATE INDEX idx_api_tokens_expires ON api_tokens(expires_at);
```

## Admin Dashboard Usage

### Accessing Token Management
1. Log into the admin dashboard
2. Navigate to "API Tokens" in the sidebar
3. View existing tokens and their status

### Creating a New Token
1. Click "Create Token" button
2. Enter a descriptive name
3. Select expiration duration
4. Add optional description
5. Click "Create Token"
6. **Important**: Copy the full token immediately (only shown once)

### Managing Existing Tokens
- **View Details**: Click on any token to see full details
- **Copy Token**: Use the copy button (only shows masked version after creation)
- **Toggle Status**: Activate/deactivate tokens without deleting
- **Revoke Token**: Permanently delete tokens that are no longer needed
- **Monitor Usage**: Check last used timestamps to identify inactive tokens

### Token Statistics
The dashboard provides overview statistics:
- **Total Tokens**: Total number of created tokens
- **Active**: Currently active and non-expired tokens
- **Expired**: Tokens that have passed their expiration date
- **Inactive**: Manually deactivated tokens

## Troubleshooting

### Common Issues

**Token Not Working**
1. Check if token is active
2. Verify expiration date
3. Ensure proper Authorization header format
4. Check for typos in the token

**Unauthorized Errors**
1. Verify token hasn't expired
2. Check if token is active
3. Ensure you're using the correct endpoint
4. Verify admin permissions

**Creation Failures**
1. Check admin authentication
2. Verify all required fields are provided
3. Ensure unique token names
4. Check database connectivity

### Error Codes
- `401 Unauthorized`: Invalid or missing admin token
- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Database or server issues

## Migration from Existing Systems

If you're migrating from another authentication system:

1. **Audit Existing Tokens**: Document all current API access
2. **Create Equivalent Tokens**: Generate new tokens for each use case
3. **Update Applications**: Replace old tokens with new ones
4. **Test Thoroughly**: Verify all integrations work
5. **Revoke Old Tokens**: Clean up deprecated authentication

## Future Enhancements

Planned features for future releases:
- **Rate Limiting**: Per-token rate limits
- **Scoped Permissions**: Fine-grained access control
- **Token Analytics**: Usage statistics and patterns
- **Webhook Notifications**: Alerts for suspicious activity
- **Batch Operations**: Bulk token management
- **API Key Rotation**: Automatic token renewal