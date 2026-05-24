import { signToken } from "../../utils/jwt";
import authService from "../services/auth.service";
export const signup = async (req, res) => {
    try {
        const user = await authService.createUser(req.body);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user.rows[0],
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authService.validUser(email, password);
        const tokens = signToken(user);
        res.status(200).json({
            success: true,
            message: "User login successfully",
            data: { user, tokens, },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};
//# sourceMappingURL=auth.controller.js.map