// Must load before @universalbookmarks/shared/config, which parses process.env at import time.
import "dotenv/config";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import serverConfig from "@universalbookmarks/shared/config";

import { db } from "./drizzle";

if (serverConfig.degradedMode) {
  console.log("Skipping database migrations in degraded mode");
} else {
  migrate(db, { migrationsFolder: "./drizzle" });
}
