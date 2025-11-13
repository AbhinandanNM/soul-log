import type session from "express-session";
import type { Pool } from "pg";

declare module "connect-pg-simple" {
  interface ConnectPgSimpleOptions {
    pool: Pool;
    tableName?: string;
    schemaName?: string;
    createTableIfMissing?: boolean;
  }

  type PgStoreConstructor = new (options: ConnectPgSimpleOptions) => session.Store;

  function connectPgSimple(store: typeof session): PgStoreConstructor;

  export = connectPgSimple;
}

