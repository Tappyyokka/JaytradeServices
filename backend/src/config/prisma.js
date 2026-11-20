const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../../generated/prisma/client");
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
});

pool.on("error", (error) => {
    console.error("PostgreSQL pool error:", error.message);
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

module.exports = prisma;
