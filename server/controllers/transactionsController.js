import { sql } from "../config/db.js"
export async function getTransactionsbyUserId(req, res) {
    try {
            const {userId} = req.params;
    
            const userTransactions = await sql`
            SELECT * FROM transactions WHERE user_id=${userId} ORDER BY created_at DESC
            `;
            return res.status(200).json(userTransactions)
        } catch (error) {
            console.error("Error getting transactions!", error)
            return res.status(500).json({ message: "Internal server error" })          
        }
}
