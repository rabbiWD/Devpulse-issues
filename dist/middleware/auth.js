import jwt from "jsonwebtoken";
import config from "../config";
const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: No token provided",
                });
            }
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : authHeader;
            const decoded = jwt.verify(token, config.jwt_secret);
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden!!",
                });
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || "Unauthorized",
            });
        }
    };
};
export default auth;
//# sourceMappingURL=auth.js.map