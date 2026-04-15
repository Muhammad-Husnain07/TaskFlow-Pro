# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2026-04-15

### Fixed

- Button loading prop (isLoading instead of loading)
- Navigation from Dashboard tasks now opens project with task modal
- Project route properly uses useParams()
- Improved drag and drop with droppable columns
- Added visual feedback on column hover during drag

### Added

- Task detail modal opens when clicking task from Dashboard

## [1.0.1] - 2026-04-15

### Fixed

- Login 401 error (double password hashing in seed script)
- Project access denied for owner (isMember function not checking owner)
- Data not showing on frontend (Array.isArray checks missing)
- Missing imports (MEMBER_ROLES, useDeleteProject)
- Import path errors in components
- AppLayout using Outlet instead of children prop
- Axios interceptor redirecting on login endpoint
- Route order issue (my-tasks vs :id)
- Vite build config issues
- Dotenv config path

### Added

- getMyTasks route and controller for user's tasks
- server/uploads to gitignore
- E2E test checklist documentation

## [1.0.0] - 2026-04-15

### Added

#### Authentication & User Management
- User registration with email/password
- JWT-based authentication
- Login/logout functionality
- Password change functionality
- Profile management with avatar upload
- Bio and notification preferences

#### Projects
- Create, read, update, delete projects
- Project color customization
- Project member management (add/remove)
- Owner/admin/member roles
- Project tagging system
- Project status (active/archived/completed)

#### Tasks
- Kanban board with drag-and-drop (@dnd-kit)
- Task creation with inline quick-add
- Task detail modal with full editing
- Task status columns (To Do, In Progress, In Review, Done, Cancelled)
- Task priorities (Low, Medium, High, Urgent)
- Task assignees (multiple users)
- Due dates with calendar picker
- Task labels
- Subtasks with progress tracking
- Task comments with markdown support
- Task attachments with drag-drop upload

#### Real-time Features
- Socket.io integration
- Live task updates across clients
- Task viewing indicators
- Typing indicators in comments
- User presence (online/offline)
- Real-time notifications

#### Notifications
- In-app notification system
- Bell icon with unread count
- Notification panel with infinite scroll
- Mark as read functionality
- Email/in-app notification preferences

#### Search & Navigation
- Global search (Cmd+K command palette)
- Recent search history
- Search results page at /search
- Full-text search with MongoDB indexes

#### UI/UX
- Responsive design (mobile/tablet/desktop)
- Dark/Light theme toggle
- Accent color customization
- Skeleton loading states
- Error boundaries
- Toast notifications
- Spinning loaders

#### Profile & Settings
- Profile tab with avatar, name, bio
- Account tab with password change and delete
- Notifications toggle tab
- Appearance tab with theme and color

#### Public Profile
- Read-only user display
- User's projects
- User's open tasks

#### Deployment
- Docker configuration
- docker-compose with MongoDB
- GitHub Actions CI/CD
- Railway.app deployment configs

### Fixed

- Various responsive layout issues
- Date formatting issues
- Real-time sync issues
- Session handling

### Removed

- Initial development scaffolding

---

## Version History

- **v1.0.0** - Initial production release with full feature set