# TaskFlow Pro - Frontend E2E Test Checklist

## 1. AUTHENTICATION
### Login Page (http://localhost:5173/login)
- [ ] Page loads without errors
- [ ] Logo and branding visible
- [ ] Email input field works
- [ ] Password input field works (with show/hide toggle)
- [ ] "Remember me" checkbox works
- [ ] Login button submits form
- [ ] Error toast shows on invalid credentials
- [ ] Redirects to dashboard on success
- [ ] "Don't have an account? Register" link works

### Register Page (http://localhost:5173/register)
- [ ] Page loads without errors
- [ ] Name input field works
- [ ] Email input field works
- [ ] Password input field works
- [ ] Confirm password works
- [ ] Register button submits form
- [ ] Error toast shows on mismatch/invalid
- [ ] Redirects to login on success

---

## 2. DASHBOARD (http://localhost:5173/dashboard)
### Layout
- [ ] Sidebar visible with navigation
- [ ] Navbar shows current page title
- [ ] Logged-in user avatar in navbar

### Stats Cards (4 cards)
- [ ] Total Projects count displays
- [ ] Open Tasks count displays
- [ ] Due This Week count displays
- [ ] Completed count displays

### Recent Projects Section
- [ ] "Recent Projects" title shows
- [ ] "View all" link navigates to /projects
- [ ] Project cards display (name, color, members)
- [ ] Click project navigates to project detail

### My Tasks Section
- [ ] "My Tasks" title shows
- [ ] Task list displays (title, status badge, project name)
- [ ] Click task navigates to project detail
- [ ] Empty state shows when no tasks

---

## 3. PROJECTS LIST (http://localhost:5173/projects)
### Page Load
- [ ] Page loads without errors
- [ ] Title "Projects" displays
- [ ] Breadcrumbs show: Projects

### Toolbar
- [ ] Search input works
- [ ] Status filter dropdown works
- [ ] Sort dropdown works
- [ ] Grid/List view toggle works
- [ ] Create New Project button works

### Project Grid
- [ ] Projects display in grid
- [ ] Project color tag shows
- [ ] Project name displays
- [ ] Member avatars show
- [ ] Due date shows if set
- [ ] Click navigates to project detail

### Create Project Modal
- [ ] Modal opens on button click
- [ ] Name input works
- [ ] Description textarea works
- [ ] Color picker works
- [ ] Tags input works
- [ ] Due date picker works
- [ ] Create button submits
- [ ] Cancel button closes modal
- [ ] Success toast shows on create

---

## 4. PROJECT DETAIL - OVERVIEW TAB (http://localhost:5173/projects/:id)
### Header
- [ ] Project name displays
- [ ] Edit button works (pencil icon)
- [ ] Color tag shows

### Tabs Navigation
- [ ] Overview tab active by default
- [ ] Board tab button works
- [ ] List tab button works
- [ ] Members tab button works
- [ ] Settings tab button works

### Overview Tab Content
- [ ] Description section shows
- [ ] Due date shows
- [ ] Tags display
- [ ] Owner info shows
- [ ] Quick stats (tasks count, members count)

### Edit Project Modal
- [ ] Pre-fills current values
- [ ] Save changes works
- [ ] Delete project works (settings)

---

## 5. PROJECT DETAIL - BOARD TAB (http://localhost:5173/projects/:id)
### Kanban Board
- [ ] 4 columns display (To Do, In Progress, In Review, Done)
- [ ] Column titles show
- [ ] Task cards display in columns

### Task Card
- [ ] Title shows
- [ ] Priority badge shows (color-coded)
- [ ] Assignee avatars show
- [ ] Due date shows
- [ ] Comment count icon shows
- [ ] Attachment count shows

### Drag & Drop
- [ ] Can drag cards between columns
- [ ] Drop updates task status

### Add Task
- [ ] "+ Add Task" button in each column
- [ ] Quick add input appears
- [ ] Enter creates task
- [ ] Escape cancels

### Task Click
- [ ] Click opens TaskDetailModal
- [ ] Modal shows full task details
- [ ] Edit task works
- [ ] Delete task works
- [ ] Add comment works

---

## 6. PROJECT DETAIL - LIST TAB
### Table View
- [ ] List displays as table
- [ ] Columns: Title, Status, Priority, Assignee, Due Date
- [ ] Sorting works on each column
- [ ] Click row opens task detail

---

## 7. PROJECT DETAIL - MEMBERS TAB
### Members List
- [ ] Members display with avatars
- [ ] Name and email show
- [ ] Role badge shows (owner/admin/member)
- [ ] Role can be changed (owner only)

### Add Member
- [ ] Email input works
- [ ] Role dropdown works
- [ ] Add button works
- [ ] Success toast shows

### Remove Member
- [ ] Remove button shows for non-owners
- [ ] Remove works (owner only)
- [ ] Confirmation works

---

## 8. PROJECT DETAIL - SETTINGS TAB
### Settings Form
- [ ] Name field works
- [ ] Description textarea works
- [ ] Color picker works
- [ ] Save button works
- [ ] Success toast shows

### Danger Zone
- [ ] Delete project button visible (owner only)
- [ ] Click shows confirmation
- [ ] Delete navigates to projects list

---

## 9. SETTINGS PAGE (http://localhost:5173/settings)
### Profile Tab
- [ ] Avatar displays
- [ ] Change avatar works
- [ ] Name input works
- [ ] Email input works (read-only)
- [ ] Bio textarea works
- [ ] Save button works

### Password Tab
- [ ] Current password field works
- [ ] New password field works
- [ ] Confirm password field works
- [ ] Change password button works
- [ ] Success toast shows

### Notifications Tab
- [ ] Email toggles work
- [ ] Save preferences works

---

## 10. SEARCH (Cmd+K or http://localhost:5173/search)
### Command Palette
- [ ] Opens on Cmd+K / Ctrl+K
- [ ] Search input works
- [ ] Results filter as you type
- [ ] Click result navigates
- [ ] ESC closes

---

## 11. NOTIFICATIONS
### Bell Icon
- [ ] Icon shows in navbar
- [ ] Badge shows unread count
- [ ] Click opens panel

### Panel
- [ ] Notifications list displays
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Click notification navigates

---

## 12. SIDEBAR
### Navigation Items
- [ ] Dashboard link works
- [ ] Projects link works
- [ ] Settings link works

### User Section
- [ ] User avatar shows
- [ ] User name shows
- [ ] Logout button works
- [ ] Dark mode toggle works (if implemented)

---

## 13. ERROR HANDLING
### Error States
- [ ] 404 page shows on invalid URL
- [ ] 403 shows unauthorized message
- [ ] Network error shows retry option
- [ ] Error boundary catches crashes

### Loading States
- [ ] Spinner shows during data fetch
- [ ] Skeleton shows for content

### Empty States
- [ ] Empty projects shows helpful message
- [ ] Empty tasks shows helpful message

---

## Test Credentials
- **Admin:** admin@taskflow.com / password123
- **User:** john@taskflow.com / password123
- **User:** sarah@taskflow.com / password123

---

## Run Tests In Order:
1. Authentication flow (login/logout/register)
2. Dashboard checks
3. Projects - create, view, edit
4. Tasks - create, move, edit, delete
5. Members - add, change role, remove
6. Settings - profile, password
7. Search - command palette
8. Notifications