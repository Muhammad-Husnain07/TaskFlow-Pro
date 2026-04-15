# TaskFlow Pro API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### Register
```
POST /auth/register
Body: { name, email, password }
Response: { token, user: { id, name, email, avatar } }
```

#### Login
```
POST /auth/login
Body: { email, password }
Response: { token, user: { id, name, email, avatar } }
```

#### Get Current User
```
GET /auth/me
Auth: Required
Response: { id, name, email, avatar, bio }
```

#### Update Profile
```
PUT /auth/profile
Auth: Required
Body: { name?, bio? }
Response: { id, name, email, avatar, bio }
```

#### Upload Avatar
```
POST /auth/avatar
Auth: Required
Body: FormData with 'avatar' file
Response: { avatar }
```

#### Change Password
```
PUT /auth/password
Auth: Required
Body: { currentPassword, newPassword }
Response: { message }
```

### Projects

#### Get Projects
```
GET /projects
Auth: Required
Query: ?page=1&limit=10&search=&sortBy=newest
Response: { data: [...], pagination: {...} }
```

#### Create Project
```
POST /projects
Auth: Required
Body: { name, description?, color?, tags? }
Response: { _id, name, color, members, ... }
```

#### Get Project
```
GET /projects/:id
Auth: Required
Response: { _id, name, color, members, ... }
```

#### Update Project
```
PUT /projects/:id
Auth: Required
Body: { name?, description?, color?, status? }
Response: { _id, name, ... }
```

#### Delete Project
```
DELETE /projects/:id
Auth: Required (owner/admin only)
Response: { message }
```

#### Add Member
```
POST /projects/:id/members
Auth: Required (admin only)
Body: { email, role? }
Response: { _id, members: [...] }
```

#### Remove Member
```
DELETE /projects/:id/members/:userId
Auth: Required (admin only)
Response: { message }
```

### Tasks

#### Get Tasks
```
GET /projects/:projectId/tasks
Auth: Required
Query: ?page=1&limit=10&status=&priority=&assignee=
Response: { data: [...], pagination: {...} }
```

#### Create Task
```
POST /projects/:projectId/tasks
Auth: Required
Body: { title, description?, assignees?, priority?, dueDate?, labels?, status? }
Response: { _id, title, ... }
```

#### Get Task
```
GET /tasks/:id
Auth: Required
Response: { _id, title, description, assignees, comments, ... }
```

#### Update Task
```
PUT /tasks/:id
Auth: Required
Body: { title?, description?, assignees?, priority?, dueDate?, labels?, status?, subtasks? }
Response: { _id, title, ... }
```

#### Delete Task
```
DELETE /tasks/:id
Auth: Required (admin only)
Response: { message }
```

#### Update Task Status
```
PATCH /tasks/:id/status
Auth: Required
Body: { status, position? }
Response: { _id, status, ... }
```

#### Reorder Tasks
```
PATCH /tasks/reorder
Auth: Required
Body: { tasks: [{ id, status, position }] }
Response: { message }
```

#### Add Comment
```
POST /tasks/:id/comments
Auth: Required
Body: { content }
Response: { _id, content, user, createdAt }
```

#### Delete Comment
```
DELETE /tasks/:id/comments/:commentId
Auth: Required
Response: { message }
```

#### Upload Attachment
```
POST /tasks/:id/attachments
Auth: Required
Body: FormData with 'file'
Response: { filename, url, uploadedBy }
```

### Notifications

#### Get Notifications
```
GET /notifications
Auth: Required
Query: ?page=1&limit=10&unread=true
Response: { data: [...], pagination: {...} }
```

#### Get Unread Count
```
GET /notifications/count
Auth: Required
Response: { count }
```

#### Mark as Read
```
PATCH /notifications/:id/read
Auth: Required
Response: { _id, read }
```

#### Mark All Read
```
PATCH /notifications/read-all
Auth: Required
Response: { message }
```

### Search

#### Global Search
```
GET /search?q=term&type=all&limit=10
Auth: Required
Response: { projects: [...], tasks: [...] }
```

### Health Check

#### Health
```
GET /api/health
Response: { status: 'ok', timestamp }
```

## Response Formats

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Paginated
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```