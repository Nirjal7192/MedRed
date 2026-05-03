const jwt = require('jsonwebtoken');

/**
 * Internal helper to decode and verify token
 * Replaces: verifyToken  
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        if (!decoded.sub) {
            throw new Error("The 'sub' field is missing from the token.");  
        }
        
        return { user: decoded.user, sub: decoded.sub };  
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw { status: 401, message: "Token expired" };  
        }
        throw { status: 401, message: "Invalid token" };  
    }
};

/**
 * Middleware to check for cookie and authenticate user
 * Replaces: getCurrentUserFromCookie  
 */
const protect = (req, res, next) => {
    // Requires cookie-parser middleware in index.js
    const accessToken = req.cookies.token; 

    if (!accessToken) {
        return res.status(401).json({ error: "Not authenticated - No token provided" });  
    }

    try {
        const userData = verifyToken(accessToken);
        // Attach user data to request object for use in routes
        req.user = userData;
        next();
    } catch (err) {
        return res.status(err.status || 401).json({ error: err.message });
    }
};

module.exports = { protect };