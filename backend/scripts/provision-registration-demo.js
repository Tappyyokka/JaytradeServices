const { randomBytes } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("dotenv");
const { Client } = require("pg");

const backend = path.resolve(__dirname, "..");
const output = path.join(backend, ".env.phase2.local");
const jaytradeDir = process.argv[2];
const randomSecret = () => randomBytes(32).toString("hex");
const token = randomSecret();

function environment(directory) {
    const { DATABASE_URL: value } = parse(fs.readFileSync(path.join(directory, ".env")));
    const url = new URL(value.replace(/^postgresql\+psycopg:/, "postgresql:"));
    if (!["postgresql:", "postgres:"].includes(url.protocol) ||
        !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
        throw new Error("Provisioning requires the existing local PostgreSQL server.");
    }
    return url;
}

async function withDatabase(url, work) {
    const db = new Client({ connectionString: url.href });
    await db.connect();
    try {
        return await work(db);
    } finally {
        await db.end();
    }
}

async function provision(adminUrl, database, role, purpose, protectedTables) {
    const password = randomSecret();
    await withDatabase(adminUrl, async (db) => {
        const { rows: [existing] } = await db.query(
            "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS database, EXISTS (SELECT 1 FROM pg_roles WHERE rolname = $2) AS role",
            [database, role],
        );
        if (existing.database || existing.role) throw new Error("An isolated database or role already exists. Use the existing setup rather than reprovisioning.");
        // Database and role identifiers are fixed below. The generated password is hexadecimal.
        await db.query(`CREATE ROLE ${role} LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
        const { rows: [permissions] } = await db.query(
            "SELECT bool_or(has_table_privilege($1, table_name, 'INSERT,UPDATE,DELETE')) AS writable FROM unnest($2::text[]) AS tables(table_name)",
            [role, protectedTables],
        );
        if (permissions.writable) throw new Error("The demo role can write to an existing protected table.");
        await db.query(`CREATE DATABASE ${database} TEMPLATE template0`);
        await db.query(`REVOKE CONNECT ON DATABASE ${database} FROM PUBLIC`);
        await db.query(`GRANT CONNECT ON DATABASE ${database} TO ${role}`);
    });

    const isolated = new URL(adminUrl.href);
    isolated.pathname = "/" + database;
    await withDatabase(isolated, async (db) => {
        await db.query(`GRANT USAGE, CREATE ON SCHEMA public TO ${role}`);
        await db.query("CREATE SCHEMA indipay_demo_guard");
        await db.query("CREATE TABLE indipay_demo_guard.isolation (purpose text PRIMARY KEY, token text NOT NULL, database_name name NOT NULL, login_role name NOT NULL)");
        await db.query("INSERT INTO indipay_demo_guard.isolation VALUES ($1, $2, current_database(), $3)", [purpose, token, role]);
        await db.query(`GRANT USAGE ON SCHEMA indipay_demo_guard TO ${role}`);
        await db.query(`GRANT SELECT ON indipay_demo_guard.isolation TO ${role}`);
    });
    isolated.username = role;
    isolated.password = password;
    return isolated.href;
}

async function main() {
    if (!jaytradeDir || fs.existsSync(output)) throw new Error("Provide the Jaytrade project path and keep any existing isolated configuration.");
    const indipayAdmin = environment(backend);
    const jaytradeAdmin = environment(jaytradeDir);
    const indipay = await provision(indipayAdmin, "indipay_registration_phase2", "indipay_phase2_app", "indipay-registration",
        ['public."MarketplaceWallet"', 'public."MarketplaceLedgerEntry"', 'public."ApplicationDemoRegistration"', 'public."ApplicationDemoCredit"']);
    const jaytrade = await provision(jaytradeAdmin, "jaytrade_registration_phase2", "jaytrade_phase2_app", "jaytrade-registration",
        ["public.indipay_registrations", "public.leads"]);
    fs.writeFileSync(output, [
        `INDIPAY_DEMO_DATABASE_URL=${indipay}`,
        `JAYTRADE_DEMO_DATABASE_URL=${jaytrade.replace(/^postgres(?:ql)?:/, "postgresql+psycopg:")}`,
        `INDIPAY_REGISTRATION_DEMO_ISOLATION=${token}`,
        `INDIPAY_API_KEY=${randomSecret()}`,
        `JWT_SECRET=${randomSecret()}`,
        `SECRET_KEY=${randomSecret()}`,
        "",
    ].join("\n"), { flag: "wx", mode: 0o600 });
    console.log("Created empty isolated PostgreSQL databases and a git-ignored local configuration.");
}

main().catch((error) => {
    console.error("Isolated database provisioning stopped:", error.code || error.message);
    process.exitCode = 1;
});
