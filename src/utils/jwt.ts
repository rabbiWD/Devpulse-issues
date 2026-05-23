import config from "../config";
import { pool } from "../db";
import type { IJwtPayload, IUser } from "../types";
import jwt, { type JwtPayload } from "jsonwebtoken";

const buildJwtPayload = (user: IUser): IJwtPayload => ({
  id: user.id ?? user.email,
  name: user.name,
  role: user.role ?? "contributor",
});

export const signToken = (user: IUser) => {
  const payload = buildJwtPayload(user);

  const accessToken = jwt.sign(payload, config.jwt_secret, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, config.refresh_secret, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const generateFreshToken = async (
  token: string,
  payload: IJwtPayload,
) => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = jwt.verify(token, config.refresh_secret) as JwtPayload;

  const userData = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    decoded.email,
  ]);

  const user = userData.rows[0];

  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }

  if (!user?.is_active) {
    throw new Error("Forbidden");
  }

  const accessToken = jwt.sign(payload, config.jwt_secret, {
    expiresIn: "1d",
  });

  return accessToken;
};
