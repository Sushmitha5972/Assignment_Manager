# Assignment Deadline Manager with Productivity Bot

## Overview
MERN app to manage assignments and get productivity tips (bot). Features user auth (JWT), CRUD assignments, sorting/filtering, and a simple productivity bot endpoint.

## Setup

### Backend
1. cd server
2. copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`
3. npm install
4. npm run dev (or npm start)

### Frontend
1. cd client
2. create `.env` (optional) with REACT_APP_API_URL (default http://localhost:5000/api)
3. npm install
4. npm start

## Endpoints
- POST /api/auth/signup { name, email, password }
- POST /api/auth/login { email, password }
- GET /api/assignments?sort=dueDate|priority&status=Pending|Completed
- POST /api/assignments
- GET /api/assignments/:id
- PUT /api/assignments/:id
- DELETE /api/assignments/:id
- GET /api/bot/tip?days=14

## Notes
- JWT stored in localStorage by frontend.
- The bot endpoint returns an array of tips based on upcoming assignments.
