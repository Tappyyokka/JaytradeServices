
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomInt } = require("crypto");
const prisma = require("../src/config/prisma");
const rateLimit = require("../src/rateLimit");

const router = express.Router();

const COOKIE_NAME = "indipay_token";

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function createToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function generateAccountId() {
    return String(randomInt(100000000000, 1000000000000));
}

// REGISTER CUSTOMER
router.post("/register", rateLimit({ limit: 60, windowMs: 15 * 60 * 1000 }), async (req, res) => {
    try {
        const { fullName, mobile, email, password, referralCode } = req.body ?? {};

        if (![fullName, mobile, email, password].every((value) => typeof value === "string" && value.trim()) ||
            (referralCode != null && (typeof referralCode !== "string" || referralCode.length > 20))) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields.",
            });
        }

        const cleanName = fullName.trim();
        const cleanMobile = mobile.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: "Enter a valid email address." });
        }

        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit mobile number.",
            });
        }

        if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters and be at most 72 bytes.",
            });
        }

        if (cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name is too long.",
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: cleanEmail },
                    { phone: cleanMobile },
                ],
            },
        });

        let referrer = null;

if (referralCode && referralCode.trim()) {
    referrer = await prisma.user.findUnique({
        where: {
            referralCode: referralCode.trim().toUpperCase(),
        },
        select: {
            id: true,
        },
    });

    if (!referrer) {
        return res.status(400).json({
            success: false,
            message: "Invalid referral link. Please check the link and try again.",
        });
    }
}

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    existingUser.email === cleanEmail
                        ? "An account with this email already exists."
                        : "An account with this mobile number already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        let user = null;

        for (let attempt = 0; attempt < 5; attempt++) {
            const accountId = generateAccountId();

            try {
                user = await prisma.user.create({
                    data: {
                        accountId,
                        name: cleanName,
                        email: cleanEmail,
                        phone: cleanMobile,
                        password: hashedPassword,
                        role: "CUSTOMER",
                        referralCode: `IND${accountId}`,
                        referredById: referrer?.id || null,
                    },
                });

                break;

            } catch (error) {
                const target = error.meta?.target;
                const accountIdConflict =
                    error.code === "P2002" &&
                    (
                        target === "accountId" ||
                        (Array.isArray(target) && target.includes("accountId")) ||
                        (typeof target === "string" && target.includes("accountId"))
                    );

                if (accountIdConflict) {
                    continue;
                }

                throw error;
            }
        }

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "Could not generate an account ID. Please try again.",
            });
        }

        const token = createToken(user);

        res.cookie(COOKIE_NAME, token, getCookieOptions());

        return res.status(201).json({
            success: true,
            message: "Account created successfully!",
            user: {
                id: user.id,
                role: user.role,
                referralCode: user.referralCode,
                accountId: user.accountId,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });

    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "An account already exists with those details." });
        }
        console.error("Registration error:", error.code || error.name);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during registration.",
        });
    }
});

// INDIPAY LOGIN
function loginIdentifier(body) {
    const value = body?.identifier ?? body?.email;
    return typeof value === "string" && value.length <= 254 ? value.trim().toLowerCase() : "";
}

router.post("/login",
    rateLimit({ limit: 300, windowMs: 15 * 60 * 1000 }),
    rateLimit({
        limit: 15,
        windowMs: 15 * 60 * 1000,
        key: (req) => loginIdentifier(req.body) || null,
    }),
    async (req, res) => {
    try {
        const { password, mode, remember } = req.body ?? {};
        const identifier = loginIdentifier(req.body);
        const byPhone = mode === "merchant" && /^[6-9]\d{9}$/.test(identifier);

        if (!identifier || (mode !== undefined && !["customer", "merchant", "admin"].includes(mode)) ||
            typeof password !== "string" || !password || password.length > 1024) {
            return res.status(400).json({
                success: false,
                message: "Enter your sign-in details and password.",
            });
        }

        const user = await prisma.user.findUnique({
            where: byPhone ? { phone: identifier } : { email: identifier },
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: byPhone ? "Invalid mobile number or password." : "Invalid email or password.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is currently inactive.",
            });
        }

        if ((mode === "admin") !== (user.role === "ADMIN")) {
            return res.status(403).json({
                success: false,
                message: mode === "admin" ? "Administrator access is required." : "Use Administrator Sign-in for this account.",
            });
        }

        const token = createToken(user);

        const cookieOptions = getCookieOptions();
        if (remember === false) delete cookieOptions.maxAge;
        res.cookie(COOKIE_NAME, token, cookieOptions);

        return res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                role: user.role,
                referralCode: user.referralCode,
                accountId: user.accountId,
                name: user.name,
                email: user.email,
                phone: user.phone,
            },
        });

    } catch (error) {
        console.error("Login error:", error.code || error.name);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login.",
        });
    }
});

// AUTHENTICATION MIDDLEWARE
async function authenticateCustomer(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please log in to continue.",
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
        if (typeof decoded?.userId !== "string" || !decoded.userId) throw new Error("Invalid session");
    } catch {
        return res.status(401).json({
            success: false,
            message: "Your session has expired. Please log in again.",
        });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, isActive: true, role: true, adminRole: true },
        });
        if (!user?.isActive) return res.status(401).json({ success: false, message: "Account not found or inactive." });
        req.user = { id: user.id, role: user.role, adminRole: user.adminRole };
        next();
    } catch (error) {
        console.error("Session lookup failed:", error.code || error.name);
        res.status(503).json({ success: false, message: "Account service temporarily unavailable." });
    }
}

// GET LOGGED-IN CUSTOMER
router.get("/me", authenticateCustomer, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                accountId: true,
                referralCode: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account not found or inactive.",
            });
        }

        return res.json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Account lookup error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not retrieve your account.",
        });
    }
});

// GET CUSTOMER REFERRALS

// GET CUSTOMER REFERRALS
router.get("/referrals", authenticateCustomer, async (req, res) => {
    try {
        let user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                accountId: true,
                referralCode: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Customer account not found.",
            });
        }

        // Generate a referral code for existing accounts
        if (!user.referralCode) {
            const newReferralCode = user.accountId
                ? `IND${user.accountId}`
                : `IND${user.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;

            user = await prisma.user.update({
                where: { id: user.id },
                data: { referralCode: newReferralCode },
                select: {
                    id: true,
                    accountId: true,
                    referralCode: true,
                },
            });
        }

        const referrals = await prisma.user.findMany({
            where: {
                referredById: req.user.id,
            },
            select: {
                name: true,
                accountId: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.json({
            success: true,
            referralCode: user.referralCode,
            totalReferrals: referrals.length,
            referrals,
        });

    } catch (error) {
        console.error("Referral lookup error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not retrieve referral details.",
        });
    }
});


// LOGOUT CUSTOMER
router.post("/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    });

    return res.json({
        success: true,
        message: "Logged out successfully.",
    });
});

module.exports = router;
module.exports.authenticateCustomer = authenticateCustomer;
