# ⚡ TaskFlow

A modern, full-stack **collaborative project management platform** built with the MERN stack. Designed to help teams organize work, track progress, and ship faster — inspired by tools like Linear and Notion.

![TaskFlow](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based registration and login
- Protected routes with automatic token refresh
- Role-based access control (Admin / Member per project)

### 📁 Project Management
- Create projects with custom colors and descriptions
- Invite team members by email
- **Invitation system** — recipients can accept or decline invites via a notification bell
- Admin-only project settings and member management

### ✅ Task Management
- **Kanban board** with drag-and-drop (Backlog → To Do → In Progress → In Review → Done)
- Task priorities (Low, Medium, High, Urgent) with color-coded badges
- Assign tasks to team members with due dates
- List view as an alternative to board view

### 💬 Comments
- Comment threads on each task
- Author-only or admin delete permissions

### 🎨 Design & UX
- **Dark / Light theme** toggle with CSS custom properties
- Glassmorphic auth pages with gradient mesh backgrounds
- Framer Motion animations (page transitions, card hover, staggered lists)
- Fully responsive — sidebar collapses on mobile, grids adapt, tables hide columns
- Skeleton loading states throughout

### 🔔 Real-time Notifications
- Notification bell in sidebar showing pending project invitations
- Accept / Decline with animated dropdown
- Auto-polls every 30 seconds

---

## 🛠️ Tech Stack

| Layer       | Technology                                                       |
| ----------- | ---------------------------------------------------------------- |
| **Frontend** | React 19, React Router 7, Framer Motion, Axios, Vanilla CSS     |
| **Backend**  | Node.js, Express 5, Mongoose, JWT, bcrypt                        |
| **Database** | MongoDB Atlas                                                     |
| **Drag & Drop** | @hello-pangea/dnd                                             |
| **Deployment** | Railway (single service — server serves client build)          |

---

## 📂 Project Structure

```
ethara/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Button, Input, Modal, Badge, Avatar, etc.
│   │   │   ├── layout/        # Sidebar, AppLayout
│   │   │   └── features/      # KanbanBoard, TaskCard, InvitationBell, etc.
│   │   ├── pages/             # Landing, Login, Signup, Dashboard, Projects, etc.
│   │   ├── contexts/          # AuthContext, ThemeContext
│   │   ├── hooks/             # useAuth, useDebounce
│   │   ├── services/          # API abstraction (axios)
│   │   ├── App.jsx            # Router + providers
│   │   ├── App.css            # Complete stylesheet
│   │   └── index.css          # Reset + font import
│   └── package.json
│
├── server/                    # Express backend
│   ├── config/                # Database connection
│   ├── controllers/           # Auth, Project, Task, Comment, Invitation
│   ├── middleware/             # JWT auth, error handler
│   ├── models/                # User, Project, Task, Comment, Invitation
│   ├── routes/                # API route definitions
│   ├── server.js              # Entry point
│   └── package.json
│
├── package.json               # Root — orchestrates build & start
├── railway.json               # Railway deployment config
└── .env.example               # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB Atlas** account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/sneharohilla29/Ethara.git
cd Ethara
```

### 2. Install dependencies

```bash
# Install all dependencies (server + client)
npm run install-all
```

### 3. Set up environment variables

```bash
# Copy the example and fill in your values
cp .env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Run in development

```bash
# Start both server (port 5000) and client (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚄 Deploy to Railway

### One-click deploy

1. Push your code to GitHub
2. Go to [Railway](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
3. Select your `Ethara` repository
4. Add these **environment variables** in Railway's dashboard:

| Variable       | Value                               |
| -------------- | ----------------------------------- |
| `MONGO_URI`    | Your MongoDB Atlas connection string |
| `JWT_SECRET`   | A strong random secret key           |
| `NODE_ENV`     | `production`                         |

> **Note:** `PORT` is automatically set by Railway. `FRONTEND_URL` is not needed — the server serves the client build from the same origin.

5. Railway will auto-detect `railway.json` and:
   - **Build:** Install all deps → build the React client
   - **Start:** Run the Express server (serves API + static client)

6. Your app will be live at `https://your-app.up.railway.app` 🎉

### MongoDB Atlas Network Access

Make sure your MongoDB Atlas cluster allows connections from Railway:
- Go to Atlas → **Network Access** → **Add IP Address**
- Add `0.0.0.0/0` (allow from everywhere) for Railway's dynamic IPs

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Description          | Auth |
| ------ | --------------------- | -------------------- | ---- |
| POST   | `/api/auth/register`  | Create account       | ❌   |
| POST   | `/api/auth/login`     | Sign in              | ❌   |
| GET    | `/api/auth/me`        | Get current user     | ✅   |
| PUT    | `/api/auth/profile`   | Update profile       | ✅   |

### Projects
| Method | Endpoint                            | Description        | Auth |
| ------ | ----------------------------------- | ------------------ | ---- |
| GET    | `/api/projects`                     | List my projects   | ✅   |
| POST   | `/api/projects`                     | Create project     | ✅   |
| GET    | `/api/projects/:id`                 | Get project        | ✅   |
| PUT    | `/api/projects/:id`                 | Update project     | ✅ Admin |
| DELETE | `/api/projects/:id`                 | Delete project     | ✅ Owner |
| POST   | `/api/projects/:id/members`         | Send invitation    | ✅ Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member      | ✅ Admin |

### Tasks
| Method | Endpoint                        | Description        | Auth |
| ------ | ------------------------------- | ------------------ | ---- |
| GET    | `/api/tasks/my-tasks`           | My assigned tasks  | ✅   |
| GET    | `/api/tasks/dashboard-stats`    | Dashboard stats    | ✅   |
| GET    | `/api/tasks/project/:projectId` | Project tasks      | ✅   |
| POST   | `/api/tasks`                    | Create task        | ✅   |
| PUT    | `/api/tasks/:id`                | Update task        | ✅   |
| PUT    | `/api/tasks/:id/status`         | Update status      | ✅   |
| DELETE | `/api/tasks/:id`                | Delete task        | ✅ Admin |

### Invitations
| Method | Endpoint                              | Description          | Auth |
| ------ | ------------------------------------- | -------------------- | ---- |
| GET    | `/api/invitations/me`                 | My pending invites   | ✅   |
| GET    | `/api/invitations/project/:projectId` | Project invites      | ✅   |
| POST   | `/api/invitations`                    | Send invitation      | ✅ Admin |
| PUT    | `/api/invitations/:id/accept`         | Accept invite        | ✅   |
| PUT    | `/api/invitations/:id/decline`        | Decline invite       | ✅   |

### Comments
| Method | Endpoint                    | Description      | Auth |
| ------ | --------------------------- | ---------------- | ---- |
| GET    | `/api/comments/task/:taskId`| Get comments     | ✅   |
| POST   | `/api/comments`             | Add comment      | ✅   |
| DELETE | `/api/comments/:id`         | Delete comment   | ✅   |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/sneharohilla29">sneharohilla29</a>
</p>
