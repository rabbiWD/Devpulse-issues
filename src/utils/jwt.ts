import config from "../config";
import type { IUser } from "../types";
import jwt from "jsonwebtoken"
export const signToken = (payload: IUser)=>{
   const accessToken = jwt.sign(payload, config.jwt_secret,{
    expiresIn:"1d"
   })

   const refreshToken = jwt.sign(payload, config.refresh_secret,{
    expiresIn:"7d"
   })
  
   return {accessToken, refreshToken}
   
}

