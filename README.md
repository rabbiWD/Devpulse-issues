# DevPulse

### Internal Issue Tracking System API

[![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Raw_SQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**A backend RESTful API for internal bug tracking and team collaboration.**

[Live Demo](https://your-live-url.com) · [Report Bug](https://github.com/yourusername/devpulse/issues) · [Request Feature](https://github.com/yourusername/devpulse/issues)

---

## Table of Contents

- [DevPulse](#devpulse)
    - [Internal Issue Tracking System API](#internal-issue-tracking-system-api)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Database Setup](#database-setup)
    - [Running the App](#running-the-app)
  - [API Reference](#api-reference)
    - [Authentication](#authentication)
    - [Issues](#issues)
  - [Database Schema](#database-schema)
    - [Users Table](#users-table)
    - [Issues Table](#issues-table)
  - [Authentication](#authentication-1)
  - [Role \& Permissions](#role--permissions)
  - [Project Structure](#project-structure)
  - [Deployment](#deployment)
  - [Author](#author)

---

## Overview

**DevPulse** is a backend RESTful API designed for internal issue tracking and collaboration within software teams. It enables users to report bugs, suggest features, and manage issue workflows efficiently with role-based access control.

Built with **Node.js**, **Express.js**, and **PostgreSQL** (raw SQL — no ORM), DevPulse prioritizes simplicity, performance, and full control over database operations.

---

## Features

- Secure authentication using **JWT**
- **Role-based access control** (Contributor / Maintainer)
- Create and manage **bug reports** and **feature requests**
- View all issues with **filtering and sorting**
- Fetch detailed issue info with **reporter data**
- Update issues with **strict permission rules**
- Delete issues (**Maintainer only**)
- Optimized **raw PostgreSQL** queries (no ORM, no unnecessary JOINs)
- **Modular and scalable** architecture

---

## Tech Stack

| Layer          | Technology                      |
|----------------|---------------------------------|
| Runtime        | Node.js (LTS)                   |
| Language       | TypeScript                      |
| Framework      | Express.js                      |
| Database       | PostgreSQL                      |
| DB Driver      | `pg` (native PostgreSQL client) |
| Authentication | JSON Web Token (JWT)            |
| Security       | bcrypt                          |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js (LTS)](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- `npm` or `yarn`

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

**2. Install dependencies:**

```bash
npm install
```

**3. Configure environment variables:**

Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Database Setup

Connect to your PostgreSQL instance and run the following:

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(120) UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  role       VARCHAR(20) DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE issues (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type        VARCHAR(30) NOT NULL,
  status      VARCHAR(30) DEFAULT 'open',
  reporter_id INT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Running the App

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

---

## API Reference

### Authentication

| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| POST   | `/api/auth/signup` | Register new user |
| POST   | `/api/auth/login`  | Authenticate user |

### Issues

| Method | Endpoint          | Access        | Description        |
|--------|-------------------|---------------|--------------------|
| POST   | `/api/issues`     | Authenticated | Create a new issue |
| GET    | `/api/issues`     | Public        | Get all issues     |
| GET    | `/api/issues/:id` | Public        | Get single issue   |
| PATCH  | `/api/issues/:id` | Authenticated | Update an issue    |
| DELETE | `/api/issues/:id` | Maintainer    | Delete an issue    |

> **Base URL:** `https://your-live-url.com`

---

## Database Schema

### Users Table

| Column       | Type         | Description                             |
|--------------|--------------|-----------------------------------------|
| `id`         | SERIAL PK    | Auto-incremented user ID                |
| `name`       | VARCHAR(100) | Full name of the user                   |
| `email`      | VARCHAR(120) | Unique email address                    |
| `password`   | TEXT         | Bcrypt-hashed password                  |
| `role`       | VARCHAR(20)  | `contributor` (default) or `maintainer` |
| `created_at` | TIMESTAMP    | Record creation time                    |
| `updated_at` | TIMESTAMP    | Last update time                        |

### Issues Table

| Column        | Type         | Description                               |
|---------------|--------------|-------------------------------------------|
| `id`          | SERIAL PK    | Auto-incremented issue ID                 |
| `title`       | VARCHAR(150) | Short summary of the issue                |
| `description` | TEXT         | Full description of the issue             |
| `type`        | VARCHAR(30)  | `bug` or `feature`                        |
| `status`      | VARCHAR(30)  | `open` (default), `in-progress`, `closed` |
| `reporter_id` | INT          | Foreign key referencing `users.id`        |
| `created_at`  | TIMESTAMP    | Record creation time                      |
| `updated_at`  | TIMESTAMP    | Last update time                          |

---

## Authentication

DevPulse uses **JWT-based** stateless authentication.

**Flow:**

1. User registers or logs in via `/api/auth/signup` or `/api/auth/login`
2. Server validates credentials and returns a signed JWT token
3. Client includes the token in subsequent requests:

```http
Authorization: Jwt_token <your_token_here>
```

4. Auth middleware verifies the token and attaches the user context to each request

---

## Role & Permissions

| Action                      | Contributor | Maintainer |
|-----------------------------|-------------|------------|
| Create issues               | Yes         | Yes        |
| View all issues             | Yes         | Yes        |
| Update own issues (if open) | Yes         | Yes        |
| Update any issue            | No          | Yes        |
| Manage issue status         | No          | Yes        |
| Delete issues               | No          | Yes        |

---

## Project Structure

```
src/
├── api/
│   ├── auth/           # Registration & login handlers
│   └── issues/         # Issue CRUD handlers
├── middleware/         # Auth & role-based guards
├── services/           # Business logic layer
├── config/             # App & DB configuration
├── db/                 # Raw SQL query helpers
└── app.ts              # Express app entry point
```

---

## Deployment

| Layer    | Recommended Platforms                                                                                    |
|----------|----------------------------------------------------------------------------------------------------------|
| Backend  | [Render](https://render.com) · [Railway](https://railway.app) · [Vercel](https://vercel.com)            |
| Database | [NeonDB](https://neon.tech) · [Supabase](https://supabase.com) · [ElephantSQL](https://elephantsql.com) |

> Make sure all environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) are properly configured in your deployment platform.

---

## Author

**Rabbi Khan** — Backend Developer | Node.js · TypeScript · PostgreSQL

[![GitHub](https://img.shields.io/badge/GitHub-yourusername-181717?style=flat-square&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/yourusername)