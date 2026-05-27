# AgentStack API Endpoints

Base URL: `http://localhost:3000/api`

## Agents

### GET /agents
List all agents with filtering, sorting, and pagination.

**Query Parameters:**
- `search` (string, optional): Search by title, description, or tags
- `category` (string, optional): Filter by category
- `sort` (string, optional): `trending` | `newest` | `rating` | `downloads` (default: `trending`)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 12)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Agent Title",
      "description": "Description",
      "category": ["category"],
      "tags": ["tag1", "tag2"],
      "creator_id": "uuid",
      "downloads_count": 100,
      "views_count": 500,
      "average_rating": 4.5,
      "rating_count": 20,
      "verified": true,
      "featured": false,
      "created_at": "2024-05-26T...",
      "updated_at": "2024-05-26T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 150,
    "totalPages": 13
  }
}
```

### POST /agents
Create a new agent.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": ["string"],
  "tags": ["string"],
  "claude_md_file": "string (optional)",
  "repository_url": "string (optional)",
  "homepage_url": "string (optional)",
  "license": "string (default: MIT)",
  "version": "string (default: 1.0.0)",
  "creator_id": "uuid (required)"
}
```

**Response:** `201 Created`
```json
{
  "data": { /* agent object */ }
}
```

---

### GET /agents/[id]
Get a single agent by ID.

**Response:**
```json
{
  "data": { /* agent object */ }
}
```

### PATCH /agents/[id]
Update an agent (creator only).

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "category": ["string"],
  "tags": ["string"],
  "license": "string",
  "version": "string",
  "repository_url": "string",
  "homepage_url": "string"
}
```

**Response:** `200 OK`

### DELETE /agents/[id]
Delete an agent (creator only).

**Response:** `200 OK`
```json
{
  "message": "Agent deleted successfully"
}
```

---

## Ratings

### GET /agents/[id]/ratings
Get all ratings for an agent.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "agent_id": "uuid",
      "user_id": "uuid",
      "rating": 5,
      "created_at": "2024-05-26T..."
    }
  ],
  "statistics": {
    "total": 20,
    "average": 4.5,
    "distribution": {
      "1": 1,
      "2": 0,
      "3": 2,
      "4": 7,
      "5": 10
    }
  }
}
```

### POST /agents/[id]/ratings
Submit or update a rating.

**Request Body:**
```json
{
  "rating": 5,
  "user_id": "uuid"
}
```

**Response:** `201 Created` (new) or `200 OK` (update)
```json
{
  "data": {
    "id": "uuid",
    "agent_id": "uuid",
    "user_id": "uuid",
    "rating": 5,
    "created_at": "2024-05-26T..."
  }
}
```

### DELETE /agents/[id]/ratings?user_id=uuid
Delete a rating.

**Response:** `200 OK`

---

## Comments

### GET /agents/[id]/comments
Get all comments for an agent.

**Query Parameters:**
- `limit` (number, optional): Max comments to fetch (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "agent_id": "uuid",
      "user_id": "uuid",
      "content": "Great agent!",
      "upvotes": 5,
      "created_at": "2024-05-26T...",
      "updated_at": "2024-05-26T...",
      "user": {
        "id": "uuid",
        "username": "@username",
        "avatar_url": "url"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 150
  }
}
```

### POST /agents/[id]/comments
Add a comment to an agent.

**Request Body:**
```json
{
  "content": "string (1-5000 chars, required)",
  "user_id": "uuid (required)"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "agent_id": "uuid",
    "user_id": "uuid",
    "content": "Great agent!",
    "upvotes": 0,
    "created_at": "2024-05-26T...",
    "user": { /* user object */ }
  }
}
```

### PATCH /agents/[id]/comments/[commentId]
Update a comment (creator only).

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response:** `200 OK`

### DELETE /agents/[id]/comments/[commentId]
Delete a comment (creator only).

**Response:** `200 OK`

---

## File Upload

### POST /upload
Upload an agent file to Supabase Storage.

**Request Body (FormData):**
- `file` (File, required): Max 5MB, allowed types: .txt, .md, .json, .py, .js, .ts
- `user_id` (string, required): User ID
- `agent_id` (string, optional): Agent ID

**Response:** `201 Created`
```json
{
  "data": {
    "path": "user_id/timestamp-random.ext",
    "publicUrl": "https://...",
    "fileName": "original_name.ext",
    "fileSize": 1024,
    "uploadedAt": "2024-05-26T..."
  }
}
```

---

## Users

### GET /users/[id]
Get user profile with stats.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "username": "@username",
    "email": "user@example.com",
    "avatar_url": "url",
    "bio": "User bio",
    "github_username": "github_handle",
    "created_at": "2024-05-26T...",
    "stats": {
      "agents": 5,
      "totalDownloads": 250
    }
  }
}
```

### PATCH /users/[id]
Update user profile.

**Request Body:**
```json
{
  "username": "string (3-30 chars, optional)",
  "bio": "string (optional)",
  "avatar_url": "string (optional)",
  "github_username": "string (optional)"
}
```

**Response:** `200 OK`

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `400 Bad Request`: Missing or invalid parameters
- `401 Unauthorized`: Missing or invalid authorization
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., username taken)
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently no rate limiting is enforced. This should be added for production.

## Authentication

Current implementation expects optional `Authorization` header for routes that require authentication. In production, should validate JWT tokens from Supabase Auth.

## Examples

### Search agents for "AI"
```bash
GET /agents?search=AI&sort=rating&limit=10
```

### Submit a 5-star rating
```bash
POST /agents/uuid/ratings
Content-Type: application/json

{
  "rating": 5,
  "user_id": "user-uuid"
}
```

### Add a comment
```bash
POST /agents/uuid/comments
Content-Type: application/json

{
  "content": "This agent is amazing!",
  "user_id": "user-uuid"
}
```

### Upload an agent file
```bash
POST /upload
Content-Type: multipart/form-data

file: <binary_data>
user_id: uuid
agent_id: uuid
```

---

## Development Notes

- All timestamps are in ISO 8601 format
- UUIDs are used for all IDs
- Database operations use Supabase with Row Level Security
- File storage uses Supabase Storage buckets
