
import express, { type Application, type Request, type Response } from "express";
import logger from "./middleware/logger";
import { pool } from "./db";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended: true}))
app.use(logger)

app.get('/', (req: Request, res: Response) =>{
    // res.send("hello world")
     res.status(200).json({
    message: "Express Server with TypeScript",
    author: "Next Level",
  });
})

app.post("/users", async(req: Request, res: Response)=>{
  const {name, email, password} = req.body;
  try {
      const result = await pool.query(`
    INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *
    `, [name, email, password])
    console.log(result)
  res.status(201).json({
    message: "Created",
    data: result.rows[0]
  })
  } catch (error:any) {
     res.status(500).json({
    message: error.message,
    error: error
  })
  }
})

export default app;