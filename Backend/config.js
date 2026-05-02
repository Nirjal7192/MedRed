require('dotenv').config();

const settings = {
    HOST_NAME: process.env.HOST_NAME || "localhost",
    USER_NAME: process.env.USER_NAME || "root",
    USER_PASSWORD: process.env.USER_PASSWORD || "password",
    DB_NAME: process.env.DB_NAME || "mydatabase",
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
};   

// Validation to ensure critical keys are present
if (!settings.JWT_SECRET_KEY || !settings.TWILIO_SID) {
    console.error("❌ Missing critical environment variables!");
}

module.exports = settings;