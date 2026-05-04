const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a plain text password
 * Replaces: getPasswordHash
 */
const getPasswordHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Verify a plain password against a hash
 * Replaces: verifyPassword
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Create a JWT access token
 * Replaces: createAccessToken
 */
const createAccessToken = (data, expiresDelta = '7d') => {
    // jwt.sign automatically handles the 'exp' claim using 'expiresIn'
    return jwt.sign(
        { sub: data.sub, user: data.user }, // Payload
        process.env.JWT_SECRET_KEY, 
        { 
            expiresIn: expiresDelta, 
            algorithm: process.env.JWT_ALGORITHM || 'HS256' 
        }
    );
};

module.exports = { getPasswordHash, verifyPassword, createAccessToken };