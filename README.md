# Post Management

A scalable **social media–style post management system** with feed, post/comment likes, and **unlimited N-level nested comments**. Built with Express (backend), Next.js (frontend), and MongoDB.

---

## Features

- **Auth:** Register, login, JWT (access token), current user (`/me`)
- **Feed:** All posts with author, like count, comment count, “liked by me”
- **Posts:** Create, read, update, delete (owner); like / unlike; **optional image** (Multer, JPEG/PNG/GIF/WebP, max 5MB)
- **Comments:** Top-level and **N-level replies** (unlimited nesting); like / unlike; delete own
- **Frontend:** Dashboard, Feed, My Posts, create post, view/edit/delete, comments with nested replies and likes

**Documentation:**
- [How post likes and nested comments work](docs/LIKES-AND-COMMENTS.md) – data model, tree building, and API flow.
- [How to test the refresh token](docs/REFRESH-TOKEN-TESTING.md) – refresh endpoint, Postman, and cURL.

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Backend  | Node.js, Express, MongoDB (Mongoose), JWT, Multer (uploads), express-validator, helmet, cors, rate-limit |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS |
| API      | REST; auth via Bearer token (Postman) or httpOnly cookie (Next.js proxy) |

---

## Project structure

```
post-management/
├── src/                          # Backend
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/                 # register, login, me
│   │   ├── post/                 # CRUD, feed, like/unlike
│   │   └── comment/              # CRUD, tree, like/unlike
│   ├── routes/
│   └── utils/
├── frontend/                     # Next.js app
│   └── src/
│       ├── app/                  # (auth), (dashboard), api/* proxy
│       ├── components/
│       ├── contexts/
│       ├── lib/
│       └── types/
├── docs/
│   └── LIKES-AND-COMMENTS.md   # Post likes & nested comments
├── postman/
│   └── Post-Management-API.postman_collection.json
├── .env
└── README.md
```

---

## Environment variables

### Backend (root `.env`)

| Variable           | Description                    | Example |
|--------------------|--------------------------------|---------|
| `PORT`             | Server port                    | `3000`  |
| `MONGO_URI`        | MongoDB connection string      | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET`| Secret for access tokens       | (strong secret) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens    | (strong secret) |
| `JWT_ACCESS_EXPIRE` | Access token expiry           | `15m`   |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry         | `7d`    |

### Frontend (`frontend/.env.local`)

| Variable   | Description              | Example |
|------------|--------------------------|---------|
| `API_URL`  | Backend base URL (server-only) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend URL for browser (e.g. post images) | `http://localhost:3000` |

Copy from `frontend/.env.local.example` and set both to your backend URL.

---

## Quick start

1. **Free port 3000** (if needed):

   ```bash
   npm run free-port
   ```

2. **Install and run backend** (from project root):

   ```bash
   npm install
   npm run dev
   ```

   Wait for `MongoDB connected` and `Server running on port 3000`.

3. **Install and run frontend** (second terminal):

   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local   # set API_URL if needed
   npm run dev
   ```

4. Open **http://localhost:4000** in the browser (login/register, then use Feed and My Posts).

---

## Ports and URLs

| Service  | URL                     | Port |
|----------|-------------------------|------|
| Backend  | http://localhost:3000   | 3000 |
| Frontend | http://localhost:4000   | 4000 |

If the backend reports “address already in use” on 3000, run `npm run free-port` then `npm run dev` again.

---

## API reference (backend)

Base URL: `http://localhost:3000/api` (or your `API_URL`).  
All routes under **Posts** and **Comments** require: `Authorization: Bearer <access_token>`.

### Auth (`/api/auth`)

| Method | Endpoint      | Body | Description |
|--------|---------------|------|-------------|
| POST   | `/register`   | `name`, `email`, `password` (min 6) | Register; returns user + tokens |
| POST   | `/login`      | `email`, `password` | Login; returns user + tokens |
| POST   | `/refresh`    | `refreshToken` | Exchange refresh token for new access + refresh tokens (no auth header) |
| GET    | `/me`         | —    | Current user (Bearer required) |

