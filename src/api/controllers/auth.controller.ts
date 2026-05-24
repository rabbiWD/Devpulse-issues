import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";
import type { IUser } from "../../types";
import { signToken } from "../../utils/jwt";
import authService from "../services/auth.service";

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({
      message: "User created successfully",
      data: user.rows[0],
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await authService.validUser(email, password);
    const tokens = signToken(user);

    // res.cookie("refreshToken", tokens.refreshToken, {
    //   secure: false,
    //   httpOnly: true,
    //   sameSite: "lax",
    //   path: "/",
    // });

    res.status(200).json({
      success: true,
      message: "User login successfully",
      data: {
        user,
        tokens,
      },
    });
  } catch (error: any) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

// export const refresh = async (req: Request, res: Response) => {
//   try {
//     const refreshToken = req.cookies?.refreshToken;

//     if (!refreshToken) {
//       return res.status(401).json({
//         success: false,
//         message: "Refresh token not found",
//       });
//     }

//     const payload = jwt.verify(refreshToken, config.refresh_secret) as IUser;
//     console.log("Payload:",payload)

//     const accessToken = jwt.sign(payload, config.jwt_secret, {
//       expiresIn: "1d",
//     });

//     const newRefreshToken = jwt.sign(payload, config.refresh_secret, {
//       expiresIn: "7d",
//     });

//     res.cookie("refreshToken", newRefreshToken, {
//       secure: false,
//       httpOnly: true,
//       sameSite: "lax",
//       path: "/",
//     });

//     res.status(200).json({
//       success: true,
//       message: "Access token refreshed",
//       data: {
//         accessToken,
//       },
//     });
//   } catch (error: any) {
//     res.clearCookie("refreshToken", { path: "/" });
//     res.status(401).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
