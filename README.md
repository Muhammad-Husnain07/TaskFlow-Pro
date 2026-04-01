# TaskFlow Pro

A full-stack MERN project management application for teams to collaborate, manage tasks, and track project progress in real-time.

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS v3** - Styling
- **Zustand** - State management
- **React Query** - Server state management
- **React Router DOM** - Routing
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

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install all dependencies
```bash
npm run install:all
```

3. Set up environment variables
```bash
# Server (.env)
cp server/.env.example server/.env
# Edit server/.env with your values
```

4. Start development servers
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production

## Project Structure

```
taskflow-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   ├── api/           # API calls
│   │   └── utils/         # Utility functions
│   └── ...
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose models
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration
│   └── server.js         # Entry point
└── package.json          # Root package.json
```

## Features

- User registration and login with JWT
- Task management with drag and drop
- Real-time collaboration
- Team workspaces
- Project boards and columns
- Task assignments
- Comments and notifications

## API Endpoints

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/password` - Change password (protected)

### Health Check
- `GET /api/health` - API health status

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
