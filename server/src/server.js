import express from "express"
import dotenv from "dotenv"
import { sql } from "../config/db.js"
import rateLimiter from "../middleware/rateLimiter.js"
import transactionsRoute from "../routes/transactionsRoute.js"
import job from "../config/cron.js"

dotenv.config()

const app = express()
if(process.env.NODE_ENV ==="production") job.start();

//Middleware
app.use(rateLimiter)
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
    res.status(200).send("API is healthy");
});

async function startDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;
        console.log("Database successfully initialized")
    } catch (error) {
        console.error("Error starting the Database", error)
        process.exit(1); //(0:Success, 1:Failure)        
    }
}

app.get("/", (req, res) =>{
    res.json(["Welcome to Personal Finance.."])
})

app.use('/api/transactions',transactionsRoute);

startDB().then(()=>{
    app.listen(port, ()=>{
    console.log(`------ Server is running on port: ${port} ------`)
});
})



