import { pool } from "../../db";
import type { IUser } from "../../types";
import bcrypt from "bcrypt";

class AuthService {
  async createUser(user: IUser) {
    const { name, email, password, role } = user;

    if (!name) {
      throw new Error("Name is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (role && !["contributor", "maintainer"].includes(role)) {
      throw new Error("Invalid role");
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("Email already exists");
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashpassword, role]
    );

    return result.rows[0];
  }

  async validUser(email: string, password: string) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const userData = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userData.rows.length === 0) {
      throw new Error("Invalid Credentials");
    }

    const user = userData.rows[0];

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      throw new Error("Invalid Credentials");
    }

    return user;
  }
}

export default new AuthService();