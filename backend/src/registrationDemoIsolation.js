async function registrationDemoEnabled(db, env = process.env) {
    if (env.INDIPAY_REGISTRATION_DEMO !== "1" || env.NODE_ENV !== "development" || env.RENDER) return false;
    return registrationDemoIsolationMatches(db, env);
}

async function registrationDemoIsolationMatches(db, env = process.env) {
    const token = env.INDIPAY_REGISTRATION_DEMO_ISOLATION;
    if (!/^[a-f0-9]{64}$/.test(token ?? "")) return false;

    try {
        const [result] = await db.$queryRaw`
            SELECT EXISTS (
                SELECT 1 FROM indipay_demo_guard.isolation
                WHERE purpose = 'indipay-registration' AND token = ${token}
                    AND database_name = current_database() AND login_role = session_user
            ) AS allowed
        `;
        return result?.allowed === true;
    } catch {
        // Ordinary databases have no isolation schema. Unavailable guards fail closed.
        return false;
    }
}

module.exports = { registrationDemoEnabled, registrationDemoIsolationMatches };
