import dotenv from "dotenv";
dotenv.config({ quiet: true });
import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function createConnection() {
  return mysql.createConnection(dbConfig);
}
