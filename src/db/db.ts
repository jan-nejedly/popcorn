import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
const postgres = require('postgres');

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client);
