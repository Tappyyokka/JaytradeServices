const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { parse } = require("dotenv");

const backend = path.resolve(__dirname, "..");
const isolated = parse(fs.readFileSync(path.join(backend, ".env.phase2.local")));
const database = new URL(isolated.INDIPAY_DEMO_DATABASE_URL);
if (!["localhost", "127.0.0.1", "[::1]"].includes(database.hostname) ||
    database.pathname !== "/indipay_registration_phase2" || database.username !== "indipay_phase2_app") {
    throw new Error("Unexpected isolated Indipay database.");
}
if (process.env.NODE_ENV === "production" || process.env.RENDER) throw new Error("Demo launch is local development only.");
Object.assign(process.env, {
    NODE_ENV: "development",
    DATABASE_URL: database.href,
    INDIPAY_REGISTRATION_DEMO: "0",
    INDIPAY_SERVICE_PROCESSING: "1",
    INDIPAY_COMPANY_BILLS: "1",
    INDIPAY_DURABLE_DELIVERY: "1",
    INDIPAY_REGISTRATION_DEMO_ISOLATION: isolated.INDIPAY_REGISTRATION_DEMO_ISOLATION,
    INDIPAY_API_KEY: isolated.INDIPAY_API_KEY,
    JWT_SECRET: isolated.JWT_SECRET,
    FRONTEND_URL: "http://localhost:5184",
    JAYTRADE_LEADS_API_URL: "http://localhost:5011/api/integrations/indipay/leads",
    JAYTRADE_STATUS_API_URL: "http://localhost:5011/api/integrations/indipay/leads",
});
process.chdir(backend);

async function main() {
    const prisma = require("../src/config/prisma");
    const { registrationDemoIsolationMatches } = require("../src/registrationDemoIsolation");
    if (!(await registrationDemoIsolationMatches(prisma))) throw new Error("Isolated database attestation failed.");
    if (process.argv[2] === "migrate") {
        const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { stdio: "inherit" });
        await prisma.$disconnect();
        process.exitCode = result.status ?? 1;
    } else {
        const { startApplicationDelivery } = require("../src/applicationDelivery");
        startApplicationDelivery(prisma, process.env.JAYTRADE_LEADS_API_URL, process.env.INDIPAY_API_KEY);
        require("../server").listen(5012, "127.0.0.1", (error) => {
            if (error) throw error;
            console.log("Isolated Indipay service processing at http://localhost:5012. Payments disabled.");
        });
    }
}

main().catch((error) => {
    console.error("Isolated Indipay setup stopped:", error.code || error.name);
    process.exitCode = 1;
});
