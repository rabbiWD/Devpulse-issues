import { Pool } from "pg";
import config from "../config";
// import config from './../config/index';

export const pool = new Pool({
  connectionString: config.database_url,
});

// //  CHECK (role IN ('contributor', 'maintainer')),
//  // CHECK (type IN ('bug', 'feature_request')),

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor',
            
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
                
                )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(150),
            description TEXT NOT NULL,
            type VARCHAR(30) NOT NULL,
           
            reporter_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            
            )
        
        `);

    console.log("Database Connected");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
