/**
 * Middleware to verify the admin secret key.
 * Replaces verify_admin_key from the FastAPI logic.
 */
const verifyAdminKey = (req, res, next) => {
    const adminKey = req.query.admin_key || req.headers['x-admin-key'];
    if (adminKey !== "secret123") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

module.exports = verifyAdminKey;