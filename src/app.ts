import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import logger from "./middleware/logger";
import authRoutes from "./api/routes/auth.routes";
// import issueRoutes from "./modules/issues/routes";
import cookieParser from "cookie-parser";
import issueRoutes from "./api/routes/issue.routes"

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server with TypeScript",
    author: "Next Level",
  });
});



app.use("/auth", authRoutes);
app.use("/api/issues", issueRoutes)

export default app;
