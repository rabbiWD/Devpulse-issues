import { pool } from "../../db";
import type { IUser } from "../../types";
import bcrypt from "bcrypt";

class AuthService {
  async createUser(user: IUser) {
    const { name, email, password, role } = user;

    const hashpassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3,  COALESCE($4, 'contributor')) RETURNING *",
      [name, email, hashpassword, role],
    );
    return result;
  }

  async validUser(email: string, password: string) {
    // const{name, email, password, role} = user

    // const hashpassword = await bcrypt.hash(password, 10);

    const userData = await pool.query("SELECT * FROM users WHERE email =$1", [
      email,
    ]);
    if (userData.rows.length === 0) {
      throw new Error("Invalid Creadentials");
    }
    const user = userData.rows[0];

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      throw new Error("Invalid Creadentials");
    }
    // return userData;
  }
}

export default new AuthService();
