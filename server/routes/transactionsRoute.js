import express from "express"
export const router = express.Router()
import { sql } from "../config/db.js"
import { getTransactionsbyUserId } from "../controllers/transactionsController.js"

router.get("/:userId", getTransactionsbyUserId);
router.post('/', async(req, res)=>{
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

router.delete("/:id", async(req, res)=>{
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

router.get("/summary/:userId", async(req, res)=>{
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


export default router;