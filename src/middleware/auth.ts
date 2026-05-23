import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types";



const auth = (...roles: ROLES[]) => {
   
  return async (req: Request, res: Response, next: NextFunction) => {
     console.log(roles)
   try{
    const token = req.headers.authorization;
    console.log("Token from header:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const decoded = jwt.verify(token, config.jwt_secret) as JwtPayload
    // console.log("Decoded token:", decoded);
    const userData = await pool.query(`SELECT * FROM users WHERE email = $1`, [decoded.email]);
    // console.log("useer data:", userData)
    const user = userData.rows[0];
    // console.log("User from DB:", user);
        if (userData.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }

        if (!user?.is_active) {
            res.status(403).json({
                success: false,
                message: "Forbidden: User is not active",
            });
        }

     
        if(roles.length && !roles.includes(user.role)){
            res.status(403).json({
                success : false,
                message: 'Forbidden!!',
            })
        }

    req.user = decoded 

    next();
   }catch(error:any){
    next(error);
   }
  };
};

export default auth;
