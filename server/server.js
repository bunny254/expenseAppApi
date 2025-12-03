import express from "express"
import dotenv from "dotenv"
import { sql } from "./config/db.js"
import rateLimiter from "./middleware/rateLimiter.js"

dotenv.config()

const app = express()

//Middleware
app.use(rateLimiter)
app.use(express.json());

const port = process.env.PORT || 5000;

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

app.get("/api/transactions/:userId", async(req, res)=>{
    try {
        const {userId} = req.params;

        const userTransactions = await sql`
        SELECT * FROM transactions WHERE user_id=${userId} ORDER BY created_at DESC
        `;
        res.status(200).json(userTransactions)
    } catch (error) {
        console.error("Error getting transactions!", error)
        return res.status(500).json({ message: "Internal server error" })          
    }
})

app.post('/api/transactions', async(req, res)=>{
    try {
        const {title, amount, category, user_id} = req.body;
        if(!title || amount===undefined || !category || !user_id){
            return res.status(400).json({message:"All fields are required"})
        }
        const transaction = await sql`
        INSERT INTO transactions(user_id, title, amount, category)
        VALUES(${user_id}, ${title}, ${amount}, ${category})
        RETURNING * 
        `;
        res.status(201).json(transaction)
    } catch (error) {
        console.error("Error creating transaction!", error)
        return res.status(500).json({ message: "Internal server error" })        
    }
})

app.delete("/api/transactions/:id", async(req, res)=>{
    try {
    const {id} = req.params;

    if(isNaN(parseInt(id))){
        return res.status(400).json({message: "Invalid transaction id!"})
    }
    
    const result = await sql`
    delete from transactions where id= ${id} RETURNING *
    `
    if(result.length === 0){
        res.status(404).json({message: "Transactions does not exist!"})
    }
        res.status(201).json('Transactions successfully deleted')     
    } catch (error) {
        console.error("Error deleting transaction!", error)
        return res.status(500).json({ message: "Internal server error" })             
    }
})

app.get("/api/transactions/summary/:userId", async(req, res)=>{
    try {
        const {userId} = req.params;
        const balanceResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions WHERE user_id=${userId};
        `
        const incomeResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS income FROM transactions WHERE user_id=${userId} AND amount > 0;
        `
        const expenseResult = await sql`
        SELECT COALESCE(SUM(amount), 0) AS expense FROM transactions WHERE user_id=${userId} AND amount < 0;
        `
        res.status(200).json({
            balance: balanceResult[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense
        })
        
    } catch (error) {
        console.error("Error getting transaction summary!", error);
        return res.status(500).json({ message: "Internal server error" });   
    }
})

startDB().then(()=>{
    app.listen(port, ()=>{
    console.log(`{"Server is running on port: ${port}}`)
});
})



