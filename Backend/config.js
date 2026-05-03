require('dotenv').config();

const settings = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/medred', // New MongoDB URI[cite: 16]
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
};

// Ensure MONGODB_URI is validated[cite: 16]
if (!settings.JWT_SECRET_KEY || !settings.MONGODB_URI) {
    console.error("❌ Missing critical environment variables!");
}

module.exports = settings;