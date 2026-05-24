import dotenv from "dotenv";
import { env } from "process";
import path from "path";
dotenv.config({
    quiet: true,
    path: path.join(process.cwd(), ".env")
});
const config = {
    port: env.PORT,
    database_url: env.DATABASE_URL,
    jwt_secret: env.JWT_SECRET,
    refresh_secret: env.REFRESH_SECRET
};
export default config;
//# sourceMappingURL=index.js.map