function rateLimit({ limit, windowMs, key = (req) => req.ip }) {
    const buckets = new Map();
    let nextCleanup = 0;

    return (req, res, next) => {
        const now = Date.now();
        if (now >= nextCleanup) {
            for (const [id, bucket] of buckets) {
                if (bucket.expires <= now) buckets.delete(id);
            }
            nextCleanup = now + windowMs;
        }

        const id = key(req);
        if (!id) return next();
        let bucket = buckets.get(id);
        if (!bucket || bucket.expires <= now) {
            if (buckets.size >= 10000 && !bucket) {
                res.set("Retry-After", "60");
                return res.status(429).json({ success: false, message: "Too many requests. Try again shortly." });
            }
            bucket = { count: 0, expires: now + windowMs };
            buckets.set(id, bucket);
        }

        if (bucket.count >= limit) {
            res.set("Retry-After", String(Math.ceil((bucket.expires - now) / 1000)));
            return res.status(429).json({ success: false, message: "Too many requests. Try again shortly." });
        }
        bucket.count++;
        next();
    };
}

module.exports = rateLimit;
