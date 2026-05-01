# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-05-02

### Added

#### Task Board Enhancements
- **Comprehensive filter toolbar** with search, assignee, reporter, and priority filters
- **Quick filters** - My Tasks, Created by Me options in assignee dropdown
- **Active filter badges** showing current filters with clear option
- Separate assignee and reporter dropdowns for better filtering

#### Task Card Improvements
- **Compact UI design** with better spacing
- Priority indicators with colored icons (!, ↑, -, ↓)
- Labels with color coding (cycling through 10 colors)
- Assignee display with avatar
- Due date with Today/Tomorrow/overdue highlighting
- Comments and attachments count indicators
- Subtask progress indicator

#### Task Detail Modal
- **Improved modal UI** with sliding panel design (600px width)
- Colored labels (non-gradient) cycling through blue, green, purple, orange, pink
- **Mention highlighting** - @username displayed with blue badge styling
- **Enhanced Activity Log** with action icons and proper formatting
- Empty state for activity when no actions recorded
- Better section organization with card-like containers

#### Mention System
- **MentionInput component** with user dropdown
- Shows avatar, name, email when selecting user
- Displays @username preview in dropdown
- Styled mentions in description and comments preview

#### Notifications
- Fixed notification messages showing "undefined"
- Toast notifications for real-time alerts
- Proper user data population (sender name)

#### Backend Updates
- Task model: Added reporter field, changed assignees to single field
- Default assignee/reporter set to task creator on creation
- Proper population of assignees and reporter in API responses

### Fixed

- Avatar export issues in components
- Duplicate code in TaskCard component
- Syntax errors in various components
- Modal reopening issue after close
- Task details modal showing twice
- Filter logic for assignee/reporter

### UI/UX Enhanced

- Modern dark mode support with slate colors
- Better section organization in task detail modal
- Priority dropdown with improved styling
- Status pills with inline color styling
- Assignee/Reporter select with full member list (name + email)
- Labels with gradient pill styling in older code (now fixed to solid colors)
- Improved mentions dropdown styling
- Custom scrollbar styling
- Better hover effects on task cards

---

## [1.0.3] - 2026-04-18

### Fixed

- Danger Zone Archive/Delete buttons now working properly
- Backend archiveProject controller added
- Frontend archive hook and handlers implemented
- Navigation to projects page after delete
- Loading states on archive/delete buttons

### Added

- Archive Project toggle functionality (archived/active)
- Delete Project with confirmation
- Project status badge in navbar

### UI/UX Enhanced

- Custom scrollbar styling for board
- Improved task column visual design with better spacing
- Enhanced task cards with shadows and hover lift effects
- Sidebar gradient logo with shadow
- Sticky navbar with backdrop blur
- Smooth scroll behavior
- Semi-transparent backgrounds
- Better dark mode contrast

---

## [1.0.2] - 2026-04-15

### Fixed

- Button loading prop (isLoading instead of loading)
- Navigation from Dashboard tasks now opens project with task modal
- Project route properly uses useParams()
- Improved drag and drop with droppable columns
- Added visual feedback on column hover during drag

### Added

- Task detail modal opens when clicking task from Dashboard

---

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

---

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

- **v1.1.0** - Task board UI/UX improvements, filters, mentions, notifications
- **v1.0.3** - Archive/delete project functionality
- **v1.0.2** - Dashboard task navigation fix
- **v1.0.1** - Authentication and project fixes
- **v1.0.0** - Initial production release