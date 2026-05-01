import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is required. Set a Neon Postgres connection string in .env (https://console.neon.tech)."
  );
}

const client = neon(url);

export const db = drizzle(client, { schema });
export { schema };
