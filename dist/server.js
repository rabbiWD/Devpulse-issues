

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/api/routes/auth.routes.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import { env } from "process";
import path from "path";
dotenv.config({
  quiet: true,
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: env.PORT,
  database_url: env.DATABASE_URL,
  jwt_secret: env.JWT_SECRET,
  refresh_secret: env.REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.database_url
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor',
            CHECK (role IN ('contributor', 'maintainer')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
                
                )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150),
            description TEXT NOT NULL,
            type VARCHAR(30) NOT NULL,
            CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(30) NOT NULL DEFAULT 'open',
            CHECK (status IN ('open', 'in_progress', resolved)),
            reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
    console.log("Database Connected");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var signToken = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(payload, config_default.jwt_secret, {
    expiresIn: "1d"
  });
  return accessToken;
};

// src/api/services/auth.service.ts
import bcrypt from "bcrypt";
var AuthService = class {
  async createUser(user) {
    const { name, email, password, role } = user;
    const hashpassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3,  COALESCE($4, 'contributor')) RETURNING *",
      [name, email, hashpassword, role]
    );
    return result;
  }
  async validUser(email, password) {
    const userData = await pool.query("SELECT * FROM users WHERE email =$1", [
      email
    ]);
    if (userData.rows.length === 0) {
      throw new Error("Invalid Creadentials");
    }
    const user = userData.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      throw new Error("Invalid Creadentials");
    }
    return user;
  }
};
var auth_service_default = new AuthService();

// src/api/controllers/auth.controller.ts
var signup = async (req, res) => {
  try {
    const user = await auth_service_default.createUser(req.body);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user.rows[0]
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await auth_service_default.validUser(email, password);
    const tokens = signToken(user);
    res.status(200).json({
      success: true,
      message: "User login successfully",
      data: { user, tokens }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};

// src/api/routes/auth.routes.ts
var router = Router();
router.post("/signup", signup);
router.post("/login", login);
var auth_routes_default = router;

// src/app.ts
import cookieParser from "cookie-parser";

// src/api/routes/issue.routes.ts
import { Router as Router2 } from "express";

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No token provided"
        });
      }
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      const decoded = jwt2.verify(token, config_default.jwt_secret);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden!!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message || "Unauthorized"
      });
    }
  };
};
var auth_default = auth;

// src/api/services/issue.service.ts
var issueService = {
  async createIssue(payload, user) {
    const reporterId = Number(user.id);
    const result = await pool.query(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        payload.title,
        payload.description,
        payload.type,
        reporterId
      ]
    );
    return result.rows[0];
  },
  async getIssues(filters = {}) {
    const sort = filters.sort === "oldest" ? "ASC" : "DESC";
    const conditions = [];
    const values = [];
    if (filters.type) {
      values.push(filters.type);
      conditions.push(`type = $${values.length}`);
    }
    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      `
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    ${whereClause}
    ORDER BY created_at ${sort}
    `,
      values
    );
    const issues = result.rows;
    if (!issues.length) {
      return [];
    }
    const reporterIds = [
      ...new Set(
        issues.map((i) => Number(i.reporter_id)).filter(Boolean)
      )
    ];
    let userMap = /* @__PURE__ */ new Map();
    if (reporterIds.length > 0) {
      const usersResult = await pool.query(
        `
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
      `,
        [reporterIds]
      );
      userMap = new Map(
        usersResult.rows.map((u) => [Number(u.id), u])
      );
    }
    return issues.map((issue) => {
      const reporter = userMap.get(Number(issue.reporter_id));
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        reporter: reporter ? {
          id: reporter.id,
          name: reporter.name,
          role: reporter.role
        } : null
      };
    });
  },
  async getIssueById(id) {
    const result = await pool.query(
      `
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    WHERE id = $1
    `,
      [id]
    );
    if (!result.rows.length) {
      return null;
    }
    const issue = result.rows[0];
    const userResult = await pool.query(
      `
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `,
      [issue.reporter_id]
    );
    const reporter = userResult.rows[0];
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      reporter: reporter ? {
        id: reporter.id,
        name: reporter.name,
        role: reporter.role
      } : null
    };
  },
  async updateIssue(id, payload, user) {
    const existingIssue = await pool.query(
      `
    SELECT * FROM issues WHERE id = $1
    `,
      [id]
    );
    const issue = existingIssue.rows[0];
    if (!issue) {
      throw new Error("Issue not found");
    }
    const validTypes = ["bug", "feature_request"];
    if (payload.type && !validTypes.includes(payload.type)) {
      throw new Error("Invalid issue type");
    }
    const validStatuses = ["open", "in_progress", "resolved"];
    if (payload.status && !validStatuses.includes(payload.status)) {
      throw new Error("Invalid issue status");
    }
    if (user.role === "contributor") {
      if (Number(issue.reporter_id) !== Number(user.id)) {
        throw new Error("Forbidden");
      }
      if (issue.status !== "open") {
        throw new Error("You can only update open issues");
      }
      if (payload.status) {
        throw new Error("Contributors cannot update issue status");
      }
    }
    let finalStatus = issue.status;
    if (payload.status === "resolved") {
      finalStatus = "resolved";
    } else if (payload.title || payload.description || payload.type) {
      finalStatus = "in_progress";
    }
    const updatedIssue = await pool.query(
      `
    UPDATE issues SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      status = $4,
      updated_at = NOW()
    WHERE id = $5
    RETURNING *
    `,
      [
        payload.title ?? null,
        payload.description ?? null,
        payload.type ?? null,
        finalStatus,
        id
      ]
    );
    return updatedIssue.rows[0];
  },
  async deleteIssue(id, user) {
    if (user.role !== "maintainer") {
      throw new Error("Forbidden");
    }
    const existingIssue = await pool.query(
      `
    SELECT id FROM issues WHERE id = $1
    `,
      [id]
    );
    if (!existingIssue.rows[0]) {
      throw new Error("Issue not found");
    }
    await pool.query(
      `
    DELETE FROM issues
    WHERE id = $1
    `,
      [id]
    );
    return true;
  }
};

// src/api/controllers/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const issue = await issueService.createIssue(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const issues = await issueService.getIssues({
      sort: sort === "oldest" ? "oldest" : "newest",
      ...typeof type === "string" && { type },
      ...typeof status === "string" && { status }
    });
    res.status(200).json({
      success: true,
      message: "Issues retrived successfully",
      data: issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const issue = await issueService.getIssueById(Number(req.params.id));
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue retrived successfully",
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const issue = await issueService.updateIssue(
      Number(req.params.id),
      req.body,
      req.user
    );
    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: issue
    });
  } catch (error) {
    if (error.message === "Issue not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === "Forbidden" || error.message === "You can only update open issues") {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    await issueService.deleteIssue(Number(req.params.id), req.user);
    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    if (error.message === "Forbidden") {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === "Issue not found") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};

// src/api/routes/issue.routes.ts
var router2 = Router2();
router2.post("/", auth_default("contributor", "maintainer"), createIssue);
router2.get("/", getAllIssues);
router2.get("/:id", getSingleIssue);
router2.patch("/:id", auth_default("contributor", "maintainer"), updateIssue);
router2.delete("/:id", auth_default("maintainer"), deleteIssue);
var issue_routes_default = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server with TypeScript",
    author: "Next Level"
  });
});
app.use("/api/auth", auth_routes_default);
app.use("/api/issues", issue_routes_default);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = async () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`server is running at port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map