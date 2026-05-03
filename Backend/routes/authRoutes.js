const express = require('express');
const { getPasswordHash, verifyPassword, createAccessToken } = require('../utils/authUtils');
const router = express.Router();
const User = require('../models/User'); // Go up to find models
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
// router.post('/login', async (req, res) => { /* logic */ });

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;   
    
    try {
        const user = await User.findOne({ email });   
        if (!user) return res.status(401).json({ detail: "user not found" });   

        const isMatch = await verifyPassword(password, user.password);   
        if (!isMatch) return res.status(401).json({ detail: "incorrect password" });   

        const token = createAccessToken({ sub: user._id, user: { email: user.email, fname: user.fname, lname: user.lname } });   

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
        });   

        res.json({ success: true, message: "Login successful", user: { email: user.email, fname: user.fname, lname: user.lname } });   
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;   
    
    try {
        const existingUser = await User.findOne({ email });   
        if (existingUser) return res.status(400).json({ detail: "Email already registered" });   

        const parts = username.split(" ");   
        const fname = parts[0];
        const lname = parts.slice(1).join(" ") || "";   

        const hashedPassword = await getPasswordHash(password);   
        const newUser = new User({ fname, lname, email, password: hashedPassword });
        const savedUser = await newUser.save();   

        const token = createAccessToken({ sub: savedUser._id, user: { email, fname, lname } });   
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax'
        });   
        res.json({ success: true, message: "Registration successful" });   
    } catch (err) {
        res.status(500).json({ error: err.message });   
    }
});

// ==================== GET CURRENT USER ====================
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.sub).select('-password');
        if (!user) return res.status(404).json({ detail: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== UPDATE USER ====================
router.put('/updateUser', protect, async (req, res) => {   
    const reqData = req.body;
    const userId = req.user.sub;   

    // Validation — only enforce if fields are provided
    if (reqData.mobileNumber && reqData.mobileNumber.replace(/\D/g, '').length !== 10) {
        return res.status(400).json({ detail: "Mobile number must be exactly 10 digits" });   
    }

    let pinCodeInt = undefined;
    if (reqData.pinCode) {
        pinCodeInt = parseInt(reqData.pinCode);   
        if (isNaN(pinCodeInt) || pinCodeInt < 100000 || pinCodeInt > 999999) {
            return res.status(400).json({ detail: "PIN code must be 6 digits" });   
        }
    }

    try {
        const updateData = { ...reqData };
        if (pinCodeInt !== undefined) updateData.pinCode = pinCodeInt;

        // Map flat address fields to nested Mongo structure
        updateData.address = {
            streetAddress: reqData.streetAddress,
            city:          reqData.city,
            state:         reqData.state,
            pinCode:       reqData.pinCode,
            country:       reqData.country
        };

        await User.findByIdAndUpdate(userId, updateData);   
        
        res.json({ success: true, message: "User information updated successfully" });   
    } catch (err) {
        res.status(500).json({ detail: `Failed to update user: ${err.message}` });   
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');   
    res.json({ success: true, message: "Logged out successfully" });   
});

module.exports = router;