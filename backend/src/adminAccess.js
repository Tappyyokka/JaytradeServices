const adminRoles = {
    SUPER: ["*"], FINANCE: ["finance"], APPLICATION: ["applications"], MARKETPLACE: ["marketplace"],
    CONTENT: ["content"], SUPPORT: ["support", "review"], AUDITOR: ["read"],
};

function permissions(user) {
    return user?.role === "ADMIN" ? adminRoles[user.adminRole ?? "SUPER"] ?? [] : [];
}

function canAdmin(user, area, write = false) {
    const grants = permissions(user);
    return grants.includes("*") || grants.includes(area) || (!write && grants.includes("read"));
}

function requireAdminArea(area) {
    return (req, res, next) => {
        if (!canAdmin(req.user, area, !["GET", "HEAD"].includes(req.method))) {
            return res.status(403).json({ message: "Administrator permission required." });
        }
        next();
    };
}

function confirmation(body) {
    const reason = typeof body?.remarks === "string" ? body.remarks.trim() : "";
    if (body?.confirmed !== true || reason.length < 3 || reason.length > 1000) {
        throw Object.assign(new Error("Confirm the action and enter review remarks."), { status: 422 });
    }
    return reason;
}

function audit(db, user, action, target, reason) {
    return db.adminAudit.create({ data: { actorId: user.id, action, target, reason } });
}

module.exports = { adminRoles, permissions, canAdmin, requireAdminArea, confirmation, audit };
