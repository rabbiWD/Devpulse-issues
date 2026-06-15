import config from "../config";
import type { IUser } from "../types";
import jwt from "jsonwebtoken";

export const signToken = (user: IUser) => {
  const payload = {
   id: user.id,
   name: user.name,
   role: user.role ?? "contributor",
  }

  const accessToken = jwt.sign(payload, config.jwt_secret, {
    expiresIn: "1d",
  });

return accessToken;
};