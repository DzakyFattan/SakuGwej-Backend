import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const connString = process.env.MONGO_URL || "";

const client = new MongoClient(connString);

async function connect() {
  await client.connect();
  return client;
}

let conn = connect();

export default conn;
