import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const connString = process.env.ATLAS_URI || '';

const client = new MongoClient(connString);

let conn = await client.connect();

let db = conn.db('test');

export default db;