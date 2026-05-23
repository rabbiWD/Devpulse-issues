import type { Request, Response } from "express";
import authService from "../services/auth.service";
import { signToken } from "../../utils/jwt";

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
    res.status(200).json({
      success: true,
      message: "User login successfully",
      data: {
        user,
        tokens,
      },
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
