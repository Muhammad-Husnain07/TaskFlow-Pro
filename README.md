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

- User registration and login with JWT
- Task management with drag and drop Kanban board
- Real-time collaboration with Socket.io
- Team workspaces with member management
- Project boards with columns (To Do, In Progress, In Review, Done)
- Task assignments and priorities
- Comments and attachments
- In-app notifications
- Global search with Cmd+K command palette
- Profile and settings management
- Dark/Light theme
- Responsive design

## Project Structure

```
taskflow-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   ├── api/           # API calls
│   │   └── socket/        # Socket.io client
│   ├── Dockerfile
│   └── nginx.conf
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── controllers/      # Route handlers
│   ├── models/            # Mongoose models
│   ├── middleware/        # Custom middleware
│   ├── utils/            # Utility functions
│   ├── config/            # Configuration
│   ├── socket/           # Socket.io handler
│   ├── docs/              # API documentation
│   └── server.js          # Entry point
├── docker-compose.yml
├── package.json
└── README.md
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Muhammad Husnain