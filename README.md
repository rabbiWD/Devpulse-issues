DevPulse – Internal Issue Tracking System API
Live API: https://your-live-url.com

Overview: 
DevPulse is a backend RESTful API designed for internal issue tracking and collaboration within software teams. It enables users to report bugs, suggest features, and manage issue workflows efficiently with role-based access control.
The system is built using Node.js, Express.js, and PostgreSQL (raw SQL only), ensuring simplicity, performance, and full control over database operations.

Key Features:
Secure authentication using JWT
Role-based access control (Contributor / Maintainer)
Create and manage bug reports and feature requests
View all issues with filtering and sorting
Fetch detailed issue information with reporter data
Update issues with strict permission rules
Delete issues (maintainer only)
Optimized PostgreSQL queries (no ORM, no JOIN usage)
Modular and scalable architecture
Tech Stack
Runtime: Node.js (LTS)
Language: TypeScript
Framework: Express.js
Database: PostgreSQL
Driver: pg (native PostgreSQL client)
Authentication: JSON Web Token (JWT)
Security: bcrypt
Project Setup
1 Clone Repository:
git clone https://github.com/yourusername/devpulse.git
cd devpulse
2️ Install Dependencies:
npm install

3 Database Setup:
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(120) UNIQUE NOT NULL,
password TEXT NOT NULL,
role VARCHAR(20) DEFAULT 'contributor',
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE issues (
id SERIAL PRIMARY KEY,
title VARCHAR(150) NOT NULL,
description TEXT NOT NULL,
type VARCHAR(30) NOT NULL,
status VARCHAR(30) DEFAULT 'open',
reporter_id INT NOT NULL,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
4 Run the Application:
npm run dev
API Endpoints
Authentication
Method	Endpoint	Description:
POST	/api/auth/signup	Register new user
POST	/api/auth/login	Authenticate user
Issues:
Method	Endpoint	Access	Description
POST	/api/issues	Authenticated	Create issue
GET	/api/issues	Public	Get all issues
GET	/api/issues/:id	Public	Get single issue
PATCH	/api/issues/:id	Authenticated	Update issue
DELETE	/api/issues/:id	Maintainer	Delete issue
 Database Schema Summary
Users Table:
Stores system users
Supports role-based access (contributor, maintainer)
Passwords are securely hashed
Issues Table:
Stores bug reports and feature requests
Tracks workflow via status
Linked to users via reporter_id
 Authentication Flow
User logs in with credentials
Server validates and issues JWT token
Client sends token in request header:
Authorization: Jwt_token <token>
Middleware verifies token and attaches user context to request

Role Permissions"
Contributor
Create issues
View issues
Update own issues (only if status = open)
Maintainer
Full access to all issues
Update any issue
Manage issue status
Delete issues

Deployment Notes:
Backend: Render / Railway / Vercel
Database: NeonDB / Supabase / ElephantSQL
Ensure environment variables are configured properly
 Project Structure (Summary):
src/
 ├── api/
 │    ├── auth/
 │    ├── issues/
 ├── middleware/
 ├── services/
 ├── config/
 ├── db/
 └── app.ts

 Author
Rabbi Khan
Backend Developer | Node.js | TypeScript