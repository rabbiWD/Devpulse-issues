import { pool } from "../../db";
export const issueService = {
    async createIssue(payload, user) {
        const reporterId = Number(user.id);
        const result = await pool.query(`INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [
            payload.title,
            payload.description,
            payload.type,
            reporterId,
        ]);
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
        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";
        const result = await pool.query(`
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    ${whereClause}
    ORDER BY created_at ${sort}
    `, values);
        const issues = result.rows;
        if (!issues.length) {
            return [];
        }
        // collect reporter ids safely
        const reporterIds = [
            ...new Set(issues
                .map(i => Number(i.reporter_id))
                .filter(Boolean)),
        ];
        let userMap = new Map();
        if (reporterIds.length > 0) {
            const usersResult = await pool.query(`
      SELECT id, name, role
      FROM users
      WHERE id = ANY($1)
      `, [reporterIds]);
            userMap = new Map(usersResult.rows.map(u => [Number(u.id), u]));
        }
        return issues.map(issue => {
            const reporter = userMap.get(Number(issue.reporter_id));
            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                type: issue.type,
                status: issue.status,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                reporter: reporter
                    ? {
                        id: reporter.id,
                        name: reporter.name,
                        role: reporter.role,
                    }
                    : null,
            };
        });
    },
    async getIssueById(id) {
        const result = await pool.query(`
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    WHERE id = $1
    `, [id]);
        if (!result.rows.length) {
            return null;
        }
        const issue = result.rows[0];
        const userResult = await pool.query(`
    SELECT id, name, role
    FROM users
    WHERE id = $1
    `, [issue.reporter_id]);
        const reporter = userResult.rows[0];
        return {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            reporter: reporter
                ? {
                    id: reporter.id,
                    name: reporter.name,
                    role: reporter.role,
                }
                : null,
        };
    },
    async updateIssue(id, payload, user) {
        const existingIssue = await pool.query(`
    SELECT * FROM issues WHERE id = $1
    `, [id]);
        const issue = existingIssue.rows[0];
        if (!issue) {
            throw new Error("Issue not found");
        }
        // valid type check
        const validTypes = ["bug", "feature_request"];
        if (payload.type && !validTypes.includes(payload.type)) {
            throw new Error("Invalid issue type");
        }
        // valid status check
        const validStatuses = ["open", "in_progress", "resolved"];
        if (payload.status && !validStatuses.includes(payload.status)) {
            throw new Error("Invalid issue status");
        }
        // contributor permission check
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
        }
        else if (payload.title ||
            payload.description ||
            payload.type) {
            finalStatus = "in_progress";
        }
        const updatedIssue = await pool.query(`
    UPDATE issues SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      status = $4,
      updated_at = NOW()
    WHERE id = $5
    RETURNING *
    `, [
            payload.title ?? null,
            payload.description ?? null,
            payload.type ?? null,
            finalStatus,
            id,
        ]);
        return updatedIssue.rows[0];
    },
    async deleteIssue(id, user) {
        // maintainer only check
        if (user.role !== "maintainer") {
            throw new Error("Forbidden");
        }
        // check issue exists
        const existingIssue = await pool.query(`
    SELECT id FROM issues WHERE id = $1
    `, [id]);
        if (!existingIssue.rows[0]) {
            throw new Error("Issue not found");
        }
        // delete issue
        await pool.query(`
    DELETE FROM issues
    WHERE id = $1
    `, [id]);
        return true;
    }
};
//# sourceMappingURL=issue.service.js.map