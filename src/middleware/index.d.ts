import type{jwtPayload} from "jsonwebtoken";
declare global {
    namespace Express {
        interface Request {
            user: jwtPayload;
        }
    }
}