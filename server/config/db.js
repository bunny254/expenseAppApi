import {neon} from '@neondatabase/serverless'
import "dotenv/config";

//Create a SQL connection
export const sql = neon(process.env.DB)

