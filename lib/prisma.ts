import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";

const isProduction = process.env.NODE_ENV === "production";

let prisma: PrismaClient;

if (isProduction) {
    // Production: Use Turso
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoAuthToken) {
        throw new Error(
            "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in production"
        );
    }

    const adapter = new PrismaLibSql({
        url: `${tursoUrl}`,
        authToken: `${tursoAuthToken}`,
    });
    prisma = new PrismaClient({ adapter });
} else {
    // Development: Use SQLite
    const connectionString = `${process.env.DATABASE_URL}`;
    const adapter = new PrismaBetterSqlite3({ url: connectionString });
    prisma = new PrismaClient({ adapter });
}

export { prisma };