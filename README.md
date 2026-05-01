# TaskFlow Pro

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A full-stack MERN project management application for teams to collaborate, manage tasks, and track project progress in real-time.

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS v3** - Styling
- **Zustand** - State management
- **React Query** - Server state management
- **React Router DOM v6** - Routing
- **Socket.io Client** - Real-time communication
- **@dnd-kit** - Drag and drop
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **MongoDB / Mongoose** - Database
- **Socket.io** - Real-time WebSocket
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Helmet** - Security
- **Morgan** - HTTP logging
- **Multer** - File uploads
- **Express Validator** - Validation
- **Express Rate Limit** - Rate limiting

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Local Development

1. Clone the repository
```bash
git clone https://github.com/Muhammad-Husnain07/TaskFlow-Pro.git
cd TaskFlow-Pro
```

2. Install all dependencies
```bash
npm run install:all
```

3. Set up environment variables
```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your values
```

4. Start development servers
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Docker Deployment

1. Clone and navigate to the project:
```bash
cd TaskFlow-Pro
```

2. Create your .env file:
```bash
cp server/.env.production.example server/.env
# Edit server/.env with your values
```

3. Start the stack:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:5000/api

### Railway Deployment

1. Fork this repository on GitHub

2. Create a new Railway project:
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your forked repository

3. Add environment variables in Railway dashboard:
   - `JWT_SECRET` - A secure random string
   - `CLIENT_URL` - Your Railway app URL
   - `MONGO_CONNECTION_STRING` - MongoDB connection (or provision MongoDB from Railway)

4. Deploy:
   - Railway will auto-detect Dockerfiles and deploy

## Environment Variables

| Variable | Description | Required |
|-----------|-------------|-----------|
| PORT | Server port (default: 5000) | No |
| MONGODB_URI | MongoDB connection string | Yes |
| MONGO_USER | MongoDB username | Yes* |
| MONGO_PASSWORD | MongoDB password | Yes* |
| JWT_SECRET | JWT signing secret | Yes |
| CLIENT_URL | Frontend URL for CORS | Yes |
| NODE_ENV | environment (development/production) | No |

*Only required if using MongoDB Atlas with auth

## API Documentation

See [API Docs](server/docs/api.md) for complete API endpoint reference.

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production

## Features

### Authentication & User Management
- User registration with email/password
- JWT-based authentication
- Login/logout functionality
- Password change functionality
- Profile management with avatar upload
- Bio and notification preferences

### Projects
- Create, read, update, delete projects
- Project color customization
- Project member management (add/remove)
- Owner/admin/member roles
- Project tagging system
- Project status (active/archived/completed)
- Archive/unarchive projects
- Delete projects with confirmation

### Task Board
- Kanban board with drag-and-drop (@dnd-kit)
- Multiple columns: To Do, In Progress, In Review, Done, Cancelled
- Task creation with modal and quick-add
- Task detail modal with full editing
- Task priorities (Low, Medium, High, Urgent)
- **Single assignee and reporter per task**
- Due dates with calendar picker
- Task labels with color coding
- Subtasks with progress tracking
- Task comments with markdown support
- Task attachments with drag-drop upload

### Task Filtering & Search
- **Global search** by task title/description
- **Filter by assignee** - select specific team member
- **Filter by reporter** - filter by task creator
- **Filter by priority** - urgent/high/medium/low
- **Quick filters** - My Tasks, Created by Me
- **Active filter badges** showing current filters
- Clear all filters option

### Real-time Features
- Socket.io integration
- Live task updates across clients
- Task viewing indicators (who's viewing)
- Real-time notifications
- Typing indicators in comments

### Notifications
- In-app notification system
- Bell icon with unread count
- Notification panel with infinite scroll
- Mark as read functionality
- Notification preferences (email/in-app)
- **Toast notifications** for real-time alerts

### UI/UX
- Responsive design (mobile/tablet/desktop)
- Dark/Light theme toggle
- Accent color customization
- Skeleton loading states
- Error boundaries
- Toast notifications
- Custom scrollbar styling
- **Improved task card design** with priority indicators, labels, assignee display
- **Better filter dropdowns** with smooth animations
- **Mention highlighting** - @username displayed with blue badge styling

### Mention System
- **@mention support** in task descriptions and comments
- User dropdown with avatar, name, email when typing @
- **Styled mentions** in preview - blue badge/pill appearance
- Notifications sent when mentioned

### Profile & Settings
- Profile tab with avatar, name, bio
- Account tab with password change and delete
- Notifications toggle tab
- Appearance tab with theme and accent color

### Command Palette
- Global search with **Cmd+K** (Ctrl+K on Windows)
- Recent search history
- Quick navigation to projects and tasks

### Deployment
- Docker configuration
- docker-compose with MongoDB
- Railway.app deployment configs

## Project Structure

```
taskflow-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── layout/    # Layout components (Navbar, Sidebar)
│   │   │   ├── tasks/     # Task components (TaskCard, TaskQuickAdd)
│   │   │   └── ui/        # UI components (Avatar, Button, Modal, etc.)
│   │   ├── pages/         # Page components
│   │   │   ├── projects/   # Project pages
│   │   │   ├── tasks/      # Task pages
│   │   │   └── settings/  # Settings pages
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks (useTasks, useProjects, useSocket)
│   │   ├── api/           # API calls (axios, taskApi, projectApi)
│   │   └── socket/        # Socket.io client
│   ├── Dockerfile
│   └── nginx.conf
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose models (Task, Project, User)
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   │   └── notificationService.js  # Notification handling
│   ├── config/             # Configuration
│   ├── socket/             # Socket.io handler
│   ├── docs/               # API documentation
│   └── server.js           # Entry point
├── docker-compose.yml
├── package.json
├── CHANGELOG.md
└── README.md
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Muhammad Husnain