import { pool } from "../../db";
import type { IIssueFilters, IJwtPayload } from "../../types";

export const issueService = {
  async createIssue(
    payload: { title: string; description: string; type: string },
    user: IJwtPayload,
  ) {
    const reporterId = Number(user.id);

    const result = await pool.query(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        payload.title,
        payload.description,
        payload.type,
        reporterId,
      ],
    );

    return result.rows[0];
  },

  async getIssues(filters: IIssueFilters = {}) {
  const sort = filters.sort === "oldest" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const values: any[] = [];

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

  // Step: collect reporter ids
  const reporterIds = [
    ...new Set(issues.map(i => Number(i.reporter_id)))
  ];

  // Step: fetch users in batch
  const usersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds]
  );

  const userMap = new Map(
    usersResult.rows.map(u => [u.id, u])
  );

  // Step: final response shape
  return issues.map(issue => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    reporter: userMap.get(Number(issue.reporter_id))
      ? {
          id: userMap.get(Number(issue.reporter_id)).id,
          name: userMap.get(Number(issue.reporter_id)).name,
          role: userMap.get(Number(issue.reporter_id)).role,
        }
      : null,
  }));
}
};