### Posts (`/api/posts`)

| Method | Endpoint    | Body / params | Description |
|--------|-------------|----------------|-------------|
| POST   | `/`         | `title`, `content` (JSON) or multipart: `title`, `content`, `image` (file) | Create post; image optional (JPEG/PNG/GIF/WebP, 5MB) |
| GET    | `/feed`     | —             | Feed: all posts, likeCount, commentCount, userLiked, author |
| GET    | `/`         | —             | My posts only |
| GET    | `/:id`      | —             | Single post (any); likeCount, userLiked |
| PUT    | `/:id`      | `title?`, `content?` (JSON) or multipart with optional `image` | Update own post |
| DELETE | `/:id`      | —             | Delete own post |
| POST   | `/:id/like` | —             | Like post |
| DELETE | `/:id/like` | —             | Unlike post |

### Comments (`/api/comments`)

| Method | Endpoint           | Body / params | Description |
|--------|--------------------|----------------|-------------|
| GET    | `/by-post/:postId` | —             | Nested comment tree (likeCount, userLiked, replies) |
| POST   | `/`                | `postId`, `content`, `parentId?` | Add comment or reply (parentId = parent comment id) |
| POST   | `/:id/like`        | —             | Like comment |
| DELETE | `/:id/like`        | —             | Unlike comment |
| DELETE | `/:id`             | —             | Delete own comment |

---

## Postman collection

A ready-to-use Postman collection is in **`postman/Post-Management-API.postman_collection.json`**.

### Import

1. Open Postman → **Import** → **Upload Files** → select `postman/Post-Management-API.postman_collection.json`.
2. Collection **variables** (edit in Collection → Variables):
   - `baseUrl`: `http://localhost:3000` (or your API URL)
- `token`: leave empty; set automatically after **Login**, **Register**, or **Refresh token**
  - `refreshToken`: leave empty; set automatically after **Login** or **Register** (used by **Refresh token**)
  - `postId` / `commentId`: optional; auto-set after Create post / Create comment

### Usage

1. Run **Auth → Login** (or **Register**). The test script saves `accessToken` into the `token` variable.
2. All requests in **Posts** and **Comments** use **Bearer Token** `{{token}}`.
3. Run **Posts → Create post** to get a post; `postId` is saved for **Get post by ID**, **Like post**, and **Comments → Get comments by post** / **Create comment**.
4. Run **Comments → Create comment (top-level)** to get a `commentId`; use it for **Create reply (nested)**, **Like comment**, **Delete comment**.

### Folders

- **Auth** – Register, Login, Me (no auth on Register/Login)
- **Posts** – Create, Feed, My posts, Get by ID, Update, Delete, Like, Unlike
- **Comments** – Get by post, Create (top-level), Create reply, Like, Unlike, Delete

---

## Frontend (Next.js)

- **Dashboard** (`/`): Welcome, post count, recent posts, New Post.
- **Feed** (`/feed`): All posts, like button, comment count, expandable comments with nested replies and likes.
- **My Posts** (`/posts`): List of your posts; click to view.
- **New Post** (`/posts/new`): Create title + content.
- **Post detail** (`/posts/[id]`): View; Edit/Delete only for owner.  
Auth is cookie-based via Next.js API routes that proxy to the backend and set httpOnly cookies.  
See **`frontend/README.md`** for folder structure and auth flow.

---

## Scripts

| Where     | Command           | Description |
|-----------|-------------------|-------------|
| Root      | `npm run dev`     | Start backend (nodemon) |
| Root      | `npm run start`   | Start backend (node) |
| Root      | `npm run free-port` | Kill process on port 3000 (macOS/Linux) |
| Frontend  | `npm run dev`     | Next.js dev (port 4000) |
| Frontend  | `npm run build`   | Next.js production build |
| Frontend  | `npm run start`   | Next.js production start (port 4000) |

---

## License

MIT (or your choice).
